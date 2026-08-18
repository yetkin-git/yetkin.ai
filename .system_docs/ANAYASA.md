# ANAYASA — yetkin_rail

İnsan SSOT. Ürün kodu bu dosyayı import etmez. Ajan ve operatör kırmızı çizgileri buradan okur; kod mühürleri `eslint.config.mjs` §2.8, `scripts/verify-*.ts`, `tests/kernel/constitution-surfaces.test.ts`, `tests/kernel/system-docs-contract-surface.test.ts`, Prisma şema başlıkları ve `lib/kernel/modules.ts` ile aynı kapıyı kilitler.

| Alan | Değer |
|------|--------|
| Tarih | 16 Ağustos 2026 |
| Gövde | 12 dikey oda + 4 çekirdek sığınak |
| Kalıcı belgeler | `/.system_docs` |
| Ops | `.system_docs/OPS_RUNBOOK.md` |
| Nesne depo | `.system_docs/STORAGE_CONTRACT.md` |
| Vizyon | `.system_docs/MANIFESTO.md` |
| Günlük rapor | `/docs` — build fixture değildir; silinmesi derlemeyi kırmaz |

Müze `yetkin.ai/` ilham ve **yasak listesidir** (S9-B). TypeScript, Next tracing, ESLint import grafı, Vitest, `verify-*` taraması ve HTTP `/yetkin.ai` dışındadır. Rail kök `.gitignore` ve `.cursorindexingignore` dizinini git ve indeksten keser. Kör kopya yasaktır. Dizin bu turda silinmez.

Kalıcı anayasa `/.system_docs` altındadır. `/docs` günlük yap-boz ve raporlama alanıdır. Öğrenme → kanıt → kazanç **üç halka** aynı vatandaş kimliğinde kapanır.

---

## Kırmızı çizgi 1 — 12 oda tavanı

Asil sicil **12 oda**dır. 13. oda yasaktır.

| id | Vatandaş yolu | Marka |
|----|----------------|--------|
| dashboard | `/dashboard` | Anasayfa (şeritte çip yok) |
| studio | `/studio` | Studio |
| academy | `/academy` | Akademi |
| career | `/career` | Kariyer |
| freelancer | `/freelancer` | Freelancer |
| devlabs | `/devlabs` | DevLabs |
| kurumsal | `/kurumsal` | Kurumsal |
| hibe | `/hibe` | Hibe |
| arena | `/arena` | Arena |
| pazaryeri | `/yetkinilan` | Yetkinİlan (disk `pazaryeri/`) |
| junior | `/junior` | Junior |
| social | `/social` | YetkinX |

Çekirdek sığınaklar oda **sayılmaz**: `/profil`, `/cuzdan`, `/pasaport`, `/admin`.

**Kesilmiştir (geri açılmaz):** chess, anket, lonca, tarım, talent, holding, Socket.IO, Redis, GİB, Turnstile, OAuth şişmesi, Studio 15 peron, DevLabs exec/sandbox/SaaS/Builder/Commerce, VIDEO_GEN / VOICE_TTS factory, 130 BINA düğümü.

**Tadil — 17 Ağustos 2026 (CEO kararı):** `reklam` bu listeden çıkarıldı. Kesilmiş olmaktan çıkması serbest olmak değildir; sınırı **Kırmızı çizgi 5** çizer. Diğer kesilenler yerinde durur.

İnce alias tavanı `next.config.ts` sicilindedir. KAPAT-oda yönlendirmesi yazılmaz. `/yetkin.ai` 404.

---

## Kırmızı çizgi 2 — Tek bakiye / birim

Şema ve tip adı **`amountMinor`** + `currencyCode`. UI kopyasında “kuruş” denir. Float para yasaktır (S5-A).

`amountKurus` kolon adı yasaktır. Triple-balance, `User.balanceKurus`, `ModuleWallet`, holding havuzu ve `merit-swap:` ikinci nakit yazıcı **yasaktır**.

Tek SSOT: `Wallet` satırı + append-only `LedgerEntry`. `EscrowHold` kilitir, ikinci bakiye değildir. User’da bakiye kolonu yoktur. Satış fiyatı kod sabiti değildir; Super Admin katalog SSOT’tur.

---

## Kırmızı çizgi 3 — Güvenlik ve sır

`SUPABASE_SERVICE_ROLE_KEY` kod, `.env`, `.env.example` ve JS istemcisinde **kullanılamaz**. `anon` / publishable + vatandaş JWT. Yazma Prisma **postgres** rolü. Okuma FORCE RLS; sahip yalnız SELECT. `service_role` JS anahtarı yoktur.

**S43 — kapalı döngü cüzdan.** Nakit PayTR ile girer, 12 odada harcanır, bankaya çıkış/çekim yoktur. `/api/wallet/withdraw`, GİB, e-arşiv, admin çekim paneli açılmaz.

Kenar JWT fail-closed: çerez varlığı ipucu değildir. ES256/RS256 **JWKS** kenar doğrulaması; HS256 yedek `SUPABASE_JWT_SECRET`. Boş sırda HS256 token düşer. Kimlik gerçeği handler `getUser`’dadır.

Üretim CSP: istek başına nonce. `unsafe-eval` yasaktır. `next.config` statik CSP yazmaz (nonce’u ezer).

---

## Kırmızı çizgi 4 — Mimari sınırlar

### DevLabs linter’dır, runner değildir

Kod tezgâhında **exec yoktur** (S59-A). `eval`, `child_process`, `vm.runInContext`, sandbox runner, Codex deploy yasaktır. Generate → anayasal linter → artifact.

### Idempotency

Kritik yazmalar **Idempotency-Key** (UUID) zorunludur: cüzdan yükleme, akademi satın al, freelancer kabul. Aynı anahtar ikinci finansal emir doğurmaz. Tablo `http_idempotency_records` unique `(user_id, route, key)`.

### Inngest imza

Uygulama id `yetkin-rail`. Serve `/api/jobs/inngest`. Üretimde `INNGEST_SIGNING_KEY` veya `INNGEST_EVENT_KEY` boşsa serve **503** (fail-closed). `INNGEST_DEV` üretimde bypass etmez. Sahte/doğrulanmamış event kabul edilmez. Socket yok. İşler: PayTR valör, emanet TTL, Arena tur.

### Studio tavanı

`data_base64` CHECK adı `studio_digital_assets_data_base64_max_chars`; tavan 2097152 karakter. Decoded 1572864 bayt. Aşım 413; debit yok. Kör `data_base64` DROP yok. Nesne depo: `.system_docs/STORAGE_CONTRACT.md`.

### Oda duvarı (§2.8)

Çekirdek ↛ dikey motor. Dikey ↛ başka dikey engine/runtime/prisma-store. Çapraz konuşma HTTP veya kernel sözleşmesi. String FK: odalar `EscrowHold` / `CheckoutPriceLock` / `AiTokenUsage` id’sini string tutar; kernel oda tablosu sorgulamaz.

### LLM gümrüğü

Tek kapı `invokeLlm` / `generateImage`. Ham SDK dikeyde yasaktır (`verify:ai-gateway`). 8 kanonik rol tavanı.

### Dürüst kapalı yüzey

Boş env → “Giriş henüz bağlanmadı”. Boş DB → “Liste henüz yüklenemedi”. Sahte bakiye yok. `LOCAL_MOCK_AUTH` / `MAINTENANCE_MODE` yok. `GET /api/health` JSON `phase` taşımaz.

### Hız tavanı

Süreç-içi bellek. Tek Node süreci dürüst tavanıdır. Redis bu gövdede yoktur.

### Çekirdek + dron: mobil sınırlar

Gövde monolit web sitesi değildir; **JSON omurgalı çekirdektir.** Kenar `Authorization: Bearer` kabul eder, çerez zorunlu değildir. 12 odayı tek tek gezmek vatandaş için zorunlu değildir.

**Dron sınırı oda adına göre değil, ödeme tabiatına göre çizilir.** Dört diyar:

| Diyar | Oda | Mağaza kuralı | Dron |
|-------|-----|---------------|------|
| A — dijital kanıt | Akademi, Studio, DevLabs | Apple 3.1.1 / Play Billing → IAP zorunlu | **Yayınlanmaz** |
| B — gerçek hizmet | Freelancer, Kurumsal, Arena, Yetkinİlan hizmet | Apple 3.1.3(e) → IAP **yasak**, PayTR zorunlu | Serbest |
| C — öne çıkarma | Yetkinİlan doping, sosyal reklam | Apple 3.1.3(g) → IAP zorunlu | Yayınlanmaz |
| D — düzenlenmiş | Yetkinİlan emlak/vasıta, Junior | EİDS + yetki belgesi | Yayınlanmaz |

Diyar A native dron olarak yayınlanmaz: IAP fiyat SSOT'unu Super Admin katalogdan mağazaya taşır ve tek taraflı iade, arkasında ödenmiş harç olmayan mühür bırakır. Aynı omurga üzerine oda başına bundle id açılmaz (Apple 4.3(a)).

**API sürüm kapısı.** Mağazaya çıkmış sürüm sözleşmeyi dondurur. Dron öncesi `/api/v1` ön eki ve **asgari sürüm kapısı** zorunludur: desteklenmeyen dron sürümü vatandaş dilinde uyarı alır, sahte veri veya boş ekran almaz. Yayınlanmış sürümün beklediği alan sicilden sessizce düşmez.

### Teknik borç — çift zarf (mühür 18 Ağustos 2026)

İki JSON serimi vardır. Bu bir özellik değil, **bilinçli borçtur.** Versiyonsuz web gövdesini bir gecede v1'e almak Faz 1 yüzey dondurmasını ihlal eder.

| Tüketici | Zarf | Yol |
|----------|------|-----|
| Amiral web (çerez) | `{ ok, ...data }` — versiyonsuz | `/api/...` (v1 ön eki yok) |
| Dron / dış (Bearer) | `{ ok, error, requestId, apiVersion, data }` | `/api/v1/...` |

Aynı handler iki kez yazılmaz; kenar soyar, `jsonOk` istek başlığına göre zarflar.

**Üçüncü zarf yasaktır.** Yeni dış tüketici yalnız v1 konuşur. Versiyonsuz serim yeni hop, yeni istemci veya yeni kök alan ile **genişlemez.** Birleştirme, nakit halkası döndükten sonra major-olmayan sıkılaştırmadır veya v2'dir — bugünün işi değildir.

**Yetkinİlan emlak/vasıta.** Yalnız görselleştirme ve vitrin. **Teklif ve emanet bağlanmaz** — taşınmaz bedelini tutup aktarmak ödeme kuruluşu faaliyetidir. Kamuya ilan yayını EİDS kimlik ve yetki doğrulaması olmadan açılmaz; doğrulama yükümlülüğü ilan platformunundur ve ödeme almamak bu yükümlülüğü kaldırmaz.

---

## Kırmızı çizgi 5 — Mühür duvarı

`reklam` kesilenler listesinden çıktı (Kırmızı çizgi 1 tadili). Duvar şudur: **para görünürlük satın alabilir, kanıt satın alamaz.**

| Serbest | Yasak |
|---------|-------|
| Reklam envanteri ve öne çıkarma, katalog SSOT fiyatıyla | Mühür yükünü değiştirmek |
| Etkileşim sayaçları ayrı nesnede | Sayaç veya ödemeyi `certificateHash` yüküne sokmak |
| Sosyal dikeyde akış ve etkileşim | Kanıt sırasını para ile değiştirmek |
| Reklamın kanıt nesnesine **komşu** durması | Reklamın kanıt nesnesinin **içine** girmesi |

**Mühür yükü dondurulmuştur:** `userId · courseId · attemptId · score · issuedAt · curriculumSeal`. Bu yüke hiçbir vanity sayısı, ödeme veya sıralama girdisi eklenmez. Sınav puanı tarayıcıda hesaplanmaz.

**Kamu doğrulama yüzeyi temiz kalır.** `/academy/dogrula/[hash]` reklam, beğeni, erişim sayacı veya sponsor taşımaz — Faz 3'te makine tarafından doğrulanacak yüzey burasıdır.

**Vize kapısı bu istisnanın dışındadır.** Reklam veya etkileşim vize türetmez; vizesiz teklif 403 kalır. Vize tanıyan admin düğmesi yoktur.

**Yürürlük:** doktrin bugün geçerlidir, **uygulama Faz 1 kapanana kadar donuktur.** `PROOF_FEED_FORBIDDEN_KEYS` ve DTO mührü bu turda kaldırılmaz. Mobilde reklam/öne çıkarma satışı IAP zorunludur (Apple 3.1.3(g)); Diyar C dron olarak yayınlanmaz.

---

## Beş oda canlıya-çıkış mührü

Akademi, Freelancer, Yetkinİlan, Studio, DevLabs + kenar JWKS/CSP kodda mühürlüdür. Kurumsal altıncı vitrin diye açılmaz. Seremoni günlük raporları `/docs` altındadır; kalıcı bağ `.system_docs` ve kod mühürleridir.

---

## Prebuild zinciri

`verify:prebuild` = `no-secrets` → `amount-minor` → `ai-gateway` → `rls-status` → `api-auth` → `boundaries` → `sen-axis` → `atomic-seals` → `test:surface` → `typecheck`.

Build: `prisma generate && verify:prebuild && next build`.
