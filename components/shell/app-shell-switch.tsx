"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AiChatWidget } from "@/components/kernel/ai-chat-widget";
import { ShellChrome } from "@/components/shell/shell-chrome";

const DOCUMENT_PREFIX = "/academy/dogrula";
const ACADEMY_PLAYER_PATH = /\/academy\/[^/]+\/oyna\/?$/;

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
  const academyPlayer = ACADEMY_PLAYER_PATH.test(pathname);
  return (
    <div className="min-h-screen">
      <ShellChrome userCluster={userCluster}>
        <main
          className={
            academyPlayer
              ? "relative px-3 py-3 sm:px-4 lg:px-5"
              : "relative px-4 py-8 sm:px-6 lg:px-8"
          }
        >
          {children}
        </main>
      </ShellChrome>
      <AiChatWidget />
    </div>
  );
}
