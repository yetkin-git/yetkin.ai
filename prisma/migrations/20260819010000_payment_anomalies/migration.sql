-- PayTR webhook / defter mutabakat anomali kuyruğu.
-- Append-only: updated_at yok. İkinci bakiye değildir; CREDIT yazmaz.
-- FORCE RLS event trigger CREATE TABLE sonrası ENABLE+FORCE basar.
-- user_id yok; PostgREST yazma politikası yok; Prisma BYPASSRLS yazar.

CREATE TABLE "payment_anomalies" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "merchant_oid" TEXT NOT NULL,
    "expected_minor" INTEGER,
    "reported_minor" INTEGER,
    "order_id" TEXT,
    "wallet_id" TEXT,
    "request_id" TEXT NOT NULL,
    "source_ip" TEXT,
    "detail" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_anomalies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_anomalies_fingerprint_key"
  ON "payment_anomalies"("fingerprint");

CREATE INDEX "payment_anomalies_kind_created_at_idx"
  ON "payment_anomalies"("kind", "created_at");

CREATE INDEX "payment_anomalies_merchant_oid_created_at_idx"
  ON "payment_anomalies"("merchant_oid", "created_at");
