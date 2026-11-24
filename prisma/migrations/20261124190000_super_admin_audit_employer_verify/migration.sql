-- Kurumsal işveren doğrulaması için süper yönetici eylem mührü.
--
-- `SUPER_ADMIN_AUDIT_ACTIONS` (lib/kernel/admin/audit-log.ts) `employer_verify`
-- değerini taşır ama DB CHECK kısıtı eski listede kalmıştı: doğrulama rotası
-- denetim satırını yazamaz, `writeSuperAdminAudit` false döner ve işlem
-- fail-closed geri alınırdı. Kısıt TS listesiyle birebir hizalanır.

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
    'employer_verify'
  ));
