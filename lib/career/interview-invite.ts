/**
 * Vitrin görüşme daveti — CareerContactRequest üzerinde PENDING/ACCEPTED/DECLINED.
 * Aday e-postası yanıta basılmaz; işveren e-postası yalnız adaya gösterilir (rıza sonrası).
 */

import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/lib/kernel/http/errors";
import type {
  CareerInterviewInviteView,
  CareerInterviewStatus,
} from "@/lib/career/interview-types";

export type { CareerInterviewInviteView, CareerInterviewStatus } from "@/lib/career/interview-types";
export { CAREER_INTERVIEW_STATUSES } from "@/lib/career/interview-types";

function toView(row: {
  id: string;
  requesterName: string;
  requesterEmail: string;
  message: string;
  status: CareerInterviewStatus;
  sealHash: string | null;
  createdAt: Date;
  respondedAt: Date | null;
}): CareerInterviewInviteView {
  return {
    id: row.id,
    requesterName: row.requesterName,
    requesterEmail: row.requesterEmail,
    message: row.message,
    status: row.status,
    sealHash: row.sealHash,
    createdAt: row.createdAt.toISOString(),
    respondedAt: row.respondedAt?.toISOString() ?? null,
  };
}

export async function listInterviewInvitesForTalent(
  talentUserId: string,
): Promise<CareerInterviewInviteView[]> {
  const prisma = getPrisma();
  const rows = await prisma.careerContactRequest.findMany({
    where: { talentUserId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((row) => toView(row));
}

export async function respondToInterviewInvite(input: {
  talentUserId: string;
  inviteId: string;
  decision: "ACCEPTED" | "DECLINED";
  now?: Date;
}): Promise<CareerInterviewInviteView> {
  const prisma = getPrisma();
  const now = input.now ?? new Date();
  const row = await prisma.careerContactRequest.findUnique({
    where: { id: input.inviteId },
  });
  if (!row) {
    throw new NotFoundError("Görüşme daveti bulunamadı.");
  }
  if (row.talentUserId !== input.talentUserId) {
    throw new ForbiddenError("Bu davete erişimin yok.");
  }
  if (row.status !== "PENDING") {
    throw new BadRequestError("Bu davet zaten yanıtlandı.");
  }
  const updated = await prisma.careerContactRequest.update({
    where: { id: row.id },
    data: { status: input.decision, respondedAt: now },
  });
  return toView(updated);
}
