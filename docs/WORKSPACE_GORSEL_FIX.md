# WORKSPACE GÖRSEL FIX — Paket 4

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders 4 | `01_office_ai-3` — Sunum Fabrikası (PowerPoint) |
| Ders 6 | `01_office_ai-4` — E-Posta Akışı (Outlook) |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay | CEO — görsel temizlik onayı |
| Belirti 1 | Ders 4 ve 6 sahnelerinde Ders 1/2 Excel karesi (“Mart 2026 Tahsilat Dökümü”) letterbox’tan sızıyor |
| Belirti 2 | CEBİNE KOY ve SIFIR KUTU yeşil/mavi rozet kartlarında yazı kutu dışına taşıyor |

---

## Yönetici özeti

Canlı sahnenin 16:9 letterbox’ı tüm ofis derslerinde aynı mühürlü Excel plakasını (`/media/01_office_ai_01_frame_01.png`) basıyordu. Garson penceresi canvas’ı tam örtmediği için PowerPoint ve Outlook sahnelerinde Excel tablosu silueti görünüyordu.

Kartlarda `overflow: visible` + `min-width: min-content` metni kutu dışına itiyordu. Tedavi: arka planı ders temasına kilitlemek; KPI / sıfır kutu / CEBİNE KOY kartlarına `overflow: hidden`, `word-break` ve `padding: clamp(...)` bağlamak.

---

## Kök neden

1. `academyVisualCinematicFrameSrc` 9 ofis dersinin hepsine Excel cinematic kareyi veriyordu.
2. `LessonCinemaEyeLayer` bu kareyi `.academy-player-eye-backdrop` olarak her zaman basıyordu (`opacity: 0.28`, `object-fit: cover`).
3. `.academy-player-waiter` inset (`3.15rem 0.7rem 3.55rem`) letterbox bırakır; Outlook masasının zemini şeffaftı.
4. KPI ve SIFIR KUTU kartları `overflow: visible` ve grup metinleri `min-width: min-content` ile küçülemiyordu.

---

## CSS / JSX temizliği

### Arka plan — ders teması

| Ders | Tema | Letterbox | Excel PNG |
|------|------|-----------|-----------|
| 1, 2, 5, 6, k1 | `excel` | mühürlü tahsilat karesi | evet |
| 4 (`01_office_ai-3`) | `pptx` | PowerPoint turuncu-gri masaüstü | hayır |
| 6 (`01_office_ai-4`) | `outlook` | Outlook koyu masaüstü | hayır |
| g1 | `gmail` | Outlook/Gmail koyu masaüstü | hayır |
| w1 | `word` | Word lacivert masaüstü | hayır |

```
.academy-player-eye-stack[data-academy-stage-theme="pptx"] .academy-player-eye-canvas
  → radial turuncu + koyu PowerPoint masaüstü
.academy-player-eye-stack[data-academy-stage-theme="outlook"] .academy-player-eye-canvas
  → radial cyan + Outlook masaüstü
.academy-player-waiter[data-academy-waiter-stage="pptx"]  → #c8c8c8
.academy-player-waiter[data-academy-waiter-stage="outlook"] → #0b1220
.academy-outlook-desk  → opak koyu zemin (Excel silueti geçmez)
```

Excel karesi yalnız `stageTheme === "excel"` iken `<img class="academy-player-eye-backdrop">` basılır. Diğer derslerde `.academy-player-eye-backdrop--desk` CSS plakası durur; yanlışlıkla gelen PNG `display: none` olur.

### Kart tipografisi — kutu koruması

| Seçici | Kural |
|--------|--------|
| `.academy-pptx-kpi` | `overflow: hidden`, `min-height: 4.35rem`, `padding: clamp(...)`, `word-break: break-word` |
| `.academy-pptx-kpi-label` / `-value` | `overflow: hidden`, `min-width: 0`, `max-width: 100%` |
| `.academy-outlook-group` | `overflow: hidden`, `min-height: 3.6rem`, `padding: clamp(...)` |
| `.academy-outlook-group-label` / `-title` / `-detail` | `min-width: 0` (min-content kaldırıldı), `overflow-wrap: break-word` |
| `.academy-excel-checklist` | `overflow: hidden`, `padding: clamp(...)` — CEBİNE KOY · 3 adım |

Üç nokta yok: `text-overflow: clip` durur. Outlook sözleşmesi `overflow-wrap: anywhere` kullanmaz.

---

## Düzeltilen bileşenler

| Dosya | Değişiklik |
|-------|------------|
| `lib/academy/excel-workspace.ts` | `academyVisualStageBackdropTheme`; Excel karesi yalnız Excel layout |
| `components/academy/lesson-visual-stage.tsx` | `data-academy-stage-theme`; Excel img / desk plaka ayrımı |
| `components/academy/lesson-pptx-workspace.tsx` | CEBİNE KOY overlay aynı; tuval teması CSS |
| `components/academy/lesson-outlook-workspace.tsx` | SIFIR KUTU grup kartı `overflow-hidden` |
| `components/academy/lesson-gmail-workspace.tsx` | Aynı grup kartı kilitleri |
| `components/academy/lesson-slide-workspace.tsx` | KPI `overflow-hidden min-w-0` |
| `app/globals.css` | Tema letterbox, opak masa, kart clamp/overflow |
| `tests/academy/curriculum-player-surface.test.ts` | Paket 4 sözleşmesi |
| `tests/academy/pptx-workspace.test.ts` | KPI overflow/clamp kilidi |
| `tests/academy/outlook-workspace.test.ts` | SIFIR KUTU overflow/clamp kilidi |
| `tests/academy/excel-workspace.test.ts` | Cinematic kare yalnız Excel |

---

## Doğrulama

```
npx vitest run tests/academy/curriculum-player-surface.test.ts
```

İlgili kilitler: `tests/academy/pptx-workspace.test.ts`, `tests/academy/outlook-workspace.test.ts`, `tests/academy/excel-workspace.test.ts`.

### Elle bakılacaklar

1. `/academy/01_office_ai/oyna` — 4. ders (Sunum): letterbox PowerPoint masaüstü; Excel tahsilat tablosu yok.
2. Aynı yol — 6. ders (E-Posta): letterbox Outlook masaüstü; “Mart 2026 Tahsilat” silueti yok.
3. CEBİNE KOY — yeşil/mavi KPI ve 3 adım overlay yazısı kart sınırında kalır.
4. SIFIR KUTU — ACİL / BEKLE / ARŞİV grup kartları taşmaz.
5. Dar laptop viewport — `clamp` padding ve `overflow: hidden` yazıyı içeride tutar.

---

## Bilinçli sözleşme

Excel cinematic kare Ders 1/2 (ve diğer Excel layout dersleri) letterbox’ında kalır. Sunum ve e-posta sahneleri kendi ofis temasını taşır; ortak mock-up kaplama yoktur. Rozet kartı metni kutu içinde kırılır, üç noktaya düşmez.
