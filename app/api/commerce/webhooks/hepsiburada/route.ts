import { postHepsiburadaWebhook } from "@/lib/commerce/marketplace-handlers";
import { liveHepsiburadaPorts } from "@/lib/commerce/hepsiburada-live";

export const auth = "webhook" as const;

export async function POST(request: Request) {
  return postHepsiburadaWebhook(liveHepsiburadaPorts(), request);
}
