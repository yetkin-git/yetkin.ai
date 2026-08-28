import { randomUUID } from "node:crypto";
import {
  createEscrowHold,
  refundEscrowHold,
  releaseEscrowHold,
  resolvePlatformTreasuryUserId,
  type EscrowStore,
} from "@/lib/kernel/escrow";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import { HOLD_BPS_DEFAULT, resolveHoldBps } from "@/lib/kernel/pricing/hold-bps";
import type { MarketplaceSplitPort } from "@/lib/kernel/payments/marketplace-split";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import {
  assertAmountWithinCatalogBand,
  requireActiveCatalogEntry,
} from "@/lib/kernel/pricing/catalog-band";
import {
  canAwardPosting,
  canRefundPosting,
  canReleasePosting,
  canSubmitOffer,
  corporateJobReferenceKey,
} from "@/lib/kurumsal/fsm";
import {
  KURUMSAL_JOB_FLOOR_UNIT_KEY,
  KURUMSAL_MODULE_KEY,
  type CorporateCompanyRecord,
  type CorporateJobOfferRecord,
  type CorporateJobPostingRecord,
  type CorporateWorkbenchKind,
  type KurumsalStore,
} from "@/lib/kurumsal/types";

export type KurumsalMoneyWritePorts = {
  ledger: LedgerStore;
  escrow: EscrowStore;
  kurumsal: KurumsalStore;
  marketplace?: MarketplaceSplitPort;
};

export type KurumsalEnginePorts = {
  ledger: LedgerStore;
  escrow: EscrowStore;
  catalog: PriceCatalogStore;
  kurumsal: KurumsalStore;
  marketplace?: MarketplaceSplitPort;
  /**
   * Mühür hold + release/refund + ilan kaydı tek atomik birim.
   * Prisma: `$transaction`. Bellek: kuyruk + anlık görüntü.
   */
  runMoneyAtomic?: <T>(work: (tx: KurumsalMoneyWritePorts) => Promise<T>) => Promise<T>;
};

async function withKurumsalMoney<T>(
  ports: KurumsalEnginePorts,
  work: (tx: KurumsalMoneyWritePorts) => Promise<T>,
): Promise<T> {
  if (ports.runMoneyAtomic) {
    return ports.runMoneyAtomic(work);
  }
  return work({
    ledger: ports.ledger,
    escrow: ports.escrow,
    kurumsal: ports.kurumsal,
    marketplace: ports.marketplace,
  });
}

export type UpsertCompanyCommand = {
  userId: string;
  legalName: string;
  tradeName?: string | null;
  jurisdiction?: string;
  taxId?: string | null;
  now?: Date;
};

export type SealJobPostingCommand = {
  actorUserId: string;
  title: string;
  brief: string;
  budgetMinor: number;
  workbenchKind: CorporateWorkbenchKind;
  holdBps?: number;
  currencyCode?: CurrencyCode;
  now?: Date;
};

export type AwardJobPostingCommand = {
  postingId: string;
  actorUserId: string;
  awardedUserId: string;
  awardedDevLabsProjectId?: string | null;
  now?: Date;
};

export type SubmitJobOfferCommand = {
  postingId: string;
  bidderId: string;
  coverNote: string;
  now?: Date;
};

export type PostingActorCommand = {
  postingId: string;
  actorUserId: string;
  platformUserId?: string;
  now?: Date;
};

export async function upsertCorporateCompany(
  ports: KurumsalEnginePorts,
  command: UpsertCompanyCommand,
): Promise<CorporateCompanyRecord> {
  const now = command.now ?? new Date();
  const existing = await ports.kurumsal.getCompanyByUserId(command.userId);
  const legalName = command.legalName.trim();
  const tradeName = command.tradeName?.trim() ? command.tradeName.trim() : null;
  const jurisdiction = (command.jurisdiction ?? "TR").trim().toUpperCase();
  const taxId = command.taxId?.trim() ? command.taxId.trim() : null;
  if (existing) {
    return ports.kurumsal.updateCompany(existing.id, {
      legalName,
      tradeName,
      jurisdiction,
      taxId,
      updatedAt: now,
    });
  }
  return ports.kurumsal.insertCompany({
    id: randomUUID(),
    userId: command.userId,
    legalName,
    tradeName,
    jurisdiction,
    taxId,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });
}

export async function sealCorporateJobPosting(
  ports: KurumsalEnginePorts,
  command: SealJobPostingCommand,
): Promise<CorporateJobPostingRecord> {
  const company = await ports.kurumsal.getCompanyByUserId(command.actorUserId);
  if (!company || company.status !== "ACTIVE") {
    throw new Error("Mühürlü ilan için aktif şirket profili gerekir.");
  }

  const catalog = await requireActiveCatalogEntry(
    ports.catalog,
    KURUMSAL_MODULE_KEY,
    KURUMSAL_JOB_FLOOR_UNIT_KEY,
  );
  const budgetMinor = assertAmountWithinCatalogBand(command.budgetMinor, catalog);
  const currencyCode = command.currencyCode ?? SETTLEMENT_CURRENCY;
  if (currencyCode !== SETTLEMENT_CURRENCY || catalog.currencyCode !== SETTLEMENT_CURRENCY) {
    throw new Error("Gün 0 settlement yalnızca TRY.");
  }

  const now = command.now ?? new Date();
  const postingId = randomUUID();
  const holdBps = resolveHoldBps(command.holdBps ?? HOLD_BPS_DEFAULT);
  return withKurumsalMoney(ports, async (tx) => {
    const { hold } = await createEscrowHold(
      { ledger: tx.ledger, escrow: tx.escrow, marketplace: tx.marketplace ?? ports.marketplace },
      {
        userId: command.actorUserId,
        referenceKey: corporateJobReferenceKey(postingId),
        grossMinor: budgetMinor,
        holdBps,
        currencyCode,
        now,
        funding: "psp",
      },
    );

    return tx.kurumsal.insertPosting({
      id: postingId,
      companyId: company.id,
      userId: command.actorUserId,
      title: command.title.trim(),
      brief: command.brief.trim(),
      budgetMinor,
      currencyCode,
      workbenchKind: command.workbenchKind,
      escrowHoldId: hold.id,
      status: "SEALED",
      awardedUserId: null,
      awardedDevLabsProjectId: null,
      holdBps: hold.holdBps,
      grossMinor: hold.grossMinor,
      holdMinor: hold.holdMinor,
      netMinor: hold.netMinor,
      sealedAt: now,
      awardedAt: null,
      releasedAt: null,
      refundedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  });
}

export async function submitCorporateJobOffer(
  ports: KurumsalEnginePorts,
  command: SubmitJobOfferCommand,
): Promise<CorporateJobOfferRecord> {
  const posting = await ports.kurumsal.getPosting(command.postingId);
  if (!posting) {
    throw new Error("İlan bulunamadı.");
  }
  if (!canSubmitOffer(posting.status)) {
    throw new Error("İlan teklife kapalı.");
  }
  if (command.bidderId === posting.userId) {
    throw new Error("Şirket sahibi kendi ilanına teklif veremez.");
  }
  const duplicate = await ports.kurumsal.getOfferByPostingAndBidder(posting.id, command.bidderId);
  if (duplicate) {
    throw new Error("Bu ilana zaten teklif var.");
  }

  const now = command.now ?? new Date();
  return ports.kurumsal.insertOffer({
    id: randomUUID(),
    postingId: posting.id,
    bidderId: command.bidderId,
    coverNote: command.coverNote.trim(),
    status: "SUBMITTED",
    createdAt: now,
    updatedAt: now,
  });
}

export async function awardCorporateJobPosting(
  ports: KurumsalEnginePorts,
  command: AwardJobPostingCommand,
): Promise<CorporateJobPostingRecord> {
  const posting = await ports.kurumsal.getPosting(command.postingId);
  if (!posting) {
    throw new Error("İlan bulunamadı.");
  }
  if (command.actorUserId !== posting.userId) {
    throw new Error("Yalnız şirket sahibi ilanı ödüllendirebilir.");
  }
  if (!canAwardPosting(posting.status)) {
    if (posting.status === "AWARDED") {
      return posting;
    }
    throw new Error("İlan ödüllendirmeye kapalı.");
  }
  if (command.awardedUserId === posting.userId) {
    throw new Error("Şirket sahibi kendi ilanını kendine veremez.");
  }
  if (posting.workbenchKind === "DEVLABS") {
    const projectId = command.awardedDevLabsProjectId?.trim() ?? "";
    if (!projectId) {
      throw new Error("DevLabs işi için proje kimliği gerekir.");
    }
  }

  const now = command.now ?? new Date();
  const awarded = await ports.kurumsal.updatePosting(posting.id, {
    status: "AWARDED",
    awardedUserId: command.awardedUserId,
    awardedDevLabsProjectId:
      posting.workbenchKind === "DEVLABS"
        ? (command.awardedDevLabsProjectId?.trim() ?? null)
        : null,
    awardedAt: now,
    updatedAt: now,
  });

  const offers = await ports.kurumsal.listOffersForPosting(posting.id);
  for (const offer of offers) {
    if (offer.status !== "SUBMITTED") {
      continue;
    }
    await ports.kurumsal.updateOffer(offer.id, {
      status: offer.bidderId === command.awardedUserId ? "ACCEPTED" : "REJECTED",
      updatedAt: now,
    });
  }

  return awarded;
}

export async function releaseCorporateJobPosting(
  ports: KurumsalEnginePorts,
  command: PostingActorCommand,
): Promise<CorporateJobPostingRecord> {
  const posting = await ports.kurumsal.getPosting(command.postingId);
  if (!posting) {
    throw new Error("İlan bulunamadı.");
  }
  if (command.actorUserId !== posting.userId) {
    throw new Error("Yalnız şirket sahibi emaneti serbest bırakabilir.");
  }
  if (!canReleasePosting(posting.status)) {
    if (posting.status === "RELEASED") {
      return posting;
    }
    throw new Error("İlan serbest bırakılamaz.");
  }
  if (!posting.awardedUserId) {
    throw new Error("Ödüllendirilmemiş ilan serbest bırakılamaz.");
  }

  const now = command.now ?? new Date();
  return withKurumsalMoney(ports, async (tx) => {
    const current = await tx.kurumsal.getPosting(posting.id);
    if (!current) {
      throw new Error("İlan bulunamadı.");
    }
    if (!canReleasePosting(current.status)) {
      if (current.status === "RELEASED") {
        return current;
      }
      throw new Error("İlan serbest bırakılamaz.");
    }
    if (!current.awardedUserId) {
      throw new Error("Ödüllendirilmemiş ilan serbest bırakılamaz.");
    }

    await releaseEscrowHold(
      { ledger: tx.ledger, escrow: tx.escrow, marketplace: tx.marketplace ?? ports.marketplace },
      {
        referenceKey: corporateJobReferenceKey(current.id),
        payeeUserId: current.awardedUserId,
        platformUserId: command.platformUserId ?? resolvePlatformTreasuryUserId(),
        now,
      },
    );

    return tx.kurumsal.updatePosting(current.id, {
      status: "RELEASED",
      releasedAt: now,
      updatedAt: now,
    });
  });
}

export async function refundCorporateJobPosting(
  ports: KurumsalEnginePorts,
  command: PostingActorCommand,
): Promise<CorporateJobPostingRecord> {
  const posting = await ports.kurumsal.getPosting(command.postingId);
  if (!posting) {
    throw new Error("İlan bulunamadı.");
  }
  if (command.actorUserId !== posting.userId) {
    throw new Error("Yalnız şirket sahibi ilanı iade edebilir.");
  }
  if (!canRefundPosting(posting.status)) {
    if (posting.status === "REFUNDED") {
      return posting;
    }
    throw new Error("İlan iade edilemez.");
  }

  const now = command.now ?? new Date();
  return withKurumsalMoney(ports, async (tx) => {
    const current = await tx.kurumsal.getPosting(posting.id);
    if (!current) {
      throw new Error("İlan bulunamadı.");
    }
    if (!canRefundPosting(current.status)) {
      if (current.status === "REFUNDED") {
        return current;
      }
      throw new Error("İlan iade edilemez.");
    }

    await refundEscrowHold(
      { ledger: tx.ledger, escrow: tx.escrow, marketplace: tx.marketplace ?? ports.marketplace },
      {
        referenceKey: corporateJobReferenceKey(current.id),
        now,
      },
    );

    return tx.kurumsal.updatePosting(current.id, {
      status: "REFUNDED",
      refundedAt: now,
      updatedAt: now,
    });
  });
}
