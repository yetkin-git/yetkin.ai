import "server-only";

import { createPrismaJuniorPorts } from "@/lib/junior/runtime";
import { listMebTracksForAge } from "@/lib/junior/meb-catalog";
import type { MebTrack } from "@/lib/junior/meb-catalog";
import {
  projectGuardianWard,
  projectOwnJuniorProfile,
  projectPendingInvite,
  projectAllowanceForBond,
  type GuardianInviteCitizenView,
  type JuniorOwnProfileView,
  type JuniorWardView,
} from "@/lib/junior/project";
import type { JuniorAllowanceRecord } from "@/lib/junior/types";

export async function loadJuniorBoard(userId: string): Promise<{
  profile: JuniorOwnProfileView | null;
  allowance: JuniorAllowanceRecord | null;
  tracks: MebTrack[];
  pendingInvite: GuardianInviteCitizenView | null;
} | null> {
  try {
    const ports = createPrismaJuniorPorts();
    const profile = await ports.junior.getProfileByUserId(userId);
    if (!profile) {
      return { profile: null, allowance: null, tracks: [], pendingInvite: null };
    }
    const invites = await ports.junior.listPendingInvitesForUser(userId);
    const pendingInvite =
      invites.map((row) => projectPendingInvite(row)).find((row) => row !== null) ?? null;
    const allowance = await ports.junior.getAllowanceByProfileId(profile.id);
    const view = projectOwnJuniorProfile(profile);
    return {
      profile: view,
      allowance: projectAllowanceForBond(profile, allowance),
      tracks: view.bondStatus === "ACTIVE" ? listMebTracksForAge(profile.dateOfBirth) : [],
      pendingInvite,
    };
  } catch {
    return null;
  }
}

export async function loadGuardianDesk(guardianUserId: string): Promise<{
  wards: JuniorWardView[];
  pendingInvites: GuardianInviteCitizenView[];
} | null> {
  try {
    const ports = createPrismaJuniorPorts();
    const [rawWards, invites] = await Promise.all([
      ports.junior.listWardsForGuardian(guardianUserId),
      ports.junior.listPendingInvitesForUser(guardianUserId),
    ]);
    return {
      wards: rawWards
        .map((row) => projectGuardianWard(row))
        .filter((row): row is JuniorWardView => row !== null),
      pendingInvites: invites
        .map((row) => projectPendingInvite(row))
        .filter((row): row is GuardianInviteCitizenView => row !== null),
    };
  } catch {
    return null;
  }
}
