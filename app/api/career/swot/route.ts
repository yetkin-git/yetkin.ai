import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { loadCareerEvidence } from "@/lib/career/evidence";
import { buildCareerRoadmap } from "@/lib/career/roadmap";
import { buildCareerSwot } from "@/lib/career/swot";

/** Deterministik SWOT ve 30/60/90. Model çağrılmaz. Merit yazılmaz. */
export const auth = "session" as const;

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const evidence = await loadCareerEvidence(user.id);
    return jsonOk(
      {
        swot: buildCareerSwot(evidence),
        roadmap: buildCareerRoadmap(evidence),
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
