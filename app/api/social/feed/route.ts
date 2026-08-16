import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { listProofFeedPage, syncProofFeed } from "@/lib/social/engine";
import { createPrismaSocialPorts } from "@/lib/social/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    await requireSession(request);
    const ports = createPrismaSocialPorts();
    const page = await listProofFeedPage(ports);
    return jsonOk({ feed: page });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaSocialPorts();
    const items = await syncProofFeed(ports, { userId: user.id });
    return jsonOk({ items });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
