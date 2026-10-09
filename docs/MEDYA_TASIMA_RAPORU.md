# Medya Taşıma Raporu

Tarih: 9 Ekim 2026.

Bu tur, Vercel derlemesine giren statik gövdeyi küçültmek için Junior ses, kapak ve ısınma kasetini Cloudflare R2 yoluna bağlar. Akademi mühür sesi `academy-sealed` imzasında kalır. Satın alma kapısı değişmedi.

Kuru sayım bu makinede çalıştı. Kovaya yazılmadı: `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT` / `R2_ACCOUNT_ID` ve `NEXT_PUBLIC_MEDIA_BASE_URL` boş.

## 1. Dış depoya hazırlanan medya

Betik: `npm run ops:sync-media-r2` (kuru sayım) ve `npm run ops:sync-media-r2 -- --apply` (yazma).

| Kategori | Dosya | Boyut | Vercel paketi |
| --- | --- | --- | --- |
| Junior ses (`public/media/junior/audio`, MP3) | 106 | 1658,9 MB | Dışarıda |
| Junior kapak (`public/media/junior/covers`, JPEG) | 105 | 20,7 MB | Dışarıda |
| Junior ısınma (`public/media/junior/warmup`, MP4) | 5 | 25,2 MB | Dışarıda |
| Akademi ısınma (`public/media/academy/micro`, MP4) | 7 | 19,2 MB | Pakette kalır |
| Toplam kova listesi | 223 | 1723,9 MB | |

Kova anahtarı `public/` önekini düşer. Örnek: `media/junior/covers/jr_06_mat-1.jpg`. Okuma adresi `https://cdn.yetkin.ai/media/junior/covers/jr_06_mat-1.jpg` biçimindedir.

WAV, `media-bake` ana kaydı ve akademi mühürlü ders MP3’si bu listeye girmez. Akademi ses klasörü bu diskte boştur (0 dosya). Mühür sesi kısa ömürlü imza ile okunur.

`media-bake` yerelde 5509,8 MB. Git ve Vercel zaten bu klasörü görmez. Ana kayıt olduğu için silinmedi.

Aynı boyuttaki nesne `--apply` sırasında yeniden yazılmaz. Yerel dosya silinmez. Kovadaki fazla nesne silinmez.

## 2. CDN adres mantığı

Ortam `NEXT_PUBLIC_MEDIA_BASE_URL` boşsa veya adres geçersizse tarayıcı `/media/...` yolunu okur. Doluysa aynı yol CDN köküne bağlanır. Sorgu (`?v=8000`) durur. Kökte yol olmaz: `https://cdn.yetkin.ai/media` reddedilir, yerel yola düşülür.

Bağlanan okumalar:

- Kapak: `juniorCoverSrc` — kart, paylaşım kartı, site haritası, ders API’si
- Ders sesi ve fon: `juniorLessonAudioSrc`, `juniorBgmSrc` — oynatıcı bunları `Audio` öğesine verir
- Junior ısınma: `juniorWarmupSrc` — kaset bileşeni gelen adresi oynatır
- Akademi ısınma: `academyWarmupCassettePublicPath`

Fırın betikleri disk yolunu yazar. `juniorCoverPublicPath` ve `juniorLessonAudioPublicPath` yerel kalır.

Kenar güvenlik başlığı, geçerli CDN kökünü `img-src` ve `media-src` listesine ekler. Boş tabanda eski mühür durur: aynı köken, blob ve Supabase.

## 3. Vercel kapsamı ve boyut

`.vercelignore` ve `.gitignore` şu üç kökü dışarıda bırakır:

- `public/media/junior/audio/`
- `public/media/junior/covers/`
- `public/media/junior/warmup/`

Derleme bütçesi de aynı kökleri paketten saymaz. Ölçüm:

| Kalem | Boyut |
| --- | --- |
| Önceki `public/` (disk) | 1760,4 MB |
| Vercel paketine giren `public/` | 55,6 MB |
| CDN’de bırakılan Junior medya | 1704,7 MB |
| Uyarı eşiği | 850 MB |
| Hata eşiği | 950 MB |

Paket eşiğin altında. Sonuç: `OK`.

Akademi ısınma kaseti (19,2 MB) pakette kalır. Mühür betiği bu dosyayı derleme anında diskte arar.

Bu makinede `git` komutu yok. İzlenen dosyayı indeksten düşüren `git rm --cached` çalıştırılmadı. Kurallar dosyada durur. Dosyalar daha önce commit edildiyse, Git ile giden Vercel yayını onları yeni bir commit düşürene kadar taşır. CLI yüklemesi `.vercelignore` ile bu üç kökü şimdiden atlar.

`.tmp` içinde birkaç kilobaytlık sonda notu var. Ağır kalıntı değil; duruyor.

## 4. CEO onayına sunulan depolama durumu

Onay sırası şudur. Atlama, canlı derste kapak ve sesin boş kalmasına yol açar.

1. Cloudflare R2 kovası ve herkese açık okuma alanı (`https://cdn.yetkin.ai` gibi, yolsuz kök).
2. Vercel ve yerel ortama şu değerler: `NEXT_PUBLIC_MEDIA_BASE_URL`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, ve `R2_ENDPOINT` ya da `R2_ACCOUNT_ID`. Anahtarlar depoya yazılmaz.
3. `npm run ops:sync-media-r2 -- --apply` — 223 dosya, 1723,9 MB.
4. Dosyalar commit’teyse indeksten düşürüp o commit’i almak. Ondan sonra Git yayını Junior ses, kapak ve ısınma kasetini taşımaz.
5. `NEXT_PUBLIC_MEDIA_BASE_URL` Vercel’de dolu olduktan sonra yayına çıkmak.

Yerel geliştirme, dosyalar diskte durduğu sürece CDN’siz de çalışır. Taze klon bu üç klasörü getirmez. O makine ya dosyayı yerelde tutar ya da CDN adresini tanımlar.

Akademi mühür sesi bu kovaya konmaz. Satıştan sonra imza `academy-sealed` üzerinden verilir.

Bu turda kova yazımı yapılmadı. Anahtarlar boştu.
