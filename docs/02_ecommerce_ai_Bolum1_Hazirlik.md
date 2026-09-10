# 02_ecommerce_ai — Bölüm 1 mühürlü ses

`02_ecommerce_ai-1` (Pazaryerlerinde Öne Çıkma ve Mağaza Asistanlığı) fırınlandı ve mühürlendi. WAV 572.1 sn; vatandaş karaoke açık. Eğitmen Aylin / Kore.

Eğitmen: Aylin / Kore (dinamik, satış odaklı kadın sesi). Ofis hattı Callirrhoe → Gözde durur.

## Spoken script

Dosya: `lib/academy/spoken-scripts/02_ecommerce_ai-1.md`

- Eğitmen: Aylin / Kore. SEN aksı. Kod çiti yok.
- Duvar saati: **600 sn (10 dk)**. Kelime: **1089** (TTS ~10 dk bandı).
- 12 doğal nefes bloğu. Paragraf başı kısa emir yok; gönder eylemi bağlaçlı («Şimdi gönder tuşuna basıyorsun»).
- Cue ekran terimleri kaynakta durur (`SEO`, `Trendyol`, `Buybox`, `ChatGPT`). Ses fonetik haritadan geçer.

| Adım (F.1.1) | Cue | Saniye | Paragraf | İçerik |
|---|---|---|---|---|
| 1. Isınma / İş Problemi | cue-01 | 0–90 | 3 | Panel, kargo, amelelik; 7/24 mağaza müdürü vaadi |
| 2. Temel Yöntem | cue-02 | 90–300 | 4 | Şiir tuzağı; üç kural; termos notu → listeleme paketi |
| 3. İstisna / Kritik | cue-03 | 300–510 | 3 | Kör yapıştırma, marka ihlali, yasak iddia, maskeleme, Buybox |
| 4. Özet & Saha Görevi | cue-04 | 510–600 | 2 | Üç anahtar; kendi ürüne başlık + 5 vitrin maddesi |

## Cue

Dosya: `lib/academy/lesson-cues/02_ecommerce_ai-1.json` → `CUES_BY_LESSON_KEY["02_ecommerce_ai-1"]`

Dört sahne; `paragraphs` spoken MD ile birebir. Altyazı `text` orijinal terim tutar.

| id | start | end | section | Altyazı (text) |
|---|---|---|---|---|
| cue-01 | 0 | 90 | Isınma & İş Problemi | Bir sekmede Trendyol ya da Hepsiburada satıcı panelin açık. |
| cue-02 | 90 | 300 | Temel Yöntem | Soyut tanımları bir kenara bırakıyoruz; doğrudan senin panelindeki gerçek probleme bakıyoruz. |
| cue-03 | 300 | 510 | İstisna & Kritik Durum | Kritik durum burada başlar. Gelen paketi körü körüne yapıştırmazsın. |
| cue-04 | 510 | 600 | Özet & Saha Görevi | Üç anahtarı cebine koy. Bir: yapay zekâ şair değil, senin mağazanın yedi gün yirmi dört saat çalışan operasyon ve satış müdürüdür. |

Fonetik (ses; cue değişmez): `SEO` → Es i o, `Trendyol` → Trend yol, `Buybox` → Baybaks, `ChatGPT` → Çetcipiti, `Hepsiburada` → Hepsi burada, `BPA` → Be pe a.

## Bake kapısı (Bölüm 1)

- Göz katmanı: `STAGE_BY_LESSON_KEY["02_ecommerce_ai-1"]` — 4 kart, poster `/academy/cinema/02_ecommerce_ai-1-eye.jpg` (8 sn, cue 0 / 90 / 300 / 510).
- Allowlist: `ACADEMY_MEDIA_SEALED_SKU_SLUGS` ← `02_ecommerce_ai`. Mühür: `02_ecommerce_ai-1`, `02_ecommerce_ai-2`. Kuyruk boş.
- WAV: `public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-1.wav` (572.1 sn, 12 nefes).
- Timings: `lib/academy/lesson-audio-timings/02_ecommerce_ai-1.json`
