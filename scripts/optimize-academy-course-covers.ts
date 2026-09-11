#!/usr/bin/env tsx
/**
 * Vitrin kapak fırını — Tur 3 eye JPG → WebP + AVIF (1280 + 960 + 640).
 * Ders posteri JPG durur; yalnız `academyCourseCoverPath` dosyaları yazılır.
 * 1280×720 kanon korunur. 640/960 `-{width}w` soneki immutable cache’i kırmaz (yeni URL).
 *
 *   npx tsx scripts/optimize-academy-course-covers.ts
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

type SharpImage = {
  rotate: () => SharpImage;
  clone: () => SharpImage;
  resize: (width: number, height: number) => SharpImage;
  webp: (opts: { quality: number; effort: number; smartSubsample: boolean }) => SharpImage;
  avif: (opts: { quality: number; effort: number; chromaSubsampling: string }) => SharpImage;
  toBuffer: () => Promise<Buffer>;
};

const nodeRequire = createRequire(import.meta.url);
const sharp = nodeRequire("sharp") as unknown as (input: string) => SharpImage;

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "public", "academy", "cinema");
const WEBP_QUALITY = 70;
const AVIF_QUALITY = 62;
const COVER_WIDTHS = [
  { width: 1280, height: 720, suffix: "" },
  { width: 960, height: 540, suffix: "-960w" },
  { width: 640, height: 360, suffix: "-640w" },
] as const;

/** `lib/academy/course-cover.ts` GROWTH_CINEMA_COVER_FILE ile aynı taban adlar. */
const COVER_STEMS = [
  "01_office_ai-1-eye",
  "02_ecommerce_ai-1-eye",
  "03_social_media_ai-reels-1-eye",
  "04_chatbot_nocode-1-eye",
  "05_prompt_practice-1-eye",
] as const;

async function bakeStem(stem: string): Promise<void> {
  const jpg = join(OUT_DIR, `${stem}.jpg`);
  const image = sharp(jpg).rotate();
  for (const slot of COVER_WIDTHS) {
    const frame = slot.suffix ? image.clone().resize(slot.width, slot.height) : image.clone();
    const webp = await frame.clone().webp({ quality: WEBP_QUALITY, effort: 6, smartSubsample: true }).toBuffer();
    const avif = await frame
      .clone()
      .avif({ quality: AVIF_QUALITY, effort: 6, chromaSubsampling: "4:2:0" })
      .toBuffer();
    const outStem = `${stem}${slot.suffix}`;
    writeFileSync(join(OUT_DIR, `${outStem}.webp`), webp);
    writeFileSync(join(OUT_DIR, `${outStem}.avif`), avif);
    process.stdout.write(
      `${outStem}  ${slot.width}×${slot.height}  webp ${(webp.length / 1024).toFixed(1)}KB  avif ${(avif.length / 1024).toFixed(1)}KB\n`,
    );
  }
}

async function main(): Promise<void> {
  for (const stem of COVER_STEMS) {
    await bakeStem(stem);
  }
  process.stdout.write("course cover bake OK — WebP + AVIF srcset → public/academy/cinema/\n");
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
