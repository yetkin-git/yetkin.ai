# Ana sayfa yönlendirmesi — doğrudan Akademi vitrini

| Alan | Değer |
|------|--------|
| Tarih | 4 Ekim 2026 |
| Karar | CEO ve SUPER_ADMIN |
| Ne değişti | `yetkin.ai` ve `www.yetkin.ai` kök adresi soğuk ana sayfayı basmaz. Ziyaretçi Akademi kataloğuna iner. |

## Ziyaretçi ne görür

Adres çubuğuna `yetkin.ai` veya `www.yetkin.ai` yazan kişi, ara sayfa görmeden **Akademi kataloğuna** (`/academy`) düşer. Katalogda altı eğitim durur: Ofiste Yapay Zekâ, İleri Ofis, E-Ticaret, Sosyal Medya, Chatbot ve Prompt. Kartların yeşil düğmesi **► 1. Dersi Ücretsiz İzle** yazar ve birinci dersi açar.

Google’dan gelen iz (`?utm_source=google` gibi) katalog adresine taşınır. Yerel geliştirmede (`localhost`) yönlendirme aynı makinede kalır; canlı siteye zıplamaz. `www` adresi tek adımda `https://yetkin.ai/academy` adresine iner.

Bakım kilidi açıkken kök adres hâlâ bakım sayfasını basar. Kilit kapalıyken katalog açılır.

## Nasıl bağlandı

İki kapı aynı işi yapar. Biri düşerse öteki tutar.

1. Yayın kuralı (`next.config.ts`). Kalıcı yönlendirme (308). Tarayıcı ve arama motoru bu adresi hatırlar.
2. Kenar yedeği (`proxy.ts` + `lib/kernel/security/edge-guard.ts`). Aynı 308. Oturum açık olsa da kapalı olsa da katalog açılır.

Eski soğuk sayfa dosyası (`app/(public)/page.tsx`) duruyor. Canlı istek ona ulaşmaz. Yönlendirme katmanı düşerse yedek gövde olarak kalır.

Site haritasından kök adres çıkarıldı (`lib/copy/seo.ts`). Arama konsolu, yönlenen bir adresi «yönlendirmeli sayfa» diye yazmasın. Katalog adresi haritada duruyor ve önceliği 1.0.

## Doğrulama

| Kontrol | Sonuç |
|---------|--------|
| `npx tsc --noEmit` | Geçti. Tip hatası yok. |
| `npm test` | **1203 / 1203 geçti.** 246 dosya, süre yaklaşık 70 saniye. |
| Kenar testi | `GET /` → 308, adres `/academy`. İz parametresi korunur. |
| Bakım testi | Donma açıkken kök adres 503 basmaya devam eder. |
| Site haritası testi | Kök adres haritada yok. `/academy` önceliği 1. |
| Çalışan yerel sunucu | `http://127.0.0.1:3000/` yanıtı **308**, `Location: /academy`. Katalog **200**. Altı eğitimde ücretsiz birinci ders bağlantısı var: Ofiste Yapay Zekâ, İleri Ofis, E-Ticaret, Sosyal Medya, Chatbot, Prompt. Düğme metni **1. Dersi Ücretsiz İzle**. |

Playwright paketi (`npm run test:e2e`) bu turda koşulmadı. `npm test` onu çalıştırmaz. `tests/e2e/faz1-nav.spec.ts` hâlâ eski soğuk sayfa başlığını arar. Bir sonraki e2e turunda o dosyanın katalog inişine çekilmesi gerekir.

## Canlıya alma

Kod değişikliği bu makinede duruyor. Uzak depoya itme bu oturumda tamamlanamadı: çalışan kabukta `git` komutu yok (`git` tanınmıyor; `C:\Program Files\Git` de yok). Depo klasörü ve `origin` (`https://github.com/yetkin-git/yetkin.ai.git`, dal `main`) duruyor.

Git’in bulunduğu bir terminalde:

```
git add next.config.ts proxy.ts lib/kernel/security/edge-guard.ts lib/copy/seo.ts "app/(public)/page.tsx" tests/kernel/edge-guard.test.ts tests/kernel/proxy-edge.test.ts tests/copy/seo-surface.test.ts docs/Ana_Sayfa_Yonlendirme_Raporu.md
git commit -m "feat(landing): send the root address straight to the academy catalog"
git push origin main
```
