import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import {
  isStartedIdempotencyExpired,
  parseStoredIdempotencyBody,
  serializeIdempotencyBody,
  type HttpIdempotencyRecord,
  type HttpIdempotencyStore,
} from "@/lib/kernel/http/idempotency";

export type HttpIdempotencyWriteDb = Pick<PrismaClient, "httpIdempotencyRecord">;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

function toRecord(row: {
  userId: string;
  route: string;
  key: string;
  requestHash: string;
  status: string;
  statusCode: number;
  responseJson: string;
  createdAt: Date;
}): HttpIdempotencyRecord {
  return {
    userId: row.userId,
    route: row.route,
    key: row.key,
    requestHash: row.requestHash,
    status: row.status === "completed" ? "completed" : "started",
    statusCode: row.statusCode,
    body: parseStoredIdempotencyBody(row.responseJson),
    createdAt: row.createdAt,
  };
}

export function bindHttpIdempotencyStore(db: HttpIdempotencyWriteDb): HttpIdempotencyStore {
  return {
    async begin(input) {
      const now = input.now ?? new Date();
      try {
        await db.httpIdempotencyRecord.create({
          data: {
            userId: input.userId,
            route: input.route,
            key: input.key,
            requestHash: input.requestHash,
            status: "started",
            statusCode: 0,
            responseJson: "{}",
          },
        });
        return { kind: "created" as const };
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }
      }

      const existing = await db.httpIdempotencyRecord.findUnique({
        where: {
          userId_route_key: {
            userId: input.userId,
            route: input.route,
            key: input.key,
          },
        },
      });
      if (!existing) {
        return { kind: "created" as const };
      }
      if (existing.requestHash !== input.requestHash) {
        return { kind: "conflict" as const };
      }
      const record = toRecord(existing);
      if (record.status === "completed") {
        return { kind: "replay" as const, record };
      }
      if (isStartedIdempotencyExpired(record.createdAt, now)) {
        await db.httpIdempotencyRecord.delete({
          where: { id: existing.id },
        });
        await db.httpIdempotencyRecord.create({
          data: {
            userId: input.userId,
            route: input.route,
            key: input.key,
            requestHash: input.requestHash,
            status: "started",
            statusCode: 0,
            responseJson: "{}",
          },
        });
        return { kind: "created" as const };
      }
      return { kind: "in_progress" as const };
    },
    async complete(input) {
      await db.httpIdempotencyRecord.update({
        where: {
          userId_route_key: {
            userId: input.userId,
            route: input.route,
            key: input.key,
          },
        },
        data: {
          status: "completed",
          statusCode: input.statusCode,
          responseJson: serializeIdempotencyBody(input.body),
        },
      });
    },
    async abandon(input) {
      await db.httpIdempotencyRecord.deleteMany({
        where: {
          userId: input.userId,
          route: input.route,
          key: input.key,
        },
      });
    },
  };
}

export function createPrismaHttpIdempotencyStore(): HttpIdempotencyStore {
  return bindHttpIdempotencyStore(getPrisma());
}
