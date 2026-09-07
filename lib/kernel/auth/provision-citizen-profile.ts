import "server-only";

import { randomUUID } from "node:crypto";
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { AUTH_REGISTER_API_PATH } from "@/lib/kernel/auth/redirects";
import { getPrisma, prismaErrorLabel } from "@/lib/kernel/db";
import { isPrismaUniqueViolation } from "@/lib/kernel/db-errors";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { logEvent } from "@/lib/kernel/observability/log";

export type CitizenProfileUpsertInput = {
  userId: string;
  email: string;
  displayName: string | null;
};

export type CitizenProfileUpsertResult = { ok: true } | { ok: false; errorName: string };

function profileConstraintLabel(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/users_email_key/i.test(message) || /unique constraint failed on the fields: \(`email`\)/i.test(message)) {
    return "users_email_unique";
  }
  if (
    /wallets_user_id_currency_code/i.test(message) ||
    /wallets_pkey/i.test(message)
  ) {
    return "wallets_unique";
  }
  if (isPrismaUniqueViolation(error)) {
    return "unique_violation";
  }
  return prismaErrorLabel(error);
}

function logProfileFailure(reason: string, errorName: string): void {
  logEvent({
    level: "error",
    event: "auth.register",
    reason,
    errorName,
    route: AUTH_REGISTER_API_PATH,
  });
}

/**
 * Auth satırı silinmiş, public.users + TRY cüzdanı kalmış yetimleri temizler.
 * Defteri olan satıra dokunmaz — kayıt tetikleyicisi net kısıt basar.
 */
export async function clearOrphanCitizenRows(email: string): Promise<CitizenProfileUpsertResult> {
  const prisma = getPrisma();
  try {
    const authRows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id::text AS id
      FROM auth.users
      WHERE lower(email) = lower(${email})
    `;
    const publicRows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM public.users
      WHERE lower(email) = lower(${email})
    `;
    const authIds = new Set(authRows.map((row) => row.id));
    const orphans = publicRows.filter((row) => !authIds.has(row.id));
    for (const orphan of orphans) {
      const ledger = await prisma.$queryRaw<{ n: bigint }[]>`
        SELECT count(*)::bigint AS n
        FROM public.ledger_entries
        WHERE user_id = ${orphan.id}
      `;
      if (Number(ledger[0]?.n ?? 0) > 0) {
        logProfileFailure("orphan_has_ledger", "ledger_restrict");
        return { ok: false, errorName: "ledger_restrict" };
      }
      await prisma.$executeRaw`
        DELETE FROM public.wallets WHERE user_id = ${orphan.id}
      `;
      await prisma.$executeRaw`
        DELETE FROM public.users WHERE id = ${orphan.id}
      `;
    }
    return { ok: true };
  } catch (error) {
    const errorName = profileConstraintLabel(error);
    logProfileFailure("orphan_clear_failed", errorName);
    return { ok: false, errorName };
  }
}

/**
 * Kayıt sonrası kullanıcı + TRY cüzdanı — INSERT değil UPSERT.
 * Cüzdan bakiyesi ON CONFLICT ile yazılmaz; yalnız satırın varlığı güvence.
 */
export async function upsertCitizenUserAndWallet(
  input: CitizenProfileUpsertInput,
): Promise<CitizenProfileUpsertResult> {
  if (!isSupabaseUserId(input.userId)) {
    logProfileFailure("profile_upsert_failed", "invalid_user_id");
    return { ok: false, errorName: "invalid_user_id" };
  }
  const prisma = getPrisma();
  const displayName = input.displayName?.trim() || null;
  try {
    await prisma.$executeRaw`
      INSERT INTO public.users (id, email, display_name, locale, time_zone, created_at, updated_at)
      VALUES (
        ${input.userId},
        ${input.email},
        ${displayName},
        'tr-TR',
        'Europe/Istanbul',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            display_name = COALESCE(public.users.display_name, EXCLUDED.display_name),
            updated_at = NOW()
    `;
  } catch (error) {
    const errorName = profileConstraintLabel(error);
    logProfileFailure("profile_upsert_failed", errorName);
    return { ok: false, errorName };
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO public.wallets (id, user_id, currency_code, amount_minor, created_at, updated_at)
      VALUES (${randomUUID()}, ${input.userId}, ${SETTLEMENT_CURRENCY}, 0, NOW(), NOW())
      ON CONFLICT (user_id, currency_code) DO UPDATE
        SET updated_at = NOW()
    `;
  } catch (error) {
    const errorName = profileConstraintLabel(error);
    logProfileFailure("wallet_upsert_failed", errorName);
    return { ok: false, errorName };
  }
  return { ok: true };
}
