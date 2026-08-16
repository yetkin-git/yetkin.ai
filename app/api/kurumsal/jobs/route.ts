import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { sealCorporateJobPosting } from "@/lib/kurumsal/engine";
import { createJobPostingInputSchema } from "@/lib/kurumsal/schemas";
import { createPrismaKurumsalPorts } from "@/lib/kurumsal/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaKurumsalPorts();
    const postings = await ports.kurumsal.listPostingsByOwner(user.id);
    return jsonOk({ postings });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = createJobPostingInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("İlan alanları geçersiz.", 400);
    }
    const ports = createPrismaKurumsalPorts();
    const posting = await sealCorporateJobPosting(ports, {
      actorUserId: user.id,
      title: parsed.data.title,
      brief: parsed.data.brief,
      budgetMinor: parsed.data.budgetMinor,
      workbenchKind: parsed.data.workbenchKind,
    });
    return jsonOk({ posting }, 201);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
