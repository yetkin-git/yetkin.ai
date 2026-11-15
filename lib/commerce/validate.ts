import { randomInt } from "node:crypto";
import {
  COMMERCE_INT_MAX,
  COMMERCE_MARKETS,
  type CatalogAttribute,
  type CatalogMode,
  type CommerceMarket,
  type InventoryDirection,
  type InventoryType,
} from "@/lib/commerce/types";

const SKU_PATTERN = /^[A-Z0-9][A-Z0-9._-]*$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BARCODE_LENGTHS = new Set([8, 12, 13, 14]);
const DRAFT_SKU_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const PAZARYERI_IMPORT_MAX_ROWS = 8;
export const CSV_IMPORT_MAX_ROWS = 100;

export function parseSku(value: string): string | null {
  const sku = value.trim();
  if (sku.length < 1 || sku.length > 64 || !SKU_PATTERN.test(sku)) {
    return null;
  }
  return sku;
}

export function parseBarcode(value: string): string | null {
  const barcode = value.trim();
  if (!BARCODE_LENGTHS.has(barcode.length) || !/^[0-9]+$/.test(barcode)) {
    return null;
  }
  return barcode;
}

export function parseSlug(value: string): string | null {
  const slug = value.trim();
  if (slug.length < 1 || slug.length > 48 || !SLUG_PATTERN.test(slug)) {
    return null;
  }
  return slug;
}

export function slugFromName(name: string): string {
  const folded = name
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return folded
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

export function createDraftSku(nextIndex: () => number = () => randomInt(0, DRAFT_SKU_ALPHABET.length)): string {
  let tail = "";
  for (let index = 0; index < 8; index += 1) {
    tail += DRAFT_SKU_ALPHABET[nextIndex()] ?? "A";
  }
  return `TASLAK-${tail}`;
}

export function inventoryIdempotencyKey(httpKey: string, index: number): string {
  return `${httpKey}:${index}`;
}

export function isCommerceMarket(value: string): value is CommerceMarket {
  return (COMMERCE_MARKETS as readonly string[]).includes(value);
}

type ParseFail = { ok: false; error: string };
type ParseOk<T> = { ok: true; value: T };

function fail(error: string): ParseFail {
  return { ok: false, error };
}

function readRecord(raw: unknown): Record<string, unknown> | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  return raw as Record<string, unknown>;
}

function readText(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const text = value.trim();
  if (text.length < min || text.length > max) {
    return null;
  }
  return text;
}

function readInt(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    return null;
  }
  return value;
}

export function parseAttributes(value: unknown): ParseOk<CatalogAttribute[]> | ParseFail {
  if (value == null) {
    return { ok: true, value: [] };
  }
  if (!Array.isArray(value) || value.length > 32) {
    return fail("Özellik listesi geçersiz.");
  }
  const attributes: CatalogAttribute[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    const record = readRecord(item);
    if (!record) {
      return fail("Özellik listesi geçersiz.");
    }
    const column = readText(record.column, 1, 40);
    const cell = readText(record.value, 1, 400);
    if (!column || !cell) {
      return fail("Özellik adı veya değeri sınır dışında.");
    }
    const key = column.toLocaleLowerCase("tr-TR");
    if (seen.has(key)) {
      return fail("Aynı özellik iki kez yazılamaz.");
    }
    seen.add(key);
    attributes.push({ column, value: cell });
  }
  return { ok: true, value: attributes };
}

export type ParsedCard = {
  title: string;
  description: string;
  category: string;
  attributes: CatalogAttribute[];
  other: string;
  sku: string | null;
  barcode: string | null;
  amountMinor: number | null;
  onHandQty: number;
  safetyBuffer: number;
};

function parseStockFields(
  mode: CatalogMode,
  record: Record<string, unknown>,
): ParseOk<Pick<ParsedCard, "sku" | "barcode" | "amountMinor" | "onHandQty" | "safetyBuffer">> | ParseFail {
  const skuRaw = record.sku;
  const barcodeRaw = record.barcode;
  const amountRaw = record.amountMinor;
  const onHand = readInt(record.onHandQty, 0, COMMERCE_INT_MAX);
  const buffer = readInt(record.safetyBuffer, 0, COMMERCE_INT_MAX);
  if (onHand == null || buffer == null) {
    return fail("Stok ve emniyet tamponu tam sayı olmalıdır.");
  }
  if (mode === "draft") {
    if (skuRaw != null && typeof skuRaw !== "string") {
      return fail("SKU metin olmalıdır.");
    }
    const sku = typeof skuRaw === "string" && skuRaw.trim() ? parseSku(skuRaw) : null;
    if (typeof skuRaw === "string" && skuRaw.trim() && !sku) {
      return fail("SKU büyük harf, rakam ve . _ - içerir. En çok 64 karakter.");
    }
    if (barcodeRaw != null || amountRaw != null || onHand !== 0 || buffer !== 0) {
      return fail("Taslak kartta barkod, fiyat ve stok boş kalır.");
    }
    return { ok: true, value: { sku, barcode: null, amountMinor: null, onHandQty: 0, safetyBuffer: 0 } };
  }
  if (typeof skuRaw !== "string" || !parseSku(skuRaw)) {
    return fail("Aktif kartta SKU zorunludur.");
  }
  if (typeof barcodeRaw !== "string" || !parseBarcode(barcodeRaw)) {
    return fail("Aktif kartta barkod 8, 12, 13 veya 14 rakam olmalıdır.");
  }
  const amountMinor = readInt(amountRaw, 0, COMMERCE_INT_MAX);
  if (amountMinor == null) {
    return fail("Aktif kartta fiyat kuruş tam sayısı olmalıdır.");
  }
  if (onHand < 1 || onHand - buffer < 1) {
    return fail("Aktif kartta satılabilir adet en az 1 olmalıdır.");
  }
  return {
    ok: true,
    value: {
      sku: parseSku(skuRaw),
      barcode: parseBarcode(barcodeRaw),
      amountMinor,
      onHandQty: onHand,
      safetyBuffer: buffer,
    },
  };
}

export function parseCatalogCard(mode: CatalogMode, raw: unknown): ParseOk<ParsedCard> | ParseFail {
  const record = readRecord(raw);
  if (!record) {
    return fail("Kart gövdesi geçersiz.");
  }
  const title = readText(record.title, 1, 200);
  const description = readText(record.description, 1, 4_000);
  const category = readText(record.category, 1, 80);
  const other = record.other == null ? "" : readText(record.other, 0, 500);
  if (!title || !description || !category || other == null) {
    return fail("Başlık, açıklama ve kategori zorunludur.");
  }
  const attributes = parseAttributes(record.attributes);
  if (!attributes.ok) {
    return attributes;
  }
  const stock = parseStockFields(mode, record);
  if (!stock.ok) {
    return stock;
  }
  return {
    ok: true,
    value: {
      title,
      description,
      category,
      attributes: attributes.value,
      other,
      ...stock.value,
    },
  };
}

export function parseVariantBody(mode: CatalogMode, raw: unknown): ParseOk<Pick<ParsedCard, "sku" | "barcode" | "amountMinor" | "onHandQty" | "safetyBuffer">> | ParseFail {
  const record = readRecord(raw);
  if (!record) {
    return fail("Varyant gövdesi geçersiz.");
  }
  return parseStockFields(mode, record);
}

export function parseMode(value: unknown): CatalogMode | null {
  return value === "draft" || value === "active" ? value : null;
}

export function parseStoreName(value: unknown): string | null {
  return typeof value === "string" ? readText(value, 1, 80) : null;
}

/**
 * Vitrin hattı. `null` veya boş metin kolonu siler.
 * `05…`, `5…` ve `+90 5…` biçimleri `905` ile 12 haneye iner.
 */
export function parseWhatsappE164(value: unknown): { ok: true; value: string | null } | { ok: false } {
  if (value == null) {
    return { ok: true, value: null };
  }
  if (typeof value !== "string") {
    return { ok: false };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }
  let digits = trimmed.replace(/[\s().-]/g, "");
  if (digits.startsWith("+")) {
    digits = digits.slice(1);
  }
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  if (/^0\d{10}$/.test(digits)) {
    digits = `9${digits}`;
  } else if (/^5\d{9}$/.test(digits)) {
    digits = `90${digits}`;
  }
  if (!/^905\d{9}$/.test(digits)) {
    return { ok: false };
  }
  return { ok: true, value: digits };
}

export function parseMovementBody(raw: unknown):
  | ParseOk<{
      variantId: string;
      type: InventoryType;
      direction: InventoryDirection;
      quantity: number;
      note: string;
    }>
  | ParseFail {
  const record = readRecord(raw);
  if (!record) {
    return fail("Hareket gövdesi geçersiz.");
  }
  const variantId = readText(record.variantId, 1, 128);
  const type = record.type;
  const direction = record.direction;
  const quantity = readInt(record.quantity, 1, COMMERCE_INT_MAX);
  const note = record.note == null ? "" : readText(record.note, 0, 500);
  if (!variantId || quantity == null || note == null) {
    return fail("Varyant, adet ve not sınır dışında.");
  }
  if (type !== "INBOUND" && type !== "SALE" && type !== "ADJUSTMENT" && type !== "RETURN") {
    return fail("Hareket tipi geçersiz.");
  }
  if (direction !== "IN" && direction !== "OUT") {
    return fail("Hareket yönü geçersiz.");
  }
  if (type === "ADJUSTMENT" && note.trim().length < 2) {
    return fail("Düzeltme notu en az 2 karakter olmalıdır.");
  }
  return { ok: true, value: { variantId, type, direction, quantity, note } };
}
