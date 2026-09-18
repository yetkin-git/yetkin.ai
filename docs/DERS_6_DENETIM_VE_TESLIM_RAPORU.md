# DERS 6 DENETİM VE TESLİM RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-4` — E-Posta Akışı: Gelen Kutusu Sıfırlama |
| Vatandaş sıra | 6 / 9 |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO — Ders 6 nihai denetim ve rafa yerleştirme |
| Damga | **RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)** |
| Üretim DB | Bağlanılmadı (`--no-db`) |

---

## Yönetici özeti

Ders 6 brifing tebliği gibi duruyordu: «arkana yaslan, ilişki tamamen değişecek», «en büyük kabus», «akıllı bir asistan hayal et», «güvenlik ve yönlendirme görevlisi», «stratejik hamle», «kontrol hissi tavan yapar», «muazzam dönüşüm», «üç altın kural». Kural söyleniyor, **neden** anlatılmıyordu. Gözde’nin saha diline çekildi.

Üç pedagoji kilidi artık kaset, cue ve compact makalede duruyor:

1. **Gelen kutu neden şişer?** Her yeni satır aynı yığında durur; ödeme, bülten ve davet birbirine girer. Etiket yoksa her satır acil gibi durur.
2. **Mail triyajı nedir?** Gelen her iletiyi açmadan önce acil, aksiyon veya arşivlik diye ayırmaktır. Etiket yoksa taslak yalandır.
3. **AI’ya neden taslak yazdırılır ve insan onayı olmadan gönderilmez?** Boş ekrana bakıp cümle kurmak dakikaları yer; model nezaket üretir, taahhüt üretemez. Yanlış tarih veya fiyat şirketi bağlar.

Mühürlü kaset **443.56 sn** (önce 496.12 sn). Bant **420–720 yeşil**. Yuvarlak SSOT `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-4"] = 444`. Kurs timings toplamı **4866.273 sn = 81.10 dk**; `officeAiMasteryModule.estimatedTotalMinutes` aynı sayıyı okur.

Görsel kilit durur: canlı Outlook 16:9 sahnede, 142 okunmamış yığın, Copilot yanıt şeridi, SIFIR KUTU üç grup kartı (kırmızı / sarı / yeşil). Karaoke aktif kelime `font-weight: inherit`; descender kesilmez.

---

## 1. Pedagoji ve vatandaş dili

**İlke:** Slogan yok. **Sebep → Eylem → Sonuç.** Gözde sahadan konuşur.

**Kod SSOT:**

- `lib/academy/spoken-scripts/01_office_ai-4.md` (14 paragraf, 824 kelime)
- `lib/academy/curricula/office_ai/section_4.ts` (683 kelime; önce 510)
- `lib/academy/lesson-cues/01_office_ai-4.json`
- `lib/academy/lesson-audio-timings/01_office_ai-4.json`

Punchcard sırası değişmedi: GİRİŞ KÖPRÜSÜ · HOŞ GELDİN · INBOX KAOSU · TASLAK YAZ · SIFIR KUTU · FARK ORTADA · CEBİNE KOY · SIRA SENDE. Cue paragraf haritası `[1, 2, 2, 2, 2, 2, 1, 2]`.

### Eski metin (slogan) ↔ yeni metin (vatandaş dili)

| # | Punchcard | Eski metin (slogan / brifing) | Yeni metin (sebep → eylem → sonuç) |
|---|-----------|-------------------------------|-------------------------------------|
| 1 | GİRİŞ KÖPRÜSÜ | «Zihnindeki bu süzgeç bakışını şimdi iletişim kanallarına taşımaya hazırsın.» (neden yok) | «Peki neden hâlâ Gmail kapısına geçmiyoruz? Çünkü gelen kutu sıfırlanmadan yerleşik paneli ezberlemek, aynı yığını daha hızlı açmak demektir.» |
| 2 | HOŞ GELDİN | «Hazırsan arkana yaslan, çünkü bugünden sonra e-postalarınla kurduğun ilişki tamamen değişecek.» | «Peki neden gelen kutu şişer? Çünkü her yeni satır aynı yığında durur; ödeme, bülten ve davet birbirine girer.» |
| 3 | HOŞ GELDİN | «Modern ofis çalışanının en büyük kabusu» · «akıllı bir filtrenin henüz sistemine entegre edilmemiş olması» | «Peki neden bu yığın odak yer? Çünkü etiket yoksa her satır acil gibi durur; acil gibi duran her satır da aslında hiçbirini acil bırakmaz.» |
| 4 | INBOX KAOSU | «akıllı bir asistan hayal et» | «Peki mail triyajı nedir? Gelen her iletiyi açmadan önce acil, aksiyon veya arşivlik diye ayırmaktır.» |
| 5 | INBOX KAOSU | «güvenlik ve yönlendirme görevlisi» · «stratejik hamlenin ilk komutu» | «Yapay zekâ süzgeçtir, gönderen değil.» «Neden? Çünkü model sınıflandırır; sen karar verirsin.» |
| 6 | TASLAK YAZ | Taslak tarifi; neden zayıf | «Peki yapay zekâya neden taslak yanıt yazdırılır? Çünkü boş ekrana bakıp cümle kurmak dakikaları yer; model tonu ve talebi çözer, sen tarihi ve vaadi kilitlersin.» |
| 7 | TASLAK YAZ | «iletişim hızın katlanırken zihinsel yorgunluğun da hızla hafiflemeye başlar» | «Peki taslak insan onayı verilmeden neden gönderilmez? Çünkü model nezaket üretir, taahhüt üretemez; yanlış tarih, yanlış fiyat veya yanlış vaat şirketi bağlar.» |
| 8 | SIFIR KUTU | «devesa uçurum» · «kayıp projeler ve geciken yanıtlar havada uçuşuyor» | Sol 142 okunmamış yığın; sağ sıfır kutu. «Sıfır kutu sihir değildir. Arşiv, silmek değildir.» |
| 9 | SIFIR KUTU | «zihinsel ferahlığının bir göstergesi» · «bunaltıcı karmaşadan kurtardı» | «Peki neden sol taraf yorar da sağ taraf ferahlar? Çünkü 142 okunmamış satır her bakışta yeniden triyaj ister.» |
| 10 | FARK ORTADA | «profesyonel hayatın nasıl hızlandığını görüyorsun» | «Peki neden fark bu kadar belirgin? Çünkü etiket yoksa taslak kördür. İnsan onayı yoksa taslak şirketi bağlar.» |
| 11 | FARK ORTADA | «kontrol hissi tavan yapar» · «muazzam dönüşüm» | «Fark panel markası değil, çalışma yöntemidir.» Okunmamış iletiler seni yönetmez. |
| 12 | CEBİNE KOY | «üç altın kural» emir cümlesi (neden yok) | Her adımın arkasına sebep: (1) etiket yoksa ödeme kaybolur. (2) model taahhüt üretemez. (3) arşiv silmek değildir. |
| 13 | SIRA SENDE | «ferahlığı hisset» · «enerji kattığını göreceksin» | «Taslağı göndermeden oku.» Beş ileti etiketle, iki taslak doğrula, işi biteni arşive al. |
| 14 | SIRA SENDE | Köprü duruyordu. | «İnsan onayı olmadan kutu sıfırlanmaz.» Gmail ve Gemini kapısı durur. |

### Bilinçli olarak duran cümleler

Bunlar slogan değil, ölçülebilir kural veya istemdir:

- İstem: `Gelen kutumdaki okunmamış mailleri tara. Sadece bugün ödeme/onay bekleyenleri ACIL etiketiyle bana getir, bültenleri arşive kaldır.`
- KPI kilit: sol **142** okunmamış; sağ **0**; cari **Kaya Gıda A.Ş.** / **54.650 TL**
- SIFIR KUTU kartları: `ACİL AKSİYON` · `TAKİPTE / BEKLEYEN` · `OTOMATİK ARŞİVLENDİ`
- Ekran: `Copilot`, `Gemini`; Ses: `Kopilot`, `Cemini` (fonetik harita)
- `Microsoft Copilot lisansın varsa` · `Gemini eklentisini aç` · `yerleşik panele yazılır`
- `Hata Avı` köprüsü önceki kasetten; bu kaset `etiket` / `taslak` / `insan onayı` / `arşiv`

Anlatım köprüleri: «Peki neden …?» · «Neden?» · «Peki mail triyajı nedir?» · «Şimdi ekranı ikiye bölelim.»

---

## 2. Görsel ve Outlook workspace

| Kontrol | Durum |
|---------|--------|
| 16:9 sahne (`aspect-ratio: 16 / 9`) | Durur. `.academy-player-karaoke .academy-player-widescreen` |
| Outlook penceresi ezilmez | `.academy-player-waiter .academy-outlook-win` ve desk `office-win-fit` `height: 100%` |
| Gelen kutusu (ÖNCE) | 142 okunmamış dump; satır zemin `#163250`, okunmamış `#1b3d63`, başlık `#7dd3fc` |
| Siyah ekran yok | `.academy-outlook-canvas` zemin `#0b1220` (navy); `#000` yasak kilitli |
| Copilot yanıt şeridi | cue-04 `LessonOfficeCopilotRibbon` + `LessonAiDesk`; `hideReply: true` (spoiler kapalı) |
| SIFIR KUTU kartları | `ACİL AKSİYON` `#3f1a22` · `TAKİPTE / BEKLEYEN` `#3d3010` · `OTOMATİK ARŞİVLENDİ` `#12382f` |
| Split | cue-05/06: `ÖNCE (142 OKUNMAMIŞ MAİL)` / `SONRA (SIFIRLANMIŞ KUTU - AI)` |
| Prompt Terminali | Sahne dışında / dock (`below-transport`) |
| 05:30 | cue-06 hâlâ FARK ORTADA; sağ panel 3 grup kartı, 142 satır listesi yok |

Kod: `lib/academy/outlook-workspace.ts`, `lib/academy/lesson-beat-visual.ts`, `lib/academy/cinema-cue-catalog.ts`, `components/academy/lesson-outlook-workspace.tsx`, `app/globals.css`.

Sinema karesi (`public/academy/cinema/01_office_ai-4-cue-*.jpg`) krem storyboard posteridir; canlı sahne CSS Outlook tuvalidir (`academyVisualCinematicFrameSrc` bu derste `null`). Poster siyah değildir; canlı ızgara posterden okunmaz.

---

## 3. Karaoke ve altyazı

| Kilit | Kanıt |
|-------|--------|
| Cue ↔ timings | 8 rozet start/end, parça zarflarıyla birebir |
| Kaset sonu | cue-08 `end` = timings son parça = karaoke şerit sonu = **443.56** |
| Harf düşmez | Her şerit satırı tokenize → reconstruct, normalize metinle eşit |
| Layout shift yok | `.academy-player-karaoke-word` ve `[data-state="active"]` → `font-weight: inherit` |
| Descender kesilmez (`g, y, ş, p`) | Kelime `overflow: visible`; `padding-block: 0.08em 0.22em`; satır `line-height: 1.5` |
| Ekran / ses | Overlay cue gövdesi (`Copilot`, `Gemini`); TTS fonetiği (`Kopilot`, `Cemini`) |

Cue saatleri:

| Cue | Rozet | Start | End |
|-----|--------|-------|-----|
| cue-01 | GİRİŞ KÖPRÜSÜ | 2.00 | 37.36 |
| cue-02 | HOŞ GELDİN | 37.76 | 102.80 |
| cue-03 | INBOX KAOSU | 103.20 | 167.96 |
| cue-04 | TASLAK YAZ | 168.36 | 238.56 |
| cue-05 | SIFIR KUTU | 238.96 | 300.52 |
| cue-06 | FARK ORTADA | 300.92 | 357.52 |
| cue-07 | CEBİNE KOY | 357.92 | 391.60 |
| cue-08 | SIRA SENDE | 392.00 | **443.56** |

Nefes: 14 paragraf → 14 parça. `pauseSec` 0.40. TASLAK YAZ dilimi «neden taslak yazdırılır» ve «neden gönderilmez» zincirini taşır.

---

## 4. Mühürleme ve süre bandı

Dry-run:

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-4
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
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-4
```

| Ölçüt | Sonuç |
|-------|--------|
| Süre | **443.56 sn** (önce 496.12) |
| Bant | 420–720 **yeşil** |
| `cacheV` | 443560 |
| Yuvarlak SSOT | `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-4"] = 444` |
| WAV | `media-bake/academy/audio/01_office_ai/01_office_ai-4.wav` |
| Yayın MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-4.mp3` |
| Timings | 14 nefes dilimi 1:1 |
| Cue saatleri | Bake parçasından kilitlendi |
| DB | `--no-db` |
| Yedek model | Yok (`--no-fallback`) |

`officeAiMasteryModule.estimatedTotalMinutes` timings toplamından türetilir: **81.10** (kurs 4866.273 sn). Senkron tam.

---

## 5. Test

```
npx vitest run tests/academy/office-ai-lesson-4.test.ts tests/academy/outlook-workspace.test.ts tests/academy/sealed-duration-band.test.ts
```

**3 dosya, 15 test, yeşil.**

Yan tarama (karaoke şerit, nefes, AI masa / Copilot şeridi): **3 dosya, 11 test, yeşil.** Toplam **6 dosya, 26 test, yeşil.**

Yeni kilitler `office-ai-lesson-4.test.ts` içinde:

- Sebep → Eylem → Sonuç / gelen kutu neden şişer / mail triyajı nedir / taslak neden yazdırılır / insan onayı olmadan neden gönderilmez
- Slogan yasağı: üç altın kural, arkana yaslan, akıllı asistan hayal, güvenlik görevlisi, tavan yapar, muazzam dönüşüm
- `ACADEMY_OUTLOOK_COPILOT_PROMPT` ve 142 / 0 kilit durur
- 443.56 cue-timings-karaoke senkronu; reconstruct harf düşürmez
- 16:9 + Outlook `height: 100%` + dolgun satır/kart renkleri + Copilot şeridi + prompt dock sahne dışında
- Active word `font-weight: inherit`; descender padding durur

---

## 6. Tarayıcı

Dev sunucu `http://localhost:3000` açıktı. `/academy/01_office_ai/oyna` oturum istedi (`/login?next=…`). Super Admin saha gözlemi: giriş sonrası 16:9 sahnede Outlook tuvali, cue-03’te 142 okunmamış yığın, cue-04’te Copilot şeridi (taslak spoiler kapalı), cue-05/06 split’te sol 142 / sağ üç grup kartı, karaoke bandında `g / y / ş / p` kesilmemeli.

Kod sözleşmesi vitest ile kilitli; oturumlu uçtan uca tıklama bu pakette yok.

---

## Damga

**RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)**

Ders 6 vatandaş dilinde, 16:9 Outlook gelen kutusu sahnesinde, mühürlü karaoke ile yayın bandındadır. Sıradaki kapı 7. derstir: Gmail ve Gemini — aynı ritüel, yerleşik panel, aksiyon listesi (kim, ne, ne zaman).
