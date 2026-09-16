# TEDAVİ RAPORU — `01_office_ai` Faz 1

Tarih: 2026-09-16  
Kaynak karar: `docs/TESPIT_RAPORU_01_OFFICE_AI.md` (CEO / SUPER ADMIN onaylı)  
İlkeler: **Sıfır Risk** (ders anahtarı, mühürlü MP3, sınav kapısı mantığı) · **Maliyet Güvenliği** (TTS re-bake yok)

Bu fazda kaset basılmadı. Metin SSOT ve canlı sıra kilitlendi. Mühürlü MP3 hâlâ eski vaadi taşır; re-bake listesi aşağıdadır.

---

## Kilit omurga (canlı yol)

Ders **anahtarları değişmedi**. Sıra `lesson-index.ts` + `officeAiSections` + `OFFICE_AI_PLANNED_LESSONS` ile kilitlendi. Sınav kapısı hâlâ «9 dersin tamamı»; son ders artık capstone olduğu için kapı yalnız Cuma 30’dan sonra açılır.

| Sıra | Anahtar | Başlık | Durum | Not |
|------|---------|--------|-------|-----|
| 1 | `01_office_ai-1` | Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo | sealed | Anahtar durur |
| 2 | `01_office_ai-k1` | KVKK, Şirket Sırları ve Maskeleme: Ne Yüklenmez? | baking | Yükleme alışkanlığından önce. Karaoke yok (makale) |
| 3 | `01_office_ai-2` | Rapor Otomasyonu | sealed | |
| 4 | `01_office_ai-3` | Sunum Fabrikası | sealed | |
| 5 | `01_office_ai-5` | İstisnalar & Hata Avı | sealed | Excel yığınıyla kaldı (5. slot) |
| 6 | `01_office_ai-4` | E-Posta Akışı: Gelen Kutusu Sıfırlama | sealed | **Ritüel** (etiket → taslak → insan → arşiv) |
| 7 | `01_office_ai-g1` | Gmail + Gemini ile Gelen Kutusu ve Aksiyon Listesi | sealed | **Asıl kapı** (panel + aksiyon tablosu) |
| 8 | `01_office_ai-w1` | Word ve Uzun Doküman Analizi | sealed | Sınav vaadi söküldü (metin) |
| 9 | `01_office_ai-6` | Haftalık Sistem: 30 Dakikalık Rutin | sealed | **Capstone.** «Sınav Köprüsü» başlıktan çıktı |

Sınav: `isAcademyCurriculumComplete` / `isAcademyCurriculumCompleteFromIndex` — 9 anahtar. Değişiklik yok. Son tamamlanan ders capstone olunca kapı açılır.

---

## ADIM 1 — P0 sesli kaset ve başlık illüzyonu

### 1.1 Ders 6 başlığı

«Sınav Köprüsü» vitrin / izlence / sinema / taslak başlığından söküldü. Canlı ad:

**Haftalık Sistem: 30 Dakikalık Rutin**

Dokunan SSOT: `section_6.ts`, `planned.ts`, `cinema-cue-catalog.ts`, `catalog-summaries.ts`, `learning-outcomes.ts`. Kardeş SKU iskelet başlıkları (`02`–`05`) bu fazda dokunulmadı.

### 1.2 W1 «Sekiz ders bitti. Sınav köprüsü açılır.»

Metin SSOT düzeltildi. Yeni vaat:

> Sınav bu derste açılmaz. Kapanış dersi olan Haftalık Sistem (**9. ders**, `01_office_ai-6`) tamamlandığında açılır. Baraj 70.

Güncellenen kaynaklar:

- `lib/academy/spoken-scripts/01_office_ai-w1.md`
- `lib/academy/lesson-cues/01_office_ai-w1.json` (karaoke/cue metni; saatler aynı)
- `lib/academy/curricula/office_ai/section_w1.ts` (compact makale)
- `docs/curriculum/01_office_ai_w1_cue.json`
- `docs/curriculum/01_office_ai_w1_doygun_iskelet.md`

**Mühürlü MP3 dokunulmadı.** `public/media/academy/audio/01_office_ai/01_office_ai-w1.mp3` ve `lesson-audio-timings/01_office_ai-w1.json` hâlâ eski yalanı taşır.

### 1.3 Re-bake listesi (Faz 2 — TTS maliyeti)

| Öncelik | Ders | Neden | Bu fazda TTS |
|---------|------|-------|--------------|
| P0 | `01_office_ai-w1` | Mühürlü kaset «sekiz ders bitti / sınav şimdi açılır» der | **Hayır — listede** |
| P0 | `01_office_ai-6` | Kaset «bu dersin sonunda açılmaz; Gmail/Word/KVKK bekler» der; artık capstone | **Hayır — listede** |
| P1 | `01_office_ai-k1` | Bake kuyruğunda; script 2. ders konumuna çekildi. **Yeni yerde bir kez basılacak** | Bekle |
| P2 | `01_office_ai-1`, `-2`, `-3`, `-4`, `-5`, `-g1` | «N. ders» / köprü cümleleri yeni sırayla sapar | Bekle |

Karaoke metni (cue JSON) W1 ve L6 için yeni SSOT’a çekildi; öğrenci geçici olarak **yazı-ses sapması** görür. Bilinçli tercih: vitrin ve makale doğru söylesin, mühürlü yalan çoğalmasın. Re-bake bu sapmayı kapatır.

---

## ADIM 2 — Omurga ve akış

### 2.1 KVKK 2. ders

`k1` yükleme alışkanlığından önceye alındı. L1 hâlâ ataş öğretir (mühürlü kaset); Faz 1 L1’i yeniden basmaz. Compact L1 «sonraki kapı KVKK» der.

`k1` vatandaş katmanı **makale** (`baking`). 2. derste ses yok; ahlak omurgası okunur, karaoke Faz 2 bake’inde gelir.

### 2.2 E-posta ayrışması (L4 ≠ G1)

Birleştirilmedi (iki kaset maliyeti korunur). Compact içerik ayrıldı:

- **L4 (`01_office_ai-4`):** ritüel. Etiket → taslak → insan onayı → arşiv. Panel nasıl açılır öğretilmez.
- **G1 (`01_office_ai-g1`):** asıl kapı. Gemini paneli, Outlook Copilot, aksiyon tablosu (kim / ne / ne zaman). Taşıma su yasak.

L4 kaseti hâlâ eski «4. ders / sonraki hata avı» dilini taşır (P2 re-bake).

### 2.3 Capstone

`01_office_ai-6` 9. sıraya alındı. Compact ve konuşma metni: «bu kapanış dersini bitirince sınav kapısı açılır.» Başlıkta sınav yok.

### 2.4 Sıfır risk notları

- Anahtarlar (`-1`…`-6`, `-g1`, `-w1`, `-k1`) durur; ilerleme satırları kırılmaz.
- Her kayan bölümde açık `lessonKey` var; `sectionNumber` fallback çarpışması yok.
- Müfredat mühürü (`curriculumSeal`) **sıra değişince hash değiştirir**. Mevcut sertifikalar sicildeki saklı mühürle doğrulanır; yeni oturumlar yeni hash basar. Eski belgeyi düşürmez.
- Yarım kalan öğrenci: L1 bitmiş, `k1` yoksa sıradaki ders KVKK’dır. Pedagojik olarak doğru.

---

## ADIM 3 — Compact makale ≠ transkript

Dokuz `section_*.ts` dosyasına kasetin sığdırmadığı **El kitabı** eklendi. Her derste zorunlu üç blok:

1. Lisans yoksa ne yapılır?
2. Kenar durum / dikkat edilecek hata
3. Yapılmaması gereken tuzak

Kilit test: `tests/academy/curriculum-syllabus.test.ts` → «amiral compact makale her derste el kitabı üçlüsü taşır».

Punchcard iskeleti (öğretim omurgası) durur; el kitabı kasetin kopyası değildir.

---

## ADIM 4 — SEN OLSAYDIN NE YAPARDIN?

### 4.1 ₺890 Amiral SKU bu 9 dersle B2C vaadini karşılar mı?

**Kısa hüküm: Temel refleks paketi olarak evet; «her ofis, her lisans, her toplantı» amiral vaadi olarak hayır.**

Karşılanan (dürüst 101):

- Excel A1 + üç kapı
- KVKK / maske **yüklemeden önce**
- Yönetim özeti, slayt, hata avı (TOPLA)
- E-posta ritüeli + yerleşik kapı (çift kaset, tek hat)
- Word ataş (sözleşme / dilekçe / rapor)
- Cuma 30 kapanış + 9 ders bitince sınav

Karşılanmayan (hâlâ ₺890 kutusunun dışında):

- Toplantı transkripti → aksiyon
- Kiracılı Copilot / DPA / şerit derinliği
- Ölçülen altın dosya (compact kaçışı duruyor; kanıt hâlâ MCQ)
- Sheets, ajan, n8n, RAG

Tespit raporundaki 12+ kasetlik «amiral gemi» bu fiyata ve bu 9 anahtara sığmaz. Sığdırmaya çalışmak yeni yalan üretir.

**101/102 ayrımı:** içerik üretimi **şimdi değil**. Kod/veritabanı **hazırlığı şimdiden yapılmalı** — ucuz, geri alınabilir, TTS’siz:

1. Katalogda `01_office_ai` seviye etiketini dürüst «Temel» bırak (zaten Temel).
2. Vitrin cümlesini «lisanslı Copilot + toplantı» iddiasından uzak tut; ₺890 = tüketici / KOBİ refleksi.
3. Faz 2’de boş **102 kabuğu** (`Coming soon`, fiyat slotu, ayrı slug) — kardeş SKU’lar gibi. İçerik yok, kaset yok.
4. Altın dosya / prompt-pack kanıtı 101’de kasetten bağımsız kilitlenir (T7); 102’ye ertelenmez.

Tek SKU’yu hem lisanssıza hem Copilot kiracısına satmak, omurgayı düzeltmiş olsak da vaadi yine şişirir.

### 4.2 Faz 2 — ilk kod / kaset hamlesi

Sıra (maliyet güvenliği):

1. **W1 re-bake** — P0 mühürlü yalan. Metin hazır.
2. **L6 re-bake** — capstone vaadi. Metin hazır.
3. **k1 TTS, 2. slotta, bir kez** — script hazır; eski «sınav açılır / Word’den sonra» yok.
4. Sonra L4/G1 kaset köprü cümleleri (P2). Yeni SKU, Veo, 4-beat sıkılaştırma yok.

Yapılmayacak ilk iş: `k1`’i eski 9. slot hikâyesiyle basmak; 102 içeriği yazmak; kardeş SKU fırını.

---

## Test

Koşulan ve geçen (seçme): office-ai lesson 1–6 / g1 / w1 / k1, syllabus, pulse-continue, continue-board, citizen-player-layer, lesson-advance, sealed-audio-pilot, curriculum-content.

`curriculum-player-surface` içindeki `academy-player-widescreen` iddiası bu fazın öncesinden kırıktır; omurga tedavisine bağlı değildir.

---

## SUPER ADMIN özeti

Faz 1 uygulandı. Canlı izlence artık KVKK’yı 2. derste, Cuma 30’u kapanışta gösterir. Sınav vaadi W1’den söküldü; capstone’dan sonra açılır. Compact makaleler el kitabı üçlüsü taşır. **Kaset basılmadı.** W1 ve L6 mühürlü ses hâlâ eski cümleyi söyler — re-bake kuyruğu P0.

Onay bekleyen Faz 2 kararı: W1 + L6 TTS bütçesi ve `k1`’in 2. slotta tek bake’i.
