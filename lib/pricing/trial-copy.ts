/**
 * E-Ticaret 30 gün denemesi — tek doğruluk kaynağı (B-05).
 *
 * Aynı teklif dört yüzeyde dört farklı tonda yazılıyordu: vitrin kartı, lisans
 * ekranı, fiyat sayfası ve rehber. Dürüstlük iddiası olan bir üründe tutarsız
 * cümle, "hangisi doğru" tereddüdü üretir — özellikle 1.490 TL/ay otomatik
 * yenileme varken bu tereddüt pahalıdır.
 *
 * Kural:
 * - Tutar burada **uydurulmaz**. Doğrulama bedeli `COMMERCE_TRIAL_VERIFY_MINOR`
 *   sabitinden, yenileme tutarı canlı katalog satırından gelir.
 * - Dil sözleşmesi **sen** aksıdır (`verify:sen-axis` bu dosyayı da tarar).
 * - "1 TL" yalnız buradaki `verifyLabel` üzerinden basılır; elle yazılmaz.
 */

import { COMMERCE_TRIAL_VERIFY_MINOR } from "@/lib/commerce/subscription-lifecycle";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinor, formatMinorCompact } from "@/lib/kernel/money/format";

/** Deneme süresi. Tek yerde: 30 gün. */
export const TRIAL_PERIOD_DAYS = 30;

/** Bugün çekilen sembolik kart doğrulama bedeli (1,00 TL). Katalog fiyatı değildir. */
export const TRIAL_VERIFY_AMOUNT_LABEL = formatMinor(COMMERCE_TRIAL_VERIFY_MINOR, "TRY");

/** @deprecated Yeni kod `TRIAL_VERIFY_AMOUNT_LABEL` okur. Geriye dönük ad. */
export const TRIAL_VERIFY_LABEL = TRIAL_VERIFY_AMOUNT_LABEL;

/** Vitrin rozeti — kart üstü tek satır. */
export const TRIAL_BADGE = `İlk ${TRIAL_PERIOD_DAYS} Gün Ücretsiz` as const;

/** Kart başlığı. */
export const TRIAL_TITLE = `${TRIAL_PERIOD_DAYS} gün ücretsiz deneme` as const;

/**
 * Tek cümlelik vaat. Bugün ne çekilir, dönem içinde ne çekilmez.
 * "sen" aksı: "sen" / "dene" / "iptal et".
 */
export const TRIAL_HEADLINE =
  `İlk ${TRIAL_PERIOD_DAYS} gün ücretsiz (${TRIAL_VERIFY_LABEL} sembolik kart doğrulama)` as const;

/** Bugün çekilen tutarın açıklaması. */
export const TRIAL_VERIFY_LINE =
  `Bugün yalnız ${TRIAL_VERIFY_LABEL} kart doğrulama bedeli tahsil edilir; ${TRIAL_PERIOD_DAYS} gün boyunca aylık ücret alınmaz.` as const;

/** Rehber adımının "girdi" satırı — aynı vaat, form doldurma dilinde. */
export const TRIAL_INPUT_LINE =
  `Kart doğrulaması için sadece ${TRIAL_VERIFY_LABEL} çekilir; ${TRIAL_PERIOD_DAYS} gün boyunca başka hiçbir ücret alınmaz.` as const;

/** Lisans ekranındaki kısa etiket. */
export const TRIAL_VERIFY_FIELD_LABEL = "Bugün çekilecek tutar (kart doğrulama)" as const;

/** Yenileme alanı etiketi. */
export const TRIAL_RENEWAL_FIELD_LABEL = `${TRIAL_PERIOD_DAYS} gün sonra aylık yenileme` as const;

/**
 * Yenileme cümlesi. Tutar katalog satırından okunur; satır yoksa `null` döner ve
 * hiçbir yüzey yenileme tutarı basmaz.
 */
export function trialRenewalLine(catalogAmountMinor: number | null | undefined): string | null {
  if (catalogAmountMinor == null || !Number.isInteger(catalogAmountMinor) || catalogAmountMinor <= 0) {
    return null;
  }
  const amount = formatMinorCompact(catalogAmountMinor, SETTLEMENT_CURRENCY);
  return `${TRIAL_PERIOD_DAYS} gün sonra ${amount} / Ay otomatik yenilenir`;
}

/** İptal cümlesi. Tek tıkla, dönem sonunda; erken iptal cezası yok. */
export const TRIAL_CANCEL_LINE =
  "Dönem sonu iptali tek tıkla mağaza panelinden yapılır; erken iptal cezası yok." as const;

/**
 * Dürüstlük cümlesi. Doğrulama bedelinin bakiye olmadığını, iade taahhüdü
 * olmadığını ve denemenin kimlik başına bir kez açıldığını söyler.
 * (Rehber adımının `tip` satırı bu cümleyi taşır.)
 */
export const TRIAL_HONESTY_LINE =
  `Deneme vergi kimliğiyle (VKN veya TCKN) açılır — her kimlikte bir deneme hakkı vardır. ${TRIAL_VERIFY_LABEL} kart doğrulama bedelidir; bakiyene yazılmaz ve iade taahhüdü değildir. İptal dönem sonunda işler.` as const;

/**
 * Fiyat sayfasının "Dürüstlük notu" paragrafı. Aynı vaadi bir bütün paragraf
 * olarak anlatır; VKN/TCKN hane sayısı gibi ayrıntı rehber adımında kalır.
 */
export const TRIAL_HONESTY_NOTE =
  `E-Ticaret lisansında ilk ${TRIAL_PERIOD_DAYS} gün ücretsizdir; bu dönemde yalnız ${TRIAL_VERIFY_LABEL} sembolik kart doğrulama bedeli tahsil edilir ve bu bedel bakiyene yazılmaz, iade taahhüdü değildir. Deneme vergi kimliği (VKN veya TCKN) başına bir kez açılır. Deneme bitince aylık yenileme katalogdaki tutardan başlar; dönem sonu iptali tek tıkla mağaza panelindedir.` as const;

/** CTA metni. */
export const TRIAL_CTA = `${TRIAL_PERIOD_DAYS} Gün Ücretsiz Başlat (${TRIAL_VERIFY_LABEL.replace(",00", "")} Doğrulama)` as const;

/** Tüm yüzeylerin okuyacağı paket. */
export const TRIAL_COPY = {
  periodDays: TRIAL_PERIOD_DAYS,
  badge: TRIAL_BADGE,
  title: TRIAL_TITLE,
  headline: TRIAL_HEADLINE,
  verifyLabel: TRIAL_VERIFY_LINE,
  verifyFieldLabel: TRIAL_VERIFY_FIELD_LABEL,
  renewalFieldLabel: TRIAL_RENEWAL_FIELD_LABEL,
  cancelLine: TRIAL_CANCEL_LINE,
  honestyLine: TRIAL_HONESTY_LINE,
  cta: TRIAL_CTA,
} as const;
