/**
 * Pilot oynatıcının `play()` ret sınıfları.
 * Mühürlü derste tarayıcı konuşmasına düşülmez.
 * Jest engeli sonraki tıklamada yeniden denenir.
 * Kaynak yoksa veya desteklenmiyorsa ekran «Ses hazırlanıyor.» der.
 */

/** `MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED` */
export const JUNIOR_MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

/** `HTMLMediaElement.NETWORK_NO_SOURCE` */
export const JUNIOR_NETWORK_NO_SOURCE = 3;

export type JuniorPilotMediaSnapshot = {
  errorCode: number | null;
  networkState: number;
};

export type JuniorPilotPlayRejection = "gesture" | "preparing";

export function juniorPilotMediaRejected(media: JuniorPilotMediaSnapshot): boolean {
  return (
    media.errorCode === JUNIOR_MEDIA_ERR_SRC_NOT_SUPPORTED ||
    media.networkState === JUNIOR_NETWORK_NO_SOURCE
  );
}

/**
 * `gesture`: autoplay / jest kilidi. Düğme `▶ Oynat` kalır, sonraki tıklama yeniden dener.
 * `preparing`: kaynak yok, desteklenmiyor veya başka bir ret. Sessiz yutulmaz.
 */
export function juniorPilotPlayRejection(
  error: unknown,
  media: JuniorPilotMediaSnapshot,
): JuniorPilotPlayRejection {
  const name = error instanceof DOMException ? error.name : "";
  if (juniorPilotMediaRejected(media) || name === "NotSupportedError") {
    return "preparing";
  }
  if (name === "NotAllowedError" || name === "AbortError") {
    return "gesture";
  }
  return "preparing";
}
