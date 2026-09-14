/**
 * 01_office_ai-1 / 01_office_ai-2 punchcard rozetleri — en fazla 3 kelime.
 * Saat web karaoke currentTime ile kilitlenir; native TTS hop'u yoktur.
 */

export const DRON_PUNCHCARD_MAX_WORDS = 3 as const;

export type DronAcademyPunchcard = {
  id: string;
  label: string;
  start: number;
  end: number;
};

export const DRON_OFFICE_AI_1_PUNCHCARDS: readonly DronAcademyPunchcard[] = [
  { id: "cue-01", label: "GİRİŞ KÖPRÜSÜ", start: 2, end: 39.04 },
  { id: "cue-02", label: "HOŞ GELDİN", start: 39.44, end: 118.24 },
  { id: "cue-03", label: "DÜZENSİZ TABLO", start: 118.64, end: 187.68 },
  { id: "cue-04", label: "A1 HÜCRESİ", start: 188.08, end: 261.56 },
  { id: "cue-05", label: "TEMİZLE ŞİMDİ", start: 261.96, end: 364.68 },
  { id: "cue-06", label: "FARK ORTADA", start: 365.08, end: 434.84 },
  { id: "cue-07", label: "CEBİNE KOY", start: 435.24, end: 477.48 },
  { id: "cue-08", label: "SIRA SENDE", start: 477.88, end: 547.12 },
];

export const DRON_OFFICE_AI_2_PUNCHCARDS: readonly DronAcademyPunchcard[] = [
  { id: "cue-01", label: "GİRİŞ KÖPRÜSÜ", start: 2, end: 45.12 },
  { id: "cue-02", label: "HOŞ GELDİN", start: 45.52, end: 114.8 },
  { id: "cue-03", label: "UZUN RAPOR", start: 115.2, end: 186.76 },
  { id: "cue-04", label: "ÖZET İSTE", start: 187.16, end: 252.88 },
  { id: "cue-05", label: "KARAR NOTU", start: 253.28, end: 323.88 },
  { id: "cue-06", label: "FARK ORTADA", start: 324.28, end: 393.2 },
  { id: "cue-07", label: "CEBİNE KOY", start: 393.6, end: 433.92 },
  { id: "cue-08", label: "SIRA SENDE", start: 434.32, end: 500.12 },
];

export function dronPunchcardLabel(text: string): string {
  const words = text
    .replace(/\s+/gu, " ")
    .trim()
    .split(" ")
    .filter((part) => part.length > 0);
  return words.slice(0, DRON_PUNCHCARD_MAX_WORDS).join(" ");
}

export function dronAcademyPunchcardsForLesson(lessonKey: string): readonly DronAcademyPunchcard[] {
  switch (lessonKey.trim()) {
    case "01_office_ai-1":
      return DRON_OFFICE_AI_1_PUNCHCARDS;
    case "01_office_ai-2":
      return DRON_OFFICE_AI_2_PUNCHCARDS;
    default:
      return [];
  }
}

export function dronActivePunchcard(
  cards: readonly DronAcademyPunchcard[],
  currentTime: number,
): DronAcademyPunchcard | null {
  if (cards.length === 0) {
    return null;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  let lastHit: DronAcademyPunchcard | null = null;
  for (const card of cards) {
    if (t >= card.start && t < card.end) {
      return card;
    }
    if (t >= card.end) {
      lastHit = card;
    }
  }
  return lastHit;
}
