import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildProStudio } from "@/lib/tezgah/pro/build";
import { readStoreZipEntries } from "@/lib/tezgah/pro/zip";
import { buildTechnicalDrawing } from "@/lib/tezgah/pro/technical-drawing";
import {
  technicalDrawingPazaryeriHandoffHref,
  technicalDrawingSaasHandoffHref,
} from "@/lib/tezgah/pro/technical-drawing-bridges";
import {
  archiveToTechnicalDrawingPack,
  buildTechnicalDrawingDxf,
  buildTechnicalDrawingPdf,
  buildTechnicalDrawingZip,
  encodeTechnicalDrawingArchive,
  parseTechnicalDrawingArchive,
  readTechnicalDrawingSvg,
  TECHNICAL_DRAWING_ARCHIVE_KIND,
} from "@/lib/tezgah/pro/technical-drawing-export";

const ROOT = process.cwd();

function readSrc(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("Masa 7 — technical-drawing istasyonu (62 → 89+)", () => {
  it("3 görünüşlü SVG depthMm geometrisi çizer ve XSS (<script>) engeller", () => {
    const pack = buildTechnicalDrawing({
      productName: 'Masa <script>alert(1)</script>',
      widthMm: 600,
      heightMm: 750,
      depthMm: 400,
      material: 'Kayın <img onerror="x">',
      steps: "Ayakları sabitle\nTabla <script>kötü</script>\nVidayı sık",
      tolerance: "±0.2 mm",
    });
    expect(pack).not.toBeNull();
    if (!pack) {
      return;
    }
    expect(pack.svg).toContain('data-view="front"');
    expect(pack.svg).toContain('data-view="side"');
    expect(pack.svg).toContain('data-view="top"');
    expect(pack.svg).toContain('data-depth-mm="400"');
    expect(pack.svg).toContain("Ön Görünüş");
    expect(pack.svg).toContain("Yan Görünüş");
    expect(pack.svg).toContain("Üst Görünüş");
    expect(pack.svg).toContain("400 mm");
    expect(pack.svg).toContain("Ölçek 1:");
    expect(pack.svg).toContain("Genel tolerans notu: ±0.2 mm");
    expect(pack.svg).toContain("Teknik Çizim Anteti");
    expect(pack.svg).toContain("Malzeme &amp; Kalınlık Özeti");
    expect(pack.svg).toContain("&lt;script&gt;");
    expect(pack.svg.includes("<script")).toBe(false);
    expect(pack.svg).not.toMatch(/<img\b/i);
    expect(pack.svg).toContain("&lt;img");
    expect(pack.desi).toBeGreaterThan(0);
  });

  it("geçerli .dxf (SECTION/ENTITIES/EOF) ve .pdf (%PDF-) üretir; zip dört dosya taşır", () => {
    const pack = buildTechnicalDrawing({
      productName: "Meşe raf",
      widthMm: 120,
      heightMm: 80,
      depthMm: 40,
      material: "Kayın 18 mm",
      steps: "Ayağı yuvaya oturt\nVidayı sık",
    });
    expect(pack).not.toBeNull();
    if (!pack) {
      return;
    }
    const dxf = buildTechnicalDrawingDxf(pack);
    expect(dxf).toContain("SECTION");
    expect(dxf).toContain("ENTITIES");
    expect(dxf).toContain("EOF");
    expect(dxf).toContain("LINE");
    expect(dxf).toMatch(/YAN 40x80|40 mm/);
    expect(dxf).not.toMatch(/<script/i);

    const pdf = buildTechnicalDrawingPdf(pack);
    const head = String.fromCharCode(...pdf.slice(0, 5));
    expect(head).toBe("%PDF-");

    const zip = buildTechnicalDrawingZip({ pack, dxf, pdf });
    const entries = readStoreZipEntries(zip);
    expect(entries.map((entry) => entry.name)).toEqual([
      "olcu-semasi.svg",
      "olcu-semasi.dxf",
      "teknik-foy.pdf",
      "URETIM_NOTU.md",
    ]);
  });

  it("arşive özet yerine gerçek çizim zarfı yazar; çekmeceden svg/dxf/pdf yeniden kurulur", () => {
    const built = buildProStudio("technical-drawing", {
      productName: "Çalışma masası",
      widthMm: "1400",
      heightMm: "750",
      depthMm: "700",
      material: "Meşe 25 mm",
      steps: "Ayakları bağla\nTabla oturt",
      tolerance: "±0.5 mm",
    });
    expect(built.ok).toBe(true);
    if (!built.ok) {
      return;
    }
    expect(built.pack.body).toContain(TECHNICAL_DRAWING_ARCHIVE_KIND);
    expect(built.pack.body).not.toBe(built.pack.markdown);
    expect(built.pack.svg).toContain("Ön Görünüş");
    expect(built.pack.dxf).toContain("ENTITIES");
    expect(built.pack.pdf?.[0]).toBe(0x25); // %
    expect(built.pack.zip).not.toBeNull();

    const archive = parseTechnicalDrawingArchive(built.pack.body);
    expect(archive).not.toBeNull();
    if (!archive) {
      return;
    }
    expect(archive.svg).toContain('data-view="side"');
    expect(archive.dxf).toContain("SECTION");
    expect(readTechnicalDrawingSvg(built.pack.body)).toContain("</svg>");

    const rebuiltPdf = buildTechnicalDrawingPdf(archiveToTechnicalDrawingPack(archive));
    expect(String.fromCharCode(...rebuiltPdf.slice(0, 5))).toBe("%PDF-");

    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain('built.pack.tool === "technical-drawing"');
    expect(workbench).toContain("built.pack.body");
    // O8: istemci tavanı sunucu guard'ının sabitinden okunur; ham sayı yok.
    expect(workbench).toContain("TEZGAH_OUTPUT_CONTENT_MAX");
    expect(workbench).not.toContain("200_000");

    const portfolio = readSrc("components/tezgah/output-portfolio.tsx");
    expect(portfolio).toContain("data-drawing-archive-svg");
    expect(portfolio).toContain("data-drawing-archive-dxf");
    expect(portfolio).toContain("data-drawing-archive-pdf");
    expect(portfolio).toContain("data-drawing-archive-preview");
    expect(portfolio).toContain('sandbox=""');

    const roundTrip = encodeTechnicalDrawingArchive({
      pack: archiveToTechnicalDrawingPack(archive),
      dxf: archive.dxf,
    });
    expect(parseTechnicalDrawingArchive(roundTrip)?.productName).toBe("Çalışma masası");
  });

  it("saas-builder ve pazaryeri köprüleri ölçü ön-dolgulu üretir", () => {
    const saas = technicalDrawingSaasHandoffHref({
      productName: "Meşe raf",
      widthMm: 120,
      heightMm: 80,
      depthMm: 40,
    });
    expect(String(saas)).toContain("tool=saas-builder");
    expect(String(saas)).toContain("widget=cargo");
    const saasParams = new URL(String(saas), "https://yetkin.ai").searchParams;
    expect(saasParams.get("detail") ?? "").toContain("120×80×40");
    expect(saasParams.get("title") ?? "").toContain("Meşe raf");

    const market = technicalDrawingPazaryeriHandoffHref({
      productName: "Meşe raf",
      widthMm: 120,
      heightMm: 80,
      depthMm: 40,
      material: "Kayın 18 mm",
    });
    expect(String(market)).toContain("tool=pazaryeri");
    const marketParams = new URL(String(market), "https://yetkin.ai").searchParams;
    expect(marketParams.get("products") ?? "").toContain("Meşe raf");
    expect(marketParams.get("products") ?? "").toContain("120×80×40");

    const preview = readSrc("components/tezgah/pro-studio-preview.tsx");
    expect(preview).toContain("data-drawing-saas-handoff");
    expect(preview).toContain("data-drawing-pazaryeri-handoff");
    expect(preview).toContain("Kargo &amp; Desi Hesaplayıcı Oluştur (saas-builder)");
    expect(preview).toContain("Pazaryeri Kataloğuna Ekle (pazaryeri)");
    expect(preview).toContain('sandbox=""');
    expect(preview).not.toMatch(/sandbox="[^"]*allow-scripts[^"]*"[\s\S]*data-pro-svg/);
  });
});
