# Akademi bake el kitabı

Pedagoji ilkeleri `.system_docs/PEDAGOJI.md` içindedir. Bu dosya operatör SOP’udur.

İnsan `--seal` olmadan harici TTS yok. İzlemede canlı TTS yoktur. Pahalı Veo 3.1 her ders fırınında yasaktır (PEDAGOJI §E.4); B-roll varsayılanı Veo 3.1 Lite veya `/public/media/academy/micro/` yerel MP4 reuse, yedek Nano Banana 2 + CSS Ken Burns. Senaryo / cue / visual zoom oturmadan `--seal` yok; deneme `--dry-run` (PEDAGOJI §E.5).

| Ölçüt | Değer | Kod |
|-------|--------|-----|
| Nefes bloğu | 12–15 doğal blok; ders başı istek 10–12 | `lib/academy/tts-breath-chunks.ts` |
| RPM kalkanı | istekler arası 6500 ms | `ACADEMY_TTS_RPM_GAP_MS` |
| Skip preventer | kısa emir bağlaçlı akışa çevrilir | `expandAcademyTtsSkipPreventer` |
| 3–5 sn mikro dilim | yasak | breath-chunks SSOT |
| Kapı | `--dry-run` keşif; `--seal` + `--confirm-gemini-spend` | `scripts/generate-academy-lesson-audio.ts` |
| B-roll | Veo 3.1 Lite veya yerel MP4 reuse; pahalı Veo 3.1 yasak | `lib/academy/lesson-veo.ts` |
| Yayın | Mühür listesi kod + `docs/ops/DURUM.md`. OFF-101: **8/8** mühürlü kaset (`lesson-index.ts`). `01_office_ai-4` arşivdir, süre tablosuna girmez. OFF-201 **6/6** mühürlü; fırın kuyruğu boş | `lib/academy/pilot-sku.ts` |

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-1
```

`--seal --confirm-gemini-spend` insan onayından sonra. Vatandaş yüzeyine taslak WAV basılmaz.

## Zaman SSOT boru hattı (Muse Spark P0-2 mührü)

Zaman damgaları **el yazılmaz**. Konuşma kaynağı `lib/academy/spoken-scripts/` dosyasıdır. Saat kilidi `lib/academy/lesson-cues/` + `lib/academy/lesson-audio-timings/` ikilisidir. Bake script’i `docs/curriculum/` altına türetilmiş kopya basabilir (git dışı; `docs/CURRICULUM_KOPYA.md`). İzleme o kopyayı okumaz. Dron punchcard saatleri timings JSON’dan türetilir (`lib/academy/punchcard-from-sealed-json.ts`); elle kopya SSOT değildir. `01_office_ai-4` saati `archived/academy/01_office_ai-4/` altındadır; bu tabloya girmez.

Bu tablo timings `durationSec` ile birebir durur. Re-bake sonrası sayıyı buraya ve `ACADEMY_SEALED_AUDIO_DURATION_SEC` yedek tablosuna birlikte çek. Her re-bake sonrası `isAcademyAiLessonDurationSec` yalnız tabanı doğrular (en az 300 sn). Üst dakika tavanı yoktur; 12, 15, 18 dk serbesttir.

İnsani ritim (`lib/academy/human-rhythm.ts`, `ACADEMY_INSTRUCTOR_SPEECH_RATE`):

| Ölçüt | Değer |
|-------|--------|
| Konuşma hızı | 0.93 — doğal temponun %7 yavaşı; her dilime perde koruyan SOLA |
| Cümle ve paragraf nefesi | 0.4 sn |
| Teknik kural ve örnek geçişi | 1.75 sn (1.5–2.0 bandının ortası) |
| Slayt değişimi | Görsel, yeni cümleden 1.5 sn önce açılır |

| Ders anahtarı | timings `durationSec` | `ACADEMY_SEALED_AUDIO_DURATION_SEC` | `cacheV` |
|---------------|----------------------|-------------------------------------|----------|
| `01_office_ai-1` | **688.68 sn** | 689 | 688680 |
| `01_office_ai-k1` | **702 sn** | 702 | 702000 |
| `01_office_ai-2` | **517.24 sn** | 517 | 517240 |
| `01_office_ai-3` | **541.92 sn** | 542 | 541920 |
| `01_office_ai-5` | **553 sn** | 553 | 553000 |
| `01_office_ai-g1` | **568.16 sn** | 568 | 568160 |
| `01_office_ai-w1` | **563.36 sn** | 563 | 563360 |
| `01_office_ai-6` | **505.6 sn** | 506 | 505600 |

- `01_office_ai-1` konuşma sonrası Lyria outro kuyruğu **+2.5 sn** (oynatıcı saati; WAV’a sessizlik basılmaz).
- `cue-06 FARK ORTADA`: **500.08–565.96** (eski hatalı damga `476.24–545` / `467.48–535.4` / `457.12–529` / `386.04–457.04` / `319.92` / `346.36` / `358.92` / `378.96` / `387.92–458.68` kullanılmaz).
- `cue-07 CEBİNE KOY`: **566.36–615** (eski hatalı damga `545.4–593.48` / `535.8–584.08` / `529.4–575.16` / `457.44–497.08` / `393.32` / `417.20` / `430.12` / `449.64` / `459.08–498.80` kullanılmaz).
- Veo punch: **2–10 sn** (`ACADEMY_VEO_SCENE_DURATION_SEC = 8`, intro `0–2 sn` sonrası);
  `0–8 sn` yazımı yasaktır.
- Dron punchcard sonu timings `durationSec` ile biter; web timings ile aynı 8 aralık türetilir.
- Intro 2.0 sn; Gelecek Ders Köprüsü sonrası Lyria 0.70 zirve, 3 sn jenerik + 1.5 sn fade-out. B-roll `01_office_ai-1-warmup` reuse; pahalı Veo 3.1 yok.
- `01_office_ai-5` sol dip toplam **59.450** (ekran + karaoke + TTS).
- `01_office_ai-6` 10+10+10 Cuma rutini; kapanış dersi; sınav kapısı bu dersten sonra açılır.
- `01_office_ai-w1` sözleşme, dilekçe, rapor. Yüklemeden önce: şirket onaylı araç mı, tutar / taraf / IBAN maskeli mi? Sınav son ders (`01_office_ai-6`, vatandaş 8. ders) bitince açılır.
- `01_office_ai-k1` 2. ders. Sıra: 1) şirket politikası → 2) veri sınıfı → 3) aktarım yolu. Maskeleme ile örnek satır ayrı tekniktir.
- Eğilim kartı tazeliği: tarih damgalı model-eğilim cümleleri (Ders 1 makalesi) **6 ayda bir gözden geçirilir**; değişen eğilim makaleye işlenir, mühürlü kaset yalnız gerekirse hedefli re-bake görür.

## Vatandaş yüzeyini tarayan testler (Pedagoji §E.2)

Yasak yüzeyleri (ses fonetiği, cue, konuşma metni, makale, görsel stage) şu testler tarar. Pedagoji dosya yolu listesi taşımaz; yaşayan liste buradadır.

| Yüzey | Test |
|-------|------|
| Ses fonetiği + cue + konuşma metni + makale | `tests/academy/sealed-audio-pilot.test.ts` |
| Ders konuşma metinleri | `tests/academy/office-ai-lesson-k1.test.ts`, `tests/academy/office-ai-lesson-w1.test.ts` |
| Görsel stage düğümleri + dosya etiketi (titlebar / punchcard) | `tests/academy/office-ai-lesson-w1.test.ts`, `tests/academy/word-workspace.test.ts`, `tests/academy/prompt-console.test.ts` |
| Ders gövdesi yasaklı jargon (`score`, `prompt terminali`, `özel API`) + baraj sabiti | `tests/academy/exam-sentence-standard.test.ts` |

## Timings → Dron punchcard sürüm sözleşmesi

Timings JSON değişince (re-bake / `--seal`) Dron punchcard saatleri aynı kaynaktan türetilir:
`lib/academy/punchcard-from-sealed-json.ts` → `apps/rail-is/src/ui/academy-punchcards.ts`. Elle kopya SSOT değildir.

Kural: timings `durationSec` / `cacheV` değişince üçü birlikte yükselir.

1. `tests/academy/dron-punchcards-from-timings.test.ts` kilitleri yeni `durationSec` değerine çekilir.
2. Dron istemcisi yeniden derlenir ve yayınlanır; eski native bundle eski punchcard saatini taşır.
3. Web `cacheV` tarayıcı immutable cache’ini kırar; Dron’da karşılığı yeni native sürümüdür.

Timings değişip Dron sürümü yerinde kalırsa punchcard saati web kasetiyle ayrışır. Hedefli re-bake (`01_office_ai-5` / `01_office_ai-w1` / `01_office_ai-6`) bu sözleşmenin ilk gerçek sınavıdır.

## Stüdyo reji (Pedagoji’den aktarılan yaşayan SOP)

Bu sayılar Anayasa/Pedagoji dogması değildir. Kod SSOT: `lib/academy/lesson-bed-duck.ts`,
`lib/academy/lesson-intro.ts`, `lib/academy/lesson-veo.ts`, `lib/kernel/ai/model-roles.ts`.

### Ducking gain ve jenerik

| Pencere | Gain / süre |
|---------|-------------|
| 0–2.0 sn giriş jeneriği | Lyria **0.46**; konuşma yok |
| Konuşma (Gözde 2.0 sn’de başlar) | Müzik **0.12** |
| Nefes payı ve CEBİNE KOY | **0.46** |
| Konuşma bittiği an outro zirve | Lyria **0.70** |
| Logo + 1-2-3 özet | **3 sn** coşkulu jenerik |
| Fade-out | **1.5 sn** |

### B-roll ve model kimliği (kod SSOT’a bak)

| Kaynak | Ne zaman |
|--------|----------|
| Yerel MP4 reuse | `/public/media/academy/micro/` altında kaset varsa varsayılan |
| Veo 3.1 Lite | `veo-3.1-lite-generate-preview` — yeni kaset gerektiğinde |
| Imagen + CSS Ken Burns | Lite yoksa; anahtar `academy-eye-kenburns` |
| Pahalı Veo 3.1 | `veo-3.1-generate-preview` — **yasak** (bu el kitabı, B-roll) |

Warm-up B-roll **8 sn** (`ACADEMY_VEO_SCENE_DURATION_SEC`); punch **2–10 sn** (intro 0–2 sn sonrası). `0–8 sn` yazımı yasaktır.

Senaryo varsayılanı kodda `FAST_STREAM` (`gemini-3.6-flash`). TTS `VOICE_TTS` (`gemini-3.1-flash-tts-preview`). Görsel `IMAGE_GEN` (`imagen-4.0-generate-001`). Dip müzik bake script’i Lyria 3.5 kimliğini taşır. Fırın rol tablosu, ducking gain ve altın şablon `.system_docs/PEDAGOJI.md` §B ve §E içindedir. Canlı uç kimliği `lib/kernel/ai/model-roles.ts` içindedir.

### Altın Şablon görsel tablo (`01_office_ai-1`)

| Beat | Ekran |
|------|-------|
| Giriş jeneriği | 0–2 sn logo + `01_OFFICE_AI`; yalnız Lyria 0.46 |
| Warm-up | 8 sn Veo Lite / yerel MP4 / Ken Burns, sonra canlı Excel |
| Command | %80 tek ekran canlı uygulama; spoiler yok; dinamik zoom `transform: scale(1.2)`; sanal fare click-ripple; `activeCell A1 → B1 → C1` |
| Comparison | Dikey split: sol ÖNCE (DÜZENLEMESİZ), sağ SONRA (AI İLE) |
| Task | Düzenli nihai tablo |
| Bitiş jeneriği | 3 sn logo + özet, 1.5 sn fade-out; Lyria 0.70 |

`--seal` kapısı, skip preventer ve RPM (6500 ms) bu el kitabının üst tablosundadır.

## El kitabında kalan üretim ayrıntısı

Fırın rolleri, ducking gain (0.46 / 0.12 / 0.70) ve altın şablon görsel reji 23 Eylül 2026 CEO emriyle `.system_docs/PEDAGOJI.md` içine geri yazıldı. Aşağıdaki satırlar bu el kitabında durur:

| Ayrıntı | Değer |
|---------|--------|
| Ofis amiral sesi | Gözde — TTS adı **Callirrhoe** |
| Erkek TTS yuvası | **Fenrir** (köprü dersinde pilot) |
| Descender Harf Koruması | `g, y, ş, p` altyazı şeridinde kesilmez |
| 16:9 Tuval ve Contain Sözleşmesi | PowerPoint, Outlook, Excel, Word, Gmail dikeyde ezilmez |
| Ken Burns | Lite B-roll yoksa durağan plaka + CSS |
| Bütçe | Pahalı video API her ders fırınında yapılmaz. Varsayılan yerel MP4 veya Lite B-roll |
| Nasıl yapılır bandı | «Adım 1: İletileri Seç», «Adım 2: Etiketle», «Adım 3: Taslak İste». Harf harf yazma dayatması yoktur |
| Sıfır Ekstra API Maliyeti | Mantık şeması `components/academy/` altında senkron React/SVG |
| Araç eşleşmesi | Outlook → Copilot, Gmail → Gemini, Excel → lisans varsa Copilot şeridi yoksa ataş, Word → doğrudan dosya yükleme, PowerPoint → Copilot. Kod: `ACADEMY_INFRA_TOOL_MATCH` |
| E-posta dersi | `01_office_ai-g1` — Gmail + Gemini ve Outlook Copilot. Onaylı araç yoksa maskeli kısa özet. İş postası kişisel Gmail’e taşınmaz |
| Word dersi | `01_office_ai-w1`. Yöntem `doc-upload-gemini` yalnız şirket onaylı araç ve maske denetiminden sonra |
| Sohbet modelleri | ChatGPT, Claude, Gemini, Grok, Kimi, Muse Spark. Onaylı değillerse iş verisi gitmez |
| Nereye yazılacak | Gerçek panel veya ataş. Soyut AI masası yok. Ok: «Nereye Yükleyeceksin?» |

Pahalı B-roll yasağı Pedagoji §E.4 ve yukarıdaki tablodadır. Piksel SOP, araç yüzeyi ve eski §F doygunluk sayıları bu el kitabında durur. Fırın sırası: senaryo → mühürlü ses → cue → görsel → ducking müzik → montaj.

