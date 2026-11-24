import { requireSession } from "@/lib/kernel/auth/session";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { isAgencyFocusValue, matchAgencyClientsToCatalog } from "@/lib/yetkinhibe/agency-match";
import { createHibeClient, hibeWriteResult, listHibeClients } from "@/lib/yetkinhibe/application-service";
import { isGrantProfileMode, parseGrantProfileModeParam } from "@/lib/yetkinhibe/grant-profile-mode";
import { GrantCatalogUnavailableError } from "@/lib/yetkinhibe/grant-catalog-core";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";
import { catalogEntryToBriefCall } from "@/lib/yetkinhibe/radar-profile";
import {
  isGrantAudience,
  isGrantNaceGroup,
  isGrantRdLevel,
  isProvinceCode,
} from "@/lib/yetkinhibe/grant-brief-axes";
import { z } from "zod";

export const auth = "session" as const;

const ROUTE = "/api/yetkinhibe/clients";

const bodySchema = z
  .strictObject({
    companyName: z.string().trim().min(2).max(160),
    naceGroup: z.string().trim(),
    provinceCode: z.string().trim(),
    audience: z.string().trim(),
    employeeCount: z.number().int().min(0).max(100_000),
    companyAgeYears: z.number().int().min(0).max(150),
    rdMaturityLevel: z.string().trim(),
    exportActive: z.boolean(),
    /** Ş7 — yatırım odağı. Boşsa "genel" yazılır; kapalı liste dışı 400. */
    investmentFocus: z.string().trim().optional(),
    hasPatentOrUtilityModel: z.boolean().optional(),
  })
  .superRefine((row, ctx) => {
    if (!isGrantNaceGroup(row.naceGroup)) {
      ctx.addIssue({ code: "custom", path: ["naceGroup"], message: "NACE" });
    }
    if (!isProvinceCode(row.provinceCode)) {
      ctx.addIssue({ code: "custom", path: ["provinceCode"], message: "il" });
    }
    if (!isGrantAudience(row.audience)) {
      ctx.addIssue({ code: "custom", path: ["audience"], message: "kitle" });
    }
    if (!isGrantRdLevel(row.rdMaturityLevel)) {
      ctx.addIssue({ code: "custom", path: ["rdMaturityLevel"], message: "Ar-Ge" });
    }
    if (row.investmentFocus != null && !isAgencyFocusValue(row.investmentFocus)) {
      ctx.addIssue({ code: "custom", path: ["investmentFocus"], message: "yatırım odağı" });
    }
  });

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const session = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.yetkinhibeMatchUser, session.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const mode = parseGrantProfileModeParam(new URL(request.url).searchParams.get("mod") ?? undefined);
    const clients = await listHibeClients(session.id);
    let catalogNote: string | null = null;
    let matrix: ReturnType<typeof matchAgencyClientsToCatalog> = [];
    try {
      const catalog = await loadYetkinhibeGrantCatalog();
      matrix = matchAgencyClientsToCatalog(clients, catalog.map(catalogEntryToBriefCall), new Date());
    } catch (error) {
      catalogNote =
        error instanceof GrantCatalogUnavailableError
          ? "Hibe kataloğu okunamadı. Uyum matrisi uydurulmaz."
          : "Hibe kataloğu okunamadı. Uyum matrisi uydurulmaz.";
    }
    return jsonOk(
      {
        mode: isGrantProfileMode(mode) ? mode : "individual",
        clients,
        matrix,
        catalogNote,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 500, requestId, request);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const session = await requireSession(request);
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.yetkinhibeMatchUser, session.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const raw: unknown = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonFail("Müşteri kartı geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: session.id,
        route: ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload(parsed.data),
        requestId,
        request,
      },
      () =>
        hibeWriteResult(async () => {
          const created = await createHibeClient(session.id, parsed.data);
          return { id: created.id, mode: "agency" };
        }),
    );
  } catch (error) {
    return jsonFromUnknown(error, 500, requestId, request);
  }
}
