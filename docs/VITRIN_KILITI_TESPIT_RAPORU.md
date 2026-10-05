# Vitrin kilidi tespit raporu

| Alan | Değer |
|------|--------|
| Tarih | 5 Ekim 2026, akşam |
| Sayfa | `https://yetkin.ai/academy` |
| Ölçüm | Taze çizim. Önbellek ıskası (`x-vercel-cache: MISS`, `age: 0`) |
| Kapsam | Tespit. Kod değişmedi |

## Ekranda duran

Altı kart yayında. «Yayında Değil» ve «Çok Yakında» yok. «Fiyat yok» yok.

«Kayıt Kapalı / Fiyat Bekleniyor» cümlesi on iki kez duruyor. Her kartta bir rozet, bir de kapalı düğme. Düğme `aria-disabled` ve adresi boş. «1. Dersi Ücretsiz İzle» sıfır kez duruyor.

Sayfanın kendi verisinde altı kursun üçü de aynı:

| Eğitim | `isPublished` | `priceMinor` | `purchasable` |
|--------|---------------|--------------|----------------|
| E-Ticaret (EC-102) | true | 99000 (₺990) | false |
| Sosyal Medya (SM-103) | true | 89000 (₺890) | false |
| Prompt (PR-105) | true | 129000 (₺1.290) | false |
| Chatbot (BOT-104) | true | 129000 (₺1.290) | false |
| Ofis (OFF-101) | true | 89000 (₺890) | false |
| İleri Ofis (OFF-201) | true | 129000 (₺1.290) | false |

Satırların `updatedAt` değeri 5 Ekim 2026, 11:07 UTC. Fiyat bu akşam veritabanından geliyor.

## 1. Satın alınır sayılmanın üç şartı

Karttaki `purchasable` değeri `academyCatalogPurchasable` fonksiyonundan gelir. Ev `lib/academy/pilot-sku.ts`. Üçü birden durunca kapı açılır. Biri düşünce kart satın al demez.

Vitrin bu hesabı `loadAcademyVitrineCourses` içinde kurar (`lib/academy/load-catalog.ts`). Sonra `confirmedVitrineCard` aynı hesabı bir kez daha yazar (`lib/academy/published-catalog.ts`).

### Yayın bayrağı

`isPublished`, `academy_courses.is_published` sütunudur. Şema `prisma/schema/academy.prisma`.

Vitrin her kabuk kodunu `getCourseBySlug` ile okur. Bu okuma yayın süzgeci uygulamaz. Satır varsa bayrak olduğu gibi karta geçer.

Canlı altı satırda bayrak `true`. Rozet «Yayında Değil» olsa bayrak `false` olurdu. Bu şart duruyor.

Anlatım listesi ayrı bir kapıdır. Sınav yolundaki her dersin ses mührü yoksa kart «Çok Yakında» olur (`academyCourseNarrationPublished`). Canlıda o cümle yok. Anlatım listesi de duruyor.

### Aktif fiyat satırı

Kurs satırında tutar yoktur. Tutar `price_catalog_entries` tablosundadır. Model adı `PriceCatalogEntry`.

Vitrin `listActiveEntries` çağırır. Sorgu `module_key = academy`, `is_active = true` ve kursun `catalog_unit_key` değeri. Tek ders sayfası aynı satırı `findActiveEntry` ile okur. Pasif satır `null` döner (`lib/kernel/pricing/prisma-catalog-store.ts`).

Satır varsa kart `priceMinor` alanına kuruş tutarını yazar. Satır yoksa `priceMinor` boş kalır ve `catalogRowPresent` false olur.

Canlıda tutarlar dolu: 89000, 99000, 129000. Aktif fiyat satırı duruyor.

### Fiyat tohumu neden satış açmıyor

`packages/kernel/src/catalog-ids/course-registry.ts` içindeki `priceSeedMinor` bir tohum rakamıdır. `lib/academy/catalog-pricing.ts` bu rakamı `ACADEMY_CATALOG_PRICE_MINOR` haritasına koyar. Yorumu açık: canlı kilit katalog satırıdır, harita yalnız tohumdur.

Vitrin bu haritayı karta yazmaz. `overlaySeedCatalogPrice` özet ve seviye taşır. Tutarı ve `purchasable` bayrağını tohumdan doldurmaz.

Tohum, operasyon betiklerinde veritabanına yazılmak içindir (`scripts/ops-migrate-lib.ts` içindeki `applyAcademyCatalogPriceMap`, `scripts/ops-publish-vitrine-catalog.ts`). İstek anında kart tohumu okumaz.

Canlı tutarlar zaten katalog satırından gelmiş. Tohumun bu akşam devreye girmemesi bir boşluk. Kapı onu satış hükmü saymıyor.

### Beş medya katmanı

Bu kilitte rolü var. Üçüncü şart odur.

`academyCatalogPurchasable`, üçüncü olarak `academyCourseSaleOpen` okur. Lisans adayı için bu fonksiyon `academyCourseProductionDiskSealed` çağırır. Sınav yolundaki her dersin beş katmanı birden durmalıdır:

1. Metin — `lib/academy/spoken-scripts/{ders}.md`
2. Ses — `public/media/academy/audio/{kurs}/{ders}.mp3`
3. Isınma videosu — `public/media/academy/micro/{kaset}-warmup.mp4`
4. Görsel — `public/academy/cinema/{ders}-cue-1.jpg`
5. Müzik — aynı dersin `.bed.mp3` yatağı

Ev `lib/academy/production-standard.ts`, `academyProductionLayerRelativePaths`.

Ses listesi (`academySkuAudioAllowsPurchase`) tek başına satın al açmaz. O liste, kursun satış adayı olup olmadığını söyler. Nakit kapısı beş katmanı ister. Isınma videosu veya fon yatağı eksikse fiyat ekranda olsa da `purchasable` false kalır.

Okuyucu yuvası boşsa satış kapanır. Yorum bunu karttaki cümleyle yazar. Canlı sunucu medya baytını taşımaz. Dosyaya bakmak bu yüzden false döner.

Çalışma kopyasında üretim ve boş yuva için ikinci bir okuyucu durur. `readProductionDiskProbe`, `NODE_ENV` production iken mühür anlığını okur (`lib/academy/production-seal-manifest.ts`). Aynı anlığı `academyProductionFilePresent` de production dalında okur. Test, bu boş yuvanın altı vitrin eğitimini satışa açık saymasını bekler (`tests/academy/production-standard.test.ts`).

Canlı taze çizim `purchasable: false` göndermiş. Çalışan süreç bu anlığı satışa açık saymıyor.

## 2. Cümlenin basıldığı yer

Cümle `lib/copy/sen-voice/academy.ts` içindedir. Alan adı `catalog.pricePending`. Aynı metin `catalog.badgeClosed` sabitinde de durur. Kart rozeti `pricePending` basar.

İki yer basar. İkisi de `purchasable === false` iken.

1. Rozet. `components/academy/course-card.tsx`. Kurs yakında değil, yayın kapalı değil, satın alınmamış ve `purchasable` false ise rozet bu cümledir.
2. Düğme. `lib/academy/storefront-cta.ts`, `resolveAcademyCatalogCardCta`. Aynı şartta düğme metni bu cümledir, `ctaDisabled` true olur, adres boş kalır.

Fiyat bu dalda silinmez. Tutar varsa rakam durur, düğme kilitlenir. Canlı tam bu daldadır: ₺890 / ₺990 / ₺1.290 görünür, düğme kapalıdır.

Yayın bayrağı false olsaydı cümle «Yayında Değil» olurdu. Anlatım bitmemiş olsaydı cümle «Çok Yakında» olurdu. İkisi de canlıda yok.

## 3. Tedavi

Düğmenin açılması üçüncü şartın canlıda true dönmesine bağlıdır. Birinci ve ikinci şart bu akşam duruyor.

Yapılacak iş, canlı sürecin beş katman hükmünü mühür anlığından okumasıdır. Anlık çalışma kopyasında durur ve altı eğitimin metin, ses, ısınma, görsel ve müzik yollarını işaretler. Üretimde okuyucu yuvası boşsa kod bu anlığa bakar. Taze sayfa hâlâ satın almaz diyor. Çalışan süreç o hükmü vermiyor.

Aynı günkü satış hunisi notu (`docs/AKADEMI_SATIS_HUNISI_RAPORU.md`) bu kapıyı boş medya okuyucusuna bağlamış ve o sürümün not anında dağılmadığını yazmıştı. Bu akşamki çizim aynı kilidi sürdürüyor.

Şunlar bu kilidi açmaz:

- Fiyat tohumu veya `ops:publish-vitrine-catalog` yeniden basılmaz. Aktif tutarlar kartta. Betik ayrıca `academyCourseSaleOpen` false iken yayını atlar.
- Vercel ortam anahtarı bu kapıyı açmaz. `ACADEMY_MEDIA_READ=storage` yalnız production dışı seste devreye girer. Production dalı anlığı okur, bu anahtarı okumaz.
- Üçlü şartın kendisi gevşetilmez. Yayın ve fiyat duruyor. Eksik olan, canlı okuyucunun anlıkla aynı hükmü vermesi.

Kapı açılınca kartın birincil düğmesi «► 1. Dersi Ücretsiz İzle» olur. İkincil düğme «Satın Al — ₺…» olur. Kilit cümlesi kalkar.
