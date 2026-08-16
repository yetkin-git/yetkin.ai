import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { issueDevLabsApiKey } from "@/lib/devlabs/engine";
import { toCitizenDevLabsApiKey } from "@/lib/devlabs/keys";
import { issueApiKeyInputSchema } from "@/lib/devlabs/schemas";
import { createPrismaDevLabsPorts } from "@/lib/devlabs/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const parsed = issueApiKeyInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Anahtar adı geçersiz.", 400);
    }
    const ports = createPrismaDevLabsPorts();
    const issued = await issueDevLabsApiKey(ports, {
      projectId: id,
      actorUserId: user.id,
      name: parsed.data.name,
    });
    return jsonOk(
      {
        key: toCitizenDevLabsApiKey(issued.record),
        plaintext: issued.plaintext,
      },
      201,
    );
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
