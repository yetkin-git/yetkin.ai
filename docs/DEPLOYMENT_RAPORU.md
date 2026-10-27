# Dağıtım raporu — 27 Ekim 2026, akşam

Canlı site bu turda **güncellendi**. `main` ucu `4e02fc9`. https://yetkin.ai yeni sürümü sunuyor.

Ölçüm: 27 Ekim 2026, yaklaşık 14:05 TR. `robots.txt` `last-modified: Tue, 27 Oct 2026 11:04:52 GMT`. Önceki ölçümde bu başlık `Wed, 21 Oct 2026` idi ve `/academy/ileri` sitemap'te yoktu.

## 1. Kök neden

`tests/academy/idor-exam-purchase.test.ts` fiyat kilidini `01_office_ai` üzerinden açar. `lockAcademyCoursePrice` → `requirePublishedCourse` → `academyCourseSaleOpen`. Satış, sınav yolundaki konuşma metni ve mühürlü sesi okur.

Konuşma metni depodadır. Ses baytı yoktur: `git ls-files "*.mp3"` sıfırdır, `public/media/academy/audio` bu makinede de yoktur. CI ve Vercel aynı checkout'u alır. Test `NODE_ENV=test` iken disk okuyucusu dosyayı false sayıyor, kapı `GoneError: Kurs satışa kapalı.` ile çıkış 1 veriyordu. Üretim çalışma zamanı zaten `lib/academy/production-seal-manifest.ts` anlığını okur; lambda baytı taşımaz.

Aynı zincirde `verify:junior-sync`, Junior ses klasörü yokken onay vermiyordu. `verify:junior-audio-manifest` klasör yoksa dosya denetimini atlar. Akustik kapı bunu yapmıyordu. `verify:prebuild` sırası IDOR'dan sonra bu kapıya gelir; IDOR düzelince derleme burada düşerdi.

## 2. Düzeltme

Commit `4e02fc9` — `fix(deploy): pass prebuild when sealed audio bytes are absent`.

| Dosya | Hüküm |
|---|---|
| `lib/academy/production-seal-disk.ts` | `public/media/academy/audio` yoksa konuşma ve fon, mühür anlığından okunur. Klasör durup dosya eksikse satış kapalı kalır. `01_office_ai-4` anlıkta yoktur, false kalır. |
| `scripts/verify-junior-sync.ts` | `public/media/junior/audio` ve `media-bake/junior/audio` ikisi de yoksa akustik sapma atlanır. Klasör durup ders dosyası yoksa onay yok. `--apply` baytsız yazmaz. |
| `tests/academy/production-standard.test.ts` | Ağaç yokken anlık konuşmayı var sayar. |
| `tests/academy/academy-sealed-media-sync.test.ts` | Bayt 0 iken anlıkta duran yolu eksik saymaz. |

Üretim `NODE_ENV=production` yolu değişmedi. Anlık hâlâ satış kaynağıdır.

## 3. Medyasız prova

Akademi ses klasörü zaten yoktu. Junior oynatıcı klasörü ve fırın yatağı prova sırasında `D:\yetkin-sealhold` altına alındı, komut bitince geri kondu. İkisi de yerinde.

| Komut | Çıkış |
|---|---|
| `npm run verify:prebuild` | 0. IDOR 19 test geçti. `verify:junior-sync OK — 123 timeline. Ses klasörü bu süreçte yok` |
| `npm run build` | 0. `next build` rota tablosunu bastı. `BUILD_EXIT=0` |
| `npx tsc --noEmit` | 0 |
| `npx vitest run` | 392 dosya geçti. 1 dosya 5 sn zaman aşımı: `tests/academy/tts-quality-gate.test.ts`, `tsc` ile aynı anda koşunca. Yalnız koşunca 530 ms, çıkış 0. Medya hükmü değil. |

`public/` paketi bu provada 55.6 MB. 950 MB hata eşiğinin altında.

## 4. GitHub ve Vercel

Push: `504f045..4e02fc9` → `origin/main`.

GitHub durum kaydı, push'tan hemen sonra: `pending`, cümle `Vercel is deploying your app`. Hedef: https://vercel.com/yetkin-git/yetkin-ai/8Y57WBnAiCGjaSzSHvmqJRtT87DK

Sonraki durum okuması GitHub API hız sınırına takıldı. Panel cümlesi `Ready` bu makineden okunamadı. `vercel whoami` oturumsuz, `VERCEL_TOKEN` boş.

Canlı kenar, eski sürümün eksiklerini kapatmış durumda:

| Adres | Durum | Eşleşme |
|---|---|---|
| `https://yetkin.ai/robots.txt` | 200 | `Allow: /academy/ileri`. `x-vercel-cache: MISS`. `cf-cache-status: EXPIRED` |
| `https://yetkin.ai/sitemap.xml` | 200 | 32 adres. `/academy/ileri` var |
| `https://yetkin.ai/academy` | 200 | `x-matched-path: /academy` |
| `https://yetkin.ai/academy/ileri` | 200 | `x-matched-path: /academy/ileri` |
| `https://yetkin.ai/junior` | 200 | `x-matched-path: /junior` |

Önceki turda `/academy/ileri` `x-matched-path: /academy/[slug]` idi. Statik sayfa artık kenarda.

## 5. Ortam değişkenleri

Vercel Production kasası açılmadı. Değer yazılmadı.

Derleme canlıya çıktığı için `NODE_ENV=production` hazırlık kapısı (`ops:runtime-readiness`) çıkış 1 vermemiş demektir. Bu kapının kestiği şeyler:

- `SUPER_ADMIN_USER_ID` boşsa derleme durur. Boş değildi.
- PayTR üçlüsü doluyken `NEXT_PUBLIC_APP_URL` localhost veya `http` ise derleme durur. Üçlü doluysa kök `https` genel köken.
- PayTR üçlüsü doluyken `PAYTR_ALLOW_MOCK_CHECKOUT` doluysa derleme durur.
- `VERCEL_ENV=production` iken `NEXT_PUBLIC_MEDIA_BASE_URL` `https` CDN kökü ister.

`PAYTR_SANDBOX` bu kapıda çıkış kodunu bozmaz; checklist uyarısıdır. Panelde boş olduğu bu turda doğrulanmadı. Üçlü değerlerin canlı merchant olduğu da panelden okunmadı. İsimler panelde elle bakılacak: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT`, `PAYTR_SANDBOX`, `SUPER_ADMIN_USER_ID`.

## 6. Cloudflare

Temizlik **çalıştırılmadı**. `CLOUDFLARE_API_TOKEN` / `CF_API_TOKEN` boş.

Gözlenen: `robots.txt` kenarda `EXPIRED`, diğer üç yol `DYNAMIC` / `MISS`. Yeni HTML bu ölçümde eski bir HIT'ten gelmedi.

Yine de panel temizliği:

1. https://dash.cloudflare.com → `yetkin.ai` bölgesi.
2. Caching → Configuration → Purge Cache → **Purge Everything**.
3. Onaydan sonra `https://yetkin.ai/robots.txt` başlığında `cf-cache-status` ve `last-modified` yeniden bakılır.
4. SSL/TLS modu panelde **Full (strict)** diye kontrol edilir. Bu turda mod okunmadı.

API ile aynı iş, bölge kimliği panelden alınır. Gövde `{"purge_everything":true}`. Belirteç ve bölge kimliği bu dosyaya yazılmaz.

## 7. SUPER_ADMIN

1. Canlı bu turla güncellenmiş sayılır. Kanıt kenar başlıkları ve `/academy/ileri` statik eşleşmesidir. Panel `Ready` yazısı ayrıca açılabilir: https://vercel.com/yetkin-git/yetkin-ai/8Y57WBnAiCGjaSzSHvmqJRtT87DK
2. Production kasasında bölüm 5'teki isimleri doğrula. `PAYTR_SANDBOX` boş olsun. Değerleri bu dosyaya yazma.
3. Cloudflare Purge Everything ve Full (strict).
4. `npx vercel login` bu makinede hâlâ yok. Günlük gerekirse oturum açılıp `npx vercel inspect` çalıştırılır.
