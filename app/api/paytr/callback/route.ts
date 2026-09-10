/**
 * PayTR Mağaza Paneli Bildirim URL alias'ı (`application/x-www-form-urlencoded`).
 * CREDIT yalnız kanonik handler'dadır; bu dosya ikinci ağız değildir.
 *
 * Panel test/ping: `merchant_oid` / `status` / `total_amount` / `hash` eksik veya
 * HMAC geçersiz olsa bile log + düz metin HTTP 200 `"OK"` (HTTP 400 yok).
 * Kenar (`proxy.ts`) JWT / Origin / CSRF / IP / rate-limit basmaz.
 */
export const auth = "webhook" as const;

export { GET, HEAD, POST } from "@/app/api/(kernel)/payments/webhooks/paytr/route";
