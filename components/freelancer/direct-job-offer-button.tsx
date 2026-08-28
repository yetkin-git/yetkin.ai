"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DirectJobOfferModal,
  type DirectJobOfferInvitee,
} from "@/components/freelancer/direct-job-offer-modal";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import type { AcademyPathwayId } from "@/lib/academy/level-pathway";

/** Usta profil kartı / uzmanlık satırı — doğrudan özel iş teklifi. */
export function DirectJobOfferButton({
  invitee,
  defaultPathwayId,
  size = "sm",
  variant = "outline",
}: {
  invitee: DirectJobOfferInvitee;
  defaultPathwayId?: AcademyPathwayId;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "secondary";
}) {
  const copy = FREELANCER_SEN.directOffer;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size={size} variant={variant} onClick={() => setOpen(true)}>
        {copy.buttonCta}
      </Button>
      <DirectJobOfferModal
        open={open}
        onClose={() => setOpen(false)}
        invitee={invitee}
        defaultPathwayId={defaultPathwayId}
      />
    </>
  );
}
