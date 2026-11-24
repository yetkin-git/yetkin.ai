import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TEZGAH_FAIL_MESSAGE } from "@/lib/tezgah/catalog";
import {
  studioPhotoPazaryeriHandoffHref,
  studioPhotoReklamHandoffHref,
} from "@/lib/tezgah/pro/studio-photo-bridges";
import { generateStudioPhotoPack } from "@/lib/tezgah/pro/studio-photo-engine";
import {
  buildStudioPhoto,
  buildStudioPhotoZip,
  encodeStudioPhotoArchive,
  parseStudioPhotoArchive,
  readPngDimensions,
  STUDIO_PHOTO_IMAGE_FILENAME,
  STUDIO_PHOTO_ZIP_FILENAME,
} from "@/lib/tezgah/pro/studio-photo";
import { STUDIO_SCENES } from "@/lib/tezgah/pro/options";
import { readStoreZipEntries } from "@/lib/tezgah/pro/zip";
import { peekTezgahQuota, resetTezgahQuotaForTests } from "@/lib/tezgah/quota";

const NOW = new Date("2026-11-24T12:00:00+03:00");
const ACTOR = "guest:studio-photo-station";

/** 1×1 PNG (IHDR width=1 height=1). */
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function readSrc(rel: string): string {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

describe("studio-photo istasyonu — generateImage, iade, dürüst standart, köprü", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("generateImage doğru pazaryeri en-boy oranıyla çalışır ve PNG/base64 üretir", async () => {
    let seenAspect: string | undefined;
    const result = await generateStudioPhotoPack(
      {
        actorId: ACTOR,
        guest: true,
        request: {
          productName: "Bez çanta",
          features: "Yıkanabilir kanvas, 30 cm sap",
          scene: "trendyol-white",
          galleryCount: 4,
        },
      },
      {
        now: () => NOW,
        generate: async (input) => {
          seenAspect = input.aspectRatio;
          expect(input.prompt).toContain("Bez çanta");
          expect(input.prompt).toContain("no typography");
          return {
            mimeType: "image/png",
            dataBase64: TINY_PNG_BASE64,
            model: "gemini-3.1-flash-image",
            provider: "gemini",
            usage: { promptTokens: 8, completionTokens: 1, totalTokens: 9 },
          };
        },
      },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(seenAspect).toBe("2:3");
    expect(result.imageBase64).toBe(TINY_PNG_BASE64);
    expect(result.dataUrl).toContain("data:image/png;base64,");
    expect(result.mimeType).toBe("image/png");
    expect(result.pack.aspectRatio).toBe("2:3");
    expect(result.pack.targetWidthPx).toBe(1200);
    expect(result.pack.targetHeightPx).toBe(1800);
    expect(result.pack.standardLabel).toContain("Hedef Pazaryeri Standardı");
    expect(result.pack.markdown).not.toContain("Ölçülen kare");
    expect(result.pack.producedWidthPx).toBe(1);
    expect(result.pack.producedHeightPx).toBe(1);
    expect(result.zipBase64.length).toBeGreaterThan(40);
    expect(result.remaining).toBe(2);

    let amazonAspect: string | undefined;
    const amazon = await generateStudioPhotoPack(
      {
        actorId: `${ACTOR}-amazon`,
        guest: true,
        request: {
          productName: "Bez çanta",
          features: "Ham keten",
          scene: "amazon-white",
          galleryCount: 3,
        },
      },
      {
        now: () => NOW,
        generate: async (input) => {
          amazonAspect = input.aspectRatio;
          return {
            mimeType: "image/png",
            dataBase64: TINY_PNG_BASE64,
            model: "gemini-3.1-flash-image",
            provider: "gemini",
            usage: { promptTokens: 4, completionTokens: 1, totalTokens: 5 },
          };
        },
      },
    );
    expect(amazon.ok).toBe(true);
    expect(amazonAspect).toBe("1:1");

    expect(readPngDimensions(TINY_PNG_BASE64)).toEqual({ width: 1, height: 1 });
    expect(STUDIO_SCENES.map((scene) => scene.value)).toEqual([
      "trendyol-white",
      "amazon-white",
      "lifestyle",
      "ad-square",
    ]);
  });

  it("sağlayıcı hatasında kota iadesi tetiklenir", async () => {
    const failed = await generateStudioPhotoPack(
      {
        actorId: `${ACTOR}-fail`,
        guest: true,
        request: {
          productName: "Bez çanta",
          features: "Kanvas",
          scene: "ad-square",
          galleryCount: 3,
        },
      },
      {
        now: () => NOW,
        generate: async () => null,
      },
    );
    expect(failed.ok).toBe(false);
    if (failed.ok) {
      return;
    }
    expect(failed.status).toBe(503);
    expect(failed.error).toBe(TEZGAH_FAIL_MESSAGE);
    expect(failed.remaining).toBe(3);

    const after = await peekTezgahQuota(`${ACTOR}-fail`, true, NOW, "lite");
    expect(after.remaining).toBe(3);

    const empty = await generateStudioPhotoPack(
      {
        actorId: `${ACTOR}-empty`,
        guest: true,
        request: {
          productName: "Bez çanta",
          features: "Kanvas",
          scene: "lifestyle",
          galleryCount: 3,
        },
      },
      {
        now: () => NOW,
        generate: async () => ({
          mimeType: "image/png",
          dataBase64: "   ",
          model: "gemini-3.1-flash-image",
          provider: "gemini",
          usage: { promptTokens: 1, completionTokens: 0, totalTokens: 1 },
        }),
      },
    );
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.remaining).toBe(3);
    }
  });

  it("yanıltıcı Ölçülen kare ifadesi kaldırılmıştır; Hedef Pazaryeri Standardı basılır", () => {
    const pack = buildStudioPhoto({
      productName: "Bez çanta",
      features: "Yıkanabilir kanvas",
      scene: "trendyol-white",
      galleryCount: 4,
    });
    expect(pack).not.toBeNull();
    expect(pack?.standardLabel).toContain("Hedef Pazaryeri Standardı");
    expect(pack?.standardLabel).toContain("1200×1800");
    expect(pack?.markdown).toContain("Hedef Pazaryeri Standardı");
    expect(pack?.markdown).not.toContain("Ölçülen kare");
    expect(pack?.rules.every((rule) => !rule.detail.includes("Ölçülen kare"))).toBe(true);

    const src = readSrc("lib/tezgah/pro/studio-photo.ts");
    expect(src).not.toContain("Ölçülen kare");
    expect(src).toContain("Hedef Pazaryeri Standardı");

    const catalog = readSrc("lib/tezgah/catalog.ts");
    expect(catalog).toContain("Hedef Pazaryeri Standardı");
    expect(catalog).not.toContain('name: "widthPx"');
    expect(catalog).toContain('"studio-photo": "lite"');
  });

  it(".png / .zip indirme + pazaryeri / reklam köprüleri mühürlüdür", () => {
    const pack = buildStudioPhoto({
      productName: "Bez çanta",
      features: "Kanvas",
      scene: "trendyol-white",
      galleryCount: 4,
    });
    expect(pack).not.toBeNull();
    const imageBytes = Buffer.from(TINY_PNG_BASE64, "base64");
    const zip = buildStudioPhotoZip({ imageBytes: new Uint8Array(imageBytes), pack: pack! });
    const entries = readStoreZipEntries(zip);
    expect(entries.map((row) => row.name)).toEqual([
      STUDIO_PHOTO_IMAGE_FILENAME,
      "seo-alt-metinleri.md",
      "galeri-kilavuzu.md",
      "gorsel-studyo.md",
    ]);
    expect(entries[0]?.data.byteLength).toBe(imageBytes.byteLength);

    const archive = encodeStudioPhotoArchive({
      productName: "Bez çanta",
      pack: pack!,
      mimeType: "image/png",
      imageBase64: TINY_PNG_BASE64,
    });
    const parsed = parseStudioPhotoArchive(archive);
    expect(parsed?.imageBase64).toBe(TINY_PNG_BASE64);
    expect(parsed?.standardLabel).toContain("Hedef Pazaryeri Standardı");

    const pazaryeri = studioPhotoPazaryeriHandoffHref({
      productName: "Bez çanta",
      scene: "trendyol-white",
      features: "Kanvas",
    });
    expect(pazaryeri).toContain("tool=pazaryeri");
    expect(pazaryeri).toContain("market=trendyol");
    expect(pazaryeri).toContain("products=");

    const reklam = studioPhotoReklamHandoffHref({
      productName: "Bez çanta",
      sceneLabel: "Trendyol 2:3 Beyaz Fon",
      features: "Kanvas",
    });
    expect(reklam).toContain("tool=reklam");
    expect(reklam).toContain("businessName=");
    expect(reklam).toContain("offer=");

    const preview = readSrc("components/tezgah/pro-studio-preview.tsx");
    expect(preview).toContain("Görseli İndir (.png)");
    expect(preview).toContain("Stüdyo Paketi İndir (.zip");
    expect(preview).toContain("Kılavuzu İndir (.md)");
    expect(preview).toContain("Pazaryeri Kataloğuna Ekle (pazaryeri)");
    expect(preview).toContain("Bu Görselle Reklam Paketi Oluştur (reklam)");
    expect(preview).toContain("data-studio-pazaryeri-handoff");
    expect(preview).toContain("data-studio-reklam-handoff");
    expect(preview).toContain("data-studio-download-png");
    expect(preview).toContain("data-studio-download-zip");

    const portfolio = readSrc("components/tezgah/output-portfolio.tsx");
    expect(portfolio).toContain('toolKey === "studio-photo"');
    expect(portfolio).toContain("data-studio-archive-png");
    expect(portfolio).toContain("data-studio-archive-zip");
    expect(portfolio).toContain("parseStudioPhotoArchive");

    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("/api/tezgah/studio-photo");
    expect(workbench).toContain("Stüdyoyu Üret");

    const route = readSrc("app/api/tezgah/studio-photo/route.ts");
    expect(route).toContain('export const auth = "session"');
    expect(route).toContain("generateStudioPhotoPack");
    expect(route).toContain("recordSignedTezgahOutput");
    expect(route).toContain("readTezgahCommandKey");

    const engine = readSrc("lib/tezgah/pro/studio-photo-engine.ts");
    expect(engine).toContain("generateImage");
    expect(engine).toContain("refundTezgahQuota");
    expect(engine).toContain("aspectRatio");
    expect(engine).toContain("AI_TOKEN_SOURCES.TEZGAH");

    expect(STUDIO_PHOTO_ZIP_FILENAME).toBe("studyo-paketi.zip");
  });
});
