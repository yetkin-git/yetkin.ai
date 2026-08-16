import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { upsertCorporateCompany } from "@/lib/kurumsal/engine";
import { upsertCompanyInputSchema } from "@/lib/kurumsal/schemas";
import { createPrismaKurumsalPorts } from "@/lib/kurumsal/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaKurumsalPorts();
    const company = await ports.kurumsal.getCompanyByUserId(user.id);
    return jsonOk({ company });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = upsertCompanyInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Şirket alanları geçersiz.", 400);
    }
    const ports = createPrismaKurumsalPorts();
    const company = await upsertCorporateCompany(ports, {
      userId: user.id,
      legalName: parsed.data.legalName,
      tradeName: parsed.data.tradeName,
      jurisdiction: parsed.data.jurisdiction,
      taxId: parsed.data.taxId,
    });
    return jsonOk({ company });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
