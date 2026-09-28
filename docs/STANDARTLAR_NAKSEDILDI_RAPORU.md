# Üretim standardı dokümanlara ve koda nakşedildi

Tarih: 28 Eylül 2026.

Eğitim videosu beş medya katmanı ve üç aşamalı kontrol kapısı olmadan fırınlanamaz ve mühürlenemez.

## 5 medya katmanı (zorunlu sıra)

1. Metin — vatandaş dili, tek iş tek cümle.
2. Ses — Gemini 3.8 Flash TTS (`academyBakeVoiceModelId()`). Konuşma parçası `atempo=0.93`. Seviye EBU R128 `loudnorm`. Kimlik dizesi `lib/kernel/ai/model-roles.ts` içindedir.
3. Video — Veo 3.1 Lite. İlk 6–8 sn ısınma klibi.
4. Görsel — Nano Banana 2. 4K canlı uygulama kartları.
5. Müzik — Lyria 3.5. Vokalsiz fon müziği yatağı, -22 dB ducking (`ACADEMY_BED_BREATH_DB`).

Cue ve karaoke rozeti konuşmayla akar. Beş katmanın yerine geçmez.

## 3 aşamalı kontrol kapısı

1. Taslak metin — senaryo ve chunking.
2. Gözden geçirme — pedagoji, jargon ve aforizma taraması.
3. Son kontrol — beş katman teyit edilmeden `--seal` basılamaz. Video (Veo) ve Müzik (Lyria) bu kapının parçasıdır.

## Nereye işlendi

| Yer | Ne kilitlendi |
|-----|----------------|
| `.system_docs/PEDAGOJI.md` | Zorunlu üretim sırası ve üç kapı. Fırın sesi Gemini 3.8 Flash TTS. |
| `.system_docs/ANAYASA.md` B4 | Beş katman zorunluluğu. Satış istisnası (yatak ve ısınma klibi eksikken mühür) kaldırıldı. |
| `.cursorrules` | Akademi kilit bölümü. Eksik katmanla fırın ve mühür yasağı. |
| `AGENTS.md` | Aynı yasağın ajan kuralı. |
| `lib/academy/production-standard.ts` | `veo_video`, `lyria_music`, `assertAcademyProductionSeal`. |

Kod kapısı: Video (Veo) veya Müzik (Lyria) yoksa `assertAcademyProductionSeal` `--seal` cümlesiyle durur.
