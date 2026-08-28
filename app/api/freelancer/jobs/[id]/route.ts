import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { queryJobBoard } from "@/lib/freelancer/job-board";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaFreelancerPorts();
    const board = await queryJobBoard(ports.freelancer, id, user.id);
    if (!board) {
      return jsonFail("İlan bulunamadı.", 404, undefined, request);
    }
    return jsonOk(
      {
        job: board.job,
        bids: board.bids,
        contract: board.contract,
        viewerRole: board.viewerRole,
      },
      200,
      undefined,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
