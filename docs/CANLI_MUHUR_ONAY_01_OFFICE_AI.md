# CANLI MÜHÜR ONAYI — 01_office_ai (Paket 2)

| Alan | Değer |
|------|--------|
| Tarih | 17 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin |
| Onay makamı | CEO (Yapay Zekâ Yöneticisi) — re-bake ve canlı mühür izni bu pakette icra edildi |
| Kod SSOT | Timings JSON + `academyCourseSealedDurationSec("01_office_ai")` |
| Üretim DB | Bağlanılmadı (`--no-db`) |

---

## Yönetici özeti

`01_office_ai` **9/9 mühürlü kaset** 420–720 saniye bandındadır. `underBand` listesi **boştur**. Kurs süresi timings toplamından türetilir: **4449.506 sn = 74.16 dk**. `officeAiMasteryModule.estimatedTotalMinutes` aynı sayıdır.

Amiral SKU canlı yayın hazır mühürlü durumdadır.

---

## 1. Dry-run

Komut:

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-k1
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-6
```

İlk tarama, uzatılmış konuşma metni ile cue paragrafının eşleşmediğini kesti (`k1` paragraf 6 / `6` paragraf 5). Cue JSON `lib/academy/lesson-cues/` senaryo ile hizalandı; dry-run yeşile döndü.

| Ders | Paragraf | Nefes isteği | Ses | Durum |
|------|----------|--------------|-----|-------|
| `01_office_ai-k1` | 14 | 15 (tavan 15) | Callirrhoe | MÜHÜR |
| `01_office_ai-6` | 14 | 14 | Callirrhoe | MÜHÜR |

Prodüksiyon kuyruğu: **boş**. Harici API dry-run’da yok.

---

## 2. Re-bake ve mühür

Komut (CEO onayı + `--force` mevcut WAV üzerine):

```
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-k1
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-6
```

| Ders | Önce | Sonra | Model | Bant |
|------|------|-------|-------|------|
| `k1` | 356.08 sn | **430.68 sn** | `gemini-3.1-flash-tts-preview` | 420–720 **yeşil** |
| `6` | 412.04 sn | **440.393 sn** | yedek `gemini-2.5-flash-preview-tts` (ana TTS günlük kota) | 420–720 **yeşil** |

Yayın MP3:

- `public/media/academy/audio/01_office_ai/01_office_ai-k1.mp3`
- `public/media/academy/audio/01_office_ai/01_office_ai-6.mp3`

Bake WAV git/Vercel dışıdır: `media-bake/academy/audio/01_office_ai/`.

### Operatör notları

- `k1` ilk mühür **418.2 sn** ile 420 altındaydı. Kapanış paragrafına bir maske cümlesi eklendi; ikinci mühür **430.68 sn**.
- `k1` MASKELE paragrafı iki nefes dilimine bölündü (15 parça / 14 konuşma paragrafı / 8 cue).
- `6` ana TTS günlük kotaya düşünce bake hattı belgelenmiş yedeğe indi. Süre bandı yedek modelde de tutuldu.
- Bake script `docs/curriculum/` yazmadan önce klasörü oluşturur (gitignore bake kopyası; canlı SSOT `lib/academy/lesson-cues/` + `lesson-audio-timings/`).

---

## 3. Timings ve kurs SSOT

`cacheV` ve yuvarlak yedek tablo bake çıktısıyla işlendi.

| Ders | `durationSec` | `cacheV` | `ACADEMY_SEALED_AUDIO_DURATION_SEC` |
|------|----------------|----------|--------------------------------------|
| `01_office_ai-1` | 571.72 | 571720 | 572 |
| `01_office_ai-k1` | **430.68** | **430680** | **431** |
| `01_office_ai-2` | 512.4 | 512400 | 512 |
| `01_office_ai-3` | 527 | 527000 | 527 |
| `01_office_ai-4` | 496.12 | 496120 | 496 |
| `01_office_ai-5` | 420.713 | 420713 | 421 |
| `01_office_ai-g1` | 529.04 | 529040 | 529 |
| `01_office_ai-w1` | 521.44 | 521440 | 521 |
| `01_office_ai-6` | **440.393** | **440393** | **440** |
| **Toplam** | **4449.506** | — | — |

```
academyCourseSealedDurationSec("01_office_ai")      = 4449.506
academyCourseSealedDurationMinutes("01_office_ai")  = 74.16
officeAiMasteryModule.estimatedTotalMinutes         = 74.16
```

Kurs bandı 45–90 dk; **74.16 yeşil**.

---

## 4. Kapanış testleri

```
npx vitest run tests/academy/sealed-duration-band.test.ts
```

- 3/3 geçti.
- `underBand` **[]** (boş).
- `overBand` **[]** (boş).
- `estimatedTotalMinutes` timings dakikasına eşit.

```
npx vitest run tests/academy
```

- **112 dosya / 419 test — hepsi yeşil.**

---

## 5. Canlı mühür kararı

| Soru | Cevap |
|------|--------|
| `k1` ve `6` 420–720 bandında mı? | **Evet.** 430.68 / 440.393 |
| 9/9 kaset mühürlü mü? | **Evet.** |
| Kurs süresi tek SSOT mı? | **Evet.** timings toplamı = `estimatedTotalMinutes` = 74.16 |
| Akademi vitest yeşil mi? | **Evet.** 419/419 |
| Canlı Mühür Onayı | **Evet — `01_office_ai` yayın hazır mühürlü.** |

Vatandaş oynatıcı lisanslı oturum ister; bu ortamda tarayıcı oturumu yok. Davranış kilidi timings + cue + vitest.

---

## Bilinçli olarak yapılmayanlar

- `6` kasetini ana TTS ile üçüncü kez fırınlamak (günlük kota; yedek model bandı tuttu).
- Üretim `DATABASE_URL` mührü (`--no-db`).
- Kardeş SKU `02`–`05` bake.
- Compact makaleyi 1050 kelimeye şişirme (B4).
