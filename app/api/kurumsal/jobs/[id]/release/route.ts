import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { releaseCorporateJobPosting } from "@/lib/kurumsal/engine";
import { createPrismaKurumsalPorts } from "@/lib/kurumsal/runtime";
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
    const ports = createPrismaKurumsalPorts();
    const posting = await releaseCorporateJobPosting(ports, {
      postingId: id,
      actorUserId: user.id,
    });
    const visa =
      posting.status === "RELEASED" && posting.workbenchKind === "FREELANCER"
        ? await tryIssueCareerVisaStamp(createPrismaCareerPorts(), {
            sourceKind: "FREELANCER_RELEASE",
            sourceId: posting.id,
            actorUserId: user.id,
          })
        : null;
    return jsonOk({ posting, visaStamp: visa?.stamp ?? null });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
