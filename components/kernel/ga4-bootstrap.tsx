import Script from "next/script";
import { headers } from "next/headers";
import { readGaMeasurementId } from "@/lib/kernel/telemetry/measurement-id";

/**
 * GA4 etiketi. Next 16.2 paketinde `next/third-parties/google` dışa aktarımı yok;
 * aynı yükleyici `next/script` + `afterInteractive` (ilk boyamayı bekletmez).
 * Kimlik boşsa veya G- biçiminde değilse düğüm yok.
 * Nonce, kenarın isteğe yazdığı `x-nonce` başlığıdır.
 */
export async function Ga4Bootstrap() {
  const gaId = readGaMeasurementId();
  if (!gaId) {
    return null;
  }
  const nonce = (await headers()).get("x-nonce") ?? undefined;
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
