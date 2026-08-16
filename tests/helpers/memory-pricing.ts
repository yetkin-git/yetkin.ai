import { randomUUID } from "node:crypto";
import type { CatalogWriteStore } from "@/lib/kernel/admin/catalog-write";
import type { SealedCatalogEntry } from "@/lib/kernel/admin/types";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { PriceCatalogEntrySnapshot, PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import type { CheckoutPriceLockStore, CheckoutPriceLockWrite } from "@/lib/kernel/pricing/lock-store";
import type { CheckoutPriceLockSnapshot } from "@/lib/kernel/pricing/price-lock";

export type MemoryCatalogSeed = {
  moduleKey: string;
  unitKey: string;
  amountMinor: number;
  currencyCode?: CurrencyCode;
  unitType?: PriceCatalogEntrySnapshot["unitType"];
  isActive?: boolean;
  minMinor?: number | null;
  maxMinor?: number | null;
};

export function createMemoryPriceCatalogStore(seeds: MemoryCatalogSeed[] = []): PriceCatalogStore & {
  seed(entry: MemoryCatalogSeed): void;
} {
  const entries = new Map<string, PriceCatalogEntrySnapshot>();
  function put(seed: MemoryCatalogSeed) {
    const key = `${seed.moduleKey}:${seed.unitKey}`;
    entries.set(key, {
      id: `cat-${key}`,
      moduleKey: seed.moduleKey,
      unitKey: seed.unitKey,
      unitType: seed.unitType ?? "MINOR",
      amountMinor: toAmountMinor(seed.amountMinor),
      currencyCode: seed.currencyCode ?? SETTLEMENT_CURRENCY,
      isActive: seed.isActive ?? true,
      minMinor: seed.minMinor == null ? null : toAmountMinor(seed.minMinor),
      maxMinor: seed.maxMinor == null ? null : toAmountMinor(seed.maxMinor),
    });
  }
  for (const seed of seeds) {
    put(seed);
  }
  return {
    seed(entry) {
      put(entry);
    },
    async findActiveEntry(moduleKey, unitKey) {
      const row = entries.get(`${moduleKey}:${unitKey}`);
      if (!row || !row.isActive) {
        return null;
      }
      return { ...row };
    },
  };
}

export function createMemoryCheckoutPriceLockStore(): CheckoutPriceLockStore {
  const byId = new Map<string, CheckoutPriceLockSnapshot>();
  const byUserKey = new Map<string, string>();

  function userKey(userId: string, lockKey: string) {
    return `${userId}:${lockKey}`;
  }

  return {
    async findById(id) {
      const row = byId.get(id);
      return row ? { ...row } : null;
    },
    async findByUserAndLockKey(userId, lockKey) {
      const id = byUserKey.get(userKey(userId, lockKey));
      const row = id ? byId.get(id) : undefined;
      return row ? { ...row } : null;
    },
    async upsertLock(input: CheckoutPriceLockWrite) {
      const existingId = byUserKey.get(userKey(input.userId, input.lockKey));
      const id = input.id ?? existingId ?? randomUUID();
      const record: CheckoutPriceLockSnapshot = {
        id,
        userId: input.userId,
        lockKey: input.lockKey,
        moduleKey: input.moduleKey,
        unitKey: input.unitKey,
        amountMinor: input.amountMinor,
        currencyCode: input.currencyCode,
        catalogMinor: input.catalogMinor,
        expiresAt: input.expiresAt,
        consumedAt: input.consumedAt ?? null,
      };
      byId.set(id, record);
      byUserKey.set(userKey(input.userId, input.lockKey), id);
      return { ...record };
    },
    async markConsumed(id, at) {
      const row = byId.get(id);
      if (!row) {
        throw new Error("Fiyat kilidi yok.");
      }
      const next = { ...row, consumedAt: at };
      byId.set(id, next);
      return { ...next };
    },
  };
}

export type MemoryCatalogWriteSeed = {
  id: string;
  moduleKey: string;
  unitKey: string;
  amountMinor: number;
  unitType?: SealedCatalogEntry["unitType"];
  currencyCode?: CurrencyCode;
  isActive?: boolean;
  minMinor?: number | null;
  maxMinor?: number | null;
  description?: string | null;
  updatedBy?: string | null;
};

export function createMemoryCatalogWriteStore(
  seeds: MemoryCatalogWriteSeed[] = [],
): CatalogWriteStore & { snapshot(id: string): SealedCatalogEntry | null } {
  const byId = new Map<string, SealedCatalogEntry>();
  const byModuleUnit = new Map<string, string>();

  function put(seed: MemoryCatalogWriteSeed) {
    const row: SealedCatalogEntry = {
      id: seed.id,
      moduleKey: seed.moduleKey,
      unitKey: seed.unitKey,
      unitType: seed.unitType ?? "MINOR",
      amountMinor: toAmountMinor(seed.amountMinor),
      currencyCode: seed.currencyCode ?? SETTLEMENT_CURRENCY,
      isActive: seed.isActive ?? true,
      minMinor: seed.minMinor == null ? null : toAmountMinor(seed.minMinor),
      maxMinor: seed.maxMinor == null ? null : toAmountMinor(seed.maxMinor),
      description: seed.description ?? null,
      updatedBy: seed.updatedBy ?? null,
      updatedAt: new Date("2026-08-14T17:03:00.000Z"),
    };
    byId.set(row.id, row);
    byModuleUnit.set(`${row.moduleKey}:${row.unitKey}`, row.id);
  }

  for (const seed of seeds) {
    put(seed);
  }

  return {
    snapshot(id) {
      const row = byId.get(id);
      return row ? { ...row } : null;
    },
    async findById(id) {
      const row = byId.get(id);
      return row ? { ...row } : null;
    },
    async findByModuleUnit(moduleKey, unitKey) {
      const id = byModuleUnit.get(`${moduleKey}:${unitKey}`);
      const row = id ? byId.get(id) : undefined;
      return row ? { ...row } : null;
    },
    async updateAmount(input) {
      const row = byId.get(input.id);
      if (!row) {
        throw new Error("Katalog satırı bulunamadı.");
      }
      const next: SealedCatalogEntry = {
        ...row,
        amountMinor: toAmountMinor(input.amountMinor),
        updatedBy: input.updatedBy,
        updatedAt: new Date("2026-08-15T00:00:00.000Z"),
      };
      byId.set(input.id, next);
      return { ...next };
    },
  };
}
