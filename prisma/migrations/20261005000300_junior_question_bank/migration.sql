-- Yerel soru arşivi. Konu testi canlı üreticiden okunmaz.
-- Çocuk satırı değildir. user_id yoktur. Cüzdan ve oyun puanı bağlanmaz.
-- FORCE RLS event trigger CREATE TABLE sonrası ENABLE+FORCE basar.
-- PostgREST yazma politikası yok. Satır, bellek arşivindeki kalıpla aynı şekildedir.

CREATE TABLE "junior_question_bank" (
    "id" TEXT NOT NULL,
    "lesson_key" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "outcome_code" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "choices_json" TEXT NOT NULL,
    "correct_index" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "pattern_year" INTEGER NOT NULL,
    "pool_slot" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "junior_question_bank_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "junior_question_bank_lesson_key_item_id_key"
  ON "junior_question_bank"("lesson_key", "item_id");

CREATE INDEX "junior_question_bank_lesson_key_active_tag_idx"
  ON "junior_question_bank"("lesson_key", "active", "tag");

CREATE INDEX "junior_question_bank_outcome_code_idx"
  ON "junior_question_bank"("outcome_code");

ALTER TABLE "junior_question_bank"
  ADD CONSTRAINT "junior_question_bank_shape"
  CHECK (
    char_length("lesson_key") BETWEEN 1 AND 80
    AND char_length("item_id") BETWEEN 1 AND 40
    AND char_length("outcome_code") BETWEEN 1 AND 40
    AND char_length("prompt") BETWEEN 1 AND 400
    AND char_length("explanation") BETWEEN 1 AND 400
    AND "correct_index" BETWEEN 0 AND 2
    AND "pool_slot" BETWEEN 0 AND 99999
    AND jsonb_typeof("choices_json"::jsonb) = 'array'
    AND jsonb_array_length("choices_json"::jsonb) = 3
    AND (
      (
        "tag" = 'Son Dönem MEB/LGS Trendi'
        AND "weight" = 70
        AND "pattern_year" BETWEEN 2024 AND 2026
      )
      OR
      (
        "tag" = 'Çıkmış Soru Paraleli'
        AND "weight" = 30
        AND "pattern_year" BETWEEN 2018 AND 2023
      )
    )
  );
