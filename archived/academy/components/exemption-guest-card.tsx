import { GoogleContinueButton } from "@/components/auth/google-continue-button";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

/** Anonim sonuç. Mühür yazılmaz; kayıt kancası puanın altındadır. */
export function ExemptionGuestCard({
  registerHref,
  loginHref,
  score,
  gaps = [],
}: {
  registerHref: string;
  loginHref: string;
  score: number;
  gaps?: readonly string[];
}) {
  const copy = ACADEMY_SEN.exemption;
  return (
    <div
      className="academy-exam-chamber space-y-4 rounded-[var(--radius-card)] border p-6"
      data-academy-exemption-guest=""
      data-academy-exemption-preview=""
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
        {copy.eyebrow}
      </p>
      <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{copy.guestTitle}</h2>
      <p className="text-lg font-semibold text-[var(--foreground)]">{copy.guestResult(score)}</p>
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)]">{copy.gapsHeading}</p>
        {gaps.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted)]">
            {gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.gapsEmpty}</p>
        )}
      </div>
      <p className="text-sm leading-6 text-[var(--foreground)]">{copy.guestNote}</p>
      <div className="space-y-4">
        <GoogleContinueButton nextPath="/academy/01_office_ai/seviye" />
        <div className="flex flex-wrap gap-3">
          <LinkButton href={registerHref} size="lg" variant="success">
            {copy.registerCta}
          </LinkButton>
          <LinkButton href={loginHref} size="lg" variant="outline">
            {copy.loginCta}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
