# Adım 1 Raporu — Ana Sayfa & Kamu Vitrin Metinleri

**Tarih:** 19 Kasım 2026  
**Kapsam:** `app/(public)/page.tsx`, `lib/copy/sen-voice/public.ts`, `lib/copy/seo.ts`, `app/layout.tsx`, `lib/copy/sem-keywords.ts` (HOME_LANDING_FAQ) + bağımlı yüzey testleri.  
**Doğrulama:** `npx tsc --noEmit` geçti; ilgili 7 Vitest dosyası / 59 test geçti.

---

## Yönetici özeti

Ana sayfa ve kamu meta katmanı «beş modüllü AI işletim sistemi» dilinden çıkarıldı. Ziyaretçi artık sonuç odaklı bir H1, tek birincil CTA (`/tezgah`), sade bir fiyat linki ve dört çözüm kartı görüyor. Akademi / Junior / Young bağlantıları, kartları ve meta vaatleri ana sayfa yüzeyinden kaldırıldı.

---

## 1. `lib/copy/sen-voice/public.ts` (home)

### 1.1 Hero

| Alan | Eski | Yeni |
|---|---|---|
| `title` (H1) | Beş modüllü birleşik AI işletim sistemi. Tek hesap. | İşinizi Büyüten Yapay Zeka Araçları. Tek Hesap, Sıfır Karmaşa. |
| `description` | E-Ticaret OS / YetkinHibe OS / SHA-256 / kurumsal ilan elemesi… | Dakikalar içinde profesyonel belgeler üretin, e-ticaret stok ve siparişlerinizi tek yerden yönetin, işletmenize uygun hibeleri bulun ve yetkinliğinizi gerçek testlerle kanıtlayın. |
| `primaryCta` | AI Tezgâhını Ücretsiz Dene (Kayıtsız) | Ücretsiz Hemen Dene (Kayıt Gerekmez) |
| `secondaryCta` | *(yok)* | Paketleri İncele |
| `tezgahCta` | AI Tezgâhını Dene | Tezgâhı Aç |

`academyCta` anahtarı **korundu** (kapalı Akademi `course-list` hâlâ okuyor); ana sayfa artık kullanmıyor.

### 1.2 Güven / zincir / tezgâh bandı

| Alan | Eski | Yeni |
|---|---|---|
| `trust[2]` | Sınav ve mühür sunucuda doğrulanır; ikna yerine kanıt | Yetkinlik testleri sunucuda puanlanır; sonuç paylaşılabilir |
| `benchKicker` | Tezgâh vitrini | Tezgâh araçları |
| `bench` dukkan body | …tek sayfalık vitrin… | …tek sayfalık site… |
| `chainKicker` | Değer zinciri | Nasıl başlarsın |
| `chainTitle` | Dört adımda sistem | Dört adımda işe koyul |
| Zincir adımları | Ücretsiz Test & Tezgâh / YetkinHibe dosyası / Doğrulanmış Rozet / E-Ticaret ve 30 günlük plan | Ücretsiz Tezgâh / Hibe & teşvik / Yetkinliğini kanıtla / E-ticareti yönet |

### 1.3 Track kartları (5 → 4)

| Eski | Yeni |
|---|---|
| E-Ticaret OS · YetkinHibe OS · AI Tezgâh · YetkinCV & Kariyer · Kurumsal İlan & Eleme | **AI Tezgâh** → Tezgâhı Aç (`/tezgah`) |
| `tracksKicker`: Beş modül | **E-Ticaret Yönetimi** → E-Ticareti İncele (`/e-ticaret`) |
| `tracksTitle`: Tek işletim sistemi | **Hibe & Teşvik Bulucu** → Hibeleri Gör (`/hibe`) |
| CTA: `{title} sistemini aç` + ikinci Tezgâh düğmesi | **YetkinCV & İK Eleme** → Kariyer Merkezine Git (`/career`) |
| | `tracksKicker`: Çözümler · `tracksTitle`: İhtiyacına göre bir alan seç · her kartta `cta` alanı |

---

## 2. `app/(public)/page.tsx`

### 2.1 Üst navigasyon

| Eski | Yeni |
|---|---|
| Uzmanlar · Fiyatlar · (Hesap) | **AI Tezgâh** · **Fiyatlar** · **Kurumsal** · **Rehber** · (Hesap) |

Kapalı modül linki yok (`/academy`, `/junior`, `/young`).

### 2.2 Hero CTA

| Eski | Yeni |
|---|---|
| 3 düğme: Tezgâh + E-Ticaret İşletim Sistemi + YetkinHibe İşletim Sistemi | **1 birincil:** Ücretsiz Hemen Dene → `/tezgah` |
| | **1 ikincil metin linki:** Paketleri İncele → `/fiyatlandirma` |

### 2.3 Track render

- Grid: `lg:grid-cols-3` → `lg:grid-cols-4`
- Tek CTA: `track.cta` (eski «sistemini aç» + ikinci Tezgâh düğmesi kaldırıldı)

---

## 3. SEO & meta

### 3.1 `lib/copy/seo.ts` — `PAGE_SEO.home`

| Alan | Eski | Yeni |
|---|---|---|
| `title` | (PUBLIC_SEN.home.title — eski H1) | (PUBLIC_SEN.home.title — yeni H1) |
| `description` | E-Ticaret OS, YetkinHibe OS… Beş modül, tek hesap, tek AI işletim sistemi. | KOBİ'ler, e-ticaret satıcıları ve profesyoneller için AI Tezgâh, e-ticaret yönetimi, hibe bulucu ve YetkinCV. Tek hesap, pratik iş araçları. |

### 3.2 `app/layout.tsx` — kök description / OG / Twitter

| Eski | Yeni |
|---|---|
| yetkin.ai beş modüllü birleşik AI işletim sistemi. | yetkin.ai — KOBİ'ler, e-ticaret satıcıları ve profesyoneller için pratik yapay zeka iş araçları. |

(`title.default` marka adı olarak kaldı; `SEM_LANDING_KEYWORDS` Ads/Akademi SEM SSOT’u olduğu için bu adımda değiştirilmedi.)

---

## 4. `lib/copy/sem-keywords.ts` — `HOME_LANDING_FAQ`

Ana sayfa SSS’i jargon ve «beş modül» dilinden arındırıldı (5 → 4 madde):

1. AI Tezgâh ile ne üretebilirim?
2. E-ticaret yönetimi neyi tek ekranda toplar?
3. Hibe ve teşvik bulucu nasıl çalışır?
4. YetkinCV ve İK eleme işverene ne gösterir?

Çıkarılan jargon örnekleri: E-Ticaret OS, kokpit, YetkinHibe OS, SHA-256, «basılmaz».

---

## 5. Güncellenen testler

- `tests/copy/sen-axis-surface.test.ts`
- `tests/copy/seo-surface.test.ts`
- `tests/ui/brand-mark-surface.test.ts`
- `tests/ui/public-home-cta-surface.test.ts`
- `tests/ui/home-offer-surface.test.ts`
- `tests/ui/home-bench-surface.test.ts`
- `tests/tezgah/surface.test.ts`
- `tests/e2e/faz1-nav.spec.ts` (Playwright beklentileri yeni H1/CTA/nav’a çekildi; bu oturumda e2e koşturulmadı)

---

## 6. Bilinçli olarak dokunulmayanlar

| Alan | Neden |
|---|---|
| `PUBLIC_SEN.home.academyCta` değeri | Kapalı Akademi `course-list` hâlâ bu anahtarı okuyor; ana sayfada kullanılmıyor |
| `PAGE_SEO.academy` / `junior` / yasal metinler | Bu adımın kapsamı ana sayfa + kök meta; yasal OS dili ayrı adım |
| Fiyatlandırma / Kariyer / Hibe sayfa gövdeleri | Ayrı ticari metin turu |
| `SEM_LANDING_KEYWORDS` listesi | Akademi SEM / Ads SSOT; layout keywords hâlâ buradan geliyor |

---

## 7. Doğrulama komutları

```bash
npx tsc --noEmit
npx vitest run tests/copy/sen-axis-surface.test.ts \
  tests/ui/brand-mark-surface.test.ts \
  tests/ui/home-offer-surface.test.ts \
  tests/ui/public-home-cta-surface.test.ts \
  tests/ui/home-bench-surface.test.ts \
  tests/tezgah/surface.test.ts \
  tests/copy/seo-surface.test.ts
```

**Sonuç:** tip kontrolü temiz; 59/59 ilgili birim testi geçti.
