import {
  canEnterJunior,
  JUNIOR_CHECKOUT_LOCKED_ERROR,
  JUNIOR_CLOSED_BETA_ERROR,
  JUNIOR_PROFILE_PLAN_ERROR,
  type JuniorActor,
  type JuniorEnterIntent,
} from "@/lib/kernel/security/junior-gate";
import { jsonFail } from "@/lib/kernel/http/json";

/** Kapalı beta, paketsiz profil veya kasa kapalıyken Junior API gövdesi. */
export function juniorLockedResponse(
  requestId: string,
  request: Request,
  actor: JuniorActor | null = null,
  intent: Extract<JuniorEnterIntent, "profile" | "checkout"> = "profile",
  gate: { planCovers?: boolean } | null = null,
) {
  const decision = canEnterJunior(actor, null, { intent, planCovers: gate?.planCovers });
  if (decision.allow) {
    return null;
  }
  if (intent === "checkout") {
    return jsonFail(JUNIOR_CHECKOUT_LOCKED_ERROR, 503, requestId, request);
  }
  if (actor?.id) {
    return jsonFail(JUNIOR_PROFILE_PLAN_ERROR, 403, requestId, request);
  }
  return jsonFail(JUNIOR_CLOSED_BETA_ERROR, 503, requestId, request);
}
