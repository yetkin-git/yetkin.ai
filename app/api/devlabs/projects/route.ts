import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createDevLabsProject } from "@/lib/devlabs/engine";
import { createProjectInputSchema } from "@/lib/devlabs/schemas";
import { createPrismaDevLabsPorts } from "@/lib/devlabs/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaDevLabsPorts();
    const projects = await ports.devlabs.listProjectsByOwner(user.id);
    return jsonOk({ projects });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = createProjectInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Proje alanları geçersiz.", 400);
    }
    const ports = createPrismaDevLabsPorts();
    const project = await createDevLabsProject(ports, {
      ownerUserId: user.id,
      name: parsed.data.name,
      summary: parsed.data.summary,
    });
    return jsonOk({ project }, 201);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
