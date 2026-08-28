-- P3: donmuş oda tabloları (23). Canlı Prisma şeması bu modelleri taşımaz.
-- IF EXISTS + CASCADE: lab/hosted kalıntı ve çapraz FK güvenli düşer.
-- Bu migrasyon boşken hosted apply disk planı kırılırdı; SQL artık mühürlüdür.
-- Not: _prisma_migrations'ta boş gövdeyle applied kaydı varsa bu dosya yeniden koşmaz —
-- o durumda Super Admin yeni DROP migrasyonu açar (ops:migrate kararı).

DROP TABLE IF EXISTS "proof_feed_interactions" CASCADE;
DROP TABLE IF EXISTS "proof_feed_items" CASCADE;
DROP TABLE IF EXISTS "junior_allowances" CASCADE;
DROP TABLE IF EXISTS "junior_guardian_invites" CASCADE;
DROP TABLE IF EXISTS "junior_profiles" CASCADE;
DROP TABLE IF EXISTS "marketplace_dopings" CASCADE;
DROP TABLE IF EXISTS "marketplace_offers" CASCADE;
DROP TABLE IF EXISTS "marketplace_orders" CASCADE;
DROP TABLE IF EXISTS "marketplace_products" CASCADE;
DROP TABLE IF EXISTS "arena_awards" CASCADE;
DROP TABLE IF EXISTS "arena_submissions" CASCADE;
DROP TABLE IF EXISTS "arena_tenders" CASCADE;
DROP TABLE IF EXISTS "grant_applications" CASCADE;
DROP TABLE IF EXISTS "grant_programs" CASCADE;
DROP TABLE IF EXISTS "corporate_job_offers" CASCADE;
DROP TABLE IF EXISTS "corporate_job_postings" CASCADE;
DROP TABLE IF EXISTS "corporate_companies" CASCADE;
DROP TABLE IF EXISTS "studio_digital_assets" CASCADE;
DROP TABLE IF EXISTS "studio_generations" CASCADE;
DROP TABLE IF EXISTS "studio_drafts" CASCADE;
DROP TABLE IF EXISTS "devlabs_artifacts" CASCADE;
DROP TABLE IF EXISTS "devlabs_api_keys" CASCADE;
DROP TABLE IF EXISTS "devlabs_projects" CASCADE;
