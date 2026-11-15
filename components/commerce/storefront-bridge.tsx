"use client";

import { useState } from "react";
import { cockpitHref } from "@/components/commerce/href";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function StorefrontBridge({ path, live }: { path: string; live: boolean }) {
  const copy = SEN_VOICE.magazam;
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      const absolute = new URL(path, window.location.origin).toString();
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-[var(--foreground)]">{path}</p>
      {live ? (
        <div className="flex flex-wrap gap-2">
          <LinkButton href={cockpitHref(path)} target="_blank">
            {copy.storefrontOpen}
          </LinkButton>
          <Button type="button" variant="outline" onClick={() => void copyAddress()}>
            {copied ? copy.storefrontCopied : copy.storefrontCopy}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">{copy.storefrontDraft}</p>
      )}
    </div>
  );
}
