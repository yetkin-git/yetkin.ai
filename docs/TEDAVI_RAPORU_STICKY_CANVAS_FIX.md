# TEDAVİ RAPORU — Sticky Canvas (Sahne Asılı Kalma) / Zifiri Siyah Engelleme

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5`  
**Durum:** Tedavi tamamlandı. Ses akarken tuval boşaltılmıyor; son dolu kare yeni görsel cue’ya kadar asılı kalıyor.

---

## ADIM 1 — Teşhis

### İncelenen dosyalar

| Dosya | Rol |
|-------|-----|
| `components/junior/pilot-player/JuniorPilotPlayer.tsx` | Pilot tuval render + sticky hold |
| `components/junior/vector-player.tsx` | Pilot dersi `JuniorPilotPlayer`’a delege eder |
| `lib/junior/pilot-engine/graph-clock.ts` | Grafik ders saat kurucusu (mat-5 dışı) |
| `packages/junior-graphic/src/state-reducer.ts` | Saf `reduceSceneState` / `SET_STAGE` |

### Kök neden

`SET_STAGE` yeni layout’a geçer geçmez sahne state’ini sıfırlıyor (`marblesSpawned` dışı, `detective.digits = []`, `factorTree.visible = false`, `callout = null`, grafik kartları boş). Bir sonraki görsel op (`SPAWN_MARBLES`, `SHOW_FACTOR_TREE`, `INSPECT_NUMBER` …) gelene kadar canlı state **boş tuval** üretiyor.

Ses (PCM) bu aralıkta devam ettiği için öğrenci zifiri siyah `#0b1120` zemin görüyordu.

| Geçiş | Boşluk örneği (mühürlü saat) |
|-------|------------------------------|
| cue-01 → SPAWN | `0` → `SPAWN_MARBLES@12001` |
| cue-04 SET_STAGE | `43846` → `SHOW_FACTOR_TREE@54113` (~10 s) |
| cue-06 SET_STAGE | `77765` → `INSPECT_NUMBER@93075` (~15 s) |
| cue-09 / cue-11 | Benzer SET_STAGE → ilk görsel op boşlukları |

`clearCanvas` / `unmountCurrentScene` adı yok; fiili boşluk **layout switch + state reset + null/empty stage render** birleşimiydi. `GraphicOpStage` dolu çizim yokken `null` dönüyordu (grafik derslerde aynı semptom).

---

## ADIM 2 — Tedavi (Sticky Frame Retention)

### Yeni modül

`lib/junior/pilot-engine/sticky-frame.ts`

- `sceneHasRenderableContent(state)` — layout’a göre somut görsel yük var mı?
- `resolveStickyFrame(live, held, { forceClear? })` — canlı boşsa son dolu kareyi tutar

### Oynatıcı

`JuniorPilotPlayer.tsx`

1. **Hold last active state:** Dolu kare `heldSceneRef`’te saklanır; boş `SET_STAGE` aralığında tuval `display = held` basar (`data-junior-sticky-frame="true"`).
2. **No black canvas gap:** Soğuk açılış / ası yokken `AmbientHoldPlate` (yumuşak cyan radial plaka) — zifiri siyah yerine «Sahne hazırlanıyor».
3. **Sahne temizleme sınırı:** Manuel seek / bölüm tıklama / yeniden başlat asıyı sıfırlar (`clearStickyHold`). Otomatik oynatmada ası korunur. Ders bitiş overlay’inde son kare bilinçli tutulur; tekrar dinle asıyı temizler.
4. Chrome başlık/altyazı canlı state’ten gelir; tuval asılı kareden — sinematik köprü.

### Test

`tests/kernel/junior-sticky-frame.test.ts` — cue-04 / cue-06 boşluklarında sticky, yeni cue’da sticky kalkışı, `forceClear`.

---

## ADIM 3 — Görsel doğrulama (`jr_06_mat-5`)

Canlı sayfada PCM saat atlaması (seek UI’siz; ası korunarak):

| An | Beklenen | Gözlem |
|----|----------|--------|
| ~20 s (SPAWN sonrası) | `sticky=false`, marble-tray, bilyeler | ✓ |
| ~53 s (cue-04 SET_STAGE boşluğu) | `sticky=true`, layout=`marble-tray`, başlık cue-04, bilyeler asılı | ✓ |
| ~55 s (SHOW_FACTOR_TREE) | `sticky=false`, factor-vs-multiple, `1 × 6 = 6` | ✓ |
| ~80 s (cue-06 SET_STAGE boşluğu) | `sticky=true`, factor paneli asılı, başlık «Son Basamak Dedektifleri» | ✓ |

Sonuç: Anlatıcı sesi sürerken tuval zifiri siyaha düşmedi; eski görseller yeni sahne içeriği gelene kadar ekranda kaldı.

---

## Dokunulan dosyalar

- `lib/junior/pilot-engine/sticky-frame.ts` *(yeni)*
- `components/junior/pilot-player/JuniorPilotPlayer.tsx`
- `tests/kernel/junior-sticky-frame.test.ts` *(yeni)*
- `docs/TEDAVI_RAPORU_STICKY_CANVAS_FIX.md` *(bu dosya)*

---

## SUPER_ADMIN özeti

Sahne asılı kalma (sticky frame) pilot tuvale eklendi. `SET_STAGE` boşlukları artık önceki dolu kareyi tutuyor; soğuk açılış ambient plaka ile zifiri siyaha düşmüyor. Manuel seek asıyı bilinçli sıfırlar. `jr_06_mat-5` üzerinde cue-04 ve cue-06 boşlukları tarayıcıda doğrulandı.
