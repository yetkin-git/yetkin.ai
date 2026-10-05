# Ses yüklenemedi — tespit raporu

| Alan | Değer |
|------|--------|
| Tarih | 5 Ekim 2026 |
| Sayfa | `https://yetkin.ai/academy/03_social_media_ai/oyna` |
| Belirti | Oturumsuz ilk ders çalar. `yapinet360@gmail.com` ile açılınca sol altta «Ses yüklenemedi, metin modunda devam et» yazar, süre `00:00` kalır. |
| Bu tur | Yalnız tespit. Kod değişmedi. |

## Kısa hüküm

Anonim ziyaretçi sesi sayfanın içine gömülü adresten alır. Bu adres Supabase üzerindeki özel `academy-sealed` kovasının 4 saatlik imzalı linkidir. Aynı dağıtımda bu link `200` döner, gövde `audio/mpeg` dir, boyutu 14.209.005 bayttır.

Super Admin ve lisansı olan müşteri bu gömülü adresi almaz. Oynatıcı tarayıcıdan `GET /api/academy/courses/03_social_media_ai/audio-grant?lesson=03_social_media_ai-1` ister. Bu çağrı başarılı bir `src` getirmezse ekrandaki cümle basılır ve ses etiketi hiç kurulmaz. Saat bu yüzden `00:00` da kalır.

Oturum açmak tek başına yolu değiştirmez. Yolu değiştiren, sayfanın «bu kişi oynatıcıyı tam açabilir» demesidir. Super Admin bu kapıdan her zaman geçer. Lisansı olmayan müşteri ilk dersi anonimle aynı gömülü adresten dinlemeye devam eder.

## 1. Oynatıcı sesi nereden istiyor?

Sayfa `app/academy/[slug]/oyna/page.tsx`. Ses etiketi `components/academy/lesson-media-player.tsx` içindedir.

İki dal vardır.

**Dal A — ödeme duvarı.** Oturum yoktur, ya da oturum vardır ama eğitim lisansı yoktur ve kişi Super Admin değildir. Sayfa sunucuda `loadAcademyFreePreviewAudioGrants` çağırır. Bu fonksiyon yalnız ilk ders için kısa ömürlü adres üretir. Adres `freePreviewAudio` ile oynatıcıya verilir. `paywallLocked` açıkken oynatıcı bu adresi `grantedSrc` olarak kullanır ve grant kapısını çağırmaz.

Canlı anonim HTML bu adresi taşıyor:

`https://mflgqedoocqpxmtryvca.supabase.co/storage/v1/object/sign/academy-sealed/03_social_media_ai/03_social_media_ai-1/v355200.mp3`

Fon yatağı aynı klasörde `v355200.bed.mp3` dir. `?v=355200` damgası ders saatindeki `cacheV` değeridir. Nesne yolu `03_social_media_ai/03_social_media_ai-1/v355200.mp3` olur.

**Dal B — tam oynatıcı.** `hasAcademyOynaAccess` doğrudur. Super Admin için bu, doğrulanmış `yapinet360@gmail.com` kutusudur; satın alma satırı aranmaz. Lisanslı müşteri için yürürlükteki ticari kayıttır. Bu dalda `paywallLocked` kapalıdır, `freePreviewAudio` sayfaya konmaz. Oynatıcı şu adresi çağırır:

`/api/academy/courses/{eğitim-slug}/audio-grant?lesson={ders-anahtarı}`

Sosyal medya ilk dersinde slug `03_social_media_ai`, ders anahtarı `03_social_media_ai-1` dir. Kapı `app/api/academy/courses/[id]/audio-grant/route.ts`. Kenar kaydı `session` dir; çerezsiz istek içeri girmez.

Cümle `lib/copy/sen-voice/academy.ts` içinde `listen.failTextMode` durur. Oynatıcı bunu yalnız `grantDenied` iken basar. `grantDenied`, grant çağrısı HTTP olarak başarısızsa ya da gövdede `data.src` yoksa true olur. Ses dosyasının kendisi sonradan hata verirse başka cümle basılır: «Bu dersin mühürlü ses kaydı henüz yok…». Canlıdaki kısa cümle, dosya 403’ü değil, grant kapısının sonuçsuz kalmasıdır.

## 2. Üretimde dosya nereden okunur, oturumlu istek neden düşer?

Yayın MP3 Vercel diskinden çalınmaz. `ACADEMY_MEDIA_READ` boşken ve `NODE_ENV` production iken `resolveAcademyMediaRead` sonucu `storage` olur. Açık `storage` da kovayı seçer. Açık `local` site yolunu seçer; üretimde bu değer koyulmamalıdır.

Kova adı `academy-sealed`. Eski `lesson-audios` kovasına yazılmaz. İmza sunucuda servis anahtarı ile üretilir (`lib/academy/academy-sealed-storage.ts`). Tarayıcıya anahtar gitmez. Adres 4 saat yaşar (`ACADEMY_AUDIO_GRANT_TTL_SEC`).

Site yolu `/media/academy/audio/...` ayrıca kenardadır (`proxy.ts`). `g` imzası yoksa cevap `403` ve düz metin «Bu ders sesi satın alma sonrası açılır.» olur. Canlıda imzasız

`/media/academy/audio/03_social_media_ai/03_social_media_ai-1.mp3`

bu 403’ü verdi. Anonim oynatıcı bu yola hiç gitmedi; kovadaki imzalı linke gitti ve `200` aldı.

Grant kapısı dosyayı taşımaz. Satın alma veya Super Admin kapısı geçildikten sonra aynı kova adresini JSON içinde döndürür: `{ data: { src, bedSrc } }`. Üretemezse `503` ve «Ders sesi şu an açılamıyor.» Lisans yoksa ve kişi Super Admin değilse `403` ve «Satın alma tamamlanmadan ders sesi açılmaz.» Ders mühürlü değilse `404`. Çerez kenarda doğrulanmazsa `401` ve «Oturum gerekli.»

Çerezsiz canlı çağrı ölçüldü: `401`, gövde `Oturum gerekli.`

Ekran bu kodları ayırmaz. `401`, `403`, `404`, `503` ve `500` hepsi aynı cümleye iner. Ses etiketi kurulmadığı için geçen süre `00:00` kalır.

Super Admin’in sayfayı tam oynatıcı olarak görmesi, sunucudaki oturumun admin kapısını geçtiğini gösterir. Aynı oturumun tarayıcıdan grant kapısına giden isteği sonuçsuz kalmaktadır. Kod, doğrulanmış bu kutu için `hasPurchased` kapısını admin muafiyetiyle açık tutar. Muafiyet geçse bile imza boş dönerse cevap `503` olur. Sayfa çizimi aynı dağıtımda aynı nesneyi imzalayabildi; kova ve servis anahtarı sayfa fonksiyonunda duruyor. Kırılan yer, tam oynatıcının bu hazır adresi kullanmaması ve ikinci isteğe kalmasıdır.

Lisansı olmayan oturumlu müşteri Dal A’da kalır. İlk dersi anonimle aynı gömülü adresten dinler. Dal B’ye lisanslı müşteri ve Super Admin düşer. İkinci ve sonraki derslerin sesi zaten yalnız Dal B’dedir; onlar da aynı grant kapısına bağlıdır.

## 3. Ne düzelmeli?

Tam oynatıcı açılırken, ödeme duvarındaki gibi sunucuda kısa ömürlü kova adresi üretilip oynatıcıya `grantedSrc` / `grantedBedSrc` olarak verilmelidir. Oynatıcı bu adres doluyken grant kapısını çağırmaz. İlk kare, anonim dersle aynı `academy-sealed` nesnesinden çalar.

Bu üretim yalnız ilk derse sıkışmamalıdır. Super Admin ve lisanslı müşteri açık olan her mühürlü ders için aynı imzayı almalıdır. Fon yatağı konuşmadan ayrı mühürlüyse onun adresi de birlikte gelmelidir. Biri boşsa oynatıcı susar; bugün grant kapısı da yatak boşsa bütün cevabı `503` yapar.

Grant kapısı, süre dolunca adresi yenilemek için durabilir. O kapı Super Admin ve yürürlükteki lisans için `data.src` döndürmelidir. Dönüş, anonim sayfadaki gibi `academy-sealed/.../v{cacheV}.mp3` imzalı link olmalıdır.

Şunlar sesi açmaz:

- Üretimde `ACADEMY_MEDIA_READ=local` koymak. Oynatıcı site yoluna iner. Kenar imzasız istekte `403` verir. Vercel diski yayın kaynağı değildir.
- `/media/academy/audio/...` dosyasını oynatıcıya çıplak bağlamak.
- Eski `lesson-audios` kovasına yazmak.

Kontrol: anonim ilk ders çalmaya devam etmeli. Aynı derste Super Admin oturumunda ağ kaydında ya gömülü kova adresi ya da `200` dönen `audio-grant` görünmeli. `00:00` ilerlemeli. Lisanslı müşteride ders 2 ve sonrası da aynı kova adresinden çalmalı. Lisansı olmayan oturumlu müşteride ilk ders yine çalmalı, ders 2 duvarda kalmalıdır.
