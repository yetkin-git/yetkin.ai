import {
  isJuniorSurfaceLocked,
  JUNIOR_PRODUCTION_LOCKED_ERROR,
} from "@/lib/kernel/compliance/circuit-breakers";
import { jsonFail } from "@/lib/kernel/http/json";

/** Bayrak veya üretim kilidi kapalıyken Junior API gövdesi. */
export function juniorLockedResponse(requestId: string, request: Request) {
  if (!isJuniorSurfaceLocked()) {
    return null;
  }
  return jsonFail(JUNIOR_PRODUCTION_LOCKED_ERROR, 503, requestId, request);
}
