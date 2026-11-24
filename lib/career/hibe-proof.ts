/**
 * YetkinHibe → kariyer vize damgası köprüsü.
 * IDOR: yalnız application.userId === actorUserId.
 */

import "server-only";

import { issueCareerVisaStamp, type CareerEnginePorts } from "@/lib/career/engine";
import { createPrismaCareerPorts } from "@/lib/career/runtime";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/lib/kernel/http/errors";
import { getYetkinHibeProjectProofRow } from "@/lib/kernel/proof/prisma-read";

export type HibeProofAttachResult = {
  applied: boolean;
  healed: boolean;
  stampId: string;
  title: string;
  certificateHash: string | null;
};

export async function attachHibeApplicationAsCareerProof(
  userId: string,
  applicationId: string,
  ports: CareerEnginePorts = createPrismaCareerPorts(),
): Promise<HibeProofAttachResult> {
  const id = applicationId.trim();
  if (!id || !/^[A-Za-z0-9_-]{8,40}$/.test(id)) {
    throw new BadRequestError("Hibe başvurusu bulunamadı.");
  }
  const proof = await getYetkinHibeProjectProofRow(id);
  if (!proof) {
    throw new NotFoundError("Hibe başvurusu bulunamadı.");
  }
  if (proof.userId !== userId) {
    throw new ForbiddenError("Bu hibe başvurusuna erişimin yok.");
  }
  const result = await issueCareerVisaStamp(ports, {
    sourceKind: "YETKINHIBE_PROJECT",
    sourceId: proof.sourceId,
    actorUserId: userId,
  });
  return {
    applied: result.applied,
    healed: result.healed,
    stampId: result.stamp.id,
    title: result.stamp.title,
    certificateHash: result.stamp.certificateHash,
  };
}
