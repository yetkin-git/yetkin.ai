# Yetkin.ai — Faz 1 Genel Kontrol, SEO ve Yayın Öncesi Tespit Raporu

| Alan | Değer |
|---|---|
| Tarih | 12 Ekim 2026 |
| Kapsam | Çalışma kökü `d:\yetkin.ai`: Next.js 16 uygulaması (`app/`, `lib/`, `components/`, `prisma/`, `scripts/`), `packages/` (`kernel`, `junior-content`), canlı site `https://yetkin.ai`, CDN `https://cdn.yetkin.ai`, Cloudflare R2 |
| Mod | Salt okunur denetim. Kod, konfigürasyon, veritabanı ve R2 içeriği değiştirilmedi. Tek yazım bu rapor dosyası. |
| Git durumu | Çalışma dizini git deposu değil; yayındaki commit ile yerel kod eşlenemedi. |

**Etiketler**

- Önem: **P0** yayın engeli (güvenlik, veri, yayın bütünlüğü). **P1** yayın öncesi önerilir ya da yayından sonra ilk 2 hafta. **P2** iyileştirme ve temizlik.
- Kanıt: **V** doğrulandı (komut, HTTP ya da dosya çıktısı). **I** çıkarım (kanıttan türetildi, ayrıca doğrulanmadı). **NV** doğrulanmadı (erişim yok ya da kapsam dışı).

---

## 0. Yönetici özeti

**Karar: Yayına hazır değil (NO-GO).** Aşağıdaki P0 maddeler kapanmadan canlıya çıkış önerilmez.

| # | P0 bulgu | Kanıt |
|---|---|---|
| P0-1 | **Kilitli Junior sesleri herkese açık.** 70/111 ses `private/junior/audio/` altında, 74/111 ses `media/junior/audio/` altında anonim olarak `200` dönüyor. Kilitli bir ders (`jr_06_mat-7`) `https://cdn.yetkin.ai/media/junior/audio/jr_06_mat-7.mp3` ile açılıyor. | V |
| P0-2 | **Eski numaralı ders dosyaları yayında.** Yerelde 31 eski ses ve 31 eski kapak var; dört örnekte (`jr_06_mat-1`, `jr_06_mat-2`, `jr_06_fen-3`, `jr_06_ing_main-12`) R2'den anonim erişim sağlanıyor. | V |
| P0-3 | **Ses ve kapak senkronu bozuk.** 37 aktif dersin sesi R2'de yok (katalogda var, yerelde mühürlü); 18 ses eski sürümde (ücretsiz ders `jr_06_mat-14` dahil); kapaklar 74/111. | V |
| P0-4 | **Edge önbelleği eski içerik sunuyor.** Ön izleme dersi `jr_06_mat-5` ve eski `jr_06_mat-1` önbellekte; `Cache-Control` `immutable` ve bir yıl. | V |
| P0-5 | **Yayındaki site bu çalışma kopyasıyla eşleşmiyor.** Junior sayfalarının başlığı, açıklaması, JSON-LD'si, sitemap'i ve robots kuralı koddan farklı. Nedeni NV. | V |
| P0-6 | **Build ve CI kırmızı.** `tsc` 21 hata (7 dosya), ESLint 3 hata, 6 başarısız test (5 dosya). `next build` çalıştırılmadı; tip hataları nedeniyle başarısız olması beklenir. | V / I |
| P0-7 | **Çocuk sesi üçüncü tarafa gidiyor.** "Dinle ve anlat" sesi Gemini'ye gönderiliyor; dokümanlar bunu açıkça yazmıyor. Veli rızası ve KVKK değerlendirmesi karar gerektiriyor. | V |
| P0-8 | **Yönetişim çelişkisi.** MANIFESTO Kural 1 (Faz 1'de yeni oda yok, çift imza) ile Junior'un açılışı çelişiyor; tarihli karar kaydı yok. | V |
| P0-9 | **Üretim ortam değişkenleri doğrulanmadı.** Vercel erişimi yok. Özellikle `NEXT_PUBLIC_MEDIA_BASE_URL`, `SUPER_ADMIN_USER_ID`, `JUNIOR_INVOICE_SEAL_KEY`, `RATE_LIMIT_REDIS_REST_*`, `PAYTR_WEBHOOK_IP_ALLOWLIST`. | NV |

**Yayın öncesi zorunlu sıra:** (1) CDN'de kilitli içeriği kapat ve edge önbelleğini temizle; (2) R2'yi hash doğrulamalı olarak yeniden senkronize et ve gate'i GET + özet + negatif testlerle güçlendir; (3) build ve CI'ı yeşile çevir; (4) yayındaki sürümü commit ile eşleştirip yeniden dağıt; (5) SEO ve gate testlerini canlıya karşı çalıştır.

---

## 1. Junior modülü ve sağlık

### 1.1 Doğrulama sonuçları

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| `npm run verify:junior-content` | OK | V |
| `npm run verify:junior-speech` | OK ("111 yayın dersi fırına hazır"). Bu betik R2 varlığını kontrol etmez. | V |
| `npm run verify:junior-audio-manifest -- --check` | OK | V |
| `npm run verify:junior-audio-cdn` (`--cdn`; prebuild ve CI'da değil) | **FAIL**: 37 × 404, 18 × boyut uyuşmazlığı, 56 × OK | V |
| `npm run verify:prebuild` zinciri | PASS | V |
| `tests/kernel/junior-*` | 6 başarısız test, 5 dosya (bkz. 1.4) | V |

**Önemli sınırlama (V):** `scripts/verify-junior-audio-manifest.ts:175` CDN kontrolünü yalnızca `media/` yolunda, HEAD isteğiyle yapıyor. `private/` yolu hiç denetlenmiyor; HEAD da edge önbelleğini değil origin'i ölçüyor. Bu nedenle P0-1 ve P0-4 gate tarafından yakalanmadı.

### 1.2 Ses ve kapak envanteri

| Metrik | Değer | Kanıt |
|---|---|---|
| Manifestteki yayın dersi | 111 (`lib/junior/audio-manifest.generated.ts`) | V |
| Yerel `public/media/junior/audio` dosyası | 143 = 111 manifest + 31 eski `jr_06_*` + `bgm-light-learning.mp3` | V |
| Yerel kapak dosyası | 111 manifest + 31 eski | V |
| CDN `media/junior/audio`: 200 / 404 | 74 / 37 | V |
| CDN `private/junior/audio`: 200 / 404 | 70 / 41 (41'in 4'ü yalnız public yolda var) | V |
| İki yolda da var / yalnız public / yalnız private / hiçbirinde | 70 / 4 / 0 / 37 | V |
| CDN `media/junior/covers`: 200 / 404 | 74 / 37 | V |
| Isınma videoları (`media/junior/warmup`) | 5 / 5 × 200 | V |
| Sahne (scenes) | 14 MP4 referansı ve 43 JPG plaka; CDN'de 404, Vercel paketinde yok | V |

#### 1.2.1 Eksik 37 ses ve kapak (P0)

- Anahtarlar: `jr_06_mat-26` … `jr_06_mat-38` (13), `jr_06_fen-21` … `jr_06_fen-38` (18), `jr_06_sosyal-21` … `jr_06_sosyal-26` (6).
- Bu anahtarlar aktif katalogda: `packages/junior-content/calendar/jr_06_mat.json` (13 kayıt), `jr_06_fen.json` (18), `jr_06_sosyal.json` (6). Konu ve quiz JSON'ları ile `lib/junior/content/{mat,fen,sosyal}/*.ts` ve `lib/junior/quiz/*` da bu anahtarları içeriyor (V).
- Yerelde mühürlü ses ve kapak var ve manifeste girmiş; R2'ye yüklenmemiş. Hem public hem private yolda 404 (V).
- Etki: Kullanıcı bu derslerden birine girdiğinde ses ve kapak yüklenmez (I). Oynatıcının ses yokken davranışı NV.

#### 1.2.2 Eski sürüm 18 ses (P0)

- Anahtarlar: `jr_06_mat-6, -7, -11, -12, -13, -14, -15, -17, -18, -19, -21, -22`; `jr_06_ing_main-2, -4, -6, -9, -10, -11`.
- R2 nesneleri 9 Ekim 2026 02:21–02:23 GMT aralığında yüklenmiş (`jr_06_mat-7` için `Last-Modified: Fri, 09 Oct 2026 02:22:59 GMT`, V). Yerel mühürlü dosyaların son yazılma zamanı 11 Ekim 2026 17:02–19:33 UTC (V). Bu yerel değişiklikler R2'ye aktarılmamış (I).
- CDN dosyası mühürden 1.29–1.65 kat büyük (V). SHA-256 de eşleşmiyor: `jr_06_mat-7` yerel `5a791e…d8d` (manifestle aynı), CDN `38e8fa…5dfe5d` (V).
- Ücretsiz ders `jr_06_mat-14` bu listede: CDN 17,389,485 bayt, mühür 11,667,885 bayt (V). Ücretsiz dersin sesi yanlış sürüm.

#### 1.2.3 Edge önbellek sapması (P0)

- `jr_06_mat-5` (ön izleme dersi, `juniorLessonMediaIsPublicPreview` true): edge 17,411,565 bayt (HIT); origin 12,010,605 bayt, mühürle aynı boyutta. Origin'in içerik hash'i doğrulanmadı (NV). Edge eski sürüm sunuyor (V).
- `jr_06_mat-1` (eski, manifest dışı): GET yanıtı `cf-cache-status: HIT`, `Age: 183972` sn (yaklaşık 51 saat), `Last-Modified` 9 Ekim. Önbelleği atlayan (`?cb=`) istek 11,193,645 bayt ve ETag'i yerel dosyanın MD5'iyle eşleşiyor (V). Yani origin güncel, edge eski.
- `Cache-Control: public, max-age=31536000, immutable` (V). Aynı anahtar üzerine yazıldığında purge yapılmazsa içerik bir yıl eski kalabilir (I).
- Ölçüm sorunu (V): HEAD istekleri Cloudflare'de `DYNAMIC` (origin'den), GET istekleri `HIT` (edge'den) dönebiliyor. HEAD tabanlı gate edge'deki eski GET içeriğini göremez.

#### 1.2.4 Eski numaralı kalıntılar ve sızıntı (P0)

- Yerelde 31 eski ses: `jr_06_mat-1, -2, -3, -4, -8, -9, -10, -16, -20, -23, -24, -25`; `jr_06_fen-3, -4, -5, -6, -7, -8, -11, -13, -14, -15, -17`; `jr_06_ing_main-12, -13, -14, -15, -18, -19`; `jr_06_sosyal-14, -19`. Ayrıca `bgm-light-learning.mp3` ve 31 eski kapak (V).
- Dört örnekte R2 durumu (V):

| Anahtar | Ses (public) | Ses (private) | Kapak (public) | Kapak (private) |
|---|---|---|---|---|
| `jr_06_mat-1` | 200 | 404 | 200 | 404 |
| `jr_06_mat-2` | 200 | 200 | 200 | 200 |
| `jr_06_fen-3` | 200 | 200 | 200 | 200 |
| `jr_06_ing_main-12` | 200 | 200 | 200 | 200 |

- Bu 31 anahtarın hiçbiri ses manifestosunda, takvim JSON'larında ya da `lib/junior/content` ve `quiz` altında yok (V); bunların bir kısmı test fikstürlerinde geçiyor (V). R2'de duruşları yalnız yukarıdaki dört örnekte ölçüldü; 31'in tamamı için ölçüm yapılmadı (NV). Sync betiklerinde silme çağrısı bulunmadığı için (V: `scripts/` altında `DeleteObject`/`--delete`/`prune` aranmadı, sonuç boş) eski nesneler birikmiş olabilir (I).
- `jr_06_mat-1` artık ön izleme değil (`jr_06_mat` açılışı kodda hariç tutulmuş, V). Yine de herkese açık (V).

#### 1.2.5 Oynatıcı, navigasyon ve kilitli ders davranışı

- Erişim modeli (kod niyeti, V): ücretsiz dersler `/media/junior/…`; kilitli dersler `private/junior/…` önekinde ve 600 saniyelik imzalı URL ile (`lib/junior/media-grant.ts`). Açık `private/` önek, bu modeli baypas ediyor (P0-1).
- `jr_06_mat-7` kodda ön izleme değil (`juniorLessonMediaIsPublicPreview` false; I), yani kilitli. Yine de `/media/junior/audio/` altında 200 dönüyor (V).
- `lib/junior/media-visibility.ts`: ön izleme kümesi ücretsiz anahtar, `jr_06_mat-5`, arşivlenmemiş açılışlar ve `jr_<kurs>-1` (mat hariç) ile tanımlanıyor (V).
- Sahne plakası (`components/junior/player/scene-plate.tsx`): `onError` ile görsel ya da videodan düşüş sessiz; kırık medya kullanıcıya ya da izlemeye görünmüyor (V kod; I etki).
- Isınma (`lib/junior/warmup.ts`): kurs başına 5 video. PEDAGOJI Ek-J "kart başına ısınma" diyor (V). Elektif derslerde ısınma yok (V, dosya yorumu).
- `lib/junior/lesson-nav.ts`: bu turda ayrıntılı okunmadı (NV). Kilitli ders yönlendirmesi için ayrı test önerilir.
- Oynatıcı lint sorunları: `components/junior/player/use-junior-playback.ts:16` kullanılmayan import; `:309` `exhaustive-deps` uyarısı (V).

#### 1.2.6 Çocuk sesi akışı (P0: hukuk ve gizlilik)

- Akış (V): `app/api/junior-pilot/tell/route.ts` → `lib/junior/service.ts` (`submitJuniorTell`). Ses base64 olarak istekte geliyor; `invokeLlm({ provider: "gemini", … inlineMedia })` ile Gemini'ye gönderiliyor; `finally` bloğunda `wipeAudioCarrier` ile bellekten siliniyor.
- Veritabanında ses sütunu yok (V: `prisma/schema/junior.prisma`). Veli rızası için `junior_guardian_consents` tablosu var (V).
- Model rolü: `JUNIOR_TELL_ROLE = "FAST_STREAM"` → `gemini-3.8-live` (canlı sohbet modeli) (V: `lib/junior/tell.ts`, `lib/kernel/ai/model-roles.ts`).
- Doküman: PEDAGOJI Ek-J "Çocuğun sesi saklanmaz… değerlendirme bitince ses silinir" diyor (V). Üçüncü tarafa işlenmesi dokümanda yok (V).
- Bellekten silme "saklamama" anlamına gelir, "aktarmama" anlamına gelmez. KVKK, yurt dışı aktarım, çocuk verisi ve açık rıza değerlendirmesi gerekir (I). Bu hukuki görüş değildir.
- Route: `audioBase64` en fazla 1.200.000 karakter, `maxDuration = 30` (V).

#### 1.2.7 Yaş penceresi (tutarsızlık)

- Kod: `juniorBirthYearBounds` → `min: yıl − 18`, `max: yıl − 9` (yaş 9–18) (`lib/junior/limits.ts:173–176`, V).
- Doküman: 10–18 (V). Canlı arayüz: "Junior 10-18 Yaş" (V). Karar D5.

### 1.3 Ürün ve veri tutarlılığı

- Ücretsiz ders tanımı üç yerde farklı (bkz. 5.2).
- `lib/junior/micro-progress.ts` başlığı "defter ve ses oraya yazılmaz" diyor, ama `window.localStorage` kullanıyor (satır 32, V). Test yasak listesi de `localStorage` içeriyor (`tests/kernel/junior-faz2-pilot.test.ts:456`, V). Karar D9.
- Çift içerik kaynağı (TS + JSON) kayıyor: 37 dersin JSON ve TS karşılığı var, medyası yok (V). `jr_06_alm-1` TS elektif kataloğunda (`lib/junior/elective-catalog.ts:130`), JSON'da yok ve ses/kapak manifestlerinde yok (V).

### 1.4 Testler

| Dosya | Sorun | Kanıt |
|---|---|---|
| `tests/kernel/junior-checkout.test.ts` | Katalogda olmayan eski anahtar fikstürleri | V |
| `tests/kernel/junior-elective-seal-gate.test.ts` (137–139) | `juniorPlanCoversLesson("jr_06_alm-2")`, anahtar katalogda yok | V |
| `tests/kernel/junior-faz2-pilot.test.ts` (456) | Yasak kelimeler `localStorage` içeriyor; kod kullanıyor | V |
| `tests/kernel/junior-faz3-media-play.test.ts` (88–122) | `jr_06_mat-2` (eski) | V |
| `tests/kernel/junior-ing-quiz-archive.test.ts` (19) | 8 bekliyor, 14 var | V |

Sonuç: 6 başarısız test, 5 dosya (V). Testler CDN ve R2 yetki yolunu çalıştırmıyor; sızıntı testlerle yakalanmadı (I).

---

## 2. SEO ve metadata

### 2.1 Canlı tarama (V; 12 Ekim 2026)

| URL | HTTP | `<title>` | Açıklama | Canonical | `og:url` | robots | JSON-LD tipleri | Sitemap |
|---|---|---|---|---|---|---|---|---|
| `https://yetkin.ai/` | 308 → `/academy` | — | — | — | — | — | — | — |
| `/junior` | 200 | `Yetkin Junior · yetkin.ai` | 256 karakter; ana sayfa metni | yok | yok | `noindex, nofollow` | ImageObject, Organization, PostalAddress, WebSite | yok |
| `/junior/ders/jr_06_mat-14` (kodda ücretsiz) | 200 | aynı | aynı | yok | yok | `noindex, nofollow` | aynı 4 tip; Course ve FAQ yok | yok |
| `/junior/ders/jr_06_alm-1` (JSON'da yok) | 200 | aynı | aynı | yok | yok | `noindex, nofollow` | aynı | yok |
| `/robots.txt` | 200 | — | — | — | — | — | — | `Sitemap:` satırı var; Junior kuralı yok; `/junior/checkout` yok |
| `/sitemap.xml` | 200 | — | — | — | — | — | — | 18 `<loc>`, 0 Junior URL |

Ek gözlemler (V):

- `/junior/ders/jr_06_alm-1` H1 "Günün selamı"; breadcrumb ham anahtarı gösteriyor ("jr 06 alm 1").
- `/junior` açıklaması, kodda `PAGE_SEO.junior.description` (yaklaşık 135 karakter, `lib/copy/seo.ts:112–113`) yerine ana sayfa metnini taşıyor.

### 2.2 Kod sözleşmesi ile canlı arasındaki farklar (P0: dağıtım sapması)

| Konu | Kodda beklenen | Canlıda gözlenen | Kod referansı |
|---|---|---|---|
| Landing başlığı | `6. Sınıf Online Dersler \| yetkin.ai Junior` | `Yetkin Junior · yetkin.ai` | `lib/copy/seo.ts:110–111`, `app/junior/page.tsx:25` |
| Landing açıklaması | "6. sınıf Matematik, Fen, Türkçe, İngilizce ve Sosyal Bilgiler…" | Ana sayfa metni | `lib/copy/seo.ts:112–113` |
| Landing JSON-LD | Course + FAQPage (`juniorLandingJsonLd`) | Course ve FAQPage yok | `lib/junior/seo.ts` (≈ 99–107) |
| Ücretsiz ders robots | `index: true, follow: true` | `noindex, nofollow` | `lib/junior/seo.ts:95` |
| Ücretsiz ders JSON-LD | Course + FAQPage (`juniorPublicLessonJsonLd`) | Yok | `lib/junior/seo.ts` (≈ 110–124) |
| Ders sayfası başlığı | `juniorLessonSeoTitle` ya da ders başlığı | Genel başlık | `lib/junior/seo.ts` (≈ 80–97) |
| Sitemap Junior girdileri | Ücretsiz ders kartları | 0 | `app/sitemap.ts:95–100`, `130–150` |
| robots `/junior/checkout` | Disallow | Kural yok | `lib/copy/seo.ts:178` |

Yorum (I): Canlı sürüm bu çalışma kopyasından eski, ya da farklı bir dal ya da ortamda. Kesin neden NV; Vercel dağıtım geçmişi ve commit karşılaştırması gerekir. Güvenlik düzeltmelerinin de canlıda olup olmadığı bu yüzden belirsiz (I). `noindex` bilinçli bir yayın kapısı olabilir (D1); ancak sitemap ve JSON-LD yokluğu koddan sapma (I).

### 2.3 Sitemap ve robots kapsamı

- Kod ücretsiz ders kümesini `juniorSitemapFreeLessonKeys()` ile üretiyor: `jr_<kurs>-1` açılışları (pilot ve elektif, mat hariç) ile `jr_06_mat-14` (`app/sitemap.ts:95–100`). `jr_06_mat-5` (ön izleme) bu kümede yok (V). Sonuç: ön izleme dersi sitemap'te eksik.
- Elektif açılışları `jr_06_alm-1`, `jr_06_fra-1`, `jr_06_kod-1`, `jr_06_siyer-1` sitemap'e giriyor. Bunlar TS elektif kataloğunda var (`lib/junior/elective-catalog.ts` 130, 177, 223, 274), ancak JSON'da ve ses/kapak manifestlerinde yok (V). Yayına alınırsa medyasız ders sayfaları indekslenir (I).
- Robots: `ROBOTS_DISALLOW_PATHS` içinde `/junior/checkout` var (`lib/copy/seo.ts:178`, V); canlı robots.txt'de yok (V). Checkout sayfası zaten `noindex` (`app/junior/checkout/page.tsx:20`, V); robots kuralı da tutarlı olmalı (I).

### 2.4 JSON-LD ve zengin sonuçlar

- Kod Course ve FAQPage üretiyor (V); canlı Junior sayfalarında yok (V).
- Landing'de `isAccessibleForFree: false` var ama fiyat teklifi (`Offer`) yok. Fiyat, `PriceCatalogEntry.amountMinor` ile hizalanmalı (I). Fiyat metni ile yapılandırılmış veri arasında uyumsuzluk riski var.
- `lib/copy/json-ld.ts` ve `serializeJsonLd` mevcut (V). Yayın öncesi Rich Results Test ile doğrulanmalı (öneri).

### 2.5 Başlık, açıklama, canonical

- Canlı Junior sayfalarında canonical yok (V). Kod `pageMetadata()` ile canonical üretmeyi tasarlamış (V); canlıda uygulanmamış (sürüm farkı, I).
- Tüm ders sayfaları aynı başlık ve açıklamayı taşıyor (V). Kod ders başlığı üretiyor (`juniorLessonPageMetadata`), canlıda değil.
- Açıklama uzunluğu: canlı 256 karakter (V). Kodda ders açıklamaları `juniorSeoDescription` ile 180 karakter sınırında (V).
- `og:title`, `og:description`, `og:image` ve `twitter:*` var (V); `og:url` yok (V).

### 2.6 Dinamik render ve tarama bütçesi

- Kök layout `await connection()` ile istek başına nonce üretiyor; sayfalar dinamik (V). Önbelleklenmiş HTML yok; TTFB ve tarama bütçesi riski var (I). Pazarlama ve ders sayfaları için statik ya da ISR değerlendirmesi önerilir (öneri).

### 2.7 SEO kapanış listesi

1. Dağıtım sapmasını kapat: canlı commit'i yerel kodla eşle, yeniden dağıt (P0).
2. Indexleme kararı (D1): P0'lar kapanana kadar `noindex`; sonra landing ve ücretsiz dersler `index, follow`.
3. Ders başına benzersiz `<title>` ve açıklama; indekslenebilir her sayfada canonical.
4. Sitemap: yalnızca ücretsiz ve medyası olan dersler; `jr_06_mat-5` eklensin; `alm`, `fra`, `kod`, `siyer` açılışları çıksın (D4 ile birlikte).
5. robots: `/junior/checkout` Disallow; kilitli ders sayfaları `noindex`.
6. JSON-LD: landing için Course + Offer (fiyat SSOT'tan); ücretsiz ders için Course + FAQ; Rich Results testi.
7. Breadcrumb ham anahtar yerine insan okunur başlık (`lib/junior/human-titles.ts` mevcut, V).

---

## 3. Canlı ortam: Supabase, env, Vercel, R2/CDN

### 3.1 Supabase ve RLS

- Statik kontrol (`npm run verify:rls-status`): 38 tablo, FORCE RLS sicili ve migration işaretleri OK (V).
- Canlı veritabanına bağlanılmadı (NV). Önerilen salt okunur sorgular:

```sql
select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
order by c.relname;

select id, public from storage.buckets;

select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

- Beklenen: `public` şemasındaki tüm tablolarda RLS açık; depolama kovaları özel (ses kovası dahil, bkz. 3.4).

### 3.2 Ortam dosyaları ve değişkenler

- `.env.example`: 74 anahtar satırı; küme `lib/kernel/env.ts` şemasıyla birebir aynı (V). `.env.local`: 51 aktif anahtar satırı, 39'u dolu, 12'si boş (V).
- Kod (`lib`, `app`, `components`, `scripts`, `middleware`, `packages`, `tests`, `instrumentation.ts`) 58 benzersiz `process.env.*` adı okuyor (V). Bunlardan 14'ü `.env.example` içinde yok (V): çatı ve test çalışma zamanı (`NEXT_RUNTIME`, `VITEST`); test ve E2E (`E2E_CASH_SANDBOX`, `E2E_CASH_CLIENT_BEARER`, `E2E_CASH_FREELANCER_BEARER`, `PW_CHANNEL`, `RESEND_API_KEY` yalnız `tests/kernel/citizen-notice.test.ts:100` adın tanımsız olduğunu doğrular); ops betikleri (`T3_COURSE_SLUG`, `RAIL_PG_LAB_URL`, `RAIL_PG_INTEGRATION`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `GOOGLE_API_KEY` yedek okuma, `ACADEMY_SEAL_DROP_MISSING`).
- Sayılar `rg` ve birebir küme karşılaştırmasıyla doğrulandı (V).
- Değerler okunmadı. Yalnızca anahtar adları ve boş/dolu durumu kullanıldı.

Kritik üretim değişkenleri:

| Değişken | Neden | Yerel durum (V) | Yayın kararı |
|---|---|---|---|
| `NEXT_PUBLIC_MEDIA_BASE_URL` | Ücretsiz ses, kapak ve ısınma yolları | Atanmış, değer boş | `https://cdn.yetkin.ai` (I); Vercel'de NV |
| `SUPER_ADMIN_USER_ID` | Üretimde boşsa kimse admin değil (fail-closed, `lib/kernel/auth/super-admin.ts`) | Atanmış (değer gizli) | Vercel'de NV |
| `JUNIOR_INVOICE_SEAL_KEY` | Fatura alanları mühürlenir; yoksa hata (`lib/junior/invoice-seal.ts`) | Tanımsız | Üretimde zorunlu (NV) |
| `RATE_LIMIT_REDIS_REST_URL` ve `_TOKEN` | Dağıtık hız sınırı; ikisi de boşsa süreç-içi bellek; kısmi tanım fail-closed | Tanımsız | Üretimde ikisi birlikte zorunlu (I) |
| `PAYTR_WEBHOOK_IP_ALLOWLIST` | Boşsa webhook yalnız HMAC ile doğrulanır (`lib/kernel/payments/paytr/webhook.ts`) | Atanmış, değer boş (V) | Karar D8 |
| `PAYTR_SANDBOX` | `0` canlı PayTR demektir | `0` | Yerelde `1` (P1, bkz. 3.2.1) |
| `PAYTR_ALLOW_MOCK_CHECKOUT` | Üretimde yasak (kodda hata fırlatır) | Boş | Üretimde boş (V) |
| `TRUSTED_PROXY_HOPS` | İstemci IP çözümü | `1` | Cloudflare arkasında `2` (I; NV) |
| `JUNIOR_CHECKOUT_OPEN` | Junior ödeme kapısı | `1` | Karar D3 ile birlikte |
| `DRON_JUNIOR_ROOM_OPEN` / `DRON_JUNIOR_OPEN` | Oda kapısı / profil masası | Tanımsız | Karar D3 |
| `SITE_MAINTENANCE_FREEZE` / `MAINTENANCE_BYPASS_SECRET` | Acil bakım bayrağı ve atlatma sırrı | Tanımsız | NV |
| `GEMINI_API_KEY` | Junior ses akışı ve tüm Gemini rolleri | Atanmış, değer gizli (V) | Üretimde zorunlu (NV) |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | Sağlayıcı adaptörleri kayıtlı (`lib/kernel/ai/llm-gateway.ts`) | Atanmış, değer boş (V) | Kullanılmıyorsa tanımlanmamalı (I) |
| `INNGEST_DEV` | Yerel geliştirme modu | `1` | Üretimde bulut anahtarları NV |
| `RESEND_API_KEY` | Üretim kodunda okunmuyor; yalnız `tests/kernel/citizen-notice.test.ts:100` adın tanımsız olduğunu doğrular (V) | Atanmış (V) | Yerel dosyadan kaldır (P2) |
| `VERCEL_OIDC_TOKEN` | Vercel'in kısa ömürlü belirteci | Atanmış | Yerel dosyadan kaldır (P2) |
| `E2E_T3_PASSWORD`, `E2E_T4_WORKER_PASSWORD` | Test şifreleri | `E2E_T3_PASSWORD` atanmış; `E2E_T4_WORKER_PASSWORD` boş (V) | Yalnız CI gizlisi (P2) |

#### 3.2.1 Yerel dosya riski (P1)

`.env.local` içinde `PAYTR_SANDBOX` değeri `0` (V) ve PayTR merchant anahtarı adları tanımlı (V). Yerel geliştirme canlı ödeme sistemine istek atabilir (I). Öneri: yerelde `PAYTR_SANDBOX=1` ve sandbox kimlik bilgileri; canlı kimlikler yalnız Vercel'de.

### 3.3 Vercel build ve CI

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| `npx tsc --noEmit -p tsconfig.json` (`npm run typecheck` ayrıca `prisma generate` çalıştırır; bu denetimde yalnız tsc koştu, çıkış kodu 2; ham çıktı `%TEMP%\yetkin_tsc_audit.txt`) | **21 hata, 7 dosya** | V |
| ESLint (`npm run lint`; `.tmp/` ve `media-bake/` hariç kapsamlı koşu) | **3 hata, 1 uyarı** | V |
| `vitest run` | **6 başarısız test, 5 dosya** | V |
| `npm run build` | Çalıştırılmadı (NV). `next.config.ts` içinde `ignoreBuildErrors` yok; tip hataları build'i durdurur (I) | V / I |
| CI `amiral` işi | lint, verify:prebuild, typecheck, test (`.github/workflows/ci.yml`); mevcut hatalarla kırmızı (I) | V / I |

tsc hataları, dosya bazında:

- `lib/junior/scenario.ts` (1): satır 326 TS2352 dönüşümü. (Satır 2'deki kullanılmayan `JUNIOR_HINT_BOX` bir ESLint bulgusudur, aşağıda.)
- `lib/junior/media-grant.ts` (2): satır 112 TS2345; satır 136 TS2322 (`ProcessEnv` ya da `R2MediaEnv` tipi).
- `lib/junior/activity-rail.ts` (1): satır 45 TS2322 (isteğe bağlı `id` ve `label`).
- `components/junior/activity-hub.tsx` (6): satır 51, 57, 78, 79, 86, 96 TS18048 (`undefined`).
- `scripts/verify-junior-speech.ts` (6): satır 138, 145, 146, 166, 193, 194.
- `scripts/neutralize-junior-covers.ts` (4): satır 167, 171, 172 (172'de iki hata) TS18048.
- `scripts/archive/repair-office-ai-05-silence-hole.ts` (1): satır 14, eksik JSON `lesson-audio-timings/01_office_ai-5.json`.

ESLint hataları:

- `components/junior/player/use-junior-playback.ts:16`: kullanılmayan `JuniorPlayerTimeline`.
- `lib/junior/scenario.ts:2`: kullanılmayan `JUNIOR_HINT_BOX`.
- `components/junior/topic-quiz.tsx:163`: render içinde `questionIndex += 1` (react-hooks immutability).

Uyarı: `components/junior/player/use-junior-playback.ts:309` (`exhaustive-deps`).

Kapsam notları (V): `eslint.config.mjs` `scripts/**`, `apps/**` ve `archived/**` dizinlerini global olarak dışlıyor; `.tmp/` ve `media-bake/` dışlanmıyor. `tsconfig` ise `scripts/**` ve `tests/**` dosyalarını dahil ediyor; typecheck, lint'in görmediği script hatalarını yakalıyor. `vercel.json`: `regions: ["fra1"]`.

### 3.4 Cloudflare R2 ve `cdn.yetkin.ai` uyumluluğu

#### 3.4.1 Ölçüm özeti (V)

| Ölçüm | Sonuç |
|---|---|
| Public ses (`/media/junior/audio/`) | 74 × 200, 37 × 404 |
| Private ses (`/private/junior/audio/`) | 70 × 200, 41 × 404 |
| İki yolda da var / yalnız public / yalnız private / hiçbirinde | 70 / 4 / 0 / 37 |
| Public kapak (`/media/junior/covers/`) | 74 × 200, 37 × 404 |
| Isınma (5 video) | 5 × 200 |
| Manifest boyutu ↔ origin (public) | 56 eşit, 18 farklı, 37 yok |
| Edge ↔ manifest | 1 sapma (`jr_06_mat-5`) |
| Eski 18 sesin boyut oranı (CDN / mühür) | 1.29–1.65 |

Kilitli içerik sızıntısı: 70 manifest sesi `private/` yolunda anonim erişilebilir. `media/` yolunda ise 74 ses erişilebilir; yalnız public yolda olan 4 ses muhtemelen ücretsiz ya da ön izleme derslerdir (I; doğrulanmadı). Kilitli `jr_06_mat-7` public yolda 200 dönüyor (V).

#### 3.4.2 Kök neden çıkarımı (I)

1. Aynı domain iki önekten de sunuyor (V). Önek adı yetki sağlamıyor. Bucket yapısı NV; tek bucket varsayımı (I).
2. Sync betiklerinde silme çağrısı yok (V). Eski nesneler birikiyor (V: dört örnekte eski anahtar hâlâ erişilebilir; 31'in tamamı NV).
3. Yayın sonrası edge purge yapılmıyor; `immutable` ile aynı anahtar güncellenince eski kalıyor (V: `jr_06_mat-5`, `jr_06_mat-1`).
4. Yükleme sonrası içerik doğrulaması yok; gate yalnız public yolda, HEAD ile ve origin'den ölçüyor (V).
5. Yerel dosyaların son yazılma zamanından (11 Ekim) sonra R2'ye yükleme yapılmamış (V zaman damgaları; neden I).

#### 3.4.3 Hedef mimari (öneri)

- `cdn.yetkin.ai` yalnız `media/` (ücretsiz ve kamu) önekini sunsun. `private/` ayrı bir kovada, custom domain'siz; erişim yalnız kısa ömürlü imzalı URL ile (I).
- Acil önlem: Cloudflare kuralı ile `/private/*` ve kilitli anahtarların `media/` yolu için 403 ya da 404 (öneri; uygulanmadı).
- Varlık adlarında içerik özeti (`jr_06_mat-7.<sha8>.mp3`) ya da sürüm; `immutable` yalnız özetli adlarda.
- Yükleme betiği: her nesne için SHA-256 metadatası; yükleme sonrası GET tabanlı doğrulama (Range ya da tam); purge; ardından gate.
- Negatif testler: kilitli anahtarlar iki yolda 403 ya da 404; ücretsiz anahtarlar 200 ve özet eşleşmesi; nightly CI.
- Eski anahtarlar: yedek al, sonra sil (D7).

### 3.5 Hız sınırı, webhook ve sağlayıcılar

- Hız sınırı (V kod): Redis REST URL ve token birlikte tanımlıysa paylaşılan depo; kısmi tanım fail-closed; ikisi de boşsa süreç-içi bellek (`lib/kernel/security/rate-limit-runtime.ts`). Üretimde Redis tanımlı değilse çoklu örnekte limit etkisizleşir (I). `RATE_LIMIT_REDIS_REST_URL` ve `_TOKEN` `.env.example`'da boş satırlar olarak belgeli (V).
- PayTR webhook (V kod): `PAYTR_WEBHOOK_IP_ALLOWLIST` boşsa yalnız HMAC; doluysa resmi CIDR ve operatör listesi. HMAC ana kontrol; IP kısıtı ikinci savunma hattı (I).
- AI sağlayıcıları (V kod): `llm-gateway.ts` OpenAI ve Anthropic adaptörlerini kaydediyor. Junior yolu `provider: "gemini"` ile sabit (V). Ek sağlayıcıların hangi rollerde kullanılabileceği NV. Çocuk verisinin yalnız Gemini'ye gitmesi için rol kilidi önerilir (I).

---

## 4. Atıl, geçici ve kopya dosyalar

| # | Konum | Durum (kanıt) | Öneri | Öncelik |
|---|---|---|---|---|
| 1 | `docs/Yeni klasör/` | 42 öğe; 3 PNG ekran görüntüsü ve rapor kopyaları (ör. `ICERIK_KALITE_RAPORU.md` 76.560 B, `IC_MEDYA_ABC_ANALIZI.md` 34.260 B, `JUNIOR_UX_TESPIT_RAPORU.md` 22.416 B) (V) | Arşive taşı ya da sil; yayın dalında olmasın | P2 |
| 2 | `docs/archive/` | 9 dosya; model adlı kopyalar (`01_Tespit_Raporu_Grok 4.7.md`, `03_Tespit_Raporu_Haiku 5.5.md`, `05_Tespit_Raporu_Sonnet 5.5.md` vb.) (V) | Tek arşiv ve kısa indeks; boşluklu adları düzelt | P2 |
| 3 | `docs/TEDAVI_RAPORU.md` | `docs/archive/*Tedavi*` ile kopya olabilir (I) | Birleştir | P2 |
| 4 | `.gitignore` satır 80: `docs/curriculum/` | Klasör yok (V) | Satırı kaldır | P2 |
| 5 | `.gitignore` satır 69: `/media-bake/` | ESLint'te dışlanmıyor (V) | Kaldır ya da ESLint'e ekle | P2 |
| 6 | `.tmp/` (kök) | Mevcut (V); içeriği incelenmedi (NV). ESLint'te dışlanmıyor (V) | ESLint ignore'a ekle; içerik temizliği | P2 |
| 7 | `scripts/archive/repair-office-ai-05-silence-hole.ts` | Eksik JSON; TS hatası (V) | Arşivden çıkar | P2 |
| 8 | `tests/studio/` (11 dosya) | 9 dosya var olmayan `lib/studio` içe aktarıyor (V) | Sil ya da dışla | P2 |
| 9 | `tests/kernel/junior-*.test.ts` eski fikstürler | 5 dosya, 6 başarısız test (V) | Fikstürleri katalogla hizala | P1 |
| 10 | Eski numaralı ses ve kapaklar (31 + 31) ve `bgm-light-learning.mp3` | Yerelde (V); R2'de dört örnekte erişilebilir (V), tamamı için ölçüm yok (NV) | Yedek al, kaldır (D7) | P0 |
| 11 | `public/media/junior/scenes/` | 43 JPG, 14 TXT (V); 14 MP4 referansı karşılıksız (V) | TXT dosyalarını public'ten kaldır (içerik NV); sahne kararı (D6) | P1 |
| 12 | `lib/junior/scene-media.ts` ve sahne bileşeni | Kırık medyada sessiz düşüş (V) | D6 sonrası sadeleştir | P1 |
| 13 | `lib/junior/micro-progress.ts` | `localStorage` kullanıyor, test yasaklıyor (V) | D9 | P1 |
| 14 | `.env.local`: `RESEND_API_KEY`, `VERCEL_OIDC_TOKEN`, E2E şifreleri | Gereksiz, geçici ya da test sırları (V) | Yerelden kaldır; CI gizlisine taşı | P2 |
| 15 | `%TEMP%\yetkin_*.txt` (çalışma alanı dışı) | Bu denetimin ara çıktıları (V) | Silinebilir | P2 |

Taranmayan alanlar: `node_modules/`, `.next/`, `.tmp/` (yalnızca üst düzey liste; içerik taranmadı), `temp/`, `tmp/`, `archived/`, `yetkin_muze/`, `.cursor/`, `.git/`.

---

## 5. "Sen olsaydın ne yapardın?" — eleştirel değerlendirme

### 5.1 Genel değerlendirme

**Güçlü yanlar (V):**

- Fail-closed model rolleri (`lib/kernel/ai/model-roles.ts`) ve üretim güvenlik kapıları (PayTR mock yasağı, super admin fail-closed).
- Tutarlı kayıt: `amountMinor` tek kaynak (ANAYASA A1), IDOR mühürleri (`verify:idor-seals`, 6 dosya ve 19 test), RLS sicili (38 tablo), API yetki doğrulaması (72 route), gizli anahtar taraması.
- Çocuk verisi için bellekten silme ve veritabanında ses sütunu olmaması.
- `verify:prebuild` zinciri geniş.

**Zayıf yanlar:**

- Dokümanlar ile kod sık ayrışıyor (5.2). Dokümanlar anayasal tonda, ama çoğu iddia otomatik kontrol edilmiyor (I).
- İçerik tek kaynak değil: TS, JSON, medya ve manifest birbirinden kopuyor (P0-3, 1.3).
- Yayın bütünlüğü için kapı yok. CDN, R2 ve edge doğrulaması deploy hattına bağlı değil; kırmızı CI deploy'u engellemiyor (I).
- Yönetişim kararı yazılı değil (P0-8).
- Metafor yükü: "Amiral Gemi" ve "Sürü Dron" eski ad. Canonical ad ANAYASA B1'de değişmiş; kod ve klasörlerde (`lib/dronlar/`) eski adlar sürüyor (V).

### 5.2 Doküman ↔ kod ↔ canlı uyumsuzluk tablosu

| Dosya | İddia | Kod ve canlı gerçeği | Karar ya da öneri |
|---|---|---|---|
| ANAYASA B6, PEDAGOJI Ek-J, `lib/copy/seo.ts:113` | "Her dersin ilk konusu ücretsizdir" | Kodda: tek ders (`jr_06_mat-14`), ING açılışı (`jr_06_ing_main-20`), `jr_06_mat-5` ön izleme, kurs açılışları (mat hariç) (V) | D4: tek tanım seç, üç yeri hizala |
| ANAYASA B6 | "Sol menüde Junior herkese açıktır" | MANIFESTO Kural 1 ile çelişiyor; canlıda Junior sayfaları `noindex` (V) | D3: tarihli karar kaydı |
| ANAYASA B2 | 3 oda tanımı | MANIFESTO: Junior "Motor 4" (V) | Oda sayısını tek belgede, tarihli yaz |
| MANIFESTO Kural 1 | "Faz 1'de yeni oda açılmaz (CEO + Super Admin çift imza)" | Junior açılışı için imza kaydı yok (V) | D3 |
| PEDAGOJI Ek-J | "kart başına ısınma" | `lib/junior/warmup.ts`: kurs başına 5 video; elektiflerde yok (V) | Dokümanı ya da kodu düzelt |
| PEDAGOJI Ek-J | "atanmış SVG sahne" | 43 JPG plaka ve 14 MP4 (karşılıksız) (V) | D6 |
| PEDAGOJI Ek-J | "en az üç doğrulanmış soru" | `JUNIOR_QUIZ_MIN_ITEMS = 3` (`lib/junior/limits.ts:147`, V) | Uyumlu |
| PEDAGOJI Ek-J | "Çocuğun sesi saklanmaz… değerlendirme bitince ses silinir" | Bellekte tutulur, `finally` ile silinir; ama Gemini'ye gönderilir (V) | Gizlilik metnine üçüncü taraf işlemesi eklenmeli; D2 |
| PEDAGOJI §B | `ACADEMY_EXAM_PASS_SCORE` `production-standard.ts` içinde | Tanım `lib/academy/exam.ts:9` (V) | Dokümanı düzelt |
| PEDAGOJI | Yaş 10–18 | Kod 9–18 (`lib/junior/limits.ts:173–176`); canlı arayüz 10–18 (V) | D5 |
| AKADEMI_URETIM_ANAYASASI §2.1 | "Junior kapak … 105 konu kapağı" | Manifest 111 (V) | 111'e güncelle |
| `.env.example` yorumu (satır 5) | Servis rolü anahtarı "Rail kodunda yoktur" | `lib/academy/academy-sealed-storage.ts` servis anahtarını kullanıyor (V) | Kapsamı netleştir: "Rail" native istemci mi, Next sunucusu mu |
| `lib/junior/micro-progress.ts` başlığı | "defter ve ses oraya yazılmaz" | `window.localStorage` (satır 32, V) | D9 |
| Model kimlikleri (AKADEMI §2.1) | Gemini rol tablosu | `lib/kernel/ai/model-roles.ts` ile uyumlu (V) | Uyumlu |

Not: Canlıda `/` → `/academy` (308) yönlendirmesi kasıtlı mı, geçici mi bilinmiyor (NV).

### 5.3 Mimari eleştirisi (Amiral Gemi + Sürü Dron, Shared Kernel, API-first)

- **Doğru yön:** Pragmatik monolit, tek ekip ve tek deploy için uygun (I). API sözleşme artefaktları (`verify:v1-contract-artifacts`) ve tek native istemci (`apps/rail-is`) API-first disiplinini destekliyor (V).
- **İsim yükü:** "Amiral Gemi" ve "Sürü Dron" metaforları eski ad (V). Yeni ekip üyeleri için ad karmaşası var. Öneri: isim yerine modül sınırları (`lib/<alan>`) ve bağımlılık kuralları (ESLint boundaries ya da dependency-cruiser) (I).
- **İki çekirdek:** `lib/kernel/` (Next gövdesi, V) ve `packages/kernel` (`@yetkin/kernel`, V). Sahiplik ve sınır net değil (I). Öneri: gerçek paket olarak ayır ya da birleştir.
- **Çift içerik kaynağı:** TS kaynak, JSON paketi ve manifest; P0-3 ve `alm-1` kayması bunun sonucu (V). Öneri: tek kaynak (TS), JSON'un derleme artefaktı olması, içerik özeti manifesti (I).
- **Ölçek:** Süreç-içi hız sınırı varsayılanı, dinamik render ve tek medya alanı; çoklu örnek ve trafik artışında riskler (I).
- **Mikro uygulamalar:** Yeni alan açmadan önce mevcut kapılar (kimlik, rıza, IDOR, sızıntı testleri) yeni alana da uygulanabilen bir şablon gerekir (I).

### 5.4 "Ben olsaydım" — öncelik sırası

1. Yayın bütünlüğü: CDN politikası, R2 senkronu, özet doğrulaması, purge; kilitli içeriğin ayrılması.
2. Yayın kapıları: gate (GET, özet, negatif test) nightly ve deploy öncesi; kırmızı CI ile deploy yok.
3. Tek içerik kaynağı ve otomatik üretilen artefaktlar.
4. Yönetişim kararını tarihli kayda bağla (MANIFESTO ve ANAYASA güncellemesi).
5. Çocuk verisi: sesi üçüncü tarafa göndermeyen tasarım tercih edilir; mümkün değilse açık veli rızası, DPIA ve gizlilik metni.
6. Dokümanları "doküman-test eşlemesi" ile bağla: her ilke bir betiğe ya da teste karşılık gelsin.

---

## 6. Gelecek master planı

### Faz 0: Yayın engelleri (0–2 hafta)

| İş | Bitiş ölçütü | Öncelik |
|---|---|---|
| CDN'de `private/` ve kilitli `media/` anahtarlarını kapat (Cloudflare kuralı); negatif testler | İki yolda kilitli anahtarlar 403 ya da 404; test CI'da | P0 |
| Edge purge (`jr_06_mat-5`, `jr_06_mat-1` ve 18 eski anahtar) | Purge sonrası GET ile manifest boyutu ve özet eşleşmesi | P0 |
| R2 senkronu: 37 eksik ses ve kapak, 18 eski ses; özet doğrulaması | 111/111 ses ve kapak, iki yolda, özet eşleşmesi | P0 |
| Eski 31 + 31 anahtar: yedek, sonra kaldır (D7) | Liste boş; fikstürler güncel | P0 |
| `tsc` 21, ESLint 3 ve test 6 hatasını kapat | `npm run typecheck`, `npm run lint`, `npm run test` yeşil | P0 |
| Canlı commit eşleme ve yeniden dağıtım | Canlı `/junior` başlığı ve JSON-LD koddakiyle eşleşir | P0 |
| Üretim env kontrol listesi (bölüm 3.2) | Her zorunlu değişken Vercel'de doğrulandı ve kayıt altında | P0 |
| Çocuk sesi: D2 kararı, gizlilik metni, veli rızası akışı | Karar kaydı; metin güncellendi | P0 |
| Yönetişim kararı (D3) | Tarihli karar kaydı | P0 |

### Faz 1: Yayın ve ilk 30 gün

| İş | Bitiş ölçütü |
|---|---|
| Landing ve ücretsiz dersler için indexleme (D1 sonrası) | `index, follow`; canonical; sitemap temiz |
| Ders başına başlık ve açıklama | Her ders benzersiz başlık |
| JSON-LD: landing Course + Offer; ücretsiz ders Course + FAQ | Rich Results testi hatasız |
| Sitemap: yalnız ücretsiz ve medyası olan dersler | Sitemap'te 404 yok |
| İzleme: 404 ses ve kapak uyarısı; sahne düşüşü telemetrisi | Uyarı kuralları çalışıyor |
| Hız sınırı: Redis REST üretimde; Cloudflare WAF kuralı | Çoklu örnekte limit testi |
| PayTR webhook IP allowlist (D8) | Üretimde tanımlı |

### Faz 2: 30–90 gün, Junior stabilizasyonu ve SEO büyümesi

- Test fikstürlerini ve içerik kaynağını tek kaynağa bağla.
- Ders analitiği için yalnız toplu ve kimliksiz metrikler (çocuk verisi minimizasyonu).
- Kurs açılışlarını ve elektif içeriğini ya tamamla ya kaldır (D4).
- Pazarlama ve ders sayfaları için ISR ya da statik üretim değerlendirmesi.

### Faz 3: 3–6 ay, 7–8. sınıf genişlemesi

- İçerik hattı: TS kaynak → JSON artefakt → medya üretimi → özet manifesti → R2 yükleme → gate.
- Sınıf başına ayrı manifest ve kova öneki; kalite ve maliyet bütçesi (ses, görsel, video).
- Yaş aralığı ve veri politikası 7–8. sınıf için yeniden değerlendirilmeli (D5 yeniden).
- Kapasite: sınıf başına yaklaşık 100 ders varsayımıyla depolama ve CDN maliyeti hesabı (I).

### Faz 4: 6–12 ay, mikro uygulamalar ve yapay zekâ öğrenme analitiği

- Mikro uygulamalar: tek amaçlı modüller; kimlik, rıza ve IDOR kapılarını miras alır (I).
- Öğrenme analitiği: veli onaylı, toplu ve açıklanabilir göstergeler (konu ustalığı, hata kümeleri); çocuk profili yok; model kararları izlenebilir (I). Hukuki inceleme ön koşul.
- Değerlendirme seti: öğretmen onaylı örneklerle model değerlendirmesi; sürüm bazlı karşılaştırma.

### KPI önerileri (öneri; hedefler teklif)

| KPI | Hedef (öneri) | Ölçüm |
|---|---|---|
| Kilitli anahtara anonim erişim | 0 | Negatif HTTP testleri (iki yol) |
| Manifest ↔ R2 eşleşmesi (ses ve kapak) | 111/111, özet eşleşmeli | Nightly gate (GET ve özet) |
| Edge'de eski içerik | 0 | Purge sonrası GET doğrulaması |
| `tsc` / ESLint / test hatası | 0 / 0 / 0 | CI |
| Ücretsiz ders indexlenmesi | Tüm ücretsiz dersler `index, follow` | Search Console kapsamı |
| Sitemap 404 oranı | 0 | Sitemap tarama kontrolü |
| LCP (mobil, p75) | ≤ 2.5 sn (öneri) | RUM ya da Lighthouse |
| Çocuk sesi kalıcılığı | 0 kayıt | Veritabanı ve log denetimi |
| Veli rızası kapsamı | %100 (çocuk hesapları) | Veritabanı sorgusu |
| P0 kapanma süresi | ≤ 48 saat | Olay kaydı |

### Karar listesi (kullanıcı kararı gerekir)

| # | Konu | Seçenekler | Öneri |
|---|---|---|---|
| D1 | Junior indexleme zamanlaması | (a) P0'lar kapanana kadar `noindex`, sonra landing ve ücretsiz dersler `index`; (b) hemen `index` | (a) |
| D2 | Çocuk sesi işleme | (a) Gemini'ye ses, veli rızası, DPIA, gizlilik metni; (b) cihaz içi konuşmadan metne, sunucuya yalnız metin | (b); mümkün değilse (a) hukuki onayla |
| D3 | Junior oda açılışı yönetişimi | (a) Tarihli karar kaydıyla istisna (CEO ve Super Admin); (b) açılışı ertele | (a), kayıtla |
| D4 | Ücretsiz ders tanımı | (a) Her kursun ilk dersi (doküman) ve kodun genişlemesi; (b) tek ücretsiz ders, doküman güncellenir | Tek tanım; (b) daha düşük risk |
| D5 | Yaş aralığı | (a) 10–18 (doküman ve arayüz), kod 10'a çekilir; (b) 9–18 (kod) | (a) |
| D6 | Sahne varlıkları (14 MP4, 43 JPG) | (a) MVP'de sahneyi kaldır; (b) varlıkları üret ve yükle | (a) |
| D7 | Eski numaralı varlıklar (31 + 31 + bgm) | (a) Yedek al, kaldır; (b) tut | (a) |
| D8 | PayTR webhook IP allowlist | (a) Üretimde tanımla; (b) yalnız HMAC | (a) |
| D9 | `micro-progress.ts` depolama | (a) Sunucu tarafı tek kaynak; (b) cihaz içi `localStorage`, test ve doküman güncellenir | (a) |
| D10 | Dağıtık hız sınırı | (a) Redis REST üretimde; (b) yalnız Cloudflare WAF | İkisi: önce WAF, sonra Redis |

**Alınan kararlar (kullanıcı, 12 Ekim 2026):** D1 (a), D2 (b), D3 (a), D4 (b), D5 (a), D6 (a), D7 (a), D8 (a), D9 (a), D10 "önce WAF, sonra Redis". Tümü önerilen seçenekle alındı. Bu kararlar uygulanmadı; uygulama için ayrı onay gerekir.

---

## Ek A: Kanıt ve yeniden üretim

### A.1 CDN ölçümleri

Önbelleği atlayan HEAD (origin):

```powershell
Invoke-WebRequest -Uri "https://cdn.yetkin.ai/media/junior/audio/jr_06_mat-7.mp3?cb=$([guid]::NewGuid().ToString('N'))" -Method Head -UseBasicParsing
```

Edge boyutu (Range ile; `Content-Range` toplamı verir). PowerShell `-Headers @{Range=…}` çalışmadı; `curl.exe` kullanıldı:

```powershell
curl.exe -s -r 0-0 -D - -o NUL "https://cdn.yetkin.ai/media/junior/audio/jr_06_mat-5.mp3"
```

Kilitli anahtar, anonim erişim:

```powershell
curl.exe -sI "https://cdn.yetkin.ai/private/junior/audio/jr_06_mat-2.mp3"
```

### A.2 Kullanılan kontroller ve sonuçları

- `npm run verify:junior-speech`: OK, çıkış kodu 0 (V).
- `npm run verify:junior-audio-cdn`: FAIL (37 × 404, 18 × boyut, 56 × OK) (V).
- `npm run verify:prebuild`: PASS (önceki oturum) (V).
- `verify:rls-status`, `verify:idor-seals`, `verify:api-auth --check`, `verify:no-secrets`: OK (önceki oturum) (V).
- Canlı SEO taraması: `/`, `/junior`, `/junior/ders/jr_06_mat-14`, `/junior/ders/jr_06_alm-1`, `/robots.txt`, `/sitemap.xml` (V).
- Ortam: yalnız anahtar adları ve bayrak durumları; değerler okunmadı (V).
- Kod doğrulamaları: `scripts/verify-junior-audio-manifest.ts:175` (HEAD, yalnız `media/`); `scripts/` altında silme çağrısı yok (V).

### A.3 Çalıştırılmayan kontroller ve nedenleri

- `npm run build`: `apps/rail-is/src/generated/` ve diğer üretilen dosyaları değiştirebilir; denetim salt okunur kalsın diye çalıştırılmadı.
- `npm run lint` (tam): `.tmp/` ve `media-bake/` dizinlerini tarar; kapsam dışı.
- Canlı veritabanı: bağlantı yok; bölüm 3.1 sorguları önerildi.
- Vercel panosu: erişim yok (P0-9, NV).

---

## Ek B: Okunmayan alanlar ve sınırlar

- Okunmadı: `node_modules/`, `.next/`, `temp/`, `tmp/`, `archived/`, `yetkin_muze/`, `.cursor/`, `.git/`. `.tmp/` yalnızca üst düzeyde listelendi; içeriği okunmadı.
- `.env*`: yalnız anahtar adları ve bayrak durumları. Değerler okunmadı ve yazdırılmadı.
- `public/media/`: içerik okunmadı. İki dosya için SHA-256 hesaplandı; diğerleri için manifest ve dosya zaman damgası metadatası kullanıldı. CDN'den iki büyük dosya geçici olarak indirildi ve silindi.
- `lib/junior/lesson-nav.ts`: ayrıntılı okunmadı (NV).
- Canlı Supabase: sorgu yapılmadı (NV).
- Bu rapor hukuki görüş değildir. KVKK ve çocuk verisi kararları hukuk danışmanıyla verilmelidir.
