import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { toCitizenDevLabsApiKey } from "@/lib/devlabs/keys";
import { createPrismaDevLabsPorts } from "@/lib/devlabs/runtime";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaDevLabsPorts();
    const project = await ports.devlabs.getProject(id);
    if (!project) {
      return jsonFail("Proje bulunamadı.", 404);
    }
    if (project.userId !== user.id) {
      return jsonFail("Bu projeyi görme yetkin yok.", 403);
    }
    const keys = await ports.devlabs.listApiKeysForProject(id);
    return jsonOk({
      project,
      keys: keys.map(toCitizenDevLabsApiKey),
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
