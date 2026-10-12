/**
 * SM-103 oynatıcı saati.
 * Parça önbelleğindeki WAV süreleri, fırındaki 0.4 sn sessizlik ve yayın MP3 süresi slayt geçişini kilitler.
 * Görsel API yok. Yazmak için --write.
 *
 *   npx tsx scripts/seal-sm103-player-clock.ts
 *   npx tsx scripts/seal-sm103-player-clock.ts --write
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SM103_CINEMA_LESSONS } from "@/lib/academy/curricula/sm-103/cinema-slides";
import { SM103_SECTION_MAP } from "@/lib/academy/curricula/sm-103/sections";
import { cleanAcademySpokenTextForTts } from "@/lib/academy/lesson-body";
import { ACADEMY_TTS_PARAGRAPH_PAUSE_SEC } from "@/lib/academy/media-release-seal";
import { expandAcademyTtsSkipPreventer } from "@/lib/academy/spoken-scripts";
import {
  academyLessonRequestTargetForCourse,
  packAcademyTtsLessonRequests,
  splitAcademyTtsBreathChunks,
} from "@/lib/academy/tts-breath-chunks";
import { pcmWavDurationSec } from "@/lib/kernel/ai/pcm-wav";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

const ROOT = process.cwd();
const SENTENCE_BOUNDARY = /(?<=(?<!\d)\.|[!?…])\s+/u;
const PAUSE_SEC = ACADEMY_TTS_PARAGRAPH_PAUSE_SEC;
const PLAYER_AUDIO_DIR = join(ROOT, "public", "media", "academy", "audio", "03_social_media_ai");

/**
 * Beş sinema karesi. Başlık, konuşma metnindeki `##` satırıdır.
 * Cue 0 selam ve başlıksız açılıştır.
 */
const HEADING_CUE: Record<number, Record<string, number>> = {
  1: {
    "Önce şu gerçek": 1,
    "Yanlış istem ne getirir": 1,
    "Üç satırlık künye": 2,
    "Kutuyu yönetmen yap": 3,
    "Cebine koyacağın kalıp": 4,
    "Toparlayalım": 4,
  },
  2: {
    "Fotoğrafçı gibi konuşmak": 1,
    "Yanlış ve doğru": 2,
    "Hangi biçimde isteyeceksin": 2,
    "Gerçek ürün mü, hayali sahne mi": 2,
    "Üç kontrol": 3,
    "Üç deneme kuralı": 4,
    Kalıp: 4,
  },
  3: {
    "Beş farklı dükkân sorunu": 0,
    "Birinci alışkanlık: stil cümlesi": 1,
    "İkinci alışkanlık: üç renk": 2,
    "Üçüncü alışkanlık: referans görsel": 2,
    "Yanlış ve doğru": 3,
    "Beş karelik set": 3,
    "Sırıtan kareyi nasıl düzeltirsin": 4,
    "İnsan eli uyarısı": 4,
    Kalıp: 4,
  },
  4: {
    "Üç saniyede ne oluyor": 1,
    "Bir sahne, bir hareket": 2,
    "Kareden video yapmak": 2,
    "Kamera hareketi menüsü": 2,
    "Dört kontrol": 3,
    "İlk kare ve son kare": 3,
    "Dikey çerçeve": 3,
    Kalıp: 4,
  },
  5: {
    "Kimse sesi açmıyor": 0,
    "Ekran yazısı: az, büyük, kısa": 1,
    "Açıklama metni": 2,
    "İlk satırın işi": 3,
    "Kendi sesini bulmak": 4,
    "Müzik meselesi": 4,
    Kalıp: 4,
  },
  6: {
    "Bir hafta, beş gönderi": 1,
    "Bir akşamda üretmek": 1,
    "Yayından önce beş soru": 2,
    "Yanlış ve doğru": 3,
    "Haftanın sonunda ne bakacaksın": 4,
    Kalıp: 4,
    "Son söz": 4,
  },
};

type TaggedParagraph = {
  cueIndex: number;
  paragraphIndex: number;
  text: string;
};

type TaggedAtom = TaggedParagraph & { text: string };

type CueSegment = {
  cueIndex: number;
  paragraphIndex: number;
  text: string;
};

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function normalize(text: string): string {
  return text.replace(/\s+/gu, " ").trim();
}

function spokenParts(markdown: string): string[] {
  const stripped = markdown
    .replace(/<!--[\s\S]*?-->/gu, "\n\n")
    .replace(/^#{1,6}\s+.*$/gmu, "")
    .replace(/\*\*([^*]+)\*\*/gu, "$1")
    .replace(/\*([^*]+)\*/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1");
  return stripped
    .split(/\n\n+/u)
    .map((part) =>
      cleanAcademySpokenTextForTts(expandAcademyTtsSkipPreventer(part.replace(/[^\S\n]+/gu, " ").trim())),
    )
    .filter((part) => part.length > 0);
}

function paragraphsWithCue(markdown: string, sectionNumber: number): TaggedParagraph[] {
  const map = HEADING_CUE[sectionNumber];
  if (!map) throw new Error(`Başlık haritası yok: ders ${sectionNumber}`);
  const chunks = markdown.trim().split(/^## /mu);
  const rows: TaggedParagraph[] = [];
  chunks.forEach((chunk, chunkIndex) => {
    let cueIndex = 0;
    let body = chunk;
    if (chunkIndex > 0) {
      const newline = chunk.indexOf("\n");
      const heading = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
      const mapped = map[heading];
      if (mapped == null) {
        throw new Error(`SM-103 ders ${sectionNumber} başlığı haritada yok: ${heading}`);
      }
      cueIndex = mapped;
      body = newline === -1 ? "" : chunk.slice(newline + 1);
    }
    const parts = spokenParts(body);
    const paragraphBase = rows.filter((row) => row.cueIndex === cueIndex).length;
    parts.forEach((text, offset) => {
      rows.push({ cueIndex, paragraphIndex: paragraphBase + offset, text });
    });
  });
  const flat = spokenParts(markdown);
  if (rows.length !== flat.length || rows.some((row, index) => row.text !== flat[index])) {
    throw new Error(`SM-103 ders ${sectionNumber} başlık bölmesi paragrafları kaydırdı.`);
  }
  for (let cueIndex = 0; cueIndex < 5; cueIndex += 1) {
    if (!rows.some((row) => row.cueIndex === cueIndex)) {
      throw new Error(`SM-103 ders ${sectionNumber} cue ${cueIndex + 1} boş.`);
    }
  }
  return rows;
}

function pieceWavs(sectionNumber: number): string[] {
  const dir = join(ROOT, "media-bake", "academy", "piece-cache", "sm-103", `section_${sectionNumber}`);
  const newest = new Map<string, string>();
  for (const name of readdirSync(dir)) {
    const match = /^(\d{2})-.+\.wav$/u.exec(name);
    if (!match) continue;
    const index = match[1]!;
    const previous = newest.get(index);
    if (!previous) {
      newest.set(index, name);
      continue;
    }
    const previousStamp = statSync(join(dir, previous)).mtimeMs;
    const nextStamp = statSync(join(dir, name)).mtimeMs;
    if (nextStamp >= previousStamp) newest.set(index, name);
  }
  return [...newest.keys()].sort().map((index) => join(dir, newest.get(index)!));
}

function splitSentences(text: string): string[] {
  return normalize(text)
    .split(SENTENCE_BOUNDARY)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

type ConsumeState = { atomIndex: number; offset: number };

function consumeRequest(requestText: string, atoms: readonly TaggedAtom[], state: ConsumeState): CueSegment[] {
  const request = normalize(requestText);
  let cursor = 0;
  const parts: Array<{ cueIndex: number; paragraphIndex: number; text: string }> = [];
  while (cursor < request.length) {
    const atom = atoms[state.atomIndex];
    if (!atom) {
      throw new Error(`İstek atom bitti: ${request.slice(cursor, cursor + 48)}`);
    }
    const available = atom.text.slice(state.offset);
    if (request.startsWith(available, cursor)) {
      parts.push({ cueIndex: atom.cueIndex, paragraphIndex: atom.paragraphIndex, text: available });
      cursor += available.length;
      state.atomIndex += 1;
      state.offset = 0;
      if (request[cursor] === " ") cursor += 1;
      continue;
    }
    if (available.startsWith(request.slice(cursor))) {
      const take = request.slice(cursor);
      parts.push({ cueIndex: atom.cueIndex, paragraphIndex: atom.paragraphIndex, text: take });
      state.offset += take.length;
      if (atom.text[state.offset] === " ") state.offset += 1;
      cursor = request.length;
      continue;
    }
    throw new Error(
      `İstek atomla örtüşmedi: istek="${request.slice(cursor, cursor + 60)}" atom="${available.slice(0, 60)}"`,
    );
  }
  const segments: CueSegment[] = [];
  for (const part of parts) {
    const last = segments.at(-1);
    if (last && last.cueIndex === part.cueIndex && last.paragraphIndex === part.paragraphIndex) {
      last.text = `${last.text} ${part.text}`.replace(/\s+/gu, " ").trim();
      continue;
    }
    if (last && last.cueIndex === part.cueIndex) {
      last.text = `${last.text} ${part.text}`.replace(/\s+/gu, " ").trim();
      continue;
    }
    segments.push({ cueIndex: part.cueIndex, paragraphIndex: part.paragraphIndex, text: part.text });
  }
  return segments;
}

type Silence = { start: number; end: number };

function ffmpegLog(args: string[]): string {
  if (!ffmpegPath) throw new Error("ffmpeg-static yok.");
  const result = spawnSync(ffmpegPath, args, { encoding: "utf8" });
  return `${result.stderr ?? ""}\n${result.stdout ?? ""}`;
}

function mediaDurationSec(filePath: string): number {
  const log = ffmpegLog(["-hide_banner", "-i", filePath, "-f", "null", "-"]);
  const match = log.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/u);
  if (!match) throw new Error(`Süre okunamadı: ${filePath}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function detectSilences(filePath: string, noiseDb: number, minSec: number): Silence[] {
  const log = ffmpegLog([
    "-hide_banner",
    "-i",
    filePath,
    "-af",
    `silencedetect=noise=${noiseDb}dB:d=${minSec}`,
    "-f",
    "null",
    "-",
  ]);
  const silences: Silence[] = [];
  let pending: number | null = null;
  for (const line of log.split(/\r?\n/u)) {
    const start = line.match(/silence_start:\s*(-?\d+(?:\.\d+)?)/u);
    if (start) {
      pending = Number(start[1]);
      continue;
    }
    const end = line.match(/silence_end:\s*(-?\d+(?:\.\d+)?)/u);
    if (end && pending != null) {
      const endSec = Number(end[1]);
      if (endSec > pending) silences.push({ start: pending, end: endSec });
      pending = null;
    }
  }
  return silences;
}

function speechAtoms(winStart: number, winEnd: number, silences: Silence[]): Array<{ start: number; end: number }> {
  const cuts = [winStart, winEnd];
  for (const silence of silences) {
    if (silence.end <= winStart || silence.start >= winEnd) continue;
    cuts.push(Math.max(silence.start, winStart), Math.min(silence.end, winEnd));
  }
  cuts.sort((left, right) => left - right);
  const atoms: Array<{ start: number; end: number }> = [];
  for (let index = 0; index < cuts.length - 1; index += 1) {
    const start = cuts[index]!;
    const end = cuts[index + 1]!;
    if (end - start < 0.04) continue;
    const silent = silences.some((silence) => start >= silence.start - 0.02 && end <= silence.end + 0.02);
    if (!silent) atoms.push({ start, end });
  }
  return atoms;
}

function alignSentences(
  winStart: number,
  winEnd: number,
  sentences: string[],
  silences: Silence[],
): Array<{ start: number; end: number }> {
  if (sentences.length <= 1) return [{ start: winStart, end: winEnd }];
  const atoms = speechAtoms(winStart, winEnd, silences);
  if (atoms.length < sentences.length) {
    throw new Error(`Atom ${atoms.length} < cümle ${sentences.length}`);
  }
  const weights = sentences.map((sentence) => Math.max(1, sentence.length));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const prefix = [0];
  for (const atom of atoms) prefix.push(prefix[prefix.length - 1]! + (atom.end - atom.start));
  const totalSpeech = prefix[prefix.length - 1]!;
  const expected = weights.map((weight) => (totalSpeech * weight) / totalWeight);
  const sentenceCount = sentences.length;
  const atomCount = atoms.length;
  const INF = 1e15;
  const dp: number[][] = Array.from({ length: sentenceCount + 1 }, () => Array(atomCount + 1).fill(INF));
  const prev: number[][] = Array.from({ length: sentenceCount + 1 }, () => Array(atomCount + 1).fill(-1));
  dp[0]![0] = 0;
  for (let sentenceIndex = 1; sentenceIndex <= sentenceCount; sentenceIndex += 1) {
    for (let atomEnd = sentenceIndex; atomEnd <= atomCount; atomEnd += 1) {
      if (atomCount - atomEnd < sentenceCount - sentenceIndex) continue;
      let best = INF;
      let bestStart = -1;
      for (let atomStart = sentenceIndex - 1; atomStart < atomEnd; atomStart += 1) {
        const base = dp[sentenceIndex - 1]![atomStart]!;
        if (base >= INF / 2) continue;
        const duration = prefix[atomEnd]! - prefix[atomStart]!;
        const target = expected[sentenceIndex - 1]!;
        let cost = base + (duration - target) ** 2;
        if (duration < 0.25 && weights[sentenceIndex - 1]! > 12) cost += 1_000_000;
        if (cost < best) {
          best = cost;
          bestStart = atomStart;
        }
      }
      dp[sentenceIndex]![atomEnd] = best;
      prev[sentenceIndex]![atomEnd] = bestStart;
    }
  }
  if (dp[sentenceCount]![atomCount]! >= INF / 2) {
    throw new Error("Cümle atomlara oturmadı.");
  }
  const spans: Array<{ start: number; end: number }> = [];
  let atomEnd = atomCount;
  for (let sentenceIndex = sentenceCount; sentenceIndex >= 1; sentenceIndex -= 1) {
    const atomStart = prev[sentenceIndex]![atomEnd]!;
    spans.push({ start: atoms[atomStart]!.start, end: atoms[atomEnd - 1]!.end });
    atomEnd = atomStart;
  }
  spans.reverse();
  spans[0]!.start = winStart;
  spans[spans.length - 1]!.end = winEnd;
  return spans;
}

type PieceRow = {
  cueIndex: number;
  paragraphIndex: number;
  chunkIndex: number;
  start: number;
  end: number;
  text: string;
};

function lessonClock(sectionNumber: number): {
  lessonKey: string;
  title: string;
  pieces: PieceRow[];
  durationSec: number;
  wavSec: number;
  mp3Sec: number;
  pauseHits: number;
  spans: number;
} {
  const section = SM103_SECTION_MAP[sectionNumber - 1];
  if (!section?.lessonKey) throw new Error(`Ders yok: ${sectionNumber}`);
  const paragraphs = paragraphsWithCue(section.contentMarkdown, sectionNumber);
  const atoms: TaggedAtom[] = paragraphs.flatMap((paragraph) =>
    splitAcademyTtsBreathChunks(paragraph.text).map((text) => ({ ...paragraph, text })),
  );
  const target = academyLessonRequestTargetForCourse(SM103_SECTION_MAP.length);
  const requests = packAcademyTtsLessonRequests(
    atoms.map((atom) => atom.text),
    target,
  );
  const wavs = pieceWavs(sectionNumber);
  if (wavs.length !== requests.length) {
    throw new Error(`Ders ${sectionNumber} parça ${wavs.length} istek ${requests.length}`);
  }
  const state: ConsumeState = { atomIndex: 0, offset: 0 };
  const pieces: PieceRow[] = [];
  let cursor = 0;
  let spans = 0;
  const pieceEnds: number[] = [];
  for (let index = 0; index < requests.length; index += 1) {
    const segments = consumeRequest(requests[index]!.text, atoms, state);
    const pieceSec = pcmWavDurationSec(readFileSync(wavs[index]!));
    if (!(pieceSec > 0)) throw new Error(`Parça süresi yok: ${wavs[index]}`);
    const pieceStart = cursor;
    if (segments.length === 1) {
      const segment = segments[0]!;
      const siblings = pieces.filter(
        (row) => row.cueIndex === segment.cueIndex && row.paragraphIndex === segment.paragraphIndex,
      );
      pieces.push({
        cueIndex: segment.cueIndex,
        paragraphIndex: segment.paragraphIndex,
        chunkIndex: siblings.length,
        start: round3(pieceStart),
        end: round3(pieceStart + pieceSec),
        text: segment.text,
      });
    } else {
      spans += 1;
      const sentences = segments.flatMap((segment) => splitSentences(segment.text));
      const silences = detectSilences(wavs[index]!, -32, 0.18);
      const aligned = alignSentences(0, pieceSec, sentences, silences);
      let sentenceCursor = 0;
      for (const segment of segments) {
        const count = splitSentences(segment.text).length;
        const group = aligned.slice(sentenceCursor, sentenceCursor + count);
        sentenceCursor += count;
        const siblings = pieces.filter(
          (row) => row.cueIndex === segment.cueIndex && row.paragraphIndex === segment.paragraphIndex,
        );
        pieces.push({
          cueIndex: segment.cueIndex,
          paragraphIndex: segment.paragraphIndex,
          chunkIndex: siblings.length,
          start: round3(pieceStart + group[0]!.start),
          end: round3(pieceStart + group[group.length - 1]!.end),
          text: segment.text,
        });
      }
    }
    cursor += pieceSec;
    pieceEnds.push(cursor);
    if (index < requests.length - 1) cursor += PAUSE_SEC;
  }
  if (state.atomIndex !== atoms.length || state.offset !== 0) {
    throw new Error(`Ders ${sectionNumber} atom tüketilmedi: ${state.atomIndex}/${atoms.length} ofset ${state.offset}`);
  }
  const wavPath = join(ROOT, "media-bake", "academy", "audio", "sm-103", `section_${sectionNumber}.wav`);
  const bakedMp3 = join(ROOT, "public", "media", "academy", "audio", "sm-103", `section_${sectionNumber}.mp3`);
  const playerMp3 = join(PLAYER_AUDIO_DIR, `${section.lessonKey}.mp3`);
  const mp3Path = existsSync(playerMp3) ? playerMp3 : bakedMp3;
  const wavSec = pcmWavDurationSec(readFileSync(wavPath));
  const mp3Sec = mediaDurationSec(mp3Path);
  const pauses = detectSilences(mp3Path, -46, 0.3);
  let pauseHits = 0;
  for (let index = 0; index < pieceEnds.length - 1; index += 1) {
    const expected = pieceEnds[index]!;
    const hit = pauses.some((silence) => Math.abs(silence.start - expected) <= 0.12 || Math.abs(silence.end - (expected + PAUSE_SEC)) <= 0.12);
    if (hit) pauseHits += 1;
  }
  const playbackSec = round3(mp3Sec);
  if (pieces.length > 0) {
    const last = pieces[pieces.length - 1]!;
    if (Math.abs(last.end - playbackSec) <= 0.08) {
      last.end = playbackSec;
    }
  }
  return {
    lessonKey: section.lessonKey,
    title: section.title,
    pieces,
    durationSec: round3(cursor),
    wavSec: round3(wavSec),
    mp3Sec: playbackSec,
    pauseHits,
    spans,
  };
}

function cueJson(sectionNumber: number, pieces: readonly PieceRow[]): unknown[] {
  const section = SM103_SECTION_MAP[sectionNumber - 1]!;
  const lessonKey = section.lessonKey!;
  const cinema = SM103_CINEMA_LESSONS[lessonKey as keyof typeof SM103_CINEMA_LESSONS];
  const paragraphs = paragraphsWithCue(section.contentMarkdown, sectionNumber);
  return cinema.slides.map((slide) => {
    const cueIndex = slide.cueIndex - 1;
    const group = pieces.filter((piece) => piece.cueIndex === cueIndex);
    if (group.length === 0) throw new Error(`${lessonKey} cue ${slide.cueIndex} parçasız`);
    const body = paragraphs.filter((row) => row.cueIndex === cueIndex).map((row) => row.text);
    return {
      id: `cue-${String(slide.cueIndex).padStart(2, "0")}`,
      start: group[0]!.start,
      end: group[group.length - 1]!.end,
      text: slide.headline,
      section: slide.section,
      paragraphs: body,
    };
  });
}

function timingsJson(lessonKey: string, pieces: readonly PieceRow[], durationSec: number): unknown {
  return {
    lessonKey,
    pauseSec: PAUSE_SEC,
    durationSec,
    cacheV: Math.round(durationSec * 1000),
    pieces: pieces.map((piece, index) => ({
      index,
      cueId: `cue-${String(piece.cueIndex + 1).padStart(2, "0")}`,
      cueParagraphIndex: piece.paragraphIndex,
      chunkIndex: piece.chunkIndex,
      start: piece.start,
      end: piece.end,
      text: piece.text,
    })),
  };
}

function copyPlayerAudio(sectionNumber: number, lessonKey: string): void {
  const source = join(ROOT, "public", "media", "academy", "audio", "sm-103", `section_${sectionNumber}.mp3`);
  const target = join(PLAYER_AUDIO_DIR, `${lessonKey}.mp3`);
  if (!existsSync(source) || existsSync(target)) return;
  mkdirSync(PLAYER_AUDIO_DIR, { recursive: true });
  copyFileSync(source, target);
}

function main(): void {
  const write = process.argv.includes("--write");
  for (let sectionNumber = 1; sectionNumber <= 6; sectionNumber += 1) {
    const clock = lessonClock(sectionNumber);
    const recipeDeltaMs = Math.round((clock.durationSec - clock.wavSec) * 1000);
    const mp3DeltaMs = Math.round((clock.mp3Sec - clock.wavSec) * 1000);
    const cues = clock.pieces.reduce<number[]>((acc, piece) => {
      if (!acc.includes(piece.cueIndex)) acc.push(piece.cueIndex);
      return acc;
    }, []);
    let previousStart = -1;
    for (const piece of clock.pieces) {
      if (!(piece.end > piece.start) || piece.start < previousStart) {
        throw new Error(`${clock.lessonKey} parça saati geri sarıyor: ${piece.start}–${piece.end}`);
      }
      previousStart = piece.start;
    }
    if (clock.pieces[0]?.start !== 0) {
      throw new Error(`${clock.lessonKey} ilk slayt 0 sn değil.`);
    }
    const expectedPauses = 11;
    process.stdout.write(
      `${clock.lessonKey}  parça ${clock.pieces.length}  kurgu ${clock.durationSec.toFixed(3)}s  wav ${clock.wavSec.toFixed(3)}s  mp3 ${clock.mp3Sec.toFixed(3)}s  kurguΔ ${recipeDeltaMs} ms  mp3Δ ${mp3DeltaMs} ms  mp3-sessizlik ${clock.pauseHits}/${expectedPauses}  ara-cue ${clock.spans}  slayt ${cues.join(",")}\n`,
    );
    if (Math.abs(recipeDeltaMs) > 30) {
      throw new Error(`${clock.lessonKey} kurgu ile WAV ${recipeDeltaMs} ms ayrıştı.`);
    }
    if (Math.abs(mp3DeltaMs) > 80) {
      throw new Error(`${clock.lessonKey} MP3 ile WAV ${mp3DeltaMs} ms ayrıştı.`);
    }
    if (clock.pauseHits < expectedPauses) {
      process.stdout.write(
        `  uyarı: ${clock.lessonKey} MP3 sessizlik eşleşmesi ${clock.pauseHits}/${expectedPauses}. Kurgu WAV ile 0 ms ise parça sınırı fırın birleşiminden okunur.\n`,
      );
    }
    if (write) {
      const cuePath = join(ROOT, "lib", "academy", "lesson-cues", `${clock.lessonKey}.json`);
      const timingPath = join(ROOT, "lib", "academy", "lesson-audio-timings", `${clock.lessonKey}.json`);
      mkdirSync(join(ROOT, "lib", "academy", "lesson-cues"), { recursive: true });
      writeFileSync(cuePath, `${JSON.stringify(cueJson(sectionNumber, clock.pieces), null, 2)}\n`);
      writeFileSync(
        timingPath,
        `${JSON.stringify(timingsJson(clock.lessonKey, clock.pieces, clock.mp3Sec), null, 2)}\n`,
      );
      copyPlayerAudio(sectionNumber, clock.lessonKey);
    }
  }
  if (!write) process.stdout.write("Ölçüm bitti. Yazmak için --write.\n");
}

main();
