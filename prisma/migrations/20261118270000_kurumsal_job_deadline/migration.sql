-- İlan son başvuru tarihi.
-- Sahte ilan INSERT edilmez.
-- Boş tarih, is_active true kaldığı sürece kapanış günü yok demektir.

ALTER TABLE "kurumsal_job_postings"
  ADD COLUMN "deadline_at" TIMESTAMP(3);

CREATE INDEX "kurumsal_job_postings_is_active_deadline_at_idx"
  ON "kurumsal_job_postings" ("is_active", "deadline_at");
