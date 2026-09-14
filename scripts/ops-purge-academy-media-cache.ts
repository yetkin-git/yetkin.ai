#!/usr/bin/env tsx
/**
 * Super Admin — eski akademi medya önbelleğini (academy_audio_cache) siler.
 *
 *   npx tsx scripts/ops-purge-academy-media-cache.ts [--dry-run]
 *
 * Satın alma, sınav, sertifika ve ders tamamlama satırına dokunmaz.
 * Ders gövdesi kod tohumudur; bu script yalnız DB medya referansını sıfırlar.
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { connectOpsDmlClient } from "./ops-pg-direct-client";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:purge-academy-media-cache BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const dryRun = process.argv.slice(2).includes("--dry-run");
  const { client, via } = await connectOpsDmlClient();
  try {
    const before = await client.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM academy_audio_cache`,
    );
    const count = Number(before.rows[0]?.n ?? 0);
    if (dryRun) {
      console.log(
        `ops:purge-academy-media-cache DRY-RUN — via=${via} academy_audio_cache=${count}`,
      );
      return;
    }
    const deleted = await client.query(`DELETE FROM academy_audio_cache`);
    console.log(
      `ops:purge-academy-media-cache OK — via=${via} silinen=${deleted.rowCount ?? 0} (önce ${count})`,
    );
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  } finally {
    await client.end().catch(() => undefined);
  }
}

void main();
