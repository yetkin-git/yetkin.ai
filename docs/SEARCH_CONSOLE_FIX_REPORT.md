# Search Console — «Yönlendirmeli sayfa» düzeltmesi

Tarih: 23 Eylül 2026.

Google Search Console’daki «Yönlendirmeli sayfa» kaydı, dizine alınması istenen bir adresin 200 yerine 301/307 dönmesinden çıkar. Bu turda kamu kanonikleri `https://yetkin.ai` üzerinde kilitlendi; oturum duvarına çarpan adresler site haritasından ve tarama izninden çıkarıldı.

## Bulgu

`/career` site haritasında ve `robots` Allow listesindeydi. Oturumsuz istek (Googlebot dahil) kenarda 307 ile `/login`’e gider (`PROTECTED_KERNEL_PATHS`). Haritadaki adres bu yüzden «yönlendirmeli sayfa» olarak işaretlenir.

Aynı çizgide ikinci hop üreten alias’lar:

| Kaynak | İlk hop | Oturumsuz ikinci hop |
|---|---|---|
| `/kariyer` | 301 `/career` | 307 `/login` |
| `/profile` | 301 `/profil` | 307 `/login` |
| `/passport` | 301 `/pasaport` | 307 `/login` |

`/ogren`, `/verify`, `/p` ve eski yasal kısa adlar tek hop ile 200 kamu sayfasına iner. Bunlar haritada yoktu; Google 301’i görüp kanoniğe birleştirebilsin diye Disallow’a alınmadı.

`metadataBase` zaten `https://yetkin.ai` idi. Sayfa kanonikleri bağıl yoldu. Site haritası `NEXT_PUBLIC_APP_URL` HTTPS ve localhost değilse o kökeni yazıyordu; `vercel.app` veya `www` apexe yönlendiği için `<loc>` yine yönlendirmeli sayfa üretebilirdi.

`/kayit` hem `next.config` 301 hem kenar 308 taşır. Next yönlendirmesi kenardan önce çalışır; istek tek hop `/register` olur, zincir değildir. Emekli Akademi slug’ları genel `/academy/courses/:slug` kuralından önce `/academy`’ye iner; ikinci hop yok.

## Yapılan düzeltme

- `pageMetadata` canonical ve `og:url` mutlak `https://yetkin.ai/...` basar.
- `sitemap.ts` yalnız `https://yetkin.ai` yazar. `NEXT_PUBLIC_APP_URL` haritaya girmez. Disallow yolu haritadan düşer.
- `/career` haritadan ve Allow listesinden çıktı. Kamuya açık vize yüzeyi `/vize` durur. Kariyer sayfası `noindex, follow` giyer; oturumlu HTML de dizine aday değildir.
- `robots` Disallow: `/career`, `/kariyer`, `/profile`, `/passport`, `/giris`, `/kayit`, `/academy/certificates`, `/auth/`, `/sifremi-unuttum`, `/sifre-yenile`, mevcut sığınaklar ve `/academy/*/oyna`, `/academy/*/cikis-paketi`.
- Alias hedefleri mutlak `https://yetkin.ai/...`. `www.yetkin.ai` kuralı listenin sonundadır; önde olsaydı `www` + alias iki kez zıplardı. `www.yetkin.ai/kariyer` tek hop `https://yetkin.ai/career` olur.

## Dizine kalması gereken 200 yollar

`/`, `/academy`, `/academy/01_office_ai`, `/academy/dogrula`, `/vize`, `/legal` ve kanonik yasal slug’lar, `/iletisim`, `/hakkimizda`.

## Doğrulama

`npx vitest run tests/copy/seo-surface.test.ts tests/kernel/legal-launch-surface.test.ts tests/academy/certificate-share-surface.test.ts tests/career/public-talent-surface.test.ts tests/kernel/kayit-alias-surface.test.ts tests/academy/storefront-vitrine.test.ts` geçti.

Search Console’da düzeltme, yeni `robots.txt` ve `sitemap.xml` yayına çıktıktan sonra URL denetimi ile görülür. Eski «yönlendirmeli» kayıtlar bir sonraki taramada düşer; panel anında boşalmaz.

## Yayın

Düzeltme `yetkin-git/yetkin.ai` `main` dalına push edilir. Vercel bu dalın üretim derlemesini tetikler.
