#!/usr/bin/env tsx
/**
 * Lab Postgres pg_dump → ayrı restore slot → defter / idempotency / requestId karşılaştırması.
 * Kaynak yetkin_rail_lab üzerine yazılmaz.
 *
 *   npm run ops:pg-backup-restore
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import {
  LAB_POSTGRES_DEFAULT_URL,
  isLabLoopbackUrl,
} from "./ops-migrate-lib";
import { runLabBackupRestore } from "./ops-pg-backup-restore-lib";

const ROOT = process.cwd();

dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:pg-backup-restore BAŞARISIZ: ${message}`);
  process.exit(1);
}

function resolveLabUrl(): string {
  const candidates = [
    process.env.RAIL_PG_LAB_URL,
    process.env.DIRECT_URL,
    process.env.DATABASE_URL,
  ];
  for (const raw of candidates) {
    const url = raw?.trim();
    if (url && isLabLoopbackUrl(url)) {
      return url;
    }
  }
  return LAB_POSTGRES_DEFAULT_URL;
}

async function main(): Promise<void> {
  const sourceUrl = resolveLabUrl();
  if (!isLabLoopbackUrl(sourceUrl)) {
    fail(
      "Yalnız loopback yetkin_rail_lab. Hosted dump bu betikte yok — Direct :5432 pg_dump --format=custom; restore ayrı proje. .system_docs/OPS_RUNBOOK.md §19.",
    );
  }
  console.log("ops:pg-backup-restore — kaynak yetkin_rail_lab, hedef yetkin_rail_lab_restore.");
  const result = await runLabBackupRestore({
    sourceUrl,
    dumpDir: resolve(ROOT, ".tmp", "pg-lab", "backups"),
  });
  console.log(`   dump ${result.dumpMs}ms — ${result.dumpPath}`);
  console.log(`   restore ${result.restoreMs}ms`);
  console.log(
    `   ledger=${result.restored.ledgerCount} idempotency=${result.restored.idempotencyCount} anomaly.requestId=${result.restored.anomalyCount} wallets=${result.restored.walletCount}`,
  );
  console.log("ops:pg-backup-restore OK — satır sayıları, idempotency_key ve request_id birebir.");
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
