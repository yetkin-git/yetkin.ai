import "server-only";

import { storeIdFromCommerceMerchantOid } from "@/lib/commerce/subscription";
import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";

/** PayTR bildirimdeki kart saklama jetonunu mağaza lisansına yazar. Boş jeton yok sayılır. */
export async function rememberCommercePaytrCardTokens(
  merchantOid: string,
  tokens: { utoken: string; ctoken: string },
): Promise<void> {
  const utoken = tokens.utoken.trim();
  const ctoken = tokens.ctoken.trim();
  if (!utoken && !ctoken) {
    return;
  }
  const storeId = storeIdFromCommerceMerchantOid(merchantOid);
  if (!storeId) {
    return;
  }
  const data: { paytrUtoken?: string; paytrCtoken?: string } = {};
  if (utoken) {
    data.paytrUtoken = utoken;
  }
  if (ctoken) {
    data.paytrCtoken = ctoken;
  }
  const updated = await getPrisma().commerceSubscription.updateMany({ where: { storeId }, data });
  logEvent({
    level: "info",
    event: "commerce.subscription.card_token",
    merchantOid,
    applied: updated.count === 1,
  });
}
