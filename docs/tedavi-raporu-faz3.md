# yetkin.ai — Tedavi Raporu (FAZ 3)

> **Kapsam:** `docs/tespit-raporu-rehber-eticaret.md` bulguları — **A (Rehber / Görsel İş Akış
> ve Süreç Şeması)** ve **B (E-Ticaret "İlk Ay Ücretsiz / 30 Gün Ücretsiz Deneme")**.
> **Dayanak:** Hiçbir tutar, kota veya model kimliği belgeden kopyalanmadı; her değer koddan
> okundu (`COMMERCE_TRIAL_VERIFY_MINOR`, `PriceCatalogEntry.amountMinor`, `TEZGAH_GUEST_DAILY_LIMIT`).
> **Tarih:** 21 Kasım 2026 · **Commit:** `13141731` (`main`, origin/main ile eşit)
> **Durum:** ✅ Tüm doğrulama kapıları 0 hata. Supabase 70/70 migrasyon. Vercel üretim yayını canlı.

---

## 0. Yönetici Özeti

| Doğrulama | Faz 2 sonu | **Faz 3 sonu** |
|---|---|---|
| `npx tsc --noEmit` | 0 hata | ✅ **0 hata** |
| `npx eslint .` | 0 error, 0 warning | ✅ **0 error, 0 warning** |
| `npx vitest run` | 1.969 / 853 dosya | ✅ **1.985 / 365 dosya** (+16 test) |
| `verify:api-auth --check` | 132 route | ✅ **132 route, sapma yok** |
| `verify:no-secrets` | OK | ✅ **OK** |
| `verify:boundaries` | OK | ✅ **OK** |
| `verify:rls-status` | OK | ✅ **OK** (70 tablo, `commerce_trial_consumptions` dahil) |
| `npx prisma migrate status` | 2 bekleyen migrasyon | ✅ **70/70 — "Database schema is up to date!"** |
| `npx next build` | exit 0 | ✅ **exit 0** |
| Canlı `/rehber` | eski makale | ✅ **yeni iş akışı merkezi (doğrulandı)** |
| Canlı `/fiyatlandirma` | deneme metni yok | ✅ **"İlk 30 Gün Ücretsiz" kartı (doğrulandı)** |

**Kapanan iki kritik açık:** (1) Rehber artık gerçek görsel akış şeması basıyor ve **yayında**;
(2) E-Ticaret denemesi müşteriye **görünüyor**, ekranda yazan tutar ile çekilen tutar **aynı**.

**Kapanan üç maddi hata:** "1 TL iade edilir" yalanı düzeltildi; terk edilen ödeme penceresi artık
deneme hakkı yakmıyor; bireysel faturada TCKN boşsa sunucu sessizce tam fiyat çekmiyor.

---

## 1. E-Ticaret "İlk 30 Gün Ücretsiz" Ürün Yüzeyi

### 1.1 Vitrin ve ekran metinleri

| Dosya | Değişiklik |
|---|---|
| `lib/pricing/public-vitrine.ts` | `PublicVitrineItem.trial` alanı: **başlık + doğrulama tutarı + yenileme tutarı + iptal satırı**. E-Ticaret satırları "İlk 30 gün ücretsiz (1 TL kart doğrulama)" ile başlar. Tutarlar koddan: doğrulama `COMMERCE_TRIAL_VERIFY_MINOR`, yenileme `commerceEntry.amountMinor`. Satır yoksa `renewalLabel` null — uydurma fiyat basılmaz. |
| `app/(public)/fiyatlandirma/page.tsx` | Kart üstünde `data-vitrine-trial-headline` rozeti, doğrulama tutarı ve yenileme satırı; CTA **"30 Gün Ücretsiz Başlat (1 TL Doğrulama)"**. Korumalı hedef `vitrineHref()` → `buildCitizenRegisterHref`. Dürüstlük notu deneme kurallarıyla genişletildi. |
| `components/commerce/os-cockpit.tsx` | Lisans şeridi `TRIALING` ayrımı: `data-license-band-trial`; **"Ücretsiz Deneme Aktif — Kalan X Gün"** (amber ton). Kapalı ve deneme hakkı açıkken **"30 Gün Ücretsiz Başlat →"**, altında 1,00 TL doğrulama ve iptal satırı. |
| `components/commerce/license-checkout.tsx` | `data-license-trial-offer` bloğu: **çekilecek gerçek tutar** (`data-license-trial-amount`, `₺1,00`) ve **30 gün sonra aylık yenileme** yan yana. Buton metni dürüst: `30 Gün Ücretsiz Başlat (1 TL Doğrulama)`. `TRIALING` → `data-license-trial-state` ile kalan gün. Deneme kapalıysa `data-license-trial-blocked` gerekçesi (VKN/TCKN eksik / hak tüketildi / açık pencere). |
| `lib/copy/sen-voice/magazam.ts` | `trialBadge`, `trialTitle`, `trialBody`, `trialVerifyLabel`, `trialRenewalLabel`, `trialCancelLine`, `trialHonestyLine`, `trialCta`, `trialRemaining(days)`, `trialKeepNote`, `billingMissingTrial`. `licenseDescription` deneme kurallarını taşır. |
| `lib/commerce/cockpit-types.ts`, `cockpit-load.ts`, `os-types.ts`, `os-license-band.ts` | `CockpitLicense` → `status`, `trialEndsAt`, `trialDaysLeft`, `trialEligible`, `trialBlockedReason`. `EcommerceLicenseBand.trial`. Mağaza özet ve lisans sayfaları `TRIALING` iken "Lisans açık" **basmıyor**. |

### 1.2 Parasal ve hukuki dürüstlük (1 TL gerçeği)

Kodun gerçek işleyişi: PayTR 1,00 TL'yi tahsil eder → cüzdana CREDIT → aynı anda DEBIT → net 0,
para satıcıda kalır, **iade çağrısı yok**. Metinler buna hizalandı:

| Yer | Önce | Sonra |
|---|---|---|
| `lib/rehber/workflows.ts` | "1 TL doğrulama provizyonu, **iade edilir**" · "1 TL provizyon **çekim değildir**; iade edilir" | "**1,00 TL sembolik kart doğrulama bedeli tahsil edilir**" · "bakiyeye yazılmaz" |
| `lib/copy/legal-launch.ts` | "30 gün ücretsiz deneme (1 TL kart doğrulama ile)" | "…**1,00 TL sembolik kart doğrulama bedeli tahsil edilir; bu bedel bakiyeye yazılmaz, iadesi taahhüt edilmez**" |
| `app/(public)/rehber/page.tsx` | genel dürüstlük notu | + deneme kuralları: 1 TL tahsil, iade taahhüdü yok, VKN/TCKN ile tek deneme, tek tıkla iptal |

Test mührü: workflow ve lifecycle testlerinde `"iade edilir"` ve `"çekim değildir"` dizgeleri
**yasak** olarak kilitlendi.

### 1.3 Deneme hakkı sızıntısı ve TCKN kilidi

**Yeni dosya:** `lib/commerce/trial-reservation.ts` — rezervasyon ile tüketim ayrıldı.

```
sealed_at NULL      → yalnız eşzamanlılık kilidi (TTL 1 saat, bayat kilit sahiplenilir)
sealed_at NOT NULL  → hak gerçekten tüketildi (CLEARED sonrası mühür); bir daha açılmaz
```

| Davranış | Önce | Sonra |
|---|---|---|
| PayTR penceresi kapanan kullanıcı | Hak **yanıyordu** (satır silinmiyordu) | Kilit TTL ile düşer; 1 saat sonra yeniden deneme **1 TL** |
| iframe açılmadı / sipariş yazılamadı / istisna | Geri alma yok | `releaseCommerceTrialReservation` → kilit anında serbest |
| Eşzamanlı iki pencere | İkincisi `held` alır | Aynı davranış + açık 409 mesajı |
| CLEARED | Tüketim örtük | `sealCommerceTrialConsumptionForStore` **idempotent mühür** |
| Bireysel + TCKN boş | Sessizce **1.490 TL** çekilirdi | **422 + açık mesaj**: "VKN (kurumsal, 10 hane) veya TCKN (bireysel, 11 hane) dolu olmalı" |

`billing-info.ts` TCKN etiketi de düzeltildi: "T.C. Kimlik No" + "E-Ticaret ücretsiz denemesi için
zorunludur: kimlik yoksa deneme açılmaz."

### 1.4 Erken dönüş deneme günlerini yakmıyor

`lib/commerce/paytr-license-bridge.ts` → yeni `commerceRenewalBase()`:

```
ACTIVE            → bitmemiş expiresAt
TRIALING/PAST_DUE → bitmemiş trialEndsAt (kalan deneme günleri korunur)
geçmiş tarih      → null (yenileme bugünden başlar)
```

`expiresAt = addCommerceLicenseMonth(commerceRenewalBase(existing, now) ?? now)`.
`TRIALING` kullanıcı bugün ödeme yaparsa yeni dönem **deneme bitişinin üzerine** eklenir.

---

## 2. Rehber / Görsel İş Akış ve Süreç Şeması

### 2.1 Modüller arası akış haritası (yeni)

**Yeni dosya:** `components/rehber/workflow-flow-map.tsx` — `WorkflowFlowMap`.

- Zincir: **AI Tezgâh (Üret) → E-Ticaret (Sat) → YetkinHibe (Finanse et) → YetkinCV & Vize (Kanıtla)**.
- Semantik: `<section aria-labelledby>` + `<ol>/<li>`; oklar `<svg><path>` ve `aria-hidden`,
  `sr-only` bağlam metni taşır. JavaScript gerekmez (`"use client"` yok).
- Responsive: masaüstünde kartın sağ kenarında yatay ok, mobil/tablette kart altında dikey ok.
- Aktif modül `data-workflow-flow-node-active="true"` + "Açık" rozeti ile işaretlenir.
- Düğüm bağlantısı `workflowStepHref()` üzerinden → korumalı hedef `next` parametreli kayıt yolu.

### 2.2 Stepper: gerçek yön okları ve toplam süre

| Öğe | Önce | Sonra |
|---|---|---|
| Adımlar arası bağ | yalnız `bg-gradient-to-b` çizgi | çizgi + **`IconArrowDown`** rozet ok (`data-workflow-step-arrow`) |
| Toplam süre | yok | `moduleTotalLabel()` → başlıkta "Toplam süre ≈ 23 dk" (`data-workflow-total-duration`); sekme kartında "4 adım · ≈ 23 dk" |
| CTA hedefi | ham `step.href` | `workflowStepHref(step.href)` |

`lib/rehber/workflows.ts` yeni yardımcılar: `stepMinutes`, `moduleTotalMinutes`, `moduleTotalLabel`,
`workflowStepHref`, `WORKFLOW_CHAIN`, `TRIAL_VERIFY_AMOUNT_LABEL`, `trialRenewalAmountLabel`.
`components/ui/icons.tsx` → yeni `IconArrowDown`.

### 2.3 Kırık CTA ve ölü kod temizliği

- **Kırık CTA kapandı.** `/e-ticaret`, `/hibe`, `/pasaport` `PROTECTED_KERNEL_PATHS` içindedir
  (`edge-guard.ts`). `workflowStepHref()` bunları `buildCitizenRegisterHref` ile
  `/register?next=%2Fe-ticaret` biçimine çevirir; giriş sonrası kullanıcı doğrudan adıma iner.
  Aynı koruma fiyat sayfası CTA'sına da uygulandı (`vitrineHref`).
- **Ölü kopya silindi.** `lib/copy/sen-voice/public.ts` içindeki `guide` bloğu
  (başlık "Ofiste yapay zekâyı Excel ve e-postada kullan", `stepsTitle`, 4 adım, `faqHeading`)
  kaldırıldı. Repoda tek okuma noktası yoktu; `/rehber` artık stepper basıyor.

---

## 3. Testler

| Dosya | Önce | Sonra |
|---|---|---|
| `tests/ui/rehber-workflow-surface.test.ts` | 10 test | **16 test** |
| `tests/commerce/subscription-lifecycle.test.ts` | 7 test | **15 test** |
| `tests/kernel/legal-launch-surface.test.ts` | 3 iddia | 3 iddia güncellendi (yeni hukuk cümlesi) |

**Yeni mühürler (rehber):** deneme vaadinin dürüstlüğü (`"iade edilir"` yasak), 1 TL etiketinin
tek kaynaktan türetilmesi, `workflowStepHref` korumalı→kayıt çevrimi (dış adres `/register`'a düşer),
toplam süre aritmetiği (23 dk; 75 dk → "1 sa 15 dk"), zincir sırası, akış haritasının `<ol>` + SVG ok
basması, stepper'da `IconArrowDown` + `data-workflow-total-duration`, `guide` bloğunun silinmesi.

**Yeni mühürler (ticaret):** `classifyTrialReservation` dört durumu (free/held/stale/consumed),
TTL sabiti, hata yollarında `releaseCommerceTrialReservation` çağrıları, TCKN boş → 422,
`commerceRenewalBase` erken dönüş kuralı, `TRIALING` uçtan uca merchant-oid çözümü, vitrin/lisans
yüzeyi kaynak mühürleri, hukuk metninin "iade edilir" dememesi.

---

## 4. Git, Supabase ve Canlı Yayın

### 4.1 Commit

```
13141731  feat(rehber,commerce): 30 gun ucretsiz deneme urun yuzeyi + gorsel is akisi merkezi
          480 dosya, +13.114 / −7.906
```

Commit öncesi kontrol: staged kümede `.next/`, `node_modules`, `*.log`, `gitstatus.txt`, `temp/`,
`test-results/`, `playwright-report/` veya `.env*` **yok**. `.gitignore` bu sınıfları zaten kapsıyor.
Commit dışı kalmış tüm ilgili katmanlar (`lib/rehber/`, `components/rehber/`,
`lib/commerce/trial-reservation.ts`, `prisma/migrations/*`, testler) bu commit'e girdi.

### 4.2 Supabase migrasyon

```
Bekleyen (önce)                            Uygulandı (sonra)
20261120223000_ai_product_model_settings   ✅
20261121013000_p0_finance_subscription_seals ✅
20261121014000_p0_commerce_trial_seal      ✅ (bu fazda yeni)

npx prisma migrate deploy  → 70 migrasyon, "All migrations have been successfully applied."
npx prisma migrate status   → "Database schema is up to date!"
npx tsx scripts/verify-rls-status.ts → OK (70 tablo, FORCE RLS + kapsamsız deny)
```

Yeni migrasyon `commerce_trial_consumptions.sealed_at` ekler ve **geriye dönük uyumu** korur:
tedaviden önce yazılmış satırlar `consumed_at` ile mühürlenir, geçmiş deneme hakkı geri açılmaz.

### 4.3 Vercel üretim yayını (canlı doğrulama)

`git push origin main` (korunan dal onayı ile) → Vercel üretim yayını tamamlandı.
Canlı HTTP kontrolleri:

```
GET https://yetkin.ai/rehber                             200
  "Hangi modülü kuruyorsun"                              ✅
  "Makale değil, süreç şeması"                           ✅
  "Üret → Sat → Finanse et → Kanıtla"                    ✅
  data-workflow-flow-map                                 ✅
  data-workflow-flow-node: tezgah, ecommerce, hibe, career ✅ (4/4)
  data-workflow-flow-arrow                                ✅ (SVG ok başları)
  data-workflow-total-duration                            ✅
  "sembolik kart doğrulama bedeli tahsil edilir"          ✅
  /register?next=%2Fe-ticaret, %2Fhibe                    ✅ (ham /e-ticaret yok)
  "Ofiste yapay zek…" (eski makale)                       ✅ YOK

GET https://yetkin.ai/fiyatlandirma                       200
  data-vitrine-trial-headline                             ✅
  "İlk 30 Gün Ücretsiz (1 TL Kart Doğrulama ile)"         ✅
  "Bugün yalnız ₺1,00 kart doğrulama bedeli tahsil edilir" ✅
  "… otomatik yenilenir" (1.490 / Ay katalogdan)          ✅
  "Tek tıkla dönem sonu iptali"                           ✅
  "30 Gün Ücretsiz Başlat (1 TL Doğrulama)"               ✅
  href="/e-ticaret" (ham)                                 ✅ 0 adet → kayıt yoluna çevrildi
```

---

## 5. Dokunulan Dosyalar

### 5.1 Yeni

| Dosya | Amaç |
|---|---|
| `components/rehber/workflow-flow-map.tsx` | Modüller arası uçtan uca akış şeması (semantik SVG) |
| `lib/commerce/trial-reservation.ts` | TTL'li deneme kilidi + CLEARED mührü + teklif okuması |
| `prisma/migrations/20261121014000_p0_commerce_trial_seal/migration.sql` | `sealed_at` kolonu + geçmiş satır mühürleme |
| `docs/tedavi-raporu-faz3.md` | Bu rapor |

### 5.2 Değişen

| Dosya | Değişiklik |
|---|---|
| `lib/rehber/workflows.ts` | Dürüst 1 TL metni, `workflowStepHref`, süre yardımcıları, `WORKFLOW_CHAIN` |
| `components/rehber/workflow-stepper.tsx` | `IconArrowDown` ok bağı, toplam süre özeti, güvenli CTA |
| `app/(public)/rehber/page.tsx` | `WorkflowFlowMap`, deneme dürüstlük notu, deneme CTA'sı |
| `components/ui/icons.tsx` | `IconArrowDown` |
| `lib/copy/sen-voice/public.ts` | Ölü `guide` bloğu silindi |
| `lib/pricing/public-vitrine.ts` | `trial` alanı ve deneme satırları |
| `app/(public)/fiyatlandirma/page.tsx` | Deneme rozeti/tutar/yenileme/iptal, dürüst CTA, `vitrineHref` |
| `components/commerce/license-checkout.tsx` | Gerçek tutar, dürüst buton, TRIALING kalan gün, engel gerekçesi |
| `components/commerce/os-cockpit.tsx` | `TRIALING` şeridi ve "30 Gün Ücretsiz Başlat →" |
| `lib/commerce/cockpit-types.ts`, `cockpit-load.ts` | Deneme alanları (`status`, `trial*`) |
| `lib/commerce/os-types.ts`, `os-license-band.ts` | `EcommerceLicenseBand.trial` |
| `app/(kernel)/magazam/[storeId]/(page\|lisans/page).tsx` | TRIALING etiketi |
| `lib/copy/sen-voice/magazam.ts` | Deneme kopyası |
| `lib/copy/legal-launch.ts` | Dürüst 1 TL + erken dönüş maddesi |
| `lib/commerce/subscription-checkout.ts` | Rezervasyon/serbest bırakma, 422 TCKN kilidi, mühür |
| `lib/commerce/paytr-license-bridge.ts` | `commerceRenewalBase`, CLEARED mührü |
| `prisma/schema/commerce.prisma` | `CommerceTrialConsumption.sealedAt` |
| `lib/kernel/identity/billing-info.ts` | TCKN etiketi ve deneme zorunluluğu |
| `tests/ui/rehber-workflow-surface.test.ts` | 16 test (yeni mühürler) |
| `tests/commerce/subscription-lifecycle.test.ts` | 15 test (rezervasyon/uzatma/yüzey) |
| `tests/kernel/legal-launch-surface.test.ts` | Yeni hukuk cümlesi iddiaları |

---

## 6. Bilinçli Açık Bırakılanlar

| Konu | Neden |
|---|---|
| Yenileme çekiminde sabit `userIp="127.0.0.1"` ve `non_3d=1` (tespit B-6) | PayTR CAPI sözleşmesi kart saklama anındaki IP'yi bekler; gerçek IP saklanmıyor. Çözüm yeni bir şema kolonu + PayTR tarafı doğrulama gerektiriyor → ayrı faz. |
| `optimization` kotası (100) hiçbir çağrıda artmıyor (tespit B-7) | Ürün kararı: hangi işlem "optimizasyon" sayılır. Sabit ve şema hazır; yüzey açılmadı. |
| Kanal kimliği kaydında sunucu lisans kapısı (tespit B-8) | Giden senkron gerçekten kapılı; kimlik **yazımı** kapısız. Owner doğrulaması var, gelir kaybı yok → ayrı faz. |
| `/rehber` `revalidate` (tespit A-7) | `readWorkflowProgress` oturum çerezine dokunduğu için sayfa dinamik kalır; kök layout nonce CSP nedeniyle tam statikleştirme nonce'u dondurur. Kazanç veri katmanında alındı (`lib/content/cache.ts`). |
| İlerleme rozetinin 3-4. adımları (tespit A-4) | Gerçek "adım tamamlandı" sinyali ürün telemetrisi ister; rozet bugün yalnız kanıtlanabilir durumu işaretliyor ve "Tamamlandı" iddiası abartılmıyor. |
| `PublicGuide.examHref` / `examLabel` (tespit A-6) | `/rehber/[slug]` makale yüzeyi bu fazın kapsamı dışında; alanlar silinmedi (tip sözleşmesi). |

---

## 7. Doğrulama Komutları

```bash
$ npx tsc --noEmit                          # çıktı yok — 0 hata
$ npx eslint .                              # çıktı yok — 0 error, 0 warning
$ npx vitest run
  Test Files  365 passed (365)
  Tests       1985 passed (1985)
$ npx tsx scripts/verify-api-auth.ts --check
  verify:api-auth --check OK — 132 route.
  {"session":73,"public":25,"closed":11,"cron":2,"admin":13,"webhook":8,"hybrid":0,"internal":0}
$ npx tsx scripts/verify-no-secrets.ts
  verify:no-secrets OK
$ npx tsx scripts/verify-boundaries.ts
  verify:boundaries OK
$ npx tsx scripts/verify-rls-status.ts
  verify:rls-status OK — … commerce_trial_consumptions …
$ npx prisma migrate deploy
  All migrations have been successfully applied. (70)
$ npx prisma migrate status
  Database schema is up to date!
$ npx next build
  ✓ Compiled successfully — exit_code: 0
$ git push origin main
  fd9f4853..13141731  main -> main
```

---

## 8. Tek Cümle

> Rehber artık **gerçek bir görsel iş akış merkezi** olarak yayında (dört halkalı zincir, oklu
> akış, modül toplam süresi, güvenli CTA) ve E-Ticaret'in 30 günlük ücretsiz denemesi
> **müşterinin gördüğü her ekranda** — fiyat kartı, lisans ekranı ve kokpit şeridi — ekranda yazan
> tutarla çekilen tutar aynı olacak şekilde duyuruluyor; "1 TL iade edilir" yalanı kaldırıldı,
> terk edilen ödeme penceresi deneme hakkını yakmıyor, TCKN'siz kullanıcı sessizce tam fiyat
> ödemiyor ve erken dönüş yapan deneme günlerini kaybetmiyor.
