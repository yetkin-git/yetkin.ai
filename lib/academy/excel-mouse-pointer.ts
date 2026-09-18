/**
 * Cue-04 sanal fare — A1’e süzülüp tıklar, sütun/satır anlatımında A1 → B1 → C1.
 * İzleme anında harici API yok; mühürlü karaoke saati.
 */

import { loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";
import { loadAcademyKaraokeStrip } from "@/lib/academy/lesson-teleprompter-flow";

export const ACADEMY_EXCEL_MOUSE_LESSON_KEY = "01_office_ai-1" as const;
export const ACADEMY_EXCEL_MOUSE_CUE_ID = "cue-04" as const;
export const ACADEMY_EXCEL_MOUSE_LESSON_KEYS = ["01_office_ai-1", "01_office_ai-2", "01_office_ai-3", "01_office_ai-4", "01_office_ai-5", "01_office_ai-6"] as const;

export const ACADEMY_EXCEL_MOUSE_CELLS = ["A1", "B1", "C1"] as const;
export const ACADEMY_OFFICE_AI_2_MOUSE_CELLS = ["A1", "B1", "D1"] as const;
export const ACADEMY_OFFICE_AI_3_MOUSE_CELLS = ["A1", "B1", "C1"] as const;
export const ACADEMY_OFFICE_AI_5_MOUSE_CELLS = ["A1", "D4", "D5"] as const;
export const ACADEMY_OFFICE_AI_6_MOUSE_CELLS = ["A1", "B1", "C1"] as const;
export type AcademyExcelMouseCell = "A1" | "B1" | "C1" | "D1" | "D4" | "D5";

/** Izgara yüzdesi — A1 sol üst, sonra B1 / C1 / D1. */
export const ACADEMY_EXCEL_MOUSE_CELL_POS: Record<AcademyExcelMouseCell, { x: number; y: number }> = {
  A1: { x: 16.5, y: 11 },
  B1: { x: 30.5, y: 11 },
  C1: { x: 44.5, y: 11 },
  D1: { x: 58.5, y: 11 },
  D4: { x: 78, y: 58 },
  D5: { x: 78, y: 72 },
};

/** 01_office_ai-3 Command dump — dağınık Word yığını. */
export const ACADEMY_OFFICE_AI_3_MOUSE_CELL_POS: Record<
  Extract<AcademyExcelMouseCell, "A1" | "B1" | "C1">,
  { x: number; y: number }
> = {
  A1: { x: 38, y: 30 },
  B1: { x: 36, y: 52 },
  C1: { x: 70, y: 58 },
};

/** 01_office_ai-3 Beat 3 — üç KPI kartı ızgarası. */
export const ACADEMY_OFFICE_AI_3_KPI_MOUSE_CELL_POS: Record<
  Extract<AcademyExcelMouseCell, "A1" | "B1" | "C1">,
  { x: number; y: number }
> = {
  A1: { x: 22, y: 50 },
  B1: { x: 50, y: 50 },
  C1: { x: 78, y: 50 },
};

/** 01_office_ai-4 Command — dağınık gelen kutusu satırları. */
export const ACADEMY_OFFICE_AI_4_MOUSE_CELL_POS: Record<
  Extract<AcademyExcelMouseCell, "A1" | "B1" | "C1">,
  { x: number; y: number }
> = {
  A1: { x: 34, y: 28 },
  B1: { x: 34, y: 44 },
  C1: { x: 34, y: 60 },
};

/** 01_office_ai-4 Beat 3 — etiketli sıfır kutu. */
export const ACADEMY_OFFICE_AI_4_ZERO_MOUSE_CELL_POS: Record<
  Extract<AcademyExcelMouseCell, "A1" | "B1" | "C1">,
  { x: number; y: number }
> = {
  A1: { x: 34, y: 28 },
  B1: { x: 34, y: 44 },
  C1: { x: 34, y: 60 },
};

export const ACADEMY_OFFICE_AI_3_MOUSE_EXTRA_CUE_IDS = ["cue-05", "cue-06"] as const;

const OFFSCREEN = { x: 74, y: 5 } as const;

/** Cue-04 açılışında A1’e süzülme. */
export const ACADEMY_EXCEL_MOUSE_GLIDE_SEC = 0.85 as const;
/** A1 varışında click ripple. */
export const ACADEMY_EXCEL_MOUSE_CLICK_SEC = 0.42 as const;
/** Sütun yürüyüşü adımı (sn). */
export const ACADEMY_EXCEL_MOUSE_STEP_SEC = 1.15 as const;

const WALK_START_PATTERN = /satır ve sütun/giu;
const L1_WALK_CELL_PATTERNS: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[] = [
  { cell: "A1", pattern: /ürün/giu },
  { cell: "B1", pattern: /tarih/giu },
  { cell: "C1", pattern: /tutar/giu },
];
const L2_WALK_CELL_PATTERNS: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[] = [
  { cell: "A1", pattern: /tarih/giu },
  { cell: "B1", pattern: /cari/giu },
  { cell: "D1", pattern: /tutar|toplam/giu },
];
const L3_WALK_CELL_PATTERNS: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[] = [
  { cell: "A1", pattern: /tek fikir|başlık/giu },
  { cell: "B1", pattern: /madde|fikir/giu },
  { cell: "C1", pattern: /görsel yönlendir/giu },
];
const L3_KPI_WALK_CELL_PATTERNS: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[] = [
  { cell: "A1", pattern: /kritik sayı|üç net odak|güçlü başlık/giu },
  { cell: "B1", pattern: /anahtar metin|odak noktası/giu },
  { cell: "C1", pattern: /ikincil|hiyerarşi/giu },
];
const L4_WALK_CELL_PATTERNS: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[] = [
  { cell: "A1", pattern: /etiketle|önem sırası/giu },
  { cell: "B1", pattern: /taslak yanıt/giu },
  { cell: "C1", pattern: /arşiv/giu },
];
const L4_ZERO_WALK_CELL_PATTERNS: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[] = [
  { cell: "A1", pattern: /142|okunmamış/giu },
  { cell: "B1", pattern: /sıfır|etiket/giu },
  { cell: "C1", pattern: /arşiv|taslak/giu },
];
const L5_WALK_CELL_PATTERNS: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[] = [
  { cell: "A1", pattern: /veri|yükle|tablo/giu },
  { cell: "D4", pattern: /kırmızı|21\.500|halüsinasyon/giu },
  { cell: "D5", pattern: /genel toplam|54\.650|sapma/giu },
];
const L5_VERIFIED_WALK_CELL_PATTERNS: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[] = [
  { cell: "D4", pattern: /21\.500|12\.500|yıldız/giu },
  { cell: "D5", pattern: /54\.650|50\.450|formül/giu },
  { cell: "A1", pattern: /doğrulan|dedektif/giu },
];
const L6_WALK_CELL_PATTERNS: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[] = [
  { cell: "A1", pattern: /takvim|cuma|otuz/giu },
  { cell: "B1", pattern: /ataş|excel|yükle/giu },
  { cell: "C1", pattern: /e-posta|slayt|gelen kutu/giu },
];
const L6_SYSTEM_WALK_CELL_PATTERNS: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[] = [
  { cell: "A1", pattern: /0–10|excel temizlik|excel ataş|üç blok/giu },
  { cell: "B1", pattern: /üç madde|10–20|slayt özet|slayt/giu },
  { cell: "C1", pattern: /e-posta sıfırlama|e-posta|20–30|gelen kutu/giu },
];

type AcademyExcelMouseCellPos = Partial<Record<AcademyExcelMouseCell, { x: number; y: number }>>;

type AcademyExcelMouseSpec = {
  cueId: string;
  extraCueIds?: readonly string[];
  cells: readonly AcademyExcelMouseCell[];
  walk: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[];
  extraWalk?: readonly { cell: AcademyExcelMouseCell; pattern: RegExp }[];
  pos?: AcademyExcelMouseCellPos;
  extraPos?: AcademyExcelMouseCellPos;
};

const MOUSE_BY_LESSON: Record<string, AcademyExcelMouseSpec> = {
  "01_office_ai-1": {
    cueId: ACADEMY_EXCEL_MOUSE_CUE_ID,
    cells: ACADEMY_EXCEL_MOUSE_CELLS,
    walk: L1_WALK_CELL_PATTERNS,
  },
  "01_office_ai-2": {
    cueId: ACADEMY_EXCEL_MOUSE_CUE_ID,
    cells: ACADEMY_OFFICE_AI_2_MOUSE_CELLS,
    walk: L2_WALK_CELL_PATTERNS,
  },
  "01_office_ai-3": {
    cueId: ACADEMY_EXCEL_MOUSE_CUE_ID,
    extraCueIds: ACADEMY_OFFICE_AI_3_MOUSE_EXTRA_CUE_IDS,
    cells: ACADEMY_OFFICE_AI_3_MOUSE_CELLS,
    walk: L3_WALK_CELL_PATTERNS,
    extraWalk: L3_KPI_WALK_CELL_PATTERNS,
    pos: ACADEMY_OFFICE_AI_3_MOUSE_CELL_POS,
    extraPos: ACADEMY_OFFICE_AI_3_KPI_MOUSE_CELL_POS,
  },
  "01_office_ai-4": {
    cueId: ACADEMY_EXCEL_MOUSE_CUE_ID,
    extraCueIds: ACADEMY_OFFICE_AI_3_MOUSE_EXTRA_CUE_IDS,
    cells: ACADEMY_OFFICE_AI_3_MOUSE_CELLS,
    walk: L4_WALK_CELL_PATTERNS,
    extraWalk: L4_ZERO_WALK_CELL_PATTERNS,
    pos: ACADEMY_OFFICE_AI_4_MOUSE_CELL_POS,
    extraPos: ACADEMY_OFFICE_AI_4_ZERO_MOUSE_CELL_POS,
  },
  "01_office_ai-5": {
    cueId: ACADEMY_EXCEL_MOUSE_CUE_ID,
    extraCueIds: ACADEMY_OFFICE_AI_3_MOUSE_EXTRA_CUE_IDS,
    cells: ACADEMY_OFFICE_AI_5_MOUSE_CELLS,
    walk: L5_WALK_CELL_PATTERNS,
    extraWalk: L5_VERIFIED_WALK_CELL_PATTERNS,
  },
  "01_office_ai-6": {
    cueId: ACADEMY_EXCEL_MOUSE_CUE_ID,
    extraCueIds: ACADEMY_OFFICE_AI_3_MOUSE_EXTRA_CUE_IDS,
    cells: ACADEMY_OFFICE_AI_6_MOUSE_CELLS,
    walk: L6_WALK_CELL_PATTERNS,
    extraWalk: L6_SYSTEM_WALK_CELL_PATTERNS,
  },
};

function mouseSpecFor(lessonKey: string): AcademyExcelMouseSpec | null {
  return MOUSE_BY_LESSON[lessonKey.trim()] ?? null;
}

export type AcademyExcelMouseLine = {
  cueId: string;
  text: string;
  start: number;
  end: number;
};

export type AcademyExcelMouseState = {
  visible: boolean;
  cell: AcademyExcelMouseCell;
  x: number;
  y: number;
  clicking: boolean;
};

type AcademyExcelMouseKeyframe = {
  t: number;
  cell: AcademyExcelMouseCell;
  x: number;
  y: number;
  click?: boolean;
};

function foldTr(text: string): string {
  return text.toLocaleLowerCase("tr-TR").replace(/\s+/gu, " ");
}

function clamp01(value: number): number {
  if (!(Number.isFinite(value))) {
    return 0;
  }
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) {
    return x >= edge1 ? 1 : 0;
  }
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function phraseHitTime(text: string, start: number, end: number, pattern: RegExp): number | null {
  const folded = foldTr(text);
  const span = Math.max(0, end - start);
  const len = Math.max(1, folded.length);
  const matcher = new RegExp(pattern.source, pattern.flags);
  const match = matcher.exec(folded);
  if (!match) {
    return null;
  }
  return start + (span * (match.index ?? 0)) / len;
}

function specCueIds(spec: AcademyExcelMouseSpec): readonly string[] {
  return spec.extraCueIds ? [spec.cueId, ...spec.extraCueIds] : [spec.cueId];
}

function posFor(
  cell: AcademyExcelMouseCell,
  spec?: AcademyExcelMouseSpec | null,
  extra = false,
): { x: number; y: number } {
  if (extra && spec?.extraPos?.[cell]) {
    return spec.extraPos[cell]!;
  }
  return spec?.pos?.[cell] ?? ACADEMY_EXCEL_MOUSE_CELL_POS[cell];
}

function pushKeyframe(
  frames: AcademyExcelMouseKeyframe[],
  next: AcademyExcelMouseKeyframe,
): void {
  const last = frames.at(-1);
  if (last && next.t < last.t + 0.05) {
    last.cell = next.cell;
    last.x = next.x;
    last.y = next.y;
    last.click = last.click || next.click;
    last.t = Math.max(last.t, next.t);
    return;
  }
  frames.push(next);
}

function appendCueMouseTrack(
  frames: AcademyExcelMouseKeyframe[],
  cue: { id: string; start: number; end: number },
  spec: AcademyExcelMouseSpec,
  lines: readonly AcademyExcelMouseLine[],
  extra: boolean,
): void {
  const walk = extra ? (spec.extraWalk ?? spec.walk) : spec.walk;
  const arrive = Math.min(cue.start + ACADEMY_EXCEL_MOUSE_GLIDE_SEC, cue.end);
  pushKeyframe(frames, {
    t: cue.start,
    cell: "A1",
    x: OFFSCREEN.x,
    y: OFFSCREEN.y,
  });
  pushKeyframe(frames, {
    t: arrive,
    cell: "A1",
    x: posFor("A1", spec, extra).x,
    y: posFor("A1", spec, extra).y,
    click: true,
  });
  const cueLines = lines.filter((line) => line.cueId === cue.id);
  const namedHits = walk.flatMap((row) => {
    const hits: AcademyExcelMouseKeyframe[] = [];
    for (const line of cueLines) {
      const hit = phraseHitTime(line.text, line.start, line.end, row.pattern);
      if (hit == null || hit < arrive) {
        continue;
      }
      const pos = posFor(row.cell, spec, extra);
      hits.push({ t: hit, cell: row.cell, x: pos.x, y: pos.y });
      break;
    }
    return hits;
  });
  if (namedHits.length >= 2) {
    for (const hit of namedHits) {
      pushKeyframe(frames, hit);
    }
    return;
  }
  let walkStart: number | null = null;
  for (const line of cueLines) {
    const hit = phraseHitTime(line.text, line.start, line.end, WALK_START_PATTERN);
    if (hit != null && hit >= arrive) {
      walkStart = hit;
      break;
    }
  }
  if (walkStart == null) {
    const second = cueLines[1];
    walkStart = second ? Math.max(arrive + 0.4, second.start + 1.2) : arrive + 2.4;
  }
  for (let index = 0; index < spec.cells.length; index += 1) {
    const cell = spec.cells[index]!;
    const t = Math.min(walkStart + index * ACADEMY_EXCEL_MOUSE_STEP_SEC, cue.end - 0.05);
    const pos = posFor(cell, spec, extra);
    pushKeyframe(frames, { t, cell, x: pos.x, y: pos.y });
  }
}

export function buildAcademyExcelMouseTrack(options: {
  lessonKey: string;
  cues: readonly { id: string; start: number; end: number }[];
  lines: readonly AcademyExcelMouseLine[];
}): readonly AcademyExcelMouseKeyframe[] {
  const spec = mouseSpecFor(options.lessonKey);
  if (!spec) {
    return [];
  }
  const frames: AcademyExcelMouseKeyframe[] = [];
  for (const cueId of specCueIds(spec)) {
    const cue = options.cues.find((row) => row.id === cueId);
    if (!cue) {
      continue;
    }
    appendCueMouseTrack(frames, cue, spec, options.lines, cueId !== spec.cueId);
  }
  return frames;
}

const TRACK_CACHE = new Map<string, readonly AcademyExcelMouseKeyframe[]>();

export function loadAcademyExcelMouseTrack(lessonKey: string): readonly AcademyExcelMouseKeyframe[] {
  const key = lessonKey.trim();
  const cached = TRACK_CACHE.get(key);
  if (cached) {
    return cached;
  }
  const track = buildAcademyExcelMouseTrack({
    lessonKey: key,
    cues: loadAcademyLessonPlaybackCues(key),
    lines: loadAcademyKaraokeStrip(key),
  });
  TRACK_CACHE.set(key, track);
  return track;
}

function clickingAt(frame: AcademyExcelMouseKeyframe | undefined, t: number): boolean {
  if (!frame?.click) {
    return false;
  }
  return t >= frame.t && t < frame.t + ACADEMY_EXCEL_MOUSE_CLICK_SEC;
}

export function academyExcelMouseState(
  lessonKey: string,
  currentTime: number,
): AcademyExcelMouseState | null {
  if (!mouseSpecFor(lessonKey)) {
    return null;
  }
  const spec = mouseSpecFor(lessonKey)!;
  const cues = loadAcademyLessonPlaybackCues(lessonKey);
  const track = loadAcademyExcelMouseTrack(lessonKey);
  if (track.length === 0) {
    return null;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  const inWindow = specCueIds(spec).some((cueId) => {
    const cue = cues.find((row) => row.id === cueId);
    return Boolean(cue && t >= cue.start && t < cue.end);
  });
  if (!inWindow) {
    return null;
  }
  let index = 0;
  while (index + 1 < track.length && track[index + 1]!.t <= t) {
    index += 1;
  }
  const from = track[index]!;
  const to = track[index + 1];
  if (!to) {
    return {
      visible: true,
      cell: from.cell,
      x: from.x,
      y: from.y,
      clicking: clickingAt(from, t),
    };
  }
  const u = smoothstep(from.t, to.t, t);
  const cell = u >= 0.45 ? to.cell : from.cell;
  return {
    visible: true,
    cell,
    x: from.x + (to.x - from.x) * u,
    y: from.y + (to.y - from.y) * u,
    clicking: clickingAt(from, t) || clickingAt(to, t),
  };
}

export function academyExcelMouseActiveCell(
  lessonKey: string,
  currentTime: number,
): AcademyExcelMouseCell | null {
  return academyExcelMouseState(lessonKey, currentTime)?.cell ?? null;
}
