import { createRailV1Uuid, isRailV1Uuid } from "../contract/v1";
import type { KvStore } from "./types";

const PREFIX = "rail-is.idempotency.";

function storageKey(intentId: string): string {
  const safe = intentId.replace(/[^A-Za-z0-9._-]+/g, ".");
  return `${PREFIX}${safe}`;
}

/**
 * Yazma niyeti başına UUID. Ekran yeniden çizilince yeni anahtar basılmaz.
 * Ağ kopyası / retry aynı UUID'yi taşır.
 */
export async function getOrCreateIntentIdempotencyKey(
  store: KvStore,
  intentId: string,
): Promise<string> {
  const key = storageKey(intentId);
  const existing = await store.getItem(key);
  if (existing && isRailV1Uuid(existing)) {
    return existing;
  }
  const minted = createRailV1Uuid();
  await store.setItem(key, minted);
  return minted;
}

export async function rotateIntentIdempotencyKey(
  store: KvStore,
  intentId: string,
): Promise<string> {
  const minted = createRailV1Uuid();
  await store.setItem(storageKey(intentId), minted);
  return minted;
}
