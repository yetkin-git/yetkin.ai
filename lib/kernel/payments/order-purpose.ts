/**
 * Ödeme siparişinin ticari niyeti.
 * `purpose` dizgisi ürün kancasında durur. Bu kod iade ve defter kuralının kapısıdır.
 * Eski satırlar legacy dizgiyle sınıflanır; yeni satırlar `order_purpose` enum'unu da taşır.
 */
export const PAYMENT_ORDER_PURPOSE = {
  WALLET_TOPUP: "WALLET_TOPUP",
  TEZGAH_PRO: "TEZGAH_PRO",
  TEZGAH_CREDIT: "TEZGAH_CREDIT",
  COMMERCE_LICENSE: "COMMERCE_LICENSE",
  GRANT_DOSSIER: "GRANT_DOSSIER",
  /** Ş6 / B-04 — Ajans paketi. Cüzdan bakiyesine yazılır, müşteri dosyalarında düşer. */
  HIBE_AGENCY: "HIBE_AGENCY",
  /**
   * Faz 3 / §4.3 — YetkinCV kamuya açık yayın mührü (tek seferlik).
   * Sınıflanmazsa `ledgerCreditLineForOrder` "wallet-top-up" etiketiyle CREDIT yazar ve
   * `isCardRefundBlockedForOrder` false döner: müşteri **satın aldığı yayını** nakit iade
   * talebine konu edebilir (ürün bedava kalır). Bu yüzden kanonik koda bağlanır.
   */
  CAREER_PUBLICATION: "CAREER_PUBLICATION",
  /**
   * Kurumsal ilan / aday eleme paketi. Lisans kapısı `kurumsal-license:job-screening-pack`
   * niyetini CLEARED siparişte arar; sipariş satılırsa aynı sınıflama zorunludur.
   */
  KURUMSAL_SCREENING: "KURUMSAL_SCREENING",
  /**
   * Akademi kurs lisansı. PayTR `academy-license:{slug}` niyeti.
   * Sınıflanmazsa defter "Cüzdan yükleme" yazar ve karta iade kapısı açık kalır.
   */
  ACADEMY_LICENSE: "ACADEMY_LICENSE",
  /**
   * Junior yıllık paket. PayTR `junior-license:yearly` (ve `junior-license:*`) niyeti.
   * Sınıflanmazsa aynı para kaybı: yanlış etiket + self-servis iade.
   */
  JUNIOR_LICENSE: "JUNIOR_LICENSE",
} as const;

export type PaymentOrderPurpose =
  (typeof PAYMENT_ORDER_PURPOSE)[keyof typeof PAYMENT_ORDER_PURPOSE];

const LEGACY_PURPOSE: Record<string, PaymentOrderPurpose> = {
  "wallet-top-up": PAYMENT_ORDER_PURPOSE.WALLET_TOPUP,
  "tezgah-license:pro": PAYMENT_ORDER_PURPOSE.TEZGAH_PRO,
  "tezgah-credit:pack": PAYMENT_ORDER_PURPOSE.TEZGAH_CREDIT,
  "commerce-license:monthly": PAYMENT_ORDER_PURPOSE.COMMERCE_LICENSE,
  "grant-dossier": PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER,
  "hibe-agency": PAYMENT_ORDER_PURPOSE.HIBE_AGENCY,
  /**
   * Eski/kalıcı dikey dizgileri. Bu iki satır **para kaybını** kapatır: eksikken
   * `classifyPaymentOrderPurpose` null dönüyordu, kredi "wallet-top-up" etiketiyle
   * cüzdana yazılıyor ve self-servis karta iade kapısı açık kalıyordu.
   */
  "career-license:yetkincv-publication": PAYMENT_ORDER_PURPOSE.CAREER_PUBLICATION,
  "kurumsal-license:job-screening-pack": PAYMENT_ORDER_PURPOSE.KURUMSAL_SCREENING,
  "junior-license:yearly": PAYMENT_ORDER_PURPOSE.JUNIOR_LICENSE,
};

/** PayTR akademi kasası öneki — slug dinamiktir; LEGACY_PURPOSE tam eşleşme yetmez. */
const ACADEMY_LICENSE_PURPOSE_PREFIX = "academy-license:" as const;
/** PayTR Junior paket öneki — kanonik `junior-license:yearly`; gelecek SKU'lar aynı kovada. */
const JUNIOR_LICENSE_PURPOSE_PREFIX = "junior-license:" as const;

export function classifyPaymentOrderPurpose(
  purpose: string | null | undefined,
): PaymentOrderPurpose | null {
  if (!purpose) {
    return null;
  }
  if (
    purpose === PAYMENT_ORDER_PURPOSE.WALLET_TOPUP ||
    purpose === PAYMENT_ORDER_PURPOSE.TEZGAH_PRO ||
    purpose === PAYMENT_ORDER_PURPOSE.TEZGAH_CREDIT ||
    purpose === PAYMENT_ORDER_PURPOSE.COMMERCE_LICENSE ||
    purpose === PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER ||
    purpose === PAYMENT_ORDER_PURPOSE.HIBE_AGENCY ||
    purpose === PAYMENT_ORDER_PURPOSE.CAREER_PUBLICATION ||
    purpose === PAYMENT_ORDER_PURPOSE.KURUMSAL_SCREENING ||
    purpose === PAYMENT_ORDER_PURPOSE.ACADEMY_LICENSE ||
    purpose === PAYMENT_ORDER_PURPOSE.JUNIOR_LICENSE
  ) {
    return purpose;
  }
  if (purpose.startsWith(ACADEMY_LICENSE_PURPOSE_PREFIX)) {
    return PAYMENT_ORDER_PURPOSE.ACADEMY_LICENSE;
  }
  if (purpose.startsWith(JUNIOR_LICENSE_PURPOSE_PREFIX)) {
    return PAYMENT_ORDER_PURPOSE.JUNIOR_LICENSE;
  }
  return LEGACY_PURPOSE[purpose] ?? null;
}

/**
 * Hiç üretilmemiş hibe siparişi iadeye açıktır; teslim edilmiş dosya kapanır.
 * Karar `isCardRefundBlockedForOrder` içinde `produced` bayrağıyla verilir.
 */
export function isGrantProductPurpose(purpose: string | null | undefined): boolean {
  const kind = classifyPaymentOrderPurpose(purpose);
  return kind === PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER || kind === PAYMENT_ORDER_PURPOSE.HIBE_AGENCY;
}

/**
 * Teslimi **tespit edilemeyen** dijital ürün niyetleri.
 *
 * YetkinCV yayını ve kurumsal ilan paketi satıldığı anda teslim edilmiş sayılır
 * (`sealedPublication = true`, CLEARED sipariş = lisans). Hibe dosyasından farkı:
 * üretim ayrı bir komuttur, burada değil. Bu yüzden bunlar hibe gibi "üretilmediyse
 * iade" kapısına **girmez**; doğrudan aktif ürün sayılır.
 */
export function isDeliveredDigitalProductPurpose(purpose: string | null | undefined): boolean {
  const kind = classifyPaymentOrderPurpose(purpose);
  return (
    kind === PAYMENT_ORDER_PURPOSE.CAREER_PUBLICATION ||
    kind === PAYMENT_ORDER_PURPOSE.KURUMSAL_SCREENING ||
    kind === PAYMENT_ORDER_PURPOSE.ACADEMY_LICENSE ||
    kind === PAYMENT_ORDER_PURPOSE.JUNIOR_LICENSE
  );
}

/**
 * Aktif ürün bedeli self-servis karta dönmez.
 *
 * Hibe satırları bu listeye **koşulsuz** girmez: dosya üretilmediyse para iade edilebilir
 * olmalıdır (B-03/Ş3). Hibe kararı `isCardRefundBlockedForOrder` içindedir.
 */
export function isActivatedProductRefundBlocked(purpose: string | null | undefined): boolean {
  const kind = classifyPaymentOrderPurpose(purpose);
  return (
    kind === PAYMENT_ORDER_PURPOSE.TEZGAH_PRO ||
    kind === PAYMENT_ORDER_PURPOSE.COMMERCE_LICENSE ||
    kind === PAYMENT_ORDER_PURPOSE.CAREER_PUBLICATION ||
    kind === PAYMENT_ORDER_PURPOSE.KURUMSAL_SCREENING ||
    kind === PAYMENT_ORDER_PURPOSE.ACADEMY_LICENSE ||
    kind === PAYMENT_ORDER_PURPOSE.JUNIOR_LICENSE
  );
}

/**
 * Karta iade kapısı. Hibe ürününde ölçüt teslimattır: üretilmiş dosya iade dışı,
 * üretilmemiş sipariş iadeye açıktır. `produced` bilinmiyorsa satır iadeye **açılmaz**
 * (fail-closed: parayı geri vermek kanıt ister).
 */
export function isCardRefundBlockedForOrder(order: {
  purpose?: string | null;
  produced?: boolean | null;
}): boolean {
  if (isGrantProductPurpose(order.purpose)) {
    return order.produced !== false;
  }
  return isActivatedProductRefundBlocked(order.purpose);
}

export function isWalletTopUpPurpose(purpose: string | null | undefined): boolean {
  return classifyPaymentOrderPurpose(purpose) === PAYMENT_ORDER_PURPOSE.WALLET_TOPUP;
}

export function isTezgahCreditOrderPurpose(purpose: string | null | undefined): boolean {
  return classifyPaymentOrderPurpose(purpose) === PAYMENT_ORDER_PURPOSE.TEZGAH_CREDIT;
}

export type LedgerCreditLine = {
  /** Defter `purpose` dizgisi. CREDIT izin listesindedir. */
  purpose: string;
  /** Vatandaş defterinde görünen etiket. Ürünün kendi niyetini taşır. */
  label: string;
  /** Defter idempotency anahtarı. Sipariş başına tek satır. */
  idempotencyKey: string;
};

export const GRANT_DOSSIER_LEDGER_PURPOSE = "grant-dossier" as const;
export const HIBE_AGENCY_LEDGER_PURPOSE = "hibe-agency" as const;
/** Faz 3 / §4.3 — YetkinCV kamuya açık yayın bedeli. "Cüzdan yükleme" değildir. */
export const CAREER_PUBLICATION_LEDGER_PURPOSE = "career-publication" as const;
/** Kurumsal ilan / aday eleme paketi bedeli. */
export const KURUMSAL_SCREENING_LEDGER_PURPOSE = "kurumsal-screening" as const;
/** Akademi kurs lisansı bedeli. "Cüzdan yükleme" değildir. */
export const ACADEMY_LICENSE_LEDGER_PURPOSE = "academy-license" as const;
/** Junior yıllık paket bedeli. "Cüzdan yükleme" değildir. */
export const JUNIOR_LICENSE_LEDGER_PURPOSE = "junior-license" as const;

/**
 * CLEARED siparişin defter satırı (Ş3 / B-03). Tek üretici: clearing ve misafir
 * bağlama aynı satırı yazar, böylece 1.490 TL'lik dosya satışı defterde
 * "Cüzdan yükleme" diye görünmez.
 */
export function ledgerCreditLineForOrder(input: {
  purpose: string | null | undefined;
  merchantOid: string;
}): LedgerCreditLine {
  const kind = classifyPaymentOrderPurpose(input.purpose);
  if (kind === PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER) {
    return {
      purpose: GRANT_DOSSIER_LEDGER_PURPOSE,
      label: "Hibe proje dosyası",
      idempotencyKey: `${GRANT_DOSSIER_LEDGER_PURPOSE}:${input.merchantOid}`,
    };
  }
  if (kind === PAYMENT_ORDER_PURPOSE.HIBE_AGENCY) {
    return {
      purpose: HIBE_AGENCY_LEDGER_PURPOSE,
      label: "Hibe ajans paketi",
      idempotencyKey: `${HIBE_AGENCY_LEDGER_PURPOSE}:${input.merchantOid}`,
    };
  }
  if (kind === PAYMENT_ORDER_PURPOSE.CAREER_PUBLICATION) {
    return {
      purpose: CAREER_PUBLICATION_LEDGER_PURPOSE,
      label: "YetkinCV kamuya açık kart yayını",
      idempotencyKey: `${CAREER_PUBLICATION_LEDGER_PURPOSE}:${input.merchantOid}`,
    };
  }
  if (kind === PAYMENT_ORDER_PURPOSE.KURUMSAL_SCREENING) {
    return {
      purpose: KURUMSAL_SCREENING_LEDGER_PURPOSE,
      label: "Kurumsal ilan ve aday eleme paketi",
      idempotencyKey: `${KURUMSAL_SCREENING_LEDGER_PURPOSE}:${input.merchantOid}`,
    };
  }
  if (kind === PAYMENT_ORDER_PURPOSE.ACADEMY_LICENSE) {
    return {
      purpose: ACADEMY_LICENSE_LEDGER_PURPOSE,
      label: "Akademi lisansı",
      idempotencyKey: `${ACADEMY_LICENSE_LEDGER_PURPOSE}:${input.merchantOid}`,
    };
  }
  if (kind === PAYMENT_ORDER_PURPOSE.JUNIOR_LICENSE) {
    return {
      purpose: JUNIOR_LICENSE_LEDGER_PURPOSE,
      label: "Junior lisansı",
      idempotencyKey: `${JUNIOR_LICENSE_LEDGER_PURPOSE}:${input.merchantOid}`,
    };
  }
  return {
    purpose: "wallet-top-up",
    label: "Cüzdan yükleme",
    idempotencyKey: `wallet-top-up:${input.merchantOid}`,
  };
}
