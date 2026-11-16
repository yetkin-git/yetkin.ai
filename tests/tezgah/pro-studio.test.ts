import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildProStudio } from "@/lib/tezgah/pro/build";
import { buildSaasWidget, readApiUrl, readCounterDeadline } from "@/lib/tezgah/pro/saas-builder";
import { buildStudioPhoto } from "@/lib/tezgah/pro/studio-photo";
import { buildTechnicalDrawing } from "@/lib/tezgah/pro/technical-drawing";
import { readStoreZip } from "@/lib/tezgah/pro/zip";

const ROOT = process.cwd();

describe("görsel stüdyo", () => {
  it("trendyol beyaz 2:3 kareyi geçirir ve alt metin paketini sıralar", () => {
    const pack = buildStudioPhoto({
      productName: "Bez çanta",
      features: "Yıkanabilir kanvas, 30 cm sap",
      market: "trendyol",
      widthPx: 1200,
      heightPx: 1800,
      background: "white",
      overlay: false,
      galleryCount: 4,
    });
    expect(pack).not.toBeNull();
    expect(pack?.rules.every((rule) => rule.pass)).toBe(true);
    expect(pack?.rules.map((rule) => rule.market)).toEqual(["Trendyol", "Trendyol", "Trendyol", "Trendyol"]);
    expect(pack?.gallery.map((slot) => slot.role)[0]).toBe("Ana görsel");
    expect(pack?.altTexts).toHaveLength(4);
    expect(pack?.markdown).toContain("Beyaz fon: geçti");
    expect(pack?.prompt).toContain("1200×1800");
    expect(pack?.markdown).not.toMatch(/₺|\bTL\b/);
  });

  it("renkli ve yazılı kareyi amazon kurallarında bırakır", () => {
    const pack = buildStudioPhoto({
      productName: "Bez çanta",
      features: "Ham keten",
      market: "amazon",
      widthPx: 640,
      heightPx: 900,
      background: "colored",
      overlay: true,
      galleryCount: 3,
    });
    expect(pack?.rules.find((rule) => rule.label === "Saf beyaz fon")?.pass).toBe(false);
    expect(pack?.rules.find((rule) => rule.label === "Kare oran")?.pass).toBe(false);
    expect(pack?.rules.find((rule) => rule.label === "Zoom eşiği")?.pass).toBe(false);
    expect(pack?.rules.find((rule) => rule.label === "Yazısız ana kare")?.pass).toBe(false);
    expect(pack?.markdown).toContain("kaldı");
  });
});

describe("teknik çizim", () => {
  it("ölçü ve montaj metnini svg içine yazar, betik sızdırmaz", () => {
    const pack = buildTechnicalDrawing({
      productName: 'Raf <script>',
      widthMm: 120,
      heightMm: 80,
      depthMm: 40,
      material: "Kayın",
      steps: "Ayağı yuvaya oturt\nVidayı sık",
    });
    expect(pack?.svg).toContain("120 mm");
    expect(pack?.svg).toContain("80 mm");
    expect(pack?.svg).toContain("40 mm");
    expect(pack?.svg).toContain("Montaj ve kullanım");
    expect(pack?.svg).toContain("1. Ayağı yuvaya oturt");
    expect(pack?.svg).toContain("&lt;script&gt;");
    expect(pack?.svg.includes("<script")).toBe(false);
    expect(pack?.filename).toBe("olcu-semasi.svg");
  });
});

describe("mini saas", () => {
  it("kargo hesabını html, react ve zip olarak basar", () => {
    const pack = buildSaasWidget({
      widget: "cargo",
      title: "Kargo desi",
      detail: "Paket ölçüsü santimetredir.",
    });
    expect(pack?.html).toContain("/ 3000");
    expect(pack?.html).toContain("<form");
    expect(pack?.html).not.toContain("<script src");
    expect(pack?.react).toContain("export function HesapWidget");
    expect(pack?.react).toContain("/ 3000");
    const zip = pack?.zip ?? new Uint8Array();
    expect([...zip.slice(-22, -18)]).toEqual([0x50, 0x4b, 0x05, 0x06]);
    const files = readStoreZip(zip);
    expect(files.map((file) => file.name)).toEqual(["index.html", "widget.js", "App.jsx", "README.txt"]);
    expect(files[0]?.text).toContain("Desi");
    expect(pack?.html).not.toMatch(/₺|\bTL\b/);
  });

  it("sayaç ve api adresini kapıda tutar", () => {
    expect(readCounterDeadline("2026-12-31")).toBe("2026-12-31T00:00:00");
    expect(readCounterDeadline("yarın")).toBeNull();
    expect(readCounterDeadline("2026-02-31")).toBeNull();
    expect(readApiUrl("https://ornek.com/stok.json")).toBe("https://ornek.com/stok.json");
    expect(readApiUrl("http://ornek.com/stok.json")).toBeNull();
    expect(readApiUrl("javascript:alert(1)")).toBeNull();
    const counter = buildProStudio("saas-builder", {
      widget: "counter",
      title: "Kış sayacı",
      detail: "2026-12-31",
    });
    expect(counter.ok).toBe(true);
    if (counter.ok) {
      expect(counter.pack.html).toContain("2026-12-31T00:00:00");
      expect(counter.pack.filename).toBe("mini-saas.zip");
    }
    const rejected = buildProStudio("saas-builder", {
      widget: "api",
      title: "Stok oku",
      detail: "http://ornek.com/stok.json",
    });
    expect(rejected).toEqual({ ok: false, error: "Betik adresi https ile başlamalı." });
  });

  it("sipariş formu kanal gönderimi yazmaz", () => {
    const built = buildProStudio("saas-builder", {
      widget: "order",
      title: "Özel sipariş",
      detail: "Atölye notu",
    });
    expect(built.ok).toBe(true);
    if (built.ok) {
      expect(built.pack.html).toContain('id="siparis"');
      expect(built.pack.html).toContain("Kanal gönderimi bu sayfada yok");
      expect(built.pack.body.length).toBeLessThanOrEqual(20000);
    }
  });
});

describe("uzman tezgâh yüzeyi", () => {
  it("çalışma tezgâhı üç aracı ve teslimat düğmesini taşır", () => {
    const workbench = readFileSync(join(ROOT, "components/tezgah/workbench.tsx"), "utf8");
    const preview = readFileSync(join(ROOT, "components/tezgah/pro-studio-preview.tsx"), "utf8");
    expect(workbench).toContain("buildProStudio");
    expect(workbench).toContain("Stüdyoyu Üret");
    expect(workbench).toContain("Şemayı Üret");
    expect(workbench).toContain("Bileşeni Üret");
    expect(preview).toContain("Teslimat Olarak Ekle");
    expect(preview).toContain('sandbox="allow-scripts"');
    expect(preview).toContain(".svg İndir");
    expect(preview).toContain(".zip İndir");
    expect(preview).toContain("/api/career/desk");
  });
});
