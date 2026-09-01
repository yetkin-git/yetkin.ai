"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AiChatWidget } from "@/components/kernel/ai-chat-widget";
import { LegalSiteFooter } from "@/components/legal/legal-site-footer";
import { ShellChrome } from "@/components/shell/shell-chrome";

const DOCUMENT_PREFIX = "/academy/dogrula";

export function AppShellSwitch({
  children,
  userCluster,
}: {
  children: ReactNode;
  userCluster: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith(DOCUMENT_PREFIX)) {
    return (
      <div
        data-room="academy"
        data-document-vitrine="true"
        className="min-h-screen bg-[#f6f1e4] text-[var(--foreground)]"
      >
        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">{children}</main>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <ShellChrome userCluster={userCluster}>
        <main className="relative px-4 py-8 pb-16 sm:px-6 lg:px-8">{children}</main>
      </ShellChrome>
      <AiChatWidget />
      <LegalSiteFooter />
    </div>
  );
}
