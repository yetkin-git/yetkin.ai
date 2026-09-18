# DERS 5 DENETİM VE TESLİM RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-5` — İstisnalar & Hata Avı: AI Yanılınca |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO — Ders 5 nihai denetim ve rafa yerleştirme |
| Damga | **RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)** |
| Üretim DB | Bağlanılmadı (`--no-db`) |

---

## Yönetici özeti

Ders 5 brifing tebliği gibi duruyordu: «tüm detaylarıyla ele alacağız», «saniyeler içinde tespit», «acımasızca denetleyen titiz kontrol uzmanı», «parlayan bir fener», «doğrulama kalkanı», «sarsılmaz bir saygınlık», «sıfır hata standardı». Kural söyleniyor, **neden** anlatılmıyordu. Gözde’nin saha diline çekildi.

Üç pedagoji kilidi artık kaset, cue ve compact makalede duruyor:

1. **Yapay zekâ neden uydurur?** Dil modeli matematiksel işlemci değildir; kelime olasılığını tahmin eder. Toplama makinesi gibi çalışmaz.
2. **Tablodaki mantık hatasını gözünle nasıl avlarsın?** Mart + Nisan satır toplamını vermiyorsa sapma oradadır. Satır toplamları genel toplamı vermiyorsa fark kırmızı uyarıdır. Yıldız Tekstil: 9.100 + 3.400 = 12.500; 21.500 görürsen uydurmadır.
3. **AI çıktısı kontrol edilmeden masaya neden koyulmaz?** Uydurma satır genel toplamı şişirir; 59.450 bütçeye ve tedarik kararına sızar.

Mühürlü kaset **515.68 sn** (önce 420.713 sn). Bant **420–720 yeşil**. Yuvarlak SSOT `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-5"] = 516`. Kurs timings toplamı **4916.953 sn = 81.95 dk**; `officeAiMasteryModule.estimatedTotalMinutes` aynı sayıyı okur.

Görsel kilit durur: Hata avı 16:9 sahnede, D4/D5 kırmızı hücre, Kör Süreç / Dedektif Süreç rozetleri, Copilot denetim paneli. Karaoke aktif kelime `font-weight: inherit`; descender kesilmez.

---

## 1. Pedagoji ve vatandaş dili

**İlke:** Slogan yok. **Sebep → Eylem → Sonuç.** Gözde sahadan konuşur.

**Kod SSOT:**

- `lib/academy/spoken-scripts/01_office_ai-5.md` (14 paragraf, 955 kelime)
- `lib/academy/curricula/office_ai/section_5.ts` (1056 kelime; önce 953)
- `lib/academy/lesson-cues/01_office_ai-5.json`
- `lib/academy/lesson-audio-timings/01_office_ai-5.json`

Punchcard sırası değişmedi: GİRİŞ KÖPRÜSÜ · HOŞ GELDİN · AŞIRI GÜVEN · HATA AVI · AI DEDEKTİF · FARK ORTADA · CEBİNE KOY · SIRA SENDE. Cue paragraf haritası `[1, 2, 2, 2, 2, 2, 1, 2]`.

### Eski metin (slogan) ↔ yeni metin (vatandaş dili)

| # | Punchcard | Eski metin (slogan / brifing) | Yeni metin (sebep → eylem → sonuç) |
|---|-----------|-------------------------------|-------------------------------------|
| 1 | GİRİŞ KÖPRÜSÜ | «hızlanırken arkamıza yaslanıp her çıktıyı kusursuz sanmak bazen bizi yanıltıcı tuzaklara çekebilir.» (neden yok) | «Peki neden hâlâ e-postaya geçmiyoruz? Çünkü slaytın arkasındaki rakam kilitlenmeden toplantıya çıkılmaz.» |
| 2 | HOŞ GELDİN | «tüm detaylarıyla ele alacağız» · «saniyeler içinde tespit etmeyi öğreneceksin» | «Peki neden hızlanırken hata avı gerekir? Çünkü tablo düzenli görününce çoğu kişi her rakamın doğru olduğunu varsayar.» |
| 3 | HOŞ GELDİN | «acımasızca denetleyen titiz bir kontrol uzmanına dönüştürmeyi» | «Peki yapay zekânın sunduğu özete gözü kapalı neden güvenilmez? Çünkü tek hatalı satır tüm tablonun güvenilirliğini sıfırlar.» |
| 4 | AŞIRI GÜVEN | Halüsinasyon tarifi; «denetim mekanizmalarını asla elden bırakmamalısın» | «Peki yapay zekâ neden uydurur? Çünkü dil modeli matematiksel bir işlemci değildir; kelime olasılığını tahmin eder.» |
| 5 | AŞIRI GÜVEN | «çapraz sorgulama tekniklerini refleks haline getirmemiz gerekiyor» (neden zayıf) | «Peki yapay zekâ çıktısı kontrol edilmeden masaya neden koyulmaz? Çünkü o uydurma satır genel toplamı şişirir.» |
| 6 | HATA AVI | Komut tarifi; gözle avlama yok | «Şimdi mantığı oturtalım.» «Güzel özet yaz» dersen akıcı metin basar; «çelişkiyi işaretle» dersen hücreye döner. |
| 7 | HATA AVI | «parlayan bir fenere dönüşür» | «Peki tablodaki mantık hatasını veya yanlış toplamı gözünle nasıl avlarsın?» 9.100 + 3.400 = 12.500; 21.500 uydurmadır. |
| 8 | AI DEDEKTİF | Sol tablo tarifi | Sol kör süreç: 21.500 kaynaksız, genel toplam 59.450. Matematik kilitli değildir. |
| 9 | AI DEDEKTİF | «şeffaf bir doğrulama kalkanı» | Sağ denetim paneli: D4 formülle 12.500, genel toplam 50.450. Sapma görünür, toplam düşer. |
| 10 | FARK ORTADA | «çarpıcı fark» · «akıllı filtreleme sayesinde … saniyeler içinde etkisiz» | «Peki neden fark bu kadar belirgin?» Sol kör süreç, sağ dedektif süreç. Aynı tablo, iki kader. |
| 11 | FARK ORTADA | «sarsılmaz bir saygınlık kazandırır» | «Akıcı özet masaya çıkmaz; kilitli sayı çıkar.» |
| 12 | CEBİNE KOY | Üç adım emir cümlesi · «sıfır hata standardını yakalayacaksın» | Her adımın arkasına sebep: (1) dil modeli işlemci değildir. (2) sormazsan uydurma satır özette kalır. (3) kaynak evrak yoksa sayı masaya çıkmaz. |
| 13 | SIRA SENDE | «anında yakalayacaksın» | «Satır toplamı genel toplamı vermiyorsa raporu gönderme.» |
| 14 | SIRA SENDE | Köprü duruyordu. | «Sayı kilitlenmeden Cuma penceresini açma.» E-posta ritüeli · Haftalık Sistem · 30 Dakika durur. |

### Bilinçli olarak duran cümleler

Bunlar slogan değil, ölçülebilir kural veya istemdir:

- İstem: `Tablodaki satır toplamları ile genel toplam arasında çelişki olup olmadığını incele. Uyumsuz her satırı kırmızı ile işaretle ve nedenini yaz.`
- Sayı kilit: sol **21.500** / **59.450**; sağ **12.500** / **50.450**; cari **Yıldız Tekstil**
- `halüsinasyon` · `kırmızı` · `satır toplamları ile genel toplam`
- Ekran: `Word`. Ses: `Vörd` (fonetik harita)
- `5. ders` köprüsü önceki kasetten; bu kaset `e-posta` / `Haftalık Sistem` / `30 Dakika`

Anlatım köprüleri: «Şimdi mantığı oturtalım.» · «Peki neden …?» · «Neden?» · «Böylece hem … hem de …»

---

## 2. Görsel ve workspace

| Kontrol | Durum |
|---------|--------|
| 16:9 sahne (`aspect-ratio: 16 / 9`) | Durur. `.academy-player-karaoke .academy-player-widescreen` |
| Split Excel ezilmez | `.academy-player-compare-pane .academy-excel-desk` ve `.academy-excel-win` `height: 100%` |
| Yanlış hücre | cue-04 `errorCells = ["D4", "D5"]`. `.academy-excel-cell--error` zemin `#fce4ec`, çerçeve `#d32f2f` |
| Uyarı rozeti | Split etiketleri `KÖR SÜREÇ (HALÜSİNASYONLU VERİ)` / `DEDEKTİF SÜREÇ (KONTROLLÜ VERİ)`; kırmızı hücre `data-academy-excel-error` |
| Denetim paneli | `LessonAiDesk` Copilot şeridi; istem `ACADEMY_ERROR_HUNT_COPILOT_PROMPT` |
| KPI kilit | Sol 20.650+17.300+21.500=**59.450**; sağ Yıldız **12.500**, genel **50.450** |
| Prompt Terminali | Sahne dışında / dock (`below-transport`) |
| Spoiler | Beat 3’e kadar 50.450 kapalı |

Kod: `lib/academy/error-hunt-workspace.ts`, `lib/academy/lesson-beat-visual.ts`, `lib/academy/cinema-cue-catalog.ts`, `components/academy/lesson-excel-workspace.tsx`, `app/globals.css`.

Sinema karesi (`public/academy/cinema/01_office_ai-5-cue-4.jpg` … `cue-6.jpg`) yatay Excel tuvalidir; dikey ezilme yok. Canlı sahnedeki kırmızı hücre CSS ile kilitli; donmuş kare yeşil seçim gösterir (poster, canlı ızgara değil).

---

## 3. Karaoke ve altyazı

| Kilit | Kanıt |
|-------|--------|
| Cue ↔ timings | 8 rozet start/end, parça zarflarıyla birebir |
| Kaset sonu | cue-08 `end` = timings son parça = karaoke şerit sonu = **515.68** |
| Harf düşmez | Her şerit satırı tokenize → reconstruct, normalize metinle eşit |
| Layout shift yok | `.academy-player-karaoke-word` ve `[data-state="active"]` → `font-weight: inherit` |
| Descender kesilmez (`g, y, ş, p`) | Kelime `overflow: visible`; `padding-block: 0.08em 0.22em`; satır `line-height: 1.5` |
| Ekran / ses | Overlay cue gövdesi (`Word`); TTS fonetiği (`Vörd`) |

Cue saatleri:

| Cue | Rozet | Start | End |
|-----|--------|-------|-----|
| cue-01 | GİRİŞ KÖPRÜSÜ | 2.00 | 34.40 |
| cue-02 | HOŞ GELDİN | 34.80 | 106.08 |
| cue-03 | AŞIRI GÜVEN | 106.48 | 181.08 |
| cue-04 | HATA AVI | 181.48 | 259.40 |
| cue-05 | AI DEDEKTİF | 259.80 | 331.28 |
| cue-06 | FARK ORTADA | 331.68 | 399.96 |
| cue-07 | CEBİNE KOY | 400.36 | 444.84 |
| cue-08 | SIRA SENDE | 445.24 | **515.68** |

Nefes: 14 paragraf → 14 parça. `pauseSec` 0.40. HOŞ GELDİN rozeti 18 sn auto-hide (görsel son 52.8). HATA AVI dilimi gözle avlama zincirini taşır.

---

## 4. Mühürleme ve süre bandı

Dry-run:

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-5
```

| Ölçüt | Sonuç |
|-------|--------|
| Paragraf | 14 |
| Nefes isteği | 14 (hedef 10–12, tavan 15; mühürlü ders tavanında) |
| Ses | Callirrhoe |
| Model | `gemini-3.1-flash-tts-preview` |
| Harici API (dry-run) | Yok |

Canlı mühür (yeni metin timings/cue/karaoke’ya işlendi):

```
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-5
```

| Ölçüt | Sonuç |
|-------|--------|
| Süre | **515.68 sn** (önce 420.713) |
| Bant | 420–720 **yeşil** |
| `cacheV` | 515680 |
| Yuvarlak SSOT | `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-5"] = 516` |
| WAV | `media-bake/academy/audio/01_office_ai/01_office_ai-5.wav` |
| Yayın MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-5.mp3` |
| Timings | 14 nefes dilimi 1:1 |
| Cue saatleri | Bake parçasından kilitlendi |
| DB | `--no-db` |

`officeAiMasteryModule.estimatedTotalMinutes` timings toplamından türetilir: **81.95** (kurs 4916.953 sn). Senkron tam.

---

## 5. Test

```
npx vitest run tests/academy/office-ai-lesson-5.test.ts tests/academy/sealed-duration-band.test.ts
```

**2 dosya, 13 test, yeşil.**

Yan tarama (mühür, karaoke şerit, nefes, Dron punchcard, Prompt Terminali): **4 dosya, 18 test, yeşil.** Toplam **6 dosya, 31 test, yeşil.**

Yeni kilitler `office-ai-lesson-5.test.ts` içinde:

- Sebep → Eylem → Sonuç / yapay zekâ neden uydurur / gözle avlama / masaya neden koyulmaz
- Slogan yasağı: fener, kalkan, sarsılmaz saygınlık, sıfır hata standardı, tüm detaylarıyla
- `ACADEMY_ERROR_HUNT_COPILOT_PROMPT` ve KPI 59.450 / 50.450 durur
- 515.68 cue-timings-karaoke senkronu; reconstruct harf düşürmez
- 16:9 + compare `height: 100%` + kırmızı hücre + AI masa denetim paneli + prompt dock sahne dışında
- Active word `font-weight: inherit`; descender padding durur

---

## 6. Tarayıcı

Dev sunucu `http://localhost:3000` açıktı. `/academy/01_office_ai/oyna` oturum istedi (`/login?next=…`). Super Admin saha gözlemi: giriş sonrası 16:9 sahnede Excel tuvali, cue-04’te D4/D5 kırmızı, cue-05/06 split’te sol 59.450 / sağ 50.450, karaoke bandında `g / y / ş / p` kesilmemeli.

Kod sözleşmesi vitest ile kilitli; oturumlu uçtan uca tıklama bu pakette yok.

---

## Damga

**RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)**

Ders 5 vatandaş dilinde, 16:9 Hata Avı sahnesinde, mühürlü karaoke ile yayın bandındadır. Sıradaki kapı 6. derstir: E-Posta Akışı — etiket, taslak, insan onayı, arşiv.
