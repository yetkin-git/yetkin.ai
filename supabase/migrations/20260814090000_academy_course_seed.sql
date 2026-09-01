-- [ADIM 8] Akademi kurs + müfredat sınavı + kurs birim fiyatı tohumu.
-- Sıra: prisma migrate deploy → Auth trigger → FORCE RLS → owner SELECT → katalog (40000) → bu dosya.
-- Yeni tablo yok. Sahte kullanıcı / purchase / certificate / visa yok.
-- Kurs tutarı academy_courses satırında değildir; PriceCatalogEntry (S11-A).
-- catalog_unit_key ↔ price_catalog_entries.unit_key mantıksal bağdır (FK yok).
-- Kurs fiyatı Super Admin PATCH ile yazıldıysa (updated_by dolu) amount_minor ezilmez.
-- Müfredat JSON'u hâlâ tohumla hizalanır; katalog tutarı yalnız boş satırda dolar.
-- Sahiplik kolonu yok: academy_courses / academy_exams PostgREST fail-closed (politika üretilmez).
-- Kaynak sicil: lib/academy/seed.ts — 20 büyüme SKU.
-- HARD RESET: eski RAIL / jenerik tohumlar FK sırasıyla DELETE (kurs + bağımlılar + katalog).

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
    'cat_academy_course_ai_agent_temel',
    'academy',
    'course:ai-agent-temel',
    'MINOR',
    129000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — AI Agent Mimarlığı ve Otonom Sistemlere Giriş (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_ai_agent_orta',
    'academy',
    'course:ai-agent-orta',
    'MINOR',
    159000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Çoklu AI Agent Sistemleri ve RAG Mimarisi (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_ai_agent_ileri',
    'academy',
    'course:ai-agent-ileri',
    'MINOR',
    199000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — İleri Düzey AI Agent Mimarisi, LangGraph ve Otonom Sistem Güvenliği (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_python_temel',
    'academy',
    'course:python-temel',
    'MINOR',
    89000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Python ile Programlama ve Problem Çözme (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_python_orta',
    'academy',
    'course:python-orta',
    'MINOR',
    119000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Python ile Nesne Yönelimli Programlama ve Veri İşleme (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_python_ileri',
    'academy',
    'course:python-ileri',
    'MINOR',
    149000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Python ile İleri Düzey Mimari, Asenkron Programlama ve Performans (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_fullstack_temel',
    'academy',
    'course:fullstack-temel',
    'MINOR',
    119000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Modern Web Geliştirme Temelleri (HTML, CSS, JavaScript ve TypeScript) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_fullstack_orta',
    'academy',
    'course:fullstack-orta',
    'MINOR',
    149000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — React, Node.js ve PostgreSQL ile Modern Uygulama Geliştirme (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_fullstack_ileri',
    'academy',
    'course:fullstack-ileri',
    'MINOR',
    199000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — İleri Düzey Full-Stack Mimari: Next.js App Router, Microservices, Docker ve CI/CD (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_security_temel',
    'academy',
    'course:security-temel',
    'MINOR',
    129000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Siber Güvenlik Temelleri, Ağ Güvenliği ve AÇS (OWASP) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_security_orta',
    'academy',
    'course:security-orta',
    'MINOR',
    159000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Uygulamalı Sızma Testi, Ağ Analizi ve Web Zafiyet Mimarisi (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_security_ileri',
    'academy',
    'course:security-ileri',
    'MINOR',
    199000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — İleri Düzey DevSecOps, Bulut Güvenliği ve Olay Müdahalesi (Incident Response) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_ai_temel',
    'academy',
    'course:ai-temel',
    'MINOR',
    99000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Yapay Zekâ ve Veri Analizi (Prompt ve Veri Bilimi) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_ux_temel',
    'academy',
    'course:ux-temel',
    'MINOR',
    99000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Dijital Ürün Tasarımı (UI/UX ve Figma Masterclass) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_excel_masterclass',
    'academy',
    'course:excel-masterclass',
    'MINOR',
    99000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Sıfırdan Uygulamalı Excel ve Yapay Zekâ Destekli Veri Analizi Masterclass (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_google_ads_masterclass',
    'academy',
    'course:google-ads-masterclass',
    'MINOR',
    109000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — A’dan Z’ye Google Ads ve Arama Motoru Pazarlaması Masterclass (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_meta_ads_masterclass',
    'academy',
    'course:meta-ads-masterclass',
    'MINOR',
    109000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Meta Business Suite ile Instagram ve Facebook Reklamcılığı Masterclass (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_eticaret_masterclass',
    'academy',
    'course:eticaret-masterclass',
    'MINOR',
    99000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Sıfırdan E-Ticaret ve Pazar Yeri Yönetimi Masterclass (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_canva_masterclass',
    'academy',
    'course:canva-masterclass',
    'MINOR',
    69000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Canva ve Yapay Zekâ İle Dijital Tasarım Masterclass (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_linkedin_masterclass',
    'academy',
    'course:linkedin-masterclass',
    'MINOR',
    79000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — LinkedIn İle Profesyonel Marka İnşası ve B2B Müşteri Bulma Masterclass (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  )
ON CONFLICT (module_key, unit_key) DO UPDATE
SET
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

INSERT INTO public.academy_courses (
  id,
  slug,
  title,
  summary,
  catalog_unit_key,
  global_rank,
  local_rank,
  trend_score,
  is_published,
  created_at,
  updated_at
)
VALUES
  (
    'ac_ai_agent_temel',
    'ai-agent-temel',
    'AI Agent Mimarlığı ve Otonom Sistemlere Giriş',
    'Büyük Dil Modeli ile otonom ajan farkı, yapılandırılmış çıktı, araç çağrısı, hafıza ve ReAct döngüsü; hava ve not ajanı.',
    'course:ai-agent-temel',
    1,
    1,
    1,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_ai_agent_orta',
    'ai-agent-orta',
    'Çoklu AI Agent Sistemleri ve RAG Mimarisi',
    'RAG ve gömme, vektör sorgu, araştırmacı+yazar pası, ortak durum ve insan onay kapısı; çift ajanlı rapor ekibi.',
    'course:ai-agent-orta',
    1,
    2,
    2,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_ai_agent_ileri',
    'ai-agent-ileri',
    'İleri Düzey AI Agent Mimarisi, LangGraph ve Otonom Sistem Güvenliği',
    'Durum grafiği, yansıma onarımı, güvenlik korkuluğu, eval barajı ve kuyruk işçisi; üretim ajan odası.',
    'course:ai-agent-ileri',
    1,
    3,
    3,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_python_temel',
    'python-temel',
    'Python ile Programlama ve Problem Çözme',
    'Python ile programlamanın temelleri, kontrol akışları, fonksiyonlar ve veri yapıları.',
    'course:python-temel',
    1,
    1,
    1,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_python_orta',
    'python-orta',
    'Python ile Nesne Yönelimli Programlama ve Veri İşleme',
    'Nesne yönelimli Python: sınıf, miras, JSON, hata kapısı ve REST yanıtını dosyaya mühürleme.',
    'course:python-orta',
    1,
    2,
    2,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_python_ileri',
    'python-ileri',
    'Python ile İleri Düzey Mimari, Asenkron Programlama ve Performans',
    'Decorator, üreteç, asyncio, iş parçacığı/süreç ve metaclass: bellek dostu asenkron işleme motoru.',
    'course:python-ileri',
    1,
    3,
    3,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_fullstack_temel',
    'fullstack-temel',
    'Modern Web Geliştirme Temelleri (HTML, CSS, JavaScript ve TypeScript)',
    'HTML, CSS, JavaScript ve TypeScript: HTTP/DNS fişi, semantik iskelet, DOM, fetch ve tip sözleşmesi.',
    'course:fullstack-temel',
    1,
    1,
    1,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_fullstack_orta',
    'fullstack-orta',
    'React, Node.js ve PostgreSQL ile Modern Uygulama Geliştirme',
    'React bileşen ve durum, Express REST, Prisma/PostgreSQL ve JWT ara katmanı; Fail-closed görev takip uygulaması.',
    'course:fullstack-orta',
    1,
    2,
    2,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_fullstack_ileri',
    'fullstack-ileri',
    'İleri Düzey Full-Stack Mimari: Next.js App Router, Microservices, Docker ve CI/CD',
    'App Router ve RSC, mikroservis ve olay fişi, Redis önbelleği, Docker Compose sağlığı ve GitHub Actions CI/CD.',
    'course:fullstack-ileri',
    1,
    3,
    3,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_security_temel',
    'security-temel',
    'Siber Güvenlik Temelleri, Ağ Güvenliği ve AÇS (OWASP)',
    'CIA üçlüsü, TCP/IP ve port kapısı, OWASP web zafiyeti, hash/MFA ve güvenlik duvarı etiği; Fail-closed kapatma.',
    'course:security-temel',
    1,
    1,
    1,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_security_orta',
    'security-orta',
    'Uygulamalı Sızma Testi, Ağ Analizi ve Web Zafiyet Mimarisi',
    'Sızma testi metodolojisi, OSINT keşif, lab ağ envanteri, IDOR/SSRF, OAuth2/JWT ve SAST; Fail-closed kapatma.',
    'course:security-orta',
    1,
    2,
    2,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_security_ileri',
    'security-ileri',
    'İleri Düzey DevSecOps, Bulut Güvenliği ve Olay Müdahalesi (Incident Response)',
    'DevSecOps boru hattı, bulut IAM/KMS, olay müdahalesi, SIEM/SOC ve Sıfır Güven; Fail-closed kapatma.',
    'course:security-ileri',
    1,
    3,
    3,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_ai_temel',
    'ai-temel',
    'Yapay Zekâ ve Veri Analizi (Prompt ve Veri Bilimi)',
    'Prompt mühendisliği ve veri bilimi: tarif katmanları, yapılandırılmış çıktı, tablo temizliği ve kaynaklı cevap.',
    'course:ai-temel',
    1,
    3,
    3,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_ux_temel',
    'ux-temel',
    'Dijital Ürün Tasarımı (UI/UX ve Figma Masterclass)',
    'UI/UX ve Figma: araştırma, tel çerçeve, jeton, prototip ve teslim.',
    'course:ux-temel',
    1,
    4,
    4,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_excel_masterclass',
    'excel-masterclass',
    'Sıfırdan Uygulamalı Excel ve Yapay Zekâ Destekli Veri Analizi Masterclass',
    'Hücre mimarisi, XLOOKUP, özet tablo, veri temizliği, Copilot/VBA disiplini ve satış dashboard’u; Fail-closed kapatma.',
    'course:excel-masterclass',
    1,
    1,
    1,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_google_ads_masterclass',
    'google-ads-masterclass',
    'A’dan Z’ye Google Ads ve Arama Motoru Pazarlaması Masterclass',
    'Hesap mimarisi, eşleme türü, arama/görüntülü ağ, GTM dönüşüm takibi, kalite puanı ve kampanya teslimi; Fail-closed kapatma.',
    'course:google-ads-masterclass',
    1,
    2,
    2,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_meta_ads_masterclass',
    'meta-ads-masterclass',
    'Meta Business Suite ile Instagram ve Facebook Reklamcılığı Masterclass',
    'Business Suite, özel/benzer kitle, Reels/kreatif, piksel ve CAPI, CBO/ABO-ROAS ve satış hunisi; Fail-closed kapatma.',
    'course:meta-ads-masterclass',
    1,
    3,
    3,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_eticaret_masterclass',
    'eticaret-masterclass',
    'Sıfırdan E-Ticaret ve Pazar Yeri Yönetimi Masterclass',
    'Pazar yeri mantığı, Trendyol/Hepsiburada mağaza, liste SEO, stok/fiyat senkronu ve kargo/iade; Fail-closed kapatma.',
    'course:eticaret-masterclass',
    1,
    4,
    4,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_canva_masterclass',
    'canva-masterclass',
    'Canva ve Yapay Zekâ İle Dijital Tasarım Masterclass',
    'Marka kiti ve tipo, sosyal kare/Reels, sunum/broşür, Magic Studio disiplini ve baskı/dijital teslim; Fail-closed kapatma.',
    'course:canva-masterclass',
    1,
    5,
    5,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_linkedin_masterclass',
    'linkedin-masterclass',
    'LinkedIn İle Profesyonel Marka İnşası ve B2B Müşteri Bulma Masterclass',
    'All-Star profil, algoritma içeriği, Sales Navigator ICP, cold outreach ve bireysel konum; Fail-closed kapatma.',
    'course:linkedin-masterclass',
    1,
    6,
    6,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  )
ON CONFLICT (id) DO UPDATE
SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  catalog_unit_key = EXCLUDED.catalog_unit_key,
  global_rank = EXCLUDED.global_rank,
  local_rank = EXCLUDED.local_rank,
  trend_score = EXCLUDED.trend_score,
  is_published = true,
  updated_at = now();

INSERT INTO public.academy_exams (
  id,
  course_id,
  title,
  pass_score,
  questions_json,
  created_at,
  updated_at
)
VALUES
  (
    'exam_ai_agent_temel',
    'ac_ai_agent_temel',
    'AI Agent Mimarlığı ve Otonom Sistemlere Giriş müfredat sınavı',
    70,
    $exam_ai_agent_temel$[{"id":"q_pow_ai-agent-temel-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-temel-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-temel-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-temel-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-temel-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-temel-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_agt1_1","prompt":"Büyük Dil Modeli (LLM) ile otonom ajan farkı nedir?","choices":["Aynıdır; ikisi de yalnız metin üretir","LLM metin üretir; ajan araç çağırıp iş bitirebilir","Ajan eğitim kesitini günceller","LLM her zaman güncel stok okur"],"correctIndex":1},{"id":"q_agt1_2","prompt":"Araç yokken Fail-closed (Hata Anında Kapalı) ne yapar?","choices":["Muhtemel derece uydurur","İşlemi durdurur; orta değer basmaz","Önceki sohbeti stok sanır","Sessizce 0 basar"],"correctIndex":1},{"id":"q_agt1_3","prompt":"Halüsinasyon (uydurma) neden doğar?","choices":["Model her zaman veritabanına bakıyor","Dış dünya kapalıyken model yine cümle basar","Araç çağrısı zorunludur","JSON şeması uydurmayı keser her zaman"],"correctIndex":1},{"id":"q_agt2_1","prompt":"«JSON gibi yaz» şema kapısı mıdır?","choices":["Evet","Hayır; parse ve zorunlu alan gerekir","Yeterli dilekçedir","Yalnız sistem katmanı yeter"],"correctIndex":1},{"id":"q_agt2_2","prompt":"json.loads kırılınca Fail-closed (Hata Anında Kapalı) ne yapar?","choices":["Yarı JSON kabul eder","İşlemi durdurur; araç çağrılmaz","Boş dict uydurur","Metni yine araçlara verir"],"correctIndex":1},{"id":"q_agt2_3","prompt":"Üretim tarifi katmanları hangisidir?","choices":["Tek paragraf yeter","Sistem yasağı, kullanıcı işi, biçim şeması ayrı durur","Yalnız few-shot","Yalnız araç adı"],"correctIndex":1},{"id":"q_agt3_1","prompt":"Bilinmeyen araç adında dürüst yol hangisidir?","choices":["Benzer isim çalıştır","Fail-closed durur; çağrı düşer","Sessizce None döner","eval ile dene"],"correctIndex":1},{"id":"q_agt3_2","prompt":"Araç sonucu nedir?","choices":["Nihai kullanıcı cevabı","Gözlem; döngü bunu okuyup devam eder","Sistem yasağı","Şema kendisi"],"correctIndex":1},{"id":"q_agt3_3","prompt":"Uygulama Programlama Arayüzü anahtarı nereye girmez?","choices":["Yalnız log’a","Tarife ve araç argümanına yapışmaz","Şema alanına serbestçe","Not aracına gizlice"],"correctIndex":1},{"id":"q_agt4_1","prompt":"Bağlam penceresi dolunca eski tur ne olur?","choices":["Model sonsuza hatırlar","Düşer; pencere tavanıdır","Sessiz özet zorunludur","Vektör depo otomatik dolar"],"correctIndex":1},{"id":"q_agt4_2","prompt":"Getiri eşiğin altındayken dürüst yol hangisidir?","choices":["Genel bilgiyle doldur","Üretim durur; uydurma yok","Önceki cevabı kopyala","Pencereyi ikiye katla"],"correctIndex":1},{"id":"q_agt4_3","prompt":"Bu dersteki kelime örtüşmesi gerçek vektör depo mudur?","choices":["Evet, aynı fizik","Hayır; kapıyı gösterir, sahte gömme iddiası yoktur","Evet, cosine zorunlu","Yalnız GPU’da"],"correctIndex":1},{"id":"q_agt5_1","prompt":"ReAct turunun sırası hangisidir?","choices":["Eylem → düşünce","Düşünce → eylem → gözlem","Gözlem → şema → sır","Yalnız bitir"],"correctIndex":1},{"id":"q_agt5_2","prompt":"Tur tavanı dolunca Fail-closed (Hata Anında Kapalı) ne yapar?","choices":["Bir araç daha dener","Yeni araç çağırmaz; dürüst durur","Önceki gözlemi cevap sanır","Tavanı sessiz artırır"],"correctIndex":1},{"id":"q_agt5_3","prompt":"Düşünce boşken eylem?","choices":["Serbesttir","Yasaktır; kör savuruş durur","Tavanı sıfırlar","JSON’u atlar"],"correctIndex":1},{"id":"q_agt6_1","prompt":"Mini projedeki hava aracı ağa çıkar mı?","choices":["Evet, zorunlu","Hayır; stok sözlüktür, sahte canlı iddiası yoktur","Yalnız İstanbul’da","JSON ağı açar"],"correctIndex":1},{"id":"q_agt6_2","prompt":"`niyet` rafta yoksa ne olur?","choices":["Benzer araç çalışır","ValueError; işlem durur","Notlara yazar","Sohbet cümlesi basar"],"correctIndex":1},{"id":"q_agt6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Ajan bir tur atınca"],"correctIndex":1},{"id":"q_agt_p1","prompt":"Otonom ajan neyi bitirir?","choices":["Yalnız şiir","Araçla iş; düz sohbet yetmez","Eğitim kesitini","Pencere tavanını"],"correctIndex":1},{"id":"q_agt_p2","prompt":"Halüsinasyon nedir?","choices":["Araç sonucu","Kaynaksız uydurma cümle","JSON şeması","Tur tavanı"],"correctIndex":1},{"id":"q_agt_p3","prompt":"Zorunlu alan eksik JSON’da?","choices":["Kabul","Parse sonrası durur","Varsayılan şehir","None niyet"],"correctIndex":1},{"id":"q_agt_p4","prompt":"Sistem katmanı ne taşır?","choices":["Kullanıcı işi","Meslek ve yasak","Yalnız JSON","Vektör skor"],"correctIndex":1},{"id":"q_agt_p5","prompt":"Araç kaydı ne işe yarar?","choices":["TTS","İzinli fonksiyon adını tutar","Pencereyi açar","Barajı düşürür"],"correctIndex":1},{"id":"q_agt_p6","prompt":"Gözlem kimden gelir?","choices":["Kullanıcı şiiri","Araç çıktısı","Sertifika","TTS"],"correctIndex":1},{"id":"q_agt_p7","prompt":"Kısa hafıza nedir?","choices":["Diskteki vektör","Penceredeki son turlar","GPU belleği","Sertifika hash"],"correctIndex":1},{"id":"q_agt_p8","prompt":"Uzun hafıza eşiği neden durur?","choices":["Hız","Zayıf eşleşmede uydurmayı kesmek","JSON hızlanır","TTS"],"correctIndex":1}]$exam_ai_agent_temel$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_ai_agent_orta',
    'ac_ai_agent_orta',
    'Çoklu AI Agent Sistemleri ve RAG Mimarisi müfredat sınavı',
    70,
    $exam_ai_agent_orta$[{"id":"q_pow_ai-agent-orta-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-orta-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-orta-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-orta-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-orta-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-orta-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_ago1_1","prompt":"Artırılmış Geri Çapraz Sorgulama (RAG) önce ne yapar?","choices":["Pencereye 80 sayfa yığar","Kanıt parçasını getirir, sonra üretir","Eğitim kesitini günceller","Boşken orta palet basar"],"correctIndex":1},{"id":"q_ago1_2","prompt":"Getiri boşken Fail-closed (Hata Anında Kapalı) ne yapar?","choices":["Muhtemel stok uydurur","Üretimi durdurur; kaynak yok der","Önceki sohbeti kanıt sanır","Eşiği sessiz sıfırlar"],"correctIndex":1},{"id":"q_ago1_3","prompt":"Bu dersteki kelime örtüşmesi gerçek gömme midir?","choices":["Evet, aynı fizik","Hayır; kapıyı gösterir, sahte model iddiası yoktur","Evet, cosine zorunlu","Yalnız GPU’da"],"correctIndex":1},{"id":"q_ago2_1","prompt":"Boş koleksiyonda dürüst yol hangisidir?","choices":["Genel bilgi basar","Fail-closed; sorgu durur","top-k=10 uydurur","Pencereyi şişirir"],"correctIndex":1},{"id":"q_ago2_2","prompt":"top-k neyi garanti etmez?","choices":["Hız","Eşik üstü kanıt; sayı dolu diye kaynak doğmaz","JSON şema","TTS"],"correctIndex":1},{"id":"q_ago2_3","prompt":"Bu dersteki Koleksiyon sınıfı canlı Chroma mıdır?","choices":["Evet","Hayır; kapıyı gösterir, sahte sürücü iddiası yoktur","Evet, GPU zorunlu","Yalnız REST"],"correctIndex":1},{"id":"q_ago3_1","prompt":"Araştırmacı boş dönünce yazar ne yapar?","choices":["Genel paragraf basar","Fail-closed; teslim durur","Önceki raporu kopyalar","top-k artırır"],"correctIndex":1},{"id":"q_ago3_2","prompt":"Çoklu ajan neden tek ağızdan ayrılır?","choices":["Hız","Getiri ile rapor karışmasın; rol sözleşmesi ayrı dursun","GPU zorunlu","JSON hızlanır"],"correctIndex":1},{"id":"q_ago3_3","prompt":"Yazar `arastir` çağırırsa dürüst yol hangisidir?","choices":["İzin ver","Rol dışı ad; işlem durur","Sessizce None","eval"],"correctIndex":1},{"id":"q_ago4_1","prompt":"Ortak durumda eksik anahtarda dürüst yol hangisidir?","choices":["Boş string uydurur","Fail-closed; işlem durur","Önceki turu yapıştırır","None basar"],"correctIndex":1},{"id":"q_ago4_2","prompt":"Kısa bellek ile uzun bellek farkı nedir?","choices":["Yoktur","Kısa bu turun defteri; uzun raftaki kanıt","İkisi de GPU","Kısa JSON’dur"],"correctIndex":1},{"id":"q_ago4_3","prompt":"`kanit` anahtarını kim yazar?","choices":["Yazar ajan","Yalnız araştırmacı; tek yazar kuralı","Her ikisi yarışır","Kullanıcı şiiri"],"correctIndex":1},{"id":"q_ago5_1","prompt":"Riskli araç onaysız çağrılır mı?","choices":["Evet, otonomi budur","Hayır; durum beklemede kalır","Zaman dolunca True","JSON yeter"],"correctIndex":1},{"id":"q_ago5_2","prompt":"Zaman aşımında Fail-closed (Hata Anında Kapalı) ne yapar?","choices":["Onay uydurur","İşlemi durdurur; araç çağrılmaz","Önceki kaşeyi kopyalar","top-k artırır"],"correctIndex":1},{"id":"q_ago5_3","prompt":"`red` kararında dürüst yol hangisidir?","choices":["Yine gönderir","ValueError; işlem durur","beklemede sonsuz","None basar"],"correctIndex":1},{"id":"q_ago6_1","prompt":"Mini projedeki raf ağa çıkar mı?","choices":["Evet, zorunlu","Hayır; liste sözlüktür, sahte canlı iddiası yoktur","Yalnız PDF’de","JSON ağı açar"],"correctIndex":1},{"id":"q_ago6_2","prompt":"Onay `None` iken `calistir` ne döner?","choices":["Gönderildi","beklemede kutu; kaşe yok","Mars uydurması","Boş rapor"],"correctIndex":1},{"id":"q_ago6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Ajan bir tur atınca"],"correctIndex":1},{"id":"q_ago_p1","prompt":"RAG sırası hangisidir?","choices":["Üret → getir","Böl / göm / getir, sonra üret","Yalnız pencere","TTS"],"correctIndex":1},{"id":"q_ago_p2","prompt":"Gömme (embedding) neyi sayıya çevirir?","choices":["Sertifika","Parça metninin konumunu benzerlik uzayında","HTTP kodu","Kaşe"],"correctIndex":1},{"id":"q_ago_p3","prompt":"Boş VectorDB sorgusu?","choices":["Wikipedia doldurur","Fail-closed durur","top-k=100","None vektör"],"correctIndex":1},{"id":"q_ago_p4","prompt":"top-k dolu diye kanıt doğar mı?","choices":["Evet","Hayır; eşik yoksa gürültü düşer","Evet JSON’da","Yalnız k=1"],"correctIndex":1},{"id":"q_ago_p5","prompt":"Araştırmacı ajan ne üretir?","choices":["Nihai müşteri mektubu","Kanıt / getiri","Kaşe","TTS"],"correctIndex":1},{"id":"q_ago_p6","prompt":"Yazar ajan kanıtsız?","choices":["Şiir basar","Teslim durur","Önceki rapor","eval"],"correctIndex":1},{"id":"q_ago_p7","prompt":"Ortak durum nedir?","choices":["GPU belleği","Ajanların paylaştığı defter","Sertifika hash","Pencere tavanı"],"correctIndex":1},{"id":"q_ago_p8","prompt":"Eksik `kanit` anahtarı?","choices":["Boş string","Fail-closed; okuma durur","None rapor","top-k"],"correctIndex":1}]$exam_ai_agent_orta$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_ai_agent_ileri',
    'ac_ai_agent_ileri',
    'İleri Düzey AI Agent Mimarisi, LangGraph ve Otonom Sistem Güvenliği müfredat sınavı',
    70,
    $exam_ai_agent_ileri$[{"id":"q_pow_ai-agent-ileri-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-ileri-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-ileri-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-ileri-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-ileri-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-agent-ileri-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_agi1_1","prompt":"Durum Grafiği (StateGraph) ne tutar?","choices":["Yalnız TTS sesi","Ajanın paylaştığı ortak defter","Sertifika hash","GPU tavanı"],"correctIndex":1},{"id":"q_agi1_2","prompt":"Tur tavanı dolunca Fail-closed (Hata Anında Kapalı) ne yapar?","choices":["Bir tur daha uydurur","İşlemi durdurur; sonsuz döngü yok","Kenarı sessiz siler","None basar"],"correctIndex":1},{"id":"q_agi1_3","prompt":"Kayıp düğüm adı neye yol açar?","choices":["Önceki sonucu basar","İsimli durma; kenar yok","Kendini basla sanır","eval açar"],"correctIndex":1},{"id":"q_agi2_1","prompt":"Yansıma döngüsü kaç kez yedek dener?","choices":["Sonsuz","Tavan kadar; burada bir","Yüz","Hata yutulunca sıfır"],"correctIndex":1},{"id":"q_agi2_2","prompt":"Bilinmeyen hata için `yansit` ne döner?","choices":["Aynı aracı","None; yol yok, işlem durur","stok uydurması","True"],"correctIndex":1},{"id":"q_agi2_3","prompt":"Retry sonsuz neden Fail-closed değildir?","choices":["Hızlıdır","Hattı kapatmaz; kırık araç döner","Log yoktur","Kenar yoktur"],"correctIndex":1},{"id":"q_agi3_1","prompt":"Güvenlik korkuluğu (Guardrails) varsayılanı nedir?","choices":["Tüm araç açık","Kilit; listede yoksa dur","Sessiz True","eval"],"correctIndex":1},{"id":"q_agi3_2","prompt":"Kayıt dışı araç adı neyi tetikler?","choices":["Yine çalışır","Yetkisiz eylem; işlem durur","Önceki sonucu basar","Kaşe uydurur"],"correctIndex":1},{"id":"q_agi3_3","prompt":"Bu dersteki tarama saldırı tarifi midir?","choices":["Evet, sömürü","Hayır; kapıyı gösterir, ağ ve sömürü yoktur","Evet, PoC","Yalnız GPU"],"correctIndex":1},{"id":"q_agi4_1","prompt":"Değerlendirme seti (Evals) neyi karşılaştırır?","choices":["GPU ısısını","Beklenen ile çıkanı","TTS hızını","Fiyatı"],"correctIndex":1},{"id":"q_agi4_2","prompt":"Altın satır kırılınca Fail-closed ne yapar?","choices":["Yarım yeşil basar","eval baraji; işlem durur","PII yazar","Retry sonsuz"],"correctIndex":1},{"id":"q_agi4_3","prompt":"Dürüst günlükte Kişisel Gizli Veriler (PII) durur mu?","choices":["Evet, zorunlu","Hayır; iz anahtar ve gecti taşır","Yalnız telefon","Evet, hash’siz"],"correctIndex":1},{"id":"q_agi5_1","prompt":"Hızlı Uygulama Programlama Arayüzü (FastAPI) kapısı bilinmeyen rotada ne basar?","choices":["200 ve boş","Fail-closed; rota yok","Sessiz siler","önceki sonuç"],"correctIndex":1},{"id":"q_agi5_2","prompt":"`kabul` ne anlama gelir?","choices":["İş bitti","Kuyruğa alındı; sonuç işçiden","200 zorunlu","eval geçti"],"correctIndex":1},{"id":"q_agi5_3","prompt":"Kuyruk tavanı dolunca ne olur?","choices":["Eski mektubu siler","kuyruk dolu; işlem durur","True basar","Retry sonsuz"],"correctIndex":1},{"id":"q_agi6_1","prompt":"Mini projedeki oda ağa çıkar mı?","choices":["Evet, zorunlu model","Hayır; kapılar sahte ağsız görünür","Yalnız GPU","JSON ağı açar"],"correctIndex":1},{"id":"q_agi6_2","prompt":"`calistir` ezme cümlesinde ne döner?","choices":["18 uydurur","enjeksiyon; işlem durur","kabul","önceki kuyruk"],"correctIndex":1},{"id":"q_agi6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Kuyruk dolunca"],"correctIndex":1},{"id":"q_agi_p1","prompt":"Grafik ajan çizelgesi (LangGraph) neyi çizer?","choices":["TTS","Düğüm, kenar ve durma","Fiyat","GPU"],"correctIndex":1},{"id":"q_agi_p2","prompt":"Durum Grafiği (StateGraph) defteri nedir?","choices":["Sertifika","Ajanın paylaştığı durum","HTTP kodu","Kaşe"],"correctIndex":1},{"id":"q_agi_p3","prompt":"Tur tavanı dolunca?","choices":["Bir tur daha","Fail-closed durur","None basar","eval"],"correctIndex":1},{"id":"q_agi_p4","prompt":"Kayıp düğüm?","choices":["Önceki sonuç","İsimli durma","Kendini basla sanır","True"],"correctIndex":1},{"id":"q_agi_p5","prompt":"Yansıma tavanı burada kaçtır?","choices":["Sonsuz","Bir yedek deneme","Yüz","Sıfır"],"correctIndex":1},{"id":"q_agi_p6","prompt":"Bilinmeyen hatada yedek?","choices":["Aynı araç","None; yol yok","stok uydurması","True"],"correctIndex":1},{"id":"q_agi_p7","prompt":"Korkuluk varsayılanı?","choices":["Açık","Kilit; listede yoksa dur","Sessiz True","eval"],"correctIndex":1},{"id":"q_agi_p8","prompt":"Kayıt dışı araç?","choices":["Çalışır","Yetkisiz eylem durur","Önceki sonuç","Kaşe"],"correctIndex":1}]$exam_ai_agent_ileri$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_python_temel',
    'ac_python_temel',
    'Python ile Programlama ve Problem Çözme müfredat sınavı',
    70,
    $exam_python_temel$[{"id":"q_pow_python-temel-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_py1_1","prompt":"`tutar = \"250,00\"` iken `tutar * 2` ne üretir?","choices":["500","Birleştirilmiş metin: '250,00250,00'","TypeError her zaman","250"],"correctIndex":1},{"id":"q_py1_2","prompt":"Fail-closed (Hata Anında Kapalı) tutar çevrilemezse ne yapar?","choices":["0 kabul eder","İşlemi durdurur; orta değer uydurmaz","float tahmini basar","Metni iki kez yazar"],"correctIndex":1},{"id":"q_py1_3","prompt":"Eksik sözlük anahtarında dürüst yol hangisidir?","choices":["stok[\"armut\"]","stok.get(\"armut\", 0) veya \"armut\" in stok","eval","print şifre"],"correctIndex":1},{"id":"q_py2_1","prompt":"`=` ile `==` farkı nedir?","choices":["Aynıdır","= atama, == karşılaştırma","İkisi de karşılaştırma","İkisi de atama"],"correctIndex":1},{"id":"q_py2_2","prompt":"`not_ort = 68` iken baraj 70 ise doğru dal hangisidir?","choices":["geçti","tekrar veya bütünleme; 68 >= 70 yanlıştır","elif yasak","else çalışmaz"],"correctIndex":1},{"id":"q_py2_3","prompt":"Python’da if bloğunun sınırını ne belirler?","choices":["Virgül","Girinti (indentation)","Noktalı virgül","Büyük harf"],"correctIndex":1},{"id":"q_py3_1","prompt":"`range(1, 6)` hangi sayıları üretir?","choices":["1..6","1, 2, 3, 4, 5","0..5","0..6"],"correctIndex":1},{"id":"q_py3_2","prompt":"`while True` riski nedir?","choices":["Yavaşlık","Çıkış yoksa sonsuz döngü","Tip hatası","Import hatası"],"correctIndex":1},{"id":"q_py3_3","prompt":"`break` ne yapar?","choices":["Fonksiyon siler","Döngüyü erken bitirir","Dosya kapatır","Tip değiştirir"],"correctIndex":1},{"id":"q_py4_1","prompt":"`return` olmadan fonksiyon ne döner?","choices":["0","None","Boş string","Hata zorunlu"],"correctIndex":1},{"id":"q_py4_2","prompt":"Kuruş dönüşümü için doğru yaklaşım hangisidir?","choices":["float basmak","int(round(lira * 100))","str çarpmak","hex"],"correctIndex":1},{"id":"q_py4_3","prompt":"`def` ne başlatır?","choices":["Sınıf","Fonksiyon tanımı","Modül","Paket"],"correctIndex":1},{"id":"q_py5_1","prompt":"Liste indeksi nereden başlar?","choices":["1","0","len","-2 zorunlu"],"correctIndex":1},{"id":"q_py5_2","prompt":"Son elemanı okumanın dürüst yolu hangisidir?","choices":["sepet[len(sepet)]","sepet[-1] veya sepet[len(sepet) - 1]","sepet[1]","eval"],"correctIndex":1},{"id":"q_py5_3","prompt":"Eksik sözlük anahtarında çökmeden okuma hangisidir?","choices":["Köşeli parantez",".get veya in","print şifre","del zorunlu"],"correctIndex":1},{"id":"q_py6_1","prompt":"`input()` ne döner?","choices":["Her zaman int","Her zaman str","bool","None"],"correctIndex":1},{"id":"q_py6_2","prompt":"`int(\"üç\")` patlayınca dürüst yol hangisidir?","choices":["Programı kapat","try/except ValueError ile yeniden sor","0 kabul et","eval"],"correctIndex":1},{"id":"q_py6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","PDF indirince"],"correctIndex":1},{"id":"q_py_p1","prompt":"type() ne işe yarar?","choices":["Dosya açar","Değerin tipini gösterir","Döngü kırar","Modül yükler"],"correctIndex":1},{"id":"q_py_p2","prompt":"bool hangi ikilidir?","choices":["1 ve 2","True / False","yes / no","on / off string"],"correctIndex":1},{"id":"q_py_p3","prompt":"Anlamlı değişken adı neden iyidir?","choices":["Zorunlu sözdizimi","Okunur sözleşme","Daha hızlı CPU","Garbage collector"],"correctIndex":1},{"id":"q_py_p4","prompt":"continue ne yapar?","choices":["Programı bitirir","O turu atlar","Dosya siler","Import"],"correctIndex":1},{"id":"q_py_p5","prompt":"Yerel değişken dışarı sızar mı?","choices":["Evet her zaman","Hayır; fonksiyon kapsamındadır","Evet global olur","Yalnız return ile aynı"],"correctIndex":1},{"id":"q_py_p6","prompt":"elif ne işe yarar?","choices":["Import","Ek koşul dalı","Döngü","Sınıf"],"correctIndex":1},{"id":"q_py_p7","prompt":"Karşılaştırma sonucu tipi nedir?","choices":["str","bool","list","dict"],"correctIndex":1},{"id":"q_py_p8","prompt":"Boş girdi nasıl ele alınır?","choices":["Yoksay","strip sonrası reddet / yeniden sor","0 kabul et","None bas"],"correctIndex":1}]$exam_python_temel$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_python_orta',
    'ac_python_orta',
    'Python ile Nesne Yönelimli Programlama ve Veri İşleme müfredat sınavı',
    70,
    $exam_python_orta$[{"id":"q_pow_python-orta-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-orta-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-orta-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-orta-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-orta-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-orta-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pyo1_1","prompt":"Sınıf gövdesindeki `kalemler = []` neden tehlikelidir?","choices":["Hızlanır","Tüm örnekler aynı listeyi paylaşır; sızıntı doğar","SyntaxError zorunlu","Yalnız str ile patlar"],"correctIndex":1},{"id":"q_pyo1_2","prompt":"`Siparis(\"ekmek\", 2)` ve `Siparis(\"ekmek\", 5)` ilişkisi nedir?","choices":["Aynı nesnedir","Aynı sınıftan ayrı örneklerdir","İkincisi birincisini siler","class yasaktır"],"correctIndex":1},{"id":"q_pyo1_3","prompt":"Fail-closed (Hata Anında Kapalı) adet ≤ 0 iken ne yapar?","choices":["0 kabul eder","Örneği açmaz; ValueError basar","None döner","Sınıf değişkenine yazar"],"correctIndex":1},{"id":"q_pyo2_1","prompt":"`super().__init__` ne işe yarar?","choices":["Dosya açar","Taban sınıfın kurucusunu çağırır","Kapsülü kırar","except yutar"],"correctIndex":1},{"id":"q_pyo2_2","prompt":"`_adet` ve `@property` dürüst sözleşmesi nedir?","choices":["Herkes eksi yazabilir","Okuma kapıdan; yazma metodla, sınır ihlali durur","private Python’da zorunludur","global gerekir"],"correctIndex":1},{"id":"q_pyo2_3","prompt":"Stok yetmezken Fail-closed (Hata Anında Kapalı) ne basar?","choices":["adet=0 uydurur","İsimli istisna; kalan değişmez","None","print yeter"],"correctIndex":1},{"id":"q_pyo3_1","prompt":"`json.loads(\"{\")` dürüst sonuç nedir?","choices":["Boş dict","JSONDecodeError; yazım durur","None","0"],"correctIndex":1},{"id":"q_pyo3_2","prompt":"Türkçe karakteri JSON’da kaçırmamanın yolu hangisidir?","choices":["ascii=True","json.dumps(..., ensure_ascii=False)","latin-1 zorunlu","eval"],"correctIndex":1},{"id":"q_pyo3_3","prompt":"Yarım dosyanın hedefi kirletmemesi için dürüst yol hangisidir?","choices":["Doğrudan üzerine yaz","Geçici dosyaya yaz, sonra replace","print yeter","sleep"],"correctIndex":1},{"id":"q_pyo4_1","prompt":"`except:` veya geniş Exception yutmanın riski nedir?","choices":["Hız","Gerçek hatayı gizler; KeyboardInterrupt da yutulabilir","Tip güvenliği","JSON hızlanır"],"correctIndex":1},{"id":"q_pyo4_2","prompt":"`raise KayitHatasi(...) from exc` ne korur?","choices":["Dosya kilidi","Neden zincirini; kök ValueError kaybolmaz","HTTP kodu","class değişkeni"],"correctIndex":1},{"id":"q_pyo4_3","prompt":"`oku_adet(\"üç\")` dürüst damga hangisidir?","choices":["kod=bos","kod=tip ve işlem durur","0 döner","None"],"correctIndex":1},{"id":"q_pyo5_1","prompt":"HTTP 500 gövdede ok:true ise dürüst yol hangisidir?","choices":["Yeşil tik","Durum 200 değil; kayıt durur","json() yeter","timeout kapat"],"correctIndex":1},{"id":"q_pyo5_2","prompt":"`requests.get` çağrısında timeout neden durur?","choices":["Süs","Sonsuz kuyruk olmasın diye üst sınır","JSON şeması","class zorunlu"],"correctIndex":1},{"id":"q_pyo5_3","prompt":"200 ile gelen liste, sözlük bekleyen kapıda ne olur?","choices":["Sessiz kabul","Tip reddi; Fail-closed durur","İlk eleman alınır","str’e çevrilir"],"correctIndex":1},{"id":"q_pyo6_1","prompt":"REST 200 ama gövdede `id` yoksa ne olur?","choices":["Dosya yine yazılır","Mühür durur; ValueError","id=0 uydurulur","timeout artar"],"correctIndex":1},{"id":"q_pyo6_2","prompt":"Mini projenin dürüst sırası hangisidir?","choices":["yaz → çek → doğrula","çek → durum → şema → mühürle","print → sleep → yaz","eval → dosya"],"correctIndex":1},{"id":"q_pyo6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","JSON indirince"],"correctIndex":1},{"id":"q_pyo_p1","prompt":"`self` nedir?","choices":["Sınıf adı","Örneğin kendisi","Modül","except"],"correctIndex":1},{"id":"q_pyo_p2","prompt":"`__init__` ne zaman çalışır?","choices":["Import’ta","Örnek oluşunca","del ile","JSON parse’ta"],"correctIndex":1},{"id":"q_pyo_p3","prompt":"Sınıf değişkeni ile örnek niteliği farkı nedir?","choices":["Yoktur","Biri paylaşılır, öbürü tepsiye aittir","İkisi de private","Yalnız listede"],"correctIndex":1},{"id":"q_pyo_p4","prompt":"Kapsülleme neden vardır?","choices":["Hız","Dışarıdan sınır ihlalini sözleşmeyle kesmek","JSON zorunlu","HTTP 200"],"correctIndex":1},{"id":"q_pyo_p5","prompt":"`json.dumps` ne üretir?","choices":["bytes zorunlu","JSON metni","Path","class"],"correctIndex":1},{"id":"q_pyo_p6","prompt":"`pathlib.Path.write_text` encoding varsayılanı riski nedir?","choices":["Yok","Platforma göre sapabilir; utf-8 yazılır","JSON bozulmaz","timeout"],"correctIndex":1},{"id":"q_pyo_p7","prompt":"Özel istisna class Exception’dan neden türer?","choices":["Süs","İsimli yakalama ve kod alanı için","daha hızlı","HTTP kodu"],"correctIndex":1},{"id":"q_pyo_p8","prompt":"`requests` standart kütüphane midir?","choices":["Evet","Hayır; üçüncü parti, ortama kurulur","Yalnız Windows","json ile aynı"],"correctIndex":1}]$exam_python_orta$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_python_ileri',
    'ac_python_ileri',
    'Python ile İleri Düzey Mimari, Asenkron Programlama ve Performans müfredat sınavı',
    70,
    $exam_python_ileri$[{"id":"q_pow_python-ileri-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-ileri-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-ileri-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-ileri-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-ileri-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-ileri-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pyi1_1","prompt":"Decorator (bezetici) neyi değiştirmeden neyi sarar?","choices":["Sınıf adını","İç fonksiyonun işini; kapı ve gözlemi dışarıda tutar","Modül yolunu","GIL’i kaldırır"],"correctIndex":1},{"id":"q_pyi1_2","prompt":"Fail-closed (Hata Anında Kapalı) bezeticisi adet ≤ 0 iken ne yapar?","choices":["0 uydurur","İç fonksiyonu çağırmaz; ValueError basar","None döner","print yeter"],"correctIndex":1},{"id":"q_pyi1_3","prompt":"`functools.wraps` neden durur?","choices":["Hız","Sarılan fonksiyonun adı ve imzası kaybolmasın","GIL açılır","async zorunlu"],"correctIndex":1},{"id":"q_pyi2_1","prompt":"`yield` ile `return [hepsi]` farkı nedir?","choices":["Yoktur","yield bellek dostu akış; liste hepsini birden taşır","yield daha yavaş zorunlu","return yasak"],"correctIndex":1},{"id":"q_pyi2_2","prompt":"Bozuk kayıtta Fail-closed (Hata Anında Kapalı) üreteç ne yapar?","choices":["Atlar","ValueError; akış durur","None yield eder","boş liste"],"correctIndex":1},{"id":"q_pyi2_3","prompt":"Üreteç tükenince dürüst damga hangisidir?","choices":["None sonsuz","StopIteration; for yutar","0","MemoryError zorunlu"],"correctIndex":1},{"id":"q_pyi3_1","prompt":"`await` neyi beklerken gişeyi boşaltır?","choices":["Yalnız CPU","Giriş-çıkış (I/O) tamamlanmasını","GIL’i siler","Liste zorunlu"],"correctIndex":1},{"id":"q_pyi3_2","prompt":"`time.sleep` async içinde neden yasaktır?","choices":["Yavaş import","Olay döngüsünü dondurur; öbür korutin açılmaz","SyntaxError","yield ister"],"correctIndex":1},{"id":"q_pyi3_3","prompt":"`asyncio.gather` bir kol ValueError basınca ne olur?","choices":["Öbürleri sessiz biter","İstisna yükselir; yarım sonuç Fail-closed durur","None listesi","retry sonsuz"],"correctIndex":1},{"id":"q_pyi4_1","prompt":"Küresel Yorumlayıcı Kilidi (GIL) thread’de CPU işini neden sıraya koyar?","choices":["Silinmiştir","Tek yorumlayıcı; aynı anda bir bytecode","Process yasak","async zorunlu"],"correctIndex":1},{"id":"q_pyi4_2","prompt":"CPU-yoğun iş için dürüst seçim hangisidir?","choices":["Daha fazla thread","Ayrı süreç (multiprocessing)","time.sleep","global liste"],"correctIndex":1},{"id":"q_pyi4_3","prompt":"Paylaşılan sayacı korumasız artırmanın riski nedir?","choices":["Hızlanır","Yarış durumu; değer yalan söyler","GIL kalkar","async bozulur"],"correctIndex":1},{"id":"q_pyi5_1","prompt":"Metaclass neyi üretir?","choices":["Yalnız instance","Sınıf nesnesini; class’ın sınıfıdır","Modülü","GIL’i"],"correctIndex":1},{"id":"q_pyi5_2","prompt":"Fail-closed metaclass `dogrula` yokken ne yapar?","choices":["Sınıfı yine açar","TypeError; sınıf doğmaz","None kalıp","instance uyarır"],"correctIndex":1},{"id":"q_pyi5_3","prompt":"Varsayılan klişe hangisidir?","choices":["object yalnız","type","super","asyncio"],"correctIndex":1},{"id":"q_pyi6_1","prompt":"Mini motorun dürüst sırası hangisidir?","choices":["listele → uyu → yaz","async çek → doğrula → üreteçle işle","thread CPU → glob","eval → dump"],"correctIndex":1},{"id":"q_pyi6_2","prompt":"Bir gişe 500 iken gather Fail-closed ne yapar?","choices":["Öbürlerini mühürler","İstisna; yarım rapor yok","id=0","retry sonsuz"],"correctIndex":1},{"id":"q_pyi6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","gather bitince"],"correctIndex":1},{"id":"q_pyi_p1","prompt":"`@wraps` neyi korur?","choices":["GIL","Sarılan fonksiyonun kimliği","process","RAM tavanı"],"correctIndex":1},{"id":"q_pyi_p2","prompt":"Üst düzey fonksiyon ne alır?","choices":["Yalnız int","Fonksiyon; fonksiyon döndürebilir","Yalnız class","GIL"],"correctIndex":1},{"id":"q_pyi_p3","prompt":"`yield from` ne taşır?","choices":["class","Başka üretecin akışını","HTTP","Lock zorunlu"],"correctIndex":1},{"id":"q_pyi_p4","prompt":"`async def` ne üretir?","choices":["bytes","Korutin nesnesi; await ile koşar","thread","process"],"correctIndex":1},{"id":"q_pyi_p5","prompt":"`asyncio.run` ne işe yarar?","choices":["Import","Olay döngüsünü açıp korutini bitirir","GIL siler","thread açar"],"correctIndex":1},{"id":"q_pyi_p6","prompt":"I/O-yoğun işte thread neden uygun olabilir?","choices":["GIL yok","Beklerken başka iş yürür","CPU paralel zorunlu","yield yasak"],"correctIndex":1},{"id":"q_pyi_p7","prompt":"Process belleği paylaşır mı?","choices":["Evet her zaman","Hayır; ayrı adres alanı, veri açıkça geçilir","GIL paylaşır","async paylaşır"],"correctIndex":1},{"id":"q_pyi_p8","prompt":"`type(Kayit)` varsayılanı nedir?","choices":["Kayit","type","object yalnız","super"],"correctIndex":1}]$exam_python_ileri$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_fullstack_temel',
    'ac_fullstack_temel',
    'Modern Web Geliştirme Temelleri (HTML, CSS, JavaScript ve TypeScript) müfredat sınavı',
    70,
    $exam_fullstack_temel$[{"id":"q_pow_fullstack-temel-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_fs1_1","prompt":"Alan Adı Sistemi (DNS) ne işe yarar?","choices":["Sayfayı boyar","Alan adını sokak numarasına (IP) çevirir","Durum kodu basar","TypeScript derler"],"correctIndex":1},{"id":"q_fs1_2","prompt":"HTTP 503 iken ekranda yeşil «sepete eklendi» ne anlama gelir?","choices":["İş bitti","Yalan; fiş reddedildi, Fail-closed durur","DNS çözüldü yeter","Yalnız GET’te doğru"],"correctIndex":1},{"id":"q_fs1_3","prompt":"GET ile POST farkı nedir?","choices":["Aynıdır","GET okur, POST yazar; fiş yöntemi yalan söylemez","POST boyar","GET sunucuyu kapatır"],"correctIndex":1},{"id":"q_fs2_1","prompt":"Semantik HTML5’te `article` ne taşır?","choices":["Sessiz kutu","Kendi başına duran içerik tezgâhı","Yalnız renk","DNS kaydı"],"correctIndex":1},{"id":"q_fs2_2","prompt":"Flexbox ile Grid farkı nedir?","choices":["Aynıdır","Flex tek eksen şeridi, Grid satır-sütun tapusu","Grid yalnız renk","Flex sunucuyu durdurur"],"correctIndex":1},{"id":"q_fs2_3","prompt":"Dar ekranda taşan şerit için dürüst CSS hangisidir?","choices":["overflow gizle yeter","flex-wrap veya minmax ile kırılma yazılı durur","position:fixed","div çoğalt"],"correctIndex":1},{"id":"q_fs3_1","prompt":"`document.getElementById` null dönünce `.addEventListener` ne üretir?","choices":["Sessiz geçer","`undefined is not a function`; Fail-closed önce yuvayı sorar","Otomatik düğme","CSS boyar"],"correctIndex":1},{"id":"q_fs3_2","prompt":"Kullanıcı metnini DOM’a basarken dürüst yol hangisidir?","choices":["innerHTML","textContent; innerHTML XSS kapısı açar","eval","document.write"],"correctIndex":1},{"id":"q_fs3_3","prompt":"`Number(\"\")` tuzağı nedir?","choices":["NaN her zaman","0 olabilir; boş adet geçerli değildir","Hata zorunlu","Infinity"],"correctIndex":1},{"id":"q_fs4_1","prompt":"fetch ağı kuruldu diye iş bitti mi?","choices":["Evet","Hayır; res.ok ve gövde okunur","Evet GET’te","Yalnız 201"],"correctIndex":1},{"id":"q_fs4_2","prompt":"`res.ok` false iken `kalemler.map` çağırmak ne doğurur?","choices":["Boş liste","`undefined is not a function` riski; Fail-closed önce şemayı sorar","Otomatik retry","CSS hatası"],"correctIndex":1},{"id":"q_fs4_3","prompt":"`await` reddedilen Promise’de ne yapar?","choices":["undefined döner","İstisna fırlatır; catch durur","Boş dizi basar","res.ok true sanır"],"correctIndex":1},{"id":"q_fs5_1","prompt":"TypeScript `as any` ne yapar?","choices":["Kapıyı kapatır","Hatayı erteler; kapı açmaz","Zod yerine geçer","DNS çözer"],"correctIndex":1},{"id":"q_fs5_2","prompt":"`unknown` gövdeyi doğrudan `kalem.adet` diye okumak?","choices":["Doğru","Yasak; önce daralt, Fail-closed durur","as any yeter","JSON yeter"],"correctIndex":1},{"id":"q_fs5_3","prompt":"`interface` ne işe yarar?","choices":["CSS sınıfı","Alanların cinsini yazılı sözleşmeye bağlar","HTTP fişi","DNS rehberi"],"correctIndex":1},{"id":"q_fs6_1","prompt":"Boş adet kutusunda `Number(\"\")` ile POST atmak?","choices":["Geçerli sıfır","Yasak; trim sonrası boşluk reddedilir","fetch düzeltir","DNS çözer"],"correctIndex":1},{"id":"q_fs6_2","prompt":"Liste satırına kullanıcı metni nasıl basılır?","choices":["innerHTML birleştir","textContent; XSS kapısı kapanır","eval","document.write"],"correctIndex":1},{"id":"q_fs6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","fetch 200 deyince"],"correctIndex":1},{"id":"q_fs_p1","prompt":"HTTP durum kodu ne işe yarar?","choices":["Süs","İstek-yanıt durumunu bildirir","CSS sınıfı","DNS boyası"],"correctIndex":1},{"id":"q_fs_p2","prompt":"DNS çözülmeden HTTP fişi?","choices":["Atılır","Fail-closed; isim yoksa istek yok","IP uydurulur","GET zorunlu"],"correctIndex":1},{"id":"q_fs_p3","prompt":"Semantik olmayan div ormanı?","choices":["Yeter","Anlam yok; iskelet teslim sayılmaz","Grid zorunlu","fetch boyar"],"correctIndex":1},{"id":"q_fs_p4","prompt":"Flex wrap neden durur?","choices":["Renk","Dar ekranda şerit taşmasın","HTTP 200","any"],"correctIndex":1},{"id":"q_fs_p5","prompt":"`const` ne mühürler?","choices":["Fonksiyonu","Yeniden atamayı","DNS’i","Grid’i"],"correctIndex":1},{"id":"q_fs_p6","prompt":"DOM yuvası yokken tıklama?","choices":["Sessiz","Fail-closed throw; undefined is not a function önlenir","innerHTML","POST"],"correctIndex":1},{"id":"q_fs_p7","prompt":"Promise nedir?","choices":["CSS","Sonra tutulacak söz","DNS kaydı","imar ruhsatı"],"correctIndex":1},{"id":"q_fs_p8","prompt":"async/await neyi bekler?","choices":["Yalnız CPU","Sözün çözülmesini; gişeyi boşaltır","tsc’yi","Grid’i"],"correctIndex":1}]$exam_fullstack_temel$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_fullstack_orta',
    'ac_fullstack_orta',
    'React, Node.js ve PostgreSQL ile Modern Uygulama Geliştirme müfredat sınavı',
    70,
    $exam_fullstack_orta$[{"id":"q_pow_fullstack-orta-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-orta-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-orta-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-orta-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-orta-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-orta-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_fso1_1","prompt":"React’te props (özellik) kim yazar?","choices":["Çocuk bileşen yerinde değiştirir","Ebeveyn basar; çocuk okur, yazmaz","JSX otomatik doldurur","Prisma yazar"],"correctIndex":1},{"id":"q_fso1_2","prompt":"`props.baslik = \"bitti\"` Fail-closed (Hata Anında Kapalı) nedir?","choices":["Geçerli kısayol","Yasak; poşet salt okunur kalır","Yalnız TypeScript’te doğru","HTTP 200 yeter"],"correctIndex":1},{"id":"q_fso1_3","prompt":"Boş başlıkla kart basmak?","choices":["Ekran boş kalsın","trim sonrası boşsa işlem durur","div yeter","innerHTML doldurur"],"correctIndex":1},{"id":"q_fso2_1","prompt":"`useEffect(() => setN(n + 1), [n])` ne üretir?","choices":["Tek boyama","Sonsuz re-render; Fail-closed bu deseni keser","Yalnız ilk kare","Prisma satırı"],"correctIndex":1},{"id":"q_fso2_2","prompt":"Kontrollü formda `value` nereden gelir?","choices":["DOM’un aklından","useState kutusundan; serbest defaultValue kaçaktır","JWT’den","CSS’ten"],"correctIndex":1},{"id":"q_fso2_3","prompt":"fetch etkisinde temizlik yoksa risk nedir?","choices":["Yoktur","Yarış: eski yanıt yeni listeyi ezer","Yalnız CORS","Otomatik 401"],"correctIndex":1},{"id":"q_fso3_1","prompt":"Express’te `express.json()` nereye konur?","choices":["İşleyiciden sonra","Gövde okunmadan önce; Fail-closed sıra ister","Yalnız GET’te","Prisma içine"],"correctIndex":1},{"id":"q_fso3_2","prompt":"Şemasız POST gövdesi ne basar?","choices":["201 ve uydurma id","400; işlem durur","200 boş","302"],"correctIndex":1},{"id":"q_fso3_3","prompt":"REST’te POST /gorevler başarısında dürüst kod?","choices":["200 her zaman","201 oluşturma mührü","204 silindi","500 yeşil"],"correctIndex":1},{"id":"q_fso4_1","prompt":"Kullanıcı id’sini SQL cümlesine `+` ile eklemek?","choices":["Hızlıdır, yeter","Yasak; enjeksiyon kapısı, Fail-closed Prisma API kullanır","Yalnız GET’te doğru","ORM zorunlu değil"],"correctIndex":1},{"id":"q_fso4_2","prompt":"`findUnique` boş dönünce ne yapılır?","choices":["Boş nesne uydurulur","Kayıt yok; işlem durur","İlk satır çalınır","201 basılır"],"correctIndex":1},{"id":"q_fso4_3","prompt":"`$queryRawUnsafe` bu derste neden yok?","choices":["Yavaş","Ham cümle Fail-closed kapıyı söker","Prisma sevmez","Yalnız MySQL’de"],"correctIndex":1},{"id":"q_fso5_1","prompt":"`jwt.decode` kimlik kapısı mıdır?","choices":["Evet, sub yeter","Hayır; imza sormaz, Fail-closed verify ister","Yalnız GET’te","Prisma doğrular"],"correctIndex":1},{"id":"q_fso5_2","prompt":"`JWT_SECRET` boşken sunucu ne yapar?","choices":["Varsayılan secret uydurur","Fail-closed; işlem durur, kapı açılmaz","decode’a düşer","401 yerine 200"],"correctIndex":1},{"id":"q_fso5_3","prompt":"Bearer yokken dürüst yanıt?","choices":["200 ve boş kullanıcı","401; jeton yok, işlem durur","403 her zaman","302 login HTML"],"correctIndex":1},{"id":"q_fso6_1","prompt":"Boş başlıkla POST /gorevler?","choices":["201 uydurma","Yasak; trim sonrası boşluk reddedilir","Prisma düzeltir","JWT yeter"],"correctIndex":1},{"id":"q_fso6_2","prompt":"401 gelince istemci listeyi nasıl basar?","choices":["Eski listeyi yeşil tutar","Fail-closed; yeşil tik yok, hata cümlesi","Boş id uydurur","decode ile geçer"],"correctIndex":1},{"id":"q_fso6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Prisma migrate deyince"],"correctIndex":1},{"id":"q_fso_p1","prompt":"JSX neyi basar?","choices":["SQL","Bileşenin iskelet cümlesini","JWT imzası","Prisma şeması"],"correctIndex":1},{"id":"q_fso_p2","prompt":"Props’u çocuk değiştirirse?","choices":["SSOT korunur","Sözleşme kırılır; ebeveyn yeni poşet basar","Express düzeltir","201 basılır"],"correctIndex":1},{"id":"q_fso_p3","prompt":"useState tek kutu mudur?","choices":["Hayır, her render yeni kasa","Evet; tek yazar pano","Yalnız formda","Prisma state’tir"],"correctIndex":1},{"id":"q_fso_p4","prompt":"useEffect temizlik ne keser?","choices":["CSS","Yarış ve iptal edilmemiş fetch","JWT decode","Grid"],"correctIndex":1},{"id":"q_fso_p5","prompt":"express.json() yokken body?","choices":["Otomatik nesne","undefined; Fail-closed önce json","Prisma doldurur","JWT yükü"],"correctIndex":1},{"id":"q_fso_p6","prompt":"REST POST başarı kodu?","choices":["200 zorunlu","201 oluşturma","204","302"],"correctIndex":1},{"id":"q_fso_p7","prompt":"Prisma findUnique parametre midir?","choices":["Hayır, string birleştirir","Evet; id bağlanır, SQL yapışmaz","Yalnız Unsafe","GET’te hayır"],"correctIndex":1},{"id":"q_fso_p8","prompt":"Ham SQL + kullanıcı metni?","choices":["Hızlı teslim","Enjeksiyon; yasak","ORM aynı","401 yeter"],"correctIndex":1}]$exam_fullstack_orta$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_fullstack_ileri',
    'ac_fullstack_ileri',
    'İleri Düzey Full-Stack Mimari: Next.js App Router, Microservices, Docker ve CI/CD müfredat sınavı',
    70,
    $exam_fullstack_ileri$[{"id":"q_pow_fullstack-ileri-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-ileri-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-ileri-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-ileri-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-ileri-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-ileri-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_fsi1_1","prompt":"App Router’da sayfa varsayılanı nedir?","choices":["use client zorunlu","React Sunucu Bileşenleri (RSC); vitrin ayrıca damgalanır","yalnız Express","Redis"],"correctIndex":1},{"id":"q_fsi1_2","prompt":"Server Action boş sku ile Fail-closed ne yapar?","choices":["{ok:true} basar","throw; işlem durur","istemci düzeltir","200 boş"],"correctIndex":1},{"id":"q_fsi1_3","prompt":"process.env sırrı istemci bileşeninde?","choices":["Güvenli","Yasak; vitrine iner, Fail-closed sunucuda tutar","RSC aynı","Docker yeter"],"correctIndex":1},{"id":"q_fsi2_1","prompt":"Cascading Failure nedir?","choices":["Tek servis yavaşlar","Bir servis düşünce zincir bütün fabrikayı durdurur","Redis dolu","RSC hatası"],"correctIndex":1},{"id":"q_fsi2_2","prompt":"Bilinmeyen olay tipinde Fail-closed?","choices":["Kuyruğa yazar","throw; işlem durur","201 basar","retry sonsuz"],"correctIndex":1},{"id":"q_fsi2_3","prompt":"Devre üç hatada?","choices":["Yine çağırır","Açık; zincir durur","201 uydurur","monolit açılır"],"correctIndex":1},{"id":"q_fsi3_1","prompt":"Redis kaçırınca Fail-closed okuma?","choices":["200 boş","throw; kaynak sor, yeşil uydurma yok","eski değeri sonsuz tutar","RSC düzeltir"],"correctIndex":1},{"id":"q_fsi3_2","prompt":"Rate limit tavanı dolunca?","choices":["200 geçer","429; istek durur","kuyruğa 201","retry sessiz"],"correctIndex":1},{"id":"q_fsi3_3","prompt":"Boş anahtar yazmak?","choices":["Map’e \"\" basar","Fail-closed; kayıt yok","Redis düzeltir","tavan yeter"],"correctIndex":1},{"id":"q_fsi4_1","prompt":"Redis sağlıksızken web?","choices":["Yine kalkar","Fail-closed; service_healthy olmadan kalkmaz","localhost uydurur","kök USER yeter"],"correctIndex":1},{"id":"q_fsi4_2","prompt":"REDIS_URL boş?","choices":["redis://localhost","Süreç durur; uydurma URL yok","Compose düzeltir","PONG uydurur"],"correctIndex":1},{"id":"q_fsi4_3","prompt":"Sır Dockerfile’a yazılır mı?","choices":["Evet, hız","Yasak; ortamdan okunur, imaja gömülmez","ENV SECRET yeter","kök USER gizler"],"correctIndex":1},{"id":"q_fsi5_1","prompt":"Test kırıkken yayin işi?","choices":["Paralel koşar","Fail-closed; needs: test ile durur","continue-on-error yeter","manuel SSH"],"correctIndex":1},{"id":"q_fsi5_2","prompt":"continue-on-error: true testte?","choices":["Hızlı teslim","İhanet; kırmızı yeşil görünür","Compose zorunlu","RSC düzeltir"],"correctIndex":1},{"id":"q_fsi5_3","prompt":"Yayın sırrı YAML’da?","choices":["Evet","Yasak; secrets bağlamı, metne yapışmaz","ENV README yeter","echo secret"],"correctIndex":1},{"id":"q_fsi6_1","prompt":"Redis PONG değilken /saglik?","choices":["200 ok","Fail-closed; işlem durur","eski PONG","Compose gizler"],"correctIndex":1},{"id":"q_fsi6_2","prompt":"Test kırık veya Redis yokken yayın?","choices":["Yine çıkar","kapı kırmızı; yayın yok","manuel SSH","continue-on-error"],"correctIndex":1},{"id":"q_fsi6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","Docker build deyince","İlk derste"],"correctIndex":1},{"id":"q_fsi_p1","prompt":"RSC varsayılanı nerede koşar?","choices":["Tarayıcı","Sunucu; vitrin use client","Redis","YAML"],"correctIndex":1},{"id":"q_fsi_p2","prompt":"Server Action doğrulama yoksa?","choices":["İstemci yeter","Fail-closed eylemde throw ister","RSC gizler","JWT yeter"],"correctIndex":1},{"id":"q_fsi_p3","prompt":"Monolit tek bant riski?","choices":["Hız","Cascading Failure; bir duruş hepsini durdurur","RSC yok","YAML yok"],"correctIndex":1},{"id":"q_fsi_p4","prompt":"Bilinmeyen olay?","choices":["Kuyruğa 201","Fail-closed; tip sözleşmesi","retry sonsuz","monolit açılır"],"correctIndex":1},{"id":"q_fsi_p5","prompt":"Redis kaçırma 200 boş?","choices":["Teslim","Yalan; kaynak sor veya dur","RSC doldurur","CI düzeltir"],"correctIndex":1},{"id":"q_fsi_p6","prompt":"Rate limit tavanı?","choices":["200","429","201","302"],"correctIndex":1},{"id":"q_fsi_p7","prompt":"Compose healthcheck neden durur?","choices":["Süs","Bağımlı servis sağlıksızken kalkmasın","YAML zorunlu değil","kök USER"],"correctIndex":1},{"id":"q_fsi_p8","prompt":"Sır imajda?","choices":["ENV SECRET","Yasak; ortam / secrets","Dockerfile ARG yeter","kök gizler"],"correctIndex":1}]$exam_fullstack_ileri$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_security_temel',
    'ac_security_temel',
    'Siber Güvenlik Temelleri, Ağ Güvenliği ve AÇS (OWASP) müfredat sınavı',
    70,
    $exam_security_temel$[{"id":"q_pow_security-temel-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-temel-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-temel-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-temel-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-temel-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-temel-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_sec1_1","prompt":"Gizlilik-bütünlük-erişilebilirlik üçlüsü (CIA) hangisidir?","choices":["Hız, fiyat, renk","Gizlilik, bütünlük, erişilebilirlik","Yalnız şifre uzunluğu","Yalnız güvenlik duvarı markası"],"correctIndex":1},{"id":"q_sec1_2","prompt":"Fail-closed (Hata Anında Kapalı) varlık adı boşken ne yapar?","choices":["Orta risk basar","İşlemi durdurur; kayıt uydurmaz","Yeşil tik basar","Log’u siler"],"correctIndex":1},{"id":"q_sec1_3","prompt":"Tehdit modeli en az neyi ister?","choices":["Slogan","Varlık, tehdit ve etki yazılı durur","Yalnız marka adı","Ekran yeşili"],"correctIndex":1},{"id":"q_sec2_1","prompt":"Port bu derste neye benzer?","choices":["Renk kodu","Daire kapısı; izin yoksa açılmaz","DNS boyası","Sertifika hash"],"correctIndex":1},{"id":"q_sec2_2","prompt":"Fail-closed izin listesinde olmayan porta ne yapar?","choices":["İçeri alır","Paketi düşürür; işlem durur","Orta port uydurur","Başlığı siler"],"correctIndex":1},{"id":"q_sec2_3","prompt":"Paket inceleme mantığı bu derste neyi okur?","choices":["Sömürü tarifi","Başlık: kaynak, hedef, port","Canlı saldırı adımı","Parola düz metni"],"correctIndex":1},{"id":"q_sec3_1","prompt":"Kullanıcı e-postasını SQL cümlesine `+` ile eklemek?","choices":["Hızlı teslim","Yasak; parametreli sorgu Fail-closed durur","Yalnız GET’te doğru","ORM zorunlu değil"],"correctIndex":1},{"id":"q_sec3_2","prompt":"Kullanıcı adını DOM’a basarken dürüst yol hangisidir?","choices":["innerHTML","textContent; innerHTML kapıyı açar","eval","document.write"],"correctIndex":1},{"id":"q_sec3_3","prompt":"CSRF jetonu yokken değiştiren istek?","choices":["200 yeter","Fail-closed; istek durur","Cookie yeter","GET aynı"],"correctIndex":1},{"id":"q_sec4_1","prompt":"Parolayı veritabanında düz metin saklamak?","choices":["Hızlı login","Yasak; hash (bcrypt/Argon2) Fail-closed ister","MD5 yeter","Log’a yazılır"],"correctIndex":1},{"id":"q_sec4_2","prompt":"Boş veya 12 karakterden kısa parolada dürüst yol hangisidir?","choices":["Hash yine basılır","İşlem durur; kayıt yok","Varsayılan parola","MFA kapatılır"],"correctIndex":1},{"id":"q_sec4_3","prompt":"Çok Faktörlü Kimlik Doğrulama (MFA) yokken oturum?","choices":["Parola yeter","Fail-closed; ikinci kapı yoksa oturum durur","Cookie yeter","Hash yeter"],"correctIndex":1},{"id":"q_sec5_1","prompt":"Güvenlik duvarı varsayılanı nedir?","choices":["Tüm port açık","Kapalı; listede yoksa paket düşer","HTTP her zaman","Sözlü izin"],"correctIndex":1},{"id":"q_sec5_2","prompt":"Etkileşim kuralları (RoE) yokken sızma testi?","choices":["Lab yeter","Fail-closed; yazılı izin yoksa test durur","Sözlü yeter","Canlı sistem serbest"],"correctIndex":1},{"id":"q_sec5_3","prompt":"Bu ders sömürü tarifi verir mi?","choices":["Evet, zorunlu","Hayır; kapıyı ve etiği öğretir","Yalnız Wireshark ile","PoC zorunlu"],"correctIndex":1},{"id":"q_sec6_1","prompt":"Mini projedeki kapatma sömürü labı mıdır?","choices":["Evet, zorunlu PoC","Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur","Yalnız SQLmap","Canlı hedef"],"correctIndex":1},{"id":"q_sec6_2","prompt":"Dört kapıdan biri açıkken teslim?","choices":["Yeşil basılır","Fail-closed; mühür vurulmaz","Üçü yeter","Port yeter"],"correctIndex":1},{"id":"q_sec6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Firewall açılınca"],"correctIndex":1},{"id":"q_sec_p1","prompt":"CIA üçlüsünde bütünlük neyi korur?","choices":["Hızı","Yazının yolda değişmemesini","Renk","Fiyatı"],"correctIndex":1},{"id":"q_sec_p2","prompt":"Erişilebilirlik düşünce üçlü durur mu?","choices":["Evet her zaman","Hayır; nöbetçi uyanık değilse kale yalan söyler","Yalnız gizlilik yeter","Hash yeter"],"correctIndex":1},{"id":"q_sec_p3","prompt":"TCP/IP bu derste nedir?","choices":["Renk","Paket etiketi: adres ve kapı","Parola","JWT"],"correctIndex":1},{"id":"q_sec_p4","prompt":"Varsayılan açık port politikası?","choices":["Güvenli","Yasak; deny-by-default","HTTP zorunlu","RoE yerine geçer"],"correctIndex":1},{"id":"q_sec_p5","prompt":"OWASP neyin listesidir?","choices":["Fiyat","Web uygulama risk sınıfları","DNS boyası","TTS sesi"],"correctIndex":1},{"id":"q_sec_p6","prompt":"Parametre bağlama ne keser?","choices":["CSS","Ham sorgu birleştirmeyi","MFA’yı","Hash’i"],"correctIndex":1},{"id":"q_sec_p7","prompt":"textContent neden durur?","choices":["Hız","Kullanıcı metnini işaret olarak basmamak","SQL hızlanır","Port açar"],"correctIndex":1},{"id":"q_sec_p8","prompt":"CSRF jetonu neyi kanıtlar?","choices":["DNS","İsteğin oturumdaki formdan geldiğini","Hash algoritmasını","CIA gizliliğini"],"correctIndex":1}]$exam_security_temel$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_security_orta',
    'ac_security_orta',
    'Uygulamalı Sızma Testi, Ağ Analizi ve Web Zafiyet Mimarisi müfredat sınavı',
    70,
    $exam_security_orta$[{"id":"q_pow_security-orta-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-orta-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-orta-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-orta-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-orta-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-orta-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_seco1_1","prompt":"Yazılı etkileşim kuralları (RoE) yokken keşif?","choices":["Kamu kaydı yeter","Fail-closed; izin yoksa keşif durur","Sözlü kapsam yeter","Tüm alan adları serbest"],"correctIndex":1},{"id":"q_seco1_2","prompt":"Açık kaynak istihbaratı (OSINT) bu derste nedir?","choices":["Kilit deliğine tel","Kamu tabelasını okumak; sömürü tarifi yok","Canlı port tarama","Parola kırma"],"correctIndex":1},{"id":"q_seco1_3","prompt":"Hedef izin listesinde yoksa dürüst yol hangisidir?","choices":["Yine tara","İşlem durur; hedef düşer","Orta hedef uydur","Nmap zorunlu"],"correctIndex":1},{"id":"q_seco2_1","prompt":"Wireshark bu derste neyi okur?","choices":["Sömürü yükü","Başlık: kaynak, hedef, kapı","Canlı parola düz metni","Üretim tüneli tarifi"],"correctIndex":1},{"id":"q_seco2_2","prompt":"Laboratuvar dışı arayüzde yakalama?","choices":["Bir bakayım yeter","Fail-closed; paket düşer","Nmap zorunlu","HTTP 80 açılır"],"correctIndex":1},{"id":"q_seco2_3","prompt":"Nmap bu derste nedir?","choices":["Saldırı bayrağı","Kendi lab rafının envanteri; listede yoksa durur","Komşu tarama tarifi","PoC zorunlu"],"correctIndex":1},{"id":"q_seco3_1","prompt":"Güvensiz doğrudan nesne referansı (IDOR) neyi atlar?","choices":["DNS kaydını","Nesnenin sahibini; kimlik yetmez","TLS sürümünü","Wireshark başlığını"],"correctIndex":1},{"id":"q_seco3_2","prompt":"Yetki kontrolü olmayan API uç noktasında yabancı kayıt?","choices":["200 yeter","Fail-closed; sahip eşleşmezse kayıt durur","GET serbest","ID sayıysa doğru"],"correctIndex":1},{"id":"q_seco3_3","prompt":"Sunucu taraflı istek sahteciliği (SSRF) kapısı ne ister?","choices":["Her URL","https ve izinli konak; özel ağ düşer","http yeter","IP her zaman"],"correctIndex":1},{"id":"q_seco4_1","prompt":"İmzasız JWT bu derste neye benzer?","choices":["Hologramlı kart","Fotokopi; Fail-closed jetonu durdurur","OAuth zorunlu başarı","Cookie yeter"],"correctIndex":1},{"id":"q_seco4_2","prompt":"Algoritma izin listesinde yokken dürüst yol hangisidir?","choices":["Yine decode","İşlem durur; jeton kabul edilmez","none varsayılan","HS256 her zaman"],"correctIndex":1},{"id":"q_seco4_3","prompt":"OAuth2 yönlendirme adresi listede değilse?","choices":["200 yeter","Fail-closed; işlem durur","Sorgu dizisi yeter","Yenileme jetonu URL’ye yazılır"],"correctIndex":1},{"id":"q_seco5_1","prompt":"Statik Uygulama Güvenlik Testi (SAST) neyi okur?","choices":["Canlı sömürü yükü","Kaynağı; çalıştırmadan kapı arar","Üretim trafiğini","JWT fotokopisini"],"correctIndex":1},{"id":"q_seco5_2","prompt":"Kaynakta sır kalıbı dururken dürüst yol hangisidir?","choices":["Yeşil basılır","Derleme durur; Fail-closed","Düşük şiddete indirilir","Log’a yazılır yeter"],"correctIndex":1},{"id":"q_seco5_3","prompt":"Sahipsiz, CWE’siz tarayıcı satırı?","choices":["Otomatik bilet","Fail-closed; fiş basılmaz","PoC zorunlu","Nmap yeter"],"correctIndex":1},{"id":"q_seco6_1","prompt":"Mini projedeki harita sömürü labı mıdır?","choices":["Evet, zorunlu PoC","Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur","Yalnız Nmap","Canlı hedef"],"correctIndex":1},{"id":"q_seco6_2","prompt":"Dört kapıdan biri açıkken teslim?","choices":["Yeşil basılır","Fail-closed; mühür vurulmaz","Üçü yeter","SAST yeter"],"correctIndex":1},{"id":"q_seco6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Tarayıcı yeşilince"],"correctIndex":1},{"id":"q_seco_p1","prompt":"Keşif önce ne ister?","choices":["Nmap bayrağı","Yazılı RoE ve izinli hedef","Canlı IP","PoC"],"correctIndex":1},{"id":"q_seco_p2","prompt":"OSINT kilit deliğine tel midir?","choices":["Evet","Hayır; kamu tabelasını okur","Wireshark zorunlu","JWT yeter"],"correctIndex":1},{"id":"q_seco_p3","prompt":"Wireshark üretim arayüzünde?","choices":["Serbest","Fail-closed; lab dışı paket düşer","HTTP 80","RoE yerine geçer"],"correctIndex":1},{"id":"q_seco_p4","prompt":"Nmap bu orta derste nedir?","choices":["Saldırı","Lab envanteri; listede yoksa durur","SSRF aracı","OAuth gişesi"],"correctIndex":1},{"id":"q_seco_p5","prompt":"IDOR neyi atlar?","choices":["TLS","Nesne sahibini","DNS","SAST"],"correctIndex":1},{"id":"q_seco_p6","prompt":"Yabancı kayitId ile GET?","choices":["200 doğru","Fail-closed; sahip eşleşmezse durur","GET her zaman","OAuth yeter"],"correctIndex":1},{"id":"q_seco_p7","prompt":"SSRF özel ağa giderse?","choices":["İçeriden bakılır","Getir durur; konak listede yok","http yeter","Nmap açar"],"correctIndex":1},{"id":"q_seco_p8","prompt":"JWT decode kapı mıdır?","choices":["Evet","Hayır; imza ve algoritma doğrulanır","Cookie yeter","none varsayılan"],"correctIndex":1}]$exam_security_orta$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_security_ileri',
    'ac_security_ileri',
    'İleri Düzey DevSecOps, Bulut Güvenliği ve Olay Müdahalesi (Incident Response) müfredat sınavı',
    70,
    $exam_security_ileri$[{"id":"q_pow_security-ileri-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-ileri-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-ileri-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-ileri-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-ileri-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_security-ileri-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_seci1_1","prompt":"Geliştirme-Güvenlik-İşletme (DevSecOps) boru hattında üç damga hangisidir?","choices":["Renk, hız, fiyat","SAST, DAST ve SCA yazılı durur","Yalnız log boyası","Root her zaman"],"correctIndex":1},{"id":"q_seci1_2","prompt":"SAST kırmızı iken dürüst yol hangisidir?","choices":["Uyarı ile yayın","Fail-closed; yayın durur","DAST yeter","SCA tavanı yükseltilir"],"correctIndex":1},{"id":"q_seci1_3","prompt":"SCA CVE tavanı aşılınca?","choices":["Yeşil basılır","Yayın durur; kamyon çıkmaz","Orta CVE uydurulur","Root açılır"],"correctIndex":1},{"id":"q_seci2_1","prompt":"En az yetki (least privilege) bu derste nedir?","choices":["Root her işte","İsimli rol; eylem listede yoksa durur","Joker * yeter","KMS isteğe bağlı"],"correctIndex":1},{"id":"q_seci2_2","prompt":"IAM eylemi `*` iken dürüst yol hangisidir?","choices":["Geçici kabul","Fail-closed; işlem durur","KMS yeter","Azure her zaman"],"correctIndex":1},{"id":"q_seci2_3","prompt":"KMS anahtar kimliği boşken şifreleme?","choices":["Düz metin yeter","Fail-closed; şifreleme durur","Root açar","Log silinir"],"correctIndex":1},{"id":"q_seci3_1","prompt":"Olay müdahalesinde mühürlü torba nedir?","choices":["Sızma tarifi","Hash’li günlük zinciri; silme durur","Root açma","Kamyon damgası"],"correctIndex":1},{"id":"q_seci3_2","prompt":"Günlük silme eylemi gelince dürüst yol hangisidir?","choices":["Önce sil, sonra yedek","Fail-closed; torba durur","SOC yeter","SAST yeter"],"correctIndex":1},{"id":"q_seci3_3","prompt":"Hash zinciri kopukken rapor?","choices":["Yeşil basılır","Fail-closed; rapor durur","Orta hash uydurulur","Root imza yeter"],"correctIndex":1},{"id":"q_seci4_1","prompt":"SIEM bu derste nedir?","choices":["Sızma aracı","İzinli kaynaktan imzalı olay toplama","Root açma","Joker IAM"],"correctIndex":1},{"id":"q_seci4_2","prompt":"Kaynak listede yokken olay?","choices":["Yine avlanır","Fail-closed; olay düşer","SOC sözlü yeter","Taban uydurulur"],"correctIndex":1},{"id":"q_seci4_3","prompt":"Taban sıfır veya tanımsızken anomali?","choices":["Her sapma saldırı","Fail-closed; av durur","Yeşil basılır","DAST yeter"],"correctIndex":1},{"id":"q_seci5_1","prompt":"Sıfır Güven (Zero Trust) konum güveni midir?","choices":["Evet, içeride yeter","Hayır; kimlik, cihaz, segment her istekte sorulur","VPN yeter","Root yeter"],"correctIndex":1},{"id":"q_seci5_2","prompt":"Segment listede yokken paket?","choices":["İç ağ serbest","Fail-closed; paket düşer","IAM joker yeter","SIEM yeter"],"correctIndex":1},{"id":"q_seci5_3","prompt":"Mikro-segmentasyon neyi böler?","choices":["Yalnız fiyatı","Düz ağı odalara; yanal geçiş durur","KMS’i","SAST damgasını"],"correctIndex":1},{"id":"q_seci6_1","prompt":"Mini projedeki senaryo sömürü labı mıdır?","choices":["Evet, zorunlu PoC","Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur","Yalnız root","Canlı hesap"],"correctIndex":1},{"id":"q_seci6_2","prompt":"Beş kapıdan biri açıkken teslim?","choices":["Yeşil basılır","Fail-closed; mühür vurulmaz","Dördü yeter","SIEM yeter"],"correctIndex":1},{"id":"q_seci6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Bulut ayaktayken"],"correctIndex":1},{"id":"q_seci_p1","prompt":"DevSecOps boru hattı önce ne ister?","choices":["Root","SAST, DAST ve SCA damgası","Canlı IP","PoC"],"correctIndex":1},{"id":"q_seci_p2","prompt":"SAST kırmızı iken yayın?","choices":["Uyarı yeter","Fail-closed; yayın durur","DAST yeter","SCA yeter"],"correctIndex":1},{"id":"q_seci_p3","prompt":"IAM joker eylem (`*`)?","choices":["Geçici root","Fail-closed; işlem durur","KMS yeter","VPN yeter"],"correctIndex":1},{"id":"q_seci_p4","prompt":"KMS anahtarı boşken?","choices":["Düz metin","Şifreleme durur","Root açar","Log silinir"],"correctIndex":1},{"id":"q_seci_p5","prompt":"Günlük silme olay müdahalesinde?","choices":["Önce sil","Fail-closed; torba durur","SOC yeter","SAST yeter"],"correctIndex":1},{"id":"q_seci_p6","prompt":"Hash zinciri kopukken rapor?","choices":["Yeşil","Rapor durur","Orta hash","Root imza"],"correctIndex":1},{"id":"q_seci_p7","prompt":"SIEM izinsiz kaynakta?","choices":["Yine avlanır","Olay düşer; kaynak listede yok","Taban uydurulur","Nmap açar"],"correctIndex":1},{"id":"q_seci_p8","prompt":"Tabansız anomali?","choices":["Her sapma saldırı","Fail-closed; av durur","Yeşil","DAST yeter"],"correctIndex":1}]$exam_security_ileri$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_ai_temel',
    'ac_ai_temel',
    'Yapay Zekâ ve Veri Analizi (Prompt ve Veri Bilimi) müfredat sınavı',
    70,
    $exam_ai_temel$[{"id":"q_pow_ai-temel-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-10","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-11","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-12","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-7","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-8","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-9","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_ai_1","prompt":"Bağlam penceresi dolunca sessiz özet?","choices":["Doğru","Uydurma; iş bölünür veya bellek yazılır","Zorunlu","Hızlıdır"],"correctIndex":1},{"id":"q_ai_2","prompt":"«JSON gibi yaz» şema mıdır?","choices":["Evet","Hayır; şema ve parse kapısı gerekir","Zod’suz yeter","CSS"],"correctIndex":1},{"id":"q_ai_3","prompt":"Sır tarife girince?","choices":["Orta değer uydurulur","Üretim kapanır","Log’a yazılır","Few-shot artar"],"correctIndex":1},{"id":"q_ai_4","prompt":"Few-shot örnekleri her istekte değişirse?","choices":["İyidir","Regresyon; örnek sabit kalır","Daha yaratıcı","JSON zorunlu"],"correctIndex":1},{"id":"q_ai_5","prompt":"Getirici boşken model ne yapar?","choices":["Wikipedia basar","Dürüst «belgede yok»; üretim durur","Uydurur","PII ekler"],"correctIndex":1},{"id":"q_ai_6","prompt":"Paydasız yüzde?","choices":["Kanıt","Yalan; payda yazılı olmadan basılmaz","RAG","Token"],"correctIndex":1},{"id":"q_ai_7","prompt":"Boş tutarı 0 yapmak?","choices":["Temizlik","Cehaleti gizler; eksik ayrı durur","int64","SQL"],"correctIndex":1},{"id":"q_ai_8","prompt":"Eşik altı skorla iddia?","choices":["OK","Kapalı; alıntı yoksa cümle yok","Few-shot","JSON"],"correctIndex":1},{"id":"q_ai_9","prompt":"Tarif katmanları hangileri?","choices":["Yalnız kullanıcı","sistem / kullanıcı / biçim","Yalnız JSON","Yalnız RAG"],"correctIndex":1},{"id":"q_ai_10","prompt":"Tablo yokken ortalama istemek?","choices":["Veri bilimi","Boş tezgâh; üretim durur","Pandas zorunlu","Prompt yeter"],"correctIndex":1},{"id":"q_ai_11","prompt":"n=8 yüzde yetmiş?","choices":["Referandum","Vitrin mankeni; n dipnot ister","RAG","JWT"],"correctIndex":1},{"id":"q_ai_12","prompt":"PDF yüklemek okumak mıdır?","choices":["Evet","Hayır; getiri ve alıntı okumaktır","Evet OCR","Token"],"correctIndex":1},{"id":"q_ai_13","prompt":"Baraj kaçtır?","choices":["50","70+","100","Yok"],"correctIndex":1},{"id":"q_ai_14","prompt":"Satın alma belge midir?","choices":["Evet","Hayır; belge sınav barajından sonra","Evet hash","Yalnız satın alma"],"correctIndex":1},{"id":"q_ai_15","prompt":"PII log’a girer mi?","choices":["Evet hata ayıklama","Hayır","JSON modunda evet","RAG’te evet"],"correctIndex":1},{"id":"q_ai_16","prompt":"Parse hatasında çökmek?","choices":["Nezaket","Hayır; yeniden sorulur","Zorunlu","Fail-open"],"correctIndex":1},{"id":"q_ai_17","prompt":"Bu eğitim kaç bölüm?","choices":["6","12","3","8"],"correctIndex":1},{"id":"q_ai_18","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı üstünde","İlk prompt’ta","PDF’te"],"correctIndex":1},{"id":"q_ai_19","prompt":"3D pasta kanıt mıdır?","choices":["Evet","Hayır; süs grafiği reddedilir","n büyükse evet","RAG"],"correctIndex":1},{"id":"q_ai_20","prompt":"Kaynak satırı olmayan RAG cevabı?","choices":["Teslim","Teslim değil","Few-shot yeter","JSON yeter"],"correctIndex":1}]$exam_ai_temel$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_ux_temel',
    'ac_ux_temel',
    'Dijital Ürün Tasarımı (UI/UX ve Figma Masterclass) müfredat sınavı',
    70,
    $exam_ux_temel$[{"id":"q_pow_ux-temel-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-10","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-11","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-12","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-7","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-8","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-9","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_ux_1","prompt":"UX ile UI farkı nedir?","choices":["Aynıdır","UX yol/acı, UI yüz/piksel","UI araştırma","UX yalnız renk"],"correctIndex":1},{"id":"q_ux_2","prompt":"Beğeni kabul ölçütü müdür?","choices":["Evet","Hayır; görev tamamlanır","Figma’da evet","WCAG"],"correctIndex":1},{"id":"q_ux_3","prompt":"Yönlendirici araştırma sorusu?","choices":["İyidir","«güzel değil mi» tuzağı; reddedilir","Kart sıralama","Jeton"],"correctIndex":1},{"id":"q_ux_4","prompt":"Stok fotoğraf persona?","choices":["Kanıt","Masal; acı ve iş yazılı durur","Yolculuk","IA"],"correctIndex":1},{"id":"q_ux_5","prompt":"Organigram menü?","choices":["IA","Jargon; kullanıcı dili etiket olur","WCAG","Token"],"correctIndex":1},{"id":"q_ux_6","prompt":"Tel çerçevede palet?","choices":["Erken sadakat","Yasak; tartışma süse kaymasın","Token","Handoff"],"correctIndex":1},{"id":"q_ux_7","prompt":"Kopyala-yapıştır düğme?","choices":["Component","Borç; ana bileşen güncellenmez","Auto layout","8px"],"correctIndex":1},{"id":"q_ux_8","prompt":"Üç birincil düğme?","choices":["Hiyerarşi","Odak kırılır; birincil tek durur","WCAG","Persona"],"correctIndex":1},{"id":"q_ux_9","prompt":"Serbest hex her ekranda?","choices":["Token","Sistem ölür; jeton adı gerekir","Prototype","IA"],"correctIndex":1},{"id":"q_ux_10","prompt":"Statik slayt akış mıdır?","choices":["Evet","Hayır; tıklanır prototip görev test eder","Figma link yeter","WCAG"],"correctIndex":1},{"id":"q_ux_11","prompt":"İkon-only düğme?","choices":["Şık","Etiket yoksa kör kapı","Token","8px"],"correctIndex":1},{"id":"q_ux_12","prompt":"«Figma’da var bakarsınız» teslim mi?","choices":["Evet","Hayır; ölçü ve durum notu gerekir","Prototype yeter","IA yeter"],"correctIndex":1},{"id":"q_ux_13","prompt":"Baraj kaçtır?","choices":["50","70+","100","Yok"],"correctIndex":1},{"id":"q_ux_14","prompt":"Satın alma belge midir?","choices":["Evet","Hayır; belge sınav barajından sonra","Evet hash","Yalnız satın alma"],"correctIndex":1},{"id":"q_ux_15","prompt":"8px ızgara ne işe yarar?","choices":["Renk","Ritim; rastgele boşluk atölyeyi bozar","SQL","JWT"],"correctIndex":1},{"id":"q_ux_16","prompt":"Bu eğitim kaç bölüm?","choices":["7","12","3","6"],"correctIndex":1},{"id":"q_ux_17","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı üstünde","İlk Figma’da","Beğenide"],"correctIndex":1},{"id":"q_ux_18","prompt":"Görüşmesiz Figma?","choices":["Hızlı","Tahmin; defter önce gelir","Token","WCAG"],"correctIndex":1},{"id":"q_ux_19","prompt":"Kontrast eşiği süs müdür?","choices":["Evet silinir","Hayır; erişim barajıdır","Yalnız dark mode","IA"],"correctIndex":1},{"id":"q_ux_20","prompt":"Masterclass kapanış paketi?","choices":["Yalnız palet","Kanıt, iskelet, kalıp, baraj, tutanak","Yalnız hex","Yalnız slayt"],"correctIndex":1}]$exam_ux_temel$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_excel_masterclass',
    'ac_excel_masterclass',
    'Sıfırdan Uygulamalı Excel ve Yapay Zekâ Destekli Veri Analizi Masterclass müfredat sınavı',
    70,
    $exam_excel_masterclass$[{"id":"q_pow_excel-masterclass-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_excel-masterclass-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_excel-masterclass-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_excel-masterclass-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_excel-masterclass-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_excel-masterclass-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_exc1_1","prompt":"SAY (COUNT) neyi sayar?","choices":["Her dolu hücreyi","Yalnız sayı değerini; metin ve boşluk düşer","Yalnız boşluğu","Biçim rengini"],"correctIndex":1},{"id":"q_exc1_2","prompt":"Fail-closed n=0 iken ORTALAMA (AVERAGE) ne yapar?","choices":["Sıfır kâr basar","İşlemi durdurur; ortalama uydurmaz","SUM’u kopyalar","Metni 0 sayar"],"correctIndex":1},{"id":"q_exc1_3","prompt":"Hücrede biçim ile değer farkı nedir?","choices":["Aynıdır","Biçim görünen etiket, değer hesaplanan sayıdır","Yalnız renk","Yalnız formül çubuğu"],"correctIndex":1},{"id":"q_exc2_1","prompt":"DÜŞEYARA (VLOOKUP) varsayılan eşleşmesi nedir?","choices":["Tam eşleşme","Yaklaşık eşleşme; sırasız SKU’da yanlış fiyat basar","Sola bakış","XLOOKUP ile aynı"],"correctIndex":1},{"id":"q_exc2_2","prompt":"Fail-closed anahtar boşken ÇAPRAZARA (XLOOKUP) ne yapar?","choices":["İlk satırı basar","İşlemi durdurur; fiyat uydurmaz","Yaklaşık SKU seçer","VLOOKUP’a düşer"],"correctIndex":1},{"id":"q_exc2_3","prompt":"XLOOKUP, VLOOKUP’tan hangi kapıyı açar?","choices":["Yalnız SUM","Sola bakış ve varsayılan tam eşleşme","Makro imzası","Pivot önbelleği"],"correctIndex":1},{"id":"q_exc3_1","prompt":"Fatura numarasını Özet Tablo’da TOPLA etmek?","choices":["Ciroyu verir","Yasaktır; kimlik SAY ile sayılır","Dilimleyici düzeltir","XLOOKUP yeter"],"correctIndex":1},{"id":"q_exc3_2","prompt":"Fail-closed kaynak sütunu yokken dilimleyici ne yapar?","choices":["Hayalet dilim açar","İşlemi durdurur; özet basılmaz","İlk sütunu kullanır","SUM uydurur"],"correctIndex":1},{"id":"q_exc3_3","prompt":"Kaynak büyüyünce pivot ne ister?","choices":["Eski önbellek yeter","Yenileme; dünkü defter bugünkü rapor olmaz","Yalnız renk","Makro imzası"],"correctIndex":1},{"id":"q_exc4_1","prompt":"Yinelenenleri kaldırmadan önce ne yazılır?","choices":["Renk","Anahtar sütun; boş anahtarda silme durur","Yalnız ilk sütun","Makro adı"],"correctIndex":1},{"id":"q_exc4_2","prompt":"Fail-closed «N/A» tutarı ne yapar?","choices":["Sıfır sayar","Kaydı düşürür; SUM’a katmaz","AVERAGE’a 0 basar","Pivot düzeltir"],"correctIndex":1},{"id":"q_exc4_3","prompt":"Koşullu biçim bu derste nedir?","choices":["Süs paleti","Eşik cümlesi; kural yoksa boya durur","XLOOKUP yerine geçer","Dilimleyici"],"correctIndex":1},{"id":"q_exc5_1","prompt":"Copilot formülü yapıştırmadan önce ne durur?","choices":["Beğeni","Parse ve tam eşleşme; yaklaşık VLOOKUP düşer","Makro adı","Renk"],"correctIndex":1},{"id":"q_exc5_2","prompt":"Fail-closed imzasız VBA makrosu?","choices":["Auto_Open yeter","Çalışmaz; işlem durur","Copilot imza basar","Pivot gizler"],"correctIndex":1},{"id":"q_exc5_3","prompt":"Müşteri satırı ChatGPT tarifine girer mi?","choices":["Evet, zorunlu","Hayır; kişisel veri tarife yapışmaz","Yalnız telefon","Makro yeter"],"correctIndex":1},{"id":"q_exc6_1","prompt":"Mini projedeki dashboard canlı Copilot mudur?","choices":["Evet, zorunlu model","Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur","Yalnız VBA","Canlı dosya"],"correctIndex":1},{"id":"q_exc6_2","prompt":"Dört kapıdan biri açıkken teslim?","choices":["Yeşil basılır","Fail-closed; mühür vurulmaz","Üçü yeter","Grafik yeter"],"correctIndex":1},{"id":"q_exc6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Pivot açılınca"],"correctIndex":1},{"id":"q_exc_p1","prompt":"Hücre bu derste nedir?","choices":["Renk","Adres, değer ve biçim kutusu","Makro","Dilim"],"correctIndex":1},{"id":"q_exc_p2","prompt":"SUM boşluğu nasıl sayar?","choices":["Hata","Sıfır gibi atlar; sen kâr sanırsan yalan","COUNT ile aynı","XLOOKUP"],"correctIndex":1},{"id":"q_exc_p3","prompt":"COUNT ile COUNTA farkı?","choices":["Yok","COUNT sayı, COUNTA dolu hücre","İkisi makro","Pivot düzeltir"],"correctIndex":1},{"id":"q_exc_p4","prompt":"VLOOKUP sola bakar mı?","choices":["Evet","Hayır; XLOOKUP iki yöne bakar","Yalnız FALSE ile","Dilim ile"],"correctIndex":1},{"id":"q_exc_p5","prompt":"XLOOKUP varsayılan eşleşme?","choices":["Yaklaşık","Tam eşleşme","SUM","Makro"],"correctIndex":1},{"id":"q_exc_p6","prompt":"IF kapısı ne ister?","choices":["Renk","Mantık cümlesi; VE/VEYA daraltır","Pivot","VBA"],"correctIndex":1},{"id":"q_exc_p7","prompt":"Pivot kimlik sütunu?","choices":["SUM","SAY; kimlik toplanmaz","AVERAGE","XLOOKUP"],"correctIndex":1},{"id":"q_exc_p8","prompt":"Dilimleyici neyi keser?","choices":["DNS","Pivot önbelleğini; kaynak dışı sütun durur","Makro imzasını","TTS"],"correctIndex":1}]$exam_excel_masterclass$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_google_ads_masterclass',
    'ac_google_ads_masterclass',
    'A’dan Z’ye Google Ads ve Arama Motoru Pazarlaması Masterclass müfredat sınavı',
    70,
    $exam_google_ads_masterclass$[{"id":"q_pow_google-ads-masterclass-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_google-ads-masterclass-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_google-ads-masterclass-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_google-ads-masterclass-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_google-ads-masterclass-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_google-ads-masterclass-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_gads1_1","prompt":"Google Ads hesabında kampanya açılmadan önce ne durur?","choices":["Renkli logo","Dönüşüm eylemi ve fatura; yoksa harcama açılmaz","Yalnız tıklama hedefi","Görüntülü ağ"],"correctIndex":1},{"id":"q_gads1_2","prompt":"Fail-closed dönüşüm eylemi boşken ne yapar?","choices":["Tıklama yeter sayılır","İşlemi durdurur; bütçe uydurulmaz","Smart Bidding açar","Display’e düşer"],"correctIndex":1},{"id":"q_gads1_3","prompt":"Hesap mimarisinde doğru kat sırası nedir?","choices":["Reklam > hesap > grup","Hesap > kampanya > reklam grubu > reklam","Yalnız anahtar kelime","Yalnız fatura"],"correctIndex":1},{"id":"q_gads2_1","prompt":"Geniş eşleme dönüşüm hacmi yokken Fail-closed ne yapar?","choices":["Max Clicks yeter","Açılmaz; 30 dönüşüm ve negatif ister","Tam eşlemeye düşer","Display düzeltir"],"correctIndex":1},{"id":"q_gads2_2","prompt":"Sıralı eşleme (phrase) neyi ister?","choices":["Harf harf aynı sıra","Sorgunun anahtar anlamını içermesini","Yalnız geniş","Yalnız Display"],"correctIndex":1},{"id":"q_gads2_3","prompt":"Tam eşleme yabancı niyeti alır mı?","choices":["Evet, her yakın kelime","Hayır; niyet sapınca anahtar durur","Negatif yeter","QS düzeltir"],"correctIndex":1},{"id":"q_gads3_1","prompt":"Arama Ağı ile Görüntülü Ağı aynı kampanyada?","choices":["Evet, hız için","Yasaktır; ağ karışır, niyet kaybolur","QS düzeltir","Broad yeter"],"correctIndex":1},{"id":"q_gads3_2","prompt":"Fail-closed dönüşüm yokken görüntülü satış raporu?","choices":["Gösterim cirodur","Basılmaz; bakış kasa değildir","tROAS açılır","Tam eşleme yeter"],"correctIndex":1},{"id":"q_gads3_3","prompt":"Arama kampanyası neyi satın alır?","choices":["Her bakışı","Niyetli sorguyu; tabela sorana cevap verir","Yalnız video","Yalnız e-posta"],"correctIndex":1},{"id":"q_gads4_1","prompt":"Dönüşüm etiketi nerede patlar?","choices":["Her sayfada","Teşekkür sayfasında; sipariş id ile","Yalnız ana sayfada","Display’de"],"correctIndex":1},{"id":"q_gads4_2","prompt":"Fail-closed sipariş id boşken ne yapar?","choices":["Yine satış basar","Etiketi durdurur; çift sayım açılmaz","tROAS düzeltir","GTM gizler"],"correctIndex":1},{"id":"q_gads4_3","prompt":"Etiket kırıkken Smart Bidding?","choices":["Hızlı öğrenir","Yasak; yalanı öğrenir, harcama durur","Max Clicks yeter","QS yeter"],"correctIndex":1},{"id":"q_gads5_1","prompt":"Kalite Puanı üçlüsü nedir?","choices":["Renk, logo, fiyat","Beklenen tıklama, reklam ilgisi, açılış sayfası","Yalnız CPC","Yalnız Display"],"correctIndex":1},{"id":"q_gads5_2","prompt":"Fail-closed QS 5 altındayken bütçe?","choices":["İki kat açılır","Artmaz; ölçek durur","tROAS gizler","Broad düzeltir"],"correctIndex":1},{"id":"q_gads5_3","prompt":"RSA başlığında anahtar yoksa?","choices":["Google düzeltir","İlgi düşer; Fail-closed boş başlık durur","QS 10 basılır","GTM yeter"],"correctIndex":1},{"id":"q_gads6_1","prompt":"Mini projedeki kampanya canlı Ads hesabı mıdır?","choices":["Evet, zorunlu hesap","Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur","Yalnız Display","Canlı fatura"],"correctIndex":1},{"id":"q_gads6_2","prompt":"Dört kapıdan biri açıkken teslim?","choices":["Yeşil basılır","Fail-closed; mühür vurulmaz","Üçü yeter","Tıklama yeter"],"correctIndex":1},{"id":"q_gads6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Tabela açılınca"],"correctIndex":1},{"id":"q_gads_p1","prompt":"Tabela bu derste nedir?","choices":["Renk","Google Ads hesabı ve kampanya katı","Yalnız logo","Display"],"correctIndex":1},{"id":"q_gads_p2","prompt":"Tıklama ciro mudur?","choices":["Evet","Hayır; dönüşüm yoksa harcama durur","QS yeter","Broad yeter"],"correctIndex":1},{"id":"q_gads_p3","prompt":"Smart Bidding dönüşümsüz?","choices":["Hızlı öğrenir","Yasak; yalanı öğrenir","Max Clicks gizler","PMax zorunlu"],"correctIndex":1},{"id":"q_gads_p4","prompt":"Geniş eşleme 30 dönüşümsüz?","choices":["Açılır","Fail-closed durur","Tam’a düşer","Display düzeltir"],"correctIndex":1},{"id":"q_gads_p5","prompt":"Sıralı eşleme ne içerir?","choices":["Yalnız harf sırası","Anahtar anlamını","Her sorguyu","Görüntülüyü"],"correctIndex":1},{"id":"q_gads_p6","prompt":"Arama ve görüntülü aynı kampanya?","choices":["Evet","Hayır; ağ karışır","QS birleştirir","GTM birleştirir"],"correctIndex":1},{"id":"q_gads_p7","prompt":"Görüntülü bakış satış mıdır?","choices":["Evet","Hayır; bakış kasa değildir","tROAS basar","Broad basar"],"correctIndex":1},{"id":"q_gads_p8","prompt":"GTM tetik nerede?","choices":["Ana sayfa","Teşekkür + sipariş id","Her tıklama","Display"],"correctIndex":1}]$exam_google_ads_masterclass$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_meta_ads_masterclass',
    'ac_meta_ads_masterclass',
    'Meta Business Suite ile Instagram ve Facebook Reklamcılığı Masterclass müfredat sınavı',
    70,
    $exam_meta_ads_masterclass$[{"id":"q_pow_meta-ads-masterclass-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_meta-ads-masterclass-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_meta-ads-masterclass-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_meta-ads-masterclass-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_meta-ads-masterclass-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_meta-ads-masterclass-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_meta1_1","prompt":"Ads Manager kampanyası açılmadan önce ne durur?","choices":["Yalnız beğeni","Sayfa, piksel ve fatura; yoksa harcama açılmaz","Yalnız Reels","Yalnız CBO"],"correctIndex":1},{"id":"q_meta1_2","prompt":"Fail-closed piksel boşken ne yapar?","choices":["Erişim yeter sayılır","İşlemi durdurur; bütçe uydurulmaz","Lookalike açar","CBO düzeltir"],"correctIndex":1},{"id":"q_meta1_3","prompt":"Business Suite bu derste nedir?","choices":["Yalnız sohbet","Vitrin; sayfa ve piksel orada durur","Yalnız Instagram şifresi","Yalnız e-posta"],"correctIndex":1},{"id":"q_meta2_1","prompt":"Lookalike kaynağı sayfa beğenisi olunca Fail-closed?","choices":["Yüzde 10 yeter","Durur; kaynak purchase ister","CBO düzeltir","Reels düzeltir"],"correctIndex":1},{"id":"q_meta2_2","prompt":"Özel kitle bu derste nedir?","choices":["Her ilgi yığını","Kasa fişi: satın alan veya piksel olayı","Yalnız yaş aralığı","Yalnız şehir"],"correctIndex":1},{"id":"q_meta2_3","prompt":"Piksel yokken kitle oluşturmak?","choices":["İlgi yeter","Fail-closed; kitle durur","CAPI gizler","ABO yeter"],"correctIndex":1},{"id":"q_meta3_1","prompt":"Kreatif kazananı ne seçer?","choices":["Beğeni","Piksel purchase; beğeni kasa değildir","Yalnız Reels süresi","Yalnız CBO"],"correctIndex":1},{"id":"q_meta3_2","prompt":"Fail-closed piksel yokken format testi?","choices":["On yüz açılır","Durur; test basılmaz","Lookalike yeter","ABO gizler"],"correctIndex":1},{"id":"q_meta3_3","prompt":"Öğrenme fazında bütçeyi ikiye katlamak?","choices":["Hızlı çıkar","Öğrenmeyi kırar; ölçek o anda durur","CAPI düzeltir","Carousel düzeltir"],"correctIndex":1},{"id":"q_meta4_1","prompt":"Piksel ile CAPI nasıl birleşir?","choices":["Yalnız piksel yeter","Aynı event_id ile dedup; biri eksikse harcama durur","Beğeni birleştirir","CBO birleştirir"],"correctIndex":1},{"id":"q_meta4_2","prompt":"Fail-closed event_id boşken ne yapar?","choices":["İki satış basar","Durur; çift sayım ROAS’ı şişirmez","Lookalike düzeltir","Reels düzeltir"],"correctIndex":1},{"id":"q_meta4_3","prompt":"Purchase değeri sıfırken ROAS?","choices":["8 kabul","Uydurulmaz; değer yoksa ölçü durur","CPA gizler","ABO gizler"],"correctIndex":1},{"id":"q_meta5_1","prompt":"CBO neyi dağıtır?","choices":["Yalnız beğeniyi","Kampanya cüzdanını setlere; piksel yoksa açılmaz","Yalnız Reels’i","Yalnız e-postayı"],"correctIndex":1},{"id":"q_meta5_2","prompt":"Fail-closed öğrenmede bütçe %50 artınca?","choices":["Hızlı çıkar","Ölçek durur; öğrenme kırılır","ROAS 8 basılır","Lookalike yeter"],"correctIndex":1},{"id":"q_meta5_3","prompt":"A/B testinde iki kapı birden?","choices":["Hızlı kazanan","Yasak; tek değişken durur","CBO birleştirir","CAPI birleştirir"],"correctIndex":1},{"id":"q_meta6_1","prompt":"Mini projedeki huni canlı Ads Yöneticisi midir?","choices":["Evet, zorunlu hesap","Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur","Yalnız Reels","Canlı fatura"],"correctIndex":1},{"id":"q_meta6_2","prompt":"Dört kapıdan biri açıkken teslim?","choices":["Yeşil basılır","Fail-closed; mühür vurulmaz","Üçü yeter","Erişim yeter"],"correctIndex":1},{"id":"q_meta6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Vitrin açılınca"],"correctIndex":1},{"id":"q_meta_p1","prompt":"Vitrin bu derste nedir?","choices":["Renk","Meta Business Suite ve sayfa","Yalnız Reels","Yalnız e-posta"],"correctIndex":1},{"id":"q_meta_p2","prompt":"Erişim satış mıdır?","choices":["Evet","Hayır; piksel yoksa harcama durur","CBO yeter","Beğeni yeter"],"correctIndex":1},{"id":"q_meta_p3","prompt":"Lookalike beğeni kaynağı?","choices":["Yüzde 10 yeter","Fail-closed; purchase ister","ABO gizler","Reels gizler"],"correctIndex":1},{"id":"q_meta_p4","prompt":"Özel kitle nedir?","choices":["İlgi yığını","Kasa fişi: satın alan / piksel","Yalnız yaş","Yalnız şehir"],"correctIndex":1},{"id":"q_meta_p5","prompt":"Kreatif kazananı?","choices":["Beğeni","Piksel purchase","Süre","CBO"],"correctIndex":1},{"id":"q_meta_p6","prompt":"Öğrenmede %50 bütçe?","choices":["Hız","Kırılır; ölçek durur","ROAS 8","Lookalike"],"correctIndex":1},{"id":"q_meta_p7","prompt":"Piksel + CAPI?","choices":["Yalnız piksel","event_id dedup","Beğeni","ABO"],"correctIndex":1},{"id":"q_meta_p8","prompt":"event_id boşken?","choices":["İki satış","Durur; çift sayım yok","CBO düzeltir","Reels düzeltir"],"correctIndex":1}]$exam_meta_ads_masterclass$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_eticaret_masterclass',
    'ac_eticaret_masterclass',
    'Sıfırdan E-Ticaret ve Pazar Yeri Yönetimi Masterclass müfredat sınavı',
    70,
    $exam_eticaret_masterclass$[{"id":"q_pow_eticaret-masterclass-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_eticaret-masterclass-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_eticaret-masterclass-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_eticaret-masterclass-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_eticaret-masterclass-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_eticaret-masterclass-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_etic1_1","prompt":"Pazar yerinde tezgâh kimin vitrinidir?","choices":["Senin depon","Pazar yerinin; sen satıcı kaydısın","Yalnız kargo firmasının","Yalnız reklamın"],"correctIndex":1},{"id":"q_etic1_2","prompt":"Fail-closed stok sıfırken ilan ne yapar?","choices":["Sipariş alır","Durur; stoksuz satış açılmaz","Komisyonu sıfırlar","İade kapatır"],"correctIndex":1},{"id":"q_etic1_3","prompt":"Brüt ciro kâr mıdır?","choices":["Evet","Hayır; komisyon, kargo ve iade düşmeden kâr basılmaz","Yalnız kargo yeter","Puan yeter"],"correctIndex":1},{"id":"q_etic2_1","prompt":"Mağaza açılmadan önce hangi dörtlü durur?","choices":["Logo ve renk","Vergi, unvan, IBAN ve kargo sözleşmesi","Yalnız reklam","Yalnız stok fotoğrafı"],"correctIndex":1},{"id":"q_etic2_2","prompt":"Fail-closed IBAN boşken ne yapar?","choices":["Nakit kabul eder","Ödemeyi durdurur; mağaza açılmaz","Komşunun IBAN’ını kullanır","Puan düzeltir"],"correctIndex":1},{"id":"q_etic2_3","prompt":"«Kendi kuryem var» kargo sözleşmesi midir?","choices":["Evet","Hayır; pazar yeri yazılı kargo fişi ister","Yalnız Trendyol’da evet","Puan yeter"],"correctIndex":1},{"id":"q_etic3_1","prompt":"İlan başlığında ne durur?","choices":["Yalnız emoji","Marka, ürün ve nitelik; spam yığın yoktur","Yalnız fiyat","Rakip adı"],"correctIndex":1},{"id":"q_etic3_2","prompt":"Fail-closed barkod (GTIN) boşken ne yapar?","choices":["Yine yayınlar","İlanı durdurur; kimlik uydurulmaz","SKU’yu barkod sayar","SEO düzeltir"],"correctIndex":1},{"id":"q_etic3_3","prompt":"Çalıntı stok fotoğrafı ile ilan?","choices":["Hızlı teslim","Yasaktır; görsel sahip değilse ilan durur","Filigran yeter","Kategori düzeltir"],"correctIndex":1},{"id":"q_etic4_1","prompt":"İki pazar yerinde stok nasıl durur?","choices":["İki ayrı yalan sayaç","Tek merkez defter; vitrin kopyadır","Yalnız Trendyol sayar","Fiyat yeter"],"correctIndex":1},{"id":"q_etic4_2","prompt":"Fail-closed rezerv doluyken ikinci satış?","choices":["Yine satılır","Durur; oversell açılmaz","İade sonra düzelir","Puan gizler"],"correctIndex":1},{"id":"q_etic4_3","prompt":"Fiyat maliyet + komisyon tabanının altında?","choices":["Rekabet için doğru","İlan durur; kör savaş kâr basmaz","Pazar yeri tamamlar","SEO düzeltir"],"correctIndex":1},{"id":"q_etic5_1","prompt":"«Teslim» ne zaman basılır?","choices":["Paket çıkınca","Takip numarası durunca; fişsiz teslim yok","Müşteri susunca","Puan yeşilince"],"correctIndex":1},{"id":"q_etic5_2","prompt":"Fail-closed mesaj 24 saati aşınca?","choices":["Sipariş kapanır","Puan durur; SLA yalanı basılmaz","Kargo düzeltir","İade kapanır"],"correctIndex":1},{"id":"q_etic5_3","prompt":"İade parası ürün kaydı yokken?","choices":["Hemen basılır","Durur; ürün fişi önce gelir","Puan yeter","Komisyon düzeltir"],"correctIndex":1},{"id":"q_etic6_1","prompt":"Mini projedeki vitrin canlı Trendyol hesabı mıdır?","choices":["Evet, zorunlu hesap","Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur","Yalnız Hepsiburada","Canlı kargo"],"correctIndex":1},{"id":"q_etic6_2","prompt":"Dört kapıdan biri açıkken teslim?","choices":["Yeşil basılır","Fail-closed; mühür vurulmaz","Üçü yeter","Sipariş yeter"],"correctIndex":1},{"id":"q_etic6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Mağaza açılınca"],"correctIndex":1},{"id":"q_etic_p1","prompt":"Tezgâh bu derste nedir?","choices":["Senin depon","Pazar yeri vitrini; sen satıcı kaydısın","Kargo","Reklam"],"correctIndex":1},{"id":"q_etic_p2","prompt":"Stok sıfırken ilan?","choices":["Satılır","Fail-closed durur","Komisyon sıfır","Puan yeter"],"correctIndex":1},{"id":"q_etic_p3","prompt":"Brüt ciro kâr mı?","choices":["Evet","Hayır; komisyon ve kargo düşer","Puan yeter","SEO yeter"],"correctIndex":1},{"id":"q_etic_p4","prompt":"Mağaza dörtlüsü?","choices":["Logo","Vergi, unvan, IBAN, kargo","Yalnız IBAN","Yalnız renk"],"correctIndex":1},{"id":"q_etic_p5","prompt":"IBAN boşken ödeme?","choices":["Nakit","Durur","Komşu IBAN","Puan"],"correctIndex":1},{"id":"q_etic_p6","prompt":"Kendi kurye sözleşme mi?","choices":["Evet","Hayır; yazılı kargo fişi","Trendyol’da evet","Puan"],"correctIndex":1},{"id":"q_etic_p7","prompt":"Başlık ne taşır?","choices":["Emoji","Marka, ürün, nitelik","Yalnız fiyat","Rakip"],"correctIndex":1},{"id":"q_etic_p8","prompt":"Barkod boşken ilan?","choices":["Yayın","Durur; GTIN yok","SKU yeter","SEO"],"correctIndex":1}]$exam_eticaret_masterclass$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_canva_masterclass',
    'ac_canva_masterclass',
    'Canva ve Yapay Zekâ İle Dijital Tasarım Masterclass müfredat sınavı',
    70,
    $exam_canva_masterclass$[{"id":"q_pow_canva-masterclass-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_canva-masterclass-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_canva-masterclass-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_canva-masterclass-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_canva-masterclass-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_canva-masterclass-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_cnv1_1","prompt":"Brand Kit bu derste nedir?","choices":["Yalnız şablon pazarı","Logo, hex renk ve tipi hiyerarşisi kalıbı","Yalnız Magic Write","Yalnız PDF"],"correctIndex":1},{"id":"q_cnv1_2","prompt":"Fail-closed hex boşken palet ne yapar?","choices":["Güzel renk uydurur","Durur; renk basılmaz","Magic düzeltir","Reels yeter"],"correctIndex":1},{"id":"q_cnv1_3","prompt":"Her karede üçüncü süs fontu?","choices":["Tazelik","Kalıbı bozar; iki aile durur","SEO düzeltir","Baskı yeter"],"correctIndex":1},{"id":"q_cnv2_1","prompt":"Reels boyutu nedir?","choices":["1:1 kare","9:16 dikey; feed kare ile aynı değildir","A4","16:9 yatay zorunlu"],"correctIndex":1},{"id":"q_cnv2_2","prompt":"Fail-closed üç CTA bir karede?","choices":["Daha çok tıklama","Durur; tek mesaj basılır","Magic düzeltir","Hashtag yeter"],"correctIndex":1},{"id":"q_cnv2_3","prompt":"Kit yokken Magic Resize?","choices":["Her boyu basar","Durur; kalıpsız kopya yok","Reels gizler","PDF yeter"],"correctIndex":1},{"id":"q_cnv3_1","prompt":"Baskı payı (bleed) en az kaç mm durur?","choices":["0, sığsın","3 mm; kenar kesimine pay","Yalnız 1 px","Magic seçer"],"correctIndex":1},{"id":"q_cnv3_2","prompt":"Fail-closed metin taşınca?","choices":["Matbaa keser yeter","Teslim durur; taşma basılmaz","Küçült gizler","RGB düzeltir"],"correctIndex":1},{"id":"q_cnv3_3","prompt":"Bir slaytta tüm rapor?","choices":["Kapsamlı teslim","Yasaktır; bir slayt bir fikir","Punto 8 yeter","PDF düzeltir"],"correctIndex":1},{"id":"q_cnv4_1","prompt":"Magic Write çıktısı marka sesi midir?","choices":["Evet, ham basılır","Hayır; taslak, kalıptan geçmeden ses olmaz","Lisans yeter","Reels yeter"],"correctIndex":1},{"id":"q_cnv4_2","prompt":"Fail-closed PII prompt’tayken?","choices":["Kişiselleştirir","Üretim durur; tarife girmez","Magic gizler","PDF yeter"],"correctIndex":1},{"id":"q_cnv4_3","prompt":"Lisansı bilinmeyen Magic görsel?","choices":["Güzel yeter","Durur; marka diye basılmaz","Filigran yeter","RGB düzeltir"],"correctIndex":1},{"id":"q_cnv5_1","prompt":"Matbaa PDF hangi renk profilini ister?","choices":["Yalnız sRGB","CMYK; RGB kâğıtta soluk kalır","Yalnız hex","Magic seçer"],"correctIndex":1},{"id":"q_cnv5_2","prompt":"Fail-closed baskıda 72 dpi?","choices":["Ekran yeter","Durur; 300 dpi ister","PNG düzeltir","Reels yeter"],"correctIndex":1},{"id":"q_cnv5_3","prompt":"Web ve baskı aynı dosya mı?","choices":["Evet, PDF yeter","Hayır; işe göre profil ve dpi ayrı durur","Magic birleştirir","Logo yeter"],"correctIndex":1},{"id":"q_cnv6_1","prompt":"Mini projedeki paket canlı Canva hesabı mıdır?","choices":["Evet, zorunlu hesap","Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur","Yalnız Magic","Canlı matbaa"],"correctIndex":1},{"id":"q_cnv6_2","prompt":"Dört kapıdan biri açıkken teslim?","choices":["Yeşil basılır","Fail-closed; mühür vurulmaz","Üçü yeter","Şablon yeter"],"correctIndex":1},{"id":"q_cnv6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","Şablon açılınca"],"correctIndex":1},{"id":"q_cnv_p1","prompt":"Kalıp bu derste nedir?","choices":["Şablon pazarı","Brand Kit: logo, hex, tipo","Yalnız PDF","Reels"],"correctIndex":1},{"id":"q_cnv_p2","prompt":"Hex boşken palet?","choices":["Uydurulur","Durur","Magic düzeltir","RGB yeter"],"correctIndex":1},{"id":"q_cnv_p3","prompt":"Üçüncü süs fontu?","choices":["Tazelik","Kalıbı bozar","SEO","Baskı"],"correctIndex":1},{"id":"q_cnv_p4","prompt":"Reels boyu?","choices":["1:1","9:16","A4","16:9 zorunlu"],"correctIndex":1},{"id":"q_cnv_p5","prompt":"Üç CTA bir kare?","choices":["Tıklama","Durur; tek mesaj","Hashtag","Magic"],"correctIndex":1},{"id":"q_cnv_p6","prompt":"Kit yokken Resize?","choices":["Her boy","Durur","Reels gizler","PDF"],"correctIndex":1},{"id":"q_cnv_p7","prompt":"Bleed en az?","choices":["0","3 mm","1 px","Magic"],"correctIndex":1},{"id":"q_cnv_p8","prompt":"Taşan metin?","choices":["Kesilir yeter","Teslim durur","Küçült","RGB"],"correctIndex":1}]$exam_canva_masterclass$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_linkedin_masterclass',
    'ac_linkedin_masterclass',
    'LinkedIn İle Profesyonel Marka İnşası ve B2B Müşteri Bulma Masterclass müfredat sınavı',
    70,
    $exam_linkedin_masterclass$[{"id":"q_pow_linkedin-masterclass-1","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_linkedin-masterclass-2","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_linkedin-masterclass-3","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_linkedin-masterclass-4","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_linkedin-masterclass-5","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_linkedin-masterclass-6","prompt":"Uygulama (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_lnk1_1","prompt":"All-Star bu derste ne ister?","choices":["Yalnız yeşil çubuk","Fotoğraf, rol+vaat başlık, kanıtlı özet","Yalnız emoji","Yalnız 500 bağlantı"],"correctIndex":1},{"id":"q_lnk1_2","prompt":"Fail-closed fotoğraf yokken profil?","choices":["Yine yayınlanır","Durur; kartvizit boş kalmaz","Algoritma düzeltir","InMail yeter"],"correctIndex":1},{"id":"q_lnk1_3","prompt":"«Guru | Ninja» başlık All-Star mıdır?","choices":["Evet, güçlü","Hayır; slogan durur, rol+vaat yazılır","Hashtag yeter","Premium yeter"],"correctIndex":1},{"id":"q_lnk2_1","prompt":"Algoritma dostu gönderi önce ne ister?","choices":["30 hashtag","Kanca ve kanıt; tuzak CTA yoktur","Yalnız emoji","InMail"],"correctIndex":1},{"id":"q_lnk2_2","prompt":"Fail-closed «yorumla 🔥» tuzak?","choices":["Dağıtımı büyütür","Gönderiyi durdurur; beğeni avı yoktur","Premium düzeltir","Navigator yeter"],"correctIndex":1},{"id":"q_lnk2_3","prompt":"Hashtag yığını (30 etiket)?","choices":["Keşif","Durur; en çok üç etiket","All-Star düzeltir","Banner yeter"],"correctIndex":1},{"id":"q_lnk3_1","prompt":"ICP bu derste nedir?","choices":["Herkes","Unvan, sektör, ölçek ve coğrafya süzgeci","Yalnız şehir","Yalnız hashtag"],"correctIndex":1},{"id":"q_lnk3_2","prompt":"Fail-closed ICP boşken Sales Navigator listesi?","choices":["2 000 kişi kaydolur","Durur; yığın hedef açılmaz","Premium düzeltir","InMail yeter"],"correctIndex":1},{"id":"q_lnk3_3","prompt":"«Tüm CTO’lar» kayıtlı arama mıdır?","choices":["Evet, geniş net","Hayır; yığın durur, süzgeç yazılır","Algoritma seçer","Banner yeter"],"correctIndex":1},{"id":"q_lnk4_1","prompt":"İlk InMail ne taşır?","choices":["15 dk zoom teklifi","Özgün bağlam ve tek soru; ilk cümle satış değildir","Fiyat listesi","50 hashtag"],"correctIndex":1},{"id":"q_lnk4_2","prompt":"Fail-closed kopya duvar 50 kişi?","choices":["Verim","Durur; spam sayılır","Premium gizler","Navigator yeter"],"correctIndex":1},{"id":"q_lnk4_3","prompt":"ICP yokken InMail kotası?","choices":["Herkese harcanır","Durur; yığın yazı açılmaz","Algoritma seçer","Banner yeter"],"correctIndex":1},{"id":"q_lnk5_1","prompt":"Bireysel marka cümlesi ne ister?","choices":["Her konu","Kimin sorunu ve kanıt; niş tek durur","Yalnız selfie","Yalnız Premium"],"correctIndex":1},{"id":"q_lnk5_2","prompt":"Fail-closed kanıtsız «düşünce lideri»?","choices":["Güçlü duruş","Unvan basılmaz; marka durur","Algoritma verir","InMail yeter"],"correctIndex":1},{"id":"q_lnk5_3","prompt":"Haftada üç niş birden?","choices":["Zenginlik","Tutarsız yüz; takvim durur","Hashtag birleştirir","Navigator yeter"],"correctIndex":1},{"id":"q_lnk6_1","prompt":"Mini projedeki pipeline canlı LinkedIn hesabı mıdır?","choices":["Evet, zorunlu hesap","Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur","Yalnız Navigator","Canlı InMail"],"correctIndex":1},{"id":"q_lnk6_2","prompt":"Dört kapıdan biri açıkken teslim?","choices":["Yeşil basılır","Fail-closed; mühür vurulmaz","Üçü yeter","Bağlantı yeter"],"correctIndex":1},{"id":"q_lnk6_3","prompt":"Sertifika ne zaman basılır?","choices":["Satın alınca","Sınav barajı (≥70) üstünde","İlk derste","All-Star yeşilince"],"correctIndex":1},{"id":"q_lnk_p1","prompt":"Kartvizit bu derste nedir?","choices":["Kağıt","LinkedIn profili; All-Star kanıt ister","InMail","Banner"],"correctIndex":1},{"id":"q_lnk_p2","prompt":"Fotoğraf yokken profil?","choices":["Yayın","Durur","Algoritma","Premium"],"correctIndex":1},{"id":"q_lnk_p3","prompt":"Guru Ninja başlık?","choices":["Güçlü","Slogan durur","Hashtag","Premium"],"correctIndex":1},{"id":"q_lnk_p4","prompt":"Gönderi önce?","choices":["30 etiket","Kanca ve kanıt","Emoji","InMail"],"correctIndex":1},{"id":"q_lnk_p5","prompt":"Yorumla tuzak?","choices":["Dağıtım","Durur","Premium","Navigator"],"correctIndex":1},{"id":"q_lnk_p6","prompt":"30 hashtag?","choices":["Keşif","Durur; en çok üç","All-Star","Banner"],"correctIndex":1},{"id":"q_lnk_p7","prompt":"ICP nedir?","choices":["Herkes","Unvan, sektör, ölçek, coğrafya","Şehir","Hashtag"],"correctIndex":1},{"id":"q_lnk_p8","prompt":"ICP boş liste?","choices":["2 000 kişi","Durur","Premium","InMail"],"correctIndex":1}]$exam_linkedin_masterclass$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  )
ON CONFLICT (course_id) DO UPDATE
SET
  title = EXCLUDED.title,
  pass_score = EXCLUDED.pass_score,
  questions_json = EXCLUDED.questions_json,
  updated_at = now();

-- HARD RESET: eski RAIL / jenerik tohumları tamamen düşür (büyüme SKU dışı — DELETE/PURGE).
DELETE FROM public.academy_certificates
WHERE course_id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_ai_orta', 'ac_ai_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
   OR course_id NOT IN ('ac_ai_agent_temel', 'ac_ai_agent_orta', 'ac_ai_agent_ileri', 'ac_python_temel', 'ac_python_orta', 'ac_python_ileri', 'ac_fullstack_temel', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_security_temel', 'ac_security_orta', 'ac_security_ileri', 'ac_ai_temel', 'ac_ux_temel', 'ac_excel_masterclass', 'ac_google_ads_masterclass', 'ac_meta_ads_masterclass', 'ac_eticaret_masterclass', 'ac_canva_masterclass', 'ac_linkedin_masterclass');

DELETE FROM public.academy_exam_attempts
WHERE exam_id IN (
  SELECT id FROM public.academy_exams
  WHERE course_id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_ai_orta', 'ac_ai_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
     OR course_id NOT IN ('ac_ai_agent_temel', 'ac_ai_agent_orta', 'ac_ai_agent_ileri', 'ac_python_temel', 'ac_python_orta', 'ac_python_ileri', 'ac_fullstack_temel', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_security_temel', 'ac_security_orta', 'ac_security_ileri', 'ac_ai_temel', 'ac_ux_temel', 'ac_excel_masterclass', 'ac_google_ads_masterclass', 'ac_meta_ads_masterclass', 'ac_eticaret_masterclass', 'ac_canva_masterclass', 'ac_linkedin_masterclass')
);

DELETE FROM public.academy_lesson_completions
WHERE course_id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_ai_orta', 'ac_ai_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
   OR course_id NOT IN ('ac_ai_agent_temel', 'ac_ai_agent_orta', 'ac_ai_agent_ileri', 'ac_python_temel', 'ac_python_orta', 'ac_python_ileri', 'ac_fullstack_temel', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_security_temel', 'ac_security_orta', 'ac_security_ileri', 'ac_ai_temel', 'ac_ux_temel', 'ac_excel_masterclass', 'ac_google_ads_masterclass', 'ac_meta_ads_masterclass', 'ac_eticaret_masterclass', 'ac_canva_masterclass', 'ac_linkedin_masterclass');

DELETE FROM public.academy_purchases
WHERE course_id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_ai_orta', 'ac_ai_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
   OR course_id NOT IN ('ac_ai_agent_temel', 'ac_ai_agent_orta', 'ac_ai_agent_ileri', 'ac_python_temel', 'ac_python_orta', 'ac_python_ileri', 'ac_fullstack_temel', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_security_temel', 'ac_security_orta', 'ac_security_ileri', 'ac_ai_temel', 'ac_ux_temel', 'ac_excel_masterclass', 'ac_google_ads_masterclass', 'ac_meta_ads_masterclass', 'ac_eticaret_masterclass', 'ac_canva_masterclass', 'ac_linkedin_masterclass');

DELETE FROM public.academy_exams
WHERE course_id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_ai_orta', 'ac_ai_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
   OR course_id NOT IN ('ac_ai_agent_temel', 'ac_ai_agent_orta', 'ac_ai_agent_ileri', 'ac_python_temel', 'ac_python_orta', 'ac_python_ileri', 'ac_fullstack_temel', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_security_temel', 'ac_security_orta', 'ac_security_ileri', 'ac_ai_temel', 'ac_ux_temel', 'ac_excel_masterclass', 'ac_google_ads_masterclass', 'ac_meta_ads_masterclass', 'ac_eticaret_masterclass', 'ac_canva_masterclass', 'ac_linkedin_masterclass');

DELETE FROM public.academy_courses
WHERE id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_ai_orta', 'ac_ai_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
   OR id NOT IN ('ac_ai_agent_temel', 'ac_ai_agent_orta', 'ac_ai_agent_ileri', 'ac_python_temel', 'ac_python_orta', 'ac_python_ileri', 'ac_fullstack_temel', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_security_temel', 'ac_security_orta', 'ac_security_ileri', 'ac_ai_temel', 'ac_ux_temel', 'ac_excel_masterclass', 'ac_google_ads_masterclass', 'ac_meta_ads_masterclass', 'ac_eticaret_masterclass', 'ac_canva_masterclass', 'ac_linkedin_masterclass');

DELETE FROM public.price_catalog_entries
WHERE module_key = 'academy'
  AND (
    unit_key IN ('course:rail-temel', 'course:rayli-sinyal-emniyet', 'course:yz-icerik-gorsel-uretim', 'course:ileri-prompt-muhendisligi', 'course:bim-iso-19650', 'course:siber-guvenlik-kvkk-iso-27001', 'course:python-veri-analizi-is-zekasi', 'course:kurumsal-esg-surdurulebilirlik', 'course:agile-scrum-masterlik', 'course:bulut-mimarisi-devops', 'course:ui-ux-design-systems', 'course:fintek-acik-bankacilik', 'course:ai-orta', 'course:ai-ileri', 'course:devops-temel', 'course:devops-orta', 'course:devops-ileri', 'course:flutter-temel', 'course:flutter-orta', 'course:flutter-ileri', 'course:ds-temel', 'course:ds-orta', 'course:ds-ileri', 'course:sec-temel', 'course:sec-orta', 'course:sec-ileri', 'course:db-temel', 'course:db-orta', 'course:db-ileri', 'course:arch-temel', 'course:arch-orta', 'course:arch-ileri', 'course:pm-temel', 'course:pm-orta', 'course:pm-ileri', 'course:ux-orta', 'course:ux-ileri', 'course:w3-temel', 'course:w3-orta', 'course:w3-ileri', 'course:ex-temel', 'course:ex-orta', 'course:ex-ileri', 'course:mkt-temel', 'course:mkt-orta', 'course:mkt-ileri', 'course:mnt-temel', 'course:mnt-orta', 'course:mnt-ileri', 'course:pd-temel', 'course:pd-orta', 'course:pd-ileri', 'course:cld-temel', 'course:cld-orta', 'course:cld-ileri', 'course:eng-temel', 'course:eng-orta', 'course:eng-ileri', 'course:qa-temel', 'course:qa-orta', 'course:qa-ileri', 'course:jav-temel', 'course:jav-orta', 'course:jav-ileri', 'course:rn-temel', 'course:rn-orta', 'course:rn-ileri', 'course:gam-temel', 'course:gam-orta', 'course:gam-ileri', 'course:mlo-temel', 'course:sys-temel', 'course:canva-temel', 'course:pra-temel', 'course:linkedin-temel', 'course:cad-temel')
    OR (
      unit_key LIKE 'course:%'
      AND unit_key NOT IN ('course:ai-agent-temel', 'course:ai-agent-orta', 'course:ai-agent-ileri', 'course:python-temel', 'course:python-orta', 'course:python-ileri', 'course:fullstack-temel', 'course:fullstack-orta', 'course:fullstack-ileri', 'course:security-temel', 'course:security-orta', 'course:security-ileri', 'course:ai-temel', 'course:ux-temel', 'course:excel-masterclass', 'course:google-ads-masterclass', 'course:meta-ads-masterclass', 'course:eticaret-masterclass', 'course:canva-masterclass', 'course:linkedin-masterclass')
    )
  );
