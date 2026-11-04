# Faz 05 — Audit migrasyonu, indeks kontrolü ve huni ölçümü

**Tarih:** 4 Kasım 2026
**Girdi:** `docs/04_FAZ04_RAPORU.md`. Bekleyen iş, `prisma/migrations/20261104121000_super_admin_audit_certificate_and_price` migrasyonunun canlı veritabanına alınması ve rehberden ücretsiz derse, oradan mevcut kasaya giden yolun ölçülmesiydi.
**Kapsam:** Yalnız `npx prisma migrate deploy`. Tam `ops:migrate` çalıştırılmadı; o komut SQL mühürlerini ve katalog fiyat haritasını yeniden yazar. Katalog fiyatı değiştirilmedi. Sertifika iptal edilmedi. Canlı sipariş yazılmadı. Commit yok. Üretim dağıtımı yapılmadı.

---

## 0. Sonuç

| İş | Durum | Kanıt |
|---|---|---|
| Bekleyen denetim migrasyonu | Uygulandı | `_prisma_migrations` **47** tamam, yarım kalmış **0** |
| `catalog_price` ve `certificate_revoke` | CHECK kabul ediyor | İşlem içi iki INSERT göründü, `ROLLBACK` sonrası sonda **0** |
| Bilinmeyen eylem | CHECK reddediyor | `super_admin_audit_logs_action_known` |
| Append-only | Duruyor | UPDATE `super_admin_audit_logs is append-only` |
| Canlı denetim satırı | **0** | Prova dahil değil |
| Olay masası | Sapma 0, PENDING 0, hayalet hold 0 | `ops:audit-license-gap` ve aynı okuma |
| `/rehber` üretim | **404** | Kod üreteci hazır; dağıtılan site bu rotayı basmıyor |
| `checkout_intent` | Sayaçta satır yok | Ücretsiz ders gösterimi duruyor, niyet artmamış |

---

## 1. Bekleyen migrasyon

Uygulama öncesi `20261104121000_super_admin_audit_certificate_and_price` kaydı yoktu. Doğrudan `db.<ref>.supabase.co:5432` bu makinede IPv6 üzerinden açılmadı. `npx prisma migrate deploy`, Faz 02’deki gibi session havuz `:5432` üzerinden çalıştı. İşlem kipi `:6543` kullanılmadı. Diskteki ortam dosyası değiştirilmedi.

Prisma çıktısı:

```
47 migrations found in prisma/migrations
Applying migration `20261104121000_super_admin_audit_certificate_and_price`
All migrations have been successfully applied.
```

Migrasyon eski `super_admin_audit_logs_action_known` kısıtını düşürüp şu listeyi koyar: `catalog_publish`, `catalog_price`, `license_grant`, `manual_refund`, `certificate_revoke`, `room_flag`. Bu liste `SUPER_ADMIN_AUDIT_ACTIONS` ile aynıdır.

Uygulama sonrası canlı kısıt:

```
CHECK ((action = ANY (ARRAY[
  'catalog_publish', 'catalog_price', 'license_grant',
  'manual_refund', 'certificate_revoke', 'room_flag'
])))
```

| Ölçüm | Değer |
|---|---|
| Uygulanmış migrasyon | **47** |
| `finished_at` boş | **0** |
| Append-only tetik | `super_admin_audit_logs_append_only` duruyor |
| RLS | `ENABLE` + `FORCE` |
| Tablodaki satır | **0** |

---

## 2. Veritabanı provası

Faz 04’ün kırıldığı yer, fiyat ve iptal transaction’ının sonundaki denetim INSERT’idir. Eski CHECK bu iki eylemi reddeder, transaction geri alınır, API 500 görür.

`PATCH /api/admin/catalog` tutar yazısı `lib/kernel/admin/prisma-catalog-write.ts` içinde aynı transaction’da `action: "catalog_price"` yazar. Mühür dönmezse transaction düşer.
`POST /api/admin/ops/certificate-revoke` iptali `action: "certificate_revoke"` ile aynı transaction’da yazar. Mühür dönmezse transaction düşer.

Bu iki HTTP çağrısı bu turda yapılmadı. Biri katalog tutarını değiştirir, diğeri gerçek bir sicili iptal eder. Kanıt, o iki yolun paylaştığı ve daha önce düşüren INSERT’tir.

Tek transaction, sonra `ROLLBACK`:

- `catalog_price` ve `certificate_revoke` aynı anda insert edildi. Transaction içinde ikisi de göründü.
- Bilinmeyen eylem `not_an_action` kısıta takıldı. Savepoint geri alındı.
- `UPDATE` append-only tetiğine takıldı. Savepoint geri alındı.
- `ROLLBACK` sonrası `faz05probe-%` sayısı **0**. Canlı tablo **0** satır kaldı.

Bu, fiyat güncellemesi ve sertifika iptalinin denetim INSERT’i yüzünden 500 üretmeyeceği anlamına gelir. Gerekçe, tutar bandı, 64 hex ve «zaten iptal» kilitleri durur. Onlar 400 / 409 yoludur. Bu tur onları gevşetmedi.

---

## 3. İndeks ve `/rehber`

Statik `public/sitemap.xml` yoktur. Site haritası `app/sitemap.ts` ile `/sitemap.xml` olarak üretilir. `/admin` `isRobotsDisallowedPath` ile süzülür. `/rehber` `SITEMAP_STATIC_PATHS` içindedir.

Disk üreteci `/rehber` için:

| Alan | Değer |
|---|---|
| `changefreq` | `monthly` |
| `priority` | `0.8` |
| robots | `index, follow` (`app/(public)/rehber/page.tsx`) |
| Title | `Ofiste yapay zekâ rehberi: Excel ve e-posta · yetkin.ai` |
| Description | 134 karakter. İlk dersin ücretsiz olduğu ve kayıt duvarının olmadığı cümle duruyor |
| Kanonik | `https://yetkin.ai/rehber` |
| Schema.org | `@context: https://schema.org`. Grafik: `Article`, `FAQPage` (3 soru), `BreadcrumbList` |

H1 arama başlığından ayrıdır: «Ofiste yapay zekâyı Excel ve e-postada kullan». Dört adım ve «Ücretsiz dersi aç» bağlantısı `/academy/01_office_ai/oyna` adresine gider. Oynatıcı `noindex` ve `Disallow: /academy/*/oyna` altındadır. Dizine girecek kapı rehberdir, oynatıcı değil.

Üretim, 4 Kasım 2026 sabahı, bu kodu basmıyor.

| İstek | Üretim |
|---|---|
| `GET https://yetkin.ai/rehber` | **404**. Başlık kök şablon: `yetkin.ai`. Description `yetkin.ai dijital eğitim.` H1 «Sayfa bulunamadı». Rehber JSON-LD yok |
| `GET /robots.txt` | `Disallow: /admin` duruyor. `Allow: /rehber` satırı yok. `Allow: /` öneki rehberi ayrıca kapatmaz; sayfa 404 olduğu için tarama boşuna |
| `GET /sitemap.xml` | 7.493 bayt. `/rehber` yok. `/admin` yok. `/kariyer` yok. Ofis kursu `https://yetkin.ai/academy/01_office_ai` duruyor |

Kod doğru, dağıtım geride. Search Console’a bugünkü site haritasını yeniden göndermek `/rehber`’i dizine sokmaz. Önce bu rotanın 200 döndüğü bir dağıtım gerekir.

---

## 4. Huni ölçümü

İzlenen pazar zinciri dört addır. İlk üçü günlük gösterim sayacıdır (`funnel_daily_counters`). Dördüncüsü sayaç değildir; ticari satın almanın tekil kişisidir. `sa_grant:` bağışları bu kişiden çıkar. Payda 0 iken oran uydurulmaz (`buildFunnelStepMetrics`).

| Adım | Ne sayılır | Nerede yazılır |
|---|---|---|
| `vitrine_visit` | Katalog, kurs antresi, `/academy/ileri` belge gösterimi. Ön yükleme sayılmaz | `app/academy/page.tsx`, `app/academy/[slug]/page.tsx`, `app/academy/ileri/page.tsx` |
| `free_lesson` | Lisansı olmayan ücretsiz kapı oynatıcısı | `app/academy/[slug]/oyna/page.tsx` içinde `renderAcademyFreePreview` |
| `checkout_intent` | Kasa ekranı açılmadan, gerçekten açılabilir iFrame veya pasaport üretildiğinde | `app/api/(kernel)/wallet/top-up/route.ts` |
| `settled_purchase` | `academy_purchases.settled_at` dolu, bağış kilidi olmayan tekil kişi | `lib/kernel/admin/funnel-query.ts` |

`/rehber` sayfası bu sayaçların hiçbirini artırmaz. Rehberden gelen ile doğrudan oynatıcıya gelen aynı `free_lesson` kovasına düşer. Kişi, çerez ve kampanya yazılmaz. Gösterim, tekil ziyaretçi değildir.

`checkout_intent` süreç içinde aynı gün + yüzey + hedef için 30 dakika tekilleşir. Bu kova örnek başınadır. Kesin satır, gün ve adım çiftidir. Yüzey listesinde `junior-yearly` vardır. Canlı çağrı tek yerdedir ve `courseSlug` varsa `academy-license`, yoksa `wallet-top-up` yazar. Junior yıllık niyet bu çağrıda seçilmez.

Canlı sayaç, İstanbul günü, okuma anı 4 Kasım 2026:

| Adım | Tüm günler (14 gün, 21 Ekim – 4 Kasım) | Son 7 gün |
|---|---|---|
| `vitrine_visit` | 402 | 259 |
| `free_lesson` | 149 | 90 |
| `checkout_intent` | **0** | **0** |
| `settled_purchase` tekil kişi | 5 | **0** |

Ücretsiz ders / vitrin gösterim oranı yaklaşık %37 (tümü) ve %35 (7 gün). Bu oran kişi dönüşümü değildir. `checkout_intent` sıfır olduğu için ders → niyet oranı 0’dır. Niyet → satın alma oranı basılmaz; payda yoktur.

Satın alma tarafı ayrı okundu. Bağış satırı 9. Ticari, `settled_at` dolu satın alma satırı 6, tekil kişi 5. CLEARED lisans siparişi bunlardan ayrıdır ve olay masasında 2’dir. Huni satın alma satırını, masa lisans siparişini sayar. Bu tur o altı ticari kilidi siparişle eşleştirmeye çalışmadı. Kilit kimlikleri rapora yazılmadı.

Hüküm: ölçüm sapma uydurmuyor. Ölçtüğü yol da «/rehber → ücretsiz ders → ödeme niyeti» değil. Rehber görünmüyor. Niyet, açılabilir kasa üretildiğinde artıyor ve canlıda hiç artmamış.

---

## 5. Olay masası

Okuma `loadAdminOpsReadout` ile aynı sorgudur. `npm run ops:audit-license-gap` ayrıca çalıştı. İkisi de yazmaz. Konsol oturumu açılmadı. Kimlik ve e-posta yazılmadı.

`ops:audit-license-gap` çıktısı:

```
CLEARED lisans 2 · eksik 0 · iade ile kapanmış 0
ops:audit-license-gap OK — yazma yok.
```

| Satır | Değer |
|---|---|
| CLEARED lisans siparişi | 2 |
| Eksik lisans | **0** |
| SUCCEEDED iade ile kapanmış | **0** |
| `payment_anomalies.kind = license_gap` | **0** |
| Anomali türleri | boş |
| PENDING sipariş | **0** |
| Tavan aşımı (2 saat) | **0** |
| En yaşlı PENDING | 0 sa |
| Hayalet hold | **0** adet, brüt **0** kuruş |

İki CLEARED siparişin amacı ve tutarı:

| Amaç | Adet | Tutar |
|---|---|---|
| `academy-license:01_office_ai` | 1 | 89000 kuruş |
| `academy-license:03_social_media_ai` | 1 | 89000 kuruş |

İkisinin de koltuğu var. Bu tur yeni tahsilat açmadı. Son 7 günde ticari satın alma kişisi 0. İlk laboratuvar tutarı hâlâ önde.

---

## 6. Doğrulama

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | Temiz |
| `npm run lint` | **0 error**, 9 warning. Uyarılar Faz 04’te de duran hook / `<img>` satırları |
| `npx vitest run --maxWorkers=4` | **414 dosya / 2042 test**, hepsi geçti. Süre 217 sn |
| `verify:api-auth --check` | **81 rota**. `admin` 6. cron 2. session 47, public 11, closed 11, webhook 4 |
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
| `verify:junior-audio-manifest` | Yeşil (123 anahtar) |
| `verify:idor-seals` | Yeşil |
| `verify:web-security-seals` | Yeşil |
| `verify:rls-status` | Yeşil. `super_admin_audit_logs` FORCE RLS listesinde |
| `verify:citizen-cash-ring` | Yeşil. Bellek motoru; canlı satır yok |
| `verify:content-quality` | Çıkış 0. 111 senaryo. `--strict` değil |
| `verify:junior-audio-cdn` | Çıkış 0, **11 uyarı**. Dört çekirdek açılış 200. Altı seçmeli önizleme 404. Beş dosyada Content-Length sapması. İki kilitli matematik dersi kamu CDN’de 200 |
| `ops:audit-license-gap` | Yeşil. Eksik 0 |
| `verify:sen-axis` | Kırmızı. Bu turun dosyası değil: `lib/copy/junior-guardian-notice.ts` içinde `hesabınız` |
| `verify:junior-speech` | Kırmızı. Bu turun dosyası değil: yayın ders sayısı 123 bekliyor, sayım 111. İçerik mührü 111 ile yeşil |
| `verify:ai-gateway` | Kırmızı. Bu turun dosyası değil: `exam-pools-social.ts`, `spoken-scripts/index.ts`, `spoken-scripts/phonetics.ts` içinde `elevenlabs`; `lesson-visual-stage.ts` ve `proof-of-work.ts` içinde `VIDEO_GEN` |
| `verify:pg-lab` | Kırmızı. Yalnız loopback laboratuvar. `ops:migrate` `junior_profiles` duruyor diye düştü. Canlı şema bu komutun hedefi değildir |

Koşulmayan orkestratörler: `verify:ci`, `verify:prebuild`, `verify:nightly`, `verify:grep-seals`. Bunlar yukarıdaki yaprakları yeniden koşar. `nightly` ve `grep-seals` `verify:sen-axis` kırmızı olduğu için yeşil bitemez.

`verify:staging-t4-loop` koşulmadı. Kapalı saha turu canlı ilan ve teklif yazar. `verify:junior-audio-cdn-full` koşulmadı. Açılış CDN mührü ayrıca yeşil çıktı, uyarılarla.

Bu tur %100 yeşil değildir. Kırmızılar bu turun diff’inde değildir. Tip, lint hatası, test ve bu fazın API / sınır / PayTR / RLS mühürleri yeşildir.

`verify:content-quality` her koşuda `docs/ICERIK_KALITE_RAPORU.md` yazar. Bu tur o dosya oluştu. İstenen faz çıktısı bu rapordur.

---

## 7. Danışmanlık

### 7.1 Sen olsaydın ilk sıfır maliyetli hamle ne olurdu?

Dağıtımı çıkarırdım. Rehber metni, şeması ve site haritası satırı diskte duruyor. Üretim `https://yetkin.ai/rehber` için 404 basıyor. İlk 500 kişi bu adrese gelirse «Sayfa bulunamadı» görür. Yeni yazı, yeni form ve reklam bu 404’ü düzeltemez.

Dağıtımdan sonra tek iş Search Console’da `https://yetkin.ai/sitemap.xml` gönderip `/rehber` adresini denetlemektir. Ofis kurs antresi (`/academy/01_office_ai`) site haritasında zaten var. İlk organik trafik oraya da düşebilir. Rehber, o antreden önce duran ücretsiz kapının dizin adresidir.

E-posta listesi açmam. Onaylı bir toplama formu yok. Formu mühürsüz eklemek KVKK metnini bozar. Ücretsiz ders zaten 149 gösterim almış ve `checkout_intent` 0 kalmış. Beş yüz kişiyi, niyetin artıp artmadığı görülmeden reklama vermem.

### 7.2 Huni kurgusu güven ve dönüşüm üretecek seviyede mi?

Güven vaadi kurguda duruyor. Rehber ilk ders için kayıt istemiyor. Oynatıcı, lisansı olmayan kişiyi ücretsiz kapıda bırakıyor. Ödeme ayrı kasada. Sertifika satın alma ile basılmıyor. SSS bunu üç cümlede söylüyor. Oynatıcı dizine kapalı. Bu sıra, «bedava ders, sonra kasa» diye kurulmuş.

Dönüşüm ürettiği canlıda görünmüyor. Son 7 günde 90 ücretsiz ders gösterimine karşılık niyet 0, ticari satın alma kişisi 0. Rehberin kendisi sayaca yazılmıyor. Niyet, ancak açılabilir PayTR ekranı üretildiğinde artıyor. Sıfır, ya kimsenin o ekrana varmadığını ya da bu yazıcının dağıtılan sürümde olmadığını söyler. `/rehber` 404’ü ikinci ihtimali güçlendirir. Gösterim oranını kişi dönüşümü diye okumak da yanlış olur. Kod bu sahte yüzdeyi basmıyor. Basılacak gerçek oran için niyetin 0’dan çıkması gerekir.

Kısa hüküm: güven cümlesi hazır, dönüşüm kanıtı yok. Kampanya bu halde açılmaz.

### 7.3 Faz 06 — tam ölçekli kampanyadan önce hazır olma

İlk laboratuvar tutarı, yeni bir üyelik ürünü değildir. Mevcut Akademi lisansı, küçük tutarla, aynı gün konsolda izlenir. Aşağıdakiler birlikte tutulmadan reklam bütçesi açılmaz.

1. Üretim `GET /rehber` 200 döner. Title, 134 karakterlik description, `https://yetkin.ai/rehber` kanoniği, `index, follow` ve `Article` + `FAQPage` + `BreadcrumbList` grafiği yanıtta durur.
2. Üretim `/sitemap.xml` içinde `https://yetkin.ai/rehber` vardır (`monthly`, `0.8`). `/admin` ve `/kariyer` yoktur.
3. Aynı denemede `checkout_intent` en az 1 artar. Artmazsa kasa açılmadan sayaç yazılmıyordur. Trafik değil, ölçüm bozuktur.
4. Sipariş CLEARED olunca koltuk açılır. `ops:audit-license-gap` eksik **0** kalır. Olay masasında PENDING tavan aşımı **0**, hayalet hold **0** kalır. Üçünden biri doluysa kampanya yok, kanca vardır.
5. Bu tahsilatın tekil kişisi huni kartındaki `settled_purchase` ile aynı hikâyeyi anlatır. Bağış (`sa_grant:`) bu sayıya girmez.
6. Operatör o gün fiyat veya iptal yazdıysa `super_admin_audit_logs` satırı durur ve UPDATE hâlâ tetikte düşer. Bu faz o kapıyı açtı. İkinci faktör ve ikinci operatör hâlâ yoktur. Kampanya, o tek oturumun çalınması riskini büyütür. Onu kapatmadan bütçe büyütmek operasyon riskini de büyütür.
7. PayTR ile defter aynı atomda değildir. Kart onaylanıp satır geri alınırsa PSP’de tahsilat kalabilir. İlk laboratuvar günü masa ve PayTR paneli yan yana okunur. Uyuşmazlık varsa reklam yok.

Bu liste tutulunca kampanya, rehber URL’sine ve ofis kurs antresine açılabilir. Freelancer vitrini ve ikinci ürün bu hazırlığın parçası değildir.
