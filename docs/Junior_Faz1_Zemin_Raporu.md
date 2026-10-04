# Junior Faz 1 — Zemin Raporu

| Alan | Değer |
|------|--------|
| Tarih | 4 Ekim 2026 |
| Kime | CEO ve SUPER_ADMIN |
| Kimden | Cursor Ajanı |
| Dil | Vatandaş lisanı. Dosya adı, yalnız «nerede duruyor» diye parantez içinde geçer. |
| Faz | 1 — karar, belge, kayıt defteri ve güvenlik zemini. Çocuk henüz bu kanalı görmez. |

---

## 1. Kısa sonuç

Yetkin Junior’un kuralı yazıldı. Yetişkin ürününün kilitleri duruyor. `/junior` adresi hâlâ kapalı (410). Mikrofon bütün sitede kapalı; yalnız bu adres ailesinde tarayıcıya «kendi sitem» izni verildi. Pilot kart deftere taslak olarak girdi: **5. Sınıf Fen Bilimleri**.

Tip denetimi geçti. Test paketi geçti: **247 dosya, 1207 test, hepsi yeşil.**

---

## 2. Ne değişti

### Belgeler

`ANAYASA.md` B2 maddesindeki «18 yaş altı ürün yoktur» cümlesi kalktı.

Yerine **B6 Yetkin Junior** geldi. Ana cümle, karardaki metindir:

> Junior modülü 10-18 yaş (5-12. sınıf) öğrencileri için veli hesabı altında, veli rızasıyla çalışan, sahte bakiye tutmayan ve her dersin ilk konusu ücretsiz sunulan özel kanaldır.

B6’ya üç kısa ek kondu. Bunlar ana cümleyi değiştirmez. Bugünkü gerçeği yazar:

- Junior dördüncü kamu odası değildir. Panel, Akademi ve Kariyer durur.
- Ziyaretçi kapısı ayrı bayraktadır. Bayrak kapalıyken `/junior` açılmaz.
- Junior kursu kariyer vizesine girmez.

`MANIFESTO.md` ve `PEDAGOJI.md` sonuna **Ek-J: Junior Pedagojisi ve Veli Modeli** eklendi.

Ek-J’nin özü:

- **Dinle ve Anlat:** Çocuk dersi dinler, sonra aynı konuyu kendi sözüyle anlatır. Anlatış seslidir. Mikrofon yoksa yazarak anlatır. Bu anlatış öğretir. Sertifika, mühür ve iş vizesi vermez.
- **Veli modeli:** Hesap velinindir. Çocuk, veli hesabının altında bir profildir. Rıza yoksa kanal kapalıdır.
- **Çocuk güvenliği:** Sahte bakiye, harçlık ve kredi yoktur. Oyun puanı para değildir. Ses saklanmaz. Çocuk başkasıyla yazışamaz. Reklam ve paralı ödül yoktur. Çocuğun adı herkese açık doğrulama sayfasında görünmez. Okul kitabı metni kopyalanmaz.
- Yetişkin ofis dersinin kuralları (Deniz usta, beş katman, süre tabanı) gevşetilmedi. Pedagoji §A.3 duruyor: Junior başlangıç seviyesi değildir. Yetişkin başlangıcı Temel Paketlerdir.

Kilitli model haritasına dokunulmadı.

### Tek kurs kayıt defteri

Dosya: `packages/kernel/src/catalog-ids/course-registry.ts`.

- Her karta `audience` alanı eklendi: `"adult"` veya `"junior"`.
- Mevcut 14 yetişkin kartın hepsi `"adult"`.
- Sayı kilitleri yalnız yetişkin kartlara bakıyor: kanon 13, kanon dışı yalnız OFF-201, vitrin sırası 1–6, mobil liste 2 kart, pasaport kapısı 5 kod.
- Taslak Junior kartı eklendi: `jr_05_fen` / `JR-05-FEN` / kitle `junior`.
- Junior kartta pasaport kapalı, mobil liste kapalı, yetişkin vitrin sırası yok, kanon değil.
- Ders yolu boş. İçerik yokken yetişkin mühür listesine ve satış listesine sızmasın diye sınav yolu da yalnız yetişkin kartları okuyor (`exam-path.ts`). İlk konu yazılınca ücretsiz açılacak. O anahtar, yetişkin ses mührünün içine yazılmayacak. Bu süzgeç şimdiden duruyor.

### Mikrofon

Dosya: `lib/kernel/security/edge-security-headers.ts`.

- Akademi, kariyer, ödeme ve diğer bütün yollar: `microphone=()`.
- `/junior` ve alt yollar: `microphone=(self)`. Kamera hâlâ kapalı. Ödeme izni (PayTR) aynı.
- `/juniorism` ve `/academy/junior` bu izni almaz.
- Kenar (`proxy.ts`) isteğin yoluna göre başlığı basar. Site ayarı (`next.config.ts`) Junior yolunu genel yasaktan ayırır. İki başlık üst üste binip mikrofonu yeniden kapatmasın diye genel kural Junior yolunu dışarıda bırakır. Bu ayrım, Next’in kendi yol eşleştiricisiyle denendi.

Test: `tests/kernel/edge-guard.test.ts`.

### Eski Junior yolları

Eski oda arşivde duruyor. Canlı ürün onu yeniden çalıştırmıyor.

- Canlı test takma adı Junior’u artık arşive bağlamıyor (`vitest.aliases.ts`). Yeni `lib/junior` klasörü doğunca testler yanlışlıkla eski kodu çalıştırmaz.
- Donmuş envanter koşusu (`vitest.frozen.config.ts`) eski testleri arşive bağlamaya devam eder. O koşu `npm test` içinde değildir.
- Yayın paketi `lib/junior/**` yolunu artık dışlamıyor (`next.config.ts`). İleride yazılacak canlı kod paketten düşmez. Arşiv klasörünün kendisi pakete girmez.
- Tip denetimindeki eski Junior test dışlaması **yerinde bırakıldı** (`tsconfig.json`: `tests/junior/**` ve iki yardımcı dosya). Bu dışlama bir kez kaldırıldı. Tip denetimi kırmızı oldu: o testler `@/lib/junior/...` çağırıyor, canlıda böyle bir klasör yok. Eski odayı bu fazda diriltmedik. Dışlama, canlı denetimin yeşil kalması için duruyor.

`/junior` hâlâ donmuş oda listesinde. Üretim kilidi (`JUNIOR_PRODUCTION_LOCKED`) açık değil. Bu faz kapıyı açmadı.

---

## 3. Yetişkin ürünü

Şunlar değişmedi:

- Kanon 13 ve OFF-201.
- Vitrin sırası, mobil iki kart, pasaport beş kod.
- Satış listesi ve ses mühür listesi (altı yetişkin eğitim).
- Beş katmanlı üretim kuralı ve kilitli model haritası.
- Ödeme başlığı (PayTR).
- Panel, Akademi, Kariyer vitrini.

Yeni test bunu kilitliyor: `tests/kernel/junior-faz1-ground.test.ts`.

Bu fazda ekranda yeni bir sayfa yok. Tarayıcıda bir akış gezilmedi. Başlık kuralı birim testle ve yol eşleştiriciyle doğrulandı.

---

## 4. Doğrulama

| Kapı | Sonuç |
|------|--------|
| `npx tsc --noEmit` | Geçti (çıkış kodu 0) |
| `npm test` | Geçti. 247 dosya, 1207 test, 0 kırmızı. Süre yaklaşık 75 saniye. |
| Yeni kayıt defteri testi | 2 test yeşil |
| Mikrofon testi | `edge-guard` 12 test yeşil |

`npm test` yüzey (surface) dosyalarını ve bir kazanç köprüsü dosyasını zaten çalıştırmaz. Pedagoji cümlesini okuyan yüzey testi, yeni Ek-J metnine göre güncellendi. O dosya bu paketin içinde değildir.

---

## 5. Bu fazda bilerek yapılmayanlar

- Çocuk profili, veli rızası ekranı, veritabanı tablosu yok.
- Dinle ve Anlat oynatıcısı yok. Mikrofon izni hazır; kayıt kodu yok.
- `/junior` açılmadı.
- Eski harçlık / cüzdan kodu arşivden taşınmadı. Taşınmamalı.
- Fiyat satırı yok. Pilot kartın tohum tutarı 0. Canlı fiyat veritabanı satırıdır.
- Ses mührü yok. Karttaki ses adı yer tutucudur. Fırın bu kartı görmez.
- Hukuk görüşü değildir. KVKK, çocuk verisi ve okul kitabı telifi müşavir işidir.

---

## 6. SEN OLSAYDIN NE YAPARDIN? — Faz 2 (Kapalı Pilot ve Dinle-Anlat Oynatıcısı)

Kapıyı açmazdım. Bayrak kapalı kalsın. Davetli 30–50 aile, para yok. Ölçü tutmazsa tek anahtarla kanal kapanır. Yetişkin Akademi’ye dokunulmaz.

Sırayı şöyle kurardım.

**1. Önce veli, sonra çocuk.** Ayrı çocuk e-postası açmam. Veli girer. Altında takma adlı bir profil seçer. Rıza kutusu işaretlenmeden ders açılmaz. Eski arşivdeki davet jetonunun fikri işe yarar (düz metin saklanmaz, süresi vardır). Harçlık motorunu almam. O ikinci bir bakiyedir. Anayasa buna izin vermez.

**2. Dinle ve Anlat’ı küçük tutarım.** Mevcut ders oynatıcısına kontrol noktası eklerim. Ders durur. Çocuk 15–45 saniye konuşur. Sunucu o dersin kazanımına göre üç parça döner: doğru söylediğin, eksik kalan, bir sonraki adım. Ses hemen silinir. Kalan, yazı ve öğretici nottur. Mikrofon reddedilirse aynı iş yazıyla yapılır. Serbest sohbet yoktur. Konu dışı söz geri çevrilir. Emin değilse «emin değilim» der.

**3. Konuşma notu mühür olmaz.** Resmî sınav çoktan seçmeli kalır ve sunucuda puanlanır. Sesli anlatış öğretir, rozet veya seri verebilir. Sertifika ve kariyer vizesi vermez. Çocuğun adı `/academy/dogrula` sayfasına çıkmaz.

**4. Model haritasına dokunmam.** Sesin anlamını hangi rolün okuyacağı SUPER_ADMIN kararıdır. Benim tercihim yeni rol açmamak, mevcut canlı sohbet rolünün kapsamını sormaktır. Kararı haritaya ben yazmam. Günlük kullanım tavanı Junior için ayrı durur. Çocuk başına kısa kayıt sınırı konur.

**5. İçerik tek ünitedir.** 5. sınıf fen, bir ünite, sekiz ile on kısa ders. Metin özgün yazılır. Kitaptan kopyalanmaz. Bir öğretmen metni okumadan çocuk duymamalı. Yetişkin «beş dakika, altı yüz kelime» tabanı bu derse zorlanmaz. O kural yetişkin dosyasında kalır. Junior için ayrı, kısa bir üretim kuralı yazılır. Yetişkin kural gevşetilmez.

**6. Parayı ve oyunu ayırırım.** Oyun puanı cüzdana girmez. Parayla alınamaz, paraya çevrilemez. Günlük hedefin tavanı vardır. Seri kaçırmak ceza doğurmaz. Paralı kutu yoktur.

**7. Depoyu küçümsemem.** `public/` klasörü doluya yakın. Pilot ünitesi küçük tutulur. Bir sınıfın tamamı diske sığmaz. Ünite sığmazsa önce dosyayı nesne deposuna almak gerekir. Mühür «dosya gerçekten var» diye bakar. Yer, yetişkin kuralın ruhunu bozmadan değişebilir. Bu fazın işi değildir. Pilot şişerse önüne geçer.

**8. Eski test dışlamasını körle silmem.** `tsconfig.json` içindeki Junior satırları, eski odanın testleridir. Canlı klasör yazılınca ya o testler yeni yapıya taşınır ya da dışlama kalkar. İkisini birden, hazırlıksız yapmak tip denetimini kırar.

Faz 2’ye geçiş kapısı olarak şunu isterdim: hukuk müşaviri çocuk verisi ve ses için yazılı not versin, davetli liste hazır olsun, kill-switch bir kez tatbik edilsin, yetişkin testleri yine tam yeşil kalsın.
