-- YetkinHibe F2 — hibe çağrı kataloğu (kaynak + çağrı), RLS mühürü ve süresi dolmuş tohum.
-- Oda kapalıdır (D-9). PostgREST'e açık değildir: sahiplik kolonu yoktur, rls_deny_unscoped SELECT USING (false).
-- Yazma yalnız Prisma (BYPASSRLS). Durum (UPCOMING/ACTIVE/CLOSING_SOON/CLOSED) saklanmaz; okuma anında hesaplanır.
-- Tohum: muze lib/hibe/grant-catalog.ts (yalnız referans). Beş çağrının son tarihleri geçmiştir ve
-- resmî kaynakla doğrulanmamıştır: source_verified_at NULL. Süresi dolmuş çağrılar aktif sayılmaz (A5).

-- CreateTable
CREATE TABLE "yetkinhibe_grant_sources" (
    "key" VARCHAR(40) NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "official_url" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "yetkinhibe_grant_sources_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "yetkinhibe_grant_calls" (
    "id" VARCHAR(120) NOT NULL,
    "source_key" VARCHAR(40) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "summary" VARCHAR(1000) NOT NULL,
    "pool_amount_minor" BIGINT NOT NULL,
    "min_support_minor" INTEGER NOT NULL,
    "max_support_minor" INTEGER NOT NULL,
    "support_ratio_bps" INTEGER NOT NULL,
    "application_opens_at" TIMESTAMPTZ(6) NOT NULL,
    "application_deadline" TIMESTAMPTZ(6) NOT NULL,
    "eligibility_json" JSONB NOT NULL,
    "required_documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "official_info_url" VARCHAR(500) NOT NULL,
    "source_verified_at" TIMESTAMPTZ(6),
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "data_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "yetkinhibe_grant_calls_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "yetkinhibe_grant_calls_pool_nonneg"
      CHECK ("pool_amount_minor" >= 0),
    CONSTRAINT "yetkinhibe_grant_calls_support_range"
      CHECK ("min_support_minor" >= 0 AND "min_support_minor" <= "max_support_minor"),
    CONSTRAINT "yetkinhibe_grant_calls_ratio_range"
      CHECK ("support_ratio_bps" BETWEEN 0 AND 10000),
    CONSTRAINT "yetkinhibe_grant_calls_window_order"
      CHECK ("application_deadline" >= "application_opens_at")
);

-- CreateIndex
CREATE INDEX "yetkinhibe_grant_calls_is_published_application_deadline_idx" ON "yetkinhibe_grant_calls"("is_published", "application_deadline");

-- AddForeignKey
ALTER TABLE "yetkinhibe_grant_calls" ADD CONSTRAINT "yetkinhibe_grant_calls_source_key_fkey" FOREIGN KEY ("source_key") REFERENCES "yetkinhibe_grant_sources"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Tohum: kaynaklar (idempotent)
INSERT INTO "yetkinhibe_grant_sources" ("key", "label", "official_url", "updated_at") VALUES
  ('KOSGEB', 'KOSGEB', 'https://www.kosgeb.gov.tr/', CURRENT_TIMESTAMP),
  ('TUBITAK', 'TÜBİTAK', 'https://www.tubitak.gov.tr/', CURRENT_TIMESTAMP),
  ('TICARET_BAKANLIGI', 'Ticaret Bakanlığı', 'https://ticaret.gov.tr/', CURRENT_TIMESTAMP),
  ('KALKINMA_AJANSI', 'Kalkınma Ajansı', 'https://www.sanayi.gov.tr/kalkinma-ajanslari', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- Tohum: süresi dolmuş beş çağrı (idempotent). Kimlikler ve tutarlar muze katalogdan kuruşa çevrilmiştir.
INSERT INTO "yetkinhibe_grant_calls" (
    "id", "source_key", "title", "summary", "pool_amount_minor", "min_support_minor", "max_support_minor",
    "support_ratio_bps", "application_opens_at", "application_deadline", "eligibility_json",
    "required_documents", "tags", "official_info_url", "source_verified_at", "is_published", "data_version", "updated_at"
) VALUES
(
    'kosgeb-arge-inovasyon-2026', 'KOSGEB',
    'KOSGEB Ar-Ge, İnovasyon ve Endüstriyel Uygulama Destek Programı',
    'Ürün/süreç yeniliği geliştiren KOBİ''lere personel, alet-teçhizat ve hizmet alımı desteği.',
    250000000000, 5000000, 75000000, 7500,
    '2026-06-01T00:00:00Z', '2026-09-30T23:59:59Z',
    '{"eligibleSectorCodes":null,"minEmployeeCount":1,"maxEmployeeCount":250,"minCompanyAgeYears":null,"maxCompanyAgeYears":null,"requiresRdActivity":true,"requiresExportActivity":false,"requiresKobiStatus":true,"requiresPatentOrUtilityModel":false}'::jsonb,
    ARRAY['Proje başvuru formu', 'İş planı ve iş paketleri', 'Bütçe/adam-ay tablosu', 'KOBİ beyannamesi']::TEXT[],
    ARRAY['ar-ge', 'inovasyon', 'kobi', 'uretim']::TEXT[],
    'https://www.kosgeb.gov.tr/', NULL, true, 1, CURRENT_TIMESTAMP
),
(
    'tubitak-1501-sanayi-arge', 'TUBITAK',
    'TÜBİTAK 1501 Sanayi Ar-Ge Projeleri Destekleme Programı',
    'Firmaların teknoloji ve yenilik odaklı Ar-Ge projelerine hibe desteği; TRL 3-7 aralığı.',
    600000000000, 20000000, 300000000, 6000,
    '2026-05-15T00:00:00Z', '2026-08-15T23:59:59Z',
    '{"eligibleSectorCodes":null,"minEmployeeCount":1,"maxEmployeeCount":null,"minCompanyAgeYears":1,"maxCompanyAgeYears":null,"requiresRdActivity":true,"requiresExportActivity":false,"requiresKobiStatus":false,"requiresPatentOrUtilityModel":false}'::jsonb,
    ARRAY['Proje öneri formu (PRODİS)', 'Teknik ve mali rapor şablonu', 'Gantt/iş paketi planı', 'Personel adam-ay çizelgesi']::TEXT[],
    ARRAY['ar-ge', 'teknoloji', 'trl', 'sanayi']::TEXT[],
    'https://www.tubitak.gov.tr/', NULL, true, 1, CURRENT_TIMESTAMP
),
(
    'ticaret-bakanligi-turquality-2026', 'TICARET_BAKANLIGI',
    'Ticaret Bakanlığı Turquality / Pazara Girme Destekleri',
    'İhracat kapasitesini artırmak isteyen markalara marka konumlandırma ve pazara girme desteği.',
    180000000000, 10000000, 150000000, 5000,
    '2026-07-01T00:00:00Z', '2026-10-31T23:59:59Z',
    '{"eligibleSectorCodes":null,"minEmployeeCount":5,"maxEmployeeCount":null,"minCompanyAgeYears":2,"maxCompanyAgeYears":null,"requiresRdActivity":false,"requiresExportActivity":true,"requiresKobiStatus":false,"requiresPatentOrUtilityModel":false}'::jsonb,
    ARRAY['İhracat performans beyanı', 'Marka tescil belgesi', 'Pazara girme stratejisi raporu']::TEXT[],
    ARRAY['ihracat', 'marka', 'pazara-girme']::TEXT[],
    'https://ticaret.gov.tr/', NULL, true, 1, CURRENT_TIMESTAMP
),
(
    'kalkinma-ajansi-mali-destek-2026', 'KALKINMA_AJANSI',
    'Kalkınma Ajansı Bölgesel Mali Destek Programı',
    'Bölgesel kalkınma önceliklerine uygun üretim ve istihdam projelerine hibe desteği.',
    75000000000, 2500000, 40000000, 5000,
    '2026-04-01T00:00:00Z', '2026-08-01T23:59:59Z',
    '{"eligibleSectorCodes":["uretim","tarim","turizm"],"minEmployeeCount":1,"maxEmployeeCount":150,"minCompanyAgeYears":null,"maxCompanyAgeYears":null,"requiresRdActivity":false,"requiresExportActivity":false,"requiresKobiStatus":true,"requiresPatentOrUtilityModel":false}'::jsonb,
    ARRAY['Proje başvuru formu (KAYS)', 'Bölgesel etki analizi', 'Bütçe tablosu']::TEXT[],
    ARRAY['bolgesel', 'istihdam', 'uretim']::TEXT[],
    'https://www.sanayi.gov.tr/kalkinma-ajanslari', NULL, true, 1, CURRENT_TIMESTAMP
),
(
    'kosgeb-kobigel-2026', 'KOSGEB',
    'KOSGEB KOBİGEL — KOBİ Gelişim Destek Programı',
    'Üretim, dijitalleşme ve yeşil dönüşüm alanlarında KOBİ''lerin rekabet gücünü artıran destek.',
    120000000000, 3000000, 30000000, 7000,
    '2026-03-01T00:00:00Z', '2026-08-31T23:59:59Z',
    '{"eligibleSectorCodes":null,"minEmployeeCount":1,"maxEmployeeCount":250,"minCompanyAgeYears":null,"maxCompanyAgeYears":null,"requiresRdActivity":false,"requiresExportActivity":false,"requiresKobiStatus":true,"requiresPatentOrUtilityModel":false}'::jsonb,
    ARRAY['Proje başvuru formu', 'KOBİ beyannamesi', 'Dijitalleşme/yeşil dönüşüm eylem planı']::TEXT[],
    ARRAY['kobi', 'dijitallesme', 'yesil-donusum']::TEXT[],
    'https://www.kosgeb.gov.tr/', NULL, true, 1, CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- RLS (Faz 1.1 sözleşmesi). Olay tetikleyicisi bu tabloları zaten mühürler; burada açıkça da uygulanır.
ALTER TABLE "yetkinhibe_grant_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "yetkinhibe_grant_sources" FORCE ROW LEVEL SECURITY;
ALTER TABLE "yetkinhibe_grant_calls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "yetkinhibe_grant_calls" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_deny_unscoped" ON "yetkinhibe_grant_sources";
CREATE POLICY "rls_deny_unscoped" ON "yetkinhibe_grant_sources" FOR SELECT TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "rls_deny_unscoped" ON "yetkinhibe_grant_calls";
CREATE POLICY "rls_deny_unscoped" ON "yetkinhibe_grant_calls" FOR SELECT TO anon, authenticated USING (false);
