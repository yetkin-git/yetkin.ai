-- Faz 7 — Junior TR yaş kapısı + YetkinX mühürlü kanıt feed (S1-A, S2-A, S44-C).
-- Canlı migrate ayrı ops adımıdır (S48-A); bu SQL mühürdür.
-- Banka çekimi / GİB / sepet / hibe ücreti bu fazda açılmaz (S43-A, S45-A, S46-A, S47-A).

-- CreateEnum
CREATE TYPE "JuniorProfileStatus" AS ENUM ('PENDING_GUARDIAN', 'GUARDIAN_LINKED');

-- CreateEnum
CREATE TYPE "ProofFeedSourceKind" AS ENUM ('CERTIFICATE', 'ESCROW_RELEASE', 'AWARD', 'STUDIO');

-- CreateEnum
CREATE TYPE "ProofFeedVisibility" AS ENUM ('SQUARE', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ProofFeedInteractionKind" AS ENUM ('ACKNOWLEDGE', 'SHARE');

-- CreateTable
CREATE TABLE "junior_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date_of_birth" TEXT NOT NULL,
    "guardian_user_id" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL DEFAULT 'TR',
    "status" "JuniorProfileStatus" NOT NULL DEFAULT 'PENDING_GUARDIAN',
    "guardian_consent_at" TIMESTAMP(3),
    "meb_track_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "junior_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "junior_allowances" (
    "id" TEXT NOT NULL,
    "junior_profile_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "guardian_user_id" TEXT NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "amount_minor" INTEGER NOT NULL DEFAULT 0,
    "weekly_cap_minor" INTEGER NOT NULL,
    "granted_this_period_minor" INTEGER NOT NULL DEFAULT 0,
    "period_started_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "junior_allowances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proof_feed_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_kind" "ProofFeedSourceKind" NOT NULL,
    "source_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sealed_at" TIMESTAMP(3) NOT NULL,
    "passport_visa_key" TEXT,
    "media_url" TEXT,
    "visibility" "ProofFeedVisibility" NOT NULL DEFAULT 'SQUARE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proof_feed_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proof_feed_interactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "kind" "ProofFeedInteractionKind" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proof_feed_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "junior_profiles_user_id_key" ON "junior_profiles"("user_id");

-- CreateIndex
CREATE INDEX "junior_profiles_guardian_user_id_status_idx" ON "junior_profiles"("guardian_user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "junior_allowances_junior_profile_id_key" ON "junior_allowances"("junior_profile_id");

-- CreateIndex
CREATE INDEX "junior_allowances_user_id_idx" ON "junior_allowances"("user_id");

-- CreateIndex
CREATE INDEX "junior_allowances_guardian_user_id_idx" ON "junior_allowances"("guardian_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "proof_feed_items_source_kind_source_id_key" ON "proof_feed_items"("source_kind", "source_id");

-- CreateIndex
CREATE INDEX "proof_feed_items_visibility_sealed_at_idx" ON "proof_feed_items"("visibility", "sealed_at");

-- CreateIndex
CREATE INDEX "proof_feed_items_user_id_sealed_at_idx" ON "proof_feed_items"("user_id", "sealed_at");

-- CreateIndex
CREATE UNIQUE INDEX "proof_feed_interactions_user_id_item_id_kind_key" ON "proof_feed_interactions"("user_id", "item_id", "kind");

-- CreateIndex
CREATE INDEX "proof_feed_interactions_item_id_idx" ON "proof_feed_interactions"("item_id");

-- AddForeignKey
ALTER TABLE "junior_profiles" ADD CONSTRAINT "junior_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_profiles" ADD CONSTRAINT "junior_profiles_guardian_user_id_fkey" FOREIGN KEY ("guardian_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_allowances" ADD CONSTRAINT "junior_allowances_junior_profile_id_fkey" FOREIGN KEY ("junior_profile_id") REFERENCES "junior_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_allowances" ADD CONSTRAINT "junior_allowances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_allowances" ADD CONSTRAINT "junior_allowances_guardian_user_id_fkey" FOREIGN KEY ("guardian_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proof_feed_items" ADD CONSTRAINT "proof_feed_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proof_feed_interactions" ADD CONSTRAINT "proof_feed_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proof_feed_interactions" ADD CONSTRAINT "proof_feed_interactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "proof_feed_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
