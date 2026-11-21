import type { ReactNode } from "react";
import { LegalColophonStrip } from "@/components/legal/legal-colophon-strip";
import { AppShell } from "@/components/shell/app-shell";

/**
 * Tezgâh kabuğu.
 *
 * SEO/performans tedavisi (Faz 2): burada 20 satırlık ham CSS bloğu React
 * ağacında duruyordu ve her `/tezgah` isteğinde HTML gövdesine yeniden
 * basılıyordu. Yazdırma kuralları artık `app/globals.css` içindeki
 * `@media print` katmanındadır (`[data-tezgah-chrome]` seçicisi orada).
 * Görsel davranış birebir korunur; kabuk yalnız içerik basar.
 */
export default function TezgahLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {children}
      <div className="print:hidden">
        <LegalColophonStrip compact />
      </div>
    </AppShell>
  );
}
