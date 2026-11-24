import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildProStudio } from "@/lib/tezgah/pro/build";
import {
  buildSaasInstallGuide,
  buildSaasWidget,
  readApiUrl,
  readCounterDeadline,
  SAAS_INSTALL_GUIDE_HEADING,
} from "@/lib/tezgah/pro/saas-builder";
import { buildStudioPhoto } from "@/lib/tezgah/pro/studio-photo";
import { buildTechnicalDrawing } from "@/lib/tezgah/pro/technical-drawing";
import { readStoreZip } from "@/lib/tezgah/pro/zip";

const ROOT = process.cwd();

describe("görsel stüdyo", () => {
  it("trendyol beyaz 2:3 hedefini basar ve alt metin paketini sıralar", () => {
    const pack = buildStudioPhoto({
      productName: "Bez çanta",
      features: "Yıkanabilir kanvas, 30 cm sap",
      scene: "trendyol-white",
      galleryCount: 4,
    });
    expect(pack).not.toBeNull();
    expect(pack?.rules.every((rule) => rule.pass)).toBe(true);
    expect(pack?.standardLabel).toContain("Hedef Pazaryeri Standardı");
    expect(pack?.targetWidthPx).toBe(1200);
    expect(pack?.targetHeightPx).toBe(1800);
    expect(pack?.gallery.map((slot) => slot.role)[0]).toBe("Ana görsel");
    expect(pack?.altTexts).toHaveLength(4);
    expect(pack?.markdown).toContain("Hedef Pazaryeri Standardı");
    expect(pack?.markdown).not.toContain("Ölçülen kare");
    expect(pack?.prompt).toContain("2:3");
    expect(pack?.markdown).not.toMatch(/₺|\bTL\b/);
  });

  it("amazon sahnesi 1:1 hedef standardını taşır", () => {
    const pack = buildStudioPhoto({
      productName: "Bez çanta",
      features: "Ham keten",
      scene: "amazon-white",
      galleryCount: 3,
    });
    expect(pack?.aspectRatio).toBe("1:1");
    expect(pack?.targetWidthPx).toBe(1600);
    expect(pack?.standardLabel).toContain("Amazon 1:1");
    expect(pack?.markdown).not.toContain("Ölçülen kare");
  });

  it("tarayıcı-içi buildProStudio studio-photo'yu sunucuya yönlendirir", () => {
    const rejected = buildProStudio("studio-photo", {
      productName: "Bez çanta",
      features: "Kanvas",
      scene: "trendyol-white",
      galleryCount: "4",
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) {
      expect(rejected.error).toContain("sunucuda");
    }
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
    expect(pack?.svg).toContain("Ön Görünüş");
    expect(pack?.svg).toContain("Yan Görünüş");
    expect(pack?.svg).toContain("Üst Görünüş");
    expect(pack?.svg).toContain("Montaj / İşlem Adımları");
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
      platform: "html",
      title: "Kargo desi",
      detail: "Paket ölçüsü santimetredir.",
      feature: "Ürün sayfasına desi hesaplayıcı",
    });
    expect(pack?.html).toContain("/ 3000");
    expect(pack?.html).toContain("<form");
    expect(pack?.html).not.toContain("<script src");
    expect(pack?.react).toContain("export function HesapWidget");
    expect(pack?.react).toContain("/ 3000");
    const zip = pack?.zip ?? new Uint8Array();
    expect([...zip.slice(-22, -18)]).toEqual([0x50, 0x4b, 0x05, 0x06]);
    const files = readStoreZip(zip);
    expect(files.map((file) => file.name)).toEqual([
      "index.html",
      "widget.js",
      "App.jsx",
      "KURULUM_REHBERI.md",
      "README.txt",
    ]);
    const guide = files.find((file) => file.name === "KURULUM_REHBERI.md")?.text ?? "";
    expect(guide).toContain(SAAS_INSTALL_GUIDE_HEADING);
    expect(guide).toContain("## Adım 1");
    expect(guide).toContain("Genel HTML");
    expect(pack?.installGuide).toContain("Ürün sayfasına desi hesaplayıcı");
    expect(pack?.installGuide).not.toContain(`# ${SAAS_INSTALL_GUIDE_HEADING}`);
    expect(files[0]?.text).toContain("Desi");
    expect(pack?.html).not.toMatch(/₺|\bTL\b/);
  });

  it("wordpress ve react kurulum rehberlerini ayırır", () => {
    const wp = buildSaasInstallGuide({
      platform: "wordpress",
      widget: "order",
      title: "Form",
      feature: "İletişim",
    });
    expect(wp).toContain("Özel HTML bloğu");
    const react = buildSaasInstallGuide({
      platform: "react",
      widget: "cargo",
      title: "Desi",
      feature: "Hesap",
    });
    expect(react).toContain("App.jsx");
    expect(react).toContain("npm run dev");
  });

  it("sayaç ve api adresini kapıda tutar", () => {
    expect(readCounterDeadline("2026-12-31")).toBe("2026-12-31T00:00:00");
    expect(readCounterDeadline("yarın")).toBeNull();
    expect(readCounterDeadline("2026-02-31")).toBeNull();
    expect(readApiUrl("https://ornek.com/stok.json")).toBe("https://ornek.com/stok.json");
    expect(readApiUrl("http://ornek.com/stok.json")).toBeNull();
    expect(readApiUrl("javascript:alert(1)")).toBeNull();
    const counter = buildProStudio("saas-builder", {
      platform: "react",
      feature: "Kampanya geri sayımı",
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
      platform: "html",
      feature: "Stok okuyucu",
      widget: "api",
      title: "Stok oku",
      detail: "http://ornek.com/stok.json",
    });
    expect(rejected).toEqual({ ok: false, error: "Betik adresi https ile başlamalı." });
  });

  it("sipariş formu kanal gönderimi yazmaz", () => {
    const built = buildProStudio("saas-builder", {
      platform: "wordpress",
      feature: "Sipariş notu formu",
      widget: "order",
      title: "Özel sipariş",
      detail: "Atölye notu",
    });
    expect(built.ok).toBe(true);
    if (built.ok) {
      expect(built.pack.html).toContain('id="siparis"');
      expect(built.pack.html).toContain("Kanal gönderimi bu sayfada yok");
      expect(built.pack.html?.length ?? 0).toBeLessThanOrEqual(20000);
      expect(built.pack.body).toContain("saas-builder-v1");
      expect(built.pack.widgetJs).toContain("FEATURE");
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
    expect(workbench).toContain("/api/tezgah/studio-photo");
    expect(preview).toContain("Teslimat Olarak Ekle");
    expect(preview).toContain('sandbox="allow-scripts"');
    expect(preview).toContain(".svg İndir");
    expect(preview).toContain(".zip İndir");
    expect(preview).toContain("data-pro-install-guide");
    expect(preview).toContain("/api/career/desk");
    const saas = readFileSync(join(ROOT, "lib/tezgah/catalog.ts"), "utf8");
    expect(saas).toContain("İstediğin özellik / bileşen");
    expect(saas).toContain("SAAS_PLATFORMS");
  });
});
