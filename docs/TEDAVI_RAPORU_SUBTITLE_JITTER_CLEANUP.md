# TEDAVİ RAPORU — Altyazı Aktif Kelime Font-Weight / Titreme Temizliği

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — `JuniorPilotPlayer` canlı altyazı bandı  
**Durum:** Tedavi tamamlandı. Aktif kelime geçişinde layout shift / jitter yok (0 px).

---

## ADIM 1 — Teşhis

### Taranan yüzeyler

| Dosya / bileşen | Aktif kelime font-weight artışı? |
|-----------------|----------------------------------|
| `components/junior/pilot-player/JuniorPilotPlayer.tsx` (`data-junior-live-caption`) | **Evet — ana kaynak** |
| `components/junior/vector-player.tsx` (legacy `data-junior-live-caption`) | Hayır — tek satır metin, kelime vurgusu yok |
| `components/academy/lesson-karaoke-strip.tsx` + `app/globals.css` | Hayır — zaten `font-weight: inherit` / layout-shift kilidi |
| `CaptionsOverlay` / `SubtitleBar` adlı ayrı bileşenler | Depoda yok (isimler canlı kodda kullanılmıyor) |

### Kök neden (`JuniorPilotPlayer`)

Aktif kelime sınıfı şuydu:

```text
bg-amber-400/25 font-black text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-4
```

- Konteyner `font-semibold` (600) iken aktif kelime `font-black` (900) oluyordu → glif genişliği artıyor → cümle reflow / titreme.
- `underline` + `decoration-2` + `underline-offset-4` ek dikey/görsel kayma riski taşıyordu.

---

## ADIM 2 — Tedavi

### İlke

Aktif ve pasif kelimelerde **font-weight birebir eşit**. Vurgu yalnızca amber arka plan + yazı rengi. Padding / box modeli tüm kelimelerde sabit.

### Kod (`JuniorPilotPlayer.tsx`)

1. Altyazı bandı: `font-semibold` → `font-medium` (sabit 500).
2. Her kelime span’ına `font-medium`, `box-border`, `px-1 py-0` (aktif/pasif aynı).
3. Aktif: `bg-amber-400/30 text-amber-300` — **font-black / underline yok**.
4. Pasif past / future: `bg-transparent` + `text-white` / `text-slate-300`.
5. `data-junior-caption-word="active|past|future"` eklendi (ölçüm ve sözleşme için).

### Sözleşme testi

`tests/kernel/junior-player-clock.test.ts` — aktif kelime dalında `font-black|bold|semibold|extrabold` ve `underline` yasak; `bg-amber-400/30 text-amber-300` + `data-junior-caption-word` zorunlu.

```text
vitest: tests/kernel/junior-player-clock.test.ts → 16/16 geçti
```

---

## ADIM 3 — Görsel / CDP doğrulama

**Sayfa:** `/junior/ders/jr_06_mat-5` (Sahne 1, altyazı açık, oynatma sürerken)

| Ölçüm | Sonuç |
|-------|--------|
| Tüm kelimelerde `font-weight` | Hepsi `500` (`uniqueWeightsAll: ["500"]`) |
| Aynı cue içinde 3 örneklem (~700 ms arayla) | `sameCue: true` |
| Kelime `x` / `width` kayması | `maxShiftPx: 0` |
| `shiftDetails` | `[]` (hiçbir kelime oynamadı) |
| Aktif vurgu | Amber arka plan + `text-amber-300`; kalınlık artışı yok |

**Sonuç:** Kelimeler değiştikçe cümledeki diğer kelimeler milim oynamıyor — 0 layout shift.

---

## SUPER_ADMIN özeti

- Junior pilot altyazısındaki karaoke titremesi, aktif kelimedeki `font-black` + underline’dan geliyordu.
- Vurgu artık yalnızca amber highlight; font-weight sabit `medium` (500).
- Academy karaoke tarafı zaten kilitliydi; bu turda dokunulmadı.
- Regresyon kilidi: `junior-player-clock` sözleşme assert’leri.
