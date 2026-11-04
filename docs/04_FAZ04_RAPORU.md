# Faz 04 — Super Admin Operasyon Konsolu v1 ve büyüme temeli

**Tarih:** 4 Kasım 2026
**Girdi:** `docs/03_FAZ03_RAPORU.md` bölüm 5.3. Konsol yeni oda değildir. Tek kapı `SUPER_ADMIN_USER_ID` (fail-closed). Yazılar `super_admin_audit_logs` tablosuna eklenir. UPDATE/DELETE tetiği durur.
**Kapsam:** `/admin/ops` üç masası, fiyat ve sertifika iptali için denetim eylemi, sapmadan birebir kart iadesi, kamu rehberi `/rehber`. Canlı veritabanına migrasyon uygulanmadı. Canlı sipariş yazılmadı.

---

## 1. Operasyon konsolu

Yüzey `/admin/ops`. Kenar bunu `/admin` sığınağı sayar: oturumsuz istek `307 /login`. Sayfa `resolveSuperAdminAccess` ile açılır. Eşleşme yoksa `Forbidden`. Boş UUID üretimde kimseyi admin yapmaz; bu tur o kapıyı gevşetmedi.

Üç masa aynı sayfadadır.

### 1.1 Olay masası (yalnız okuma)

Okuma `loadAdminOpsReadout` ve Faz 03’ün `loadLicenseGapSnapshot` fonksiyonudur. Bu yol `writeSuperAdminAudit` çağırmaz. Bakmak defteri değiştirmez.

| Satır | Kaynak | Yüzey |
|---|---|---|
| Canlı lisans sapması | `evaluateClearedLicenseGaps` — `ops:audit-license-gap` ile aynı okuma | CLEARED lisans sayısı, eksik, SUCCEEDED iade ile kapanmış |
| Kayıtlı alarm | `payment_anomalies.kind = license_gap` sayısı | Son 40 anomali, tür ve sipariş no |
| PENDING yaşı | `payment_orders.status = PENDING`, `PAYTR_PENDING_TIMEOUT_MS` (2 saat) | Toplam, tavan aşımı, en yaşlı saat |
| Hayalet hold | PENDING ve (`wallet_id` dolu veya `escrow-hold:` DEBIT) | Adet ve brüt tutar. Otomatik CREDIT yok |

Kimlik maskelenir (`1111…1111`). Ayrıntıdaki UUID ve e-posta da maskelenir. E-posta arama kutusu yoktur. Sapma okuması düşerse masa «okunamadı» der; sıfır uydurmaz.

### 1.2 Yönetimsel eylemler

Dördü de gerekçe ister (8–500). Onay katmanı vardır. Mühür yazılmazsa veritabanı işlemi geri alınır.

| Eylem | Yol | Denetim | Kilit |
|---|---|---|---|
| Katalog fiyatı | Mevcut `PATCH /api/admin/catalog` | Yeni eylem `catalog_price`. Karar defteri durur | Tutar bandı aynı. Mühürsüz zam kalmaz |
| Katalog yayını | Mevcut `PATCH /api/admin/catalog/publish` | `catalog_publish`. Bu tur mühür `false` dönerse yayın da geri alınır | Fiyat tutarı bu anahtarla değişmez |
| Lisans bağışı | `POST /api/admin/ops/grant` | `license_grant`. Hedef `kullanıcı:kurs` | Gövde `userId` + `slug` + gerekçe. E-posta alanı 400. Üretimde `isZeroFeeAcademyGrantOpen` kapalıdır; satır açılmaz. Ticari lisansın üstüne bağış yazılmaz. Nakit defteri yazılmaz. `sa_grant:` öneki aynı |
| Sertifika iptali | `POST /api/admin/ops/certificate-revoke` | `certificate_revoke`. Hedef 64 hex | Kamuya açık iptal yoktur. Hash yükü değişmez. Zaten iptalse ikinci mühür açılmaz |
| Sapma iadesi | `POST /api/admin/ops/license-gap-refund` | `manual_refund`. Ayrıntı `amountMinor=` ve sonuç | Gövde `merchantOid` + gerekçe. `amountMinor` / `amount` gelirse 400: «Serbest tutar yok». Sipariş o anki sapma listesinde değilse iade yok. Tutar sipariş kuruşuna eşit değilse iade yok |

İade motoru `refundLicenseGapExact`. Tutar parametresi yoktur; kuruş sapmadaki siparişten gelir. Bakiye siparişi karşılamıyorsa veya PayTR yapılandırılmamışsa PayTR çağrılmaz, `REQUESTED` satırı kalır, sonuç `warned` olur. Açık bir iade varken ikinci iade `409` döner.

### 1.3 Mühür

`super_admin_audit_logs` son 24 satırı maskeli gösterilir. Bakmak satır açmaz.

Eylem listesi kod ve SQL ile aynıdır: `catalog_publish`, `catalog_price`, `license_grant`, `manual_refund`, `certificate_revoke`, `room_flag`.

Yeni migrasyon: `prisma/migrations/20261104121000_super_admin_audit_certificate_and_price`. Eski CHECK’i düşürüp bu listeyi koyar. Append-only tetik durur. **Bu turda migrasyon canlı veritabanına uygulanmadı.** Kod önden giderse `catalog_price` ve `certificate_revoke` INSERT’i eski CHECK’te düşer ve işlem geri alınır. Sıra: doğrudan oturumda migrasyon, sonra bu kod.

PayTR çağrısı veritabanı işlemiyle aynı atomda değildir. Kart iadesi kabul edilip mühür veya defter geri alınırsa PSP tarafı geri sarılmaz. Bu sınır kasıtlı olarak aşağıda da yazılıdır.

Konsol `CRON_SECRET` taşımaz. İkinci rol tablosu yok. «Destek» rolü ve veli adına çocuk profili bu sürüme girmedi.

---

## 2. Büyüme ve SEO

Kamu rehberi `/rehber`. İlk ders (`/academy/01_office_ai/oyna`) çağrısı, dört adım ve üç SSS. Schema.org grafiği: `Article`, `FAQPage`, `BreadcrumbList`. Kanonik `https://yetkin.ai/rehber`. `robots: index, follow`.

| Yol | robots | sitemap |
|---|---|---|
| `/rehber` | Allow (statik liste) | `https://yetkin.ai/rehber` |
| `/admin`, `/admin/ops` | `Disallow: /admin` öneki | Yok. Sayfa ayrıca `noindex` |
| `/kariyer` | Disallow | Yok. Canlıda `307 /career` |
| `/api/` | Disallow | Yok |

`app/sitemap.ts` disallow yolunu site haritasına yazmaz. Yeni konsol bu süzgeçten geçer; ayrıca URL eklenmedi.

Yerel doğrulama (`localhost:3000`):

- `GET /rehber` → 200. Başlık «Ofiste yapay zekâ rehberi: Excel ve e-posta · yetkin.ai». H1, dört adım, SSS ve «Ücretsiz dersi aç» bağlantısı duruyor. JSON-LD var.
- `GET /robots.txt` → `Disallow: /admin`, `Allow: /rehber`, sitemap satırı.
- `GET /sitemap.xml` → `/rehber` var. `/admin` ve `/kariyer` yok.
- Oturumsuz `GET /admin/ops` → `307 /login`.
- Oturumsuz `POST /api/admin/ops/grant` → `401`.
- `GET /kariyer` → `307 /career`.

Oturum açmış ama süper yönetici olmayan bir hesapla konsol kartı tarayıcıda gezilmedi. Sayfa bu durumda `Forbidden` basar; API kenarı `auth = "admin"`.

---

## 3. Doğrulama

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | Temiz (şema tarihi düzeltmesinden sonra ikinci koşu da) |
| `npm run lint` | **0 error**, 9 warning. Uyarılar Faz 03’te de duran hook / `<img>` satırları. Bu turun dosyalarında yeni uyarı yok |
| `npx vitest run --maxWorkers=4` | **414 dosya / 2042 test**, hepsi geçti. Faz 03 411 / 2023 idi. İlk tam koşu testleri geçirip süreç sonunda `onTaskUpdate` zaman aşımıyla çıktı; ikinci koşu temiz |
| `verify:api-auth --check` | **81 rota**. `admin` 6 (katalog, yayın, huni, bağış, iptal, sapma iadesi). cron 2 |
| `verify:boundaries` | Yeşil |
| `verify:atomic-seals` | Yeşil |
| `verify:amount-minor` | Yeşil |
| `verify:no-secrets` | Yeşil |
| `verify:public-size` | Yeşil |
| `verify:academy-curriculum` | Yeşil |
| `verify:junior-content` | Yeşil (111 senaryo) |
| `verify:junior-sync` | Yeşil |
| `verify:junior-visual-ops` | Yeşil |
| `verify:academy-pedagogy-seals` | Yeşil |
| `verify:v1-contract-artifacts` | Yeşil |
| `verify:junior-pilot-seals` | Yeşil |
| `verify:junior-guardianship-seals` | Yeşil |
| `verify:paytr-reconciliation-seals` | Yeşil |
| `verify:junior-audio-manifest --check` | Yeşil (123 anahtar) |
| `verify:sen-axis` | Kırmızı, bu turun dosyası değil: `lib/copy/junior-guardian-notice.ts` içinde `hesabınız` |
| `verify:junior-speech` | Kırmızı, bu turun dosyası değil: yayın ders sayısı 123 bekliyor, sayım 111. İçerik mührü 111 ile yeşil |

Bu turda koşulmayanlar: `verify:pg-lab`, `verify:rls-status`, `verify:ai-gateway`, `verify:junior-audio-cdn`, `verify:citizen-cash-ring`, `verify:staging-t4-loop`, `verify:ci`, `verify:prebuild`, `verify:nightly`, `verify:idor-seals`, `verify:web-security-seals`. Bunlar laboratuvar Postgres, CDN veya ikinci bir vitest paketidir. Bu turun API haritası, sınır ve PayTR mutabakat mührü ayrıca yeşildir.

Commit yok.

---

## 4. Danışmanlık

### 4.1 Sen olsaydın ilk üç trafik hamlesi ne olurdu?

1. **Rehberi dizine sok, reklam açma.** Search Console’a `https://yetkin.ai/sitemap.xml` duruyorsa yeniden gönder. `/rehber` kapsamını izle. İlk ders zaten kayıt duvarının önünde. Yeni e-posta listesi kurma: bu turda onaylı bir toplama formu yok. Formu mühürsüz eklemek KVKK metnini bozar.

2. **Bir hafta mevcut huniyi oku.** Admin’deki huni ve GA4 kartı duruyor. Bakılacak yol: `/rehber` → ücretsiz ders → ödeme niyeti → SETTLED. Niyet gösterimdir, satın alma tekil kişidir. Bu ayrım bozulmadan, sayı sıfırdan büyük mü diye bak. Sıfırsa reklam değil, dersin açılışı bozuktur.

3. **İlk tahsilat laboratuvar tutarı olsun ve aynı gün konsola düşsün.** Faz 03’ün yedi gün sapma sıfırı bitmeden vitrin çoğaltma. İlk CLEARED sonrası `/admin/ops` eksik lisans 0 ve PENDING yaşı tavanın altında mı, ona bak. Değilse trafik değil, kanca bozuktur.

### 4.2 Konsol operasyonel riski yüzde yüz kapatıyor mu?

Hayır.

Yetkisiz erişim bu turda daha dar: oturumsuz konsol login’e döner, API `401`, süper yönetici değilse sayfa kilit, mühür yalnız `SUPER_ADMIN_USER_ID` ile yazılır, boş UUID üretimde kimseyi açmaz. İkinci rol yok. Kalan delik o tek oturumun çalınmasıdır. İkinci faktör ve ikinci operatör bu sürümde yok; Faz 03 ay 6’ya bırakmıştı. Onu bu turda açmak kurtarma kapısını gevşetirdi.

Sahte tutarlı iade bu konsoldan yazılamaz. Tutar istemez. Sipariş sapma listesinde ve kuruş birebir değilse PayTR çağrılmaz. Bakiye yetmezse başarı diye mühür basılmaz; `warned` basılır. Kalan delik PayTR ile defterin aynı atomda olmamasıdır. Kart onaylanıp satır geri alınırsa PSP’de iade durabilir, defterde durmayabilir. Operatör bunu konsoldaki `REQUESTED` / `FAILED` satırından görür. Serbest tutar kutusu eklenirse bu kilit düşer.

İnsan hatası kapanmadı. Gerekçe ve onay, yanlış 64 hex’i iptal etmekten alıkoymaz. Hash doğruysa sicil iptal olur ve mühür kalır. Bağış ticari lisansın üstüne yazılmaz ve üretimde hiç yazılmaz. Yanlış kullanıcı UUID’si laboratuvarda yine bağış açabilir. Maskeleme, o UUID’yi yazan operatörün kendisini kör etmez. Olay masasına bakmak ise hâlâ defteri değiştirmez.

Kısa hüküm: yetkisiz yazma ve serbest tutar kapalıdır. Tek oturum, yanlış sicil ve PSP-defter ayrımı açıktır. Yüzde yüz iddiası yanlış olurdu.

### 4.3 Faz 05 nereye baksın?

Yeni üyelik ürünü açma. Akademi lisansı ve Junior yıllık paket duruyor. Faz 05’in işi, rehberden ücretsiz derse ve oradan mevcut kasaya giden yolu ölçüp pürüzünü almaktır.

1. Search Console’da `/rehber` ve altı kurs antresi: dizine giren, yönlendirme diye işaretlenen, dışarıda kalan.
2. Hunide aynı yolun SETTLED’a varıp varmadığı. Varmıyorsa duvar, dersin ilk sahnesi veya fiyat satırıdır. Yeni plan değildir.
3. İlk gerçek CLEARED haftasında konsoldaki sapma, PENDING yaşı ve hayalet hold. Üçü de sıfır veya tavan altı değilse üyelik akışına kampanya ekleme.
4. Kayıt, ücretsiz dersin ardından gelsin. Dersin önüne ikinci bir form koyma.
5. Freelancer vitrini ve ikinci operatör bu fazın işi değildir. Biri Anayasa kapısını, diğeri tek UUID kurtarma kapısını bekler.

Beş ilke Faz 03’ten durur: tek tutar, bağlı olmayan kanalın sahte onayı, hız tavanının ikinci örnekte bellek olmaması, DDL’nin doğrudan oturumda kalması, operatör eyleminin append-only denetime yazılması. Bu tur beşinciye konsol yüzünü ekledi. İkinci bakiye eklemedi.
