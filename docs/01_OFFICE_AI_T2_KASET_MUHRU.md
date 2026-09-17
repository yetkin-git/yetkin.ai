# 01_office_ai — Faz T2 Kaset Mührü (Kalan 4)

| Alan | Değer |
|------|--------|
| Tarih | 17 Eylül 2026 (ücretli kova kapanışı 10:19 UTC+3) |
| Rol | Cursor Ajanı → SUPER ADMIN |
| Kapsam | Sapmış kaset kuyruğu `4`, `3`, `2`, `g1` — canlı `--seal` |
| Yöntem | Tek anahtar, tek `--seal`. `--force --no-db --no-fallback`. Gemini harcaması insan kapısıyla. Paid Tier 1. |
| Statü | **Mühürlü.** Dört kaset `gemini-3.1-flash-tts-preview` ile basıldı. 209/973 %100 yeşil. |

Çelişkide Anayasa **A Katmanı** bağlayıcıdır. Bu rapor ürün kodunu import etmez.

Önceki mühürler: `docs/01_OFFICE_AI_TEDAVI_RAPORU.md` (T0+T1), `docs/01_OFFICE_AI_FINAL_AMIRAL_RAPORU.md` (T3 + T2 hazırlığı). Sabah mühür: Ders 1 + Ders 5. Ücretsiz kova 429 duvarı: aynı dosyanın durdurulmuş hali.

---

## 0. Yönetici özeti

SUPER ADMIN Paid Tier 1 (TRY 521.99) tanımladı. Günlük kova (RPD) kalktı. `GEMINI_API_KEY` `.env.local` üzerinden bake hattına girdi. `--no-fallback` tuttu: 2.5 kovasına düşülmedi.

Dört kaset sırayla mühürlendi. 56 istek (4 × 14), 429 yok. WAV saniyesi timings’e yazıldı; test kilitleri yeni WAV’dan çekildi. Ders 4 saat sapması kapandı.

**Kulak = göz.** Lansman şalteri açılmaya hazırdır.

---

## 1. İcra

| # | Anahtar | Vatandaş | Duvar (UTC+3) | Sonuç |
|---|---------|----------|---------------|--------|
| 1 | `01_office_ai-4` | Ders 6 | 09:51 | **OK** 496.12s · 14 dilim · 47.6 MB WAV |
| 2 | `01_office_ai-3` | Ders 4 | 09:58 | **OK** 527.00s · 14 dilim · 50.6 MB WAV |
| 3 | `01_office_ai-2` | Ders 3 | 10:05 | **OK** 512.40s · 14 dilim · 49.2 MB WAV |
| 4 | `01_office_ai-g1` | Ders 7 | 10:13 | **OK** 529.04s · 14 dilim · 50.8 MB WAV |

Model: `gemini-3.1-flash-tts-preview`. Komut (her biri ayrı):

```
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=<anahtar>
```

Bake her kasette: WAV `media-bake/`, yayın MP3 `public/media/academy/audio/`, cue saatleri `lib/academy/lesson-cues`, curriculum kopyası `docs/curriculum`, timings 1:1 kilit. `--no-db` DB mührü basmadı.

Önceki ücretsiz kova 429 kayıtları (1 / 1b / 1c / 1d) tarihçedir; ücretli kova onları çürüttü.

---

## 2. Doğrulama — `npm run test`

```
Test Files  209 passed (209)
     Tests  973 passed (973)
  Duration  46.93s
```

Ders 4 saat sapması kapandı. Eski kilit 544.52 / 194.52; T1 ara hâli 472.513 / 164.695. Yeni WAV:

| Kilit | Yeni |
|-------|------|
| `office-ai-lesson-4` 05:30 panel | `cue-06` (330s, FARK ORTADA; 3 grup kartı durur) |
| `office-ai-lesson-4` kaset sonu | `496.12` |
| `office-ai-lesson-4` cue-04 start | `170.84` |
| `office-ai-lesson-4` Dron punchcard sonu | `496.12` |
| `prompt-console` cue-04 start | `170.84` |
| `sealed-audio-pilot` Ders 4 `durationSec` | `496.12` |

Ders 3 / 4 / 7 kaset sonları: `512.4` / `527` / `529.04`. Yedek tablo `ACADEMY_SEALED_AUDIO_DURATION_SEC` yuvarlanmış: 512 / 527 / 496 / 529.

Ders 1 / Ders 5 sabah mührü kırmızı değil. `k1` / `w1` / `6` yeniden fırınlanmadı.

---

## 3. Kuyruk

Kuyruk boş. Reset beklenmez. `--seal` bu dört anahtar için tekrarlanmaz.

**Yapılmaz.** Kota bitmişken `--seal`. Test saatini elle uydurmak. `k1` / `w1` / `6` yeniden fırın. Kernel / hop / cüzdan.

---

## Mühür

Kalan dört kaset mühürlendi. Paid Tier 1, RPD yok, `--no-fallback` tuttu. 01_office_ai canlıya çıkışa **%100 hazır.** 209/973 %100 yeşil. Kulak = göz.

— Cursor Ajanı, 17 Eylül 2026 10:19 UTC+3
