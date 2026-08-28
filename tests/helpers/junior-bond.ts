import {
  acceptGuardianInvite,
  createGuardianInvite,
  upsertJuniorProfile,
  type JuniorEnginePorts,
} from "@/lib/junior/engine";

export async function completeJuniorGuardianship(
  ports: JuniorEnginePorts,
  input: {
    childUserId: string;
    guardianUserId: string;
    dateOfBirth: string;
    now: Date;
  },
) {
  await upsertJuniorProfile(ports, {
    userId: input.childUserId,
    dateOfBirth: input.dateOfBirth,
    now: input.now,
  });
  const invite = await createGuardianInvite(ports, {
    actorUserId: input.childUserId,
    now: input.now,
  });
  return acceptGuardianInvite(ports, {
    actorUserId: input.guardianUserId,
    token: invite.plaintext,
    now: input.now,
  });
}
