#!/usr/bin/env tsx
/**
 * Yayın sesini özel academy-sealed kovasına kopyalar.
 *
 *   npx tsx scripts/ops-sync-media-to-storage.ts
 *   npx tsx scripts/ops-sync-media-to-storage.ts --dry-run
 *   npx tsx scripts/ops-sync-media-to-storage.ts --apply
 *
 * Varsayılan kuru sayım. `--apply` olmadan kovaya yazılmaz.
 * Yerel dosya silinmez. Kovadaki fazla nesne silinmez.
 * media-bake WAV ana kaydı ve yetim dosya dışarıda kalır.
 * lesson-audios kovasına yazılmaz.
 * Servis anahtarı .env.local içinden okunur; bu dosyaya ve git'e yazılmaz.
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  ACADEMY_SEALED_OBJECT_MAX_BYTES,
  ACADEMY_SEALED_STORAGE_BUCKET,
  assertAcademySealedBucket,
} from "@/lib/academy/lesson-audio-grant";
import {
  academyAudioSyncHasBlockers,
  inspectAcademySealedAudio,
  parseAcademyMediaSyncArgs,
  type AcademyAudioSyncReport,
  type AcademySealedAudioSyncItem,
} from "./ops-sync-media-to-storage-lib";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local"), quiet: true });
dotenv.config({ path: resolve(ROOT, ".env"), quiet: true });

const MIB = 1024 * 1024;

function fail(message: string): never {
  console.error(`ops:sync-media-to-storage BAŞARISIZ: ${message}`);
  process.exit(1);
}

function formatMb(bytes: number): string {
  return (bytes / MIB).toFixed(1);
}

function printReport(report: AcademyAudioSyncReport, mode: "dry-run" | "apply"): void {
  const title = mode === "apply" ? "KOPYALAMA ÖNCESİ SAYIM" : "KURU SAYIM";
  console.log(`ops:sync-media-to-storage ${title}`);
  console.log(`Kova: ${report.bucket} (özel). Yerel dosya silinmedi. Kovadan silme yok.`);
  console.log(`Konuşma: ${report.speech}`);
  console.log(`Fon yatağı: ${report.bed}`);
  console.log(`Toplam: ${report.total}`);
  console.log(`Bayt: ${report.bytes}`);
  console.log(`MB: ${formatMb(report.bytes)}`);
  console.log(`Eksik: ${report.missing.length}`);
  console.log(`Boş: ${report.empty.length}`);
  console.log(`Tavan üstü: ${report.oversize.length}`);
  console.log(`Yetim (dışarıda): ${report.orphans.length}`);
  console.log(`Red (wav / media-bake): ${report.rejected.length}`);
  console.log(`Yok sayılan: ${report.ignored.length}`);
  for (const item of report.items) {
    const label = item.kind === "bed" ? "yatak" : "ses";
    console.log(`${label}\t${item.objectPath}\t${item.diskRelative}`);
  }
  for (const orphan of report.orphans) {
    console.log(`yetim\t${orphan}`);
  }
  for (const rejected of report.rejected) {
    console.log(`red\t${rejected}`);
  }
  for (const missing of report.missing) {
    console.log(`eksik\t${missing}`);
  }
}

function readServiceKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    ""
  );
}

type RemoteStamp = {
  size: number | null;
  etag: string | null;
  sha256: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
}

function readSize(metadata: Record<string, unknown> | null): number | null {
  if (!metadata) {
    return null;
  }
  const size = metadata.size ?? metadata.contentLength;
  const parsed = typeof size === "number" ? size : typeof size === "string" ? Number(size) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function readText(metadata: Record<string, unknown> | null, key: string): string | null {
  if (!metadata) {
    return null;
  }
  const value = metadata[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function etagMatchesMd5(etag: string | null, md5: string): boolean {
  if (!etag) {
    return false;
  }
  const bare = etag.replaceAll('"', "").trim().toLowerCase();
  if (!bare || bare.includes("-")) {
    return false;
  }
  return bare === md5;
}

async function remoteStamp(
  client: SupabaseClient,
  objectPath: string,
): Promise<RemoteStamp | null> {
  const slash = objectPath.lastIndexOf("/");
  const folder = slash >= 0 ? objectPath.slice(0, slash) : "";
  const name = slash >= 0 ? objectPath.slice(slash + 1) : objectPath;
  const { data, error } = await client.storage.from(ACADEMY_SEALED_STORAGE_BUCKET).list(folder, {
    limit: 100,
    search: name,
  });
  if (error) {
    throw new Error(error.message);
  }
  const hit = data?.find((item) => item.name === name);
  if (!hit) {
    return null;
  }
  const metadata = asRecord(hit.metadata);
  return {
    size: readSize(metadata),
    etag: readText(metadata, "eTag") ?? readText(metadata, "etag"),
    sha256: readText(metadata, "sha256"),
  };
}

async function ensurePrivateBucket(client: SupabaseClient): Promise<void> {
  assertAcademySealedBucket(ACADEMY_SEALED_STORAGE_BUCKET);
  const listed = await client.storage.listBuckets();
  if (listed.error) {
    fail(`Kova listesi okunamadı: ${listed.error.message}`);
  }
  const bucket = listed.data?.find(
    (item) => item.id === ACADEMY_SEALED_STORAGE_BUCKET || item.name === ACADEMY_SEALED_STORAGE_BUCKET,
  );
  if (!bucket) {
    const created = await client.storage.createBucket(ACADEMY_SEALED_STORAGE_BUCKET, {
      public: false,
      fileSizeLimit: ACADEMY_SEALED_OBJECT_MAX_BYTES,
      allowedMimeTypes: ["audio/mpeg"],
    });
    if (created.error) {
      fail(`Özel kova açılamadı: ${created.error.message}`);
    }
    console.log("Kova açıldı: academy-sealed, özel, dosya tavanı 50 MB.");
    return;
  }
  if (bucket.public) {
    fail("academy-sealed herkese açık görünüyor. Yükleme durdu. Kova özel olmalı.");
  }
}

async function copyOne(
  client: SupabaseClient,
  item: AcademySealedAudioSyncItem,
  index: number,
  total: number,
): Promise<"uploaded" | "skipped"> {
  const absolute = resolve(ROOT, item.diskRelative);
  const bytes = await readFile(absolute);
  if (bytes.byteLength <= 0 || bytes.byteLength > ACADEMY_SEALED_OBJECT_MAX_BYTES) {
    fail(`Boyut uygun değil: ${item.diskRelative}`);
  }
  const md5 = createHash("md5").update(bytes).digest("hex");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const remote = await remoteStamp(client, item.objectPath);
  const sameSize = remote?.size === bytes.byteLength;
  const sameDigest = remote?.sha256 === sha256 || etagMatchesMd5(remote?.etag ?? null, md5);
  if (remote && sameSize && sameDigest) {
    console.log(`aynı ${index}/${total} ${item.objectPath}`);
    return "skipped";
  }
  const uploaded = await client.storage.from(ACADEMY_SEALED_STORAGE_BUCKET).upload(item.objectPath, bytes, {
    contentType: "audio/mpeg",
    upsert: true,
    cacheControl: "31536000",
    metadata: { sha256 },
  });
  if (uploaded.error) {
    fail(`${item.objectPath}: ${uploaded.error.message}`);
  }
  const after = await remoteStamp(client, item.objectPath);
  if (!after || after.size !== bytes.byteLength) {
    fail(`Uzak boyut yerel ile aynı değil: ${item.objectPath}`);
  }
  console.log(`yüklendi ${index}/${total} ${item.objectPath}`);
  return "uploaded";
}

async function applyCopies(report: AcademyAudioSyncReport): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const serviceKey = readServiceKey();
  if (!supabaseUrl || !serviceKey) {
    fail("Kopyalama için NEXT_PUBLIC_SUPABASE_URL ve servis anahtarı .env.local içinde olmalı. Anahtar loglanmaz.");
  }
  const client = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await ensurePrivateBucket(client);
  let uploaded = 0;
  let skipped = 0;
  for (let index = 0; index < report.items.length; index += 1) {
    const item = report.items[index];
    if (!item) {
      fail("Liste boş satır verdi.");
    }
    const outcome = await copyOne(client, item, index + 1, report.total);
    if (outcome === "uploaded") {
      uploaded += 1;
    } else {
      skipped += 1;
    }
  }
  console.log(`ops:sync-media-to-storage OK — yüklendi=${uploaded} atlandı=${skipped} toplam=${report.total}`);
  console.log("Yerel dosyalar duruyor. Kovadaki fazla nesne silinmedi.");
}

async function main(): Promise<void> {
  let mode: "dry-run" | "apply" = "dry-run";
  try {
    mode = parseAcademyMediaSyncArgs(process.argv.slice(2)).mode;
    assertAcademySealedBucket(ACADEMY_SEALED_STORAGE_BUCKET);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }

  let report: AcademyAudioSyncReport;
  try {
    report = inspectAcademySealedAudio(ROOT);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
  printReport(report, mode);
  if (academyAudioSyncHasBlockers(report)) {
    fail("Sayım eksik, boş, tavan üstü veya reddedilen dosya gördü. Kopyalama açılmadı.");
  }
  if (mode === "dry-run") {
    console.log("ops:sync-media-to-storage KURU SAYIM TAMAM — kovaya yazılmadı.");
    return;
  }
  await applyCopies(report);
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
