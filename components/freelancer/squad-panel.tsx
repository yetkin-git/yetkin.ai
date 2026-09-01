"use client";

import { FrozenSquadNotice } from "@/components/freelancer/frozen-satellite";
import type { FreelancerSquadMemberRecord, FreelancerSquadRecord } from "@/lib/freelancer/types";

/** Squad UI bu fazda dondurulmuştur. Halka ilan → vizeli teklif → emanettir. */
export function SquadPanel(_props: {
  contractId: string;
  freelancerId: string;
  isFreelancer: boolean;
  squad: FreelancerSquadRecord | null;
  members: FreelancerSquadMemberRecord[];
}) {
  return <FrozenSquadNotice />;
}
