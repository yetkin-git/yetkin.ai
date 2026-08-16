import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { SEED_GRANT_PROGRAMS } from "@/lib/hibe/catalog";
import type {
  GrantApplicationRecord,
  GrantProgramRecord,
  HibeStore,
} from "@/lib/hibe/types";

export function createMemoryHibeStore(): HibeStore {
  const programs = new Map<string, GrantProgramRecord>();
  const applications = new Map<string, GrantApplicationRecord>();

  return {
    async insertProgram(program) {
      programs.set(program.id, program);
      return { ...program, sectorTags: [...program.sectorTags] };
    },
    async getProgram(id) {
      const row = programs.get(id);
      return row ? { ...row, sectorTags: [...row.sectorTags] } : null;
    },
    async getProgramBySlug(slug) {
      const found = [...programs.values()].find((row) => row.slug === slug);
      return found ? { ...found, sectorTags: [...found.sectorTags] } : null;
    },
    async listPublishedPrograms() {
      return [...programs.values()]
        .filter((row) => row.isPublished)
        .sort((a, b) => a.title.localeCompare(b.title, "tr"))
        .map((row) => ({ ...row, sectorTags: [...row.sectorTags] }));
    },
    async insertApplication(application) {
      applications.set(application.id, application);
      return { ...application };
    },
    async getApplication(id) {
      const row = applications.get(id);
      return row ? { ...row } : null;
    },
    async getApplicationByUserAndProgram(userId, programId) {
      const found = [...applications.values()].find(
        (row) => row.userId === userId && row.programId === programId,
      );
      return found ? { ...found } : null;
    },
    async listApplicationsForUser(userId) {
      return [...applications.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime())
        .map((row) => ({ ...row }));
    },
    async updateApplication(id, patch) {
      const row = applications.get(id);
      if (!row) {
        throw new Error("Başvuru yok.");
      }
      const next = { ...row, ...patch };
      applications.set(id, next);
      return { ...next };
    },
    async pulseCountsForUser(userId) {
      const own = [...applications.values()].filter((row) => row.userId === userId);
      return {
        applicationsOpen: own.filter((row) => row.status === "GUIDE_OPEN").length,
        applicationsDone: own.filter((row) => row.status === "CHECKLIST_DONE").length,
      };
    },
  };
}

export async function seedMemoryGrantCatalog(store: HibeStore): Promise<void> {
  for (const program of SEED_GRANT_PROGRAMS) {
    await store.insertProgram({
      ...program,
      currencyCode: program.currencyCode ?? SETTLEMENT_CURRENCY,
    });
  }
}
