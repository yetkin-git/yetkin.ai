import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { createGrantCall } from "@/lib/yetkinhibe/grant-call-admin";
import { grantCallWriteSchema } from "@/lib/yetkinhibe/grant-call-write-schema";

export const auth = "admin" as const;

const ROUTE = "/api/admin/grant-calls";

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const session = await requireSuperAdmin(request);
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const raw: unknown = await request.json().catch(() => null);
    const parsed = grantCallWriteSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonFail("Çağrı alanları geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: session.id,
        route: ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload(parsed.data),
        requestId,
        request,
      },
      async () => {
        const result = await createGrantCall(parsed.data, session.id);
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
