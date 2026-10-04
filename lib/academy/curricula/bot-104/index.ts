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
import { BOT104_CINEMA_LESSONS } from "./cinema-slides";
import { BOT104_LESSON_KEYS } from "./spoken-body";
import { BOT104_SECTION_MAP, section1, section2, section3, section4, section5, section6 } from "./sections";

export { BOT104_CINEMA_LESSONS } from "./cinema-slides";
export { BOT104_LESSON_KEYS } from "./spoken-body";
export { section1, section2, section3, section4, section5, section6, BOT104_SECTION_MAP };

/**
 * BOT-104 Aşama 0.
 * Fiyat ve seviye mevcut SKU mührüne bağlıdır. Eğitmen adı Mert'tir. Mert'in ağzı Achird'dir.
 * Selam «Merhaba, ben Mert». Canlı kayıt `chatbot_nocode` kabuğu bu modülü okur.
 * `instructors.ts` ses haritası `04_chatbot_nocode` için Achird (Mert) mührünü taşır.
 * Sicil adı Deniz bu kursta konuşulmaz. TTS, görsel ve LLM isteği bu dosyada yoktur.
 */
export const BOT104_SKU = "BOT-104" as const;
export const BOT104_SLUG = "04_chatbot_nocode" as const;
export const BOT104_MODULE_CODE = "CURR-CHATBOT-NOCODE-104" as const;
export const BOT104_INSTRUCTOR = "Mert" as const;
export const BOT104_STATUS = "live" as const;

const bot104Level = academyCourseLevelBySlug(BOT104_SLUG);
if (bot104Level !== "Masterclass") {
  throw new Error("BOT-104 seviye mührü katalog seviyesinden koptu.");
}

export const BOT104_LEVEL = bot104Level;

export const BOT104_PRICE_MINOR = ACADEMY_CATALOG_PRICE_MINOR[BOT104_SLUG];

function bot104TryLabel(amountMinor: number): string {
  const lira = amountMinor / 100;
  if (!Number.isInteger(lira)) {
    throw new Error("BOT-104 tutarı kuruştan tam liraya düşmez.");
  }
  const grouped = String(lira).replace(/\B(?=(\d{3})+(?!\d))/gu, ".");
  return `₺${grouped}`;
}

export const BOT104_PRICE_LABEL = bot104TryLabel(BOT104_PRICE_MINOR);

if (BOT104_PRICE_LABEL !== "₺1.290" || BOT104_PRICE_MINOR !== 129_000) {
  throw new Error("BOT-104 liste tutarı ₺1.290 mühründen koptu.");
}

/** 1 Eğitim Kodu = 1 Ses. Ses haritası Achird der, ad Mert olur. Zephyr kadın yuvasıdır. */
const bot104Instructor = academyInstructorBySlug(BOT104_SLUG);
if (academyCourseMasterVoice(BOT104_SLUG) !== "Achird") {
  throw new Error("BOT-104 ses mührü Achird dışına çıktı.");
}
if (bot104Instructor.voice !== "Achird" || bot104Instructor.name !== BOT104_INSTRUCTOR) {
  throw new Error("BOT-104 eğitmen adı Mert mühründen koptu.");
}
if (bot104Instructor.gender !== "erkek") {
  throw new Error("BOT-104 ses karakteri erkek mühründen koptu.");
}
if (bot104Instructor.greetingLead !== "Merhaba, ben Mert") {
  throw new Error("BOT-104 selamı Merhaba, ben Mert mühründen koptu.");
}

export const bot104Sections: Section[] = BOT104_SECTION_MAP.map(applyAcademySectionPreviewGate);

const bot104SpokenMinutes = bot104Sections.reduce(
  (sum, section) => sum + section.targetDurationMinutes,
  0,
);

if (bot104Sections.length !== BOT104_LESSON_KEYS.length) {
  throw new Error("BOT-104 ders haritası ile anahtar listesi ayrıştı.");
}

assertAcademyAiLessonCount(bot104Sections.length, BOT104_SKU);

for (const key of BOT104_LESSON_KEYS) {
  if (!BOT104_CINEMA_LESSONS[key]) {
    throw new Error(`BOT-104 slayt dersi eksik: ${key}`);
  }
}

export const bot104MasteryModule: CurriculumModule = {
  moduleCode: BOT104_MODULE_CODE,
  title: ACADEMY_COURSE_TITLES[BOT104_SLUG],
  instructor: BOT104_INSTRUCTOR,
  category: `Katman 1 — ${BOT104_LEVEL} — ${BOT104_SKU} — ${BOT104_PRICE_LABEL}`,
  targetAudience: [
    "Müşteri mesajlarına yetişemeyen küçük işletme sahipleri",
    "Müşteri hizmetleri ve satış ekipleri",
    "İşletmelere kurulum yapmak isteyen serbest çalışanlar",
  ],
  methodology:
    "Sen dili, soru defteri, tek soru tek adım karar ağacı, insana devir kuralı, teslim listesi, on konuşmalık deneme. Sıfır kod.",
  estimatedTotalMinutes: Math.round(bot104SpokenMinutes * 10) / 10,
  voiceConfig: {
    courseMasterVoice: bot104Instructor.voice,
    style: "Analitik, sakin ve samimi. Mantık akışını teknik ayrıntıya boğmadan adım adım kuran otomasyon uzmanı",
    gender: academyInstructorGenderToTtsVoiceGender(bot104Instructor.gender),
  },
  sections: bot104Sections,
};
