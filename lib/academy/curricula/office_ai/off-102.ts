/**
 * OFF-102: İleri Ofis ve Veri AI — mimari taslak (Faz 2, kod yazılmaz karar öncesi).
 *
 * Kaynak: `planned.ts` içindeki 3 uydu ders (lane: satellite, status: planned):
 * - 01_office_ai-10 Takvim ve Toplantı AI (copilot-live)
 * - 01_office_ai-11 Excel Formül ve Grafik AI (direct-file-upload)
 * - 01_office_ai-12 PDF ve Uzun Belge AI (doc-upload-gemini)
 *
 * Bu dosya salt okunur taslaktır:
 * - Kanon 13 SKU'ya dokunmaz (`course-slugs.ts` tip kilidi korunur).
 * - `lesson-index.ts` sınav yoluna girmez (OFF-101 9 ders kilidi korunur).
 * - `OFFICE_AI_PLANNED_LESSONS` uyduları yerinde durur (syllabus testi 9+3 kilitli).
 * - Fırın / bake / TTS kuyruğuna yazmaz; karar (CEO + Super Admin çift imza) çıkmadan
 *   `planned` → `baking` geçişi yapılmaz (Pedagoji §D.1 tetiği).
 *
 * Açılış kararı çıkarsa izlenecek yol (sıralı):
 * 1. Yeni slug kanona eklenir (tip + vitrin + `MODULE_CODE_BY_SLUG`).
 * 2. Uydu anahtarlar OFF-102 sırasına taşınır (1 Takvim → 2 Formül/Grafik → 3 PDF).
 * 3. Prompt köprüsü (rol/görev/format/kısıt) 101↔102 arasına köprü ders yazılır.
 * 4. Bağımsız sınav havuzu (30–50) + baraj 70 + vize rozeti birleşimi tanımlanır.
 * 5. `planned.ts` uydu satırları `lane: main (off-102)` olarak güncellenir.
 */

import {
  OFFICE_AI_PLANNED_LESSONS,
  type OfficeAiPlannedLesson,
  type OfficeAiPlannedLessonMethod,
} from "./planned";

/** Taslak SKU kimliği — kanonda YOKTUR (karar sonrası eklenir). */
export const OFF_102_SKU_SLUG_DRAFT = "01_office_ai_ileri" as const;

/**
 * Kart kodu taslağı — CEO direktifi `OFF-102` korunur.
 * UYARI: `EC-102` (E-Ticaret) ile sayısal çakışma riski taşır; lansman öncesi
 * Kart SKU karması (`catalog-filter.ts`) `OFF-201` alternatifini değerlendirmelidir.
 */
export const OFF_102_MODULE_CODE_DRAFT = "OFF-102" as const;
export const OFF_102_MODULE_CODE_ALTERNATIVE = "OFF-201" as const;

export const OFF_102_TITLE_DRAFT = "Ofiste Yapay Zekâ — İleri Ofis ve Veri AI" as const;

/** Ön koşul: OFF-101 kapanış (9/9 ders + sınav 70). Köprü ders sınav yolunu şişirmez. */
export const OFF_102_PREREQUISITE_SKU_SLUG = "01_office_ai" as const;
export const OFF_102_PREREQUISITE_LESSON_COUNT = 9 as const;
export const OFF_102_EXAM_PASS_SCORE = 70 as const;
export const OFF_102_EXAM_POOL_MIN = 30 as const;
export const OFF_102_EXAM_POOL_MAX = 50 as const;

export type Off102DraftLesson = {
  draftOrder: number;
  satelliteKey: string;
  title: string;
  method: OfficeAiPlannedLessonMethod;
  pedagogicalObjective: string;
};

function toDraftLesson(satellite: OfficeAiPlannedLesson, draftOrder: number): Off102DraftLesson {
  return {
    draftOrder,
    satelliteKey: satellite.key,
    title: satellite.title,
    method: satellite.method,
    pedagogicalObjective: satellite.pedagogicalObjective,
  };
}

/**
 * Uydu → OFF-102 taslak sırası (salt okunur projeksiyon).
 * Sıra pedagojiktir: 1 Takvim/Toplantı → 2 Formül/Grafik → 3 PDF.
 * `planned.ts` değişmez; bu fonksiyon her çağrıda canlı projeksiyon üretir.
 */
export function off102DraftLessonsFromSatellites(): readonly Off102DraftLesson[] {
  const order = ["01_office_ai-10", "01_office_ai-11", "01_office_ai-12"] as const;
  return order.map((key, index) => {
    const found = OFFICE_AI_PLANNED_LESSONS.find((lesson) => lesson.key === key);
    if (!found) {
      throw new Error(`OFF-102 taslak uydusu kayıp: ${key}`);
    }
    return toDraftLesson(found, index + 1);
  });
}

/** Taslak bütünlük bekçisi — karar öncesi her adımda çağrılır. */
export function assertOff102DraftIntegrity(): void {
  const drafts = off102DraftLessonsFromSatellites();
  if (drafts.length !== 3) {
    throw new Error(`OFF-102 taslağı 3 uydu ister; bulunan: ${drafts.length}`);
  }
  for (const draft of drafts) {
    const live = OFFICE_AI_PLANNED_LESSONS.find((lesson) => lesson.key === draft.satelliteKey);
    if (live?.lane !== "satellite") {
      throw new Error(`OFF-102 taslak anahtarı uydu şeritte değil: ${draft.satelliteKey}`);
    }
    if (live.status !== "planned") {
      throw new Error(`OFF-102 taslak anahtarı henüz planned değil: ${draft.satelliteKey}`);
    }
  }
}
