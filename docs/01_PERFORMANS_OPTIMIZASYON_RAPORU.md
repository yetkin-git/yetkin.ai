# Performans Optimizasyon Raporu — Gzip / Brotli ve HTTP İstekleri

| Alan | Değer |
|------|--------|
| Tarih | 17 Eylül 2026 |
| Rol | Cursor Ajanı → SUPER ADMIN |
| Kapsam | Canlı `https://yetkin.ai/` Pingdom Gzip F (0) + HTTP istek notu C (72); sıkıştırma mühürü; istek/paket yüzeyi |
| Kaynak | Kod SSOT (`next.config.ts`, `proxy.ts`) + canlı kenar başlıkları + `docs/har.json` (Pingdom HAR, 16 Eylül 2026 17:29 UTC) |
| Statü | Tespit uygulandı. Gzip/Brotli zaten açıktı; sahte `Content-Encoding` basılmadı. `poweredByHeader: false` mühürlendi. Build ve test yeşil. |

Çelişkide `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır. Bu rapor ürün kodunu import etmez; `docs/DURUM.md` ile aynı sınıftadır.

---

## 0. Yönetici özeti

**Pingdom Gzip F (0) bir üretim arızası değildir.** Canlı kenar, tarayıcının `Accept-Encoding` değerine göre Brotli (`br`) veya Gzip basar. Pingdom kuralı yalnızca `Content-Encoding: gzip` arar; `br` yanıtını «sıkıştırılmamış» sayıp 0 yazar. Bu, Vercel + Cloudflare + Pingdom üçlüsünde bilinen yanlış negatiftir.

**«HTTP İstek Sayısı C (72)» 72 istek demek değildir.** Pingdom not biçimi `Harf (skor/100)` şeklindedir. Gzip F **(0)** bir skordur; C **(72)** de aynı kuralın 72/100 puanıdır. Aynı Pingdom HAR’ında ana sayfa **13 HTTP isteği**dir ve **13/13 Brotli** taşır.

**«Sayfa boyutu 0,0 B» HAR ile çelişir.** Aynı koşunun HAR’ı açılmış **746.317 B** / transfer **202.813 B** gösterir. 0,0 B ya Pingdom’un gzip tasarrufunu (tanımadığı brotli) sıfır yazmasıdır ya da ayrı bir Cloudflare challenge koşusudur. Eldeki HAR kalkanı geçmiş gerçek 200 yanıtıdır (`cf-mitigated` yok, `x-matched-path: /`, nonce’lu CSP).

**Asıl hız faturası sıkıştırma değil TTFB’dir.** HTML `wait` ≈ **2,6 sn**; `Cache-Control: private, no-store`; `cf-cache-status: DYNAMIC`; köken `iad1` (ABD Doğu). Ana sayfa `connection()` yüzünden dinamiktir — nonce CSP ile HTML kenarda cache’lenmez.

---

## ADIM 1 — Mevcut yapı ve conf analizi

### 1.1 Next.js / Vercel / Cloudflare sıkıştırma

| Katman | Durum | Not |
|--------|--------|-----|
| `next.config.ts` `compress` | **Zaten `true`** | Next 16 varsayılanı da açıktır. `next start` için gzip mühürüdür. |
| Elle `Content-Encoding` | **Yok (doğru)** | Vercel belgesi: bu başlığı elle basmak çift sıkıştırma bozar. |
| Vercel CDN | **Brotli öncelikli, gzip yedek** | `Accept-Encoding: br` → `br`; yalnız `gzip` → `gzip`. |
| Cloudflare | Proxy açık (`server: cloudflare`, `CF-RAY`) | HTML `DYNAMIC` (cache yok). Statik `_next/static` HIT/MISS. |
| `vercel.json` | Yok | Gerekmez; sıkıştırma kenarda otomatik. |
| `proxy.ts` matcher | `/_next/static`, font, medya, ikon kenar worker dışı | CDN sıkıştırması ve immutable cache kesilmesin diye. |

Next 16 doktrini (`node_modules/next/dist/docs/.../compress.md`): sıkıştırmayı kapatmak ancak başka bir sunucu (nginx vb.) Brotli basıyorsa doğrudur. Vercel kenarı zaten Brotli+Gzip müzakere eder; `compress: false` yapılmadı.

### 1.2 Canlı yanıt başlıkları (17 Eylül 2026, IST)

`GET https://yetkin.ai/` — üç `Accept-Encoding` koşusu:

| İstemci `Accept-Encoding` | `Content-Encoding` | İndirilen gövde | TTFB |
|---------------------------|--------------------|-----------------|------|
| `gzip, deflate, br` | **`br`** | 8.639 B | 1,68 sn (soğuk) |
| `gzip` | **`gzip`** | 8.461 B | 0,32 sn |
| (yok / `identity`) | yok | **53.000 B** | 0,31 sn |

Aynı HTML açılmış boyutu HAR ile birebir **53.000 B**. Sıkıştırma oranı ≈ **%84**. Gzip ve Brotli bu belgede farklı nonce’lu HTML’lere denk geldiği için bayt farkı algoritma kıyası değildir; her ikisi de basılır.

Statik CSS (`/_next/static/immutable/chunks/37ogl9ky01vnv.css`): `Content-Encoding: br`, `Cache-Control: public, max-age=31536000, immutable`, `x-vercel-cache: HIT`.

### 1.3 Pingdom HAR (16 Eylül 2026) — kaynak envanteri

Kaynak: `docs/har.json`. Koşucu: Pingdom. Hedef: `https://yetkin.ai/`. `onLoad` 3366 ms, `fullyLoaded` 3589 ms.

| # | Yol | Tür | Açılmış | Transfer | Encoding | CF cache | Vercel cache | wait |
|---|-----|-----|---------|----------|----------|----------|--------------|------|
| 1 | `/` | HTML | 53.000 | 9.926 | **br** | DYNAMIC | MISS | **2638 ms** |
| 2 | `/cdn-cgi/.../email-decode.min.js` | JS (Cloudflare) | 1.239 | 908 | **br** | — | — | 14 ms |
| 3–11 | `/_next/static/immutable/chunks/*.js` (9 adet) | JS | 482.950 | 153.400 | **br** | HIT/MISS | MISS | 23–464 ms |
| 12 | `.../37ogl9ky01vnv.css` | CSS | **208.149** | 37.057 | **br** | MISS | MISS | 442 ms |
| 13 | `/icon.svg?...` | SVG | 979 | 1.522 | **br** | REVALIDATED | MISS | 224 ms |
| | **Toplam** | **13 istek** | **746.317** | **202.813** | **13/13 br** | | | |

Sıkıştırılmamış satır **yok**. Gzip F (0), «bileşenler sıkıştırılmıyor» iddiasını HAR yalanlar.

Küçük SVG’de Brotli transferi açılmış boyuttan büyüktür (979 → 1.522). Kenar allow-list’i küçük ikonları da sıkıştırır; zarar önemsizdir, kapatılmaz.

### 1.4 HTTP istek yüzeyi — nerede şişme var?

Bağımlılık ağacı incedir: Next 16 + React 19 + Prisma/Supabase sunucu tarafı. `lucide-react`, `framer-motion`, `@mui`, `lodash` yok. Sistem fontu (`Segoe UI`); `next/font` yok. Yasal nav `prefetch={false}`.

Kalan şişme:

1. **Turbopack chunk’ları (9–11 JS).** HTTP/2 altında doğru modeldir. Pingdom’un «dosyaları birleştir» kuralı HTTP/1.1 dönemindendir; skor C (72) buradan gelir.
2. **Tek CSS 208 KB açılmış / 37 KB br.** `app/globals.css` ≈ 4,7k satır; Tailwind v4 `@source` tüm `components/**` ve `lib/**` tarar. Akademi karaoke / sinema / oda temaları (Studio, Arena, Junior, DevLabs — donmuş odalar dahil) **ana sayfa CSS’ine girer.**
3. **Cloudflare Email Obfuscation.** Kod `mailto` içinde `@` → `%40` ve JSON-LD içinde `\u0040` basar; kenar yine `email-decode.min.js` enjekte eder (HAR #2). Fazladan 1 istek, ürün JS’i değil.
4. **Ana sayfa tamamen dinamik.** Kök `app/layout.tsx` `connection()` ile nonce CSP ister. Build çıktısı: `/` dahil kamu HTML’lerinin çoğu `ƒ` (server-rendered on demand). Cloudflare HTML cache’leyemez.

---

## ADIM 2 — Optimizasyon ve uygulama

### 2.1 Yapılan / yapılmayan

| Karar | Gerekçe |
|-------|---------|
| `compress: true` **korundu** (zaten açıktı) | Next `next start` gzip mühürü. Kapatmak yalnızca başka katman Brotli basıyorsa doğrudur; Vercel kenarı zaten basar. |
| `Content-Encoding: gzip` **basılmadı** | Vercel/Cloudflare müzakeresini ezer; çift sıkıştırma tarayıcıyı bozar. Pingdom notu için sahte başlık yasaktır. |
| Brotli kapatılmadı | Pingdom’u memnun etmek gerçek kullanıcıyı (br) yavaşlatır. |
| `poweredByHeader: false` **eklendi** | Canlıda `x-powered-by: Next.js` vardı. Gövdeyi küçültmez; parmak izini siler. |
| Mühür testi | `tests/kernel/performance-headers-surface.test.ts` — `compress: true`, `poweredByHeader: false`, elle `Content-Encoding` yok. |

`next.config.ts` ilgili mühür:

```ts
compress: true,
poweredByHeader: false,
```

### 2.2 Üretim build

`npm run build` — **çıkış 0.** Next.js 16.3.1 Turbopack. Compile 38,7 sn; TypeScript 29,9 sn; 71 sayfa.

- Kamu HTML: neredeyse tamamı `ƒ` (dinamik). Beklenen: nonce CSP + `connection()`.
- Statik kalan: `icon.svg`, `apple-icon.png`, `robots.txt`, `sitemap.xml`, OG/Twitter görselleri.
- `verify:prebuild` (sır, amount-minor, RLS, v1 sözleşme, IDOR, runtime-readiness) yeşil.

Lab uyarısı (bu işin konusu değil, kayıt): yerel `TRUSTED_PROXY_HOPS=1`; canlı Cloudflare+Vercel reçetesi **2**.

### 2.3 Test

| Komut | Sonuç |
|-------|--------|
| `npm run test` | **209 dosya, 973 test, geçti** (49,5 sn) |
| `vitest run tests/kernel/performance-headers-surface.test.ts` | **3/3 geçti** (suite `npm run test` dışı; `*surface.test.ts` exclude) |

Sistem kırılmadı.

---

## ADIM 3 — Tarafsız görüş (ben olsam ne yapardım)

### 3.1 Sayfa boyutu 0,0 B — Cloudflare bot kalkanı mı?

**Bu HAR için hayır.** Yanıt 200, Next eşleşme başlığı var, CSP nonce var, 10+ chunk inmiş. Bot Fight / JS challenge olsa gövde «Just a moment…» olur, `_next/static` inmez, çoğu zaman `cf-mitigated` görünür.

**Başka bir Pingdom özetinde 0,0 B + 1 istek görürseniz evet, kalkan.** Pingdom bot UA (`PingdomPageSpeed` / `pingbot/2.0`) Bot Fight, WAF, Under Attack veya Super Bot Fight Mode’da challenge yer. Özet 0 bayt yazar; HAR’a asıl sayfa hiç girmez.

**Aynı koşunun 0,0 B yazıp HAR’ın 200 KB transfer göstermesi Pingdom bug’ıdır.** Araç gzip tasarrufunu ölçer; `br` görünce tasarrufu 0 basar. Sayfa boyutu satırı da buna bağlanır.

**Ne yapmam:** Bot Fight’ı Pingdom için kapatmam. Sıkıştırmayı gzip-only’ye düşürmem. Pingdom’u sıkıştırma hakemi saymam.

**Ne yaparım:** Cloudflare’de **Email Address Obfuscation** kapatılır (ürün zaten `%40` / `\u0040` basıyor; `email-decode.min.js` gereksiz 1 istek). Pingdom / Uptime robotlarına WAF allowlist (IP veya UA) ayrı kural olur; kamu Bot Fight vatandaş için açık kalır. Sıkıştırma doğrulaması `curl` + WebPageTest + Lighthouse; Pingdom değil.

### 3.2 Dünya standardı için sıradaki adımlar (öncelik sırası)

Sıkıştırma kapalı **değildir**. Notu düzeltmek platformu hızlandırmaz. Sıra:

1. **TTFB / köken bölgesi.** HAR ve canlı `x-vercel-id` kökeni `iad1` (Washington). Kenar `cdg1` / `fra1`. Türkiye ve AB vatandaşı her HTML’de Atlas okyanusunu geçer. Vercel Function bölgesini **Frankfurt (`fra1`)** veya yakın EU yapmak, Gzip notundan büyük kazançtır. Hedef: HTML TTFB &lt; 400 ms (şu an HAR 2,6 sn).

2. **Ana sayfa CSS’ini oda CSS’sinden ayır.** 208 KB CSS’in çoğu Akademi oynatıcı + donmuş oda temasıdır. `globals.css` içindeki `.academy-*` / `.room-*` / Studio-Arena-Junior blokları `app/academy/layout.tsx` (ve ilgili oda layout’ları) altına taşınır. Ana sayfa CSS hedefi: açılmış &lt; 40 KB, br &lt; 10 KB. Bu, tek satırda en büyük bayt düşüşüdür.

3. **HTML cache ile nonce CSP gerilimi.** `connection()` her `/` isteğini dinamik ve `no-store` yapar. Güvenlik (nonce + `strict-dynamic`) doğrudur; bedeli kenar cache yokluğudur. İki yol: (a) kamu vitrini için hash-tabanlı CSP (nonce yok, HTML statik + s-maxage), (b) nonce kalır, TTFB’yi bölge ve sunucu bütçesiyle öderiz. **Nonce’u sessizce sökmem** — A katmanı güvenlik.

4. **Chunk sayısını Pingdom için birleştirmem.** HTTP/2 + immutable hash doğru modeldir. Birleştirmek önbelleği cezalandırır. C (72) kabul edilir veya araç Lighthouse’a çevrilir.

5. **LCP / CrUX.** Google arama ve gerçek kullanıcı: Core Web Vitals (LCP, INP, CLS), CrUX, SpeedCurve veya WebPageTest (İstanbul + Frankfurt). Pingdom YSlow kural seti 2010’lardır.

6. **Akademi oynatıcı.** Katalog / oyna sayfasında medya (MP3, SVG diyagram) istek sayısı gerçekten şişer. Bunu ana sayfa Pingdom’u ile karıştırmam. `loading="lazy"`, `preload` yalnız LCP kaseti, cinema poster AVIF (zaten `images.formats`).

7. **Ölçüm disiplini.** Her yayın sonrası üç komut: `curl -sI -H "Accept-Encoding: br, gzip" https://yetkin.ai/` → `content-encoding`; aynı CSS/JS hash’ine; WebPageTest filmstrip. Pingdom F (0) alarmı kapatılır veya «yalnızca gzip bakıyor» diye etiketlenir.

### 3.3 Bilinçli olarak yapmayacaklarım

- Pingdom’u yeşile çekmek için Brotli kapatmak.
- `vercel.json` içine `Content-Encoding: gzip` yazmak.
- Ana sayfadaki `Link` prefetch’ini körlemesine kapatmak (gerçek gezinmeyi cezalandırır; yasal nav zaten `prefetch={false}`).
- `experimental.optimizePackageImports` ile hayali ikon kütüphanesi eklemek — ağaçta yok.

---

## SUPER ADMIN’e bildirim

1. **Gzip F (0) yanlış negatiftir.** Canlıda Brotli ve Gzip çalışıyor. HAR 13/13 `content-encoding: br`. `curl` ile `br` / `gzip` / identity teyit edildi. Kodda `compress: true` zaten vardı; sahte gzip başlığı basılmadı.
2. **C (72) ≈ 13 istek, 72 istek değil.** Pingdom kural skoru 72/100. Ana sayfa 9–11 JS chunk + 1 şişkin CSS + 1 Cloudflare e-posta scripti.
3. **0,0 B bu HAR’ın gerçeği değildir.** Transfer ≈ 203 KB. 0,0 B ya gzip-tasarruf satırı ya ayrı bir bot-challenge koşusu. Eldeki HAR kalkanı geçmiştir.
4. **Uygulanan kod:** `poweredByHeader: false` + mühür testi. `npm run build` çıkış 0. `npm run test` **973/973**. Surface mühür **3/3**.
5. **Hızı dünyaya taşıyan iş sıkıştırma değil:** (1) Vercel kökenini EU’ya almak, (2) Akademi/oda CSS’ini ana sayfadan ayırmak, (3) Cloudflare e-posta obfuscation’ı kapatmak, (4) ölçümü Lighthouse/CrUX’a almak.

Onay istenen operatör işi (kod dışı): Cloudflare Dashboard → Email Address Obfuscation **off**; Vercel Function region **fra1** değerlendirmesi; Pingdom Gzip kuralının alarm dışı bırakılması.
