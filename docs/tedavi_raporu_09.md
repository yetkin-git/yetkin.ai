# Tedavi Raporu 09 — Sahne tuvali 280px tabanı ve dikey ezilmenin kapanması

Tarih: 2026-11-01
Kapsam: Samsung Chrome, normal ekran. Konu sayfası oynatıcısında basamak karoları kadrajdan düşüyordu. Reçete `docs/tespit_raporu_09.md` ADIM 3.

Ölçüm `localhost:3000/junior/ders/jr_06_mat-1` üzerinde, 360×640 telefon görünümünde alındı. Samsung Chrome’un kendisi bu makinede yok; kısa mobil görünüm aynı yükseklik zincirini kullanır.

---

## Özet

| Soru | Cevap |
|---|---|
| Sahne tabanı ne? | `--player-stage-min: 17.5rem` (280px). `clamp()` yok. Değer `calc()` içine alınmıyor. |
| Tahtayı sıfırlayan kural? | `[data-junior-step-art]:not([data-junior-cinema-board]) { min-height: 0 }`. Sinema tahtası bu sıfırlamanın dışında. |
| Hangi katmanlar ezilmez? | `data-junior-player-shell`, `data-junior-cinema-board`, `data-junior-stage-canvas`: katmansız `min-height: var(--player-stage-min)` ve `flex-shrink: 0`. |
| Normal mod kilit zinciri? | `h-full min-h-0 flex-1` kalktı. Yerine `w-full shrink-0`. Aynı kilit yalnız tam ekranda durur. |
| Sayfa kayması nerede? | Ders `<main>` öğesi zaten `overflow-y-auto` ve `max-h-[calc(100dvh-3rem)]`. Yeni iç kaydırma açılmadı. Kolon 280px tabanla kutuyu aşınca kayar. |

---

## ADIM 1 — Katmansız taban (`app/globals.css`)

`--player-stage-min` düz `17.5rem`. `--player-shell-min` ve `calc(var(--player-chrome-min) + var(--player-stage-min))` kalktı. 640px medya sorgusundaki `max(var(--player-shell-min), …)` tabanı da kalktı; o formül `clamp()` değişkenini `calc()` içine alınca bildirimi düşürüyordu.

Ortak kural:

```css
[data-junior-player-shell],
[data-junior-cinema-board],
[data-junior-stage-canvas] {
  min-height: var(--player-stage-min);
  flex-shrink: 0;
}
```

Tuval kuralı ayrıca `overflow: hidden`, `container-type: size` ve aynı `min-height` değerini taşır. Tailwind `min-h-*` katmanı bu katmansız bildirimin altında kalır.

Kabuk sınıfı (`JuniorLessonEngine`): `min-h-0` yok, `shrink-0` var, tuval yedeği `min-h-[280px]`. Asıl taban CSS’tedir.

Pilot tahta normal modda `min-h-[280px] shrink-0`. `flex-1` yalnız tam ekranda. Tuval sınıfı `min-h-[280px] shrink-0`.

`DetectiveBoardStage` rakamı `clamp(3.5rem, 65cqh, 18rem)`. Boy kapsayıcı esneyen karonun kendisi değil, `absolute inset-0` iç katman. Tuval 0px iken bu yama görünmezdi; taban açılınca karo içindeki rakam sahneye çözülür.

---

## ADIM 2 — Normal modda viewport kilidi

| Eleman | Normal mod | Tam ekran |
|---|---|---|
| `junior-quest` (`listen-and-tell.tsx`) | `w-full shrink-0 flex-col` | aynı (tam ekran iç sahnede) |
| Sahne sarmalayıcısı | `w-full shrink-0 flex-col` | aynı |
| Pilot ısınma kabuğu (`vector-player.tsx`) | `w-full shrink-0` | iç sahne `h-screen` |
| Mühürlü oynatıcı kabuğu | `shrink-0` | `h-full min-h-0 flex-1` |
| Mühürlü sahne | `w-full shrink-0` | `h-screen … min-h-0 flex-1` |
| Pilot kök ve sahne (`JuniorPilotPlayer.tsx`) | `shrink-0` | `h-full min-h-0 flex-1` / `h-screen` |

`fill` prop’u duruyor. Yükseklik kilidi `fill && fullscreen` iken kurulur. Normal ders sayfasında `fill` açık olsa da kolon içerik yüksekliğini korur.

Stüdyo `RoomFrame` sınıfına `h-full` / `min-h-0` / `overflow-hidden` eklenmedi. Kaydırma kabı ders `<main>` öğesi.

---

## ADIM 3 — Kapılar

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | temiz (çıkış 0) |
| `npx vitest run` | 1968 geçti, 10 kaldı. On test akademi süre mührü (`01_office_ai` timings). Bu görevden önce de kırıktı. `junior-stage-containment` 9/9, `junior-player-clock` 16/16 geçti. |
| `verify:junior-content` | OK — 111 senaryo |
| `verify:junior-sync` | OK |
| `verify:junior-visual-ops` | OK |
| `verify:boundaries` | OK |

360×640, `jr_06_mat-1`, kaydırma 0:

| | Ölçü |
|---|---|
| `--player-stage-min` | `17.5rem` |
| Sahne tuvali | 280×305px, `min-height: 280px`, `flex-shrink: 0` |
| Sinema tahtası | 301×321px, `min-height: 280px`, `flex-shrink: 0` |
| Oynatıcı kabuğu | 556px, taban 280px, `flex-shrink: 0` |
| `<main>` | `overflow-y: auto`, client 592px, scroll 3285px, kayıyor |

Kadrajda «Bölünebilme Dedektifleri» başlığı, bilye kutuları ve kontrol şeridi birlikte duruyor. Tuval 0px şeridine inmiyor.

---

## Dokunulan dosyalar

| Dosya | Ne |
|---|---|
| `app/globals.css` | Düz 17.5rem taban; üç katmanda `min-height` + `flex-shrink: 0`; tahta `step-art` sıfırlamasının dışında |
| `components/junior/lesson-engine/JuniorLessonEngine.tsx` | Kabuk `shrink-0`; `min-h-0` yok; tuval sınıf yedeği 280px |
| `components/junior/listen-and-tell.tsx` | Normal mod `w-full shrink-0` |
| `components/junior/vector-player.tsx` | Pilot ve mühürlü sarmalayıcı normal modda daralmaz; kilit tam ekranda |
| `components/junior/pilot-player/JuniorPilotPlayer.tsx` | Normal sahne `shrink-0`; tahta tabanı 280px; `flex-1` tam ekranda |
| `components/junior/pilot-player/DetectiveBoardStage.tsx` | Rakam boy kapsayıcısı iç katmanda; `65cqh` |
| `tests/kernel/junior-stage-containment.test.ts` | Sözleşme düz 17.5rem ve ortak taban |
| `tests/kernel/junior-player-clock.test.ts` | Normal mod sınıf zinciri `shrink-0` |
