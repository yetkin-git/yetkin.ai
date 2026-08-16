import "server-only";

import { createPrismaJuniorPorts } from "@/lib/junior/runtime";
import { listMebTracksForAge } from "@/lib/junior/meb-catalog";
import type { JuniorAllowanceRecord, JuniorProfileRecord } from "@/lib/junior/types";
import type { MebTrack } from "@/lib/junior/meb-catalog";

export async function loadJuniorBoard(userId: string): Promise<{
  profile: JuniorProfileRecord | null;
  allowance: JuniorAllowanceRecord | null;
  tracks: MebTrack[];
} | null> {
  try {
    const ports = createPrismaJuniorPorts();
    const profile = await ports.junior.getProfileByUserId(userId);
    if (!profile) {
      return { profile: null, allowance: null, tracks: [] };
    }
    const allowance = await ports.junior.getAllowanceByProfileId(profile.id);
    return {
      profile,
      allowance,
      tracks: listMebTracksForAge(profile.dateOfBirth),
    };
  } catch {
    return null;
  }
}

export async function loadGuardianWards(guardianUserId: string): Promise<JuniorProfileRecord[] | null> {
  try {
    const ports = createPrismaJuniorPorts();
    return await ports.junior.listWardsForGuardian(guardianUserId);
  } catch {
    return null;
  }
}
