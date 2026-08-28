import type { PassportStampSourceKind, SealedPassportStamp } from "@/lib/kernel/passport/types";
import type { ProofReadPort, SealedProofRecord } from "@/lib/kernel/proof/port";

export { toPassportVisaStamp } from "@/lib/kernel/passport/types";

export const CAREER_MODULE_ID = "career" as const;

/** Kaynak türü çekirdek pasaport sözleşmesidir; kariyer yalnız basar. */
export type CareerVisaSourceKind = PassportStampSourceKind;

/** Sicil satırı = SealedPassportStamp; ikinci Prisma şekli yok. */
export type CareerVisaStampRecord = SealedPassportStamp;

export type CareerPortfolioItemRecord = {
  id: string;
  userId: string;
  visaStampId: string;
  title: string;
  createdAt: Date;
};

export type CareerPulse = {
  visaCount: number;
  portfolioCount: number;
  lastVisaTitle: string | null;
};

/** Kernel ProofReadPort kaydı; kariyer ikinci şekil tutmaz. */
export type SealedCareerProof = SealedProofRecord;

/** Kariyer kanıt okuma = çekirdek ProofReadPort. Dikey iç dosya import edilmez. */
export type CareerProofStore = ProofReadPort;

/** Damga + portföy yazma yüzeyi — atomik birimin içinden de aynı kapılar. */
export type CareerStampWriteClient = {
  insertStamp(stamp: CareerVisaStampRecord): Promise<CareerVisaStampRecord>;
  getStampBySource(
    userId: string,
    sourceKind: CareerVisaSourceKind,
    sourceId: string,
  ): Promise<CareerVisaStampRecord | null>;
  setStampCertificateHash(id: string, certificateHash: string): Promise<CareerVisaStampRecord>;
  insertPortfolioItem(item: CareerPortfolioItemRecord): Promise<CareerPortfolioItemRecord>;
  getPortfolioItemByStampId(visaStampId: string): Promise<CareerPortfolioItemRecord | null>;
};

export type CareerStore = CareerStampWriteClient & {
  listStampsForUser(userId: string): Promise<CareerVisaStampRecord[]>;
  listPortfolioForUser(userId: string): Promise<CareerPortfolioItemRecord[]>;
  pulseForUser(userId: string): Promise<CareerPulse>;
  /**
   * Damga ve portföy yazmalarını tek atomik birimde çalıştırır.
   * Prisma store: `$transaction`. Bellek store: anlık görüntü + rollback.
   */
  runStampPortfolioAtomic<T>(work: (tx: CareerStampWriteClient) => Promise<T>): Promise<T>;
};

export function careerVisaKey(sourceKind: CareerVisaSourceKind, sourceId: string): string {
  if (sourceKind === "ACADEMY_CERTIFICATE") {
    return `academy.certificate:${sourceId}`;
  }
  return `freelancer.release:${sourceId}`;
}

export function careerSourceModuleId(sourceKind: CareerVisaSourceKind): string {
  return sourceKind === "ACADEMY_CERTIFICATE" ? "academy" : "freelancer";
}
