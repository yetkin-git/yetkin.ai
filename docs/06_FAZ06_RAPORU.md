# Faz 06 — Canlı yayın denemesi ve doğrulama

**Tarih:** 4 Kasım 2026
**Girdi:** `docs/05_FAZ05_RAPORU.md`. Diskte mühürlü ağaç üretime alınacak, `/rehber` 200 dönecek, `checkout_intent` en az 1 artacak, olay masası sapma 0 / PENDING 0 / hayalet hold 0 kalacaktı.
**Sonuç:** Kod `main`'e gitti. Vercel Production bu iki commit'i **yayınlamadı**. Canlı site 1 Kasım sürümünde kaldı. `/rehber` hâlâ 404. Kasa açılmadı. Sayaç yazılmadı. Olay masası okuması 0 / 0 / 0.

---

## 0. Özet

| İş | Durum | Kanıt |
|---|---|---|
| Çalışma ağacı commit | `fae6b292` | 307 dosya. Sır dosyası yok |
| Native tip düzeltmesi | `fa024a31` | `rail-is` CI yeşil |
| `main` push | Gitti | `7554a952..fa024a31` |
| Vercel Production | **Kırmızı** | İki deployment da `failure` |
| Cloudflare | Kenar ayakta | `Server: cloudflare`, `CF-RAY` |
| Supabase migrasyonu | Bu turda yeni apply yok | Faz 05'te 47 migrasyon tamam |
| `GET /rehber` | **404** | Title `yetkin.ai`. H1 «Sayfa bulunamadı» |
| `sitemap.xml` | 7.493 bayt | `/rehber` yok. `/admin` yok. `/kariyer` yok |
| Asistan | Canlıda 401 | «Oturum gerekli.» Yeni kamu rota yayında değil |
| `checkout_intent` | Artırılmadı | Kasa açılmadı. PENDING yazılmadı |
| Olay masası | Sapma 0, PENDING 0, hayalet 0 | Üç okuma betiği, yazma yok |
| Tip / lint / vitest | Yeşil | 414 dosya / 2042 test |
| `amiral` CI | Kırmızı | `tests/kernel/junior-warmup.test.ts:38` |
| `pg-lab` CI | Kırmızı | `7554a952` üzerinde de kırmızıydı |

---

## 1. Ağaç ve commit

`git status` mühürlü ürün diff'iydi. `.env`, sertifika, log ve `tsbuildinfo` yoktu. `.env.example` yalnız yorum satırı taşır. Anayasa A1–A5 satırına dokunulmadı. B6 denetim cümlesi ve başlıktaki doğrulama tarihi değişti.

Tek yayın commit'i:

`fae6b292` — `feat(prod): release the sealed gateway, ops desk, and assistant`

Ara commit'ler bu ağaçta ayrı yeşil durmuyordu. Bölmek, `main`'e yarım derleme bırakırdı.

İlk push'tan sonra `rail-is` işi düştü: `packages/kernel/src/http/dron-onboarding-schema.ts` `zod` import eder. Native `tsconfig` çekirdeğin bütün kaynaklarını derler. `zod` native pakette yoktur. CI'de üst `node_modules` de yoktur. Yerelde üst paket `zod`'u çözdüğü için ilk tip denetimi bunu göstermedi.

`fa024a31` — `fix(rail-is): keep the onboarding zod schema out of native typecheck`

Şema dosyası native projenin `exclude` listesine alındı. `tsc --explainFiles` bu dosyayı derlemenin dışında gördü. `npm --prefix apps/rail-is run typecheck` temiz. İkinci push `fae6b292..fa024a31`.

Bu turda ayrıca `tests/kernel/junior-warmup.test.ts` düzeltildi. Gerekçe bölüm 4'tedir. Rapor dosyası bu düzeltmeyle aynı kayıtta durur.

---

## 2. CI ve dağıtım

Uzak: `https://github.com/yetkin-git/yetkin.ai.git`, dal `main`.
Vercel proje durumu GitHub commit status üzerinden okundu. CLI bu makinede oturumsuzdu (`npx vercel inspect` cihaz girişi açtı, durduruldu). Derleme günlüğünün gövdesi alınamadı.

| Commit | Vercel | `rail-is` | `amiral` | `pg-lab` |
|---|---|---|---|---|
| `7554a952` (önceki canlı) | O gün yayındaydı | yeşil | kırmızı (lint) | kırmızı |
| `fae6b292` | **failure** | kırmızı (`zod`) | kırmızı | kırmızı |
| `fa024a31` | **failure** | yeşil | kırmızı (`npm test`) | kırmızı |

`fa024a31` üzerinde `amiral` adımları: `npm ci`, `lint`, `verify:prebuild`, `verify:junior-audio-cdn`, `typecheck` yeşil. Düşen adım `npm run test`. Anotasyon:

`tests/kernel/junior-warmup.test.ts:38` — `existsSync` beklenen `true`, gelen `false`.

Beş ısınma dosyası `.gitignore` içindedir (`public/media/junior/warmup/`). Klon bu baytı taşımaz. Yerel diskte dosya olduğu için aynı test bu makinede geçti. CI ilk kez bu teste kadar geldi; önceki `main` lint'te düştüğü için test adımı çalışmamıştı.

`pg-lab` düşen adım `npm run ops:lab-postgres`. Aynı komutun yerel loopback koşusu `junior_profiles` cümlesiyle çıktı. Bu kırmızı `7554a952` üzerinde de vardı. Bu tur o DROP listesine dokunmadı. Canlı Junior tablosu bu yüzden silinmedi.

Vercel iki commit'i de başarısız yazdı. `fae6b292` durumu 06:55:15 UTC'de «deploying», 06:55:43 UTC'de `failure`. `fa024a31` 07:00:23 UTC'de doğrudan `failure`. Süre, bu deponun tam `next build` süresinden kısadır. Günlük gövdesi olmadan satır iddia edilmez.

Kodun Vercel'e özel kapısı `scripts/ops-runtime-readiness.ts` içindedir. `verify:prebuild` onu çağırır. `VERCEL=1` değilken çıkış 0'dır; GitHub `amiral` bu yüzden prebuild'i geçti. `VERCEL=1` iken Redis çifti yoksa süreç düşer:

`RATE_LIMIT_REDIS_REST_URL + RATE_LIMIT_REDIS_REST_TOKEN Vercel çok instance için birlikte dolu olmalı.`

Bu makinenin `.env.local` değeriyle `VERCEL=1` simülasyonu o satırı bastı. Aynı simülasyon `NEXT_PUBLIC_APP_URL` için `localhost` da bastı. O satır yerel dosyanın satırıdır. Canlı site ayakta olduğu için Production panelindeki kök adres bu değildir. Redis çiftinin panelde dolu olup olmadığı bu turda okunamadı. Kapı, çift boşsa derlemeyi düşürür. Önceki canlı sürüm bu kapıdan önce basılmıştı.

Cloudflare ayrı bir uygulama dağıtımı değildir. Depoda Workers / Pages iş akışı yok. Canlı yanıt `Server: cloudflare` ve `CF-RAY` taşır. Uygulama `x-vercel-id` bölgesi `fra1`. Kenar, Vercel'in önündedir. Yeni bir Cloudflare sürümü tetiklenmedi çünkü Vercel sürümü oluşmadı.

Supabase: `20261104121000_super_admin_audit_certificate_and_price` Faz 05'te uygulandı. Bu tur `ops:migrate` çalıştırmadı. Katalog fiyatı yazılmadı.

---

## 3. Canlı doğrulama

Okuma anı 4 Kasım 2026, yaklaşık 10:28 (UTC+3). Hedef hâlâ `7554a952` üretimidir.

### 3.1 `/rehber`

`GET https://yetkin.ai/rehber`

| Alan | Canlı | Disk üreteci (`fa024a31`) |
|---|---|---|
| HTTP | **404** | 200 olacak sayfa `app/(public)/rehber/page.tsx` |
| `x-matched-path` | `/_not-found` | — |
| Title | `yetkin.ai` | `Ofiste yapay zekâ rehberi: Excel ve e-posta · yetkin.ai` |
| Description | `yetkin.ai dijital eğitim.` | 134 karakter. İlk ders ücretsiz; kayıt duvarı yok |
| Kanonik | rehber kanoniği yok | `https://yetkin.ai/rehber` |
| robots | 404 şablonu | `index, follow` |
| H1 | «Sayfa bulunamadı» | «Ofiste yapay zekâyı Excel ve e-postada kullan» sen-voice başlığı |
| JSON-LD | Kök `Organization` + `WebSite`. Rehber grafiği yok | `Article`, `FAQPage` (3 soru), `BreadcrumbList` |

### 3.2 `sitemap.xml` ve `robots.txt`

`https://yetkin.ai/sitemap.xml` 7.493 bayt. `<loc>` listesinde `https://yetkin.ai/rehber` yok. `/admin` yok. `/kariyer` yok. Ofis kursu `https://yetkin.ai/academy/01_office_ai` duruyor.

`https://yetkin.ai/robots.txt` `Disallow: /admin` satırını basıyor. `Allow: /rehber` yok. `Disallow: /kariyer` duruyor. Sitemap adresi `https://yetkin.ai/sitemap.xml`.

Diskteki `SITEMAP_STATIC_PATHS` `/rehber` içerir. `isRobotsDisallowedPath("/admin")` doğrudur. Bu liste canlı XML'de yoktur.

### 3.3 Asistan

Canlı `POST /api/ai/chat` gövdesi `{"message":"Sınav barajı kaç puan?"}`:

HTTP **401**. Gövde: `Oturum gerekli.` `requestId` `99de1ed4-e9a9-49e4-955b-aa0aca31a5ed`.

Yayındaki rota oturum ister. Mühürlü rota `auth = "public"` ve misafir kotasıdır. İkisi aynı sürüm değildir.

Diskteki asistan kimliği `lib/kernel/ai/assistant-chat.ts`:

| Sabit | Değer |
|---|---|
| `ASSISTANT_CHAT_ROLE` | `LITE_STREAM` |
| Model | `gemini-3.5-flash-lite` (`AI_MODEL_ROLE_DEFAULTS.LITE_STREAM`) |

Baraj cümlesi model çağrısından önce yerel olgudadır. `ASSISTANT_EXAM_SCORE_REPLY` ilk cümlesi: «Sınav barajı 70 puandır.» Canlı 401 olduğu için bu cümle üretimde gözlenmedi. Metin alanı `fitAssistantComposer` ile 40–120 px arasındadır. Yeni istemci paketi de yayında olmadığı için esneme üretim DOM'unda ölçülmedi.

---

## 4. Huni ve olay masası

Kasa açılmadı. `POST /api/wallet/top-up` başarılı jetonda, ekrandan önce `payment_orders` satırını `PENDING` yazar. `checkout_intent` ancak ondan sonra, açılabilir iFrame veya pasaport üretildiğinde artar. Jetondan sonra satırı `FAILED` yapmadan bırakmak PENDING yaşını 0'dan çıkarır. Kart ve 3-D Secure olmadan satırı `CLEARED` yapmak da yoktur. İkisi de bu turun koşuluyla çelişir. Sembolik tahsilat yazılmadı. Sayaç elle artırılmadı.

Okuma betikleri yazmaz. 4 Kasım 2026, yaklaşık 10:02 (UTC+3):

`ops:audit-license-gap`

```
CLEARED lisans 2 · eksik 0 · iade ile kapanmış 0 (direct)
ops:audit-license-gap OK — yazma yok.
```

`ops:list-paytr-pending`

```
0 PENDING · 0 tavan aşımı · 0 pencere içi · en yaşlı 0h (direct)
```

`ops:ghost-wallet-holds`

```
PENDING wallet-funded hold = 0
```

| Satır | Değer |
|---|---|
| Eksik lisans | **0** |
| `license_gap` | **0** |
| PENDING | **0** |
| En yaşlı PENDING | **0** sa |
| Hayalet hold | **0** adet |

`checkout_intent` bu turda yeni bir SELECT ile sayılmadı. Yazma olmadığı için Faz 05'teki 0'dan bu turun eliyle çıkmış değildir. 0'dan 1'e çıktığı doğrulanmadı. Artış, açılabilir kasa üretildiğinde yazılır. O üretim bu turda yok.

`amiral` test kırmızısı için ısınma testi değiştirildi. Süre tavanı 10 saniye durur. Beş dosyanın hepsi diskteyse hepsi zorunludur. Hiçbiri yoksa test, `.gitignore` satırı `public/media/junior/warmup/` duruyor mu diye bakar. Yarım küme hâlâ düşer. Yerel koşu 3 test, yeşil. CI'deki sıfır dosya kolu bu makinede yoktur.

---

## 5. Mühürler

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | Temiz (push öncesi) |
| `npm run lint` | **0 error**, 9 warning. Faz 05 ile aynı hook / `<img>` satırları |
| `npx vitest run --maxWorkers=4` | **414 dosya / 2042 test**, yeşil. Süre 186 sn. Isınma düzeltmesinden önce |
| `verify:api-auth --check` | **81 rota**. session 47, public 11, closed 11, cron 2, admin 6, webhook 4 |
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
| `verify:rls-status` | Yeşil |
| `verify:citizen-cash-ring` | Yeşil |
| `verify:content-quality` | Çıkış 0. 111 senaryo. `--strict` değil |
| `verify:junior-audio-cdn` | Çıkış 0, **11 uyarı** |
| `verify:sen-axis` | Kırmızı. `lib/copy/junior-guardian-notice.ts` içinde `hesabınız` |
| `verify:junior-speech` | Kırmızı. Yayın ders sayısı 123 bekliyor, sayım 111 |
| `verify:ai-gateway` | Kırmızı. `elevenlabs` ve `VIDEO_GEN` izleri |
| `verify:pg-lab` | Kırmızı. Loopback. `junior_profiles` cümlesi |
| `ops:audit-license-gap` | Yeşil. Eksik 0 |

Koşulmayanlar: `verify:ci`, `verify:prebuild` (ayrı yaprak olarak yukarıdakiler koştu; `amiral` içindeki prebuild yeşildi), `verify:nightly`, `verify:grep-seals`, `verify:staging-t4-loop`, `verify:junior-audio-cdn-full`. `staging-t4-loop` canlı ilan yazar. `nightly` ve `grep-seals`, `verify:sen-axis` kırmızı olduğu için yeşil bitemez.

Bu tur %100 yeşil değildir. Ürün tip, lint hatası ve 2042 test yeşildir. Dört eski kırmızı durur. `fa024a31` üzerindeki CI test adımı ısınma dosyası yüzünden kırmızıdır. Düzeltme bu kayıtla `main`'e gider. Yeni `amiral` koşusu bu kayıttan sonra test adımını geçebilir. Vercel Redis kapısı duruyorsa derleme yine düşer.

---

## 6. Danışmanlık

### 6.1 Search Console ve ilk bin organik ziyaret

İlk iş site haritasını göndermek değildir. İlk iş Vercel Production env'ine `RATE_LIMIT_REDIS_REST_URL` ve `RATE_LIMIT_REDIS_REST_TOKEN` çiftini birlikte yazmak, derlemeyi yeniden basmak ve `GET https://yetkin.ai/rehber` yanıtında HTTP 200, 134 karakterlik description, `https://yetkin.ai/rehber` kanoniği ve `Article` + `FAQPage` + `BreadcrumbList` grafiğini görmektir.

O 200 geldikten sonra Search Console'a `https://yetkin.ai/sitemap.xml` gönderilir ve URL denetimi `https://yetkin.ai/rehber` için istenir. Dizine girecek kapı rehberdir. Ofis kurs antresi `https://yetkin.ai/academy/01_office_ai` haritada zaten durur. İlk organik talep bu iki adrese dağılır: rehber, «Excel ve e-posta» aramasının kapısıdır; antre, kursun kendisidir. Ücretsiz ders düğmesi `/academy/01_office_ai/oyna` adresine gider. O oynatıcı `noindex` altındadır. Reklam ve dizin, oynatıcıya değil rehbere verilir.

Bugünkü site haritasını göndermek `/rehber` için 404 indeksletir.

### 6.2 Ölçek omurgası

Omurga sıfır operasyonel riskte değildir. Yeni sürüm canlıya çıkmadı. Çıkınca da hız tavanı, Redis çifti panelde duruyorsa çok örnek arasında paylaşılır; durmuyorsa derleme açılmaz. Süper yönetici tek oturumdur. İkinci faktör ve ikinci operatör yoktur. PayTR onayı ile defter aynı atomda değildir. `checkout_intent` canlıda hâlâ ölçülmüş bir 1 değildir. Hobby cron günde birdir (`0 3 * * *` ve `15 3 * * *`). On beş dakikalık tarama Inngest işindedir. Bu kapılar kapanmadan bütçe büyütmek, Faz 05 listesindeki riski büyütür.

### 6.3 Faz 07

Faz 07'nin ilk kanalı aramadır. Rehber URL'si ve ofis kurs antresi. Teklif, kayıt duvarı olmayan ilk derstir. `checkout_intent` en az bir kez artıp masa sapma 0, PENDING 0 ve hayalet hold 0 kaldığında aynı iki URL'ye ölçülü ücretli arama açılabilir. E-posta listesi, onaylı toplama formu ve KVKK metni durmadan açılmaz. Freelancer vitrini ve ikinci ürün bu turun kanalı değildir.
