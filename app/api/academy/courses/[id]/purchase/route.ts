import { requireSession } from "@/lib/kernel/auth/session";
import { isV1CookieSessionBlocked } from "@/lib/kernel/http/api-v1";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { logEvent } from "@/lib/kernel/observability/log";
import { purchaseAcademyCourse } from "@/lib/academy/engine";
import { purchaseCourseInputSchema } from "@/lib/academy/schemas";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import {
  CHECKOUT_LEGAL_CONSENT_REQUIRED,
  isCheckoutLegalConsentIssue,
} from "@/lib/kernel/legal/checkout-consent";
import {
  checkoutBillingIssueMessage,
  isCheckoutBillingIssue,
} from "@/lib/kernel/identity/billing-info";
import { persistCheckoutBilling } from "@/lib/kernel/identity/billing-info-write";
import { createPrismaBillingInfoStore } from "@/lib/kernel/identity/prisma-billing-info-store";

export const auth = "session" as const;

/** Dron /api/v1 kimliği — nativeStore forbidden; IAP defense-in-depth. */
export const ACADEMY_PURCHASE_DRON_FORBIDDEN =
  "Akademi satın alma native istemciden kapalıdır.";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = resolveRequestId(request);
  try {
    // Dron v1 rewrite yolu (x-rail-pathname=/api/v1/...) — Amiral çerez/kanonik yol geçer.
    if (isV1CookieSessionBlocked(request)) {
      logEvent({
        level: "warn",
        event: "academy.purchase.dron_forbidden",
        requestId,
        route: "/api/academy/courses/[id]/purchase",
      });
      throw new ForbiddenError(ACADEMY_PURCHASE_DRON_FORBIDDEN);
    }
    const user = await requireSession(request);
    const { id } = await context.params;
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const parsed = purchaseCourseInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      const message = isCheckoutLegalConsentIssue(parsed.error)
        ? CHECKOUT_LEGAL_CONSENT_REQUIRED
        : isCheckoutBillingIssue(parsed.error)
          ? checkoutBillingIssueMessage(parsed.error)
          : "Satın alma gövdesi geçersiz.";
      return jsonFail(message, 400, requestId);
    }
    await persistCheckoutBilling(createPrismaBillingInfoStore(), user.id, parsed.data.billing);
    const ports = createPrismaAcademyPorts();
    const course = (await ports.academy.getCourse(id)) ?? (await ports.academy.getCourseBySlug(id));
    const courseId = course?.id ?? id;

    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/academy/courses/[id]/purchase",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({
          courseId,
          lockId: parsed.data.lockId,
          level: parsed.data.level ?? null,
          path: parsed.data.path ?? "training",
          consentVersion: parsed.data.consentVersion,
        }),
        requestId,
      },
      async () => {
        const result = await purchaseAcademyCourse(ports, {
          courseId,
          userId: user.id,
          lockId: parsed.data.lockId,
          level: parsed.data.level,
        });
        logEvent({
          level: "info",
          event: "academy.purchase.settled",
          requestId,
          userId: user.id,
          applied: result.applied,
          route: "/api/academy/courses/[id]/purchase",
          purpose: parsed.data.path ?? "training",
          consentVersion: parsed.data.consentVersion,
        });
        return {
          status: 200,
          body: {
            applied: result.applied,
            path: parsed.data.path ?? "training",
            purchase: {
              id: result.purchase.id,
              courseId: result.purchase.courseId,
              amountMinor: result.purchase.amountMinor,
              status: result.purchase.status,
            },
            certificate: result.certificate
              ? {
                  id: result.certificate.id,
                  serialKey: result.certificate.serialKey,
                }
              : null,
          },
        };
      },
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "academy.purchase.failed",
      requestId,
      route: "/api/academy/courses/[id]/purchase",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId);
  }
}
