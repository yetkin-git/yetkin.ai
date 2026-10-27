#!/usr/bin/env tsx
/**
 * Tek kullanıcının defteri — yalnız okuma.
 *
 *   npx tsx scripts/ops-inspect-ledger.ts --user=19011370-b324-4a63-937b-b83a2905e91f
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { connectOpsDmlClient } from "./ops-pg-direct-client";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

async function main(): Promise<void> {
  const userId = process.argv.find((part) => part.startsWith("--user="))?.slice("--user=".length).trim();
  if (!userId) {
    throw new Error("--user=<uuid> zorunlu.");
  }
  const { client, via } = await connectOpsDmlClient();
  try {
    const wallet = await client.query(`SELECT id, amount_minor, currency_code FROM wallets WHERE user_id = $1`, [userId]);
    console.log("wallets:", JSON.stringify(wallet.rows));
    const ledger = await client.query(
      `SELECT id, amount_minor, direction, label, purpose, idempotency_key, created_at FROM ledger_entries WHERE user_id = $1 ORDER BY created_at`,
      [userId],
    );
    console.log(`ledger (${ledger.rows.length}) via ${via}:`);
    for (const row of ledger.rows) {
      console.log(` ${row.created_at.toISOString()} ${row.direction} ${row.amount_minor} ${row.purpose} «${row.label}» ${row.idempotency_key}`);
    }
    const locks = await client.query(
      `SELECT id, lock_key, amount_minor, expires_at, consumed_at, created_at FROM checkout_price_locks WHERE user_id = $1 ORDER BY created_at`,
      [userId],
    );
    console.log(`locks (${locks.rows.length}):`, JSON.stringify(locks.rows));
    const orders = await client.query(
      `SELECT merchant_oid, purpose, amount_minor, status, created_at, cleared_at FROM payment_orders WHERE user_id = $1 ORDER BY created_at`,
      [userId],
    );
    console.log(`orders (${orders.rows.length}):`);
    for (const row of orders.rows) {
      console.log(` ${row.created_at.toISOString()} ${row.status} ${row.amount_minor} ${row.purpose} ${row.merchant_oid} cleared=${row.cleared_at?.toISOString() ?? "-"}`);
    }
    const users = await client.query(`SELECT id, email, created_at FROM users WHERE id = $1`, [userId]);
    console.log("users:", JSON.stringify(users.rows));
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(`ops:inspect-ledger BAŞARISIZ: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
