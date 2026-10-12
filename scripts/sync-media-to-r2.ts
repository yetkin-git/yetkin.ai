#!/usr/bin/env tsx
/**
 * Mühürlü Junior medyasını Cloudflare R2 kovasına taşır. Her nesne SHA-256 ile doğrulanır.
 *
 *   npx tsx scripts/sync-media-to-r2.ts                           kuru sayım: yerel dosya ve manifest denetimi, ağ yok
 *   npx tsx scripts/sync-media-to-r2.ts --apply                   yükle (aynıysa atla), sonra her nesneyi indirip doğrula
 *   npx tsx scripts/sync-media-to-r2.ts --verify                  yalnız doğrula: her nesneyi indir, boyut ve SHA-256 karşılaştır
 *   npx tsx scripts/sync-media-to-r2.ts --delete-retired          emekli dersleri ve kova adaylarını listele (kuru sayım)
 *   npx tsx scripts/sync-media-to-r2.ts --delete-retired --apply  bulunan emekli nesneleri sil, sonra 404 doğrula
 *
 * Kapsam: mühürlü dersin MP3'ü, kapağı ve `bgm-light-learning`. Kilitli içerik `private/junior/`,
 * ücretsiz önizleme `media/junior/` anahtarına gider. Yerel dosya silinmez. Emekli listesi dışındaki nesne silinmez.
 * Ağ modlarında ortam: R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT veya R2_ACCOUNT_ID,
 * NEXT_PUBLIC_MEDIA_BASE_URL. Değerler `.env.local` dosyasından okunur; konsola ya da dosyaya yazılmaz.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { JUNIOR_AUDIO_MANIFEST } from "@/lib/junior/audio-manifest.generated";
import { JUNIOR_COVER_MANIFEST } from "@/lib/junior/cover-manifest.generated";
import { readR2MediaConfig, type R2MediaConfig } from "@/lib/media/r2-config";
import {
  contentTypeForObjectKey,
  listR2FreeSceneMedia,
  listR2SealedJuniorMedia,
  retiredJuniorLessonKeys,
  retiredR2ObjectKeys,
  type R2SyncItem,
} from "@/lib/media/r2-plan";
import {
  hashPayload,
  R2_EMPTY_PAYLOAD_HASH,
  R2_OBJECT_CACHE_CONTROL,
  signR2Request,
} from "@/lib/media/r2-s3";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local"), quiet: true });
dotenv.config({ path: resolve(ROOT, ".env"), quiet: true });

const BGM_NAME = "bgm-light-learning";
const WORKERS = 4;
const SEALED_KEYS = Object.keys(JUNIOR_AUDIO_MANIFEST).sort();
const KNOWN_KEYS = Object.keys(JUNIOR_COVER_MANIFEST);
const MIB = 1024 * 1024;

type Flags = { apply: boolean; verify: boolean; deleteRetired: boolean };
type Planned = { item: R2SyncItem; sha256: string };
type Head = { status: number; length: number | null; sha256: string | null };

function say(line: string): void {
  process.stdout.write(`${line}\n`);
}

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function parseFlags(argv: readonly string[]): Flags {
  const known = new Set(["--apply", "--verify", "--delete-retired", "--dry-run"]);
  for (const flag of argv) {
    if (!known.has(flag)) {
      fail(`Bilinmeyen bayrak: ${flag}`);
    }
  }
  const has = (flag: string): boolean => argv.includes(flag);
  if (has("--dry-run") && has("--apply")) {
    fail("Kuru sayım ve yazma birlikte verilmez.");
  }
  if (has("--verify") && (has("--apply") || has("--delete-retired"))) {
    fail("--verify yalnız başına verilir.");
  }
  return { apply: has("--apply"), verify: has("--verify"), deleteRetired: has("--delete-retired") };
}

function loadConfig(): R2MediaConfig {
  try {
    return readR2MediaConfig({
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
      R2_ENDPOINT: process.env.R2_ENDPOINT,
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
      NEXT_PUBLIC_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_MEDIA_BASE_URL,
    });
  } catch (error) {
    fail(errorText(error));
  }
}

/** Sınırlı eşzamanlılıkla eşleme. Sonuç girdi sırasını korur. */
async function mapPool<T, R>(items: readonly T[], work: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array<R>(items.length);
  let cursor = 0;
  const lanes = Array.from({ length: Math.min(WORKERS, items.length) }, async () => {
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
      results[index] = await work(item);
    }
  });
  await Promise.all(lanes);
  return results;
}

function mb(items: readonly R2SyncItem[]): string {
  return (items.reduce((sum, item) => sum + item.bytes, 0) / MIB).toFixed(1);
}

function summarize(items: readonly R2SyncItem[]): void {
  const audio = items.filter((item) => item.category === "junior-audio");
  const covers = items.filter((item) => item.category === "junior-covers");
  const locked = items.filter((item) => item.objectKey.startsWith("private/")).length;
  say(`mühürlü ses ve fon müziği: ${audio.length} nesne, ${mb(audio)} MB`);
  say(`mühürlü kapak: ${covers.length} nesne, ${mb(covers)} MB`);
  say(`kilitli (private/junior): ${locked}; ücretsiz önizleme (media/junior): ${items.length - locked}`);
  say(`toplam: ${items.length} nesne, ${mb(items)} MB`);
}

function lessonNameOf(item: R2SyncItem): string {
  const base = item.diskRelative.slice(item.diskRelative.lastIndexOf("/") + 1);
  return base.slice(0, base.lastIndexOf("."));
}

/** Manifest kaydı. Fon müziğinin kaydı yoktur; yalnız SHA-256 hesaplanır. */
function expectedEntry(item: R2SyncItem): { readonly sha256: string; readonly bytes?: number } | null {
  if (item.category === "junior-scenes") {
    // Sahne görselinin manifesti yoktur; yalnız yerel SHA-256 hesaplanır.
    return null;
  }
  const name = lessonNameOf(item);
  if (name === BGM_NAME) {
    return null;
  }
  if (item.category === "junior-audio") {
    const entry = JUNIOR_AUDIO_MANIFEST[name];
    if (!entry) {
      fail(`Ses manifestinde kayıt yok: ${name}`);
    }
    return entry;
  }
  const cover = JUNIOR_COVER_MANIFEST[name];
  if (!cover) {
    fail(`Kapak manifestinde kayıt yok: ${name}`);
  }
  return cover;
}

async function localSha256(item: R2SyncItem): Promise<string> {
  return hashPayload(await readFile(resolve(ROOT, item.diskRelative)));
}

/** Yerel dosyaları manifestle karşılaştırır. Bir uyumsuzluk varsa yükleme yapılmaz. */
async function planLocal(items: readonly R2SyncItem[]): Promise<Planned[]> {
  const rows = await mapPool(items, async (item) => {
    const expected = expectedEntry(item);
    const sha256 = await localSha256(item);
    const issues: string[] = [];
    if (expected && expected.bytes !== undefined && expected.bytes !== item.bytes) {
      issues.push(`bayt uyuşmuyor: ${item.diskRelative}`);
    }
    if (expected && expected.sha256 !== sha256) {
      issues.push(`SHA-256 uyuşmuyor: ${item.diskRelative}`);
    }
    return { item, sha256, issues };
  });
  const issues = rows.flatMap((row) => row.issues);
  if (issues.length > 0) {
    fail(["Yerel dosyalar manifestle eşleşmiyor. Yükleme yapılmadı.", ...issues.slice(0, 20)].join("\n"));
  }
  return rows.map((row) => ({ item: row.item, sha256: row.sha256 }));
}

async function headObject(config: R2MediaConfig, objectKey: string): Promise<Head> {
  const signed = signR2Request({
    method: "HEAD",
    endpoint: config.endpoint,
    bucket: config.bucket,
    objectKey,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    payloadHash: R2_EMPTY_PAYLOAD_HASH,
  });
  const response = await fetch(signed.url, {
    method: "HEAD",
    headers: signed.headers,
    signal: AbortSignal.timeout(60_000),
  });
  const raw = response.headers.get("content-length");
  const parsed = raw === null ? Number.NaN : Number(raw);
  return {
    status: response.status,
    length: Number.isFinite(parsed) ? parsed : null,
    sha256: response.headers.get("x-amz-meta-sha256"),
  };
}

/** Nesneyi indirir ve gövdeyi SHA-256 ile özetler. Doğrulamanın asıl kaynağı budur. */
async function getDigest(
  config: R2MediaConfig,
  objectKey: string,
): Promise<{ status: number; length: number; sha256: string }> {
  const signed = signR2Request({
    method: "GET",
    endpoint: config.endpoint,
    bucket: config.bucket,
    objectKey,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    payloadHash: R2_EMPTY_PAYLOAD_HASH,
  });
  const response = await fetch(signed.url, {
    method: "GET",
    headers: signed.headers,
    signal: AbortSignal.timeout(300_000),
  });
  if (!response.ok) {
    return { status: response.status, length: -1, sha256: "" };
  }
  const body = Buffer.from(await response.arrayBuffer());
  return { status: response.status, length: body.length, sha256: hashPayload(body) };
}

async function putObject(config: R2MediaConfig, planned: Planned): Promise<void> {
  const body = await readFile(resolve(ROOT, planned.item.diskRelative));
  if (hashPayload(body) !== planned.sha256) {
    throw new Error(`Yükleme öncesi dosya değişti: ${planned.item.diskRelative}`);
  }
  const signed = signR2Request({
    method: "PUT",
    endpoint: config.endpoint,
    bucket: config.bucket,
    objectKey: planned.item.objectKey,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    payloadHash: planned.sha256,
    contentType: contentTypeForObjectKey(planned.item.objectKey),
    cacheControl: R2_OBJECT_CACHE_CONTROL,
    metadata: { sha256: planned.sha256 },
  });
  const response = await fetch(signed.url, {
    method: "PUT",
    headers: signed.headers,
    body: new Uint8Array(body),
    signal: AbortSignal.timeout(300_000),
  });
  await response.arrayBuffer().catch(() => undefined);
  if (!response.ok) {
    throw new Error(`PUT ${response.status} ${planned.item.objectKey}`);
  }
}

async function deleteObject(config: R2MediaConfig, objectKey: string): Promise<number> {
  const signed = signR2Request({
    method: "DELETE",
    endpoint: config.endpoint,
    bucket: config.bucket,
    objectKey,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    payloadHash: R2_EMPTY_PAYLOAD_HASH,
  });
  const response = await fetch(signed.url, {
    method: "DELETE",
    headers: signed.headers,
    signal: AbortSignal.timeout(60_000),
  });
  await response.arrayBuffer().catch(() => undefined);
  return response.status;
}

async function verifyAll(config: R2MediaConfig, planned: readonly Planned[]): Promise<string[]> {
  const problems = await mapPool(planned, async ({ item, sha256 }) => {
    try {
      const got = await getDigest(config, item.objectKey);
      if (got.status !== 200) {
        return `GET ${got.status}: ${item.objectKey}`;
      }
      if (got.length !== item.bytes) {
        return `boyut uyuşmuyor: ${item.objectKey} (${got.length} ≠ ${item.bytes})`;
      }
      if (got.sha256 !== sha256) {
        return `SHA-256 uyuşmuyor: ${item.objectKey}`;
      }
      return null;
    } catch (error) {
      return `doğrulama hatası: ${item.objectKey} (${errorText(error)})`;
    }
  });
  return problems.filter((problem): problem is string => problem !== null);
}

async function verifyOnly(config: R2MediaConfig, planned: readonly Planned[]): Promise<void> {
  const issues = await verifyAll(config, planned);
  if (issues.length > 0) {
    fail(["SHA-256 doğrulaması BAŞARISIZ:", ...issues.slice(0, 20)].join("\n"));
  }
  say(`doğrulandı (indirip SHA-256): ${planned.length}/${planned.length}`);
}

async function applyAll(config: R2MediaConfig, planned: readonly Planned[]): Promise<void> {
  let uploaded = 0;
  let same = 0;
  const failures = await mapPool(planned, async (row) => {
    try {
      const head = await headObject(config, row.item.objectKey);
      if (head.status === 200 && head.length === row.item.bytes && head.sha256 === row.sha256) {
        same += 1;
        return null;
      }
      await putObject(config, row);
      uploaded += 1;
      return null;
    } catch (error) {
      return `${row.item.objectKey}: ${errorText(error)}`;
    }
  });
  const errors = failures.filter((failure): failure is string => failure !== null);
  say(`yüklendi: ${uploaded}`);
  say(`aynı olduğu için atlandı: ${same}`);
  if (errors.length > 0) {
    fail(["Yükleme hataları:", ...errors.slice(0, 20)].join("\n"));
  }
  await verifyOnly(config, planned);
}

async function retiredFlow(
  config: R2MediaConfig,
  apply: boolean,
  sealedObjectKeys: ReadonlySet<string>,
): Promise<void> {
  const lessons = retiredJuniorLessonKeys({
    repoRoot: ROOT,
    sealedLessonKeys: SEALED_KEYS,
    knownLessonKeys: KNOWN_KEYS,
  });
  const candidates = lessons.flatMap(retiredR2ObjectKeys);
  const clash = candidates.filter((key) => sealedObjectKeys.has(key));
  if (clash.length > 0) {
    fail(`Emekli aday mühürlü nesneyle çakıştı, işlem durduruldu: ${clash.join(", ")}`);
  }
  say(`emekli ders anahtarı: ${lessons.length} (${lessons.join(", ")})`);

  const heads = await mapPool(candidates, async (key) => ({
    key,
    status: (await headObject(config, key)).status,
  }));
  const unexpected = heads.filter((row) => row.status !== 200 && row.status !== 404);
  if (unexpected.length > 0) {
    fail(
      ["Kova yanıtı beklenmedik, silme yapılmadı:", ...unexpected.map((row) => `${row.key} → ${row.status}`)].join("\n"),
    );
  }
  const present = heads.filter((row) => row.status === 200).map((row) => row.key);
  say(`kovada bulunan emekli nesne: ${present.length} / aday ${candidates.length}`);
  for (const key of present) {
    say(`  ${key}`);
  }
  if (!apply) {
    say("Silinmedi. Silmek için --delete-retired --apply.");
    return;
  }

  const deletions = await mapPool(present, async (key) => {
    try {
      return { key, status: await deleteObject(config, key), error: "" };
    } catch (error) {
      return { key, status: -1, error: errorText(error) };
    }
  });
  const badDelete = deletions.filter((row) => row.status !== 200 && row.status !== 204);
  if (badDelete.length > 0) {
    fail(["Silme hataları:", ...badDelete.map((row) => `${row.key} → ${row.status} ${row.error}`)].join("\n"));
  }

  const after = await mapPool(candidates, async (key) => ({
    key,
    status: (await headObject(config, key)).status,
  }));
  const still = after.filter((row) => row.status !== 404);
  if (still.length > 0) {
    fail(["Silme sonrası hâlâ görünen nesneler:", ...still.map((row) => `${row.key} → ${row.status}`)].join("\n"));
  }
  say(`silinen: ${present.length}; silme sonrası tüm ${candidates.length} aday nesne 404`);
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const items = [...listR2SealedJuniorMedia(ROOT, SEALED_KEYS), ...listR2FreeSceneMedia(ROOT)];
  const sealedObjectKeys = new Set(items.map((item) => item.objectKey));

  if (flags.deleteRetired) {
    say(flags.apply ? "mod: emekli nesneleri sil" : "mod: emekli kuru sayım");
    await retiredFlow(loadConfig(), flags.apply, sealedObjectKeys);
    return;
  }

  say(flags.apply ? "mod: yaz ve doğrula" : flags.verify ? "mod: yalnız doğrula" : "mod: kuru sayım (ağ yok)");
  summarize(items);
  const planned = await planLocal(items);
  say(`yerel denetim tamam: ${planned.length} nesne; manifestli dosyalar SHA-256 ve bayt ile eşleşti`);

  if (flags.apply) {
    await applyAll(loadConfig(), planned);
    say("Bitti. Yerel dosyalar duruyor.");
    return;
  }
  if (flags.verify) {
    await verifyOnly(loadConfig(), planned);
    return;
  }
  say("Kovaya yazılmadı. Yazmak için --apply.");
}

main().catch((error: unknown) => fail(errorText(error)));
