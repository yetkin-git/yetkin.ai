/**
 * OFF-201: İleri Ofis Yapay Zekâ — mimari taslak (L1, fırın/bake yok).
 *
 * Dosya adı `off-102.ts` tarihîdir. Yayın kart kodu `OFF-201` (CEO L0+L1 onayı).
 * `OFF-102` EC-102 (e-ticaret) ile sayısal çakışır; üretimde kullanılmaz.
 *
 * Kaynak: `planned.ts` içindeki 3 uydu ders (lane: satellite, status: planned, targetModuleCode: OFF-201):
 * - 01_office_ai-10 Takvim ve Toplantı AI (copilot-live)
 * - 01_office_ai-11 Excel Formül ve Grafik AI (direct-file-upload)
 * - 01_office_ai-12 PDF ve Uzun Belge AI (doc-upload-gemini)
 *
 * Bu dosya salt okunur taslaktır:
 * - Kanon 13 SKU'ya dokunmaz (`course-slugs.ts` tip kilidi korunur).
 * - `lesson-index.ts` sınav yoluna girmez (OFF-101 8 ders kilidi korunur).
 * - `OFFICE_AI_PLANNED_LESSONS` uyduları yerinde durur (syllabus testi 9+3 kilitli).
 * - Fırın / bake / TTS kuyruğuna yazmaz; `planned` → `baking` geçişi CEO + Super Admin
 *   çift imza ister (Pedagoji §D.1 tetiği).
 *
 * Açılış kararı çıkarsa izlenecek yol (sıralı):
 * 1. Yeni slug kanona eklenir (tip + vitrin + `MODULE_CODE_BY_SLUG` — kart `OFF-201`).
 * 2. Uydu anahtarlar OFF-201 sırasına taşınır (1 Takvim → 2 Formül/Grafik → 3 PDF).
 * 3. Prompt köprüsü (rol/görev/format/kısıt) 101↔201 arasına köprü ders yazılır.
 * 4. Bağımsız sınav havuzu (30–50) + baraj 70 + vize rozeti birleşimi tanımlanır.
 * 5. `planned.ts` uydu satırları `lane: main` + `targetModuleCode: OFF-201` olarak güncellenir;
 *    101 indeksine girmez.
 */

import {
  OFFICE_AI_PLANNED_LESSONS,
  type OfficeAiPlannedLesson,
  type OfficeAiPlannedLessonMethod,
} from "./planned";

/** Taslak SKU kimliği — kanonda YOKTUR (fırın imzası sonrası eklenir). */
export const OFF_201_SKU_SLUG_DRAFT = "01_office_ai_ileri" as const;
/** @deprecated Tarihî isim; slug `OFF_201_SKU_SLUG_DRAFT` ile aynıdır. */
export const OFF_102_SKU_SLUG_DRAFT = OFF_201_SKU_SLUG_DRAFT;

/**
 * Tarihî taslak kart kodu — `EC-102` (E-Ticaret) ile sayısal çakışır.
 * Vitrin, TTS ve ihtiyaç eşlemesinde kullanılmaz.
 */
export const OFF_102_MODULE_CODE_RETIRED = "OFF-102" as const;

/** Yayın kart kodu — İleri Ofis Yapay Zekâ (CEO L0+L1 onayı). */
export const OFF_201_MODULE_CODE = "OFF-201" as const;

/**
 * Taslak kart kodu kiliti. Dosya adı tarihî `off-102` kalır; değer `OFF-201`.
 * Üretimde `OFF_102_MODULE_CODE_RETIRED` okunmaz.
 */
export const OFF_102_MODULE_CODE_DRAFT = OFF_201_MODULE_CODE;

/** @deprecated Alternatif değil; yayın kodu `OFF-201`. */
export const OFF_102_MODULE_CODE_ALTERNATIVE = OFF_201_MODULE_CODE;

export const OFF_201_TITLE_DRAFT = "Ofiste Yapay Zekâ — İleri Ofis ve Veri AI" as const;
/** @deprecated Tarihî isim; başlık `OFF_201_TITLE_DRAFT` ile aynıdır. */
export const OFF_102_TITLE_DRAFT = OFF_201_TITLE_DRAFT;

/** Ön koşul: OFF-101 kapanış (8/8 ders + sınav 70). Köprü ders 101 sınav yolunu şişirmez. */
export const OFF_201_PREREQUISITE_SKU_SLUG = "01_office_ai" as const;
export const OFF_201_PREREQUISITE_LESSON_COUNT = 8 as const;
export const OFF_201_EXAM_PASS_SCORE = 70 as const;
export const OFF_201_EXAM_POOL_MIN = 30 as const;
export const OFF_201_EXAM_POOL_MAX = 50 as const;

/** @deprecated Tarihî isimler; değerler OFF-201 kilitleriyle aynıdır. */
export const OFF_102_PREREQUISITE_SKU_SLUG = OFF_201_PREREQUISITE_SKU_SLUG;
export const OFF_102_PREREQUISITE_LESSON_COUNT = OFF_201_PREREQUISITE_LESSON_COUNT;
export const OFF_102_EXAM_PASS_SCORE = OFF_201_EXAM_PASS_SCORE;
export const OFF_102_EXAM_POOL_MIN = OFF_201_EXAM_POOL_MIN;
export const OFF_102_EXAM_POOL_MAX = OFF_201_EXAM_POOL_MAX;

export const OFF_201_ECOMMERCE_COLLISION_CODE = "EC-102" as const;

export const OFF_201_SATELLITE_KEYS = [
  "01_office_ai-10",
  "01_office_ai-11",
  "01_office_ai-12",
] as const;

export type Off201DraftLesson = {
  draftOrder: number;
  satelliteKey: string;
  title: string;
  method: OfficeAiPlannedLessonMethod;
  pedagogicalObjective: string;
  targetModuleCode: typeof OFF_201_MODULE_CODE;
};

/** @deprecated Tarihî isim; şekil `Off201DraftLesson` ile aynıdır. */
export type Off102DraftLesson = Off201DraftLesson;

function toDraftLesson(satellite: OfficeAiPlannedLesson, draftOrder: number): Off201DraftLesson {
  return {
    draftOrder,
    satelliteKey: satellite.key,
    title: satellite.title,
    method: satellite.method,
    pedagogicalObjective: satellite.pedagogicalObjective,
    targetModuleCode: OFF_201_MODULE_CODE,
  };
}

/**
 * Uydu → OFF-201 taslak sırası (salt okunur projeksiyon).
 * Sıra pedagojiktir: 1 Takvim/Toplantı → 2 Formül/Grafik → 3 PDF.
 * `planned.ts` ana şeridi değişmez; bu fonksiyon her çağrıda canlı projeksiyon üretir.
 */
export function off201DraftLessonsFromSatellites(): readonly Off201DraftLesson[] {
  return OFF_201_SATELLITE_KEYS.map((key, index) => {
    const found = OFFICE_AI_PLANNED_LESSONS.find((lesson) => lesson.key === key);
    if (!found) {
      throw new Error(`OFF-201 taslak uydusu kayıp: ${key}`);
    }
    return toDraftLesson(found, index + 1);
  });
}

/** @deprecated Tarihî isim; `off201DraftLessonsFromSatellites` ile aynıdır. */
export const off102DraftLessonsFromSatellites = off201DraftLessonsFromSatellites;

/** Taslak bütünlük bekçisi — karar öncesi her adımda çağrılır. */
export function assertOff201DraftIntegrity(): void {
  if (OFF_201_MODULE_CODE === OFF_201_ECOMMERCE_COLLISION_CODE) {
    throw new Error("OFF-201 kart kodu EC-102 ile çakışamaz.");
  }
  if (OFF_201_MODULE_CODE === OFF_102_MODULE_CODE_RETIRED) {
    throw new Error("Yayın kart kodu tarihî OFF-102 olamaz; EC-102 sayısal çakışması.");
  }
  if (!OFF_201_MODULE_CODE.endsWith("-201")) {
    throw new Error(`OFF-201 soneki kilitli değil: ${OFF_201_MODULE_CODE}`);
  }
  const drafts = off201DraftLessonsFromSatellites();
  if (drafts.length !== 3) {
    throw new Error(`OFF-201 taslağı 3 uydu ister; bulunan: ${drafts.length}`);
  }
  for (const draft of drafts) {
    const live = OFFICE_AI_PLANNED_LESSONS.find((lesson) => lesson.key === draft.satelliteKey);
    if (live?.lane !== "satellite") {
      throw new Error(`OFF-201 taslak anahtarı uydu şeritte değil: ${draft.satelliteKey}`);
    }
    if (live.status !== "planned") {
      throw new Error(`OFF-201 taslak anahtarı henüz planned değil: ${draft.satelliteKey}`);
    }
    if (live.targetModuleCode !== OFF_201_MODULE_CODE) {
      throw new Error(`OFF-201 taslak anahtarı 201'e kilitli değil: ${draft.satelliteKey}`);
    }
    if (draft.targetModuleCode !== OFF_201_MODULE_CODE) {
      throw new Error(`OFF-201 projeksiyon kart kodu sapması: ${draft.satelliteKey}`);
    }
  }
}

/** @deprecated Tarihî isim; `assertOff201DraftIntegrity` ile aynıdır. */
export const assertOff102DraftIntegrity = assertOff201DraftIntegrity;
