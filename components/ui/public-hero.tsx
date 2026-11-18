import type { ReactNode } from "react";

/** Kamu sayfalarının ortak karşılama bandı. Veri üretmez. */
export function PublicHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-blue-50/70 to-white px-6 py-8 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.18),transparent_68%)]"
      />
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
        {eyebrow}
      </p>
      <h1 className="relative mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <div className="relative mt-3 max-w-2xl text-base leading-7 text-slate-600">{description}</div>
      ) : null}
      {children ? <div className="relative mt-5">{children}</div> : null}
    </header>
  );
}

/** Formun yanında duran kısa çalışma notu. Boş duvar bırakmaz. */
export function TipPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="h-fit rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/90 to-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">{title}</p>
      <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">{children}</div>
    </aside>
  );
}
