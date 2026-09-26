"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { BrandIcon } from "@/components/ui/brand-icon";

type LoginCopy = typeof SEN_VOICE.auth.login;

export function LoginPageContent({
  copy: serverCopy,
  children,
}: {
  copy: LoginCopy;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copy = mounted ? SEN_VOICE.auth.login : serverCopy;

  return (
    <main className="mx-auto flex h-dvh max-h-dvh w-full max-w-md flex-col px-4 py-3 sm:px-6">
      <div className="flex h-full min-h-0 w-full flex-col justify-center">
        <div className="flex max-h-full min-h-0 w-full flex-col">
          <div className="flex shrink-0 items-center gap-3">
            <BrandIcon className="h-8 w-8 shrink-0" />
            <div className="min-w-0">
              <Badge tone="safir">{SEN_VOICE.auth.brand}</Badge>
              <h1 className="text-2xl font-semibold tracking-tight" suppressHydrationWarning={true}>
                {copy.title}
              </h1>
            </div>
          </div>
          <p className="mt-1 shrink-0 text-sm text-slate-600" suppressHydrationWarning={true}>
            {copy.description}
          </p>
          <Card
            variant="glass"
            dense
            className="mt-3 flex min-h-0 flex-col overflow-hidden"
            bodyClassName="flex min-h-0 flex-1 flex-col"
          >
            {children}
          </Card>
          <div className="mt-3 flex shrink-0 flex-col gap-2">
            <LinkButton
              href="/register"
              variant="secondary"
              size="md"
              className="w-full"
              suppressHydrationWarning={true}
            >
              {copy.registerCta}
            </LinkButton>
            <LinkButton href="/" variant="outline" size="md" className="w-full" suppressHydrationWarning={true}>
              {copy.homeCta}
            </LinkButton>
          </div>
        </div>
      </div>
    </main>
  );
}
