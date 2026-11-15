-- YetkinHibe Kasım 2026 katalog ekleri.
-- Eski beş çağrıya dokunulmaz. Yeni satırlar ayrı kimliktir; ON CONFLICT DO NOTHING.
-- Havuz ilan edilmemişse pool_amount_minor NULL kalır. Sıfır lira yazılmaz.
-- Saatler Türkiye sivil günüdür (UTC+3). Kurum saat vermediyse gün başı 00:00, gün sonu 23:59 alınır.
-- support_ratio_bps hibe oranıdır. Kapasite Geliştirme faiz puanı bu sütuna yazılmaz.

ALTER TABLE "yetkinhibe_grant_calls" ALTER COLUMN "pool_amount_minor" DROP NOT NULL;

ALTER TABLE "yetkinhibe_grant_calls" DROP CONSTRAINT "yetkinhibe_grant_calls_pool_nonneg";
ALTER TABLE "yetkinhibe_grant_calls" ADD CONSTRAINT "yetkinhibe_grant_calls_pool_nonneg"
  CHECK ("pool_amount_minor" IS NULL OR "pool_amount_minor" >= 0);

INSERT INTO "yetkinhibe_grant_calls" (
    "id", "source_key", "title", "summary", "pool_amount_minor", "min_support_minor", "max_support_minor",
    "support_ratio_bps", "application_opens_at", "application_deadline", "eligibility_json",
    "required_documents", "tags", "official_info_url", "source_verified_at", "is_published", "data_version", "updated_at"
) VALUES
(
    'kosgeb-is-gelistirme-2026-3', 'KOSGEB',
    'KOSGEB Girişimci Destek Programı İş Geliştirme Desteği 2026/3',
    '0-3 yaş aralığındaki işletmelere personel, makine, teçhizat, kalıp, yazılım ve hizmet alımı için geri ödemeli destek. Temel üst limit 2.250.000 TL, oran yüzde 80. Genç, kadın, engelli, gazi veya birinci derece şehit yakını girişimcide limite 250.000 TL eklenir. Teknogirişim rozetinde yıl şartı aranmaz; katalogdaki yaş bandı 0-3 olarak durur. Kapsam imalat bölümü ile 61, 62, 63 ve 72 kodlarıdır. Kayıtlı NACE ön ekleri ürünün seçebildiği gruplardır. 2026 üçüncü dönem başvurusu 12-31 Ekim 2026 tarihleri arasındadır. Dönem havuzu ve alt limit ilan edilmedi.',
    NULL, 0, 225000000, 8000,
    '2026-10-11T21:00:00Z', '2026-10-31T20:59:00Z',
    '{"eligibleSectorCodes":null,"minEmployeeCount":null,"maxEmployeeCount":null,"minCompanyAgeYears":0,"maxCompanyAgeYears":3,"requiresRdActivity":false,"requiresExportActivity":false,"requiresKobiStatus":false,"requiresPatentOrUtilityModel":false,"eligibleRegionCodes":null,"audiences":["yeni_girisimci"],"investmentFocus":["makine_techizat","yazilim_dijital"],"nacePrefixes":["10","13","25","28","62","72"]}'::jsonb,
    ARRAY['Proje başvuru formu', 'Proje bilgi dokümanı']::TEXT[],
    ARRAY['girisimci', 'makine', 'yazilim']::TEXT[],
    'https://www.kosgeb.gov.tr/site/tr/genel/detay/9499/girisimci-destek-programi-yenilendi-girisimcilere-yeni-destek-modeli',
    '2026-11-15T09:00:00Z', true, 1, CURRENT_TIMESTAMP
),
(
    'kosgeb-kapasite-gelistirme-2026-3', 'KOSGEB',
    'KOSGEB Kapasite Geliştirme Destek Programı 2026/3',
    'Küçük ve orta ölçekli, hızlı büyüyen işletmelere ölçek ve dijital dönüşüm için kredi. Alt limit 1.000.000 TL, genel üst limit 20.000.000 TL. Savunma, havacılık ve uzay tedarikçi iş birliğinde üst limit 30.000.000 TL olarak ilan edilmiştir; bu tutar tamsayı sütununa sığmadığı için yazılmadı. Destek hibe oranı değildir: faiz veya kâr payına geri ödemesiz 20 puandır. Oran sütunu bu yüzden 0 durur. Mikro işletme başvuramaz. 2026 üçüncü dönem 22 Ağustos-15 Eylül 2026 arasındadır. Dönem havuzu ilan edilmedi.',
    NULL, 100000000, 2000000000, 0,
    '2026-08-21T21:00:00Z', '2026-09-15T20:59:00Z',
    '{"eligibleSectorCodes":null,"minEmployeeCount":10,"maxEmployeeCount":250,"minCompanyAgeYears":null,"maxCompanyAgeYears":null,"requiresRdActivity":false,"requiresExportActivity":false,"requiresKobiStatus":true,"requiresPatentOrUtilityModel":false,"eligibleRegionCodes":null,"audiences":["mevcut_kobi"],"investmentFocus":["makine_techizat","yazilim_dijital"],"nacePrefixes":["10","13","25","28","62","72"]}'::jsonb,
    ARRAY['Proje başvuru formu', 'İmalatta yalın olgunluk değerlendirme raporu', 'Dijital dönüşümde olgunluk değerlendirme raporu']::TEXT[],
    ARRAY['kobi', 'kapasite', 'kredi']::TEXT[],
    'https://www.kosgeb.gov.tr/site/tr/genel/detay/9200/kapasite-gelistirme-destek-programi',
    '2026-11-15T09:00:00Z', true, 1, CURRENT_TIMESTAMP
),
(
    'tubitak-1501-2026-2', 'TUBITAK',
    'TÜBİTAK 1501 Sanayi Ar-Ge Destek Programı 2026/2',
    'Sanayi Ar-Ge projelerine hibe. Desteklenen ilk beş projede oran yüzde 75, altıncı ve sonrakilerde yüzde 60. Sütundaki oran ilk beş proje içindir. Proje başına katkı en çok 20.000.000 TL. Başvuru 20 Temmuz 2026 saat 00.00 ile 26 Ekim 2026 saat 23.59 arasındadır. Havuz ve alt limit ilan edilmedi. Duyuru KOBİ ölçeğini anar; büyük işletme yasağı çağrı metninde ayrıca kapanmadığı için kitle kısıtı konmadı.',
    NULL, 0, 2000000000, 7500,
    '2026-07-19T21:00:00Z', '2026-10-26T20:59:00Z',
    '{"eligibleSectorCodes":null,"minEmployeeCount":null,"maxEmployeeCount":null,"minCompanyAgeYears":null,"maxCompanyAgeYears":null,"requiresRdActivity":true,"requiresExportActivity":false,"requiresKobiStatus":false,"requiresPatentOrUtilityModel":false,"eligibleRegionCodes":null,"audiences":null,"investmentFocus":["arge"],"nacePrefixes":null}'::jsonb,
    ARRAY['Kuruluş bazlı ön kayıt', 'PRODİS proje önerisi']::TEXT[],
    ARRAY['ar-ge', 'sanayi']::TEXT[],
    'https://tubitak.gov.tr/tr/duyuru/1501-sanayi-ar-ge-destek-programi-ve-1507-kobi-ar-ge-baslangic-destek-programi-2026-yili-2-cagrilari-acildi',
    '2026-11-15T09:00:00Z', true, 1, CURRENT_TIMESTAMP
),
-- 1507 kurum şartı KOBİ'dir. Ürün kilidi yalnız mevcut_kobi kitlesini geçirir; başlangıç çağrısı
-- genç işletmeyi de kapsasın diye requiresKobiStatus false ve her iki kitle yazıldı.
(
    'tubitak-1507-2026-2', 'TUBITAK',
    'TÜBİTAK 1507 KOBİ Ar-Ge Başlangıç Destek Programı 2026/2',
    'KOBİ Ar-Ge başlangıç projelerine geri ödemesiz hibe. Oran yüzde 75. Proje bütçesi en çok 3.500.000 TL; azami hibe 2.625.000 TL. Başvuru 20 Temmuz 2026 saat 00.00 ile 25 Kasım 2026 saat 23.59 arasındadır. Bu kapanış 9 Kasım 2026 uzatmasıdır. Havuz ve alt limit ilan edilmedi.',
    NULL, 0, 262500000, 7500,
    '2026-07-19T21:00:00Z', '2026-11-25T20:59:00Z',
    '{"eligibleSectorCodes":null,"minEmployeeCount":null,"maxEmployeeCount":null,"minCompanyAgeYears":null,"maxCompanyAgeYears":null,"requiresRdActivity":true,"requiresExportActivity":false,"requiresKobiStatus":false,"requiresPatentOrUtilityModel":false,"eligibleRegionCodes":null,"audiences":["yeni_girisimci","mevcut_kobi"],"investmentFocus":["arge"],"nacePrefixes":null}'::jsonb,
    ARRAY['Kuruluş bazlı ön kayıt', 'PRODİS proje önerisi']::TEXT[],
    ARRAY['ar-ge', 'kobi']::TEXT[],
    'https://tubitak.gov.tr/tr/duyuru/1507-kobi-ar-ge-baslangic-destek-programi-ve-1707-siparise-dayali-ar-ge-projeleri-icin-kobi-destekleme-programi-2026-yili-cagrilarinin-suresi-uzatildi',
    '2026-11-15T09:00:00Z', true, 1, CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
