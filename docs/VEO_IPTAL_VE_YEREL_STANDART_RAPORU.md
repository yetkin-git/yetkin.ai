# Veo iptal ve yerel kaset standardı

Tarih: 28 Eylül 2026  
Karar: Otomatik Veo 3.1 API video üretimi iptal. Isınma kaseti yerel reuse.

## Video

`scripts/generate-academy-lesson-veo.ts` Google çağrısı açmaz. `--seal`, `--confirm-gemini-spend` ve `--force` video üretmez. Betik yalnız `public/media/academy/micro/*-warmup.mp4` dosyasını arar.

Oynatıcı ısınma kartında aynı yolu okur: `academyWarmupCassettePublicPath`. Ofis istemi `ACADEMY_WARMUP_OFFICE_PROMPT` Gemini arayüzüne elle yazılır; koda API gövdesi olarak girmez.

Yerel kasetler:

| Dosya | Bayt |
| --- | ---: |
| `public/media/academy/micro/01_office_ai-1-warmup.mp4` | 5 016 900 |
| `public/media/academy/micro/01_office_ai_ileri-warmup.mp4` | 2 523 141 |

Kural `.system_docs/ANAYASA.md` B4 ve `.system_docs/PEDAGOJI.md` §E.4 içindedir.

## OFF-201 fon müziği — hard-mix teyidi

Altı dersin yayın MP3’ü `scripts/hard-mix-academy-bed.ts` ile konuşma ve Lyria yatağının tek dosyada birleşmiş hâlidir. Kazanç `ACADEMY_BED_HARD_MIX_DB` (−18 dB), sidechain, ardından EBU R128. Yayın baytları son mühür raporuyla birebir durur. Yatak dosyası ayrı durur; oynatıcı `academyLessonBedIsHardMixed` doğruysa ikinci ses etiketini açmaz.

| Ders | Yayın MP3 | Yatak |
| --- | ---: | ---: |
| `01_office_ai_ileri-1` | 19 408 365 | 2 127 634 |
| `01_office_ai_ileri-2` | 24 227 565 | 2 120 111 |
| `01_office_ai_ileri-3` | 26 335 725 | 2 118 857 |
| `01_office_ai_ileri-4` | 30 077 805 | 2 157 727 |
| `01_office_ai_ileri-5` | 33 748 845 | 2 359 602 |
| `01_office_ai_ileri-6` | 28 577 325 | 2 131 396 |

Bu turda yeni Veo veya Lyria çağrısı açılmadı.
