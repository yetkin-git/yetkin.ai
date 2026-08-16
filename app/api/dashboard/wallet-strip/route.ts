import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { ensurePrismaQueryEngine, prismaErrorLabel } from "@/lib/kernel/db";
import { ensureSettlementWallet } from "@/lib/kernel/ledger/wallet-read";
import { EMPTY_WALLET_STRIP } from "@/lib/dashboard/wallet-strip";
import { logEvent } from "@/lib/kernel/observability/log";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    await ensurePrismaQueryEngine();
    const wallet = await ensureSettlementWallet(user.id);
    return jsonOk({
      strip: {
        live: true,
        amountMinor: wallet.amountMinor,
        currencyCode: wallet.currencyCode,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return jsonOk({ strip: EMPTY_WALLET_STRIP });
    }
    if (error instanceof Error && error.name.startsWith("PrismaClient")) {
      logEvent({
        level: "warn",
        event: "dashboard.wallet_strip.failed",
        errorName: prismaErrorLabel(error),
        route: "/api/dashboard/wallet-strip",
      });
      return jsonFail("Veritabanı erişilemez.", 503);
    }
    return jsonFromUnknown(error);
  }
}
