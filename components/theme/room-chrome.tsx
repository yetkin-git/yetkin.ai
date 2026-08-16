import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconLock, IconShield, IconTrophy } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

export function TerminalRibbon({
  path = "Yazılım tezgâhı",
  leds,
}: {
  path?: string;
  leds?: Array<{ label: string; tone: "green" | "blue" | "amber" }>;
}) {
  const items = leds ?? [
    { label: "güvenli deneme", tone: "green" as const },
    { label: "kasa hazır", tone: "blue" as const },
    { label: "anahtar koruması", tone: "amber" as const },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-ink)] px-4 py-2.5 font-mono text-[11px] text-[var(--muted)]">
      <span className="flex items-center gap-1.5" aria-hidden>
        <span className="room-led h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="room-led h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" style={{ animationDelay: "0.35s" }} />
        <span className="room-led h-2.5 w-2.5 rounded-full bg-[#27c93f]" style={{ animationDelay: "0.7s" }} />
      </span>
      <span className="text-emerald-300">tezgâh</span>
      <span className="text-[var(--foreground)]">{path}</span>
      <span className="ml-auto flex flex-wrap items-center gap-3">
        {items.map((item) => (
          <span
            key={item.label}
            className={cn(
              "inline-flex items-center gap-1.5",
              item.tone === "green" && "text-emerald-300",
              item.tone === "blue" && "text-sky-300",
              item.tone === "amber" && "text-amber-300",
            )}
          >
            <span className="room-led inline-block h-1.5 w-1.5 rounded-full bg-current" />
            {item.label}
          </span>
        ))}
      </span>
    </div>
  );
}

export function ConsoleBlock({ children, title = "console" }: { children: ReactNode; title?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-ink)] font-mono shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/45">
        <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
        {title}
      </div>
      <pre className="overflow-x-auto px-3 py-3 text-[11px] leading-5 text-emerald-300">{children}</pre>
    </div>
  );
}

export function GuardianShieldBanner({
  title = "Ebeveyn kalkanı",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <Card
      variant="featured"
      className="junior-shield-card"
      title={
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--safir-soft)] text-[var(--safir-deep)]">
            <IconShield className="h-5 w-5" />
          </span>
          {title}
        </span>
      }
      bodyClassName="text-[var(--foreground)]"
    >
      {children}
    </Card>
  );
}

export function YouthQuestRow() {
  const quests = [
    { label: "Yaş kapısı", tone: "emerald" as const, hint: "TR 18" },
    { label: "Ebeveyn kalkanı", tone: "safir" as const, hint: "KVKK vekâlet" },
    { label: "MEB izi", tone: "violet" as const, hint: "Beceri bandı" },
    { label: "Harçlık", tone: "gold" as const, hint: "Yetişkin cüzdanı değil" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {quests.map((quest) => (
        <li
          key={quest.label}
          className="junior-quest rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]"
        >
          <Badge tone={quest.tone}>{quest.label}</Badge>
          <p className="mt-2 text-xs text-[var(--muted)]">{quest.hint}</p>
        </li>
      ))}
    </ul>
  );
}

export function PrizePoolHero({
  amount,
  hint,
  live,
}: {
  amount: string;
  hint: string;
  live: boolean;
}) {
  return (
    <div className="arena-prize overflow-hidden rounded-[var(--radius-card)] border border-[var(--gold)]/40 bg-gradient-to-br from-[#2a1a08] via-[#1a1208] to-[#3a2208] p-6 text-[#fff7e6] shadow-[0_12px_40px_rgba(245,185,66,0.22)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f5b942]">Ödül havuzu</p>
          <p className="mt-2 font-semibold tabular-nums tracking-tight text-4xl text-[#ffd60a] sm:text-5xl">{amount}</p>
          <p className="mt-2 text-sm text-[#ffe7b3]/70">{hint}</p>
        </div>
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5b942] text-[#140e08] shadow-[0_0_24px_rgba(245,185,66,0.55)]">
          <IconTrophy className="h-7 w-7" />
        </span>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/30">
        <div className={cn("arena-prize-bar h-full rounded-full bg-gradient-to-r from-[#ff8a00] via-[#ffd60a] to-[#f5b942]", live ? "w-4/5" : "w-1/5")} />
      </div>
    </div>
  );
}

export function StallTrustRow() {
  const items = [
    { label: "Emanet kilit", hint: "Ödeme güvencede", icon: <IconLock /> },
    { label: "Fiyat kartı", hint: "Türk Lirası (₺)" },
    { label: "Hızlı teklif", hint: "İlan → kabul" },
    { label: "Vitrin", hint: "Dürüst stok" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <li
          key={item.label}
          className="stall-chip flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 shadow-[var(--shadow-card)]"
        >
          {item.icon ? (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--safir-soft)] text-[var(--safir-deep)]">
              {item.icon}
            </span>
          ) : (
            <span className="h-9 w-1 rounded-full bg-[var(--safir)]" />
          )}
          <span>
            <span className="block text-sm font-semibold text-[var(--foreground)]">{item.label}</span>
            <span className="block text-[11px] text-[var(--muted)]">{item.hint}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
