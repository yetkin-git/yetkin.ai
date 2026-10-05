# Yönetici paneli ve akademi katalog onarımı

Tarih: 5 Ekim 2026. Hesap: `yapinet360@gmail.com` (SUPER_ADMIN). Kod ve veritabanı betiğiyle yapıldı. `isSuperAdminActor` gevşetilmedi. Beş medya katmanı mühürü atlanmadı. Super Admin’in elle girdiği fiyat (`updated_by` dolu) ezilmedi.

## Kimlik

Üretim kapısı iki kilittir: `CANONICAL_SUPER_ADMIN_EMAIL` ve `SUPER_ADMIN_USER_ID` birlikte dolu olmalı, oturum e-postası kanonik adresle eşleşmeli, `email_confirmed_at` dolu olmalı. Vatandaş deneme hesabı yönetici olamaz. Prisma’da rol sütunu yoktur.

Bu ortamda `npm run ops:publish-vitrine-catalog` şunu yazdı (adres ve kullanıcı kimliği basılmadı):

- E-posta ortam değişkeni dolu ve kanonik varsayılanla aynı.
- Kullanıcı kimliği ortam değişkeni dolu.
- Üretim kapısı hazır.
- `auth.users` satırı var, e-posta onaylı, kimlik eşleşmesi var.

Kod tarafında `lib/kernel/auth/super-admin.ts` değiştirilmedi.

## `/admin` erişimi

Oturumsuz istek 404 değildir. Edge, `/admin` ve `/admin/catalog` için girişe 307 gönderir. 5 Ekim 2026 ölçümü:

| Adres | HTTP | `location` |
| --- | --- | --- |
| `https://yetkin.ai/admin` | 307 | `/login` |
| `https://yetkin.ai/admin/catalog` | 307 | `/login` |

`/admin` sayfası zaten `app/(kernel)/admin/page.tsx` içindedir. `/admin/catalog` sayfası yoktu; oturum doğrulandıktan sonra Next 404 veriyordu. Sayfa eklendi: `app/(kernel)/admin/catalog/page.tsx`. Kapı `/admin` ile aynıdır (`resolveSuperAdminAccess`). Sayfa `notFound()` çağırmaz.

Edge sığınağı `lib/kernel/security/edge-guard.ts` içinde adıyla durur: `/admin` ve `/admin/catalog`. İkisi de korumalı çekirdek yoludur. Müze 404’ü yalnız `/yetkin.ai` içindir.

Girişten sonra dönüş adresi bilerek `/admin` değildir (`isSafeAuthNextPath`). Oturum açılınca kapı profil menüsündedir.

Sol şerit çekirdek yüzey taşımaz; kabuk testi `/admin` bağlantısını orada yasaklar. Profil menüsü (`components/shell/user-hub.tsx`) `showAdmin` yalnız `isSuperAdminActor` doğruysa açılır. O menüde iki satır vardır:

- Admin (`/admin`, katalog idaresi)
- Fiyat kataloğu (`/admin/catalog`, yayın ve satış)

Aynı katalog bağlantısı yönetici sığınağı eylemlerindedir (`components/kernel/admin-shelter-actions.tsx`).

## Katalog yayını

Vitrin altı eğitim: Ofiste Yapay Zekâ, İleri Ofis, E-Ticaret, Sosyal Medya, Chatbot, Prompt. Satın Al üç şartın birden doğru olmasını ister: kurs `is_published`, aktif `PriceCatalogEntry`, beş katman satış mührü (`academyCourseSaleOpen`).

`npm run ops:publish-vitrine-catalog` bu ortamdaki veritabanında altı satırı yayına aldı. Aktif tutarlar (kuruş): ofis 89000, e-ticaret 99000, sosyal medya 89000, chatbot 129000, prompt 129000, ileri ofis 129000. Tutar değiştiyse karar defteri `ADMIN_MANUAL` ile platform kasasına yazılır. `updated_by` dolu tutar korunur.

Aynı hüküm SQL’dedir: `supabase/migrations/20261005190000_vitrine_catalog_publish.sql`. Dosya göç sırasının sonundadır. Daha eski steril kapanış ve tohum `NOT IN` bu dosyadan önce çalışır; tam `ops:migrate` vitrini kapalı bırakmaz. Mühür planı on altı SQL’dir.

## Canlı vitrin

Canlı `https://yetkin.ai/academy` (önbellek ıskası) fiyatı gösterir: ₺890 iki, ₺990 bir, ₺1.290 üç. «Yayında Değil» ve «Çok Yakında» yok. «Kayıt Kapalı / Fiyat Bekleniyor» on iki kez durur. Kart düğmesi hâlâ kapalıdır.

Fiyatın görünmesi, canlı uygulamanın bu fiyat satırlarını okuduğunu gösterir. Kapalı düğme üçüncü şarttır: satış mührü. Okuyucu `production-standard.ts` içinde modül değişkeniydi. Next aynı dosyayı birden fazla pakete kopyalayınca kayıt bir kopyada kalıyor, vitrin diğer kopyada okuyucusuz fail-closed kalıyordu.

Onarım: okuyucu `Symbol.for("yetkin.academy.productionDiskProbe")` ile süreçte tek yuvada durur. `ensureAcademyProductionDiskProbe` yuva boşsa gerçek okuyucuyu koyar, doluysa testin sahte okuyucusunu ezmez. Vitrin yükleyici, cüzdan kilidi ve PayTR lisans yolu bunu çağırır. Beş katman (metin, ses, ısınma videosu, görsel, müzik) durmadan satış açılmaz.

Bu düzeltme çalışan canlı sürece henüz dağılmadı. Dağıtımdan sonra kart «Satın Al» der. Dağıtım olmadan canlı düğme değişmez. Oturum açmış SUPER_ADMIN, satış kapalı kartta stüdyo önizlemesiyle `/oyna` açabilir; bu herkese satış değildir.

## Doğrulama

- `npm run verify:boundaries` — tamam.
- `npm run verify:atomic-seals` — tamam (101 yüzey testi).
- `npm run test:all` — 345 dosya, 1602 test geçti.

Yerel `next dev` bu turda ayakta değildi. Oturumsuz canlı ölçüm 307’dir. Oturum açmış tarayıcıda `/admin` ve `/admin/catalog` tahtası, kullanıcının kendi oturumuyla doğrulanır.

## Teslim

SUPER_ADMIN teslimi: kimlik kapısı hazır, `/admin/catalog` sayfası ve profil menüsü kodda, altı vitrin fiyatı bu veritabanında yayında. Canlı «Satın Al» düğmesi, disk okuyucusu düzeltmesinin dağıtımını bekler.
