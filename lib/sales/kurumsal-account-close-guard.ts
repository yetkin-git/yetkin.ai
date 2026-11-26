import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { ConflictError } from "@/lib/kernel/http/errors";

/**
 * Hesap kapanışı için kurumsal kapısı (F1.6 / K-02).
 * Aktif (`isActive: true`) açık ilanı olan işveren hesabı kapatılamaz.
 * Bu modül yalnız okur ve reddeder; ilan veya başvuru silmez.
 */

export const KURUMSAL_ACCOUNT_CLOSE_ACTIVE_JOB_BLOCK =
  "Açık bir kurumsal ilanın var. Hesabı kapatmadan önce ilanı İK kokpitinden kapat.";

export type KurumsalAccountCloseState = {
  activeJobs: number;
};

export function assertKurumsalAccountCloseable(state: KurumsalAccountCloseState): void {
  if (state.activeJobs > 0) {
    throw new ConflictError(KURUMSAL_ACCOUNT_CLOSE_ACTIVE_JOB_BLOCK);
  }
}

export type KurumsalAccountCloseDb = {
  kurumsalJobPosting: {
    count(args: { where: { ownerUserId: string; isActive: true } }): Promise<number>;
  };
};

export async function readKurumsalAccountCloseState(
  userId: string,
  db: KurumsalAccountCloseDb = getPrisma(),
): Promise<KurumsalAccountCloseState> {
  const activeJobs = await db.kurumsalJobPosting.count({
    where: { ownerUserId: userId, isActive: true },
  });
  return { activeJobs };
}

/** Hesap kapanış kapısı. `registerKurumsalAccountCloseGuard` ile kernel'e bağlanır. */
export async function kurumsalAccountCloseGuard(userId: string): Promise<void> {
  assertKurumsalAccountCloseable(await readKurumsalAccountCloseState(userId));
}
