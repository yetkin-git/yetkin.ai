import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export type ContextualBridgeTarget = {
  /** Kısa modül adı — erişilebilir etiket. */
  label: string;
  /** Eyleme dönük CTA metni. */
  cta: string;
  href: string;
};

export type ContextualBridgeStripProps = {
  /** Modül kimliği — test kancası (`data-contextual-bridge`). */
  from: "e-ticaret" | "hibe" | "kurumsal" | "kariyer";
  title: string;
  body: string;
  /** En fazla 2 hedef; fazlası sessizce kesilir. */
  targets: readonly ContextualBridgeTarget[];
  className?: string;
};

/**
 * Odalar arası bağlamsal geçiş şeridi.
 * Reklam banner'ı değildir: sakin, eyleme dönük, en fazla 2 köprü.
 */
export function ContextualBridgeStrip({
  from,
  title,
  body,
  targets,
  className = "",
}: ContextualBridgeStripProps) {
  const links = targets.slice(0, 2);
  if (links.length === 0) {
    return null;
  }
  const eyebrow = SEN_VOICE.bridges.eyebrow;

  return (
    <div className={className} data-contextual-bridge={from}>
      <Card variant="featured" snug eyebrow={eyebrow} title={title}>
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4"
          data-contextual-bridge-body=""
        >
          <p className="min-w-0 text-pretty text-sm leading-6 text-[var(--foreground)]">{body}</p>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            {links.map((target, index) => (
              <LinkButton
                key={target.href}
                href={target.href as Route}
                variant={index === 0 ? "primary" : "outline"}
                size="sm"
                className="self-start sm:self-end"
                data-contextual-bridge-target={target.label}
              >
                {target.cta}
              </LinkButton>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
