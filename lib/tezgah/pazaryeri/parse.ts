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

const RESERVED = new Set(["barkod", "fiyat", "fiyati", "stok", "stokadedi"]);

export type PazaryeriField = {
  column: string;
  value: string;
};

export type PazaryeriProduct = {
  name: string;
  category: string;
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

function parseBlock(block: string): PazaryeriProduct | null {
  if (block.length > PAZARYERI_MAX_BLOCK) {
    return null;
  }
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const name = lines[0];
  if (!name || name.length < 2 || name.length > PAZARYERI_MAX_NAME || lines.length < 2) {
    return null;
  }
  let category: string | null = null;
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
    if (RESERVED.has(folded)) {
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
  return { name, category, fields, other: other.join(" | ") };
}

/** Boş satırla ayrılmış bloklar. Bozuk, taşan veya 8 üstü istek null döner; hak düşmez. */
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
