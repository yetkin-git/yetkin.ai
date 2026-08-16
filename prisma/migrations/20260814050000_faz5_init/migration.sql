-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AcademyPurchaseStatus" AS ENUM ('SETTLED');

-- CreateEnum
CREATE TYPE "ArenaTenderStatus" AS ENUM ('OPEN', 'EVALUATING', 'AWARDED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ArenaTenderRound" AS ENUM ('SUBMISSION', 'EVALUATION', 'CLOSED');

-- CreateEnum
CREATE TYPE "ArenaSubmissionStatus" AS ENUM ('SUBMITTED', 'REJECTED', 'AWARDED');

-- CreateEnum
CREATE TYPE "CareerVisaSourceKind" AS ENUM ('ACADEMY_CERTIFICATE', 'FREELANCER_RELEASE');

-- CreateEnum
CREATE TYPE "DevLabsProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DevLabsSandboxKind" AS ENUM ('NARROW');

-- CreateEnum
CREATE TYPE "FreelancerJobStatus" AS ENUM ('OPEN', 'AWARDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FreelancerBidStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FreelancerContractStatus" AS ENUM ('FUNDED', 'RELEASED', 'REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "EscrowHoldStatus" AS ENUM ('PENDING', 'RELEASED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentOrderStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CLEARED');

-- CreateEnum
CREATE TYPE "LedgerDirection" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "PriceCatalogUnitType" AS ENUM ('MINOR', 'BPS');

-- CreateEnum
CREATE TYPE "CorporateCompanyStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CorporateJobPostingStatus" AS ENUM ('SEALED', 'AWARDED', 'RELEASED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CorporateWorkbenchKind" AS ENUM ('FREELANCER', 'DEVLABS');

-- CreateEnum
CREATE TYPE "StudioDraftStatus" AS ENUM ('OPEN', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StudioGenerationStatus" AS ENUM ('SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "academy_courses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "catalog_unit_key" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "price_lock_id" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "status" "AcademyPurchaseStatus" NOT NULL DEFAULT 'SETTLED',
    "settled_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_certificates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "purchase_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "serial_key" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arena_tenders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "prize_pool_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "escrow_hold_id" TEXT NOT NULL,
    "status" "ArenaTenderStatus" NOT NULL,
    "round" "ArenaTenderRound" NOT NULL DEFAULT 'SUBMISSION',
    "hold_bps" INTEGER NOT NULL,
    "gross_minor" INTEGER NOT NULL,
    "hold_minor" INTEGER NOT NULL,
    "net_minor" INTEGER NOT NULL,
    "submission_closes_at" TIMESTAMP(3) NOT NULL,
    "evaluation_closes_at" TIMESTAMP(3) NOT NULL,
    "awarded_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arena_tenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arena_submissions" (
    "id" TEXT NOT NULL,
    "tender_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "proposal" TEXT NOT NULL,
    "status" "ArenaSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arena_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arena_awards" (
    "id" TEXT NOT NULL,
    "tender_id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arena_awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_visa_stamps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_kind" "CareerVisaSourceKind" NOT NULL,
    "source_id" TEXT NOT NULL,
    "visa_key" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_visa_stamps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_portfolio_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "visa_stamp_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_portfolio_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devlabs_projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" "DevLabsProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "sandbox_kind" "DevLabsSandboxKind" NOT NULL DEFAULT 'NARROW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devlabs_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devlabs_api_keys" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devlabs_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelancer_jobs" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "budget_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "status" "FreelancerJobStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freelancer_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelancer_bids" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "bidder_id" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "cover_note" TEXT NOT NULL,
    "status" "FreelancerBidStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freelancer_bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelancer_contracts" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "bid_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "freelancer_id" TEXT NOT NULL,
    "escrow_hold_id" TEXT NOT NULL,
    "status" "FreelancerContractStatus" NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "gross_minor" INTEGER NOT NULL,
    "hold_minor" INTEGER NOT NULL,
    "net_minor" INTEGER NOT NULL,
    "hold_bps" INTEGER NOT NULL,
    "funded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freelancer_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'tr-TR',
    "time_zone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "amount_minor" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "direction" "LedgerDirection" NOT NULL,
    "label" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_holds" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reference_key" TEXT NOT NULL,
    "status" "EscrowHoldStatus" NOT NULL DEFAULT 'PENDING',
    "currency_code" CHAR(3) NOT NULL,
    "gross_minor" INTEGER NOT NULL,
    "hold_minor" INTEGER NOT NULL,
    "net_minor" INTEGER NOT NULL,
    "hold_bps" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "released_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "escrow_holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "merchant_oid" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "status" "PaymentOrderStatus" NOT NULL DEFAULT 'PENDING',
    "clearing_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "cleared_at" TIMESTAMP(3),

    CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_catalog_entries" (
    "id" TEXT NOT NULL,
    "module_key" TEXT NOT NULL,
    "unit_key" TEXT NOT NULL,
    "unit_type" "PriceCatalogUnitType" NOT NULL DEFAULT 'MINOR',
    "amount_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "min_minor" INTEGER,
    "max_minor" INTEGER,
    "description" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_catalog_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkout_price_locks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lock_key" TEXT NOT NULL,
    "module_key" TEXT NOT NULL,
    "unit_key" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "catalog_minor" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkout_price_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_token_usages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "source" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "role_key" TEXT,
    "prompt_tokens" INTEGER NOT NULL,
    "completion_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "cost_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "idempotency_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_token_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_companies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "trade_name" TEXT,
    "jurisdiction" TEXT NOT NULL DEFAULT 'TR',
    "tax_id" TEXT,
    "status" "CorporateCompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_job_postings" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "budget_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "workbench_kind" "CorporateWorkbenchKind" NOT NULL,
    "escrow_hold_id" TEXT NOT NULL,
    "status" "CorporateJobPostingStatus" NOT NULL,
    "awarded_user_id" TEXT,
    "awarded_devlabs_project_id" TEXT,
    "hold_bps" INTEGER NOT NULL,
    "gross_minor" INTEGER NOT NULL,
    "hold_minor" INTEGER NOT NULL,
    "net_minor" INTEGER NOT NULL,
    "sealed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awarded_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studio_drafts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" "StudioDraftStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studio_generations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "draft_id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "output_text" TEXT,
    "status" "StudioGenerationStatus" NOT NULL,
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
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "studio_generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academy_courses_slug_key" ON "academy_courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "academy_courses_catalog_unit_key_key" ON "academy_courses"("catalog_unit_key");

-- CreateIndex
CREATE INDEX "academy_courses_is_published_created_at_idx" ON "academy_courses"("is_published", "created_at");

-- CreateIndex
CREATE INDEX "academy_purchases_user_id_created_at_idx" ON "academy_purchases"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "academy_purchases_course_id_idx" ON "academy_purchases"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "academy_purchases_user_id_course_id_key" ON "academy_purchases"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "academy_certificates_purchase_id_key" ON "academy_certificates"("purchase_id");

-- CreateIndex
CREATE UNIQUE INDEX "academy_certificates_serial_key_key" ON "academy_certificates"("serial_key");

-- CreateIndex
CREATE INDEX "academy_certificates_user_id_issued_at_idx" ON "academy_certificates"("user_id", "issued_at");

-- CreateIndex
CREATE UNIQUE INDEX "academy_certificates_user_id_course_id_key" ON "academy_certificates"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "arena_tenders_escrow_hold_id_key" ON "arena_tenders"("escrow_hold_id");

-- CreateIndex
CREATE INDEX "arena_tenders_user_id_status_idx" ON "arena_tenders"("user_id", "status");

-- CreateIndex
CREATE INDEX "arena_tenders_status_round_submission_closes_at_idx" ON "arena_tenders"("status", "round", "submission_closes_at");

-- CreateIndex
CREATE INDEX "arena_tenders_status_evaluation_closes_at_idx" ON "arena_tenders"("status", "evaluation_closes_at");

-- CreateIndex
CREATE INDEX "arena_submissions_user_id_idx" ON "arena_submissions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "arena_submissions_tender_id_user_id_key" ON "arena_submissions"("tender_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "arena_awards_submission_id_key" ON "arena_awards"("submission_id");

-- CreateIndex
CREATE INDEX "arena_awards_tender_id_idx" ON "arena_awards"("tender_id");

-- CreateIndex
CREATE INDEX "arena_awards_user_id_idx" ON "arena_awards"("user_id");

-- CreateIndex
CREATE INDEX "career_visa_stamps_user_id_issued_at_idx" ON "career_visa_stamps"("user_id", "issued_at");

-- CreateIndex
CREATE UNIQUE INDEX "career_visa_stamps_user_id_source_kind_source_id_key" ON "career_visa_stamps"("user_id", "source_kind", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "career_portfolio_items_visa_stamp_id_key" ON "career_portfolio_items"("visa_stamp_id");

-- CreateIndex
CREATE INDEX "career_portfolio_items_user_id_created_at_idx" ON "career_portfolio_items"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "devlabs_projects_user_id_status_idx" ON "devlabs_projects"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "devlabs_api_keys_key_hash_key" ON "devlabs_api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "devlabs_api_keys_project_id_created_at_idx" ON "devlabs_api_keys"("project_id", "created_at");

-- CreateIndex
CREATE INDEX "devlabs_api_keys_user_id_idx" ON "devlabs_api_keys"("user_id");

-- CreateIndex
CREATE INDEX "freelancer_jobs_client_id_status_idx" ON "freelancer_jobs"("client_id", "status");

-- CreateIndex
CREATE INDEX "freelancer_jobs_status_created_at_idx" ON "freelancer_jobs"("status", "created_at");

-- CreateIndex
CREATE INDEX "freelancer_bids_bidder_id_idx" ON "freelancer_bids"("bidder_id");

-- CreateIndex
CREATE UNIQUE INDEX "freelancer_bids_job_id_bidder_id_key" ON "freelancer_bids"("job_id", "bidder_id");

-- CreateIndex
CREATE UNIQUE INDEX "freelancer_contracts_job_id_key" ON "freelancer_contracts"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "freelancer_contracts_bid_id_key" ON "freelancer_contracts"("bid_id");

-- CreateIndex
CREATE UNIQUE INDEX "freelancer_contracts_escrow_hold_id_key" ON "freelancer_contracts"("escrow_hold_id");

-- CreateIndex
CREATE INDEX "freelancer_contracts_client_id_status_idx" ON "freelancer_contracts"("client_id", "status");

-- CreateIndex
CREATE INDEX "freelancer_contracts_freelancer_id_status_idx" ON "freelancer_contracts"("freelancer_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "wallets_user_id_idx" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_currency_code_key" ON "wallets"("user_id", "currency_code");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_entries_idempotency_key_key" ON "ledger_entries"("idempotency_key");

-- CreateIndex
CREATE INDEX "ledger_entries_wallet_id_created_at_idx" ON "ledger_entries"("wallet_id", "created_at");

-- CreateIndex
CREATE INDEX "ledger_entries_user_id_created_at_idx" ON "ledger_entries"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "escrow_holds_reference_key_key" ON "escrow_holds"("reference_key");

-- CreateIndex
CREATE INDEX "escrow_holds_wallet_id_status_idx" ON "escrow_holds"("wallet_id", "status");

-- CreateIndex
CREATE INDEX "escrow_holds_user_id_status_idx" ON "escrow_holds"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_orders_merchant_oid_key" ON "payment_orders"("merchant_oid");

-- CreateIndex
CREATE INDEX "payment_orders_user_id_created_at_idx" ON "payment_orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "payment_orders_status_idx" ON "payment_orders"("status");

-- CreateIndex
CREATE INDEX "price_catalog_entries_module_key_idx" ON "price_catalog_entries"("module_key");

-- CreateIndex
CREATE UNIQUE INDEX "price_catalog_entries_module_key_unit_key_key" ON "price_catalog_entries"("module_key", "unit_key");

-- CreateIndex
CREATE INDEX "checkout_price_locks_user_id_expires_at_idx" ON "checkout_price_locks"("user_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "checkout_price_locks_user_id_lock_key_key" ON "checkout_price_locks"("user_id", "lock_key");

-- CreateIndex
CREATE UNIQUE INDEX "ai_token_usages_idempotency_key_key" ON "ai_token_usages"("idempotency_key");

-- CreateIndex
CREATE INDEX "ai_token_usages_user_id_created_at_idx" ON "ai_token_usages"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_token_usages_source_created_at_idx" ON "ai_token_usages"("source", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_companies_user_id_key" ON "corporate_companies"("user_id");

-- CreateIndex
CREATE INDEX "corporate_companies_status_created_at_idx" ON "corporate_companies"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_job_postings_escrow_hold_id_key" ON "corporate_job_postings"("escrow_hold_id");

-- CreateIndex
CREATE INDEX "corporate_job_postings_user_id_status_idx" ON "corporate_job_postings"("user_id", "status");

-- CreateIndex
CREATE INDEX "corporate_job_postings_company_id_status_idx" ON "corporate_job_postings"("company_id", "status");

-- CreateIndex
CREATE INDEX "corporate_job_postings_awarded_user_id_status_idx" ON "corporate_job_postings"("awarded_user_id", "status");

-- CreateIndex
CREATE INDEX "corporate_job_postings_status_created_at_idx" ON "corporate_job_postings"("status", "created_at");

-- CreateIndex
CREATE INDEX "studio_drafts_user_id_created_at_idx" ON "studio_drafts"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "studio_generations_usage_id_key" ON "studio_generations"("usage_id");

-- CreateIndex
CREATE UNIQUE INDEX "studio_generations_ledger_debit_key_key" ON "studio_generations"("ledger_debit_key");

-- CreateIndex
CREATE INDEX "studio_generations_user_id_created_at_idx" ON "studio_generations"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "studio_generations_draft_id_created_at_idx" ON "studio_generations"("draft_id", "created_at");

-- AddForeignKey
ALTER TABLE "academy_purchases" ADD CONSTRAINT "academy_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_purchases" ADD CONSTRAINT "academy_purchases_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "academy_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_certificates" ADD CONSTRAINT "academy_certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_certificates" ADD CONSTRAINT "academy_certificates_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "academy_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_certificates" ADD CONSTRAINT "academy_certificates_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "academy_purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_tenders" ADD CONSTRAINT "arena_tenders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_submissions" ADD CONSTRAINT "arena_submissions_tender_id_fkey" FOREIGN KEY ("tender_id") REFERENCES "arena_tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_submissions" ADD CONSTRAINT "arena_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_awards" ADD CONSTRAINT "arena_awards_tender_id_fkey" FOREIGN KEY ("tender_id") REFERENCES "arena_tenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_awards" ADD CONSTRAINT "arena_awards_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "arena_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_awards" ADD CONSTRAINT "arena_awards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_visa_stamps" ADD CONSTRAINT "career_visa_stamps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_portfolio_items" ADD CONSTRAINT "career_portfolio_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_portfolio_items" ADD CONSTRAINT "career_portfolio_items_visa_stamp_id_fkey" FOREIGN KEY ("visa_stamp_id") REFERENCES "career_visa_stamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devlabs_projects" ADD CONSTRAINT "devlabs_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devlabs_api_keys" ADD CONSTRAINT "devlabs_api_keys_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "devlabs_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devlabs_api_keys" ADD CONSTRAINT "devlabs_api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_jobs" ADD CONSTRAINT "freelancer_jobs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_bids" ADD CONSTRAINT "freelancer_bids_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "freelancer_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_bids" ADD CONSTRAINT "freelancer_bids_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_contracts" ADD CONSTRAINT "freelancer_contracts_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "freelancer_jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_contracts" ADD CONSTRAINT "freelancer_contracts_bid_id_fkey" FOREIGN KEY ("bid_id") REFERENCES "freelancer_bids"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_contracts" ADD CONSTRAINT "freelancer_contracts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_contracts" ADD CONSTRAINT "freelancer_contracts_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_holds" ADD CONSTRAINT "escrow_holds_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_holds" ADD CONSTRAINT "escrow_holds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_price_locks" ADD CONSTRAINT "checkout_price_locks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_token_usages" ADD CONSTRAINT "ai_token_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_companies" ADD CONSTRAINT "corporate_companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_job_postings" ADD CONSTRAINT "corporate_job_postings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_job_postings" ADD CONSTRAINT "corporate_job_postings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "corporate_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_job_postings" ADD CONSTRAINT "corporate_job_postings_awarded_user_id_fkey" FOREIGN KEY ("awarded_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_drafts" ADD CONSTRAINT "studio_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_generations" ADD CONSTRAINT "studio_generations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_generations" ADD CONSTRAINT "studio_generations_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "studio_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Faz 5 katalog tohumu (S35-A). Tutar Super Admin verisidir; kod satış fiyatı değildir (S11-A).
INSERT INTO "price_catalog_entries" (
  "id",
  "module_key",
  "unit_key",
  "unit_type",
  "amount_minor",
  "currency_code",
  "is_active",
  "min_minor",
  "max_minor",
  "description",
  "created_at",
  "updated_at"
)
VALUES
  (
    'cat_studio_generation_text',
    'studio',
    'generation:text',
    'MINOR',
    100,
    'TRY',
    true,
    100,
    NULL,
    'Studio metin üretim tabanı — debit = max(taban, token) (S32-A).',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cat_kurumsal_job_posting_floor',
    'kurumsal',
    'job-posting:floor',
    'MINOR',
    1000,
    'TRY',
    true,
    1000,
    2000000,
    'Kurumsal mühürlü ilan bütçe tabanı / tavanı.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cat_arena_tender_pool_floor',
    'arena',
    'tender-pool:floor',
    'MINOR',
    10000,
    'TRY',
    true,
    10000,
    2000000,
    'Arena ihale ödül havuzu tabanı / tavanı.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

