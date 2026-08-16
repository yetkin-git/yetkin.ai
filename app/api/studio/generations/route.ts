import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaStudioPorts } from "@/lib/studio/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaStudioPorts();
    const generations = await ports.studio.listGenerationsForUser(user.id);
    return jsonOk({ generations });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
