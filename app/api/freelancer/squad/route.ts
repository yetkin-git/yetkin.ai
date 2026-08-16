import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { upsertSquadInputSchema } from "@/lib/freelancer/schemas";
import { upsertFreelancerSquad } from "@/lib/freelancer/squad-engine";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const contractId = new URL(request.url).searchParams.get("contractId")?.trim() ?? "";
    if (!contractId) {
      return jsonFail("Sözleşme kimliği gerekli.", 400);
    }
    const ports = createPrismaFreelancerPorts();
    const contract = await ports.freelancer.getContract(contractId);
    if (!contract) {
      return jsonFail("Sözleşme bulunamadı.", 404);
    }
    if (user.id !== contract.clientId && user.id !== contract.freelancerId) {
      return jsonFail("Bu takıma erişim yok.", 403);
    }
    const squad = await ports.freelancer.getSquadByContractId(contractId);
    const members = squad ? await ports.freelancer.listSquadMembers(squad.id) : [];
    return jsonOk({ squad, members });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = upsertSquadInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Takım gövdesi geçersiz.", 400);
    }
    const ports = createPrismaFreelancerPorts();
    const result = await upsertFreelancerSquad(ports, {
      contractId: parsed.data.contractId,
      actorUserId: user.id,
      members: parsed.data.members,
    });
    return jsonOk(result, 201);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
