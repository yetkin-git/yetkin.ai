import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { openArenaTender } from "@/lib/arena/engine";
import { createTenderInputSchema } from "@/lib/arena/schemas";
import { createPrismaArenaPorts } from "@/lib/arena/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    await requireSession(request);
    const ports = createPrismaArenaPorts();
    const tenders = await ports.arena.listOpenTenders();
    return jsonOk({ tenders });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = createTenderInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("İhale alanları geçersiz.", 400);
    }
    const ports = createPrismaArenaPorts();
    const tender = await openArenaTender(ports, {
      sponsorUserId: user.id,
      title: parsed.data.title,
      brief: parsed.data.brief,
      prizePoolMinor: parsed.data.prizePoolMinor,
      companyId: parsed.data.companyId,
      submissionWindowMs: parsed.data.submissionWindowMs,
      evaluationWindowMs: parsed.data.evaluationWindowMs,
    });
    return jsonOk({ tender }, 201);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
