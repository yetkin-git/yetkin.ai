import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import {
  isBridgeEmitKaynak,
  selectBridgeTargets,
  type BridgeEmitKaynak,
  type BridgeKaynak,
} from "@/lib/kernel/contextual-bridge-params";

export type ContextualBridgeTarget = {
  /** Kısa modül adı — erişilebilir etiket. */
  label: string;
  /** Eyleme dönük CTA metni. */
  cta: string;
  href: string;
  /**
   * Hedefin **kimliği**. Döngü bastırma bu alan üzerinden yapılır: kullanıcı
   * `?kaynak=hibe` ile geldiyse Hibe'ye geri gönderen köprü basılmaz.
   * Verilmezse döngü koruması çalışmaz — preset'ler bu alanı doldurur.
   */
  id?: BridgeKaynak;
};

export type ContextualBridgeStripProps = {
  /** Modül kimliği — test kancası (`data-contextual-bridge`). */
  from: BridgeEmitKaynak;
  title: string;
  body: string;
  /** En fazla 2 hedef; fazlası sessizce kesilir. */
  targets: readonly ContextualBridgeTarget[];
  /**
   * Kullanıcının geldiği merkez (`?kaynak=`). Denetim (443363f4): bu değer
   * okunmadığı için YetkinHibe'ye `?kaynak=e-ticaret` ile gelen kullanıcıya
   * hemen "E-Ticaret'e dön" köprüsü basılıyordu. Artık kaynağa giden hedef
   * **düşürülür**; şerit boş kalırsa hiç basılmaz.
   */
  cameFrom?: BridgeKaynak | null;
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
  cameFrom = null,
  className = "",
}: ContextualBridgeStripProps) {
  // `tezgah` yayan taraf olamaz; tip düzeyinde kapalı ama çalışma zamanı da kapansın.
  if (!isBridgeEmitKaynak(from)) {
    return null;
  }
  const links = selectBridgeTargets({ from, cameFrom, targets });
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
