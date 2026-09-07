/**
 * PayTR Mağaza Paneli Bildirim URL alias'ı.
 * CREDIT yalnız kanonik handler'dadır; bu dosya ikinci ağız değildir.
 */
export const auth = "webhook" as const;

export { GET, POST } from "@/app/api/(kernel)/payments/webhooks/paytr/route";
