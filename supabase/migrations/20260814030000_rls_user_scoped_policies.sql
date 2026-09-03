-- Faz 1.1 — Owner-scoped SELECT. PostgREST INSERT/UPDATE/DELETE politikası yoktur (yazma yasağı).
-- Sıra: prisma migrate deploy → handle_new_user → FORCE RLS → bu dosya → katalog tohumu.
-- Sicil: lib/kernel/security/rls-policy-registry.ts ile birebir aynı olmalıdır.
-- Prisma / postgres / service_role BYPASSRLS — yazma politikası gerekmez, yazmayı da açmaz.
-- Sahiplik kolonu olmayan tablolar (price_catalog_entries, academy_courses, …)
-- rls_deny_unscoped SELECT USING (false) alır: Supabase "RLS Enabled No Policy" kapanır,
-- PostgREST sıfır satır kalır. Katalog okuma Prisma + Super Admin.

CREATE OR REPLACE FUNCTION public.yetkin_auth_user_id()
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = pg_catalog, public
AS $$
DECLARE
  claim text;
  claims text;
BEGIN
  claim := nullif(current_setting('request.jwt.claim.sub', true), '');
  IF claim IS NOT NULL THEN
    RETURN claim;
  END IF;

  claims := nullif(current_setting('request.jwt.claims', true), '');
  IF claims IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN nullif(claims::jsonb ->> 'sub', '');
EXCEPTION
  WHEN others THEN
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.yetkin_auth_user_id() IS
  'Faz 1.1 — RLS oturum sahibi (JWT sub). auth.uid() yoksa CI çıplak Postgres ile aynı sözleşme.';

CREATE OR REPLACE FUNCTION public.yetkin_rls_ownership_columns()
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ARRAY[
    'user_id',
    'client_id',
    'freelancer_id',
    'bidder_id',
    'awarded_user_id',
    'seller_user_id',
    'guardian_user_id'
  ]::text[];
$$;

COMMENT ON FUNCTION public.yetkin_rls_ownership_columns() IS
  'Faz 1.1 — kullanıcı verisi sahiplik kolonları sicili (ince; müze 50+ kopyası değil).';

CREATE OR REPLACE FUNCTION public.yetkin_apply_rls_owner_policies(target_table text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  owner_col text;
  policy_name text;
  created integer := 0;
BEGIN
  IF target_table IS NULL
     OR target_table = ''
     OR target_table LIKE 'pg\_%'
     OR target_table LIKE '\_prisma%'
     OR target_table IN ('schema_migrations', 'spatial_ref_sys', '_supabase_migrations')
  THEN
    RETURN 0;
  END IF;

  FOREACH owner_col IN ARRAY public.yetkin_rls_ownership_columns()
  LOOP
    PERFORM 1
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = target_table
      AND c.relkind = 'r'
      AND a.attname = owner_col
      AND a.attnum > 0
      AND NOT a.attisdropped
      AND format_type(a.atttypid, NULL) IN ('text', 'character varying', 'uuid');

    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    policy_name := 'rls_own_' || owner_col;

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, target_table);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (%I::text = public.yetkin_auth_user_id())',
      policy_name,
      target_table,
      owner_col
    );

    created := created + 1;
  END LOOP;

  RETURN created;
END;
$$;

COMMENT ON FUNCTION public.yetkin_apply_rls_owner_policies(text) IS
  'Faz 1.1 — sahiplik kolonu başına authenticated SELECT. Yazma politikası üretilmez.';

CREATE OR REPLACE FUNCTION public.yetkin_apply_rls_unscoped_deny(target_table text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  policy_count integer;
BEGIN
  IF target_table IS NULL
     OR target_table = ''
     OR target_table LIKE 'pg\_%'
     OR target_table LIKE '\_prisma%'
     OR target_table IN ('schema_migrations', 'spatial_ref_sys', '_supabase_migrations')
  THEN
    RETURN false;
  END IF;

  PERFORM 1
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = target_table
    AND c.relkind = 'r';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  EXECUTE format('DROP POLICY IF EXISTS rls_deny_unscoped ON public.%I', target_table);

  SELECT count(*)::int INTO policy_count
  FROM pg_policy p
  JOIN pg_class c ON c.oid = p.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = target_table;

  IF policy_count > 0 THEN
    RETURN false;
  END IF;

  EXECUTE format(
    'CREATE POLICY rls_deny_unscoped ON public.%I FOR SELECT TO anon, authenticated USING (false)',
    target_table
  );
  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.yetkin_apply_rls_unscoped_deny(text) IS
  'Faz 1.1 — sahiplik politikası yoksa fail-closed SELECT. INSERT/UPDATE/DELETE üretilmez.';

CREATE OR REPLACE FUNCTION public.yetkin_seal_rls_policies_for_table(target_table text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  produced integer;
BEGIN
  produced := public.yetkin_apply_rls_owner_policies(target_table);

  IF target_table = 'users' THEN
    EXECUTE 'DROP POLICY IF EXISTS "users_select_own" ON public.users';
    EXECUTE $policy$
      CREATE POLICY "users_select_own"
        ON public.users
        FOR SELECT
        TO authenticated
        USING (id::text = public.yetkin_auth_user_id())
    $policy$;
    produced := produced + 1;
  END IF;

  IF public.yetkin_apply_rls_unscoped_deny(target_table) THEN
    produced := produced + 1;
  END IF;

  RETURN produced;
END;
$$;

COMMENT ON FUNCTION public.yetkin_seal_rls_policies_for_table(text) IS
  'Faz 1.1 — owner SELECT veya kapsamsız deny SELECT. PostgREST yazma yok.';

DO $$
DECLARE
  tbl text;
  total integer := 0;
  covered integer := 0;
  produced integer;
BEGIN
  FOR tbl IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
    ORDER BY c.relname
  LOOP
    produced := public.yetkin_seal_rls_policies_for_table(tbl);
    total := total + produced;
    IF produced > 0 THEN
      covered := covered + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Faz 1.1 RLS: % tabloda % SELECT politikası üretildi (owner + deny).', covered, total;
END $$;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id::text = public.yetkin_auth_user_id());

CREATE OR REPLACE FUNCTION public.yetkin_auto_apply_rls_policies()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  obj record;
  tbl text;
BEGIN
  FOR obj IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag = 'CREATE TABLE'
      AND object_type = 'table'
      AND schema_name = 'public'
  LOOP
    tbl := trim(both '"' from split_part(obj.object_identity, '.', 2));
    PERFORM public.yetkin_seal_rls_policies_for_table(tbl);
  END LOOP;
END;
$$;

DROP EVENT TRIGGER IF EXISTS yetkin_auto_apply_rls_policies_on_create;
CREATE EVENT TRIGGER yetkin_auto_apply_rls_policies_on_create
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE')
  EXECUTE FUNCTION public.yetkin_auto_apply_rls_policies();

COMMENT ON FUNCTION public.yetkin_auto_apply_rls_policies() IS
  'Faz 1.1 — public CREATE TABLE sonrası owner SELECT veya kapsamsız deny SELECT.';
