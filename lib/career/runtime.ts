import "server-only";

import { createPrismaCareerProofStore } from "@/lib/career/prisma-proofs";
import { createPrismaCareerStore } from "@/lib/career/prisma-store";
import type { CareerEnginePorts } from "@/lib/career/engine";

export function createPrismaCareerPorts(): CareerEnginePorts {
  return {
    career: createPrismaCareerStore(),
    proofs: createPrismaCareerProofStore(),
  };
}
