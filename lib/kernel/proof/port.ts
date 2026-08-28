/**
 * Kanıt okuma sözleşmesi — Modüler Monolit çekirdeği.
 * Kariyer dikey akademi/freelancer iç okuma dosyasını import etmez;
 * yalnız bu portu ve `lib/kernel/catalog-ids` kimliğini konuşur. Yazma yok; oda motoru yok.
 */
import type { PassportStampSourceKind } from "@/lib/kernel/passport/types";

export type ProofSourceKind = PassportStampSourceKind;

export type SealedProofRecord = {
  sourceKind: ProofSourceKind;
  sourceId: string;
  userId: string;
  /** Vize sahibi ve mühürlemeye yetkili diğer taraflar (ör. müşteri release). */
  actorUserIds: string[];
  title: string;
  issuedAt: Date;
  /** Akademi SHA-256 mührü; freelancer tesliminde null. */
  certificateHash: string | null;
  /** Akademi kurs slug'ı — başlık eşlemesine yedek. Freelancer tesliminde yok. */
  courseSlug?: string | null;
};

export type ProofReadPort = {
  getSealedProof(sourceKind: ProofSourceKind, sourceId: string): Promise<SealedProofRecord | null>;
  listSealedProofs(userId: string): Promise<SealedProofRecord[]>;
};
