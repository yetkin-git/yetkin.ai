import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { openGrantApplicationGuide } from "@/lib/hibe/engine";
import { openGrantApplicationInputSchema } from "@/lib/hibe/schemas";
import { createPrismaHibePorts } from "@/lib/hibe/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaHibePorts();
    const applications = await ports.hibe.listApplicationsForUser(user.id);
    return jsonOk({ applications });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = openGrantApplicationInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Başvuru rehberi gövdesi geçersiz.", 400);
    }
    const ports = createPrismaHibePorts();
    const result = await openGrantApplicationGuide(ports, {
      userId: user.id,
      programId: parsed.data.programId,
      companyHint: parsed.data.companyHint,
      completeChecklist: parsed.data.completeChecklist,
    });
    return jsonOk({
      applied: result.applied,
      application: result.application,
      program: result.program,
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
