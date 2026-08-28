import type {
  GuardianBondStatus,
  GuardianInviteRecord,
  JuniorAllowanceRecord,
  JuniorProfileRecord,
} from "@/lib/junior/types";

const MASK = "••••";

export function isActiveGuardianship(profile: JuniorProfileRecord): boolean {
  return (
    profile.status === "GUARDIAN_LINKED" &&
    profile.guardianConsentAt !== null &&
    Boolean(profile.guardianUserId)
  );
}

export function bondStatusOf(profile: JuniorProfileRecord | null): GuardianBondStatus | null {
  if (!profile) {
    return null;
  }
  return isActiveGuardianship(profile) ? "ACTIVE" : "PENDING";
}

export function maskAccountId(id: string | null | undefined): string | null {
  if (!id) {
    return null;
  }
  const trimmed = id.trim();
  if (trimmed.length <= 4) {
    return MASK;
  }
  return `${MASK}${trimmed.slice(-4)}`;
}

export function maskDateOfBirth(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }
  const year = iso.trim().slice(0, 4);
  if (!/^\d{4}$/.test(year)) {
    return MASK;
  }
  return `${year}-••-••`;
}

export type GuardianInviteCitizenView = {
  id: string;
  tokenPrefix: string;
  initiatorRole: GuardianInviteRecord["initiatorRole"];
  status: "PENDING";
  expiresAt: string;
};

export type JuniorOwnProfileView = {
  id: string;
  userId: string;
  dateOfBirth: string;
  dateOfBirthMasked: string | null;
  guardianUserIdMasked: string | null;
  status: JuniorProfileRecord["status"];
  bondStatus: GuardianBondStatus;
  hasGuardianConsent: boolean;
  mebTrackKey: string | null;
};

export type JuniorWardView = {
  profileId: string;
  childUserId: string;
  childUserIdMasked: string;
  dateOfBirthMasked: string | null;
  status: JuniorProfileRecord["status"];
  bondStatus: "ACTIVE";
  mebTrackKey: string | null;
};

export function projectPendingInvite(
  invite: GuardianInviteRecord,
  now = new Date(),
): GuardianInviteCitizenView | null {
  if (invite.status !== "PENDING" || invite.expiresAt.getTime() <= now.getTime()) {
    return null;
  }
  return {
    id: invite.id,
    tokenPrefix: invite.tokenPrefix,
    initiatorRole: invite.initiatorRole,
    status: "PENDING",
    expiresAt: invite.expiresAt.toISOString(),
  };
}

export function projectOwnJuniorProfile(
  profile: JuniorProfileRecord,
): JuniorOwnProfileView {
  const active = isActiveGuardianship(profile);
  return {
    id: profile.id,
    userId: profile.userId,
    dateOfBirth: profile.dateOfBirth,
    dateOfBirthMasked: maskDateOfBirth(profile.dateOfBirth),
    guardianUserIdMasked: maskAccountId(profile.guardianUserId),
    status: profile.status,
    bondStatus: active ? "ACTIVE" : "PENDING",
    hasGuardianConsent: active,
    mebTrackKey: active ? profile.mebTrackKey : null,
  };
}

export function projectGuardianWard(profile: JuniorProfileRecord): JuniorWardView | null {
  if (!isActiveGuardianship(profile) || !profile.guardianUserId) {
    return null;
  }
  return {
    profileId: profile.id,
    childUserId: profile.userId,
    childUserIdMasked: maskAccountId(profile.userId) ?? "••••",
    dateOfBirthMasked: maskDateOfBirth(profile.dateOfBirth),
    status: profile.status,
    bondStatus: "ACTIVE",
    mebTrackKey: profile.mebTrackKey,
  };
}

export function projectAllowanceForBond(
  profile: JuniorProfileRecord,
  allowance: JuniorAllowanceRecord | null,
): JuniorAllowanceRecord | null {
  if (!isActiveGuardianship(profile)) {
    return null;
  }
  return allowance;
}
