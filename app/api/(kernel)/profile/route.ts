import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { patchDisplayName, displayNamePatchBodySchema, DISPLAY_NAME_INVALID } from "@/lib/kernel/identity/display-name-write";
import { createPrismaDisplayNameWriteStore } from "@/lib/kernel/identity/prisma-display-name-write";

export const auth = "session" as const;

export async function PATCH(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const body: unknown = await request.json().catch(() => null);
    const parsed = displayNamePatchBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonFail(DISPLAY_NAME_INVALID, 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/profile",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ displayName: parsed.data.displayName }),
        requestId,
        request,
      },
      async () => {
        const profile = await patchDisplayName(createPrismaDisplayNameWriteStore(), {
          actorUserId: user.id,
          displayName: parsed.data.displayName,
        });
        return {
          status: 200,
          body: {
            profile: {
              userId: profile.userId,
              email: profile.email,
              displayName: profile.displayName,
              locale: profile.locale,
              timeZone: profile.timeZone,
              createdAt: profile.createdAt.toISOString(),
            },
          },
        };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
