import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaCareerPorts } from "@/lib/career/runtime";
import { syncCareerVisaStamps } from "@/lib/career/engine";
import { projectLiveCareerBoard } from "@/lib/career/live";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

export const auth = "session" as const;

function toVisaStampWire(stamp: {
  id: string;
  userId: string;
  sourceKind: "ACADEMY_CERTIFICATE" | "FREELANCER_RELEASE" | "YETKINHIBE_PROJECT";
  sourceId: string;
  visaKey: string;
  moduleId: string;
  title: string;
  certificateHash: string | null;
  issuedAt: Date;
  createdAt: Date;
}) {
  return {
    id: stamp.id,
    userId: stamp.userId,
    sourceKind: stamp.sourceKind,
    sourceId: stamp.sourceId,
    visaKey: stamp.visaKey,
    moduleId: stamp.moduleId,
    title: stamp.title,
    certificateHash: stamp.certificateHash,
    issuedAt: stamp.issuedAt.toISOString(),
    createdAt: stamp.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const ports = createPrismaCareerPorts();
    await syncCareerVisaStamps(ports, { userId: user.id });
    const board = await projectLiveCareerBoard(ports, user.id);
    return jsonOk({ stamps: board.stamps.map(toVisaStampWire) }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const ports = createPrismaCareerPorts();
    await syncCareerVisaStamps(ports, { userId: user.id });
    const board = await projectLiveCareerBoard(ports, user.id);
    return jsonOk({ stamps: board.stamps.map(toVisaStampWire) }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
