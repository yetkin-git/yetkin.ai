import type { Route } from "next";
import { LinkButton } from "@/components/ui/link-button";
import type { YetkinCvCardView } from "@/lib/career/yetkincv-options";

export function YetkinCvCard({ card }: { card: YetkinCvCardView }) {
  return (
    <article data-yetkincv-card="live" className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">YetkinCV</p>
      <h2 className="mt-2 font-serif text-2xl tracking-tight text-[var(--foreground)]">Mühürlü puan kartı</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {card.roleLabel} · {card.verticalLabel}. CV metni bu kartta yoktur. Satın alma bu puanı basmaz.
      </p>
      <p className="mt-4 text-4xl font-semibold tabular-nums text-[var(--foreground)]" data-yetkincv-score={card.score}>
        {card.score}
        <span className="ml-1 text-base font-medium text-[var(--muted)]">/ 100</span>
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
        {card.passed ? "Baraj 70 geçildi." : "Baraj 70 altı. Bu kayıt geçiş değildir."}
      </p>
      <ul className="mt-4 grid gap-2">
        {card.skills.map((skill) => (
          <li key={skill.id} className="flex items-center justify-between gap-3 text-sm">
            <span>{skill.label}</span>
            <span className="tabular-nums font-medium">{skill.score}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 break-all font-mono text-xs leading-5 text-[var(--foreground)]">{card.certificateHash}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">SHA-256 doğrulama kodu. İmza değildir; sicil bütünlük kaydıdır.</p>
      <div className="mt-4">
        <LinkButton href={card.verifyPath as Route} size="sm">
          Doğrulama bağını aç
        </LinkButton>
      </div>
    </article>
  );
}
