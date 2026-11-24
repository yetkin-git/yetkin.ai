import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  TEZGAH_FREE_MONTHLY_CREDITS,
  TEZGAH_GUEST_DAILY_LIMIT,
  TEZGAH_PRO_MONTHLY_CREDITS,
  TEZGAH_ROLLOVER_BPS,
  TEZGAH_ROLLOVER_CAP_BPS,
} from "@/lib/tezgah/catalog";
import {
  tezgahDayKey,
  tezgahMonthKey,
  tezgahPreviousMonthKey,
  tezgahQuotaPeriodKey,
  tezgahRolloverCredits,
} from "@/lib/tezgah/quota";import { summarizeTezgahRollover } from "@/lib/tezgah/credit-rollover";
import { HTTP_RATE_LIMITS } from "@/lib/kernel/security/http-rate-limit";
import {
  isOwnedPaymentOrder,
  type PaymentOrderSnapshot,
} from "@/lib/kernel/payments/clearing";
import {
  singlePurchaseMerchantOid,
} from "@/lib/kernel/payments/single-purchase-checkout";
import {
  GUEST_EMAIL_REGISTERED,
  normalizeGuestEmail,
  parseGuestBilling,
  tezgahGuestMerchantOid,
} from "@/lib/tezgah/guest-checkout";
import {
  CLAIM_TOKEN_ALREADY_USED,
  CLAIM_TOKEN_EXPIRED,
  CLAIM_TOKEN_TTL_MS,
  createClaimToken,
  isClaimTokenShaped,
} from "@/lib/tezgah/guest-claim";
import {
  buildGuestClaimMail,
  buildGuestClaimUrl,
} from "@/lib/tezgah/guest-claim-mail";
import { YETKINCV_PUBLICATION_CTA_LABEL } from "@/components/career/yetkincv-publication-cta";
import {
  YETKINCV_PUBLICATION_BASKET_NAME,
  YETKINCV_PUBLICATION_ORDER_PURPOSE,
  YETKINCV_PUBLICATION_RETURN_DESK,
  YETKINCV_PUBLICATION_UNIT,
} from "@/lib/career/yetkincv-publication";import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";
import { findPublishedHopId } from "@/lib/kernel/http/api-route-census";
import { INNGEST_KERNEL_CRON_FUNCTION_IDS } from "@/lib/kernel/jobs/inngest-guard";
import { CATALOG_OPENABLE_UNITS } from "@/lib/kernel/admin/catalog-write";
import {
  ACADEMY_LICENSE_PURPOSE_PREFIX,
  CAREER_PUBLICATION_PURPOSE,
  evaluateClearedLicenseGaps,
  isClearedLicensePurpose,
} from "@/lib/kernel/payments/license-gap";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function exists(relative: string): boolean {
  return existsSync(join(ROOT, relative));
}

// ─────────────────────────────────────────────────────────────────────────────
// PAKET 1 — Aylık kredi ekonomisi & LLM maliyet kalkanı (S-01 + §4.2)
// ─────────────────────────────────────────────────────────────────────────────

describe("PAKET 1 — aylık kredi havuzu (S-01 / §4.2)", () => {
  it("havuz sabitleri sözleşmeye uyar", () => {
    expect(TEZGAH_FREE_MONTHLY_CREDITS).toBe(30);
    expect(TEZGAH_PRO_MONTHLY_CREDITS).toBe(500);
    // Misafir günlük kalır (IP kovası paylaşılır).
    expect(TEZGAH_GUEST_DAILY_LIMIT).toBe(3);
  });

  it("periyot anahtarı `tezgahQuotaPeriodKey` tek üreticidir", () => {
    const now = new Date("2026-11-22T12:00:00+03:00");
    expect(tezgahQuotaPeriodKey("lite", now, false)).toBe("2026-11");
    expect(tezgahQuotaPeriodKey("lite", now, true)).toBe("2026-11-22");
    expect(tezgahQuotaPeriodKey("tetkik", now, false)).toBe("lifetime");
    expect(tezgahQuotaPeriodKey("tetkik", now, true)).toBe("lifetime");
    // Eski ad korunur (çağıranlar kırılmaz) ve üye hattıyla aynıdır.
    const quota = readSrc("lib/tezgah/quota.ts");
    expect(quota).toContain("export function tezgahQuotaPeriodKey(");
    expect(quota).toContain("export function tezgahQuotaDateKey(");
    // Tablo adı korunur (RLS mührü).
    expect(quota).toContain("tezgahDailyQuota");
    expect(readSrc("prisma/schema/tezgah.prisma")).toContain('@@map("tezgah_daily_quotas")');
  });

  it("İstanbul ay/gün anahtarları sınırda doğru döner", () => {
    // 31 Aralık 23:30 UTC = 1 Ocak 02:30 İstanbul.
    expect(tezgahMonthKey(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01");
    expect(tezgahDayKey(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01-01");
    expect(tezgahPreviousMonthKey(new Date("2027-01-15T12:00:00+03:00"))).toBe("2026-12");
  });

  it("devir %50 ve tavan %50 — tek aylık, zincirleme birikmez", () => {
    expect(TEZGAH_ROLLOVER_BPS).toBe(5_000);
    expect(TEZGAH_ROLLOVER_CAP_BPS).toBe(5_000);
    expect(tezgahRolloverCredits({ baseLimit: 30, previousUsed: 0 })).toBe(15);
    expect(tezgahRolloverCredits({ baseLimit: 30, previousUsed: 10 })).toBe(10);
    expect(tezgahRolloverCredits({ baseLimit: 30, previousUsed: 29 })).toBe(0);
    // Önceki ay satırı yoksa bedava kredi doğmaz.
    expect(tezgahRolloverCredits({ baseLimit: 30, previousUsed: null })).toBe(0);
    // Negatif/saçma girdi devir üretmez.
    expect(tezgahRolloverCredits({ baseLimit: 30, previousUsed: 999 })).toBe(0);
    expect(tezgahRolloverCredits({ baseLimit: 0, previousUsed: 0 })).toBe(0);
  });

  it("cron özeti Pro ve ücretsiz tabanı ayrı ölçer; lite dışını atlar", () => {
    const summary = summarizeTezgahRollover({
      rows: [
        { subjectKey: "u-free", poolKey: "lite", usedCount: 0 },
        { subjectKey: "u-pro", poolKey: "lite", usedCount: 480 },
        { subjectKey: "u-tetkik", poolKey: "tetkik", usedCount: 0 },
      ],
      proSubjectKeys: ["u-pro"],
    });
    // Ücretsiz: 30 - 0 = 30 artık → 15 devir.
    // Pro: 500 - 480 = 20 artık → 10 devir.
    // tetkik ömür boyudur; devir yok, taramaya girmez.
    expect(summary.scannedSubjects).toBe(2);
    expect(summary.rolloverSubjects).toBe(2);
    expect(summary.rolloverCredits).toBe(25);
  });

  it("Inngest cron'u ayın 1'inde 00:05 İstanbul'da koşar", () => {
    const inngest = readSrc("lib/kernel/jobs/inngest.ts");
    expect(inngest).toContain('id: "tezgah-credit-rollover"');
    expect(inngest).toContain('cron: "TZ=Europe/Istanbul 5 0 1 * *"');
    expect(INNGEST_KERNEL_CRON_FUNCTION_IDS).toContain("tezgah-credit-rollover");
    // Kernel dikeyi import etmez; kanca üzerinden bağlanır.
    expect(inngest).toContain("notifyTezgahRolloverHook");
    expect(inngest).not.toContain("@/lib/tezgah");
    // Kanca Inngest serve rotasında kaydedilir.
    expect(readSrc("app/api/(kernel)/jobs/inngest/route.ts")).toContain(
      "registerTezgahRolloverHooks",
    );
  });

  it("S-01 — hız tavanı limiti tanımlı ve üretim rotalarına bağlı", () => {
    expect(HTTP_RATE_LIMITS.tezgahGenerateUser).toMatchObject({
      keyPrefix: "tezgah-generate-user",
      limit: 30,
      windowMs: 10 * 60_000,
    });
    const guard = readSrc("lib/tezgah/generate-guard.ts");
    expect(guard).toContain("tezgahGenerateUser");
    for (const route of [
      "app/api/tezgah/generate/route.ts",
      "app/api/tezgah/grant/generate/route.ts",
      "app/api/tezgah/dukkan/generate/route.ts",
      "app/api/tezgah/reklam/generate/route.ts",
      "app/api/tezgah/pazaryeri/generate/route.ts",
      "app/api/tezgah/tetkik/generate/route.ts",
    ]) {
      const source = readSrc(route);
      expect(source, route).toContain("guardTezgahGenerateRate");
      expect(source, route).toContain("rateLimitedJsonResponse");
    }
  });

  it("kredi dili arayüz ve fiyat sayfasında tek kaynaktan okunur", () => {
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("tezgahToolQuotaLineForLane");
    expect(workbench).toContain("quota.guest");
    const page = readSrc("app/(public)/fiyatlandirma/page.tsx");
    expect(page).toContain("Aylık Tezgâh Kredisi");
    expect(page).toContain("TEZGAH_PRO_MONTHLY_CREDITS");
    expect(page).toContain("TEZGAH_FREE_MONTHLY_CREDITS");
    // Üye satırı "Kalan kredi: N / M" biçimindedir.
    expect(readSrc("lib/tezgah/catalog.ts")).toContain("`Kalan kredi: ${remaining} / ${limit}`");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PAKET 2 — YetkinCV ücretli mühür ve kamuya açık yayın (§4.3)
// ─────────────────────────────────────────────────────────────────────────────

describe("PAKET 2 — YetkinCV ücretli yayın mührü (§4.3)", () => {
  it("şemada `sealedPublication` var; varsayılan false (mühür ücretsiz)", () => {
    const schema = readSrc("prisma/schema/career.prisma");
    expect(schema).toContain("sealedPublication");
    expect(schema).toContain("@map(\"sealed_publication\")");
    expect(schema).toContain("publicationPaidMerchantOid");
    expect(schema).toContain("publishedAt");
    // Varsayılan false: puan ücretsiz, yayın ücretli.
    expect(schema).toMatch(/sealedPublication\s+Boolean\s+@default\(false\)/);

    const migration = readSrc(
      "prisma/migrations/20261122190000_faz3_credit_guest_seal/migration.sql",
    );
    expect(migration).toContain('ADD COLUMN IF NOT EXISTS "sealed_publication"');
    expect(migration).toContain("FORCE ROW LEVEL SECURITY");
    // Göç idempotent olmalı: ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS.
    expect(migration).toContain('ADD COLUMN IF NOT EXISTS "guest_email"');
    expect(migration).toContain("DROP NOT NULL");
  });

  it("ödeme rotası katalog + PayTR + rıza zincirini kurar; auth session", () => {
    expect(ROUTE_AUTH_MAP["/api/career/yetkincv/purchase"]).toBe("session");
    const route = readSrc("app/api/career/yetkincv/purchase/route.ts");
    expect(route).toContain("placeSingleCatalogPurchase");
    expect(route).toContain("checkoutLegalConsentSchema");
    expect(route).toContain("requireRailV1IdempotencyKey");
    expect(route).toContain("YETKINCV_PUBLICATION_ORDER_PURPOSE");
    expect(route).toContain("YETKINCV_PUBLICATION_UNIT");
    // Mühür yoksa satın alma kapalı; zaten yayındaysa ikinci ücret yok.
    expect(route).toContain("publication.hasSeal");
    expect(route).toContain("publication.published");
    // Web-only sicile kayıtlı, hop değil.
    expect(
      WEB_ONLY_WRITE_ROUTES.some(
        (row) => row.method === "POST" && row.path === "/api/career/yetkincv/purchase",
      ),
    ).toBe(true);
    expect(findPublishedHopId("POST", "/api/career/yetkincv/purchase")).toBeNull();
  });

  it("CLEARED kancası yayını açar; purpose sabiti tek yerde", () => {
    expect(YETKINCV_PUBLICATION_ORDER_PURPOSE).toBe("career-license:yetkincv-publication");
    expect(YETKINCV_PUBLICATION_UNIT).toBe("yetkincv-exam");
    expect(YETKINCV_PUBLICATION_BASKET_NAME.length).toBeGreaterThan(0);
    expect(YETKINCV_PUBLICATION_RETURN_DESK).toBe("career");
    const hook = readSrc("lib/career/register-paytr-license-hook.ts");
    expect(hook).toContain("registerCareerLicenseHook");
    expect(hook).toContain("fulfillYetkinCvPublication");
    // Dikey kancası kernel siciline dahil.
    expect(readSrc("app/api/(kernel)/payments/register-paytr-valor-hooks.ts")).toContain(
      "registerPaytrCareerLicenseHook",
    );
    // webhook-settle ve reconcile kancayı çağırır.
    expect(readSrc("lib/kernel/payments/paytr/webhook-settle.ts")).toContain(
      "notifyCareerLicenseHook",
    );
    expect(readSrc("lib/kernel/payments/paytr/reconcile.ts")).toContain("notifyCareerLicenseHook");
  });

  it("`/vize/[hash]` yayın durumuna göre özet ya da tam kart basar", () => {
    const page = readSrc("app/(public)/vize/[id]/page.tsx");
    expect(page).toContain("YetkinCvSummaryCard");
    expect(page).toContain("YetkinCvPublicationCta");
    expect(page).toContain("seal.published");
    expect(page).toContain("ProofShareBar");
    // Özet/tam ayrımı kaynağın kendisinde mühürlü.
    expect(readSrc("lib/career/yetkincv-store.ts")).toContain("published: row.sealedPublication");
    // CTA metni sözleşmede sabit.
    expect(YETKINCV_PUBLICATION_CTA_LABEL).toBe(
      "Kamuya Açık Kariyer Kartını ve Uzman Dizini Görünürlüğünü Aç",
    );
    const cta = readSrc("components/career/yetkincv-publication-cta.tsx");
    expect(cta).toContain("puan satın alınmaz");
    expect(cta).toContain("Sınav, puan, SWOT ve 30/60/90 planı ücretsizdir");
  });

  it("katalog birimi geri açıldı ve vitrin dürüstlüğü korunur", () => {
    expect(
      CATALOG_OPENABLE_UNITS.some(
        (row) => row.moduleKey === "career" && row.unitKey === "yetkincv-exam",
      ),
    ).toBe(true);
    // Yayın birimi lisans boşluğu taramasına da girer (para alındı, mühür açılmadı).
    expect(isClearedLicensePurpose(CAREER_PUBLICATION_PURPOSE)).toBe(true);
    const gap = evaluateClearedLicenseGaps({
      orders: [
        {
          id: "po-career",
          userId: "u-1",
          merchantOid: "oid-career",
          purpose: CAREER_PUBLICATION_PURPOSE,
          amountMinor: 29_000,
        },
      ],
      academySeats: [],
      juniorSeats: [],
      commerceSeats: [],
      careerPublicationSeats: [],
      refundedMerchantOids: [],
    });
    expect(gap.gaps).toHaveLength(1);
    expect(gap.gaps[0]?.product).toBe("career");
    // Yayın açıldıysa sapma yok.
    const ok = evaluateClearedLicenseGaps({
      orders: [
        {
          id: "po-career",
          userId: "u-1",
          merchantOid: "oid-career",
          purpose: CAREER_PUBLICATION_PURPOSE,
          amountMinor: 29_000,
        },
      ],
      academySeats: [],
      juniorSeats: [],
      commerceSeats: [],
      careerPublicationSeats: [{ merchantOid: "oid-career" }],
      refundedMerchantOids: [],
    });
    expect(ok.gaps).toHaveLength(0);
  });

  it("vitrin kartı sınavın ücretsiz olduğunu söyler, tutarı katalogdan okur", () => {
    const source = readSrc("lib/pricing/public-vitrine.ts");
    expect(source).toContain("Puan satın almadan değil test sonucundan oluşur");
    expect(source).toContain("Sınav, puan, SWOT ve 30/60/90 planı ücretsizdir");
    expect(source).toContain('catalog.findActiveEntry("career", "yetkincv-exam")');
    // Katalog yoksa fiyat basılmaz (A1); kart canlı kalır ama uydurma tutar yazmaz.
    expect(source).toContain("PUBLIC_FREE_EVALUATION_LABEL");
    expect(source).toContain('id: "career:yetkincv-exam"');
    // Tutar `null` iken etiket ücretsiz değerlendirmeye düşer.
    expect(source).toContain("yetkinCvPublicationEntry?.isActive");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PAKET 3 — Misafir ödeme ve hesap sahiplenme (§4.1)
// ─────────────────────────────────────────────────────────────────────────────

describe("PAKET 3 — misafir ödeme ve hesap sahiplenme (§4.1)", () => {
  it("şema: payment_orders.userId opsiyonel + guest/claim kolonları", () => {
    const schema = readSrc("prisma/schema/kernel.prisma");
    expect(schema).toMatch(/userId\s+String\?\s+@map\("user_id"\)/);
    expect(schema).toContain("guestEmail");
    expect(schema).toContain("claimToken");
    expect(schema).toContain("@unique @map(\"claim_token\")");
    expect(schema).toContain("guestBillingJson");
    expect(schema).toContain("@@index([guestEmail, createdAt])");
    // RLS: payment_orders FORCE RLS sürekliliği göçte doğrulanır.
    const migration = readSrc(
      "prisma/migrations/20261122190000_faz3_credit_guest_seal/migration.sql",
    );
    expect(migration).toContain('ALTER TABLE "payment_orders"');
    expect(migration).toContain('ALTER COLUMN "user_id" DROP NOT NULL');
    expect(migration).toContain('CREATE UNIQUE INDEX IF NOT EXISTS "payment_orders_claim_token_key"');
    // Kapsamsız deny eklenmez: owner politikası zaten var (NULL satır kimseye görünmez).
    expect(migration).toContain('ALTER TABLE "payment_orders" ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('ALTER TABLE "payment_orders" FORCE ROW LEVEL SECURITY');
  });

  it("misafir checkout rotası public + rate-limit + idempotency", () => {
    expect(ROUTE_AUTH_MAP["/api/tezgah/guest-checkout"]).toBe("public");
    const route = readSrc("app/api/tezgah/guest-checkout/route.ts");
    expect(route).toContain('auth = "public"');
    expect(route).toContain("HTTP_RATE_LIMITS.guestCheckoutIp");
    expect(route).toContain("readIdempotencyKey");
    expect(route).toContain("placeTezgahGuestCheckout");
    // Ödeme öncesi hesap açılmaz: Supabase çağrısı yalnız claim rotasında.
    expect(route).not.toContain("createSupabaseCookieClient");
    expect(route).not.toContain("provisionConfirmedAuthUser");
    // Sahipsiz satır niyeti iş modülündedir (rota yalnız çağırır).
    expect(readSrc("lib/tezgah/guest-checkout.ts")).toContain("userId: null");
    expect(
      WEB_ONLY_WRITE_ROUTES.some(
        (row) => row.method === "POST" && row.path === "/api/tezgah/guest-checkout",
      ),
    ).toBe(true);
    expect(findPublishedHopId("POST", "/api/tezgah/guest-checkout")).toBeNull();
  });

  it("misafir e-posta doğrulaması ve kayıtlı e-posta reddi", () => {
    expect(normalizeGuestEmail("  Ayse@Example.COM ")).toBe("ayse@example.com");
    expect(normalizeGuestEmail("bozuk")).toBeNull();
    expect(normalizeGuestEmail("")).toBeNull();
    expect(GUEST_EMAIL_REGISTERED).toContain("Giriş yapıp");
    // Fatura künyesi olmadan satın alma yok.
    expect(parseGuestBilling(null)).toBeNull();
    expect(parseGuestBilling({ invoiceType: "individual" })).toBeNull();
    expect(
      parseGuestBilling({
        invoiceType: "individual",
        fullName: "Ayşe Kaya",
        tckn: "10000000078",
        phone: "05321234567",
        address: "İnönü Mah. 157 Sk. No:3/C Akhisar",
      }),
    ).toMatchObject({ invoiceType: "individual" });
  });

  it("claim token kriptografik, tek kullanımlık ve 14 gün ömürlü", () => {
    const token = createClaimToken();
    expect(isClaimTokenShaped(token)).toBe(true);
    expect(token).toHaveLength(43);
    // Aynı çağrı ikinci kez aynı token'ı üretmez.
    expect(createClaimToken()).not.toBe(token);
    expect(CLAIM_TOKEN_TTL_MS).toBe(14 * 24 * 60 * 60 * 1000);
    expect(CLAIM_TOKEN_ALREADY_USED).toContain("kullanıldı");
    expect(CLAIM_TOKEN_EXPIRED).toContain("süresi doldu");
    // Biçim bozuk token kaba kuvvet yüzeyini daraltır.
    expect(isClaimTokenShaped("kisa")).toBe(false);
    expect(isClaimTokenShaped(`${token}!`)).toBe(false);
  });

  it("merchantOid deterministik; misafir ve üye evrenleri ayrı", () => {
    const member = singlePurchaseMerchantOid({
      prefix: "SP",
      userId: "u-1",
      moduleKey: "career",
      unitKey: "yetkincv-exam",
      idempotencyKey: "11111111-1111-4111-8111-111111111111",
    });
    expect(member).toBe(
      singlePurchaseMerchantOid({
        prefix: "SP",
        userId: "u-1",
        moduleKey: "career",
        unitKey: "yetkincv-exam",
        idempotencyKey: "11111111-1111-4111-8111-111111111111",
      }),
    );
    const guest = tezgahGuestMerchantOid("ayse@example.com", "22222222-2222-4222-8222-222222222222");
    expect(guest.startsWith("TZG")).toBe(true);
    expect(guest).not.toBe(member);
    expect(guest).toHaveLength(27);
  });

  it("sahipsiz sipariş daraltması: misafir satırı lisans doğurmaz", () => {
    const guest: PaymentOrderSnapshot = {
      id: "po-1",
      userId: null,
      merchantOid: "oid-1",
      amountMinor: 59_000,
      currencyCode: "TRY",
      status: "CLEARED",
      createdAt: new Date("2026-11-22T12:00:00+03:00"),
      purpose: "tezgah-license:pro",
    };
    expect(isOwnedPaymentOrder(guest)).toBe(false);
    const member: PaymentOrderSnapshot = { ...guest, userId: "u-1" };
    expect(isOwnedPaymentOrder(member)).toBe(true);
    // Clearing sahipsiz satırda defter yazmaz; `awaitingClaim` döner.
    const clearing = readSrc("lib/kernel/payments/clearing.ts");
    expect(clearing).toContain("awaitingClaim");
    expect(clearing).toContain("if (order.userId === null)");
    expect(clearing).toContain("Misafir: defter sahipsiz satır yazmaz");
  });

  it("CLEARED webhook'u misafir siparişte claim token üretir ve postalar", () => {
    const settle = readSrc("lib/kernel/payments/paytr/webhook-settle.ts");
    expect(settle).toContain("notifyGuestClaimHook");
    expect(settle).toContain("awaitingClaim");
    const hook = readSrc("lib/tezgah/register-paytr-guest-claim-hook.ts");
    expect(hook).toContain("issueClaimTokenForClearedGuestOrder");
    expect(hook).toContain("deliverGuestClaimMail");
    // Kanca defter yazmaz (defter claim anında yazılır).
    expect(hook).not.toContain("appendLedgerEntry");
    expect(readSrc("app/api/(kernel)/payments/register-paytr-valor-hooks.ts")).toContain(
      "registerPaytrTezgahGuestClaimHook",
    );
  });

  it("claim rotası: hesap → defter → abonelik sırası korunur", () => {
    expect(ROUTE_AUTH_MAP["/api/auth/claim-order"]).toBe("public");
    const route = readSrc("app/api/(kernel)/auth/claim-order/route.ts");
    expect(route).toContain("loadClaimOrder");
    expect(route).toContain("bindGuestOrderToUser");
    expect(route).toContain("HTTP_RATE_LIMITS.claimOrderIp");
    expect(route).toContain("CITIZEN_PASSWORD_MIN_LENGTH");
    expect(route).toContain('next: "/tezgah"');
    // Sıra: token doğrula → signUp → bind (userId + defter + abonelik).
    const loadAt = route.indexOf("await loadClaimOrder(token)");
    const signUpAt = route.indexOf("supabase.auth.signUp");
    const bindAt = route.indexOf("await bindGuestOrderToUser");
    expect(loadAt).toBeGreaterThan(-1);
    expect(signUpAt).toBeGreaterThan(loadAt);
    expect(bindAt).toBeGreaterThan(signUpAt);
    // Defter CREDIT'i bağlamada yazılır; `wallet-top-up:{merchantOid}` anahtarı.
    const bind = readSrc("lib/tezgah/guest-claim-bind.ts");
    expect(bind).toContain("appendLedgerEntry");
    expect(bind).toContain("walletTopUpLedgerIdempotencyKey");
    expect(bind).toContain("fulfillTezgahOrder");
    expect(bind).toContain("claimTokenUsedAt");
    // CAS: yalnız sahipsiz satır bağlanır (iki eşzamanlı claim tek kazanır).
    expect(bind).toContain("where: { id: order.id, userId: null }");
  });

  it("`/claim/[token]` sayfası ve e-posta şablonu dürüst", () => {
    expect(exists("app/(public)/claim/[token]/page.tsx")).toBe(true);
    const page = readSrc("app/(public)/claim/[token]/page.tsx");
    expect(page).toContain("ClaimOrderForm");
    expect(page).toContain("loadClaimOrder");
    expect(page).toContain("robots: { index: false, follow: false }");
    const form = readSrc("components/auth/claim-order-form.tsx");
    expect(form).toContain("CITIZEN_PASSWORD_MIN_LENGTH");
    expect(form).toContain('router.push("/tezgah")');
    expect(form).toContain('"/api/auth/claim-order"');

    const mail = buildGuestClaimMail({
      email: "ayse@example.com",
      claimToken: "a".repeat(43),
      amountMinor: 59_000,
      merchantOid: "TZGABC",
    });
    expect(mail.subject).toContain("Tezgâh Pro");
    expect(mail.text).toContain("14 gün");
    expect(mail.text).toContain("/claim/");
    expect(buildGuestClaimUrl("tok", "https://yetkin.ai")).toBe("https://yetkin.ai/claim/tok");
  });

  it("kota duvarı ve fiyat sayfası kayıtsız Pro seçeneğini sunar", () => {
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("TezgahGuestCheckoutCard");
    const card = readSrc("components/tezgah/guest-checkout-card.tsx");
    expect(card).toContain("Kayıt Olmadan Hemen Pro");
    expect(card).toContain('"/api/tezgah/guest-checkout"');
    // Tutar istemcide sabit değil; sunucudan okunur.
    expect(card).toContain('"/api/tezgah/offers"');
    const page = readSrc("app/(public)/fiyatlandirma/page.tsx");
    expect(page).toContain("TezgahGuestCheckoutCard");
    expect(page).toContain("data-pricing-guest");
  });

  it("claim yolu soft-404 kapısında biçim doğrular", () => {
    const gate = readSrc("lib/academy/public-surface-gate.ts");
    expect(gate).toContain("CLAIM_TOKEN_RE");
    expect(gate).toContain("[A-Za-z0-9_-]{43}");
  });

  it("misafir CLEARED: defter yazılmaz, awaitingClaim true; üye CLEARED defter yazar", async () => {
    const { clearSuccessfulPaymentOrder } = await import("@/lib/kernel/payments/clearing");
    const { createMemoryLedgerStore } = await import("../helpers/memory-money");
    const { createMemoryPaymentOrderStore } = await import("../helpers/memory-payment-orders");

    const guestOrder: PaymentOrderSnapshot = {
      id: "po-guest",
      userId: null,
      merchantOid: "oid-guest",
      amountMinor: 59_000,
      currencyCode: "TRY",
      status: "PENDING",
      createdAt: new Date("2026-11-22T12:00:00+03:00"),
      purpose: "tezgah-license:pro",
    };
    const guestLedger = createMemoryLedgerStore([{ userId: "u-owner", amountMinor: 0 }]);
    const guestCleared = await clearSuccessfulPaymentOrder(
      { ledger: guestLedger, orders: createMemoryPaymentOrderStore(guestOrder) },
      "oid-guest",
    );
    expect(guestCleared.awaitingClaim).toBe(true);
    expect(guestCleared.applied).toBe(false);
    expect(guestCleared.order.status).toBe("CLEARED");
    // Sahipsiz satır cüzdana dokunmaz.
    expect(guestLedger.listEntries()).toHaveLength(0);
    expect(guestLedger.snapshot("u-owner").amountMinor).toBe(0);

    const memberOrder: PaymentOrderSnapshot = { ...guestOrder, id: "po-member", userId: "u-owner", merchantOid: "oid-member" };
    const memberLedger = createMemoryLedgerStore([{ userId: "u-owner", amountMinor: 0 }]);
    const memberCleared = await clearSuccessfulPaymentOrder(
      { ledger: memberLedger, orders: createMemoryPaymentOrderStore(memberOrder) },
      "oid-member",
    );
    expect(memberCleared.awaitingClaim).toBe(false);
    expect(memberCleared.applied).toBe(true);
    expect(memberLedger.snapshot("u-owner").amountMinor).toBe(59_000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PAKET 4 — mühür sürekliliği
// ─────────────────────────────────────────────────────────────────────────────

describe("PAKET 4 — mühür sürekliliği (regresyon bekçisi)", () => {
  it("kernel dikey import etmez (boundary kuralının kaynak kanıtı)", () => {
    // Yeni kernel dosyalarında dikey import yok.
    for (const file of [
      "lib/kernel/payments/single-purchase-checkout.ts",
      "lib/kernel/payments/career-license-hook.ts",
      "lib/kernel/payments/guest-claim-hook.ts",
      "lib/kernel/jobs/tezgah-rollover-hook.ts",
    ]) {
      const source = readSrc(file);
      for (const banned of ["@/lib/tezgah", "@/lib/career", "@/lib/academy", "@/lib/commerce", "@/lib/junior"]) {
        expect(source, `${file} → ${banned}`).not.toContain(banned);
      }
    }
  });

  it("yeni rotalar auth haritalı ve hop sicilinde değil", () => {
    for (const [path, kind] of [
      ["/api/career/yetkincv/purchase", "session"],
      ["/api/tezgah/guest-checkout", "public"],
      ["/api/auth/claim-order", "public"],
      ["/api/career/yetkincv", "session"],
    ] as const) {
      expect(ROUTE_AUTH_MAP[path as keyof typeof ROUTE_AUTH_MAP]).toBe(kind);
    }
    // Hiçbiri v1 hop değil (web-only yazma).
    expect(findPublishedHopId("POST", "/api/career/yetkincv/purchase")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/guest-checkout")).toBeNull();
    expect(findPublishedHopId("POST", "/api/auth/claim-order")).toBeNull();
  });

  it("akademi lisans boşluğu taraması bozulmadı", () => {
    expect(ACADEMY_LICENSE_PURPOSE_PREFIX).toBe("academy-license:");
    const gap = evaluateClearedLicenseGaps({
      orders: [
        {
          id: "po-1",
          userId: "u-1",
          merchantOid: "oid-1",
          purpose: "academy-license:01_office_ai",
          amountMinor: 49_000,
        },
      ],
      academySeats: [],
      juniorSeats: [],
      commerceSeats: [],
      refundedMerchantOids: [],
    });
    expect(gap.gaps).toHaveLength(1);
  });
});
