/**
 * PayTR Mağaza Paneli Bildirim URL alias'ı (`application/x-www-form-urlencoded`).
 * CREDIT yalnız kanonik handler'dadır; bu dosya ikinci ağız değildir.
 *
 * Boş gövde yoklaması düz metin HTTP 200 `"OK"` döner. İçinde ödeme alanı olan
 * ve HMAC'i tutmayan bildirim kanonik yolla aynı kapıdadır: imza hatası 403.
 * PayTR başarısız bildirimi yeniden deneyebilir. Kenar JWT / Origin / CSRF basmaz.
 */
export const auth = "webhook" as const;

export { GET, HEAD, POST } from "@/app/api/(kernel)/payments/webhooks/paytr/route";
