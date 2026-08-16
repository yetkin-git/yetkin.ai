import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { postContractMessageInputSchema } from "@/lib/freelancer/schemas";
import {
  listFreelancerContractMessages,
  postFreelancerContractMessage,
} from "@/lib/freelancer/messages";
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
    const messages = await listFreelancerContractMessages(ports, {
      contractId: id,
      actorUserId: user.id,
    });
    return jsonOk({ messages });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const parsed = postContractMessageInputSchema.safeParse(
      await request.json().catch(() => ({})),
    );
    if (!parsed.success) {
      return jsonFail("Mesaj gövdesi geçersiz.", 400);
    }
    const ports = createPrismaFreelancerPorts();
    const message = await postFreelancerContractMessage(ports, {
      contractId: id,
      actorUserId: user.id,
      kind: parsed.data.kind,
      body: parsed.data.body,
      artifactUrl: parsed.data.artifactUrl,
    });
    return jsonOk({ message }, 201);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
