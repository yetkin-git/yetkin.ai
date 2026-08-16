-- T2-2 Studio bucket + storage.objects RLS.
-- ops:migrate kilitli yedi SQL'e EKLENMEZ. Dashboard SQL Editor (Storage).
-- service_role JS anahtarı yoktur; SQL GRANT tetikleyici EXECUTE ile karıştırılmaz.
-- CORS: Dashboard → Storage → Configuration (veya studio-assets) → CORS.
-- Allowed Origins: yalnız NEXT_PUBLIC_APP_URL origin (path yok, joker * yok).
-- Allowed Methods: yalnız PUT (preflight OPTIONS örtük). GET/HEAD/POST/PATCH/DELETE/TRACE/CONNECT yasak.
-- Allowed Headers: content-type, x-upsert. Kamu GET / CDN / ek origin yasak. Tezgâh imzalı GET.
-- Kod SSOT: lib/studio/storage.ts assertStudioStorageCorsHeaders. ops:migrate bu dosyayı taşımaz.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'studio-assets',
  'studio-assets',
  false,
  1572864,
  ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = 1572864,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']::text[];

DROP POLICY IF EXISTS "studio_assets_select_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_assets_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_assets_update_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_assets_delete_own" ON storage.objects;

CREATE POLICY "studio_assets_select_own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'studio-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "studio_assets_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'studio-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "studio_assets_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'studio-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'studio-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE yok: vatandaş nesneyi Storage'dan silmez. Anon SELECT yok.
