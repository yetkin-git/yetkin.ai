# 06 — TEDAVİ RAPORU: AKADEMİ FAZ 3 İZOLASYON VE ARŞİVLEME

| Alan | Değer |
|------|--------|
| Görev | GÖREV 06 — Faz 3 izolasyon (`git mv` → `archived/`, kenar 410) |
| Tarih | 28 Ağustos 2026 |
| Rol | Baş mimar (Cursor / Grok) — Super Admin’e, CEO kontrolünde |
| Kaynak | `docs/03_Tespit_Raporu_Akademi_MVP.md`, `docs/05_Tedavi_Raporu_Akademi_Faz2.md` (Faz 3 sıra 1–4) |
| Ürün kodu | Değiştirildi — canlı bağ kesildi, fabrika arşive alındı, API 410. Prisma **DROP yok** |
| PayTR | Pasif kabul duruyor. Bu PR nakit açmaz |

Faz 2 oynatıcı ve `curriculum.ts` fabrika import’unu kesti; dosyalar yerinde kaldı. CEO/Super Admin `rm` yerine `archived/` taşımayı onayladı. Bu PR o izolasyonu icra eder. Hayalet yeşil yok: `existsSync` ve `vi.mock` yeni yolu tanır.

---

# 1. YAPILAN TEDAVİ

## 1.1 Kalan canlı bağlar kesildi

| Yüzey | Ne oldu |
|-------|---------|
| `instructors.ts` | `field-voice` import’u zaten yoktu (Faz 2 sonrası `studio-cast` ayrımı). Vitrin biyografisi durur; pusula/Koray montajı arşive gitti. |
| `moderator-bridge.ts` | Canlı `lib/academy`’den çıktı → `archived/lib/academy-studio/`. Oynatıcı bu dosyayı import etmiyordu. |
| `scripts/render-academy-lesson-media.ts` | `sealed-diagrams` import’u koptu. Canlı betik bake yapmaz (SKIP). Bake kopyası arşivde: `archived/lib/academy-studio/render-lesson-media.ts`. `public/media/academy` statik kalır. |
| `curriculum-engine.ts` | `curriculum-revisions` / `getAcademyLessonContentVersion` kesildi. `contentVersion` sabit `ACADEMY_LESSON_CONTENT_VERSION_BASE` (`v1.0`). Bellek CMS yazması oynatıcı grafından çıktı. |

Canlı `lib/academy`, `app/`, `components/academy` (oynatıcı/vitrin) `field-voice` / `sealed-diagrams` / TTS motoru import etmez. `verify:boundaries` yeşil.

## 1.2 Arşive taşıma (`git mv`)

Hedef: `archived/lib/academy-studio/` (Studio odası kalıbı). Bileşenler aynı grafın parçası olduğu için `archived/components/academy-studio/` altına alındı — aksi halde `tsconfig` `components/**` typecheck’i kırılırdı.

**Disk notu:** Taşınan dosyaların çoğu bu çalışma ağacında henüz commit edilmemişti (`??`). `git mv` izlenmeyen dosyada düşer. İcra: `git add -N` (intent-to-add) + `git mv` — bir sonraki commit arşiv yolunu yazar; `rm` yoktur.

### Pedagoji sözlükleri / diyagram

`real-world-pedagogy.ts`, `field-voice.ts`, `sealed-diagrams.ts`, `storyboard.ts`, `pedagogy-doctrine.ts`, `growth-pedagogy.ts`, `term-glossary.ts`, `mentor-voice.ts`, `studio-cast.ts`

### TTS / stüdyo

`lesson-listen.ts` (motor), `lesson-listen-engine.ts`, `listen-audio-store.ts`, `listen-route.ts`, `lesson-transcript-sync.ts`, `lesson-listen-script.ts`, `listen-mock-tts.ts`, `lesson-listen-web-speech.ts`, `lesson-listen-focus.ts`, `studio-live.ts`, `lesson-flow.ts`

Canlı ince stub durur: `lib/academy/lesson-listen.ts` yalnız `ACADEMY_LESSON_LISTEN_ENABLED = false`. Fabrika re-export **yok**.

### Lab / discussion / reviews / PDF

`lesson-code-lab-run.ts`, `lesson-discussion.ts` + engine, `reviews.ts` + engine, `moderation.ts`, `curriculum-revisions.ts`, `lesson-note.ts` + engine + pdf, `pdf-unicode-font.ts`, `moderator-bridge.ts`

Bileşenler: dinle düğmesi, listen/transcript hook’ları, kod lab, tartışma, review modal, moderator-bridge, revizyon tahtası/onay, PDF indirme.

**Bilinçli olarak canlı kalan (üç ekran + dondurulmuş mühür):** `lesson-body.ts` (gövde parse/compose), `lesson-practice*.ts` (müfredat çiti + PoW tohumu; lab *koşturucu* arşivde), `growth-visuals.ts`, `instructors.ts`, `acronym-normalizer.ts` (oynatıcı başlık), sınav/belge/kasa.

Ölçü (28 Ağustos 2026, `Measure-Object -Line`):

| Bölge | Dosya | Satır (≈) |
|-------|------:|----------:|
| Canlı `lib/academy` | 67 | 10 440 |
| `archived/lib/academy-studio` | 33 | 13 060 |
| `archived/components/academy-studio` | 10 | 2 967 |

Tespit günü canlı motor ≈23 373 satırdı. Fabrika arşive çıktı; canlı tavan üç ekranın taşıdığı satıra indi (sınav/belge dondurulmuş ince dilim durur).

## 1.3 Test yolları — hayalet yeşil yok

| Risk | Ne yaptık |
|------|-----------|
| `existsSync` / `readSrc("lib/academy/field-voice.ts")` | `archived/lib/academy-studio/...` |
| `vi.mock("@/lib/academy/lesson-listen", ENABLED=true)` (`listen-audio-cache`, `listen-soft-fallback`) | Mock ve import `@/archived/lib/academy-studio/lesson-listen` (+ engine/store/route). Fabrika gerçekten arşivden yüklenir. |
| Surface `toContain` TTS/lab/discussion | Arşiv yolu. Canlı oynatıcı `not.toContain`. |
| `curriculum.ts` fabrika import yasağı | Hem eski `@/lib/academy/field-voice` hem arşiv yolu `not.toContain`. |
| Canlı dinle sözleşmesi | Stub `ENABLED = false`; arşiv motorunda da `= false`. |
| `instructors.ts` içinde `academyDevelopmentWithModeratorAsks` | İğne `studio-cast.ts` (arşiv) — dosya zaten oradaydı; surface yalan yeşil üretmesin. |

## 1.4 API 410

Kenar oturum **401 basmadan** 410’a düşsün diye `auth = "public"`. `verify:api-auth` haritayı üretti.

| Rota | Durum |
|------|--------|
| `/api/academy/courses/[id]/listen` | 410 `ACADEMY_STUDIO_GONE.listen` |
| `/api/academy/generateSpeech` | 410 (aynı cümle) |
| `/api/academy/discussion` | 410 discussion |
| `/api/academy/reviews` | 410 reviews; LLM hız tavanı listesinden çıktı |
| `/api/academy/courses/[id]/pdf` | 410 pdf |
| `/api/admin/curriculum-revisions` | 410 revisions (motor taşındığı için 3.3 erken; Super Admin sayfası sığınak CTA + gone cümlesi, kuyruk UI yok) |

Handler’lar `studio-gone.ts` okur; `archived/` import etmez (`api.frozen` yasağı).

---

# 2. TESTLERİN KIRILMAMASI — İZLENEN YOL

Yeni `verify:*` yok. `npm test` surface’i hariç tutar; nightly `test:surface` kaydırılmış iğneyi görür.

Çalıştırılan yeşil dilim (28 Ağustos 2026): `tests/academy` + `edge-api-auth` + `admin-catalog-surface` + `http-rate-limit` + `tts-voices` — **51 dosya / 251 test**. `verify:boundaries` OK. `verify:api-auth` 48 rota (public 11, admin 1). Canlı tarayıcı oturumu bu ortamda yoktu; izolasyon surface + davranış + 410 sözleşmesi ile kilitlendi.

Dinle regresyonu (`vi.mock(ENABLED=true)`) **arşiv motoruna** karşı durur. Üretim bayrağı false + HTTP 410 ayrı iğnedir.

---

# 3. BİLİNÇLİ OLARAK YAPILMAYANLAR

- Prisma `DROP` (`trendScore`, `proofOfWorkHash`, `AcademyAudioCache`).
- Sınav / belge / vize 403 / `ExamStartGate`.
- `filter-bar` silme / `catalog-filter` incelteme (tespit 3.4).
- `lesson-practice-python` / `growth` taşıma — müfredat gövde çiti ve PoW tohumu hâlâ canlı `curriculum.ts` / `proof-of-work.ts` okur.
- `verify:academy-pedagogy-seals` nightly’den çıkarma (Faz 4). İğne arşiv `pedagogy-doctrine` + canlı müfredat gövdesine kaydı.
- Dron / IAP / sahte CREDIT / 5. SKU.
- Fabrika `rm` (Faz 4: nightly o yolları adıyla anmayınca).

---

# 4. SEN OLSAYDIN NE YAPARDIN?

Faz 3’ü bu şekilde **yaparım.** `rm` hâlâ erken: yazma 0 ve nightly isim vermeme kanıtı yok.

### Faz 4/5 — `trendScore` / `proofOfWorkHash` DROP: en güvenli an?

**Şimdi DROP etmem. İlk gerçek tahsilatı (Nakit Halkası / Faz 6) bekler, sonra ayrı migrate + yedek ile DROP ederim.** Şema temizliğine Faz 3/4’te geçilmez.

Neden nakit halkası **önkoşul** değil ama **en güvenli an** odur:

1. **Bu kolonlar kasa değildir.** PayTR → cüzdan CREDIT → akademi DEBIT → `AcademyPurchase` SETTLED üçlüsü `trendScore` / `proofOfWorkHash` okumaz. İlk tahsilat bu DROP’u teknik olarak gerektirmez; bekletmek “kolon satış içindir” diye değil, **olay ayrıştırması** içindir.

2. **Yazma 0 henüz kanıtlı değil.** `proofOfWorkHash` hâlâ `completeAcademyLesson` kanonik özet basar. Nightly `verify:academy-pedagogy-seals` → `proof-of-work.test.ts` hash bekler. `ops-migrate` `assertAcademyLessonCompletions` körleşir. Kolon dururken “kullanılmıyor” demek yalandır.

3. **`trendScore` hâlâ tohum ve sıra.** Vitrinde FilterBar yok; katalog seed + `prisma-store` + `published-catalog` + `catalog-filter` / `level-pathway` okur. DROP = seed SQL, indeks, `course-seed-surface` (`trendScore === 1`) kırmızı. Önce okuma kesilir (Faz 3.4/4), *sonra* kolon.

4. **İlk SETTLED = yedek değeri olan an.** Merchant kapalıyken DROP, boş lab verisi üzerinde kozmetiktir. Bir gerçek tahsilat + ders tamamlama olduktan sonra alınan yedek, hash’leri ve kurs satırını geri sarılabilir kılar. Tespit Adım D: “Aynı PR’da kod sil + DROP yapmam.”

5. **Çift arıza yasağı.** Nakit halkası kırmızıysa “kolonu düşürdük, katalog sırası bozuldu” ile aynı haftada uğraşılmaz. Üç ekran bir kez dönsün; ertesi hafta şema.

**Sıra (benim Faz 4→5→6 değil, 4→6→5):**

| Ne zaman | Ne |
|----------|-----|
| Faz 4 | Surface `toContain` vergisi; `verify:academy-pedagogy-seals` nightly’den çıkar veya davranışa iner (**prebuild’e alma**). PoW yazmasını testten kopar. `trendScore` okumasını katalog/UI’dan kes. |
| Faz 6 | PayTR merchant. Bir CREDIT → DEBIT → SETTLED → oyna. Yedek al. |
| Faz 5 | Yedek sonrası ayrı migrate: `proofOfWorkHash` nullable DROP, `trend_score` / rank (okuma 0 kanıtı varsa), `AcademyAudioCache` + bucket yazma kilidi. `AcademyExam*` / `AcademyCertificate` **hâlâ yok.** |

**Yapmam:** Faz 3 yeşili görünce migrate açmak. **Yapmam:** “Nakit gelmeden şema kirli kalsın sonsuza kadar” — ilk SETTLED’den sonra bekletmek borç faizidir, ilk SETTLED’den önce DROP etmek ise kör ameliyattır.

Nakit hâlâ idari (PayTR merchant). Bu tedavi onu açmaz.

---

# 5. SİCİL

**Kesildi / taşındı**

- Canlı import: `curriculum-engine` ↛ revizyon kuyruğu; render ↛ `sealed-diagrams`; moderator-bridge canlı graf dışı.
- Fabrika + TTS + lab koşturucu + discussion/reviews/PDF motoru → `archived/lib/academy-studio/`.
- Kenar: listen, generateSpeech, discussion, reviews, pdf, admin revisions → 410 public.

**Duruyor (bilinçli)**

- Üç ekran: vitrin, kasa, oynatıcı (`lesson-body` + practice çiti + görsel yuva).
- Sınav, belge, vize 403, PoW **yazımı** (UI kilidi yok), `lesson-audios` sözleşme (yazma kapalı).
- Canlı dinle stub: `ENABLED = false`.

**Yapılmadı (doğru)**

Çekim, sahte CREDIT, IAP, native akademi, şema DROP, fabrika `rm`, yeni verify betiği.

---

*Bu rapor `/docs` günlük alanındadır. Kalıcı kırmızı çizgi `.system_docs/ANAYASA.md`. Çelişkide Anayasa bağlayıcıdır; Anayasa ile disk çelişirse disk yazılır. GÖREV 06 disk icrasıdır; Faz 4 CEO/Super Admin onayıyla test vergisi ve nightly mühür sadeleştirmesine geçer. Şema DROP, ilk gerçek tahsilat + yedek sonrasına bırakılır.*
