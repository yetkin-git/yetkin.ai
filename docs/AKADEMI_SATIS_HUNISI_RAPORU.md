# Akademi satış hunisi — teslim raporu

| Alan | Değer |
|------|--------|
| Tarih | 5 Ekim 2026 |
| Kime | SUPER_ADMIN |
| Dal | `main` |
| Commit | `5b0aabf` |
| Konu | İlk ders herkese açık; vitrin satışı genel kullanıma açık |

## Ne değişti

Canlı vitrin (`/academy`) fiyat rakamlarını basıyor, düğme ise «Kayıt Kapalı / Fiyat Bekleniyor» diyordu. Ölçüm, düzeltmeden önce sayfanın HTML’inde bu cümlenin 12 kez geçtiğini gösterdi (altı kartta rozet ve kapalı düğme). Tutar izleri de oradaydı: ₺890, ₺990, ₺1.290.

Kapının nedeni fiyat satırının yokluğu değildi. Üretimde medya okuyucusu boş kalınca satış hükmü kapanıyordu. Lambda ses ve görüntü baytını taşımıyor; üretim okuyucusu mühür anlığıdır. Boş yuva artık bu anlığı okur. Test ortamında boş yuva eskisi gibi satışı kapatır. Eksik katman (ısınma videosu veya fon müziği yokken) satışı yine kapatır.

## İş kuralları

1. **İlk ders.** Yayınlanmış her eğitimin sınav yolundaki ilk dersi, oturum olmadan da açılır. Hazırlık şeridi olan eğitimde o şerit de açıktır. Ders 2 ve sonrası lisans ister. Yayın bayrağı kapalı olsa bile ilk dersi olan eğitim oynatıcıda 404 olmaz; satış kapısı ayrı durur.
2. **İzlerken çağrı.** İlk ders oynarken, bir sonraki ders kilitliyse oynatıcının altında «Satın Al» çağrısı durur. Kilitli derse basınca aynı çağrı pencere olarak açılır.
3. **Satın Al.** Oturum yoksa düğme giriş adresine gider; dönüş yolu kasa çapasıdır (`#satin-al`). Oturum varsa aynı çapa açılır ve PayTR adımı başlar. Onay kutuları dolu değilse kasa formu öne gelir; iframe onaysız açılmaz.
4. **SUPER_ADMIN.** `yapinet360@gmail.com` satın alma satırı olmadan oynatıcıyı açmaya devam eder. Bu kapı bu turda daraltılmadı.

Karttaki yeşil düğme «1. Dersi Ücretsiz İzle» olarak oynatıcıya gider. Fiyatlı ikinci düğme «Satın Al — ₺…» dir.

## Doğrulama

| Kontrol | Sonuç |
|---------|--------|
| `npm run verify:boundaries` | OK |
| `npm run verify:atomic-seals` | OK |
| `npx tsc --noEmit` | Temiz |
| `npm run test:all` | 345 dosya, 1603 test geçti |

Üretim boş yuva testi altı vitrin eğitimini satışa açık sayar: Ofiste Yapay Zekâ, İleri Ofis, E-Ticaret, Sosyal Medya, Chatbot, Prompt.

Oturumsuz sözleşme testte durur: ilk ders açık, ikinci ders kilitli, Satın Al giriş adresine gider. Oturumlu Satın Al kasa çapasına gider ve PayTR dinleyicisini uyandırır.

Bu rapor yazılırken yeni sürüm henüz canlıya dağılmamıştı. Dağıtımdan sonra vitrinde kapalı düğmenin kalkması ve ilk dersin anonim oynatıcıda açılması dağıtımın kendi sonucudur. Dağıtım bitmeden canlı düğme değişmez.

## Kapsam dışı

Junior oda çalışması, silinmiş eski raporlar ve ortam dosyası bu teslimata girmedi. Fiyat tutarı veritabanındaki aktif katalog satırındadır; tohum rakamı o satırın yerine geçmez.
