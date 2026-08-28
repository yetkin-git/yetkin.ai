import "server-only";

import type { HibeEnginePorts } from "@/lib/hibe/engine";
import { createPrismaHibeStore } from "@/lib/hibe/prisma-store";
import type { HibeStore } from "@/lib/hibe/types";

export function createPrismaHibePorts(): HibeEnginePorts & { hibe: HibeStore } {
  return {
    hibe: createPrismaHibeStore(),
  };
}
