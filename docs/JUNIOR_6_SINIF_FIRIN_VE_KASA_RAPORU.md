# Junior 6. Sınıf Kapak Fırını ve Kasa Kapısı Raporu

Tarih: 9 Ekim 2026.

Bu tur iki işi ayırır. Çekirdek 105 dersin kapağı fırınlandı ve rafa bağlandı. Junior satış kapısı açılmadı. PayTR ödeme formu bu akışta tetiklenmedi.

## 1. Kapak Fırınlama İstatistikleri

Model kimliği doğru. `lib/kernel/ai/model-roles.ts` içinde `JUNIOR_COVER_GEN` değeri `gemini-3.1-flash-lite-image` (Nano Banana 2 Lite). Yetişkin görsel mührü `gemini-3.1-flash-image` duruyor. Biri diğerinin yedeği değil. `scripts/bake-junior-covers.ts` bu kimliği okur. Kimlik saparsa betik durur ve alt modele geçmez.

Kuru çalışma 105 çekirdek dersi saydı ve dış çağrı açmadı. Dağılım: matematik 25, fen 20, Türkçe 20, İngilizce 20, sosyal bilgiler 20.

Harcama onaylı fırın `--confirm-gemini-spend` ile çalıştı. Çıkış kodu 0. Süre yaklaşık 7,4 dakika. 105 dosyanın hepsi `yazıldı` dedi. Kota veya tutar satırı dönmedi. Betik, Gemini yanıtındaki harcama alanını yazmaz. Bu turda başarısız çağrı, yeniden deneme ve alt model yok.

Disk denetimi:

| Ölçü | Sonuç |
| --- | --- |
| Dosya sayısı | 105 JPEG |
| Yol | `public/media/junior/covers/{ders}.jpg` |
| Ölçü | Hepsi 1280×720 |
| Biçim | JPEG, dosya başı `FF D8` |
| En küçük / en büyük | 105 KB / 282 KB |
| Toplam | 20,7 MB |
| Bozuk dosya | 0 |

Örnek `jr_06_mat-1.jpg` tarayıcıda 1280×720 yüklendi. Sıcak bir sınıf çizimi. Tahtada yazı ve büyük rakamlar var. İstem «görselde yazı yok» diyordu. Betik bunu piksel düzeyinde denetlemez. Mühür yalnız dosya biçimini ve ölçüyü tutar.

## 2. Raf ve Kart Arayüzü Görsel Durumu

`/junior` ders kartları `LessonCover` kullanıyor. Diskte jpg varsa resmi gösterir. Adres yüklenmezse veya ders anahtarı geçersizse karttaki SVG yedeği kalır.

Çekirdek liste `components/junior/visual-course-cards.tsx`. Seçmeli şerit `components/junior/elective-grid.tsx`.

Tarayıcıda misafir olarak `/junior` açıldı.

- Çekirdek rafta 105 kapak resmi yüklendi. Kırık resim 0. SVG yedeği 0. Örnek adres `/media/junior/covers/jr_06_mat-1.jpg`.
- İlk matematik kartı «1. Hafta: Üslü ifadede taban ve üs» ve «Ücretsiz Başla» ile duruyor.
- Kilitli ikinci matematik kartı paket penceresini açtı. Pencerede PayTR çerçevesi yok.
- Seçmeli sekmede 6 kart var. Bu derslerin jpg dosyası fırınlanmadı. Altı kart da SVG yedeğine düştü. Kırık resim kutusu kalmadı.

## 3. PayTR ve Kasa Kapısı Entegrasyonu

Kasa kapalı. Yerel ortamda `JUNIOR_CHECKOUT_OPEN` boş. `isJuniorCheckoutLocked` doğru. PayTR üçlüsü ortamda dolu. `PAYTR_SANDBOX` açık. Çalışma kipi sandbox. Uygulama adresi localhost. Canlı satış kapısı `juniorPaytrLiveSaleOpen` bu halde kapalı kalır. Deneme mağaza satışı açmaz.

Vitrin akışı:

1. Misafir «Paketi Al» veya kilitli ders penceresindeki «Paketi Al» düğmesi `/login?next=/junior/checkout` adresine gider.
2. `/junior/checkout` misafire «Ödeme için veli girişi gerekir» der. Sepet metni durur. PayTR iframe yoktur. Kart alanı yoktur.
3. `POST /api/junior-pilot/checkout` kenarda 410 döner. Gövde: «Bu oda üretimde kapalı.» İstek, rota gövdesine ve PayTR get-token çağrısına ulaşmaz.
4. Rota gövdesindeki `completeJuniorCheckout` bugün her çağrıda 503 `not_configured` döner. Sipariş kurmaz. `iframeUrl` üretmez. `buildJuniorPaytrSeal` bu fonksiyondan çağrılmaz.

Köprü ayrı durur. CLEARED ve amacı `junior-license:yearly` olan sipariş, webhook veya Inngest kaydındaki kanca ile yıllık paketi yazar. Düz cüzdan yüklemesi paket açmaz. Aynı sipariş numarası süreyi ikinci kez uzatmaz. Yeni sipariş, bitmemiş yılın üstüne bir yıl ekler. TCKN, telefon ve adres satıra düz yazılmaz. Fatura alanları mühürlü «gizli» değeridir.

Bu köprü, vitrinden sipariş doğmadan çalışmaz. Vitrin o siparişi bugün kurmuyor.

Veli rızası ve sözleşme, bellek deposu simülasyonunda şöyle duruyor. Hukuk metni `JUNIOR_GUARDIAN_NOTICE` hâlâ boş. Sürüm veya veli doğum yılı bu halde reddedilir. Onay kutusu tek başına profili açar ve `consentAt` yazar. Ders kapısı, onay zamanı yoksa «Veli onayı olmadan ders açılmaz» der. 6502 kasa sürümü `2026-09-05` ayrı bir tiktir. Junior ödeme ekranı bu tiki göstermez, çünkü ödeme formu yerine «Ödeme hattı kapalı» metni vardır. Oturum yokken bu metin de çıkmaz. Önce veli girişi istenir.

Ödeme, `JuniorProgress` satırı yazmaz. İlerleme, çocuğun anlatış, alıştırma veya konu testi kaydında `recordOutcome` ile doğar. Paket ataması abonelik satırıdır. İkisi aynı adım değildir.

Simülasyon testleri geçti: kasa, veli rızası, lisans köprüsü ve kapalı beta dosyalarında 27 test, 4 dosya, hepsi yeşil. Açık paket, çekirdek dersleri ve seçilen üç seçmeli dersi bellek deposunda açar. Canlı PayTR tahsilatı bu testlerde yoktur.

## 4. Hata ve Eksik Listesi

- Satış kapısı açılmadı. PayTR iframe ve get-token, «Paketi Al» yolunda tetiklenmedi.
- Kenar, kapalı kasada checkout API’sini 410 ile keser. Rota içindeki 503 yanıtına bu istek ulaşmaz.
- `completeJuniorCheckout` açık bayrak gelse de sipariş kurmaz. Canlı üçlü ve hukuk metni olmadan bu kasıtlı duruştur.
- Çocuk aydınlatma metni mühürlü değil. Sürümlü veli rızası yazılamaz.
- Mesafeli satış ve anında ifa tikleri Junior ödeme ekranında yok.
- Ödeme, ilerleme satırı yazmaz. İlerleme ders kaydındadır.
- Kapak istemi «yazı yok» diyor. Örnek matematik kapağında tahta yazısı ve rakam var. 105 dosyanın hepsi bu gözle taranmadı.
- Seçmeli ders kapakları fırınlanmadı. Kartlar SVG yedeğinde. Bu, taslak raf için beklenen duruştur.
- Misafir kasa sayfası bu yerel çalışmada «fiyat katalogda yok» dedi. Tutar uydurulmadı.

## 5. CEO Onayına Sunulan Son Durum

Kapak işi bitti. 105 çekirdek dersin 1280×720 JPEG kapağı diskte. Raf bu resimleri gösteriyor. Resim yoksa SVG yedeği devreye giriyor.

Satış onayı verilmez. Kasa kilitli. PayTR formu açılmıyor. Veli aydınlatması ve mesafeli satış tiki bu akışta tamamlanmıyor. Paket köprüsü, ancak CLEARED bir `junior-license:yearly` siparişi gelirse yıllık hakkı yazar. O siparişi vitrin bugün kurmuyor.

Yeşil ışık için hukuk metni, canlı PayTR üçlüsü ve kasa bayrağı birlikte kapanmalı. Bu tur o kapıyı açmadı.
