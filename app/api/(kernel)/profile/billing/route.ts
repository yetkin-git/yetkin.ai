import { getSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { runBillingInfoGet, runBillingInfoPut } from "@/lib/kernel/identity/billing-info-write";
import { createPrismaBillingInfoStore } from "@/lib/kernel/identity/prisma-billing-info-store";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    return await runBillingInfoGet({
      session,
      getStore: createPrismaBillingInfoStore,
      request,
    });
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession(request);
    const body: unknown = await request.json().catch(() => null);
    return await runBillingInfoPut({
      session,
      body,
      getStore: createPrismaBillingInfoStore,
      request,
    });
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
