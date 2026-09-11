import { useId, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import type { PassportStampSourceKind } from "@/lib/kernel/passport/types";

const SEAL: Record<
  PassportStampSourceKind,
  { label: string; metal: string; fillFrom: string; fillTo: string; ring: string }
> = {
  ACADEMY_CERTIFICATE: {
    label: "Safir · Altın",
    metal: "#f8e7b0",
    fillFrom: "#e8c56a",
    fillTo: "#1a4a8c",
    ring: "#d4af37",
  },
  FREELANCER_RELEASE: {
    label: "Zümrüt",
    metal: "#e8fff4",
    fillFrom: "#6ee7b7",
    fillTo: "#065f46",
    ring: "#34d399",
  },
};

const SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-[6.75rem] w-[6.75rem]",
};

const TYPE: Record<"sm" | "md" | "lg", string> = {
  sm: "text-[8px] tracking-[0.16em]",
  md: "text-[10px] tracking-[0.2em]",
  lg: "text-[11px] tracking-[0.22em]",
};

/** 28 dilimli klasik mum mühür kenarı. */
function scallopedSealPath(cx: number, cy: number, lobes: number, outer: number, inner: number): string {
  const parts: string[] = [];
  const count = lobes * 2;
  for (let i = 0; i < count; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI * i) / lobes - Math.PI / 2;
    const x = (cx + radius * Math.cos(angle)).toFixed(3);
    const y = (cy + radius * Math.sin(angle)).toFixed(3);
    parts.push(`${i === 0 ? "M" : "L"}${x} ${y}`);
  }
  return `${parts.join(" ")} Z`;
}

const WAX_PATH = scallopedSealPath(48, 48, 28, 46.5, 40.2);

/** Wax / metal mühür damgası — Akademi safir-altın, Freelancer zümrüt. */
export function VisaWaxSeal({
  sourceKind,
  size = "md",
}: {
  sourceKind: PassportStampSourceKind;
  size?: "sm" | "md" | "lg";
}) {
  const tone = SEAL[sourceKind];
  const uid = useId().replace(/:/gu, "");
  const fillId = `wax-fill-${uid}`;
  const sheenId = `wax-sheen-${uid}`;
  const mark = sourceKind === "ACADEMY_CERTIFICATE" ? "AKA" : "FLN";

  return (
    <div
      className={cn("relative shrink-0", SIZE[size])}
      role="img"
      aria-label={`Vize mührü — ${tone.label}`}
    >
      <svg viewBox="0 0 96 96" className="h-full w-full drop-shadow-[0_10px_18px_rgba(15,23,42,0.28)]" aria-hidden>
        <defs>
          <radialGradient id={fillId} cx="35%" cy="28%" r="78%">
            <stop offset="0%" stopColor={tone.fillFrom} />
            <stop offset="62%" stopColor={tone.fillTo} />
            <stop offset="100%" stopColor={tone.fillTo} />
          </radialGradient>
          <radialGradient id={sheenId} cx="32%" cy="24%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={WAX_PATH} fill={`url(#${fillId})`} stroke={tone.ring} strokeWidth="1.4" />
        <path d={WAX_PATH} fill={`url(#${sheenId})`} />
        <circle cx="48" cy="48" r="27.5" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1.2" />
        <circle cx="48" cy="48" r="22" fill="rgba(8,15,28,0.18)" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
        <text
          x="48"
          y="53"
          textAnchor="middle"
          fill={tone.metal}
          fontSize={size === "sm" ? 11 : 13}
          fontWeight="700"
          letterSpacing="2.2"
          style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
        >
          {mark}
        </text>
      </svg>
      <span className={cn("sr-only", TYPE[size])}>{mark}</span>
    </div>
  );
}

const CORNER =
  "pointer-events-none absolute h-3 w-3 rounded-full border-2 border-[color-mix(in_srgb,var(--gold)_55%,transparent)]";

/** Pasaport vize sayfası / diploma çerçevesi — krem parşömen, altın-safir çift hat. */
export function VisaPageFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border-2 border-[color-mix(in_srgb,var(--gold)_48%,var(--safir))] bg-[color-mix(in_srgb,#fbf6eb_92%,white)] p-5 shadow-[var(--shadow-lift)] sm:p-6",
        className,
      )}
    >
      <span aria-hidden className={cn(CORNER, "left-3 top-3")} />
      <span aria-hidden className={cn(CORNER, "right-3 top-3")} />
      <span aria-hidden className={cn(CORNER, "bottom-3 left-3")} />
      <span aria-hidden className={cn(CORNER, "bottom-3 right-3")} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 rounded-[1.15rem] border border-[color-mix(in_srgb,var(--gold)_22%,transparent)]"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
