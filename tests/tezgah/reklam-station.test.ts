import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  allocateReklamBudget,
  REKLAM_DISCLAIMER,
  REKLAM_GOOGLE_CSV_FILENAME,
  REKLAM_GOOGLE_DESCRIPTION_MAX,
  REKLAM_GOOGLE_TITLE_MAX,
  REKLAM_META_CSV_FILENAME,
  REKLAM_VARIANTS,
} from "@/lib/tezgah/reklam/copy";
import { buildGoogleAdsCsv, buildMetaAdsCsv, reklamCsvCell } from "@/lib/tezgah/reklam/csv";
import { buildReklamDocx, buildReklamPdf } from "@/lib/tezgah/reklam/document";
import {
  reklamDukkanHandoffHref,
  reklamStudioPhotoHandoffHref,
} from "@/lib/tezgah/reklam/bridges";
import {
  parseSealedReklamMarkdown,
  reklamRejectsMetric,
  renderReklamMarkdown,
  sealReklamPackage,
} from "@/lib/tezgah/reklam/guard";
import { readReklamDraft } from "@/lib/tezgah/reklam/schema";
import type { ReklamPackage } from "@/lib/tezgah/reklam/types";

function readSrc(rel: string): string {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

function variantBlock(heading: string): string {
  return [
    `## ${heading}`,
    "### Google başlıklar",
    "- Taze ekmek Kadıköy",
    "- Sabah poğaça",
    "- Mahalle fırını",
    "### Google açıklamalar",
    "- Kadıköy'de taze ekmek ve poğaça. Bugün tezgaha yazın.",
    "- 199 TL ile ikinci poğaça. WhatsApp’tan yazın.",
    "### Meta başlık",
    "Kadıköy fırını",
    "### Meta metin",
    "Taze ekmek ve poğaça için dükkana bekleriz.",
    "### Anahtar kelimeler",
    "- kadıköy fırın",
    "- taze ekmek",
    "- poğaça",
    "### Negatif anahtar kelimeler",
    "- ucuz fırın",
    "- toptan un",
    "### Görsel brif",
    "Kadraj: tezgah üstü ekmek",
    "Görsel üstü yazı: Taze çıktı",
    "Gösterilmeyecek: fiyat etiketi",
  ].join("\n");
}

function modelMatrix(): string {
  return REKLAM_VARIANTS.map((row) => variantBlock(row.heading)).join("\n\n");
}

const DRAFT = readReklamDraft({
  businessName: "Karaoğlu Fırın",
  sector: "restoran",
  place: "Kadıköy, İstanbul",
  aim: "whatsapp",
  offer: "199 TL ile ikinci poğaça",
  budgetTl: "1000",
});

function sealedPack(): ReklamPackage {
  const pack = sealReklamPackage(modelMatrix(), DRAFT);
  if (!pack) {
    throw new Error("beklenen mühür başarısız");
  }
  return pack;
}

describe("reklam istasyonu — A/B matris, kalkan, CSV, köprü", () => {
  it("üç varyantlı A/B matrisi ve 30/90 karakter sınırı mühürlüdür", () => {
    const pack = sealedPack();
    expect(pack.variants).toHaveLength(3);
    expect(pack.variants.map((row) => row.id)).toEqual(["A", "B", "C"]);
    expect(pack.variants[0]?.angle).toContain("Sorun");
    expect(pack.variants[1]?.angle).toContain("Güven");
    expect(pack.variants[2]?.angle).toContain("Teklif");
    for (const variant of pack.variants) {
      for (const headline of variant.googleHeadlines) {
        expect([...headline].length).toBeLessThanOrEqual(REKLAM_GOOGLE_TITLE_MAX);
      }
      for (const description of variant.googleDescriptions) {
        expect([...description].length).toBeLessThanOrEqual(REKLAM_GOOGLE_DESCRIPTION_MAX);
      }
    }
    expect(pack.budget.coldTestTl).toBe(600);
    expect(pack.budget.remarketingTl).toBe(250);
    expect(pack.budget.scaleTl).toBe(150);
    expect(allocateReklamBudget(null).coldTestTl).toBeNull();
    expect(allocateReklamBudget(null).coldTestPct).toBe(60);

    const markdown = renderReklamMarkdown(pack);
    expect(markdown).toContain("## Varyant A — Sorun & Çözüm");
    expect(markdown).toContain("Soğuk Test: %60 · 600 TL");
    expect(markdown).toContain(REKLAM_DISCLAIMER);

    const overflow = sealReklamPackage(
      modelMatrix().replace("Taze ekmek Kadıköy", "A".repeat(45)),
      DRAFT,
    );
    expect(overflow).not.toBeNull();
    expect([...(overflow?.variants[0]?.googleHeadlines[0] ?? "")].length).toBe(30);
  });

  it("sahte ROAS / tıklama / para iddiasını guard reddeder", () => {
    expect(reklamRejectsMetric("ROAS 4.2")).toBe(true);
    expect(reklamRejectsMetric("CTR %3")).toBe(true);
    expect(reklamRejectsMetric("CPC 12 TL")).toBe(true);
    expect(reklamRejectsMetric("10 bin gösterim")).toBe(true);
    expect(reklamRejectsMetric("500 tıklama")).toBe(true);
    expect(reklamRejectsMetric("Taze ekmek Kadıköy")).toBe(false);

    const poisoned = modelMatrix().replace(
      "- Taze ekmek Kadıköy",
      "- ROAS 5 ile 10 bin tıklama",
    );
    const sealed = sealReklamPackage(poisoned, DRAFT);
    // Üç başlık gerekir; zehirli satır düşünce varyant A kırılır → null / kota iadesi yolu
    expect(sealed).toBeNull();

    const moneyPoison = modelMatrix().replace(
      "Taze ekmek ve poğaça için dükkana bekleriz.",
      "Kampanya bütçesi 50.000 TL ve satış garantisi.",
    );
    expect(sealReklamPackage(moneyPoison, DRAFT)).toBeNull();
  });

  it("Google Ads ve Meta Ads CSV formül enjeksiyonunu kaçırır ve UTF-8 BOM taşır", () => {
    const pack = sealedPack();
    pack.variants[0]!.googleHeadlines[0] = "=SUM(A1:A9)";
    pack.variants[0]!.metaPrimary = "+cmd|' /C calc'!A0";
    pack.variants[0]!.keywords = ["@STS", "-1+1", "poğaça"];

    expect(reklamCsvCell("=SUM(A1:A9)")).toBe("'=SUM(A1:A9)");
    expect(reklamCsvCell("+hijack")).toBe("'+hijack");
    expect(reklamCsvCell("-1+1")).toBe("'-1+1");
    expect(reklamCsvCell("@STS")).toBe("'@STS");
    expect(reklamCsvCell("\tsecret")).toBe("'\tsecret");
    expect(reklamCsvCell("=SUM(1,2)")).toBe("\"'=SUM(1,2)\"");

    const google = buildGoogleAdsCsv(pack);
    const meta = buildMetaAdsCsv(pack);
    expect(google.charCodeAt(0)).toBe(0xfeff);
    expect(meta.charCodeAt(0)).toBe(0xfeff);
    expect(google).toContain("Campaign,Ad Group,Headline 1");
    expect(google).toContain("'=SUM(A1:A9)");
    expect(google).toContain("'@STS");
    expect(meta).toContain("Campaign Name,Ad Set Name,Ad Name,Primary Text");
    expect(meta).toContain("'+cmd|");
    expect(REKLAM_GOOGLE_CSV_FILENAME).toBe("google-ads-kampanya.csv");
    expect(REKLAM_META_CSV_FILENAME).toBe("meta-ads-kampanya.csv");

    const roundTrip = parseSealedReklamMarkdown(renderReklamMarkdown(sealedPack()));
    expect(roundTrip?.variants).toHaveLength(3);
    expect(buildReklamDocx(roundTrip!).byteLength).toBeGreaterThan(100);
    expect(buildReklamPdf(roundTrip!).byteLength).toBeGreaterThan(100);
  });

  it("dukkan / studio-photo handoff + arşiv indirmesi mühürlüdür", () => {
    const dukkan = reklamDukkanHandoffHref({
      businessName: "Karaoğlu Fırın",
      sector: "restoran",
      place: "Kadıköy",
      offer: "199 TL ile ikinci poğaça",
    });
    expect(dukkan).toContain("tool=dukkan");
    expect(dukkan).toContain("businessName=");
    expect(dukkan).toContain("services=");

    const studio = reklamStudioPhotoHandoffHref({
      businessName: "Karaoğlu Fırın",
      creativeBrief: "Kadraj: tezgah üstü ekmek | Görsel üstü yazı: Taze çıktı",
    });
    expect(studio).toContain("tool=studio-photo");
    expect(studio).toContain("productName=");
    expect(studio).toContain("features=");

    const preview = readSrc("components/tezgah/reklam-preview.tsx");
    expect(preview).toContain("Google Ads CSV İndir");
    expect(preview).toContain("Meta Ads CSV İndir");
    expect(preview).toContain("Word (.docx) İndir");
    expect(preview).toContain("PDF İndir");
    expect(preview).toContain("Bu Kampanya İçin Dijital Dükkan Kur");
    expect(preview).toContain("Reklam Görseli Hazırla");
    expect(preview).toContain("data-reklam-dukkan-handoff");
    expect(preview).toContain("data-reklam-studio-handoff");

    const portfolio = readSrc("components/tezgah/output-portfolio.tsx");
    expect(portfolio).toContain('toolKey === "reklam"');
    expect(portfolio).toContain("data-reklam-archive-google-csv");
    expect(portfolio).toContain("data-reklam-archive-meta-csv");
    expect(portfolio).toContain("buildGoogleAdsCsv");
    expect(portfolio).toContain("buildReklamDocx");

    const route = readSrc("app/api/tezgah/reklam/generate/route.ts");
    expect(route).toContain("recordSignedTezgahOutput");
    expect(route).toContain('toolKey: "reklam"');
    expect(route).toContain("outputContent: result.markdown");
    expect(route).toContain("googleCsv");
    expect(route).toContain("metaCsv");

    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("ReklamPreview");
    expect(workbench).toContain("budgetTl");
  });
});
