# ANAYASA — yetkin_rail

İnsan SSOT. Ürün kodu bu dosyayı import etmez. Ajan ve operatör kırmızı çizgileri buradan okur; kod mühürleri `eslint.config.mjs` §2.8, `scripts/verify-*.ts`, `tests/kernel/constitution-surfaces.test.ts`, Prisma şema başlıkları ve `lib/kernel/modules.ts` ile aynı kapıyı kilitler.

| Alan | Değer |
|------|--------|
| Tarih | 16 Ağustos 2026 |
| Gövde | 12 dikey oda + 4 çekirdek sığınak |
| Ops | `docs/07_OPS_RUNBOOK.md` |
| Nesne depo | `docs/08_STORAGE_CONTRACT.md` |
| Canlıya geçiş | `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` |
| Canlı reçete | `docs/06_CANLIYA_CIKIS_RECETESI.md` |
| Nihai mühür | `docs/06_NIHAI_CANLIYA_CIKIS_RAPORU.md` |
| D3 mühür | `docs/07_tedavi_raporu_d3_nihai_muhur.md` |
| Envanter SSOT | `docs/01_tespit_raporu_karsilastirma.md` |

Müze `yetkin.ai/` ilham ve **yasak listesidir** (S9-B). TypeScript, Next tracing ve ESLint import grafının dışındadır. Kör kopya yasaktır.

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

**Kesilmiştir (geri açılmaz):** chess, anket, lonca, tarım, talent, holding, Socket.IO, Redis, GİB, reklam, Turnstile, OAuth şişmesi, Studio 15 peron, DevLabs exec/sandbox/SaaS/Builder/Commerce, VIDEO_GEN / VOICE_TTS factory, 130 BINA düğümü.

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

`data_base64` CHECK adı `studio_digital_assets_data_base64_max_chars`; tavan 2097152 karakter. Decoded 1572864 bayt. Aşım 413; debit yok. Kör `data_base64` DROP yok. Nesne depo: `docs/08_STORAGE_CONTRACT.md`.

### Oda duvarı (§2.8)

Çekirdek ↛ dikey motor. Dikey ↛ başka dikey engine/runtime/prisma-store. Çapraz konuşma HTTP veya kernel sözleşmesi. String FK: odalar `EscrowHold` / `CheckoutPriceLock` / `AiTokenUsage` id’sini string tutar; kernel oda tablosu sorgulamaz.

### LLM gümrüğü

Tek kapı `invokeLlm` / `generateImage`. Ham SDK dikeyde yasaktır (`verify:ai-gateway`). 8 kanonik rol tavanı.

### Dürüst kapalı yüzey

Boş env → “Giriş henüz bağlanmadı”. Boş DB → “Liste henüz yüklenemedi”. Sahte bakiye yok. `LOCAL_MOCK_AUTH` / `MAINTENANCE_MODE` yok. `GET /api/health` JSON `phase` taşımaz.

### Hız tavanı

Süreç-içi bellek. Tek Node süreci dürüst tavanıdır. Redis bu gövdede yoktur.

---

## Beş oda canlıya-çıkış mührü

Akademi, Freelancer, Yetkinİlan, Studio, DevLabs + kenar JWKS/CSP kodda mühürlüdür. Kurumsal altıncı vitrin diye açılmaz. Seremoni: `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md`. Operatör reçetesi: `docs/06_CANLIYA_CIKIS_RECETESI.md`. Nihai mühür: `docs/06_NIHAI_CANLIYA_CIKIS_RAPORU.md`.

---

## Prebuild zinciri

`verify:prebuild` = `no-secrets` → `amount-minor` → `ai-gateway` → `rls-status` → `api-auth` → `boundaries` → `sen-axis` → `atomic-seals` → `test:surface` → `typecheck`.

Build: `prisma generate && verify:prebuild && next build`.
