/**
 * Büyüme Beşlisi geçiş karnesi — Pasaport sığınağı.
 * Kariyer yazma motoru yok; yalnız salt okunur damga → compact SKU yuvası.
 * Kernel ↛ academy: yayın beşlisi `catalog-ids` ihtiyaç kapılarından türer.
 */

import {
  ACADEMY_SKU_SLUG_BY_CODE,
  academyCourseTitleBySlug,
  academySlugFromCourseTitle,
  FREELANCER_NEED_IDS,
  isOpenTrialNeed,
  qualifyingCourseSlugsForNeed,
} from "@/lib/kernel/catalog-ids";
import {
  ACADEMY_STAMP_SURFACE_PATH,
  type SealedPassportStamp,
} from "@/lib/kernel/passport/types";

/** Freelancer İlan Kapısı kısa adı — karne yüzeyi; katalog unvanı kartta uzatılmaz. */
export const PASSPORT_GROWTH_DOOR_LABELS = {
  "01_office_ai": "Ofis Yapay Zekâ",
  "02_ecommerce_ai": "E-Ticaret Asistanlığı",
  "03_social_media_ai": "Görsel/Sosyal Medya",
  "04_chatbot_nocode": "Chatbot & Müşteri Hizmetleri",
  "05_prompt_practice": "Prompt & Üretkenlik",
} as const;

export type PassportGrowthSkuSlug = keyof typeof PASSPORT_GROWTH_DOOR_LABELS;

export const PASSPORT_GROWTH_LOCKED_LABEL = "Henüz damga yok / Kilitli" as const;

export type PassportGrowthSlot = {
  slug: PassportGrowthSkuSlug;
  doorLabel: (typeof PASSPORT_GROWTH_DOOR_LABELS)[PassportGrowthSkuSlug];
  skuCode: string | null;
  courseTitle: string;
  href: string;
  held: boolean;
  stampId: string | null;
};

export function passportGrowthSkuSlugs(): PassportGrowthSkuSlug[] {
  const slugs: PassportGrowthSkuSlug[] = [];
  for (const needId of FREELANCER_NEED_IDS) {
    if (isOpenTrialNeed(needId)) {
      continue;
    }
    for (const slug of qualifyingCourseSlugsForNeed(needId)) {
      if (slug in PASSPORT_GROWTH_DOOR_LABELS) {
        slugs.push(slug as PassportGrowthSkuSlug);
      }
    }
  }
  return slugs;
}

export function isPassportGrowthSkuSlug(slug: string): slug is PassportGrowthSkuSlug {
  return Object.prototype.hasOwnProperty.call(PASSPORT_GROWTH_DOOR_LABELS, slug);
}

export function passportStampCourseSlug(
  stamp: Pick<SealedPassportStamp, "sourceKind" | "title" | "courseSlug">,
): string | null {
  if (stamp.sourceKind !== "ACADEMY_CERTIFICATE") {
    return null;
  }
  const fromCourse = stamp.courseSlug?.trim();
  if (fromCourse) {
    return fromCourse;
  }
  return academySlugFromCourseTitle(stamp.title);
}

export function passportGrowthDoorLabel(slug: string): string | null {
  if (!isPassportGrowthSkuSlug(slug)) {
    return null;
  }
  return PASSPORT_GROWTH_DOOR_LABELS[slug];
}

export function passportStampCourseHref(
  stamp: Pick<SealedPassportStamp, "sourceKind" | "title" | "courseSlug">,
): string | null {
  const slug = passportStampCourseSlug(stamp);
  if (!slug) {
    return null;
  }
  return `${ACADEMY_STAMP_SURFACE_PATH}/${slug}`;
}

function skuCodeForSlug(slug: string): string | null {
  for (const [code, mapped] of Object.entries(ACADEMY_SKU_SLUG_BY_CODE)) {
    if (mapped === slug) {
      return code;
    }
  }
  return null;
}

function stampHoldsGrowthSlug(
  stamp: Pick<SealedPassportStamp, "sourceKind" | "title" | "courseSlug">,
  slug: PassportGrowthSkuSlug,
): boolean {
  return passportStampCourseSlug(stamp) === slug;
}

/** Beş compact yuva — kazanılmamış SKU kilitli kalır; sahte damga yok. */
export function buildPassportGrowthCard(
  stamps: readonly Pick<SealedPassportStamp, "id" | "sourceKind" | "title" | "courseSlug">[],
): PassportGrowthSlot[] {
  return passportGrowthSkuSlugs().map((slug) => {
    const stamp = stamps.find((row) => stampHoldsGrowthSlug(row, slug)) ?? null;
    return {
      slug,
      doorLabel: PASSPORT_GROWTH_DOOR_LABELS[slug],
      skuCode: skuCodeForSlug(slug),
      courseTitle: academyCourseTitleBySlug(slug) ?? slug,
      href: `${ACADEMY_STAMP_SURFACE_PATH}/${slug}`,
      held: stamp !== null,
      stampId: stamp?.id ?? null,
    };
  });
}

export function passportFreelancerStamps<T extends Pick<SealedPassportStamp, "sourceKind">>(
  stamps: readonly T[],
): T[] {
  return stamps.filter((stamp) => stamp.sourceKind === "FREELANCER_RELEASE");
}

export function passportNonGrowthAcademyStamps<
  T extends Pick<SealedPassportStamp, "sourceKind" | "title" | "courseSlug">,
>(stamps: readonly T[]): T[] {
  return stamps.filter((stamp) => {
    if (stamp.sourceKind !== "ACADEMY_CERTIFICATE") {
      return false;
    }
    const slug = passportStampCourseSlug(stamp);
    if (!slug) {
      return true;
    }
    return !isPassportGrowthSkuSlug(slug);
  });
}
