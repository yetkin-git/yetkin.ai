import { randomUUID } from "node:crypto";
import {
  classifyExistingPaidCommand,
  newPaidCommandRecord,
  type PaidCommandRecord,
  type PaidCommandStore,
} from "@/lib/kernel/ai/paid-command";

export function mintTestCommandKey(): string {
  return randomUUID();
}

export function createMemoryPaidCommandStore(): PaidCommandStore {
  const byKey = new Map<string, PaidCommandRecord>();

  function keyOf(userId: string, scope: string, commandKey: string): string {
    return `${userId}:${scope}:${commandKey}`;
  }

  return {
    async begin(input) {
      const now = input.now ?? new Date();
      const mapKey = keyOf(input.userId, input.scope, input.commandKey);
      const existing = byKey.get(mapKey);
      if (!existing) {
        const record = newPaidCommandRecord({ ...input, now });
        byKey.set(mapKey, record);
        return { kind: "created" as const, record: { ...record } };
      }
      return classifyExistingPaidCommand({ ...existing }, input.requestHash);
    },
    async saveProviderOutput(input) {
      const now = input.now ?? new Date();
      const mapKey = keyOf(input.userId, input.scope, input.commandKey);
      const existing = byKey.get(mapKey);
      if (!existing) {
        throw new Error("Üretim rezervi yok.");
      }
      const next: PaidCommandRecord = {
        ...existing,
        status: "PROVIDER_DONE",
        providerJson: input.providerJson,
        updatedAt: now,
      };
      byKey.set(mapKey, next);
      return { ...next };
    },
    async markSettled(input) {
      const now = input.now ?? new Date();
      const mapKey = keyOf(input.userId, input.scope, input.commandKey);
      const existing = byKey.get(mapKey);
      if (!existing) {
        throw new Error("Üretim rezervi yok.");
      }
      byKey.set(mapKey, {
        ...existing,
        status: "SETTLED",
        resultId: input.resultId,
        settledAt: now,
        updatedAt: now,
      });
    },
    async find(input) {
      const row = byKey.get(keyOf(input.userId, input.scope, input.commandKey));
      return row ? { ...row } : null;
    },
  };
}
