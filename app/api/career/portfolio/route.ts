import { attachTezgahOutputToPortfolio } from "@/lib/career/tezgah-portfolio";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { createPrismaCareerPorts } from "@/lib/career/runtime";
import { syncCareerVisaStamps } from "@/lib/career/engine";
import { projectLiveCareerBoard } from "@/lib/career/live";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

export const auth = "session" as const;

function publicPortfolio(
  portfolio: Awaited<ReturnType<typeof projectLiveCareerBoard>>["portfolio"],
) {
  return portfolio.map((item) => ({
    id: item.id,
    visaStampId: item.visaStampId,
    title: item.title,
    createdAt: item.createdAt.toISOString(),
  }));
}

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const ports = createPrismaCareerPorts();
    await syncCareerVisaStamps(ports, { userId: user.id });
    const board = await projectLiveCareerBoard(ports, user.id);
    return jsonOk({ portfolio: board.portfolio }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const raw = await request.json().catch(() => ({}));
    const tezgahOutputId =
      raw &&
      typeof raw === "object" &&
      "tezgahOutputId" in raw &&
      typeof (raw as { tezgahOutputId?: unknown }).tezgahOutputId === "string"
        ? (raw as { tezgahOutputId: string }).tezgahOutputId.trim()
        : "";
    if (tezgahOutputId && !/^[A-Za-z0-9_-]{8,40}$/.test(tezgahOutputId)) {
      return jsonFail("Çıktı bulunamadı.", 404, requestId, request);
    }
    const ports = createPrismaCareerPorts();
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/career/portfolio",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload(
          tezgahOutputId ? { userId: user.id, tezgahOutputId } : { userId: user.id },
        ),
        requestId,
        request,
      },
      async () => {
        if (tezgahOutputId) {
          const attached = await attachTezgahOutputToPortfolio(user.id, tezgahOutputId);
          if (!attached) {
            return { status: 404, body: { error: "Çıktı bulunamadı." } };
          }
        }
        const stamps = await syncCareerVisaStamps(ports, { userId: user.id });
        const board = await projectLiveCareerBoard(ports, user.id);
        return {
          status: 200,
          body: {
            applied: stamps.length > 0,
            portfolio: publicPortfolio(board.portfolio),
          },
        };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
