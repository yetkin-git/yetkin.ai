import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaAcademyPorts();
    const certificates = await ports.academy.listCertificatesForUser(user.id);
    return jsonOk({ certificates });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
