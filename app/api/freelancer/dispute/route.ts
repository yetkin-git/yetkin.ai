import { requireSession } from "@/lib/kernel/auth/session";
import { isSuperAdminUser } from "@/lib/kernel/auth/super-admin";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { disputeRequestSchema } from "@/lib/freelancer/schemas";
import {
  adjudicateFreelancerDispute,
  approveFreelancerArbitration,
  openFreelancerDispute,
  rebutFreelancerDispute,
  rejectFreelancerArbitration,
  settleHumanReviewDispute,
} from "@/lib/freelancer/dispute-engine";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const url = new URL(request.url);
    const contractId = url.searchParams.get("contractId")?.trim() ?? "";
    if (!contractId) {
      return jsonFail("Sözleşme kimliği gerekli.", 400);
    }
    const ports = createPrismaFreelancerPorts();
    const contract = await ports.freelancer.getContract(contractId);
    if (!contract) {
      return jsonFail("Sözleşme bulunamadı.", 404);
    }
    if (user.id !== contract.clientId && user.id !== contract.freelancerId) {
      return jsonFail("Bu sözleşmeye erişim yok.", 403);
    }
    const dispute = await ports.freelancer.getDisputeByContractId(contractId);
    return jsonOk({ dispute, contract });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = disputeRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Tahkim gövdesi geçersiz.", 400);
    }
    const ports = createPrismaFreelancerPorts();
    const body = parsed.data;
    const actor = {
      contractId: body.contractId,
      disputeId: body.disputeId,
      actorUserId: user.id,
    };

    if (body.action === "open") {
      if (!body.partyAClaim) {
        return jsonFail("Tur 1 iddiası gerekli.", 400);
      }
      const result = await openFreelancerDispute(ports, {
        contractId: body.contractId,
        actorUserId: user.id,
        partyAClaim: body.partyAClaim,
      });
      return jsonOk(result, 201);
    }
    if (body.action === "rebut") {
      if (!body.partyBRebuttal) {
        return jsonFail("Tur 2 karşı cevabı gerekli.", 400);
      }
      const result = await rebutFreelancerDispute(ports, {
        ...actor,
        partyBRebuttal: body.partyBRebuttal,
      });
      return jsonOk(result);
    }
    if (body.action === "adjudicate") {
      const result = await adjudicateFreelancerDispute(ports, actor);
      return jsonOk(result);
    }
    if (body.action === "approve") {
      const result = await approveFreelancerArbitration(ports, actor);
      return jsonOk(result);
    }
    if (body.action === "reject") {
      const result = await rejectFreelancerArbitration(ports, actor);
      return jsonOk(result);
    }
    if (body.action === "human-settle") {
      if (!isSuperAdminUser(user.id)) {
        return jsonFail("İnsan incelemesini yalnız Super Admin sonuçlandırır.", 403);
      }
      if (body.employerRefundBps == null) {
        return jsonFail("İnsan incelemesi iade oranı ister.", 400);
      }
      const result = await settleHumanReviewDispute(ports, {
        ...actor,
        employerRefundBps: body.employerRefundBps,
      });
      return jsonOk(result);
    }
    return jsonFail("Bilinmeyen tahkim eylemi.", 400);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
