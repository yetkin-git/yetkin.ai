-- Akademi ders TTS CDN — public bucket `lesson-audios`.
-- ops:migrate kilitli sekiz SQL'e EKLENMEZ. Dashboard SQL Editor (Storage).
-- Anon + vatandaş JWT; service_role JS anahtarı yoktur.
-- Kod SSOT: lib/academy/listen-audio-store.ts

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-audios',
  'lesson-audios',
  true,
  20971520,
  ARRAY['audio/wav', 'audio/mpeg']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['audio/wav', 'audio/mpeg']::text[];

DROP POLICY IF EXISTS "lesson_audios_public_read" ON storage.objects;
DROP POLICY IF EXISTS "lesson_audios_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "lesson_audios_authenticated_update" ON storage.objects;

CREATE POLICY "lesson_audios_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'lesson-audios');

CREATE POLICY "lesson_audios_authenticated_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-audios'
  AND (storage.foldername(name))[1] IN ('lessons', 'demo')
);

CREATE POLICY "lesson_audios_authenticated_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-audios'
  AND (storage.foldername(name))[1] IN ('lessons', 'demo')
)
WITH CHECK (
  bucket_id = 'lesson-audios'
  AND (storage.foldername(name))[1] IN ('lessons', 'demo')
);
