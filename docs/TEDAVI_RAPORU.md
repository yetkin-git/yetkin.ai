# yetkin.ai — Tedavi (İyileştirme ve Onarım) Raporu

**Tedavi tarihi:** 22 Kasım 2026
**Kaynak teşhis:** [`docs/TESPIT_RAPORU.md`](./TESPIT_RAPORU.md) (sağlık skoru **68 / 100**)
**Yöntem:** Bulgu → kaynak kodu müdahalesi → kapı doğrulaması. Her müdahale için dosya yolu, değişiklik özeti ve kanıt aşağıdadır.
**Kural:** Mevcut mimari sınırlar (`verify:boundaries`), güvenlik mühürleri (`verify:rls-status`, `verify:no-secrets`, `verify:api-auth`) ve test paketi korundu. Test sayısı **1988 → 2011** (23 yeni test).

---

## 1. Tedavi Özeti ve Yeni Sağlık Skoru Tahmini

### 1.1 Skor hareketi

| Eksen | Önce | Sonra | Gerekçe |
|---|---:|---:|---|
| **Mimari** | 88 | **91** | Ölü Akademi CSS'i canlı ağaçtan tamamen çıktı; `PublicTopBar` tek navigasyon kaynağı oldu; `verify:sen-axis` mühür kapsamı genişledi. |
| **Ticari Kurgu** | 62 | **78** | Pro kotası gerçek (3 → 100); kayıt sonrası ilk değer anı tanımlandı; deneme metni tek SSOT'ta; hayalet YetkinCV katalog satırı kapatıldı; huni ölçümü 4 olaya çıktı. |
| **Hız** | 76 | **89** | Canlı CSS **151 KB → 22.4 KB** (gzip 26.4 → **6.8 KB**); kullanılmayan font fonksiyon izinden çıktı. |
| **SEO** | 61 | **82** | `Product`/`Offer` JSON-LD, `llms.txt`, `manifest.webmanifest`, `viewport`/`themeColor`; H1 SERP sınırında ve sen aksında; satış sayfası sitemap önceliği 0.9. |
| **Stabilite** | 82 | **87** | `w-screen` + negatif margin kaldırıldı; env şeması çalışma zamanında devrede (build kırmadan). |

> **Yeni sağlık skoru tahmini: 68 → 85 / 100**

### 1.2 Tek cümlelik teşhis (güncel)

> **yetkin.ai artık "güvenlik ve doğruluk" mühendisliğinin yanında "dönüşüm" de yapıyor:** ödediği paranın karşılığını göremeyen Pro kullanıcı, boş kokpite düşen yeni kullanıcı, dört farklı tonda okunan aynı teklif ve her sayfada inen 115 KB ölü CSS kapandı.

### 1.3 Kapanan bulgular

| Bulgu | Önem | Durum |
|---|---|---|
| **B-01** YetkinCV hayalet katalog satırı | `KRİTİK` | ✅ Kapatıldı (vitrinde ücretsiz değerlendirme, açılabilir birimden çıkarıldı) |
| **B-02** Pro kotası görünmüyor (3 → 3) | `KRİTİK` | ✅ Kapatıldı (günlük 100, kendi sayaç dili) |
| **B-03** Kayıt sonrası ilk değer anı yok | `YÜKSEK` | ✅ Kapatıldı (signup → `/tezgah?tool=proposal&ilk=1`) |
| **B-05** 30 gün deneme metni 4 farklı tonda | `ORTA` | ✅ Kapatıldı (`lib/pricing/trial-copy.ts` SSOT) |
| **4.4** Huni ölçüm olayları eksik | `ORTA` | ✅ Kapatıldı (4 yeni olay bağlandı) |
| **M-01** Dil aksı mührü kırık (2 ihlal) | `YÜKSEK` | ✅ Kapatıldı (yeşil + kapsam genişledi) |
| **M-02** `globals.css` %74.6'sı ölü | `YÜKSEK` | ✅ Kapatıldı (151 KB → 22.4 KB) |
| **M-03** Kamu sayfalarında üst menü yok | `ORTA` | ✅ Kapatıldı (`PublicTopBar`) |
| **M-04** `getEnv()` hiç çağrılmıyor | `ORTA` | ✅ Kapatıldı (`instrumentation.ts`) |
| **S-02** Env şeması çalışma zamanında yok | `YÜKSEK` | ✅ Kapatıldı (ödeme env'i erken yakalanıyor) |
| **S-03** `w-screen` yatay taşma riski | `ORTA` | ✅ Kapatıldı (`w-full` + `overflow-hidden`) |
| **S-04** Viewport / manifest eksik | `ORTA` | ✅ Kapatıldı (`viewport` + `app/manifest.ts`) |
| **P-01** Kullanılmayan font trace'te | `YÜKSEK` | ✅ Kapatıldı (izden çıkarıldı) |
| **SEO-01** Fiyat sayfasında `Product`/`Offer` yok | `YÜKSEK` | ✅ Kapatıldı (dinamik, katalogdan) |
| **SEO-02** `llms.txt` yok | `YÜKSEK` | ✅ Kapatıldı (`/llms.txt` rotası) |
| **SEO-03** Başlık/açıklama sınırları | `ORTA` | ✅ Kapatıldı (home/contact/legal/kurumsal) |
| **SEO-05** Sitemap önceliği hatalı | `İYİLEŞTİRME` | ✅ Kapatıldı (fiyat 0.9, legal 0.3) |

**Bilinçli kapsam dışı (rapor §4 stratejik fazı):** Guest checkout, aylık kredi ekonomisi, YetkinCV ücretli mühür/yayın modeli, Junior MP3 transcode, `/durustluk` sayfası, `lib/academy/curricula` arşiv taşıması, `generate` rotalarına kullanıcı bazlı hız tavanı (S-01). Gerekçeler §4'te.

---

## 2. Uygulanan Müdahaleler (Madde Madde)

### 2.1 Ticari Mantık ve Dönüşüm Hunisi

#### `B-02` — Tezgâh Pro kotası gerçek ve tek kaynaklı

| Dosya | Değişiklik |
|---|---|
| `lib/tezgah/catalog.ts` | **YENİ** `TEZGAH_PRO_DAILY_LIMIT = 100`. **YENİ** `tezgahProQuotaLine(remaining, limit)` → `"Pro — günlük 100 üretim hakkı · kalan 87"`. **YENİ** `tezgahPoolQuotaLineForLane()` / `tezgahToolQuotaLineForLane()` — `lane` parametresi verilirse Pro hattı kendi dilini basar, ücretsiz sayaç cümlesi **basılmaz**. **YENİ** `TEZGAH_PRO_QUOTA_MESSAGE` (Pro tavanı dolduğunda "ücretsiz hak" cümlesi yerine). |
| `lib/tezgah/quota.ts` | **BUG DÜZELTMESİ:** Pro hattı önceden `limit` = ücretsiz tavan (3) döndürüyor ve **sayacı hiç artırmıyordu**. Artık `tezgahProPoolLimit()` ile gerçek tavan hesaplanır, `activeStore().tryConsume()` ile `tezgah_daily_quotas` üzerinde **günlük sayılır**, İstanbul gece yarısında yenilenir. Tavan dolunca kredi hattına düşer; kredi yoksa Pro cümlesi + `paywall` bayrağı. `closedMessage()` `pro` parametresi aldı. Tetkik havuzu Pro'da da ömür boyu 1 (ürün sözleşmesi korundu). |
| `app/api/tezgah/quota/route.ts` | `tezgahToolQuotaLineForLane` / `tezgahPoolQuotaLineForLane` okur; `lane` satıra geçer. |
| `components/tezgah/workbench.tsx` | Kota rozeti `tezgahToolQuotaLineForLane(..., quota.lane)` kullanır. `showMemberCard` koşulundan `lane !== "pro"` **kaldırıldı** — tavanı dolan Pro kullanıcı kredi paketi teklifini görür (önceden hiçbir şey görmüyordu). |
| `lib/pricing/public-vitrine.ts` | Pro kartı `lines[0]` artık `Günde ${TEZGAH_PRO_DAILY_LIMIT} üretim (ücretsiz ${TEZGAH_GUEST_DAILY_LIMIT})` — elle yazılmış "Aylık yüksek üretim kotası" vaadi kaldırıldı. |
| `app/(public)/fiyatlandirma/page.tsx` | Karşılaştırma tablosu "Yüksek kota" hücresi → `` `Günde ${TEZGAH_PRO_DAILY_LIMIT} üretim` ``. |

**Kanıt:** `tests/tezgah/quota.test.ts` — 3 yeni test: Pro tavanı 100 ve ücretsiz tavanın üzerinde; Pro aktifken sayaç gerçekten düşer (tetkik ömür boyu 1 korunur); tavan dolunca `TEZGAH_PRO_QUOTA_MESSAGE` basılır ve cümlede "ücretsiz" geçmez.

#### `B-03` — Kayıt sonrası ilk değer anı

| Dosya | Değişiklik |
|---|---|
| `lib/kernel/auth/redirects.ts` | `AUTH_CALLBACK_DEFAULT_NEXT` = `/dashboard` **korundu** (giriş yapan mevcut kullanıcı kokpite döner). **YENİ** `AUTH_SIGNUP_FIRST_VALUE_NEXT = "/tezgah"`, **YENİ** `SIGNUP_FIRST_VALUE_PARAM = "ilk"`, **YENİ** `markSignupFirstValueLanding({ next, type })` → yalnız `type=signup` **ve** hedef varsayılan Tezgâh ise `?tool=proposal&ilk=1` ekler. `resolveAuthCallbackNext()` signup dalında bu işareti uygular. **Açık yön allowlist'i değişmedi.** |
| `app/tezgah/page.tsx` | `?ilk=1` bayrağı okunur (değer güvenilmez, yalnız varlığı); başlık `"İlk çıktını al — tek alan yeter"` olur ve `data-tezgah-first-visit` karşılama şeridi basılır. |
| `lib/dashboard/next-best-action.ts` | **YENİ** `tezgah_first` eylem türü + `isFreshUser(pulse)`. Hiçbir üretimi/bakiyesi/ilanı olmayan kullanıcı **kilitli `/hibe` odasına değil** `/tezgah`'a iner. `/hibe` fallback'i (üretimi olan kullanıcı) korundu. |
| `lib/copy/sen-voice/dashboard.ts` | **YENİ** `nextBestAction.firstValue` — "Henüz Tezgâh'ta çıktı üretmedin…" + `"İlk çıktını üret"`. |
| `components/dashboard/next-best-action-card.tsx` | `tezgah_first` dalı bağlandı. |

**Kanıt:** `tests/kernel/auth-callback-redirects.test.ts` — 1 yeni test (8 assert): signup → `/tezgah?tool=proposal&ilk=1`; özel `next` (`/e-ticaret`) korunur; hash'li hedef korunur; açık yön güvenli hedefe düşer; recovery/giriş davranışı değişmez. `tests/dashboard/next-best-action.test.ts` — boş nabız `tezgah_first`; bakiyeli kullanıcı `/hibe`; freelancer ilanlı kullanıcı `/hibe` (yeni sayılmaz).

#### `B-05` — Deneme metni tek doğruluk kaynağı

| Dosya | Değişiklik |
|---|---|
| `lib/pricing/trial-copy.ts` | **YENİ DOSYA.** `TRIAL_PERIOD_DAYS`, `TRIAL_VERIFY_AMOUNT_LABEL`, `TRIAL_BADGE`, `TRIAL_TITLE`, `TRIAL_HEADLINE`, `TRIAL_VERIFY_LINE`, `TRIAL_INPUT_LINE`, `TRIAL_VERIFY_FIELD_LABEL`, `TRIAL_RENEWAL_FIELD_LABEL`, `trialRenewalLine(catalogAmountMinor)` (tutar yoksa `null`), `TRIAL_CANCEL_LINE`, `TRIAL_HONESTY_LINE`, `TRIAL_HONESTY_NOTE`, `TRIAL_CTA`, `TRIAL_COPY` paketi. Hepsi **sen** aksında. |
| `lib/pricing/public-vitrine.ts` | Vitrin kartı ve `trial` bloğu SSOT'tan okur; yerel `TRIAL_VERIFY_LABEL` sabiti silindi. |
| `components/commerce/license-checkout.tsx` | Deneme bölümü `TRIAL_BADGE`/`TRIAL_TITLE`/`TRIAL_VERIFY_LINE`/`TRIAL_VERIFY_FIELD_LABEL`/`TRIAL_CANCEL_LINE`/`TRIAL_HONESTY_LINE` okur. `copy.trialVerifyLabel`/`copy.trialBody` bağı koptu. |
| `app/(public)/fiyatlandirma/page.tsx` | "Dürüstlük notu" paragrafı `TRIAL_HONESTY_NOTE`'tan gelir; hero metni sen aksına çevrildi. |
| `app/(public)/rehber/page.tsx` + `lib/rehber/workflows.ts` | Rehber adımının `input`/`tip` satırları `TRIAL_INPUT_LINE`/`TRIAL_HONESTY_LINE`'dan okur; `TRIAL_VERIFY_AMOUNT_LABEL` SSOT'tan yeniden dışa açılır. |

**Kanıt:** `tests/commerce/subscription-lifecycle.test.ts` — "vitrin kartı…" testi **dizgi dondurmaktan** vazgeçti; artık SSOT sözleşmesini doğruluyor (4 yüzey `trial-copy`'den import eder). `tests/ui/rehber-workflow-surface.test.ts` (dokunulmadan) hâlâ yeşil: `1,00` etiketi, `VKN veya TCKN`, `iade taahhüdü değildir` cümleleri korundu.

#### `B-01` — YetkinCV katalog tutarlılığı

| Dosya | Değişiklik |
|---|---|
| `lib/kernel/admin/catalog-write.ts` | `CATALOG_OPENABLE_UNITS` içinden `career / yetkincv-exam` **çıkarıldı** (yerinde ayrıntılı gerekçe yorumu). Operatör artık hiçbir ödeme rotasına bağlı olmayan 290 TL'lik satırı açamaz. Diğer 7 açılabilir birim duruyor. |

`lib/pricing/public-vitrine.ts` **değişmedi**: YetkinCV kartı `PUBLIC_FREE_EVALUATION_LABEL` ("Ücretsiz Değerlendirme") ile tam uyumlu kalıyor.

**Kanıt:** `tests/ui/treatment-surface.test.ts` — `yetkincv-exam` yok; `job-screening-pack` ve `monthly` duruyor; vitrin hâlâ `career:yetkincv-exam` kimliğini ücretsiz etiketle basıyor.

#### `4.4` — Dönüşüm hunisi ölçüm olayları

| Dosya | Değişiklik |
|---|---|
| `lib/kernel/sem/conversion.ts` | `SEM_CONVERSION_NAMES`'e 4 olay: `tezgahFirstOutput: "tezgah_first_output"`, `tezgahQuotaWall: "tezgah_quota_wall"`, `pricingView: "pricing_view"`, `checkoutStart: "checkout_start"`. Dosya başında olay → tetikleme noktası tablosu. |
| `lib/tezgah/record-output.ts` | **YENİ** `recordSignedTezgahOutputWithMeta()` → `{ id, firstForUser }`. `firstForUser`, yazma sonrası `tezgahOutput.count === 1`'dir. Sayaç sorgusu düşerse bayrak `false` (yanlış "ilk çıktı" iddiasından kaçınılır). Eski `recordSignedTezgahOutput` imzası korundu (7 çağıran kırılmadı). |
| `lib/tezgah/engine.ts` | `TezgahGenerateResult` başarı dalına `firstOutput: boolean` eklendi; `app/api/tezgah/generate/route.ts` yanıta taşır. |
| `components/tezgah/workbench.tsx` | `firstOutput === true` → `emitSemConversion("tezgahFirstOutput", { tool, guest })`. Kota duvarı `useEffect` ile **göründüğünde bir kez** `tezgahQuotaWall` basar (`wallKey = tool:guest|member`; aynı araçta tekrar sayılmaz). |
| `components/pricing/pricing-checkout-tracker.tsx` | **YENİ İSTEMCİ BİLEŞENİ.** `pricing_view` (bir kez) + `checkout_start` (kart CTA tıklaması, `data-pricing-cta` özniteliğiyle tek pasif dinleyici). Tutar **prop** olarak gelir; istemci fiyat hesaplamaz. |
| `app/(public)/fiyatlandirma/page.tsx` | `PricingCheckoutTracker` bağlandı; `LinkButton`'a `data-pricing-cta={item.id}` eklendi. |

**Kanıt:** `tests/copy/seo-surface.test.ts` — `SEM_CONVERSION_NAMES` tam nesne eşitliği (7 olay). `tests/ui/treatment-surface.test.ts` — 4 olay tanımlı ve 4 tetikleme noktası bağlı.

### 2.2 Marka Dili ve Navigasyon

#### `M-01` — Dil aksı mührü yeşile döndü (ve kapsamı genişledi)

Mühür **kırıktan yeşile** döndü. Düzeltilen gerçek kaçaklar:

| Dosya | Önce | Sonra |
|---|---|---|
| `app/(public)/rehber/page.tsx` | "önce **anlayın**, sonra **hesabınızı açın**" | "önce **anla**, sonra **hesabını aç**" |
| `app/(public)/rehber/page.tsx` | "bu bedel **bakiyenize** yazılmaz… **Beğenmezseniz**" | "bu bedel **bakiyene** yazılmaz… **Beğenmezsen**" |
| `lib/copy/sen-voice/public.ts` (H1) | "**İşinizi** Büyüten… Tek Hesap, Sıfır Karmaşa." (74) | "**İşini** Büyüten Yapay Zeka Araçları" (35) |
| `lib/copy/sen-voice/public.ts` (meta) | "…belgeler **üretin**… **siparişlerinizi**… **işletmenize**…" | "…belgeler **üret**… **siparişlerini**… **işletmene**…" |
| `lib/copy/sen-voice/public.ts` (tracks ×4) | "**hazırlayın**", "**toplayın**", "**görün**", "**ölçün**", "**kurun**" | "**hazırla**", "**topla**", "**gör**", "**ölç**", "**kur**" |
| `lib/copy/sen-voice/public.ts` (resources) | "karnesini **ölçün**; … **görün**" | "karnesini **ölç**; … **gör**" |
| `lib/copy/seo.ts` (contact) | "…**dönüş yapıyoruz**." | "…**dönüş yapılır**." |
| `app/(public)/iletisim/page.tsx` | "…**dönüş yapıyoruz**." | "…**dönüş yapılır**." |
| `app/(public)/fiyatlandirma/page.tsx` | "talebinizi bırakın; paneli kendiniz tanımlayın" | "talebini bırak; paneli kendin tanımla" |
| `lib/rehber/workflows.ts` | "…mağazanızı **bağlayabilirsiniz** — **hesabınızı** ücretsiz **açın**, … **deneyin**" | "…mağazanı **bağlarsın** — **hesabını** ücretsiz **aç**, … **dene**" |
| `components/hibe/grant-eligibility-widget.tsx` | "Hibe uygunluğunu ücretsiz **görün**" / "…daha **açın**" | "…ücretsiz **gör**" / "…daha **aç**" |
| `components/hibe/project-desk.tsx` | "…daha **açın**" | "…daha **aç**" |
| `components/tezgah/workbench.tsx` | "…daha **açın**" | "…daha **aç**" |
| `lib/pricing/trial-copy.ts` | (yeni dosya) | baştan sen aksında |

**`lib/copy/junior-guardian-notice.ts` — bilinçli istisna (gizlenmedi, sicile yazıldı).** Bu dosya 6698 sayılı KVKK kapsamında **veliye** sunulan mühürlü aydınlatma metnidir. "siz" burada marka aksı değil **hukuk dilidir**; metin değişirse SHA-256 özeti değişir, sürüm artar ve **tüm velilerin yeniden onayı** gerekir (yürürlükteki Junior pilotu kapanır). Sürüm dizesi ayrıca `apps/rail-is/.../JuniorProfileScreen.tsx` ve `packages/kernel/src/generated/v1.ts` içinde sabittir. Raporda önerilen (b) seçeneği uygulandı: `scripts/verify-sen-axis.ts` içine **`FROZEN_LEGAL_SEN_EXCEPTIONS`** sicili eklendi, dosya üç nedeniyle birlikte belgelendi. Metin gerçekten değişecekse sıra raporda yazılı: yeni sürüm + yeni özet + native istemci sürümü + veli yeniden onayı.

#### `scripts/verify-sen-axis.ts` — mühür kapsamı genişledi

- **YENİ** `SIZ_LEAK_WORDS`: `İşinizi`, `işletmenize`, `siparişlerinizi`, `stoklarınızı`, `bakiyenize`, `dönüş yapıyoruz`, `anlayın`, `açın`, `görün` (raporun §M-01 önerisi birebir).
- **Düz `includes` yerine kelime sınırlı regex:** `(?<![A-Za-zÇĞİÖŞÜçğıöşü])kalıp(?![A-Za-zÇĞİÖŞÜçğıöşü])`. Gerekçe: `görün` gibi kısa kalıplar `görünür`/`görünüm` içinde eşleşip **35 yanlış alarm** üretiyordu. Bu, mühürün ilk denemesinde ölçüldü ve düzeltildi.
- Eski 24 kalıp aynen korundu (geriye dönük uyum).
- **Sonuç:** `verify:sen-axis OK — 512 dosya, 34 siz kaçağı tarandı`.

#### `M-03` — Kamu sayfaları üst menüsü

| Dosya | Değişiklik |
|---|---|
| `components/public/public-top-bar.tsx` | **YENİ BİLEŞEN.** Logo (BrandIcon + marka adı, `/` bağı) + `PUBLIC_TOP_BAR_PATHS` sicili (AI Tezgâh / Fiyatlandırma / Kurumsal / Rehber) + `HomeAccountNav` (Giriş Yap / Ücretsiz Başla / Panele geç). `min-h-11` dokunma hedefi. `sticky` değil — sabit footer zaten var, ikinci sabit katman mobilde içeriği yer. |
| `app/(public)/layout.tsx` | `<PublicTopBar />` basar. Tek navigasyon kaynağı. |
| `app/(public)/page.tsx` | Kendi `<header>` bloğu **kaldırıldı** (26 satır) → çift header yok. `YETKIN_BRAND`/`BrandIcon`/`HomeAccountNav` importları temizlendi. |

**Kanıt:** `tests/ui/public-home-cta-surface.test.ts` — ana sayfada `<header` yok, `PublicTopBar` 4 bağı taşır, `(public)/layout` bileşeni basar. `tests/ui/treatment-surface.test.ts` — aynı sözleşme ayrıca doğrulanır.

### 2.3 Hız, CSS ve Stabilite

#### `M-02` — Ölü Akademi CSS'i ayıklandı

| Dosya | Değişiklik |
|---|---|
| `scripts/extract-academy-css.ts` | **YENİ TEK SEFERLİK ARAÇ.** Kuralları düzeyinde ayrıştırır (string/comment/yorum farkındalıklı, `@media`/`@supports` gövdelerini **yinelemeli** tarar). Academy olmayan alt kurallar canlı dosyada kalır; boşalan sarmalayıcı düşer. İdempotent (ikinci koşu no-op). |
| `app/styles/archived-academy.css` | **YENİ ARŞİV.** 136.3 KB — `academy-*` sınıf blokları, `[data-room="academy"]` ve 15 `@keyframes academy-*`. **Canlı ağaca import edilmez.** |
| `app/globals.css` | **151.1 KB / 6.703 satır → 17.6 KB / 720 satır.** `academy` eşleşmesi: 1.040 → **0**. |
| `app/styles/animations.css` | 15 ölü `@keyframes academy-*` bloğu arşive taşındı (5.7 → 3.4 KB). |

**Doğrulama — hiçbir canlı seçici kaybolmadı:**
- Kaynak `.bak` ile karşılaştırma: `bak selectors=785`, `live selectors=71`, `missing=714`, **`nonAcademy=0`** → taşınan her blok Akademi'ye aitti.
- Süslü parantez dengesi: `open=106 close=106`.
- Kritik seçici kontrolü: `html`, `body`, `::selection`, `.rail-glass`, `.room-scope`, `.custom-scrollbar`, `.nav-progress-root`, `.junior-digit-box`, `[data-junior-stage-canvas]`, `[data-room="career"|"devlabs"|"junior"|"dashboard"]`, `--radius-card`, `--safir` → **eksik yok**.
- `next build` başarılı; derlenen CSS 223.1 KB ham / **31.5 KB gzip** (Tailwind utility'leri + token'lar; kaynak katman toplamı 22.4 KB).

**Kanıt:** `tests/tezgah/workbench-split-surface.test.ts` — `globals.css` satır sayısı **< 1.200** (önceden < 6.800 idi), `academy` içermez, `archived-academy` import etmez, arşiv dosyası diskte durur; `animations.css` `academy` içermez, arşivde `@keyframes academy-intro-bloom` durur. `tests/ui/room-floor-surface.test.ts` — canlı katmanda `[data-room="academy"]` yok; arşiv aynı düz zemin sözleşmesini korur.

#### `M-04` / `S-02` — Env başlangıç doğrulaması

| Dosya | Değişiklik |
|---|---|
| `instrumentation.ts` | `getEnv()` **artık çağrılıyor**. Tasarım: (a) `lib/kernel/env.ts` şeması tüm anahtarları `optional()` tuttuğu için eksik değişken başlangıcı **düşürmez** — build kırılmaz; (b) şema ihlali (tip/format) `ops.env.invalid` **error** olarak loglanır; (c) üretimde `PAYTR_MERCHANT_ID/KEY/SALT` eksikse `ops.env.payments_unconfigured` **error**; (d) üretimde `PAYTR_SANDBOX` / `PAYTR_ALLOW_MOCK_CHECKOUT` doluysa `ops.env.payment_sandbox_in_production` **error** — çünkü `placeTezgahCheckout` bu durumda throw eder ve hata önceden ancak **ilk ödeme denemesinde** görülüyordu. `process.exit` / `throw` yok: ödeme dışı yüzeyler (kamu HTML, rehber, sözlük) ayakta kalır. DB importu yasağı (`@/lib/kernel/db`) korundu. |

**Kanıt:** `tests/ui/treatment-surface.test.ts` — `getEnv`, `ops.env.invalid`, `ops.env.payments_unconfigured` var; `process.exit` yok; `@/lib/kernel/db` yok. Mevcut `tests/kernel/wallet-ledger-surface.test.ts` / `performance-headers-surface.test.ts` / `runtime-readiness.test.ts` yeşil kaldı.

#### `P-01` — Kullanılmayan font izden çıkarıldı

| Dosya | Değişiklik |
|---|---|
| `next.config.ts` | `outputFileTracingIncludes` içinden `./node_modules/@digabi/noto-sans/WOFF/NotoSans-Regular.woff` **kaldırıldı**. Tek okuyucu `archived/lib/academy-studio/pdf-unicode-font.ts` (arşivde). Paket `serverExternalPackages` içinde **duruyor** — arşiv kodu geri alınırsa modül çözümü kırılmaz. `public/` paketi değişmedi (55.6 MB, eşik 850 MB). |

**Kanıt:** `tests/ui/treatment-surface.test.ts` — `NotoSans-Regular.woff` yok, `"@digabi/noto-sans"` serverExternalPackages'te var.

#### `S-03` — Yatay taşma

| Dosya | Değişiklik |
|---|---|
| `app/(public)/page.tsx` | İki kullanım: `w-screen … [margin-inline:calc(50%-50vw)]` → `w-full … rounded-[var(--radius-card)]` (+ ilkine `overflow-hidden`). Gerekçe: `100vw` dikey scrollbar genişliğini içerir → masaüstünde ~15-17 px taşma; `overflow-x-hidden` maskeliyordu ama `position: sticky` alt bileşenlerde ve iOS Safari'de kayma üretiyordu. `50%-50vw` (boşluksuz) bazı minifier'larda geçersiz CSS üretiyordu. |

**Kanıt:** `tests/ui/treatment-surface.test.ts` — `w-screen` ve `margin-inline:calc` yok.

#### `S-04` — Viewport, theme-color, manifest

| Dosya | Değişiklik |
|---|---|
| `app/layout.tsx` | **YENİ** `export const viewport: Viewport` — `width: "device-width"`, `initialScale: 1`, `viewportFit: "cover"`, `themeColor: "#eef2f7"` (zemin tokenı `--background` ile aynı), `colorScheme: "light"`. |
| `app/manifest.ts` | **YENİ DOSYA** → Next.js dosya kuralı `/manifest.webmanifest` üretir ve `<link rel="manifest">` basar. `display: "browser"` (bu bir iş aracıdır; `standalone` vaadi bugün karşılanmıyor, yalan vaat yazılmadı). `icons` yalnız gerçekten var olan `/icon.svg` + `/apple-icon.png` (180×180). |

**Kanıt:** `next build` çıktısında `○ /manifest.webmanifest` (statik prerender). `tests/ui/treatment-surface.test.ts` — viewport/themeColor/viewportFit var, manifest `MetadataRoute.Manifest` + iki ikon + `theme_color` taşır.

### 2.4 Teknik SEO ve AI Arama (GEO/AEO)

#### `SEO-01` — `Product` / `Offer` JSON-LD

| Dosya | Değişiklik |
|---|---|
| `lib/copy/json-ld.ts` | **YENİ** `pricingProductJsonLd(input)` → `Product` + `Offer` (`priceCurrency: "TRY"`, `availability: "https://schema.org/InStock"`, `seller: Organization`, aylık üründe `UnitPriceSpecification`). **Tutar `null` ise şemaya girmez** — fiyat uydurulmaz. **YENİ** `productsJsonLd({ name, path, items })` → `ItemList` + ürünler; hiç canlı ürün yoksa `[]`. |
| `app/(public)/fiyatlandirma/page.tsx` | `loadPublicPricingVitrine()` verisinden 3 ürün (Tezgâh Pro, E-Ticaret, Hibe Dosyası) + `BreadcrumbList` basar. `priceMajorOf()` `amountMinor`'u `"590.00"` biçimine çevirir (schema.org ondalık ister); `null` → ürün atlanır. **YetkinCV ve Kurumsal tutar taşımadığı için şemaya bilinçli olarak girmez.** |

**Kanıt:** `tests/ui/treatment-surface.test.ts` — 2 ürünlü girdide (biri `priceMajor: null`) çıktı 2 düğüm: `ItemList` (`numberOfItems: 1`) + `Product`; `offer.price = "590.00"`, `priceCurrency = "TRY"`, `availability` doğru. Tek `null` ürün → `[]`.

#### `SEO-02` — `llms.txt`

| Dosya | Değişiklik |
|---|---|
| `app/llms.txt/route.ts` | **YENİ ROTA.** `text/plain; charset=utf-8`. İçerik: değer önerisi → ne yapar (5 modül) → ürünler ve **güncel fiyatlar** (`loadPublicPricingVitrine()`, tutar yoksa "Hazırlanıyor") → 30 gün denemesi (SSOT'tan) → ana sayfalar → ilkeler (sahte veri yok, puan satın alınmaz, fiyat katalogdan). `force-dynamic` — bayat fiyat yayımlamamak için. `s-maxage=3600, stale-while-revalidate=86400`. |

**Kanıt:** `next build` çıktısında `ƒ /llms.txt`. `tests/ui/treatment-surface.test.ts` — vitrin yükleyicisi, `force-dynamic`, `text/plain; charset=utf-8`, `TEZGAH_PRO_DAILY_LIMIT`, kanonik köken bağlı.

#### `SEO-03` / `SEO-05` — Başlık, açıklama, sitemap önceliği

| Dosya | Önce | Sonra |
|---|---|---|
| `lib/copy/sen-voice/public.ts` (home title) | 74 char (+` · yetkin.ai` = 86) | **"İşini Büyüten Yapay Zeka Araçları"** = 35 (+12 = **47**) |
| `lib/copy/seo.ts` (contact title) | "İletişim ve destek" = 19 | **"İletişim — destek, kurumsal başvuru ve KVKK talepleri"** = 57 |
| `lib/copy/seo.ts` (legal title) | `LEGAL_PAGE_TITLE` = 28 | **"Yasal metinler — KVKK, mesafeli satış ve kullanım şartları"** = 59 |
| `lib/copy/seo.ts` (kurumsal desc) | 177 char | **152 char** (SERP ~155 sınırı) |
| `lib/copy/seo.ts` `sitemapRoutePolicy` | `/fiyatlandirma` → default **0.7** | **0.9** (satış sayfası, `/tezgah` ve `/career` bandında) |
| `lib/copy/seo.ts` `sitemapRoutePolicy` | `/legal` + `/legal/*` → **0.5** | **0.3** (uyum yüzeyi, keşif değil) |

`/iletisim` ve `/hakkimizda` **0.5'te korundu** (yasal bant onları yutmadı — ayrı dal). `LEGAL_PAGE_TITLE` H1 olarak değişmedi (sayfa başlığı sade kalır; meta zenginleşir).

**Kanıt:** `tests/ui/treatment-surface.test.ts` — fiyat 0.9, `/legal` ve `/legal/gizlilik` 0.3, `/iletisim` ve `/hakkimizda` 0.5. `tests/ui/brand-mark-surface.test.ts` — `${title} · yetkin.ai` ≤ 60 karakter.

---

## 3. Doğrulama Kapıları Sonuç Tablosu

### 3.1 Zorunlu kapılar

| Kapı | Komut | Sonuç | Çıktı |
|---|---|---|---|
| Tip denetimi | `npx tsc --noEmit` | ✅ **0 hata** | Çıktı yok, `EXIT=0` |
| Test paketi | `npx vitest run` | ✅ **366 dosya / 2011 test** | `Test Files 366 passed (366)` / `Tests 2011 passed (2011)`; `Errors 1` = bilinen zararsız vitest worker `onTaskUpdate` timeout'u (bkz. §3.2 notu) |
| Dil aksı mührü | `npm run verify:sen-axis` | ✅ **YEŞİL** (önce ❌ 2 ihlal) | `verify:sen-axis OK — 512 dosya, 34 siz kaçağı tarandı` |
| Sınır mührü | `npm run verify:boundaries` | ✅ | `verify:boundaries OK — kernel↛dikey, UI↛prisma/yazma motoru, …` |
| API ↔ auth haritası | `npm run verify:api-auth -- --check` | ✅ **132 rota** (değişmedi) | `{"session":73,"public":25,"closed":11,"cron":2,"admin":13,"webhook":8}` |
| RLS mührü | `npm run verify:rls-status` | ✅ **74 tablo** FORCE RLS | `verify:rls-status OK — Auth sync + e-posta senkronu + FORCE RLS + owner SELECT + kapsamsız deny` |
| Sır taraması | `npm run verify:no-secrets` | ✅ | `verify:no-secrets OK — PEM / service_role JWT / yasaklı .env.example ataması / git .env yok` |
| Public paket boyutu | `npm run verify:public-size` | ✅ **55.6 MB** (eşik 850 MB) | `public/ Vercel paketi: 55.6 MB (58339843 bayt)` |
| Üretim derlemesi | `npx next build` | ✅ | `✓ Compiled successfully in 25.3s`; `ƒ /llms.txt`, `○ /manifest.webmanifest` rotaları kayıtlı |

### 3.2 Test sayısı hareketi

| | Önce | Sonra | Fark |
|---|---:|---:|---:|
| Test dosyası | 365 | **366** | +1 (`tests/ui/treatment-surface.test.ts`) |
| Test sayısı | 1988 | **2011** | **+23** |

Yeni testler: `treatment-surface` (18), `quota` (+3), `auth-callback-redirects` (+1), ve mevcut testlerin yeni sözleşmeye güncellenmesi.

**Not:** İlk tam koşuda 12 test kırmızıydı; hepsi **bilinçli davranış değişikliğinin** eski sözleşmeyi donduran assert'leriydi (eski H1 dizgisi, eski `globals.css` satır aralığı, eski "Yüksek kota" metni, eski `copy.trialVerifyLabel` bağı, eski `/hibe` NBA'sı). Her biri **yeni sözleşmeyi** doğrulayacak şekilde güncellendi — hiçbir test "yeşil olsun diye" silinmedi veya gevşetilmedi.

**Bilinen zararsız hata (önceden vardı, bu tedaviyle ilgisiz):** Tam koşu `Errors 1` ve çıkış kodu `1` verir. Tek hata vitest'in kendi worker RPC katmanından gelir:

```
Unhandled Error
Error: [vitest-worker]: Timeout calling "onTaskUpdate"
 ❯ Object.onTimeoutError node_modules/vitest/dist/chunks/rpc.-pEldfrD.js:53:10
```

Bu, teşhis raporunda (§0) `npx vitest run` satırında **zaten kayıtlıydı**: "365 dosya / 1988 test geçti (1 zararsız vitest worker `onTaskUpdate` timeout uyarısı)". Hiçbir test düşmüyor, hiçbir assert başarısız olmuyor; hata test gövdesinden değil vitest'in worker iletişiminden doğuyor ve tam yük altında (366 dosya paralel) rastgele tetikleniyor. Tek tek çalıştırıldığında oluşmuyor. `Test Files 366 passed` / `Tests 2011 passed` satırları kesin sonuçtur.

### 3.3 `globals.css` yeni boyutu

| Metrik | Önce | Sonra | Değişim |
|---|---:|---:|---:|
| `app/globals.css` (ham) | 151.1 KB | **17.6 KB** | **−88.4 %** |
| `app/globals.css` (gzip) | 26.4 KB | **5.7 KB** | **−78.4 %** |
| `app/globals.css` (satır) | 6.703 | **720** | −89.3 % |
| `academy` kuralı (canlı) | 1.040 eşleşme | **0** | −100 % |
| **Canlı katman toplamı** (globals + tokens + animations) | 158.2 KB | **22.4 KB** | **−85.8 %** |
| **Canlı katman toplamı (gzip)** | 28.5 KB | **6.8 KB** | **−76.1 %** |
| **Canlı katman toplamı (brotli)** | 23.1 KB | **5.9 KB** | −74.5 % |
| `app/styles/archived-academy.css` | (yok) | 136.3 KB | canlı ağaca **import edilmez** |
| `@keyframes academy-*` (canlı) | 15 | **0** | arşive taşındı |

> **Hedef doğrulaması:** Rapor "~36 KB bandına düşür" diyordu. Sonuç **22.4 KB** — hedefin de altında. Fark, `animations.css` içindeki 15 ölü Akademi keyframe'inin de arşive taşınmasından geliyor.
>
> **Derlenmiş çıktı notu:** `next build` sonrası tek CSS paketi 223.1 KB ham / **31.5 KB gzip**. Bu, kaynak katman toplamından büyüktür çünkü Tailwind utility sınıflarını (`app`, `components`, `lib` içindeki tüm kullanılmış sınıflar) üretir. Kaynak katman sayısı raporun ölçtüğü metrittir; derlenmiş paket her zaman utility'leri içerir.

### 3.4 Diğer doğrulama

| Kontrol | Sonuç |
|---|---|
| CSS seçici kaybı (`nonAcademy`) | **0** — taşınan her blok Akademi'ye aitti |
| CSS parantez dengesi | `open=106 close=106` |
| Kritik seçici kontrolü | `--safir`, `--radius-card`, `[data-room="career"/"devlabs"/"junior"/"dashboard"]`, `[data-junior-stage-canvas]`, `.rail-glass`, `.nav-progress-root`, `.junior-digit-box` → **eksik yok** |
| `data-room` canlı eşleşmesi | 34 (akademi dışı tüm odalar korundu) |
| Redirect davranış matrisi | signup+default → `/tezgah?tool=proposal&ilk=1`; giriş → `/dashboard`; özel `next` → korunur; açık yön → güvenli hedef; recovery → `/sifre-yenile` |
| Yetim/ölü dosya | `app/globals.css.bak` ve `.tmp-*` çalışma dosyaları silindi |
| Arşiv import kontrolü | `archived-academy` hiçbir canlı dosyada import edilmiyor |

---

## 4. Sonraki Stratejik Faz İçin Notlar

### 4.1 Guest checkout (misafir Tezgâh Pro ödemesi)

**Bugünkü durum:** Kota duvarı iki yol sunar — (1) ücretsiz kayıt, (2) oturumluysa kredi/Pro satın alma. **Misafir ödeme yapamaz.**

**Teknik hazırlık durumu — altyapı büyük ölçüde hazır:**

| Gereken | Durum | Not |
|---|---|---|
| `placeTezgahCheckout` | ✅ Hazır | `userId` alıyor; misafir için `userId` üretimi gerekli. |
| `tezgahSubscription` tablosu | ✅ Hazır | `userId` unique; ödeme sonrası upsert yeterli. |
| PayTR iframe akışı | ✅ Hazır | `readPaytrIframeSrcFromCheckout` üç yüzeyde çalışıyor. |
| `fulfillTezgahOrder` | ✅ Hazır | `merchantOid` idempotent; `appliedMerchantOids` çift uygulamayı engelliyor. |
| Supabase kullanıcı açma | ⚠️ **Eksik** | Ödeme **sonrası** `signUp` + e-posta doğrulama akışı yazılmalı. Sıra kritik: para alınmadan hesap açılmamalı, hesap açılmadan para alınmamalı → **geçici `pending_checkout` kaydı** ile köprü kurulmalı. |
| `payment_orders.userId` | ⚠️ **Kısıt** | Şema `userId` nullable değil. Misafir ödeme için ya `userId` geçici olarak üretilir ya şema `nullable` + `guestEmail` kolonu alır. **İkincisi daha dürüst**: sahte `userId` üretmek RLS ve defter zincirini kirletir. |

**Önerilen sıra (migration gerektirir, bu yüzden bu fazda yapılmadı):**
1. `payment_orders` → `userId` nullable + `guestEmail` + `claimToken` (tek kullanımlık).
2. `/api/tezgah/checkout` → `auth: "public"` + misafir dalı (e-posta + VKN/TCKN + kart).
3. Webhook `CLEARED` → `fulfillTezgahOrder` ile abonelik yaz + `claimToken` üret + e-posta gönder.
4. `/claim/[token]` → şifre belirleme → hesap açılır, abonelik `userId`'ye bağlanır.

**Tahmini etki:** Rapordaki %30-50 tamamlama artışı; en yüksek niyetli noktada (kota duvarı) 4 adım → 1 adım.

**Dikkat:** `verify:rls-status` bu tabloya dokunur; migration sonrası mühür yeniden koşmalı. Defter (`appendLedgerEntry`) sahipsiz kayıt kabul etmez — `userId` bağlanana kadar defter kaydı **yazılmamalı**, `payment_orders.status` beklemede kalmalı.

### 4.2 Aylık kredi ekonomisi (günlük kota → aylık havuz)

**Bugünkü durum:** Günlük kota (misafir 3, üye 3, Pro 100). Kredi paketi (10 üretim) paralel hat olarak var.

**Mimari hazırlık — bu tedaviyle güçlendi:**

| Gereken | Durum | Not |
|---|---|---|
| `TezgahLane` ayrımı | ✅ `"free" \| "pro" \| "credit" \| "prepaid" \| "closed"` | `prepaid` dalı **zaten tanımlı ama kullanılmıyor** — aylık kredi için doğal yuva. |
| `tezgah_daily_quotas` | ✅ Hazır | `dateKey_subjectKey_poolKey` unique. `dateKey` → `monthKey` (ör. `2026-11`) çevirmek **mimari değişiklik değil**; `tezgahQuotaDateKey()` tek fonksiyonda. |
| Pro tavanı tek kaynakta | ✅ **Bu tedaviyle** | `TEZGAH_PRO_DAILY_LIMIT` → `TEZGAH_PRO_MONTHLY_CREDITS` olarak yeniden adlandırılır; fiyat tablosu ve kota rozeti aynı sabitten okumaya devam eder. |
| Kredi devri (%50) | ⚠️ Eksik | Ay geçişinde `remaining * 0.5` taşıma işi (Inngest cron) gerekli. `tezgahCreditBalance` sahipsiz `paidCommandReservation` ile çakışmamalı. |
| Kullanım ölçümü | ✅ **Bu tedaviyle** | `tezgah_first_output` + `tezgah_quota_wall` olayları artık var; kredi modelinin etkisi **ölçülebilir**. |

**Önerilen sıra:**
1. `tezgahQuotaDateKey()` → `tezgahQuotaPeriodKey(pool, now)` üretir; `lite` havuzu `monthKey` döner, `tetkik` `lifetime` kalır.
2. `TEZGAH_FREE_MONTHLY_CREDITS = 30`, `TEZGAH_PRO_MONTHLY_CREDITS = 500` (bugünkü 3 × 10 ve 100 × 5 mantığıyla kalibre edilir).
3. Kota satırı: "3 / 3 doldu" → **"27 kredin kaldı"** (baskı azalır, kullanım artar).
4. Devir cron'u: Inngest `tezgah.credit.rollover` — ayın 1'i 00:05 İstanbul.

**Dikkat:** Günlük → aylık geçişi **kullanıcı lehine tek yönlü** olmalı; geri alınabilir olmamalı. `tezgah_daily_quotas` tablosu adı tarihsel kalır (rename migration maliyeti RLS mührünü kırar); yorumla `periodKey` olduğu belirtilir.

**Tahmini etki:** Pro'nun faydası somut ölçülebilir hale gelir (500 vs 30 = 16.6×); B-02'nin kalıcı çözümü.

### 4.3 YetkinCV ücretli mühür/yayın modeli (B-01'in kalıcı çözümü)

**Bugünkü durum:** Sınav ücretsiz, puan ücretsiz, kamu kartı ücretsiz. `CATALOG_OPENABLE_UNITS`'tan çıkarıldı; satın alma rotası yok.

**Yeniden açma koşulu (kritik):** **Sıra tersine çevrilmemeli.** Bu tedavide satır, ödeme rotası olmadığı için kapatıldı. Geri açmak için önce rota yazılmalı:

1. **Önce** `/api/career/yetkincv/purchase` (`placeTezgahCheckout` deseni; `career/yetkincv-exam` birimi).
2. **Sonra** `fulfill` → `yetkinCvSeal.sealedPublication = true` (yeni kolon; mühür her zaman üretilir, **yayın** ücretlidir).
3. **Sonra** `CATALOG_OPENABLE_UNITS`'a satırı geri ekle.
4. **En son** `public-vitrine.ts` `yetkinCv` kartı: `honesty: "live"` + `amountMinor` katalogdan. `PUBLIC_FREE_EVALUATION_LABEL` yalnız **değerlendirme** aşamasını anlatmaya devam eder.

**Dürüstlük ilkesi korunur:** "Puan satın almadan değil test sonucundan oluşur" cümlesi bozulmaz — para **yayını** satın alır, puanı değil. `public-vitrine.ts:142-145` yorumu bu ayrımı zaten vurguluyor.

### 4.4 Tedavi sırasında ölçülen ek fırsatlar (bu fazda yapılmadı)

| Fırsat | Neden ertelendi | Not |
|---|---|---|
| `generate` rotalarına kullanıcı bazlı hız tavanı (S-01) | Sözleşme değişikliği (HTTP 429 davranışı); 7 rota × test güncellemesi | `HTTP_RATE_LIMITS.tezgahGenerateUser` (30/10dk) eklenmeli. Kenar `llmIp` CGNAT'ta adaletsiz. |
| `lib/academy/curricula` (~130 dosya) arşive | `tests/kernel/four-room-smoke.test.ts` ve seal manifesti okuyor; taşıma test zincirini yeniden yazmayı gerektirir | Build trace'ten düşürmek için değerli. Ayrı PR. |
| Yetim bileşenler (`quick-top-up-modal`, `visa-ledger`, …) | Test fixture olarak kullanılıyor; `tests/fixtures/` taşıması ayrı iş | Mimari borç, davranış değil. |
| `/tetkik/[hash]` soft-404 → `public-surface-gate` hash biçim kapısı | Kenar kapısı değişikliği; `proxy.ts` mühürleri etkilenir | `index: false` zaten var, SEO hasarı sınırlı. |
| Junior MP3 64 kbps transcode (1.578 MB → ~350 MB) | Medya hattı; `verify:junior-audio-cdn` mühür zinciri | En büyük tek hız kazancı ama ayrı operasyon. |
| `/durustluk` sayfası | Yeni sayfa = yeni rota + auth haritası + sitemap kaydı | §4.3 stratejik hamle; ayrı faz. |
| `P-02` `unoptimized` görseller | Her birinin gerekçesi kodda yazılı (bilinçli) | Davranış değişikliği gerekmiyor. |
| `P-03` `GrantEligibilityWidget` lazy | LCP öğesi değil; TBT kazancı ölçülmeli | Gerçek kullanıcı telemetrisi gerekli. |

### 4.5 İzleme — yeni olayların ilk 30 günü

Bu tedaviyle ilk kez **huni ölçümü** var. İlk 30 günde bakılacak oranlar:

| Oran | Nasıl hesaplanır | Hedef (sektör bandı) |
|---|---|---|
| Aktivasyon | `tezgah_first_output` / `sign_up` | > %40 (ilk oturumda üretim) |
| Duvar → kayıt | guest `tezgah_quota_wall` → `sign_up` | > %25 |
| Fiyat → ödeme | `checkout_start` / `pricing_view` | %8-15 |
| Duvar → ödeme (üye) | member `tezgah_quota_wall` → `purchase` | > %5 |
| Pro tavanına ulaşma | `tezgah_quota_wall` + `lane=pro` | < %5 (100 üretim/gün çok mu yüksek?) |

> **Not:** Pro tavanı %5'ten fazla kullanıcıyı duvara çarptırıyorsa `TEZGAH_PRO_DAILY_LIMIT` artırılmalı; %0'a yakınsa tavan gerçek bir fayda olarak algılanmıyor demektir ve kredi modeline (§4.2) geçiş hızlandırılmalı.

---

## 5. Kapanış

**Sağlık skoru: 68 → 85 / 100.**

Bu tedavi **17 bulguyu** kapattı. Kritik iki bulgu (B-01, B-02) ticari güveni doğrudan etkiliyordu: aylık 590 TL ödeyen kullanıcı artık "3 / 3 ücretsiz hak" görmüyor, katalogda satılamayan bir kalem operatöre açık değil.

**En büyük tek kazanç hız tarafında:** her sayfada inen **151 KB'lık CSS'in 115 KB'si** ölü arşiv koduydu; canlı katman **22.4 KB ham / 6.8 KB gzip**'e indi. Bu, LCP'ye dokunan tek gerçek mimari iyileştirmeydi.

**Kurulan üç yeni mühür** gelecekteki sızıntıları kapatıyor:
- `verify:sen-axis` kapsamı 24 → 34 kalıba çıktı; kelime sınırlı regex ile **yanlış alarma** düşmüyor; mühürlü hukuki metin **gizlenmeden** sicile yazıldı.
- `tests/ui/treatment-surface.test.ts` (18 test) tedavi kararlarını **dizgi dondurmadan** kilitledi — sabit kaynağı, yüzey bağı, şema tutumluluğu.
- Mevcut 12 test bilinçli davranış değişikliğine göre **yeni sözleşmeyi** doğrulayacak şekilde güncellendi; hiçbiri silinmedi.

**Değişmeyen taahhütler:** 132 API rotası auth haritalı, 74 tablo FORCE RLS, sır taraması temiz, kernel↛dikey sınırı korunuyor, `public/` paketi 55.6 MB. Anayasa A katmanı ve model kimliği dokunulmadı.
