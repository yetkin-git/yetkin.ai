/**
 * PayTR Pazaryeri Split ürün yüzeyi — client-safe SSOT.
 * `paytrMarketplaceSplitPort.beginHold` dürüst `not_configured` dönerken false.
 * Kokpit NBA ve kopya bu bayrağı okur; merchant (Akademi) tahsilatından bağımsızdır.
 */
export const MARKETPLACE_SPLIT_LIVE = false as const;
