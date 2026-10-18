# TESPİT RAPORU — Academy / Junior Yüzey Ayrıştırma

**Tarih:** 2026-10-18  
**Karar sahibi:** CEO + SUPER_ADMIN  
**Kapsam:** `http://localhost:3000/academy` üzerindeki Yetkin Junior tanıtım kartının tespiti; Akademi ve Junior dikeylerinin %100 bağımsız rota haline getirilmesi için ön inceleme.  
**Durum:** Tespit tamamlandı. Kod silme / kaldırma bu raporda yapılmamıştır.

---

## ADIM 1 — `/academy` Görsel Kart Bileşeninin Tespiti

### 1.1 Kesin konum

| Öğe | Değer |
|-----|--------|
| Sayfa | `app/academy/page.tsx` |
| Bileşen dosyası | `components/academy/junior-cross-sell.tsx` |
| Export | `JuniorCrossSellBanner` |
| DOM işareti | `data-junior-cross-sell=""` |

Kart metinleri (görseldekiyle birebir):

- Eyebrow: **Yetkin Junior**
- Başlık: **Çocuğun için 6. sınıf dersleri Junior'da**
- Açıklama: Matematik, Fen, Türkçe, Ana İngilizce ve Sosyal Bilgiler; ilk konu ücretsiz; sınıf seçici 6. sınıf pilotu
- CTA: **► Junior Derslerini İncele** → `href="/junior"`

### 1.2 Sayfa içi yerleşim

`app/academy/page.tsx` içinde sıra:

1. `JsonLd`
2. `CourseList` (kurs vitrini + resume şeridi + legal footer slot)
3. **`JuniorCrossSellBanner`** ← kaldırılacak yüzey
4. `LandingFaq`

Import satırı:

```ts
import { JuniorCrossSellBanner } from "@/components/academy/junior-cross-sell";
```

### 1.3 Layout / boşluk / kırılma riski

**Sonuç: Kaldırıldığında layout kırılması beklenmez.**

Gerekçe:

- Banner, `CourseList` ve `LandingFaq` arasında **bağımsız kardeş** bir `<section>`dır; CourseList grid’ine gömülü değildir.
- Kabuk `RoomFrame className="space-y-3 pb-8"` kullanır; bir çocuk node silinince `space-y` yalnızca kalan boşluğu kapatır — ekstra boşluk veya “delik” oluşmaz.
- `app/academy/layout.tsx` Junior’a referans vermez; yalnız `AppShell` + `LegalColophonStrip`.
- `components/academy/*` altında Junior geçen **tek dosya** `junior-cross-sell.tsx`tır. Diğer academy bileşenleri (`course-list`, `course-card`, `continue-panel` vb.) Junior import etmez.
- `JuniorCrossSellBanner` için test referansı (`tests/` altında `junior-cross-sell` / `JuniorCrossSell` / `data-junior-cross-sell`) bulunamadı; kaldırma test kırığı doğurmaz.

---

## ADIM 2 — Bağımsızlık ve Rota Denetimi

### 2.1 Sol menü ↔ Akademi bağlantısı

| Kanal | Junior’a gidiş | Rol |
|-------|----------------|-----|
| Sol navigasyon | `lib/dronlar/kayit.ts` → `INDEPENDENT_ROOMS` (`id: "junior"`, `path: "/junior"`, `label: "Junior"`) | **Kalıcı oda girişi** — müstakil oda; `VERTICAL_ROOMS` (dashboard / academy / career / freelancer) dışında |
| `/academy` vitrin kartı | `JuniorCrossSellBanner` → `/junior` | **Sayfa içi cross-sell** — bu tespitin konusu |

**Doğrulama:** `/academy` sayfası yüzeyinde Junior’a giden **tek ürün bağlantısı** bu banner’dır. Sol menüdeki Junior odası kayıt defterinden gelir; banner’a bağımlı değildir. Banner kaldırılsa Junior sol menüden erişilebilir kalır.

Kod yorumu zaten niyeti doğrular (`lib/dronlar/kayit.ts`):

> «Müstakil oda. Dört kamu vitrinine yazılmaz. Akademi kayıt defterinde kartı yoktur.»

Fiili vitrin şeridi ise Anayasa B6’da hâlâ yazılıdır (aşağıda).

### 2.2 Kart kaldırıldığında `/academy` üzerinde Junior kodu kalır mı?

**Sayfa yüzeyi için: Hayır — iki nokta temizlenince Junior kalıntısı kalmaz.**

| Dosya | Aksiyon |
|-------|---------|
| `app/academy/page.tsx` | `JuniorCrossSellBanner` import + JSX satırını sil |
| `components/academy/junior-cross-sell.tsx` | Dosyayı sil (tek tüketicisi `/academy` page) |

**Kapsam dışı (bu kartla ilgili değil; `/academy` vitrininden bağımsız):**

- Shell’in Junior ders yolunda header nav kullanması (`components/shell/header-bar.tsx`, `app-shell-switch.tsx`) — yalnız `/junior/*` path’lerinde
- Sitemap / SEO / legal Junior sayfaları — kendi dikeyleri
- `lib/academy/curricula/phase2-drafts/parent_teacher_ai/planned.ts` içindeki “Junior açılmaz” yorumu — ürün cross-sell değil

**Doküman uyumsuzluğu (tedavi aşamasında):**  
`.system_docs/ANAYASA.md` **B6** şu cümleyi taşır:

> «Yetişkin Akademi vitrinindeki kurslar durur; altında Junior tanıtım şeridi vardır.»

CEO kararıyla kart kalkınca bu cümle Anayasa’dan da çıkarılmalı / güncellenmelidir; aksi halde kod–anayasa sapması oluşur.

### 2.3 Ters yön (Junior → Akademi)

`components/junior/*` altında `/academy` cross-sell / reklam yüzeyi taramada **bulunamadı**. Junior tarafı zaten Akademi vitrinine reklam basmıyor.

---

## Özet tablo

| Soru | Cevap |
|------|--------|
| Kart nerede? | `components/academy/junior-cross-sell.tsx` → `JuniorCrossSellBanner` |
| Kim basıyor? | Yalnız `app/academy/page.tsx` |
| Layout kırılır mı? | Hayır |
| Sol menü bağımlı mı? | Hayır — `INDEPENDENT_ROOMS` |
| `/academy`’de başka Junior UI var mı? | Hayır |
| Anayasa dokunulmalı mı? | Evet — B6 “tanıtım şeridi” cümlesi |

---

## ADIM 3 — Beyin Fırtınası ve Stratejik Sorular

### SEN OLSAYDIN NE YAPARDIN?

İlk adım olarak `/academy` sayfasından `JuniorCrossSellBanner` import ve JSX’ini kaldırır, ardından `components/academy/junior-cross-sell.tsx` dosyasını silerdim. Aynı turda `.system_docs/ANAYASA.md` B6’daki “Junior tanıtım şeridi” cümlesini, Junior’un müstakil oda olduğunu ve geçişin yalnız sol menü / doğrudan `/junior` üzerinden olduğunu söyleyecek şekilde güncellerdim. Görsel doğrulamayı `localhost:3000/academy` üzerinde CourseList → FAQ akışının boşluksuz kaldığına bakarak kapatırdım.

### BİR SONRAKİ AŞAMA

Somut kod adımı (sıralı):

1. `app/academy/page.tsx`: `JuniorCrossSellBanner` importunu ve `<JuniorCrossSellBanner />` satırını sil.
2. `components/academy/junior-cross-sell.tsx` dosyasını sil.
3. Repo genelinde `JuniorCrossSell` / `junior-cross-sell` / `data-junior-cross-sell` grep ile sıfır referans doğrula.
4. `.system_docs/ANAYASA.md` B6’daki tanıtım şeridi ifadesini karara uygun güncelle (kod–anayasa hizası).
5. (Opsiyonel) `lib/dronlar/kayit.ts` yorumundaki “Akademi kayıt defterinde kartı yoktur” ifadesinin artık vitrin şeridiyle de tutarlı olduğunu kısa commit notunda belirt.

### PLATFORM KURGUSU VE MİMARİ EVALÜASYONU

**Evet — dikeylerin kendi sayfalarında birbirinin reklamını yapmaması, canlı mimariye uygundur.**

Canlı ad (Anayasa B1): **Pragmatik Monolit + `@yetkin/kernel` + Tek Native İstemci (`apps/rail-is`)**. «Amiral Gemi + Shared Kernel» bu yapının eski takma adıdır; ayrı dağıtım veya ayrı uygulama değildir.

Gerekçe:

- Junior zaten `INDEPENDENT_ROOMS` altında müstakil odadır; Panel / Akademi / Kariyer vitrininin dördüncü kartı değildir (ANAYASA B2 / B6, MANIFESTO).
- Kernel dikey motor import etmez; odalar kayıt defteri + bayrak + route öneki ile yaşar.
- Sayfa içi cross-sell, “müstakil oda” ilkesini ürün yüzeyinde zayıflatır: Akademi vitrini Junior’u kendi alt bandı gibi sunar.
- Geçişin sol menüde kalması, Shared Kernel / monolit paylaşımını (auth, ödeme hook, shell) bozmadan **yüzey bağımsızlığını** güçlendirir.

Not: Bugünkü Anayasa B6 hâlâ şeridi kabul eder; SUPER_ADMIN kararıyla kaldırma, B6 metninin de güncellenmesini gerektirir — ilke zaten “Junior Akademi’nin iç kanalı değildir” diyordu; şerit o ilkeyle gerilim yaratıyordu.

### GELECEK MASTER PLANI

**İlke:** Modüller arası keşif geçişi yalnız ana navigasyon (sol menü / `DRON_KAYIT` + `INDEPENDENT_ROOMS`) ve doğrudan URL üzerinden yapılır. Dikey vitrin sayfaları (`/academy`, `/junior`, `/career`, …) başka dikeyi reklam kartı, banner veya “şimdi dene” şeridi ile satmaz.

**Master Plan (öneri):**

| Katman | Kural |
|--------|--------|
| **Yüzey** | Her oda sayfası yalnız kendi katalog / continue / FAQ / legal içeriğini basar. Cross-sell bileşen klasörü açılmaz (`*-cross-sell*`). |
| **Navigasyon** | Oda görünürlüğü tek SSOT: `lib/dronlar/kayit.ts`. Yeni oda = kayıt + bayrak + route; başka odanın JSX’ine kart eklenmez. |
| **Doküman** | ANAYASA / MANIFESTO’da “oda A’da oda B tanıtım şeridi” cümleleri yasaklanır; istisna yalnız CEO + SUPER_ADMIN yazılı kararı + Anayasa güncellemesi ile. |
| **Kapı** | Junior kapısı `junior-gate` / `DRON_JUNIOR_ROOM_OPEN` ile; Akademi satış kapısı kendi mühürleriyle — kapılar birbirinin vitrinine gömülmez. |
| **Denetim** | PR checklist: `grep` ile `/academy` ağacında `junior` UI import’u = 0 (yorum/anayasa referansı hariç). Ters yön: `/junior` ağacında `/academy` reklam = 0. |
| **İstisna yüzeyi** | Platform geneli (dashboard özet, pazarlama landing, SEO sitemap) oda dışı keşif alanı olabilir; oda içi vitrin değildir. |

Bu plan, monolit gövdeyi ve `@yetkin/kernel` paylaşımını korurken ürün dikeylerini görsel ve rota olarak %100 bağımsız bırakır.

---

## SUPER_ADMIN’e bildirim

Tespit tamamlandı. Junior tanıtım kartı **`components/academy/junior-cross-sell.tsx`** içindeki **`JuniorCrossSellBanner`** bileşenidir; tek kullanımı **`app/academy/page.tsx`**tir. Kaldırma layout kırığı doğurmaz; sol menü Junior girişi kayıt defterinden bağımsız yaşar. Sonraki aşama: import/JSX silme + dosya silme + ANAYASA B6 şerit cümlesinin güncellenmesi.

Bu rapor yalnız tespittir; kod değişikliği uygulanmamıştır. Tedavi için onay beklenir.
