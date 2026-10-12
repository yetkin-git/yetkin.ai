#!/usr/bin/env tsx
/**
 * İngilizce metin taşıyan Junior kapaklarını yerelde nötr JPEG ile değiştirir.
 * Gemini çağrısı yoktur. Çizimde harf yoktur; Türkçe başlık yalnız Türkçe ders adından gelir.
 *
 *   npx tsx scripts/neutralize-junior-covers.ts
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { JUNIOR_FEN_LESSONS } from "@/lib/junior/content/fen";
import { JUNIOR_ING_LESSONS } from "@/lib/junior/content/ing";
import { JUNIOR_MAT_LESSONS } from "@/lib/junior/content/mat";
import { JUNIOR_SOSYAL_LESSONS } from "@/lib/junior/content/sosyal";
import { JUNIOR_TURKCE_LESSONS } from "@/lib/junior/content/turkce";
import { JUNIOR_COVER_PUBLIC_DIR } from "@/lib/junior/covers";

const require = createRequire(import.meta.url);
const WIDTH = 1280;
const HEIGHT = 720;

const sharp = require("sharp") as (
  input: Buffer,
) => {
  resize: (
    width: number,
    height: number,
    options: { fit: "cover"; position: "centre" },
  ) => {
    jpeg: (options: { quality: number; chromaSubsampling: "4:2:0" }) => {
      withMetadata: (options: { density: number }) => {
        toFile: (path: string) => Promise<void>;
      };
    };
  };
  metadata: () => Promise<{ width?: number; height?: number; format?: string }>;
};

/**
 * Katalog dışı kapaklar. Çekirdek ders kapakları metinsiz illüstrasyon olarak yeniden fırınlandı;
 * bu liste onları yeniden düz vektöre çevirmez.
 */
const ENGLISH_COVER_KEYS = [
  "jr_06_mat-4",
  "jr_06_mat-9",
  "jr_06_fen-3",
  "jr_06_fen-8",
  "jr_06_sosyal-19",
  "jr_06_ing_main-12",
  "jr_06_ing_main-13",
  "jr_06_ing_main-15",
  "jr_06_ing_main-18",
  "jr_06_ing_main-19",
] as const;

const SUBJECT_BY_SLUG: Record<string, string> = {
  jr_06_mat: "Matematik",
  jr_06_fen: "Fen Bilimleri",
  jr_06_turkce: "Türkçe",
  jr_06_ing_main: "İngilizce",
  jr_06_sosyal: "Sosyal Bilgiler",
};

type CoverWash = { bg: string; ink: string; accent: string };

const WASH_MATEMATIK: CoverWash = { bg: "#fff7ed", ink: "#0f172a", accent: "#38bdf8" };

const WASH: Record<string, CoverWash> = {
  Matematik: WASH_MATEMATIK,
  "Fen Bilimleri": { bg: "#ecfdf5", ink: "#0f172a", accent: "#34d399" },
  Türkçe: { bg: "#f5f3ff", ink: "#0f172a", accent: "#c4b5fd" },
  İngilizce: { bg: "#eff6ff", ink: "#0f172a", accent: "#7dd3fc" },
  "Sosyal Bilgiler": { bg: "#fffbeb", ink: "#0f172a", accent: "#fcd34d" },
};

const ENGLISH_TOKEN =
  /\b(daily|routines|simple|present|some|any|bigger|cheaper|sunny|rainy|happy|anxious|scared|rides|fun|doctor|architect|visited|swam|played|should|recycling|voting|was|were|behind|under|next)\b/iu;

function lessonSubject(lessonKey: string): string {
  const slug = lessonKey.replace(/-\d+$/u, "");
  const subject = SUBJECT_BY_SLUG[slug];
  if (!subject) {
    throw new Error(`Nötr kapak: branş yok (${lessonKey}).`);
  }
  return subject;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

function caption(subject: string, title: string): string | null {
  if (subject === "İngilizce" || ENGLISH_TOKEN.test(title)) {
    return null;
  }
  return title;
}

function lessonOrder(lessonKey: string): number {
  const order = Number(lessonKey.match(/-(\d+)$/u)?.[1] ?? "1");
  return Number.isFinite(order) ? order : 1;
}

function motif(subject: string, accent: string, ink: string, order: number): string {
  if (subject === "Matematik") {
    const quarters = [
      `<path d="M430 300 L430 150 A150 150 0 0 1 580 300 Z" fill="${accent}"/>`,
      `<path d="M430 300 L580 300 A150 150 0 0 1 430 450 Z" fill="${accent}"/>`,
      `<path d="M430 300 L430 450 A150 150 0 0 1 280 300 Z" fill="${accent}"/>`,
      `<path d="M430 300 L280 300 A150 150 0 0 1 430 150 Z" fill="${accent}"/>`,
    ];
    const bars = [150, 110, 180, 90, 140].map((height, index) => {
      const shift = ((order + index) % 5) * 12;
      const y = 180 + (180 - height) + (shift % 24);
      const fill = (index + order) % 2 === 0 ? accent : "#fff";
      return `<rect x="${700 + index * 90}" y="${y}" width="70" height="${height}" rx="12" fill="${fill}" stroke="${ink}" stroke-width="6"/>`;
    });
    return `
      <circle cx="430" cy="300" r="150" fill="#fff" stroke="${ink}" stroke-width="8"/>
      ${quarters[order % quarters.length]}
      <line x1="280" y1="300" x2="580" y2="300" stroke="${ink}" stroke-width="6"/>
      <line x1="430" y1="150" x2="430" y2="450" stroke="${ink}" stroke-width="6"/>
      ${bars.slice(0, 3).join("")}`;
  }
  if (subject === "Fen Bilimleri") {
    return `
      <circle cx="280" cy="300" r="90" fill="#fde68a" stroke="${ink}" stroke-width="8"/>
      <circle cx="460" cy="300" r="28" fill="#94a3b8" stroke="${ink}" stroke-width="6"/>
      <circle cx="560" cy="300" r="36" fill="${accent}" stroke="${ink}" stroke-width="6"/>
      <circle cx="690" cy="300" r="48" fill="#fb923c" stroke="${ink}" stroke-width="6"/>
      <ellipse cx="860" cy="300" rx="90" ry="22" fill="none" stroke="${ink}" stroke-width="6"/>
      <circle cx="860" cy="300" r="40" fill="#fde68a" stroke="${ink}" stroke-width="6"/>`;
  }
  if (subject === "Türkçe") {
    return `
      <path d="M250 180 h280 v300 h-280 z" fill="#fff" stroke="${ink}" stroke-width="8"/>
      <path d="M530 180 h280 v300 h-280 z" fill="#fff7ed" stroke="${ink}" stroke-width="8"/>
      <rect x="880" y="230" width="220" height="70" rx="16" fill="${accent}" stroke="${ink}" stroke-width="6"/>
      <rect x="880" y="330" width="180" height="28" rx="10" fill="#fff" stroke="${ink}" stroke-width="6"/>
      <rect x="880" y="376" width="140" height="28" rx="10" fill="#fff" stroke="${ink}" stroke-width="6"/>`;
  }
  if (subject === "İngilizce") {
    const turn = (order % 8) * 30;
    return `
      <circle cx="520" cy="300" r="160" fill="#fff" stroke="${ink}" stroke-width="8"/>
      <circle cx="520" cy="300" r="10" fill="${ink}"/>
      <g transform="rotate(${turn} 520 300)">
        <line x1="520" y1="300" x2="520" y2="180" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
        <line x1="520" y1="300" x2="640" y2="340" stroke="${ink}" stroke-width="8" stroke-linecap="round"/>
      </g>
      <circle cx="860" cy="250" r="70" fill="${accent}" stroke="${ink}" stroke-width="6"/>
      <rect x="800" y="330" width="180" height="90" rx="20" fill="#fff" stroke="${ink}" stroke-width="6"/>`;
  }
  return `
    <circle cx="420" cy="300" r="130" fill="#e0f2fe" stroke="${ink}" stroke-width="8"/>
    <ellipse cx="420" cy="300" rx="130" ry="36" fill="none" stroke="${accent}" stroke-width="6"/>
    <path d="M720 420 C820 280 980 360 1100 240" fill="none" stroke="${ink}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="860" cy="250" r="18" fill="${accent}" stroke="${ink}" stroke-width="6"/>
    <rect x="760" y="300" width="120" height="70" rx="12" fill="#fff" stroke="${ink}" stroke-width="6"/>`;
}

function coverSvg(subject: string, title: string, order: number): string {
  const tone = WASH[subject] ?? WASH_MATEMATIK;
  const label = caption(subject, title);
  const size = label && label.length > 36 ? 32 : 40;
  const titleBlock = label
    ? `<text x="640" y="620" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="700" fill="${tone.ink}">${xmlEscape(label)}</text>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${tone.bg}"/>
  ${motif(subject, tone.accent, tone.ink, order)}
  ${titleBlock}
</svg>`;
}

async function main(): Promise<void> {
  const lessons = new Map(
    [
      ...JUNIOR_MAT_LESSONS,
      ...JUNIOR_FEN_LESSONS,
      ...JUNIOR_TURKCE_LESSONS,
      ...JUNIOR_ING_LESSONS,
      ...JUNIOR_SOSYAL_LESSONS,
    ].map((lesson) => [lesson.key, lesson.title]),
  );
  const outDir = join(process.cwd(), "public", JUNIOR_COVER_PUBLIC_DIR.replace(/^\//u, ""));
  for (const key of ENGLISH_COVER_KEYS) {
    const title = lessons.get(key);
    if (!title) {
      process.stdout.write(`${key} katalogda yok, atlandı.\n`);
      continue;
    }
    const subject = lessonSubject(key);
    const dest = join(outDir, `${key}.jpg`);
    const svg = Buffer.from(coverSvg(subject, title, lessonOrder(key)), "utf8");
    await sharp(svg)
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82, chromaSubsampling: "4:2:0" })
      .withMetadata({ density: 96 })
      .toFile(dest);
    const written = readFileSync(dest);
    const meta = await sharp(written).metadata();
    if (
      written.length < 4_000 ||
      written[0] !== 0xff ||
      written[1] !== 0xd8 ||
      meta.width !== WIDTH ||
      meta.height !== HEIGHT ||
      meta.format !== "jpeg"
    ) {
      throw new Error(`JPEG mühürü tutmadı: ${dest}`);
    }
    process.stdout.write(`${key} ${written.length}\n`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Nötr kapak yazılamadı.";
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
