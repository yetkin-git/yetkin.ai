import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  TETKIK_ARCHIVE_KIND,
  encodeTetkikArchive,
  parseTetkikArchive,
} from "@/lib/tezgah/tetkik/archive";
import type { TetkikReport } from "@/lib/tezgah/tetkik/types";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function sampleReport(): TetkikReport {
  return {
    tool: "tetkik",
    score: 63,
    maxScore: 100,
    disclaimer: "Bu rapor yetkin.ai AI Tezgâhı ile ölçülmüştür.",
    measuredAt: "2026-11-24T09:00:00.000Z",
    url: "https://ornek-dukkan.com",
    businessName: "Örnek Dükkan",
    freelancerName: "Hasan",
    agencyName: null,
    pageTitle: "Örnek Dükkan — El Yapımı",
    ttfbMs: 240,
    htmlBytes: 41_000,
    checks: [
      { id: "title", label: "Başlık etiketi", weight: 6, earned: 6, passed: true, detail: "Var" },
      { id: "viewport", label: "Mobil viewport", weight: 8, earned: 0, passed: false, detail: "Yok" },
    ],
    opportunities: ["Mobil viewport ekle"],
    action: { title: "2. Aşama — Mobil", body: "Viewport meta etiketi ekle." },
    narrative: "Site temel etiketleri taşıyor.",
  } as TetkikReport;
}

describe("Y3 — tetkik arşivi raporun tamamını taşır", () => {
  it("zarf skor, maddeler ve aksiyonu korur (özet değil)", () => {
    const report = sampleReport();
    const raw = encodeTetkikArchive(report);
    const parsed = parseTetkikArchive(raw);
    expect(parsed).not.toBeNull();
    if (!parsed) {
      return;
    }
    expect(parsed.kind).toBe(TETKIK_ARCHIVE_KIND);
    expect(parsed.report.score).toBe(63);
    expect(parsed.report.checks).toHaveLength(2);
    expect(parsed.report.checks[1]?.passed).toBe(false);
    expect(parsed.report.action.title).toContain("Mobil");
    expect(parsed.report.opportunities).toEqual(["Mobil viewport ekle"]);
  });

  it("rota arşive tam zarfı yazar; eski üç satırlık özet kalmadı", () => {
    const route = readSrc("app/api/tezgah/tetkik/generate/route.ts");
    expect(route).toContain("encodeTetkikArchive");
    // Regresyon: özet biçimi geri gelmemeli.
    expect(route).not.toContain("Skor: ${result.score}");
  });

  it("çekmece tetkik zarfını çözer ve PDF üretir", () => {
    const portfolio = readSrc("components/tezgah/output-portfolio.tsx");
    expect(portfolio).toContain("parseTetkikArchive");
    expect(portfolio).toContain("buildTetkikPdf");
    expect(portfolio).toContain("tetkikReportPlainText");
    expect(portfolio).toContain("data-tetkik-archive-pdf");
  });

  it("düz metin / bozuk kayıt sessizce uydurulmaz", () => {
    expect(parseTetkikArchive("https://x.com\nSkor: 12\nmetin")).toBeNull();
    expect(parseTetkikArchive('{"kind":"baska-v1"}')).toBeNull();
    expect(parseTetkikArchive('{"kind":"tetkik-v1"}')).toBeNull();
    expect(parseTetkikArchive("{bozuk")).toBeNull();
    // Skor ve checks olmadan rapor basılamaz.
    expect(parseTetkikArchive('{"kind":"tetkik-v1","report":{"url":"https://x.com","disclaimer":"d"}}')).toBeNull();
  });
});

describe("K2 — arşiv sayfalanır", () => {
  it("okuma ucu imleç kabul eder ve bir sonraki imleci döner", () => {
    const route = readSrc("app/api/tezgah/outputs/route.ts");
    expect(route).toContain("cursor");
    expect(route).toContain("nextCursor");
    expect(route).toContain("ARCHIVE_PAGE_SIZE");
    // Tek sorguda "daha var mı" — fazladan bir satır okunur.
    expect(route).toContain("ARCHIVE_PAGE_SIZE + 1");
    // Kararlı sıralama: aynı saniyedeki satırlar da deterministik.
    expect(route).toContain('orderBy: [{ createdAt: "desc" }, { id: "desc" }]');
  });

  it("çekmece 'daha eski üretimler' düğmesini taşır ve sayfayı biriktirir", () => {
    const portfolio = readSrc("components/tezgah/output-portfolio.tsx");
    expect(portfolio).toContain("nextCursor");
    expect(portfolio).toContain("Daha eski üretimler");
    expect(portfolio).toContain("loadMore");
    // Sayfa sonu 404/boş yanıtta kullanıcı bilgilendirilir.
    expect(portfolio).toContain("Arşivin sonuna geldin.");
  });
});
