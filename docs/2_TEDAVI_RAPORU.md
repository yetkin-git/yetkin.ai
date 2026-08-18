# 2 — Tedavi Raporu (FAZ 2: Mühür ve Halka Dönüşü)

| Alan | Değer |
|------|--------|
| Tarih | 19 Ağustos 2026 |
| Yazar | Baş yazılım mimarı (Cursor) |
| Rol | Lead Architect — CEO (Gemini) onaylı `1_TESPIT_RAPORU.md` kararlarının uygulaması |
| Gövde | `d:\yetkin_rail` (Rail) |
| Anayasa | `.system_docs/ANAYASA.md` |
| Protokol | Mühür ve Halka Dönüşü — yeni oda yok, dikey genişleme yok, dron yayını yok |
| Teslimat | Bu dosya + üç mühür commit'i + hız tavanı port soyutlaması |

Bu belge yeni tespit serisinin tedavi adımıdır. Tespit (`docs/1_TESPIT_RAPORU.md`) ürün kodunu değiştirmedi; bu tedavi çalışma ağacını mühürler, dronu yayın hattından donuk tutar ve hız tavanına port arayüzü ekler. **Faz 1 kapanış ölçütü (tek vatandaşın defterinde dört basamak) bu turda kanıtlanmaz** — kalan iş OPS/ENV'dir.

---

## 1. `verify:prebuild` çıktısı ve mühür sonuçları

Zincir (kök `package.json`):

`no-secrets → amount-minor → ai-gateway → rls-status → api-auth → boundaries → sen-axis → atomic-seals → test:surface → typecheck`

İki kez koşuldu. İkisi de **çıkış 0**.

### 1.1 Mühür öncesi (çalışma ağacı, commit yok)

Tespitin "çalışma ağacının yeşilliği bilinmez" cümlesi bu koşuda kapanmıştır.

| Adım | Sonuç |
|------|--------|
| `verify:no-secrets` | OK — PEM / `service_role` JWT / yasaklı `.env.example` ataması / git `.env` yok |
| `verify:amount-minor` | OK — integer minor + PayTR sınır katmanı |
| `verify:ai-gateway` | OK — gümrük mühürlü; `VIDEO_GEN` / `VOICE_TTS` fail-closed (factory yok) |
| `verify:rls-status` | OK — Auth sync + e-posta senkronu + FORCE RLS + owner SELECT |
| `verify:api-auth` | OK — 89 route (`session` 83, `public` 3, `admin` 1, `webhook` 2) |
| `verify:boundaries` | OK — kernel↛dikey, UI↛prisma/yazma motoru, oda↛oda, 12 oda sicili |
| `verify:sen-axis` | OK — 334 dosya, 25 `siz` kaçağı tarandı |
| `verify:atomic-seals` | OK — kariyer/freelancer/akademi/studio/PayTR ledger tx; 66 surface dosyası |
| `test:surface` | OK — 67 dosya, **223** test |
| `typecheck` | OK — `prisma generate` + `tsc --noEmit` |

Kanıtlanmış hata yoktu. Nokta atışı düzeltme gerekmedi.

### 1.2 Mühür + port sonrası (üç commit + `RateLimitPort`)

Aynı zincir yeniden yeşil. Surface **224** teste çıktı (dron yayın donukluğu mührü: +1). `typecheck` yeşil.

### 1.3 Dron yayın hattı — donuk (askıda)

Dron kodu commit'lendi (`81b2d1f`). Yayın **yok**. Mühür:

| Kanıt | Durum |
|-------|--------|
| `apps/rail-is/package.json` → `rail.publishFrozenUntilFaz1Close: true` | mühürlü |
| `apps/rail-is/app.config.ts` → `extra.publishFrozenUntilFaz1Close: true` | mühürlü |
| `eas.json` yok (kök ve `apps/rail-is`) | mühürlü |
| Kök `package.json` `workspaces` yok; EAS / `expo publish` script yok | mühürlü |
| CI (`.github/workflows/ci.yml`) yalnız `npm ci` + `verify:prebuild` + `typecheck`; `run:` satırlarında `eas` yok | mühürlü |
| `next.config.ts` `outputFileTracingExcludes: apps/**` — Amiral derlemesi dronu paketlemez | mühürlü |
| Surface: `tests/kernel/rail-is-dron-lab-surface.test.ts` — "yayın hattından donuktur" | yeşil |

Lab `expo start` (yerel duman) durur. Closed Testing / TestFlight / mağaza paketi **Faz 1 kapanana kadar yasak**.

---

## 2. Commit özeti

Önceki HEAD: `c959ba6`. Çalışma ağacı üç commit'e bölündü. Ara commit'ler dosya sınırına göredir; mühür **son ağaçtadır**.

```
952a031 feat(kernel): citizen notice, quick-top-up ve core entegrasyonları
81b2d1f feat(dron): rail-is Diyar B dron mimarisi ve v1 zarfı
e505012 chore(docs): kalıcı belgeler .system_docs altına taşındı
```

`c959ba6..952a031`: **281 dosya**, +27162 / −3360.

### `e505012` — `chore(docs): kalıcı belgeler .system_docs altına taşındı`

21 dosya. Kalıcı beşli (`ANAYASA`, `MANIFESTO`, `OPS_RUNBOOK`, `STORAGE_CONTRACT`, `README`) + `DRON_CLIENT_SPEC` `/.system_docs` altına alındı. Eski `/docs` anayasa/ops/tespit-tedavi serisi silindi. Günlük seri `docs/1_TESPIT_RAPORU.md` ile yeniden açıldı. Surface: `tests/kernel/system-docs-contract-surface.test.ts`.

### `81b2d1f` — `feat(dron): rail-is Diyar B dron mimarisi ve v1 zarfı`

60 dosya. `apps/rail-is` (Diyar B, Expo) + çekirdek v1 zarfı (`api-v1`, `v1-contract`, `v1-envelope`, `v1-hop-gate`, `v1-runtime-shield`, `openapi-v1.json`) + dron/v1 testleri. ESLint `apps/**` yoksayar. CI ve paket bayrağı yayın hattını donuk tutar.

Dron **Amiral `app/` değildir.** `/api/v1` hop allowlist top-up taşımaz. Cüzdan yükleme native PayTR/IAP değildir.

### `952a031` — `feat(kernel): citizen notice, quick-top-up ve core entegrasyonları`

200 dosya. Vatandaş bildirimi (`lib/kernel/notice/`), hızlı yükleme, PayTR callback kalkanı, emanet TTL uyarısı, runtime readiness, teslim kahramanı, akademi sertifika API, freelancer core, pazaryeri vitrin fail-closed, env şablonu, Prisma/şema ve ilgili testler.

### Mühür sonrası çalışma ağacı (bu tedavinin ADIM 2'si)

Üç commit'ten **sonra** hız tavanı portu eklendi (aşağı §3). Bu rapor yazıldığı anda commit'lenmemiştir; kasten mühür üçlüsünden ayrı tutuldu. Kalan izler:

- `lib/kernel/security/rate-limit-port.ts` (yeni)
- `lib/kernel/security/http-rate-limit.ts` (port altına alındı)
- `tests/kernel/http-rate-limit.test.ts` (port tanığı)
- `docs/2_TEDAVI_RAPORU.md` (bu dosya)
- `.cursorindexingignore` (ajan indeksi; ürün mührü değil)

Bir sonraki ince commit bu dörtlüyü (indeks dosyası hariç) alabilir. Yeni oda açmaz.

---

## 3. Hız tavanı port soyutlaması

Tespit §5 Adım 3 / CEO kararı. Anayasa dış önbellek (Redis) eklenmesini yasaklar; **port eklemek Redis eklemek değildir.**

### Ne değişti

| Dosya | Rol |
|-------|-----|
| `lib/kernel/security/rate-limit-port.ts` | `RateLimitPort` + `RateLimitWindow` + `RateLimitDecision` + `createInMemoryRateLimitPort()` |
| `lib/kernel/security/http-rate-limit.ts` | HTTP adaptörü: aynı export imzaları, içeride port `consume` |

Süreç-içi `Map` kovası portun varsayılan implementasyonuna taşındı. HTTP başlıkları (`X-RateLimit-*`, `Retry-After`) ve 429 JSON zarfı adaptörde kaldı.

### Ne değişmedi (çağıran)

`consumeHttpRateLimit`, `applyHttpRateLimit`, `matchEdgeRateLimit`, `rateLimitedJsonResponse`, `resetHttpRateLimitBucketsForTests`, `HTTP_RATE_LIMITS`, `resolveRequestIp` — imza ve davranış aynı.

Çağıranlar:

- `proxy.ts` (kenar)
- `app/api/(kernel)/wallet/top-up/route.ts`

`ioredis` / `redis` / `@upstash/redis` import'u yok. Test bunu mühürler. İkinci replica kararı gelirse yalnız `RateLimitPort` bağlanır; `proxy.ts` ve top-up rotası dokunulmaz.

---

## 4. Faz 1 Halka Dönüş Çeklisti — kalan 3 OPS/ENV adımı

Kodda dört basamak laboratuvar e2e ile mühürlüdür (`three-ring-e2e-surface`, T3/T4 loop betikleri). **Canlı defterde okunmamıştır.** Sahte bakiye, mock checkout, elle SQL CREDIT yasaktır.

Hedef hareket (tek vatandaş, tek kimlik):

```
CREDIT  cüzdan yükleme
DEBIT   kurs satın alma        (ticari dikey — rail-temel)
DEBIT   emanet kilidi          (freelancer accept)
CREDIT  emanet çözümü          (release, net kazanç)
```

Tanık: `LedgerEntry` satırları + `/academy/dogrula/[hash]` geçerli mühür. Ekran görüntüsü değil, sorgunun kendisi.

Bunun **canlıya geçişi** için kalan üç OPS/ENV adımı — yeni kod değil:

### OPS-1 — Supabase Direct omurga

`.env.local` (müze `.env` kopyalanmaz):

- `DATABASE_URL` — session-mode Postgres (`:5432`; transaction-mode `:6543` yasak)
- `DIRECT_URL` — `db.<ref>.supabase.co:5432` (`pooler.supabase.com` yasak)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`service_role` yazılmaz)

Sonra `npm run ops:migrate` (Prisma deploy + kilitli SQL). Boş halka sahte bakiye ile doldurulmaz. Vatandaş `/register` ile doğar.

### OPS-2 — PayTR canlı üçlü + panel Bildirim URL

CREDIT yükleme başka yoldan doğmaz.

- `PAYTR_MERCHANT_ID` + `PAYTR_MERCHANT_KEY` + `PAYTR_MERCHANT_SALT` birlikte dolu
- Üretimde `PAYTR_SANDBOX` ve `PAYTR_ALLOW_MOCK_CHECKOUT` yasak (throw; CREDIT yok)
- Panel: mağaza **aktif**, **iFrame yetkisi** açık, Bildirim URL = `https://<kök>/api/payments/webhooks/paytr` (üyelik / Basic Auth / WAF / JWT **konmaz**)
- `NEXT_PUBLIC_APP_URL` üretimde `https://` genel köken (localhost yasak)

İlk tanık: `PaymentOrder.status=CLEARED` + `LedgerEntry` CREDIT `wallet-top-up:{oid}` + cüzdan `amount_minor`. Band ₺10–₺20.000.

### OPS-3 — Inngest Cloud çift anahtar

Valör taraması ve emanet TTL olmadan canlı halka yarım kalır (webhook 500 tekrarı / TTL iade durur).

- `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` (ikisi de dolu)
- Üretimde `INNGEST_DEV` yazılmaz
- Doğrulama: `npm run ops:runtime-readiness` çıkış 0; `GET /api/health` → `checks.inngest = configured`; `/api/jobs/inngest` üretimde 503 **değil**

`NOTICE_SMTP_*` bu üçlünün parçası **değildir**: boşsa e-posta atlanır, nakit durmaz. Super Admin UUID katalog PATCH içindir; tohum `rail-temel` `ops:migrate` ile gelir.

Bu üçü bağlandıktan sonra iş kod yazmak değil: **o tek insanı bulup dört basamağı defterde okumak.** Okunursa Faz 1 kapanır. Okunmazsa dron donuk kalır.

---

## 5. Görüş — "Sen olsaydın ne yapardın?"

### Tedavi sonrası sağlık

Omurga **sağlam**. Kırmızı çizgiler (12 oda, `amountMinor`, `service_role` yok, S43, LLM gümrüğü, oda duvarı) çiğnenmedi. Tespitin en büyük operasyonel riski — ~240 dosyalık mühürsüz kitle — kapanmıştır. `verify:prebuild` artık commit'lenmiş (ve portlu) ağaçta yeşildir. Dron mimari olarak durur, yayın olarak durmaz. Bu, müze hastalığının (cilalı vitrin, dönmemiş halka) dron kılıfıyla geri gelmesini bugün için keser.

Eksik olan motor değildir. Eksik olan **canlı defter tanığıdır.** Kodun "üç halka e2e geçti" demesi, bir vatandaşın CREDIT gördüğü anlamına gelmez.

### Faz 3 (PayTR / Inngest / Supabase bağlama) — hazır mıyız?

**Canlı bağlama için kod evet; bunu Faz 3 diye atlamak hayır.**

PayTR / Inngest / Supabase Direct bağlamak Manifesto'da Faz 1 kapanışının OPS omurgasıdır (`OPS_RUNBOOK` §13, tespit §6.4). Yeni oda değildir. `ops:runtime-readiness` fail-closed raporu durur. Env şablonu dürüst boş bırakılmıştır.

Bu yüzden:

- **Bağlamaya hazırız** — kalan iş anahtar, panel tıklaması ve `ops:migrate`. Yeni yüzey açılmaz.
- **Faz atlamaya hazır değiliz.** Dron yayını, ikinci dron, Redis, 13. oda, S43 çekim yok. Dört basamak okunmadan "Faz 3'e geçtik" demek, müzenin sözlü mutabakat ölümüdür.
- **Sıra:** OPS-1 → OPS-2 → OPS-3 → tek vatandaş defteri. Yeşilse Faz 1 kapanır, **o zaman** Faz 2'ye döndürerek girilir (dron yayın kilidi kalkar). Yeşil değilse tek iş bu üç OPS adımıdır.

Ben **OPS-1'i yarın sabah** derim. Panel ve Cloud anahtarları koddan daha yavaştır; onları beklerken yeni ekran yazılmaz.

---

## Kapanış mührü

Mühürlenmemiş kod, kanıtlanmamış koddu — o kitle artık üç commit'tedir. Dron askıdadır. Hız tavanı portludur, Redis değildir. Halka hâlâ dönmemiştir.

Çelişki hâlinde `.system_docs/ANAYASA.md` bağlayıcıdır.

---

*13. oda yoktur. Vize kapısı dönüşüm için gevşetilmez. Bankaya çekim kapalıdır. Dron yayını Faz 1 kapanana kadar donuktur. Müze `yetkin.ai/` Rail git'ine girmez.*
