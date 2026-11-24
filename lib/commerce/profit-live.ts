import "server-only";

import type { ProfitHandlerDeps } from "@/lib/commerce/profit-handlers";
import { requireSession } from "@/lib/kernel/auth/session";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";

export function liveProfitDeps(): ProfitHandlerDeps {
  return {
    requireSession,
    idempotency: createPrismaHttpIdempotencyStore,
  };
}
