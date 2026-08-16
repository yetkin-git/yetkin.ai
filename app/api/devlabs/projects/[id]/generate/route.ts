import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { generateDevLabsCode } from "@/lib/devlabs/bench";
import { generateDevLabsCodeInputSchema } from "@/lib/devlabs/schemas";
import { createPrismaDevLabsPorts } from "@/lib/devlabs/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const parsed = generateDevLabsCodeInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Kod üretim gövdesi geçersiz.", 400);
    }
    const ports = createPrismaDevLabsPorts();
    const result = await generateDevLabsCode(ports, {
      projectId: id,
      actorUserId: user.id,
      apiKeyId: parsed.data.apiKeyId,
      prompt: parsed.data.prompt,
    });
    return jsonOk({
      artifact: {
        id: result.artifact.id,
        prompt: result.artifact.prompt,
        outputCode: result.artifact.outputCode,
        linterOk: result.artifact.linterOk,
        linterScore: result.artifact.linterScore,
        linterReportJson: result.artifact.linterReportJson,
        contentHash: result.artifact.contentHash,
        apiKeyId: result.artifact.apiKeyId,
        debitMinor: result.artifact.debitMinor,
        createdAt: result.artifact.createdAt,
      },
      debitMinor: result.debitMinor,
      linterOk: result.linterOk,
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
