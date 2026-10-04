# Junior Faz 2 — Kapalı Pilot Raporu

| Alan | Değer |
|------|--------|
| Tarih | 4 Ekim 2026 |
| Kime | CEO ve SUPER_ADMIN |
| Kimden | Cursor Ajanı |
| Dil | Vatandaş lisanı. Dosya adı, yalnız «nerede duruyor» diye parantez içinde geçer. |
| Faz | 2 — veli altı çocuk profili, Dinle ve Anlat, 5. sınıf fen pilotu. Kapı ziyaretçiye kapalı. |

---

## 1. Kısa sonuç

Kapalı pilot kuruldu. Ziyaretçi `/junior` adresinde hâlâ **410** görür. Menüye oda eklenmedi. Para kapısı (`JUNIOR_PRODUCTION_LOCKED`) açık değil. Oturum açmış veli aynı adreste takma adlı çocuk profili seçer, ilk dersi ücretsiz dinler ve anlatır.

Oyun puanı cüzdana yazılmaz. Ses dosyası diske ve veritabanına yazılmaz. Değerlendirme bitince eldeki ses alanı boşaltılır. Kalan, üç yazılı not ve kazanım puanıdır.

Tip denetimi geçti. Test paketi geçti: **248 dosya, 1213 test, hepsi yeşil.**

---

## 2. Ne kuruldu

### Veli hesabı, çocuk profili

Çocuğa e-posta ve ayrı giriş açılmaz. Profil, velinin hesabına bağlıdır.

Tutulanlar: takma ad, sınıf (5–12), doğum yılı, veli onayı. Onay kutusu işaretlenmeden profil yazılmaz. Bir hesapta en fazla dört profil durur.

İlerleme `JuniorProgress` tablosundadır: ders, anlatış biçimi (ses, yazı veya pekiştirme), üç not, skor, o gün verilen oyun puanı.

Oyun puanı ve rozet `JuniorXp` tablosundadır. Bu iki tablo cüzdan ve nakit defterine bağlanmaz. Günlük tavan 40 puandır. 60 altı skor puan getirmez. Seri kaçırmak ceza yazmaz.

Şema: `prisma/schema/junior.prisma`.
Kurulum dosyası: `prisma/migrations/20261004183000_junior_closed_pilot/migration.sql`.

Bu oturumda veritabanına kurulum **basılmadı**. Dosya hazır. Kurulmadan profil kaydı «şu an yazılamıyor» der; ders listesi yine görünür. Kurulum, sizin veritabanı adımınızdır (`npm run ops:migrate` veya eşdeğeri). Canlı tabloyu bu oturumda elle değiştirmedim.

### Kapı

Ziyaretçi `/junior` ve alt yollarda 410 alır. Oturum doğrulanmış veli sayfaya geçer. `/juniorism` bu izni almaz. `/api/junior` hâlâ 410’dur. Profil, anlatış ve pekiştirme ayrı adrestedir: `/api/junior-pilot/...`. Oturum şarttır. Başka velinin profili okunamaz.

Yerel sunucuda denendi:

- `http://127.0.0.1:3000/junior` → **410**, başlıkta mikrofon yalnız bu yolda `microphone=(self)`.
- `http://127.0.0.1:3000/academy` → **200**, mikrofon hâlâ `microphone=()`.

Tarayıcıda ziyaretçi ekranı «Junior üretimde kapalı» dedi. Ana sayfa, Akademi ve Kariyer linkleri duruyordu. Oynatıcıyı tarayıcıda tıklayamadım: o ekran veli oturumu ister. Bu oturumda veli girişi yapılmadı. Oynatıcının süre, silme, puan ve kapı kuralları birim testle doğrulandı.

### Dinle ve Anlat

Bileşen: `components/junior/listen-and-tell.tsx`.

- Metin ekranda durur. «Dinle» tarayıcının kendi okuyucusunu kullanır. Yetişkin ses mühürü bu derse bağlanmadı.
- «Şimdi sen anlat» mikrofonu açar. Kayıt 15 saniyeden kısa ise gönderilmez. 45 saniyede kendi durur. Kayıt sırasında «Şimdi Sen Anlat» dalgası görünür.
- Mikrofon yoksa veya izin verilmezse «Yazarak anlat» açıktır.
- Ses, yapay zekâ geçidine gider (`invokeLlm` + `inlineMedia`). Rol yeni değildir. Kimlik, kilitli haritadaki hızlı akış rolünden okunur (`FAST_STREAM`). Haritaya satır eklenmedi, eski modele düşülmedi.
- Dönüş üç parçadır: **Harika Anlattın**, **Eksik Kalan Nokta**, **Geliştirme Tavsiyesi**. Konu dışındaysa skor sıfırdır. Model bozulursa «Emin değilim» denir ve ses yine saklanmaz.
- Günde en fazla sekiz anlatış. Kota dolunca model çağrılmaz.

Dürüst sınır: JavaScript bir metin parçasının bellek izini bayt bayt silemez. Alan boşaltılır, diske ve tabloya yazılmaz, yanıtta ses dönmez. Eski parça çöp toplayıcıya kalır. Bu, hukuk müşavirinin «ses yurt dışına gider mi» sorusunun yerini tutmaz.

### Pilot ders

Ünite: **Güneş, Dünya ve Ay**. Sekiz kısa ders. Metin özgün yazıldı. Okul kitabı kopyalanmadı.

| Ders | Durum |
|------|--------|
| 1. Güneş bir yıldızdır | Ücretsiz. Dinle, anlat, pekiştir. |
| 2–8 | Listede görünür. Oynatılmaz. «Sırada» der. |

Pekiştirme ilk derstedir: iki çoktan seçmeli, bir eşleştirme. Doğru şık tarayıcıya baştan gönderilmez. Puan sunucuda hesaplanır. Yetişkin sınav mührü ve `/academy/dogrula` bu derse bağlanmaz.

Yetişkin kayıt defterindeki ders yolu boş bırakıldı. İlk konu, yetişkin ses mühür listesine yazılmadı. Kanon 13, vitrin 1–6, mobil iki kart ve pasaport beş kodu durur.

---

## 3. Yetişkin ürünü

Şunlar değişmedi:

- Kanon, vitrin sırası, mobil liste, pasaport kapısı.
- Satış listesi ve ses mühür listesi.
- Beş katmanlı üretim kuralı ve kilitli model haritası.
- Akademi sayfası ve mikrofon yasağı.
- Eski Junior arşivi ve harçlık motoru. Taşınmadı.

Eski `tests/junior` dışlaması tip denetiminde duruyor. O dosyalar arşivdeki odayı çağırır. Yeni testler `tests/kernel/junior-faz2-pilot.test.ts` içindedir. İkisini birden, hazırlıksız birleştirmek tip denetimini kırardı.

---

## 4. Doğrulama

| Kapı | Sonuç |
|------|--------|
| `npx tsc --noEmit` | Geçti (çıkış kodu 0). Son küçük oynatıcı düzeltmesinden sonra yeniden geçti. |
| `npm test` | Geçti. 248 dosya, 1213 test, 0 kırmızı. Süre yaklaşık 83 saniye. |
| Yeni pilot testi | 5 test yeşil |
| Kapı testi | Ziyaretçi 410, veli oturumu `next`. Stüdyo oturumda da 410. |
| Tarayıcı | Ziyaretçi `/junior` ekranı 410 olarak görüldü. Veli oturumuyla oynatıcı tıklanmadı. |

`npm test` yüzey dosyalarını çalıştırmaz. Bu, Faz 1 raporundaki aynı sınırdır.

---

## 5. Bu fazda bilerek yapılmayanlar

- Ziyaretçiye kapı açılmadı. Para kapısı açılmadı. Fiyat satırı yok.
- Davetli aile listesi yok. Bugün adresi bilen ve oturumu açık olan her yetişkin sayfaya girebilir. Duyuru için bu geniştir. Faz 3’te daraltılmalı.
- Veritabanı kurulumu canlıya basılmadı.
- Sertifika, kariyer vizesi ve herkese açık doğrulama sayfası yok.
- Yetişkin «beş dakika, altı yüz kelime» kuralı bu derse uygulanmadı ve gevşetilmedi.
- Hukuk görüşü değildir. Çocuk verisi, sesin yurt dışına gitmesi ve okul kitabı telifi müşavir işidir.

---

## 6. SEN OLSAYDIN NE YAPARDIN? — Faz 3 (Kademeli Açılış ve Satış Kapısı)

Kapıyı bir anda herkese açmazdım. Ölçü, ilk dersi bitiren çocuk sayısı olsun. Tutmazsa tek anahtarla kanal yine 410’a dönsün.

Sırayı şöyle kurardım.

**1. Önce liste, sonra duyuru.** Bugün «oturum var» yeter. Bunu 30–50 ailelik bir listeye çevirirdim. Listede olmayan veli de 410 görsün. Liste kodda fiyat gibi gömülmesin. Süper yönetici satırı olsun. Kill-switch bir kez tatbik edilsin: liste doluyken anahtar kapanınca herkes 410 görmeli.

**2. Parayı çocuğun puanından ayırırdım.** Satın alan velidir. Açılan, seçili çocuk profilinin 2–8. dersidir. Tutar veritabanı satırıdır. Kodda ₺ yazılmaz. Ödeme yetişkin kasadan geçer. Çocuğun oyun puanı bu kasaya girmez, parayla alınamaz, paraya çevrilmez. İlk ders ücretsiz kalır. Kilit açılınca «sırada» yazısı kalkar. Sertifika ve pasaport yine verilmez.

**3. Sekiz metni bir öğretmen okumadan satışa çıkarmazdım.** Metinler özgün ve kısadır. Yine de 5. sınıf fen için bir öğretmen onayı isterdim. Kitap cümlesi kopyalanmaz. Yetişkin üretim kuralı (süre, kelime, beş katman) bu üniteye giydirilmez. Ayrı, kısa bir Junior kuralı yazılır. Yetişkin dosyası gevşetilmez.

**4. Sesi büyütmeden önce müşavir notu isterdim.** Geçit bugün hızlı akış rolünü kullanır. Yeni rol açılmaz. Model bir sesi anlamazsa yazarak anlat ve pekiştirme çalışmaya devam eder. Ölçekten önce iki şey net olsun: ses sağlayıcıda tutulmuyor mu, yurt dışı aktarım için açık rıza var mı. JavaScript’in «alanı boşalttım» demesi bu notun yerine geçmez.

**5. Diski şişirmezdim.** `public/` doluya yakın. Bu ünitenin videosu ve müziği oraya konmamalı. Ünite büyürse önce nesne deposu. Mühür «dosya gerçekten var» diye bakmaya devam eder. Yer değişir, yetişkin kuralın ruhu değişmez.

**6. Eski test dışlamasını körle silmezdim.** Arşivdeki Junior testleri hâlâ eski odayı çağırır. Canlı klasör duruyor. Dışlama, o arşiv testleri taşınmadan kalkmamalı. Yeni testler çekirdek paketinde yeşil kaldı. Böyle kalsın.

Faz 3 kapısı olarak şunu isterdim: müşavir ses ve çocuk verisi için kısa yazılı not, davetli liste, kill-switch tatbikatı, ilk dersi bitiren çocuk sayısı, yetişkin testlerinin yine tam yeşil kalması.
