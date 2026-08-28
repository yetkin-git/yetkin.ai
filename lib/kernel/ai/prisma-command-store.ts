import "server-only";

import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import {
  classifyExistingPaidCommand,
  type PaidCommandRecord,
  type PaidCommandStatus,
  type PaidCommandStore,
} from "@/lib/kernel/ai/paid-command";

export type PaidCommandWriteDb = Pick<PrismaClient, "paidCommandReservation">;

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
  userId: string;
  scope: string;
  commandKey: string;
  requestHash: string;
  status: string;
  estimatedMinor: number;
  currencyCode: string;
  providerJson: string | null;
  resultId: string | null;
  createdAt: Date;
  updatedAt: Date;
  settledAt: Date | null;
}): PaidCommandRecord {
  return {
    id: row.id,
    userId: row.userId,
    scope: row.scope as PaidCommandRecord["scope"],
    commandKey: row.commandKey,
    requestHash: row.requestHash,
    status: row.status as PaidCommandStatus,
    estimatedMinor: toAmountMinor(row.estimatedMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
    providerJson: row.providerJson,
    resultId: row.resultId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    settledAt: row.settledAt,
  };
}

export function bindPaidCommandStore(db: PaidCommandWriteDb): PaidCommandStore {
  return {
    async begin(input) {
      const now = input.now ?? new Date();
      try {
        const row = await db.paidCommandReservation.create({
          data: {
            id: randomUUID(),
            userId: input.userId,
            scope: input.scope,
            commandKey: input.commandKey,
            requestHash: input.requestHash,
            status: "RESERVED",
            estimatedMinor: input.estimatedMinor,
            currencyCode: input.currencyCode,
            createdAt: now,
            updatedAt: now,
          },
        });
        return { kind: "created" as const, record: toRecord(row) };
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }
      }
      const existing = await db.paidCommandReservation.findUnique({
        where: {
          userId_scope_commandKey: {
            userId: input.userId,
            scope: input.scope,
            commandKey: input.commandKey,
          },
        },
      });
      if (!existing) {
        throw new Error("Üretim rezervi kilitlenemedi.");
      }
      return classifyExistingPaidCommand(toRecord(existing), input.requestHash);
    },
    async saveProviderOutput(input) {
      const now = input.now ?? new Date();
      const row = await db.paidCommandReservation.update({
        where: {
          userId_scope_commandKey: {
            userId: input.userId,
            scope: input.scope,
            commandKey: input.commandKey,
          },
        },
        data: {
          status: "PROVIDER_DONE",
          providerJson: input.providerJson,
          updatedAt: now,
        },
      });
      return toRecord(row);
    },
    async markSettled(input) {
      const now = input.now ?? new Date();
      await db.paidCommandReservation.update({
        where: {
          userId_scope_commandKey: {
            userId: input.userId,
            scope: input.scope,
            commandKey: input.commandKey,
          },
        },
        data: {
          status: "SETTLED",
          resultId: input.resultId,
          settledAt: now,
          updatedAt: now,
        },
      });
    },
    async find(input) {
      const row = await db.paidCommandReservation.findUnique({
        where: {
          userId_scope_commandKey: {
            userId: input.userId,
            scope: input.scope,
            commandKey: input.commandKey,
          },
        },
      });
      return row ? toRecord(row) : null;
    },
  };
}

export function createPrismaPaidCommandStore(): PaidCommandStore {
  return bindPaidCommandStore(getPrisma());
}
