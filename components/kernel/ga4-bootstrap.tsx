import Script from "next/script";
import { headers } from "next/headers";
import { readGaMeasurementId } from "@/lib/kernel/telemetry/measurement-id";

/**
 * GA4 etiketi. Next 16.2 paketinde `next/third-parties/google` dışa aktarımı yok;
 * aynı yükleyici `next/script` + `afterInteractive` (ilk boyamayı bekletmez).
 *
 * **Sessiz fallback (P0).** Kimlik boş, boşluklu veya `G-` biçiminde değilse
 * hiçbir düğüm basılmaz — `null` döner, uygulama patlamaz. Ölçüm kapalıyken
 * platform tam çalışır; yalnız huni olayları yazılmaz (`funnel.ts` no-op).
 *
 * Nonce, kenarın isteğe yazdığı `x-nonce` başlığıdır. Başlık okunamazsa (statik
 * ön üretim, beklenmedik bağlam) etiket yine basılır ama nonce'suz: CSP
 * `strict-dynamic` altında nonce'suz inline script engellenir, yani ölçüm
 * düşer — sayfa düşmez. Tercih bilinçli: analitik kaybı, 500'den ucuzdur.
 */
async function readRequestNonce(): Promise<string | undefined> {
  try {
    return (await headers()).get("x-nonce") ?? undefined;
  } catch {
    return undefined;
  }
}

export async function Ga4Bootstrap() {
  const gaId = readGaMeasurementId();
  if (!gaId) {
    return null;
  }
  const nonce = await readRequestNonce();
  const config = [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){window.dataLayer.push(arguments);}",
    "gtag('js',new Date());",
    `gtag('config',${JSON.stringify(gaId)});`,
  ].join("");

  return (
    <>
      <Script id="yetkin-ga4-config" strategy="afterInteractive" nonce={nonce}>
        {config}
      </Script>
      <Script
        id="yetkin-ga4-src"
        strategy="afterInteractive"
        nonce={nonce}
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
      />
    </>
  );
}
