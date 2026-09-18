# DERS 7 DENETİM VE TESLİM RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-g1` — Gmail + Gemini ile Gelen Kutusu ve Aksiyon Listesi |
| Vatandaş sıra | 7 / 9 |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO — Ders 7 nihai denetim ve rafa yerleştirme |
| Damga | **RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)** |
| Üretim DB | Bağlanılmadı (`--no-db`) |

---

## Yönetici özeti

Ders 7 sloganla kilitleniyordu: «kahramanlıktır / yöneticiliktir», «vaadi nettir», «sen hamal değilsin», «iki ayrı kader», «gece mesaisi», «üç eşleşmeyi ezberle», «Baraj yetmiştir». Kural söyleniyor, **neden** anlatılmıyordu. Gözde’nin saha diline çekildi.

Üç pedagoji kilidi artık kaset, cue ve compact makalede duruyor:

1. **Neden ChatGPT’ye mail kopyalanmaz?** Kopyalanan gövde kutudan kopar; etiket, arşiv ve taslak orada oluşmaz. Asıl kapı Gmail’deki Gemini paneli (ve lisans varsa Outlook Copilot)dır.
2. **Kim, ne, ne zaman neden kilitlenir?** Gönderen yoksa tahsilat kime bağlanır; iş yoksa bülten ödeme gibi durur; son tarih yoksa Kaya Gıda’nın bugünü kaybolur.
3. **Taşıma su neden yasak listesi değil, atlanmış kapıdır?** 1. ve 2. kapı dururken kopyala-yapıştır kutuyu kopuk bırakır. Üçüncü kapı maskeli kısa özettir; bütün gelen kutu değildir.

Mühürlü kaset **567.2 sn** (önce 529.04 sn). Bant **420–720 yeşil**. Yuvarlak SSOT `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-g1"] = 567`. Kurs timings toplamı **4904.433 sn = 81.74 dk**; `officeAiMasteryModule.estimatedTotalMinutes` aynı sayıyı okur.

Görsel kilit durur: canlı Gmail 16:9 sahnede, Gemini sağ paneli `#152536`, tuval `#122033` (navy; `#000` yasak). Split: sol TAŞIMA SU / sağ YERLEŞİK GEMİNİ. Karaoke aktif kelime `font-weight: inherit`; descender kesilmez.

---

## 1. Pedagoji ve vatandaş dili

**İlke:** Slogan yok. **Sebep → Eylem → Sonuç.** Gözde sahadan konuşur.

**Kod SSOT:**

- `lib/academy/spoken-scripts/01_office_ai-g1.md` (14 paragraf, 1052 kelime)
- `lib/academy/curricula/office_ai/section_g1.ts` (587 kelime; önce 491)
- `lib/academy/lesson-cues/01_office_ai-g1.json`
- `lib/academy/lesson-audio-timings/01_office_ai-g1.json`

Punchcard sırası değişmedi: GİRİŞ KÖPRÜSÜ · HOŞ GELDİN · TAŞIMA SU · GEMİNİ AÇ · YERLEŞİK YOL · FARK ORTADA · CEBİNE KOY · SIRA SENDE. Cue paragraf haritası `[1, 2, 2, 3, 2, 2, 1, 1]`.

### Eski metin (slogan) ↔ yeni metin (vatandaş dili)

| # | Punchcard | Eski metin (slogan / brifing) | Yeni metin (sebep → eylem → sonuç) |
|---|-----------|-------------------------------|-------------------------------------|
| 1 | GİRİŞ KÖPRÜSÜ | Taşıma anlatılıyor; ChatGPT’ye kopyalamanın **nedeni** yok | «Peki neden hâlâ maili ChatGPT’ye kopyalıyoruz? Çünkü kopyalanan gövde kutudan kopar. Etiket orada oluşmaz, arşiv orada oluşmaz, taslak da kutunun içinde kalmaz.» |
| 2 | HOŞ GELDİN | «doygun ayağına hoş geldin» · «Bu dersin vaadi nettir» | «Peki neden kopyala-yapıştır varsayılan yol değildir? Çünkü mail gövdesi dış sohbete gidince kutu senden kopar; etiket Gmail’de basılmaz.» |
| 3 | HOŞ GELDİN | «Tek tek açmak kahramanlıktır. Tablo istemek yöneticiliktir.» | «Peki aksiyon listesinde kim, ne, ne zaman neden kilitlenir? Çünkü gönderen yoksa tahsilat kime bağlanır. İş yoksa bülten ödeme gibi durur. Son tarih yoksa Kaya Gıda’nın bugünü kaybolur.» |
| 4 | TAŞIMA SU | Atlanmış kapı tanımı; neden zayıf | «Peki neden bu atlanmış kapıdır, yasak listesi değil? Çünkü gelen kutusu o anda kopuk kalır.» |
| 5 | TAŞIMA SU | Çift hat tarifi; ChatGPT karşılaştırması slogan | «Peki neden ChatGPT penceresi değil de bu yerleşik panel? Çünkü paneli açık tutunca kutu yerinde kalır; ChatGPT’ye yapıştırınca etiket, arşiv ve taslak dışarıda kalır.» |
| 6 | GEMİNİ AÇ | «Sen hamal değilsin» | «Peki neden kopyalamazsın? Çünkü model kutunun içinde tararsa etiket orada basılır; kopyalarsan kutu yerinde kalmaz.» |
| 7 | FARK ORTADA | «Sol tarafta hamalsın. Sağ tarafta yönetmensin.» · «iki ayrı kader» · «gece mesaisi» | «Peki neden fark bu kadar belirgin? Çünkü yerleşik panel kutuyu senden koparmaz; kopyala-yapıştır koparır.» |
| 8 | FARK ORTADA | «Bu üç eşleşmeyi ezberle» · «Baraj yetmiştir. Satın alma belge basmaz.» | «Peki neden bu üç eşleşme durur? Çünkü yanlış kapı kutuyu, dosyayı veya maddeyi senden koparır.» Sınav kapısı olgusu durur; 9. ders sloganı bu kasette yoktur. |
| 9 | CEBİNE KOY | Üç adım emir cümlesi (neden yok) | Her adımın arkasına sebep: (1) 1. ve 2. kapı dururken kopyala-yapıştır atlanmış kapıdır. (2) gönderen, iş, son tarih kilitlenmezse tahsilat kaybolur. (3) model nezaket üretir, taahhüt üretemez. |
| 10 | SIRA SENDE | Köprü duruyordu. | Üç satırlık aksiyon listesi: gönderen, iş, son tarih. Word ataş kapısı durur. Gönder tuşu sende kalsın. |

### Bilinçli olarak duran cümleler

Bunlar slogan değil, ölçülebilir kural veya istemdir:

- İstem: `@Gmail Gelen kutumdaki son 24 saat içinde gelen e-postaları tara. Ödeme, onay veya acil aksiyon bekleyenleri tablo yap: Gönderen | İş | Son tarih | Taslak yanıt notu. Rutin dekont ve bültenleri Arşivlik yaz. Hiçbir taslağı gönderme.`
- KPI kilit: **Kaya Gıda A.Ş.** / **54.650 TL**; yönetim imzası **17:00**; bülten **Arşivlik**
- Aksiyon kartları: `ÖDEME / ONAY` · `ACİL AKSİYON` · `ARŞİVLİK`
- Ekran: `Copilot`, `Gemini`, `ChatGPT`; Ses: `Kopilot`, `Cemini`, `Çetcipiti` (fonetik harita)
- `atlanmış kapı` (yasak listesi değil) · `taşıma su` · `6. derste Outlook`
- `Yerleşik paneli aç` · `Aksiyon tablosu iste` · `Onaylamadan gönderme`

Anlatım köprüleri: «Peki neden …?» · «Peki aksiyon listesinde kim, ne, ne zaman neden kilitlenir?» · «Şimdi ekranı ikiye bölelim.»

---

## 2. Görsel ve Gmail workspace

| Kontrol | Durum |
|---------|--------|
| 16:9 sahne (`aspect-ratio: 16 / 9`) | Durur. `.academy-player-karaoke .academy-player-widescreen` |
| Gmail penceresi ezilmez | `.academy-player-waiter .academy-outlook-win` ve desk `office-win-fit` `height: 100%` |
| Gelen kutusu | 4 dolgun satır: Kaya Gıda, Yönetim, Banka Dekontu, Haftalık Bülten; zemin `#163250`, okunmamış `#1b3d63`, başlık `#7dd3fc` |
| Siyah ekran yok | Gmail tuval `#122033` (navy); Outlook tuval `#0b1220`; `#000` yasak kilitli |
| Gemini sağ paneli | cue-04 `LessonOfficeCopilotRibbon` + `LessonAiDesk`; `hideReply: true` (spoiler kapalı); zemin `#152536` |
| Aksiyon kartları | `ÖDEME / ONAY` `#3f1a22` · `ACİL AKSİYON` `#3d3010` · `ARŞİVLİK` `#12382f` |
| Split | cue-05/06: `GELEN KUTUSUNDAN KOPUK / TAŞIMA SU YÖNTEMİ` / `GELEN KUTUSU İÇİ / YERLEŞİK GEMİNİ ENTEGRASYONU` |
| Prompt Terminali | Sahne dışında / dock (`below-transport`) |

Kod: `lib/academy/gmail-workspace.ts`, `lib/academy/lesson-beat-visual.ts`, `lib/academy/cinema-cue-catalog.ts`, `components/academy/lesson-gmail-workspace.tsx`, `app/globals.css`. Yeni kilit dosyası: `tests/academy/gmail-workspace.test.ts`.

Sinema karesi (`public/academy/cinema/01_office_ai-g1-cue-*.jpg`) krem storyboard posteridir; canlı sahne CSS Gmail tuvalidir (`academyVisualCinematicFrameSrc` bu derste `null`). Poster siyah değildir; canlı ızgara posterden okunmaz.

---

## 3. Karaoke ve altyazı

| Kilit | Kanıt |
|-------|--------|
| Cue ↔ timings | 8 rozet start/end, parça zarflarıyla birebir |
| Kaset sonu | cue-08 `end` = timings son parça = karaoke şerit sonu = **567.2** |
| Harf düşmez | Her şerit satırı tokenize → reconstruct, normalize metinle eşit |
| Layout shift yok | `.academy-player-karaoke-word` ve `[data-state="active"]` → `font-weight: inherit` |
| Descender kesilmez (`g, y, ş, p`) | Kelime `overflow: visible`; `padding-block: 0.08em 0.22em`; satır `line-height: 1.5` |
| Ekran / ses | Overlay cue gövdesi (`Copilot`, `Gemini`, `ChatGPT`); TTS fonetiği (`Kopilot`, `Cemini`, `Çetcipiti`) |

Cue saatleri:

| Cue | Rozet | Start | End |
|-----|--------|-------|-----|
| cue-01 | GİRİŞ KÖPRÜSÜ | 2.00 | 49.64 |
| cue-02 | HOŞ GELDİN | 50.04 | 146.64 |
| cue-03 | TAŞIMA SU | 147.04 | 229.56 |
| cue-04 | GEMİNİ AÇ | 229.96 | 300.72 |
| cue-05 | YERLEŞİK YOL | 301.12 | 375.20 |
| cue-06 | FARK ORTADA | 375.60 | 470.88 |
| cue-07 | CEBİNE KOY | 471.28 | 517.76 |
| cue-08 | SIRA SENDE | 518.16 | **567.20** |

Nefes: 14 paragraf → 14 parça. `pauseSec` 0.40. HOŞ GELDİN dilimi «neden kopyala-yapıştır değil» ve «kim / ne / ne zaman neden kilitlenir» zincirini taşır.

---

## 4. Mühürleme ve süre bandı

Dry-run:

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-g1
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
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-g1
```

| Ölçüt | Sonuç |
|-------|--------|
| Süre | **567.2 sn** (önce 529.04) |
| Bant | 420–720 **yeşil** |
| `cacheV` | 567200 |
| Yuvarlak SSOT | `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-g1"] = 567` |
| WAV | `media-bake/academy/audio/01_office_ai/01_office_ai-g1.wav` |
| Yayın MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-g1.mp3` |
| Timings | 14 nefes dilimi 1:1 |
| Cue saatleri | Bake parçasından kilitlendi |
| DB | `--no-db` |
| Yedek model | Yok (`--no-fallback`) |

`officeAiMasteryModule.estimatedTotalMinutes` timings toplamından türetilir: **81.74** (kurs 4904.433 sn). Senkron tam.

---

## 5. Test

```
npx vitest run tests/academy/office-ai-lesson-g1.test.ts tests/academy/gmail-workspace.test.ts tests/academy/sealed-duration-band.test.ts
```

**3 dosya, 12 test, yeşil.**

Yan tarama (Gmail yüzey, prompt dock, pratik tohum, fonetik, office-win-fit, nefes): **6 dosya, 26 test, yeşil.** Toplam **9 dosya, 38 test, yeşil.**

Yeni kilitler `office-ai-lesson-g1.test.ts` ve `gmail-workspace.test.ts` içinde:

- Sebep → Eylem → Sonuç / neden ChatGPT’ye kopyalanmaz / kim-ne-ne zaman neden kilitlenir / neden yerleşik panel / atlanmış kapı
- Slogan yasağı: kahramanlıktır, vaadi nettir, hamal değilsin, iki ayrı kader, üç eşleşmeyi ezberle, Baraj yetmiştir, doygun ayağı
- `ACADEMY_GMAIL_GEMINI_PROMPT` ve Gönderen | İş | Son tarih kilit durur
- 567.2 cue-timings-karaoke senkronu; reconstruct harf düşürmez
- 16:9 + Gmail `height: 100%` + tuval `#122033` + Gemini paneli `#152536` + dolgun satır/kart renkleri + prompt dock sahne dışında
- Active word `font-weight: inherit`; descender padding durur

---

## 6. Tarayıcı

Dev sunucu `http://localhost:3000` açıktı. `/academy/01_office_ai/oyna` oturum istedi (`/login?next=/academy/01_office_ai/oyna`). Super Admin saha gözlemi: giriş sonrası 16:9 sahnede Gmail tuvali, cue-03’te TAŞIMA SU (ChatGPT yapıştırma, kutu kopuk), cue-04’te Gemini şeridi (özet spoiler kapalı), cue-05/06 split’te sol taşıma su / sağ yerleşik aksiyon kartları, karaoke bandında `g / y / ş / p` kesilmemeli.

Kod sözleşmesi vitest ile kilitli; oturumlu uçtan uca tıklama bu pakette yok.

---

## Damga

**RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)**

Ders 7 vatandaş dilinde, 16:9 Gmail gelen kutusu + Gemini sağ paneli sahnesinde, mühürlü karaoke ile yayın bandındadır. Sıradaki kapı 8. derstir: Word ve uzun doküman — ataş, yerinde analiz, imza insanda.
