-- Doğrudan iş teklifi (DIRECT) — genel tahtada görünmez; yalnız davetli ustanın tezgâhına düşer.
CREATE TYPE "FreelancerJobVisibility" AS ENUM ('PUBLIC', 'DIRECT');

ALTER TABLE "freelancer_jobs"
  ADD COLUMN "visibility" "FreelancerJobVisibility" NOT NULL DEFAULT 'PUBLIC',
  ADD COLUMN "invitee_id" TEXT,
  ADD COLUMN "due_days" INTEGER;

CREATE INDEX "freelancer_jobs_visibility_status_created_at_idx"
  ON "freelancer_jobs"("visibility", "status", "created_at");

CREATE INDEX "freelancer_jobs_invitee_id_status_idx"
  ON "freelancer_jobs"("invitee_id", "status");

ALTER TABLE "freelancer_jobs"
  ADD CONSTRAINT "freelancer_jobs_invitee_id_fkey"
  FOREIGN KEY ("invitee_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
