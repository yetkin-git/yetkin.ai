import Link from "next/link";
import { VERTICAL_ROOMS } from "@/lib/kernel/modules";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { ROOM_ICONS } from "@/components/ui/icons";
import { RailMark } from "@/components/ui/rail-mark";

export default function PublicHomePage() {
  const copy = SEN_VOICE.public.home;
  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-16">
      <div className="pointer-events-none absolute inset-0 rail-grid-fade" />
      <div className="relative grid items-center gap-10 lg:grid-cols-2">
        <div>
          <RailMark tone="onLight" withSleepers className="h-12 w-12" />
          <Badge tone="safir" className="mt-4">
            {copy.badge}
          </Badge>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">{copy.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/dashboard" size="lg">
              {copy.enterCta}
            </LinkButton>
            <LinkButton href="/login" variant="outline" size="lg">
              {copy.loginCta}
            </LinkButton>
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
      <section className="relative">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {copy.roomsKicker}
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICAL_ROOMS.map((room) => {
            const Icon = ROOM_ICONS[room.id];
            return (
              <li key={room.id}>
                <Link href={room.path} className="block h-full">
                  <Card variant="glass" className="h-full p-5 hover:-translate-y-0.5">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--safir-soft)] text-[var(--safir-deep)]">
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
      <p className="relative text-sm text-[var(--muted)]">
        <Link href="/legal" className="font-semibold text-[var(--safir-deep)] hover:underline">
          {copy.legalCta}
        </Link>
        {" · "}
        <Link href="/register" className="font-semibold text-[var(--safir-deep)] hover:underline">
          {copy.registerCta}
        </Link>
      </p>
    </main>
  );
}
