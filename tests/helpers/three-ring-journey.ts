import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { completeAcademyCurriculum } from "@/lib/academy/curriculum-engine";
import { academyCurriculumSealForSlug } from "@/lib/academy/curriculum";
import { resolvePublicAcademyCertificate } from "@/lib/academy/certificate-verify";
import { verifyAcademyCertificateHash } from "@/lib/academy/exam";
import { issueCareerVisaStamp, type CareerVisaIssueResult } from "@/lib/career/engine";
import { assertAcademyCareerVisaForListing } from "@/lib/career/visa-gate";
import { YZ_ICERIK_LISTING_PATHWAY, YZ_LISTING_VISA_SUBJECT } from "@/lib/career/listing-visa-scope";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { postFreelancerContractMessage } from "@/lib/freelancer/messages";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { REQUIRED_CATALOG_DEFINITIONS } from "@/lib/kernel/pricing/catalog-definitions";
import { passportAcademyVerifyHref } from "@/lib/kernel/passport/display";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import {
  sealCorporateJobPosting,
  submitCorporateJobOffer,
  upsertCorporateCompany,
} from "@/lib/kurumsal/engine";
import { submitAcademyExamWithFreshSitting } from "./academy-exam-sitting";
import { KURUMSAL_JOB_FLOOR_UNIT_KEY, KURUMSAL_MODULE_KEY } from "@/lib/kurumsal/types";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "./memory-academy";
import { createMemoryCareerProofStore, createMemoryCareerStore } from "./memory-career";
import { createMemoryKurumsalStore } from "./memory-kurumsal";
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
import type { AcademyCertificateRecord, AcademyPurchaseRecord, AcademyStore } from "@/lib/academy/types";
import type { CareerStore } from "@/lib/career/types";
import type { EscrowHoldRecord } from "@/lib/kernel/escrow/types";
import type { CorporateJobOfferRecord, CorporateJobPostingRecord } from "@/lib/kurumsal/types";
import type {
  FreelancerBidRecord,
  FreelancerContractRecord,
  FreelancerJobRecord,
} from "@/lib/freelancer/types";

/** D3 — üç halka tek vatandaş. Müşteri / kurumsal sahip ayrı aktörlerdir. */
export const D3_CITIZEN_ID = "d3-citizen";
export const D3_CLIENT_ID = "d3-job-client";
export const D3_CORP_OWNER_ID = "d3-corp-owner";
export const D3_PLATFORM_ID = PLATFORM_TREASURY_USER_ID;
export const D3_START_MINOR = 100_000;
export const D3_GROSS_MINOR = 25_000;
export const D3_ACADEMY_SLUG = "python-temel";

export type ThreeRingJourneyResult = {
  citizenId: string;
  ledger: MemoryLedgerStore;
  academy: {
    purchase: AcademyPurchaseRecord;
    certificate: AcademyCertificateRecord;
    curriculumSeal: string;
    publicVerify: { status: string; sealStatus?: string };
  };
  proof: {
    academyVisa: CareerVisaIssueResult;
    passportHref: string | null;
    careerHref: string | null;
  };
  gate: {
    visalessStatus: number;
    visalessBody: string;
  };
  freelancer: {
    job: FreelancerJobRecord;
    bid: FreelancerBidRecord;
    holdAfterAccept: EscrowHoldRecord | null;
    released: FreelancerContractRecord | null;
    visa: CareerVisaIssueResult | null;
    payoutFrozen: boolean;
  };
  kurumsal: {
    posting: CorporateJobPostingRecord;
    offer: CorporateJobOfferRecord;
  };
  balances: {
    citizenAfterAcademy: number;
    citizenAfterRelease: number;
    clientAfterRelease: number;
    platformAfterRelease: number;
  };
};

async function expectGateDenied(career: CareerStore, userId: string): Promise<ForbiddenError> {
  try {
    await assertAcademyCareerVisaForListing(career, userId, YZ_LISTING_VISA_SUBJECT);
    throw new Error("Vize kapısı vizeless teklifi geçirdi.");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return error;
    }
    throw error;
  }
}

/**
 * D3 bellek e2e — tek vatandaş:
 * Öğrenme (python-temel SETTLED → müfredat → ≥70 → SHA256 + curriculumSeal)
 * → Kanıt (ACADEMY_CERTIFICATE vize + /pasaport /career doğrula bağı)
 * → Kazanç (vizesiz 403 → teklif → emanet → teslim → RELEASE → FREELANCER_RELEASE).
 * Canlı Postgres/Auth istemez. Oda motorları birbirini import etmez.
 */
export async function runThreeRingJourney(): Promise<ThreeRingJourneyResult> {
  const seed = academyCourseSeedBySlug(D3_ACADEMY_SLUG);
  if (!seed) {
    throw new Error("python-temel tohumu yok.");
  }
  const curriculumSeal = academyCurriculumSealForSlug(D3_ACADEMY_SLUG);
  if (!curriculumSeal) {
    throw new Error("python-temel müfredat mührü yok.");
  }

  const now = new Date("2026-08-16T06:00:00.000Z");
  const examNow = new Date("2026-08-16T06:10:00.000Z");
  const ledger = createMemoryLedgerStore([
    { userId: D3_CITIZEN_ID, amountMinor: D3_START_MINOR },
    { userId: D3_CLIENT_ID, amountMinor: D3_START_MINOR },
    { userId: D3_CORP_OWNER_ID, amountMinor: D3_START_MINOR },
    { userId: D3_PLATFORM_ID, amountMinor: 0 },
  ]);
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
    userId: D3_CITIZEN_ID,
    now,
  });
  const purchased = await purchaseAcademyCourse(academyPorts, {
    courseId: course.id,
    userId: D3_CITIZEN_ID,
    lockId: locked.lock.id,
    platformUserId: D3_PLATFORM_ID,
    now,
  });
  if (purchased.purchase.status !== "SETTLED") {
    throw new Error("Akademi satın alma SETTLED değil.");
  }
  const curriculum = await completeAcademyCurriculum(academyPorts, {
    courseId: course.id,
    userId: D3_CITIZEN_ID,
    now,
  });
  if (!curriculum.curriculumComplete) {
    throw new Error("Müfredat tamamlanmadı.");
  }
  const examResult = await submitAcademyExamWithFreshSitting(academyPorts, {
    courseId: course.id,
    userId: D3_CITIZEN_ID,
    now: examNow,
  });
  const certificate = examResult.certificate;
  if (!certificate?.certificateHash || !certificate.curriculumSeal) {
    throw new Error("SHA256 sertifika veya curriculumSeal basılmadı.");
  }
  if (certificate.curriculumSeal !== curriculumSeal) {
    throw new Error("curriculumSeal tohum mührü ile sapıyor.");
  }
  const hashOk = verifyAcademyCertificateHash({
    userId: D3_CITIZEN_ID,
    courseId: course.id,
    attemptId: examResult.attempt.id,
    score: examResult.score,
    issuedAt: examNow,
    curriculumSeal,
    certificateHash: certificate.certificateHash,
  });
  if (!hashOk) {
    throw new Error("Sertifika hash doğrulanamadı.");
  }
  const publicVerify = await resolvePublicAcademyCertificate(
    academyStore as AcademyStore,
    certificate.certificateHash,
  );
  const citizenAfterAcademy = ledger.snapshot(D3_CITIZEN_ID).amountMinor;

  const career = createMemoryCareerStore();
  const proofs = createMemoryCareerProofStore([
    {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: certificate.id,
      userId: D3_CITIZEN_ID,
      actorUserIds: [D3_CITIZEN_ID],
      title: certificate.title,
      issuedAt: certificate.issuedAt,
      certificateHash: certificate.certificateHash,
    },
  ]);
  const visalessError = await expectGateDenied(createMemoryCareerStore(), D3_CITIZEN_ID);
  const visalessResponse = jsonFromUnknown(visalessError);
  const visalessBody = (await visalessResponse.json()) as { error?: string };

  const academyVisa = await issueCareerVisaStamp(
    { career, proofs },
    {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: certificate.id,
      actorUserId: D3_CITIZEN_ID,
    },
  );
  await expectGateDenied(career, D3_CITIZEN_ID);
  proofs.add({
    sourceKind: "ACADEMY_CERTIFICATE",
    sourceId: "cert-yz-d3",
    userId: D3_CITIZEN_ID,
    actorUserIds: [D3_CITIZEN_ID],
    title: "Yapay Zekâ ve Prompt Mühendisliğine Giriş",
    courseSlug: "ai-temel",
    issuedAt: examNow,
    certificateHash: "ab".repeat(32),
  });
  await issueCareerVisaStamp(
    { career, proofs },
    {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: "cert-yz-d3",
      actorUserId: D3_CITIZEN_ID,
    },
  );
  await assertAcademyCareerVisaForListing(career, D3_CITIZEN_ID, YZ_LISTING_VISA_SUBJECT, proofs);
  const passportHref = passportAcademyVerifyHref(academyVisa.stamp);
  const careerHref = passportAcademyVerifyHref(academyVisa.stamp);

  const freelancerPorts = withMemoryAcceptAtomic({
    ledger,
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
  const job = await createFreelancerJob(freelancerPorts, {
    clientId: D3_CLIENT_ID,
    title: "D3 üç halka — nitelikli emanet",
    brief: "Dikey: yapay zekâ destekli içerik ve görsel üretim. Vize kapısı, emanet, teslim, RELEASE, iş bitirme damgası.",
    budgetMinor: D3_GROSS_MINOR,
    visaPathwayId: YZ_ICERIK_LISTING_PATHWAY,
  });
  await assertAcademyCareerVisaForListing(career, D3_CITIZEN_ID, job, proofs);
  const bid = await submitFreelancerBid(freelancerPorts, {
    jobId: job.id,
    bidderId: D3_CITIZEN_ID,
    amountMinor: D3_GROSS_MINOR,
    coverNote: "Müfredat mühürlü teslim.",
  });
  const { contract } = await acceptFreelancerBid(freelancerPorts, {
    jobId: job.id,
    bidId: bid.id,
    actorUserId: D3_CLIENT_ID,
    holdBps: HOLD_BPS_DEFAULT,
    platformUserId: D3_PLATFORM_ID,
  });
  const holdAfterAccept = await freelancerPorts.escrow.findById(contract.escrowHoldId);
  await postFreelancerContractMessage(freelancerPorts, {
    contractId: contract.id,
    actorUserId: D3_CITIZEN_ID,
    kind: "DELIVERY",
    body: "Teslim: üç halka kanıt paketi.",
    artifactUrl: "https://example.test/d3-delivery.zip",
  });
  const released = await releaseFreelancerContract(freelancerPorts, {
    contractId: contract.id,
    actorUserId: D3_CLIENT_ID,
    platformUserId: D3_PLATFORM_ID,
  });
  let freelancerVisa: CareerVisaIssueResult | null = null;
  if (released) {
    proofs.add({
      sourceKind: "FREELANCER_RELEASE",
      sourceId: released.id,
      userId: D3_CITIZEN_ID,
      actorUserIds: [D3_CITIZEN_ID, D3_CLIENT_ID],
      title: job.title,
      issuedAt: released.releasedAt ?? new Date("2026-08-16T06:20:00.000Z"),
      certificateHash: null,
    });
    freelancerVisa = await issueCareerVisaStamp(
      { career, proofs },
      {
        sourceKind: "FREELANCER_RELEASE",
        sourceId: released.id,
        actorUserId: D3_CLIENT_ID,
      },
    );
  }

  const definition = REQUIRED_CATALOG_DEFINITIONS.find(
    (row) => row.moduleKey === KURUMSAL_MODULE_KEY && row.unitKey === KURUMSAL_JOB_FLOOR_UNIT_KEY,
  );
  if (!definition) {
    throw new Error("Kurumsal katalog tanımı yok.");
  }
  const kurumsalPorts = {
    ledger,
    escrow: createMemoryEscrowStore(),
    catalog: createMemoryPriceCatalogStore([
      {
        moduleKey: definition.moduleKey,
        unitKey: definition.unitKey,
        amountMinor: definition.seedAmountMinor,
        minMinor: definition.seedMinMinor,
        maxMinor: definition.seedMaxMinor,
      },
    ]),
    kurumsal: createMemoryKurumsalStore(),
  };
  await upsertCorporateCompany(kurumsalPorts, {
    userId: D3_CORP_OWNER_ID,
    legalName: "Yetkin Ray A.Ş.",
  });
  const posting = await sealCorporateJobPosting(kurumsalPorts, {
    actorUserId: D3_CORP_OWNER_ID,
    title: "D3 kurumsal nitelikli ilan",
    brief: "Dikey: yapay zekâ destekli içerik ve görsel üretim. Aynı akademi vizesi kapıdan geçer; teklif tutar taşımaz.",
    budgetMinor: D3_GROSS_MINOR,
    workbenchKind: "FREELANCER",
    holdBps: HOLD_BPS_DEFAULT,
  });
  await assertAcademyCareerVisaForListing(career, D3_CITIZEN_ID, posting, proofs);
  const offer = await submitCorporateJobOffer(kurumsalPorts, {
    postingId: posting.id,
    bidderId: D3_CITIZEN_ID,
    coverNote: "Kariyer vizesi aynı vatandaşta; ikinci emanet yok.",
  });

  return {
    citizenId: D3_CITIZEN_ID,
    ledger,
    academy: {
      purchase: purchased.purchase,
      certificate,
      curriculumSeal,
      publicVerify: {
        status: publicVerify.status,
        sealStatus: publicVerify.status === "found" ? publicVerify.view.sealStatus : undefined,
      },
    },
    proof: {
      academyVisa,
      passportHref,
      careerHref,
    },
    gate: {
      visalessStatus: visalessResponse.status,
      visalessBody: visalessBody.error ?? "",
    },
    freelancer: {
      job,
      bid,
      holdAfterAccept,
      released,
      visa: freelancerVisa,
      payoutFrozen: false,
    },
    kurumsal: {
      posting,
      offer,
    },
    balances: {
      citizenAfterAcademy,
      citizenAfterRelease: ledger.snapshot(D3_CITIZEN_ID).amountMinor,
      clientAfterRelease: ledger.snapshot(D3_CLIENT_ID).amountMinor,
      platformAfterRelease: ledger.snapshot(D3_PLATFORM_ID).amountMinor,
    },
  };
}
