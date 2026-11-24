import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { assistantActorId, hashGuestSubjectKey } from "@/lib/kernel/ai/assistant-guest-actor";
import { parseTetkikAnalysisCard, sealRewriteCurrent } from "@/lib/tezgah/tetkik/analysis";
import { buildTetkikPdf, tetkikPdfFileName, tetkikReportToBlocks } from "@/lib/tezgah/tetkik/document";
import {
  generateTetkikReport,
  TETKIK_MODEL_ID,
} from "@/lib/tezgah/tetkik/engine";
import { parseHomepageHtml, pageSnippetFromParsed } from "@/lib/tezgah/tetkik/parse-html";
import { TETKIK_COPY_UNDEFINED, tetkikSystemPrompt, tetkikUserPrompt } from "@/lib/tezgah/tetkik/prompts";
import { cleanupExpiredTetkikReports, TETKIK_REPORT_TTL_DAYS } from "@/lib/tezgah/tetkik/public-report";
import { resetTetkikDomainClaimsForTests } from "@/lib/tezgah/tetkik/domain-claim";
import { resetTezgahQuotaForTests } from "@/lib/tezgah/quota";
import { scoreHomepageHtml } from "@/lib/tezgah/tetkik/score";
import { techSeoSignalsFromProbes } from "@/lib/tezgah/tetkik/tech-seo";
import type { LlmGatewayResult } from "@/lib/kernel/ai/types";
import type { TetkikReport } from "@/lib/tezgah/tetkik/types";

const NOW = new Date("2026-11-14T12:00:00+03:00");

const RICH_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
<title>Karaoğlu Fırın — taze ekmek</title>
<meta name="description" content="Mahalle fırını her sabah taze ekmek, poğaça ve simit çıkarır.">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
<h1>Karaoğlu Fırın</h1>
<a href="https://wa.me/905551112233">WhatsApp</a>
<button type="button">Sipariş ver</button>
</body>
</html>`;

function readSrc(rel: string): string {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

function analysisJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    detectedBrand: "Karaoğlu Fırın",
    overallScore: 40,
    summary: "Başlık ve çağrı yerinde; iskelet güçlendirilmeli. Sonraki adım dükkan vitrinidir.",
    categories: {
      seo: { score: 40, comment: "Title ve H1 var." },
      copywriting: { score: 35, comment: "CTA metni net." },
      conversion: { score: 45, comment: "WhatsApp açık." },
      trust: { score: 30, comment: "Güven sinyali orta." },
    },
    findings: [
      {
        severity: "warning",
        title: "Meta boyu sınırda",
        detail: "Açıklama satırı var ama güçlendirilebilir.",
        actionFix: "Vaadi ilk 120 karaktere çekin.",
      },
      {
        severity: "good",
        title: "WhatsApp kapısı açık",
        detail: "Ziyaretçi yazabiliyor.",
        actionFix: "Üst şeritte sabit tutun.",
      },
      {
        severity: "warning",
        title: "Teknik SEO dosyası",
        detail: "robots veya sitemap eksik olabilir.",
        actionFix: "Kökte robots.txt ve sitemap.xml yayınlayın.",
      },
      {
        severity: "critical",
        title: "CTA güçlendirilsin",
        detail: "Sipariş ver görünüyor ama marka vaadi zayıf.",
        actionFix: "CTA metnini ürün vaadiyle yazın.",
      },
    ],
    copyRewrites: [
      {
        current: "Karaoğlu Fırın",
        suggested: "Kadıköy'de taze fırın — bugün teslim",
        target: "h1",
      },
      {
        current: "Sipariş ver",
        suggested: "WhatsApp'tan hemen sipariş ver",
        target: "cta",
      },
    ],
    ...overrides,
  });
}

function okText(text: string): LlmGatewayResult {
  return {
    text,
    model: TETKIK_MODEL_ID,
    provider: "gemini",
    usage: { promptTokens: 20, completionTokens: 40, totalTokens: 60 },
  };
}

function routedFetch(html: string): typeof fetch {
  return async (input) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (href.endsWith("/robots.txt")) {
      return new Response("User-agent: *\nAllow: /\n", {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
    }
    if (href.endsWith("/sitemap.xml")) {
      return new Response("", { status: 404, headers: { "content-type": "text/plain" } });
    }
    return new Response(html, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  };
}

describe("tetkik istasyonu — snippet, SEO, PDF, handoff, TTL, misafir hash", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
    resetTetkikDomainClaimsForTests();
  });

  it("gerçek HTML snippet modele gider; uydurma current mühürlenir", async () => {
    const parsed = parseHomepageHtml(RICH_HTML);
    const snippet = pageSnippetFromParsed(parsed);
    expect(snippet.h1).toBe("Karaoğlu Fırın");
    expect(snippet.ctaTexts).toContain("WhatsApp");
    expect(snippet.ctaTexts).toContain("Sipariş ver");

    expect(tetkikSystemPrompt(40)).toContain("güvenli metin parçaları");
    expect(tetkikSystemPrompt(40)).toContain(TETKIK_COPY_UNDEFINED);
    expect(tetkikSystemPrompt(40)).not.toContain("Sana site HTML'i verilmez");

    const user = tetkikUserPrompt({
      score: 40,
      url: "https://ornek.test/",
      businessName: "Karaoğlu Fırın",
      freelancerName: "",
      agencyName: null,
      pageTitle: snippet.title,
      ttfbMs: 100,
      htmlBytes: 1200,
      checks: scoreHomepageHtml(RICH_HTML, { https: true, ttfbMs: 100, htmlBytes: 1200 }).checks,
      opportunities: [],
      actionTitle: "Kapı açık",
      actionBody: "Reklam ayrıca konuşulur.",
      pageSnippet: snippet,
    });
    expect(user).toContain('"h1":"Karaoğlu Fırın"');
    expect(user).toContain("Sipariş ver");
    expect(user).not.toContain("<script");
    expect(user).not.toContain("<h1");

    expect(sealRewriteCurrent("Karaoğlu Fırın", snippet)).toBe("Karaoğlu Fırın");
    expect(sealRewriteCurrent("Uydurma başlık XYZ", snippet)).toBe(TETKIK_COPY_UNDEFINED);

    const invented = parseTetkikAnalysisCard(
      analysisJson({
        copyRewrites: [
          { current: "Uydurma H1", suggested: "Yeni başlık", target: "h1" },
          { current: "Sipariş ver", suggested: "Hemen yazın", target: "cta" },
        ],
      }),
      40,
      snippet,
    );
    expect(invented?.copyRewrites[0]?.current).toBe(TETKIK_COPY_UNDEFINED);
    expect(invented?.copyRewrites[1]?.current).toBe("Sipariş ver");

    const seen: string[] = [];
    const result = await generateTetkikReport(
      { actorId: "guest:tetkik-station-snippet", guest: true, request: { url: "https://ornek.test/" } },
      {
        now: () => NOW,
        clock: () => 5_000,
        lookup: async () => ["93.184.216.34"],
        fetch: routedFetch(RICH_HTML),
        invoke: async (input) => {
          seen.push(input.user);
          return okText(analysisJson());
        },
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(seen[0]).toContain("sayfaMetni");
    expect(seen[0]).toContain("Karaoğlu Fırın");
    expect(result.pageSnippet?.h1).toBe("Karaoğlu Fırın");
    expect(result.analysis?.copyRewrites.every((row) => row.current !== "Uydurma H1")).toBe(true);
  });

  it("robots.txt ve sitemap.xml teknik SEO sinyali üretir; ana skoru bozmaz", async () => {
    const signals = techSeoSignalsFromProbes({
      robotsTxt: { status: "found", detail: "/robots.txt erişilebilir (20 bayt)." },
      sitemapXml: { status: "missing", detail: "/sitemap.xml bulunamadı (404)." },
    });
    expect(signals).toEqual([
      expect.objectContaining({ id: "robotsTxt", status: "found" }),
      expect.objectContaining({ id: "sitemapXml", status: "missing" }),
    ]);

    const base = scoreHomepageHtml(RICH_HTML, { https: true, ttfbMs: 100, htmlBytes: 2_000 });
    const withSeo = scoreHomepageHtml(RICH_HTML, {
      https: true,
      ttfbMs: 100,
      htmlBytes: 2_000,
      techSeo: {
        robotsTxt: { status: "found", detail: "ok" },
        sitemapXml: { status: "missing", detail: "yok" },
      },
    });
    expect(withSeo.score).toBe(base.score);
    expect(withSeo.techSeo.find((row) => row.id === "robotsTxt")?.status).toBe("found");
    expect(withSeo.techSeo.find((row) => row.id === "sitemapXml")?.status).toBe("missing");

    const result = await generateTetkikReport(
      { actorId: "guest:tetkik-station-seo", guest: true, request: { url: "https://ornek.test/" } },
      {
        now: () => NOW,
        clock: () => 5_000,
        lookup: async () => ["93.184.216.34"],
        fetch: routedFetch(RICH_HTML),
        invoke: async () => okText(analysisJson()),
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.techSeo?.find((row) => row.id === "robotsTxt")?.status).toBe("found");
    expect(result.techSeo?.find((row) => row.id === "sitemapXml")?.status).toBe("missing");
  });

  it("misafir subject_key ham IP yerine tuzlanmış SHA-256 taşır", () => {
    const ip = "203.0.113.77";
    const actor = assistantActorId(null, ip);
    expect(actor.guest).toBe(true);
    expect(actor.userId).toBe(hashGuestSubjectKey(ip));
    expect(actor.userId).toMatch(/^guest:[a-f0-9]{64}$/);
    expect(actor.userId).not.toContain(ip);
    const expected = createHash("sha256")
      .update(`yetkin-guest-subject-v1:${ip}`)
      .digest("hex");
    expect(actor.userId).toBe(`guest:${expected}`);
    expect(assistantActorId("user-9", ip)).toEqual({ userId: "user-9", guest: false });
  });

  it("PDF çıktısı buildPlainPdf ile üretilir; reklam handoff UI'da mühürlüdür", () => {
    const scored = scoreHomepageHtml(RICH_HTML, {
      https: true,
      ttfbMs: 100,
      htmlBytes: 2_000,
      techSeo: {
        robotsTxt: { status: "found", detail: "ok" },
        sitemapXml: { status: "missing", detail: "yok" },
      },
    });
    const report: TetkikReport = {
      tool: "tetkik",
      score: scored.score,
      maxScore: 100,
      disclaimer: scored.disclaimer,
      measuredAt: NOW.toISOString(),
      url: "https://ornek.test/",
      businessName: "Karaoğlu Fırın",
      freelancerName: "",
      agencyName: null,
      pageTitle: scored.pageSnippet.title,
      ttfbMs: 100,
      htmlBytes: 2_000,
      checks: scored.checks,
      opportunities: scored.opportunities,
      action: scored.action,
      techSeo: scored.techSeo,
      pageSnippet: scored.pageSnippet,
      narrative: "Kapı açık; reklam ayrıca konuşulur.",
      analysis: parseTetkikAnalysisCard(analysisJson(), scored.score, scored.pageSnippet),
    };
    const blocks = tetkikReportToBlocks(report);
    expect(blocks.some((block) => block.kind === "h1")).toBe(true);
    expect(blocks.some((block) => block.kind === "table")).toBe(true);
    const pdf = buildTetkikPdf(report);
    expect(pdf.byteLength).toBeGreaterThan(200);
    expect(Buffer.from(pdf.subarray(0, 5)).toString("ascii")).toBe("%PDF-");
    expect(tetkikPdfFileName(report)).toMatch(/\.pdf$/);

    const reportUi = readSrc("components/tezgah/tetkik-report.tsx");
    expect(reportUi).toContain("buildTetkikPdf");
    expect(reportUi).toContain("PDF İndir");
    expect(reportUi).toContain("Otonom Reklam Paketi Oluştur");
    expect(reportUi).toContain("onAdsPack");

    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain('kind: "reklam"');
    expect(workbench).toContain('selectTool("reklam"');
    expect(workbench).toContain("onAdsPack");
    expect(workbench).toContain('resolved !== "reklam"');
  });

  it("anonim rapor TTL sabiti 90 gündür ve cleanup fonksiyonu vardır", async () => {
    expect(TETKIK_REPORT_TTL_DAYS).toBe(90);
    const view = await cleanupExpiredTetkikReports(NOW);
    expect(view.ttlDays).toBe(90);
    expect(view.deleted).toBeGreaterThanOrEqual(0);
    expect(view.cutoffIso).toContain("2026-08");

    const inngest = readSrc("lib/kernel/jobs/inngest.ts");
    expect(inngest).toContain('id: "tetkik-reports-cleanup"');
    expect(inngest).toContain("tetkikReportsCleanup");
    expect(readSrc("lib/kernel/jobs/tetkik-cleanup-hook.ts")).toContain("registerTetkikReportsCleanupHook");
    expect(readSrc("app/api/(kernel)/jobs/register-tetkik-hooks.ts")).toContain("cleanupExpiredTetkikReports");
    expect(readSrc("app/api/(kernel)/jobs/inngest/route.ts")).toContain("registerTetkikMaintenanceHooks");
  });
});
