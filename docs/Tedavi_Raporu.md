# TEDAVİ RAPORU — Yayın hattı, Aşama 2

| Alan | Değer |
|------|--------|
| Tarih | 4 Ekim 2026 |
| Kime | CEO |
| Dayanak | `docs/Tespit_Raporu.md` (aynı gün, Aşama 1) |
| Dil | Yalın Türkçe |

Bu rapor, tespitte kırmızı ve sarı işaretlenen işlerin hangisinin bittiğini, testin ne söylediğini ve bir sonraki onayın ne olduğunu yazar.

---

## 1. Kısa sonuç

Kod tarafındaki kilit açıldı. Test paketi yeşil. Üç yeni eğitimin metni, görseli ve sesi yerel kayda alındı. Emekli ofis kaseti yayın klasöründen çıktı.

Veritabanında SM-103, BOT-104 ve PR-105 hâlâ kendiliğinden yayına çıkmadı. Onları açan SQL dosyası artık kilitli listede ve sıra bozulmadan uygulanabilir. Bu makineden uygulamak için veritabanı adresinin havuz kapısı değil, doğrudan kapı olması gerekiyor. Tespit bunu `direct-fail` diye işaretlemişti. Adres düzeltilmeden `npm run ops:migrate` çalıştırılmadı. Canlı siteye de bir şey gönderilmedi.

---

## 2. Yapılan işler

### 2.1 Kayıtlar (git)

Bu bilgisayarda `git` komutu kurulu değildi. Kayıtlar, depo geçmişindeki mevcut yazar adıyla yalnız bu makineye alındı. GitHub’a gönderilmedi.

Tespit 318 dosya diyordu. Kayıt anında çalışma kopyasında 339 satır değişiklik vardı. Dört parçaya bölündü:

| Parça | Kayıt | Ne var |
|-------|--------|--------|
| İçerik | `bc4c411` | 115 dosya. SM-103, BOT-104 ve PR-105 konuşma metni, sahne ipucu ve süre saati. |
| Medya | `60d69d5` | 168 dosya. Sinema kareleri, ders sesleri, ısınma videoları. Emekli `01_office_ai-4.mp3` çıktı. |
| Kod | `4e92cfe` | 98 dosya. Yayın SQL’i, kilit listesi, ücretsiz ilk ders testleri, katalog kapısı. |
| Belgeler | `cc2afc1` | 16 dosya. Altı eğitimli yayın cümlesi, Next.js kılavuz istisnası, eski raporların tarihli adı. |

`media-bake/` hâlâ `.gitignore` satır 69 ile dışarıda. Kayda girmedi. Bu klasör yaklaşık 1,5 GB ve yalnız bu bilgisayarda. Saha dışı kopyası bu işte alınmadı. Makine bozulursa ses ana kayıtları ücretli yeniden fırın ister.

### 2.2 Yayın kilidi

Diskteki `supabase/migrations/20261003230400_sm103_bot104_pr105_publish.sql` kilitli listeye on dördüncü dosya olarak eklendi (`scripts/ops-migrate-lib.ts`). Aynı sayı testlerde de 14.

Bu SQL şunu yapar:

- SM-103, BOT-104 ve PR-105 satırını yayında işaretler.
- Fiyatı aktif eder. Tohum: SM-103 ₺890, BOT-104 ve PR-105 ₺1.290. KDV dahil.
- Super Admin panelden fiyat girmişse tutarı ezmez (`updated_by` doluysa eski tutar kalır).

Liste ile disk birebir. Saha planı testi bunu boş sorun listesiyle geçti. Uygulama adımı ayrıdır ve doğrudan veritabanı adresi ister.

### 2.3 Emekli ses

`public/media/academy/audio/01_office_ai/01_office_ai-4.mp3` silindi (11,3 MB). Bu ders sınav yolunda yok. Konuşma metni arşivde duruyor.

`public/` boyutu: **916,4 MB**. Uyarı 850 MB, derlemeyi durduran tavan 950 MB. Kazanılan pay yaklaşık 11 MB. Yeni bir eğitim 90–200 MB ekler. Bir sonraki eğitim, medya depodan çıkmadan derlemeyi kırar.

### 2.4 Testler

`npm test`: **1196 geçti, 0 kaldı.** Süre 65 saniye. Dün kırmızı olan üç yer:

| Eski kırmızı | Bugün |
|--------------|--------|
| Kenar testi SM-103 oynatıcısını kapalı sanıyordu | SM-103, BOT-104 ve PR-105 oynatıcısı oturumsuz açık |
| Kilit 13 SQL bekliyor, diskte 14 vardı | Kilit 14 ve disk 14 |
| Yük altında zaman aşımı | Bu koşuda tüm paket geçti |

Ücretsiz ders sözleşmesi artık altı eğitimi de dener: ders 1 herkese açık, ders 2 lisanssız kilitli, süre dolunca ders 2 yine kapanır, ders 1 açık kalır.

CI’nın çalıştırdığı komut `npm run test`. Bu komut bugünkü haliyle yeşil.

### 2.5 Belgeler ve ajan kuralı

- `.system_docs/OPS_RUNBOOK.md` ve `.system_docs/STORAGE_CONTRACT.md`: “yayın 8” ve “kardeşler Çok Yakında” kalktı. Yerine altı mühürlü eğitim yazıldı. Video katmanı “terk edildi” değil; yerel ısınma kaseti.
- `.system_docs/README.md` indeks satırı da altı eğitime çekildi. Aksi halde indeks eski sayıyı tekrarlıyordu.
- `AGENTS.md` dosyasına dokunulmadı. O blok `next dev` tarafından yeniden yazılıyor. Çelişki `.cursorrules` içinde çözüldü: `node_modules/` yine okunmaz; tek istisna `node_modules/next/dist/docs/`.

---

## 3. Bitmeyen iş (bilerek)

| İş | Neden durdu |
|----|-------------|
| Migrasyonu veritabanına basmak | Doğrudan adres havuza işaret ediyor. Yanlış kapıdan basmak ya reddedilir ya da yanlış hedefe gider. |
| Canlı duman testi | Satış satırı veritabanında açılmadan kart hâlâ “yayında değil” kalır. İlk ders web’de izlenir. |
| Uzak depoya gönderme | İstenmedi. Dört kayıt yalnız bu makinede. |
| `media-bake/` yedeği | Git’e konmaz. Harici diske kopya operatör işi. |
| Mobil ücretsiz ilk ders | Uygulama hâlâ iki eğitimi biliyor ve önizleme kavramı yok. Bu paketin dışı. |
| Tek kurs kayıt defteri | Aşağıda. Bu turda kod sadeleştirilmedi. |

---

## 4. Değerlendirme

### 4.1 Sen olsan ne yapardın? Sistem pürüzsüz mü?

Hayır. Boru tıkalı değildi; musluk hâlâ kapalı.

Kod, test ve yerel kayıt tarafı düzeldi. Satışın kendisi veritabanı satırına bağlı. O satır bu turda değişmedi. Ayrıca `public/` tavanı duruyor, mobil liste geride, yeni eğitim hâlâ onlarca dosyaya elle yazılıyor, ses ana kaydı tek makinede.

Pürüzsüz saymam için şunlar da bitmeli: doğrudan adres, migrasyonun uygulanması, oturumsuz ders 1 ve kilitli ders 2’nin canlıda görülmesi, bir deneme ödemesi. Ondan sonra “yayın hattı açık” denir.

### 4.2 Tek kurs kayıt defterine hazır mıyız?

Tasarıma hazırız. Kesmeye hazır değiliz.

İyi haber: ücretsiz ilk ders zaten kurs listesi yazmadan çalışıyor. Kaynak `lib/kernel/catalog-ids/exam-path.ts`. Tabloya ders eklenince kapı kendiliğinden açılıyor. Bu, kayıt defterinin çekirdeği.

Kötü haber: ad, anlatıcı, fiyat tohumu, ısınma videosu, mobil liste ve mühür hâlâ ayrı listelerde. Tespit bunu yaklaşık 66 dosya diye ölçtü. Hepsini bu hafta tek dosyaya yıkmak, yeni açılacak üç satışın üstüne ikinci bir risk bindirir.

Sıra şöyle olmalı: önce üç eğitim veritabanında yayında ve duman testi temiz. Sonra kayıt defteri. Defter bitmeden yedinci eğitime başlanmamalı.

### 4.3 Faz 2 ve Faz 3 takvimi

Tavan dar olduğu için medya işini sadeleştirmenin sonuna bırakmıyorum. İkisi örtüşür.

| Ne zaman | Ne |
|----------|----|
| Bu hafta | Doğrudan veritabanı adresi. Yayın migrasyonu. Canlıda ders 1 açık, ders 2 kilitli, deneme satın alma. Fiyat ve süre kararı panelden, sizde. |
| Hafta 2 | Faz 2 başlangıcı. Tek kayıt defterinin şekli: kod, ad, anlatıcı, ders listesi, ısınma dosyası. Migrasyon listesi dosya adından türetilir; sıra kilidi kalır. |
| Hafta 3–4 | Katalog, anlatıcı ve ısınma listeleri o defterden okunur. Klasör adları tek kalıba iner. Ücretsiz ders testi yeni kursu kendiliğinden kapsar (bu turda altı kurs elle eklendi; defter bunu gereksiz kılar). |
| Hafta 3’ten itibaren, paralel | Faz 3 tasarımı. Mühürlü ses, görsel ve ısınma videosu nesne depoda durur. Kısa ömürlü imzalı adres kalır. Mühür kuralının metni (`AKADEMI_URETIM_ANAYASASI.md`) değişmez; “dosya var” kontrolü deponun adresine bakar. Bu sizin onayınız olmadan başlamaz. |
| Hafta 5–8 | Faz 3 uygulaması. `public/` tavanın altına iner. Ancak ondan sonra yedinci eğitim fırınlanır. |

EC-102 kapanış cümlesini yeniden seslendirmek bu takvime dahil değil. Ücretli fırın. Ayrı karar.

### 4.4 Bir sonraki aşamada onayınıza gelecek iş

Tek paket, üç onay:

1. Bu makinenin bağlı olduğu veritabanı canlı mı, laboratuvar mı?
2. Onaylarsanız doğrudan veritabanı adresini düzeltip `20261003230400_sm103_bot104_pr105_publish.sql` dosyasını uygularım. Onay yoksa dosya diskte kalır, satış açılmaz.
3. Uygulama bitince canlı duman: oturumsuz ilk ders (ses dahil), ikinci ders kilitli, fiyat kartta görünür.

Ayrıca, isterseniz bu dört yerel kayıt GitHub’a gönderilir. Gönderilmedi.

Fiyat (₺890 / ₺1.290 / ₺1.290) ve yaklaşık 35 dakikalık süre bu pakette değiştirilmedi. Tohum böyle. Panelden değiştirilebilir. Uygun değilse migrasyondan önce söyleyin.
