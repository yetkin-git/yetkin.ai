#!/usr/bin/env tsx
/**
 * Akademi defteri ↔ `academy_purchases` tutarsızlık denetimi — yalnız okuma.
 *
 *   npm run ops:audit-academy-ledger
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { connectOpsDmlClient } from "./ops-pg-direct-client";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:audit-academy-ledger BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const { client, via } = await connectOpsDmlClient();
  try {
    const debits = await client.query<{
      id: string;
      user_id: string;
      course_id: string;
      amount_minor: number;
      currency_code: string;
      idempotency_key: string;
      created_at: Date;
      email: string | null;
      purchase_rows: string | number;
      wallet_minor: number | null;
      lock_rows: string;
    }>(`
      WITH debits AS (
        SELECT le.id,
               le.user_id,
               le.amount_minor,
               le.currency_code,
               le.idempotency_key,
               le.created_at,
               split_part(split_part(le.idempotency_key, ':', 2), ':', 1) AS parsed_user,
               split_part(le.idempotency_key, ':', 3) AS parsed_course
        FROM ledger_entries le
        WHERE le.purpose = 'academy-purchase' AND le.direction = 'DEBIT'
      )
      SELECT d.id,
             d.user_id,
             d.parsed_course AS course_id,
             d.amount_minor,
             d.currency_code,
             d.idempotency_key,
             d.created_at,
             u.email,
             (SELECT count(*) FROM academy_purchases p WHERE p.user_id = d.user_id AND p.course_id = d.parsed_course) AS purchase_rows,
             (SELECT w.amount_minor FROM wallets w WHERE w.user_id = d.user_id LIMIT 1) AS wallet_minor,
             (SELECT count(*)::text FROM checkout_price_locks c WHERE c.user_id = d.user_id) AS lock_rows
      FROM debits d
      LEFT JOIN users u ON u.id = d.user_id
      ORDER BY d.created_at ASC
    `);

    console.log(`ops:audit-academy-ledger — ${debits.rows.length} akademi DEBIT (${via})`);
    for (const row of debits.rows) {
      const orphan = Number(row.purchase_rows) === 0;
      console.log(
        `${orphan ? "YETİM" : "eşli "} ${row.idempotency_key} · ${row.amount_minor} ${row.currency_code} · ${row.created_at.toISOString()} · ${row.email ?? "(kullanıcı yok)"} · purchase=${row.purchase_rows} wallet=${row.wallet_minor ?? "-"}`,
      );
    }

    const credits = await client.query<{ total: string; rows: string }>(`
      SELECT coalesce(sum(amount_minor), 0)::text AS total, count(*)::text AS rows
      FROM ledger_entries
      WHERE purpose = 'academy-settlement' AND direction = 'CREDIT'
    `);
    console.log(`defter hazine CREDIT: ${credits.rows[0]?.rows} satır / ${credits.rows[0]?.total} kuruş`);

    const purchases = await client.query<{ total: string; rows: string; grants: string }>(`
      SELECT coalesce(sum(amount_minor), 0)::text AS total,
             count(*)::text AS rows,
             count(*) FILTER (WHERE price_lock_id LIKE 'sa_grant:%')::text AS grants
      FROM academy_purchases
    `);
    console.log(
      `academy_purchases: ${purchases.rows[0]?.rows} satır / ${purchases.rows[0]?.total} kuruş / ${purchases.rows[0]?.grants} sa_grant`,
    );
    console.log("ops:audit-academy-ledger OK — yazma yok.");
  } finally {
    await client.end();
  }
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
