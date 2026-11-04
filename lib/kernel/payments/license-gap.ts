/**
 * CLEARED lisans siparişi ↔ açılmış lisans.
 * Akademi `academy_purchases`, Junior `junior_subscriptions`.
 * Kernel dikey odayı import etmez; satırlar çağırandan gelir.
 * Sapma cüzdanı düzeltmez ve CREDIT yazmaz.
 */

import { logEvent } from "@/lib/kernel/observability/log";
import {
  recordPaymentAnomaly,
  type PaymentAnomalyStore,
} from "@/lib/kernel/payments/anomaly";

/** PayTR akademi kasası. Düz `wallet-top-up` lisans açmaz. */
export const ACADEMY_LICENSE_PURPOSE_PREFIX = "academy-license:" as const;

/** PayTR Junior yıllık paket. */
export const JUNIOR_LICENSE_PURPOSE = "junior-license:yearly" as const;

export type LicenseGapProduct = "academy" | "junior";

export type LicenseGapReason =
  | "missing_purchase"
  | "unparsed_purpose"
  | "missing_subscription"
  | "subscription_inactive";

export type LicenseGapOrder = {
  id: string;
  userId: string;
  merchantOid: string;
  purpose: string;
  amountMinor: number;
};

export type AcademyLicenseSeat = {
  userId: string;
  courseSlug: string;
};

export type JuniorLicenseSeat = {
  userId: string;
  status: string;
  appliedMerchantOids: readonly string[];
};

export type LicenseGapSnapshot = {
  orders: readonly LicenseGapOrder[];
  academySeats: readonly AcademyLicenseSeat[];
  juniorSeats: readonly JuniorLicenseSeat[];
  /** SUCCEEDED kart iadesi. Lisans yok ama para geri dönmüşse alarm sayılmaz. */
  refundedMerchantOids: readonly string[];
};

export type LicenseGap = {
  merchantOid: string;
  orderId: string;
  userId: string;
  purpose: string;
  amountMinor: number;
  product: LicenseGapProduct;
  reason: LicenseGapReason;
};

export type LicenseGapEvaluation = {
  gaps: LicenseGap[];
  compensated: LicenseGap[];
};

export type LicenseGapPorts = {
  loadSnapshot(): Promise<LicenseGapSnapshot>;
  anomalies: PaymentAnomalyStore;
};

export type LicenseGapScanResult = {
  clearedLicenseOrders: number;
  gaps: number;
  compensated: number;
  anomaliesWritten: number;
};

export function isClearedLicensePurpose(purpose: string): boolean {
  return (
    purpose.startsWith(ACADEMY_LICENSE_PURPOSE_PREFIX) || purpose === JUNIOR_LICENSE_PURPOSE
  );
}

export function academyLicenseSlugFromPurpose(purpose: string): string | null {
  if (!purpose.startsWith(ACADEMY_LICENSE_PURPOSE_PREFIX)) {
    return null;
  }
  const slug = purpose.slice(ACADEMY_LICENSE_PURPOSE_PREFIX.length).trim();
  if (!slug || /\s/.test(slug)) {
    return null;
  }
  return slug;
}

function seatKey(userId: string, slug: string): string {
  return `${userId}\0${slug}`;
}

function classifyOrder(
  order: LicenseGapOrder,
  academySeats: ReadonlySet<string>,
  juniorByUser: ReadonlyMap<string, readonly JuniorLicenseSeat[]>,
): LicenseGap | null {
  if (order.purpose.startsWith(ACADEMY_LICENSE_PURPOSE_PREFIX)) {
    const slug = academyLicenseSlugFromPurpose(order.purpose);
    if (!slug) {
      return gap(order, "academy", "unparsed_purpose");
    }
    if (!academySeats.has(seatKey(order.userId, slug))) {
      return gap(order, "academy", "missing_purchase");
    }
    return null;
  }
  if (order.purpose !== JUNIOR_LICENSE_PURPOSE) {
    return null;
  }
  const seats = juniorByUser.get(order.userId) ?? [];
  const applied = seats.filter((seat) => seat.appliedMerchantOids.includes(order.merchantOid));
  if (applied.length === 0) {
    return gap(order, "junior", "missing_subscription");
  }
  if (!applied.some((seat) => seat.status === "ACTIVE")) {
    return gap(order, "junior", "subscription_inactive");
  }
  return null;
}

function gap(
  order: LicenseGapOrder,
  product: LicenseGapProduct,
  reason: LicenseGapReason,
): LicenseGap {
  return {
    merchantOid: order.merchantOid,
    orderId: order.id,
    userId: order.userId,
    purpose: order.purpose,
    amountMinor: order.amountMinor,
    product,
    reason,
  };
}

/**
 * CLEARED lisans niyeti ile açık lisans. Cüzdan yüklemesi bu listeye girmez.
 * SUCCEEDED iade, eksik lisansı alarm dışına alır; sayı ayrıca döner.
 */
export function evaluateClearedLicenseGaps(snapshot: LicenseGapSnapshot): LicenseGapEvaluation {
  const academySeats = new Set(
    snapshot.academySeats.map((seat) => seatKey(seat.userId, seat.courseSlug)),
  );
  const juniorByUser = new Map<string, JuniorLicenseSeat[]>();
  for (const seat of snapshot.juniorSeats) {
    const list = juniorByUser.get(seat.userId) ?? [];
    list.push(seat);
    juniorByUser.set(seat.userId, list);
  }
  const refunded = new Set(
    snapshot.refundedMerchantOids.map((oid) => oid.trim()).filter((oid) => oid.length > 0),
  );
  const gaps: LicenseGap[] = [];
  const compensated: LicenseGap[] = [];
  for (const order of snapshot.orders) {
    if (!isClearedLicensePurpose(order.purpose)) {
      continue;
    }
    const missing = classifyOrder(order, academySeats, juniorByUser);
    if (!missing) {
      continue;
    }
    if (refunded.has(order.merchantOid.trim())) {
      compensated.push(missing);
      continue;
    }
    gaps.push(missing);
  }
  return { gaps, compensated };
}

export function logLicenseGapScan(
  evaluation: LicenseGapEvaluation,
  requestId: string,
): void {
  for (const row of evaluation.gaps) {
    logEvent({
      level: "error",
      event: "license.gap",
      requestId,
      userId: row.userId,
      merchantOid: row.merchantOid,
      orderId: row.orderId,
      amountMinor: row.amountMinor,
      purpose: row.purpose,
      reason: row.reason,
      action: row.product,
      applied: false,
    });
  }
  logEvent({
    level: evaluation.gaps.length > 0 ? "error" : "info",
    event: "license.gap.scan",
    requestId,
    reason: evaluation.gaps.length > 0 ? "missing_license" : "matched",
    action: String(evaluation.gaps.length),
    applied: false,
  });
  if (evaluation.compensated.length > 0 && evaluation.gaps.length === 0) {
    logEvent({
      level: "info",
      event: "license.gap.scan",
      requestId,
      reason: "refunded_unlicensed",
      action: String(evaluation.compensated.length),
      applied: false,
    });
  }
}

/**
 * Eksik lisansı `payment_anomalies.kind = license_gap` olarak yazar.
 * Parmak izi aynı siparişi ikinci kez satır yapmaz. Bakiye değişmez.
 */
export async function runLicenseGapScan(
  ports: LicenseGapPorts,
  requestId: string = "license-gap",
): Promise<LicenseGapScanResult> {
  const snapshot = await ports.loadSnapshot();
  const evaluation = evaluateClearedLicenseGaps(snapshot);
  let anomaliesWritten = 0;
  for (const row of evaluation.gaps) {
    const recorded = await recordPaymentAnomaly(ports.anomalies, {
      kind: "license_gap",
      merchantOid: row.merchantOid,
      expectedMinor: row.amountMinor,
      reportedMinor: 0,
      orderId: row.orderId,
      requestId,
      detail: {
        product: row.product,
        reason: row.reason,
        purpose: row.purpose,
      },
    });
    if (recorded.inserted) {
      anomaliesWritten += 1;
    }
  }
  logLicenseGapScan(evaluation, requestId);
  return {
    clearedLicenseOrders: snapshot.orders.filter((order) =>
      isClearedLicensePurpose(order.purpose),
    ).length,
    gaps: evaluation.gaps.length,
    compensated: evaluation.compensated.length,
    anomaliesWritten,
  };
}
