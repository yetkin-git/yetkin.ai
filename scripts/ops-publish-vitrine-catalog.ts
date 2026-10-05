#!/usr/bin/env tsx
/**
 * Vitrin kataloğu yayını.
 * Üretim mührü (beş katman anlığı) açık olan SKU için:
 * academy_courses.is_published = true ve PriceCatalogEntry.is_active = true.
 * Super Admin tutarı (updated_by dolu) ezilmez. Tutar değişirse karar defterine düşer.
 *
 *   npm run ops:publish-vitrine-catalog
 *
 * Canlı Direct Postgres ister. Sır basmaz.
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { ACADEMY_CATALOG_PRICE_WINDOW } from "@/lib/academy/catalog-pricing";
import { ACADEMY_VITRINE_SHELL_SKU_SLUGS, academyCourseSaleOpen } from "@/lib/academy/pilot-sku";
import { ACADEMY_PRODUCTION_SEAL_MANIFEST } from "@/lib/academy/production-seal-manifest";
import "@/lib/academy/production-seal-disk";
import { registerAcademyProductionDiskProbe } from "@/lib/academy/production-standard";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import {
  CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT,
  CITIZEN_TEST_ACCOUNT_EMAIL,
} from "@/lib/kernel/auth/super-admin";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import {
  courseRegistryBySlug,
  courseRegistryPriceEntryId,
  courseRegistryRowId,
  courseRegistryUnitKey,
} from "@yetkin/kernel/catalog-ids/course-registry";
import { resolveMigrateApplyTarget, withPgLibpqSslCompat } from "./ops-migrate-lib";

const ROOT = process.cwd();
const REASON_CODE = "ADMIN_MANUAL" as const;
const REASON = "Vitrin katalog yayini. Satis kilidi acildi. Super Admin tutari korunur.";

dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

registerAcademyProductionDiskProbe((relativePath) => {
  const normalized = relativePath.replaceAll("\\", "/");
  return ACADEMY_PRODUCTION_SEAL_MANIFEST[normalized] === true;
});

function fail(message: string): never {
  console.error(`ops:publish-vitrine-catalog BAŞARISIZ: ${message}`);
  process.exit(1);
}

function ranksFor(slug: string, seedRanks: { globalRank: number; localRank: number } | null) {
  if (seedRanks) {
    return seedRanks;
  }
  if (slug === "01_office_ai_ileri") {
    return { globalRank: 14, localRank: 2 };
  }
  return { globalRank: 99, localRank: 99 };
}

async function reportSuperAdmin(prisma: PrismaClient): Promise<void> {
  const emailEnv = process.env.CANONICAL_SUPER_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const userIdEnv = process.env.SUPER_ADMIN_USER_ID?.trim() ?? "";
  const emailIsDefault = emailEnv === CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT;
  const emailIsCitizen = emailEnv === CITIZEN_TEST_ACCOUNT_EMAIL;
  const productionReady = Boolean(emailEnv && userIdEnv && !emailIsCitizen);
  console.log(
    `  kimlik: emailEnv=${emailEnv ? "dolu" : "bos"} canonicalDefault=${emailIsDefault ? "evet" : "hayir"} uuidEnv=${userIdEnv ? "dolu" : "bos"} productionGate=${productionReady ? "hazir" : "kapali"}`,
  );

  try {
    const rows = await prisma.$queryRaw<Array<{ confirmed: boolean; id: string }>>`
      SELECT (email_confirmed_at IS NOT NULL) AS confirmed, id::text AS id
      FROM auth.users
      WHERE lower(email) = ${CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) {
      console.log("  auth.users: kanonik hesap yok");
      return;
    }
    const uuidMatch = Boolean(userIdEnv) && row.id === userIdEnv;
    console.log(
      `  auth.users: hesap=var confirmed=${row.confirmed ? "evet" : "hayir"} uuidMatch=${uuidMatch ? "evet" : "hayir"}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`  auth.users: okunamadi (${message.split("\n")[0]})`);
  }
}

async function publishSlug(prisma: PrismaClient, slug: string): Promise<"published" | "skipped"> {
  if (!academyCourseSaleOpen(slug)) {
    console.log(`  ${slug}: bes katman muhuru kapali — yayinlanmadi`);
    return "skipped";
  }
  const card = courseRegistryBySlug(slug);
  if (!card || card.audience !== "adult") {
    console.log(`  ${slug}: kayit defterinde yok — yayinlanmadi`);
    return "skipped";
  }
  const ranks = ranksFor(slug, card.seedRanks);
  const unitKey = courseRegistryUnitKey(slug);
  const courseId = courseRegistryRowId(slug);
  const priceId = courseRegistryPriceEntryId(slug);

  await prisma.$transaction(async (tx) => {
    await tx.academyCourse.upsert({
      where: { slug },
      create: {
        id: courseId,
        slug,
        title: card.title,
        summary: card.summary,
        catalogUnitKey: unitKey,
        globalRank: ranks.globalRank,
        localRank: ranks.localRank,
        trendScore: ranks.globalRank * ranks.localRank,
        isPublished: true,
      },
      update: {
        title: card.title,
        summary: card.summary,
        catalogUnitKey: unitKey,
        globalRank: ranks.globalRank,
        localRank: ranks.localRank,
        trendScore: ranks.globalRank * ranks.localRank,
        isPublished: true,
      },
    });

    const existing = await tx.priceCatalogEntry.findUnique({
      where: { moduleKey_unitKey: { moduleKey: ACADEMY_MODULE_KEY, unitKey } },
      select: { id: true, amountMinor: true, updatedBy: true },
    });
    const operatorOwned = Boolean(existing?.updatedBy?.trim());
    const nextAmount = operatorOwned ? existing!.amountMinor : card.priceSeedMinor;
    const amountChanged = (existing?.amountMinor ?? null) !== nextAmount;

    const row = await tx.priceCatalogEntry.upsert({
      where: { moduleKey_unitKey: { moduleKey: ACADEMY_MODULE_KEY, unitKey } },
      create: {
        id: priceId,
        moduleKey: ACADEMY_MODULE_KEY,
        unitKey,
        unitType: "MINOR",
        amountMinor: card.priceSeedMinor,
        currencyCode: SETTLEMENT_CURRENCY,
        isActive: true,
        minMinor: ACADEMY_CATALOG_PRICE_WINDOW.minMinor,
        maxMinor: ACADEMY_CATALOG_PRICE_WINDOW.maxMinor,
        description: `Akademi kurs birim fiyati — ${card.code} (KDV dahil).`,
        updatedBy: null,
      },
      update: {
        isActive: true,
        currencyCode: SETTLEMENT_CURRENCY,
        minMinor: ACADEMY_CATALOG_PRICE_WINDOW.minMinor,
        maxMinor: ACADEMY_CATALOG_PRICE_WINDOW.maxMinor,
        ...(operatorOwned ? {} : { amountMinor: card.priceSeedMinor }),
      },
      select: { id: true },
    });

    if (amountChanged) {
      await tx.priceCatalogDecisionLedger.create({
        data: {
          catalogEntryId: row.id,
          moduleKey: ACADEMY_MODULE_KEY,
          unitKey,
          unitType: "MINOR",
          reasonCode: REASON_CODE,
          reason: REASON,
          oldMinor: existing?.amountMinor ?? 0,
          newMinor: nextAmount,
          currencyCode: SETTLEMENT_CURRENCY,
          actorUserId: PLATFORM_TREASURY_USER_ID,
        },
      });
    }
  });

  console.log(`  ${slug}: yayinda · ${unitKey} aktif`);
  return "published";
}

async function main(): Promise<void> {
  const target = resolveMigrateApplyTarget({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!target) {
    fail("DIRECT_URL veya DATABASE_URL yok. .system_docs/OPS_RUNBOOK.md");
  }
  console.log(`  baglanti: ${target.via}`);

  const pool = new Pool({
    connectionString: withPgLibpqSslCompat(target.url),
    max: 4,
    connectionTimeoutMillis: 15_000,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    console.log("ops:publish-vitrine-catalog — Super Admin kimlik");
    await reportSuperAdmin(prisma);
    console.log(`ops:publish-vitrine-catalog — ${ACADEMY_VITRINE_SHELL_SKU_SLUGS.length} vitrin SKU`);
    let published = 0;
    for (const slug of ACADEMY_VITRINE_SHELL_SKU_SLUGS) {
      const result = await publishSlug(prisma, slug);
      if (result === "published") {
        published += 1;
      }
    }
    console.log(`ops:publish-vitrine-catalog TAMAM — ${published} SKU yayinda.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(message);
});
