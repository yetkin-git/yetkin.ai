import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaCareerPorts } from "@/lib/career/runtime";
import { syncCareerVisaStamps } from "@/lib/career/engine";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaCareerPorts();
    await syncCareerVisaStamps(ports, { userId: user.id });
    const stamps = await ports.career.listStampsForUser(user.id);
    return jsonOk({ stamps });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaCareerPorts();
    const stamps = await syncCareerVisaStamps(ports, { userId: user.id });
    return jsonOk({ stamps });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
