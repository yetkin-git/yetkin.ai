# 06 — Nihai canlıya çıkış raporu

| Alan | Değer |
|------|--------|
| Tür | Nihai mühür (insan SSOT) |
| Tarih | 17 Ağustos 2026 |
| Gövde | `yetkin_rail` |
| Anayasa | `docs/ANAYASA.md` |
| Ops | `docs/07_OPS_RUNBOOK.md` |
| Depo | `docs/08_STORAGE_CONTRACT.md` |
| Reçete | `docs/06_CANLIYA_CIKIS_RECETESI.md` |
| Seremoni | `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` |
| D3 | `docs/07_tedavi_raporu_d3_nihai_muhur.md` |
| Faz 4 | `docs/05_TEDAVI_RAPORU_FAZ4.md` |

Bu dosya runtime bayrağı değildir. `GET /api/health` JSON `phase` **taşımaz.** Sahte `phase`, sahte CREDIT, mock checkout ve `service_role` JS anahtarı yoktur.

---

## Karar

**Çekirdek mühürü basıldı. `yetkin_rail` canlıya çıkışa %100 hazırdır** — kod, kalkan, gümrük ve prebuild zinciri fail-closed kilitlidir. Operatörün yapacağı iş kod eksiği değil; `docs/06_CANLIYA_CIKIS_RECETESI.md` kutularıdır (Direct migrate, PayTR mağaza, Storage CORS, üretim sırları, tek süreç host).

Reçete kutusu boşken “canlı nakit aktı” / “imzalı PUT bağlandı” / “Inngest valör işledi” **iddia edilmez.** Bu dürüst kapalı yüzeydir, eksik ürün değildir.

Kurumsal altıncı vitrin diye açılmaz. On üçüncü oda yasaktır. S43 çekim kapalıdır. DevLabs **linter’dır, runner değildir.**

---

## 1. Prebuild mühür

```
npm run verify:prebuild
```

Zincir (ANAYASA): `no-secrets` → `amount-minor` → `ai-gateway` → `rls-status` → `api-auth` → `boundaries` → `sen-axis` → `atomic-seals` → `test:surface` → `typecheck`.

Build: `prisma generate && verify:prebuild && next build` (`npm run build`).

| Kapı | Anlam |
|------|--------|
| `verify:no-secrets` | PEM, `sk_live_`, `service_role`, yasaklı env yok |
| `verify:amount-minor` | Tek bakiye; `amountKurus` / float para yok |
| `verify:ai-gateway` | Tek LLM kapısı; dikey ham SDK yok |
| `verify:rls-status` | FORCE RLS sicili |
| `verify:api-auth` | Kenar `auth` haritası |
| `verify:boundaries` | Oda duvarı §2.8 |
| `verify:sen-axis` | Sen sesi / kopya |
| `verify:atomic-seals` | Ledger `$transaction`, PayTR reconcile, T3/T4 yüzey |
| `test:surface` | Anayasa + surface testleri |
| `typecheck` | `tsc --noEmit` |

Bu mühür anında zincir **exit 0** ile geçti (17 Ağustos 2026). Surface: **54 dosya / 162 test.** `verify:api-auth` 86 rota. Kırmızı kapı yayınlamaz.

---

## 2. Beş oda + kenar — kodda kilitli

| Yüzey | Mühür |
|-------|--------|
| Akademi | katalog → kilit → settlement → müfredat → sınav → sertifika (`rail-temel`) |
| Freelancer | ilan → `EscrowHold` → release; ikinci bakiye yok |
| Yetkinİlan | ilan → kilit → anında veya emanet |
| Studio | `invokeLlm` / `generateImage`; bütçe ağdan önce; imzalı PUT; `data_base64` tavan 2097152 |
| DevLabs | proje → `yrk_` HMAC kasa → generate → `lintConstitutionalSource` → artifact. **exec yok** |
| Kenar | ES256/RS256 JWKS; HS256 yalnız `SUPABASE_JWT_SECRET`; CSP nonce; `unsafe-eval` yok |
| Nakit | `Wallet.amountMinor` + append-only `LedgerEntry`. PayTR iframe/oid `c3cd33e` |

Oturumsuz yazma 401. Yetersiz bakiyede LLM çağrılmaz, debit yok. Gateway yoksa Studio 503, debit durur.

---

## 3. Faz 4 gümrük kaydı (kapanış)

`docs/05_TEDAVI_RAPORU_FAZ4.md` Studio/DevLabs dumanını mühürler:

- LLM gümrüğü disk + `verify:ai-gateway` yeşil.
- Canlı generate yetersiz bakiyede **dürüst 400** (T3 cüzdan 0; sahte CREDIT yok).
- DevLabs proje + kasa bağlı; generate aynı nakit kapısında; exec yok.
- Storage CORS yabancı-kök kalkanı koda işlendi (`assertStudioStorageCorsRejectsForeignOrigin`). Dashboard joker duruyorsa ops dumanı kırmızı kalır — imzalı PUT bağlanmaz.
- PayTR get-token 001 mağaza paneli işidir; iframe gövdesi commit’tedir.

Faz 4 “çalışma ağacı dumanı” ile bu rapor “yayın mühürü” ayrılır. Dumanın dürüst kırmızısı (001, CORS joker, boş Inngest, boş pepper) **operatör reçetesine** taşındı; kod kalkanı kapanır.

---

## 4. Operatör bağları — reçete, kod değil

Aşağıdakiler `docs/06_CANLIYA_CIKIS_RECETESI.md` kutularıdır. Boş kutu ürün eksiği sayılmaz.

1. `npm run ops:migrate` — Direct `:5432`; havuz/6543 yasak.
2. Dashboard SQL: `supabase/storage/studio-assets.sql`.
3. Storage CORS: yalnız app origin, metod **PUT**; `npm run ops:storage-cors`.
4. PayTR mağaza aktif; üretimde `PAYTR_SANDBOX` ve mock **yok.**
5. Inngest Cloud **çift** anahtar; `INNGEST_DEV` üretimde yok.
6. `DEVLABS_KEY_PEPPER` üretimde dolu.
7. En az bir LLM anahtarı (Gemini gümrük eşiği).
8. Super Admin UUID; Redirect URLs; tek Node host; `npm run build`.

---

## 5. Bilinçli kapalı (geri açılmaz)

13. oda, Redis, Socket.IO, GİB, çekim, Turnstile, OAuth şişmesi, Studio 15 peron, DevLabs exec/sandbox/SaaS, `VIDEO_GEN` / `VOICE_TTS` factory, `LOCAL_MOCK_AUTH`, `MAINTENANCE_MODE`, `SUPABASE_SERVICE_ROLE_KEY`, yatay replica.

---

## 6. Bu mühür ne değildir

- Health JSON’a `phase` yazmaz.
- PayTR panel onayını, Dashboard CORS’u veya Cloud anahtarını **kendisi doldurmaz.**
- Bellek / surface yeşili “üretimde nakit aktı” değildir.
- Push / DNS / TLS sertifikası bu dosyanın varlığı değildir.

---

## Sonuç

Beş dikey oda, tek bakiye, LLM gümrüğü, kenar JWKS/CSP, idempotency, Inngest fail-closed serve, Studio tavanı ve DevLabs linter **kodda mühürlüdür.** Prebuild **exit 0.**

Operatör reçeteyi yeşile çeker; süreç `npm run build` + tek `next start` ile yayına çıkar. Reçete bitmeden trafik açılmaz — kalkan böyle tasarlandı.
