export type JuniorProfileRow = {
  id: string;
  userId: string;
  nickname: string;
  grade: number;
  birthYear: number;
  consentAt: Date;
  selected: boolean;
  createdAt: Date;
};

export type JuniorProgressRow = {
  id: string;
  userId: string;
  profileId: string;
  lessonKey: string;
  mode: "speak" | "write" | "practice";
  praised: string;
  missing: string;
  advice: string;
  score: number;
  xpAwarded: number;
  createdAt: Date;
};

export type JuniorXpRow = {
  profileId: string;
  userId: string;
  points: number;
  badges: string[];
};

export type JuniorOutcomeWrite = {
  progress: Omit<JuniorProgressRow, "id" | "createdAt">;
  points: number;
  badges: string[];
};

export type JuniorStore = {
  listProfiles(userId: string): Promise<JuniorProfileRow[]>;
  insertProfile(row: Omit<JuniorProfileRow, "id" | "createdAt">): Promise<JuniorProfileRow>;
  getProfile(userId: string, profileId: string): Promise<JuniorProfileRow | null>;
  selectProfile(userId: string, profileId: string): Promise<JuniorProfileRow | null>;
  listProgress(userId: string, profileId: string): Promise<JuniorProgressRow[]>;
  getXp(userId: string, profileId: string): Promise<JuniorXpRow | null>;
  recordOutcome(write: JuniorOutcomeWrite): Promise<{ progress: JuniorProgressRow; xp: JuniorXpRow }>;
};
