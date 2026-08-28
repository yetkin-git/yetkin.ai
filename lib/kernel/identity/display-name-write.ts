import { z } from "zod";
import type { SessionUser } from "@/lib/kernel/auth/ids";
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import { NotFoundError, BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import {
  DISPLAY_NAME_MAX_LENGTH,
  PROFILE_WRITE_PATH,
  type IdentityProfile,
} from "@/lib/kernel/identity/types";

export { DISPLAY_NAME_MAX_LENGTH, PROFILE_WRITE_PATH };
export const DISPLAY_NAME_UNAUTHORIZED = "Oturum gerekli.";
export const DISPLAY_NAME_INVALID = "Görünen ad geçersiz.";
export const DISPLAY_NAME_NOT_FOUND = "Kimlik satırı henüz yok.";

export type DisplayNameWriteStore = {
  updateDisplayName(input: {
    userId: string;
    displayName: string;
  }): Promise<IdentityProfile | null>;
};

export const displayNamePatchBodySchema = z
  .object({
    displayName: z.string(),
  })
  .strict();

export function assertDisplayName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > DISPLAY_NAME_MAX_LENGTH || /[\r\n\0]/.test(trimmed)) {
    throw new BadRequestError(DISPLAY_NAME_INVALID);
  }
  return trimmed;
}

export async function patchDisplayName(
  store: DisplayNameWriteStore,
  command: { actorUserId: string; displayName: string },
): Promise<IdentityProfile> {
  if (!isSupabaseUserId(command.actorUserId)) {
    throw new AuthRequiredError(DISPLAY_NAME_UNAUTHORIZED);
  }
  const displayName = assertDisplayName(command.displayName);
  const profile = await store.updateDisplayName({
    userId: command.actorUserId,
    displayName,
  });
  if (!profile) {
    throw new NotFoundError(DISPLAY_NAME_NOT_FOUND);
  }
  return profile;
}

export async function runDisplayNamePatch(input: {
  session: SessionUser | null;
  body: unknown;
  getStore: () => DisplayNameWriteStore;
}) {
  try {
    if (!input.session) {
      throw new AuthRequiredError(DISPLAY_NAME_UNAUTHORIZED);
    }
    const parsed = displayNamePatchBodySchema.safeParse(input.body);
    if (!parsed.success) {
      return jsonFail(DISPLAY_NAME_INVALID, 400);
    }
    const profile = await patchDisplayName(input.getStore(), {
      actorUserId: input.session.id,
      displayName: parsed.data.displayName,
    });
    return jsonOk({
      profile: {
        userId: profile.userId,
        email: profile.email,
        displayName: profile.displayName,
        locale: profile.locale,
        timeZone: profile.timeZone,
        createdAt: profile.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
