#!/usr/bin/env tsx
/**
 * Tur 3 — cue slayt fırını. SVG/HTML şablon → `public/academy/cinema/{lessonKey}-cue-{N}.jpg`.
 * İzlemede generate yok. Operatör bake; git’e dondurulmuş JPG.
 *
 *   npx tsx scripts/render-academy-cinema-cues.ts
 *   npx tsx scripts/render-academy-cinema-cues.ts --key=05_prompt_practice-1
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type BrowserContext } from "@playwright/test";
import {
  academyCinemaCueSlideFileName,
  listAcademyCinemaCueSlides,
  type AcademyCinemaCueSlide,
} from "@/lib/academy/cinema-cue-catalog";
import { renderAcademyCinemaCueHtml } from "./render-academy-cinema-html";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "public", "academy", "cinema");
const WIDTH = 1920;
const HEIGHT = 1080;
const JPEG_QUALITY = 82;
const WORKERS = 4;

function parseKeyFlag(argv: readonly string[]): string | null {
  for (const arg of argv) {
    if (arg.startsWith("--key=")) {
      const value = arg.slice("--key=".length).trim();
      return value.length > 0 ? value : null;
    }
  }
  return null;
}

async function renderSlide(slide: AcademyCinemaCueSlide, context: BrowserContext): Promise<string> {
  const page = await context.newPage();
  try {
    await page.setContent(renderAcademyCinemaCueHtml(slide), { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    const fileName = academyCinemaCueSlideFileName(slide);
    const outPath = join(OUT_DIR, fileName);
    const buffer = await page.screenshot({
      type: "jpeg",
      quality: JPEG_QUALITY,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });
    writeFileSync(outPath, buffer);
    return fileName;
  } finally {
    await page.close();
  }
}

async function main(): Promise<void> {
  const onlyKey = parseKeyFlag(process.argv.slice(2));
  const slides = listAcademyCinemaCueSlides().filter((slide) => (onlyKey ? slide.lessonKey === onlyKey : true));
  if (slides.length === 0) {
    process.stderr.write(`cinema cue bake: slayt yok${onlyKey ? ` (${onlyKey})` : ""}.\n`);
    process.exitCode = 1;
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const written: string[] = [];
  try {
    for (let offset = 0; offset < slides.length; offset += WORKERS) {
      const batch = slides.slice(offset, offset + WORKERS);
      const names = await Promise.all(batch.map((slide) => renderSlide(slide, context)));
      written.push(...names);
      process.stdout.write(`cinema cue bake ${written.length}/${slides.length}\n`);
    }
  } finally {
    await context.close();
    await browser.close();
  }
  process.stdout.write(`cinema cue bake OK — ${written.length} JPG → public/academy/cinema/\n`);
}

void main();
