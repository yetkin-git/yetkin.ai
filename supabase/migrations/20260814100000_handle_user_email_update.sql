-- [ADIM 9] Auth e-posta → public.users.email senkron mührü.
-- Sıra: prisma migrate deploy → handle_new_user → FORCE RLS → owner SELECT → katalog → akademi tohumu → bu dosya.
-- handle_new_user yalnız AFTER INSERT. Auth e-posta değişince (Dashboard, recovery, confirm) kopya geride kalırdı.
-- SSOT: auth.users.email. Uygulama public.users.email PATCH etmez; tetikleyici kopyalar.
-- Tetikleyici SECURITY DEFINER + postgres BYPASSRLS; FORCE RLS yazmayı boğmaz.
-- supabase_auth_admin tetikleyiciyi ateşler — EXECUTE yoksa Auth UPDATE düşer (e-posta Auth'ta da değişmez).

CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  updated_count integer;
BEGIN
  IF NEW.email IS NULL OR btrim(NEW.email) = '' THEN
    RAISE EXCEPTION 'handle_user_email_update: e-posta boş. public.users.email NOT NULL (S13-A). Telefon-only Auth açılmaz.';
  END IF;

  UPDATE public.users
     SET email = NEW.email,
         updated_at = NOW()
   WHERE id = NEW.id::text;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count = 0 THEN
    RAISE EXCEPTION 'handle_user_email_update: public.users satırı yok (id=%). handle_new_user kaçmış; Auth e-posta yazılmaz.', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'handle_user_email_update: public.users.email çatışması (id=% email=%).', NEW.id, NEW.email;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_email_update();

REVOKE ALL ON FUNCTION public.handle_user_email_update() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_user_email_update() TO postgres, service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT EXECUTE ON FUNCTION public.handle_user_email_update() TO supabase_auth_admin;
  END IF;
END $$;

COMMENT ON FUNCTION public.handle_user_email_update() IS
  'ADIM 9 — auth.users.email değişince public.users.email kopyalanır. Satır yoksa / boş e-posta / unique çatışması Auth UPDATE''i geri alır. EXECUTE: postgres/service_role/supabase_auth_admin.';

-- Tetikleyici yokken birikmiş drift (Dashboard / recovery). Auth SSOT; public kopyadır.
UPDATE public.users AS u
SET email = a.email,
    updated_at = NOW()
FROM auth.users AS a
WHERE u.id = a.id::text
  AND a.email IS NOT NULL
  AND btrim(a.email) <> ''
  AND u.email IS DISTINCT FROM a.email;
