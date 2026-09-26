#!/usr/bin/env tsx
/**
 * Vatandaş akademi lisansını sıfırlar: satın alma, bağış (sa_grant) ve bağlı sicil.
 *
 *   npx tsx scripts/ops-reset-citizen-academy-license.ts
 *   npx tsx scripts/ops-reset-citizen-academy-license.ts --dry-run
 *
 * Varsayılan: yetkin.vision@gmail.com ve test kalıbı (example / e2e / test).
 * Kanonik Super Admin (yapinet360@gmail.com) silinmez. Cüzdan ve defter durur.
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import type { Client } from "pg";
import { CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT, CITIZEN_TEST_ACCOUNT_EMAIL } from "@/lib/kernel/auth/super-admin";
import { connectOpsDmlClient } from "./ops-pg-direct-client";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

const PROTECTED = new Set([CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT]);

function fail(message: string): never {
  console.error(`ops:reset-citizen-academy-license BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function targetEmails(client: Client): Promise<string[]> {
  const result = await client.query<{ email: string }>(
    `SELECT email
     FROM public.users
     WHERE lower(email) = $1
        OR lower(email) LIKE '%test%'
        OR lower(email) LIKE '%example.%'
        OR lower(email) LIKE 'e2e%'
     ORDER BY email`,
    [CITIZEN_TEST_ACCOUNT_EMAIL],
  );
  return result.rows
    .map((row) => row.email.trim().toLowerCase())
    .filter((email) => email.length > 0 && !PROTECTED.has(email));
}

async function counts(client: Client, emails: string[]) {
  const result = await client.query<{
    email: string;
    purchases: string;
    grants: string;
    commercial: string;
    completions: string;
    certificates: string;
    attempts: string;
  }>(
    `SELECT u.email,
            count(p.id)::text AS purchases,
            count(p.id) FILTER (WHERE p.price_lock_id LIKE 'sa_grant:%')::text AS grants,
            count(p.id) FILTER (WHERE p.status = 'SETTLED' AND p.price_lock_id NOT LIKE 'sa_grant:%')::text AS commercial,
            (SELECT count(*) FROM academy_lesson_completions c WHERE c.user_id = u.id)::text AS completions,
            (SELECT count(*) FROM academy_certificates cert WHERE cert.user_id = u.id)::text AS certificates,
            (SELECT count(*) FROM academy_exam_attempts a WHERE a.user_id = u.id)::text AS attempts
     FROM public.users u
     LEFT JOIN academy_purchases p ON p.user_id = u.id
     WHERE lower(u.email) = ANY($1::text[])
     GROUP BY u.id, u.email
     ORDER BY u.email`,
    [emails],
  );
  return result.rows;
}

async function reset(client: Client, emails: string[]): Promise<void> {
  await client.query("BEGIN");
  try {
    const users = await client.query<{ id: string }>(
      `SELECT id FROM public.users WHERE lower(email) = ANY($1::text[])`,
      [emails],
    );
    const ids = users.rows.map((row) => row.id);
    if (ids.length === 0) {
      await client.query("COMMIT");
      return;
    }
    await client.query(`DELETE FROM academy_certificates WHERE user_id = ANY($1::text[])`, [ids]);
    await client.query(`DELETE FROM academy_exam_attempts WHERE user_id = ANY($1::text[])`, [ids]);
    await client.query(`DELETE FROM academy_lesson_completions WHERE user_id = ANY($1::text[])`, [ids]);
    await client.query(`DELETE FROM academy_exam_sittings WHERE user_id = ANY($1::text[])`, [ids]);
    await client.query(`DELETE FROM academy_purchases WHERE user_id = ANY($1::text[])`, [ids]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const { client, via } = await connectOpsDmlClient();
  try {
    const emails = await targetEmails(client);
    if (!emails.includes(CITIZEN_TEST_ACCOUNT_EMAIL)) {
      const exists = await client.query(`SELECT 1 FROM public.users WHERE lower(email) = $1`, [
        CITIZEN_TEST_ACCOUNT_EMAIL,
      ]);
      if (exists.rowCount === 0) {
        fail(`${CITIZEN_TEST_ACCOUNT_EMAIL} public.users içinde yok.`);
      }
    }
    const before = await counts(client, emails);
    if (!dryRun) {
      await reset(client, emails);
    }
    const after = dryRun ? before : await counts(client, emails);
    console.log(
      JSON.stringify(
        {
          ok: true,
          via,
          dryRun,
          protected: [...PROTECTED],
          emails,
          before,
          after,
        },
        null,
        2,
      ),
    );
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "reset_failed";
  fail(message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted-url]"));
});
