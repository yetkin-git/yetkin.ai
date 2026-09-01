import type { SessionUser } from "@/lib/kernel/auth/ids";
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import {
  CHECKOUT_BILLING_REQUIRED,
  checkoutBillingInfoSchema,
  type CheckoutBillingInfo,
} from "@/lib/kernel/identity/billing-info";

export const BILLING_INFO_UNAUTHORIZED = "Oturum gerekli.";

export type BillingInfoStore = {
  read(userId: string): Promise<CheckoutBillingInfo | null>;
  upsert(input: { userId: string; billing: CheckoutBillingInfo }): Promise<CheckoutBillingInfo>;
};

export async function readBillingInfo(
  store: BillingInfoStore,
  actorUserId: string,
): Promise<CheckoutBillingInfo | null> {
  if (!isSupabaseUserId(actorUserId)) {
    throw new AuthRequiredError(BILLING_INFO_UNAUTHORIZED);
  }
  return store.read(actorUserId);
}

export async function persistCheckoutBilling(
  store: BillingInfoStore,
  actorUserId: string,
  billing: CheckoutBillingInfo,
): Promise<CheckoutBillingInfo> {
  if (!isSupabaseUserId(actorUserId)) {
    throw new AuthRequiredError(BILLING_INFO_UNAUTHORIZED);
  }
  return store.upsert({ userId: actorUserId, billing });
}

export async function runBillingInfoGet(input: {
  session: SessionUser | null;
  getStore: () => BillingInfoStore;
  request?: Request;
}) {
  try {
    if (!input.session) {
      throw new AuthRequiredError(BILLING_INFO_UNAUTHORIZED);
    }
    const billing = await readBillingInfo(input.getStore(), input.session.id);
    return jsonOk({ billing }, 200, undefined, input.request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, input.request);
  }
}

export async function runBillingInfoPut(input: {
  session: SessionUser | null;
  body: unknown;
  getStore: () => BillingInfoStore;
  request?: Request;
}) {
  try {
    if (!input.session) {
      throw new AuthRequiredError(BILLING_INFO_UNAUTHORIZED);
    }
    const parsed = checkoutBillingInfoSchema.safeParse(input.body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message?.trim() || CHECKOUT_BILLING_REQUIRED;
      return jsonFail(message, 400, undefined, input.request);
    }
    const billing = await persistCheckoutBilling(input.getStore(), input.session.id, parsed.data);
    return jsonOk({ billing }, 200, undefined, input.request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, input.request);
  }
}
