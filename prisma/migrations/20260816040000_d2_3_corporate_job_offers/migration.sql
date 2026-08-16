-- D2.3: Kurumsal mühürlü ilana teklif satırı. Tutar yok — EscrowHold mühür anında kilitlenir.
-- Kariyer Vizesi bu tabloya yazılmaz (kapı HTTP'dedir; bakiye kilidi değildir).
-- Canlı apply Direct :5432 ister (docs/07_OPS_RUNBOOK.md §2.1). Havuz :6543 yasak.

CREATE TYPE "CorporateJobOfferStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED');

CREATE TABLE "corporate_job_offers" (
    "id" TEXT NOT NULL,
    "posting_id" TEXT NOT NULL,
    "bidder_id" TEXT NOT NULL,
    "cover_note" TEXT NOT NULL,
    "status" "CorporateJobOfferStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_job_offers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "corporate_job_offers_posting_id_bidder_id_key"
  ON "corporate_job_offers"("posting_id", "bidder_id");

CREATE INDEX "corporate_job_offers_bidder_id_idx" ON "corporate_job_offers"("bidder_id");

CREATE INDEX "corporate_job_offers_posting_id_status_idx"
  ON "corporate_job_offers"("posting_id", "status");

ALTER TABLE "corporate_job_offers"
  ADD CONSTRAINT "corporate_job_offers_posting_id_fkey"
  FOREIGN KEY ("posting_id") REFERENCES "corporate_job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "corporate_job_offers"
  ADD CONSTRAINT "corporate_job_offers_bidder_id_fkey"
  FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
