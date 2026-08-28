import Link from "next/link";
import { VERTICAL_ROOMS } from "@/lib/kernel/modules";
import { isPhase1PublicNavRoom } from "@/lib/kernel/compliance/circuit-breakers";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ROOM_ICONS } from "@/components/ui/icons";
import { BrandIcon } from "@/components/ui/brand-icon";
import { getSession } from "@/lib/kernel/auth/session";

export default async function PublicHomePage() {
  const copy = SEN_VOICE.public.home;
  const session = await getSession();
  const rooms = VERTICAL_ROOMS.filter((room) => isPhase1PublicNavRoom(room.id));
  return (
    <main className="home-viewport-lock relative flex min-h-dvh flex-col overflow-x-hidden lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
      <header className="relative flex shrink-0 items-center gap-2.5 px-6 pt-4">
        <BrandIcon className="h-8 w-8" />
        <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">{YETKIN_BRAND}</p>
        <span className="inline-flex items-center rounded-full bg-[var(--safir-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-[var(--safir-deep)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--safir)_22%,transparent)]">
          {copy.versionBadge}
        </span>
      </header>
      <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-6 pb-12 pt-4">
        <div className="grid shrink-0 items-start gap-6 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">{copy.title}</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[var(--muted)]">{copy.description}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {session ? (
                <LinkButton href="/dashboard" size="lg">
                  {copy.cockpitCta}
                </LinkButton>
              ) : (
                <>
                  <LinkButton href="/login" size="lg">
                    {copy.loginCta}
                  </LinkButton>
                  <LinkButton href="/register" variant="outline" size="lg">
                    {copy.registerCta}
                  </LinkButton>
                </>
              )}
            </div>
          </div>
          <Card variant="ink" title={copy.trustTitle} eyebrow={copy.trustEyebrow} bodyClassName="text-white/70">
            <ul className="space-y-2 text-sm">
              {copy.trust.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Card>
        </div>
        <section className="relative mt-4 min-h-0">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {copy.roomsKicker}
          </p>
          <ol className="mb-3 grid gap-3 sm:grid-cols-3">
            {copy.journey.map((step, index) => (
              <li key={step.href}>
                <Link href={step.href} className="block h-full">
                  <Card variant="glass" className="h-full p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {index + 1}. {step.kicker}
                    </p>
                    <p className="mt-1.5 font-semibold text-[var(--foreground)]">{step.title}</p>
                    <p className="mt-1 text-xs leading-5">{step.body}</p>
                  </Card>
                </Link>
              </li>
            ))}
          </ol>
          <ul className="grid gap-3 sm:grid-cols-3">
            {rooms.map((room) => {
              const Icon = ROOM_ICONS[room.id];
              return (
                <li key={room.id}>
                  <Link href={room.path} className="block h-full">
                    <Card variant="glass" className="h-full p-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--safir-soft)] text-[var(--safir-deep)]">
                          <Icon />
                        </span>
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">{room.label}</p>
                          <p className="mt-1 text-xs leading-5">{room.blurb}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
