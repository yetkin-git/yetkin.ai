/**
 * Ders teleprompter akışı — cue SSOT + bake timings.
 * Canlı mühürlü WAV’da saat HTMLAudio currentTime’dır.
 * Mühürlü parçada ekran metni `piece.text` fonetiğidir; `chunkIndex` dilim seçici değildir.
 * Kelime saati (`words`) varsa cümle ve vurgu o saate oturur.
 * Karakter/kelime oranlı paylaşım yalnız kelime saati yokken taslaktır.
 * Kelime saati varken bölüt tutmazsa oran üretilmez; parça saati ve dizi durur.
 */

import { splitAcademySpokenSentences } from "@/lib/academy/dialogue-timeline";
import {
  type AcademyLessonCue,
  loadAcademyLessonCues,
} from "@/lib/academy/lesson-cues";
import {
  type AcademySealedAudioPiece,
  type AcademySealedAudioTimings,
  type AcademySealedAudioWord,
  loadAcademySealedAudioTimings,
} from "@/lib/academy/lesson-audio-timings";
import { splitAcademyTtsBreathChunks } from "@/lib/academy/tts-breath-chunks";
import { applyAcademySpokenPhoneticsToDisplay } from "@/lib/academy/spoken-scripts/phonetics";

export type AcademyTeleprompterLineState = "past" | "active" | "future";

export type AcademyTeleprompterLine = {
  id: string;
  cueId: string;
  section: string;
  text: string;
  start: number;
  end: number;
  /** Mühürlü kelime saati. Yoksa cümle içi vurgu taslak orandır. */
  words?: readonly AcademySealedAudioWord[];
};

/** Karaoke altyazı — 16:9 sahnede en fazla 3–4 satır. */
export const ACADEMY_KARAOKE_CAPTION_MAX_WORDS = 36;
export const ACADEMY_KARAOKE_CAPTION_MAX_CHARS = 220;

function teleprompterWordCount(text: string): number {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(" ").filter((part) => part.length > 0).length;
}

export function academyLessonSequenceNumber(lessonKey: string): number | null {
  const match = /-(\d+)$/u.exec(lessonKey.trim());
  if (!match) {
    return null;
  }
  const value = Number(match[1]);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Sosyal medya, kodsuz chatbot ve prompt kursunun tamamı ve 5. bölüm sonrası: kısa karaoke bloğu. */
export function academyKaraokeCaptionsCompact(lessonKey: string): boolean {
  const key = lessonKey.trim();
  if (
    key.startsWith("03_social_media_ai-") ||
    key.startsWith("04_chatbot_nocode-") ||
    key.startsWith("05_prompt_practice-")
  ) {
    return true;
  }
  const sequence = academyLessonSequenceNumber(key);
  return sequence != null && sequence >= 5;
}

export function splitAcademyKaraokeCaptionBlocks(text: string): string[] {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return [];
  }
  const sentences = splitAcademySpokenSentences(trimmed);
  if (sentences.length === 0) {
    return [trimmed];
  }
  const blocks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    const overBudget =
      current.length > 0 &&
      (teleprompterWordCount(next) > ACADEMY_KARAOKE_CAPTION_MAX_WORDS ||
        next.length > ACADEMY_KARAOKE_CAPTION_MAX_CHARS);
    if (overBudget) {
      blocks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  }
  if (current) {
    blocks.push(current);
  }
  return blocks;
}

type SealedWordSegment = {
  spoken: readonly AcademySealedAudioWord[];
  tokens: readonly { text: string; glue: boolean }[];
};

/** Konuşulan kelimeleri ekran tokenlarına oturtur. Eşleşme yoksa null; karakter payı üretilmez. */
function segmentSealedWords(
  displayText: string,
  sealed: readonly AcademySealedAudioWord[],
): SealedWordSegment[] | null {
  const display = academyKaraokeTokenize(displayText);
  if (display.length === 0 || sealed.length === 0) {
    return null;
  }
  const segments: SealedWordSegment[] = [];
  let spokenCursor = 0;
  let tokenCursor = 0;
  while (tokenCursor < display.length) {
    let found: { spokenEnd: number; tokenEnd: number } | null = null;
    for (let spokenEnd = spokenCursor + 1; spokenEnd <= sealed.length; spokenEnd += 1) {
      const phrase = sealed
        .slice(spokenCursor, spokenEnd)
        .map((word) => word.text)
        .join(" ");
      const rendered = academyKaraokeTokenize(applyAcademySpokenPhoneticsToDisplay(phrase));
      if (rendered.length === 0) {
        continue;
      }
      const remaining = display.slice(tokenCursor, tokenCursor + rendered.length);
      if (remaining.length !== rendered.length) {
        continue;
      }
      const same = remaining.every((token, index) => token.text === rendered[index]!.text);
      if (!same) {
        continue;
      }
      found = { spokenEnd, tokenEnd: tokenCursor + rendered.length };
      break;
    }
    if (!found) {
      return null;
    }
    segments.push({
      spoken: sealed.slice(spokenCursor, found.spokenEnd),
      tokens: display.slice(tokenCursor, found.tokenEnd),
    });
    spokenCursor = found.spokenEnd;
    tokenCursor = found.tokenEnd;
  }
  if (spokenCursor !== sealed.length) {
    return null;
  }
  return segments;
}

function karaokeWordsFromSegments(
  lineId: string,
  segments: readonly SealedWordSegment[],
): AcademyKaraokeWord[] {
  const words: AcademyKaraokeWord[] = [];
  let tokenIndex = 0;
  for (const segment of segments) {
    const produced = segment.tokens;
    const slice = segment.spoken;
    if (slice.length === produced.length) {
      for (let index = 0; index < produced.length; index += 1) {
        const token = produced[index]!;
        const source = slice[index]!;
        words.push({
          id: `${lineId}:w${tokenIndex}`,
          text: token.text,
          glue: token.glue,
          start: source.start,
          end: source.end,
        });
        tokenIndex += 1;
      }
      continue;
    }
    if (produced.length === 1) {
      const token = produced[0]!;
      words.push({
        id: `${lineId}:w${tokenIndex}`,
        text: token.text,
        glue: token.glue,
        start: slice[0]!.start,
        end: slice[slice.length - 1]!.end,
      });
      tokenIndex += 1;
      continue;
    }
    const start = slice[0]!.start;
    const end = slice[slice.length - 1]!.end;
    for (const token of produced) {
      words.push({
        id: `${lineId}:w${tokenIndex}`,
        text: token.text,
        glue: token.glue,
        start,
        end,
      });
      tokenIndex += 1;
    }
  }
  return words;
}

function shareBlocksBySealedWords(
  line: AcademyTeleprompterLine,
  blocks: readonly string[],
): AcademyTeleprompterLine[] | null {
  const sealed = line.words;
  if (!sealed || sealed.length === 0) {
    return null;
  }
  const segments = segmentSealedWords(line.text, sealed);
  if (!segments) {
    return null;
  }
  const blockCounts = blocks.map((block) => academyKaraokeTokenize(block).length);
  if (blockCounts.reduce((sum, count) => sum + count, 0) !== segments.reduce((sum, segment) => sum + segment.tokens.length, 0)) {
    return null;
  }
  const next: AcademyTeleprompterLine[] = [];
  let segmentIndex = 0;
  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
    let need = blockCounts[blockIndex]!;
    if (need === 0) {
      return null;
    }
    const spoken: AcademySealedAudioWord[] = [];
    const blockSegments: SealedWordSegment[] = [];
    while (need > 0) {
      const segment = segments[segmentIndex];
      if (!segment || segment.tokens.length > need) {
        return null;
      }
      spoken.push(...segment.spoken);
      blockSegments.push(segment);
      need -= segment.tokens.length;
      segmentIndex += 1;
    }
    const timed = karaokeWordsFromSegments(line.id, blockSegments);
    if (timed.length === 0 || spoken.length === 0) {
      return null;
    }
    next.push({
      ...line,
      id: `${line.id}:${blockIndex}`,
      text: blocks[blockIndex]!,
      start: timed[0]!.start,
      end: timed[timed.length - 1]!.end,
      words: spoken,
    });
  }
  if (segmentIndex !== segments.length) {
    return null;
  }
  return next;
}

function shareTeleprompterLineByBlocks(
  line: AcademyTeleprompterLine,
  blocks: readonly string[],
): AcademyTeleprompterLine[] {
  if (line.words && line.words.length > 0) {
    if (blocks.length <= 1) {
      return [line];
    }
    return shareBlocksBySealedWords(line, blocks) ?? [line];
  }
  if (blocks.length <= 1) {
    return [line];
  }
  const weights = blocks.map((block) => Math.max(1, teleprompterWordCount(block)));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const span = Math.max(0, line.end - line.start);
  const next: AcademyTeleprompterLine[] = [];
  let cursor = line.start;
  for (let index = 0; index < blocks.length; index += 1) {
    const isLast = index === blocks.length - 1;
    const share = totalWeight > 0 ? weights[index]! / totalWeight : 1 / blocks.length;
    const end = isLast ? line.end : cursor + span * share;
    next.push({
      ...line,
      id: `${line.id}:${index}`,
      text: blocks[index]!,
      start: cursor,
      end,
    });
    cursor = end;
  }
  return next;
}

function expandTeleprompterLineIntoCaptionBlocks(line: AcademyTeleprompterLine): AcademyTeleprompterLine[] {
  return shareTeleprompterLineByBlocks(line, splitAcademyKaraokeCaptionBlocks(line.text));
}

export type AcademyKaraokeWord = {
  id: string;
  text: string;
  start: number;
  end: number;
  /** Kapanış noktalaması önceki kelimeye yapışır; flex `column-gap` iptal edilir. */
  glue: boolean;
};

export type AcademyKaraokeWordState = AcademyTeleprompterLineState;

/** Boşluksuz kapanış: `kelime.` / `»` / `)` — Türkçe noktalama önceki tokene yapışır. */
const KARAOKE_CLOSING_PUNCT_ONLY = /^[\p{Pe}\p{Pf}.,;:!?…]+$/u;

export function academyKaraokeShouldGlueToPrevious(token: string): boolean {
  return KARAOKE_CLOSING_PUNCT_ONLY.test(token);
}

export function academyKaraokeNormalizeLine(text: string): string {
  return text.replace(/\s+/gu, " ").trim();
}

/** Ekran metnini kelime + kapanış noktalamasına böler; boşluklar token değildir. */
export function academyKaraokeTokenize(text: string): readonly { text: string; glue: boolean }[] {
  const normalized = academyKaraokeNormalizeLine(text);
  if (!normalized) {
    return [];
  }
  return normalized
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part, index) => ({
      text: part,
      glue: index > 0 && academyKaraokeShouldGlueToPrevious(part),
    }));
}

/** Token dizisini boşluk kuralıyla geri birleştir — `join("")` yasaktır. */
export function academyKaraokeReconstructLine(
  words: readonly Pick<AcademyKaraokeWord, "text" | "glue">[],
): string {
  if (words.length === 0) {
    return "";
  }
  let out = words[0]!.text;
  for (let index = 1; index < words.length; index += 1) {
    const word = words[index]!;
    out += word.glue ? word.text : ` ${word.text}`;
  }
  return out;
}

/** Alt şerit. Kelime saati varsa cümle penceresi o saattir; yoksa parça saati cümlelere oranlanır. */
export function academyKaraokeStripLines(
  lines: readonly AcademyTeleprompterLine[],
): readonly AcademyTeleprompterLine[] {
  return lines.flatMap((line) => {
    const sentences = splitAcademySpokenSentences(line.text);
    return sentences.length === 0 ? [line] : shareTeleprompterLineByBlocks(line, sentences);
  });
}

export function loadAcademyKaraokeStrip(lessonKey: string): readonly AcademyTeleprompterLine[] {
  return academyKaraokeStripLines(loadAcademyTeleprompterFlow(lessonKey));
}

export function academyKaraokeWords(
  line: Pick<AcademyTeleprompterLine, "id" | "text" | "start" | "end" | "words">,
): readonly AcademyKaraokeWord[] {
  const sealed = line.words;
  if (sealed && sealed.length > 0) {
    const segments = segmentSealedWords(line.text, sealed);
    if (segments) {
      return karaokeWordsFromSegments(line.id, segments);
    }
    return sealed.map((word, index) => ({
      id: `${line.id}:w${index}`,
      text: word.text,
      glue: index > 0 && academyKaraokeShouldGlueToPrevious(word.text),
      start: word.start,
      end: word.end,
    }));
  }
  const tokens = academyKaraokeTokenize(line.text);
  if (tokens.length === 0) {
    return [];
  }
  const weights = tokens.map((token) => Math.max(1, token.text.length));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const span = Math.max(0, line.end - line.start);
  const words: AcademyKaraokeWord[] = [];
  let cursor = line.start;
  for (let index = 0; index < tokens.length; index += 1) {
    const isLast = index === tokens.length - 1;
    const share = totalWeight > 0 ? weights[index]! / totalWeight : 1 / tokens.length;
    const end = isLast ? line.end : cursor + span * share;
    const token = tokens[index]!;
    words.push({
      id: `${line.id}:w${index}`,
      text: token.text,
      glue: token.glue,
      start: cursor,
      end,
    });
    cursor = end;
  }
  return words;
}

export function academyKaraokeWordState(
  word: Pick<AcademyKaraokeWord, "start" | "end">,
  currentTime: number,
): AcademyKaraokeWordState {
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  if (t < word.start) {
    return "future";
  }
  if (t >= word.end) {
    return "past";
  }
  return "active";
}

/**
 * Dar sahnede aynı anda görünen karaoke penceresi.
 * 0.85rem ve ~360px genişlikte satır başına yaklaşık karakter; üç satır bütçesi.
 */
export const ACADEMY_KARAOKE_VISIBLE_MAX_LINES = 3;
export const ACADEMY_KARAOKE_VISIBLE_CHARS_PER_LINE = 42;

function karaokeVisibleWordWeight(word: Pick<AcademyKaraokeWord, "text" | "glue">): number {
  return Math.max(1, word.text.length) + (word.glue ? 0 : 1);
}

/**
 * Aktif kelimeyi içeren, en fazla 2–3 satırlık kelime aralığı.
 * Cümle bu bütçeye sığıyorsa tamamı durur; sığmıyorsa pencere aktif kelimeyle kayar.
 */
export function academyKaraokeVisibleWordRange(
  words: readonly Pick<AcademyKaraokeWord, "text" | "glue" | "start">[],
  currentTime: number,
  activeIndex: number | null,
  maxLines: number = ACADEMY_KARAOKE_VISIBLE_MAX_LINES,
  charsPerLine: number = ACADEMY_KARAOKE_VISIBLE_CHARS_PER_LINE,
): { start: number; end: number } {
  const count = words.length;
  if (count === 0) {
    return { start: 0, end: 0 };
  }
  const budget = Math.max(charsPerLine, maxLines * charsPerLine);
  let total = 0;
  for (let index = 0; index < count; index += 1) {
    total += karaokeVisibleWordWeight(words[index]!);
  }
  if (total <= budget) {
    return { start: 0, end: count };
  }

  const t = Number.isFinite(currentTime) ? currentTime : 0;
  let focus = activeIndex;
  if (focus == null || focus < 0 || focus >= count) {
    focus = 0;
    for (let index = 0; index < count; index += 1) {
      if (t >= words[index]!.start) {
        focus = index;
      }
    }
  }
  if (words[focus]?.glue && focus > 0) {
    focus -= 1;
  }

  let start = focus;
  let end = focus + 1;
  let used = karaokeVisibleWordWeight(words[focus]!);
  while (start > 0) {
    const previous = karaokeVisibleWordWeight(words[start - 1]!);
    if (used >= charsPerLine || used + previous > budget) {
      break;
    }
    start -= 1;
    used += previous;
  }
  while (end < count && used + karaokeVisibleWordWeight(words[end]!) <= budget) {
    used += karaokeVisibleWordWeight(words[end]!);
    end += 1;
  }
  if (start > 0 && words[start]?.glue) {
    start -= 1;
  }
  return { start, end };
}

/** Vurgu yalnız kelimenin kendi aralığındadır. Sessizlikte ilk kelimeye dönülmez. */
export function academyKaraokeActiveWordIndex(
  words: readonly Pick<AcademyKaraokeWord, "start" | "end">[],
  currentTime: number,
): number | null {
  for (let index = 0; index < words.length; index += 1) {
    if (academyKaraokeWordState(words[index]!, currentTime) === "active") {
      return index;
    }
  }
  return null;
}

function compactAcademyTeleprompterCaptions(
  lines: readonly AcademyTeleprompterLine[],
): readonly AcademyTeleprompterLine[] {
  return lines.flatMap((line) => expandTeleprompterLineIntoCaptionBlocks(line));
}

export function academyLessonCueScriptParagraphs(cue: AcademyLessonCue): readonly string[] {
  if (cue.paragraphs && cue.paragraphs.length > 0) {
    return cue.paragraphs;
  }
  const fallback = cue.text.replace(/\s+/gu, " ").trim();
  return fallback ? [fallback] : [];
}

export function buildAcademyTeleprompterFlow(
  cues: readonly AcademyLessonCue[],
): readonly AcademyTeleprompterLine[] {
  const lines: AcademyTeleprompterLine[] = [];
  for (const cue of cues) {
    const paragraphs = academyLessonCueScriptParagraphs(cue);
    if (paragraphs.length === 0) {
      continue;
    }
    const weights = paragraphs.map((paragraph) => Math.max(1, teleprompterWordCount(paragraph)));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const span = Math.max(0, cue.end - cue.start);
    let cursor = cue.start;
    for (let index = 0; index < paragraphs.length; index += 1) {
      const isLast = index === paragraphs.length - 1;
      const share = totalWeight > 0 ? weights[index]! / totalWeight : 1 / paragraphs.length;
      const end = isLast ? cue.end : cursor + span * share;
      lines.push({
        id: `${cue.id}:${index}`,
        cueId: cue.id,
        section: cue.section,
        text: applyAcademySpokenPhoneticsToDisplay(paragraphs[index]!),
        start: cursor,
        end,
      });
      cursor = end;
    }
  }
  return lines;
}

function pieceLineId(piece: Pick<AcademySealedAudioPiece, "cueId" | "cueParagraphIndex" | "chunkIndex" | "index">): string {
  return `${piece.cueId}:${piece.cueParagraphIndex}:${piece.chunkIndex}:${piece.index}`;
}

function cueSectionById(cues: readonly AcademyLessonCue[], cueId: string): string {
  return cues.find((cue) => cue.id === cueId)?.section ?? "";
}

/**
 * Mühürlü parça ekranı. `chunkIndex` kardeş sırası değildir
 * (`01_office_ai-1` ikinci parça `chunkIndex: 1` iken paragrafın ilk dilimidir).
 * Cue paragrafını o indeksten kesmek anlatılan cümleyi kaydırır.
 * Ekran, konuşulan `piece.text` ile fonetik ekran teriminin aynı metnidir.
 */
function overlayCueDisplayText(piece: Pick<AcademySealedAudioPiece, "text">): string {
  return applyAcademySpokenPhoneticsToDisplay(piece.text.trim());
}

export function buildAcademyTeleprompterFlowFromTimings(
  cues: readonly AcademyLessonCue[],
  timings: AcademySealedAudioTimings,
): readonly AcademyTeleprompterLine[] | null {
  if (timings.pieces.length === 0) {
    return null;
  }
  if (timings.pieces.every((piece) => piece.text.trim().length > 0)) {
    return timings.pieces.map((piece) => ({
      id: pieceLineId(piece),
      cueId: piece.cueId,
      section: cueSectionById(cues, piece.cueId),
      text: overlayCueDisplayText(piece),
      start: piece.start,
      end: piece.end,
      ...(piece.words && piece.words.length > 0 ? { words: piece.words } : {}),
    }));
  }
  const rows: { cueId: string; section: string; text: string }[] = [];
  for (const cue of cues) {
    for (const text of academyLessonCueScriptParagraphs(cue)) {
      rows.push({ cueId: cue.id, section: cue.section, text });
    }
  }
  if (rows.length > 0 && rows.length === timings.pieces.length) {
    const lines: AcademyTeleprompterLine[] = [];
    for (let index = 0; index < timings.pieces.length; index += 1) {
      const piece = timings.pieces[index]!;
      const row = rows[index]!;
      if (piece.cueId !== row.cueId) {
        return null;
      }
      lines.push({
        id: pieceLineId(piece),
        cueId: row.cueId,
        section: row.section,
        text: applyAcademySpokenPhoneticsToDisplay(row.text),
        start: piece.start,
        end: piece.end,
      });
    }
    return lines;
  }
  const planned: { cueId: string; section: string; text: string }[] = [];
  for (const cue of cues) {
    for (const paragraph of academyLessonCueScriptParagraphs(cue)) {
      for (const text of splitAcademyTtsBreathChunks(paragraph)) {
        planned.push({ cueId: cue.id, section: cue.section, text });
      }
    }
  }
  if (planned.length === 0 || planned.length !== timings.pieces.length) {
    return null;
  }
  const lines: AcademyTeleprompterLine[] = [];
  for (let index = 0; index < timings.pieces.length; index += 1) {
    const piece = timings.pieces[index]!;
    const row = planned[index]!;
    if (piece.cueId !== row.cueId) {
      return null;
    }
    lines.push({
      id: pieceLineId(piece),
      cueId: row.cueId,
      section: row.section,
      text: applyAcademySpokenPhoneticsToDisplay(row.text),
      start: piece.start,
      end: piece.end,
    });
  }
  return lines;
}

export function loadAcademyTeleprompterFlow(lessonKey: string): readonly AcademyTeleprompterLine[] {
  const cues = loadAcademyLessonCues(lessonKey);
  const timings = loadAcademySealedAudioTimings(lessonKey);
  const compactCaptions = academyKaraokeCaptionsCompact(lessonKey);
  if (timings) {
    const timed = buildAcademyTeleprompterFlowFromTimings(cues, timings);
    if (timed) {
      return compactCaptions ? compactAcademyTeleprompterCaptions(timed) : timed;
    }
  }
  const flow = buildAcademyTeleprompterFlow(cues);
  return compactCaptions ? compactAcademyTeleprompterCaptions(flow) : flow;
}

/** Saat saniyedir (JSON üç ondalık). Üst üste binen pencerede en dar aralık kazanır. */
export function academyTeleprompterActiveLineIndex(
  lines: readonly Pick<AcademyTeleprompterLine, "start" | "end">[],
  currentTime: number,
): number | null {
  if (lines.length === 0) {
    return null;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  const first = lines[0]!;
  if (t < first.start) {
    return null;
  }
  let best: number | null = null;
  let bestSpan = Number.POSITIVE_INFINITY;
  let lastHit: number | null = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    const span = line.end - line.start;
    if (t >= line.start && t < line.end && span < bestSpan) {
      best = index;
      bestSpan = span;
    }
    if (t >= line.end) {
      lastHit = index;
    }
  }
  return best ?? lastHit ?? 0;
}

export function academyTeleprompterLineState(
  line: Pick<AcademyTeleprompterLine, "start" | "end">,
  currentTime: number,
  activeIndex: number | null,
  lineIndex: number,
): AcademyTeleprompterLineState {
  if (activeIndex == null) {
    return currentTime < line.start ? "future" : "past";
  }
  if (lineIndex === activeIndex) {
    return "active";
  }
  return lineIndex < activeIndex ? "past" : "future";
}

/** Karaoke altyazı tercihi — Temiz Sahne Modu localStorage. */
export const ACADEMY_KARAOKE_CAPTIONS_STORAGE_KEY = "academy_karaoke_captions" as const;
export const ACADEMY_KARAOKE_CAPTIONS_DEFAULT = true;

export function parseStoredAcademyKaraokeCaptions(raw: string | null): boolean {
  if (raw == null) {
    return ACADEMY_KARAOKE_CAPTIONS_DEFAULT;
  }
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "on") {
    return true;
  }
  if (value === "0" || value === "false" || value === "off") {
    return false;
  }
  return ACADEMY_KARAOKE_CAPTIONS_DEFAULT;
}

export function serializeAcademyKaraokeCaptions(enabled: boolean): "1" | "0" {
  return enabled ? "1" : "0";
}

export function readAcademyKaraokeCaptionsFromStorage(): boolean {
  if (typeof window === "undefined") {
    return ACADEMY_KARAOKE_CAPTIONS_DEFAULT;
  }
  try {
    return parseStoredAcademyKaraokeCaptions(
      window.localStorage.getItem(ACADEMY_KARAOKE_CAPTIONS_STORAGE_KEY),
    );
  } catch {
    return ACADEMY_KARAOKE_CAPTIONS_DEFAULT;
  }
}

export function writeAcademyKaraokeCaptionsToStorage(enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      ACADEMY_KARAOKE_CAPTIONS_STORAGE_KEY,
      serializeAcademyKaraokeCaptions(enabled),
    );
  } catch {
    /* kota / gizli tarama — tercih oturumda kalır */
  }
}
