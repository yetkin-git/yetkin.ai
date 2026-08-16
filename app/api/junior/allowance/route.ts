import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { grantJuniorAllowance, setJuniorWeeklyCap } from "@/lib/junior/engine";
import {
  grantJuniorAllowanceInputSchema,
  setJuniorWeeklyCapInputSchema,
} from "@/lib/junior/schemas";
import { createPrismaJuniorPorts } from "@/lib/junior/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaJuniorPorts();
    const profile = await ports.junior.getProfileByUserId(user.id);
    const allowance = profile ? await ports.junior.getAllowanceByProfileId(profile.id) : null;
    return jsonOk({ allowance });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const body: unknown = await request.json();
    const cap = setJuniorWeeklyCapInputSchema.safeParse(body);
    if (cap.success) {
      const ports = createPrismaJuniorPorts();
      const allowance = await setJuniorWeeklyCap(ports, {
        guardianUserId: user.id,
        childUserId: cap.data.childUserId,
        weeklyCapMinor: cap.data.weeklyCapMinor,
      });
      return jsonOk({ allowance, granted: false });
    }
    const grant = grantJuniorAllowanceInputSchema.safeParse(body);
    if (!grant.success) {
      return jsonFail("Harçlık gövdesi geçersiz.", 400);
    }
    const ports = createPrismaJuniorPorts();
    const result = await grantJuniorAllowance(ports, {
      guardianUserId: user.id,
      childUserId: grant.data.childUserId,
      amountMinor: grant.data.amountMinor,
    });
    return jsonOk({ allowance: result.allowance, granted: result.applied });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
