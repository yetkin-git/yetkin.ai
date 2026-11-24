import "server-only";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { getPrisma } from "@/lib/kernel/db";
import { fetchPublicHomepage, type FetchPublicHomepageDeps } from "@/lib/tezgah/tetkik/fetch-html";
import { inspectTetkikUrl, TetkikAccessError } from "@/lib/tezgah/tetkik/guard";
import { parseHomepageHtml } from "@/lib/tezgah/tetkik/parse-html";
import { TETKIK_REJECTED_MESSAGE } from "@/lib/tezgah/tetkik/rubric";
import { scoreTetkik } from "@/lib/tezgah/tetkik/score";
import { normalizeTetkikSiteAddress } from "@/lib/tezgah/tetkik/site-address";
import { probeTechSeoFiles } from "@/lib/tezgah/tetkik/tech-seo";

export const TETKIK_PUBLIC_PATH = "/tetkik" as const;
export const TETKIK_PUBLIC_READ_FAIL = "Site okunamadı. Skor uydurulmadı.";
export const TETKIK_PUBLIC_STORE_FAIL = "Rapor saklanamadı. Skor uydurulmadı.";
/** Anonim kamu raporlarının saklama süresi. */
export const TETKIK_REPORT_TTL_DAYS = 90;

const HASH_PATTERN = /^[A-Za-z0-9_-]{22}$/;

const checkSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().min(1).max(120),
  earned: z.number().int().min(0).max(100),
  weight: z.number().int().min(0).max(100),
  passed: z.boolean(),
  detail: z.string().max(200),
  opportunity: z.string().max(400),
});

const snapshotSchema = z.object({
  score: z.number().int().min(0).max(100),
  maxScore: z.literal(100),
  disclaimer: z.string().min(1).max(400),
  measuredAt: z.string().min(10).max(40),
  url: z.string().url().max(500),
  pageTitle: z.string().max(180),
  ttfbMs: z.number().int().min(0).max(120_000),
  htmlBytes: z.number().int().min(0).max(5_000_000),
  checks: z.array(checkSchema).min(1).max(20),
  opportunities: z.array(z.string().max(400)).max(20),
  action: z.object({
    stage: z.enum(["shop", "ads", "ready"]),
    title: z.string().min(1).max(120),
    body: z.string().min(1).max(800),
  }),
  techSeo: z
    .array(
      z.object({
        id: z.enum(["robotsTxt", "sitemapXml"]),
        label: z.string().min(1).max(40),
        status: z.enum(["found", "missing", "unchecked"]),
        detail: z.string().max(240),
      }),
    )
    .max(4)
    .optional(),
});

export type PublicTetkikSnapshot = z.infer<typeof snapshotSchema>;

export type PublicTetkikMeasure =
  | { ok: true; snapshot: PublicTetkikSnapshot }
  | { ok: false; error: string; status: 400 | 503 };

export function parsePublicTetkikId(raw: string | null | undefined): string | null {
  const id = raw?.trim() ?? "";
  return HASH_PATTERN.test(id) ? id : null;
}

export function publicTetkikPath(id: string): string {
  return `${TETKIK_PUBLIC_PATH}/${id}`;
}

function createReportId(): string {
  return randomBytes(16).toString("base64url");
}

function plain(value: string, max: number): string {
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max);
}

/**
 * Herkese açık ana sayfanın deterministik skoru.
 * Anlatım modeli çağrılmaz. Kota ve cüzdan yazılmaz.
 */
export async function measureDeterministicTetkik(
  rawUrl: string,
  deps: FetchPublicHomepageDeps = {},
  now: Date = new Date(),
): Promise<PublicTetkikMeasure> {
  const normalized = normalizeTetkikSiteAddress(rawUrl);
  const inspected = inspectTetkikUrl(normalized ?? rawUrl);
  if (!normalized || !inspected.ok) {
    return { ok: false, error: TETKIK_REJECTED_MESSAGE, status: 400 };
  }
  try {
    const page = await fetchPublicHomepage(inspected.url, deps);
    const parsed = parseHomepageHtml(page.html);
    const techSeoProbes = await probeTechSeoFiles(page.finalUrl, deps);
    const scored = scoreTetkik(parsed, {
      https: page.finalUrl.startsWith("https:"),
      ttfbMs: page.ttfbMs,
      htmlBytes: page.htmlBytes,
      techSeo: techSeoProbes,
    });
    const snapshot: PublicTetkikSnapshot = {
      score: scored.score,
      maxScore: 100,
      disclaimer: scored.disclaimer,
      measuredAt: now.toISOString(),
      url: page.finalUrl,
      pageTitle: plain(parsed.title, 180),
      ttfbMs: Math.max(0, Math.round(page.ttfbMs)),
      htmlBytes: Math.max(0, page.htmlBytes),
      checks: scored.checks.map((check) => ({
        id: check.id,
        label: check.label,
        earned: check.earned,
        weight: check.weight,
        passed: check.passed,
        detail: plain(check.detail, 200),
        opportunity: plain(check.opportunity, 400),
      })),
      opportunities: scored.opportunities.map((line) => plain(line, 400)).filter((line) => line.length > 0),
      action: scored.action,
      techSeo: scored.techSeo.map((row) => ({
        id: row.id,
        label: row.label,
        status: row.status,
        detail: plain(row.detail, 240),
      })),
    };
    const parsedSnapshot = snapshotSchema.safeParse(snapshot);
    if (!parsedSnapshot.success) {
      return { ok: false, error: TETKIK_PUBLIC_READ_FAIL, status: 503 };
    }
    return { ok: true, snapshot: parsedSnapshot.data };
  } catch (error) {
    if (error instanceof TetkikAccessError && error.kind === "rejected") {
      return { ok: false, error: TETKIK_REJECTED_MESSAGE, status: 400 };
    }
    return { ok: false, error: TETKIK_PUBLIC_READ_FAIL, status: 503 };
  }
}

export async function persistPublicTetkikReport(
  snapshot: PublicTetkikSnapshot,
): Promise<{ id: string } | null> {
  if (!process.env.DATABASE_URL?.trim()) {
    return null;
  }
  let host = "";
  try {
    host = new URL(snapshot.url).hostname.replace(/\.$/, "").slice(0, 253);
  } catch {
    return null;
  }
  if (!host) {
    return null;
  }
  const payloadJson = JSON.stringify(snapshot);
  try {
    const prisma = getPrisma();
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const id = createReportId();
      try {
        await prisma.tetkikReport.create({
          data: {
            id,
            host,
            url: snapshot.url.slice(0, 500),
            score: snapshot.score,
            payloadJson,
          },
        });
        return { id };
      } catch (error) {
        const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
        if (code === "P2002" && attempt === 0) {
          continue;
        }
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function loadPublicTetkikReport(rawId: string): Promise<PublicTetkikSnapshot | null> {
  const id = parsePublicTetkikId(rawId);
  if (!id || !process.env.DATABASE_URL?.trim()) {
    return null;
  }
  try {
    const row = await getPrisma().tetkikReport.findUnique({
      where: { id },
      select: { score: true, payloadJson: true },
    });
    if (!row) {
      return null;
    }
    const parsed = snapshotSchema.safeParse(JSON.parse(row.payloadJson));
    if (!parsed.success || parsed.data.score !== row.score) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export type TetkikReportsCleanupView = {
  ttlDays: typeof TETKIK_REPORT_TTL_DAYS;
  deleted: number;
  cutoffIso: string;
};

/**
 * 90 günden eski anonim `tetkik_reports` satırlarını siler.
 * Ana analizi bloklamaz; DB yoksa 0 döner.
 */
export async function cleanupExpiredTetkikReports(
  now: Date = new Date(),
): Promise<TetkikReportsCleanupView> {
  const cutoff = new Date(now.getTime() - TETKIK_REPORT_TTL_DAYS * 24 * 60 * 60 * 1000);
  const cutoffIso = cutoff.toISOString();
  if (!process.env.DATABASE_URL?.trim()) {
    return { ttlDays: TETKIK_REPORT_TTL_DAYS, deleted: 0, cutoffIso };
  }
  try {
    const result = await getPrisma().tetkikReport.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return { ttlDays: TETKIK_REPORT_TTL_DAYS, deleted: result.count, cutoffIso };
  } catch {
    return { ttlDays: TETKIK_REPORT_TTL_DAYS, deleted: 0, cutoffIso };
  }
}
