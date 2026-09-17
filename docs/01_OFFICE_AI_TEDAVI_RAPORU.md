# 01_office_ai — Tedavi Raporu (Faz T0 & T1)

| Alan | Değer |
|------|--------|
| Tarih | 16 Eylül 2026 |
| Rol | Cursor Ajanı → SUPER ADMIN |
| Kapsam | Amiral SKU `01_office_ai` vatandaş sıra kilidi, sinema köprüleri, sınav havuzu, compact/spoken omurga |
| Yöntem | Onaylı `docs/01_OFFICE_AI_TESPIT_RAPORU.md` üzerine sıfır risk T0+T1. Mühürlü MP3 / timings / karaoke **dokunulmadı** (T2). |
| Statü | **Mühürlü.** T0 ve T1 uygulandı. T2 kaset re-bake ve LESSON_PRACTICE laboratuvarı **uygulanmadı**; görüş aşağıdadır. |

Çelişkide Anayasa **A Katmanı** bağlayıcıdır. Bu rapor ürün kodunu import etmez; `docs/DURUM.md` ile aynı sınıftadır.

---

## 0. Yönetici özeti

Vatandaşın gördüğü ders numarası artık teknik anahtarın soneki değildir. Sıra `lib/academy/curricula/lesson-index.ts` dizisidir:

| Vatandaş | Anahtar | Başlık |
|----------|---------|--------|
| Ders 1 | `01_office_ai-1` | Excel Hijyeni |
| Ders 2 | `01_office_ai-k1` | KVKK ve Maskeleme |
| Ders 3 | `01_office_ai-2` | Rapor Otomasyonu |
| Ders 4 | `01_office_ai-3` | Sunum Fabrikası |
| Ders 5 | `01_office_ai-5` | İstisnalar & Hata Avı |
| Ders 6 | `01_office_ai-4` | E-Posta Akışı |
| Ders 7 | `01_office_ai-g1` | Gmail + Gemini |
| Ders 8 | `01_office_ai-w1` | Word |
| Ders 9 | `01_office_ai-6` | Cuma 30 Rutini |

**Ne kilitlendi.** UI “Bölüm” etiketi vatandaş yüzeyinde “Ders” oldu. Compact taslak `order` alanı index sırasını okur. `academyLessonByKey` rakam yedek yolu kapatıldı (`"4"` artık e-posta dersini “4. ders” sanmaz). Sinema kapanış kartları “hata avı → Cuma” yalanını ve L6/L7 etiketini taşımaz. Sınav havuzu `q_off_17` tuzağı ve mükerrer dilekçe / 3. Kapı kopyası sadeleşti. Spoken ve compact giriş/çıkış köprüleri vatandaş omurgasına çekildi. G1 “Taşıma su yasak” dogması Pedagoji E.10 atlanmış kapı diline çevrildi.

**Ne duruyor (bilinçli).** Mühürlü kaset, timings ve karaoke hâlâ T2 öncesi sestir. Kulak ile göz metni T1’de yazıda hizalandı; **kulak T2’ye kadar eski sırayı söyleyebilir.** Punchcard adı `TAŞIMA SU` korundu; yasak dili kalktı. `LESSON_PRACTICE` hâlâ `{}`.

**Doğrulama.** `npm run test` → **208 dosya / 970 test geçti.** G1/W1 son rötuşundan sonra hedefli 11 test yeniden geçti.

---

## ADIM 1 — T0: SSOT hizalaması ve arayüz

### 1.1 Sıra numarası kilidi

Yeni yardımcılar `lib/academy/curricula/lesson-index.ts`:

- `academyCitizenLessonOrdinal(slug, lessonKey)` — 1 tabanlı index sırası
- `academyCitizenLessonOrdinalFromKey(lessonKey)` — slug’ı anahtardan çözer; **sonek okunmaz** (`01_office_ai-6` → 9)
- `academyCitizenLessonLabel` — `"Ders n"`

Tüketim noktaları:

| Dosya | Değişiklik |
|-------|------------|
| `lib/academy/curricula/index.ts` | `compactDraftsFromModule` `order` = citizen ordinal |
| `lib/academy/curriculum.ts` | `academyLessonByKey` yalnız tam anahtar; `/\d+/` yedek **silindi** |
| `components/academy/lesson-study-tabs.tsx` | `"Bölüm n / total"` → `"Ders n / total"` (`active.order` zaten index sırası) |
| `lib/copy/sen-voice/academy.ts` | vitrin `cardMeta`: `"n Ders"`; oynatıcı `cardProgress`: `"n / total Ders"` |
| `scripts/render-academy-cinema-html.ts` | altlık `01_office_ai-5` basmaz; `"Ders 5 · cue-n"` |

Kilit test: `tests/academy/office-ai-citizen-ordinal.test.ts`.

```
01_office_ai-5 → Ders 5 (hata avı)
01_office_ai-4 → Ders 6 (e-posta)
01_office_ai-6 → Ders 9 (Cuma)
01_office_ai-k1 → Ders 2 (KVKK)
academyLessonByKey("01_office_ai", "4") → null
```

**Bilerek dokunulmayan.** `ACADEMY_SEN.readAloud.cardProgress` hâlâ `"n / total Bölüm"` — teleprompter okuma dilimi, vatandaş ders numarası değil. Dron punchcard JSON şeması ve teknik anahtarlar hop/mühür için durur.

### 1.2 Sinema ve kart düzeltmeleri (`cinema-cue-catalog.ts`)

Punchcard sayısı (8) ve sahne düzeni değişmedi. Yalnız giriş/kapanış köprüleri vatandaş sırasına çekildi.

| Anahtar (vatandaş) | Eski yalan | Yeni köprü |
|--------------------|------------|------------|
| `-2` (Ders 3 rapor) | `L3 slayt köprüsü` | 4. ders slayt |
| `-3` (Ders 4 sunum) | sonra gelen kutusu / `L4 e-posta` | sonra hata avı / 5. ders |
| `-4` (Ders 6 e-posta) giriş | Sunum cebinde → inbox | **Hata avı cebinde** → inbox |
| `-4` kapanış | sonra istisnalar / `L5 hata avı` | sonra Gmail / 7. ders |
| `-5` (Ders 5 hata avı) giriş | e-posta sıfırlama cebinde | **Sunum Fabrikası cebinde** |
| `-5` kapanış | sonra haftalık rutin / `L6 rutin` | sonra e-posta ritüeli / **6. ders** |
| `-6` (Ders 9 Cuma) giriş | hata avı → Cuma | **Word ataş** → Cuma |
| `-6` kapanış | sonra Gmail / `L7 Gmail` | **kapanış dersi; sınav kapısı** |
| `-g1` giriş | “taşıma su yasak” | atlanmış kapı |
| `-g1` TAŞIMA SU kartı | Ctrl+C yasak | 1. kapı panel → 2. ataş → 3. maskeli kısa |
| `-w1` kapanış | ana akış köprüsü | 9. ders Cuma |
| `-k1` kapanış | genel sınav kapısı | sıradaki kapı rapor / 3. ders |

`excel-mouse-pointer.ts` içindeki `L6_WALK_*` **cue-06** yürüme desenidir; vatandaş “6. ders” değildir. Bırakıldı.

### 1.3 Sınav havuzu (`exam-pools.ts`)

Havuz uzunluğu **42** (30–50 bandı). ID’ler durur; tuzak metin değişir.

| ID | Eski | Yeni |
|----|------|------|
| `q_off_17` | çeldirici: “Sınavı 6. derste açmak” (`01_office_ai-6` = Cuma tuzağı) | “Sınavı Cuma 30 kapanış dersinden önce açmak” |
| `q_off_35` | `q_off_28` dilekçe/imza kopyası | Word’de üç iş / ayrı istem disiplini |
| `q_off_39` | `q_off_34` 3. Kapı kopyası | lisans, KVKK kuralını değiştirmez |

Doğru şık indeksleri korundu (`q_off_17` = 1, `q_off_35` = 1, `q_off_39` = 2).

---

## ADIM 2 — T1: senaryo ve köprü re-fabrikasyon hazırlığı

Kaset re-bake yok. Spoken paragraf sayıları (15 / 14) cue testlerini kırmamak için korundu. Değişen, giriş/çıkış ve yanlış gelecek vaadidir.

### 2.1 Spoken-scripts köprüleri

| Dosya | Omurga düzeltmesi |
|-------|-------------------|
| `01_office_ai-1.md` | kapanış: 2. ders = KVKK ve maskeleme (rapor değil) |
| `01_office_ai-2.md` | açılış: 1. ders A1 + 2. ders KVKK recap; kapanış: 4. ders Sunum Fabrikası |
| `01_office_ai-3.md` | “dördüncü ders” (vatandaş 4); kapanış: 5. ders hata avı, e-posta sonra |
| `01_office_ai-4.md` | açılış hata avından gelir; “altıncı ders”; kapanış Gmail (7), Cuma değil |
| `01_office_ai-5.md` | “dördüncü ders = sunum”; “beşinci ders”; kapanış e-posta ritüeli |
| `01_office_ai-g1.md` | “6. derste Outlook” (eski “dördüncü ders” silindi); “Dokuz ders bitmeden sınava girilmez”; taşıma su = atlanmış kapı, yasak değil |
| `01_office_ai-w1.md` | “Ders ikideki yönetici özeti” → **3. dersteki**; sınav 9. dersten sonra |
| `01_office_ai-k1.md` | zaten 2. ders / rapor köprüsü (dokunulmadı) |
| `01_office_ai-6.md` | kapanış dersi / sınav (dokunulmadı) |

Skip-preventer `KVKK`’yı konuşma metninde açımlar. Ders 1 testleri buna göre `/KVKK/` + `/maskeleme/` diye bölündü. Ders 2 recap’te “düzensiz tabloyu A1 eşiğinden temizleme” cümlesi test kilidi için durur.

### 2.2 Compact makale (`section_*.ts`) hizası

| Section | `sectionNumber` | Spoken omurga |
|---------|-----------------|---------------|
| `section_1` | 1 | kapanış 2. ders KVKK |
| `section_k1` | 2 | bekçi; rapor sonra (önceki hizada) |
| `section_2` | 3 | KVKK recap + A1 hijyeni; slayt sonra |
| `section_3` | 4 | kapanış 5. ders hata avı |
| `section_5` | 5 | dördüncü = sunum; beşinci = hata avı |
| `section_4` | 6 | hata avından gelir; G1 sonraki kapı; atlanmış kapı notu |
| `section_g1` | 7 | TAŞIMA SU başlığı durur; gövde E.10 |
| `section_w1` | 8 | 8. ders; sınav 9. derste |
| `section_6` | 9 | capstone; 3. kapı atlanmış kapı notu |

`docs/curriculum/01_office_ai_01_script.md` kapanış köprüsü 2. ders KVKK ile güncellendi (operatör kılavuzu).

### 2.3 G1 Pedagoji E.10

“Taşıma su yasak” satılmıyor.

- Compact: “Bu yasak listesi değil, atlanmış kapıdır.”
- Spoken: aynı cümle + “1. ve 2. kapı dururken”
- Cinema G1 cue-01 / cue-03: yasak mermisi kalktı
- `lib/academy/gmail-workspace.ts` yorum satırı E.8–E.10
- Punchcard **adı** `TAŞIMA SU` durur (reji anahtarı; karaoke cue ile kilitli)

Test: `office-ai-lesson-g1.test.ts` → `/taşıma su yasak/` yok; `/atlanmış kapı/` var; `/Dördüncü derste Outlook/` yok.

---

## ADIM 3 — Doğrulama

### 3.1 Komut

```
npm run test
```

(`vitest run`, surface ve earnings-bridge hariç — `package.json` `test` script’i.)

### 3.2 Sonuç

| Tur | Sonuç |
|-----|--------|
| Odaklı office-ai (ordinal + ders 1–5 + g1 + exam-leak + catalog) | ilk turda 2 kırık (KVKK skip-preventer regex; ders 2 “düzensiz tablo” recap) → yama → geçti |
| Tam `npm run test` | **Test Files 208 passed / Tests 970 passed** · 43.66s |
| T1 son rötuş (g1 “6. ders Outlook”, w1 “3. dersteki”, ordinal) | **3 dosya / 11 test geçti** |

Kırılan sonra düzelen iki kilit:

1. Ders 1 spoken testi `/KVKK ve maskeleme/u` — skip-preventer `KVKK`’yı açımladığı için eşleşmedi. Test `/KVKK/` + `/maskeleme/` olarak ayrıldı.
2. Ders 2 spoken `/düzensiz tablo/iu` — KVKK recap cümlesi A1 hijyenini silmişti. Recap’e “düzensiz tabloyu A1 eşiğinden temizleme” geri kondu; compact `section_2` aynı omurgada.

### 3.3 Bu tedavinin dosya listesi (T0+T1)

Kod / içerik:

- `lib/academy/curricula/lesson-index.ts`
- `lib/academy/curricula/index.ts`
- `lib/academy/curriculum.ts`
- `lib/academy/cinema-cue-catalog.ts`
- `lib/academy/exam-pools.ts`
- `lib/academy/gmail-workspace.ts`
- `lib/academy/curricula/office_ai/section_{1,2,3,4,g1}.ts`
- `lib/academy/spoken-scripts/01_office_ai-{1,2,3,4,5,g1,w1}.md`
- `lib/copy/sen-voice/academy.ts`
- `components/academy/lesson-study-tabs.tsx`
- `scripts/render-academy-cinema-html.ts`
- `docs/curriculum/01_office_ai_01_script.md`

Test:

- `tests/academy/office-ai-citizen-ordinal.test.ts` **(yeni)**
- `tests/academy/office-ai-lesson-{1,2,4,g1}.test.ts`

### 3.4 Bu tedavinin **dışında** kalan kir (önceki oturum / T2 adayı)

Aşağıdakiler bu fazda üretilmedi; mühürlü kaset T2’ye aittir. Karıştırılmasın:

- `lib/academy/lesson-audio-timings/01_office_ai-w1.json`
- `lib/academy/lesson-cues/01_office_ai-{6,k1,w1}.json`
- `docs/har.json` (iz sürme dökümü; müfredat değil)
- Eski silinmiş rapor adları (`docs/TEDAVI_RAPORU_01_OFFICE_AI.md` vb.) — bu mühür `docs/01_OFFICE_AI_TEDAVI_RAPORU.md`

---

## Kalan sapma (dürüst borç)

1. **Kulak ≠ göz, T2’ye kadar.** Spoken metin vatandaş omurgasında; mühürlü MP3 ve karaoke timings eski sırayı söyleyebilir. Sertifika hâlâ her ikisini aynı mühürle basar. Bu, tespit raporundaki asıl ürün riskidir; T0/T1 onu **gizlemez**, yazıda kapatır.
2. Sinema JPG/HTML render bu fazda çalıştırılmadı. Katalog metni doğru; `npm run render:academy-media` T2 ucuz görsel adımıdır.
3. `LESSON_PRACTICE = {}`. Ders kapanışı hâlâ compact-read hash’idir.
4. `k1` kaseti ~5.2 dk (üretim tabanı 7 dk). T0/T1 süre üretmez.
5. Fihrist “Modül 1/2/3” 4’lü dilimi durur; vatandaşa satılmaz, iç borçtur.

---

## Tarafız görüş 1 — T2 re-bake: en hızlı, maliyetsiz, güvenli yol

**Dokuz kaseti baştan fırınlamak yanlış tasarruftur.** Pedagoji `--seal` kapısı, 6500 ms RPM ve “izlemede TTS yok” kuralı durur. Ben olsam sırayı şöyle keserdim:

### Önerilen boru (üç katman, tek anahtar)

1. **Metin deltası (ücretsiz, bugün bitti).** Spoken vs mühürlü timings son parça. Zaten `sealed-audio-pilot.test.ts` “Sekiz ders bitti” gibi yalanları kilitler. T2 operatörü her anahtar için: spoken köprü cümlesi timings `pieces.at(-1)` ile aynı mı? Değilse o anahtar fırına girer.

2. **Sinema JPG (ucuz, TTS’siz).** Katalog T0’da düzgün. `npm run render:academy-media` Imagen/HTML; Gemini TTS kotası yemez. B-roll `01_office_ai-1-warmup` **reuse** — pahalı Veo 3.1 yasak (Pedagoji E.4). Görseli sesten **önce** mühürle: vatandaş kartı doğru köprüyü gösterir, kaset gecikse bile L6 yalanı ekranda durmaz.

3. **TTS yalnız sapmış anahtarlar, birer birer.** Beklenen kuyruk (spoken T1’e göre): **`1`, `2`, `4`, `5`, `g1`** kesin; **`w1`** (3. ders raporu) muhtemel; **`k1`, `3`, `6`** dry-run ile doğrula, büyük olasılıkla atla.

   ```
   npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-5
   ```

   İnsan köprü paragrafını dinler. Sonra tek anahtar:

   ```
   --seal --confirm-gemini-spend
   ```

   Taslak WAV vatandaşa basılmaz. Timings **elle yazılmaz**; mevcut bake borusu WAV’dan üretir. Cue karaoke T2’de timings’e bağlanır; T0 katalog punchcard metni ile karaoke damgası geçici drift taşır — bu beklenen ara hâldir.

### Neden bu yol

- RPM 6.5 sn × tam 9 kaset = boş bekleme + gereksiz kota. 5 anahtar ~%40–50 tasarruf.
- `k1` zaten yedek TTS (`gemini-2.5-flash-preview-tts`) ve kısa bekçi; omurga 2. ders olduğu hâlde spot kaset. T2’de **yeniden yazıp 7–8 dk’ya şişirmek** ayrı karar; hizalama re-bake’ine karıştırma.
- Tek `--seal` tüm SKU = tek hata 9 kaseti kirletir. Anahtar anahtar mühür, `docs/DURUM.md` satır satır.

**Yapılmaz:** canlı TTS, timings el damgası, Veo 3.1 her ders, cue JSON’u ses mühürlenmeden “düzeltme”.

---

## Tarafız görüş 2 — LESSON_PRACTICE’i iş üreten alana çevirmek (platform kurgusuna dokunmadan)

Kernel, hop, cüzdan, tamamlama olayı, Dron şeması **dokunulmaz.** Mevcut kanca zaten duruyor:

```ts
// lib/academy/curriculum.ts
const practice = LESSON_PRACTICE[lesson.key];
composeCompactLessonBody(draftProse(lesson), practice ?? null);
```

`practice` yoksa gövde salt compact-read’dir. Varsa `composePracticalLessonBody` parametre kutusu + adım listesi + kod/istem çitini Tam Ders Metni’ne basar. UI “uygulama görevi” menü ipucu zaten var.

### T3 önerisi (tek dosya, 9 tohum)

`lib/academy/lesson-practice.ts` içini 9 kayıtla doldur. Her kayıt o dersin **Sıra Sende** cümlesinin makine-okunur hâlidir:

| Ders | `params` | `steps` (3) | `code` (istem, kod değil) |
|------|----------|-------------|---------------------------|
| 1 Excel | dosya adı, A1 sütun adı | A1 yaz · birleşik çöz · ataşla | yalın temizlik istemi |
| 2 KVKK | maske haritası | ham yükleme · maskele · 3. kapı kısa | maskeli üç satır |
| 3 Rapor | tablo + alıcı rolü | özet iste · karar notu ayır · insan kilidi | 3 madde + eylem |
| 4 Sunum | kaynak metin | tek fikir · hiyerarşi · taslağı aktar | slayt iskeleti |
| 5 Hata avı | şüpheli hücre | formül · çapraz sorgu · kırmızı kilitle | “bu sayı nereden” |
| 6 E-posta | 5 ileti | etiket · taslak · arşiv (gönderme) | acil/aksiyon/arşivlik |
| 7 Gmail | son 24 saat | panel aç · tablo iste · gönderme | mevcut `ACADEMY_GMAIL_GEMINI_PROMPT` |
| 8 Word | .docx adı | ataşla · üç iş ayrı · imza sende | sözleşme / dilekçe / rapor istemi |
| 9 Cuma | takvim bloğu | 10+10+10 yaz · ataşla · maskeli yedek | Cuma 30 komutu |

**Kanıt, izleme değil iş:** her tohum vatandaşın **kendi dosya adını** parametreye yazmasını ister. Tamamlama hâlâ mevcut “Dersi Tamamladım” + compact-read hash. Yeni hop yok. İsteğe bağlı (yine mevcut yüzey): ders notuna 1 satır çıktı yapıştırma — yeni tablo değil, zaten duran notes alanı.

**Yapılmaz:** ayrı laboratuvar rotası, cüzdan puanı, sertifikaya pratik barajı, Dron’a sinema klonu. Amiral SKU’nun kapanışı compact-read olarak kalsın; pratik **yanında** duran iş üretir. Baraj 70 sınavda kalır.

Ölçüm: 9 anahtarın `LESSON_PRACTICE[key]` dolu olması + mevcut `lesson-body` testlerinin çit serileştirmesi. Curriculum hash değişir; bu beklenen mühür kaymasıdır, T3’te bilinçli basılır.

---

## Mühür

T0 ve T1 SUPER ADMIN talimatına göre uygulandı. Vatandaş omurgası kodda kilitli. Kaset T2’ye kadar eski sesi taşıyabilir; bu raporda gizlenmez.

Sonraki insan kapısı: **T2 dry-run → tek anahtar `--seal`**, paralel ucuz sinema render. T3: `LESSON_PRACTICE` 9 tohum, kernel yok.

— Cursor Ajanı, 16 Eylül 2026
