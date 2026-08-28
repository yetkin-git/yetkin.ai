-- İş kanıtı SHA-256 sicili ders tamamlama satırına iner.
-- Süreç Map'i kapı değildir; süreç ölünce sınav kapanmaz.
ALTER TABLE "academy_lesson_completions"
  ADD COLUMN "proof_of_work_hash" CHAR(64);
