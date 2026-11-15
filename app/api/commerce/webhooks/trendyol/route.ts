import { postTrendyolWebhook } from "@/lib/commerce/marketplace-handlers";
import { liveTrendyolPorts } from "@/lib/commerce/trendyol-live";

export const auth = "webhook" as const;

export async function POST(request: Request) {
  return postTrendyolWebhook(liveTrendyolPorts(), request);
}
