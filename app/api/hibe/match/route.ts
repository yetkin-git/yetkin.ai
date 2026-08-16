import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { searchGrantPrograms } from "@/lib/hibe/engine";
import { grantMatchInputSchema } from "@/lib/hibe/schemas";
import { createPrismaHibePorts } from "@/lib/hibe/runtime";
import { HIBE_CATALOG_HONESTY } from "@/lib/hibe/types";

export const auth = "session" as const;

export async function POST(request: Request) {
  try {
    await requireSession(request);
    const parsed = grantMatchInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Eşleştirme filtresi geçersiz.", 400);
    }
    const ports = createPrismaHibePorts();
    const matches = await searchGrantPrograms(ports, parsed.data);
    return jsonOk({ matches, honesty: HIBE_CATALOG_HONESTY });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
