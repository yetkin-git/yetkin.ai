import type { Route } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { Card } from "@/components/ui/card";
import type { AcademyProgressGate } from "@/lib/academy/progress-gate";

/**
 * İlerleme Kapısı (Faz 3, Adım 2).
 *
 * Ücretsiz ders bittiğinde "Kilitli" duvarı basmak yerine **kazanılmış mesafeyi**
 * gösterir. Kanıt gerçek: tamamlanan ders sayısı sunucudan gelir, kalan ders
 * müfredat uzunluğundan çıkarılır. Uydurma ilerleme basılmaz.
 *
 * Erişilebilirlik: kapı `role="status"` taşır; ekran okuyucu ders bitince
 * "1 dersi tamamladın, 7 ders kaldı" cümlesini duyurur.
 */
export function AcademyProgressGateCard({
  gate,
  checkoutHref,
  previewHref = null,
  previewLabel = "Kalan dersleri incele",
}: {
  gate: AcademyProgressGate;
  checkoutHref: string;
  previewHref?: string | null;
  previewLabel?: string;
}) {
  if (!gate.visible) {
    return null;
  }
  return (
    <Card
      variant="featured"
      eyebrow={gate.copy.eyebrow}
      title={gate.copy.title}
      data-academy-progress-gate=""
      data-academy-progress-percent={String(gate.percent)}
    >
      <div role="status" aria-live="polite">
        <p className="text-sm leading-6 text-[var(--foreground)]" data-academy-progress-body="">
          {gate.copy.body}
        </p>
      </div>
      <div className="mt-3" data-academy-progress-meter="">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={gate.percent}
          aria-label={gate.copy.progressLabel}
        >
          <span
            className="block h-full rounded-full bg-[var(--safir)]"
            style={{ width: `${gate.percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs font-medium text-[var(--muted)]">
          {gate.copy.progressLabel} · {gate.copy.remainingLabel}
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <LinkButton
          href={checkoutHref as Route}
          size="lg"
          className="w-full sm:w-auto"
          data-academy-progress-gate-cta=""
        >
          {gate.copy.cta}
        </LinkButton>
        {previewHref ? (
          <LinkButton href={previewHref as Route} variant="outline" size="lg" className="w-full sm:w-auto">
            {previewLabel}
          </LinkButton>
        ) : null}
      </div>
    </Card>
  );
}
