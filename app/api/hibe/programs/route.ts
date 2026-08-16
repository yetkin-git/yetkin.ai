import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { searchGrantPrograms } from "@/lib/hibe/engine";
import { grantMatchInputSchema } from "@/lib/hibe/schemas";
import { createPrismaHibePorts } from "@/lib/hibe/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    await requireSession(request);
    const url = new URL(request.url);
    const tagsRaw = url.searchParams.get("tags") ?? "";
    const parsed = grantMatchInputSchema.safeParse({
      jurisdiction: url.searchParams.get("jurisdiction") || "TR",
      applicantKind: url.searchParams.get("applicantKind") || "INDIVIDUAL",
      hasTaxId: url.searchParams.get("hasTaxId") === "1" || url.searchParams.get("hasTaxId") === "true",
      sectorTags: tagsRaw
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      agency: url.searchParams.get("agency") || undefined,
      query: url.searchParams.get("q") || undefined,
    });
    const ports = createPrismaHibePorts();
    const programs = parsed.success
      ? await searchGrantPrograms(ports, parsed.data)
      : await ports.hibe.listPublishedPrograms();
    return jsonOk({ programs, honesty: "catalog-not-live-government-api" });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
