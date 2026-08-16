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

/** PostgREST yazma yasağı — INSERT/UPDATE/DELETE politikası üretilmez. */
export const POSTGREST_WRITE_POLICY_FORBIDDEN = true;
