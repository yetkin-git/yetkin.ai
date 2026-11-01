# Tespit Raporu 09 — Canlı oynatıcının dikey ezilmesi

Tarih: 2026-11-01
Kapsam: Samsung Chrome, normal ekran (oynatıcı tam ekranda değil). Fotoğraf: `WhatsApp Image 2026-11-01 at 12.32.38.jpeg`. Konu sayfası: Çarpanlar, Katlar ve Bölünebilme; sahnede görünen başlık «Bölünebilme Dedektifleri».
İncelenen yüzey: `app/globals.css` sahne sözleşmesi, `JuniorLessonEngine`, `JuniorPilotPlayer`, `DetectiveBoardStage`, ders sayfası kabuğu, `ListenAndTell` → `VectorPlayer` yükseklik zinciri.

> **Yöntem sınırı.** Bu turda canlı sayfa açılmadı, cihazda `getBoundingClientRect` alınmadı. Fotoğraf gözle okundu. Yüksekliklerin piksel karşılığı CSS aritmetiğidir (16px kök yazı tipi varsayımı), ölçüm değildir. `clamp()` değerini `calc()` içine almanın bildirimi düşürüp düşürmediği bu turda computed style ile doğrulanmadı; aşağıda bu iddia ayrı etiketlenir.

---

## Özet

| Soru | Cevap |
|---|---|
| 280px sahne tabanı `main` üzerinde mi? | Hayır. Commit yok, stage yok, push yok. Yalnız çalışma ağacında duruyor. |
| Vercel’e giden uç ile yerel `HEAD` | Aynı kayıt: `8d0f5ef`. İkisi arasında commit farkı yok. |
| Canlıda duran taban | `3e65395` ile girmiş `clamp(11.25rem, 28dvh, 13.75rem)` = 180–220px. `8d0f5ef` bu dosyalara dokunmuyor. |
| Fotoğrafta ne görünüyor? | Üst krom, «Bölünebilme Dedektifleri» satırı, oynatma düğmeleri ve altyazı şeridi duruyor. Basamak karoları (sahne tuvali) görünmüyor. Altta «Kendin Keşfet» kartları duruyor. Oynatıcı, tuvali olmayan bir kontrol şeridine inmiş. |
| Tuvali 0’a indiren kural | Sinema tahtası hem `data-junior-cinema-board` hem `data-junior-step-art` taşıyor. Aynı özgüllükte daha sonra gelen `[data-junior-step-art] { min-height: 0 }` tahta tabanını sıfırlıyor. Tahta `overflow: hidden` + `flex-1` (`flex-basis: 0%`). Tuvalin kendi `min-height` değeri ebeveyni büyütmüyor; kırpılıyor. |
| Sayfa neden kaymıyor? | `overflow-y-auto` `<main>` üzerinde. Yükseklik `h-full` + `min-h-0` + `flex-1` zinciriyle viewport artığına çözülüyor. Açık, esnek çocuk tarafından yutuluyor. `scrollHeight` kabı aşmıyor; kaydırma kolu oluşmuyor. |

---

## ADIM 1 — Değişiklik ve push durumu

### 1.1 Dal ve kayıt

| | |
|---|---|
| Dal | `main`, `origin/main` izliyor |
| `HEAD` | `8d0f5ef3be9cc07e2f3b71a64d841853a2b9ecf4` |
| `origin/main` | aynı SHA |
| `HEAD` mesajı | `fix(junior): make full course card clickable and optimize card height` |
| Bu kaydın oynatıcı dosyalarına dokunuşu | Yok. Son dokunuş `3e65395` — `fix(junior): enforce min-height stage canvas and lock notice UX` |

`git diff origin/main...HEAD` boştur. Uzak `main` ucu ile yerel `HEAD` aynı kayıttır. Vercel üretim dalı `main` ise canlı commit budur. Bu turda Vercel API’sine sorulmadı; fark, uzak uç ile çalışma ağacı arasındadır, iki commit arasında değildir.

### 1.2 280px yaması nerede?

`git status --porcelain` (stage sütunu boş, çalışma ağacı kirli):

```
 M app/globals.css
 M components/junior/lesson-engine/JuniorLessonEngine.tsx
 M components/junior/pilot-player/DetectiveBoardStage.tsx
 M components/junior/pilot-player/JuniorPilotPlayer.tsx
 M tests/kernel/junior-stage-containment.test.ts
```

İlk sütun boş: **unstaged**. İkinci sütun `M`: **commitlenmemiş**. `git diff --cached` boş. Bu beş dosya `main`’e push edilmemiştir. Canlı, `8d0f5ef` ağacını çalıştırır.

Çalışma ağacının oynatıcıya ilişkin özü (`HEAD` → kirli ağaç):

| Dosya | Canlı (`8d0f5ef`) | Yalnız yerelde |
|---|---|---|
| `app/globals.css` | `--player-stage-min: clamp(11.25rem, 28dvh, 13.75rem)` (180–220px) | `clamp(17.5rem, 36dvh, 22rem)` (280–352px) |
| aynı | `[data-junior-cinema-board] { min-height: calc(var(--player-stage-min) + 1.75rem) }` | `min-height: var(--player-stage-min)` |
| aynı | `[data-junior-step-art] { min-height: 0 }` tahtayı da kapsar | seçici `:not([data-junior-cinema-board])` ile tahtadan çıkar |
| `JuniorLessonEngine.tsx` | kabuk `flex min-h-0 w-full min-w-0 flex-col` | `min-h-0` kalkar; `shrink-0` ve `[&_[data-junior-stage-canvas]]:min-h-[280px]` eklenir |
| `JuniorPilotPlayer.tsx` | tuval `min-h-[180px] … flex-1` (`shrink-0` yok) | `min-h-[280px] … flex-1 shrink-0` |
| `DetectiveBoardStage.tsx` | rakam `clamp(1.25rem, 48cqh, 7.5rem)`, `container-type` esneyen karoda | rakam `clamp(3.5rem, 65cqh, 18rem)`, `container-type` `absolute inset-0` katmanda |

`DetectiveBoardStage` farkı sayfa yüksekliğini değiştirmez. Karo içindeki rakamın `cqh` çözünürlüğünü düzeltir. Tuval 0px iken bu yama görünmez.

### 1.3 Canlı / yerel kod farkı (yükseklik sözleşmesi)

Canlı değişken ve tahta tabanı (`app/globals.css`, `8d0f5ef`):

```css
--player-chrome-min: 14rem; /* 224px */
--player-stage-min: clamp(11.25rem, 28dvh, 13.75rem); /* 180–220px */
--player-shell-min: calc(var(--player-chrome-min) + var(--player-stage-min));

[data-junior-cinema-board] {
  min-height: calc(var(--player-stage-min) + 1.75rem);
  flex-shrink: 0;
}
[data-junior-stage-canvas] {
  min-height: var(--player-stage-min);
  flex-shrink: 0;
  overflow: hidden;
}
[data-junior-step-art] {
  min-height: 0;
}
```

Yerel yama tahta satırını `min-height: var(--player-stage-min)` yapar, `step-art` sıfırlamasını tahtadan çıkarır, tuval sınıfına `min-h-[280px] shrink-0` yazar. Bu metin diskte durur; `8d0f5ef` içinde yoktur.

---

## ADIM 2 — Dikey ezilme

### 2.1 Fotoğrafın oturduğu mod

Oynatıcı tam ekranda değil. `JuniorPilotPlayer` bu dalda sahneye `h-screen` vermez; sınıf `min-h-full w-full flex-1 overflow-visible` kalır. `ListenAndTell` pilot oynatıcıyı `fill` ile kurar. `fill` açıkken üç sarmalayıcı viewport’u doldurmaya çalışır ve küçülmeye izin verir:

```489:492:components/junior/listen-and-tell.tsx
      className="junior-quest flex h-full min-h-0 w-full flex-1 flex-col gap-1 overflow-visible ..."
      <div className="flex min-h-0 w-full flex-1 flex-col" data-junior-stage-full={...}>
```

```599:606:components/junior/vector-player.tsx
      className={`relative flex min-h-0 w-full flex-1 flex-col ${props.fill ? "h-full" : "h-auto"}`}
      <JuniorPilotPlayer
        fill={props.fill}
```

Canlı kabuk (`JuniorLessonEngine.tsx`, `8d0f5ef` satır 179):

```text
className="flex min-h-0 w-full min-w-0 flex-col"
```

`min-h-0`, esnek öğenin içerik tabanını kapatır. Öğenin yüksekliği, ebeveynin verdiği artık kadardır; içerik (280px tuval) bu tabanı yukarı taşıyamaz.

### 2.2 Tuvali sıfırlayan kural

Sinema tahtası tek elemanda iki işaret taşır (`JuniorPilotPlayer.tsx`, `8d0f5ef` satır 675–678 ve 701–702):

```text
data-junior-cinema-board
data-junior-step-art={sceneState.activeCueIndex}
className="… min-h-[var(--player-stage-min)] w-full flex-1 shrink-0 … overflow-hidden"

data-junior-stage-canvas
className="relative min-h-[180px] w-full flex-1 overflow-hidden [container-type:size]"
```

`app/globals.css` `@import "tailwindcss"` ile açılır. Dosyanın sonundaki sahne kuralları katmansızdır. Katmansız kural, `@layer utilities` içindeki `min-h-[180px]`, `min-h-[280px]` ve `min-h-[var(--player-stage-min)]` sınıflarını yener. Canlıda tuvalin geçerli tabanı sınıf değil, şu bildirimdir: `min-height: var(--player-stage-min)` (180–220px). Bu taban tuval kutusunu büyütür; tahtayı büyütmez.

Tahtada çakışma vardır. Özgüllük her iki seçicide `(0, 1, 0)`. Kaynak sırası:

1. Satır 6824 — `[data-junior-cinema-board] { min-height: calc(var(--player-stage-min) + 1.75rem); flex-shrink: 0 }`
2. Satır 6852 — `[data-junior-step-art] { min-height: 0 }`

İkinci bildirim `min-height` için kazanır. Tahtanın kullanılan tabanı **0** olur. `flex-shrink: 0` durur; `flex-1` ise `flex-basis: 0%` bırakır. Serbest yükseklik yoksa tahtanın ana boyu 0’dır.

Tuvalin 180px tabanı bu elemanın çocuğudur. Tahta `overflow: hidden` ve `min-height: 0` olduğu için çocuğun tabanı ebeveynin en küçük boyutuna yazılmaz. 180px’lik tuval, tahtanın içerik kutusunda kırpılır. Başlık (`h2`) ve kontrol şeridi tahtanın `shrink-0` kardeşleridir; onlar kalır. Basamak karoları tuvalin içinde, çoğu sahnede dikeyde ortalanır. Görünen pencere yalnız şeridin tepesiyse rakamlar kadrajın dışında kalır. Fotoğraf bu kadrajdır: başlık ve düğmeler var, dedektif karoları yok.

Çalışma ağacı yorumu ikinci bir düşüş iddia eder: `calc(var(--player-stage-min) + 1.75rem)`, değişkenin değeri `clamp(...)` olduğu için bildirimi geçersiz kılar ve taban 0 kalır. Bu turda computed style alınmadı. **Güven: hipotez.** Adım 2.2’deki `min-height: 0` ezmesi bu hipotezden bağımsızdır ve kaynak sırasında kesindir. `calc(...)` geçerli olsa bile bir sonraki kural tabanı yine 0 yapar.

Kabuk için yazılmış yedek taban da aynı kalıba bağlıdır (`8d0f5ef` satır 6803 ve 6812):

```css
--player-shell-min: calc(var(--player-chrome-min) + var(--player-stage-min));
min-height: max(var(--player-shell-min), min(52dvh, var(--junior-player-budget)));
```

Aritmetik, bildirim geçerliyse: krom 224px + sahne 180–220px = kabuk en az **404–444px**. Fotoğrafta kabuk bu kadar yer tutmuyor; tuval şeridi ile «Kendin Keşfet» aynı ekrana sığıyor. Bildirim ya düşüyor (yukarıdaki hipotez; o zaman sınıftaki `min-h-0` tek kalan `min-height` olur) ya da iç zincir `h-full` + `min-h-0` ile bu tabanı görsel yüksekliğe geçirmiyor. **Güven: fotoğraf ile kaynak birlikte kuvvetle muhtemel; computed style yok.**

### 2.3 `overflow-y-auto` neden sayfayı kaydırmıyor?

Kaydırma belgede değil, ders `<main>` öğesinde:

```44:45:components/shell/app-shell-switch.tsx
              : juniorLesson
                ? "relative flex h-[calc(100dvh-3rem)] max-h-[calc(100dvh-3rem)] min-h-0 flex-col overflow-x-hidden overflow-y-auto px-3 pt-1 pb-1 sm:px-4"
```

Üst çubuk `h-12` (48px = `3rem`). `<main>` yüksekliği `100dvh - 3rem` ve aynı değerde `max-height` ile kilitli. `overflow-y-auto` yalnız bu kutunun `scrollHeight` değeri `clientHeight` değerini aşınca çalışır.

Stüdyo dersinde (`jr` pilot oynatma) `RoomFrame` kaydırmayı kendisi kesmez:

```154:157:app/junior/ders/[lessonKey]/page.tsx
      className={
        studioFlow
          ? "flex w-full flex-col gap-3 space-y-0 pb-6"
          : "flex h-full min-h-0 w-full flex-1 flex-col gap-1.5 space-y-0 overflow-hidden pb-0"
```

Pilot sayfa sol daldadır: `overflow-hidden` yok, `h-full` yok. Ezilme bu sınıftan gelmez. Yükseklik bir alt katmanda kilitlenir.

Zincir, yukarıdan aşağı:

1. `<main>` — belirli yükseklik, `overflow-y-auto`.
2. `RoomFrame` — `flex-col`, büyümez (`flex-grow` yok). Yüksekliği içeriği kadardır.
3. `junior-quest` — `h-full min-h-0 flex-1`. Yüzde yükseklik, yüksekliği `auto` olan ebeveynde döngüye girer; `min-h-0` içerik tabanını kapatır; `flex-1` bazı 0 yapar.
4. `VectorPlayer` sarmalayıcısı — `fill` yüzünden aynı üçlü: `min-h-0 h-full flex-1`.
5. Sinema tahtası — `flex-1`, taban 0 (Adım 2.2), `overflow: hidden`.
6. `shrink-0` kardeşler (bölüm hapları, başlık, altyazı, kontrol şeridi) kendi içerik yüksekliklerini alır.
7. Artakalan piksel tahtaya yazılır. Artakalan ~0–50px ise tuval o şeritte kırpılır.

Toplam içerik yüksekliği, krom + şerit + «Kendin Keşfet» olarak viewport’un içine sığar. `<main>` taşmaz. Kaydırma kolu çıkmaz. Kaydırma çıksa bile tuvalin yüksekliğini geri vermez: tuval bir belge akışı yüksekliği değil, esnek artıktır. Sayfanın kayması için kolonun **en küçük içeriği** `<main>` kutusundan büyük olmak zorundadır. Bugün en küçük içerik, tuvali saymıyor.

`useJuniorPageChromeOffset` (`JuniorLessonEngine.tsx`) `--junior-page-chrome-offset` yazar. Bu değişken kabuk bütçesinin `calc(100dvh - offset)` tarafındadır. Bütçe eksi çıksa bile `max(kabuk tabanı, eksi bütçe)` tabanı seçer; tek başına şerit üretmez. Şeridi üreten, tabanın tahtada 0’a inmesi ve `min-h-0` zincirinin o tabanı yukarı taşımamasıdır.

---

## ADIM 3 — Çözüm reçetesi

Amaç: normal ekranda sahne tuvalinin kullanılan yüksekliği 280px’in altına inmesin. Sığmayan kolon `<main>` içinde kaydırılsın. Tam ekran dalı (`h-screen`) bu reçetenin dışında kalır.

### 3.1 Taban katmansız CSS’te durur

`min-h-[280px]` tek başına yetmez. Katmanlı Tailwind sınıfı, katmansız `min-height: 0` karşısında kaybeder. Taban şu üç yerde, katmansız ve `clamp`’i yeniden `calc()` ile sarmadan yazılır:

```css
:root {
  --player-stage-min: 17.5rem; /* 280px. İkinci bir calc() içine konmaz. */
}

[data-junior-player-shell],
[data-junior-cinema-board],
[data-junior-stage-canvas] {
  min-height: var(--player-stage-min);
  flex-shrink: 0;
}

[data-junior-step-art]:not([data-junior-cinema-board]) {
  min-height: 0;
}
```

`17.5rem` düz uzunluktur. `clamp()` kullanılacaksa değer yalnız `min-height: var(--player-stage-min)` biçiminde tüketilir. `calc(var(--player-stage-min) + 1.75rem)` ve `calc(14rem + var(--player-stage-min))` kabuk formülünden çıkar. Tahta, başlık satırını da taşıdığı için tuval ile aynı 280px tabanı paylaşır; başlık `shrink-0` olduğu için tuvalin payı 280px’in biraz altına iner. Tuvalin kendi kutusu da `min-height: 17.5rem` ve `flex-shrink: 0` taşır. Tahtanın `overflow: hidden` değeri, tabanı 0 olan bir ebeveynde kırpma yapmasın diye tahta tabanı tuval tabanından önce gelir.

Sınıf tarafı, aynı sözleşmenin yedeğidir; asıl kural CSS’tedir:

- Kabuk: `shrink-0`, `min-h-0` kalkar.
- Tahta ve tuval: `min-h-[280px] shrink-0`.
- `flex-1` normal ekranda tuvalde kalabilir; `flex-basis: 0%` ancak ebeveynin tabanı 280px olduktan sonra artığı dağıtır. Taban yokken `flex-1` şeridi üretir.

### 3.2 Viewport kilidi normal ekranda açılır

`fill` yalnız tam ekranda `h-full min-h-0 flex-1` kursun. Normal ekranda şu üç sınıf kalkar:

| Eleman | Kalkacak | Kalacak |
|---|---|---|
| `junior-quest` (`ListenAndTell`) | `h-full min-h-0 flex-1` | `w-full shrink-0 flex-col` |
| `VectorPlayer` pilot sarmalayıcısı | `min-h-0 h-full flex-1` | `w-full shrink-0` |
| `data-junior-player-shell` | `min-h-0` | `shrink-0`, yükseklik `auto` |

`h-full`, yüksekliği `100dvh - 3rem` kilitli `<main>` artığına yüzde ile bağlar. `min-h-0`, 280px çocuğu en küçük boyutun dışında bırakır. İkisi durdukça tuval yine artık yer.

### 3.3 Sayfa kaydırması

Kaydırma kabı zaten doğru yerde: ders `<main>` öğesi `overflow-y-auto` ve `max-h-[calc(100dvh-3rem)]`. Yeni bir iç `overflow-y-auto` açılmaz. 0px tuvalin içinde kaydırma, şeridi oynatıcı yapmaz.

Stüdyo `RoomFrame` sınıfı `overflow-hidden`, `h-full` ve `min-h-0` almaz (bugün almıyor). Kabuk + tahta `shrink-0` ve 280px taban ile akışa girince kolonun en küçük yüksekliği, kısa Samsung viewport’unda `<main>` kutusunu aşar. Aşan kısım «Kendin Keşfet» ile birlikte `<main>` içinde kayar. Oynatıcı ezilerek yer açmaz.

### 3.4 Yerelde duran yamanın sınırı

Çalışma ağacındaki yama doğru yöne bakar: tahta `calc(+ 1.75rem)` sarmalından çıkar, `step-art` sıfırlaması tahtaya işlemez, tuval sınıfı `min-h-[280px] shrink-0` olur. Bu yama commit ve push olmadığı için fotoğraftaki canlıda yoktur.

Yama tek başına reçetenin tamamı değildir.

- Kabuk hâlâ `calc(var(--player-chrome-min) + var(--player-stage-min))` kullanır. Değişken `clamp()` kaldığı sürece bu, yorumun «bildirimi düşüren» dediği kalıbın aynısıdır.
- `ListenAndTell` ve `VectorPlayer` üzerindeki `h-full min-h-0 flex-1` duruyor. Kabuk sınıfına `shrink-0` eklemek bu iki sarmalayıcıyı durdurmaz.
- `min-h-[280px]` katmanlı sınıftır. Katmansız `min-height` ile aynı değere çekilmezse canlıda etkisiz kalır.

Reçete uygulanırken önce katmansız taban ve `step-art` istisnası, sonra normal ekranda `min-h-0` / `h-full` kırılması gelir. Ardından `<main>` kaydırması kendiliğinden devreye girer.
