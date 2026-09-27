# TEDAVİ RAPORU — OFF-201 Kore fırını

| Alan | Değer |
|------|--------|
| Tarih | 27 Eylül 2026 |
| Dal | `off-201-stage` |
| Kurs | `01_office_ai_ileri` (OFF-201, İleri Ofis Yapay Zekâ) |
| Ses | Aylin (Kore). `courseMasterVoice` tek string |
| Model | `gemini-3.1-flash-tts-preview` |
| İstek | **71 / 100**. Yedek pay **29**. Normal süre bandı 70–80 |
| Yayın süresi | **4261.453 sn = 71.02 dk** |
| Satış | `ACADEMY_OFF201_LAUNCH_SALE_OPEN = false` |
| Test | `npm run test` — **237 dosya, 1156 test geçti**, çıkış kodu 0, süre 52.58 sn |

Kısa brifingde toplam süre 44.6 dakika diye geçiyordu. Mühürlü WAV ve timings kilidi bunu tutmuyor. Süre tablosu dosyaya çekildi: **71.02 dakika**. Metin kırpılmadı. Tempo 0.93 kaldı.

---

## 1. Mühür durumu

`lib/academy/pilot-sku.ts`:

- `ACADEMY_MEDIA_SEALED_AUDIO["01_office_ai_ileri"]` altı dersi taşır.
- `ACADEMY_TTS_REVOKED_CASSETTES` boştur. Eski Callirrhoe dosyaları `archived/academy-audio-revoked/01_office_ai_ileri/` altındadır. Kamu MP3’lerinin MD5 özeti arşivdekilerle aynı değildir.
- `ACADEMY_TTS_REBAKE_QUEUE` boştur.
- `ACADEMY_OFF201_LAUNCH_SALE_OPEN` false kalır. `academyCourseSaleOpen("01_office_ai_ileri")` false döner.

Oynatıcı imzalı kamu MP3’ünü açar. İmzasız istek 403 döner. Satın alma bu mandal açılmadan başlamaz.

---

## 2. İstek bütçesi

Kaynak: `npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai_ileri` (27 Eylül 2026). Harici API çağrısı yok. Çıktı altı dersi `MÜHÜR` diye bastı.

| Ders | Paragraf | İstek | Bant | Ses | Mühür özeti |
|------|----------|-------|------|-----|-------------|
| `01_office_ai_ileri-1` | 13 | 12 | 10–12 | Kore | `9c626193804f` |
| `01_office_ai_ileri-2` | 14 | 12 | 10–12 | Kore | `3344c29f2a69` |
| `01_office_ai_ileri-3` | 10 | 11 | 10–12 | Kore | `181fad3a3503` |
| `01_office_ai_ileri-4` | 10 | 12 | 10–12 | Kore | `369e669f03a4` |
| `01_office_ai_ileri-5` | 11 | 12 | 10–12 | Kore | `e9c8857e54fa` |
| `01_office_ai_ileri-6` | 16 | 12 | 10–12 | Kore | `49c4eedabf28` |
| **Maç** | **74** | **71** | normal süre | Kore | yedek 29, tavan 100 |

Model satırı: `model=gemini-3.1-flash-tts-preview`.

---

## 3. Dosya süreleri

WAV başlığı (48 kHz, 16 bit, tek kanal) timings `durationSec` ile milisaniye olarak aynıdır. Yuvarlak yedek `ACADEMY_SEALED_AUDIO_DURATION_SEC` içindedir. Her ders 5 dakikanın üstündedir. Üst tavan uygulanmadı.

| Ders | Başlık | `durationSec` | Yuvarlak | Dakika | Cue | Parça | WAV bayt | MP3 bayt |
|------|--------|---------------|----------|--------|-----|-------|----------|----------|
| 1 | Dört Parçalı İstem | 532.798 | 533 | 8.88 | 8 | 12 | 51.148.692 | 12.788.397 |
| 2 | Toplantı Notu ve Eylem Listesi | 641.229 | 641 | 10.69 | 8 | 12 | 61.557.980 | 15.390.765 |
| 3 | Excel Formül ve Grafik | 690.602 | 691 | 11.51 | 8 | 11 | 66.297.796 | 16.576.173 |
| 4 | Uzun Belge ve Sayfa Kontrolü | 763.174 | 763 | 12.72 | 8 | 12 | 73.264.716 | 18.317.421 |
| 5 | E-Posta Sınıflandırma ve Yanıt Taslağı | 840.464 | 840 | 14.01 | 8 | 12 | 80.684.580 | 20.172.717 |
| 6 | Üç Dosyada Yan Yana Sayı Denetimi | 793.186 | 793 | 13.22 | 8 | 12 | 76.145.852 | 19.037.997 |
| **Toplam** | | **4261.453** | **4261** | **71.02** | **48** | **71** | **409.099.616** | **102.283.470** |

`cacheV` değerleri: 532798, 641229, 690602, 763174, 840464, 793186.

Ders 2’nin son parça ve son cue sonu 641.228 idi. WAV 641.229 saniyede biter. Son damga 641.229’a çekildi. Ses dosyası değişmedi.

Modül `estimatedTotalMinutes` timings toplamıdır: **71.02**. Müfredat kartı ders dakikasını ayrı yuvarlar (9+11+12+13+14+13 = 72). Kart yuvarlaması kaseti kısaltmaz.

---

## 4. Kamu MP3 ve arşiv

Kamu dosya: `public/media/academy/audio/01_office_ai_ileri/{ders}.mp3`.

| Ders | Kamu MD5 | Bayt |
|------|----------|------|
| 1 | `e688082114819e60979b4da9caec6d16` | 12.788.397 |
| 2 | `77cca75671f0ebdbc30500b4938e04bf` | 15.390.765 |
| 3 | `f230a565599ba00471d2ad8141bf9112` | 16.576.173 |
| 4 | `3e0d2bd77764ac60e6c9489c90a09465` | 18.317.421 |
| 5 | `aa3a5b7e24bfc7c23ee27fbccdbbd2fa` | 20.172.717 |
| 6 | `ccb457f44e5547a5c78932bc79edd406` | 19.037.997 |

Arşiv MD5’leri farklıdır. Örnek: çoklu ses ders 1 `12a40302c3636c632f1f184851a5c949` (12.572.973 bayt). Kamu ders 1 bu özet değildir. Eski Callirrhoe kaseti kamu ağacında durmaz.

Bake WAV `media-bake/academy/audio/01_office_ai_ileri/` altındadır. Bu klasör git dışıdır.

---

## 5. Test

Komut: `npm run test`  
Tanım: `vitest run --exclude **/*surface.test.ts --exclude tests/kernel/earnings-bridge.test.ts`  
Başlangıç: 03:20:38  
Süre: 52.58 sn  
Çıkış kodu: 0

```
Test Files  237 passed (237)
Tests       1156 passed (1156)
```

İlk turda ders 2’nin 1 ms’lik son damgası tek testi düşürdü (1155 geçti, 1 kaldı). Damga WAV süresine çekildikten sonra üstteki tur yeşildir.
