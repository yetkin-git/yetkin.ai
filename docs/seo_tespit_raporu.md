# yetkin.ai — Academy ve Office AI SEO / Teknik İndeksleme Tespit Raporu

- **Tarih:** 20 Eylül 2026
- **Kapsam:** `https://yetkin.ai/academy/01_office_ai` (Amiral SKU) + `/academy` vitrini + global SEO altyapısı
- **Yöntem:** Statik kod taraması (SSR/SSG, `generateMetadata`, JSON-LD, sitemap, robots, müfredat kilidi). Canlı Google Search Console / Lighthouse ölçümü bu raporda yoktur.
- **SSOT dosyalar:** `lib/copy/seo.ts`, `lib/copy/json-ld.ts`, `lib/copy/sem-keywords.ts`, `lib/academy/pilot-sku.ts`, `lib/kernel/catalog-ids`, `app/sitemap.ts`, `app/robots.ts`, `next.config.ts`

---

## ADIM 1 — Teknik SEO ve Meta Etiket Tespiti

### 1.1 Taranan `generateMetadata` / `metadata` yüzeyleri

| Rota | Dosya | Meta kaynağı | Not |
|---|---|---|---|
| Global kabuk | `app/layout.tsx` | `export const metadata` + `TITLE_TEMPLATE` | `metadataBase = https://yetkin.ai`, `default = PUBLIC_SEN.home.title`, `template = %s · yetkin.ai` |
| Akademi kabuğu | `app/academy/layout.tsx` | `export const metadata = pageMetadata(PAGE_SEO.academy)` | Tüm `/academy/*` altına miras kalır |
| Akademi vitrin | `app/academy/page.tsx` | **YOK — `metadata`/`generateMetadata` export edilmiyor** | `app/academy/layout.tsx` meta'sını kullanır (bilerek ya da eksik — 1.4'te ele alındı) |
| Kurs antre (amiral) | `app/academy/[slug]/page.tsx` | `export async function generateMetadata({ params })` | `dynamicParams=false`, `generateStaticParams()` yalnız mühürlü SKU |
| Eski alias | `app/academy/courses/[slug]/page.tsx` | **YOK (301 only)** | `permanentRedirect(/academy/:slug)` + `next.config.ts` 301 — duplicate basmaz ✅ |
| Ana sayfa | `app/(public)/page.tsx` | `export const metadata = pageMetadata(PAGE_SEO.home)` |  |
| Dogrula iniş | `app/academy/dogrula/page.tsx` | `pageMetadata(PAGE_SEO.academyVerify)` |  |
| Dogrula sicil | `app/academy/dogrula/[hash]/page.tsx` | `generateMetadata` → `academyVerifyShareMetadata()` | `noindex` yok — 2.4'te risk olarak işaretlendi |

Global kabuk (`app/layout.tsx`):

```tsx
// app/layout.tsx — 18..34
const homeSeo = pageMetadata(PAGE_SEO.home);

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_ORIGIN), // https://yetkin.ai
  title: {
    default: PUBLIC_SEN.home.title,
    template: TITLE_TEMPLATE, // `%s · yetkin.ai`
  },
  description: homeSeo.description,
  alternates: homeSeo.alternates,
  openGraph: { ...homeSeo.openGraph, siteName: YETKIN_BRAND },
  twitter: homeSeo.twitter,
};
```

Akademi kabuğu (`app/academy/layout.tsx`):

```tsx
// app/academy/layout.tsx — 1..7
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.academy);
```

Kurs antre (`app/academy/[slug]/page.tsx`):

```tsx
// app/academy/[slug]/page.tsx — 61..88
export function generateStaticParams() {
  return academyStorefrontStaticParams(); // yalnız ["01_office_ai"]
}
export const dynamicParams = false;

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  if (!isAcademyGrowthSkuSlug(slug)) notFound();
  const course = resolveAcademyCourseFromSeed(slug);
  if (!course) notFound();
  return pageMetadata({
    title: `${course.title} · Akademi`,
    description: course.summary,
    path: `/academy/${course.slug}`,
    image: academyCourseCoverPath(course.slug) ?? DEFAULT_OG_IMAGE,
  });
}
```

Ortak üretici (`lib/copy/seo.ts` → `pageMetadata`):

```ts
// lib/copy/seo.ts — 168..189
export function pageMetadata({ title, description, path, robots, image }): Metadata {
  const images = image ? [{ url: image, alt: title }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path }, // metadataBase ile mutlaka dönüşür
    openGraph: {
      type: "website", locale: "tr_TR", url: path,
      siteName: YETKIN_BRAND, title, description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image", title, description,
      ...(image ? { images: [image] } : {}),
    },
    ...(robots ? { robots } : {}),
  };
}
```

> **Tespit:** `pageMetadata` içinde `keywords`, `authors`, `creator`, `alternates.languages/hreflang`, `robots` (kurs sayfasında çağrılmıyor) yoktur. Google `keywords`'ü yok sayar; bu bir ceza sebebi değil, ancak görev maddesi gereği "tanımlı keywords: YOK" olarak raporlanır.

### 1.2 `01_office_ai` landing — çözümlenmiş meta etiket listesi

Ham kaynaklar:

- Başlık SSOT: `packages/kernel/src/catalog-ids/course-slugs.ts` → `ACADEMY_COURSE_TITLES["01_office_ai"]`
- Özet SSOT: `lib/academy/catalog-summaries.ts` → `ACADEMY_CATALOG_SUMMARIES["01_office_ai"]`
- Kapak SSOT: `lib/academy/course-cover.ts` → `academyCourseCoverPath("01_office_ai")`

| Meta | Çözümlenmiş değer |
|---|---|
| `title` (ham kurs başlığı) | `İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği)` — **81 karakter** |
| `title` (`generateMetadata` çıktısı) | `İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği) · Akademi` — **91 karakter** |
| `title` (final, `TITLE_TEMPLATE` sonrası) | `İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği) · Akademi · yetkin.ai` — **103 karakter** ⚠️ |
| `description` | `A1’den temiz Excel, KVKK maskeleme, üç maddelik yönetim özeti, slayt, hata avı, e-posta ritüeli, Gmail/Outlook aksiyon listesi, Word’de dilekçe ve rapor, Cuma 30 kapanış rutini.` — **177 karakter** |
| `keywords` | **Tanımlı değil** (`pageMetadata` üretmiyor; sitede hiçbir sayfada yok) |
| `canonical` | `https://yetkin.ai/academy/01_office_ai` (göreli `path` + `metadataBase` → mutlak) ✅ |
| `robots` | Tanımlı değil → varsayılan `index, follow` ✅ (kurs sayfası indekslenebilir) |
| `openGraph:type` | `website` |
| `openGraph:locale` | `tr_TR` ✅ |
| `openGraph:url` | `/academy/01_office_ai` (metadataBase ile mutlaka dönüşür) |
| `openGraph:siteName` | `yetkin.ai` |
| `openGraph:title` / `description` | Yukarıdaki title/description ile aynı |
| `openGraph:image` | `/academy/cinema/01_office_ai-1-eye.webp` (amiral 1. bölüm sinema plakası; `academyCourseCoverPath`) ✅ |
| `openGraph:image:alt` | Kurs `title` (91 karakterlik varyant) |
| `twitter:card` | `summary_large_image` ✅ |
| `twitter:title` / `description` / `image` | OG ile aynı |
| Kök OG plakası (fallback) | `app/opengraph-image.tsx` → 1200×630 PNG, `DEFAULT_OG_IMAGE = "/opengraph-image"` |
| H1 | `PageHeader title={board.course.title}` → ham 81 karakterlik başlıkla birebir aynı (SSR) |
| H2/H3 iskeleti | `CurriculumOutcomes` Card title `Bu yolda ne kazanırsın`, `CurriculumOutline` Card title `Ders listesi` + `Modül N` H3'leri + `LandingFaq` yok (kurs sayfasında FAQ basılmıyor — 2.1'de eksik) |

Karşılaştırma (ebeveyn sayfalar):

| Sayfa | Title (final) | Uzunluk | Description uzunluğu |
|---|---|---|---|
| `/` (home) | `Yapay zekâ yetkinliğini kanıtla, kariyerini mühürle` (+ template uygulanmaz, `default`) | 51 kr ✅ | 226 kr ⚠️ uzun |
| `/academy` | `Yapay zeka eğitimi ve online kurslar · yetkin.ai` | 48 kr ✅ | 277 kr 🔴 çok uzun |
| `/academy/01_office_ai` | 103 kr (yukarıda) | 🔴 çok uzun | 177 kr ⚠️ sınırda |

Ölçüm notu: karakter sayıları `node` ile UTF-16 code-point sayımıdır; `â`, `·`, `’` tek karakter sayılır.

### 1.3 Arama niyeti (Search Intent) ve uzunluk değerlendirmesi

**Olumlu:**

1. Ham başlık `Excel, Word, PowerPoint, E-Posta` araç adlarını taşıyor. "Excel yapay zekâ eğitimi", "Word AI yetkinlik", "ofiste ChatGPT" niyet kümelerine kısmen göz kırpıyor.
2. Description 9 dersin tamamına gönderme yapıyor (`Excel → KVKK → özet → slayt → hata avı → e-posta → Gmail/Outlook → Word → Cuma 30`). Müfredat SSOT (`lib/academy/curricula/office_ai/index.ts` + `lesson-index.ts`) ile birebir örtüşüyor; uydurma vaat yok.
3. `canonical`, `og:locale=tr_TR`, `summary_large_image`, `metadataBase` doğru kurgulanmış. Türkçe SERP için temel teknik zemin sağlam.
4. `/academy/courses/:slug` → `/academy/:slug` 301 (`next.config.ts` 122-128 + alias `permanentRedirect`) duplicate'i kapatıyor. Emekli SKU'lar `academyRetiredStorefrontRedirects()` ile `/academy`'ye 301.

**Kritik sorunlar:**

1. **Title 103 karakter — SERP'te kesilecek (P0).** Google desktop ~60 karakter / ~580px sonrası `...` keser. Mevcut final title'da kesinti tahmini:
   - `İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Po...`
   - Kaybedilen kuyruk: `E-Posta Verimliliği) · Akademi · yetkin.ai` — yani hem farklılaştırıcı (`E-Posta`) hem marka.
   - Mobilde durum daha ağır (~55-60 kr). "Excel Yapay Zeka Eğitimi" gibi para-keyword title'ın başında değil; parantez içinde 3. sırada.
2. **Para-keyword'ler eksik.** Title + description + H1 üçlüsünde hiç geçmeyen yüksek niyetli dizgiler:
   - `eğitimi` / `kursu` (title'da yok; description'da yok; H1'de yok)
   - `ChatGPT`, `Copilot`, `Gemini`, `Claude` (description'da `Gmail/Outlook` var ama model adı yok; `SEM_LANDING_KEYWORDS` de bunları taşımıyor)
   - `sertifikalı`, `sertifika`, `online kurs` (kurs description'ında yok; akademi description'ında var ama kursa miras kalmıyor)
   - `Excel yapay zekâ eğitimi` tam eşleşmesi hiçbir meta/H1'de yok.
3. **Description 177 karakter — fayda/CTA dili yok.** Mevcut metin virgülle dizilmiş özellik listesi. Tıklama niyeti (`Sertifika`, `70+ baraj`, `9 ders`, `Sesli anlatım`, fiyat/süre) taşımıyor. Google 155-160 karakter sonrası keser; `Cuma 30 kapanış rutini.` kuyruğu masaüstünde görünmeyebilir. Mobilde ~120 karakter kesilir: `...slayt, hata avı, e-posta ritüeli, Gmail/Outlook aksiyon liste...` sonrası kayıp.
4. **`/academy` description 277 karakter** — SERP'te %40'ı çöp. `Akademi yalnız mühürlü müfredatı satar.` gibi iç jargon (`mühür`) arama kullanıcısına bir şey söylemiyor.
5. **`keywords` meta yok.** Google için zararsız, ancak görev gereği not: rakip analiz araçları (Ahrefs/Semrush site-audit) bunu "missing" diye işaretler. Eklenmesi önerilmez (spam sinyali); yerine title/H1/JSON-LD zenginleştirme önerilir.
6. **H1 = Title (birebir).** İdeal uygulamada H1 kullanıcı dilinde (`Excel'de Yapay Zekâ: 9 Derste Ofis Verimliliği + Sertifika`), title arama dilinde ayrışır. Mevcutta ikisi de 81 karakterlik aynı cümle → çeşitlilik ve CTR fırsatı kaçıyor.
7. **`og:type=website` kurs sayfasında `article`/`profile` değil — doğru, ancak `article:published_time` / `author` yok.** `Course` JSON-LD'de `datePublished` var (2026-08-21 seed), OG katmanında tekrar edilmiyor. Zorunlu değil.

**Niyet eşleşme tablosu (örnek sorgular):**

| Sorgu | Niyet | Mevcut karşılama | Hüküm |
|---|---|---|---|
| `excel yapay zeka eğitimi` | Transactional (kurs satın al) | Title'da `Excel` var, `eğitimi` yok; description'da `temiz Excel` var | 🟡 Kısmi — tam eşleşme yok |
| `ofiste chatgpt kullanımı` | Informational → Transactional | `ChatGPT` hiçbir meta/H1'de yok | 🔴 Yok |
| `word ai yetkinlik / dilekçe yapay zeka` | Transactional | `Word'de dilekçe ve rapor` description'da var; title'da `Word` var | 🟡 Kısmi |
| `gmail gemini e-posta verimlilik kursu` | Transactional | `Gmail/Outlook aksiyon listesi` var; `Gemini` yok | 🟡 Kısmi |
| `yapay zeka sertifikası ofis` | Transactional (belge) | Kurs metasında `sertifika` yok (sayfa gövdesinde var) | 🔴 Meta'da yok |
| `powerpoint sunum yapay zeka` | Informational | `PowerPoint` title'da, `slayt` description'da | 🟡 Kısmi |

---

## ADIM 2 — Structured Data (JSON-LD / Schema.org) ve İndekslenebilirlik

### 2.1 JSON-LD envanteri (dosya: `lib/copy/json-ld.ts`, bileşen: `components/seo/json-ld.tsx`)

| Sayfa | Basılan `@graph` | Kaynak |
|---|---|---|
| Tüm sayfalar (kök layout) | `Organization` (+ `EducationalOrganization` additionalType) + `WebSite` (`inLanguage: tr-TR`) | `app/layout.tsx` → `siteGraphJsonLd()` |
| `/` | + `FAQPage` (5 soru: `HOME_LANDING_FAQ`) | `app/(public)/page.tsx` + görünür `LandingFaq` ✅ (gizli markup yok) |
| `/academy` | + `FAQPage` (4 soru: `ACADEMY_LANDING_FAQ`) | `app/academy/page.tsx` + görünür `LandingFaq` ✅ |
| `/academy/01_office_ai` | + `Course` + `BreadcrumbList` (3 kırıntı: `yetkin.ai → Yapay zeka eğitimi... → Kurs başlığı`) | `app/academy/[slug]/page.tsx` 187-204 |
| `/academy/dogrula/[hash]` | JSON-LD yok (yalnız OG/Twitter) | — |

`Course` node'unun mevcut hali (`lib/copy/json-ld.ts` 95-129):

```jsonc
// courseJsonLd({ slug, title, description, imagePath, datePublished })
{
  "@type": "Course",
  "@id": "https://yetkin.ai/academy/01_office_ai#course",
  "name": "İş Hayatında ve Ofiste Yapay Zekâ (...)",
  "description": "A1’den temiz Excel, ...",
  "url": "https://yetkin.ai/academy/01_office_ai",
  "image": "https://yetkin.ai/academy/cinema/01_office_ai-1-eye.webp",
  "datePublished": "2026-08-21T15:00:00.000Z",
  "inLanguage": "tr",
  "educationalCredentialAwarded": "Yapay zeka sertifikası", // düz string
  "hasCourseInstance": { "@type": "CourseInstance", "courseMode": "Online", "inLanguage": "tr" },
  "provider": { "@type": "Organization", "@id": "https://yetkin.ai/#organization", "name": "yetkin.ai", "url": "https://yetkin.ai" }
}
```

`BreadcrumbList`:

```ts
// academyCourseBreadcrumbs — lib/copy/json-ld.ts 176..186
[
  { name: "yetkin.ai", path: "/" },
  { name: "Yapay zeka eğitimi ve online kurslar", path: "/academy" },
  { name: "<kurs başlığı>", path: "/academy/01_office_ai" },
]
```

### 2.2 Eksik / zayıf şemalar (görev sorularına yanıt)

| Şema | Durum | Hüküm |
|---|---|---|
| `Course` | ✅ Var (kurs sayfası) | Zayıf: `offers` (fiyat/para birimi), `aggregateRating`/`review`, `syllabus`/`hasPart`, `teaches`, `timeRequired`/`duration`, `coursePrerequisites` yok |
| `EducationalOccupationalCredential` | ❌ Yok | Yalnız `educationalCredentialAwarded: "Yapay zeka sertifikası"` düz string. Google zengin sonuç için tip'li node önerilir (bkz. Adım 4) |
| `BreadcrumbList` | ✅ Var (kurs sayfası) | Doğru; `item` mutlak URL ✅ |
| `FAQPage` | 🟡 Kısmi | `/` ve `/academy`'de var + görünür HTML ile eşleşiyor ✅. **Kurs sayfasında YOK** — en çok ihtiyaç duyulan yerde (SERP accordion + PAA fırsatı kaçıyor) |
| `ItemList` | ❌ Kullanılmıyor | `itemListJsonLd()` helper'ı `lib/copy/json-ld.ts` 145-163'te tanımlı ama hiçbir sayfada çağrılmıyor (ölü kod). `/academy` vitrinine `ItemList` basılmıyor |
| `Organization` / `WebSite` | ✅ Var (tüm sayfalar) | `logo=/icon.svg`, `sameAs=[WhatsApp]` (uydurma sosyal yok — dürüst ✅), `email=destek@yetkin.ai` |
| `VideoObject` / `AudioObject` / `LearningResource` | ❌ Yok | 9 mühürlü ses (`ACADEMY_MEDIA_SEALED_AUDIO`) ve sinema kapağı şemaya yansımıyor |
| `Product` + `offers` alternatifi | ❌ Yok | Kurs satışı için `Course` içine `offers` gömülmesi yeterli; ayrı `Product` gerekmez |

`serializeJsonLd` (`</script>` kaçışı + `@` → `\u0040` Cloudflare koruması) doğru uygulanmış. CSP `application/ld+json` için nonce istemiyor (`components/seo/json-ld.tsx` yorumu doğru).

### 2.3 Sitemap (`app/sitemap.ts` — dinamik; `public/sitemap.xml` YOK)

```ts
// app/sitemap.ts — 78..95
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-05"); // sabit mühür
  const staticEntries = staticSitemapEntries(lastModified);   // SITEMAP_STATIC_PATHS + /legal + LEGAL_SITE_PATHS
  const courseEntries = publishedAcademyCourseEntries(lastModified); // ACADEMY_GROWTH_SKU_SLUGS
  // ...dedupe by url
}
```

Politika (`lib/copy/seo.ts` → `sitemapRoutePolicy`):

| Yol | `changeFrequency` | `priority` |
|---|---|---|
| `/`, `/academy` | `weekly` | **1.0** |
| `/career` | `weekly` | 0.9 |
| `/academy/*` (`/academy/dogrula` hariç) | `weekly` | **0.8** ✅ |
| `/legal*`, `/iletisim`, `/hakkimizda` | `monthly` | 0.5 |
| Diğer (fallback: `/vize`, `/academy/dogrula`) | `weekly` | 0.7 |

**`/academy/01_office_ai` için yanıt: EVET, sitemap'te doğru öncelik ve sıklıkla yer alıyor.**

- `url`: `https://yetkin.ai/academy/01_office_ai` (mutlak, `publicSiteOrigin()` HTTPS guard'lı) ✅
- `priority: 0.8`, `changeFrequency: weekly` ✅ (amiral SKU için makul; `/academy` 1.0'ın bir altı)
- `images: ["https://yetkin.ai/academy/cinema/01_office_ai-1-eye.webp"]` — Google Görsel uzantısı ✅
- Kaynak SSOT: `ACADEMY_GROWTH_SKU_SLUGS` (yalnız `01_office_ai`; hayalet SKU sızmaz) ✅
- `lastModified: 2026-09-05` sabit — tüm girdilerde aynı. Dinamik `updatedAt` yok (iyileştirme fırsatı, ceza değil).

Kapsam dışı (doğru): `/academy/dogrula/[hash]` (SHA bloat engellenmiş ✅), `/academy/[slug]/oyna` (oynatıcı — sitemap'te yok ✅), `/api/*`, `/dashboard`, `/cuzdan`, `/kasa`, `/profil`, `/pasaport`, `/admin`, `/login`, `/register` (yok ✅).

Eksik (gelecek): `/blog/*`, `/rehber/*` rotaları henüz mevcut değil → sitemap politikasında dal yok. Eklendiğinde `sitemapRoutePolicy`'ye `/blog` dalı açılmalı (Adım 4.2).

### 2.4 Robots (`app/robots.ts` — dinamik; `public/robots.txt` YOK)

Normal mod:

```ts
// app/robots.ts — 17..26
{
  rules: {
    userAgent: "*",
    allow: [...SITEMAP_STATIC_PATHS, "/legal", ...LEGAL_SITE_PATHS],
    // → ["/", "/academy", "/career", "/academy/dogrula", "/vize", "/legal", ...yasal+iletisim+hakkımızda+mailto filtresi]
    disallow: [...ROBOTS_DISALLOW_PATHS],
    // → ["/dashboard","/freelancer","/admin","/login","/register","/cuzdan","/kasa","/profil","/pasaport","/api/"]
  },
  sitemap: "https://yetkin.ai/sitemap.xml",
}
```

| Kontrol | Sonuç |
|---|---|
| `/academy/01_office_ai` taranabilir mi? | **EVET** ✅ — `Allow: /academy` prefix eşleşmesi + `disallow` listesinde yok |
| `Sitemap:` mutlak mı? | `https://yetkin.ai/sitemap.xml` ✅ |
| `LIVE_BROADCAST_SHUTDOWN` / bakım modu | `Allow: [/legal, ...LEGAL, /iletisim, /hakkimizda]`, `Disallow: [/]` + aynı sitemap. Botlar akademiyi tarayamaz — **kilit açık kalırsa indeks çöküşü** (operasyonel risk, SEO değil) |
| `/academy/dogrula/[hash]` | **Taranabilir + `index` (noindex yok)** ⚠️ — sitemap'te yok ama `Allow: /academy` prefix'i kapsıyor; sertifika paylaşım linkleri (LinkedIn/X) dış bağlantı üretince Google keşfedip indeksleyebilir → binlerce thin SHA URL riski. Öneri: hash sayfasına `robots: { index: false, follow: true }` (Adım 4.3) |
| `/academy/01_office_ai/oyna` | **Taranabilir (engan yok)** ⚠️ — sitemap'te yok ama robots'ta da engel yok; auth duvarı botu karşılıyor ama `Disallow: /academy/*/oyna` veya sayfa `noindex` önerilir |
| `/freelancer` | `Disallow` ✅ (410 oda; `PAGE_SEO` girdisi de yok — tutarlı) |
| Statik dosya çakışması | `public/robots.txt` / `public/sitemap.xml` yok → Next dinamik route'lar tekil ✅ |

`next.config.ts` redirect notları (indeks hijyeni): `/kariyer→/career`, `/ogren→/academy`, `/verify→/academy/dogrula`, `/verify/:hash→/academy/dogrula/:hash`, `/p→/vize`, `/p/:id→/vize/:id`, `/academy/courses/:slug→/academy/:slug`, WAV→MP3 301. Hepsi `permanent: true` / 301 — link suyu korunur ✅.

---

## ADIM 3 — İçerik ve Arama Niyeti Kapsamı

### 3.1 Ödeme duvarı arkası vs. kamuya açık yüzey

Müfredat kilidi SSOT: `lib/academy/curriculum.ts` başlık yorumu — *"Gövde yalnız SETTLED satın alma sonrası API/sayfada açılır."*

**Kamuya açık (SSR, botsuz JS ile görünür) — `app/academy/[slug]/page.tsx`:**

| Blok | Bileşen | İçerik | SSR? |
|---|---|---|---|
| H1 + özet | `PageHeader` | Kurs başlığı (81 kr) + `board.course.summary` (177 kr) | ✅ Server |
| Hero rozetleri | `CourseHeroActions` (client shell, server props) | `Temel Seviye · OFF-101`, `Sesli Anlatım + Karaoke + Sınav + Mühürlü Sertifika`, fiyatlı CTA | ✅ HTML'de basılı (hydration sonrası etkileşim) |
| Öğrenim çıktıları | `CurriculumOutcomes` → `academyLearningOutcomesForSlug` | **9 madde** (`lib/academy/learning-outcomes.ts` 13-23): düzenli tablo, maskeleme, yönetim özeti, slayt, hata avı, kutu sıfırlama, Gmail/Outlook aksiyon, Word dilekçe/rapor, Cuma 30 | ✅ Server |
| Ders listesi | `CurriculumOutline` → `curriculumSyllabusForCourseSlug` | **9 ders başlığı + tür + süre** (Modül 1-3 gruplu): Tablonu Konuştur / KVKK Maskeleme / Rapor Otomasyonu / Metinden Slayta / Hata Avı / E-Posta Akışı / Gmail+Gemini / Word Analizi / Haftalık Sistem 30 | ✅ Server |
| Sınav vaadi | `CurriculumOutline` altı | `Baraj 70`, `9 ders bitmeden sınav açılmaz`, vize sözü | ✅ Server |
| Satın alma kartı | `Card` + `PurchaseButton` | `purchaseBody`, `libraryGuarantee` (365 gün), `SettlementSteps` | ✅ Metin SSR; buton client |
| JSON-LD | `JsonLd` | `Course` + `BreadcrumbList` | ✅ Server |

**Duvar arkası (Google'ın göremediği):**

| İçerik | Konum | Neden kapalı |
|---|---|---|
| 9 ders gövdesi (compact prose + alıştırma) | `lib/academy/curricula/office_ai/section_*.ts` → `curriculumForCourseSlug().body` | `loadCurriculumPlayerForUser` + `hasAcademyPlayerAccess` kilidi; antre `body`'yi hiç okumuyor ✅ doğru |
| 9 mühürlü ses + karaoke akışı | `ACADEMY_MEDIA_SEALED_AUDIO["01_office_ai"]` (1,2,3,4,5,6,g1,w1,k1) + `/media/academy/audio` | Oynatıcı + lisans kilidi |
| Transkript / ders notu PDF | `player.notesLabel`, PDF mührü | Tamamlama kilidi |
| Kendini-dene (3 soru) + sınav havuzu | `lesson-practice.ts`, `exam-pools-*` | Oturum + sıra kilidi |
| Yorumlar / değerlendirmeler | `discussion*`, `reviews*` | Kayıt kilidi |
| Mikro-video / diyagram | `LESSON_VISUALS` (compact SKU'da boş) | Yayınlanmamış |

**Kelime sayımı (yaklaşık, kamuya açık):** Başlık (12) + özet (~25) + 9 çıktı (~150) + 9 ders başlığı (~60) + sınav/satın alma metinleri (~150) ≈ **400-450 kelime**. Rakip "Excel yapay zeka kursu" landing'leri (Udemy/Academy tarzı) 1500-3000 kelime + SSS + eğitmen biyografisi basıyor. **İçerik derinliği farkı ~4-5 kat** — sıralama tavanının birincil sebebi teknik değil, kapsam.

### 3.2 JavaScript bağımlılığı / SSR boşluk denetimi

| Soru | Bulgu |
|---|---|
| Sayfa SSR mi? | **EVET** — `AcademyCoursePage` async Server Component; `JsonLd`, `PageHeader`, `CurriculumOutcomes`, `CurriculumOutline` tamamen SSR ✅ |
| Google botsuz JS ile H1 + müfredatı görür mü? | **EVET** — ders başlıkları, çıktılar, sınav barajı ilk HTML'de ✅ |
| Client adaları içeriği gizliyor mu? | **HAYIR** — `CourseHeroActions` ve `PurchaseButton` `"use client"` ama metin/href'leri server props olarak alıyor; SSR HTML'de anchor + fiyat mevcut. `window.dispatchEvent(ACADEMY_HERO_PAYTR_EVENT)` yalnız oturumlu satın almada çalışır (SEO dışı) ✅ |
| `connection()` dinamikliği | ⚠️ **Kök layout `RequestBoundCsp` içinde `await connection()`** (`app/layout.tsx` 41-44) HTML'i `no-store`/dinamik tutuyor — *"kenar cache yok (TTFB bedeli)"* yorumu dosyada yazılı. Google tarayabilir ama TTFB/LCP bedeli var; `vercel.json fra1` + `compress:true` ile kısmen dengelenmiş |
| Kapak görsel | `/academy/cinema/01_office_ai-1-eye.webp` + AVIF srcset (640/960/1280) + `immutable` cache ✅. `alt` = kurs title. `fetchPriority` LCP kartında ✅ |
| OG görsel üretimi | `app/opengraph-image.tsx` (kök, dinamik PNG 1200×630). **Kursa özel `app/academy/[slug]/opengraph-image.tsx` YOK** — kurs OG'si sinema WebP'sine düşüyor (kabul edilebilir, ancak metinli plaka CTR'ı artırırdı) |
| Erişilebilirlik/başlık hiyerarşisi | H1 tekil ✅; H2 `Ders listesi`, `Bu yolda ne kazanırsın`; H3 `Modül N` + ders satırları `span` (H4 değil — outline sığ, zararsız) |
| `loading.tsx` / `error.tsx` gölgesi | Akademi segmentinde `loading.tsx` yok → botlar iskelet görmüyor ✅ |
| `proxy.ts` bot engeli | Bot user-agent filtresi yok; rate-limit + Origin guard API/yazma odaklı. Bakım modu (`SITE_MAINTENANCE_FREEZE`) açıkken botlar 503 görür — operasyonel dikkat ✅ |
| Fiyat görünürlüğü | `priceLabel` server'dan geliyor; JSON-LD `offers` yok (şema eksikliği, HTML'de fiyat CTA içinde mevcut) |

**Özet:** Kritik SSR boşluğu YOK. Sayfa "JS'siz eksik kalıyor" sınıfında değil. Asıl boşluklar: (a) kamuya açık kelime derinliği, (b) kursa özel FAQ + `offers`/credential şeması, (c) `connection()` kaynaklı önbelleksizlik.

---

## ADIM 4 — Cursor SEO Stratejisi ve Görüşü (CEO Özel Soruları)

### 4.1 SEN OLSAYDIN NE YAPARDIN? — "Excel Yapay Zeka Eğitimi / Ofiste ChatGPT" ilk sayfa için 3 kritik dokunuş

**Dokunuş 1 — Title + Description + H1 üçlüsünü niyet diline çevir (P0, 1 gün, risksiz).**

Mevcut 103 karakterlik title'ı 55-60 karaktere indir; para-keyword'ü başa al; marka/template'i koru:

```ts
// ÖNERİ — app/academy/[slug]/page.tsx generateMetadata (01_office_ai özel dalı)
// Önce:
title: `${course.title} · Akademi`, // → 103 kr final
// Sonra:
title: "Excel Yapay Zekâ Eğitimi: Ofiste ChatGPT + Sertifika", // 52 kr + template → ~64 kr final
description: "9 derste Excel, Word, PowerPoint ve Gmail'de yapay zekâ: KVKK-safe tablo, yönetim özeti, slayt ve Cuma 30 rutini. Sesli anlatım + 70+ barajlı sınavla sertifikanı mühürle.",
// ~170 kr, fayda + kapsam + belge + CTA
// H1 (gövde): "Ofiste Yapay Zekâ: Excel'den E-Postaya 9 Derste Verimlilik" (kullanıcı dili, title'dan ayrışır)
```

Neden işe yarar: `excel yapay zeka eğitimi` tam eşleşmesi title başına geçer; `ChatGPT`, `Sertifika` eklenir; kesinti riski kalkar. `course.title` SSOT'u değişmez — yalnız SEO dalı override edilir (sicil/sertifika başlığı aynı kalır). `SEM_LANDING_KEYWORDS` listesine `excel yapay zeka eğitimi`, `ofiste chatgpt`, `word yapay zeka` eklenir; H2/H3 ve FAQ aynı dizgileri taşır (Kalite Puanı tutarlılığı).

**Dokunuş 2 — `Course` şemasını zengin sonuca taşı: `offers` + `hasPart` müfredat + kursa özel `FAQPage` (P0, 2-3 gün).**

```jsonc
// ÖNERİ — courseJsonLd("01_office_ai") genişletmesi (lib/copy/json-ld.ts)
{
  "@type": "Course",
  // ...mevcut name/url/image/datePublished/provider
  "teaches": ["Excel veri temizliği", "KVKK maskeleme", "Yönetim özeti", "Sunum hazırlama", "E-posta ritüeli"],
  "timeRequired": "PT9H", // syllabus.durationMin'den üret
  "syllabusSections": [{ "@type": "Syllabus", "name": "Modül 1", "hasPart": [/* 9 ders: name + timeRequired */] }],
  "hasCourseInstance": {
    "@type": "CourseInstance", "courseMode": "Online", "inLanguage": "tr",
    "offers": { "@type": "Offer", "price": "<seed>", "priceCurrency": "TRY", "availability": "https://schema.org/InStock", "url": "https://yetkin.ai/academy/01_office_ai" }
  },
  "educationalCredentialAwarded": {
    "@type": "EducationalOccupationalCredential",
    "name": "yetkin.ai Ofis Yapay Zekâ Sertifikası",
    "credentialCategory": "certificate",
    "recognizedBy": { "@id": "https://yetkin.ai/#organization" }
  }
}
// + AYRI node: FAQPage (kursa özel 4-6 soru, görünür <LandingFaq> ile eşleşmeli):
// "Excel yapay zeka eğitimi sertifika veriyor mu?" / "ChatGPT ofis kullanımı için ön koşul var mı?"
// "KVKK'ya uygun mu? Verilerim yükleniyor mu?" / "Sınav barajı ve süresi nedir?"
```

Neden işe yarar: Fiyat + müfredat + belge sinyali Google'ın kurs zengin sonuç eşiğini karşılar; FAQ accordion'u SERP alanı büyütür (CTR +%15-30 tipik). `aggregateRating` YOK — sahte yıldız basmak yerine gerçek değerlendirme birikince eklenir (dürüstlük korunur). Tüm FAQ'lar sayfada görünür HTML ile birebir eşleşmeli (gizli markup cezası yenir).

**Dokunuş 3 — Antreye 1200+ kelimelik SSR "açık müfredat" bloğu ekle: ilk dersin %25'i + araç rehberi + SSS (P1, 1 hafta).**

Duvarı delmeden derinlik: `section_1.ts` (Tablonu Konuştur) ilk 300-400 kelimesi + `Gmail/Outlook aksiyon` mini-rehberi + 4-6 kursa özel SSS, `CurriculumOutline` altına SSR section olarak basılır. H2'ler para-keyword taşır:

- `Excel Yapay Zekâ Eğitimi: A1'den Temiz Tabloya (Ders 1 Önizleme)`
- `Ofiste ChatGPT Kullanımı: KVKK-Safe 5 Kural`
- `Word ve PowerPoint'te Yapay Zekâ: Dilekçe, Rapor, Slayt`
- `Sertifika ve Sınav: 70+ Baraj Nasıl Geçilir?`

Neden işe yarar: Kelime derinliği 400 → 1600+ çıkar; long-tail (`excel a1 düzenli tablo`, `kvkk maskeleme yapay zeka`, `gmail gemini aksiyon listesi`) yakalanır; satın alma duvarı korunur (gövdenin %75'i + ses + sınav kapalı). Bu blok `syllabus` şemasıyla çapraz bağlanır.

### 4.2 Platform kurgusu doğru kurgulanmış mı? — `/blog` veya `/rehber` manyetik içerik için App Router + Shared Kernel değerlendirmesi

**Kısa yanıt: EVET, kurgu doğru ve manyetik içerik beslemeye uygun — tek yapısal fren kök layout'taki `connection()` önbelleksizliği.**

| Katman | Mevcut durum | Manyetik içerik hükmü |
|---|---|---|
| App Router segmentasyonu | `(public)`, `(auth)`, `(kernel)`, `academy`, `career`, `freelancer` grupları; `academy/layout.tsx` + `AppShell` ayrışmış | ✅ `/rehber` yeni route grubu olarak `(public)` altına düşer; akademi kabuğunu kirletmez |
| SEO SSOT | `PAGE_SEO` + `pageMetadata()` + `TITLE_TEMPLATE` + `CANONICAL_SITE_ORIGIN`; `SEM_LANDING_KEYWORDS` merkezi | ✅ Yeni sayfa = 1 `PAGE_SEO` girdisi + `generateMetadata`; tutarlılık otomatik |
| JSON-LD altyapısı | `JsonLd` + `jsonLdDocument()` + `faqPageJsonLd`/`breadcrumbListJsonLd`/`itemListJsonLd` helper'ları | ✅ `Article`/`HowTo` helper'ı eklenebilir; `ItemList` ölü kodu `/rehber` indeksinde dirilir |
| Sitemap politikası | `sitemapRoutePolicy(path)` + `SITEMAP_STATIC_PATHS`; kurs girdileri SSOT listeden | ✅ `/rehber/*` dalı (`priority 0.7`, `weekly`) 10 satırda açılır |
| Robots | `ROBOTS_DISALLOW_PATHS` + allow SSOT | ✅ `/rehber` otomatik `Allow: /` altında; ek iş yok |
| Kimlik/katalog | `@yetkin/kernel` (`transpilePackages`), `catalog-ids` SSOT, `ACADEMY_COURSE_TITLES` | ✅ Makale→kurs iç linkleri slug SSOT'undan beslenir; kırık link riski düşük |
| Görsel boru hattı | AVIF/WebP + srcset + `immutable` cache + `minimumCacheTTL 31536000` | ✅ Rehber görselleri aynı borudan akar; LCP dostu |
| Redirect disiplini | İnce alias seti (§2.1), emekli SKU 301, duplicate alias kapatma | ✅ `/rehber/excel-...` slug disiplini aynı kültürle yürür |
| **Önbellek (FREN)** | **Kök `app/layout.tsx` → `RequestBoundCsp` → `await connection()` → tüm HTML `no-store`** | ⚠️ `/rehber/*` statik/ISR olamaz; her istek Node `fra1`'e düşer. Trafik 10 katına çıkınca TTFB + fatura bedeli. **Tedavi: CSP nonce'unu segment'e taşı veya `/rehber` için `connection()`'sız ayrı kabuk (route-group layout) + `revalidate`** |
| İçerik kaynağı | `lib/academy/curricula/*` (kod-içi tohum); CMS yok | 🟡 10-20 makale için `lib/rehber/*.ts` + `generateStaticParams` yeterli; 50+ için MDX (`@next/mdx`) veya headless CMS gerekir. Tavsiye: önce kod-içi, trafik kanıtlanınca MDX |
| Sürü Dron / mobil | `apps/rail-is` Amiral derlemeden dışlı (`outputFileTracingExcludes`) | ✅ Blog web'e yük bindirmez; dron etkilenmez |
| Güvenlik başlıkları | `proxy.ts` edge + `EDGE_SECURITY_HEADER_ENTRIES`; CSP nonce SSOT | ✅ Makale sayfaları aynı şemsiyede; ek iş yok |

**Net:** Mimari manyetik içerik için hazır; `/rehber/excel-yapay-zeka` → `/academy/01_office_ai` iç-link hunisi (`teaches` ↔ makale eşleşmesi) kurulabilir. Ön koşul: önbellek frenini çözmeden `/rehber`'i yayına alma (performans/SEO cezası).

### 4.3 Bir Sonraki Adım — ilk "SEO Tedavi / Optimizasyon" hamlesi

**Tek cümle:** P0 tedavi paketi = title/description rewrite + `Course` şema zenginleştirme (`offers` + `EducationalOccupationalCredential` + kursa özel `FAQPage`) + indeks hijyeni (`/oyna` ve `/dogrula/[hash]` için `noindex`/`disallow`).

Sıralı ilk 5 iş (tahmini efor):

1. **`01_office_ai` title/description/H1 rewrite** (`app/academy/[slug]/page.tsx` + `lib/copy/seo.ts` dalı; 0.5 gün). Başarı ölçütü: final title ≤65 kr, `excel yapay zeka eğitimi` + `ChatGPT` + `Sertifika` kapsanır.
2. **`courseJsonLd` genişletme** (`lib/copy/json-ld.ts`; 1 gün): `offers` (seed fiyat + TRY), `EducationalOccupationalCredential` tip'li node, `hasPart` 9 ders, `timeRequired`. Rich Results Test'ten geçir.
3. **Kursa özel görünür FAQ + `FAQPage`** (`app/academy/[slug]/page.tsx` + `lib/copy/sem-keywords.ts`; 1 gün): 4-6 soru, HTML ile JSON-LD birebir.
4. **İndeks hijyeni** (0.5 gün): `app/academy/dogrula/[hash]/page.tsx` → `robots: { index: false, follow: true }`; `ROBOTS_DISALLOW_PATHS`'e `/academy/*/oyna` (veya oyna sayfasına `noindex`); `sitemap lastModified`'i sabit `2026-09-05`'ten tohum `updatedAt`/build zamanına bağla.
5. **Search Console + ölçüm** (0.5 gün): sitemap yeniden gönder, URL denetimi (`/academy/01_office_ai`), 2 hafta sonra sorgu bazında (`excel yapay zeka eğitimi`, `ofiste chatgpt`) gösterim/tıklama karşılaştır. Sonra Dokunuş 3 (açık müfredat bloğu) ve `/rehber` fazına geç.

Yapılmaması gerekenler: `keywords` meta eklemek, sahte `aggregateRating` basmak, duvar arkası ders gövdesini umuma açmak, `connection()` dururken `/rehber`'i agresif ölçeklemek.

---

## Ek — Dosya Kanıt Haritası (hızlı denetim)

| İddia | Dosya + satır |
|---|---|
| Global `metadataBase` + template | `app/layout.tsx` 18-34 |
| Akademi meta mirası | `app/academy/layout.tsx` 1-7 |
| Vitrin metasızlığı | `app/academy/page.tsx` (metadata export yok) |
| Kurs `generateMetadata` | `app/academy/[slug]/page.tsx` 69-88 |
| Kurs JSON-LD (`Course` + `BreadcrumbList`) | `app/academy/[slug]/page.tsx` 187-204 |
| `pageMetadata` (canonical/OG/Twitter, keywords yok) | `lib/copy/seo.ts` 168-189 |
| `sitemapRoutePolicy` (kurs 0.8/weekly) | `lib/copy/seo.ts` 146-164 |
| `SITEMAP_STATIC_PATHS` + `ROBOTS_DISALLOW_PATHS` | `lib/copy/seo.ts` 114-132 |
| `courseJsonLd` / `faqPageJsonLd` / `breadcrumbListJsonLd` / `itemListJsonLd` (ölü) | `lib/copy/json-ld.ts` 95-186 |
| Kök `Organization` + `WebSite` | `lib/copy/json-ld.ts` 58-94, `app/layout.tsx` 54 |
| `SEM_LANDING_KEYWORDS` + `ACADEMY_LANDING_FAQ` | `lib/copy/sem-keywords.ts` 6-64 |
| Amiral slug + mühürlü ses 9'lu | `lib/academy/pilot-sku.ts` 17-67 |
| Kurs başlığı SSOT | `packages/kernel/src/catalog-ids/course-slugs.ts` 27-28 |
| Kurs özeti SSOT | `lib/academy/catalog-summaries.ts` 12-14 |
| 9 ders sırası SSOT | `lib/academy/curricula/lesson-index.ts` 10-22 |
| 9 ders başlıkları | `lib/academy/curricula/office_ai/section_*.ts` |
| 9 öğrenim çıktısı | `lib/academy/learning-outcomes.ts` 13-23 |
| Antre SSR gövde (outcomes + outline) | `app/academy/[slug]/page.tsx` 329-335 |
| Kapak yolu (sinema WebP) | `lib/academy/course-cover.ts` 65-73 |
| Kök OG plakası | `app/opengraph-image.tsx` |
| Sitemap üretici | `app/sitemap.ts` 56-96 |
| Robots üretici | `app/robots.ts` 1-27 |
| Alias 301 + emekli redirect | `next.config.ts` 89-150, `app/academy/courses/[slug]/page.tsx` |
| `connection()` no-store | `app/layout.tsx` 41-44 |
| Dogrula hash meta (noindex yok) | `app/academy/dogrula/[hash]/page.tsx` 22-57, `lib/academy/certificate-share.ts` 55-69 |
| Paywall kilidi | `lib/academy/curriculum.ts` 1-4, `app/academy/[slug]/page.tsx` 122-139 |

---

*Bu rapor statik kod tespitidir; canlı SERP konumu, Core Web Vitals ve GSC verisi içermez. Tedavi fazı öncesi Rich Results Test + URL Denetimi ile doğrulanmalıdır.*
