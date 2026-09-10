# 042 — Akademi Multimedya Motoru (Gerçeklik Kontrolü)

| Alan | Değer |
|------|--------|
| Tarih | 7 Eylül 2026 |
| Makam | Teknik uzman ajan (Cursor / Grok 4.6) → SUPER ADMIN |
| Kapsam | Prisma akademi şeması, `/academy/[slug]/oyna` oynatıcı, TTS bake / ingest script’leri. `archived/`, `public/media/`, `node_modules/`, `.next/` taranmadı. Kod **değiştirilmedi**. |
| Varsayılan | «1 kere üret, statik kaydet, 1000 kere izlet» zaten anayasa/pedagoji hattıdır. CMS yok. İzlemede Gemini yok. |

---

## Yönetici özet

Hayal edilen mimari **yeni bir ürün değil**; çalışan ağaçta kısmen kurulmuş, **tek derste** mühürlenmiş bir hattır. 29 compact ders makale; karaoke yalnız `01_office_ai-1`. Prisma’da ders satırı yoktur. Medya adresleri DB kolonunda değil, **kamu dosya yolu + kod tohumu + cue JSON** üzerindedir.

Üç katmanda gerçek:

1. **Prisma:** `audioUrl` / `transcriptVttUrl` kolonları yok. Locator tablosu `AcademyAudioCache` WAV içindir. `AcademyLesson` modeli yoktur; içerik `lib/academy/curricula/`.
2. **UI:** Teleprompter + HTMLAudio **var**. WebVTT **yok**. Saat `currentTime` + bake timings JSON.
3. **Derleyici:** TTS bake script’i **var**. Markdown `[TTS:]` / `[IMG:]` etiketi **yok**. Görsel bake script’i **SKIP stub**. Canlı `generateSpeech` / `listen` **410**.

**İlk neşter:** Yeni CMS tablosu ve VTT ikizi yazma. Mevcut karaoke katmanını (`cue JSON` + mühürlü WAV + `ACADEMY_MEDIA_SEALED_AUDIO`) ikinci derse kopyala. Görsel/müzik/Veo’yu Prisma’ya basmadan önce operatör bake’ini dirilt.

---

## 1. Prisma — medya desteği

Kaynak: `prisma/schema/academy.prisma`. Yorum satırı: «İçerik kod tohumudur (CMS yok).»

### 1.1 Ne var

| Model | Medya alanı | Rol |
|-------|-------------|-----|
| `AcademyCourse` | yok | slug, title, summary, trend. Kapak yok. |
| `AcademyLesson*` | **model yok** | Ders gövdesi Prisma’da durmaz. |
| `AcademyLessonCompletion` | yok | İlerleme (`lessonKey`). İçerik değil. |
| `AcademyAudioCache` | `publicUrl`, `objectPath`, `mimeType`, `byteSize`, `model`, `mediaReleaseSeal` | Bake locator. Gemini yalnız miss’te (operatör). PostgREST yazmaz. |

TypeScript tohumu (`AcademyLessonDraft` / `AcademyLessonSeed`) isteğe bağlı `audioUrl` + `videoUrl` taşır. Oynatıcı mühürlü derste bu alanları **okumaz**; `isAcademyLessonAudioSealed` → `/media/academy/audio/{slug}/{key}.wav`.

Kanonik disk: WAV. MP3 yok. `mimeType` cache satırında `audio/wav`.

### 1.2 Kesin olmalı listesi

| İstenen | Durum | Ne yapılmalı |
|---------|--------|----------------|
| `audioUrl` (MP3) | Prisma’da yok. Çalışan yol **WAV kamu path**. | Kolon ekleme. Format değişirse bake çıktısını MP3’e çevir, `mimeType` güncelle, `academyLessonAudioPublicPath` uzantısını değiştir. Locator zaten `publicUrl`. |
| `transcriptVttUrl` | Yok. `.vtt` dosyası yok. | **Ekleme.** Teleprompter SSOT: `lib/academy/lesson-cues/{key}.json` + `lib/academy/lesson-audio-timings/{key}.json`. VTT ancak a11y türevi olabilir; ikinci kaynak olmasın. |
| `timestamps` | Prisma’da yok, **kodda var**. | Bake zaten timings JSON yazar. DB’ye JSON kolon basmak çift yazımdır. |

### 1.3 İdareli kullanılacaklar

| İstenen | Durum | Şemaya nasıl (ve ne zaman) |
|---------|--------|----------------------------|
| `coverImageUrl` (Nano Banana) | Prisma ve katalog seed’inde yok. Göz katmanı tek JPG: `/academy/cinema/01_office_ai-1-eye.jpg` (kod haritası). | Vitrin kapağı gerekirse **önce** `AcademyCourse`’a opsiyonel `coverImageUrl` (String?) — kurs başına bir dosya. Ders sahnesi için Prisma değil `lesson-visual-stage` slot’u. `IMAGE_GEN` canlı rol; akademi bake script’i **bağlı değil**. |
| `backgroundMusicUrl` (Lyria) | Sıfır. AI rol sicilinde MUSIC yok (tavan 8; `VIDEO_GEN` ölü). | Kolon **ekleme**. Müzik ürün kararı + yeni rol ister; Anayasa tavanı dolu. |
| `videoAssets` (Veo 3.1) | `videoUrl` TypeScript’te var, yayın müfredatında `undefined`. `VIDEO_GEN` fail-closed (`generateVideo?: never`). Micro-video slot’ları kamu path convention (`/media/academy/micro/{key}.mp4`); bake kümesi **boş**. | Json dizi kolon **ekleme**. Sahne listesi `AcademyLessonVisualCard[]` kod haritasında durur. Veo ancak anayasa/rol açılırsa `scripts/` bake + `kind: "veo"` kartı. |

### 1.4 Şema kararı (pragmatik)

**Yapılmayacak:** `AcademyLesson` CMS tablosu. Ders metnini DB’ye taşımak bu işin maliyeti değil, ürün sapması.

**Yapılacak (gerekirse, 2. tur):** `AcademyAudioCache`’i tür genişletmek — `kind: audio \| image \| video` + aynı locator şekli. Bugün tek satır tipi ses. Cover/video gelince yeni tablo (`AcademyMediaAsset`) eski cache’in genellemesi olsun; `AcademyCourse` şişmesin.

Bugün Prisma migration **zorunlu değil.** Mühür = dosya + JSON + `ACADEMY_MEDIA_SEALED_AUDIO` sicili.

---

## 2. UI — TTS ve kayan yazı

Rota: `app/academy/[slug]/oyna/page.tsx` → `CurriculumPlayer`.

### 2.1 Ne var (yeniden yazma)

Karaoke kabuğu **kurulu:**

- `LessonMediaPlayer` — mühürlü WAV, `HTMLAudioElement.currentTime`, izlemede TTS yok.
- `LessonTeleprompter` — cue `start`/`end`/`text`; `elapsedSec` ile kaydırır.
- `LessonCinemaEyeLayer` — cue penceresinde 8 sn görsel kart (şimdilik Nano plaka / poster).
- `academyCitizenPlayerLayer` — mühür + cue yoksa `kind: "article"` (teleprompter basılmaz).

Pedagoji: 29 mühürsüz derste karaoke yok. Cue taslağı `01_office_ai-2` vatandaşa basılmaz.

İzleme API’si: `POST /api/academy/generateSpeech` ve `.../listen` her yöntem **410**. Tamamlama `POST /api/academy/courses/[id]/curriculum` (ilerleme; medya üretmez).

### 2.2 Ne yok

- `<track src="*.vtt">` / WebVTT parser.
- Öğrenci markdown’ından canlı senkron.
- MP3 oynatıcı yolu (kaynak WAV).

### 2.3 Uygun Next.js yaklaşımı

Yeni bileşen yazma. Mevcut client kabuğu yeter:

1. Cue JSON + timings’i derse ekle.
2. `ACADEMY_MEDIA_SEALED_AUDIO[slug]` listesine `lessonKey` yaz.
3. WAV’ı `public/media/academy/audio/{slug}/{key}.wav` altına bırak (bake).
4. `CurriculumPlayer` karaoke dalı otomatik açılır.

VTT istenirse: timings JSON’dan **üretilmiş** `.vtt` (erişilebilirlik `/ captions`); teleprompter yine JSON okusun. Çift SSOT yasak.

---

## 3. İçerik derleyici — workflow

Öğrenci izlerken generate **yok.** Bu kural kodda tutuluyor (410 + `enabled: false` + mühürlü path).

### 3.1 Var olan hat

```
docs/curriculum/*.md
  → scripts/ingest-course-sections.ts     (metin → lib/academy/curricula/<sku>/)
lib/academy/spoken-scripts/{key}.md       (konuşma metni; makaleden ayrı)
lib/academy/lesson-cues/{key}.json        (teleprompter paragrafları)
  → npm run generate:academy-audio -- --seal --confirm-gemini-spend
       WAV + timings JSON + (opsiyonel) academy_audio_cache satırı
  → oynatıcı statik /media/... okur
```

`scripts/render-academy-lesson-media.ts` **bake yapmaz** («SKIP — sealed-diagrams arşivde»). Micro-video anahtar kümeleri boş.

`[TTS: gemini-3.1-flash]` / `[IMG: Nano Banana prompt]` parse **edici yok.** Ingest yalnızca YAML frontmatter + bölüm gövdesi okur; Gemini çağırmaz.

### 3.2 Etiket fikri neden uymuyor

Makale gövdesi vatandaşa «Tam Ders Metni» olarak basılır. Üretim yönergesini oraya gömmek (1) ingest’i kirletir, (2) SEN metninde prompt sızdırır, (3) Pedagoji E’ye aykırı: **metin → konuşma metni → ses → cue → görsel**.

Konuşma metni zaten ayrı dosya. Model kimliği `lib/kernel/ai/model-roles.ts` (`VOICE_TTS` = `gemini-3.1-flash-tts-preview`). Prompt’u markdown’a yazmak ikinci SSOT olur.

### 3.3 CLI konum

| İş | Dosya | Not |
|----|--------|-----|
| Metin ingest | `scripts/ingest-course-sections.ts` | Durur. Medya üretmez. |
| TTS bake | `scripts/generate-academy-lesson-audio.ts` (`npm run generate:academy-audio`) | Asıl derleyici. `--dry-run` varsayılan; harici çağrı `--seal` + `--confirm-gemini-spend`. |
| Görsel bake | `scripts/render-academy-lesson-media.ts` | Stub. Halefi **aynı scripts/** altında, API route değil. |
| Veo / Lyria | yok | `VIDEO_GEN` ölü; MUSIC rolü yok. Canlı gateway’e bağlama. |

Yeni «media compiler» paketi veya `app/api` üretimi **açma.** Operatör CLI + git’e dondurulmuş dosya.

Görsel iş listesi (idareli) ayrı manifest olabilir: `lib/academy/media-jobs/{lessonKey}.json` (`kind`, `prompt`, `outPath`). Markdown gövdesine değil.

---

## 4. Entegrasyon adımları (öncelik)

Kod bu turda yazılmadı. Sıra:

1. **Ses + kayan yazı (kesin):** İkinci mühür adayı seç (`01_office_ai-2` cue taslağı duruyor). Spoken script / cue hizası → `generate:academy-audio --seal` → sicile ekle. Prisma yok.
2. **Format:** WAV kalsın (Chrome 48 kHz resample zaten bake’te). MP3 sonra, tek path değişikliği.
3. **Kapak:** Nano Banana çıktısını `public/` altına koy; vitrin gerekirse `AcademyCourse.coverImageUrl`. Ders gözü `lesson-visual-stage` kart `src`.
4. **Görsel derleyici:** `render-academy-lesson-media.ts` stub’unu operatör `--seal` hattına çevir (`IMAGE_GEN`). İzleme route’una bağlama.
5. **Veo / Lyria:** Anayasa + rol tavanı çözülmeden şema ve UI yok. Sahne kartı `kind: "veo"` yuvası kodda hazır; bake ve gateway yok.
6. **Yapılmayacak:** Ders CMS’i, izleme anı Gemini, öğrenci MD içinde `[TTS:]/[IMG:]`, VTT’yi teleprompter SSOT yapmak.

**Ölçüt:** Öğrenci `/academy/01_office_ai/oyna` açınca network’te generate yok; yalnız statik WAV + (ilerleme POST). Bu ölçüt bugün amiral ders için tutuluyor; genişleme aynı kalıbın kopyasıdır.


Görselleştirme ve Uygulama Sahnesi (Slayt & Ekran Kartları)Görselde de belirttiğin gibi sadece düz metin okumak bir noktadan sonra sıkıcılaşır ve pedagojik gücü düşürür.Planımız nedir? Tespit raporunda belirlediğimiz Tur 3 (Slayt & Uygulama Kartları) aşamasında tam olarak bunu yapacağız.  Oynatıcı mimarimizde arka planda yer alan LessonCinemaEyeLayer katmanına, anlatılan konunun adım adım Excel ekran görüntülerini, uygulama şemalarını ve dinamik kart görsellerini yerleştireceğiz.  Öğrenci sesi dinlerken ekranda anlatılan uygulamanın ilgili ekran kartını/şemasını görecek. 
Geliştirilmiş Prompt ve Cümle Yapısı: Bundan sonraki tüm kurslarda (EC-102 vb.) metinleri fırına vermeden önce paragraf başındaki kısa emredici cümleleri doğrudan akıcı kalıplara sokacağız. Böylece hiçbir dersi ikinci kez Re-Bake etmek zorunda kalmayıp ilk seferde firesiz mühürleyeceğiz. 


Akademi Sistemi Eğitim geliştirme mimarisi 3 Ana Tur (Aşama) halinde kurgulanmıştır:
1. Aşama (Metin & İçerik Katmanı): Derslerin yazılı makalelerinin, müfredat yapısının ve platform altyapısının kurulması.
2. Aşama (Mühürlü Multimedya & Karaoke): Eğitmen seslerinin (Puck, Callirrhoe vb.) TTS ile fırınlanıp mühürlenmesi, milisaniyelik cue altyazı karaoke senkronunun kurulması.
3. Aşama (Görsel Sahne & Slayt Bağlantısı - Tur 3): Mühürlenen bu seslerin ve karaoke zaman damgalarının üzerine, LessonCinemaEyeLayer katmanı aracılığıyla konuya özel ekran görüntüleri, grafikler, slider slaytları ve uygulama kartlarının yerleştirilerek görsel sahnenin kilitlenmesi.