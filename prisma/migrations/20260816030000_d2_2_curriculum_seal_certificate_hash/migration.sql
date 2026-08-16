-- D2.2: SHA256 sertifika payload'ına müfredat mühürü; Kariyer Vizesi certificateHash bağı.
-- Canlı apply Direct :5432 ister (docs/07_OPS_RUNBOOK.md §2.1). Havuz :6543 yasak.

ALTER TABLE "academy_certificates" ADD COLUMN "curriculum_seal" TEXT;

ALTER TABLE "career_visa_stamps" ADD COLUMN "certificate_hash" TEXT;
