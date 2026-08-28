#!/usr/bin/env tsx
/**
 * Mutabakat sapması (payment_anomalies) — yalnız okuma. Admin HTTP yok.
 * Cüzdan / defter düzeltilmez.
 *
 *   npm run ops:list-payment-anomalies
 *   npm run ops:list-payment-anomalies -- --limit 20
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import {
  isForbiddenPoolerUrl,
  resolveMigratorConnectionUrl,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";
import {
  formatPaymentAnomalyList,
  listPaymentAnomalies,
  parseAnomalyListCliArgs,
} from "./ops-list-payment-anomalies-lib";

const ROOT = process.cwd();

dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:list-payment-anomalies BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const { limit } = parseAnomalyListCliArgs(process.argv.slice(2));
  const url = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!url) {
    fail("DIRECT_URL veya DATABASE_URL yok. .system_docs/OPS_RUNBOOK.md");
  }
  if (isForbiddenPoolerUrl(url)) {
    fail("Anomali listesi işlem havuzu (:6543 / pooler) üzerinden çalışmaz.");
  }

  const client = new Client({ connectionString: withPgLibpqSslCompat(url) });
  await client.connect();
  try {
    const rows = await listPaymentAnomalies(client, limit);
    console.log(`ops:list-payment-anomalies — ${rows.length} satır (limit ${limit}). Cüzdan düzeltilmez.`);
    console.log(formatPaymentAnomalyList(rows));
    console.log("ops:list-payment-anomalies OK — HTTP yüzeyi yok.");
  } finally {
    await client.end();
  }
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
