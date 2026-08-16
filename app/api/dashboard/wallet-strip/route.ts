import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { EMPTY_WALLET_STRIP } from "@/lib/dashboard/wallet-strip";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const prisma = getPrisma();
    const wallet = await prisma.wallet.findUnique({
      where: { userId_currencyCode: { userId: user.id, currencyCode: SETTLEMENT_CURRENCY } },
    });
    return jsonOk({
      strip: {
        live: true,
        amountMinor: toAmountMinor(wallet?.amountMinor ?? 0),
        currencyCode: SETTLEMENT_CURRENCY,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return jsonOk({ strip: EMPTY_WALLET_STRIP });
    }
    return jsonFromUnknown(error);
  }
}
