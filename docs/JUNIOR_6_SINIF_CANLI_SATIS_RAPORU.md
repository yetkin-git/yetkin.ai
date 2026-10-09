# Junior 6. Sınıf Canlı Satış Raporu

Tarih: 9 Ekim 2026.

Bu tur, kasa raporundaki satış eksiklerini kapatır. Veli aydınlatması mühürlendi. Üç onay tiki ödeme isteğinden önce durur. Kasa bayrağı yerel ortamda açık. Katalog fiyatı `cat_junior_yearly` ve etiketi ₺5.499. Canlı kart çekimi bu turda yapılmadı. PayTR get-token çağrısı açılmadı.

## 1. Yasal Sözleşme ve Veli Onay Durumu

`JUNIOR_GUARDIAN_NOTICE` artık boş değil. Sürüm `junior-notice-2026-10-09`. Kanonik metnin SHA-256 özeti `b5c875b2b40e5b0e1204771b3551cc4ba43d4931a8468d294a343f71e32d88c9`. Metin `lib/copy/junior-guardian-notice.ts` içindedir. 6502 kasa sürümü `2026-09-05` ayrı durur. İki sürüm aynı dize değildir.

Herkese açık sayfa `/legal/junior-veli`. Tarayıcıda başlık, paragraflar ve sürüm satırı göründü. PayTR çerçevesi yok.

Metin şunları söyler: veri sorumlusu, hesabın veliye ait olduğu, 18 yaş beyanı, işlenen veriler, ses kaydının saklanmadığı, bu sürüm onaylanmadan dersin açılmadığı, bu metnin mesafeli satış sözleşmesi olmadığı.

Çocuk profili, mühürlü metin varken `consentVersion` ve veli doğum yılı olmadan kurulmaz. Eski profil aynı sürümü yenileyebilir. Ders kapısı, yürürlükteki sürüm profilde yoksa anlatı ve testi açmaz.

Ödeme ekranı üç onayı ister:

1. Mesafeli satış sözleşmesi ve ön bilgilendirme formu. Ortak 6502 tikleri `CheckoutConsentFields` üzerinden bağlanır.
2. Anında ifa onayı aynı alanda durur.
3. Veli onayı. Kutu, `/legal/junior-veli` sayfasına gider ve `junior-notice-2026-10-09` sürümünü gönderir.

Üç kutu ve fatura alanları dolmadan ödeme düğmesi istek atmaz. İstek sunucuya gelse bile tik eksikse `completeJuniorCheckout` sipariş kurmaz ve PayTR çağırmaz. Eksik veli tikinde cümle: «Veli onayı olmadan ödeme ekranı açılmaz.»

Yetişkin `/legal` mesafeli satış gövdesine «Junior» kelimesi yazılmadı. O gövde ortak sözleşmedir. Junior aydınlatması kendi sayfasındadır.

## 2. PayTR iFrame Form Yüklenme ve Checkout Test Sonuçları

Yerel ortamda `JUNIOR_CHECKOUT_OPEN=1`. PayTR mağaza numarası, anahtar ve salt dolu. Mağaza numarası `000000` değil. Anahtar ve salt içinde «sandbox» yok. `PAYTR_SANDBOX` kapalı. Bu makinedeki kapı canlı mağaza kapısıdır. Uygulama adresi localhost.

Satış kapısı `juniorPaytrSaleGate` dört hal bilir: kapalı, sandbox, canlı, reddedildi. Bayrak kapalıysa veya aydınlatma kullanılamazsa kapı kapalıdır. Üretimde sandbox satış açmaz. Deneme mağaza canlıda «Canlı ödeme hattı hazır değil. Deneme mağaza gerçek satış açmaz.» der. Bu cümle 503’tür. Soğuk `not_configured` kodu vatandaşa gösterilmez. O dize yalnız günlük neden kodudur.

Tarayıcı ve istek denemesi, oturumsuz:

| Adım | Sonuç |
| --- | --- |
| `/junior` «Paketi Al» | `/login?next=/junior/checkout` |
| Kilitli 2. hafta matematik kartı | Paket penceresi açıldı. PayTR çerçevesi yok. «Paketi Al» yine girişe gider. |
| `/junior/checkout` | Kapı cümlesi: «Ödeme ekranı, üç onay tamamlanmadan yüklenmez.» Sepet: «Junior yıllık paket — ₺5.499». Misafire «Ödeme için veli girişi gerekir.» Çerçeve yok. Kart alanı yok. |
| `POST /api/junior-pilot/checkout` | HTTP 410. Gövde: «Ödeme için veli girişi gerekir.» Eski «Bu oda üretimde kapalı.» cümlesi, açık kasada giriş yapmış veliye dönmez. |

Giriş yapmış veli, üç onay ve fatura alanıyla istek atarsa rota sipariş kurar ve PayTR get-token çağırır. Başarıda yanıt `iframeUrl` taşır ve çerçeve ancak o adresten sonra yüklenir. Abonelik bu adımda yazılmaz. Sipariş `PENDING` ve amacı `junior-license:yearly` olur.

Bu turda canlı get-token çağrılmadı. Mağaza canlı. Uygulama localhost. Oturum açılmış bir veli yok. Çağrı, yıllık tutar için gerçek ödenebilir bir PayTR oturumu açardı. Birim test, sahte `placeOrder` ile çerçevenin döndüğünü ve aboneliğin o anda boş kaldığını doğrular.

Hata cümleleri soğuk kod değildir:

- Kapı kilitli: «Ödeme hattı henüz bağlanmadı. Hukuki altyapı tamamlanmadan kasa açılmaz.»
- Ağ veya ödeme servisi: «Ödeme ekranı şu an açılamadı. Bağlantını kontrol edip biraz sonra yeniden dene.»
- Katalog boş: «Liste fiyatı katalogda yok. Tutar uydurulmaz.»
- Denetim hesabı: «Denetim hesabı ödeme kaydı yazmaz. Kilitli dersler izleme ile açılır.»

Yerel katalog satırı bu turun başında yoktu. Sayfa «fiyat katalogda yok» diyordu. Tutar uydurulmadı. Mevcut tohum `supabase/migrations/20261005160000_junior_yearly_price_seed.sql` uygulandı. Satır `cat_junior_yearly`, birim `yearly`, para birimi TRY, etiket ₺5.499. Operatörün sonradan değiştirdiği tutar (`updated_by` dolu) bu tohumla ezilmez. Bu makinede satır yoktu. Tohum onu yazdı.

`JUNIOR_INVOICE_SEAL_KEY` hâlâ boş. Bu yol fatura kimliğini düz yazmaz. Abonelik satırındaki kimlik alanları «gizli» kalır. Anahtar bu yüzden üretilmedi.

Hedeflenen kernel testleri ve `scripts/verify-junior-pilot-seals.ts` yeşil.

## 3. Ödeme Sonrası Paket ve Lisans Tanımlama Doğrulaması

Paket, checkout anında yazılmaz. Köprü `fulfillJuniorLicenseFromClearedOrder` yalnız şu siparişte çalışır: durum `CLEARED`, amaç `junior-license:yearly`, para birimi TRY, tutar pozitif.

Aynı mağaza sipariş numarası süreyi ikinci kez uzatmaz. `PAID` paket açmaz. Kullanıcıya «Ödeme alındı. Paket, banka bildirimi kapanınca açılır.» denir. İkinci çerçeve açılmaz.

Fatura alanları abonelik satırına düz TCKN, telefon veya adres olarak yazılmaz. Değer `withheld` kalır. Ödeme, `JuniorProgress` satırı yazmaz. İlerleme, çocuğun ders kaydında doğar.

Birim testte onaylı istek çerçeve döndürdü. Abonelik o anda boştu. Ardından CLEARED köprüsü yıllık paketi `ACTIVE` yazdı. Sipariş numarası `JRCHECKOUT01`. Kimlik alanları gizli kaldı.

Denetim hesabı `yapinet360@gmail.com` için kasa satırı yazılmaz. Açık bayrakta checkout 403 döner ve sipariş kurmaz. Kilitli ders izleme ayrı kapıdadır. `canEnterJunior` denetim niyeti kilitli dersi açar. Anlatı, mühürlü veli sürümü olan bir çocuk profilinde test edildi. Bu teyit birim testtir. O Google hesabına bu turda giriş yapılmadı.

## 4. CEO Onayına Sunulan Canlı Yayın Bildirimi

Hukuk metni ve üç onay tiki tamam. Kasa bayrağı bu makinede açık. Katalog fiyatı ₺5.499. Misafir ödeme formu göremez ve PayTR çağrısı atamaz. Giriş yapmış veli, üç onayı vermeden çerçeve yükleyemez.

Canlı kart çekimi tamamlanmadı. PayTR get-token bu turda ateşlenmedi. Mağaza canlı, uygulama adresi localhost. Yerel köken, canlı ödeme ekranında gri sayfa üretebilir. Üretim adresi ve herkese açık köken bu turda denenmedi.

Onay şu cümleyle sınırlıdır: kod kapısı, veli girişi ve üç onaydan sonra çerçeve dönecek şekilde bağlandı. Tahsilat, banka `CLEARED` bildirince yıllık paketi veli hesabına ve çocuk profiline yazar. Denetim hesabı ödeme kaydı yazmaz. Kilitli dersleri izleme ile açar.

Canlı yayında kart çekmek için kalan iş: giriş yapmış bir veli ile üç onayı işaretleyip çerçevenin üretim kökeninde açıldığını görmek. Bu tur o tahsilatı yapmadı.
