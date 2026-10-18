# TEDAVİ RAPORU — Dedektif Etkinliği Minimalist Boyutlandırma

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Etkinlik Stüdyosu / Dedektif  
**Durum:** Tedavi tamamlandı. Sayı çipleri ve roket hedefleri kompakt; kontrol butonu Stüdyo alanında kaydırmasız görünür.

---

## ADIM 1 — Teşhis

### Dosya

`components/junior/activity-rail.tsx` → `OrderBoard` (puzzle / Dedektif dalı)  
Etkinlik Stüdyosu sarmalayıcısı: `components/junior/activity-studio.tsx` → `DetectiveRockets` → `layout="studio"`

### Kök neden

| Katman | Eski davranış | Etki |
|--------|---------------|------|
| Board padding / gap | `gap-5 p-4 sm:p-6` | Stüdyo paneli gereksiz yükseklik |
| Sayı kartı (studio) | `min-h-[6.5rem]`, `rounded-3xl`, `py-4`, `text-3xl` + «Sayı» etiketi | Dev «SAYI 24» kutuları; 2×2 grid dikey bütçeyi yer |
| Roket hedefi | `min-h-[11rem] p-4`, başlık `text-lg`, ipucu `text-sm` | Üç kutu tek sütunda (~300px+) şişiyor |
| Roket grid | `md:grid-cols-3` | Stüdyo sütunu &lt;768px iken dikey yığılma; kaydırma zorunlu |

---

## ADIM 2 — Layout Tedavisi

### Yapılanlar

1. **Board (studio):** `gap-5 p-4 sm:p-6` → `gap-2.5 p-3 sm:p-4`; `data-junior-detective-puzzle="compact"`.
2. **Sayı çipleri:** `min-h-[6.5rem]` / `text-3xl` kaldırıldı → `px-2 py-2 sm:px-4`, `text-sm sm:text-base`, `rounded-2xl shadow-sm`; «Sayı» etiketi `text-[9px]`.
3. **Chip grid:** `grid-cols-2 sm:grid-cols-4` → her zaman `grid-cols-4` (tek satır).
4. **Roket hedefleri:** `min-h-[11rem] p-4` → `min-h-[100px] p-3 sm:p-4 rounded-2xl`; başlık `text-sm sm:text-base`; ipucu + «Sayı bırak» → `text-[10px] sm:text-xs`.
5. **Roket grid:** `md:grid-cols-3` → her zaman `grid-cols-3 gap-2` (dar Stüdyo sütununda yan yana).
6. **Prompt:** studio’da `text-[11px] leading-snug`.
7. **Rail / non-studio puzzle:** dokunulmadı. Match/Cloze compact boyutları bozulmadı.

### Dokunulan satırlar (özet)

- `OrderBoard` puzzle dalı — board / chip / rocket sınıfları ve `data-junior-detective-puzzle="compact"`

---

## ADIM 3 — Görsel Doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` — Etkinlik Stüdyosu → Dedektif (panel viewport ~vh 451, panel genişlik ~544px).

### Kanıt (DOM geometri)

| Ölçüm | Sonuç |
|-------|--------|
| `data-junior-detective-puzzle` | `compact` |
| `data-junior-board-layout` | `studio` |
| Board yükseklik / padding / gap | **~241 px** / `12px` / **10 px** (`gap-2.5`) |
| Sayı çipi yükseklik / padding / font | **~48 px** / `8px` (`py-2`) / `14px` |
| Roket sütunları | **3× ~167 px** (`grid-cols-3`) |
| Roket yükseklik / min-h / padding | **100 px** / `100px` / `12px` (`p-3`) |
| İpucu / «Sayı bırak» font | **10 px** |
| Board + «Etkinliği kontrol et» viewport içi | **evet** (`boardPlusCheckInView: true`) |
| Panel scroll ihtiyacı | **yok** (`scrollHeight === clientHeight`) |

### Görsel durum

- Dört sayı tek satırda kibar rozet; üç roket yan yana `min-h-[100px]`.
- Stüdyo alanında dikey kaydırma gerektirmeden roketler + «Etkinliği kontrol et» görünür.
- Eşleştir / Boşluk doldur ile aynı minimalist yoğunluk diline hizalı.

---

## SUPER_ADMIN notu

Sıfır davranış riski: roket kural doğrulama (`MAT5_ROCKET_RULES`), sürükle-bırak / tıkla yerleştirme, sarsıntı ve doğru-yanlış geri bildirim mantığı değiştirilmedi. Yalnızca Dedektif studio görsel yoğunluğu ve dikey sığdırma sadeleştirildi.
