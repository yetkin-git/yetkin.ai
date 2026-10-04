import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";
import { juniorCourseShelves } from "@/lib/junior/catalog";
import type {
  JuniorOutcomeWrite,
  JuniorProfileRow,
  JuniorProgressRow,
  JuniorStore,
  JuniorXpRow,
} from "@/lib/junior/ports";
import { readJuniorHome, readJuniorLesson, type JuniorHome } from "@/lib/junior/service";

type ProfileRecord = {
  id: string;
  userId: string;
  nickname: string;
  grade: number;
  birthYear: number;
  consentAt: Date;
  selected: boolean;
  createdAt: Date;
};

type ProgressRecord = {
  id: string;
  userId: string;
  profileId: string;
  lessonKey: string;
  mode: string;
  praised: string;
  missing: string;
  advice: string;
  score: number;
  xpAwarded: number;
  createdAt: Date;
};

type XpRecord = {
  userId: string;
  profileId: string;
  points: number;
  badgesJson: string;
};

function mapProfile(row: ProfileRecord): JuniorProfileRow {
  return {
    id: row.id,
    userId: row.userId,
    nickname: row.nickname,
    grade: row.grade,
    birthYear: row.birthYear,
    consentAt: row.consentAt,
    selected: row.selected,
    createdAt: row.createdAt,
  };
}

function mapMode(mode: string): JuniorProgressRow["mode"] {
  if (mode === "speak" || mode === "write" || mode === "practice") {
    return mode;
  }
  throw new Error("Junior ilerleme biçimi tanınmadı.");
}

function mapProgress(row: ProgressRecord): JuniorProgressRow {
  return {
    id: row.id,
    userId: row.userId,
    profileId: row.profileId,
    lessonKey: row.lessonKey,
    mode: mapMode(row.mode),
    praised: row.praised,
    missing: row.missing,
    advice: row.advice,
    score: row.score,
    xpAwarded: row.xpAwarded,
    createdAt: row.createdAt,
  };
}

function mapBadges(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function mapXp(row: XpRecord): JuniorXpRow {
  return {
    userId: row.userId,
    profileId: row.profileId,
    points: row.points,
    badges: mapBadges(row.badgesJson),
  };
}

export function createPrismaJuniorStore(): JuniorStore {
  const prisma = getPrisma();
  return {
    async listProfiles(userId) {
      const rows = await prisma.juniorProfile.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(mapProfile);
    },
    async insertProfile(row) {
      const created = await prisma.juniorProfile.create({
        data: {
          userId: row.userId,
          nickname: row.nickname,
          grade: row.grade,
          birthYear: row.birthYear,
          consentAt: row.consentAt,
          selected: row.selected,
        },
      });
      return mapProfile(created);
    },
    async getProfile(userId, profileId) {
      const row = await prisma.juniorProfile.findFirst({ where: { id: profileId, userId } });
      return row ? mapProfile(row) : null;
    },
    async selectProfile(userId, profileId) {
      const row = await prisma.$transaction(async (tx) => {
        const found = await tx.juniorProfile.findFirst({ where: { id: profileId, userId } });
        if (!found) {
          return null;
        }
        await tx.juniorProfile.updateMany({ where: { userId }, data: { selected: false } });
        return tx.juniorProfile.update({ where: { id: found.id }, data: { selected: true } });
      });
      return row ? mapProfile(row) : null;
    },
    async listProgress(userId, profileId) {
      const rows = await prisma.juniorProgress.findMany({
        where: { userId, profileId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(mapProgress);
    },
    async getXp(userId, profileId) {
      const row = await prisma.juniorXp.findFirst({ where: { userId, profileId } });
      return row ? mapXp(row) : null;
    },
    async recordOutcome(write: JuniorOutcomeWrite) {
      const saved = await prisma.$transaction(async (tx) => {
        const progress = await tx.juniorProgress.create({
          data: {
            userId: write.progress.userId,
            profileId: write.progress.profileId,
            lessonKey: write.progress.lessonKey,
            mode: write.progress.mode,
            praised: write.progress.praised,
            missing: write.progress.missing,
            advice: write.progress.advice,
            score: write.progress.score,
            xpAwarded: write.progress.xpAwarded,
          },
        });
        const xp = await tx.juniorXp.upsert({
          where: { profileId: write.progress.profileId },
          create: {
            userId: write.progress.userId,
            profileId: write.progress.profileId,
            points: write.points,
            badgesJson: JSON.stringify(write.badges),
          },
          update: {
            points: write.points,
            badgesJson: JSON.stringify(write.badges),
          },
        });
        return { progress, xp };
      });
      return { progress: mapProgress(saved.progress), xp: mapXp(saved.xp) };
    },
  };
}

export type JuniorHomePayload = JuniorHome & { ready: boolean; notice: string | null };

function emptyHome(notice: string): JuniorHomePayload {
  return {
    ready: false,
    notice,
    profiles: [],
    selected: null,
    xp: { points: 0, badges: [] },
    courses: juniorCourseShelves(),
  };
}

export async function loadJuniorHome(userId: string): Promise<JuniorHomePayload> {
  try {
    const home = await readJuniorHome(createPrismaJuniorStore(), userId);
    return { ready: true, notice: null, ...home };
  } catch (error) {
    logEvent({
      level: "error",
      event: "junior.home_unavailable",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return emptyHome("Profil kaydı şu an yazılamıyor. Ders listesi duruyor.");
  }
}

export async function loadJuniorLessonPage(userId: string, lessonKey: string) {
  const lesson = readJuniorLesson(lessonKey);
  try {
    const home = await readJuniorHome(createPrismaJuniorStore(), userId);
    return { ready: true, lesson, profileId: home.selected?.id ?? null };
  } catch (error) {
    logEvent({
      level: "error",
      event: "junior.lesson_unavailable",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return { ready: false, lesson, profileId: null };
  }
}
