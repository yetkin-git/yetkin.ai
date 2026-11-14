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

const WITHHELD_NOTES = [
  GRANT_CLOSED_WINDOW_NOTE,
  GRANT_UPCOMING_WINDOW_NOTE,
  GRANT_UNVERIFIED_NOTE,
] as const;

export function isGrantWithheldNote(value: string): boolean {
  return (WITHHELD_NOTES as readonly string[]).includes(value);
}
