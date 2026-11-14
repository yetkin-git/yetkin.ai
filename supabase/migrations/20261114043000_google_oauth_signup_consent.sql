-- Google ile devam: düğme, e-posta kaydındaki "Hesap oluştur" ile aynı 18+ ve kullanım/KVKK kabulüdür.
-- Auth OAuth çağrısı user metadata taşımaz. BEFORE INSERT mühürü auth.users satırına yazılır.
-- provider google değilse age_confirmed_at / terms_accepted_at hâlâ fail-closed.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
SET row_security = off
AS $$
DECLARE
  accepted_at text;
BEGIN
  IF NEW.email IS NULL OR btrim(NEW.email) = '' THEN
    RAISE EXCEPTION 'handle_new_user: e-posta boş. public.users.email NOT NULL (S13-A). Telefon-only Auth açılmaz.';
  END IF;

  IF COALESCE(NEW.raw_app_meta_data->>'provider', '') = 'google'
     OR COALESCE(NEW.raw_user_meta_data->>'iss', '') LIKE '%accounts.google.com%' THEN
    accepted_at := to_char(clock_timestamp() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
    NEW.raw_user_meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    IF COALESCE(btrim(NEW.raw_user_meta_data->>'age_confirmed_at'), '') = '' THEN
      NEW.raw_user_meta_data := NEW.raw_user_meta_data || jsonb_build_object(
        'age_confirmed_at', accepted_at,
        'is_adult', true
      );
    END IF;
    IF COALESCE(btrim(NEW.raw_user_meta_data->>'terms_accepted_at'), '') = ''
       OR COALESCE(btrim(NEW.raw_user_meta_data->>'consent_version'), '') = '' THEN
      NEW.raw_user_meta_data := NEW.raw_user_meta_data || jsonb_build_object(
        'terms_accepted_at', accepted_at,
        'consent_version', '2026-09-08',
        'terms_confirmed', true,
        'kvkk_confirmed', true
      );
    END IF;
  END IF;

  -- Fail-closed 18+: e-posta kaydı metadata'sız düşmez. Google düğmesi yukarıda mühürlenir.
  IF NEW.raw_user_meta_data IS NULL
     OR COALESCE(btrim(NEW.raw_user_meta_data->>'age_confirmed_at'), '') = '' THEN
    RAISE EXCEPTION 'handle_new_user: 18 yaş onayı yok. age_confirmed_at zorunludur.';
  END IF;

  -- Fail-closed kullanım + KVKK: tek kayıt tiki terms_accepted_at + consent_version basar.
  IF COALESCE(btrim(NEW.raw_user_meta_data->>'terms_accepted_at'), '') = ''
     OR COALESCE(btrim(NEW.raw_user_meta_data->>'consent_version'), '') = '' THEN
    RAISE EXCEPTION 'handle_new_user: kullanım/KVKK rızası yok. terms_accepted_at ve consent_version zorunludur.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.users u
    WHERE lower(u.email) = lower(NEW.email)
      AND u.id <> NEW.id::text
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM public.users u
      WHERE lower(u.email) = lower(NEW.email)
        AND u.id <> NEW.id::text
        AND (
          EXISTS (SELECT 1 FROM auth.users a WHERE a.id::text = u.id)
          OR EXISTS (SELECT 1 FROM public.ledger_entries le WHERE le.user_id = u.id)
        )
    ) THEN
      RAISE EXCEPTION 'handle_new_user: e-posta public.users unique kısıtına takıldı (users_email_key).';
    END IF;
    BEGIN
      DELETE FROM public.wallets w
      WHERE w.user_id IN (
        SELECT u.id FROM public.users u
        WHERE lower(u.email) = lower(NEW.email) AND u.id <> NEW.id::text
      );
      DELETE FROM public.users u
      WHERE lower(u.email) = lower(NEW.email) AND u.id <> NEW.id::text;
    EXCEPTION
      WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'handle_new_user: yetim public.users silinemedi (FK). e-posta unique kısıtı.';
      WHEN OTHERS THEN
        RAISE EXCEPTION 'handle_new_user: yetim public.users temizliği başarısız: %', SQLERRM;
    END;
  END IF;

  BEGIN
    INSERT INTO public.users (id, email, display_name, locale, time_zone, created_at, updated_at)
    VALUES (
      NEW.id::text,
      NEW.email,
      NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')), ''),
      'tr-TR',
      'Europe/Istanbul',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          display_name = COALESCE(public.users.display_name, EXCLUDED.display_name),
          updated_at = NOW();
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'handle_new_user: public.users e-posta unique kısıtı (users_email_key).';
    WHEN OTHERS THEN
      RAISE EXCEPTION 'handle_new_user: public.users UPSERT başarısız: %', SQLERRM;
  END;

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
    ON CONFLICT (user_id, currency_code) DO UPDATE
      SET updated_at = NOW();
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user wallet bootstrap failed for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
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
  'auth.users INSERT öncesi users + TRY wallets UPSERT. Google provider 18+ ve kullanım/KVKK mührünü düğme kabulü olarak yazar. Diğer kayıtlar age_confirmed_at ve terms_accepted_at+consent_version yoksa fail-closed. Wallet hatası kullanıcıyı geri almaz.';
