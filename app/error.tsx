"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const copy = PUBLIC_SEN.error;
  return (
    <RoomFrame className="max-w-3xl px-6 py-16">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />
      <Card variant="glass">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => retry()}>{copy.retry}</Button>
          <LinkButton href="/" variant="outline">
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
