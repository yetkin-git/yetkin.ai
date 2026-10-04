-- Kapalı pilot: veli altı çocuk profili, anlatış notu, oyun puanı.
-- Çocuk e-postası yok. Ses kolonu yok. Cüzdan ve defter tablolarına bağ yok.

CREATE TABLE "junior_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "birth_year" INTEGER NOT NULL,
    "consent_at" TIMESTAMP(3) NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "junior_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "junior_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "lesson_key" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "praised" TEXT NOT NULL,
    "missing" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "xp_awarded" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "junior_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "junior_xp" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "badges_json" TEXT NOT NULL DEFAULT '[]',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "junior_xp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "junior_profiles_user_id_created_at_idx" ON "junior_profiles"("user_id", "created_at");

CREATE UNIQUE INDEX "junior_profiles_one_selected_per_user"
  ON "junior_profiles"("user_id")
  WHERE "selected" = true;

CREATE INDEX "junior_progress_profile_id_created_at_idx" ON "junior_progress"("profile_id", "created_at");
CREATE INDEX "junior_progress_user_id_created_at_idx" ON "junior_progress"("user_id", "created_at");

CREATE UNIQUE INDEX "junior_xp_profile_id_key" ON "junior_xp"("profile_id");
CREATE INDEX "junior_xp_user_id_idx" ON "junior_xp"("user_id");

ALTER TABLE "junior_profiles"
  ADD CONSTRAINT "junior_profiles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "junior_progress"
  ADD CONSTRAINT "junior_progress_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES "junior_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "junior_progress"
  ADD CONSTRAINT "junior_progress_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "junior_xp"
  ADD CONSTRAINT "junior_xp_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES "junior_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "junior_xp"
  ADD CONSTRAINT "junior_xp_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "junior_profiles"
  ADD CONSTRAINT "junior_profiles_shape"
  CHECK (
    "grade" BETWEEN 5 AND 12
    AND "birth_year" BETWEEN 1990 AND 2035
    AND char_length(btrim("nickname")) BETWEEN 2 AND 20
    AND "nickname" !~ '@'
  );

ALTER TABLE "junior_progress"
  ADD CONSTRAINT "junior_progress_shape"
  CHECK (
    "mode" IN ('speak', 'write', 'practice')
    AND "score" BETWEEN 0 AND 100
    AND "xp_awarded" BETWEEN 0 AND 100
    AND char_length("lesson_key") BETWEEN 1 AND 80
  );

ALTER TABLE "junior_xp"
  ADD CONSTRAINT "junior_xp_shape"
  CHECK ("points" BETWEEN 0 AND 20000);
