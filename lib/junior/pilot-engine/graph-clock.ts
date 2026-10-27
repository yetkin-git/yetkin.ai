import {
  buildCueTimingFromBounds,
  parseMarkedCueText,
  type AuthoredCueSpec,
} from "@/lib/junior/pilot-engine/mat-1.choreography";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import { JUNIOR_BAKE_ATEMPO } from "@/lib/junior/voice";

type ChapterId = AuthoredCueSpec["chapterId"];

type GraphPiece = {
  chapterId: ChapterId;
  marked: string;
  keyframes: AuthoredCueSpec["keyframes"];
};

function countTurkishSyllables(word: string): number {
  const vowels = word.match(/[aeıioöuüAEIİOÖUÜ]/gu);
  if (vowels && vowels.length > 0) {
    return vowels.length;
  }
  if (/\d/u.test(word)) {
    return 2;
  }
  return 1;
}

function speechMs(text: string): number {
  const words = text.split(/\s+/u).filter((word) => word.length > 0);
  const syllables = words.reduce((sum, word) => sum + countTurkishSyllables(word), 0);
  return Math.max(700, syllables * 170);
}

/** Cümle bölmesi. Boşluklar tek boşluğa iner. Bölme, nokta, soru ve ünlemden sonraki boşluktadır. */
export function splitJuniorCueSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function sentences(text: string): string[] {
  return splitJuniorCueSentences(text);
}

/** Konuşmayı değiştirmeden, hedef sözcüğün önüne görsel kanca koyar. */
export function insertSpeechHook(text: string, phrase: string, hook: string): string {
  const index = text.indexOf(phrase);
  if (index < 0) {
    throw new Error(`Konuşmada kanca yeri yok: ${phrase}`);
  }
  return `${text.slice(0, index)}{@${hook}} ${text.slice(index)}`;
}

/**
 * Ders grafiği. Konuşma, kaset metninin cümleleridir.
 * Örnek cümlesi tek sekans kalır; görsel `atMs` o sekansın kelime saatine kilitlenir.
 * Ünlü sayısı dalga yokken taslak süredir. Timeline JSON mührü bu taslağı
 * `alignWordsByAcoustics` ile değiştirir. Taslak, karaoke mührü değildir.
 */
export function buildLessonGraphTimeline(input: {
  lessonKey: string;
  title: string;
  listenText: string;
  example: string;
  exampleMarked: string;
  audioPath: string;
  layout:
    | "prime-factor-tree"
    | "common-divisor"
    | "circle-measure"
    | "habitat"
    | "fuel"
    | "fraction"
    | "number-line"
    | "angle"
    | "area"
    | "force"
    | "speed";
  stageTitle: string;
  stageSubtitle: string;
  chapterTitle: string;
  exampleKeyframes: AuthoredCueSpec["keyframes"];
  subject?: string;
  teacherName?: string;
  teacherVoice?: string;
}): TimelineJSON {
  const example = input.example.replace(/\s+/g, " ").trim();
  const cleanExample = parseMarkedCueText(input.exampleMarked).cleanText;
  if (cleanExample !== example) {
    throw new Error(`${input.lessonKey} örnek kancası konuşmayı değiştirdi.`);
  }
  const listen = input.listenText.replace(/\s+/g, " ").trim();
  const at = listen.indexOf(example);
  if (at < 0) {
    throw new Error(`${input.lessonKey} örneği konuşma metninde yok.`);
  }

  const pieces: GraphPiece[] = [];
  for (const text of sentences(listen.slice(0, at))) {
    pieces.push({ chapterId: "ch-1", marked: text, keyframes: [] });
  }
  pieces.push({
    chapterId: "ch-2",
    marked: input.exampleMarked,
    keyframes: input.exampleKeyframes,
  });
  for (const text of sentences(listen.slice(at + example.length))) {
    pieces.push({ chapterId: "ch-3", marked: text, keyframes: [] });
  }
  const first = pieces[0];
  if (!first) {
    throw new Error(`${input.lessonKey} grafik sekansı yok.`);
  }
  if (!first.keyframes.some((frame) => frame.op === "SET_STAGE")) {
    first.keyframes = [
      {
        offsetMs: 0,
        op: "SET_STAGE",
        params: {
          layout: input.layout,
          title: input.stageTitle,
          subtitle: input.stageSubtitle,
        },
      },
      ...first.keyframes,
    ];
  }

  let cursorMs = 0;
  const cues = pieces.map((piece, index) => {
    const spec: AuthoredCueSpec = {
      id: `cue-${String(index + 1).padStart(2, "0")}`,
      chapterId: piece.chapterId,
      pauseAfterMs: 280,
      markedText: piece.marked,
      keyframes: piece.keyframes,
    };
    const cue = buildCueTimingFromBounds(spec, cursorMs, speechMs(cueSpeech(piece.marked)));
    cursorMs = cue.endMs + spec.pauseAfterMs;
    return cue;
  });

  const totalDurationMs = cues[cues.length - 1]?.endMs ?? 1;
  const chapterDefs: Array<{ id: ChapterId; title: string }> = [
    { id: "ch-1", title: "Giriş" },
    { id: "ch-2", title: input.chapterTitle },
    { id: "ch-3", title: "Kapanış" },
  ];
  const chapters = chapterDefs
    .map((chapter, index) => {
      const rows = cues.filter((cue) => cue.chapterId === chapter.id);
      const start = rows[0];
      if (!start) {
        return null;
      }
      const next = chapterDefs.slice(index + 1).find((item) => cues.some((cue) => cue.chapterId === item.id));
      const nextCue = next ? cues.find((cue) => cue.chapterId === next.id) : undefined;
      return {
        id: chapter.id,
        title: chapter.title,
        startMs: start.startMs,
        endMs: nextCue ? nextCue.startMs : totalDurationMs,
      };
    })
    .filter((chapter): chapter is { id: ChapterId; title: string; startMs: number; endMs: number } => chapter !== null);

  return timelineJsonSchema.parse({
    schemaVersion: "2.0.0",
    lessonKey: input.lessonKey,
    title: input.title,
    grade: 6,
    subject: input.subject ?? "Matematik",
    teacher: {
      name: input.teacherName ?? "Selim",
      voice: input.teacherVoice ?? "Fenrir",
      atempo: JUNIOR_BAKE_ATEMPO,
    },
    audio: {
      publicPath: input.audioPath,
      durationMs: totalDurationMs,
      sampleRateHz: 48000,
    },
    chapters,
    cues,
  });
}

function cueSpeech(marked: string): string {
  return parseMarkedCueText(marked).cleanText;
}
