import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import {
  isPaymentAnomalyKind,
  type PaymentAnomalyRecord,
  type PaymentAnomalyStore,
  type RecordPaymentAnomalyResult,
} from "@/lib/kernel/payments/anomaly";

export type PaymentAnomalyWriteDb = Pick<PrismaClient, "paymentAnomaly">;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

function toRecord(row: {
  id: string;
  fingerprint: string;
  kind: string;
  merchantOid: string;
  expectedMinor: number | null;
  reportedMinor: number | null;
  orderId: string | null;
  walletId: string | null;
  requestId: string;
  sourceIp: string | null;
  detail: string;
  createdAt: Date;
}): PaymentAnomalyRecord {
  if (!isPaymentAnomalyKind(row.kind)) {
    throw new Error("Bilinmeyen ödeme anomali türü.");
  }
  return {
    id: row.id,
    fingerprint: row.fingerprint,
    kind: row.kind,
    merchantOid: row.merchantOid,
    expectedMinor: row.expectedMinor,
    reportedMinor: row.reportedMinor,
    orderId: row.orderId,
    walletId: row.walletId,
    requestId: row.requestId,
    sourceIp: row.sourceIp,
    detail: row.detail,
    createdAt: row.createdAt,
  };
}

export function bindPaymentAnomalyStore(db: PaymentAnomalyWriteDb): PaymentAnomalyStore {
  return {
    async findByFingerprint(fingerprint) {
      const row = await db.paymentAnomaly.findUnique({ where: { fingerprint } });
      return row ? toRecord(row) : null;
    },
    async insert(row): Promise<RecordPaymentAnomalyResult> {
      try {
        const created = await db.paymentAnomaly.create({
          data: {
            id: row.id,
            fingerprint: row.fingerprint,
            kind: row.kind,
            merchantOid: row.merchantOid,
            expectedMinor: row.expectedMinor,
            reportedMinor: row.reportedMinor,
            orderId: row.orderId,
            walletId: row.walletId,
            requestId: row.requestId,
            sourceIp: row.sourceIp,
            detail: row.detail,
            createdAt: row.createdAt,
          },
        });
        return { record: toRecord(created), inserted: true };
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }
        const existing = await db.paymentAnomaly.findUnique({
          where: { fingerprint: row.fingerprint },
        });
        if (!existing) {
          throw error;
        }
        return { record: toRecord(existing), inserted: false };
      }
    },
  };
}

export function createPrismaPaymentAnomalyStore(): PaymentAnomalyStore {
  return bindPaymentAnomalyStore(getPrisma());
}
