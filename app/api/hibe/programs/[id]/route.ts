import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaHibePorts } from "@/lib/hibe/runtime";
import { HIBE_CATALOG_HONESTY } from "@/lib/hibe/types";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaHibePorts();
    const program = (await ports.hibe.getProgram(id)) ?? (await ports.hibe.getProgramBySlug(id));
    if (!program) {
      return jsonFail("Hibe programı bulunamadı.", 404);
    }
    return jsonOk({ program, honesty: HIBE_CATALOG_HONESTY });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
