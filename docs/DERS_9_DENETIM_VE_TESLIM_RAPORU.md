# DERS 9 DENETİM VE TESLİM RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-6` — Haftalık Sistem: 30 Dakikalık Rutin |
| Vatandaş sıra | 9 / 9 (amiral kapanış) |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO — Ders 9 nihai denetim, kapanış ve rafa yerleştirme |
| Damga | **RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)** |
| Üretim DB | Bağlanılmadı (`--no-db`) |

---

## Yönetici özeti

Ders 9 sloganla kilitleniyordu: «Tek seferlik kahramanlık değil», «Geçme notu yetmiştir», «kahraman gibi hissettirir», «Haftalık Sistem kahramanlık değil, takvimdir», «Fark süre değil, sıradır», «Baraj yetmiştir», «Satın alma belge basmaz», «Tebrikler». Kural söyleniyor, **neden** anlatılmıyordu. Cuma 30’un 10+10+10 bölünmesi, Sınav Kapısı’nın bu dersten sonra açılması ve Baraj 70 / mühürlü vize kartı Gözde’nin saha diline çekildi.

Üç pedagoji kilidi artık kaset, cue ve compact makalede duruyor:

1. **Neden Cuma otuzu 10+10+10 olarak bölünür?** Excel, slayt ve e-posta üç ayrı kapıdır. Üçü aynı otuz dakikada yığılırsa tablo yarım kalır, slayt uydurma madde üretir, kutu geceye sarkar. Temizlik bitmeden özet uydurur; özet bitmeden kutu sıfırlanmaz.
2. **Neden bu ders bitince Sınav Kapısı açılır?** Mühürlü vize kartı dokuz alışkanlığın hepsini ister; sekiz ders yetmez. Dokuzuncu alışkanlık takvime inmeden kart basılmaz.
3. **Baraj 70 ve mühürlü vize kartı neden durur?** Satın alma o kartı basmaz. Yetmişin altında kart mühürlenmez. Kart, Cuma penceresi kilitlenince ve sınavda yetmişi geçince mühürlenir.

Mühürlü kaset **540.2 sn** (önce 440.393 sn). Bant **420–720 yeşil**. Yuvarlak SSOT `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-6"] = 540`. Kurs timings toplamı **5049.8 sn = 84.16 dk**; `officeAiMasteryModule.estimatedTotalMinutes` aynı sayıyı okur.

Görsel kilit durur: canlı Excel 16:9 sahnede, Cuma 30 tuvali üç bloğu (Excel temizlik, Slayt özet, E-posta sıfırlama) ezilmeden taşır. Cue-08’de **Sınav Kapısı Açıldı** mührü `aspect-ratio: 1 / 1` ile oturur; dikey `scaleY` yok. Karaoke aktif kelime `font-weight: inherit`; descender kesilmez.

Amiral gemisinin 9. ve son dersi rafa girdi. Sınav kapısı bu dersten sonra açılır.

---

## 1. Pedagoji ve vatandaş dili

**İlke:** Slogan yok. **Sebep → Eylem → Sonuç.** Gözde sahadan konuşur.

**Kod SSOT:**

- `lib/academy/spoken-scripts/01_office_ai-6.md` (14 paragraf, 1038 kelime)
- `lib/academy/curricula/office_ai/section_6.ts` (610 kelime; önce 485)
- `lib/academy/lesson-cues/01_office_ai-6.json`
- `lib/academy/lesson-audio-timings/01_office_ai-6.json`

Punchcard sırası değişmedi: GİRİŞ KÖPRÜSÜ · HOŞ GELDİN · DAĞINIK HAFTA · OTUZ DAKİKA · ÜÇ BLOK · FARK ORTADA · CEBİNE KOY · SIRA SENDE. Cue paragraf haritası `[1, 2, 2, 2, 2, 2, 1, 2]`.

### Eski metin (slogan) ↔ yeni metin (vatandaş dili)

| # | Punchcard | Eski metin (slogan / brifing) | Yeni metin (sebep → eylem → sonuç) |
|---|-----------|-------------------------------|-------------------------------------|
| 1 | GİRİŞ KÖPRÜSÜ | «Tek seferlik kahramanlık değil» | «Peki neden her kriz geldiğinde aynı işi baştan kurarsan Cuma akşamı yine yetiştirmeye çalışırsın? Çünkü alışkanlık takvime bağlı değilse kriz her seferinde masayı sıfırlar.» |
| 2 | HOŞ GELDİN | «Bu dersi bitirince sınav kapısı açılır. Geçme notu yetmiştir.» | «Peki neden bu ders bitince sınav kapısı açılır? Çünkü mühürlü vize kartı dokuz alışkanlığın hepsini ister; sekiz ders yetmez. Baraj 70 durur.» |
| 3 | HOŞ GELDİN | On+on+on tarifi; neden yok | «Peki neden Cuma otuzu on artı on artı on olarak bölünür? Çünkü Excel, slayt ve e-posta üç ayrı kapıdır.» Yığılırsa tablo yarım, slayt uydurma, kutu geceye sarkar. |
| 4 | DAĞINIK HAFTA | «kahraman rolüne düşersin» · «kahraman gibi hissettirir» | «Peki neden bu dağınık hafta Cuma akşamı yine boş el bırakır? Çünkü iş üç güne yayılınca aynı tabloyu üç kez taşırsın.» |
| 5 | OTUZ DAKİKA | Komut tarifi; neden 10+10+10 yok | «Peki neden on dakika Excel, on dakika slayt, on dakika e-posta ayrı durur? Çünkü temizlik bitmeden özet uydurur; özet bitmeden kutu sıfırlanmaz.» |
| 6 | ÜÇ BLOK | «Fark süre değil, sıradır» | «Peki neden fark süre değil de sıra gibi durur? Çünkü otuz dakika üç blok olunca haftanın dosyası Cuma öğleden önce kapanır.» |
| 7 | FARK ORTADA | «Haftalık Sistem kahramanlık değil, takvimdir» | «Peki neden fark bu kadar belirgin? Çünkü dağınık hafta her günü yeniden icat eder; Cuma otuzu aynı saati üç kez üst üste korur.» |
| 8 | CEBİNE KOY | Üç adım emir cümlesi (neden yok) | Her adımın arkasına sebep: (1) blok takvimde yoksa kriz Cuma gecesine kayar. (2) ekran görüntüsü tabloyu koparır. (3) ham yapıştırma maskeyi deler. |
| 9 | SIRA SENDE | «Baraj yetmiştir. Satın alma belge basmaz. Tebrikler.» | «Peki neden sınav kapısı yalnız bu dersten sonra açılır? Çünkü mühürlü vize kartı dokuz dersin hepsini ister; satın alma o kartı basmaz. Baraj 70 durur. Yetmişin altında kart mühürlenmez.» |

### Bilinçli olarak duran cümleler

Bunlar slogan değil, ölçülebilir kural veya istemdir:

- İstem: `Cuma otuz dakikalık ofis rutinini üç bloğa böl. İlk on dakika Excel: tabloyu yapay zekâya dosya olarak ver veya Copilot varsa şeritten okut. İkinci on dakika slayt: temiz tablodan üç madde ve bir eylem cümlesi iste. Üçüncü on dakika e-posta: gelen kutundaki işleri aynı pencerede kapat.`
- KPI / dosya: **Cuma_30_Dakika.xlsx** · **Cuma 30** takvim bloğu · 10 Excel temizlik + 10 slayt özet + 10 e-posta sıfırlama
- Kartlar / bloklar: `Excel temizlik` · `Slayt özet` · `E-posta sıfırlama`
- Ekran: `Copilot`, `Gemini`, `Word`, `Excel`; Ses: `Kopilot`, `Cemini`, `Vörd` (fonetik harita)
- `atlanmış kapı` (yasak listesi değil) · `yinelenen bir takvim bloğu`
- `Cuma 30'u takvime yaz` · `10 Excel + 10 slayt + 10 kutu` · `Maskeli kısa son çare`
- `Baraj 70` (ölçülebilir kilit; «Baraj yetmiştir» ve «Geçme notu yetmiştir» kasette yoktur)
- `Sınav Kapısı Açıldı` (cue-08 mührü; «Sınav Köprüsü» yoktur)

Anlatım köprüleri: «Peki neden …?» · «Peki neden bu ders bitince sınav kapısı açılır?» · «Peki neden Cuma otuzu on artı on artı on olarak bölünür?»

---

## 2. Görsel ve Capstone Workspace

| Kontrol | Durum |
|---------|--------|
| 16:9 sahne (`aspect-ratio: 16 / 9`) | Durur. `.academy-player-karaoke .academy-player-widescreen` |
| Excel penceresi ezilmez | `.academy-player-waiter > .academy-excel-desk` ve `.academy-excel-desk--weekly .academy-excel-win` `height: 100%` |
| Üç ana blok | Sağ panel / sistem tablosu: `Excel temizlik` · `Slayt özet` · `E-posta sıfırlama` (g1/w1 satırları tuvalden çıktı) |
| Sınav Kapısı Açıldı mührü | cue-08 `SIRA SENDE`; `data-academy-exam-gate-seal="opened"`; `aspect-ratio: 1 / 1`; `scaleY` yok |
| Mühür descender | Başlık `overflow: visible`; `padding-block: 0.08em 0.22em` (`ş, g, p, y` kesilmez) |
| Split | cue-05/06: `DAĞINIK HAFTA (KRİZ TEKRARI)` / `CUMA OTUZ (SİSTEMLİ RUTİN)` |
| Prompt Terminali | Sahne dışında / dock (`below-transport`) |
| Spoiler | cue-04 `hideReply: true`; sistemli Cuma tablosu Beat 3’e kadar kapalı |

Kod: `lib/academy/weekly-routine-workspace.ts`, `lib/academy/lesson-beat-visual.ts`, `lib/academy/cinema-cue-catalog.ts`, `components/academy/lesson-excel-workspace.tsx`, `app/globals.css`.

Sinema karesi (`public/academy/cinema/01_office_ai-6-cue-*.jpg`) krem storyboard posteridir; canlı sahne CSS Excel tuvalidir. Poster siyah değildir; canlı ızgara posterden okunmaz.

---

## 3. Karaoke ve altyazı

| Kilit | Kanıt |
|-------|--------|
| Cue ↔ timings | 8 rozet start/end, parça zarflarıyla birebir |
| Kaset sonu | cue-08 `end` = timings son parça = karaoke şerit sonu = **540.2** |
| Harf düşmez | Her şerit satırı tokenize → reconstruct, normalize metinle eşit |
| Layout shift yok | `.academy-player-karaoke-word` ve `[data-state="active"]` → `font-weight: inherit` |
| Descender kesilmez (`g, y, ş, p`) | Kelime `overflow: visible`; `padding-block: 0.08em 0.22em`; satır `line-height: 1.5` |
| Ekran / ses | Overlay cue gövdesi (`Word`, `Copilot`, `Gemini`); TTS fonetiği (`Vörd`, `Kopilot`, `Cemini`) |

Cue saatleri:

| Cue | Rozet | Start | End |
|-----|--------|-------|-----|
| cue-01 | GİRİŞ KÖPRÜSÜ | 2.00 | 42.04 |
| cue-02 | HOŞ GELDİN | 42.44 | 124.72 |
| cue-03 | DAĞINIK HAFTA | 125.12 | 210.04 |
| cue-04 | OTUZ DAKİKA | 210.44 | 288.04 |
| cue-05 | ÜÇ BLOK | 288.44 | 353.88 |
| cue-06 | FARK ORTADA | 354.28 | 415.00 |
| cue-07 | CEBİNE KOY | 415.40 | 470.52 |
| cue-08 | SIRA SENDE | 470.92 | **540.20** |

Nefes: 14 paragraf → 14 parça. `pauseSec` 0.40. HOŞ GELDİN dilimi «neden 10+10+10» ve «neden sınav kapısı bu dersten sonra» zincirini taşır. SIRA SENDE dilimi mühürlü vize kartı ve Baraj 70 kapanışını taşır.

---

## 4. Mühürleme ve süre bandı

Dry-run:

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-6
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
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-6
```

| Ölçüt | Sonuç |
|-------|--------|
| Süre | **540.2 sn** (önce 440.393) |
| Bant | 420–720 **yeşil** |
| `cacheV` | 540200 |
| Yuvarlak SSOT | `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-6"] = 540` |
| WAV | `media-bake/academy/audio/01_office_ai/01_office_ai-6.wav` |
| Yayın MP3 | `public/media/academy/audio/01_office_ai/01_office_ai-6.mp3` |
| Timings | 14 nefes dilimi 1:1 |
| Cue saatleri | Bake parçasından kilitlendi |
| DB | `--no-db` |
| Yedek model | Yok (`--no-fallback`) |

`officeAiMasteryModule.estimatedTotalMinutes` timings toplamından türetilir: **84.16** (kurs 5049.8 sn). Senkron tam.

---

## 5. Sınav Kapısı ve amiral mühür kilitleri

| Kilit | Durum |
|-------|--------|
| Mini sınav barajı | `passScore: 70` (`q_off_l6_1` · `q_off_l6_2` · `q_off_l6_3`) |
| Satın alma sertifika basmaz | `exam-flow`: SETTLED + müfredat bitmeden GET/POST 403 |
| 69 ve altı | Sertifika yok |
| Müfredat bitmeden kapı | `Sınav kapısı müfredat tamamlanınca açılır` |
| Dock | `isAcademyPlayerExamReady` 9/9 mühürlenince yeşil; `data-academy-exam-launch` |
| Cue-08 mühür | Canlı sahnede `Sınav Kapısı Açıldı` · `Baraj 70 · mühürlü vize kartı` |

---

## 6. Test

```
npx vitest run tests/academy/office-ai-lesson-6.test.ts tests/academy/exam-flow.test.ts tests/academy/sealed-duration-band.test.ts
```

**3 dosya, 18 test, yeşil.**

İlgili SSOT kilitleri de yeşil: `sealed-audio-pilot`, `dron-punchcards-from-timings`, `word-count-sync`, `prompt-console` — toplam **7 dosya, 35 test**.

Yeni kilitler `office-ai-lesson-6.test.ts` içinde:

- Sebep → Eylem → Sonuç / neden 10+10+10 / neden sınav kapısı bu dersten sonra / Baraj 70 / mühürlü vize kartı
- Slogan yasağı: kahraman, Baraj yetmiştir, Geçme notu yetmiştir, Satın alma belge basmaz, Haftalık Sistem kahramanlık değil
- 16:9 + Excel `height: 100%` + üç blok tablo + Sınav Kapısı Açıldı mührü (`aspect-ratio: 1 / 1`, `scaleY` yok) + prompt dock sahne dışında
- 540.2 cue-timings-karaoke senkronu; reconstruct harf düşürmez
- Active word `font-weight: inherit`; descender padding durur

`word-count-sync` 6. ders gövdesi **610** ile örtüşür. 5. ders compact SSOT 1056→1066 (önceden duran kayma; bu pakette 5. ders metnine dokunulmadı).

---

## 7. Tarayıcı

Dev sunucu `http://localhost:3000` açıktı. `/academy/01_office_ai/oyna` oturum istedi (`/login?next=/academy/01_office_ai/oyna`). Super Admin saha gözlemi: giriş sonrası 16:9 sahnede Cuma 30 Excel tuvali, cue-03’te dağınık hafta (Pazartesi kopyala / Cuma yetiştirme), cue-04’te üç blok komutu (sistemli tablo spoiler kapalı), cue-05/06 split’te sol kriz tekrarı / sağ Excel temizlik · Slayt özet · E-posta sıfırlama, cue-08’de **Sınav Kapısı Açıldı** mührü, karaoke bandında `g / y / ş / p` kesilmemeli.

Kod sözleşmesi vitest ile kilitli; oturumlu uçtan uca tıklama bu pakette yok.

---

## Damga

**RAFA YERLEŞTİRİLDİ (KULLANICIYA HAZIR)**

Ders 9 vatandaş dilinde, 16:9 Cuma 30 tuvali + üç blok (Excel temizlik, Slayt özet, E-posta sıfırlama) + Sınav Kapısı Açıldı mührü sahnesinde, mühürlü karaoke ile yayın bandındadır.

`01_office_ai` amiral gemisinin 9 dersi rafa girdi. Sıradaki kapı müfredat sınavıdır: Baraj 70, satın alma basmaz, mühürlü vize kartı yalnız 9/9 ve yetmiş üstünde doğar.
