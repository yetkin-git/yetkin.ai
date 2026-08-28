# yetkin.ai İş (Diyar B) istemci sözleşmesi

Native ve ikincil istemcinin `/api/v1` ile konuşma kuralı. Anayasa: `.system_docs/ANAYASA.md`. Hop sicili: `lib/kernel/http/v1-contract.ts`. Bu belge yeni bir kimlik sistemi veya Prisma modeli açmaz. Mevcut gerçek: **Supabase Auth JWT**.

Mağaza / vatandaş markası `yetkin.ai`. Native paket adı `yetkin.ai-is`; dizin yolu `apps/rail-is` (operasyonel yol).

Ürün kodu bu dosyayı import etmez. Derleme beşlisi (`ANAYASA`, `MANIFESTO`, `OPS_RUNBOOK`, `STORAGE_CONTRACT`, `README`) durur; bu dosya dron/ikincil istemci ops belgesidir.

---

## 1. Kapı

| Kural | Değer |
|-------|--------|
| Taban | `/api/v1/...` — kopya `app/api/v1` handler ağacı yoktur; kenar kanonik `/api/...` yoluna soyar. |
| Zarf | `{ ok, error, requestId, apiVersion, data }`. `apiVersion` her zaman `"1"`. |
| Başarı | `ok: true`, `error: null`, `data: object`. |
| Hata | `ok: false`, `data: null`, `error: string`. |
| Kimlik | Yalnız `Authorization: Bearer <access_token>`. |
| Çerez | Yok. `Cookie` gönderilse yok sayılır. `Set-Cookie` beklenmez, yazılmaz. |
| Sürüm | Health dışında `X-Rail-Min-Version: 1` zorunlu. |
| CORS | `RAIL_DRON_ORIGINS` allowlist. Boş = saf native (CORS başlığı yok). Joker `*` yok. `Access-Control-Allow-Credentials` yok. |

Versiyonsuz web serimi (`{ ok: true, jobs: [...] }`) kapalıdır (P1). Parse fail'i boş liste veya sahte bakiye değildir; protokol hatasıdır. **Üçüncü zarf yasaktır.**

JSON zarfı (Anayasa A6) Amiral ve Dron için aynıdır: `{ ok, error, requestId, apiVersion, data }`. Bu, Amiral’in bütün web BFF yüzeyini `/api/v1` hop sicili olarak konuştuğu anlamına **gelmez**. Dron yalnız `RAIL_V1_HOPS` alt kümesini konuşur. Web RSC/BFF daha geniştir (ekip, doğrudan teklif, AI sohbet, şifre, admin, inceleme, PDF hop sicilinde yoktur). Gövde **Modüler Monolit + API-First Dron Sözleşmesi**dir; “API-First” yalnız Dron kesitidir (Anayasa A9). Hop sicilini web BFF kadar şişirmek ürün kararı değildir; ajan “her Amiral rotasını v1 hop yap” diye BFF’i bozmaz.

---

## 2. Kimlik — mevcut Supabase JWT

Yeni `/api/v1/auth/refresh` ucu yoktur. Yeni Prisma kullanıcı tablosu yoktur. `service_role` yoktur.

1. Vatandaş `anon` anahtarı + proje URL ile Supabase Auth konuşur (e-posta/şifre; PKCE native SDK).
2. **Access token** kısa ömürlü JWT'dir. Her v1 isteğinde `Authorization: Bearer` olarak gider.
3. **Refresh token** çereze yazılmaz. Native secure storage (Keychain / Keystore / EncryptedSharedPreferences) içindedir.
4. Süre bitince istemci `supabase.auth.refreshSession()` (veya eşdeğeri) çağırır, yeni access token'ı başlığa koyar, **aynı isteği bir kez daha** dener.
5. Oturum yokluğu: `GET /api/v1/auth/session` → 401 zarf, `error: "Oturum gerekli."`. `user.accessToken` yayınlanmaz.

Kenar imzayı doğrular (JWKS ES256/RS256; HS256 yedek `SUPABASE_JWT_SECRET`). Kimlik gerçeği handler `getUser`'dadır. Sahte veya süresi dolmuş JWT → 401 zarf; rewrite olmaz.

---

## 3. Idempotency-Key

Sicilde `idempotency: true` olan yazma hop'ları (lab: teklif, kabul, teslim, serbest bırakma, iade) **UUID** `Idempotency-Key` ister.

| Durum | Davranış |
|-------|----------|
| Başlık yok | 400, `"Idempotency-Key başlığı zorunludur."` — 2xx yok. |
| UUID değil | 400, `"Idempotency-Key UUID olmalıdır."` |
| Aynı anahtar + aynı gövde | Replay; ikinci debit yok. |
| Aynı anahtar + farklı gövde | 409. |
| GET / health / session / listeler | Anahtar **yoktur**; gönderilirse yok sayılır, dayatılmaz. |

Her **yeni** finansal mutasyon yeni UUID üretir (`crypto.randomUUID()`). Ağ kopyası / retry **aynı** UUID'yi basar. Çift tıklama ikinci emir doğurmaz.

Lab dışı web yazmaları (cüzdan yükleme, akademi satın alma, ilan POST) aynı UUID kalkanını kullanır; refund / top-up / native IAP dron siciline sessizce eklenmez.

---

## 4. Hata işleme — 401 / 426 / 400

Anayasa: desteklenmeyen sürüm sahte veri veya boş ekran almaz. İstemci JSON'u zarf olarak okur; `Content-Type: text/html` veya parse fail **boş home değildir**.

| HTTP | Ne zaman | Vatandaş cümlesi / eylem |
|------|----------|--------------------------|
| 400 | `X-Rail-Min-Version` yok veya geçersiz | `"Sürüm başlığı gerekli."` / `"Sürüm başlığı geçersiz."` — başlığı düzelt. |
| 401 | Bearer yok, çerez-only, süresi dolmuş veya imzasız JWT | `"Oturum gerekli."` — refresh dene; olmazsa giriş. Liste/bakiye uydurma. |
| 403 | Vizesiz teklif | `"Nitelikli ilana teklif için geçerli Kariyer Vizesi (akademi sertifikası) gerekir."` |
| 409 | Idempotency gövde çatışması | Aynı anahtarla farklı gövde gönderme; yeni UUID. |
| 426 | İstemci asgari sürümü sunucudan yeni veya (ileride) eski | Mağaza güncellemesi veya `"Bu sunucu henüz o sözleşmeyi konuşmuyor."` |

426 vatandaş cümlesi (eski istemci, `minVersion` yükselince): `"Bu uygulama güncel değil. yetkin.ai uygulamasını mağazadan güncelle."`

`data` hata zarfında her zaman `null`. Kökte başka alan yok.

---

## 5. İstek iskeleti

```
GET /api/v1/freelancer/jobs
Authorization: Bearer <access_token>
X-Rail-Min-Version: 1
x-request-id: <isteğe bağlı UUID>
```

```
POST /api/v1/freelancer/jobs/{id}/bids
Authorization: Bearer <access_token>
X-Rail-Min-Version: 1
Idempotency-Key: <uuid>
Content-Type: application/json
```

Health (`GET /api/v1/health`) kamu ve başlıksız geçebilir. CORS preflight `OPTIONS` sürüm kapısından muaf; kimlik taşımaz.

Kamu mühür (`GET /api/v1/academy/certificates/{hash}`) oturumsuzdur. Bearer yok. Idempotency-Key yok. `X-Rail-Min-Version: 1` zorunludur. 200 yalnız mühür geçerliyken; biçimsiz hash 400, sicilde yok 404, uyuşmazlık/eksik mühür 400; `data: null`. Cevapta `userId` / `attemptId` / `purchaseId` yoktur.

---

## 6. Mutlu yol yüzeyleri (`apps/rail-is`)

Aynı ekranlar sekiz yüzeyde dokuz hop tüketir; sahte DTO basmaz. Parse fail boş home değildir. Cüzdan yükleme native PayTR/IAP değildir; sistem tarayıcısı Amiral `/cuzdan` açar.

| Yüzey | Hop | Dürüst durum |
|-------|-----|----------------|
| Giriş | Supabase PKCE + `GET /api/v1/auth/session` | 401 refresh; olmazsa giriş. Token `data.user` içine konmaz |
| Açık işler | `GET /api/v1/freelancer/jobs` | Hata kartı `"Liste henüz yüklenemedi."` — `jobs: []` uydurulmaz |
| Detay + teklif | Listeden `brief`; `POST …/jobs/{id}/bids` + saklı UUID | 400/403/409/500 zarf cümlesi; sahte 201 yok. İşveren kendi ilanında bu formu görmez |
| Cüzdan şeridi | `GET /api/v1/dashboard/wallet-strip` | `strip.live === false` → `"Cüzdan henüz yüklenemedi"`; yükleme `/cuzdan` |
| İşlerim / Tezgâh | `GET /api/v1/freelancer/contracts` | `FreelancerContractView.deliveredAt` (DELIVERY türevi). Parse fail `"Tezgâh henüz yüklenemedi."` — sahte iş yok. Pull-to-refresh + 30 sn anket |
| Teslim yazması | `POST /api/v1/freelancer/contracts/{id}/messages` `kind=DELIVERY` + UUID | Usta, FUNDED. 2xx sonrası GET contracts. 400/403/409/500 dürüst kart; sahte yeşil yok. GET thread allowlist dışı |
| Teslimatı Onayla ve Öde | `POST /api/v1/freelancer/contracts/{id}/release` + UUID | İşveren, Tezgâh `delivered` şeridi. 2xx sonrası GET contracts + wallet-strip. Usta 403. 400/403/409/500 dürüst kart; yerel `lane: "released"` yok |
| Teklifleri İncele, Kabul Et ve Fonla | `GET /api/v1/client/jobs/{id}/bids` + `POST …/jobs/{id}/accept` + UUID | İşveren, `job.clientId`. Dar DTO (`bidId`, `amountMinor`, `coverNote`, `createdAt`); `bidderId` yok. Teyit modalı. PSP Split yoksa **503** `"Ödeme henüz bağlanmadı"`; cüzdan DEBIT ile fonlanmaz. Sahte yeşil yok. Usta 403. `GET jobs/{id}` kapalı |

HTTP 426 kilit cümlesi: `"Lütfen uygulamayı güncelleyiniz"`.

Tezgâh şeritleri: `FUNDED` + `deliveredAt == null` → devam (emanet blokeli); `FUNDED` + `deliveredAt` → teslim edildi; `RELEASED` → Emanet kilitli — hakediş yazılmaz. `REFUNDED` / `DISPUTED` ayrı basılır; “devam ediyor” boyanmaz. `POST …/deliver` yoktur. `GET …/messages` allowlist dışıdır.

## 7. Bilinçli olarak olmayanlar

- Mağaza paketi, IAP, Push, ikinci bundle, Expo Web ürünü, Expo Router, EAS submit.
- `/api/v1/auth/refresh`, Cookie güvenlik şeması, `Allow-Credentials`.
- POST ilan — lab hop sicilinde yok; yayın Product Owner onayı ister.
- Sicile `GET /api/v1/freelancer/jobs/{id}` — detay listeden çizilir; teklifler owner-only `GET /api/v1/client/jobs/{id}/bids` ile okunur.
- Dron yazması: `POST …/deliver` (ağız yok), `GET …/messages` (PII thread). Nakit DEBIT `POST …/accept` işveren allowlist'indedir; hak ediş `POST …/release` işveren allowlist'indedir. Refund / top-up / native IAP kapalı.
- `packages/` SDK (Prisma'lı kernel paketi yok). HTTP istemcisi `apps/rail-is` içindedir; `lib/kernel` import etmez.
- **Hop alt kümesi ürün kararıdır.** Sicil dışı: ekip, doğrudan teklif, anlaşmazlık GET thread, inceleme, dinle, PDF, müfredat revizyonu, AI sohbet, şifre, admin. Bunlar web BFF’de durabilir; Dron hop’a sessizce eklenmez.

Ops bağlama: `.system_docs/OPS_RUNBOOK.md`. Env: `RAIL_DRON_ORIGINS` (Amiral). Native: `apps/rail-is/.env.example`.
