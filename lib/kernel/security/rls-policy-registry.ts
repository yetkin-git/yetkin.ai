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
  "academy_exemption_seals",
  "academy_lesson_completions",
  "academy_purchases",
  "ai_product_model_settings",
  "ai_token_usages",
  "b2b_lead_campaign_items",
  "b2b_outbound_daily_counters",
  "b2b_outbound_settings",
  "career_desk_tasks",
  "career_portfolio_items",
  "career_visa_stamps",
  "checkout_price_locks",
  "commerce_channel_listings",
  "commerce_inbox_entries",
  "commerce_marketplace_credentials",
  "commerce_marketplace_webhook_receipts",
  "commerce_products",
  "commerce_stores",
  "commerce_subscriptions",
  "commerce_trial_consumptions",
  "commerce_variants",
  "escrow_holds",
  "freelancer_bids",
  "freelancer_contract_messages",
  "freelancer_contracts",
  "freelancer_disputes",
  "freelancer_jobs",
  "freelancer_squad_members",
  "freelancer_squads",
  "funnel_daily_counters",
  "http_idempotency_records",
  "inventory_transactions",
  "junior_guardian_consents",
  "junior_profiles",
  "junior_progress",
  "junior_subscriptions",
  "junior_xp",
  "kurumsal_job_applications",
  "kurumsal_job_postings",
  "kurumsal_offer_requests",
  "ledger_entries",
  "paid_command_reservations",
  "payment_anomalies",
  "payment_orders",
  "price_catalog_decision_ledger",
  "price_catalog_entries",
  "sales_channels",
  "social_post_queue_items",
  "stock_ledgers",
  "super_admin_audit_logs",
  "tezgah_credit_balances",
  "tezgah_daily_quotas",
  "tezgah_outputs",
  "tezgah_subscriptions",
  "tetkik_domain_claims",
  "tetkik_reports",
  "user_billing_info",
  "users",
  "wallets",
  "wallet_card_refunds",
  "weekly_radar_deliveries",
  "yetkin_cv_seals",
  "yetkin_cv_sittings",
  "yetkinhibe_grant_calls",
  "yetkinhibe_grant_sources",
] as const;

/** Kapsamsız tablolar — fail-closed SELECT. INSERT/UPDATE/DELETE üretilmez. */
export const RLS_UNSCOPED_DENY_POLICY = "rls_deny_unscoped";

/** PostgREST yazma yasağı — INSERT/UPDATE/DELETE politikası üretilmez. */
export const POSTGREST_WRITE_POLICY_FORBIDDEN = true;
