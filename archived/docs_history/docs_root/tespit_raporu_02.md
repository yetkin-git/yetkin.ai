# Tespit Raporu 02 — Dijital takip, performans, trafik

Tarih: 2026-10-31  
Kapsam: çalışma ağacındaki canlı ürün kodu ve aynı gün `https://yetkin.ai` üzerinden okunan kamu yanıtları (`/`, `/academy`, `/junior`, `/robots.txt`, `/sitemap.xml`, yanıt başlıkları, kamu DNS TXT).  
Vercel ortam paneli açılmadı. `NEXT_PUBLIC_GA_ID` üretim değeri panelden okunmadı; canlı HTML ve CSP, etiketin basılmadığını gösteriyor.  
Lighthouse, CrUX ve tarayıcıda piksel piksel mobil tur bu turda çalıştırılmadı. Core Web Vitals için laboratuvar skoru yazılmadı.  
`archived/`, `node_modules/`, `public/media/` taranmadı.

## Yöntem

- GA4 yükleyici: `components/kernel/ga4-bootstrap.tsx`, kimlik: `lib/kernel/telemetry/measurement-id.ts`, olaylar: `lib/kernel/telemetry/funnel.ts`, CSP kapısı: `lib/kernel/telemetry/csp.ts`.
- Arama yüzeyi: `app/robots.ts`, `app/sitemap.ts`, `lib/copy/seo.ts`, `app/layout.tsx`, Junior meta: `app/junior/layout.tsx`, `app/junior/page.tsx`, `lib/junior/seo.ts`.
- Birinci taraf huni (GA’dan ayrı): `lib/kernel/admin/funnel-constants.ts`, `lib/kernel/admin/funnel-load.ts`.
- Canlı doğrulama: 31 Ekim 2026, kök ve Akademi HTML’inde `googletagmanager` / `gtag(` yok. Akademi CSP `script-src` ve `connect-src` listesinde Google Analytics kökeni yok. Site haritasında 33 `<loc>`. DNS TXT’te iki `google-site-verification` kaydı var (jetonlar bu dosyaya yazılmadı).

## Özet

| Soru | Durum |
|---|---|
| GA4 kodu var mı? | Var. `G-` ölçüm kimliği geçerliyken kök kabuğa `gtag` basılır. |
| GA4 canlıda açık mı? | Hayır. Örnek env boş (`NEXT_PUBLIC_GA_ID=""`). Canlı HTML’de etiket yok. CSP, kimlik yokken Analytics kökenini açmıyor. |
| GTM | Kabul edilmez. `GTM-` kimliği `null` döner, etiket basılmaz. |
| Site haritası ve robots | Canlı. 33 kamu URL, hepsi `https://yetkin.ai`. Kök `Disallow: /` yok. |
| Search Console doğrulama | HTML meta yok. DNS TXT doğrulaması duruyor. Search Console arayüzünde mülkün bağlı olduğu bu turda görülmedi. |
| Huni olayları | Akademi kart/PayTR yolu kodda bağlı. Kimlik kapalı olduğu için canlıda hiçbir olay gitmiyor. Junior’da GA olayı yok. |
| noindex ile site kapanmış mı? | Hayır. `noindex` oturum, kasa, oynatıcı ve 404 için. Kamu katalog `index, follow`. |

---

## ADIM 1 — Analytics ve takip kodları

### 1. Google Analytics 4

Entegrasyon kök layout’ta. `Ga4Bootstrap` `app/layout.tsx` içinde, gövdenin sonunda. Script `afterInteractive`: ilk boyamayı bekletmemek için bilinçli.

Kimlik `NEXT_PUBLIC_GA_ID`. Biçim `G-` + 4–32 harf/rakam. Boş, boşluklu, `GTM-` veya enjeksiyon artığı kimlik sessizce düşer; sayfa 500 vermez, huni fonksiyonları no-op olur.

Canlı durum (bu turun ölçümü):

- `https://yetkin.ai/` ve `https://yetkin.ai/academy` kaynaklarında `googletagmanager` ve `gtag(` yok.
- Akademi yanıtının CSP’si: `script-src` içinde `https://www.paytr.com` var; `https://www.googletagmanager.com` yok. `connect-src` içinde `google-analytics.com` yok.
- Bu, kimlik boşken `ga4ScriptSrcExtra` / `ga4ConnectSrcExtra` fonksiyonlarının ürettiği davranışla örtüşür. Kimlik panelde dolu olsaydı CSP’ye bu kökenler eklenirdi ve HTML’de etiket görünürdü.

Sonuç: kod hazır, ölçüm kapalı. Çerez politikası ve gizlilik metni GA4’ü birinci taraf ölçüm olarak anlatıyor (`lib/copy/legal-launch.ts`). Metin, canlı etiketten önde.

Ayrı bir çerez bandı ve Consent Mode yok. Politika, pazarlama çerezi olmadığı için ayrı izin istemediğini yazıyor. Etiket kapalıyken bu bant zaten tetiklenmiyor. Kimlik açılırsa etiket, izin katmanı olmadan `gtag('config', id)` ile yüklenir.

### 2. Google Search Console

| Parça | Bulgu |
|---|---|
| `sitemap.xml` | `app/sitemap.ts`, `dynamic = "force-dynamic"`. Canlıda 33 adres. Kök, Akademi kataloğu, `/academy/ileri`, altı kurs antresi, kariyer, Junior, on bir ücretsiz Junior ders, doğrulama, vize, yasal, hakkımızda, iletişim. |
| `lastmod` | İstek anı değil. Sabit `SITE_CONTENT_REVISED_AT` = 2026-10-27. |
| `robots.txt` | `app/robots.ts` kamu Allow + sığınak Disallow basar. `Sitemap: https://yetkin.ai/sitemap.xml` duruyor. |
| HTML doğrulama meta | Yok. `google-site-verification` sayfa kaynağında yok. |
| DNS doğrulama | `yetkin.ai` TXT’te iki `google-site-verification` kaydı var. Mülk DNS ile doğrulanabilir. Panelde sitemap gönderiminin yapılıp yapılmadığı koddan görünmez. |

Canlı `robots.txt` uygulamanın kurallarından önce Cloudflare yönetimli bir blok taşıyor. O blok `User-agent: *` için `Allow: /` ve `Content-Signal: search=yes, ai-train=no` yazar. Ardından GPTBot, ClaudeBot, Google-Extended, Bytespider ve **GoogleOther** için `Disallow: /` gelir. Uygulamanın kendi `User-agent: *` ve `Googlebot` grubu bunun altında durur: kamu yollar Allow, `/dashboard`, `/admin`, `/login`, `/kasa`, `/api/`, oynatıcı ve çıkış paketi Disallow.

Google Arama dizini `Googlebot` ile yürür. `GoogleOther` ayrı bir Google istemcisidir; Cloudflare’in onu kapatması Arama’daki `Googlebot` iznini silmez. Yine de Google’ın arama dışı keşif ürünlerini daraltır. Bu kural depodaki `app/robots.ts` içinde yok; kenarda Cloudflare yönetiyor.

`LIVE_BROADCAST_SHUTDOWN` üretimde açıkken robots, yasal / iletişim / hakkımızda dışında her şeyi Disallow eder. Canlı robots bu kilitte değil: katalog Allow listesinde.

### 3. Etkinlik ve huni

Üründe sepet yok. Satın alma doğrudan kasa. `add_to_cart` olayı yok; karşılığı `begin_checkout`.

GA4 olay adları (`lib/kernel/telemetry/funnel.ts`):

| Olay | Nerede |
|---|---|
| `view_item` | Akademi kurs antresi, `AcademyViewItem` |
| `play_free_preview` | Akademi oynatıcı, ücretsiz önizleme |
| `begin_checkout` | Satın al düğmesi, antre CTA, oynatıcı kilit CTA |
| `paytr_iframe_loaded` | PayTR iframe yüklününce |
| `purchase` | Kasa dönüş paneli, başarı (`ok`) iken |

Kimlik yoksa bu çağrılar iz bırakmaz. Canlıda kimlik kapalı.

Huni tasarımının boşlukları (kimlik açılsa da durur):

1. **Sayfa görüntüleme tek belgeyle sınırlı.** `gtag('config')` bir kez basılır. App Router istemci geçişlerinde `page_view` gönderen bir `usePathname` dinleyicisi yok. Ziyaretçi ana sayfadan Akademi’ye, oradan kursa tıklarsa GA yalnızca ilk belgenin URL’sini görür. Hemen çıkma ve sayfa/oturum bu yüzden şişer.
2. **Cüzdan satışı GA `purchase` değildir.** Bakiye ile kapanan Akademi satın alması `emitSemConversion("purchase")` çağırır. Bu fonksiyon `dataLayer`’a düz nesne iter (`{ event: "purchase" }`). Bu biçim GTM içindir. Burada GTM yok; gtag kuyruğu `gtag("event", ...)` argüman dizisi bekler. Cüzdan satışı GA4’e düşmez. `purchase` olayı yalnız PayTR dönüş sayfasındaki `trackPurchase` ile gider ve o da tarayıcı kapanırsa kaçırılır. Tutar, dönüş sayfasında yoksa `sessionStorage` içindeki checkout hafızasından gelir; hafıza yoksa olay tutarsız kalır.
3. **Kayıt aynı kopuklukta.** `register-form` `emitSemConversion("register")` ile `sign_up` nesnesini dataLayer’a iter. gtag olayı değildir.
4. **Junior ölçülmüyor.** Junior oda, ders ve kasada `trackViewItem` / `trackBeginCheckout` / `trackPurchase` yok. Yıllık paket hunisi GA’ya bağlı değil.
5. **Sorgu dizisi olaylara yazılmaz.** Kampanya parametresi özel olayda yok. İlk belgenin otomatik `page_view`’u (etiket açıkken) URL’deki UTM’yi yine de görebilir; sonraki geçişler görmez.
6. **Düğme tıklaması genel bir olay değil.** Yalnız yukarıdaki huni noktaları var. Asistan, menü, yasal altbilgi, “ileri modüller” kapısı loglanmaz.

Birinci taraf yönetim hunisi GA’dan ayrı durur ve çalışması etikete bağlı değildir. Süper yönetici panosu günlük sayaç okur: `vitrine_visit`, `free_lesson`, `checkout_intent`, ardından iş tablolarından `settled_purchase`, kayıt, cüzdan, sınav, vize. Sayaç Akademi kataloğu, `/academy/ileri` ve kurs antresinde `recordFunnelDailyDocumentStep` ile yazılır. Kaynak, kampanya, cihaz ve hemen çıkma bu panoda yok. Junior bu sayaçlara yazılmıyor. Pazarlama sorusu (“nereden geldi, nerede çıktı”) bu pano ile cevaplanmaz. Satışın gerçekleşip gerçekleşmediği cevaplanır.

---

## ADIM 2 — Performans ve hız

Laboratuvar LCP / INP / CLS sayısı bu turda üretilmedi. Aşağıdaki maddeler kod ve canlı yanıt başlığından çıkan yük riskleridir.

### HTML önbelleği kapalı

Kök layout `connection()` çağırır. Amaç, CSP nonce’unu istek anında basmak. Yorum da aynı bedeli yazar: HTML `no-store`. Canlı Akademi başlığı bunu doğruluyor:

- `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`
- `Age: 0`

Her kamu HTML belgesi Frankfurt (`vercel.json` `regions: ["fra1"]`) kökenine iner. Statik gövde (ikon, avif/webp, mp3/mp4) `immutable` ve uzun ömürlü; HTML değil. Türkiye’den TTFB’nin tabanı bu tur. Edge’de HTML cache’i nonce ile birlikte duruyor.

### İlk boyama iskeleti

Akademi kataloğu akan yanıtta önce iskelet basıyor (`h-[40rem]` kart yer tutucuları), ardından asıl vitrin geliyor. Kapak `fetchpriority="high"`, AVIF/WebP `srcset` ve `sizes` ile geliyor. Bu kısım doğru. İskeletin uzun süre ekranda kalması, yavaş köken günlerinde LCP’yi kapak yerine boş bloğa kaydırır.

### Medya ve üçüncü parti script

- Gövde yazı tipi sistem yığını (`Segoe UI`, `system-ui`). `next/font` ve `@font-face` yok. Web font LCP’ye eklenmiyor.
- `next.config.ts` görselleri AVIF ve WebP, kalite 75, `minimumCacheTTL` bir yıl.
- Katalog kapağı responsive. Ders oynatıcısında video/ses `preload="auto"` (`lesson-media-player.tsx`, `lesson-visual-stage.tsx`, Junior pilot oynatıcı, ısınma kaseti). Oynatıcı açılınca tarayıcı medyayı önden çeker. Katalog sayfasının LCP’si bu dosyalara bağlı değil; ücretsiz ders URL’si bağlı.
- Örneklenen kamu sayfalarda üçüncü parti script: Cloudflare e-posta çözücü. GA yok. PayTR iframe yalnız kasada.

### Sunucu yanıtı

Bölge `fra1`. Sıkıştırma `compress: true`; canlıda Cloudflare Brotli/Gzip müzakere eder. `poweredByHeader: false`. Prisma ve medya, fonksiyon izinden kamu HTML’e taşınmasın diye iz dışına alınmış. Bu, TTFB için doğru yönde. Asıl tavan, önbelleksiz HTML.

### Mobil uyumluluk

Canlı kaynakta viewport `width=device-width, initial-scale=1`. Kabuk `lg` altında sabit rayı kapatıp menü düğmesi basıyor (`lg:hidden`). Dokunma hedeflerinde `min-h-11` / `min-w-11` kullanılıyor. Akademi CTA’ları dar ekranda `w-full` ile alt alta iniyor. Junior ve Akademi meta’sı mobil kırılma iddiası taşımıyor; SSS metni kursun mobil tarayıcıda açıldığını söylüyor.

Bu turda telefon görüntü alanı açılmadı. Kırık bir yerleşim kanıtı üretilmedi. Dar ekranda üst çubuk (geri, ileri, hesap) sıkışıktır; düğmeler 44px ve satır kaydırılabilir. Bunun “kullanıcıyı kaçıran kırık” olduğu ölçülmedi.

---

## ADIM 3 — SEO ve görünürlük

### Open Graph ve meta

Ortak üretici `pageMetadata`: başlık, açıklama, `canonical` (`https://yetkin.ai` + yol), `og:locale=tr_TR`, `og:url`, `og:image`, Twitter `summary_large_image`. Kök kabuk sayfa kanoniği taşımaz; çocuklar miras alıp Search Console’da “alternatif sayfa” üretmesin diye.

Canlı doğrulanan yüzeyler:

| URL | Başlık | Canonical | OG görseli |
|---|---|---|---|
| `/` | Yapay Zekâyı Öğren. Gerçek İşlerinde Kullan. · yetkin.ai | `https://yetkin.ai` | `/opengraph-image` (1200×630) |
| `/academy` | Akademi eğitim kataloğu · yetkin.ai | `https://yetkin.ai/academy` | aynı plaka |
| `/junior` | 6. Sınıf Online Dersler \| yetkin.ai Junior | `https://yetkin.ai/junior` | `/junior/opengraph-image` |

Kök `robots` meta: `index, follow`. Ana sayfada FAQ JSON-LD var. Organizasyon + WebSite grafiği kökte. Junior iniş `Course` + `FAQPage` basar. Ücretsiz ders sayfası ders başlığı, 120–180 karakter açıklama ve kapak görseli üretir. Kilitli Junior ders `noindex, nofollow`.

Kurs antreleri `generateMetadata` ile kendi başlık, açıklama ve kapak yolunu basar. Altı vitrin slug’ının arama metni `lib/copy/seo.ts` içinde ayrıdır. Oynatıcı ve çıkış paketi `noindex` + robots Disallow.

Eksik sayılacak yerler:

- Kök layout’un varsayılan açıklaması “yetkin.ai dijital eğitim.” Kısa. Kamu sayfalar kendi metnini bastığı için SERP’te bu kısa cümle görünmüyor. OG’si olmayan bir ara rota bu varsayılana düşer.
- Akademi katalog OG görseli marka plakası. Kurs kapağı antrede var, katalog paylaşımında yok.
- HTML `google-site-verification` meta yok. Doğrulama DNS’te.

### İndeksleme

Kamu katalog, kurs antreleri, Junior iniş ve ücretsiz dersler indekse açık. Engel bilinçli:

- `noindex`: giriş, kayıt, kasa dönüşü, Junior kasa, `/young`, `/freelancer`, oynatıcı, çıkış paketi, sertifika sicil kartı (`noindex, follow`), 404 gövdesi ve kenarın kestiği sahte kamu yolları (`x-robots-tag: noindex`).
- `robots.txt` Disallow: panel, yönetici, API, cüzdan, kasa, profil, oturum alias’ları.

`Disallow: /` canlıda yok. `noindex` ana sayfada yok. İndeks engeli aranacaksa Cloudflare `GoogleOther` kuralına ve Search Console’da sitemap’in gerçekten gönderilip gönderilmediğine bakılır. İkincisi bu turda panelden doğrulanmadı.

---

## ADIM 4 — Stratejik danışmanlık

### 1. Sen olsa ne yapardın?

Trafiği “reklam metni”nden önce ölçülebilir hale getirmek için ilk üç teknik hamle:

1. **GA4’ü gerçekten aç.** `NEXT_PUBLIC_GA_ID` üretimde geçerli bir `G-` kimliği olsun, deploy sonrası HTML’de `gtag/js` ve CSP’de `google-analytics.com` görünsün. GTM ekleme. Mevcut yükleyici GTM kabını reddeder; ikinci kap çorba olur.
2. **Sayfa görüntülemeyi rota değişimine bağla ve satın almayı tek yoldan gönder.** İstemci geçişinde `page_view`. `purchase` hem PayTR dönüşünde hem cüzdan kapanışında `gtag("event", "purchase", …)` olsun. `emitSemConversion` düz nesnesi GA4 olayı değildir; ya gtag’e çevrilir ya da Ads için ayrı ve dürüst bir kanca olarak kalır, raporlarda “satın alma” sanılmaz. Junior kasa aynı üç olaya (`view_item`, `begin_checkout`, `purchase`) bağlanır.
3. **Search Console mülküne site haritasını işle ve `GoogleOther` kuralını gözden geçir.** DNS doğrulaması duruyor. 33 URL’lik harita gönderilmeden dizin gecikir. Cloudflare’in `GoogleOther: Disallow: /` satırı Arama botunu kapatmaz; yine de Google’ın diğer keşiflerini kapatır. Eğitim içeriğinin arama dışı yüzeylerde görünmesi isteniyorsa bu satır gevşetilir. İstenmiyorsa bilinçli bırakılır ve raporda “kapalı” diye yazılır.

### 2. Gelecek aşamada ne izlenmeli?

Isı haritası, takılmayı gösterir; satışı göstermez. Sıra şöyle olmalı:

| Katman | Ne işe yarar | Ne zaman |
|---|---|---|
| GA4, açık ölçüm kimliği + rota `page_view` + dürüst `purchase` | Kaynak, kampanya, cihaz, çıkış sayfası, huni | İlk. Şu an kapalı. |
| Mevcut süper yönetici hunisi | Gerçekleşmiş satış, sınav, vize. Reklam çerezi yok. | Duruyor. GA ile yan yana okunur, GA’nın yerine geçmez. |
| Microsoft Clarity | Ücretsiz oturum kaydı ve tıklama haritası. KVKK metnine yazılır. Ödeme iframe’i ve çocuk profili maskelenir. | GA açıldıktan sonra, yalnız kamu vitrin ve antre. |
| Hotjar / benzeri | Aynı iş, ücretli, daha ağır script. Clarity dururken ikinci ısı aracı eklemeye gerek yok. | Clarity yetmezse. |
| GA4 Explorations + Looker yok | “Neyi almadı” sorusu: `view_item` var, `begin_checkout` yok; `begin_checkout` var, `purchase` yok. | Olaylar dürüst akınca. |

Çocuk yüzeyinde (Junior ders, profil) oturum kaydı açmak ayrı bir hukuki karardır. Varsayılan öneri: Clarity yalnız yetişkin vitrin; Junior’da yalnız olaysız sayfa sayımı veya hiç kayıt yok.

### 3. Kurgu doğru mu?

Görünürlük kurgusu büyük ölçüde doğru. Kanoni alan `https://yetkin.ai`, www tek hop, site haritası yönlendirmeli URL yazmıyor, kamu sayfada başlık ve OG var, gizli odalar `noindex`. Bu, “tabela yok” tablosu değil.

Analitik kurgu yarım. Yükleyici, CSP kapısı, çerez cümlesi ve yönetim panosu var. Canlı etiket yok. Olayların bir kısmı gtag, bir kısmı GTM biçiminde. Junior dışarıda. Sayfa geçişi ölçülmüyor. Bu haliyle hemen çıkma, kaynak ve dönüşüm raporları ya boştur ya da etiket açıldığı gün yanıltıcı olur.

Eksik liste:

- Üretim ölçüm kimliği kapalı.
- SPA `page_view` yok.
- Cüzdan `purchase` ve kayıt `sign_up` GA4 olayı değil.
- Junior hunisi yok.
- Genel tıklama olayı yok (gerekli de değil; huni yeter).
- HTML Search Console meta yok (DNS duruyor).
- Sitemap’in Search Console’a işlendiği doğrulanmadı.
- Isı haritası yok.
- Consent Mode yok. Etiket açılınca politika cümlesi ile davranış yeniden okunmalı.

### 4. Üç aylık master plan

**Ay 1 — Ölçüm dürüst olsun**

- Üretim `G-` kimliği, deploy, canlı HTML + CSP kontrolü.
- Rota değişiminde `page_view`.
- `purchase` ve `sign_up` tek gtag yolu. PayTR dönüşü ve cüzdan kapanışı aynı olay.
- Junior: iniş `view_item` (yıllık paket), kasa `begin_checkout`, dönüş `purchase`.
- Search Console: mülk, site haritası gönderimi, kapsam raporu. `GoogleOther` kararı yazılsın.
- Yönetici hunisi ile GA satın alma sayısını haftalık karşılaştır. Sapma varsa GA değil, defter esas alınır.

**Ay 2 — Hız ve dizin**

- Kamu HTML TTFB: nonce yüzünden `no-store` duruyor. Ölç (WebPageTest veya CrUX, Frankfurt ve İstanbul). İskelet süresini kısalt; katalog kapağı LCP adayı olarak kalsın.
- Oynatıcıda `preload="auto"` yalnız görünür ders için. Katalog ve iniş bu dosyayı çekmesin (bugün de çekmiyor; gerilemesin).
- Search Console kapsamı: yönlendirmeli, hariç, tarandı-dizine girmedi. Eski `/en/` ve emekli SKU 301’leri düşene kadar izlenir.
- İç bağlantı: ana sayfa, Akademi, altı antre, Junior ücretsiz ders. Harita 33 URL; dağılma az, her antre kendi sorgusuna hizmet etmeli.

**Ay 3 — Takılma ve kampanya**

- Clarity, maskeli, yalnız yetişkin kamu. Ödeme alanı ve hesap e-postası kapalı.
- GA4’te üç keşif: kaynak / antre, ücretsiz ders → kasa, kasa → satın alma. Cihaz kırılımı.
- Reklam açılacaksa dönüşüm GA4 `purchase` anahtarı olsun. Ayrı bir piksel, çerez politikası değişmeden eklenmez. Politika bugün yeniden hedefleme olmadığını söylüyor.
- Ay sonunda tek sayfa: oturum, antre görüntüleme, ücretsiz ders, kasa niyeti, GA `purchase`, defterdeki SETTLED. İkisi ayrışıyorsa kampanya kararı deftere göre verilir.

---

## Sonuç

Tabela duruyor: başlık, açıklama, OG, kanonik, 33 URL’lik site haritası, seçici `noindex`. Dükkânın kasası içeride sayılabiliyor (yönetici hunisi). Kapıdaki sayaç (GA4) takılı ve fişi çekili. Trafik, hemen çıkma ve kampanya dönüşümü bu haliyle raporlanamaz. İlk iş etiketi açmak ve satın alma olayını cüzdan ile PayTR’de aynı gtag çağrısına bağlamaktır.
