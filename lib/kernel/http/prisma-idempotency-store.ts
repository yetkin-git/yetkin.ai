import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import {
  getPrisma,
  prismaErrorLabel,
  withPrismaTransientRetry,
} from "@/lib/kernel/db";
import {
  DATABASE_BUSY_ERROR,
  isPrismaForeignKeyViolation,
  isPrismaUnavailableError,
} from "@/lib/kernel/db-errors";
import { ServiceUnavailableError } from "@/lib/kernel/http/errors";
import {
  isStartedIdempotencyExpired,
  parseStoredIdempotencyBody,
  serializeIdempotencyBody,
  type HttpIdempotencyRecord,
  type HttpIdempotencyStore,
} from "@/lib/kernel/http/idempotency";
import { logEvent } from "@/lib/kernel/observability/log";

export type HttpIdempotencyWriteDb = Pick<PrismaClient, "httpIdempotencyRecord"> & {
  user?: Pick<PrismaClient["user"], "findUnique">;
};

export { DATABASE_BUSY_ERROR };

function isUniqueViolation(error: unknown): boolean {
  const walk = (value: unknown, depth: number): boolean => {
    if (depth > 5 || !value || typeof value !== "object") {
      return false;
    }
    const record = value as Record<string, unknown>;
    if (record.code === "P2002" || record.code === "23505") {
      return true;
    }
    return walk(record.cause, depth + 1);
  };
  return walk(error, 0);
}

function startedSlot(input: {
  userId: string;
  route: string;
  key: string;
  requestHash: string;
}) {
  return {
    userId: input.userId,
    route: input.route,
    key: input.key,
    requestHash: input.requestHash,
    status: "started",
    statusCode: 0,
    responseJson: "{}",
  };
}

async function userExistsInStore(
  db: HttpIdempotencyWriteDb,
  userId: string,
  route: string,
): Promise<boolean | "unknown"> {
  if (!db.user) {
    return "unknown";
  }
  const row = await withIdempotencyDb(route, () =>
    db.user!.findUnique({
      where: { id: userId },
      select: { id: true },
    }),
  );
  return row != null;
}

function bypassMissingUser(route: string, reason: "missing" | "fk"): { kind: "bypassed" } {
  logEvent({
    level: "warn",
    event: "http.idempotency.user_missing",
    errorName: reason === "fk" ? "P2003" : "user_not_found",
    route,
  });
  return { kind: "bypassed" };
}

function throwIdempotencyDbUnavailable(error: unknown, route: string): never {
  logEvent({
    level: "warn",
    event: "http.idempotency.db_unavailable",
    errorName: prismaErrorLabel(error),
    route,
  });
  throw new ServiceUnavailableError(DATABASE_BUSY_ERROR);
}

async function withIdempotencyDb<T>(route: string, work: () => Promise<T>): Promise<T> {
  try {
    return await withPrismaTransientRetry(work);
  } catch (error) {
    if (isUniqueViolation(error) || isPrismaForeignKeyViolation(error)) {
      throw error;
    }
    if (isPrismaUnavailableError(error)) {
      throwIdempotencyDbUnavailable(error, route);
    }
    throw error;
  }
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

async function createStartedSlot(
  db: HttpIdempotencyWriteDb,
  input: {
    userId: string;
    route: string;
    key: string;
    requestHash: string;
  },
): Promise<"created" | "bypassed"> {
  try {
    await withIdempotencyDb(input.route, () =>
      db.httpIdempotencyRecord.create({
        data: startedSlot(input),
      }),
    );
    return "created";
  } catch (error) {
    if (isPrismaForeignKeyViolation(error)) {
      return "bypassed";
    }
    throw error;
  }
}

export function bindHttpIdempotencyStore(db: HttpIdempotencyWriteDb): HttpIdempotencyStore {
  return {
    async begin(input) {
      const now = input.now ?? new Date();
      const exists = await userExistsInStore(db, input.userId, input.route);
      if (exists === false) {
        return bypassMissingUser(input.route, "missing");
      }

      try {
        const created = await createStartedSlot(db, input);
        if (created === "bypassed") {
          return bypassMissingUser(input.route, "fk");
        }
        return { kind: "created" as const };
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }
      }

      const existing = await withIdempotencyDb(input.route, () =>
        db.httpIdempotencyRecord.findUnique({
          where: {
            userId_route_key: {
              userId: input.userId,
              route: input.route,
              key: input.key,
            },
          },
        }),
      );
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
        await withIdempotencyDb(input.route, () =>
          db.httpIdempotencyRecord.delete({
            where: { id: existing.id },
          }),
        );
        const recreated = await createStartedSlot(db, input);
        if (recreated === "bypassed") {
          return bypassMissingUser(input.route, "fk");
        }
        return { kind: "created" as const };
      }
      return { kind: "in_progress" as const };
    },
    async complete(input) {
      await withIdempotencyDb(input.route, () =>
        db.httpIdempotencyRecord.update({
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
        }),
      );
    },
    async abandon(input) {
      await withIdempotencyDb(input.route, () =>
        db.httpIdempotencyRecord.deleteMany({
          where: {
            userId: input.userId,
            route: input.route,
            key: input.key,
          },
        }),
      );
    },
  };
}

/**
 * Canlı istemci: kopuk havuz yenilenince taze PrismaClient alınır.
 * `getPrisma()` anlık bağlamak stale soketi kilitler.
 */
export function createPrismaHttpIdempotencyStore(): HttpIdempotencyStore {
  return bindHttpIdempotencyStore({
    get httpIdempotencyRecord() {
      return getPrisma().httpIdempotencyRecord;
    },
    get user() {
      return getPrisma().user;
    },
  });
}
