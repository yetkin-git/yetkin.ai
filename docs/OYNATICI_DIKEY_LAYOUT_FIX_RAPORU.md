# OYNATICI DİKEY LAYOUT FIX RAPORU — Paket 8

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO (Yapay Zekâ Yöneticisi) — UX düzenleme onayı |
| Kod SSOT | `app/globals.css`, `components/academy/curriculum-player.tsx`, `app/academy/[slug]/oyna/page.tsx` |
| Paket | 8 — Oynatıcı dikey yerleşim ve oynatma listesi yüksekliği |

---

## Yönetici özeti

Sinema sahnesi üst çerçeveye yapışıktı; altta atıl dikey boşluk duruyordu. Sağ oynatma listesi sahne tavanına (`--academy-stage-max-h`) kilitlendiği için 9 dersten 7’si görünüyor, kaydırma çubuğu çıkıyordu. Kabuk artık **eşit 1rem** üst/alt nefes taşır. Liste tavanı sahne tavanından ayrıldı: `calc(100dvh - 5.5rem)`. Kart `padding` / `gap` `clamp(0.4rem, 1vh, 0.75rem)` ile sıkılaştı. Tipik laptop/masaüstünde 9 ders kaydırmasız sığar.

---

## Tespit

| Alan | Eski durum | Etki |
|------|------------|------|
| 1 — Üst kesiklik | `RoomFrame` `pt-3` + kabuk `padding-top: 0`; sahne `mt-0 pt-0` | 16:9 çerçeve üst sınıra yapışır; yuvarlatılmış kenar kesik görünür |
| 2 — Alt boşluk | `RoomFrame` `pb-8` (2rem) üstteki 0.75rem ile oransız | İlk ekranın altında atıl dikey alan |
| 3 — Liste yüksekliği | `lg:max-h-[var(--academy-stage-max-h)]` = `min(68vh, 100dvh - 11.5rem)` | Liste video yüksekliğinde kesilir; 768px’te ~7 kart + scrollbar |

16:9 tavanı (`--academy-stage-max-h`) durur; Prompt Terminali sahne dışındadır. Bu paket yalnızca dikey nefes ve sağ rayı büyütür.

---

## Tedavi

### 1. Player penceresi dikey dengeleme

`.academy-player-shell[data-academy-player-layout="document"]`:

- `padding-top: 1rem`
- `padding-bottom: 1rem`

`RoomFrame` (`/oyna`): `pt-3 pb-8` kalktı → `py-0`. Dikey nefes tek yerde (kabuk) durur; üst ve alt eşit.

İskelet (`academy-room-skeleton` play): `px-4 py-4 sm:px-6`.

### 2. Oynatma listesi tavanı (9 ders)

Yeni değişkenler (`.academy-player-shell`):

| Değişken | Değer |
|----------|--------|
| `--academy-playlist-max-h` | `calc(100dvh - 5.5rem)` — header (~3rem) + 1rem+1rem nefes |
| `--academy-playlist-item-pad-y` | `clamp(0.4rem, 1vh, 0.75rem)` |
| `--academy-playlist-item-gap` | `clamp(0.4rem, 1vh, 0.75rem)` |

Masaüstünde ray:

- `min-height: var(--academy-stage-max-h)` — video ile hizalı taban
- `max-height: var(--academy-playlist-max-h)` — 3 no’lu alt boşluğa uzama
- Sınıf: `academy-playlist` + `academy-player-rail`

Kart içi `px-3.5 py-2.5` / `lg:space-y-2` kalktı. Padding CSS `padding-block`; aralık `lg:gap-[var(--academy-playlist-item-gap)]`.

`overflow-y: auto` yedek kalır (küçük ekran / zoom). 100% zoom, ≥768px yükseklikte 9 kartın kaydırmasız sığması hedeftir.

```
┌──────────────────────────────────┬────────────────────┐
│  1rem nefes                      │                    │
│  16:9 SİNEMA                     │  OYNATMA LİSTESİ   │
│                                  │  9 ders            │
│                                  │  (3 no’lu alana    │
│  1rem nefes                      │   uzar)            │
└──────────────────────────────────┴────────────────────┘
```

---

## Dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `app/globals.css` | Kabuk 1rem eşit pad; `--academy-playlist-max-h`; kart clamp pad/gap |
| `components/academy/curriculum-player.tsx` | `academy-playlist`; liste tavanı sahne tavanından ayrı |
| `app/academy/[slug]/oyna/page.tsx` | `pt-3 pb-8` → `py-0` |
| `components/academy/academy-room-skeleton.tsx` | Play iskeleti `py-4` |
| `tests/academy/curriculum-player-surface.test.ts` | Paket 8 kilidi |
| `docs/OYNATICI_DIKEY_LAYOUT_FIX_RAPORU.md` | Bu rapor |

---

## Test

```
npx vitest run tests/academy/curriculum-player-surface.test.ts
```

**1 dosya, 7 test, yeşil** (Paket 8 kilidi dahil). `lesson-karaoke-strip.test.ts` (6 test) de yeşil; `lg:top-0` durur.

Kilitler: `padding-top: 1rem` / `padding-bottom: 1rem`; `--academy-playlist-max-h`; clamp pad/gap; `lg:max-h-[var(--academy-playlist-max-h)]`; `pt-3 pb-8` yok.

Sahne tavanı (`--academy-stage-max-h: min(68vh, calc(100dvh - 11.5rem))`) ve 16:9 sözleşmesi değişmedi.

Canlı tarayıcı: Cursor oturumu `/login` duvarına düştü. Super Admin saha gözlemi: `/academy/01_office_ai/oyna` — üstte 1rem nefes, sağda 9 ders kaydırmasız.
