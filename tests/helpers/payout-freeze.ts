/**
 * Usta hakedişi Rail cüzdanına yazılmaz. Eski iç-kilit hatası kaldırıldı;
 * serbest bırakma Pazaryeri split intent kaydeder.
 */
export function isInternalArtisanPayoutFreezeError(_error: unknown): boolean {
  return false;
}
