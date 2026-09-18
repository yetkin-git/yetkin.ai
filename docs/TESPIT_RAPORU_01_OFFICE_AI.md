# TESPİT RAPORU — 01_office_ai (İş Hayatında ve Ofiste Yapay Zekâ)

| Alan | Değer |
|------|-------|
| Tarih | 17 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (Muse Spark) |
| Uygulayıcı | Super Admin |
| Onay makamı | CEO (Yapay Zekâ Yöneticisi) |
| Kapsam | `01_office_ai` akademi eğitimi + ANAYASA / MANIFESTO / PEDAGOJI sorgusu + platform kurgusu |
| Kaynak gerçeği | Çalıştırılabilir kod SSOT. Üretim DB'ye bağlanılmadı. `public/media/` toplu medya taranmadı (yalnızca yol/SSOT referansı). |

> Bu rapor "tedavi öncesi tespit"tir. Hiçbir içerik bu raporda değiştirilmedi; yalnızca bulgu + kanıt + öneri yazıldı.

---

## Yönetici özeti (30 saniyede)

**Ürün ayakta, sınav mührü sağlam, ama eğitim "evrensel ofis AI" değil "Türk KOBİ + Gmail/Copilot ofisi"dir.**

- **Güçlü:** 9 derslik sınav yolu kilitli ve sıralı; Üç Kapı tek harita; KVKK erken (Ders 2); hata avı e-postadan önce; sınav sunucuda, baraj 70, HMAC oturum + permütasyon; makale + mühürlü karaoke yayını 9/9; dil SEN ve tutarlı; el kitabı (kasete sığmayan) makaleyi B4'e uygun genişletiyor.
- **Kırık (P0):** `docs/DURUM.md` silinmiş (`docs/ops/DURUM.md`'ye taşınmış) ama **11 dosya + 2 test** hâlâ eski yolu okuyor → testler kırmızı. `docs/specs/freelancer-vize-kapisi.md` silinmiş ama MANIFESTO Kural 2 hâlâ referans veriyor. `docs/curriculum/*` toplu silinmiş ama 5 bake script + PEDAGOJI + bake el kitabı hâlâ oraya yazıyor/okuyor.
- **Standart ihlali (P1):** 2 ders ses süresi 7 dk alt sınırın altında (`k1` 5.93 dk, `6` 6.86 dk); 1 ders kelime tahmini alt sınırın altında (`w1` 1020 < 1050); `estimatedTotalMinutes` (73.32) ≠ hedef toplamı (80.3) ≠ mühürlü toplam (72.43).
- **Pedagojik zayıflık (P1):** Ders sonu mini sınavlar (`lib/academy/lesson-exams/*.json`, 9×3 soru) **ölü kod** — oynatıcıda basılmıyor, final havuzuna da girmiyor. Öğrenci 9 ders boyunca formatsız (biçimlendirici ara sınavsız) gidip tek 10 soruluk MCQ'ya çıkıyor. Ofis becerisi MCQ ile kanıtlanamaz.
- **Evrensellik açığı (P2):** Takvim/Toplantı AI, Excel formül/grafik, PDF, Google Sheets/Docs, OneDrive/SharePoint, Teams/Meet özeti, çeviri, görselleştirme, ücretsiz-katman (lisanssız) yolu yok. Google Sheets açıkça "kapsam dışı" yazıyor. Sınavda Cuma rutini 3 soruyla aşırı ağırlıklı (42'de 3).
- **Kılavuz sorgusu:** ANAYASA A sağlam; B4'ün "sayılar kod + DURUM'dadır" ilkesi doğru ama DURUM yolu kırık. MANIFESTO'nun 5'li vitrin + "Çok Yakında" dürüstlüğü doğru, ancak 02–05 için sınav havuzu + cue JSON'lar varken müfredat boş (`sections: []`) — ölü beklenti stoğu. PEDAGOJI'nin Üç Kapı + SEN + punchcard + bake disiplini kaliteyi taşıyor, ancak 8-cue kalıbı, Excel altın şablonu, tek kadın ses ve SEN-only dayatması evrenselliği ve B2B'yi kısıtlıyor; "ben Gözde" sesi ile `types.ts`'teki "ekranda rol Eğitmen, cast ismi vitrinde kalır" cümlesi çelişiyor.
- **Platform kurgusu:** "Modüler monolit + ince `@yetkin/kernel` + `/api/v1` hop" Faz 1 için **doğru**; gerçek mikro-servis/micro-app ayrımı şu an israf olurdu. Ancak akademi içeriği kodda (`section_*.ts` + cues + timings + spoken-md + exams + workspace) — her yazım düzeltmesi deploy istiyor; MP3'ler git/`public` içinde (Vercel 400 MB tavan); Dron native'de Excel/Gmail simülasyonu yok (metin+rozet). Ölçek "içerik boru hattı + CDN + CMS-lite" olmadan 13 SKU'ya taşınamaz.

**Bir sonraki aşama (kısa cevap):** P0 kırık referansları onar → P1 süre/kelime/sayı mühürlerini senkronla → ölü mini sınavları ya oynatıcıya bağla ya sil → evrensellik ek derslerini CEO onayıyla planla → kılavuzlardaki 6 çelişkiyi reformla. Ayrıntı en sondadır.

---

## 1. Mevcut eğitim içeriği taraması

### 1.1 Envanter (canlı SSOT)

| Katman | SSOT | Durum |
|--------|------|-------|
| Sınav yolu sırası | `lib/academy/curricula/lesson-index.ts` → `CURRICULUM_LESSON_KEYS_BY_SLUG["01_office_ai"]` | 9 anahtar: `1, k1, 2, 3, 5, 4, g1, w1, 6` |
| Vatandaş ders no | `academyCitizenLessonOrdinal()` (1-tabanlı indeks) | Ders 1..9; teknik sonek (`k1,g1,w1,5,6`) basılmaz |
| Makale gövdesi | `lib/academy/curricula/office_ai/section_{1,k1,2,3,5,4,g1,w1,6}.ts` → `contentMarkdown` | 9/9 dolu |
| Müfredat haritası | `lib/academy/curricula/office_ai/planned.ts` → `OFFICE_AI_PLANNED_LESSONS` | 9/9 `status: "sealed", lane: "main"` |
| Konuşma metni | `lib/academy/spoken-scripts/01_office_ai-{1,k1,2,3,5,4,g1,w1,6}.md` | 9/9 SEN, "Selamlar, ben Gözde" |
| Cue | `lib/academy/lesson-cues/01_office_ai-*.json` | 9/9, her biri 8 cue |
| Ses saatleri | `lib/academy/lesson-audio-timings/01_office_ai-*.json` | 9/9, `durationSec` + `cacheV` |
| Ses süresi | `lib/academy/lesson-audio.ts` → `ACADEMY_SEALED_AUDIO_DURATION_SEC` | 9/9 (yuvarlak) |
| Mühür listesi | `lib/academy/pilot-sku.ts` → `ACADEMY_MEDIA_SEALED_AUDIO["01_office_ai"]` | 9/9 |
| Oynatıcı katmanı | `lib/academy/citizen-player-layer.ts` → `article` / `article+karaoke` | 9/9 `article+karaoke` |
| Pratik | `lib/academy/lesson-practice.ts` → `LESSON_PRACTICE` | 9/9 (params + steps + code `text`) |
| Ders mini sınavı | `lib/academy/lesson-exams/01_office_ai-*.json` (3'er soru) | 9/9 dosya var, **prod'da ölü** (bkz. T8) |
| Final havuzu | `lib/academy/exam-pools.ts` → `OFFICE_AI_EXAM_QUESTIONS` | 42 soru, 4 şık, baraj 70 |
| Sınav çekimi | `lib/academy/exam-duration.ts` (`DRAW 10`, 30 dk) + `exam-sitting.ts` (HMAC, permütasyon) | Sunucu taraflı, A4 uyumlu |
| Vitrin | `pilot-sku.ts` (`GROWTH=[01]`, `VITRINE=[01+02..05 kabuk]`) + `catalog-seed.ts` | 01 satın alınır, 02–05 "Çok Yakında" |
| Bake SOP | `docs/ops/akademi-bake-elkitabi.md` | `--dry-run` / `--seal + --confirm-gemini-spend`, Veo Lite, 6500ms RPM |

Ders akışı (vatandaş numarası → teknik anahtar → başlık):

1. `01_office_ai-1` — Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo
2. `01_office_ai-k1` — KVKK, Şirket Sırları ve Maskeleme: Ne Yüklenmez?
3. `01_office_ai-2` — Rapor Otomasyonu: Tablodan Yönetim Özetine
4. `01_office_ai-3` — Sunum Fabrikası: Metinden Slayta
5. `01_office_ai-5` — İstisnalar & Hata Avı: AI Yanılınca
6. `01_office_ai-4` — E-Posta Akışı: Gelen Kutusu Sıfırlama (ritüel)
7. `01_office_ai-g1` — Gmail + Gemini ile Gelen Kutusu ve Aksiyon Listesi (yerleşik kapı)
8. `01_office_ai-w1` — Word ve Uzun Doküman Analizi: Sözleşme, Dilekçe, Rapor
9. `01_office_ai-6` — Haftalık Sistem: 30 Dakikalık Rutin (capstone; sınav yalnız bundan sonra)

Sıra pedagojik olarak doğrudur: kirli veri → güvenlik kilidi → özet → slayt → doğrulama → ritüel → yerleşik panel → uzun doküman → haftalık sistem. Özellikle KVKK'nın 2. derse konması (yükleme alışkanlığından önce) ve hata avının e-postadan önce gelmesi doğrudur.

### 1.2 Bölümler arası akış, dil ve pedagojik uyum

**Akış köprüleri tutarlı.** Her dersin girişi bir önceki dersi vatandaş numarasıyla anıyor, çıkışı sonraki dersi doğru numarayla müjdeliyor:

- Ders 1 çıkışı: "Hazırsan 2. derste buluşalım" + "KVKK ve maskeleme" → Ders 2 = k1. Doğru.
- Ders 3 (`-2`) girişi: "İlk dersimizde ... İkinci derste ise ... KVKK bekçisini oturttuk" → k1'i Ders 2 sayıyor. Doğru.
- Ders 3 çıkışı: "4. ders kapsamında ... Sunum Fabrikası" → `-3` Ders 4. Doğru.
- Ders 4 (`-3`) çıkışı: "5. derste ... Hata Avı" → `-5` Ders 5. Doğru.
- Ders 5 (`-5`) girişi: "Dördüncü dersimizde Sunum Fabrikası" → `-3` Ders 4. Doğru. Çıkışı: "Sıradaki ders e-posta ritüelidir ... Yerleşik kapı ondan sonraki" → `-4` Ders 6, `g1` Ders 7. Doğru.
- Ders 6 (`-4`) girişi hata avına, çıkışı G1'e bağlıyor. Doğru.
- Ders 7 (`g1`) çıkışı Word'e, Ders 8 (`w1`) "Bu 8. derstir ... 9. ders ... Haftalık Sistem" diyor. Doğru.
- Ders 9 (`-6`) "Bu kapanış dersini bitirince sınav kapısı açılır. Baraj 70." diyor. `planned.ts` + `section_6.ts` + sınav kapısı ile uyumlu.

**Dil SEN ve sıcak.** 9/9 derste "Selamlar, ben Gözde", "sen" hitabı, kısa TTS cümleleri, "cebime koy / sıra sende" kapanışı var. Jargon önce günlük karşılıkla veriliyor (ör. halüsinasyon → "uydurma sayı"). Fonetik katmanı (`spoken-scripts/phonetics.ts` + `acronym-normalizer.ts`) ekran/ses ayrımını koruyor: ekranda `KVKK`, seste `Kavekaka`; ekranda `özel API`, seste `ö zel API`; ekranda `.docx`, seste `docx`; `Ctrl+C` → `Kontrol C`.

**Üç Kapı tek harita.** 9 derste sıra sabit: 1) yerleşik panel (Copilot/Gemini şeridi) → 2) ataş (`xlsx/docx/pptx`) → 3) maskeli kısa özet. Güvenlik sınıfı (kişisel veri / şirket sırrı / kamu cümlesi) ayrı eksen olarak tekrarlanıyor. `ai-desk.ts` → `ACADEMY_INFRA_TOOL_MATCH` (Outlook→Copilot, Gmail→Gemini, Word/Excel→ataş, PowerPoint→Copilot) ile ders içerikleri örtüşüyor.

**El kitabı ayrımı doğru.** Her `contentMarkdown` sonunda "## El kitabı (kasetin sığdırmadığı)" var: lisans yoksa / kenar durum / tuzak. Bu blok konuşma metninde yok — B4 "konunun hakkı" (makale banda bağlı değil) ile uyumlu. `lesson-practice.ts` her derse kopyalanabilir istem + 3 adım veriyor; `LESSON_PRACTICE` anahtarları 9/9 tamam.

### 1.3 Eksik / yanlış / uyumsuz bulgular

#### T1 [P0] `docs/DURUM.md` silinmiş, 11 referans + 2 test kırık

- Git durumu: `D docs/DURUM.md`, `?? docs/ops/DURUM.md` (taşınmış).
- Hâlâ `docs/DURUM.md` yazanlar: `.system_docs/ANAYASA.md` (2 yer), `.system_docs/MANIFESTO.md` (3 yer), `.system_docs/PEDAGOJI.md` (2 yer), `.system_docs/OPS_RUNBOOK.md`, `.system_docs/README.md`, `.system_docs/STORAGE_CONTRACT.md`, `.system_docs/ops/ops-dron.md` (2 yer), `.system_docs/DRON_CLIENT_SPEC.md`, `docs/ops/akademi-bake-elkitabi.md`.
- Kırık testler:
  - `tests/academy/production-standard.test.ts` → `readFileSync(join(ROOT, "docs", "DURUM.md"))` (ENOENT).
  - `tests/kernel/faz2-t3-dron-ring-surface.test.ts` → `existsSync(join(ROOT, "docs/DURUM.md"))` (false).
- Ayrıca `.system_docs/README.md` ilkesiyle çelişiyor: "`/docs` içindeki her dosya silinse bile `npm run build` ve testler yeşil kalmak zorundadır." Oysa testler `docs/` okuyor. Ya ilke ya testler yanlış.

#### T2 [P0] `docs/specs/freelancer-vize-kapisi.md` silinmiş, MANIFESTO referansı ölü

- Git: `D docs/specs/freelancer-vize-kapisi.md`.
- MANIFESTO Kural 2: "Kapı ayrıntısı ve teknik şartname `docs/specs/freelancer-vize-kapisi.md` içindedir." Ölü link. Kilitli yüzeyde "canlı kapı diye okunmaz" şerhi doğru, ama spec yoksa Faz 2 checklist'i (B5) havada kalır.

#### T3 [P0] `docs/curriculum/*` toplu silinmiş, 5 bake script + PEDAGOJI + el kitabı hâlâ oraya yazıyor

- Git: `D docs/curriculum/01_office_ai_*` (20 dosya: cue/script/exam).
- Hâlâ yazan/okuyanlar: `scripts/bake-office-ai-0{1..5}-sealed-pack.ts` (`writeUtf8("docs/curriculum/...")`), `scripts/generate-academy-lesson-audio.ts` (cue SSOT yorumu), `scripts/ingest-*.ts`, `PEDAGOJI.md §B` ("dönen parçaları `docs/curriculum/` ... altına kaydeder"), `docs/ops/akademi-bake-elkitabi.md` ("Bake script'i `docs/curriculum/` altına kopya basabilir").
- El kitabı "izleme o kopyayı okumaz; canlı SSOT `lib/academy/lesson-cues/ + lesson-audio-timings/`" diyor — doğru. Ama bake scriptleri her `--seal`'de silinen klasörü yeniden üretecek; ya klasör `.gitignore`'da olmalı ya referanslar temizlenmeli. Şu an "silindi ama hâlâ SSOT yorumu" durumunda.

#### T4 [P1] Süre mühürleri birbirini tutmuyor; 2 ders alt sınırın altında

| Ders | Hedef (`section_*.ts`) | Mühürlü ses (`lesson-audio.ts` yuvarlak / timings kesin) | 7–12 bandı |
|------|------------------------|-----------------------------------------------------------|------------|
| 1 (`-1`) | 9.0 dk | 572 sn → **9.53 dk** (571.72 kesin) | OK (hedeften +0.53) |
| 2 (`-k1`) | 8.5 dk | 356 sn → **5.93 dk** (356.08 kesin) | **FAIL (<7)** |
| 3 (`-2`) | 9.3 dk | 512 sn → 8.53 dk | OK |
| 4 (`-3`) | 9.5 dk | 527 sn → 8.78 dk | OK |
| 5 (`-5`) | 8.9 dk | 421 sn → **7.02 dk** (420.713 kesin) | OK (sınırda, 1 sn pay) |
| 6 (`-4`) | 9.6 dk | 496 sn → 8.26 dk (496.12 kesin) | OK |
| 7 (`-g1`) | 8.7 dk | 529 sn → 8.81 dk (529.04 kesin) | OK |
| 8 (`-w1`) | 8.8 dk | 521 sn → 8.68 dk (521.44 kesin) | OK |
| 9 (`-6`) | 8.0 dk | 412 sn → **6.86 dk** (412.04 kesin) | **FAIL (<7, ~8 sn eksik)** |

Toplamlar: hedef toplamı **80.3 dk** ≠ `officeAiMasteryModule.estimatedTotalMinutes` **73.32** ≠ mühürlü toplam **4346 sn = 72.43 dk**. Üç ayrı "kurs süresi" var. `production-standard.ts` kurs bandı 45–90 olduğu için üçü de bandın içinde, ama vitrin/SEO/sertifika süresi hangi sayıyı basıyor? Tek SSOT yok.

Ek risk: `-5` 420.713 sn ile 7.00 dk sınırında; bir sonraki re-bake'te 1 sn kısalsa banda düşer. `-k1` ve `-6` ise test `isAcademyAiLessonDurationMinutes()`'i doğrudan ihlal ediyor — ama hiçbir test mühürlü süreleri banda karşı koşmuyor (test yalnız sabitleri kilitliyor). Kapı var, bekçi yok.

#### T5 [P1] Kelime tahmini `w1` alt sınırın altında; tahminler el yazması

- `LIMITS.minWords 1050 / maxWords 1800` (`lib/academy/config.ts`).
- `estimatedWordCount`: 1:1334, k1:1280, 2:1296, 3:1333, 5:1248, 4:1180, g1:1050 (sınırda, 0 pay), **w1:1020 (FAIL, 30 kelime eksik)**, 6:1100.
- `config.ts` yorumu "Compact makale bu bütçeye bağlı değildir (B4)" diyor, ama `estimatedWordCount` alanları compact makale bölümlerinde duruyor. Hangi gövdeye (makale mi ses mi) hangi limit uygulanıyor, kodda tek `assert` yok. Tahminler el yazması; `contentMarkdown` değişince güncellenmiyor (git'te `section_*.ts` değişmiş, tahminler aynı kalmış olabilir).

#### T6 [P1] Teknik anahtar ↔ vatandaş numarası çaprazı bakım tuzağı

- Dosya/sonek sırası: `1, k1, 2, 3, 5, 4, g1, w1, 6`.
- Vatandaş sırası: Ders 1..9.
- Yani `section_4.ts` Ders 6, `section_5.ts` Ders 5, `section_6.ts` Ders 9. `sectionNumber` alanları vatandaş sırasına çekilmiş (4→6, 5→5, 6→9) — doğru ama kafa karıştırıcı. Yeni ajan/ders ekleyen biri `section_4.ts`'i "4. ders" sanır. `planned.ts` üst yorumu doğru sırayı yazıyor, ama dosya adları yalan söylüyor. Yeniden adlandırma (`section_04_slides.ts` gibi) veya en azından dosya başına "Ders 6/9" bandı şart.

#### T7 [P1] "Ben Gözde" (ses) ↔ "Ekranda rol Eğitmen" (kod yorumu) çelişkisi

- 9/9 `contentMarkdown` + 9/9 spoken-script: "Selamlar, ben Gözde."
- `lib/academy/curricula/types.ts`: "Tek eğitmen — ekranda rol adı «Eğitmen»; cast isimleri vitrin biyografisinde kalır." + `DIALOGUE_SPEAKER_DISPLAY` tüm cast'i "Eğitmen"e çökertiyor.
- Testler "Gözde"yi kilitliyor (`office-ai-lesson-1.test.ts`, `-k1.test.ts`), yani ürün kararı "Gözde"den yana. O hâlde `types.ts` yorumu güncellenmeli ("ses kimliği Gözde/Callirrhoe, vitrin rozeti Eğitmen" gibi). Aksi hâlde yeni ders yazan ajan "Gözde yazmayayım" diye düşünür, test patlar.

#### T8 [P1] Ders mini sınavları ölü: 27 soru dosyada, 0 soru oynatıcıda

- `lib/academy/lesson-exams/*.json` 9×3 = 27 soru, `passScore: 70`, id öneki `q_off_l*`.
- `seed.ts` → `academyLessonExamQuestionsForSlug()` tanımlı ama **hiçbir prod dosyası import etmiyor** (yalnız testler `loadAcademyLessonExam` çağırıyor).
- `curriculum.ts` → `sealCurriculumLessons()` compact yolda `practice` basıyor ama `lesson-exams` okumuyor. `composeCompactLessonBody()` quiz basmıyor. Oynatıcı (`curriculum-player.tsx` + `lesson-study-tabs`) mini sınav göstermiyor.
- Sonuç: öğrenci 9 ders boyunca ara kontrolsüz ilerliyor; finalde 42'den 10 çekilişle karşılaşıyor. Pedagojik olarak "öğret → denetle → mühürle" zinciri kırık. `exam-pools.ts` üst yorumu "ders mini sınavı gömülmez" diyor (sızıntı yok — doğru), ama mini sınavın kendisi de görünmez. Ya oynatıcıya "Ders sonu kendini dene (notsuz, 3 soru)" olarak bağlanmalı ya dosyalar + `pinAcademyLessonExamQuestionIds()` + `drawAcademyExamQuestionsPinned()` ölü pin mantığıyla birlikte silinmeli.

#### T9 [P2] Sınavda Cuma/haftalık rutin 3 soruyla aşırı ağırlıklı; iki soru neredeyse aynı

- `q_off_12`: "Cuma 30 dakikalık rutin nasıl bölünür?" → "10 Excel + 10 slayt + 10 kutu".
- `q_off_24`: "Cuma rutininin üç bloğu nasıl bölünür?" → "Excel (ataş/Copilot), slayt (üç madde+eylem), e-posta (aynı pencerede kapat)".
- `q_off_17`: "Cuma 30 dakikalık ofis rutininin amacı nedir?" → "Excel, slayt ve e-postayı takvimde duran kısa bloğa bağlamak".
- 42 soruda 3 Cuma sorusu (%7). Çekiliş 10 soruda 0–2 Cuma sorusu gelebilir; tek capstone dersi finali domine ediyor. `q_off_12` + `q_off_24` birleştirilmeli, boşalan yere takvim/toplantı veya PDF sorusu (yeni dersle) konmalı.

#### T10 [P2] KVKK dersi görselde Excel masası; 8-cue kalıbı her derse zorlanmış

- `office-ai-lesson-k1.test.ts`: `slides.every(slide => slide.layout === "excel")` — KVKK/maskeleme gibi hukuki-davranışsal ders bile Excel ızgarasında anlatılıyor. `PEDAGOJI.md §E` "01_office_ai-1 Excel sineması ... görsel sözleşmedir" diyor; k1/g1/w1'in aynı ızgaraya sığması "her masa kendi layout'unu taşır" cümlesiyle çelişiyor. KVKK için belge/maske masası, g1 için çift-hat posta masası zaten kısmen var (`kvkk-workspace.ts`, `gmail-workspace.ts`), ama test Excel'i kilitliyor.
- 9/9 ders tam 8 cue (`cue-01..08`, punchcard 8'li). Pedagojik gereklilik değil, şablon alışkanlığı. Kısa ders (`k1` 356 sn) ile uzun ders (`1` 572 sn) aynı cue sayısına sıkışınca k1'de cue başına ~44 sn, derste ~71 sn düşüyor — tempo tutarsız.

#### T11 [P2] Lisanssız kullanıcı yolu zayıf; Google Sheets kapsam dışı

- Dersler "Copilot lisansın varsa şerit, yoksa ataş" diyor — doğru. Ama ataş da yoksa (ücretsiz ChatGPT dosya yükleme kotası, şirket yasağı) anlatılan tek yol "maskeli kısa özet". Ücretsiz-katman öğrencisi için uçtan uca "sıfır lisansla Cuma 30" videosu/yolu yok.
- `section_2.ts` el kitabı: "Google Sheets bu derste kapsam dışıdır; tabloyu Excel veya CSV olarak indirip aynı istemi oraya yaz." Evrensel ofis eğitimi için Sheets/Docs/Drive'ın "indir ve gel" diye dışlanması KOBİ dışı (startup, eğitim, STK) kitleyi kaçırır.

#### T12 [P2] Kardeş SKU'lar: sınav havuzu + cue JSON var, müfredat boş

- `ecommerce_ai / social_media_ai / chatbot_nocode / prompt_practice`: `sections: []`, `estimatedTotalMinutes: 0` — vitrin "Çok Yakında" diyor, doğru.
- Ama `exam-pools-{ecommerce,social,chatbot,prompt}.ts` dolu (30'ar soru?) ve `lib/academy/lesson-cues/{02,03,04,05}-*.json` dosyaları duruyor (örn. `02_ecommerce_ai-1..6`, `05_prompt_practice-1..6`). Müfredatı olmayan dersin cue'su ve sınavı var. Ya erken bake artığı (silinmeli) ya gizli taslak (planlanmalı). Şu an "vitrinde yok ama repo'da var" hayalet stok.

#### T13 [P2] `estimatedTotalMinutes` + `targetDurationMinutes` + `durationSec` üçlüsü senkronsuz (T4'ün vitrin yüzü)

- Katalog/SEO (`catalog-seed.ts`, `courseJsonLd`) süre basmıyor; oynatıcı süresi `timings.durationSec` + outro kuyruğundan geliyor. Ama `officeAiMasteryModule.estimatedTotalMinutes` (73.32) muhtemelen eski toplamın artığı. Tek `academyCourseDurationSec(slug)` hesaplayıcısı yok. Vitrin "9 ders · ~72 dk · sınav 30 dk" gibi tek cümleyi koddan türetemiyor.

---

## 2. Kılavuz dokümanların sorgulanması

### 2.1 Örtüşme özeti

| Kılavuz | Örtüşme | Not |
|---------|---------|-----|
| ANAYASA A (A1–A5) | **%100 uyumlu** | Para tamsayı, PSP dışı çekim yok, RLS/IDOR, sunucu puanlama + mühür, dürüst yüzey. Eğitimde ihlal yok. |
| ANAYASA B (B1–B5) | **~%80, 2 kırık referans** | B1 monolit+hop doğru; B2 oda kilidi doğru; B3 prebuild doğru; **B4 DURUM yolu kırık**; B5 Split kilidi doğru. |
| MANIFESTO | **~%85, 1 ölü spec** | 3 oda + kilitli freelancer + B2C nakit + keşif B2B doğru; **vize-kapısı spec yok**; 5'li vitrin doğru. |
| PEDAGOJI | **~%90, 6 kısıt/çelişki** | Üç Kapı, SEN, punchcard, 4-beat, bake disiplini tam uygulanmış; ancak kalıp katılığı + ses/isim/Sheets kısıtları var (aşağıda). |

### 2.2 ANAYASA sorgusu

**A Katmanı (dokunulmaz) — sorguya kapalı, uyum tam.** A4 "baraj ≥70, sunucu puanlama, mühürde ödeme yok" eğitimde harfiyen uygulanmış (`exam.ts`, `exam-sitting.ts`, `certificate-verify`). A5 "sahte bakiye/başarı yok" — mühürsüz ders hayali oynatıcı basmıyor (`citizen-player-layer.ts`), lisanssız Copilot için "canlı kutu okunmaz" rozeti dürüst. A1–A3 eğitim katmanını ilgilendirmiyor ama ihlal de yok.

**B Katmanı (yaşayan) — 2 düzeltme:**

- **B-AN1 [Kırık]:** B4 "haftalık kesit `docs/DURUM.md` içindedir" + B1/B-son-reform "sayılar kod + `docs/DURUM.md`" — dosya taşındı. Reform: tüm B referansları `docs/ops/DURUM.md`'ye çekilmeli veya köke uyumluluk yönlendirmesi (`docs/DURUM.md` → `docs/ops/DURUM.md` re-export) konmalı. İkincisi testleri de kurtarır.
- **B-AN2 [Belirsiz]:** B4 "Compact yayın makalesi kelime tavanı ... ile kesilmez" vs `LIMITS.minWords/maxWords` (1050–1800) vs `estimatedWordCount`. `config.ts` "compact bu bütçeye bağlı değildir" diyor, ama limit adları genel (`LIMITS`). Reform: `LIMITS` → `SEALED_AUDIO_LIMITS` ad değişimi + compact için ayrı `COMPACT_ARTICLE_GUIDE` (tavan değil, aralık önerisi) yazılmalı. Şu an B4'ü okuyan "kelime sınırı yok", `config.ts`'i okuyan "1050–1800 var" anlıyor.

B1 "yeni yetenek önce v1 hop" — akademi için doğru uygulanmış (16 hop, `RAIL_V1_HOPS_META`). B2 "18 yaş altı yok, Junior kilitli" — eğitim "Temel Paketler" ile başlangıcı Akademi içinde çözüyor, doğru. B3 "Türkçe kelime grep'i derlemeyi kırmaz" — doğru; ama `production-standard.test.ts`'in PEDAGOJI kelime listesini (`toContain("Garsonu Göster")` vb.) kilitlemesi B3 ruhuna aykırı: felsefe cümlesi değişince test patlar. Test, felsefeyi değil davranışı kilitlemeli.

### 2.3 MANIFESTO sorgusu

**Doğru kalanlar:** Gün 0 cümlesi ("Yetkinliğini kanıtlayan yapay zekâ eğitimleri. Sınavı geç; mühür kamu vize kartında dursun.") ile 01_office_ai birebir örtüşüyor. Motor 1 (B2C Akademi) tek nakit kapısı; Motor 3 (Split sonrası komisyon) kilitli; Motor 2 (B2B keşif) arşivde — DURUM ile tutarlı. "Quiet Luxury + SEN aksı" ders diline yansımış.

**Sorgulananlar:**

- **B-MN1 [Ölü]:** Kural 2 vize kapısı spec'i silinmiş (T2). Ya spec geri getirilmeli (Faz 2 checklist B5'e lazım) ya MANIFESTO "spec `docs/specs/`'te donduruldu, Faz 2'de yazılacak" demeli. Şu an vizyon, olmayan belgeye atıf yapıyor.
- **B-MN2 [Kısıtlayıcı mı?]:** "Faz 1 vitrin 3 oda, 4. oda kilitli" — akademi ölçeği için doğru (odak). Ama "Oda tavanı esnektir: kayıt + sözleşme + bayrak" ile "Faz 1 kilidi" aynı sayfada; yeni ajan hangisinin üstte olduğunu karıştırıyor. Reform: "Faz 1'de yeni oda açılmaz (CEO + Super Admin çift imza olmadan)" tek cümle eklenmeli.
- **B-MN3 [Güncelliğini yitiren]:** "Dron native istemcidir. T3 Akademi halkası bağlıdır" — doğru, ama Dron akademi deneyimi web'in gerisinde (T-bölüm 3.2'de). Manifesto "bağlıdır" diyor, kaliteyi söylemiyor. "Bağlı ama web-parite değil (sınav+mühür+kasa tam, simülasyon web'de)" dürüst cümlesi eklenmeli.

### 2.4 PEDAGOJI sorgusu (kör uygulama yok — madde madde)

PEDAGOJI'nin iskeleti (Üç Kapı, SEN, bilişsel yük, 4-beat, bake disiplini, bütçe korumalı B-roll) **kaliteyi taşıyor, kısıtlamıyor**. Aşağıdakiler "kaldırılsın" değil "esnetilsin / güncellensin" önerisidir:

| # | Madde | Hüküm | Etki |
|---|-------|-------|------|
| P-PD1 | §A.3 Karaoke'de paragraf yasak, punchcard ≤3 kelime | **KORU** | Bilişsel yük yönetimi çalışıyor; prompt terminali + adım bandı istisnası doğru tanımlanmış. |
| P-PD2 | §B 4-beat (Warm-up→Command→Comparison→Task) + Giriş Köprüsü + Cebine Koy | **ESNET** | 9/9 derste 8 cue zorunluluğu doğurmuş (T10). Reform: "8 cue tavan değil tavandır; kısa ders 6, capstone 9 olabilir; tempo cue başına 45–75 sn" bandı yazılmalı. |
| P-PD3 | §C Süre bandı kodda (7–12 ders, 45–90 kurs) | **KORU + BEKÇİ EKLE** | Bant doğru, ama k1/6 ihlal ediyor (T4). Reform: `verify:prebuild` veya vitest'e "mühürlü süre bandı" kapısı eklenmeli. |
| P-PD4 | §D 5'li vitrin + "Çok Yakında" dürüstlüğü | **KORU** | A5 ile tam uyumlu. Kardeş cue/exam hayaletleri (T12) temizlenince daha dürüst olacak. |
| P-PD5 | §E "01_office_ai-1 Excel sineması görsel sözleşmedir" | **ESNET** | KVKK dersini Excel'e kilitlemiş (T10). Reform: "Her ders kendi masasında; Excel yalnız Excel derslerinin sözleşmesidir. KVKK=belge masası, g1=çift-hat posta masası, w1=Word masası." |
| P-PD6 | §E.2/E.8/E.10 Üç Kapı hiyerarşisi | **KORU (amiralin en güçlü varlığı)** | Sıra + güvenlik sınıfı ayrımı net. Değişiklik yok; yeni dersler aynı haritaya oturmalı. |
| P-PD7 | §E.4 Pahalı Veo her derste yasak, Lite/reuse/Ken Burns | **KORU** | Bütçe kalkanı çalışıyor; 8 ders 1. ders B-roll'unu reuse ediyor. |
| P-PD8 | §E.5 `--seal` insan onayı, `--dry-run` deneme | **KORU** | Maliyet + kalite kapısı. |
| P-PD9 | Tek ses (Gözde/Callirrhoe kadın) + SEN-only | **ESNET** | Evrensel ofis + B2B için: (a) erkek TTS yuvası (Fenrir) en az 1 derste pilotlanmalı (erişilebilirlik/tercih); (b) dilekçe/sözleşme gibi resmi yazı derslerinde "öğretmen SEN, belge SIZ" çift-sicil tanımlanmalı. Şu an resmi dilekçe gayriresmi sesle öğretiliyor. |
| P-PD10 | "Harf harf yazma dayatması yok" + "Nereye yazılacak" gerçek kapı | **KORU** | Taşıma-su karşıtı en pratik madde. |
| P-PD11 | "VBA/Gamma/Marp zorunlu değil" | **KORU + GENİŞLET** | Doğru (araç dayatması yok). Aynı cümle Sheets/Docs için de yazılmalı: "Sheets/Docs yasak değil, bu SKU'da yol Excel/Word'dür; Sheets köprüsü ayrı derste." Şu an Sheets "kapsam dışı" diye kapatılmış (T11). |
| P-PD12 | "İzlemede canlı üretici API yok" | **KORU** | Maliyet + determinizm. Dron dahil. |

**Çelişki:** PEDAGOJI §B "Cursor montaj operatörüdür: `docs/curriculum/` ... altına kaydeder" vs T3 (klasör silinmiş). Pedagoji bake çıktısının `lib/academy/` olduğunu söyleyecek şekilde güncellenmeli.

---

## 3. Görüş ve öneri (tarafsız göz)

### 3.1 SEN OLSAYDIM NE YAPARDIM? — Evrensel ofis AI eğitimi için

Önce ilke: **01_office_ai'yi şişirme, ikiye bölme.** 9 ders 72 dk zaten bant tavanına yakın (90). Evrensellik "daha uzun tek kurs" değil "çekirdek + köprü dersleri" ile gelir.

**A. Çekirdek 9'u koru, 3 köprü dersi ekle (101/102 ayrımı yerine "01A çekirdek + 01B köprüler"):**

1. **Yeni Ders 10 — Takvim & Toplantı AI (Outlook + Teams + Meet):** Davet triyajı, transkriptten aksiyon listesi, "toplantıya 5 dk kala özet" ritüeli. Ofiste e-postadan sonra en büyük zaman tuzağı toplantıdır; şu an sıfır kapsama. Üç Kapı'ya oturur (1. Kapı: Teams Copilot/Meet Gemini, 2. Kapı: transkript dosyası ataş, 3. Kapı: maskeli kısa özet).
2. **Yeni Ders 11 — Excel Formül & Grafik AI (XLOOKUP, Özet Tablo, grafik):** Şu an Excel yalnız temizlik; oysa "AI'ya formül yazdırma + TOPLA kilidi + grafik seçimi" evrensel ihtiyaç. Hata avı (Ders 5) ile birleşip "üret → kilitle → görselleştir" zinciri kurulur. `XLOOKUP/DAX/VBA` kısaltmaları `acronym-normalizer.ts`'te zaten var — içerik yok.
3. **Yeni Ders 12 — PDF & Uzun Belge AI (taranmış OCR, birleştirme, karşılaştırma):** Sözleşme dersi (w1) `docx`'e kilitli; gerçek ofiste yarı belge PDF. "PDF'yi ataşla + sayfa numarası iste + uydurma maddeyi sil" aynı Üç Kapı ile öğretilir. KVKK maskesi PDF'te daha kritik (taranmış kimlik).

Bu 3 dersle kurs 12 derse (band tavanı) + ~95 dk'ya çıkar — kurs bandı (45–90) aşılır. O yüzden **iki SKU'ya böl:** `01_office_ai` (Ders 1–9, mevcut, "Çekirdek Ofis AI") + `01_office_ai_plus` veya `06_office_ai_kopru` (Ders 10–12 + Sheets/Docs köprüsü, "Ofis AI Köprüler"). Sınav havuzu 42 → 42 + 12 (yeni ders başına 4). Mevcut sertifika etkilenmez; köprü bitiren "Ofis AI + Köprüler" rozeti alır. PEDAGOJI §C "Temel/Orta/İleri bağımsız paket" buna izin veriyor; §D "9–10 ders veya 101/102 ayrımı serbesttir" de destekliyor.

**B. Lisanssızlar için "Sıfır Lisans Cuma 30" yolu (yeni ders değil, her dersin el kitabına 1 paragraf + 1 pratik):**

- Şu an el kitabı "Copilot yoksa ataş" diyor; ataş da yoksa (ücretsiz kota, şirket yasağı) yol bitiyor. Her derse "Ücretsiz katmanla bu ders" (ChatGPT Free + maskeli kısa + manuel kilit) 3 cümle eklenmeli. Pratik `code` bloğuna `lisans: yok` varyantı. Bu, B2C kapı ürünüdür (öğrenci, işsiz, KOBİ'siz).

**C. Sheets/Docs köprüsü (1 ders veya 3 video eki):**

- "Sheets kapsam dışı, indir ve gel" (T11) yerine: "Aynı Üç Kapı Sheets'te de çalışır; fark: 1. Kapı Gemini kenar çubuğu, 2. Kapı `.xlsx` dışa aktar + ataş." Tek ders (30 dk) veya her Excel/Word dersine 2 dk'lık "Sheets'te karşılığı" eki. Startup/eğitim/STK kitlesini açar, Excel yolunu bozmaz.

**D. Ölçmeyi MCQ'dan kurtar (en kritik pedagojik hamle):**

- Final 10 MCQ kalsın (ölçeklenebilir, sunucu mühürlü), ama **sertifika 2 kapılı olsun:** (1) 10 MCQ ≥70 + (2) 1 iş kanıtı (örn. "dağınık `xlsx`'yi temizleyip 3 maddelik özet + 1 slayt iskeleti üret, dosyayı yükle"). İş kanıtı otomatik ön-kontrol (A1 dolu mu? 3 madde var mı? slayt başına tek fikir mi?) + Super Admin spot-check ile mühürlenir. `proof-of-work.ts` + `proof-of-work-verify.ts` zaten var — akademiye bağlanmamış. Bu olmadan "evrensel ofis eğitimi" iddiası zayıf: ofis işi dosyayla kanıtlanır, şıkla değil.
- Ara kontrol: T8'deki 27 mini soru "notsuz kendini dene" olarak oynatıcıya gömülmeli (ders sonu, 3 soru, cevap anahtarlı, sınav havuzuna karışmadan).

**E. Dil/ses esnekliği:**

- "Öğretmen SEN, belge SIZ" çift-sicili (P-PD9): dilekçe/sözleşme derslerinde öğretmenin hitabı SEN kalır, üretilen belge örnekleri resmi SIZ olur. Şu an ikisi de SEN.
- Erkek ses pilotu: 1 köprü dersi Fenrir ile bake'lenip A/B (tamamlama oranı, sınav başarısı) ölçülmeli. Tek ses, erişilebilirlik ve tercih çeşitliliğini kısıtlıyor.
- "Ben Gözde" korunmalı (marka sesi), ama `types.ts` yorumu buna çekilmeli (T7).

**F. Yapılmaması gerekenler (tuzaklar):**

- 9 dersi 15 derse şişirme (bant + tamamlama oranı çöker).
- VBA/Gamma/Marp'ı zorunlu yapma (PEDAGOJI haklı: araç dayatması yok).
- Canlı TTS/Video'yu oynatıcıya getirme (maliyet + determinizm çöker).
- KVKK dersini sona atma (şu an Ders 2 — doğru yerde).
- Hata avını seçmeli yapma (AI halüsinasyonu ofiste zorunlu ders).

### 3.2 Platform kurgusu (Core + Micro-Apps / Shared Kernel) doğru mu?

**Kısa cevap: Evet, Faz 1 için doğru — ama adı yanlış, akademi boru hattı eksik.**

| Soru | Gerçek | Hüküm |
|------|--------|-------|
| Mimari ne? | Pragmatik modüler monolit (Next.js App Router) + ince `@yetkin/kernel` (para, katalog, hop meta, zarf) + `/api/v1` API-First + edge `proxy.ts` (auth, hop gate, rate-limit, bakım). | **Doğru.** Gerçek mikro-servis (ayrı deploy, ayrı DB) Faz 1'de operasyonel israf olurdu. B1'in tarifi ("modüler monolit + API-First") kodla örtüşüyor. |
| "Micro-Apps" nerede? | Kodda mikro-app yok; `VERTICAL_ROOMS` (dashboard/academy/career/freelancer) + `DRON_KAYIT` + `DronBayrakları` var. "Micro-app" = oda/dron kaydı + bayrak. | **Adlandırma borcu.** Dokümanlar "Core + Micro-Apps" derken kod "odalar + dronlar" diyor. Ya doküman "modüler monolit + odalar" demeli ya kod `micro-app` terimini benimsemeli. Şu an iki dil var. |
| Shared Kernel ne? | `@yetkin/kernel` (v1.0.0, ince: money, catalog-ids, v1-hops-meta, envelope, idempotency) + `lib/kernel/*` (şişkin: auth, payments, AI, escrow, pricing, dron...). | **Yarı doğru.** Paket ince (hedeflenen), ama `lib/kernel` 191 dosya ile "shared" değil "everything" olmuş. Akademi `lib/kernel/ai/*`, `lib/kernel/catalog-ids/*`, `lib/kernel/http/*`'e bağımlı — sınır bulanık. Reform: `lib/kernel` → `lib/core/*` + `lib/academy-kernel/*` ayrımı veya en azından `bounded-contexts.ts`'in zorunlu import duvarı (ESLint) olmalı. Şu an duvar yorumda, kuralda değil. |
| Akademi sunumu doğru mu? | Makale + mühürlü karaoke; ses MP3 `public/media/`; cue/timings JSON; oynatıcı `curriculum-player.tsx`; sınav HMAC oturum. | **Sunum doğru, üretim boru hattı yanlış.** İçerik kodda; her düzeltme PR + deploy. MP3 git'te (Vercel 400 MB tavan, `ACADEMY_SEALED_AUDIO_DEPLOY_MAX_BYTES`). 13 SKU × ~50 dosya = ~650 dosya repo'da. |
| Ölçeklenir mi? | 1 SKU için evet, 5 SKU için hayır, 13 SKU için asla (mevcut hâliyle). | **3 eksik:** (1) CMS-lite (içerik repo'su veya headless; kod deploy'suz metin düzeltme); (2) CDN/object-store (STORAGE_CONTRACT "yok" diyor — Faz 1'de doğru, ama 02+ için yol haritası yok); (3) Bake CI (şu an operatör `npx tsx` + insan onayı; hata payı yüksek, T4/T5 senkron kaybı bunun eseri). |
| Dron (native) doğru mu? | T3 halkası bağlı (oynatıcı/sınav/mühür/kasa hop'ları); Tezgâh izole; punchcard saatleri web timings'ten türetiliyor; Excel/Gmail simülasyonu yok. | **Kısmen.** Veri katmanı doğru (tek SSOT, türetme), deneyim katmanı eksik (native'de "garsonu göster" yok). Mobil-öncelikli öğrenci (üniversiteli, saha çalışanı) için web-parite şart değil ama "ses + rozet + sınav" yetmez; en azından statik slayt (cue JPG) native'e taşınmalı. `public/academy/cinema/*.jpg` zaten var — hop'a eklenebilir. |
| Sınav/mühür ölçeklenir mi? | Sunucu puanlama, HMAC sitting, permütasyon, tek-tüketim, 15 sn lütuf, curriculumSeal. | **Evet.** A4'ün en sağlam uygulaması. Tek eksik: iş kanıtı (3.1-D) ve soru analitiği (hangi soru çok yanlışlanıyor? hangi dersin soruları?). `funnel-*` admin var ama soru-bazlı rapor yok. |

**Net hüküm:** Faz 1'i mikro-servislere bölme. Ama "Core + Micro-Apps" lafını bırak, "Modüler monolit + odalar + ince kernel" de. Akademi için içerik boru hattını (CMS-lite + bake CI + CDN yol haritası) Faz 1 kapanış kriteri yap. Yoksa 02. SKU'da aynı 9×8 dosya kaosu tekrarlar.

---

## 4. Toplu bulgu tablosu

| ID | Başlık | Şiddet | Kaynak |
|----|--------|--------|--------|
| T1 | `docs/DURUM.md` ölü referans (11 dosya + 2 test) | P0 | git status + grep |
| T2 | `freelancer-vize-kapisi.md` ölü referans | P0 | MANIFESTO Kural 2 |
| T3 | `docs/curriculum/*` ölü referans (5 bake script + PEDAGOJI + el kitabı) | P0 | git status + grep |
| T4 | Süre üçlüsü senkronsuz; k1/6 bant altında | P1 | `section_*.ts` + `lesson-audio.ts` + timings |
| T5 | w1 kelime 1020 < 1050; limit/alan belirsizliği | P1 | `section_w1.ts` + `config.ts` + B4 |
| T6 | Teknik anahtar ↔ vatandaş no çaprazı | P1 | `lesson-index.ts` + `section_{4,5,6}.ts` |
| T7 | "Ben Gözde" ↔ "Ekranda Eğitmen" çelişkisi | P1 | 9× section + spoken + `types.ts` |
| T8 | Mini sınavlar ölü (27 soru, 0 gösterim) | P1 | `lesson-exams/*` + `curriculum.ts` + `seed.ts` |
| T9 | Cuma 3 soru, 2'si çakışık | P2 | `exam-pools.ts` q12/17/24 |
| T10 | KVKK Excel masası; 8-cue kalıbı | P2 | `*-k1.test.ts` + PEDAGOJI §E |
| T11 | Lisanssız yol zayıf; Sheets kapsam dışı | P2 | `section_2.ts` el kitabı + pratikler |
| T12 | Kardeş hayalet stok (havuz + cue var, müfredat yok) | P2 | `exam-pools-*` + `lesson-cues/02..05-*` + `*/index.ts` |
| T13 | Tek süre SSOT yok (vitrin cümlesi türetilemiyor) | P2 | `office_ai/index.ts` + `lesson-audio.ts` |
| B-AN1 | B4 DURUM yolu kırık | P0 | ANAYASA B4 (T1 ile aynı kök) |
| B-AN2 | B4 "tavan yok" vs LIMITS adları | P1 | ANAYASA B4 + `config.ts` |
| B-MN1 | Vize spec ölü | P0 | MANIFESTO Kural 2 (T2 ile aynı kök) |
| B-MN2 | "Oda tavanı esnek" vs "Faz 1 kilidi" belirsizliği | P2 | MANIFESTO Kural 1 + B2 |
| B-MN3 | Dron "bağlı" kalite şerhsiz | P2 | MANIFESTO Kural 1 + DURUM |
| P-PD2 | 4-beat 8-cue dayatması | P2 | PEDAGOJI §B (T10 ile bağlı) |
| P-PD3 | Süre bandı bekçisiz | P1 | PEDAGOJI §C (T4 ile bağlı) |
| P-PD5 | Excel altın şablonun genellenmesi | P2 | PEDAGOJI §E (T10 ile bağlı) |
| P-PD9 | Tek ses + SEN-only | P2 | PEDAGOJI §A/C + B2B ihtiyacı |
| P-PD11 | Sheets/Docs "yasak değil ama yol yok" eksikliği | P2 | PEDAGOJI §E + T11 |

---

## 5. Bir sonraki aşamada (Tedavi/Düzenleme aşaması) tam olarak ne yapılması gerekiyor ve hangi sırayla hareket etmeliyiz?

**Cevap (sıralı, kapılı, sorumlu + doğrulamalı):**

### Faz T0 — P0 kırık referanslar (0.5 gün, Super Admin, CEO onayı gerekmez)

1. **DURUM yolu kararı:** İki seçenekten birini uygula (önerilen: **A**).
   - A: `docs/DURUM.md`'yi geri getir (içeriği `docs/ops/DURUM.md`'nin birebiri + üstte "yaşayan kesit `docs/ops/DURUM.md`'dir, bu dosya uyumluluk aynasıdır" bandı). 11 referans + 2 test dokunulmadan yeşile döner.
   - B: 11 dosyadaki `docs/DURUM.md` → `docs/ops/DURUM.md` + 2 testteki yol + `.system_docs/README.md` ilkesi güncellenir. Daha temiz, ama 13 dosya diff'i.
   - Doğrulama: `npx vitest run tests/academy/production-standard.test.ts tests/kernel/faz2-t3-dron-ring-surface.test.ts` yeşil.
2. **Vize spec kararı:** `docs/specs/freelancer-vize-kapisi.md`'yi git'ten geri getir (silme commit'inden `git checkout`) VEYA MANIFESTO Kural 2'yi "spec donduruldu, Faz 2'de yazılacak" diye düzelt. İkisi birden yapılmaz; biri seçilir.
   - Doğrulama: `rg "freelancer-vize-kapisi" --glob '!*.test.*'` ya dosyayı bulur ya cümleyi bulmaz (ikisi tutarlı).
3. **`docs/curriculum/` kararı:** Klasörü `.gitignore`'a "bake çıktısı" olarak ekle (izleme okumuyor, bake yazıyor) + PEDAGOJI §B cümlesini "`lib/academy/` altına kaydeder; `docs/curriculum/` bake kopyasıdır, izlenmez" diye düzelt. Silinen 20 dosyayı geri getirme (canlı SSOT `lib/`'de).
   - Doğrulama: `npm run build` + `npx vitest run tests/academy/lesson-cues.test.ts` yeşil; `git status`'te `docs/curriculum/` görünmez.

Kapı: T0 bitmeden T1'e geçilmez. CEO'ya "P0 kapandı, testler yeşil" kanıtı (vitest çıktısı) sunulur.

### Faz T1 — Sayı/süre/kelime senkronu (1 gün, Super Admin + ajan)

4. **Süre tek SSOT:** `lib/academy/lesson-audio.ts`'a `academyCourseSealedDurationSec(slug)` (timings toplamı) ekle; `officeAiMasteryModule.estimatedTotalMinutes`'i bu fonksiyondan türet (el yazması 73.32'yi sil); `targetDurationMinutes` alanlarını "hedef" olarak koru ama vitrin/SEO'da mühürlü süreyi bas. `docs/ops/DURUM.md` tablosundaki 9 süreyi timings'ten doğrula.
5. **Bant ihlallerini kapat:** `k1` (356.08 sn → ≥420 sn, +64 sn) ve `6` (412.04 sn → ≥420 sn, +8 sn) için ek cümleler yaz (k1'e 1 maske örneği, 6'ya 1 takvim cümlesi), `--dry-run` → insan onayı → `--seal` ile re-bake. `-5` (420.713 sn) re-bake gerektirmez ama el kitabına "sınırda, kısaltma" notu düş.
   - Doğrulama: yeni `vitest` kapısı — "9 mühürlü süre 420–720 sn bandında" (`tests/academy/sealed-duration-band.test.ts` yeni).
6. **Kelime senkronu:** `w1` makalesine ~40 kelime ekle (dilekçe hitap örneği) veya `LIMITS`'i `SEALED_AUDIO_LIMITS` diye yeniden adlandırıp compact'ı muaf tut (B-AN2). `estimatedWordCount` alanlarını `contentMarkdown`'dan hesaplayan tek script (`scripts/ops-sync-wordcount.ts`) yaz; el ile güncelleme dönemini kapat.
7. **Anahtar/no çaprazı:** `section_4.ts/5.ts/6.ts` başına `/** Vatandaş Ders 6/5/9 — dosya adı teknik sonektir, sıra `lesson-index.ts`'tedir. */` bandı ekle. Yeniden adlandırma yapma (import + test riski); bant yeter.

Kapı: `npx vitest run tests/academy/` yeşil + `docs/ops/DURUM.md` "mühürlü süre" satırları timings ile birebir.

### Faz T2 — Ölçme onarımı (1–2 gün, Super Admin, CEO onayı: sınav değişikliği)

8. **Mini sınav kararı (CEO onayı şart):** A (önerilen): 27 soruyu oynatıcıya "Ders sonu kendini dene (notsuz)" olarak bağla (`lesson-study-tabs` yeni sekme, `loadAcademyLessonExam` okur, cevap anahtarlı, final havuzuna karışmaz). B: dosyaları + `pin*`/`draw*Pinned` ölü kodunu sil. Karışık (bazı ders bağlı, bazı silik) yasak.
9. **Cuma çakışması:** `q_off_24`'ü yeni köprü dersine taşı (T3'e kadar havuzda tut, 42 sabit kalsın) veya `q_off_12` ile birleştirip yerine "maskeleme" 4. sorusunu yaz. Havuz 42 sabit kalır (test kilitli).
   - Doğrulama: `office-ai-exam-leak.test.ts` + yeni "mini sınav görünürlük" testi yeşil.

### Faz T3 — Evrensellik planı (CEO stratejik onayı, 0.5 gün karar + ayrı bake takvimi)

10. **CEO'ya 3 seçenek sun:** (A) 9 ders + 3 köprü SKU'su (önerilen, §3.1-A); (B) 9 ders + Sheets eki (hafif); (C) 9 ders dondur, 02 SKU'ya geç. Onay olmadan bake yok.
11. Onaylanan planın `planned.ts` + `lesson-index.ts` + `PEDAGOJI.md §D` taslağını yaz (ders başlıkları, Üç Kapı eşleşmesi, sınav havuzu delta'sı). Bake'i ayrı sprint'e bırak.

### Faz T4 — Kılavuz reformu (0.5 gün, Super Admin yazar, CEO mühürler)

12. **ANAYASA B:** B-AN1 (DURUM yolu) + B-AN2 (LIMITS adı) düzelt; "Son Reform" satırına "17 Eylül 2026 (Tespit-Tedavi): ..." ekle. A Katmanı'na dokunma.
13. **MANIFESTO:** B-MN1 (vize spec) + B-MN2 (Faz 1 oda kilidi tek cümle) + B-MN3 (Dron web-parite şerhi) düzelt.
14. **PEDAGOJI:** P-PD2 (cue bandı 6–9) + P-PD5 (masa başına sözleşme) + P-PD9 (belge SIZ + erkek pilot) + P-PD11 (Sheets cümlesi) + §B `docs/curriculum/` cümlesini düzelt. Üç Kapı, SEN, punchcard, bake disiplinine dokunma.
15. **`types.ts` + test ilkesi:** "Ekranda Eğitmen" yorumunu "ses Gözde, rozet Eğitmen" diye düzelt (T7); `production-standard.test.ts`'in PEDAGOJI kelime `toContain` listesini davranış testine çevir (B3 ruhu); `archived/` import eden testi ya `lib/`'ye taşı ya arşiv ilkesini gevşet (hangisi CEO kararı).

Kapı: 3 kılavuz diff'i CEO onayından geçer, `git commit` "tedavi" diye mühürlenir. Onaysız prod deploy yok.

### Faz T5 — Platform boru hattı (ayrı sprint, CEO + Super Admin)

16. CMS-lite kararı (içerik repo'su vs headless) + bake CI (`--dry-run` PR kapısı) + CDN yol haritası (STORAGE_CONTRACT'a "Faz 2'de akademi CDN" maddesi). Bu faz T0–T4'ü bloklamaz; ama 02. SKU bake'i başlamadan karar verilir.

**Sıra özeti:** T0 (P0 referans) → T1 (sayı/süre) → T2 (ölçme) → T3 (evrensellik kararı) → T4 (kılavuz mührü) → T5 (boru hattı). T0–T2 Super Admin icrası, T3–T4 CEO onayı, T5 ayrı sprint. Hiçbir faz atlanmaz, hiçbir fazın kapısı test yeşili olmadan geçilmez.

---

*Son not (ajandan CEO'ya): 01_office_ai sağlam bir amiral — Üç Kapı + KVKK-erken + hata-avı + sunucu mührü rakiplerde yok. Eksikler içerik kalitesinde değil, senkron + ölçme + evrensellik katmanında. T0–T2 bir haftada kapanır; T3 kararı verilince köprüler aynı fırında 2 haftada bake'lenir. Kılavuzları atmayın — 6 cümlelik reform yeter.*
