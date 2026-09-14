/**
 * Google Ads dönüşüm kancası — birinci taraf.
 * gtag / GTM yüklenmez (KVKK: reklam ve üçüncü taraf analitik çerezi yok).
 * `dataLayer` yalnız zaten varsa beslenir; boş env = dürüst no-op.
 */

export const SEM_CONVERSION_EVENT = "yetkin:conversion" as const;

export const SEM_CONVERSION_NAMES = {
  purchase: "purchase",
  register: "sign_up",
  form: "generate_lead",
} as const;

export type SemConversionName = keyof typeof SEM_CONVERSION_NAMES;

export type SemConversionDetail = Readonly<Record<string, string | number | boolean>>;

export function emitSemConversion(
  name: SemConversionName,
  detail: SemConversionDetail = {},
): void {
  if (typeof window === "undefined") {
    return;
  }
  const payload = { event: SEM_CONVERSION_NAMES[name], ...detail };
  window.dispatchEvent(new CustomEvent(SEM_CONVERSION_EVENT, { detail: payload }));
  const dataLayer = (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push(payload);
  }
}
