import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { refundUnusedWalletBalanceForUser } from "@/lib/kernel/payments/prisma-wallet-card-refund";
import {
  isPaytrMissingCredentialsError,
  isPaytrProductionSafetyError,
} from "@/lib/kernel/payments/paytr/checkout";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

export const auth = "session" as const;

const WALLET_REFUND_ROUTE = "/api/wallet/refund";
const WALLET_REFUND_TABLE_MISSING = "İade kaydı henüz hazır değil.";

function isWalletRefundTableMissing(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return message.includes("wallet_card_refunds") && /42P01|does not exist|P2021/i.test(message);
}

function refundFailure(error: unknown, requestId: string, request: Request) {
  if (isPaytrProductionSafetyError(error) || isPaytrMissingCredentialsError(error)) {
    return jsonFail(error.message, 503, requestId, request);
  }
  if (isWalletRefundTableMissing(error)) {
    return jsonFail(WALLET_REFUND_TABLE_MISSING, 503, requestId, request);
  }
  return jsonFromUnknown(error, 500, requestId, request);
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.walletTopUpUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    return await settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: WALLET_REFUND_ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ intent: "wallet-card-refund" }),
        requestId,
        request,
      },
      async () => {
        const result = await refundUnusedWalletBalanceForUser(user.id);
        return { status: 200, body: { refund: result } };
      },
    );
  } catch (error) {
    return refundFailure(error, requestId, request);
  }
}
