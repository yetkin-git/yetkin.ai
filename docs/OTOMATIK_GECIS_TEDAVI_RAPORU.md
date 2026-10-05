# Otomatik geçiş ve ders ilerleme — tedavi raporu

| Alan | Değer |
|------|--------|
| Tarih | 5 Ekim 2026 |
| Kaynak | `docs/OTOMATIK_GECIS_TESPIT_RAPORU.md` |
| Sayfa | Akademi oynatıcı `/academy/{eğitim}/oyna` |
| Bu tur | Kod değişti. PayTR SMS kutusuna dokunulmadı. |

## Kısa hüküm

Saat iki tarafı da dolunca bitiş haberi üst kata çıkar. Otomatik Geçiş açıksa sıradaki açık ders seçilir ve anlatım sürer. Ders kaydı, sunucunun döndürdüğü açık ders listesine bakar. Oynatma listesinde biten ders, seçili kalsa da yeşil tik ve «Tamamlandı» yazar.

## 1. Saat dolunca sıradaki ders

Eski kapı yalnız kasetin `ended` olayına ve mühürlü sürenin 1,5 saniye yakınına bakıyordu. Nefes zamanlayıcısı saati eşitleyince haber yine kesiliyordu. Erken bitiş bir kez 0,2 saniye ileri sarıp susuyordu.

Şimdi iki kapı var.

Kaset gerçekten mühürün 1,5 saniye yakınına gelmişse eski kapı durur. Nefes saati iki tarafı da doldurmuş ve kaset `ended` demişse haber yine gider. Oynatılmamış kaset bu kapıyı açmaz. Erken saniye, nefes zorlanmadan dersi bitirmez.

Erken `ended` bir kez dosyanın sonuna sarar. Sarma kalmadıysa nefes zamanlayıcısı kurulur. Saat eşitlenince üst kata haber gider.

Anahtar bu haberden sonra okunur. Anahtar `academy_autoplay_enabled` dir. Açıksa sıradaki açık ders `setActiveKey` ile seçilir. Adres aynı `/oyna` sayfasında kalır. Yeni dersin anlatımı kendiliğinden başlar.

Kayıt cevabındaki ders listesi, sayfada duran eski açık bayrağının önüne geçer. Sunucu sıradaki dersi açtıysa geçiş o listeye bakar.

Kayıt sürerken ikinci bir bitiş haberi düşmez. İlk kayıt bitince haber yeniden denenir.

## 2. Ders tamam kaydı ve liste işareti

Bitiş haberi, ders henüz tamam değilse `POST /api/academy/courses/{kurs}/curriculum` çağrısını atar. Gövde yine yalnız ders anahtarıdır. Sunucu iş kanıtını kendisi doldurur. Cevap başarılıysa ders anahtarı tamam kümesine yazılır.

Cevap hata verirse küme büyümez. Ekranda «Ders tamamlanamadı.» kalır. Otomatik geçiş de bu hatada durur.

Oynatma listesindeki kart, tamamsa seçili olsa da şunları gösterir:

- Yeşil tik
- «Tamamlandı» yazısı
- Kartın altında dolu yeşil çizgi

Seçili kartın mavi noktası, tamamlanınca tike bırakır. Kartın seçili çerçevesi durur. Bitmemiş kartta tik yoktur.

Ücretsiz önizlemede sıradaki ders kilitliyse kayıt yazılmaz. Satış penceresi açılır. Bu, ödemesiz derste sahte «Tamamlandı» basmamak içindir.

## 3. Dokunulmayan iş

PayTR SMS kutusu bu turda değişmedi. Kutu bankanın sayfasındadır. Token gövdesine görünürlük anahtarı eklenmedi.

## Değişen dosyalar

| Dosya | Ne değişti |
|-------|------------|
| `lib/academy/lesson-advance.ts` | Nefes saati haberi, dosya sonuna sarma, sunucu ders listesini sayfa listesinin önüne alma |
| `components/academy/lesson-media-player.tsx` | Bitiş haberinin mühürde susmaması |
| `components/academy/curriculum-player.tsx` | Kayıt, sıradaki ders seçimi, listedeki tamam işareti |
| `app/globals.css` | Yeşil tik, «Tamamlandı» yazısı, dolu çizgi |
| `tests/academy/lesson-advance.test.ts` | Yeni kapıların birim testi |
| `tests/academy/curriculum-player-surface.test.ts` | Oynatıcı yüzeyinin yeni işaretleri taşıması |
| `tests/academy/lesson-player-media.test.ts` | Eski 0,2 saniye sarmanın kalkması |

## Doğrulama

Birim testler geçti. 7 dosya, 47 test. Komut:

`npx vitest run tests/academy/lesson-advance.test.ts tests/academy/curriculum-player-surface.test.ts tests/academy/lesson-player-media.test.ts tests/academy/curriculum-player.test.ts tests/academy/listen-fallback.test.ts tests/academy/proof-of-work.test.ts tests/academy/proof-of-work-verify.test.ts`

Tarayıcıda `/academy/01_office_ai/oyna` açıldı. Otomatik Geçiş açıktı. Ücretsiz ilk dersin sesi sona alındı. Saat `11:44 / 11:44` oldu. Satış penceresi açıldı. Yazı: «Ödeme alınmadan ders içeriği açılmaz.» Sıradaki ders kilitli kaldı. Listede «Tamamlandı» çıkmadı. Bu oturumda satın alma yoktur. Kayıt çağrısı bu kapıda bilinçli olarak atılmaz.

Satın alınmış eğitimde aynı bitiş haberi kaydı yazar ve sıradaki açık dersi seçer. O akış bu oturumda oynatılamadı.

Yeşil tik kuralı sayfanın biçiminde durur. Renk `rgb(15, 157, 122)`. Köşe yuvarlaktır. Tamam kartı bu oturumda çizilmedi. Çizim, kayıttan sonra seçili kartta da aynı tik ve «Tamamlandı» yazısını basar.
