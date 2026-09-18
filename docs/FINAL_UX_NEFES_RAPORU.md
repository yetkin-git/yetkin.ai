# FİNAL UX NEFES RAPORU — Paket 8.1

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay makamı | CEO (Yapay Zekâ Yöneticisi) — son dikey milim onayı |
| Kod SSOT | `app/globals.css`, `components/academy/curriculum-player.tsx` |
| Paket | 8.1 — Oynatıcı dikey mikro hizalama ve tavan nefesi |

---

## Yönetici özeti

Paket 8 kabuğu eşit 1rem nefes verdi; sağdaki 9 derslik oynatma listesi kaydırmasız sığdı. Sol 16:9 sahnenin üst kenarı tarayıcı gri zeminine hâlâ birkaç piksel yakındı. Kabuk tavanı **1.5rem** açıldı. Sağ ray Paket 8 hizasında tutuldu (`margin-top: calc(1rem - var(--academy-player-ceiling-breath))`). Özet / Tam Ders Metni sekme kümesi video çerçevesine **0.5rem** aralıkla kilitlendi; video aşağı kayınca sekme boşluğu şişmedi.

---

## Tespit

| Alan | Paket 8 sonrası | Etki |
|------|-----------------|------|
| 1 — Sol tavan | Kabuk `padding-top: 1rem` | 16:9 üst kenar gri alana birkaç piksel yapışık durur |
| 2 — Sağ liste | 9 ders `--academy-playlist-max-h` ile sığar | Tavan nefesi artarsa liste birlikte kayar; sığma bozulur |
| 3 — Sekme kümesi | Ana kolon `gap-3` (0.75rem) | Video 0.5rem inince sekme-video boşluğu oransız açılır |

---

## Tedavi

### 1. Üst tavan nefesi

`.academy-player-shell[data-academy-player-layout="document"]`:

| Token | Değer |
|-------|--------|
| `--academy-player-ceiling-breath` | `1.5rem` |
| `padding-top` | `var(--academy-player-ceiling-breath)` |
| `padding-bottom` | `1rem` (Paket 8 alt nefesi durur) |

1.75rem denenmedi: “birkaç piksel” için 8px ek nefes yeter; 1.5rem CEO milim aralığının ilk değeridir.

Ana video çerçevesi artık tarayıcı gri alanına değmez.

### 2. Sağ liste milimi (9 ders korunur)

Masaüstü (`min-width: 1024px`) ray:

```
margin-top: calc(1rem - var(--academy-player-ceiling-breath)); /* −0.5rem */
```

Liste görsel tavanı Paket 8’deki 1rem’de kalır. `--academy-playlist-max-h: calc(100dvh - 5.5rem)` değişmez.

### 3. Alt sekme dengelemesi

| Token | Değer |
|-------|--------|
| `--academy-player-study-gap` | `0.5rem` |
| `.academy-player-main` `gap` | `var(--academy-player-study-gap)` |
| `.academy-player-study` `margin-top` | `0` |

Özet ve Promptlar / Tam Ders Metni, inen video çerçevesine 0.5rem ile kilitlenir. Kolon Tailwind `gap-3` yerine CSS değişkenini okur.

```
┌──────────────────────────────────┬────────────────────┐
│  1.5rem tavan nefesi             │  1rem (Paket 8)    │
│  16:9 SİNEMA                     │  OYNATMA LİSTESİ   │
│  0.5rem study gap                │  9 ders            │
│  Özet / Tam Ders Metni           │                    │
│  1rem alt nefes                  │                    │
└──────────────────────────────────┴────────────────────┘
```

---

## Dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `app/globals.css` | Tavan 1.5rem; study gap 0.5rem; lg liste −0.5rem kompanzasyon |
| `components/academy/curriculum-player.tsx` | Ana kolon `gap-[var(--academy-player-study-gap,0.5rem)]` |
| `tests/academy/curriculum-player-surface.test.ts` | Paket 8.1 kilitleri |
| `docs/FINAL_UX_NEFES_RAPORU.md` | Bu rapor |

Sahne tavanı (`--academy-stage-max-h`) ve 16:9 sözleşmesi değişmedi.

---

## Test

```
npx vitest run tests/academy/curriculum-player-surface.test.ts
```

**1 dosya, 7 test, yeşil** (Paket 8.1 kilitleri dahil).

Kilitler: `--academy-player-ceiling-breath: 1.5rem`; `padding-bottom: 1rem`; `--academy-player-study-gap: 0.5rem`; liste `calc(1rem - var(--academy-player-ceiling-breath))`; `--academy-playlist-max-h` durur.

Canlı tarayıcı: Cursor oturumu `/login` duvarına düştü. Super Admin saha gözlemi: `/academy/01_office_ai/oyna` — sol sahne 1.5rem tavan nefesi, sağda 9 ders Paket 8 hizasında, sekme kümesi video ile 0.5rem.
