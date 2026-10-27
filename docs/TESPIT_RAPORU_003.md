# TESPIT RAPORU 003 — Junior katalog kapakları (`/junior`)

Tarih: 27 Ekim 2026, 23:19 TSİ  
Kapsam: `https://yetkin.ai/junior`, «Tüm Dersler» rafı.  
Yöntem: kart bileşeni, kapak adresi, yerel `public/media/junior/covers`, `https://cdn.yetkin.ai` ve `https://yetkin.ai` HEAD, CDN gövdesinin SHA-256 karşılaştırması, canlı DOM.

Bildirilen «ilk kart hariç bütün kartlar kırık» hali, sayfanın üstündeki matematik sırasından okunuyor. Ölçülen kırık ikon daha dar: 26 matematik kartından 8’i. Fen, Türkçe, İngilizce ve Sosyal Bilgiler kapaklarının tamamı yükleniyor.

---

## 1. Kırıklık sebebi

Kart kapağını `VisualCourseCards` basar; her ders `LessonCover` kullanır. Adres `juniorCoverSrc` ile kurulur: `/media/junior/covers/{ders}.jpg?v={manifestin ilk 12 karakteri}`. Üretimde `resolvePublicMediaUrl` bu yolu `https://cdn.yetkin.ai` köküne bağlar. Canlı sayfadaki 108 `<img>` öğesinin tamamı bu kökü kullanıyor.

İlk kart `jr_06_mat-1`. CDN nesnesi 200, `271830` bayt, SHA-256 `2282d7851672…`. Bu, kapak manifestindeki kayıt ve `docs/TEDAVI_RAPORU_002.md` içinde kovaya yazılan tek kapaktır. Tarayıcıda `naturalWidth` `1280`.

Aynı rafta 11 matematik anahtarı kamu yolda yok. HEAD, sorgu damgasız ve `?v=` damgalı adreste aynı sonucu verdi: **404**, `Content-Type: text/plain;charset=UTF-8`.

| İstenen anahtar | Canlı kart |
| --- | --- |
| `jr_06_mat-2` | Kırık `<img>` |
| `jr_06_mat-3` | Kırık `<img>` |
| `jr_06_mat-4` | Kırık `<img>` |
| `jr_06_mat-8` | Kırık `<img>` |
| `jr_06_mat-9` | Kırık `<img>` |
| `jr_06_mat-10` | Kırık `<img>` |
| `jr_06_mat-16` | Kırık `<img>` |
| `jr_06_mat-20` | Kırık `<img>` |
| `jr_06_mat-23` | SVG yedek |
| `jr_06_mat-24` | SVG yedek |
| `jr_06_mat-25` | SVG yedek |

Kırık sekiz öğede `complete === true` ve `naturalWidth === 0`. Çerçeve boş pembe kalıyor; sol üstte tarayıcının kırık görsel imi ve `alt` metni duruyor. `jr_06_mat-2` («Asal sayılar ve asal çarpanlar») ve `jr_06_mat-3` («Ortak bölen ve ortak kat») canlı sayfada bu halde görüldü.

Yedek çizim kodda var. `LessonCover`, manifest kaydı yoksa veya `onError` state’i ders anahtarına eşitse `FallbackLessonCover` SVG’sini basar (`data-junior-cover-fallback`). Bu 11 anahtarın hepsi manifestte. İlk çizim `<img>`. Hata olayı dinleyici bağlanmadan biterse state değişmez ve kırık `<img>` kalır. Belge sırasında `jr_06_mat-20` ile `jr_06_mat-23` arasındaki kesit bunu gösteriyor: üstteki sekiz 404 kırık ikon, alttaki üç 404 aynı bileşende SVG. Yedek mekanizma yok değil; sekiz kartta çalışmamış.

`https://yetkin.ai/media/junior/covers/*.jpg` 123 adresin hepsinde 404. Kapak klasörü Vercel paketine girmez (`lib/media/offload.ts`). Köken 404’ü bu yüzden beklenen yoldur. Sayfa zaten CDN kökünü istiyor; kırık ikonun kaynağı köken değil, CDN’de olmayan 11 nesnedir.

Seçmeli sekme bu ölçümde açılmadı. Seçmeli ders anahtarları kapak manifestinde yok. `LessonCover` manifest kaydı olmayan derste `<img>` basmadan SVG çizer.

Dağıtım kapısı bu 11 boşluğu görmez. `npm run verify:junior-audio-cdn` kapak için yalnız `jr_06_mat-1.jpg` durumunun 200 olmasını ister (`scripts/verify-junior-audio-manifest.ts`). O tek kapı yeşilken diğer matematik kapakları 404 kalabilir.

---

## 2. Yerel ve canlı medya durumu

Yerel klasör: 123 JPEG. Kapak manifesti: 111 anahtar. Manifestteki her anahtarın dosyası diskte var. Diskte olup manifestte olmayan 12 dosya `jr_06_mat-27` … `jr_06_mat-38`. Bunlar katalog anahtarı değil; her biri başka bir matematik kapağının birebir kopyası (aynı SHA-256). Raf bu 12 adı istemiyor.

CDN sayımı, 27 Ekim 2026:

| Küme | Adet | Canlı sonuç |
| --- | --- | --- |
| Manifest, matematik dışı | 85 | 200. SHA-256 manifest ile aynı. Fen 27, İngilizce 14, Türkçe 20, Sosyal 24. |
| `jr_06_mat-1` | 1 | 200. SHA-256 manifest ile aynı. |
| Diğer matematik manifest anahtarları | 25 | 11 tanesi 404. 14 tanesi 200 ama gövde başka dersin dosyası. |
| `jr_06_mat-27` … `38` | 12 | 200. Gövde, diskteki kopya dosya ile aynı. Sayfa istemiyor. |

404 olan 11 dosyanın baytları kovada duruyor; anahtar başka. SHA-256 eşlemesi:

| Diskteki dosya | Kovada durduğu anahtar |
| --- | --- |
| `jr_06_mat-2` | `jr_06_mat-6` |
| `jr_06_mat-3` | `jr_06_mat-7` |
| `jr_06_mat-4` | `jr_06_mat-14` |
| `jr_06_mat-8` | `jr_06_mat-12` |
| `jr_06_mat-9` | `jr_06_mat-13` |
| `jr_06_mat-10` | `jr_06_mat-15` |
| `jr_06_mat-16` | `jr_06_mat-32` |
| `jr_06_mat-20` | `jr_06_mat-34` |
| `jr_06_mat-23` | `jr_06_mat-18` |
| `jr_06_mat-24` | `jr_06_mat-19` |
| `jr_06_mat-25` | `jr_06_mat-37` |

200 dönüp yanlış dersi gösteren 14 kart. Soldaki anahtar sayfanın istediği adres, sağdaki yerel dosya indirilen gövde:

| CDN anahtarı | Gövdenin yerel dosyası | SHA-256 ilk 12 |
| --- | --- | --- |
| `jr_06_mat-5` | `jr_06_mat-1` | `2282d7851672` |
| `jr_06_mat-6` | `jr_06_mat-2` | `eb3cc6fc7ee5` |
| `jr_06_mat-7` | `jr_06_mat-3` | `62ec085da664` |
| `jr_06_mat-11` | `jr_06_mat-7` | `1af232720f6f` |
| `jr_06_mat-12` | `jr_06_mat-8` | `f0cbcd4f5cb1` |
| `jr_06_mat-13` | `jr_06_mat-9` | `d5e8c06afc9a` |
| `jr_06_mat-14` | `jr_06_mat-4` | `58d10c0139c5` |
| `jr_06_mat-15` | `jr_06_mat-10` | `ee87f8473fa5` |
| `jr_06_mat-17` | `jr_06_mat-11` | `6925aae3e637` |
| `jr_06_mat-18` | `jr_06_mat-23` | `1a8d01e33d1d` |
| `jr_06_mat-19` | `jr_06_mat-24` | `b696e0846757` |
| `jr_06_mat-21` | `jr_06_mat-19` | `edab8169e52a` |
| `jr_06_mat-22` | `jr_06_mat-18` | `c24f1a6ad875` |
| `jr_06_mat-26` | `jr_06_mat-5` | `6ee27abd587e` |

`jr_06_mat-5` kırık görünmez; ekranda `jr_06_mat-1` kapağını basar. Matematik rafında kendi dosyasıyla eşleşen tek kart `jr_06_mat-1`.

11 eksik dosyanın disk zamanı 24 Ekim 2026, 16:52 TSİ (`13:52:05Z`); `jr_06_mat-1` ile aynı yazım anı. Bu turda anahtarların neden yer değiştirdiği ayrıca aranmadı. Ölçülen gerçek: güncel dosya duruyor, katalog anahtarının bir kısmı boş, bir kısmı başka dosyayı tutuyor.

Katalog imzalı `private/junior/covers` adresini kullanmıyor. O kopya bu ölçümde açılmadı.

---

## 3. Cursor önerisi ve sonraki plan

Yapılacak iş yeni bir kapak üretmek değil. Diskteki güncel JPEG’i kendi kamu anahtarına koymak, yanlış anahtarın üstüne doğru dosyayı yazmak ve kaçan `onError` yüzünden kırık ikonun kalmasını kapatmak.

1. Manifestteki 111 kapağı, `public/media/junior/covers/{ders}.jpg` dosyasından `media/junior/covers/{ders}.jpg` anahtarına yazmak. Yazmadan önce yerel SHA-256 manifest ile bir kez daha tutmalı. `jr_06_mat-1` zaten tutuyor; yeniden yazılması sakıncasız. 11 boş anahtar oluşur. 14 yanlış matematik nesnesinin üstüne kendi dosyası gelir. Ses dosyalarına ve `docs/TEDAVI_RAPORU_002.md` içinde bilinçli bırakılan ses boyutu sapmasına bu turda dokunulmaz. `jr_06_mat-27` … `38` katalogta yok; silme kararı ayrı turda kalır.
2. Yazımdan sonra her manifest anahtarı için GET. Durum 200, bayt ve SHA-256 manifest ile aynı olmalı. Özellikle `jr_06_mat-5` artık `2282d7851672` olmamalı; manifest özeti `6ee27abd587e…` olmalı. `jr_06_mat-2` 404 kalmamalı.
3. `verify:junior-audio-cdn` kapak kapısını tek `jr_06_mat-1` durum kontrolünden çıkarıp 111 manifest anahtarının 200’üne ve bayt/SHA eşitliğine bağlamak. Bu kapı kırmızıysa matematik rafı yine sessizce bozulur.
4. `LessonCover` ilk karede kırık `<img>` bırakmamalı. SVG ile açılıp görsel `load` olunca JPEG’e geçmek, ya da bağlandıktan sonra `complete && naturalWidth === 0` ise SVG’ye düşmek, kaçan `onError` olayını kapatır. Mevcut `FallbackLessonCover` duruyor; eksik olan, hata olayının hiç bağlanmadığı andaki geçiş.
5. Dağıtımdan sonra `https://yetkin.ai/junior` üzerinde aynı sayım: matematik 26 kartın 26’sı `naturalWidth > 0` ya da SVG; sekiz kırık ikon kalmaz. `jr_06_mat-5` görüntüsü `jr_06_mat-1` ile aynı dosya olmaz. Fen, Türkçe, İngilizce ve Sosyal kartları 1280 piksel kalır.

Bu turda kod ve kova değiştirilmedi. Rapor tespittir.
