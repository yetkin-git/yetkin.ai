# NİPARK UX VE DERS 2 MÜHÜR RAPORU — Paket 3

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO (Yapay Zekâ Yöneticisi) — UX doğrulama + Ders 2 re-bake |
| Ders | `01_office_ai-k1` — KVKK, maskeleme, vatandaş dili |
| Üretim DB | Bağlanılmadı (`--no-db`) |

---

## Yönetici özeti

Prompt Terminali 16:9 sahnenin dışında, oynatıcı çubuğunun altında duruyor; görsel dikey ezilme sözleşmesi kodda kilitli. Ders 2 konuşma metni vatandaş dilinde mühürlendi: **677.56 sn** (önce 430.68 sn). Bant **420–720 yeşil**. Ana TTS modeli yedeğe inmedi. Kurs timings toplamı **4696.386 sn = 78.27 dk**.

Slogan kaseti kapanmıştır. Karaoke timings artık «Şimdi mantığı oturtalım» / «üç sahte satır» dilini taşır.

---

## 1. UX / sahne kontrolü

Yeni dikey düzen (önceki UI tedavisiyle aynı sözleşme):

```
┌─────────────────────────────────────┐
│  16:9 SİNEMA SAHNESİ                │
│  • Görsel / Excel-Word-Gmail…       │
│  • Adım 1-2-3 bandı (overlay)       │
│  • Karaoke altyazı (alt gradient)   │
│  • Altyazı göster/gizle (sağ üst)   │
├─────────────────────────────────────┤
│  Oynatıcı çubuğu (play / saat)      │
├─────────────────────────────────────┤
│  Prompt Terminali  ← sahne DIŞI     │
│  (yalnız Beat 3 / split-screen)     │
├─────────────────────────────────────┤
│  Özet ve Promptlar | Tam metin | …  │
└─────────────────────────────────────┘
```

Kod kanıtı:

| Kilit | Durum |
|-------|--------|
| `data-academy-prompt-host="below-transport"` | `curriculum-player.tsx` — Prompt, `LessonMediaPlayer` ile `LessonStudyTabs` arasında |
| `LessonCinemaEyeLayer` Prompt basmaz | `lesson-visual-stage.tsx` içinde `LessonPromptConsole` yok |
| Sahne tavanı | `--academy-stage-max-h: min(68vh, calc(100dvh - 11.5rem))` — prompt 16:9 yüksekliğini yemez |
| Dock kutusu | `.academy-player-compare-prompt` `flex: 0 0 auto`, kapalı yükseklik 5.5–7.8 rem |

Komut:

```
npx vitest run tests/academy/curriculum-player-surface.test.ts
```

**1 dosya, 3 test, yeşil.** Prompt sahne içinde değil; altyazı overlay ve captions toggle sözleşmesi durur.

Canlı tarayıcı geçişi bu pakette yok (oturum / dev sunucu açılmadı). Super Admin saha gözlemi: `/academy/01_office_ai/oyna` Beat 3’te Prompt Terminali barın altında daktilo etmeli.

---

## 2. Ders 2 (k1) dry-run

Komut:

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-k1
```

| Ölçüt | Sonuç |
|-------|--------|
| Paragraf | 14 |
| Nefes isteği | 15 (hedef 10–12, tavan 15) |
| Ses | Callirrhoe |
| Model | `gemini-3.1-flash-tts-preview` |
| Durum | MÜHÜR `seal=8d1e2bfe7225` |
| Harici API | Yok |
| Prodüksiyon kuyruğu | Boş |

Cue paragrafı ↔ konuşma metni eşleşti. Kapı açıldı.

---

## 3. Canlı mühür (CEO onayı)

Komut:

```
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-k1
```

Çıkış: **exit 0**, duvar süresi **475.8 sn**. Kota / 429 / yedek TTS yok.

| Alan | Önce (slogan kaset) | Sonra (vatandaş dili) |
|------|---------------------|------------------------|
| `durationSec` | 430.68 | **677.56** |
| `cacheV` | 430680 | **677560** |
| Yuvarlak tablo | 431 | **678** |
| Bant 420–720 | yeşil | **yeşil** (720’ye 42.44 sn var) |
| Model | `gemini-3.1-flash-tts-preview` | aynı |
| Dilimler | 15 | 15 |
| Intro | 2.0 sn | 2.0 sn |
| Nefes payı | 400 ms | 400 ms |

Yayın:

- WAV (git/Vercel dışı): `media-bake/academy/audio/01_office_ai/01_office_ai-k1.wav` — 677.6 s, 65 045 804 bayt
- MP3: `public/media/academy/audio/01_office_ai/01_office_ai-k1.mp3`
- Timings SSOT: `lib/academy/lesson-audio-timings/01_office_ai-k1.json`
- Cue saatleri: `lib/academy/lesson-cues/01_office_ai-k1.json`
- Bake kopyası: `docs/curriculum/01_office_ai_k1_cue.json` (izleme okumaz)

İlk perde artık slogan değil: «Şimdi mantığı oturtalım. O tabloyu temizlemiş olman… Neden?» SIRA SENDE kapanışı: «üç sahte satırın, bin gerçek satır kadar iş gördüğünü masada fark edeceksin.»

### Punchcard saatleri (bake kilidi)

| Rozet | start | end |
|-------|-------|-----|
| GİRİŞ KÖPRÜSÜ | 2.00 | 43.32 |
| HOŞ GELDİN | 43.72 | 122.64 |
| YASAK LİSTE | 123.04 | 207.48 |
| MASKELE | 207.88 | 391.84 |
| ÜÇÜNCÜ KAPI | 392.24 | 487.76 |
| FARK ORTADA | 488.16 | 560.56 |
| CEBİNE KOY | 560.96 | 605.48 |
| SIRA SENDE | 605.88 | 677.56 |

MASKELE iki nefes dilimine bölünür (1046 + 939 karakter); tavan 15 istek içinde kaldı.

---

## 4. Süre bandı ve kurs SSOT

```
npx vitest run tests/academy/sealed-duration-band.test.ts
```

**3/3 yeşil.** `underBand` boş. `overBand` boş.

```
academyCourseSealedDurationSec("01_office_ai")      = 4696.386
academyCourseSealedDurationMinutes("01_office_ai")  = 78.27
officeAiMasteryModule.estimatedTotalMinutes         = 78.27
ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-k1"] = 678
```

Kurs bandı 45–90 dk; **78.27 yeşil.** Delta: k1 +246.88 sn (vatandaş dili uzaması).

Yan testler (mühür kilitleri):

```
npx vitest run tests/academy/sealed-audio-pilot.test.ts tests/academy/dron-punchcards-from-timings.test.ts tests/academy/office-ai-lesson-k1.test.ts
```

**12 test, yeşil** (band ile birlikte 15/15).

---

## 5. Güncellenen SSOT

| Dosya | Ne |
|-------|----|
| `lib/academy/lesson-audio.ts` | k1 yuvarlak 431 → **678** |
| `lib/academy/lesson-audio-timings/01_office_ai-k1.json` | bake yazdı |
| `lib/academy/lesson-cues/01_office_ai-k1.json` | cue start/end bake kilidi |
| `tests/academy/sealed-audio-pilot.test.ts` | 677.56 / 677560 / 678 |
| `tests/academy/dron-punchcards-from-timings.test.ts` | Dron sonu 677.56 |
| `docs/ops/DURUM.md` + `docs/DURUM.md` | 2. ders 677.56 sn |
| `docs/ops/akademi-bake-elkitabi.md` | k1 mühür satırı |

`PEDAGOJI_TEDAVI_DERS_2.md` kalan kapısı (eski slogan MP3) bu mühürle kapandı.

---

## Kapanış listesi

| Soru | Cevap |
|------|--------|
| Prompt Terminali sahneyi eziyor mu? | Hayır. `below-transport`, 16:9 tavanı ayrı. |
| Surface testi yeşil mi? | Evet. 3/3. |
| Dry-run kapısı geçti mi? | Evet. 14 paragraf / 15 istek. |
| Canlı mühür basıldı mı? | Evet. Ana model, yedek yok, `--no-db`. |
| k1 420–720 içinde mi? | **Evet. 677.56 sn.** |
| `sealed-duration-band` yeşil mi? | Evet. 3/3. `underBand` boş. |
| Karaoke vatandaş dilinde mi? | Evet. Slogan cümlesi timings’de yok. |
