/**
 * Cue-04 odak kamerası — sese duyarlı CSS scale zoom.
 * Geçiş 0.8s; her odak penceresi 1.5–2.5 sn (bilişsel yük yok).
 * Anlatım bitince (genel tablo / cue-05) ölçek %100’e döner.
 */

import { loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";
import { loadAcademyKaraokeStrip } from "@/lib/academy/lesson-teleprompter-flow";

export const ACADEMY_EXCEL_FOCUS_ZOOM_LESSON_KEY = "01_office_ai-1" as const;
export const ACADEMY_EXCEL_FOCUS_ZOOM_CUE_ID = "cue-04" as const;
export const ACADEMY_EXCEL_FOCUS_ZOOM_LESSON_KEYS = ["01_office_ai-1", "01_office_ai-2", "01_office_ai-3", "01_office_ai-4", "01_office_ai-5", "01_office_ai-6"] as const;

/** A1 hücresine doğru yakınlaşma — %120 (CSS `scale(1.2)`). */
export const ACADEMY_EXCEL_FOCUS_ZOOM_SCALE = 1.2 as const;
export const ACADEMY_EXCEL_FOCUS_ZOOM_MIN_SCALE = 1.15 as const;
export const ACADEMY_EXCEL_FOCUS_ZOOM_MAX_SCALE = 1.2 as const;

/** CSS `transition` süresi (sn). */
export const ACADEMY_EXCEL_FOCUS_ZOOM_TRANSITION_SEC = 0.8 as const;

/** Odak penceresi (sn) — geçiş hariç tutulmaz; 1.5–2.5 aralığında. */
export const ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_SEC = 2 as const;
export const ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_MIN_SEC = 1.5 as const;
export const ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_MAX_SEC = 2.5 as const;

/** Izgara A1 — isim kutusu + formül çubuğu + sol üst hücre. */
export const ACADEMY_EXCEL_FOCUS_ZOOM_ORIGIN = "12% 22%" as const;

export const ACADEMY_EXCEL_FOCUS_ZOOM_PHRASES = [
  "A1 hücresi",
  "sütun başlığı",
  "formül çubuğu",
] as const;

export const ACADEMY_OFFICE_AI_2_FOCUS_ZOOM_PHRASES = [
  "üç madde",
  "yönetici özeti",
  "karar cümlesi",
] as const;

export const ACADEMY_OFFICE_AI_3_FOCUS_ZOOM_PHRASES = [
  "tek fikir",
  "görsel yönlendirme",
  "slayt taslağı",
] as const;

export const ACADEMY_OFFICE_AI_4_FOCUS_ZOOM_PHRASES = [
  "etiketle",
  "taslak yanıt",
  "kategorize",
] as const;

export const ACADEMY_OFFICE_AI_5_FOCUS_ZOOM_PHRASES = [
  "kırmızı",
  "halüsinasyon",
  "satır toplam",
] as const;

export const ACADEMY_OFFICE_AI_6_FOCUS_ZOOM_PHRASES = [
  "otuz dakika",
  "ataş",
  "üç blok",
] as const;

type AcademyExcelFocusZoomSpec = {
  cueId: string;
  origin: string;
  phrases: readonly string[];
  pattern: RegExp;
};

const ZOOM_BY_LESSON: Record<string, AcademyExcelFocusZoomSpec> = {
  "01_office_ai-1": {
    cueId: ACADEMY_EXCEL_FOCUS_ZOOM_CUE_ID,
    origin: ACADEMY_EXCEL_FOCUS_ZOOM_ORIGIN,
    phrases: ACADEMY_EXCEL_FOCUS_ZOOM_PHRASES,
    pattern: /a\s*(?:1|bir)\s+hücres\p{L}*|sütun başlığı|formül çubuğu/giu,
  },
  "01_office_ai-2": {
    cueId: ACADEMY_EXCEL_FOCUS_ZOOM_CUE_ID,
    origin: ACADEMY_EXCEL_FOCUS_ZOOM_ORIGIN,
    phrases: ACADEMY_OFFICE_AI_2_FOCUS_ZOOM_PHRASES,
    pattern: /üç madde|yönetici özeti|karar cümlesi/giu,
  },
  "01_office_ai-3": {
    cueId: ACADEMY_EXCEL_FOCUS_ZOOM_CUE_ID,
    origin: "38% 32%",
    phrases: ACADEMY_OFFICE_AI_3_FOCUS_ZOOM_PHRASES,
    pattern: /tek fikir|görsel yönlendir\p{L}*|slayt tasla/giu,
  },
  "01_office_ai-4": {
    cueId: ACADEMY_EXCEL_FOCUS_ZOOM_CUE_ID,
    origin: "32% 38%",
    phrases: ACADEMY_OFFICE_AI_4_FOCUS_ZOOM_PHRASES,
    pattern: /etiketle|taslak yanıt|kategorize/giu,
  },
  "01_office_ai-5": {
    cueId: ACADEMY_EXCEL_FOCUS_ZOOM_CUE_ID,
    origin: "78% 58%",
    phrases: ACADEMY_OFFICE_AI_5_FOCUS_ZOOM_PHRASES,
    pattern: /kırmızı|halüsinasyon|satır toplam/giu,
  },
  "01_office_ai-6": {
    cueId: ACADEMY_EXCEL_FOCUS_ZOOM_CUE_ID,
    origin: "18% 22%",
    phrases: ACADEMY_OFFICE_AI_6_FOCUS_ZOOM_PHRASES,
    pattern: /otuz dakika|ataş|üç blok/giu,
  },
};

function zoomSpecFor(lessonKey: string): AcademyExcelFocusZoomSpec | null {
  return ZOOM_BY_LESSON[lessonKey.trim()] ?? null;
}

export type AcademyExcelFocusZoomWindow = {
  start: number;
  end: number;
};

export type AcademyExcelFocusZoomLine = {
  cueId: string;
  text: string;
  start: number;
  end: number;
};

function foldTr(text: string): string {
  return text.toLocaleLowerCase("tr-TR").replace(/\s+/gu, " ");
}

function phraseHitTimes(text: string, start: number, end: number, pattern: RegExp): number[] {
  const folded = foldTr(text);
  const span = Math.max(0, end - start);
  const len = Math.max(1, folded.length);
  const hits: number[] = [];
  const matcher = new RegExp(pattern.source, pattern.flags);
  for (const match of folded.matchAll(matcher)) {
    const index = match.index ?? 0;
    hits.push(start + (span * index) / len);
  }
  return hits;
}

function mergeWindows(
  windows: readonly AcademyExcelFocusZoomWindow[],
): readonly AcademyExcelFocusZoomWindow[] {
  const sorted = [...windows]
    .filter((window) => window.end > window.start)
    .sort((left, right) => left.start - right.start);
  const merged: AcademyExcelFocusZoomWindow[] = [];
  for (const window of sorted) {
    const last = merged.at(-1);
    if (last && window.start <= last.end + ACADEMY_EXCEL_FOCUS_ZOOM_TRANSITION_SEC) {
      last.end = Math.max(last.end, window.end);
      continue;
    }
    merged.push({ start: window.start, end: window.end });
  }
  return merged;
}

function clampFocusWindow(start: number, cueEnd: number): AcademyExcelFocusZoomWindow | null {
  const end = Math.min(start + ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_SEC, cueEnd);
  if (end <= start) {
    return null;
  }
  return { start, end };
}

export function buildAcademyExcelFocusZoomWindows(options: {
  lessonKey: string;
  cues: readonly { id: string; start: number; end: number }[];
  lines: readonly AcademyExcelFocusZoomLine[];
}): readonly AcademyExcelFocusZoomWindow[] {
  const spec = zoomSpecFor(options.lessonKey);
  if (!spec) {
    return [];
  }
  const cue = options.cues.find((row) => row.id === spec.cueId);
  if (!cue) {
    return [];
  }
  const windows: AcademyExcelFocusZoomWindow[] = [];
  const cueStartWindow = clampFocusWindow(cue.start, cue.end);
  if (cueStartWindow) {
    windows.push(cueStartWindow);
  }
  for (const line of options.lines) {
    if (line.cueId !== spec.cueId) {
      continue;
    }
    for (const hit of phraseHitTimes(line.text, line.start, line.end, spec.pattern)) {
      const window = clampFocusWindow(hit, cue.end);
      if (window) {
        windows.push(window);
      }
    }
  }
  return mergeWindows(windows);
}

const WINDOW_CACHE = new Map<string, readonly AcademyExcelFocusZoomWindow[]>();

export function loadAcademyExcelFocusZoomWindows(
  lessonKey: string,
): readonly AcademyExcelFocusZoomWindow[] {
  const key = lessonKey.trim();
  const cached = WINDOW_CACHE.get(key);
  if (cached) {
    return cached;
  }
  const windows = buildAcademyExcelFocusZoomWindows({
    lessonKey: key,
    cues: loadAcademyLessonPlaybackCues(key),
    lines: loadAcademyKaraokeStrip(key),
  });
  WINDOW_CACHE.set(key, windows);
  return windows;
}

export function academyExcelFocusZoomActive(lessonKey: string, currentTime: number): boolean {
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  return loadAcademyExcelFocusZoomWindows(lessonKey).some((window) => t >= window.start && t < window.end);
}
