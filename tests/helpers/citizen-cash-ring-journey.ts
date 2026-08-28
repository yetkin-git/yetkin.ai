import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { completeAcademyCurriculum } from "@/lib/academy/curriculum-engine";
import { academyCurriculumSealForSlug } from "@/lib/academy/curriculum";
import { resolvePublicAcademyCertificate } from "@/lib/academy/certificate-verify";
import { verifyAcademyCertificateHash } from "@/lib/academy/exam";
import { issueCareerVisaStamp, type CareerVisaIssueResult } from "@/lib/career/engine";
import { assertAcademyCareerVisaForListing } from "@/lib/career/visa-gate";
import {
  YZ_ICERIK_LISTING_PATHWAY,
  YZ_LISTING_VISA_SUBJECT,
} from "@/lib/career/listing-visa-scope";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { clearSuccessfulPaymentOrder } from "@/lib/kernel/payments/clearing";
import { passportAcademyVerifyHref } from "@/lib/kernel/passport/display";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { postFreelancerContractMessage } from "@/lib/freelancer/messages";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "./memory-academy";
import { createMemoryCareerProofStore, createMemoryCareerStore } from "./memory-career";
import { submitAcademyExamWithFreshSitting } from "./academy-exam-sitting";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
  type MemoryLedgerStore,
} from "./memory-money";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "./memory-pricing";
import { createMemoryPaymentOrderStore } from "./memory-payment-orders";
import type { AcademyCertificateRecord, AcademyPurchaseRecord, AcademyStore } from "@/lib/academy/types";
import type { EscrowHoldRecord } from "@/lib/kernel/escrow/types";
import type { LedgerEntryRecord } from "@/lib/kernel/ledger/types";
import type {
  FreelancerBidRecord,
  FreelancerContractRecord,
  FreelancerJobRecord,
} from "@/lib/freelancer/types";

/** Laboratuvar tek vatandaş — PayTR CREDIT → Akademi DEBIT (+ hazine settlement) → freelancer PSP hold. */
export const CITIZEN_CASH_RING_ID = "lab-citizen-cash-ring";
export const CITIZEN_CASH_RING_CLIENT_ID = "lab-citizen-cash-client";
export const CITIZEN_CASH_RING_PLATFORM_ID = PLATFORM_TREASURY_USER_ID;
export const CITIZEN_CASH_RING_TOP_UP_MINOR = 100_000;
export const CITIZEN_CASH_RING_CLIENT_START_MINOR = 100_000;
export const CITIZEN_CASH_RING_GROSS_MINOR = 25_000;
export const CITIZEN_CASH_RING_MERCHANT_OID = "wallet-top-up-citizen-cash-ring";

export type CitizenCashRingJourneyResult = {
  ledger: MemoryLedgerStore;
  cleared: { applied: boolean; status: string };
  replayCleared: { applied: boolean; status: string };
  academy: { purchase: AcademyPurchaseRecord; certificate: AcademyCertificateRecord };
  academyVisa: CareerVisaIssueResult;
  freelancer: {
    job: FreelancerJobRecord;
    bid: FreelancerBidRecord;
    holdAfterAccept: EscrowHoldRecord | null;
    released: FreelancerContractRecord | null;
    holdAfterRelease: EscrowHoldRecord | null;
    visa: CareerVisaIssueResult | null;
    payoutFrozen: boolean;
  };
  chain: {
    paytrCredit: LedgerEntryRecord;
    academyDebit: LedgerEntryRecord;
    escrowDebit: LedgerEntryRecord | null;
    releaseCredit: LedgerEntryRecord | null;
  };
  witness: {
    certificateHash: string;
    curriculumSeal: string;
    hashVerified: boolean;
    publicVerifyStatus: string;
    sealStatus: string;
    verifyHref: string;
  };
  balances: {
    citizen: number;
    client: number;
    platform: number;
  };
};

/**
 * Laboratuvar tek vatandaş — PayTR CREDIT → Akademi DEBIT (+ hazine settlement CREDIT) → freelancer PSP hold (Rail DEBIT yok).
 * Checkout token CREDIT yazmaz; para yalnız clearSuccessfulPaymentOrder ile girer.
 * escrow-hold / escrow-release-net Rail satırı yazılmaz (funding: psp).
 */
export async function runCitizenCashRingJourney(): Promise<CitizenCashRingJourneyResult> {
  const seed = academyCourseSeedBySlug("python-temel");
  if (!seed) {
    throw new Error("python-temel tohumu yok.");
  }
  const curriculumSeal = academyCurriculumSealForSlug("python-temel");
  if (!curriculumSeal) {
    throw new Error("python-temel müfredat mührü yok.");
  }

  const now = new Date("2026-08-22T09:00:00.000Z");
  const ledger = createMemoryLedgerStore([
    { userId: CITIZEN_CASH_RING_ID, amountMinor: 0 },
    { userId: CITIZEN_CASH_RING_CLIENT_ID, amountMinor: CITIZEN_CASH_RING_CLIENT_START_MINOR },
    { userId: CITIZEN_CASH_RING_PLATFORM_ID, amountMinor: 0 },
  ]);
  const orders = createMemoryPaymentOrderStore({
    id: "po-citizen-cash-ring",
    userId: CITIZEN_CASH_RING_ID,
    merchantOid: CITIZEN_CASH_RING_MERCHANT_OID,
    amountMinor: CITIZEN_CASH_RING_TOP_UP_MINOR,
    currencyCode: "TRY",
    status: "PENDING",
    createdAt: now,
  });
  const cleared = await clearSuccessfulPaymentOrder(
    { ledger, orders },
    CITIZEN_CASH_RING_MERCHANT_OID,
    new Date("2026-08-22T09:01:00.000Z"),
    { expectedAmountMinor: CITIZEN_CASH_RING_TOP_UP_MINOR },
  );
  const replayCleared = await clearSuccessfulPaymentOrder(
    { ledger, orders },
    CITIZEN_CASH_RING_MERCHANT_OID,
    new Date("2026-08-22T09:01:30.000Z"),
    { expectedAmountMinor: CITIZEN_CASH_RING_TOP_UP_MINOR },
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
    userId: CITIZEN_CASH_RING_ID,
    now: new Date("2026-08-22T09:02:00.000Z"),
  });
  const purchased = await purchaseAcademyCourse(academyPorts, {
    courseId: course.id,
    userId: CITIZEN_CASH_RING_ID,
    lockId: locked.lock.id,
    platformUserId: CITIZEN_CASH_RING_PLATFORM_ID,
    now: new Date("2026-08-22T09:02:10.000Z"),
  });
  if (purchased.purchase.status !== "SETTLED") {
    throw new Error("Akademi satın alma SETTLED değil.");
  }
  const curriculum = await completeAcademyCurriculum(academyPorts, {
    courseId: course.id,
    userId: CITIZEN_CASH_RING_ID,
    now: new Date("2026-08-22T09:03:00.000Z"),
  });
  if (!curriculum.curriculumComplete) {
    throw new Error("Müfredat tamamlanmadı.");
  }
  const examNow = new Date("2026-08-22T09:04:00.000Z");
  const examResult = await submitAcademyExamWithFreshSitting(academyPorts, {
    courseId: course.id,
    userId: CITIZEN_CASH_RING_ID,
    now: examNow,
  });
  const certificate = examResult.certificate;
  if (!certificate?.certificateHash || !certificate.curriculumSeal) {
    throw new Error("SHA256 sertifika veya curriculumSeal basılmadı.");
  }
  const hashOk = verifyAcademyCertificateHash({
    userId: CITIZEN_CASH_RING_ID,
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
      userId: CITIZEN_CASH_RING_ID,
      actorUserIds: [CITIZEN_CASH_RING_ID],
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
      actorUserId: CITIZEN_CASH_RING_ID,
    },
  );
  proofs.add({
    sourceKind: "ACADEMY_CERTIFICATE",
    sourceId: "cert-yz-cash-ring",
    userId: CITIZEN_CASH_RING_ID,
    actorUserIds: [CITIZEN_CASH_RING_ID],
    title: "Yapay Zekâ ve Prompt Mühendisliğine Giriş",
    courseSlug: "ai-temel",
    issuedAt: examNow,
    certificateHash: "ab".repeat(32),
  });
  await issueCareerVisaStamp(
    { career, proofs },
    {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: "cert-yz-cash-ring",
      actorUserId: CITIZEN_CASH_RING_ID,
    },
  );
  await assertAcademyCareerVisaForListing(career, CITIZEN_CASH_RING_ID, YZ_LISTING_VISA_SUBJECT, proofs);

  const freelancerPorts = withMemoryAcceptAtomic({
    ledger,
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
  const job = await createFreelancerJob(freelancerPorts, {
    clientId: CITIZEN_CASH_RING_CLIENT_ID,
    title: "Nakit halkası — YZ iş kanıtı ilanı",
    brief: "Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif ilgili dikeyin iş kanıtı belgesine bağlıdır.",
    budgetMinor: CITIZEN_CASH_RING_GROSS_MINOR,
    visaPathwayId: YZ_ICERIK_LISTING_PATHWAY,
  });
  await assertAcademyCareerVisaForListing(career, CITIZEN_CASH_RING_ID, job, proofs);
  const bid = await submitFreelancerBid(freelancerPorts, {
    jobId: job.id,
    bidderId: CITIZEN_CASH_RING_ID,
    amountMinor: CITIZEN_CASH_RING_GROSS_MINOR,
    coverNote: "YZ iş kanıtı mühürlü teslim.",
  });
  const { contract } = await acceptFreelancerBid(freelancerPorts, {
    jobId: job.id,
    bidId: bid.id,
    actorUserId: CITIZEN_CASH_RING_CLIENT_ID,
    holdBps: HOLD_BPS_DEFAULT,
    platformUserId: CITIZEN_CASH_RING_PLATFORM_ID,
  });
  const holdAfterAccept = await freelancerPorts.escrow.findById(contract.escrowHoldId);
  await postFreelancerContractMessage(freelancerPorts, {
    contractId: contract.id,
    actorUserId: CITIZEN_CASH_RING_ID,
    kind: "DELIVERY",
    body: "Teslim: nakit halkası kanıt paketi.",
    artifactUrl: "https://example.test/citizen-cash-ring.zip",
  });
  const released = await releaseFreelancerContract(freelancerPorts, {
    contractId: contract.id,
    actorUserId: CITIZEN_CASH_RING_CLIENT_ID,
    platformUserId: CITIZEN_CASH_RING_PLATFORM_ID,
  });
  const holdAfterRelease = await freelancerPorts.escrow.findById(contract.escrowHoldId);
  let freelancerVisa: CareerVisaIssueResult | null = null;
  if (released) {
    proofs.add({
      sourceKind: "FREELANCER_RELEASE",
      sourceId: released.id,
      userId: CITIZEN_CASH_RING_ID,
      actorUserIds: [CITIZEN_CASH_RING_ID, CITIZEN_CASH_RING_CLIENT_ID],
      title: job.title,
      issuedAt: released.releasedAt ?? new Date("2026-08-22T09:06:00.000Z"),
      certificateHash: null,
    });
    freelancerVisa = await issueCareerVisaStamp(
      { career, proofs },
      {
        sourceKind: "FREELANCER_RELEASE",
        sourceId: released.id,
        actorUserId: CITIZEN_CASH_RING_CLIENT_ID,
      },
    );
  }

  const entries = ledger.listEntries();
  const paytrCredit = entries.find(
    (row) => row.purpose === "wallet-top-up" && row.direction === "CREDIT",
  );
  const academyDebit = entries.find(
    (row) => row.purpose === "academy-purchase" && row.direction === "DEBIT",
  );
  const escrowDebit =
    entries.find((row) => row.purpose === "escrow-hold" && row.direction === "DEBIT") ?? null;
  const releaseCredit =
    entries.find((row) => row.purpose === "escrow-release-net" && row.direction === "CREDIT") ?? null;
  if (!paytrCredit || !academyDebit) {
    throw new Error("Nakit halkası defter zinciri eksik.");
  }

  const verifyHref =
    passportAcademyVerifyHref(academyVisa.stamp) ?? `/academy/dogrula/${certificate.certificateHash}`;

  return {
    ledger,
    cleared: { applied: cleared.applied, status: cleared.order.status },
    replayCleared: { applied: replayCleared.applied, status: replayCleared.order.status },
    academy: { purchase: purchased.purchase, certificate },
    academyVisa,
    freelancer: {
      job,
      bid,
      holdAfterAccept,
      released,
      holdAfterRelease,
      visa: freelancerVisa,
      payoutFrozen: false,
    },
    chain: {
      paytrCredit,
      academyDebit,
      escrowDebit,
      releaseCredit,
    },
    witness: {
      certificateHash: certificate.certificateHash,
      curriculumSeal: certificate.curriculumSeal,
      hashVerified: hashOk,
      publicVerifyStatus: publicVerify.status,
      sealStatus: publicVerify.status === "found" ? publicVerify.view.sealStatus : "missing",
      verifyHref,
    },
    balances: {
      citizen: ledger.snapshot(CITIZEN_CASH_RING_ID).amountMinor,
      client: ledger.snapshot(CITIZEN_CASH_RING_CLIENT_ID).amountMinor,
      platform: ledger.snapshot(CITIZEN_CASH_RING_PLATFORM_ID).amountMinor,
    },
  };
}

export function formatCitizenCashRingReport(journey: CitizenCashRingJourneyResult): string {
  const lines = [
    "vatandaş nakit halkası",
    `PayTR ${journey.chain.paytrCredit.purpose} ${journey.chain.paytrCredit.direction}`,
    `Akademi ${journey.chain.academyDebit.purpose} ${journey.chain.academyDebit.direction}`,
    journey.chain.escrowDebit
      ? `Rail ${journey.chain.escrowDebit.purpose}`
      : "PSP hold; Rail DEBIT yok",
    journey.chain.releaseCredit
      ? `usta ${journey.chain.releaseCredit.purpose}`
      : "usta CREDIT yok",
    `tanık certificateHash ${journey.witness.certificateHash}`,
    "Checkout token CREDIT yazmaz",
  ];
  return lines.join("\n");
}
