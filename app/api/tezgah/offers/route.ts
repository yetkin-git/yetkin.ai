import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { loadTezgahOffers } from "@/lib/tezgah/offers";

/** Katalog vitrini. Satır yoksa open false. Tutar kodda sabit değildir. */
export const auth = "public" as const;

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request).catch(() => null);
    const board = await loadTezgahOffers(user?.id ?? null);
    return jsonOk(board, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
