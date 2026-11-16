import { liveChannelWebhookDeps } from "@/lib/commerce/channel-webhook-live";
import { postCommerceChannelWebhook } from "@/lib/commerce/channel-webhook-handler";
import { isOsChannelWebhookBody } from "@/lib/commerce/channel-webhook";
import { postHepsiburadaWebhook } from "@/lib/commerce/marketplace-handlers";
import { liveHepsiburadaPorts } from "@/lib/commerce/hepsiburada-live";

export const auth = "webhook" as const;

function replay(request: Request, raw: string): Request {
  return new Request(request.url, { method: "POST", headers: request.headers, body: raw });
}

export async function POST(request: Request) {
  const raw = await request.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    parsed = null;
  }
  if (isOsChannelWebhookBody(parsed)) {
    return postCommerceChannelWebhook(liveChannelWebhookDeps(), replay(request, raw), "hepsiburada");
  }
  return postHepsiburadaWebhook(liveHepsiburadaPorts(), replay(request, raw));
}
