/**
 * Antre vize vaadi — kurs slug → Freelancer ihtiyaç kapısı.
 * Client-safe: sınav motoru / Prisma yok.
 */

import {
  FREELANCER_NEED_IDS,
  FREELANCER_NEED_TITLES,
  isOpenTrialNeed,
  qualifyingCourseSlugsForNeed,
  type FreelancerNeedId,
} from "@/lib/kernel/catalog-ids";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

/** Amiral antre — kullanıcıya okunan kapı adı (katalog unvanından kısa). */
const ANTRE_LISTING_LABEL: Partial<Record<FreelancerNeedId, string>> = {
  "excel-veri-otomasyon": "Ofis Otomasyonu",
};

export function academyFreelancerNeedForCourseSlug(slug: string): {
  id: FreelancerNeedId;
  label: string;
} | null {
  for (const needId of FREELANCER_NEED_IDS) {
    if (isOpenTrialNeed(needId)) {
      continue;
    }
    if (qualifyingCourseSlugsForNeed(needId).includes(slug)) {
      return {
        id: needId,
        label: ANTRE_LISTING_LABEL[needId] ?? FREELANCER_NEED_TITLES[needId],
      };
    }
  }
  return null;
}

export function academyAntreVisaPromise(slug: string, passScore: number): string | null {
  const need = academyFreelancerNeedForCourseSlug(slug);
  if (!need) {
    return null;
  }
  return ACADEMY_SEN.outline.visaPromise(passScore, need.label, need.id);
}
