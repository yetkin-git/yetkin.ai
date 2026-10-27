/**
 * Akustik zaman çizelgesi tohumu.
 * Konuşma bugünkü `listenText` parçalarıdır. Cümle bölmesi `splitJuniorCueSentences`tir.
 * Taslak süre ünlü saatidir. Mühür, duran MP3 üzerinde `realignPilotTimelineWords` ile yazılır.
 * `production` bu nesneye konmaz. Ses dosyası yazılmaz.
 */

import {
  JUNIOR_HYBRID_STEP_CLOSE,
  JUNIOR_RECAP_TITLE,
  JUNIOR_TELL_CLOSE,
  ensureJuniorHybridHint,
  juniorHintCue,
  sealJuniorWarmWelcome,
  stripJuniorCliches,
} from "@/lib/junior/content-rules";
import { juniorDrawCue } from "@/lib/junior/drawing-cue";
import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";
import { JUNIOR_BAKE_ATEMPO, juniorLessonAudioPublicPath, juniorTeacherForLesson, sealJuniorTeacherIntro } from "@/lib/junior/voice";
import { splitJuniorCueSentences } from "@/lib/junior/pilot-engine/graph-clock";
import {
  buildCueTimingFromBounds,
  parseMarkedCueText,
  type AuthoredCueSpec,
} from "@/lib/junior/pilot-engine/mat-1.choreography";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";

export type JuniorListenPiece = {
  chapterId: "ch-1" | "ch-2" | "ch-3";
  text: string;
};

const RECAP_ICONS = ["puzzle", "search", "link"] as const;

/**
 * Kaset parçaları. Sıra `juniorLessonFromScenario` ile aynıdır.
 * `storySpine` boş olduğu sürece birleşim `listenText` ile birebir durur.
 */
export function juniorListenPieces(scenario: JuniorLessonScenario): readonly JuniorListenPiece[] {
  const welcomeSource = stripJuniorCliches(scenario.welcome);
  const concept = stripJuniorCliches(scenario.concept).trim();
  const example = stripJuniorCliches(scenario.example).trim();
  const warning = ensureJuniorHybridHint(stripJuniorCliches(scenario.warning).trim());
  const life = stripJuniorCliches(scenario.life).trim();
  const recap = scenario.recap.map((line) => stripJuniorCliches(line));
  const kind = scenario.hint ?? "trap";
  const welcome = sealJuniorTeacherIntro(
    sealJuniorWarmWelcome(welcomeSource.trim(), scenario.key),
    scenario.key,
  );
  const recapBlock = `${JUNIOR_RECAP_TITLE} ${recap.map((line, index) => `${index + 1}. ${line.trim()}`).join(" ")}`;
  const closing = `${stripJuniorCliches(scenario.conceptSeal).trim()} ${stripJuniorCliches(scenario.voiceSeal).trim()} ${JUNIOR_HYBRID_STEP_CLOSE} ${JUNIOR_TELL_CLOSE}`.trim();
  const draw = juniorDrawCue(scenario.key);
  return [
    { chapterId: "ch-1", text: welcome },
    { chapterId: "ch-1", text: life },
    { chapterId: "ch-2", text: concept },
    ...(draw ? [{ chapterId: "ch-2" as const, text: draw }] : []),
    { chapterId: "ch-2", text: example },
    { chapterId: "ch-2", text: juniorHintCue(kind) },
    { chapterId: "ch-2", text: warning },
    { chapterId: "ch-3", text: recapBlock },
    { chapterId: "ch-3", text: closing },
  ];
}

function draftSpeechMs(text: string): number {
  const words = text.split(/\s+/u).filter((word) => word.length > 0);
  const syllables = words.reduce((sum, word) => {
    const vowels = word.match(/[aeıioöuüAEIİOÖUÜ]/gu);
    if (vowels && vowels.length > 0) {
      return sum + vowels.length;
    }
    if (/\d/u.test(word)) {
      return sum + 2;
    }
    return sum + 1;
  }, 0);
  return Math.max(700, syllables * 170);
}

function openingStage(scenario: JuniorLessonScenario, subject: string): AuthoredCueSpec["keyframes"] {
  return [
    {
      offsetMs: 0,
      op: "SET_STAGE",
      params: {
        layout: "summary-board",
        title: scenario.title.trim(),
        subtitle: subject,
        ruleBadges: [],
        echoPrompt: (scenario.echoPrompt ?? scenario.voiceSeal).trim(),
        cards: scenario.recap.map((line, index) => ({
          icon: RECAP_ICONS[index] ?? "puzzle",
          title: `${index + 1}. nokta`,
          body: stripJuniorCliches(line).trim(),
        })),
      },
    },
  ];
}

/**
 * Ünlü taslak. Kelime saati yayın değildir.
 * İlk kare dersin kendi özet tahtasıdır; boş sahnede matematik bilye masası açılmaz.
 */
export function buildListenTimelineSeed(scenario: JuniorLessonScenario): {
  timeline: TimelineJSON;
  cues: readonly AuthoredCueSpec[];
} {
  const lesson = juniorLessonFromScenario(scenario);
  const pieces = juniorListenPieces(scenario);
  const joined = pieces.map((piece) => piece.text).join(" ");
  if (joined !== lesson.listenText) {
    throw new Error(`${scenario.key} tohum parçaları listenText ile uyuşmuyor.`);
  }
  const teacher = juniorTeacherForLesson(scenario.key);
  const specs: AuthoredCueSpec[] = [];
  for (const piece of pieces) {
    for (const sentence of splitJuniorCueSentences(piece.text)) {
      const index = specs.length;
      specs.push({
        id: `cue-${String(index + 1).padStart(2, "0")}`,
        chapterId: piece.chapterId,
        pauseAfterMs: 280,
        markedText: sentence,
        keyframes: index === 0 ? openingStage(scenario, teacher.subject) : [],
      });
    }
  }
  if (specs.length === 0) {
    throw new Error(`${scenario.key} cümle sekansı yok.`);
  }
  let cursorMs = 0;
  const cues = specs.map((spec) => {
    const speech = draftSpeechMs(parseMarkedCueText(spec.markedText).cleanText);
    const cue = buildCueTimingFromBounds(spec, cursorMs, speech);
    cursorMs = cue.endMs + spec.pauseAfterMs;
    return cue;
  });
  const totalDurationMs = cues[cues.length - 1]?.endMs ?? 1;
  const chapterDefs = [
    { id: "ch-1" as const, title: "Giriş" },
    { id: "ch-2" as const, title: "Gelişme" },
    { id: "ch-3" as const, title: "Sonuç" },
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
    .filter((chapter): chapter is { id: "ch-1" | "ch-2" | "ch-3"; title: string; startMs: number; endMs: number } => chapter !== null);

  const timeline = timelineJsonSchema.parse({
    schemaVersion: "2.0.0",
    lessonKey: scenario.key,
    title: scenario.title.trim(),
    grade: 6,
    subject: teacher.subject,
    teacher: {
      name: teacher.name,
      voice: teacher.voice,
      atempo: JUNIOR_BAKE_ATEMPO,
    },
    audio: {
      publicPath: juniorLessonAudioPublicPath(scenario.key),
      durationMs: totalDurationMs,
      sampleRateHz: 48000,
    },
    chapters,
    cues,
  });
  return { timeline, cues: specs };
}
