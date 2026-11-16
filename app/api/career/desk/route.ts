import { readCareerDeskCommand } from "@/lib/career/desk-brief";
import { commitCareerDeskCommand } from "@/lib/career/desk-sync";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";

export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const command = readCareerDeskCommand(await request.json().catch(() => null));
    if (!command) {
      return jsonFail("Görev veya teslimat eksik.", 400, requestId, request);
    }
    const result = await commitCareerDeskCommand(user.id, command.taskId, command.command);
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk({ status: result.status, replayed: result.replayed }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
