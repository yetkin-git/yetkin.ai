# MASTER PLAN — Mimari & Ticari Durum Tespiti, `yetkin_muze` Elmas Madenciliği ve Yeni Yol Haritası

| Alan | Değer |
|---|---|
| **Rapor Kimliği** | `docs/MASTER_PLAN_TESPIT_RAPORU.md` |
| **Rol** | Ürün Mimarı (Product Architect) · B2B/B2C Ticari Stratejist (Growth & Monetization) · Full-Stack Denetçi |
| **Tarih** | 17 Kasım 2026 |
| **Kapsam** | Canlı kod tabanı (`app/`, `lib/`, `components/`, `prisma/`, `supabase/`, `packages/`, `proxy.ts`, `.system_docs/`), `yetkin_muze/`, `archived/`, `apps/rail-is/` |
| **Yöntem** | Statik kod envanteri + şema okuma + rota haritalama + kopy (copy) analizi. **Hiçbir kaynak dosya değiştirilmedi.** P&L, CAC, cohort verisi yoktur; bu rapor kodun ne söylediğini okur. |
| **İlişki** | `docs/101. TESPIT_VE_MASTER_PLAN_CARBON.md` (14 Kasım) bu raporun öncelidir. **Bu rapor 101'i geçersiz kılmaz; üç gün içinde değişen gerçeği ekler.** 101'den sonra canlıya giren E-Ticaret Kokpiti, Kariyer Koçu, Admin Sosyal Masası ve B2B Fırsat Motoru 101'de yoktu. |
| **Ölçülen Baz** | Canlı: **59 sayfa · 117 API rotası · 1.092 lib `.ts` · 249 bileşen · 57 Prisma modeli · 519 test dosyası (~78.900 satır)** |
| **Müze Baz** | `yetkin_muze/`: **158 sayfa · 559 API rotası · 2.282 lib `.ts` · 1.081 bileşen · 248 Prisma modeli · 607 test dosyası (~113.000 satır)** |

---

## 0. Yönetici Özeti — Tek Sayfada Gerçek

> **Canlı ürün, 14 Kasım'daki "steril kurs sitesi" değil artık.** Üç günde ciddi miktarda ticari kas eklendi: çok kanallı e-ticaret kokpiti (`lib/commerce/`, 56 dosya), AI kariyer koçu, gerçek sosyal medya yayını (LinkedIn/X/Meta), B2B giden satış kuyruğu ve 10 araçlı AI Tezgâh. Motor gerçekten iyi.
>
> **Ama para hâlâ üç somut delikten kaçıyor:**
> 1. **Fiyat sayfası yok.** `app/fiyatlandirma` da yok, `app/pricing` de. Fiyat yalnız kurs detay sayfasında görünüyor. Alıcı "ne kadar?" sorusunu 5 saniyede cevaplayamıyor.
> 2. **Tek düzenli gelir rayı (E-Ticaret aylık lisansı) karanlıkta.** `lib/commerce/subscription.ts` `commerce:monthly` katalog satırını okuyor; bu satır **hiçbir migration'da tohumlanmamış**. Satır yoksa `readCommerceMonthlyAmount` `null` döner ve kasa **422 "Aylık tutar katalogda açık değil"** verir. Yani kod var, ürün var, MRR yok.
> 3. **1 numaralı ana sayfa CTA'sı kayıt duvarına çarpıyor.** Ana sayfa birincil butonu "Ücretsiz Yetkinlik Testine Gir" → `/academy/01_office_ai/seviye` → oturum yoksa `ExemptionGuestCard` (kayıt/giriş) basılıyor. Ziyaretçi **hiçbir değer almadan** önce e-posta veriyor. Tek anonim değer yüzeyi AI Tezgâh (günde 1 üretim) ve o ikincil butonda.
>
> **Müzede elmas var, ama 101 raporunun işaret ettiği elmaslar değil.** 101 "Studio peronları" ve "Scout iş radarı"nı işaret etmişti; röntgen şunu gösteriyor: Scout **gerçek ilan taramıyor**, `PLATFORM_QUEUE_TEMPLATES` içindeki uydurma şablonlardan besleniyor. Studio/DevLabs 780 dosyalık bir ajans holdingi. Bunlar elmas değil.
> **Gerçek elmaslar şunlar:** (a) `lib/pricing/public-pricing-vitrine.ts` + `module-pricing-defaults.ts` ile gelen **dürüstlük etiketli kamu fiyat vitrini**; (b) `lib/hibe/*` + `components/hibe/grant-idea-validator-widget.tsx` ile gelen **anonim hibe uygunluk kancası**; (c) `lib/matchmaking/opportunity-pool.json` **hazır ilk-iş kataloğu**; (d) `lib/seo/surface-routes.ts` **programatik SEO sicili**; (e) `lib/career/roadmap-engine.ts` + `swot-engine.ts` **değerlendirme motorları**; (f) `lib/copy/*` **~700 KB Türkçe ürün kopyası**.

**Tek cümlelik hüküm:** *Motor hazır, vitrin eksik. Üç günde yazılan ticari kası görünür kılmak için yeni özellik değil, dört dosyalık vitrin ve kasa işi gerekiyor.*

---

# BÖLÜM 1 — Mevcut `yetkin.ai` Projesi: Mimari & Ticari Durum Tespiti

## 1.1 Teknoloji Yığını ve Altyapı

### 1.1.1 Çekirdek yığın

| Katman | Teknoloji | Kanıt (dosya) | Not |
|---|---|---|---|
| Framework | **Next.js 16.2.9** (App Router, `proxy.ts` kenar) | `package.json`, `proxy.ts` | Next 16'da `middleware.ts` yok; tek kenar girişi `proxy.ts`. `AGENTS.md` bu sürümün eğitim verisinden farklı olduğunu söyler. |
| UI | **React 19.2.7**, Tailwind 4.3.1 | `package.json`, `app/globals.css` (167 KB) | |
| Dil | TypeScript 5.9.2, `strict` + `noUncheckedIndexedAccess` | `tsconfig.json` | Tip disiplini yüksek. |
| Veritabanı | **PostgreSQL (Supabase)** + **Prisma 7.8** (`@prisma/adapter-pg`) | `prisma/schema/*.prisma` (10 dosya, 57 model) | Şema modül başına bölünmüş; kernel ayrı. |
| Kimlik | **Supabase Auth** (`@supabase/ssr` 0.12.4) + JWT (jose) | `lib/kernel/auth/*`, `lib/kernel/security/edge-jwt.ts` | Google OAuth butonu mevcut: `components/auth/google-continue-button.tsx`. |
| AI | **Gemini ağırlıklı** + OpenAI + Anthropic, tek kapı | `lib/kernel/ai/llm-gateway.ts` (22 KB), `model-roles.ts` | 7 canlı rol + 1 mühürlü ölü (`VIDEO_GEN`). Model kimliği kilitli. |
| Ödeme | **PayTR Merchant** (iFrame + 3D Secure) | `lib/kernel/payments/paytr/*` (11 dosya) | **Tek ray.** Stripe/iyzico yok (Anayasa A2 gereği). Pazaryeri Split portu `not_configured`. |
| Kuyruk / zamanlayıcı | **Inngest 4.11** | `lib/kernel/jobs/inngest.ts`, `app/api/(kernel)/jobs/inngest/route.ts` | PayTR valör, emanet TTL. |
| Depolama | **Cloudflare R2** (S3 uyumlu) | `lib/media/r2-*.ts`, `supabase/storage/*.sql` | Akademi sesleri CDN'de. |
| E-posta | SMTP + Resend (auth hook) | `lib/kernel/notice/*` | |
| Hız tavanı | Redis REST (Upstash) veya süreç-içi bellek | `lib/kernel/security/rate-limit-runtime.ts` | Kısmi config → **fail-closed**. Doğru tasarım. |
| Gözlem | GA4 sunucu (`@google-analytics/data`) + yapısal `logEvent` | `lib/kernel/telemetry/*`, `lib/kernel/observability/log.ts` | Sentry/GlitchTip DSN env'de yok (.env.example'da `.system_docs` runbook'u ister). |
| Native istemci | **Expo / React Native** (`apps/rail-is`, paket `yetkin.ai-is`) | `apps/rail-is/` (15 ekran) | `/api/v1` hop sicilini tüketir. |
| Test | Vitest + Playwright + pg-lab | `tests/` (519 dosya), `playwright.config.ts`, `vitest.pg.config.ts` | CI: `npm run verify:prebuild` (11 kapı) + lint + typecheck + test. |
| Hosting | **Vercel** (`.vercel/`, `vercel.json`) | | Sitemap `force-dynamic`. |

### 1.1.2 Mimari karar (Anayasa B1)

**Pragmatik Monolit + İnce Sözleşme Paketi (`@yetkin/kernel`) + Tek Native İstemci.** Yeni oda = `lib/dronlar/kayit.ts` içine bir satır + `DronBayrakları`. Ayrı repo/DB/kimlik yok. Bu disiplin gerçekten uygulanmış: `lib/kernel` dikey motor import etmiyor, ESLint ve `verify:boundaries` bunu kırıyor.

Oda kayıt defteri (`lib/dronlar/kayit.ts`) bugün 8 satır:

| Oda | Yol | Durum | Kamu vitrini |
|---|---|---|---|
| `dashboard` | `/dashboard` | **Açık** | ✅ |
| `academy` | `/academy` | **Açık** | ✅ |
| `career` | `/career` | **Açık** | ✅ |
| `freelancer` | `/freelancer` | **KAPALI (410)** — `kapali: true` + `FREELANCER_PUBLIC_SURFACE_LOCKED` + `MARKETPLACE_SPLIT_LIVE=false` üçlü kilit | ✅ (nav'dan düşer) |
| `tezgah` | `/tezgah` | **Açık** | ❌ (`vitrin: false` ama `/tezgah` sitemap'te) |
| `junior` | `/junior` | Açık ama **izin listesi + kasa kilitli** | ❌ |
| `young` | `/young` | **KAPALI** | ❌ |
| `yetkinhibe` | `/yetkinhibe` | **KAPALI** (yalnız `/api/yetkinhibe/*` canlı) | ❌ |

Donmuş disk odaları (`FROZEN_DISK_ROOMS`): `studio`, `devlabs`, `kurumsal`, `hibe`, `arena`, `pazaryeri`, `social`.

---

## 1.2 Mevcut Özellik Envanteri

### 1.2.1 Kamu yüzeyi (ziyaretçi, oturumsuz)

| Yüzey | Yol | Durum | Ticari rol |
|---|---|---|---|
| Ana sayfa | `/` | **Canlı** — hero + 4 adımlı zincir + 7 tezgâh kartı + 5 uzmanlık + SSS + JSON-LD | Vitrin. **Fiyat yok, sosyal kanıt yok.** |
| Rehber | `/rehber` | Canlı — 4 adımlı tek makale + SSS | SEO. **Tek içerik sayfası.** |
| Akademi vitrini | `/academy` | Canlı — 6 kart (OFF-101, OFF-201, EC-102, SM-103, BOT-104, PR-105) | **Faz 1 nakit.** |
| Kurs detayı | `/academy/[slug]` | Canlı — müfredat, kazanım, sınav kapısı, `PurchaseButton`, muafiyet linki | **Kasa.** |
| Ücretsiz ders | `/academy/[slug]/oyna` | Canlı — kayıtsız oynatıcı, `paywallLocked` | **Kanca.** |
| Seviye testi | `/academy/01_office_ai/seviye` | Canlı — **oturumsuzsa kayıt duvarı** | **Kırık kanca.** |
| Sertifika doğrulama | `/academy/dogrula/[hash]` | Canlı — kamuya açık, oturumsuz | **Güven.** |
| AI Tezgâh | `/tezgah` | **Canlı — 10 araç** | **Tek anonim değer yüzeyi.** |
| Kariyer | `/career` | Canlı — oturumsuzsa `PublicCareerPanel`, oturumluysa kokpit | Kanıt. |
| Kamu kanıt kartı | `/vize/[id]` | Canlı — oturumsuz, rozet + doğrulama bağı | **Viral yüzey.** |
| Mağaza vitrini | `/magaza/[slug]` | Canlı — Commerce ACTIVE mağaza | B2B vitrin. |
| Yasal | `/legal/*` (5 slug) | Canlı | Uyum. |
| İletişim / Hakkımızda | `/iletisim`, `/hakkimizda` | Canlı | |
| Kasa dönüş | `/kasa`, `/kasa/donus` | Canlı | PayTR dönüş. |
| **Fiyatlandırma** | **YOK** | **EKSİK** | **En büyük ticari delik.** |
| **Blog / içerik merkezi** | **YOK** | **EKSİK** | SEO derinliği yok. |
| **E-posta bülteni / lead magnet formu** | **YOK** | **EKSİK** | `lib/` içinde `newsletter`, `lead-magnet`, `email-capture` araması **0 sonuç**. |

### 1.2.2 AI Tezgâh — gerçekten çalışan üretim yüzeyi

`lib/tezgah/catalog.ts` 10 araç tanımlıyor; 7'si sunucu/LLM, 3'ü tarayıcı-içi:

| # | Araç | Tip | Kota tüketir | Çıktı |
|---|---|---|---|---|
| 1 | E-Ticaret Ürün Kartı | Sunucu (LLM, `LITE_STREAM`) | ✅ | Markdown |
| 2 | Müşteri Teklif Yazıcı | Sunucu (LLM) | ✅ | Markdown |
| 3 | Hibe Proje Dosyası | Sunucu (LLM) | ✅ | Markdown + yazdırılabilir |
| 4 | Web Sitesi Tetkik | **Deterministik** (LLM yalnız anlatım) | ✅ | 100 puanlık skor + rapor |
| 5 | Sektörel Dijital Dükkan | **Deterministik HTML** | ✅ | `dijital-dukkan.html` |
| 6 | Otonom Reklam Paketi | Sunucu (LLM + karakter kilidi) | ✅ | Markdown |
| 7 | Pazaryeri Katalog Fabrikası | Sunucu (LLM yalnız başlık/metin; **CSV + tavan kodda**) | ✅ | `pazaryeri-katalog.csv` |
| 8 | Görsel & Ürün Stüdyosu | **Tarayıcı-içi** | ❌ **Kota atlar** | Markdown |
| 9 | Teknik Çizim & Ölçü Şeması | **Tarayıcı-içi** | ❌ **Kota atlar** | SVG |
| 10 | Mini SaaS & Kod Üretici | **Tarayıcı-içi** | ❌ **Kota atlar** | HTML + React + ZIP |

**Kota:** misafir **1/gün**, üye **3/gün** (`TEZGAH_GUEST_DAILY_LIMIT` / `TEZGAH_MEMBER_DAILY_LIMIT`).
**Kritik teknik kusur:** kota `lib/tezgah/quota.ts` içinde **süreç-içi `Map`**. Vercel'de her lambda instance'ı kendi sayacını tutar. 3 lambda'ya düşen bir kullanıcı günde 9 üretim alabilir; tersine instance değişince sayaç sıfırlanır. Ayrıca `recordUsage: false` (`lib/tezgah/engine.ts`) — **AI maliyeti `AiTokenUsage` defterine yazılmıyor.** Koruma yalnız `budget-shield` platform tavanı (₺5.000/gün, `AI_PLATFORM_DAILY_CAP_MINOR=500000`) + IP hız tavanı (20/10 dk).

### 1.2.3 Oturumlu vatandaş yüzeyi

| Yüzey | Yol | Yetenek |
|---|---|---|
| Komuta merkezi | `/dashboard` | 4'lü kokpit, cüzdan şeridi, Next Best Action (`resolveNextBestAction`), nabız |
| Cüzdan | `/cuzdan` | Bakiye, PayTR yükleme (₺10–₺20.000), iade talebi |
| Profil | `/profil` | Kimlik, fatura künyesi (bireysel/kurumsal), şifre, hesap kapatma |
| Pasaport | `/pasaport` | Vize damgası sicili (salt okuma projeksiyon) |
| Akademi | `/academy/[slug]/oyna` | Müfredat oynatıcı, ders asistanı, iş dosyası, sınav, sertifika |
| Sertifikalar | `/academy/certificates` | Mühür listesi, LinkedIn "Add certification" linki (`lib/career/badge-share.ts`) |
| Kariyer | `/career` | Rozet bandı, kariyer masası görevleri, **AI kariyer koçu** (`/api/career/coach`, günde 20), 30 günlük plan |
| E-Ticaret | `/e-ticaret` + `/magazam/*` | Mağaza, ürün/varyant, stok defteri, Trendyol/Hepsiburada kimlik mührü, webhook, gelen kutusu, aylık lisans |
| Junior | `/junior`, `/junior/ders/[key]` | 6. sınıf pilot; veli onayı, XP, ilerleme, canlı öğretmen — **kasa kilitli** |
| Freelancer | `/freelancer/*` | **410 Gone** (motor ve şema canlı) |

### 1.2.4 Admin kokpiti (`/admin`)

| Yüzey | Yol | Yetenek |
|---|---|---|
| Katalog + Huni | `/admin` | Fiyat kataloğu düzenleme (Super Admin), **10 adımlı huni panosu**, GA4 panosu, fiyat karar defteri, kurs yayın anahtarı, sığınak eylemleri |
| B2B motoru | `/admin/b2b` | Günlük **15 firma** giden satış kuyruğu; web tetkik + TÜBİTAK hibe kanalı; taslak üret → düzenle → gönder |
| Sosyal masa | `/admin/social` | LinkedIn / Instagram / Facebook / X gerçek yayın (`lib/kernel/admin/social-publish.ts`), yanıt masası |
| Ops | `/admin/ops` | Sertifika iptal, lisans boşluğu iadesi, hediye |
| Müfredat | `/admin/curriculum-revisions` | Revizyon |
| Katalog | `/admin/catalog` | Fiyat + yayın |

**Huni ölçümü gerçek ve iyi kurulmuş:** `funnel_daily_counters` (4 sayaç adımı: `vitrine_visit`, `free_lesson`, `checkout_intent`, `vize_hit`) + 6 ticari adım (`register`, `wallet_cleared`, `purchase_settled`, `exam_pass`, `visa_stamp`, `vize_hit`) + cohort gecikmesi + **nakit kaçağı** (`pending_stale`, `cash_leak_minor`). `lib/kernel/admin/funnel-query.ts` (12 KB).

---

## 1.3 Ticari Hazırlık (Monetization & Conversion) Skoru

### 1.3.1 Beş saniye testi: **BAŞARISIZ**

Ana sayfa H1'i (`lib/copy/sen-voice/public.ts`):

> *"Yetkinliğini Mühürle. Yapay Zekâ Tezgâhıyla Üret. Rozet, Plan ve Canlı Vitrin."*

Bu cümle **dört ayrı ürün vaadi** taşıyor (mühür, tezgâh, rozet, plan, vitrin — aslında beş). Ziyaretçi "ben ne alıyorum?" sorusuna tek cevap alamıyor. 101 raporundaki "hedef kitle şizofrenisi" teşhisi **kısmen düzelmiş ama tamamen değil**: Junior hâlâ kayıt defterinde, hâlâ `JUNIOR_ALLOWED_EMAILS` ile iki e-postaya kilitli, hâlâ nav'da değil — ama vitrin kopyasında "canlı vitrin" ve "30 günlük plan" gibi üçüncül vaatler duruyor.

**Somut eksikler:**
- Fiyat yok. "₺890'dan başlayan" tek bir sayı ana sayfada geçmiyor.
- Sosyal kanıt yok. `lib/copy/sen-voice/public.ts` içinde `testimonial|yorum|referans|musteri` araması: **0 sonuç**.
- Sayısal kanıt yok. "6 eğitim, 40 ders, 40 mühürlü ses" gibi doğrulanabilir bir sayaç basılmıyor (oysa `academyMediaSealedWavCount()` kodda var).
- Karşılaştırma yok. "BTK Akademi ücretsizken neden sana para vereyim?" sorusunun cevabı sayfada yok.

### 1.3.2 Fiyatlandırma ve paket yapısı

| Ürün | Fiyat (kuruş → TL) | Durum |
|---|---|---|
| OFF-101 Ofis AI | `89_000` → **₺890** | Satışta (ses+metin mührü şartıyla) |
| OFF-201 İleri Ofis | `129_000` → **₺1.290** | Satışta |
| EC-102 E-Ticaret AI | `99_000` → **₺990** | Satışta |
| SM-103 Sosyal Medya AI | `89_000` → **₺890** | Satışta |
| BOT-104 Chatbot | `129_000` → **₺1.290** | Satışta |
| PR-105 Prompt | `129_000` → **₺1.290** | Satışta |
| N8N-201 … GV-303 (7 kart) | `349_000`…`1_900_000` → ₺3.490–₺19.000 | **Kabuk** — `lessonKeys: []`, satılamaz |
| AI Tezgâh | **₺0** (1–3 üretim/gün) | Ücretsiz, ödeme yolu yok |
| E-Ticaret aylık lisans | **Katalog satırı YOK** | **Kasa 422 veriyor** |
| Emanet/Split komisyon | %10–15 (`HOLD_BPS` bandı 1000–1500) | `MARKETPLACE_SPLIT_LIVE = false` — ölü |
| Junior yıllık | `junior_yearly_price_seed.sql` ile tohumlu | Kasa `JUNIOR_CHECKOUT_OPEN` yoksa kilitli |

**Kritik bulgu #1 — düzenli gelir rayı kapalı:**
`lib/commerce/subscription.ts` sabitleri `COMMERCE_MONTHLY_MODULE = "commerce"`, `COMMERCE_MONTHLY_UNIT = "monthly"`. `readCommerceMonthlyAmount()` bu satırı `PriceCatalogEntry`'den okur; satır yoksa `null` döner ve `placeCommerceSubscriptionOrder` `422 — "Aylık tutar katalogda açık değil."` verir.
Tüm `prisma/migrations` ve `supabase/migrations` içinde `'commerce'` modül anahtarı **hiç tohumlanmamış**. `lib/kernel/admin/catalog-write.ts` içinde `CATALOG_OPENABLE_UNITS` bu birimi **açılabilir** olarak listeliyor — yani Super Admin panelinden elle yazılabilir ama yazılmamış.
**Sonuç:** Ürünün **tek abonelik (MRR) rayı** production'da varsayılan olarak karanlık. Bir admin PATCH'i bunu açar.

**Kritik bulgu #2 — fiyat sayfası yok:**
`app/fiyatlandirma` ve `app/pricing` **yok** (`Test-Path` her ikisi için `False`). `SITEMAP_STATIC_PATHS` içinde de yok. Alıcı fiyatı yalnız `/academy/[slug]` sayfasında, `PurchaseButton` içinde görüyor.
Oysa **müzede tam bu iş için yazılmış bir modül var:** `yetkin_muze/lib/pricing/public-pricing-vitrine.ts` (28 KB, 27 bölüm, `live`/`planned`/`simulation` dürüstlük etiketleriyle).

**Kritik bulgu #3 — kredi/token satın alma yolu yok:**
Cüzdan yükleme var (₺10–₺20.000), ama cüzdan bakiyesini **AI Tezgâh üretimine** harcamanın yolu yok. `paid-command.ts` altyapısı canlı (`PaidCommandReservation`, `RESERVED → PROVIDER_DONE → SETTLED`) ama `PAID_COMMAND_SCOPES` yalnız `studio.generate`, `studio.image`, `devlabs.generate` — üçü de **kapalı odalarda**.
Yani: para yüklenebiliyor, kursa harcanabiliyor, ama **tezgâha harcanamıyor**.

### 1.3.3 Müşteri kazanım hunisi — nerede tıkanıyor?

```
[1] Google / Reels / LinkedIn
        │
        ▼
[2] Ana sayfa (/)  ──────────  ✅ Çalışıyor. JSON-LD + SSS + OG var.
        │
        ├── Birincil CTA: "Ücretsiz Yetkinlik Testine Gir"
        │        │
        │        ▼
        │   [3a] /academy/01_office_ai/seviye
        │        │
        │        ▼
        │   ❌ KIRIK: Oturum yok → ExemptionGuestCard → /register
        │      Ziyaretçi SIFIR değer aldı, e-posta istendi.
        │      "Ücretsiz" denen şey kayıt duvarının arkasında.
        │
        └── İkincil CTA: "AI Tezgâhını Dene"
                 │
                 ▼
            [3b] /tezgah  ──  ✅ Çalışıyor, anonim, gerçek çıktı
                 │
                 ▼
            [4] Çıktı alındı (markdown / CSV / HTML)
                 │
                 ▼
            ❌ Çıktı KAYBOLUYOR. Persist edilmiyor.
               `generateTezgahOutput` yalnız `markdown` döner;
               `AiTokenUsage`'a bile yazılmıyor (`recordUsage: false`).
               Kullanıcı sayfayı kapatınca iş yok.
                 │
                 ▼
            [5] Kayıt?  ❌ Teşvik yok.
               `TEZGAH_GUEST_QUOTA_MESSAGE` = "Günde 3 ücretsiz
               üretim hakkı için ücretsiz kayıt ol" — doğru mesaj,
               ama ANCAK 1. hakkı bitirdikten sonra görünüyor.
                 │
                 ▼
            [6] Akademi  →  [7] Kurs detayı  →  [8] Kayıt zorunlu
                 │
                 ▼
            [9] Fatura künyesi (ad, telefon, adres, TCKN-opsiyonel)
                 │  + 2 yasal tik
                 ▼
            [10] Cüzdana yükleme (PayTR iFrame)  ← AYRI ADIM
                 │
                 ▼
            [11] Bakiye yoklanır (`pollWalletCredit`)
                 │
                 ▼
            [12] /lock + /purchase (ikinci API çağrısı)
                 │
                 ▼
            [13] Ders açılır → [14] Sınav 70+ → [15] Sertifika → [16] /vize/[id]
```

**Tıkanma noktaları ve ölçülebilir kanıt:**

| # | Tıkanma | Kanıt | Etki |
|---|---|---|---|
| **T1** | Birincil CTA kayıt duvarına çarpıyor | `app/academy/[slug]/seviye/page.tsx` → `ExemptionGuestCard` | Ana huni **en baştan** duruyor. En pahalı hata. |
| **T2** | Ücretsiz test yalnız **1 dikey** | `if (slug !== OFF_101_EXEMPTION_COURSE_SLUG) notFound()` | 5 uzmanlık vaat ediliyor, 1 tanesi test edilebiliyor. |
| **T3** | Tezgâh çıktısı buharlaşıyor | `lib/tezgah/engine.ts` — persist yok | Retention sıfır. Kullanıcı ertesi gün gelmek için sebep bulamıyor. |
| **T4** | Kasa 2 aşamalı (cüzdan → satın alma) | `components/academy/purchase-button.tsx` (554 satır), `QuickTopUpModal` | 101 raporu bunu tespit etmişti; **hâlâ düzeltilmedi**. |
| **T5** | Fatura künyesi çok uzun | `components/legal/checkout-billing-fields.tsx` — ad, telefon, adres (min 8 char), TCKN; TCKN artık opsiyonel (`data-checkout-tckn-optional`) ✅ | Kısmen iyileşmiş. |
| **T6** | Rozet → iş arası köprü **410** | `FREELANCER_PUBLIC_SURFACE_LOCKED = true` | "Rozet al ki iş bul" vaadi **yalan**. Sertifika ticari karşılıksız. |
| **T7** | E-posta yakalama yok | `newsletter|leadMagnet` araması 0 sonuç | Trafiğin %95'i (kayıt olmayan) **kalıcı olarak kaybediliyor**. |

### 1.3.4 Ticari hazırlık skoru

| Boyut | Puan | Gerekçe |
|---|---|---|
| Değer önerisi netliği (5 sn) | **3/10** | 5 vaat üst üste; fiyat yok; sosyal kanıt yok. |
| Fiyat şeffaflığı | **1/10** | Fiyat sayfası yok. |
| Ödeme altyapısı | **9/10** | PayTR 3DS, idempotency, mutabakat, iade — fintech kalitesinde. |
| Freemium kancası | **4/10** | Tezgâh iyi ama persist yok, kota tutmuyor, ücretli yol yok. |
| Kayıt dönüşümü | **3/10** | Google OAuth var ✅ ama birincil CTA kayıt duvarı ❌. |
| Kasa dönüşümü | **5/10** | 2 aşamalı sürtünme sürüyor. |
| Elde tutma (retention) | **2/10** | Persist edilen çıktı yok, bildirim yok, haftalık ritüel yok. |
| Düzenli gelir (MRR) | **1/10** | Tek MRR rayı (commerce:monthly) katalog satırı yok → 422. |
| B2B satış | **6/10** | B2B motoru + sosyal masa + commerce kokpiti var; fiyat/paket yok. |
| **Ağırlıklı toplam** | **≈ 3,8 / 10** | **Motor 9, vitrin 3.** |

---

## 1.4 Teknik Borç, Güvenlik ve Ölçeklenebilirlik Riskleri

### 1.4.1 Güçlü yanlar (korunması gerekenler)

| Alan | Kanıt | Değerlendirme |
|---|---|---|
| **RLS** | `supabase/migrations/20260814020000_enforce_rls_all_tables.sql` + `20260814030000_rls_user_scoped_policies.sql`; `ENABLE` + **`FORCE`** + event trigger; 64 tablo sicili `lib/kernel/security/rls-policy-registry.ts`; sahiplik kolonu olmayan tablolar `rls_deny_unscoped` (SELECT USING false) | **Sınıfının üstünde.** PostgREST sıfır satır döner. `verify:rls-status` sapmada kırar. |
| **Para disiplini** | `AmountMinor` markalı tip (`toAmountMinor` throw), `ledger_entries` **append-only DB trigger**, `amount_minor > 0` CHECK, composite FK, `Wallet.amount_minor >= 0` CHECK; üçlü bakiye aynası; `idempotency_key` UNIQUE | **Fintech seviyesi.** Float yok, sessiz UPDATE yok. |
| **AI maliyet kalkanı** | `lib/kernel/ai/budget-shield.ts` — sıra: hız → platform günlük tavan → kullanıcı günlük token (200 K). Port hata verirse **fail-closed** (`guard-unavailable`) | Doğru. Ama `recordUsage: false` yaygın (aşağıda). |
| **Hız tavanı** | `lib/kernel/security/http-rate-limit.ts` — cüzdan 8/10dk IP, 4/10dk üye; finansal mutasyon 30/10dk; LLM 20/10dk; auth 40/10dk. Redis kısmi config → fail-closed | Doğru. |
| **IDOR / atomik mühür** | `verify:idor-seals` (6 test dosyası), `verify:atomic-seals`, `authorize.ts` | Doğru. |
| **SSRF koruması** | `lib/tezgah/tetkik/guard.ts` — DNS lookup + `BlockList` private CIDR (IPv4+IPv6), port/scheme/credential reddi | **Nadir ve doğru.** |
| **Kenar** | `proxy.ts` — nonce CSP, Origin/Sec-Fetch-Site guard, JWT fail-closed, `/api/v1` hop allowlist, bakım modu | Doğru. |
| **Sızıntı kapıları** | `verify:no-secrets`, `verify:amount-minor`, `verify:api-auth --check`, `verify:boundaries`, `verify:public-size` — hepsi `verify:prebuild` içinde | **11 kapılı prebuild.** Disiplin örnek. |
| **SEO altyapısı** | `app/sitemap.ts` (yayın süzgeçli, `lastmod` sabit tabanlı — "her istekte tazelenmez" notu), `app/robots.ts`, JSON-LD (FAQ/Article/Breadcrumb), `opengraph-image.tsx`, SSR/SSG | **İyi kurulmuş.** Sorun altyapı değil, **içerik hacmi**: tek `/rehber` sayfası. |

### 1.4.2 Riskler

| # | Risk | Kanıt | Şiddet | Not |
|---|---|---|---|---|
| **R1** | **Tezgâh kotası süreç-içi `Map`** | `lib/tezgah/quota.ts:25` `const slots = new Map<string, Slot>()` | **YÜKSEK** | Vercel multi-instance'ta kota tutmuyor. Cold start'ta sıfırlanır. Ücretli plan başlatılırsa **doğrudan gelir kaçağı**. |
| **R2** | **AI maliyeti deftere yazılmıyor** | `recordUsage: false` — **12 çağrı noktası, 10 dosya**: `lib/tezgah/engine.ts`, `lib/tezgah/grant/engine.ts`, `lib/tezgah/reklam/engine.ts`, `lib/tezgah/pazaryeri/engine.ts`, `lib/tezgah/tetkik/engine.ts`, `lib/career/coach.ts` (2), `lib/kernel/ai/assistant-chat.ts`, `lib/freelancer/dispute-engine.ts`, `lib/kernel/admin/social-generate.ts` (2), `lib/junior/service.ts` | **YÜKSEK** | `recordUsage: true` yalnız **4** yerde: `lib/commerce/os-service.ts`, `lib/junior/live-tutor.ts`, `lib/junior/service.ts:693`, `lib/academy/lesson-assistant.ts`. **Anayasa B'nin "AI kuruş aynı deftere yazılır" ilkesi üretimde uygulanmıyor.** Maliyet görünmez → birim ekonomi ölçülemez. |
| **R3** | **Freelancer vaadi ile gerçek çelişkisi** | `lib/copy/sen-voice/career.ts`: *"Teklif Kapısı işveren ağına görünürlük…"* + `FREELANCER_PUBLIC_SURFACE_LOCKED = true` → 410 | **YÜKSEK** | A5 (Dürüst Kapalı Yüzey) ihlali değil — sayfa 410 diyor. Ama **pazarlama vaadi** karşılıksız. Sertifika "iş anahtarı" diye satılıyor, kapı yok. |
| **R4** | **`MARKETPLACE_SPLIT_LIVE = false` tek satır** | `lib/kernel/payments/marketplace-split-live.ts:8` | **ORTA** | `isFreelancerPublicSurfaceLocked()` üç koşuldan biri olarak bunu okuyor. İki bağımsız kilit (`FREELANCER_PUBLIC_SURFACE_LOCKED` + bu) — gevşetmek **iki dosya** ister. İyi tasarım, ama ürünü kilitliyor. |
| **R5** | **`commerce:monthly` katalog satırı yok** | Tüm migration taraması: `'commerce'` modül anahtarı 0 sonuç | **YÜKSEK (gelir)** | Bkz. 1.3.2 Kritik bulgu #1. |
| **R6** | **Fiyat sayfası yok** | `Test-Path app/fiyatlandirma` → False | **YÜKSEK (dönüşüm)** | |
| **R7** | **Rozet vitrini indekslenmiyor** | `ROBOTS_DISALLOW_PATHS` `/vize` içermiyor ✅ ama `SITEMAP_STATIC_PATHS` `PAGE_SEO.publicTalent.path` = `/vize` içeriyor ✅; **ancak bireysel `/vize/[id]` sayfaları sitemap'te yok** | **ORTA (SEO)** | Her rozet bir uzun kuyruk sayfası olabilirdi. |
| **R8** | **Gönderim başına GA4 dedupe belleği** | `lib/kernel/telemetry/funnel.ts` `recent = new Map()`, 1.2 sn pencere | DÜŞÜK | Kabul edilebilir. |
| **R9** | **Sentry/GlitchTip DSN env şablonunda yok** | `.env.example` taraması | ORTA | `logEvent` var ama dış toplama yoksa hata görünmez. |
| **R10** | **Junior hâlâ kayıt defterinde** | `lib/dronlar/kayit.ts` `junior` satırı `kapali: false` | ORTA (odak) | 378 dosya + `packages/junior-content` (406 dosya, 8,1 MB) taşınıyor. Kasa kilitli, izin listesi 2 e-posta → **gelir 0, bakım maliyeti yüksek.** |
| **R11** | **`recordUsage` yok + `quota` bellek** = birim ekonomi kör | R1 + R2 | **YÜKSEK** | Ücretli model açılmadan **önce** düzeltilmeli. |
| **R12** | **Test hacmi ≠ kapsam** | 519 dosya / ~79 K satır | DÜŞÜK | Güçlü yan. Ama `verify:*` betikleri çoğunlukla **kaynak metni grep** ediyor (örn. `expect(read(...)).toContain('...')`) — davranış testi değil, **mühür testi**. Refactor'da kırılgan. |

---

# BÖLÜM 2 — `yetkin_muze`: "Elmas Madenciliği"

## 2.0 Müzenin gerçek envanteri

| Boyut | Sayı |
|---|---|
| Sayfa (`page.tsx`) | 158 |
| API rotası (`route.ts`) | 559 |
| Lib `.ts` | 2.282 |
| Bileşen `.tsx` | 1.081 |
| Prisma modeli | **248** (tek `schema.prisma`, 342 KB) |
| Test dosyası | 607 (~113 K satır) |
| `lib/studio` | **522 dosya** (48 alt modül) |
| `lib/copy` | ~700 KB Türkçe kopya |
| `lib/kurumsal` | 81 dosya |
| `lib/junior` | 95 dosya |
| `lib/marketplace` | 110 dosya |
| `lib/social` | 75 dosya |
| Git durumu | `main`, **2.738 değişik dosya** (commit edilmemiş) |

**Ön uyarı — 101 raporunun elmas listesi düzeltilmeli:**
101 "Scout İş Radarı"nı elmas saymış. Röntgen farklı söylüyor: `yetkin_muze/lib/freelancer/scout-engine.ts` (17 KB) gerçek platform **taramıyor**; `PLATFORM_QUEUE_TEMPLATES` içindeki **elle yazılmış uydurma** ilan şablonlarından (Upwork/Fiverr/LinkedIn başlıkları, "Nordic Product Studio", "45000-72000 TL bütçe") besleniyor. Değerli olan tarama değil, **teklif yazma ve skorlama mantığı** — ki teklif yazıcı **canlıda zaten var** (`lib/tezgah/catalog.ts` → `proposal` aracı). Scout'un marjinal değeri düşük.

---

## 2.1 Kurtarılması Gereken Elmas Modüller

### E1 · Kamu Fiyat Vitrini (dürüstlük etiketli) — **EN DEĞERLİ**

| Alan | Değer |
|---|---|
| **Dosyalar** | `yetkin_muze/lib/pricing/public-pricing-vitrine.ts` (28 KB), `module-pricing-defaults.ts` (58 KB), `pricing-decision-ledger.ts`, `pricing-drafts`/`pricing-index-proposal-engine.ts`, `pricing-coherence.ts` (11 KB), `assert-pricing-margin.ts`, `assert-min-margin-bps.ts` |
| **Ne yapıyor** | 27 bölümlük kamu fiyat tablosu. Her satırda **`honesty: "live" \| "planned" \| "simulation"`** etiketi. Fiyat karar defteri (append-only, gerekçeli zam). Marj tabanı assert'i. FX bağlı birim maliyet. |
| **Neden elmas** | Canlıda **fiyat sayfası yok**. Bu modül tam olarak eksik olan şeyi, üstelik **A5 (Dürüstlük) uyumlu** biçimde çözüyor: "canlı" ile "hazırlanıyor" ayrı etiketlenir, alıcı aldatılmaz. |
| **Kod kalitesi** | Yüksek. Saf fonksiyonlar, saf veri, karar defteri append-only. |
| **Ticari etki** | **Çok yüksek** — fiyat şeffaflığı doğrudan dönüşüm. |

### E2 · Anonim Hibe Uygunluk Kancası (widget)

| Alan | Değer |
|---|---|
| **Motor (canlıda ZATEN var)** | `lib/yetkinhibe/preview-idea-validator.ts` (6,7 KB), `preview-match-score.ts`, `match-grants-for-profile.ts`, `match-grant-programs-for-brief.ts` (10 KB), `analyze-grant-eligibility-gap.ts`, `calculate-grant-budget.ts`, `grant-catalog-core.ts`, `grant-brief-axes.ts` (6,7 KB: il/NACE/yatırım odağı/Ar-Ge olgunluğu eksenleri) |
| **Eksik olan (müzede)** | `yetkin_muze/components/hibe/grant-idea-validator-widget.tsx` (7,9 KB) — **fikir yaz → 650 ms'de program + uygunluk % + tahmini destek**; ayrıca `grant-match-score-visualizer.tsx`, `grant-gap-analysis-card.tsx`, `grant-budget-optimizer-card.tsx`, `grant-lifecycle-timeline.tsx`, `grant-opportunity-radar-list.tsx` |
| **Neden elmas** | Fiyatı **sıfır** (deterministik, LLM çağrısı yok — müzede açıkça `LLM çağrısı yoktur` yazıyor). Anonim çalışabilir. **KOBİ karar vericisinin e-postasını doğal olarak verdiği tek kanca.** |
| **Canlı veri zaten var** | `prisma/migrations/20261115120000_yetkinhibe_grant_calls_2026_11` → **15 Kasım 2026 doğrulanmış açık çağrılar** (`sourceVerifiedAt` mühürlü) |
| **Ticari etki** | **Çok yüksek** — B2B lead magnet + `lib/kernel/admin/b2b-outbound.ts` motoruna doğrudan besleme |

### E3 · Hazır "İlk İş" Kataloğu

| Alan | Değer |
|---|---|
| **Dosya** | `yetkin_muze/lib/matchmaking/opportunity-pool.json` (9,2 KB) + `opportunity-pool.ts`, `engine-core.ts` (`scoreOpportunityMatch`), `autonomous-matchmaking-service.ts` |
| **Ne içeriyor** | 3 katmanlı menü (`mental-starters`, `structural-foundations`, `primary-focus`, `fluid-signals`, "Rafine Kapanışlar") + gerçek ödül aralıklı işler: *"Araştırma Notu Azaltımı ₺120–₺200 / 2–4 gün"*, *"Metrik Panosu Taslağı ₺250–₺400 / 1 hafta"*, *"Kod İnceleme Görevi ₺200–₺350"* … |
| **Neden elmas** | Onboarding'de "bugün ne yapacağım?" sorusunu **hazır cevapla** kapatıyor. Ayrıca tezgâh araçlarına **doğal brief** üretiyor (iş seç → tezgâhta üret). |
| **Kod kalitesi** | Saf JSON + skorlama. Taşınması kolay. |
| **Ticari etki** | Orta-yüksek (aktivasyon, D1 retention) |

### E4 · Programatik SEO Yüzey Sicili

| Alan | Değer |
|---|---|
| **Dosyalar** | `yetkin_muze/lib/seo/surface-routes.ts` (20 KB), `sitemap-index.ts` (9 KB), `sitemap-integrity-seal.ts`, `robots-policy.ts` (LLM botlarına — ChatGPT/Claude/Perplexity/Gemini — ayrı izin!), `json-ld.tsx`, `get-public-portfolio-vitrine.ts` |
| **Neden elmas** | Canlı `lib/copy/seo.ts` (22 KB) **~10 statik yol** biliyor. Müzede ~130 rotalık sicil var: her rota için `title`/`description`/`priority`/`changeFrequency`/`noIndex`. **Programatik SEO'nun şablonu.** |
| **Ticari etki** | **Yüksek** — tek rehber sayfasından 15–30 sayfaya çıkmak organik trafiği katlar |

### E5 · Değerlendirme Motorları (SWOT / Yol Haritası / CV)

| Alan | Değer |
|---|---|
| **Dosyalar** | `yetkin_muze/lib/career/swot-engine.ts` (19 KB), `roadmap-engine.ts` (20 KB), `resume-engine.ts` (16 KB), `career-assessment-challenge.ts` (39 KB), `build-swot-quadrant.ts`, `swot-instant-pass.ts`, `career-fit.ts`, `career-roadmap.ts` (22 KB), `components/career/*` (76 dosya) |
| **Ne yapıyor** | Kullanıcı hedef rol + mevcut beceri girer → SWOT kadranı, 30/60/90 yol haritası, mühürlü CV tescil. Her biri `PassportVisaStamp` + cüzdan harcı ile atomik. |
| **DİKKAT — bağımlılık borcu** | Hepsi `lib/merit/*`, `lib/passport/merit-visa-seal.ts`, `syncSupabaseUserToPrisma`, `WalletCredit (MP yansımalı)` çağırıyor. **Canlıda `lib/merit` YOK, `merit-visa-seal` YOK.** Taşımak = yeniden yazmak. |
| **Ticari etki** | Yüksek (ücretli değerlendirme ürünü) ama **efor da yüksek** |

### E6 · Türkçe Ürün Kopyası Kütüphanesi

| Alan | Değer |
|---|---|
| **Dosyalar** | `yetkin_muze/lib/copy/studio.ts` (235 KB), `common.ts` (146 KB), `kurumsal.ts` (65 KB), `career.ts` (59 KB), `junior.ts` (58 KB), `devlabs.ts` (50 KB), `freelancer.ts` (44 KB), `arena.ts` (44 KB), `academy.ts` (39 KB), `hibe.ts` (32 KB), **`platform-glossary.ts` (30 KB)**, `social.ts`, `pazaryeri.ts` … |
| **Neden elmas** | 700 KB **elle yazılmış, tonu tutarlı, Türkçe** ürün metni. Özellikle `platform-glossary.ts` → 150+ terim tanımı = **bedava SEO sözlük sayfası** ve satış öncesi eğitim materyali. `hibe.ts` (32 KB) → hibe dikeyinin tam iletişim seti. |
| **Ticari etki** | Orta-yüksek (SEO + dönüşüm kopyası), **efor çok düşük** |

### E7 · E-posta Şablonları

| Alan | Değer |
|---|---|
| **Dosyalar** | `yetkin_muze/templates/email-confirmation.html`, `email-magic-link.html`, `email-reset-password.html` (her biri ~6,5 KB, markalı HTML) |
| **Neden elmas** | Canlıda `lib/kernel/notice/mail.ts` **programatik** metin üretiyor; markalı HTML şablonu yok. Doğrulama e-postası ilk izlenimdir. |
| **Ticari etki** | Orta (kayıt doğrulama oranı), **efor çok düşük** |

### E8 · k-Anonimlik Yetenek Haritası

| Alan | Değer |
|---|---|
| **Dosyalar** | `yetkin_muze/lib/talent/k-anonymity.ts` (`TALENT_MAP_K_MIN = 5`, ilçe altı yasak), `national-talent-map-service.ts`, `opaque-talent-alias.ts`, `talent-match-score.ts`, `talent-pricing.ts` |
| **Neden elmas** | B2B "Türkiye'de hangi ilde kaç Trendyol uzmanı var?" raporu satılabilir. KVKK uyumlu (k≥5 bastırma). Canlıda `lib/career/public-talent*.ts` var ama **k-anonimlik yok**. |
| **Ticari etki** | Orta (B2B veri ürünü), efor düşük (saf fonksiyon) |

### E9 · Reklam Kampanya Blueprint Motoru

| Alan | Değer |
|---|---|
| **Dosyalar** | `yetkin_muze/lib/studio/yetkin-ads/*` (15 dosya: `ads-campaign-blueprint-seal.ts`, `ads-creative-pack.ts`, `ads-budget-billing.ts`, `smart-budget-guard.ts`, `clearance-steps.ts`), `lib/ads/*` (35 dosya), `components/ads/*` (28) |
| **Neden elmas (kısmi)** | Canlı tezgâhta `reklam` aracı **var** ama yalnız metin üretiyor (3 kanca + Meta/Google arama metni + brif). Müzede **bütçe planı + kreatif paket + harcama kalkanı** katmanı var. |
| **Uyarı** | `google-ads-mcc-seal.ts` ve `meta-ads-seal.ts` **simülasyon** mühürleri. Gerçek MCC yok. Yalnız **deterministik blueprint** kısmı taşınmalı. |
| **Ticari etki** | Orta-yüksek; efor orta |

### E10 · Kurumsal Beyin (RAG) — *uzun vadeli elmas*

| Alan | Değer |
|---|---|
| **Dosyalar** | `yetkin_muze/lib/kurumsal/*` (81 dosya): `corporate-brain-ingest-service.ts`, `corporate-brain-inference-service.ts`, `corporate-brain-pipeline-stream.ts`, `corporate-briefing-digest-service.ts`, `corporate-hr-role-lens-service.ts`, `corporate-internal-academy-service.ts`; `components/kurumsal/*` (59) |
| **Neden elmas** | KOBİ'nin kendi belgeleri üzerinde çalışan iç bilgi asistanı = **yüksek ARPU'lu B2B SaaS**. |
| **Uyarı** | Vektör DB, embedding pipeline, tenant izolasyonu, RLS genişletmesi gerekir. Canlıda hiçbir parçası yok. **45 günlük plana girmez.** |
| **Ticari etki** | Çok yüksek; **efor çok yüksek** |

---

## 2.2 İçerik, Veri ve Dokümantasyon Hazineleri

| # | Varlık | Yol | Boyut | Neden değerli |
|---|---|---|---|---|
| D1 | **Platform Sözlüğü** | `yetkin_muze/lib/copy/platform-glossary.ts` | 30 KB | 150+ terim; `/sozluk/[terim]` programatik SEO + satış öncesi eğitim |
| D2 | **Hibe iletişim seti** | `yetkin_muze/lib/copy/hibe.ts` | 32 KB | Hibe dikeyinin tam kopyası (landing, wizard, gap, bütçe) |
| D3 | **Freelancer iletişim seti** | `yetkin_muze/lib/copy/freelancer.ts` | 44 KB | Freelancer odası açıldığında hazır |
| D4 | **Hazır iş kataloğu** | `yetkin_muze/lib/matchmaking/opportunity-pool.json` | 9 KB | 15+ gerçekçi ilk iş, ödül aralığı ve süre ile |
| D5 | **Markalı e-posta HTML'leri** | `yetkin_muze/templates/email-*.html` | 3 × 6,5 KB | Doğrulama/magic-link/şifre sıfırlama |
| D6 | **Strateji runbook'ları** | `yetkin_muze/docs/03_GELIR_KAMASI_RUNBOOK.md` (28 KB), `04_RADIKAL_ODAK_VE_YENI_ELMAS_RAPORU.md` (35 KB), `01_GENEL_YAPI_TESPIT_RAPORU.md` (30 KB), `12_KOD_TEMIZLIK_VE_ARINMA_TESPIT_RAPORU.md` (26 KB) | ~120 KB | Müze runbook'u **canlıya geçiş sırası** veriyor (env → RLS → PayTR webhook → holding) — canlı `.system_docs/OPS_RUNBOOK.md` ile çapraz kontrol edilecek |
| D7 | **Arşiv rapor dizisi** | `archived/docs_history/` (33 dosya, 001–019 + docs_root) | ~400 KB | Kurumsal hafıza; "bunu neden böyle yaptık" sorusunun cevabı |
| D8 | **Firma kimlik belgeleri** | `yetkin_muze/docs/Kalıcı Firma Bilgileri/*.docx` | 2 dosya | Kurumsal künye, yasal metin ham maddesi |
| D9 | **YetkinHibe doğrulanmış çağrı verisi** | `prisma/migrations/20261115120000_yetkinhibe_grant_calls_2026_11` + `lib/yetkinhibe/grant-catalog-core.ts` | 7 KB SQL | **Canlıda.** 2026 Kasım itibarıyla `sourceVerifiedAt` mühürlü — satılabilir veri |
| D10 | **Akademi müfredatı ve sınav havuzları** | `lib/academy/exam-pools*.ts` (6 dosya), `lib/academy/curricula/*` | ~40 KB | 6 kursun sınav soruları; **satılmış ürünün çekirdeği** |
| D11 | **Müze SES/prompt arşivi** | `yetkin_muze/lib/copy/studio.ts` içindeki prompt şablonları | ~40 KB | Studio peronları açılırsa hazır istem kütüphanesi |

---

## 2.3 Taşıma (Migration) Öncelik Matrisi

**Eksenler:** Efor (Düşük < 1 gün · Orta 1–4 gün · Yüksek > 4 gün) × Ticari Etki.

### 2.3.1 Hemen taşınacaklar (Düşük efor × Yüksek etki)

| Sıra | Elmas | Efor | Etki | Neden düşük efor | Somut hedef |
|---|---|---|---|---|---|
| **1** | **E1** Fiyat vitrini | **Düşük** | **Yüksek** | `PriceCatalogEntry`'yi okuyan yeni bir RSC sayfası; motor zaten canlı (`lib/kernel/pricing/*`). Müzedeki dürüstlük etiketleri canlıda `sale-hold.ts` mantığıyla birebir örtüşüyor. | `app/fiyatlandirma/page.tsx` + `lib/pricing/public-vitrine.ts` |
| **2** | **E7** E-posta HTML | **Düşük** | Orta | Statik HTML; `lib/kernel/notice/mail.ts` içine şablon olarak bağlanır | `lib/kernel/notice/templates/*.html` |
| **3** | **E6** Sözlük + hibe kopyası | **Düşük** | Orta-Yüksek | Kopya zaten Türkçe ve tonu tutarlı; `lib/copy/sen-voice/` yapısına bölünür | `/sozluk` + 30 terim sayfası |
| **4** | **E4** SEO yüzey sicili | **Düşük** | **Yüksek** | Müzedeki `Record<path, SEO>` şablonu canlı `lib/copy/seo.ts`'ye eklenir; sitemap zaten `SITEMAP_STATIC_PATHS` okuyor | 15 rehber sayfası + `surface-routes` deseni |
| **5** | **E8** k-anonimlik | **Düşük** | Orta | Saf fonksiyon; `lib/career/public-talent*.ts` üzerine eklenir | B2B yetenek raporu |
| **6** | **E3** İlk iş kataloğu | **Düşük** | Orta | JSON + skorlama; `/tezgah` önüne "ne üretmek istiyorsun?" adımı olarak | Tezgâh girişi |
| **7** | **E2** Hibe widget **UI** | **Düşük-Orta** | **Yüksek** | Motor canlıda. Yalnız bileşen taşınacak; `SEN_VOICE` ve `room-identity` bağımlılıkları sökülecek | `/hibe` veya ana sayfa widget'ı |

### 2.3.2 Planlı taşınacaklar (Orta efor × Yüksek etki)

| Sıra | Elmas | Efor | Etki | Gerçek iş |
|---|---|---|---|---|
| 8 | **E9** Reklam blueprint | **Orta** | Orta-Yüksek | `lib/tezgah/reklam/` üzerine bütçe planı + kreatif paket katmanı. **MCC/simülasyon kısmı atılacak.** |
| 9 | **E5 (parça)** Yol haritası jeneratörü | **Orta** | Yüksek | `roadmap-engine`'in **merit/passport bağımlılığı sökülecek**; canlı `lib/career/action-plan.ts` (15,7 KB) üzerine oturtulacak |
| 10 | **E5 (parça)** SWOT kadranı | **Orta** | Yüksek | `build-swot-quadrant.ts` saf mantık; LLM ile beslenip ücretli değerlendirme olur |
| 11 | **D2** Hibe wizard'ı | **Orta** | Yüksek | `components/hibe/grant-project-wizard.tsx` (24 KB) canlı tezgâh `grant` aracına birleştirilecek (iki ayrı sihirbaz olmasın) |

### 2.3.3 Ertelenecekler (Yüksek efor)

| Elmas | Efor | Etki | Neden ertelenir |
|---|---|---|---|
| **E5 (tam)** CV tescili / mühürlü resume | **Yüksek** | Yüksek | `lib/merit`, `merit-visa-seal`, `WalletCredit MP yansıması` canlıda yok → yeniden yazım |
| **E10** Kurumsal Beyin | **Çok yüksek** | Çok yüksek | Vektör DB + tenant izolasyonu + RLS genişletmesi. Ayrı bir ürün turu. |
| `lib/agency/*` white-label | Yüksek | Orta | Acente modeli ayrı sözleşme, ayrı GTM |
| `lib/studio/*` (522 dosya) | **Çok yüksek** | Belirsiz | Ajans holdingi. 101 raporunun "PASLA" kararı doğru. |
| `lib/devlabs/codex/*` (22 dosya) | Yüksek | Düşük | Canlı `lib/tezgah/pro/saas-builder.ts` (17 KB) aynı işi **sunucu maliyeti olmadan** yapıyor. |

### 2.3.4 Matris özeti

```
ETKİ
 Yüksek │  E1(1)  E4(4)  E2-UI(7)   E5-yol(9)  E5-tam
        │  ─────────────────────   E5-swot(10) E10
        │  E7(2)  E6(3)            D2(11)
 Orta   │  E8(5)  E3(6)            E9(8)      agency
        │
 Düşük  │                                     studio / devlabs
        └─────────────────────────────────────────────────
           Düşük        Orta            Yüksek        Çok Yüksek   →  EFOR
```

---

## 2.4 Müzede Kalması Gerekenler (Taşınmamalı)

| Yapı | Dosya/Ölçek | Neden taşınmamalı |
|---|---|---|
| **Studio peronları** | `lib/studio/` **522 dosya**, 48 alt modül (`3d`, `avatar`, `talk`, `video`, `digital-twin`, `native-devlabs`, `forge-devlabs`, `blueprint-devlabs`, `commerce-devlabs`, `engine-devlabs`, `saas-devlabs`, `yetkin-codex`, `yetkin-native`, `yetkin-share`, `yetkin-convert`, `yetkin-invoice`…); `components/studio/` 197 dosya; `app/studio/` 26 peron | **Aşırı mühendislik.** Her peron ayrı GTM, ayrı kota, ayrı fiyat. Canlı `lib/tezgah/pro/*` aynı işlerin %80'ini **tarayıcıda, sunucu maliyeti olmadan** yapıyor. Taşımak odağı dağıtır ve AI maliyetini patlatır. |
| **DevLabs / Codex tezgâhı** | `lib/devlabs/codex/tezgah/` 22 dosya + `lib/forge/` 41 dosya | Native derleme, DNS bağlama (`bind-saas-domain.ts`), Cloudflare simülasyonu. Canlı `saas-builder` yeterli. |
| **Pazaryeri / İlan motoru** | `lib/marketplace/listing-engine.ts` **53 KB**, `listing-vitrin-filters.ts` **53 KB**, `smart-escrow-ledger.ts`, `listing-escrow-vault.ts`, `insurance-bridge-engine.ts`, `tkgm-verify-panel.tsx`, `components/marketplace/` 43 dosya | **Anayasa A2 + EİDS kilidi.** `EIDS_PUBLIC_LISTING_LOCKED = true`, TKGM/sigorta simülasyon. Gelir üretmez, hukuki yüzey açar. `yetkin_muze/docs/04` bunu "çakmak" olarak işaretlemiş — çakmak bile gereksiz. |
| **Satranç** | `lib/chess/` 79 dosya, `app/chess/` 13 sayfa, socket `:3001`, Stockfish | Lichess/Chess.com madeni. Canlıda **hiç yok** — doğru karar. |
| **Anket / Kamuoyu** | `lib/anket/` 44 dosya, `lib/kamuoyu/` 16, socket `:3002`, Merkle motoru | Siyasi/itibar riski. |
| **Lonca / Meclis** | `lib/loncalar/` 47 dosya, `lib/meclis/` 18 | "Dijital parlamento" — yanlış şirket. |
| **Tarım** | `lib/tarim/` 25 dosya, IoT, TKGM köprüsü | Agritech partneri işi. |
| **YetkinX akışı** | `lib/social/` 75 dosya: `x-jury-court.ts`, `x-forensic-engine.ts`, `x-watchtower-engine.ts`, `rabbit-hole-shield.ts` | İkinci sosyal ağ. **Canlıda zaten daha iyisi var:** `lib/kernel/admin/social-publish.ts` gerçek LinkedIn/X/Meta yayını yapıyor. |
| **Arena / espor** | `lib/arena/` 55 dosya, socket `:3003` | Oyun işletmesi. |
| **GİB e-Arşiv** | `lib/finance/gib-*`, XAdES/forge | **Mali suç yüzeyi.** Anayasa A2 açıkça yasaklıyor. |
| **Junior derinliği (95 dosya)** | `lib/junior/` + `packages/junior-content` (406 dosya, **8,1 MB**) | Canlıda `JUNIOR_ALLOWED_EMAILS` ile 2 e-posta. Devasa bakım, sıfır gelir. **Dondurulmalı, silinmemeli**, ama yeni özellik yazılmamalı. |
| **248 modelli tek `schema.prisma`** | `yetkin_muze/prisma/schema.prisma` (342 KB) | Canlı şema **10 modül dosyasına** bölünmüş ve **57 model**. Müze şemasını taşımak bu disiplini bozar. Yalnız **tek tek model** kopyalanır (`ScoutFinding` gibi) — şema bütünü asla. |
| **`lib/merit` paralel para** | 20 dosya: `merit-ledger-engine.ts`, `swap-doping-from-merit.ts`, `execute-merit-swap.ts` | **Anayasa A1 çelişkisi.** İkinci defter = çift muhasebe. Yalnız "puan" olarak (para değil) taşınabilir; o zaman da adı değişmeli. |
| **Acente white-label** | `lib/agency/` 16 dosya | Ayrı sözleşme, ayrı GTM. 180 gün sonrası. |

---

# BÖLÜM 3 — "Elmas Kıymetinde" Ticari & Ürün Önerileri

## 3.1 Hızlı Gelir Modeli (Quick-Win Monetization)

### 3.1.1 Sıfır kod ile açılacak gelir (0–1 gün, yalnız admin/veri)

| # | Aksiyon | Nasıl | Beklenen gelir | Anayasa |
|---|---|---|---|---|
| **QW-1** | **`commerce:monthly` katalog satırını aç** | Super Admin `/admin` → katalog → `commerce / monthly` → tutar yaz (öneri: **₺349/ay**). `CATALOG_OPENABLE_UNITS` bunu zaten kabul ediyor. | **MRR rayı açılır.** Mevcut 56 dosyalık Commerce kokpiti satılabilir hâle gelir. | A1 ✅ (fiyat `PriceCatalogEntry`'de) |
| **QW-2** | **Fiyat sayfasını yayınla** | `app/fiyatlandirma/page.tsx` (E1 deseni) → `PriceCatalogEntry` + `COURSE_REGISTRY.priceSeedMinor` okur; `sale-hold` nedenini dürüstçe basar | Dönüşüm: alıcı "ne kadar?" cevabını alır | A5 ✅ (hazır olmayan paket "hazırlanıyor" etiketli) |
| **QW-3** | **Kurs kartlarına fiyat bas** | `components/academy/course-list.tsx` — fiyat yalnız detayda; karta eklenir | Karşılaştırma → tıklama | A1 ✅ |
| **QW-4** | **Rozet sayısını ana sayfada göster** | `academyMediaSealedWavCount()`, `COURSE_REGISTRY` uzunluğu → "6 eğitim · 40 ders · 40 mühürlü ses · N doğrulanmış rozet" | Güven + farklılaşma | A5 ✅ (gerçek sayı) |

### 3.1.2 Freemium kancası — doğru kurgu

**Bugünkü hâli yanlış kurgulanmış:** birincil CTA = kayıt duvarı arkasındaki test; ikincil = anonim tezgâh. **Ters olmalı.**

**Önerilen kanca zinciri:**

```
AŞAMA 0 — Anonim, sıfır bariyer (bugün çalışıyor, güçlendirilecek)
  • AI Tezgâh: 1 üretim/gün  →  3'e çıkar (kayıt teşviki anlamlı olur)
  • Hibe Uygunluk Widget'ı: SINIRSIZ (deterministik, LLM maliyeti 0)
  • Web Tetkik: SINIRSIZ (deterministik)

AŞAMA 1 — E-posta karşılığı (kayıt YOK, sadece e-posta)
  • "Bu çıktıyı PDF/CSV olarak indir"  →  e-posta iste
  • "Hibe uygunluk raporunu tam gör"  →  e-posta iste
  ⚠️ Bugün bu katman HİÇ YOK. Trafiğin %95'i kayboluyor.

AŞAMA 2 — Ücretsiz hesap (Google tek tık)
  • 3 üretim/gün + çıktı geçmişi (persist) + 1 ücretsiz seviye testi (tüm 5 dikey)
  • Doğrulanmış Rozet görünür ama "kilitli" (vitrin değeri)

AŞAMA 3 — Ücretli (₺890 – ₺1.290 tek seferlik)
  • Uzmanlık paketi: ders + sınav + rozet + kamu kartı
  • Sınav-only varyant: ₺490 (muafiyet motoru zaten var)

AŞAMA 4 — Abonelik (₺349/ay)
  • Tezgâh Pro: 100 üretim/ay + ZIP/DOCX indirme + öncelikli listelenme
  • E-Ticaret lisansı: ₺349/ay (QW-1 ile açılır)
```

### 3.1.3 Fiyat/paket önerisi

> Aşağıdaki tutarlar **öneridir**. Anayasa A1 gereği koda sabit yazılmaz; Super Admin `/admin` üzerinden `PriceCatalogEntry`'ye işler.

| Paket | Hedef | İçerik | Öneri | Kod karşılığı |
|---|---|---|---|---|
| **Seviye Testi** | Herkes | 10 soru, tüm dikeyler, anonim sonuç | **₺0** | `off101-exemption` genelleştirilecek |
| **Tek Uzmanlık Paketi** | Bireysel | Ders + sınav + rozet + `/vize/[id]` | **₺890** (mevcut OFF-101 tabanı) | `cat_academy_course_*` ✅ var |
| **Sınav-Only Muafiyet** | Deneyimli | Yalnız sınav + rozet | **₺490** | `academy_exemption_seals` ✅ var |
| **Uzmanlık Paketi (İleri)** | Deneyimli | OFF-201 / BOT-104 / PR-105 | **₺1.290** | ✅ var |
| **Tezgâh Pro** | Freelancer | 100 üretim/ay + indirme + öncelik | **₺349/ay** | **YENİ** — `PriceCatalogEntry("tezgah","pro")` |
| **E-Ticaret Lisansı** | KOBİ/esnaf | Mağaza + stok + Trendyol/HB senkron | **₺349/ay** | `commerce:monthly` **satırı eksik** |
| **B2B Ekip Rozeti** | KOBİ | 5 koltuk × sertifikasyon + kurumsal fatura | **₺3.900** (₺780/koltuk) | `UserBillingInfo.corporate` ✅ var |
| **Hibe Proje Kredisi** | Danışman | 1 tam proje dosyası (DOCX/PDF) | **₺790** | `PaidCommandReservation` ✅ var |
| **Rozet Doğrulama API** | İK / pazaryeri | Mühür geçerlilik sorgusu (metered) | **180+ gün** | `/api/v1` hop ✅ var |

### 3.1.4 B2B paket kurgusu (en hızlı nakit)

**Kime:** Türkiye'deki **e-ticaret ajansları** ve **hibe danışmanları**.

**Neden onlar:** Bir ajans 10–50 mağaza yönetiyor. Her mağaza için ürün kartı, katalog, reklam metni, stok senkronu üretiyor. Bugün bunu **insan gücüyle** yapıyor. `lib/tezgah/*` (10 araç) + `lib/commerce/*` (56 dosya) tam bu iş için yazılmış.

**Teklif:** *"Ajans paketi: 10 mağaza koltuğu, aylık 500 üretim, Trendyol/HB senkronu, müşteriye markalı PDF teslim. ₺4.900/ay."*

**Neden bugün satılabilir:** Commerce kokpiti **çalışıyor** (mağaza, ürün, varyant, AES-GCM kimlik mührü, Trendyol/Hepsiburada istemcileri, webhook fişi, gelen kutusu). Eksik olan tek şey: **fiyat satırı** (QW-1).

---

## 3.2 Öldürücü Özellik (Killer Feature) Önerileri

### KF-1 · **Mühür Vitrini — Kamuya Açık Uzman Dizini** (`/uzmanlar`)

| Alan | Değer |
|---|---|
| **Mevcut altyapı** | `/vize/[id]` kamu kartı **canlı**, `career_visa_stamps` şeması canlı, `lib/career/public-talent*.ts` canlı, k-anonimlik deseni müzede (E8) |
| **Yapılacak** | (a) `/uzmanlar` dizin sayfası: dikey + il filtresi; (b) her kart `/vize/[id]`'ye gider; (c) "Bu uzmana iş ver" → e-posta bırakma (lead); (d) `SITEMAP` + `index: true` |
| **Efor** | **2–3 gün** (yeni motor yok, mevcut veriyi listelemek) |
| **Retention etkisi** | Rozet sahibi **profilinin bulunmasını** ister → rozeti tazeleme/geliştirme motivasyonu |
| **SEO etkisi** | Her uzman = uzun kuyruk sayfa × N. "Trendyol ürün metni uzmanı" araması |
| **Ticari etki** | B2B lead akışı doğrudan `b2b_lead_campaign_items` kuyruğuna düşer |
| **Anayasa** | A2 ✅ (para platformdan geçmez, yalnız eşleşme). A3 ✅ (yalnız rıza veren rozet sahibi listelenir) |

### KF-2 · **Üret → Mühürle Köprüsü** (tezgâh çıktısını portföye bağla)

| Alan | Değer |
|---|---|
| **Sorun** | Tezgâh çıktısı **buharlaşıyor**. Kullanıcının elinde kalan hiçbir şey yok. Ertesi gün gelmek için sebep yok. |
| **Yapılacak** | (a) `tezgah_output` tablosu (userId, tool, input hash, markdown, createdAt); (b) çıktı altında **"Portföyüme ekle"**; (c) portföy öğesi → `career_portfolio_items` (şema canlı!); (d) `/vize/[id]` kartında görünür; (e) "Bu çıktıyı mühürlemek için sınava gir" CTA |
| **Efor** | **3–4 gün** (1 yeni tablo + 2 route + 1 bileşen) |
| **Retention etkisi** | **En yüksek.** Kullanıcı her üretimde birikim yapar → geri döner. |
| **Ticari etki** | Tezgâh → Akademi dönüşümü doğrudan ölçülebilir hâle gelir |
| **Bonus** | `AiTokenUsage` kaydı da bu tabloya bağlanır → birim ekonomi görünür (R2 kapanır) |

### KF-3 · **Haftalık "Fırsat Radarı"** (e-posta + uygulama içi)

| Alan | Değer |
|---|---|
| **Mevcut altyapı** | Inngest ✅, `lib/kernel/notice/mail.ts` ✅, `yetkinhibe_grant_calls` (15 Kasım 2026 doğrulanmış) ✅, `funnel_*` ✅ |
| **Ne gönderir** | Kullanıcının dikeyi + iline göre: (a) **yeni açılan hibe çağrıları** (son 7 gün, `sourceVerifiedAt` mühürlü); (b) kendi muafiyet/rozet ilerlemesi; (c) **1 yeni tezgâh aracı önerisi**; (d) haftanın iş fikri (`opportunity-pool.json` → E3) |
| **LLM maliyeti** | **₺0** — tamamen deterministik şablon |
| **Efor** | **2–3 gün** (1 Inngest cron + 1 şablon) |
| **Retention etkisi** | Haftalık ritüel → D30 retention |
| **Ticari etki** | Hibe çağrısı → tezgâh → ücretli kredi zinciri |
| **Anayasa** | A5 ✅ (yalnız gerçek, mühürlü çağrı; "başvurunuz onaylandı" gibi sahte başarı yok) |

**Bonus (4. sırada, düşük efor):** **Anonim Hibe Uygunluk Widget'ı** (E2) — B2B lead magnet. Deterministik, sıfır maliyet, KOBİ'nin e-postasını doğal yolla alır. KF-3'ün yakıtıdır.

---

## 3.3 Büyüme ve Viral Döngü (Growth Loop) Fikirleri

### GL-1 · **Teslimat Filigranı Döngüsü** ⭐ (en yüksek kaldıraç, en düşük efor)

```
Freelancer tezgâhta üretir
   → çıktıyı MÜŞTERİYE teslim eder (dijital dükkan HTML, katalog CSV,
     reklam metni, teklif PDF, proje dosyası)
   → çıktının altında imza: "yetkin.ai AI Tezgâhı ile üretildi · yetkin.ai/tezgah"
   → MÜŞTERİ (KOBİ karar verici) markayı görür
   → "bunu ben de yapabilir miyim?" → siteye gelir → yeni kullanıcı
```

**Neden en iyisi:** Her teslimat bir **B2B karar vericiye** ulaşır. Türkiye'de bir freelancer ortalama ayda 3–8 teslimat yapıyor. 100 aktif freelancer = ayda **300–800 KOBİ marka teması**. Reklam bütçesi ₺0.

**Uygulama:** `lib/tezgah/dukkan/render.ts` (HTML), `lib/tezgah/pazaryeri/csv.ts`, `lib/tezgah/reklam/engine.ts` çıktılarına 1 satır imza. **2 saat.**

**Dürüstlük:** Bu bir **kredi**dir, sahte sosyal kanıt değil. Anayasa A5'e uygun.

### GL-2 · **Mühür Paylaşım Döngüsü**

```
Kullanıcı sınavı geçer → Rozet doğar
   → /vize/[id] kamu kartı (oturumsuz açılır)
   → LinkedIn "Add certification" (ZATEN VAR: lib/career/badge-share.ts)
   → profiline eklenir → ağındaki 500–2000 kişi görür
   → "%X daha yetkin" merakı → siteye gelir
```

**Eksik parça:** (a) WhatsApp/X paylaş butonu; (b) **paylaşılabilir görsel kart** (OG image var: `app/opengraph-image.tsx` — rozete özel `/vize/[id]/opengraph-image` eklenmeli); (c) rozet sahibine "kartını 3 yere ekle, 1 ücretsiz tezgâh kredisi kazan" (gerçek eylem ödülü, sahte değil).

**Efor:** 1–2 gün. **Etki:** Organik, sıfır maliyet.

### GL-3 · **Paylaşılabilir Tetkik Raporu Döngüsü** (B2B lead magnet)

```
KOBİ sahibi / freelancer: "sitem kaç puan?" merakı
   → /tetkik (anonim, deterministik, LLM'siz skor)
   → sonuç URL'i: /tetkik/[hash] (paylaşılabilir, kalıcı)
   → rapor sonunda: "Bu 4 eksiği kapatan uzman bul" → /uzmanlar
   → veya "Kendin düzelt: AI Tezgâhı aç"
```

**Mevcut altyapı:** `lib/tezgah/tetkik/*` (9 dosya): skor motoru (13 ağırlıklı kontrol, 100 puan), SSRF koruması, rubric, `b2b-measure.ts` (B2B motoru **zaten bunu kullanıyor**).

**Eksik:** kalıcı sonuç saklama + kamu sayfası + sitemap girdisi.
**Efor:** 2–3 gün. **Etki:** Yüksek (SEO + B2B lead + ürün kanıtı).

### GL-4 · **Hibe → Uzman Köprüsü**

```
KOBİ hibe uygunluk widget'ında skorunu görür (anonim)
   → "Projeyi kendin hazırla" (tezgâh grant aracı, ücretli kredi)
   → veya "Hazırlatan uzman bul" (→ /uzmanlar "Hibe & Proje Uzmanı" rozeti)
   → uzman kazanır, platform rozet + kredi satar
```

**Not:** `yetkin_muze/lib/hibe/ecosystem-bridges.ts` bu köprüyü `/freelancer/squad`'a bağlıyordu. **Canlıda freelance oda 410** → köprü `/uzmanlar`'a (KF-1) bağlanmalı. Bu, A2'yi delmeden (para platformdan geçmez) çalışan tek modeldir.

### GL-5 · **Kamu Sözlüğü SEO Döngüsü**

`platform-glossary.ts` (30 KB, 150+ terim) → `/sozluk/[terim]` programatik sayfalar. Her sayfada: tanım + "bu terimi tezgâhta nasıl kullanırsın" örneği + ilgili kurs CTA'sı. Ayda 5.000–20.000 uzun kuyruk ziyaretçi potansiyeli.

**Efor:** 2 gün (şablon + 30 sayfa). **Etki:** Yüksek, sıfır maliyet.

---

# BÖLÜM 4 — Yeni Master Plan Yol Haritası (Fazlar)

## Faz 1 — İlk 7 Gün: Ticari Lansman & Hızlı Kazanımlar

**Hedef:** Fiyat görünür, ödeme yolu açık, ücretsiz kanca çalışır, ilk dönüşümler ölçülür.
**Kuzey yıldızı:** İlk **10 ücretli işlem** (kurs veya lisans).

### Gün 1–2 · Fiyat görünürlüğü ve MRR rayı

| # | İş | Dosya / Yer | Kabul kriteri |
|---|---|---|---|
| 1.1 | **`commerce:monthly` katalog satırı** | Super Admin `/admin` (kod değişmez) — veya `supabase/migrations` yeni dosya | `/magazam/[storeId]/lisans` sayfası tutar basıyor, `422` gitmiş |
| 1.2 | **`/fiyatlandirma` sayfası** | `app/fiyatlandirma/page.tsx` + `lib/pricing/public-vitrine.ts` (E1 deseni) | `PriceCatalogEntry` + `COURSE_REGISTRY` okur; hazır olmayan paket "Hazırlanıyor" etiketli; `SITEMAP_STATIC_PATHS`'e eklenir |
| 1.3 | **Kurs kartlarında fiyat** | `components/academy/course-list.tsx` | Katalog kartı fiyat + taksit yok notu basar |
| 1.4 | **Footer + header'da "Fiyatlar"** | `components/shell/header-bar.tsx`, `footer` | 1 tıkla ulaşılır |

### Gün 3–4 · Ücretsiz kancayı düzelt (en kritik)

| # | İş | Dosya | Kabul kriteri |
|---|---|---|---|
| 1.5 | **Ana sayfa CTA sırası** | `app/(public)/page.tsx`, `lib/copy/sen-voice/public.ts` | **Birincil:** "AI Tezgâhını Dene (kayıtsız)" · **İkincil:** "Ücretsiz Seviye Testi" · **Üçüncül:** "Uzmanlık Paketleri" |
| 1.6 | **Test sonucu kayıtsız görünür** | `app/academy/[slug]/seviye/page.tsx`, `components/academy/exemption-guest-card.tsx` | Anonim kullanıcı 10 soruyu çözer, **puanı ve eksik konuları görür**; rozeti indirmek için kayıt istenir. `score` yazımı yine sunucuda, oturum yoksa yalnız görüntüleme. |
| 1.7 | **Misafir kotası 1 → 3** | `lib/tezgah/catalog.ts` `TEZGAH_GUEST_DAILY_LIMIT` | Mesaj anlamlı: "3 hakkın doldu, ertesi gün yenilenir" |
| 1.8 | **Kota mesajını erken göster** | `components/tezgah/workbench.tsx` | Hak sayısı 1. üretimden **önce** görünür; kayıt CTA'sı yanında |

### Gün 5 · Kasa sürtünmesi

| # | İş | Dosya | Kabul kriteri |
|---|---|---|---|
| 1.9 | **"Cüzdan yükle" dilini kaldır** | `components/academy/purchase-button.tsx`, `components/kernel/quick-top-up-modal.tsx` | Ön yüzde "Paketi Aç — Kartla Öde"; arka planda `LedgerEntry` CREDIT+DEBIT **aynen** kalır (A1 korunur) |
| 1.10 | **Yasal metin çelişkisi** | `lib/copy/legal-launch.ts` (`/legal/iade` vs `/legal/mesafeli-satis`) | İkisi aynı şeyi söylüyor: tahsilat dersi açar |

### Gün 6–7 · Ölçüm, güven, maliyet görünürlüğü

| # | İş | Dosya | Kabul kriteri |
|---|---|---|---|
| 1.11 | **Gerçek sayı bandı** | `app/(public)/page.tsx` | "6 eğitim · 40 mühürlü ders · N doğrulanmış rozet" — hepsi koddan okunur, elle yazılmaz |
| 1.12 | **AI maliyeti deftere yazılsın** | `lib/tezgah/engine.ts`, `grant/engine.ts`, `reklam/engine.ts`, `pazaryeri/engine.ts`, `tetkik/engine.ts`, `lib/career/coach.ts` | `recordUsage: true`. `AiTokenUsage` satırı düşüyor. **R2 kapanır.** Ücretli modelin ön koşulu. |
| 1.13 | **Huni panosunu doğrula** | `/admin` huni | `vitrine_visit` → `free_lesson` → `checkout_intent` → `purchase_settled` zinciri gerçek sayı basıyor |
| 1.14 | **GA4 `purchase` olayı** | `components/academy/purchase-button.tsx` (`trackPurchase`) | `transaction_id` ile tekilleşiyor, çift saymıyor |

**Faz 1 bitiş kapısı:** `/fiyatlandirma` canlı · `commerce:monthly` açık · ana CTA anonim değer veriyor · `recordUsage: true` · ilk 10 işlem.

---

## Faz 2 — Gün 8–21: `yetkin_muze` Elmas Entegrasyonu & Büyüme

**Hedef:** Ücretsiz huniden e-posta toplama, tezgâh çıktısının kalıcılaşması, kamuya açık uzman dizini, organik trafik motoru.
**Kuzey yıldızı:** **500 e-posta** + **100 kayıtlı kullanıcı** + **30 kamuya açık rozet sayfası**.

### Gün 8–11 · Kanca katmanı (lead magnet)

| # | İş | Elmas | Dosya | Kabul kriteri |
|---|---|---|---|---|
| 2.1 | **Hibe Uygunluk Widget'ı (anonim)** | **E2** | `components/hibe/grant-eligibility-widget.tsx` (müzeden uyarlanır) + `/api/hibe/match` (canlı `/api/yetkinhibe/grant/match` üzerine) | Fikir yaz → program + uygunluk % + tahmini destek. **LLM yok, ₺0.** E-posta isteğe bağlı (tam rapor için) |
| 2.2 | **E-posta yakalama katmanı** | — | `lib/growth/lead-capture.ts` + `/api/lead` | Tezgâh çıktısını indirmek için e-posta; KVKK tik; `notice_mail` ile doğrulama |
| 2.3 | **Tetkik kamu raporu** | GL-3 | `app/(public)/tetkik/page.tsx` + `/tetkik/[hash]` | Anonim skor + paylaşılabilir kalıcı URL + "uzman bul" CTA |
| 2.4 | **Ana sayfa widget bandı** | **E2** | `app/(public)/page.tsx` | Hibe widget'ı ana sayfada, ilk ekranın altında |

### Gün 12–15 · Tezgâh çıktısı kalıcı olsun (KF-2)

| # | İş | Dosya | Kabul kriteri |
|---|---|---|---|
| 2.5 | **`TezgahOutput` tablosu** | Yeni: `prisma/schema/tezgah.prisma` + migration | `userId`, `tool`, `inputHash`, `markdown`, `createdAt`, `tokenCostMinor` |
| 2.6 | **Üretimde persist** | `lib/tezgah/engine.ts` | Başarılı üretim satır yazar; üye "geçmişim" görür |
| 2.7 | **"Portföyüme ekle"** | `components/tezgah/workbench.tsx` + `/api/career/portfolio` (canlı rota) | `career_portfolio_items` satırı oluşur, `/vize/[id]`'de görünür |
| 2.8 | **"Bu çıktıyı mühürle" köprüsü** | `lib/tezgah/catalog.ts` `cta` alanları | Her araç çıktısı ilgili kurs sınavına yönlendirir |

### Gün 16–19 · Kamu dizini ve SEO motoru

| # | İş | Elmas | Dosya | Kabul kriteri |
|---|---|---|---|---|
| 2.9 | **`/uzmanlar` dizini** | **KF-1** | `app/(public)/uzmanlar/page.tsx` + `lib/career/talent-directory.ts` | Dikey + il filtresi; yalnız `stampSurface` açık rozetler; `index: true`; sitemap'e `generateStaticParams` |
| 2.10 | **k-anonimlik koruması** | **E8** | `lib/career/k-anonymity.ts` | Filtre sonucu < 5 ise liste basılmaz (dürüst boş durum) |
| 2.11 | **Sözlük sayfaları** | **E6/D1** | `lib/copy/glossary.ts` + `app/(public)/sozluk/[terim]/page.tsx` | 30 terim; her biri tanım + tezgâh örneği + kurs CTA |
| 2.12 | **15 rehber sayfası** | **E4** | `app/(public)/rehber/[slug]/page.tsx` + `lib/copy/seo.ts` genişletme | `SITEMAP_STATIC_PATHS` büyür; her sayfa `PAGE_SEO` + FAQ JSON-LD |

### Gün 20–21 · Viral döngüler

| # | İş | Loop | Dosya | Kabul kriteri |
|---|---|---|---|---|
| 2.13 | **Teslimat filigranı** | **GL-1** | `lib/tezgah/dukkan/render.ts`, `pazaryeri/csv.ts`, `reklam/engine.ts`, `grant/draft.ts` | Her çıktı sonunda `yetkin.ai` imzası |
| 2.14 | **Rozet paylaşım kiti** | **GL-2** | `components/career/seal-share-guides.tsx`, `app/vize/[id]/opengraph-image.tsx` | WhatsApp + LinkedIn + kopyala; rozete özel OG görseli |
| 2.15 | **Haftalık fırsat radarı** | **KF-3** | `lib/jobs/weekly-radar.ts` + Inngest cron + `notice_mail` | Kullanıcı dikeyine göre yeni hibe çağrıları + 1 iş fikri; LLM'siz |

**Faz 2 bitiş kapısı:** 500 e-posta · 100 kayıt · `/uzmanlar` indeksli · tezgâh çıktısı kalıcı · haftalık e-posta gidiyor.

---

## Faz 3 — Gün 22–45: Ölçekleme & Otomasyon

**Hedef:** Ücretli üretim kotası, B2B paket, abonelik MRR, otomasyon.
**Kuzey yıldızı:** **İlk ₺10.000 MRR** veya **50 aktif Pro abone** — hangisi önce gelirse.

### Gün 22–27 · Ücretli tezgâh kotası (gelir motoru)

| # | İş | Dosya | Kabul kriteri |
|---|---|---|---|
| 3.1 | **Kotayı kalıcı yap** | `lib/tezgah/quota.ts` → `TezgahDailyQuota` tablosu (veya Redis) | Multi-instance'ta tutarlı. **R1 kapanır.** |
| 3.2 | **`tezgah:pro` katalog birimi** | `lib/kernel/admin/catalog-write.ts` `CATALOG_OPENABLE_UNITS` + migration tohumu | Super Admin tutar yazar; satır yoksa ücretli yol kapalı (fail-closed) |
| 3.3 | **Ücretli üretim = ledger debit** | `lib/tezgah/engine.ts` + `lib/kernel/ai/paid-command.ts` | `PaidCommandReservation` + `Idempotency-Key`; `LedgerEntry` DEBIT; A1 korunur |
| 3.4 | **Kota aşımı → satın alma** | `components/tezgah/workbench.tsx` | "Hakkın doldu" → "Pro'ya geç (₺349/ay)" veya "10 kredi ₺89" |
| 3.5 | **Pro indirme** | `lib/tezgah/pro/*` | ZIP/DOCX indirme Pro'ya kilitli; ücretsiz kullanıcı markdown kopyalar |

### Gün 28–33 · B2B paket ve kurumsal kasa

| # | İş | Dosya | Kabul kriteri |
|---|---|---|---|
| 3.6 | **B2B Ekip Rozeti paketi** | `PriceCatalogEntry("academy","team-seat")` + `/api/career/team/*` | 5 koltuk, kurumsal fatura (`UserBillingInfo.corporate` ✅), tek PayTR siparişi |
| 3.7 | **Ajans paketi (Commerce)** | `lib/commerce/subscription.ts` çoklu mağaza | 10 mağaza koltuğu; **QW-1'in üstüne** |
| 3.8 | **B2B motorunu besle** | `/admin/b2b` + `lib/kernel/admin/b2b-outbound.ts` | Tetkik + hibe widget lead'leri kuyruğa düşer; günlük 15 tavanı korunur |
| 3.9 | **Kurumsal teklif sayfası** | `app/(public)/kurumsal/page.tsx` (müzedeki `kopya` D-kaynaklı) | Fiyat + "teklif al" formu; `kurumsal` odası **açılmaz**, yalnız satış sayfası |

### Gün 34–39 · Değerlendirme ürünleri (müze elması)

| # | İş | Elmas | Dosya | Kabul kriteri |
|---|---|---|---|---|
| 3.10 | **SWOT değerlendirmesi** | **E5** | `lib/career/swot.ts` (müzeden, merit bağı sökülmüş) + `/api/career/swot` | Ücretsiz 1 kez, ücretli derin rapor (₺249) |
| 3.11 | **30/60/90 yol haritası** | **E5** | `lib/career/roadmap.ts` | Tezgâh çıktısı + rozet verisinden üretir; LLM `FAST_STREAM` (maliyet deftere yazılır) |
| 3.12 | **Hibe proje dosyası kredisi** | **D2/E2** | `lib/tezgah/grant/*` + `PaidCommandReservation` | Tam proje dosyası (DOCX) ₺790; `Idempotency-Key` zorunlu |

### Gün 40–45 · Otomasyon ve karar kapıları

| # | İş | Dosya | Kabul kriteri |
|---|---|---|---|
| 3.13 | **Fiyat otomasyonu** | `lib/kernel/pricing/*` (canlı) + müzeden `pricing-autopilot-engine.ts` deseni | Marj tabanı assert'i; sessiz zam yok (`PriceCatalogDecisionLedger` ✅ canlı) |
| 3.14 | **Emanet/split karar kapısı** | `lib/kernel/payments/marketplace-split-live.ts` | **Açma.** Karar: PayTR Pazaryeri sözleşmesi + en az 50 aktif rozet sahibi olmadan `false` kalır |
| 3.15 | **Freelancer oda kararı** | `lib/kernel/compliance/circuit-breakers.ts` | **Açma.** Yerine `/uzmanlar` dizini (KF-1) yeterli. 410 kalır. |
| 3.16 | **Junior kararı** | `lib/dronlar/kayit.ts` | Kasa kilitli kalır; yeni özellik yazılmaz. Bakım maliyeti raporlanır. |
| 3.17 | **Sentry/GlitchTip bağla** | `.env.example` + `instrumentation.ts` | `OBSERVABILITY_DSN` doluysa hata toplanıyor |

**Faz 3 bitiş kapısı:** Kota kalıcı · ücretli üretim ledger'a yazıyor · Pro abonelik satışta · B2B teklif sayfası · ilk MRR.

---

## 4.1 Karar Matrisi — Ne Açılacak, Ne Kapalı Kalacak

| Modül | Karar | Gerekçe |
|---|---|---|
| **Akademi (6 SKU + sınav + mühür)** | **AÇIK — Faz 1** | Ses ve sınav %100 hazır; sıfır prodüksiyon maliyeti |
| **AI Tezgâh (10 araç)** | **AÇIK — Faz 1** | Tek anonim değer yüzeyi |
| **Fiyat vitrini** | **AÇIK — Faz 1** | En büyük dönüşüm deliği |
| **Kariyer + rozet + `/vize/[id]`** | **AÇIK — Faz 1** | Kanıt zinciri; paylaşım döngüsü |
| **`/uzmanlar` dizini** | **AÇIK — Faz 2** | Freelancer 410'unun A2-güvenli ikamesi |
| **Hibe uygunluk widget'ı** | **AÇIK — Faz 2** | Sıfır maliyetli B2B lead magnet |
| **E-Ticaret lisansı (commerce:monthly)** | **AÇIK — Faz 1** | Tek MRR rayı; 1 satır ile açılır |
| **Tezgâh Pro abonelik** | **AÇIK — Faz 3** | Kota kalıcılaştıktan **sonra** |
| **Hibe proje kredisi** | **AÇIK — Faz 3** | `PaidCommandReservation` hazır |
| **Freelancer iş panosu** | **KAPALI (410)** | A2: Split yok → emanet yok → iş döngüsü yalan olur. `/uzmanlar` ikame |
| **PayTR Pazaryeri Split** | **KAPALI** | Lisanslı sözleşme yok; `not_configured` dürüst |
| **Junior** | **KAPALI (kasa)** | 2 e-posta izin listesi; bakım/gelir oranı kötü |
| **Young** | **KAPALI** | Kullanılmıyor |
| **YetkinHibe odası (`/yetkinhibe`)** | **API AÇIK, sayfa KAPALI** | Motor canlı, vitrin yok — widget ile çözülür |
| **Studio / DevLabs / Kurumsal / Arena / Pazaryeri / Social (müze)** | **KAPALI — taşınmaz** | Bkz. 2.4 |
| **Kurumsal satış sayfası** | **AÇIK — Faz 3** | Oda değil, yalnız teklif formu |

---

## 4.2 Risk Kaydı ve Önlemler

| Risk | Önlem | Faz |
|---|---|---|
| Tezgâh kotası multi-instance'ta tutmuyor | DB/Redis'e taşı | Faz 3 (3.1) — **ücretli modelden önce zorunlu** |
| AI maliyeti görünmüyor | `recordUsage: true` | **Faz 1 (1.12)** |
| Fiyat sayfası yok | `/fiyatlandirma` | **Faz 1 (1.2)** |
| `commerce:monthly` satırı yok | Admin PATCH | **Faz 1 (1.1)** |
| Birincil CTA kayıt duvarı | CTA sırası + anonim test sonucu | **Faz 1 (1.5, 1.6)** |
| E-posta yakalama yok | Lead katmanı | Faz 2 (2.2) |
| Tezgâh çıktısı buharlaşıyor | Persist + portföy | Faz 2 (2.5–2.8) |
| Rozet→iş vaadi karşılıksız | Vaadi `/uzmanlar`'a yönlendir; "iş bul" iddiasını kaldır | Faz 2 (2.9) |
| Freelancer 410 açılma baskısı | Karar: açılmayacak; `/uzmanlar` ikame | Faz 3 (3.15) |
| Müze şeması (248 model) taşınma isteği | Yalnız tek model kopyalanır | Sürekli |
| `verify:*` testleri kaynak metni grep ediyor | Refactor'da kırılganlık; davranış testi eklenmeli | Sürekli (teknik borç) |

---

## 4.3 Bu Planda **Yapılmayacaklar** (45 gün)

- Müzeden Studio / DevLabs / Pazaryeri / Arena / Social taşımak.
- Freelancer odasını 410'dan çıkarmak.
- PayTR Pazaryeri Split'i açmak (`MARKETPLACE_SPLIT_LIVE = true`).
- İkinci ödeme rayı (Stripe / iyzico).
- Junior'a yeni özellik yazmak.
- Acente white-label modeli.
- Kurumsal Beyin (RAG) — ayrı ürün turu.
- Müze `schema.prisma`'sını (342 KB, 248 model) ithal etmek.
- Yeni Prisma agregat kökü açmak (P0 güvenlik ve Faz 1–3 maddeleri hariç).
- `lib/merit` paralel para birimini taşımak (A1 çelişkisi).

---

## 5. Sonuç — Masadaki Tek Cümlelik Gerçek

> **Bu projede yazılacak yeni özellik yok; görünür kılınacak mevcut değer var.**
>
> Üç gün içinde eklenen ticari kas (Commerce kokpiti, kariyer koçu, sosyal masa, B2B motoru) ürünü gerçekten ileri taşıdı. Ama **fiyat sayfası olmadığı için** kimse fiyatı göremiyor, **katalog satırı olmadığı için** tek MRR rayı kapalı, **birincil CTA kayıt duvarında olduğu için** ziyaretçinin %95'i değer almadan gidiyor, **çıktı saklanmadığı için** kimse ertesi gün geri gelmiyor.
>
> Müzedeki elmas, 101 raporunun işaret ettiği Studio peronları değil: **fiyat vitrini (E1)**, **hibe kancası (E2)**, **ilk iş kataloğu (E3)**, **SEO sicili (E4)** ve **700 KB Türkçe kopya (E6)**. Beşi de **düşük efor / yüksek etki** kutusunda.
>
> **Faz 1'in tamamı 7 günde, 14 maddede bitiyor. Ve 14 maddenin 6'sı ya tek satırlık bayrak/ayar ya da admin paneli işi — yeni mimari gerektirmiyor.**

---

### Ek — Bu Raporun Doğrulanabilir İddiaları

| İddia | Doğrulama |
|---|---|
| Fiyat sayfası yok | `Test-Path app/fiyatlandirma` → `False`; `Test-Path app/pricing` → `False` |
| `commerce:monthly` tohumlanmamış | `prisma/migrations/*` + `supabase/migrations/*` içinde `'commerce'` modül anahtarı → **0 sonuç** |
| Birincil CTA kayıt duvarı | `app/academy/[slug]/seviye/page.tsx` → oturum yoksa `ExemptionGuestCard` |
| Test tek dikey | Aynı dosya: `if (slug !== OFF_101_EXEMPTION_COURSE_SLUG) notFound()` |
| Tezgâh kota bellekte | `lib/tezgah/quota.ts:25` `const slots = new Map<...>()` |
| AI maliyeti 12 yüzeyde yazılmıyor | `recordUsage: false` grep → **12 eşleşme / 10 dosya**; `true` → 4 eşleşme |
| Freelancer 410 | `lib/kernel/compliance/circuit-breakers.ts:39` `FREELANCER_PUBLIC_SURFACE_LOCKED = true`; `marketplace-split-live.ts:8` `= false` |
| Ödeme tek ray | `package.json` — Stripe/iyzico bağımlılığı yok; `lib/kernel/payments/paytr/*` |
| RLS FORCE | `supabase/migrations/20260814020000_enforce_rls_all_tables.sql`; 64 tablo `RLS_FORCE_TABLES` |
| Defter append-only | `prisma/migrations/20260819030000_ledger_immutability_paid_commands` — `yetkin_forbid_ledger_mutation()` trigger |
| Sosyal kanıt yok | `lib/copy/sen-voice/public.ts` içinde `testimonial|yorum|referans|musteri` → **0** |
| Scout gerçek tarama yapmıyor | `yetkin_muze/lib/freelancer/scout-engine.ts` — `PLATFORM_QUEUE_TEMPLATES` sabit uydurma şablonlar |
| Müze 248 model / 158 sayfa / 559 rota | `prisma/schema.prisma` `^model ` sayımı = 248; `app/**/page.tsx` = 158; `app/**/route.ts` = 559 |

*Rapor sonu. Kaynak kodu değiştirilmedi; yalnız bu dosya oluşturuldu.*
