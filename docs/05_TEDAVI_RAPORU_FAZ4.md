# Tedavi Raporu — Faz 4 (Çalışma Ağacı Temizliği & DevLabs / Studio Gümrük Dumanı)

| Alan | Değer |
|------|--------|
| Tarih | 17 Ağustos 2026 |
| Yazar | Baş yazılım mimarı (Cursor) |
| Gövde | `d:\yetkin_rail` |
| Tespit SSOT | `docs/01_TESPIT_RAPORU.md` |
| Anayasa | `docs/ANAYASA.md` |
| Ops | `docs/07_OPS_RUNBOOK.md` |
| Depo | `docs/08_STORAGE_CONTRACT.md` |
| Kapsam | Faz 3 PayTR iframe/oid commit, Studio LLM gümrüğü + `studio-assets` imzalı PUT, DevLabs linter/HMAC kasa dumanı |
| Dışarıda | Canlıya çıkış mührü, 13. oda, Redis, Socket, GİB, çekim, sahte bakiye, sahte `phase`, mock checkout, DevLabs exec |

Ürün kodu bu dilimde **yeni oda açmadı.** `wallets.amount_minor` doğrudan yazılmadı. `PAYTR_ALLOW_MOCK_CHECKOUT` açılmadı. `GET /api/health` JSON `phase` taşımıyor. Sahte CREDIT yok. DevLabs tezgâhı **exec/runner açmadı.**

---

## 1. Faz 3 commit

```
c3cd33e fix(paytr): align iframe payload and merchant_oid spec
```

Önceki HEAD: `80383f1` (`chore(kernel): fix T3/T4 loop scripts and verify T2 backbone`).

Faz 3 raporunun kalan riski #4 kapanır: iframe get-token gövdesi ve `merchant_oid` alfa-numerik sicili git geçmişindedir. **Nakit 001 kapanmaz** — mağaza aktivasyonu operatör işidir; bu commit CREDIT icat etmez.

| Dosya | Neden |
|-------|--------|
| `lib/kernel/payments/paytr/checkout.ts` | iFrame HMAC sırası: `merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode`. `payment_amount` kuruş tam sayı. Direct-tarzı `payment_type` / `non_3d` gövdeden çıktı. |
| `lib/kernel/payments/merchant-oid.ts` | Önekler `wallettopup` / `freelancerescrow` / `academy` (tire yok). PayTR «alfa numerik». |
| `tests/kernel/paytr.test.ts` | get-token resmi hash + kuruş + `no_installment` kilidi |
| `tests/kernel/http-idempotency.test.ts` | idempotent oid `^wallettopup[0-9a-f]{24}$` |
| `scripts/ops-t3-academy-loop.ts` | canlı döngü aynı öneki ister |
| `scripts/ops-t4-freelancer-loop.ts` | aynı |

Disk: `npx vitest run tests/kernel/paytr.test.ts tests/kernel/http-idempotency.test.ts` → **15/15**.

**Bilerek bu commit’e alınmayanlar:** logout rotası, kabuk/ikon, tarihsel tespit silmeleri, Anayasa envanter yolu, Studio Storage CORS yabancı-kök yaması, e2e spec kaymaları, `.env.local`, bu rapor.

Push yapılmadı. `c3cd33e` yalnız yerel `master`.

---

## 2. Studio gümrüğü

Önkoşul: `npm run dev` `:3000`. Mock checkout kapalı. Yasak anahtarlar (`SUPABASE_SERVICE_ROLE_KEY`, `LOCAL_MOCK_AUTH`, `MAINTENANCE_MODE`, `REDIS_URL`) **yok.**

### 2.1 Env sicili (var/yok — sır yok)

`.env.local` değerleri bu rapora **yazılmaz.**

| Anahtar | Durum | Okuma |
|---------|--------|--------|
| `DATABASE_URL` / `DIRECT_URL` | dolu | health `db=ok` |
| `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` | dolu | health `supabaseAuth=configured` |
| `SUPABASE_JWT_SECRET` | **boş** | HS256 yedek kapalı; kenar ES256 JWKS |
| `GEMINI_API_KEY` | dolu, gümrük eşiği (`len>8`) **geçer** | tek sağlayıcı |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | **boş** | adapter fail-closed; dikey SDK yok |
| `AI_PLATFORM_DAILY_CAP_MINOR` | dolu | kod varsayılanı 500000 ile aynı sicil |
| `DEVLABS_KEY_PEPPER` | **boş** | geliştirme varsayılanı; üretimde zorunlu |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | **boş** | health `inngest=unconfigured` (dürüst) |
| `PAYTR_*` kimlik | dolu | health `paytr=configured` |
| `PAYTR_ALLOW_MOCK_CHECKOUT` | boş | mock kapalı |
| `STUDIO_STORAGE_BACKEND` | boş | kod sabiti `object-store` |
| `E2E_T3_EMAIL` / `_PASSWORD` | dolu | Faz 3 vatandaşı `0cad8d8f…` |

### 2.2 Kod kapısı

`npm run verify:ai-gateway` → **OK.** `invokeLlm` / `generateImage` `lib/kernel/ai/llm-gateway.ts` içinde. Ham `GoogleGenAI` yalnız `providers/gemini.ts`. Studio motoru `invokeLlm`; görsel motor `generateImage`. Dikey oda client kurmaz.

Bütçe kalkanı ağdan önce: hız tavanı → platform günlük tavan → kullanıcı günlük token. Üretim portu Prisma `AiTokenUsage`. Guard hata verirse `guard-unavailable` (fail-closed).

Ops `tsx` ile gümrük ping’i `server-only` yüzünden **açılmaz** — kapı Next sunucusundadır, ops kaçak yolu yoktur. Bu kırmızı sahte yeşil değildir.

### 2.3 Disk yüzeyi

```
npx vitest run tests/kernel/budget-shield.test.ts tests/kernel/ai-budget-default-surface.test.ts tests/kernel/prisma-budget-shield.test.ts tests/studio/generation-flow.test.ts tests/studio/image-gen.test.ts tests/studio/signed-upload.test.ts tests/studio/storage-ceiling.test.ts tests/studio/storage-signed-upload-surface.test.ts tests/studio/storage-contract-surface.test.ts tests/studio/citizen-surface.test.ts tests/studio/happy-path-e2e-surface.test.ts tests/devlabs/linter-flow.test.ts tests/devlabs/key-vault.test.ts tests/devlabs/citizen-surface.test.ts tests/devlabs/happy-path-e2e-surface.test.ts tests/kernel/paytr.test.ts
```

**16 dosya / 63 test geçti.** Bellek e2e nakit/LLM yolu bu raporun canlı kanıtı **sayılmaz.**

### 2.4 Canlı HTTP (T3 vatandaşı, sahte CREDIT yok)

`GET /api/health` **200**, `phase` yok, `checks.inngest = unconfigured`.

Oturumsuz yazma:

| Uç | HTTP | Kanıt |
|----|------|--------|
| `POST /api/studio/generate` | **401** | `Oturum gerekli.` |
| `POST /api/studio/storage/sign-upload` | **401** | `Oturum gerekli.` |
| `POST /api/devlabs/projects` | **401** | `Oturum gerekli.` |
| `GET /api/studio/pulse` | **401** | aynı |
| `GET /api/devlabs/projects` | **401** | aynı |

Oturumlu (`0cad8d8f…`, Bearer; çerez ipucu yetmez):

| Adım | Sonuç |
|------|--------|
| `GET /api/dashboard/wallet-strip` | **200**, `live=true`, **amountMinor=0** |
| `GET /api/studio/pulse` | **200**, `live=true` |
| `POST /api/studio/generate` | **400** `Yetersiz bakiye.` — LLM çağrılmadan durur |
| `POST /api/studio/images` | **400** `Yetersiz bakiye.` — `generateImage` çağrılmadan durur |
| `POST /api/studio/storage/sign-upload` | **404** `Üretim kaydı bulunamadı.` — `signedPutUrl` yok |
| `POST /api/studio/drafts` | **201** — taslak debit yazmaz |
| Cüzdan sonra | **amountMinor=0** — sahte CREDIT yok |

Katalog satırları bağlıdır: yokluk mesajı (`katalogda yok` / `STUDIO_IMAGE_CATALOG_MISSING`) gelmedi; motor tabanı okuyup bakiyede kesti. Gemini sicili dolu olsa da **canlı invoke bu dilimde çağrılmadı** — sıra doğrudur (bakiye → gümrük). Faz 3 PayTR get-token 001 yüzünden T3 cüzdanı boş kalmıştır.

`/studio` oturumsuz **200**; `unsafe-eval` yok; CSP nonce var. Üretim tezgâhı oturum ister.

### 2.5 `studio-assets` imzalı PUT / CORS

Kod: vatandaş JWT + anon key; `service_role` yok. `createObjectStoreStudioAssetStorage` gateway yoksa **503** «nesne depo bağlı değil»; debit settle `put` sonrasındadır.

```
npm run ops:storage-cors
```

| Prob | Sonuç |
|------|--------|
| OPTIONS `…/storage/v1/object/studio-assets/cors-probe` | **200** — bucket yolu yanıt veriyor |
| Rail origin (`NEXT_PUBLIC_APP_URL`) | `ACAO=*` , `ACAM=GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,TRACE,CONNECT` |
| Yetkisiz kök `https://evil.example` | aynı joker |

**Fail-closed kırmızı:** joker origin ve PUT dışı metod sözleşmeyi bozar. İmzalı PUT bu Dashboard CORS ile bağlanmamalı; debit durur. Operatör: Allowed Origins = yalnız uygulama origin; Methods = **PUT**. Sonra `ops:storage-cors` yeşil olmadan görsel mutlu yol iddia edilmez.

Çalışma ağacında (bu commit’te **yok**): yabancı-kök reddi `assertStudioStorageCorsRejectsForeignOrigin`. Joker `*` hem HEAD hem yama ile kırmızıdır.

---

## 3. DevLabs linter / kasa

### 3.1 Exec yoktur (S59-A)

`lib/devlabs/` altında `child_process`, `eval(`, `vm.runInContext`, `spawn` **yalnız linter kural metninde** geçer. `generateDevLabsCode`: Generate → `lintConstitutionalSource` → artifact. Runner yok. `sandboxKind = NARROW` bir etiketdir; sandbox VM değildir.

`/devlabs` **200**: «exec yoktur», «Exec Yoktur / Çalıştırma Yapılmaz», `yrk_` kasa önizlemesi. Oturumsuz liste `Liste henüz yüklenemedi` (dürüst unbound; DB yalanı değil).

### 3.2 Canlı akış (T3)

| Adım | Sonuç |
|------|--------|
| `GET /api/devlabs/projects` | **200**, 0 proje |
| `POST /api/devlabs/projects` | **201**, `sandboxKind=NARROW` |
| `POST …/keys` | **201**, plaintext `yrk_` öneki, vatandaş JSON’da **hash yok** |
| `POST …/generate` | **400** `Yetersiz bakiye.` — `invokeLlm` yok, artifact yok, debit yok |
| Cüzdan | hâlâ **0** |

Proje + HMAC kasa **bağlı.** Kod üretimi + anayasal linter nakit kapısında durur (katalog tabanı 150 minor; T3 bakiyesi 0). Bu **dürüst kırmızı**, sahte linter yeşili değil.

Disk: `tests/devlabs/linter-flow.test.ts` temiz kodda linter 100 + artifact anahtara bağlı; kirli kodda `linterOk=false` (artifact yine mühürlenir, exec yok); yetersiz bakiyede adapter **0 çağrı**. `tests/devlabs/key-vault.test.ts` kasa yalnız hash tutar.

`DEVLABS_KEY_PEPPER` boş — geliştirme varsayılanı. Üretimde boş bırakılmaz.

---

## 4. Bilinçli yapılmayanlar

- 13. oda, Redis, Socket, GİB, çekim, Turnstile, DevLabs exec/sandbox runner
- `PAYTR_ALLOW_MOCK_CHECKOUT=true` veya `wallets.amount_minor` UPDATE
- `LOCAL_MOCK_AUTH` / `MAINTENANCE_MODE` / sahte `phase`
- PayTR mağaza panelinden aktivasyon; Storage CORS Dashboard düzeltmesi
- Inngest Cloud anahtarı icadı
- Logout / CORS yabancı-kök yaması / tarihsel tespit silmeleri bu commit’te
- Push
- Kalıcı `ops:t5` betiği (duman tek seferlik; sır sızdırmaz çıktı bu raporda)

---

## 5. Kalan risk (Faz 4 kapanışı)

1. **PayTR get-token 001 duruyor.** iframe/oid hizası commit edildi; mağaza aktif değil. Akademi SHA256 ve Studio/DevLabs debit aynı nakit kapısında bekler.
2. **Storage CORS joker.** Bucket yolu yanıt veriyor; sözleşme kırmızı. Görsel imzalı PUT bağlanmadı.
3. **Inngest Cloud yok.** Valör/TTL/Arena tur üretimde işlemez.
4. **Canlı LLM invoke yok.** Gemini sicili dolu; bakiye 0 olduğu için gümrük ağa çıkmadı.
5. **`DEVLABS_KEY_PEPPER` üretimde boş.** Geliştirme varsayılanı canlıya çıkışta yasak.
6. **Push yok.** `c3cd33e` yalnız yerel `master`.
7. **Faz 3 nakit/emanet halkası açık.** T4 müşteri hız tavanı + aynı 001.

---

## Karar özeti

| Sıra | İş | Durum |
|------|-----|--------|
| 1 | Faz 3 PayTR iframe/oid commit | **tamam** — `c3cd33e` |
| 2 | LLM gümrük mühürü (`verify:ai-gateway` + bütçe kalkanı testleri) | **tamam** (disk) |
| 3 | Studio canlı metin/görsel üretim | **fail-closed** — yetersiz bakiye; sahte debit yok |
| 4 | `studio-assets` imzalı PUT | **fail-closed** — üretim kaydı yok + CORS joker |
| 5 | DevLabs proje + `yrk_` HMAC kasa | **bağlı** — NARROW, hash vatandaşta yok |
| 6 | DevLabs generate → linter → artifact | **fail-closed** — yetersiz bakiye; exec yok |
| 7 | S43 / tek bakiye | **korundu** — cüzdan 0→0 |

Faz 4 çalışma ağacındaki PayTR hizasını mühürler ve Studio/DevLabs üretim gümrüğünün **dürüst kapalı** kaldığını kanıtlar. Canlı LLM debit, imzalı PUT ve anayasal linter artifact mührü bu raporun tarihi itibarıyla **basılmadı.**
