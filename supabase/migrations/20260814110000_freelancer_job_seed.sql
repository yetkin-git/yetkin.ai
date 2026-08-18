-- [ADIM 11] Freelancer iş ilanı + bütçe/emanet katalog tohumu.
-- Sıra: prisma migrate deploy → Auth trigger → FORCE RLS → owner SELECT → katalog (40000)
--        → akademi tohumu (90000) → e-posta senkronu (100000) → bu dosya.
-- Yeni tablo yok. Sahte kullanıcı / bid / sözleşme / EscrowHold / vize / cüzdan bakiyesi yok.
-- client_id = platform hazine sentinel (SQL 10000). Auth login değildir; Super Admin değildir.
-- İlan tutarı freelancer_jobs.budget_minor satırındadır; katalog taban + hold bandı S11-A sicilidir.
-- catalog unit_key ↔ motor bant (FREELANCER_JOB_MIN/MAX, HOLD_BPS_*) mantıksal bağdır (FK yok).
-- Katalog amount_minor Super Admin PATCH (updated_by dolu) sonrası ops:migrate ile ezilmez.
-- OPEN ilan metni hâlâ tohumla hizalanır; fiyat/hold yalnız boş katalog satırında dolar.
-- freelancer_jobs sahiplik kolonu (client_id) vardır; PostgREST owner SELECT üretilir.
-- Prisma sunucu okuması postgres rolünden listOpenJobs ile vitrine basar.

INSERT INTO public.price_catalog_entries (
  id,
  module_key,
  unit_key,
  unit_type,
  amount_minor,
  currency_code,
  is_active,
  min_minor,
  max_minor,
  description,
  created_at,
  updated_at
)
VALUES
  (
    'cat_freelancer_job_posting_floor',
    'freelancer',
    'job-posting:floor',
    'MINOR',
    1000,
    'TRY',
    true,
    1000,
    2000000,
    'Freelancer mühürlü ilan bütçe tabanı / tavanı.',
    TIMESTAMP '2026-08-14 11:00:00',
    TIMESTAMP '2026-08-14 11:00:00'
  ),
  (
    'cat_freelancer_escrow_hold',
    'freelancer',
    'escrow:hold',
    'BPS',
    1000,
    'TRY',
    true,
    1000,
    1500,
    'Freelancer emanet platform hold bandı (1000–1500 bps).',
    TIMESTAMP '2026-08-14 11:00:00',
    TIMESTAMP '2026-08-14 11:00:00'
  )
ON CONFLICT (module_key, unit_key) DO UPDATE
SET
  unit_type = EXCLUDED.unit_type,
  amount_minor = CASE
    WHEN price_catalog_entries.updated_by IS NOT NULL
      THEN price_catalog_entries.amount_minor
    ELSE EXCLUDED.amount_minor
  END,
  updated_by = price_catalog_entries.updated_by,
  currency_code = EXCLUDED.currency_code,
  is_active = true,
  min_minor = EXCLUDED.min_minor,
  max_minor = EXCLUDED.max_minor,
  description = EXCLUDED.description,
  updated_at = CASE
    WHEN price_catalog_entries.updated_by IS NOT NULL
      THEN price_catalog_entries.updated_at
    ELSE now()
  END;

INSERT INTO public.freelancer_jobs (
  id,
  client_id,
  title,
  brief,
  budget_minor,
  currency_code,
  status,
  created_at,
  updated_at
)
VALUES
  (
    'fj_rail_icon_set',
    '00000000-0000-4000-8000-000000000001',
    'Yapay Zekâ Destekli İkon ve İllüstrasyon Seti Teslimi',
    $brief_fj_rail_icon_set$Alıcı: Yetkin Rail (platform kendi ihtiyacı; organik talep değildir). Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif Kariyer Vizesi (akademi sertifikası) ister. Kapsam: 16 adet tek renk SVG ikon (12 oda + 4 sığınak). 24px ızgara, 2px stroke, Quiet Luxury. Lucide, geist ve hazır set yok. Her ikon yerel SVG; dış CDN yok. Yaşayan illustratör tarzı taklidi yok. Teslim (DELIVERY): SVG kaynak + 256px PNG önizleme, ad kuralı is-anahtari.svg, her dosya SHA-256 listesi, kilitli prompt paketi (negatif kısıt, ızgara, palet). İki revizyon turu. Tur 3 yeni emanet farkı ister. Bütçe emanete teklif kabulünde kilitlenir. Sahte settlement yok.$brief_fj_rail_icon_set$,
    850000,
    'TRY',
    'OPEN',
    TIMESTAMP '2026-08-17 12:05:00',
    TIMESTAMP '2026-08-17 12:05:00'
  ),
  (
    'fj_rail_ql_banners',
    '00000000-0000-4000-8000-000000000001',
    'Rail Quiet Luxury Tanıtım Görselleri ve Banner Üretimi',
    $brief_fj_rail_ql_banners$Alıcı: Yetkin Rail. Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif Kariyer Vizesi ister. Bu iş platformun kendi tanıtım yüzeyi içindir; organik talep diye sunulmaz. Kapsam: üç ölçü — 1440x480 web üst şerit, 1080x1080 kare, 1200x630 paylaşım kartı. Metin: Öğrendiğini mühürle. Mührün kapıyı açsın. İşin emanette dursun. Stok insan fotoğrafı yok. Lucide ikon, geist font, dekoratif ilerleme çubuğu ve cam efekti düşer. Sistem tipi, yerel SVG, sükûnet. Teslim: PNG + kaynak prompt paketi, her dosya SHA-256, palet hex listesi. İki revizyon. Ölçülemeyen daha pop isteği kısıta çevrilmeden üretilmez. Bütçe kabulde EscrowHold ile kilitlenir.$brief_fj_rail_ql_banners$,
    750000,
    'TRY',
    'OPEN',
    TIMESTAMP '2026-08-17 12:04:00',
    TIMESTAMP '2026-08-17 12:04:00'
  ),
  (
    'fj_rail_academy_copy',
    '00000000-0000-4000-8000-000000000001',
    'Akademi Müfredat Özet Metinlerinin Düzenlenmesi',
    $brief_fj_rail_academy_copy$Alıcı: Yetkin Rail. Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif Kariyer Vizesi ister. İş, yz-icerik-gorsel-uretim kursunun beş ders özetini vatandaş diline çekmektir; sınav şıklarını sızdırmaz. Kapsam: Brief Okuma, Telif/Kullanım Hakları, Prompt Disiplini, Revizyon Yönetimi, Teslim Şartnamesi. Her özet 120-180 sözcük. SEN aksı: sen, siz değil. cüzdanınız, hesabınız, hoş geldiniz yasak. Satın al belge basmaz; baraj 70 ve SHA-256 mühür ders metninde doğru kalır. Teslim: tek Markdown, ders sırası tohumla aynı, SHA-256. İki revizyon. Yeni ders icat edilmez (CMS yok). Bütçe kabulde emanete kilitlenir.$brief_fj_rail_academy_copy$,
    350000,
    'TRY',
    'OPEN',
    TIMESTAMP '2026-08-17 12:03:00',
    TIMESTAMP '2026-08-17 12:03:00'
  ),
  (
    'fj_rail_devlabs_prompts',
    '00000000-0000-4000-8000-000000000001',
    'DevLabs Örnek Prompt Şablonları Dokümantasyonu',
    $brief_fj_rail_devlabs_prompts$Alıcı: Yetkin Rail. Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif Kariyer Vizesi ister. DevLabs linter'dır, runner değildir; exec yoktur. Şablon komutu tarif eder, sunucuda çalıştırmaz. Kapsam: 8 kilitli prompt paketi (hedef, negatif kısıt, kabul ölçütü, yasak girdi). Konular: ikon ızgarası, Quiet Luxury banner, SEN metin, hash listesi, brief çelişkisi, telif fail-closed, revizyon deltası, teslim checklist. Gizli anahtar, vatandaş kimliği ve bakiye prompta girmez. Teslim: tek Markdown, her şablon ayrı başlık, dosya SHA-256. İki revizyon. Exec örneği, çalıştır butonu ve sahte runner düşer. Bütçe kabulde emanete kilitlenir.$brief_fj_rail_devlabs_prompts$,
    400000,
    'TRY',
    'OPEN',
    TIMESTAMP '2026-08-17 12:02:00',
    TIMESTAMP '2026-08-17 12:02:00'
  ),
  (
    'fj_rail_seal_social',
    '00000000-0000-4000-8000-000000000001',
    'Mühürlü Kanıt Sosyal Medya Şablon Tasarımları',
    $brief_fj_rail_seal_social$Alıcı: Yetkin Rail. Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif Kariyer Vizesi ister. YetkinX sosyal ağ değildir; beğeni, takipçi, boost yok. Şablon, /academy/dogrula/[hash] kamu doğrulamasını taşır. userId sızmaz. Hash 64 hex görünür. Kapsam: 1080x1080 ve 1200x630, iki tema (açık/koyu). Cümle: Kanıt burada. Rail kendini tanıtmaz. Quiet Luxury: hazır ikon seti, geist, ilerleme çubuğu yok. Vanity metrik (görüntülenme, beğeni) yüzeye girmez. Teslim: PNG + katman notu + prompt paketi + her dosya SHA-256. İki revizyon. Filigran finalde yok. Bütçe kabulde emanete kilitlenir. Bu ilan Yetkin Rail kendi kanıt yüzeyi içindir.$brief_fj_rail_seal_social$,
    600000,
    'TRY',
    'OPEN',
    TIMESTAMP '2026-08-17 12:01:00',
    TIMESTAMP '2026-08-17 12:01:00'
  )
ON CONFLICT (id) DO UPDATE
SET
  client_id = EXCLUDED.client_id,
  title = EXCLUDED.title,
  brief = EXCLUDED.brief,
  budget_minor = EXCLUDED.budget_minor,
  currency_code = EXCLUDED.currency_code,
  status = 'OPEN',
  updated_at = now();

-- Yer tutucu teknik ilanlar ticari dikey değildir; OPEN vitrinden düşer.
-- AWARDED satıra dokunulmaz. Sahte bid / hold / nakit yok.
UPDATE public.freelancer_jobs
SET
  status = 'CANCELLED',
  updated_at = now()
WHERE id IN ('fj_rail_escrow_audit', 'fj_ray_sinyal_brief')
  AND status = 'OPEN';
