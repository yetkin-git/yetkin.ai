-- Akademi sınav oturumu mühürü (Sitting Seal).
-- HMAC jetonunun sunucu sicili; JTI tek sefer tüketilir (çok örnek).
-- FORCE RLS event trigger CREATE TABLE sonrası ENABLE+FORCE basar.
-- PostgREST yazma politikası yok; Prisma BYPASSRLS yazar.

CREATE TABLE "academy_exam_sittings" (
    "jti" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "items_json" TEXT NOT NULL,
    "proof_lesson_key" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_exam_sittings_pkey" PRIMARY KEY ("jti")
);

CREATE INDEX "academy_exam_sittings_user_id_exam_id_idx"
  ON "academy_exam_sittings"("user_id", "exam_id");

CREATE INDEX "academy_exam_sittings_expires_at_idx"
  ON "academy_exam_sittings"("expires_at");

ALTER TABLE "academy_exam_sittings"
  ADD CONSTRAINT "academy_exam_sittings_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "academy_exam_sittings"
  ADD CONSTRAINT "academy_exam_sittings_course_id_fkey"
  FOREIGN KEY ("course_id") REFERENCES "academy_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "academy_exam_sittings"
  ADD CONSTRAINT "academy_exam_sittings_exam_id_fkey"
  FOREIGN KEY ("exam_id") REFERENCES "academy_exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
