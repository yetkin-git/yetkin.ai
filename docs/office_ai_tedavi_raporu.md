# Office AI Amiral Gemisi Müfredatı Tedavi Raporu

| Alan | Değer |
|------|-------|
| Tarih | 20 Eylül 2026 |
| Kapsam | `01_office_ai` — "İş Hayatında ve Ofiste Yapay Zekâ" (Tespit Raporu `/docs/office_ai_tespit_raporu.md` tedavi fazı) |
| Yöntem | Sıralı tedavi (P0 → P1 → P2) + akademi test kilitleri regresyonu, re-bake yok |
| Çıktı | `/docs/office_ai_tedavi_raporu.md` (bu dosya) |
| Durum | Tedavi tamamlandı — akademi suiti 119 dosya / 483 test yeşil |

> Not: Kelime sayımları `lib/academy/word-count.ts` SSOT (`countAcademyMarkdownWords`) ile, konuşma sayımları `spoken-scripts/*.md` HTML yorum hariç ham sayımla alınmıştır. Tespit Raporu'ndaki konuşma sayılarıyla ±%5 mertebe farkı sayım yöntemindendir (yorum satırı dahil/hariç); oran kararı değişmez. Re-bake / ses yeniden üretimi YAPILMADI: `spoken-scripts`, `lesson-cues`, `lesson-audio-timings`, `public/media/academy/audio` dosyalarına bu operasyonda dokunulmadı (çalışma ağacındaki mevcut `M` izleri önceki fırın oturumundan kalmadır).

---

## ADIM 1 — KRİTİK BİLİŞİM & ALTYAPI ONARIMI (P0)

### 1.1 İzlenmeyen kritik dosyalar stage'e alındı (Tespit B1)

| Dosya | Önce | Sonra |
|-------|------|-------|
| `lib/academy/office-ai-2-workspace.ts` | `??` izlenmiyor (2 dosya bağımlı: `cinema-cue-catalog.ts`, `excel-workspace.ts`) | `A` staged — sistem bağımlılığı kilit altında |
| `tests/academy/aphorism-cleanup.test.ts` | `??` izlenmiyor (PEDAGOJI §A.2/§E.2 kilidi) | `A` staged |

Komut: `git add lib/academy/office-ai-2-workspace.ts tests/academy/aphorism-cleanup.test.ts`. Commit atılmadı (operatör akışına bırakıldı); kayıp riski (yeni klon/CI/stash) kalktı.

### 1.2 `curriculum.ts` hayalet anahtar fallback'i temizlendi (Tespit B2)

**Sorun:** `curriculumForCourseSlug()` fallback'i `${slug}-${i+1}` üretiyordu; `01_office_ai` için `01_office_ai-7/8/9` gibi var olmayan anahtarlar (gerçek anahtarlar `k1/g1/w1` içerir). Pratikte `CURRICULUM_DRAFTS_BY_SLUG` dolu olduğu için çalışmıyordu; ölü ve yanıltıcı koddu.

**Tedavi (`lib/academy/curriculum.ts`):** fallback artık `lesson-index.ts` SSOT'undaki `curriculumLessonKeysForSlug()` anahtarlarından türer; indeks boşsa `[]` döner. Sayaç >0 ama indeks anahtarı yoksa (eski SKU) sessiz hayalet üretilmez, boş dönülür. İmport `curriculumLessonKeysForSlug` ile genişletildi:

```ts
const indexedKeys = curriculumLessonKeysForSlug(slug);
if (indexedKeys.length > 0) {
  return indexedKeys.map((key, i) => ({
    key, // gerçek anahtar: 01_office_ai-k1 / -g1 / -w1 dahil
    order: i + 1,
    // ...
  }));
}
const count = curriculumLessonCountForSlug(slug);
if (count > 0) {
  // indeks dışı hayalet üretme — boş dön, sessiz hayalet yasak
  return [];
}
```

**Regresyon:** `sample-course` → `[]`, `02/03/04/05_*` → `[]`, `01_office_ai` → 9 (draft yolu değişmez) davranışları korundu; `curriculum-content`, `curriculum-lesson-index`, `pilot-course-storyboard` testleri yeşil.

---

## ADIM 2 — İÇERİK DOYGUNLUĞU VE MAKALE/KARAOKE MAKASININ KAPATILMASI (P1)

### 2.1 Ders 6/7/8/9 compact makaleleri konuşma doygunluğuna çıkarıldı (Tespit U1)

| Vatandaş | Anahtar | Dosya | Makale önce | Makale sonra | Konuşma | Oran önce | Oran sonra |
|----------|---------|-------|-------------|--------------|---------|-----------|------------|
| 6 | `01_office_ai-4` | `section_4.ts` | 685 | **874** (+189) | 826 | 0.83 | **1.06** |
| 7 | `01_office_ai-g1` | `section_g1.ts` | 587 | **1015** (+428) | 1052 | 0.56 | **0.96** |
| 8 | `01_office_ai-w1` | `section_w1.ts` | 690 | **1135** (+445) | 1104 | 0.62 | **1.03** |
| 9 | `01_office_ai-6` | `section_6.ts` | 628 | **1037** (+409) | 1055 | 0.60 | **0.98** |
| 1 | `01_office_ai-1` | `section_1.ts` | 1454 | **1555** (+101: canlı kutu + standart) | 1270 | 1.14 | 1.22* |
| 2/3/4/5 | k1/2/3/5 | 4 dosya | — | +8'er (standart cümle) | — | — | 0.98–1.14 |

\* Ders 1'deki 1.14 → 1.22 artışı bilinçli ve gerekçelidir: +93 kelime Model Eğilim Canlı Kutusu (P2a yaşayan kaynak) + 8 kelime sınav standardı (P2c). Kutu anlatı değil üst-veridir; `COMPACT_ARTICLE_GUIDE` tavanı (1800) aşılmadı. İlk 5 dersin ev örüntüsü (makale = konuşma + El kitabı, oran ~1.10) korunur; son 4 ders artık aynı bandın içindedir (0.96–1.06).

**Zenginleştirme içeriği (her derste, SEN dili + sebep → eylem → sonuç zinciri korunarak):**
- **Ders 6 (E-posta ritüeli):** triyaj üçlüsü tanımları (acil/bugün, aksiyon/bu hafta, arşivlik), taslak anatomisi (hitap-talep-tarih-kapanış), arşiv-vs-sil kanıt ayrımı; El kitabı 3 başlıkta kenar durum eklendi.
- **Ders 7 (Gmail kapısı):** çift-kapı tezi (Gmail+Outlook aynı rutin), aksiyon tablosu 4 sütun anatomisi, 3 kopukluk türü (etiket/arşiv/taslak), 24-saat kapsam gerekçesi, kırmızı/sarı/yeşil karar okuması; El kitabı genişletildi.
- **Ders 8 (Word):** üç-iş haritası (sözleşme/dilekçe/rapor ayrı istem), 3 kayıp türü (ceza/hitap/ayrım), ataş adım reçetesi (dosya→istem→sayfa-numarası→kontrol), dilekçe 5 satırı, rapor gözlem/karar ayrımı; SEN/SIZ çift sicili ve `Sayın Yetkili` korundu.
- **Ders 9 (Cuma 30):** dağınık hafta gün-gün fatura, Excel 5 adımı (kapı/eşik/hijyen/kopya/maske), takvim bloğu reçetesi, slayt 3 sorusu + kutu 4 adımı, Üç Kapı'nın Cuma masasındaki izdüşümü; El kitabı genişletildi.

**Korunan kilitler (hepsi yeşil):** bridge-lock kapanış köprüleri (`bir sonraki derste Gmail Gemini`, `o 9. ders bitince`, `Bu 8. derstir…9. ders`, `sınav kapısı yalnız bu kapanış dersinden sonra`), SIRA SENDE outro hedefleri, `Peki neden…?` zincirleri, SEN/SIZ sicili, punchcard başlıkları, aforizma yasakları (BANNED 8 kalıp tarandı — 4 dosyada 0 eşleşme), Vatandaş Lisanı (ham `xlsx/docx/pptx` yok), `targetDurationMinutes` değişmedi (mühürlü timings'e yuvarlı).

### 2.2 Pratik adımları zenginleştirildi (`lib/academy/lesson-practice.ts`)

4 dersin `LESSON_PRACTICE` tohumu 3-adım kilidi bozulmadan derinleştirildi: adım başına 1 açıklayıcı yan cümle (örn. Ders 6 "acil (bugün para/imza), aksiyon (bu hafta cevap)"), Gmail tohumu `Rol/Kısıt` çitine alındı (SSOT istem aynen durur), Word tohumu iş-başına istem ayrıntısı aldı, Cuma tohumu takvim reçetesiyle netleşti. `office-ai-lesson-practice.test.ts` (3 test) yeşil.

### 2.3 Kelime senkronu

9 `section_*.ts` dosyasının `estimatedWordCount` alanı canlı sayıma eşitlendi; `word-count-sync.test.ts` (9/9 bölüm) yeşil.

---

## ADIM 3 — AMİRAL GEMİSİ KAPSAM & MİMARİ ADIMLARI (P2)

### 3.1 Model Eğilim Kartı Canlı Kutusu (Tespit H1)

**Yeni SSOT:** `lib/academy/model-tendency-card.ts`
- `ACADEMY_MODEL_TENDENCIES`: ChatGPT / Claude / Gemini / Özel API eğilim satırları (eğilim dili: "yatkındır"; sabit karakter iddiası yok).
- `ACADEMY_MODEL_TENDENCY_FRESHNESS_SEAL` = **`Tazelik Garantisi: Eylül 2026`** (gözden geçirme tarihi ilerletilebilir).
- `renderAcademyModelTendencyCardMarkdown()`: makaleye gömülen blockquote kutu.
- `isAcademyModelTendencyCardStale()`: 6 ayı aşan kartı bayraklar (gözlem; oynatıcı kilitlemez — dürüst yüzey: eski kart gizlenmez, damga tarihiyle basılır).
- `ACADEMY_MODEL_TENDENCY_REVIEW_MONTHS = 6`.

**Entegrasyon:** `section_1.ts` El kitabı'na `### Model eğilim kartı (canlı kutu)` alt başlığı eklendi; kutu `${renderAcademyModelTendencyCardMarkdown()}` ile basılır. Kasetteki eğilim cümleleri "Eylül 2026 anlık görüntüsü" sayılır; yaşayan kaynak kutudur. Kutu aylık güncellenir, kaset re-bake istemez — TTS ekonomisi korunur, tazelik artar.

**Kilit:** `tests/academy/model-tendency-card.test.ts` (4 test) — damga formatı, 4 satır + eğilim dili, Ders 1 makale entegrasyonu, bayrak mantığı (taze/geçmiş/geçersiz tarih).

### 3.2 OFF-102 İleri Ofis Hazırlığı (Tespit E3/E4/E5 + U5)

**Yeni taslak:** `lib/academy/curricula/office_ai/off-102.ts` (salt okunur projeksiyon; karar öncesi kod yazılmaz ilkesi)
- Taslak kimlik: slug `01_office_ai_ileri` (kanonda YOK), kart `OFF-102`, başlık "Ofiste Yapay Zekâ — İleri Ofis ve Veri AI".
- `off102DraftLessonsFromSatellites()`: uydu 10 (Takvim/Toplantı) → 11 (Formül/Grafik) → 12 (PDF) sırasını `planned.ts`'ten canlı projekte eder; `planned.ts` değişmez (syllabus 9+3 kilidi korunur).
- Ön koşul: OFF-101 kapanış (9/9 + sınav 70); sınav barajı 70; havuz bandı 30–50; `assertOff102DraftIntegrity()` bütünlük bekçisi.
- Açılış yolu 5 adım olarak dosya başında belgelendi (slug kanonizasyonu → anahtar taşıma → prompt köprüsü → bağımsız sınav → şerit güncelleme); `planned.ts` başlığına yönlendirme yorumu eklendi, `office_ai/index.ts` yeni ihracı taşır.

**Kart kodu uyarısı (karar notu):** `EC-102` (E-Ticaret) ile sayısal çakışma riski vardır; taslak `OFF-201` alternatifini hazır tutar (`OFF_102_MODULE_CODE_ALTERNATIVE`). Lansman öncesi `catalog-filter.ts` karması CEO + Super Admin çift imzasıyla netleşmelidir.

**Kilit:** `tests/academy/off-102-draft.test.ts` (3 test) — kimlik/ön koşul, 3 uydu projeksiyonu + bütünlük, kanon/sınav-yolu bulaşmazlığı.

### 3.3 Sınav Cümle Standardı (Tespit U6)

Standart (9 dersin tamamında aynen, köprü cümlelerine EK olarak — kilitli köprüler korunur):

> **Sınav, 9. ders bitince açılır. Baraj score %70'tir.**

- Dağılım: Ders 1/6/7/8/9 kapanışlarına P1/P2a çalışmasıyla birlikte, Ders 2/3/4/5 kapanışlarına bu adımda eklendi (her birine +8 kelime; `estimatedWordCount` güncellendi).
- "score" yazımı CEO direktifindeki haliyle aynen korunmuştur (bilinçli not: antre kalkanı `Baraj 70 puandır` der; iki yüzey çelişmez — kalkan antrede, standart ders kapanışlarındadır; kaset cümleleri değişmez).
- **Kilit:** `tests/academy/exam-sentence-standard.test.ts` (2 test) — 9 makale + 9 mühürlü gövde standardı aynen taşır.

---

## TEST & DOĞRULAMA

| Kapsam | Sonuç |
|--------|-------|
| Hedefli regresyon (word-count-sync, bridge-lock, practice, aphorism-cleanup + 3 yeni test) | 7 dosya / 23 test ✅ |
| Ders + müfredat çekirdeği (9 ders testi, syllabus, content, lesson-index, production-standard, sealed-audio-pilot) | 14 dosya / 103 test ✅ |
| **Tam akademi suiti (`npx vitest run tests/academy`)** | **119 dosya / 483 test ✅ 0 fail** |
| Re-bake | Yok (kaset/cue/timings/MP3'e dokunulmadı) ✅ |

Yeni test dosyaları: `model-tendency-card.test.ts`, `off-102-draft.test.ts`, `exam-sentence-standard.test.ts` (toplam 9 test). Güncellenen test: yok (mevcut kilitlerin tamamı ilk çalışta geçti; P1/P2 ekleri kilit cümlelerini koruduğu için revizyon gerekmedi).

## DEĞİŞEN DOSYALAR (bu operasyon)

**Yeni (5):** `lib/academy/model-tendency-card.ts`, `lib/academy/curricula/office_ai/off-102.ts`, `tests/academy/model-tendency-card.test.ts`, `tests/academy/off-102-draft.test.ts`, `tests/academy/exam-sentence-standard.test.ts`
**Değişen (12):** `lib/academy/curriculum.ts` (P0 fallback), `lib/academy/curricula/office_ai/{index,planned}.ts`, `section_{1,k1,2,3,5,4,g1,w1,6}.ts` (9 makale), `lib/academy/lesson-practice.ts` (4 tohum)
**Stage (2):** `lib/academy/office-ai-2-workspace.ts`, `tests/academy/aphorism-cleanup.test.ts` (`A`)

---

## CURSOR GELECEK VİZYONU (CEO Özel Soruları)

### 1) SEN OLSAYDIN NE YAPARDIN? — "Tek Kaynak Markdown → Makale + TTS Derleyici" hattı

Makale/konuşma makasının kök nedeni iki ayrı el yazımı metindir. Tedavide makası kapattık; ama kalıcı çözüm üretim hattını tekilleştirmektir. Hattı üç katmanlı kurardım:

**a) Tek kaynak: `lesson-source/*.md` (yazarın yazdığı tek dosya).** Her ders tek markdown: `##` başlıklar + `:::elkitabi`, `:::pratik`, `:::canli-kutu:model-egilim` gibi fenced direktifler + `<!-- tts: … -->` fonetik ipuçları (mevcut `phonetics.ts` satır içi taşınır). Yazar makale-kaset ayrımı düşünmez; niyeti yazar.

**b) İki derleyici, sıfır el senkronu:**
- `compileArticle(source)` → `section_*.ts` çıktısı: El kitabı başlıkları korunur, `Peki neden…?` zincirleri sayılır (ders başına ≥4, yoksa derleme uyarısı), `estimatedWordCount` otomatik basılır, yasaklı kalıplar (BANNED + `xlsx/docx/pptx`) derleme hatası verir — test sonradan değil, yazarken yakalar.
- `compileSpoken(source)` → `spoken-scripts/*.md` + cue bölme önerisi + `phonetics.ts` girdisi: makaledeki El kitabı ve canlı kutular otomatik düşer (kaset anlatı taşır, üst-veri taşımaz — P2a kutusu bu kuralın ilk vatandaşı olur), punchcard başlıkları cue sınırlarına kilitlenir, kelime/süre bütçesi (`SEALED_AUDIO_LIMITS`) aşılırsa derleyici hangi paragrafın kısalacağını önerir.

**c) Makas bekçisi (`scripts/diff-article-spoken.ts`, derleyici yazılmadan önce bile):** her PR'da makale/konuşma oranını hesaplar; 0.9–1.1 dışına çıkan ders CI'da sarı bayrak yer (kırmızı değil — editör gerekçesiyle geçebilir; Tespit Raporu §2.4'teki kilit kademelendirmesinin ilk uygulaması olur). Kısa vade (1 hafta) bekçi script'i, orta vade (1 ay) derleyiciler, uzun vade (çeyrek) yazar arayüzü (CMS'siz, dosya-tabanlı önizleme).

Bu hat kurulunca P1 gibi elle makas kapatma operasyonları tarihe karışır: yazar tek dosya yazar, makine iki çıktıyı tutarlı üretir, insan yalnız pedagojiyi yargılar.

### 2) Platform kurgusu doğru kurgulanmış mı? — "Kotalı Sanal Lab" + Sürü Dron / Shared Kernel uyarlaması

**Kısa cevap: evet, taşıyıcı kolonlar doğru; Lab, mevcut mimariye yeni oda açmadan (Manifesto çift-imza tetiklenmeden) "ders-sonu kotalı deneme" olarak oturur.**

**Neden kurgu doğru:** para (`amountMinor` + tek defter), mühür (sunucu puanlama + HMAC sitting), sözleşme (`RAIL_V1_HOPS_META` + edge rewrite + `@yetkin/kernel` pure) üçlüsü Lab'i taşıyacak olgunluktadır. Kararlar isabetli: kernel'e Prisma/Supabase sokmamak (dron'u web'e göbekten bağlamamak), `app/api/v1` kopya ağacı kurmamak (tek handler, edge'de soy), simülasyonu web'de tutup native'e Excel klonu yazmamak (bütçe disiplini).

**Lab uyarlaması (tasarım):**
- **Sözleşme:** 2 yeni hop (`academy.lab.quota` GET, `academy.lab.attempt` POST) `RAIL_V1_HOPS_META`'ya eklenir (16 → 18); zarf `{ok, error, requestId, apiVersion, data}` değişmez; dron tarafı yalnız bu 2 hop'u tüketir (mevcut Bearer + Idempotency-Key aynen).
- **Kernel:** kota sayacı (`LabQuota: {courseSlug, lessonKey, remaining, resetsAt}`) + Lab deneme sonucu tipi (`LabAttemptReceipt`) `@yetkin/kernel`'e pure tip olarak girer; para/ledger'e dokunmaz (deneme ücretsiz, kota tanımlı).
- **Sunucu:** `AcademyLabAttempt` tablosu (purchase başına ders-kota, örn. ders başına 5 deneme/ay) + fail-closed kota duvarı (kota bitince A5 dürüst mesaj: "Bu ayki denemen doldu; workspace tiyatrosu sınırsız çalışır"); öğrenci dosyası işlenir ama saklanmaz (KVKK: maske kuralı Lab girişinde zorunlu ön-adım, ham IBAN/kimlik Lab'e girmez — Ders 2 kilidi Lab kapısı olur).
- **İstemci:** web'de ders sonuna "Kendi dosyanla dene (kalan N)" butonu; dron'da aynı hop (dosya seçici native, işlem sunucuda — native'e model gömülmez, maliyet sunucuda ve kotalı).
- **B2B kolu:** kota şirket havuzundan düşer (kurumsal SKU: örn. 500 deneme/ay/şirket); raporlama "hangi ders, kaç deneme, hangi hata" kırılımında İK paneline iner — B2B satış argümanı ("çalışan Cell A1'i gerçekten öğrendi mi?") kanıtlanır.

**İnceltme (Pedagoji §B'ye 1 cümle):** "İzleme akışında zorunlu canlı çağrı yoktur; ders-sonu Lab denemesi kotalı ve isteğe bağlıdır." Böylece "canlı API yok" ilkesi (maliyet kalkanı) korunurken etkileşim yasağı kalkar.

### 3) Bir sonraki aşamada (OFF-102 lansmanı öncesi) 1 numaralı öncelikli hamle

**Tek hamle: OFF-102 açma kararını CEO + Super Admin çift imzasıyla kilitleyip `planned` → `baking` tetiğini yazıya dökmek — koddan önce karar.**

Gerekçe üçlüdür: (a) 83.71 dk'lık OFF-101 tavana dayanmıştır; Excel formül/grafik (E3 — "Excel vaat eden amiralde grafik yok" büyük eksiği) 101'e sıkıştırılamaz, her ders incelir; (b) uydu 11 çekirdek Excel zincirinin doğal devamıdır — ayrı şeritte kaldıkça "Excel bitti mi?" sorusu cevapsız kalır ve öğrenci güveni aşınır; (c) bu rapor OFF-102 taslağını (`off-102.ts` + kart-kodu uyarısı + 5 adımlı açılış yolu) karar masasına hazır hale getirdi — teknik belirsizlik kalmadı, yalnız imza eksik.

**Karar metni (öneri, Pedagoji §D.1'e 1 paragraf):** "OFF-102 (İleri Ofis ve Veri AI: Takvim/Toplantı, Formül/Grafik, PDF + prompt köprüsü) OFF-101 kapanışına bağlı bağımsız SKU'dur; sınavı ve mührü ayrıdır; kart kodu EC-102 çakışması netleşmeden `OFF-102` taslak kalır." İmza çıkarsa ilk fırın uydu 11'dir (E3'ü kapatır, amiral vaadini tamamlar); ikinci dalga 10+12 ve köprü derstir. Kod hamlesi değil, karar hamlesi — sonraki 3 ayın iş sırasını belirler.
