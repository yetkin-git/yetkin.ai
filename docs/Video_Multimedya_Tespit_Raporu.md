# VIDEO / MULTİMEDYA TESPİT RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 9 Eylül 2026 |
| Makam | Teknik ve mimari denetçi (Cursor Ajanı) → SUPER ADMIN |
| Kapsam | `docs/Bilgiler/Akademi_Multimedya_Raporu.md`, `/academy/[slug]/oyna` oynatıcı, `LessonCinemaEyeLayer`, teleprompter/cue saati, `scripts/` bake/ingest. `archived/`, `public/media/`, `node_modules/`, `.next/` taranmadı. Kod **değiştirilmedi**. |
| İlişkili sicil | `.system_docs/PEDAGOJI.md` §E–F, `.system_docs/ANAYASA.md` B4, `.system_docs/STORAGE_CONTRACT.md`, `docs/Academy_Tespit_Raporu.md`, `docs/Bilgiler/Akademi_Multimedya_Raporu.md` (7 Eylül — kısmen bayat) |
| Üslup | Tarafsız. Yeşil boyama yok. Bu belge hukuki mütalaa değildir. |

**SKU isim düzeltmesi:** Prompt’taki `04_nocode_bot_ai` ve `05_prompt_master` kanon slug değildir. Canlı vitrin: `04_chatbot_nocode`, `05_prompt_practice`. Aşağıda dört hedef SKU bu isimlerle anılır.

---

## Yönetici özet — üç sorunun hükmü

1. **Oynatıcı video/multimedya taşıyor mu?** Kabuk evet; yayın içeriği hayır. `/oyna` mühürlü derste **WAV + kayan yazı + 8 sn görsel kart** basar. MP4/WebM/HLS yuvası kodda durur, bake kümesi **boştur**. Amiral `01_office_ai` 6/6 karaoke’dir. Kartlar bugün tek tekrarlanan JPG plakadır; Excel ekran görüntüsü / slayt dizisi / Veo klibi vatandaşa basılmaz.

2. **Fırınlama 02–05 için hazır mı?** Ses hattı **hazır** (operatör CLI, `--seal` kapısı). Görsel/video hattı **hazır değil** (`render-academy-lesson-media.ts` SKIP stub; `VIDEO_GEN` anayasa ölü yuva). 02–05’te konuşma metni, cue JSON, timings, WAV ve göz katmanı **sıfırdır**. Eksik olan oynatıcı değil, içerik + sicil + (isteğe bağlı) görsel bake’dir.

3. **İzlemede canlı generation var mı?** **Yok.** `generateSpeech` / `listen` HTTP **410**. `VIDEO_GEN` factory `never`. Öğrenci yalnız `public/` altındaki statik dosyayı okur. Ayrı bir medya CDN ürünü yoktur; Next aynı köken + uzun cache ile sunar.

**Tek cümle:** Mimari, «1 kere üret, statik kaydet, 1000 kere izlet» ilkesine kilitlidir ve Ofis protokolü kopyalanabilir; dört compact ders hâlâ makaledir. Video akademisine giden yol yeni oynatıcı yazmak değil, Ofis hattını 24 derse uygulamaktır — Veo açmadan.

---

## 1. Video / multimedya oynatıcı altyapısı (`/oyna`)

Rota: `app/academy/[slug]/oyna/page.tsx` → `CurriculumPlayer`. Vatandaş katmanı: `academyCitizenPlayerLayer`.

### 1.1 Ne basılıyor (iki kabuk, tek sayfa)

| Katman | Koşul | Öğrenci ne görür |
|--------|--------|------------------|
| `article` | Mühür yok veya cue boş | Yalnız `LessonStudyTabs` (Özet / Tam Ders Metni / Sınav). Rozet: «Makale». |
| `article+karaoke` | `ACADEMY_MEDIA_SEALED_AUDIO` + cue JSON | Sinema sahnesi + teleprompter overlay + WAV çubuğu; altında aynı çalışma sekmeleri. Rozet: «Sesli anlatım». |

Karaoke **otomatik** açılır. Yeni React kabuğu gerekmez. Kapı üçlüdür: sicil + cue + (oynatma için) kamu WAV.

### 1.2 Video, slayt, dinamik görsel, MP4/WebM — dürüst kesit

**Slayt / sahne kartı (var, sığ):** `LessonCinemaEyeLayer` cue penceresinde 8 sn kart basar (`ACADEMY_VEO_SCENE_DURATION_SEC = 8`). Kart türü `nano` (hareketsiz görsel) veya `veo` (baked dosya). Saat `currentTime`; cue `startSec` ile kilitli.

**Dinamik görsel (var, içerik zayıf):** Kart, aktif cue ile değişir. Amiral 6 derste `STAGE_BY_LESSON_KEY` doludur. Hepsi `kind: "nano"` ve **aynı** plaka: `/academy/cinema/01_office_ai-1-eye.jpg`. Cue başına Excel ekranı, uygulama şeması veya slayt **yoktur**. Göz katmanı «sinema çerçevesi + tekrarlayan poster»dir; Tur 3 slayt vaadi henüz doldurulmamıştır.

**MP4 / WebM / HLS (yuvası var, küme boş):**

- Yol sözleşmesi: `/media/academy/micro/{assetKey}.mp4|.webm|.m3u8`.
- `LessonCinemaMediaCard`, `kind: "veo"` ve bake sicili doluysa `<video muted playsInline src=mp4>`.
- `ACADEMY_BAKED_MICRO_VIDEO_KEYS` ve `ACADEMY_BAKED_HLS_KEYS` **`[]`**.
- Compact `diagrams` / `microVideos` slot tipi `CurriculumPlayerLesson` üzerinde durur; `LessonStudyTabs` bunları **çizmez**. `composeAcademyLessonBlocks` bileşen ağacında kullanılmaz. Compact şema yuvası sinema sahnesi değildir (Pedagoji E.2).

**Tam boy ders videosu (yok):** YouTube/Vimeo gömme sınıflandırması `lesson-playback.ts` içindedir; CSP `media-src 'self'`; dış CDN/YouTube bu fazda bağlanmaz. Demo MP4 (`/academy/demo/office-ai-intro.mp4`) vatandaş karaoke sahnesine girmez.

**WebVTT:** Yok. SSOT cue JSON + timings JSON. `<track>` yok.

**Saat:** `LessonMediaPlayer` → `HTMLAudioElement.currentTime` → `mediaElapsed` → teleprompter + göz kartı. Kelime-saati yayın senkronu değildir.

### 1.3 Karaoke / sahne kartı 02–05’e uygulanabilir mi?

**Evet — mimari kopyalanabilir. Hayır — içerik ve bake kapısı hazır değil.**

Oynatıcı SKU-kördür. `02_ecommerce_ai-1` için karaoke açmak, Ofis ile aynı dört dosya + iki sicil satırıdır:

1. `lib/academy/spoken-scripts/{key}.md`
2. `lib/academy/lesson-cues/{key}.json` (+ `index.ts` import)
3. Bake: WAV → `public/media/academy/audio/{slug}/{key}.wav` + `lesson-audio-timings/{key}.json`
4. `ACADEMY_MEDIA_SEALED_AUDIO[slug]` listesine `lessonKey`
5. (Göz katmanı) `STAGE_BY_LESSON_KEY` + poster/kart `src`

Vatandaş `/oyna` bunu yeni bileşen olmadan basar. Testler zaten «mühürsüz = article, mühürlü = karaoke» sözleşmesini kilitler.

**Kapı sürtünmesi (kod, içerik değil):** `scripts/generate-academy-lesson-audio.ts` `--slug=` yalnız `ACADEMY_MEDIA_SEALED_SKU_SLUGS` kabul eder; liste bugün **`["01_office_ai"]`**. `--slug=02_ecommerce_ai` bugün `TTS mührü yok` fırlatır. Prodüksiyon kuyruğu (`ACADEMY_MEDIA_PRODUCTION_QUEUE`) boştur; yorum «konuşma metni + cue hazır, karaoke kapalı» der — 02–05 oraya da yazılmamıştır. İlk 02 bake’inden önce sicile slug eklemek **zorunlu küçük kod işidir**; oynatıcı yeniden yazımı değildir.

### 1.4 Amiral vs dört compact — envanter

| SKU | Ders metni | Spoken script | Cue JSON | Timings | Mühürlü WAV | Göz katmanı | Karaoke |
|-----|------------|---------------|----------|---------|-------------|-------------|---------|
| `01_office_ai` | 6/6 | 6/6 | 6/6 | 6/6 | 6/6 (~549…342 sn) | 6/6, tek JPG | Evet |
| `02_ecommerce_ai` | 6/6 compact | 0 | 0 | 0 | 0 | 0 | Hayır |
| `03_social_media_ai` | 6/6 compact | 0 | 0 | 0 | 0 | 0 | Hayır |
| `04_chatbot_nocode` | 6/6 compact | 0 | 0 | 0 | 0 | 0 | Hayır |
| `05_prompt_practice` | 6/6 compact | 0 | 0 | 0 | 0 | 0 | Hayır |

7 Eylül `Akademi_Multimedya_Raporu.md` «karaoke yalnız `01_office_ai-1`» der. **Bayat.** 9 Eylül kodu ve `STORAGE_CONTRACT`: amiral **6/6** mühürlüdür; kuyruk boştur.

Modül `voiceConfig` (Callirrhoe, kadın) 02–05 ingest metasında durur. Bu, TTS yuvası seçimidir; karaoke açmaz.

---

## 2. Video ve medya fırınlama (bake pipeline)

Hedef hat (Pedagoji D/E, Anayasa B4): **metin → konuşma metni → ses → cue → görsel**. Tersine değil. Öğrenci izlerken üretici yok.

### 2.1 Çalışan / duran / ölü

| İş | Betik / kapı | Durum |
|----|----------------|--------|
| Metin ingest | `scripts/ingest-course-sections.ts` | Çalışır. YAML + gövde → `lib/academy/curricula/<klasör>/`. Gemini yok. Medya yok. |
| TTS bake | `npm run generate:academy-audio` → `scripts/generate-academy-lesson-audio.ts` | **Asıl derleyici.** `--dry-run` varsayılan. Harici çağrı: `--seal` **ve** `--confirm-gemini-spend`. Çıkış: WAV (48 kHz, +8 dB) + timings JSON. Skip-preventer + nefes dilimi + 6.5 sn RPM kalkanı bağlı. |
| Cue ↔ konuşma kilidi | `assertSpokenScriptMatchesCues` | Markdown paragrafı cue paragrafına eşit değilse bake durur. |
| Görsel bake | `scripts/render-academy-lesson-media.ts` (`npm run render:academy-media`) | **SKIP stub.** «sealed-diagrams arşivde. `public/media/academy` statik kalır.» |
| Micro-video / HLS sicili | `lib/academy/baked-micro-videos.ts` | Boş dizi. Operatör binary bırakırsa dolar; betik basmaz. |
| `lib/academy/media-jobs/` | — | **Yok.** Prompt/job manifest’i önerilmiş, yazılmamış. |
| Veo / `VIDEO_GEN` | `lib/kernel/ai/types.ts` `generateVideo?: never` | **Fail-closed.** Anayasa tavanı 8; yuva mühürlü-ölü. |
| `IMAGE_GEN` | Gateway factory canlı (`imagen-4.0-generate-001`) | Akademi bake’ine **bağlı değil.** Studio arşivde. İzleme route’unda yok. |
| `[TTS:]` / `[IMG:]` markdown etiketi | — | Parse edici yok. Pedagoji E: üretim yönergesi SEN metnine gömülmez. |
| İzleme TTS | `POST /api/academy/generateSpeech`, `.../listen` | Her yöntem **410**. |

### 2.2 Ses hattı — «1 kere üret» gerçekten var mı?

Var. Operatör:

```
npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-6
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-6
```

WAV `public/media/academy/audio/...` altına yazılır. Oynatıcı `academyLessonAudioPlaybackSrc` ile aynı köken dosyayı çalar. `AcademyAudioCache` locator’dır; yayın vaadi kamu path’tir. Prisma `audioUrl` kolonu yoktur ve gerekmez.

02–05 için bu CLI **içerik yokken** işe yaramaz: `loadAcademySpokenScriptParagraphs` boş, `academyMediaReleaseJobForLesson` tur üretmez, `DialogueTurn[] boş` / boş iş. Önce spoken + cue; sonra slug’ı bake allowlist’ine almak.

### 2.3 02–05’i multimedya/video formuna geçirmek için ne eksik?

Eksikler öncelik sırasıyla. Hepsi Ofis protokolünün kopyasıdır.

**A. İçerik (asıl maliyet, ~24 ders)**

1. Konuşma metni (`spoken-scripts/{slug}-{n}.md`) — makale gövdesi seslendirilmez. Kod çiti, tablo ve soğuk H2 ses dışıdır. Skip-preventer: paragraf başı kısa emir bağlaçlı akışa çevrilir **fırından önce** (Pedagoji E.5; sıfır re-bake).
2. Cue JSON — 4 adımlı doygunluk (ısınma / senaryo 1 / senaryo 2 / saha görevi), `id` / `start`–`end` taslak duvar saati / `section` / `paragraphs[]`.
3. Cue’yu `lesson-cues/index.ts` haritasına bağlamak.
4. (Göz) cue başına kart: ekran görüntüsü, şema veya Nano plaka. Bugünkü tek JPG’yi 24 derse kopyalamak «video eğitim» sayılmaz.

**B. Bake ve sicil (küçük kod + operatör saati)**

5. `ACADEMY_MEDIA_SEALED_SKU_SLUGS` (ve gerekirse `ACADEMY_MEDIA_PRODUCTION_QUEUE`) — aksi halde CLI 02’yi reddeder.
6. `--dry-run` → insan onayı → `--seal` TTS. Timings JSON yazılır.
7. `ACADEMY_MEDIA_SEALED_AUDIO` + `ACADEMY_SEALED_AUDIO_DURATION_SEC` (yedek tablo) + timings import.
8. `STAGE_BY_LESSON_KEY` — karaoke açılınca göz katmanı; yoksa ses + yazı, plaka yok.

**C. Görsel/video fırını (ürün kararı)**

9. `render-academy-lesson-media.ts` stub’unu operatör `--seal` + `IMAGE_GEN` hattına çevirmek **veya** insan çekimli ekran kartlarını `public/academy/cinema/` ve/veya `/media/academy/diagrams/` altına koymak.
10. Veo/MP4: anayasa `VIDEO_GEN` açılmadan **yapılmaz.** `kind: "veo"` yuvası bekler; factory yoktur. Micro-video boş küme bilinçli sıfırdır.

**D. Yapılmayacaklar (önceki raporla aynı, hâlâ doğru)**

- `AcademyLesson` CMS tablosu.
- İzleme anı Gemini/Veo/TTS.
- VTT’yi teleprompter SSOT yapmak.
- Compact makaleye `[TTS:]/[IMG:]` gömmek.
- Oynatıcıyı yeniden yazmak.

### 2.4 Dört SKU — içerik hazırlık farkı (dürüst)

Metin **var.** Ses/görsel **yok.** Kalınlık kabaca:

| SKU | Compact süre (modül) | Karaoke’ye en yakın iş | Risk |
|-----|----------------------|------------------------|------|
| `02_ecommerce_ai` | ~85,5 dk | Ofis kadar kalın gövde; ticari vaat net. İlk kopya adayı. | Prompt’lar ve pazaryeri UI kartları cue’ya bölünmeden bake firesi. |
| `03_social_media_ai` | ~51,5 dk | Kısa; görsel fabrika vaadi. | Öğrenci «video kursu» bekler; karaoke+kart ile yetinilmezse vaat şişer. |
| `04_chatbot_nocode` | ~53 dk | Akış ekranları (Voiceflow/Botpress) kart ister. | Ekran kaydı olmadan «kurulum» zayıf kalır. |
| `05_prompt_practice` | ~44 dk | En kısa; metin-ağırlıklı, kart ihtiyacı düşük. | Süre bandı §F (7–12 dk/ders) konuşma metninde tutulmalı; makale kesilmez. |

Master kaynaklar `docs/curriculum/02_ecommerce_ai_mastery.md`, `03_social_media_factory.md`, `04_chatbot_mastery.md`, `05_prompt_engineering_mastery.md`. Ingest edilmiş gövde `lib/academy/curricula/{ecommerce_ai,social_media_ai,chatbot_nocode,prompt_practice}/`.

---

## 3. Anayasa ve performans hizalaması

### 3.1 Sıfır canlı generation — muhafaza ediliyor mu?

**Evet, izleme yüzeyinde kilitli.**

| Kalkan | Kanıt |
|--------|--------|
| Vatandaş TTS | `generateSpeech` / `listen` → 410. Oynatıcı `generateSpeech` çağırmaz. |
| Vatandaş video gen | `generateVideo?: never`. Testler `/oyna` ve `CurriculumPlayer` içinde `generateVideo` arar, bulamaz. |
| Pedagoji E / Anayasa B4 | «İzlemede harici API yoktur. Medya Aşama 3’te pre-bake.» |
| Operatör TTS | Yalnız CLI + `--seal` + `--confirm-gemini-spend`. `VOICE_TTS` factory bake içindir. |
| `IMAGE_GEN` | Canlı rol; akademi izleme ve bake script’i kullanmaz. |

Ölçüt (önceki rapor, hâlâ geçerli): öğrenci `/academy/01_office_ai/oyna` açınca network’te generate yok; statik WAV + ilerleme `POST /api/academy/courses/[id]/curriculum`. 02–05 bugün generate de yok, WAV da yok — yalnız makale.

### 3.2 Statik depolama / CDN?

**Aynı köken kamu dosyası; ayrı CDN ürünü yok.**

- Ses: `public/media/academy/audio/{slug}/{key}.wav` → URL `/media/academy/audio/...`
- Sinema plakası: `public/academy/cinema/01_office_ai-1-eye.jpg`
- `next.config.ts`: `/media/academy/audio/:path*` ve `/academy/cinema/:path*` için `Cache-Control: public, max-age=31536000, immutable`; WAV’da `Accept-Ranges: bytes`.
- `lesson-playback.ts`: «Dış CDN / YouTube bu aşamada bağlanmaz.»
- `STORAGE_CONTRACT`: vatandaş object store yok; akademi sesi kamu WAV. Bucket provision yayın vaadi değil.

Vercel/hosting kenarı bu dosyaları statik asset olarak dağıtır. Bu, «CDN üzerinden sunuluyor» iddiasını teknik olarak karşılar; S3/CloudFront ayrı sözleşmesi **yoktur.** WAV’lar büyük olabilir; immutable cache doğru, ilk bayt hâlâ origin’dendir.

Prisma medya kolonu eklemek hizayı bozar: çift SSOT. Locator (`AcademyAudioCache`) isteğe bağlıdır; oynatıcı onu okumaz.

---

## 4. SEN OLSAYDIM NE YAPARDIM?

Tarafsız hüküm: platform kurgusu video taşımak için **doğru yönde** kurulmuş; **yanlış beklenti** «oynatıcı MP4 ders oynatıcısı değil, karaoke + zamanlı kart sahnesidir.» Bunu kabul etmeden Veo veya yeni CMS aramak, 2025 tiyatro felaketinin (UI + TTS + DOM aynı anda) tekraridir.

### 4.1 Oynatıcı mimarisi doğru mu?

**Evet, bu ürün için.** Gerekçeler:

- Tek kabuk, mühürle açılan ikinci katman. 02–05 için yeni route yok.
- Saat medya `currentTime`; tahminî kelime-saati yayın değil.
- Fail-closed generation. Maliyet ve kota vatandaşa sızmaz.
- Compact makale durur (Tam Ders Metni). Ses, makaleyi silmez.

**Eksik olan motor değil, sahne envanteri.** Göz katmanı 8 sn kartı destekler; Ofis’te kart içeriği tek posterdır. «Dinamik slayt» vaadi mimaride, diskte değil.

Tam boy MP4 (45 dk tek dosya) **yanlış hedef** olurdu: cue senkronu, seek, karaoke ve «makale durur» ilkesi bozulur. Kısa baked klip (`kind: "veo"`, 8 sn) ileride kartın yerine geçebilir; anayasa açılmadan bağlanmaz.

### 4.2 En hızlı, en yüksek kaliteli dönüşüm — bake iş akışı

Veo beklemem. `IMAGE_GEN`’i izlemeye bağlamam. 24 dersi «Netflix dersi» yapmam. Ofis’in kanıtladığı hattı, **kart içeriğini ciddiye alarak** kopyalarım.

**Tur 0 — kapı (saatler, kod küçük)**

1. `02_ecommerce_ai`’yi `ACADEMY_MEDIA_SEALED_SKU_SLUGS` + boş `ACADEMY_MEDIA_PRODUCTION_QUEUE["02_ecommerce_ai"]` aday listesine yaz. Karaoke siciline WAV yokken anahtar basma (boş oynatıcı / 410 değil, kırık `<audio>`).
2. Cue loader / spoken-scripts allowlist’i ders eklendikçe genişlet (Ofis `index.ts` kalıbı).

**Tur 1 — konuşma metni (asıl kalite; re-bake’i burası öldürür)**

3. Sıra: `02-1` … `02-6`, sonra 05 (kısa, metin), 04 (ekran kartı şart), 03 (vaat en kaygan).
4. Her ders: makaleden **ayrı** spoken MD. SEN. Dört perde. Skip-preventer uygulanmış. Cue paragrafları = MD paragrafları (bake kilidi).
5. `--dry-run` firesiz olmadan `--seal` yok.

**Tur 2 — ses mühürü (operatör, mevcut CLI)**

6. Tek ders: `--seal --confirm-gemini-spend --no-db --slug=… --key=…`
7. Timings’i commit. WAV’ı `public/media/academy/audio/` altına koy. Sicile al. `/oyna` karaoke’yi kendisi açar.

**Tur 3 — sahne kartları (video hissi burada doğar; Veo değil)**

8. Cue `id` başına **bir** durağan kare: pazaryeri paneli, ürün listesi, Voiceflow tuvali, prompt kutusu. Kaynak: operatör ekran görüntüsü veya (ileride) `IMAGE_GEN` operatör bake. Çıkış: `public/academy/cinema/{lessonKey}-{cueId}.jpg` (veya SVG şema).
9. `officeAiNanoStage` kalıbını «tek poster»den «cue.posterSrc haritası»na çevir. Oyuncu zaten `academyVisualStageActiveCard` ile pencereler.
10. `render-academy-lesson-media.ts` stub’unu ancak bu harita SSOT olduktan sonra dirilt. İzleme API’sine bağlama.

**Tur 4 — micro-video (isteğe bağlı, anayasa sonrası)**

11. `VIDEO_GEN` açılmadan MP4 bake yok. Açılırsa 8 sn `kind: "veo"` kartı mevcut `<video>` yoluna düşer; HLS sicili doldurulur. Önce 02’nin 6 dersi ses+kart ile bitmiş olsun.

**Kalite kuralı:** İlk bake firesiz. E.5 checklist. Re-bake, para ve tempo kaybıdır. Prompt’u cue’ya gömme.

### 4.3 Ne yapmazdım

- Yeni `/izle` videosu, Video.js, Mux, YouTube embed.
- 24 dersi aynı Ofis JPG’siyle «mühürledim» demek.
- 03’ü «görsel/video fabrikası» diye satıp karaoke’siz bırakmak (vitrin zaten yazılı compact der — dürüstlük bozulmasın).
- Prisma’ya `videoAssets` JSON basmak.
- Canlı `listen` 410’unu «kolaylık» diye açmak.

### 4.4 Platform hükmü

yetkin.ai bir LMS video platformu değil; **mühürlü compact akademi + isteğe bağlı sinema katmanı.** Bu kurgu, maliyet kalkanı ve Anayasa B4 ile uyumlu. Dört dersi video eğitime çevirmenin en hızlı yolu oynatıcıyı büyütmek değil, Ofis üretim bandını (spoken → cue → WAV → timings → cue-kart) 02’den başlatmaktır. Görsel derinlik, Tur 3 kart envanteridir. Hareketli video, anayasa ve boş micro-video kümesi yüzünden **bilinçli sonraki faz**dır.

---

## 5. Ölçüt — bu rapor ne zaman eskir?

Aşağıd merler yeşile dönünce bu belge bayatlar; bugün hiçbiri 02–05 için yeşil değildir.

| Ölçüt | Bugün |
|-------|--------|
| `02_ecommerce_ai-1` sicilde + WAV + cue + timings | Hayır |
| Aynı ders `/oyna` `article+karaoke` | Hayır (article) |
| Cue başına tekil sahne kartı (Ofis dahil) | Hayır (tek JPG) |
| `ACADEMY_BAKED_MICRO_VIDEO_KEYS.length > 0` | Hayır (`[]`) |
| `render-academy-lesson-media.ts` bake yapıyor | Hayır (SKIP) |
| `/oyna` network’te generate yok | Evet (01 ve 02–05) |

**İlk neşter (kod bu turda yazılmadı):** `02_ecommerce_ai-1` spoken + cue + skip-preventer + dry-run. Sicil/CLI allowlist. Kart envanteri. Prisma yok. Veo yok.
