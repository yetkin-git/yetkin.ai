# WebPageTest Performans Raporu — TTFB (First Byte Time)

| Alan | Değer |
|------|--------|
| Tarih | 17 Eylül 2026 |
| Rol | Cursor Ajanı → SUPER ADMIN |
| Kapsam | Canlı `https://yetkin.ai/` WebPageTest: CLS 0, TBT 0 ms, transfer ≈ 206 KB / açılmış mertebe ≈ 338 KB; TTFB **1.112s F (15.6)** |
| Kaynak | Catchpoint WPT Instant Test `ARHd-D-E-B2ADoNgjfFE6d9UAA-N` (17 Eylül 2026 07:57:44 UTC) + canlı kenar başlıkları + kod SSOT (`app/layout.tsx`, `proxy.ts`, `instrumentation.ts`, `vercel.json`, `next.config.ts`) + `docs/01_PERFORMANS_OPTIMIZASYON_RAPORU.md` |
| Statü | Tespit uygulandı. Nonce CSP (A katmanı) durur. Köken mühürü `fra1`. Kamu HTML izinden Prisma/pg/Noto çıkarıldı. Çerezsiz Auth atlanır. Build ve test yeşil. |

Çelişkide `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır. Bu rapor ürün kodunu import etmez; `docs/DURUM.md` ile aynı sınıftadır.

WPT bağlantısı: [Catchpoint sonuç](https://www.catchpoint.com/webpagetest/results?publicurl=https%3A%2F%2Fpublic.catchpoint.com%2FUI%2FEntry%2FWPTITP%2FARHd-D-E-B2ADoNgjfFE6d9UAA-N)

---

## 0. Yönetici özeti

**Ön yüz bütçesi kapanmıştır.** CLS **0**, TBT **0 ms**, LCP **1956 ms** (yeşil). 206 KB transfer / ~338 KB açılmış; Gzip/Brotli raporundaki ~203 KB transferle aynı mertebededir.

**Kalan F notu TTFB’dir (1.112s, skor 15.6/100).** Bu boyama sorunu değildir. HTML şelalesi:

| Evre | Süre |
|------|------|
| DNS | 53 ms |
| TCP | 5 ms |
| TLS | 10 ms |
| **Wait (sunucu ilk bayt)** | **1044 ms** |
| Gövde indirme | 4 ms |
| HTML transfer | 9.390 B (`br`) |

53 + 5 + 10 + 1044 = **1112 ms**. El sıkışması ucuzdur; F notunun tamamı köken function beklemesidir.

Koşu **Columbus, Ohio, ABD** (Chrome 148, masaüstü, Wi‑Fi). Köken hâlâ **iad1** (Virginia) olduğu için bu WPT coğrafyası aslında yakındır. 1044 ms wait Atlas okyanusu değildir — soğuk Node + dinamik SSR’dir.

**Nonce CSP HTML kenar cache’ini yasaklar.** Bilinçli A katmanı bedeli. Hash-CSP’ye dönülmedi. TTFB cache ile değil **coğrafya (TR/AB) + soğuk function izi + çerezsiz Auth** ile ödenir.

**Uygulanan kod (CSP’ye dokunulmadı):**

1. `vercel.json` `regions: ["fra1"]` — Node kökeni Frankfurt. Next 16.3 `preferredRegion` Edge’e bağlıdır ve yok sayılır.
2. `instrumentation.ts` Prisma `db` import’u yok — kamu HTML soğuk başlangıcı motor parse’ını beklemez.
3. `getSession` / kenar çerez yenileme — `sb-*-auth-token` yoksa `getUser` yok.
4. `next.config.ts` kamu HTML izinden Prisma / `pg` / Noto **exclude** — `includes["*"]` motoru ana sayfa function’ına koymaz.

Hedef (yayın sonrası, İstanbul veya Frankfurt WPT): HTML TTFB **&lt; 400 ms** (sıcak), soğuk **&lt; 800 ms**. Ohio/Dulles koşusu `fra1` sonrası kasıtlı olarak kötüleşebilir; hakem TR/AB vatandaşıdır.

---

## ADIM 1 — TTFB ve sunucu yanıt analizi

### 1.1 WPT koşusu (canlı, yayın öncesi kod)

| Alan | Değer |
|------|--------|
| Hedef | `https://yetkin.ai/` |
| Konum | Columbus, Ohio, USA |
| Ajan | Chrome v148, Desktop, Wi‑Fi 240/120 Mbps (ajan içi 2 ms RTT) |
| Zaman | 17 Eylül 2026 07:57:44 UTC |
| TTFB | **1112 ms F (15.6)** |
| FCP | 1855 ms |
| LCP | 1956 ms |
| CLS | **0** |
| TBT | **0 ms** |
| Speed Index | 1801 ms |
| Document Complete | 1645 ms |
| Test Complete | 2235 ms |
| Toplam transfer | 205.583 B |

HTML satırı (#1) dışında şelale: 1 render-blocking CSS (`37ogl9ky01vnv.css`, 36 KB), ~10 JS chunk, Cloudflare Insights beacon + `/cdn-cgi/rum`, `icon.svg`, ardından Next RSC prefetch (`/login`, `/register`, `/academy`). Prefetch TTFB’den **sonra** (start ≈ 1643 ms); belge ilk baytını etkilemez.

Canlı kontrol (İstanbul, 17 Eylül 2026 ~08:23 UTC, sıcak):

| Başlık | Değer |
|--------|--------|
| `x-vercel-id` | `fra1::iad1::…` — kenar POP **fra1**, **köken iad1** |
| `Cache-Control` | `private, no-cache, no-store, max-age=0, must-revalidate` |
| `cf-cache-status` | `DYNAMIC` |
| `content-encoding` | `br` |
| CSP | `script-src 'self' 'nonce-…' 'strict-dynamic'` (A katmanı durur) |
| `x-powered-by` | `Next.js` — kodda `poweredByHeader: false`; **canlıya henüz yayınlanmamış** |
| curl TTFB | **332 ms** (sıcak, IST) |

Sıcak İstanbul 332 ms vs Ohio soğuk 1112 ms: F notu soğuk isolate + dinamik HTML’dir. `vercel.json` `fra1` mühürü canlıda henüz kökeni değiştirmemiştir (`iad1` durur).

### 1.2 Kök `layout.tsx`: `connection()` ve nonce CSP

Kök layout senkron HTML kabuğudur. Dinamik delik:

```tsx
async function RequestBoundCsp() {
  await connection();
  return null;
}
```

`<Suspense fallback={null}>` içindedir. `proxy.ts` her istekte yeni `script-src 'nonce-…' 'strict-dynamic'` basar ve nonce’u isteğe yazar. Next, framework script’lerine bu nonce’u ancak **istek anında** basar. Derleme anındaki statik kabuk eski veya boş nonce taşır; tarayıcı script’i keser.

| Soru | Cevap |
|------|--------|
| `connection()` HTML derlemesini yavaşlatır mı? | Evet: rota `ƒ` (dynamic) kalır; Cloudflare `DYNAMIC` / `no-store`. Kenar HTML HIT yoktur. |
| Kabuğu tamamen bloklar mı? | Hayır: layout senkron, `connection()` Suspense içinde. İlk bayt akışı mümkün; **önbellek yokluğu + soğuk function** asıl faturadır. `connection()` kendisi milisaniye mertebesindedir. |
| Kaldırılabilir mi? | Hayır. Kaldırmak A katmanı nonce CSP’yi bozar. Test: `tests/kernel/kayit-alias-surface.test.ts` `connection()` ister. |
| HTML `s-maxage` + aynı yanıtta nonce? | Cache’lenmiş nonce herkese görünür; stored XSS `strict-dynamic`’i deler. Yasak. |
| PPR / statik kabuk? | Statik kabuk nonce taşıyamaz. Açılmadı. |

Ana sayfa (`app/(public)/page.tsx`) senkron vitrindir. `HomeAccountNav` `getSession`’ı iç Suspense’te tutar; LCP metnini bloklamaz. Çerez yoksa `getUser` yoktur.

**Karar:** `connection()` durur. HTML cache açılmaz. TTFB başka yerden düşer.

### 1.3 `iad1` → `fra1`

Canlı `x-vercel-id`: kenar `fra1`, köken **iad1**. Önceki Pingdom HAR (`docs/har.json`): HTML wait ≈ 2638 ms, aynı köken.

Türkiye/AB RTT (tipik, tek yön):

| Hop | iad1 (Virginia) | fra1 (Frankfurt) |
|-----|-----------------|------------------|
| İstanbul → köken | ~150–180 ms | ~20–40 ms |
| Frankfurt → köken | ~80–100 ms | ~5–15 ms |
| Columbus/Ohio (bu WPT) → köken | ~15–30 ms | ~90–110 ms |

Ohio WPT’de el sıkışması **68 ms** olduğu için coğrafya bu F notunu üretmez. TR vatandaşında aynı 1044 ms wait’in üstüne Atlas RTT biner (Pingdom 2,6 sn). `fra1` TR/AB için ağ payını keser; soğuk wait’i tek başına 400 ms altına indirmez.

Next 16.3.1: `export const preferredRegion` **deprecated**; Node function’da yok sayılır. Doğru mühür:

```json
{ "regions": ["fra1"] }
```

`vercel.json` Dashboard Function Region’ı ezer (plan izin veriyorsa). Hobby tek bölge kısıtı varsa Dashboard `iad1`’de kalır — SUPER ADMIN planı teyit eder. Kenar `proxy.ts` zaten küresel POP’tadır; değişen **HTML’i üreten Node** konumudur.

**Veritabanı uyarısı:** `DATABASE_URL` transaction pooler `aws-0-<bölge>.pooler.supabase.com:6543`. Auth/DB **eu-central-1** ise `fra1` HTML + API kazandırır. Auth/DB **us-east-1** ise kamu TTFB düzelir, kokpit/Prisma FRA→US öder. Kod sır okumaz.

**Karar:** Köken mühürü `fra1`. Ölçüm hakemi İstanbul veya Frankfurt WPT; Ohio/Dulles değil.

### 1.4 Kenar ve `next.config.ts` — güvenli TTFB kolları

`proxy.ts` her HTML isteğinde (matcher kamu `/` dahil):

1. `createEdgeNonce()` + CSP — zorunlu, ucuz.
2. `collectSupabaseAuthCookieRefresh` — çerez yoksa Auth API yok.
3. `resolveEdgeSessionState` — kamu GET’te JWT yok (`needsEdgeJwtVerification` false).
4. Origin / hop / rate-limit — GET `/` senkron no-op.

WebPageTest oturumsuzdur. Nonce her istekte ayrıdır (`proxy-edge` testi).

`instrumentation.ts` kamu HTML soğuk yolunda `await import("@/lib/kernel/db")` yapmaz. `register()` senkron env + log; ağ bekletmez.

`next.config.ts` `outputFileTracingIncludes["*"]` Prisma WASM + Noto’yu **her** function izine koyuyordu. Ana sayfa Prisma import etmez; soğuk TTFB yine motor dosyalarını çeker/parse eder. Bu, Ohio’daki 1044 ms wait’in kod tarafındaki asıl kaldıraçtır.

`compress: true` / immutable statik cache / matcher 01 raporunda mühürlü. TTFB’ye ek sıkıştırma kazancı yok. CSS 36 KB br LCP’yi iter, TTFB’yi değil.

---

## ADIM 2 — Uygulama ve doğrulama

### 2.1 Yapılan (CSP tavizsiz)

| Değişiklik | Gerekçe |
|------------|---------|
| `vercel.json` `regions: ["fra1"]` | Node kökeni EU. `preferredRegion` yazılmadı (Next 16.3 yok sayar). |
| `instrumentation.ts` Prisma import yok | Kamu HTML soğuk başlangıcı `db` parse etmez. |
| `require-session.ts` `hasSupabaseAuthCookieHint` | Çerez yoksa `getUser` yok. |
| `proxy.ts` aynı hint | Çerezsiz kamu GET kenarda Auth yenilemez. |
| `next.config.ts` `PUBLIC_HTML_WITHOUT_PRISMA` exclude | `/`, yasal, auth vitrin izinden Prisma/`pg`/Noto çıkar. API/akademi/kokpit `includes["*"]` ile ısınır. |
| `connection()` **korundu** | Nonce + `strict-dynamic` durur. |
| `compress: true` / nonce CSP **korundu** | 01 raporu + A katmanı. |

Yapılmayan (bilinçli):

- Hash-tabanlı CSP + `s-maxage` HTML cache — A katmanı nonce’u söker.
- Brotli kapatmak / sahte `Content-Encoding`.
- Ana sayfa `Link` prefetch kapatmak — belge TTFB’sinden sonra; gerçek gezinmeyi cezalandırır.
- `cacheComponents` / PPR — statik kabuk nonce taşıyamaz.
- Akademi vitrin Prisma’sını ana sayfadan ayırmak — WPT hedefi `/`; akademi ayrı tur.

### 2.2 Üretim build

`npm run build` — **çıkış 0.** Next.js 16.3.1 Turbopack. Compile 11,1 sn; TypeScript 9,4 sn; 71 sayfa.

- `verify:prebuild` (sır, amount-minor, RLS, v1 sözleşme, IDOR, runtime-readiness) yeşil.
- Kamu HTML: `/` ve vitrin **ƒ**. Nonce + `connection()` beklenen.
- Statik kalan: `icon.svg`, `apple-icon.png`, `robots.txt`, `sitemap.xml`, OG/Twitter görselleri.
- Lab uyarısı (kayıt): yerel `TRUSTED_PROXY_HOPS=1`; canlı Cloudflare+Vercel reçetesi **2**.

### 2.3 Test

| Komut | Sonuç |
|-------|--------|
| `npm run test` | **209 dosya, 975 test, geçti** (53,1 sn). 01 raporundaki 973 tavanı, bu daldaki akademi/yüzey dışı test artışıyla 975’tir; TTFB mühürleri `*surface.test.ts` içinde olduğu için bu sayıya eklenmez. |
| Odak yüzey: `performance-headers-surface`, `page-session-shield`, `proxy-edge` | **23/23** |

Sistem kırılmadı. Nonce hâlâ istek başına ayrıdır (`proxy-edge`).

---

## ADIM 3 — Tarafsız görüş

1. **TTFB F, ön yüz F değildir.** CLS/TBT/LCP yeşil; 206 KB transfer dünya standardı bandında. Hakem TTFB olmalı; Pingdom Gzip değil.
2. **Bu WPT Ohio’dan olduğu için `fra1` notu tek başına yeşile çekmez.** 1044 ms wait Virginia’ya yakından ölçülmüştür. TR vatandaşı için `fra1` ağ payını keser; soğuk iz (Prisma exclude) wait’i keser. İkisi birlikte hedef &lt; 400 ms’ye gider.
3. **fra1 yayınlanmadan canlı `iad1` durur.** Kod mühürü deploy’suz kökeni değiştirmez. Canlı hâlâ `x-powered-by: Next.js` basar — aynı yayın gecikmesi.
4. **İkinci WPT:** konum **Istanbul** veya **Frankfurt**, soğuk + sıcak. `x-vercel-id` içinde köken `fra1` (üç parçalı `…::fra1::…`) aranır. Ohio kontrol koşusu beklenen regresyondur.
5. **Nonce durur.** HTML’i cache’lemek için CSP’yi zayıflatmam.
6. **Cloudflare Web Analytics** (`static.cloudflareinsights.com/beacon.min.js`) TTFB’den sonra 1 istek daha ekler; 01 raporundaki e-posta obfuscation gibi operatör işidir.

---

## SUPER ADMIN’e bildirim

1. **WebPageTest F (15.6) TTFB 1.112s’dir.** CLS 0, TBT 0, LCP 1956 ms, ~206 KB transfer başarılıdır. DNS+TLS 68 ms; **wait 1044 ms**.
2. **Kök neden:** dinamik HTML (nonce `connection()`, `no-store`) + canlı köken **iad1** + soğuk isolate’te Prisma izi (`includes["*"]`) + (önceki) oturumsuz `getUser`. Ohio koşusu coğrafyayı aklamaz; wait sunucudadır.
3. **CSP’ye dokunulmadı.** `script-src 'self' 'nonce-…' 'strict-dynamic'` SSOT `proxy.ts` / `buildEdgeCsp`.
4. **Uygulanan:** `fra1` mühürü; instrumentation Prisma yok; çerezsiz Auth atlanır; kamu HTML Prisma/Noto iz dışı. `npm run build` çıkış 0. `npm run test` **975/975** (209 dosya). Yüzey mühür **23/23**.
5. **Sizde:** bu dalı yayınlayın; WPT’yi İstanbul/Frankfurt’tan soğuk+sıcak tekrarlayın; `x-vercel-id` köken `fra1` teyit; Supabase pooler bölgesinin EU olduğunu doğrulayın. Canlı `TRUSTED_PROXY_HOPS=2` ayrı ops uyarısıdır.

Onay istenen operatör işi (kod dışı): Vercel yayın (`fra1` + `poweredByHeader: false` ancak o zaman canlıdır); WPT İstanbul/Frankfurt; Hobby/Pro bölge kısıtı teyidi; Supabase bölge teyidi.
