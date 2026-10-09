import {
  DronBayrakları,
  DRON_KAYIT,
  FROZEN_DISK_ROOMS,
  INDEPENDENT_ROOMS,
  VERTICAL_ROOMS,
  type VerticalRoomId,
} from "@/lib/dronlar/kayit";
import { MARKETPLACE_SPLIT_LIVE } from "@/lib/kernel/payments/marketplace-split-live";
import {
  canEnterJunior,
  DRON_JUNIOR_OPEN_ENV,
  isDronJuniorOpen,
  type JuniorActor,
} from "@/lib/kernel/security/junior-gate";

export { DRON_JUNIOR_OPEN_ENV, isDronJuniorOpen };

/**
 * Üretim kilitleri — yalnız gerçek yasal/güvenlik kapıları.
 * EİDS (emlak/vasıta kamu ilanı) ve Junior (reşit olmayan) durur.
 * Freelancer kamu yüzeyi Junior kalıbıyla 410; motor/şema silinmez.
 * İç hakediş kilidi kaldırıldı: usta payı Rail cüzdanına yazılmaz;
 * dağıtım Pazaryeri split portundadır.
 */

export const EIDS_PUBLIC_LISTING_LOCKED = true;

export const EIDS_PUBLIC_LISTING_LOCKED_ERROR =
  "EİDS kimlik ve yetki doğrulaması tamamlanmadan emlak/vasıta kamu ilanı LISTED olamaz.";

export const JUNIOR_PILOT_API_PREFIX = "/api/junior-pilot" as const;

/**
 * Freelancer kamu yüzeyi — Junior üretim kilidi kalıbı.
 * `lib/freelancer` motoru, Prisma şeması ve lab testleri durur.
 * Vatandaş sayfası + `/api/freelancer` + `/api/client/jobs` + v1 hop 410.
 */
export const FREELANCER_PUBLIC_SURFACE_LOCKED = true;

export const FREELANCER_PUBLIC_SURFACE_LOCKED_ERROR =
  "Freelancer kamu yüzeyi PayTR B2C vitrininde kapalıdır. Motor ve şema durur; sahte vitrin basılmaz.";

export const FREELANCER_PUBLIC_PAGE_PREFIX = "/freelancer" as const;

export const FREELANCER_LOCKED_API_PREFIXES = ["/api/freelancer", "/api/client/jobs"] as const;

function isPublicVitrineVerticalRoom(
  room: (typeof VERTICAL_ROOMS)[number],
): boolean {
  return !(room.id === "freelancer" && isFreelancerPublicSurfaceLocked());
}

/** Kamu vitrin: Panel + Akademi + Kariyer. Freelancer kilitliyken nav'dan düşer. */
export const WORKING_SHELL_NAV_ROOM_IDS: readonly VerticalRoomId[] = VERTICAL_ROOMS.filter(
  isPublicVitrineVerticalRoom,
).map((room) => room.id);

export const WORKING_PUBLIC_NAV_ROOM_IDS: readonly Exclude<VerticalRoomId, "dashboard">[] =
  VERTICAL_ROOMS.filter(
    (
      room,
    ): room is Exclude<(typeof VERTICAL_ROOMS)[number], { readonly id: "dashboard" }> =>
      room.id !== "dashboard" && isPublicVitrineVerticalRoom(room),
  ).map((room) => room.id);

/** Diskte arşiv (`archived/`); HTTP 410 kenarda. Kernel SSOT lib/dronlar/kayit.ts. */
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
  { id: "social", path: "/social", diskPath: "/social", label: "YetkinX" },
] as const satisfies ReadonlyArray<{
  id: FrozenShellRoomId;
  path: string;
  diskPath: string;
  label: string;
}>;

/** Eski Faz 1 adı — kamu vitrin WORKING_SHELL_NAV_ROOM_IDS. */
export const PHASE1_SHELL_NAV_ROOM_IDS = WORKING_SHELL_NAV_ROOM_IDS;
export const PHASE1_PUBLIC_NAV_ROOM_IDS = WORKING_PUBLIC_NAV_ROOM_IDS;

export type WorkingShellNavRoomId = (typeof WORKING_SHELL_NAV_ROOM_IDS)[number];
export type WorkingPublicNavRoomId = (typeof WORKING_PUBLIC_NAV_ROOM_IDS)[number];
export type Phase1ShellNavRoomId = WorkingShellNavRoomId;
export type Phase1PublicNavRoomId = WorkingPublicNavRoomId;

export function normalizeCircuitPathname(pathname: string): string {
  const raw = pathname.trim();
  return raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function isEidsPublicListingLocked(): boolean {
  return EIDS_PUBLIC_LISTING_LOCKED;
}

/**
 * Profil masası kapalı beta. Anonim ve listedışı hesap kilitlidir.
 * İzin listesi ve `DRON_JUNIOR_OPEN` kapıyı `canEnterJunior` üzerinden açar.
 * Kasa bu fonksiyona girmez.
 */
export function isJuniorSurfaceLocked(
  actor: JuniorActor | null = null,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return !canEnterJunior(actor, null, { intent: "profile" }, env).allow;
}

export function isJuniorPilotApiPath(pathname: string): boolean {
  const path = normalizeCircuitPathname(pathname);
  return path === JUNIOR_PILOT_API_PREFIX || path.startsWith(`${JUNIOR_PILOT_API_PREFIX}/`);
}

/** Anlatış, pekiştirme ve konu testi. Kenar 410 basmaz; kural veli oturumu ve yıllık pakettir. */
export const JUNIOR_PAID_ACTION_API_PATHS = [
  "/api/junior-pilot/tell",
  "/api/junior-pilot/quiz",
  "/api/junior-pilot/practice",
] as const;

export function isJuniorPaidActionApiPath(pathname: string): boolean {
  const path = normalizeCircuitPathname(pathname);
  return (JUNIOR_PAID_ACTION_API_PATHS as readonly string[]).includes(path);
}

/** Anonim profil masası kapalı beta iken doğrudur. Ders listesini kapatmaz. */
export function isJuniorProductionFrozen(env: NodeJS.ProcessEnv = process.env): boolean {
  return isJuniorSurfaceLocked(null, env);
}

/**
 * Freelancer kamu yüzeyi tek kapı.
 * Açık sayılması için üçünün birden geçmesi gerekir:
 * derleme kilidi kalkmış, `MARKETPLACE_SPLIT_LIVE` açık, dron kaydı kapalı değil.
 * `DRON_FREELANCER_OPEN` tek başına vitrini açmaz.
 */
export function isFreelancerPublicSurfaceLocked(): boolean {
  if (FREELANCER_PUBLIC_SURFACE_LOCKED || !MARKETPLACE_SPLIT_LIVE) {
    return true;
  }
  return DronBayrakları.isKapali("freelancer");
}

export function isFreelancerPublicPagePath(pathname: string): boolean {
  const path = normalizeCircuitPathname(pathname);
  return path === FREELANCER_PUBLIC_PAGE_PREFIX || path.startsWith(`${FREELANCER_PUBLIC_PAGE_PREFIX}/`);
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
  const path = normalizeCircuitPathname(pathname);
  if (path === "/junior/ebeveyn" || path.startsWith("/junior/ebeveyn/")) {
    return true;
  }
  if (isFreelancerPublicSurfaceLocked() && isFreelancerPublicPagePath(path)) {
    return true;
  }
  if (
    FROZEN_SHELL_PAGE_ALIASES.some(
      (alias) => path === alias || path.startsWith(`${alias}/`),
    )
  ) {
    return true;
  }
  return (
    FROZEN_DISK_ROOM_CATALOG.some(
      (room) =>
        path === room.path ||
        path.startsWith(`${room.path}/`) ||
        path === room.diskPath ||
        path.startsWith(`${room.diskPath}/`),
    ) ||
    DRON_KAYIT.some(
      (row) =>
        row.id !== "junior" &&
        DronBayrakları.isKapali(row.id) &&
        (path === row.path || path.startsWith(`${row.path}/`)),
    )
  );
}

export function isPhase1ShellNavRoom(roomId: string): boolean {
  return isWorkingShellNavRoom(roomId);
}

export function isPhase1PublicNavRoom(roomId: string): boolean {
  return isWorkingPublicNavRoom(roomId);
}

/** Donmuş disk odası veya kilitli Freelancer kamu yüzeyi. Junior müstakil odadır; 410 değildir. */
export function isVitrineRoomFrozen(roomId: string): boolean {
  if (INDEPENDENT_ROOMS.some((room) => room.id === roomId)) {
    return false;
  }
  if (!isWorkingShellNavRoom(roomId)) {
    return true;
  }
  return false;
}
