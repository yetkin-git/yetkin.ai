/**
 * R2'ye gidecek kamu dosyaların listesi.
 * WAV, geçici dosya ve media-bake ana kaydı girmez.
 * Akademi mühürlü MP3 bu listeye girmez; o dosya imzalı kovadadır.
 */

import { lstatSync, readdirSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { PUBLIC_MEDIA_VERCEL_OFFLOAD_DIRS } from "@/lib/media/offload";

export type R2SyncCategory = {
  id: "junior-audio" | "junior-covers" | "junior-warmup" | "academy-warmup";
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
      const objectKey = objectKeyFromDiskRelative(diskRelative);
      items.push({
        category: category.id,
        diskRelative,
        objectKey,
        bytes: stat.size,
      });
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
