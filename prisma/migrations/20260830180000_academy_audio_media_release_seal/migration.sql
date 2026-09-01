-- Zero-Cost Streaming: mediaReleaseSeal locator mührü.
-- Kamu WAV `public/media/academy/audio`; satır yalnız mühür + locator.
ALTER TABLE "academy_audio_cache"
  ADD COLUMN IF NOT EXISTS "media_release_seal" TEXT;

ALTER TABLE "academy_audio_cache"
  DROP CONSTRAINT IF EXISTS "academy_audio_cache_byte_size_positive";

ALTER TABLE "academy_audio_cache"
  ADD CONSTRAINT "academy_audio_cache_byte_size_positive"
  CHECK ("byte_size" > 0 AND "byte_size" <= 83886080);
