/**
 * OFF-201: İleri Ofis Yapay Zekâ — canlı kart sabiti.
 *
 * Kanonik slug `01_office_ai_ileri`. Gövde `office_ai_2/` altındaki altı derstir.
 * Emekli slug `02_business_ai` kullanılmaz. Tarihî kart kodu `OFF-102` üretimde yoktur;
 * e-ticaret kodu `EC-102` ile sayısal çakışır.
 *
 * `lesson-index.ts` bu altı anahtarı sınav yoluna yazar.
 *
 * `planned.ts` içindeki 3 uydu, ikinci bir müfredat değildir.
 * Vaatleri altı dersin öğrettiğiyle aynıdır:
 * - 01_office_ai-10 toplantı notu ve eylem listesi (ders 2)
 * - 01_office_ai-11 toplama formülü, hücre kilidi, grafik (ders 3)
 * - 01_office_ai-12 uzun belgede sayfa kontrolü (ders 4)
 *
 * Bu sürümde yoktur: XLOOKUP, özet tablo, OCR, belge birleştirme.
 *
 * Ön koşul kapısı yoktur. Ekrandaki öğüt metni yeter.
 * Ders 3–5 mühürlü sestir. Ders 1, 2 ve 6 yeniden fırın kuyruğundadır.
 */

import {
  OFFICE_AI_PLANNED_LESSONS,
  type OfficeAiPlannedLesson,
  type OfficeAiPlannedLessonMethod,
} from "./planned";

/** Canlı SKU adresi. */
export const OFF_201_SKU_SLUG = "01_office_ai_ileri" as const;

/** Yayın kart kodu — İleri Ofis Yapay Zekâ. */
export const OFF_201_MODULE_CODE = "OFF-201" as const;

export const OFF_201_TITLE = "İleri Ofis Yapay Zekâ" as const;

export const OFF_201_EXAM_PASS_SCORE = 70 as const;
export const OFF_201_EXAM_POOL_MIN = 30 as const;
export const OFF_201_EXAM_POOL_MAX = 50 as const;

export const OFF_201_ECOMMERCE_COLLISION_CODE = "EC-102" as const;

const RETIRED_OFFICE_MODULE_CODE = "OFF-102";

/**
 * Altı dersin öğretmediği konular. Müfredat vaadi değildir.
 */
export const OFF_201_NOT_IN_THIS_VERSION = [
  "XLOOKUP",
  "özet tablo",
  "OCR",
  "belge birleştirme",
] as const;

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
 * Uydu → OFF-201 vaat yüzeyi (salt okunur projeksiyon).
 * Sıra: 1 toplantı notu → 2 formül/grafik → 3 uzun belge.
 * Bu üç satır, altı dersin 2, 3 ve 4. dersidir. Ayrı müfredat değildir.
 */
export function off201DraftLessonsFromSatellites(): readonly Off201DraftLesson[] {
  return OFF_201_SATELLITE_KEYS.map((key, index) => {
    const found = OFFICE_AI_PLANNED_LESSONS.find((lesson) => lesson.key === key);
    if (!found) {
      throw new Error(`OFF-201 uydu kayıp: ${key}`);
    }
    return toDraftLesson(found, index + 1);
  });
}

/** Yayın kartının bütünlük bekçisi. */
export function assertOff201DraftIntegrity(): void {
  const publishedCode: string = OFF_201_MODULE_CODE;
  if (publishedCode === OFF_201_ECOMMERCE_COLLISION_CODE) {
    throw new Error("OFF-201 kart kodu EC-102 ile çakışamaz.");
  }
  if (publishedCode === RETIRED_OFFICE_MODULE_CODE) {
    throw new Error("Yayın kart kodu tarihî OFF-102 olamaz; EC-102 sayısal çakışması.");
  }
  if (!OFF_201_MODULE_CODE.endsWith("-201")) {
    throw new Error(`OFF-201 soneki kilitli değil: ${OFF_201_MODULE_CODE}`);
  }
  const drafts = off201DraftLessonsFromSatellites();
  if (drafts.length !== 3) {
    throw new Error(`OFF-201 3 uydu ister; bulunan: ${drafts.length}`);
  }
  for (const draft of drafts) {
    const live = OFFICE_AI_PLANNED_LESSONS.find((lesson) => lesson.key === draft.satelliteKey);
    if (live?.lane !== "satellite") {
      throw new Error(`OFF-201 uydu şeritte değil: ${draft.satelliteKey}`);
    }
    if (live.status !== "planned") {
      throw new Error(`OFF-201 uydu henüz planned değil: ${draft.satelliteKey}`);
    }
    if (live.targetModuleCode !== OFF_201_MODULE_CODE) {
      throw new Error(`OFF-201 uydu 201'e kilitli değil: ${draft.satelliteKey}`);
    }
    if (draft.targetModuleCode !== OFF_201_MODULE_CODE) {
      throw new Error(`OFF-201 projeksiyon kart kodu sapması: ${draft.satelliteKey}`);
    }
    const promise = `${draft.title}\n${draft.pedagogicalObjective}`;
    for (const topic of OFF_201_NOT_IN_THIS_VERSION) {
      if (promise.toLocaleLowerCase("tr").includes(topic.toLocaleLowerCase("tr"))) {
        throw new Error(`OFF-201 vaadi bu sürümde yok: ${draft.satelliteKey} / ${topic}`);
      }
    }
  }
}
