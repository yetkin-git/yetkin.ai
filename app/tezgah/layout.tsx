import type { ReactNode } from "react";
import { LegalColophonStrip } from "@/components/legal/legal-colophon-strip";
import { AppShell } from "@/components/shell/app-shell";

export default function TezgahLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <style>{`
        @media print {
          [data-shell-header],
          [data-shell-drawer],
          [data-sidebar-collapsed],
          [data-assistant-fab],
          [data-legal-colophon-strip],
          [data-tezgah-chrome] {
            display: none !important;
          }
          [style*="--rail-sidebar-width"] {
            padding-left: 0 !important;
          }
        }
      `}</style>
      {children}
      <div className="print:hidden">
        <LegalColophonStrip compact />
      </div>
    </AppShell>
  );
}
