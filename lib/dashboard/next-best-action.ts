import type { DashboardPulse } from "@/lib/dashboard/pulse";
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

function academyOrVisaOrDefault(pulse: DashboardPulse): NextBestAction {
  const { career, academy } = pulse;
  if (academy.live && academy.purchasesCount > 0) {
    return {
      kind: "academy_continue",
      href: academyContinueHref(academy.lastCourseSlug),
      room: "academy",
    };
  }
  if (career.live && career.visaCount > 0) {
    return { kind: "career_visa", href: "/career", room: "career" };
  }
  return ACADEMY_DEFAULT;
}

/**
 * Kişiselleştirilmiş sıradaki eylem.
 * PayTR Split kapalıyken birincil yönlendirme Akademi'dir (`/academy`).
 * Freelancer NBA'sı «işini güvenceye al» vaadi taşımaz; split açılınca
 * kilitli iş → açık ilan önce gelir. Salt okuma; yazma yok.
 */
export function resolveNextBestAction(pulse: DashboardPulse): NextBestAction {
  if (MARKETPLACE_SPLIT_LIVE && pulse.freelancer.live) {
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
  const base: NextBestActionRoom[] = ["academy", "career", "freelancer"];
  return [primary, ...base.filter((room) => room !== primary)];
}
