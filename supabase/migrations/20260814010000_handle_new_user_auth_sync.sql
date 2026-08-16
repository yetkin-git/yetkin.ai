-- Faz 1.1 — Supabase Auth → public.users + TRY wallets (S13-A)
-- Sıra: prisma migrate deploy → bu dosya → FORCE RLS → owner SELECT → katalog tohumu.
-- Prisma User.id üretmez; UUID auth.users.id'den gelir.
-- Cüzdan INSERT başarısız olsa bile kullanıcı satırı kalır (TRY).
-- Tetikleyici SECURITY DEFINER + postgres BYPASSRLS; FORCE RLS yazmayı boğmaz.
-- supabase_auth_admin tetikleyiciyi ateşler — EXECUTE yoksa kayıt Auth tarafında düşer.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.email IS NULL OR btrim(NEW.email) = '' THEN
    RAISE EXCEPTION 'handle_new_user: e-posta boş. public.users.email NOT NULL (S13-A). Telefon-only Auth açılmaz.';
  END IF;

  INSERT INTO public.users (id, email, locale, time_zone, created_at, updated_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    'tr-TR',
    'Europe/Istanbul',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

  BEGIN
    INSERT INTO public.wallets (id, user_id, currency_code, amount_minor, created_at, updated_at)
    VALUES (
      gen_random_uuid()::text,
      NEW.id::text,
      'TRY',
      0,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, currency_code) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user wallet bootstrap failed for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
  END IF;
END $$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Faz 1.1 — auth.users INSERT sonrası users + TRY wallets (amount_minor). Wallet hatası kullanıcıyı geri almaz. EXECUTE: postgres/service_role/supabase_auth_admin.';

-- Platform hold hazinesi (Auth login değildir). Release holdMinor buraya CREDİT edilir.
-- Bu UUID SUPER_ADMIN_USER_ID değildir; Auth kullanıcı listesinden kopyalanmaz.
INSERT INTO public.users (id, email, display_name, locale, time_zone, created_at, updated_at)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'treasury@yetkin.rail',
  'Platform Treasury',
  'tr-TR',
  'Europe/Istanbul',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wallets (id, user_id, currency_code, amount_minor, created_at, updated_at)
VALUES (
  '00000000-0000-4000-8000-000000000011',
  '00000000-0000-4000-8000-000000000001',
  'TRY',
  0,
  NOW(),
  NOW()
)
ON CONFLICT (user_id, currency_code) DO NOTHING;
