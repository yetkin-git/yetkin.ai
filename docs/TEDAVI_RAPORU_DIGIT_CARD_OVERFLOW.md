# Tedavi Raporu — Digit Card Overflow (DetectiveBoard)

**Tarih:** 2026-10-18  
**Hedef ekran:** `/junior/ders/jr_06_mat-5` · Sahne 7/12 · Son Basamak Dedektifleri (15 → BİRLER “5”)  
**Dosya:** `components/junior/pilot-player/DetectiveBoardStage.tsx` (`DigitTile`)  
**Durum:** TEDAVİ EDİLDİ — SUPER_ADMIN bilgilendirmesi

---

## 1. Teşhis

Aktif/vurgulu basamak karosunda (`isHighlighted === true`) şu stiller vardı:

| Eski stil | Etki |
|-----------|------|
| `transform: scale(1.1) translateY(-4px)` | Kartı büyütüp **4px yukarı** kaydırıyordu; BİRLER üst kenarı ONLAR’dan sapıyordu |
| `boxShadow: 0 0 28px …` (dış glow) | Işıma tuval üstüne / `data-junior-rule-badges` şeridine taşıyordu |

Pasif ONLAR (“1”) hizada kalırken vurgulu BİRLER (“5”) üst bölüm şeridi ve kural rozetlerinin üzerine biniyordu.

---

## 2. Tedavi (CSS / Tailwind)

### `DigitTile` vurgu stili

- **Kaldırıldı:** `scale(1.1)`, `translateY(-4px)`, dışarı taşan `0 0 28px` glow alanı (`HIGHLIGHT_STYLES.*.glow`).
- **Eklendi:** Sınır *içi* vurgu — `inset 0 0 24px …` + `inset 0 0 0 2px` ring rengi; düşey gölge yalnızca `0 8px 18px` (aşağı yönlü, üst taşma yok).
- **Eklendi:** Karoya `overflow-hidden` — iç ışıma / parlama şeridi dışarı sızmaz.
- **Transition:** Yalnız `opacity` / `box-shadow` / `border-color` (transform yok → hiza zıplamaz).

### Tuval / layout kilitleri

- Basamak karosu satırına `overflow-hidden`.
- Kural rozetleri varken üst padding: `pt-4 sm:pt-5` → `pt-5 sm:pt-6` (rozet–karo boşluğu güçlendirildi).
- Kök tuval zaten `overflow-hidden` idi; korundu.

---

## 3. Görsel doğrulama (localhost)

Ölçüm anı: `focusOnes15` (~105700 ms), sayı **15**, BİRLER vurgulu (amber + büyüteç).

| Ölçüm | Onlar (“1”) | Birler (“5”) |
|-------|-------------|--------------|
| `getBoundingClientRect().top` | 89.70 px | 89.70 px |
| `height` | 204.41 px | 204.41 px |
| `transform` | `none` | `none` |
| `topDelta` | **0** | |
| Rozet altına taşma (`onesOverlapsBadges`) | **false** | |

Sonuç: Üst kenarlar milimetrik aynı hizada; “5” kartı kural rozetlerinin üzerine binmiyor.

---

## 4. Risk / simetri notu

- Vurgu artık **taşırmayan** inset ring + gradient border ile sağlanıyor; dikey simetri bozulmuyor.
- Aynı `DigitTile` trap-vs-truth (2/5/10 paneli) yolunda da kullanıldığı için orada da scale/translate taşması ortadan kalktı.
