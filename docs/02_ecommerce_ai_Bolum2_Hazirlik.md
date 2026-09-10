# 02_ecommerce_ai — Bölüm 2 mühürlü ses

`02_ecommerce_ai-2` (SEO Odaklı Ürün Açıklaması Yazımı) fırınlandı ve mühürlendi. WAV 621.4 sn; vatandaş karaoke açık. Eğitmen Aylin / Kore.

Eğitmen: Aylin / Kore (dinamik, satış odaklı kadın sesi). Ofis hattı Callirrhoe → Gözde durur.

## Spoken script

Dosya: `lib/academy/spoken-scripts/02_ecommerce_ai-2.md`

- Eğitmen: Aylin / Kore. SEN aksı. Kod çiti yok.
- Duvar saati: **600 sn (10 dk)**. Kelime: **1147** (TTS ~10 dk bandı).
- 12 doğal nefes bloğu. Paragraf başı kısa emir yok; gönder eylemi bağlaçlı («Şimdi gönder tuşuna basıyorsun»).
- Cue ekran terimleri kaynakta durur (`SEO`, `H1`, `Meta`, `Amazon`, `Buybox`, `Trendyol`, `ChatGPT`, `AIDA`, `PAS`). Ses fonetik haritadan geçer.

| Adım (F.1.1) | Cue | Saniye | Paragraf | İçerik |
|---|---|---|---|---|
| 1. Isınma / İş Problemi | cue-01 | 0–90 | 3 | Tıklama var satış yok; reklam bütçesi, hemen çıkma, Buybox faturası |
| 2. Temel Yöntem | cue-02 | 90–300 | 4 | Özellik değil fayda; AIDA/PAS; dörtlü küme; tam boy açıklama |
| 3. İstisna / Kritik | cue-03 | 300–510 | 3 | H1/Meta spam, abartılı iddia, marka ihlali, maskeleme |
| 4. Özet & Saha Görevi | cue-04 | 510–600 | 2 | Üç anahtar; küme + AIDA/PAS açıklamayı panele yapıştır |

## Cue

Dosya: `lib/academy/lesson-cues/02_ecommerce_ai-2.json` → `CUES_BY_LESSON_KEY["02_ecommerce_ai-2"]`

Dört sahne; `paragraphs` spoken MD ile birebir. Altyazı `text` orijinal terim tutar.

| id | start | end | section | Altyazı (text) |
|---|---|---|---|---|
| cue-01 | 0 | 90 | Isınma & İş Problemi | Başlık ve vitrin maddeleri müşteriyi mağazanın kapısından içeri sokar. |
| cue-02 | 90 | 300 | Temel Yöntem | Soyut tanımları bir kenara bırakıyoruz; doğrudan senin panelindeki açıklama alanına bakıyoruz. |
| cue-03 | 300 | 510 | İstisna & Kritik Durum | H1 başlığı spam kelimeyle şişmesin. |
| cue-04 | 510 | 600 | Özet & Saha Görevi | Üç anahtarı cebine koy. Bir: ürün açıklaması formalite değil, senin reklam bütçeni kurtaran kapanış tezgahtarıdır. |

Fonetik (ses; cue değişmez): `SEO` → Es i o, `H1` → He bir, `Meta` → Me ta, `Amazon` → Ama zon, `Buybox` → Baybaks, `Trendyol` → Trend yol, `ChatGPT` → Çetcipiti, `AIDA` → Ayda, `PAS` → Pas, `CTA` → Si ti a.

## Bake kapısı (Bölüm 2)

- Göz katmanı: `STAGE_BY_LESSON_KEY["02_ecommerce_ai-2"]` — 4 kart (SEO arayüzü / e-ticaret paneli slotları), poster `/academy/cinema/02_ecommerce_ai-1-eye.jpg` (8 sn; start WAV timings).
- Allowlist: `ACADEMY_MEDIA_SEALED_SKU_SLUGS` ← `02_ecommerce_ai`. Mühür: `02_ecommerce_ai-1`, `02_ecommerce_ai-2`. Kuyruk boş.
- WAV: `public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-2.wav` (621.4 sn, 12 nefes).
- Timings: `lib/academy/lesson-audio-timings/02_ecommerce_ai-2.json`
