import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { ConflictError } from "@/lib/kernel/http/errors";
import { JUNIOR_LICENSE_ORDER_PURPOSE } from "@/lib/junior/paytr-license-bridge";

/**
 * Hesap kapanışı için Junior kapısı (T-02).
 * Aktif yıllık paket, açık çocuk profili ve sürmekte olan lisans ödemesi kapanışı durdurur.
 * Bu modül yalnız okur ve reddeder; hiçbir Junior satırını silmez veya anonimleştirmez.
 */

export const JUNIOR_ACCOUNT_CLOSE_PLAN_BLOCK =
  "Yıllık Junior paketin açık. Paket süresi bitmeden hesap kapatılamaz.";

export const JUNIOR_ACCOUNT_CLOSE_PROFILE_BLOCK =
  "Açık bir Junior çocuk profilin var. Hesabı kapatmadan önce profili Junior ekranından kapat.";

export const JUNIOR_ACCOUNT_CLOSE_PAYMENT_BLOCK =
  "Junior paket ödemen henüz sonuçlanmadı. Ödeme kapanınca hesap kapatılabilir.";

export type JuniorAccountCloseState = {
  /** Süresi dolmamış ACTIVE yıllık paket. */
  activePlan: boolean;
  /** Doğum yılı dolu, yani kapatılmamış çocuk profili sayısı. */
  openChildProfiles: number;
  /** Bir gün içindeki PENDING siparişi veya tahsil edilmiş ama henüz kesinleşmemiş (PAID) lisans siparişi. */
  paymentInFlight: boolean;
};

export function assertJuniorAccountCloseable(state: JuniorAccountCloseState): void {
  if (state.activePlan) {
    throw new ConflictError(JUNIOR_ACCOUNT_CLOSE_PLAN_BLOCK);
  }
  if (state.openChildProfiles > 0) {
    throw new ConflictError(JUNIOR_ACCOUNT_CLOSE_PROFILE_BLOCK);
  }
  if (state.paymentInFlight) {
    throw new ConflictError(JUNIOR_ACCOUNT_CLOSE_PAYMENT_BLOCK);
  }
}

/** Yalnız okuyan sorgu arayüzü. Test ortamında sahte istemci enjekte edilir. */
export type JuniorAccountCloseDb = {
  $queryRaw<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T>;
};

export async function readJuniorAccountCloseState(
  userId: string,
  db: JuniorAccountCloseDb = getPrisma(),
): Promise<JuniorAccountCloseState> {
  const [plans, profiles, payments] = await Promise.all([
    db.$queryRaw<{ n: number }[]>`
      SELECT COUNT(*)::int AS n
      FROM junior_subscriptions
      WHERE user_id = ${userId}
        AND status = 'ACTIVE'
        AND expires_at > NOW()
    `,
    db.$queryRaw<{ n: number }[]>`
      SELECT COUNT(*)::int AS n
      FROM junior_profiles
      WHERE user_id = ${userId}
        AND birth_year IS NOT NULL
    `,
    db.$queryRaw<{ n: number }[]>`
      SELECT COUNT(*)::int AS n
      FROM payment_orders
      WHERE user_id = ${userId}
        AND purpose = ${JUNIOR_LICENSE_ORDER_PURPOSE}
        AND (
          status = 'PAID'
          OR (status = 'PENDING' AND created_at > NOW() - INTERVAL '1 day')
        )
    `,
  ]);
  return {
    activePlan: Number(plans[0]?.n ?? 0) > 0,
    openChildProfiles: Number(profiles[0]?.n ?? 0),
    paymentInFlight: Number(payments[0]?.n ?? 0) > 0,
  };
}

/** Hesap kapanış kapısı. `registerJuniorAccountCloseGuard` ile kernel'e bağlanır. */
export async function juniorAccountCloseGuard(userId: string): Promise<void> {
  assertJuniorAccountCloseable(await readJuniorAccountCloseState(userId));
}
