import {
  isStartedIdempotencyExpired,
  parseStoredIdempotencyBody,
  serializeIdempotencyBody,
  type HttpIdempotencyRecord,
  type HttpIdempotencyStore,
} from "@/lib/kernel/http/idempotency";

function slotKey(userId: string, route: string, key: string): string {
  return `${userId}\0${route}\0${key}`;
}

export function createMemoryHttpIdempotencyStore(): HttpIdempotencyStore {
  const rows = new Map<string, HttpIdempotencyRecord>();

  return {
    async begin(input) {
      const id = slotKey(input.userId, input.route, input.key);
      const now = input.now ?? new Date();
      const existing = rows.get(id);
      if (!existing) {
        rows.set(id, {
          userId: input.userId,
          route: input.route,
          key: input.key,
          requestHash: input.requestHash,
          status: "started",
          statusCode: 0,
          body: {},
          createdAt: now,
        });
        return { kind: "created" };
      }
      if (existing.requestHash !== input.requestHash) {
        return { kind: "conflict" };
      }
      if (existing.status === "completed") {
        return { kind: "replay", record: { ...existing, body: { ...existing.body } } };
      }
      if (isStartedIdempotencyExpired(existing.createdAt, now)) {
        rows.set(id, {
          userId: input.userId,
          route: input.route,
          key: input.key,
          requestHash: input.requestHash,
          status: "started",
          statusCode: 0,
          body: {},
          createdAt: now,
        });
        return { kind: "created" };
      }
      return { kind: "in_progress" };
    },
    async complete(input) {
      const id = slotKey(input.userId, input.route, input.key);
      const existing = rows.get(id);
      if (!existing) {
        return;
      }
      const stored = parseStoredIdempotencyBody(serializeIdempotencyBody(input.body));
      rows.set(id, {
        ...existing,
        status: "completed",
        statusCode: input.statusCode,
        body: stored,
      });
    },
    async abandon(input) {
      rows.delete(slotKey(input.userId, input.route, input.key));
    },
  };
}
