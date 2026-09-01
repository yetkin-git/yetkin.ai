"use client";

import { FrozenSquadNotice } from "@/components/freelancer/frozen-satellite";

/** Squad UI bu fazda dondurulmuştur. */
export function StandaloneSquadModal(_props?: {
  open?: boolean;
  onClose?: () => void;
}) {
  return <FrozenSquadNotice />;
}
