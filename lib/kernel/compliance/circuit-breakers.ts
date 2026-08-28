import { FROZEN_DISK_ROOMS, VERTICAL_ROOMS, type VerticalRoomId } from "../rooms.ssot";

/**
 * Üretim kilitleri — yalnız gerçek yasal/güvenlik kapıları.
 * EİDS (emlak/vasıta kamu ilanı) ve Junior (reşit olmayan) durur.
 * İç hakediş kilidi kaldırıldı: usta payı Rail cüzdanına yazılmaz;
 * dağıtım Pazaryeri split portundadır.
 */

export const EIDS_PUBLIC_LISTING_LOCKED = true;

export const EIDS_PUBLIC_LISTING_LOCKED_ERROR =
  "EİDS kimlik ve yetki doğrulaması tamamlanmadan emlak/vasıta kamu ilanı LISTED olamaz.";

export const JUNIOR_PRODUCTION_LOCKED = true;

export const JUNIOR_PRODUCTION_LOCKED_ERROR =
  "Veli doğrulaması ve hukuki altyapı tamamlanmadan Junior para akışı ve vitrin yayını kapalıdır.";

/** Resmi ürün: dashboard + Akademi → Kanıt → İş. Donmuş odalar `archived/` + kenar 410. */
export const WORKING_SHELL_NAV_ROOM_IDS: readonly VerticalRoomId[] = VERTICAL_ROOMS.map(
  (room) => room.id,
);

export const WORKING_PUBLIC_NAV_ROOM_IDS: readonly Exclude<VerticalRoomId, "dashboard">[] =
  VERTICAL_ROOMS.filter(
    (room): room is Exclude<(typeof VERTICAL_ROOMS)[number], { readonly id: "dashboard" }> =>
      room.id !== "dashboard",
  ).map((room) => room.id);

/** Diskte arşiv (`archived/`); HTTP 410 kenarda. Kernel SSOT rooms.ssot.ts. */
export const FROZEN_SHELL_ROOM_IDS = FROZEN_DISK_ROOMS;

export type FrozenShellRoomId = (typeof FROZEN_SHELL_ROOM_IDS)[number];

/** Marka alias — next.config canlı odaya rewrite etmez; kenar 410. */
export const FROZEN_SHELL_PAGE_ALIASES = [
  "/yetkinx",
  "/corporate",
  "/market",
] as const;

/** 410 sayfası / breadcrumb etiketi. Nav ve VERTICAL_ROOMS taşımaz. */
export const FROZEN_DISK_ROOM_CATALOG = [
  { id: "studio", path: "/studio", diskPath: "/studio", label: "Studio" },
  { id: "devlabs", path: "/devlabs", diskPath: "/devlabs", label: "DevLabs" },
  { id: "kurumsal", path: "/kurumsal", diskPath: "/kurumsal", label: "Kurumsal" },
  { id: "hibe", path: "/hibe", diskPath: "/hibe", label: "Hibe" },
  { id: "arena", path: "/arena", diskPath: "/arena", label: "Arena" },
  { id: "pazaryeri", path: "/yetkinilan", diskPath: "/pazaryeri", label: "Yetkinİlan" },
  { id: "junior", path: "/junior", diskPath: "/junior", label: "Junior" },
  { id: "social", path: "/social", diskPath: "/social", label: "YetkinX" },
] as const satisfies ReadonlyArray<{
  id: FrozenShellRoomId;
  path: string;
  diskPath: string;
  label: string;
}>;

/** Eski Faz 1 adı — aynı dört oda. */
export const PHASE1_SHELL_NAV_ROOM_IDS = WORKING_SHELL_NAV_ROOM_IDS;
export const PHASE1_PUBLIC_NAV_ROOM_IDS = WORKING_PUBLIC_NAV_ROOM_IDS;

export type WorkingShellNavRoomId = (typeof WORKING_SHELL_NAV_ROOM_IDS)[number];
export type WorkingPublicNavRoomId = (typeof WORKING_PUBLIC_NAV_ROOM_IDS)[number];
export type Phase1ShellNavRoomId = WorkingShellNavRoomId;
export type Phase1PublicNavRoomId = WorkingPublicNavRoomId;

export function isEidsPublicListingLocked(): boolean {
  return EIDS_PUBLIC_LISTING_LOCKED;
}

export function isJuniorProductionFrozen(): boolean {
  return JUNIOR_PRODUCTION_LOCKED;
}

export function isWorkingShellNavRoom(roomId: string): boolean {
  return (WORKING_SHELL_NAV_ROOM_IDS as readonly string[]).includes(roomId);
}

export function isWorkingPublicNavRoom(roomId: string): boolean {
  return (WORKING_PUBLIC_NAV_ROOM_IDS as readonly string[]).includes(roomId);
}

export function isFrozenShellRoom(roomId: string): boolean {
  return (FROZEN_SHELL_ROOM_IDS as readonly string[]).includes(roomId);
}

export function isFrozenShellPagePath(pathname: string): boolean {
  const raw = pathname.trim();
  const path = raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw;
  if (
    FROZEN_SHELL_PAGE_ALIASES.some(
      (alias) => path === alias || path.startsWith(`${alias}/`),
    )
  ) {
    return true;
  }
  return FROZEN_DISK_ROOM_CATALOG.some(
    (room) =>
      path === room.path ||
      path.startsWith(`${room.path}/`) ||
      path === room.diskPath ||
      path.startsWith(`${room.diskPath}/`),
  );
}

export function isPhase1ShellNavRoom(roomId: string): boolean {
  return isWorkingShellNavRoom(roomId);
}

export function isPhase1PublicNavRoom(roomId: string): boolean {
  return isWorkingPublicNavRoom(roomId);
}

/** Çalışmayan 8 oda + Junior üretim donu — vitrin/şerit/kamu kartı basılmaz. */
export function isVitrineRoomFrozen(roomId: string): boolean {
  if (!isWorkingShellNavRoom(roomId)) {
    return true;
  }
  return roomId === "junior" && isJuniorProductionFrozen();
}
