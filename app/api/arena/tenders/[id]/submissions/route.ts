import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { submitArenaProposal } from "@/lib/arena/engine";
import { submitProposalInputSchema } from "@/lib/arena/schemas";
import { createPrismaArenaPorts } from "@/lib/arena/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const parsed = submitProposalInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Teslim metni geçersiz.", 400);
    }
    const ports = createPrismaArenaPorts();
    const submission = await submitArenaProposal(ports, {
      tenderId: id,
      submitterId: user.id,
      proposal: parsed.data.proposal,
    });
    return jsonOk({ submission }, 201);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
