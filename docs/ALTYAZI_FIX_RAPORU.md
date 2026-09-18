# ALTYAZI FIX RAPORU — Karaoke / caption bandı CSS reformu

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO (Yapay Zekâ Yöneticisi) — kırık arayüz müdahale onayı |
| Kod SSOT | `components/academy/lesson-karaoke-strip.tsx`, `components/academy/lesson-visual-stage.tsx`, `app/globals.css` |

---

## Yönetici özeti

Oynatıcı 16:9 sahnesindeki karaoke altyazısı dikeyde kesiliyordu: harflerin üstü ve altı kırpılıyor, `slınc` / `’apa’` gibi okunaksız parçalar görünüyordu. Kök neden içerik değil, **kilitli 72px bant + `overflow: hidden` + `max-height: 3em`** birleşimiydi. Caption kapsayıcısı 1–2 satırlık ortalanmış bloğu tam glif yüksekliğiyle basacak şekilde açıldı; font `1rem`, satır aralığı `1.5`.

---

## Tespit

| Kural | Eski değer | Etki |
|-------|------------|------|
| `--academy-karaoke-band-h` | `72px` | İki satır + Türkçe üst/alt işaret için yetersiz |
| Overlay `max-height` | `4.5rem` (`4.2rem` mobilde) | `border-box` padding ile içerik alanı ~48px’e düşüyordu |
| Overlay `padding` | `1.35rem 0.2rem 0.15rem` | Alt pay 2.4px; `g / y / p / ş / ç` sahne `overflow: hidden` kenarına yapışıyordu |
| Şerit Tailwind | `h-[72px] max-h-[72px] overflow-hidden` | CSS kilitini JSX de sıkıştırıyordu |
| Satır | `overflow: hidden; max-height: 3em` | `line-height: 1.5` ile tam iki satır kutusu; `row-gap` ve kalın vurgulu glif taşınca ortasından kesiliyordu |
| Font | `clamp(0.94rem, 1.7vw, 1.16rem)` | Geniş sahnede satır yüksekliği banda çarpıyordu |

`scrollIntoView` bu dar `overflow: hidden` kutuda aktif kelimeyi kaydırınca ikinci satırın yarım harfleri görünür hale geliyordu.

---

## Tedavi

### 1. Caption kapsayıcı (`.academy-player-karaoke-overlay`)

- `--academy-karaoke-band-h: 6rem` (72px → 96px taban).
- `min-height: var(--academy-karaoke-band-h)`, `max-height: 7.5rem`.
- `padding: 0.9rem 0.85rem 0.7rem` — üst ve alt glif payı.
- `overflow: visible`; 1–2 satır dikeyde ortalanır (`align-items: center`).
- Mobil: `padding: 0.8rem 0.55rem 0.65rem` (eski `0.08rem` alt pay kalktı).

### 2. Şerit ve satır

- JSX’ten `h-[72px] / max-h-[72px] / overflow-hidden` kaldırıldı.
- Şerit: `height: auto`, `max-height: none`, `overflow: visible`.
- Overlay içi şerit `min-height: 0` — bant yüksekliğini kapsayıcı taşır.
- Satır: `overflow: visible`, `max-height: none`, `padding-block: 0.18em`, `font-size: 1rem`, `line-height: 1.5`.
- Kelime: `inline-block` + `padding-block: 0.08em` + `line-height: inherit`.
- Tam sığan satırda `scrollIntoView` çalışmaz; sahne kaydırılmaz.

Adım bandı ve garson ızgarası aynı CSS değişkeniyle yukarı kayar; 16:9 sözleşmesi durur.

---

## Dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `app/globals.css` | Overlay / şerit / satır yüksekliği, padding, overflow, sabit `1rem` / `1.5` |
| `components/academy/lesson-karaoke-strip.tsx` | Tailwind yükseklik kilidi kalktı; taşma görünür; sığınca kaydırma yok |
| `tests/academy/lesson-karaoke-strip.test.ts` | Yeni CSS sözleşmesi |
| `tests/academy/curriculum-player-surface.test.ts` | Overlay padding + `overflow: visible` kilidi |

`lesson-visual-stage.tsx` overlay işaretçisini taşımaya devam eder; JSX ağacı değişmedi.

---

## Test

```
npx vitest run tests/academy/curriculum-player-surface.test.ts tests/academy/lesson-karaoke-strip.test.ts tests/academy/lesson-visual-stage.test.ts
```

**3 dosya, 13 test, yeşil.** Overlay `overflow: visible` + `padding: 0.9rem 0.85rem 0.7rem`; satır `font-size: 1rem` / `line-height: 1.5`; `max-height: 3em` kiliti yok.

Canlı `/academy/01_office_ai/oyna` bu oturumda giriş kapısına düştü; karaoke bandı tarayıcıda Super Admin saha gözlemi ister.

---

## Saha kontrolü

Super Admin `/academy/01_office_ai/oyna` üzerinde aktif cue’yu 1–2 satır olarak okumalı: `ş / ğ / y / p` kırpılmamalı, `slınc` / `’apa’` kalıntısı olmamalı. **Altyazı** düğmesi Temiz Sahne’yi açıp kapatmaya devam eder.
