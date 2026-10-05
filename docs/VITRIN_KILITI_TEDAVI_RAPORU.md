# Vitrin kilidi tedavi raporu

| Alan | Değer |
|------|--------|
| Tarih | 5 Ekim 2026, akşam |
| Sayfa | `https://yetkin.ai/academy` |
| Dayanak | `docs/VITRIN_KILITI_TESPIT_RAPORU.md` |
| Kapsam | Okuyucu, mühür anlığı, kart düğmesi |

## Ekranda duran

Altı kart yayında. Fiyat duruyor. Düğme «Kayıt Kapalı / Fiyat Bekleniyor» diyor. `purchasable` false.

Yayın bayrağı açık. Aktif fiyat satırı duruyor. Eksik olan üçüncü şart: beş medya katmanının canlıda «var» sayılması.

Canlı sunucu ses, ısınma videosu ve sinema karesinin baytını taşımaz. Diske bakınca cevap false olur. Kart satın almaz.

Mühür anlığı çalışma kopyasında duruyordu. Kurulu disk okuyucusu false deyince anlık devreye girmiyordu. Derleme betiği de baytı bu makinede olmayan yolu anlıktan siliyordu. Bu makinede ses klasörü boş. Betik eski haliyle çalışsaydı 76 ses yolu düşer, satış yine kapanırdı.

## Ne değişti

1. Üretimde (`NODE_ENV === production`) katman hükmü mühür anlığından okunur. Yuva boşsa anlık yeter. Kurulu okuyucu false dese de anlık true ise katman durur. Testte boş yuva ve sahte false okuyucu satışı kapatmaya devam eder. Eksik katman, üretim dışında, mührü yine keser.
2. Derleme anlığı yazarken vitrin katmanını düşürmez. Yol önceki anlıkta mühürlüyse ve bayt bu makinede yoksa yol pakette kalır. Bilinçli silme `ACADEMY_SEAL_DROP_MISSING=1` ister. Altı eğitimin beş katmanı eksik kalırsa dosya yazılmaz, derleme durur.
3. Anlık dosyası üretim fonksiyon paketinin izine alındı: `lib/academy/production-seal-manifest.ts`. Medya baytı izine girmez.

Bu turda betik anlığı yeniden yazdı. Sonuç 159 yol. 76 yol önceki anlıkta duruyor; ses baytı bu makinede yok.

Altı eğitim: Ofiste Yapay Zekâ (OFF-101), İleri Ofis (OFF-201), E-Ticaret (EC-102), Sosyal Medya (SM-103), Chatbot (BOT-104), Prompt (PR-105).

`academyCourseSaleOpen` ve `academyCatalogPurchasable`, yayın ve fiyat dururken bu altısı için true döner.

## Kart

`purchasable` true iken kilit rozeti kalkar. Birincil düğme «► 1. Dersi Ücretsiz İzle» olur ve oynatıcıya gider. İkincil düğme «Satın Al — ₺…» olur ve kasa çapasına gider.

Tutarlar: E-Ticaret ₺990, Sosyal Medya ₺890, Prompt ₺1.290, Chatbot ₺1.290, Ofis ₺890, İleri Ofis ₺1.290.

## Test

| Dosya | Sonuç |
|-------|--------|
| `tests/academy/production-standard.test.ts` | 11 geçti |
| `tests/academy/enrolment-cta.test.ts` | 17 geçti |
| `tests/academy/catalog-pricing.test.ts` | 4 geçti |
| `tests/academy/media-release-seal.test.ts` | 2 geçti |
| `tests/academy/academy-sealed-media-sync.test.ts` | 2 geçti |
| `tests/academy/off201-prep.test.ts` | 4 geçti |
| `tests/academy/sealed-audio-pilot.test.ts` | 6 geçti |
| `tests/kernel/performance-headers-surface.test.ts` | 4 geçti |

Üretimde disk okuyucusu false iken altı kurs satışa açık sayıldı. `purchasable` true iken altı kartın düğmesi ücretsiz ders ve fiyatlı satın al oldu. Kilit cümlesi bu dalda basılmadı.

## Dağıtım

Bu rapor yazılırken yeni sürüm canlıya dağılmamıştı. Canlı düğme, bu sürüm dağılınca değişir. Dağıtımdan önce sayfa eski kilidi gösterir.
