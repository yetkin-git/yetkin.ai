import { randomUUID } from "node:crypto";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY, assertSameCurrency } from "@/lib/kernel/money/currency";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import type { CheckoutPriceLockStore } from "@/lib/kernel/pricing/lock-store";
import {
  assertPriceLockAllowsDebit,
  buildPriceLockKey,
  computePriceLockExpiresAt,
  type CheckoutPriceLockSnapshot,
} from "@/lib/kernel/pricing/price-lock";

export type CreateCheckoutPriceLockCommand = {
  userId: string;
  moduleKey: string;
  unitKey: string;
  now?: Date;
};

export type ConsumeCheckoutPriceLockCommand = {
  lockId: string;
  userId: string;
  moduleKey: string;
  unitKey: string;
  now?: Date;
};

export async function createCheckoutPriceLock(
  ports: { catalog: PriceCatalogStore; locks: CheckoutPriceLockStore },
  command: CreateCheckoutPriceLockCommand,
): Promise<CheckoutPriceLockSnapshot> {
  const moduleKey = command.moduleKey.trim();
  const unitKey = command.unitKey.trim();
  if (!moduleKey || !unitKey) {
    throw new Error("Fiyat kilidi anahtarı eksik.");
  }

  const entry = await ports.catalog.findActiveEntry(moduleKey, unitKey);
  if (!entry) {
    throw new Error("Aktif katalog fiyatı yok.");
  }
  if (entry.unitType !== "MINOR") {
    throw new Error("Satış fiyatı MINOR biriminde olmalıdır.");
  }
  assertSameCurrency(entry.currencyCode, SETTLEMENT_CURRENCY);
  const amountMinor = toPositiveAmountMinor(entry.amountMinor);

  const now = command.now ?? new Date();
  const lockKey = buildPriceLockKey(moduleKey, unitKey);
  const existing = await ports.locks.findByUserAndLockKey(command.userId, lockKey);
  const reusable = existing ? assertPriceLockAllowsDebit(existing, now) : null;
  if (existing && reusable?.ok) {
    return existing;
  }

  return ports.locks.upsertLock({
    id: existing?.id ?? randomUUID(),
    userId: command.userId,
    lockKey,
    moduleKey,
    unitKey,
    amountMinor,
    currencyCode: entry.currencyCode,
    catalogMinor: amountMinor,
    expiresAt: computePriceLockExpiresAt(now),
    consumedAt: null,
  });
}

export async function consumeCheckoutPriceLock(
  ports: { locks: CheckoutPriceLockStore },
  command: ConsumeCheckoutPriceLockCommand,
): Promise<CheckoutPriceLockSnapshot> {
  const lock = await ports.locks.findById(command.lockId);
  const now = command.now ?? new Date();
  const decision = assertPriceLockAllowsDebit(lock, now);
  if (!lock || !decision.ok) {
    if (lock?.consumedAt && lock.userId === command.userId) {
      return lock;
    }
    throw new Error("Fiyat kilidi debit için geçerli değil.");
  }
  if (lock.userId !== command.userId) {
    throw new Error("Fiyat kilidi bu oturuma ait değil.");
  }
  if (lock.moduleKey !== command.moduleKey || lock.unitKey !== command.unitKey) {
    throw new Error("Fiyat kilidi kurs ile uyuşmuyor.");
  }
  return ports.locks.markConsumed(lock.id, now);
}

export async function requireOpenCheckoutPriceLock(
  ports: { locks: CheckoutPriceLockStore },
  input: {
    userId: string;
    moduleKey: string;
    unitKey: string;
    lockId?: string;
    now?: Date;
  },
): Promise<CheckoutPriceLockSnapshot> {
  const lockKey = buildPriceLockKey(input.moduleKey, input.unitKey);
  const lock = input.lockId
    ? await ports.locks.findById(input.lockId)
    : await ports.locks.findByUserAndLockKey(input.userId, lockKey);
  const decision = assertPriceLockAllowsDebit(lock, input.now ?? new Date());
  if (!lock || !decision.ok) {
    const code = !lock ? "missing" : !decision.ok ? decision.code : "missing";
    if (code === "expired") {
      throw new Error("Fiyat kilidinin süresi doldu.");
    }
    if (code === "consumed") {
      throw new Error("Fiyat kilidi kullanılmış.");
    }
    throw new Error("Satın alma için geçerli fiyat kilidi yok.");
  }
  if (lock.userId !== input.userId) {
    throw new Error("Fiyat kilidi bu oturuma ait değil.");
  }
  if (lock.moduleKey !== input.moduleKey || lock.unitKey !== input.unitKey) {
    throw new Error("Fiyat kilidi kurs ile uyuşmuyor.");
  }
  return lock;
}
