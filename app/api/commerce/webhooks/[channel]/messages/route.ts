import { liveChannelMessageDeps } from "@/lib/commerce/channel-message-live";
import { postCommerceChannelMessage } from "@/lib/commerce/channel-message-handler";

export const auth = "webhook" as const;

export async function POST(request: Request, context: { params: Promise<{ channel: string }> }) {
  const { channel } = await context.params;
  return postCommerceChannelMessage(liveChannelMessageDeps(), request, channel);
}
