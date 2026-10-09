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
  const juniorRoom = pathname === "/junior" || pathname.startsWith("/junior/");
  const juniorVitrine = pathname === "/junior";
  return (
    <div className="min-h-screen">
      <ShellChrome userCluster={userCluster}>
        <main
          className={
            academyPlayer
              ? "relative mt-0 px-3 pt-0 pb-3 sm:px-4 lg:px-5"
              : juniorVitrine
                ? "relative px-4 pt-3 pb-6 sm:px-6 lg:px-8"
                : "relative px-4 py-8 sm:px-6 lg:px-8"
          }
        >
          {children}
        </main>
      </ShellChrome>
      {juniorRoom ? null : <AiChatWidget />}
    </div>
  );
}
