"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { StandaloneSquadModal } from "@/components/freelancer/standalone-squad-modal";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import type { Route } from "next";

/** Katalog / ilan vitrini — bağımsız ön takım + ilan CTA. */
export function SquadTeaser({
  href = "/freelancer",
  compact = false,
}: {
  href?: Route;
  compact?: boolean;
}) {
  const copy = FREELANCER_SEN.squad;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        title={copy.teaserTitle}
        eyebrow={copy.eyebrow}
        variant="featured"
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" size="sm" variant="primary" onClick={() => setOpen(true)}>
              {copy.teaserCreateCta}
            </Button>
            {compact ? null : (
              <LinkButton href={href} variant="outline" size="sm">
                {copy.teaserCta}
              </LinkButton>
            )}
          </div>
        }
      >
        <p className="text-[var(--foreground)]">{copy.teaserBody}</p>
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{copy.paytrNote}</p>
      </Card>
      <StandaloneSquadModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
