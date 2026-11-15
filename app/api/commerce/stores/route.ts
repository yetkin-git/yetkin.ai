import { getStores, postStore } from "@/lib/commerce/handlers";
import { liveCommerceDeps } from "@/lib/commerce/live";

export const auth = "session" as const;

const deps = liveCommerceDeps();

export function GET(request: Request) {
  return getStores(deps, request);
}

export function POST(request: Request) {
  return postStore(deps, request);
}
