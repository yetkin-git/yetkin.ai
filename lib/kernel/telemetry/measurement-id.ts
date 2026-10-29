/**
 * GA4 ölçüm kimliği. Boş, bozuk veya GTM kabı etiketi yüklemez.
 * `process.env.NEXT_PUBLIC_GA_ID` çağrı anında okunur; Next istemciye gömer.
 *
 * Sessiz fallback: herhangi bir sorun `null` döner. Çağıranlar (`Ga4Bootstrap`,
 * `funnel.ts`, kenar CSP) `null` görünce hiçbir şey basmaz; uygulama çalışmaya
 * devam eder. İçeride boşluk taşıyan kimlik (kopyala-yapıştır artığı) de reddedilir.
 */

const GA_MEASUREMENT_ID = /^G-[A-Za-z0-9]{4,32}$/;

export function readGaMeasurementId(raw?: string | null): string | null {
  const source = (raw == null ? process.env.NEXT_PUBLIC_GA_ID : raw) ?? "";
  const id = source.trim();
  if (!GA_MEASUREMENT_ID.test(id)) {
    return null;
  }
  return id;
}
