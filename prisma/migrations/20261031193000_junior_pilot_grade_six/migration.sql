-- Pilot sütunu 6. sınıftır. 5–12 bandı bu kolonda durmaz.
-- Takma ad, doğum yılı ve kapanış profili önceki junior_profiles_shape ile aynı kalır.

ALTER TABLE "junior_profiles" DROP CONSTRAINT "junior_profiles_shape";

ALTER TABLE "junior_profiles"
  ADD CONSTRAINT "junior_profiles_shape"
  CHECK (
    "grade" = 6
    AND char_length(btrim("nickname")) BETWEEN 2 AND 20
    AND "nickname" !~ '@'
    AND (
      "birth_year" BETWEEN 1990 AND 2035
      OR (
        "birth_year" IS NULL
        AND "nickname" = 'Kapalı'
        AND "selected" = false
        AND "active_consent_id" IS NULL
        AND cardinality("selected_electives") = 0
      )
    )
  );
