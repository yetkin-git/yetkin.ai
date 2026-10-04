/**
 * Yayın sesinin kuru sayımı. Kovaya yazmaz, yerelden silmez.
 * Liste sınav yolu, fon yatağı ve hazırlık şeridinden türer. Dosya adı elle yazılmaz.
 * `media-bake` WAV ana kaydı ve yetim dosya bu listeye girmez.
 */

import "@/lib/academy/lesson-json-disk";
import { lstatSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import {
  academyLessonAudioPlaybackSrc,
  academyLessonBedPlaybackSrc,
  isAcademyLessonBedSealed,
} from "@/lib/academy/lesson-audio";
import {
  ACADEMY_SEALED_OBJECT_MAX_BYTES,
  ACADEMY_SEALED_STORAGE_BUCKET,
  academySealedObjectPathFromPlayback,
  assertAcademySealedBucket,
  isAcademySealedObjectPath,
} from "@/lib/academy/lesson-audio-grant";
import {
  ACADEMY_MEDIA_SEALED_SKU_SLUGS,
  academyMediaSealedLessonKeys,
  isAcademyLessonAudioSealed,
} from "@/lib/academy/pilot-sku";
import {
  academyPrepStripAudioPlaybackSrc,
  academyPrepStripForSlug,
  isAcademyPrepStripAudioSealed,
} from "@/lib/academy/prep-strip";

export type AcademyMediaSyncMode = "dry-run" | "apply";

export type AcademySealedAudioSyncItem = {
  kind: "speech" | "bed";
  courseSlug: string;
  lessonKey: string;
  publicPath: string;
  objectPath: string;
  diskRelative: string;
};

export type AcademyAudioSyncReport = {
  bucket: typeof ACADEMY_SEALED_STORAGE_BUCKET;
  speech: number;
  bed: number;
  total: number;
  bytes: number;
  items: readonly AcademySealedAudioSyncItem[];
  missing: string[];
  empty: string[];
  oversize: string[];
  orphans: string[];
  rejected: string[];
  ignored: string[];
};

export function parseAcademyMediaSyncArgs(argv: readonly string[]): { mode: AcademyMediaSyncMode } {
  for (const arg of argv) {
    const lowered = arg.toLowerCase();
    if (lowered.includes("lesson-audios") || lowered.includes("media-bake")) {
      throw new Error("lesson-audios kovasına ve media-bake ana kaydına yazılmaz.");
    }
  }
  const flags = argv.filter((arg) => arg.startsWith("--"));
  const dryRun = flags.includes("--dry-run");
  const apply = flags.includes("--apply");
  if (dryRun && apply) {
    throw new Error("Kuru sayım ve gerçek kopyalama birlikte verilmez.");
  }
  for (const flag of flags) {
    if (flag !== "--dry-run" && flag !== "--apply") {
      throw new Error(`Bilinmeyen bayrak: ${flag}`);
    }
  }
  return { mode: apply ? "apply" : "dry-run" };
}

function itemFromPlayback(
  kind: AcademySealedAudioSyncItem["kind"],
  courseSlug: string,
  lessonKey: string,
  playbackSrc: string,
): AcademySealedAudioSyncItem {
  const objectPath = academySealedObjectPathFromPlayback(playbackSrc);
  if (!objectPath || !isAcademySealedObjectPath(objectPath)) {
    throw new Error(`Nesne yolu kurulamadı: ${courseSlug}/${lessonKey}`);
  }
  const url = new URL(playbackSrc, "https://yetkin.ai");
  const publicPath = url.pathname;
  if (!publicPath.startsWith("/media/academy/audio/") || publicPath.includes("..")) {
    throw new Error(`Yayın yolu geçersiz: ${publicPath}`);
  }
  const diskRelative = `public${publicPath}`;
  if (diskRelative.includes("media-bake") || diskRelative.endsWith(".wav")) {
    throw new Error("WAV ana kaydı ve media-bake kovaya girmez.");
  }
  return { kind, courseSlug, lessonKey, publicPath, objectPath, diskRelative };
}

/** Sınav yolu + fon yatağı + mühürlü hazırlık şeridi. Elle dosya adı yok. */
export function listAcademySealedAudioSyncPlan(): readonly AcademySealedAudioSyncItem[] {
  assertAcademySealedBucket(ACADEMY_SEALED_STORAGE_BUCKET);
  const items: AcademySealedAudioSyncItem[] = [];
  for (const courseSlug of ACADEMY_MEDIA_SEALED_SKU_SLUGS) {
    for (const lessonKey of academyMediaSealedLessonKeys(courseSlug)) {
      if (!isAcademyLessonAudioSealed(courseSlug, lessonKey)) {
        continue;
      }
      items.push(
        itemFromPlayback(
          "speech",
          courseSlug,
          lessonKey,
          academyLessonAudioPlaybackSrc(courseSlug, lessonKey),
        ),
      );
      if (isAcademyLessonBedSealed(courseSlug, lessonKey)) {
        items.push(
          itemFromPlayback(
            "bed",
            courseSlug,
            lessonKey,
            academyLessonBedPlaybackSrc(courseSlug, lessonKey),
          ),
        );
      }
    }
    if (!isAcademyPrepStripAudioSealed(courseSlug)) {
      continue;
    }
    const strip = academyPrepStripForSlug(courseSlug);
    const playback = strip ? academyPrepStripAudioPlaybackSrc(courseSlug) : null;
    if (!strip || !playback) {
      throw new Error(`Hazırlık şeridi sesi mühürlü ama adres yok: ${courseSlug}`);
    }
    items.push(itemFromPlayback("speech", courseSlug, strip.key, playback));
  }

  const objectPaths = new Set<string>();
  const diskPaths = new Set<string>();
  for (const item of items) {
    if (objectPaths.has(item.objectPath) || diskPaths.has(item.diskRelative)) {
      throw new Error(`Aynı ses iki kez listelendi: ${item.diskRelative}`);
    }
    objectPaths.add(item.objectPath);
    diskPaths.add(item.diskRelative);
  }
  return items;
}

export function academyPublishAudioRoot(repoRoot: string): string {
  const root = resolve(repoRoot);
  const audioRoot = resolve(root, "public", "media", "academy", "audio");
  const normalized = audioRoot.replaceAll("\\", "/");
  if (normalized.includes("/media-bake/") || normalized.endsWith("/media-bake")) {
    throw new Error("media-bake WAV ana kaydı bu listeye girmez.");
  }
  if (!normalized.endsWith("/public/media/academy/audio")) {
    throw new Error("Ses kökü public/media/academy/audio olmalıdır.");
  }
  return audioRoot;
}

function isInsideAudioRoot(repoRoot: string, diskRelative: string): boolean {
  if (diskRelative.includes("..") || diskRelative.includes("media-bake") || isAbsolute(diskRelative)) {
    return false;
  }
  const abs = resolve(repoRoot, diskRelative);
  const root = academyPublishAudioRoot(repoRoot);
  const rel = relative(root, abs);
  return rel.length > 0 && !rel.startsWith("..") && !isAbsolute(rel);
}

function walkAudioFiles(audioRoot: string, repoRoot: string): string[] {
  const found: string[] = [];
  const visit = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      if (name === ".gitkeep") {
        continue;
      }
      const absolute = join(dir, name);
      const stat = lstatSync(absolute);
      if (stat.isSymbolicLink()) {
        continue;
      }
      if (stat.isDirectory()) {
        visit(absolute);
        continue;
      }
      if (!stat.isFile()) {
        continue;
      }
      found.push(relative(repoRoot, absolute).replaceAll("\\", "/"));
    }
  };
  visit(audioRoot);
  return found;
}

/** Diskteki yayın klasörünü planla karşılaştırır. Yüklemez. */
export function inspectAcademySealedAudio(repoRoot: string = process.cwd()): AcademyAudioSyncReport {
  const items = listAcademySealedAudioSyncPlan();
  const root = resolve(repoRoot);
  const audioRoot = academyPublishAudioRoot(root);
  const planned = new Set(items.map((item) => item.diskRelative));
  const missing: string[] = [];
  const empty: string[] = [];
  const oversize: string[] = [];
  let bytes = 0;

  for (const item of items) {
    if (!isInsideAudioRoot(root, item.diskRelative)) {
      missing.push(item.diskRelative);
      continue;
    }
    const absolute = resolve(root, item.diskRelative);
    try {
      const stat = statSync(absolute);
      if (!stat.isFile() || stat.size <= 0) {
        empty.push(item.diskRelative);
        continue;
      }
      if (stat.size > ACADEMY_SEALED_OBJECT_MAX_BYTES) {
        oversize.push(item.diskRelative);
      }
      bytes += stat.size;
    } catch {
      missing.push(item.diskRelative);
    }
  }

  const orphans: string[] = [];
  const rejected: string[] = [];
  const ignored: string[] = [];
  let diskFiles: string[] = [];
  try {
    diskFiles = walkAudioFiles(audioRoot, root);
  } catch {
    diskFiles = [];
  }
  for (const diskRelative of diskFiles) {
    if (diskRelative.includes("media-bake") || diskRelative.endsWith(".wav")) {
      rejected.push(diskRelative);
      continue;
    }
    if (diskRelative.endsWith(".mp3")) {
      if (!planned.has(diskRelative)) {
        orphans.push(diskRelative);
      }
      continue;
    }
    ignored.push(diskRelative);
  }

  const speech = items.filter((item) => item.kind === "speech").length;
  const bed = items.filter((item) => item.kind === "bed").length;
  return {
    bucket: ACADEMY_SEALED_STORAGE_BUCKET,
    speech,
    bed,
    total: items.length,
    bytes,
    items,
    missing,
    empty,
    oversize,
    orphans,
    rejected,
    ignored,
  };
}

export function academyAudioSyncHasBlockers(report: AcademyAudioSyncReport): boolean {
  return (
    report.missing.length > 0 ||
    report.empty.length > 0 ||
    report.oversize.length > 0 ||
    report.rejected.length > 0
  );
}
