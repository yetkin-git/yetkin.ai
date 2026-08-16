import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { revokeDevLabsApiKey } from "@/lib/devlabs/engine";
import { toCitizenDevLabsApiKey } from "@/lib/devlabs/keys";
import { createPrismaDevLabsPorts } from "@/lib/devlabs/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaDevLabsPorts();
    const key = await revokeDevLabsApiKey(ports, {
      keyId: id,
      actorUserId: user.id,
    });
    return jsonOk({
      key: toCitizenDevLabsApiKey(key),
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
