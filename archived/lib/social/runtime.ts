import "server-only";

import type { SocialEnginePorts } from "@/lib/social/engine";
import { createPrismaSocialProofStore } from "@/lib/social/prisma-proofs";
import { createPrismaSocialStore } from "@/lib/social/prisma-store";

export function createPrismaSocialPorts(): SocialEnginePorts {
  return {
    social: createPrismaSocialStore(),
    proofs: createPrismaSocialProofStore(),
  };
}
