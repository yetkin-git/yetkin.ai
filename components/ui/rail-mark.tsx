import type { SVGProps } from "react";
import { cn } from "@/components/ui/cn";
import {
  BRAND_MARK_COLORS,
  BRAND_MARK_PATHS,
  BRAND_MARK_PLATE_RADIUS,
  BRAND_MARK_RAIL_STROKE,
  BRAND_MARK_SIGNAL,
  BRAND_MARK_SLEEPER_STROKE,
  BRAND_MARK_VIEWBOX,
} from "@/lib/ui/brand-mark-geometry";

export type RailMarkTone = "onLight" | "onInk";

type RailMarkProps = SVGProps<SVGSVGElement> & {
  tone?: RailMarkTone;
  withSleepers?: boolean;
};

export function RailMark({
  tone = "onLight",
  withSleepers = false,
  className,
  ...props
}: RailMarkProps) {
  const onInk = tone === "onInk";
  const plate = onInk ? BRAND_MARK_COLORS.ivory : BRAND_MARK_COLORS.ink;
  const rail = onInk ? BRAND_MARK_COLORS.ink : BRAND_MARK_COLORS.ivory;
  const signal = onInk ? BRAND_MARK_COLORS.goldOnIvory : BRAND_MARK_COLORS.goldOnInk;

  return (
    <svg
      viewBox={`0 0 ${BRAND_MARK_VIEWBOX} ${BRAND_MARK_VIEWBOX}`}
      fill="none"
      aria-hidden
      className={cn("h-8 w-8", className)}
      {...props}
    >
      <rect
        width={BRAND_MARK_VIEWBOX}
        height={BRAND_MARK_VIEWBOX}
        rx={BRAND_MARK_PLATE_RADIUS}
        fill={plate}
      />
      <path
        d={BRAND_MARK_PATHS.leftRail}
        stroke={rail}
        strokeWidth={BRAND_MARK_RAIL_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={BRAND_MARK_PATHS.rightRail}
        stroke={rail}
        strokeWidth={BRAND_MARK_RAIL_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {withSleepers ? (
        <>
          <path
            d={BRAND_MARK_PATHS.sleeperLow}
            stroke={rail}
            strokeWidth={BRAND_MARK_SLEEPER_STROKE}
            strokeLinecap="round"
          />
          <path
            d={BRAND_MARK_PATHS.sleeperMid}
            stroke={rail}
            strokeWidth={BRAND_MARK_SLEEPER_STROKE}
            strokeLinecap="round"
          />
        </>
      ) : null}
      <circle cx={BRAND_MARK_SIGNAL.cx} cy={BRAND_MARK_SIGNAL.cy} r={BRAND_MARK_SIGNAL.r} fill={signal} />
    </svg>
  );
}
