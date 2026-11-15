/**
 * Proje dosyası mühür cümleleri. Tutar ve oran taşımaz.
 * Tezgâh kapağı ve uygunluk matrisi aynı dizgileri basar.
 */

export const GRANT_PROJECT_DISCLAIMER =
  "Bu dosya resmî başvuru veya uygunluk kararı değildir.";

export const GRANT_EMPTY_ELIGIBLE_LINE =
  "Açık ve doğrulanmış çağrı yok. Uygun liste boş.";

export const GRANT_CLOSED_WINDOW_NOTE = "katalog kaydı, başvuru penceresi kapalı";

export const GRANT_UPCOMING_WINDOW_NOTE =
  "katalog kaydı, başvuru penceresi henüz açılmadı";

export const GRANT_UNVERIFIED_NOTE = "katalog kaydı, resmî kaynak doğrulanmadı";

/** Tam dosya mühürü. Onay, çağrı kodu ve destek tavanı taşımaz. */
export const GRANT_DOSSIER_DISCLAIMER =
  "Tam dosya taslaktır. Seçilen programın onayı, çağrı kodu veya destek tavanı bu metinde üretilmez. Bütçe başvuru sahibinin tahminidir.";

export const GRANT_DOSSIER_SCHEDULE_NOTE =
  "Ay aralıkları seçilen proje süresine bölünmüş taslaktır. Kurum takvimi değildir.";

export const GRANT_DOSSIER_BUDGET_NOTE =
  "Tutarlar başvuru sahibinin girdiği tahmindir. Katalog tavanı veya hibe limiti değildir.";

export const GRANT_DOSSIER_WIZARD_NOTE =
  "Onay garantisi yoktur. Çağrı kodu ve destek tavanı üretilmez. Tutarlar sizin tahmininizdir.";

export const GRANT_DOSSIER_NO_ELIGIBLE =
  "Açık ve doğrulanmış çağrı yok. Kuruma özel dosya üretilemedi.";

export const GRANT_DOSSIER_PROGRAM_MISSING = "Seçilen program uygun listede yok.";

const WITHHELD_NOTES = [
  GRANT_CLOSED_WINDOW_NOTE,
  GRANT_UPCOMING_WINDOW_NOTE,
  GRANT_UNVERIFIED_NOTE,
] as const;

export function isGrantWithheldNote(value: string): boolean {
  return (WITHHELD_NOTES as readonly string[]).includes(value);
}
