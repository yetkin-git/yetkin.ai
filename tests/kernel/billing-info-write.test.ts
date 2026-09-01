import { describe, expect, it } from "vitest";
import {
  BILLING_INFO_UNAUTHORIZED,
  runBillingInfoGet,
  runBillingInfoPut,
  type BillingInfoStore,
} from "@/lib/kernel/identity/billing-info-write";
import {
  CHECKOUT_BILLING_PAYLOAD,
  type CheckoutBillingInfo,
} from "@/lib/kernel/identity/billing-info";

const CITIZEN_ID = "22222222-2222-4222-8222-222222222222";
const OTHER_ID = "33333333-3333-4333-8333-333333333333";
const CITIZEN = { id: CITIZEN_ID, email: "vatandas@yetkin.rail" };

function createMemoryBillingStore(): BillingInfoStore & {
  snapshot(userId: string): CheckoutBillingInfo | null;
} {
  const byId = new Map<string, CheckoutBillingInfo>();
  return {
    snapshot(userId) {
      const row = byId.get(userId);
      return row ? { ...row } : null;
    },
    async read(userId) {
      const row = byId.get(userId);
      return row ? { ...row } : null;
    },
    async upsert(input) {
      byId.set(input.userId, { ...input.billing });
      return { ...input.billing };
    },
  };
}

describe("profil fatura künyesi yazma", () => {
  it("oturumsuz GET/PUT 401 döner", async () => {
    const store = createMemoryBillingStore();
    const getResponse = await runBillingInfoGet({ session: null, getStore: () => store });
    expect(getResponse.status).toBe(401);
    expect(await getResponse.json()).toMatchObject({
      ok: false,
      error: BILLING_INFO_UNAUTHORIZED,
    });
    const putResponse = await runBillingInfoPut({
      session: null,
      body: CHECKOUT_BILLING_PAYLOAD,
      getStore: () => store,
    });
    expect(putResponse.status).toBe(401);
  });

  it("oturum sahibi kendi künyesini yazar; gövdedeki yabancı userId yok sayılır", async () => {
    const store = createMemoryBillingStore();
    const response = await runBillingInfoPut({
      session: CITIZEN,
      body: { ...CHECKOUT_BILLING_PAYLOAD, userId: OTHER_ID },
      getStore: () => store,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      data: { billing: CheckoutBillingInfo };
    };
    expect(body.ok).toBe(true);
    expect(body.data.billing).toEqual(CHECKOUT_BILLING_PAYLOAD);
    expect(store.snapshot(CITIZEN_ID)).toEqual(CHECKOUT_BILLING_PAYLOAD);
    expect(store.snapshot(OTHER_ID)).toBeNull();
  });

  it("kayıtlı künye yalnız oturum id ile okunur", async () => {
    const store = createMemoryBillingStore();
    await store.upsert({ userId: CITIZEN_ID, billing: CHECKOUT_BILLING_PAYLOAD });
    await store.upsert({
      userId: OTHER_ID,
      billing: { ...CHECKOUT_BILLING_PAYLOAD, fullName: "Başka Kişi" },
    });
    const response = await runBillingInfoGet({ session: CITIZEN, getStore: () => store });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      data: { billing: CheckoutBillingInfo };
    };
    expect(body.data.billing.invoiceType === "individual" ? body.data.billing.fullName : null).toBe(
      "Ayşe Kaya",
    );
  });
});
