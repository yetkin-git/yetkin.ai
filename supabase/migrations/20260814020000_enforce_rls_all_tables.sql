-- Faz 1.1 — ENABLE + FORCE RLS + CREATE TABLE event trigger (S17-A)
-- Sıra: prisma migrate deploy → handle_new_user → bu dosya → owner SELECT → katalog tohumu.
-- Prisma / service_role / postgres BYPASSRLS kullanır.
-- PostgREST anon/authenticated: politika yoksa sıfır satır (fail-closed).
-- PostgREST yazma GRANT/POLICY yok; INSERT/UPDATE/DELETE yalnız Prisma.

DO $$
DECLARE
  tbl text;
  sealed integer := 0;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE '_prisma%'
      AND tablename NOT IN (
        'schema_migrations',
        'spatial_ref_sys',
        '_supabase_migrations'
      )
    ORDER BY tablename
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', tbl);
    sealed := sealed + 1;
  END LOOP;
  RAISE NOTICE 'Faz 1.1 RLS: % public tablo ENABLE+FORCE.', sealed;
END $$;

CREATE OR REPLACE FUNCTION public.yetkin_auto_enable_rls()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  obj record;
  table_name text;
BEGIN
  FOR obj IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag = 'CREATE TABLE'
      AND object_type = 'table'
      AND schema_name = 'public'
  LOOP
    table_name := trim(both '"' from split_part(obj.object_identity, '.', 2));

    IF table_name IS NULL
       OR table_name = ''
       OR table_name LIKE 'pg_%'
       OR table_name LIKE '_prisma%'
       OR table_name IN (
         'schema_migrations',
         'spatial_ref_sys',
         '_supabase_migrations'
       )
    THEN
      CONTINUE;
    END IF;

    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
      table_name
    );
    EXECUTE format(
      'ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',
      table_name
    );
  END LOOP;
END;
$$;

DROP EVENT TRIGGER IF EXISTS yetkin_auto_enable_rls_on_create;
CREATE EVENT TRIGGER yetkin_auto_enable_rls_on_create
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE')
  EXECUTE FUNCTION public.yetkin_auto_enable_rls();

COMMENT ON FUNCTION public.yetkin_auto_enable_rls() IS
  'Faz 1.1 — public CREATE TABLE sonrası otomatik ENABLE+FORCE RLS.';

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO authenticated, anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO postgres, service_role, authenticated;

COMMENT ON SCHEMA public IS
  'yetkin_rail — RLS mühürlü (S17-A). Mevcut tablolar FORCE RLS; yeni tablolar event trigger. '
  'PostgREST yazma GRANT/POLICY yok; yazma yalnızca Prisma BYPASSRLS.';
