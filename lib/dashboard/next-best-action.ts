import type { DashboardPulse } from "@/lib/dashboard/pulse";
import { isFreelancerPublicSurfaceLocked } from "@/lib/kernel/compliance/circuit-breakers";

/** Kokpit «Sıradaki Eylem» kimliği — nabız sinyallerinden türetilir. */
export type NextBestActionKind =
  | "freelancer_work"
  | "freelancer_open"
  | "career_visa"
  | "academy_continue"
  | "tezgah_first"
  | "default";

export type NextBestActionRoom = "academy" | "career" | "freelancer";

export type NextBestActionHref =
  | `/${NextBestActionRoom}`
  | "/panel/hibe"
  | "/tezgah"
  | "/panel/e-ticaret";

export type NextBestAction = {
  kind: NextBestActionKind;
  href: NextBestActionHref;
  room: NextBestActionRoom;
};

/**
 * Yeni kullanıcının sıradaki eylemi (B-03).
 *
 * Önce fallback hibe odasına düşüyordu — **korumalı** bir oda. Yeni kullanıcı orada
 * ikinci bir kayıt/onay duvarına çarpıyordu ve ürünün en güçlü anını hiç görmüyordu.
 * Artık hiçbir üretimi olmayan kullanıcı doğrudan Tezgâh'a iner.
 */
const TEZGAH_FIRST_ACTION: NextBestAction = {
  kind: "tezgah_first",
  href: "/tezgah",
  room: "academy",
};

const ACADEMY_DEFAULT: NextBestAction = {
  kind: "default",
  href: "/panel/hibe",
  room: "academy",
};
const CAREER_VISA_ACTION: NextBestAction = { kind: "career_visa", href: "/career", room: "career" };

/**
 * Kullanıcının henüz hiçbir değer üretmediği durum.
 *
 * Sinyaller: cüzdan boş, Akademi satın alması yok, Kariyer vizesi yok, freelancer
 * işi yok. Bu durumda "sıradaki adım" bir satın alma değil, **ilk çıktıdır**.
 *
 * `wallet.amountMinor === 0` tek başına yetmez (kredi yükleyip harcamamış olabilir);
 * asıl ölçü `tezgahOutputCount`'tur. O sinyal nabızda yoksa Akademi/Kariyer
 * sayımları sıfırken Tezgâh'a inmek güvenli varsayımdır — yanlış hedef kokpit
 * kartından daha az zarar verir.
 */
function isFreshUser(pulse: DashboardPulse): boolean {
  const { academy, career, freelancer, wallet } = pulse;
  const academyUsed = academy.live && (academy.purchasesCount > 0 || academy.certificatesHeld > 0);
  const careerUsed = career.live && (career.visaCount > 0 || career.portfolioCount > 0);
  const freelancerUsed =
    freelancer.live &&
    (freelancer.openJobsPosted > 0 ||
      freelancer.fundedAsClient > 0 ||
      freelancer.fundedAsFreelancer > 0 ||
      Number(freelancer.pendingEscrowMinor) > 0);
  const walletUsed = wallet.live && Number(wallet.amountMinor) > 0;
  return !academyUsed && !careerUsed && !freelancerUsed && !walletUsed;
}

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
    return "/tezgah";
  }
  return "/tezgah";
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
  // B-03: hiçbir üretimi olmayan kullanıcı kilitli hibe odasına değil,
  // ilk değer anına (Tezgâh) iner.
  if (isFreshUser(pulse)) {
    return TEZGAH_FIRST_ACTION;
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
  if (!isFreelancerPublicSurfaceLocked() && pulse.freelancer.live) {
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
  const base: NextBestActionRoom[] = isFreelancerPublicSurfaceLocked()
    ? ["academy", "career"]
    : ["academy", "career", "freelancer"];
  const rest = base.filter((room) => room !== primary);
  if ((base as readonly string[]).includes(primary)) {
    return [primary, ...rest];
  }
  return [...base];
}
