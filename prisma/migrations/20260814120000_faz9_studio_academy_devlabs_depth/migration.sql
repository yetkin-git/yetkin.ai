-- Faz 9 — Studio IMAGE_GEN + Akademi sınav kapısı + DevLabs tezgâh (S57–S59).
-- Canlı migrate ayrı ops adımıdır. KYC/çekim (S60) bu SQL'de yoktur.

-- CreateEnum
CREATE TYPE "StudioAssetType" AS ENUM ('IMAGE');

-- CreateEnum
CREATE TYPE "AcademyExamAttemptStatus" AS ENUM ('GRADED');

-- CreateTable
CREATE TABLE "studio_digital_assets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "generation_id" TEXT NOT NULL,
    "asset_type" "StudioAssetType" NOT NULL,
    "mime_type" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "prompt_hash" TEXT NOT NULL,
    "data_base64" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "studio_digital_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_exams" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pass_score" INTEGER NOT NULL DEFAULT 70,
    "questions_json" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_exam_attempts" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "purchase_id" TEXT NOT NULL,
    "answers_json" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "status" "AcademyExamAttemptStatus" NOT NULL DEFAULT 'GRADED',
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_exam_attempts_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "academy_certificates" ADD COLUMN "attempt_id" TEXT;
ALTER TABLE "academy_certificates" ADD COLUMN "certificate_hash" TEXT;
ALTER TABLE "academy_certificates" ADD COLUMN "score" INTEGER;

-- CreateTable
CREATE TABLE "devlabs_artifacts" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "api_key_id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "output_code" TEXT NOT NULL,
    "linter_ok" BOOLEAN NOT NULL,
    "linter_score" INTEGER NOT NULL,
    "linter_report_json" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "role_key" TEXT NOT NULL,
    "provider" TEXT,
    "model" TEXT,
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "completion_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "cost_minor" INTEGER NOT NULL DEFAULT 0,
    "debit_minor" INTEGER NOT NULL DEFAULT 0,
    "currency_code" CHAR(3) NOT NULL,
    "usage_id" TEXT,
    "ledger_debit_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devlabs_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "studio_digital_assets_generation_id_key" ON "studio_digital_assets"("generation_id");

-- CreateIndex
CREATE UNIQUE INDEX "studio_digital_assets_content_hash_key" ON "studio_digital_assets"("content_hash");

-- CreateIndex
CREATE INDEX "studio_digital_assets_user_id_created_at_idx" ON "studio_digital_assets"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "academy_exams_course_id_key" ON "academy_exams"("course_id");

-- CreateIndex
CREATE INDEX "academy_exam_attempts_user_id_exam_id_idx" ON "academy_exam_attempts"("user_id", "exam_id");

-- CreateIndex
CREATE INDEX "academy_exam_attempts_purchase_id_submitted_at_idx" ON "academy_exam_attempts"("purchase_id", "submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "academy_certificates_attempt_id_key" ON "academy_certificates"("attempt_id");

-- CreateIndex
CREATE UNIQUE INDEX "academy_certificates_certificate_hash_key" ON "academy_certificates"("certificate_hash");

-- CreateIndex
CREATE UNIQUE INDEX "devlabs_artifacts_content_hash_key" ON "devlabs_artifacts"("content_hash");

-- CreateIndex
CREATE UNIQUE INDEX "devlabs_artifacts_usage_id_key" ON "devlabs_artifacts"("usage_id");

-- CreateIndex
CREATE UNIQUE INDEX "devlabs_artifacts_ledger_debit_key_key" ON "devlabs_artifacts"("ledger_debit_key");

-- CreateIndex
CREATE INDEX "devlabs_artifacts_project_id_created_at_idx" ON "devlabs_artifacts"("project_id", "created_at");

-- CreateIndex
CREATE INDEX "devlabs_artifacts_user_id_created_at_idx" ON "devlabs_artifacts"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "devlabs_artifacts_api_key_id_idx" ON "devlabs_artifacts"("api_key_id");

-- AddForeignKey
ALTER TABLE "studio_digital_assets" ADD CONSTRAINT "studio_digital_assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_digital_assets" ADD CONSTRAINT "studio_digital_assets_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "studio_generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_exams" ADD CONSTRAINT "academy_exams_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "academy_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_exam_attempts" ADD CONSTRAINT "academy_exam_attempts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "academy_exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_exam_attempts" ADD CONSTRAINT "academy_exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_exam_attempts" ADD CONSTRAINT "academy_exam_attempts_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "academy_purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_certificates" ADD CONSTRAINT "academy_certificates_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "academy_exam_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devlabs_artifacts" ADD CONSTRAINT "devlabs_artifacts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "devlabs_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devlabs_artifacts" ADD CONSTRAINT "devlabs_artifacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devlabs_artifacts" ADD CONSTRAINT "devlabs_artifacts_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "devlabs_api_keys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
