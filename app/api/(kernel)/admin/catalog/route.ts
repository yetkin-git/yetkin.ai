import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { runCatalogPatch } from "@/lib/kernel/admin/catalog-write";
import { createPrismaCatalogWriteStore } from "@/lib/kernel/admin/prisma-catalog-write";

export const auth = "admin" as const;

export async function PATCH(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    return await runCatalogPatch({
      session,
      body,
      getStore: createPrismaCatalogWriteStore,
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
