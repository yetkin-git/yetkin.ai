#!/usr/bin/env tsx
/**
 * Development Super Admin lab bağışı.
 *
 *   npx tsx scripts/ops-super-admin-academy-grant.ts --email yapinet360@gmail.com
 *
 * academy_purchases.price_lock_id = sa_grant:{userId}:{courseId}, amount_minor = 0.
 * ledger_entries / wallets yazılmaz. PayTR ve sahte CREDIT yok.
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import { ACADEMY_CATALOG_SEEDS } from "@/lib/academy/catalog-seed";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import {
  isForbiddenPoolerUrl,
  resolveMigratorConnectionUrl,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";
import {
  parseSuperAdminGrantEmailArg,
  runSuperAdminAcademyGrants,
  type SuperAdminGrantCourseSeed,
  type SuperAdminGrantPort,
} from "./ops-super-admin-academy-grant-lib";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:super-admin-academy-grant BAŞARISIZ: ${message}`);
  process.exit(1);
}

function seeds(): SuperAdminGrantCourseSeed[] {
  return ACADEMY_CATALOG_SEEDS.filter((row) =>
    (ACADEMY_GROWTH_SKU_SLUGS as readonly string[]).includes(row.slug),
  ).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    catalogUnitKey: row.catalogUnitKey,
    globalRank: row.globalRank,
    localRank: row.localRank,
    trendScore: row.trendScore,
  }));
}

function createPgPort(client: Client): SuperAdminGrantPort {
  return {
    async findUserByEmail(email) {
      const result = await client.query<{ id: string; email: string }>(
        `SELECT id, email FROM users WHERE lower(email) = lower($1) LIMIT 1`,
        [email],
      );
      return result.rows[0] ?? null;
    },
    async findUserById(id) {
      const result = await client.query<{ id: string; email: string }>(
        `SELECT id, email FROM users WHERE id = $1 LIMIT 1`,
        [id],
      );
      return result.rows[0] ?? null;
    },
    async listCoursesBySlugs(slugs) {
      if (slugs.length === 0) {
        return [];
      }
      const result = await client.query<{ id: string; slug: string }>(
        `SELECT id, slug FROM academy_courses WHERE slug = ANY($1::text[])`,
        [slugs],
      );
      return result.rows;
    },
    async listPurchasesForUser(userId) {
      const result = await client.query<{ course_id: string; price_lock_id: string }>(
        `SELECT course_id, price_lock_id FROM academy_purchases WHERE user_id = $1`,
        [userId],
      );
      return result.rows.map((row) => ({
        courseId: row.course_id,
        priceLockId: row.price_lock_id,
      }));
    },
    async insertCourse(seed) {
      await client.query(
        `INSERT INTO academy_courses (
           id, slug, title, summary, catalog_unit_key,
           global_rank, local_rank, trend_score, is_published, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          seed.id,
          seed.slug,
          seed.title,
          seed.summary,
          seed.catalogUnitKey,
          seed.globalRank,
          seed.localRank,
          seed.trendScore,
        ],
      );
    },
    async insertGrant(purchase) {
      await client.query(
        `INSERT INTO academy_purchases (
           id, user_id, course_id, price_lock_id, amount_minor, currency_code,
           status, settled_at, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, 'SETTLED', $7, $8, $9)
         ON CONFLICT (user_id, course_id) DO NOTHING`,
        [
          purchase.id,
          purchase.userId,
          purchase.courseId,
          purchase.priceLockId,
          purchase.amountMinor,
          purchase.currencyCode,
          purchase.settledAt,
          purchase.createdAt,
          purchase.updatedAt,
        ],
      );
    },
    async countLedgerEntries(userId) {
      const result = await client.query<{ n: string }>(
        `SELECT COUNT(*)::text AS n FROM ledger_entries WHERE user_id = $1`,
        [userId],
      );
      return Number(result.rows[0]?.n ?? 0);
    },
    async countWalletRows(userId) {
      const result = await client.query<{ n: string }>(
        `SELECT COUNT(*)::text AS n FROM wallets WHERE user_id = $1`,
        [userId],
      );
      return Number(result.rows[0]?.n ?? 0);
    },
  };
}

async function main(): Promise<void> {
  const email = parseSuperAdminGrantEmailArg(
    process.argv.slice(2),
    process.env.CANONICAL_SUPER_ADMIN_EMAIL,
  );
  const url = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!url) {
    fail("DIRECT_URL veya DATABASE_URL yok. .system_docs/OPS_RUNBOOK.md");
  }
  if (isForbiddenPoolerUrl(url)) {
    fail("Bağış işlem havuzu (:6543 / pooler) üzerinden çalışmaz.");
  }

  const client = new Client({ connectionString: withPgLibpqSslCompat(url) });
  await client.connect();
  try {
    const result = await runSuperAdminAcademyGrants(createPgPort(client), {
      email,
      userId: process.env.SUPER_ADMIN_USER_ID,
      nodeEnv: process.env.NODE_ENV,
      slugs: ACADEMY_GROWTH_SKU_SLUGS,
      seeds: seeds(),
    });
    console.log(`   user=${result.email}`);
    console.log(`   ledger=${result.ledgerCountAfter} (önce ${result.ledgerCountBefore})`);
    console.log(`   wallets=${result.walletCountAfter} (önce ${result.walletCountBefore})`);
    for (const item of result.items) {
      console.log(`   ${item.slug} ${item.action} applied=${item.applied} courseId=${item.courseId}`);
    }
    console.log("   oyna http://localhost:3000/academy/ai-temel/oyna");
    console.log("ops:super-admin-academy-grant OK — nakit defteri dokunulmadı.");
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  } finally {
    await client.end();
  }
}

void main();
