import { postOsCockpit } from "@/lib/commerce/os-handlers";
import { liveCommerceDeps } from "@/lib/commerce/live";

export const auth = "session" as const;

export function POST(request: Request) {
  return postOsCockpit(liveCommerceDeps(), request);
}
