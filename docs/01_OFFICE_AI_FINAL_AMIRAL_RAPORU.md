# 01_office_ai — Final Amiral Raporu (Faz T2 & T3)

| Alan | Değer |
|------|--------|
| Tarih | 16 Eylül 2026 |
| Rol | Cursor Ajanı → SUPER ADMIN |
| Kapsam | T0/T1 CEO onayı üzerine T3 iş tohumları + T2 re-bake **hazırlığı** (TTS kotası harcanmadı) |
| Yöntem | Sıfır risk: kernel, hop sicili, veritabanı, cüzdan, Dron şeması dokunulmadı |
| Statü | **Mühürlü.** T3 uygulandı. T2 görsel + dry-run + cue paragraf hizası tamam. Canlı TTS: Ders 1+5 (17 Eylül sabah) ve kalan `4/3/2/g1` (17 Eylül 10:19 UTC+3, Paid Tier 1) — `docs/01_OFFICE_AI_T2_KASET_MUHRU.md`. |

Çelişkide Anayasa **A Katmanı** bağlayıcıdır. Bu rapor ürün kodunu import etmez.

Önceki mühür: `docs/01_OFFICE_AI_TEDAVI_RAPORU.md` (T0+T1, CEO %100 onay).

---

## 0. Yönetici özeti

**T3 bitti.** Dokuz dersin `LESSON_PRACTICE` tohumu Tam Ders Metni’ne parametre kutusu + 3 adım + kopyalanır istem olarak basılır. Vatandaş kendi dosya adını parametreye yazar. Ders kapanışı **hâlâ compact-read hash**’idir; yeni hop, yeni baraj, yeni cüzdan satırı yoktur.

**T2 kaset kuyruğu kapandı.** T0 sinema köprüleri 72 JPG. Bake kapısının istediği `spoken === cue.paragraphs` hizası sapmış kasetlerde kuruldu. Ders 1+5 sabah, kalan `4/3/2/g1` 17 Eylül 10:19 UTC+3 Paid Tier 1 ile mühürlendi.

**Kulak = göz.** Karaoke `start/end` yeni WAV saniyesidir. Sertifika hâlâ compact-read + sınav baraj 70 ile basılır.

**Doğrulama.** `npm run test` → **209 dosya / 973 test geçti** (önceki mühür 208/970; +3 pratik kilidi).

---

## ADIM 1 — Faz T3: iş kanıtı tohumları

Tek dosya: `lib/academy/lesson-practice.ts`. `composeCompactLessonBody` kancası zaten `curriculum.ts` içinde duruyordu.

| Vatandaş | Anahtar | Tohum (çıktı) |
|----------|---------|----------------|
| Ders 1 | `01_office_ai-1` | Kendi xlsx · A1 yaz · birleşik çöz · ataşla |
| Ders 2 | `01_office_ai-k1` | Maske haritası · ham yükleme yok · 3. Kapı kısa |
| Ders 3 | `01_office_ai-2` | Maskeli tablo · 3 madde + eylem · insan kilidi |
| Ders 4 | `01_office_ai-3` | Kendi özet · slayt başına tek fikir · temayı sen kilitle |
| Ders 5 | `01_office_ai-5` | Şüpheli hücre · TOPLA çapraz · kırmızı kilitle |
| Ders 6 | `01_office_ai-4` | 5 ileti · etiket / taslak / arşiv · gönderme |
| Ders 7 | `01_office_ai-g1` | Son 24 saat · Gemini paneli · `ACADEMY_GMAIL_GEMINI_PROMPT` |
| Ders 8 | `01_office_ai-w1` | Kendi docx · üç iş ayrı istem · imza sende |
| Ders 9 | `01_office_ai-6` | Cuma 30 · 10+10+10 · maskeli yedek |

Ölçüm kilidi: `tests/academy/office-ai-lesson-practice.test.ts`.

**Hop ayrımı (bilinçli).** `LESSON_PRACTICE` doldurulunca eski kanca otomatik `param-lock` hop’u açardı; compact SKU’nun kapanışı değişirdi. Sıfır risk için `academyInteractiveTaskByKey` compact anahtarda `null` döner. Pratik gövdededir; sicil compact-read kalır. Müfredat mührü ders **anahtarlarından** basılır, gövdeden değil — mevcut sertifika hash’i kırılmaz.

**Yapılmadı.** Ayrı laboratuvar rotası, cüzdan puanı, sertifikaya pratik barajı, Dron sinema klonu.

---

## ADIM 2 — Faz T2: ses ve medya hizalama hazırlığı

### 2.1 Sinema JPG (TTS kotası yok)

İlk deneme Playwright Chromium yokluğunda düştü. `npx playwright install chromium` sonrası:

```
npm run render:academy-media
cinema cue bake OK — 72 JPG → public/academy/cinema/
```

T0 katalog köprüleri (hata avı → e-posta → Gmail; Cuma kapanış dersi) vatandaşın gördüğü karta basıldı.

### 2.2 Spoken vs mühürlü timings (son parça)

| Anahtar | Vatandaş | Son paragraf aynı mı? | Karar |
|---------|----------|------------------------|--------|
| `1` | Ders 1 | Hayır — kaset “2. bölüm / yönetim özeti”; yazı “2. ders / KVKK” | **Re-bake** |
| `2` | Ders 3 | Son parça evet; açılış recap (KVKK bekçisi) sapmış | **Re-bake** |
| `3` | Ders 4 | Hayır — kaset “gelen kutusu”; yazı “sayıyı kilitle / hata avı” | **Re-bake** (CEO listesine ek kanıt) |
| `4` | Ders 6 | Hayır — kaset “hata avı / görüşmek dileğiyle”; yazı “Gmail / gönderme” | **Re-bake** |
| `5` | Ders 5 | Hayır — kaset “Sınav Köprüsü”; yazı “e-posta ritüeli” | **Re-bake** |
| `g1` | Ders 7 | Son parça evet; açılış (atlanmış kapı / 6. ders Outlook) sapmış | **Re-bake** |
| `k1` | Ders 2 | Evet | Atla |
| `w1` | Ders 8 | Evet | Atla |
| `6` | Ders 9 | Evet | Atla |

CEO kuyruğu `1, 2, 4, 5, g1` doğrulandı. **`3` de sapmış.** Altı kaset; dokuz değil.

### 2.3 Cue paragraf hizası (zaman damgası yok)

Bake kapısı `assertSpokenScriptMatchesCues` konuşma metni ≠ cue paragraf deyince `--seal` açılamaz. Karaoke `start/end` bırakıldı; yalnız `paragraphs` spoken SSOT’tan dolduruldu.

```
npx tsx scripts/sync-academy-cue-paragraphs.ts
```

Sonra dry-run (harici API yok):

| Anahtar | Paragraf | İstek | min.ara | Sonuç |
|---------|----------|-------|---------|--------|
| `01_office_ai-1` | 15 | 15 (tavan 15) | 91s | geçti |
| `01_office_ai-2` | 14 | 14 | 85s | geçti |
| `01_office_ai-4` | 14 | 14 | 85s | geçti |
| `01_office_ai-5` | 14 | 14 | 85s | geçti |
| `01_office_ai-g1` | 14 | 14 | 85s | geçti |
| `01_office_ai-3` | 14 | 14 | 85s | geçti |

### 2.4 Ses mühürleme — insan kapısı (kota burada harcanır)

Gemini TTS varsayılan kapalıdır. Taslak WAV vatandaşa basılmaz. Timings elle yazılmaz; bake WAV’dan üretir. **Tek anahtar, tek `--seal`.** `--force` mevcut WAV üzerine basar.

Sıra (en gürültülü sapmadan sakinine; birer birer dinle):

```
npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-1
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-1

npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-5
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-5

npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-4
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-4

npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-3
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-3

npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-2
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-2

npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-g1
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-g1
```

Bütçe: RPM 6.5 sn × ~14 istek ≈ 1.5 dk duvar / kaset + sentez. Altı kaset. Dokuz kaseti baştan fırınlamak hâlâ yanlış tasarruftur.

**Yapılmaz.** Canlı izlemede TTS. Timings el damgası. Veo 3.1. Tek `--seal` ile tüm SKU. `k1`’i 7 dk’ya şişirmek (ayrı karar).

Ara hâl: karaoke metni yeni, saniye eski. `--seal` sonrası timings ve cue saniyesi WAV’a kilitlenir.

---

## ADIM 3 — Sistem doğrulaması

```
npm run test
```

| Tur | Sonuç |
|-----|--------|
| T3 odaklı (pratik + lesson-body + proof-of-work) | geçti |
| Karaoke şeridi (eski “2. bölüm / yönetim özeti” kilidi T1 omurgasına çekildi) | 2 kırık → yama → geçti |
| Tam `npm run test` | **Test Files 209 passed / Tests 973 passed** · 44.11s |

Oynatıcı SETTLED kilidi yüzünden tarayıcıda uçtan uca gezilmedi. Serileştirme `composePracticalLessonBody` + `academyLessonHasPractice` ile kilitli. Sinema 72/72 JPG operatör fırınında basıldı.

### Bu fazın dosya listesi

Kod / içerik:

- `lib/academy/lesson-practice.ts`
- `lib/academy/proof-of-work.ts` (compact hop kalkanı)
- `lib/academy/lesson-cues/01_office_ai-{1,2,3,4,5,g1}.json` (yalnız `paragraphs`)
- `scripts/sync-academy-cue-paragraphs.ts`
- `public/academy/cinema/*.jpg` (72 slayt)

Test:

- `tests/academy/office-ai-lesson-practice.test.ts` **(yeni)**
- `tests/academy/lesson-body.test.ts`
- `tests/academy/proof-of-work.test.ts`
- `tests/academy/proof-of-work-verify.test.ts`
- `tests/academy/lesson-karaoke-strip.test.ts`

**Dokunulmayan.** Kernel, hop tablosu, Prisma, Dron, mühürlü MP3/WAV/timings `start-end`, `k1`/`w1`/`6` kasetleri.

---

## Tarafız görüş — SEN OLSAYDIN NE YAPARDIN? (02 ve platform)

### Platform kurgusu doğru mu?

Evet. Bozuk olan çekirdek değil, **içerik SSOT’unun vatandaş sırasından sapmasıydı.** Compact-read, Üç Kapı, baraj 70, SETTLED gövde kilidi, nakit halkası amirali taşır. T0’da kilitlenen `lesson-index` vatandaş numarasını teknik sonekten ayırdı; T3 pratik tohumunu hop’tan ayırdı. Bu iki ayrım 02’nin anayasasıdır.

### Amiral yayına %100 hazır mı?

**Kod, yazı ve kulak kapısı evet.** Vatandaş sırası, sınav tuzağı, sinema kartı, Tam Ders Metni ve iş tohumu durur. Altı sapmış kaset mühürlendi (1+5 sabah; 4+3+2+g1 ücretli kova). `k1` / `w1` / `6` zaten T1 omurgasıyla aynıydı; yeniden fırın yok. 209/973 yeşil. “Kulak = göz” satılır.

### 02 (102 Ofis Analisti / Power Query / Pivot) için farklı ne yapılır?

1. **Tek omurga, üç yazım, merge öncesi dry-run.** Compact, spoken ve `cue.paragraphs` aynı vatandaş ordinalinden doğar. `Konuşma metni ≠ cue` CI’da kırmızıdır; T2 borcu olmaz.
2. **Teknik anahtar sonekinden ders numarası üretilmez.** `02_office_analyst-pq1` vatandaş “Ders 1” olabilir. `academyCitizenLessonOrdinal` birinci gündür SSOT’tur. Fihriste “Modül 1/2/3” yazılmaz.
3. **`LESSON_PRACTICE` birinci derste durur; hop ayrı bayraktır.** Compact makalede gövde tohumu ≠ param-lock. 102 laboratuvar istiyorsa format compact değildir veya `proofKind` açıkça yazılır. Otomatik `LESSON_PRACTICE → interactive task` 101’de hop’u kaçırırdı; kalkanı 02’de unutma.
4. **Sinema köprüsü katalogda `L3/L6` yasağı.** Kart metni `academyCitizenLessonLabel` okur. Punchcard **adı** reji anahtarı kalabilir (`TAŞIMA SU` gibi); yasağı gövdeye yazma.
5. **101’e Power Query yamayarak 102 yapma.** Pivot, Get Data, yapılandırılmış tablo, kiracı-içi Copilot ayrı SKU’dur. 101’in vaadi A1 + maske + üç madde + slayt + kutu + Word + Cuma’dır. Geniş başlık 102+laboratuvar gelince söylenir.
6. **Kaset kuyruğu ölçülür, ezberlenmez.** Son paragraf + açılış recap timings ile aynı mı? Değilse fırın. Aynıysa atla. 02’de dokuz kaseti refleksle mühürleme.

---

## Mühür

T3 SUPER ADMIN talimatına göre uygulandı. T2 görsel ve dry-run hazırlığı 16 Eylül’de uygulandı. Kalan dört kaset 17 Eylül 10:19 UTC+3’te Paid Tier 1 ile mühürlendi: `docs/01_OFFICE_AI_T2_KASET_MUHRU.md`.

01_office_ai canlıya çıkışa **%100 hazır.**

— Cursor Ajanı, 17 Eylül 2026 10:19 UTC+3
