import { requireSession } from "@/lib/kernel/auth/session";
import { upsertHibeCompanyProfile } from "@/lib/yetkinhibe/company-profile";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { z } from "zod";

export const auth = "session" as const;

const bodySchema = z.strictObject({
  businessName: z.string().trim().min(2).max(160),
  audience: z.enum(["yeni_girisimci", "mevcut_kobi"]),
  provinceCode: z.string().trim().regex(/^\d{2}$/),
  naceGroup: z.string().trim().regex(/^\d{2}$/),
  investmentFocus: z.enum(["makine_techizat", "yazilim_dijital", "arge", "ihracat"]),
  employeeCount: z.number().int().min(0).max(100_000),
  companyAgeYears: z.number().int().min(0).max(150),
  rdMaturityLevel: z.enum(["NONE", "EARLY", "ESTABLISHED", "ADVANCED"]),
  exportActive: z.boolean(),
  hasPatentOrUtilityModel: z.boolean(),
});

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const session = await requireSession(request);
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const raw: unknown = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonFail("Firma profili geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: session.id,
        route: "/api/yetkinhibe/profile",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload(parsed.data),
        requestId,
        request,
      },
      async () => {
        await upsertHibeCompanyProfile(session.id, parsed.data);
        return { status: 200, body: { saved: true } };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error, 500, requestId, request);
  }
}
