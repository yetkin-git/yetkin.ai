# 02_ecommerce_ai — Bölüm 3 fırınlama hazırlığı

`02_ecommerce_ai-3` (Müşteri Yorumları ve Soru-Cevap Analitiği) sıfır hata kalkanından geçti. WAV yok; vatandaş karaoke kapalı. Ders prodüksiyon kuyruğunda. `--dry-run` yeşil. Eğitmen Aylin / Kore.

Eğitmen: Aylin / Kore (dinamik, satış odaklı kadın sesi). Ofis hattı Callirrhoe → Gözde durur.

## Spoken script

Dosya: `lib/academy/spoken-scripts/02_ecommerce_ai-3.md`

- Eğitmen: Aylin / Kore. SEN aksı. Kod çiti yok.
- Duvar saati: **600 sn (10 dk)**. Kelime: **1080** (TTS ~10 dk bandı).
- 12 doğal nefes bloğu. Paragraf başı kısa emir yok; gönder eylemi bağlaçlı («Şimdi gönder tuşuna basıyorsun»).
- Erişim köprüsü: ChatGPT / Claude web arayüzü veya Trendyol / Hepsiburada panel içi asistan; ücretli eklenti yok.
- Cue ekran terimleri kaynakta durur (`Sentiment Analysis`, `Closed-Loop`, `ChatGPT`, `Trendyol`, `Hepsiburada`, `WhatsApp`, `Buybox`, `LED`, `AIDA`, `PAS`). Ses fonetik haritadan geçer.

| Adım (F.1.1) | Cue | Saniye | Paragraf | İçerik |
|---|---|---|---|---|
| 1. Isınma / İş Problemi | cue-01 | 0–90 | 3 | Sepet hikâyenin yarısı; 1 yıldız, iade faturası, soru-cevap ameleliği |
| 2. Temel Yöntem | cue-02 | 90–300 | 4 | Ücretsiz danışmanlık; duygu analizi; diplomatik kriz yanıtı; Closed-Loop SSS |
| 3. İstisna / Kritik | cue-03 | 300–510 | 3 | Telefon/WhatsApp yasağı, yorum rüşveti, öfke, maskeleme |
| 4. Özet & Saha Görevi | cue-04 | 510–600 | 2 | Üç anahtar; son 5 yorum + kriz yanıtı + SSS bloğu |

## Cue

Dosya: `lib/academy/lesson-cues/02_ecommerce_ai-3.json` → `CUES_BY_LESSON_KEY["02_ecommerce_ai-3"]`

Dört sahne; `paragraphs` spoken MD ile birebir. Altyazı `text` orijinal terim tutar.

| id | start | end | section | Altyazı (text) |
|---|---|---|---|---|
| cue-01 | 0 | 90 | Isınma & İş Problemi | Sepete ekletmek hikâyenin ilk yarısıdır. |
| cue-02 | 90 | 300 | Temel Yöntem | Soyut tanımları bir kenara bırakıyoruz; doğrudan senin panelindeki yorum ve soru-cevap alanına bakıyoruz. |
| cue-03 | 300 | 510 | İstisna & Kritik Durum | Yorumda ya da soru panelinde telefon, WhatsApp, e-posta, sosyal medya hesabı veya link asla yazılmaz. |
| cue-04 | 510 | 600 | Özet & Saha Görevi | Üç anahtarı cebine koy. Bir: yorumlar şikayet değil, kargo kalkanı ve ürün geliştirme madenidir. |

Fonetik (ses; cue değişmez): `Sentiment Analysis` → Sentıment Analisiz, `Closed-Loop` → Klouzd lup, `ChatGPT` → Çetcipiti, `Trendyol` → Trend yol, `Hepsiburada` → Hepsi burada, `WhatsApp` → Vatsap, `Buybox` → Baybaks, `LED` → Led, `AIDA` → Ayda, `PAS` → Pas, `Claude` → Klod, `Gemini` → Cemini.

## Bake kapısı (Bölüm 3 — kuyruk)

- Göz katmanı: `STAGE_BY_LESSON_KEY["02_ecommerce_ai-3"]` — 4 kart (müşteri soruları / iade analiz paneli slotları), poster `/academy/cinema/02_ecommerce_ai-1-eye.jpg` (8 sn; start cue 0 / 90 / 300 / 510).
- Allowlist: `ACADEMY_MEDIA_SEALED_SKU_SLUGS` ← `02_ecommerce_ai`. Mühür: `02_ecommerce_ai-1`, `02_ecommerce_ai-2`. Kuyruk: `02_ecommerce_ai-3`.
- Generate: `scripts/generate-academy-lesson-audio.ts` `--key=02_ecommerce_ai-3` dry-run örneği.
- WAV: yok. Karaoke kapalı (`article`).
- Timings: yok (fırınlama yazacak).

## Dry-run

```
npm run generate:academy-audio -- --dry-run --slug=02_ecommerce_ai --key=02_ecommerce_ai-3
```

Çıktı: 1 ders, 12 tur, 12 paragraf, 12 istek (bant 10–12), skip-preventer, Kore, KUYRUK, harici API yok.

Fırınlama için insan onayı gerekir: `--seal --confirm-gemini-spend --force --no-db --slug=02_ecommerce_ai --key=02_ecommerce_ai-3`.
