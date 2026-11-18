import "server-only";

import { readBillingInfo } from "@/lib/kernel/identity/billing-info-write";
import { createPrismaBillingInfoStore } from "@/lib/kernel/identity/prisma-billing-info-store";
import { formatAmountMinorAsWholeTry } from "@/lib/yetkinhibe/format-amount";
import { TEZGAH_CREDIT_PACK_SIZE } from "@/lib/tezgah/catalog";
import {
  readTezgahCatalogAmount,
  readTezgahPackAmount,
  readTezgahProActive,
  TEZGAH_GRANT_UNIT,
  TEZGAH_PRO_UNIT,
} from "@/lib/tezgah/paid-lane";

export type TezgahOfferCard = {
  open: boolean;
  priceLabel: string | null;
};

export type TezgahOfferBoard = {
  pro: TezgahOfferCard;
  creditPack: TezgahOfferCard & { credits: typeof TEZGAH_CREDIT_PACK_SIZE };
  grantDossier: TezgahOfferCard;
  proActive: boolean;
  billingReady: boolean;
};

function card(amount: number | null): TezgahOfferCard {
  if (amount == null) {
    return { open: false, priceLabel: null };
  }
  return { open: true, priceLabel: formatAmountMinorAsWholeTry(amount) };
}

export async function loadTezgahOffers(userId: string | null, now = new Date()): Promise<TezgahOfferBoard> {
  const [proAmount, packAmount, dossierAmount, proActive, billing] = await Promise.all([
    readTezgahCatalogAmount(TEZGAH_PRO_UNIT),
    readTezgahPackAmount(),
    readTezgahCatalogAmount(TEZGAH_GRANT_UNIT),
    userId ? readTezgahProActive(userId, now) : Promise.resolve(false),
    userId
      ? readBillingInfo(createPrismaBillingInfoStore(), userId).catch(() => null)
      : Promise.resolve(null),
  ]);
  return {
    pro: card(proAmount),
    creditPack: { ...card(packAmount), credits: TEZGAH_CREDIT_PACK_SIZE },
    grantDossier: card(dossierAmount),
    proActive,
    billingReady: billing != null,
  };
}
