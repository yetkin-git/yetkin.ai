# TESPİT RAPORU — FAZ 01

**Proje:** yetkin.ai (Pragmatik Monolit + `@yetkin/kernel` + tek native istemci `apps/rail-is`)
**Tarih:** 2 Kasım 2026
**Kapsam:** Çalışma ağacı (`app/`, `lib/`, `components/`, `packages/`, `apps/rail-is`, `scripts/`, `prisma/`, `supabase/`) ve bu makinenin `DATABASE_URL`/`DIRECT_URL` ile bağlandığı barındırılan Supabase Postgres.
**Yöntem:** Salt-okunur kod okuması, statik import grafiği taraması, canlı şema/satır sorguları, repo'nun kendi muhasebe/bekçi script'leri. **Hiçbir ürün kodu değiştirilmedi, hiçbir veri yazılmadı.** Bu turda yazılan tek dosya bu rapordur.

**Sınır (bilinçli):** Kimlik UUID'leri, bağlantı dizgileri, mağaza anahtarları, JWT'ler ve **müşteri** e-posta adresleri bu belgeye **yazılmadı**; yalnız anahtar adları ve sınıflandırma (dolu/boş, eşleşiyor/eşleşmiyor) raporlandı. Tek istisna, görev tanımında adı geçen kanonik Super Admin kutusudur. `archived/`, `node_modules/`, `yetkin_muze/`, `public/media/` içerikleri taranmadı (yalnız hacim ölçüldü). Vercel kontrol paneli açılmadı; üretim env değerleri doğrulanmadı.

---

## 0. YÖNETİCİ ÖZETİ

| # | Bulgu | Kanıt | Önem |
|---|-------|-------|------|
| **F-01** | **`npm run lint` şu an KIRIK.** 1 hata + 9 uyarı. CI'ın `amiral` işi bu adımda düşer. | `lib/academy/cinema-cue-catalog.ts:88` — kullanılmayan `ACADEMY_KVKK_DELETE_BUTTON_SUMMARY` importu | **P0** |
| **F-02** | **2 migrasyon uygulanmamış.** Bunlardan biri `super_admin_audit_logs`. Tablo yok. | `_prisma_migrations` 44 kayıt; diskte 46 klasör → `20261031193000_junior_pilot_grade_six`, `20261102160000_super_admin_audit_log` bekliyor | **P0** |
| **F-03** | **F-02'nin doğrudan sonucu: Super Admin kurs yayınlama (PATCH) çalışmaz.** `writeSuperAdminAudit` aynı `$transaction` içinde çağrılıyor; tablo yok → işlem geri alınır → 500. Aynı kusur **lab bağışı** yolunda da var: sıfır harçlı `sa_grant` satırı yazılırken denetim girişi aynı try bloğunda patlar. | `lib/kernel/admin/prisma-course-publish.ts:80` + `lib/kernel/admin/prisma-super-admin-audit.ts:12`; `lib/academy/prisma-store.ts:314-323` (`isAcademyGrantPurchase` → `writeSuperAdminAudit`) | **P0** |
| **F-04** | **Vercel Cron tanımlı değil.** Kod "Vercel Cron valör yedeği" diye yazılmış, rota var, ama `vercel.json`'da `crons` bloğu yok → rota üretimde hiç tetiklenmez. | `vercel.json` yalnız `regions: ["fra1"]`; `app/api/(kernel)/cron/paytr-reconcile/route.ts:20-30` yorumu | **P1** |
| **F-05** | **Valör yedeğinde lisans kancası kayıtlı değil.** `reconcilePaytrPaymentOrder` CLEARED sonrası `notifyAcademyLicenseHook` çağırıyor; ama cron rotası ve `ops:reconcile-paytr-pending` bu kancaları **register etmiyor**. Serverless'ta her rota kendi modül örneğidir. | `paytr/reconcile.ts:142, 170-171` vs. `cron/paytr-reconcile/route.ts` (import yok), `scripts/ops-reconcile-paytr-pending.ts:99` | **P1** |
| **F-06** | **Hız tavanı süreç-içi.** Vercel çok-instance ortamda paylaşılmaz; sınır delinir. Kodun kendi uyarısı var ama dağıtım hedefi Vercel. | `lib/kernel/security/rate-limit-runtime.ts:20-34`; `ops:runtime-readiness` → `rateLimitStore=in-process-single-node hosting=unspecified` | **P1** |
| **F-07** | **`/docs` boştu; 13 geçmiş rapor çalışma ağacından silinmiş ve `archived/`'ta YOK.** Yalnız git geçmişinde (`git show HEAD:docs/...`). Bu rapor `docs/`'u yeniden açtı. | `docs/` 0 dosya (rapor öncesi); `git status` 13 ` D docs/...`; `archived/docs_history/008…015` başlıkları farklı turun içeriği | **P1** |
| **F-08** | **Çalışma ağacı çok kirli:** bu rapor yazılmadan önce **204** değişiklik (135 M, 32 D, 7 R, 30 ??). 30 yeni dosya commit edilmemiş. Raporla birlikte 205. | `git status --porcelain` | **P1** |
| **F-09** | **Geliştirme makinesi canlı veri + canlı PayTR üçlüsü ile çalışıyor.** `NODE_ENV=development` ama `DATABASE_URL` barındırılan projeye gidiyor; mağaza üçlüsü ve `SUPABASE_SERVICE_ROLE_KEY`, R2 secret, SMTP uygulama şifresi düz metin diskte. | `.env.local` (değerler rapora yazılmadı); `ops:runtime-readiness` → `paytrTriple=configured` | **P1** |
| **F-10** | **Super Admin ürün düzeyinde "tam erişim" DEĞİL.** Fiyat/yayın tahtası + huni + GA4 var; kullanıcı/sipariş/iade/denetim gibi yönetim yüzeyleri yok. Müfredat revizyon kuyruğu kalıcı 410. | `/api/admin/*` = 4 rota; `app/(kernel)/admin/**` = 3 sayfa; `route-auth-map.ts:27` `curriculum-revisions: "closed"` | **P2** |
| **F-11** | **`middleware/` klasörü boş** (0 dosya) — `proxy.ts` kanonik kenar; isim karışıklığı. | `Get-ChildItem middleware -Recurse` → 0 | **P2** |
| **F-12** | **Ölü/ikinci uygulama yüzeyleri:** yalnız test için yaşayan env şeması, 410 için iki ayrı HTML üreteci, hiç çağrılmayan PayTR clearance-bound HMAC dalı. | `lib/kernel/env.ts` (0 ürün importer'ı; yalnız `env-example-surface.test.ts` okur), `components/shell/frozen-room-gone-page.tsx` (yalnız archived + 1 test), `paytr/webhook.ts:56, 361-385` (0 çağrı) | **P2** |

**Yeşil olanlar (bu turda koşuldu):** `npx tsc --noEmit` temiz · `npx vitest run` **409 dosya / 2009 test / hepsi geçti** · `verify:prebuild` (12 kapı) OK · `verify:boundaries` OK · `verify:api-auth --check` OK (77 rota) · `verify:no-secrets` OK · `verify:rls-status` OK · `verify:public-size` OK (55.6 MB) · `verify:paytr-reconciliation-seals` OK · `ops:list-paytr-pending` → **0 PENDING** · `ops:audit-academy-ledger` → eşleşme tam.

---

## ADIM 1 — SUPER_ADMIN KONTROLÜ

### 1.1 Yetki modeli: "rol" yok, "ortam mührü" var

Bu platformda **rol tablosu, rol kolonu veya izin (permission) tablosu yoktur.** Canlı şemada aradım:

```
ROLE_COLUMNS []      (role / roles / is_admin / permissions adlı kolon yok)
ROLE_TABLES  []      (rol/izin adlı tablo yok)
```

Yetki kararı **tek bir fonksiyonda** ve **ortam değişkenine bağlı** olarak verilir:

```ts
// lib/kernel/auth/super-admin.ts:152-175
export function isSuperAdminActor(actor: SuperAdminActor): boolean {
  if (builtInRecoveryOpen(actor)) return true;              // yerleşik kutu + UUID eşleşmesi
  if (production && isBuiltInCanonicalMailbox(actor.email)) return false;  // üretimde kısa devre
  if (!isConfirmedAccountEmail(actor.emailConfirmedAt)) return false;      // e-posta doğrulanmış olmalı
  if (isCitizenTestAccountEmail(actor.email)) return false;                // vatandaş test hesabı asla
  if (production) { return isCanonicalSuperAdminEmail(actor.email) && isSuperAdminUser(actor.id); }
  ...
}
```

Okunan iki anahtar:
- `SUPER_ADMIN_USER_ID` → Supabase Auth UUID'si
- `CANONICAL_SUPER_ADMIN_EMAIL` → kanonik kutu adresi

Bu tasarım **fail-closed**: üretimde `SUPER_ADMIN_USER_ID` boşsa **hiçbir hesap**, yerleşik kutu dâhil, admin olmaz (`super-admin.ts:69-73, 152-175`). Prebuild bunu engelleyici olarak denetliyor (`ops-runtime-readiness-lib.ts:327-335`).

### 1.2 `yapinet360@gmail.com` — canlı doğrulama

| Kontrol | Sonuç |
|---|---|
| `auth.users` satırı var mı | **Var**, `role=authenticated`, `banned_until=NULL` |
| `email_confirmed_at` dolu mu | **Dolu** (2026-09-26) |
| Son giriş | 1 Kasım 2026 (aktif kullanım) |
| `public.users` satırı var mı | **Var**, `display_name = "SUPER_ADMIN"` |
| `SUPER_ADMIN_USER_ID` bu satırın `id`'si ile birebir mi | **Evet** (birebir eşleşme) |
| `CANONICAL_SUPER_ADMIN_EMAIL` bu adres mi | **Evet** |
| Vatandaş test hesabıyla çakışma | **Yok** (`yetkin.vision@gmail.com` ayrı ve ayrıca kodla yasaklı) |
| İkinci bir admin hesabı | **Yok** — `auth.users` yalnız 2 satır (biri müşteri) |

**Hüküm:** Geliştirme ortamında yetki eksiksiz açılır. Üretim ortamında da **aynı UUID yazılıysa** açılır. Ancak bu eşleşme **Vercel Production panelinden doğrulanmadı** — bu turda panel açılmadı. Tek risk budur ve tek bir deploy ile kapanır.

### 1.3 Erişim haritası — Super Admin gerçekte nereye giriyor?

**Kenar (edge) katmanı:** `export const auth = "admin"` türü 3 rota + 3 sayfa:

| Yüzey | Dosya | Durum |
|---|---|---|
| `/admin` (konsol) | `app/(kernel)/admin/page.tsx` | ✅ açık — fiyat/huni/GA4/denetim odaları |
| `/admin/catalog` (fiyat + yayın + satış kapısı) | `app/(kernel)/admin/catalog/page.tsx` | ✅ açık |
| `/admin/curriculum-revisions` | `app/(kernel)/admin/curriculum-revisions/page.tsx` | ⚠️ **boş kabuk** — "Müfredat revizyon kuyruğu kapalı" |
| `PATCH /api/admin/catalog` | `app/api/(kernel)/admin/catalog/route.ts` | ✅ çalışır — yalnız `price_catalog_decision_ledger` yazıyor (tablo var) |
| `PATCH /api/admin/catalog/publish` | `.../publish/route.ts` | ❌ **F-03: `$transaction` içinde `super_admin_audit_logs`'a yazıyor; tablo yok → işlem geri alınır → 500** |
| `GET /api/admin/funnel` | `.../funnel/route.ts` | ✅ açık |
| `GET/PATCH /api/admin/curriculum-revisions` | — | ❌ `closed` (410) |
| `/cuzdan`, `/pasaport`, `/profil`, `/dashboard`, `/career` | `(kernel)` grubu | ✅ oturumlu erişim |

**Sonuç: "TÜM modül, alan ve fonksiyonlara tam erişim" iddiası bugün KARŞILANMIYOR.** Sebep yetki kısıtı değil, **ürün yüzeyi eksikliği**. Super Admin şunları yapamaz:

1. Kullanıcı listelemek / aramak / askıya almak (Supabase Dashboard'a mahkûm).
2. Sipariş (`payment_orders`) ve anomali (`payment_anomalies`) görmek — yalnız CLI script'i var (`ops:list-paytr-pending`, `ops:list-payment-anomalies`).
3. Kart iadesi (`wallet_card_refunds`) başlatmak/görmek.
4. Denetim günlüğünü okumak (`super_admin_audit_logs` yazılacak ama **UI yok**, tablo da yok).
5. Müfredat revizyon kuyruğunu yönetmek (410).
6. Junior profil/paket denetlemek, veli rıza kaydı görmek.
7. Sertifika iptal etmek — yalnız `ops:revoke-academy-certificate` CLI.
8. Oda bayraklarını panelden çevirmek — yalnız Vercel env + `ops:super-admin-room-flag` CLI.

### 1.4 Tespit edilen yetki kusurları ve riskler

**R-01 (Orta) — Kenar katmanında "e-posta doğrulandı" varsayımı.**
`lib/kernel/security/edge-jwt.ts:275-290`: token `email_confirmed_at`/`confirmed_at`/`email_verified` taşımıyorsa ve adres **kanonik Super Admin kutusuysa** `"jwt:verified"` uyduruluyor. Bu, "doğrulanmış e-posta yoksa admin yoktur" kuralını kenarda deler. Gövde (`getUser`) gerçek değeri okuduğu için nihai karar güvenli kalır, ama **savunma derinliği tek katmana düşer**. Kanonik adres dışındaki kullanıcılarda bu yedek yok — asimetri kasıtlı olsa da belgelenmeli.

**R-02 (Orta) — Admin yazma yolu denetim günlüğüne bağlı, günlük yok.**
`writeSuperAdminAudit` "yazamazsam işlemi geri al" davranışını `prisma-course-publish.ts` içinde **transaction içinde** uyguluyor. Tablo gelene kadar yayın işlemi tamamen kırık. Bu doğru bir güvenlik duruşu (denetimsiz yazma yok) ama **dağıtım sırası hatası**: migrasyon, kodla aynı deploy'da uygulanmalı.

**R-03 (Düşük) — Admin sayfaları "yumuşak 403".**
`/admin` yetkisiz oturuma `Forbidden` bileşeni basıyor; HTTP 200 dönüyor. API'ler 403 dönüyor (doğru). Sayfa düzeyinde 200 dönmesi, izleme/uyarı sistemlerinde "erişim denemesi" sinyalini zayıflatır.

**R-04 (Düşük) — `admin-*` bileşenlerinin bir kısmı test-only.**
`admin-audit-chambers`, `admin-confirm-dialog`, `admin-course-publish-switch` yalnız birer sayfada/testte referanslı. İşlevsel, ama ürün yüzeyi genişlemedikçe "ölü ağırlık" sayılabilir.

**R-05 (Yapısal) — Super Admin yetkisi "rol" değil "ortam sırrı".**
`SUPER_ADMIN_USER_ID` değişince yetki el değiştirir; ikinci bir admin **açılamaz** (tasarım gereği). Ekip büyüdüğünde bu model tıkanır. Bugün tek kişilik operasyon için doğru, 3+ operatör için yetersiz. Bu bir hata değil, **ölçek sınırı** — Faz 02/03 kararı olarak not edilmeli.

---

## ADIM 2 — CANLI ORTAM & PAYTR ÖDEME ALTYAPISI

### 2.1 Mimari: tek ağız, tek defter

PayTR entegrasyonu **doğru kalıpta** kurulmuş. Özet akış:

```
[Kullanıcı] /api/wallet/top-up (POST, session, Idempotency-Key)
   → merchantOid = sha256("walletTopUp:user:key")      (çift tıklama ikinci emir doğurmaz)
   → payment_orders PENDING  (consentVersion + iki rıza tiki SATIRDA mühürlü)
   → PayTR get-token (HMAC: id+ip+oid+email+amount+basket+... + salt)
   → iFrame / pasaport URL

[PayTR] POST /api/payments/webhooks/paytr   (kanonik; /api/paytr/callback aynı handler'ı re-export eder)
   → IP allowlist (opsiyonel) → HMAC doğrula → tutar eşleşmesi
   → $transaction: FOR UPDATE payment_orders + ledger CREDIT (idempotency unique) + PAID + CLEARED
   → notifyAcademyLicenseHook / notifyJuniorLicenseHook
```

**Doğru yapılmış olanlar (kanıtlı):**

| Kontrol | Kanıt |
|---|---|
| Tek CREDIT ağzı | `app/api/paytr/callback/route.ts` yalnız `export { GET, HEAD, POST } from ".../webhooks/paytr/route"`; `callback-guard.ts` yasak yolları listeler ve testle kilitler |
| HMAC doğru formül | `merchant_oid + merchant_salt + status + total_amount`, `HMAC-SHA256(key)` → base64, `timingSafeEqual` |
| `+` → boşluk bozulması düzeltilmiş | `normalizePaytrPostedHash` |
| Boş gövde yoklaması CREDIT yazmaz | `isPaytrNotificationProbe` → düz metin `OK`, 200 |
| Başarısız imza 403 (PSP yeniden dener) | `paytrUnverifiedNotificationStatus` |
| Tutar uyuşmazlığında CREDIT yok, anomali yazılır | `webhook-settle.ts:124-133` |
| Anomali yazılamazsa 5xx (ACK verilmez) | `route.ts:210-212` (`persist_failed` → `paytrRetry`) |
| Aynı `merchant_oid` ikinci kez bakiye değiştirmez | `CLEARED` kısa devre + `ledger_entries.idempotency_key` unique (`wallet-top-up:{oid}`) |
| FAILED → geç ödeme kurtarma | `markPaid` `status IN (PENDING, FAILED)` CAS |
| Üretimde sandbox/mock yasak (fail-closed) | `assertPaytrProductionSafety` throw |
| Üretimde `user_ip` loopback/özel IP reddi | `assertPaytrLiveUserIp` |
| Canlı yayın kapatmada webhook 503 (CREDIT yok, retry) | `paytrLiveShutdownResponse` |
| Akademi lisansı K1: satış kapısı ödeme sonrası yeniden sorulmaz | `paytr-license-bridge.ts:76-82` |
| Yetersiz bakiyede lisanssız kredi karta iade denenir | `register-paytr-license-hook.ts:31-47` |

**Canlı veri durumu (salt okunur):**

| Ölçüm | Değer |
|---|---|
| `payment_orders` | 11 CLEARED · **16 FAILED** · **0 PENDING** |
| `wallet_card_refunds` | 2 SUCCEEDED · 4 FAILED |
| `payment_anomalies` | **0** (hiç anomali yazılmamış — temiz geçmiş) |
| `ledger_entries` | 26 satır |
| **Cüzdan ↔ defter sapması** | **0** (`SUM(dir) = wallets.amount_minor` her satırda tuttu) |
| `academy_purchases` | 15 SETTLED (9'u `sa_grant` — sıfır harçlı Super Admin bağışı) |
| `ops:audit-academy-ledger` | 6 akademi DEBIT **eşli**, hazine 6 CREDIT / 534.000 kuruş |

> **Not:** 16 FAILED sipariş terk edilmiş/reddedilmiş denemelerdir; hiçbiri CREDIT doğurmadı. Bu sayı "kötü" değil, **fail-closed'un çalıştığının kanıtıdır**.

### 2.2 Ödeme sonrası yetkilendirme zinciri — kritik bulgu

Zincir şu sırayla ilerliyor:

```
CLEARED → CREDIT (cüzdana dış para)
        → akademi ise: fiyat kilidi + DEBIT + academy_purchases SETTLED
        → junior ise:  DEBIT + junior_subscriptions ACTIVE (1 yıl)
```

Yani **kart tahsilatı önce cüzdana CREDIT, sonra lisans için DEBIT** olarak yazılıyor. Muhasebe açısından tutarlı (tek defter, tek bakiye SSOT), ama `clearing.ts:118` sabit etiketi **"Cüzdan yükleme"** — akademi lisansı siparişleri de bu etiketle CREDIT alıyor. Sonuç: defterde "cüzdan yükleme" ile "kurs satışı" ayırt edilemiyor; ayrım yalnız `purpose` alanında. Bu, mutabakat ve raporlamada yanlış okumaya açık (**P2 — kozmetik değil, denetim izi**).

**Asıl kırık: valör (recovery) yolunda lisans kancası yok (F-05).**

```ts
// lib/kernel/payments/paytr/reconcile.ts:141-145, 167-171
if (order.status === "CLEARED") { await notifyAcademyLicenseHook(order); ... }
...
const result = await clearSuccessfulPaymentOrder(...);
await notifyAcademyLicenseHook(result.order);
await notifyJuniorLicenseHook(result.order);
```

`notify*` çağrıları **global bir değişkene** bakıyor (`academy-license-hook.ts:9` — `let hook = null`). Kayıt yalnız iki yerde yapılıyor:
- `app/api/(kernel)/payments/webhooks/paytr/route.ts:33-34`
- `app/api/(kernel)/jobs/inngest/route.ts:11-12`

Buna karşılık `reconcilePaytrPaymentOrder` şu üç yoldan çağrılıyor:
1. Inngest `paytr-clearing-single` → **kayıt var** (jobs/inngest rotası) ✔
2. `app/api/(kernel)/cron/paytr-reconcile/route.ts` → **kayıt YOK** ❌
3. `scripts/ops-reconcile-paytr-pending.ts --apply` → **kayıt YOK** ❌

**Etki:** Webhook düşmediği için valörden kurtarılan bir akademi siparişi **CLEARED olur, para cüzdana geçer, ama kurs açılmaz.** Kullanıcı parayı ödemiş, lisansı yok. Sonraki bir webhook/Inngest tekrarı `status === "CLEARED"` dalına girip kancayı çağırdığı için **kendi kendini onarır** — ama bu onarım bir sonraki tetiklemeye bağlı. İki sonuç:
- Kullanıcı en az bir tur (30 dk – 24 saat) lisanssız kalır.
- Hiç tetikleme gelmezse kalıcı kalır.

**Bu, A2/A5 (dürüst durum, sahte bakiye yasağı) ruhuna aykırı düşen tek gerçek akış kusuru.** Faz 02'nin birinci maddesi olmalı.

### 2.3 Ödeme altyapısındaki diğer zayıflıklar

| # | Bulgu | Etki | Önem |
|---|-------|------|------|
| P-01 | `vercel.json`'da `crons` yok → cron rotası hiç çalışmaz (F-04) | Valör yedeği fiilen **Inngest'e bağlı**; Inngest anahtarı yoksa hiç yedek kalmaz | **P1** |
| P-02 | `INNGEST_EVENT_KEY`/`SIGNING_KEY` yoksa webhook clearing hatasında `503 deferred_unacked` | Kabul edilebilir (PSP retry) ama kuyruk yok, dead-letter yok, uyarı yok | P1 |
| P-03 | `isPaytrClearanceEvent` / `verifyPaytrClearanceBoundHash` hiç çağrılmıyor | Ölü kod; "iki farklı HMAC doğrulama var" yanılsaması | P2 |
| P-04 | Panel alias'ta IP allowlist ihlali yalnız `warn` log + HMAC'a devam | Kasıtlı (PayTR panel testi kilitlenmesin) ve HMAC yine zorunlu; ama saldırı yüzeyi genişliği belgelenmeli | P2 |
| P-05 | HMAC uyuşmazlığında **hesaplanan hash** log'a basılıyor (`webhook.ts:341-358`) | Sır sızdırmaz ama gereksiz; log'a erişen saldırgan doğru hash'i öğrenip **replay** edebilir (aynı `merchant_oid` zaten CLEARED kısa devrede, yine de gereksiz risk) | **P1** |
| P-06 | Junior lisansında `cardLast4: "0000"`, fatura alanları sabit `"Veli"` | Fatura/makbuz verisi uydurma; A5 "gerçek neyse o" ilkesine aykırı | P2 |
| P-07 | Kredi iadesi (`wallet_card_refunds`) 4 FAILED kayıt, otomatik yeniden deneme yok | Operatör manuel müdahalesi gerekir; uyarı mekanizması yok | P2 |
| P-08 | Anomali tablosu var, **hiçbir zaman uyarı üretmiyor** (yalnız `ops:list-payment-anomalies` elle) | Nakit anomalisi sessizce birikir | P2 |
| P-09 | `PAYTR_WEBHOOK_IP_ALLOWLIST` boş → yalnız HMAC | Doğru varsayılan (Cloudflare/Vercel XFF spoof'u engellenmiş); ama üretimde resmi CIDR birleşimi de devre dışı kaldığı için "savunma derinliği" tek katman | P3 |
| P-10 | `refundUnusedWalletBalanceForUser` denetim satırını transaction **dışında** yazıyor | İade başarılı + denetim başarısız olursa yalnız `warn` log; iz kaybı | P3 |

---

## ADIM 3 — DOSYA TEMİZLİĞİ VE TEK DOĞRU KAYNAK

### 3.1 Hacim tablosu (ölçüldü)

| Alan | Dosya | Boyut | Git'te mi | Değerlendirme |
|---|---|---|---|---|
| `media-bake/` | 891 | **6.324 MB** | ❌ (ignore) | TTS/ham WAV fırın önbelleği. Git dışı ✔ ama diskte 6.3 GB |
| `public/` (toplam) | 530 | **1.614 MB** | kısmen (221) | Vercel paketine giren **55.6 MB** ✔ |
| `└ public/media/junior/` | 309 | **1.558 MB** | ❌ (R2'de) | Doğru: CDN'e taşınmış, yalnız yerel yedek |
| `apps/rail-is/` | 20.682 | 280 MB | kısmen | %99 `node_modules` |
| `packages/` | 437 | 7.9 MB | ✅ | `junior-content` 406 dosya |
| `lib/` | 1.065 | 5.8 MB | ✅ | ~102 bin satır (junior 30.2k · academy 34.9k · kernel 25.9k) |
| `generated/` | 48 | 4.0 MB | ❌ | Prisma çıktısı, doğru yerde ignore |
| `tests/` | 510 | 3.3 MB | ✅ | 2.009 test |
| `archived/` | 279 | 1.6 MB | ✅ | 410 envanteri |
| `components/` | 231 | 1.6 MB | ✅ | |
| `scripts/` | 120 | 1.2 MB | ✅ | **çok kalabalık** |
| `docs/` | **1** | ~48 KB | ✅ | **boşalmıştı (F-07); bu raporla yeniden doğdu** |
| `.tmp/` | 14 | 0.3 MB | ❌ (ignore) | Operatör kalıntısı (149 KB vitest çıktısı dâhil) |

Toplam kaynak: **1.988 dosya / 285.921 satır** (app + components + lib + packages + tests + scripts).

**En büyük dosyalar (god-file adayları):**

| Satır | Dosya |
|---|---|
| 2.365 | `lib/kernel/http/v1-contract.ts` |
| 2.009 | `lib/academy/cinema-cue-catalog.ts` |
| 1.850 | `scripts/ops-migrate-lib.ts` |
| 1.514 | `components/junior/activity-rail.tsx` |
| 1.432 | `scripts/generate-academy-lesson-audio.ts` |
| 1.177 | `lib/junior/service.ts` |
| 1.105 | `components/academy/curriculum-player.tsx` |

### 3.2 KESİN SİLİNECEK / taşınacak (kanıtlı ölü)

| Hedef | Kanıt | Aksiyon |
|---|---|---|
| `middleware/` (boş klasör) | 0 dosya; kenar `proxy.ts` | **Sil** (F-11) |
| `lib/kernel/env.ts` | Zod env şeması; **0 gerçek importer**. Ama `tests/kernel/env-example-surface.test.ts:34-45` bu dosyayı `.env.example` anahtar eşliği sözleşmesi olarak okuyor. | **Silme.** Ya `.env.example` eşliğini `verify:*` kapısına taşı ve dosyayı sil, ya da adını `env-contract.ts` yapıp gerçekten kullan. Bugünkü hâli "yalnız test için yaşayan kod" |
| `components/shell/frozen-room-gone-page.tsx` | Canlı 410 `lib/kernel/http/frozen-410-html.ts` ile basılıyor. Bu dosya yalnız `archived/app/**` ve `tests/kernel/circuit-breakers-surface.test.ts:88` referanslı. | **Sil** + o tek assertion'ı kaldır — 410 için tek uygulama kalsın |
| `lib/kernel/payments/paytr/webhook.ts:56, 361-385` (`buildPaytrWebhookClearanceBoundToken`, `verifyPaytrClearanceBoundHash`, `isPaytrClearanceEvent`) | 0 çağrı (yalnız tanım) | **Sil** ya da clearance akışını gerçekten bağla |
| `lib/kernel/payments/paytr/callback-guard.ts` (`paytrUnverifiedNotificationStatus`, `inspectPaytrCallbackAppRoutes`) | Yalnız test referansı; handler aynı eşlemeyi satır içi uyguluyor (`route.ts:189`) | Testle birlikte sil **veya** handler'ı bu fonksiyona bağla — ikinci SSOT kalmasın |
| `lib/kernel/payments/prisma-reconciliation-ports.ts` | Yalnız `inngest.ts` | Kalabilir (gerçek kullanım var) |
| `.tmp/*` (14 dosya) | Operatör kalıntısı | Sil / `.gitignore` zaten var, disk temizliği |
| `tsconfig.tsbuildinfo` (723 KB) | Ignore'lu, diskte | Sil |

### 3.3 İKİNCİL / mükerrer uygulama (tek doğruluk kaynağı ihlali)

| Mükerrerlik | Ayrıntı | Risk |
|---|---|---|
| **410 yüzeyi iki kez** | `lib/kernel/http/frozen-410-html.ts` (canlı) ↔ `components/shell/frozen-room-gone-page.tsx` (ölü, archived'ı besliyor) | Metin/CSS sapması; iki ayrı "kapalı oda" deneyimi |
| **Alias üç katman** | `next.config.ts` 301 → `app/verify/page.tsx` `permanentRedirect` → aynı hedef | 3 yerde aynı kural; biri değişirse sessiz sapma |
| **`/p` alias'ı** | Aynı desen: `next.config` 301 + `app/(public)/p/page.tsx` redirect | Aynı |
| **`/academy/courses/[slug]`** | `next.config` 301 + `app/academy/courses/[slug]/page.tsx` redirect (yorumda "bilinçli" yazıyor) | Belgelenmiş, kabul edilebilir |
| **`catalog-ids` iki ev** | `packages/kernel/src/catalog-ids/*` (gerçek SSOT, 5 dosya) ↔ `lib/kernel/catalog-ids/*` (yalnız `school-segments` + barrel) | **Aynı isim, iki yer.** Yeni geliştirici yanlış yeri düzenler |
| **`money` shim'leri** | `lib/kernel/money/{amount-minor,currency,insufficient-balance}.ts` = tek satır `export * from "@yetkin/kernel/..."` | Doğru desen (tek kaynak) ama 3 dosya gürültü; `format.ts` gerçek |
| **Junior içerik iki kopya** | `lib/junior/{content,quiz}/**/N.ts` (yazar) → `packages/junior-content/{topics,quiz}/*.json` (üretilen) | Kasıtlı tek yönlü; ama iki kopya repoda. `export:junior-content` + `quiz-export-guard` testi disiplini tutuyor ✔ |
| **`route-auth-map.json` (generated) + `route-auth-map.ts`** | Aynı veri iki formatta | Prebuild `--check` sapmayı yakalıyor ✔ |

### 3.4 Git çalışma ağacı — acil temizlik (F-08)

**204 değişiklik var (bu rapor dâhil 205), bunların bir kısmı "ürün" bir kısmı "artık":**

- **Commit edilmesi gereken 30 yeni dosya:** `lib/kernel/admin/{audit-log,prisma-super-admin-audit,room-flag-audit}.ts`, `lib/academy/license-price-seal{,-read}.ts`, `prisma/migrations/20261102160000_super_admin_audit_log/`, `scripts/{dron-new-lib,typecheck-clients,ops-super-admin-room-flag*}.ts`, 7 test.
- **`archived/docs_history/`'a yeni eklenen 12 dosya** (`008…015`, `*_ADIM_2..4`, `TESPIT_RAPORU_ADIM_1`) — untracked.
- **32 silinmiş dosya** — 13'ü `docs/` geçmiş raporu (F-07), 7'si freelancer bileşeni, 4'ü `catalog-ids` (artık `@yetkin/kernel/catalog-ids`'te), artı `lib/freelancer/released-proofs.ts`, `lib/junior/lesson-engine/modules/mat-1-to-5.ts`, `lib/young/micro-lesson.ts`, `middleware/api-auth.ts`, `scripts/archive/bake-office-ai-01-sealed-pack.ts`, `scripts/generate-brand-icons.ts`, `scripts/write-pilot-academy-seed-sql.ts`, `components/shell/.gitkeep`.

**Kırık iz (dangling):** `lib/young/` klasörü **yok** ama `app/young/page.tsx` duruyor. Sayfa yalnız `school-segments` kullanıyor, derleme kırılmıyor; oda bayrağı `kapali: true` olduğu için `/young` 404 veriyor. Yani **yarım sökülmüş oda**: veri modeli silinmiş, kabuk kalmış.

**Kırık belge bağlantısı:** `.system_docs/README.md:24` → `docs/archive/PLATFORM_DEGERLEME.md` **mevcut değil**.

### 3.5 CI kırmızı (F-01)

```
✖ 10 problems (1 error, 9 warnings)
lib/academy/cinema-cue-catalog.ts:88  error  'ACADEMY_KVKK_DELETE_BUTTON_SUMMARY' is defined but never used
```

`.github/workflows/ci.yml:25` `npm run lint` koşuyor → **CI bugün kırmızı**. Düzeltme tek satır: kullanılmayan importu kaldırmak (sabit başka yerde de kullanılıyor: `kvkk-workspace.ts`, `lesson-practice.ts`, `office-ai-guide-preview.tsx`).

### 3.6 Bilgi çakışması yaratan belgeler

| Çelişki | Ayrıntı |
|---|---|
| Cron iddiası ↔ gerçek | `cron/paytr-reconcile/route.ts:20-30` "Vercel Cron valör yedeği… Vercel proje cron'u" der; `vercel.json`'da cron yok |
| "Tek Node next start" ↔ Vercel | `ops-runtime-readiness-lib.ts:457` "Faz 1: tek Node next start. Vercel/Cloud çok instance sessiz delik" der; ama `.vercel/project.json` var, `vercel.json` `fra1` node bölgesi tanımlı, `.env.local`'da `VERCEL_OIDC_TOKEN` dolu |
| `DIRECT_URL` sağlığı | `ops:runtime-readiness` → `DIRECT_URL host=forbidden-pooler port=5432 transaction-mode-YASAK direct-fail`. Diskteki `DIRECT_URL` pooler host'unda; runbook Direct `db.<ref>.supabase.co:5432` ister. **Migrasyon bu dosyayla pooler fallback'ine düşer** |
| `TRUSTED_PROXY_HOPS=1` ↔ reçete 2 | Cloudflare+Vercel için 2 olmalı; readiness her turda uyarı basıyor |
| `PAYTR_SANDBOX="0"` + canlı üçlü ↔ dev makinesi | `isPaytrSandboxEnabled` false → çalışma kipi **live**; `isPaytrDevLiveCheckoutBlocked` checkout'u kilitliyor ✔ (iyi) ama sırlar dev makinede |
| `docs/` "günlük rapor alanı" ↔ boş | `ANAYASA.md` "Günlük rapor `/docs`" der; klasör bu rapora kadar **tamamen boştu** (F-07) |

---

## ADIM 4 — MİMARİ UYUMLULUK (Amiral Gemi + Sürü Dron)

### 4.1 Anayasa ne diyor, kod ne yapıyor

`ANAYASA.md` **B1** terminolojiyi kesin bağlamış:

> «Amiral Gemi + Sürü Dron» ve «Core + Micro-Apps / Shared Kernel» eski anlatım dilidir; ayrı bir mimari tarif etmez. Amiral Gemi = Pragmatik Monolit. Sürü Dron = monolit içindeki kayıtlı yetenek ve oda. Shared Kernel = `@yetkin/kernel`.

**Kod bu tanıma büyük ölçüde uyuyor:**

| Beklenti | Gerçek | Uyum |
|---|---|---|
| Tek gövde, tek DB, tek kimlik | Next.js App Router + tek Prisma + Supabase Auth | ✅ |
| İnce sözleşme paketi | `packages/kernel` — 23 dosya: money, catalog-ids, v1 zarf, hop meta, crypto | ✅ ama **çok ince** (aşağıda) |
| Dron = kayıt + bayrak + hop | `lib/dronlar/kayit.ts` — 6 satır (4 vitrin + junior + young), `DronBayrakları.isKapali`, `DRON_<ID>_OPEN` | ✅ |
| Tek native istemci, ayrı deploy yok | `apps/rail-is` (Expo), `@yetkin/kernel` tüketir, `/api/v1` zarfı | ✅ ama **sızıntı var** (W-02) |
| API-First | `/api/v1` = kenarda rewrite + hop allowlist (runbook 33 kayıt; meta dosyasında 34 `id:` satırı), kanonik handler'a soyulur (**kopya ağaç yok**) | ✅ örnek kalitede |
| Kernel ↛ dikey duvarı | eslint `no-restricted-imports` + `verify:boundaries` (kernel↛dikey, oda↛oda, kariyer/freelancer↛akademi, tablo sahipliği, hop uyumu, katalog ON CONFLICT…) | ✅ |
| Yeni yetenek = checklist | `npm run dron:new` → kayıt + taslak şema + hop + Expo kabuğu, **kapalı doğar** | ✅ |

Bu, "micro-app'leri ayrı repo/ayrı DB'ye böl" modelinden **bilinçli olarak farklı** ve doğru bir tercih. Ayrı repo/ayrı DB ile `users`/`wallets`/`ledger_entries`/`payment_orders` en az iki yerde, iki auth ve iki mutabakat olurdu — A1 (tek defter) ihlali.

### 4.2 Zayıf halkalar (dürüst liste)

**W-01 (Yapısal) — "İnce kernel" iddiası gerçek değil.**
`packages/kernel` 23 dosya; ama `lib/kernel` **229 dosya / 25.910 satır** ve içinde payments (30 dosya), escrow, ledger, pricing, telemetry, AI, identity, notice, proof, compliance var. Yani **iş kurallarının çekirdeği `lib/kernel`'de**, sözleşme paketinde değil. Pratik sonucu: ikinci bir istemci (web dışı) yalnız `@yetkin/kernel` ile **hiçbir ticari karar veremez**; her kural için ya web API'sine gitmeli ya `lib/`'e sızmalı. Bu, "Sürü Dron"un bugün **tek dron** (web) olmasının teknik sebebi.

**W-02 (Somut ihlal) — Native istemci `lib/academy`'ye doğrudan bağlı.**

```json
// apps/rail-is/tsconfig.json
"include": [
  "../../packages/kernel/src/**/*.ts",
  "../../lib/academy/punchcard-from-sealed-json.ts",
  "../../lib/academy/lesson-audio-timings/**/*.json",
  "../../lib/academy/lesson-cues/**/*.json"
]
```

```js
// apps/rail-is/metro.config.js
const academyLibRoot = path.resolve(projectRoot, "../../lib/academy");
config.watchFolders = [..., academyLibRoot];
```

Bu, B1'in "ayrı deploy yok ama paket üzerinden konuşur" kuralını **deliyor**: native derleme web uygulamasının `lib/` ağacına bağlı. `lib/academy` yeniden düzenlenirse native build kırılır ve bunu **hiçbir test yakalamaz** (native CI yalnız `tsc --noEmit`).

**W-03 (Ölçek bloğu) — Süreç-içi hız tavanı (F-06).**
Vercel serverless = çok instance. `createInMemoryRateLimitPort` her instance'ta ayrı sayaç → gerçek limit ≈ `limit × instance sayısı`. `ops-runtime-readiness` bunu doğru tespit ediyor ama **engelleyici değil** (`extraProductionBlocks` içinde yok). Yani bugün üretime çıkılabilir ve limit sessizce delinebilir.

**W-04 (Dayanıklılık) — Kuyruk tek sağlayıcıya bağlı.**
Inngest anahtarı yoksa: `canSendInngestEvents()` false → webhook clearing hatasında 503. Doğru (fail-closed) ama **yedek yok, dead-letter yok, uyarı yok**. Cron da tanımlı değil (F-04). Sonuç: "ödeme geldi, lisans açılmadı" durumunda **kimse uyarılmıyor**.

**W-05 (Veri katmanı) — `FOR UPDATE` + transaction pooler.**
`payment_orders` kilidi `$transaction` içinde alınıyor; Prisma adapter `max=1` ile aynı TCP'de kaldığı sürece doğru. Ama pooler `:6543` üzerinde eşzamanlı yük arttığında bağlantı havuzu tükenirse kilit davranışı hassas. Bugün hacim düşük (27 sipariş); 10× büyümede ilk kırılacak yer burası.

**W-06 (Bakım) — `scripts/` 120 dosya, ayrım yok.**
Runtime-kritik (`ops-migrate.ts`, 1.850 satırlık `ops-migrate-lib.ts`) ile tek seferlik probe/bake (`align-ec102-sentence-clock.ts`, `neutralize-junior-covers.ts`, `strip-junior-orphan-draw-cue.ts`) aynı düzeyde. Operatör hangi script'in canlıya dokunduğunu ezberlemek zorunda.

**W-07 (Kapsam) — Junior gövdenin %30'u.**
`lib/junior` 376 dosya / 30.193 satır (+ `packages/junior-content` 406 dosya + `media-bake/junior` 367 dosya). Junior zaten **fiilen ayrı bir dron** — ama `DRON_KAYIT`'te tek satır ve `vitrin: false`. En olgun "micro-app" bu; ayrıştırma denemesi buradan başlamalı.

**W-08 (Gözlemlenebilirlik) — Log var, metrik yok.**
`logEvent` JSON satırları üretiyor (iyi). Ama metrik/alert/panel yok: anomali sayısı, PENDING yaşı, lisans kancası başarısızlığı, iade FAILED sayısı. Hepsi **elle CLI** ile bakılıyor.

### 4.3 Mimari skoru

| Boyut | Puan | Gerekçe |
|---|---|---|
| Sınır disiplini (kernel ↛ dikey, oda ↛ oda) | **9/10** | eslint + `verify:boundaries` gerçekten çalışıyor, sapma CI'ı kırıyor |
| API-First / sözleşme | **9/10** | `/api/v1` rewrite + hop allowlist, kopya ağaç yok, `openapi-v1.json` üretiliyor |
| Tek doğruluk kaynağı (para/defter) | **9/10** | Tek defter, `amountMinor`, append-only trigger'lar, drift 0 |
| Dron genişletilebilirliği | **7/10** | `dron:new` iskeleti var, ama gerçek ikinci istemci için çekirdek iş kuralları pakette değil |
| Native istemci bağımsızlığı | **4/10** | `apps/rail-is` → `lib/academy` doğrudan bağımlılık (W-02) |
| Yatay ölçek hazırlığı | **4/10** | Süreç-içi rate limit, cron yok, kuyruk tek sağlayıcı |
| Gözlemlenebilirlik | **5/10** | İyi yapılandırılmış log; metrik/alert yok |
| Kod hijyeni | **6/10** | tsc/tests yeşil; lint kırmızı, 204 kirli değişiklik, god-file'lar |
| **Ağırlıklı** | **6.6/10** | Sağlam temel, **işletme katmanı eksik** |

---

## ADIM 5 — TARAFSIZ DANIŞMANLIK & STRATEJİ

### 5.1 "Sen olsaydın ne yapardın?"

Sıralamayı **"para kaybettiren / kullanıcıyı mağdur eden → sonra hız → sonra estetik"** ekseninde yapardım. İlk 48 saat, ilk 2 hafta, ilk 60 gün:

**İlk 48 saat (pazartesi sabahı):**

1. **Lint'i yeşile al** (F-01). Tek satır. CI kırmızıyken hiçbir şeyi güvenle birleştiremezsin.
2. **`SUPER_ADMIN_USER_ID`'yi Vercel Production panelinde doğrula.** Kod fail-closed; ama doğrulanmamış eşleşme = "admin var mı yok mu bilmiyoruz". 5 dakika.
3. **`DIRECT_URL`'i runbook'taki biçime çek** (`db.<ref>.supabase.co:5432`). Şu an `direct-fail`; migrasyon pooler fallback'ine düşüyor. Migrasyonu pooler üzerinden çalıştırmak, ileride kilit/DDL sürprizlerinin kaynağı.
4. **İki bekleyen migrasyonu uygula** (F-02). Sıra: `junior_pilot_grade_six` → `super_admin_audit_log`. Uygulanmazsa (a) admin yayın **kırık**, (b) junior profil CHECK'i hâlâ 5–12 bandında (canlıda 2 profil var, grade 6 — risk düşük ama şema kodla uyuşmuyor).
5. **Valör yolunda lisans kancasını kaydet** (F-05). En küçük doğru düzeltme: kancaları `reconcile.ts`'in kendisinde **tembel** yükle (dinamik import + idempotent register) ya da cron/CLI yolunda register et. İkincisi kernel↛dikey duvarını esnetir; birincisi daha temiz: `paytr-clearing-single` zaten yapıyor, aynı kompozisyonu cron'a kopyala.
6. **`vercel.json`'a `crons` ekle** (F-04) — ama önce Vercel'in sub-daily cron'u hangi planda kabul ettiğini doğrula (kod yorumu "plan kısıtı" diyor). Alternatif: cron'u dışarıdan (GitHub Actions / Uptime servisi) `Authorization: Bearer` ile vur.

**İlk 2 hafta:**

7. **Hız tavanını Redis REST'e taşı** (`RATE_LIMIT_REDIS_REST_URL` + `_TOKEN`) veya hız tavanını **tek instance'a sabitle** (Vercel'de `maxConcurrency=1`, ya da `next start` tek node). Bugünkü hâli "sessiz delik".
8. **`/docs`'u geri getir** (F-07) — 13 rapor git geçmişinden çıkarılıp `archived/docs_history/`'a taşınmalı; `docs/` bu raporla yeniden doğuyor. `.system_docs/README.md:24`'teki kırık bağlantıyı düzelt.
9. **Çalışma ağacını küçült** (F-08): 30 yeni dosyayı mantıklı 3 commit'e böl (denetim günlüğü / fiyat mührü / dron iskeleti), 13 docs silmesini geri al, `lib/young` yarım sökümünü **bitir** (kabuğu da sil) veya geri getir.
10. **Ölü kodu temizle:** boş `middleware/`, `lib/kernel/env.ts`, `frozen-room-gone-page.tsx`, clearance-bound HMAC dalı, `.tmp/*`.
11. **HMAC mismatch log'undan hesaplanan hash'i çıkar** (P-05).
12. **"Ödeme geldi, lisans yok" alarmı kur.** Basit ama kritik: her 15 dakikada `payment_orders CLEARED` ⋈ `academy_purchases/junior_subscriptions` eksik eşleşme sayısını ölç; >0 ise bildir. `ops:audit-academy-ledger` altyapısı hazır, sadece zamanlanmış değil.

**İlk 60 gün:**

13. **Super Admin'e gerçek operasyon konsolu** (F-10): kullanıcı arama/askıya alma, sipariş + anomali listesi, iade başlatma, denetim günlüğü okuma, sertifika iptal. Bugün bunlar CLI + Supabase paneli = **insan hatası yüzeyi**.
14. **Native bağımsızlığını düzelt** (W-02): `lib/academy`'deki 3 dosyayı `@yetkin/kernel`'e ya da yeni bir `@yetkin/academy-contract` paketine taşı; native `lib/`'e bakmasın.
15. **Gözlemlenebilirlik**: anomali/PENDING/kanca-başarısızlık metrikleri + alert.

---

### 5.2 Platform kurgusu doğru mu? Canlı yükü ve Sürü Dron'u taşır mı?

**Kısa cevap: Kurgu doğru. Taşır — ama bugünkü hâliyle değil.** Ölçü: mimari omurga (sınır disiplini, tek defter, API-First, dron kaydı) **olgun**; buna karşılık **işletme katmanı** (paylaşımlı hız tavanı, zamanlanmış kurtarma, gözlem, admin konsolu, istemci bağımsızlığı) **eksik**. Bölüm 4.3'teki ağırlıklı skor 6.6/10 bunu söylüyor: temel sağlam, kabuk yarım.

**Doğru olan (bunu değiştirme):**

- Monolit + ince sözleşme paketi tercihi, bu ürün için **tek doğru karar**. Servislere bölünseydi aynı `users`/`wallets`/`ledger_entries`/`payment_orders` tabloları en az iki yerde, iki auth ve iki mutabakat olurdu — tek nakit SSOT (A1) korunamazdı. Mikroservise geçiş burada **regresyon** olur.
- `/api/v1` rewrite + allowlist deseni: kopya handler ağacı yok, tek kanonik handler, hop sicili tek yerde (`RAIL_V1_HOPS_META`). Bu, "micro-app"lerin ileride **aynı omurgaya** bağlanmasının ön koşulu ve zaten kurulmuş.
- `dron:new` iskeleti: yeni oda **kapalı doğuyor**, bayrak + hop + şema otomatik. Disiplin koda gömülmüş.
- Değişmez defter: append-only trigger, `FOR UPDATE`, idempotency unique, drift 0. Para tarafı sağlam.
- Test disiplini: 2.009 test, 102 surface testi (mimari kuralları **test ile** kilitliyor). Bu, çoğu KOBİ ölçeğinde üründe yok.

**Taşımayacak olanlar (zayıf halkalar, önem sırasıyla):**

| Sıra | Zayıf halka | Ne zaman kırılır | Aciliyet |
|---|---|---|---|
| 1 | **Valör yolunda lisans kancası yok** (F-05) | İlk webhook kaçırmasında. Bugün toplam 27 siparişte bu yol hiç sınanmadı | **Şimdi** |
| 2 | **Cron tanımlı değil** (F-04) | Otomatik kurtarma hiç çalışmıyor | **Şimdi** |
| 3 | **Süreç-içi rate limit** (W-03) | İlk kötü niyetli trafikte / ilk 2 instance'ta | 2 hafta |
| 4 | **Native → `lib/academy` bağı** (W-02) | İlk `lib/academy` refactor'unda native build kırılır | 30 gün |
| 5 | **Çoklu admin yok** (R-05) | İkinci operatör işe alındığında | 60 gün |
| 6 | **Kuyruk tek sağlayıcı** (W-04) | Inngest kesintisinde ödeme akışı yavaşlar | 60 gün |
| 7 | **Gözlemlenebilirlik** (W-08) | Ölçekte "sessiz arıza" | 90 gün |
| 8 | **Pooler + `FOR UPDATE`** (W-05) | 10× hacimde | 6 ay |

**"Sürü Dron" gerçekten taşınır mı?** Evet, ama **doğru tanımla**: ayrı repo/ayrı DB değil, **monolit içinde bayraklı oda + `/api/v1` hop'u + `@yetkin/kernel` sözleşmesi**. Bugün bu modelde **1 gerçek dron var (web)**; `apps/rail-is` ikinci ama `lib/`'e bağımlı olduğu için **yarım dron**. Üçüncü bir istemci (ör. veli mobil uygulaması) bugün eklenirse aynı sızıntıyı miras alır.

**Kritik uyarı:** "Sürü Dron"u **ayrı servislere bölerek** ölçeklemeye çalışmak bu mimaride yanlış yön. Doğru ölçekleme: (a) tek gövdeyi yatay ölçekle (paylaşılan rate-limit + kuyruk + gözlem), (b) hop sicilini büyüt, (c) istemcileri pakete bağla. Bunu şimdi yapmazsan, 6 ay sonra "mikroservise geçelim" tartışması **tek defteri ikiye bölme** riskiyle gelir — A1 ihlali.

---

### 5.3 Bir sonraki adım (Faz 02) — doğrudan ne ele alınmalı

**Faz 02'nin tek konusu: "Ödeme → Yetki zincirinin kapanması ve dağıtımın dürüstleşmesi."**

Sıralı, ölçülebilir, her biri tek PR:

| Adım | İş | Çıkış kriteri (kanıt) |
|---|---|---|
| 2.1 | Lint'i yeşile al | `npm run lint` → 0 error |
| 2.2 | Bekleyen 2 migrasyonu uygula + `DIRECT_URL`'i runbook biçimine çek | `_prisma_migrations` 46/46, `finished_at NULL` = 0; `super_admin_audit_logs` var; `admin/catalog/publish` 200 |
| 2.3 | **Valör → lisans kancası** (F-05): cron + CLI yolunda kanca kompozisyonu | Test: `CLEARED` + kanca kayıtsız → lisans açılmıyor **kanıtlanır**; kayıtlı → açılıyor. Sonra ikisi de yeşil |
| 2.4 | **Cron'u gerçekten zamanla** (vercel.json `crons` veya dış tetikleyici) | Üretimde 30 dk'da bir 401/200 log satırı görünür |
| 2.5 | **"Ödeme geldi, lisans yok" alarmı** (`ops:audit-academy-ledger`'ın zamanlanmış hâli) | Eksik eşleşme > 0 iken bildirim |
| 2.6 | Rate limit'i paylaşımlı depoya taşı **veya** tek-instance'i zorla | `ops:runtime-readiness` → `rateLimitStore=redis-rest` |
| 2.7 | Çalışma ağacı hijyeni: 3 anlamlı commit + 13 docs geri + `lib/young` kararı + ölü kod silme | `git status` temiz; `docs/` bu raporla dolu |
| 2.8 | HMAC log'undan hesaplanan hash'i çıkar; clearance-bound ölü dalını sil | Kod incelemesi + `verify:paytr-reconciliation-seals` yeşil |

**Faz 02'ye SOKMA:** yeni özellik, UI yenileme, Junior içerik üretimi, Freelancer açılışı, mikroservis tartışması. Bunlar Faz 03+.

---

### 5.4 Gelecek MASTER PLAN (3–6 ay)

Ölçek hedefi: **tek gövde, N istemci, tek defter** — "Amiral Gemi + Sürü Dron"un bu mimarideki tek doğru karşılığı.

#### Ay 1 — "Zincir kapansın" (Faz 02)
- Ödeme → lisans → yetki zinciri uçtan uca kanıtlı (webhook + cron + CLI üç yolu da test).
- CI yeşil (lint + prebuild + test + native typecheck).
- Migrasyon borcu sıfır.
- Dağıtım dürüstlüğü: cron gerçekten çalışıyor, rate limit paylaşımlı, `DIRECT_URL` doğru.
- **Kapı:** Üretimde 1 hafta boyunca `CLEARED ⋈ lisans` eksik eşleşme = 0.

#### Ay 2 — "Operatör tek başına yetsin"
- Super Admin konsolu v1: kullanıcı, sipariş, anomali, iade, denetim günlüğü, sertifika iptal (hepsi UI'dan, CLI'sız).
- `super_admin_audit_logs` tüm idari eylemleri kapsar (bugün 4 eylem türü; iade/iptal/kullanıcı eylemleri eklenir).
- Denetim günlüğü okuma ekranı + dışa aktarma.
- **Kapı:** Bir nakit anomalisi tespit → iade → denetim izi, hepsi panelden, 10 dakikada.

#### Ay 3 — "İstemci bağımsızlığı"
- `apps/rail-is` → `lib/` bağımlılığını kes: `@yetkin/kernel`'e (veya `@yetkin/academy-contract`) taşı.
- Native CI'ya **gerçek build** ekle (bugün yalnız `tsc`).
- `dron:new` ile **kapalı** üçüncü istemci iskeleti (kanıt: checklist işliyor).
- **Kapı:** `apps/*/src` içinden `lib/`'e tek bir import yok (`verify:boundaries` yeni kural).

#### Ay 4 — "Ölçek provası"
- 10× sentetik yük: eşzamanlı checkout + webhook + valör; `FOR UPDATE`/pooler davranışı ölçülür.
- Kuyruk sağlamlaştırma: dead-letter + retry politikası + manuel replay aracı.
- Metrikler: PENDING yaşı, kanca başarı oranı, anomali sayısı, iade başarı oranı, p95 checkout.
- **Kapı:** Yük altında drift 0, kayıp lisans 0, p95 < hedef.

#### Ay 5 — "Sürü büyür"
- Junior'ı **gerçek dron** yap: `packages/junior-content` + `junior-graphic` zaten ayrı; hop sicili + bayrak + kendi CI'ı ile bağımsız sürümlenebilir hâle getir.
- Freelancer Faz 2 açılış kriterleri (Anayasa B5): split sözleşmesi, alt satıcı onboard, hop geri yazımı, kapalı test — **sadece** bunlar yeşilse bayrak açılır.
- **Kapı:** İki dron (web + native) aynı hop sicilini tüketiyor; hiçbiri `lib/` içine bakmıyor.

#### Ay 6 — "Kurumsal dayanıklılık"
- Çoklu operatör yetki modeli (rol/izin) — **A3 ve A1'i gevşetmeden**: yetki tablosu eklenir, ama `SUPER_ADMIN_USER_ID` kurtarma kapısı fail-closed kalır.
- Felaket senaryosu: DB restore tatbikatı (`ops:pg-backup-restore`), PayTR kesintisi, Inngest kesintisi, tek bölge kaybı.
- Runbook'lar koddan türetilir (drift testi).
- **Kapı:** RTO/RPO ölçülmüş ve yazılı.

#### Değişmeyecek 5 ilke (Master Plan boyunca)
1. Tek defter, tek `amountMinor` — mikroservis bahanesiyle bölünmez.
2. Fail-closed: bağlı olmayan kanal sahte onay basmaz.
3. Admin = ortam mührü + doğrulanmış e-posta + UUID eşleşmesi (gevşetilmez).
4. Yeni istemci = aynı `@yetkin/kernel` + aynı `/api/v1` hop sicili.
5. Sahte bakiye / sahte başarı yok.

---

## EK A — Bu turda koşulan komutlar ve sonuçlar

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit -p tsconfig.json` | ✅ hata yok |
| `npx vitest run` | ✅ **409 dosya / 2009 test geçti** (124 sn) |
| `npx eslint .` | ❌ **1 error, 9 warning** (F-01) |
| `npm run verify:api-auth -- --check` | ✅ 77 rota · session 48 / public 10 / closed 11 / cron 1 / admin 3 / webhook 4 |
| `npm run verify:prebuild` | ✅ 12 kapı yeşil |
| `npm run verify:boundaries` | ✅ kernel↛dikey, UI↛prisma, oda↛oda, katalog ON CONFLICT… |
| `npm run verify:no-secrets` | ✅ |
| `npm run verify:rls-status` | ✅ 38 tablo FORCE RLS + owner SELECT + kapsamsız deny |
| `npm run verify:public-size` | ✅ 55.6 MB (eşik 850 MB) |
| `npm run verify:paytr-reconciliation-seals` | ✅ 3 dosya / 22 test |
| `npm run ops:runtime-readiness` | ⚠️ `DIRECT_URL direct-fail`, `paytrAppUrl=localhost`, `trustedProxyHops=1`, `rateLimitStore=in-process` |
| `npm run ops:list-paytr-pending` | ✅ 0 PENDING |
| `npm run ops:audit-academy-ledger` | ✅ 6 DEBIT eşli · 15 purchase · 9 `sa_grant` |
| `npm run ops:ghost-wallet-holds` | ⛔ **çalışmadı**: "işlem havuzu (:6543 / pooler) üzerinden çalışmaz" — `DIRECT_URL` pooler host'unda olduğu için beklendiği gibi reddetti |

## EK B — Canlı şema durumu (salt okunur)

| Ölçüm | Değer |
|---|---|
| `public` tablo | 39 |
| `_prisma_migrations` | 44 kayıt · 0 unfinished · 0 rolled back |
| Diskte migrasyon klasörü | 46 → **2 bekliyor** |
| RLS boşluğu | yalnız `_prisma_migrations` (beklenen) |
| `auth.users` | 2 |
| `public.users` | 11 (1 hazine sentinel + 6 `closed.*@anon.yetkin.invalid` + 2 `t3.loop.*` test + 2 gerçek) |
| `auth.users` ↔ `public.users` sapması | **9 satır yalnız `public.users`'ta** (auth karşılığı yok) — hazine sentinel, 6 kapatılmış hesap, 2 lab testi. Zararsız, ama "11 kullanıcı" yanılsaması yaratır ve `auth.users`'ta karşılığı olmayan satırlar oturum açamaz |
| `junior_profiles` | 2 satır, hepsi `grade = 6`; CHECK hâlâ `grade BETWEEN 5 AND 12` (**kod `JUNIOR_PILOT_GRADE = 6` diyor, şema 5–12 diyor**) |
| `academy_courses` | yayında olanlar + fiyat kataloğu 17 satır aktif |
| Cüzdan ↔ defter drift | **0** |

---

## EK C — Bu raporun sınırları (dürüstlük)

1. **Vercel Production env okunmadı.** `SUPER_ADMIN_USER_ID`'nin üretimde aynı UUID olduğu **doğrulanmadı**. Kod fail-closed davranacağı için güvenlik açığı değil, **erişim riski**.
2. **Üretim veritabanının bu veritabanı olduğu varsayıldı.** `.env.local` barındırılan bir Supabase projesine bağlanıyor ve içinde gerçek müşteri nakit izi var (11 CLEARED sipariş, gerçek bir müşteri hesabı, 15 akademi satın alması). Üretimle aynı olduğu panelden teyit edilmedi.
3. **`npm run build` çalıştırılmadı** (uzun süreli; prebuild zinciri ayrıca koşuldu ve yeşil).
4. **`npm run test:pg` / `test:frozen` / `test:e2e` çalıştırılmadı.** Canlı suite (409 dosya) yeşil.
5. **`archived/`, `public/media/`, `media-bake/` içerikleri taranmadı** — yalnız hacim ölçüldü (kural gereği).
6. **Import grafiği statik tarandı.** Dinamik `import()` çağrıları (`export-junior-content.ts`, `bake-*.ts`) ayrıca elle doğrulandı; tam `knip`/`ts-prune` analizi koşulmadı.
7. **PayTR mağaza paneli açılmadı.** Bildirim URL'nin panelde `/api/paytr/callback` olarak kayıtlı olduğu doğrulanmadı — bu, canlı ödeme almanın **tek dış bağımlılığı** ve ilk kontrol edilmesi gereken şeydir.
