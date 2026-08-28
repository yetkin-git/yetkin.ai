import "server-only";

import { createPrismaHibePorts } from "@/lib/hibe/runtime";
import { searchGrantPrograms } from "@/lib/hibe/engine";
import { DEFAULT_GRANT_MATCH_QUERY } from "@/lib/hibe/match";
import type {
  GrantApplicationRecord,
  GrantMatchQuery,
  GrantMatchResult,
  GrantProgramRecord,
} from "@/lib/hibe/types";

export async function loadMatchedPrograms(
  query: GrantMatchQuery = DEFAULT_GRANT_MATCH_QUERY,
): Promise<GrantMatchResult[] | null> {
  try {
    const ports = createPrismaHibePorts();
    return await searchGrantPrograms(ports, query);
  } catch {
    return null;
  }
}

export async function loadProgramBySlug(slug: string): Promise<GrantProgramRecord | null> {
  try {
    const ports = createPrismaHibePorts();
    return (await ports.hibe.getProgramBySlug(slug)) ?? (await ports.hibe.getProgram(slug));
  } catch {
    return null;
  }
}

export async function loadApplicationsForUser(
  userId: string,
): Promise<GrantApplicationRecord[] | null> {
  try {
    const ports = createPrismaHibePorts();
    return await ports.hibe.listApplicationsForUser(userId);
  } catch {
    return null;
  }
}

export async function loadApplicationForUserProgram(
  userId: string,
  programId: string,
): Promise<GrantApplicationRecord | null> {
  try {
    const ports = createPrismaHibePorts();
    return await ports.hibe.getApplicationByUserAndProgram(userId, programId);
  } catch {
    return null;
  }
}
