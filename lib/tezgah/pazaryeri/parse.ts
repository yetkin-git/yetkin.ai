import {
  PAZARYERI_MAX_BLOCK,
  PAZARYERI_MAX_NAME,
  PAZARYERI_MAX_PRODUCTS,
} from "@/lib/tezgah/pazaryeri/copy";

const CANONICAL: Record<string, string> = {
  renk: "Renk",
  beden: "Beden",
  malzeme: "Malzeme",
  olcu: "Olcu",
  agirlik: "Agirlik",
  desen: "Desen",
  cinsiyet: "Cinsiyet",
  yas: "Yas",
};

/** Barkod LLM/CSV'ye sızmaz. Fiyat ve stok kullanıcıdan doğrulanır. */
const BARCODE_KEYS = new Set(["barkod", "barkodno"]);

export type PazaryeriField = {
  column: string;
  value: string;
};

export type PazaryeriProduct = {
  name: string;
  category: string;
  brand: string | null;
  /** Kullanıcı fiyatı kuruş. Yoksa null — LLM üretmez. */
  priceMinor: number | null;
  /** Kullanıcı stok adedi. Yoksa null — CSV boş kalır. */
  stockQty: number | null;
  fields: PazaryeriField[];
  other: string;
};

export type PazaryeriCopyBlock = {
  index: number;
  title: string;
  bullets: string[];
};

function foldKey(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "");
}

function splitBlocks(raw: string): string[] {
  return raw
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

/** TL metnini kuruşa çevirir. Boş → null. Bozuk → undefined (parse fail). */
export function parseTlToMinor(raw: string): number | null | undefined {
  const cleaned = raw
    .trim()
    .replace(/₺/g, "")
    .replace(/\s+/g, "")
    .replace(/(tl|lira)$/i, "");
  if (!cleaned) {
    return null;
  }
  let normalized = cleaned;
  if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^\d+,\d{1,2}$/.test(cleaned)) {
    normalized = cleaned.replace(",", ".");
  } else if (!/^\d+(?:\.\d{1,2})?$/.test(cleaned)) {
    return undefined;
  }
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    return undefined;
  }
  const minor = Math.round(amount * 100);
  if (!Number.isSafeInteger(minor) || minor > 2_147_483_647) {
    return undefined;
  }
  return minor;
}

/** Stok adedi. Boş → null. Bozuk → undefined. */
export function parseStockQty(raw: string): number | null | undefined {
  const cleaned = raw.trim().replace(/\s+/g, "");
  if (!cleaned) {
    return null;
  }
  if (!/^\d+$/.test(cleaned)) {
    return undefined;
  }
  const qty = Number.parseInt(cleaned, 10);
  if (!Number.isSafeInteger(qty) || qty < 0 || qty > 2_147_483_647) {
    return undefined;
  }
  return qty;
}

/** Kuruşu CSV Fiyat hücresine TL metni olarak yazar. */
export function formatPriceTlCell(priceMinor: number): string {
  const whole = Math.trunc(priceMinor / 100);
  const frac = Math.abs(priceMinor % 100);
  return frac === 0 ? String(whole) : `${whole},${String(frac).padStart(2, "0")}`;
}

/**
 * İlk satır: düz ad veya `Ürün Adı | Marka | Fiyat (TL) | Stok`.
 * Eksik sütunlar boş kabul edilir.
 */
export function parseProductHead(line: string): {
  name: string;
  brand: string | null;
  priceMinor: number | null;
  stockQty: number | null;
} | null {
  const parts = line.split("|").map((part) => part.trim());
  if (parts.length === 1) {
    const name = parts[0] ?? "";
    if (name.length < 2 || name.length > PAZARYERI_MAX_NAME) {
      return null;
    }
    return { name, brand: null, priceMinor: null, stockQty: null };
  }
  if (parts.length > 4) {
    return null;
  }
  const name = parts[0] ?? "";
  if (name.length < 2 || name.length > PAZARYERI_MAX_NAME) {
    return null;
  }
  const brandRaw = parts[1] ?? "";
  if (brandRaw.length > 80) {
    return null;
  }
  const price = parts.length >= 3 ? parseTlToMinor(parts[2] ?? "") : null;
  if (price === undefined) {
    return null;
  }
  const stock = parts.length >= 4 ? parseStockQty(parts[3] ?? "") : null;
  if (stock === undefined) {
    return null;
  }
  return {
    name,
    brand: brandRaw.length > 0 ? brandRaw : null,
    priceMinor: price,
    stockQty: stock,
  };
}

function parseBlock(block: string): PazaryeriProduct | null {
  if (block.length > PAZARYERI_MAX_BLOCK) {
    return null;
  }
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) {
    return null;
  }
  const head = parseProductHead(lines[0] ?? "");
  if (!head) {
    return null;
  }
  let category: string | null = null;
  let brand = head.brand;
  let priceMinor = head.priceMinor;
  let stockQty = head.stockQty;
  const fields: PazaryeriField[] = [];
  const other: string[] = [];
  const seen = new Set<string>();
  for (const line of lines.slice(1)) {
    const splitAt = line.indexOf(":");
    if (splitAt <= 0 || splitAt > 40) {
      return null;
    }
    const key = line.slice(0, splitAt).trim();
    const value = line.slice(splitAt + 1).trim();
    if (key.length < 1 || key.length > 40 || value.length < 1 || value.length > 400) {
      return null;
    }
    const folded = foldKey(key);
    if (folded === "kategori") {
      if (category || value.length < 2 || value.length > 80) {
        return null;
      }
      category = value;
      continue;
    }
    if (BARCODE_KEYS.has(folded)) {
      continue;
    }
    if (folded === "fiyat" || folded === "fiyati") {
      const parsed = parseTlToMinor(value);
      if (parsed === undefined) {
        return null;
      }
      priceMinor = parsed;
      continue;
    }
    if (folded === "stok" || folded === "stokadedi") {
      const parsed = parseStockQty(value);
      if (parsed === undefined) {
        return null;
      }
      stockQty = parsed;
      continue;
    }
    if (folded === "marka") {
      if (value.length < 1 || value.length > 80) {
        return null;
      }
      brand = value;
      continue;
    }
    const column = CANONICAL[folded];
    if (!column) {
      other.push(`${key}: ${value}`);
      continue;
    }
    if (seen.has(column)) {
      other.push(`${key}: ${value}`);
      continue;
    }
    seen.add(column);
    fields.push({ column, value });
  }
  if (!category) {
    return null;
  }
  if (brand) {
    fields.unshift({ column: "Marka", value: brand });
  }
  return {
    name: head.name,
    category,
    brand,
    priceMinor,
    stockQty,
    fields,
    other: other.join(" | "),
  };
}

/** Boş satırla ayrılmış bloklar. Bozuk, taşan veya tavan üstü istek null döner; hak düşmez. */
export function parsePazaryeriProducts(raw: string): PazaryeriProduct[] | null {
  const blocks = splitBlocks(raw);
  if (blocks.length === 0 || blocks.length > PAZARYERI_MAX_PRODUCTS) {
    return null;
  }
  const products: PazaryeriProduct[] = [];
  for (const block of blocks) {
    const product = parseBlock(block);
    if (!product) {
      return null;
    }
    products.push(product);
  }
  return products;
}

function stripFence(text: string): string {
  const trimmed = text.replace(/\r\n/g, "\n").trim();
  const fenced = /^```[a-z]*\n([\s\S]*?)\n```$/i.exec(trimmed);
  return (fenced?.[1] ?? trimmed).trim();
}

/** Modelin numaralı başlık ve madde listesi. Satır sayısı çağıranda blok sayısıyla örtüşmelidir. */
export function readPazaryeriCopy(raw: string): PazaryeriCopyBlock[] | null {
  const text = stripFence(raw);
  if (!text) {
    return null;
  }
  const chunks = text.split(/^##\s+/m).map((chunk) => chunk.trim()).filter((chunk) => chunk.length > 0);
  if (chunks.length === 0) {
    return null;
  }
  const blocks: PazaryeriCopyBlock[] = [];
  for (const chunk of chunks) {
    const breakAt = chunk.indexOf("\n");
    const head = (breakAt < 0 ? chunk : chunk.slice(0, breakAt)).trim();
    const body = breakAt < 0 ? "" : chunk.slice(breakAt + 1);
    if (!/^\d+$/.test(head)) {
      return null;
    }
    let title = "";
    const bullets: string[] = [];
    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      const splitAt = trimmed.indexOf(":");
      if (!title && splitAt > 0 && foldKey(trimmed.slice(0, splitAt)) === "baslik") {
        title = trimmed.slice(splitAt + 1).trim();
        continue;
      }
      if (trimmed.startsWith("- ")) {
        const bullet = trimmed.slice(2).trim();
        if (bullet.length >= 2) {
          bullets.push(bullet);
        }
      }
    }
    if (!title) {
      return null;
    }
    blocks.push({ index: Number(head), title, bullets });
  }
  return blocks;
}
