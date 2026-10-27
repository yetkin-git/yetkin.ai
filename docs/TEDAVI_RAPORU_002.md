# TEDAVİ RAPORU 002 — Junior oynatıcı ve CDN (`jr_06_mat-1`)

Tarih: 27 Ekim 2026  
Kapsam: `docs/TESPIT_RAPORU_002.md` içindeki anlatı tıkanıklığı.  
Sınır: Anayasa A katmanına, ödeme motoruna ve kilitli derslerin silinmesine dokunulmadı.  
Yöntem: yerel mühür yeniden okundu, yalnız bu dersin iki kamu nesnesi kovaya yazıldı, oynatıcı ret’i ekrana bağlandı, dört açılış dersi derleme kapısına alındı.

---

## 1. Uygulanan tedaviler ve medya durumu

Yerel `public/media/junior/audio/jr_06_mat-1.mp3` manifest ile aynıdır.

| Alan | Değer |
| --- | --- |
| Bayt | `11994285` |
| SHA-256 | `470c692ac745c3c9c41b7225a512c493ad3691842eb6f567c00c6500594a6467` |

Kapak `public/media/junior/covers/jr_06_mat-1.jpg` kapak manifesti ile aynıdır: `271830` bayt, SHA-256 `2282d7851672fb5e76d1f214f5034d264aaf1ed1eaf1b134e703c31ee05ca9a4`.

Yükleme `npx tsx scripts/sync-media-to-r2.ts --apply --only=jr_06_mat-1` ile yapıldı. Kuru sayım iki kamu anahtarı gösterdi; `private/junior` kopyası üretilmedi. Sonuç: yüklendi 2, atlandı 0, indirip SHA-256 doğrulandı 2/2.

Canlı HEAD (27 Ekim 2026, 20:02 UTC):

| Adres | Durum | Content-Length | Content-Type |
| --- | --- | --- | --- |
| `https://cdn.yetkin.ai/media/junior/audio/jr_06_mat-1.mp3` | **200** | `11994285` | `audio/mpeg` |
| Aynı adres `?v=v2-470c692ac745` | **200** | `11994285` | `audio/mpeg` |
| `https://cdn.yetkin.ai/media/junior/covers/jr_06_mat-1.jpg` | **200** | `271830` | `image/jpeg` |
| `https://cdn.yetkin.ai/media/junior/audio/jr_06_fen-1.mp3` | **200** | `16497645` | `audio/mpeg` |
| `https://cdn.yetkin.ai/media/junior/audio/jr_06_turkce-1.mp3` | **200** | `16325805` | `audio/mpeg` |
| `https://cdn.yetkin.ai/media/junior/audio/jr_06_sosyal-1.mp3` | **200** | `15555885` | `audio/mpeg` |

Fen, Türkçe ve sosyal açılışları zaten 200 dönüyordu. Manifest baytları sırasıyla `16152045`, `16128045`, `15394605`. Canlı nesne daha büyük. Bu üç dosya yeniden yazılmadı; çalan dersin sesi değiştirilmedi.

Dağıtım kapısı `npm run verify:junior-audio-cdn` (`--cdn-openers`) oldu. `npm run build` ve GitHub CI bu komutu çalıştırır. Dört açılış (`jr_06_mat-1`, `jr_06_fen-1`, `jr_06_turkce-1`, `jr_06_sosyal-1`) 200 olmadan çıkış 1’dir. Matematik kapısının `Content-Length` değeri manifest baytıyla aynı olmalıdır. Kapak `jr_06_mat-1.jpg` 200 olmalıdır. Fon müziği 200 olmalıdır.

Kapı bu turda geçti ve 11 uyarı yazdı. Uyarılar derlemeyi düşürmez:

- Fen, Türkçe, sosyal ve `jr_06_ing_main-20` boyut sapması.
- Seçmeli açılışlar `jr_06_ing-1`, `jr_06_alm-1`, `jr_06_fra-1`, `jr_06_siyer-1`, `jr_06_kod-1`, `jr_06_arp-1` kamu yolda 404.
- Kilitli `jr_06_mat-5` (`8817645` bayt) ve `jr_06_mat-14` (`11667885` bayt) kamu yolda 200.

Tam denetim `npm run verify:junior-audio-cdn-full` (`--cdn`) duruyor. Aynı satırlar orada çıkış kodunu 1 yapar. Kilitli nesneler bu turda silinmedi.

---

## 2. Oynatıcı UX ve state

`JuniorPilotPlayer` içinde `voiceNotice` eklendi. `play()` ret’i `lib/junior/pilot-play-error.ts` içinde ikiye ayrılır.

| Ret | Ekran |
| --- | --- |
| `NotAllowedError`, `AbortError` | Düğme `▶ Oynat` kalır. Sonraki tıklama yeniden dener. |
| `NotSupportedError`, `error.code === 4`, `networkState === 3`, diğer retler | `JUNIOR_VOICE_PREPARING_LABEL` («Ses hazırlanıyor.») durum satırında ve düğmede görünür. Saat `0:00` yerine `–:–` olur (`data-junior-elapsed="held"`). |

`<audio onError>` aynı hazırlık yazısını doldurur. Kaynak gelip `play` olayı düşünce yazı temizlenir. Mühürlü derste `speechSynthesis` yedeği açılmaz. `startNarration`, `togglePlay` ve `replayFromStart` aynı `settlePlay` yolunu kullanır.

Bu oynatıcı kodu henüz canlı sürüme çıkmadı. Canlı sayfa `https://yetkin.ai/junior/ders/jr_06_mat-1` açıldı; ısınma sürerken `▶ Oynat` kilitliydi. Anlatı tıklaması bu oturumda tamamlanmadı. Oynatıcının istediği önbellek damgalı adres HEAD ile 200 döndü.

---

## 3. Doğrulama sonuçları

| Komut | Sonuç |
| --- | --- |
| `npx tsc --noEmit` | Geçti. Çıkış kodu 0. |
| `npx vitest run tests/kernel/junior-pilot-play-error.test.ts tests/kernel/junior-audio-manifest.test.ts tests/kernel/junior-player-clock.test.ts tests/kernel/junior-mat-5-contract.test.ts tests/kernel/junior-faz37-policy.test.ts` | Geçti. 5 dosya, 49 test. |
| `npm run verify:junior-audio-cdn` | Geçti. Dört açılış 200. 11 uyarı. Çıkış kodu 0. |
| `npm run verify:api-auth -- --check` | Geçti. 77 rota: oturum 49, kamu 21, yönetici 3, webhook 4. |
| `npx vitest run` (birinci tam koşu) | 394 dosya, 1915 test geçti. Süreç çıkışı 1: vitest işçisi `onTaskUpdate` zaman aşımı. Başarısız test yoktu. |
| `npx vitest run` (ikinci tam koşu) | 2 test paralel yükte zaman aşımına düştü (`junior-faz37-policy`, `junior-checkout`). Aynı iki dosya tek başına 30/30 geçti. |

---

## 4. CEO onay isteği

Phase 2 medya tedavisi teslim edildi. `jr_06_mat-1` anlatı dosyası ve kapağı kamu CDN’de 200.

Onaya sunulan hükümler:

1. Kovaya yalnız `media/junior/audio/jr_06_mat-1.mp3` ve `media/junior/covers/jr_06_mat-1.jpg` yazıldı. Kilitli önek açılmadı.
2. Derleme kapısı dört ücretsiz açılışın 200’ü, matematik bayt mührü ve matematik kapağıdır. Tam bayt denetimi ayrı komutta durur.
3. Fen, Türkçe ve sosyal açılışlarının canlı boyutu manifestten büyüktür. Bu turda değiştirilmedi.
4. `jr_06_mat-5` ve `jr_06_mat-14` kamu yolda duruyor. Silme için ayrı onay gerekir.
5. «Ses hazırlanıyor.» metni bir sonraki uygulama dağıtımında canlı oynatıcıya girer. Ses nesnesi şimdiden CDN’dedir.

Bu rapor, dersin uçtan uca dinlendiği bir oturum kaydı değildir. Anlatının başlaması, yeni oynatıcı kodu yayına alındıktan sonra aynı sayfada doğrulanmalıdır: ısınma biter, `▶ Oynat` `⏸ Duraklat` olur, saat ilerler.
