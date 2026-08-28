-- Akademi ders TTS kalıcı önbellek.
-- Byte nesne depoda (lesson-audios); satır yalnız locator. Gemini yalnız miss'te.
CREATE TABLE "academy_audio_cache" (
    "id" TEXT NOT NULL,
    "cache_key" TEXT NOT NULL,
    "course_slug" TEXT NOT NULL,
    "lesson_key" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "object_path" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_audio_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academy_audio_cache_cache_key_key"
  ON "academy_audio_cache"("cache_key");

CREATE UNIQUE INDEX "academy_audio_cache_object_path_key"
  ON "academy_audio_cache"("object_path");

CREATE INDEX "academy_audio_cache_course_slug_lesson_key_idx"
  ON "academy_audio_cache"("course_slug", "lesson_key");

ALTER TABLE "academy_audio_cache"
  ADD CONSTRAINT "academy_audio_cache_byte_size_positive"
  CHECK ("byte_size" > 0 AND "byte_size" <= 20971520);
