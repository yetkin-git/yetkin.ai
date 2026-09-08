# Tespit Raporu — Canlı Yayın Öncesi Sistem ve Strateji

| Alan | Değer |
|------|--------|
| Tarih | 8 Eylül 2026 |
| Muhatap | SUPER ADMIN ve CEO |
| Hazırlayan | Teknik mimar / kıdemli danışman (tarafsız tarama) |
| Kapsam | Canlı kod (`app/`, `components/`, `lib/`, `prisma/`, `apps/rail-is/src/`, `.system_docs/`). `archived/`, `yetkin_muze/`, `node_modules/` ve toplu medya tarama dışı. |
| Git | `main` = `6ff90ba`, `origin/main` ile aynı. Uzak: `https://github.com/yetkin-git/yetkin.ai.git` |
| Üslup | Vatandaş lisanı. Ne varsa o; yeşil boyama yok. |

Bu rapor bir tedavi planı değildir. «Ne var, nerede duruyor, ne kırık, ne gizlenmeli, sen olsaydın ne yapardın» sorularına yanıt verir.

---

## Yönetici özeti (bir dakikalık okuma)

Platform bugün **Akademi B2C eğitim satışı** için neredeyse hazır; **Freelancer / emanet / pazaryeri** yüzeyi PayTR Merchant (B2C) incelemesinde hâlâ risklidir.

Üç net gerçek:

1. **Freelancer silinmemiş.** Ana sayfada adı geçmez; kopya «modül pasiftir» der. Buna rağmen sol menüde durur, `/freelancer` 200 döner, ilan oluşturma ve teklif API’leri açıktır, sitemap’te listelenir, yasal metinler «freelancer aracılık + emanet + paylaştırmalı tahsilat» anlatır. Ödeme (accept) split bağlı olmadığı için 503’tür; bu, odanın vatandaşa görünmediği anlamına gelmez.
2. **Junior canlıya çıkarılacak ürün değildir.** Diskte arşivdedir, kenarda HTTP 410’dur, reşit olmayan / veli kilidi açıktır. İlk aşamada Junior’ı öne çıkarmak hem yasal hem PayTR açısından yanlış hamledir.
3. **Yasal sayfalar büyük ölçüde durur; «Hakkımızda» sayfası yoktur.** Gizlilik+KVKK, çerez, iade, mesafeli satış, kullanım şartları ve iletişim vardır. Footer kamu sayfalarında ve kasa tiklerinde bağlanır. Dashboard’da sabit yasal taban yoktur (bilinçli). Metinler hâlâ Freelancer emaneti anlatır.

**Tavsiye tek cümle:** Freelancer’ı silmeyin; Junior’ı açmayın; Akademi + Kariyer + Panel üçlüsünü vitrin yapın; Freelancer’ı Junior gibi **kenar 410 + nav dışı** kilitleyin; yasal metinden aracılık/emanet cümlelerini çıkarın.

---

# ADIM 1 — Freelancer modülü ve yasal/operasyonel temizlik

## 1.1 Mevcut durum: nerede tanımlı?

### A. Vatandaş sayfaları (App Router)

| Yol | Dosya | Ne görür vatandaş? |
|-----|--------|---------------------|
| `/freelancer` | `app/freelancer/page.tsx` | «Freelancer İlan Panosu». Açık ilan listesi + tohum «platform örnekleri». CTA: İlan oluştur, Pasaport, Kariyer, Sertifikalarım. |
| `/freelancer/new` | `app/freelancer/new/page.tsx` | İlan oluşturma formu. |
| `/freelancer/jobs/[id]` | `app/freelancer/jobs/[id]/page.tsx` | İlan detayı, teklif, emanet adım şeridi (`EscrowHoldSteps`). |
| `/freelancer/contracts/[id]` | `app/freelancer/contracts/[id]/page.tsx` | Sözleşme, sohbet, teslim, itiraz, serbest bırakma. |

Yardımcı kabuk: `app/freelancer/layout.tsx`, `loading.tsx`, `error.tsx`.

Kopya (`lib/copy/sen-voice/freelancer.ts`) her yerde «ilan ve teklif modülü pasiftir / ödeme modülü pasiftir» der. **Sayfa yine de panoyu basar.** Pasiflik bir feature flag değildir; metin katmanıdır.

### B. HTTP API (Amiral BFF)

`app/api/freelancer/` altında 15 rota:

| Rota | Durum (kod) |
|------|-------------|
| `GET/POST /api/freelancer/jobs` | **Açık.** İlan listeler / oluşturur. |
| `GET /api/freelancer/jobs/[id]` | Açık. |
| `POST /api/freelancer/jobs/[id]/bids` | **Açık.** Teklif yazar. |
| `POST /api/freelancer/jobs/[id]/accept` | Motor çalışır; split yoksa **503** (`not_configured`). |
| `GET /api/freelancer/contracts` ve `.../[id]` | Açık (okuma). |
| `POST .../messages` | Teslim / mesaj. |
| `POST .../release` | Serbest bırakma (split’e bağlı). |
| `POST .../refund` | İade. |
| `POST .../dispute` ve `POST /api/freelancer/dispute` | İtiraz. |
| `POST /api/freelancer/squad` | **HTTP 410** (`lib/freelancer/satellite-gone.ts`). |
| `GET/POST /api/freelancer/direct-offers` ve accept/decline | **HTTP 410** (uydu). |

Ek: `app/api/client/jobs/[id]/bids` — işveren teklif listesi (Dron hop’u).

### C. Dron sözleşmesi (`/api/v1`)

Kopya `app/api/v1` ağacı yoktur. `proxy.ts` kanonik `/api/...` yoluna soyar. Hop sicili `lib/kernel/http/v1-hops-meta.ts`:

- `freelancer-jobs`, `freelancer-bid`, `freelancer-accept`, `freelancer-contracts`, `freelancer-delivery`, `freelancer-release`, `freelancer-refund`, `client-job-bids`

Native uygulama `apps/rail-is` **ilan tahtası / teklif / kabul / teslim** istemcisidir. Mağaza yayını runbook’ta «Faz 1 kapanana kadar donuk» der. Yine de hop’lar canlı kenardadır.

### D. İş mantığı ve UI bileşenleri

- Motor: `lib/freelancer/` (`engine.ts`, `fsm.ts`, `prisma-store.ts`, `runtime.ts`, `escrow-refund.ts`, `dispute-engine.ts`, `squad-engine.ts`, …)
- Bileşen: `components/freelancer/` (ilan kartı, teklif formu, emanet adımları, sözleşme sohbeti, itiraz, squad uyarısı, …)
- Dashboard nabzı: `lib/dashboard/freelancer-pulse.ts` + `components/dashboard/freelancer-pulse-widget.tsx`
- Kariyer kapısı: `lib/kernel/catalog-ids/need-based-mapping.ts` (`FREELANCER_GUARANTEED_NEED_IDS`, `FREELANCER_MARKETPLACE_NEED_IDS` — iç id `eticaret-pazaryeri` **donmuş `/pazaryeri` odası değildir**; ilan kategorisidir)

### E. Veritabanı

`prisma/schema/freelancer.prisma` — canlı tablolar:

| Prisma model | SQL tablo |
|--------------|-----------|
| `FreelancerJob` | `freelancer_jobs` |
| `FreelancerBid` | `freelancer_bids` |
| `FreelancerContract` | `freelancer_contracts` |
| `FreelancerDispute` | `freelancer_disputes` |
| `FreelancerContractMessage` | `freelancer_contract_messages` |
| `FreelancerSquad` | `freelancer_squads` |
| `FreelancerSquadMember` | `freelancer_squad_members` |

Kernel (`prisma/schema/kernel.prisma`): `User` üzerinde onlarca freelancer ilişkisi; `EscrowHold` freelancer sözleşmesine string FK ile bağlanır (`escrowHoldId`). Emanet **ikinci cüzdan değildir**; PSP referans kaydıdır. Split bağlı değilken `createEscrowHold` fail-closed kalır.

Migrasyon / tohum: `20260814080000_faz8_freelancer_depth`, `20260814110000_freelancer_job_seed`, `20260823220000_freelancer_job_visa_pathway`, `20260824030000_freelancer_direct_job_offer`. Runbook `ops:migrate` zincirinde freelancer tohum SQL’i hâlâ çalışır.

Kariyer şeması (`career.prisma`) vize kaynağı olarak `FREELANCER_RELEASE` enum değerini taşır. Akademi mührü asıl kaynaktır; freelancer teslim mührü ikinci yoldur.

### F. Navigasyon (header / footer / dashboard)

| Yüzey | Freelancer görünür mü? |
|-------|------------------------|
| Sol ray (`components/shell/sidebar-nav.tsx`) | **Evet.** `VERTICAL_ROOMS` → `isPhase1ShellNavRoom`. Sicil: `lib/kernel/rooms.ssot.ts` — id `freelancer`, etiket «Freelancer», blurb «Arka plan · modül pasif». |
| Üst bar (`header-bar.tsx`) | Oda linki basmaz; breadcrumb basar. `/freelancer` breadcrumb’da «Freelancer» yazar. |
| Sağ üst hesap menüsü (`user-hub.tsx`) | Freelancer yok. Profil / Pasaport / Admin (+ cüzdan çipi). |
| Ana sayfa (`/`) | **Hayır.** E2E (`tests/e2e/faz1-nav.spec.ts`) «Freelancer metni 0» bekler. Kahraman yalnız Akademi. |
| Kamu footer (`LegalSiteFooter`) | Freelancer linki yok. Yasal + iletişim. |
| Dashboard | **Evet.** Üç sütun: Akademi / Kariyer / **FreelancerPulseWidget** (`href="/freelancer"`). |
| Kariyer sayfası | **Evet.** «Freelancer İlan Panosu» butonu (`FREELANCER_STAMP_SURFACE_PATH` = `/freelancer`). |
| Pasaport | Freelancer damga şeridi + «ilan panosuna git» CTA. |
| Sitemap | `PRODUCT_ROOM_PATHS` = `/academy`, `/career`, **`/freelancer`**. Öncelik 0.4 (arka plan) ama Google yine görür. |
| 410 «kapalı oda» sayfası kopyası | `PUBLIC_SEN.gone.freelancerCta` hâlâ «Freelancer» der. |

Oda SSOT (`lib/kernel/rooms.ssot.ts`):

```
dashboard, academy, career, freelancer  →  çalışan 4 oda
studio, devlabs, kurumsal, hibe, arena, pazaryeri, junior, social  →  donmuş 8 oda (archived + kenar 410)
```

`verify-boundaries` ve `tests/kernel/circuit-breakers-surface.test.ts` **tam 4 oda** bekler. Freelancer’ı nav’dan çıkarmak bu testleri ve sicili birlikte değiştirmeden yeşil kalmaz.

### G. Ödeme akışı (Freelancer vs Akademi)

İki ayrı motor vardır. Karıştırmamak PayTR için hayati.

| | Akademi (Motor 1) | Freelancer (Motor 3) |
|--|-------------------|----------------------|
| Bayrak | PayTR Merchant üçlüsü | `MARKETPLACE_SPLIT_LIVE = false` (`lib/kernel/payments/marketplace-split-live.ts`) |
| Port | `lib/kernel/payments/paytr/` | `paytrMarketplaceSplitPort` — `beginHold` / `settle` her zaman `{ ok: false, reason: "not_configured" }` |
| Vatandaş nakit | Cüzdan yükleme (`/api/wallet/top-up`) + kurs DEBIT (`/api/academy/courses/[id]/purchase`) | Kabul anında PSP hold. Rail cüzdanına usta CREDIT **yazılmaz** (Anayasa A2 / S43). |
| Fail-closed | Merchant yoksa checkout throw / dürüst kapalı | Accept 503. Sahte kazanç yok. |
| Çekim | `/api/wallet/withdraw` **yok** (test mühürü) | IBAN dağıtımı yalnız lisanslı split’te; bugün yok. |

Dashboard «sıradaki eylem» (`lib/dashboard/next-best-action.ts`): Split kapalıyken Freelancer NBA **üretilmez**; varsayılan Akademi’dir. Widget yine çizilir.

Özet: **Nakit Freelancer’da doğmaz. Görünürlük doğar.** PayTR incelemesi ekran ve sözleşme metnine bakar; 503 loguna bakmaz.

---

## 1.2 Pazaryeri temizliği — 6493 ve PayTR B2C

**Teşhis:** Eski `pazaryeri` odası (`/yetkinilan`, `/market`) zaten 410 + `archived/`. Asıl risk **canlı Freelancer odasının escrow / split / ilan tahtası görünmesidir.** Yasal metin bunu peşinen itiraf eder:

> «Sunulan hizmetler; … eğitim … sınav **ve freelancer aracılık hizmetidir.**»  
> (`LEGAL_ACTIVITY_SCOPE_BODY`, `lib/copy/legal-launch.ts`)

İade ve mesafeli satış bölümleri «emanet», «paylaştırmalı tahsilat», «usta IBAN», «pazaryeri altyapısı bağlıysa kilitlenir» anlatır. Bu cümleler Merchant onayında «bu bir pazaryeri / ödeme hizmeti» algısı üretir.

### Dokunulacak katmanlar (silmeden gizleme / 410)

Aşağısı **tedavi listesi değil; dokunulması gereken envanterdir.** Öncelik: vatandaşın ve denetçinin gördüğü yüzey, sonra API, sonra kopya, en sonda test/sicil.

#### Katman 0 — Tek ürün kilidi (önerilen SSOT)

Junior’da hazır kalıp vardır: `JUNIOR_PRODUCTION_LOCKED` + `isFrozenShellPagePath` + kenar 410.

Aynı kalıbı Freelancer kamu yüzeyi için kopyalamak en az yırtılmalı yoldur. Aday yerler:

- `lib/kernel/compliance/circuit-breakers.ts`
- `lib/kernel/rooms.ssot.ts` (nav’dan düşürme **veya** çalışan odada tutup `isPhase1PublicNavRoom` / `isVitrineRoomFrozen` ile kesme)
- `lib/kernel/security/edge-api-auth.ts` + `proxy.ts` (yol 410)
- `lib/kernel/http/frozen-410-html.ts` / `components/shell/frozen-room-gone-page.tsx`

**Tavsiye:** `freelancer`’ı `FROZEN_DISK_ROOMS`’a taşıyıp `archived/`’e taşımak **şimdi yanlış** (Motor 3 ileride; şema, test, Dron hop, Kariyer kapısı bağlı). Kilidi Junior gibi **üretim yüzeyi kilidi** yapın; kod `lib/freelancer` içinde kalsın.

#### Katman 1 — Navigasyon ve vitrin (denetçi ilk bakış)

| Dosya | Ne değişmeli |
|-------|----------------|
| `lib/kernel/rooms.ssot.ts` | Nav blurb / odanın kamu listesinden düşmesi. |
| `lib/kernel/modules.ts` | `RIBBON_ROOMS` freelancer’ı kaybeder. |
| `components/shell/sidebar-nav.tsx` | Filtre zaten `isPhase1ShellNavRoom`; sicil yeter. |
| `app/dashboard/page.tsx` | `FreelancerPulseWidget` kaldır / gizle. |
| `components/dashboard/freelancer-pulse-widget.tsx` | Kullanılmazsa ölü kod; flag ile `null`. |
| `lib/dashboard/next-best-action.ts` | `orderFeaturedRooms` üçlüden freelancer’ı çıkar. |
| `app/career/page.tsx` | `freelancerBoardCta` linki. |
| `lib/copy/sen-voice/career.ts` | `freelancerCta`, `freelancerBoardCta`. |
| `components/kernel/passport-stamp-list.tsx` | Freelancer şeridi / CTA. |
| `lib/copy/seo.ts` | `PRODUCT_ROOM_PATHS` içinden `/freelancer` çıksın. |
| `app/sitemap.ts` | `PRODUCT_ROOM_PATHS` üzerinden otomatik düşer. |
| `lib/copy/sen-voice/public.ts` | 410 sayfası `freelancerCta`; hata odası freelancer cümlesi. |
| `components/ui/icons.tsx` | `ROOM_ICONS.freelancer` — nav düşünce ölü kalır, silmek zorunlu değil. |
| `lib/ui/breadcrumbs.ts` | `/freelancer` eşlemesi 410 sonrası «Kapalı» olmalı. |

Ana sayfa (`app/(public)/page.tsx`) zaten Freelancer basmaz. Ek iş yok.

#### Katman 2 — Sayfa ve API (derin link / curl)

| Dosya grubu | Ne değişmeli |
|-------------|--------------|
| `app/freelancer/**` | Kenar 410 **veya** sayfa `notFound`/`Gone`. Derin link (`/freelancer/jobs/...`) aynı kapı. |
| `app/api/freelancer/**` | Yazma (POST jobs/bids/accept/release/refund/dispute) 410 veya 503 tek kapı. GET de vitrin sayılır; 410 tercih. |
| `app/api/client/jobs/**` | Aynı kapı. |
| `lib/kernel/http/v1-hops-meta.ts` | Freelancer hop’ları `dronForbidden` veya kenar 410. |
| `proxy.ts` | `/api/v1/freelancer/*` ve `/api/freelancer/*` donmuş oda yoluna. |
| `app/freelancer/layout.tsx` | 410 sonrası ölü; silmek şart değil. |

Squad ve direct-offer zaten 410. Kabul zaten 503. **Açık kalan asıl delik: ilan GET/POST ve teklif POST.**

#### Katman 3 — Yasal metin (PayTR PDF / footer)

Tek SSOT: `lib/copy/legal-launch.ts`

Çıkarılması / Akademi-only’ye çekilmesi gereken yerler:

- `LEGAL_ACTIVITY_SCOPE_BODY` — «freelancer aracılık hizmetidir»
- KVKK «ne toplanır»: ilan/teklif/sözleşme, emanet kilit
- KVKK amaç: «freelancer aracılığını yürütmek»
- Aktarım: «Freelancer iş bedeli, pazaryeri altyapısı…»
- İade §3 «Freelancer emanet», §4 «paylaştırmalı tahsilat / usta IBAN»
- Mesafeli: hizmet niteliği (2) Freelancer aracılık; ifa emaneti
- Kullanım şartları: «dört çalışan oda … Freelancer»; §2 Freelancer aracılığı

`/iletisim` faaliyet kartı aynı `LEGAL_ACTIVITY_SCOPE_BODY`’yi basar — bir yerden düzelir.

Checkout tikleri (`LEGAL_CHECKOUT_CONSENT_COPY`) Akademi dijital ifaya bağlı; freelancer anlatmaz. **Kasayı bozmadan yasal gövdeyi sadeleştirmek mümkün.**

#### Katman 4 — Motor / şema / test (şimdi silinmez)

Dokunulmadan bırakılması gerekenler (Faz 2 Split için):

- `lib/freelancer/**`, `prisma/schema/freelancer.prisma`, `EscrowHold`
- `lib/kernel/payments/marketplace-split.ts` (fail-closed stub)
- `MARKETPLACE_SPLIT_LIVE = false`
- Vitest freelancer suite, E2E `tests/e2e/freelancer-happy-path.spec.ts` (lab)
- `scripts/ops-t4-freelancer-loop.ts`, seed SQL

Yüzey kapatılınca **kırılacak mühürler** (bilinçli güncellenir):

- `tests/kernel/circuit-breakers-surface.test.ts` («freelancer vitrin donu false», «4 oda»)
- `tests/freelancer/citizen-surface.test.ts`
- `tests/dashboard/cockpit-surface.test.ts`, `next-best-action.test.ts`
- `tests/career/proof-portfolio-surface.test.ts` (ilan panosu CTA)
- `tests/kernel/legal-launch-surface.test.ts` (freelancer cümleleri, sitemap)
- `tests/e2e/faz1-nav.spec.ts` (oturumlu kabuk ayrıca bakılmalı)
- `scripts/verify-boundaries.ts` («çalışan 4 oda sicili»)
- `README.md`, `.system_docs/MANIFESTO.md`, `OPS_RUNBOOK.md` «4 oda»

#### Katman 5 — Dron

`apps/rail-is` mağazaya çıkmamalı. Kenar hop 410 olursa native istemci zaten dürüst hata basar. Closed Testing boş `RAIL_DRON_ORIGINS` runbook’ta durur — **şimdi mağaza binary’si yayınlanmamalı.**

---

## 1.3 Alternatif odak: Academy + Career (+ Junior değil)

İstekte «academy, career ve junior öne çıksın» denmiş. Kodun gerçeği:

| Modül | Canlı mı? | Vitrine uygun mu? |
|-------|-----------|-------------------|
| Akademi | Evet | **Evet — gün 0 kahraman.** 5 compact SKU, satın alma, oynatıcı, sınav, sertifika. |
| Kariyer | Evet (oturum şart) | **Evet — belge vitrini.** Para yok. `/career` oturumsuz `/login?next=` 307. |
| Junior | **Hayır.** `archived/app/junior`, `JUNIOR_PRODUCTION_LOCKED = true`, kenar 410 | **Hayır.** Reşit olmayan + veli doğrulaması bitmeden para ve vitrin Anayasa/kilit ile kapalı. |
| Panel | Evet | Kokpit. NBA zaten Akademi’ye kayıyor. |

**Junior’ı menüye almak canlı yayın için yapılmamalı.** 18+ metni (`LEGAL_HONESTY_BODY`) ile çelişir; PayTR ve 6502/KVKK’da çocuk profili ayrı hukuki dosyadır.

Önerilen menü (girişli kabuk):

1. Panel (`/dashboard`)
2. Akademi (`/academy`)
3. Kariyer (`/career`)
4. Sağ üst: Profil, Cüzdan, Pasaport

Kaldırılacak: Freelancer rayı, dashboard freelancer kartı, Kariyer’deki ilan panosu butonu.

Yönlendirme:

- Ana sayfa CTA zaten `/academy` — korunur.
- NBA zaten Akademi — freelancer widget düşünce tutarlı olur.
- Kariyer footnote zaten Akademi + doğrulama — ilan panosu satırı düşer.
- Pasaport büyüme kartı 5 SKU — freelancer şeridi gizlenir veya «yakında» denmez (sahte vaat yok).

---

# ADIM 2 — Canlı yayın ve PayTR B2C hazırlık

## 2.1 Yasal ve zorunlu sayfalar

### Envanter

| İstenen | Durum | Kanıt |
|---------|--------|--------|
| Mesafeli Satış Sözleşmesi + Ön Bilgilendirme | **Var** | `/legal/mesafeli-satis` — `LEGAL_PAGE_SLUGS.mesafeli`. Eski URL 301: `/legal/mesafeli-satis-sozlesmesi`. |
| Gizlilik Politikası | **Var** (KVKK ile birleşik) | `/legal/gizlilik`. 301: `/legal/gizlilik-politikasi`. |
| KVKK Aydınlatma | **Var** (aynı sayfa, başlık «Gizlilik Politikası ve KVKK Aydınlatma Metni») | `/legal/kvkk` → 301 `/legal/gizlilik`. Ayrı bağımsız KVKK URL’i yok; içerik duruyor. |
| İptal ve İade | **Var** | `/legal/iade`. 301: `/legal/iade-sartlari`. |
| Çerez Politikası | **Var** (zorunlu listede yoktu; bonus) | `/legal/cerez`. |
| Kullanım şartları | **Var** | `/legal/kullanim`. |
| İletişim | **Var** | `/iletisim` — unvan, VKN, MERSİS, adres, IBAN, e-posta, WhatsApp. |
| Hakkımızda | **Yok** | Repoda `hakkimizda` / `/about` route’u yok. Künye iletişim + yasal metinde dağılmış. |

Şirket SSOT (`LEGAL_ENTITY`): Yapınet Gayrimenkul ve E-Ticaret Limited Şirketi, VKN 9370683361, MERSİS, Akhisar adresi, `destek@yetkin.ai`. Unvan «gayrimenkul ve e-ticaret»; faaliyet metni dijital eğitim olduğunu dürüstçe yazar. Bu NACE gerilimi raporlanır, uydurma unvan önerilmez.

Yürürlük etiketi: **5 Eylül 2026**.

### Footer ve kasa bağlantıları

| Yüzey | Yasal linkler |
|-------|----------------|
| `/`, `/legal/*`, `/iletisim` | `LegalSiteFooter` — sabit alt şerit, `LEGAL_FOOTER_LINKS` + künye + PayTR markaları. |
| Akademi / Kariyer / Freelancer layout | `LegalColophonStrip` (akış içi; sidebar ile çakışmasın diye fixed değil). |
| Pasaport | Aynı şerit. |
| Dashboard | **Footer yok.** Test bunu kilitler. Denetçi panele girerse künye görmez; kamu ve Akademi’de görür. |
| Kayıt / giriş | Footer yok. |
| Ana sayfa gövdesi | Inline yasal link yok; layout footer taşır. Test «home içinde /legal/gizlilik string’i olmasın» der — footer ayrı bileşen, çalışır. |

Checkout (`components/legal/checkout-consent-fields.tsx`):

- Tik 1: Mesafeli Satış Sözleşmesi → `/legal/mesafeli-satis` + Ön Bilgilendirme çapa `#on-bilgilendirme`
- Tik 2: Dijital anında ifa → `#dijital-ifa-istisnasi`
- Kullanıldığı yerler: `components/academy/purchase-button.tsx`, `components/kernel/wallet-top-up-form.tsx`
- Rıza sürümü sunucuda `CHECKOUT_LEGAL_CONSENT_VERSION`; tik yoksa tahsilat durur.

**Eksik / risk:**

1. Hakkımızda sayfası yok (PayTR evrak listesinde sık istenir).
2. KVKK ayrı URL değil; 301 ile gizliliğe düşer — çoğu inceleme için yeterli, bazı kontrol listeleri «ayrı KVKK» bekler.
3. Yasal gövde Freelancer emaneti anlatır — B2C hikâyesi ile çelişir.
4. Dashboard’da künye yok — oturumlu denetçi turunda zayıf nokta.

Kod düzeyinde kırık `href` tespit edilmedi; slug’lar `generateStaticParams` + `dynamicParams = false` ile kilitli.

## 2.2 Kullanıcı profilleri ve modül akışı

### Dashboard → Akademi → Kariyer

Akış tasarımı tutarlı:

1. Kayıt (`/register`, 18+ tiki, e-posta onayı) → Panel.
2. Akademi katalog (`/academy`) → antre `/academy/[slug]` → kasa (cüzdan veya kart) → `/academy/[slug]/oyna`.
3. Ders tamamlama: `POST /api/academy/courses/[id]/curriculum` (`completeLesson`). Ayrı «complete» rotası yok; curriculum POST bu işi görür.
4. Sınav: `POST /api/academy/courses/[id]/exam` — sunucu puan, baraj 70.
5. Sertifika: `/academy/certificates`, kamu doğrulama `/academy/dogrula/[hash]` (oturum yok).
6. Kariyer vizesi akademi mühründen projekte edilir (`CareerVisaSourceKind.ACADEMY_CERTIFICATE`). `/career` oturum ister.
7. Profil (`/profil`): kimlik + fatura künyesi (`/api/profile`, `/api/profile/billing`). Pasaport ve Kariyer linkleri durur; Freelancer’a zorunlu gitmez.
8. Cüzdan (`/cuzdan`): yükleme + yasal tik. Çekim API’si yok.

TTS / «dersi dinle»: `GET/POST /api/academy/generateSpeech` ve listen **410**. Gün 0 oynatıcı compact makale (+ mühürlü 2 WAV, runbook). Bu kırık link değil; bilinçli kapı.

### Kırık veya eksik görünenler (Akademi hattı)

- **Kırık zorunlu API** (ders, satın alma, sınav, sertifika) taramada çıkmadı.
- Kariyer → Freelancer panosu **bilinçli derin link**; gizlemede kesilmeli, yoksa 410’a düşer.
- `CareerVisaSourceKind.FREELANCER_RELEASE` şemada durur; nakit olmadığı için üretimde damga üretmez. Zararsız.
- Dashboard freelancer kartı «canlı değil» gösterebilir; yine `/freelancer`’a götürür.

### UI uyumu

Üç oda aynı kabuk (`app-shell`), SEN aksı, `LegalColophonStrip` (panel hariç). Junior kabuğu yok. Freelancer odası görsel olarak «iş ilanı + emanet adımları» — Akademi sakinliği ile çelişir; gizlenince uyum artar.

## 2.3 Deployment ve ortam

Koddan görülen:

| Konu | Tespit |
|------|--------|
| Git ana dal | `main`, `origin/main` ile eşit. Son commit’ler PayTR vitrin, HMAC, marketplace dili temizliği. |
| CI | `.github/workflows/ci.yml` — `main` push/PR: lint, `verify:prebuild`, typecheck, test; `rail-is` typecheck; Postgres 16 lab. |
| Vercel | Repoda `vercel.json` yok. Konfig Dashboard’da. `outputFileTracingExcludes` `apps/**` ve `archived/**` derleme dışı. |
| Supabase | `.env.example` net: runtime `DATABASE_URL` pooler `:6543`, migrate `DIRECT_URL` Direct `:5432`. `service_role` istemciye yazılmaz. JWT JWKS + isteğe bağlı `SUPABASE_JWT_SECRET`. |
| PayTR | Üçlü + webhook `/api/paytr/callback` (= `/api/payments/webhooks/paytr`). Üretimde sandbox/mock throw. `TRUSTED_PROXY_HOPS=2` Cloudflare→Vercel. |
| Inngest | Üretimde çift anahtar zorunlu; `ops:runtime-readiness` **production build’de** boş env ile çıkış 1 (`verify:prebuild` zinciri). |
| Bakım | `SITE_MAINTENANCE_FREEZE` — PayTR incelemesinde boş kalmalı. |
| Bu çalışma ağacı | `docs/01_…05_TEDAVI/TESPIT` silinmiş (commit edilmemiş). `docs/Bilgiler/` izlenmiyor. Canlı dalı kirletmez. |

**Bu rapordan doğrulanamayanlar (ortam sırrı):** Vercel Production secret’ların sandbox kalıntısı, Confirm-email açık mı, PayTR panel Bildirim URL’si, Inngest Cloud bağlı mı. Bunlar Dashboard/ops işidir; `npm run ops:runtime-readiness` operatörde koşulur.

README dürüst: «Shared Kernel paketi veya mikroservis değildir. Gövde Modüler Monolit + API-First Dron Sözleşmesi.»

---

# ADIM 3 — Anayasa, Manifesto, Pedagoji

Kaynak: `.system_docs/ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`. Ürün bunları import etmez.

## 3.1 A Katmanı — boğmaz, korur

Anayasa Eylül 2026 reformundan sonra A katmanı sade:

- `amountMinor` tamsayı para, tek defter, float yasak
- S43: ödeme kuruluşu değiliz, çekim yok, usta neti Rail cüzdana yazılmaz
- Fail-closed (sahte bakiye yok)
- RLS / IDOR / sır / idempotency
- Sınav sunucuda, sertifika satın alınamaz, kamu hash doğrulama

Bunlar canlı çıkışı yavaşlatmaz; PayTR ve 6493 için **gerekli frenlerdir.** Gevşetilmemeli.

## 3.2 Bizi yavaşlatan / kendi ipimiz

Reform B katmanına çok şeyi indirmiş. **Kod ve test hâlâ bazı B maddelerini A gibi uygular.**

### 1) «Çalışan 4 oda» dogması

Anayasa B2 ve Manifesto Kural 1 freelancer’ı omurgada tutar. `rooms.ssot.ts`, `verify-boundaries`, circuit-breaker testleri **tam 4 oda** ister. B2C çıkış için freelancer’ı gizleyince onlarca yüzey testi kırılır. Bu, yasal kırmızı çizgi değil; **sicil katılığı.**

Manifesto gün 0 cümlesi aslında doğru: «nakit yalnız Akademi’dedir.» Kural 1 ile çelişir: dört deneyim «eşit omurga» gibi okunur.

### 2) Yasal metnin «dürüst aracılık» ısrarı

A5 «gerçek neyse o» der. Split yokken sözleşmede emanet/IBAN anlatmak denetçiye **niyet** gösterir. Dürüstlük Akademi kasasına uygulanmalı; henüz satılmayan Motor 3 sözleşmede pazarlanmamalı.

### 3) Grep / yüzey mühürleri

`verify:prebuild` A katmanı + `ops:runtime-readiness` (üretimde env kilidi — bu iyi).  
`verify:grep-seals` / `verify:sen-axis` / `verify:atomic-seals` prebuild’de yok (Anayasa B3).  
Ama `citizen-surface` testleri hâlâ kopya cümlesi ve dosya listesi kilitler. Freelancer gizleme «bir flag» değil, **mühür avı** olur. Bu, ajanı yavaşlatır; ürünü güvenli kılmaz.

### 4) Junior kilidi — doğru ip, yanlış hedef

`JUNIOR_PRODUCTION_LOCKED` pratik ve doğrudur. «Junior’ı öne çıkar» talebi bu ipi kesmeyi ister. Kesilmemeli.

### 5) Pedagoji Aşama 2–3 mühür disiplini

`--seal` olmadan TTS/video yok, izlemede canlı API yok. **Gün 0’ı yavaşlatmaz** (yayın zaten makale). Stüdyoyu gün 0 kapsamına almak bizi boğardı; belge bunu yasaklıyor — doğru.

Katı görünen ama zararlı olmayan: 5 SKU vitrin, baraj 70, sunucu puan. Bunlar ürün vaadi.

### 6) Dron hop şişmesi yasağı

`DRON_CLIENT_SPEC.md`: her Amiral rotasını v1 hop yapma. Sağlıklı. Darboğaz: mevcut hop’ların çoğu freelancer. Akademi satın alma `dronForbidden`. B2C web’e zarar vermez; «sürü dron ile akademi satışı» hayali bugün yok.

### 7) Manifesto Motor 3 ve «Standart Pazaryeri» kelimesi

Kural 2 «Standart Pazaryeri (vizesiz OPEN)» der. Ürün-içi kategori adı. PayTR dosyasına yapıştırılırsa felaket. Kodda `FREELANCER_MARKETPLACE_NEED_IDS`. Gizleme sonrası bu kelime kamu kopyadan düşmeli.

**Sonuç:** Anayasa A katmanı canlıyı boğmaz. Boğan şey: 4 oda sicili + yasal metinde Motor 3 + yüzey grep testleri + (talep edilirse) Junior’ı zorla açmak.

---

# ADIM 4 — Kritik sorular (tarafsız)

## 4.1 Sen olsaydın ne yapardın?

### Freelancer: silmezdim. Feature flag / üretim kilidi ile gizlerdim.

**Silmezdim**, çünkü:

- Şema, escrow, Kariyer enum, Dron hop, onlarca IDOR testi ve T4 lab halkası bağlı. Silmek 2–4 haftalık regresyon + geri alınamaz göç.
- Motor 3 (Split sonrası komisyon) gerçek gelir yoludur; kodu müzelemek ileride yeniden yazmak demektir.
- Anayasa A2 fail-closed zaten nakit doğurmayı engelliyor. Problem **görünürlük**, yokluk değil.

**Yalnızca «nav’dan gizle, sayfa 200 kalsın» da yapmazdım.** Denetçi `/freelancer` yazar, ilan tahtası ve emanet adımları çıkar. Sitemap ve Kariyer butonu aynı işi görür.

**Yapacağım şey (Junior kalıbı):**

1. `FREELANCER_PUBLIC_SURFACE_LOCKED = true` (veya eşdeğer) — sayfa + `/api/freelancer` + v1 hop **410**.
2. Nav, dashboard widget, Kariyer CTA, sitemap, 410 sayfası CTA’sı düşer.
3. `lib/freelancer` + Prisma + split stub + lab testleri kalır.
4. `MARKETPLACE_SPLIT_LIVE` false kalır.
5. Yasal SSOT Akademi B2C’ye çekilir: faaliyet = dijital eğitim + sınav + sertifika. Emanet/IBAN/aracılık paragrafları «ileride lisanslı split ile açılacak; bugün sunulmaz» diye **silinir veya arşiv nota alınır** — canlı sözleşmede durmaz.
6. `apps/rail-is` mağazaya çıkmaz.
7. Junior’a dokunmam.

### Akademi odaklı B2C için ayrıca değiştirirdim

- **Hakkımızda** sayfası: unvan, faaliyet (yalnız eğitim), künye, neden Yapınet. `/iletisim` ile çakışmasın; kısa kurumsal hikâye.
- Dashboard’a ince yasal şerit veya hesap menüsünde «Yasal» — denetçi turu.
- Ana sayfa zaten doğru; «PayTR onayı sürecindedir» cümlesi inceleme bitince güncellenir (eski kalırsa güven aşındırır).
- Kariyer’i «iş ilanı kapısı» gibi satmam: mühür vitrini. «Teklif Kapısı» tabelası freelancer kilitliyken vatandaşı boş kapıya götürür — kopyayı «belgen hangi eğitime bağlı» diye daraltırdım.
- 5 SKU dışı taslak kursu vitrine basmam (Pedagoji zaten basmıyor).
- Unvan-faaliyet gerilimini avukat + muhasebe ile NACE/KEP üzerinden çözerdim; kodda sahte unvan icat etmezdim.

## 4.2 Bir sonraki aşamada en acil 3–5 adım

Sıra operasyonel, paralelleştirilebilir.

1. **Freelancer kamu kilidi (teknik, 1 PR):** circuit-breaker + kenar 410 + nav/dashboard/sitemap/Kariyer CTA. Test mühürlerini aynı PR’da 3 oda gerçekliğine çek. Kod silme yok.
2. **Yasal metin B2C (teknik + hukuk gözü):** `LEGAL_ACTIVITY_SCOPE_BODY` ve emanet/split paragrafları. Yürürlük tarihi. Avukat bir tur; ajan uydurma madde yazmasın.
3. **Hakkımızda + (isteğe bağlı) dashboard künye:** PayTR evrak listesi. Footer linkine ekle.
4. **Operatör canlı checklist (Vercel / PayTR / Supabase):** `ops:runtime-readiness` yeşil; Merchant üçlü canlı; sandbox/mock boş; Bildirim URL; Confirm-email; `SITE_MAINTENANCE_FREEZE` boş; `NEXT_PUBLIC_APP_URL=https://yetkin.ai`. Bu raporda secret doğrulanamadı — SUPER ADMIN koşar.
5. **Mutlu yol turu (insan):** kayıt → cüzdan/kart → bir SKU satın al → ders bitir → sınav ≥70 → sertifika `/academy/dogrula` → Kariyer damgası. `/freelancer` 410. Junior 410. Bu tur geçmeden «PayTR’ye gönderdik» denmez.

Bilerek **sonraya** bıraktıklarım: Junior, Dron mağaza, Split, kurumsal, ses/video bake, freelancer silme.

## 4.3 Platform kurgusu doğru mu? Kernel + API-First + Sürü Dron

### Ne kadar sağlıklı?

**Modüler monolit + paylaşılan çekirdek — evet, ve bu doğru seçim.** Mikroservis yok; `lib/kernel` (auth, para, PayTR, emanet kaydı, idempotency, proof port, katalog id) dikey motorlardan ayrılmış. Akademi / Kariyer / Freelancer `lib/<oda>`. Anayasa B1: web RSC yükler, Dron `/api/v1` zarf konuşur. README’nin «Shared Kernel npm paketi değil» cümlesi doğru: klasör disiplini var, ayrı deploy edilen kernel yok.

**API-First Core — kısmen.** Dron için gerçek. Amiral için değil (bilinçli). `app/api/v1` kopya ağacı yok; kenar soyar. Bu, sürü istemci için yeterli çekirdek. «Her şey API-first» iddiası abartı olur.

**Sürü Dron — tohum var, sürü yok.** `apps/rail-is` tek native istemci; hop’ların çoğu freelancer iş tahtası. Akademi satın alma dron’a yasak (`dronForbidden`). Swarm (çok ajan / çok kılıf aynı çekirdeği yer) mimari vaat; bugün tek kılıf ve o kılıf Motor 3.

Bounded context sicili (`lib/kernel/bounded-contexts.ts`): Proof / Marketplace / Payments. Temiz. Marketplace context = freelancer tabloları. B2C’de bu context **kapalı kapı** olmalı, silinmiş context değil.

### Gelecekte darboğaz olur mu?

| Darboğaz | Risk | Ne zaman acır |
|----------|------|----------------|
| 4 oda SSOT + grep test | Yüksek (hız) | Her vitrin kararı |
| Dron hop = freelancer | Yüksek (ürün) | Mağazaya çıkılırsa PayTR; Akademi native satış istenirse hop yeniden yazılır |
| Escrow + split stub çekirdekte | Düşük | Split gelince drop-in; erken açılırsa 6493 |
| Dashboard pulse 4 oda / Hobby 10s | Orta | Freelancer 410 olunca pulse’tan da kesilmeli; yoksa soğuk start hâlâ 4 SELECT |
| Kariyer←freelancer vize enum | Düşük | Split sonrası işe yarar |
| Junior’ı acele açmak | Yasal yüksek | Çocuk + veli KYC |
| Inngest’i prebuild’e bağlamak | Düşük/orta | Env unutulursa Vercel build kırılır — aslında koruma |

**Darboğaz «kernel yanlış» değil; vitrin ile gelir motorunun aynı dört odaya kilitlenmesi.** Çekirdek Akademi nakitini taşıyacak kadar sağlam. Sürü dron, Freelancer gizlenince bir süre **işsiz kalır** — bu bugün avantaj (mağaza riski yok), yarın Motor 3’te yeniden bağlanır.

Mimari notu: PayTR B2C için mimariyi yeniden yazmaya gerek yok. Gerekli olan **yüzey kompozisyonu**: üç kamu odası, bir kilitli marketplace context, tek merchant nakit hattı.

---

## Ek A — Freelancer dokunma haritası (dosya listesi)

Vatandaş / denetçi yüzeyi (önce):

- `lib/kernel/rooms.ssot.ts`
- `lib/kernel/compliance/circuit-breakers.ts`
- `lib/kernel/security/edge-api-auth.ts`
- `proxy.ts`
- `lib/copy/seo.ts` (`PRODUCT_ROOM_PATHS`)
- `app/dashboard/page.tsx`
- `components/dashboard/freelancer-pulse-widget.tsx`
- `lib/dashboard/next-best-action.ts`
- `app/career/page.tsx`
- `lib/copy/sen-voice/career.ts`
- `lib/copy/sen-voice/public.ts`
- `components/kernel/passport-stamp-list.tsx`
- `lib/copy/legal-launch.ts`
- `app/freelancer/**` (410)
- `app/api/freelancer/**`
- `app/api/client/jobs/**`
- `lib/kernel/http/v1-hops-meta.ts`

Sicil / test (aynı PR veya hemen sonraki):

- `tests/kernel/circuit-breakers-surface.test.ts`
- `tests/kernel/legal-launch-surface.test.ts`
- `tests/dashboard/*`
- `tests/freelancer/citizen-surface.test.ts`
- `tests/career/proof-portfolio-surface.test.ts`
- `scripts/verify-boundaries.ts`
- `README.md`, `.system_docs/MANIFESTO.md`, `.system_docs/OPS_RUNBOOK.md` (4 oda cümlesi)

Şimdi dokunulmaz:

- `prisma/schema/freelancer.prisma`
- `lib/freelancer/engine.ts` ve escrow çekirdeği
- `lib/kernel/payments/marketplace-split.ts`
- `archived/**`

## Ek B — Yasal URL kanonu

| Kanonik | 301 kaynak |
|---------|------------|
| `/legal/gizlilik` | `/legal/gizlilik-politikasi`, `/legal/kvkk` |
| `/legal/cerez` | `/legal/cerez-politikasi` |
| `/legal/iade` | `/legal/iade-sartlari` |
| `/legal/mesafeli-satis` | `/legal/mesafeli-satis-sozlesmesi` |
| `/legal/kullanim` | `/legal/kullanim-kosullari`, `/legal/kullanim-sartlari`, `/legal/kullanici-sozlesmesi` |
| `/iletisim` | — |
| Hakkımızda | **yok** |

## Ek C — Bu taramanın sınırı

- Canlı Vercel env ve PayTR panel bu makineden okunmadı.
- E2E tarayıcı turu bu raporda koşulmadı; yüzey testleri ve kaynak okundu.
- `archived/` ve müze davranış referansı değil.
- Hukuk yorumu mühendislik riskidir; avukat imzası değildir.

---

## Karar mühürü (8 Eylül 2026)

Bu belge teşhis olarak durur. Tedavi **Strateji A** (Junior kalıbı / yüzey kilitleme) olarak uygulandı; sicil `docs/TEDAVI_RAPORU.md`.

CEO ve SUPER ADMIN: NACE **47.91.14** ve Yapınet Ltd. Şti. sicili B2C dijital eğitim satışı ile uyumlu kabul edildi. Unvan-faaliyet gerilimi inceleme paketini durdurmaz.

*Tespit kapanmıştır. Tedavi ve onay: `docs/TEDAVI_RAPORU.md`.*
