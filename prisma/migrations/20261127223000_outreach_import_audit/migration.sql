-- Kurumsal hedef listesi içe aktarma mührü.
-- `outreach_import` süper yönetici günlüğüne sayaç yazar; adres dökümü yazılmaz.
-- Kısıt, `SUPER_ADMIN_AUDIT_ACTIONS` ile birebir kalır.

ALTER TABLE "super_admin_audit_logs" DROP CONSTRAINT IF EXISTS "super_admin_audit_logs_action_known";

ALTER TABLE "super_admin_audit_logs"
  ADD CONSTRAINT "super_admin_audit_logs_action_known"
  CHECK ("action" IN (
    'catalog_publish',
    'catalog_price',
    'license_grant',
    'manual_refund',
    'certificate_revoke',
    'room_flag',
    'b2b_switch',
    'b2b_send',
    'ai_model_bind',
    'employer_verify',
    'offer_request_status',
    'outreach_switch',
    'outreach_draft',
    'outreach_send',
    'outreach_import'
  ));
