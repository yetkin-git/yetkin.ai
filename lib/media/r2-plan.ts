/**
 * R2'ye gidecek kamu dosyaların listesi.
 * WAV, geçici dosya ve media-bake ana kaydı girmez.
 * Akademi mühürlü MP3 bu listeye girmez; o dosya imzalı kovadadır.
 */

import { lstatSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import {
  JUNIOR_LOCKED_MEDIA_PREFIX,
  juniorLessonMediaIsPublicPreview,
} from "@/lib/junior/media-visibility";
import { JUNIOR_SCENE_PLATES, juniorScenePublicPath } from "@/lib/junior/scene-media";
import { PUBLIC_MEDIA_VERCEL_OFFLOAD_DIRS } from "@/lib/media/offload";

export type R2SyncCategory = {
  id: "junior-audio" | "junior-covers" | "junior-warmup" | "academy-warmup" | "junior-scenes";
  /** Depo köküne göre. `public/` ile başlar. */
  dir: string;
  extensions: readonly string[];
};

export const R2_SYNC_CATEGORIES = [
  { id: "junior-audio", dir: PUBLIC_MEDIA_VERCEL_OFFLOAD_DIRS[0], extensions: [".mp3"] },
  { id: "junior-covers", dir: PUBLIC_MEDIA_VERCEL_OFFLOAD_DIRS[1], extensions: [".jpg", ".jpeg"] },
  { id: "junior-warmup", dir: PUBLIC_MEDIA_VERCEL_OFFLOAD_DIRS[2], extensions: [".mp4"] },
  { id: "academy-warmup", dir: "public/media/academy/micro", extensions: [".mp4"] },
] as const satisfies readonly R2SyncCategory[];

export type R2SyncItem = {
  category: R2SyncCategory["id"];
  diskRelative: string;
  objectKey: string;
  bytes: number;
};

const CONTENT_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
};

export function contentTypeForObjectKey(objectKey: string): string {
  const dot = objectKey.lastIndexOf(".");
  const ext = dot === -1 ? "" : objectKey.slice(dot).toLowerCase();
  const type = CONTENT_TYPES[ext];
  if (!type) {
    throw new Error(`İçerik türü yok: ${objectKey}`);
  }
  return type;
}

/**
 * Disk yolu → kova anahtarları.
 * Ücretsiz ilk konu ve fon yatağı kamu `media/junior/` altında kalır.
 * Kilitli ses ve kapak yalnız `private/junior/` önekine yazılır.
 * Isınma kaseti ücretsiz konuda kamu, kilitli konuda imzalı kopya olarak iki anahtar taşır.
 */
export function storageObjectKeysFromDiskRelative(diskRelative: string): string[] {
  const publicKey = objectKeyFromDiskRelative(diskRelative);
  const audio = /^media\/junior\/audio\/(.+)\.mp3$/u.exec(publicKey);
  if (audio) {
    const name = audio[1] ?? "";
    if (name === "bgm-light-learning" || juniorLessonMediaIsPublicPreview(name)) {
      return [publicKey];
    }
    return [`${JUNIOR_LOCKED_MEDIA_PREFIX}/audio/${name}.mp3`];
  }
  const cover = /^media\/junior\/covers\/(.+)\.(jpe?g)$/u.exec(publicKey);
  if (cover) {
    const name = cover[1] ?? "";
    const ext = cover[2] ?? "jpg";
    if (juniorLessonMediaIsPublicPreview(name)) {
      return [publicKey];
    }
    return [`${JUNIOR_LOCKED_MEDIA_PREFIX}/covers/${name}.${ext}`];
  }
  const warmup = /^media\/junior\/warmup\/(.+)$/u.exec(publicKey);
  if (warmup) {
    const fileName = warmup[1] ?? "";
    return [publicKey, `${JUNIOR_LOCKED_MEDIA_PREFIX}/warmup/${fileName}`];
  }
  return [publicKey];
}

/** `public/media/...` göreli yol → kova anahtarı `media/...`. */
export function objectKeyFromDiskRelative(diskRelative: string): string {
  const normalized = diskRelative.replaceAll("\\", "/");
  if (
    !normalized.startsWith("public/media/") ||
    normalized.includes("..") ||
    isAbsolute(normalized)
  ) {
    throw new Error("Nesne yolu public/media/ altında olmalıdır.");
  }
  return normalized.slice("public/".length);
}

function isSkippedName(name: string): boolean {
  return name === ".gitkeep" || name.startsWith(".") || name.endsWith(".tmp") || name.endsWith(".wav");
}

function walkCategory(repoRoot: string, category: R2SyncCategory, items: R2SyncItem[]): void {
  const dir = resolve(repoRoot, category.dir);
  const relDir = relative(repoRoot, dir).replaceAll("\\", "/");
  if (relDir !== category.dir) {
    throw new Error(`Medya kökü kaydı: ${category.dir}`);
  }
  const visit = (current: string): void => {
    let names: string[];
    try {
      names = readdirSync(current);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        return;
      }
      throw error;
    }
    for (const name of names) {
      if (isSkippedName(name)) {
        continue;
      }
      const absolute = join(current, name);
      const stat = lstatSync(absolute);
      if (stat.isSymbolicLink()) {
        continue;
      }
      if (stat.isDirectory()) {
        visit(absolute);
        continue;
      }
      if (!stat.isFile() || stat.size <= 0) {
        continue;
      }
      const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
      if (!(category.extensions as readonly string[]).includes(ext)) {
        continue;
      }
      const diskRelative = relative(repoRoot, absolute).replaceAll("\\", "/");
      for (const objectKey of storageObjectKeysFromDiskRelative(diskRelative)) {
        items.push({
          category: category.id,
          diskRelative,
          objectKey,
          bytes: stat.size,
        });
      }
    }
  };
  visit(dir);
}

/** Kuru sayım. Kovaya yazmaz, yerelden silmez. */
export function listR2PublicMedia(repoRoot: string): R2SyncItem[] {
  const root = resolve(repoRoot);
  const items: R2SyncItem[] = [];
  for (const category of R2_SYNC_CATEGORIES) {
    walkCategory(root, category, items);
  }
  const keys = new Set<string>();
  for (const item of items) {
    if (keys.has(item.objectKey)) {
      throw new Error(`Aynı nesne iki kez listelendi: ${item.objectKey}`);
    }
    keys.add(item.objectKey);
  }
  items.sort((a, b) => a.objectKey.localeCompare(b.objectKey));
  return items;
}

const BGM_OBJECT_NAME = "bgm-light-learning";

function pushSealedFile(
  root: string,
  category: R2SyncItem["category"],
  diskRelative: string,
  items: R2SyncItem[],
): void {
  const stat = statSync(resolve(root, diskRelative), { throwIfNoEntry: false });
  if (!stat || !stat.isFile() || stat.size <= 0) {
    throw new Error(`Mühürlü dosya yok veya boş: ${diskRelative}`);
  }
  for (const objectKey of storageObjectKeysFromDiskRelative(diskRelative)) {
    items.push({ category, diskRelative, objectKey, bytes: stat.size });
  }
}

/**
 * Mühürlü kümenin kesin yükleme listesi: her dersin MP3'ü ve kapağı, bir de kamu fon müziği.
 * Dizin taraması yapmaz. Anahtarın dosyası yoksa fırlatır.
 */
export function listR2SealedJuniorMedia(repoRoot: string, sealedLessonKeys: readonly string[]): R2SyncItem[] {
  const root = resolve(repoRoot);
  const [audioDir, coverDir] = PUBLIC_MEDIA_VERCEL_OFFLOAD_DIRS;
  const items: R2SyncItem[] = [];
  pushSealedFile(root, "junior-audio", `${audioDir}/${BGM_OBJECT_NAME}.mp3`, items);
  for (const key of sealedLessonKeys) {
    pushSealedFile(root, "junior-audio", `${audioDir}/${key}.mp3`, items);
    pushSealedFile(root, "junior-covers", `${coverDir}/${key}.jpg`, items);
  }
  const keys = new Set<string>();
  for (const item of items) {
    if (keys.has(item.objectKey)) {
      throw new Error(`Aynı nesne iki kez listelendi: ${item.objectKey}`);
    }
    keys.add(item.objectKey);
  }
  items.sort((a, b) => a.objectKey.localeCompare(b.objectKey));
  return items;
}

/**
 * Yalnız ücretsiz önizleme derslerinin sahne görselleri (JPG). Plaka listesinden okunur.
 * Kilitli dersin sahnesi ve sahne üretim notu (`*.txt`) asla bu listeye girmez.
 */
export function listR2FreeSceneMedia(repoRoot: string): R2SyncItem[] {
  const root = resolve(repoRoot);
  const items: R2SyncItem[] = [];
  for (const plate of JUNIOR_SCENE_PLATES) {
    if (!juniorLessonMediaIsPublicPreview(plate.lessonKey)) {
      continue;
    }
    const diskRelative = `public${juniorScenePublicPath(plate.lessonKey, plate.step, "jpg")}`;
    const stat = statSync(resolve(root, diskRelative), { throwIfNoEntry: false });
    if (!stat || !stat.isFile() || stat.size <= 0) {
      throw new Error(`Ücretsiz sahne görseli yok veya boş: ${diskRelative}`);
    }
    items.push({
      category: "junior-scenes",
      diskRelative,
      objectKey: objectKeyFromDiskRelative(diskRelative),
      bytes: stat.size,
    });
  }
  const keys = new Set<string>();
  for (const item of items) {
    if (keys.has(item.objectKey)) {
      throw new Error(`Aynı sahne nesnesi iki kez listelendi: ${item.objectKey}`);
    }
    keys.add(item.objectKey);
  }
  items.sort((a, b) => a.objectKey.localeCompare(b.objectKey));
  return items;
}

function diskLessonNames(root: string, dir: string, ext: string): string[] {
  try {
    return readdirSync(resolve(root, dir))
      .filter((name) => name.endsWith(ext))
      .map((name) => name.slice(0, -ext.length));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

/**
 * Mühürlü kümede olmayan ders anahtarları (emekli). Kaynak: verilen bilinen anahtarlar ile diskteki ses ve kapak adları.
 * Fon müziği ve mühürlü anahtarlar asla girmez.
 */
export function retiredJuniorLessonKeys(input: {
  repoRoot: string;
  sealedLessonKeys: readonly string[];
  knownLessonKeys: readonly string[];
}): string[] {
  const root = resolve(input.repoRoot);
  const [audioDir, coverDir] = PUBLIC_MEDIA_VERCEL_OFFLOAD_DIRS;
  const sealed = new Set(input.sealedLessonKeys);
  const names = new Set<string>([
    ...input.knownLessonKeys,
    ...diskLessonNames(root, audioDir, ".mp3"),
    ...diskLessonNames(root, coverDir, ".jpg"),
  ]);
  return [...names]
    .filter((name) => /^[a-z0-9_-]+$/u.test(name) && name !== BGM_OBJECT_NAME && !sealed.has(name))
    .sort();
}

/** Emekli dersin kova adayları: her iki önekte ses ve kapak. Silmeden önce tek tek bulunur. */
export function retiredR2ObjectKeys(lessonKey: string): string[] {
  return [
    `media/junior/audio/${lessonKey}.mp3`,
    `${JUNIOR_LOCKED_MEDIA_PREFIX}/audio/${lessonKey}.mp3`,
    `media/junior/covers/${lessonKey}.jpg`,
    `${JUNIOR_LOCKED_MEDIA_PREFIX}/covers/${lessonKey}.jpg`,
  ];
}
