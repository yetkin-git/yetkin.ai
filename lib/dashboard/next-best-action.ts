import type { DashboardPulse } from "@/lib/dashboard/pulse";

/** Kokpit «Sıradaki Eylem» kimliği — nabız sinyallerinden türetilir. */
export type NextBestActionKind =
  | "freelancer_work"
  | "freelancer_open"
  | "career_visa"
  | "academy_continue"
  | "default";

export type NextBestActionRoom = "academy" | "career" | "freelancer";

export type NextBestAction = {
  kind: NextBestActionKind;
  href: `/${NextBestActionRoom}`;
  room: NextBestActionRoom;
};

/**
 * Kişiselleştirilmiş sıradaki eylem.
 * Öncelik: kilitli/fonlanmış iş → açık ilan (bekleyen teklif) → aktif vize → akademi devam → varsayılan.
 * Salt okuma; yazma yok.
 */
export function resolveNextBestAction(pulse: DashboardPulse): NextBestAction {
  const { freelancer, career, academy } = pulse;

  if (freelancer.live) {
    const escrowLocked = Number(freelancer.pendingEscrowMinor) > 0;
    const workLive =
      freelancer.fundedAsClient > 0 || freelancer.fundedAsFreelancer > 0 || escrowLocked;
    if (workLive) {
      return { kind: "freelancer_work", href: "/freelancer", room: "freelancer" };
    }
    if (freelancer.openJobsPosted > 0) {
      return { kind: "freelancer_open", href: "/freelancer", room: "freelancer" };
    }
  }

  if (career.live && career.visaCount > 0) {
    return { kind: "career_visa", href: "/career", room: "career" };
  }

  if (academy.live && academy.purchasesCount > 0) {
    return { kind: "academy_continue", href: "/academy", room: "academy" };
  }

  return { kind: "default", href: "/academy", room: "academy" };
}

/** Featured aksiyon sırası — birincil oda başa alınır. */
export function orderFeaturedRooms(primary: NextBestActionRoom): NextBestActionRoom[] {
  const base: NextBestActionRoom[] = ["academy", "career", "freelancer"];
  return [primary, ...base.filter((room) => room !== primary)];
}
