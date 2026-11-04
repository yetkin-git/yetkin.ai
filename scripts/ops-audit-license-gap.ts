#!/usr/bin/env tsx
/**
 * CLEARED lisans siparişi ↔ academy_purchases / junior_subscriptions.
 * Yalnız okuma. CREDIT yazmaz. Anomali satırı açmaz.
 * Eksik lisans > 0 ise çıkış 1 ve yapılandırılmış error logu.
 *
 *   npm run ops:audit-license-gap
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { connectOpsDmlClient } from "./ops-pg-direct-client";
import {
  evaluateClearedLicenseGaps,
  logLicenseGapScan,
  type AcademyLicenseSeat,
  type JuniorLicenseSeat,
  type LicenseGapOrder,
} from "@/lib/kernel/payments/license-gap";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:audit-license-gap BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const { client, via } = await connectOpsDmlClient();
  try {
    const orders = await client.query<{
      id: string;
      user_id: string;
      merchant_oid: string;
      purpose: string;
      amount_minor: number;
    }>(`
      SELECT id, user_id, merchant_oid, purpose, amount_minor
      FROM payment_orders
      WHERE status = 'CLEARED'
        AND (purpose LIKE 'academy-license:%' OR purpose = 'junior-license:yearly')
      ORDER BY created_at ASC
    `);
    const purchases = await client.query<{ user_id: string; slug: string }>(`
      SELECT p.user_id, c.slug
      FROM academy_purchases p
      JOIN academy_courses c ON c.id = p.course_id
    `);
    const subscriptions = await client.query<{
      user_id: string;
      status: string;
      applied_merchant_oids: string[] | null;
    }>(`
      SELECT user_id, status, applied_merchant_oids
      FROM junior_subscriptions
    `);
    const refunds = await client.query<{ merchant_oid: string }>(`
      SELECT merchant_oid
      FROM wallet_card_refunds
      WHERE status = 'SUCCEEDED' AND merchant_oid IS NOT NULL
    `);

    const licenseOrders: LicenseGapOrder[] = orders.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      merchantOid: row.merchant_oid,
      purpose: row.purpose,
      amountMinor: Number(row.amount_minor),
    }));
    const academySeats: AcademyLicenseSeat[] = purchases.rows.map((row) => ({
      userId: row.user_id,
      courseSlug: row.slug,
    }));
    const juniorSeats: JuniorLicenseSeat[] = subscriptions.rows.map((row) => ({
      userId: row.user_id,
      status: row.status,
      appliedMerchantOids: row.applied_merchant_oids ?? [],
    }));
    const evaluation = evaluateClearedLicenseGaps({
      orders: licenseOrders,
      academySeats,
      juniorSeats,
      refundedMerchantOids: refunds.rows.map((row) => row.merchant_oid),
    });
    logLicenseGapScan(evaluation, "ops-audit-license-gap");

    console.log(
      `ops:audit-license-gap — CLEARED lisans ${licenseOrders.length} · eksik ${evaluation.gaps.length} · iade ile kapanmış ${evaluation.compensated.length} (${via})`,
    );
    for (const row of evaluation.gaps) {
      console.error(
        `EKSIK ${row.product} ${row.reason} · ${row.merchantOid} · ${row.amountMinor} kuruş · ${row.purpose}`,
      );
    }
    if (evaluation.gaps.length > 0) {
      console.error(
        `ops:audit-license-gap UYARI: eksik lisans ${evaluation.gaps.length}. Cüzdan düzeltilmedi.`,
      );
      process.exit(1);
    }
    console.log("ops:audit-license-gap OK — yazma yok.");
  } finally {
    await client.end();
  }
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
