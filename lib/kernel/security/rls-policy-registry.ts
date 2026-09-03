/**
 * RLS sahiplik kolonu sicili — SQL `yetkin_rls_ownership_columns()` ile birebir.
 * verify:rls-status sapmada kırılır.
 */

export const RLS_OWNERSHIP_COLUMNS = [
  "user_id",
  "client_id",
  "freelancer_id",
  "bidder_id",
  "awarded_user_id",
  "seller_user_id",
  "guardian_user_id",
] as const;

export type RlsOwnershipColumn = (typeof RLS_OWNERSHIP_COLUMNS)[number];

export const RLS_EXCLUDED_TABLES = [
  "schema_migrations",
  "spatial_ref_sys",
  "_supabase_migrations",
] as const;

/**
 * Post-apply FORCE RLS sicili — canlı Prisma `public` tabloları.
 * `@@map` / snake_case ile birebir; verify:rls-status Prisma modelleriyle karşılaştırır.
 */
export const RLS_FORCE_TABLES = [
  "academy_audio_cache",
  "academy_certificates",
  "academy_courses",
  "academy_exam_attempts",
  "academy_exam_sittings",
  "academy_exams",
  "academy_lesson_completions",
  "academy_purchases",
  "ai_token_usages",
  "career_portfolio_items",
  "career_visa_stamps",
  "checkout_price_locks",
  "escrow_holds",
  "freelancer_bids",
  "freelancer_contract_messages",
  "freelancer_contracts",
  "freelancer_disputes",
  "freelancer_jobs",
  "freelancer_squad_members",
  "freelancer_squads",
  "http_idempotency_records",
  "ledger_entries",
  "paid_command_reservations",
  "payment_anomalies",
  "payment_orders",
  "price_catalog_decision_ledger",
  "price_catalog_entries",
  "user_billing_info",
  "users",
  "wallets",
] as const;

/** Kapsamsız tablolar — fail-closed SELECT. INSERT/UPDATE/DELETE üretilmez. */
export const RLS_UNSCOPED_DENY_POLICY = "rls_deny_unscoped";

/** PostgREST yazma yasağı — INSERT/UPDATE/DELETE politikası üretilmez. */
export const POSTGREST_WRITE_POLICY_FORBIDDEN = true;
