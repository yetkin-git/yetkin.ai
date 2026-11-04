# Tespit Raporu 01 — Canlı yetki, hijyen, mimari

Tarih: 2026-10-31  
Kapsam: yetkin.ai çalışma ağacı + bu makinedeki `DIRECT_URL` ile açılan barındırılan Postgres.  
Vercel Production ortam değişkenleri bu turda okunmadı. Aşağıdaki bayraklar çalışma alanı dosyasının değeridir. Canlı süreç aynı dosyayı kullanmıyorsa bayraklar sapabilir. Satır olguları bu bağlantının gördüğü veritabanındandır.

Kimlik, fatura, kart numarası ve bağlantı dizgisi bu dosyaya yazılmadı. `archived/`, `node_modules/`, `public/media/` taranmadı.

## Yöntem

- Yetki kararı `lib/kernel/auth/super-admin.ts`, kenar `proxy.ts`, API haritası `lib/kernel/security/route-auth-map.ts` (77 rota, 77 `app/api/**/route.ts` ile örtüşür).
- Veritabanı: çalışma alanı `DIRECT_URL`, host türü Supabase pooler, port 5432. `public.users` ve `auth.users` okundu. Yazma yapılmadı.
- Kullanılmayan import grafiği (knip / ts-prune) çalıştırılmadı. Hijyen bölümü görülen artık ve çift yazarlık yüzeyidir.

## Ortam bayrakları (çalışma alanı dosyası)

| Anahtar | Gözlem |
|---|---|
| `NODE_ENV` | `development` |
| `SUPER_ADMIN_USER_ID` | Dolu, UUID biçiminde. `yapinet360@gmail.com` satırının `id` değeri ile birebir aynı. |
| `CANONICAL_SUPER_ADMIN_EMAIL` | `yapinet360@gmail.com` |
| `JUNIOR_BETA_ALLOWLIST` | İki adres de listede yok. |
| `JUNIOR_CHECKOUT_OPEN` | `1` (kasa açık) |
| `DRON_JUNIOR_OPEN` | Boş. Profil masası bu bayrakla zorlanmaz. |
| `DRON_JUNIOR_ROOM_OPEN` | Boş. Kayıt satırı `kapali: false` olduğu için `/junior` oda bayrağı açık kalır. |
| `DRON_YOUNG_OPEN` | Boş. Kayıt `kapali: true` → `/young` kapalı. |
| `DRON_FREELANCER_OPEN` | Boş. Ayrıca kod sabiti `FREELANCER_PUBLIC_SURFACE_LOCKED = true`. |
| `CRON_SECRET` | Bu dosyada boş. |

Üretim kod yolu (`NODE_ENV === "production"`) süper yöneticiyi şöyle açar: yerleşik kutu `yapinet360@gmail.com` ve `SUPER_ADMIN_USER_ID` oturum UUID’si ile aynı olmalıdır. E-posta `auth.users` içinde doğrulanmıştır. Vercel’de aynı UUID duruyorsa üretim kapısı da açılır. Bu eşleşme Vercel panelinden doğrulanmadı; çalışma alanı dosyası ile veritabanı satırı örtüşür.

---

## ADIM 1 — Yetki matrisi

### Model

`public.users` kolonları: `id`, `email`, `display_name`, `locale`, `time_zone`, `created_at`, `updated_at`. Rol kolonu yoktur.

`auth.users` içinde her iki hesap için `raw_app_meta_data.role` ve `raw_user_meta_data.role` boştur. Ban yoktur. E-posta doğrulanmıştır.

Süper yönetici tek fonksiyonla okunur: `isSuperAdminActor` (`lib/kernel/auth/super-admin.ts`). Kenar admin API, `/admin` sayfa verisi, akademi içerik muafiyeti ve Junior denetim aktörü bu fonksiyonu çağırır. Ayrı bir RBAC tablosu yoktur.

Örneklenen tablolarda (`users`, `junior_profiles`, `junior_subscriptions`, `payment_orders`, `ledger_entries`, `wallets`) RLS ve FORCE RLS açıktır. `users`, `junior_profiles`, `junior_subscriptions` için görülen politika yalnız `authenticated` rolüne `SELECT` ve sahip kolonudur. Uygulama Prisma bağlantısı tablo sahibidir; FORCE RLS bu rolü durdurmaz. Sunucu tarafı sınır, sorguya oturum `userId` yazılmasıdır.

### 1.1 `yapinet360@gmail.com`

| Katman | Durum |
|---|---|
| `public.users` | Var. `locale = tr-TR`. Oluşturma `2026-09-26T05:15:30.816Z`. |
| `auth.users` | Doğrulanmış. Uygulama rolü yok. |
| Süper yönetici bağı | Çalışma alanı UUID’si bu satırla aynı. Üretim kuralı bu çifti açar. |
| Junior profil | 1 profil. `grade = 6`, seçili, doğum yılı dolu, `grade_switch_rights = 1`, seçmeli ders 0, `active_consent_id` boş. |
| Veli rızası | `junior_guardian_consents` satırı yok. |
| Junior abonelik | Yok. |
| Junior ilerleme | 0 satır. |
| Akademi satın alma | 3 satır, hepsi `SETTLED`, tutar 0, kilit öneki `sa_grant:`. |
| `payment_orders` | 0. |
| Cüzdan | TRY, bakiye 0. |

Bu hesap platformun bütün modüllerine sınırsız sahip değildir. Açılan ve kapanan yüzeyler:

**Açılan**

- Admin API (haritada `admin`, 3 rota): `GET/PATCH` katalog (`/api/admin/catalog`), yayın (`/api/admin/catalog/publish`), huni (`/api/admin/funnel`). Sayfalar `/admin`, `/admin/catalog`, `/admin/curriculum-revisions` veriyi `resolveSuperAdminAccess` ile ister.
- Katalog yazımı bant içi fiyat ve yayın kararıdır (`lib/kernel/admin/catalog-write.ts`). Defter satırı bu kapıdan eklenmez. `ledger_entries` append-only şemadadır.
- Akademi ders gövdesi `resolveAcademyEntitlement` içinde `admin-bypass` ile satın alma satırı aranmadan açılır. Oynatıcı `hasAcademyOynaAccess` üretimde de bu muafiyeti kullanır.
- Junior sayfa kapısı denetim aktörünü kabul eder. `juniorLessonGate` denetimde `renderPlan`ı bütün `JUNIOR_ELECTIVE_SLUGS` seçilmiş gibi kurar. Kilitli çekirdek ve mühürlü seçmeli ders sayfası abonelik olmadan açılır.
- Kasa niyeti: `JUNIOR_CHECKOUT_OPEN=1` iken denetim aktörü checkout kapısından geçer. Bu hesabın Junior ödeme satırı yoktur.

**Kapanan veya dar olan**

- Yeni sıfır harçlı kalıcı akademi bağışı üretimde kapalıdır (`isZeroFeeAcademyGrantOpen` yalnız `NODE_ENV !== "production"`). Bu hesapta duran 3 bağış eski `sa_grant:` satırıdır. Ticari kayıt sayılmaz (`isAcademyGrantPurchase`).
- Sınav satın alma kontrolü, mevcut `SETTLED` satırda yönetici muafiyeti ile o satırı döndürür. Müfredat tamamlama (`assertAcademyCurriculumComplete`) ve baraj durur. Bağış satırı olmayan kursta `resolveSettledAcademyPurchase` bellek içi bağış nesnesi üretebilir; `academy_exam_attempts.purchase_id` gerçek `academy_purchases` satırına FK’dir. Yazılmamış nesne ile deneme satırı oluşmaz.
- `hasUnlimitedAcademyAccess` üretimde daima kapalıdır. Sınav ve sertifika bu fonksiyonla atlanmaz.
- Junior ders yazma kapısı (`gateLesson`, dinleme ilerlemesi) rıza sürümünü denetimden önce okur. Yürürlükteki metin `junior-notice-2026-10-09`. Bu profilde aktif rıza yoktur. İlerleme, anlatış ve konu testi bu profilde `JUNIOR_CONSENT_REQUIRED_ERROR` ile kapanır. Sayfa görüntüleme bu kontrolden geçmez.
- Ders metni panelden yazılmaz. Metin kod ve `packages/junior-content` ağacındadır.
- Freelancer kamu yüzeyi kod sabitiyle 410. Young oda bayrağı kapalı. Donmuş disk odaları (`studio`, `devlabs`, `kurumsal`, `hibe`, `arena`, `pazaryeri`, `social`) kenarda 410. `/admin/curriculum-revisions` sayfası yöneticiye açıktır; API her yöntemde 410 döner.
- Kenar `/admin` için oturum ister, süper yöneticiyi kenarda ayırmaz. Veri yükü sayfada `access.kind === "ok"` iken çalışır. Oturumlu başka hesap katalog satırını almaz; kabuk `Forbidden` görür.

### 1.2 `ustaders.proje@gmail.com` (Junior, 6. sınıf)

Bu adres bir “Junior rolü” değildir. Veli vatandaş hesabıdır. Çocuk ayrı e-posta ve ayrı oturum almaz.

| Katman | Durum |
|---|---|
| `public.users` | Var. Oluşturma `2026-10-05T16:05:17.484Z`. |
| `auth.users` | Doğrulanmış. Rol anahtarı yok. |
| Süper yönetici | UUID çalışma alanı `SUPER_ADMIN_USER_ID` ile aynı değil. E-posta yerleşik kutu değil. `isSuperAdminActor` kapalı. |
| Beta listesi | Yok. Denetim aktörü değil. |
| Junior profil | 1 profil. `grade = 6`, seçili, doğum yılı dolu, seçmeli 0, hak 1, aktif rıza var. |
| Rıza | 1 canlı, profile bağlı satır. |
| Abonelik | `ACTIVE`, `plan_code = junior-yearly`, sağlayıcı `paytr`, `elective_quota = 3`, hak 1, `activated_at` dolu, `expires_at = 2027-10-14T08:14:11.567Z`. `card_last4` yer tutucu `0000` (şema: iFrame son dört haneyi vermezse kolon böyle kalır). |
| Ödeme | `payment_orders`: 2 satır, ikisi `CLEARED`. |
| Akademi | 2 `SETTLED` satın alma. Tutar sıfır değil. `sa_grant:` değil. |
| İlerleme | `junior_progress` 0 satır. |
| Cüzdan | TRY, bakiye 0. |

**Seviye ve içerik**

- Uygulama profil oluşturma ve sınıf değiştirmede `grade === 6` (`JUNIOR_PILOT_GRADE`) dışında 403 verir (`JUNIOR_PILOT_SHELF_LINE`).
- `juniorShelvesForGrade` sınıf argümanını yok sayar ve 6. sınıf rafını basar. Başka sınıfın ders metni yoktur. Young odası kapalıdır.
- Veritabanı çekirdeği daha geniştir: `junior_profiles_shape` hâlâ `grade >= 5 AND grade <= 12`. Doğrudan SQL ile 7 yazılırsa API oluşturma bunu reddeder; raf yine 6. sınıf kalır. İçerik yükselmesi bu yolla oluşmaz. Kısıt ile kod aynı çizgide değildir.
- Yıllık paket çekirdek mühürlü dersi açar (`juniorPlanCoversLesson`, `track === "core"`). Seçmeli ders ancak `selected_electives` içindeyse açılır. Bu profilde seçmeli dizi boştur. Kota 3 hak olarak durur, harcanmamıştır.
- Herkese açık açılışlar paket istemez: çekirdek kartların ilk dersi (İngilizce kartında `jr_06_ing_main-20`), mühürlü seçmelilerin `JUNIOR_ELECTIVE_PUBLIC_OPENERS` listesi. Misafir deneme anahtarları `jr_06_mat-1`, `jr_06_mat-2`, `jr_06_mat-3`.
- Başka velinin profili `getProfile(userId, profileId)` ile 404 olur. Sorgu oturum kimliğini kullanır.

**Bu hesabın açabildiği, “yalnız 6. sınıf” olmayan yüzeyler**

Oturum türü `session` olan 48 rota bu hesap için de geçerlidir. Gözlenen ticari iz:

- İki harçlı akademi lisansı (`SETTLED`). Yetişkin Akademi duvarı bu satırlarla açılır. Bu bir yetki aşımı değil, aynı vatandaş hesabının ikinci ürünüdür.
- Cüzdan, profil, fatura, hesap kapatma, kariyer portföyü ve `/api/ai/chat` oturum kapısındadır. Bakiye bugün 0’dır.
- Admin API 403. Freelancer ve Young 410.

**Yetki aşımı**

Yöneticiye yükselme, bu kodda e-posta ve UUID çiftini ortam değişkenine yazmakla olur. Hesabın kendi isteği `isSuperAdminActor`ı açmaz. `yetkin.vision@gmail.com` vatandaş test adresidir ve env’e yazılsa da yönetici olamaz. `ustaders.proje@gmail.com` bu istisnanın içinde değildir; sıradan adres olarak üretimde iki env birden eşleşmeden yönetici olmaz.

Paket duvarını delen kod yolu ayrıdır ve bu hesaba özel değildir:

- `/api/junior/live-tutor` haritada `public`. `answerJuniorLiveTutor` ders anahtarının senaryo / kitapçık / zaman çizelgesini yükler. `canEnterJunior` ve `juniorLessonAccess` çağrılmaz. Oturum varsa model cevabı üretilir. Oturum yoksa yerel cevap sahne başlığını kullanır. Anlatış ve konu testi kolları `isJuniorPilotTrialLesson` ile `jr_06_mat-1..3` dışını 403 keser. Koç kolu bu listeyi okumaz. Seçilmemiş seçmeli dersin koç bağlamı diskte varsa, yıllık paketin seçmeli kotası bu rotada uygulanmaz.
- Kenar `/admin` süper yöneticiyi ayırmaz. Veri yine `resolveSuperAdminAccess` ardındadır.

Profil masası bu hesapta abonelik ile açılır (`planCovers`). `DRON_JUNIOR_OPEN` boş olduğu için paketsiz veli profil masasına yazamaz. Bu hesabın paketi aktiftir.

### 1.3 API haritası (77 rota)

| `export const auth` | Adet | Kenar |
|---|---|---|
| `session` | 48 | Doğrulanmış JWT yoksa 401. |
| `public` | 22 | Kenar oturum istemez. |
| `webhook` | 4 | İmza handler’da. |
| `admin` | 3 | JWT + `isSuperAdminActor`, aksi 403. |
| `cron` / `hybrid` / `internal` | 0 | Tür listede durur, haritada satır yoktur. |

`public` olup gövdesi 410 olanlar (okunan handler): akademi `listen`, `pdf`, `discussion`, `reviews`, `generateSpeech`; admin `curriculum-revisions`; freelancer `direct-offers`. `/api/freelancer/*` ve `/api/client/jobs/*` ayrıca `FREELANCER_PUBLIC_SURFACE_LOCKED` ile kenarda 410 olur. Haritadaki `public` bu rotaları oturuma açmaz.

Gerçek kamu işi yapan `public` örnekleri: `GET /api/junior/lessons/[key]` (kart; kilitli derste medya adresi yok, anlatış metni yok), `/api/junior/live-tutor` (yukarıdaki koç boşluğu), `/api/academy/lesson-assistant` (oturumsuz yalnız ücretsiz önizleme), `/api/cron/paytr-reconcile` (kenar açık; handler `Authorization: Bearer ${CRON_SECRET}` ister, sır boşsa 503).

PayTR bildirim iki URL’dir. `/api/paytr/callback` kanonik handler’ı yeniden ihraç eder; ikinci CREDIT ağzı değildir. Kenar bu iki yolu JWT ve Origin kapısından geçirir. HMAC handler’dadır. Bu veritabanında `ustaders.proje@gmail.com` için iki `CLEARED` sipariş ve aktif Junior lisans vardır.

---

## ADIM 2 — Hijyen ve tek kaynak

Tam ölü kod taraması yok. Görülen artık ve çift yüzey:

**Artık / operatör kalıntısı**

- `media-bake/` altında 8 `.log`. Dizin `.gitignore` içindedir (`/media-bake/`). Ürün derlemesine girmez.
- `docs/` içinde iki görüntü dosyası durur: `WhatsApp Image 2026-10-31 at 00.47.08.jpeg`, `Ekran görüntüsü 2026-10-31 005225.png`.
- `lib/young/micro-lesson.ts` tek dosyadır. Young odası kapalıyken oynatıcı monte edilmez; dosya Junior mikro-ders sözleşmesini yeniden ihraç eder.
- `archived/` müze ağacıdır. Bu raporda davranış kaynağı olarak okunmadı.
- Kök `middleware.ts` yoktur. Tek kenar `proxy.ts`.

**Tek kaynak olmayan yerler**

| Konu | Evler | Etki |
|---|---|---|
| Süper yönetici | Tek fonksiyon `isSuperAdminActor`. Veritabanında rol yok. | Kaynak dağınık değil. Yetki bir ortam UUID’sine bağlı. |
| API yetkisi | Her `route.ts` içinde `export const auth` ve üretilen `route-auth-map.ts`. `verify:api-auth --check` sapmayı kırar. | İki kopya mühürlü. Elle harita yazılırsa prebuild düşer. |
| Şema | `prisma/migrations` 44 klasör + `supabase/migrations` 17 SQL. İkisi de `inspectHostedApplyDiskPlan` içinde.apply planına girer. | Şema Prisma’da, RLS ve bazı tohumlar SQL mühüründe. Tek dosya ağacı değil. |
| Çekirdek paket | `lib/kernel` 225 TS dosyası. `packages/kernel/src` 19 dosya. Para, zarf, katalog kimliği ve sha256 `lib/kernel` üzerinden `@yetkin/kernel` yeniden ihraç edilir. | Paylaşılan sözleşme pakettedir. Sunucu çekirdeği Next uygulamasının içindedir. |
| Junior içerik | Katalog `packages/junior-content` okur (`lib/junior/content-source.ts`, pakette 406 dosya). `lib/junior/content` 116 TS dosyası hâlâ durur. Ders indeksleri `juniorSealedCourseLessons` ile paketten dolar. `lib/junior/pilot-engine/*.graph.ts` tekil `content/mat|fen/...` dosyalarını import eder. | Aynı dersin sahne metni iki ağaçta yazarlığa açıktır. |
| Sınıf | Uygulama yalnız 6. `JUNIOR_SCHOOL_SEGMENT` 5–8. DB CHECK 5–12. Raf fonksiyonu sınıfı yok sayar. | Üç bant. Canlı metin 6. sınıftır. |
| Freelancer kapısı | `DRON_KAYIT.kapali` ve `FREELANCER_PUBLIC_SURFACE_LOCKED`. | İkisi de bugün kapalı. İkinci sabiti env açmaz. |
| PayTR ağız | `/api/paytr/callback` kanonik route’u ihraç eder. | İkinci mutabakat motoru yok. Panel URL’si alias. |
| Kota | `JUNIOR_ELECTIVE_QUOTA = 3` ve DB CHECK `cardinality(selected_electives) <= 3`. Bu hesabın kolonu da 3. | Sayılar örtüşür. |

`apps/rail-is` kök `package.json` `workspaces` listesinde yoktur. Liste yalnız `packages/*`. Native istemci `file:../../packages/kernel` ile bağlanır, 53 TS/TSX dosyası vardır (`node_modules` ve `.expo` hariç).

---

## ADIM 3 — Mimari: çekirdek + mikro uygulamalar

Kodun kendi adı pragmatik monolittir. Kayıt `lib/dronlar/kayit.ts`. Ayrı deploy edilen mikro servis, ayrı veritabanı ve ayrı kimlik yoktur.

**Çalışan odalar** (`VERTICAL_ROOMS`): dashboard, academy, career, freelancer.  
**Müstakil odalar** (`INDEPENDENT_ROOMS`): junior (açık), young (kapalı).  
**Donmuş disk**: studio, devlabs, kurumsal, hibe, arena, pazaryeri, social. Canlı `lib/` tavanında klasörleri yoktur.

Sınır kuralları `scripts/verify-boundaries.ts` içindedir: `lib/kernel` dikey motor import etmez; odalar birbirinin engine dosyasını import etmez; Junior Prisma delegate’i `lib/junior` sahibindedir (`RAIL_JUNIOR_CONTEXT`, beş model). API katmanı odaları birleştirebilir.

Native yüz `apps/rail-is` (Expo). Paket açıklaması Akademi halkasını Dron UI’ya bağlar, Tezgâh’ı Closed Testing’te izole tutar. Sözleşme `@yetkin/kernel` hop sicilidir. Web ile aynı Postgres ve aynı Supabase oturumuna gider. Ayrı bir Core API süreci yoktur. `/api/v1` kenarda soyulup kanonik handler’a rewrite edilir (`proxy.ts`).

**Modele uyum**

- Paylaşılan sözleşme (para birimi, hop meta, zarf) pakete çıkarılmış. Bu, “shared kernel”in ince dilimidir.
- Ürün davranışı, PayTR, RLS sahibi sorgular ve Junior içeriği Next monolith içindedir. Dronlar süreç olarak ayrılmamıştır. Bayrak ve 410 ile kapanırlar.
- `apps/rail-is` workspace dışında kaldığı için kök `npm install` onu birincil paket gibi yönetmez.
- Freelancer motoru (`lib/freelancer`, Prisma şeması) kamu 410 iken derlemede durur. Young tek dosya ile Junior sözleşmesine yapışıktır.
- Ölçek birimi tek Next süreci + tek Postgres’tir. Havuz sınırları `lib/kernel/db.ts` içindedir (serverless `Pool.max = 1`).

Bu yapı “amiral gemi + bağımsız sürü”nün kayıt ve sözleşme katmanıdır. Çalışma zamanı hâlâ tek gövdedir.

---

## ADIM 4 — Değerlendirme

Bu bölüm kodun zorunlu sonucu değil, aynı olgulara dayanan teknik tercihtir.

### 1. Sen olsan ne yapardın?

1. **Süper yöneticiyi tek ortam UUID’sinden çıkarmak.** Bugün katalog fiyatı, akademi içerik muafiyeti ve bütün Junior seçmelilerin denetim görünümü aynı çifte bağlı. UUID sızarsa rol tablosu yoktur, iptal için env değiştirmek gerekir. Yapılacak iş: `auth.users` app metadata veya ayrı `operator_grants` satırı, her yönetici yazımında aktör ve gerekçe, env UUID’sini yalnız kırılma kapısı olarak bırakmak. Vercel’deki `SUPER_ADMIN_USER_ID` bu rapordaki satırla bir kez karşılaştırılmalı.
2. **`/api/junior/live-tutor` kapısını ders kapısıyla aynı fonksiyona bağlamak.** Oturumlu koç, `canEnterJunior` + seçmeli kota geçmeden model bağlamı yüklememeli. Misafir kolu deneme anahtar listesinde kalmalı. Bu, paketi olan velinin seçmediği seçmeliyi ve paketi olmayan oturumu aynı delikten geçirir.
3. **Sınıf CHECK’ini 6’ya çekmek ve rafın sınıf argümanını ya kullanmak ya silmek.** Üç bant (5–12 / 5–8 / 6) sonraki sınıf açıldığında yanlış satırın 6. sınıf metnini giymesine yol açar. Pilot bitene kadar kolon `CHECK (grade = 6)` olmalı. `juniorShelvesForGrade` ya grade=6 dışını reddetmeli ya da parametreyi taşımamalı.

### 2. Gelecek aşamada ne yapılmalı?

PayTR bu veritabanında kapanmış sipariş üretmiş durumda (`CLEARED` + aktif `junior-yearly`). Sıradaki iş yeni ödeme sağlayıcısı değil.

- **Mutabakat görünürlüğü.** `/api/cron/paytr-reconcile` çalışma alanında `CRON_SECRET` boşken 503 döner. Vercel cron başlığı ve Inngest anahtarları panelden doğrulanmalı. Bekleyen `PENDING` sipariş için mevcut `ops:list-paytr-pending` okuması periyodik çalışmalı.
- **Sunucu rolü ile RLS.** Prisma sahibi FORCE RLS’i aşar. PostgREST politikası ikinci hattır, birincil hat değildir. Yeni rota IDOR testine (`verify:idor-seals`) bağlanmadan çıkmamalı. Servis rol anahtarı tarayıcıya inmemeli (bu turda istemci anahtarı okunmadı).
- **Gözlem.** Huni paneli süper yöneticiye bağlı. Ödeme anomali tablosu (`payment_anomalies`) ve akademi defter denetimi (`ops:audit-academy-ledger`) alarm üretmiyorsa, CLEARED sipariş ile lisans satırı sapması elle bulunur.
- **Koç ve asistan kotası.** Canlı koç oturumda model çağırır ve kullanım yazar. Kota ders duvarından bağımsızsa maliyet ve içerik birlikte sızar.

### 3. Kurgu doğrulaması

Kurgu, tek kimlikli veli hesabı + çocuk profili + çekirdek içinde odalar olarak tutarlıdır. Junior ayrı çocuk girişi açmaz. PayTR lisans köprüsü bu hesapta aboneliği yazmış. Akademi ve Junior kasası aynı kullanıcıda yan yana durabilir; `ustaders.proje@gmail.com` bunun canlı örneğidir.

Hatalı veya eksik duran noktalar:

- “Junior kullanıcı” diye bir rol yoktur. 6. sınıf kısıtı içerik rafında vardır, hesap yüzeyinde yoktur.
- Süper yönetici “tüm modüller” değildir. Donmuş odalar, üretimde yeni bağış, rızasız Junior yazma ve defter UPDATE kapalıdır. İçerik izleme ve fiyat yazma açıktır.
- Sınıf modeli şemada 5–12, üründe 6. Young kapalı bir yeniden ihraçtır.
- Native dron kayıtta vardır, gövdeden süreç olarak kopmuş değildir ve workspace dışındadır.
- Koç rotası paket kurgusunun dışında kalır.

### 4. Gelecek master plan (3–6 ay)

**Ay 1 — Kapı mühürü**  
Vercel süper yönetici UUID’sini bu satırla doğrula. Live tutor’ı `juniorLessonGate` ardına al. Sınıf CHECK’ini 6 yap. `CRON_SECRET` ve PayTR cron’un üretimde 401/200 davranışını bir kez ölç. `PENDING` taramasını takvime bağla.

**Ay 2 — Operatör ve gözlem**  
Yönetici yazımlarını gerekçeli deftere al (fiyat kararı zaten `price_catalog_decision_ledger` yazıyor; ders muafiyeti ve koç aynı izi taşımıyor). Ödeme anomalisi ve lisans-süresi için salt okunur alarm. RLS’i “PostgREST ikinci hat” diye belgele; yeni tablo `verify:rls-status` listesine girmeden migrate olmasın.

**Ay 3 — İçerik tek ağacı**  
`lib/junior/content/*.ts` içinden pilot-engine importlarını `content-source` senaryosuna taşı. Graf dosyası sahne zamanını tutsun, ders cümlesini ikinci kez tutmasın. Katalog ile fırın aynı `packages/junior-content` anahtarını okusun.

**Ay 4 — Native’i workspace’e al**  
`apps/rail-is` kök workspace’e girsin. Hop sözleşmesi `@yetkin/kernel` olarak kalsın. Dron, web’in `lib/` klasörünü import etmesin. Tezgâh Closed Testing kilidi kodda kalsın.

**Ay 5–6 — Oda sınırı, ikinci süreç değil**  
Freelancer şeması durur, kamu 410 kalır. Açılacaksa tek bayrak (`FREELANCER_PUBLIC_SURFACE_LOCKED`) kalksın; ikinci env ile çelişmesin. Young içerik yokken `lib/young` büyütülmesin. İkinci Postgres veya ikinci kimlik açılmasın. Ölçek ihtiyacı çıkarsa önce havuz ve okuma replikası, sonra yalnız stateless `/api/v1` hop’larının ayrı süreci. Çekirdek para ve kullanıcı satırı tek veritabanında kalsın.

---

## Kısa sonuç

`yapinet360@gmail.com` bu veritabanında doğrulanmış kullanıcıdır ve çalışma alanı süper yönetici UUID’si ile aynıdır. Bütün modüllere açık değildir: admin katalog/huni/yayın, akademi içerik muafiyeti ve Junior denetim görünümü açıktır; donmuş odalar, üretimde yeni bağış, rızasız Junior yazma ve defter güncellemesi kapalıdır.

`ustaders.proje@gmail.com` 6. sınıf profili, aktif PayTR yıllık paketi (2027-10-14’e kadar) ve iki harçlı akademi lisansı olan veli hesabıdır. Yönetici değildir. Junior rafı 6. sınıf çekirdeğidir; seçmeli kota seçilmemiştir. Aynı oturum Akademi ve diğer `session` rotalarına da girer. Paket duvarının kodda görülen deliği `/api/junior/live-tutor` koç koludur.
