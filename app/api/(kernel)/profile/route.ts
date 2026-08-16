import { getSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { runDisplayNamePatch } from "@/lib/kernel/identity/display-name-write";
import { createPrismaDisplayNameWriteStore } from "@/lib/kernel/identity/prisma-display-name-write";

export const auth = "session" as const;

export async function PATCH(request: Request) {
  try {
    const session = await getSession(request);
    const body: unknown = await request.json().catch(() => null);
    return await runDisplayNamePatch({
      session,
      body,
      getStore: createPrismaDisplayNameWriteStore,
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
