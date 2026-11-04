# TEDAVİ RAPORU — FAZ 02

**Proje:** yetkin.ai (Pragmatik Monolit + `@yetkin/kernel` + tek native istemci `apps/rail-is`)
**Tarih:** 3 Kasım 2026
**Dayanak:** `docs/01_TESPIT_RAPORU.md` (2 Kasım 2026)
**Kapsam:** F-01, F-02, F-03, F-04, F-05, P-05 ve Adım 3 temizlik. Canlı şemaya iki bekleyen migrasyon uygulandı. Müşteri kataloğu, satın alma ve cüzdan satırına yazılmadı.
**Sınır:** Bağlantı dizgisi, mağaza anahtarı, JWT ve müşteri e-postası bu belgeye yazılmadı. Vercel üretim paneli açılmadı; `vercel.json` değişikliği bir sonraki üretim dağıtımında cron olarak kaydolur. Commit oluşturulmadı.

---

## 0. Sonuç

| Bulgu | Tedavi | Kanıt |
|---|---|---|
| **F-01** lint hatası | Kullanılmayan `ACADEMY_KVKK_DELETE_BUTTON_SUMMARY` importu silindi | `npm run lint` → **0 error**, 9 uyarı (uyarılar bu turdan önce de vardı) |
| **F-02** iki migrasyon | `20261031193000_junior_pilot_grade_six` ve `20261102160000_super_admin_audit_log` uygulandı | `_prisma_migrations` **46** uygulanmış, `finished_at` boş **0** |
| **F-03** yayın / bağış denetimi | `super_admin_audit_logs` oluştu; `catalog_publish` ve `license_grant` yazılabiliyor; UPDATE append-only tetikte düşüyor | İşlem içi yaz + `ROLLBACK`. Canlı satır **0**. FORCE RLS açık |
| **F-04** cron yok | `vercel.json` `crons` → `GET /api/cron/paytr-reconcile`, `0 3 * * *` UTC | Hobby günde birden sık ifadeyi dağıtımda reddeder. 30 dk yolu operasyon belgesinde |
| **F-05** valörde lisans kancası yok | Webhook, Inngest, cron ve `ops:reconcile-paytr-pending --apply` aynı kaydı çağırıyor | Yüzey testi + 0 PENDING ile `--apply` kancayı yükledi, satır değiştirmedi |
| **P-05** hesaplanan HMAC logda | `calculatedHash` ve `hashesEqual` logdan çıktı | Webhook güvenlik testi geçerli hash'in log satırında olmadığını kilitler |

`npx tsc --noEmit` temiz. `npx vitest run` **409 dosya / 2013 test** geçti (tespit turu 2009 idi; bu tur 4 test ekledi). `verify:api-auth --check` 77 rota. `verify:boundaries` yeşil. `verify:paytr-reconciliation-seals` yeşil. `verify:junior-pilot-seals` yeşil.

---

## ADIM 1 — P0

### 1.1 Lint (F-01)

`lib/academy/cinema-cue-catalog.ts` KVKK slaytını `ACADEMY_KVKK_FILE_NAME`, tablo ve hücre sabitleriyle kuruyor. `ACADEMY_KVKK_DELETE_BUTTON_SUMMARY` bu dosyada geçmiyordu; sabit duruyor: `lib/academy/kvkk-workspace.ts`, ders metni, çıkış kiti ve önizleme bileşeni.

`npm run lint` sonucu:

```
✖ 9 problems (0 errors, 9 warnings)
```

Kalan 9 uyarı `curriculum-player`, `lesson-visual-stage`, Junior simülasyon, sahne görseli ve ödeme işaretindeki mevcut hook / `<img>` uyarılarıdır. Bu turda onlara dokunulmadı.

### 1.2 Migrasyon (F-02, F-03)

Uygulama öncesi okuma:

| Ölçüm | Değer |
|---|---|
| Bağlantı sınıfı | havuz (diskteki `DIRECT_URL` doğrudan oturum host'u değil) |
| `junior_profiles` | 2 satır, ikisi de `grade = 6` |
| Uygulanmış migrasyon | 44 |
| Yarım kalmış migrasyon | 0 |
| `super_admin_audit_logs` | yok |

`grade = 6` önkoşulu tuttuğu için `junior_profiles_shape` daraltması mevcut satırları düşürmez.

`npx prisma migrate deploy`, projenin kendi `resolveMigrateApplyTarget` oturum havuzu üzerinden çalıştı. Ham `DIRECT_URL` havuz host'unda olduğu için işlem kipi (`:6543`) advisory lock için kullanılmadı; havuz oturum kapısı `:5432`. Diskteki ortam dosyası değiştirilmedi. Runbook hâlâ doğrudan `db.<ref>.supabase.co:5432` ister. Bu borç duruyor.

Uygulananlar:

1. `20261031193000_junior_pilot_grade_six` — `junior_profiles_shape` artık `grade = 6`.
2. `20261102160000_super_admin_audit_log` — tablo, UUID ve bilinen eylem CHECK'i, iki indeks, append-only tetik.

Uygulama sonrası:

| Ölçüm | Değer |
|---|---|
| Uygulanmış migrasyon | **46** |
| Yarım kalmış | **0** |
| Sınıf kısıtı | `grade = 6` ve önceki takma ad / doğum yılı / kapalı profil koşulları |
| RLS | `ENABLE` + `FORCE` |
| Politika | `rls_deny_unscoped` (SELECT). Olay tetiği tabloyu oluştururken basmış |
| Çalışan rol | `rolbypassrls = true` — Prisma yazması deny politikasına takılmaz |
| Tablodaki satır | **0** |

Yazma provası tek transaction içindeydi ve `ROLLBACK` ile bitti:

- `catalog_publish` ve `license_grant` aynı anda insert edildi (2 satır transaction içinde göründü).
- `ROLLBACK` sonrası `faz02probe-%` sayısı **0**.
- Ayrı transaction: insert + `UPDATE` → `super_admin_audit_logs is append-only`. `ROLLBACK` sonrası artık satır **0**.

Bu, F-03'ün kırıldığı yeri kapatır. `lib/kernel/admin/prisma-course-publish.ts` yayın transaction'ının sonunda `writeSuperAdminAudit(..., action: "catalog_publish")` çağırır. `lib/academy/prisma-store.ts` `sa_grant` satın almasında `license_grant` yazar. İkisi de tablo yokken 500 üretiyordu. Tablo, CHECK ve tetik artık bu iki eylemi kabul ediyor.

Canlı `PATCH /api/admin/catalog/publish` çağrılmadı. `ops:super-admin-academy-grant` çalıştırılmadı. İkisi de kurs yayın bayrağını veya `academy_purchases` satırını değiştirir. Müşteri vitrini ve bağış defteri bu turda olduğu gibi kaldı. Kanıt, bu iki sürecin paylaştığı ve daha önce düşüren denetim insert'idir.

---

## ADIM 2 — P1

### 2.1 Valör lisans kancası (F-05)

Kernel Akademi ve Junior import etmez. Kanca global bir değişkendir; serverless'ta her rota kendi örneğini taşır. Kayıt yalnız webhook ve Inngest serve modülündeydi. Cron ve `ops:reconcile-paytr-pending --apply` `reconcilePaytrPaymentOrder` çağırıp `notify*` ile boş kancaya düşüyordu: CLEARED ve cüzdan CREDIT yazılır, kurs veya Junior paketi açılmaz.

Tek kompozisyon:

`app/api/(kernel)/payments/register-paytr-valor-hooks.ts` → `registerPaytrValorLicenseHooks()`

Çağrı sırası, reconcile'dan önce:

| Giriş | Kayıt |
|---|---|
| `app/api/(kernel)/payments/webhooks/paytr/route.ts` | modül yüklenirken |
| `app/api/(kernel)/jobs/inngest/route.ts` | modül yüklenirken (iş, aynı süreçte reconcile eder) |
| `app/api/(kernel)/cron/paytr-reconcile/route.ts` | modül yüklenirken |
| `scripts/ops-reconcile-paytr-pending.ts` | `--apply` dalında, reconcile döngüsünden önce |

`--apply` Akademi runtime'ını çeker. O dosya `server-only` taşır. Düz `tsx` bu pakette istemci koşuluna düşer ve import patlar. `package.json` betiği bu yüzden `tsx --conditions=react-server` kullanır. Aynı kalıp `scripts/ops-settle-cleared-academy-license.ts` başlığında zaten yazılıydı.

Kanıt:

- `tests/kernel/paytr-reconcile.test.ts`: kanca yokken CLEARED ve CREDIT yazılır, notify sessiz döner. Kanca varken Akademi ve Junior sırayla çağrılır. Zaten CLEARED sipariş kancaları yeniden çağırır, ikinci CREDIT yazmaz.
- `tests/kernel/paytr-clearing-scan-surface.test.ts`: dört girişte kayıt, reconcile çağrısından önce.
- `npm run ops:reconcile-paytr-pending -- --apply`: **0 PENDING**. Kanca modülü yüklendi, PSP'ye sipariş sorulmadı, satır değişmedi.

`verify:junior-pilot-seals` webhook dosyasında eski fonksiyon adını arıyordu. Mühür, kompozisyon dosyasındaki `registerPaytrJuniorLicenseHook` çağrısına ve cron / ops girişlerine alındı.

### 2.2 Vercel cron (F-04)

`vercel.json`:

```json
"crons": [
  { "path": "/api/cron/paytr-reconcile", "schedule": "0 3 * * *" }
]
```

İfade UTC 03:00, günde bir. Vercel Hobby, günde birden sık cron ifadesini dağıtımda reddeder (`0 * * * *`, `*/30 * * * *` dahil). Kaynak yorumu bunu zaten söylüyordu. Otuz dakikalık ifadeyi dosyaya yazmak bir sonraki Hobby dağıtımını düşürür. Pro plana geçilince aynı yolun ifadesi otuz dakikaya çekilebilir.

Otuz dakikalık asıl tarama Inngest `paytr-clearing-scan` işidir. Inngest anahtarı yokken yedek, günde bir Vercel cron'udur. Daha sık tarama `.system_docs/ops/ops-paytr.md` içindeki dış çağrıdır:

```
curl -fsS -H "Authorization: Bearer $CRON_SECRET" "$NEXT_PUBLIC_APP_URL/api/cron/paytr-reconcile"
```

`CRON_SECRET` boşsa rota 503, başlık tutmazsa 401 döner. Bu cron üretimde ancak dosya deploy edildikten ve projede cron kapalı değilken çalışır. Panel bu turda açılmadı.

PENDING tavanı 2 saattir. Günde bir tarama, webhook'u kaçmış bir ödemeyi en geç ertesi gün kapatır. Inngest varken aralık 30 dakikadır. İkisi de artık lisans kancası kayıtlıdır.

### 2.3 HMAC logu (P-05)

`logPaytrWebhookHmacMismatch` hesaplanan hash'i ve `hashesEqual` alanını basmıyor. Günlükte kalanlar: alınan hash (gönderenin zaten bildiği değer), `merchant_oid`, durum, tutar ve anahtar uzunlukları. Geçerli imza log satırına girmediği için aynı gövde bu logdan yeniden oynatılamaz.

`tests/kernel/paytr-webhook-security.test.ts` geçersiz HMAC'de 403, CREDIT yok, logda `calculatedHash` yok ve geçerli hash metni yok diye kilitler. Yüzey testi aynı fonksiyon gövdesinde bu iki alan adının durmadığını okur.

Clearance-bound HMAC dalı (`verifyPaytrClearanceBoundHash`, `isPaytrClearanceEvent`) bu turda silinmedi. Tespit onu P2 ölü kod sayıyor. Silmek çağrısız fonksiyonla birlikte formül testlerini de oynatır. Faz 02 kapsamı log sızıntısıydı.

---

## ADIM 3 — Temizlik ve tek kaynak

### 3.1 Boş `middleware/` ve ölü 410 üreteci

`middleware/` boştu. `middleware/api-auth.ts` çalışma ağacında zaten silinmişti. Klasör kaldırıldı. `tsconfig.json` içindeki `middleware/**/*.ts` include satırı da kalktı. Kenar `proxy.ts`.

Canlı 410 gövdesi `lib/kernel/http/frozen-410-html.ts`. `components/shell/frozen-room-gone-page.tsx` canlı rota tarafından import edilmiyordu. Dosya silindi. `tests/kernel/circuit-breakers-surface.test.ts` artık bu dosyayı okumuyor; mühür canlı HTML üretecinde.

`archived/app/**` müze sayfaları hâlâ `FrozenRoomGonePage` adını taşıyor. `archived/` derleme dışıdır. `write-path-edge-surface`, `ux-friction-surface` ve arena yüzey testleri bu metni müze dosyasında kilitler. Müze importlarını sökmek o mühürleri düşürür ve canlı 410 yolunu değiştirmez. Müze bağlantıları bu yüzden yerinde bırakıldı.

### 3.2 `lib/young`

`lib/young/` diskte yok. `lib/young/micro-lesson.ts` silinmesi bu çalışma ağacında zaten duruyordu. Kalan import yok.

`app/young/page.tsx` kırık yönlendirme değildir. `DRON_KAYIT` satırı `id: "young"`, varsayılan `kapali: true`. Kapalıyken `isFrozenShellPagePath("/young")` doğrudur ve kenar 410 basar. Bayrak açılınca sayfa `YOUNG_SCHOOL_SEGMENT` rafını gösterir. Sayfa silinirse kayıtlı oda yolu kalkar; `tests/kernel/young-segment.test.ts` bunu kilitler. Sayfa duruyor.

`scripts/room-ceiling-lib.ts` içinde `CLOSED_PILOT_LIB_DIRS` artık yalnız `["junior"]`. Yeni bir `lib/young/` klasörü oda tavanında fazla dizin sayılır. Young'un oturağı kayıt, `DRON_YOUNG_OPEN` ve sayfa kabuğudur. Bu cümle `lib/junior/micro-lesson.ts` başlığında da duruyor.

### 3.3 `docs/` dizisi

Canlı dizi:

| Dosya | Rol |
|---|---|
| `docs/01_TESPIT_RAPORU.md` | Faz 01 tespit. Bu turda değiştirilmedi |
| `docs/02_TEDAVI_RAPORU.md` | Bu belge |

`docs/001`–`007` bu çalışma ağacında zaten `archived/docs_history/` altına taşınmıştı. Dokunulmadı.

HEAD'te silinmiş 13 küçük harfli rapor (`tespit_raporu_01` … `09`, `tedavi_raporu_01` … `11`) `archived/docs_history/docs_root/` altına alındı. İçerik HEAD kopyasıdır. İki kod yorumu (`JuniorLessonEngine.tsx`, `junior-stage-containment.test.ts`) `tespit_raporu_04.md` yolunu bu klasöre çevirdi. Yorumlar dosyayı import etmez.

Takip edilmeyen adım raporları numaralandı:

- `016. TESPIT_RAPORU_ADIM_1.md`
- `017. TEDAVI_RAPORU_ADIM_2.md`
- `018. TEDAVI_RAPORU_ADIM_3.md`
- `019. TEDAVI_RAPORU_ADIM_4.md`

Birbirlerinin dayanak satırı eski `docs/` yolunu gösteriyordu. Satırlar yeni arşiv yoluna çekildi.

`.system_docs/README.md` kırık `docs/archive/PLATFORM_DEGERLEME.md` bağlantısı, arşiv klasörünü ve canlı `docs/` dizisini gösterecek şekilde düzeltildi. İkinci bir değerleme özeti yazılmadı.

Çalışma ağacındaki ürün diff'i (denetim günlüğü, fiyat mührü, dron iskeleti, freelancer ve katalog taşımaları) commit'lenmedi. Bu tur yalnızca rapor ve geçici dosya düzenini istedi. `git status` ürün değişiklikleri yüzünden temiz değildir.

---

## ADIM 4 — Danışmanlık

### 4.1 Sen olsaydın sıradaki üç hamle ne olurdu?

1. **CLEARED olup lisansı olmayan sipariş için alarm.** Kanca kaydı bu dört girişte kapanmıştır. Yeni bir çağıran, kanca içindeki throw veya Inngest'siz günde bir cron hâlâ bir müşteriyi kursuz bırakabilir. `ops:audit-academy-ledger` eşleşmeyi ölçüyor ve elle çalışıyor. On beş dakikada bir `payment_orders` CLEARED ile `academy_purchases` / `junior_subscriptions` eksik eşleşmesi sayılmalı; sayı sıfırdan büyükse operatöre gitmeli. Kapı: üretimde bir hafta eksik eşleşme sıfır, sıfırdan sapınca bildirim.

2. **Hız tavanını süreç dışına almak.** `lib/kernel/security/rate-limit-runtime.ts` sayacı süreç içidir. Vercel'de örnek sayısı arttıkça tavan `limit × örnek` olur. `ops:runtime-readiness` bunu görür ve engellemez. Sıradaki iş `RATE_LIMIT_REDIS_REST_URL` + token ile paylaşılan sayaç, ya da trafik tek örneğe kilitlenene kadar bu deliğin üretim kapısı yapılmasıdır. Kapı: readiness çıktısında paylaşılan depo.

3. **`DIRECT_URL` runbook biçimine çekmek.** Bu turdaki migrasyon, havuz oturum kapısından geçti çünkü diskteki doğrudan URL havuz host'unda. Şema uygulandı. Sonraki DDL, kilit veya `ops:ghost-wallet-holds` aynı host'ta yine reddedilir veya havuza düşer. Doğrudan host `db.<ref>.supabase.co:5432` olmalı. Değer bu belgeye yazılmadı. Panel ve yerel dosya operatör işidir.

Bu üçü bittikten sonra native istemcinin `lib/academy` zamanlamalarına doğrudan bakması (tespit W-02) gelir. O bağ, bir Akademi taşımasında mobil derlemeyi kırar. Bugün nakit kadar acil değildir.

### 4.2 Platform kurgusu canlı yükü ve sürü dronu taşıyor mu?

Kurgu doğru: tek Next.js gövdesi, tek Prisma, tek Supabase Auth, ince `@yetkin/kernel`, oda `lib/dronlar/kayit.ts` satırı + bayrak + `/api/v1` hop'u. Ayrı repo ve ayrı veritabanı aynı `users` / `wallets` / `ledger_entries` / `payment_orders` defterini ikiye böler. Bu tedaviden sonra da ölçek yolu yatay tek gövde, paylaşılan sayaç, hop sicili ve pakete bağlı istemcidir.

Bugün canlı yükü ve ikinci bir bağımsız istemciyi tam taşımıyor. Kapanan halka ödeme → valör → lisans kaydıdır. Duran halkalar:

| Halka | Durum |
|---|---|
| Valörde lisans kancası | Dört girişte kayıtlı |
| Zamanlanmış valör | Inngest 30 dk. Yedek cron günde bir. Üretimde cron, deploy sonrası |
| Hız tavanı | Süreç içi. Çok örnekte sessizce genişler |
| Kuyruk | Inngest tek sağlayıcı. Anahtar yoksa webhook clearing 503 döner, cron günde bir süpürür. Dead-letter ve sayfa yok |
| Native istemci | `apps/rail-is` `lib/academy` zamanlama ve punchcard dosyalarına bakar |
| Gözlem | JSON log var. CLEARED-lisans sapması, PENDING yaşı, iade FAILED sayısı için metrik yok |
| Operatör | Tek ortam mührü. İkinci operatör için rol tablosu yok. Bu bir hata değil, bugünkü kasıt |
| Havuz + `FOR UPDATE` | Hacim düşükken tutuyor. On kat siparişte ilk ölçülecek yer |

Sürü dron bu repoda ayrı servis demek değildir. Bugün bir tam istemci (web) ve bir yarım istemci (native, `lib/`e bağlı) vardır. Üçüncü istemci aynı sızıntıyı miras alır.

### 4.3 Faz 03'te doğrudan ele alınacak başlık

**CLEARED ödeme ile lisans arasındaki sapmanın alarmı, ve valörün otuz dakikada plan bağımsız çalışması.**

Gerekçe: Faz 02 kancayı koda koydu ve cron'u günde bire bağladı. Hobby reddi yüzünden otuz dakika hâlâ Inngest'e veya elle `curl`'e kalmıştır. İkisi de yoksa müşteri bir gün kursuz kalabilir ve kimse uyarı almaz. Alarm, kancanın unutulduğu bir sonraki girişte de aynı yarayı gösterir. Hız tavanı hemen ardından gelir. Onun kırılması kötü niyetli trafikte olur. Lisans sapması, dürüst bir ödemede olur.

Faz 03'e sokulmayacaklar: yeni oda, Junior içerik üretimi, Freelancer vitrini, mikroservis bölmesi, admin konsolunun tamamı. Konsol Faz 03'ün konusu değildir. O, alarm oturduktan sonraki operatör turudur.

### 4.4 Önümüzdeki 3–6 ay

Hedef: tek gövde, N istemci, tek defter.

**Ay 1 — Zincir görünür olsun.** Bu tedavinin üstüne alarm, otuz dakikalık tetik (Pro cron veya dış zamanlayıcı + `CRON_SECRET`), üretimde `SUPER_ADMIN_USER_ID` eşleşmesinin panelden teyidi, `DIRECT_URL` düzeltmesi. Kapı: bir hafta CLEARED-lisans eksik eşleşmesi sıfır.

**Ay 2 — Operatör paneli.** Kullanıcı arama, sipariş, anomali, iade, denetim günlüğü okuma, sertifika iptal. `super_admin_audit_logs` bu eylemleri de yazsın. Kapı: bir nakit anomalisinden iadeye ve denetim satırına panelden, on dakika.

**Ay 3 — İstemci bağımsızlığı.** `apps/rail-is` içinden `lib/academy` zamanlama ve punchcard bağı kalksın. Sözleşme `@yetkin/kernel` veya ayrı bir içerik paketinde dursun. Native CI'ya `tsc` yanında gerçek derleme eklensin. Kapı: `verify:boundaries` istemci ağacından `lib/` importunu kırar.

**Ay 4 — Yük provası.** Eşzamanlı checkout, webhook ve valör. `FOR UPDATE` ve havuz ölçülür. Kuyruğa dead-letter ve elle yeniden oynatma. Metrikler: PENDING yaşı, kanca sonucu, anomali, iade, checkout p95. Kapı: drift sıfır, kayıp lisans sıfır.

**Ay 5 — Sürü, paket olarak.** Junior zaten ayrı içerik paketi ve kapalı vitrin satırıdır. Hop, bayrak ve kendi CI'ı ile sürümlenir. Freelancer vitrini Anayasa B5 kapıları (bölüşüm sözleşmesi, alt satıcı, hop geri yazımı, kapalı test) yeşil olmadan açılmaz.

**Ay 6 — İkinci operatör ve tatbikat.** Yetki tablosu eklenebilir. `SUPER_ADMIN_USER_ID` kurtarma kapısı fail-closed kalır. DB geri yükleme, PayTR kesintisi, Inngest kesintisi ve tek bölge kaybı runbook'tan bir kez çalıştırılır. RTO / RPO yazılır.

Beş ilke bu plan boyunca durur:

1. Tek defter, tek `amountMinor`.
2. Bağlı olmayan kanal sahte onay basmaz.
3. Yönetici kapısı ortam mührü, doğrulanmış e-posta ve UUID eşleşmesidir.
4. Yeni istemci aynı `@yetkin/kernel` ve aynı `/api/v1` hop sicilini konuşur.
5. Sahte bakiye ve sahte başarı yoktur.

---

## EK — Bu turda koşulan komutlar

| Komut | Sonuç |
|---|---|
| Şema ön okuma | 44 migrasyon, 2 profil `grade=6`, denetim tablosu yok |
| `npx prisma migrate deploy` (oturum havuzu) | 2 migrasyon uygulandı, 46/46 |
| Şema prova | RLS+FORCE, append-only, iki eylem insert, `ROLLBACK`, artık satır 0 |
| `npm run ops:reconcile-paytr-pending -- --apply` | 0 PENDING, kanca yüklendi, yazma yok |
| `npm run lint` | 0 error, 9 warning |
| `npx tsc --noEmit` | temiz |
| `npx vitest run` | 409 dosya, 2013 test geçti |
| `npm run verify:api-auth -- --check` | 77 rota |
| `npm run verify:boundaries` | yeşil |
| `npx tsx scripts/verify-junior-pilot-seals.ts` | yeşil |
| `npm run verify:paytr-reconciliation-seals` | yeşil, 22 test |

`npm run build`, `test:pg`, `test:e2e` ve Vercel panel teyidi bu turda yok. Canlı yayın bayrağı ve lab bağışı müşteri verisini değiştirmemek için çağrılmadı.
