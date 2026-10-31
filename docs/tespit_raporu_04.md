# Tespit Raporu 04 — Junior oynatıcı cihaz kırılması (responsive CSS)

Tarih: 2026-10-31
Kapsam: Junior ders oynatıcısının canlı bileşen ağacı, sahne çizicileri, oynatıcı kabuğu, kök stil katmanı ve kapı testleri.
Bildirim: ASUS notebook + Super Admin görünümünde Junior 6. sınıf sahnesi düzgün; Samsung Chrome + `ustaders.proje@gmail.com` istemcisinde görseller, tablolar ve metinler üst üste biniyor, okunamıyor.

> **Yöntem sınırı (önce bu okunsun).** Bu turda hiçbir tarayıcı açılmadı, hiçbir cihaz ölçülmedi. `getBoundingClientRect`, `elementFromPoint`, Lighthouse veya CLS çıktısı üretilmedi. Aşağıdaki her madde **kaynak kodun satır satır okunmasıyla** çıkarıldı; her biri "kanıt" (dosya:satır) ve "güven" (kesin / kuvvetle muhtemel / hipotez) etiketiyle yazıldı. Hesapla bulunan piksel değerleri **ölçüm değil aritmetiktir** ve ±20px hata payı taşır.

Taranmayan yollar: `archived/`, `yetkin_muze/`, `node_modules/` (yalnız Tailwind'in kendi kaynağı, `@container` semantiğini doğrulamak için okundu), `public/media/`, `.next/`.

Bu dosya, aynı isimle duran önceki taslağın **bağımsız doğrulama sonrası yeniden yazımıdır**. Önceki taslağın iki iddiası kaynakla uyuşmadığı için düşürüldü; ayrıntısı §6 "Doğrulama günlüğü"nde.

---

## Özet

| Soru | Cevap |
|---|---|
| Kırılma gerçek mi? | Kodda kırılmaya açık **dokuz bağımsız mekanizma** var (dizin aşağıda). Hepsi "geniş/dik ekranda görünmez, dar/kısa ekranda patlar" türünden. |
| Tek bir suçlu var mı? | Hayır. Üç katman birlikte çalışıyor: (1) sahne yüksekliğinin cihazdan bağımsız bir sözleşmesi olmaması, (2) mutlak `min-h` tabanlarının viewport'u hiç okumaması, (3) `min-h-0` + `overflow-hidden` + `justify-center` üçlüsünün taşan içeriği kardeş kutusuna bindirmesi. |
| En sert kanıt hangisi? | `sm:min-h-[28rem]` = **448px mutlak taban**. CSS görüntü alanı yüksekliği ~552px'in altına düşen **her** istemcide oynatıcı, kendisine ayrılan alandan büyük olur. Yatay telefonda (örn. 640×360) 360px'lik viewport'a 448px oynatıcı konur. |
| Neden ASUS'ta görünmüyor? | ASUS'un CSS viewport yüksekliği ~900px üzeri: `min-h` tabanları hiç devreye girmiyor, sahneye ~580px kalıyor. |
| Neden Samsung'da patlıyor? | Ölçek/tarayıcı UI payı CSS yüksekliğini ~500-530px'e indiriyor; `calc` sonucu `min-h-[28rem]`'in altına düşüyor, taban kazanıyor, oynatıcı viewport'tan taşıyor; kalan sahne tuvali ~260px'e inince `min-h-[300px]` mutlak katmanları kırpılıyor ve flex/grid çocukları kardeşlerinin üstüne taşıyor. |
| "Tablo" ne? | Junior oynatıcısında **HTML `<table>` yok** (doğrulandı: `components/junior` altında tek bir `<table` eşleşmesi yok). Çocuğun tablo gördüğü yerler CSS grid (`FactorMultipleStage`, `SummaryPromptStage`), SVG (`MarbleTrayStage`) ve flex kutular (`DetectiveBoardStage`). Yani `overflow-x-auto` tablo reçetesi bu yüzeye doğrudan uygulanmaz; kırılma **kapsayıcı ve yükseklik bütçesi** düzeyinde. |
| Düzeltmeyi zorlaştıran şey? | `tests/kernel/junior-player-clock.test.ts` hatalı `min-h-[300px]` dizgesini **5 yerde literal** olarak doğruluyor. Ayrıca `app/globals.css` içinde sahneye ait **tek bir** `data-junior-*` kuralı yok; sözleşme denetlenemiyor. |

### Kırılma mekanizmaları dizini

| # | Mekanizma | Kanıt | Güven |
|---|---|---|---|
| M1 | `sm:min-h-[28rem]` (448px) mutlak taban `calc(100dvh-6.5rem)`'i eziyor | `JuniorLessonEngine.tsx:114` | kesin |
| M2 | `6.5rem` bütçesi gerçek kromu (112px) ve koşullu uyarı bantlarını saymıyor | `JuniorLessonEngine.tsx:114`, `page.tsx:197-212` | kesin |
| M3 | `min-h-[300px]` absolute katmanlar (10 yer / 6 dosya) sahne 300px altına inince kırpılıyor | `scene-ui.tsx:190`, `scene-plate.tsx:48/58/74`, `step-art.tsx:41/265`, `vector-player.tsx:919/925`, `warmup-cassette.tsx:97/105` | kesin |
| M4 | Isınma kaseti `absolute z-10` + `min-h-[300px]` ile altyazı rayına biniyor | `warmup-cassette.tsx:97` | kesin |
| M5 | Sahne tuvalinde `overflow` **ve** `container-type` yok; taşma kırpılmadan krom şeritlerinin üstüne çiziliyor | `JuniorPilotPlayer.tsx:697-703` | kesin |
| M6 | `min-h-0` + `overflow-hidden` + `justify-center` üçlüsü içeriği kardeşine taşırıyor (4 sahne) | `ConceptListStage.tsx:42`, `SummaryPromptStage.tsx:49`, `GraphicOpStage.tsx:227`, `:434`, `:493` | kesin |
| M7 | `@container/tile` **inline-size** olduğu için `46cqh` viewport yüksekliğine çözülüyor; rakam karoya sığmıyor | `DetectiveBoardStage.tsx:70`, `:87` | kesin |
| M8 | `aspect-square h-[68%] w-auto` belirsiz ebeveynde çöküyor | `DetectiveBoardStage.tsx:212`, `:224` | kesin |
| M9 | Sahne metinlerinde `overflow-wrap` yok; uzun Türkçe kelime dar kolonda yatay taşıyor | `GraphicOpStage.tsx:188`, `ConceptListStage.tsx:58`, `SummaryPromptStage.tsx:66` | kesin |

Bunlara eşlik eden üç **yapısal** sorun (kırılmayı üretmez, düzeltmeyi ve teşhisi zorlaştırır): `data-junior-*` sözleşmelerinin CSS karşılığı yok (§1.6), kapı testleri kırılmayı literal dizgeyle koruyor (§2.6), Playwright'ta cihaz matrisi yok (§2.2).

---

## ADIM 1 — CSS layout ve kırılma (overlap) analizi

### 1.1 Yükseklik bütçesi: üç ayrı `min-h` tabanı ve tek bir sihirli sayı

Oynatıcı kabuğunun yüksekliği, dağınık dört sayıya bağlı:

```111:115:components/junior/lesson-engine/JuniorLessonEngine.tsx
        <div
          data-junior-player-shell=""
          className="flex h-[52dvh] min-h-[20rem] w-full min-w-0 flex-col sm:h-[min(48rem,calc(100dvh-6.5rem))] sm:min-h-[28rem]"
        >
```

Bu tek satırda **dört** ayrı yükseklik iddiası var: `52dvh`, `20rem` (320px), `min(48rem, 100dvh-6.5rem)`, `28rem` (448px). Kritik olan sonuncusu:

> `min-height`, `height`'ı **her zaman** yener. Yani `sm:` dalında gerçek formül `max(448px, min(768px, 100dvh - 104px))`'dir.

Bunun doğrudan sonucu:

| CSS viewport yüksekliği | `calc(100dvh-6.5rem)` | `min-h-[28rem]` kazanır mı? | Oynatıcı gerçek yüksekliği | Oynatıcıya kalan alan (−112px) | Durum |
|---|---|---|---|---|---|
| 1080 (1920×1080, %100) | 976 | hayır (`min(768,976)=768`) | **768** | 968 | rahat |
| 768 (1366×768, %100) | 664 | hayır | **664** | 656 | sınırda |
| 614 (1366×768, %125) | 510 | hayır | **510** | 502 | dar |
| 533 (1280×800, %150) | 429 | **evet** | **448** | 421 | taban bütçeyi aştı (+27px) |
| 480 (1280×720, %150) | 376 | **evet** | **448** | 368 | **oynatıcı, kabından büyük (+80px, %22)** |
| 360 (yatay telefon) | 256 | **evet** | **448** | 248 | **ağır taşma (+200px, %81)** |

`h-[calc(100dvh-3rem)]` tarafı doğru (`3rem` = 48px = üst çubuk), ama oynatıcının kendi tabanı bu hesabı geçersiz kılıyor. **Güven: kesin** — sınıf dizgisi doğrudan okundu, CSS'te `min-height` önceliği tanımlı davranış.

`6.5rem` (104px) neyi kapsıyor? Gerçek tüketim şu şeritlerden geliyor: üst çubuk 48px (`header-bar.tsx:28` `h-12`, border-box) + `main` dikey padding'i 8px (`pt-1 pb-1`) + `PageHeader tight` ~44px (satır içi: `h1 text-lg leading-tight` + üç `h-8` rozet + düğme, `sm:flex-row`) + `RoomFrame` `gap-3` 12px = **112px**. Yani 6.5rem başlangıçta **8px eksik**; üstelik aynı flex kolonunda oynatıcının **üstünde** duran ve hiç hesaba katılmayan `shrink-0` bloklar var:

```197:212:app/junior/ders/[lessonKey]/page.tsx
      {narrationBand ? (
        <p className="shrink-0 text-sm font-semibold text-[var(--muted)]" data-junior-short-narration="">
          Bu anlatım 3 dakikanın altında ({Math.round(narrationBand.measuredDurationMs / 1000)} sn). Tam ders gibi durmaz.
        </p>
      ) : null}
      {electiveDraft ? (
        <section className="junior-shield-card shrink-0 rounded-xl border border-[var(--border)] p-3">
```

Bu iki uyarı bandı geldiğinde bütçeye **+32 ile +60px** daha ekleniyor, `6.5rem` sabit kaldığı için fark doğrudan sahneden düşülüyor. **Güven: kesin (varlık), kuvvetle muhtemel (px etkisi).**

`PageHeader` da sabit yükseklikte değil: başlık `text-lg` + üç adet `h-8` rozet + "Ders listesi" düğmesi, `tight` modda `sm:flex-row` ile yan yana ama `flex-wrap` ile sarıyor (`components/ui/page-header.tsx:84-87`). 640-900px arası genişlikte rozetler alt satıra inince header iki katına çıkıyor ve `6.5rem` bir anda ~40px yetersiz kalıyor.

### 1.2 Beş dosyada on yerde dondurulmuş `min-h-[300px]`

| Dosya:satır | Bağlam |
|---|---|
| `components/junior/player/scene-ui.tsx:190` | `SoftStage` SVG — `absolute inset-0 ... min-h-[300px]` |
| `components/junior/player/step-art.tsx:41`, `:265` | `Frame` SVG ve özet çerçevesi |
| `components/junior/player/scene-plate.tsx:48`, `:58`, `:74` | Plaka ve video katmanları |
| `components/junior/vector-player.tsx:919`, `:925` | Karatahta (sealed player) mutlak katmanları |
| `components/junior/player/warmup-cassette.tsx:97`, `:105` | **Isınma kaseti** kaplaması |

Bu sınıf, aynı dosyada **belgelenmiş sözleşmeyle** çelişiyor:

```34:41:components/junior/player/scene-ui.tsx
/**
 * SoftStage dikey tabanı — CSS min-height yok (zero-scroll).
 * Canlı altyazı bandı varsayılan kapalı (CC toggle).
 * Ebeveyn board 380px bandına kilitlidir; SVG o bandı `meet` ile ortalar.
 */
export const JUNIOR_STAGE_MIN_HEIGHT_PX = 0;
export const JUNIOR_STAGE_HEIGHT_PX = 0;
```

Ve bu değişmez DOM'a da basılıyor (`scene-ui.tsx:195-196`: `data-junior-stage-min-h={0}`) — yani **DOM "taban yok" diyor, sınıf "300px" diyor.** Çelişki tel üzerinde, bugün, canlı.

Kırılma mekanizması: `min-h-[300px]` bir **absolute** katmanda. Absolute öge `flex-1` paylaşımına katılmaz; ebeveyni 260px ise 300px çizer ve `overflow-hidden` sınırında **kırpılır**. Kırpma sınırı board'dır (`JuniorPilotPlayer.tsx:675`). Isınma kaseti (`warmup-cassette.tsx:97`, `z-10`) kırpılmadığı için daha kötü: `absolute inset-0` + `min-h-[300px]` ile board'dan taşar ve **altyazı rayının üstüne biner**. Kullanıcının "kaset" şikâyeti tam olarak bu. **Güven: kesin.**

### 1.3 Görünen "üst üste binme"nin asıl kaynağı: üç sınıfın birleşimi

Kırpılma tek başına "üst üste binme" gibi okunmaz. Kullanıcının tarifi **kardeş kutuların birbirinin üstüne taşması**. Desen dört sahnede birebir aynı:

> ebeveyn `flex ... min-h-0 overflow-hidden` + çocuk listesi `min-h-0` (ama `shrink-0` **yok**) + içerik toplamı kapsayıcıdan büyük ⇒ flex her çocuğu `min-h-0` yüzünden **içeriğinin altına** sıkıştırır, metin kutunun dışına taşar, taşan kısım komşu satırın üstüne biner.

**(a) `ConceptListStage` — kavram satırları birbirine biniyor**

```41:50:components/junior/pilot-player/ConceptListStage.tsx
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
        {shown.map((row, index) => {
          const tone = TONE_CLASS[row.tone] ?? TONE_CLASS.concept!;
          return (
            <div
              key={`${row.title}-${index}`}
              data-junior-concept-row={index + 1}
              data-junior-concept-tone={row.tone}
              className={`flex min-h-0 items-start gap-2 rounded-xl border px-3 py-2 ${tone}`}
```

`min-h-0` var, `shrink-0` yok, kapsayıcı `overflow-hidden`. Satır gövdesi `title` + `body` =
iki satır metin (`:57-58`, `leading-snug`). 260px'lik tuvalde 5 satır × ~56px = 280px > 260px ⇒ satırlar ~40px'e sıkışır, üçüncü satırın metni dördüncünün üstünde biter. **Güven: kesin.**

**(b) `SummaryPromptStage` — özet kartları ve "Sıra Sende" bandı**

```49:56:components/junior/pilot-player/SummaryPromptStage.tsx
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 items-stretch gap-2 sm:grid-cols-3">
```

`auto-rows-fr` satırları eşit paylaştırır ama kart içeriği (`h-8` ikon + `text-sm leading-relaxed` gövde) küçülemez. Kart `justify-center` (`:56`) olduğu için taşma **simetrik**: metin hem üstten hem alttan kart dışına çıkar; üst satırın metni alt satırın üstüne, alt satırınki `mt-2` "Sıra Sende" bandının (`:74`) üstüne biner. 5 kart / 2 kolon = 3 satır; 260px'te satır başına ~78px düşer, kart içeriği ~96px ister. **Güven: kesin.**

**(c) `GraphicOpStage` — sabit 148px kolon ve 12 satırlık değişken liste**

```201:203:components/junior/pilot-player/GraphicOpStage.tsx
    <div className="grid h-full min-h-0 grid-cols-[148px_1fr] gap-3" data-junior-graphic-op="circle-measure">
      <svg viewBox="0 0 148 160" className="h-full w-full" aria-hidden="true">
```

Sağ kolonda `justify-center` (`:227`) ile **12'ye kadar** `MeasureLine` duruyor (`:228-249`: r, relation, R, π, çevre, tur, merkez açı, yay, tam tur, yarım, dilim, pay). Her satır `text-sm font-black` (`:188`) = ~20px; 12 × 20 + 11 × 6 (gap) = **306px**. 260px'lik tuvalde taşma yine simetrik ⇒ **SVG çemberin üstüne ve dışına metin biniyor**. `MeasureLine` `break-words` taşımıyor (`:188`); `"merkez açı = 120°"` dar kolonda tek satıra sığmayınca yatayda taşar. `AngleBoard` (`:434`) ve `AreaBoard` (`:493`) aynı `flex h-full min-h-0 flex-col gap-1.5` deseninde ama `justify-center` **yok** ve `overflow` **yok** ⇒ taşma aşağı doğru, doğrudan altyazı rayının üstüne çizilir. **Güven: kesin.**

**(d) `DetectiveBoardStage` — `cqh` yanlış eksene düşüyor**

```70:70:components/junior/pilot-player/DetectiveBoardStage.tsx
      className={`${JUNIOR_DIGIT_BOX_CLASS} @container/tile relative flex min-h-0 w-full max-w-[14rem] flex-1 flex-col items-center justify-center self-stretch overflow-hidden rounded-3xl border-2 px-2 ${
```

```87:87:components/junior/pilot-player/DetectiveBoardStage.tsx
        className="mt-1 text-[clamp(2rem,46cqh,7.5rem)] font-black leading-none tracking-tight"
```

`@container/tile` sınıfı Tailwind v4'te **`container-type: inline-size`** üretir. Tailwind kaynağından doğrulandı: değer verilmediğinde `g="inline-size"` atanıyor.

```text
i.functional("@container",a=>{let g=null;if(a.value===null?g="inline-size":a.value.kind==="arbitrary"?g=a.value.value:a.value.kind==="named"&&a.value.value==="normal"?g="normal":a.value.kind==="named"&&a.value.value==="size"&&(g="size"),…o("container-type",g)…
```

Inline-size kapsayıcı **blok ekseni sorgusuna kapalıdır**. Bu yüzden `46cqh` içindeki `cqh`, karoyu değil **küçük viewport yüksekliğini** çözer:

- 1080 yükseklikte `46cqh` ≈ 497px → `clamp` üst sınırı → **120px**
- 614 yükseklikte `46cqh` ≈ 282px → yine **120px**
- 480 yükseklikte `46cqh` ≈ 221px → yine **120px**

Rakam her durumda 120px; karoya kalan yükseklik ise 200px ile ~60px arasında değişiyor. Karo `overflow-hidden` (`:70`) ⇒ 120px rakam 60px kutuya girince **ortadan kesiliyor**. "Rakamlar bozuluyor" şikâyetinin en net açıklaması bu. **Güven: kesin** (hem sınıf hem Tailwind semantiği doğrulandı).

Aynı hata ikinci kolda `aspect-square h-[68%] w-auto` ile (`:212`, `:224`): yüzde yükseklik, ebeveynin **belirsiz** yüksekliğinde çözülmez; `h-[68%]` düşer, `aspect-square` + `w-auto` kalır ⇒ kutu ya 0 genişlik ya tam genişlik olur.

> **Not — doğru örnek aynı kod tabanında var.** `FactorMultipleStage` bilinçli olarak `@container-size/*` kullanıyor (`:57`, `:76`), yani `container-type: size`. Tailwind bu değeri de destekliyor (`value.value==="size" && (g="size")`). Yani doğru desen projede mevcut; `DetectiveBoardStage` ona geçirilmemiş.

### 1.4 Sabit ölçü envanteri (taşma noktaları)

| Yer | Sabit | Neden kırılır |
|---|---|---|
| `JuniorPilotPlayer.tsx:795`, `:818` | `w-11` süre etiketleri | `font-mono text-xs` + tarayıcı yazı tipi ölçeği ⇒ `"12:34"` 44px'e sığmaz, `flex-1` zaman çubuğu sıfıra çöker |
| `JuniorPilotPlayer.tsx:684` | `truncate` sahne başlığı | Başlık kesilir; altyazıda tam metin var ⇒ başlık ile altyazı çelişir |
| `GraphicOpStage.tsx:203` | `grid-cols-[148px_1fr]` | Sabit kolon; dar tuvalde metin kolonu ~90px'e iner |
| `FactorMultipleStage.tsx:141-146` | `w-[78%]` / `w-[86%]` / `w-[93%]` | Kule basamakları yüzde ile iç içe daralır; dikey sıkışınca basamak metni kırpılır |
| `MarbleTrayStage.tsx:241-242` | `viewBox="0 0 960 280"` + `xMidYMid meet` | 260px tuvalde 280 birim ~230px'e büzülür, `fontSize 14` → efektif ~11px |
| `MarbleTrayStage.tsx:468` | `textLength={132} lengthAdjust="spacingAndGlyphs"` | Yazıyı kutuya sığdırmak için **harfleri ezer**; küçük ekranda okunamaz dize üretir |
| `MarbleTrayStage.tsx:492` | `absolute inset-x-2 bottom-2` callout | Yükseklik düşünce tepsinin alt sırasının üstüne biner |
| `quick-tools.tsx:120`, `:139`, `:161` | `w-[5.5rem]` sabit panel | `min-[480px]` altında gizleniyor, 481-640 arası sıkışıyor |
| `lesson-chain.tsx:238` | `grid-rows-[minmax(0,1fr)_9rem]` | **Sabit 9rem** faaliyet satırı; ölçekte taşar |

### 1.5 `z-index` çakışması: kural rozetleri

```274:291:components/junior/pilot-player/DetectiveBoardStage.tsx
          data-junior-rule-badges=""
          className="pointer-events-none absolute inset-x-1.5 top-1 z-20 flex flex-nowrap items-center gap-1 overflow-x-auto sm:inset-x-2 sm:top-1.5 sm:gap-1.5"
```

Rozet şeridi `absolute ... z-20`; içerik `pt-5 sm:pt-6` ile yer açıyor (`:291`). Ama açılan boşluk **rem**, rozetin kendi boyu **px** (`text-[9px]`, `text-[10px]`, `:281`). Tarayıcı kök yazı tipini büyüttüğünde boşluk büyür, rozet büyümez; tersi durumda rozet büyür (`px-2 py-0.5` rem) ve `whitespace-nowrap` ile genişleyip ilk basamak karosunun üstüne biner. Karışık birim = garanti kayma. **Güven: kuvvetle muhtemel.**

### 1.6 `data-junior-*` sözleşmelerinin CSS karşılığı yok

`app/globals.css` 6.773 satır. İçindeki `data-junior-*` seçici sayısı: **sıfır.** (`rg "data-junior" app/globals.css` → 0 eşleşme.)

Junior'a ait toplam CSS yüzeyi:

| Seçici | Satır | Ne yapıyor |
|---|---|---|
| `[data-room="junior"]` | `:154` | Oda teması |
| `[data-room="junior"] .room-atmosphere-wash` | `:176` | Atmosfer |
| `[data-room="junior"] .junior-quest` | `:180` | Kart zemini |
| `[data-room="junior"] .junior-shield-card` | `:184` | Panel |
| `@keyframes junior-*` (10 adet) | `:6541-6728` | Animasyon |
| `.junior-digit-box` | `:6745` | Yalnız `font-family` + kontrast modu |

Yani sahnenin yükseklik, kapsayıcı, tipografi ve taşma davranışı **tamamen** Tailwind sınıflarına ve inline `style`'a bırakılmış. `data-junior-stage-canvas`, `data-junior-caption-rail`, `data-junior-control-bar` bugün sadece E2E/unit seçicisi; **stil sözleşmesi değil.** Bu yüzden "sahne şu kurallara uyar" diye denetlenebilir bir cümle kuramıyoruz. **Güven: kesin.**

### 1.7 Katman sırası

```
main (h-[calc(100dvh-3rem)], px-3 pt-1 pb-1, overflow-y-auto)      app-shell-switch.tsx:45
└─ RoomFrame (studio-flow: flex flex-col gap-3 pb-6 — flex-1 YOK)   page.tsx:146-153
   ├─ (koşullu) narrationBand / electiveDraft / preparing  ← bütçede yok      page.tsx:197-212
   ├─ PageHeader (tight, flex-wrap — yüksekliği değişken)              page.tsx:158-194
   └─ LessonChain
      └─ JuniorLessonEngineShell (xl:grid — sağda QuickTools 14.5rem)  JuniorLessonEngine.tsx:109
         └─ player-shell  h-[52dvh] / min-h-[28rem]  ← sihirli bütçe     :114
            └─ ListenAndTell → VectorPlayer → JuniorPilotPlayer
               └─ cinema-stage (flex-col, overflow-hidden)                  JuniorPilotPlayer.tsx:618-625
                  ├─ üst krom (shrink-0) ~26px                              :630
                  ├─ board (flex-1 min-h-0 overflow-hidden)                 :673-680
                  │  └─ stage-canvas (flex-1 min-h-0 — overflow YOK, container YOK)  :697-703
                  │     └─ absolute inset-0 → min-h-[300px] katmanlar
                  ├─ caption rail (shrink-0, opak) ~53px                    :726-731
                  └─ control bar (shrink-0) ~68px                           :788-791
```

İki kritik not:

1. `RoomFrame`'e `studioFlow` dalında `flex-1` verilmemiş (`page.tsx:148-153`); zincir yüksekliği garanti etmiyor, `min-h-0` mirası kopuyor.
2. `xl:grid` altında (`JuniorLessonEngine.tsx:109`) ızgara satırı `stretch` olduğu için oynatıcı, sağdaki `QuickTools` sütununun yüksekliğine göre de uzayıp kısalabiliyor — yani **yan panelin içeriği sahnenin yüksekliğini değiştiriyor.** `xl` eşiği 1280px; 1366×768@%125'te CSS genişlik 1093px olur ve dal **akış** dalına düşer, ASUS'ta ise `xl` dalı çalışır. Aynı ders, iki cihazda **iki farklı yerleşim dalı**. **Güven: kesin (sınıf), kuvvetle muhtemel (hangi dalın seçildiği).**

---

## ADIM 2 — Çapraz tarayıcı ve render temizliği

### 2.1 `aspect-ratio` ve yüzde yükseklik

- `aspect-square h-[68%] w-auto` (`DetectiveBoardStage.tsx:212`, `:224`): yüzde yükseklik **belirsiz ebeveynde** çözülmez. Chromium bunu `auto` gibi ele alır; `h-[68%]` düşer, `aspect-square` + `w-auto` kalır ⇒ kutu ya 0 genişlik ya tam genişlik. Aynı sınıf dikey bütçesi bol cihazda doğru, dar cihazda bozuk çalışır. **Güven: kesin.**
- `MarbleTrayStage` `preserveAspectRatio="xMidYMid meet"` ile oranı koruyor (doğru), ama `meet` **letterbox** üretir: kısa tuvalde üstte/altta boşluk, ortada küçücük içerik. Taşma değil, okunamazlık. `textLength` + `lengthAdjust="spacingAndGlyphs"` ise yazıyı **ezerek** sığdırır (`:466-469`). **Güven: kesin.**

### 2.2 Metin sarma (`overflow-wrap`) ve `text-wrap`

- Sahne metinlerinde `overflow-wrap` yok. `ConceptListStage` gövdesi (`:58`), `SummaryPromptStage` gövdesi (`:66`), `GraphicOpStage` `MeasureLine` (`:188`) `break-words` taşımıyor. Tek uzun Türkçe kelime (`"paralelkenar"`, `"yer değiştirme"`, `"bölünebilme"`) dar kolonda yatay taşar ve komşu kartın üstüne girer. **Güven: kesin.**
- `text-wrap` yalnız `page-header.tsx` içinde (`text-pretty`). Sahne başlıkları `truncate`, gövdeler `balance` almıyor ⇒ son kelime tek başına alt satıra düşüp satır sayısını bir artırıyor; bu da `auto-rows-fr` ve `min-h-0` hesaplarını bozuyor. **Güven: kuvvetle muhtemel.**

### 2.3 Gerçek taşma vektörü: sahne tuvalinde kapsayıcı yok

```697:703:components/junior/pilot-player/JuniorPilotPlayer.tsx
          <div
            className="relative min-h-0 w-full flex-1"
            data-junior-stage-canvas=""
            data-junior-sticky-frame={stickyHold ? "true" : "false"}
            data-junior-sticky-layout={displayScene.layout}
          >
```

Bu kutuda **`overflow` yok, `container-type` yok**. İçindeki sahne bileşenleri (`ConceptListStage`, `SummaryPromptStage`, `GraphicOpStage`, `DetectiveBoardStage`, `FactorMultipleStage`) `h-full` + `flex-1` + `min-h-0` ile geliyor. `min-h-0` + ebeveynde `overflow: visible` = **taşan içerik kırpılmaz, altyazı rayının ve kontrol şeridinin üstüne çizilir.** Kullanıcının gördüğü "metinler birbirine biniyor" manzarasının geometrisi budur. Tek bir `overflow: hidden` + `container-type: size` bu vektörü kapatır; bugün ikisi de yok. **Güven: kesin.**

Buna karşılık `data-junior-zero-scroll="true"` sözleşmesi (`:570`) ilan ediliyor, ama `FactorMultipleStage.tsx:35` kendi içinde `overflow-y-auto overscroll-contain` taşıyor ve `main` de `overflow-y-auto`. Sözleşme ile uygulama çelişiyor.

### 2.4 Android'in görünmez kaydırma çubuğu

Masaüstünde `main`'in `overflow-y-auto`'su kalın scrollbar olarak görünür; kullanıcı "kaydırılabilir" olduğunu anlar. Android'de overlay scrollbar çizilmez ⇒ aynı durum **"içerik kesilmiş"** olarak okunur. `FactorMultipleStage.tsx:35`'teki iç `overflow-y-auto` da aynı şekilde görünmez. Kırpma ile kaydırma ayırt edilemediği için şikâyet "üst üste binme" olarak tarif ediliyor. **Güven: kesin.**

### 2.5 Okulistik benzeri esnek mimaride eksik olan

Doğru desen projede **var**, Junior sahnesine uygulanmamış:

| Desen | Doğru kullanım (mevcut) | Junior sahnesinde |
|---|---|---|
| `overflow-x-auto` sarmalayıcı | `academy-markdown-renderer.tsx:508-509` (`<table className="w-full …">` sarmalı) | Sahne grid/SVG katmanlarında yok |
| Her flex/grid çocuğunda `min-w-0` | `FactorMultipleStage.tsx:37` (`w-full min-w-0`) | `GraphicOpStage` `1fr` kolonunda, `ConceptListStage` satırlarında yok |
| `aspect-*` + `max-w-full` | `visual-course-cards.tsx:50` (`aspect-[16/9] max-h-36 w-full`) | `DetectiveBoardStage`'ta `aspect-square + h-[68%]` çelişkisi |
| `container-type: size` + `cq` tipografi | `FactorMultipleStage.tsx:57`, `:76` (`@container-size/*`), `:48` `cqi` | `DetectiveBoardStage.tsx:70` **inline-size** + `46cqh` |
| `max-w` üst sınırı | `RoomFrame` `cinema` → `max-w-none` (`page-header.tsx:112`) | Oynatıcıda `max-w` yok; sahne tam genişliğe yayılıyor |

Son satır önemli: sahne genişliği de sınırsız. 1920px'de aynı 12 satırlık `MeasureLine` listesi 1-2 satıra sığar, 1093px'te 8-10 satıra çıkar. ASUS'ta "tablo düzgün", Samsung'da "tablo bozuk" farkının yarısı buradan geliyor: **metin px cinsinden sabit, kutu genişliği değişken.** **Güven: kesin.**

### 2.6 Kapı testleri düzeltmeyi kilitliyor

```776:776:tests/kernel/junior-player-clock.test.ts
    expect(sceneUi).toContain("absolute inset-0 block h-full min-h-[300px] w-full");
```

```907:909:tests/kernel/junior-player-clock.test.ts
    expect(sceneUi).toContain("pointer-events-none absolute inset-0 block h-full min-h-[300px] w-full");
    expect(art).toContain("pointer-events-none absolute inset-0 block h-full min-h-[300px] w-full");
    expect(player).toContain('className="pointer-events-none absolute inset-0 h-full min-h-[300px] w-full"');
```

Ayrıca `:653` (`absolute inset-0 h-full min-h-[300px] w-full transition-opacity`). Yani **5 yerde** hatalı dizge literal olarak dondurulmuş.

İyi haber: testler aynı zamanda sabit yükseklik çözümlerini **yasaklıyor** (`:485-490`: `aspect-video w-full min-h-[300px] shrink-0`, `h-[min(380px,40dvh)]`, `max-h-[380px]`, `max-h-[min(48dvh,420px)]`, `aspect-[16/9]` — hepsi `not.toContain`). Yani niyet "esnek olmayan çözümü engelle" idi; sonuç "kırık çözümü koru" oldu.

Sınır: testler **yükseklik bütçesini dondurmuyor** (`52dvh`, `6.5rem`, `28rem` için `toContain` yok; yalnızca `:515`, `:533`, `:555`'te eski `vh` çözümlerine karşı `not.toContain` var). Yani **bütçe düzeltmesi test değişikliği gerektirmiyor**; `min-h-[300px]` kaldırması gerektiriyor. Bu ayrım iş sırasını belirler.

---

## ADIM 3 — Stratejik tavsiye ve tedavi

### 1. Sen olsan ne yapardın? İlk üç teknik hamle

**Hamle 1 — Yükseklik bütçesini tek değişkene indir ve mutlak tabanı sil.**

Bugün dört farklı sayı (`52dvh`, `20rem`, `calc(100dvh-6.5rem)`, `28rem`) aynı kutuyu tarif ediyor. Tek kaynak:

```css
/* app/globals.css — tek kaynak */
:root {
  --shell-header-h: 3rem;        /* header-bar.tsx h-12 (border-box) */
  --page-header-h: 2.25rem;      /* ResizeObserver ile gerçek değer yazılır */
  --player-chrome-h: 11.5rem;    /* krom şeritleri toplamı; ölçülür, varsayılmaz */
  --player-stage-min: 9rem;      /* tuval tabanı — 300px değil */
}

[data-junior-player-shell] {
  flex: 1 1 auto;
  height: auto;                  /* hesabı flex yapsın */
  min-height: var(--player-stage-min);
  max-height: calc(100dvh - var(--shell-header-h) - var(--page-header-h) - 1.5rem);
}
```

`min-height`'ı **448px değil 144px** yap. Tabanın işi "sahne yok olmasın"dır; "sahne her zaman 448px olsun" değil. `--page-header-h`'ü `ResizeObserver` ile gerçek yükseklikten yazarsan `PageHeader` sardığında bütçe kendini düzeltir; koşullu uyarı bantları da ölçüme dahil olduğu için 6.5rem sınıfı sihirli sayı olmaktan çıkar. `app-shell-switch.tsx:45` ve `JuniorLessonEngine.tsx:114` aynı değişkeni okur.

Kazanç: 480px yüksekliğinde oynatıcı 448px yerine ~370px olur; alt krom (altyazı + kontrol) **viewport içinde kalır** ve "içerik kesilmiş" algısı biter. Kazanç 2: `min-h` artık viewport'u ezmediği için `xl:grid` dalında sağ panelin yüksekliği de sahneyi bozamaz.

**Hamle 2 — Sahne tuvalini gerçek kapsayıcıya çevir; `min-h-[300px]`'i kaldır.**

```css
[data-junior-stage-canvas] {
  position: relative;
  min-height: 0;
  overflow: hidden;        /* ← bugün YOK; taşma buradan kaçıyor */
  container-type: size;    /* ← bugün YOK; cqh viewport'a düşüyor */
  container-name: junior-stage;
}
[data-junior-stage-canvas] :is(p, span, h4, h5) {
  overflow-wrap: anywhere;
  text-wrap: pretty;
}
[data-junior-stage-canvas] .jr-stage-text {
  font-size: clamp(0.7rem, 2.6cqh, 1rem);   /* artık gerçekten sahneye bağlı */
  line-height: 1.25;
}
```

Sonra bileşen tarafı:

- 6 dosyadaki (`scene-ui`, `step-art`, `scene-plate`, `vector-player`, `warmup-cassette`) `min-h-[300px]` **silinir**; absolute katmanlar `inset-0` + `h-full` ile zaten doğru.
- `DetectiveBoardStage.tsx:70`: `@container/tile` → `@container-size/tile`. Böylece `:87`'deki `46cqh` **karonun** yüksekliğini çözer: 60px'lik karoda rakam ~28px olur, 200px'lik karoda ~92px. Hiçbir şey kırpılmaz.
- `DetectiveBoardStage.tsx:212`, `:224`: `aspect-square h-[68%] w-auto` → `size-[min(100%,4.5rem)]` benzeri tek eksenli, belirsiz yüksekliğe bağlı olmayan ifade.
- `GraphicOpStage.tsx:203`: `grid-cols-[148px_1fr]` → `grid-cols-[minmax(6rem,34%)_minmax(0,1fr)]`; metin kolonuna `overflow-y-auto overscroll-contain` + `text-[clamp(...)]`.

Kazanç: `min-h-[300px]`'in ürettiği sessiz kırpma ve kaset kaplamasının altyazıya binmesi **yapısal olarak** imkânsız hâle gelir; `cqh` doğru eksene bağlandığı için tipografi cihazdan değil **sahneden** ölçeklenir.

**Hamle 3 — Taşma üreten üçlüyü yasakla.**

`min-h-0` + `overflow-hidden` + `justify-center` birlikte kullanıldığında içerik kaçınılmaz olarak kardeşine biner. Üç kural:

1. Kaydırılabilir liste konteynerlerinde çocuklar `shrink-0` alır, kapsayıcı `overflow-y-auto` olur: `ConceptListStage.tsx:42`, `SummaryPromptStage.tsx:49`, `AngleBoard` (`GraphicOpStage.tsx:434`), `AreaBoard` (`:493`). Alternatif (daha iyi): satır sayısına göre `text-[clamp()]` ile küçült, `shrink-0` koru.
2. `justify-center` **yalnızca** içerik kapsayıcıdan küçükken; bilinmeyen uzunlukta `justify-start` + `gap`. `GraphicOpStage.tsx:227` bu yüzden simetrik taşıyor.
3. Yüzde yükseklik + `aspect-ratio` kombinasyonu yasak; tek eksenli `size-[min(...)]` kullan.

Üçü de görüntü alanı yüksekliğine bağlı olmadığı için `%125`, `%150` ve 390px telefonda aynı davranır.

### 2. Gelecek aşamada ne yapılmalı?

#### 2.1 Stil katmanı: `@layer junior-stage` sözleşmesi

Bugün sahneye ait CSS yok (§1.6). `data-*` sözleşmelerinin **CSS karşılığı** olmalı ki denetlenebilsin:

```css
@layer base {
  /* preflight -webkit- sürümünü veriyor; standart özellik eksik kalmasın */
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  img, svg, video, canvas { max-width: 100%; }
}

@layer junior-stage {
  /* 1. Yükseklik: tek kaynak, sihirli sayı yok */
  [data-junior-player-shell] { flex: 1 1 auto; min-height: var(--player-stage-min); }
  /* 2. Kapsayıcı: tüm sahne tipografisi buradan ölçeklenir */
  [data-junior-stage-canvas] { container: junior-stage / size; overflow: hidden; min-height: 0; }
  /* 3. Metin: her yerde sarar, asla taşmaz */
  [data-junior-stage-canvas] :is(p, span, h4, h5) { overflow-wrap: anywhere; text-wrap: pretty; }
  /* 4. Krom şeritleri: ölçeklenmeyen px yasak */
  [data-junior-caption-rail], [data-junior-control-bar] { font-size: clamp(0.7rem, 1.9cqh, 0.85rem); }
  /* 5. Kırılma dedektörü için işaret */
  [data-junior-stage-canvas] * { min-width: 0; }
}
```

Bu katman üç şeyi garanti eder: (a) sahne tipografisi sahneye bağlanır, (b) `data-*` sözleşmeleri CSS'te karşılık bulur, (c) `overflow: hidden` tek yerde tanımlanır — bileşen dosyalarında tekrar edilmez.

#### 2.2 Test yaklaşımı: piksel değil değişmez

Vitest dizge testleri (`junior-player-clock.test.ts:653`, `:776`, `:907-909`) yanlış şeyi koruyor. Onları **sınıf adı** yerine **değişmez** doğrulayacak şekilde çevir:

| Tür | Ne doğrular | Dosya |
|---|---|---|
| Birim (vitest) | sahne dosyalarında `min-h-[` **yok**; `JUNIOR_STAGE_MIN_HEIGHT_PX === 0` ile DOM tutarlı | `tests/kernel/junior-stage-containment.test.ts` (yeni) |
| Birim (vitest) | `cqh`/`cqmin` kullanan her bileşende `container-type: size` var (inline-size değil) | aynı dosya, kaynak taraması |
| Birim (vitest) | `[data-junior-stage-canvas]` kuralında `overflow: hidden` + `container-type: size` var | aynı dosya, `app/globals.css` taraması |
| E2E | **Kırpma yok**: her `[data-junior-graphic-op]` için `el.scrollHeight <= el.clientHeight + 1` | `tests/e2e/junior-stage-fit.spec.ts` (yeni) |
| E2E | **Bindirme yok**: sahne metinlerinin `getBoundingClientRect` kesişimi boş; altyazı rayı ve kontrol şeridi ile kesişim boş | aynı dosya |
| E2E matris | 1920×1080@100, 1366×768@100, 1366×768@125, 1280×800@150, 768×1024, 390×844, 640×360 (yatay) | `playwright.config.ts` yeni `projects` |

Bugün `playwright.config.ts` yalnız tek proje koşuyor:

```39:42:playwright.config.ts
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
```

Yani matris **yok**; bu yüzden kırılma hiçbir kapıdan geçmedi. Ölçekleme için iki yol birlikte gerekli:

```ts
// (a) CSS zoom = masaüstü tarayıcı yakınlaştırması
await page.evaluate(() => { document.documentElement.style.zoom = "1.25"; });
// (b) DPR + dar CSS viewport = Samsung/DPI senaryosu
test.use({ viewport: { width: 1093, height: 614 }, deviceScaleFactor: 1.25 });
```

#### 2.3 Kırpma/bindirme dedektörü (tek dosya, tek yerde)

```ts
// tests/e2e/junior-stage-fit.spec.ts
const overflow = await page.evaluate(() => {
  const stage = document.querySelector("[data-junior-stage-canvas]")!;
  const rail = document.querySelector("[data-junior-caption-rail]")!.getBoundingClientRect();
  const bar  = document.querySelector("[data-junior-control-bar]")!.getBoundingClientRect();
  const sb   = stage.getBoundingClientRect();
  const bad: string[] = [];
  for (const el of stage.querySelectorAll<HTMLElement>("p, span, h4, h5")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.bottom > Math.min(rail.top, bar.top) + 1 || r.right > sb.right + 1) {
      bad.push(el.textContent?.slice(0, 24) ?? "?");
    }
  }
  return bad;
});
expect(overflow).toEqual([]);
```

Bu dedektör sahne başına (`marble-tray`, `factor-vs-multiple`, `detective-last-digit`, `summary-board`, `concept-list`, `circle-measure`, `angle`, `area`) koşarsa metin/kutu taşması üreten mekanizmaların hepsi kırmızıya döner ve düzeltme doğrulanabilir olur.

#### 2.4 Korunacak / terk edilecek kararlar

| Karar | Durum |
|---|---|
| `RoomFrame cinema` + `max-w-none` | **Koru** — sahne genişliği sınırsız kalsın, ama **içerik** ölçeği `cq`'ye bağlansın |
| `JUNIOR_STAGE_MIN_HEIGHT_PX = 0` | **Koru** — niyet doğruydu, uygulama hizalanacak |
| `@container-size/*` deseni (`FactorMultipleStage`) | **Koru ve yay** — doğru örnek |
| `min-h-[300px]` (6 dosya, 10 yer) | **Terk et** — `h-full` + kapsayıcı |
| `h-[52dvh]` / `6.5rem` / `min-h-[28rem]` | **Terk et** — `flex-1` + `--shell-header-h` + `--page-header-h` |
| `@container/tile` (inline-size) + `46cqh` | **Terk et** — `@container-size` |
| Dizge donduran vitest kapıları | **Terk et** — değişmez testine çevir |
| `overflow-x-auto` markdown tablo deseni | **Koru**, sahne metnine de uygula |

#### 2.5 Sıra ve risk

| Adım | İş | Risk |
|---|---|---|
| 1 | `junior-player-clock.test.ts` içindeki `min-h-[300px]` beklentilerini (5 yer) değişmez beklentilerine çevir | Düşük — sadece test |
| 2 | `app/globals.css`: `@layer base` (`text-size-adjust`, `max-width`) + `@layer junior-stage` (kapsayıcı, taşma, sarma) | Düşük — küresel ama geri alınabilir |
| 3 | 6 dosyada `min-h-[300px]` kaldırma | Orta — sahne ölçeği tüm pilot derslerde değişir; `tsx scripts/verify-junior-visual-ops.ts` koşulmalı |
| 4 | Oynatıcı yükseklik bütçesi (`--shell-header-h`, `--page-header-h`, `--player-stage-min`) | Orta — `xl:grid` dalı da etkilenir |
| 5 | `DetectiveBoardStage` `@container-size/tile` + tek eksenli karo ölçüsü | Düşük — yerel |
| 6 | `ConceptListStage` / `SummaryPromptStage` / `AngleBoard` `shrink-0` + `justify-start` + `clamp` tipografi | Düşük — yerel |
| 7 | Playwright matris + kırpma/bindirme dedektörü | Düşük — yeni kapı |

`.cursorrules` §4 kapıları: `npx tsc --noEmit`, `npx vitest run`, `npm run verify:api-auth -- --check`, `npm run verify:junior-content`, `npm run verify:junior-sync`, `tsx scripts/verify-junior-visual-ops.ts`, `npm run verify:boundaries`.

---

## Doğrulama günlüğü — önceki taslakta düzeltilen iki iddia

Bu dosyanın ilk hâlinde iki hipotez vardı; kaynakla sınanınca tutmadı, düşürüldü:

1. **"`app/globals.css`'te `text-size-adjust` yok, Samsung font boosting metni şişiriyor."** — Kısmen yanlış. `@import "tailwindcss"` preflight'ı getiriyor ve preflight `html` üzerinde **`-webkit-text-size-adjust: 100%`** yazıyor (`node_modules/tailwindcss/preflight.css:31`). Chromium/Android bu ön eki okur ve metin otomatik büyütmeyi büyük ölçüde kapatır. Yani font boosting **birincil neden değil**. Yalnızca standart (ön eksiz) `text-size-adjust` eksik; bunu savunma amaçlı eklemek doğru, ama kırılmanın sebebi olarak sunmak yanlış olurdu. Rapor bu nedenle font boosting'i **§2.2'den çıkardı**; yerine kanıtlanabilir olan `overflow-wrap` yokluğu ve karışık px/rem birimleri kaldı.
2. **"`app-shell-switch.tsx:45` 1px sapma üretiyor (header 49px)."** — Yanlış. Tailwind preflight tüm elemanlara `box-sizing: border-box` veriyor; `header-bar.tsx:28`'deki `h-12` **border dahil** 48px'tir. `calc(100dvh - 3rem)` doğrudur; 1px hata yok. Bu iddia düşürüldü.

Ayrıca önceki taslakta "beş ayrı testte dondurulmuş" deniyordu; doğrusu **5 `toContain` beklentisi** (`:653`, `:776`, `:907`, `:908`, `:909`) — ifade netleştirildi. Ve önceki taslak yükseklik bütçesinin de testlerle dondurulduğunu ima ediyordu; **dondurulmuş değil** (yalnız eski `vh` çözümlerine karşı `not.toContain` var). Bu, iş sırasını değiştiren bir düzeltme.

---

## Doğrulanmayanlar (dürüstlük notu)

- Hiçbir tarayıcıda piksel ölçümü, `getBoundingClientRect`, `elementFromPoint`, ekran görüntüsü alınmadı. Tablolardaki piksel değerleri **sınıflardan yapılan aritmetiktir** (±20px).
- Samsung cihazın gerçek CSS viewport yüksekliği, DPR ve metin ayarı bilinmiyor. "%125/%150" varsayımı bildirimdeki "farklı çözünürlük/ölçeklendirme" ifadesine dayanıyor.
- ASUS ile Samsung arasındaki farkın **tek** nedeni yukarıdaki mekanizmalar mı, yoksa araya giren bir uzantı / Samsung "okuma modu" / sistem yazı tipi ölçeği de var mı — bilinmiyor.
- `xl` eşiğinin (1280px) hangi cihazda geçildiği ölçülmedi; bu yüzden `JuniorLessonEngine`'in `xl:grid` dalı ile akış dalının hangisinin Samsung'da çalıştığı **kesin değil**.
- CLS ve LCP üretilmedi. Rapor tek bir performans rakamı içermiyor.
- `ustaders.proje@gmail.com` hesabının hangi dersi açtığı ve o dersin hangi `layout` dalını (`marble-tray`, `factor-vs-multiple`, `detective-last-digit`, `summary-board`, `concept-list`, `circle-measure`) kullandığı doğrulanmadı. Mekanizmaların hepsi bu dalların en az birinde tetikleniyor; **hangisinin ekranda olduğu kullanıcıdan teyit edilmeli** — düzeltmenin önceliği buna göre sıralanır.

---

## Sonuç

Sahnenin cihazdan bağımsız bir yükseklik sözleşmesi yok. Üç katman üst üste biniyor:

1. **Bütçe:** `h-[52dvh]` / `calc(100dvh-6.5rem)` hesapları `sm:min-h-[28rem]` (448px) mutlak tabanıyla eziliyor; CSS yüksekliği ~552px'in altına düşen her istemcide oynatıcı kendi kabından büyük oluyor.
2. **Taban:** absolute katmanlarda `min-h-[300px]` dondurulmuş; sahne 300px'in altına inince sessizce kırpılıyor, ısınma kaseti altyazı rayına biniyor.
3. **Taşma:** sahne tuvalinde ne `overflow` ne `container-type` var; `min-h-0` + `justify-center` çocukları içeriğin altına sıkıştırıp taşan metni kardeşinin üstüne çiziyor. `46cqh` ise yanlış eksende (viewport) çözüldüğü için rakamlar karoya sığmıyor.

ASUS'un yüksek viewport'u birinci ve ikinci katmanı gizliyor; Samsung'un düşük CSS yüksekliği üçünü birden açığa çıkarıyor.

İlk iş CSS değil, **test**: `junior-player-clock.test.ts` bugünkü kırılmayı 5 literal dizgeyle koruyor. O kapı değişmez testine çevrilmeden hiçbir düzeltme derlenip geçemez. Sonra tek bir yükseklik değişkeni, tek bir `container-type: size` kapsayıcısı ve 6 dosyadan silinen `min-h-[300px]`. Bu üçü, tüm ekran boyutlarında ve tüm zoom seviyelerinde aynı sahneyi verir.
