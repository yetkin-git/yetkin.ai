import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { consentJuniorProfile } from "@/lib/junior/engine";
import { juniorConsentInputSchema } from "@/lib/junior/schemas";
import { createPrismaJuniorPorts } from "@/lib/junior/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaJuniorPorts();
    const wards = await ports.junior.listWardsForGuardian(user.id);
    return jsonOk({ wards });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = juniorConsentInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Vekâlet gövdesi geçersiz.", 400);
    }
    const ports = createPrismaJuniorPorts();
    const result = await consentJuniorProfile(ports, {
      guardianUserId: user.id,
      childUserId: parsed.data.childUserId,
    });
    return jsonOk({ applied: result.applied, profile: result.profile });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
