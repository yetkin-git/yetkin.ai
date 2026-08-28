"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

export function RoomErrorView({
  error,
  retry,
  eyebrow,
  description,
  backHref,
  backLabel,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  eyebrow: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const copy = PUBLIC_SEN.error;
  return (
    <RoomFrame className="max-w-3xl px-6 py-16">
      <PageHeader eyebrow={eyebrow} title={copy.title} description={description} />
      <Card variant="glass">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => retry()}>{copy.retry}</Button>
          <LinkButton href={backHref} variant="outline">
            {backLabel}
          </LinkButton>
          <LinkButton href="/" variant="ghost">
            {copy.homeCta}
          </LinkButton>
        </div>
        {error.digest ? (
          <p className="mt-4 text-xs text-[var(--muted)]">
            {copy.codeLabel} {error.digest}
          </p>
        ) : null}
      </Card>
    </RoomFrame>
  );
}
