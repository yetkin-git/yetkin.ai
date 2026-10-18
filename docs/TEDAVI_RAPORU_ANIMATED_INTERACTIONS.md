# TEDAVİ RAPORU — Animasyonlu Etkileşimler (Interactive Vector Mini-Games)

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Etkinlik ve Oyun Stüdyosu / Animasyonlu Simülasyon  
**Durum:** Tedavi tamamlandı. Bilye dağıtım + bölünebilme terazisi simülasyonları akıcı; sekme entegrasyonu doğrulandı.

---

## ADIM 1 — Teşhis

### Geri bildirim

Öğrenci: Okulistik’te video tarzı animasyonlu etkileşimler vardı; amiral gemisi tuvalinde dokunarak/sürükleyerek deneme eksikti.

### Mevcut mimari

| Parça | Dosya | Rol |
|-------|-------|-----|
| Vektör oynatıcı | `components/junior/vector-player.tsx` | Ders timeline / MarbleTrayStage (pasif sahne) |
| Etkinlik Stüdyosu | `components/junior/activity-studio.tsx` | Eşleştir / Boşluk / Dedektif (puanlı) |
| Cam bilye görseli | `components/junior/pilot-player/MarbleTrayStage.tsx` | Koreografiye bağlı, etkileşimsiz |

### Kök boşluk

Stüdyo sekmeleri yalnızca puanlı etkinlikti. Öğrencinin 12 bilyeyi 2’şer/3’er/4’er/5’er denediği veya sayı÷bölen dengesini gördüğü interaktif mini-simülasyon yoktu. Framer Motion / Lottie bağımlılığı yok; yerel SVG + CSS + pointer sürükleme tercih edildi (sıfır risk, amiral gemisi UX).

---

## ADIM 2 — Mimari Tedavi

### Yeni yüzey

`components/junior/animated-simulations.tsx`

1. **🔮 12 Bilye Dağıtım Simülasyonu**
   - 12 cam bilye (MarbleTray paleti ile uyumlu radial gem).
   - Grup: 2’şer / 3’şer / 4’şer / 5’şer.
   - Pointer sürükle-bırak kutulara; dolu kutuya fazla atışta sekme + ses.
   - Kalan varsa «Dışarıda artan» bölgesi + `animate-marble-bounce`.
   - Kalansız: «Kalansız! Tam çarpan.» + settle sesi + confetti spark.
   - «Otomatik diz» / «Sıfırla» kısayolları.

2. **⚖️ Bölünebilme Terazisi**
   - SVG vektör terazi; sayı (12…30) × bölen (2…10) seçimi.
   - `remainder === 0` → `animate-scale-settle` + denge mesajı.
   - Kalan → eğim + `animate-scale-wobble` + bounce sesi.
   - Örnek doğrulama: `24÷3` denge, `14÷3` sallanma.

### Stüdyo entegrasyonu

`components/junior/activity-studio.tsx`

- GAMES’e `{ id: "sim", label: "Animasyonlu Simülasyon" }` eklendi.
- Tab grid: `grid-cols-2 sm:grid-cols-4`.
- Sim sekmesinde «Etkinliği kontrol et» gizlenir (keşif modu; rozet 3 puanlı oyuna bağlı kalır).
- Durum satırı: «Dokunarak dene».

### Ses ve CSS

- `lib/junior/hint-effect.ts` → `playJuniorSimBounce`, `playJuniorSimSettle` (yerel Web Audio; dış API yok).
- `app/globals.css` → `junior-marble-bounce`, `junior-scale-wobble`, `junior-scale-settle` (+ reduced-motion).

---

## ADIM 3 — Görsel / DOM Doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` — Etkinlik Stüdyosu → **Animasyonlu Simülasyon**

### Kanıt

| Senaryo | Sonuç |
|---------|--------|
| Sekme `data-junior-studio-tab=sim` | Seçili; alt sekmeler Bilye / Terazi |
| 2’şer + Otomatik diz | Kutular 2/2; «Kalansız! Tam çarpan.» |
| 5’şer + Otomatik diz | `12 = 2 × 5 + 2`; artan 2/2; «Artan bilye var — bu çarpan değil.» |
| Terazi 24 + 3 | «24 ÷ 3 kalansız — denge!» |
| Terazi 14 + 3 | «14 ÷ 3 kalan 2 — sallanıyor»; kiriş eğimli |

### Dokunulan dosyalar

- `components/junior/animated-simulations.tsx` (yeni)
- `components/junior/activity-studio.tsx`
- `lib/junior/hint-effect.ts`
- `app/globals.css`
- `docs/TEDAVI_RAPORU_ANIMATED_INTERACTIONS.md` (bu rapor)

---

## SUPER_ADMIN özeti

Animasyonlu etkileşimler Etkinlik Stüdyosu’nda canlı. Okulistik tarzı «dokun-dene» döngüsü, VectorPlayer görsel diline (cam bilye / vektör) hizalı ve puanlı 3 oyunu riske atmadan ayrı sekmede çalışıyor. Framer/Lottie eklenmedi; performans ve paket yüzeyi sıfır risk.
