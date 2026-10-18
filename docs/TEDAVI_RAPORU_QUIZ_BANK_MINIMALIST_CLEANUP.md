# TEDAVİ RAPORU — Soru Bankası Minimalist Şık / Seçim Tiki

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Soru Bankası / 3 Soruluk Hızlı Konu Kontrolü  
**Durum:** Tedavi tamamlandı. Şık kartları kompakt; seçili şıkta sağ uçta yeşil ✓ rozeti beliriyor.

---

## ADIM 1 — Teşhis

### Dosya

`components/junior/topic-quiz.tsx` → `TopicQuiz`  
(Etkinlik Stüdyosu sekmesi: `components/junior/activity-studio.tsx` → modül `tests` → `TopicQuiz`)

### Kök neden

| Katman | Eski davranış | Etki |
|--------|---------------|------|
| Şık kartı (`optionClass`) | `px-4 py-3`, `text-base`, `rounded-2xl border-2` | A–D kutuları dikeyde şişik; Stüdyo kompakt standardıyla uyumsuz |
| Harf rozeti | `h-9 w-9 text-sm` | Şık satırını ekstra kalınlaştırıyor |
| Seçili durum | `scale-[1.02] ring-2 ring-violet-500` | Görsel onay tiki (`✓`) yok; seçim belirsiz kalıyor |
| Soru kartı / grup | `gap-5` / `gap-4`, `p-4`, `border-2` | Soru kartları arasında fazla dikey boşluk |
| Test türü başlığı | `h4 text-sm font-semibold` | "Kavram Testi" vb. düz başlık; rozet dili yok |

---

## ADIM 2 — Layout Tedavisi

### Yapılanlar

1. **Şık kartı kompakt:** `px-4 py-3 text-base` → `px-3.5 py-2.5 text-xs sm:text-sm`; `my-1.5`; `rounded-xl border` (ince kenarlık).
2. **Harf rozeti:** `h-9 w-9` → `h-6 w-6 sm:h-7 sm:w-7`, `text-[11px] sm:text-xs`.
3. **Seçim onay tiki (`✓`):** `isSelected` iken sağ uçta `data-junior-quiz-check` rozeti — `bg-emerald-500 text-white rounded-full` (h-5/h-6).
4. **Aktif ton:** seçili şık `border-emerald-400 bg-emerald-50` + `ring-2 ring-emerald-500/55`; pastel yüz yalnız seçilmemiş şıklarda.
5. **Soru kartı / dikey düzen:** grup ve kart `gap-3` (12px); kart `p-3 rounded-xl border`; soru numarası `h-6 w-6`.
6. **Test türü rozeti:** "Kavram Testi" / "Uygulama Testi" / "Beceri…" → `rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px]`.

### Dokunulan satırlar (özet)

- `optionClass` — kompakt boyut + seçili emerald yüz
- `TopicQuiz` render — şık içeriği (`flex-1` metin + ✓ rozeti), kart/grup gap, seviye rozeti
- `data-junior-quiz-selected` / `data-junior-quiz-check` — doğrulama kancaları

---

## ADIM 3 — Görsel Doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` — Soru Bankası sekmesi (geniş viewport). İlk şık (A) tıklandı.

### Kanıt (DOM geometri)

| Ölçüm | Sonuç |
|-------|--------|
| Şık sayısı | 12 (3 soru × 4 şık) |
| Seçili şık | 1 (`data-junior-quiz-selected="true"`) |
| ✓ rozeti | 1 (`data-junior-quiz-check`, metin `✓`) |
| Şık yükseklik / pad / font | ~46 px / `10px 14px` (`py-2.5 px-3.5`) / `12px` (`text-xs`) |
| Şık dikey margin | `6px` (`my-1.5`) |
| Kart padding / grup gap | `12px` / `12px` (`p-3` / `gap-3`) |
| Seviye rozetleri | Kavram Testi, Uygulama Testi, Beceri / Yeni Nesil Testi |

### Görsel durum

- A–D şıkları kompakt; eski `py-3` + `text-base` şişkinliği kalktı.
- Tıklanan seçeneğin sağında yeşil dairesel ✓ net görünüyor; arka plan emerald-50, kenarlık emerald-400.
- "Kavram Testi" kibar pill rozet; soru kartları `gap-3` ile sıkı.

---

## SUPER_ADMIN notu

Sıfır davranış riski: quiz gönderimi, puanlama API’si ve sonuç karnesi mantığı değiştirilmedi. Yalnızca `TopicQuiz` görsel yoğunluğu ve seçim onayı sadeleştirildi; Etkinlik Stüdyosu Match/Cloze/Dedektif kart boyutları bozulmadı.
