# TEDAVİ RAPORU — Junior Oynatıcı Üst Başlık / Şerit Sadeleştirme

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — oynatıcı tuvali üst chrome  
**Durum:** Tedavi tamamlandı. Üç katmanlı dikey yığılma kalktı; tuval dikey alanı genişledi.

---

## ADIM 1 — Teşhis

### Taranan dosyalar

| Dosya | Rol |
|-------|-----|
| `components/junior/pilot-player/JuniorPilotPlayer.tsx` | Öğretmen + bölüm şeridi + sahne başlığı/ipucu/sayaç |
| `components/junior/pilot-player/DetectiveBoardStage.tsx` | Kural rozetleri (eskiden 3. flex katmanı) |

### Eski dikey yığılma (cognitive overload)

| Katman | İçerik | Eski yükseklik etkisi |
|--------|--------|------------------------|
| 1 | Öğretmen avatarı + 5 bölüm hapı | `px-3 py-1` + `py-0.5` + `px-2.5 py-1` haplar |
| 2 | Sahne başlığı + ipucu + «Sahne N / M» | `mb-1`, `text-sm/base`, kalın sayaç kutusu |
| 3 | Kural rozetleri (`ruleBadges`) | Ayrı `shrink-0` flex satırı, `mb-2.5 sm:mb-3`, wrap |

Üç katman üst üste biniyor; dar görünümde rozet wrap’i 3 satıra düşüp tuvali daha da eziyordu.

---

## ADIM 2 — Layout Tedavisi (sıfır risk CSS/Tailwind)

Koreografi, motor state, pedagoji mühürü ve PCM hizası **dokunulmadı**.

### 1) `JuniorPilotPlayer.tsx` — chrome + başlık

- Bölüm şeridi: `py-0.5` / `px-2`, haplar `text-[10px] sm:text-[11px]`, `px-1.5 py-0.5`, avatar `h-5 w-5` (sm: `h-6`).
- Öğretmen adı: mobilde gizlendi (`hidden sm:inline`); dar şeritte bölüm haplarına yer bırakıldı.
- Sahne başlığı + ipucu: tek satır, `·` ayraç, `text-xs sm:text-sm`, `mb-0.5`, `items-baseline`.
- Sayaç: `Sahne N / M` → kompakt `N/M` (`text-[10px]`, `px-1.5 py-0.5`).
- Board padding: `py-1` kaldırıldı → `pt-0.5`.

### 2) `DetectiveBoardStage.tsx` — kural rozetleri

- Ayrı flex katmanı kaldırıldı.
- Rozetler tuval üstüne `absolute` organik bindirme (`data-junior-rule-badges`).
- `flex-nowrap` + `overflow-x-auto` → **tek satır**; dikey wrap yığılması yok.
- Tipografi sıkı: `text-[9px] sm:text-[10px]`, `py-0.5`, yarı saydam `bg-slate-950/75`.
- Karo grid’ine yalnızca rozet varken `pt-4 sm:pt-5` (çakışma tamponu); rozet yokken padding yok.
- Büyüteç konumu (karo alt-sağ) korundu — önceki overlap tedavisi bozulmadı.

---

## ADIM 3 — Görsel Doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` — bölüm 3 (Son Basamak Dedektifleri), masaüstü viewport ~1280×900.

### Kanıt (DOM geometri)

| Ölçüm | Sonuç |
|-------|--------|
| Chrome (öğretmen + bölüm şeridi) | **~29 px** |
| Başlık + ipucu satırı | **~20 px** |
| Chrome + başlık toplamı | **~49 px** |
| Kural rozetleri | **~16 px**, `position: absolute`, **1 satır** |
| Rozet satır sayısı (`badgeLineCount`) | **1** |
| Sahne tuvali (`data-junior-stage-canvas`) | **~541 px** yükseklik |

### Görsel durum

- Başlık: `Son Basamak Dedektifleri: 2, 5 ve 10 · Büyüteçle sadece birler basamağına bak!` tek satırda.
- «2 / 5 / 10 Kuralı» rozetleri tuval üstünde yatay şerit; 3. chrome katmanı yok.
- Bölüm hapları kompakt; tuval dikey nefes alıyor.

---

## SUPER_ADMIN Özeti

Sıfır riskli header sadeleştirmesi uygulandı. Üç katmanlı yığılma: kompakt tek chrome satırı + tek satır başlık/ipucu + tuval-üstü organik rozet şeridine indirildi. Motor / koreografi / mühür değişmedi.

**Dokunan dosyalar**

1. `components/junior/pilot-player/JuniorPilotPlayer.tsx`
2. `components/junior/pilot-player/DetectiveBoardStage.tsx`
3. `docs/TEDAVI_RAPORU_HEADER_SIMPLIFICATION.md` (bu rapor)
