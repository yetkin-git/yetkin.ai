-- Süper yönetici eylem günlüğü. Append-only. Rol tablosu değildir.
-- actor_user_id yalnız SUPER_ADMIN_USER_ID UUID'sidir.
-- PostgREST politikası yok; yazma Prisma BYPASSRLS. UPDATE/DELETE tetik yasağı.

CREATE TABLE "super_admin_audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "super_admin_audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "super_admin_audit_logs_actor_user_id_uuid"
      CHECK ("actor_user_id" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
    CONSTRAINT "super_admin_audit_logs_action_known"
      CHECK ("action" IN ('catalog_publish', 'license_grant', 'manual_refund', 'room_flag'))
);

CREATE INDEX "super_admin_audit_logs_actor_user_id_created_at_idx"
  ON "super_admin_audit_logs"("actor_user_id", "created_at");

CREATE INDEX "super_admin_audit_logs_action_created_at_idx"
  ON "super_admin_audit_logs"("action", "created_at");

CREATE OR REPLACE FUNCTION yetkin_forbid_super_admin_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'super_admin_audit_logs is append-only';
END;
$$;

DROP TRIGGER IF EXISTS super_admin_audit_logs_append_only ON super_admin_audit_logs;
CREATE TRIGGER super_admin_audit_logs_append_only
  BEFORE UPDATE OR DELETE ON super_admin_audit_logs
  FOR EACH ROW
  EXECUTE PROCEDURE yetkin_forbid_super_admin_audit_mutation();
