-- Proof credential v2: iptal sicili. SHA-256 yüküne girmez; içerik özeti aynı kalır.
ALTER TABLE "academy_certificates"
  ADD COLUMN "revoked_at" TIMESTAMP(3),
  ADD COLUMN "revoke_reason" TEXT;
