import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { REQUIRED_CATALOG_DEFINITIONS } from "@/lib/kernel/pricing/catalog-definitions";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { issueCareerVisaStamp } from "@/lib/career/engine";
import { assertAcademyCareerVisaForListing } from "@/lib/career/visa-gate";
import { YZ_ICERIK_LISTING_PATHWAY, YZ_LISTING_VISA_SUBJECT } from "@/lib/career/listing-visa-scope";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { postFreelancerContractMessage } from "@/lib/freelancer/messages";
import {
  awardCorporateJobPosting,
  releaseCorporateJobPosting,
  sealCorporateJobPosting,
  submitCorporateJobOffer,
  upsertCorporateCompany,
} from "@/lib/kurumsal/engine";
import { KURUMSAL_JOB_FLOOR_UNIT_KEY, KURUMSAL_MODULE_KEY } from "@/lib/kurumsal/types";
import { createMemoryCareerProofStore, createMemoryCareerStore } from "./memory-career";
import { createMemoryKurumsalStore } from "./memory-kurumsal";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  createMemoryMarketplaceSplitPort,
  withMemoryAcceptAtomic,
} from "./memory-money";
import { createMemoryPriceCatalogStore } from "./memory-pricing";

export const EARNINGS_CLIENT_ID = "d23-earnings-client";
export const EARNINGS_WORKER_ID = "d23-earnings-worker";
export const EARNINGS_CORP_OWNER_ID = "d23-earnings-corp";
export const EARNINGS_PLATFORM_ID = PLATFORM_TREASURY_USER_ID;
export const EARNINGS_GROSS_MINOR = 25_000;
export const EARNINGS_START_MINOR = 100_000;

const ACADEMY_HASH = "ab".repeat(32);

async function stampAcademyVisa(userId: string) {
  const career = createMemoryCareerStore();
  const proofs = createMemoryCareerProofStore([
    {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: `cert-${userId}`,
      userId,
      actorUserIds: [userId],
      title: "Yapay Zekâ ve Prompt Mühendisliğine Giriş",
      courseSlug: "ai-temel",
      issuedAt: new Date("2026-08-16T00:00:00.000Z"),
      certificateHash: ACADEMY_HASH,
    },
  ]);
  const visa = await issueCareerVisaStamp(
    { career, proofs },
    {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: `cert-${userId}`,
      actorUserId: userId,
    },
  );
  return { career, proofs, visa };
}

/**
 * D2.3 bellek e2e: vize kapısı → freelancer teslim/RELEASE damgası → kurumsal mühür/teklif/RELEASE.
 * Motorlar birbirini import etmez; hold BPS vizeden bağımsızdır.
 */
export async function runEarningsBridgeJourney() {
  const { career: workerCareer, proofs: workerProofs } = await stampAcademyVisa(EARNINGS_WORKER_ID);
  const bareCareer = createMemoryCareerStore();

  await expectGateDenied(bareCareer, EARNINGS_WORKER_ID);
  await assertAcademyCareerVisaForListing(workerCareer, EARNINGS_WORKER_ID, YZ_LISTING_VISA_SUBJECT, workerProofs);

  const freelancerPorts = withMemoryAcceptAtomic({
    ledger: createMemoryLedgerStore([
      { userId: EARNINGS_CLIENT_ID, amountMinor: EARNINGS_START_MINOR },
      { userId: EARNINGS_WORKER_ID, amountMinor: 0 },
      { userId: EARNINGS_PLATFORM_ID, amountMinor: 0 },
    ]),
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });

  const job = await createFreelancerJob(freelancerPorts, {
    clientId: EARNINGS_CLIENT_ID,
    title: "D2.3 teslim mühürü",
    brief: "Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif kapısı, emanet, teslim, RELEASE, iş bitirme damgası.",
    budgetMinor: EARNINGS_GROSS_MINOR,
    visaPathwayId: YZ_ICERIK_LISTING_PATHWAY,
  });
  await assertAcademyCareerVisaForListing(workerCareer, EARNINGS_WORKER_ID, job, workerProofs);
  const bid = await submitFreelancerBid(freelancerPorts, {
    jobId: job.id,
    bidderId: EARNINGS_WORKER_ID,
    amountMinor: EARNINGS_GROSS_MINOR,
    coverNote: "Teslim 5 gün, mühürlü.",
  });
  const { contract } = await acceptFreelancerBid(freelancerPorts, {
    jobId: job.id,
    bidId: bid.id,
    actorUserId: EARNINGS_CLIENT_ID,
    holdBps: HOLD_BPS_DEFAULT,
    platformUserId: EARNINGS_PLATFORM_ID,
  });
  const holdAfterAccept = await freelancerPorts.escrow.findById(contract.escrowHoldId);
  await postFreelancerContractMessage(freelancerPorts, {
    contractId: contract.id,
    actorUserId: EARNINGS_WORKER_ID,
    kind: "DELIVERY",
    body: "Teslim kanıtı: API uçları ve test raporu.",
    artifactUrl: "https://example.test/delivery.zip",
  });
  const released = await releaseFreelancerContract(freelancerPorts, {
    contractId: contract.id,
    actorUserId: EARNINGS_CLIENT_ID,
    platformUserId: EARNINGS_PLATFORM_ID,
  });
  let freelancerVisa = null;
  if (released) {
    workerProofs.add({
      sourceKind: "FREELANCER_RELEASE",
      sourceId: released.id,
      userId: EARNINGS_WORKER_ID,
      actorUserIds: [EARNINGS_WORKER_ID, EARNINGS_CLIENT_ID],
      title: job.title,
      issuedAt: released.releasedAt ?? new Date("2026-08-16T01:00:00.000Z"),
      certificateHash: null,
    });
    freelancerVisa = await issueCareerVisaStamp(
      { career: workerCareer, proofs: workerProofs },
      {
        sourceKind: "FREELANCER_RELEASE",
        sourceId: released.id,
        actorUserId: EARNINGS_CLIENT_ID,
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
    ledger: createMemoryLedgerStore([
      { userId: EARNINGS_CORP_OWNER_ID, amountMinor: EARNINGS_START_MINOR },
      { userId: EARNINGS_WORKER_ID, amountMinor: 0 },
      { userId: EARNINGS_PLATFORM_ID, amountMinor: 0 },
    ]),
    escrow: createMemoryEscrowStore(),
    marketplace: createMemoryMarketplaceSplitPort(),
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
    userId: EARNINGS_CORP_OWNER_ID,
    legalName: "Yetkin Ray A.Ş.",
  });
  const posting = await sealCorporateJobPosting(kurumsalPorts, {
    actorUserId: EARNINGS_CORP_OWNER_ID,
    title: "D2.3 kurumsal mühür",
    brief: "Dikey: yapay zekâ destekli içerik ve görsel üretim. Aynı EscrowHold motoru, oda duvarı korunur.",
    budgetMinor: EARNINGS_GROSS_MINOR,
    workbenchKind: "FREELANCER",
    holdBps: HOLD_BPS_DEFAULT,
  });
  const holdAfterSeal = await kurumsalPorts.escrow.findById(posting.escrowHoldId);
  const ledgerAfterSeal = kurumsalPorts.ledger.snapshot(EARNINGS_CORP_OWNER_ID).amountMinor;
  await assertAcademyCareerVisaForListing(workerCareer, EARNINGS_WORKER_ID, posting, workerProofs);
  const offer = await submitCorporateJobOffer(kurumsalPorts, {
    postingId: posting.id,
    bidderId: EARNINGS_WORKER_ID,
    coverNote: "Kariyer vizesi kapıdan geçti; tutar değişmez.",
  });
  const ledgerAfterOffer = kurumsalPorts.ledger.snapshot(EARNINGS_CORP_OWNER_ID).amountMinor;
  const awarded = await awardCorporateJobPosting(kurumsalPorts, {
    postingId: posting.id,
    actorUserId: EARNINGS_CORP_OWNER_ID,
    awardedUserId: EARNINGS_WORKER_ID,
  });
  const acceptedOffer = await kurumsalPorts.kurumsal.getOffer(offer.id);
  const corpReleased = await releaseCorporateJobPosting(kurumsalPorts, {
    postingId: posting.id,
    actorUserId: EARNINGS_CORP_OWNER_ID,
    platformUserId: EARNINGS_PLATFORM_ID,
  });
  let kurumsalVisa = null;
  if (corpReleased) {
    workerProofs.add({
      sourceKind: "FREELANCER_RELEASE",
      sourceId: corpReleased.id,
      userId: EARNINGS_WORKER_ID,
      actorUserIds: [EARNINGS_WORKER_ID, EARNINGS_CORP_OWNER_ID],
      title: posting.title,
      issuedAt: corpReleased.releasedAt ?? new Date("2026-08-16T02:00:00.000Z"),
      certificateHash: null,
    });
    kurumsalVisa = await issueCareerVisaStamp(
      { career: workerCareer, proofs: workerProofs },
      {
        sourceKind: "FREELANCER_RELEASE",
        sourceId: corpReleased.id,
        actorUserId: EARNINGS_CORP_OWNER_ID,
      },
    );
  }

  return {
    freelancer: {
      job,
      bid,
      contract,
      holdAfterAccept,
      released,
      visa: freelancerVisa,
      clientBalance: freelancerPorts.ledger.snapshot(EARNINGS_CLIENT_ID).amountMinor,
      workerBalance: freelancerPorts.ledger.snapshot(EARNINGS_WORKER_ID).amountMinor,
      platformBalance: freelancerPorts.ledger.snapshot(EARNINGS_PLATFORM_ID).amountMinor,
    },
    kurumsal: {
      posting,
      offer: acceptedOffer ?? offer,
      holdAfterSeal,
      ledgerAfterSeal,
      ledgerAfterOffer,
      awarded,
      released: corpReleased,
      visa: kurumsalVisa,
      ownerBalance: kurumsalPorts.ledger.snapshot(EARNINGS_CORP_OWNER_ID).amountMinor,
      workerBalance: kurumsalPorts.ledger.snapshot(EARNINGS_WORKER_ID).amountMinor,
      platformBalance: kurumsalPorts.ledger.snapshot(EARNINGS_PLATFORM_ID).amountMinor,
    },
  };
}

async function expectGateDenied(
  career: ReturnType<typeof createMemoryCareerStore>,
  userId: string,
): Promise<void> {
  try {
    await assertAcademyCareerVisaForListing(career, userId, YZ_LISTING_VISA_SUBJECT);
    throw new Error("Vize kapısı vizeless teklifi geçirdi.");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return;
    }
    throw error;
  }
}
