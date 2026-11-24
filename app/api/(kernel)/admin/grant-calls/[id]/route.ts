import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { patchGrantCall } from "@/lib/yetkinhibe/grant-call-admin";
import { grantCallPatchSchema } from "@/lib/yetkinhibe/grant-call-write-schema";

export const auth = "admin" as const;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = resolveRequestId(request);
  try {
    const session = await requireSuperAdmin(request);
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const { id } = await context.params;
    const raw: unknown = await request.json().catch(() => null);
    const parsed = grantCallPatchSchema.safeParse(raw);
    if (!parsed.success || !id.trim()) {
      return jsonFail("Çağrı alanları geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: session.id,
        route: "/api/admin/grant-calls/[id]",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ id, ...parsed.data }),
        requestId,
        request,
      },
      async () => {
        const result = await patchGrantCall(id, parsed.data, session.id);
        if (!result.ok) {
          return { status: result.status, body: { error: result.error } };
        }
        return { status: 200, body: { id: result.id, dataVersion: result.dataVersion } };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error, 500, requestId, request);
  }
}
