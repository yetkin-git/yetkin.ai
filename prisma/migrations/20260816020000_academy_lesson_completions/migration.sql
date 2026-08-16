-- D2.1 Akademi müfredat ilerleme. Ders gövdesi kod tohumudur; CMS / video CDN yok.
-- SETTLED satın alma olmadan tamamlama satırı yazılmaz (motor + unique purchase_id).

CREATE TABLE "academy_lesson_completions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "purchase_id" TEXT NOT NULL,
    "lesson_key" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_lesson_completions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academy_lesson_completions_purchase_id_lesson_key_key"
  ON "academy_lesson_completions"("purchase_id", "lesson_key");

CREATE INDEX "academy_lesson_completions_user_id_course_id_idx"
  ON "academy_lesson_completions"("user_id", "course_id");

ALTER TABLE "academy_lesson_completions"
  ADD CONSTRAINT "academy_lesson_completions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "academy_lesson_completions"
  ADD CONSTRAINT "academy_lesson_completions_course_id_fkey"
  FOREIGN KEY ("course_id") REFERENCES "academy_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "academy_lesson_completions"
  ADD CONSTRAINT "academy_lesson_completions_purchase_id_fkey"
  FOREIGN KEY ("purchase_id") REFERENCES "academy_purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
