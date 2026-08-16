import { randomUUID } from "node:crypto";
import { parseSha256Hex } from "@/lib/kernel/crypto/sha256";
import {
  careerSourceModuleId,
  careerVisaKey,
  type CareerProofStore,
  type CareerPortfolioItemRecord,
  type CareerStampWriteClient,
  type CareerStore,
  type CareerVisaSourceKind,
  type CareerVisaStampRecord,
  type SealedCareerProof,
} from "@/lib/career/types";

export type CareerEnginePorts = {
  career: CareerStore;
  proofs: CareerProofStore;
};

export type IssueCareerVisaCommand = {
  sourceKind: CareerVisaSourceKind;
  sourceId: string;
  /** Vize sahibinin kendisi veya mühürleyen taraf (ör. müşteri release). */
  actorUserId: string;
  now?: Date;
};

export type SyncCareerVisaCommand = {
  userId: string;
  now?: Date;
};

export type CareerVisaIssueResult = {
  applied: boolean;
  /** Mevcut damgaya eksik portföy satırı veya certificateHash bağını onardı. */
  healed: boolean;
  stamp: CareerVisaStampRecord;
  portfolioItem: CareerPortfolioItemRecord;
  proof: SealedCareerProof;
};

/** Unique ihlali transaction'ı kapatır; aynı callback içinde devam edilmez — dışarıda yeniden girilir. */
const UNIQUE_RETRY_LIMIT = 3;

function assertActorMaySeal(proof: SealedCareerProof, actorUserId: string): void {
  if (!proof.actorUserIds.includes(actorUserId)) {
    throw new Error("Bu kanıtı vizelemeye yetkiniz yok.");
  }
}

export function isCareerUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

async function withUniqueRetry<T>(work: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < UNIQUE_RETRY_LIMIT; attempt += 1) {
    try {
      return await work();
    } catch (error) {
      lastError = error;
      if (!isCareerUniqueViolation(error)) {
        throw error;
      }
    }
  }
  throw lastError;
}

function sealedCertificateHash(proof: SealedCareerProof): string | null {
  if (proof.sourceKind !== "ACADEMY_CERTIFICATE" || !proof.certificateHash) {
    return null;
  }
  return parseSha256Hex(proof.certificateHash);
}

async function sealStampAndPortfolioInTx(
  tx: CareerStampWriteClient,
  proof: SealedCareerProof,
  now: Date,
): Promise<Omit<CareerVisaIssueResult, "proof">> {
  const existing = await tx.getStampBySource(proof.userId, proof.sourceKind, proof.sourceId);
  const boundHash = sealedCertificateHash(proof);
  if (existing) {
    let stamp = existing;
    let hashHealed = false;
    if (!existing.certificateHash && boundHash) {
      stamp = await tx.setStampCertificateHash(existing.id, boundHash);
      hashHealed = true;
    }
    const portfolioItem = await tx.getPortfolioItemByStampId(existing.id);
    if (portfolioItem) {
      return { applied: false, healed: hashHealed, stamp, portfolioItem };
    }
    const healed = await tx.insertPortfolioItem({
      id: randomUUID(),
      userId: proof.userId,
      visaStampId: stamp.id,
      title: proof.title,
      createdAt: now,
    });
    return { applied: false, healed: true, stamp, portfolioItem: healed };
  }

  const stamp = await tx.insertStamp({
    id: randomUUID(),
    userId: proof.userId,
    sourceKind: proof.sourceKind,
    sourceId: proof.sourceId,
    visaKey: careerVisaKey(proof.sourceKind, proof.sourceId),
    moduleId: careerSourceModuleId(proof.sourceKind),
    title: proof.title,
    certificateHash: boundHash,
    issuedAt: proof.issuedAt,
    createdAt: now,
  });
  const portfolioItem = await tx.insertPortfolioItem({
    id: randomUUID(),
    userId: proof.userId,
    visaStampId: stamp.id,
    title: proof.title,
    createdAt: now,
  });
  return { applied: true, healed: false, stamp, portfolioItem };
}

export async function issueCareerVisaStamp(
  ports: CareerEnginePorts,
  command: IssueCareerVisaCommand,
): Promise<CareerVisaIssueResult> {
  const proof = await ports.proofs.getSealedProof(command.sourceKind, command.sourceId);
  if (!proof) {
    throw new Error("Mühürlü kanıt bulunamadı.");
  }
  assertActorMaySeal(proof, command.actorUserId);

  const now = command.now ?? new Date();
  const sealed = await withUniqueRetry(() =>
    ports.career.runStampPortfolioAtomic((tx) => sealStampAndPortfolioInTx(tx, proof, now)),
  );
  return { ...sealed, proof };
}

export async function syncCareerVisaStamps(
  ports: CareerEnginePorts,
  command: SyncCareerVisaCommand,
): Promise<CareerVisaStampRecord[]> {
  const proofs = await ports.proofs.listSealedProofs(command.userId);
  const stamps: CareerVisaStampRecord[] = [];
  for (const proof of proofs) {
    const result = await issueCareerVisaStamp(ports, {
      sourceKind: proof.sourceKind,
      sourceId: proof.sourceId,
      actorUserId: command.userId,
      now: command.now,
    });
    stamps.push(result.stamp);
  }
  return stamps;
}

export async function tryIssueCareerVisaStamp(
  ports: CareerEnginePorts,
  command: IssueCareerVisaCommand,
): Promise<CareerVisaIssueResult | null> {
  try {
    return await issueCareerVisaStamp(ports, command);
  } catch {
    return null;
  }
}
