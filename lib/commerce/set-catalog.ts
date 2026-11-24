/**
 * Barem kırıcı **set** ürününün kimliği ve bileşen bağı. Saf; DB yok.
 *
 * Paket kabul edildiğinde doğan kart, tekil ürünlerden farklı üç şeye muhtaç:
 * 1. Kendi SKU'su (`SET-XXXXXXXX`).
 * 2. Pazaryerine gidebilen **sayısal** barkod — `barcode` kolonu 8/12/13/14 hane
 *    rakam ister, `SET-` metni oraya yazılamaz. Bu yüzden EAN-13 türetilir.
 * 3. Üye varyant bağı — set satıldığında hangi varyantlardan düşüleceği.
 *    `CommerceProduct.attributes` JSON'unda tek satırda durur; ayrı tablo yok.
 */

/** Set ürününün işaretçi kolonu. Aynı ürün tekil sayılmaz. */
export const BUNDLE_MEMBERS_COLUMN = "Paket üyeleri";
export const BUNDLE_TYPE_COLUMN = "Paket tipi";
export const BUNDLE_CARGO_SAVED_COLUMN = "Kargo tasarrufu";

export type AttributeRow = { column: string; value: string };

/** `SET-` + kimliğin ilk 8 hanesi. Teklif kimliği tekildir, SKU da tekil olur. */
export function setSku(proposalId: string): string {
  const compact = proposalId.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase();
  return `SET-${compact || "00000000"}`;
}

/**
 * EAN-13 barkod. Ülke öneki `299` (iç kullanım), gövde teklif kimliğinden
 * deterministik türetilir, son hane EAN-13 sağlama basamağıdır.
 * Aynı teklif her zaman aynı barkodu üretir; farklı teklif çakışmaz.
 */
export function setBarcode(proposalId: string): string {
  const hex = proposalId.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
  let digits = "";
  for (let index = 0; index < 12 && digits.length < 9; index += 1) {
    const char = hex[index] ?? "0";
    digits += String(parseInt(char, 16) % 10);
  }
  const body = `299${digits.padEnd(9, "0")}`.slice(0, 12);
  return `${body}${ean13CheckDigit(body)}`;
}

/** EAN-13 sağlama basamağı. */
export function ean13CheckDigit(twelve: string): string {
  const clean = twelve.replace(/\D/g, "").slice(0, 12).padEnd(12, "0");
  let sum = 0;
  for (let index = 0; index < 12; index += 1) {
    const digit = Number(clean[index]);
    sum += index % 2 === 0 ? digit : digit * 3;
  }
  return String((10 - (sum % 10)) % 10);
}

/** Set ürününün bileşen satırı. Değer `|` ile ayrılmış varyant kimlikleridir. */
export function bundleMembersAttribute(memberVariantIds: readonly string[]): AttributeRow {
  return { column: BUNDLE_MEMBERS_COLUMN, value: memberVariantIds.filter(Boolean).join("|") };
}

/**
 * Üye varyant kimliklerini okur. Bağ yoksa boş dizi: set ürünü tekil ürün gibi
 * davranır, çağıran stok düşümünü atlar.
 */
export function readBundleMembers(attributes: unknown): string[] {
  if (!Array.isArray(attributes)) {
    return [];
  }
  for (const item of attributes) {
    if (item == null || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const column = (item as { column?: unknown }).column;
    const value = (item as { value?: unknown }).value;
    if (column !== BUNDLE_MEMBERS_COLUMN || typeof value !== "string") {
      continue;
    }
    return value
      .split("|")
      .map((row) => row.trim())
      .filter((row) => row.length > 0);
  }
  return [];
}

/** Üye maliyetlerinin toplamı — setin COGS'u. */
export function bundleCostMinor(members: readonly { costMinor: number }[]): number {
  return members.reduce((sum, row) => sum + Math.max(0, Math.trunc(row.costMinor)), 0);
}

/** Üye desilerinin toplamı — setin desisi. Eksik veri 0 sayılır. */
export function bundleDesiGrams(members: readonly { desiGrams: number }[]): number {
  return members.reduce((sum, row) => sum + Math.max(0, Math.trunc(row.desiGrams)), 0);
}

/** Setin KDV oranı: üyelerin en yüksek oranı (muhafazakâr; KDV'yi eksik göstermez). */
export function bundleVatBps(members: readonly { vatBps: number }[]): number {
  if (members.length === 0) {
    return 2_000;
  }
  return members.reduce((max, row) => Math.max(max, row.vatBps), 0);
}
