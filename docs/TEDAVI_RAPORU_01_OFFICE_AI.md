# TEDAVİ RAPORU — 01_office_ai Paket 1 (T0–T4)

| Alan | Değer |
|------|--------|
| Tarih | 17 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin |
| Onay makamı | CEO (Yapay Zekâ Yöneticisi) — kararlar bu pakette icra edildi |
| Kaynak | `docs/TESPIT_RAPORU_01_OFFICE_AI.md` + Super Admin talimatı |
| Kod SSOT | Çalıştırılabilir kod. Üretim DB’ye bağlanılmadı. `--seal` TTS çağrılmadı. |

---

## Yönetici özeti

P0 kırık referanslar onarıldı. Kurs süresi artık mühürlü timings toplamından türetiliyor (`72.44` dk). 27 ders mini sorusu oynatıcıya **notsuz öz-değerlendirme** olarak bağlandı. Cuma çakışması (`q_off_24`) kapatıldı. ANAYASA / MANIFESTO / PEDAGOJI’deki 9 kılavuz reformu uygulandı. Çekirdek 9 ders kilitli; 3 köprü dersi `planned.ts` uydusunda (ileriki fırın).

**Kalan kapı:** `k1` (356.08 sn) ve `6` (412.04 sn) mühürlü MP3 hâlâ 420 sn altındadır. Konuşma metinleri banda uzatıldı; canlı kaset `--dry-run` → insan onayı → `--seal` bekler. Timings/MP3 uydurulmadı.

---

## ADIM 1 — FAZ T0 (P0 referanslar)

### 1. `docs/DURUM.md` — Seçenek A

- Yaşayan kesit: `docs/ops/DURUM.md`.
- Uyumluluk aynası: `docs/DURUM.md` (üst bant: *Yaşayan kesit `docs/ops/DURUM.md`'dir, bu dosya test uyumluluk aynasıdır.*).
- 11 eski yol + 2 test dokunulmadan yeşile döner.

### 2. `docs/specs/freelancer-vize-kapisi.md`

Git `HEAD`’ten geri yüklendi. MANIFESTO Kural 2 ölü link olmaktan çıktı (B-MN1).

### 3. `docs/curriculum/`

`.gitignore` satırı: bake kopyası, izleme okumaz. Silinen 20 dosya geri getirilmedi (canlı SSOT `lib/academy/`). PEDAGOJI §B: Cursor `lib/academy/` altına kaydeder.

### Doğrulama T0

```
npx vitest run tests/academy/production-standard.test.ts tests/kernel/faz2-t3-dron-ring-surface.test.ts
```

**2 dosya, yeşil.**

---

## ADIM 2 — FAZ T1 (sayı / süre / kelime)

### 1. Süre SSOT

`lib/academy/lesson-audio.ts`:

- `academyCourseSealedDurationSec(slug)` — timings `durationSec` toplamı (kesin).
- `academyCourseSealedDurationMinutes(slug)` — iki ondalık.

`officeAiMasteryModule.estimatedTotalMinutes` el yazması `73.32` silindi; şu an **72.44** (`4346.553 sn / 60`).

Bant sabitleri: `ACADEMY_AI_LESSON_DURATION_MIN_SEC = 420`, `MAX = 720`.

### 2. k1 ve 6 konuşma uzatması

| Ders | Mühürlü timings | Konuşma | MP3 |
|------|-----------------|---------|-----|
| `k1` | 356.08 sn | Somut maske örneği (MASKELİ_TELEFON / MASKELİ_MAAŞ); 14 paragraf korundu | Re-bake bekler |
| `6` | 412.04 sn | Yinelenen Cuma takvim bloğu | Re-bake bekler |

Fonetik: `MASKELİ_TELEFON`, `MASKELİ_MAAŞ` → TTS alt çizgi okumaz.

### 3. Kelime senkronu

- `lib/academy/word-count.ts` + `scripts/ops-sync-wordcount.ts` (`npm run ops:sync-wordcount`, `--check` kayma kapısı).
- Compact `estimatedWordCount` artık gövde sayımıdır. El yazması 1020/1280… gerçek gövdeyle örtüşmüyordu (w1 compact **492** kelime).
- w1’e dilekçe hitabı eklendi: *Öğretmen SEN, belge SIZ* + «Sayın Yetkili… arz ederiz.»
- Anayasa B4: compact 1050 tavan/taban ile kesilmez. `SEALED_AUDIO_LIMITS` mühürlü ses; `COMPACT_ARTICLE_GUIDE` öneri.

### 4. Vatandaş ders no bantları

- `section_4.ts` — Ders 6/9 (`01_office_ai-4`)
- `section_5.ts` — Ders 5/9 (`01_office_ai-5`)
- `section_6.ts` — Ders 9/9 (`01_office_ai-6`)

Yeniden adlandırma yok.

---

## ADIM 3 — FAZ T2 & T4 (ölçme + kılavuz)

### 1. Mini sınav oynatıcıda

- Yeni sekme: **Kendini Dene** / başlık **Ders Sonu Kendini Dene (Notsuz, 3 Soru)**.
- `components/academy/lesson-self-check.tsx` → `loadAcademyLessonExam`.
- Puan sunucuya gitmez, mühür basmaz, `q_off_l*` final havuzuna karışmaz.
- Compact makalede `## Mini sınav` yok (sızıntı kilidi durur).

### 2. `q_off_12` / `q_off_24`

- `q_off_12` Cuma 10+10+10 bölüşü (tek).
- `q_off_24` CRM ekran görüntüsü ≠ 3. Kapı (maskeleme). Havuz **42** sabit.

### 3. Kılavuz reformları

| ID | Dosya | İcra |
|----|--------|------|
| B-AN1 | ANAYASA B | Yaşayan `docs/ops/DURUM.md`; ayna `docs/DURUM.md` |
| B-AN2 | ANAYASA B4 + `config.ts` | `SEALED_AUDIO_LIMITS` + `COMPACT_ARTICLE_GUIDE` (tavan değil) |
| B-MN1 | MANIFESTO Kural 2 | Spec geri yüklendi |
| B-MN2 | MANIFESTO Kural 1 | Faz 1’de yeni oda CEO + Super Admin çift imza olmadan açılmaz |
| B-MN3 | MANIFESTO Kural 1 | Dron bağlı, web-parite değil (simülasyon web’de) |
| P-PD2 | PEDAGOJI §B | 8 cue tavan; 6–9; 45–75 sn/cue |
| P-PD5 | PEDAGOJI §E | Excel yalnız Excel dersi; KVKK/g1/w1 kendi masası |
| P-PD9 | PEDAGOJI §C | Öğretmen SEN, belge SIZ; Fenrir köprü pilotu |
| P-PD11 | PEDAGOJI §E.2 | Sheets/Docs yasak değil; bu SKU’da yol Excel/Word |

Son Reform satırları **17 Eylül 2026 (Tespit-Tedavi)**. A Katmanı dokunulmadı.

### 4. `types.ts`

«Ses Gözde (Callirrhoe); vitrin/rozet adı Eğitmen.»

### Evrensellik (CEO kararı 3)

Çekirdek 9 `lane: main` / `sealed`. Uydu (ileriki fırın, sınav yoluna girmez):

- `01_office_ai-10` Takvim ve Toplantı AI
- `01_office_ai-11` Excel Formül ve Grafik AI
- `01_office_ai-12` PDF ve Uzun Belge AI

---

## Testler

Koşulan paketler (hepsi yeşil):

- T0: `production-standard`, `faz2-t3-dron-ring-surface`
- T1–T4: `lesson-self-check`, `sealed-duration-band`, `word-count-sync`, `office-ai-exam-leak`, `curriculum-syllabus`, `curriculum-player-surface`, `tts-skip-preventer`
- Regresyon: ofis ders 1–6 / g1 / w1 / k1, `sealed-audio-pilot`, `exam-flow`, `lesson-player-media`, `citizen-surface`, `sen-axis-surface`, `office-win-fit`, `lesson-body`, karaoke / visual stage / Dron punchcard

Lint: yeni/değişen TSX-TS dosyalarında linter uyarısı yok.

Oynatıcı sekmesi lisanslı oturum ister; bu ortamda canlı tarayıcı oturumu yok. Davranış kilidi kaynak + vitest.

---

## Bilinçli olarak yapılmayanlar

- k1/6 `--seal` TTS (insan onayı + Gemini harcaması; Pedagoji E.5).
- Timings/MP3 süresini şişirme (oynatıcı saati yalan söylemez).
- `docs/curriculum/` 20 dosyayı geri getirme.
- Çekirdek 9’u 12 derse şişirme.
- Compact makaleyi 1050 kelimeye doldurma (B4; gerçek gövde ~490–1268).

---

## Canlı mühür öncesi operatör listesi

1. `npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-k1`
2. Aynı `--key=01_office_ai-6`
3. Senaryo/cue oturunca: `--seal --confirm-gemini-spend` (insan)
4. Timings + `ACADEMY_SEALED_AUDIO_DURATION_SEC` bake çıktısıyla güncellenir
5. `sealed-duration-band` içindeki `underBand` listesi boşalmalı

---

## Bir sonraki aşama sorusu

**T0–T4 kod ve kılavuz tedavisi tamamlandı mı?** Evet.

**Tüm koşulan testler yeşil mi?** Evet (yukarıdaki vitest paketleri).

**Canlı Mühür Onayı (CEO Onayı) için sistem hazır mı?** **Kısmen.** Ürün yüzeyi (P0 referans, mini sınav, kılavuz, süre SSOT, çekirdek 9 + 3 köprü planı) onaya hazırdır. **k1 ve 6 mühürlü kaset 420 sn bandının altında kaldığı için tam Canlı Mühür hayır:** konuşma metni hazır; TTS re-bake (`--seal`) ve timings senkronu CEO/operatör kapısıdır. O bake olmadan k1/6 vatandaş kaseti eski süreyi taşır.
