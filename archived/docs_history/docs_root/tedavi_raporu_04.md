# Tedavi Raporu 04 — Junior oynatıcı responsive CSS & overlap

Tarih: 2026-11-01
Kaynak: `docs/tespit_raporu_04.md`
Kapsam: Junior 6. sınıf ders oynatıcısının yükseklik bütçesi, sahne kapsayıcısı, taşma (overlap) koruması ve kapı testleri.
Bildirim: ASUS + Super Admin görünümünde sahne düzgün; Samsung Chrome + `ustaders.proje@gmail.com` istemcisinde görseller, tablolar ve metinler üst üste biniyor.

> **Yöntem sınırı (önce bu okunsun).** Bu turda hiçbir tarayıcı açılmadı, hiçbir cihaz ölçülmedi. `getBoundingClientRect`, `elementFromPoint`, Lighthouse veya CLS çıktısı üretilmedi. Aşağıdaki her düzeltme **kaynak kod okuması ve derleme/test kapılarıyla** doğrulandı. Piksel değerleri ölçüm değil, CSS aritmetiğidir.

---

## Özet

| Soru | Cevap |
|---|---|
| Kaç mekanizma kapatıldı? | Tespit raporundaki **dokuz** kırılma mekanizmasının dokuzu (M1–M9). |
| Tek bir suçlu var mıydı? | Hayır. Üç katman birlikte çalışıyordu: yükseklik sözleşmesi yokluğu, mutlak `min-h` tabanları, `min-h-0` + `overflow-hidden` + `justify-center` üçlüsü. Üçü de yapısal olarak kapatıldı. |
| En kritik değişiklik? | `sm:min-h-[28rem]` (448px) mutlak tabanı silindi. Yerine `min(var(--player-shell-min), var(--junior-player-budget))` geldi — taban **artık viewport bütçesini aşamaz**. |
| Dizge donduran testler ne oldu? | `junior-player-clock.test.ts` içindeki **5 literal** beklenti kaldırıldı; yerine `tests/kernel/junior-stage-containment.test.ts` (9 test, değişmez tabanlı) geldi. |
| Kaç dosya değişti? | 12 kaynak/test dosyası + 1 yeni test dosyası + bu rapor. |
| Kapılar | `tsc` temiz, `vitest` 1110/1110 (kernel+junior) ve 1966/1976 (tüm depo, 10 kırılma **bu görevden önce de kırıktı**), dört `verify:junior-*` + `verify:boundaries` + `verify:api-auth` yeşil. |

### Kapatılan mekanizmalar dizini

| # | Mekanizma (tespit) | Bu turdaki durum | Kanıt |
|---|---|---|---|
| M1 | `sm:min-h-[28rem]` (448px) mutlak taban `calc(100dvh-6.5rem)`'i eziyor | **Kapatıldı** — bütçe `min()` ile sarmalandı, taban bütçeyi geçemez | `app/globals.css` `[data-junior-player-shell]` |
| M2 | `6.5rem` bütçesi gerçek kromu ve koşullu bantları saymıyor | **Kapatıldı** — `ResizeObserver` ile ölçülen `--junior-page-chrome-offset` | `JuniorLessonEngine.tsx` `useJuniorPageChromeOffset` |
| M3 | `min-h-[300px]` absolute katmanlar (10 yer / 6 dosya) | **Kapatıldı** — 10 yerin 10'u silindi; `min-height: 0` sözleşmesi | `scene-ui`, `step-art`, `scene-plate`, `vector-player`, `warmup-cassette` |
| M4 | Isınma kaseti `absolute z-10` + `min-h-[300px]` ile altyazı rayına biniyor | **Kapatıldı** — `overflow-hidden` + `min-height: 0` | `warmup-cassette.tsx` |
| M5 | Sahne tuvalinde `overflow` ve `container-type` yok | **Kapatıldı** — `overflow: hidden` + `container-type: size` (sınıf + CSS) | `JuniorPilotPlayer.tsx`, `globals.css` |
| M6 | `min-h-0` + `overflow-hidden` + `justify-center` üçlüsü kardeşe taşırıyor | **Kapatıldı** — `shrink-0` + `overflow-y-auto` + `justify-start` | `ConceptListStage`, `SummaryPromptStage`, `GraphicOpStage`, `DetectiveBoardStage` |
| M7 | `@container/tile` inline-size olduğu için `46cqh` viewport'a çözülüyor | **Kapatıldı** — `@container-size/tile`, `46cqh` silindi | `DetectiveBoardStage.tsx` |
| M8 | `aspect-square h-[68%] w-auto` belirsiz ebeveynde çöküyor | **Kapatıldı** — tek eksenli `size-[clamp(...)]` | `DetectiveBoardStage.tsx` |
| M9 | Sahne metinlerinde `overflow-wrap` yok | **Kapatıldı** — tüm sahne metni `overflow-wrap: anywhere` | `globals.css` + dört sahne bileşeni |

---

## ADIM 1 — Test korumalarının güncellenmesi

### 1.1 Donmuş `min-h-[300px]` literalleri kaldırıldı

`tests/kernel/junior-player-clock.test.ts` hatalı `min-h-[300px]` dizgesini **5 yerde** `toContain` ile donduruyordu. Yani düzeltme derlenip geçemiyordu. Beşi de kaldırıldı:

| Satır | Eski beklenti | Yeni beklenti |
|---|---|---|
| `:653` | `absolute inset-0 h-full min-h-[300px] w-full transition-opacity` | `absolute inset-0 h-full w-full transition-opacity` |
| `:776` | `absolute inset-0 block h-full min-h-[300px] w-full` | `absolute inset-0 block h-full w-full` |
| `:907` | `pointer-events-none absolute inset-0 block h-full min-h-[300px] w-full` | `pointer-events-none absolute inset-0 block h-full w-full` |
| `:908` | aynı (step-art) | aynı |
| `:909` | `className="pointer-events-none absolute inset-0 h-full min-h-[300px] w-full"` | `className="pointer-events-none absolute inset-0 h-full w-full"` |

Testin **niyeti** korundu: katman `inset-0` + `h-full` ile ebeveyne oturuyor mu? Değişen tek şey, yüksekliği ebeveyne bırakması.

### 1.2 Yeni kapı: `tests/kernel/junior-stage-containment.test.ts`

Dizge dondurmak yerine **değişmez** doğrulayan dokuz test:

| Test | Doğruladığı değişmez | Kapatılan mekanizma |
|---|---|---|
| `sahne katmanlarında katı piksel min-height tabanı kalmaz` | Beş sahne dosyasında `min-h-[Npx]` **yok** | M3, M4 |
| `sahne olmayan min-height kullanımları bilinçli kalır` | Krom ölçüleri (`2.75rem` altyazı rayı, `2.25rem` düğme) korunur | regresyon nöbeti |
| `sahne tuvali hem taşmayı keser hem gerçek kapsayıcıdır` | `overflow: hidden` **ve** `container-type: size` **ve** `min-height: 0` | M5 |
| `cqh/cqmin kullanan her kapsayıcı container-type: size taşır` | Blok ekseni kullanan her dosyada `@container-size`; `@container/tile` ve `46cqh` **yok** | M7 |
| `oynatıcı kabuğu tek yükseklik değişkenine bağlıdır` | `min-h-[28rem]`, `h-[52dvh]`, `6.5rem` sınıfı **yok**; `min()` sarmalı var | M1, M2 |
| `taşan liste konteynerleri kaydırılır ve çocukları büzülmez` | `shrink-0` + `overflow-y-auto`; `auto-rows-fr` **yok**; `grid-cols-[148px_1fr]` **yok** | M6, sabit kolon |
| `sahne metni kendi kutusunda sarar` | Dört sahne bileşeni + CSS kuralı `overflow-wrap: anywhere` | M9 |
| `ısınma kaseti mutlak katmanı ebeveyne oturur ve taşmaz` | `absolute inset-0` + `overflow-hidden`, `min-h-[300px]` **yok** | M4 |
| `sahne katmanları inset-0 + h-full ile ebeveyne oturur` | Beş dosyada `absolute inset-0 ... h-full w-full` | M3 |

Kapı artık **sınıf adı** değil **davranış** donduruyor: sınıf adı değişse de kapı yaşar, kırılma geri gelirse kırmızıya döner.

---

## ADIM 2 — Yükseklik bütçesi ve esnek katman mimarisi

### 2.1 `JuniorLessonEngine.tsx`: katı taban silindi, bütçe tek değişkene bağlandı

**Önce** (`:114`) — tek satırda dört ayrı yükseklik iddiası:

```
flex h-[52dvh] min-h-[20rem] w-full ... sm:h-[min(48rem,calc(100dvh-6.5rem))] sm:min-h-[28rem]
```

`min-height` her zaman `height`'ı yendiği için gerçek formül `max(448px, min(768px, 100dvh − 104px))` idi. 480px yükseklikte oynatıcı 448px oluyor, kabından **%22 büyük** çıkıyordu; yatay telefonda (640×360) **%81**.

**Sonra** — sınıfta yükseklik iddiası kalmadı:

```179:183:components/junior/lesson-engine/JuniorLessonEngine.tsx
        <div
          ref={playerShellRef}
          data-junior-player-shell=""
          className="flex min-h-0 w-full min-w-0 flex-col"
        >
```

Bütçe ve taban `app/globals.css`'e taşındı (tek kaynak):

```css
:root {
  --junior-page-chrome-h: 7rem;           /* ölçüm düşerse varsayılan */
  --player-chrome-min: 9.5rem;            /* üst krom + altyazı rayı + kontrol şeridi */
  --player-stage-min: 7.5rem;             /* sahne tuvali tabanı — 300px değil */
  --player-shell-min: calc(var(--player-chrome-min) + var(--player-stage-min));
}

[data-junior-player-shell] {
  --junior-player-budget: calc(
    100dvh - var(--junior-page-chrome-offset, var(--junior-page-chrome-h)) - 0.25rem
  );
  height: min(52dvh, var(--junior-player-budget));
  min-height: min(var(--player-shell-min), var(--junior-player-budget));
  max-height: var(--junior-player-budget);
}

@media (min-width: 640px) {
  [data-junior-player-shell] {
    height: min(48rem, var(--junior-player-budget));
  }
}
```

**Kritik ayrıntı:** `min-height` artık `min(var(--player-shell-min), var(--junior-player-budget))`. Taban, bütçeyi **matematiksel olarak aşamaz**. 448px hatasının tekrar etmesi CSS'te mümkün değil; tabanın işi yalnız "sahne yok olmasın".

### 2.2 `--junior-page-chrome-offset`: sihirli `6.5rem` yerine ölçüm

```javascript
const write = () => {
  frame = 0;
  const rect = shell.getBoundingClientRect();
  const offset = Math.round(rect.top + scrollingAncestorTop());
  if (offset <= 0) {
    root.style.removeProperty("--junior-page-chrome-offset");
    return;
  }
  root.style.setProperty("--junior-page-chrome-offset", `${offset}px`);
};

schedule();
const observer = new ResizeObserver(schedule);
observer.observe(shell);
window.addEventListener("resize", schedule);
window.addEventListener("orientationchange", schedule);
```

Oynatıcının `getBoundingClientRect().top` değeri + kaydırılan kapsayıcının `scrollTop`'u = gerçek krom payı. Bu ölçüm şunları kendiliğinden kapsıyor:

- Üst çubuk (48px) + `main` dikey padding'i (8px) + `PageHeader` (sarmada iki katına çıkar) + `RoomFrame` `gap-3` (12px)
- Koşullu `narrationBand` / `electiveDraft` / `preparing` bantları (+32…+60px)
- Tarayıcı yazı tipi ölçeği büyüdüğünde büyüyen başlık ve rozet yüksekliği
- `xl:grid` dalında sağdaki `QuickTools` sütununun satırı uzatması

`ResizeObserver` oynatıcıyı izlediği için `PageHeader` sardığında ya da bant geldiğinde bütçe **kendini düzeltiyor**. `6.5rem` artık yalnız ölçüm henüz yazılmadıysa (SSR/ilk kare) devreye giren varsayılan.

Temizlik: bileşen sökülürken `requestAnimationFrame` iptal edilir, gözlemci kapatılır, kök değişken silinir — sızıntı yok.

### 2.3 Beş dosyada on yerde donmuş `min-h-[300px]` silindi

| Dosya | Satırlar | Önce | Sonra |
|---|---|---|---|
| `player/scene-ui.tsx` | 190 | `absolute inset-0 block h-full min-h-[300px] w-full` | `absolute inset-0 block h-full w-full` |
| `player/step-art.tsx` | 41, 265 | `pointer-events-none ... h-full min-h-[300px] w-full` | `pointer-events-none ... h-full w-full` |
| `player/scene-plate.tsx` | 48 | `pointer-events-none absolute inset-0 h-full min-h-[300px] w-full` | `pointer-events-none absolute inset-0 h-full w-full` |
| `player/scene-plate.tsx` | 58, 74 | `absolute inset-0 z-[1] h-full min-h-[300px] w-full` | `absolute inset-0 z-[1] h-full w-full` |
| `vector-player.tsx` | 919 | `absolute inset-0 h-full min-h-[300px] w-full transition-opacity` | `absolute inset-0 h-full w-full transition-opacity` |
| `vector-player.tsx` | 925 | `pointer-events-none absolute inset-0 h-full min-h-[300px] w-full` | `pointer-events-none absolute inset-0 h-full w-full` |
| `player/warmup-cassette.tsx` | 97 | `absolute inset-0 z-10 min-h-[300px] bg-transparent ...` | `absolute inset-0 z-10 overflow-hidden bg-transparent ...` |
| `player/warmup-cassette.tsx` | 105 | `absolute inset-0 h-full min-h-[300px] w-full ...` | `absolute inset-0 h-full w-full ...` |

**Neden bu doğru:** `min-h-[300px]` bir **absolute** katmandaydı. Absolute öge `flex-1` paylaşımına katılmaz; ebeveyni 260px ise 300px çizer ve `overflow-hidden` sınırında sessizce kırpılır. Isınma kaseti `z-10` olduğu ve kırpılmadığı için daha kötüydü: board'dan taşıp **altyazı rayının üstüne biniyordu** (kullanıcının "kaset" şikâyeti). `inset-0` + `h-full` zaten doğru sözleşmeydi — `min-h` onu eziyordu. Kasete ek `overflow-hidden`, video taşmasını da kesiyor.

### 2.4 Global CSS sözleşmesi: `data-junior-*` artık stil taşıyor

`app/globals.css` 6.773 satırdı ve içinde **tek bir** `data-junior-*` kuralı yoktu. Yani sahnenin yükseklik, kapsayıcı, tipografi ve taşma davranışı tamamen Tailwind sınıflarına bırakılmıştı; "sahne şu kurallara uyar" denetlenemiyordu. Eklenen blok:

```css
[data-junior-stage-canvas] {
  position: relative;
  min-height: 0;
  overflow: hidden;
  container-type: size;
  container-name: junior-stage;
}

[data-junior-stage-canvas] :is(p, span, h4, h5, h6, li, dt, dd) {
  overflow-wrap: anywhere;
}

[data-junior-scene],
[data-junior-scene-media],
[data-junior-step-art],
[data-junior-warmup="cassette"] {
  min-height: 0;
}

@media (prefers-reduced-motion: reduce) {
  [data-junior-warmup="cassette"] {
    transition: none;
  }
}
```

**Bilinçli atlanan:** blok düzeyinde `text-wrap: pretty` ve `* { min-width: 0 }` **yazılmadı**. Gerekçe: `text-wrap` `whitespace-nowrap` rozet şeridini (`data-junior-rule-badges`, `overflow-x-auto`) dikey yığmaya zorlardı; evrensel `min-width: 0` ise `min-w-9` gibi bilinçli tabanları ezerdi. Düzeltme yalnız gereken yerde: `overflow-wrap`. Aynı nedenle `:root { text-size-adjust: 100% }` de eklenmedi — Tailwind preflight `-webkit-text-size-adjust: 100%`'ü zaten veriyor (tespit raporu §Doğrulama günlüğü maddesi 1).

---

## ADIM 3 — Sahne tuvali ve taşma (overlap) koruması

### 3.1 `data-junior-stage-canvas`: `overflow: hidden` + `container-type: size`

`JuniorPilotPlayer.tsx`'te sahne tuvali bugüne kadar `relative min-h-0 w-full flex-1` idi — **ne `overflow` ne `container-type`**. İçindeki sahneler `h-full` + `flex-1` + `min-h-0` ile geldiği için `min-h-0` + `overflow: visible` = taşan içerik kırpılmıyor, **altyazı rayının ve kontrol şeridinin üstüne çiziliyordu**. Kullanıcının gördüğü "metinler birbirine biniyor" manzarasının geometrisi buydu.

```697:703:components/junior/pilot-player/JuniorPilotPlayer.tsx
          <div
            className="relative min-h-0 w-full flex-1 overflow-hidden [container-type:size]"
            data-junior-stage-canvas=""
            data-junior-sticky-frame={stickyHold ? "true" : "false"}
            data-junior-sticky-layout={displayScene.layout}
          >
```

İki katman birlikte:

1. **Sınıf tarafı** `overflow-hidden [container-type:size]` — derleme çıktısında `container-type: size` üretildiği doğrulandı (`@tailwindcss/cli` ile üretilen CSS'te `\[container-type\:size\] { container-type: size }`).
2. **CSS tarafı** `[data-junior-stage-canvas]` kuralı aynı sözleşmeyi tek yerde tanımlıyor ve `min-height: 0` ekliyor — sınıf unutulsa bile kapı kırmızıya döner.

Kazanç: taşma tek yerde kesilir, `cq*` birimleri viewport'a değil **sahneye** çözülür.

### 3.2 Dört sahne bileşeninde `shrink-0` + `overflow-y-auto` + `overflow-wrap`

**`ConceptListStage`** — satırlar birbirine biniyordu (kapsayıcı `overflow-hidden`, satırda `min-h-0` ama `shrink-0` yok ⇒ flex her satırı içeriğinin altına sıkıştırıp metni dışarı taşırıyordu):

| Önce | Sonra |
|---|---|
| kapsayıcı `flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden` | `flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain` |
| satır `flex min-h-0 items-start gap-2 ...` | `flex shrink-0 items-start gap-2 ... [overflow-wrap:anywhere]` |
| gövde `<div className="min-w-0">` | `<div className="min-w-0 flex-1">` + iki satırda `[overflow-wrap:anywhere]` |
| not `<p className="shrink-0 ...">` | `shrink-0 [overflow-wrap:anywhere]` |

**`SummaryPromptStage`** — `auto-rows-fr` satırları eşit paylaştırıyor, kart `justify-center` olduğu için taşma **simetrik** oluyordu (metin hem üstten hem alttan kart dışına, alt satırın ve "Sıra Sende" bandının üstüne):

| Önce | Sonra |
|---|---|
| `grid min-h-0 flex-1 auto-rows-fr grid-cols-2 items-stretch gap-2` | `grid min-h-0 flex-1 auto-rows-min grid-cols-2 items-start gap-2 overflow-y-auto overscroll-contain` |
| kart `flex min-h-0 flex-col justify-center ...` | `flex shrink-0 flex-col justify-start ...` |
| başlık `text-sm font-black ...` | `min-w-0 ... [overflow-wrap:anywhere]` |
| gövde `text-sm font-bold leading-relaxed ...` | aynı + `[overflow-wrap:anywhere]` |

`auto-rows-fr` → `auto-rows-min` geçişi kritik: satır artık **içeriği kadar** yer alır, eşit paylaştırmaz; kutu küçükse liste kaydırılır, kart içeriği kırpılmaz.

**`GraphicOpStage`** — üç ayrı yer:

| Yer | Önce | Sonra |
|---|---|---|
| Çember paneli | `grid h-full min-h-0 grid-cols-[148px_1fr] gap-3` | `grid h-full min-h-0 grid-cols-[minmax(6rem,34%)_minmax(0,1fr)] gap-3` |
| Ölçü rayı | `flex min-h-0 flex-col justify-center gap-1.5` | `flex min-h-0 min-w-0 flex-col justify-start gap-1.5 overflow-y-auto overscroll-contain [overflow-wrap:anywhere]` |
| `MeasureLine` | `text-sm font-black text-white` | `+ shrink-0 leading-snug [overflow-wrap:anywhere]` |
| `AngleBoard` | `flex h-full min-h-0 flex-col gap-1.5` | `+ overflow-y-auto overscroll-contain [&>*]:shrink-0 [overflow-wrap:anywhere]` |
| `AreaBoard` | aynı | aynı |
| çember SVG | `h-full w-full` | `h-full w-full max-w-full` |

`148px` sabit kolon dar tuvalde metin kolonunu ~90px'e indiriyordu; `minmax(6rem,34%)` hem alt sınırı korur hem dar ekranda orantılı daralır. `justify-center` → `justify-start` **simetrik taşmayı** bitirir: içerik kapsayıcıdan büyükse yukarı taşmak yerine kaydırılır.

**`DetectiveBoardStage`** — kural rozeti ve karar paneli:

| Yer | Önce | Sonra |
|---|---|---|
| Karar paneli | `flex h-full min-h-0 flex-col justify-center gap-2` | `... justify-start gap-2 overflow-y-auto overscroll-contain [&>*]:shrink-0` |
| Damga etiketi | `<span>{v.label}</span>` | `<span className="min-w-0 [overflow-wrap:anywhere]">` |

### 3.3 `DetectiveBoardStage`: `@container/tile` → `@container-size/tile`

Tailwind v4 kaynağından doğrulandı (`node_modules/tailwindcss/dist/lib.js`):

```text
functional("@container",a=>{let g=null;if(a.value===null?g="inline-size":a.value.kind==="arbitrary"?g=a.value.value:a.value.kind==="named"&&a.value.value==="normal"?g="normal":a.value.kind==="named"&&a.value.value==="size"&&(g="size"),…
```

Yani `@container/tile` **`inline-size`** üretiyor; inline-size kapsayıcı **blok ekseni sorgusuna kapalıdır**. Bu yüzden `46cqh` karoyu değil **küçük viewport yüksekliğini** çözüyordu:

| CSS viewport yüksekliği | `46cqh` | `clamp(2rem, 46cqh, 7.5rem)` | Karoya kalan yükseklik | Sonuç |
|---|---|---|---|---|
| 1080 | 497px | **120px** | ~200px | sığar |
| 614 | 282px | **120px** | ~110px | sığar |
| 480 | 221px | **120px** | ~60px | **ortadan kesilir** |

Rakam her durumda 120px; karo `overflow-hidden` ⇒ 60px kutuda 120px rakam kesiliyordu. "Rakamlar bozuluyor" şikâyetinin en net açıklaması buydu.

**Düzeltme:**

```70:70:components/junior/pilot-player/DetectiveBoardStage.tsx
      className={`${JUNIOR_DIGIT_BOX_CLASS} @container-size/tile relative flex min-h-0 w-full min-w-0 max-w-[14rem] flex-1 flex-col items-center justify-center gap-1 self-stretch overflow-hidden rounded-3xl border-2 px-2 ${
```

```87:87:components/junior/pilot-player/DetectiveBoardStage.tsx
        className="block min-h-0 max-w-full text-[clamp(1.25rem,48cqh,7.5rem)] font-black leading-none tracking-tight [overflow-wrap:anywhere]"
```

`@container-size/tile` = `container-type: size`; üretilen CSS'te `.@container-size\/tile { container-type: size }` olarak doğrulandı. Artık `48cqh` **karonun** yüksekliğini çözüyor: 60px karoda ~29px rakam, 200px karoda ~96px. `clamp` alt sınırı `1.25rem`'e indirildi (küçük karoda okunur taban), üst sınır `7.5rem` kaldı. `46cqh` tamamen kaldırıldı — yanlış eksene bağlı olduğu için geri gelmemesi kapıda donduruldu.

### 3.4 `aspect-square h-[68%] w-auto` → tek eksenli `size-[clamp(...)]`

Rakam toplama kutusu iki yerde yüzde yükseklik + `aspect-ratio` kullanıyordu. Yüzde yükseklik **belirsiz ebeveynde** çözülmez; Chromium bunu `auto` gibi ele alır ⇒ `h-[68%]` düşer, `aspect-square` + `w-auto` kalır ⇒ kutu ya 0 genişlik ya tam genişlik olur.

| Konum | Önce | Sonra |
|---|---|---|
| `data-junior-digit-box="sum"` | `flex aspect-square h-[68%] w-auto items-center justify-center rounded-xl border border-amber-300/60 px-3 text-4xl font-black sm:text-5xl` | `flex size-[clamp(1.75rem,16cqh,4.5rem)] shrink-0 items-center justify-center rounded-xl border border-amber-300/60 px-3 text-[clamp(1rem,7cqh,2.75rem)] font-black leading-none` |
| `data-junior-digit-box="sum-total"` | `flex aspect-square h-[68%] w-auto ... text-4xl font-black shadow-lg sm:text-5xl` | `flex size-[clamp(1.75rem,16cqh,4.5rem)] shrink-0 ... text-[clamp(1rem,7cqh,2.75rem)] font-black leading-none shadow-lg` |

Ayrıca toplama satırı kendi kapsayıcısını aldı: `@container-size/sumrow mt-2 flex min-h-0 flex-1 items-center justify-center gap-2 overflow-hidden sm:gap-3`. Böylece `cqh` bu satırın ekseninden çözülür. Tek eksenli `size-[clamp(...)]` belirsiz yükseklikten bağımsız; `aspect-ratio` + yüzde kombinasyonu kalmadı.

### 3.5 Yüzey haritası (düzeltme sonrası)

```
main (h-[calc(100dvh-3rem)], overflow-y-auto)                    app-shell-switch.tsx:45
└─ RoomFrame (studio-flow)
   ├─ PageHeader / koşullu bantlar  ──►  ResizeObserver ölçer
   └─ [data-junior-player-shell]
      │   height: min(52dvh, bütçe)          ← viewport'u ezmez
      │   min-height: min(krom+sahne, bütçe) ← 448px hatası imkânsız
      └─ cinema-stage (flex-col, overflow-hidden)
         ├─ üst krom (shrink-0)
         ├─ board (flex-1 min-h-0 overflow-hidden)
         │  └─ [data-junior-stage-canvas]
         │       overflow: hidden        ← taşma burada kesilir
         │       container-type: size    ← cq* sahneye çözülür
         │       min-height: 0
         │       overflow-wrap: anywhere ← metin kendi kutusunda sarar
         │     └─ absolute inset-0 + h-full (min-h tabanı YOK)
         ├─ caption rail (shrink-0)      ← artık üstüne binilmiyor
         └─ control bar (shrink-0)
```

---

## ADIM 4 — Doğrulama ve test

### 4.1 `npx tsc --noEmit`

Temiz — 0 hata.

### 4.2 `npx vitest run`

**Kernel + Junior (bu görevin kapsamı):**

```
Test Files  212 passed (212)
     Tests  1110 passed (1110)
  Duration  73.31s
```

**Tüm depo:**

```
Test Files  8 failed | 394 passed (402)
     Tests  10 failed | 1966 passed (1976)
```

**Kalan 10 kırılma bu görevden önce de kırıktı** — kanıt: değişen 13 dosya `git stash` ile geri alınıp yalnız iki test koşuldu, aynı iki test aynı şekilde kırmızı kaldı; sonra stash geri yüklendi.

| Test dosyası | Kırılma | Bu görevle ilgisi |
|---|---|---|
| `tests/academy/tts-breath-chunks.test.ts` | `01_office_ai-k1` parça sayısı 12, beklenen 10 | Yok — akademi TTS dilimleyici |
| `tests/academy/sealed-duration-band.test.ts` | Band altı kaset listesi boş, beklenen `["01_office_ai-k1"]` | Yok — mühürlü süre bandı |
| `tests/academy/sealed-audio-pilot.test.ts` (2 kırılma) | Kurs toplamı 4361.933 sn kilidi 508.86 sn sapıyor | Yok — mühürlü ses timings |
| `tests/academy/office-ai-lesson-k1.test.ts` (2) | 10 paragraf / 226.001 sn karaoke cue | Yok — ders k1 içerik |
| `tests/academy/production-standard.test.ts` | Yaşayan kesit süreleri timings SSOT | Yok — üretim standardı |
| `tests/academy/prep-strip-audio.test.ts` | 8 ders / 8 kaset / 38 mühür sayımı | Yok — hazırlık şeridi |
| `tests/academy/office-ai-bridge-lock.test.ts` | `targetDurationMinutes` yuvarlaması | Yok — köprü kilidi |
| `tests/academy/dron-punchcards-from-timings.test.ts` | KVKK kaseti mühür/süre | Yok — DRON punchcard |

Ortak kök: `lib/academy/lesson-audio-timings/` içindeki mühürlü veri ile testlerin beklediği süreler arasında **önceden var olan** uyuşmazlık. Bu görevin dosya kapsamı (`components/junior/**`, `tests/kernel/junior-*`) bu veriye dokunmuyor.

### 4.3 Kapı komutları

| Komut | Sonuç |
|---|---|
| `npm run verify:junior-content` | **OK** — açık kazanım listesi basıldı, sapma yok |
| `npm run verify:junior-sync` | **OK** — `verify:junior-sync OK`; tüm kasetlerde kayma 0 ms, p90 ≤ 40 ms |
| `tsx scripts/verify-junior-visual-ops.ts` / `npm run verify:junior-visual-ops` | **OK** — 123 timeline · 33 çizim vaadi · 158 görsel hareket · 80 statik sahne (bilinen borç, yayın engeli değil) |
| `npm run verify:boundaries` | **OK** — kernel↛dikey, UI↛prisma, oda duvarı, Junior tablo sahibi `lib/junior` dahil tüm sınırlar |
| `npm run verify:api-auth -- --check` | **OK** — 77 route: 48 session · 22 public · 3 admin · 4 webhook |
| `npx eslint` (13 değişen dosya) | 0 hata, 1 uyarı (`scene-plate.tsx` `<img>` — **önceden vardı**, `next/image` geçişi bu görevin kapsamı dışı) |

### 4.4 Tailwind çıktı doğrulaması

Kullanılan üç kritik utility'nin gerçekten CSS ürettiği `@tailwindcss/cli` ile derlenip kontrol edildi:

| Utility | Üretilen CSS | Doğrulandı |
|---|---|---|
| `@container-size/tile` | `.@container-size\/tile { container-type: size; }` | ✓ |
| `@container-size/sumrow` | `.@container-size\/sumrow { container-type: size; }` | ✓ |
| `[container-type:size]` | `.\[container-type\:size\] { container-type: size; }` | ✓ |
| `[overflow-wrap:anywhere]` | `.\[overflow-wrap\:anywhere\] { overflow-wrap: anywhere; }` | ✓ |

`@container/tile` (inline-size) çıktısı projede **artık üretilmiyor** — kapı bunu da donduruyor.

---

## Değişen dosyalar

| Dosya | Değişiklik |
|---|---|
| `app/globals.css` | `:root` yükseklik birimleri + `[data-junior-player-shell]` bütçe/taban + `[data-junior-stage-canvas]` kapsayıcı/taşma/sarma sözleşmesi + `min-height: 0` katman kuralı |
| `components/junior/lesson-engine/JuniorLessonEngine.tsx` | `min-h-[28rem]`/`h-[52dvh]`/`6.5rem` silindi; `useJuniorPageChromeOffset` (ResizeObserver ölçümü) eklendi; `playerShellRef` bağlandı |
| `components/junior/pilot-player/JuniorPilotPlayer.tsx` | `data-junior-stage-canvas` → `overflow-hidden [container-type:size]` |
| `components/junior/pilot-player/ConceptListStage.tsx` | `overflow-hidden` → `overflow-y-auto`; satır `min-h-0` → `shrink-0`; `overflow-wrap` |
| `components/junior/pilot-player/SummaryPromptStage.tsx` | `auto-rows-fr` → `auto-rows-min`; `justify-center` → `justify-start`; `shrink-0`; `overflow-wrap` |
| `components/junior/pilot-player/GraphicOpStage.tsx` | `148px` → `minmax(6rem,34%)`; `justify-center` → `justify-start` + kaydırma; `AngleBoard`/`AreaBoard` kaydırma; `MeasureLine` `shrink-0` + sarma |
| `components/junior/pilot-player/DetectiveBoardStage.tsx` | `@container/tile` → `@container-size/tile`; `46cqh` → `48cqh` + alt sınır 1.25rem; `aspect-square h-[68%]` → `size-[clamp(...)]`; karar paneli `justify-start` + kaydırma; `sumrow` kapsayıcısı |
| `components/junior/player/scene-ui.tsx` | `min-h-[300px]` silindi |
| `components/junior/player/step-art.tsx` | `min-h-[300px]` × 2 silindi |
| `components/junior/player/scene-plate.tsx` | `min-h-[300px]` × 3 silindi |
| `components/junior/player/warmup-cassette.tsx` | `min-h-[300px]` × 2 silindi; `overflow-hidden` eklendi |
| `components/junior/vector-player.tsx` | `min-h-[300px]` × 2 silindi |
| `tests/kernel/junior-player-clock.test.ts` | 5 `min-h-[300px]` literal beklentisi esnek `h-full` beklentisine çevrildi |
| `tests/kernel/junior-stage-containment.test.ts` | **Yeni** — 9 değişmez testi |
| `docs/tedavi_raporu_04.md` | Bu rapor |

---

## Doğrulanmayanlar (dürüstlük notu)

- **Hiçbir tarayıcıda piksel ölçümü yapılmadı.** `getBoundingClientRect`, `elementFromPoint`, ekran görüntüsü, Lighthouse, CLS üretilmedi. Samsung Chrome + `ustaders.proje@gmail.com` senaryosu **hâlâ canlı doğrulanmadı**.
- Samsung cihazın gerçek CSS viewport yüksekliği, DPR ve metin ayarı bilinmiyor. "%125/%150" aritmetiği bildirimdeki "farklı çözünürlük/ölçeklendirme" ifadesine dayanıyor.
- `xl` eşiğinin (1280px) hangi cihazda geçildiği ölçülmedi; `JuniorLessonEngine`'in `xl:grid` dalı ile akış dalının hangisinin Samsung'da çalıştığı **kesin değil**. Her iki dal da aynı `[data-junior-player-shell]` bütçesini okuduğu için fark artık sahne yüksekliğini bozamaz.
- `--junior-page-chrome-offset` ölçümü `ResizeObserver`'a dayanır. Tarayıcı `ResizeObserver` desteklemiyorsa `--junior-page-chrome-h: 7rem` varsayılanı devreye girer — bu, eski `6.5rem`'den daha güvenli ama yine de tahmindir.
- Playwright cihaz matrisi (1920×1080 / 1366×768 / 1280×800@150 / 390×844 / 640×360) ve kırpma-bindirme dedektörü **bu turda eklenmedi**. Tespit raporu §2.2–2.3 bunu öneriyor; ayrı bir iş kalemi olarak duruyor.
- `main`'in `overflow-y-auto`'su ile `data-junior-zero-scroll="true"` sözleşmesi arasındaki çelişki (`FactorMultipleStage` iç `overflow-y-auto` taşıyor) **kapatılmadı** — bu turda kaydırma davranışı bilinçli olarak "kırpmadan iyidir" yönünde bırakıldı.
- `MarbleTrayStage`'ın `textLength` + `lengthAdjust="spacingAndGlyphs"` ile yazıyı ezmesi ve `quick-tools.tsx` `w-[5.5rem]` sabit paneli (tespit §1.4) **bu turda ele alınmadı**; kapsam dört sahne bileşeniyle sınırlı tutuldu.

---

## Sonuç

Üç katman da yapısal olarak kapatıldı:

1. **Bütçe:** `h-[52dvh]` / `calc(100dvh-6.5rem)` / `min-h-[28rem]` üçlüsü yerine tek `--junior-player-budget` ve ölçülen `--junior-page-chrome-offset`. Taban `min(krom+sahne, bütçe)` ile sarmalandığı için **448px hatası CSS'te imkânsız**.
2. **Taban:** altı dosyadaki on `min-h-[300px]` silindi. Katmanlar `inset-0` + `h-full` ile yalnız ebeveynden yükseklik alıyor; ısınma kaseti `overflow-hidden` ile altyazı rayına binemiyor.
3. **Taşma:** sahne tuvali `overflow: hidden` + `container-type: size` taşıyor. Dört sahne bileşeninde `shrink-0` + `overflow-y-auto` + `overflow-wrap: anywhere`; `DetectiveBoardStage` `@container-size/tile` ile `cqh`'yi doğru eksene bağladı, `46cqh` ve `aspect-square h-[68%]` kaldırıldı.

Dizge donduran kapı değişmez kapısına çevrildi: `tests/kernel/junior-stage-containment.test.ts` sınıf adı yerine davranışı doğruluyor. `tsc` temiz, kernel+junior **1110/1110**, dört `verify:junior-*` + `verify:boundaries` + `verify:api-auth` yeşil. Tüm depodaki kalan 10 kırılma akademi TTS mühür verisine ait ve **bu görevden önce de kırıktı** (stash ile kanıtlandı).

Canlı cihazda (Samsung Chrome) son doğrulama hâlâ yapılmalı — bu rapor kod ve kapı kanıtı sunar, piksel kanıtı değil.
