# Tam stüdyo yayın kapısı

Tarih: 28 Eylül 2026.

## Kapı

`assertAcademyProductionSeal` beş katman `true` iken geçiyor. Video veya müzik eksikse fırlatıyor. Bu turda şu dosyalar yeşil:

- `tests/academy/production-standard.test.ts`
- `tests/academy/off201-beat-visual.test.ts`
- `tests/academy/curriculum-player.test.ts`
- `tests/academy/lesson-audio-grant.test.ts`

20 test, 20 geçti.

## OFF-101 — Gözde (Callirrhoe)

Dry-run (`--slug=01_office_ai`) API açmadan bitti. 8 ders, 126 paragraf, 80 istek. Bant 10–12. Maç tavanı 100. Model `gemini-3.8-flash-tts`. Ses Callirrhoe.

`--seal --confirm-gemini-spend --force --no-db --no-fallback` çağrıldı. Fırın, `01_office_ai-1.mp3` mühürlü kaseti koruduğu için durdu. Gemini çağrısı yok. Yayın MP3’leri yerinde.

| Katman | Durum |
|--------|--------|
| Metin | `lib/academy/spoken-scripts/01_office_ai-1.md` … sınav yolu (`k1`, `2`, `3`, `5`, `g1`, `w1`, `6`) |
| Ses | 8 yayın MP3. Yeniden TTS yok |
| Video | Yerel `01_office_ai-1-warmup.mp4` |
| Görsel | Cue JSON sınav yolunda |
| Müzik | Ders 1 ayrı `01_office_ai-1.bed.mp3`. Diğer derslerin kendi Lyria yatağı yok; konuşma dosyasına gömülü değil |

`01_office_ai-4` sınav yolunda değil. Bu turda o kaset açılmadı.

## OFF-201 — Aylin (Kore)

| Katman | Durum |
|--------|--------|
| Metin | `01_office_ai_ileri-1.md` … `-6.md` |
| Ses | 6 yayın MP3. Bu turda TTS yok |
| Video | `public/media/academy/micro/01_office_ai_ileri-warmup.mp4`, süre 8,00 sn, `?v=8000`, ders 1–6 `cue-01` |
| Görsel | Canlı kartlar cue JSON içinde |
| Müzik | 6 `*.bed.mp3`. Konuşma MP3’ü hard-mix: ders 2 dosyası 10:09, konuşma saati 605,6 sn, giriş payı 4 sn |

## Ders 2–6 kilidi

Ticari kayıt ve doğrulanmış Super Admin için OFF-201 ders 1–6 `open: true`. Ses izni imzası ders 2–6 yollarını da geçiriyor. Kaydı olmayan oturumda sıra kilidi duruyor.
