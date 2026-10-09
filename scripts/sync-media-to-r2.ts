#!/usr/bin/env tsx
/**
 * Kamu medyayı Cloudflare R2 kovasına kopyalar.
 *
 *   npx tsx scripts/sync-media-to-r2.ts
 *   npx tsx scripts/sync-media-to-r2.ts --dry-run
 *   npx tsx scripts/sync-media-to-r2.ts --apply
 *
 * Varsayılan kuru sayım. `--apply` olmadan kovaya yazılmaz.
 * Yerel dosya silinmez. Kovadaki fazla nesne silinmez.
 * WAV, media-bake ve akademi mühürlü MP3 bu listeye girmez.
 * Anahtarlar .env.local içinden okunur; bu dosyaya ve git'e yazılmaz.
 *
 * Gerekli ortam (yalnız --apply):
 *   R2_BUCKET_NAME
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_ENDPOINT veya R2_ACCOUNT_ID
 *   NEXT_PUBLIC_MEDIA_BASE_URL
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { readR2MediaConfig } from "@/lib/media/r2-config";
import { listR2PublicMedia, contentTypeForObjectKey, type R2SyncItem } from "@/lib/media/r2-plan";
import {
  hashPayload,
  R2_EMPTY_PAYLOAD_HASH,
  R2_OBJECT_CACHE_CONTROL,
  signR2Request,
} from "@/lib/media/r2-s3";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local"), quiet: true });
dotenv.config({ path: resolve(ROOT, ".env"), quiet: true });

const MIB = 1024 * 1024;

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseMode(argv: readonly string[]): "dry-run" | "apply" {
  const flags = argv.filter((arg) => arg.startsWith("--"));
  const dryRun = flags.includes("--dry-run");
  const apply = flags.includes("--apply");
  if (dryRun && apply) {
    fail("Kuru sayım ve gerçek kopyalama birlikte verilmez.");
  }
  for (const flag of flags) {
    if (flag !== "--dry-run" && flag !== "--apply") {
      fail(`Bilinmeyen bayrak: ${flag}`);
    }
  }
  return apply ? "apply" : "dry-run";
}

function formatMb(bytes: number): string {
  return (bytes / MIB).toFixed(1);
}

function summarize(items: readonly R2SyncItem[]): void {
  const byCategory = new Map<string, { files: number; bytes: number }>();
  for (const item of items) {
    const row = byCategory.get(item.category) ?? { files: 0, bytes: 0 };
    row.files += 1;
    row.bytes += item.bytes;
    byCategory.set(item.category, row);
  }
  const order = ["junior-audio", "junior-covers", "junior-warmup", "academy-warmup"];
  for (const id of order) {
    const row = byCategory.get(id) ?? { files: 0, bytes: 0 };
    process.stdout.write(`${id}: ${row.files} dosya, ${formatMb(row.bytes)} MB\n`);
  }
  const bytes = items.reduce((sum, item) => sum + item.bytes, 0);
  process.stdout.write(`toplam: ${items.length} dosya, ${formatMb(bytes)} MB\n`);
}

async function headLength(item: R2SyncItem, config: ReturnType<typeof readR2MediaConfig>): Promise<number | null> {
  const signed = signR2Request({
    method: "HEAD",
    endpoint: config.endpoint,
    bucket: config.bucket,
    objectKey: item.objectKey,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    payloadHash: R2_EMPTY_PAYLOAD_HASH,
  });
  const response = await fetch(signed.url, {
    method: "HEAD",
    headers: signed.headers,
    signal: AbortSignal.timeout(60_000),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`HEAD ${response.status} ${item.objectKey}`);
  }
  const length = Number(response.headers.get("content-length") ?? "");
  return Number.isFinite(length) ? length : null;
}

async function putObject(item: R2SyncItem, config: ReturnType<typeof readR2MediaConfig>): Promise<"uploaded" | "skipped"> {
  const existing = await headLength(item, config);
  if (existing === item.bytes) {
    return "skipped";
  }
  const body = await readFile(resolve(ROOT, item.diskRelative));
  const signed = signR2Request({
    method: "PUT",
    endpoint: config.endpoint,
    bucket: config.bucket,
    objectKey: item.objectKey,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    payloadHash: hashPayload(body),
    contentType: contentTypeForObjectKey(item.objectKey),
    cacheControl: R2_OBJECT_CACHE_CONTROL,
  });
  const response = await fetch(signed.url, {
    method: "PUT",
    headers: signed.headers,
    body: new Uint8Array(body),
    signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok) {
    throw new Error(`PUT ${response.status} ${item.objectKey}`);
  }
  return "uploaded";
}

async function applyAll(items: readonly R2SyncItem[]): Promise<void> {
  let config: ReturnType<typeof readR2MediaConfig>;
  try {
    config = readR2MediaConfig({
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
      R2_ENDPOINT: process.env.R2_ENDPOINT,
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
      NEXT_PUBLIC_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_MEDIA_BASE_URL,
    });
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
  process.stdout.write(`kova: ${config.bucket}\n`);
  process.stdout.write(`okuma kökü: ${config.mediaBaseUrl}\n`);
  let uploaded = 0;
  let skipped = 0;
  const errors: string[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(4, items.length) }, async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      const item = items[index];
      if (!item) {
        return;
      }
      try {
        const result = await putObject(item, config);
        if (result === "uploaded") {
          uploaded += 1;
        } else {
          skipped += 1;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(message);
      }
    }
  });
  await Promise.all(workers);
  process.stdout.write(`yüklendi: ${uploaded}\n`);
  process.stdout.write(`aynı boyutta atlandı: ${skipped}\n`);
  if (errors.length > 0) {
    fail(errors.join("\n"));
  }
}

async function main(): Promise<void> {
  const mode = parseMode(process.argv.slice(2));
  const items = listR2PublicMedia(ROOT);
  process.stdout.write(mode === "apply" ? "mod: yaz\n" : "mod: kuru sayım\n");
  summarize(items);
  if (mode === "dry-run") {
    process.stdout.write("Kovaya yazılmadı. Yazmak için --apply.\n");
    return;
  }
  if (items.length === 0) {
    fail("Yüklenecek dosya yok.");
  }
  await applyAll(items);
  process.stdout.write("Bitti. Yerel dosyalar duruyor.\n");
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
