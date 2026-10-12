# Tedavi Raporu — yetkin.ai

| Alan | Değer |
|------|--------|
| Tarih | 9 Ekim 2026 |
| Dayanak | `docs/tespit_raporu.md` ve bu turdaki CEO kararları |
| Kapsam | 2. aşama: tek kaynak, Junior dürüstlük, Super Admin, belge hizası |
| Sonuç | Kod ve belgeler güncellendi. Kasa açılmadı. 7. sınıf metni yazılmadı. |

Bu rapor yapılan işi ve duran riski yazar. A katmanı (para, kimlik, mühür, dürüst kapı) gevşetilmedi.

---

## Özet

| Adım | Sonuç |
|------|--------|
| İptal ses arşivi | Silindi. 8 dosya, 144.004.968 bayt (yaklaşık 137 MB). |
| `DRON_JUNIOR_OPEN` | Yalnız profil masası. Oda kapısı `DRON_JUNIOR_ROOM_OPEN`. |
| Seçmeli İngilizce `jr_06_ing` | Katalogda taslak kaldı. Fiyat vaadi ve kota listesinden çıktı. |
| Junior mühür diski | Ses klasörü duruyorsa MP3 `stat` edilir. Yok veya boşsa konu taze sayılmaz. |
| Soru vaadi | Arayüz adı **3 Soruluk Hızlı Konu Kontrolü**. «10 Soruluk Test» başlığı kalktı. |
| Super Admin | Üretimde yerleşik kutu, `SUPER_ADMIN_USER_ID` doluysa o UUID ile birebir eşleşmeden açılmaz. Env boşsa kurtarma durur. |
| Mimari ad | Belgelerde kanonik ad güçlendirildi. Yetişkin beş katman ile Junior mühür ayrıldı. |

Etkilenen Vitest dosyaları bu turda geçti: Super Admin, Junior kasa ve seçmeli kota, kapalı beta, müfredat zinciri ve mühür, haftalık rapor, Akademi erişim, üretim standardı, Faz 1 işletme resmi.

Tarayıcıda `/junior` uçtan uca açılmadı. Bu oturumda geliştirme sunucusu çalıştırılmadı. Dürüstlük cümleleri bileşen ve birim testiyle doğrulandı.

---

## 1. Bilgi tekilliği ve atıl dosya

### 1.1 İptal ses

`archived/academy-audio-revoked/` silindi. Canlı oynatıcı bu klasörü okumuyordu. Kalan `archived/` ağacı (eski Junior motoru ve donmuş odalar) duruyor. O silme bu turun kararı değildir.

`.cursorrules` arşiv satırına not düşüldü: bu yol ürün değildir ve depoya geri konmaz.

### 1.2 İki bayrak

Aynı env iki iş görüyordu. `DRON_JUNIOR_OPEN=0` profil masasını kapalı tutarken `DronBayrakları.isKapali("junior")` odayı da 410 yapıyordu. Runbook ise «bu değer bütün adresi 410 yapmaz» diyordu.

| Env | İş | Boşken | `0` / `closed` | `1` / `open` |
|-----|----|--------|----------------|--------------|
| `DRON_JUNIOR_OPEN` | Profil masası | Kapalı beta | Profil kapalı. Oda durur. | Oturumlu veli profil masasına girer. Ders kilidi ve kasa açılmaz. |
| `DRON_JUNIOR_ROOM_OPEN` | Oda 410 | Vitrin açık (`kapali: false`) | `/junior` kamu yüzü kapanır | Vitrin açık |

Evler: profil `lib/kernel/security/junior-gate.ts`, oda `lib/dronlar/kayit.ts`. `isKapali`, satırda `bayrakEnv` doluysa yalnız o adı okur. Junior satırı `DRON_JUNIOR_OPEN` adlı otomatik düşüşe bakmaz.

Kayıt satırındaki `sahipEkip: "amiral"` düz metne çekildi: `gövde`. Bu, oda sahibini değiştirmez. Eski sürü adını kod kimliği olmaktan çıkarır.

**Operatör notu.** Canlıda `DRON_JUNIOR_OPEN=0` odayı kapatmak için duruyorsa, bu dağıtımdan sonra oda açık kalır. Odayı kapatmak `DRON_JUNIOR_ROOM_OPEN=0` ister. Profil için `DRON_JUNIOR_OPEN=1` aynı işi görür.

### 1.3 İkinci İngilizce kart

Çekirdek `jr_06_ing_main` (20 konu, «6. Sınıf İngilizce») yerinde.

`jr_06_ing` silinmedi. Seçmeli katalogda, `band: "draft"`, rozet **Hazırlık Aşamasında**.

Fiyat vaadinden çıktı:

- Kota penceresi ve kasa sepeti bu slug’ı listelemez (`juniorElectivePicks`).
- Kayıt reddeder: «Bu ders hazırlık aşamasındadır. Yıllık paket vaadine girmez.»
- Yıllık paket açık olsa ve slug kayıtlı kalsa da ikinci konu açılmaz.
- Vitrin kartı ders başlığını taşır. Üstüne ikinci bir «İngilizce ürün» başlığı basılmaz. Kart, çekirdek dersin 6. Sınıf İngilizce olduğunu ve bu taslağın fiyata girmediğini yazar.

Diğer beş seçmeli kart kota listesinde durur. Onlar da mühürsüzdür ve «Hazırlık Aşamasında» rozetini taşır.

---

## 2. Junior 6. sınıf dürüstlük ve mühür

### 2.1 Disk

`juniorProductionSealGaps` ses anahtarını bellekte görünce bitmez.

`lib/junior/production-seal-disk.ts` `stat` eder:

- Dosya var ve boyutu sıfırdan büyükse ses kapısı geçer.
- Klasör duruyor, dosya yok veya boşsa `audio` açığı düşer. Kart `fresh` olmaz.
- Klasör bu süreçte yoksa (Vercel paketine girmeyen ağaç, `lib/media/offload.ts`) tek tek yokluk uydurulmaz. Anahtar listesi durur.

Bu son satır bilinçlidir. Junior MP3’leri git dışıdır ve fonksiyon diskine konmaz. Canlı okuma CDN’dedir. Klasör yokken 105 konuyu «hazırlık» saymak, duran kaseti kayıp ilan eder.

Makinede klasör dururken eksik bir MP3 artık taze görünmez. Bu depoda klasör duruyor. Çekirdek mühür testi boş açıkla geçti. Yani bugünkü 105 anahtar, bu diskte boş olmayan MP3 ile örtüşüyor.

### 2.2 Üç soru

Çekirdek paket üç sorudur. Eşik `JUNIOR_QUIZ_MIN_ITEMS = 3` değişmedi. On soruya çıkarılmadı.

Ad `JUNIOR_QUIZ_CONTROL_LABEL`: **3 Soruluk Hızlı Konu Kontrolü**.

| Yüzey | Eski | Yeni |
|-------|------|------|
| Konu ekranı başlığı | Konu Testi | 3 Soruluk Hızlı Konu Kontrolü |
| Anlatış düğmesi | Konu Testini Çöz | Aynı ad |
| Kilit cümlesi | konu testi | 3 soruluk hızlı konu kontrolü |
| Veli raporu başlığı | 10 Soruluk Test Başarı Grafiği | 3 Soruluk Hızlı Konu Kontrolü |

Soru dosyaları yeniden yazılmadı. Vaadin adı, paketin boyuna çekildi.

---

## 3. Super Admin

Ev `lib/kernel/auth/super-admin.ts`. `users.role` kolonu açılmadı.

Üretimde `yapinet360@gmail.com`:

| Durum | Admin |
|-------|--------|
| E-posta doğrulanmamış | Hayır |
| `SUPER_ADMIN_USER_ID` boş, e-posta doğrulanmış | Evet. Kurtarma kapısı. |
| Env dolu ve oturum kimliği o UUID | Evet |
| Env başka bir kişiye yazılmış | Hayır. Doğrulanmış kutu artık bunu delmez. |

Geliştirmede doğrulanmış yerleşik kutu UUID beklemez. Vatandaş test hesabı (`yetkin.vision@gmail.com`) yine admin olamaz. Başka bir adres üretimde kanonik e-posta ve UUID çiftini birlikte ister.

**Operatör notu.** Vercel’de `SUPER_ADMIN_USER_ID` dolu ve `yapinet360@gmail.com` kullanıcısının kimliği değilse, bu dağıtım o kutunun yönetimini kapatır. Kurtarma için env’i o hesabın UUID’sine çekin veya boşaltın. Boşaltmak, doğrulanmış kutuyu yeniden kurtarma kapısı yapar. Canlı satır bu oturumda okunmadı.

---

## 4. Belge hizası

Kanonik ad: **Pragmatik Monolit + `@yetkin/kernel` + Tek Native İstemci (`apps/rail-is`)**.

| Belge | Ne değişti |
|-------|------------|
| `.cursorrules` | Ad, gövde / kayıt / `apps/rail-is` karşılığı. Yetişkin mühür satırı ile Junior mühür satırı ayrıldı. |
| `AGENTS.md` | Beş katman cümlesi yetişkin Akademi videosu oldu. Junior kapı ayrı paragraf. |
| `.system_docs/PEDAGOJI.md` | §B başlığı yetişkin sıra. Ek-J’de iki kapının tablosu. |
| `.system_docs/ANAYASA.md` B4 | «Hiçbir eğitim videosu» cümlesi yetişkin videoya çekildi. Junior `assertJuniorProductionSeal`. |
| `.system_docs/MANIFESTO.md` | Mimari paragraf B1’de kalır. Tek native istemci yolu `apps/rail-is` olarak yazıldı. Paket adı bu belgede ikinci kez açılmaz. |
| `.system_docs/OPS_RUNBOOK.md` | İki Junior bayrağı ve geri alma. |

Model haritası (`.system_docs/AKADEMI_URETIM_ANAYASASI.md`) ve `lib/kernel/ai/model-roles.ts` dokunulmadı.

Yetişkin kapı: metin, ses, yerel ısınma videosu, `IMAGE_GEN` görseli, dersin müzik yatağı.  
Junior kapı: metin, fırınlanmış ses, kart başına ısınma, en az üç soru, SVG sahne. Görsel vektör sahnedir. Müzik tek yataktır.

---

## 5. Görüş

### 5.1 Sen olsan ne yapardın

Yeni servis, yeni veritabanı ve ikinci native oynatıcı açmam. Monolit duruyor. Bu turdan sonra ilk işim mühür kanıtını fonksiyon diskine bağlamaktan çıkarmak olur.

Junior sesi git dışıdır ve Vercel paketine girmez. `stat` bu yüzden yalnız ses klasörünün durduğu makinede kesin konuşur. Canlı fonksiyon klasörü görmeyince anahtar listesine döner. Akademi satış kapısı bunu manifestoyla çözer. Junior için aynı tür bir anlık isterim: fırın bitince her ders anahtarının yolu, baytı ve özeti bir mühür anlığına yazılsın. Canlı kart o anlığı okusun. Klasör yok diye 105 konu sahte taze kalmasın. Klasör var diye de CDN’deki sağlam kaset hazırlık sanılmasın.

Bunu yapmadan kasayı açmam. Hukuk imzası (aydınlatma, canlı PayTR üçlüsü, `JUNIOR_CHECKOUT_OPEN`) kod haftası değildir. Denetim kutusu alıcı olmaz.

### 5.2 Gelecek master planı — 6. sınıf yayını sonrası 7. sınıf

**0. hafta — bu dağıtım.** `SUPER_ADMIN_USER_ID` yerleşik kutu ile aynı mı bakılır. Oda kapatılacaksa yeni env yazılır. Eski `DRON_JUNIOR_OPEN=0` oda kilidi sanılmaz.

**Satış haftası — hâlâ 6. sınıf.** Beş çekirdek kart. Seçmeli İngilizce taslak fiyatta yok. Üç soruluk kontrol adı değişmez. Kasa üç koşul birden imzalanınca açılır. Bir deneme velisi (Super Admin değil) bir CLEARED sipariş yazar. Aynı `merchant_oid` süreyi ikinci kez uzatmaz.

**Sonraki çeyrek — seçmeli, ikinci sınıf değil.** Kota en fazla üç kart. Her kart Junior mührünü geçer: ses, ısınma ya da bilinçli «ısınmasız seçmeli» kuralı, üç soru, sahne. Siyer, kod ve dil kartları okul dersi diye adlandırılmaz. Sınıf seçici, metni olmayan sınıfı kilitler. Hak, içerik yokken harcanmaz.

**4–8 ay — 7. sınıf, kopya değil sözleşme.** 6. sınıfın konu dosyası, yüz senkronu, ses, kapak ve üç soruluk paket bir üreticiye bağlanır. İkinci kez 100’ün üstünde elle import satırı yazılmaz. Ücretsiz konu yine kartın ilk konusudur. Fiyat tek katalog satırı olarak kalabilir veya sınıf SKU’su açılır. Tutar koda gömülmez. Mühür, bu turdaki disk kuralını taşır.

**Hop, ancak ondan sonra.** Dinle-Anlat ve konu kontrolü v1 yazma siciline çıkar. Web ve `apps/rail-is` aynı handler’ı çağırır. O güne kadar native yalnız kart okur. Ayrı Junior backend açılmaz.

Yetişkin Akademi beş katman ve «1 Eğitim Kodu = 1 Ses» ofis dersinde kalır. Junior notu kariyer vizesine girmez.

### 5.3 Bir sonraki aşamada ne yapılmalı

Aşama 3 bir satış provasıdır. Kod kapsamı dardır:

1. Canlıda `SUPER_ADMIN_USER_ID` ile `yapinet360@gmail.com` kimliğini karşılaştır. Sapma varsa bu rapordaki kural kutuyu kapatır. Düzeltme env’dedir, kodda ikinci bir kutu açmak değildir.
2. Junior ses mühür anlığını yaz. Fırın betiği, anahtar listesindeki her MP3 için bayt ve özeti kaydetsin. Canlı `juniorProductionSealGaps` klasör yokken bu anlığı okusun. Anlıkta olmayan anahtar taze sayılmasın.
3. Kasa açılış listesini işlet, kodu gevşetme: aydınlatma sürümü kullanılabilir, `cat_junior_yearly.updated_by` dolu, canlı mağaza üçlüsü deneme değil, deneme velisi Super Admin değil, bir CLEARED sipariş tek abonelik yazar.
4. `JUNIOR_CHECKOUT_OPEN` bu liste bitmeden `1` yapılmaz.

Bu aşamada 7. sınıf konu metni, native oynatıcı ve freelancer kamu yüzü yoktur.
