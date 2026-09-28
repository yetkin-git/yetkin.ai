# Canlı yayın ve SEO raporu — OFF-101 / OFF-201

Tarih: 28 Eylül 2026. Kapsam: `01_office_ai` (OFF-101) ve `01_office_ai_ileri` (OFF-201).

## SEO

İki antre de `pageMetadata` ile kanonik URL, Open Graph ve Twitter kartı basar. Kök `https://yetkin.ai`. Sicil başlığı (sertifika adı) meta title ile ezilmez.

| | OFF-101 | OFF-201 |
| --- | --- | --- |
| Slug | `01_office_ai` | `01_office_ai_ileri` |
| Title | Excel Yapay Zekâ Eğitimi: Ofiste ChatGPT + Sertifika | İleri Ofis Yapay Zekâ: 6 Ders ve Sertifika |
| Canonical | `https://yetkin.ai/academy/01_office_ai` | `https://yetkin.ai/academy/01_office_ai_ileri` |
| og:image | `/academy/cinema/01_office_ai-1-eye.webp` | `/academy/covers/01_office_ai_ileri.jpg` |
| JSON-LD | `Course` + ders `LearningResource` + `EducationalOccupationalProgram` + `FAQPage` | `Course` + ders `LearningResource` + `EducationalOccupationalProgram` |

OFF-201 description: dört parçalı istem, toplantı notu, Excel formül ve grafik, uzun belge, e-posta taslağı, üç dosyada sayı denetimi. Sertifika iddiası 6 ders + 10 soru / 70. Sunucuda dosya kontrolü yoktur.

`tests/copy/seo-surface.test.ts` 27 test geçti.

## Site haritası ve robots

- `sitemap.xml` her iki antreyi `https://yetkin.ai` kökünde, haftalık, öncelik 0.8 ve kapak görseliyle basar.
- `robots.txt` Allow listesinde `/academy/01_office_ai` ve `/academy/01_office_ai_ileri` durur.
- `/academy/*/oyna` ve `/academy/*/cikis-paketi` disallow. Oynatıcı indekslenmez.

## Supabase

Komut: `npm run ops:migrate` (pakette `db:sync` / `db:push` yok). Çıkış 0.

- Prisma: bekleyen migrasyon yok (35 klasör).
- SQL sırası uygulandı. Son dosya `20260926153000_off201_launch_price.sql`.
- Canlı okuma (bağlantı dizesi yazılmaz):
  - `01_office_ai` yayında. Katalog `course:01_office_ai` aktif, 89000 kuruş.
  - `01_office_ai_ileri` yayında, başlık «İleri Ofis Yapay Zekâ». Katalog `course:01_office_ai_ileri` aktif, 129000 kuruş.

`cacheV` veritabanı kolonu değildir. Damga `lib/academy/lesson-audio-timings/*.json` içindedir ve bu yayınla gider.

| Ders | cacheV |
| --- | --- |
| 01_office_ai-0 | 255800 |
| 01_office_ai-1 | 710016 |
| 01_office_ai-2 | 539659 |
| 01_office_ai-3 | 570761 |
| 01_office_ai-5 | 592220 |
| 01_office_ai-6 | 529723 |
| 01_office_ai-g1 | 640634 |
| 01_office_ai-k1 | 737865 |
| 01_office_ai-w1 | 583984 |
| 01_office_ai_ileri-1 | 489144 |
| 01_office_ai_ileri-2 | 609618 |
| 01_office_ai_ileri-3 | 662323 |
| 01_office_ai_ileri-4 | 755895 |
| 01_office_ai_ileri-5 | 847653 |
| 01_office_ai_ileri-6 | 718382 |

Steril vitrin SQL’i her `ops:migrate` turunda `academy_audio_cache` satırlarını siler. Vatandaş oynatıcı kamu medya dosyasını ve timings `cacheV` sorgu damgasını okur.

## Derleme

`npm run build` çıkış 0. Next.js 16.3.1 üretim derlemesi tamam. `/sitemap.xml` ve `/robots.txt` statik sayfa olarak üretildi.

Derlemenin geçmesi için üç tip düzeltmesi yapıldı: yinelenen TTS istek sabiti importu, ham ses dökümünde `Buffer.from`, testlerde `NODE_ENV` ataması.

## Git

Commit mesajı: `feat(academy): OFF-101 ve OFF-201 5-katmanlı canlı mühür ve SEO güncellemesi`

Yerel örnek dosyalar (`public/sample.mp3`, `public/sample-93.mp3`, `public/sample-with-bed.mp3`) bu committe yoktur. Freelancer ihtilaf diff’i bu mesajın dışındadır.
