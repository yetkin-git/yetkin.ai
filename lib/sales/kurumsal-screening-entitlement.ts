import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  KURUMSAL_SCREENING_MODULE,
  KURUMSAL_SCREENING_UNIT,
} from "@/lib/sales/kurumsal-screening";
import {
  isKurumsalScreeningOrderPurpose,
  KURUMSAL_JOBS_PER_LICENSE,
  KURUMSAL_SCREENING_ORDER_PURPOSE,
  KURUMSAL_SCREENING_PURCHASE_PATH,
} from "@/lib/sales/kurumsal-screening-purpose";

export {
  isKurumsalScreeningOrderPurpose,
  KURUMSAL_JOBS_PER_LICENSE,
  KURUMSAL_SCREENING_ORDER_PURPOSE,
  KURUMSAL_SCREENING_PURPOSE_PREFIXES,
  KURUMSAL_SCREENING_PURCHASE_PATH,
} from "@/lib/sales/kurumsal-screening-purpose";

/**
 * Kota sayımının okuduğu asgari yüzey. Prisma client ve transaction istemcisi bu
 * tipte birleşir; kapı hem tekil hem transactional çağrılabilir. `where`/`orderBy`
 * bilinçli olarak gevşek yazıldı — Prisma'nın üretilmiş tiplerini çekirdeğe taşımaz.
 */
export type KurumsalEntitlementDb = {
  paymentOrder: {
    findMany(args: {
      where: Record<string, unknown>;
      orderBy?: Record<string, unknown>;
      select: { merchantOid: true; purpose: true };
    }): Promise<{ merchantOid: string; purpose: string | null }[]>;
  };
  kurumsalJobPosting: {
    count(args: { where: Record<string, unknown> }): Promise<number>;
  };
};

/**
 * Katalog kapısının **transaction dışında** okunmuş kararı.
 *
 * **Neden ayrı bir adım.** Katalog okuması `getPrisma()` (global istemci) üzerinden
 * yapılır. Bu okuma açık bir `prisma.$transaction` bloğunun **içinde** çağrılırsa
 * iki bağlantı istenir: biri transaction'ın tuttuğu, biri katalog için. Vercel
 * serverless'ta havuz tavanı `PRISMA_POOL_MAX_SERVERLESS = 1` olduğu için ikinci
 * bağlantı **hiç açılmaz**: istek `pool_timeout` ile 500'e düşer. Ölçüldü —
 * `POST /api/kurumsal/ilanlar` üretimde her seferinde başarısız oluyordu.
 *
 * Katalog satırı yalnız "paket satışta mı" sorusunu cevaplar; ilan sayımıyla aynı
 * anlık görüntüde olmak zorunda değildir. Bu yüzden karar tx'ten **önce** alınır,
 * tx içinde yalnız saf sayım kalır.
 */
export type KurumsalCatalogGate =
  | { ok: true; amountMinor: number }
  | { ok: false; reason: "catalog-inactive" };

export async function readKurumsalScreeningCatalogGate(): Promise<KurumsalCatalogGate> {
  try {
    const entry = await createPrismaPriceCatalogStore().findActiveEntry(
      KURUMSAL_SCREENING_MODULE,
      KURUMSAL_SCREENING_UNIT,
    );
    if (
      !entry ||
      !entry.isActive ||
      entry.currencyCode !== "TRY" ||
      entry.unitType !== "MINOR" ||
      entry.amountMinor <= 0
    ) {
      return { ok: false, reason: "catalog-inactive" };
    }
    return { ok: true, amountMinor: toPositiveAmountMinor(entry.amountMinor) };
  } catch {
    return { ok: false, reason: "catalog-inactive" };
  }
}

export type KurumsalScreeningEntitlement =
  | {
      ok: true;
      merchantOid: string;
      clearedPackCount: number;
      jobQuota: number;
      jobCount: number;
      remainingJobs: number;
    }
  | {
      ok: false;
      reason: "catalog-inactive" | "license-missing" | "quota-exhausted";
      purchasePath: string;
      clearedPackCount?: number;
      jobQuota?: number;
      jobCount?: number;
    };

/**
 * Saf kota kararı — yan etkisiz, test edilebilir.
 *
 * **Kota neyi sayar.** `jobCount` sahibin açtığı **tüm** ilanlardır; `isActive`
 * filtresi **yoktur**. Kapatılan ilan kotadan düşmez. Bu bilinçli bir kötüye
 * kullanım kalkanıdır: düşseydi "aç → kapat → aç" döngüsü tek paketle sınırsız
 * ilan demek olurdu. Bedeli: kotayı geri kazanmanın yolu yeni paket satın almaktır.
 */
export function decideKurumsalScreeningQuota(input: {
  clearedPackCount: number;
  jobCount: number;
}): { ok: true; jobQuota: number; remainingJobs: number } | { ok: false; jobQuota: number } {
  const packCount = Math.max(0, Math.trunc(input.clearedPackCount));
  const jobCount = Math.max(0, Math.trunc(input.jobCount));
  const jobQuota = packCount * KURUMSAL_JOBS_PER_LICENSE;
  if (jobCount >= jobQuota) {
    return { ok: false, jobQuota };
  }
  return { ok: true, jobQuota, remainingJobs: jobQuota - jobCount };
}

/**
 * İlan açma kapısı: CLEARED paket sayısı × kota ≥ mevcut ilan.
 *
 * `db` verilirse sayım o istemci (transaction) üzerinden yapılır. **Katalog kararı
 * buraya dışarıdan verilir** (`catalog`) — içeride global istemci okunursa açık
 * transaction ikinci bağlantı ister ve serverless havuzunda ölür.
 */
export async function assertKurumsalScreeningEntitlement(
  ownerUserId: string,
  db: KurumsalEntitlementDb,
  catalog: KurumsalCatalogGate,
): Promise<KurumsalScreeningEntitlement> {
  if (!catalog.ok) {
    return {
      ok: false,
      reason: "catalog-inactive",
      purchasePath: KURUMSAL_SCREENING_PURCHASE_PATH,
    };
  }
  const orders = await db.paymentOrder.findMany({
    where: {
      userId: ownerUserId,
      status: "CLEARED",
      purpose: { in: [KURUMSAL_SCREENING_ORDER_PURPOSE] },
    },
    orderBy: { createdAt: "desc" },
    select: { merchantOid: true, purpose: true },
  });
  const matching = orders.filter((row) => isKurumsalScreeningOrderPurpose(row.purpose));
  if (matching.length === 0) {
    return {
      ok: false,
      reason: "license-missing",
      purchasePath: KURUMSAL_SCREENING_PURCHASE_PATH,
    };
  }
  const clearedPackCount = matching.length;
  const jobCount = await db.kurumsalJobPosting.count({ where: { ownerUserId } });
  const quota = decideKurumsalScreeningQuota({ clearedPackCount, jobCount });
  if (!quota.ok) {
    return {
      ok: false,
      reason: "quota-exhausted",
      purchasePath: KURUMSAL_SCREENING_PURCHASE_PATH,
      clearedPackCount,
      jobQuota: quota.jobQuota,
      jobCount,
    };
  }
  return {
    ok: true,
    merchantOid: matching[0]!.merchantOid,
    clearedPackCount,
    jobQuota: quota.jobQuota,
    jobCount,
    remainingJobs: quota.remainingJobs,
  };
}

/** Katalog kapısını kendi okur — yalnız tx **dışında** çağrılmalıdır. */
export async function assertKurumsalScreeningEntitlementStandalone(
  ownerUserId: string,
  db: KurumsalEntitlementDb = getPrisma(),
): Promise<KurumsalScreeningEntitlement> {
  return assertKurumsalScreeningEntitlement(
    ownerUserId,
    db,
    await readKurumsalScreeningCatalogGate(),
  );
}
