-- Konu testi sonucu junior_progress.mode = 'quiz' olarak yazılır.
-- Eski kural yalnız speak / write / practice kabul ediyordu; quiz satırı CHECK'e takılıyordu.

ALTER TABLE "junior_progress" DROP CONSTRAINT "junior_progress_shape";

ALTER TABLE "junior_progress"
  ADD CONSTRAINT "junior_progress_shape"
  CHECK (
    "mode" IN ('speak', 'write', 'practice', 'quiz')
    AND "score" BETWEEN 0 AND 100
    AND "xp_awarded" BETWEEN 0 AND 100
    AND char_length("lesson_key") BETWEEN 1 AND 80
  );
