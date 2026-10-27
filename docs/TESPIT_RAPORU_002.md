# TESPIT RAPORU 002 — Junior oynatıcı (`/junior/ders/jr_06_mat-1`)

Tarih: 2026-10-27  
Kapsam: 6. Sınıf ücretsiz pilot dersi, `▶ Oynat` tıklanınca anlatı sesinin başlamaması.  
Yöntem: oynatıcı state’i, mühür manifesti, yerel dosya, `https://yetkin.ai` ve `https://cdn.yetkin.ai` yanıtları.

## 1. Sorunun kök nedeni

Anlatı dosyası canlı kovada yok. Oynatıcı doğru kamu adresini kuruyor, tarayıcı `404` alıyor, `play()` reddediliyor ve bu ret ekrana hiç yazılmıyor. Düğme `▶ Oynat` yazısında, saat `0:00`’da kalıyor.

Canlı ders sayfasında (`https://yetkin.ai/junior/ders/jr_06_mat-1`) HTML5 öğesinin kaynağı:

`https://cdn.yetkin.ai/media/junior/audio/jr_06_mat-1.mp3?v=v2-470c692ac745`

Isınma bittikten sonra (`data-junior-warmup-gate="scene"`) düğme etkindi, zaman çubuğu `0` idi. Öğenin durumu:

| Alan | Değer |
|---|---|
| `HTMLMediaElement.error.code` | `4` (`MEDIA_ERR_SRC_NOT_SUPPORTED`) |
| `networkState` | `3` (`NETWORK_NO_SOURCE`) |
| `readyState` | `0` |
| `paused` | `true` |
| `currentTime` | `0` |
| `play()` | `NotSupportedError` — `The element has no supported sources.` |

Bu `play()` çağrısı, `▶ Oynat` düğmesinin bağlandığı fonksiyonun birebir yaptığı çağrıdır.

### State

`components/junior/pilot-player/JuniorPilotPlayer.tsx`

- `playing` yalnız `true` / `false` tutulur (`setPlaying`, satır 262). Eksik kaynak için ayrı bir hata state’i yoktur.
- `togglePlay` (satır 431–455) `audio.play()` reddini yakalar ve `setPlaying(false)` yapar. Mesaj, konsol izi veya «Ses hazırlanıyor.» yoktur.
- Aynı yutma `startNarration` içindedir (satır 412–424). Isınma bitince anlatı bu yolla da açılır; kaynak yoksa o çağrı da sessizce düşer.
- `<audio>` (satır 557–584) `onPlay` / `onPause` / `onEnded` dinler. `onError` yoktur. `MEDIA_ERR_SRC_NOT_SUPPORTED` React state’ine girmez.
- Düğme yazısı yalnız `playing` ve `complete` üzerinden kurulur (satır 797). İkisi de `false` kalınca etiket `▶ Oynat` olur. Saat `currentTimeMs` `0`’da kalır çünkü `requestAnimationFrame` döngüsü `playing === true` iken çalışır (satır 335–360).

Ücretsiz ders imzalı adrese düşmez. `juniorWebPlaybackMedia` (`lib/junior/media-grant.ts`, satır 142–144) katalog kilidi yokken `audioUrl: null` döner. Oynatıcı o zaman `juniorLessonAudioSrc` ile kamu yolu kurar (`JuniorPilotPlayer.tsx` satır 274–275). Canlı öğe bu yolu kullanıyor; grant dalı sapmıyor.

Isınma sırasında düğme ayrıca kilitlidir (`controlsLocked` / `narrationHold`, satır 794). Bu kilit, ısınma videosu ekrandayken tıklamayı yutar. Isınma CDN’de durduğu için video açılır, kilit kalkar, sonra anlatı `404`’e çarpar. Bildirilen «etkin `▶ Oynat` sesi başlatmıyor» hali bu ikinci adımdır.

Yerel `http://localhost:3000` aynı bileşenle aynı sorgu damgalı dosyayı `200` alınca anlatıyı sürdürür (`paused: false`, süre `299.799` sn, saat ilerler). State makinesi, dosya geldiğinde kilitli kalmıyor.

## 2. Medya yolu ve manifest durumu

Manifest kaydı (`lib/junior/audio-manifest.generated.ts`, satır 5):

- SHA-256: `470c692ac745c3c9c41b7225a512c493ad3691842eb6f567c00c6500594a6467`
- Bayt: `11 994 285`
- Zaman çizelgesi: `packages/junior-content/timelines/jr_06_mat-1.timeline.json` → `publicPath` `/media/junior/audio/jr_06_mat-1.mp3`, `durationMs` `299799`

Yerel dosya `public/media/junior/audio/jr_06_mat-1.mp3`:

- Var, `11 994 285` bayt
- SHA-256 manifest ile aynı
- `http://localhost:3000/media/junior/audio/jr_06_mat-1.mp3?v=v2-470c692ac745` → `200`, `Content-Type: audio/mpeg`, `Content-Length: 11994285`

Oynatıcı hash’i çalmadan önce okumaz. `?v=v2-` damgası önbellek kırma içindir (`lib/junior/voice.ts`, satır 138–153). Üretimde `resolvePublicMediaUrl` (`lib/media/public-url.ts`, satır 47–55) bu yolu `NEXT_PUBLIC_MEDIA_BASE_URL` köküne bağlar. Canlı kök `https://cdn.yetkin.ai`.

Canlı yanıtlar (2026-10-27, HEAD ve Range GET):

| Adres | Durum |
|---|---|
| `https://cdn.yetkin.ai/media/junior/audio/jr_06_mat-1.mp3` | **404** (`text/plain`, Cloudflare) |
| Aynı adres `?v=v2-470c692ac745` | **404** |
| `https://yetkin.ai/media/junior/audio/jr_06_mat-1.mp3` | **404** (`x-matched-path: /_not-found`). `public/media/junior/audio/` Vercel paketine girmez (`lib/media/offload.ts`). |
| `https://cdn.yetkin.ai/media/junior/warmup/jr_06_mat-warmup.mp4` | **200**, `4 825 508` bayt |
| `https://cdn.yetkin.ai/media/junior/audio/bgm-light-learning.mp3` | **200** |
| `https://cdn.yetkin.ai/media/junior/audio/jr_06_fen-1.mp3` | **200** |
| `https://cdn.yetkin.ai/media/junior/audio/jr_06_turkce-1.mp3` | **200** |
| `https://cdn.yetkin.ai/media/junior/audio/jr_06_sosyal-1.mp3` | **200** |
| `https://cdn.yetkin.ai/media/junior/covers/jr_06_mat-1.jpg` | **404** |

Hash uyuşmazlığı yok: canlıda karşılaştırılacak nesne yok. Ücretsiz açılış anahtarı `jr_06_mat-1` kamu kovaya yazılmalı (`lib/media/r2-plan.ts`, `storageObjectKeysFromDiskRelative`). Kilitli derslerin kamu `404`’ü bu raporun konusu değildir; İngilizce açılışı `jr_06_ing_main-20` olduğu için `jr_06_ing_main-1` kamu yolunda durmaz.

`production-seal.ts` oynatma anında hash doğrulamaz. Mühür, fırın ve `verify:junior-audio-cdn` içindir. Bu dersin kaydı yerelde geçerlidir; dağıtılan nesne eksiktir.

## 3. Cursor önerisi ve sonraki plan

Yapılacak iş oynatıcıyı yeniden yazmak değildir. Mühürlü dosyayı kamu anahtarına koymak ve sessiz `play()` ret’ini görünür kılmaktır.

1. Yereldeki `jr_06_mat-1.mp3` dosyasını, bayt ve SHA-256 manifest ile yeniden doğrulayıp `media/junior/audio/jr_06_mat-1.mp3` kamu anahtarına yüklemek. Kilitli dersleri bu öneke açmamak. Yüklemeden sonra HEAD `200` ve `Content-Length: 11994285` olmalı. Aynı senkron turunda `404` veren `media/junior/covers/jr_06_mat-1.jpg` kapağını da koymak.
2. Mevcut `verify:junior-audio-cdn` kapısını ücretsiz açılış için dağıtım öncesi zorunlu tutmak. `jr_06_mat-1` nesnesi yokken üretim yeşil sayılmamalı. Fon müziği ve fen/türkçe/sosyal açılışları kovada durduğu için kova erişimi sağlam; eksik olan bu dersin nesnesidir.
3. `JuniorPilotPlayer` içinde `play()` ret’ini ayırmak. `NotAllowedError` sonraki kullanıcı tıklamasında yeniden denensin. `NotSupportedError` ve `error.code === 4` için mevcut `JUNIOR_VOICE_PREPARING_LABEL` («Ses hazırlanıyor.») görünsün; saat `0:00`’da, düğme yine `▶ Oynat` diye kalmasın. Mühürlü derste tarayıcı konuşmasına (`speechSynthesis`) düşülmez; `use-junior-playback.ts` bu ayrımı zaten yapar, pilot oynatıcı yapmaz.
4. `<audio onError>` ile aynı hata state’ini doldurmak. Isınma videosu `200` iken anlatı `404` ise çocuk ısınmayı görür, sonra sessiz bir `▶ Oynat` bulur; bu ayrım ekranda durmalıdır.
5. Düzeltmeden sonra aynı sayfada: ısınma biter, `▶ Oynat` `⏸ Duraklat` olur, `currentTime` ilerler, süre yaklaşık `299.8` sn kalır, sahne saati (`reduceSceneState`) bu saatle yürür.

Bu turda kod ve kova değiştirilmedi. Rapor tespittir.
