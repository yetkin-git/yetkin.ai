import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import {
  resolvePublicAcademyCertificate,
  toPublicAcademyCertificateWire,
} from "@/lib/academy/certificate-verify";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  RAIL_V1_ACADEMY_CERTIFICATE_HASH_INVALID,
  RAIL_V1_ACADEMY_CERTIFICATE_INCOMPLETE,
  RAIL_V1_ACADEMY_CERTIFICATE_MISMATCH,
  RAIL_V1_ACADEMY_CERTIFICATE_MISSING,
  railV1PublicAcademyCertificateDataSchema,
} from "@/lib/kernel/http/v1-contract";

export const auth = "public" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ hash: string }> },
) {
  const requestId = resolveRequestId(request);
  try {
    const { hash } = await context.params;
    const ports = createPrismaAcademyPorts();
    const resolution = await resolvePublicAcademyCertificate(ports.academy, hash);
    if (resolution.status === "invalid-format") {
      return jsonFail(RAIL_V1_ACADEMY_CERTIFICATE_HASH_INVALID, 400, requestId, request);
    }
    if (resolution.status === "missing") {
      return jsonFail(RAIL_V1_ACADEMY_CERTIFICATE_MISSING, 404, requestId, request);
    }
    if (resolution.view.sealStatus === "mismatch") {
      return jsonFail(RAIL_V1_ACADEMY_CERTIFICATE_MISMATCH, 400, requestId, request);
    }
    if (resolution.view.sealStatus === "incomplete") {
      return jsonFail(RAIL_V1_ACADEMY_CERTIFICATE_INCOMPLETE, 400, requestId, request);
    }
    const parsed = railV1PublicAcademyCertificateDataSchema.safeParse(
      toPublicAcademyCertificateWire(resolution.view),
    );
    if (!parsed.success) {
      return jsonFail(RAIL_V1_ACADEMY_CERTIFICATE_INCOMPLETE, 400, requestId, request);
    }
    return jsonOk(parsed.data, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
