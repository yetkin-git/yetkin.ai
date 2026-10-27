/**
 * Junior ders oynatıcısının saati.
 * Pencere tahmini karakter uzunluğundandır. Bu tahmin mühürlü pilotun kapısı değildir.
 * Pilot mühür süresi MP3 başlığından okunur (`juniorPilotNarrationMs`).
 * MP3 kasetinde pencereler gerçek duration’a ölçeklenir; adım currentTime + cümle penceresine kilitlenir.
 */

/** Anlatım metni yokken bir adımın süresi. */
export const JUNIOR_PLAYER_BEAT_MS = 3600;

/**
 * Yerel okuma hızına göre yaklaşık karakter/saniye (tane tane çocuk anlatım temposu).
 * Saat sesten yavaş akar; vurgu cümleyi kesmeden önce bitirmez.
 */
export const JUNIOR_PLAYER_CHARS_PER_SEC = 7;

/** Kısa cümle bir anda geçilmesin. */
export const JUNIOR_PLAYER_MIN_WINDOW_MS = 1400;

/**
 * Anlatım bandı. Süre yapay metinle değil, tane tane konuşma temposuyla sağlanır.
 * Alt sınır 3 dakika (180 sn), hedef 7,5 dakika, üst sınır 12 dakika.
 */
export const JUNIOR_NARRATION_MIN_MS = 180_000;
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

export type JuniorStepAnchor = {
  beat: number;
  startMs: number;
  text: string;
};

/** Defter / cümle işareti. Kaset bu damgada kendiliğinden durmaz. */
export const JUNIOR_THINK_HOLD_HINT =
  "Notunu al / Cümleni kur. Hazır olduğunda 'Devam Et' düğmesine bas";

export const JUNIOR_HARD_PAUSE_BUTTON = "Devam Et";

export type JuniorPauseKind = "notebook" | "turn" | "attention";

/** Anlatım içi dikkat kartı. Yıldız kaseti durdurmaz; metin senaryodan gelir. */
export const JUNIOR_TURN_CARD_TITLE = "Sıra Sende";
export const JUNIOR_TURN_CARD_KICKER = "Küçük Soru";

/** Yıldız simgesi bu kadar parıldar. 3 ile 5 saniye arasındadır. */
export const JUNIOR_STAR_PULSE_MS = 4_000;

/**
 * Oynatma kafası bir zaman çubuğu işaretini yeni geçtiyse o işaretler döner.
 * Geri sarma bu listeye girmez. İşaret kaseti durdurmaz.
 */
export function juniorMarkerCrossings<T extends { endMs: number }>(
  pauses: readonly T[],
  previousMs: number,
  ms: number,
  durationMs: number,
): T[] {
  if (durationMs <= 0 || ms < previousMs) {
    return [];
  }
  return pauses.filter(
    (pause) =>
      pause.endMs < durationMs - 80 &&
      previousMs < pause.endMs &&
      ms + 30 >= pause.endMs,
  );
}

/**
 * Oynatma kafası bir yıldız durağını yeni geçtiyse o duraklar döner.
 * Geri sarma ve defter / dikkat durakları bu listeye girmez.
 */
export function juniorStarCrossings<T extends { endMs: number; kind: JuniorPauseKind }>(
  pauses: readonly T[],
  previousMs: number,
  ms: number,
  durationMs: number,
): T[] {
  return juniorMarkerCrossings(pauses, previousMs, ms, durationMs).filter(
    (pause) => pause.kind === "turn",
  );
}

/** Oynatma kafasının gerisinde kalan son işaret. Henüz geçilmemiş işaret dönmez. */
export function juniorMarkerAt<T extends { endMs: number }>(
  pauses: readonly T[],
  ms: number,
): T | null {
  let found: T | null = null;
  for (const pause of pauses) {
    if (pause.endMs <= ms + 80 && (!found || pause.endMs > found.endMs)) {
      found = pause;
    }
  }
  return found;
}

/** Parıldama, durağı geçtikten sonra kısa bir pencerede kalır. */
export function juniorStarShouldGlow(endMs: number, ms: number): boolean {
  return ms >= endMs && ms - endMs <= JUNIOR_STAR_PULSE_MS;
}

/** Dikkat kartının düğmesi. Kart açıkken kaset akmaya devam eder. */
export const JUNIOR_ATTENTION_BUTTON = "Anladım! ➔";

/**
 * Yönlendirme eylemi.
 * Deftere yaz, cümle kur ve «Söz sende» defter kartıdır.
 * «Sıra sende» ve «Küçük soru» dikkat kartıdır.
 * Öğretim gövdesindeki «cümle kurmak» pay açmaz.
 */
export function juniorPauseKind(text: string): JuniorPauseKind | null {
  const folded = normalizeCue(text);
  if (folded.includes("kendi cümlenle tek bir cümleyle söyle")) {
    return "notebook";
  }
  if (/^(?:şimdi\s+)?(?:sen\s+)?bir cümle kur\b/u.test(folded)) {
    return "notebook";
  }
  if (/^söz sende\b/u.test(folded)) {
    return "notebook";
  }
  if (/(?<![\p{L}])defter(?:in)?e yaz\b/u.test(folded)) {
    return "notebook";
  }
  if (/(?<![\p{L}])notunu al\b/u.test(folded)) {
    return "notebook";
  }
  if (/^(?:şimdi\s+)?sıra sende\b/u.test(folded) || folded.startsWith("küçük soru")) {
    return "turn";
  }
  return null;
}

function normalizeCue(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLocaleLowerCase("tr-TR");
}

function pieceStartMs(piece: JuniorPlayerPiece, windows: readonly JuniorPlayerWindow[]): number {
  const window =
    windows.find((row) => piece.collapsedStart >= row.noteStart && piece.collapsedStart < row.noteEnd) ??
    windows[0];
  if (!window) {
    return 0;
  }
  const noteSpan = window.noteEnd - window.noteStart;
  const span = window.endMs - window.startMs;
  const ratio = noteSpan <= 0 ? 0 : (piece.collapsedStart - window.noteStart) / noteSpan;
  const raw = window.startMs + Math.min(1, Math.max(0, ratio)) * span;
  let ms = Math.round(raw);
  if (span > 0 && noteSpan > 0) {
    const cursor = window.noteStart + ((ms - window.startMs) / span) * noteSpan;
    if (cursor < piece.collapsedStart) {
      ms += 1;
    }
  }
  return Math.max(window.startMs, ms);
}

const STEP_CLOSER = "tebrikler çocuklar! harika bir iş çıkardık.";

function distinctiveStep(step: string): string {
  return normalizeCue(step).replace(STEP_CLOSER, "").trim();
}

function isSharedCloser(text: string): boolean {
  const folded = normalizeCue(text).replace(/[.!]+$/u, "").trim();
  return (
    folded === "tebrikler çocuklar" ||
    folded === "harika bir iş çıkardık" ||
    folded === "tebrikler çocuklar harika bir iş çıkardık"
  );
}

/**
 * `buildSteps` maddesini kaset sırasında, kendi cümlesinin `startMs` değerine kilitler.
 * Ortak kapanış («Tebrikler çocuklar») adım sayılmaz. Eşleşme ileriye bakar; geri sarmaz.
 * Eşleşme yoksa o adım çapası boş kalır.
 */
export function juniorPlayerStepAnchors(
  steps: readonly string[],
  timeline: JuniorPlayerTimeline,
): JuniorStepAnchor[] {
  let cursor = 0;
  const anchors: JuniorStepAnchor[] = [];
  for (let beat = 0; beat < steps.length; beat += 1) {
    const body = distinctiveStep(steps[beat] ?? "");
    if (body.length < 8) {
      continue;
    }
    const sentence = body.split(/(?<=\p{L}[.!?…])\s+/u)[0] ?? body;
    const needle = sentence.slice(0, Math.min(36, sentence.length));
    const head = needle.slice(0, Math.min(16, needle.length));
    if (head.length < 8) {
      continue;
    }
    let found = -1;
    for (let index = cursor; index < timeline.pieces.length; index += 1) {
      const text = normalizeCue(timeline.pieces[index]?.text ?? "");
      if (text.length < 8 || isSharedCloser(text)) {
        continue;
      }
      const hit = text.includes(head) || (text.length >= 12 && head.startsWith(text.slice(0, 12)));
      if (hit) {
        found = index;
        break;
      }
    }
    const piece = found >= 0 ? timeline.pieces[found] : undefined;
    if (!piece || found < 0) {
      continue;
    }
    cursor = found + 1;
    const previous = anchors[anchors.length - 1];
    let startMs = pieceStartMs(piece, timeline.windows);
    if (previous && startMs <= previous.startMs) {
      startMs = previous.startMs + 1;
    }
    anchors.push({ beat, startMs, text: piece.text });
  }
  return anchors;
}

/** Başlamış adımlar içinde en yüksek adım. Sahne geri sarılmaz. */
export function juniorPlayerBeatFromAnchors(
  elapsedMs: number,
  beatCount: number,
  anchors: readonly JuniorStepAnchor[],
): number {
  if (beatCount <= 1 || anchors.length === 0 || elapsedMs <= 0) {
    return 0;
  }
  let beat = 0;
  for (const anchor of anchors) {
    if (elapsedMs >= anchor.startMs && anchor.beat >= beat && anchor.beat < beatCount) {
      beat = anchor.beat;
    }
  }
  return beat;
}

/**
 * İleri / geri adım. Hedef, ekranda görünen adımdan sonraki veya önceki çapadır.
 * Çapası olmayan ara adım atlanır; uçta `null` döner ve etiket yerinde kalır.
 */
export function juniorPlayerNeighborStepMs(input: {
  beat: number;
  beatCount: number;
  delta: -1 | 1;
  anchors: readonly JuniorStepAnchor[];
}): number | null {
  const count = Math.max(1, Math.floor(input.beatCount));
  if (!Number.isFinite(input.beat) || (input.delta !== -1 && input.delta !== 1)) {
    return null;
  }
  const byBeat = new Map<number, number>();
  byBeat.set(0, 0);
  for (const anchor of input.anchors) {
    if (!Number.isInteger(anchor.beat) || anchor.beat <= 0 || anchor.beat >= count) {
      continue;
    }
    if (!Number.isFinite(anchor.startMs)) {
      continue;
    }
    const startMs = Math.max(0, Math.round(anchor.startMs));
    const previous = byBeat.get(anchor.beat);
    if (previous === undefined || startMs < previous) {
      byBeat.set(anchor.beat, startMs);
    }
  }
  const marks = [...byBeat.entries()]
    .map(([beat, startMs]) => ({ beat, startMs }))
    .sort((left, right) => left.beat - right.beat);
  const current = Math.min(count - 1, Math.max(0, Math.floor(input.beat)));
  let index = 0;
  for (let cursor = 0; cursor < marks.length; cursor += 1) {
    if ((marks[cursor]?.beat ?? 0) <= current) {
      index = cursor;
    }
  }
  const next = marks[index + input.delta];
  if (!next || next.beat === marks[index]?.beat) {
    return null;
  }
  return next.startMs;
}

export type JuniorCuePause = {
  endMs: number;
  kind: JuniorPauseKind;
  /** Dikkat kartının okunacak gövdesi. Diğer duraklarda boş. */
  attentionText?: string;
  /** Bu ana kadar aynı kart yeniden açılmaz. */
  attentionUntilMs?: number;
};

export type JuniorCuePauseOptions = {
  /** Dikkat kartının cümlesi. Damga zaman çubuğunda durur; kaset kendiliğinden durmaz. */
  attention?: (text: string) => boolean;
  /** Dikkat gövdesi bu cümlede biter. */
  attentionStop?: (text: string) => boolean;
};

function cleanPiece(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Her yönlendirme cümlesinin zaman damgası.
 * İşaret zaman çubuğunda durur. Kaset bu damgada kendiliğinden durmaz.
 * Dersin son milisaniyesi kart açmaz.
 */
export function juniorCuePauses(
  timeline: JuniorPlayerTimeline,
  options?: JuniorCuePauseOptions,
): JuniorCuePause[] {
  const pauses: JuniorCuePause[] = [];
  for (let index = 0; index < timeline.pieces.length; index += 1) {
    const piece = timeline.pieces[index];
    const text = piece?.text ?? "";
    if (piece && options?.attention?.(text)) {
      const startMs = pieceStartMs(piece, timeline.windows);
      const parts = [cleanPiece(text)];
      let untilMs = timeline.durationMs;
      const following = timeline.pieces[index + 1];
      untilMs = following ? pieceStartMs(following, timeline.windows) : timeline.durationMs;
      for (let cursor = index + 1; cursor < timeline.pieces.length; cursor += 1) {
        const nextPiece = timeline.pieces[cursor];
        if (!nextPiece) {
          break;
        }
        const nextText = cleanPiece(nextPiece.text);
        if (!nextText || options?.attentionStop?.(nextText) || juniorPauseKind(nextText)) {
          untilMs = pieceStartMs(nextPiece, timeline.windows);
          break;
        }
        parts.push(nextText);
        const after = timeline.pieces[cursor + 1];
        untilMs = after ? pieceStartMs(after, timeline.windows) : timeline.durationMs;
      }
      if (startMs >= timeline.durationMs - 80) {
        continue;
      }
      const card: JuniorCuePause = {
        endMs: startMs,
        kind: "attention",
        attentionText: parts.join(" "),
        attentionUntilMs: Math.max(startMs, untilMs),
      };
      const previous = pauses[pauses.length - 1];
      if (previous && Math.abs(previous.endMs - startMs) < 80) {
        previous.kind = "attention";
        previous.attentionText = card.attentionText;
        previous.attentionUntilMs = card.attentionUntilMs;
        continue;
      }
      pauses.push(card);
      continue;
    }
    const kind = juniorPauseKind(text);
    if (!kind) {
      continue;
    }
    const next = timeline.pieces[index + 1];
    const endMs = next ? pieceStartMs(next, timeline.windows) : timeline.durationMs;
    const previous = pauses[pauses.length - 1];
    if (previous && Math.abs(previous.endMs - endMs) < 80) {
      if (kind === "notebook" && previous.kind !== "attention") {
        previous.kind = "notebook";
      }
      continue;
    }
    pauses.push({ endMs, kind });
  }
  return pauses;
}

/**
 * İlk yönlendirme cümlesinin bitişi.
 * İşaret görseldir; sonraki cümle kendiliğinden kesilmez.
 */
export function juniorThinkHoldEndMs(timeline: JuniorPlayerTimeline): number | null {
  const first = juniorCuePauses(timeline)[0];
  return first ? first.endMs : null;
}

/**
 * Görsel adımı cümle/zaman pencerelerine kilitler.
 * Adım çapası varsa beat, o cümlenin `startMs` değeridir. `cümleSayısı / 12` formülü yalnız çapa yokken yedektir.
 * `pieceIndex` verilirse ve çapa yoksa beat, liveCaption ile AYNI cue’dan türetilir (zero-delay; pencere tamponu yok).
 * Orantılı `elapsed/duration` tahmini yalnız pencere/parça yokken yedektir.
 */
export function juniorPlayerBeatIndex(
  elapsedMs: number,
  durationMs: number,
  beatCount: number,
  windows: readonly { endMs: number }[] = [],
  pieceIndex: number = -1,
  pieceCount: number = 0,
  anchors: readonly JuniorStepAnchor[] = [],
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
  if (anchors.length > 0) {
    return juniorPlayerBeatFromAnchors(elapsedMs, beatCount, anchors);
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

/**
 * Karakter saati, kasetin gerçek süresine ölçeklenir.
 * Parça metni yerinde kalır. Adım çapası aynı cümlededir; milisaniye katsayıyla kayar.
 */
export function scaleJuniorPlayerWindows(
  windows: readonly JuniorPlayerWindow[],
  fromMs: number,
  toMs: number,
): JuniorPlayerWindow[] {
  if (fromMs <= 0 || toMs <= 0 || fromMs === toMs) {
    return windows.map((window) => ({ ...window }));
  }
  const factor = toMs / fromMs;
  return windows.map((window) => ({
    ...window,
    startMs: Math.round(window.startMs * factor),
    endMs: Math.round(window.endMs * factor),
  }));
}

export function scaleJuniorPlayerTimeline(
  base: JuniorPlayerTimeline,
  realDurationMs: number,
): JuniorPlayerTimeline {
  if (realDurationMs <= 0) {
    return base;
  }
  return {
    durationMs: realDurationMs,
    pieces: base.pieces,
    windows: scaleJuniorPlayerWindows(base.windows, base.durationMs, realDurationMs),
  };
}
