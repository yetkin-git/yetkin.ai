# TESPİT RAPORU — PayTR B2C Uyumluluk, Freelancer Yalıtımı ve Genel Mimari

| Alan | Değer |
|------|-------|
| Tarih | 9 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (teknik mimar / analist, Vatandaş Lisanı) |
| Stratejik hedef | PayTR B2C onayını riske atmadan almak; platformu `/academy` odaklı B2C modele oturtmak |
| Kapsam | `app/` → `components/` → `lib/` → `prisma/` → `proxy.ts` → `tests/` → `scripts/` → `.system_docs/` + canlı yüzey taraması |

---

## ÖZET — 60 SANİYEDE DURUM

**İyi haber:** Kod tabanı PayTR B2C başvurusuna **%90 hazır**. Kritik işlerin çoğu zaten yapılmış:

- Freelancer kamu yüzeyi **zaten uykuda** (`FREELANCER_PUBLIC_SURFACE_LOCKED = true`): sayfalar, API'ler ve v1 hop'lar kenarda HTTP 410 dönüyor.
- Pazaryeri Split **kapalı** (`MARKETPLACE_SPLIT_LIVE = false`): emanet nakit akışı teknik olarak imkânsız, kabul 503.
- Banka çekim rotası **yok** (52 API route tarandı, `/api/wallet/withdraw` benzeri bir uç yok).
- Ana sayfa, yasal metinler, sitemap, Dashboard, Kariyer, Pasaport — **canlı yüzeyde pazaryeri/emanet/komisyon satışı yok**.
- Akademi satış akışı **saf B2C**: PayTR iFrame → ön ödemeli bakiye → kurs satın alma → sunucu sınavı → mühür. 6502 rıza tikleri zorunlu ve DB'ye mühürleniyor.

**Kalan %10 (bu raporun eylem listesi):** 3 küçük temizlik + 1 orta karar + canlıya çıkış kontrol listesi. Detay en altta.

> **Tek cümlelik hüküm:** PayTR başvurusunu "dijital eğitim + sınav + sertifika satan B2C platform" olarak yapın; kod bu hikâyeyi doğruluyor. Freelancer'ı silmeyin — zaten kilitli, kilidi belgeleyin.

---

## ADIM 1: PAYTR & B2C UYUMLULUK KONTROLÜ

### 1.1 PayTR entegrasyon noktaları (envanter)

**Merchant Port (Akademi / B2C tahsilat) — CANLI YOL:**

| Katman | Dosya | Görev |
|--------|-------|-------|
| Port SSOT | `lib/kernel/payments/port.ts` | `paymentsPort.merchant` + `split` ayrımı; durum okuma |
| Adaptör | `lib/kernel/payments/paytr/adapter.ts` | PayTR sağlayıcı adaptörü |
| Checkout | `lib/kernel/payments/paytr/checkout.ts` | iFrame token, üretim güvenliği (sandbox/mock throw), `user_ip` |
| Webhook parse | `lib/kernel/payments/paytr/webhook.ts` | Form parse, HMAC, IP allowlist, probe |
| Webhook settle | `lib/kernel/payments/paytr/webhook-settle.ts` | CREDIT yazımı, anomali kaydı |
| Mutabakat | `lib/kernel/payments/paytr/reconcile.ts`, `clearing.ts` | Valör taraması, PENDING→CLEARED |
| Callback guard | `lib/kernel/payments/paytr/callback-guard.ts` | Geri dönüş güvenliği |
| Mock (lab) | `lib/kernel/payments/paytr/mock-checkout.ts` | Lab'de token basar, **CREDIT yazmaz**, PENDING'i FAILED kapatır |
| Sipariş no | `lib/kernel/payments/merchant-oid.ts` | Idempotent `merchant_oid` üretimi |
| Cüzdan yükleme | `lib/kernel/payments/wallet-top-up.ts`, `quick-top-up.ts` | Tutar bandı, tekrar-kullanım kararı |
| Sipariş store | `lib/kernel/payments/prisma-order-store.ts` | `PaymentOrder` + clearing portları |
| Anomali store | `lib/kernel/payments/prisma-anomaly-store.ts` | `PaymentAnomaly` append-only kayıt |
| Durum | `lib/kernel/payments/paytr/status.ts` | Üçlü doluluk okuma |

**HTTP uçları:**

| Uç | Dosya | Auth | Not |
|----|-------|------|-----|
| `POST /api/wallet/top-up` | `app/api/(kernel)/wallet/top-up/route.ts` | session | iFrame token üretir; 6502 rıza + fatura künyesi zorunlu |
| `POST /api/payments/webhooks/paytr` | `app/api/(kernel)/payments/webhooks/paytr/route.ts` | webhook | **Kanonik CREDIT kapısı.** HMAC + tutar eşleşmesi + idempotency |
| `GET/POST /api/paytr/callback` | `app/api/paytr/callback/route.ts` | webhook | Panel Bildirim URL alias'ı; aynı handler'a re-export (ikinci CREDIT ağzı değil) |

**Kenar (edge) muafiyetleri** (`proxy.ts`): PayTR bildirim yolları JWT / Origin / rate-limit / bakım kenarını atlar — imza handler'dadır. Doğru tasarım; bildirim kaçırılmaz.

**Güvenlik özeti (denetlendi, sağlam):**
- HMAC: `merchant_oid + merchant_salt + status + total_amount`, timing-safe karşılaştırma. İmza geçersiz → 403, CREDIT yok.
- Tutar eşleşmesi: `total_amount === amountMinor` değilse clearing yok.
- Mükerrer koruma: `payment_orders FOR UPDATE` + `LedgerEntry.idempotency_key` unique (`wallet-top-up:{oid}`) + `CLEARED` kısa devresi.
- Üretimde `PAYTR_SANDBOX` veya `PAYTR_ALLOW_MOCK_CHECKOUT` doluysa **throw** (sessizce yok sayılmaz).
- `user_ip`: XFF sağdan sayım, `TRUSTED_PROXY_HOPS` (canlı reçete 2 = Cloudflare→Vercel). Loopback/RFC1918/IPv6 → get-token fail-closed.
- Valör: PSP doğrulaması olmadan PENDING'e kör CREDIT yok; Inngest'e defer edilemezse `OK` dönülmez (PayTR tekrarlar).

**Split Port (Freelancer emaneti) — KAPALI:**

| Dosya | Durum |
|-------|-------|
| `lib/kernel/payments/marketplace-split-live.ts` | `MARKETPLACE_SPLIT_LIVE = false` (tek bayrak, client-safe) |
| `lib/kernel/payments/marketplace-split.ts` | `beginHold` / `settle` → dürüst `{ ok: false, reason: "not_configured" }` |

Sonuç: Split bağlı değilken **emanet nakdi teknik olarak doğamaz**. Kabul uçları 503 döner. Bu, PayTR'ye "pazaryeri parası tutmuyoruz" demenin kod kanıtıdır.

### 1.2 Pazaryeri / B2B2C çağrışımı taraması

**Canlı kullanıcı yüzeyi (PayTR incelemecisinin göreceği yerler): TEMİZ.**

| Yüzey | Sonuç |
|-------|-------|
| Ana sayfa (`/`) | Tek CTA: "Eğitimleri İncele" → `/academy`. Freelancer/pazaryeri/emanet yok. Güven kartı: kimlik + PayTR iFrame + sunucu mühür |
| Yasal metinler (`/legal/*`, 5 sayfa) | "Pazaryeri, escrow, komisyon, hakediş, işveren" kelimeleri **sıfır**. Faaliyet: "dijital eğitim ve yetkinlik platformu (B2C)". Üç oda sayılır: Panel, Akademi, Kariyer |
| Sitemap | `/`, `/academy`, `/career`, kurslar, yasal sayfalar. **`/freelancer` yok** (`PRODUCT_ROOM_PATHS = ["/academy", "/career"]`) |
| Robots | Allow: `/`, `/legal`, yasal yollar. Sitemap: `https://yetkin.ai/sitemap.xml` |
| Dashboard | Freelancer widget'ı kilitliyken **render edilmiyor** (2 sütunlu ızgara) |
| Kariyer | Freelancer CTA kilitliyken render edilmiyor |
| Pasaport | Freelancer CTA kilitliyken render edilmiyor |
| `/freelancer` ve altı | Kenarda **HTTP 410** + "Bu oda üretimde kapalı. Çalışan ürün Akademi'dir." |
| `/api/freelancer/*`, `/api/client/jobs/*` | Kenarda **HTTP 410** (okuma dahil) |
| `/api/v1/freelancer/*` | Kanonik yola rewrite öncesi 410 (soyulmuş path `isFrozenRoomApi`'ye takılır) |
| SEO meta | `PAGE_SEO.freelancer` girdisi diskte duruyor ama sayfa 410 olduğu için indexlenmez (temizlik maddesi, kritik değil) |

**Kod-içi referanslar (kullanıcı görmez, ama bilinmeli):**

| Yer | İçerik | Risk | Öneri |
|-----|--------|------|-------|
| `lib/freelancer/*` (27 dosya) | İlan/teklif/sözleşme motoru, `escrow-refund.ts`, `dispute-engine.ts` | Yok (çalıştırılamaz: API 410 + split kapalı) | **Silme.** Kilit + testler bunu varsayıyor |
| `app/freelancer/*` (4 sayfa) | İlan panosu, ilan detayı, sözleşme, yeni ilan | Yok (kenar 410) | Silme; "uyku" hali bu |
| `app/api/freelancer/*`, `app/api/client/jobs/*` | ~15 route | Yok (kenar 410) | Silme |
| `lib/kernel/http/v1-contract.ts` + `openapi-v1.json` | **"Marketplace" tag + 8 freelancer hop sözleşmede duruyor** | **DÜŞÜK-ORTA** — OpenAPI belgesi public'e servis ediliyorsa PayTR/BDDK sorusu doğurur | **Eylem 1:** belgeyi public'ten kaldırın VEYA freelancer hop'larını sözleşmeden düşürün (bakınız Adım 2.3) |
| `components/ui/icons.tsx` | `pazaryeri: IconStore` ölü anahtar | Yok (görünmez) | Fırsat bulunca sil |
| `lib/copy/sen-voice/freelancer.ts` | "Teklif Ver", "İşveren", "Platform payı" metinleri | Yok (410 sayfada, kullanıcı ulaşamaz) | Silme; Faz 2'de lazım |
| Inngest job'ları | `escrow-timeout-scan`, `escrow-ttl-warn` kayıtlı | Yok (oluşamayan hold'u tarar; hold oluşamaz) | Log gürültüsü izlensin; dokunma |
| `scripts/ops-t4-freelancer-loop.ts` | T4 lab runner | Yok (lab scripti) | Dokunma |
| `LEGAL_ENTITY.iban` | Şirketin kendi IBAN'ı (künye) | Yok — ama "IBAN" kelimesi yasal sayfalarda geçer | PayTR'ye: "kurumsal künye bilgisidir, kullanıcı IBAN'ına ödeme yapılmaz" cümlesi hazır olsun |

**Kelime taraması notu:** `withdraw`, `/api/wallet/withdraw`, "GİB paneli", "çekim" rotası kodda **yok**. Anayasa A2 yasağı fiilen korunuyor.

### 1.3 Akademi satış ve ödeme akışı — B2C uygunluk denetimi: UYGUN

Akış (uçtan uca okundu, doğrulandı):

```
1. /cuzdan → 6502 tikleri (mesafeli + ön bilgi + anında ifa) + fatura künyesi
2. POST /api/wallet/top-up → PayTR iFrame token (tek çekim, no_installment)
3. Kullanıcı kartı PayTR sayfasında girer (kart no platformda TUTULMAZ — CSP frame-src paytr.com)
4. PayTR → Bildirim URL (HMAC) → PaymentOrder CLEARED + LedgerEntry CREDIT (idempotent)
5. /academy/[slug] → "Eğitimi Satın Al" → fiyat kilidi (15 dk) → POST .../purchase
6. Atomik settlement: kullanıcı DEBIT + hazine CREDIT + purchase + kilit tüketimi (tek $transaction)
7. /academy/[slug]/oyna (satın almayan redirect) → dersler → sunucu sınavı (baraj 70)
8. Sertifika: SHA-256 (userId·courseId·attemptId·score·issuedAt·curriculumSeal) → /academy/dogrula/[hash] (public, oturumsuz)
```

**B2C uygunluk kontrol listesi:**

| Kriter | Durum |
|--------|-------|
| Tekil hizmet satışı (eğitim) | ✅ Kurs bazlı `AcademyPurchase`, 365 gün lisans |
| Üçüncü şahsa para aktarımı | ✅ Yok — DEBIT hazineye (şirket geliri), ustaya dağıtım yok |
| Pazaryeri split / emanet | ✅ Kapalı (`not_configured` → 503) |
| Nakit çekim | ✅ Yok |
| Tüketici bilgilendirmesi (6502) | ✅ Ön Bilgilendirme + Mesafeli Satış + anında ifa rızası; tiksiz tahsilat reddedilir; rıza `PaymentOrder` satırına mühürlenir (`consentVersion 2026-09-05`) |
| Cayma istisnası anlatımı | ✅ `/legal/iade` + `/legal/mesafeli-satis`: dijital içerik anında ifa, m.15 istisnası, çifte iade yok |
| Fiyat şeffaflığı | ✅ KDV dahil, kasada "+KDV" yok, 15 dk fiyat kilidi, katalog Super Admin'de (kodda sabit fiyat yok) |
| Fatura | ✅ "Kayıtlı e-postaya iletilir; otomatik e-Arşiv paneli değildir" — dürüst ifade |
| Uyuşmazlık | ✅ Tüketici Hakem Heyeti / Tüketici Mahkemesi (6502 m.68/73) yazılmış |
| 18+ | ✅ Kayıt tiki + yasal metinler |
| KVKK | ✅ Aydınlatma + çerez + m.11 manuel süreç (`destek@yetkin.ai`) |

**Cüzdan modeli notu (PayTR başvuru dili için önemli):** Platform "cüzdan" kelimesini kullanıyor. 6493 açısından bu **kapalı devre ön ödemeli bakiye**dir: dışarı transfer yok, nakit çekim yok, bakiye yalnız şirketin kendi dijital hizmetine harcanır. Elektronik para / ödeme hizmeti sayılmaz. Ancak başvuru metinlerinde ve PayTR görüşmesinde "cüzdan" yerine **"ön ödemeli bakiye / ön ödeme"** dilini kullanın; "Cüzdan Yükleme" işlem adı da bu çerçeveyle tutarlı. Kodda kelime değişimi gerekmez (maliyet/fayda negatif), ama **başvuru dilekçesi bu tanımı açık yazmalı**.

---

## ADIM 2: FREELANCER MODÜLÜNÜN YALITILMASI

### 2.1 Envanter (tam liste)

**Frontend sayfaları (4 + yardımcılar):**

| Sayfa | Dosya | Kamu durumu |
|-------|-------|-------------|
| İlan panosu | `app/freelancer/page.tsx` | 410 |
| Yeni ilan | `app/freelancer/new/page.tsx` | 410 |
| İlan detayı | `app/freelancer/jobs/[id]/page.tsx` | 410 |
| Sözleşme | `app/freelancer/contracts/[id]/page.tsx` | 410 |
| Yükleniyor/error iskeletleri | `app/freelancer/**/loading.tsx`, `error.tsx` | 410 ile birlikte ölü |
| Bileşenler (~25) | `components/freelancer/*` (job-list, bid-form, accept-bid-button, escrow-hold-steps, dispute-console, squad-*, direct-offer-*, contract-chat-console, revision-tracker…) | Sayfa 410 olduğundan render olmaz |

**API route'ları (~15):**

| Grup | Uçlar | Kamu durumu |
|------|-------|-------------|
| İlanlar | `GET/POST /api/freelancer/jobs`, `GET/DELETE /api/freelancer/jobs/[id]`, `POST .../[id]/bids`, `POST .../[id]/accept` | 410 |
| Sözleşmeler | `GET /api/freelancer/contracts`, `GET .../[id]`, `POST .../[id]/messages`, `POST .../release`, `POST .../refund`, `POST .../dispute` | 410 |
| Uydular | `POST /api/freelancer/squad`, `/api/freelancer/direct-offers*` (4 uç) | 410 (kenar) + handler'da ikinci 410 (`FREELANCER_SATELLITE_GONE`) |
| İşveren okuma | `GET /api/client/jobs/[id]/bids` | 410 |
| Dron v1 | 8 hop (`freelancer-jobs`, `client-job-bids`, `freelancer-bid`, `-accept`, `-contracts`, `-delivery`, `-release`, `-refund`) | Sözleşmede durur, kenarda 410 |

**Veritabanı tabloları (7 + çekirdek emanet):**

| Tablo | Rol | Dokunulmalı mı? |
|-------|-----|-----------------|
| `freelancer_jobs` | İlanlar | Hayır |
| `freelancer_bids` | Teklifler | Hayır |
| `freelancer_contracts` | Sözleşmeler (gross/hold/net + bps) | Hayır |
| `freelancer_disputes` | 2 turlu tahkim | Hayır |
| `freelancer_contract_messages` | Teslim/revizyon mesajları | Hayır |
| `freelancer_squads` + `freelancer_squad_members` | Proje takımları | Hayır |
| `escrow_holds` (çekirdek) | Emanet kilidi (PSP referanslı, bakiye değil) | Hayır |
| Tohumlar | `FREELANCER_JOB_SEEDS` + `20260814110000_freelancer_job_seed.sql` | Hayır (örnek ilanlar; vitrin değil) |

**Kilit mekanizması (3 katman, defense-in-depth):**
1. **Kenar:** `proxy.ts` → `isFrozenRoomApi()` + `decideEdgeAction()` → sayfa/API 410 (`lib/kernel/compliance/circuit-breakers.ts`, `lib/kernel/security/edge-api-auth.ts`, `edge-guard.ts`).
2. **Nakit:** `MARKETPLACE_SPLIT_LIVE=false` + stub port → hold/settlement imkânsız, accept 503.
3. **UI:** Dashboard/Kariyer/Pasaport CTA'ları `FREELANCER_PUBLIC_SURFACE_LOCKED` ile koşullu render.

### 2.2 "Uykuya alma" durumu: ZATEN UYKUDA

Beklenenin aksine, **yapılacak bir kapatma işi yok**. Modül Junior üretim kilidi kalıbıyla (`JUNIOR_PRODUCTION_LOCKED` ile aynı desen) pasife alınmış:

- Kullanıcı `/freelancer`'a giderse: 410 + dürüst açıklama ("Çalışan ürün Akademi'dir").
- API'ye vurursa: 410 JSON.
- Dron v1'den denerse: 410.
- Kabul yazısı: 503 "Ödeme henüz bağlanmadı".
- Nav/sitemap/Dashboard: Freelancer yok.

**Kırılma riski:** Sıfır. Kilit `true` iken hiçbir canlı akış Freelancer'a bağımlı değil. Kariyer vize sistemi Akademi mühründen beslenir (Freelancer release'inden değil — release zaten nakit doğurmaz).

### 2.3 Kırılmasız devre dışı bırakma — kalan temiz adımlar

Kod silmeyin. Aşağıdaki 4 küçük adım "uyku"yu belgelendirir ve PayTR dosyasını güçlendirir:

| # | Adım | Dosya | Efor |
|---|------|-------|------|
| 1 | **OpenAPI/v1 kararı:** `Marketplace` tag + 8 freelancer hop'u ya (a) `v1-hops-meta.ts` + `v1-contract.ts`'ten düşürün (önerilen; dron donuk, sözleşme küçülür) ya da (b) `openapi-v1.json`'un public servisini kapatın. Hangisi olursa olsun `generate-openapi-v1 --check` ve `generate:v1-client` testleri güncellenmeli | `lib/kernel/http/v1-hops-meta.ts`, `v1-contract.ts`, `openapi-v1.json`, `scripts/generate-openapi-v1.ts` | Orta (yarım gün) |
| 2 | SEO artığı: `PAGE_SEO.freelancer` girdisini kaldırın (410 sayfanın metası sahipsiz kalmasın) | `lib/copy/seo.ts` | 5 dk |
| 3 | Ölü ikon anahtarı: `pazaryeri` key'ini silin | `components/ui/icons.tsx` | 5 dk |
| 4 | Ops notu: Runbook §12 "çalışan 4 oda" cümlesi ile kilit arasındaki ilişkiyi tek satırla netleştirin ("Freelancer motoru durur, kamu yüzeyi 410 — PayTR B2C") | `.system_docs/OPS_RUNBOOK.md` | 5 dk |

**Yapılmayacaklar (kırılma yaratır):**
- `lib/freelancer/*` silmek → ~40 test dosyası + `bounded-contexts` + v1 sözleşme patlar.
- `prisma/schema/freelancer.prisma` tablolarını DROP etmek → migration + RLS + seed zinciri kırılır; Faz 2'de geri dönüş maliyeti yüksek.
- `archived/` veya `yetkin_muze/`'ye dokunmak → 410 envanter disiplini bozulur.

---

## ADIM 3: ACADEMY ODAKLI GELECEK + DEPLOY SAĞLIĞI

### 3.1 `/academy` teknik durum: SATIŞA HAZIR

| Başlık | Durum | Detay |
|--------|-------|-------|
| Vitrin | ✅ | 5 compact SKU (`01_office_ai` … `05_prompt_practice`), kanon 13 başlık; vitrin-dışı slug 404; sitemap'te kurs URL'leri + kapak görselleri |
| Fiyat | ✅ | Super Admin kataloğu SSOT; kodda sabit fiyat yok; KDV dahil etiket; 15 dk kilit |
| Satın alma | ✅ | Oturum + Idempotency-Key + 6502 rıza + fatura künyesi; atomik settlement; native/IAP kapalı (403 defense-in-depth) |
| İçerik erişim | ✅ | `/oyna` satın alma şartlı (redirect); müfredat ingest'li; ders tamamlama + okuma mührü |
| Sınav | ✅ | Sunucu puanlı, baraj 70, oturum MAC mühürlü (`ACADEMY_EXAM_SITTING_SECRET`); istemcide puan hesabı yok |
| Sertifika | ✅ | SHA-256 bütünlük kaydı; satın alınamaz; public doğrulama (`/academy/dogrula/[hash]`); iptal (revoke) ops scripti var |
| Sesli anlatım | ✅ (amiral) | `01_office_ai` 6/6 mühürlü WAV; karaoke yalnız mühürlü derste; canlı TTS yok (`generateSpeech`/`listen` 410) |
| Yetkilendirme | ✅ | Katalog public; satın alma/oynatıcım/sınav session; fiyat yazımı Super Admin; IDOR testleri prebuild'de |
| Makbuz e-postası | ⚠️ **EKSİK** | SMTP kanalı freelancer beşlisine bağlı; Akademi satın alma makbuzu yok (Runbook'ta "ayrı iş" diye işaretli). PayTR şartı değil ama B2C güveni için ilk iş |

**Junior notu (önemli netleştirme):** Kodda "Junior" = 18 yaş altı / veli doğrulamalı çocuk odasıdır ve **üretim kilitlidir** (`JUNIOR_PRODUCTION_LOCKED`, `archived/app/junior`, kenar 410). Eğer hedefiniz "gençlere/başlangıç seviyesine eğitim" ise, bu ayrı bir oda değil **Akademi içi seviye paketidir** (Pedagoji §F.3: Temel/Orta/İleri bağımsız paket). Junior odasını açmak; veli onayı + hukuki altyapı + EİDS-benzeri kilitler ister — **PayTR B2C hedefiyle çelişir, açmayın.** "Academy/Junior odağı" cümlenizdeki Junior, Akademi'nin başlangıç seviyesi olarak okunmalı.

### 3.2 Deploy sağlığı (Vercel / Supabase / GitHub)

**Repo durumu (okunan):**

| Başlık | Durum |
|--------|-------|
| Build zinciri | `prisma generate` → `generate:v1-client` → `verify:prebuild` → `next build`. Prebuild: sır taraması, amount-minor, RLS durumu, v1 sözleşme artefaktları, IDOR mühürleri, runtime-readiness. Sağlam ve B2C-dostu (mali/yasal kapılar build'i kırar, stil taramaları kırmaz) |
| `vercel.json` | Yok — varsayılan Next.js build. Sorun değil; env'ler Vercel secret store'dan |
| `proxy.ts` (Next 16) | Tek edge girişi; müze 404, `/kayit` 308, 410, auth-307, JWKS/HS256, nonce CSP, rate-limit, v1 rewrite. Olgun |
| Gizli dosya | `.env*`, `*.pem`, `service_role` anahtarı repo'da yok (`verify:no-secrets` prebuild'de) |
| Testler | Vitest (birim) + frozen + pg-lab + Playwright e2e. `test` scripti surface testlerini dışlar (hız); `test:all` tam |
| Dron (`apps/rail-is`) | `publishFrozenUntilFaz1Close: true` — Amiral build'inden dışlanmış (`outputFileTracingExcludes`). Yayın hattı donuk, doğru |

**Canlıya çıkış kontrol listesi (sıralı, Runbook §13 + bu rapor):**

| # | Kontrol | Beklenen | Atlanırsa |
|---|---------|----------|-----------|
| 1 | `DATABASE_URL` = pooler `:6543`, kullanıcı `postgres.<ref>` | Health 200 | `Veritabanı erişilemez` 503 |
| 2 | `DIRECT_URL` = direct `:5432` + `npm run ops:migrate` | Migrate yeşil | Şema/RLS/tohum eksik |
| 3 | `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY`; Confirm email AÇIK | Kayıt → e-posta onayı → panel | Çöp hesaplar `/login`'den girer |
| 4 | `SUPER_ADMIN_USER_ID` | Admin kataloğu yazılabilir | Kimse admin değil (güvenli varsayılan) |
| 5 | PayTR canlı üçlü + `PAYTR_SANDBOX` **boş** + mock **boş** | `checks.payments=configured` | Throw (bilerek) veya `missing_credentials` |
| 6 | Panel Bildirim URL = `https://yetkin.ai/api/paytr/callback` | İlk CREDIT doğar | Bakiye boş kalır (en yaygın canlı hatası) |
| 7 | `TRUSTED_PROXY_HOPS=2` | `user_ip` gerçek IPv4 | PayTR token reddi |
| 8 | `ACADEMY_EXAM_SITTING_SECRET` ≥16 karakter | Sınav açılır | Sınav 503 (site ayakta) |
| 9 | Inngest çift anahtar | Serve açık, valör/TTL çalışır | `/api/jobs/inngest` 503; webhook defer edilemez |
| 10 | `NEXT_PUBLIC_APP_URL=https://yetkin.ai` + Redirect URL'ler | Auth callback çalışır | Giriş/kayıt kırık |
| 11 | `SITE_MAINTENANCE_FREEZE` **boş** | Site açık | Ürün 503 |
| 12 | İlk canlı tanık: `PaymentOrder=CLEARED` + `LedgerEntry CREDIT wallet-top-up:{oid}` (₺10–20 bandı) | Nakit halkası kanıtlı | "Bağlı" varsayımı ile açılış |

**Risk değerlendirmesi:** Build/env mimarisi olgun; risk **kodda değil operasyonda** (madde 5–6–7, klasik ilk-canlı hataları). Runbook §2 (Direct Port IPv6 tuzağı) ve §4.3 (user_ip) bu yüzden kritik — operatör bu iki bölümü satır satır uygulamalı.

---

## ADIM 4: DOKÜMAN SORGULAMA (ANAYASA, MANIFESTO, PEDAGOJİ)

Okunan: `.system_docs/ANAYASA.md` (A+B katmanı), `MANIFESTO.md`, `PEDAGOJI.md`, `OPS_RUNBOOK.md`, `README.md`, `STORAGE_CONTRACT.md` (özet).

### 4.1 Kurallar B2C/Akademi dönüşümüyle çelişiyor mu? HAYIR — TAM TERSİ, ZEMİN HAZIR

| Belge | Hüküm | B2C ile ilişki |
|-------|-------|----------------|
| Anayasa A2 | Merchant/Split ayrımı, S43, fail-closed | PayTR B2C'nin **hukuki kod karşılığı**. Kaldırılması teklif dahi edilemez |
| Anayasa A1 | `amountMinor`, tek defter, append-only | Mali denetime hazır altyapı; B2C'yi engellemez |
| Anayasa A4 | Sunucu sınav + mühür, baraj 70 | "Kanıt satıyoruz" vaadinin temeli |
| Anayasa A5 | Sahte bakiye/onay yasağı | PayTR incelemesinde güven verir |
| Anayasa B1–B5 (Eylül 2026 reformu) | Grep polisliği kaldırıldı, monolit esnekliği | Geliştirme hızı açılmış; B2C sprint'ini engelleyen katman duvarı yok |
| Manifesto Motor 1 | "B2C Akademi satışları (Hemen/Gün 0)" | Stratejinizle **birebir aynı cümle** |
| Manifesto Motor 3 | "Faz 2 — Split sonrası; bugün 503" | Freelancer erteleme kararınızın yazılı hali |
| Pedagoji Aşama 1 | Compact makale = yayın standardı | 5 SKU'nun bugünkü hali; sinema "sonra gelir" — hızlı canlıya geçişle uyumlu |

### 4.2 "Kendi ipimizde boğulma" maddeleri var mı? DÜRÜST CEVAP: 3 SÜRTÜNME NOKTASI

Eylül 2026 reformu büyük dogmaları temizlemiş (grep yasakları, kelime avı testleri, katman duvarları → esnek B katmanı). Kalanlar:

| # | Madde | Sorun | Öneri |
|---|-------|-------|-------|
| 1 | **Prebuild'de IDOR test paketi** (`verify:idor-seals` → 6 test dosyası her build'de) | Güvenlik için doğru, ama build süresini uzatır; acil hotfix'te sürtünme | Dokunma — B2C güveni buna değer. Hotfix prosedürü olarak Vercel "redeploy without build cache" yerine öncelikli kuyruk kullanın |
| 2 | **v1 sözleşme artefakt kontrolü** (`verify:v1-contract-artifacts`) her build'de | Dron donukken (`publishFrozenUntilFaz1Close`) 16 hop'luk sözleşmeyi her build'de mühürlemek yük; üstelik 8'i kilitli freelancer hop'u | **Eylem 1 ile birleştirin:** freelancer hop'ları düşünce sözleşme 8 hop'a iner, yük azalır. Dron açılana kadar kontrolü nightly'e almayı tartışın (karar sizde) |
| 3 | **"5 SKU vitrin disiplini" + 13 başlıklı kanon** | Pazarlama "13 eğitim!" demek isteyebilir; kod 5 satar. Bu bir çelişki değil, dürüstlük — ama ekip içinde sürekli anlatım ister | Pazarlama dilini kilitleyin: "5 yayında eğitim + her ay yeni". Kanon 13, yol haritasıdır, vitrin değil |

**Boğulma riski taşımayan ama yanlış anlaşılabilen maddeler:** `amountMinor` dogması (doğru — float para finansal intihardır), 410 disiplini (doğru — ölü yüzeyden iyidir), Super Admin fiyat SSOT'u (doğru — PayTR tutarlılığı için şart).

---

## ADIM 5: DÜŞÜNCE & TAVSİYE

### 5.1 SEN OLSAYDIN NE YAPARDIN?

**Freelancer'ı erteleyip Akademi'ye yüklenmek doğru karar — ben de aynısını yapardım.** Gerekçeler:

1. **Soğuk başlatma matematiği:** Pazaryerinde işveren sıfırsa freelancer gelmez, freelancer yoksa işveren gelmez. İki taraflı pazarı sıfırdan ısıtmak 6–12 ay + pazarlama bütçesi ister. Akademi'de ise tek taraflı satış var: içerik hazır → müşteri alır. Nakit döngüsü günler içinde başlar.
2. **Lisans maliyeti:** 6493 + PayTR Pazaryeri Split = alt satıcı onboarding'i, ayrı sözleşme, ayrı denetim, komisyon stopajı muhasebesi. B2C Merchant = standart sanal POS. İkincisi haftalar, birincisi aylar sürer.
3. **Kanıt zinciri sırası:** Platformun tezi "mühür kapıyı açsın". Mühür (Akademi) olmadan kapı (Freelancer vize kapısı) anlamsız. Önce mühür basan kullanıcı tabanı, sonra kapı. Sıralama doğru.
4. **Kod zaten bu kararı vermiş:** `MARKETPLACE_SPLIT_LIVE=false`, `FREELANCER_PUBLIC_SURFACE_LOCKED=true`, Manifesto "Motor 3 Faz 2". Kararınız kodu takip ediyor, koda karşı gelmiyor — en ucuz karar türü.

**Öncelik sıram (olsaydım):** (1) PayTR canlı + ilk gerçek satış, (2) Akademi makbuzu + SMTP, (3) SEO/içerik (5 SKU'nun her dersi indexlenebilir bilgi), (4) ikinci 5 SKU (kanon 06–10), (5) Split başvurusu ancak aylık tekrarlayan Akademi geliri varken.

### 5.2 PAYTR ONAYINDAN SONRAKİ İLK 3 TEKNİK ADIM

| Sıra | Adım | Neden ilk? | Efor |
|------|------|------------|------|
| **1** | **T3 nakit halkasını canlıda yeşile boyayın:** canlı üçlü → Bildirim URL → ₺10–20 gerçek yükleme → `01_office_ai` satın alma → sınav → `/dogrula`. Tanık: `PaymentOrder=CLEARED` + `LedgerEntry CREDIT` | "Bağlı" varsayımıyla açılış yapmak en pahalı hata. Bu halka yeşil değilse site vitrinde kalmalı, satışa açılmamalı | 1 gün (operasyon) |
| **2** | **Akademi satın alma makbuzu + SMTP'yi bağlayın** (`NOTICE_SMTP_HOST` + `NOTICE_MAIL_FROM` + makbuz şablonu) | B2C güveni = "param nereye gitti" cevabı. Şu an makbuz yok; ilk iade talebinde manuel e-posta yazarsınız. PayTR chargeback'lerinde makbuz kanıttır | 2–3 gün |
| **3** | **Eylem 1 (v1/OpenAPI freelancer temizliği) + SEO artığı temizliği** | PayTR sonrası BDDK/denetim bakışı her zaman gelebilir; sözleşme belgesinde "Marketplace" tag'i soru işaretidir. Temiz sözleşme = temiz dosya | Yarım–1 gün |

### 5.3 PLATFORM KURGUSU DOĞRU MU? (Amiral Gemisi + Sürü Dron)

**Dürüst cevap: Amiral gerçek, Sürü kâğıt üzerinde — ve bu şu an doğru.**

| Parça | Durum | Kanıt |
|-------|-------|-------|
| **Amiral (modüler monolit)** | ✅ Gerçekten uygulanmış | `bounded-contexts.ts` (proof/marketplace/payments), `rooms.ssot.ts`, `RAIL_CONTEXT_PRISMA_MODELS`, oda başına `lib/<oda>` + `app/<oda>` + test. Disiplinli |
| **Shared Kernel** | ✅ Gerçek | `lib/kernel/*`: para, defter, auth, escrow kaydı, pricing, idempotency, RLS. Dikeyler yazmaz, porttan geçer (`proofMustNotWriteLedger` vb. yasaklar testli) |
| **Dış sözleşme (`/api/v1` zarf)** | ⚠️ Yarı-gerçek | Zarf + hop sicili + OpenAPI + dron client üretimi var ve testli. Ama 16 hop'un 8'i kilitli odaya ait; tek tüketen dron donuk. Sözleşme şu an "geleceğe yazılmış çek" |
| **Sürü Dron** | 📄 Kâğıt üzerinde | `apps/rail-is`: `publishFrozenUntilFaz1Close`, Amiral build'inden dışlanmış, mağaza yayını yok. Tek dron bile uçmuyor; "sürü" vizyon cümlesi |

**Aksayan / basitleştirilecek yerler:**

1. **V1 sözleşmesi kilitli odayı satıyor** (yukarıda Eylem 1). 8 hop düşünce sözleşme Amiral'in gerçek dış yüzeyine iner: health, session, wallet-strip, academy-*, career-*. Bu, "kâğıt sözleşme" eleştirisini bitirir.
2. **Dron donukken dron-özel kod yükü:** `v1-hop-gate`, `dronForbidden`, 426 sürüm kapısı, `DRON_CLIENT_SPEC` — hepsi doğru mühendislik ama bugün sıfır kullanıcıya hizmet ediyor. Silmeyin (Faz 2'de altın değerinde), ama **yeni dron işi açmayın**; her dron saati Akademi'den çalınmış saattir.
3. **İsimlendirme borcu:** `yetkin-rail`, `Rail`, `Diyar A/B`, `Tezgâh` gibi iç isimler kodun her yerinde; kamu markası `yetkin.ai`. İç tutarlılık var, dış sızıntı yok (kontrol edildi) — ama yeni geliştirici onboarding'inde sözlük gerekir. Tek sayfalık `docs/SOZLUK.md` (Rail=platform çekirdeği, Amiral=web, Dron=mobil, Tezgâh=freelancer çalışma alanı…) yazın.
4. **Monolit sınırları sağlıklı:** B1 reformu sonrası yapay duvar yok; `verify:boundaries` + ESLint + tip sistemi yeterli. Mikro-servise bölünme konuşması **yasaklanmalı** — aylık 1M istek altında monolit her zaman kazanır.

---

## EYLEM LİSTESİ (ÖNCELİKLİ)

### Kritik (PayTR dosyası için)
- [ ] **E1.** v1/OpenAPI freelancer temizliği: 8 hop'u sözleşmeden düşür VEYA `openapi-v1.json` public servisini kapat (`lib/kernel/http/v1-hops-meta.ts`, `v1-contract.ts`, `scripts/generate-openapi-v1.ts` + testler)
- [ ] **E2.** PayTR başvuru dilekçesi dili: "kapalı devre ön ödemeli bakiye + dijital eğitim (B2C)"; "cüzdan" kelimesini başvuru metninde "ön ödeme" olarak çerçevele; `LEGAL_ENTITY` IBAN'ının kurumsal künye olduğunu not düş
- [ ] **E3.** Canlıya çıkış kontrol listesi (§3.2, 12 madde) — özellikle Bildirim URL + `TRUSTED_PROXY_HOPS=2` + `PAYTR_SANDBOX` boş

### Yüksek (ilk satış haftası)
- [ ] **E4.** T3 canlı halka tanığı (₺10–20 gerçek işlem → CLEARED + CREDIT + satın alma + sınav + doğrula)
- [ ] **E5.** Akademi satın alma makbuzu + SMTP (`NOTICE_SMTP_HOST` + `NOTICE_MAIL_FROM`)
- [ ] **E6.** `ACADEMY_EXAM_SITTING_SECRET` (≥16) üretim secret'ına yazılsın; unutulursa sınav 503

### Düşük (temizlik)
- [ ] **E7.** `PAGE_SEO.freelancer` girdisini kaldır (`lib/copy/seo.ts`)
- [ ] **E8.** `pazaryeri` ölü ikon anahtarını sil (`components/ui/icons.tsx`)
- [ ] **E9.** Runbook §12'ye tek satır: "Freelancer motoru durur, kamu yüzeyi 410 — PayTR B2C" (`.system_docs/OPS_RUNBOOK.md`)
- [ ] **E10.** `docs/SOZLUK.md`: Rail/Amiral/Dron/Tezgâh/Diyar iç sözlüğü (onboarding)

### Yapılmayacaklar
- Freelancer kodu/DB'sini silmek (Faz 2 geri dönüşünü yakar, testleri patlatır)
- Junior odasını açmak (veli + hukuk altyapısı yok; B2C hedefiyle çelişir)
- Mikro-servise bölünmek (trafik yokken mimari lüks)
- Yeni dron işi açmak (sıfır kullanıcıya mühendislik)

---

## EKLER

### A. Taranan yüzey özeti
- Sayfalar: 46 (`app/` + `archived/` dahil sayım; canlı ~20)
- API route: 52 (canlı + 410 + `_gone`)
- `lib/`: 505 dosya (canlı + arşiv); `lib/freelancer`: 27, `lib/kernel/payments`: 22
- Prisma: `kernel` + `freelancer` + `academy` + `career` + `base` şemaları
- Doküman: Anayasa, Manifesto, Pedagoji, Ops Runbook, README, Storage Contract (özet)

### B. Karar kaydı (bu raporun önerdiği)
1. Freelancer: **kilitli tut, silme** (Faz 2'ye kadar).
2. PayTR başvurusu: **B2C Merchant, dijital eğitim**; Split başvurusu ayrı faz.
3. Akademi: **5 SKU ile satışa açıl**; 06–13 yol haritası.
4. Junior: **kapalı tut**; "gençlere eğitim" = Akademi seviye paketleri.
5. Dron: **donuk tut**; v1 sözleşmesini gerçek yüzeye indir.

---

*İşlem tamamlandı. Bu dosya `/docs/TESPIT_RAPORU.md` olarak kaydedildi. Sorular için her bulgunun yanında dosya yolu var — ilgili dosyayı açıp satır satır doğrulayabilirsiniz.*
