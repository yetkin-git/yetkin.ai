-- Deneme rezervasyonu ile tüketimin ayrılması (P0 tedavi, Faz 3).
--
-- Sorun: `commerce_trial_consumptions` satırı ödeme penceresi açılmadan önce yazılıyordu
-- ve hata yolunda silinmiyordu. Ödeme penceresini kapatan kullanıcı deneme hakkını yakıyordu.
--
-- Çözüm: satır iki aşamalıdır.
--   sealed_at NULL      → yalnız eşzamanlılık kilidi (TTL 1 saat; bayat kilit sahiplenilir).
--   sealed_at NOT NULL  → hak gerçekten tüketildi (CLEARED sonrası mühür); bir daha açılmaz.
--
-- Geriye dönük uyum: bu tedaviden önce yazılmış satırlar zaten tüketilmiş sayılır,
-- bu yüzden mevcut `consumed_at` değeriyle mühürlenir. Geçmiş deneme hakkı geri açılmaz.

ALTER TABLE "commerce_trial_consumptions"
  ADD COLUMN IF NOT EXISTS "sealed_at" TIMESTAMP(3);

UPDATE "commerce_trial_consumptions"
  SET "sealed_at" = "consumed_at"
  WHERE "sealed_at" IS NULL;

CREATE INDEX IF NOT EXISTS "commerce_trial_consumptions_sealed_idx"
  ON "commerce_trial_consumptions" ("sealed_at");
