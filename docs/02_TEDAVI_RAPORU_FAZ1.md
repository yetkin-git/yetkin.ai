# Tedavi Raporu — Faz 1 (Mühür ve Kalkan Onarımı)

| Alan | Değer |
|------|--------|
| Tarih | 17 Ağustos 2026 |
| Yazar | Baş yazılım mimarı (Cursor) |
| Gövde | `d:\yetkin_rail` |
| Tespit SSOT | `docs/01_TESPIT_RAPORU.md` |
| Anayasa | `docs/ANAYASA.md` |
| Kapsam | T0 seremoni geri yükleme, ince CI takibi, DevLabs katalog tohumu |
| Dışarıda | T2 omurga bağlama, Akademi canlı dumanı, yeni oda, müze taşıma, commit |

Ürün kodu bu dilimde **yalnız unutulmuş katalog satırı** için değişti. Seremoni dosyaları yeniden yazılmadı; HEAD’ten geri alındı. Sahte `phase` yazılmadı. 13. oda açılmadı.

---

## Teşhis (Faz 1 girişi)

`docs/01_TESPIT_RAPORU.md` Kova 3 / P0–P1: motor mühürlü, belge kalkanı çalışma ağacında kırık, DevLabs nakit kapısı sicilde yok, ince CI takipsiz.

| Boşluk | Giriş durumu | Etki |
|--------|--------------|------|
| T0 seremoni | HEAD’te var, çalışma ağacında `D` | `ops-migrate-surface.test.ts` `readSrc` ile patlar; `verify:prebuild` kırmızı |
| İnce CI | `.github/workflows/ci.yml` diskte, git’te yok | `main` push’unda mühür zinciri koşmaz |
| DevLabs fiyat | `lib/devlabs/bench.ts` `findActiveEntry("devlabs", "generation:code")` ister; sicil 7 anahtarda durur | mühürlü oda generate’de fail-closed “katalog yok” |

Bu üçü yeni peron değildir. Kalkan ve unutulmuş tohumdur.

---

## Yapılan düzeltmeler

### 1. Silinen T0 dosyaları — HEAD’ten geri al

Komut (yeniden icat yok):

```
git checkout HEAD -- docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md docs/07_tedavi_raporu_d3_nihai_muhur.md
```

| Dosya | Sonuç |
|-------|--------|
| `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` | çalışma ağacında duruyor; `npm run ops:migrate`, `studio-assets.sql`, `phase` yasağı içerik olarak duruyor |
| `docs/07_tedavi_raporu_d3_nihai_muhur.md` | çalışma ağacında duruyor; “üç halka” + “fail-closed” içerik olarak duruyor |

Anayasa “Canlıya geçiş” / D3 satırları ve runbook §14 ölü linki kapanır. `tests/kernel/three-ring-e2e-surface.test.ts` D3 varlığını `existsSync` ile ister; yeşil.

**Bilerek geri alınmayanlar:** `docs/tespit_raporu_v1.md`, `docs/Tespit_Raporu.md`, `docs/tedavi_raporu_v2_t0_t1.md`. Faz 1 görevi iki seremoni dosyasıdır. Tarihsel arşiv ayrı karar.

### 2. İnce CI — git takibi

`.github/workflows/ci.yml` indekse alındı (`git add`). Müze `staging-deploy.yml` / Playwright / Docker / tam `npm test` **eklenmedi**.

İş:

- Node 20.19, `npm ci`, `npm run verify:prebuild`, ardından `npm run typecheck`.
- `verify:prebuild` zaten typecheck içerir; CI typecheck’i bir kez daha koşar. Bu sadeleştirme **yapılmadı** — görev takibe almak ve prebuild’i doğrulamaktır.

Dosya henüz commit edilmedi. Takip, bir sonraki commit ile uzakta görünür.

### 3. DevLabs katalog tohumu — sicil = motor

Motor `DEVLABS_MODULE_KEY` / `DEVLABS_CODE_UNIT_KEY` (`devlabs` / `generation:code`) okur. Sicil bu anahtarı basmazdı. Tohum eklendi; yeni peron değil.

| Yüzey | Değişiklik |
|-------|------------|
| `lib/kernel/pricing/catalog-definitions.ts` | 8. birim: `devlabs` / `generation:code`, `seedAmountMinor = 150`, `seedMinMinor = 150`, `seedMaxMinor = null` |
| `supabase/migrations/20260814040000_price_catalog_definitions.sql` | `cat_devlabs_generation_code` upsert satırı (yedi SQL kilitli kaldı; 8. dosya yok) |
| `prisma/migrations/20260817010000_devlabs_generation_code_catalog/migration.sql` | Studio görsel tohumu ile aynı `ON CONFLICT` / Super Admin `updated_by` koruması |
| `tests/kernel/catalog-definitions.test.ts` | motor sabitleri (`DEVLABS_MODULE_KEY`, `DEVLABS_CODE_UNIT_KEY`) sicil + Prisma SQL ile kilitlendi |
| `docs/07_OPS_RUNBOOK.md` §9 | `devlabs:generation:code` ops tohumunda; yoksa 4xx, debit yok |

**Tutar neden 150?** Studio metin tabanı 100, görsel 250. DevLabs bellek testi (`tests/devlabs/linter-flow.test.ts`) katalog tabanını zaten **150** kullanıyordu. Tohum, motorun test ettiği tabanla aynı `amountMinor` dilimidir. Satış fiyatı kod sabiti değildir (S11-A); Super Admin PATCH `updated_by` doluysa `ops:migrate` / Prisma yeniden oynatma tutarı ezmez.

Kernel dikey oda import etmez: sicil string anahtar taşır. Eşitleme testi `tests/kernel` içinde motor sabitlerini okur.

**Canlı satır henüz yazılmadı.** Disk tohumu, bağlı Postgres’te `prisma migrate deploy` + `ops:migrate` (katalog SQL upsert) olmadan `price_catalog_entries` satırı doğurmaz. Bu T2 ops işidir.

---

## Doğrulama

Tarih: 17 Ağustos 2026. Canlı Postgres yok. Sahte bakiye basılmadı.

### Hedef yüzey

```
npx vitest run tests/kernel/ops-migrate-surface.test.ts tests/kernel/catalog-definitions.test.ts tests/kernel/cash-loop-catalog-migrate-surface.test.ts tests/kernel/three-ring-e2e-surface.test.ts
```

| Dosya | Sonuç |
|-------|--------|
| `tests/kernel/ops-migrate-surface.test.ts` | **5/5 geçti** (19 ms) |
| `tests/kernel/catalog-definitions.test.ts` | **4/4 geçti** (17 ms) |
| `tests/kernel/cash-loop-catalog-migrate-surface.test.ts` | **4/4 geçti** (16 ms) |
| `tests/kernel/three-ring-e2e-surface.test.ts` | **4/4 geçti** (45 ms) |
| Toplam | **17/17**, 4 dosya |

### Prebuild zinciri

```
npm run verify:prebuild
```

Sıra Anayasa ile aynı: `no-secrets` → `amount-minor` → `ai-gateway` → `rls-status` → `api-auth` → `boundaries` → `sen-axis` → `atomic-seals` → `test:surface` → `typecheck`.

| Adım | Çıktı |
|------|--------|
| `verify:no-secrets` | OK — PEM / service_role JWT / yasaklı `.env.example` ataması / git `.env` yok |
| `verify:amount-minor` | OK — integer minor + PayTR sınır katmanı |
| `verify:ai-gateway` | OK — tek gümrük |
| `verify:rls-status` | OK — Auth sync + FORCE RLS + owner SELECT (Prisma tabloları listelendi; `devlabs_*` dahil) |
| `verify:api-auth` | OK — 86 route (`session` 81, `public` 2, `admin` 1, `webhook` 2) |
| `verify:boundaries` | OK — kernel↛dikey; katalog `ON CONFLICT` Super Admin tutarını korur |
| `verify:sen-axis` | OK — 325 dosya, 25 siz kaçağı tarandı |
| `verify:atomic-seals` | OK — 53 surface test dosyası |
| `test:surface` | **54 dosya / 162 test geçti** (içinde `ops-migrate-surface`) |
| `typecheck` | Prisma Client 7.9.1 üretildi; `tsc --noEmit` **çıkış 0** |

`verify:prebuild` **çıkış 0**.

---

## Bilinçli yapılmayanlar

- 13. oda, Redis, Socket, GİB, çekim, Turnstile, DevLabs exec/sandbox
- `EXPECTED_SQL` yedisine 8. dosya
- Faz 5 Prisma init SQL’ini geriye dönük düzenlemek (uygulanmış migrasyon)
- Anayasa envanter yolunu bu rapora kilitlemek (ayrı dilim; `01_TESPIT_RAPORU.md` zaten kanonik tespit)
- `.env.local` / `ops:migrate` / PayTR / Inngest Cloud (T2)
- Akademi satın al → oyna → sınav canlı dumanı (Faz 2)
- Bu dilimde git commit (istenmedi)

---

## Kalan risk (Faz 1 kapanışı)

1. **Commit yok.** Seremoni geri yüklendi; CI staged; katalog yaması çalışma ağacında. Push olmadan uzak `main` kalkanı hâlâ takipsizdir.
2. **Canlı katalog satırı yok.** Kod + SQL tohumu üretim Postgres’ine `ops:migrate` olmadan girmez. Generate hâlâ fail-closed “katalog yok” der — doğru davranış, tohum uygulanana kadar.
3. **T2 omurga boş.** Boş env dürüst kapalı yüzeydir; sahte yeşil değildir. Akademi dumanı omurga bağlanmadan “canlı kanıt” sayılmaz.
4. **Hız tavanı tek süreç.** D3 mührü duruyor; replica açılmaz.

---

## Karar özeti

| Sıra | İş | Durum |
|------|-----|--------|
| 1 | T0 seremoni `git checkout` | **tamam** — surface yeşil |
| 2 | `.github/workflows/ci.yml` git takibi | **indekste** — commit bekler |
| 3 | DevLabs `generation:code` sicil + ops SQL + Prisma tohum | **tamam** — 8 birim; motor anahtarı kilitli |
| 4 | `verify:prebuild` | **çıkış 0** |

Faz 1 kalkan onarımını kapatır. Öğrenme halkasının canlı kanıtı bu raporun konusu değildir.
