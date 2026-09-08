import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { LegalColophonStrip } from "@/components/legal/legal-colophon-strip";

export default function FreelancerLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {children}
      <LegalColophonStrip />
    </AppShell>
  );
}
