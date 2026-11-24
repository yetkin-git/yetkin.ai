import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DUKKAN_ECOMMERCE_HREF, dukkanReklamHandoffHref } from "@/lib/tezgah/dukkan/bridges";
import {
  DUKKAN_FILENAME,
  DUKKAN_PUBLISH_GUIDE_FILENAME,
  DUKKAN_SECTORS,
  DUKKAN_STRUCTURAL_SEALS,
  DUKKAN_ZIP_FILENAME,
} from "@/lib/tezgah/dukkan/copy";
import { generateDukkanPage } from "@/lib/tezgah/dukkan/engine";
import {
  buildDukkanPack,
  inspectDukkanDelivery,
  renderDukkanHtml,
} from "@/lib/tezgah/dukkan/render";
import {
  parseDukkanFaq,
  parseDukkanPackages,
  readDukkanDraft,
  type DukkanGenerateRequest,
} from "@/lib/tezgah/dukkan/schema";
import { crc32 } from "@/lib/tezgah/pro/zip";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const BASE: DukkanGenerateRequest = {
  businessName: "Karaoğlu Fırın",
  sector: "restoran",
  place: "Kadıköy",
  whatsapp: "0532 111 22 33",
  services: "Taze ekmek\nPoğaça\nSimit",
  tone: "dogal",
  packages: "Sabah Paketi | Poğaça + çay | 120 TL\nÖğle Menü | Çorba + ana yemek | 280 TL",
  hours: "Hafta içi 08:00–20:00",
  faq: "Teslimat var mı? | Aynı gün mahalle içi.\nPark yeri? | Cadde üzerinde.",
};

describe("Masa 3 — dukkan istasyonu (72 → 88+)", () => {
  it("on iki sektör yapısal mühürle basılır; sahte 100/100 yoktur", async () => {
    expect(DUKKAN_SECTORS).toHaveLength(12);
    expect(DUKKAN_STRUCTURAL_SEALS.map((seal) => seal.label)).toEqual([
      "Mobil Uyumlu (Viewport)",
      "Sıfır Script / XSS Korumalı",
      "WhatsApp & Telefon Dönüşüm Hattı",
      "Semantik SEO Başlık Yapısı",
    ]);

    for (const sector of DUKKAN_SECTORS) {
      const result = await generateDukkanPage({
        actorId: `guest:dukkan-station-${sector.id}`,
        guest: true,
        request: { ...BASE, sector: sector.id, packages: "", hours: "", faq: "" },
      });
      expect(result.ok, sector.id).toBe(true);
      if (!result.ok) {
        return;
      }
      expect(result.seals.every((seal) => seal.passed), sector.id).toBe(true);
      expect(result.html).not.toMatch(/100\s*\/\s*100|Öz-skor|ttfbMs\s*:\s*1/);
      expect(result.html).not.toMatch(/<script/i);
      expect("score" in result).toBe(false);
    }

    const renderSrc = readSrc("lib/tezgah/dukkan/render.ts");
    expect(renderSrc).not.toContain("ttfbMs: 1");
    expect(renderSrc).not.toContain("scoreHomepageHtml");
    expect(renderSrc).not.toContain("scored.score !== 100");

    const engineSrc = readSrc("lib/tezgah/dukkan/engine.ts");
    expect(engineSrc).not.toContain("score: 100");
    expect(engineSrc).toContain("seals");

    const preview = readSrc("components/tezgah/dukkan-preview.tsx");
    expect(preview).toContain("Yapısal kontrol mühürleri");
    expect(preview).not.toContain("Öz-skor");
    expect(preview).not.toContain("100 / 100");
  });

  it("isteğe bağlı fiyat kartı ve SSS XSS enjeksiyonunu engeller", () => {
    expect(parseDukkanPackages(BASE.packages)).toHaveLength(2);
    expect(parseDukkanFaq(BASE.faq)).toHaveLength(2);

    const poisoned: DukkanGenerateRequest = {
      ...BASE,
      packages: `<script>alert(1)</script> | <img src=x onerror=alert(1)> | 10 TL`,
      hours: `javascript:alert(1)`,
      faq: `Soru onerror=x | Cevap <script>evil</script>`,
    };
    const draft = readDukkanDraft(poisoned);
    expect(draft).not.toBeNull();
    if (!draft) {
      return;
    }
    const html = renderDukkanHtml(draft);
    expect(inspectDukkanDelivery(html).ok).toBe(true);
    expect(html).toContain("Vitrin paketleri");
    expect(html).toContain("Sık sorulanlar");
    expect(html).toContain("javascript&#58;alert(1)");
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/javascript\s*:/i);
    expect(html).not.toMatch(/<[^>]*\son[a-z0-9]+\s*=/i);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("onerror&#61;");
    expect(html).toContain("javascript&#58;");
    expect(html).not.toContain("application/ld+json");
  });

  it("zip paketinde index.html + yayınlama rehberi vardır", () => {
    const draft = readDukkanDraft(BASE);
    expect(draft).not.toBeNull();
    if (!draft) {
      return;
    }
    const pack = buildDukkanPack(draft);
    expect(pack.zipFilename).toBe(DUKKAN_ZIP_FILENAME);
    expect(pack.html).toContain("<!DOCTYPE html>");
    expect(pack.guide).toContain(DUKKAN_PUBLISH_GUIDE_FILENAME);
    expect(pack.guide).toContain("https");
    expect(pack.zip.length).toBeGreaterThan(200);
    expect(crc32(pack.zip)).toBeTypeOf("number");
    const asText = new TextDecoder().decode(pack.zip);
    expect(asText).toContain("index.html");
    expect(asText).toContain(DUKKAN_PUBLISH_GUIDE_FILENAME);
  });

  it("reklam handoff + e-ticaret köprüsü + arşiv html indirmesi mühürlüdür", () => {
    const href = dukkanReklamHandoffHref({
      businessName: "Karaoğlu Fırın",
      sector: "restoran",
      place: "Kadıköy",
      services: ["Taze ekmek", "Poğaça", "Simit"],
    });
    expect(href).toContain("tool=reklam");
    expect(href).toContain("businessName=");
    expect(href).toContain("Karao");
    expect(href).toContain("offer=");
    expect(DUKKAN_ECOMMERCE_HREF).toBe("/panel/e-ticaret");

    const preview = readSrc("components/tezgah/dukkan-preview.tsx");
    expect(preview).toContain("Bu Dükkan İçin Reklam Paketi Oluştur");
    expect(preview).toContain("E-Ticaret Mağazası Aç");
    expect(preview).toContain("data-dukkan-reklam-handoff");
    expect(preview).toContain("dukkanReklamHandoffHref");
    expect(preview).toContain("DUKKAN_FILENAME");
    expect(preview).toContain("DUKKAN_ZIP_FILENAME");
    expect(DUKKAN_FILENAME).toBe("dijital-dukkan.html");
    expect(DUKKAN_ZIP_FILENAME).toBe("dijital-dukkan.zip");

    const portfolio = readSrc("components/tezgah/output-portfolio.tsx");
    expect(portfolio).toContain('toolKey === "dukkan"');
    expect(portfolio).toContain(".html İndir");
    expect(portfolio).toContain("data-dukkan-archive-html");
    expect(portfolio).toContain("/api/tezgah/outputs/");

    const route = readSrc("app/api/tezgah/dukkan/generate/route.ts");
    expect(route).toContain("recordSignedTezgahOutput");
    expect(route).toContain('toolKey: "dukkan"');
    expect(route).toContain("outputContent: result.html");
    expect(route).toContain("seals");
    expect(route).toContain("zipBase64");
  });
});
