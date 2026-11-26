/**
 * Bağlamsal geçiş köprüleri — query parametre sanitizer.
 *
 * Köprü URL'leri yalnız bilgi / ön-doldurma taşır (`kaynak`, `pozisyon`, `konu`).
 * TCKN, VKN ve e-posta query string'ine yazılmaz; okurken de reddedilir.
 */

export const BRIDGE_KAYNAK_VALUES = ["e-ticaret", "hibe", "kurumsal", "kariyer"] as const;

export type BridgeKaynak = (typeof BRIDGE_KAYNAK_VALUES)[number];

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
/** `g` yok — `.test()` lastIndex kayması üretmesin. */
const ANGLE_OR_TAG = /[<>]|<\/?[a-z]/i;
const EMAIL_LIKE = /@/;
/** 10 hane VKN veya 11 hane TCKN — yalnız rakam (boşluk/tire temizlendikten sonra). */
const TAX_OR_NATIONAL_ID = /^\d{10,11}$/;
const SCRIPTISH = /javascript:|data:text\/html|vbscript:|on\w+\s*=/i;

function firstRaw(raw: string | string[] | null | undefined): string {
  if (raw == null) {
    return "";
  }
  return Array.isArray(raw) ? (raw[0] ?? "") : raw;
}

/**
 * Genel köprü metin sanitizer.
 * HTML / script / kontrol karakterlerini düşürür; PII kalıplarını reddeder.
 */
export function sanitizeBridgeQueryValue(
  raw: string | string[] | null | undefined,
  maxLen = 120,
): string {
  const trimmed = firstRaw(raw).replace(CONTROL_CHARS, "").trim();
  if (!trimmed) {
    return "";
  }
  if (ANGLE_OR_TAG.test(trimmed) || SCRIPTISH.test(trimmed)) {
    return "";
  }
  if (EMAIL_LIKE.test(trimmed)) {
    return "";
  }
  const digitsOnly = trimmed.replace(/[\s.-]/g, "");
  if (TAX_OR_NATIONAL_ID.test(digitsOnly)) {
    return "";
  }
  // XSS yüzeyini daralt: tırnak / ters eğik çizgi düşürülür.
  const cleaned = trimmed
    .replace(/["'`\\]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, Math.max(1, maxLen))
    .trim();
  return cleaned;
}

/** Allowlist `kaynak` — tanınmayan değer `null`. */
export function parseBridgeKaynak(
  raw: string | string[] | null | undefined,
): BridgeKaynak | null {
  const value = sanitizeBridgeQueryValue(raw, 32).toLowerCase();
  if (!value) {
    return null;
  }
  for (const id of BRIDGE_KAYNAK_VALUES) {
    if (id === value) {
      return id;
    }
  }
  return null;
}

/** Kurumsal ilan başlığı ön-doldurma — 3–160 karakter; PII reddedilir. */
export function parseBridgePozisyon(raw: string | string[] | null | undefined): string {
  const value = sanitizeBridgeQueryValue(raw, 160);
  if (value.length < 3) {
    return "";
  }
  return value;
}

/** İsteğe bağlı konu ipucu — kısa, PII'siz. */
export function parseBridgeKonu(raw: string | string[] | null | undefined): string {
  return sanitizeBridgeQueryValue(raw, 120);
}
