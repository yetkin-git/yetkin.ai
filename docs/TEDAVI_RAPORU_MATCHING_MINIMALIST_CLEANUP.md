# TEDAVİ RAPORU — Eşleştirme Etkinliği Minimalist Sütun Ayrıştırma

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Etkinlik Stüdyosu / Eşleştir  
**Durum:** Tedavi tamamlandı. KAVRAMLAR ve AÇIKLAMALAR sütunları ayrıştı; kartlar kompakt.

---

## ADIM 1 — Teşhis

### Dosya

`components/junior/activity-rail.tsx` → `MatchBoard`  
(Etkinlik Stüdyosu sarmalayıcısı: `components/junior/activity-studio.tsx` → `MatchingGrid` → `layout="studio"`)

### Kök neden

| Katman | Eski davranış | Etki |
|--------|---------------|------|
| Sütun grid | `gap-4 md:gap-6` (24px iki sütunda) | Sol/sağ kartlar ortada yapışık; bağlantı çizgisi için boşluk yok |
| Studio kart (`spacious`) | `min-h-[7rem]`, `py-5`, `text-base sm:text-lg` | Kutular kaba ve yüksek; dikey hiyerarşi bozuluyor |
| Bağlantı metni | Sol kartta `↔ {açıklama}` her genişlikte | İki sütunda SVG çizgi varken kartı şişiriyor, hizayı bozuyor |
| İki sütun eşiği | `@min-[584px]/match` + `gap-6` varsayımı | `gap-12` ile geometri uyumsuz kalırdı |

---

## ADIM 2 — Layout Tedavisi

### Yapılanlar

1. **Sütun arası boşluk:** `gap-4 md:gap-6` → `gap-5` (tek sütun) + `@min-[608px]/match:gap-12` (48px).
2. **İki sütun eşiği:** `584` → `608` (`MATCH_COLUMNS_MIN_PX` + tüm `@min-[608px]/match` sınıfları senkron).
3. **Compact kart (yalnız studio match):** `gameCardClass(..., compact)` → `px-2.5` / `sm:px-3`, `py-2.5`, `text-xs sm:text-sm`; `min-h-[7rem]` kaldırıldı. Cloze/Order `spacious` boyutları bozulmadı.
4. **Sütun içi dikey aralık:** `stackGap = "gap-3"` (12px) — rail ve studio ortak.
5. **Bağlantı netliği:** İki sütunda `↔` metni gizli (`@min-[608px]/match:hidden`); SVG stroke `3.5` → `2.75`; port `h-3.5 w-3.5` → `h-3 w-3`.
6. **Board padding (studio):** `p-4 sm:p-6` → `p-3 sm:p-4`.

### Dokunulan satırlar (özet)

- `gameCardClass` — opsiyonel `compact` parametresi
- `MATCH_COLUMNS_MIN_PX` + `@min-[608px]/match` breakpoint ailesi
- `MatchBoard` grid / kart / link / port sınıfları

---

## ADIM 3 — Görsel Doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` — Etkinlik Stüdyosu → Eşleştir (geniş viewport ~1400px).

### Kanıt (DOM geometri)

| Ölçüm | Sonuç |
|-------|--------|
| `data-junior-board-layout` | `studio` |
| Grid sütunları | `345px 345px` |
| Sütun arası (`columnGapPx`) | **48 px** (`gap-12`) |
| Sütun içi stack gap | **12 px** (`gap-3`) |
| Sol kart yükseklik / padding / font | ~42 px / `10px 12px` / `14px` |
| Sütun overlap | **yok** (`overlap: false`) |
| Eşleşme SVG path | çizildi (`linkCount: 1`, stroke `2.75px`) |

### Görsel durum

- KAVRAMLAR (sol) ve AÇIKLAMALAR (sağ) net ayrılmış.
- Kartlar kompakt; bağlantı noktaları ve SVG eğrisi ortadaki 48px koridorda okunaklı.
- Dar viewport (&lt;608px container): tek sütun + dokunarak eşleştir korunuyor.

---

## SUPER_ADMIN notu

Sıfır davranış riski: eşleştirme mantığı, doğru/yanlış dokunsal geri bildirim ve Cloze/Dedektif studio kart boyutları değiştirilmedi. Yalnızca MatchBoard görsel yoğunluğu ve sütun ayrımı sadeleştirildi.
