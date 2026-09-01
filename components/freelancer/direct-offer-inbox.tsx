import { FrozenDirectOfferNotice } from "@/components/freelancer/frozen-satellite";
import type { FreelancerJobRecord } from "@/lib/freelancer/types";

/** Doğrudan teklif UI bu fazda dondurulmuştur. */
export function DirectOfferInbox(_props: { offers: FreelancerJobRecord[] }) {
  return <FrozenDirectOfferNotice />;
}
