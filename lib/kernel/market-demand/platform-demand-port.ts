/**
 * Platform talep okuma portu.
 * Çekirdek, Tezgâh ve YetkinHibe motorunu import etmez.
 * Yalnız kayıtlı tetkik satırı ve yayınlanmış açık hibe çağrısı döner.
 * Skor, destek oranı ve tutar satırdan gelir; eksik satır atılır.
 *
 * Ş12 / eski bulgu 3.16 — kernel dikeyin tablosunu **kendi** Prisma çağrısıyla okumaz.
 * Hibe kataloğu `HibeCatalogReadPort` arayüzünden gelir; dikey adaptörü
 * `lib/commerce/platform-grant-port.ts` içindedir ve
 * `lib/yetkinhibe/grant-catalog-live.ts` üzerinden okur.
 */
import "server-only";

import { getPrisma } from "@/lib/kernel/db";

export type PlatformGrantCall = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  minSupportMinor: number;
  maxSupportMinor: number;
  supportRatioBps: number;
};

export type PlatformTetkikStage = "shop" | "ads" | "ready" | "unknown";

export type PlatformTetkikHit = {
  id: string;
  host: string;
  score: number;
  pageTitle: string;
  stage: PlatformTetkikStage;
  text: string;
};

const STAGE_SET = new Set<PlatformTetkikStage>(["shop", "ads", "ready", "unknown"]);

function asStage(value: unknown): PlatformTetkikStage {
  return typeof value === "string" && STAGE_SET.has(value as PlatformTetkikStage)
    ? (value as PlatformTetkikStage)
    : "unknown";
}

function plain(value: unknown, max: number): string {
  if (typeof value !== "string") {
    return "";
  }
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max);
}

/** Kayıtlı tetkik anlık görüntüsü. Bozuk JSON sinyal olmaz. */
export function parsePlatformTetkikRow(row: {
  id: string;
  host: string;
  score: number;
  payloadJson: string;
}): PlatformTetkikHit | null {
  if (!Number.isInteger(row.score) || row.score < 0 || row.score > 100) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(row.payloadJson);
  } catch {
    return null;
  }
  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const body = parsed as Record<string, unknown>;
  const action =
    body.action != null && typeof body.action === "object" && !Array.isArray(body.action)
      ? (body.action as Record<string, unknown>)
      : null;
  const opportunities = Array.isArray(body.opportunities)
    ? body.opportunities.filter((line): line is string => typeof line === "string").join(" ")
    : "";
  const pageTitle = plain(body.pageTitle, 180);
  return {
    id: row.id,
    host: plain(row.host, 253),
    score: row.score,
    pageTitle,
    stage: asStage(action?.stage),
    text: plain(`${pageTitle} ${opportunities}`, 2000),
  };
}

export function toPlatformGrantCall(row: {
  id: string;
  title: string;
  summary: string;
  tags: readonly string[];
  minSupportMinor: number;
  maxSupportMinor: number;
  supportRatioBps: number;
}): PlatformGrantCall | null {
  if (!Number.isInteger(row.supportRatioBps) || row.supportRatioBps <= 0 || row.supportRatioBps > 10_000) {
    return null;
  }
  if (!Number.isInteger(row.minSupportMinor) || row.minSupportMinor < 0) {
    return null;
  }
  if (!Number.isInteger(row.maxSupportMinor) || row.maxSupportMinor < 0) {
    return null;
  }
  const title = plain(row.title, 300);
  if (!title) {
    return null;
  }
  return {
    id: row.id,
    title,
    summary: plain(row.summary, 1000),
    tags: row.tags.map((tag) => plain(tag, 40)).filter((tag) => tag.length > 0).slice(0, 12),
    minSupportMinor: row.minSupportMinor,
    maxSupportMinor: row.maxSupportMinor,
    supportRatioBps: row.supportRatioBps,
  };
}

/**
 * Hibe kataloğu okuma portu. Kernel bu arayüzü tanır; uygulaması dikeyde durur.
 * `readOpenCalls` yayımlı, açık ve doğrulanmış satırları döndürür.
 */
export type HibeCatalogReadPort = {
  readOpenCalls(now: Date): Promise<readonly PlatformGrantCall[]>;
};

let hibeCatalogPort: HibeCatalogReadPort | null = null;

/** Dikey adaptörü burada kaydedilir. Kayıt yoksa hibe satırı **uydurulmaz**. */
export function registerHibeCatalogReadPort(port: HibeCatalogReadPort | null): void {
  hibeCatalogPort = port;
}

/**
 * Yayınlanmış ve başvurusu açık çağrılar. Havuz tutarı okunmaz; ürün fiyatı değildir.
 * Port kayıtlı değilse boş liste döner — kernel doğrudan tabloya inmez.
 */
export async function readPlatformGrantCalls(now: Date = new Date()): Promise<PlatformGrantCall[]> {
  if (!hibeCatalogPort) {
    return [];
  }
  const rows = await hibeCatalogPort.readOpenCalls(now);
  const calls: PlatformGrantCall[] = [];
  for (const row of rows) {
    const call = toPlatformGrantCall(row);
    if (call) {
      calls.push(call);
    }
  }
  return calls;
}

/** Son kayıtlı tetkik raporları. Skor kolonundan gelir; anlatım modeli çağrılmaz. */
export async function readPlatformTetkikHits(): Promise<PlatformTetkikHit[]> {
  const rows = await getPrisma().tetkikReport.findMany({
    select: { id: true, host: true, score: true, payloadJson: true },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  const hits: PlatformTetkikHit[] = [];
  for (const row of rows) {
    const hit = parsePlatformTetkikRow(row);
    if (hit) {
      hits.push(hit);
    }
  }
  return hits;
}
