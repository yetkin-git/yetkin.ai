# Adım 10 — Tezgâh AI Model / Kota / Domain Kilidi Tespiti

**Tarih:** 20 Kasım 2026  
**Kapsam:** `/tezgah` araç envanteri, `/api/tezgah/**`, `lib/tezgah/**`, `prisma/schema/tezgah.prisma`, `lib/kernel/ai/model-roles.ts`  
**Yöntem:** Salt okuma analizi. Kod değişikliği yok.

---

## Yönetici özeti

1. **Ortak günlük havuz:** Misafir ve üye için ücretsiz tavan **3/3**’tür; sayaç `tezgah_daily_quotas` tablosunda tutulur; pencere **Europe/Istanbul gece yarısı**dır. Araçlar arasında **ortak** düşer (Pro Studio üçlüsü hariç).
2. **Maliyet asimetresi:** Çoğu LLM aracı `LITE_STREAM` → `gemini-3.5-flash-lite` (max ~900 token). **Web Site Analizi (`tetkik`)** ise `DEEP_RESEARCH` rolü + **`gemini-4-hydrogen`** override + max **2400** çıktı tokenı ile havuzun en pahalı üyesi olmasına rağmen aynı 1 hakkı yakar.
3. **Domain kilidi yok:** `TetkikReport.host` yalnızca kamuya açık deterministik paylaşım (`/api/tezgah/tetkik/publish`) içindir; LLM tetkik üretimi domain’i kilitlemez. Aynı domain sınırsız kez (günlük 3 hakkın içinde) analiz edilebilir.

---

## 1. Tezgâh araçları ve arka plan AI modelleri

### 1.1 Katalog kimlikleri

Kaynak: `lib/tezgah/catalog.ts`

| `tool` id | Vitrin adı | `/tezgah` sekmesinde mi? | Not |
|---|---|---|---|
| `proposal` | Müşteri Teklif Yazıcı | Evet (varsayılan) | LLM |
| `tetkik` | Web Site Analizi | Evet | LLM (Hydrogen) |
| `dukkan` | Sektörel Dijital Dükkan | Evet | **Şablon**; LLM yok, kota düşer |
| `reklam` | Otonom Reklam Paketi | Evet | LLM |
| `pazaryeri` | Pazaryeri Katalog Fabrikası | Evet | LLM |
| `studio-photo` | Görsel & Ürün Stüdyosu | Evet | **İstemci şablon**; kota yok |
| `technical-drawing` | Teknik Çizim & Ölçü Şeması | Evet | **İstemci SVG**; kota yok |
| `saas-builder` | Mini SaaS & Kod Üretici | Evet | **İstemci şablon**; kota yok |
| `ecommerce` | E-Ticaret Ürün Kartı | Hayır (OS’e taşındı) | LLM; `/e-ticaret` CTA |
| `grant` | Hibe Proje Dosyası | Hayır (OS’e taşındı) | LLM; `/hibe` CTA |

Sabitler:

- `TEZGAH_GUEST_DAILY_LIMIT = 3`
- `TEZGAH_MEMBER_DAILY_LIMIT = 3`
- UI satırı: `tezgahQuotaLine(remaining, limit)` → `"Kalan ücretsiz hakkınız: X / Y"`

### 1.2 Model rol → gerçek Gemini kimliği

Kaynak: `lib/kernel/ai/model-roles.ts`

| Rol | Varsayılan model kimliği |
|---|---|
| `LITE_STREAM` | `gemini-3.5-flash-lite` |
| `DEEP_RESEARCH` | `gemini-3.1-pro-preview` (varsayılan) |
| `GEMINI_HYDROGEN_MODEL` | `gemini-4-hydrogen` (tetkik override; rol varsayılanını değiştirmez) |
| `IMAGE_GEN` | `gemini-3.1-flash-image` |

**Tezgâh’ta `IMAGE_GEN` / Imagen kullanılmıyor.** `studio-photo` fotoğraf üretmez; pazaryeri kuralı + galeri brifi markdown’ı basar (`lib/tezgah/pro/studio-photo.ts`).

### 1.3 Araç → endpoint → motor → model → token tavanı

| Araç | API | Motor | Rol / model | `maxOutputTokens` | Kota | Ortalama yük (tahmini) |
|---|---|---|---|---|---|---|
| `proposal` | `POST /api/tezgah/generate` | `lib/tezgah/engine.ts` | `LITE_STREAM` / flash-lite | 900 | Ortak havuz | Düşük: tek çağrı, ~0.5–2K prompt + ≤900 completion |
| `ecommerce` | aynı | aynı | aynı | 900 | Ortak havuz | Düşük (ürün kartı metni) |
| `grant` | `POST /api/tezgah/grant/generate` | `lib/tezgah/grant/engine.ts` | `LITE_STREAM` | 900 (dosya 1 800) | Ortak havuz | Orta-düşük; dosya yolunda daha uzun çıktı |
| `tetkik` | `POST /api/tezgah/tetkik/generate` | `lib/tezgah/tetkik/engine.ts` | `DEEP_RESEARCH` + **`model: gemini-4-hydrogen`** | **2 400** | Ortak havuz | **Yüksek:** HTML fetch + skor bağlamı + JSON karne; Hydrogen sınıfı |
| `dukkan` | `POST /api/tezgah/dukkan/generate` | `lib/tezgah/dukkan/engine.ts` | — (LLM yok) | — | Ortak havuz | **Sıfır AI maliyeti**; yine 1 hak |
| `reklam` | `POST /api/tezgah/reklam/generate` | `lib/tezgah/reklam/engine.ts` | `LITE_STREAM` | 900 | Ortak havuz | Düşük |
| `pazaryeri` | `POST /api/tezgah/pazaryeri/generate` | `lib/tezgah/pazaryeri/engine.ts` | `LITE_STREAM` | 900 | Ortak havuz | Düşük–orta (≤8 ürün) |
| `studio-photo` / `technical-drawing` / `saas-builder` | API yok | `lib/tezgah/pro/build.ts` (istemci) | — | — | **Düşmez** | Sıfır sunucu AI |
| Hibe eşleşme | `POST /api/tezgah/grant/match` | YetkinHibe deterministik | — | — | Düşmez | LLM yok |
| Kamu tetkik yayın | `POST /api/tezgah/tetkik/publish` | `lib/tezgah/tetkik/public-report.ts` | — | — | Düşmez | Deterministik skor; LLM yok |

Yardım / ödeme / arşiv (kota düşürmez):

| Endpoint | Auth | İş |
|---|---|---|
| `GET /api/tezgah/quota` | public | `peekTezgahQuota` |
| `GET/POST /api/tezgah/outputs` | session | Arşiv |
| `GET /api/tezgah/offers` | public | Pro / kredi katalog kartları |
| `POST /api/tezgah/checkout` | session | PayTR sipariş |
| `POST /api/tezgah/grant/dossier` | session | Ücretli hibe dosyası hattı |

### 1.4 Maliyet muhasebesi (iç defter)

Kaynak: `lib/kernel/ai/cost.ts`

- Prompt: **50** TRY minor / 1M token  
- Completion: **150** TRY minor / 1M token  

Bu taban Super Admin kataloğu gelene kadar muhasebe ölçüsüdür; sağlayıcı fatura satırı değildir. LLM çağrıları `billing.source = AI_TOKEN_SOURCES.TEZGAH` (`"tezgah"`) ve `recordUsage: true` ile `AiTokenUsage` defterine yazılır.

**Gelir/maliyet uyarısı:** Ortak 3/3 havuzda 1 `dukkan` (0 token) ile 1 `tetkik` (Hydrogen + 2400 tavan) aynı “hak” fiyatına satılır. Ücretsiz katmanda marjı en çok eriten araç tetkiktir.

### 1.5 İkincil hız sınırları (kota dışı)

Her LLM motoru `invokeLlm` içinde:

```text
rateLimit: { identifier: actorId, scope: "tezgah", limit: 8, windowMs: 60_000 }
```

Kenar HTTP: yolu `/generate` ile biten POST’lar `HTTP_RATE_LIMITS.llmIp` (20 / 10 dk) alır (`lib/kernel/security/http-rate-limit.ts`).  
Kamu tetkik: `tetkikPublicIp` (8 / 10 dk).  
Platform günlük AI tavanı: `budget-shield` (`DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR = 500_000`).

**Redis / cookie kota deposu yok.** Günlük Tezgâh hakkı Postgres’tedir (testte bellek Map).

---

## 2. Mevcut kota ve limit mekanizması

### 2.1 UI’da görünen `"Kalan ücretsiz hakkınız: 3 / 3"`

| Katman | Dosya | Davranış |
|---|---|---|
| Metin | `lib/tezgah/catalog.ts` → `tezgahQuotaLine` | `Kalan ücretsiz hakkınız: ${remaining} / ${limit}` |
| Portal hedefi | `app/tezgah/page.tsx` → `#tezgah-header-quota` | Sağ üst boşluk |
| Okuma | `components/tezgah/workbench.tsx` | `GET /api/tezgah/quota` → state → portal |
| API | `app/api/tezgah/quota/route.ts` | Oturum varsa üye, yoksa misafir IP |

Adım 9 ile form içindeki ikinci kota satırı kaldırıldı; tek rozet sağ üsttedir.

### 2.2 Özne anahtarı (misafir vs üye)

Kaynak: `lib/kernel/ai/assistant-guest-quota.ts` → `assistantActorId`

| Durum | `actorId` (`subjectKey`) | `guest` |
|---|---|---|
| Oturum yok | `guest:<ip>` (`resolveRequestIp`) | `true` |
| Oturum var | kullanıcı UUID | `false` |

Asistan sohbetinin `localStorage` / `guest_question_count` çerezi **Tezgâh kotasını tutmaz**; o ayrı ürün (5 soru / 24s). Tezgâh sunucu sayacıdır.

### 2.3 Kalıcı depo

Kaynak: `prisma/schema/tezgah.prisma` + `lib/tezgah/quota.ts`

```text
model TezgahDailyQuota {
  dateKey    // "YYYY-MM-DD" (Europe/Istanbul)
  subjectKey // guest:<ip> | userId
  usedCount
  @@id([dateKey, subjectKey])
  @@map("tezgah_daily_quotas")
}
```

Fonksiyonlar:

| Fonksiyon | İş |
|---|---|
| `tezgahDayKey(now)` | İstanbul gün anahtarı |
| `peekTezgahQuota` | Okur; hak düşmez |
| `consumeTezgahQuota` | Üretim öncesi +1 (veya Pro/kredi hattı) |
| `refundTezgahQuota` | Model/şablon başarısızsa `lane === "free"` iken −1 |
| `settleTezgahSlot` | Kredi hattında defter DEBIT |

Üretim sırası (tüm kota tüketen motorlarda aynı desen):

1. Validate  
2. `consumeTezgahQuota`  
3. Üret (LLM veya şablon)  
4. Boş/bozuk → `refundTezgahQuota`  
5. Başarı → `settleTezgahSlot`

### 2.4 Yenilenme ve ortak havuz

| Soru | Cevap |
|---|---|
| Günlük mü? | **Evet.** `dateKey` değişince yeni satır; `usedCount` sıfırdan. Mesajlar: “Yarın (İstanbul gece yarısı) yenilenir.” |
| Ömür boyu mu? | **Hayır.** |
| Araçlar arası ortak mı? | **Evet.** Tek `subjectKey` sayacı; `tool` kolonu yok. 1 tetkik + 1 reklam + 1 dukkan = 3/3. |
| Misafir / üye farkı (sayı) | Limit ikisinde de **3**. Fark: üye Pro veya krediye geçebilir; misafir dolunca kayıt/paywall. |

### 2.5 Lane (hat) modeli

Kaynak: `lib/tezgah/quota.ts` + `lib/tezgah/paid-lane.ts`

| `lane` | Anlam |
|---|---|
| `free` | Günlük `usedCount` artar |
| `pro` | `TezgahSubscription` ACTIVE + `expiresAt` gelecekte → sayaç artmaz, `remaining` limit gibi gösterilir |
| `credit` | Günlük bitti → `TezgahCreditBalance.remaining`; `Idempotency-Key` + hold → başarıda DEBIT |
| `prepaid` / `closed` | Kapalı / özel durumlar |

Katalog SKU’ları (fiyat `price_catalog` aktif satırından):

- Pro: `tezgah` / `pro` (30 gün)  
- Kredi paketi: `credit-pack` → **10** üretim (`TEZGAH_CREDIT_PACK_SIZE`)  
- Hibe dosyası: `grant-dossier` (ayrı ücretli hat)

### 2.6 Pro Studio istisnası

`workbench.tsx`: `quotaBlocked = blocked && !proStudio`  
`buildProStudio` tarayıcıda çalışır; `consumeTezgahQuota` çağrılmaz. İsteğe bağlı arşiv: oturumlu `POST /api/tezgah/outputs`.

### 2.7 Çıktı arşivi vs kota

- `TezgahOutput`: yalnız **oturumlu** kullanıcı; misafir yazılmaz (`recordSignedTezgahOutput`).  
- LLM tetkik sonucu arşive metin özeti olarak düşebilir; **domain kilidi tablosu değildir**.

---

## 3. Araç bazlı bağımsız kota & domain kilidi mimarisi önerisi

### 3.1 Ortak 3/3 havuzunu bozmak için dokunulacak dosyalar

Mevcut tek boyutlu sayaç `TezgahDailyQuota(dateKey, subjectKey)`. Araç (veya maliyet sınıfı) boyutunu eklemek gerekir.

#### A. Veri modeli

| Dosya | Öneri |
|---|---|
| `prisma/schema/tezgah.prisma` | `TezgahDailyQuota`’ya `toolKey` (veya `poolKey`) ekle **veya** yeni tablo `TezgahToolDailyQuota`; `@@id([dateKey, subjectKey, toolKey])` |
| Prisma migration | Yeni composite unique; eski satırlar için backfill (`toolKey = "_shared"`) veya temiz kesim |

#### B. Kota çekirdeği

| Dosya | Öneri |
|---|---|
| `lib/tezgah/catalog.ts` | Araç başına limit haritası: örn. `TEZGAH_TOOL_DAILY_LIMITS: Record<TezgahToolId, number>` veya maliyet sınıfı (`lite` / `heavy` / `template`) |
| `lib/tezgah/quota.ts` | `peek` / `consume` / `refund` imzasına `toolId` veya `poolKey`; Pro/kredi kurallarını araç bazlı fiyat/çarpan ile genişlet |
| `lib/tezgah/paid-lane.ts` | İsteğe bağlı: tetkik kredisi vs lite kredisi (farklı `unitMinor` veya farklı pack) |
| `lib/tezgah/offers.ts` + checkout | Vitrin kartlarını araç/paket diline çek |

#### C. Motorlar (consume çağrı noktaları)

| Dosya | Bugün | Değişiklik |
|---|---|---|
| `lib/tezgah/engine.ts` | ortak consume | `tool: proposal\|ecommerce` ile pool |
| `lib/tezgah/tetkik/engine.ts` | ortak | `heavy` / `tetkik` pool |
| `lib/tezgah/dukkan/engine.ts` | ortak (LLM yok) | Ayrı düşük kota veya kota dışı bırak |
| `lib/tezgah/reklam/engine.ts` | ortak | lite pool |
| `lib/tezgah/pazaryeri/engine.ts` | ortak | lite pool |
| `lib/tezgah/grant/engine.ts` | ortak | lite veya grant pool |

#### D. API + UI

| Dosya | Öneri |
|---|---|
| `app/api/tezgah/quota/route.ts` | `?tool=` ile araç bazlı snapshot **veya** tüm havuzların özeti |
| `components/tezgah/workbench.tsx` | Aktif sekmenin kotasını göster; “3/3 tüm Tezgâh” yerine “Site Analizi: 1/1” |
| `app/dashboard/load-command.ts` / `lib/dashboard/command-center.ts` | Kart metnini çoklu havuza uyarla |
| `tests/tezgah/quota.test.ts` + `*-engine.test.ts` + `surface.test.ts` | Limit mesajları ve 429 senaryoları |

#### E. Önerilen ürün ayrımı (maliyet hizası)

| Sınıf | Araçlar | Ücretsiz öneri (örnek) |
|---|---|---|
| `heavy` | `tetkik` | 1/gün **veya** domain kilidi (aşağı) |
| `lite` | `proposal`, `reklam`, `pazaryeri`, `grant`, `ecommerce` | 3/gün sınıf havuzu |
| `template` | `dukkan` | Yüksek / sınırsız (AI maliyeti 0) |
| `local` | Pro Studio üçlüsü | Kota yok (mevcut) |

### 3.2 Web Site Analizi (`tetkik`) — domain kilidi

#### Bugün ne var?

| Bileşen | Durum |
|---|---|
| `normalizeTetkikSiteAddress` (`lib/tezgah/tetkik/site-address.ts`) | URL → https, public host doğrulama |
| `inspectTetkikUrl` | SSRF / özel ağ reddi |
| LLM generate | Kota düşer; **DB’ye host kilidi yazılmaz** |
| `TetkikReport` | `host` + `url` + skor snapshot; **yalnız** `publish` yolu; `@@index([createdAt])` — **host unique yok**, kilit yok |
| `TezgahOutput.inputSummary` | Oturumlu kullanıcıda URL metni olabilir; kilit sorgusu için tasarlanmamış |

**Sonuç:** Domain geçmişi kısmen `tetkik_reports.host`’ta (paylaşım anlık görüntüleri) durur; ücretsiz LLM analizi için “bu domain daha önce ücretsiz alındı” kapısı **yoktur**.

#### Önerilen kilitleme tasarımı

1. **Normalize anahtar**  
   - `normalizeTetkikSiteAddress` → `URL`  
   - Host: `hostname.replace(/\.$/, "").replace(/^www\./, "").toLowerCase()`  
   - Kilit birimi: **eTLD+1 / registrable domain** (mümkünse) veya ham hostname (ürün kararı).

2. **Yeni tablo (önerilen)**  

```text
model TetkikDomainClaim {
  host           String   // normalize edilmiş
  subjectKey     String   // guest:<ip> | userId  — veya global host kilidi
  firstFreeAt    DateTime
  freeUsed       Boolean  @default(true)
  // isteğe bağlı: lastPaidAt, analysisCount
  @@id([host])            // global: domain başına 1 ücretsiz (aktör bağımsız)
  // alternatif: @@id([host, subjectKey]) // aktör başına 1 ücretsiz
  @@map("tetkik_domain_claims")
}
```

Ürün tercihi:

- **Global host kilidi:** Aynı `ornek-dukkan.com` platformda bir kez ücretsiz; ikinci herkes için Pro/kredi.  
- **Aktör+host:** Aynı kullanıcı/IP aynı domain’i bir kez ücretsiz; başka domainler yine ücretsiz hakkından düşer.

3. **Akış (generate Tetkik)** — `lib/tezgah/tetkik/engine.ts` içinde, `consumeTezgahQuota` öncesi veya ile atomik:

```text
normalized → hostKey
if claim.exists && unpaid_path:
  → 402/429 + Pro/kredi mesajı (hak düşmez)
else:
  consumeTezgahQuota (veya doğrudan credit/pro)
  LLM…
  on success: upsert TetkikDomainClaim
  on fail: claim yazma / kota refund (mevcut)
```

4. **Dokunulacak ek dosyalar**

| Dosya | İş |
|---|---|
| `prisma/schema/tezgah.prisma` | `TetkikDomainClaim` (+ RLS registry) |
| `lib/kernel/security/rls-policy-registry.ts` | Yeni tablo PostgREST kapalı listesi |
| `lib/tezgah/tetkik/site-address.ts` | `tetkikHostKey(url): string` export |
| `lib/tezgah/tetkik/engine.ts` | Claim gate + başarıda yazım |
| `app/api/tezgah/tetkik/generate/route.ts` | Hata kodu/mesaj yüzeyi |
| `lib/tezgah/catalog.ts` | Domain kilidi mesajı sabiti |
| `components/tezgah/workbench.tsx` / `upgrade-card.tsx` | “Bu site için ücretsiz analiz kullanıldı” CTA |
| `tests/tezgah/tetkik-engine.test.ts` | İkinci analiz / farklı domain senaryoları |

5. **Mevcut `TetkikReport` yeniden kullanımı?**  
   Uygun değil: (a) LLM metni yazılmaz, (b) publish LLM’sizdir, (c) host unique değildir, (d) ücretsiz/ücretli ayrımı yoktur. Paylaşım tablosu ile claim tablosu ayrı kalsın.

6. **Kamu `/tetkik/publish`**  
   Kota ve claim dışı bırakılabilir (deterministik, ucuz). İsterseniz abus için yalnız IP rate-limit yeterli (zaten var).

### 3.3 Uygulama sırası (öneri)

1. Tetkik’i `heavy` havuza ayır + domain claim (en yüksek maliyet sızıntısı).  
2. `dukkan`’ı template sınıfına al (AI maliyeti 0 → ortak havuzu şişirmesin).  
3. Lite araçları ortak veya araç bazlı 3’lük havuzda tut.  
4. Pro Studio’yu olduğu gibi kota dışı bırak.  
5. Dashboard + quota API’yi çoklu havuz okumasına çek.

---

## 4. Dosya haritası (hızlı referans)

```text
lib/tezgah/catalog.ts              # limit sabitleri, tool listesi, quota satırı
lib/tezgah/quota.ts                # peek/consume/refund → tezgah_daily_quotas
lib/tezgah/paid-lane.ts            # Pro / kredi / hold
lib/tezgah/engine.ts               # proposal + ecommerce LLM
lib/tezgah/tetkik/engine.ts        # Hydrogen LLM
lib/tezgah/tetkik/site-address.ts  # URL normalize
lib/tezgah/tetkik/public-report.ts # deterministik + TetkikReport persist
lib/tezgah/dukkan|reklam|pazaryeri|grant/engine.ts
lib/tezgah/pro/build.ts            # istemci Pro Studio
lib/kernel/ai/model-roles.ts       # rol → model + GEMINI_HYDROGEN_MODEL
lib/kernel/ai/assistant-guest-quota.ts  # guest:<ip>
prisma/schema/tezgah.prisma        # TezgahDailyQuota, TetkikReport, Subscription, Credit
app/api/tezgah/**                  # generate / quota / publish / checkout
components/tezgah/workbench.tsx    # UI kota + üretim rotaları
```

---

## 5. Tespit sonuçları (tek bakışta)

| Bulgu | Kanıt |
|---|---|
| UI 3/3 günlük ortak havuz | `TEZGAH_*_DAILY_LIMIT = 3`, `tezgah_daily_quotas`, İstanbul günü |
| Misafir anahtarı IP | `assistantActorId` → `guest:<ip>` |
| Cookie/Redis kota yok | Prisma store; test memory Map |
| En pahalı araç tetkik | `gemini-4-hydrogen`, 2400 token, HTML fetch |
| Dukkan AI’sız hak yer | `dukkan/engine.ts` şablon + consume |
| Pro Studio kota dışı | `buildProStudio` istemci; `!proStudio` ile block |
| Domain kilidi yok | `TetkikReport` yalnız publish; LLM generate claim yazmaz |
| Ücretli kaçış yolu var | Pro abonelik + 10’lu kredi paketi (`paid-lane`) |

Bu belge yalnızca tespittir; uygulama Adım 11+ iş paketidir.
