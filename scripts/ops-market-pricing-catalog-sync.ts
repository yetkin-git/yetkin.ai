#!/usr/bin/env tsx
/**
 * ADIM 40 — Türkiye dijital pazar katalog tohum senkronu.
 * Academy + freelancer floor tutar/bandını lib sicilinden yazar;
 * her amountMinor değişiminde PriceCatalogDecisionLedger (MACRO_INDEX_ADJUSTMENT).
 *
 *   npm run ops:market-pricing-catalog-sync
 *
 * Canlı Direct Postgres ister. Sessiz zam yok.
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import {
  ACADEMY_COURSE_SEEDS,
  ACADEMY_SEED_CURRENCY,
  ACADEMY_SEED_MODULE_KEY,
} from "@/lib/academy/seed";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import {
  FREELANCER_CATALOG_SEEDS,
  FREELANCER_JOB_FLOOR_UNIT_KEY,
  FREELANCER_SEED_CURRENCY,
  FREELANCER_SEED_MODULE_KEY,
} from "@/lib/freelancer/seed";
import {
  isForbiddenPoolerUrl,
  resolveMigratorConnectionUrl,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";

const ROOT = process.cwd();
const REASON_CODE = "MACRO_INDEX_ADJUSTMENT" as const;
const REASON = "Türkiye Dijital Pazar Fiyatlandırma Revizyonu";
const ACTOR = PLATFORM_TREASURY_USER_ID;

dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:market-pricing-catalog-sync BAŞARISIZ: ${message}`);
  process.exit(1);
}

type Target = {
  id: string;
  moduleKey: string;
  unitKey: string;
  unitType: "MINOR" | "BPS";
  amountMinor: number;
  minMinor: number;
  maxMinor: number;
  currencyCode: string;
  description: string;
};

function academyTargets(): Target[] {
  return ACADEMY_COURSE_SEEDS.map((row) => ({
    id: row.catalogEntryId,
    moduleKey: ACADEMY_SEED_MODULE_KEY,
    unitKey: row.catalogUnitKey,
    unitType: "MINOR",
    amountMinor: row.seedAmountMinor,
    minMinor: row.seedMinMinor,
    maxMinor: row.seedMaxMinor,
    currencyCode: ACADEMY_SEED_CURRENCY,
    description: `Akademi kurs birim fiyatı — ${row.title} (S11-A).`,
  }));
}

function freelancerFloorTarget(): Target {
  const floor = FREELANCER_CATALOG_SEEDS.find((row) => row.unitKey === FREELANCER_JOB_FLOOR_UNIT_KEY);
  if (!floor) {
    fail("freelancer job-posting:floor tohumu yok.");
  }
  return {
    id: floor.id,
    moduleKey: FREELANCER_SEED_MODULE_KEY,
    unitKey: floor.unitKey,
    unitType: floor.unitType,
    amountMinor: floor.seedAmountMinor,
    minMinor: floor.seedMinMinor,
    maxMinor: floor.seedMaxMinor,
    currencyCode: FREELANCER_SEED_CURRENCY,
    description: floor.description,
  };
}

async function syncTarget(
  prisma: PrismaClient,
  target: Target,
): Promise<{ changed: boolean; oldMinor: number | null; newMinor: number }> {
  const existing = await prisma.priceCatalogEntry.findUnique({
    where: {
      moduleKey_unitKey: { moduleKey: target.moduleKey, unitKey: target.unitKey },
    },
    select: {
      id: true,
      amountMinor: true,
      unitType: true,
      currencyCode: true,
    },
  });

  const oldMinor = existing?.amountMinor ?? null;
  const amountChanged = oldMinor !== target.amountMinor;

  await prisma.$transaction(async (tx) => {
    const row = await tx.priceCatalogEntry.upsert({
      where: {
        moduleKey_unitKey: { moduleKey: target.moduleKey, unitKey: target.unitKey },
      },
      create: {
        id: target.id,
        moduleKey: target.moduleKey,
        unitKey: target.unitKey,
        unitType: target.unitType,
        amountMinor: target.amountMinor,
        currencyCode: target.currencyCode,
        isActive: true,
        minMinor: target.minMinor,
        maxMinor: target.maxMinor,
        description: target.description,
        updatedBy: ACTOR,
      },
      update: {
        amountMinor: target.amountMinor,
        currencyCode: target.currencyCode,
        isActive: true,
        minMinor: target.minMinor,
        maxMinor: target.maxMinor,
        description: target.description,
        updatedBy: ACTOR,
      },
      select: { id: true },
    });

    if (amountChanged) {
      await tx.priceCatalogDecisionLedger.create({
        data: {
          catalogEntryId: row.id,
          moduleKey: target.moduleKey,
          unitKey: target.unitKey,
          unitType: target.unitType,
          reasonCode: REASON_CODE,
          reason: REASON,
          oldMinor: oldMinor ?? 0,
          newMinor: target.amountMinor,
          currencyCode: target.currencyCode,
          actorUserId: ACTOR,
        },
      });
    }
  });

  return { changed: amountChanged, oldMinor, newMinor: target.amountMinor };
}

async function main(): Promise<void> {
  const url = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!url) {
    fail("DIRECT_URL veya DATABASE_URL yok. .system_docs/OPS_RUNBOOK.md");
  }
  if (isForbiddenPoolerUrl(url)) {
    fail("Senkron işlem havuzu (:6543 / pooler) üzerinden çalışmaz.");
  }

  const pool = new Pool({
    connectionString: withPgLibpqSslCompat(url),
    max: 4,
    connectionTimeoutMillis: 15_000,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const targets = [...academyTargets(), freelancerFloorTarget()];
  let changed = 0;
  let bandOnly = 0;

  try {
    console.log(`ops:market-pricing-catalog-sync — ${targets.length} birim · ${REASON_CODE}`);
    for (const target of targets) {
      const result = await syncTarget(prisma, target);
      const key = `${target.moduleKey}:${target.unitKey}`;
      if (result.changed) {
        changed += 1;
        console.log(
          `  ${key}: amountMinor ${result.oldMinor ?? "∅"} → ${result.newMinor} (+defter)`,
        );
      } else {
        bandOnly += 1;
        console.log(`  ${key}: amountMinor ${result.newMinor} (aynı; min/max hizalandı)`);
      }
    }
    console.log(
      `ops:market-pricing-catalog-sync OK — defter ${changed}, band-only ${bandOnly}, reason="${REASON}"`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(message);
});
