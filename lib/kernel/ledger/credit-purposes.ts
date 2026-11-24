/**
 * Ledger CREDIT amaç listesi — tek dış para girişi PayTR clearing'dir.
 * Sahte bakiye, admin enjeksiyonu, mock iFrame ve donmuş oda settlement'ı yok.
 *
 * İç CREDIT yalnız çift kayıt / iade tersine çevirmesidir (yeni para doğmaz):
 * akademi settlement (vatandaş DEBIT eşleniği), emanet iadesi, tahkim işveren iadesi.
 *
 * Ürün CREDIT'i (hibe) dış paradır: PayTR clearing'den gelir. Ayrı listede durur çünkü
 * etiketi ürün niyetini taşır (Ş3 / B-03): "cüzdan yükleme" ile karışırsa ürün bazlı
 * gelir ölçümü imkânsız olur.
 */

export const LEDGER_EXTERNAL_CREDIT_PURPOSE = "wallet-top-up" as const;

export const LEDGER_INTERNAL_CREDIT_PURPOSES = [
  "academy-settlement",
  "escrow-refund",
  "escrow-release-payer-refund",
] as const;

/** PayTR'den gelen ürün bedeli. Niyet dizgisi sipariş etiketiyle aynıdır. */
export const LEDGER_PRODUCT_CREDIT_PURPOSES = [
  "grant-dossier",
  "hibe-agency",
  /** Faz 3 / §4.3 — YetkinCV kamuya açık yayın bedeli. */
  "career-publication",
  /** Kurumsal ilan / aday eleme paketi bedeli. */
  "kurumsal-screening",
  /** Akademi kurs lisansı bedeli. */
  "academy-license",
  /** Junior yıllık paket bedeli. */
  "junior-license",
] as const;

export const LEDGER_CREDIT_PURPOSES = [
  LEDGER_EXTERNAL_CREDIT_PURPOSE,
  ...LEDGER_INTERNAL_CREDIT_PURPOSES,
  ...LEDGER_PRODUCT_CREDIT_PURPOSES,
] as const;

export type LedgerCreditPurpose = (typeof LEDGER_CREDIT_PURPOSES)[number];

export const LEDGER_CREDIT_PURPOSE_REJECTED =
  "Ledger CREDIT amacı izin listesinde değil. Dış para yalnız wallet-top-up ve ürün CREDIT'i (PayTR clearing)." as const;

export function isLedgerCreditPurpose(purpose: string): purpose is LedgerCreditPurpose {
  return (LEDGER_CREDIT_PURPOSES as readonly string[]).includes(purpose);
}

export function assertLedgerCreditPurpose(purpose: string): asserts purpose is LedgerCreditPurpose {
  if (!isLedgerCreditPurpose(purpose)) {
    throw new Error(LEDGER_CREDIT_PURPOSE_REJECTED);
  }
}
