import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    return jsonOk({ user }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 401, undefined, request);
  }
}
