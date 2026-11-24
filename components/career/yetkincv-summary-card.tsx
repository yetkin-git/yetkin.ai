import type { YetkinCvCardView } from "@/lib/career/yetkincv-options";

/**
 * Faz 3 / §4.3 — **özet** kariyer kartı (yayın açılmamış mühür).
 *
 * Dürüstlük: puan gerçektir, test sonucundan doğmuştur ve burada da gösterilir.
 * Eksik olan tek şey **yayındır** — kamuya açık tam kart, paylaşım rozeti ve
 * uzman dizini görünürlüğü. Bu yüzden özet kart puanı "gizlemez", yalnız tam
 * doğrulama kartının ayrıcalıklarını ödemeye bırakır.
 *
 * "Satın alma bu puanı basmaz" cümlesi korunur — para puanı değil yayını açar.
 */
export function YetkinCvSummaryCard({ card }: { card: YetkinCvCardView }) {
  const topSkills = [...card.skills].sort((left, right) => right.score - left.score).slice(0, 3);
  return (
    <article
      data-yetkincv-card="summary"
      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
        YetkinCV · Özet
      </p>
      <h2 className="mt-2 font-serif text-2xl tracking-tight text-[var(--foreground)]">
        Doğrulanabilir puan özeti
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {card.roleLabel} · {card.verticalLabel}. Puan sunucudaki vaka testi sonucundan doğar; satın alma
        bu puanı basmaz.
      </p>
      <p
        className="mt-4 text-4xl font-semibold tabular-nums text-[var(--foreground)]"
        data-yetkincv-score={card.score}
      >
        {card.score}
        <span className="ml-1 text-base font-medium text-[var(--muted)]">/ 100</span>
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
        {card.passed ? "Baraj 70 geçildi." : "Baraj 70 altı. Bu kayıt geçiş değildir."}
      </p>
      {topSkills.length > 0 ? (
        <>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Temel beceriler
          </p>
          <ul className="mt-2 grid gap-2">
            {topSkills.map((skill) => (
              <li key={skill.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{skill.label}</span>
                <span className="tabular-nums font-medium">{skill.score}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
        Bu özet kart herkese açıktır. Tam doğrulanabilir kart, paylaşım rozeti ve uzman dizini
        görünürlüğü yayın mührü açılınca etkinleşir.
      </p>
    </article>
  );
}
