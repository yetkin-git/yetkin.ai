# TEDAVİ RAPORU — Detective Board Kural Rozetleri / Büyüteç Çakışması

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Sahne 7 / 12 (Son Basamak Dedektifleri)  
**Durum:** Tedavi tamamlandı. Kural rozetleri ile büyüteç ikonu çakışmıyor.

---

## ADIM 1 — Teşhis

### Dosya

`components/junior/pilot-player/DetectiveBoardStage.tsx`

### Kök neden

| Katman | Eski davranış | Etki |
|--------|---------------|------|
| Üst kural rozetleri | `flex-nowrap` + `overflow-x-auto` + rozet içinde `🔎` emoji | Dar alanda yatay sıkışıklık |
| Büyüteç (`DigitTile`) | `absolute -right-5 -top-5` | Karo dışına taşarak üst rozet satırına (özellikle «10 Kuralı») biniyordu |
| Dikey boşluk | Rozet satırı ile `h-full` basamak karoları arasında yetersiz ayırım | Üst köşe büyüteci rozet alt kenarıyla çarpışıyordu |

Sahne 7 koreografisi (`lib/junior/pilot-engine/mat-5.choreography.ts`, cue-07) `ruleBadges` + `magnifyingGlass: true` birlikte açıkken bug görünür hale geliyordu.

---

## ADIM 2 — Layout Tedavisi

### Yapılanlar

1. **Büyüteç konumu:** `-right-5 -top-5` → `bottom-1.5 right-1.5` (karo alt-sağında, rozet satırından uzak).
2. **Rozet satırı:** `flex-wrap`, `gap-1.5 sm:gap-2`, `mb-2.5 sm:mb-3`, `z-20`; `shrink-0` korundu.
3. **Rozet tipografi:** `text-[10px] sm:text-xs`, `leading-tight`; gereksiz `🔎` emoji kaldırıldı (ayrı büyüteç katmanı var).
4. **Dikey düzen:** Basamak karoları + karar panosu grid düzeni değiştirilmedi.

### Dokunulan satırlar (özet)

- `DigitTile` büyüteç kapsayıcısı
- Ana layout üst `ruleBadges` flex satırı

---

## ADIM 3 — Görsel Doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` — bölüm 3 (Son Basamak Dedektifleri), büyüteçli anahtar kare.

### Kanıt (DOM geometri)

| Ölçüm | Sonuç |
|-------|--------|
| Rozet satırı alt kenarı | ~y=121 |
| Büyüteç üst kenarı | ~y=240 |
| Dikey boşluk | ~119 px |
| Bounding-box overlap | **0** (`overlaps: []`) |

### Görsel durum

- «2 Kuralı», «5 Kuralı», «10 Kuralı» rozetleri yan yana / wrap ile okunabilir.
- Büyüteç Birler karosunun alt-sağında; rozet metnini örtmez.
- ONLAR / BİRLER dikey karo düzeni ve karar panosu korunuyor.

---

## SUPER_ADMIN Özeti

Sıfır riskli CSS/layout düzeltmesi uygulandı. Koreografi, motor state veya pedagoji mühürü değişmedi. Canlı doğrulama: rozet–büyüteç çakışması kapalı.
