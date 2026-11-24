import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { TEZGAH_GENERATE_SCOPE, TEZGAH_GRANT_SCOPE } from "@/lib/tezgah/paid-lane";

/**
 * Ücretli rezerv TTL'i (Y7).
 *
 * Kredi hattında her üretim `paid_command_reservations` içinde `RESERVED` satırı
 * açar (`beginTezgahCreditHold`). Başarıda `commitTezgahCredit` → `SETTLED`,
 * başarısızda `releaseTezgahCredit` → `FAILED`. Ama süreç çökerse / istek
 * zaman aşımına uğrarsa satır `RESERVED` kalır: kredi düşmez, tablo şişer ve
 * aynı anahtar "retry" sınıflanır.
 *
 * Bu süpürge **iki** kapsamı da kapatır: hibe dosyası (`tezgah.grant-dossier`)
 * ve üretim kredisi (`tezgah.generate`). Önceki sürüm yalnız hibe kapsamını
 * tarıyordu; üretim hattı sızıntısı açık kalıyordu.
 */
export const GRANT_DOSSIER_RESERVATION_TTL_MS = 15 * 60 * 1000;

/** Üretim kredisi rezervi — aynı pencere. */
export const TEZGAH_GENERATE_RESERVATION_TTL_MS = GRANT_DOSSIER_RESERVATION_TTL_MS;

export const TEZGAH_SWEPT_RESERVATION_SCOPES = [
  TEZGAH_GRANT_SCOPE,
  TEZGAH_GENERATE_SCOPE,
] as const;

export function grantReservationExpired(createdAt: Date, now: Date): boolean {
  return now.getTime() - createdAt.getTime() >= GRANT_DOSSIER_RESERVATION_TTL_MS;
}

/**
 * Süresi geçmiş `RESERVED` satırları `FAILED` yapar.
 * Kredi **düşmediği** için geri yazım yoktur; yalnız kilit açılır.
 */
export async function expireStaleReservations(
  now: Date = new Date(),
): Promise<{ expired: number }> {
  const cutoff = new Date(now.getTime() - GRANT_DOSSIER_RESERVATION_TTL_MS);
  const result = await getPrisma().paidCommandReservation.updateMany({
    where: {
      scope: { in: [...TEZGAH_SWEPT_RESERVATION_SCOPES] },
      status: "RESERVED",
      createdAt: { lt: cutoff },
    },
    data: { status: "FAILED", updatedAt: now },
  });
  return { expired: result.count };
}

/** Geriye dönük ad. Davranış artık tüm Tezgâh kapsamlarını kapsar. */
export const expireStaleGrantReservations = expireStaleReservations;
