/** Çerez tercihi. Analitik GA4 yalnız `analytics` iken yüklenir. */

export const COOKIE_CONSENT_STORAGE_KEY = "yetkin-cookie-consent";
export const COOKIE_CONSENT_COOKIE = "yetkin_cookie_consent";
export const COOKIE_CONSENT_EVENT = "yetkin:cookie-consent";
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export type CookieConsentChoice = "analytics" | "necessary";

export function parseCookieConsent(value: string | null | undefined): CookieConsentChoice | null {
  if (value === "analytics" || value === "necessary") {
    return value;
  }
  return null;
}

export function readStoredCookieConsent(): CookieConsentChoice | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function persistCookieConsent(choice: CookieConsentChoice): void {
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_CONSENT_COOKIE}=${choice}; Path=/; Max-Age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}
