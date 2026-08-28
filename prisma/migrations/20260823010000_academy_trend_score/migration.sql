-- FAZ 2.10: Dinamik TrendEndeks (TrendScore) — academy_courses vitrin sıralaması.
ALTER TABLE "academy_courses"
  ADD COLUMN "global_rank" INTEGER NOT NULL DEFAULT 99,
  ADD COLUMN "local_rank" INTEGER NOT NULL DEFAULT 99,
  ADD COLUMN "trend_score" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE INDEX "academy_courses_is_published_trend_score_idx"
  ON "academy_courses"("is_published", "trend_score");
