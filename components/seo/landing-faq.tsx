import type { LandingFaqItem } from "@/lib/copy/sem-keywords";

export function LandingFaq({
  heading,
  items,
}: {
  heading: string;
  items: readonly LandingFaqItem[];
}) {
  return (
    <section className="mt-8 space-y-4" data-sem-landing-faq="" aria-labelledby="sem-landing-faq">
      <h2 id="sem-landing-faq" className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
        {heading}
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.question}>
            <h3 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">{item.question}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
