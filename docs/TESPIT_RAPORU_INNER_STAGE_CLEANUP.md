# TESPİT RAPORU — Sahne İç Çerçeve Temizliği ve Yüzey Bütünleştirme

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Kapsam:** `JuniorPilotPlayer` ana tuvali içinde pilot sahne bileşenlerinin (`*Stage.tsx`) ürettiği ikinci iç kutu / matruşka kart görünümü.  
**Rota:** `http://localhost:3000/junior/ders/jr_06_mat-5`  
**Durum:** Tespit tamamlandı; sadeleştirme uygulandı; CDP ile doğrulandı.

---

## ADIM 1 — İç Çerçeve Tespiti

### 1.1 Tek tuval (korunacak)

| Katman | Dosya / işaret | Rol |
|--------|----------------|-----|
| Ana oynatıcı kartı | `JuniorPilotPlayer` → `[data-junior-cinema-stage]` | Tek çerçeve: `border border-slate-700/80`, `bg-[#0b1120]`, `rounded-2xl`, `shadow-2xl` |
| Sahne tahtası | `[data-junior-cinema-board]` | Şeffaf; yalnızca `px-2 py-1` nefes payı |
| Sahne yuvası | `[data-junior-stage-canvas]` → `absolute inset-0` | Sahne kökünü tuvale yapıştırır |

### 1.2 Matruşka kaynağı (kaldırıldı)

Her pilot `*Stage` kökü, ana tuvalin üstüne **ikinci bir kart** basıyordu:

| Bileşen | Eski kök chrome |
|---------|-----------------|
| `MarbleTrayStage` | `rounded-2xl border border-cyan-400/20 bg-gradient-to-br … shadow-inner` + SVG kadife tepsi `rect` (stroke + dolgu) |
| `DetectiveBoardStage` | `rounded-2xl border border-cyan/amber-… bg-gradient-to-br … shadow-inner` (iki layout kökü) |
| `FactorMultipleStage` | `rounded-2xl border border-indigo-400/25 bg-gradient-to-br … shadow-inner` |
| `GraphicOpStage` | `rounded-2xl border border-indigo-400/25 bg-gradient-to-br …` |
| `SummaryPromptStage` | `rounded-2xl border border-emerald-400/30 bg-gradient-to-br … shadow-inner` |

**Sonuç:** «İç içe ekran» hissi sahne elemanlarından değil; **sahne kökünün bağımsız border + gradient + rounded + shadow** kombinasyonundan geliyordu.

---

## ADIM 2 — Uygulanan Sadeleştirme

### 2.1 Kök yüzeyler

Tüm `*Stage` dış kapsayıcılarından şu sınıflar çıkarıldı:

- `rounded-2xl`
- `border border-*-400/…`
- `bg-gradient-to-br from-[#0f172a] via-… to-[#1e1b4b]`
- `shadow-inner`

Yerine yalnızca layout korundu: `relative h-full / flex … overflow-hidden` (+ gerekli `p-*`).

### 2.2 MarbleTrayStage özel

SVG içindeki kadife tepsi zemini (`tray-surface` gradyanı + stroke’lu `rect`) kaldırıldı. Rozetler, kutu bölmeleri ve bilyeler doğrudan ana tuval zemini üzerinde durur.

### 2.3 Bilinçli olarak korunanlar

İçerik panelleri (karşılaştırma sütunları, DigitTile, özet kartları, callout rozetleri) **işlevsel UI** olduğu için border/bg’leri bırakıldı. Bunlar ikinci «sahne kartı» değil; tuval üzerindeki pedagojik elemanlardır.

`JuniorPilotPlayer` chrome’una dokunulmadı (tek çerçeve ilkesi).

---

## ADIM 3 — Görsel / CDP Doğrulama

**Ortam:** Cursor tarayıcı + CDP `Runtime.evaluate`  
**Ölçülen:** `[data-junior-stage-canvas] > div > div` (aktif sahne kökü)

| Sahne / chapter | Kök `background` | `border` | `borderRadius` | `boxShadow` |
|-----------------|------------------|----------|----------------|-------------|
| Ch.1 `MarbleTrayStage` | `rgba(0,0,0,0)` | `0px` | `0px` | `none` |
| Ch.2 `FactorMultipleStage` | `rgba(0,0,0,0)` | `0px` | `0px` | `none` (içeride 2 içerik paneli duruyor) |
| Ch.3 `DetectiveBoardStage` | `rgba(0,0,0,0)` | `0px` | `0px` | `none` |

Ana tuval (`[data-junior-cinema-stage]`) tek kart olarak kaldı: `bg #0b1120` + `rounded-2xl` + `border-slate-700/80`.

**Flex/grid:** Kök padding ve grid sınıfları korundu; hizalama bozulmadı.

---

## SUPER_ADMIN özeti

1. Matruşka kök nedeni: sahne `*Stage` köklerindeki ikinci kart chrome’u.  
2. Düzeltme: kök border/gradient/radius/shadow kaldırıldı; MarbleTray SVG tepsi çerçevesi de silindi.  
3. Tek çerçeve: yalnızca `JuniorPilotPlayer` cinema stage.  
4. Risk: düşük — layout/state/cue mantığına dokunulmadı; yalnızca görsel yüzey sınıfları.

**Dosyalar:**

- `components/junior/pilot-player/MarbleTrayStage.tsx`
- `components/junior/pilot-player/DetectiveBoardStage.tsx`
- `components/junior/pilot-player/FactorMultipleStage.tsx`
- `components/junior/pilot-player/GraphicOpStage.tsx`
- `components/junior/pilot-player/SummaryPromptStage.tsx`
- `docs/TESPIT_RAPORU_INNER_STAGE_CLEANUP.md` (bu rapor)
