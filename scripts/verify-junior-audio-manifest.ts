#!/usr/bin/env tsx
/**
 * Junior ses manifesti (T-04). Mod seçilmezse `--check` çalışır.
 *
 *   --write   Yerel MP3'lerden her anahtar için SHA-256 ve bayt yazar. Eksik veya boş dosyada durur.
 *             Manifestte olmayan, yazılmış ve sesi yeni inmiş ders anahtarı da sicile girer.
 *   --check   Build kapısı. Anahtar listesi ile manifest birebir olmalı. Ses klasörü bu süreçte varsa
 *             her MP3 manifestle eşleşmeli. Klasör yoksa (Vercel paketi, git) dosya denetimi atlanır.
 *   --cdn     Dağıtım sonrası. Ön izlemeler NEXT_PUBLIC_MEDIA_BASE_URL üzerinde HEAD ile boyutla denetlenir.
 *             Kilitli dersler kamu yolunda 200 dönerse başarısız sayılır (ücretli ses açık demektir).
 *
 * Yazılan dosya: lib/junior/audio-manifest.generated.ts
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";
import {
  juniorAudioCdnIssue,
  juniorAudioFileIssue,
  juniorAudioManifestIssues,
  type JuniorAudioManifest,
} from "@/lib/junior/audio-manifest";
import { JUNIOR_AUDIO_MANIFEST } from "@/lib/junior/audio-manifest.generated";
import { juniorBakeCandidateLessons } from "@/lib/junior/content-source";
import { juniorLessonMediaIsPublicPreview } from "@/lib/junior/media-visibility";
import { JUNIOR_BAKED_AUDIO_KEYS, juniorLessonAudioPublicPath } from "@/lib/junior/voice";
import { readMediaPublicBaseUrl } from "@/lib/media/public-url";
import type { JuniorCourseSlug } from "@yetkin/junior-content";

const ROOT = process.cwd();
dotenv.config({ path: join(ROOT, ".env.local"), quiet: true });
const AUDIO_DIR = join(ROOT, "public", "media", "junior", "audio");
const GENERATED_PATH = join(ROOT, "lib", "junior", "audio-manifest.generated.ts");
const KEYS: readonly string[] = [...JUNIOR_BAKED_AUDIO_KEYS];

const BAKE_COURSES = [
  "jr_06_mat",
  "jr_06_fen",
  "jr_06_turkce",
  "jr_06_sosyal",
  "jr_06_ing_main",
] as const satisfies readonly JuniorCourseSlug[];

function lessonRank(key: string): [number, number] {
  const course = BAKE_COURSES.findIndex((slug) => key.startsWith(`${slug}-`));
  const number = Number(key.slice(key.lastIndexOf("-") + 1));
  return [course < 0 ? BAKE_COURSES.length : course, Number.isFinite(number) ? number : 0];
}

/** Yayın sicili artı diskte MP3'si olan fırın adayları. Emekli dosya ve fon müziği girmez. */
function writeKeys(): string[] {
  const admitted = BAKE_COURSES.flatMap((slug) =>
    juniorBakeCandidateLessons(slug)
      .map((lesson) => lesson.key)
      .filter((key) => fileState(key) !== null),
  );
  return [...new Set([...KEYS, ...admitted])].sort((left, right) => {
    const [leftCourse, leftNumber] = lessonRank(left);
    const [rightCourse, rightNumber] = lessonRank(right);
    if (leftCourse !== rightCourse) {
      return leftCourse - rightCourse;
    }
    return leftNumber - rightNumber;
  });
}

function mode(): "write" | "check" | "cdn" {
  if (process.argv.includes("--write")) {
    return "write";
  }
  if (process.argv.includes("--cdn")) {
    return "cdn";
  }
  return "check";
}

function fileState(lessonKey: string): { bytes: number; sha256: string } | null {
  const absolute = join(AUDIO_DIR, `${lessonKey}.mp3`);
  if (!existsSync(absolute)) {
    return null;
  }
  const stat = statSync(absolute);
  if (!stat.isFile() || stat.size === 0) {
    return null;
  }
  const bytes = readFileSync(absolute);
  return { bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}

function audioTreePresent(): boolean {
  return existsSync(AUDIO_DIR) && statSync(AUDIO_DIR).isDirectory();
}

function fail(title: string, lines: readonly string[]): never {
  console.error([title, ...lines.map((line) => `  ✗ ${line}`)].join("\n"));
  process.exit(1);
}

function writeManifest(): void {
  const keys = writeKeys();
  const admitted = keys.filter((key) => !KEYS.includes(key));
  const missing = keys.filter((key) => fileState(key) === null);
  if (missing.length > 0) {
    fail(
      "verify:junior-audio-manifest --write BAŞARISIZ — fırınlanmış ses eksik. Manifest yazılmadı.",
      missing.map((key) => `${key}.mp3 yok veya boş`),
    );
  }
  const body: Record<string, { sha256: string; bytes: number }> = {};
  for (const key of keys) {
    const state = fileState(key);
    if (state) {
      body[key] = { sha256: state.sha256, bytes: state.bytes };
    }
  }
  const lines = Object.entries(body).map(
    ([key, entry]) => `  ${JSON.stringify(key)}: { sha256: "${entry.sha256}", bytes: ${entry.bytes} },`,
  );
  const source = [
    "// Bu dosya `npm run generate:junior-audio-manifest` ile üretilir. Elle düzenlemeyin.",
    'import type { JuniorAudioManifest } from "@/lib/junior/audio-manifest";',
    "",
    "export const JUNIOR_AUDIO_MANIFEST: JuniorAudioManifest = {",
    ...lines,
    "};",
    "",
  ].join("\n");
  writeFileSync(GENERATED_PATH, source, "utf8");
  const added = admitted.length > 0 ? ` Yeni: ${admitted.join(", ")}.` : "";
  console.log(`verify:junior-audio-manifest --write OK — ${keys.length} ders manifeste yazıldı.${added}`);
}

function checkManifest(): void {
  const manifest: JuniorAudioManifest = JUNIOR_AUDIO_MANIFEST;
  const issues = juniorAudioManifestIssues(KEYS, manifest);
  if (issues.length > 0) {
    fail("verify:junior-audio-manifest BAŞARISIZ — anahtar listesi ile manifest uyuşmuyor.", issues);
  }
  if (!audioTreePresent()) {
    console.log(
      `verify:junior-audio-manifest OK — ${KEYS.length} anahtar manifestte. Ses klasörü bu süreçte yok (paket veya CDN); dosya denetimi atlandı.`,
    );
    return;
  }
  const fileIssues: string[] = [];
  for (const key of KEYS) {
    const entry = manifest[key];
    if (!entry) {
      continue;
    }
    const issue = juniorAudioFileIssue(key, entry, fileState(key));
    if (issue) {
      fileIssues.push(issue);
    }
  }
  if (fileIssues.length > 0) {
    fail("verify:junior-audio-manifest BAŞARISIZ — yerel ses dosyaları manifestle eşleşmiyor.", fileIssues);
  }
  console.log(
    `verify:junior-audio-manifest OK — ${KEYS.length} anahtar; yerel ses dosyaları SHA-256 ve bayt ile manifeste eşleşti.`,
  );
}

/**
 * Dağıtım sonrası denetim. Ücretsiz önizleme CDN'de manifest boyutuyla durmalı.
 * Kilitli ders kamu yolunda 200 dönmemeli. Dönerse ücretli ses herkese açıktır ve bu bir güvenlik hatasıdır.
 */
async function checkCdn(): Promise<void> {
  const base = readMediaPublicBaseUrl(process.env.NEXT_PUBLIC_MEDIA_BASE_URL);
  if (!base || !base.startsWith("https://")) {
    fail("verify:junior-audio-cdn BAŞARISIZ — NEXT_PUBLIC_MEDIA_BASE_URL https kök olmalı.", []);
  }
  const root = base.replace(/\/+$/u, "");
  const issues: string[] = [];
  const exposed: string[] = [];
  let preview = 0;
  for (const key of KEYS) {
    const entry = JUNIOR_AUDIO_MANIFEST[key];
    if (!entry) {
      issues.push(`manifest kaydı yok: ${key}`);
      continue;
    }
    const response = await fetch(`${root}${juniorLessonAudioPublicPath(key)}`, { method: "HEAD" });
    if (juniorLessonMediaIsPublicPreview(key)) {
      preview += 1;
      const issue = juniorAudioCdnIssue(key, entry, {
        status: response.status,
        contentLength: response.headers.get("content-length"),
      });
      if (issue) {
        issues.push(issue);
      }
      continue;
    }
    if (response.status === 200) {
      exposed.push(key);
    }
  }
  const bgm = await fetch(`${root}/media/junior/audio/bgm-light-learning.mp3`, { method: "HEAD" });
  if (bgm.status !== 200) {
    issues.push(`fon müziği CDN yanıtı ${bgm.status}`);
  }
  if (exposed.length > 0) {
    issues.push(
      `kilitli ders kamu CDN'de açık (HTTP 200): ${exposed.length} ders; örnek: ${exposed.slice(0, 5).join(", ")}`,
    );
  }
  if (issues.length > 0) {
    fail("verify:junior-audio-cdn BAŞARISIZ — CDN denetimi.", issues);
  }
  console.log(
    `verify:junior-audio-cdn OK — ${preview} ön izleme manifest boyutuyla CDN'de; kilitli dersler kamu yolunda kapalı.`,
  );
}

async function main(): Promise<void> {
  const current = mode();
  if (current === "write") {
    writeManifest();
    return;
  }
  if (current === "cdn") {
    await checkCdn();
    return;
  }
  checkManifest();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
