#!/usr/bin/env tsx
/**
 * Deploy gerektirmeyen hibe katalog yazımı ve bakımı.
 *
 *   npx tsx scripts/ops-grant-call.ts seed
 *   npx tsx scripts/ops-grant-call.ts add --file call.json
 *   npx tsx scripts/ops-grant-call.ts update --id kosgeb-is-gelistirme-2026-4 --file patch.json
 *   npx tsx scripts/ops-grant-call.ts verify --id kosgeb-is-gelistirme-2026-4
 *   npx tsx scripts/ops-grant-call.ts verify --all
 *   npx tsx scripts/ops-grant-call.ts refresh --older-than 25
 *   npx tsx scripts/ops-grant-call.ts specs
 *   npx tsx scripts/ops-grant-call.ts unpublish --id kosgeb-is-gelistirme-2026-4
 *
 * `verify --all` yayımlı tüm **açık** satırları yeniden doğrular.
 * `refresh --older-than <gün>` yalnız doğrulaması bu günden eski satırları doğrular;
 * `--older-than` verilmezse `GRANT_REVERIFY_AFTER_DAYS` (25) varsayılır.
 * `specs` şartname tohumunu boş `specification_text` alanlarına işler (idempotent).
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";
import {
  applyGrantSpecificationSeeds,
  createGrantCall,
  patchGrantCall,
  seedMissingGrantCalls,
  unpublishGrantCall,
  verifyGrantCall,
  verifyGrantCalls,
} from "@/lib/yetkinhibe/grant-call-admin";
import { GRANT_REVERIFY_AFTER_DAYS } from "@/lib/yetkinhibe/grant-catalog-core";
import { grantCallPatchSchema, grantCallWriteSchema } from "@/lib/yetkinhibe/grant-call-write-schema";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

function arg(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index < 0) {
    return null;
  }
  return process.argv[index + 1]?.trim() || null;
}

function flag(name: string): boolean {
  return process.argv.includes(name);
}

function readJsonFile(): unknown {
  const file = arg("--file");
  if (!file) {
    throw new Error("--file zorunlu.");
  }
  return JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8")) as unknown;
}

function readOlderThanDays(): number {
  const raw = arg("--older-than");
  if (raw == null) {
    return GRANT_REVERIFY_AFTER_DAYS;
  }
  // "25" ve "25d" biçimleri kabul edilir; başka birim sessizce yorumlanmaz.
  const match = /^(\d{1,4})d?$/.exec(raw);
  if (!match?.[1]) {
    throw new Error("--older-than gün sayısı olmalı (örnek: 25 veya 25d).");
  }
  const days = Number(match[1]);
  if (!Number.isInteger(days) || days < 0) {
    throw new Error("--older-than negatif olamaz.");
  }
  return days;
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command === "seed") {
    const result = await seedMissingGrantCalls(null);
    console.log(JSON.stringify(result));
    return;
  }
  if (command === "specs") {
    console.log(JSON.stringify(await applyGrantSpecificationSeeds(null)));
    return;
  }
  if (command === "add") {
    const parsed = grantCallWriteSchema.safeParse(readJsonFile());
    if (!parsed.success) {
      throw new Error("Çağrı alanları geçersiz.");
    }
    const result = await createGrantCall(parsed.data, null);
    console.log(JSON.stringify(result));
    if (!result.ok) {
      process.exitCode = 1;
    }
    return;
  }
  if (command === "verify" && flag("--all")) {
    const result = await verifyGrantCalls(null);
    console.log(JSON.stringify(result));
    if (result.failed.length > 0) {
      process.exitCode = 1;
    }
    return;
  }
  if (command === "refresh") {
    const olderThanDays = readOlderThanDays();
    const result = await verifyGrantCalls(null, { olderThanDays });
    console.log(JSON.stringify({ olderThanDays, ...result }));
    if (result.failed.length > 0) {
      process.exitCode = 1;
    }
    return;
  }
  const id = arg("--id");
  if (!id) {
    throw new Error("--id zorunlu (verify --all veya refresh --older-than <gün> kullanılabilir).");
  }
  if (command === "update") {
    const parsed = grantCallPatchSchema.safeParse(readJsonFile());
    if (!parsed.success) {
      throw new Error("Çağrı yaması geçersiz.");
    }
    const result = await patchGrantCall(id, parsed.data, null);
    console.log(JSON.stringify(result));
    if (!result.ok) {
      process.exitCode = 1;
    }
    return;
  }
  if (command === "verify") {
    console.log(JSON.stringify(await verifyGrantCall(id, null)));
    return;
  }
  if (command === "unpublish") {
    console.log(JSON.stringify(await unpublishGrantCall(id, null)));
    return;
  }
  throw new Error("Komut: seed | add | update | verify [--id|--all] | refresh --older-than <gün> | specs | unpublish");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "ops-grant-call başarısız.");
  process.exit(1);
});
