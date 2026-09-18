# DERS 2 DENETİM VE TESLİM RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-k1` — KVKK, Şirket Sırları ve Maskeleme: Ne Yüklenmez? |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO — Ders 2 nihai denetim ve rafa yerleştirme |
| Damga | **RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)** |
| Üretim DB | Bağlanılmadı (`--no-db`) |

---

## Yönetici özeti

Ders 2 metin reformu (Sebep → Eylem → Sonuç) kaset, cue ve compact makalede duruyor. «Üç satır yeter» artık slogan değil: bin kişilik gerçek listenin neden gerekmediğinin nedensel anlatımı.

Mühürlü kaset **677.56 sn**. Bant **420–720 yeşil**. Yuvarlak SSOT `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-k1"] = 678`. Kurs timings toplamı **4731.946 sn = 78.87 dk**; `officeAiMasteryModule.estimatedTotalMinutes` aynı sayıyı okur.

Denetimde bir görsel sapma kapatıldı: ham ızgarada bayrak `D3` (ürün) yerine **A2 / B2 / C2** (Ad, Telefon, IBAN); sağ panel `A.K.` yerine Gözde’nin takma değerlerini basar (`Müşteri A`, `MASKELİ_IBAN`, `MASKELİ_TELEFON`). Karaoke cue saatleri kasetle birebir; kelime birleşimi harf düşürmez.

---

## 1. Pedagoji ve vatandaş dili

**İlke:** Slogan yok. **Sebep → Eylem → Sonuç.** Gözde sahadan konuşur.

**Kod SSOT:**

- `lib/academy/spoken-scripts/01_office_ai-k1.md` (14 paragraf)
- `lib/academy/curricula/office_ai/section_k1.ts` (1248 kelime)
- `lib/academy/lesson-cues/01_office_ai-k1.json`
- `lib/academy/lesson-audio-timings/01_office_ai-k1.json`

Punchcard sırası değişmedi: GİRİŞ KÖPRÜSÜ · HOŞ GELDİN · YASAK LİSTE · MASKELE · ÜÇÜNCÜ KAPI · FARK ORTADA · CEBİNE KOY · SIRA SENDE. Cue paragraf haritası `[1, 2, 2, 2, 2, 2, 1, 2]`.

### Üç satır örneği — nedensellik yerinde

MASKELE (cue-04) ve ÜÇÜNCÜ KAPI (cue-05) şu zinciri basar:

1. **Sebep:** Satırı silersen model sütun mantığını da kaybeder; bin gerçek satır modeli daha zeki yapmaz, yalnızca daha fazla insanı açıkta bırakır.
2. **Eylem:** Sütun başlıkları + üç örnek, sahte satır. Ayşe Kaya → Müşteri A; IBAN → MASKELİ_IBAN.
3. **Sonuç:** Aynı özeti alırsın; gerçek ad, soyad ve IBAN sohbete girmez.

Eski slogan (`Bu örnek ezber slogan değil, masada tekrarlanan eldir.`) konuşma metninde yok.

### Bilinçli olarak duran cümleler

Bunlar slogan değil, ölçülebilir kural veya istemdir:

- İstem: `Bu üç satır maskelidir. Ad yok, telefon yok. Sütun adları Ürün, Adet, Bölge…`
- Takma değerler: `Müşteri A`, `MASKELİ_IBAN`, `MASKELİ_TELEFON`, `MASKELİ_MAAŞ`
- Ekranda `KVKK`; seste `Kavekaka`
- `Sınav bu derste açılmaz` / `Sıradaki kapı rapordur`

Anlatım köprüleri: «Şimdi mantığı oturtalım.» · «Peki neden …?» · «Neden?» · «Böylece hem … hem de …»

---

## 2. Görsel ve workspace

| Kontrol | Durum |
|---------|--------|
| 16:9 sahne (`aspect-ratio: 16 / 9`) | Durur. Prompt Terminali sahne dışında / dock. |
| Ham ızgara | `Ad / Telefon / IBAN / Ürün` — Ayşe Kaya, `0532…`, `TR12…7890`. Tam IBAN yok. |
| PII bayrağı | `A2` Ad, `B2` Telefon, `C2` IBAN. Önce `D3` (ürün) yanlış işaretliydi. |
| Maskeli kısa özet | Üç satır: Müşteri A/B/C + Bölge/Ürün/Adet. Not satırı: `MASKELİ_IBAN`, `MASKELİ_TELEFON`. |
| Kontrast | Ham PII pembe (`#fce4ec` / `#9b1c1c`). Takma değer yeşil mühür (`#d4f7ea` / `#0b4f3a`). |
| ÖNCE / SONRA | `HAM YAPIŞTIRMA (AÇIK KİMLİK)` / `MASKELİ KISA ÖZET (3. KAPI)` — cue-06 split. |
| Excel penceresi dikey ezilme | Compare pane `.academy-excel-desk` ve `.academy-excel-win` **height: 100%**. |
| İstem | `ACADEMY_KVKK_COPILOT_PROMPT` cue-04/05 Copilot ve Beat 3 dock’ta kilitli. |

Kod: `lib/academy/kvkk-workspace.ts`, `components/academy/lesson-excel-workspace.tsx`, `app/globals.css`, `lib/academy/cinema-cue-catalog.ts`.

Nano Banana kareleri (`public/academy/cinema/01_office_ai-k1-cue-*.jpg`) plaka / fallback’tir. İzlemede canlı waiter SSOT okunur; cue-06 JPG hâlâ eski `A.K.` ızgarasını taşır, sahne ise Müşteri A basar. Canlı kaset bu pakette yeniden çizilmedi.

---

## 3. Karaoke ve altyazı

| Kilit | Kanıt |
|-------|--------|
| Cue ↔ timings | 8 rozet start/end, parça zarflarıyla birebir |
| Kaset sonu | cue-08 `end` = timings son parça = karaoke şerit sonu = **677.56** |
| Harf düşmez | Her şerit satırı tokenize → reconstruct, normalize metinle eşit |
| Layout shift yok | `.academy-player-karaoke-word` ve `[data-state="active"]` → `font-weight: inherit` |
| Descender kesilmez (`g, y, ş, p`) | Kelime `overflow: visible`; `padding-block: 0.08em 0.22em`; satır `line-height: 1.5` |
| Ekran / ses | Overlay cue gövdesi (`KVKK`, `MASKELİ_IBAN`); TTS fonetiği (`Kavekaka`, `MASKELİ IBAN`) |

Cue saatleri:

| Cue | Rozet | Start | End |
|-----|--------|-------|-----|
| cue-01 | GİRİŞ KÖPRÜSÜ | 2.00 | 43.32 |
| cue-02 | HOŞ GELDİN | 43.72 | 122.64 |
| cue-03 | YASAK LİSTE | 123.04 | 207.48 |
| cue-04 | MASKELE | 207.88 | 391.84 |
| cue-05 | ÜÇÜNCÜ KAPI | 392.24 | 487.76 |
| cue-06 | FARK ORTADA | 488.16 | 560.56 |
| cue-07 | CEBİNE KOY | 560.96 | 605.48 |
| cue-08 | SIRA SENDE | 605.88 | **677.56** |

Nefes: 14 paragraf → 15 parça (cue-04 ilk paragraf iki dilim). `pauseSec` 0.40. MASKELE dilimi «üç satır yeter» cümlesini taşır.

---

## 4. Mühürleme ve süre bandı

| Ölçüt | Sonuç |
|-------|--------|
| Süre | **677.56 sn** |
| Bant | 420–720 **yeşil** |
| `cacheV` | 677560 |
| Yuvarlak SSOT | `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-k1"] = 678` |
| Yayın MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-k1.mp3` |
| Timings | 15 nefes dilimi; son `end` 677.56 |
| Kurs | 4731.946 sn = **78.87** dk |

Bu pakette yeni Gemini mühürü yok; mevcut 677.56 kaset onaylandı.

---

## 5. Test

```
npx vitest run tests/academy/office-ai-lesson-k1.test.ts tests/academy/sealed-duration-band.test.ts
```

**2 dosya, 10 test, yeşil.**

Yan tarama (Excel ızgara, karaoke şerit, göz katmanı, müfredat yüzeyi): **4 dosya, 25 test, yeşil.**

Yeni kilitler `office-ai-lesson-k1.test.ts` içinde:

- Sebep → Eylem → Sonuç / üç satır nedenselliği
- `FLAG_CELLS = A2, B2, C2` ve takma değer ızgarası
- 677.56 cue-timings-karaoke senkronu; reconstruct harf düşürmez

---

## 6. Tarayıcı

Dev sunucu `http://localhost:3000` açıktı. `/academy/01_office_ai/oyna` oturum istedi (`/login?next=…`). Super Admin saha gözlemi: giriş sonrası 16:9 sahnede ham PII pembe bayrak (Ad / Telefon / IBAN), cue-06 split’te sağ panel Müşteri A + MASKELİ_IBAN / MASKELİ_TELEFON yeşil mühür, karaoke bandında `g / y / ş / p` kesilmemeli.

Kod sözleşmesi vitest ile kilitli; oturumlu uçtan uca tıklama bu pakette yok.

---

## Damga

**RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)**

Ders 2 vatandaş dilinde, 16:9 maske sahnesinde, mühürlü karaoke ile yayın bandındadır. Sıradaki kapı 3. derstir: temiz ve maskeli tablodan üç maddelik yönetim özeti.
