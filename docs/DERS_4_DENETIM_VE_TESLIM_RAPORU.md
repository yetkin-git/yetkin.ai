# DERS 4 DENETİM VE TESLİM RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-3` — Sunum Fabrikası: Metinden Slayta |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO — Ders 4 nihai denetim ve rafa yerleştirme |
| Damga | **RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)** |
| Üretim DB | Bağlanılmadı (`--no-db`) |

---

## Yönetici özeti

Ders 4 brifing tebliği gibi duruyordu: «canavar evcilleştir», «saniyeler içinde etkileyici görsel anlatı», «fikirlerin mimarısın», «hikâye anlatma sanatı», «üç altın kural». Kural söyleniyor, **neden** anlatılmıyordu. Gözde’nin saha diline çekildi.

Üç pedagoji kilidi artık kaset, cue ve compact makalede duruyor:

1. **Neden slayta düz metin yığını doldurulmaz?** Dinleyici okumaya başlar, seni dinlemeyi bırakır. İlk üç saniye mesajı göstermezse toplantı kaybedilir.
2. **Tek fikir kuralı nedir?** Her slayt yalnızca bir vurucu mesaj taşır; on madde taşımaz.
3. **AI yönlendirmesiyle slayt taslağı nasıl alınır?** Rol ver, slayt başına tek fikir iste, görsel yönlendirmeyi parantezde tarif et. Copilot şeridi veya pptx ataş; Gamma/Marp ana yol değildir.

Mühürlü kaset **575.6 sn** (önce 527 sn). Bant **420–720 yeşil**. Ana TTS modeli yedeğe inmedi (`gemini-3.1-flash-tts-preview`). Yuvarlak SSOT `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-3"] = 576`. Kurs timings toplamı **4821.986 sn = 80.37 dk**; `officeAiMasteryModule.estimatedTotalMinutes` aynı sayıyı okur.

Görsel sapma kapatıldı: Prompt Terminalindeki reji notu (`Biten sunumu henüz açma`) öğrenci isteminden çıktı. 16:9 tuval ve KPI kartları dikey ezilmez.

---

## 1. Pedagoji ve vatandaş dili

**İlke:** Slogan yok. **Sebep → Eylem → Sonuç.** Gözde sahadan konuşur.

**Kod SSOT:**

- `lib/academy/spoken-scripts/01_office_ai-3.md` (14 paragraf)
- `lib/academy/curricula/office_ai/section_3.ts` (1242 kelime; önce 1126)
- `lib/academy/lesson-cues/01_office_ai-3.json`
- `lib/academy/lesson-audio-timings/01_office_ai-3.json`

Punchcard sırası değişmedi: GİRİŞ KÖPRÜSÜ · HOŞ GELDİN · ŞABLON KAOSU · SLAYT İSTE · HİYERARŞİ · FARK ORTADA · CEBİNE KOY · SIRA SENDE. Cue paragraf haritası `[1, 2, 2, 2, 2, 2, 1, 2]`.

### Eski metin (slogan) ↔ yeni metin (vatandaş dili)

| # | Punchcard | Eski metin (slogan / brifing) | Yeni metin (sebep → eylem → sonuç) |
|---|-----------|-------------------------------|-------------------------------------|
| 1 | GİRİŞ KÖPRÜSÜ | «harika bir rapor, doğru bir görsel dille aktarılmadıkça hak ettiği etkiyi yaratamaz.» (neden yok) | «Peki neden hâlâ slayta geçmiyoruz? Çünkü yönetici özeti masada kalsa bile toplantı slaytsız yürümez.» |
| 2 | HOŞ GELDİN | «yazar fırınına» · «canavarlarından birini evcilleştireceğiz» · «saniyeler içinde etkileyici bir görsel anlatıya» | «Peki neden sunum hazırlamak bu kadar zaman yer? Çünkü çoğu kişi önce şablonu süsler; mesajı sona bırakır. Bugün o sırayı çevireceğiz: önce tek fikir, sonra slayt taslağı.» |
| 3 | HOŞ GELDİN | «fikirlerin mimarısın ve stratejistsin» · tasarımı «tamamen algoritmalara devret» | «Peki neden tasarımı önce bitirmeye çalışmayız? Çünkü sen grafiker değilsin; sen fikrin sahibisin.» |
| 4 | ŞABLON KAOSU | Şablon kaosu tarif; neden yok. | «Peki neden şablon avı saatleri yer? Çünkü biçim içeriğin önüne geçer; anlatının özü dağılır.» |
| 5 | ŞABLON KAOSU | «önceliğimiz süsleme değil, mesajın omurgası» (neden zayıf) | «Peki neden slayta düz metin yığını doldurulmaz? Çünkü insan zihni karmaşadan hızla uzaklaşır; dinleyici okumaya başlar, seni dinlemeyi bırakır.» |
| 6 | SLAYT İSTE | Komut tarifi (tek fikir kuralının nedeni yok). | «Peki yapay zekâdan slayt taslağı nasıl alınır?» · «Peki tek fikir kuralı nedir? Her slayt yalnızca bir vurucu mesaj taşır; on madde taşımaz.» |
| 7 | SLAYT İSTE | «içerik mimarisi de o kadar kusursuz olacaktır» | «Neden? Çünkü yapay zekâ yalnız metin yazarsa taslak yine duvar olur.» Mimarisi «net olur». |
| 8 | HİYERARŞİ | «tamamen algı yönetimidir» | «Peki neden sol taraf yorar da sağ taraf tutar? Çünkü tek fikir slaytta yerini gösterir; yığın ise her şeyi aynı anda bağırır.» |
| 9 | HİYERARŞİ | «Bilgi aktarımı işte tam olarak böyle zahmetsiz hale gelir.» | «Böylece hem mesaj üç saniyede iner hem de sen konuşmayı bırakmazsın.» |
| 10 | FARK ORTADA | «Gördüğün gibi fark ortada.» · «amatör ve dağınık» | «Peki neden fark bu kadar belirgin? … Sol taraf her cümleyi taşır, bakış noktası yoktur. Sağ taraf tek başlık ve üç odak taşır, toplantı yürür.» |
| 11 | FARK ORTADA | «Sunum yapmak görsel boğuşma değil, etkili bir hikâye anlatma sanatıdır.» | «Çünkü slayt senin yerini almaz; senin sözünü taşır.» |
| 12 | CEBİNE KOY | Üç altın kural emir cümlesi (neden yok) · «keyifli bir üretime» | Her adımın arkasına sebep: (1) dinleyici on madde okursa seni dinlemez. (2) yön yoksa taslak yine metin duvarı basar. (3) aktarırken madde şişerse hiyerarşi bozulur. |
| 13 | SIRA SENDE | «çok basit ama etkisi büyük» | «Çıkan slaytta on madde görürsen metni masaya koyma; tek fikre indir.» |
| 14 | SIRA SENDE | 5. ders köprüsü (slayt kilidi belirsiz). | «Slaytı o sayı kilitlenmeden yayınlama.» İstisnalar ve Hata Avı köprüsü durur. |

### Bilinçli olarak duran cümleler

Bunlar slogan değil, ölçülebilir kural veya istemdir:

- İstem: `Bu düz metni slayt başına tek fikir ve görsel yönlendirme ile taslağa çevir. Copilot varsa şeride yaz; yoksa pptx ataşla.`
- KPI kilit: `54.650 TL` / `Kaya Gıda A.Ş.` / `%15 Riskli Vade`
- Ekranda `PowerPoint`, `Copilot`, `VBA`, `Gamma`; seste `Pauer Point`, `Kopilot`, `Ve be a`, `Gama`
- `Kod yok` (ses) / `Kod yazdırmazsın` (makale) · `VBA makrosu bu derste yoktur`
- `5. ders` / `İstisnalar ve Hata Avı` / `E-Posta Akışı`

Anlatım köprüleri: «Şimdi mantığı oturtalım.» · «Peki neden …?» · «Neden?» · «Böylece hem … hem de …»

---

## 2. Görsel ve workspace

| Kontrol | Durum |
|---------|--------|
| 16:9 sahne (`aspect-ratio: 16 / 9`) | Durur. `.academy-pptx-canvas` `object-fit: contain`, `height: auto`. |
| Tuval wrap | `.academy-pptx-canvas-wrap` `align-items: center` — çerçeve dikey ezilmez. |
| KPI kartları | `.academy-pptx-kpi` `min-height: 4.35rem`; compare pane `min-height: 3.7rem`. |
| ÖNCE / SONRA | `ÖNCE (DÜZ METİN YIĞINI)` / `SONRA (GÖRSEL HİYERARŞİLİ SLAYT - AI)` — cue-05/06 split. |
| KPI kilit | Toplam **54.650 TL**, lider **Kaya Gıda A.Ş.**, risk **%15 Riskli Vade**. Eylem bandı: Yıldız Tekstil takibi. |
| İstem | `ACADEMY_OFFICE_AI_3_COPILOT_PROMPT` cue-04 Copilot’ta kilitli. Reji notu (`Biten sunumu henüz açma`) çıktı. |
| Prompt Terminali | Sahne dışında / dock (`below-transport`). |

Kod: `lib/academy/lesson-beat-visual.ts`, `lib/academy/cinema-cue-catalog.ts`, `lib/academy/pptx-workspace.ts`, `components/academy/lesson-pptx-workspace.tsx`, `app/globals.css`.

---

## 3. Karaoke ve altyazı

| Kilit | Kanıt |
|-------|--------|
| Cue ↔ timings | 8 rozet start/end, parça zarflarıyla birebir |
| Kaset sonu | cue-08 `end` = timings son parça = karaoke şerit sonu = **575.6** |
| Harf düşmez | Her şerit satırı tokenize → reconstruct, normalize metinle eşit |
| Layout shift yok | `.academy-player-karaoke-word` ve `[data-state="active"]` → `font-weight: inherit` |
| Descender kesilmez (`g, y, ş, p`) | Kelime `overflow: visible`; `padding-block: 0.08em 0.22em`; satır `line-height: 1.5` |
| Ekran / ses | Overlay cue gövdesi (`PowerPoint`, `Copilot`, `VBA`, `Gamma`); TTS fonetiği (`Pauer Point`, `Kopilot`, `Ve be a`, `Gama`) |

Cue saatleri:

| Cue | Rozet | Start | End |
|-----|--------|-------|-----|
| cue-01 | GİRİŞ KÖPRÜSÜ | 2.00 | 49.24 |
| cue-02 | HOŞ GELDİN | 49.64 | 133.00 |
| cue-03 | ŞABLON KAOSU | 133.40 | 208.08 |
| cue-04 | SLAYT İSTE | 208.48 | 301.00 |
| cue-05 | HİYERARŞİ | 301.40 | 384.52 |
| cue-06 | FARK ORTADA | 384.92 | 459.80 |
| cue-07 | CEBİNE KOY | 460.20 | 512.56 |
| cue-08 | SIRA SENDE | 512.96 | **575.60** |

Nefes: 14 paragraf → 14 parça. `pauseSec` 0.40. SLAYT İSTE dilimi tek fikir kuralını ve görsel yönlendirmeyi taşır.

---

## 4. Mühürleme ve süre bandı

Dry-run:

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-3
```

| Ölçüt | Sonuç |
|-------|--------|
| Paragraf | 14 |
| Nefes isteği | 14 (hedef 10–12, tavan 15; mühürlü ders tavanında) |
| Ses | Callirrhoe |
| Model | `gemini-3.1-flash-tts-preview` |
| Harici API (dry-run) | Yok |

Canlı mühür:

```
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-3
```

| Ölçüt | Sonuç |
|-------|--------|
| Süre | **575.6 sn** (önce 527) |
| Bant | 420–720 **yeşil** |
| `cacheV` | 575600 |
| Yuvarlak SSOT | `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-3"] = 576` |
| Yedek model | İnmedi |
| WAV | `media-bake/academy/audio/01_office_ai/01_office_ai-3.wav` (575.6 s, 55.3 MB) |
| Yayın MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-3.mp3` |
| Timings | 14 nefes dilimi 1:1 |
| Cue saatleri | Bake parçasından kilitlendi |
| DB | `--no-db` |

`officeAiMasteryModule.estimatedTotalMinutes` timings toplamından türetilir: **80.37** (kurs 4821.986 sn). Senkron tam.

---

## 5. Test

```
npx vitest run tests/academy/office-ai-lesson-3.test.ts tests/academy/pptx-workspace.test.ts tests/academy/sealed-duration-band.test.ts
```

**3 dosya, 16 test, yeşil.**

Yan tarama (mühür, karaoke şerit, nefes, Dron punchcard, ordinal, Prompt Terminali, Excel/pptx yüzey): **7 dosya, 36 test, yeşil.**

Yeni kilitler `office-ai-lesson-3.test.ts` ve `pptx-workspace.test.ts` içinde:

- Sebep → Eylem → Sonuç / düz metin yığını nedenselliği / tek fikir kuralı / slayt taslağı yönlendirmesi
- `ACADEMY_OFFICE_AI_3_COPILOT_PROMPT` reji notu yok; KPI 54.650 TL durur
- 575.6 cue-timings-karaoke senkronu; reconstruct harf düşürmez
- 16:9 + `object-fit: contain` + KPI `min-height` + prompt dock sahne dışında
- Active word `font-weight: inherit`; descender padding durur

---

## 6. Tarayıcı

Dev sunucu `http://localhost:3000` açıktı. `/academy/01_office_ai/oyna` oturum istedi (`/login?next=…`). Super Admin saha gözlemi: giriş sonrası 16:9 sahnede PowerPoint tuvali, cue-04’te reji notsuz istem, cue-06 split’te sağ panel 54.650 TL / Kaya Gıda / %15, karaoke bandında `g / y / ş / p` kesilmemeli.

Kod sözleşmesi vitest ile kilitli; oturumlu uçtan uca tıklama bu pakette yok.

---

## Damga

**RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)**

Ders 4 vatandaş dilinde, 16:9 PowerPoint sahnesinde, mühürlü karaoke ile yayın bandındadır. Sıradaki kapı 5. derstir: İstisnalar ve Hata Avı — akıcı slaytın arkasındaki uydurma sayı.
