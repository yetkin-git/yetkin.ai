# TEDAVİ RAPORU — Ders Notu Jargon Temizliği + Lüks Hover

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Ders Notu / Yardımcı Kaynak sekmesi  
**Durum:** Tedavi tamamlandı. Geliştirici jargonu kaldırıldı; Altın İpucu ve zihin haritası kartlarına lüks hover eklendi.

---

## ADIM 1 — Jargon Temizliği

### Teşhis

Hero kartındaki üst etiket öğrenciye yönelik değildi:

| Eski | Sorun |
|------|--------|
| `Ana kavram · Hero soru` | Geliştirici / üretim jargonu; “Hero” ürün dili değil |

### Tedavi

| Alan | Yeni metin |
|------|------------|
| Hero rozet | **🎯 Dersin Ana Sorusu** |
| Stil | Pill rozet: `rounded-full border border-white/25 bg-white/15` (uppercase tracking kaldırıldı) |

### Dosya

- `components/junior/lesson-booklet.tsx` → `ConceptCard`

---

## ADIM 2 — Kararlı Kart + Lüks Hover

### Altın İpucu kartları (2–3)

Ortak sınıf: `GOLD_CARD_LUXE`

| Durum | Sınıflar |
|-------|----------|
| Taban | `rounded-xl border border-slate-200/90 bg-white shadow-sm` |
| Hover | `hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md` |
| Geçiş | `transition-all duration-200 ease-out` |

Uygulandığı yerler:

- `DetectiveGoldBadges` (mat-5 dedektif rozetleri)
- `GoldRuleBadges` (diğer derslerin numaralı kural kartları)

### Görsel zihin haritası düğümleri (4–5)

Ortak sınıf: `NODE_CARD_LUXE` → `NODE_TONE[*].card`

| Durum | Sınıflar |
|-------|----------|
| Taban | `rounded-xl border border-slate-200/90 shadow-sm` + ton rengi zemin |
| Hover | `hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md` |
| Geçiş | `transition-all duration-200 ease-out` |

Uygulandığı yerler:

- `MindMap` (mat-5 ve genel)
- `ExponentMindMap` (üs dersleri)

### Korunan sözleşmeler

- `data-junior-booklet`, `data-junior-gold-tip`, `data-junior-trap-box`, `data-junior-mind-map`, `data-junior-concept-card`
- İçerik SSOT (`lib/junior/content/mat/5.ts`) değişmedi
- Trap kutusu ve `hint` mantığı değişmedi

---

## ADIM 3 — Görsel Doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` → **Ders Notu** sekmesi

### Kanıt (DOM / runtime)

| Ölçüm | Sonuç |
|-------|--------|
| `HERO SORU` / `Ana kavram · Hero` | **yok** |
| `🎯 Dersin Ana Sorusu` | **evet** |
| Altın İpucu kart sayısı (luxe) | **2** |
| Amber hover + translate + transition | **evet** (2/2) |
| Zihin haritası düğüm sayısı | **3** |
| Sky hover + translate + transition | **evet** (3/3) |
| Solid kenar (`border-slate-200/90`) | **evet** |

### Görsel durum

- Hero: öğrenci dostu rozet; jargon yok
- Altın İpucu: oturaklı beyaz kart + amber border parlaması hover’da
- Zihin haritası: solid düğümler + sky border parlaması hover’da

---

## SUPER_ADMIN notu

Sıfır davranış riski: senaryo metni, `hint`/`recap`/`outcomes` SSOT ve ActivityHub sekme sözleşmesi değişmedi. Yalnızca `LessonBooklet` etiket metni ve kart yüzey etkileşimi güncellendi. Hover sınıfları Tailwind utility; JS/animasyon kütüphanesi eklenmedi.
