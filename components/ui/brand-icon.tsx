import { useId, type SVGProps } from "react";
import { cn } from "@/components/ui/cn";
import {
  BRAND_MARK_COLORS,
  BRAND_MARK_GRADIENT,
  BRAND_MARK_LETTER_PATH,
  BRAND_MARK_PLATE_RADIUS,
  BRAND_MARK_SHEEN,
  BRAND_MARK_VIEWBOX,
} from "@/lib/ui/brand-mark-geometry";

type BrandIconProps = SVGProps<SVGSVGElement> & { className?: string };

export function BrandIcon({ className, ...props }: BrandIconProps) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `yetkin-y-${uid}`;
  const sheenId = `yetkin-y-sheen-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${BRAND_MARK_VIEWBOX} ${BRAND_MARK_VIEWBOX}`}
      fill="none"
      aria-hidden
      className={cn("h-8 w-8", className)}
      {...props}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1={BRAND_MARK_GRADIENT.x1}
          y1={BRAND_MARK_GRADIENT.y1}
          x2={BRAND_MARK_GRADIENT.x2}
          y2={BRAND_MARK_GRADIENT.y2}
          gradientUnits="userSpaceOnUse"
        >
          {BRAND_MARK_GRADIENT.stops.map((stop) => (
            <stop key={stop.offset} offset={`${Math.round(stop.offset * 100)}%`} stopColor={stop.color} />
          ))}
        </linearGradient>
        <linearGradient
          id={sheenId}
          x1={BRAND_MARK_SHEEN.x1}
          y1={BRAND_MARK_SHEEN.y1}
          x2={BRAND_MARK_SHEEN.x2}
          y2={BRAND_MARK_SHEEN.y2}
          gradientUnits="userSpaceOnUse"
        >
          {BRAND_MARK_SHEEN.stops.map((stop) => (
            <stop
              key={stop.offset}
              offset={`${Math.round(stop.offset * 100)}%`}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </linearGradient>
      </defs>
      <rect
        width={BRAND_MARK_VIEWBOX}
        height={BRAND_MARK_VIEWBOX}
        rx={BRAND_MARK_PLATE_RADIUS}
        fill={`url(#${gradientId})`}
      />
      <rect
        width={BRAND_MARK_VIEWBOX}
        height={BRAND_MARK_VIEWBOX}
        rx={BRAND_MARK_PLATE_RADIUS}
        fill={`url(#${sheenId})`}
      />
      <path d={BRAND_MARK_LETTER_PATH} fill={BRAND_MARK_COLORS.letter} />
    </svg>
  );
}

/** Kabuk ve vitrin için aynı Y mührü. */
export const BrandLogo = BrandIcon;
