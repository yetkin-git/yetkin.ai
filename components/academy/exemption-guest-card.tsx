import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

/** Oturumsuz ziyaretçi — puan ve rozet adaylığı oturuma yazılır. */
export function ExemptionGuestCard({
  registerHref,
  loginHref,
}: {
  registerHref: string;
  loginHref: string;
}) {
  const copy = ACADEMY_SEN.exemption;
  return (
    <div
      className="academy-exam-chamber space-y-4 rounded-[var(--radius-card)] border p-6"
      data-academy-exemption-guest=""
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
        {copy.eyebrow}
      </p>
      <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{copy.guestTitle}</h2>
      <p className="text-sm leading-6 text-[var(--muted)]">{copy.guestLead}</p>
      <p className="text-sm leading-6 text-[var(--foreground)]">{copy.guestNote}</p>
      <div className="flex flex-wrap gap-3">
        <LinkButton href={registerHref} size="lg" variant="success">
          {copy.registerCta}
        </LinkButton>
        <LinkButton href={loginHref} size="lg" variant="outline">
          {copy.loginCta}
        </LinkButton>
      </div>
    </div>
  );
}
