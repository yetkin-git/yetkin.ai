# yetkin.ai — Kapsamlı Teknik, Ticari ve SEO Denetim Raporu

**Denetim tarihi:** 22 Kasım 2026
**Kapsam:** `app/` (60 sayfa rotası, 132 API rotası), `components/` (163 istemci bileşeni), `lib/` (20 alt modül), `prisma/schema` (12 şema dosyası), `proxy.ts` (kenar), `next.config.ts`, `app/globals.css`
**Yöntem:** Statik okuma + otomatik tarama (bağlantı haritası, yetim bileşen taraması, CSS kullanım oranı, metadata kapsama matrisi) + kapı komutları
**Kural:** Bu aşamada **hiçbir kaynak kodu değiştirilmedi**. Yalnızca bu rapor üretildi.

---

## 0. Yürütülen Doğrulama Kapıları (kanıt)

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip denetimi | `npx tsc --noEmit` | ✅ 0 hata |
| Test paketi | `npx vitest run` | ✅ 365 dosya / **1988 test** geçti (1 zararsız vitest worker `onTaskUpdate` timeout uyarısı) |
| API ↔ auth haritası | `npm run verify:api-auth -- --check` | ✅ 132 rota (`session:73, public:25, closed:11, cron:2, admin:13, webhook:8`) |
| Sınır mührü | `npm run verify:boundaries` | ✅ kernel↛dikey, UI↛prisma |
| RLS mührü | `npm run verify:rls-status` | ✅ 74 tablo FORCE RLS + kapsamsız deny |
| Sır taraması | `npm run verify:no-secrets` | ✅ PEM / service_role / yasak env ataması yok |
| Public paket boyutu | `npm run verify:public-size` | ✅ 55.6 MB (eşik 850 MB) |
| Dil aksı | `npm run verify:sen-axis` | ❌ **2 ihlal** (§2.6) |
| İç bağlantı haritası | Özel tarama | ✅ **0 kırık iç bağlantı** (60 rota × 25 hedef) |

> **Önemli mimari not:** Proje `prebuild` zincirinde 13 ayrı mühür koşuyor ve bu mühürler yalnız *altyapı güvenliğini* kapsıyor — *ticari dönüşümü* kapsamıyor. Aşağıdaki en ağır bulguların hiçbiri mevcut kapılardan geçmiyor çünkü hiçbir kapı bu soruları sormuyor.

---

## 1. Yönetici Özeti ve Genel Sağlık Skoru

### 1.1 Genel Skor: **68 / 100**

yetkin.ai, Türkiye pazarında nadir görülen bir **mühendislik disiplini** seviyesine sahip: 1988 test, FORCE RLS, nonce-CSP, fiyatın koddan değil katalogdan okunması, sahte veri yasağının kodla zorlanması. Buna karşın ürün, **ticari huninin son üçte birinde (aktivasyon → ödeme)** ciddi sürtünme taşıyor ve **anlatım katmanı (SEO/UX) mühendislik katmanının gerisinde kalmış**.

| Eksen | Puan | Gerekçe (tek cümle) |
|---|---:|---|
| **Mimari** | **88** | Pragmatik monolit + ince sözleşme paketi tutarlı; kernel↛dikey sınırı kodla korunuyor; 132/132 rota auth haritalı; ama arşiv artıkları `globals.css`'e sızmış (§4.2) ve ~15 yetim bileşen var (§2.4). |
| **Ticari Kurgu** | **62** | Değer önerisi ve dürüstlük kültürü güçlü; fakat YetkinCV'nin **29 TL'lik katalog satırı hiçbir ödeme akışına bağlı değil**, Tezgâh Pro'nun faydası ölçülemiyor (3→3 kota), ve kayıt sonrası ilk değer anı tanımsız. |
| **Hız** | **76** | Görsel disiplini iyi (AVIF/WebP, `next/image`, lazy chunk, immutable cache, `fra1`); ama 5.848 satırlık tek `globals.css` (151 KB ham / 26 KB gzip) her sayfada yükleniyor ve **%74.6'sı ölü Akademi CSS'i**. |
| **SEO** | **61** | Teknik temel (canonical, robots, sitemap, `lastmod`, JSON-LD) örnek niteliğinde; ama **fiyatlandırma sayfasında Product/Offer şeması yok**, `manifest` yok, `llms.txt` yok, ve ana sayfa H1'i marka diliyle "siz" aksında yazılmış (§5.4). |
| **Stabilite** | **82** | Try/catch disiplini yüksek (132 rotanın 113'ünde), zarf tek (`{ok,error,requestId,data}`), fail-closed varsayılanlar; ama `w-screen` + `margin-inline: calc(50%-50vw)` kombinasyonu yatay taşma riski taşıyor (§3.4), manifest/viewport eksik. |

### 1.2 Tek Cümlelik Teşhis

> **yetkin.ai bir "güvenlik ve doğruluk" mühendisliği harikası, ama bir "dönüşüm" makinesi değil.** Ürün, kendini kanıtlamak için fazla dürüst; kullanıcıyı içeri almak için yeterince ikna edici değil.

### 1.3 En Kritik 5 Bulgu (özet)

| # | Önem | Bulgu | Ticari etki |
|---|---|---|---|
| 1 | `[KRİTİK]` | YetkinCV katalog satırı (`career/yetkincv-exam`, 29.000 kuruş) hiçbir ödeme rotasından tüketilmiyor | Katalogda "ücretli ürün" görünen ama asla satılamayan kalem → gelir kaybı + fiyat sayfası güvenilirliği |
| 2 | `[KRİTİK]` | Tezgâh Pro aboneliğinin somut faydası kullanıcıya gösterilmiyor: `TEZGAH_MEMBER_DAILY_LIMIT = 3`, Pro da `limit` döndürüyor ama **3** | Aylık 590 TL ödeyen kullanıcı günde yine 3 üretim görüyor → iade/dolandırıcılık algısı riski |
| 3 | `[YÜKSEK]` | Kayıt sonrası "ilk değer anı" tanımsız: `/register` → `/dashboard` boş kokpit | Aktivasyon oranı düşük; huninin en pahalı sızıntısı |
| 4 | `[YÜKSEK]` | `globals.css`'in %74.6'sı (115 KB) arşivlenmiş Akademi sınıfları; canlı kodda **1** `academy-*` sınıfı kullanılıyor | Her sayfada ~19 KB gzip ölü CSS → LCP/FCP regresyonu |
| 5 | `[YÜKSEK]` | Fiyatlandırma sayfasında `Product`/`Offer` JSON-LD yok; `manifest.webmanifest` yok | Zengin sonuç (rich result) kaybı + PWA/paylaşım kimliği eksik |

---

## 2. Kritik ve Yüksek Öncelikli Bulgular

### 2.1 Ticari Mantık ve Dönüşüm Hunisi

---

#### `[KRİTİK]` B-01 — YetkinCV fiyat satırı "satılamaz" bir hayalete bağlı

**Dosya:** `lib/pricing/public-vitrine.ts:139-153`, `lib/career/yetkincv.ts:29-31`, `app/api/career/yetkincv/route.ts:1-53`

```139:153:lib/pricing/public-vitrine.ts
    yetkinCv: {
      id: "career:yetkincv-exam",
      code: "YETKINCV",
      title: "YetkinCV Uygulamalı Sınav",
      summary:
        "Uygulamalı vaka testi ile paylaşılabilir YetkinCV puanı. Puan satın almadan değil test sonucundan oluşur.",
      lines: [
        "Uygulamalı vaka testi",
        "Doğrulanabilir puan kodu",
        "Herkese açık doğrulama bağlantısı",
      ],
      href: "/career",
      honesty: "live",
      amountMinor: null,
      priceLabel: PUBLIC_FREE_EVALUATION_LABEL,
      statusLabel: PUBLIC_FREE_EVALUATION_LABEL,
    },
```

**Kanıt:**
- `prisma/migrations/20261118183000_yetkincv_exam/migration.sql:86` → `v_amount integer := 29000;` (290,00 TL) katalog satırı **aktif olarak açılıyor**.
- `lib/kernel/admin/catalog-write.ts:128-136` → satır Super Admin tarafından **açılabilir** (`CATALOG_OPENABLE_UNITS`).
- `grep -r "YETKINCV_CATALOG_MODULE"` → **yalnız tanım; hiçbir okuma yok.** `YETKINCV_CATALOG_UNIT` da ödeme/fulfillment kodunda geçmiyor.
- `app/api/career/yetkincv/route.ts` yalnız `start`/`submit` işliyor; **ücret kontrolü, kota, sipariş, defter kaydı yok.**

**Etki:** İki taraflı hasar.
1. **Gelir:** Katalogda "açılabilir" bir ürün var ama satın alma yolu yok. Her ay 0 TL.
2. **Güven:** `fiyatlandirma` sayfasında "YetkinCV **Ücretsiz Değerlendirme**" yazıyor (doğru davranış) — ama Super Admin panelinde 290 TL'lik aktif satır duruyor. Operatör bu satırı açtığında hiçbir kullanıcıya yansımayacak, sessiz bir yalan oluşacak.

**Öneri:** Ya (a) satırı `migration` düzeyinde deaktive edip `CATALOG_OPENABLE_UNITS`'tan çıkar, ya da (b) **deneme hakkı + ücretli ikinci sınav** modeliyle gerçek bir satın alma rotası yaz (`/api/career/yetkincv/purchase` → `placeTezgahCheckout` benzeri akış). (b) daha yüksek ticari değer taşır; bkz. §4.1.

---

#### `[KRİTİK]` B-02 — "Tezgâh Pro" satın alan kullanıcı somut bir fayda görmüyor

**Dosya:** `lib/tezgah/catalog.ts:33`, `lib/tezgah/quota.ts:194-281`, `components/tezgah/workbench.tsx:1100-1110`

```33:33:lib/tezgah/catalog.ts
export const TEZGAH_MEMBER_DAILY_LIMIT = 3;
```

```279:286:lib/tezgah/quota.ts
  if (!guest && (await readTezgahProActive(actorId, now))) {
    return snapshot({
      allowed: true,
      remaining: limit,      // ← limit = tezgahPoolLimit() = 3
      limit,
      used: 0,
      guest: false,
      lane: "pro",
      poolKey,
    });
  }
```

**Sorun zinciri:**
1. Pro kullanıcı `lane: "pro"` alır → `remaining` = **3**, `limit` = **3**.
2. `components/tezgah/workbench.tsx:1100` → üye kartı `quota.remaining === 0 && quota.lane !== "pro"` koşuluna bağlı; Pro kullanıcı **duvar görmez** (iyi), ama **sayaç da görmez** — çünkü `tezgahToolQuotaLine` "Kalan ücretsiz hakkınız: 3 / 3" basmaya devam eder.
3. `lib/dashboard/command-center.ts:89-92` → panelde `"Sınırsız"` yazar. **Tezgâh içinde "3 / 3" yazar.** İki ekran çelişiyor.

**Etki:** Aylık **590 TL** ödeyen kullanıcı, ürünün kendi ekranında "3 ücretsiz hakkın" görüyor. Bu, en sık iade talebi üreten sınıf hatadır (algılanan dolandırıcılık). Ayrıca "Yüksek kota" vaadi (`fiyatlandirma:50` → `"Yüksek kota"`) kodda karşılığı olmayan bir vaattir.

**Öneri:** `tezgahPoolLimit`'e `pro` dalı ekle (ör. `TEZGAH_PRO_DAILY_LIMIT = 100`) **veya** Pro'yu gerçekten sınırsız yap ama `line` metnini `"Pro — günlük kota yok"` olarak ayır. Karşılaştırma tablosundaki "Yüksek kota" hücresi (`fiyatlandirma/page.tsx:51`) bu sabitten okunmalı — koda gömülü metin olmamalı.

---

#### `[YÜKSEK]` B-03 — Kayıt sonrası "ilk değer anı" yok; huni `/dashboard`'da boşluğa düşüyor

**Dosya:** `lib/kernel/auth/redirects.ts:11` (`AUTH_CALLBACK_DEFAULT_NEXT = "/dashboard"`), `app/dashboard/page.tsx:26-50`

**Akış:**
- Ana sayfa CTA → `/tezgah` (kayıtsız üretim) → kota dolar → kayıt kartı → `/register?next=/tezgah` ✅ (bu kısım iyi tasarlanmış)
- Ama `/register` → e-posta doğrulama → `/dashboard` → **dört boş kart**: "E-Ticaret 0 mağaza / YetkinHibe — / Tezgâh 3/3 / Kariyer —".

**Etki:** Kullanıcı, ürünün en güçlü anını (Tezgâh'ta 30 saniyede belge üretme) yaşadıktan hemen sonra boş bir kokpite düşüyor. `NextBestActionCard` (`lib/dashboard/next-best-action.ts:66-89`) freelancer ve Akademi sinyallerine bakıyor — ikisi de kapalı/boş — ve **fallback `/hibe`'ye** düşüyor. Yani yeni kullanıcının "sıradaki eylemi" **kilitli bir odaya** işaret ediyor.

**Kanıt:**
```20:35:lib/dashboard/next-best-action.ts
const ACADEMY_DEFAULT: NextBestAction = { kind: "default", href: "/hibe", room: "academy" };
...
export function academyContinueHref(slug: string | null | undefined): NextBestActionHref {
  ...
  return "/tezgah";   // ← her iki dal da /tezgah döndürüyor; slug kullanılmıyor
}
```

`/hibe` korumalı bir odadır; yeni kullanıcı orada ikinci bir kayıt/onay duvarına çarpar.

**Öneri:** İlk oturumda (`user.tezgahOutputsCount === 0`) NBA'yı `/tezgah?tool=proposal`'a sabitle ve dashboard'un üstüne "İlk belgeni üret" tek-adımlık kartı koy. Huni ölçümü için `activation_first_output` olayı GA4'e ekle (§4.2).

---

#### `[YÜKSEK]` B-04 — Fiyat sayfası "6 paket" gösteriyor, satın alınabilir olan **2**

**Dosya:** `app/(public)/fiyatlandirma/page.tsx:256-278`, `lib/pricing/public-vitrine.ts:84-199`

| Kart | `honesty` | Gerçekte ne oluyor |
|---|---|---|
| Ücretsiz Başlangıç | `live` | `/tezgah` — çalışıyor |
| **AI Tezgâh Pro** | `live` (katalog varsa) | `/tezgah` → kota dolunca `TezgahUpgradeCard` → PayTR ✅ |
| **E-Ticaret İşletme** | `live` (katalog varsa) | `/e-ticaret` → **kayıt duvarı** → mağaza aç → lisans sekmesi → PayTR (4 adım) |
| YetkinHibe Tam Proje Dosyası | `live` | `/hibe` → kayıt → kokpit → PayTR |
| **YetkinCV** | `live` ama `amountMinor: null` | **Satın alma yolu yok** (B-01) |
| Kurumsal | `live` ama teklif | Form → manuel |

**Sorun:** Kart CTA'sı `vitrineHref()` ile korumalı hedefi `/register?next=...`'e çeviriyor (`fiyatlandirma/page.tsx:96-101`). Yani fiyat sayfasında **"AI Tezgâh Pro'yu aç"** düğmesine basan kayıtsız kullanıcı, ödeme ekranına değil **kayıt formuna** düşüyor. Ödeme niyeti en yüksek noktada huni kesiliyor.

**Etki:** En yüksek niyetli trafik (fiyat sayfası) en uzun yola sokuluyor. Sektör ortalamasında fiyat sayfası → ödeme dönüşümü %8-15 iken, bu akışta 4 ara adım var.

**Öneri:** Tezgâh Pro için **misafir ödeme** (guest checkout) aç. Tezgâh zaten kayıtsız üretim yapıyor; kayıtsız ödeme de yapabilmeli — e-posta + kart yeterli, hesap ödeme sonrası otomatik açılır (`/api/auth/register` sonrası `next=/cuzdan?sonuc=ok`). Bu tek değişiklik gelirde ölçülebilir sıçrama üretir.

---

#### `[ORTA]` B-05 — E-Ticaret 30 gün denemesi var ama "1 TL" mesajı 3 farklı yerde 3 farklı tonda

**Dosya:** `lib/pricing/public-vitrine.ts:170-180`, `components/commerce/license-checkout.tsx:104-137`, `app/(public)/fiyatlandirma/page.tsx:232-235, 346-349`, `app/(public)/rehber/page.tsx:136-141`

| Yer | Metin |
|---|---|
| Vitrin kartı | "İlk 30 Gün Ücretsiz (1 TL Kart Doğrulama ile)" |
| Lisans ekranı | "1,00 TL" + "30 gün sonra ₺1.490,00 / Ay otomatik yenilenir" |
| Fiyat sayfası hero | "1 TL sembolik kart doğrulama bedeli tahsil edilir ve bu bedel bakiyeye yazılmaz" |
| Rehber | "…alınır; bu bedel **bakiyenize** yazılmaz" ← `siz` aksi |

**Etki:** Dürüstlük kültürü ile tutarlılık kültürü çatışıyor. Aynı teklifin 4 farklı cümlesi, kullanıcıda "acaba hangisi doğru" tereddüdü yaratıyor — özellikle 1.490 TL/ay otomatik yenileme söz konusuyken bu tereddüt ölümcül.

**Öneri:** Tek SSOT: `lib/pricing/trial-copy.ts` — `headline`, `verifyLine`, `renewalLine`, `cancelLine`, `honestyLine`. Dört yüzey de buradan okusun. (Kod tabanı bu deseni `TEZGAH_GUEST_QUOTA_MESSAGE` için zaten kullanıyor — aynı disiplini fiyat metnine uygula.)

---

#### `[İYİLEŞTİRME]` B-06 — Kurumsal teklif formu ile ekrandaki fiyat birbirini bilmiyor

**Dosya:** `app/(public)/kurumsal/page.tsx:100-142`, `app/api/lead/route.ts:1-53`

Ajans kartı `agencyPrice.label`'ı katalogdan basıyor (doğru), ama `KurumsalOfferForm` yalnız `packageKey` + serbest `note` gönderiyor. **Seçilen paketin tutarı kayda yazılmıyor** (`prisma/schema/b2b.prisma` → `kurumsalOfferRequest`). Satış ekibi, kullanıcının hangi fiyatı gördüğünü bilmiyor.

**Öneri:** `quotedAmountMinor` + `catalogEntryId` alanlarını ekle. Fiyat değişirse "kullanıcı eski fiyatı gördü" uyarısı doğar.

---

### 2.2 Modüller Arası Ahenk ve Senkronizasyon

---

#### `[YÜKSEK]` M-01 — Dil aksı mühürü **kırık** (2 ihlal)

**Kanıt:** `npm run verify:sen-axis` → ❌ `BAŞARISIZ`

```
✗ app/(public)/rehber/page.tsx: siz kaçağı — `hesabınız`
✗ lib/copy/junior-guardian-notice.ts: siz kaçağı — `hesabınız`
```

**Konum 1:** `app/(public)/rehber/page.tsx:71`
> "…Makale değil, süreç şeması — önce **anlayın**, sonra **hesabınızı açın**."

**Konum 2:** `lib/copy/junior-guardian-notice.ts:18`
> "Hesap **sizindir**. Çocuk, **sizin hesabınızın** altında bir profildir."

Ayrıca **mühür kapsamı dışında kalan** ama gözle görülen `siz` sızıntıları:

| Dosya:satır | Metin |
|---|---|
| `lib/copy/sen-voice/public.ts:7` | "**İşinizi** Büyüten Yapay Zeka Araçları." ← **ana sayfa H1** |
| `lib/copy/sen-voice/public.ts:9` | "…siparişlerinizi yönetin, **işletmenize** uygun hibeleri bulun…" ← ana meta description |
| `lib/copy/sen-voice/public.ts:118` | "Tüm pazaryeri **siparişlerinizi, stoklarınızı**…" |
| `lib/copy/seo.ts:136` | "…1 iş günü içinde **dönüş yapıyoruz**." |
| `app/(public)/rehber/page.tsx:139` | "bu bedel **bakiyenize** yazılmaz" |

**Etki:** Ürünün tamamı (dashboard, tezgâh, hata mesajları) sen dilinde; ama **satışa çıkan ilk cümle** (H1) ve **Google'da görünen açıklama** siz dilinde. Bu, marka sesinin en görünür iki yerinde kırılması demek. Aynı sayfada "Ücretsiz Hemen Dene" + "Ücretsiz kayıt ol" (sen) ile "İşinizi büyüten" (siz) yan yana duruyor.

**Kritik ikinci nokta:** `verify-sen-axis.ts` yalnız `SIZ_LEAKS` listesindeki 21 kalıbı arıyor ve **`lib/copy/sen-voice/` muaf değil ama `public.ts`'teki "İşinizi" listede yok.** Yani mühür, en görünür ihlali görmüyor.

**Öneri:**
1. `app/(public)/rehber/page.tsx:71` → "…önce anla, sonra hesabını aç."
2. `lib/copy/junior-guardian-notice.ts:18` → "Hesap senin. Çocuk, senin hesabının altında bir profildir." *(yasal metin olduğu için istisna bilinçli olabilir — o zaman `FROZEN_SEN_VOICE` gibi açık bir istisna listesine alınmalı ve mühür yeşile dönmeli.)*
3. `public.ts:7` → **"İşini Büyüten Yapay Zeka Araçları. Tek Hesap, Sıfır Karmaşa."** (siz→sen, 2 karakter kısalır, SERP'te daha iyi kırpılır)
4. `SIZ_LEAKS`'e ekle: `İşinizi`, `işletmenize`, `siparişlerinizi`, `stoklarınızı`, `bakiyenize`, `dönüş yapıyoruz`, `anlayın`, `açın`.

---

#### `[YÜKSEK]` M-02 — `globals.css`: 5.848 satırın %74.6'sı ölü arşiv kodu

**Dosya:** `app/globals.css` (151.1 KB ham / 26.4 KB gzip / 21.6 KB brotli)

**Ölçüm:**
| Metrik | Değer |
|---|---|
| Toplam satır | 5.848 |
| Toplam boyut | 151.1 KB |
| `academy*` seçici bloğu | **115.3 KB (%74.6)** |
| `junior*` seçici bloğu | 1.8 KB (%1.2) |
| Tanımlı sınıf | 404 |
| Canlı kodda kullanılan `academy-*` sınıfı | **1** (`app/api/(kernel)/wallet/top-up/route.ts` içinde *string* olarak, CSS sınıfı değil) |
| Yetim (tanımlı, kullanılmayan) sınıf | **389 / 404** |

**Kanıt:** `app/globals.css:477` → `.academy-listen-focus`, `:491` → `.academy-hero-stage`, `:497` → `.academy-player-pin`, … 873 adet `academy-*` kural. Akademi diskte **yok** (`archived/academy/`), kenar `/academy` için **410** basıyor (`proxy.ts:176-184`). Bu CSS **hiçbir zaman** eşleşmeyecek.

**Etki:**
- Her sayfa yüklemesinde ~19 KB gzip gereksiz CSS (render-blocking).
- Lighthouse "Reduce unused CSS" cezası.
- Bakım yükü: tasarımcı `.academy-stage-beat-enter` ararken gerçek `.room-card`'ı bulamıyor.

**Öneri:** `academy-*` ve `[data-room="academy"]` bloklarını `app/styles/archived-academy.css`'e taşı, `import` etme. Ölçüm: CSS 151 KB → **~36 KB** (−76%). Doğrulama: `grep -c "academy-" components app --include=*.tsx` = **0** olmalı (şu an 0). Bu, §4.2'deki en hızlı LCP kazancı.

---

#### `[ORTA]` M-03 — Görsel dil 4 farklı köşe yarıçapı ve 3 farklı hero deseni kullanıyor

**Dosyalar:** `app/(public)/fiyatlandirma/page.tsx:221`, `app/(public)/kurumsal/page.tsx:71`, `app/(public)/iletisim/page.tsx:25`, `app/(public)/hakkimizda/page.tsx:25`, `components/ui/public-hero.tsx:17`

| Sayfa | Hero deseni |
|---|---|
| Ana sayfa | Kendi `<header>`'ı, `BrandIcon` + nav (AppShell **dışında**) |
| Fiyatlandırma | Kendi gradient `<section>`'ı, `rounded-[var(--radius-card)]` |
| Kurumsal | Kendi gradient `<section>` + `PageHeader` |
| Hakkımızda / İletişim / Legal | `PublicHero` (`rounded-2xl`) |
| Rehber / Sözlük / Uzmanlar / Tetkik | `PublicHero` |
| `/vize`, `/magaza/[slug]` | Çıplak `<h1 className="text-3xl">` — ne hero ne PageHeader |

**Ek:** `app/(public)/layout.tsx` **hiçbir üst menü (header) basmıyor**. Yani `/fiyatlandirma`'dan `/hakkimizda`'ya geçen kullanıcı **navigasyonu kaybediyor** — yalnızca sabit footer'daki 11 küçük link kalıyor (`components/legal/legal-site-footer.tsx:19`, `text-[11px]`).

**Etki:** Kamu sayfaları arası gezinme yalnız footer'a bağlı. `/sozluk` → `/fiyatlandirma` yolculuğu için kullanıcı sayfanın en altına inip 11 px'lik link aramak zorunda. Bu, iç bağlantı değerini (SEO) ve keşfi (CRO) aynı anda düşürüyor.

**Öneri:** `app/(public)/layout.tsx`'e hafif bir `PublicTopBar` ekle (logo + Tezgâh / Fiyatlar / Kurumsal / Rehber + Giriş/Kayıt). Ana sayfadaki `HomeAccountNav` deseni zaten hazır — onu ortak bileşene çıkar.

---

#### `[ORTA]` M-04 — Yetim bileşenler ve "test-only" yüzey

**Kanıt (statik referans taraması):**

| Dosya | Durum |
|---|---|
| `components/dashboard/quick-top-up-modal.tsx` | Hiçbir yerden import edilmiyor; yalnız `tests/kernel/wallet-top-up-fail-closed-surface.test.ts` okuyor |
| `components/career/visa-ledger.tsx` | Yalnız test okuyor |
| `components/career/visa-scope-board.tsx` | Yalnız test + `lib/career/index.ts` barrel |
| `components/career/employer-gateway.tsx` | Yalnız test |
| `components/freelancer/direct-job-offer-button.tsx` | Yalnız test (freelancer 410) |
| `lib/kernel/env.ts` | **Hiçbir üretim dosyası import etmiyor** (39 env anahtarı doğrulanıyor ama kimse `getEnv()` çağırmıyor) |
| `lib/closed-bff-surface.ts`, `lib/kernel/bounded-contexts.ts` | Referanssız |
| `lib/academy/curricula/**` (≈130 dosya) | Yalnız `archived/` testleri okuyor; Akademi 410 |

**Etki:** `lib/kernel/env.ts` özellikle dikkat çekici — repoda **tam bir env şeması** var ama çalışma zamanı onu kullanmıyor. Yani `PAYTR_MERCHANT_ID` eksikse kod sessizce `undefined` ile devam ediyor, şema yakalamıyor. `verify:no-secrets` geçiyor ama *tip güvenli env* garantisi yok.

**Öneri:** (a) `getEnv()` çağrısını `instrumentation.ts`'e ekle → eksik/yanlış env üretimde **başlangıçta** patlar, istek anında değil. (b) Test-only bileşenleri `tests/fixtures/` altına taşı veya sil. (c) `lib/academy/curricula`'yı `archived/`'a taşı (build trace'ten de düşer).

---

### 2.3 Kusur, Hata ve Güvenlik

---

#### `[YÜKSEK]` S-01 — LLM üretim rotalarının çoğunda uygulama katmanı hız tavanı yok

**Kanıt:**

| Rota | `applyHttpRateLimit` | Kenar `matchEdgeRateLimit` |
|---|---|---|
| `/api/ai/chat` | ✅ `llmUser` (12/10dk) | ✅ |
| `/api/ai/form-coach` | ✅ `formCoachIp` | ✅ |
| `/api/career/coach` | ✅ `llmUser` + `careerCoachUser` | ✅ |
| `/api/tezgah/generate` | ❌ (yalnız `consumeTezgahQuota`) | ✅ `llmIp` (20/10dk) |
| `/api/tezgah/grant/generate` | ❌ | ✅ |
| `/api/tezgah/grant/dossier` | ❌ | ✅ |
| `/api/tezgah/dukkan/generate` | ❌ | ✅ |
| `/api/tezgah/reklam/generate` | ❌ | ✅ |
| `/api/tezgah/pazaryeri/generate` | ❌ | ✅ |
| `/api/tezgah/tetkik/generate` | ❌ | ✅ |
| `/api/junior/live-tutor` | ✅ | ✅ |
| `/api/academy/lesson-assistant` | ✅ | ✅ |

**Değerlendirme:** Kenar `matchEdgeRateLimit` `/generate` sonekiyle biten tüm yolları `llmIp` (20/10dk, IP başına) yakalıyor — yani **kör değil**. Ancak:
- Kenar hız tavanı **IP başına**; aynı IP arkasındaki 100 kullanıcı (kurumsal NAT, mobil operatör CGNAT) aynı 20'lik kovayı paylaşıyor.
- `consumeTezgahQuota` **günlük 3**; ama bir kullanıcı 3 hakkını tükettikten sonra kredi/Pro varsa her istek LLM'e gidiyor ve **dakikalık** bir tavan yok. `lib/tezgah/engine.ts:113-118` içinde `rateLimit: { limit: 8, windowMs: 60_000 }` var — ama bu `invokeLlm` **iç** kalkanı; kaç isteğin buna ulaştığını sınırlamıyor.

**Etki:** Maliyet kontrolü büyük ölçüde `AI_PLATFORM_DAILY_CAP_MINOR` (varsayılan 500.000 kuruş = 5.000 TL/gün) tek kalkanına bağlı. Bir IP'den gelen kötü niyetli trafik bu tavanı **tek başına** tüketebilir ve meşru kullanıcıları 503'e düşürür.

**Öneri:** `checkoutUser` desenini `generate` rotalarına da uygula: `HTTP_RATE_LIMITS.tezgahGenerateUser` (ör. 30/10dk). Bu 3 satırlık değişiklik, hem CGNAT adaletini hem maliyet tavanını düzeltir.

---

#### `[YÜKSEK]` S-02 — `lib/kernel/env.ts` çalışma zamanında hiç doğrulanmıyor

Bkz. M-04. Somut risk: `PAYTR_SANDBOX` / `PAYTR_ALLOW_MOCK_CHECKOUT` üretimde doluysa `placeTezgahCheckout` **throw eder** (`lib/tezgah/checkout.ts:181-188`) — ama bu ancak **ilk ödeme denemesinde** ortaya çıkıyor. Env şeması bunu başlangıçta yakalayabilirdi.

**Ek kanıt:** `scripts/ops-runtime-readiness.ts` bu kontrolü *ayrı* yapıyor (`:470` → `"PAYTR_ALLOW_MOCK_CHECKOUT üretimde dolu — throw; CREDIT yok."`). İki ayrı doğrulama katmanı var, biri (env şeması) hiç çalışmıyor.

---

#### `[ORTA]` S-03 — `w-screen` + negatif margin: yatay taşma riski

**Dosya:** `app/(public)/page.tsx:152`, `:182`

```152:152:app/(public)/page.tsx
          className="relative mt-10 w-screen bg-slate-950 px-6 py-12 text-white [margin-inline:calc(50%-50vw)]"
```

**Sorun:** `w-screen` = `100vw`. `100vw` **dikey scrollbar genişliğini içerir**. Masaüstünde scrollbar 15-17 px ise `100vw > container` olur ve `overflow-x` taşması doğar. Ana sayfa `<main>` üzerinde `overflow-x-hidden` var (`:46`) — bu **maskeliyor**, ama `position: sticky` içeren alt bileşenlerde (ör. `HeaderBar`) ve iOS Safari'de `100vw` + `calc(50% - 50vw)` kombinasyonu bilinen kayma üretir.

**Ek:** `[margin-inline:calc(50%-50vw)]` içinde `%` boşluk yok — Tailwind arbitrary value olarak çalışıyor ama `50% - 50vw` yerine `50%-50vw` CSS'te `calc(50% -50vw)` gibi ayrıştırılabilir; bazı minifier'larda **geçersiz** üretir.

**Öneri:** `w-screen` + negatif margin yerine iki sütunlu ızgara veya `mx-auto max-w-6xl` + tam genişlik gerekiyorsa `[grid-column:1/-1]` kullan.

---

#### `[ORTA]` S-04 — Viewport / theme-color / manifest eksik

**Kanıt:** `app/layout.tsx` içinde `export const viewport` **yok**, `themeColor` **yok**, `public/manifest.webmanifest` **yok**, `app/manifest.ts` **yok**, `apple-touch-icon` **yok**.

**Etki:**
- Mobil tarayıcı çubuğu marka rengi almıyor (kurumsal kimlik kaybı).
- "Ana ekrana ekle" akışı tanımsız (PWA yüzeyi yok).
- iOS'ta `apple-touch-icon` olmadığı için paylaşımda gri kutu görünüyor.
- Lighthouse "installable" kategorisi tamamen kaybediliyor.

**Not:** `app/apple-icon.png` **var** (8 KB) — yani ikon üretilmiş ama manifest'e bağlanmamış. Bu, "yapılmış işin yarısının görünmemesi" durumu.

---

#### `[ORTA]` S-05 — `error.tsx` / `global-error.tsx` `retry` prop'unu doğru kullanıyor ama `app/loading.tsx` soft-404 riskini büyütüyor

**Dosya:** `app/loading.tsx` → `<RoomSkeleton variant="public" />` tüm ağacı sarıyor.

**Kanıt (kod tabanının kendi notu):** `lib/academy/public-surface-gate.ts:7-13`
> "Next 16'da `notFound()` bir `loading.tsx` Suspense sınırının altında render edilirse yanıt 200 akar… Kök `app/loading.tsx` tüm ağacı sardığı için **hiçbir** render-zamanı kapısı durum kodunu 404'e çeviremez; kenar `proxy` bunu akış başlamadan keser."

Yani ekip sorunu **biliyor** ve kenar kapısıyla çözüyor. Ancak bu kapı yalnız 3 dinamik segmenti kapsıyor: `/academy/*`, `/academy/dogrula/*`, `/vize/*`, `/magaza/*` (`public-surface-gate.ts:96-118`).

**Kapsam dışı kalanlar:** `/ilan/[slug]`, `/tetkik/[hash]`, `/rehber/[slug]`, `/sozluk/[terim]` — bunlar `notFound()` çağırıyor ama kök loading sınırı altında **200** akabilir.

**Doğrulama:** `/rehber/[slug]` ve `/sozluk/[terim]` `dynamicParams = false` ile korunuyor (bilinmeyen slug → framework 404). `/tetkik/[hash]` → `loadPublicTetkikReport` null → `notFound()` → **200 riski var**. `/ilan/[slug]` → `notFound()` yerine "İlan bulunamadı" **200** basıyor (`:70-80`) — bu bilinçli ama SEO açısından soft-404.

**Öneri:** `/tetkik/[hash]` için `public-surface-gate`'e hash biçim kapısı ekle (22 karakter base64url). `/ilan/[slug]` için `robots: noindex` zaten sayfada yok — `generateMetadata`'da `index: false` var (`:28`) — yani **doğru**. `/tetkik/[hash]` de `index: false` alıyor (`:23`). Yani **SEO hasarı sınırlı**; asıl risk kullanıcı deneyimi (200 + "bulunamadı" iki farklı sinyal).

---

### 2.4 Hız ve Performans

---

#### `[YÜKSEK]` P-01 — Font stratejisi mühürle sabitlenmiş ama sistem fontuna mahkûm

**Kanıt:** `tests/kernel/performance-headers-surface.test.ts:84`
```84:84:tests/kernel/performance-headers-surface.test.ts
    expect(readSrc("app/layout.tsx")).not.toContain("next/font");
```
`app/globals.css:17` → `font-family: "Segoe UI", system-ui, ...`

**Değerlendirme:** Karar **bilinçli** — `next/font` nonce-CSP ile çakışıyor ve `@font-face` yasaklanmış (`:84` testi `readStyleBundle()).not.toContain("@font-face")`). Bu, CLS'i sıfırlıyor (çok iyi). Ama:
- Windows'ta Segoe UI, macOS'ta SF Pro, Android'de Roboto → **marka tipografisi yok**.
- `next.config.ts:76`'da `@digabi/noto-sans` WOFF **trace'e dahil** ama hiçbir yerde kullanılmıyor → 200 KB+ gereksiz fonksiyon paketi.

**Etki:** Marka kimliği zayıf + gereksiz paket ağırlığı. `verify:public-size` 55.6 MB diyor ama `outputFileTracingIncludes`'a eklenen kullanılmayan font, her serverless fonksiyonun soğuk başlangıcını şişiriyor.

**Öneri:** `@digabi/noto-sans`'ı `outputFileTracingIncludes`'tan çıkar (`next.config.ts:76`). Tipografi için `font-family` yığınını `Inter var` self-hosted WOFF2 + `font-display: optional` ile değiştir (CSP'yi bozmaz; `@font-face` yasağı testini güncelle).

---

#### `[ORTA]` P-02 — `unoptimized` görsel kullanımı geniş; `next/image` faydası sınırlı

**Kanıt:** `components/academy/course-cover-image.tsx:57` → `unoptimized` (bilinçli, Cloudflare immutable cache korunuyor). `components/junior/lesson-covers.tsx:181` → düz `<img>` (bilinçli, `onError` fallback). `components/junior/player/scene-plate.tsx:74` → düz `<img>` (bilinçli, video eşleşmesi).

**Değerlendirme:** Her birinin gerekçesi kodda yazılı — bu iyi mimari. Ama `public/media/` altında **318 dosya / 1.578 MB** var ve en büyük 10 MP3 **16-17 MB**. Bunlar `/media` immutable cache ile servis ediliyor ama **boyut** sorunu: bir Junior ders sesi 17 MB ise, 3G'de ilk dinleme 40+ saniye.

**Öneri:** MP3'leri 64 kbps mono'ya düşür (konuşma için yeterli) → 17 MB → ~4 MB. `scripts/transcode-academy-lesson-audio.ts` deseni zaten var; Junior seslerine uygula.

---

#### `[ORTA]` P-03 — Ana sayfa 3 istemci bileşeni + RSC sınırı

**Kanıt:** `app/(public)/page.tsx` → `GrantEligibilityWidget` (7.6 KB, `"use client"`), `HomeAccountNav` (Suspense ile sarılı, iyi), `HomeSocialProofStrip`.

**Değerlendirme:** `HomeAccountNav` Suspense deseni **doğru** (`components/public/home-account-nav.tsx:11-15` yorumunda açıkça yazılı). Ama `GrantEligibilityWidget` hero'nun altında **hemen** yükleniyor ve `SmartTextarea` + `withRailApiVersion` + tüm `GRANT_*` sabitlerini çekiyor.

**Öneri:** `GrantEligibilityWidget`'ı `next/dynamic` + `ssr: false` ile viewport'a yaklaşınca yükle (IntersectionObserver veya `dynamic` + `loading`). LCP öğesi olmadığı için TBT'de doğrudan kazanç.

---

#### `[İYİLEŞTİRME]` P-04 — `reactStrictMode: true` + çift render

`next.config.ts:40` — geliştirmede çift render. Üretimde etkisi yok, ancak Junior oynatıcılarındaki `useEffect` zincirleri (`components/junior/player/use-junior-playback.ts`, 28.4 KB) geliştirmede iki kez tetikleniyor ve bu, ses senkron hatalarını ayıklamayı zorlaştırıyor. **Aksiyon gerekmez**, sadece bilgi.

---

### 2.5 Teknik SEO

---

#### `[YÜKSEK]` SEO-01 — Fiyatlandırma sayfasında `Product`/`Offer` yapılandırılmış verisi yok

**Dosya:** `app/(public)/fiyatlandirma/page.tsx` — `JsonLd` **hiç import edilmemiş**.

**Kanıt:** Sayfada 6 fiyat kartı, 1 karşılaştırma tablosu, `data-vitrine-item`, `data-price-honesty` öznitelikleri var — ama **makine okunabilir fiyat yok**.

**Etki:**
- Google `Product` rich result (fiyat + "Stokta") hiç çıkmıyor.
- AI arama motorları (ChatGPT/Perplexity/Gemini) "yetkin.ai fiyatları" sorusuna **cevap veremiyor** — çünkü fiyat HTML metninde ama `Offer` şemasında değil.
- Bu, GEO/AEO (Generative Engine Optimization) açısından **en büyük tek kayıp**.

**Öneri:**
```json
{
  "@type": "Product",
  "name": "AI Tezgâh Pro",
  "offers": {
    "@type": "Offer",
    "price": "590.00",
    "priceCurrency": "TRY",
    "availability": "https://schema.org/InStock",
    "url": "https://yetkin.ai/fiyatlandirma#tezgah-pro"
  }
}
```
`loadPublicPricingVitrine()` zaten `amountMinor` döndürüyor — `jsonLdDocument([...])` ile 6 `Product` + 1 `ItemList` bas. Fiyat uydurma riski yok, çünkü kaynak aynı.

---

#### `[YÜKSEK]` SEO-02 — `llms.txt` yok; GEO/AEO yüzeyi tanımsız

**Kanıt:** `public/llms.txt` → yok. `app/llms.txt` → yok.

**Etki:** 2026'da AI tarayıcıları (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) için `llms.txt` fiilî standart. `robots.ts` yalnız `*` ve `Googlebot` tanımlıyor:
```10:10:app/robots.ts
const CRAWL_AGENTS = ["*", "Googlebot"] as const;
```
`*` joker olarak AI botlarını da kapsıyor (yani **engellenmiyor** — iyi), ama onlara **yapılandırılmış rehber** sunulmuyor.

**Öneri:** `app/llms.txt/route.ts` (veya `public/llms.txt`) üret:
```
# yetkin.ai
> KOBİ'ler, e-ticaret satıcıları ve profesyoneller için pratik AI iş araçları.

## Ürünler
- AI Tezgâh: /tezgah — günde 3 ücretsiz üretim
- E-Ticaret OS: /e-ticaret — 30 gün ücretsiz (1 TL doğrulama)
- YetkinCV: /career — ücretsiz uygulamalı vaka testi

## Fiyatlar
- AI Tezgâh Pro: 590 TL/ay
- E-Ticaret: 1.490 TL/ay
...
```

---

#### `[ORTA]` SEO-03 — Ana sayfa H1'i SERP'te kırpılıyor ve marka sesiyle çelişiyor

**Kanıt:** `lib/copy/sen-voice/public.ts:7`
> `"İşinizi Büyüten Yapay Zeka Araçları. Tek Hesap, Sıfır Karmaşa."` → **74 karakter** (+ ` · yetkin.ai` = 86)

Google SERP başlık sınırı ~580 px ≈ **60 karakter**. Bu başlık `…Tek Hesap, Sıfır…` noktasında kesilecek. Ayrıca `siz` aksında (M-01).

**Ölçülen diğer başlıklar:**

| Sayfa | Uzunluk (+12 marka) | Durum |
|---|---:|---|
| `home` | **74** | ⚠️ kırpılır |
| `kurumsal` | 66 | ⚠️ sınırda |
| `guide` | 64 | ⚠️ sınırda |
| `about` | 61 | ✅ |
| `pricing` | 60 | ✅ |
| `tezgah` | 59 | ✅ |
| `contact` | **30** | ⚠️ çok kısa (fırsat kaçıyor) |
| `legal` | **28** | ⚠️ çok kısa |
| `sozluk` | 49 | ✅ |

**Description uzunlukları:** `kurumsal` **177 karakter** (SERP sınırı ~155) → kırpılır. Diğerleri 97-143 arası ✅.

**Öneri:**
- `home` → `"AI Tezgâh — KOBİ'ler için pratik yapay zeka araçları"` (55)
- `contact` → `"İletişim — destek, kurumsal başvuru ve KVKK talepleri"` (56)
- `legal` → `"Yasal metinler — KVKK, mesafeli satış ve kullanım şartları"` (60)
- `kurumsal` description'ı 155'e kırp.

---

#### `[ORTA]` SEO-04 — `/kasa` ve `/kasa/donus` "index: false, follow: false" — doğru; ama `/tetkik/[hash]` paylaşılabilir rapor olarak `noindex`

**Dosya:** `app/(public)/tetkik/[hash]/page.tsx:23` → `robots: { index: false, follow: true }`

**Değerlendirme:** Bu **bilinçli** (kullanıcıya ait analiz raporu). Ama ürün "paylaşılabilir web site analizi" olarak pazarlanıyor (`PAGE_SEO.tetkik`). Paylaşılan bir raporun arama motorunda çıkmaması, viral döngüyü sınırlıyor.

**Öneri:** Kullanıcı raporu **açıkça paylaştığında** (`?paylas=1` veya `/tetkik/[hash]/kamu`) `index: true` ver. Aksi halde noindex kalsın. Bu, "SEO aracı" ürününün kendi SEO'sunu üretmesini sağlar.

---

#### `[İYİLEŞTİRME]` SEO-05 — `sitemap.xml` `lastmod` doğru ama `changeFrequency`/`priority` Google tarafından yok sayılıyor

**Dosya:** `lib/copy/seo.ts:360-391`, `app/sitemap.ts`

`readSitemapLastModified` (`lib/copy/sitemap-lastmod.ts`) istek saati yerine dosya mtime kullanıyor — **bu mükemmel bir mühendislik**. Ancak `priority: 1.0 / 0.9 / 0.8` Google 2023'ten beri **yok sayıyor**. Zararsız ama gereksiz.

**Daha önemli:** Sitemap'te `/fiyatlandirma` → `priority: 0.7` (default dal). Ticari değeri en yüksek sayfa, `/uzmanlar` (0.8) ve `/tetkik` (0.8) ile aynı, `/career` (0.9) ve `/tezgah` (0.9)'ın **altında**. Bu bir öncelik hatası.

**Öneri:** `sitemapRoutePolicy`'de `/fiyatlandirma`'yı 0.9'a çıkar; `/legal`'i 0.3'e düşür (11 yasal sayfa sitemap'i şişiriyor).

---

#### `[İYİLEŞTİRME]` SEO-06 — `hreflang` / çok dillilik yok (bilinçli), ama `/en/*` 301'leri hâlâ duruyor

**Dosya:** `next.config.ts:155-174` — 4 adet `/en/*` → TR 301.

**Değerlendirme:** Doğru karar (tek dil). Ama `next.config.ts:117-119` yorumunda "SEO Tedavi" notları var — bu kurallar **ölü ağırlık**, çünkü `/en/*` hiçbir yerde bağlantılanmıyor. Google'da kalmış indeksleri temizlemek için gerekli, **kalsın**.

**Aksiyon:** Yok. Bilgi amaçlı.

---

## 3. Modül Senkronizasyon Matrisi

Her hücre: **Frontend ↔ API ↔ DB ↔ Auth** zincirinin durumu.

| Modül | Frontend | API | DB Şema | Auth | Durum | Sorun |
|---|---|---|---|---|---|---|
| **AI Tezgâh** | `components/tezgah/workbench.tsx` (52.4 KB) ✅ | 7 rota ✅ | `tezgah.prisma` ✅ | `public` + kota ✅ | 🟢 **Senkron** | Pro kotası görünmüyor (B-02) |
| **E-Ticaret OS** | `components/commerce/*` ✅ | 14 rota ✅ | `commerce.prisma` (18 KB) ✅ | `session` ✅ | 🟢 **Senkron** | 4 adımlı kayıt yolu (B-04) |
| **YetkinHibe** | `components/hibe/*` ✅ | 2 rota ✅ | `yetkinhibe.prisma` ✅ | `session` ✅ | 🟡 **Kısmi** | `DRON_YETKINHIBE_OPEN` boşsa `/hibe` 410; ama vitrinde "canlı" görünüyor |
| **YetkinCV** | `components/career/yetkincv-station.tsx` ✅ | `POST /api/career/yetkincv` ✅ | `career.prisma` ✅ | `session` ✅ | 🔴 **Kopuk** | Katalog satırı var, ödeme yok (B-01) |
| **Kurumsal İK** | `components/kurumsal/*` ✅ | `POST /api/kurumsal/ilanlar`, `POST /api/ilan/[slug]/basvuru` ✅ | `b2b.prisma` ✅ | `session` ✅ | 🟢 **Senkron** | Teklif tutarı kayda yazılmıyor (B-06) |
| **Junior** | `components/junior/*` (≈40 dosya) ✅ | 11 rota ✅ | `junior.prisma` ✅ | `session` + veli onayı ✅ | 🟡 **Kısmi** | `noindex` + `DRON_JUNIOR_*` bayrakları; `/junior` sitemap dışı |
| **Akademi** | **410** (`archived/`) | 15 rota, çoğu `closed` | `academy.prisma` ✅ | `closed` | 🔴 **Ölü** | CSS %74.6 hâlâ yükleniyor (M-02) |
| **Freelancer** | **410** (`FREELANCER_PUBLIC_SURFACE_LOCKED`) | 10 rota | `freelancer.prisma` ✅ | — | 🔴 **Ölü** | `components/freelancer/direct-job-offer-button.tsx` yetim |
| **Cüzdan** | `components/kernel/*` ✅ | 4 rota ✅ | `kernel.prisma` ✅ | `session` ✅ | 🟢 **Senkron** | — |
| **Ödeme (PayTR)** | 4 ayrı checkout yüzeyi ✅ | 2 webhook + 2 cron ✅ | `payment_orders`, `ledger_entries` ✅ | `webhook` HMAC ✅ | 🟢 **Senkron** | 3 farklı dönüş rotası (`/cuzdan`, `/kasa/donus`, iframe) |
| **SEO/İçerik** | `lib/copy/*` ✅ | — | — | — | 🟡 **Kısmi** | `globals.css` ölü kod, `manifest` yok |
| **Auth** | `components/auth/*` ✅ | 6 rota ✅ | Supabase Auth ✅ | ✅ | 🟢 **Senkron** | İlk değer anı yok (B-03) |

### 3.1 Modül Ağırlık Dağılımı (bakım yükü)

| Modül | Dosya sayısı | Toplam boyut | Canlı mı? |
|---|---:|---:|---|
| Junior | ≈120 | ~1.100 KB | ✅ (kısmi) |
| Akademi (arşiv) | ≈130 | ~900 KB | ❌ 410 |
| Kernel | ≈80 | ~450 KB | ✅ |
| E-Ticaret | ≈35 | ~400 KB | ✅ |
| Tezgâh | ≈20 | ~250 KB | ✅ |
| Career/YetkinCV | ≈15 | ~150 KB | ✅ |
| Kurumsal | ≈8 | ~100 KB | ✅ |

**Yorum:** Junior (1.100 KB kod + 1.578 MB medya), ürünün **en ağır** modülü — ama `noindex` ve kapalı beta. Bu, ticari olarak en az getiri sağlayan modülün mühendislik olarak en pahalı olduğu anlamına geliyor. Bu bir strateji sorusu (§4).

---

## 4. Ticari Büyüme ve Ürün Geliştirme Önerileri

### 4.1 Gelir Mimarisi — 3 Somut Hamle

#### 🥇 Hamle 1: **Ücretsiz Tezgâh'ı "kayıtsız ödeme" ile birleştir (Guest Checkout)**

**Mevcut:** Misafir 3 üretim yapar → kota dolar → "Ücretsiz kayıt ol" → kayıt → e-posta doğrulama → dashboard → tezgâh → **tekrar kota** → Pro satın al.

**Önerilen:** Kota dolduğunda **iki** buton:
1. "Ücretsiz devam et" → kayıt (mevcut)
2. **"590 TL/ay ile kesintisiz devam et"** → e-posta + fatura + kart → PayTR → hesap otomatik açılır

**Gerekçe:** Ödeme niyeti en yüksek anda (kota duvarı) 4 adım yerine 1 adım. Teknik altyapı **hazır**: `placeTezgahCheckout` `userId` alıyor; misafir için `userId`'yi ödeme sonrası Supabase `signUp` ile üretip `fulfillTezgahOrder`'a bağlamak yeterli. `prisma/schema/kernel.prisma` → `payment_orders` zaten `userId` nullable değil ama ödeme öncesi geçici kullanıcı açılabilir.

**Tahmini etki:** Tezgâh Pro dönüşümünde **2-3×** artış (sektör ortalaması: guest checkout, hesap zorunluluğuna göre %30-50 daha yüksek tamamlama).

---

#### 🥈 Hamle 2: **"Kota" yerine "Kredi" — Tezgâh'ı kredi ekonomisine çevir**

**Mevcut:** Günde 3 ücretsiz. Pro = 590 TL/ay. 10 kredi = 190 TL. Üç ayrı ürün.

**Sorun:** Günlük 3 kota, **kullanım yoğunluğunu** cezalandırıyor. Bir serbest çalışan pazartesi 20 teklif yazmak istiyor, cuma hiç işi yok. Günlük 3 ona yetmiyor; 590 TL/ay ise sadece 2 gün kullanacaksa pahalı.

**Önerilen:** **Aylık kredi havuzu**:
- Ücretsiz: 30 kredi/ay (günlük 3 yerine — aynı toplam, ama esnek)
- Pro: 500 kredi/ay (590 TL)
- Kredi paketi: 10 kredi = 190 TL (mevcut)
- Kredi devri: 1 ay (kullanılmayan kredi sonraki aya %50 devreder)

**Gerekçe:** `lib/tezgah/quota.ts` zaten `TezgahLane = "free" | "pro" | "credit" | "prepaid" | "closed"` ayrımını yapıyor ve `tezgah_daily_quotas` tablosu var. `dateKey` mantığını `monthKey`'e çevirmek **mimari değişiklik değil**. Ayrıca:
- "3/3 doldu" mesajı yerine "27 kredin kaldı" → **daha az baskı, daha çok kullanım**.
- Pro'nun faydası **ölçülebilir** hale gelir (500 vs 30 = 16.6×) → B-02 çözülür.

**Tahmini etki:** Tezgâh Pro'nun değer algısı 16× netleşir; kredi paketi satışı artar (esneklik).

---

#### 🥉 Hamle 3: **YetkinCV'yi "ücretsiz test + ücretli mühür" modeline bağla**

**Mevcut:** Test ücretsiz, puan ücretsiz, kamu kartı ücretsiz. Katalogda 290 TL'lik satır **kullanılmıyor**.

**Önerilen:**
- **Test: ücretsiz** (mevcut — doğru, bu bir lead magnet)
- **Puan + özel SWOT + 30/60/90 plan: ücretsiz** (mevcut)
- **"Kamuya açık Kariyer Kartı" + LinkedIn rozeti + öncelikli uzman dizini listelenmesi: 290 TL (tek seferlik)**

Teknik: `sealYetkinCvSitting` zaten mühür üretiyor. `certificateHash` var. Ayrım noktası: mühür **her zaman** üretilsin ama `/vize/[hash]` kartı `paid: false` ise **özet** göstersin (puan + beceri), `paid: true` ise **tam kart + paylaşım + dizin** göstersin.

**Gerekçe:** Bu, "satın alma puan basmaz" dürüstlük ilkesini **bozmaz** (puan yine testten gelir; para yalnız **yayını** açar). Mevcut `public-vitrine.ts:142-145` yorumu bu ayrımı zaten vurguluyor: *"Puan satın almadan değil test sonucundan oluşur."* — Para, **görünürlüğü** satın alır.

**Tahmini etki:** 0 TL → ilk gerçek "dijital ürün" geliri. Ayrıca B-01'deki hayalet katalog satırı canlanır.

---

### 4.2 Deneyim ve Dönüşüm — 5 Hızlı Kazanç

| # | Hamle | Dosya | Efor | Etki |
|---|---|---|---|---|
| 1 | **İlk değer anı**: `/register` sonrası `next` yoksa `/tezgah?tool=proposal&ilk=1`'e yönlendir | `lib/kernel/auth/redirects.ts:11` | 1 saat | 🟢 Yüksek |
| 2 | **Aktivasyon olayı**: `tezgah_first_output` GA4 event'i (`emitSemConversion`) | `lib/tezgah/engine.ts:156-164` | 2 saat | 🟡 Ölçüm |
| 3 | **Pro kota gerçeği**: `tezgahPoolLimit`'e `pro` dalı + `line` metni | `lib/tezgah/quota.ts:199-205` | 2 saat | 🟢 Yüksek |
| 4 | **Fiyat sayfasında `Product` JSON-LD** | `app/(public)/fiyatlandirma/page.tsx` | 3 saat | 🟢 SEO |
| 5 | **`globals.css` arşiv ayrıştırması** | `app/globals.css` | 2 saat | 🟢 LCP |

---

### 4.3 Rekabet Ayrıştırma — yetkin.ai'yi Farklılaştıracak 3 Hamle

#### A) **"Doğrulanabilir Yetkinlik" — Türkiye'de tek**

Rakipler (Upsun, Hosting.com.tr araçları, ChatGPT doğrudan kullanımı) **çıktı** satıyor. yetkin.ai **kanıt** satıyor: `SHA-256` mühürlü, herkese açık doğrulama (`/vize/[hash]`), k-anonim uzman dizini (`/uzmanlar`, eşik 5).

**Hamle:** Bunu **tek** cümleye indir ve her yere yaz:
> *"Ürettiğin belgeyi kanıtlayabilirsin. Başkası ürettiğini iddia edemez."*

Bu, "AI ile teklif yaz" diyen 100 rakip arasında **tek savunulabilir** konumlandırma.

#### B) **"Dürüstlük"ü pazarlama malzemesi yap**

Kod tabanı, "sahte veri yok" ilkesini **fiziksel olarak** uyguluyor:
- `lib/pricing/home-social-proof.ts:40` → eşik 10; altındaysa **hiç basılmaz**
- `lib/pricing/showcase-price.ts:14` → katalog satırı yoksa **"Hazırlanıyor"**, fiyat uydurulmaz
- `app/(public)/uzmanlar/page.tsx:153` → "Bu kart bir kişi değildir. …İsim ve profil uydurulmaz."

**Hamle:** Bir **"Dürüstlük Sayfası"** (`/durustluk`) aç: hangi sayıların nereden geldiğini, hangi vaatlerin **verilmediğini** listele. Bu sayfa:
- Güven üretir (B2B satın alma kararında kritik)
- AI arama motorlarına **alıntılanabilir** içerik verir (GEO)
- Rakiplerin kopyalayamayacağı bir **savunma hendeği** (çünkü onların kodu yalan söylüyor)

#### C) **"Tek hesap" yerine "tek kanıt zinciri"**

Mevcut konumlandırma: "Tek hesap, sıfır karmaşa" — bu **özellik**, fark değil.

**Hamle:** Değer zincirini görselleştir:
```
Tezgâh'ta üret → YetkinCV'de kanıtla → /vize'de yayınla → Kurumsal İK'da eşleş
```
Bu zincir **gerçekten kodda var**: `components/tezgah/output-portfolio.tsx:34` → `POST /api/career/portfolio` → `careerPortfolioItem` → `/vize/[hash]`. Rakiplerin hiçbirinde bu kapalı döngü yok.

Ana sayfada bu zinciri **tek bir yatay şerit** olarak göster (mevcut `copy.chain` 4 adımı zaten var — ama "Ücretsiz Tezgâh / Hibe / Kanıtla / E-ticaret" diye dağınık). Yeniden sırala: **Üret → Kanıtla → Yayınla → Eşleş**.

---

### 4.4 Ölçüm Altyapısı — Eksik Olan 4 Olay

`lib/kernel/sem/conversion.ts` yalnız 3 olay tanımlıyor: `purchase`, `register`, `generate_lead`.

**Eklenmesi gerekenler:**

| Olay | Nerede | Neden |
|---|---|---|
| `tezgah_first_output` | `lib/tezgah/engine.ts` (ilk `outputId`) | Aktivasyon hunisinin **tek** gerçek ölçüsü |
| `tezgah_quota_wall` | `components/tezgah/workbench.tsx:1155` | Kota duvarının dönüşümünü ölç |
| `pricing_view` → `checkout_start` | `app/(public)/fiyatlandirma/page.tsx` | Fiyat → ödeme oranı |
| `seal_published` | `lib/career/yetkincv-store.ts` | Viral döngünün çıkışı |

**Neden kritik:** Şu an `purchase` olayı var ama **huni** yok. Yani "1000 kişi geldi, 3 kişi ödedi" biliyorsun ama **nerede kaybettiğini** bilmiyorsun. Bu 4 olay olmadan §4'teki hiçbir hamlenin etkisi ölçülemez.

---

## 5. Öncelik Sıralı Aksiyon Planı

### Faz 1 — 48 saat içinde (kritik, düşük efor)

| # | Aksiyon | Dosya | Efor |
|---|---|---|---|
| 1 | `verify:sen-axis` yeşile döndür (2 ihlal) | `app/(public)/rehber/page.tsx:71`, `lib/copy/junior-guardian-notice.ts:18` | 15 dk |
| 2 | Ana sayfa H1 + meta'yı sen aksına çevir ve kısalt | `lib/copy/sen-voice/public.ts:7-9` | 15 dk |
| 3 | Pro kota gerçeği: `tezgahPoolLimit`'e `pro` dalı | `lib/tezgah/quota.ts:199` | 30 dk |
| 4 | `globals.css`'ten `academy-*` bloklarını ayrıştır | `app/globals.css` | 1 saat |
| 5 | Kayıt sonrası `next` yoksa `/tezgah`'a yönlendir | `lib/kernel/auth/redirects.ts:11` | 30 dk |

### Faz 2 — 1 hafta (yüksek etki, orta efor)

| # | Aksiyon | Dosya |
|---|---|---|
| 6 | Fiyatlandırma sayfasına `Product`/`Offer` JSON-LD | `app/(public)/fiyatlandirma/page.tsx` |
| 7 | `app/llms.txt/route.ts` ekle | yeni |
| 8 | `manifest.ts` + `viewport` + `themeColor` | `app/layout.tsx` |
| 9 | YetkinCV ödeme rotası (`/api/career/yetkincv/purchase`) | yeni |
| 10 | `generate` rotalarına kullanıcı bazlı hız tavanı | `lib/kernel/security/http-rate-limit.ts` |
| 11 | `getEnv()` çağrısını `instrumentation.ts`'e bağla | `instrumentation.ts` |
| 12 | `app/(public)/layout.tsx`'e `PublicTopBar` | yeni |
| 13 | 4 eksik GA4 olayı | `lib/kernel/sem/conversion.ts` |

### Faz 3 — 1 ay (stratejik)

| # | Aksiyon |
|---|---|
| 14 | Guest checkout (misafir Tezgâh Pro) |
| 15 | Kredi ekonomisi (günlük kota → aylık kredi) |
| 16 | `lib/academy/curricula` + yetim bileşenleri `archived/`'a taşı |
| 17 | Junior MP3'leri 64 kbps'e düşür (1.578 MB → ~350 MB) |
| 18 | `/durustluk` sayfası + değer zinciri görselleştirmesi |
| 19 | Aylık fiyat → yıllık fiyat seçeneği (2 ay bedava) |

---

## 6. Ekler

### 6.1 Ölçüm Özeti

| Metrik | Değer | Kaynak |
|---|---|---|
| Sayfa rotası | 60 | `app/**/page.tsx` |
| API rotası | 132 | `app/api/**/route.ts` |
| Test dosyası | 365 | `npx vitest run` |
| Test sayısı | 1.988 | `npx vitest run` |
| TypeScript hatası | 0 | `npx tsc --noEmit` |
| Kırık iç bağlantı | 0 | Özel tarama |
| `globals.css` ham / gzip / brotli | 151.1 / 26.4 / 21.6 KB | `node zlib` |
| Ölü CSS oranı | %74.6 (115.3 KB) | Blok analizi |
| Yetim CSS sınıfı | 389 / 404 | Kullanım taraması |
| `public/` boyutu | 55.6 MB (paket) / 1.578 MB (medya) | `verify:public-size` |
| RLS kapsamı | 74 tablo FORCE RLS | `verify:rls-status` |
| Sözlük terimi | 30 (metinle uyumlu ✅) | `lib/copy/glossary.ts` |
| Rehber makalesi | 14 (hub'daki "dört modül" ayrı `WORKFLOW_MODULES` sicilidir ✅) | `lib/copy/guides.ts` |
| Try/catch'siz API rotası | 18 / 132 | `app/api/**/route.ts` taraması |

### 6.2 Bilinen Sınırlar (bu denetimin görmediği)

1. **Runtime davranışı ölçülmedi.** Lighthouse/Core Web Vitals gerçek tarayıcıda koşulmadı; bulgular statik analiz + kod okuma.
2. **Veritabanı canlı değil.** `DATABASE_URL` boş; katalog satırlarının gerçekten dolu olup olmadığı `migration.sql` üzerinden çıkarıldı.
3. **PayTR canlı akış test edilmedi.** Sandbox/mock kurulu değil.
4. **`apps/rail-is` (native istemci) kapsam dışı** — workspace kuralı gereği.
5. **`archived/` ve `yetkin_muze/` okunmadı** — workspace kuralı gereği. Ancak `globals.css`'e sızmış arşiv CSS'i tespit edildi.

### 6.3 Kapı Komutları — Yeniden Üretim

```bash
npx tsc --noEmit                                  # ✅ 0 hata
npx vitest run                                    # ✅ 1988 test
npm run verify:api-auth -- --check                # ✅ 132 rota
npm run verify:boundaries                         # ✅
npm run verify:rls-status                         # ✅ 74 tablo
npm run verify:no-secrets                         # ✅
npm run verify:public-size                        # ✅ 55.6 MB
npm run verify:sen-axis                           # ❌ 2 ihlal (M-01)
```

---

**Rapor sonu.**
Bu denetimde hiçbir kaynak dosya değiştirilmedi, silinmedi veya taşınmadı. Yalnızca bu dosya (`docs/TESPIT_RAPORU.md`) oluşturuldu.
