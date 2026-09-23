# 01_office_ai — Tedavi Raporu, Aşama 2

| Alan | Değer |
|------|--------|
| Tarih | 21 Eylül 2026 |
| Dayanak | Onaylı Aşama 1 (`docs/01_office_ai_tedavi_raporu.md`) ve «6+7 birleşsin» kararı |
| Kapsam | Konuşma metinleri, müfredat sırası, sınav yolu, mühür cümlesi, antre |
| Dokunulmayan | MP3, cue/zaman JSON’u, karaoke zamanı. Eski ritüel kasetinin dosyası diskte durur; sınav yoluna girmez. |

Vatandaş yolu **8 ana ders + hazırlık şeridi**. Hazırlık şeridi ders sayısına girmez. Sınav kapısı 8. ders bitince açılır. Baraj 70 durur.

---

## 1. Yeni ders dizilimi

| Vatandaş | Anahtar | Başlık |
|----------|---------|--------|
| Hazırlık | `01_office_ai-0` | Başlamadan Önce (mühürsüz şerit) |
| 1 | `01_office_ai-1` | A1 Düzeni ve Temiz Veri |
| 2 | `01_office_ai-k1` | KVKK, Şirket Sırları ve Maskeleme |
| 3 | `01_office_ai-2` | Yönetim Özetine Dönüştürme |
| 4 | `01_office_ai-3` | Metinden Slayta: Sunum Hazırlama |
| 5 | `01_office_ai-5` | İstisnalar ve Hata Avı |
| 6 | `01_office_ai-g1` | **E-Posta Akışı: Gmail / Outlook ve Aksiyon Listesi** |
| 7 | `01_office_ai-w1` | Word ve Uzun Belge İncelemesi |
| 8 | `01_office_ai-6` | Haftalık Sistem: 30 Dakikalık Rutin |

Eski ritüel anahtarı `01_office_ai-4` sınav yolundan, konuşma metni listesinden ve ses mühründen çıktı. Ayrı kaset olarak yeniden kaydedilmez. Sahne dosyası (cue, sinema, MP3) arşivde durur; oynatıcı yolu onu ders saymaz.

Sıra kilidi: `lib/academy/curricula/lesson-index.ts`. Antre grupları: Tablo ve güvenlik (2), Karar ve slayt (3), Kutu ve belge (2), Haftalık sistem (1).

Mühür cümlesi antrede, SEO’da, kariyer kapısında ve çıkış paketinde **8 ders + 10 soru / 70**. Kurs süresi, yoldaki 8 eski kasetin toplamıdır: **4526.260 sn ≈ 75.44 dk**. Eski ritüel kasetinin 493.8 sn’si toplama girmez. 6. dersin yeni metni eski Gmail kasetinden uzundur; süre, fırından sonra yeniden oturur.

---

## 2. Konuşma metni ve senaryo

### 6. ders — birleşik e-posta

`01_office_ai-g1` konuşma metni ve makalesi aynı üç açılış paragrafını taşır.

1. Kazanım: ritüel ayrı ders değildir; ilk iki dakika, sonra canlı kutu.
2. Karşılama: altıncı ders, Gmail ve Outlook aynı masada. Kutu neden şişer. Kopyala-yapıştır neden varsayılan yol değildir.
3. Ritüel: acil / aksiyon / arşivlik, taslak, insan onayı, arşiv. Ardından «şimdi aynı dört adımı canlı kutuda basıyoruz» ve eski panel akışı (taşıma su, Gemini istemi, aksiyon tablosu).

El kitabı tuzağı güncellendi: ritüeli atlayıp doğrudan panele yazmak. Ayrı «ritüel dersi / kapı dersi» ayrımı kalktı.

### 4. ders — sayı kilidi

Makale ve konuşma metninin kapanışına şu cümle girdi:

> Slayta yazdığın genel toplam veya karar sayısı, kaynak Excel hücresiyle %100 aynı değilse o slaytı yayınlama.

Köprü de tek e-posta dersini söyler. «Gmail kapısı ayrı derstedir» kalktı.

### 5. ders — sade başlık

Ara başlık **AI DEDEKTİF** makalede, konuşma metninde ve sinema sahnesinde **ÇAPRAZ KONTROL** oldu. Karşılaştırma etiketi **ÇAPRAZ KONTROL (KİLİTLİ SAYI)**. «Dedektif istemi / dedektif süreç» yerini «çapraz kontrol istemi / kontrol süreci» aldı.

Karaoke cue JSON’u hâlâ eski başlığı taşır. Bu turda zaman dosyası üretilmedi. Sahne kataloğu yeni başlığı gösterir; şerit, fırına kadar eski başlığı okur.

### 8. ders — Cuma

«Dokuz alışkanlık» konuşma metninden ve makaleden çıktı. Cuma üç blok olarak durur: 10 dk Excel düzeni, 10 dk slayt kontrolü, 10 dk e-posta kutusu sıfırlama. Üç blok bitince kısa bir belge ve hata kontrolü var: Word belgesindeki sayı slayttaki sayıyla aynı mı, imza sende mi. Bu dördüncü on dakika değildir. Sınav cümlesi sekiz dersi ister.

Çıkış paketinin Cuma listesine aynı kısa kontrol satırı eklendi.

### Sınav cümlesi, diğer kasetler

1, 2, KVKK ve Word konuşma metinlerindeki «9. ders» «8. ders» oldu. Word «bu 7. derstir» der. Bu cümleler makalede yoktu; seste kilitlensin diye konuşma metnine yazıldı. Eski süs (kahve, «harika bir iş», yüzde seksen, kâbus) 1, 2, 3 ve KVKK konuşma metninde duruyor. Aşama 1 onları makaleden çıkarmış, seste bırakmıştı. Bu tur onları silmedi.

---

## 3. Sistem kilitleri

- Sınav yolu ve ders sayısı: 8. Ön koşul sayacı (`OFF-201`) 8.
- Antre kalkanı, satın alma gövdesi, SEO mühür kanıtı, rehber, hazırlık şeridi notu, kariyer kapısı: 8 ders.
- Öğrenim çıktısı: e-posta tek satır (ritüel + panel). Cuma çıktısına kısa Word/hata kontrolü eklendi.
- Tohum SQL açıklaması mühür cümlesiyle hizalandı.
- `docs/DURUM.md` ve `docs/ops/DURUM.md` 8 derslik yolu yazar. Kalan sekiz MP3’ün önceki fırın olduğu da yazılır.

Akademi ve kopya test turu geçti (558). Kariyer mühür cümlesi testi geçti.

---

## 4. Sınav havuzu — 42 soru

Havuz `q_off_1` … `q_off_42`. Mini sınavlar (`q_off_l*`) bu 42’nin içinde değildir.

Doğrulama:

- Hiçbir soru «9 ders», ayrı ritüel dersi, «AI DEDEKTİF» veya «dokuz alışkanlık» demiyor.
- E-posta soruları (etiket, taslak, onay, arşiv, Gmail paneli, atlanmış kapı) birleşik 6. dersin öğrettiği işi soruyor.
- Cuma sorusunun doğru şıkkı hâlâ 10+10+10. Kısa Word kontrolü dördüncü blok değil; şıkla çelişmiyor.
- Slayt ve sayı kilidi soruları yeni cümleyle aynı refleksi ölçüyor.
- Tek kelime kayması vardı: `q_off_13` doğru şıkta «Format» duruyordu; hazırlık şeridi «Biçim» diyor. Şık **Biçim** oldu.

Emekli kasetin 3 soruluk mini sınav dosyası diskte durur. Yol onu açmaz. 42 soruluk mühür havuzu yeni müfredatla çelişmez.

---

## 5. Sen olsaydın ne yapardın?

Senaryo, bu turun istediği dört kilit için yazıldı: birleşik e-posta, slayt sayı cümlesi, Cuma üç blok + kısa kontrol, çapraz kontrol başlığı. Bunları bir daha tartışmadan fırına verebilirsin.

Fırını bugün tek seferde açmam. Üç iş bitmeden kayıt, eski metni yeniden mühürler.

1. **1, 2 ve KVKK konuşma metnindeki süs duruyor.** Aşama 1 onu makaleden çıkardı. Fırın bugün açılırsa kahve, «harika bir iş» ve sınav süsü sese geri döner. 3. ders konuşmasında yüzde seksen, algoritma ve kâbus da duruyor. Fırından önce bu üç kasetin (ve 3. dersin gövdesinin) «bu haliyle kaydedilsin» kararı yazılsın. Karar «sil» ise, silme fırından önce, metinde bitsin.
2. **Cue ve zaman JSON’u eski 9 kaseti anlatıyor.** 6. ders konuşması bir paragraf uzadı (17 → 18). 5. ders şeridi hâlâ «AI DEDEKTİF» diyor. 8. ders zamanı hâlâ «dokuz alışkanlık» diyor. Fırın, metinden cue’yu yeniden kurmalı; eski JSON’un üstüne yama yetmez. `01_office_ai-4` kuyruğa girmesin.
3. **Süre bandı fırından sonra ölçülür.** Birleşik e-posta metni, bugünkü 7.5 dk’lık Gmail kasetinden uzun. 7–12 dk bandı fırın çıktısında kontrol edilir. Bandı aşarsa metin fırından önce kısaltılır; bant aşılmış MP3 mühürlenmez.

42 soru bu yapıyla uyumlu. Mini sınav dosyasını silmek şart değil; yol onu çağırmaz. Fırın günü o dosya kuyruğa yazılmasın yeter.

Doğru sıra: süs kararı (1, 2, KVKK, gerekirse 3) → fırın allowlist’i 8 anahtar → TTS + cue + zaman tek tur. Allowlist’e `-4` koyma.
