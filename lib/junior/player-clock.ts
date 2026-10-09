/**
 * Junior ders oynatıcısının saati.
 * Süre, anlatım parçalarının karakter uzunluğundan gelir.
 * MP3 kasetinde pencereler gerçek duration’a ölçeklenir; adım currentTime + cümle penceresine kilitlenir.
 * Orantılı süre tahmini yedektir (pencere yokken).
 */

/** Anlatım metni yokken bir adımın süresi. */
export const JUNIOR_PLAYER_BEAT_MS = 3600;

/**
 * Yerel okuma hızına göre yaklaşık karakter/saniye.
 * Saat sesten yavaş akar; vurgu cümleyi kesmeden önce bitirmez.
 */
export const JUNIOR_PLAYER_CHARS_PER_SEC = 12;

/** Kısa cümle bir anda geçilmesin. */
export const JUNIOR_PLAYER_MIN_WINDOW_MS = 1400;

/**
 * Anlatım bandı. Saat saniyede 12 karakter sayar.
 * Alt sınır 5 dakika, hedef 7,5 dakika (7–8 dakika), üst sınır 12 dakika.
 */
export const JUNIOR_NARRATION_MIN_MS = 300_000;
export const JUNIOR_NARRATION_MAX_MS = 720_000;
export const JUNIOR_NARRATION_AIM_MS = 450_000;

export type JuniorPlayerPiece = {
  text: string;
  start: number;
  end: number;
  collapsedStart: number;
  collapsedEnd: number;
};

export type JuniorPlayerWindow = {
  index: number;
  text: string;
  startMs: number;
  endMs: number;
  noteStart: number;
  noteEnd: number;
};

export type JuniorPlayerTimeline = {
  durationMs: number;
  pieces: readonly JuniorPlayerPiece[];
  windows: readonly JuniorPlayerWindow[];
};

function windowMs(chars: number): number {
  return Math.max(
    JUNIOR_PLAYER_MIN_WINDOW_MS,
    Math.round((chars / JUNIOR_PLAYER_CHARS_PER_SEC) * 1000),
  );
}

function collectPieces(note: string): { text: string; start: number; end: number }[] {
  const pieces: { text: string; start: number; end: number }[] = [];
  let cursor = 0;
  for (const part of note.split(/\n+/)) {
    const paraAt = note.indexOf(part, cursor);
    const base = paraAt < 0 ? cursor : paraAt;
    cursor = base + part.length;
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const offset = part.indexOf(trimmed);
    const origin = base + (offset < 0 ? 0 : offset);
    let local = 0;
    for (const sentence of trimmed.split(/(?<=\p{L}[.!?…])\s+/u)) {
      const at = trimmed.indexOf(sentence, local);
      const start = origin + (at < 0 ? local : at);
      pieces.push({ text: sentence, start, end: start + sentence.length });
      local = (at < 0 ? local : at) + sentence.length;
    }
  }
  return pieces;
}

function mapPieces(note: string): JuniorPlayerPiece[] {
  const collapsed = note.replace(/\s+/g, " ").trim();
  let searchFrom = 0;
  return collectPieces(note).map((piece) => {
    const needle = piece.text.replace(/\s+/g, " ").trim();
    const at = needle ? collapsed.indexOf(needle, searchFrom) : -1;
    const collapsedStart = at >= 0 ? at : searchFrom;
    const collapsedEnd = collapsedStart + needle.length;
    searchFrom = collapsedEnd;
    return { ...piece, collapsedStart, collapsedEnd };
  });
}

function windowsFromChunks(chunks: readonly string[]): JuniorPlayerWindow[] {
  let noteCursor = 0;
  let ms = 0;
  return chunks.map((text, index) => {
    if (index > 0) {
      noteCursor += 1;
    }
    const noteStart = noteCursor;
    const noteEnd = noteStart + text.length;
    noteCursor = noteEnd;
    const durationMs = windowMs(text.length);
    const startMs = ms;
    ms += durationMs;
    return { index, text, startMs, endMs: ms, noteStart, noteEnd };
  });
}

export function juniorPlayerTimeline(
  note: string,
  chunks: readonly string[],
  beatCount: number,
): JuniorPlayerTimeline {
  const steps = Math.max(1, beatCount);
  const pieces = mapPieces(note);
  const spoken =
    chunks.length > 0
      ? chunks
      : pieces
          .map((piece) => piece.text.replace(/\s+/g, " ").trim())
          .filter((piece) => piece.length > 0);
  const windows = windowsFromChunks(spoken);
  const last = windows[windows.length - 1];
  const durationMs = last ? last.endMs : steps * JUNIOR_PLAYER_BEAT_MS;
  return { durationMs, pieces, windows };
}

export function juniorPlayerClockLabel(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) {
    return "0:00";
  }
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function juniorPlayerRangeLabel(elapsedMs: number, durationMs: number): string {
  return `${juniorPlayerClockLabel(elapsedMs)} / ${juniorPlayerClockLabel(durationMs)}`;
}

export function juniorPlayerStepLabel(beat: number, beatCount: number): string {
  const count = Math.max(1, beatCount);
  const current = Math.min(count, Math.max(1, beat + 1));
  return `Adım ${current} / ${count}`;
}

export function juniorPlayerClampMs(ms: number, durationMs: number): number {
  if (!Number.isFinite(ms) || durationMs <= 0) {
    return 0;
  }
  return Math.min(durationMs, Math.max(0, Math.round(ms)));
}

/**
 * Kaset bitiş kilidi — karar butonları yalnız burada açılır.
 * `audio.ended` veya `currentTime >= duration - 1` (1 sn tolerans).
 * Son adıma (12/12) girmek tek başına bitiş değildir.
 */
export function juniorPlayerHasReachedEnd(input: {
  ended?: boolean;
  currentTimeSec: number;
  durationSec: number;
}): boolean {
  if (input.ended) {
    return true;
  }
  const currentTimeSec = input.currentTimeSec;
  const durationSec = input.durationSec;
  if (
    !Number.isFinite(currentTimeSec) ||
    !Number.isFinite(durationSec) ||
    durationSec <= 0 ||
    currentTimeSec < 0
  ) {
    return false;
  }
  return currentTimeSec >= durationSec - 1;
}

/**
 * Görsel adımı cümle/zaman pencerelerine kilitler.
 * `pieceIndex` verilirse beat, liveCaption ile AYNI cue’dan türetilir (zero-delay; pencere tamponu yok).
 * Orantılı `elapsed/duration` tahmini yalnız pencere/parça yokken yedektir.
 */
export function juniorPlayerBeatIndex(
  elapsedMs: number,
  durationMs: number,
  beatCount: number,
  windows: readonly { endMs: number }[] = [],
  pieceIndex: number = -1,
  pieceCount: number = 0,
): number {
  if (beatCount <= 1) {
    return 0;
  }
  if (durationMs <= 0 || elapsedMs <= 0) {
    return 0;
  }
  if (elapsedMs >= durationMs) {
    return beatCount - 1;
  }
  // Cue SSOT: altyazı cümlesi değiştiği an beat de aynı milisaniyede kayar.
  if (pieceCount > 0 && pieceIndex >= 0) {
    return Math.min(beatCount - 1, Math.floor((pieceIndex * beatCount) / pieceCount));
  }
  if (windows.length > 0) {
    const wi = juniorPlayerWindowIndex(elapsedMs, windows);
    return Math.min(beatCount - 1, Math.floor((wi * beatCount) / windows.length));
  }
  return Math.min(beatCount - 1, Math.floor((elapsedMs / durationMs) * beatCount));
}

export type JuniorPlayerCue = {
  pieceIndex: number;
  text: string;
};

/**
 * Cue SSOT — sağ panel vurgusu ile sol karatahta / alt okuma cümlesi aynı kayıttan gelir.
 * `audio.currentTime` → elapsedMs → tek cümle indeksi + metin.
 */
export function juniorPlayerCueAt(elapsedMs: number, timeline: JuniorPlayerTimeline): JuniorPlayerCue | null {
  const pieceIndex = juniorPlayerActivePieceIndex(elapsedMs, timeline);
  if (pieceIndex < 0) {
    return null;
  }
  const text = timeline.pieces[pieceIndex]?.text.replace(/\s+/g, " ").trim() ?? "";
  if (!text) {
    return null;
  }
  return { pieceIndex, text };
}

/** SoftStage canlı karatahta metni: o anki cümle (piece). Pencere yedeği yalnız parça yokken. */
export function juniorPlayerLiveCaption(elapsedMs: number, timeline: JuniorPlayerTimeline): string {
  const cue = juniorPlayerCueAt(elapsedMs, timeline);
  if (cue) {
    return cue.text;
  }
  if (timeline.windows.length === 0) {
    return "";
  }
  const wi = juniorPlayerWindowIndex(elapsedMs, timeline.windows);
  return timeline.windows[wi]?.text.replace(/\s+/g, " ").trim() ?? "";
}

export function juniorPlayerWindowIndex(
  elapsedMs: number,
  windows: readonly { endMs: number }[],
): number {
  if (windows.length === 0) {
    return 0;
  }
  const index = windows.findIndex((window) => elapsedMs < window.endMs);
  return index < 0 ? windows.length - 1 : index;
}

/**
 * collapsed karakter imlecini cümle parçasına kilitler.
 * Boşluk aralığına düşünce bir sonraki cümleye geçmez; önceki cümlede kalır
 * (ses hâlâ o cümledeyken highlight/caption zıplamasın).
 */
function pieceIndexAtCollapsedCursor(
  cursor: number,
  pieces: readonly JuniorPlayerPiece[],
): number {
  if (pieces.length === 0) {
    return -1;
  }
  let found = 0;
  for (let index = 0; index < pieces.length; index += 1) {
    const piece = pieces[index];
    if (!piece) {
      continue;
    }
    if (cursor >= piece.collapsedStart && cursor < piece.collapsedEnd) {
      return index;
    }
    if (piece.collapsedStart <= cursor) {
      found = index;
    }
  }
  return found;
}

export function juniorPlayerActivePieceIndex(elapsedMs: number, timeline: JuniorPlayerTimeline): number {
  const { pieces, windows, durationMs } = timeline;
  if (pieces.length === 0) {
    return -1;
  }
  if (elapsedMs <= 0) {
    return 0;
  }
  if (durationMs > 0 && elapsedMs >= durationMs) {
    return pieces.length - 1;
  }
  if (windows.length === 0) {
    if (durationMs <= 0) {
      return 0;
    }
    const last = pieces[pieces.length - 1];
    const spanChars = last?.collapsedEnd ?? 0;
    if (spanChars <= 0) {
      return 0;
    }
    const cursor = Math.min(spanChars - 1, Math.max(0, (elapsedMs / durationMs) * spanChars));
    return pieceIndexAtCollapsedCursor(cursor, pieces);
  }
  const window = windows[juniorPlayerWindowIndex(elapsedMs, windows)] ?? windows[0];
  if (!window) {
    return 0;
  }
  const span = window.endMs - window.startMs;
  const ratio = span <= 0 ? 0 : Math.min(1, Math.max(0, (elapsedMs - window.startMs) / span));
  const noteSpan = window.noteEnd - window.noteStart;
  // Cümle sonundaki boşluğa düşmeyi engelle: imleci pencere içinde parçanın içine sıkıştır.
  const raw = window.noteStart + ratio * noteSpan;
  const cursor = noteSpan > 0 ? Math.min(window.noteEnd - 1e-6, Math.max(window.noteStart, raw)) : window.noteStart;
  return pieceIndexAtCollapsedCursor(cursor, pieces);
}
