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
| Yayın | Mühür listesi kod + `docs/DURUM.md`. Amiral: **9/9** mühürlü kaset; bake kuyruğu boş | `lib/academy/pilot-sku.ts` |

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-1
```

`--seal --confirm-gemini-spend` insan onayından sonra. Vatandaş yüzeyine taslak WAV basılmaz.

## Zaman SSOT boru hattı (Muse Spark P0-2 mührü)

Zaman damgaları **el yazılmaz**. Canlı SSOT `lib/academy/lesson-cues/` +
`lib/academy/lesson-audio-timings/` ikilisidir. Bake script’i `docs/curriculum/` altına kopya basabilir (git dışı bake kopyası); izleme o kopyayı okumaz. Dron punchcard saatleri
timings JSON’dan türetilir (`lib/academy/punchcard-from-sealed-json.ts`); elle kopya SSOT değildir.

- `01_office_ai-1` mühürlü süre: **571.72 sn** (`ACADEMY_SEALED_AUDIO_DURATION_SEC = 572`,
  `cacheV: 571720`). Konuşma sonrası Lyria outro kuyruğu **+2.5 sn** (oynatıcı saati; WAV’a sessizlik basılmaz).
- `cue-06 FARK ORTADA`: **386.04–457.04** (eski hatalı damga `319.92` / `346.36` / `358.92` / `378.96` / `387.92–458.68` kullanılmaz).
- `cue-07 CEBİNE KOY`: **457.44–497.08** (eski hatalı damga `393.32` / `417.20` / `430.12` / `449.64` / `459.08–498.80` kullanılmaz).
- Veo punch: **2–10 sn** (`ACADEMY_VEO_SCENE_DURATION_SEC = 8`, intro `0–2 sn` sonrası);
  `0–8 sn` yazımı yasaktır.
- Dron punchcard sonu timings `durationSec` ile biter; web timings ile aynı 8 aralık türetilir.
- `01_office_ai-3` mühürlü süre: **527 sn** (`ACADEMY_SEALED_AUDIO_DURATION_SEC = 527`,
  `cacheV: 527000`). Intro 2.0 sn; Gelecek Ders Köprüsü sonrası Lyria 0.70 zirve,
  3 sn jenerik + 1.5 sn fade-out. B-roll `01_office_ai-1-warmup` reuse; pahalı Veo 3.1 yok.
- Dron 3. ders punchcard sonu `527`; timings JSON’dan türetilir.
- `01_office_ai-4` mühürlü süre: **496.12 sn** (`ACADEMY_SEALED_AUDIO_DURATION_SEC = 496`,
  `cacheV: 496120`). Intro 2.0 sn; Gelecek Ders Köprüsü sonrası Lyria 0.70 zirve,
  3 sn jenerik + 1.5 sn fade-out. B-roll `01_office_ai-1-warmup` reuse; pahalı Veo 3.1 yok.
- Dron 4. ders punchcard sonu `496.12`; timings JSON’dan türetilir.
- `01_office_ai-5` mühürlü süre: **420.713 sn** (`ACADEMY_SEALED_AUDIO_DURATION_SEC = 421`,
  `cacheV: 420713`). Intro 2.0 sn. Sıfır kurulum: tam TTS yeniden fırın (`gemini-3.1-flash-tts-preview`);
  14 nefes dilimi timings SSOT. Sol dip toplam **59.450** (ekran + karaoke + TTS). B-roll `01_office_ai-1-warmup` reuse; pahalı Veo 3.1 yok.
- Dron 5. ders punchcard sonu `420.713`; timings JSON’dan türetilir.
- `01_office_ai-6` mühürlü süre: **440.393 sn** (`ACADEMY_SEALED_AUDIO_DURATION_SEC = 440`,
  `cacheV: 440393`). Intro 2.0 sn; 10+10+10 Cuma rutini; kapanış dersi; sınav kapısı bu dersten sonra açılır.
  B-roll `01_office_ai-1-warmup` reuse; pahalı Veo 3.1 yok. Ana TTS günlük kotada yedek `gemini-2.5-flash-preview-tts`.
- Dron 6. ders punchcard sonu `440.393`; timings JSON’dan türetilir.
- `01_office_ai-g1` mühürlü süre: **529.04 sn** (`ACADEMY_SEALED_AUDIO_DURATION_SEC = 529`,
  `cacheV: 529040`). Intro 2.0 sn. Çift hat: Gmail Gemini + Outlook Copilot; aksiyon listesi.
- Dron G1 punchcard sonu `529.04`; timings JSON’dan türetilir.
- `01_office_ai-w1` mühürlü süre: **521.44 sn** (`ACADEMY_SEALED_AUDIO_DURATION_SEC = 521`,
  `cacheV: 521440`). Intro 2.0 sn. Sözleşme, dilekçe, rapor; ataş asıl kapı. Sınav 9. ders bitince açılır.
- `01_office_ai-k1` mühürlü süre: **677.56 sn** (`ACADEMY_SEALED_AUDIO_DURATION_SEC = 678`,
  `cacheV: 677560`). Intro 2.0 sn. 2. ders; vatandaş dili (sebep → eylem → sonuç). Yükleme alışkanlığından önce. Üç Kapı yalnız aktarımdır (yerleşik panel → ataş → maskeli kısa). Güvenlik sınıfı ayrıdır.
  B-roll `01_office_ai-1-warmup` reuse; pahalı Veo 3.1 yok.

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
| Pahalı Veo 3.1 | `veo-3.1-generate-preview` — **yasak** (PEDAGOJI §E.4) |

Warm-up B-roll **8 sn** (`ACADEMY_VEO_SCENE_DURATION_SEC`); punch **2–10 sn** (intro 0–2 sn sonrası). `0–8 sn` yazımı yasaktır.

Senaryo varsayılanı kodda `FAST_STREAM` (`gemini-3.6-flash`). TTS `VOICE_TTS` (`gemini-3.1-flash-tts-preview`). Görsel `IMAGE_GEN` (`imagen-4.0-generate-001`). Dip müzik bake script’i Lyria 3.5 kimliğini taşır. Pedagoji bu sürüm adlarını dondurmaz.

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

