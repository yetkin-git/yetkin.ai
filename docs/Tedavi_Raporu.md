# Yetkin.ai Tedavi Raporu

| | |
|---|---|
| Tarih | 5 Ekim 2026 |
| Dayanak | `docs/TESPIT_RAPORU.md` ve bu turdaki düzeltme adımları |
| Dil | Vatandaş lisanı |
| Ölçülen | Kod, birim testler, yerelde açılan Junior sayfaları |
| Ölçülmeyen | Canlı veritabanı, Vercel ortam değişkenleri, `public/media/` baytları |

Bu rapor, bu turda kodda ne değiştiğini anlatır. Canlı sitede hangi satırın yazılı olduğunu söylemez.

---

## 1. Ne düzeltildi

### 1.1 Junior kapısı

Eskiden `/junior` adresi bütünüyle kapalıydı. Ziyaretçi ders listesini göremiyordu. Anayasa B6 ise listenin açık, kilidin parada olduğunu yazar.

Şimdi:

- `/junior` ders listesi ziyaretçiye açıktır. Sol menüdeki Junior linki bu listeye gider.
- Her dersin **ilk konusu** açılır. Ziyaretçi metni ve görseli görür. Dinle düğmesi durur.
- **İkinci konular** gövde vermez. Ekranda “bu konu veli girişi ve yıllık paket ister” yazar.
- **Anlatış kaydı** (“Şimdi Sen Anlat”) ve **konu testi**, veli oturumu ve açık yıllık paket olmadan çalışmaz. Paket yoksa düğme yerine bu cümle durur: “Anlatış kaydı ve konu testi veli girişi ile yıllık paket ister.”
- Kasa sayfası adres olarak açılır ve satışın kapalı olduğunu söyler. Tahsilat ağzı hâlâ kapalıdır. Kart numarası alınmaz.
- Eski stüdyo adresi (`/studio`) eskisi gibi kapalıdır.

Yerelde ölçülen adresler:

| Adres | Sonuç |
|---|---|
| `/junior` | Açık (200) |
| `/junior/ders/jr_06_mat-1` | Açık. İlk konu görünür. Anlatış kilitli. |
| `/junior/ders/jr_06_ing_main-1` | Açık. Test adımı “Hazırlık Aşamasında”. |
| `/junior/ders/jr_06_mat-2` | Açık kabuk. Gövde yok. Paket ister. |
| `/junior/checkout` | Açık sayfa. Ziyaretçiye “ödeme için veli girişi” der. |
| `/studio` | Kapalı (410) |
| Anlatış ağzı, oturumsuz | Oturum gerekli (401). Satış açılmaz. |
| Kasa ağzı, oturumsuz | Kapalı (410). Para çekilmez. |

### 1.2 Sınıf seçici

Başka sınıf seçilince kartın adı değişiyor, metin 6. sınıf kalıyordu. Bu yanılsama kalktı.

- Yeni profil yalnız **6. sınıf** olarak açılır. Sınıf kutusu kilitlidir.
- 7. veya 8. sınıf isteği reddedilir. Cümle şudur: “Bu sınıf yakında gelecektir. Şu an sadece 6. Sınıf Pilot aktiftir.”
- Raf başlığı artık seçilen sınıfa çekilmez. Kart “6. Sınıf Matematik” olarak kalır.
- Aynı cümle ders listesinin üstünde de durur.

Daha önce kaydedilmiş bir profil başka sınıfta duruyorsa, rozetindeki sayı eski kayıttır. Raftaki metin yine 6. sınıf pilotudur. Bu tur canlı veritabanındaki eski satırları okumadı.

### 1.3 Tek doğru liste

Ücretsiz konu iki yerde ayrı yazılıyordu. Biri “her kartın ilk konusu” diyordu. Diğeri yalnız matematik, fen ve Türkçe’nin ilk konusunu sayıyordu.

Tek ev artık katalogdur. Her kartın ilk konusu ücretsiz izlemedir. İngilizce ve seçmeliler de buna girer. Soru arşivi bu listeyi daraltmaz. Arşivi olan konu ayrıdır: matematik, fen ve Türkçe’nin ilk konusu.

Yetişkin fiyatında üçüncü bir liste açılmadı. Tohum, kurs kartındadır. Müşterinin ödediği tutar, veritabanındaki fiyat satırıdır. Tohum, satır varken onu ezmez. Bu düzen bu turda bozulmadı. Canlı vitrindeki rakam, fiyat satırı okunmadan ilan edilmez.

### 1.4 Süper yönetici notu

`yapinet360@gmail.com` için kod içi cümleler, üretimdeki işe çekildi.

- Doğrulanmış bu kutu, yetişkin derste satın alma satırı olmadan **ders gövdesini** izler.
- Üretimde sınavı ve sertifikayı atlamaz. Sınırsız laboratuvar geçişi yalnız üretim dışında doğar.
- Junior’da paket kuralı bu kutu için de durur. İkinci konu, anlatış ve konu testi paket ister.

### 1.5 Soru arşivi olmayan konu

Ana İngilizce, bütün ikinci konular ve altı seçmeli dersin konu testi yoktu. Test kurulamayan konuda puanlama yapılmıyor.

Ekranda ve serviste bu konular **“Hazırlık Aşamasında”** yazar. Boş test, dersi bitmiş saymaz. On soruluk arşivi olan üç konuda test, paket ve anlatış şartıyla eskisi gibi durur. Baraj değişmedi: on soruda en az yedi doğru.

### 1.6 Junior PayTR

Deneme mağaza numarası `000000` satış açmaz. Deneme anahtarı, deneme tuzu ve sandbox da açmaz. Üretim kilidi dururken, canlı üçlü gelse bile bu sürümde tahsilat bağlanmaz. Kasa yine “bağlı değil” der. Kart, güvenlik kodu ve kimlik numarası bu ekranda alınmaz.

---

## 2. Dosyalar

### Silinen

- `docs/TESPIT_RAPORU_.md` — alt çizgili eski kardeş. Canlı tespit `docs/TESPIT_RAPORU.md` dosyasıdır.

### Yeni

- `docs/TEDAVI_RAPORU.md` — bu rapor.

### Düzenlenen kod

- `lib/kernel/security/edge-guard.ts` — `/junior` artık toptan kapanmaz.
- `lib/kernel/security/edge-api-auth.ts` — anlatış, pekiştirme ve konu testi ağızları toptan kapanmaz. Oturum ister.
- `lib/kernel/compliance/circuit-breakers.ts` — para kilidi durur. Anlatış ağızlarının adı ayrıldı.
- `lib/dronlar/kayit.ts` — Junior yorumu listeye uyar.
- `lib/junior/limits.ts` — pilot cümlesi, paket cümlesi, hazırlık etiketi. İkinci ücretsiz liste silindi.
- `lib/junior/catalog.ts` — ücretsiz listenin tek evi. Raf başlığı sınıfa göre değişmez.
- `lib/junior/profile-rules.ts` — yeni profil yalnız 6. sınıf.
- `lib/junior/service.ts` — anlatış ve test paket ister. Arşivsiz test hazırlık der. Sınıf değişimi 6 dışında reddedilir.
- `lib/junior/topic-quiz.ts` — arşivi hazır mı, tek soru.
- `lib/junior/question-bank.ts` — arşivi olan konuların listesi.
- `lib/junior/paytr.ts` — deneme mağaza numarasıyla satış kapısı.
- `lib/junior/checkout.ts` — kasa, bu kapı geçmeden tahsilat yapmaz.
- `lib/junior/load.ts` — ders sayfası paketin açık olup olmadığını taşır.
- `lib/academy/access.ts` — süper yönetici yorumu.
- `lib/academy/exam-engine.ts` — sınav yorumu.
- `lib/academy/curriculum-engine.ts` — izleme ile sınav ayrımı.
- `app/junior/page.tsx` — pilot cümlesi listede.
- `app/junior/ders/[lessonKey]/page.tsx` — ziyaretçi ilk konuyu görür. İkinci konu kilitli kabuktur.
- `app/api/junior-pilot/tell/route.ts` — toptan kilit kalktı. Kural servistedir.
- `app/api/junior-pilot/quiz/route.ts` — aynı.
- `app/api/junior-pilot/practice/route.ts` — aynı.
- `components/junior/listen-and-tell.tsx` — anlatış ve test kilitleri.
- `components/junior/lesson-chain.tsx` — aynı kilitleri taşır.
- `components/junior/visual-course-cards.tsx` — ikinci konu “Kilitli konu” der.
- `components/junior/profile-switcher.tsx` — sınıf kutusu 6’da kilitli.
- `components/junior/checkout-form.tsx` — deneme anahtarı satış açmaz cümlesi.
- `scripts/verify-junior-pilot-seals.ts` — mühür, yeni kapıya uyar.

### Düzenlenen belgeler

- `.system_docs/ANAYASA.md` B6 — liste, ilk konu, ikinci konu, anlatış, test, sınıf ve para aynı cümlede.
- `.system_docs/PEDAGOJI.md` — Junior cümlesi aynı kapıya çekildi.

### Düzenlenen testler

- `tests/kernel/edge-guard.test.ts`
- `tests/kernel/junior-faz2-pilot.test.ts`
- `tests/kernel/junior-checkout.test.ts`
- `tests/kernel/junior-question-bank.test.ts`
- `tests/kernel/junior-lesson-chain.test.ts`
- `tests/kernel/junior-guardian-consent.test.ts`

---

## 3. Doğrulama

Junior kapı, katalog, kasa, soru arşivi ve kenar testleri yeşil bitti. Junior mühür scripti de yeşil bitti.

Yerel sayfa açıldı. Ziyaretçi ders listesini, 6. sınıf başlıklarını ve pilot cümlesini gördü. İlk matematik konusu gövdesiyle açıldı. İkinci konu gövde vermedi. Ana İngilizce’de hazırlık yazısı durdu. Stüdyo kapalı kaldı.

---

## 4. Elle ve canlı ortamda duran işler

Bunlar bu turda kodla bitmez.

1. **Yasal kilit duruyor.** Veli doğrulaması ve hukuki altyapı bitmeden Junior para akışı açılmaz. Yeni paket satışı bu sürümde yoktur. Kilidi indirmek ayrı ve bilinçli bir karardır. İndirince açma bayrağı da ayrıca açılır. İkisi birden gerekir.
2. **Canlı PayTR üçlüsü bu oturumda okunmadı.** Canlı mağaza numarası, anahtar ve tuz yerinde değilse satış açılmaz. Deneme numarası `000000` yerinde durduğu sürece de açılmaz. Fatura ve bildirim hattı bu pakete bağlanmadan 5.499 TL tahsil edilemez.
3. **Soru arşivi eksik.** Ana İngilizce, bütün ikinci konular ve seçmeli dersler on soruluk arşiv bekler. O arşiv yazılmadan bu konuların testi “Hazırlık Aşamasında” kalır. Çocuk bu konularda dersi “bitti” sayamaz.
4. **İki konu, tam yıl değildir.** Ürün sözü “6. sınıfın tamamı” olmamalıdır. Söz, dört çekirdekte ve seçmelilerde ikişer konu olan bir pilottur. Üç çekirdeğin ilk konusunda test vardır.
5. **Profil yazma ağzı hâlâ kilitli.** Yeni çocuk profili, seçmeli kayıt ve sınıf yazma ağızları yasal kilit dururken kapalıdır. Liste ve ilk konu bu kilide girmez. Anlatış, ancak hesapta zaten açık bir paket ve duran bir profil varsa işler. Yeni veli bu turda profil açamaz.
6. **Eski profil sınıfı.** Canlı veritabanında 6 dışında kalmış bir çocuk rozeti varsa, metin yine 6. sınıf pilotudur. O satırlar bu oturumda düzeltilmedi.
7. **Yetişkin vitrin üçlüsü ölçülmedi.** Hangi kartın bugün gerçekten satıldığı; yayın satırı, aktif fiyat ve beş katmanın diskte durması okunmadan ilan edilmez.
8. **Süper yönetici Junior paketi almadan ikinci konuyu açamaz.** Bu, yetişkin izleme muafiyetinden ayrıdır ve bu turda böyle bırakıldı.
