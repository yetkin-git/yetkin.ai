# TEDPA-01 — Tedavi Raporu

| Alan | Değer |
|------|--------|
| Rapor kimliği | TEDPA-01 |
| Tarihi | 30 Eylül 2026 |
| Dayanak | TESPAS-01 (`docs/TESPIT_RAPORU_01_GLM.md`) |
| Dal | `main` (origin/main önünde 5 commit; push yok) |
| İlke | Çalışan ağaç bozulmadan, istenen dosya kesimleri git'e alındı. Sır değeri yazılmadı. |

---

## 0. Yönetici özeti

Yetim dosyalar ve istenen silmeler beş commit ile git geçmişine girdi. İstenen dörde ek olarak beşinci commit, EC-102 migration'ının kilitli SQL listesini kırdığı için eklendi. Bu olmadan `tests/kernel/ops-migrate-logic.test.ts` kırmızı kalıyordu.

Push yapılmadı. Beş commit tek başına `npm run typecheck` geçirmez: `production-seal-disk.ts` commit edildi, çağırdığı `registerAcademyProductionDiskProbe` ise hâlâ işlenmemiş `lib/academy/production-standard.ts` farkının içindedir. Yerel çalışma ağacı typecheck'ten geçti. Uzak CI, commit'leri yalnız checkout eder.

Yorum, pedagoji ve E2E notu çalışma ağacında duruyor. Bu rapor da commit edilmedi.

---

## 1. Atomik commit'ler

### Commit 1 — `bdd21f0`

`feat(kernel): add missing SSOT modules, audio grants and updated cursorrules`

6 dosya:

- `lib/kernel/catalog-ids/exam-path.ts`
- `lib/academy/free-preview-audio.ts`
- `lib/academy/production-seal-disk.ts`
- `lib/academy/lesson-text-standard.ts`
- `tests/academy/lesson-text-standard.test.ts`
- `.cursorrules`

### Commit 2 — `bc2617e`

`feat(academy): commit EC-102 curriculum assets and cinema frames`

63 dosya. Müfredat (`ecommerce_ai/`), altı konuşma metni, 12 ses dosyası (6 ders MP3 + 6 müzik yatağı, toplam 216.234.404 bayt / yaklaşık 206 MB), iki ısınma MP4, 31 EC-102 sinema karesi, 6 OFF-201 `cue-1` karesi, `scripts/bake-ec102-nano-slides.ts`, `scripts/ingest-ec102-spoken-bodies.ts`.

En büyük tek dosya `02_ecommerce_ai-6.mp3` (41.369.325 bayt, yaklaşık 39,5 MB). GitHub'ın 100 MB dosya tavanının altında. LFS açılmadı; OFF-101 MP3'leri de düz git'te. Dört ve beşinci kurs öncesi varlık kararı ayrıca verilmeli.

Bu commit'teki `ecommerce_ai/index.ts`, çalışma ağacında olup henüz commit edilmemiş `academyCourseVoiceSeal` ve `applyAcademySectionPreviewGate` sembollerini çağırır. Yerel ağaç derlenir. Commit tek başına checkout edilirse bu iki sembol HEAD'de yoktur.

### Commit 3 — `1bd5b9b`

`feat(db): add EC-102 publish migration and phase2 drafts`

9 dosya: `supabase/migrations/20260929180000_ec102_publish.sql` ve `lib/academy/curricula/phase2-drafts/parent_teacher_ai/` (8 dosya).

### Commit 4 — `5932594`

`docs: organize system docs, clean retired files and append TESPAS-01 report`

30 dosya.

- `docs/` altında 18 silme onaylandı (günlük raporlar, `docs/ops/akademi-bake-elkitabi.md`, `docs/ops/DURUM.md`, `docs/specs/freelancer-vize-kapisi.md`).
- `lib/academy/curricula/parent_teacher_ai/` silindi (8 dosya). Gövde commit 3'te `phase2-drafts/` altına taşınmıştı.
- `.system_docs/AKADEMI_URETIM_ANAYASASI.md` ve `docs/TESPIT_RAPORU_01_GLM.md` eklendi.

Sıfır-risk sapması: silinen eski yolu hâlâ import eden iki satır aynı commit'e alındı. Alınmasaydı commit edilmiş `phase2-drafts.ts` ve `phase2-exam-readiness.ts` kırık import bırakırdı.

- `lib/academy/curricula/phase2-drafts.ts`
- `lib/academy/curricula/phase2-exam-readiness.ts`

`AKADEMI_URETIM_ANAYASASI.md` commit'e girmeden önce işaretçi cümleleri eklendi. Bu cümleler beş medya katmanının tek tanımını PEDAGOJI §B «Zorunlu üretim sırası»na bağlar. O başlık çalışma ağacındaki PEDAGOJI'de var. Commit edilmiş PEDAGOJI sürümünde yok. İki dosya birlikte işlenmeden bu işaretçi checkout'ta boşta kalır.

### Commit 5 — `a320f5c` (istenen dörde ek)

`test(db): lock EC-102 publish SQL in the migration seal`

EC-102 SQL dosyası diskte belirince kilit `EXPECTED_SQL` onu tanımıyordu. `npm test` içindeki `ops-migrate-logic` kırmızıydı. Güncellenen dosyalar:

- `scripts/ops-migrate-lib.ts` — listeye `20260929180000_ec102_publish.sql` eklendi (11. dosya, sıra korunur).
- `scripts/ops-migrate.ts` — operatör cümlesi «on bir SQL».
- `tests/kernel/ops-migrate-logic.test.ts`
- `tests/kernel/saha-pilotu-surface.test.ts`
- `tests/kernel/cash-loop-catalog-migrate-surface.test.ts`

---

## 2. Kod ve yorum

Yorumlar çalışma ağacında güncellendi. Bu dosyalar zaten geniş ve işlenmemiş fark taşıdığı için dört commit'e alınmadı.

- `app/academy/page.tsx`: OFF-101, OFF-201 ve EC-102 canlı. Satış hükmü `academyCourseSaleOpen`. `03` / `04` / `05` dürüst «Çok Yakında» kabuğu.
- `lib/academy/pilot-sku.ts`: EC-102 artık «hazırlanıyor» diye yazılmıyor. Aynı üç boş kabuk «Çok Yakında / Hazırlanıyor» olarak duruyor. Çalışma zamanı değişmedi.

### E2E müşteri kutusu

`.env.local` içinde `E2E_T4_CLIENT_EMAIL` kanonik süper admin adresiyle aynı. Değer değiştirilmedi. Yeni bir test kutusu açılmadan adres değiştirmek T4 halkasını kırar. Şifre bu raporda yoktur.

Yapılandırma notu `.env.example` içine yazıldı: T4 müşteri kutusu ayrı bir test hesabıdır; süper admin adresi bu değişkene yazılmaz; ayrıştırma operatör işidir. `.env.example` commit edilmedi.

---

## 3. Kurallar ve doküman

Çalışma ağacında, commit edilmeden:

**PEDAGOJI.md.** Beş medya katmanının listesi §B «Zorunlu üretim sırası» altında tek tanım. Giriş, rol tablosu, üretim paragrafı ve §E.5 bu maddeye döner. Üç kapının tek tanımı aynı bölümde:

1. Taslak metin — operatör ve süreç. Kod fail-closed zorlamaz.
2. Gözden geçirme — operatör ve süreç. Kod fail-closed zorlamaz.
3. Son kontrol — kod. `assertAcademyProductionSeal` beş katman diskte yoksa `--seal` basmaz.

**ANAYASA.md B4.** Aynı ayrım eklendi. Mühür cümlesi test kilidi olarak duruyor: `beş katmanın tamamı teyit edilmeden `--seal` basılamaz`.

**AKADEMI_URETIM_ANAYASASI.md.** İşaretçi cümleleri commit 4'te. Ayrıntı bölüm 1'de.

---

## 4. Doğrulama

| Kapı | Sonuç | Not |
|------|--------|-----|
| `npm run typecheck` | Yeşil | Çalışma ağacı. Prisma generate + `tsc --noEmit`. |
| `tests/academy/lesson-text-standard.test.ts` + `tests/academy/production-standard.test.ts` | 8/8 yeşil | Pedagoji ve mühür cümlesi kilitleri. |
| `npm test` | 20 kırmızı, 1155 yeşil, 1175 test | SQL kilidi bu koşuda kırmızıydı; commit 5 sonrası `ops-migrate-logic` yeniden koşuldu ve geçti. Tam süit tekrar koşulmadı. |
| `tests/kernel/ops-migrate-logic.test.ts` | Yeşil | Commit 5 sonrası. |
| `tests/kernel/cash-loop-catalog-migrate-surface.test.ts` | Yeşil | Commit 5 sonrası. |
| `npm run verify:prebuild` | Kırmızı | `openapi-v1.json sapması`. Kaynak: işlenmemiş `lib/kernel/http/v1-contract.ts` ve `packages/kernel/src/http/v1-envelope.ts`. Bu tedavi o dosyalara dokunmadı. `verify:no-secrets`, `verify:amount-minor` ve `verify:rls-status` geçti. Zincir OpenAPI kontrolünde durdu. |

`saha-pilotu-surface` SQL sayısını 11 kabul etti, sonra ayrı bir kilitte durdu: Prisma klasör sayısı kilitli 33, diskte 35. Bu sayı TEDPA dosya listesinden gelmiyor.

`npm test` içindeki diğer kırmızılar da bu tedavinin commit'lerinden değil, işlenmemiş çalışma ağacından. Örnekler: OpenAPI açıklamasında «Modüler Monolit» ile commit'teki «Pragmatik Monolit» sapması, katalog PATCH, proxy kenarı, OFF-201 hazırlık, mühürlü ses süresi. Commit edilmiş PEDAGOJI hâlâ «Gemini 3.8 Flash TTS» taşıyor; çalışma ağacı taşımıyor. `off-102-draft` testi bu yüzden yerel ağaçta kırmızı, commit checkout'unda değil.

---

## 5. Bilinçli olarak commit edilmeyenler

İşlenmemiş ağaç: 164 değişiklik, 19 silme, 0 yetim dosya (bu rapor yazılmadan önceki sayım; raporun kendisi yeni yetimdir).

Silme olarak duran ve commit 4'e alınmayanlar:

- `lib/academy/lesson-cues/03_social_media_ai-*.json` (6)
- `lib/academy/lesson-cues/04_chatbot_nocode-*.json` (6)
- `lib/academy/lesson-cues/05_prompt_practice-*.json` (6)
- `scripts/ingest-ecommerce-ai-sections.ts`

Bunlar CEO listesinde yoktu. Boş kabuk cue'ları ve eski ingest betiği ayrı bir kesim ister.

Push engeli olan işlenmemiş dilim: `lib/academy/production-standard.ts` imza değişikliği (`assertAcademyProductionSeal` artık `{ courseSlug, lessonKey }` alır ve diski okur) ile buna bağlı testler. Eski testler hâlâ `{ text, voice, video, visual, music }` geçirip «Video (Veo)» / «Müzik (Lyria)» bekliyor. Disk modülüyle mühür imzası aynı commit'te olmalı. Pedagoji reformu da kendi test kilidiyle aynı kesimde olmalı. Aksi halde CI birini yeşil yaparken diğerini kırar.

---

## 6. Sonraki aşama — FAZ 1'de ilk iş

İlk iş yeni kurs üretimi değil. Kalan işlenmemiş dalgayı, CI'yi kırılmadan, şu sırayla kapatmak:

1. Mühür dilimi: `production-standard.ts` + `production-seal-disk.ts` çağıranlar + bu imzayı kilitleyen testler. Bu dilim inmeden beş commit push edilmez.
2. Pedagoji dilimi: çalışma ağacındaki PEDAGOJI / ANAYASA tek tanımı, onu kilitleyen testlerle birlikte. Böylece commit 4'teki üretim kartı işaretçisi boşta kalmaz.
3. Üretim env teyidi: Vercel'de `CANONICAL_SUPER_ADMIN_EMAIL` ve `SUPER_ADMIN_USER_ID` çifti. Bu istasyondan doğrulanamaz.
4. `media-bake/` yedeği (OPS_RUNBOOK). WAV'lar git dışındadır ve yeniden üretimi ücretlidir.
5. E2E müşteri kutusunu süper admin adresinden ayırma. Not `.env.example`'da. Adres değişimi yeni kutu açıldıktan sonra yapılır.
6. Varlık kararı yazılsın: bu paket düz git'te, en büyük dosya yaklaşık 39,5 MB. Dördüncü kurs öncesi repo-içi MP3 ile Storage + imzalı URL arasından biri seçilsin. Karar ertelenirse göç büyür.

Gözden kaçan ayrıntı: TESPAS-01, değişen izlenen dosyayı yalnız `.cursorrules` sanmıştı. Tedavi başında ağaçta yüzlerce izlenen değişiklik vardı. Yetim dosya riski bu beş commit ile kapandı. Tek disk riski artık o izlenen farkların kendisidir. Satış kapısının disk okuyucusu ile kayıt fonksiyonu iki ayrı commit kuşağına bölünmüş durumda. Bu, bir sonraki kesimin ilk satırıdır.

— Rapor sonu. TEDPA-01.
