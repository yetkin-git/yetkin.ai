import "server-only";

import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE, TEZGAH_MEMBER_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { tezgahRequestHash } from "@/lib/tezgah/paid-lane";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota, settleTezgahSlot } from "@/lib/tezgah/quota";
import { PAZARYERI_FILENAME, pazaryeriMarket } from "@/lib/tezgah/pazaryeri/copy";
import { buildPazaryeriTable, clipPazaryeriTitle, type PazaryeriCsvInput } from "@/lib/tezgah/pazaryeri/csv";
import { parsePazaryeriProducts, readPazaryeriCopy, type PazaryeriProduct } from "@/lib/tezgah/pazaryeri/parse";
import { pazaryeriSystemPrompt, pazaryeriUserPrompt } from "@/lib/tezgah/pazaryeri/prompts";
import { pazaryeriGenerateRequestSchema, type PazaryeriGenerateRequest } from "@/lib/tezgah/pazaryeri/schema";

/** Tek çağrı tavanı. En çok 8 ürün bu tavana sığsın diye kapıdadır. */
export const PAZARYERI_MAX_OUTPUT_TOKENS = 900;
export const PAZARYERI_MODEL_ROLE = "LITE_STREAM" as const;

export type PazaryeriGenerateResult =
  | {
      ok: true;
      tool: "pazaryeri";
      filename: typeof PAZARYERI_FILENAME;
      csv: string;
      columns: string[];
      rows: string[][];
      remaining: number;
      limit: number;
      guest: boolean;
    }
  | {
      ok: false;
      error: string;
      status: 400 | 402 | 429 | 503;
      remaining: number;
      limit: number;
      guest: boolean;
    };

export type GeneratePazaryeriDeps = InvokeLlmDeps & {
  now?: () => Date;
  invoke?: typeof invokeLlm;
};

function moneyTokens(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(/(?:₺\s*)(\d[\d.]*)|(\d[\d.]*)\s*(?:₺|tl|lira)\b/gi)) {
    const token = (match[1] ?? match[2] ?? "").replace(/\./g, "");
    if (token) {
      found.add(token);
    }
  }
  return [...found];
}

function inventsMoney(line: string, source: string): boolean {
  const allowed = new Set(moneyTokens(source));
  const used = moneyTokens(line);
  if (used.length === 0) {
    return /₺/.test(line) && allowed.size === 0;
  }
  return used.some((token) => !allowed.has(token));
}

function productSource(product: PazaryeriProduct): string {
  return [product.name, product.category, ...product.fields.map((field) => `${field.column}: ${field.value}`), product.other]
    .filter((part) => part.length > 0)
    .join("\n");
}

function keptBullet(bullet: string, source: string): boolean {
  if (/^marka\s*:/i.test(bullet) || inventsMoney(bullet, source)) {
    return false;
  }
  if (/\bbarkod\b/i.test(bullet) || /\bstok\b/i.test(bullet)) {
    return false;
  }
  const digits = bullet.match(/\d{8,}/g) ?? [];
  return digits.every((token) => source.includes(token));
}

function sealRows(products: readonly PazaryeriProduct[], raw: string, titleCap: number): PazaryeriCsvInput[] | null {
  const copy = readPazaryeriCopy(raw);
  if (!copy) {
    return null;
  }
  const indexes = copy.map((block) => block.index);
  const expected = products.map((_, index) => index + 1);
  if (indexes.length !== expected.length || indexes.join(",") !== expected.join(",")) {
    return null;
  }
  const rows: PazaryeriCsvInput[] = [];
  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const block = copy[index];
    if (!product || !block || block.index !== index + 1) {
      return null;
    }
    const source = productSource(product);
    if (inventsMoney(block.title, source)) {
      return null;
    }
    const title = clipPazaryeriTitle(block.title, titleCap);
    if (!title) {
      return null;
    }
    const bullets = block.bullets.filter((bullet) => keptBullet(bullet, source));
    if (bullets.length === 0) {
      return null;
    }
    rows.push({
      title,
      description: bullets.join(" · "),
      category: product.category,
      fields: product.fields,
      other: product.other,
    });
  }
  return rows;
}

/**
 * Katalog satırı. Ayrıştırma kodda biter; bozuk istek hak düşürmez.
 * Model yalnız başlık ve satış metnini yazar. CSV, tavan ve boş fiyat kodda kalır.
 * Cüzdana yazılmaz.
 */
export async function generatePazaryeriCatalog(
  input: {
    actorId: string;
    guest: boolean;
    request: PazaryeriGenerateRequest;
    commandKey?: string | null;
  },
  deps: GeneratePazaryeriDeps = {},
): Promise<PazaryeriGenerateResult> {
  const parsed = pazaryeriGenerateRequestSchema.safeParse(input.request);
  const now = deps.now?.() ?? new Date();
  const open = () => peekTezgahQuota(input.actorId, input.guest, now, "lite");
  if (!parsed.success) {
    const quota = await open();
    return {
      ok: false,
      error: "Alanları kısa ve net doldur.",
      status: 400,
      remaining: quota.remaining,
      limit: quota.limit,
      guest: input.guest,
    };
  }
  const products = parsePazaryeriProducts(parsed.data.products);
  if (!products) {
    const quota = await open();
    return {
      ok: false,
      error: "Alanları kısa ve net doldur.",
      status: 400,
      remaining: quota.remaining,
      limit: quota.limit,
      guest: input.guest,
    };
  }

  const slot = await consumeTezgahQuota(
    input.actorId,
    input.guest,
    now,
    input.commandKey ? { key: input.commandKey, requestHash: tezgahRequestHash(input.request) } : null,
    "lite",
  );
  if (!slot.allowed) {
    return {
      ok: false,
      error: slot.error ?? (input.guest ? TEZGAH_GUEST_QUOTA_MESSAGE : TEZGAH_MEMBER_QUOTA_MESSAGE),
      status: slot.status ?? 429,
      remaining: 0,
      limit: slot.limit,
      guest: input.guest,
    };
  }

  const restore = async (): Promise<PazaryeriGenerateResult> => {
    const restored = await refundTezgahQuota(input.actorId, input.guest, now, slot.lane, "lite");
    return {
      ok: false,
      error: TEZGAH_FAIL_MESSAGE,
      status: 503,
      remaining: restored.remaining,
      limit: restored.limit,
      guest: input.guest,
    };
  };

  const market = pazaryeriMarket(parsed.data.market);
  const invoke = deps.invoke ?? invokeLlm;
  const llm = await invoke(
    {
      role: PAZARYERI_MODEL_ROLE,
      system: pazaryeriSystemPrompt(products.length, market.titleCap),
      user: pazaryeriUserPrompt(parsed.data.market, products),
      temperature: 0.2,
      maxOutputTokens: PAZARYERI_MAX_OUTPUT_TOKENS,
      maxAttempts: 1,
      timeoutMs: 25_000,
      rateLimit: {
        identifier: input.actorId,
        scope: "tezgah",
        limit: 8,
        windowMs: 60_000,
      },
      billing: {
        userId: input.guest ? null : input.actorId,
        source: AI_TOKEN_SOURCES.TEZGAH,
        recordUsage: true,
      },
    },
    deps,
  );

  const sealed = sealRows(products, llm?.text ?? "", market.titleCap);
  if (!sealed) {
    return restore();
  }
  const table = buildPazaryeriTable({ marketLabel: market.label, rows: sealed });
  if (table.rows.length !== products.length) {
    return restore();
  }

  const paid = await settleTezgahSlot(input.actorId, slot);
  if (!paid.ok) {
    return {
      ok: false,
      error: paid.error,
      status: paid.status,
      remaining: slot.remaining,
      limit: slot.limit,
      guest: input.guest,
    };
  }

  return {
    ok: true,
    tool: "pazaryeri",
    filename: PAZARYERI_FILENAME,
    csv: table.csv,
    columns: table.columns,
    rows: table.rows,
    remaining: slot.remaining,
    limit: slot.limit,
    guest: input.guest,
  };
}
