-- Akademi + Junior lisans: ödeme niyeti sınıflaması.
--
-- Neden bu göç var: iki ürün de PayTR ile gerçekten tahsil ediliyordu ama
-- `PaymentOrderPurpose` enum'unda karşılıkları yoktu. Sonuç iki katmanlı bir para
-- hatasıydı:
--   1) `ledgerCreditLineForOrder` sınıflayamadığı niyeti "wallet-top-up" sayıp
--      CREDIT'i "Cüzdan yükleme" etiketiyle yazıyordu (ürün geliri ölçülemiyordu).
--   2) `isActivatedProductRefundBlocked` false döndüğü için müşteri **satın aldığı
--      lisansı** self-servis nakit iadeye konu edebiliyordu (lisans açık kalır).
--
-- Yeni değerler bu dosyada kullanılmaz (aynı transaction'da enum kullanımı yasak).
-- Yalnız tip genişletilir; veri göçü yoktur, geri dönüşü yoktur.

ALTER TYPE "PaymentOrderPurpose" ADD VALUE IF NOT EXISTS 'ACADEMY_LICENSE';
ALTER TYPE "PaymentOrderPurpose" ADD VALUE IF NOT EXISTS 'JUNIOR_LICENSE';
