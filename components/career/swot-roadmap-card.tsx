import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { IconCheck, IconSpark } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import type { RoadmapWindow } from "@/lib/career/roadmap";
import type { SwotItem, SwotQuadrant } from "@/lib/career/swot";
import { tezgahToolById } from "@/lib/tezgah/catalog";

const STRENGTH_EMPTY =
  "Henüz mühürlü rozet eklenmedi — ilk rozetini aldığında burada parlayacak";

const QUADRANTS = [
  {
    key: "strengths",
    title: "Güçlü",
    shell:
      "rounded-2xl border border-emerald-200/80 !border-t-4 !border-t-emerald-500 bg-emerald-50/30 p-4",
    iconWrap: "bg-emerald-500/15 text-emerald-700",
    bullet: "bg-emerald-500",
    Icon: IconShieldMark,
  },
  {
    key: "weaknesses",
    title: "Gelişime açık",
    shell:
      "rounded-2xl border border-amber-200/80 !border-t-4 !border-t-amber-500 bg-amber-50/30 p-4",
    iconWrap: "bg-amber-500/15 text-amber-700",
    bullet: "bg-amber-500",
    Icon: IconTarget,
  },
  {
    key: "opportunities",
    title: "Fırsat",
    shell: "rounded-2xl border border-blue-200/80 !border-t-4 !border-t-blue-600 bg-blue-50/30 p-4",
    iconWrap: "bg-blue-600/10 text-blue-700",
    bullet: "bg-blue-600",
    Icon: IconRocket,
  },
  {
    key: "threats",
    title: "Dikkat",
    shell: "rounded-2xl border border-rose-200/80 !border-t-4 !border-t-rose-500 bg-rose-50/30 p-4",
    iconWrap: "bg-rose-500/15 text-rose-700",
    bullet: "bg-rose-500",
    Icon: IconAlert,
  },
] as const;

const WINDOW_FACE: Record<
  RoadmapWindow["id"],
  { step: string; title: string; theme: string; badge: string; card: string }
> = {
  d30: {
    step: "30",
    title: "İlk 30 Gün",
    theme: "Temel & İlk Mühür",
    badge: "bg-blue-600 text-white",
    card: "border-blue-200 bg-gradient-to-b from-blue-50/90 to-white",
  },
  d60: {
    step: "60",
    title: "60. Gün",
    theme: "Portföy & Görünürlük",
    badge: "bg-indigo-600 text-white",
    card: "border-indigo-200 bg-gradient-to-b from-indigo-50/90 to-white",
  },
  d90: {
    step: "90",
    title: "90. Gün",
    theme: "Uzmanlık & Ölçek",
    badge: "bg-emerald-600 text-white",
    card: "border-emerald-200 bg-gradient-to-b from-emerald-50/90 to-white",
  },
};

const INTERNAL_HREF =
  /(?:^|[\s—–-])(\/(?:tezgah|panel\/e-ticaret|e-ticaret|hibe|career|uzmanlar|vize)(?:\/[A-Za-z0-9._~-]*)?(?:\?[A-Za-z0-9._~%=&-]*)?(?:#[A-Za-z0-9_-]*)?)/;

export function SwotRoadmapCard({
  swot,
  roadmap,
  planNote = null,
}: {
  swot: SwotQuadrant | null;
  roadmap: readonly RoadmapWindow[];
  planNote?: string | null;
}) {
  return (
    <section className="grid gap-4" data-career-swot="" data-career-plan={planNote ? "job" : "evidence"}>
      {swot ? (
      <Card variant="featured" title="SWOT kadranı" eyebrow="Kanıt">
        <p className="text-sm leading-6 text-[var(--muted)]">
          YetkinCV sonucu, CV sinyali, rozet ve tezgâh arşivinden yazılır. Ayrı para birimi yoktur.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {QUADRANTS.map((quadrant) => {
            const rows = swot[quadrant.key];
            const Icon = quadrant.Icon;
            return (
              <article key={quadrant.key} className={quadrant.shell} data-swot={quadrant.key}>
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl",
                      quadrant.iconWrap,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">{quadrant.title}</h3>
                </div>
                {rows.length === 0 ? (
                  quadrant.key === "strengths" ? (
                    <p className="mt-3 inline-flex items-start gap-2 rounded-2xl border border-dashed border-emerald-300 bg-white/80 px-3 py-2 text-sm leading-5 text-emerald-900">
                      <IconSpark className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{STRENGTH_EMPTY}</span>
                    </p>
                  ) : null
                ) : (
                  <ul className="mt-3 grid list-none gap-2 p-0">
                    {rows.map((row) => (
                      <SwotRow
                        key={row.id}
                        row={row}
                        bullet={quadrant.bullet}
                        linked={quadrant.key === "opportunities"}
                        marked={quadrant.key === "strengths"}
                      />
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </Card>
      ) : null}
      <div id="career-roadmap" className="scroll-mt-24">
      <Card title="30/60/90 gün" eyebrow="Eylem">
        {planNote ? <p className="mb-3 text-sm font-medium text-blue-900">{planNote}</p> : null}
        <div className="mb-4 hidden items-center gap-2 md:flex" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          <span className="h-px flex-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
        </div>
        <ol className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
          {roadmap.map((window) => {
            const face = WINDOW_FACE[window.id];
            return (
              <li
                key={window.id}
                data-roadmap-step={window.id}
                className={cn("flex h-full flex-col rounded-2xl border p-4 shadow-sm", face.card)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-sm",
                      face.badge,
                    )}
                  >
                    {face.step}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{face.title}</p>
                    <p className="text-xs font-medium text-[var(--muted)]">{face.theme}</p>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-[var(--foreground)]">{window.body}</p>
                <div className="mt-4">
                  <LinkButton href={window.href as Route} size="sm" variant="outline">
                    {window.cta}
                  </LinkButton>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>
      </div>
    </section>
  );
}

function SwotRow({
  row,
  bullet,
  linked,
  marked,
}: {
  row: SwotItem;
  bullet: string;
  linked: boolean;
  marked: boolean;
}) {
  const presented = linked ? presentOpportunity(row.label) : { prose: row.label, href: null, action: null };
  return (
    <li className="flex gap-2 text-sm leading-6 text-[var(--foreground)]">
      {marked ? (
        <IconCheck className="mt-1 shrink-0 text-emerald-600" />
      ) : (
        <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", bullet)} aria-hidden />
      )}
      <div className="min-w-0">
        {presented.prose ? <p>{presented.prose}</p> : null}
        {presented.href && presented.action ? (
          <div className="mt-2">
            <LinkButton href={presented.href} size="sm" variant="outline">
              {presented.action}
            </LinkButton>
          </div>
        ) : null}
      </div>
    </li>
  );
}

function presentOpportunity(label: string): { prose: string; href: Route | null; action: string | null } {
  const match = INTERNAL_HREF.exec(label);
  if (!match?.[1]) {
    return { prose: label, href: null, action: null };
  }
  const href = careerRoute(match[1]);
  if (!href) {
    return { prose: label, href: null, action: null };
  }
  const prose = label.slice(0, match.index).replace(/[\s—–-]+$/u, "").trim();
  return { prose, href, action: actionLabel(href) };
}

function careerRoute(href: string): Route | null {
  if (
    href === "/tezgah" ||
    href.startsWith("/tezgah?") ||
    href.startsWith("/tezgah#") ||
    href === "/panel/e-ticaret" ||
    href.startsWith("/panel/e-ticaret?") ||
    href === "/e-ticaret" ||
    href.startsWith("/e-ticaret?") ||
    href === "/hibe" ||
    href.startsWith("/hibe?") ||
    href === "/panel/hibe" ||
    href.startsWith("/panel/hibe?") ||
    href === "/career" ||
    href.startsWith("/career#") ||
    href === "/uzmanlar" ||
    href.startsWith("/uzmanlar?") ||
    href.startsWith("/vize/")
  ) {
    return href as Route;
  }
  return null;
}

function actionLabel(href: Route): string {
  const toolId = new URL(href, "https://yetkin.local").searchParams.get("tool");
  const tool = toolId ? tezgahToolById(toolId) : null;
  if (!tool) {
    return "Adımı aç →";
  }
  if (tool.label === "Müşteri Teklif Yazıcı") {
    return "Müşteri Teklif Yazıcıyı Aç →";
  }
  return `${tool.label} aracını aç →`;
}

function IconShieldMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-4 w-4", className)}>
      <path d="M12 3 6 5.5v6.2c0 3.8 2.6 6.8 6 7.8 3.4-1 6-4 6-7.8V5.5z" />
      <path d="M9 12.2 11 14.2 15.2 10" />
    </svg>
  );
}

function IconTarget({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className={cn("h-4 w-4", className)}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconRocket({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-4 w-4", className)}>
      <path d="M14 4c-3.2 1.2-6 5.2-7 9l4 4c3.8-1 7.8-3.8 9-7-2.2-.2-4.2-2.2-6-6z" />
      <path d="M9.5 14.5 6 18" />
      <path d="M5 16.5c.2 1.8 1.4 2.8 3 3" />
      <circle cx="13.2" cy="8.2" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-4 w-4", className)}>
      <path d="M12 4 3.5 19h17z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
