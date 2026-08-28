"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StandaloneSquadModal } from "@/components/freelancer/standalone-squad-modal";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";

/** Tezgâh üst barı — SquadTeaser kartı yerine ikincil CTA; modal aynı. */
export function SquadCreateButton({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const copy = FREELANCER_SEN.squad;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size={size} variant="outline" onClick={() => setOpen(true)}>
        {copy.teaserCreateCta}
      </Button>
      <StandaloneSquadModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
