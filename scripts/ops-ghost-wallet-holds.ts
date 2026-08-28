#!/usr/bin/env tsx
/**
 * Cüzdan-fonlu PENDING emanet hayalet envanteri.
 * Fail-closed: CREDIT / REFUNDED / RELEASED basılmaz.
 *
 *   npm run ops:ghost-wallet-holds
 *   npm run ops:ghost-wallet-holds -- --strict
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
  formatGhostWalletHoldInventory,
  ghostWalletHoldExitCode,
  inventoryGhostWalletHolds,
  parseGhostHoldCliArgs,
} from "./ops-ghost-wallet-holds-lib";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:ghost-wallet-holds BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  let limit = 50;
  let strict = false;
  try {
    ({ limit, strict } = parseGhostHoldCliArgs(process.argv.slice(2)));
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }

  const url = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!url) {
    fail("DIRECT_URL veya DATABASE_URL yok. .system_docs/OPS_RUNBOOK.md");
  }
  if (isForbiddenPoolerUrl(url)) {
    fail("Hayalet envanteri işlem havuzu (:6543 / pooler) üzerinden çalışmaz.");
  }

  const client = new Client({ connectionString: withPgLibpqSslCompat(url) });
  await client.connect();
  try {
    const inv = await inventoryGhostWalletHolds(
      {
        query: (sql, params) => client.query(sql, params),
      },
      limit,
    );
    console.log(`ops:ghost-wallet-holds — envanter (strict=${strict ? "evet" : "hayır"}):`);
    console.log(formatGhostWalletHoldInventory(inv));
    const code = ghostWalletHoldExitCode(inv, strict);
    if (code !== 0) {
      console.error("ops:ghost-wallet-holds BAŞARISIZ: hayalet PENDING > 0 (--strict).");
      process.exit(1);
    }
    console.log("ops:ghost-wallet-holds OK — motor fail-closed; otomatik temizlik yok.");
  } finally {
    await client.end();
  }
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
