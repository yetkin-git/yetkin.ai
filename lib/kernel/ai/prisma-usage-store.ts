import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import type { AiTokenUsageRecord, AiTokenUsageStore } from "@/lib/kernel/ai/usage-store";

export type AiTokenUsageWriteDb = Pick<PrismaClient, "aiTokenUsage">;

function toRecord(row: {
  id: string;
  userId: string | null;
  source: string;
  provider: string;
  model: string;
  roleKey: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costMinor: number;
  currencyCode: string;
  idempotencyKey: string | null;
  createdAt: Date;
}): AiTokenUsageRecord {
  return {
    id: row.id,
    userId: row.userId,
    source: row.source,
    provider: row.provider,
    model: row.model,
    roleKey: row.roleKey,
    promptTokens: row.promptTokens,
    completionTokens: row.completionTokens,
    totalTokens: row.totalTokens,
    costMinor: toAmountMinor(row.costMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
    idempotencyKey: row.idempotencyKey,
    createdAt: row.createdAt,
  };
}

export function bindAiTokenUsageStore(db: AiTokenUsageWriteDb): AiTokenUsageStore {
  return {
    async insert(record) {
      if (record.idempotencyKey) {
        const existing = await db.aiTokenUsage.findUnique({
          where: { idempotencyKey: record.idempotencyKey },
        });
        if (existing) {
          return toRecord(existing);
        }
      }
      const row = await db.aiTokenUsage.create({
        data: {
          id: record.id,
          userId: record.userId,
          source: record.source,
          provider: record.provider,
          model: record.model,
          roleKey: record.roleKey,
          promptTokens: record.promptTokens,
          completionTokens: record.completionTokens,
          totalTokens: record.totalTokens,
          costMinor: record.costMinor,
          currencyCode: record.currencyCode,
          idempotencyKey: record.idempotencyKey,
          createdAt: record.createdAt,
        },
      });
      return toRecord(row);
    },
    async findByIdempotencyKey(idempotencyKey) {
      const row = await db.aiTokenUsage.findUnique({ where: { idempotencyKey } });
      return row ? toRecord(row) : null;
    },
  };
}

export function createPrismaAiTokenUsageStore(): AiTokenUsageStore {
  return bindAiTokenUsageStore(getPrisma());
}
