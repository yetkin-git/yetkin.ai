import { NextResponse } from "next/server";
import { REQUEST_ID_HEADER } from "@/lib/kernel/http/request-id";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import { Inngest } from "inngest";
import {
  paytrClearingScanNoOpResult,
  paytrClearingScanResult,
  paytrFailedRecoveryAfter,
  selectPaytrClearingCandidates,
  shouldNoOpPaytrClearingScan,
} from "@/lib/kernel/jobs/paytr-clearing-scan";
import { runEscrowTimeoutRefunds } from "@/lib/kernel/jobs/escrow-timeout-scan";

/** HTTP + Inngest Cloud — S18-A: PayTR valör + emanet timeout. Arena olayı sicilde yoktur. */
export const inngest = new Inngest({ id: "yetkin-rail" });

export const INNGEST_EVENTS = {
  PAYTR_CLEARING_REQUESTED: "payments/paytr.clearing-requested",
  ESCROW_TIMEOUT_REQUESTED: "escrow/timeout-requested",
  ESCROW_REFUNDED: "escrow/refunded",
  ESCROW_TTL_APPROACHING: "escrow/ttl-approaching",
  ACADEMY_RECEIPT_REQUESTED: "academy/receipt-requested",
  TRENDYOL_STOCK_PUSH_REQUESTED: "commerce/trendyol.stock-push-requested",
  HEPSIBURADA_STOCK_PUSH_REQUESTED: "commerce/hepsiburada.stock-push-requested",
} as const;

export const paytrClearingScan = inngest.createFunction(
  {
    id: "paytr-clearing-scan",
    name: "PayTR valör tarama",
    triggers: [{ cron: "TZ=Europe/Istanbul */30 * * * *" }],
  },
  async ({ step }) => {
    // Port kapalıyken DB tarama yok (0 hit); sahte PENDING avı ve Cloud hop gürültüsü yok.
    if (shouldNoOpPaytrClearingScan()) {
      const { logEvent } = await import("@/lib/kernel/observability/log");
      const noop = paytrClearingScanNoOpResult();
      logEvent({
        level: "info",
        event: "paytr.clearing.scan.noop",
        reason: noop.reason,
        applied: false,
      });
      return noop;
    }
    const pending = await step.run("scan-pending-paytr-clearing", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return [] as { merchantOid: string }[];
      }
      const { getPrisma } = await import("@/lib/kernel/db");
      const prisma = getPrisma();
      const rows = await prisma.paymentOrder.findMany({
        where: {
          OR: [
            { status: { in: ["PENDING", "PAID"] } },
            { status: "FAILED", updatedAt: { gte: paytrFailedRecoveryAfter(new Date()) } },
          ],
        },
        take: 50,
        orderBy: { createdAt: "asc" },
        select: { merchantOid: true },
      });
      return selectPaytrClearingCandidates(rows);
    });
    // Adaylar kör CREDIT edilmez; paytrClearingSingle PSP durum sorgusu + markFailed.
    if (pending.length === 0) {
      return paytrClearingScanResult(pending);
    }
    await step.sendEvent(
      "dispatch-paytr-clearing-events",
      pending.map((row) => ({
        name: INNGEST_EVENTS.PAYTR_CLEARING_REQUESTED,
        id: `paytr-clearing:${row.merchantOid}`,
        data: { merchantOid: row.merchantOid },
      })),
    );
    return paytrClearingScanResult(pending);
  },
);

export const paytrClearingSingle = inngest.createFunction(
  {
    id: "paytr-clearing-single",
    name: "PayTR valör tekil",
    idempotency: "event.data.merchantOid",
    triggers: [{ event: INNGEST_EVENTS.PAYTR_CLEARING_REQUESTED }],
  },
  async ({ event, step }) => {
    const merchantOid = String(
      (event.data as { merchantOid?: string }).merchantOid ?? "",
    ).trim();
    if (!merchantOid) {
      return { skipped: true };
    }
    if (shouldNoOpPaytrClearingScan()) {
      const { logEvent } = await import("@/lib/kernel/observability/log");
      const noop = paytrClearingScanNoOpResult();
      logEvent({
        level: "info",
        event: "paytr.clearing.single.noop",
        requestId:
          typeof (event.data as { requestId?: string }).requestId === "string"
            ? (event.data as { requestId: string }).requestId
            : event.id,
        merchantOid,
        reason: noop.reason,
        applied: false,
      });
      return { skipped: true, ...noop };
    }
    return step.run("reconcile-payment-order", async () => {
      const { createPrismaClearingPorts } = await import(
        "@/lib/kernel/payments/prisma-order-store"
      );
      const { createPrismaPaymentAnomalyStore } = await import(
        "@/lib/kernel/payments/prisma-anomaly-store"
      );
      const { reconcilePaytrPaymentOrder } = await import(
        "@/lib/kernel/payments/paytr/reconcile"
      );
      const { logEvent } = await import("@/lib/kernel/observability/log");
      const requestId =
        typeof (event.data as { requestId?: string }).requestId === "string"
          ? (event.data as { requestId: string }).requestId
          : event.id;
      try {
        const result = await reconcilePaytrPaymentOrder(
          {
            ...createPrismaClearingPorts(),
            anomalies: createPrismaPaymentAnomalyStore(),
          },
          merchantOid,
        );
        logEvent({
          level: "info",
          event: "paytr.reconcile",
          requestId,
          merchantOid,
          orderId: result.orderId ?? undefined,
          action: result.action,
          applied: result.applied,
          reason: result.reason,
        });
        return {
          action: result.action,
          applied: result.applied,
          reason: result.reason,
          orderId: result.orderId,
        };
      } catch (error) {
        logEvent({
          level: "error",
          event: "paytr.reconcile.failed",
          requestId,
          merchantOid,
          errorName: error instanceof Error ? error.name : "unknown",
        });
        throw error;
      }
    });
  },
);

export const ledgerReconciliationScan = inngest.createFunction(
  {
    id: "ledger-reconciliation-scan",
    name: "Defter mutabakat tarama",
    triggers: [{ cron: "TZ=Europe/Istanbul 20 2 * * *" }],
  },
  async ({ step }) => {
    return step.run("scan-wallet-ledger-invariants", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return {
          walletsScanned: 0,
          clearedOrdersScanned: 0,
          walletDrifts: 0,
          clearedOrderDrifts: 0,
          anomaliesWritten: 0,
        };
      }
      const { createPrismaLedgerReconciliationPorts } = await import(
        "@/lib/kernel/payments/prisma-reconciliation-ports"
      );
      const { runLedgerReconciliationScan } = await import(
        "@/lib/kernel/payments/ledger-reconciliation"
      );
      const { logEvent } = await import("@/lib/kernel/observability/log");
      const result = await runLedgerReconciliationScan(
        createPrismaLedgerReconciliationPorts(),
        "ledger-reconciliation-cron",
      );
      logEvent({
        level: result.walletDrifts > 0 || result.clearedOrderDrifts > 0 ? "error" : "info",
        event: "ledger.reconciliation.scan",
        requestId: "ledger-reconciliation-cron",
        reason:
          result.walletDrifts > 0 || result.clearedOrderDrifts > 0 ? "drift" : "balanced",
        applied: false,
      });
      return result;
    });
  },
);

export const escrowTimeoutScan = inngest.createFunction(
  {
    id: "escrow-timeout-scan",
    name: "Emanet zaman aşımı tarama",
    triggers: [{ cron: "TZ=Europe/Istanbul 0 */6 * * *" }],
  },
  async ({ step }) => {
    const scanned = await step.run("refund-expired-holds", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return { refunded: 0, frozen: 0, refundedHolds: [] as { holdId: string; referenceKey: string }[] };
      }
      const { getPrisma } = await import("@/lib/kernel/db");
      const { bindEscrowStore } = await import("@/lib/kernel/escrow/prisma-store");
      const { bindLedgerStore } = await import("@/lib/kernel/ledger/prisma-store");
      const prisma = getPrisma();
      return runEscrowTimeoutRefunds({
        escrow: bindEscrowStore(prisma),
        ledger: bindLedgerStore(prisma),
        runEscrowAtomic: (work) =>
          prisma.$transaction((tx) =>
            work({
              ledger: bindLedgerStore(tx),
              escrow: bindEscrowStore(tx),
            }),
          ),
      });
    });
    if (scanned.refundedHolds.length === 0) {
      return { refunded: scanned.refunded, frozen: scanned.frozen };
    }
    await step.sendEvent(
      "dispatch-escrow-refunded-events",
      scanned.refundedHolds.map((row) => ({
        name: INNGEST_EVENTS.ESCROW_REFUNDED,
        id: `escrow-refunded:${row.holdId}`,
        data: { holdId: row.holdId, referenceKey: row.referenceKey },
      })),
    );
    return { refunded: scanned.refunded, frozen: scanned.frozen };
  },
);

export const escrowRefundedNotify = inngest.createFunction(
  {
    id: "escrow-refunded-notify",
    name: "Emanet iade dikey kanca",
    idempotency: "event.data.holdId",
    triggers: [{ event: INNGEST_EVENTS.ESCROW_REFUNDED }],
  },
  async ({ event, step }) => {
    const holdId = String((event.data as { holdId?: string }).holdId ?? "").trim();
    if (!holdId) {
      return { skipped: true };
    }
    return step.run("notify-vertical-hooks", async () => {
      const { notifyEscrowRefunded } = await import("@/lib/kernel/escrow/refund-hooks");
      await notifyEscrowRefunded(holdId);
      return { holdId };
    });
  },
);

export const escrowTtlApproachingScan = inngest.createFunction(
  {
    id: "escrow-ttl-approaching-scan",
    name: "Emanet TTL yaklaşım tarama",
    triggers: [{ cron: "TZ=Europe/Istanbul 0 */6 * * *" }],
  },
  async ({ step }) => {
    const scanned = await step.run("scan-ttl-approaching-holds", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return { warned: 0, holds: [] as { holdId: string; referenceKey: string }[] };
      }
      const { createPrismaEscrowStore } = await import("@/lib/kernel/escrow/prisma-store");
      const { selectEscrowTtlApproachingHolds, escrowTtlWarnScanResult } = await import(
        "@/lib/kernel/jobs/escrow-ttl-warn"
      );
      const holds = await selectEscrowTtlApproachingHolds({
        escrow: createPrismaEscrowStore(),
      });
      return escrowTtlWarnScanResult(holds);
    });
    if (scanned.holds.length === 0) {
      return { warned: scanned.warned };
    }
    await step.sendEvent(
      "dispatch-escrow-ttl-approaching-events",
      scanned.holds.map((row) => ({
        name: INNGEST_EVENTS.ESCROW_TTL_APPROACHING,
        id: `escrow-ttl-warn:${row.holdId}`,
        data: { holdId: row.holdId, referenceKey: row.referenceKey },
      })),
    );
    return { warned: scanned.warned };
  },
);

export const escrowTtlApproachingNotify = inngest.createFunction(
  {
    id: "escrow-ttl-approaching-notify",
    name: "Emanet TTL yaklaşım bildirimi",
    idempotency: "event.data.holdId",
    triggers: [{ event: INNGEST_EVENTS.ESCROW_TTL_APPROACHING }],
  },
  async ({ event, step }) => {
    const holdId = String((event.data as { holdId?: string }).holdId ?? "").trim();
    if (!holdId) {
      return { skipped: true };
    }
    return step.run("notify-ttl-vertical-hooks", async () => {
      const { createPrismaEscrowStore } = await import("@/lib/kernel/escrow/prisma-store");
      const { applyEscrowTtlApproachingNotice } = await import(
        "@/lib/kernel/jobs/escrow-ttl-warn"
      );
      const result = await applyEscrowTtlApproachingNotice(
        { escrow: createPrismaEscrowStore() },
        holdId,
      );
      return { holdId, applied: result.applied };
    });
  },
);

/**
 * Akademi satın alma makbuzu (TESPIT E5) — satın alma rotası kuyruğa atar,
 * SMTP burada konuşur. Event payload'u kendi kendine yeterli: akademi store
 * okunmaz (kernel↛dikey sınırı). purchaseId idempotency anahtarıdır.
 * SMTP taşıma hatası throw eder → Inngest retry; geçersiz/eksik veri skipped.
 */
export const academyReceiptSend = inngest.createFunction(
  {
    id: "academy-receipt-send",
    name: "Akademi makbuz gönderimi",
    idempotency: "event.data.purchaseId",
    triggers: [{ event: INNGEST_EVENTS.ACADEMY_RECEIPT_REQUESTED }],
  },
  async ({ event, step }) => {
    return step.run("send-academy-receipt", async () => {
      const { deliverAcademyReceiptMail } = await import(
        "@/lib/kernel/notice/academy-receipt-mail"
      );
      const data = event.data as {
        purchaseId?: unknown;
        userId?: unknown;
        courseTitle?: unknown;
        courseSlug?: unknown;
        amountMinor?: unknown;
        currencyCode?: unknown;
        settledAt?: unknown;
        receiptName?: unknown;
        requestId?: unknown;
      };
      const purchaseId = typeof data.purchaseId === "string" ? data.purchaseId : "";
      const status = await deliverAcademyReceiptMail({
        purchaseId,
        userId: typeof data.userId === "string" ? data.userId : "",
        courseTitle: typeof data.courseTitle === "string" ? data.courseTitle : "",
        courseSlug: typeof data.courseSlug === "string" ? data.courseSlug : "",
        amountMinor: typeof data.amountMinor === "number" ? data.amountMinor : NaN,
        currencyCode: (
          typeof data.currencyCode === "string" ? data.currencyCode : ""
        ) as CurrencyCode,
        settledAt: typeof data.settledAt === "string" ? data.settledAt : "",
        receiptName: typeof data.receiptName === "string" ? data.receiptName : "",
        requestId: typeof data.requestId === "string" ? data.requestId : event.id,
      });
      return { purchaseId, status };
    });
  },
);

export const trendyolStockPush = inngest.createFunction(
  {
    id: "trendyol-stock-push",
    name: "Trendyol stok itme",
    retries: 4,
    triggers: [{ event: INNGEST_EVENTS.TRENDYOL_STOCK_PUSH_REQUESTED }],
    onFailure: async ({ event, error }) => {
      const data = event.data as {
        event?: { data?: { listingId?: unknown; onHandAfter?: unknown; amountMinor?: unknown } };
      };
      const original = data.event?.data;
      const listingId = typeof original?.listingId === "string" ? original.listingId : "";
      const onHandAfter = typeof original?.onHandAfter === "number" ? original.onHandAfter : NaN;
      const amountMinor = typeof original?.amountMinor === "number" ? original.amountMinor : NaN;
      const message = error instanceof Error ? error.message : "Trendyol stok itme başarısız.";
      const { markTrendyolListingFailed } = await import("@/lib/commerce/trendyol-sync");
      const { liveTrendyolPorts } = await import("@/lib/commerce/trendyol-live");
      await markTrendyolListingFailed(liveTrendyolPorts(), { listingId, onHandAfter, amountMinor, message });
    },
  },
  async ({ event, step }) => {
    const data = event.data as {
      listingId?: unknown;
      storeId?: unknown;
      onHandAfter?: unknown;
      amountMinor?: unknown;
    };
    return step.run("push-trendyol-stock", async () => {
      const { pushTrendyolListingStock } = await import("@/lib/commerce/trendyol-sync");
      const { liveTrendyolPorts } = await import("@/lib/commerce/trendyol-live");
      return pushTrendyolListingStock(liveTrendyolPorts(), {
        listingId: typeof data.listingId === "string" ? data.listingId : "",
        storeId: typeof data.storeId === "string" ? data.storeId : "",
        onHandAfter: typeof data.onHandAfter === "number" ? data.onHandAfter : NaN,
        amountMinor: typeof data.amountMinor === "number" ? data.amountMinor : NaN,
      });
    });
  },
);

export const trendyolOrderPull = inngest.createFunction(
  {
    id: "trendyol-order-pull",
    name: "Trendyol sipariş çekme",
    triggers: [{ cron: "TZ=Europe/Istanbul */30 * * * *" }],
  },
  async ({ step }) => {
    return step.run("pull-trendyol-orders", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return { stores: 0, lines: 0, stockShort: 0 };
      }
      const { pullTrendyolOrders } = await import("@/lib/commerce/trendyol-sync");
      const { liveTrendyolPorts } = await import("@/lib/commerce/trendyol-live");
      return pullTrendyolOrders(liveTrendyolPorts());
    });
  },
);

export const hepsiburadaStockPush = inngest.createFunction(
  {
    id: "hepsiburada-stock-push",
    name: "Hepsiburada stok itme",
    retries: 4,
    triggers: [{ event: INNGEST_EVENTS.HEPSIBURADA_STOCK_PUSH_REQUESTED }],
    onFailure: async ({ event, error }) => {
      const data = event.data as {
        event?: { data?: { listingId?: unknown; onHandAfter?: unknown; amountMinor?: unknown } };
      };
      const original = data.event?.data;
      const listingId = typeof original?.listingId === "string" ? original.listingId : "";
      const onHandAfter = typeof original?.onHandAfter === "number" ? original.onHandAfter : NaN;
      const amountMinor = typeof original?.amountMinor === "number" ? original.amountMinor : NaN;
      const message = error instanceof Error ? error.message : "Hepsiburada stok itme başarısız.";
      const { markHepsiburadaListingFailed } = await import("@/lib/commerce/hepsiburada-sync");
      const { liveHepsiburadaPorts } = await import("@/lib/commerce/hepsiburada-live");
      await markHepsiburadaListingFailed(liveHepsiburadaPorts(), { listingId, onHandAfter, amountMinor, message });
    },
  },
  async ({ event, step }) => {
    const data = event.data as {
      listingId?: unknown;
      storeId?: unknown;
      onHandAfter?: unknown;
      amountMinor?: unknown;
    };
    return step.run("push-hepsiburada-stock", async () => {
      const { pushHepsiburadaListingStock } = await import("@/lib/commerce/hepsiburada-sync");
      const { liveHepsiburadaPorts } = await import("@/lib/commerce/hepsiburada-live");
      return pushHepsiburadaListingStock(liveHepsiburadaPorts(), {
        listingId: typeof data.listingId === "string" ? data.listingId : "",
        storeId: typeof data.storeId === "string" ? data.storeId : "",
        onHandAfter: typeof data.onHandAfter === "number" ? data.onHandAfter : NaN,
        amountMinor: typeof data.amountMinor === "number" ? data.amountMinor : NaN,
      });
    });
  },
);

export const hepsiburadaOrderPull = inngest.createFunction(
  {
    id: "hepsiburada-order-pull",
    name: "Hepsiburada sipariş çekme",
    triggers: [{ cron: "TZ=Europe/Istanbul */30 * * * *" }],
  },
  async ({ step }) => {
    return step.run("pull-hepsiburada-orders", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return { stores: 0, lines: 0, stockShort: 0 };
      }
      const { pullHepsiburadaOrders } = await import("@/lib/commerce/hepsiburada-sync");
      const { liveHepsiburadaPorts } = await import("@/lib/commerce/hepsiburada-live");
      return pullHepsiburadaOrders(liveHepsiburadaPorts());
    });
  },
);

export const commerceSubscriptionRenewal = inngest.createFunction(
  {
    id: "commerce-subscription-renewal",
    name: "Commerce lisans yenileme",
    triggers: [{ cron: "TZ=Europe/Istanbul 15 4 * * *" }],
  },
  async ({ step }) => {
    return step.run("renew-commerce-subscriptions", async () => {
      const { runCommerceSubscriptionRenewalScan } = await import("@/lib/commerce/subscription-renewal");
      return runCommerceSubscriptionRenewalScan();
    });
  },
);

/** Her 15 dakika — PENDING pazaryeri ilanlarını fiyat ve stokla eşitler. */
export const commercePendingListingSync = inngest.createFunction(
  {
    id: "commerce-pending-listing-sync",
    name: "Pazaryeri ilan eşitleme",
    triggers: [{ cron: "TZ=Europe/Istanbul */15 * * * *" }],
  },
  async ({ step }) => {
    return step.run("sync-pending-channel-listings", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return { scanned: 0, synced: 0, pending: 0, failed: 0 };
      }
      const { runPendingChannelListingSync } = await import("@/lib/commerce/pending-listing-sync");
      return runPendingChannelListingSync();
    });
  },
);

/** Her saat başı 20. dakika — kanal fiyatını son rakip beslemesine göre mühürler. */
export const commerceRepricerSweep = inngest.createFunction(
  {
    id: "commerce-repricer-sweep",
    name: "Kanal fiyat rekabet taraması",
    triggers: [{ cron: "TZ=Europe/Istanbul 20 * * * *" }],
  },
  async ({ step }) => {
    return step.run("sweep-channel-repricer", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return { scanned: 0, applied: 0, alerts: 0 };
      }
      const { runRepricerSweep } = await import("@/lib/commerce/repricer-service");
      return runRepricerSweep();
    });
  },
);

/** Sabah 07:00 Europe/Istanbul — zarar kalkanı ve günlük kâr özeti. */
export const commerceDailyBrief = inngest.createFunction(
  {
    id: "commerce-daily-brief",
    name: "Commerce günlük kâr özeti",
    triggers: [{ cron: "TZ=Europe/Istanbul 0 7 * * *" }],
  },
  async ({ step }) => {
    return step.run("build-commerce-daily-briefs", async () => {
      const { runCommerceDailyBriefScan } = await import("@/lib/commerce/daily-brief");
      return runCommerceDailyBriefScan();
    });
  },
);

export const weeklyOpportunityRadar = inngest.createFunction(
  {
    id: "weekly-opportunity-radar",
    name: "Haftalık fırsat radarı",
    triggers: [{ cron: "TZ=Europe/Istanbul 0 9 * * 1" }],
  },
  async ({ step }) => {
    return step.run("send-weekly-radar", async () => {
      const { runWeeklyOpportunityRadar } = await import("@/lib/jobs/weekly-radar");
      return runWeeklyOpportunityRadar();
    });
  },
);

/**
 * Faz 3 / S-01 — aylık kredi devri (her ayın 1'i 00:05 Europe/Istanbul).
 *
 * Devir **okuma anında** deterministik hesaplanır (`lib/tezgah/quota.ts` →
 * `tezgahRolloverCredits`); bu iş ikinci bakiye yazmaz, `tezgah_daily_quotas`
 * satırına kredi eklemez (aksi hâlde devir iki kez sayılırdı). Yalnız ölçüm,
 * sıfır kullanımlı satır temizliği ve doygunluk alarmı yapar.
 *
 * Kernel dikeyi import etmez: gerçek tarama `tezgah-rollover-hook` üzerinden
 * `lib/tezgah/credit-rollover` içindedir. Kanca bağlı değilse no-op döner.
 */
export const tezgahCreditRollover = inngest.createFunction(
  {
    id: "tezgah-credit-rollover",
    name: "Tezgâh aylık kredi devri",
    triggers: [{ cron: "TZ=Europe/Istanbul 5 0 1 * *" }],
  },
  async ({ step }) => {
    return step.run("measure-credit-rollover", async () => {
      const { notifyTezgahRolloverHook } = await import("@/lib/kernel/jobs/tezgah-rollover-hook");
      const result = await notifyTezgahRolloverHook();
      if (!result) {
        const { logEvent } = await import("@/lib/kernel/observability/log");
        logEvent({
          level: "info",
          event: "tezgah.credit.rollover.noop",
          reason: "hook_unregistered",
          applied: false,
        });
        return { skipped: true, reason: "hook_unregistered" };
      }
      return result;
    });
  },
);

/** Pazartesi 08:00 — süresi dolan ve 30 günden eski doğrulanan çağrı uyarısı. */
export const grantCatalogVerify = inngest.createFunction(
  {
    id: "grant-catalog-verify",
    name: "Hibe katalog doğrulama",
    triggers: [{ cron: "TZ=Europe/Istanbul 0 8 * * 1" }],
  },
  async ({ step }) => {
    return step.run("verify-grant-catalog", async () => {
      const { notifyGrantCatalogVerifyHook } = await import("@/lib/kernel/jobs/grant-maintenance-hook");
      const result = await notifyGrantCatalogVerifyHook();
      if (!result) {
        return { skipped: true, reason: "hook_unregistered" };
      }
      return result;
    });
  },
);

/** Her gün 08:30 — başvuru son tarihi 7, 3 ve 1 gün kala. */
export const hibeLifecycleReminders = inngest.createFunction(
  {
    id: "hibe-lifecycle-reminders",
    name: "Hibe yaşam döngüsü hatırlatması",
    triggers: [{ cron: "TZ=Europe/Istanbul 30 8 * * *" }],
  },
  async ({ step }) => {
    return step.run("remind-hibe-deadlines", async () => {
      const { notifyHibeLifecycleReminderHook } = await import("@/lib/kernel/jobs/grant-maintenance-hook");
      const result = await notifyHibeLifecycleReminderHook();
      if (!result) {
        return { skipped: true, reason: "hook_unregistered" };
      }
      return result;
    });
  },
);

/** 15 dakikada bir — süresi dolmuş hibe dosyası rezervini FAILED yapar. */
export const grantReservationSweep = inngest.createFunction(
  {
    id: "grant-reservation-ttl",
    name: "Hibe dosya rezervi süpürücü",
    triggers: [{ cron: "TZ=Europe/Istanbul */15 * * * *" }],
  },
  async ({ step }) => {
    return step.run("expire-grant-reservations", async () => {
      const { notifyGrantReservationSweepHook } = await import("@/lib/kernel/jobs/grant-maintenance-hook");
      const result = await notifyGrantReservationSweepHook();
      if (!result) {
        return { skipped: true, reason: "hook_unregistered" };
      }
      return result;
    });
  },
);

/**
 * Her gün 03:40 — 90 günden eski anonim `tetkik_reports` satırlarını siler.
 * Kernel dikeyi import etmez; gerçek silme `tetkik-cleanup-hook` üzerindedir.
 */
export const tetkikReportsCleanup = inngest.createFunction(
  {
    id: "tetkik-reports-cleanup",
    name: "Tetkik anonim rapor TTL temizliği",
    triggers: [{ cron: "TZ=Europe/Istanbul 40 3 * * *" }],
  },
  async ({ step }) => {
    return step.run("purge-expired-tetkik-reports", async () => {
      const { notifyTetkikReportsCleanupHook } = await import("@/lib/kernel/jobs/tetkik-cleanup-hook");
      const result = await notifyTetkikReportsCleanupHook();
      if (!result) {
        const { logEvent } = await import("@/lib/kernel/observability/log");
        logEvent({
          level: "info",
          event: "tetkik.reports.cleanup.noop",
          reason: "hook_unregistered",
        });
        return { skipped: true, reason: "hook_unregistered" };
      }
      return result;
    });
  },
);

/**
 * Her gün 04:10 — süresi 90 günü geçmiş kurumsal ilan başvurularını anonimleştirir (F1.6).
 * PII sabitleri `lib/sales/kurumsal-retention.ts` içindedir; puan/band satırı bozulmaz.
 */
export const kurumsalApplicationRetention = inngest.createFunction(
  {
    id: "kurumsal-application-retention",
    name: "Kurumsal başvuru 90 gün anonimleştirme",
    triggers: [{ cron: "TZ=Europe/Istanbul 10 4 * * *" }],
  },
  async ({ step }) => {
    return step.run("anonymize-expired-kurumsal-applications", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return { skipped: true, reason: "database_unconfigured" };
      }
      const { anonymizeExpiredKurumsalApplications } = await import(
        "@/lib/sales/kurumsal-retention"
      );
      return anonymizeExpiredKurumsalApplications();
    });
  },
);

export const kernelInngestFunctions = [
  paytrClearingScan,
  paytrClearingSingle,
  ledgerReconciliationScan,
  escrowTimeoutScan,
  escrowRefundedNotify,
  escrowTtlApproachingScan,
  escrowTtlApproachingNotify,
  academyReceiptSend,
  trendyolStockPush,
  trendyolOrderPull,
  hepsiburadaStockPush,
  hepsiburadaOrderPull,
  commerceSubscriptionRenewal,
  commercePendingListingSync,
  commerceRepricerSweep,
  commerceDailyBrief,
  weeklyOpportunityRadar,
  tezgahCreditRollover,
  grantCatalogVerify,
  grantReservationSweep,
  hibeLifecycleReminders,
  tetkikReportsCleanup,
  kurumsalApplicationRetention,
];

export function inngestNotConfiguredResponse(requestId?: string) {
  return NextResponse.json(
    {
      ok: false,
      error: "Inngest Cloud anahtarları tanımlı değil. Yerel duman için INNGEST_DEV=1.",
      ...(requestId ? { requestId } : {}),
    },
    {
      status: 503,
      headers: requestId ? { [REQUEST_ID_HEADER]: requestId } : undefined,
    },
  );
}
