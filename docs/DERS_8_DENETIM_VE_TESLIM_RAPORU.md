# DERS 8 DENETİM VE TESLİM RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-w1` — Word ve Uzun Doküman Analizi: Sözleşme, Dilekçe, Rapor |
| Vatandaş sıra | 8 / 9 |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO — Ders 8 nihai denetim ve rafa yerleştirme |
| Damga | **RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)** |
| Üretim DB | Bağlanılmadı (`--no-db`) |

---

## Yönetici özeti

Ders 8 sloganla kilitleniyordu: «vaadi üç iştir», «kahraman gibi hissettirir», «kahramanlığı bitirir», «hamal gibi», «Fark sihir değil», «iki kader üretir», «Baraj yetmiştir». Kural söyleniyor, **neden** anlatılmıyordu. «Öğretmen SEN, belge SIZ» çift sicili compact makalede duruyordu; kaset bunu **neden** diye açmıyordu. Gözde’nin saha diline çekildi.

Üç pedagoji kilidi artık kaset, cue ve compact makalede duruyor:

1. **Neden uzun dokümanı satır satır okutmak yerine riskli maddeleri aratırız?** Satır satır okutunca yığın çıkar. Ceza oranı sayfa dörtte, fesih sayfa on birde, gizlilik başka yerde kalır. Şirket aleyhine olan yer o üç maddedir.
2. **Neden resmi belgede öğretmen SEN, belge SIZ?** Kulağa SEN gider; kâğıda SIZ yazılır. Öğretmen sıcak konuşur. Dilekçe resmî durur. Model sen diye yazarsa taslak resmî SIZ’a çevrilir. Unvan, tarih, sayı, imza insandadır.
3. **Neden ataş varsayılan kapıdır, parça parça kopya değil?** Kopyalanan sayfa dosyadan kopar. Ataş dosyayı yerinde bırakır. Üç iş, üç istem, tek kapı.

Mühürlü kaset **567 sn** (önce 521.44 sn). Bant **420–720 yeşil**. Yuvarlak SSOT `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-w1"] = 567`. Kurs timings toplamı **4949.993 sn = 82.5 dk**; `officeAiMasteryModule.estimatedTotalMinutes` aynı sayıyı okur.

Görsel kilit durur: canlı Word 16:9 sahnede, `.docx` ataş çipi ve riskli madde kartları ezilmeden oturur. Tuval `#122033` (navy; `#000` yasak). Split: sol ZAHMETLİ YOL / PARÇA PARÇA METİN KOPYALAMA, sağ DOĞRUDAN DOSYA YÜKLEME / YERİNDE DOKÜMAN ANALİZİ. Karaoke aktif kelime `font-weight: inherit`; descender kesilmez.

---

## 1. Pedagoji ve vatandaş dili

**İlke:** Slogan yok. **Sebep → Eylem → Sonuç.** Gözde sahadan konuşur.

**Kod SSOT:**

- `lib/academy/spoken-scripts/01_office_ai-w1.md` (14 paragraf, 1027 kelime)
- `lib/academy/curricula/office_ai/section_w1.ts` (623 kelime; önce 492)
- `lib/academy/lesson-cues/01_office_ai-w1.json`
- `lib/academy/lesson-audio-timings/01_office_ai-w1.json`

Punchcard sırası değişmedi: GİRİŞ KÖPRÜSÜ · HOŞ GELDİN · PARÇA PARÇA · ATAŞ YÜKLE · YERİNDE ANALİZ · FARK ORTADA · CEBİNE KOY · SIRA SENDE. Cue paragraf haritası `[1, 2, 2, 3, 2, 2, 1, 1]`.

### Eski metin (slogan) ↔ yeni metin (vatandaş dili)

| # | Punchcard | Eski metin (slogan / brifing) | Yeni metin (sebep → eylem → sonuç) |
|---|-----------|-------------------------------|-------------------------------------|
| 1 | GİRİŞ KÖPRÜSÜ | «Bu dersin vaadi üç iştir» · hamallık yasağı | «Peki neden uzun sözleşmeyi yapay zekâya satır satır okutmak yerine riskli maddeleri aratırız? Çünkü satır satır okutunca yığın çıkar.» |
| 2 | HOŞ GELDİN | Yöntem tarif; neden yok | «Peki neden tüm dokümanı kopyalamak varsayılan yol değildir? Çünkü kopyalanan sayfa dosyadan kopar; ceza maddesi bir yerde, fesih başka yerde kalır.» |
| 3 | HOŞ GELDİN | Üç madde listesi; neden aratılır yok | «Peki neden otuz sayfayı satır satır okutmak yerine bu üç maddeyi aratırız? Çünkü şirket aleyhine olan yer orasıdır; geri kalan yığın imza riskini göstermez.» |
| 4 | PARÇA PARÇA | Atlanmış kapı tarifi; neden zayıf | «Peki neden bu atlanmış kapıdır, yasak listesi değil? Çünkü model yarım cümle görür. Ceza oranını kaçırır.» |
| 5 | PARÇA PARÇA | «kahraman gibi hissettirir» · «kahramanlığı bitirir» | «Peki neden sayfa dördü alıp sayfa on biri unutmak işi bitirmez? Çünkü model yarım görür.» Ataş kopukluğu kapatır. |
| 6 | ATAŞ YÜKLE | Komut tarifi; neden taşıma | «Peki neden tüm metni taşımazsın? Çünkü komut ataşa gider; satır satır kopya dosyayı senden koparır.» |
| 7 | YERİNDE ANALİZ | Dilekçe tarifi; SEN/SIZ kaset dışındaydı | «Peki resmî belge yazılırken neden öğretmen sen, belge siz çift sicili durur? Çünkü kulağına sen derim; kâğıda siz yazılır.» Hitap örneği: Sayın Yetkili… arz ederiz. |
| 8 | YERİNDE ANALİZ | Gözlem/karar emri | «Peki neden gözlem ile karar notunu aynı cümlede karıştırmazsın? Çünkü gözlem cümlesi tabloyu özetler; karar notu onay, bütçe veya yön ister.» |
| 9 | FARK ORTADA | «hamal gibi» · «Fark sihir değil» · «iki kader» · «Baraj yetmiştir» | «Peki neden fark bu kadar belirgin? Çünkü ataş dosyayı senden koparmaz; satır satır kopya koparır.» İki sonuç: kopuk parça / yerinde analiz. |
| 10 | CEBİNE KOY | Üç adım emir cümlesi (neden yok) | Her adımın arkasına sebep: (1) satır satır okutmak riskli maddeyi kaçırır. (2) tek istem üç işi yığar. (3) model taslak yazar, mühür basmaz. |
| 11 | SIRA SENDE | «Satın alma belge basmaz» · «Tebrikler» | Çift sicil kapanışı: «Öğretmen sen konuşur; belge siz durur.» Baraj 70 durur. İmza sende kalır. |

### Bilinçli olarak duran cümleler

Bunlar slogan değil, ölçülebilir kural veya istemdir:

- İstem: `Yüklediğim sözleşme dosyasını (.docx) baştan sona incele. Şirketimiz aleyhine olabilecek cezai şart maddelerini, fesih koşullarını ve gizlilik yükümlülüklerini liste halinde özetle. Sayfa numarası yaz. Uydurma madde ekleme.`
- KPI / dosya: **Sozlesme_Kaya_Gida.docx** · cezai şart / fesih / gizlilik · **Sayın Yetkili… arz ederiz.**
- Kartlar: `CEZAİ ŞART` · `DİLEKÇE HİTAP` · `RAPOR MADDESİ`
- Ekran: `Copilot`, `Gemini`, `Word`, `docx`; Ses: `Kopilot`, `Cemini`, `Vörd`, `docx` (fonetik harita)
- `atlanmış kapı` (yasak listesi değil) · `zahmetli yol` · `öğretmen sen, belge siz`
- `Dosyayı ataşla` · `Üç işi ayrı iste` · `İmzayı kendin at`
- `Baraj 70` (ölçülebilir kilit; «Baraj yetmiştir» kasette yoktur)

Anlatım köprüleri: «Peki neden …?» · «Peki resmî belge yazılırken neden öğretmen sen, belge siz çift sicili durur?» · «Şimdi ekranı ikiye bölelim.»

---

## 2. Görsel ve Word workspace

| Kontrol | Durum |
|---------|--------|
| 16:9 sahne (`aspect-ratio: 16 / 9`) | Durur. `.academy-player-karaoke .academy-player-widescreen` |
| Word penceresi ezilmez | `.academy-player-waiter .academy-outlook-win` ve desk `office-win-fit` `height: 100%` |
| `.docx` ataş penceresi | cue-04 `LessonOfficeCopilotRibbon` + `LessonAiDesk`; `hideReply: true` (spoiler kapalı); ataş çipi `#34d399` |
| Riskli madde kartları | `CEZAİ ŞART` `#3f1a22` · `DİLEKÇE HİTAP` `#3d3010` · `RAPOR MADDESİ` `#12382f`; canlı sahnede `min-height: 3.1rem` |
| Siyah ekran yok | Word tuval `#122033` (navy); kopya paneli aynı; `#000` yasak kilitli |
| Split | cue-05/06: `ZAHMETLİ YOL / PARÇA PARÇA METİN KOPYALAMA` / `DOĞRUDAN DOSYA YÜKLEME / YERİNDE DOKÜMAN ANALİZİ` |
| Prompt Terminali | Sahne dışında / dock (`below-transport`) |

Kod: `lib/academy/word-workspace.ts`, `lib/academy/lesson-beat-visual.ts`, `lib/academy/cinema-cue-catalog.ts`, `components/academy/lesson-word-workspace.tsx`, `app/globals.css`. Yeni kilit dosyası: `tests/academy/word-workspace.test.ts`.

Sinema karesi (`public/academy/cinema/01_office_ai-w1-cue-*.jpg`) krem storyboard posteridir; canlı sahne CSS Word tuvalidir (`academyVisualCinematicFrameSrc` bu derste `null`). Poster siyah değildir; canlı ızgara posterden okunmaz.

---

## 3. Karaoke ve altyazı

| Kilit | Kanıt |
|-------|--------|
| Cue ↔ timings | 8 rozet start/end, parça zarflarıyla birebir |
| Kaset sonu | cue-08 `end` = timings son parça = karaoke şerit sonu = **567** |
| Harf düşmez | Her şerit satırı tokenize → reconstruct, normalize metinle eşit |
| Layout shift yok | `.academy-player-karaoke-word` ve `[data-state="active"]` → `font-weight: inherit` |
| Descender kesilmez (`g, y, ş, p`) | Kelime `overflow: visible`; `padding-block: 0.08em 0.22em`; satır `line-height: 1.5` |
| Ekran / ses | Overlay cue gövdesi (`Word`, `Copilot`, `Gemini`); TTS fonetiği (`Vörd`, `Kopilot`, `Cemini`) |

Cue saatleri:

| Cue | Rozet | Start | End |
|-----|--------|-------|-----|
| cue-01 | GİRİŞ KÖPRÜSÜ | 2.00 | 44.68 |
| cue-02 | HOŞ GELDİN | 45.08 | 150.40 |
| cue-03 | PARÇA PARÇA | 150.80 | 213.60 |
| cue-04 | ATAŞ YÜKLE | 214.00 | 276.96 |
| cue-05 | YERİNDE ANALİZ | 277.36 | 384.56 |
| cue-06 | FARK ORTADA | 384.96 | 475.76 |
| cue-07 | CEBİNE KOY | 476.16 | 523.96 |
| cue-08 | SIRA SENDE | 524.36 | **567.00** |

Nefes: 14 paragraf → 14 parça. `pauseSec` 0.40. YERİNDE ANALİZ dilimi «öğretmen sen, belge siz» zincirini taşır.

---

## 4. Mühürleme ve süre bandı

Dry-run:

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-w1
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
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-w1
```

| Ölçüt | Sonuç |
|-------|--------|
| Süre | **567 sn** (önce 521.44) |
| Bant | 420–720 **yeşil** |
| `cacheV` | 567000 |
| Yuvarlak SSOT | `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-w1"] = 567` |
| WAV | `media-bake/academy/audio/01_office_ai/01_office_ai-w1.wav` |
| Yayın MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-w1.mp3` |
| Timings | 14 nefes dilimi 1:1 |
| Cue saatleri | Bake parçasından kilitlendi |
| DB | `--no-db` |
| Yedek model | Yok (`--no-fallback`) |

`officeAiMasteryModule.estimatedTotalMinutes` timings toplamından türetilir: **82.5** (kurs 4949.993 sn). Senkron tam.

---

## 5. Test

```
npx vitest run tests/academy/office-ai-lesson-w1.test.ts tests/academy/word-workspace.test.ts tests/academy/sealed-duration-band.test.ts
```

**3 dosya, 13 test, yeşil.**

Yeni kilitler `office-ai-lesson-w1.test.ts` ve `word-workspace.test.ts` içinde:

- Sebep → Eylem → Sonuç / neden satır satır değil riskli madde / neden öğretmen sen belge siz / neden ataş / atlanmış kapı
- Slogan yasağı: vaadi üç iştir, kahraman gibi, kahramanlığı bitirir, hamal gibi, Fark sihir değil, iki kader üretir, Baraj yetmiştir
- `ACADEMY_WORD_UPLOAD_PROMPT` ve Sozlesme_Kaya_Gida.docx kilit durur
- 567 cue-timings-karaoke senkronu; reconstruct harf düşürmez
- 16:9 + Word `height: 100%` + tuval `#122033` + ataş çipi + dolgun madde kartı renkleri + prompt dock sahne dışında
- Active word `font-weight: inherit`; descender padding durur

`word-count-sync` w1 gövdesi **623** ile örtüşür. Dokuz bölüm döngüsü 5. derste önceden duran 1056/1066 kaymasını gösterir; bu pakette 5. derse dokunulmadı.

---

## 6. Tarayıcı

Dev sunucu `http://localhost:3000` açıktı. `/academy/01_office_ai/oyna` oturum istedi (`/login?next=/academy/01_office_ai/oyna`). Super Admin saha gözlemi: giriş sonrası 16:9 sahnede Word tuvali, cue-03’te ZAHMETLİ YOL (sayfa 4 / 11 / 18 kopuk parça), cue-04’te ataş çipi + Copilot şeridi (madde spoiler kapalı), cue-05/06 split’te sol kopya / sağ CEZAİ ŞART · DİLEKÇE HİTAP · RAPOR MADDESİ kartları, karaoke bandında `g / y / ş / p` kesilmemeli.

Kod sözleşmesi vitest ile kilitli; oturumlu uçtan uca tıklama bu pakette yok.

---

## Damga

**RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)**

Ders 8 vatandaş dilinde, 16:9 Word belge tuvali + `.docx` ataş + riskli madde sahnesinde, mühürlü karaoke ile yayın bandındadır. Sıradaki kapı 9. derstir: Haftalık Sistem — Cuma otuzu, sınav kapısı.
