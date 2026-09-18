# DERS 3 DENETİM VE TESLİM RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-2` — Rapor Otomasyonu: Tablodan Yönetim Özetine |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO — Ders 3 nihai denetim ve rafa yerleştirme |
| Damga | **RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)** |
| Üretim DB | Bağlanılmadı (`--no-db`) |

---

## Yönetici özeti

Ders 3 brifing tebliği gibi duruyordu: «büyü burada başlıyor», «krizi fırsata çevir», «vazgeçilmez ekip üyesi». Kural söyleniyor, **neden** anlatılmıyordu. Gözde’nin saha diline çekildi.

İki pedagoji kilidi artık kaset, cue ve compact makalede duruyor:

1. **Neden üç madde?** Yönetici yirmi dakikada on sayfa okumaz; sayfa sayısı bilgi taşımaz.
2. **Sayı nasıl kilitlenir?** Tahmin ettirmezsin; hücreden aldırırsın. Uydurma yüzde yasaktır.

Mühürlü kaset **553.84 sn** (önce 512.4 sn). Bant **420–720 yeşil**. Ana TTS modeli yedeğe inmedi (`gemini-3.1-flash-tts-preview`). Yuvarlak SSOT `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-2"] = 554`. Kurs timings toplamı **4773.386 sn = 79.56 dk**; `officeAiMasteryModule.estimatedTotalMinutes` aynı sayıyı okur.

Görsel sapma kapatıldı: Prompt Terminalindeki reji notu (`Temiz özet panelini henüz açma`) öğrenci isteminden çıktı. Sağ panel KPI sayıları tahsilat ızgarasıyla kilitli (54.650 = 12.450+8.200+3.400+9.100+21.500).

---

## 1. Pedagoji ve vatandaş dili

**İlke:** Slogan yok. **Sebep → Eylem → Sonuç.** Gözde sahadan konuşur.

**Kod SSOT:**

- `lib/academy/spoken-scripts/01_office_ai-2.md` (14 paragraf)
- `lib/academy/curricula/office_ai/section_2.ts` (1208 kelime; önce 1130)
- `lib/academy/lesson-cues/01_office_ai-2.json`
- `lib/academy/lesson-audio-timings/01_office_ai-2.json`

Punchcard sırası değişmedi: GİRİŞ KÖPRÜSÜ · HOŞ GELDİN · UZUN RAPOR · ÖZET İSTE · KARAR NOTU · FARK ORTADA · CEBİNE KOY · SIRA SENDE. Cue paragraf haritası `[1, 2, 2, 2, 2, 2, 1, 2]`.

### Eski metin (slogan) ↔ yeni metin (vatandaş dili)

| # | Punchcard | Eski metin (slogan / brifing) | Yeni metin (sebep → eylem → sonuç) |
|---|-----------|-------------------------------|-------------------------------------|
| 1 | GİRİŞ KÖPRÜSÜ | «Artık … tamamen hazırsın.» | «Peki neden hâlâ rapora geçmiyoruz? Çünkü temiz ve maskeli tablo, tek başına yöneticinin sorusunu cevaplamaz.» |
| 2 | HOŞ GELDİN | «saniyeler içinde doğrudan karar aldırıcı bir yönetim diline çevirmeyi öğreneceksin.» | «Peki neden üç maddelik yönetim özeti isteriz de on sayfalık dökümü yazdırmayız? Çünkü yöneticinin yirmi dakikası vardır.» |
| 3 | HOŞ GELDİN | «bu krizi birkaç dakikada fırsata dönüştürebilirsin.» | «Paniklemek yerine temiz tablonu doğru komutla vereceksin. Böylece hem yirmi dakikaya sığarsın hem de yöneticin satır avına düşmez.» |
| 4 | UZUN RAPOR | «uzun rapor hazırlamak artık bir başarı değil, ciddi bir zaman kaybıdır.» | «Peki neden uzun rapor bir başarı sayılmaz? … Sayfa sayısı bilgi taşımaz; üç net madde taşır.» |
| 5 | UZUN RAPOR | «seni bu yorucu ve verimsiz rapor yazma döngüsünden sonsuza kadar tamamen kurtarmak.» | «Amacımız seni bu yorucu döngüden çıkarmak: satır satır anlatmak yerine, üç maddeyle karar aldırmak.» |
| 6 | ÖZET İSTE | «alelade bir özetleme komutu vermek kesinlikle işe yaramaz» (neden yok). | «Neden? Çünkü her şeyi özetle dersen model dolgu üretir; üç madde yerine gevezelik basar.» |
| 7 | ÖZET İSTE | Rol + üç madde (sayı kilidi yok). | «Peki yapay zekâ uydurmasın diye sayıları nasıl kilitleriz? Sayıyı tahmin ettirmezsin; hücreden aldırırsın. … Uydurma yüzde ekleme.» |
| 8 | KARAR NOTU | «İşte büyü tam da burada başlıyor.» | Büyü cümlesi kapalı. «Peki neden karar notu gözlem cümlesinden ayrı durur? Çünkü gözlem tabloyu anlatır; karar notu onay, arama veya yön ister.» |
| 9 | KARAR NOTU | «profesyonel düzeyde yapay zekâ kullanmanın yarattığı asıl fark» | «Neden? Çünkü her sayı kaynak hücreyle kilitlenmiştir; model akıcı diye yüzde uyduramaz. Fark sihir değildir.» |
| 10 | FARK ORTADA | «muazzam kontrast her şeyi açıkça kanıtlıyor» | «Peki neden fark bu kadar belirgin? … Sol taraf her satırı taşır, karar yoktur. Sağ taraf üç madde ve bir eylem cümlesi taşır.» |
| 11 | FARK ORTADA | «stratejik düşünen vazgeçilmez bir ekip üyesine dönüştürür.» | «Çünkü büyük resmi üç maddede görürsün; toplantıda satır avına düşmezsin.» |
| 12 | CEBİNE KOY | Üç adım emir cümlesi (neden yok). | Her adımın arkasına sebep: (1) yönetici önce büyüklüğü duyar. (2) sayı hücreden; uydurma yüzde yasak. (3) gözlem yetmez, karar notu olmadan toplantı yürümez. |
| 13 | SIRA SENDE | «eski rapor yazma yöntemlerine bir daha asla geri dönmek istemeyeceksin.» | «Çıkan her sayıyı kaynak hücreyle karşılaştır. Uydurma yüzde görürsen metni masaya koyma.» |
| 14 | SIRA SENDE | Slayt köprüsü (grafik yasağı belirsiz). | «Grafik vaadi bu derste yoktur.» Sunum Fabrikası / 4. ders köprüsü durur. |

### Bilinçli olarak duran cümleler

Bunlar slogan değil, ölçülebilir kural veya istemdir:

- İstem: `Bu temiz tablodan toplamı ve trendi söyle. Tam üç maddelik yönetici özeti ve tek karar cümlesi yaz. Sayıları tablodaki hücrelerden al. Uydurma yüzde ekleme.`
- KPI kilit: `54.650` / `8.200` / `9.100` (tahsilat satır toplamı)
- Ekranda `KVKK`, `A1 hücresi`; seste `Kavekaka`, `A bir hücresi`
- `Grafik vaadi bu derste yoktur` / `Sunum Fabrikası` / `4. ders`

Anlatım köprüleri: «Şimdi mantığı oturtalım.» · «Peki neden …?» · «Neden?» · «Böylece hem … hem de …»

---

## 2. Görsel ve workspace

| Kontrol | Durum |
|---------|--------|
| 16:9 sahne (`aspect-ratio: 16 / 9`) | Durur. Prompt Terminali sahne dışında / dock (`below-transport`). |
| Özet rapor paneli | Cue-05/06 sağ panel: `Madde / Kaynak sayı / Not`. Word chrome (`Yonetici_Ozeti.docx`). |
| KPI kilit | Toplam **54.650**, Risk **8.200**, Açık **9.100**, Karar «Bugün Demir'i ara». Kaynak ızgara: Kaya 12.450 + Demir 8.200 + Pınar 3.400 + Yıldız 9.100 + Kaya 21.500. |
| ÖNCE / SONRA | `ÖNCE (10 SAYFALIK DÖKÜM)` / `SONRA (3 MADDELİK YÖNETİM ÖZETİ - AI)` — cue-05/06 split. |
| Excel penceresi dikey ezilme | Compare pane `.academy-excel-desk` ve `.academy-excel-win` **height: 100%**. |
| KPI kartları (slayt CSS) | `.academy-player-compare-pane .academy-pptx-kpi` `min-height: 3.7rem` — 4. ders sahnesi ezilmez; bu derste özet tablo durur. |
| İstem | `ACADEMY_OFFICE_AI_2_COPILOT_PROMPT` cue-04 Copilot’ta kilitli. Reji notu (`henüz açma`) çıktı. Canlı not: «Üç madde iste. Sayıları hücreden al. Uydurma yüzde yok.» |

Kod: `lib/academy/lesson-beat-visual.ts`, `lib/academy/cinema-cue-catalog.ts`, `components/academy/lesson-excel-workspace.tsx`, `app/globals.css`.

---

## 3. Karaoke ve altyazı

| Kilit | Kanıt |
|-------|--------|
| Cue ↔ timings | 8 rozet start/end, parça zarflarıyla birebir |
| Kaset sonu | cue-08 `end` = timings son parça = karaoke şerit sonu = **553.84** |
| Harf düşmez | Her şerit satırı tokenize → reconstruct, normalize metinle eşit |
| Layout shift yok | `.academy-player-karaoke-word` ve `[data-state="active"]` → `font-weight: inherit` |
| Descender kesilmez (`g, y, ş, p`) | Kelime `overflow: visible`; `padding-block: 0.08em 0.22em`; satır `line-height: 1.5` |
| Ekran / ses | Overlay cue gövdesi (`KVKK`, `A1 hücresi`); TTS fonetiği (`Kavekaka`, `A bir hücresi`) |

Cue saatleri:

| Cue | Rozet | Start | End |
|-----|--------|-------|-----|
| cue-01 | GİRİŞ KÖPRÜSÜ | 2.00 | 51.60 |
| cue-02 | HOŞ GELDİN | 52.00 | 132.60 |
| cue-03 | UZUN RAPOR | 133.00 | 208.88 |
| cue-04 | ÖZET İSTE | 209.28 | 287.60 |
| cue-05 | KARAR NOTU | 288.00 | 365.80 |
| cue-06 | FARK ORTADA | 366.20 | 432.96 |
| cue-07 | CEBİNE KOY | 433.36 | 484.48 |
| cue-08 | SIRA SENDE | 484.88 | **553.84** |

Nefes: 14 paragraf → 14 parça. `pauseSec` 0.40. ÖZET İSTE dilimi sayı kilidini taşır.

---

## 4. Mühürleme ve süre bandı

Dry-run:

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-2
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
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-2
```

| Ölçüt | Sonuç |
|-------|--------|
| Süre | **553.84 sn** (önce 512.4) |
| Bant | 420–720 **yeşil** |
| `cacheV` | 553840 |
| Yuvarlak SSOT | `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-2"] = 554` |
| Yedek model | İnmedi |
| WAV | `media-bake/academy/audio/01_office_ai/01_office_ai-2.wav` (553.8 s, 53.2 MB) |
| Yayın MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-2.mp3` |
| Timings | 14 nefes dilimi 1:1 |
| Cue saatleri | Bake parçasından kilitlendi |
| DB | `--no-db` |

`officeAiMasteryModule.estimatedTotalMinutes` timings toplamından türetilir: **79.56** (kurs 4773.386 sn). Senkron tam.

---

## 5. Test

```
npx vitest run tests/academy/office-ai-lesson-2.test.ts tests/academy/sealed-duration-band.test.ts
```

**2 dosya, 11 test, yeşil.**

Yan tarama (mühür, kelime, karaoke şerit, Excel ızgara, zoom, müfredat yüzeyi): **8 dosya, 41 test, yeşil.**

Yeni kilitler `office-ai-lesson-2.test.ts` içinde:

- Sebep → Eylem → Sonuç / üç madde nedenselliği / hücreden sayı kilidi
- `ACADEMY_OFFICE_AI_2_COPILOT_PROMPT` ve KPI 54.650 = tahsilat toplamı
- 553.84 cue-timings-karaoke senkronu; reconstruct harf düşürmez
- 16:9 + compare pane `height: 100%` + prompt dock sahne dışında

---

## 6. Tarayıcı

Dev sunucu `http://localhost:3000` açıktı. `/academy/01_office_ai/oyna` oturum istedi (`/login?next=…`). Super Admin saha gözlemi: giriş sonrası 16:9 sahnede tahsilat ızgarası, cue-04’te sayı kilitli istem, cue-06 split’te sağ panel 54.650 / 8.200 / 9.100, karaoke bandında `g / y / ş / p` kesilmemeli.

Kod sözleşmesi vitest ile kilitli; oturumlu uçtan uca tıklama bu pakette yok.

---

## Damga

**RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)**

Ders 3 vatandaş dilinde, 16:9 özet sahnesinde, mühürlü karaoke ile yayın bandındadır. Sıradaki kapı 4. derstir: Sunum Fabrikası — metinden slayta.
