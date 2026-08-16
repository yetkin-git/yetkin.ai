import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { readIdempotencyKey } from "@/lib/kernel/http/idempotency-key";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { logEvent } from "@/lib/kernel/observability/log";
import { getPrisma } from "@/lib/kernel/db";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { buildIdempotentMerchantOid } from "@/lib/kernel/payments/merchant-oid";
import { paytrPaymentProvider } from "@/lib/kernel/payments/paytr/adapter";
import {
  assertWalletTopUpAmountMinor,
  decideWalletTopUpReuse,
} from "@/lib/kernel/payments/wallet-top-up";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { z } from "zod";

export const auth = "session" as const;

const WALLET_TOP_UP_ROUTE = "/api/wallet/top-up";

const bodySchema = z.object({
  amountMinor: z.number().int(),
});

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = applyHttpRateLimit(request, HTTP_RATE_LIMITS.walletTopUpUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited);
    }
    const idempotency = readIdempotencyKey(request);
    if (!idempotency.ok) {
      return jsonFail(idempotency.error, 400, requestId);
    }
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Geçersiz yükleme tutarı.", 400, requestId);
    }
    const amountMinor = assertWalletTopUpAmountMinor(parsed.data.amountMinor);

    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: WALLET_TOP_UP_ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ amountMinor }),
        requestId,
      },
      async () => {
        const prisma = getPrisma();
        const merchantOid = buildIdempotentMerchantOid("walletTopUp", user.id, idempotency.key);
        let order = await prisma.paymentOrder.findUnique({ where: { merchantOid } });
        const decision = decideWalletTopUpReuse(order, user.id, amountMinor);
        if (decision.action === "conflict") {
          const message =
            decision.reason === "amount_mismatch"
              ? "Idempotency-Key aynı anahtarla farklı tutar kullanılamaz."
              : decision.reason === "failed_oid"
                ? "Bu Idempotency-Key başarısız bir emre bağlı; yeni anahtar kullanın."
                : "Idempotency-Key başka bir oturuma ait.";
          return { status: 409, body: { error: message } };
        }
        if (decision.action === "create") {
          try {
            order = await prisma.paymentOrder.create({
              data: {
                userId: user.id,
                provider: "paytr",
                merchantOid,
                purpose: "wallet-top-up",
                amountMinor,
                currencyCode: SETTLEMENT_CURRENCY,
                status: "PENDING",
              },
            });
          } catch (error) {
            if (!isUniqueViolation(error)) {
              throw error;
            }
            order = await prisma.paymentOrder.findUnique({ where: { merchantOid } });
          }
        }

        if (!order) {
          return { status: 503, body: { error: "Ödeme emri oluşturulamadı." } };
        }

        const raced = decideWalletTopUpReuse(order, user.id, amountMinor);
        if (raced.action === "conflict") {
          const message =
            raced.reason === "amount_mismatch"
              ? "Idempotency-Key aynı anahtarla farklı tutar kullanılamaz."
              : raced.reason === "failed_oid"
                ? "Bu Idempotency-Key başarısız bir emre bağlı; yeni anahtar kullanın."
                : "Idempotency-Key başka bir oturuma ait.";
          return { status: 409, body: { error: message } };
        }

        if (order.status === "CLEARED" || order.status === "PAID") {
          return {
            status: 200,
            body: {
              merchantOid: order.merchantOid,
              alreadySettled: order.status === "CLEARED",
              status: order.status,
            },
          };
        }

        const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const forwarded = request.headers.get("x-forwarded-for");
        const userIp = forwarded?.split(",")[0]?.trim() || "127.0.0.1";
        const checkout = await paytrPaymentProvider.beginCheckout({
          merchantOid,
          userIp,
          email: user.email,
          paymentAmountMinor: amountMinor,
          currencyCode: SETTLEMENT_CURRENCY,
          merchantOkUrl: `${origin}/cuzdan`,
          merchantFailUrl: `${origin}/cuzdan`,
          userBasket: [{ name: "Cuzdan yukleme", amountMinor, quantity: 1 }],
        });

        if (!checkout.ok) {
          logEvent({
            level: "warn",
            event: "wallet.top_up.checkout_failed",
            requestId,
            userId: user.id,
            merchantOid,
            amountMinor,
            reason: checkout.reason,
            route: WALLET_TOP_UP_ROUTE,
          });
          return { status: 503, body: { error: checkout.message } };
        }
        logEvent({
          level: "info",
          event: "wallet.top_up.pending",
          requestId,
          userId: user.id,
          merchantOid,
          amountMinor,
          route: WALLET_TOP_UP_ROUTE,
        });
        return {
          status: 200,
          body: {
            merchantOid: checkout.merchantOid,
            token: checkout.token,
            iframeUrl: checkout.iframeUrl,
            sandboxMode: checkout.sandboxMode,
            ...(checkout.mockCheckout ? { mockCheckout: true } : {}),
          },
        };
      },
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "wallet.top_up.failed",
      requestId,
      route: WALLET_TOP_UP_ROUTE,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId);
  }
}
