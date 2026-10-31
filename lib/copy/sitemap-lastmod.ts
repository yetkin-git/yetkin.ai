/**
 * Site haritası `lastmod`.
 * İstek saati yazılmaz: her çağrıda `new Date()` Google'ın alanı yok saymasına yol açar.
 * Sıra: açık `SITE_CONTENT_REVISED_AT` ortam günü, yoksa içerik dosyalarının
 * değişim günü (UTC), onun da alt sınırı editöryal mühür `SITE_CONTENT_REVISED_AT`.
 */

import { statSync } from "node:fs";
import { join } from "node:path";
import { SITE_CONTENT_REVISED_AT } from "@/lib/copy/seo";

const CONTENT_CLOCK_FILES = [
  "lib/copy/seo.ts",
  "lib/copy/legal-launch.ts",
  "lib/copy/json-ld.ts",
  "lib/junior/limits.ts",
  "lib/academy/pilot-sku.ts",
  "app/sitemap.ts",
] as const;

let cached: Date | null = null;

function utcDay(ms: number): Date {
  const day = new Date(ms);
  day.setUTCHours(0, 0, 0, 0);
  return day;
}

function parseEnvDay(raw: string | null | undefined): Date | null {
  const value = raw?.trim() ?? "";
  if (!value) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}(?:T[\d:.+-Z]+)?$/u.test(value)) {
    return null;
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return utcDay(parsed);
}

export function resolveSitemapLastModified(input: {
  floor: Date;
  envStamp: string | null;
  fileMtimesMs: readonly number[];
  nowMs: number;
}): Date {
  const nowDay = utcDay(input.nowMs);
  const envDay = parseEnvDay(input.envStamp);
  if (envDay) {
    return envDay.getTime() > nowDay.getTime() ? nowDay : envDay;
  }
  let newest = utcDay(input.floor.getTime()).getTime();
  for (const ms of input.fileMtimesMs) {
    if (!Number.isFinite(ms)) {
      continue;
    }
    const day = utcDay(ms).getTime();
    if (day > newest) {
      newest = day;
    }
  }
  if (newest > nowDay.getTime()) {
    return nowDay;
  }
  return new Date(newest);
}

export function readSitemapLastModified(env: NodeJS.ProcessEnv = process.env): Date {
  const useCache = env === process.env;
  if (useCache && cached) {
    return cached;
  }
  const fileMtimesMs: number[] = [];
  for (const relative of CONTENT_CLOCK_FILES) {
    try {
      fileMtimesMs.push(statSync(join(process.cwd(), relative)).mtimeMs);
    } catch {
      // dosya yoksa bu saat kaynağı düşer
    }
  }
  const stamp = resolveSitemapLastModified({
    floor: SITE_CONTENT_REVISED_AT,
    envStamp: env.SITE_CONTENT_REVISED_AT ?? null,
    fileMtimesMs,
    nowMs: Date.now(),
  });
  if (useCache) {
    cached = stamp;
  }
  return stamp;
}
