-- Kasa dürüstlüğü — yetim akademi DEBIT onarımı + satın alma silme kalkanı (A1).
--
-- Ölçülen olgu (2026-10-26):
--   ledger_entries: CREDIT 89000 (wallet-top-up:wallettopuped4e4bf60c9f93647280b75d)
--                   DEBIT  89000 (academy-purchase-debit:19011370-...-e91f:ac_01_office_ai)
--                   hazine CREDIT 89000 (academy-purchase-credit:19011370-...-e91f:ac_01_office_ai)
--   checkout_price_locks: d45e4371-7331-49e4-b039-b063977ff1fa, consumed_at dolu.
--   academy_purchases: satır YOK.
--
-- Hüküm: para gerçekten alındı (cüzdan 89000 -> 0, hazine +89000, aynı milisaniye).
-- Defter kendi içinde tutarlıdır; eksik olan *türetilmiş yetki satırıdır*.
-- Bu yüzden deftere CREDIT/DEBIT eklenmez (reversal para iadesi demek olurdu;
-- iade talebi ve iade kaydı yok). A1 append-only deftere dokunulmaz; projeksiyon onarılır.
--
-- Kök neden: `academy_purchases` satırı elle silindi; `users` satırı defter FK'si
-- (ON DELETE RESTRICT) yüzünden durduğu için CASCADE tetiklenmedi. Tek yazılı silme
-- yolu `scripts/ops-reset-citizen-academy-license.ts`, hedefi test kalıbı; bu hesap
-- `closed.*@anon.yetkin.invalid` kalıbına uymaz. Yani yol kapalıydı, kalkan yoktu.
--
-- Kalıcı düzeltme: defterde DEBIT varken satın alma satırı silinemez (BEFORE DELETE).

-- 1) Yetim satırı geri yaz. Idempotent: (user_id, course_id) unique.
INSERT INTO public.academy_purchases (
  id,
  user_id,
  course_id,
  price_lock_id,
  amount_minor,
  currency_code,
  status,
  settled_at,
  consent_version,
  distance_contract_accepted,
  digital_immediate_performance_accepted,
  created_at,
  updated_at
)
SELECT
  'recon-ledger-19011370-ac01officeai',
  le.user_id,
  'ac_01_office_ai',
  COALESCE(
    (
      SELECT cpl.id
      FROM public.checkout_price_locks cpl
      WHERE cpl.user_id = le.user_id
        AND cpl.lock_key = 'academy:course:01_office_ai'
      ORDER BY cpl.consumed_at NULLS LAST, cpl.created_at
      LIMIT 1
    ),
    'recon-missing-lock'
  ),
  le.amount_minor,
  le.currency_code,
  'SETTLED',
  le.created_at,
  NULL,
  NULL,
  NULL,
  le.created_at,
  le.created_at
FROM public.ledger_entries le
WHERE le.purpose = 'academy-purchase'
  AND le.direction = 'DEBIT'
  AND le.idempotency_key = 'academy-purchase-debit:19011370-b324-4a63-937b-b83a2905e91f:ac_01_office_ai'
  AND NOT EXISTS (
    SELECT 1
    FROM public.academy_purchases p
    WHERE p.user_id = le.user_id AND p.course_id = 'ac_01_office_ai'
  )
  AND EXISTS (
    SELECT 1 FROM public.academy_courses c WHERE c.id = 'ac_01_office_ai'
  )
ON CONFLICT DO NOTHING;

-- 2) Kalkan: defterde eşleşen DEBIT varken satın alma satırı silinemez.
--    Meşru silme (yalnız test döngüsü) önce defteri boşaltmak zorunda kalır; bu bilinçli.
CREATE OR REPLACE FUNCTION public.academy_purchases_guard_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  debit_key text := 'academy-purchase-debit:' || OLD.user_id || ':' || OLD.course_id;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.ledger_entries le
    WHERE le.user_id = OLD.user_id
      AND le.purpose = 'academy-purchase'
      AND le.direction = 'DEBIT'
      AND (
        le.idempotency_key = debit_key
        OR le.idempotency_key LIKE debit_key || ':%'
      )
  ) THEN
    RAISE EXCEPTION
      'academy_purchases satırı silinemez: defterde karşılık gelen DEBIT duruyor (A1 append-only). user=% course=%',
      OLD.user_id,
      OLD.course_id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS academy_purchases_guard_ledger_delete ON public.academy_purchases;

CREATE TRIGGER academy_purchases_guard_ledger_delete
  BEFORE DELETE ON public.academy_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.academy_purchases_guard_ledger();

REVOKE ALL ON FUNCTION public.academy_purchases_guard_ledger() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.academy_purchases_guard_ledger() TO postgres, service_role;

COMMENT ON FUNCTION public.academy_purchases_guard_ledger() IS
  'A1 kalkanı — defterde academy-purchase DEBIT varken academy_purchases satırı silinemez. Yetim DEBIT 2026-10-26 onarımının kalıcı kök neden düzeltmesi.';
