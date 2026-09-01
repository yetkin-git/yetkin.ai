"use client";

import { FrozenDirectOfferNotice } from "@/components/freelancer/frozen-satellite";
import type { DirectJobOfferInvitee } from "@/components/freelancer/direct-job-offer-button";
import type { FreelancerNeedId } from "@/lib/kernel/catalog-ids";

/** Doğrudan teklif UI bu fazda dondurulmuştur. */
export function DirectJobOfferModal(_props: {
  open: boolean;
  onClose: () => void;
  invitee: DirectJobOfferInvitee;
  defaultPathwayId?: FreelancerNeedId;
}) {
  return <FrozenDirectOfferNotice />;
}
