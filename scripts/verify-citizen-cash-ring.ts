#!/usr/bin/env tsx
/**
 * Laboratuvar vatandaş nakit halkası — Manifesto dört basamak + sertifika tanığı.
 *
 *   npm run verify:citizen-cash-ring
 *
 * Bellek motoru. Canlı Postgres, Auth ve PayTR paneli yok.
 * CREDIT yalnız clearSuccessfulPaymentOrder. Checkout token / mock iFrame CREDIT yazmaz.
 * Canlı Direct halkası ayrıdır: ops:t3-academy-loop + ops:t4-freelancer-loop.
 */

import {
  formatCitizenCashRingReport,
  runCitizenCashRingJourney,
} from "../tests/helpers/citizen-cash-ring-journey";

function fail(message: string): never {
  console.error(`verify:citizen-cash-ring BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const journey = await runCitizenCashRingJourney();
  if (journey.cleared.status !== "CLEARED" || !journey.cleared.applied) {
    fail("PayTR CREDIT (clearing) CLEARED değil.");
  }
  if (journey.academy.purchase.status !== "SETTLED") {
    fail("Akademi DEBIT SETTLED değil.");
  }
  if (journey.freelancer.holdAfterAccept?.status !== "PENDING") {
    fail("Emanet DEBIT PENDING değil.");
  }
  if (journey.freelancer.released?.status !== "RELEASED") {
    fail("Teslim serbesti RELEASED değil.");
  }
  if (journey.chain.releaseCredit) {
    fail("Usta cüzdanına escrow-release-net CREDIT yazıldı.");
  }
  if (journey.freelancer.holdAfterRelease?.status !== "RELEASED") {
    fail("Emanet split sonrası RELEASED değil.");
  }
  if (journey.witness.sealStatus !== "valid" || !journey.witness.hashVerified) {
    fail("Sertifika tanığı geçerli değil.");
  }
  if (!/^[a-f0-9]{64}$/.test(journey.witness.certificateHash)) {
    fail("certificateHash SHA-256 hex değil.");
  }

  console.log(formatCitizenCashRingReport(journey));
  console.log("");
  console.log("verify:citizen-cash-ring OK — PayTR/Akademi/emanet + sertifika tanığı; usta CREDIT yok (split).");
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
