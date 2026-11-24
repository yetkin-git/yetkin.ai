-- YetkinCV kamuya açık yayın + kurumsal ilan paketi: ödeme niyeti sınıflaması.
--
-- Neden bu göç var: iki ürün de PayTR ile gerçekten tahsil ediliyordu ama
-- `PaymentOrderPurpose` enum'unda karşılıkları yoktu. Sonuç iki katmanlı bir para
-- hatasıydı:
--   1) `ledgerCreditLineForOrder` sınıflayamadığı niyeti "wallet-top-up" sayıp
--      CREDIT'i "Cüzdan yükleme" etiketiyle yazıyordu (ürün geliri ölçülemiyordu).
--   2) `isActivatedProductRefundBlocked` false döndüğü için müşteri **satın aldığı
--      yayını/paketi** self-servis nakit iadeye konu edebiliyordu (ürün bedava kalır).
--
-- Yeni değerler bu dosyada kullanılmaz (aynı transaction'da enum kullanımı yasak).
-- Yalnız tip genişletilir; veri göçü yoktur, geri dönüşü yoktur.

ALTER TYPE "PaymentOrderPurpose" ADD VALUE IF NOT EXISTS 'CAREER_PUBLICATION';
ALTER TYPE "PaymentOrderPurpose" ADD VALUE IF NOT EXISTS 'KURUMSAL_SCREENING';
