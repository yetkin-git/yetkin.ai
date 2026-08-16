import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createStudioDraft } from "@/lib/studio/engine";
import { createStudioDraftInputSchema } from "@/lib/studio/schemas";
import { createPrismaStudioPorts } from "@/lib/studio/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaStudioPorts();
    const drafts = await ports.studio.listDraftsForUser(user.id);
    return jsonOk({ drafts });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = createStudioDraftInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Taslak gövdesi geçersiz.", 400);
    }
    const ports = createPrismaStudioPorts();
    const draft = await createStudioDraft(ports, {
      userId: user.id,
      prompt: parsed.data.prompt,
      title: parsed.data.title,
    });
    return jsonOk({ draft }, 201);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
