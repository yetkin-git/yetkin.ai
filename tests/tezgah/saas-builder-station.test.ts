import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildProStudio } from "@/lib/tezgah/pro/build";
import { SAAS_WIDGETS } from "@/lib/tezgah/pro/options";
import {
  archiveToSaasZip,
  buildSaasWidget,
  encodeSaasBuilderArchive,
  guessSaasWidgetFromFeature,
  parseSaasBuilderArchive,
  readApiUrl,
  SAAS_BUILDER_ARCHIVE_KIND,
  SAAS_ZIP_FILENAME,
} from "@/lib/tezgah/pro/saas-builder";
import {
  SAAS_BUILDER_ECOMMERCE_HREF,
  saasBuilderDukkanHandoffHref,
} from "@/lib/tezgah/pro/saas-builder-bridges";
import { readStoreZip } from "@/lib/tezgah/pro/zip";

const ROOT = process.cwd();

function readSrc(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("Masa 8 — saas-builder istasyonu (68 → 89+)", () => {
  it("8 widget şablonu ve feature serbest metni üretilen HTML/JS/React kodunu yönlendirir", () => {
    expect(SAAS_WIDGETS).toHaveLength(8);
    expect(SAAS_WIDGETS.map((row) => row.value)).toEqual([
      "cargo",
      "margin",
      "quote",
      "order",
      "booking",
      "counter",
      "faq",
      "api",
    ]);

    expect(guessSaasWidgetFromFeature("kâr marjı ve KDV komisyon hesabı")).toBe("margin");
    expect(guessSaasWidgetFromFeature("randevu ve ön görüşme formu")).toBe("booking");
    expect(guessSaasWidgetFromFeature("etkileşimli SSS karar asistanı")).toBe("faq");
    expect(guessSaasWidgetFromFeature("kargo desi hesaplayıcı")).toBe("cargo");

    const feature = "Stok uyarı şeridi, kampanya geri sayım";
    const pack = buildSaasWidget({
      widget: "counter",
      platform: "html",
      title: "Kış kampanyası",
      detail: "2026-12-31",
      feature,
    });
    expect(pack).not.toBeNull();
    if (!pack) {
      return;
    }
    expect(pack.html).toContain('data-saas-feature=""');
    expect(pack.html).toContain("Stok uyarı şeridi");
    expect(pack.widgetJs).toContain(JSON.stringify(feature));
    expect(pack.react).toContain(JSON.stringify(feature));
    expect(pack.react).toContain("data-saas-feature");

    const margin = buildProStudio("saas-builder", {
      platform: "react",
      feature: "pazaryeri komisyon ve kâr marjı",
      widget: "",
      title: "Marj paneli",
      detail: "Maliyet ve satış girilir.",
    });
    expect(margin.ok).toBe(true);
    if (margin.ok) {
      expect(margin.pack.saasWidget).toBe("margin");
      expect(margin.pack.html).toContain("id=\"marj\"");
      expect(margin.pack.html).toContain("pazaryeri komisyon");
      expect(margin.pack.widgetJs).toContain("FEATURE");
    }

    for (const widget of SAAS_WIDGETS) {
      const detail =
        widget.value === "counter"
          ? "2026-12-31"
          : widget.value === "api"
            ? "https://ornek.com/duyuru.json"
            : "Kısa açıklama metni.";
      const built = buildProStudio("saas-builder", {
        platform: "html",
        feature: `${widget.label} özel gereksinim`,
        widget: widget.value,
        title: widget.label.slice(0, 40),
        detail,
      });
      expect(built.ok, widget.value).toBe(true);
      if (built.ok) {
        expect(built.pack.html).toContain("data-saas-feature");
        expect(built.pack.react).toContain("data-saas-feature");
        expect(built.pack.zip).not.toBeNull();
      }
    }
  });

  it("XSS (<script>) ve güvensiz URL (http://, javascript:) engeller", () => {
    const pack = buildSaasWidget({
      widget: "order",
      platform: "html",
      title: 'Sipariş <script>alert(1)</script>',
      detail: 'Not <img onerror="x">',
      feature: 'WhatsApp form <script>kötü</script>',
    });
    expect(pack).not.toBeNull();
    if (!pack) {
      return;
    }
    expect(pack.html).toContain("&lt;script&gt;");
    expect(pack.html).not.toMatch(/<script>alert/);
    expect(pack.html).toContain("&lt;img");
    expect(pack.react).toContain(JSON.stringify('Sipariş <script>alert(1)</script>'));
    expect(pack.widgetJs).toContain(JSON.stringify('WhatsApp form <script>kötü</script>'));

    expect(readApiUrl("http://ornek.com/stok.json")).toBeNull();
    expect(readApiUrl("javascript:alert(1)")).toBeNull();
    expect(readApiUrl("https://ornek.com/stok.json")).toBe("https://ornek.com/stok.json");

    const rejected = buildProStudio("saas-builder", {
      platform: "html",
      feature: "Canlı JSON kartı",
      widget: "api",
      title: "Duyuru",
      detail: "http://ornek.com/stok.json",
    });
    expect(rejected).toEqual({ ok: false, error: "Betik adresi https ile başlamalı." });

    const jsUrl = buildProStudio("saas-builder", {
      platform: "html",
      feature: "Canlı JSON kartı",
      widget: "api",
      title: "Duyuru",
      detail: "javascript:alert(1)",
    });
    expect(jsUrl.ok).toBe(false);
  });

  it("arşive saas-builder-v1 tam kod yazar; çekmeceden .zip/.html/.jsx indirilebilir", () => {
    const built = buildProStudio("saas-builder", {
      platform: "wordpress",
      feature: "Sipariş & WhatsApp ön talep",
      widget: "order",
      title: "Atölye siparişi",
      detail: "WhatsApp metni hazırlanır.",
    });
    expect(built.ok).toBe(true);
    if (!built.ok) {
      return;
    }
    expect(built.pack.body).toContain(SAAS_BUILDER_ARCHIVE_KIND);
    expect(built.pack.body).not.toBe(built.pack.markdown);
    expect(built.pack.html).toContain('id="siparis"');
    expect(built.pack.widgetJs).toContain("FEATURE");
    expect(built.pack.react).toContain("SiparisFormu");
    expect(built.pack.zipFilename).toBe(SAAS_ZIP_FILENAME);

    const archive = parseSaasBuilderArchive(built.pack.body);
    expect(archive).not.toBeNull();
    if (!archive) {
      return;
    }
    expect(archive.html).toContain("data-saas-feature");
    expect(archive.widgetJs).toContain("WhatsApp");
    expect(archive.reactJsx).toContain("export function");
    expect(archive.guide).toContain("WordPress");

    const zip = archiveToSaasZip(archive);
    const files = readStoreZip(zip);
    expect(files.map((file) => file.name)).toEqual([
      "index.html",
      "widget.js",
      "App.jsx",
      "KURULUM_REHBERI.md",
      "README.txt",
    ]);
    expect(encodeSaasBuilderArchive(packFromArchive(archive))).toContain(SAAS_BUILDER_ARCHIVE_KIND);

    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain('built.pack.tool === "saas-builder"');
    expect(workbench).toContain("guessSaasWidgetFromFeature");
    // O8: tavan tek kaynaktan (`archive-guard`) gelir.
    expect(workbench).toContain("TEZGAH_OUTPUT_CONTENT_MAX");
    expect(workbench).not.toContain("200_000");

    const portfolio = readSrc("components/tezgah/output-portfolio.tsx");
    expect(portfolio).toContain("data-saas-archive-html");
    expect(portfolio).toContain("data-saas-archive-jsx");
    expect(portfolio).toContain("data-saas-archive-zip");
    expect(portfolio).toContain("data-saas-archive-preview");
    expect(portfolio).toContain('sandbox="allow-scripts"');
    expect(portfolio).toContain("parseSaasBuilderArchive");
  });

  it("dukkan ve E-Ticaret köprüleri özellik ön-dolgulu üretir", () => {
    const dukkan = saasBuilderDukkanHandoffHref({
      title: "Desi Hesaplayıcı",
      feature: "Kargo desi ve beden hesabı",
      detail: "Ürün sayfasına gömülür.",
    });
    expect(String(dukkan)).toContain("tool=dukkan");
    const params = new URL(String(dukkan), "https://yetkin.ai").searchParams;
    expect(params.get("businessName") ?? "").toContain("Desi");
    expect(params.get("services") ?? "").toContain("Kargo desi");
    expect(params.get("sector")).toBe("eticaret");
    expect(SAAS_BUILDER_ECOMMERCE_HREF).toBe("/panel/e-ticaret");

    const preview = readSrc("components/tezgah/pro-studio-preview.tsx");
    expect(preview).toContain("data-saas-bridges");
    expect(preview).toContain("data-saas-dukkan-handoff");
    expect(preview).toContain("data-saas-ecommerce");
    expect(preview).toContain("Dijital Dükkan Vitrinine Geç (dukkan)");
    expect(preview).toContain("E-Ticaret Mağaza Kokpitini Aç");
    expect(preview).toContain("data-saas-code-tabs");
    expect(preview).toContain("data-saas-tab-html");
    expect(preview).toContain("data-saas-tab-js");
    expect(preview).toContain("data-saas-tab-react");
    expect(preview).toContain("mini-saas.zip (5 dosya)");
    expect(preview).toContain('sandbox="allow-scripts"');
  });
});

function packFromArchive(archive: NonNullable<ReturnType<typeof parseSaasBuilderArchive>>) {
  return {
    filename: SAAS_ZIP_FILENAME as typeof SAAS_ZIP_FILENAME,
    html: archive.html,
    widgetJs: archive.widgetJs,
    react: archive.reactJsx,
    installGuide: archive.guide,
    files: [] as { name: string; text: string }[],
    zip: new Uint8Array(),
    summary: archive.summary,
    widget: archive.widget,
    feature: archive.feature,
    title: archive.title,
    detail: archive.detail,
    platform: archive.platform,
  };
}
