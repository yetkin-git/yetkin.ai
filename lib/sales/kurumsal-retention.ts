import "server-only";

import { getPrisma } from "@/lib/kernel/db";

/**
 * Kurumsal başvuru KVKK saklama — 90 gün (F1.6 / K-02).
 *
 * `deadlineAt < now - 90g` (veya kapanmış / süresi dolmuş ve 90 günü geçmiş) ilanlara
 * ait başvurulardaki aday PII alanlarını idempotent anonimleştirir.
 * Sıralama / band satırı bozulmaz; yalnız kişisel alanlar silinir.
 *
 * Dürüstlük: ham CV metni boşaltılır. İsim/e-posta anonim sabitlere çekilir.
 */

export const KURUMSAL_APPLICATION_RETENTION_DAYS = 90 as const;

export const KURUMSAL_RETENTION_ANON_NAME = "Anonim aday" as const;
export const KURUMSAL_RETENTION_ANON_EMAIL = "anonim@yetkin.local" as const;
export const KURUMSAL_RETENTION_ANON_SUMMARY = "" as const;

export type KurumsalRetentionResult = {
  cutoffIso: string;
  jobsMatched: number;
  applicationsAnonymized: number;
};

function retentionCutoff(now: Date): Date {
  const cutoff = new Date(now.getTime());
  cutoff.setUTCDate(cutoff.getUTCDate() - KURUMSAL_APPLICATION_RETENTION_DAYS);
  return cutoff;
}

/**
 * Bir ilanın başvuru PII'si 90 günlük saklama eşiğine düştü mü?
 * - Son başarı tarihi varsa: `deadlineAt < cutoff`
 * - Deadline yoksa: ilan kapalıysa ve `createdAt < cutoff` (kapanış vekili)
 */
export function isKurumsalJobPastRetention(
  job: { deadlineAt: Date | null; isActive: boolean; createdAt: Date },
  now: Date = new Date(),
): boolean {
  const cutoff = retentionCutoff(now);
  if (job.deadlineAt) {
    return job.deadlineAt.getTime() < cutoff.getTime();
  }
  if (!job.isActive) {
    return job.createdAt.getTime() < cutoff.getTime();
  }
  return false;
}

export async function anonymizeExpiredKurumsalApplications(
  now: Date = new Date(),
): Promise<KurumsalRetentionResult> {
  const prisma = getPrisma();
  const cutoff = retentionCutoff(now);
  const jobs = await prisma.kurumsalJobPosting.findMany({
    where: {
      OR: [
        { deadlineAt: { lt: cutoff } },
        { isActive: false, deadlineAt: null, createdAt: { lt: cutoff } },
      ],
    },
    select: { id: true },
  });
  if (jobs.length === 0) {
    return {
      cutoffIso: cutoff.toISOString(),
      jobsMatched: 0,
      applicationsAnonymized: 0,
    };
  }
  /**
   * İdempotans filtresi — **yalnız** kimlik alanları (ad + e-posta) üzerinedir.
   *
   * Önceki sürüm `cvSummary` sabitini de `NOT` bloğuna katıyordu ve bu, aynı PII'yi
   * iki farklı akışın **farklı** özet sabitiyle anonimleştirmesi yüzünden tutarsızdı:
   * `eraseCareerPersonalData` (KVKK talebi) özete `"Kişisel veri KVKK talebiyle
   * silindi."` yazıyor, bu iş ise `""` yazıyordu. Sonuç: adı/e-postası zaten
   * anonimleşmiş bir satır, özet farklı olduğu için **bir kez daha** güncelleniyordu
   * (gereksiz yazma + iki akışın birbirinin işini ezmesi).
   *
   * Ad ve e-posta iki akışta da **aynı** sabitlere çekilir; bu ikisi PII'nin
   * kendisidir. `cvSummary` hangi sabitle boşaltılmış olursa olsun PII taşımaz,
   * dolayısıyla idempotans anahtarı olmamalıdır.
   */
  const result = await prisma.kurumsalJobApplication.updateMany({
    where: {
      jobId: { in: jobs.map((row) => row.id) },
      NOT: {
        candidateName: KURUMSAL_RETENTION_ANON_NAME,
        candidateEmail: KURUMSAL_RETENTION_ANON_EMAIL,
      },
    },
    data: {
      candidateName: KURUMSAL_RETENTION_ANON_NAME,
      candidateEmail: KURUMSAL_RETENTION_ANON_EMAIL,
      cvSummary: KURUMSAL_RETENTION_ANON_SUMMARY,
    },
  });
  return {
    cutoffIso: cutoff.toISOString(),
    jobsMatched: jobs.length,
    applicationsAnonymized: result.count,
  };
}
