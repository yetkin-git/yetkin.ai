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
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 pb-14 pt-16">
      <div className="relative">
        <BrandIcon className="mb-4 h-10 w-10" />
        <Badge tone="safir">{SEN_VOICE.auth.brand}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight" suppressHydrationWarning={true}>
          {copy.title}
        </h1>
        <p className="mt-2 text-base text-slate-600" suppressHydrationWarning={true}>
          {copy.description}
        </p>
        <Card variant="glass" className="mt-6">
          {children}
        </Card>
        <div className="mt-4 flex gap-3">
          <LinkButton href="/register" variant="outline" size="sm" suppressHydrationWarning={true}>
            {copy.registerCta}
          </LinkButton>
          <LinkButton href="/" variant="ghost" size="sm" suppressHydrationWarning={true}>
            {copy.homeCta}
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
