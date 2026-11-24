import { describe, expect, it } from "vitest";
import {
  TEZGAH_ARCHIVE_TOOL_KEYS,
  TEZGAH_OUTPUT_CONTENT_MAX,
  inspectTezgahArchive,
  svgCarriesScript,
} from "@/lib/tezgah/pro/archive-guard";
import { encodeSaasBuilderArchive, buildSaasWidget } from "@/lib/tezgah/pro/saas-builder";
import { encodeStudioPhotoArchive, buildStudioPhoto } from "@/lib/tezgah/pro/studio-photo";
import { buildTechnicalDrawing } from "@/lib/tezgah/pro/technical-drawing";
import { buildTechnicalDrawingDxf, encodeTechnicalDrawingArchive } from "@/lib/tezgah/pro/technical-drawing-export";

const DRAWING_INPUT = {
  productName: "Raf",
  widthMm: 1200,
  heightMm: 800,
  depthMm: 400,
  material: "18 mm MDF",
  steps: "Kesim\nMontaj",
  tolerance: "±0.5 mm",
};

function drawingArchive(svgOverride?: string): string {
  const pack = buildTechnicalDrawing(DRAWING_INPUT);
  if (!pack) {
    throw new Error("test paketi üretilemedi");
  }
  const dxf = buildTechnicalDrawingDxf(pack);
  return encodeTechnicalDrawingArchive({
    pack: svgOverride ? { ...pack, svg: svgOverride } : pack,
    dxf,
  });
}

function saasArchive(htmlOverride?: string): string {
  const pack = buildSaasWidget({
    widget: "cargo",
    platform: "html",
    title: "Kargo desi",
    detail: "120×80×40 mm",
    feature: "Desi hesapla",
  });
  if (!pack) {
    throw new Error("saas paketi üretilemedi");
  }
  return encodeSaasBuilderArchive(htmlOverride ? { ...pack, html: htmlOverride } : pack);
}

function studioArchive(): string {
  const pack = buildStudioPhoto({
    productName: "Battaniye",
    features: "Pamuk",
    scene: "trendyol-white",
    galleryCount: 4,
  });
  if (!pack) {
    throw new Error("stüdyo paketi üretilemedi");
  }
  // 1×1 PNG (geçerli base64 gövde).
  const png =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AAAwAB/wD/9nH7WQAAAABJRU5ErkJggg==";
  return encodeStudioPhotoArchive({
    productName: "Battaniye",
    pack,
    mimeType: "image/png",
    imageBase64: png,
  });
}

describe("O8 — tarayıcı-içi arşiv zarfı sunucuda doğrulanır", () => {
  it("gerçek zarfları kabul eder", () => {
    expect(inspectTezgahArchive("technical-drawing", drawingArchive())).toEqual({ ok: true });
    expect(inspectTezgahArchive("saas-builder", saasArchive())).toEqual({ ok: true });
    expect(inspectTezgahArchive("studio-photo", studioArchive())).toEqual({ ok: true });
  });

  it("tanınmayan aracı reddeder", () => {
    const verdict = inspectTezgahArchive("proposal", "## Teklif\nmetin");
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.error).toContain("yazılamaz");
    }
  });

  it("boş içeriği reddeder", () => {
    expect(inspectTezgahArchive("technical-drawing", "").ok).toBe(false);
  });

  it("bozuk JSON zarfını reddeder", () => {
    expect(inspectTezgahArchive("technical-drawing", "{}").ok).toBe(false);
    expect(inspectTezgahArchive("saas-builder", "not-json").ok).toBe(false);
    expect(inspectTezgahArchive("studio-photo", '{"kind":"baska-v1"}').ok).toBe(false);
  });

  it("SVG içine gömülü betiği reddeder", () => {
    const pack = buildTechnicalDrawing(DRAWING_INPUT);
    if (!pack) {
      throw new Error("paket yok");
    }
    const evil = pack.svg.replace("</svg>", "<script>alert(1)</script></svg>");
    const verdict = inspectTezgahArchive("technical-drawing", drawingArchive(evil));
    expect(verdict.ok).toBe(false);
  });

  it("SVG olay işleyicisi ve javascript: URL'sini reddeder", () => {
    expect(svgCarriesScript('<svg onload="alert(1)"></svg>')).toBe(true);
    expect(svgCarriesScript('<svg><a href="javascript:alert(1)"/></svg>')).toBe(true);
    expect(svgCarriesScript("<svg><foreignObject/></svg>")).toBe(true);
    expect(svgCarriesScript('<svg><rect width="10"/></svg>')).toBe(false);
  });

  it("kapanmamış SVG ve bitmemiş DXF reddedilir", () => {
    const pack = buildTechnicalDrawing(DRAWING_INPUT);
    if (!pack) {
      throw new Error("paket yok");
    }
    expect(inspectTezgahArchive("technical-drawing", drawingArchive(pack.svg.replace("</svg>", ""))).ok).toBe(false);
  });

  it("ölçü aralığı dışındaki teknik çizimi reddeder", () => {
    const pack = buildTechnicalDrawing(DRAWING_INPUT);
    if (!pack) {
      throw new Error("paket yok");
    }
    const broken = encodeTechnicalDrawingArchive({
      pack: { ...pack, widthMm: 0 },
      dxf: buildTechnicalDrawingDxf(pack),
    });
    expect(inspectTezgahArchive("technical-drawing", broken).ok).toBe(false);
  });

  it("mini SaaS içinde şifresiz dış betiği reddeder", () => {
    const verdict = inspectTezgahArchive(
      "saas-builder",
      saasArchive('<html><head><script src="http://evil.example/x.js"></script></head></html>'),
    );
    expect(verdict.ok).toBe(false);
  });

  it("görsel stüdyo MIME allowlist'i dışını reddeder", () => {
    const pack = buildStudioPhoto({
      productName: "Battaniye",
      features: "Pamuk",
      scene: "trendyol-white",
      galleryCount: 4,
    });
    if (!pack) {
      throw new Error("paket yok");
    }
    const broken = encodeStudioPhotoArchive({
      productName: "Battaniye",
      pack,
      mimeType: "text/html",
      imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AAAwAB/wD/9nH7WQAAAABJRU5ErkJggg==",
    });
    expect(inspectTezgahArchive("studio-photo", broken).ok).toBe(false);
  });

  it("görsel stüdyo bozuk base64 gövdesini reddeder", () => {
    const pack = buildStudioPhoto({
      productName: "Battaniye",
      features: "Pamuk",
      scene: "trendyol-white",
      galleryCount: 4,
    });
    if (!pack) {
      throw new Error("paket yok");
    }
    const broken = encodeStudioPhotoArchive({
      productName: "Battaniye",
      pack,
      mimeType: "image/png",
      imageBase64: "<<<not-base64>>>",
    });
    expect(inspectTezgahArchive("studio-photo", broken).ok).toBe(false);
  });

  it("metin zarfı boyut tavanını aşarsa reddedilir", () => {
    const huge = "x".repeat(TEZGAH_OUTPUT_CONTENT_MAX + 1);
    const verdict = inspectTezgahArchive("technical-drawing", huge);
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.error).toContain("boyut");
    }
  });

  it("kabul edilen araç listesi üç masayla sınırlı", () => {
    expect([...TEZGAH_ARCHIVE_TOOL_KEYS]).toEqual([
      "technical-drawing",
      "saas-builder",
      "studio-photo",
    ]);
  });
});
