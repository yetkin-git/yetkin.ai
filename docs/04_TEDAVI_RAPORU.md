# 04 — Tedavi Raporu (Canlı vitrin hizalama ve Production deploy)

| Alan | Değer |
|------|--------|
| Tarih | 8 Eylül 2026 |
| Makam | Cursor ajanı (Grok 4.6) — 04 nolu acil deploy |
| Kanon | `origin/main` @ `76886df` → Vercel Production `dpl_4rCwHKbrySarK6bdXQEFfrsJph6c` |
| Hedef | Canlı `https://yetkin.ai` PayTR risk incelemesine Akademi/eğitim yüzü bassın |
| Durum | **Canlı vitrin YEŞİL.** Paket 1 (T0+T3) + Paket 2 (T2) Production’da. Dış doğrulama (`/`, `/academy`, `/sitemap.xml`) kapandı. |
| Girdi | `/docs/01_TESPIT_RAPORU.md`, `/docs/02_TEDAVI_RAPORU.md`, `/docs/03_TEDAVI_RAPORU.md` |
| Çıktı | Production deploy + bu rapor |

**Okuma notu:** Önceki 04 taslağı “deploy olmadı” denetimiydi. Bu belge o taslağın yerine geçer: kod `origin/main`’e basıldı, Vercel Production Ready, kamu yüzü ölçülerek mühürlendi.

---

## 0. Yönetici özeti

1. **Deploy tamam.** T0 / T2 / T3 yerel kanonu `8c41b9b` ile `origin/main`’e gitti. İlk Production derlemesi TypeScript test imzasında düştü; `76886df` ile kapatıldı. Canlı alias `https://yetkin.ai` yeni sürüme bağlandı.
2. **PayTR radar kopyası canlı ana sayfadan kalktı.** H1 “Yetkinliğini kanıtlayan yapay zekâ eğitimleri”; birincil CTA yalnız “Eğitimleri İncele”. “Freelancer”, “İlan ver veya teklif et”, “Split pasifken…”, “Ödeme henüz bağlanmadı” **yok**.
3. **Akademi vitrin 5 compact SKU.** `GET /academy` yalnız `01_office_ai` … `05_prompt_practice`. Eski Python / Full-Stack / sızma / Ads / Canva kartı yok. `GET /sitemap.xml` HTTP 200 ve aynı 5 kurs `loc` basıyor. Eski `/academy/python-temel` **301** → `/academy`.

---

## 1. Adım 1 — Yayın (push & Production)

### 1.1 Git

| | |
|--|--|
| Önceki HEAD | `1890031` `fix(paytr): correct HMAC signature string ordering…` |
| Vitrin commit | `8c41b9b` `feat(storefront): ship academy-first PayTR vitrine to production` (487 dosya) |
| Derleme yaması | `76886df` `fix(build): satisfy ProcessEnv in trusted-proxy tests` |
| Remote | `https://github.com/yetkin-git/yetkin.ai.git` `main` |

Deploy öncesi ana sayfada hâlâ dipnot “Freelancer / Platform örneği” vardı. PayTR’ın gördüğü kahraman kopyasını tekrar üretmemek için dipnot (Kariyer + Freelancer) kamu inişinden **silindi**; kahraman yalnız Akademi. Bu, Paket 1’in “dipnota çek” kararının üzerine, denetçi yüzeyi için ekstra kesimdir. `/freelancer` oda kodu silinmedi; kamu H1/CTA’da yoktur.

### 1.2 Vercel Production

| | |
|--|--|
| İlk deneme | `yetkin-o7skslqkg` **Error** — `tests/kernel/trusted-proxy.test.ts` `ProcessEnv.NODE_ENV` |
| Canlı sürüm | `https://yetkin-2asgzg6dk-yetkin-git.vercel.app` **Ready** (~17:16 TR) |
| Deployment id | `dpl_4rCwHKbrySarK6bdXQEFfrsJph6c` |
| Alias | `https://yetkin.ai`, `https://www.yetkin.ai` |

Tohum SQL / `ops:migrate` bu oturumda Production DB’ye basılmadı. Vitrin 5 SKU **kod filtresi** ile düşer (`ACADEMY_GROWTH_SKU_SLUGS`). Eski satır `is_published` bayrağı ayrıca kapatılmadıysa bile ızgaraya girmez. Operatör isteğe bağlı: Direct `:5432` ile `npm run ops:migrate` (idempotent seed).

---

## 2. Adım 2 — Canlı dış doğrulama

Ölçüm: 8 Eylül 2026 ~17:21 TR. `curl` + UTF-8 gövde taraması. `Cache-Control: no-cache`. `x-vercel-cache: MISS` (ana sayfa). Sır basılmadı.

### 2.1 `GET /` — Freelancer / pazaryeri blokları

| İstenen | Canlı |
|---------|--------|
| HTTP | **200**, `x-matched-path: /` |
| H1 | **Yetkinliğini kanıtlayan yapay zekâ eğitimleri** |
| Birincil CTA | **Eğitimleri İncele** → `/academy` |
| PayTR kopyası | “PayTR Merchant onayı sürecindedir… iFrame altyapısı hazırdır” **var** |
| `Freelancer` | **yok** |
| `İlan ver veya teklif et` | **yok** |
| `Split pasifken` | **yok** |
| `Ödeme henüz bağlanmadı` | **yok** |
| Eski H1 `Güvenli kariyer ve iş platformu` | **yok** |
| `İlan / İş` merdiveni | **yok** |

Header’da Giriş Yap / Kayıt Ol durur (hesap, pazar değil). Footer yasal künye + PayTR iFrame `frame-src` (`https://www.paytr.com`).

**Kapı: YEŞİL.**

### 2.2 `GET /academy` — 5 compact SKU

HTTP **200**. Kurs `href` kümesi:

| Slug | Durum |
|------|--------|
| `01_office_ai` | var |
| `02_ecommerce_ai` | var |
| `03_social_media_ai` | var |
| `04_chatbot_nocode` | var |
| `05_prompt_practice` | var |
| `python-temel` / `fullstack-*` / `ai-agent-*` / masterclass | **yok** |
| “Seslendirmeli İçerik” | **yok** |

Ek oda linkleri (`/academy/certificates`, `/academy/dogrula`) katalog SKU’su değildir.

**Kapı: YEŞİL.**

### 2.3 `GET /sitemap.xml` — 200 + 5 SKU

HTTP **200**, `Content-Type: application/xml`, `x-matched-path: /sitemap.xml`.

Kurs `loc` (yalnız bunlar):

- `https://yetkin.ai/academy/01_office_ai`
- `https://yetkin.ai/academy/02_ecommerce_ai`
- `https://yetkin.ai/academy/03_social_media_ai`
- `https://yetkin.ai/academy/04_chatbot_nocode`
- `https://yetkin.ai/academy/05_prompt_practice`

Eski `python-temel` / `ai-agent-*` / `fullstack-*` loc **yok**. `lastmod` 31 Ağustos sapması kapandı (statik yüzey `2026-09-05` kanonu).

Sitemap hâlâ oda yollarını basar: `/`, `/academy`, `/career`, `/freelancer` (öncelik 0.4), yasal sayfalar. Bu, “5 SKU basıyor mu?” sorusunu kırmızı yapmaz; denetçi XML’den `/freelancer` odasını **bulabilir**. §3’te öneri.

**Kapı: YEŞİL** (5 SKU). `/freelancer` loc dipnot riski: §3.

### 2.4 Ek (Paket 2 yönlendirme)

| Yüzey | Sonuç |
|-------|--------|
| `GET /academy/python-temel` | **301** `location: /academy` |
| `GET /academy/courses/python-temel` | **301** `location: /academy` |
| `GET /legal/gizlilik` | Yürürlük **5 Eylül 2026** (31 Ağustos yok) |

---

## 3. Stratejik değerlendirme

### 3.1 SEN OLSAYDIN NE YAPARDIN?

**Soru:** Deploy tamamlanıp canlı vitrin temizlendikten sonra, PayTR denetçisinin siteye tekrar girmesi durumunda onay sürecini hızlandırmak için atmamız gereken başka bir adım var mıdır?

**Cevap: Evet — teknik vitrin kapandı; hızlandırıcı adım kod değil, denetçiye yazılı bildirim + tarama yüzeyini Akademi’de tutmaktır. İkinci bir ürün PR’ı şart değildir; panel ve iletişim şarttır.**

Denetçi büyük olasılıkla (1) `https://yetkin.ai` ana sayfa, (2) bir-iki iç link, (3) ödeme / üye işyeri kategorisi bakar. Canlı H1 artık eğitim. Bunu **onlara söylemezseniz** eski ekran görüntüsü veya sitemap’teki `/freelancer` loc ile tekrar “pazaryeri mi?” sorusu açılır.

Yapardım, sırayla:

| # | Adım | Neden |
|---|------|--------|
| 1 | **PayTR risk / üye işyeri ekibine kısa yazı** (e-posta veya ticket): “Kamu yüzü yalnız Akademi eğitim satışıdır. Ana sayfa ve `/academy` beş compact kurs. Freelancer kahraman/CTA yoktur. Split kapalıdır.” Üç URL yapıştır: `/`, `/academy`, `/sitemap.xml` | İncelemeyi eski cache/screenshot’tan koparır; onay kuyruğunu “yeniden bak” diye öne çeker |
| 2 | **Merchant panel kategori / faaliyet** = dijital eğitim / içerik satışı (pazaryeri, emanet, cüzdan ağı değil) | Risk skoru NACE/faaliyet ile HTML’i birlikte okur |
| 3 | Denetçi oturumunda **giriş yapmayın**; `/dashboard`, `/freelancer`, `/cuzdan` gezdirmeyin | Oturumlu kabukta Freelancer odası hâlâ vardır (kod silinmedi). Kamu iniş temiz; tezgâh ayrı |
| 4 | İsteğe bağlı, aynı gün **küçük SEO kesimi** (zorunlu değil): `/freelancer` `robots: noindex` veya sitemap’ten loc düşürmek | XML’de `/freelancer` 0.4 öncelikle duruyor. Denetçi sitemap açarsa odayı görür. Ana sayfa temiz olduğu için bloklayıcı değildir; “hiç iz yok” istenirse bu tek PR yeter |
| 5 | Vercel Production teyidi (değer basmadan): `TRUSTED_PROXY_HOPS=2`. Build logunda hop **1** uyarı vardı | Vitrin onayı için şart değil; **iFrame T1** için şart. Onay yazısı gelir gelmez XFF çürümesin |
| 6 | `PAYTR_SANDBOX` / `PAYTR_ALLOW_MOCK_CHECKOUT` Production’da **boş**; Bildirim URL `https://yetkin.ai/api/paytr/callback`; Cloudflare’de bu path Bot Fight dışı | Onay sonrası ilk `CLEARED` için hazır dursun; vitrin turunda kart çekmeyin |
| 7 | Split / Junior **açılmasın** | Aynı turda pazaryeri sinyali geri gelir |

Yapmazdım: denetçiye “cüzdanı dene” demek; `/freelancer` 410 ile odayı yıkmak (kod ve tohum durur; 410 sahte “ürün yok” iddiası); ikinci mega PR ile T1’i aynı commit’te açmak; eski 13 kartın DB `DROP`’u.

Özet: **Hızlandırıcı adım, PayTR’a “yeniden bakın, yüz eğitim” yazısıdır.** Teknik kapı kapanmıştır. Sitemap `/freelancer` loc’u isteğe bağlı kozmetiktir; asıl koz panel yazısıdır.

---

## 4. SUPER ADMIN’e bildirim

Canlı `https://yetkin.ai` **Akademi vitrinine hizalandı.** PayTR’ın 8 Eylül’de gördüğü “Freelancer / İlan ver veya teklif et / Split pasifken” ana sayfa kopyası Production’da yoktur.

Lütfen sırayla:

1. Tarayıcıda (gizli pencere) doğrulayın:
   - `https://yetkin.ai` → H1 eğitim; tek kahraman CTA “Eğitimleri İncele”; Freelancer kelimesi yok
   - `https://yetkin.ai/academy` → 5 kart
   - `https://yetkin.ai/sitemap.xml` → 5 kurs loc, HTTP 200
2. **PayTR risk ekibine ticket/e-posta:** site yeniden eğitim vitrinidir; yukarıdaki üç URL. Eski ekran görüntüsü geçersizdir.
3. Merchant panel faaliyet kodunun eğitim/dijital içerik olduğunu kontrol edin.
4. `TRUSTED_PROXY_HOPS=2` Production env (Dashboard). T1’den önce.
5. İsteğe bağlı: `/freelancer` noindex veya sitemap loc kesimi — denetçi XML açarsa.
6. `ops:migrate` (Direct `:5432`) eski kurs `is_published=false` — vitrin zaten kodda 5 SKU; bayrak kemer/askı.
7. Merchant iFrame onayı gelmeden kart çekmeyin. T1 hâlâ Super Admin cüzdan ₺10 + `CLEARED` üçlüsü (Paket 3 kontrol listesi). Split/Junior kapalı kalsın.

`MARKETPLACE_SPLIT_LIVE = false` değişmedi.

Tedavi Aşaması 04 kapanışı: canlı vitrin mühürlendi — `/docs/04_TEDAVI_RAPORU.md`.
