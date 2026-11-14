import type { ReactNode } from "react";
import { LegalColophonStrip } from "@/components/legal/legal-colophon-strip";
import { AppShell } from "@/components/shell/app-shell";

export default function TezgahLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {children}
      <LegalColophonStrip />
    </AppShell>
  );
}
