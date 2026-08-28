import { randomUUID } from "node:crypto";
import { DEFAULT_GRANT_MATCH_QUERY, matchGrantPrograms } from "@/lib/hibe/match";
import type {
  GrantApplicationRecord,
  GrantMatchQuery,
  GrantMatchResult,
  GrantProgramRecord,
  HibePulse,
  HibeStore,
} from "@/lib/hibe/types";

export type HibeEnginePorts = {
  hibe: HibeStore;
};

export type OpenGrantApplicationCommand = {
  userId: string;
  programId: string;
  companyHint?: string | null;
  completeChecklist?: boolean;
  now?: Date;
};

async function requirePublishedProgram(
  store: HibeStore,
  programId: string,
): Promise<GrantProgramRecord> {
  const program = (await store.getProgram(programId)) ?? (await store.getProgramBySlug(programId));
  if (!program) {
    throw new Error("Hibe programı bulunamadı.");
  }
  if (!program.isPublished) {
    throw new Error("Hibe programı yayında değil.");
  }
  return program;
}

export async function searchGrantPrograms(
  ports: HibeEnginePorts,
  query: GrantMatchQuery,
): Promise<GrantMatchResult[]> {
  const programs = await ports.hibe.listPublishedPrograms();
  return matchGrantPrograms(programs, query);
}

export async function openGrantApplicationGuide(
  ports: HibeEnginePorts,
  command: OpenGrantApplicationCommand,
): Promise<{ applied: boolean; program: GrantProgramRecord; application: GrantApplicationRecord }> {
  const program = await requirePublishedProgram(ports.hibe, command.programId);
  const now = command.now ?? new Date();
  const existing = await ports.hibe.getApplicationByUserAndProgram(command.userId, program.id);
  const companyHint = command.companyHint?.trim() ? command.companyHint.trim() : null;

  let application = existing;
  let applied = false;
  if (!application) {
    application = await ports.hibe.insertApplication({
      id: randomUUID(),
      userId: command.userId,
      programId: program.id,
      companyHint,
      status: "GUIDE_OPEN",
      openedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    applied = true;
  } else if (companyHint && companyHint !== application.companyHint) {
    application = await ports.hibe.updateApplication(application.id, {
      companyHint,
      updatedAt: now,
    });
  }

  if (command.completeChecklist) {
    if (application.status === "CHECKLIST_DONE") {
      return { applied: false, program, application };
    }
    application = await ports.hibe.updateApplication(application.id, {
      status: "CHECKLIST_DONE",
      completedAt: now,
      updatedAt: now,
    });
    applied = true;
  }

  return { applied, program, application };
}

export async function buildHibePulse(
  ports: HibeEnginePorts,
  userId: string,
  query: GrantMatchQuery = DEFAULT_GRANT_MATCH_QUERY,
): Promise<HibePulse> {
  const [counts, matches] = await Promise.all([
    ports.hibe.pulseCountsForUser(userId),
    searchGrantPrograms(ports, query),
  ]);
  return {
    applicationsOpen: counts.applicationsOpen,
    applicationsDone: counts.applicationsDone,
    recommendations: matches.slice(0, 3).map((row) => ({
      title: row.title,
      agency: row.agency,
      slug: row.slug,
      score: row.score,
    })),
  };
}
