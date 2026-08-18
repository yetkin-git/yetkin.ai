import { requireSession } from "@/lib/kernel/auth/session";
import { isV1JsonRequest } from "@/lib/kernel/http/api-v1";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import {
  RAIL_V1_DELIVERY_FIELDS_INVALID,
  railV1DeliveryDataSchema,
  railV1DeliveryRequestSchema,
} from "@/lib/kernel/http/v1-contract";
import { postContractMessageInputSchema } from "@/lib/freelancer/schemas";
import {
  listFreelancerContractMessages,
  postFreelancerContractMessage,
  postFreelancerDeliveryProof,
  toFreelancerDeliveryMessageWire,
} from "@/lib/freelancer/messages";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

const MESSAGES_ROUTE = "/api/freelancer/contracts/[id]/messages";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaFreelancerPorts();
    const messages = await listFreelancerContractMessages(ports, {
      contractId: id,
      actorUserId: user.id,
    });
    return jsonOk({ messages });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    if (isV1JsonRequest(request)) {
      const idempotency = requireRailV1IdempotencyKey(request, requestId);
      if (!idempotency.ok) {
        return idempotency.response;
      }
      const parsed = railV1DeliveryRequestSchema.safeParse(
        await request.json().catch(() => ({})),
      );
      if (!parsed.success) {
        return jsonFail(RAIL_V1_DELIVERY_FIELDS_INVALID, 400, requestId, request);
      }
      return await settleHttpIdempotency(
        {
          store: createPrismaHttpIdempotencyStore(),
          userId: user.id,
          route: MESSAGES_ROUTE,
          key: idempotency.key,
          requestHash: hashIdempotencyPayload({
            contractId: id,
            kind: "DELIVERY",
            body: parsed.data.body,
            artifactUrl: parsed.data.artifactUrl ?? null,
          }),
          requestId,
          request,
        },
        async () => {
          const ports = createPrismaFreelancerPorts();
          const message = await postFreelancerDeliveryProof(ports, {
            contractId: id,
            actorUserId: user.id,
            body: parsed.data.body,
            artifactUrl: parsed.data.artifactUrl,
          });
          const wire = toFreelancerDeliveryMessageWire(message);
          const checked = railV1DeliveryDataSchema.safeParse({ message: wire });
          if (!checked.success) {
            throw new Error("Teslimat görünümü üretilemedi.");
          }
          return { status: 201, body: checked.data };
        },
      );
    }
    const parsed = postContractMessageInputSchema.safeParse(
      await request.json().catch(() => ({})),
    );
    if (!parsed.success) {
      return jsonFail("Mesaj gövdesi geçersiz.", 400);
    }
    const ports = createPrismaFreelancerPorts();
    const message = await postFreelancerContractMessage(ports, {
      contractId: id,
      actorUserId: user.id,
      kind: parsed.data.kind,
      body: parsed.data.body,
      artifactUrl: parsed.data.artifactUrl,
    });
    return jsonOk({ message }, 201);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
