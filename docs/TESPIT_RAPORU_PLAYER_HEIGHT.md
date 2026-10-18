# TESPİT RAPORU — Junior Pilot Oynatıcı Dikey Yüksekliği

**Tarih:** 2026-10-18  
**Karar sahibi:** CEO + SUPER_ADMIN  
**Kapsam:** `http://localhost:3000/junior/ders/jr_06_mat-5` koyu oynatıcı tuvali (`JuniorPilotPlayer` / `VectorPlayer`) ile «Etkinlik ve Oyun Stüdyosu» arasındaki atıl dikey boşluğun kapatılması.  
**Durum:** Tespit tamamlandı; yükseklik düzenlemesi uygulandı.

---

## ADIM 1 — Konteynır ve Yükseklik Tespiti

### 1.1 Teknik kaynak (kök neden)

Atıl boşluğun birincil kaynağı sahne bileşenleri değil; **studio-flow kabuğundaki sabit tavan** idi.

| Katman | Dosya | Bulgu |
|--------|-------|--------|
| Shell yüksekliği | `components/junior/activity-studio.tsx` → `Mat5FocusedLayout` | Eski: `h-[min(36rem,calc(100dvh-9rem))] min-h-[24rem]` — 1080p civarında fiilen **36rem (576px)** tavana oturuyordu |
| Oynatıcı–stüdyo aralığı | Aynı dosya, iç sütun | Eski: `gap-6` (1.5rem) — tuval ile stüdyo kartı arasında ekstra beyaz bant |
| Sayfa kabuğu | `app/junior/ders/[lessonKey]/page.tsx` | Pilot derslerde `data-junior-lesson-layout="studio-flow"` + `gap-3` / `pb-6` — kaydırmalı akış; oynatıcı viewport’u doldurmazsa altta boşluk görünür |

### 1.2 İncelenen ama kök neden olmayan yüzeyler

| Dosya | Sonuç |
|-------|--------|
| `JuniorPilotPlayer.tsx` | `fill` + `h-full` / `flex-1`; sahne tuvali `absolute inset-0`; kontrol/altyazı `shrink-0`. İç tavan yok. |
| `vector-player.tsx` | Pilot yolu `JuniorPilotPlayer`’a delege; `fill` ile ebeveyn yüksekliğini doldurur. |
| `MarbleTrayStage` / `FactorMultipleStage` / `DetectiveBoardStage` / `SummaryPromptStage` | `h-full min-h-0`; SVG’ler `preserveAspectRatio="xMidYMid meet"` veya yüzde/`clamp` ile esnek. Dikey artışı karşılar. |
| `listen-and-tell.tsx` | `VectorPlayer fill` + tell bandı `shrink-0`; kabuk büyüyünce koyu tuval (`flex-1`) büyür. |

**Sonuç:** Alt boşluk, sahne SVG taşmasından değil; **36rem cinema shell tavanı + gap-6** kombinasyonundan kaynaklanıyordu.

---

## ADIM 2 — Uygulanan Düzenleme

Dosya: `components/junior/activity-studio.tsx` (`Mat5FocusedLayout`)

| Özellik | Önce | Sonra |
|---------|------|-------|
| Shell yüksekliği | `h-[min(36rem,calc(100dvh-9rem))]` | `h-[min(48rem,calc(100dvh-6.5rem))]` |
| Minimum yükseklik | `min-h-[24rem]` | `min-h-[28rem]` |
| Oynatıcı ↔ stüdyo gap | `gap-6` | `gap-3` |
| DOM işareti | — | `data-junior-player-shell=""` |

### Korunanlar

- Üst chapter şeridi, altyazı bandı ve alt kontrol çubuğu `shrink-0` kaldı.
- Sahne katmanı `flex-1` + `absolute inset-0` ile büyüyen alanı doldurur.
- SVG / `@container` / `clamp` ölçekleme dokunulmadı — taşma riski artırılmadı.

---

## ADIM 3 — Görsel Doğrulama

**Rota:** `http://localhost:3000/junior/ders/jr_06_mat-5`  
**Ölçüm ortamı:** Cursor tarayıcı CDP, `Emulation.setDeviceMetricsOverride` → **1440×900**

| Metrik | Değer |
|--------|--------|
| `data-junior-player-shell` yükseklik | **768px** (`48rem`) |
| Eski tavan (`36rem`) | 576px |
| Net kazanç | **+192px** |
| Sahne board (`data-junior-cinema-board`) | 555px |
| Shell → `#junior-activity-hub` gap | **12px** (`gap-3`) |
| «Etkinlik ve Oyun Stüdyosu» viewport içi | Evet (`studioTop ≈ 894` / `vh 900`) |

Gözlem:

1. Koyu cinema tuvali +192px yükseldi; eski 36rem tavanın bıraktığı atıl bant kapandı.
2. Stüdyo başlığı ilk viewport’un altına yaslanacak kadar yaklaştı (gap 24px → 12px).
3. Chapter şeridi, altyazı ve kontrol çubuğu yerinde; MarbleTray sahnesi (`MASA HAZIR`) taşmadan ölçeklendi.

---

## SUPER_ADMIN özeti

- **Kök neden:** `Mat5FocusedLayout` player shell `36rem` tavanı.  
- **Müdahale:** Shell → `48rem` / `100dvh-6.5rem`, `min-h` → `28rem`, gap → `3`.  
- **Doğrulama:** 1440×900’de shell **768px** (+192px), stüdyo gap **12px**.  
- **Risk:** Düşük — yalnızca dış kabuk yüksekliği; sahne/kontrol mimarisi aynı.  
- **Rapor:** `docs/TESPIT_RAPORU_PLAYER_HEIGHT.md`
