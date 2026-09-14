-- B2C huni Adım 6: /vize/[id] kart gösterimi. Kişisel veri yok.
-- 1–5 adımlar için FunnelEvent tablosu açılmaz.
-- FORCE RLS event trigger CREATE TABLE sonrası ENABLE+FORCE basar.
-- PostgREST yazma politikası yok; Prisma BYPASSRLS yazar.

CREATE TABLE "funnel_daily_counters" (
    "day" DATE NOT NULL,
    "step" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "funnel_daily_counters_pkey" PRIMARY KEY ("day","step")
);
