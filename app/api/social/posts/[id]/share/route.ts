import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { interactWithProof } from "@/lib/social/engine";
import { socialInteractionInputSchema } from "@/lib/social/schemas";
import { createPrismaSocialPorts } from "@/lib/social/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    let note: string | undefined;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const parsed = socialInteractionInputSchema.safeParse(await request.json());
      if (!parsed.success) {
        return jsonFail("Paylaşım gövdesi geçersiz.", 400);
      }
      note = parsed.data.note;
    }
    const ports = createPrismaSocialPorts();
    const result = await interactWithProof(ports, {
      userId: user.id,
      itemId: id,
      kind: "SHARE",
      note,
    });
    return jsonOk({ applied: result.applied, sharePath: `/social/${id}` });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
