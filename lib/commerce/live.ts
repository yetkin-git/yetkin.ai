import "server-only";

import { createPrismaCommerceRepository } from "@/lib/commerce/prisma-repository";
import type { CommerceHandlerDeps } from "@/lib/commerce/handlers";
import { requireSession } from "@/lib/kernel/auth/session";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";

export function liveCommerceDeps(): CommerceHandlerDeps {
  return {
    requireSession,
    repository: createPrismaCommerceRepository,
    idempotency: createPrismaHttpIdempotencyStore,
  };
}
