/**
 * Altın Şablon — 4-beat görsel reji (PEDAGOJI.md §B).
 * 0–2 sn: Lyria jenerik + logo. Warm-up: 8 sn Veo 3.1 Lite B-roll (yerel MP4 reuse veya Ken Burns), sonra canlı Excel (donmuş kare yok).
 * Beat 2 (Command): %80 tek ekran; ızgara dağınık kalır — temiz tablo spoiler yasak.
 * Beat 3: dikey split-screen Önce / Sonra; temiz tablo ilk kez sağ panelde.
 * Beat 4: düzenli nihai tabloya dönüş.
 * Vatandaş etiketinde «Kirli» yok.
 */

export const ACADEMY_GOLDEN_BEAT_IDS = ["warmup", "command", "comparison", "task"] as const;

export type AcademyGoldenBeatId = (typeof ACADEMY_GOLDEN_BEAT_IDS)[number];

export const ACADEMY_GOLDEN_WAITER_RATIO = 80 as const;

export const ACADEMY_GOLDEN_COMPARE_BEFORE_LABEL = "ÖNCE (DÜZENLEMESİZ)" as const;
export const ACADEMY_GOLDEN_COMPARE_AFTER_LABEL = "SONRA (AI İLE)" as const;

/** 01_office_ai-2 Beat 3 — 10 sayfalık döküm vs 3 maddelik yönetim özeti. */
export const ACADEMY_OFFICE_AI_2_COMPARE_BEFORE_LABEL = "ÖNCE (10 SAYFALIK DÖKÜM)" as const;
export const ACADEMY_OFFICE_AI_2_COMPARE_AFTER_LABEL = "SONRA (3 MADDELİK YÖNETİM ÖZETİ - AI)" as const;

/** CEBİNE KOY overlay — 01_office_ai-1. */
export const ACADEMY_OFFICE_AI_1_POCKET_STEPS = [
  "A1'e sütun adı",
  "Birleşikleri çöz & boşlukları sil",
  "Yalın dille tek tip yap",
] as const;

/** CEBİNE KOY overlay — 01_office_ai-2. */
export const ACADEMY_OFFICE_AI_2_POCKET_STEPS = [
  "Toplam ve trendi iste",
  "Anomali ve riskleri sor",
  "Eylem cümlesine çevir",
] as const;

export function academyPocketChecklistSteps(
  lessonKey: string,
  section: string,
): readonly string[] | null {
  if (section.trim() !== "CEBİNE KOY") {
    return null;
  }
  const key = lessonKey.trim();
  if (key === "01_office_ai-1") {
    return ACADEMY_OFFICE_AI_1_POCKET_STEPS;
  }
  if (key === "01_office_ai-2") {
    return ACADEMY_OFFICE_AI_2_POCKET_STEPS;
  }
  return null;
}

/** 01_office_ai-1 pekiştirme — CEBİNE KOY ducking 0.46. Giriş jeneriği 0–2 sn ayrı. Bitiş 2–3 sn fade-out. */
export const ACADEMY_GOLDEN_REINFORCEMENT_CUE_IDS = ["cue-07"] as const;

export const ACADEMY_GOLDEN_BEAT_VISUAL = {
  warmup: { mode: "veo", waiterRatio: ACADEMY_GOLDEN_WAITER_RATIO },
  command: { mode: "live", waiterRatio: ACADEMY_GOLDEN_WAITER_RATIO },
  comparison: { mode: "split", waiterRatio: ACADEMY_GOLDEN_WAITER_RATIO },
  task: { mode: "live", waiterRatio: ACADEMY_GOLDEN_WAITER_RATIO },
} as const;

export type AcademyGoldenVisualMode = (typeof ACADEMY_GOLDEN_BEAT_VISUAL)[AcademyGoldenBeatId]["mode"];
