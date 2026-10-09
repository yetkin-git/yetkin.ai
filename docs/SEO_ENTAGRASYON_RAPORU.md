# SEO Entegrasyon Raporu

Tarih: 9 Ekim 2026.

Bu tur, canlı çıkış öncesi kamu sayfalarının başlık, paylaşım kartı, yapısal veri, site haritası ve kapak metnini mühürler. Akademi tarafındaki mevcut mühür durur. Yeni iş Junior odası ve ortak kabuktadır.

## 1. Dinamik başlık ve Open Graph

Kök kabuk `app/layout.tsx` site adresini `https://yetkin.ai` olarak taşır. Varsayılan başlık, açıklama, anahtar kelime, Open Graph ve Twitter kartı buradadır. Kanonik adres kök kabukta yoktur. Olsaydı alt sayfalar ana sayfanın adresini miras alırdı.

Junior kabuk `app/junior/layout.tsx` başlık şablonunu `%s | yetkin.ai Junior` yapar. Açıklama, anahtar kelime ve paylaşım kartı bu kabuktadır. Kanonik adres yine sayfanın kendisindedir.

Açılış sayfası `/junior` şu başlığı basar:

`6. Sınıf Online Dersler | yetkin.ai Junior`

6. sınıf ders sayfasının başlık kalıbı şudur:

`{Ders Başlığı} - 6. Sınıf {Branş} | yetkin.ai Junior`

Örnek, yerel sunucuda görülen başlık:

`Üslü ifadede taban ve üs - 6. Sınıf Matematik | yetkin.ai Junior`

Bu başlık mutlaktır. Şablon ikinci kez marka eklemez. Kanonik adres `https://yetkin.ai/junior/ders/jr_06_mat-1` olur. Paylaşım kartı `tr_TR` yerelini, ders kapağını ve aynı başlığı taşır.

Ücretsiz ilk konu `index, follow` alır. Kilitli konu `noindex, nofollow` alır ve yapısal veri basmaz. Kasa sayfası `/junior/checkout` da indekslenmez.

## 2. Yapısal veri

Junior açılış sayfası iki düğüm basar: `Course` ve `FAQPage`. Kurs adı «6. Sınıf Online Dersler»dir. Seviye «6. Sınıf»tır. Ders çevrimiçidir. Sağlayıcı yetkin.ai kuruluş kaydıdır. Yıllık paket tutarı bu düğüme yazılmaz.

Ücretsiz ilk konu sayfası da `Course` ve `FAQPage` basar. Bu konu ücretsiz olduğu için teklif `0 TRY` olur. Sayfada şu cümle görünür: «Bu konu, 6. sınıf {branş} dersinin ücretsiz ilk konusudur. Sonraki konular yıllık paketle açılır.»

Açılıştaki sık sorulanlar ekranda da durur. Sorular şunlardır: ilk konu ücretsiz mi, kilit nasıl açılır, dersi kim açar, hangi sınıf yayında. Akademi sertifikası Junior şemasına yazılmaz.

## 3. Site haritası ve robots.txt

Dosyalar `app/sitemap.ts` ve `app/robots.ts` dosyalarıdır. Canlı yollar `/sitemap.xml` ve `/robots.txt` olur.

Site haritasına giren kamu odaları: `/academy`, `/career`, `/junior`. Yasal sayfalar (`/legal` ve alt yollar), iletişim, hakkımızda, sertifika doğrulama ve vize kartı durur. Yayın akademi kursları durur.

Ücretsiz ilk konu kartları da haritadadır. On bir adres:

- `/junior/ders/jr_06_mat-1`
- `/junior/ders/jr_06_fen-1`
- `/junior/ders/jr_06_turkce-1`
- `/junior/ders/jr_06_ing_main-1`
- `/junior/ders/jr_06_sosyal-1`
- `/junior/ders/jr_06_ing-1`
- `/junior/ders/jr_06_alm-1`
- `/junior/ders/jr_06_fra-1`
- `/junior/ders/jr_06_siyer-1`
- `/junior/ders/jr_06_kod-1`
- `/junior/ders/jr_06_arp-1`

Kilitli haftalar ve `/junior/checkout` haritada yoktur. Harita ders gövdesini okumaz. Anahtar `{slug}-1` listesidir ve katalogdaki ücretsiz ilk konu listesiyle aynı sıradadır.

Kök adres `/` haritada yoktur. Bu adres kalıcı olarak `/academy` kataloğuna iner. Haritaya yazılırsa Arama Konsolu yönlendirmeli sayfa sayar. Google’ın okuyacağı karşılık `https://yetkin.ai/academy` adresidir. O adres haritadadır.

`robots.txt` hem genel tarayıcıya hem Googlebot’a aynı kuralı verir. İzin verilen yollar kamu odaları, yasal sayfalar ve mühürlü akademi antreleridir. Engellenen yollar arasında `/dashboard`, `/admin`, `/api/`, giriş, cüzdan, kasa ve `/junior/checkout` vardır.

## 4. Kapak metni ve kanonik adres

Fırınlanmış JPEG kapakları `components/junior/lesson-covers.tsx` içindedir. Alternatif metin ders başlığını ve sınıfı birlikte söyler. Örnek: `Üslü ifadede taban ve üs - 6. Sınıf Matematik`. Kart ve seçmeli raf bu metni başlık ve sınıf ile doldurur. JPEG yüklenmezse yedek çizim aynı adı taşır.

Kanonik adres `pageMetadata` ile sayfanın kendi yoluna bağlanır. Kök `https://yetkin.ai` dir. Junior açılış `https://yetkin.ai/junior` dir. Ücretsiz ders kendi ders adresidir.

## 5. Doğrulama

SEO yüzey testi ve yasal lansman testi geçti. 44 test yeşil.

Yerel sunucuda şu sayfalar 200 döndü:

| Adres | Sonuç |
| --- | --- |
| `/junior` | Başlık, açıklama, anahtar kelime, Open Graph, kanonik adres, Course, FAQPage ve sık sorulanlar |
| `/junior/ders/jr_06_mat-1` | Tam ders başlığı, `index, follow`, Course, ücretsiz ilk konu cümlesi |
| `/junior/ders/jr_06_mat-2` | `noindex, nofollow`, Course yok |
| `/robots.txt` | Googlebot ve genel tarayıcı; `/junior` açık, `/junior/checkout` kapalı |
| `/sitemap.xml` | `/junior` ve on bir ücretsiz ilk konu; kök, kasa ve kilitli ders yok |

Kapaklarda sınıf seviyeli alternatif metin görüldü.
