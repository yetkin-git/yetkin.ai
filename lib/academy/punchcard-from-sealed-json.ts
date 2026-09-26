/**
 * Punchcard türevi — timings JSON saat SSOT, cue JSON etiket SSOT.
 * Web ve Dron aynı fonksiyonu okur; elle kopyalanan saniye dizisi yoktur.
 * Bu dosya Next alias (@/) import etmez; native Metro da yükleyebilir.
 */

export const ACADEMY_PUNCHCARD_MAX_WORDS = 3 as const;
export const ACADEMY_WELCOME_PUNCHCARD_MAX_SEC = 18 as const;
export const ACADEMY_WELCOME_PUNCHCARD_MIN_SEC = 15 as const;
export const ACADEMY_WELCOME_PUNCHCARD_CEILING_SEC = 20 as const;

export type SealedPunchcard = {
  id: string;
  label: string;
  start: number;
  end: number;
};

type TimingPiece = {
  cueId?: unknown;
  start?: unknown;
  end?: unknown;
};

type CueRow = {
  id?: unknown;
  text?: unknown;
};

export function punchcardLabelFromText(
  text: string,
  maxWords: number = ACADEMY_PUNCHCARD_MAX_WORDS,
): string {
  const words = text
    .replace(/\s+/gu, " ")
    .trim()
    .split(" ")
    .filter((part) => part.length > 0);
  return words.slice(0, maxWords).join(" ");
}

/**
 * İç reji kod adı → vatandaş rozeti (PEDAGOJI §A.2 / §E.2).
 * Cue `section` / bake rozeti durur; sahnede işin durumu parlar.
 */
export const ACADEMY_PUNCHCARD_CITIZEN_LABELS: Readonly<Record<string, string>> = {
  "GİRİŞ KÖPRÜSÜ": "HATIRLATMA",
  /** Pekiştirme durağı. İşin adı üç adımdır; giriş rozetiyle aynı kelimeye binmez. */
  "CEBİNE KOY": "ÜÇ ADIM",
  /** Saha görevi. Stüdyo tabelası sahnede durmaz. */
  "SIRA SENDE": "SIRA SİZDE",
};

export function academyCitizenPunchcardLabel(label: string): string {
  const key = label.replace(/\s+/gu, " ").trim();
  return ACADEMY_PUNCHCARD_CITIZEN_LABELS[key] ?? key;
}

export function punchcardVisualEnd(card: Pick<SealedPunchcard, "id" | "label" | "start" | "end">): number {
  const span = card.end - card.start;
  if (
    card.id === "cue-02" &&
    card.label === "HOŞ GELDİN" &&
    span > ACADEMY_WELCOME_PUNCHCARD_CEILING_SEC
  ) {
    return card.start + ACADEMY_WELCOME_PUNCHCARD_MAX_SEC;
  }
  return card.end;
}

export function punchcardsFromSealedJson(
  timings: { pieces?: readonly TimingPiece[] } | null | undefined,
  cues: readonly CueRow[] | null | undefined,
  maxWords: number = ACADEMY_PUNCHCARD_MAX_WORDS,
): readonly SealedPunchcard[] {
  const pieces = timings?.pieces ?? [];
  if (pieces.length === 0) {
    return [];
  }
  const labelById = new Map<string, string>();
  for (const cue of cues ?? []) {
    if (typeof cue.id !== "string" || cue.id.length === 0) {
      continue;
    }
    if (typeof cue.text !== "string" || cue.text.length === 0) {
      continue;
    }
    labelById.set(cue.id, punchcardLabelFromText(cue.text, maxWords));
  }
  const groups = new Map<string, { start: number; end: number }>();
  const order: string[] = [];
  for (const piece of pieces) {
    const id = typeof piece.cueId === "string" ? piece.cueId.trim() : "";
    const start = typeof piece.start === "number" && Number.isFinite(piece.start) ? piece.start : null;
    const end = typeof piece.end === "number" && Number.isFinite(piece.end) ? piece.end : null;
    if (!id || start == null || end == null) {
      continue;
    }
    const existing = groups.get(id);
    if (!existing) {
      groups.set(id, { start, end });
      order.push(id);
    } else {
      existing.start = Math.min(existing.start, start);
      existing.end = Math.max(existing.end, end);
    }
  }
  return order.map((id) => {
    const span = groups.get(id)!;
    const label = labelById.get(id) ?? id;
    const card = { id, label, start: span.start, end: span.end };
    return { ...card, end: punchcardVisualEnd(card) };
  });
}
