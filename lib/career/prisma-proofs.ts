import "server-only";

import type { CareerProofStore } from "@/lib/career/types";
import { createPrismaProofReadPort } from "@/lib/kernel/proof/prisma-read";

/**
 * Kariyer kanıt okuma — dikey Prisma delegate yazmaz.
 * Akademi belgesi ve RELEASED iş, kernel ProofReadPort üzerinden gelir.
 * Çapraz oda iç okuma dosyası bağlanmaz.
 */
export function createPrismaCareerProofStore(): CareerProofStore {
  return createPrismaProofReadPort();
}
