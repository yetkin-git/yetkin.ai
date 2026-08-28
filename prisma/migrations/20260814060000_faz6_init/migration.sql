-- Faz 6 — Pazaryeri dijital/hizmet + Hibe katalog (S4-A, S40-C).
-- Canlı migrate ayrı ops adımıdır (S42-A); bu SQL mühürdür.

-- CreateEnum
CREATE TYPE "MarketplaceProductKind" AS ENUM ('DIGITAL_GOOD', 'SERVICE');

-- CreateEnum
CREATE TYPE "MarketplaceProductStatus" AS ENUM ('LISTED', 'UNLISTED');

-- CreateEnum
CREATE TYPE "MarketplaceOrderStatus" AS ENUM ('SETTLED', 'AWAITING_DELIVERY', 'DELIVERED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "GrantAgency" AS ENUM ('KOSGEB', 'TUBITAK', 'OTHER');

-- CreateEnum
CREATE TYPE "GrantApplicantKind" AS ENUM ('INDIVIDUAL', 'CORPORATE', 'BOTH');

-- CreateEnum
CREATE TYPE "GrantApplicationStatus" AS ENUM ('GUIDE_OPEN', 'CHECKLIST_DONE');

-- CreateTable
CREATE TABLE "marketplace_products" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "kind" "MarketplaceProductKind" NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "status" "MarketplaceProductStatus" NOT NULL DEFAULT 'LISTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_orders" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "seller_user_id" TEXT NOT NULL,
    "product_title" TEXT NOT NULL,
    "kind" "MarketplaceProductKind" NOT NULL,
    "price_lock_id" TEXT NOT NULL,
    "escrow_hold_id" TEXT,
    "amount_minor" INTEGER NOT NULL,
    "hold_minor" INTEGER NOT NULL,
    "net_minor" INTEGER NOT NULL,
    "hold_bps" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "status" "MarketplaceOrderStatus" NOT NULL,
    "settled_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grant_programs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "agency" "GrantAgency" NOT NULL,
    "jurisdiction" TEXT NOT NULL DEFAULT 'TR',
    "applicant_kind" "GrantApplicantKind" NOT NULL,
    "sector_tags" TEXT[] NOT NULL,
    "requires_tax_id" BOOLEAN NOT NULL DEFAULT false,
    "application_guide" TEXT NOT NULL,
    "max_award_minor" INTEGER,
    "currency_code" CHAR(3) NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grant_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grant_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "company_hint" TEXT,
    "status" "GrantApplicationStatus" NOT NULL DEFAULT 'GUIDE_OPEN',
    "opened_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grant_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_products_slug_key" ON "marketplace_products"("slug");

-- CreateIndex
CREATE INDEX "marketplace_products_user_id_status_idx" ON "marketplace_products"("user_id", "status");

-- CreateIndex
CREATE INDEX "marketplace_products_status_created_at_idx" ON "marketplace_products"("status", "created_at");

-- CreateIndex
CREATE INDEX "marketplace_products_kind_status_idx" ON "marketplace_products"("kind", "status");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_orders_escrow_hold_id_key" ON "marketplace_orders"("escrow_hold_id");

-- CreateIndex
CREATE INDEX "marketplace_orders_user_id_status_idx" ON "marketplace_orders"("user_id", "status");

-- CreateIndex
CREATE INDEX "marketplace_orders_seller_user_id_status_idx" ON "marketplace_orders"("seller_user_id", "status");

-- CreateIndex
CREATE INDEX "marketplace_orders_product_id_idx" ON "marketplace_orders"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_orders_user_id_product_id_key" ON "marketplace_orders"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "grant_programs_slug_key" ON "grant_programs"("slug");

-- CreateIndex
CREATE INDEX "grant_programs_is_published_agency_idx" ON "grant_programs"("is_published", "agency");

-- CreateIndex
CREATE INDEX "grant_programs_jurisdiction_applicant_kind_idx" ON "grant_programs"("jurisdiction", "applicant_kind");

-- CreateIndex
CREATE INDEX "grant_applications_user_id_status_idx" ON "grant_applications"("user_id", "status");

-- CreateIndex
CREATE INDEX "grant_applications_program_id_idx" ON "grant_applications"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "grant_applications_user_id_program_id_key" ON "grant_applications"("user_id", "program_id");

-- AddForeignKey
ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_seller_user_id_fkey" FOREIGN KEY ("seller_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant_applications" ADD CONSTRAINT "grant_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant_applications" ADD CONSTRAINT "grant_applications_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "grant_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Faz 6 katalog tohumu. Satış fiyatı kod sabiti değildir (S11-A).
INSERT INTO "price_catalog_entries" (
  "id",
  "module_key",
  "unit_key",
  "unit_type",
  "amount_minor",
  "currency_code",
  "is_active",
  "min_minor",
  "max_minor",
  "description",
  "created_at",
  "updated_at"
)
VALUES
  (
    'cat_pazaryeri_listing_floor',
    'pazaryeri',
    'listing:floor',
    'MINOR',
    1000,
    'TRY',
    true,
    1000,
    2000000,
    'Pazaryeri dijital/hizmet ilan fiyat tabanı / tavanı (S4-A).',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("module_key", "unit_key") DO UPDATE
SET
  "amount_minor" = EXCLUDED."amount_minor",
  "currency_code" = EXCLUDED."currency_code",
  "is_active" = true,
  "min_minor" = EXCLUDED."min_minor",
  "max_minor" = EXCLUDED."max_minor",
  "description" = EXCLUDED."description",
  "updated_at" = CURRENT_TIMESTAMP;

-- TR v1 içerik paketi. Canlı devlet API iddiası yoktur.
INSERT INTO "grant_programs" (
  "id",
  "slug",
  "title",
  "summary",
  "agency",
  "jurisdiction",
  "applicant_kind",
  "sector_tags",
  "requires_tax_id",
  "application_guide",
  "max_award_minor",
  "currency_code",
  "is_published",
  "created_at",
  "updated_at"
)
VALUES
  (
    'gp_kosgeb_girisimcilik',
    'kosgeb-girisimcilik',
    'KOSGEB Girişimcilik Destek Programı',
    'Yeni kurulmuş KOBİ’ler için kuruluş ve ilk işletme giderlerine yönelik devlet desteği derlemesi.',
    'KOSGEB',
    'TR',
    'CORPORATE',
    ARRAY['girisim', 'kobi', 'imalat']::TEXT[],
    true,
    '1) KOSGEB e-devlet kaydı ve işletme sicili. 2) İş planı ve gider kalemleri. 3) Başvuru resmi KOSGEB kanalından yapılır; bu ekran rehberdir, canlı devlet API değildir.',
    50000000,
    'TRY',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gp_kosgeb_arge',
    'kosgeb-arge-inovasyon',
    'KOSGEB AR-GE ve İnovasyon Destek Programı',
    'KOBİ Ar-Ge ve inovasyon projelerine yönelik personel, makine ve danışmanlık kalemleri derlemesi.',
    'KOSGEB',
    'TR',
    'CORPORATE',
    ARRAY['arge', 'inovasyon', 'yazilim']::TEXT[],
    true,
    '1) Vergi levhası ve KOBİ beyannamesi. 2) Proje teknik özeti. 3) Resmi başvuru KOSGEB portalındadır; Yetkin.ai gönderim yapmaz.',
    80000000,
    'TRY',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gp_tubitak_1507',
    'tubitak-1507',
    'TÜBİTAK 1507 KOBİ Ar-Ge Başlangıç Destek Programı',
    'KOBİ ölçeğinde ilk Ar-Ge projeleri için TÜBİTAK 1507 derlemesi.',
    'TUBITAK',
    'TR',
    'CORPORATE',
    ARRAY['arge', 'kobi', 'teknoloji']::TEXT[],
    true,
    '1) PRODİS kaydı. 2) Proje öneri formu ve bütçe. 3) Başvuru TÜBİTAK kanallarındadır; bu katalog eşleştirme rehberidir.',
    120000000,
    'TRY',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gp_tubitak_1512',
    'tubitak-1512-bigg',
    'TÜBİTAK 1512 BİGG Girişimcilik Desteği',
    'Teknoloji tabanlı iş fikri olan birey ve şirketler için BİGG aşama derlemesi.',
    'TUBITAK',
    'TR',
    'BOTH',
    ARRAY['girisim', 'teknoloji', 'yazilim']::TEXT[],
    false,
    '1) İş fikri özeti ve kurucu özgeçmiş. 2) Uygulayıcı kuruluş çağrısı. 3) Resmi başvuru BİGG uygulayıcısınadır; Yetkin.ai devlet API’si değildir.',
    20000000,
    'TRY',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gp_tubitak_1501',
    'tubitak-1501',
    'TÜBİTAK 1501 Sanayi Ar-Ge Destek Programı',
    'Sanayi kuruluşlarının Ar-Ge projelerine yönelik 1501 derlemesi.',
    'TUBITAK',
    'TR',
    'CORPORATE',
    ARRAY['arge', 'sanayi']::TEXT[],
    true,
    '1) Kuruluş Ar-Ge kapasitesi. 2) Teknik iş paketleri. 3) Başvuru TÜBİTAK PRODİS üzerindendir.',
    250000000,
    'TRY',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gp_kosgeb_ihracat',
    'kosgeb-yurt-disi-pazar',
    'KOSGEB Yurt Dışı Pazar Destek Programı',
    'KOBİ ihracat ve yurt dışı pazarlama faaliyetlerine yönelik derleme.',
    'KOSGEB',
    'TR',
    'CORPORATE',
    ARRAY['ihracat', 'pazarlama', 'kobi']::TEXT[],
    true,
    '1) İhracat geçmişi veya hedef pazar özeti. 2) Faaliyet bütçesi. 3) Resmi başvuru KOSGEB’dedir.',
    40000000,
    'TRY',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
