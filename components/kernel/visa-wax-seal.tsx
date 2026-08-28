import type { PassportStampSourceKind } from "@/lib/kernel/passport/types";

const SEAL: Record<
  PassportStampSourceKind,
  { ring: string; fill: string; label: string; metal: string }
> = {
  ACADEMY_CERTIFICATE: {
    ring: "border-[color-mix(in_srgb,var(--gold)_70%,var(--safir))]",
    fill: "bg-[radial-gradient(circle_at_35%_30%,color-mix(in_srgb,var(--gold)_55%,white),color-mix(in_srgb,var(--safir)_75%,var(--safir-deep)))]",
    label: "Safir · Altın",
    metal: "text-[color-mix(in_srgb,var(--gold)_40%,white)]",
  },
  FREELANCER_RELEASE: {
    ring: "border-[color-mix(in_srgb,var(--emerald)_65%,#0a4)]",
    fill: "bg-[radial-gradient(circle_at_35%_30%,color-mix(in_srgb,var(--emerald)_45%,white),color-mix(in_srgb,var(--emerald)_90%,#064e3b))]",
    label: "Zümrüt",
    metal: "text-[color-mix(in_srgb,var(--emerald)_25%,white)]",
  },
};

/** Wax / metal mühür damgası — Akademi safir-altın, Freelancer zümrüt. */
export function VisaWaxSeal({
  sourceKind,
  size = "md",
}: {
  sourceKind: PassportStampSourceKind;
  size?: "sm" | "md";
}) {
  const tone = SEAL[sourceKind];
  const dim = size === "sm" ? "h-16 w-16" : "h-24 w-24";
  const text = size === "sm" ? "text-[8px]" : "text-[10px]";

  return (
    <div
      className={`relative shrink-0 ${dim}`}
      role="img"
      aria-label={`Vize mührü — ${tone.label}`}
    >
      <div
        aria-hidden
        className={`absolute inset-0 rounded-full border-[3px] ${tone.ring} shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_18px_rgba(0,0,0,0.18)] ${tone.fill}`}
      />
      <div
        aria-hidden
        className="absolute inset-[18%] rounded-full border border-white/35 bg-black/10"
      />
      <div
        aria-hidden
        className={`absolute inset-0 flex items-center justify-center ${text} font-semibold uppercase tracking-[0.18em] ${tone.metal}`}
      >
        {sourceKind === "ACADEMY_CERTIFICATE" ? "AKA" : "FLN"}
      </div>
    </div>
  );
}
