import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { isV1JsonRequest } from "@/lib/kernel/http/api-v1";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { logEvent } from "@/lib/kernel/observability/log";
import { getPrisma } from "@/lib/kernel/db";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { failPaymentOrder } from "@/lib/kernel/payments/clearing";
import { buildIdempotentMerchantOid } from "@/lib/kernel/payments/merchant-oid";
import { paytrPaymentProvider } from "@/lib/kernel/payments/paytr/adapter";
import {
  PAYMENTS_UNCONFIGURED_ERROR,
  isPaymentsPortConfigured,
} from "@/lib/kernel/payments/port";
import {
  assertPaytrLiveUserIp,
  assertPaytrProductionSafety,
  buildPaytrMerchantBrowserReturnUrl,
  isPaytrMockCheckoutAllowed,
  isPaytrSandboxEnabled,
  resolvePaytrCheckoutUserIp,
  resolvePaytrMerchantAppOrigin,
} from "@/lib/kernel/payments/paytr/checkout";
import { createPrismaPaymentOrderStore } from "@/lib/kernel/payments/prisma-order-store";
import {
  assertWalletTopUpAmountMinor,
  decideWalletTopUpReuse,
  shouldFailCloseMockTopUp,
  toWalletTopUpWire,
  type WalletTopUpStatus,
} from "@/lib/kernel/payments/wallet-top-up";
import {
  buildPaytrDronCheckoutReturnUrl,
  buildWalletCheckoutPassportUrl,
  mintWalletCheckoutPassport,
} from "@/lib/kernel/payments/wallet-checkout-passport";
import { tryGetPaytrIframeUrl } from "@/lib/kernel/payments/paytr/iframe-embed";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import {
  CLOUDFLARE_VERCEL_TRUSTED_PROXY_HOPS,
  classifyForwardedIp,
  parseTrustedProxyHops,
} from "@/lib/kernel/security/trusted-proxy";
import { z } from "zod";
import {
  CHECKOUT_LEGAL_CONSENT_REQUIRED,
  checkoutLegalConsentSchema,
  isCheckoutLegalConsentIssue,
  toCheckoutConsentEvidence,
} from "@/lib/kernel/legal/checkout-consent";
import {
  checkoutBillingInfoSchema,
  checkoutBillingIssueMessage,
  isCheckoutBillingIssue,
  paytrUserFromBilling,
} from "@/lib/kernel/identity/billing-info";
import { persistCheckoutBilling } from "@/lib/kernel/identity/billing-info-write";
import { createPrismaBillingInfoStore } from "@/lib/kernel/identity/prisma-billing-info-store";
import {
  academyLicenseOrderPurpose,
  readAcademyLicenseSlug,
} from "@/lib/academy/paytr-license-bridge";
import { academyCourseSaleOpen, isAcademyLicenseSaleSlug } from "@/lib/academy/pilot-sku";
import { WALLET_TOP_UP_PURPOSE } from "@/lib/kernel/payments/clearing";

export const auth = "session" as const;

const WALLET_TOP_UP_ROUTE = "/api/wallet/top-up";

const bodySchema = checkoutLegalConsentSchema.extend({
  amountMinor: z.number().int(),
  billing: checkoutBillingInfoSchema,
  courseSlug: z.string().trim().min(1).max(64).optional(),
});

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

function settledWalletTopUpWire(
  merchantOid: string,
  status: WalletTopUpStatus,
): ReturnType<typeof toWalletTopUpWire> {
  return toWalletTopUpWire({
    merchantOid,
    alreadySettled: status === "CLEARED",
    status,
  });
}

function mintCheckoutPassportUrl(input: {
  origin: string;
  userId: string;
  merchantOid: string;
  token: string;
}): string | null {
  try {
    const iframe = tryGetPaytrIframeUrl(input.token);
    if (!iframe) {
      return null;
    }
    const passport = mintWalletCheckoutPassport({
      userId: input.userId,
      merchantOid: input.merchantOid,
      token: input.token,
    });
    return buildWalletCheckoutPassportUrl(input.origin, passport);
  } catch {
    return null;
  }
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
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      const message = isCheckoutLegalConsentIssue(parsed.error)
        ? CHECKOUT_LEGAL_CONSENT_REQUIRED
        : isCheckoutBillingIssue(parsed.error)
          ? checkoutBillingIssueMessage(parsed.error)
          : "Geçersiz yükleme tutarı.";
      return jsonFail(message, 400, requestId, request);
    }
    const amountMinor = assertWalletTopUpAmountMinor(parsed.data.amountMinor);
    const courseSlug = parsed.data.courseSlug;
    if (courseSlug && !isAcademyLicenseSaleSlug(courseSlug)) {
      return jsonFail("Kurs kodu geçersiz.", 400, requestId, request);
    }
    if (courseSlug && !academyCourseSaleOpen(courseSlug)) {
      return jsonFail("Kurs satışa kapalı.", 400, requestId, request);
    }
    if (courseSlug && !readAcademyLicenseSlug(academyLicenseOrderPurpose(courseSlug))) {
      return jsonFail("Kurs satışa kapalı.", 400, requestId, request);
    }
    const orderPurpose = courseSlug ? academyLicenseOrderPurpose(courseSlug) : WALLET_TOP_UP_PURPOSE;
    await persistCheckoutBilling(createPrismaBillingInfoStore(), user.id, parsed.data.billing);

    if (!isPaymentsPortConfigured() && !isPaytrMockCheckoutAllowed()) {
      logEvent({
        level: "warn",
        event: "wallet.top_up.port_unconfigured",
        requestId,
        userId: user.id,
        amountMinor,
        route: WALLET_TOP_UP_ROUTE,
      });
      return jsonFail(PAYMENTS_UNCONFIGURED_ERROR, 503, requestId, request);
    }

    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: WALLET_TOP_UP_ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({
          amountMinor,
          consentVersion: parsed.data.consentVersion,
          ...(courseSlug ? { courseSlug } : {}),
        }),
        requestId,
        request,
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

        if (order && (order.status === "CLEARED" || order.status === "PAID")) {
          return {
            status: 200,
            body: settledWalletTopUpWire(order.merchantOid, order.status),
          };
        }

        const origin = resolvePaytrMerchantAppOrigin();
        const hops = parseTrustedProxyHops();
        const userIp = resolvePaytrCheckoutUserIp(request.headers);
        const ipKind = classifyForwardedIp(userIp);
        logEvent({
          level:
            process.env.NODE_ENV === "production" && ipKind !== "public_ipv4" ? "warn" : "info",
          event: "paytr.user_ip.resolved",
          requestId,
          userId: user.id,
          route: WALLET_TOP_UP_ROUTE,
          reason: `hops=${hops} ipKind=${ipKind} live=${!isPaytrSandboxEnabled()}`,
        });
        if (
          process.env.NODE_ENV === "production" &&
          hops < CLOUDFLARE_VERCEL_TRUSTED_PROXY_HOPS
        ) {
          logEvent({
            level: "warn",
            event: "ops.proxy.hops_edge_mismatch",
            requestId,
            userId: user.id,
            route: WALLET_TOP_UP_ROUTE,
            reason: `TRUSTED_PROXY_HOPS=${hops}; Cloudflare+Vercel canli recete=${CLOUDFLARE_VERCEL_TRUSTED_PROXY_HOPS}`,
          });
        }
        assertPaytrProductionSafety("wallet.top_up:before-insert");
        assertPaytrLiveUserIp(userIp, "wallet.top_up");

        if (decision.action === "create") {
          try {
            order = await prisma.paymentOrder.create({
              data: {
                userId: user.id,
                provider: "paytr",
                merchantOid,
                purpose: orderPurpose,
                amountMinor,
                currencyCode: SETTLEMENT_CURRENCY,
                status: "PENDING",
                ...toCheckoutConsentEvidence(parsed.data),
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
            body: settledWalletTopUpWire(order.merchantOid, order.status),
          };
        }

        const dronCheckout = isV1JsonRequest(request);
        const merchantReturnUrl = dronCheckout
          ? buildPaytrDronCheckoutReturnUrl(origin, "ok")
          : buildPaytrMerchantBrowserReturnUrl(origin);
        const merchantFailUrl = dronCheckout
          ? buildPaytrDronCheckoutReturnUrl(origin, "fail")
          : buildPaytrMerchantBrowserReturnUrl(origin);

        let checkout: Awaited<ReturnType<typeof paytrPaymentProvider.beginCheckout>>;
        const paytrUser = paytrUserFromBilling(parsed.data.billing);
        try {
          checkout = await paytrPaymentProvider.beginCheckout({
            merchantOid,
            userIp,
            email: user.email,
            paymentAmountMinor: amountMinor,
            currencyCode: SETTLEMENT_CURRENCY,
            merchantOkUrl: merchantReturnUrl,
            merchantFailUrl,
            userBasket: [
              {
                name: courseSlug ? `Akademi ${courseSlug}` : "Cuzdan yukleme",
                amountMinor,
                quantity: 1,
              },
            ],
            userName: paytrUser.userName,
            userAddress: paytrUser.userAddress,
            userPhone: paytrUser.userPhone,
          });
        } catch (error) {
          await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid);
          throw error;
        }

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
          // Get-token / beginCheckout 503: aynı istekte PENDING kapanır. CREDIT yok.
          await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid);
          const status = checkout.reason === "invalid_user" || checkout.reason === "invalid_amount" ? 400 : 503;
          const error =
            checkout.reason === "missing_credentials" ? PAYMENTS_UNCONFIGURED_ERROR : checkout.message;
          return { status, body: { error } };
        }
        if (shouldFailCloseMockTopUp(checkout.mockCheckout)) {
          logEvent({
            level: "warn",
            event: "wallet.top_up.mock_no_credit",
            requestId,
            userId: user.id,
            merchantOid,
            amountMinor,
            reason: "mock_checkout",
            route: WALLET_TOP_UP_ROUTE,
          });
          await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid);
          return {
            status: 200,
            body: toWalletTopUpWire({
              merchantOid: checkout.merchantOid,
              sandboxMode: checkout.sandboxMode,
              mockCheckout: true,
              status: "FAILED",
            }),
          };
        }
        const iframeUrl = tryGetPaytrIframeUrl(checkout.token) ?? checkout.iframeUrl ?? null;
        const checkoutPassportUrl = mintCheckoutPassportUrl({
          origin,
          userId: user.id,
          merchantOid: checkout.merchantOid,
          token: checkout.token,
        });
        if (dronCheckout && !checkoutPassportUrl) {
          logEvent({
            level: "warn",
            event: "wallet.top_up.passport_unavailable",
            requestId,
            userId: user.id,
            merchantOid,
            route: WALLET_TOP_UP_ROUTE,
          });
        }
        logEvent({
          level: "info",
          event: "wallet.top_up.pending",
          requestId,
          userId: user.id,
          merchantOid,
          amountMinor,
          route: WALLET_TOP_UP_ROUTE,
          consentVersion: parsed.data.consentVersion,
        });
        return {
          status: 200,
          body: toWalletTopUpWire({
            merchantOid: checkout.merchantOid,
            token: checkout.token,
            iframeUrl,
            sandboxMode: checkout.sandboxMode,
            status: "PENDING",
            checkoutPassportUrl,
          }),
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
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
