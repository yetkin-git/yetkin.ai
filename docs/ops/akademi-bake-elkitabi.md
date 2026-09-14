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
| Yayın | **2** mühür: `01_office_ai-1`, `01_office_ai-2`. Kalan 28 bake kuyruğunda | `STORAGE_CONTRACT.md` |

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-1
```

`--seal --confirm-gemini-spend` insan onayından sonra. Vatandaş yüzeyine taslak WAV basılmaz.

## Zaman SSOT boru hattı (Muse Spark P0-2 mührü)

Zaman damgaları **el yazılmaz**. Tek kaynak `docs/curriculum/01_office_ai_01_cue.json` +
`lib/academy/lesson-audio-timings/01_office_ai-1.json` ikilisidir. Test beklentisi, dron
punchcard dizisi ve süre tablosu bu kasetten kopyalanır.

- `01_office_ai-1` mühürlü süre: **557.2 sn** (`ACADEMY_SEALED_AUDIO_DURATION_SEC = 557`,
  `cacheV: 557200`). Konuşma sonrası Lyria outro kuyruğu **+2.5 sn** (oynatıcı saati; WAV’a sessizlik basılmaz).
- `cue-06 FARK ORTADA`: **376.28–446.6** (eski hatalı damga `319.92` / `346.36` / `358.92` kullanılmaz).
- `cue-07 CEBİNE KOY`: **447–486.2** (eski hatalı damga `393.32` / `417.20` / `430.12` kullanılmaz).
- Veo punch: **2–10 sn** (`ACADEMY_VEO_SCENE_DURATION_SEC = 8`, intro `0–2 sn` sonrası);
  `0–8 sn` yazımı yasaktır.
- Dron `DRON_OFFICE_AI_1_PUNCHCARDS` sonu `557.2` ile bitmelidir; web timings ile
  birebir aynı 8 aralık taşınır.
