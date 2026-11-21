# Tespit Raporu — Rehber / İş Akış Şeması ve E-Ticaret "İlk Ay Ücretsiz"

> **Denetim türü:** Yalnızca okuma ve tespit. Bu rapor dışında hiçbir ürün dosyası değiştirilmedi.
> **Tarih:** 21 Kasım 2026 · **Dal:** `main` @ `fd9f4853` (origin/main ile eşit, 0/0)
> **Kapsam:** `app/(public)/rehber`, `lib/rehber`, `components/rehber`, `tests/ui/rehber-workflow-surface.test.ts`, `lib/copy/guides.ts`, `app/(kernel)/magazam`, `lib/commerce`, `lib/pricing`, `prisma/`, `lib/copy/legal-launch.ts`
> **Kanıt tabanı:** kaynak kod + `vitest` + `tsc --noEmit` + `git` durumu + canlı `yetkin.ai` yanıtları.

---

## 0. Tek sayfalık cevap

| Soru | Cevap | Kanıt |
|---|---|---|
| `/rehber` bir iş akış / süreç şeması merkezi mi? | **Kodda evet, yayında hayır.** Çalışma ağacında tam bir "Görsel İş Akış ve Kurulum Merkezi" var; canlı site hâlâ eski makale sayfasını basıyor. | `app/(public)/rehber/page.tsx:1-120` (yeni) vs `git show HEAD:"app/(public)/rehber/page.tsx"` (eski) ve canlı `https://yetkin.ai/rehber` |
| Görsel şema gerçekten var mı? | **Kısmen.** Dikey zaman çizelgesi + numaralı kartlar + süre/girdi→çıktı/ipucu/buton var. **SVG diyagram, oklu akış grafiği, mermaid, modüller arası akış yok.** | `components/rehber/workflow-stepper.tsx:16-96`; `mermaid\|flowchart\|reactflow` araması → 0 eşleşme |
| Yayında mı, test düzeyinde mi? | **Test düzeyinde de değil — "commit edilmemiş kod" düzeyinde.** Test dosyası, veri, bileşen ve sayfa tamamen `git` dışında (`??`). | `git status --porcelain` → `?? lib/rehber/`, `?? components/rehber/`, `?? tests/ui/rehber-workflow-surface.test.ts` |
| E-Ticaret "ilk ay ücretsiz" kurgusu var mı? | **Altyapısı var, ürün yüzeyi yok.** 30 gün + 1 TL doğrulama + TRIALING durumu + kota + yenileme taraması kodda tam; ama hiçbir ekranda "ücretsiz deneme" yazmıyor. | `lib/commerce/subscription-lifecycle.ts:4-8`, `lib/commerce/subscription-checkout.ts:158-161`; `magazam.ts`/`public-vitrine.ts` içinde "deneme" 0 eşleşme |
| "İlk ay ücretsiz" ifadesi kodda geçiyor mu? | **Hiç geçmiyor.** Geçen tek ifade "30 gün ücretsiz deneme (1 TL kart doğrulama ile)" ve o da yalnız hukuk metninde. | `ilk ay ücretsiz\|first month free` → 0 eşleşme; `lib/copy/legal-launch.ts:96,99,353` |
| Kullanıcı bugün ne görüyor? | Fiyat sayfasında **₺1.490 / Ay**; lisans ekranında **"Aylık lisansı aç"** + **1.490,00 TL**. Deneme bilgisi yok. | `lib/pricing/public-vitrine.ts:140-152`, `components/commerce/license-checkout.tsx:76-108`, `lib/copy/sen-voice/magazam.ts:151-157` |

---

## 1. Yöntem ve sınırlar

1. Kod okuması: `app/(public)/rehber`, `lib/rehber`, `components/rehber`, `lib/commerce` (65 dosya), `lib/pricing`, `prisma/schema/commerce.prisma`, `prisma/migrations`.
2. Davranış doğrulaması: `npx vitest run tests/ui/rehber-workflow-surface.test.ts tests/commerce/subscription-lifecycle.test.ts tests/commerce/phase3.test.ts ...` → **62 test, hepsi geçti**.
3. Tip kapısı: `npx tsc --noEmit` → **0 hata**. `npx eslint` hedef dosyalarda → **0 uyarı**.
4. Yayın doğrulaması: canlı `yetkin.ai/rehber`, `/rehber?modul=hibe`, `/fiyatlandirma`, `/legal/mesafeli-satis`, `/e-ticaret` çekildi.
5. **Sınır:** Üretim ortamının anlık durumu canlı HTTP yanıtından ve `git` ağacından çıkarsandı; dağıtım bu okumadan sonra yapıldıysa A.5 ve B.5 maddeleri yeniden doğrulanmalıdır.

---

# BÖLÜM A — Rehber / İş Akış Şeması / Süreç Şeması

## A.1 Dosya envanteri (ne var?)

| Katman | Dosya | Durum | Ne yapıyor |
|---|---|---|---|
| Veri (SSOT) | `lib/rehber/workflows.ts` | **`??` commit dışı** | 4 modül × 3-4 adım; her adımda `order, title, duration, input, output, tip, href, cta` |
| Veri | `lib/rehber/progress.ts` | **`??` commit dışı** | Sunucu tarafı ilerleme okuması; hata fırlatmaz, yazmaz |
| Bileşen | `components/rehber/workflow-stepper.tsx` | **`??` commit dışı** | Adım kartları + dikey çizgi + modül sekmeleri |
| Sayfa | `app/(public)/rehber/page.tsx` | **`M` değiştirilmiş** | Yeni merkez (sekme + stepper + kısa yol + dürüstlük notu) |
| Alt sayfa | `app/(public)/rehber/[slug]/page.tsx` | **`M` değiştirilmiş** | 15 makale rehberi (bu kısım korunmuş) |
| İçerik | `lib/copy/guides.ts` | **temiz** | 15 kamuya açık rehber makalesi |
| Test | `tests/ui/rehber-workflow-surface.test.ts` | **`??` commit dışı** | 10 test: modül kümesi, adım bütünlüğü, sayfa/stepper kaynağı |

**Somut kanıt — adım modeli** (`lib/rehber/workflows.ts:16-31`):

```ts
export type WorkflowStep = {
  order: number;          // 1'den başlar, şeritte rozet
  title: string;
  duration: string;       // "≈ 3 dk"
  input: string;          // somut girdi
  output: string;         // somut çıktı
  tip: string;            // kritik ipucu / ön koşul
  href: Route;            // canlı ekran
  cta: string;
  emphasis?: "primary" | "outline";
};
```

**Dört modül** (`lib/rehber/workflows.ts:51-219`): `ecommerce` (4 adım), `hibe` (3), `tezgah` (3), `career` (3). Kapalı Akademi kasten dışarıda (`:47-50` yorumu, `:219` testi).

## A.2 Daha önce ne yapılmış? (zaman çizelgesi)

- `.system_docs`/README hattında `/rehber` önceden **"Ofiste yapay zekâyı Excel ve e-postada kullan"** başlıklı, `PUBLIC_SEN.guide` sabitinden beslenen **dört maddelik makale/dizin** sayfasıydı. Kanıt: `git show HEAD:"app/(public)/rehber/page.tsx"` → `PUBLIC_SEN.guide`, `guideArticleJsonLd`, `copy.steps.map`.
- Çalışma ağacında sayfa **makale dizininden çıkarıldı**: `guideArticleJsonLd`, `guide.sections`, `copy.steps.map` sayfadan silindi; yerine sekme + stepper geldi. Bu, testin de mühürlediği yön (`tests/ui/rehber-workflow-surface.test.ts:106-116`: `not.toContain("guide.sections")`, `not.toContain("guideArticleJsonLd")`).
- SEO kopyası da yeniden yazıldı: `lib/copy/seo.ts:79-84` → **"İş Akışı ve Kurulum Merkezi — adım adım süreç şeması"**. (HEAD'deki başlık hâlâ "Ofiste yapay zekâ rehberi: Excel ve e-posta".)
- Sayfa içi metin iddiası güçlü (`app/(public)/rehber/page.tsx:56`): *"...Makale değil, süreç şeması."*
- Bu değişiklikler **hiçbir commit'e girmedi**: `git log --oneline -- lib/rehber components/rehber "app/(public)/rehber"` yalnız üç eski commit döndürüyor; `lib/rehber/workflows.ts` HEAD'de **yok** (`fatal: path 'lib/rehber/workflows.ts' exists on disk, but not in 'HEAD'`).

## A.3 "Görsel şema" teknik gerçek

`components/rehber/workflow-stepper.tsx` ne basıyor:

| Öğe | Satır | Teknik gerçek |
|---|---|---|
| Adım kartı (`<li>` + `<article>`) | `:16-96` | HTML + Tailwind; veri sırası = görsel sıra |
| Dikey bağlantı çizgisi | `:31-36` | `absolute` bir `<span>`, `bg-gradient-to-b`; **ok ucu yok, sadece çizgi** |
| Adım numarası rozeti / tamamlandı tiki | `:38-49` | Yeşile döner, `IconCheck` |
| "Tamamlandı ✓" rozeti | `:59` | `Badge tone="emerald"` |
| Girdi → Çıktı bloğu | `:62-77` | `<dl>` iki sütun |
| Kritik ipucu | `:79-82` | Amber kutu |
| Aksiyon butonu | `:85-92` | `LinkButton` + `IconArrow` |
| Modül sekmeleri | `:169-212` | `<nav>` + `?modul=` sorgu + `aria-current`; **JS'siz çalışır** |

**Kritik ayrım:** Stepper'ın dosya başı yorumu *"adımlar arasında dikey akış çizgisi + ok bağı vardır"* diyor (`:7-11`). Gerçekte **adımlar arasında ok yok**; `IconArrow` yalnız CTA butonunun içinde (`:91`). Test de bunu `IconArrow` varlığıyla doğruluyor (`tests/ui/rehber-workflow-surface.test.ts:125`) — yani test "ok bağı"nı değil, "butonda ikon var"ı mühürlüyor.

**Yok olanlar (net tespit):**
- SVG/Canvas diyagram yok. `mermaid|flowchart|graph TD|reactflow|sankey` tüm repoda **0 eşleşme**.
- Modüller arası akış yok (`Tezgâh → E-Ticaret → Hibe → Kariyer` zinciri görselleştirilmemiş). Sekmeler birbirini besleyen bir akış değil, **birbirinin yerine geçen** dört sekme.
- Adım sayısı 4/3/3/3; "uçtan uca" iddiası ile E-Ticaret'in 4 adımı arasında süreklilik göstergesi (toplam süre, ilerleme yüzdesi) yok.

## A.4 Test katmanı neyi mühürlüyor?

`tests/ui/rehber-workflow-surface.test.ts` (10 test, **hepsi geçiyor**):

| Test | Satır | Mühürlediği |
|---|---|---|
| Dört modül, tekil kimlik, kapalı Akademi yok | `:17-35` | `WORKFLOW_MODULES` kimlikleri + `/e-ticaret /hibe /tezgah /career` hedefleri |
| Her adımda numara/süre/girdi/çıktı/ipucu/CTA | `:37-53` | İçerik bütünlüğü; `href` kök iç yol, `/academy` yasak |
| E-Ticaret 4 adımı ve butonları | `:55-68` | Adım başlıkları birebir; ilk iki adım `/e-ticaret` |
| Hibe NACE → eşleştirme → dosya | `:70-78` | Sıra + `KOSGEB` çıktısı |
| Tezgâh ücretsiz hak → paket → üretim | `:80-88` | 2. adım `/fiyatlandirma` |
| Kariyer test → rozet → `/vize/[id]` | `:90-96` | 3. adım `/pasaport` |
| Bilinmeyen modül ilk modüle düşer | `:98-104` | `parseWorkflowModuleId` |
| Sayfa makale değil stepper basar | `:106-116` | `WorkflowModuleTabs`, `WorkflowStepper`, `readWorkflowProgress` |
| Stepper gerçek şema basar | `:118-132` | `bg-gradient-to-b`, `last ? null`, `step.order`, `Tamamlandı ✓`, `?modul=`, `aria-current`, `use client` yok |
| İlerleme okuması güvenli | `:134-146` | `server-only`, `.catch(`, `completed: []`, yazma motoru import etmiyor |

**Testin kapsamadığı:** sayfanın gerçekten render edildiği (DOM/RTL yok — hepsi `readFileSync` kaynak metni), yayında olup olmadığı, `progress.ts` eşiklerinin doğruluğu, adımların gerçekten tamamlanabilirliği.

## A.5 Yayında mı? — Hayır (kanıtlı)

1. **Canlı sayfa eski sürümü basıyor.** `https://yetkin.ai/rehber` yanıtı: başlık *"Ofiste yapay zekâyı Excel ve e-postada kullan"*, `## Dört adım`, 4 madde, `Rehber soruları`. Yeni sürümün ayırt edici metni olan *"Hangi modülü kuruyorsun? Adım adım gör."* ve *"Makale değil, süreç şeması."* **canlı yanıtta yok**.
2. **`?modul=hibe` de aynı eski sayfayı döndürüyor** → yeni sunucu tarafı sekme çözümü (`searchParams`) yayında değil.
3. **`git`:** `origin/main` ağacında `lib/rehber/` ve `components/rehber/` **hiç yok** (`git ls-tree -r origin/main` yalnız `app/(public)/rehber/page.tsx` + `[slug]/page.tsx` döndürüyor).
4. **Yerel build yeni kodu içeriyor:** `.next` içindeki 2068 JS dosyasında `"Makale değil, süreç şeması"` **1 kez** bulundu. Yani kod derlenebilir durumda, sadece **dağıtılmamış**.

**Sonuç:** İş **"tamamlandı ama yayınlanmadı"** durumunda. Yayına alınana kadar kullanıcı, modül bazlı adım akışını **görmüyor**; eski dört maddelik makaleyi görüyor.

## A.6 Rehber tarafındaki eksikler ve riskler

| # | Ağırlık | Bulgu | Kanıt |
|---|---|---|---|
| A-1 | **Kritik** | Tüm yeni katman commit dışı; `main`'e girmezse ilk `checkout`/`reset`'te kaybolur. | `git status` → `?? lib/rehber/`, `?? components/rehber/`, `?? tests/ui/rehber-workflow-surface.test.ts` |
| A-2 | **Kritik** | "Görsel süreç şeması" iddiası diyagram içermiyor: adımlar arası ok, modüller arası akış, SVG yok. | `workflow-stepper.tsx:31-36` (yalnız çizgi); mermaid/reactflow araması 0 |
| A-3 | **Yüksek** | E-Ticaret 1. adım vaadi (`"30 günlük ücretsiz denemeyi başlat"`, `href: "/e-ticaret"`) korumalı rotaya gidiyor: oturumsuz ziyaretçi `auth-307 → /login`. | `workflows.ts:61-67`; `lib/kernel/security/edge-guard.ts:42-53` (`/e-ticaret` korumalı), `:321-327` |
| A-4 | **Yüksek** | İlerleme rozeti gerçek adım tamamlamayı ölçmüyor: yalnız 1 ve 2 işaretleniyor, 3-4 **hiçbir koşulda** işaretlenemiyor. "Tamamlandı" yanıltıcı. | `lib/rehber/progress.ts:69-73, 76-85, 86-92` |
| A-5 | Orta | `lib/copy/sen-voice/public.ts:173-188` içindeki `guide` bloğu artık **hiçbir yerden okunmuyor** (ölü kopya). | `PUBLIC_SEN.guide` araması → yalnız tanım satırı |
| A-6 | Orta | `PublicGuide` tipindeki `examHref`/`examLabel` 15 rehberde dolu ama **hiç render edilmiyor** (30 ölü alan). | `lib/copy/guides.ts:24-25`; `/rehber/[slug]` yalnız `toolHref` basıyor (`app/(public)/rehber/[slug]/page.tsx:98-102`) |
| A-7 | Orta | `/rehber` sayfasında `revalidate`/cache yok; `readWorkflowProgress` oturum çerezine dokunduğu için sayfa tamamen dinamik. SEO'ya açık bir "merkez" sayfası için TTFB maliyeti. | `app/(public)/rehber/page.tsx` (revalidate yok), `lib/kernel/auth/require-session.ts:264` |

---

# BÖLÜM B — E-Ticaret "İlk Ay Ücretsiz"

## B.1 Bugün kullanıcı nasıl karşılanıyor?

**Fiyat sayfası** (`https://yetkin.ai/fiyatlandirma`, canlı):

> COMMERCE · Açık · **E-Ticaret İşletme Lisansı** — Trendyol, Hepsiburada, Amazon ve N11 tek panelden stok ve sipariş… · **₺1.490 / Ay** · *Aylık* · **"E-Ticaret Paketini Aç →"**

Deneme, ücretsiz ay, hoş geldin teklifi: **yok**. Kaynak: `lib/pricing/public-vitrine.ts:140-152` (kart metni), `app/(public)/fiyatlandirma/page.tsx:228-230` (CTA).

**Lisans ekranı** (`/magazam/{storeId}/lisans`):

| Öğe | Metin | Kanıt |
|---|---|---|
| Başlık | "Lisans" | `lib/copy/sen-voice/magazam.ts:151` |
| Açıklama | "Aylık tutar katalogdadır. Pazaryeri cirosu bu akışa girmez." | `:152` |
| Tutar satırı | `Aylık tutar: 1.490,00 TL` | `components/commerce/license-checkout.tsx:76-80` |
| Birincil buton | **"Aylık lisansı aç"** / açıkken **"Bir ay uzat"** | `magazam.ts:156-157`; `license-checkout.tsx:101-103` |
| İptal | "Aboneliği İptal Et" | `magazam.ts:158`; `license-checkout.tsx:110-131` |

**Kokpit şeridi** (`/e-ticaret`): *"Çok Kanallı E-Ticaret Lisansı: 1.490,00 TL / Ay (…)"* + **"Lisansı Aktifleştir →"**. Deneme yok. Kaynak: `components/commerce/os-cockpit.tsx:80-146`.

**Tek yerde "deneme" var:** hukuk metni. `lib/copy/legal-launch.ts:99`:
> "E-Ticaret İşletme Lisansı, **30 gün ücretsiz deneme (1 TL kart doğrulama ile)** ardından otomatik yenilenen aylık aboneliktir; mağaza panelinden tek tıkla dönem sonu iptal edilebilir."

Aynı cümle `:96` ve `:353`'te de var; `tests/kernel/legal-launch-surface.test.ts:102,232` bunu mühürlüyor. **Ama canlı `/legal/mesafeli-satis` bu cümleyi basmıyor** — canlı metin hâlâ HEAD sürümünü, yani "aylık dijital abonelik; stok, kanal ve sipariş kokpiti" diyor. Yani hukuk metni ile ürün aynı sürümde değil.

## B.2 Altyapı var mı? — Evet, tam ve çalışır

| Parça | Dosya:satır | Ne yapıyor |
|---|---|---|
| Süre sabiti | `lib/commerce/subscription-lifecycle.ts:4` | `COMMERCE_TRIAL_PERIOD_MS = 30 gün` |
| Doğrulama tutarı | `:6` | `COMMERCE_TRIAL_VERIFY_MINOR = 100` (1,00 TL) |
| Deneme kotası | `:7-8` | 250 müşteri sorusu / 100 optimizasyon |
| Deneme anahtarı | `:28-39` | VKN (10) veya TCKN (11) — **vergi kimliği başına 1 deneme** |
| Pencere | `:41-44` | `trialEndsAt = now + 30 gün`, `currentPeriodEnd = trialEndsAt` |
| Karar motoru | `:80-110` | `TRIALING` biterse `charge(listPriceMinor)`; kart yoksa `past_due` |
| Dunning | `:9-11, 157-168` | 24 saatte bir, en fazla 3 deneme, 3 gün esneklik |
| Sipariş kararı | `lib/commerce/subscription-checkout.ts:158-161` | Koltuk boşsa + kimlik tüketilmemişse tutar **100**, değilse **katalog** |
| Deneme rezervasyonu | `:268-281` | `commerceTrialConsumption.create` — unique ihlali = "bu kimlik denedi" |
| Kart saklama bayrağı | `:232, 239` | Sepet adı "Yetkin Commerce kart doğrulama", `storeCard: true` |
| Doldurma | `lib/commerce/paytr-license-bridge.ts:67-128` | `status: "TRIALING"`, `trialEndsAt`, `trialPending:false`, log `commerce.license.trial_started` |
| Trial dalı | `:168-169` | `existing.trialPending && amount === 100` → trial fulfillment |
| Kota tüketimi | `lib/commerce/subscription-fair-use.ts:20-53` | `TRIALING` satırda atomik `updateMany ... lt limit` |
| Kota bağlantısı | `lib/commerce/os-service.ts:484` | `suggestReply` → `consumeCommerceTrialQuota(storeId, "question")` |
| Şema | `prisma/schema/commerce.prisma:48-54, 295-307, 319-330` | `TRIALING/PAST_DUE/CANCELED` enum; `trial_*` kolonları; `CommerceTrialConsumption` |
| Migrasyon | `prisma/migrations/20261121013000_p0_finance_subscription_seals/migration.sql:14-84` | Enum değerleri, 8 kolon, 3 CHECK, `commerce_trial_consumptions` + RLS |
| Yenileme işi | `lib/kernel/jobs/inngest.ts:490-503, 533` | Cron `15 4 * * *`, `commerceSubscriptionRenewal` |
| Test | `tests/commerce/subscription-lifecycle.test.ts:21-34` | 30 gün, 1 TL, 250/100 kota |

**Hazırlık: altyapı %90, ürün yüzeyi %0.** Aşağıdaki delikler kapatılmadan "ilk ay ücretsiz" **satılabilir bir vaat değil**.

## B.3 Uçtan uca gerçek akış (kodun yaptığı)

```
Kullanıcı /magazam/{id}/lisans → "Aylık lisansı aç" (1.490,00 TL yazıyor)
  ↓ POST /api/commerce/stores/{id}/subscription          (route: consent + idempotency + rate limit)
  ↓ placeCommerceSubscriptionOrder                       (subscription-checkout.ts)
      store sahibi mi?  → katalog tutarı var mı? → fatura künyesi var mı?
      koltuk boş mu (ACTIVE/TRIALING/PAST_DUE değil)?
      reserveCommerceTrial(VKN|TCKN)  → unique insert başarılıysa trial = true
      amountMinor = 100                ← kullanıcı 1.490,00 TL yazısını görürken 1,00 TL çekilir
      rememberQuote(..., trialPending: true)
      PayTR iframe: store_card=1, sepet "Yetkin Commerce kart doğrulama"
  ↓ PayTR webhook success
      clearSuccessfulPaymentOrder → ledger CREDIT 100 "Cüzdan yükleme"
      rememberCommercePaytrCardTokens → paytr_utoken/paytr_ctoken yazılır
      notifyCommerceLicenseHook → fulfillCommerceTrial
          ledger DEBIT 100 "Commerce deneme kart doğrulama"
          status = TRIALING, trialEndsAt = now + 30 gün
  ↓ 30 gün sonra (Inngest 04:15)
      decideCommerceRenewal → charge(listPriceMinor = 1.490,00 TL)
      chargeStoredPaytrCard(non_3d=1, userIp="127.0.0.1")
```

## B.4 Parasal gerçek: 1 TL nereye gidiyor?

Bu, kopya ile kodun **ayrıştığı** yerdir.

1. PayTR 1,00 TL'yi kartdan tahsil eder (`paytr/checkout.ts:639-641` `store_card=1`).
2. Webhook CLEARED olunca cüzdana **CREDIT 100 kuruş** yazılır (`lib/kernel/payments/clearing.ts:113-121`, etiket "Cüzdan yükleme").
3. Hemen ardından trial fulfillment **DEBIT 100 kuruş** yazar (`lib/commerce/paytr-license-bridge.ts:76-84`, etiket "Commerce deneme kart doğrulama").
4. **Net sonuç: cüzdan 0, para satıcıda kalır.**

Yani "1 TL iade edilir" iddiası ile kod uyuşmuyor:
- Rehber metni: *"Kart bilgisi (1 TL doğrulama provizyonu, **iade edilir**)"*, *"1 TL provizyon **çekim değildir**; doğrulama sonrası iade edilir."* → `lib/rehber/workflows.ts:63, 65`
- Kodda bu sipariş için **hiçbir iade çağrısı yok**: `requestPaytrRefund` yalnız cüzdan iadesi, akademi eksik lisans ve lisans-gap akışlarında kullanılıyor; commerce için çağrı **0**.
- Üstelik self-servis kart iadesi bu niyeti **kasten engelliyor**: `isActivatedProductRefundBlocked` → `COMMERCE_LICENSE` → `true` (`lib/kernel/payments/order-purpose.ts:41-44`).

**Karar gerekiyor:** ya "1 TL iade edilir" cümlesi düzeltilmeli ("1 TL doğrulama bedelidir, bakiyeye yazılıp aynı anda doğrulama olarak düşülür" gibi), ya da 100 kuruşu karta geri gönderen bir iade yolu yazılmalı. Bugünkü hâliyle **tüketici hukuku açısından savunmasız** bir metin.

## B.5 Deneme kurgusundaki delikler

| # | Ağırlık | Bulgu | Kanıt |
|---|---|---|---|
| B-1 | **Kritik** | **Kullanıcı denemeyi hiçbir yerde göremiyor.** Fiyat sayfası, kokpit şeridi ve lisans ekranı "1.490 TL / Aylık lisansı aç" diyor; "30 gün ücretsiz" metni yalnız hukuk dosyasında ve o da yayında değil. | `public-vitrine.ts:140-152`; `os-cockpit.tsx:110-125`; `magazam.ts:151-157`; canlı `/fiyatlandirma` |
| B-2 | **Kritik** | **Ekranda yazan tutar ile çekilen tutar farklı.** Lisans sayfası katalog tutarını (1.490,00 TL) basıyor; ilk ödeme gerçekte 1,00 TL. Kullanıcı sürpriz bir "1 TL" görürse güven kaybı; görmüyorsa 1.490 TL'lik onay vermiş olur. | `license-checkout.tsx:52-60` (`amountLabel` = katalog) vs `subscription-checkout.ts:161` |
| B-3 | **Yüksek** | **Bireysel faturada TCKN opsiyonel.** TCKN boşsa `commerceMerchantTrialKey` `null` döner → deneme açılmaz → **tam fiyat** çekilir. Aynı kullanıcı TCKN yazsaydı 1 TL ödeyecekti. | `lib/kernel/identity/billing-info.ts:210-226` (tckn opsiyonel) + `subscription-lifecycle.ts:28-39` |
| B-4 | **Yüksek** | **Deneme rezervasyonu sızıyor.** `commerceTrialConsumption` satırı PayTR penceresi açılmadan/başarısız olmadan önce yazılıyor; hata yolunda **silinmiyor**. Kullanıcı ödeme penceresini kapatırsa hakkını kaybeder, tekrar denemede tam fiyat görür. | `subscription-checkout.ts:268-281` (insert) + `:241-263` (hata yolları, geri alma yok); repoda `delete`/cleanup yok |
| B-5 | **Yüksek** | **Erken dönüşüm deneme günlerini yakar.** `TRIALING` kullanıcı "Bir ay uzat"a basarsa yeni dönem **bugünden** başlar; kalan deneme günleri iptal olur. | `paytr-license-bridge.ts:205` (`existing?.status === "ACTIVE" ? expiresAt : null`) + `subscription.ts:62-67` |
| B-6 | **Yüksek** | **Yenileme çekimi üretimde düşebilir.** Kayıtlı kart çekiminde `userIp` sabit `"127.0.0.1"` ve `non_3d: "1"`. PayTR gerçek kullanıcı IP'si/3DS bekliyorsa 30. gün çekimi başarısız → `PAST_DUE` → 3 denemede iptal. | `subscription-renewal.ts:55-65`; `paytr-stored-card.ts:66-75` |
| B-7 | Orta | `optimization` kotası **ölü sabit**: 100 limit tanımlı, şema kolonu var, ama hiçbir çağrı `"optimization"` göndermiyor. Ürün kartı üretimi Tezgâh misafir kotasına gidiyor. | `subscription-fair-use.ts:9-13`; tek çağrı `os-service.ts:484` (`"question"`) |
| B-8 | Orta | **Lisans kapısı sunucuda yok.** Kanal kimliği kaydetme (`action:"channel"`) lisans kontrolü yapmıyor; kapı yalnız arayüzde (`license.gate && needsKey`). Giden senkron gerçekten kapılı, kimlik yazımı değil. | `lib/commerce/os-handlers.ts:77-80`, `os-service.ts:323-386` (lisans yok) vs `os-cockpit.tsx:278-284` (UI) ve `trendyol-sync.ts:193-197` (gerçek kapı) |
| B-9 | Orta | Kullanıcı `TRIALING` mi `ACTIVE` mi ayırt edemiyor: ikisi de "Lisans açık" basılıyor; kalan gün sayacı yok. | `magazam/[storeId]/lisans/page.tsx:38-45`; `cockpit-load.ts:338-345` |
| B-10 | Orta | Migrasyon **commit dışı** (`?? prisma/migrations/20261121013000_…`); `prisma/schema/commerce.prisma` de `M`. Şema ile üretim DB'si arasında sürüm kayması riski. | `git status` → `M prisma/schema/commerce.prisma`, `?? …p0_finance_subscription_seals/migration.sql` |
| B-11 | Düşük | Deneme testi yalnız **sabitleri** doğruluyor; `placeCommerceSubscriptionOrder`/`fulfillCommerceTrial` için uçtan uca test yok. | `tests/commerce/subscription-lifecycle.test.ts:21-34`; `reserveCommerceTrial` araması → testte 0 |

---

# BÖLÜM C — İki konunun kesişimi (en tehlikeli nokta)

Rehber, E-Ticaret'i şöyle anlatıyor:

> **1. "30 günlük ücretsiz denemeyi başlat"** · ≈3 dk · Girdi: *"Kart bilgisi (1 TL doğrulama provizyonu, iade edilir)"* · Çıktı: *"Aktif E-Ticaret İşletme OS aboneliği ve panel erişimi"* · Buton: **"Denemeyi başlat" → `/e-ticaret`**
> — `lib/rehber/workflows.ts:59-68`

Ürünün gerçekliği:

| Rehber ne diyor | Kod ne yapıyor | Fark |
|---|---|---|
| "Denemeyi başlat" butonu | `/e-ticaret` **korumalı**; oturumsuz → `/login` | Rehberden deneme başlatılamaz (`edge-guard.ts:42-53, 321-327`) |
| "1 TL iade edilir" | 1 TL tahsil → cüzdana CREDIT → aynı anda DEBIT; iade yolu yok | Metin yanlış (`clearing.ts:113-121` + `paytr-license-bridge.ts:76-84`) |
| "≈ 3 dk'da aktif abonelik" | Mağaza + fatura künyesi + PayTR iframe + webhook onayı gerekiyor | 3 dakika iyimser; künye yoksa akış durur (`subscription-checkout.ts:146-148`) |
| (hiç yazmıyor) | Deneme yalnız VKN/TCKN varsa açılıyor | Bireysel + TCKN boş → tam fiyat (B-3) |
| (hiç yazmıyor) | Deneme 250 soru / 100 optimizasyon ile sınırlı | Kotadan haber yok (B-7, B-9) |

Yani rehber yayına alındığı anda **ürünün önüne geçen bir vaat** basacak: kullanıcı "ücretsiz deneme" okuyup 1.490 TL'lik lisans ekranına düşecek. Bu ikisi **aynı sürümde** yayına girerse itibar riski yüksek.

---

# D. CEO Özeti — "Ne var, ne yok, ne kadar hazır?"

### Rehber / İş Akış Şeması

**Var:** Dört modülün (E-Ticaret, Hibe, Tezgâh, Kariyer) adım adım kurulum akışı yazılmış. Her adımda süre, somut girdi→çıktı, kritik ipucu ve gerçek ekrana giden buton var. Sekmeler JavaScript'siz çalışıyor, oturum açmış kullanıcıya ilerleme rozeti basıyor. 10 test ve tip kontrolü temiz. **Bu, metin/test düzeyinde kalmadı — çalışan bir sayfa olarak yazıldı.**

**Yok:** (1) **Yayında değil.** Canlı site hâlâ eski "Excel ve e-posta" makalesini gösteriyor; yeni kod `git`'e bile girmemiş (commit dışı). (2) Görsel **diyagram** yok: adımlar arasında çizgi var, ok yok; modüller arası akış yok; SVG/mermaid yok. Yani "süreç şeması" bugün **dikey zaman çizelgesi**, akış grafiği değil. (3) İlerleme rozeti gerçek tamamlanmayı ölçmüyor — yalnız ilk iki adım işaretlenebiliyor.

**Hazırlık: %75.** Yazılım tarafı bitmiş sayılır; eksik olan (a) commit + deploy, (b) gerçek görsel akış (oklar/modüller arası), (c) 1. ve 2. adım rozetlerinin gerçek veriye bağlanması. Yayına almak **1 günlük iş**; "görsel şema" iddiasını karşılamak **2-3 günlük ek iş**.

### E-Ticaret "İlk Ay Ücretsiz"

**Var:** Arka uç tam. 30 gün, 1 TL doğrulama, `TRIALING` durumu, 250 soru kotası, 3 günlük esneklik, 3 denemeli dunning, vergi kimliği başına tek deneme, otomatik aylık yenileme, iptal (dönem sonu), şema + migrasyon + Inngest işi + testler. Bu, "kurgu" değil **çalışan bir abonelik motoru**.

**Yok:** **Ürün yüzeyi sıfır.** Hiçbir ekranda "ücretsiz deneme" yazmıyor. Fiyat sayfası ₺1.490/Ay diyor, lisans ekranı "Aylık lisansı aç — 1.490,00 TL" diyor, kokpit "Lisansı Aktifleştir" diyor. Kullanıcı 1 TL ödeyeceğini **hiçbir yerde** görmüyor. "İlk ay ücretsiz" ifadesi kodda hiç geçmiyor; tek iz hukuk metninde ("30 gün ücretsiz deneme, 1 TL kart doğrulama") ve o metin de **canlı sitede yayınlanmamış**.

**Ayrıca düzeltilmesi gereken 3 maddi hata:** (1) "1 TL iade edilir" yazıyor ama kod o parayı cüzdana yazıp aynı anda doğrulama olarak düşüyor — iade yolu yok. (2) Bireysel faturada TCKN boş bırakılırsa deneme hiç açılmıyor, tam fiyat çekiliyor. (3) Ödeme penceresi yarıda kapatılırsa deneme hakkı yanıyor (rezervasyon geri alınmıyor). Yenileme çekiminde sabit `127.0.0.1` IP ve 3DS'siz çekim de 30. günü riske atıyor.

**Hazırlık: %55.** Motor hazır, vitrin yok. "İlk ay ücretsiz"i gerçekten satmak için: fiyat kartı + lisans ekranı + kokpit şeridine deneme metni ve kalan gün, 1 TL'nin akıbetinin netleştirilmesi, TCKN boş senaryosunun karara bağlanması, rezervasyon geri alma, yenileme IP/3DS düzeltmesi → **2-4 gün**. Bunlar yapılmadan yayına alınırsa müşteri 1.490 TL'lik ekranda 1 TL öder; bu, hukuken de ticari olarak da savunulamaz.

### Tek cümle

> Rehber'in görsel iş akışı **yazıldı ama yayınlanmadı**; E-Ticaret'in ücretsiz ay motoru **yazıldı ama müşteriye hiç gösterilmedi** — ve ikisi aynı anda yayına girerse rehber, ürünün tutmadığı bir vaadi ("1 TL iade edilir, 3 dakikada ücretsiz deneme") duyurmuş olacak. **Önce yüzeyi yaz, sonra ikisini birlikte yayına al.**

---

## Ek — Doğrulama komutları

```bash
npx tsc --noEmit                                                            # 0 hata
npx eslint components/rehber/workflow-stepper.tsx lib/rehber/*.ts \
  "app/(public)/rehber/page.tsx" lib/commerce/subscription-*.ts             # 0 uyarı
npx vitest run tests/ui/rehber-workflow-surface.test.ts \
  tests/commerce/subscription-lifecycle.test.ts \
  tests/commerce/phase3.test.ts tests/ui/public-home-cta-surface.test.ts \
  tests/copy/seo-surface.test.ts tests/kernel/admin-ops-desk.test.ts \
  tests/ui/home-resources-surface.test.ts tests/commerce/cockpit-surface.test.ts
                                                                            # 62 test geçti
git log --oneline -- lib/rehber components/rehber                          # commit yok
git ls-tree -r --name-only origin/main | rg "lib/rehber|components/rehber"  # boş
```
