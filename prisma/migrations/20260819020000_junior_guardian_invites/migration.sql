-- Junior vekâlet: rastgele guardian_user_id iddiası durur.
-- PENDING bağlar doğrulanmamış sayılır; guardian_user_id boşaltılır.
-- Davet: tek kullanımlık TTL token, yalnız HMAC hash saklanır.

UPDATE "junior_profiles"
SET "guardian_user_id" = NULL
WHERE "status" = 'PENDING_GUARDIAN'
  AND "guardian_consent_at" IS NULL;

ALTER TABLE "junior_profiles" ALTER COLUMN "guardian_user_id" DROP NOT NULL;

-- CreateEnum
CREATE TYPE "GuardianInviteInitiator" AS ENUM ('CHILD', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "GuardianInviteStatus" AS ENUM ('PENDING', 'CONSUMED', 'REVOKED');

-- CreateTable
CREATE TABLE "junior_guardian_invites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "token_prefix" TEXT NOT NULL,
    "initiator_role" "GuardianInviteInitiator" NOT NULL,
    "junior_profile_id" TEXT,
    "counterpart_user_id" TEXT,
    "status" "GuardianInviteStatus" NOT NULL DEFAULT 'PENDING',
    "child_approved_at" TIMESTAMP(3),
    "guardian_approved_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "junior_guardian_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "junior_guardian_invites_token_hash_key" ON "junior_guardian_invites"("token_hash");

CREATE INDEX "junior_guardian_invites_user_id_status_idx" ON "junior_guardian_invites"("user_id", "status");

CREATE INDEX "junior_guardian_invites_expires_at_status_idx" ON "junior_guardian_invites"("expires_at", "status");

ALTER TABLE "junior_guardian_invites" ADD CONSTRAINT "junior_guardian_invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "junior_guardian_invites" ADD CONSTRAINT "junior_guardian_invites_counterpart_user_id_fkey" FOREIGN KEY ("counterpart_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "junior_guardian_invites" ADD CONSTRAINT "junior_guardian_invites_junior_profile_id_fkey" FOREIGN KEY ("junior_profile_id") REFERENCES "junior_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
