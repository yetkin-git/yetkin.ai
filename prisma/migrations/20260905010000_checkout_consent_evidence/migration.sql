-- Kasa rızası delili — PaymentOrder (cüzdan yükleme) ve AcademyPurchase (dijital ifa).
-- Eski satırlar NULL kalır; yeni ticari yazımlar uygulama katmanında üç kolonu doldurur.
-- Super Admin bağışı academy_purchases üzerinde rıza yazmaz.

ALTER TABLE "payment_orders"
  ADD COLUMN "consent_version" TEXT,
  ADD COLUMN "distance_contract_accepted" BOOLEAN,
  ADD COLUMN "digital_immediate_performance_accepted" BOOLEAN;

ALTER TABLE "academy_purchases"
  ADD COLUMN "consent_version" TEXT,
  ADD COLUMN "distance_contract_accepted" BOOLEAN,
  ADD COLUMN "digital_immediate_performance_accepted" BOOLEAN;
