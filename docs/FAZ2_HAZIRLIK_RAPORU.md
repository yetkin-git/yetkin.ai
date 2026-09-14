# FAZ 2 HAZIRLIK RAPORU — Köprüleme (cüzdan hop + Redis port + T3 halka)

| Alan | Değer |
|------|--------|
| Tarih | 13 Eylül 2026 |
| Hazırlayan | Senior Software Architect / Sistem Analisti ajanı |
| Girdi | `docs/TEDAVI_RAPORU.md` (76/100) + Aşama 3 köprüleme görevi |
| Yöntem | Sıfır varsayım. Her iddia dosya yoluna bağlıdır. |
| Sonuç puan | **83/100** |
| Closed Testing | **Hazır değil** (`publishFrozenUntilFaz1Close: true` durur) |

---

## 0. Yönetici özeti

Tedavi, sürüye yazma omurgasını verdi (13 hop, `@yetkin/kernel`, 6 yazma). Bu hazırlık üç kör noktayı koda bağladı:

1. **Cüzdan yükleme hop’u** `POST /api/v1/wallet/top-up` — Bearer + `Idempotency-Key` + HMAC kasa pasaportu (`/kasa`). Dron Bearer oturumunu kaybetmeden kasayı açar; kart PayTR iFrame’de kalır (PCI). Native IAP yoktur.
2. **Redis hız tavanı portu** — `RateLimitPort.consume` async; Upstash REST bağlayıcısı fail-closed. Kısmi env veya 5xx belleğe düşmez.
3. **T3 protokol hop’ları** — müfredat ve sınav GET okuma hop’ları sicile girdi. Dron istemcisi hop’ları çağırabilir.

**Kaldırılmayan kilitler (bilinçli):** `publishFrozenUntilFaz1Close: true`, `LIVE_BROADCAST_SHUTDOWN = true`, freelancer hop 410, Split stub. Dron hâlâ iş ilanı laboratuvarıdır; Akademi oynatıcı / sınav ekranı yoktur.

Bu yüzden puan 100 değil **83**: köprü duruyor, uçak pistte. Kapalı mağaza testi (Play Closed Testing / App Store) bu haliyle **yeşil halka değildir**.

---

## 1. MOBİL CÜZDAN YÜKLEME KÖPRÜSÜ

### 1.1 Karar

Kopya `app/api/v1` ağacı açılmadı. Kenar zaten `/api/v1/...` → kanonik `/api/...` soyar (`proxy.ts` + `canonicalApiPathname`). Web-only `POST /api/wallet/top-up` **aynı handler** üzerinden v1 hop oldu.

İkinci katman: **tek oturum HMAC pasaportu**. PayTR iFrame Bearer taşımaz; Dron sistem tarayıcısında `/kasa?p=` açar. `/cuzdan` korumalı sığınaktır (kenar 307 `/login`) — pasaport sayfası oraya konamaz.

### 1.2 Sicil

Hop id: `wallet-top-up`. Meta: `packages/kernel/src/http/v1-hops-meta.ts`. Zod/OpenAPI: `lib/kernel/http/v1-contract.ts`. Handler: `app/api/(kernel)/wallet/top-up/route.ts`.

| Kilit | Nerede |
|-------|--------|
| Bearer | `v1Auth: "bearer"`; çerez-only 401 |
| `Idempotency-Key` UUID | `requireRailV1IdempotencyKey` (handler kalkanı) |
| Replay / 409 | `settleHttpIdempotency` + `buildIdempotentMerchantOid` |
| PayTR HMAC | mevcut get-token / webhook (Merchant) |
| Kasa HMAC | `lib/kernel/payments/wallet-checkout-passport.ts` — SHA-256, domain-ayrılmış derive (`exam-sitting` sırrından ayrı info string), `timingSafeEqual`, TTL 15 dk |
| 3DS dönüş | v1 istekte `merchant_ok_url` = `/kasa/donus` (korumasız); web hâlâ `/cuzdan` |

Yayınlanan gövde (sessiz düşmez): `merchantOid`, `token`, `iframeUrl`, `sandboxMode`, `alreadySettled`, `mockCheckout`, `status`, `checkoutPassportUrl`.

### 1.3 Dron yüzeyi

- `apps/rail-is/src/api/hops.ts` — `walletTopUp`
- `apps/rail-is/src/api/client.ts` — `beginWalletTopUp`
- `apps/rail-is/src/screens/WalletTopUpScreen.tsx` — tutar + fatura + iki yasal tik
- `App.tsx` — `TOP_UP_OPEN`; başarıda `Linking.openURL(checkoutPassportUrl \|\| iframeUrl)`
- `/cuzdan` köprüsü (`openWebWallet`) durur; web sığınak ayrıdır

Kart alanları native forma girmez. Pasaport HMAC; PCI kapsamı PayTR iFrame’dedir.

### 1.4 PCI / oturum dürüstlüğü

Bu köprü **“oturum kaybı yok”** iddiasını karşılar (Bearer hop + imzalı kasa URL). **“Uygulama içi kart”** iddiasını karşılamaz ve karşılamamalıdır.

---

## 2. ÖLÇEK VE GÜVENLİK — REDIS PORT

### 2.1 Arayüz

`lib/kernel/security/rate-limit-port.ts`

- `consume(...): Promise<RateLimitDecision>`
- `createFailClosedRateLimitPort()` — her zaman deny
- In-memory LRU durur (lab / Vitest)

### 2.2 Bağlayıcı (fail-closed)

`lib/kernel/security/rate-limit-runtime.ts` + `redis-rate-limit-port.ts`

| Env | Davranış |
|-----|----------|
| `RATE_LIMIT_REDIS_REST_URL` **ve** `RATE_LIMIT_REDIS_REST_TOKEN` dolu | Upstash REST `INCR` + `EXPIRE NX` |
| Yalnız biri dolu | Fail-closed (belleğe düşülmez) |
| İkisi boş | Süreç-içi bellek (CI / tek süreç) |
| REST 5xx / ağ hatası | Deny; bellek fallback **yok** |

Müze `REDIS_URL` / `ioredis` / `@upstash/redis` `rate-limit-port.ts` ve `http-rate-limit.ts` içine **girmez**. Anahtarlar `.env.example` + `lib/kernel/env.ts`.

Kenar `http-rate-limit.ts` `await applyHttpRateLimit` / `resolveRateLimitPort()` kullanır.

**Üretim notu:** İkinci Vercel instance’dan önce REST çifti doldurulmalıdır. Boş env hâlâ süreç-içi sayar — bu lab varsayılanıdır, çok instance’da yalan söylemeye devam eder.

---

## 3. SÜRÜ DRON — T3 YEŞİL HALKA CHECKLIST

Hedef zincir (görev metni): **Oturum Açma → Cüzdan Yükleme → Ders Satın Alma → Dersi Tamamlama → Sınava Girme → Sertifika Alma**.

Sicil artık **16 hop / 14 unique OpenAPI path** (GET+POST müfredat ve sınav aynı path şablonunu paylaşır).

| Adım | Hop | Dron UI | Durum |
|------|-----|---------|--------|
| Oturum | `GET /api/v1/auth/session` | `LoginScreen` | Protokol + UI yeşil |
| Cüzdan yükleme | `POST /api/v1/wallet/top-up` + HMAC `/kasa` | `WalletTopUpScreen` + sistem tarayıcısı | Protokol yeşil; kart iFrame |
| Cüzdan okuma | `GET /api/v1/dashboard/wallet-strip` | `WalletStripBanner` | Yeşil |
| Ders satın alma | `POST /api/v1/academy/courses/{id}/purchase` | **yok** | Yalnız istemci metodu |
| Müfredat oku | `GET …/curriculum` | **yok** | Hop yeni |
| Ders bitir | `POST …/curriculum` | **yok** | Hop tedavi’den |
| Sınav oku | `GET …/exam` (sertifika DTO kırpılmış; `userId` yok) | **yok** | Hop yeni |
| Sınav gönder | `POST …/exam` | **yok** | Hop tedavi’den |
| Sertifika | `GET /api/v1/academy/certificates/{hash}` | **yok** | Kamu hop |

`apps/rail-is/App.tsx` mutlu yolu: giriş → açık işler / İşlerim. `AcademyPlayerScreen` / `ExamPanel` **yoktur**. İstemci `purchaseAcademyCourse` / `completeAcademyLesson` / `submitAcademyExam` barındırır; ekran bağlanmamıştır.

### 3.1 Kilidi kaldırmak için kalan T3 maddeleri

`publishFrozenUntilFaz1Close: false` **yapılmaz** ta ki:

1. `LIVE_BROADCAST_SHUTDOWN === false` (üretim Amiral 503 değil) **veya** kapalı test staging hostuna bakıyor ve o hostta kilit yok.
2. Dron içinde Akademi oynatıcı + sınav + sertifika yüzeyi var (şu an yok).
3. Staging’de nakit halka: PayTR HMAC webhook CREDIT → satın alma DEBIT → müfredat → sınav → mühür (web T3 script’i `ops:t3-academy-loop`; Dron E2E henüz yok).
4. `ops:runtime-readiness` çıkış 0.
5. Native IAP hâlâ yok; inceleme notu HMAC `/kasa`.

Test kilidi: `tests/kernel/rail-is-dron-lab-surface.test.ts` ve `tests/kernel/faz2-t3-dron-ring-surface.test.ts` — `publishFrozenUntilFaz1Close === true` zorunlu.

---

## 4. UYUM PUANI (Tespit §3.1 / Tedavi §5 aynı ağırlıklar)

Ağırlık: sözleşme %20, auth %15, ödeme %20, veri %20, paket %15, dikey-maliyet %5, ölçek %5.

| Boyut | Tedavi | Bu hazırlık | Gerekçe |
|-------|--------|-------------|---------|
| Sözleşme-first | 90 | **93** | 16 hop, GET müfredat/sınav, top-up OpenAPI. Freelancer hâlâ yayın dışı |
| Kimlik | 70 | **72** | HMAC pasaport (cihaz oturumu değil). Refresh hâlâ SDK’da; admin tek UUID |
| Ödeme | 63 | **78** | Top-up hop + kasa HMAC. Tek PSP, Split stub, IAP yok, kart iFrame |
| Veri paylaşımı | 80 | **87** | 7 yazma + 9 okuma. 16/53 ≈ %30. Dron Akademi UI yok — kapsama protokol |
| Kernel paketlenmesi | 85 | **85** | Workspace `file:`; registry/semver botu yok |
| Dikey açma maliyeti | 80 | **80** | Hop/Zod/ROUTE_AUTH_MAP hâlâ el işi |
| Çalışma-zamanı ölçeği | 40 | **72** | Redis REST hazır, fail-closed. Prod’da zorunlu değil; boş env = bellek |

**Ağırlıklı toplam: 83/100**

Hesap: 93×0.20 + 72×0.15 + 78×0.20 + 87×0.20 + 85×0.15 + 80×0.05 + 72×0.05  
= 18.6 + 10.8 + 15.6 + 17.4 + 12.75 + 4.0 + 3.6 = **82.75 → 83**.

Tedavi 76 → **+7**. Faz 2 kapanış eşiği (~90+) için Akademi Dron UI + canlı Redis + yayın kilidi kalkışı gerekir.

---

## 5. DOĞRULAMA (bu oturumda bağlanan kapılar)

Kod / belge:

- Hop meta 16; OpenAPI unique path 14
- `requireRailV1IdempotencyKey` wallet handler
- `/kasa` + `/kasa/donus` `(public)`; kenar `next`; `robots` `/kasa` disallow
- Dron `WalletTopUpScreen` + `beginWalletTopUp`
- Redis REST port + fail-closed binder
- Runbook / ops-dron / ops-db / DRON_CLIENT_SPEC / DURUM hop sayısı 16

Test dosyaları (güncellenen + yeni): hop-gate, verify-v1-contract, kanonikleştirme, faz1 belge, rail-is lab, dron protokol, staging T4 yüzey, accept-debit, runtime-shield, idempotency yüzey, proxy-edge, `wallet-checkout-passport.test.ts`, `faz2-t3-dron-ring-surface.test.ts`, `http-rate-limit.test.ts`.

Koşulan kapılar (bu oturum):

- `npm run generate:openapi-v1` + `generate:v1-client` — `openapi-v1.json` ve `@yetkin/kernel` tipleri yazıldı
- `npm run verify:v1-contract-artifacts` — OK
- `npm run typecheck:rail-is` — OK
- `npm run verify:api-auth` — 53 rota OK (`session` 31)
- Vitest: hop-gate, verify-v1-contract, kanonikleştirme, faz1 belge, rail-is lab, runtime-shield, idempotency yüzey, proxy-edge, http-rate-limit, wallet-checkout-passport, faz2-t3-dron-ring, wallet-top-up-fail-closed, dron protokol, dron UI states, staging T4 yüzey, accept-debit, env-example, seo-surface — yeşil

Tarayıcı E2E ve gerçek PayTR 3DS bu oturumda koşulmadı (dev sunucusu + canlı kart yok; `LIVE_BROADCAST_SHUTDOWN` üretimde 503). `/kasa` pasaportsuz geçersiz metin yüzeyi tarayıcıda doğrulanmadı.

---

## 6. SEN OLSAYDIN NE YAPARDIN?

### 6.1 Bu köprülemeden sonra App Store / Google Play Closed Testing’e %100 hazır mıyız?

**Hayır.**

Hazır olan: B2C nakit protokolü (oturum, cüzdan yükleme hop’u, satın alma, müfredat/sınav yazma+okuma, sertifika). HMAC kasa, Idempotency, fail-closed kota portu.

Hazır olmayan:

1. **`LIVE_BROADCAST_SHUTDOWN = true`** — üretim host ürün 503. Kapalı test Amiral’e vurursa yeşil halka doğmaz.
2. **`publishFrozenUntilFaz1Close: true`** — EAS / store binary bilinçli yok. Testler bunu `true` kilitler.
3. **Dron Akademi UI yok** — mağaza incelemesi “uygulama içinden ders bitir / sınav ver” göremez; yalnız iş listesi + kasa formu görür. T3 zinciri **içeriden kesintisiz tamamlanamaz**.
4. **Redis prod’da opsiyonel** — ikinci instance sessiz kota deliği.
5. **Split / freelancer** hâlâ 410 — Tezgâh ekranları Dron’da durur ama hop donuk; Closed Testing’e 410 basan Tezgâh sürmek `ops-dron.md` yasağıdır.
6. **Kernel semver / ayrı deploy yok** — 426 penceresi disiplinle değil aynı commit umuduyla durur.

Closed Testing’e binary sürmek, yükleyebilen ama ders oynatamayan bir laboratuvarı mağazaya koymak olur (Tedavi §7.1 A5 dürüst yüzey).

### 6.2 Takvim — `LIVE_BROADCAST_SHUTDOWN` vs Split

Sıra **zorunlu**. Split’i yayın kilidinden önce açmak nakit SSOT’u pazaryeri emanetine bağlar; T3 B2C halkası henüz Dron’da yeşil değildir.

| Sıra | Kapı | Ne zaman |
|------|------|----------|
| 0 | Bu raporun kodu (hop 16, Redis port, `/kasa`) | Yapıldı; freeze durur |
| 1 | `npm run ops:runtime-readiness` çıkış 0 | PayTR HMAC webhook, Inngest çift anahtar, exam sitting sırrı, SMTP dürüst skip |
| 2 | **`LIVE_BROADCAST_SHUTDOWN = false`** + deploy | **Web T3 ve herhangi bir native test Amiral’e vurmadan önce.** Bu bir mağaza kararı değil; üretim 503 kilididir. Staging ayrı host ise staging’de zaten false sayılır; üretim kapalı test edilemez |
| 3 | Web T3 yeşil (`ops:t3-academy-loop`) | Kart CREDIT → akademi DEBIT → ders → sınav → mühür |
| 4 | Dron Akademi oynatıcı + sınav + sertifika UI | Protokol hop’ları zaten var |
| 5 | Staging’de Dron T3 halkası (cihaz / internal track, store değil) | Login → kasa → satın al → ders → sınav → mühür |
| 6 | **`publishFrozenUntilFaz1Close: false`** + Play Closed Testing / TestFlight | Yalnız 4–5 yeşilse. İnceleme notu: IAP yok; kart `/kasa` |
| 7 | **Split / `FREELANCER_PUBLIC_SURFACE_LOCKED`** | T3 Dron halkası yeşil **ve** idari Pazaryeri (K-5) onayından **sonra**. Tezgâh hop’ları sicile geri yazılır; 410 kalkar. Bundan önce Closed Testing’e Tezgâh binary’si sürülmez |

**Özet cümle:** Önce canlı yayın kilidi (Amiral konuşur), sonra Dron Akademi yüzeyi, sonra mağaza kapalı testi, en sonda Split. Ters sıra ya 503’e ya 410 Tezgâh’a ya da yarım T3’e mağaza incelemesi bağlar.

---

## 7. BİLİNÇLİ OLARAK YAPILMAYANLAR

- `publishFrozenUntilFaz1Close` kaldırılmadı
- `LIVE_BROADCAST_SHUTDOWN` `true` kaldı
- Freelancer hop’ları yayınlanmadı
- Native IAP / WebView kart formu eklenmedi
- Redis prod’da zorunlu kılınmadı (boş env = bellek; CI kırılmaz)
- `REDIS_URL` müze anahtarı `.env.example`’a yazılmadı
- `docs/TEDAVI_RAPORU.md` tarihsel belge olarak dokunulmadı
