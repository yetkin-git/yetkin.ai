# TEDAVİ RAPORU — Boşluk Doldur Minimalist Dikey Temizlik

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Etkinlik Stüdyosu / Boşluk doldur  
**Durum:** Tedavi tamamlandı. Cümle kartları, ipucu şeridi ve boşluk kutuları kompakt; kontrol butonu Stüdyo alanında kaydırmasız görünür.

---

## ADIM 1 — Teşhis

### Dosya

`components/junior/activity-rail.tsx` → `ClozeLine` (çok boşluklu / `gaps` dalı)  
Etkinlik Stüdyosu sarmalayıcısı: `components/junior/activity-studio.tsx` → `FillGapsBoard` → `layout="studio"`

### Kök neden

| Katman | Eski davranış | Etki |
|--------|---------------|------|
| Studio kart (`spacious`) | `min-h-[7rem]`, `py-5`, `text-base sm:text-lg` | Üç cümle kartı dikeyde şişiyor; kontrol butonu aşağı kayıyor |
| Board padding / gap | `gap-5 p-4 sm:p-6` | Stüdyo paneli gereksiz yükseklik |
| İpucu kelime chip | `rounded-2xl px-5 py-3 text-lg` + kalın gölge | Üst şerit “kutu” gibi; dikey bütçeyi yer |
| Boşluk input | `h-12 w-36 text-xl border-2` | Cümle satırını kalınlaştırıyor |
| Kart aralığı | `grid gap-4` | Üç kart arasında fazla boşluk |

---

## ADIM 2 — Layout Tedavisi

### Yapılanlar

1. **Board (studio):** `gap-5 p-4 sm:p-6` → `gap-2.5 p-3`; `data-junior-fill-gaps="compact"`.
2. **Cümle kartı:** `gameCardClass(..., spacious)` kaldırıldı; yeni `clozeStudioCardClass` → `px-4 py-2.5`, `text-sm`, `border` (ince), `min-h` yok.
3. **Kart / satır aralığı:** `gap-4` → `gap-2.5`; satır içi `gap-1.5`, `leading-6`.
4. **İpucu Kelimeler:** alçak şerit (`rounded-xl px-2 py-1.5`); chip `rounded-lg px-2.5 py-0.5 text-xs` (rozette gibi).
5. **Boşluk (drop target):** `h-8 w-28 px-3 text-sm rounded-xl border` (kesikli ince kenarlık; doğru/yanlışta solid renk korunur).
6. **Rail / tek-boşluk cloze:** dokunulmadı. MatchBoard `compact` ve Dedektif `spacious` boyutları bozulmadı.

### Dokunulan satırlar (özet)

- `clozeStudioCardClass` — yeni yardımcı
- `ClozeLine` multi-gap studio dalı — board / bank / chip / card / input sınıfları

---

## ADIM 3 — Görsel Doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` — Etkinlik Stüdyosu → Boşluk doldur (viewport ~1400×900).

### Kanıt (DOM geometri)

| Ölçüm | Sonuç |
|-------|--------|
| `data-junior-fill-gaps` | `compact` |
| `data-junior-board-layout` | `studio` |
| Board yükseklik / padding / gap | **~282 px** / `12px` / **10 px** (`gap-2.5`) |
| İpucu bandı yüksekliği | **~35 px** |
| Chip yüksekliği / font | **~22 px** / `12px` |
| Cümle kartı yükseklik / padding / font | **~54 px** / `10px 16px` (`py-2.5 px-4`) / `14px` |
| Boşluk input | **h=32 px** (`h-8`), ince `border` |
| Kart `min-height` | **yok** (eski `7rem` kalktı) |
| Board + «Etkinliği kontrol et» viewport içi | **evet** (`boardPlusCheckInView: true`) |

### Görsel durum

- Üç cümle ve ipucu chip satırı kompakt; Stüdyo alanında dikey kaydırma gerektirmeden kontrol butonu görünür.
- Dar yan-panel viewport’ta cümleler satır kırabilir (beklenen); geniş Stüdyo sütununda tek satır + ~54 px kart yüksekliği.

---

## SUPER_ADMIN notu

Sıfır davranış riski: boşluk değerlendirme mantığı, kelime bankası sürükle-bırak / tıkla doldurma, doğru-yanlış dokunsal geri bildirim ve Match/Dedektif studio boyutları değiştirilmedi. Yalnızca Cloze studio görsel yoğunluğu ve dikey sığdırma sadeleştirildi.
