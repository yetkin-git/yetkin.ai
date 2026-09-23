# Search Console — tam indeks ve yönlendirme düzeltmesi

Tarih: 23 Eylül 2026.

Google Search Console’daki üç kova bu turda ayrıldı: yönlendirmeli sayfa, bulunamadı (404), standart etiketle alternatif sayfa. Canlı `https://yetkin.ai` sitemap ve sayfa yanıtları ölçüldü; düzeltme o ölçüme göre yazıldı.

## Sitemap

`https://yetkin.ai/sitemap.xml` içindeki 13 adresin hepsi oturumsuz istekte **200** döndü. Yönlendiren veya 404 adres sitemap’te yoktu; bu turda `<loc>` silinmedi.

Kalan kamu adresler: `/`, `/academy`, `/academy/01_office_ai`, `/academy/dogrula`, `/vize`, `/legal`, `/legal/gizlilik`, `/legal/cerez`, `/legal/iade`, `/legal/mesafeli-satis`, `/legal/kullanim`, `/hakkimizda`, `/iletisim`.

`/career`, `/academy/*/oyna`, `/academy/*/cikis-paketi` ve oturum odaları haritada yok. `robots.txt` bunları `Disallow` ile kapatır. Oynatıcı kuralı `Disallow: /academy/*/oyna` olarak yayında duruyor.

## Beş alternatif sayfa

Bu beş adres 200 dönüyor ve kanonikleri başka bir kamu URL’sine bakıyordu. Search Console bunu «Standart etiket alternatif sayfa» diye yazar.

| Adres | Eski kanonik |
|---|---|
| `/kasa` | `https://yetkin.ai` |
| `/kasa/donus` | `https://yetkin.ai` |
| `/sifremi-unuttum` | `https://yetkin.ai` |
| `/sifre-yenile` | `https://yetkin.ai` |
| `/academy/01_office_ai/cikis-paketi` | `https://yetkin.ai/academy` |

Kök layout ana sayfa kanoniğini tüm çocuklara miras bırakıyordu. Akademi layout’u da katalog kanoniğini oynatıcı ve çıkış paketine bırakıyordu. `noindex` vardı; kanonik yine de başka sayfayı gösteriyordu.

Düzeltme: kök ve akademi kabuğu sayfa kanoniği taşımaz. Katalog kanoniği yalnız `/academy` sayfasındadır. Bu beş adres kendi `https://yetkin.ai/...` kanoniğini ve `noindex` basar. Kamu sayfalar (`/`, `/academy`, yasal, `/vize`, amiral antre) `pageMetadata` ile tekil mutlak kanonik taşımaya devam eder.

## Yönlendirme zinciri

Döngü yoktu. Zincir vardı:

| Kaynak | Eski birinci hop | Eski ikinci hop |
|---|---|---|
| `/kariyer` | 308 `/career` | 307 `/login?next=/career` |
| `/profile` | 308 `/profil` | 307 `/login?next=/profil` |
| `/passport` | 308 `/pasaport` | 307 `/login?next=/pasaport` |

Bu üç kural `next.config.ts` redirects listesinden çıktı. Kenar tek hop basar: oturumsuz istek doğrudan girişe, oturumlu istek kanonik odaya (`/career`, `/profil`, `/pasaport`).

Tek hop ile 200 kamu sayfasına inen alias’lar durur: `/ogren` → `/academy`, `/giris` → `/login`, `/kayit` → `/register`, `/verify` → `/academy/dogrula`, `/p` → `/vize`, eski yasal kısa adlar, emekli akademi slug’ları. `www.yetkin.ai` yakalayıcısı listenin sonunda kalır.

`/career`, `/academy/certificates` ve `/academy/01_office_ai/oyna` oturumsuzda hâlâ tek 307 ile girişe gider. Sitemap’te değiller; `robots.txt` taratmaz. Oturum duvarı kalkmaz.

## 404

Sitemap adresleri 404 değil. Siteden linklenmeyen İngilizce kestirmeler (`/about`, `/contact`, `/privacy`, `/terms`, `/courses`) 404 döner. Bunlar haritaya eklenmedi ve yeni 301 yapılmadı: yeni yönlendirme, «yönlendirmeli sayfa» kovasını büyütür. Google bu 404’leri bir sonraki taramada düşürür.

Konsoldaki beş 404 bu listeden farklıysa adresler verilince kanonik 200 sayfaya tek hop bağlanır.

## Doğrulama

`npx vitest run tests/copy/seo-surface.test.ts tests/kernel/legal-launch-surface.test.ts tests/kernel/edge-guard.test.ts tests/kernel/kayit-alias-surface.test.ts` geçti.

Yayın sonrası Search Console URL denetimi yeni `robots.txt`, `sitemap.xml` ve kanonikleri görür. Eski kovalar bir sonraki taramada boşalır; panel anında sıfırlanmaz.

## Yayın

Düzeltme `yetkin-git/yetkin.ai` `main` dalına push edilir. Vercel bu dalın üretim derlemesini tetikler.
