# KURUMSAL — TEDAVİ RAPORU

**Kapsam:** Faz 1 (`F1.1`–`F1.6` + `O-07`) + Faz 2 (`F2.1`–`F2.11` + `D-01`–`D-03`)
**Tarih:** 2026-11-26
**Sonuç:** Faz 1 ve Faz 2 kalemleri kodlandı; doğrulama kapıları yeşil.

---

## Faz 1 — özet (önceki)

| # | Bulgu | Durum |
|---|---|---|
| **F1.1** | K-01 tahsilat 410 | **Kapandı** |
| **F1.2** | Kokpit satın alma yok | **Kapandı** |
| **F1.3** | `/ilan` dizini + sitemap | **Kapandı** |
| **F1.4** | Soft 404 | **Kapandı** |
| **F1.5** | İlan kapat/aç + CSV | **Kapandı** |
| **F1.6** | KVKK kapanış + 90g | **Kapandı** |
| **O-07** | Test görünürlüğü | **Kapandı** |

---

## Faz 2 — tedavi özeti

| # | Bulgu | Durum | Ne yapıldı |
|---|---|---|---|
| **F2.1** | Y-01 lisans kotası | **Kapandı** | Her CLEARED `job-screening-pack` × **3 ilan**; aşımda `402` + satın alma yolu. |
| **D-01** | Gevşek `purpose contains` | **Kapandı** | Yalnız `KURUMSAL_SCREENING_ORDER_PURPOSE` / tanımlı önek + birim; `contains` yok. |
| **F2.2** | Y-03 işveren doğrulama mirası | **Kapandı** | Aynı `ownerUserId`+`taxNumber` doğrulanmışsa yeni ilan miras alır; ops mühürü peer `updateMany`. Admin ops formu. |
| **F2.3** | Y-07 VKN/TCKN checksum | **Kapandı** | Gerçek checksum + sentetik dizi reddi; `taxNumber` zorunlu; çapraz hesap sahipliği `409`. |
| **F2.4** | Y-04 lead kuyruğu iş akışı | **Kapandı** | `status`/`handledAt`/`handledBy`/`adminNote`; sayfalama; `PATCH /api/admin/b2b/[id]`. |
| **F2.5** | Y-04 mükerrer + honeypot | **Kapandı** | 24s aynı e-posta+paket → `200` + `duplicate:true`; `website`/`companyWebsite` honeypot. |
| **D-02** | İl serbest metin | **Kapandı** | 81 il normalizasyonu (select + sunucu). |
| **D-03** | Fiyat anlık görüntüsü yok | **Kapandı** | `quotedAmountMinor` katalogdan talep anında. |
| **F2.6** | O-01 kokpit yükü | **Kapandı** | `take` tavanı (40 ilan / 80 başvuru); CV önizleme 200 karakter. |
| **F2.7** | O-02 e-posta teyidi | **Kapandı** | `emailConfirmedAt` yoksa `403` — "Başvurmadan önce e-posta adresini doğrula." |
| **F2.8** | O-03 kenar rate-limit | **Kapandı** | `isKurumsalMutationPath` + `leadIp` / `kurumsalMutationIp`; handler’da `extraIdentity: userId`. |
| **F2.10** | O-05 vitrin | **Kapandı** | İK odaklı kartlar; ajans kartı kaldırıldı; fiyat slotu canlı katalog veya **"Özel Teklif Al"**. |
| **F2.11** | O-06 persistBands | **Kapandı** | Tek transaction + yalnız değişen satırlar `updateMany` ile. |

Dürüstlük sınırları korundu: puan satın alınamaz; istemci alt puan gönderemez; doğrulanmamış işveren `noindex` + sitemap dışı; CSV’de ham CV metni yok; fiyat uydurulmaz.

---

## Doğrulama kapıları (Faz 2 sonrası)

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | **PASS** |
| `npm run verify:sen-axis` | **PASS** — 731 dosya |
| `npm run verify:boundaries` | **PASS** |
| `npm run verify:api-auth -- --check` | **PASS** — 178 route (`admin:17` …) |
| `npm run verify:rls-status` | **PASS** — `kurumsal_offer_requests` + job tabloları sicilde |
| `npm run verify:no-secrets` | **PASS** |
| `npm run verify:idor-seals` | **PASS** — 5 dosya / 17 test |
| `npm run verify:v1-contract-freeze` | **PASS** |
| `npx vitest run tests/sales tests/kurumsal` | **PASS** — 8 dosya / 47 test |
| `npx next build` | **PASS** |

---

## Dosya envanteri (Faz 2)

### Yeni
- `lib/sales/kurumsal-screening-purpose.ts`
- `lib/sales/kurumsal-lead-city.ts`
- `lib/sales/kurumsal-lead-quote.ts`
- `lib/kernel/admin/kurumsal-offer-parse.ts`
- `lib/kernel/admin/kurumsal-offer-write.ts`
- `app/api/(kernel)/admin/b2b/[id]/route.ts`
- `components/kernel/admin-kurumsal-offers.tsx`
- `prisma/migrations/20261126010000_kurumsal_faz2_lead_quota/migration.sql`
- `tests/sales/kurumsal-faz2.test.ts`

### Güncellenen (özet)
- `lib/sales/kurumsal-screening-entitlement.ts` — kesin purpose + kota
- `lib/sales/kurumsal-screening.ts` — VKN/TCKN checksum, zorunlu tax
- `lib/sales/kurumsal-screening-load.ts` — kota 402, miras, sayfalama, e-posta kilidi, persistBands
- `prisma/schema/b2b.prisma` — offer status alanları + indeksler
- `app/api/lead/route.ts` — mükerrer / honeypot / il / quote
- `app/api/kurumsal/ilanlar/route.ts`, `app/api/ilan/[slug]/basvuru/route.ts` — userId rate-limit + e-posta teyidi
- `lib/kernel/security/http-rate-limit.ts` — kenar kurumsal yolları
- `app/api/(kernel)/admin/ops/employer-verify/route.ts` — peer doğrulama
- `components/kernel/admin-ops-actions.tsx` — işveren doğrula formu
- `app/(kernel)/admin/b2b/page.tsx` — sayfalama / durum / PATCH UI
- `app/(public)/kurumsal/page.tsx` — İK vitrini
- `lib/pricing/showcase-price.ts` — `Özel Teklif Al`
- `components/kurumsal/offer-form.tsx` — 81 il + honeypot
- `lib/kernel/security/route-auth-map.ts`, `lib/kernel/http/web-only-write-routes.ts`, `lib/copy/sen-voice/admin.ts`

---

## Kabul kriteri kontrolü (Faz 2)

| Kriter | Kanıt |
|---|---|
| Kota aşımında 402 | `assertKurumsalScreeningEntitlement` → `quota-exhausted` + `PaymentRequiredError` |
| Purpose `contains` yok | `kurumsal-screening-purpose.ts` + faz2 testi |
| VKN/TCKN checksum | `isValidTurkishVkn` / `isValidTurkishTckn`; `1234567890` reddedilir |
| Doğrulama mirası | `priorVerified` create; ops `updateMany` aynı tax |
| Lead mükerrer | `duplicate: true` 24s pencere |
| `emailConfirmedAt` 403 | `startKurumsalJobExam` + basvuru rotası |
| Kenar rate-limit | `matchEdgeRateLimit('/api/lead','POST')` → `leadIp` |
| Vitrin İK | ajans kartı yok; `Özel Teklif Al` / canlı fiyat |

---

*Faz 2 tedavi tamam. Tespit §9.3 olgunlaşma kalemleri kapatıldı.*
