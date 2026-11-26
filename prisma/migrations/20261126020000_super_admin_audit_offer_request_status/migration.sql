-- Kurumsal teklif talebi durum geçişi için süper yönetici eylem mührü.
--
-- `SUPER_ADMIN_AUDIT_ACTIONS` (lib/kernel/admin/audit-log.ts) Faz 2 ile
-- `offer_request_status` değerini kazandı, ama DB CHECK kısıtı
-- `20261124190000_super_admin_audit_employer_verify` sonrası hâlâ 10 eylemde
-- kalmıştı. Sonuç: `PATCH /api/admin/b2b/[id]` denetim satırını yazamıyor,
-- `writeSuperAdminAudit` false dönüyor ve `patchKurumsalOfferRequest` işlemi
-- **fail-closed geri alıyordu** (409). Yani Faz 2'nin lead iş akışı — talep
-- durumunu CONTACTED/WON/LOST'a çekmek — canlıda hiç çalışmıyordu.
--
-- Kısıt TS listesiyle birebir hizalanır. Liste `SUPER_ADMIN_AUDIT_ACTIONS`'ın
-- tamamıdır; test `tests/kernel/super-admin-audit.test.ts` ikisini kilitler.

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
    'offer_request_status'
  ));
