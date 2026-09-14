# yetkin.ai İş (Diyar B) istemci sözleşmesi

Native ve ikincil istemcinin `/api/v1` ile konuşma kuralı. Anayasa: `.system_docs/ANAYASA.md`. Hop sicili: `@yetkin/kernel` (`v1-hops-meta`) + Amiral `v1-contract.ts`. Bu belge yeni bir kimlik sistemi veya Prisma modeli açmaz. Mevcut gerçek: **Supabase Auth JWT**.

Mağaza / vatandaş markası `yetkin.ai`. Native paket adı `yetkin.ai-is`; dizin yolu `apps/rail-is` (operasyonel yol).

Ürün kodu bu dosyayı import etmez.

**Faz 2 hükmü:** T3 Akademi halkası Dron UI'dadır (`AcademyPlayerScreen` / `ExamScreen` / `CertificateScreen`). Native mağaza binary hattı `apps/rail-is/eas.json` (CI eas basmaz). Tezgâh hop'ları donuk; Closed Testing yüzeyi izole (`DRON_TEZGAH_STORE_ISOLATED`). Hedef mimari: Shared Kernel paketi + API-First hop sicili.

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

Versiyonsuz web serimi kapalıdır. Parse fail boş liste veya sahte bakiye değildir; protokol hatasıdır. **Üçüncü zarf yasaktır.**

JSON zarfı Amiral ve Dron için aynıdır. **API-First:** dronların tüketeceği yetenek v1 hop siciline yazılır. Web RSC okuma/query için `lib/` yükleyebilir; yazma hop’u sessizce web-only bırakılmaz.

**Shared Kernel:** `@yetkin/kernel` npm workspace paketidir. Prisma/Supabase bağımsız para, katalog kimliği, zarf ve hop meta buradan sürülür. Dron codegen-kopya yerine bu paketi tüketir. Kırıcı sözleşme değişikliği major sürüm + 426 penceresidir.

Hop sicili ürün kararıyla büyür; sessiz ekleme yoktur. Yeni hop = meta + Zod + handler + test + paket sürümü.

---

## 2. Kimlik — mevcut Supabase JWT

Yeni `/api/v1/auth/refresh` ucu yoktur. Yeni Prisma kullanıcı tablosu yoktur. `service_role` yoktur.

1. Vatandaş `anon` anahtarı + proje URL ile Supabase Auth konuşur.
2. **Access token** her v1 isteğinde `Authorization: Bearer` olarak gider.
3. **Refresh token** çereze yazılmaz. Native secure storage içindedir.
4. Süre bitince istemci `supabase.auth.refreshSession()` çağırır, yeni access token'ı başlığa koyar, **aynı isteği bir kez daha** dener.
5. Oturum yokluğu: `GET /api/v1/auth/session` → 401 zarf.

Kenar imzayı doğrular. Sahte veya süresi dolmuş JWT → 401 zarf; rewrite olmaz.

---

## 3. Idempotency-Key

Yazma hop’ları (`idempotency: true`) **UUID** `Idempotency-Key` ister. GET hop’lara anahtar dayatılmaz.

| Durum | Davranış |
|-------|----------|
| Başlık yok (yazma) | 400, `"Idempotency-Key başlığı zorunludur."` — 2xx yok. |
| UUID değil | 400, `"Idempotency-Key UUID olmalıdır."` |
| Aynı anahtar + aynı gövde | Replay; ikinci debit yok. |
| Aynı anahtar + farklı gövde | 409. |
| GET / health / session / listeler | Anahtar **yoktur**. |

Native IAP yoktur. Cüzdan DEBIT (Akademi satın alma) Bearer hop’tur; mağaza içi IAP SKU eklenmez. Cüzdan yükleme `POST /api/v1/wallet/top-up` (Bearer + Idempotency-Key + HMAC kasa pasaportu) ile açılır; kart PayTR iFrame’de `/kasa` sayfasındadır. Web `/cuzdan` sığınağı durur.

---

## 4. Hata işleme — 401 / 426 / 400

İstemci JSON'u zarf olarak okur; `Content-Type: text/html` veya parse fail **boş home değildir**.

| HTTP | Ne zaman | Eylem |
|------|----------|--------|
| 400 | Sürüm başlığı yok veya geçersiz; Idempotency-Key yok | Başlığı düzelt. |
| 401 | Bearer yok, çerez-only, süresi dolmuş JWT | Refresh; olmazsa giriş. |
| 409 | Idempotency gövde çatışması | Yeni UUID. |
| 410 | Kilitli / donmuş oda | Yüzey canlı değildir. |
| 426 | İstemci asgari sürümü sunucudan yeni veya (ileride) eski | Mağaza güncellemesi veya sunucu yükseltmesi. |

`data` hata zarfında her zaman `null`.

---

## 5. İstek iskeleti — yayın hop sicili

Sunucu sicili `@yetkin/kernel` `RAIL_V1_HOPS_META` içindedir. Canlı yazma hop’ları (satın alma, fiyat kilidi, ders tamamlama, sınav, cüzdan yükleme, portföy senkronu, profil) Bearer + Idempotency-Key ile açıktır. Müfredat ve sınav GET okuma hop’ları T3 halkası içindir. Freelancer path’leri kilitliyken kenar 410’dur.

```
POST /api/v1/academy/courses/{id}/curriculum
Authorization: Bearer <access_token>
X-Rail-Min-Version: 1
Idempotency-Key: <uuid>
```

Health (`GET /api/v1/health`) kamu ve başlıksız geçebilir. Kamu mühür oturumsuzdur.

---

## 6. Mutlu yol yüzeyleri (`apps/rail-is`)

Paket yayın kilidi T3 Akademi halkası (oynatıcı / sınav / mühür) Dron UI'ya bağlandığında açılır (`publishFrozenUntilFaz1Close: false`). Parse fail boş home değildir. Cüzdan yükleme native IAP değildir; `POST /api/v1/wallet/top-up` HMAC `/kasa` pasaportunu sistem tarayıcısında açar. Akademi hop'ları: müfredat GET/POST, sınav GET/POST, kamu sertifika.

EAS profilleri `apps/rail-is/eas.json` içindedir — kök `eas.json` yoktur; CI `eas` / `expo publish` yasaktır. `extra.eas.projectId` uydurulmaz. Tezgâh hop'ları donuk; Closed Testing T3 B2C halkasıdır (`DRON_TEZGAH_STORE_ISOLATED`). 410 Tezgâh sürmez. İnceleme notu: `docs/MAĞAZA_INCELEME_NOTU.md`.

HTTP 426 kilit cümlesi: `"Lütfen uygulamayı güncelleyiniz"`.

### Faz 2 — Tezgâh

Açık işler, teklif, teslim, release **Split + hop geri yazımı** olmadan Dron bu path’leri çağırmaz. Closed Testing’e 410/404 basan binary sürmek yapılmaz. `DRON_TEZGAH_STORE_ISOLATED` açıkken sekme gizlenir; kaçak yüzey kilit kartıdır.

---

## 7. Bilinçli olarak olmayanlar

- Mağaza IAP, Push, ikinci bundle, Expo Web ürünü, Expo Router. EAS submit CI'da yoktur; operatör `eas.json` production submit'i taslak (`draft`) basar.
- `/api/v1/auth/refresh`, Cookie güvenlik şeması, `Allow-Credentials`.
- Native IAP / Play Billing / App Store IAP — cüzdan DEBIT hop’u IAP değildir.
- Prisma’lı kernel paketi yoktur; `@yetkin/kernel` **pure** sözleşmedir. HTTP istemcisi `apps/rail-is` içindedir; Amiral `lib/kernel` Prisma store’larını import etmez.
- Admin, AI sohbet, dinle/PDF, şifre hop sicilinde yoktur.

Ops bağlama: `.system_docs/ops/ops-dron.md`. Env: `RAIL_DRON_ORIGINS`. Native: `apps/rail-is/.env.example`.
