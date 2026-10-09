import {
  canEnterJunior,
  JUNIOR_CHECKOUT_LOCKED_ERROR,
  JUNIOR_CLOSED_BETA_ERROR,
  type JuniorActor,
  type JuniorEnterIntent,
} from "@/lib/kernel/security/junior-gate";
import { jsonFail } from "@/lib/kernel/http/json";

/** Kapalı beta veya kasa kapalıyken Junior API gövdesi. İzinli aktör profil masasına girer. */
export function juniorLockedResponse(
  requestId: string,
  request: Request,
  actor: JuniorActor | null = null,
  intent: Extract<JuniorEnterIntent, "profile" | "checkout"> = "profile",
) {
  const decision = canEnterJunior(actor, null, { intent });
  if (decision.allow) {
    return null;
  }
  const message = intent === "checkout" ? JUNIOR_CHECKOUT_LOCKED_ERROR : JUNIOR_CLOSED_BETA_ERROR;
  return jsonFail(message, 503, requestId, request);
}
