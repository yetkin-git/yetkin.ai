import type { AiTokenUsageRecord, AiTokenUsageStore } from "@/lib/kernel/ai/usage-store";

type UsageMemoryState = {
  byId: Array<[string, AiTokenUsageRecord]>;
  byKey: Array<[string, string]>;
};

export type MemoryAiTokenUsageStore = AiTokenUsageStore & {
  list(): AiTokenUsageRecord[];
  capture(): UsageMemoryState;
  restore(state: UsageMemoryState): void;
};

/** Kernel AI kullanım belleği — donmuş Studio motoruna bağlı değildir. */
export function createMemoryAiTokenUsageStore(): MemoryAiTokenUsageStore {
  const byId = new Map<string, AiTokenUsageRecord>();
  const byKey = new Map<string, string>();

  return {
    list() {
      return [...byId.values()].map((row) => ({ ...row }));
    },
    capture() {
      return {
        byId: [...byId.entries()].map(([key, value]) => [key, { ...value }]),
        byKey: [...byKey.entries()],
      };
    },
    restore(state) {
      byId.clear();
      byKey.clear();
      for (const [key, value] of state.byId) {
        byId.set(key, { ...value });
      }
      for (const [key, value] of state.byKey) {
        byKey.set(key, value);
      }
    },
    async insert(record) {
      if (record.idempotencyKey) {
        const existingId = byKey.get(record.idempotencyKey);
        if (existingId) {
          const existing = byId.get(existingId);
          if (existing) {
            return { ...existing };
          }
        }
      }
      byId.set(record.id, record);
      if (record.idempotencyKey) {
        byKey.set(record.idempotencyKey, record.id);
      }
      return { ...record };
    },
    async findByIdempotencyKey(idempotencyKey) {
      const id = byKey.get(idempotencyKey);
      const row = id ? byId.get(id) : undefined;
      return row ? { ...row } : null;
    },
  };
}
