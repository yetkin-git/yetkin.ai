export type JuniorProfileView = {
  id: string;
  nickname: string;
  grade: number;
  birthYear: number | null;
  selected: boolean;
  selectedElectives: string[];
  gradeSwitchRights: number;
};

export type JuniorPlanView = {
  status: "NONE" | "ACTIVE";
  electiveQuota: number;
  expiresAt: string | null;
  gradeSwitchRights: number;
};

export type JuniorVectorScene =
  | "fraction"
  | "fraction-sum"
  | "force"
  | "friction"
  | "main-idea"
  | "support-idea"
  | "elective";

/** Vektör oynatıcının dokuz adımı. Seçmeli ders şablonu bu diziyi taşır. */
export type JuniorNineSteps = readonly [string, string, string, string, string, string, string, string, string];

export type JuniorLessonScript = {
  key: string;
  title: string;
  teaser: string;
  listenText: string;
  outcomes: readonly string[];
  scene: JuniorVectorScene;
  steps?: JuniorNineSteps;
  mebNote: string;
  lifeUse: string;
};

export type JuniorCourseTrack = "core" | "elective";

export const JUNIOR_PERSONAL_CURRICULUM_TAG = "Kişiye Özel Müfredat";
export const JUNIOR_ELECTIVE_TAG = "Seçmeli Ders";
export const JUNIOR_ELECTIVE_CATEGORY = "Seçmeli Dersler";

/** Vektör oynatıcı adım sayısı. Seçmeli ders şablonu bu kadar adım taşır. */
export const JUNIOR_VECTOR_STEP_COUNT = 9;

/** Maarif ders etiketleri. Kart ve raf aynı diziyi okur. */
export const JUNIOR_MAARIF_SKILL_TAGS = [
  "Sözlü Anlatım Odaklı",
  "Beceri Temelli Öğrenme",
  "AI Destekli Birebir Dönüt",
] as const;

export type JuniorLessonStatus = "done" | "going" | "fresh";

export type JuniorLessonCard = {
  key: string;
  title: string;
  teaser: string;
  access: "free" | "locked";
  thisWeek: boolean;
  status: JuniorLessonStatus;
};

export type JuniorCourseShelf = {
  slug: string;
  title: string;
  subject: string;
  grade: number;
  track: JuniorCourseTrack;
  labels: readonly string[];
  lessons: JuniorLessonCard[];
};

export type JuniorXpView = {
  points: number;
  badges: string[];
};

export type JuniorPracticeChoice = {
  id: string;
  kind: "choice";
  prompt: string;
  choices: string[];
};

export type JuniorPracticeMatch = {
  id: string;
  kind: "match";
  prompt: string;
  left: { id: string; label: string }[];
  right: { id: string; label: string }[];
};

export type JuniorPracticeItem = JuniorPracticeChoice | JuniorPracticeMatch;

export type JuniorPracticeAnswer = {
  id: string;
  choiceIndex?: number;
  matches?: Record<string, string>;
};

export type JuniorTellMode = "speak" | "write";

export type JuniorFeedback = {
  praised: string;
  missing: string;
  advice: string;
  score: number;
  xpAwarded: number;
  points: number;
  badges: string[];
};
