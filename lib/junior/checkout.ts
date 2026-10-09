import "server-only";

import { JUNIOR_GUARDIAN_NOTICE, JUNIOR_NOTICE_VERSION_ERROR } from "@/lib/junior/guardian-notice";
import { JUNIOR_ELECTIVE_QUOTA } from "@/lib/junior/limits";
import { juniorPaytrSaleGate } from "@/lib/junior/paytr";
import {
  juniorElectiveSaveSchema,
  isJuniorPlanActive,
  normalizeElectiveSelection,
  type JuniorSubscriptionRow,
} from "@/lib/junior/plan";
import type { JuniorStore } from "@/lib/junior/ports";
import type { JuniorProfileView } from "@/lib/junior/types";
import {
  checkoutBillingInfoSchema,
  checkoutBillingIssueMessage,
  isCheckoutBillingIssue,
  type CheckoutBillingInfo,
} from "@/lib/kernel/identity/billing-info";
import {
  CHECKOUT_LEGAL_CONSENT_REQUIRED,
  checkoutLegalConsentSchema,
  isCheckoutLegalConsentIssue,
  toCheckoutConsentEvidence,
  type CheckoutConsentEvidence,
} from "@/lib/kernel/legal/checkout-consent";
import type { JuniorActor } from "@/lib/kernel/security/junior-gate";
import { isJuniorAuditActor, JUNIOR_CHECKOUT_LOCKED_ERROR } from "@/lib/kernel/security/junior-gate";
import { z } from "zod";

type JuniorFail = {
  ok: false;
  status: 400 | 403 | 404 | 409 | 413 | 429 | 503;
  error: string;
};

type JuniorOk<T extends Record<string, unknown>> = { ok: true; data: T };

function toProfileView(row: {
  id: string;
  nickname: string;
  grade: number;
  birthYear: number | null;
  selected: boolean;
  selectedElectives: string[];
  gradeSwitchRights: number;
}): JuniorProfileView {
  return {
    id: row.id,
    nickname: row.nickname,
    grade: row.grade,
    birthYear: row.birthYear,
    selected: row.selected,
    selectedElectives: [...row.selectedElectives],
    gradeSwitchRights: row.gradeSwitchRights,
  };
}

export async function saveJuniorElectives(
  store: JuniorStore,
  userId: string,
  input: unknown,
): Promise<JuniorOk<{ profile: JuniorProfileView }> | JuniorFail> {
  const parsed = juniorElectiveSaveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "En fazla üç seçmeli ders seçilir." };
  }
  const normalized = normalizeElectiveSelection(parsed.data.slugs);
  if (!normalized.ok) {
    return { ok: false, status: 400, error: normalized.error };
  }
  const saved = await store.setSelectedElectives(userId, parsed.data.profileId, normalized.slugs);
  if (!saved) {
    return { ok: false, status: 404, error: "Bu profil senin hesabında yok." };
  }
  return { ok: true, data: { profile: toProfileView(saved) } };
}

/** Günlük neden kodu. Vatandaş cümlesi bu dize değildir. */
export const JUNIOR_CHECKOUT_NOT_CONFIGURED = "not_configured";

export const JUNIOR_CHECKOUT_CLOSED_MESSAGE = JUNIOR_CHECKOUT_LOCKED_ERROR;

export const JUNIOR_CHECKOUT_REFUSED_MESSAGE =
  "Canlı ödeme hattı hazır değil. Deneme mağaza gerçek satış açmaz.";

export const JUNIOR_CHECKOUT_PAYTR_MESSAGE =
  "Ödeme ekranı şu an açılamadı. Bağlantını kontrol edip biraz sonra yeniden dene.";

export const JUNIOR_CHECKOUT_GUARDIAN_REQUIRED = "Veli onayı olmadan ödeme ekranı açılmaz.";

export const JUNIOR_CHECKOUT_AUDIT_MESSAGE =
  "Denetim hesabı ödeme kaydı yazmaz. Kilitli dersler izleme ile açılır.";

export const JUNIOR_CHECKOUT_PRICE_MESSAGE = "Liste fiyatı katalogda yok. Tutar uydurulmaz.";

export const JUNIOR_CHECKOUT_LOGIN_MESSAGE = "Ödeme için veli girişi gerekir.";

export const JUNIOR_CHECKOUT_IDEMPOTENCY_MESSAGE =
  "Ödeme isteği eksik. Sayfayı yenileyip yeniden dene.";

const juniorIframeCheckoutSchema = checkoutLegalConsentSchema
  .extend({
    guardianConsentAccepted: z.literal(true),
    guardianNoticeVersion: z.literal(JUNIOR_GUARDIAN_NOTICE.version),
    billing: checkoutBillingInfoSchema,
  })
  .strict();

export type JuniorCheckoutOrderDraft = {
  userId: string;
  email: string;
  userIp: string;
  amountMinor: number;
  billing: CheckoutBillingInfo;
  consent: CheckoutConsentEvidence;
  idempotencyKey: string;
};

export type JuniorCheckoutPlaceResult =
  | { ok: true; kind: "iframe"; merchantOid: string; iframeUrl: string }
  | { ok: true; kind: "settled"; merchantOid: string; expiresAt: string | null }
  | { ok: false; status: 400 | 409 | 503; error: string };

export type JuniorCheckoutPorts = {
  readPrice: () => Promise<{ amountMinor: number } | null>;
  placeOrder: (draft: JuniorCheckoutOrderDraft) => Promise<JuniorCheckoutPlaceResult>;
};

function juniorCheckoutInputError(input: unknown): string | null {
  const parsed = juniorIframeCheckoutSchema.safeParse(input);
  if (parsed.success) {
    return null;
  }
  if (isCheckoutLegalConsentIssue(parsed.error)) {
    return CHECKOUT_LEGAL_CONSENT_REQUIRED;
  }
  const guardianVersion = parsed.error.issues.some((issue) => issue.path[0] === "guardianNoticeVersion");
  const guardianTick = parsed.error.issues.some((issue) => issue.path[0] === "guardianConsentAccepted");
  if (guardianVersion) {
    return JUNIOR_NOTICE_VERSION_ERROR;
  }
  if (guardianTick) {
    return JUNIOR_CHECKOUT_GUARDIAN_REQUIRED;
  }
  if (isCheckoutBillingIssue(parsed.error)) {
    return checkoutBillingIssueMessage(parsed.error);
  }
  return "Ödeme bilgisi eksik.";
}

/**
 * Onay tikleri tamamlanmadan sipariş kurulmaz ve PayTR çağrılmaz.
 * Paket bu fonksiyonda yazılmaz. CLEARED `junior-license:yearly` köprüsü yazar.
 * Denetim hesabı nakit satırı açmaz. Kart numarası bu yoldan okunmaz.
 */
export async function completeJuniorCheckout(
  store: JuniorStore,
  userId: string,
  input: unknown,
  now = new Date(),
  context?: {
    email?: string;
    userIp?: string;
    actor?: JuniorActor | null;
    env?: NodeJS.ProcessEnv;
    idempotencyKey?: string;
    ports?: JuniorCheckoutPorts;
  },
): Promise<
  | JuniorOk<{
      status: "ACTIVE" | "PENDING";
      electiveQuota: number;
      alreadyActive: boolean;
      expiresAt: string | null;
      merchantOid: string;
      iframeUrl: string;
      embedIframe: boolean;
    }>
  | JuniorFail
> {
  const env = context?.env ?? process.env;
  const existing = await store.getSubscription(userId);
  if (isJuniorPlanActive(existing, now)) {
    return {
      ok: true,
      data: {
        status: "ACTIVE",
        electiveQuota: existing?.electiveQuota ?? JUNIOR_ELECTIVE_QUOTA,
        alreadyActive: true,
        expiresAt: existing?.expiresAt?.toISOString() ?? null,
        merchantOid: existing?.providerRef ?? "",
        iframeUrl: "",
        embedIframe: false,
      },
    };
  }

  const gate = juniorPaytrSaleGate(env);
  if (gate === "closed") {
    return { ok: false, status: 503, error: JUNIOR_CHECKOUT_CLOSED_MESSAGE };
  }
  if (gate === "refused") {
    return { ok: false, status: 503, error: JUNIOR_CHECKOUT_REFUSED_MESSAGE };
  }
  if (isJuniorAuditActor(context?.actor ?? null, env)) {
    return { ok: false, status: 403, error: JUNIOR_CHECKOUT_AUDIT_MESSAGE };
  }

  const fieldError = juniorCheckoutInputError(input);
  if (fieldError) {
    return { ok: false, status: 400, error: fieldError };
  }
  const parsed = juniorIframeCheckoutSchema.parse(input);
  const email = context?.email?.trim() ?? "";
  const userIp = context?.userIp?.trim() ?? "";
  const idempotencyKey = context?.idempotencyKey?.trim() ?? "";
  if (!email) {
    return { ok: false, status: 400, error: JUNIOR_CHECKOUT_LOGIN_MESSAGE };
  }
  if (!idempotencyKey) {
    return { ok: false, status: 400, error: JUNIOR_CHECKOUT_IDEMPOTENCY_MESSAGE };
  }
  if (!context?.ports) {
    return { ok: false, status: 503, error: JUNIOR_CHECKOUT_PAYTR_MESSAGE };
  }

  const price = await context.ports.readPrice();
  if (!price || !Number.isInteger(price.amountMinor) || price.amountMinor <= 0) {
    return { ok: false, status: 503, error: JUNIOR_CHECKOUT_PRICE_MESSAGE };
  }

  const placed = await context.ports.placeOrder({
    userId,
    email,
    userIp,
    amountMinor: price.amountMinor,
    billing: parsed.billing,
    consent: toCheckoutConsentEvidence(parsed),
    idempotencyKey,
  });
  if (!placed.ok) {
    return placed;
  }
  if (placed.kind === "settled") {
    return {
      ok: true,
      data: {
        status: "ACTIVE",
        electiveQuota: JUNIOR_ELECTIVE_QUOTA,
        alreadyActive: true,
        expiresAt: placed.expiresAt,
        merchantOid: placed.merchantOid,
        iframeUrl: "",
        embedIframe: false,
      },
    };
  }
  return {
    ok: true,
    data: {
      status: "PENDING",
      electiveQuota: JUNIOR_ELECTIVE_QUOTA,
      alreadyActive: false,
      expiresAt: null,
      merchantOid: placed.merchantOid,
      iframeUrl: placed.iframeUrl,
      embedIframe: true,
    },
  };
}

export type { JuniorSubscriptionRow };
