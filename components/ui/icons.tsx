import type { ReactNode, SVGProps } from "react";
import { cn } from "@/components/ui/cn";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function Svg({ className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("h-4 w-4", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </Svg>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v4M12 17v4M4.9 6.5l2.8 2.8M16.3 14.7l2.8 2.8M3 12h4M17 12h4M4.9 17.5l2.8-2.8M16.3 9.3l2.8-2.8" />
      <circle cx="12" cy="12" r="2.4" />
    </Svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5z" />
      <path d="M5 5.5v16" />
    </Svg>
  );
}

export function IconBadge(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 8 5.2v5.3c0 3.2 2.2 5.8 4 6.5 1.8-.7 4-3.3 4-6.5V5.2z" />
      <path d="M9.2 12.2 11 14l3.8-4" />
    </Svg>
  );
}

export function IconBriefcase(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M8 8V6.5A1.5 1.5 0 0 1 9.5 5h5A1.5 1.5 0 0 1 16 6.5V8" />
      <path d="M3 13h18" />
    </Svg>
  );
}

export function IconCode(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m13 6-2 12" />
    </Svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" />
      <path d="M14 10h5a1 1 0 0 1 1 1v10" />
      <path d="M8 8h2M8 12h2M8 16h2M17 14h1M17 17h1" />
      <path d="M3 21h18" />
    </Svg>
  );
}

export function IconCar(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 16 7 9h10l2 7" />
      <path d="M3 16h18v3H3z" />
      <circle cx="7.5" cy="19.5" r="1.5" />
      <circle cx="16.5" cy="19.5" r="1.5" />
    </Svg>
  );
}

export function IconLeaf(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 19c8-1 13-7 14-14-7 1-13 6-14 14z" />
      <path d="M8 16c2-2 5-4 9-5" />
    </Svg>
  );
}

export function IconTrophy(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 8 9.8" />
      <path d="M16 6h2.5A2.5 2.5 0 0 1 16 9.8" />
      <path d="M12 13v3" />
      <path d="M9 20h6" />
      <path d="M10 17h4v3h-4z" />
    </Svg>
  );
}

export function IconStore(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10 6 5h12l2 5" />
      <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
      <path d="M4 10h16" />
      <path d="M9 21v-6h6v6" />
    </Svg>
  );
}

export function IconChild(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20v-1.5A5.5 5.5 0 0 1 11.5 13h1A5.5 5.5 0 0 1 18 18.5V20" />
    </Svg>
  );
}

export function IconMegaphone(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 11v2a2 2 0 0 0 2 2h1l2 4h2l-1.2-4H14l6-5-6-5H4a2 2 0 0 0-2 2v2z" />
    </Svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.2c.8-3.2 3.4-5.2 7-5.2s6.2 2 7 5.2" />
    </Svg>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1" />
      <path d="M15 12H3M6 9l-3 3 3 3" />
    </Svg>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconPassport(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <circle cx="12" cy="10" r="2.4" />
      <path d="M9 16h6" />
    </Svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 6 5.5v6.2c0 3.8 2.6 6.8 6 7.8 3.4-1 6-4 6-7.8V5.5z" />
    </Svg>
  );
}

export function IconKey(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="12" r="3.2" />
      <path d="M11 12h10v3" />
      <path d="M17 12v2" />
    </Svg>
  );
}

export function IconBolt(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 3 5 14h7l-1 7 8-11h-7z" />
    </Svg>
  );
}

export function IconImage(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.4" />
      <path d="m20 15-4.5-4.5L8 18" />
    </Svg>
  );
}

export function IconFilm(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" />
    </Svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 3 21 21" />
      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
      <path d="M9.4 5.1A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2" />
      <path d="M6.6 6.6C4.1 8.5 2 12 2 12s3.5 7 10 7a11 11 0 0 0 3.9-.7" />
    </Svg>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="9" y="9" width="11" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6 18 18M18 6 6 18" />
    </Svg>
  );
}

export function IconMessage(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H12l-4 3.2V16H7.5A2.5 2.5 0 0 1 5 13.5z" />
    </Svg>
  );
}

export function IconSend(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12 20 5l-6 15-2.2-6.3z" />
      <path d="M11.8 13.7 20 5" />
    </Svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 9 12 15 18 9" />
    </Svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 6 9 12l6 6" />
    </Svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

export function IconArrow(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12.5 9.5 17 19 7" />
    </Svg>
  );
}

export function IconHash(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 4  -2 16M17 4l-2 16M4 9h16M3 15h16" />
    </Svg>
  );
}

export function IconPulse(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </Svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 6.2v11.6L18.4 12z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconPause(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 6h2.6v12H8zM13.4 6H16v12h-2.6z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconVolume(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 10.2v3.6h2.7L12 17.4V6.6L7.7 10.2z" />
      <path d="M15.2 9.2a3.2 3.2 0 0 1 0 5.6" />
      <path d="M17.4 7.2a6 6 0 0 1 0 9.6" />
    </Svg>
  );
}

export function IconVolumeOff(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 10.2v3.6h2.7L12 17.4V6.6L7.7 10.2z" />
      <path d="m16 9 5 6M21 9l-5 6" />
    </Svg>
  );
}

export function IconMaximize(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 4H4v4" />
      <path d="M16 4h4v4" />
      <path d="M8 20H4v-4" />
      <path d="M16 20h4v-4" />
    </Svg>
  );
}

export function IconCaptions(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M7 13h3M14 13h3" />
    </Svg>
  );
}

export function IconPlug(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 7v5a4 4 0 0 0 8 0V7" />
      <path d="M10 3v4M14 3v4M12 16v5" />
    </Svg>
  );
}

export function IconCoin(props: IconProps) {
  return (
    <Svg {...props}>
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7" />
    </Svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.2 16.2 3.3 3.3" />
    </Svg>
  );
}

export function IconFolder(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H9l1.5 2H18.5A1.5 1.5 0 0 1 20 10.5v6A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5v-8Z" />
    </Svg>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
    </Svg>
  );
}

export function IconList(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconHeart(props: IconProps & { filled?: boolean }) {
  const { filled = false, ...rest } = props;
  return (
    <Svg {...rest}>
      <path
        d="M12 20.4 4.7 13.5a4.6 4.6 0 0 1 6.5-6.5L12 8l.8-1a4.6 4.6 0 0 1 6.5 6.5z"
        fill={filled ? "currentColor" : "none"}
      />
    </Svg>
  );
}

export const ROOM_ICONS = {
  dashboard: IconHome,
  studio: IconSpark,
  academy: IconBook,
  career: IconBadge,
  freelancer: IconBriefcase,
  devlabs: IconCode,
  kurumsal: IconBuilding,
  hibe: IconLeaf,
  arena: IconTrophy,
  pazaryeri: IconStore,
  junior: IconChild,
  social: IconMegaphone,
  profil: IconUser,
  cuzdan: IconWallet,
  pasaport: IconPassport,
  admin: IconShield,
} as const;
