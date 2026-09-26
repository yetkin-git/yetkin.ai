# Tedavi Raporu 02 — OFF-201 ses mührü ve lansman fiyatı

Tarih: 26 Eylül 2026  
Dal: `off-201-stage`  
Commit: `feat(academy): finalize OFF-201 audio seals and price entry`

## Kota ve kilit

`VOICE_TTS_FALLBACK_TO_2_5` kapalı (`false`). Canlı model `gemini-3.1-flash-tts-preview`. Yasak kimlik `gemini-2.5-flash-preview-tts` seçilmedi.

Kota sondası tek kısa cümleyle Kore sesinde açıldı. Ses dosyası yazılmadı. Yanıt `quota=open`. Kota dolu olmadığı için `--seal` açıldı.

## Dry-run

İlk tarama konuşma metni ile eski rozet paragraflarını eşleştiremedi:

| Ders | Ses | Markdown paragraf | Eski rozet paragrafı |
| --- | --- | --- | --- |
| 1 | Kore | 13 | 10 |
| 2 | Puck | 14 | 10 |
| 6 | Zephyr | 16 | 11 |

Konuşma metni kırpılmadı. Rozet paragrafları konuşma metnine çekildi. Rozet kimliği ve etiketi durdu. İkinci dry-run API çağırmadan geçti. Üç ders de 12 istek bandında, kuyrukta, tempo 0.93.

## Mühür

Komut, ders başına: `npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai_ileri --key=...`

| Ders | Ses | Süre | Yayın |
| --- | --- | --- | --- |
| `01_office_ai_ileri-1` | Kore | 523.809 sn | `public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-1.mp3` |
| `01_office_ai_ileri-2` | Puck | 616.540 sn | `.../01_office_ai_ileri-2.mp3` |
| `01_office_ai_ileri-6` | Zephyr | 754.906 sn | `.../01_office_ai_ileri-6.mp3` |

Üçü de 5 dakikanın üstünde. Ders 3, 4 ve 5 yeniden yakılmadı. WAV `media-bake/` altında; git dışıdır. Timings ve rozet saatleri yenilendi.

`ACADEMY_MEDIA_SEALED_AUDIO` artık altı dersi taşır. `ACADEMY_TTS_REVOKED_CASSETTES` ve `ACADEMY_TTS_REBAKE_QUEUE` boştur. Eski 2.5 kasetleri arşivde durur.

`academyCourseSaleOpen("01_office_ai_ileri")` true döner.

## Fiyat

Lansman tohumu 129.000 kuruş (₺1.290, KDV dahil). Satır `academy` / `course:01_office_ai_ileri`. SQL: `supabase/migrations/20260926153000_off201_launch_price.sql`. Super Admin `updated_by` doldurduysa tutar ezilmez. Kurs satırı da aynı dosyada yayınlanır.

Vitrin kartı bu tutarı ve açık satışı gösterir. Soğuk okuyucu `academyCatalogPriceMinorForSlug` hâlâ null döner; canlı kilit katalog satırıdır.

Kasa dönüşü `kurs=01_office_ai_ileri` ile `/academy/01_office_ai_ileri` adresine gider. Başarısız dönüş akademi vitrininde kalır. Sorgu PayTR dönüş adresinde korunur.

## Test

Komut: `npm test` (`vitest run`)

- Test dosyası: 236 geçti
- Test: 1152 geçti
- Süre: 55.21 sn
- Çıkış kodu: 0

## E. Danışma

### 1. Sen olsaydın ne yapardın?

`off-201-stage` dalını `main` üzerine yerinde birleştirmezdim. Sıra şu olurdu:

1. Dalı `origin`’e bas. Production Branch `main` kalsın.
2. `off-201-stage` → `main` pull request’i aç. Zorla itme ve `main` üzerinde doğrudan commit yok.
3. CI yeşil olsun. Bu turdaki `npm test` yerel kanıttır; uzak kontrol ayrıdır.
4. Yeni SQL’i hedef veritabanına, production trafiğinden önce uygula (`ops:migrate`). Kod kartta ₺1.290 gösterir. Katalog satırı yoksa satın alma kilidi «Aktif katalog fiyatı yok» der.
5. Preview yeşil ve fiyat satırı duruyorsa PR’ı birleştir. Canlı hat `main` dağıtımından gelsin.

### 2. Kontrol ve öneri

Bellek üzerinde satın alma ve muafiyet akışında takılma olmadı. Kilit 129.000 kuruş kesti. İlk satın alma bakiyeyi bir kez düşürdü. İkinci çağrı tekrar kesmedi. Baraj altı muafiyet satışı kapatmadı. Geçersiz kilit para kesmedi. Geçen muafiyet mührü de ikinci bir kesinti açmadı.

Canlı kart, PayTR 3D ve tarayıcıda kasa sayfası bu turda çalıştırılmadı. Gecikme ölçümü yoktur. Yönlendirme birim testiyle doğrulandı: `kurs=01_office_ai_ileri` adresi `/academy/01_office_ai_ileri`.

### 3. Master plan — Paket 3

Vatandaş dili ve arayüz temizliği için sıra:

1. Yeni mühürlerin oynatıcıda karaoke ile aktığını bir kez izle. Süre ve rozet saati timings dosyasındadır; kulak kontrolü ayrıdır.
2. Web cüzdan dönüşü (`/cuzdan`) kurs taşımaz. Dron kasası taşır. Aynı satın alma web’den de doğru eğitime dönsün.
3. Kardeş SKU’lar (02–05) hâlâ «Çok Yakında» kabuğudur. Lansman metninde satılıyormuş gibi durmasınlar.
4. Yönetici metnindeki «tutar kodda durmaz» cümlesi, satır yokken doğrudur. Satır açıldıktan sonra ekranda eski boş form kalmasın.
5. Dron amiral kartının fiyat etiketi hâlâ boş. OFF-201 etiketi ₺1.290. İki kart aynı kaynaktan okusun.
