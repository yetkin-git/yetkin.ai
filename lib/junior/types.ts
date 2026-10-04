export type JuniorProfileView = {
  id: string;
  nickname: string;
  grade: number;
  birthYear: number;
  selected: boolean;
};

export type JuniorLessonCard = {
  key: string;
  title: string;
  teaser: string;
  access: "free" | "locked";
};

export type JuniorCourseShelf = {
  slug: string;
  title: string;
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
