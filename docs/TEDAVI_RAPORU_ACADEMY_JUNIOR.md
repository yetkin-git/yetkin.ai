# TEDAVİ RAPORU — Academy / Junior Yüzey Ayrıştırma

**Tarih:** 2026-10-18  
**Karar sahibi:** CEO + SUPER_ADMIN  
**Kaynak:** `docs/TESPIT_RAPORU_ACADEMY_JUNIOR.md` (onaylı)  
**Durum:** Tedavi tamamlandı. Akademi vitrini Junior cross-sell’den arındırıldı; Anayasa B6 senkronize edildi.

---

## ADIM 1 — `/academy` Yüzeyinden Junior Kartının Kaldırılması

### Yapılanlar

| Aksiyon | Sonuç |
|---------|--------|
| `app/academy/page.tsx` — `JuniorCrossSellBanner` import silindi | Tamam |
| `app/academy/page.tsx` — `<JuniorCrossSellBanner />` JSX silindi | Tamam |
| `components/academy/junior-cross-sell.tsx` dosya silindi | Tamam (`DELETED_OK`) |
| Sayfa yorumuna müstakil-oda notu eklendi | Tamam |

### Render sırası (sonraki)

1. `JsonLd`
2. `CourseList` (kurs vitrini + resume şeridi + legal footer slot)
3. `LandingFaq`

### Görsel doğrulama (`http://localhost:3000/academy`)

**Sonuç: Pürüzsüz.** CourseList ile LandingFaq arasında Junior şeridi yok; boşluk/kayma/kırılma gözlenmedi.

Kanıt (tarayıcı erişilebilirlik anlık görüntüsü):

- Sayfa başlığı: «Yapay zeka eğitimi ve online kurslar · yetkin.ai»
- Bölge sırası: kurs kataloğu → yasal şerit → «Sık sorulanlar» (LandingFaq)
- Sayfa gövdesinde «Yetkin Junior» / «Junior Derslerini İncele» metni **yok**
- Sol menüde Junior odası (`Junior 5–8. Sınıf ortaokul`) **korunuyor** — beklenen davranış

`RoomFrame` `space-y-3` kabuğu tek çocuk silinince boşluğu otomatik kapatır; ekstra “delik” oluşmaz.

---

## ADIM 2 — Kod ↔ Anayasa Senkronizasyonu (B6)

### Dosya

`.system_docs/ANAYASA.md` — madde **B6 · Kapı**

### Silinen ifade

> Yetişkin Akademi vitrinindeki kurslar durur; altında Junior tanıtım şeridi vardır.

### Yerine yazılan kural

> Junior müstakil bir odadır; Yetişkin Akademi vitrininde tanıtım şeridi taşımaz. Modüller arası geçiş yalnızca ana navigasyon (sol menü) ve doğrudan `/junior` rotası üzerinden sağlanır.

Kod yüzeyi ile Anayasa artık aynı kuralı söylüyor.

---

## ADIM 3 — Sıfır Referans ve Derleme Doğrulaması

### Grep

| Terim | `*.{ts,tsx,js,jsx,mjs}` | Not |
|-------|-------------------------|-----|
| `JuniorCrossSell` | **0 eşleşme** | Temiz |
| `junior-cross-sell` | **0 eşleşme** | Temiz |
| `data-junior-cross-sell` | **0 eşleşme** | Temiz |

`docs/TESPIT_RAPORU_ACADEMY_JUNIOR.md` içinde tarihsel anlatım olarak geçen eşleşmeler bilinçli olarak bırakıldı (tespit arşivi). Canlı ürün kodunda kalıntı yok.

### Lint / TypeScript

| Kontrol | Sonuç |
|---------|--------|
| `eslint app/academy/page.tsx --max-warnings 0` | **Geçti** (exit 0) |
| `tsc --noEmit -p tsconfig.json` | Bu tedaviyle **ilgisiz** 2 hata: `scripts/bake-junior-pilot-tts.ts` (satır 774, 786) — `1 \| 0.94` → `0.94 \| undefined` tipi. Academy/Junior yüzey ayrıştırmasından önce de vardı; bu PR kapsamında değil. |

---

## Değişen dosya özeti

| Dosya | Değişiklik |
|-------|------------|
| `app/academy/page.tsx` | Import + JSX kaldırıldı; müstakil-oda yorumu |
| `components/academy/junior-cross-sell.tsx` | **Silindi** |
| `.system_docs/ANAYASA.md` | B6 Kapı cümlesi güncellendi |
| `docs/TEDAVI_RAPORU_ACADEMY_JUNIOR.md` | Bu rapor |

---

## ADIM 4 — Ajan Görüşü ve Stratejik Sorular

### SEN OLSAYDIN NE YAPARDIN?

İlk adım: sol menü (`lib/dronlar/kayit.ts` → `INDEPENDENT_ROOMS` / `VERTICAL_ROOMS`) için tek bir **oda geçiş sözleşmesi** yazmak — her dikey yalnız kendi `path`’inden açılır; başka oda vitrinine cross-sell bileşeni eklemek lint/verify kapısında kırılır. Böylece navigasyon hiyerarşisi “tek kapı = sol menü” kuralına kod seviyesinde kilitlenir; soft doküman kuralı yetmez.

### BİR SONRAKİ AŞAMA

Somut adım: repo genelinde **ters yön** denetimi — `/junior` (ve Junior bileşenleri) içinde Akademi vitrin/cross-sell, yetişkin kurs CTA veya Akademi katalog import’u var mı? Varsa aynı izolasyon ilkesiyle temizle. Paralel: B6’daki yeni cümleyi `verify` veya doküman hizası script’ine bağlamak (Anayasa ↔ kod sapması tekrarlanmasın).

### PLATFORM KURGUSU VE MİMARİ EVALÜASYONU

**Kısmen evet — yüzey bağımsızlığı hedefe yaklaştı; mimari hedef tam değil.**

Canlı ad: **Pragmatik Monolit + `@yetkin/kernel` + Tek Native İstemci (`apps/rail-is`)**. Bu temizlikle Akademi ve Junior **vitrin yüzeyi** olarak ayrıldı; Shared Kernel (kimlik, kasa, kapı, sicil) ortak kalmaya devam ediyor — bu doğru. Hedef seviye “oda vitrininde yabancı dikey şeridi yok” için **evet**. Hedef “dikeyler birbirinin UI/import sınırını aşamaz” için hâlâ kayıt defteri + lint/verify disiplini gerekir; tek banner silmek monolit içinde modül sınırını otomatik garanti etmez.

### GELECEK MASTER PLANI

1. **Oda izolasyon kuralı (SSOT):** Yeni dikey (Kariyer, Freelancer, …) yalnız `lib/dronlar/kayit.ts` + kendi `app/<oda>/` ağacında yaşar. Başka odanın `page.tsx` içine tanıtım şeridi / cross-sell **yasak**; Anayasa B2/B6 diline yazılır.
2. **Kapı + bayrak:** Her dikey kendi `*Gate` / `DronBayrakları` kilidine sahip olur; vitrin açılışı bayraksız “kart koy” ile yapılmaz.
3. **Verify kapısı:** `grep`/AST taraması — `components/<oda-A>` içinde `oda-B` path veya cross-sell import’u fail-closed.
4. **Navigasyon tek kanal:** Modüller arası keşif yalnız sol menü (ve doğrudan rota). Sayfa-içi “diğer odaya git” bandı ürün özelliği değil, anti-pattern.
5. **Kernel paylaşımı bilinçli:** Kimlik, para, pasaport, auth redirect `@yetkin/kernel`’da kalır; katalog, pedagoji mühürü ve vitrin kopyası dikeye özel kalır.
6. **Açılış checklist’i:** Yeni oda = kayıt + bayrak + hop sicili + B-katmanı madde + vitrin izolasyon testi. İmza: SUPER_ADMIN + CEO.

---

## SUPER_ADMIN özeti

Tedavi kapandı.

- `/academy` artık yalnız yetişkin kurs vitrini + FAQ.
- Junior’a geçiş: sol menü veya `/junior`.
- Anayasa B6 güncel.
- Canlı kodda `JuniorCrossSell` / `junior-cross-sell` kalıntısı yok.
- Rapor: `docs/TEDAVI_RAPORU_ACADEMY_JUNIOR.md`
