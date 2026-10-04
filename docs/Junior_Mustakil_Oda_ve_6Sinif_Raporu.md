# Junior — Müstakil Oda ve 6. Sınıf Pilotu

| Alan | Değer |
|------|--------|
| Tarih | 4 Ekim 2026 |
| Kime | CEO ve SUPER_ADMIN |
| Kimden | Cursor Ajanı |
| Dil | Vatandaş lisanı. Dosya adı, yalnız «nerede duruyor» diye parantez içinde geçer. |
| Karar | Junior, Akademi’nin iç kanalı değildir. 10-18 yaş, veli hesabı altında, veli rızalı müstakil odadır. Pilot sınıf 6’dır. |

---

## 1. Kısa sonuç

Junior, Akademi kayıt defterinden çıktı. Kendi odasında duruyor. Pilot üç derstir: Matematik, Fen Bilimleri, Türkçe. Her dersin ilk konusu ücretsizdir. Dinle ve Anlat bu üç konuda açıktır.

Değerlendirme cümlesi, çocuğun doğum yılına göre değişir. 10-12 sıcak ve cesaretlendiricidir. 13-14 hedef odaklıdır. 15-18 net ve doğrudandır. Dersin kazanımı aynı kalır. Değişen, sesin üslubudur.

Ziyaretçi `/junior` adresinde hâlâ **410** görür. Menüde Junior yoktur. Para kapısı açık değildir. Akademi vitrininde altı yetişkin eğitim durur.

Tip denetimi geçti. Test paketi geçti: **248 dosya, 1214 test, hepsi yeşil.**

---

## 2. Belgeler

`ANAYASA.md` B2 maddesine şu kural yazıldı:

> Junior modülü, 10-18 yaş grubuna veli hesabı altında müstakil bir oda olarak hizmet veren veli rızalı özel kanaldır.

«18 yaş altı ürün yoktur» cümlesi bu maddede zaten yoktu. Yeni kural onun yerine duruyor. B6 aynı cümleyi bağlar. Ekler: sahte bakiye yok, her dersin ilk konusu ücretsiz, pilot sınıf 6, kartlar `jr_06_mat`, `jr_06_fen`, `jr_06_turkce`. Akademi defterine girmez. Ziyaretçi kapısı ayrı karardadır.

`PEDAGOJI.md` Ek-J üç yaş üslubuyla genişledi:

| Grup | Sınıf okuması | Üslup |
|------|----------------|--------|
| 10-12 | 5, 6 ve 7. sınıf | Merak uyandıran, sıcak, oyunlaştırması yüksek, cesaretlendirici |
| 13-14 | 8. sınıf / LGS | Hedef odaklı, sınav stresini yöneten, stratejik, ritmik |
| 15-18 | 9, 10, 11 ve 12. sınıf | Analitik, genç yetişkin saygısında, akran rehberliğinde net ve doğrudan |

`MANIFESTO.md` Ek-J, Junior’u Akademi’nin iç kanalı sayan cümleden çıktı. Kendi odasıdır. Panel, Akademi ve Kariyer vitrini durur.

Kilitli model haritasına dokunulmadı. Yetişkin beş katman kuralı gevşetilmedi.

---

## 3. Müstakil oda

Akademi kurs defterinden `jr_05_fen` kartı silindi. Defterde 14 yetişkin kart kaldı. `jr_` ile başlayan kod bu deftere yazılamaz.

Junior’un evi `lib/junior` klasörüdür. Oda kaydı `lib/dronlar/kayit.ts` içinde `INDEPENDENT_ROOMS` satırındadır. Kimlik `junior`, yol `/junior`.

Bu oda dört kamu vitrinine eklenmedi. Menüde Anasayfa, Akademi ve Kariyer durur. Ziyaretçi kapısı eskisi gibi kapalıdır. Oturum açmış veli aynı adreste 6. sınıf raflarını görür.

Eski harçlık motoru arşivde kaldı. Taşınmadı.

---

## 4. 6. sınıf pilotu

| Ders | Kod | İlk konu (ücretsiz) | Sıradaki konu |
|------|-----|---------------------|----------------|
| Matematik | `jr_06_mat` | Bir bütünü eşit parçaya bölmek | Payda aynıyken toplama |
| Fen Bilimleri | `jr_06_fen` | İtmek ve çekmek kuvvettir | Sürtünme |
| Türkçe | `jr_06_turkce` | Metnin ana fikri | Yardımcı fikir |

İlk konuda metin, Dinle ve Anlat ve pekiştirme vardır. Pekiştirme iki seçmeli soru ve bir eşleştirmedir. Doğru şık tarayıcıya baştan gitmez. Puan sunucuda hesaplanır.

İkinci konu listede görünür. Oynatılmaz. «Sırada» der.

Metinler özgün yazıldı. Okul kitabı kopyalanmaz. 5. sınıf Güneş ünitesi bu pilottan çıktı.

Profil formunda sınıf varsayılanı 6’dır. Aralık hâlâ 5 ile 12’dir.

---

## 5. Yaş üslubu

Sistem istemi, seçili profilin doğum yılını okur. Üç hazır cümleden birini başına koyar.

| Doğum yılı örneği (2026) | Yaş | İstem |
|--------------------------|-----|--------|
| 2015 | 11 | 10-12 |
| 2012 | 14 | 13-14 |
| 2009 | 17 | 15-18 |

10 yaşın hemen altındaki kenar, 10-12 üslubuna girer. 18 üstü kenar, 15-18 üslubunda kalır.

Rol yenidir diye açılmadı. Kimlik, kilitli haritadaki hızlı akış rolünden okunur. Ses yine saklanmaz. Sertifika ve kariyer vizesi verilmez.

---

## 6. Tarayıcıda görülen

Yerel sunucu bu oturumda açıldı (`http://127.0.0.1:3000`).

- `/junior` ziyaretçiye **410** dedi. Başlık: «Junior üretimde kapalı». Menüde Junior yok. Mikrofon yalnız bu yolda `microphone=(self)`.
- `/academy` **200** dedi. Altı yetişkin eğitim duruyor. Mikrofon `microphone=()`. Katalogda 6. sınıf kartı yok.

Dinle ve Anlat ekranı veli oturumu ister. Bu oturumda veli girişi yapılmadı. Oynatıcı tıklanmadı. Ücretsiz konu, kilitli konu ve üç üslup birim testle doğrulandı.

---

## 7. Doğrulama

| Kapı | Sonuç |
|------|--------|
| `npx tsc --noEmit` | Geçti (çıkış kodu 0) |
| `npm test` | Geçti. 248 dosya, 1214 test, 0 kırmızı. Süre yaklaşık 73 saniye. |

`npm test` yüzey dosyalarını çalıştırmaz. Bu, önceki Junior raporlarındaki aynı sınırdır.

---

## 8. Bilerek yapılmayanlar

- Ziyaretçi kapısı açılmadı. Para kapısı açılmadı. Menüye oda eklenmedi.
- Veritabanı kurulumu bu oturumda canlıya basılmadı.
- 7, 8 ve lise sınıflarının ders metni yazılmadı. Üslup hazır. İçerik 6. sınıfın ilk konusundadır.
- Hukuk görüşü değildir. Çocuk verisi ve sesin yurt dışına gitmesi müşavir işidir.
