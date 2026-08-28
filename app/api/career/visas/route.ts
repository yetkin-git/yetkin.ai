import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaCareerPorts } from "@/lib/career/runtime";
import { syncCareerVisaStamps } from "@/lib/career/engine";

export const auth = "session" as const;

function toVisaStampWire(stamp: {
  id: string;
  userId: string;
  sourceKind: "ACADEMY_CERTIFICATE" | "FREELANCER_RELEASE";
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
    const ports = createPrismaCareerPorts();
    await syncCareerVisaStamps(ports, { userId: user.id });
    const stamps = await ports.career.listStampsForUser(user.id);
    return jsonOk({ stamps: stamps.map(toVisaStampWire) }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaCareerPorts();
    const stamps = await syncCareerVisaStamps(ports, { userId: user.id });
    return jsonOk({ stamps: stamps.map(toVisaStampWire) }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
