# Konumlandırma ve yasal güncelleme raporu

Tarih: 18 Kasım 2026

Kamu kimliği tek çatı altında **beş modüllü birleşik AI işletim sistemi** olarak hizalandı: E-Ticaret OS, YetkinHibe OS, AI Tezgâh, YetkinCV ve Kariyer, Kurumsal İlan ve Eleme. Eski “iki işletim sistemi” başlığı ile “beş işletim sistemi” vitrini aynı sayfada çelişmiyor. Hakkımızda ve yasal metinler platformu artık B2C dijital eğitim platformu olarak tanımlamıyor.

Rota, ödeme, RLS ve kasa rıza sürümü değişmedi. Şirket unvanı, adres, vergi dairesi, VKN, MERSİS, destek e-postası ve WhatsApp aynen duruyor. Ana sayfadaki PayTR cümlesi birebir kaldı: «PayTR iFrame + 3D Secure. Kart numarası platformda tutulmaz». Yasal sayfalar kartı yine «Yetkili Ödeme Kuruluşu» diye anıyor; kart numarasının platformda tutulmadığı cümlesi duruyor. Kasa rıza sürümü `2026-09-08`.

## 1. Ana sayfa ve SSS

Kahraman başlık: «Beş modüllü birleşik AI işletim sistemi. Tek hesap.»

Alt vitrin başlığı «Beş modül / Tek işletim sistemi». Beş kart:

| Modül | Adres |
|---|---|
| E-Ticaret OS | `/e-ticaret` |
| YetkinHibe OS | `/hibe` |
| AI Tezgâh | `/tezgah` |
| YetkinCV & Kariyer | `/career` |
| Kurumsal İlan & Eleme | `/kurumsal` |

Kök SSS’deki online kurs, sertifika ve ücretsiz yetkinlik testi soruları kalktı. Yerine beş soru geldi: E-Ticaret kokpiti, YetkinHibe uygunluk ve proje dosyası, AI Tezgâh ücretsiz kotası (misafir ve üye günde 3), YetkinCV SHA-256 doğrulaması, kurumsal ilanda başvurunun yalnız ilanı açan şirketle paylaşılması.

Dört adımlı değer zinciri ve yedi tezgâh aracı yerinde kaldı. Akademi kataloğunun kendi SSS’i ve «yapay zeka eğitimi / online kurs» arama metni duruyor; o sayfa hâlâ kurs kataloğu.

## 2. Hakkımızda ve yasal metinler

Hakkımızda, platformu KOBİ’ler, girişimciler, danışmanlar ve kurumsal şirketler için AI tabanlı iş ve operasyon işletim platformu olarak anlatıyor. Sicil unvanının gayrimenkul ve e-ticaret taşıdığı dürüst cümle duruyor. Kart «Akademi odaklı hikâye» yerine «Platform hikâyesi».

Gizlilik ve KVKK metni mevcut hesap, oturum, bakiye ve kart açıklamasının yanına modül verisini ekledi:

1. E-Ticaret OS: mağaza ürün, stok ve pazaryeri entegrasyon verileri.
2. YetkinHibe OS: firma profil bilgileri ve proje taslak verileri.
3. AI Tezgâh: üretim için girilen metin ve ürün girdileri ile oluşturulan çıktılar.
4. YetkinCV ve kurumsal ilan: sınav puanları, SHA-256 doğrulama özetleri ve yalnızca ilanı açan yetkili şirketle paylaşılan başvuru bilgileri.

Kullanım şartları, mesafeli satış ve iade; AI Tezgâh Pro ile E-Ticaret İşletme Lisansını aylık dijital abonelik, YetkinHibe proje dosyası ile AI Tezgâh çıktısını tek seferlik dijital içerik olarak yazıyor. Akademi ders erişiminin anında ifa ve cayma istisnası, kullanılmamış bakiyenin karta kendiliğinden dönmediği cümle ve fatura cümlesi duruyor.

## Bilerek dokunulmayanlar

- Ödeme akışı, kasa tikleri, `CHECKOUT_LEGAL_CONSENT_VERSION` (`2026-09-08`).
- Rota ağacı, RLS, API yetki haritası.
- Akademi kurs sayfaları, ofis yapay zekâ SSS’i ve Course şeması. Katalog hâlâ eğitim satıyor; site kimliği artık oradan okunmuyor.
- Organization şemasındaki `EducationalOrganization` ek türü. Akademi Course düğümü bu türe bağlı; bu turda şema türü değiştirilmedi.

## Doğrulama

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | Geçti |
| `npm run lint` | Geçti (0 hata, 9 eski uyarı; bu turdaki dosyalarda değil) |
| `npm run verify:prebuild` | Geçti (`verify:junior-sync OK` dahil) |
| `npx vitest run` | Geçti: 471 dosya, 2412 test |

Geliştirme sunucusunda `GET /`, `/hakkimizda`, `/legal/gizlilik`, `/legal/iade`, `/legal/kullanim` ve `/legal/mesafeli-satis` yeni metinleri döndürdü. Eski «İki işletim sistemi», «online kurs sunuyor mu» ve «B2C yetkinlik platformudur» bu yanıtlarda yok. IDE tarayıcı sekmesi kapalı `/academy` odasında kaldığı için görsel tıklama turu tamamlanamadı; metin HTTP yanıtından doğrulandı. Playwright (`tests/e2e/faz1-nav.spec.ts`) yeni başlığa güncellendi, bu turda çalıştırılmadı.

## Etkilenen dosyalar

- `lib/copy/sen-voice/public.ts`
- `lib/copy/sem-keywords.ts`
- `lib/copy/seo.ts`
- `lib/copy/legal-launch.ts`
- `app/(public)/page.tsx`
- `app/(public)/hakkimizda/page.tsx`
- `app/layout.tsx`
- `tests/copy/sen-axis-surface.test.ts`
- `tests/copy/seo-surface.test.ts`
- `tests/ui/brand-mark-surface.test.ts`
- `tests/ui/home-offer-surface.test.ts`
- `tests/kernel/legal-launch-surface.test.ts`
- `tests/e2e/faz1-nav.spec.ts`
- `docs/KONUMLANDIRMA_VE_YASAL_GUNCELLEME_RAPORU.md`
