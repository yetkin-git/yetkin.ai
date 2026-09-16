# TEDAVİ RAPORU — `01_office_ai` Faz 2

Tarih: 2026-09-16  
Kaynak karar: `docs/TEDAVI_RAPORU_01_OFFICE_AI.md` (CEO / SUPER ADMIN onaylı Faz 1 metin kilidi)  
İlkeler: **Maliyet Güvenliği** (yalnız W1 + L6 re-bake + k1 tek bake) · **Sıfır Risk** (ders anahtarı durur; sınav kapısı hâlâ 9 ders)

Bu fazda kaset basıldı. P0 mühürlü yalan sesten silindi. KVKK (`k1`) 2. slotta mühürlendi. Kardeş SKU, Veo ve P2 re-bake yok.

---

## Kilit omurga (değişmedi)

Sıra Faz 1 kilididir. Anahtarlar durur.

| Sıra | Anahtar | Başlık | Durum | Ses (sn) |
|------|---------|--------|-------|----------|
| 1 | `01_office_ai-1` | Tablonu Konuştur | sealed | 571.84 |
| 2 | `01_office_ai-k1` | KVKK, Şirket Sırları ve Maskeleme | **sealed** | **309.713** |
| 3 | `01_office_ai-2` | Rapor Otomasyonu | sealed | 500.12 |
| 4 | `01_office_ai-3` | Sunum Fabrikası | sealed | 533.76 |
| 5 | `01_office_ai-5` | İstisnalar & Hata Avı | sealed | 481.96 |
| 6 | `01_office_ai-4` | E-Posta Akışı (ritüel) | sealed | 544.52 |
| 7 | `01_office_ai-g1` | Gmail + Gemini (asıl kapı) | sealed | 523.6 |
| 8 | `01_office_ai-w1` | Word ve Uzun Doküman Analizi | sealed | **521.44** |
| 9 | `01_office_ai-6` | Haftalık Sistem (capstone) | sealed | **412.04** |

Sınav: `isAcademyCurriculumCompleteFromIndex` — 9 anahtar. Kapı yalnız capstone (`01_office_ai-6`) bittikten sonra açılır.

`estimatedTotalMinutes`: **73.32** (9 mühürlü kaset toplamı / 60). Önceki 77.09, k1 tahmini + eski W1/L6 süreleriydi.

---

## ADIM 1 — P0 sesli kaset re-bake

### 1.1 `01_office_ai-w1` (Word, 8. ders)

Eski mühürlü ses: «Sekiz ders bitti. Sınav köprüsü açılır. […] Sınav kapısı şimdi açılır.»

Yeni mühürlü ses (timings son dilim):

> Bu 8. derstir. Sınav henüz kapalıdır. Kapanış dersi Haftalık Sistem’dir; o 9. ders bitince sınav kapısı açılır.

| Alan | Değer |
|------|--------|
| Model | `gemini-3.1-flash-tts-preview` (Callirrhoe) |
| Süre | **521.44 sn** (eski 528.16) · `cacheV: 521440` |
| MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-w1.mp3` (12.5 MB) |
| WAV | `media-bake/academy/audio/01_office_ai/01_office_ai-w1.wav` |
| Timings | 14 nefes dilimi · `lib/academy/lesson-audio-timings/01_office_ai-w1.json` |
| Cue saat | bake overlay · `docs/curriculum/01_office_ai_w1_cue.json` |

«Sekiz ders bitti» timings JSON’da yok.

### 1.2 `01_office_ai-6` (Capstone, 9. ders)

Eski mühürlü ses: «altıncı ders», «Sınav Köprüsü bu dersin sonunda açılmaz», «Gmail, Word ve KVKK dersleri bitince», «Şimdi 7. derste görüşmek üzere».

Yeni mühürlü ses (timings son dilim):

> Kendi Cuma bloğunu kilitlediğinde müfredat kapanır. Sınav kapısı bu dersten sonra açılır. […] Hazırsan sınavda görüşmek üzere!

Bake öncesi SSOT onarımı: cue JSON `cue-01` hâlâ «Beşinci derste» diyordu; konuşma metni «Word dersinde» idi. Cue, Faz 1 konuşma SSOT’una çekildi; sonra `--seal`.

| Alan | Değer |
|------|--------|
| Model | `gemini-3.1-flash-tts-preview` (Callirrhoe) |
| Süre | **412.04 sn** (eski 432.28) · `cacheV: 412040` |
| Band | 6.87 dk — pedagoji 7–12 dk altının 8 sn altında. Metin kısaldı (capstone veda); yeni TTS harcaması yok. |
| MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-6.mp3` (9.9 MB) |
| Timings | 14 nefes dilimi |

«7. derste görüşmek» / «sonraki dersleri bekle» timings JSON’da yok.

---

## ADIM 2 — `01_office_ai-k1` mühür

2. ders konumunda **ilk ve tek** bake. Eski 9. slot hikâyesi basılmadı.

Timings son dilim:

> Bu 2. dersin alışkanlığı artık cebinde. Sınav henüz kapalıdır. Sıradaki kapı rapordur. […] kapı kapanış dersinden sonra açılır.

| Alan | Değer |
|------|--------|
| Model | Ana `gemini-3.1-flash-tts-preview` 10. dilimde **429 günlük kota**. Script yedek `gemini-2.5-flash-preview-tts` ile dersi baştan bastı. Vatandaş kaseti **tek model** (yedek); karışık ses yok. |
| Süre | **309.713 sn** (~5.16 dk) · `cacheV: 309713` |
| Band | 7 dk altı. Metin 14 paragraf / kısa KVKK kaseti + yedek model temposu. Kota doluyken ana modelle yeniden basılmadı. |
| MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-k1.mp3` (7.4 MB) |
| Timings | `lib/academy/lesson-audio-timings/01_office_ai-k1.json` (yeni import) |
| Cue | `lib/academy/lesson-cues/01_office_ai-k1.json` + `docs/curriculum/01_office_ai_k1_cue.json` |
| Karaoke | `article+karaoke` |
| Dron | 8 punchcard, etiket **Sesli anlatım** |
| Bed | 1. ders Lyria reuse; yeni Lyria yok |
| Kuyruk | `ACADEMY_MEDIA_PRODUCTION_QUEUE` boş |

Sicil: `ACADEMY_MEDIA_SEALED_AUDIO` 9 anahtar. `planned.ts` `baking` → `sealed`.

---

## ADIM 3 — Ses-yazı uyum ve tarama

### 3.1 Bake edilen üç kaset (%100)

Bake kapısı `assertSpokenScriptMatchesCues` ile konuşma metni = cue paragraf. Timings metni skip-preventer / fonetik (Vörd, Cemini, KVKK açılımı) taşır; anlam SSOT’u aynıdır. MP3, timings `durationSec` ve cue `end` 1:1.

| Ders | Spoken ≠ eski yalan | Cue | Timings / MP3 |
|------|---------------------|-----|----------------|
| W1 | «9. ders bitince sınav kapısı açılır» | evet | evet |
| L6 | «kapanış dersi / sınavda görüşmek üzere» | evet | evet |
| K1 | «2. ders / sınav henüz kapalı / sıradaki kapı rapor» | evet | evet |

Web: `academyCitizenPlayerLayer` 9/9 `article+karaoke`.  
Dron: `dronAcademyPunchcardsForLesson` 9/9 timings türevi.

### 3.2 Hayali sınav kapısı (P0) — kapalı

W1 mühürlü ses artık sınavı **açmaz**. L6 mühürlü ses sonraki Gmail/Word/KVKK’yı **beklemez**; capstone’dur.

### 3.3 P2 artık (TTS yok — maliyet kilidi)

Faz 1 «Bekle» listesi durur. Yazı ve mühürlü ses hâlâ eski omurgayı taşır; **yeniden basılmadı**. Karaoke’yi sesten koparmamak için metin de bu fazda oynatılmadı.

| Ders | Kalan cümle | Risk |
|------|-------------|------|
| `01_office_ai-5` | «Önümüzdeki 6. bölüm … Haftalık Sistem» + «büyük Sınav Köprüsü» | Yanlış sonraki ders (sırada e-posta ritüeli var). Sınavı şimdi açmaz. |
| `01_office_ai-g1` | «Sınav Köprüsü henüz kapalı durur. Sekiz ders bitmeden sınava girilmez.» | Sınavı şimdi açmaz. «Sekiz» sayısı ve eski başlık adı sapar. |

`L1`–`L4` köprü «N. ders» dilini taşıyabilir (P2). Vatandaş vitrin / W1 / L6 / K1 P0 yalanı taşımaz.

El kitabı W1 ««Sekiz ders bitti, sınava gir.» Yalan.» — karşı örnek; kaset değil.

---

## Maliyet defteri

| İş | API | Not |
|----|-----|-----|
| Dry-run ×3 | yok | W1/L6/K1 kapı |
| W1 `--force --seal` | 14 istek | ana TTS |
| L6 `--force --seal` | 14 istek | ana TTS |
| K1 `--seal` | ~10 ana + 14 yedek | 429 sonrası tam yeniden |
| L1–L5, G1 | **yok** | P2 |
| Veo / Lyria | **yok** | bed reuse |
| `--no-db` | DB satırı yok | yayın SSOT disk MP3 + timings |

---

## Dokunan sicil (ses dışı)

`pilot-sku.ts`, `lesson-audio.ts`, `lesson-audio-timings/index.ts`, `planned.ts`, `office_ai/index.ts` (73.32 dk), Dron `academy-punchcards.ts`, `lib/copy/sen-voice/academy.ts` (9 kaset), `docs/DURUM.md`, bake el kitabı, `.system_docs` (README, OPS_RUNBOOK, STORAGE_CONTRACT, ops-db).

Test: sealed-audio-pilot, media-release-seal, citizen-player-layer, office-ai lesson 1–6 / g1 / w1 / k1, dron-punchcards, curriculum-syllabus, production-standard, faz1-operating-picture, pulse-continue, continue-board, catalogue, enrolment, citizen-surface.

---

## SUPER ADMIN özeti

Faz 2 uygulandı. Amiral **9/9 mühürlü kaset + 9 karaoke**. W1 «sekiz ders bitti / sınav şimdi açılır» mühürlü sesten silindi. L6 capstone: «7. derste görüşmek» yok; sınav bu dersten sonra açılır. K1 2. slotta mühürlü; sınavı açmaz.

Uyarı (maliyet, yeniden basılmadı): k1 yedek TTS ile **5.2 dk** (7 dk bandının altında). L6 **6.87 dk**. G1 ve L5 kasetleri hâlâ «Sınav Köprüsü / sekiz ders / 6. bölüm Haftalık Sistem» der — P2 kuyruk.

Onay bekleyen Faz 3 (isteğe bağlı): kota açılınca k1 ana model re-bake (süre bandı); G1 + L5 köprü cümleleri (P2). Yeni SKU ve Veo yok.
