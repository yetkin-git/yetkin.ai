import { ACADEMY_CATALOG_PRICE_MINOR } from "@/lib/academy/catalog-pricing";
import { assertAcademyAiLessonCount } from "@/lib/academy/production-standard";
import { ACADEMY_COURSE_TITLES } from "@/lib/academy/course-titles";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import {
  academyCourseMasterVoice,
  academyInstructorBySlug,
  academyInstructorGenderToTtsVoiceGender,
} from "@/lib/academy/instructors";
import { applyAcademySectionPreviewGate } from "@/lib/academy/preview-lock";
import type { CurriculumModule, Section } from "../types";
import { PR105_CINEMA_LESSONS } from "./cinema-slides";
import { PR105_LESSON_KEYS } from "./spoken-body";
import { PR105_SECTION_MAP, section1, section2, section3, section4, section5, section6 } from "./sections";

export { PR105_CINEMA_LESSONS } from "./cinema-slides";
export { PR105_LESSON_KEYS } from "./spoken-body";
export { section1, section2, section3, section4, section5, section6, PR105_SECTION_MAP };

/**
 * PR-105 Aşama 0.
 * Fiyat ve seviye mevcut SKU mühründen okunur. Eğitmen adı Oğuz'dur. Oğuz'un ağzı Fenrir'dir.
 * Selam «Merhaba, ben Oğuz». Canlı kayıt `prompt_practice` kabuğu bu modülü okur.
 * Ses mührü `instructors.ts` içinde Fenrir durur.
 * TTS, görsel ve LLM isteği bu dosyada yoktur.
 */
export const PR105_SKU = "PR-105" as const;
export const PR105_SLUG = "05_prompt_practice" as const;
export const PR105_MODULE_CODE = "CURR-PROMPT-PRACTICE-105" as const;
export const PR105_INSTRUCTOR = "Oğuz" as const;
export const PR105_STATUS = "live" as const;

const pr105Level = academyCourseLevelBySlug(PR105_SLUG);
if (pr105Level !== "Masterclass") {
  throw new Error("PR-105 seviye mührü Masterclass dışına çıktı.");
}

export const PR105_LEVEL = pr105Level;

export const PR105_PRICE_MINOR = ACADEMY_CATALOG_PRICE_MINOR[PR105_SLUG];

function pr105TryLabel(amountMinor: number): string {
  const lira = amountMinor / 100;
  if (!Number.isInteger(lira)) {
    throw new Error("PR-105 tutarı kuruştan tam liraya düşmez.");
  }
  const grouped = String(lira).replace(/\B(?=(\d{3})+(?!\d))/gu, ".");
  return `₺${grouped}`;
}

export const PR105_PRICE_LABEL = pr105TryLabel(PR105_PRICE_MINOR);

if (PR105_PRICE_LABEL !== "₺1.290" || PR105_PRICE_MINOR !== 129_000) {
  throw new Error("PR-105 liste tutarı ₺1.290 mühründen koptu.");
}

/** 1 Eğitim Kodu = 1 Ses. Ses haritası Fenrir der, ad Oğuz olur. */
const pr105Instructor = academyInstructorBySlug(PR105_SLUG);
if (academyCourseMasterVoice(PR105_SLUG) !== "Fenrir") {
  throw new Error("PR-105 ses mührü Fenrir dışına çıktı.");
}
if (pr105Instructor.voice !== "Fenrir" || pr105Instructor.name !== PR105_INSTRUCTOR) {
  throw new Error("PR-105 eğitmen adı Oğuz mühründen koptu.");
}
if (pr105Instructor.greetingLead !== "Merhaba, ben Oğuz") {
  throw new Error("PR-105 selamı Merhaba, ben Oğuz mühründen koptu.");
}

export const pr105Sections: Section[] = PR105_SECTION_MAP.map(applyAcademySectionPreviewGate);

const pr105SpokenMinutes = pr105Sections.reduce(
  (sum, section) => sum + section.targetDurationMinutes,
  0,
);

if (pr105Sections.length !== PR105_LESSON_KEYS.length) {
  throw new Error("PR-105 ders haritası ile anahtar listesi ayrıştı.");
}

assertAcademyAiLessonCount(pr105Sections.length, PR105_SKU);

for (const key of PR105_LESSON_KEYS) {
  if (!PR105_CINEMA_LESSONS[key]) {
    throw new Error(`PR-105 slayt dersi eksik: ${key}`);
  }
}

export const pr105MasteryModule: CurriculumModule = {
  moduleCode: PR105_MODULE_CODE,
  title: `${ACADEMY_COURSE_TITLES[PR105_SLUG]} Masterclass`,
  instructor: PR105_INSTRUCTOR,
  category: `Katman 1 — ${PR105_LEVEL} — ${PR105_SKU} — ${PR105_PRICE_LABEL}`,
  targetAudience: [
    "Sohbet kutusuna iş yazan ofis çalışanları",
    "Tek başına çalışan satıcılar",
    "Şablonunu her gün aynı üç karta bağlamak isteyenler",
  ],
  methodology:
    "Sen dili, dört parçalı istem, bağlam satırı, zincirleme adım, kaynak sınırı, sayılabilir tablo. Sıfır kod.",
  estimatedTotalMinutes: Math.round(pr105SpokenMinutes * 10) / 10,
  voiceConfig: {
    courseMasterVoice: pr105Instructor.voice,
    style: "Canlı diyalog ve sen dili, adım adım istem şablonu",
    gender: academyInstructorGenderToTtsVoiceGender(pr105Instructor.gender),
  },
  sections: pr105Sections,
};
