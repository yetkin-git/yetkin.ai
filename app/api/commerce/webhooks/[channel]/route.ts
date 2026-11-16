import { liveChannelWebhookDeps } from "@/lib/commerce/channel-webhook-live";
import { postCommerceChannelWebhook } from "@/lib/commerce/channel-webhook-handler";

export const auth = "webhook" as const;

export async function POST(request: Request, context: { params: Promise<{ channel: string }> }) {
  const { channel } = await context.params;
  return postCommerceChannelWebhook(liveChannelWebhookDeps(), request, channel);
}
