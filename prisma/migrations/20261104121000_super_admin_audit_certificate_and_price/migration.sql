-- Fiyat mührü ve sertifika iptali. Append-only tetik durur.
-- Eylem listesi kod sabiti SUPER_ADMIN_AUDIT_ACTIONS ile aynıdır.

ALTER TABLE "super_admin_audit_logs" DROP CONSTRAINT "super_admin_audit_logs_action_known";

ALTER TABLE "super_admin_audit_logs"
  ADD CONSTRAINT "super_admin_audit_logs_action_known"
  CHECK ("action" IN (
    'catalog_publish',
    'catalog_price',
    'license_grant',
    'manual_refund',
    'certificate_revoke',
    'room_flag'
  ));
