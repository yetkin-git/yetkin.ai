# Tespit Raporu 03 — Admin panosu ve GA4 Data API

Tarih: 2026-10-31  
Kapsam: çalışma ağacındaki canlı ürün kodu. `/admin` hunisinin okuduğu Postgres tabloları, GA4 toplama etiketi ve Google Analytics Data API okuma yolu.  
Vercel ortam paneli açılmadı. GA4 mülk numarası, servis hesabı ve canlı HTML bu turda yeniden ölçülmedi.  
`archived/`, `node_modules/`, `public/media/`, `generated/` taranmadı.

## Yöntem

- Toplama etiketi: `components/kernel/ga4-bootstrap.tsx`, `components/kernel/ga4-route-page-view.tsx`, `lib/kernel/telemetry/measurement-id.ts`, `lib/kernel/telemetry/funnel.ts`, CSP: `lib/kernel/telemetry/csp.ts`. Örnek ortam: `.env.example` içindeki `NEXT_PUBLIC_GA_ID`.
- Bağımlılık: kök `package.json`. `@google/genai` Gemini içindir. `@google-analytics/data` ve `googleapis` yok.
- Pano: `app/(kernel)/admin/page.tsx`. Huni yükleyici `lib/kernel/admin/funnel-load.ts`, sorgu `lib/kernel/admin/funnel-query.ts`, sayaç `lib/kernel/admin/funnel-counter.ts`. Şema: `prisma/schema/kernel.prisma`, `academy.prisma`, `career.prisma`, `junior.prisma`.
- Kapı: `lib/kernel/auth/super-admin.ts` (`isSuperAdminActor`), sayfa `resolveSuperAdminAccess`, BFF `app/api/(kernel)/admin/funnel/route.ts` (`requireSuperAdmin`, `auth = "admin"`).
- Sır sızıntısı kapısı: `scripts/verify-no-secrets.ts` git’te `serviceAccount.json` ve `credentials.json` adlarını yasaklar.

## Özet

| Soru | Durum |
|---|---|
| GA4 Data API istemcisi var mı? | Yok. `runReport`, `BetaAnalyticsDataClient`, mülk numarası ve Analytics servis hesabı kodda yok. |
| GA4 toplama etiketi var mı? | Var. Tarayıcı `gtag`. Bu, panonun okuduğu veri değildir. |
| `/admin` hunisi nereden okur? | Postgres. Prisma `getPrisma()`. Harici analitik servisi yok. |
| Anlık ziyaretçi, kaynak, ülke panoda var mı? | Yok. Sayaç anonim gösterimdir. Kampanya, cihaz, coğrafya yazılmaz. |
| Panoya GA gömmek mi, Looker / GA konsolu mu? | İkisi de defterin yerine geçmez. İnce, sunucu tarafı kart sonra mantıklıdır. Keşif Looker ve GA4 konsolunda kalır. Looker iframe’i `/admin` içine gömülmez. |

---

## ADIM 1 — GA4 Data API altyapısı

İki ayrı Google yüzeyi vardır. Kodda yalnız birincisi durur.

| Yüzey | Ne işe yarar | Repoda |
|---|---|---|
| Ölçüm kimliği `G-…` + `gtag/js` | Tarayıcı olayı Google’a **yazar**. | Var. `Ga4Bootstrap`. Kimlik `NEXT_PUBLIC_GA_ID`. Boş, `GTM-` ve bozuk kimlik `null` döner; etiket basılmaz. |
| Data API (`analyticsdata.googleapis.com`) | Aynı mülkteki raporu sunucu **okur**. | Yok. |
| Measurement Protocol | Sunucudan olayı Google’a yazar. | Yok. |
| BigQuery dışa aktarımı | Ham GA satırını ambara döker. | Yok. |

`package.json` içinde Google paketi `@google/genai` tek satırdır. Analytics Data istemcisi değildir. Servis hesabı dosyası kaynakta yok; sızıntı taraması `serviceAccount.json` adını zaten reddeder. `.env.example` GA satırı yalnız `NEXT_PUBLIC_GA_ID=""`. Mülk numarası (Data API’nin istediği sayısal `properties/…` kimliği), `GOOGLE_APPLICATION_CREDENTIALS` ve Analytics JSON anahtarı tanımlı değil.

Ölçüm kimliği ile mülk numarası aynı şey değildir. `G-` etiketi açık olsa bile Data API kendiliğinden panoya düşmez. Okumak için ayrı bir Google Cloud projesi, açık Analytics Data API, mülke Viewer olarak eklenmiş servis hesabı ve sunucu ortamında sayısal mülk kimliği gerekir. Bunların hiçbiri kodda yok.

Etiket açıkken giden olaylar tarayıcıdadır: `page_view`, Akademi `view_item` / `play_free_preview` / `begin_checkout` / `paytr_iframe_loaded` / `purchase`, kayıt `sign_up`. Bu çağrılar Postgres’e yazmaz. Pano onları okumaz.

`ADMIN_SEN.funnel.intro` cümlesi dönüşümün GA4 ile ölçüldüğünü söyler. Ekrandaki sayılar bu cümleyi doğrulamaz. Sayılar aşağıdaki tablolardan gelir.

---

## ADIM 2 — Admin panosunun veri kaynağı

`/admin` bir RSC sayfasıdır. Süper yönetici kapısı açılınca iki yükleyici paralel çalışır: `loadAdminCatalogBoard` ve `loadAdminFunnelBoard`. İkisi de `server-only`. Aktör `isSuperAdminActor` değilse Prisma çağrılmaz. `DATABASE_URL` yoksa veya sorgu patlarsa tahta `unavailable` döner; sahte yüzde basılmaz.

Veritabanı PostgreSQL’dir. Erişim `lib/kernel/db.ts` içindeki `getPrisma()`: `pg` havuzu ve `@prisma/adapter-pg`. Ayrı bir analitik ambarı, Redis sayacı veya GA sorgusu yok.

Huni grafiği çubuk değil, sayı ızgarası ve kohort şerididir (`components/kernel/admin-funnel-board.tsx`). Pencere `today` / `7d` / `30d`, takvim `Europe/Istanbul`. Aynı anlık görüntü `GET /api/admin/funnel` ile de verilir. Sayfa bu HTTP yolunu çağırmaz; ikisi de `queryFunnelSnapshot` kullanır. API `requireSuperAdmin`, `auth = "admin"`, IP hız sınırı ve `Cache-Control: private, no-store` taşır.

### Pazar adımları — `funnel_daily_counters`

Model `FunnelDailyCounter`. Birincil anahtar `(day, step)`. Kişisel veri kolonu yok. Yazım `INSERT … ON CONFLICT DO UPDATE SET count = count + 1`. Hit başına satır açılmaz.

| Adım | Birim | Kim yazar | Ne zaman |
|---|---|---|---|
| `vitrine_visit` | gösterim | `recordFunnelDailyDocumentStep` | `/academy`, `/academy/ileri`, `/academy/[slug]` belge isteği |
| `free_lesson` | gösterim | aynı | `/academy/[slug]/oyna` |
| `checkout_intent` | gösterim | `recordCheckoutIntentStep` → sayaç | `POST /api/wallet/top-up` gerçekten iframe veya ödeme pasaportu üretince |
| `vize_hit` | gösterim | `recordPublicTalentCardHit` | Kamu `/vize/[id]` kartı bulununca |

Ön yükleme (`purpose` / `sec-purpose` prefetch, `next-router-prefetch`) vitrin ve ders sayacına yazılmaz. Başlık okunamazsa sayaç artmaz, sayfa düşmez. Bot ayıklanmaz; metin bunu açıkça söyler.

`checkout_intent` yüzeyi (`academy-license`, `wallet-top-up`, `junior-yearly`) veritabanına yazılmaz. Yüzey yalnız süreç içi 30 dakikalık tekilleştirme anahtarıdır. Çok örnekli dağıtımda kova örnek başınadır. Panoda Akademi kasası ile cüzdan yüklemesi aynı kovadadır.

`junior-yearly` yüzey adı tanımlıdır. Junior kasası (`app/api/junior-pilot/checkout/route.ts`, `lib/junior/`) bu sayacı çağırmaz. `junior_subscriptions` huni sorgusunda yoktur.

`settled_purchase` sayaç adımı değildir. Ticari `academy_purchases` tekil kişi sorgusunun kopyasıdır. Bakiyesi yeten alım PayTR niyetine yazılmaz; metin bunu da söyler.

### Kazanım adımları — iş tabloları

Hepsi `COUNT(DISTINCT …)`, pencere İstanbul günü. `sa_grant:` önekli bağış ticari satın alma ve sınavdan çıkar. `FREELANCER_RELEASE` damgası vize adımında yoktur (`source_kind = ACADEMY_CERTIFICATE`).

| Adım | Birim | Tablo | Süzgeç |
|---|---|---|---|
| `register` | tekil kişi | `users` | `created_at` pencerede |
| `wallet_cleared` | tekil kişi | `payment_orders` | `status = CLEARED`, `purpose = wallet-top-up`, `cleared_at` |
| `purchase_settled` / `settled_purchase` | tekil kişi | `academy_purchases` | `settled_at` dolu, bağış kiliti hariç |
| `exam_pass` | tekil kişi | `academy_exam_attempts` ⋈ `academy_purchases` | `passed = true`, bağış hariç, `submitted_at` |
| `visa_stamp` | tekil kişi | `career_visa_stamps` | `source_kind = ACADEMY_CERTIFICATE`, `issued_at` |
| `vize_hit` | gösterim | `funnel_daily_counters` | `step = vize_hit` toplamı |

Kohort ve kaçak aynı sorgunun ikinci parçasıdır, ayrı servis değildir.

- Kohort: pencerede doğan `users` satırı ve o kişinin ilk `payment_orders` CLEARED valörü (`purpose = wallet-top-up`). Kovalar aynı gün, 1–3, 4–7, 8–30, 30 gün sonrası, hâlâ açık. Medyan saat yalnız dönüşenler.
- Kaçak: pencerede açılan cüzdan emirleri. `PENDING` iki saatten eskiyse bayat (`PAYTR_PENDING_TIMEOUT_MS`). `PAID` nakit `amount_minor` toplamıdır. `CLEARED` olmayan `PAID` kasa kaçağıdır.

### Huni dışında kalan pano parçaları

| Parça | Kaynak |
|---|---|
| Katalog ızgarası | `price_catalog_entries` |
| Fiyat karar defteri (son 24) | `price_catalog_decision_ledger` |
| Kurs ilan anahtarı | `academy_courses` (`slug`, `catalog_unit_key`, `is_published`) |
| Denetim odaları | Veri yok. Müfredat, Akademi sığınağı ve panel linkleri. |
| Üst üç istatistik | Katalog satır sayısı, modül sayısı, hold bandı etiketi. Trafik değil. |

Bu tabloların hiçbiri oturum, kaynak, kampanya, cihaz, ülke veya anlık aktif kullanıcı tutmaz.

---

## ADIM 3 — GA4’ü panoya almak için mimari

Amaç, defteri Google ile değiştirmek değildir. Defter “satış oldu mu”yu bilir. GA “kim nereden geldi, şu an kaç oturum var”ı bilir. İkisi yan yana durur. Satış kararı `academy_purchases` ve `payment_orders` üzerinden verilir.

### Önkoşul

Data API, etiketten önce boş mülk okur. Toplama kimliği üretimde geçerli bir `G-` olmalı ve kök HTML’de `gtag/js` görünmelidir. Kimlik istemciye gömülür; sunucu raporu onu kullanmaz. Rapor sayısal mülk kimliği ister.

### Kimlik ve sır

| Parça | Nereye | Nereye değil |
|---|---|---|
| Sayısal GA4 mülk kimliği | Sunucu ortamı. Örnek ad: `GA4_PROPERTY_ID`. Biçim rakam. | `NEXT_PUBLIC_`. Repoya dolu değer. |
| Servis hesabı JSON | Sunucu ortamında tek satır metin. Çalışma anında parse. Dosya diske yazılmaz. | Git, `serviceAccount.json`, istemci paketi. `verify-no-secrets` bu dosya adını zaten keser. |
| Ölçüm kimliği `G-` | Mevcut `NEXT_PUBLIC_GA_ID`. Toplama. | Data API kimliği sanılmaz. |

Google Cloud’da Analytics Data API açıktır. Servis hesabının e-postası GA4 mülkünde salt okunur (Viewer) olur. Düzenleme, silme ve kullanıcı listesi verilmez. Anahtar döndürülebilir olsun diye repoda durmaz. Vercel üretim ortamı yeter. Preview ve geliştirme boş kalabilir; boşken kart `unavailable` döner, sıfır uydurmaz.

### Okuma yolu

Tarayıcı `analyticsdata.googleapis.com` çağırmaz. CSP’ye bu köken eklenmez. Akış:

1. `lib/kernel/telemetry/` altında `server-only` bir okuyucu. `@google-analytics/data` yalnız burada import edilir. İstemci bileşeni bu modülü çekemez.
2. İki metot, iki vaat:
   - `runRealtimeReport`: son yaklaşık 30 dakika, `activeUsers`. “Anlık ziyaretçi” budur. Canlı soket değildir. Boyut kümesi standart rapordan dardır.
   - `runReport`: oturum, `sessionDefaultChannelGroup` / `sessionSource`, `country`. Tarih aralığı huni ile aynı üç pencere olabilir (`today`, `7d`, `30d`). Standart rapor saatler gecikir. “Anlık” diye basılmaz.
3. Tek istekte boyut ve metrik az tutulur. Kota mülk başınadır. `/admin` her çizimde beş rapor açmaz.
4. Önbellek süreç içi ve kısa (birkaç dakika). Sunucusuz her izolat kendi kovasına sahiptir; bu, kotayı sıfırlamaz ama aynı izolatta tekrar vuruşu keser. Postgres’e GA satırı yazılmaz. Sözde kullanıcı kimliği (`client_id`, `user_id`) seçilmez ve saklanmaz.
5. Kapı mevcut mühürdür: sayfa `resolveSuperAdminAccess`, HTTP varsa `requireSuperAdmin` + `auth = "admin"` + mevcut admin IP hız sınırı + `private, no-store`. E-posta yerleşik kutu `yapinet360@gmail.com` ve üretimde `SUPER_ADMIN_USER_ID` eşleşmesi. Yeni bir “analytics admin” rolü açılmaz.
6. Hata: API kapalı, kota, yanlış mülk veya boş kimlik → huni kartının kullandığı dil. “Şu an okunamadı.” Sıfır, ancak rapor gerçekten sıfır dönerse ve erişim `ok` ise basılır.
7. Kart huninin altında ayrı bir bloktur. Gösterim ile oturum, SETTLED ile GA `purchase` aynı ızgaraya konmaz. Birimlerin karışması huniyi yalanlar.

İstenen üç kart bu kadardır:

| Kart | API | Metrik | Panoda olmayan karşılığı |
|---|---|---|---|
| Şu an | Realtime | `activeUsers` | Yok |
| Kaynak | `runReport` | oturum × kanal veya kaynak | Yok. UTM sayaca yazılmıyor. |
| Ülke | `runReport` | oturum × `country` | Yok |

Sayfa yolu, cihaz ve açılış sayfası ikinci turdur. Huni grafiğinin yerine GA hunisi çizilmez.

### Bilinçli olarak yapılmayanlar

- Looker Studio iframe’i `/admin` içine koymak. Looker’ın kilidi Google hesabıdır, `isSuperAdminActor` değildir. Herkese açık embed trafik sayısını sızdırır. Google oturumlu embed ürün oturumundan bağımsızdır ve çocuk yüzeyinin yanına üçüncü parti çerçeve ekler.
- GA satırını `funnel_daily_counters` ile birleştirmek. Biri gösterim, öteki oturum. Toplamları birbirine bölmek sahte dönüşümdür.
- Ham dışa aktarmayı BigQuery’ye bağlayıp panoda SQL koşturmak. Tek süper yönetici için ambardır. Şimdi gerekmez.
- Junior profili ile GA `user_id` eşlemek. Çocuk satırı (`junior_profiles`) reklam kimliği taşımaz. Eşleme açılmaz.

KVKK metni GA4’ü birinci taraf ölçüm diye anlatıyorsa, panodaki kart yeni bir piksel değildir. Aynı mülkün sunucu okumasıdır. Yeni çerez basılmaz. Çocuk profiline oturum kaydı eklenmez.

---

## ADIM 4 — Tavsiye ve master plan

### Ne mantıklı

Günlük iş iki yerde kalır.

**Satış, sınav, vize, kaçak:** bugünkü `/admin` hunisi. Postgres. Reklam engeli ve çerez reddi bunu bozmaz. GA `purchase` tarayıcı kapanırsa düşer. Defter düşmez. Kampanya kararı sapmada deftere göre verilir.

**Kaynak, ülke, anlık oturum, sayfa yolu, cihaz, keşif:** GA4 konsolu ve aynı Google kullanıcısına bağlı Looker Studio. Ücretsizdir, boyut sınırı ürün panosundan geniştir, bakımı Google’dadır. Süper yöneticinin postası zaten tek kişiliktir. Ayrı sekme, ürünün yetki modelini delmez.

**Ürün panosuna gömülecek parça incedir** ve etiket gerçekten veri yazdıktan sonra gelir: anlık aktif kullanıcı, 7/30 gün kanal, 7/30 gün ülke. Üç kart. Huninin yerine geçmez. Looker iframe’i değildir.

Bugün gömmek erken olur. Okuma istemcisi yok, mülk kimliği yok, servis hesabı yok. Etiket kapalıyken API sıfır döner ve pano “ölçüm yok” ile “trafik yok”u ayırt edemez.

### Üç aylık sıra

**Ay 1 — Toplama dürüst, okuma yok**

- Üretim `NEXT_PUBLIC_GA_ID` geçerli `G-`. Deploy sonrası HTML’de `gtag/js`, CSP’de `google-analytics.com`.
- GA4 arayüzünde 48 saat oturum, `page_view` ve `purchase` görünsün. Görünmeden Data API kartı yazılmaz.
- Huni metnindeki “GA4 ile ölçülür” cümlesi, sayılar Postgres’ten geldiği sürece daraltılır. GA ayrı cümledir.
- Looker Studio’da tek rapor: oturum, kanal, ülke, açılış sayfası. Erişim Google hesabına kilitli. Embed yok. Yer imi yeter.

**Ay 2 — İnce okuma, süper yönetici**

- Cloud: Analytics Data API, servis hesabı, mülkte Viewer, sayısal mülk kimliği sunucu ortamında.
- `server-only` okuyucu, üç kart, kısa önbellek, fail-closed. Yeni tablo yok.
- Haftalık tek karşılaştırma: GA `purchase` olayı ile `academy_purchases` SETTLED tekil kişi. Ayrışırsa kampanya GA’ya göre kesilmez.

**Ay 3 — Kart yetmezse konsol, kod şişmez**

- Sayfa yolu, cihaz, kampanya ayrıntısı GA4 Explorations veya Looker’da kalır. Ürüne ikinci bir rapor motoru eklenmez.
- Junior trafiği etiket kökte olduğu için GA’da görünür. Ayrı bir çocuk kimliği bağlanmaz. `junior_subscriptions` huniye ancak ürün sorusu “paket ACTIVE oldu mu” ise, GA’dan bağımsız bir defter adımı olarak eklenir. Bu rapor onu tasarlamaz. Bugün o adım panoda yoktur.

---

## Sonuç

`/admin` hunisi Google’dan okumaz. PostgreSQL’de `funnel_daily_counters`, `users`, `payment_orders`, `academy_purchases`, `academy_exam_attempts` ve `career_visa_stamps` okur. Katalog ayrı üç tablodur. Anlık ziyaretçi, trafik kaynağı ve ülke bu şemada yoktur.

GA4 Data API ve servis hesabı bağlı değildir. Repoda olan, tarayıcıya `gtag` basan ölçüm kimliği kapısıdır. O kapı panoyu doldurmaz.

Doğru kurgu: defter panoda kalsın, keşif GA4 konsolu ve Looker’da kalsın, etiket veri yazdıktan sonra panoya yalnız üç salt okunur kart gelsin. Looker çerçevesi süper yönetici sığınağına gömülmez.
