import "server-only";

import {
  getReleasedWorkProofRow,
  listReleasedWorkProofRows,
  type ReleasedWorkProofRow,
} from "@/lib/kernel/proof/prisma-read";

/**
 * Marketplace RELEASED iş kanıtı — Proof portunun freelancer yüzeyi.
 * Kariyer freelancerContract tablosuna ve bu dosyaya girmez;
 * kernel `ProofReadPort` okur.
 */
export type ReleasedFreelancerWorkProof = ReleasedWorkProofRow;

export const getReleasedFreelancerWorkProof = getReleasedWorkProofRow;
export const listReleasedFreelancerWorkProofs = listReleasedWorkProofRows;
