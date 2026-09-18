# UI TEDAVİ RAPORU — Oynatıcı Sahne Düzeni

| Alan | Değer |
|------|--------|
| Tarih | 17 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin |
| Onay makamı | CEO (Yapay Zekâ Yöneticisi) — arayüz düzeltme onayı |
| Kaynak | Super Admin talimatı: Prompt Terminali sahneyi eziyor |
| Kod SSOT | `components/academy/lesson-visual-stage.tsx`, `components/academy/curriculum-player.tsx`, `app/globals.css` |

---

## Yönetici özeti

Oynatıcı 16:9 sinema alanında görsel, 3 adımlı bant, karaoke ve Prompt Terminali üst üste basıldığı için ana görsel dikeyde eziliyordu. Prompt Terminali sahnenin dışına (oynatıcı çubuğunun hemen altına) alındı. Karaoke 1–2 satırlık overlay oldu; **Altyazı** düğmesi Temiz Sahne Modu’nu açıp kapatıyor. Görsel alan `aspect-ratio: 16 / 9` ve yükseltilmiş `max-height` ile sahnenin odağı.

---

## Yeni dikey düzen

```
┌─────────────────────────────────────┐
│  16:9 SİNEMA SAHNESİ                │
│  • Görsel / Excel-Word-Gmail…       │
│  • Adım 1-2-3 bandı (overlay)       │
│  • Karaoke altyazı (alt gradient)   │
│  • Altyazı göster/gizle (sağ üst)   │
├─────────────────────────────────────┤
│  Oynatıcı çubuğu (play / saat)      │
├─────────────────────────────────────┤
│  Prompt Terminali  ← sahne DIŞI     │
│  (yalnız Beat 3 / split-screen)     │
├─────────────────────────────────────┤
│  Özet ve Promptlar | Tam metin | …  │
└─────────────────────────────────────┘
```

Sahne içinde kalanlar: **görsel**, **adım bandı**, **konuşma altyazısı**. Prompt daktilo animasyonu ve kopyala düğmesi canlı kalır; artık 16:9 yüksekliğini yemez.

---

## Uygulanan adımlar

### 1. Prompt Terminali sahne dışına

- `LessonCinemaEyeLayer` artık `LessonPromptConsole` basmaz.
- Split-screen’de ofis masasının yinelenen Copilot paneli gizlenmeye devam eder (`data-academy-compare-prompt="dock"`).
- Canlı terminal `CurriculumPlayer` içinde, `LessonMediaPlayer` ile **Özet ve Promptlar** sekmesinin arasında durur (`data-academy-prompt-host="below-transport"`).
- Eski kural kaldırıldı: prompt açıkken sahne yüksekliği `100dvh - 24.75rem`’e düşüyordu. Laptop’ta görsel ~370px’e iniyordu.

### 2. Görsel min-height / aspect-ratio

- `--academy-stage-max-h: min(68vh, calc(100dvh - 11.5rem))` — viewport’un yaklaşık %60–70’i.
- 16:9 `aspect-ratio` durur; `min-height: min(12.5rem, var(--academy-stage-max-h))` çökme tabanı.
- Karaoke overlay olduğu için 72px’lik alt kutu artık 16:9’un dışından yükseklik çalmaz.

### 3. Karaoke overlay + Temiz Sahne

- Kelime şeridi 16:9’un alt kenarına gradient overlay olarak sabitlendi (en fazla ~2 satır / 72px).
- Adım bandı ve garson ızgarası altyazı açıkken yukarı kayar; altyazı kapalıyken görsel tabanı boşalır.
- Sağ üstte **Altyazı** düğmesi (`cinemaCaptions` / `cinemaCaptionsOn` / `cinemaCaptionsOff`).
- Tercih `localStorage` anahtarı `academy_karaoke_captions` (`1` açık, `0` Temiz Sahne). Varsayılan: açık.

---

## Dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `components/academy/lesson-visual-stage.tsx` | Prompt çıktı; overlay karaoke + altyazı toggle girdi |
| `components/academy/curriculum-player.tsx` | Prompt, oynatıcı çubuğunun altında |
| `components/academy/lesson-karaoke-strip.tsx` | `data-academy-karaoke-band="overlay"` |
| `lib/academy/lesson-teleprompter-flow.ts` | Altyazı tercihi okuma/yazma |
| `app/globals.css` | Sahne yüksekliği, overlay, toggle, howto/waiter boşluğu |
| `tests/academy/*.test.ts` | Yeni sahne sözleşmesi |

Ofis masası içindeki Prompt Terminali (`lesson-ai-desk.tsx`) durur: o Excel/Gmail simülasyonunun parçasıdır, 16:9’un altına eklenen dock değildir.

---

## Doğrulama

```
npx vitest run tests/academy/curriculum-player-surface.test.ts tests/academy/lesson-karaoke-strip.test.ts tests/academy/lesson-visual-stage.test.ts tests/academy/prompt-console.test.ts tests/academy/office-ai-lesson-5.test.ts
```

**5 dosya, 27 test, yeşil.**

### Elle bakılacaklar

1. `/academy/01_office_ai/oyna` — 16:9 görsel, altyazı sahnede, prompt barın altında.
2. Beat 3 (FARK ORTADA) — Prompt Terminali sahneyi ezmeden daktilo eder.
3. **Altyazı** kapalı — Temiz Sahne; görsel + adım bandı kalır.
4. Dar viewport — 16:9 bozulmaz, prompt sahnenin altında kaydırılır.

---

## Bilinçli sözleşme kayması

Önceki kaset, karaoke’yi videonun *altında sabit 72px kutu* olarak kilitliyordu (overlay yasaktı). CEO onayıyla kaset güncellendi: şerit hâlâ 72px ve 1–2 satır, fakat 16:9’un *içinde* gradient overlay’dir. Paragraf teleprompter (`captions={false}`) kapalı durur.
