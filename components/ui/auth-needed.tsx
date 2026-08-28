"use client";

import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";

export function AuthNeeded({ message }: { message: string }) {
  const pathname = usePathname();
  return (
    <Card variant="glass" className="text-center" bodyClassName="text-[var(--foreground)]">
      <p className="text-sm text-[var(--muted)]">{message}</p>
      <div className="mt-4">
        <LinkButton href={buildCitizenLoginHref(pathname) as Route}>{AUTH_SEN.login.submit}</LinkButton>
      </div>
    </Card>
  );
}
