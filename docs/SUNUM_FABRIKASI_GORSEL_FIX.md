# SUNUM FABRİKASI GÖRSEL TEDAVİSİ — Ders 4

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-3` — Sunum Fabrikası: Metinden Slayta (4. ders) |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin |
| Onay | CEO — görsel düzeltme onayı |
| Belirti | PowerPoint slayt, KPI kartı ve masaüstü mock-up dikeyde basık; 16:9 bozuluyor, çerçeveler iç içe geçiyor |

---

## Yönetici özeti

Ders 4 sahnesindeki PowerPoint penceresi, kalan yüksekliği `height: 100%` ve `flex: 1 1 0` ile dolduruyordu. Slayt tuvali 16:9 oranını kaybediyor, KPI kartları dikeyde eziliyor, tipografi bükülüyordu.

Tedavi: slayt yüzeyine sabit `aspect-ratio: 16 / 9` + `object-fit: contain` + `height: auto` bağlandı. Pencere artık tuvale sığmak için ölçeklenir; dikeyde esnemez. Önce/Sonra kıyaslama kartlarında `align-items: center`, taban `min-height` ve iç padding düzeltildi.

---

## Kök neden

Canlı sahne zinciri:

1. `.academy-player-waiter` 16:9 sinema karesinin inset alanını flex kolon yapar.
2. `.academy-pptx-desk` ve `.academy-pptx-win` `height: 100%` ile bu alanı doldurur.
3. `.academy-pptx-canvas` yine `height: 100%` alır; slayt, şerit/başlık artığının **kalan dikdörtgenine** yayılır.
4. `.academy-pptx-kpi-grid` `flex: 1 1 0` + `min-height: 0` ile kartları o kısa yüksekliğe sıkıştırır.

Sonuç: yatayda geniş, dikeyde basık bir “slayt”; kart çerçeveleri ve yazılar üst üste biner.

---

## CSS kurgusu

Slayt tuvali **contain** kutusudur: en büyük 16:9, ebeveynin içine sığar; oran bozulmaz.

```
.academy-pptx-canvas-wrap  →  flex + align-items: center; min-height: min-content
.academy-pptx-canvas       →  aspect-ratio: 16 / 9
                              width: 100%
                              height: auto
                              object-fit: contain
.academy-pptx-win          →  height: auto; flex: 0 0 auto; max-height: none
                              (flex-1 / height:100% ile dikey ezme yok)
.academy-office-win-fit    →  doğal pencere yüksekliğini tek ölçekle 16:9 sahneye sığdırır
```

KPI kartları çökmez:

| Seçici | Kural |
|--------|--------|
| `.academy-pptx-kpi` | `align-items: center`, `min-height: 4.35rem` |
| `.academy-player-compare-pane .academy-pptx-kpi-grid` | `align-items: center`, `min-height: 3.9rem` |
| `.academy-player-compare-pane .academy-pptx-kpi` | `min-height: 3.7rem`, `overflow: visible`, padding `clamp` |

Önce (düz metin) / Sonra (görsel hiyerarşili slayt) panelleri aynı 16:9 tuvali kullanır; `office-win-fit` doğal yüksekliği ölçüp küçültür.

---

## Düzeltilen bileşenler

| Dosya | Değişiklik |
|-------|------------|
| `components/academy/lesson-visual-stage.tsx` | Ders 4 sahnesini `LessonPptxWorkspace` ile basar (layout `pptx`) — JSX değişmedi |
| `components/academy/lesson-pptx-workspace.tsx` | Canvas `aspect-video`; pencere `office-win-fit` ile contain |
| `components/academy/lesson-slide-workspace.tsx` | KPI kartı `min-h-[4.35rem]` + `items-center` |
| `app/globals.css` | 16:9 canvas, `height: auto`, kıyaslama hizası/padding |
| `lib/academy/pptx-workspace.ts` | KPI / başlık / eylem bandı SSOT — içerik değişmedi |
| `scripts/render-academy-cinema-html.ts` | Bake slaytı `.pptx-good` 16:9 + kart `min-height` |
| `tests/academy/curriculum-player-surface.test.ts` | 16:9 contain sözleşmesi |
| `tests/academy/pptx-workspace.test.ts` | Canvas / kart / bake kilitleri |

---

## Doğrulama

```
npx vitest run tests/academy/curriculum-player-surface.test.ts
```

İlgili kilitler: `tests/academy/pptx-workspace.test.ts`, `tests/academy/office-win-fit.test.ts`.

### Elle bakılacaklar

1. `/academy/01_office_ai/oyna` — 4. ders, canlı PowerPoint penceresi.
2. Beat 3 **FARK ORTADA** — sol “Önce (Düz Metin)”, sağ “Sonra (Görsel Hiyerarşili Slayt)”; slayt 16:9, kartlar basık değil.
3. Dar laptop viewport — slayt letterbox / scale-down; tipografi dikeyde bükülmez.
4. KPI vurgusu (A1/B1/C1 yeşil kutu) kartın üzerinde kalır.

---

## Bilinçli sözleşme

Sinema sahnesinin 16:9’u durur. PowerPoint **iç slaytı** da aynı oranı taşır; kalan yükseklik gri masa / letterbox olur, slaytı ezmez. `office-win-fit` ölçeği tek eksende (uniform `scale`) kalır.
