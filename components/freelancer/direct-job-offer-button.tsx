"use client";

import { FrozenDirectOfferNotice } from "@/components/freelancer/frozen-satellite";
import type { FreelancerNeedId } from "@/lib/kernel/catalog-ids";

export type DirectJobOfferInvitee = {
  displayName: string;
  visaPathwayIds?: FreelancerNeedId[];
};

/** Doğrudan teklif UI bu fazda dondurulmuştur. */
export function DirectJobOfferButton(_props: {
  invitee: DirectJobOfferInvitee;
  defaultPathwayId?: FreelancerNeedId;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "secondary";
}) {
  return <FrozenDirectOfferNotice />;
}
