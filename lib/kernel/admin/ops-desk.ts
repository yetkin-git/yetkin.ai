/**
 * Operasyon konsolu projeksiyonu. Yazma yok. Kimlik maskelenir.
 * Bakmak defteri ve denetim tablosunu değiştirmez.
 */
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinor } from "@/lib/kernel/money/format";
import {
  evaluateClearedLicenseGaps,
  type LicenseGap,
  type LicenseGapSnapshot,
} from "@/lib/kernel/payments/license-gap";
import {
  classifyPaytrPending,
  paytrPendingAgeHours,
  paytrPendingSummary,
  type PaytrPendingRow,
} from "@/scripts/ops-list-paytr-pending-lib";

const REASON_MIN = 8;
const REASON_MAX = 500;
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export const OPS_FREE_AMOUNT_ERROR =
  "Serbest tutar yok. İade sipariş tutarına kilitlidir." as const;
export const OPS_GRANT_CLOSED = "Üretimde sıfır harçlı akademi bağışı kapalıdır." as const;

export type OpsAnomalyRow = {
  kind: string;
  merchantOid: string;
  expectedMinor: number | null;
  reportedMinor: number | null;
  detail: string;
  createdAt: Date;
};

export type OpsAuditRow = {
  action: string;
  target: string;
  detail: string;
  actorUserId: string;
  createdAt: Date;
};

export type OpsReadout = {
  anomalies: readonly OpsAnomalyRow[];
  licenseGapAnomalyCount: number;
  pending: readonly PaytrPendingRow[];
  pendingTotal: number;
  ghostCount: number;
  ghostGrossMinor: number;
  audits: readonly OpsAuditRow[];
};

export type AdminOpsGapRow = {
  merchantOid: string;
  product: LicenseGap["product"];
  reason: LicenseGap["reason"];
  purpose: string;
  amountLabel: string;
  userMasked: string;
};

export type AdminOpsView = {
  gaps: AdminOpsGapRow[] | null;
  gapCount: number | null;
  compensatedCount: number | null;
  clearedLicenseOrders: number | null;
  licenseGapAnomalyCount: number;
  anomalies: Array<{
    kind: string;
    merchantOid: string;
    amounts: string;
    detail: string;
    at: string;
  }>;
  pending: {
    total: number;
    shown: number;
    timedOut: number;
    withinWindow: number;
    oldestHours: number;
    rows: Array<{
      merchantOid: string;
      purpose: string;
      amountLabel: string;
      ageHours: number;
      stale: "within_window" | "timed_out";
      userMasked: string;
    }>;
  };
  ghosts: { count: number; grossLabel: string };
  audits: Array<{ action: string; target: string; detail: string; actorMasked: string; at: string }>;
};

function isPlainRecord(body: unknown): body is Record<string, unknown> {
  return Boolean(body) && typeof body === "object" && !Array.isArray(body);
}

function readReason(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const reason = value.trim();
  if (reason.length < REASON_MIN || reason.length > REASON_MAX) {
    return null;
  }
  return reason;
}

export function maskUserId(id: string): string {
  const trimmed = id.trim();
  if (trimmed.length < 8) {
    return "••••";
  }
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

export function maskIdentityText(value: string): string {
  return value.replace(UUID_RE, (id) => maskUserId(id)).replace(EMAIL_RE, "•••@•••");
}

function formatStamp(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function money(amountMinor: number): string {
  return formatMinor(amountMinor, SETTLEMENT_CURRENCY);
}

export function parseOpsGrantBody(
  body: unknown,
): { userId: string; slug: string; reason: string } | { error: string } {
  if (!isPlainRecord(body)) {
    return { error: "Bağış gövdesi geçersiz." };
  }
  if ("email" in body || "userEmail" in body || "query" in body) {
    return { error: "Bağış e-posta araması değildir. Kullanıcı kimliği ister." };
  }
  const keys = Object.keys(body);
  if (keys.some((key) => key !== "userId" && key !== "slug" && key !== "reason")) {
    return { error: "Bağış gövdesi geçersiz." };
  }
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  if (!isSupabaseUserId(userId)) {
    return { error: "Kullanıcı kimliği geçersiz." };
  }
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!/^[a-z0-9_]{1,80}$/u.test(slug)) {
    return { error: "Kurs kısa adı geçersiz." };
  }
  const reason = readReason(body.reason);
  if (!reason) {
    return { error: "Bağış gerekçesi 8–500 karakter ister." };
  }
  return { userId, slug, reason };
}

export function parseOpsRevokeBody(body: unknown): { hash: string; reason: string } | { error: string } {
  if (!isPlainRecord(body)) {
    return { error: "İptal gövdesi geçersiz." };
  }
  const keys = Object.keys(body);
  if (keys.some((key) => key !== "hash" && key !== "reason")) {
    return { error: "İptal gövdesi geçersiz." };
  }
  const hash = typeof body.hash === "string" ? body.hash.trim().toLowerCase() : "";
  if (!/^[0-9a-f]{64}$/u.test(hash)) {
    return { error: "Sertifika özeti 64 hex ister." };
  }
  const reason = readReason(body.reason);
  if (!reason) {
    return { error: "İptal gerekçesi 8–500 karakter ister." };
  }
  return { hash, reason };
}

export function parseLicenseGapRefundBody(
  body: unknown,
): { merchantOid: string; reason: string } | { error: string } {
  if (!isPlainRecord(body)) {
    return { error: "İade gövdesi geçersiz." };
  }
  if ("amountMinor" in body || "amount" in body || "refundMinor" in body) {
    return { error: OPS_FREE_AMOUNT_ERROR };
  }
  const keys = Object.keys(body);
  if (keys.some((key) => key !== "merchantOid" && key !== "reason")) {
    return { error: "İade gövdesi geçersiz." };
  }
  const merchantOid = typeof body.merchantOid === "string" ? body.merchantOid.trim() : "";
  if (!merchantOid || merchantOid.length > 80) {
    return { error: "Sipariş numarası geçersiz." };
  }
  const reason = readReason(body.reason);
  if (!reason) {
    return { error: "İade gerekçesi 8–500 karakter ister." };
  }
  return { merchantOid, reason };
}

export function selectLicenseGap(gaps: readonly LicenseGap[], merchantOid: string): LicenseGap | null {
  return gaps.find((row) => row.merchantOid === merchantOid) ?? null;
}

export function projectAdminOpsBoard(input: {
  readout: OpsReadout;
  snapshot: LicenseGapSnapshot | null;
  now: Date;
}): AdminOpsView {
  const evaluation = input.snapshot ? evaluateClearedLicenseGaps(input.snapshot) : null;
  const pendingSummary = paytrPendingSummary(input.readout.pending, input.now);
  return {
    gaps: evaluation
      ? evaluation.gaps.map((row) => ({
          merchantOid: row.merchantOid,
          product: row.product,
          reason: row.reason,
          purpose: row.purpose,
          amountLabel: money(row.amountMinor),
          userMasked: maskUserId(row.userId),
        }))
      : null,
    gapCount: evaluation ? evaluation.gaps.length : null,
    compensatedCount: evaluation ? evaluation.compensated.length : null,
    clearedLicenseOrders: input.snapshot ? input.snapshot.orders.length : null,
    licenseGapAnomalyCount: input.readout.licenseGapAnomalyCount,
    anomalies: input.readout.anomalies.map((row) => ({
      kind: row.kind,
      merchantOid: row.merchantOid,
      amounts: `${row.expectedMinor ?? "—"} / ${row.reportedMinor ?? "—"}`,
      detail: maskIdentityText(row.detail),
      at: formatStamp(row.createdAt),
    })),
    pending: {
      total: input.readout.pendingTotal,
      shown: input.readout.pending.length,
      timedOut: pendingSummary.timedOut,
      withinWindow: pendingSummary.withinWindow,
      oldestHours: pendingSummary.oldestHours,
      rows: input.readout.pending.map((row) => ({
        merchantOid: row.merchantOid,
        purpose: row.purpose,
        amountLabel: money(row.amountMinor),
        ageHours: paytrPendingAgeHours(row.createdAt, input.now),
        stale: classifyPaytrPending(row.createdAt, input.now),
        userMasked: maskUserId(row.userId),
      })),
    },
    ghosts: {
      count: input.readout.ghostCount,
      grossLabel: money(input.readout.ghostGrossMinor),
    },
    audits: input.readout.audits.map((row) => ({
      action: row.action,
      target: maskIdentityText(row.target),
      detail: maskIdentityText(row.detail),
      actorMasked: maskUserId(row.actorUserId),
      at: formatStamp(row.createdAt),
    })),
  };
}
