# Tedavi Raporu — Junior Aşama 1

**Tarih:** 5 Ekim 2026  
**Rol:** SUPER_ADMIN (`yapinet360@gmail.com`)  
**Dayanak:** `docs/TESPIT_RAPORU.md`  
**Kapsam:** Kilit, fiyat kataloğu, çocuk yüzeyi, atıl dosya. Ödeme köprüsü ve 6. sınıf kazanım tamamlanması bu pakette yok.

Tespit anlık görüntüsüdür; o dosya değiştirilmedi. Tarihli eski raporlar da duruyor.

---

## 1. Kilit ve yetki

Derleme sabiti `JUNIOR_PRODUCTION_LOCKED = true` kalktı. Junior kararı çalışma zamanında `canEnterJunior` (`lib/kernel/security/junior-gate.ts`) içindedir. Kenar, ders sayfası ve Junior API bu fonksiyonu okur. Kernel ders metnini import etmez; dersin `free | locked | missing` kararını çağıran taraf verir.

| Niyet | Kim girer |
|---|---|
| Vitrin (`/junior` listesi ve ilk konu) | Herkes. `DRON_JUNIOR_OPEN=0` bu listeyi 410 yapmaz. |
| Ders gövdesi, ikinci konu | Yıllık paket veya doğrulanmış denetim aktörü. |
| Anlatış, pekiştirme, konu testi | Oturumlu veli ve dersi kapsayan aktif paket, ya da denetim aktörü kendi profilinde. İlk konunun ücretsiz görünmesi anlatışı açmaz. |
| Profil masası | Doğrulanmış süper yönetici, `JUNIOR_BETA_ALLOWLIST` içindeki doğrulanmış posta, ya da `DRON_JUNIOR_OPEN=1` iken herhangi bir oturumlu veli. |
| Kasa | `JUNIOR_CHECKOUT_OPEN` boşken herkese kapalı. Bayrak açılsa da `completeJuniorCheckout` bugün `not_configured` döner. |

Denetim aktörü: doğrulanmış `yapinet360@gmail.com`, artı `JUNIOR_BETA_ALLOWLIST` (virgül, noktalı virgül veya boşluk). Posta doğrulanmamışsa kapı açılmaz. `yetkin.vision@gmail.com` listeye yazılsa da girmez. Denetim nakit satırı yazmaz. İlerleme yazması profil sahibine bağlıdır.

Junior `DRON_KAYIT` satırıdır: yol `/junior`, hop listesi boş, sahip ekip amiral, `bayrakEnv` `DRON_JUNIOR_OPEN`. `FROZEN_DISK_ROOMS` yedi odadır (studio, devlabs, kurumsal, hibe, arena, pazaryeri, social). `/junior/ebeveyn` 410 kalır.

## 2. Fiyat

Ürün kodundaki `549_900` ve `"5.499 TL"` kalktı (`lib/junior/limits.ts`). Vitrin `readJuniorYearlyPrice` ile `price_catalog_entries` satırı `cat_junior_yearly` (`module_key=junior`, `unit_key=yearly`, `MINOR`, aktif) okur. Etiket `formatMinorCompact` ile üretilir. Satır yoksa veya okuma düşerse tutar uydurulmaz; düğme «Paketi Al», kasa cümlesi «Liste fiyatı katalogda yok. Tutar uydurulmaz.»

SQL tohumu duruyor: `supabase/migrations/20261005160000_junior_yearly_price_seed.sql` içinde `549900` kuruş. Bu, veritabanı evidir. `updated_by` dolu satırı tohum ezmez. Testlerdeki `549_900` yalnız abonelik satırı stand-in’idir.

Yerel `next dev` bu oturumda katalog satırını döndürmedi. `/junior` düğmesi «Paketi Al», `/junior/checkout` sepeti «fiyat katalogda yok» dedi. Canlı veritabanında satırın ve `updated_by` alanının durduğu ayrıca doğrulanmalıdır.

## 3. Arayüz ve çocuk yüzeyi

- `AiChatWidget` `/junior` ve `/junior/` ile başlayan yollarda basılmaz. `/juniorism` bu kurala girmez. Akademi vitrininde asistan durur.
- `components/academy/junior-cross-sell.tsx` `/academy` kataloğunun altına bağlandı. Metin 6. sınıf pilotunu söyler. Şerit «Junior Derslerini İncele» ile `/junior` adresine gider.
- Bilinmeyen ders adresi (örnek `/junior/ders/jr_06_mat-9`) kenarda HTTP 404 ve `x-robots-tag: noindex` döner. Sayfa başlığı «Sayfa bulunamadı». Bilinen ilk ders 200 döner. Anahtar listesi `lib/junior/lesson-index.ts` içindedir ve `juniorCatalogLessonKeys()` ile testte kilitlidir.

## 4. Atıl dosya, mühür, runbook

Silinenler:

- `tests/_archived-junior/` (üç dosya). Vitest dışlama satırı da kalktı.
- `lib/kernel/rooms.ssot.ts`. Kayıt evi `lib/dronlar/kayit.ts`.

Dokunulmayan inceleme listesi: Freelancer yetim bileşenleri, Akademi faz-2 taslakları, `lib/kernel/env.ts`, `memory-port`, `maarif-seal.tsx`. Mühür betiği `maarif-seal.tsx` dosyasını hâlâ okur. Tespit listesi silme listesi değildir.

`scripts/verify-junior-guardianship-seals.ts` artık `juniorPilotSealIssues()` ile aynı kontrolleri koşar ve başarıda 0 döner. `package.json` bu dosyayı çalıştırır. İki giriş aynı mühürdür.

`.system_docs/OPS_RUNBOOK.md` içine «Junior — kapalı beta» bölümü eklendi: bayraklar, kasa, geri alma. `.env.example` içinde `DRON_JUNIOR_OPEN`, `JUNIOR_BETA_ALLOWLIST` ve boş kalması gereken `JUNIOR_CHECKOUT_OPEN` durur.

Anayasa B6 ve Pedagoji’de birer cümle güncellendi: kapı `canEnterJunior`, kasa `isJuniorCheckoutLocked`. Model haritasına ve beş katman mührüne dokunulmadı.

## 5. Doğrulama

| Komut | Sonuç |
|---|---|
| Junior + kenar + sınır Vitest (21 dosya, 133 test) | Geçti |
| `npm run verify:junior-pilot-seals` | Geçti |
| `npm run verify:junior-guardianship-seals` | Geçti |
| `npm run verify:boundaries` | Geçti |
| `npm run verify:atomic-seals` | Geçti |
| `npx tsc --noEmit -p tsconfig.json` | Geçti |

Tarayıcı, yerel `next dev` üzerinde:

- `/junior` 200. Ders listesi ve 6. sınıf pilot cümlesi duruyor. «5.499» metni yok. Asistan düğmesi yok.
- `/junior/checkout` 200. «Ödeme hattı henüz bağlanmadı.» Katalog satırı bu veritabanında görünmediği için sepet tutar basmıyor. Asistan düğmesi yok.
- `/academy` 200. Şerit «Çocuğun için 6. sınıf dersleri Junior'da» ve «► Junior Derslerini İncele». Akademi asistanı bu sayfada duruyor.
- `/junior/ders/jr_06_mat-1` 200. `/junior/ders/jr_06_mat-9` 404, başlık «Sayfa bulunamadı».

Canlı oturum açılmadı. Süper yönetici ikinci konu ve paketsiz anlatış, bellek deposunda doğrulanmış posta ile birim testte geçti. Hidrasyon uyarısı, tarayıcı aracının `data-cursor-ref` eklemesinden geldi; ürün ağacındaki bir dal hatası değil.

Ödeme hâlâ abonelik yazmıyor.

---

## 6. Aşama 2 ve Aşama 3 — kalan riskler

### Aşama 2 — ödeme köprüsü ve hukuk

1. **Kasa bayrağı tek başına satış açmaz.** `JUNIOR_CHECKOUT_OPEN` açılsa da üretim kasası `not_configured` döner. Köprü yazılmadan bayrak çevrilirse vitrin ile kasa ayrışır.
2. **Deneme PayTR üçlüsü duruyor.** `merchantId: "000000"` ve sandbox HMAC `lib/junior/paytr.ts` içinde. Canlı üçlü, bildirim URL’si ve imza doğrulaması bağlanmadan tahsilat yok.
3. **Köprü yok.** Başarılı ödeme `junior_subscriptions` satırını idempotent yazmıyor. Aynı `merchant_oid` iki kez gelirse çift lisans riski köprüyle birlikte kapanmalı. Akademi lisans köprüsü kopyalanırken çocuk lisansı yetişkin kurs satın almasına bağlanmamalı.
4. **Hukuk kasadan önce gelir.** Çocuk sesi üçüncü taraf modele gidiyor. KVKK aydınlatma, veli rızasının sürümü, mesafeli satış ve cayma metni mühürlenmeden kasa açılmaz. TCKN düz metin saklanmaz.
5. **Fatura ve makbuz ayrı kanal.** Akademi makbuzu Junior ödemesine bağlı değil. Çocuk paketinde veli faturası ve iade cümlesi ayrıca yazılır.
6. **Yerel katalog boş göründü.** Canlı `cat_junior_yearly` satırı ve `updated_by` doğrulanmadan vitrin tutar basmayabilir. Okuma hatası ile eksik satır bugün aynı cümleyi üretir; operatör ikisini logdan ayırır.
7. **Denetim ile satış aynı kapıda durmamalı.** Denetim aktörü paketsiz anlatır. Bu yol webhook veya abonelik yazmamalıdır. Aşama 2’de test bu ayrımı yeniden kilitlesin.

### Aşama 3 — 6. sınıf kazanımları

1. **Kazanım envanteri yok.** İkinci konular pilot metnidir. MEB kazanım kodu, soru bankası ve «konu hazır» kapısı ayrıdır. Soru arşivi olmayan konuda test adımı hazırlıkta kalmalıdır.
2. **Üçlü metin.** `listenText`, `mebNote` ve `lifeUse` aynı sahneyi üç kez taşıyor. Yeni konu yazılırken tek sahne metni esas alınsın; üç kopya sapar.
3. **Dikey dilim.** Tüm sınıfı aynı anda mühürlemek yerine bir konu (kesir) metin, anlatış, soru ve veli notu ile uçtan uca bitsin. Sonra diğer konular aynı kalıba girsin.
4. **Yetişkin beş katman Junior’a kopyalanmaz.** Akademi video, görsel ve müzik mührü okul dersinin kapısı değildir. Model haritası yerinde durur.
5. **Hop listesi boş kalsın.** Native istemci Junior okumadan v1 hop açılırsa sözleşme ile sayfa ikiye ayrılır.

## 7. Shared Kernel / API-First

Bu iki aşama bitince platform yüzde yüz uyumlu olmaz. Yön doğru: oda kaydı tek evde, fiyat kataloğu tek evde, Junior yetki kararı kernel kapısında, kernel `lib/junior` import etmiyor.

Junior uygulaması hâlâ paralel yığın: sıfır hop, çerezli web rotaları, ders gövdesi `lib/junior` içinde, kenar yol politikasını kernelde taşıyor. Yetişkin Akademi’nin lisans ve entitlement kapısı ile Junior kapısı ortak bir sözleşme değil. Native istemci Junior’ı tüketmiyor.

Yüzde yüz iddiası, hop ve ortak entitlement yazıldıktan sonra kurulur. Bu paket o iddiayı kurmaz.

## 8. SUPER_ADMIN için sonraki adımlar

1. Canlı veritabanında `cat_junior_yearly` satırını ve `updated_by` değerini doğrula. Satır yoksa tohum migrasyonunu uygula. Tutarı vitrinden değiştirmek için katalog satırını güncelle; koda rakam yazma.
2. `JUNIOR_CHECKOUT_OPEN` boş kalsın. `DRON_JUNIOR_OPEN` boş kalsın; liste zaten açık. Ek denetçi gerekiyorsa yalnız doğrulanmış postaları `JUNIOR_BETA_ALLOWLIST` içine yaz.
3. Aşama 2’ye hukuk metniyle gir: çocuk sesi, veli rızası, mesafeli satış, cayma. Metin mühürlenmeden PayTR canlı üçlüsü bağlanmasın.
4. Köprü tek niyet olsun: Junior yıllık lisans. Webhook idempotent olsun. Deneme mağaza numarası ve sandbox HMAC canlı yolda kapalı kalsın. TCKN düz metin yazılmasın.
5. Aşama 3’te önce kesir konusunu tek sahne, soru bankası ve veli cümlesiyle bitir. Sınıfın kalanı o kalıbın kopyası olsun.
6. v1 hop’u native ihtiyaç doğunca aç. O güne kadar `DRON_KAYIT` junior satırının hop listesi boş kalsın.

Aşama 1 bittiğinde kamu davranışı aynıdır: liste ve ilk konu açık, ikinci konu ve anlatış paket ister, kasa tahsil etmez. Süper yönetici kendi test profilinde ikinci konuyu, anlatışı ve testi denetleyebilir.
