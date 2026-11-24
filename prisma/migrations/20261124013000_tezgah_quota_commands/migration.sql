-- Y1 — Tezgâh kota Idempotency defteri (kalıcı).
--
-- Öncesi: `lib/tezgah/quota.ts` içindeki `prismaStore.tryConsume` komut anahtarını
-- süreç içi `memoryCommands` Map'inde tutuyordu. İkinci istek başka bir örneğe
-- (serverless instance, çok pod, yeniden başlatma) düştüğünde anahtar görünmüyor
-- ve sayaç **ikinci kez** düşüyordu. Ücretsiz ve Pro hatlarında çift düşüm açıktı.
--
-- Bu tablo kilidi veritabanına taşır. Anahtar: periyot + aktör + havuz + komut.
-- Periyot anahtarın parçasıdır; ay dönümünde eski komut yeni ayı kilitlemez.
--
-- Para, cüzdan, defter YOKTUR. PostgREST okuması kapalıdır (deny-all).
-- Yazma politikası üretilmez; Prisma BYPASSRLS yazar.

CREATE TABLE IF NOT EXISTS "tezgah_quota_commands" (
    "date_key" VARCHAR(16) NOT NULL,
    "subject_key" VARCHAR(180) NOT NULL,
    "pool_key" VARCHAR(32) NOT NULL,
    "command_key" VARCHAR(80) NOT NULL,
    "request_hash" VARCHAR(64) NOT NULL,
    "used_after" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tezgah_quota_commands_pkey"
      PRIMARY KEY ("date_key", "subject_key", "pool_key", "command_key")
);

CREATE INDEX IF NOT EXISTS "tezgah_quota_commands_created_at_idx"
  ON "tezgah_quota_commands" ("created_at");

ALTER TABLE "tezgah_quota_commands" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tezgah_quota_commands" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_deny_unscoped" ON "tezgah_quota_commands";
CREATE POLICY "rls_deny_unscoped" ON "tezgah_quota_commands"
  FOR SELECT TO anon, authenticated
  USING (false);
