-- Paket C — HTTP Idempotency-Key replay tablosu.
-- FORCE RLS event trigger CREATE TABLE sonrası ENABLE+FORCE basar.
-- PostgREST yazma politikası yok; Prisma BYPASSRLS yazar.

CREATE TABLE "http_idempotency_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "response_json" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "http_idempotency_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "http_idempotency_records_user_id_route_key_key"
  ON "http_idempotency_records"("user_id", "route", "key");

CREATE INDEX "http_idempotency_records_user_id_idx"
  ON "http_idempotency_records"("user_id");

ALTER TABLE "http_idempotency_records"
  ADD CONSTRAINT "http_idempotency_records_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
