import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { upsertJuniorProfile } from "@/lib/junior/engine";
import { upsertJuniorProfileInputSchema } from "@/lib/junior/schemas";
import { createPrismaJuniorPorts } from "@/lib/junior/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaJuniorPorts();
    const profile = await ports.junior.getProfileByUserId(user.id);
    const allowance = profile ? await ports.junior.getAllowanceByProfileId(profile.id) : null;
    return jsonOk({ profile, allowance });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = upsertJuniorProfileInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Junior profil gövdesi geçersiz.", 400);
    }
    const ports = createPrismaJuniorPorts();
    const result = await upsertJuniorProfile(ports, {
      userId: user.id,
      dateOfBirth: parsed.data.dateOfBirth,
      guardianUserId: parsed.data.guardianUserId,
    });
    return jsonOk({ applied: result.applied, profile: result.profile });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
