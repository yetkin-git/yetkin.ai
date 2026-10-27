/**
 * Zaman çizelgesi veri yapısı. Zod doğrulaması `schema.ts` içindedir.
 * Bu dosya zod taşımaz; native indirgeyici yalnız burayı okur.
 */

export type WordTimestamp = {
  word: string;
  startMs: number;
  endMs: number;
};

export type StageLayout =
  | "marble-tray"
  | "factor-vs-multiple"
  | "detective-last-digit"
  | "detective-digit-sum"
  | "trap-vs-truth"
  | "summary-board"
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
  | "speed"
  | "concept-list";

export type VisualKeyframeOp =
  | "SET_STAGE"
  | "SPAWN_MARBLES"
  | "GROUP_MARBLES"
  | "SHOW_FACTOR_TREE"
  | "BUILD_MULTIPLE_TOWER"
  | "HIGHLIGHT_COMPARISON"
  | "INSPECT_NUMBER"
  | "HIGHLIGHT_DIGIT"
  | "ANIMATE_DIGIT_SUM"
  | "STAMP_VERDICT"
  | "SHOW_CALLOUT"
  | "SHOW_PRIME_FACTOR_TREE"
  | "SHOW_COMMON_DIVISOR"
  | "SHOW_CIRCLE"
  | "SHOW_HABITAT"
  | "SHOW_FUEL"
  | "SHOW_FRACTION"
  | "SHOW_NUMBER_LINE"
  | "SHOW_ANGLE"
  | "SHOW_AREA"
  | "SHOW_FORCE"
  | "SHOW_SPEED"
  | "SHOW_CONCEPT_LIST";

export type VisualKeyframe = {
  atMs: number;
  op: VisualKeyframeOp;
  hook?: string;
  params: Record<string, unknown>;
};

export type CueSegment = {
  id: string;
  chapterId: string;
  startMs: number;
  endMs: number;
  pauseAfterMs: number;
  text: string;
  markedText?: string;
  words?: WordTimestamp[];
  keyframes: VisualKeyframe[];
};

export type ChapterItem = {
  id: string;
  title: string;
  startMs: number;
  endMs: number;
};

export type TimelineJSON = {
  schemaVersion: "2.0.0";
  lessonKey: string;
  production?: {
    status: "locked";
    readiness: "ready";
  };
  title: string;
  grade: number;
  subject: string;
  teacher: {
    name: string;
    voice: string;
    atempo: number;
  };
  audio: {
    publicPath: string;
    durationMs: number;
    sampleRateHz: number;
  };
  chapters: ChapterItem[];
  cues: CueSegment[];
};
