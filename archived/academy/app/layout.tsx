import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { LegalColophonStrip } from "@/components/legal/legal-colophon-strip";

/**
 * Katalog kanoniği bu kabukta durmaz. Durursa oynatıcı ve çıkış paketi
 * `https://yetkin.ai/academy` kanoniğini miras alır.
 */
export default function AcademyLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {children}
      <LegalColophonStrip />
    </AppShell>
  );
}
