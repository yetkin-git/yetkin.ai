import "server-only";

import {
  getAcademyCertificateProofRow,
  listAcademyCertificateProofRows,
  type AcademyCertificateProofRow,
} from "@/lib/kernel/proof/prisma-read";

/**
 * Akademi belgesi okuma — Proof portunun akademi yüzeyi.
 * Kariyer bu dosyayı import etmez; kernel `ProofReadPort` konuşur.
 * İptal edilmiş kayıt mühürlü kanıt sayılmaz.
 */
export type AcademyIssuedCertificateProof = AcademyCertificateProofRow;

export const getAcademyIssuedCertificateProof = getAcademyCertificateProofRow;
export const listAcademyIssuedCertificateProofs = listAcademyCertificateProofRows;
