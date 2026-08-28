/**
 * Merchant (Akademi) laboratuvar halkası — bellek.
 * PayTR clearing CREDIT (wallet-top-up) → Akademi DEBIT → müfredat → sınav → mühür.
 * Freelancer / split / emanet yoluna girmez. Üretim flag simülasyonu ayrı yüzey testinde.
 */

import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { completeAcademyCurriculum } from "@/lib/academy/curriculum-engine";
import { academyCurriculumSealForSlug } from "@/lib/academy/curriculum";
import { resolvePublicAcademyCertificate } from "@/lib/academy/certificate-verify";
import { verifyAcademyCertificateHash } from "@/lib/academy/exam";
import { issueCareerVisaStamp, type CareerVisaIssueResult } from "@/lib/career/engine";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { clearSuccessfulPaymentOrder } from "@/lib/kernel/payments/clearing";
import {
  paytrMarketplaceSplitPort,
  type MarketplaceHoldResult,
  type MarketplaceSplitSettleResult,
} from "@/lib/kernel/payments/marketplace-split";
import { passportAcademyVerifyHref } from "@/lib/kernel/passport/display";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "./memory-academy";
import { createMemoryCareerProofStore, createMemoryCareerStore } from "./memory-career";
import { submitAcademyExamWithFreshSitting } from "./academy-exam-sitting";
import { createMemoryLedgerStore, type MemoryLedgerStore } from "./memory-money";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "./memory-pricing";
import { createMemoryPaymentOrderStore } from "./memory-payment-orders";
import type { AcademyCertificateRecord, AcademyPurchaseRecord, AcademyStore } from "@/lib/academy/types";
import type { LedgerEntryRecord } from "@/lib/kernel/ledger/types";

export const MERCHANT_LAB_CITIZEN_ID = "lab-merchant-academy-citizen";
export const MERCHANT_LAB_PLATFORM_ID = PLATFORM_TREASURY_USER_ID;
export const MERCHANT_LAB_TOP_UP_MINOR = 100_000;
export const MERCHANT_LAB_MERCHANT_OID = "wallet-top-up-merchant-academy-lab";
export const MERCHANT_LAB_COURSE_SLUG = "python-temel";

export type MerchantAcademyLabResult = {
  ledger: MemoryLedgerStore;
  cleared: { applied: boolean; status: string };
  replayCleared: { applied: boolean; status: string };
  academy: { purchase: AcademyPurchaseRecord; certificate: AcademyCertificateRecord };
  academyVisa: CareerVisaIssueResult;
  chain: {
    paytrCredit: LedgerEntryRecord;
    academyDebit: LedgerEntryRecord;
  };
  witness: {
    certificateHash: string;
    curriculumSeal: string;
    hashVerified: boolean;
    publicVerifyStatus: string;
    sealStatus: string;
    verifyHref: string;
  };
  split: {
    beginHold: MarketplaceHoldResult;
    settle: MarketplaceSplitSettleResult;
  };
  balances: { citizen: number; platform: number };
};

/**
 * Tek test tahsilatı (clearing) → wallet-top-up CREDIT → akademi DEBIT → sınav → mühür.
 * Split adaptörü çağrılır ama not_configured kalır; Freelancer sızmaz.
 */
export async function runMerchantAcademyLabJourney(): Promise<MerchantAcademyLabResult> {
  const seed = academyCourseSeedBySlug(MERCHANT_LAB_COURSE_SLUG);
  if (!seed) {
    throw new Error("python-temel tohumu yok.");
  }
  const curriculumSeal = academyCurriculumSealForSlug(MERCHANT_LAB_COURSE_SLUG);
  if (!curriculumSeal) {
    throw new Error("python-temel müfredat mührü yok.");
  }

  const now = new Date("2026-08-24T12:00:00.000Z");
  const ledger = createMemoryLedgerStore([
    { userId: MERCHANT_LAB_CITIZEN_ID, amountMinor: 0 },
    { userId: MERCHANT_LAB_PLATFORM_ID, amountMinor: 0 },
  ]);
  const orders = createMemoryPaymentOrderStore({
    id: "po-merchant-academy-lab",
    userId: MERCHANT_LAB_CITIZEN_ID,
    merchantOid: MERCHANT_LAB_MERCHANT_OID,
    amountMinor: MERCHANT_LAB_TOP_UP_MINOR,
    currencyCode: "TRY",
    status: "PENDING",
    createdAt: now,
  });

  const cleared = await clearSuccessfulPaymentOrder(
    { ledger, orders },
    MERCHANT_LAB_MERCHANT_OID,
    new Date("2026-08-24T12:01:00.000Z"),
    { expectedAmountMinor: MERCHANT_LAB_TOP_UP_MINOR },
  );
  const replayCleared = await clearSuccessfulPaymentOrder(
    { ledger, orders },
    MERCHANT_LAB_MERCHANT_OID,
    new Date("2026-08-24T12:01:30.000Z"),
    { expectedAmountMinor: MERCHANT_LAB_TOP_UP_MINOR },
  );

  const academyStore = createMemoryAcademyStore();
  const academyPorts = {
    ledger,
    catalog: createMemoryPriceCatalogStore([
      {
        moduleKey: ACADEMY_MODULE_KEY,
        unitKey: seed.catalogUnitKey,
        amountMinor: seed.seedAmountMinor,
      },
    ]),
    locks: createMemoryCheckoutPriceLockStore(),
    academy: academyStore,
  };
  const course = memoryCourse({
    id: seed.id,
    slug: seed.slug,
    title: seed.title,
    summary: seed.summary,
    catalogUnitKey: seed.catalogUnitKey,
  });
  const exam = memoryExam(course.id, {
    id: seed.exam.id,
    title: seed.exam.title,
    passScore: seed.exam.passScore,
    questions: seed.exam.questions,
  });
  await academyStore.insertCourse(course);
  await academyStore.insertExam(exam);

  const locked = await lockAcademyCoursePrice(academyPorts, {
    courseId: course.id,
    userId: MERCHANT_LAB_CITIZEN_ID,
    now: new Date("2026-08-24T12:02:00.000Z"),
  });
  const purchased = await purchaseAcademyCourse(academyPorts, {
    courseId: course.id,
    userId: MERCHANT_LAB_CITIZEN_ID,
    lockId: locked.lock.id,
    platformUserId: MERCHANT_LAB_PLATFORM_ID,
    now: new Date("2026-08-24T12:02:10.000Z"),
  });
  if (purchased.purchase.status !== "SETTLED") {
    throw new Error("Akademi satın alma SETTLED değil.");
  }

  const curriculum = await completeAcademyCurriculum(academyPorts, {
    courseId: course.id,
    userId: MERCHANT_LAB_CITIZEN_ID,
    now: new Date("2026-08-24T12:03:00.000Z"),
  });
  if (!curriculum.curriculumComplete) {
    throw new Error("Müfredat tamamlanmadı.");
  }

  const examNow = new Date("2026-08-24T12:04:00.000Z");
  const examResult = await submitAcademyExamWithFreshSitting(academyPorts, {
    courseId: course.id,
    userId: MERCHANT_LAB_CITIZEN_ID,
    now: examNow,
  });
  const certificate = examResult.certificate;
  if (!certificate?.certificateHash || !certificate.curriculumSeal) {
    throw new Error("SHA256 sertifika veya curriculumSeal basılmadı.");
  }
  const hashOk = verifyAcademyCertificateHash({
    userId: MERCHANT_LAB_CITIZEN_ID,
    courseId: course.id,
    attemptId: examResult.attempt.id,
    score: examResult.score,
    issuedAt: examNow,
    curriculumSeal,
    certificateHash: certificate.certificateHash,
  });
  const publicVerify = await resolvePublicAcademyCertificate(
    academyStore as AcademyStore,
    certificate.certificateHash,
  );

  const career = createMemoryCareerStore();
  const proofs = createMemoryCareerProofStore([
    {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: certificate.id,
      userId: MERCHANT_LAB_CITIZEN_ID,
      actorUserIds: [MERCHANT_LAB_CITIZEN_ID],
      title: certificate.title,
      issuedAt: certificate.issuedAt,
      certificateHash: certificate.certificateHash,
    },
  ]);
  const academyVisa = await issueCareerVisaStamp(
    { career, proofs },
    {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: certificate.id,
      actorUserId: MERCHANT_LAB_CITIZEN_ID,
    },
  );

  const beginHold = await paytrMarketplaceSplitPort.beginHold({
    buyerUserId: MERCHANT_LAB_CITIZEN_ID,
    referenceKey: "merchant-lab-must-not-hold",
    grossMinor: 10_000,
    holdBps: 1000,
    currencyCode: "TRY",
  });
  const settle = await paytrMarketplaceSplitPort.settle({
        providerId: "split",
    referenceKey: "merchant-lab-must-not-settle",
    currencyCode: "TRY",
    status: "recorded_pending_psp",
    legs: [{ role: "artisan", userId: MERCHANT_LAB_CITIZEN_ID, amountMinor: 9000 }],
  });

  const entries = ledger.listEntries();
  const paytrCredit = entries.find(
    (row) => row.purpose === "wallet-top-up" && row.direction === "CREDIT",
  );
  const academyDebit = entries.find(
    (row) => row.purpose === "academy-purchase" && row.direction === "DEBIT",
  );
  if (!paytrCredit || !academyDebit) {
    throw new Error("Merchant lab defter zinciri eksik (wallet-top-up / academy-purchase).");
  }

  const escrowLeak = entries.some(
    (row) =>
      row.purpose.startsWith("escrow-") ||
      row.idempotencyKey.startsWith("escrow-hold:") ||
      row.idempotencyKey.startsWith("escrow-release"),
  );
  if (escrowLeak) {
    throw new Error("Merchant lab Freelancer/emanet defter satırı sızdırdı.");
  }

  const verifyHref =
    passportAcademyVerifyHref(academyVisa.stamp) ??
    `/academy/dogrula/${certificate.certificateHash}`;

  return {
    ledger,
    cleared: { applied: cleared.applied, status: cleared.order.status },
    replayCleared: { applied: replayCleared.applied, status: replayCleared.order.status },
    academy: { purchase: purchased.purchase, certificate },
    academyVisa,
    chain: { paytrCredit, academyDebit },
    witness: {
      certificateHash: certificate.certificateHash,
      curriculumSeal: certificate.curriculumSeal ?? curriculumSeal,
      hashVerified: hashOk,
      publicVerifyStatus: publicVerify.status,
      sealStatus: publicVerify.status === "found" ? publicVerify.view.sealStatus : "missing",
      verifyHref,
    },
    split: { beginHold, settle },
    balances: {
      citizen: ledger.snapshot(MERCHANT_LAB_CITIZEN_ID).amountMinor,
      platform: ledger.snapshot(MERCHANT_LAB_PLATFORM_ID).amountMinor,
    },
  };
}

export function formatMerchantAcademyLabReport(result: MerchantAcademyLabResult): string {
  return [
    "merchant-academy-lab",
    `wallet-top-up CREDIT=${result.chain.paytrCredit.amountMinor}`,
    `academy-purchase DEBIT=${result.chain.academyDebit.amountMinor}`,
    `certificate=${result.witness.certificateHash}`,
    `split.beginHold=${result.split.beginHold.ok ? "ok" : result.split.beginHold.reason}`,
    `split.settle=${result.split.settle.ok ? "ok" : result.split.settle.reason}`,
    "Freelancer/emanet yok; Checkout token CREDIT yazmaz",
  ].join("\n");
}
