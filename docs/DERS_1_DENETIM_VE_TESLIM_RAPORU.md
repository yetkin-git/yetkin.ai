# DERS 1 DENETİM VE TESLİM RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-1` — Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO — Ders 1 nihai denetim ve rafa yerleştirme |
| Damga | **RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)** |
| Üretim DB | Bağlanılmadı (`--no-db`) |

---

## Yönetici özeti

Ders 1 brifing tebliği gibi duruyordu: kural söyleniyor, **neden** anlatılmıyordu. «Süper güç», «sihirli başlangıç», «enerjini topla», «hafızana kazı» kapalı cümleleri Gözde’nin saha diline çekildi.

Konuşma metni, compact makale ve cue JSON vatandaş dilinde yenilendi. Canlı TTS mühürlendi: **607.28 sn** (önce 571.72 sn). Bant **420–720 yeşil**. Ana TTS modeli yedeğe inmedi (`gemini-3.1-flash-tts-preview`). Kurs timings toplamı **4731.946 sn = 78.87 dk**; `officeAiMasteryModule.estimatedTotalMinutes` aynı sayıyı okur.

Karaoke altyazısında aktif kelime `font-weight: inherit` (faux-bold yok); `g / y / ş / p` için alt padding açıldı. Excel ÖNCE/SONRA panelleri yüzde yüz yükseklikte; şerit 16:9 sahnede ezilmez. Mobil karaoke bandı kısaldı; ızgara dikey ezilmez.

---

## 1. Pedagoji ve vatandaş dili

**İlke:** Slogan yok. **Sebep → Eylem → Sonuç.** Gözde sahadan konuşur.

**Kod SSOT:**

- `lib/academy/spoken-scripts/01_office_ai-1.md` (15 paragraf)
- `lib/academy/curricula/office_ai/section_1.ts` (1344 kelime; önce 1268)
- `lib/academy/lesson-cues/01_office_ai-1.json`
- `lib/academy/lesson-audio-timings/01_office_ai-1.json`

Punchcard sırası değişmedi: GİRİŞ KÖPRÜSÜ · HOŞ GELDİN · DÜZENSİZ TABLO · A1 HÜCRESİ · TEMİZLE ŞİMDİ · FARK ORTADA · CEBİNE KOY · SIRA SENDE. Cue paragraf haritası `[1, 2, 2, 2, 3, 2, 1, 2]`.

### Eski metin (slogan) ↔ yeni metin (vatandaş dili)

| # | Punchcard | Eski metin (slogan / brifing) | Yeni metin (sebep → eylem → sonuç) |
|---|-----------|-------------------------------|-------------------------------------|
| 1 | GİRİŞ KÖPRÜSÜ | «Aslında yapay zekâ ile çalışırken en büyük süper gücün, ona neyi nasıl vereceğini bilmektir.» | «Peki neden bu yığın seni yavaşlatır? Çünkü yapay zekâ, sen ona neyi nasıl vereceğini bilmeden o karmaşayı tek başına çözmez.» |
| 2 | GİRİŞ KÖPRÜSÜ | «Küçük bir bakış açısı değişikliği… dijital ofis asistanın olarak konumlandırmaya hazırlan.» | «Doğru komutu kurarsan, dakikalarca süren el işçiliği düşer. Bu derste yapay zekâyı soru sorulan bir kutu gibi değil, masadaki asistanın gibi kullanmayı adım adım göstereceğiz.» |
| 3 | HOŞ GELDİN | «Hazırsan enerjini topla; çünkü bu dersin sonunda Excel ile arandaki ilişki tamamen değişecek.» | «Hazırsan masaya oturalım; çünkü bu dersin sonunda o tabloyu A1 hücresinden başlayarak konuşturmayı öğreneceksin ve kontrol sende kalacak.» |
| 4 | HOŞ GELDİN | «Kod ezberlemen gerekmez; doğru adımları bilip sistemi akıllıca yönlendirmen yeter.» | «Kod ezberlemen gerekmez. Neden? Çünkü bu işi çözen şey program yazmak değil; tabloyu doğru kapıdan, doğru sırayla vermektir.» |
| 5 | DÜZENSİZ TABLO | «Oysa bu yaklaşım sadece zaman kaybettirir. … tablonun dilini birazcık sadeleştirmemiz yeterli olacak.» | «Oysa bu yaklaşım saatleri yer. Peki neden tek tek hücre düzeltmek yetmez? Çünkü yapay zekâ hücre hücre değil, başlık ve sütun düzenini arar.» |
| 6 | DÜZENSİZ TABLO | «Kör bir fizik yasası değil, ofis hijyenidir.» | «Bu bir sihir değil. Birbirine girmiş hücreler işi yavaşlatır… Şimdi bu karmaşayı kökünden çözecek hamleye, A1 hücresine, odaklanalım.» |
| 7 | A1 HÜCRESİ | «İşte sihirli başlangıç noktamız: A1 hücresi. Bir tablonun kalbi ve pusulası…» | «Şimdi mantığı oturtalım. Neden A1 hücresinden başlıyoruz? Çünkü bir tablonun okunması her zaman en sol üst köşeden kurulur.» |
| 8 | TEMİZLE ŞİMDİ | «Aynı temizleme talimatını hangi kapıya verirsen ver, önce A1 eşiğini kur.» / «Gördüğün gibi son derece doğal, net ve doğrudan.» | «Peki neden A1 eşiğini kurmadan temizleme komutu vermiyoruz? Çünkü hangi kapıya gidersen git, model önce tablonun nereden başladığını arar.» Komut günlük dille yazılıyor; model neyi ayıracağını net duyuyor. |
| 9 | TEMİZLE ŞİMDİ | «Üç Kapı sırası sabittir.» / «Ham tabloyu ekran görüntüsüyle taşımak öğretilen yol değildir.» | «Üç Kapı sırası sabittir, çünkü önce en yerinde yolu denersin.» Ekran görüntüsü öğretilen yol değildir; **çünkü hücreleri bozar ve A1 eşiğini kaybettirir.** |
| 10 | TEMİZLE ŞİMDİ | Tür karmaşası «hayati bir adımdır» (neden yok). | «Neden? Çünkü aynı sütunun içinde hem 1.200 TL, hem 1200, hem bin iki yüz durursa model hangisinin tutar olduğunu karıştırır.» |
| 11 | FARK ORTADA | «Fark o kadar belirgin ki! … masandaki gücü tam olarak budur.» | «Peki neden fark bu kadar belirgin? Çünkü sol taraf karmaşa ve potansiyel hata kaynağıdır; sağ taraf özet tabloya girmeye hazırdır.» |
| 12 | FARK ORTADA | «O adımları hafızana kazımaya hazır mısın?» | «Şimdi o üç adımı cebine koyalım.» |
| 13 | CEBİNE KOY | Üç kural emir cümlesi (neden yok). «Hiçbir veri gözünü korkutamaz.» | Her adımın arkasına sebep: (1) model tablonun nereden başladığını A1 hücresinden okur. (2) satırlar kopmaz, özet bozulmaz. (3) tablo artık konuşur. |
| 14 | SIRA SENDE | «Kendine güven, bu pratiği gün içinde mutlaka tekrar et ve tablonun konuşmasına izin ver.» | «Bu pratiği gün içinde tekrarla; tablonun konuşmasına izin ver.» Kapanış durur: tabloyu temizleme refleksi, KVKK ve maskeleme, 2. derste buluşalım. |

### Bilinçli olarak duran cümleler

Bunlar slogan değil, ölçülebilir kural veya istemdir; tedavi onları açıklayarak korudu:

- İstem: `Sana sunduğum bu ham veri içinde yer alan birleştirilmiş hücreleri tek tek ayır…`
- Üç Kapı sırası (1 şerit / 2 ataş / 3 maskeli kısa özet)
- `özel API` ekranda; seste `ö zel API`
- `Hazırsan 2. derste buluşalım` — görüşmek üzere yok

Anlatım köprüleri: «Şimdi mantığı oturtalım.» · «Peki neden …?» · «Neden?» · «Böylece …»

---

## 2. Görsel ve workspace

| Kontrol | Durum |
|---------|--------|
| 16:9 sahne (`aspect-ratio: 16 / 9`) | Durur. Prompt Terminali sahne dışında. |
| A1 hücresi vurgusu | `highlightCell === "A1"`; yeşil çerçeve + SONRA panelinde cyan glow. |
| ÖNCE / SONRA | `ÖNCE (DÜZENLEMESİZ)` / `SONRA (AI İLE)` — cue-06 split. Vatandaş etiketinde «Kirli» yok. |
| Excel penceresi dikey ezilme | Compare pane `.academy-excel-desk` ve `.academy-excel-win` **height: 100%**. Önce `height: auto` paneli basık bırakabilirdi. |
| Şerit 16:9 uyumu | `.academy-excel-ribbon` `min-height: 1.65rem`, `flex-wrap: nowrap`, yatay kaydırma. Copilot chip şeritten taşmaz. |
| Mobil karaoke vs ızgara | Karaoke bandı 6rem → **4.75rem**; waiter alt inset `+2.1rem` → **`+0.85rem`**. A1 üstte kalır, ızgara 50 px şeridine ezilmez. |

Kod: `app/globals.css`, `components/academy/lesson-excel-workspace.tsx`, `components/academy/lesson-visual-stage.tsx`. Excel ızgara SSOT `lib/academy/excel-workspace.ts` değişmedi (A1 seçim ve ÖNCE/SONRA fonksiyonları zaten kilitliydi).

---

## 3. Karaoke ve tipografi

| Kilit | Kanıt |
|-------|--------|
| Layout shift yok | `.academy-player-karaoke-word` ve `[data-state="active"]` → `font-weight: inherit` (faux-bold yok) |
| Descender kesilmez (`g, y, ş, p`) | Kelime `overflow: visible`; `padding-block: 0.08em 0.22em`; satır `padding-block: 0.18em 0.32em`; `line-height: 1.5` |
| Overlay taşmaz | Overlay `overflow: visible`; satır `max-height: none` (3em tavanı yok) |

Test kilidi: `tests/academy/curriculum-player-surface.test.ts`, `tests/academy/lesson-visual-stage.test.ts`.

---

## 4. Mühürleme ve süre bandı

Dry-run:

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-1
```

| Ölçüt | Sonuç |
|-------|--------|
| Paragraf | 15 |
| Nefes isteği | 15 (hedef 10–12, tavan 15) |
| Ses | Callirrhoe |
| Model | `gemini-3.1-flash-tts-preview` |
| Harici API (dry-run) | Yok |

Canlı mühür:

```
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-1
```

| Ölçüt | Sonuç |
|-------|--------|
| Süre | **607.28 sn** (önce 571.72) |
| Bant | 420–720 **yeşil** |
| `cacheV` | 607280 |
| Yuvarlak SSOT | `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-1"] = 607` |
| Yedek model | İnmedi |
| WAV | `media-bake/academy/audio/01_office_ai/01_office_ai-1.wav` (607.3 s, 58.3 MB) |
| Yayın MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-1.mp3` |
| Timings | 15 nefes dilimi 1:1 |
| Cue saatleri | Bake parçasından kilitlendi |
| DB | `--no-db` |

`officeAiMasteryModule.estimatedTotalMinutes` timings toplamından türetilir: **78.87** (kurs 4731.946 sn). Senkron tam.

Cue-06 FARK ORTADA: **419.00–488.76**. Cue-08 sonu: **607.28**.

---

## 5. Test

```
npx vitest run tests/academy/office-ai-lesson-1.test.ts tests/academy/curriculum-player-surface.test.ts
```

**2 dosya, 13 test, yeşil.**

Yan tarama (mühür, karaoke, zoom, Dron, kelime, nefes, süre bandı): **14 dosya, 62 test, yeşil.**

---

## 6. Tarayıcı

Dev sunucu `http://localhost:3000` açıktı. `/academy/01_office_ai/oyna` oturum istedi (`/login?next=…`). Super Admin saha gözlemi: giriş sonrası 16:9 sahnede A1 ızgarası, ÖNCE/SONRA split (cue-06) ve karaoke bandında `g / y / ş / p` kesilmemeli.

Kod sözleşmesi vitest ile kilitli; oturumlu uçtan uca tıklama bu pakette yok.

---

## Damga

**RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)**

Ders 1 vatandaş dilinde, 16:9 Excel sahnesinde, mühürlü karaoke ile yayın bandındadır. Sıradaki kapı 2. derstir: KVKK ve maskeleme.
