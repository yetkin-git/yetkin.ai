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
import { SM103_CINEMA_LESSONS } from "./cinema-slides";
import { SM103_LESSON_KEYS } from "./spoken-body";
import { SM103_SECTION_MAP, section1, section2, section3, section4, section5, section6 } from "./sections";

export { SM103_CINEMA_LESSONS } from "./cinema-slides";
export { SM103_LESSON_KEYS } from "./spoken-body";
export { section1, section2, section3, section4, section5, section6, SM103_SECTION_MAP };

/**
 * SM-103 Aşama 0.
 * Fiyat ve seviye mevcut SKU mührüne bağlıdır. Eğitmen adı Selin'dir. Selin'in ağzı Aoede'dir.
 * Selam «Merhaba, ben Selin». Canlı kayıt `social_media_ai` kabuğu bu modülü okur.
 * `instructors.ts` ses haritası Aoede (Selin) mührünü taşır.
 * TTS, görsel ve LLM isteği bu dosyada yoktur.
 */
export const SM103_SKU = "SM-103" as const;
export const SM103_SLUG = "03_social_media_ai" as const;
export const SM103_MODULE_CODE = "CURR-SOCIAL-MEDIA-AI-103" as const;
export const SM103_INSTRUCTOR = "Selin" as const;
export const SM103_STATUS = "live" as const;

const sm103Level = academyCourseLevelBySlug(SM103_SLUG);
if (sm103Level !== "Temel") {
  throw new Error("SM-103 seviye mührü Temel dışına çıktı.");
}

export const SM103_LEVEL = sm103Level;

export const SM103_PRICE_MINOR = ACADEMY_CATALOG_PRICE_MINOR[SM103_SLUG];

function sm103TryLabel(amountMinor: number): string {
  const lira = amountMinor / 100;
  if (!Number.isInteger(lira)) {
    throw new Error("SM-103 tutarı kuruştan tam liraya düşmez.");
  }
  const grouped = String(lira).replace(/\B(?=(\d{3})+(?!\d))/gu, ".");
  return `₺${grouped}`;
}

export const SM103_PRICE_LABEL = sm103TryLabel(SM103_PRICE_MINOR);

if (SM103_PRICE_LABEL !== "₺890" || SM103_PRICE_MINOR !== 89_000) {
  throw new Error("SM-103 liste tutarı ₺890 mühründen koptu.");
}

/** 1 Eğitim Kodu = 1 Ses. Ses haritası Aoede der, ad Selin olur. */
const sm103Instructor = academyInstructorBySlug(SM103_SLUG);
if (academyCourseMasterVoice(SM103_SLUG) !== "Aoede") {
  throw new Error("SM-103 ses mührü Aoede dışına çıktı.");
}
if (sm103Instructor.voice !== "Aoede" || sm103Instructor.name !== SM103_INSTRUCTOR) {
  throw new Error("SM-103 eğitmen adı Selin mühründen koptu.");
}
if (sm103Instructor.greetingLead !== "Merhaba, ben Selin") {
  throw new Error("SM-103 selamı Merhaba, ben Selin mühründen koptu.");
}

export const sm103Sections: Section[] = SM103_SECTION_MAP.map(applyAcademySectionPreviewGate);

const sm103SpokenMinutes = sm103Sections.reduce(
  (sum, section) => sum + section.targetDurationMinutes,
  0,
);

if (sm103Sections.length !== SM103_LESSON_KEYS.length) {
  throw new Error("SM-103 ders haritası ile anahtar listesi ayrıştı.");
}

assertAcademyAiLessonCount(sm103Sections.length, SM103_SKU);

for (const key of SM103_LESSON_KEYS) {
  if (!SM103_CINEMA_LESSONS[key]) {
    throw new Error(`SM-103 slayt dersi eksik: ${key}`);
  }
}

export const sm103MasteryModule: CurriculumModule = {
  moduleCode: SM103_MODULE_CODE,
  title: ACADEMY_COURSE_TITLES[SM103_SLUG],
  instructor: SM103_INSTRUCTOR,
  category: `Katman 1 — ${SM103_LEVEL} — ${SM103_SKU} — ${SM103_PRICE_LABEL}`,
  targetAudience: [
    "İçerik üretenler",
    "Sosyal medya işini yürütenler",
    "Küçük işletme ve mağaza sahipleri",
  ],
  methodology:
    "Sen dili, üç satırlık künye, beş çekmeceli görsel istemi, tek stil cümlesi, bir klip bir hareket, yayından önce beş soru. Sıfır kod.",
  estimatedTotalMinutes: Math.round(sm103SpokenMinutes * 10) / 10,
  voiceConfig: {
    courseMasterVoice: sm103Instructor.voice,
    style: "Dinamik, estetik bakışı güçlü, meslektaş samimiyetinde sosyal medya uygulaması",
    gender: academyInstructorGenderToTtsVoiceGender(sm103Instructor.gender),
  },
  sections: sm103Sections,
};
