# Akademi dönüşüm akışı

Katalogda ilk görünen düğme artık satın alma değil. Yeşil düğme ilk dersi açar. Fiyat kartta durur. Ödeme, ders bittikten veya kilitli derse basıldıktan sonra çıkar.

## Eski yol

1. Katalogda «Satın Al» görünür.
2. Eğitim sayfasına geçilir.
3. Oradan satın alma veya önizleme aranır.
4. Oynatıcıya ancak birkaç adım sonra ulaşılır.

İlk ders ücretsiz olduğu hâlde bu hak katalogda görünmez. Birçok kişi fiyatı görüp çıkar.

## Yeni yol

1. Katalog kartında yeşil düğme: **► 1. Dersi Ücretsiz İzle**.
2. Düğme ara sayfa açmaz. Adres doğrudan `/academy/[eğitim]/oyna`.
3. Hazırlık şeridi ve 1. ders ödeme duvarsız izlenir.
4. Ders bitince veya listeden kilitli derse basılınca ödeme penceresi açılır: **Eğitimin Tamamına Erişim Sağla ve Sertifika Al — Satın Al ₺…**
5. Penceredeki düğme eğitimin kendi fiyatını taşır ve satın alma bölümüne gider.

Satın almak isteyen kişi karttaki ikinci düğmeyi kullanır: **Satın Al — ₺…**. Bu düğme eğitim sayfasındaki ödeme noktasına gider. Soldaki tutar fiyat etiketi olarak kalır. KDV notu altındadır.

Satın alınmış eğitimde düğme yine oynatıcıyı açar: «Derse başla» veya «Devam Et». Ücretsiz ders vaadi, dersi olmayan veya satışı kapalı kartta basılmaz.

## Ekranlar

| Yer | Ne değişti |
| --- | --- |
| Akademi kataloğu | Birincil düğme yeşil ve oynatıcıya gider. Satın alma ikincil. |
| Oynatıcı | 1. ders ve hazırlık şeridi açık kalır. |
| Ödeme penceresi | Ders sonu veya kilitli ders tıklanınca tam ekran pencere. Kapatınca ücretsiz derse dönülür. |

## Doğrulama

- `npx tsc --noEmit` — hata yok.
- `npm test` — 246 dosya, 1203 test geçti.
