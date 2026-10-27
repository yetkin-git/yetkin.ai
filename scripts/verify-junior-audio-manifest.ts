#!/usr/bin/env tsx
/**
 * Junior ses manifesti (T-04). Mod seçilmezse `--check` çalışır.
 *
 *   --write   Yerel MP3'lerden her anahtar için SHA-256 ve bayt yazar. Eksik veya boş dosyada durur.
 *             Manifestte olmayan, yazılmış ve sesi yeni inmiş ders anahtarı da sicile girer.
 *   --check   Build kapısı. Anahtar listesi ile manifest birebir olmalı. Ses klasörü bu süreçte varsa
 *             her MP3 manifestle eşleşmeli. Klasör yoksa (Vercel paketi, git) dosya denetimi atlanır.
 *   --cdn          Tam denetim. Her ön izleme HEAD ile manifest boyutuyla eşleşmeli.
 *                  Kilitli dersler kamu yolunda 200 dönerse başarısız sayılır (ücretli ses açık demektir).
 *   --cdn-openers  Dağıtım kapısı. Dört ücretsiz açılış 200 olmalı; `jr_06_mat-1` baytı manifestle aynı olmalı.
 *                  Kapak manifestindeki her JPEG kamu yolda 200 olmalı; Content-Length ve SHA-256 eşleşmeli.
 *                  Kilitli sızıntı ve diğer ön izleme sapmaları uyarıdır.
 *                  Kilitli dersin kamu 200'ü tam denetimde (`--cdn`) hâlâ başarısız sayılır.
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
  juniorPilotOpenerByteWarning,
  juniorPilotOpenerDeployIssue,
  type JuniorAudioManifest,
} from "@/lib/junior/audio-manifest";
import { JUNIOR_FREE_PILOT_CDN_OPENERS } from "@/lib/junior/limits";
import { JUNIOR_AUDIO_MANIFEST } from "@/lib/junior/audio-manifest.generated";
import { JUNIOR_COVER_MANIFEST } from "@/lib/junior/cover-manifest.generated";
import { juniorCoverCacheQuery, juniorCoverCdnIssue, juniorCoverPublicPath } from "@/lib/junior/covers";
import { juniorBakeCandidateLessons } from "@/lib/junior/content-source";
import { JUNIOR_ELECTIVE_TTS_MODEL_ID, juniorLessonUsesElectiveTts } from "@/lib/junior/elective-tts";
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

/** Seçmeli ses. Manifest yalnız Lite fişi taşıyan MP3'yi alır. */
const ELECTIVE_AUDIO_SLUGS = ["jr_06_ing", "jr_06_alm", "jr_06_fra", "jr_06_siyer", "jr_06_kod", "jr_06_arp"] as const;
const RECEIPT_DIR = join(ROOT, "media-bake", "junior", "dry-run-receipts");

const RANK_COURSES = [...BAKE_COURSES, ...ELECTIVE_AUDIO_SLUGS];

function lessonRank(key: string): [number, number] {
  const course = RANK_COURSES.findIndex((slug) => key.startsWith(`${slug}-`));
  const number = Number(key.slice(key.lastIndexOf("-") + 1));
  return [course < 0 ? RANK_COURSES.length : course, Number.isFinite(number) ? number : 0];
}

function electiveReceiptModel(lessonKey: string): string | null {
  const path = join(RECEIPT_DIR, `${lessonKey}.json`);
  if (!existsSync(path)) {
    return null;
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as { model?: unknown };
  return typeof raw.model === "string" ? raw.model : null;
}

function electiveAudioKeysOnDisk(): string[] {
  const keys: string[] = [];
  for (const slug of ELECTIVE_AUDIO_SLUGS) {
    for (const number of [1, 2]) {
      const key = `${slug}-${number}`;
      if (fileState(key) && electiveReceiptModel(key) === JUNIOR_ELECTIVE_TTS_MODEL_ID) {
        keys.push(key);
      }
    }
  }
  return keys;
}

/** Yayın sicili artı diskte MP3'si olan fırın adayları. Emekli dosya ve fon müziği girmez. */
function writeKeys(): string[] {
  const admitted = [
    ...BAKE_COURSES.flatMap((slug) =>
      juniorBakeCandidateLessons(slug)
        .map((lesson) => lesson.key)
        .filter((key) => fileState(key) !== null),
    ),
    ...electiveAudioKeysOnDisk().filter((key) => !KEYS.includes(key)),
  ];
  return [...new Set([...KEYS, ...admitted])].sort((left, right) => {
    const [leftCourse, leftNumber] = lessonRank(left);
    const [rightCourse, rightNumber] = lessonRank(right);
    if (leftCourse !== rightCourse) {
      return leftCourse - rightCourse;
    }
    return leftNumber - rightNumber;
  });
}

function mode(): "write" | "check" | "cdn" | "cdn-openers" {
  if (process.argv.includes("--write")) {
    return "write";
  }
  if (process.argv.includes("--cdn-openers")) {
    return "cdn-openers";
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

const COVER_WORKERS = 6;

/** Sınırlı eşzamanlılık. Kapak gövdeleri sırayla 111 kez inmesin. */
async function mapCoverPool<T>(items: readonly T[], work: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  const lanes = Array.from({ length: Math.min(COVER_WORKERS, Math.max(items.length, 1)) }, async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) {
        return;
      }
      const item = items[index];
      if (item === undefined) {
        return;
      }
      await work(item);
    }
  });
  await Promise.all(lanes);
}

/**
 * Manifestteki her kapak. 404 veya gövde sapması çıkış kodunu 1 yapar.
 * Adres katalogla aynıdır: `juniorCoverCacheQuery` (`?v=v2-` ve manifest özeti).
 */
async function checkManifestCovers(root: string): Promise<string[]> {
  const keys = Object.keys(JUNIOR_COVER_MANIFEST);
  const issues: string[] = [];
  await mapCoverPool(keys, async (key) => {
    const entry = JUNIOR_COVER_MANIFEST[key];
    if (!entry) {
      issues.push(`kapak manifest kaydı yok: ${key}`);
      return;
    }
    const url = `${root}${juniorCoverPublicPath(key)}${juniorCoverCacheQuery(key)}`;
    try {
      const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(60_000) });
      const body = Buffer.from(await response.arrayBuffer());
      const issue = juniorCoverCdnIssue(key, entry, {
        status: response.status,
        contentLength: response.headers.get("content-length"),
        bytes: body.length,
        sha256: response.ok ? createHash("sha256").update(body).digest("hex") : "",
      });
      if (issue) {
        issues.push(issue);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      issues.push(`CDN hatası: ${key}.jpg (${message})`);
    }
  });
  return issues;
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
  const rejected = Object.keys(body).filter(
    (key) => juniorLessonUsesElectiveTts(key) && electiveReceiptModel(key) !== JUNIOR_ELECTIVE_TTS_MODEL_ID,
  );
  if (rejected.length > 0) {
    fail(
      "verify:junior-audio-manifest --write BAŞARISIZ — seçmeli fiş Lite model değil. Manifest yazılmadı.",
      rejected.map((key) => `${key} modeli ${electiveReceiptModel(key) ?? "yok"}. Standart modele geçilmez.`),
    );
  }
  const lines = Object.entries(body).map(([key, entry]) => {
    const model = juniorLessonUsesElectiveTts(key) ? `, model: ${JSON.stringify(JUNIOR_ELECTIVE_TTS_MODEL_ID)}` : "";
    return `  ${JSON.stringify(key)}: { sha256: "${entry.sha256}", bytes: ${entry.bytes}${model} },`;
  });
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
function httpsMediaRoot(): string {
  const base = readMediaPublicBaseUrl(process.env.NEXT_PUBLIC_MEDIA_BASE_URL);
  if (!base || !base.startsWith("https://")) {
    fail("verify:junior-audio-cdn BAŞARISIZ — NEXT_PUBLIC_MEDIA_BASE_URL https kök olmalı.", []);
  }
  return base.replace(/\/+$/u, "");
}

/**
 * Derleme ve CI kapısı. Dört ücretsiz açılış 200 olmadan çıkış 1.
 * Matematik kapısının `Content-Length` değeri manifest baytıdır.
 * Kilitli dersin kamu 200'ü burada uyarıdır; silme bu kapının işi değildir.
 * Aynı sızıntı `--cdn` tam denetiminde çıkış kodunu 1 yapar.
 */
async function checkOpenerDeploy(): Promise<void> {
  const root = httpsMediaRoot();
  const issues: string[] = [];
  const warnings: string[] = [];
  const openerSet = new Set<string>(JUNIOR_FREE_PILOT_CDN_OPENERS);

  for (const key of JUNIOR_FREE_PILOT_CDN_OPENERS) {
    if (!KEYS.includes(key)) {
      issues.push(`ücretsiz açılış manifest anahtarlarında yok: ${key}`);
      continue;
    }
    if (!juniorLessonMediaIsPublicPreview(key)) {
      issues.push(`ücretsiz açılış kamu önizlemesi değil: ${key}`);
      continue;
    }
    const entry = JUNIOR_AUDIO_MANIFEST[key] ?? null;
    const response = await fetch(`${root}${juniorLessonAudioPublicPath(key)}`, { method: "HEAD" });
    const head = { status: response.status, contentLength: response.headers.get("content-length") };
    const issue = juniorPilotOpenerDeployIssue(key, entry, head);
    if (issue) {
      issues.push(issue);
    }
    const warning = juniorPilotOpenerByteWarning(key, entry, head);
    if (warning) {
      warnings.push(warning);
    }
  }

  const coverIssues = await checkManifestCovers(root);
  issues.push(...coverIssues);

  const exposed: string[] = [];
  for (const key of KEYS) {
    if (openerSet.has(key)) {
      continue;
    }
    const response = await fetch(`${root}${juniorLessonAudioPublicPath(key)}`, { method: "HEAD" });
    if (juniorLessonMediaIsPublicPreview(key)) {
      const entry = JUNIOR_AUDIO_MANIFEST[key];
      if (!entry) {
        warnings.push(`manifest kaydı yok: ${key}`);
        continue;
      }
      if (response.status !== 200) {
        warnings.push(`ön izleme CDN yanıtı ${response.status}: ${key}.mp3`);
        continue;
      }
      const drift = juniorAudioCdnIssue(key, entry, {
        status: response.status,
        contentLength: response.headers.get("content-length"),
      });
      if (drift) {
        warnings.push(drift);
      }
      continue;
    }
    if (response.status === 200) {
      exposed.push(key);
    }
  }
  if (exposed.length > 0) {
    warnings.push(
      `kilitli ders kamu CDN'de açık (HTTP 200): ${exposed.length} ders; örnek: ${exposed.slice(0, 5).join(", ")}`,
    );
  }

  const bgm = await fetch(`${root}/media/junior/audio/bgm-light-learning.mp3`, { method: "HEAD" });
  if (bgm.status !== 200) {
    issues.push(`fon müziği CDN yanıtı ${bgm.status}`);
  }

  for (const warning of warnings) {
    console.warn(`  ! ${warning}`);
  }
  if (issues.length > 0) {
    const coverNote = coverIssues.length > 0 ? ` Kapak: ${coverIssues.length}.` : "";
    fail(`verify:junior-audio-cdn BAŞARISIZ — ücretsiz açılış CDN kapısı.${coverNote}`, issues.slice(0, 30));
  }
  const warningNote = warnings.length > 0 ? ` Uyarı: ${warnings.length}.` : "";
  console.log(
    `verify:junior-audio-cdn OK — ${JUNIOR_FREE_PILOT_CDN_OPENERS.join(", ")} CDN'de 200; matematik kapısı manifest baytında. Kapak: ${Object.keys(JUNIOR_COVER_MANIFEST).length} manifest anahtarı 200, Content-Length ve SHA-256 eşleşti.${warningNote}`,
  );
}

async function checkCdn(): Promise<void> {
  const root = httpsMediaRoot();
  const issues: string[] = [];
  const exposed: string[] = [];
  let preview = 0;
  for (const key of JUNIOR_FREE_PILOT_CDN_OPENERS) {
    if (!juniorLessonMediaIsPublicPreview(key)) {
      issues.push(`ücretsiz açılış kamu önizlemesi değil: ${key}`);
    }
    if (!JUNIOR_AUDIO_MANIFEST[key]) {
      issues.push(`ücretsiz açılış manifest kaydı yok: ${key}`);
    }
  }
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
  const coverIssues = await checkManifestCovers(root);
  issues.push(...coverIssues);
  if (exposed.length > 0) {
    issues.push(
      `kilitli ders kamu CDN'de açık (HTTP 200): ${exposed.length} ders; örnek: ${exposed.slice(0, 5).join(", ")}`,
    );
  }
  if (issues.length > 0) {
    const coverNote = coverIssues.length > 0 ? ` Kapak: ${coverIssues.length}.` : "";
    fail(`verify:junior-audio-cdn BAŞARISIZ — CDN denetimi.${coverNote}`, issues.slice(0, 30));
  }
  console.log(
    `verify:junior-audio-cdn OK — ${preview} ön izleme manifest boyutuyla CDN'de; kilitli dersler kamu yolunda kapalı. Kapak: ${Object.keys(JUNIOR_COVER_MANIFEST).length} manifest anahtarı 200, Content-Length ve SHA-256 eşleşti.`,
  );
}

async function main(): Promise<void> {
  const current = mode();
  if (current === "write") {
    writeManifest();
    return;
  }
  if (current === "cdn-openers") {
    await checkOpenerDeploy();
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
