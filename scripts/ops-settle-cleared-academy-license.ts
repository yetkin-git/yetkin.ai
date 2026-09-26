#!/usr/bin/env tsx
/**
 * CLEARED cüzdan bakiyesini amiral SKU lisansına çevirir.
 * Nakit bağış değildir: fiyat kilidi + DEBIT + academy_purchases SETTLED.
 *
 *   npx tsx --conditions=react-server scripts/ops-settle-cleared-academy-license.ts --email ustaders.proje@gmail.com
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { fulfillAcademyLicenseFromClearedOrder } from "@/lib/academy/paytr-license-bridge";
import { ACADEMY_FLAGSHIP_SKU_SLUG } from "@/lib/academy/pilot-sku";
import { academyCatalogPriceMinorForSlug } from "@/lib/academy/catalog-pricing";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { getPrisma } from "@/lib/kernel/db";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function emailArg(argv: string[]): string {
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (token === "--email" && next) {
      return next.trim().toLowerCase();
    }
    if (token?.startsWith("--email=")) {
      return token.slice("--email=".length).trim().toLowerCase();
    }
  }
  return "";
}

function fail(message: string): never {
  console.error(`ops:settle-cleared-academy-license BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const email = emailArg(process.argv.slice(2));
  if (!email) {
    fail("--email zorunlu.");
  }
  const price = academyCatalogPriceMinorForSlug(ACADEMY_FLAGSHIP_SKU_SLUG);
  if (price == null) {
    fail("Amiral SKU fiyatı yok.");
  }

  const prisma = getPrisma();
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true },
  });
  if (!user) {
    fail("Kullanıcı yok.");
  }

  const payment = await prisma.paymentOrder.findFirst({
    where: { userId: user.id, status: "CLEARED", amountMinor: price },
    orderBy: { clearedAt: "desc" },
  });
  if (!payment) {
    fail(`CLEARED ${price} kuruş ödeme emri yok.`);
  }

  const snapshot: PaymentOrderSnapshot = {
    id: payment.id,
    userId: payment.userId,
    merchantOid: payment.merchantOid,
    amountMinor: payment.amountMinor,
    currencyCode: parseCurrencyCode(payment.currencyCode),
    status: "CLEARED",
    createdAt: payment.createdAt,
    purpose: payment.purpose,
    consentVersion: payment.consentVersion,
    distanceContractAccepted: payment.distanceContractAccepted,
    digitalImmediatePerformanceAccepted: payment.digitalImmediatePerformanceAccepted,
  };

  const walletBefore = await prisma.wallet.findUnique({
    where: { userId_currencyCode: { userId: user.id, currencyCode: "TRY" } },
    select: { amountMinor: true },
  });

  const result = await fulfillAcademyLicenseFromClearedOrder(
    createPrismaAcademyPorts(),
    snapshot,
    new Date(),
    { slug: ACADEMY_FLAGSHIP_SKU_SLUG },
  );

  const purchase = result.purchaseId
    ? await prisma.academyPurchase.findUnique({
        where: { id: result.purchaseId },
        select: { id: true, status: true, amountMinor: true, course: { select: { slug: true } } },
      })
    : await prisma.academyPurchase.findFirst({
        where: { userId: user.id, course: { slug: ACADEMY_FLAGSHIP_SKU_SLUG } },
        select: { id: true, status: true, amountMinor: true, course: { select: { slug: true } } },
      });

  const walletAfter = await prisma.wallet.findUnique({
    where: { userId_currencyCode: { userId: user.id, currencyCode: "TRY" } },
    select: { amountMinor: true },
  });

  console.log(
    JSON.stringify({
      email: user.email,
      merchantOid: payment.merchantOid,
      walletBefore: walletBefore?.amountMinor ?? null,
      walletAfter: walletAfter?.amountMinor ?? null,
      fulfill: result,
      purchase,
    }),
  );

  if (!purchase || purchase.status !== "SETTLED") {
    fail(`Lisans SETTLED değil (${result.reason}).`);
  }
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : "bilinmeyen");
});
