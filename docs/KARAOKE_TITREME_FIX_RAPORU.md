# KARAOKE TİTREME FIX RAPORU — Aktif kelime layout shift (Paket 7)

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO (Yapay Zekâ Yöneticisi) — CSS titreme düzeltme izni |
| Kod SSOT | `app/globals.css`, `components/academy/lesson-karaoke-strip.tsx` |
| Paket | 7 — Karaoke altyazı kelime bold titreme |

---

## Yönetici özeti

Konuşulan kelime aktif olunca `font-weight` 450’den 650’ye çıkıyordu. Kalın glif daha geniş olduğu için sağdaki ve soldaki kelimeler X ekseninde itilip çekiliyor, cümle kelime değiştikçe titriyordu (layout shift). Aktif kelime artık **aynı ağırlıkta** kalır; koyuluk `text-shadow: 0 0 0.6px currentColor` (çift katman) ile, renk vurgusu `#fff7e6` + altın hale ile verilir. Kutu genişliği değişmez.

`karaoke-caption.tsx` yok; oynatıcı şeridi `lesson-karaoke-strip.tsx` + `.academy-player-karaoke-word`.

---

## Tespit

| Kural | Eski değer | Etki |
|-------|------------|------|
| Satır `.academy-player-karaoke-line` | `font-weight: 450` | Varsayılan kelime genişliği |
| Aktif `.academy-player-karaoke-word[data-state="active"]` | `font-weight: 650` | Glif metrikleri büyür; satır `flex-wrap` + `justify-center` olduğu için tüm kelimeler yatay kayar |
| Aktif `text-shadow` | yalnızca 22px altın hale | Hale boyayı büyütür, kutuyu büyütmez; ağırlık değişimi asıl titreme kaynağıdır |

JSX `font-bold` kullanmıyordu; kayma tamamen CSS ağırlık override’ından geliyordu.

---

## Tedavi — Teknik Seçenek A (faux-bold, genişlik sabit)

`font-weight` aktif durumda **değiştirilmez**. Kelime `inherit` ile satırın 450 ağırlığını tutar. Koyuluk, harf kutusunu büyütmeyen 0.6px `currentColor` gölge çiftlemesiyle (faux-bold) üretilir.

### 1. Kelime kutusu (`.academy-player-karaoke-word`)

- `font-weight: inherit` — past / active / future aynı genişlik sözleşmesi.
- Geçişler yalnızca `color`, `text-shadow`, `opacity` (layout özelliği yok).

### 2. Aktif kelime (`[data-state="active"]`)

```css
color: #fff7e6;
font-weight: inherit;
text-shadow:
  0 0 0.6px currentColor,
  0 0 0.6px currentColor,
  0 0 22px rgba(212, 175, 122, 0.55),
  0 1px 0 rgba(12, 10, 8, 0.35);
```

- İlk iki katman: kalın görünüm, **0 layout shift**.
- Üçüncü katman: altın parıltı (mevcut sahne vurgusu).
- Dördüncü katman: okunabilirlik için 1px koyu kenar.
- Renk: sıcak beyaz / parlak krem (`#fff7e6`); komşu kelimeler `rgba(247, 241, 227, 0.7–0.88)` kalır.

Pseudo-element / `data-text` (Seçenek B) gerekmedi; ağırlık sabitlenince X kayması durur.

---

## Dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `app/globals.css` | Aktif kelimeden `font-weight: 650` kalktı; `inherit` + 0.6px faux-bold gölge |
| `tests/academy/lesson-karaoke-strip.test.ts` | Layout shift kilidi: 650/700 yok, `inherit` ve `0 0 0.6px currentColor` var |
| `docs/KARAOKE_TITREME_FIX_RAPORU.md` | Bu rapor |

`lesson-karaoke-strip.tsx` işaretçileri (`data-state`, `data-active`) aynı; JSX ağacı değişmedi.

---

## Test

```
npx vitest run tests/academy/lesson-karaoke-strip.test.ts
```

**1 dosya, 6 test, yeşil.** Aktif kelime bloğunda `font-weight: inherit`, `0 0 0.6px currentColor` çift katman, `650` / `700` / `bold` yok.

Layout probe (aynı CSS, 8 kelimelik cümle, her kelime sırayla `data-state="active"`): komşu kelime `maxNeighborDx = 0`; computed `font-weight` her adımda `450` kaldı. `font-weight: 650` geri konursa X kayması yeniden başlar.

Canlı `/academy/01_office_ai/oyna` giriş kapısına düştü; tam sahne Super Admin oturumu ister.

---

## Saha gözlemi

Kelime değişirken cümledeki diğer kelimeler X ekseninde kaymamalı. Aktif kelime krem-beyaz ve altın hale ile okunur kalmalı; kalınlık hissi gölgeden gelmeli, kutu genişliğinden değil.
