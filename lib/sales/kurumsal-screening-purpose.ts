import { KURUMSAL_SCREENING_UNIT } from "@/lib/sales/kurumsal-screening";

/** CLEARED sipariş niyeti — katalog birimiyle birebir. */
export const KURUMSAL_SCREENING_ORDER_PURPOSE = "kurumsal-license:job-screening-pack" as const;

/** Kota kilidi ad alanı — `pg_advisory_xact_lock(namespace, hashtext(ownerUserId))`. */
export const KURUMSAL_QUOTA_LOCK_NAMESPACE = 74_210_001 as const;

/**
 * Vergi numarası sahipliği kilidi — `pg_advisory_xact_lock(namespace, hashtext(taxNumber))`.
 *
 * `ownerUserId` kilidi **aynı işverenin** eşzamanlı ilanlarını sıraya sokar; ama
 * **iki farklı işveren** aynı `taxNumber` ile aynı anda ilan açarsa ikisi de
 * "başka sahip yok" görür ve iki hesap aynı vergi numarasına bağlanır (409
 * kontrolü yarışa açık kalır). Bu ikinci kilit numara üzerinedir; sıra daima
 * **önce sahip, sonra numara** olduğu için kilitlenme (deadlock) doğmaz.
 */
export const KURUMSAL_TAX_LOCK_NAMESPACE = 74_210_003 as const;

export const KURUMSAL_SCREENING_PURCHASE_PATH = "/kurumsal#kurumsal-teklif" as const;

/**
 * Tanımlı çoklu paket önekleri. Gevşek `contains` yok — yalnız kesin purpose veya
 * bilinen `kurumsal-license:` öneki + birim anahtarı kabul edilir (D-01).
 */
export const KURUMSAL_SCREENING_PURPOSE_PREFIXES = ["kurumsal-license:"] as const;

/** Her CLEARED job-screening-pack siparişi başına açılabilir ilan hakkı (Y-01 / F2.1). */
export const KURUMSAL_JOBS_PER_LICENSE = 3 as const;

/** Purpose kesin eşleşmesi — `contains` yok. */
export function isKurumsalScreeningOrderPurpose(purpose: string | null | undefined): boolean {
  if (!purpose) {
    return false;
  }
  if (purpose === KURUMSAL_SCREENING_ORDER_PURPOSE) {
    return true;
  }
  for (const prefix of KURUMSAL_SCREENING_PURPOSE_PREFIXES) {
    if (purpose.startsWith(prefix) && purpose.slice(prefix.length) === KURUMSAL_SCREENING_UNIT) {
      return true;
    }
  }
  return false;
}
