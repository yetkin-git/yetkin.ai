import type { DashboardPulse } from "@/lib/dashboard/pulse";
import { FREELANCER_PUBLIC_SURFACE_LOCKED } from "@/lib/kernel/compliance/circuit-breakers";
import { MARKETPLACE_SPLIT_LIVE } from "@/lib/kernel/payments/marketplace-split-live";

/** Kokpit «Sıradaki Eylem» kimliği — nabız sinyallerinden türetilir. */
export type NextBestActionKind =
  | "freelancer_work"
  | "freelancer_open"
  | "career_visa"
  | "academy_continue"
  | "default";

export type NextBestActionRoom = "academy" | "career" | "freelancer";

export type NextBestActionHref = `/${NextBestActionRoom}` | `/academy/${string}/oyna`;

export type NextBestAction = {
  kind: NextBestActionKind;
  href: NextBestActionHref;
  room: NextBestActionRoom;
};

const ACADEMY_DEFAULT: NextBestAction = { kind: "default", href: "/academy", room: "academy" };
const CAREER_VISA_ACTION: NextBestAction = { kind: "career_visa", href: "/career", room: "career" };

/** Satın alınmış yarım kurs → oynatıcı; yoksa katalog. */
export function academyContinueHref(slug: string | null | undefined): NextBestActionHref {
  const trimmed = slug?.trim() ?? "";
  if (
    !trimmed ||
    trimmed.includes("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("..") ||
    trimmed.includes("?") ||
    trimmed.includes("#")
  ) {
    return "/academy";
  }
  return `/academy/${trimmed}/oyna`;
}

/** Yarım eğitim: lastCourseSlug nabızda durur; sertifika basılınca slug düşer. */
export function hasIncompleteAcademyPurchase(pulse: DashboardPulse["academy"]): boolean {
  return pulse.live && pulse.purchasesCount > 0 && Boolean(pulse.lastCourseSlug?.trim());
}

function academyContinueAction(pulse: DashboardPulse["academy"]): NextBestAction {
  return {
    kind: "academy_continue",
    href: academyContinueHref(pulse.lastCourseSlug),
    room: "academy",
  };
}

function academyOrVisaOrDefault(pulse: DashboardPulse): NextBestAction {
  const { career, academy } = pulse;
  if (hasIncompleteAcademyPurchase(academy)) {
    return academyContinueAction(academy);
  }
  if (career.live && career.visaCount > 0) {
    return CAREER_VISA_ACTION;
  }
  if (academy.live && academy.purchasesCount > 0) {
    return academyContinueAction(academy);
  }
  return ACADEMY_DEFAULT;
}

/**
 * Kişiselleştirilmiş sıradaki eylem.
 * Yarım Akademi dersi devam eder. Sınav 70+ sonrası damga varsa `/career`.
 * PayTR Split kapalıyken freelancer NBA'sı «işini güvenceye al» vaadi taşımaz.
 * Split açılınca kilitli iş → açık ilan önce gelir. Salt okuma; yazma yok.
 */
export function resolveNextBestAction(pulse: DashboardPulse): NextBestAction {
  if (!FREELANCER_PUBLIC_SURFACE_LOCKED && MARKETPLACE_SPLIT_LIVE && pulse.freelancer.live) {
    const escrowLocked = Number(pulse.freelancer.pendingEscrowMinor) > 0;
    const workLive =
      pulse.freelancer.fundedAsClient > 0 ||
      pulse.freelancer.fundedAsFreelancer > 0 ||
      escrowLocked;
    if (workLive) {
      return { kind: "freelancer_work", href: "/freelancer", room: "freelancer" };
    }
    if (pulse.freelancer.openJobsPosted > 0) {
      return { kind: "freelancer_open", href: "/freelancer", room: "freelancer" };
    }
  }

  return academyOrVisaOrDefault(pulse);
}

/** Featured aksiyon sırası — birincil oda başa alınır. */
export function orderFeaturedRooms(primary: NextBestActionRoom): NextBestActionRoom[] {
  const base: NextBestActionRoom[] = FREELANCER_PUBLIC_SURFACE_LOCKED
    ? ["academy", "career"]
    : ["academy", "career", "freelancer"];
  const rest = base.filter((room) => room !== primary);
  if ((base as readonly string[]).includes(primary)) {
    return [primary, ...rest];
  }
  return [...base];
}
