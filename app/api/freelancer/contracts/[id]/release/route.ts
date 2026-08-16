import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { releaseFreelancerContract } from "@/lib/freelancer/engine";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";
import { tryIssueCareerVisaStamp } from "@/lib/career/engine";
import { createPrismaCareerPorts } from "@/lib/career/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaFreelancerPorts();
    const contract = await releaseFreelancerContract(ports, {
      contractId: id,
      actorUserId: user.id,
    });
    const visa =
      contract.status === "RELEASED"
        ? await tryIssueCareerVisaStamp(createPrismaCareerPorts(), {
            sourceKind: "FREELANCER_RELEASE",
            sourceId: contract.id,
            actorUserId: user.id,
          })
        : null;
    return jsonOk({ contract, visaStamp: visa?.stamp ?? null });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
