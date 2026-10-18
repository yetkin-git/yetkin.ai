# Tedavi Raporu — İlerleme Takibi ve Karne Senkronizasyonu

**Tarih:** 2026-10-19  
**Karar sahibi:** SUPER_ADMIN  
**Hedef ekran:** `http://localhost:3000/junior/ders/jr_06_mat-5` · Hızlı araçlar sağ paneli  
**Durum:** TEDAVİ EDİLDİ — SUPER_ADMIN bilgilendirmesi  
**Risk ilkesi:** Sıfır risk (yalnızca istemci LocalStorage + mevcut practice/quiz API; yeni sunucu şeması yok)

---

## Özet

| Adım | Konu | Sonuç |
|------|------|--------|
| 1 | Progress Engine (etkinlik / sim / izleme) | `lib/junior/progress-tracker.ts` SSOT; canlı event |
| 2 | Karne + rozet senkronu | Puan paneli + rozet popup; Soru Bankası / Etkinlik puanı |
| 3 | Doğrulama + rapor | Bu belge; localhost DOM teyidi |

---

## ADIM 1 — Progress Engine

### Teşhis

- Sağ panel «Puan durumu» formu doldurulmuş (ready) oyunları sayıyordu; başarıyla tamamlanan etkinlik/simülasyon sayılmıyordu.
- Animasyonlu simülasyonlar alkış/confetti veriyordu ama Hızlı araçlara yazılmıyordu.
- `% Kaç Bitirdim?` (micro-progress) ayrı çalışıyordu; puan / rozet ile tek dock’ta birleşik değildi.
- Talimatta adı geçen `quick-tools.tsx` / `progress-tracker.ts` yoktu; dock `Mat5FocusedLayout` içinde gömülüydü.

### Tedavi

| Dosya | Rol |
|-------|-----|
| `lib/junior/progress-tracker.ts` | Tamamlanan oyunlar, etkinlik/test puanı, rozet eşiği (3), LocalStorage + `JUNIOR_LESSON_PROGRESS_EVENT` |
| `components/junior/quick-tools.tsx` | Hızlı araçlar: **İlerleme durumu**, **Puan durumu**, **Rozet sistemi** + rozet popup |
| `components/junior/activity-studio.tsx` | Not `ok` → `markGameComplete`; skor → `recordActivityScore`; dock → `QuickTools` |
| `components/junior/animated-simulations.tsx` | Exact başarı → `sim-*` oyun kimliği |
| `components/junior/topic-quiz.tsx` | Test yüzdesi → `recordQuizScore` (karne paneli) |
| `tests/kernel/junior-progress-tracker.test.ts` | Eşik, idempotent işaretleme, karne ortalaması |

### Rozet kuralı

3 **farklı** etkinlik veya simülasyon başarıyla tamamlanınca:

- Panel: `🏅 Bölünebilme Dedektifi` (`jr_06_mat-5`)
- Popup: `ActivityBadgeModal` → **Bölünebilme Dedektifi Rozeti**

Oyun kimlikleri: `match` · `cloze` · `puzzle` · `sim-marble` · `sim-balance` · `sim-chicken` · `sim-egg`.

Anahtar: `yetkin.junior.lesson-progress.v1:{profil|anon}:{ders}`.

---

## ADIM 2 — Karne ve Veli Senkronizasyonu

### Yerel karne paneli

- Etkinlik stüdyosu kontrolü → `activityScore` (0–100)
- Soru bankası bitişi → `quizScore` (0–100)
- Panel «Karne: %N» = iki skorun ortalaması (`combinedReportScore`)

### Sunucu yolu (mevcut; yeni API yok)

- Profil + oturum varken practice / quiz zaten XP ve ilerleme satırına yazar (`/api/junior-pilot/practice`, `/api/junior-pilot/quiz`).
- Profil yoksa: «Puanın karnene yazılması için veli girişi gerekir.» cümlesi korunur; yerel panel yine anlık güncellenir (anon anahtar).

### Rozet popup

`justUnlockedBadge && !badgeCelebrated` → tebrik diyaloğu; «Devam» → `markBadgeCelebrated`.

---

## ADIM 3 — Doğrulama

**Canlı sayfa (2026-10-19):** `http://localhost:3000/junior/ders/jr_06_mat-5`

| Senaryo | Sonuç |
|---------|--------|
| `[data-junior-quick-tools]` dock | **var** |
| Bilye «Otomatik diz» (exact) | Puan `1 / 3`; LS `sim-marble` |
| Terazi 24 ÷ 3 | Puan `2 / 3`; LS `sim-balance` |
| Tavuk 15 yem / 3 tavuk dağıt | Puan `3 / 3`; rozet **🏅 Bölünebilme Dedektifi**; popup **Bölünebilme Dedektifi Rozeti** |
| İlerleme paneli | `% Kaç Bitirdim?` + «N oyun tamam» |
| Birim testleri | `junior-progress-tracker` + `junior-micro-lesson` — **15/15 geçti** |

---

## SUPER_ADMIN özeti

Hızlı araçlar artık izleme yüzdesi, tamamlanan oyun sayısı ve karne puanını aynı LocalStorage event bus’ı üzerinden anlık tutar. Üç farklı başarıda **Bölünebilme Dedektifi** rozeti açılır ve tebrik popup’ı gösterilir. Veli/profil varken sunucu practice/quiz yolu değişmedi; yerel panel anon ve profil için tutarlıdır.
