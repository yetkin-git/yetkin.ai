# Herkese Açık Sayfalar Raporu

Tarih: 4 Ekim 2026

Oturumu kapalı kullanıcı Anasayfa ve Kariyer adresine girince artık Akademi kataloğuna düşmüyor. Sayfa üstündeki uyarı bandı kalktı. Sol menüdeki Anasayfa ve Kariyer düğmeleri kendi sayfalarını açıyor.

## Ne kalktı

- `/dashboard` ve `/career` için `/academy?konuk=anasayfa` ve `/academy?konuk=kariyer` yönlendirmesi silindi.
- Katalog sayfasındaki «şimdilik eğitim kataloğundasın» bandı silindi.
- `/kariyer` kısa adresi tek adımda `/career` sayfasına iner. Kataloğa gitmez.

Cüzdan, profil, pasaport ve yönetici odası giriş ister. Anasayfa ve Kariyer alt yolları da giriş ister. Kök adres eskisi gibi Akademi kataloğuna iner.

## Anasayfa (`/dashboard`)

Oturum kapalıyken sayfa platformun kısa tanıtımını basar:

- Genel bakış cümlesi
- Üç öne çıkan kart: Akademi, kariyer vizesi, sertifika doğrulama
- Sistem özeti: eğitim kataloğu, sınav barajı 70, mühür ve giriş isteyen odalar

Oturum açıkken kişisel karşılama, sıradaki eylem ve nabız kartları durur. Kişisel bakiye ve kimlik misafir sayfasına yazılmaz.

## Kariyer (`/career`)

Oturum kapalıyken sayfa kariyer vizesini anlatır:

- Sertifikanın Akademi sınavından türediği ve burada vizeye dönüştüğü
- Örnek mühürlü sertifika görseli. Kartın örnek olduğu yazılır. Canlı sicil kaydı değildir.
- Sertifika doğrulamanın üç adımı ve doğrulama sayfasına giden düğme

Oturum açıkken vize defteri, teklif kapısı ve paylaşım rehberi durur.

Kariyer sayfası artık arama motoruna açıktır ve site haritasındadır. Anasayfa site haritasında yoktur; oturum açınca kişisel özet aynı adreste açılır.

## Doğrulama

- `npx tsc --noEmit` temiz bitti.
- `npm test`: 246 dosya, 1204 test geçti.
- Tarayıcıda oturumsuz `/dashboard` adreste kaldı ve «Genel Bakış» panelini bastı.
- Tarayıcıda oturumsuz `/career` adreste kaldı. Örnek mühür ve üç doğrulama adımı göründü.
- `/kariyer` adresi `307` ile `/career` adresine indi.
- `/academy?konuk=anasayfa` uyarı bandı basmadı. Katalog kendi halinde durdu.
- Kariyer sayfasındaki «Anasayfa» bağı `/dashboard` adresini açtı.

Geliştirme ekranında kabuk menüsünde eski bir su uyuşmazlığı uyarısı göründü. Uyarı `components/shell/sidebar-nav.tsx` satırına işaret ediyor. Bu turda o dosya değişmedi. Herkese açık panellerin metni ve düğmeleri uyarıya rağmen yerinde durdu.
