-- Faz 2 kariyer ekosistemi: HMAC mühür, işveren doğrulama, hibe kanıtı, görüşme daveti, eleme bandı.
-- Yeni tablo yok. Kolon + enum genişletmesi. FORCE RLS mevcut tablolarda kalır.

-- Y4: YetkinCV HMAC imzası (eski satırlar NULL — geriye dönük uyumlu).
ALTER TABLE "yetkin_cv_seals"
  ADD COLUMN IF NOT EXISTS "hmac_signature" VARCHAR(64);

COMMENT ON COLUMN "yetkin_cv_seals"."hmac_signature" IS
  'HMAC-SHA256(secret, canonicalPayload). Null = Faz 2 öncesi imzasız mühür.';

-- Y1: İşveren vergi/mersis + doğrulama zamanı.
ALTER TABLE "kurumsal_job_postings"
  ADD COLUMN IF NOT EXISTS "tax_number" VARCHAR(20) NOT NULL DEFAULT '';

ALTER TABLE "kurumsal_job_postings"
  ADD COLUMN IF NOT EXISTS "verified_employer_at" TIMESTAMP(3);

COMMENT ON COLUMN "kurumsal_job_postings"."tax_number" IS
  'Vergi veya MERSİS numarası. Doğrulama verified_employer_at ile mühürlenir.';
COMMENT ON COLUMN "kurumsal_job_postings"."verified_employer_at" IS
  'Kurumsal kimlik doğrulandığında dolar. Null = doğrulanmamış; kamu noindex.';

-- O9: Barajı geçti, kontenjan doldu — yedek liste bandı.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'KurumsalJobApplicationStatus'
      AND e.enumlabel = 'QUALIFIED_NOT_SHORTLISTED'
  ) THEN
    ALTER TYPE "KurumsalJobApplicationStatus" ADD VALUE 'QUALIFIED_NOT_SHORTLISTED';
  END IF;
END $$;

-- Y6: YetkinHibe proje kanıt damgası.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'CareerVisaSourceKind'
      AND e.enumlabel = 'YETKINHIBE_PROJECT'
  ) THEN
    ALTER TYPE "CareerVisaSourceKind" ADD VALUE 'YETKINHIBE_PROJECT';
  END IF;
END $$;

-- Y9: Görüşme daveti durumu (iletişim talebi üzerinde).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CareerContactRequestStatus') THEN
    CREATE TYPE "CareerContactRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
  END IF;
END $$;

ALTER TABLE "career_contact_requests"
  ADD COLUMN IF NOT EXISTS "status" "CareerContactRequestStatus" NOT NULL DEFAULT 'PENDING';

ALTER TABLE "career_contact_requests"
  ADD COLUMN IF NOT EXISTS "responded_at" TIMESTAMP(3);

COMMENT ON COLUMN "career_contact_requests"."status" IS
  'Görüşme daveti: PENDING / ACCEPTED / DECLINED. Aday e-postası HTML e basılmaz.';

-- Mevcut tablolar zaten FORCE RLS sicilinde; kolon ekleri politikayı bozmaz.
-- career_contact_requests / yetkin_cv_seals / kurumsal_job_postings ENABLE+FORCE zaten açıktır.
