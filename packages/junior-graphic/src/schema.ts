import { z } from "zod";
import type {
  ChapterItem as HandChapter,
  CueSegment as HandCue,
  StageLayout as HandLayout,
  TimelineJSON as HandTimeline,
  VisualKeyframe as HandFrame,
  VisualKeyframeOp as HandOp,
  WordTimestamp as HandWord,
} from "./timeline-types";

export const wordTimestampSchema = z.object({
  word: z.string(),
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
});

export type WordTimestamp = z.infer<typeof wordTimestampSchema>;

export const stageLayoutSchema = z.enum([
  "marble-tray",
  "factor-vs-multiple",
  "detective-last-digit",
  "detective-digit-sum",
  "trap-vs-truth",
  "summary-board",
  "prime-factor-tree",
  "common-divisor",
  "circle-measure",
  "habitat",
  "fuel",
  "fraction",
  "number-line",
  "angle",
  "area",
  "force",
  "speed",
]);

export type StageLayout = z.infer<typeof stageLayoutSchema>;

export const visualKeyframeOpSchema = z.enum([
  "SET_STAGE",
  "SPAWN_MARBLES",
  "GROUP_MARBLES",
  "SHOW_FACTOR_TREE",
  "BUILD_MULTIPLE_TOWER",
  "HIGHLIGHT_COMPARISON",
  "INSPECT_NUMBER",
  "HIGHLIGHT_DIGIT",
  "ANIMATE_DIGIT_SUM",
  "STAMP_VERDICT",
  "SHOW_CALLOUT",
  "SHOW_PRIME_FACTOR_TREE",
  "SHOW_COMMON_DIVISOR",
  "SHOW_CIRCLE",
  "SHOW_HABITAT",
  "SHOW_FUEL",
  "SHOW_FRACTION",
  "SHOW_NUMBER_LINE",
  "SHOW_ANGLE",
  "SHOW_AREA",
  "SHOW_FORCE",
  "SHOW_SPEED",
]);

export type VisualKeyframeOp = z.infer<typeof visualKeyframeOpSchema>;

export const visualKeyframeSchema = z.object({
  atMs: z.number().nonnegative(),
  op: visualKeyframeOpSchema,
  hook: z.string().optional(),
  params: z.record(z.string(), z.unknown()),
});

export type VisualKeyframe = z.infer<typeof visualKeyframeSchema>;

export const cueSegmentSchema = z.object({
  id: z.string().min(1),
  chapterId: z.string().min(1),
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
  pauseAfterMs: z.number().nonnegative(),
  text: z.string().min(1),
  markedText: z.string().optional(),
  words: z.array(wordTimestampSchema).optional(),
  keyframes: z.array(visualKeyframeSchema),
});

export type CueSegment = z.infer<typeof cueSegmentSchema>;

export const chapterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
});

export type ChapterItem = z.infer<typeof chapterSchema>;

export const timelineJsonSchema = z.object({
  schemaVersion: z.literal("2.0.0"),
  lessonKey: z.string().min(1),
  title: z.string().min(1),
  grade: z.number().int().positive(),
  subject: z.string().min(1),
  teacher: z.object({
    name: z.string().min(1),
    voice: z.string().min(1),
    atempo: z.number().positive(),
  }),
  audio: z.object({
    publicPath: z.string().min(1),
    durationMs: z.number().positive(),
    sampleRateHz: z.number().int().positive(),
  }),
  chapters: z.array(chapterSchema).min(1),
  cues: z.array(cueSegmentSchema).min(1),
});

export type TimelineJSON = z.infer<typeof timelineJsonSchema>;

const _word: WordTimestamp = null as unknown as HandWord;
const _wordBack: HandWord = null as unknown as WordTimestamp;
const _layout: StageLayout = null as unknown as HandLayout;
const _layoutBack: HandLayout = null as unknown as StageLayout;
const _op: VisualKeyframeOp = null as unknown as HandOp;
const _opBack: HandOp = null as unknown as VisualKeyframeOp;
const _frame: VisualKeyframe = null as unknown as HandFrame;
const _frameBack: HandFrame = null as unknown as VisualKeyframe;
const _cue: CueSegment = null as unknown as HandCue;
const _cueBack: HandCue = null as unknown as CueSegment;
const _chapter: ChapterItem = null as unknown as HandChapter;
const _chapterBack: HandChapter = null as unknown as ChapterItem;
const _timeline: TimelineJSON = null as unknown as HandTimeline;
const _timelineBack: HandTimeline = null as unknown as TimelineJSON;
void _word;
void _wordBack;
void _layout;
void _layoutBack;
void _op;
void _opBack;
void _frame;
void _frameBack;
void _cue;
void _cueBack;
void _chapter;
void _chapterBack;
void _timeline;
void _timelineBack;
