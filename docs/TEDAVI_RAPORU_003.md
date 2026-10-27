# TEDAVİ RAPORU 003 — Junior katalog kapakları (`/junior`)

Tarih: 27 Ekim 2026  
Kapsam: `docs/TESPIT_RAPORU_003.md` içindeki 11 boş ve 14 yanlış matematik kapağı.  
Sınır: Ses dosyalarına, `jr_06_mat-27` … `38` emekli kopyalarına ve `private/junior/covers` adreslerine dokunulmadı. Anayasa A katmanı değişmedi.

---

## 1. Uygulanan tedaviler ve medya durumu

Yerel kuru sayım `npx tsx scripts/sync-media-to-r2.ts --covers`. Ağ yok. Manifestteki 111 JPEG’in SHA-256 özeti diskle aynı. Toplam 22.6 MB. Ses, sahne ve `private/` listede yok.

Yazma `npx tsx scripts/sync-media-to-r2.ts --covers --apply`. Kamu anahtar `media/junior/covers/{ders}.jpg`.

| Sonuç | Adet |
| --- | --- |
| Kovaya yazılan | 25 |
| Aynı bayt ve metadata olduğu için atlanan | 86 |
| İmzalı GET ile SHA-256 doğrulanan | 111/111 |

Köken düzeldi. Kenar düzeltmedi. `cdn.yetkin.ai` bu nesneleri `Cache-Control: public, max-age=31536000, immutable` ile tutuyor. Eski `?v={sha12}` adresinin bir kısmı hâlâ önceki gövdeyi veriyor. Ölçülen örnekler:

| Adres | cf-cache-status | Gövde | Manifest |
| --- | --- | --- | --- |
| `jr_06_mat-2.jpg?v=eb3cc6fc7ee5` | HIT, age 70 sn | `eb3cc6fc7ee5` | aynı (404 kapanmış) |
| `jr_06_mat-5.jpg?v=6ee27abd587e` | HIT, age ~5.6 saat | `2282d7851672` (`jr_06_mat-1`) | `6ee27abd587e` |
| `jr_06_fen-16.jpg?v=88185e4762e1` | HIT, age ~14 gün | `536fad9b7531` | `88185e4762e1` |

Ortamda Cloudflare zone purge anahtarı yok. `wrangler` oturumu da açık değil. Eski sorgu anahtarı bu turda silinemedi.

Katalog sorgusu ses kapısındaki kuşakla aynı yapıldı: `?v=v2-{sha12}`. Bu adres kenarda yoktu; ilk istek kökeni okudu. `npx tsx scripts/sync-media-to-r2.ts --covers --verify` sonucu: CDN **111/111**, durum 200, `Content-Length` gövde baytıyla aynı, SHA-256 manifest ile aynı.

Matematik rafı (26/26). `jr_06_mat-5` artık `2282d7851672` değil.

| Anahtar | Durum | Bayt | SHA-256 ilk 12 |
| --- | --- | --- | --- |
| `jr_06_mat-1` | 200 | 271830 | `2282d7851672` |
| `jr_06_mat-2` | 200 | 181242 | `eb3cc6fc7ee5` |
| `jr_06_mat-3` | 200 | 205981 | `62ec085da664` |
| `jr_06_mat-4` | 200 | 191523 | `58d10c0139c5` |
| `jr_06_mat-5` | 200 | 253534 | `6ee27abd587e` |
| `jr_06_mat-6` | 200 | 209095 | `b458728dac68` |
| `jr_06_mat-7` | 200 | 175220 | `1af232720f6f` |
| `jr_06_mat-8` | 200 | 153905 | `f0cbcd4f5cb1` |
| `jr_06_mat-9` | 200 | 136190 | `d5e8c06afc9a` |
| `jr_06_mat-10` | 200 | 163364 | `ee87f8473fa5` |
| `jr_06_mat-11` | 200 | 218224 | `6925aae3e637` |
| `jr_06_mat-12` | 200 | 210785 | `4df2ab82dd99` |
| `jr_06_mat-13` | 200 | 199914 | `dbeaae2048ef` |
| `jr_06_mat-14` | 200 | 223118 | `a539e86a132f` |
| `jr_06_mat-15` | 200 | 208959 | `3f4a378e6e74` |
| `jr_06_mat-16` | 200 | 178385 | `557d81dbb0c4` |
| `jr_06_mat-17` | 200 | 228581 | `77ff90855c2d` |
| `jr_06_mat-18` | 200 | 272221 | `c24f1a6ad875` |
| `jr_06_mat-19` | 200 | 200190 | `edab8169e52a` |
| `jr_06_mat-20` | 200 | 227328 | `f3fdaed97e5c` |
| `jr_06_mat-21` | 200 | 206075 | `a3e3e0a3ff6f` |
| `jr_06_mat-22` | 200 | 242543 | `59d103679876` |
| `jr_06_mat-23` | 200 | 222801 | `1a8d01e33d1d` |
| `jr_06_mat-24` | 200 | 251811 | `b696e0846757` |
| `jr_06_mat-25` | 200 | 170372 | `1e1d4001465c` |
| `jr_06_mat-26` | 200 | 212047 | `e4fd3b8db7d3` |

Önce 404 olan 11 anahtar (`jr_06_mat-2`, `3`, `4`, `8`, `9`, `10`, `16`, `20`, `23`, `24`, `25`) bu tabloda 200. Önce başka dersin gövdesini gösteren 14 anahtar kendi özetini taşıyor.

Kalan 85 kapak (Fen, Türkçe, İngilizce, Sosyal) aynı 111’lik kapının içinde. Ayrı tabloya dökülmedi.

Canlı `https://yetkin.ai/junior` bu kod dağıtılana kadar eski `?v={sha12}` adresini ister. O adresin zehirli kayıtları duruyor. Dağıtımdan sonra kart `?v=v2-` ister ve yukarıdaki gövdeyi alır.

---

## 2. UI ve fallback iyileştirmeleri

`LessonCover` (`components/junior/lesson-covers.tsx`) katalog kapağını basıyor. `VisualCourseCards` ve seçmeli ızgara aynı bileşeni kullanıyor.

- Manifest kaydı yoksa yalnız `FallbackLessonCover` çizilir. `<img>` yoktur.
- Kayıt varsa SVG alttadır. JPEG `opacity: 0` ve `visibility: hidden` ile yüklenir. Kırık im ve `alt` metni görünmez.
- `onLoad` ve bağlandıktan sonraki `complete && naturalWidth === 0` kontrolü (`juniorCoverDecodeFailed`) hatayı yakalar. `onError` aynı yola düşer.
- Hata olunca `<img>` kalkar, SVG kalır. Başarılı yüklemede JPEG 200 ms içinde görünür.

Yerel `http://localhost:3000/junior` (bu süreç CDN kökü kullanmıyor; JPEG’i diskten veriyor):

| Ölçüm | Sonuç |
| --- | --- |
| Tüm Dersler kapağı | 111 `<img>`, hepsi `?v=v2-`, `naturalWidth` 1280, kırık im 0 |
| `jr_06_mat-2` ve `jr_06_mat-5` kaynağı 404 yapılınca | İkisi de `<img>` kalktı, SVG kaldı, görünür kırık im 0 |
| Seçmeli sekme | 5 SVG (`jr_06_alm-1`, `fra-1`, `siyer-1`, `kod-1`, `arp-1`), kapak `<img>` 0 |

---

## 3. Doğrulama sonuçları

| Komut | Sonuç |
| --- | --- |
| `npx tsc --noEmit` | Geçti. Çıkış kodu 0. |
| `npx tsx scripts/sync-media-to-r2.ts --covers` | 111/111 yerel SHA-256. |
| `npx tsx scripts/sync-media-to-r2.ts --covers --apply` | Köken 111/111. Eski CDN sorgusu 25 adreste sapıktı; bu yüzden katalog `v2-` oldu. |
| `npx tsx scripts/sync-media-to-r2.ts --covers --verify` | CDN `?v=v2-` 111/111, 200, bayt ve SHA-256. |
| `npm run verify:junior-audio-cdn` | Geçti. Kapak: 111 manifest anahtarı 200, Content-Length ve SHA-256. Çıkış kodu 0. Uyarı: 11. |
| `npx vitest run` | 392 dosya geçti. 2 test paralel yükte zaman aşımına düştü (`junior-checkout`, `junior-faz37-policy`). Vitest işçisi `onTaskUpdate` zaman aşımı da yazdı. |
| Aynı iki dosya ve kapak testleri tek başına | 5 dosya, 83 test geçti. `junior-faz37-policy` içindeki zaman aşımına düşen madde 2235 ms’de geçti. |

Kapıdaki 11 uyarı `docs/TEDAVI_RAPORU_002.md` ile aynı sestir. Bu turda yeniden yazılmadı:

- Fen, Türkçe, sosyal ve `jr_06_ing_main-20` boyut sapması.
- Seçmeli açılış sesleri kamu yolda 404.
- Kilitli `jr_06_mat-5` ve `jr_06_mat-14` sesi kamu yolda 200.

Kapak sapması artık uyarı değildir. Manifest kapağından biri 404 veya gövdesi farklıysa `verify:junior-audio-cdn` çıkış kodu 1 verir. `npm run build` ve GitHub CI bu komutu çalıştırır.

---

## 4. CEO onay isteği

Phase 2 kapak tedavisi teslim edildi. 111 kamu kapak kökeni manifest ile aynı. Katalog adresi `?v=v2-{sha12}`. Dağıtım kapısı bu adresi 200 ve SHA-256 ile kilitliyor.

Onaya sunulan hükümler:

1. Bu kod dağıtılmadan `https://yetkin.ai/junior` eski sorguyu ister. Zehirli kenar kaydı ancak dağıtımla ya da zone purge ile kalkar. Purge anahtarı bu ortamda yok.
2. `jr_06_mat-27` … `38` kovada duruyor. Silme ayrı turda.
3. Ses boyutu sapması ve kilitli sesin kamu 200’ü bilinçli olarak duruyor.
