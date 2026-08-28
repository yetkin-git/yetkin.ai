import { AuthRequiredError, requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { EMPTY_WALLET_STRIP } from "@/lib/dashboard/wallet-strip";
import { readWalletStripSnapshot } from "@/lib/dashboard/load-wallet-strip";

export const auth = "session" as const;
export const dynamic = "force-dynamic";

function isDatabaseUnconfigured(error: unknown): boolean {
  return error instanceof Error && error.message.includes("DATABASE_URL");
}

function isPrismaClientError(error: unknown): boolean {
  return error instanceof Error && error.name.startsWith("PrismaClient");
}

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const strip = await readWalletStripSnapshot(user.id);
    return jsonOk({ strip }, 200, undefined, request);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return jsonOk({ strip: EMPTY_WALLET_STRIP }, 200, undefined, request);
    }
    if (isDatabaseUnconfigured(error) || isPrismaClientError(error)) {
      return jsonOk({ strip: EMPTY_WALLET_STRIP }, 200, undefined, request);
    }
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
