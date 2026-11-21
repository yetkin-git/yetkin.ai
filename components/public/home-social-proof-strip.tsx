import { IconCheck, IconShield } from "@/components/ui/icons";
import type { HomeProofLine } from "@/lib/pricing/home-social-proof";

/**
 * Ana sayfa canlı kanıt şeridi — `data-home-social-proof`.
 *
 * Gerçek veri tabanlıdır: `loadHomeSocialProof` sayaçları DB'den okur ve
 * anlamlı eşiği (`HOME_PROOF_MIN_COUNT`) aşmayan satırı düşürür. Hiç satır
 * kalmazsa bu bileşen **hiçbir şey basmaz** — sahte metin, uydurma logo,
 * "0 kullanıcı" veya müşteri yorumu üretilmez.
 */
export function HomeSocialProofStrip({ lines }: { lines: readonly HomeProofLine[] }) {
  if (lines.length === 0) {
    return null;
  }
  return (
    <section
      className="relative mt-8"
      aria-labelledby="home-proof-heading"
      data-home-social-proof=""
    >
      <h2
        id="home-proof-heading"
        className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
      >
        <IconShield className="h-3.5 w-3.5 text-emerald-600" />
        Ölçülen gerçek kullanım
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {lines.map((line) => (
          <li
            key={line.id}
            data-home-proof-item={line.id}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4"
          >
            <p className="flex items-start gap-1.5 text-sm font-semibold leading-6 text-emerald-950">
              <IconCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{line.label}</span>
            </p>
            <p className="mt-1.5 text-xs leading-5 text-emerald-900/70">{line.hint}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] leading-5 text-[var(--muted)]">
        Bu sayılar veritabanındaki gerçek kayıtlardan okunur. Eşiğin altındaki sayaç yayımlanmaz;
        uydurma yorum veya logo basılmaz.
      </p>
    </section>
  );
}
