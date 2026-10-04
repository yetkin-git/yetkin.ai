import type {
  JuniorOutcomeWrite,
  JuniorProfileRow,
  JuniorProgressRow,
  JuniorStore,
  JuniorXpRow,
} from "@/lib/junior/ports";

export function createMemoryJuniorStore(): JuniorStore {
  const profiles: JuniorProfileRow[] = [];
  const progress: JuniorProgressRow[] = [];
  const xp: JuniorXpRow[] = [];
  let sequence = 0;

  function nextId(prefix: string): string {
    sequence += 1;
    return `${prefix}_${sequence}`;
  }

  return {
    async listProfiles(userId) {
      return profiles
        .filter((row) => row.userId === userId)
        .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
    },
    async insertProfile(row) {
      const created: JuniorProfileRow = {
        ...row,
        id: nextId("jp"),
        createdAt: new Date(),
      };
      profiles.push(created);
      return created;
    },
    async getProfile(userId, profileId) {
      return profiles.find((row) => row.userId === userId && row.id === profileId) ?? null;
    },
    async selectProfile(userId, profileId) {
      const target = profiles.find((row) => row.userId === userId && row.id === profileId);
      if (!target) {
        return null;
      }
      for (const row of profiles) {
        if (row.userId === userId) {
          row.selected = row.id === profileId;
        }
      }
      return target;
    },
    async listProgress(userId, profileId) {
      return progress
        .filter((row) => row.userId === userId && row.profileId === profileId)
        .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
    },
    async getXp(userId, profileId) {
      return xp.find((row) => row.userId === userId && row.profileId === profileId) ?? null;
    },
    async recordOutcome(write: JuniorOutcomeWrite) {
      const created: JuniorProgressRow = {
        ...write.progress,
        id: nextId("jg"),
        createdAt: new Date(),
      };
      progress.push(created);
      const existing = xp.find(
        (row) => row.userId === write.progress.userId && row.profileId === write.progress.profileId,
      );
      if (existing) {
        existing.points = write.points;
        existing.badges = [...write.badges];
        return { progress: created, xp: existing };
      }
      const createdXp: JuniorXpRow = {
        userId: write.progress.userId,
        profileId: write.progress.profileId,
        points: write.points,
        badges: [...write.badges],
      };
      xp.push(createdXp);
      return { progress: created, xp: createdXp };
    },
  };
}
