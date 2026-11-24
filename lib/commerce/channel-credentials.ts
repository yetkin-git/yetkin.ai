/**
 * Pazaryeri kimliğinin **tek** kabul kuralı.
 *
 * Aynı anahtar iki farklı yerde, iki farklı formatta istenirse satıcı yanlış
 * davranış görür (kokpit `Bearer <uzun-metin>`, klasik masa `satıcı:anahtar:sır`).
 * Bu dosya hem kokpiti hem klasik kimlik masasını aynı üç parçalı sözleşmeye
 * bağlar: `supplierId`, `apiKey`, `apiSecret`. Saf; DB ve `server-only` yok.
 */

import type { CommerceChannelName } from "@/lib/commerce/marketplace-types";
import type { OsChannelKind } from "@/lib/commerce/os-rules";

/** Kimliği pazaryeri kasasına yazılan kanallar. Vitrin ve yakında kanallar girmez. */
export const MARKETPLACE_VAULT_CHANNELS = ["TRENDYOL", "HEPSIBURADA"] as const;

export function isMarketplaceChannel(kind: OsChannelKind): kind is CommerceChannelName {
  return (MARKETPLACE_VAULT_CHANNELS as readonly string[]).includes(kind);
}

/** Kokpit ve klasik masanın paylaştığı kimlik alanları. */
export type ChannelCredentialFields = {
  supplierId: string;
  apiKey: string;
  apiSecret: string;
};

function readText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Tedarikçi numarası biçimi: Trendyol sayısal, Hepsiburada alfanümerik + 4 hane. */
export function supplierIdShape(channel: CommerceChannelName, supplierId: string): boolean {
  if (channel === "HEPSIBURADA") {
    return /^[A-Za-z0-9]{4,40}$/.test(supplierId) && /\d{4}$/.test(supplierId);
  }
  return /^\d{4,20}$/.test(supplierId);
}

function secretShape(value: string): boolean {
  if (value.length < 4 || value.length > 256) {
    return false;
  }
  return !/[\u0000-\u001f\u007f]/.test(value);
}

/**
 * Üç parçalı kimliği okur. Tek bir alan eksik/bozuksa **hiçbiri** yazılmaz.
 * Hata metni "sen" aksındadır ve alan adını söyler.
 */
export function readChannelCredentialFields(
  channel: CommerceChannelName,
  raw: { supplierId?: unknown; apiKey?: unknown; apiSecret?: unknown },
): { ok: true; fields: ChannelCredentialFields } | { ok: false; error: string } {
  const supplierId = readText(raw.supplierId);
  const apiKey = readText(raw.apiKey);
  const apiSecret = readText(raw.apiSecret);
  if (!supplierId) {
    return { ok: false, error: "Satıcı ID gerekli." };
  }
  if (!supplierIdShape(channel, supplierId)) {
    return {
      ok: false,
      error:
        channel === "HEPSIBURADA"
          ? "Hepsiburada satıcı ID'si harf/rakam ve 4 hane ile bitmelidir."
          : "Trendyol satıcı ID'si 4–20 haneli sayı olmalıdır.",
    };
  }
  if (!apiKey || !secretShape(apiKey)) {
    return { ok: false, error: "API Key 4–256 karakter olmalıdır." };
  }
  if (!apiSecret || !secretShape(apiSecret)) {
    return { ok: false, error: "API Secret 4–256 karakter olmalıdır." };
  }
  return { ok: true, fields: { supplierId, apiKey, apiSecret } };
}

/**
 * Eski tek alan (`satıcı:anahtar:sır`) kabulü.
 * Ayrıştırma başarısız olursa **null** döner: düz `Bearer <uzun-metin>` ile
 * kanala gitmek 401 üretir, o yüzden tek parça anahtar hiç kabul edilmez.
 */
export function parseTripleCredential(raw: string): ChannelCredentialFields | null {
  const parts = raw.split(":");
  if (parts.length !== 3) {
    return null;
  }
  const [supplierId, apiKey, apiSecret] = parts.map((part) => part.trim());
  if (!supplierId || !apiKey || !apiSecret) {
    return null;
  }
  return { supplierId, apiKey, apiSecret };
}

/** Yayın adaptörünün beklediği `satıcı:anahtar:sır` düz metni. */
export function formatTripleCredential(fields: ChannelCredentialFields): string {
  return `${fields.supplierId}:${fields.apiKey}:${fields.apiSecret}`;
}

/**
 * Webhook imzasının sırrı API anahtarıdır.
 * Yayın mührü üçlü açılırsa orta parça alınır; tek parça anahtar olduğu gibi kalır.
 */
export function webhookSecretFromBroadcastKey(opened: string): string {
  return parseTripleCredential(opened)?.apiKey ?? opened;
}
