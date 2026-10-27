#!/usr/bin/env tsx
/**
 * PENDING PayTR sipariş listesi — yalnız okuma.
 * Mutabakat (FAILED) yazmaz; sınıflandırma ve yaş raporu verir.
 *
 *   npm run ops:list-paytr-pending
 *   npm run ops:list-paytr-pending -- --json
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import {
  connectOpsDmlClient,
  type OpsDmlPgSession,
} from "./ops-pg-direct-client";
import {
  formatPaytrPendingList,
  paytrPendingSummary,
  type PaytrPendingRow,
} from "./ops-list-paytr-pending-lib";

const ROOT = process.cwd();

dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:list-paytr-pending BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function readPending(session: OpsDmlPgSession): Promise<PaytrPendingRow[]> {
  const result = await session.client.query<{
    merchant_oid: string;
    purpose: string;
    amount_minor: number;
    currency_code: string;
    created_at: Date;
    user_id: string;
  }>(`
    SELECT merchant_oid, purpose, amount_minor, currency_code, created_at, user_id
    FROM payment_orders
    WHERE status = 'PENDING'
    ORDER BY created_at ASC
  `);
  return result.rows.map((row) => ({
    merchantOid: row.merchant_oid,
    purpose: row.purpose,
    amountMinor: Number(row.amount_minor),
    currencyCode: row.currency_code,
    createdAt: new Date(row.created_at),
    userId: row.user_id,
  }));
}

async function main(): Promise<void> {
  const json = process.argv.slice(2).includes("--json");
  const session = await connectOpsDmlClient();
  try {
    const rows = await readPending(session);
    const now = new Date();
    const summary = paytrPendingSummary(rows, now);
    console.log(
      `ops:list-paytr-pending — ${summary.total} PENDING · ${summary.timedOut} tavan aşımı · ${summary.withinWindow} pencere içi · en yaşlı ${summary.oldestHours}h (${session.via})`,
    );
    if (json) {
      console.log(JSON.stringify({ summary, rows }, null, 2));
    } else {
      console.log(formatPaytrPendingList(rows, now));
    }
    console.log("ops:list-paytr-pending OK — yazma yok.");
  } finally {
    await session.client.end();
  }
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
