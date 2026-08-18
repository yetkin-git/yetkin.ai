/**
 * K7 — çekirdek emanet iade portu.
 * Çekirdek dikey tablo adı bilmez. Dikeyler `registerEscrowRefundHook(purpose, fn)` ile kaydolur.
 * `onEscrowRefunded(purpose, holdId)` imzası dikey FSM’indir.
 */

export type EscrowRefundPurpose = string;

export type OnEscrowRefunded = (
  purpose: EscrowRefundPurpose,
  holdId: string,
) => Promise<void> | void;

/** `true` = TTL iadesi durur, `expiresAt` dondurulur (ör. freelancer DISPUTED / S51-A). */
export type EscrowTimeoutGuard = (
  purpose: EscrowRefundPurpose,
  holdId: string,
) => Promise<boolean> | boolean;

const refundHooks = new Map<EscrowRefundPurpose, OnEscrowRefunded>();
const timeoutGuards = new Map<EscrowRefundPurpose, EscrowTimeoutGuard>();
const ttlApproachingHooks = new Map<EscrowRefundPurpose, OnEscrowRefunded>();

export function registerEscrowRefundHook(
  purpose: EscrowRefundPurpose,
  handler: OnEscrowRefunded,
): void {
  const key = purpose.trim();
  if (!key) {
    throw new Error("Emanet iade purpose boş olamaz.");
  }
  refundHooks.set(key, handler);
}

export function registerEscrowTimeoutGuard(
  purpose: EscrowRefundPurpose,
  guard: EscrowTimeoutGuard,
): void {
  const key = purpose.trim();
  if (!key) {
    throw new Error("Emanet TTL guard purpose boş olamaz.");
  }
  timeoutGuards.set(key, guard);
}

export function registerEscrowTtlApproachingHook(
  purpose: EscrowRefundPurpose,
  handler: OnEscrowRefunded,
): void {
  const key = purpose.trim();
  if (!key) {
    throw new Error("Emanet TTL yaklaşım purpose boş olamaz.");
  }
  ttlApproachingHooks.set(key, handler);
}

export function clearEscrowRefundHooks(): void {
  refundHooks.clear();
  timeoutGuards.clear();
  ttlApproachingHooks.clear();
}

export function listedEscrowRefundPurposes(): EscrowRefundPurpose[] {
  return [...refundHooks.keys()];
}

/**
 * Kayıtlı tüm dikeylere `onEscrowRefunded(purpose, holdId)` basar.
 * Sahip olmayan dikey no-op döner; çekirdek purpose’u hold’dan çıkarmaz.
 */
export async function notifyEscrowRefunded(holdId: string): Promise<void> {
  const id = holdId.trim();
  if (!id) {
    return;
  }
  for (const [purpose, handler] of refundHooks) {
    await handler(purpose, id);
  }
}

/** Herhangi bir guard true derse TTL iadesi yapılmaz. */
export async function shouldFreezeEscrowTimeout(holdId: string): Promise<boolean> {
  const id = holdId.trim();
  if (!id) {
    return false;
  }
  for (const [purpose, guard] of timeoutGuards) {
    if (await guard(purpose, id)) {
      return true;
    }
  }
  return false;
}

/**
 * TTL yaklaşımında kayıtlı dikeylere purpose+holdId basar.
 * Çekirdek karşı tarafı bilmez; freelancer kancası ustayı bildirir.
 */
export async function notifyEscrowTtlApproaching(holdId: string): Promise<void> {
  const id = holdId.trim();
  if (!id) {
    return;
  }
  for (const [purpose, handler] of ttlApproachingHooks) {
    await handler(purpose, id);
  }
}
