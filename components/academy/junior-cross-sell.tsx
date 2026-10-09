import { LinkButton } from "@/components/ui/link-button";

/** Akademi vitrini altı yetişkin kursun altında. Junior’a tek tık. */
export function JuniorCrossSellBanner() {
  return (
    <section
      data-junior-cross-sell=""
      className="overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--safir)_28%,transparent)] bg-[var(--surface-ink)] p-6 text-white shadow-sm sm:p-8"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
        Yetkin Junior
      </p>
      <h2 className="mt-2 text-pretty text-xl font-semibold tracking-tight sm:text-2xl">
        Çocuğun için 6. sınıf dersleri Junior&apos;da
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
        Matematik, Fen, Türkçe, Ana İngilizce ve Sosyal Bilgiler. Her dersin ilk konusu ücretsizdir. Sınıf seçici
        yalnız 6. sınıf pilotudur.
      </p>
      <div className="mt-5">
        <LinkButton href="/junior">► Junior Derslerini İncele</LinkButton>
      </div>
    </section>
  );
}
