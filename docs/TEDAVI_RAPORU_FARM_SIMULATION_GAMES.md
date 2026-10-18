# TEDAVİ RAPORU — Çiftlik Temalı Mini Simülasyonlar

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Etkinlik Stüdyosu / Animasyonlu Simülasyon  
**Durum:** Tedavi tamamlandı. Tavuk Yemleme + Yumurta Kolileme çiftlik modları Bilye/Terazi yanına entegre; alt sekme ve etkileşim doğrulandı.

---

## ADIM 1 — Teşhis

### İstek

Bölünebilme / çarpan konusunu FarmVille tarzı eğitici vektör simülasyonlarıyla pekiştirmek: yem paylaştırma (kalanlı bölme) ve yumurta kolileme (çarpan bulma).

### Mevcut yüzey

| Parça | Dosya | Rol |
|-------|-------|-----|
| Animasyonlu stüdyo | `components/junior/animated-simulations.tsx` | Bilye dağıtım + bölünebilme terazisi |
| Etkinlik Stüdyosu | `components/junior/activity-studio.tsx` | `sim` sekmesi → `AnimatedSimulationStudio` |
| Ses / confetti | `lib/junior/hint-effect.ts`, `lib/junior/activity-confetti.ts` | Bounce / settle geri bildirimi |
| CSS | `app/globals.css` | marble-bounce, scale-wobble, badge-pop |

### Kök boşluk

Animasyonlu Simülasyon yalnızca iki moda sahipti. Çiftlik metaforu (tavuk yemi eşit paylaşım, yumurta koli çarpanları) yoktu; 2 / 5 / 10 ve 24’ün çarpanları için ikinci bir keşif yüzeyi eksikti.

---

## ADIM 2 — Mimari Tedavi

### Yeni modlar (`components/junior/animated-simulations.tsx`)

1. **🐣 Tavuk Yemleme (`ChickenFeedSimulation`)**
   - Yem: 15 / 24 / 25; tavuk: 2 / 3 / 5 / 10.
   - «Yemleri dağıt» → `feedTotal % chickens === 0` ise tavuklar `animate-chicken-hop` + settle + confetti; aksi halde çitte kalan yem pelletleri + «Kalan var! Tam bölünmez».
   - Denklem rozeti: `15 = 5 × 3` veya `25 = 2 × 12 + 1`.
   - SVG tavuk (radial gövde, ibik, kanat) + amber/lime çiftlik gradient.

2. **🥚 Yumurta Kolileme (`EggCartonSimulation`)**
   - 24 yumurta; koli: 2 / 3 / 4 / 5 / 6 / 7 / 8.
   - 2, 3, 4, 6, 8 → tam oturur («Tam oturdu! Bu bir çarpan.»).
   - 5, 7 → açıkta yumurta bölgesi + bounce («Açıkta yumurta kaldı — çarpan değil»).
   - SVG yumurta (`animate-egg-nestle` kolide, leftover’da bounce).

### Alt sekme entegrasyonu

`SimMode`: `"marble" | "balance" | "chicken" | "egg"`.

Buton grubu (sırayla):

- 🔮 Bilye Dağıtımı  
- ⚖️ Bölünebilme Terazisi  
- 🐣 Tavuk Yemleme (2, 5, 10 Kuralı)  
- 🥚 Yumurta Kolileme (Çarpanlar)

`data-junior-sim-mode` değerleri: `marble` | `balance` | `chicken` | `egg`.  
Canvas: `data-junior-sim-canvas="chicken" | "egg"`.

### CSS

`app/globals.css`:

- `junior-chicken-hop` / `.animate-chicken-hop`
- `junior-egg-nestle` / `.animate-egg-nestle`
- `prefers-reduced-motion` listesine eklendi.

Framer Motion / Lottie eklenmedi; mevcut Web Audio + confetti yolu korundu.

---

## ADIM 3 — Doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` → Etkinlik Stüdyosu → **Animasyonlu Simülasyon**

### Kanıt (localhost DOM, 2026-10-18)

| Senaryo | Sonuç |
|---------|-------|
| Alt sekmeler `data-junior-sim-mode` | `marble` / `balance` / `chicken` / `egg` — dördü görünür |
| 15 yem + 5 tavuk + dağıt | «Hepsi neşeli! Tam bölündü.»; her tavuk «3 yem»; «çitte kalan yok» |
| 25 yem + 2 tavuk + dağıt | «Kalan var! Tam bölünmez»; `25 = 2 × 12 + 1`; «Çitte kalan yem: 1» |
| 4’li koli + diz | 6 koli; «Tam oturdu! Bu bir çarpan.» |
| 5’li koli + diz | 4 koli + «Açıkta kalan yumurta (4)»; «Açıkta yumurta kaldı — çarpan değil» |

### Dosya özeti

| Dosya | Değişiklik |
|-------|------------|
| `components/junior/animated-simulations.tsx` | Chicken + Egg modları, 4’lü tab listesi |
| `app/globals.css` | chicken-hop, egg-nestle animasyonları |
| `docs/TEDAVI_RAPORU_FARM_SIMULATION_GAMES.md` | Bu rapor |

---

## SUPER_ADMIN bildirimi

Çiftlik temalı iki eğitici vektör simülasyonu `jr_06_mat-5` Animasyonlu Simülasyon sekmesine canlı alındı. Mevcut Bilye/Terazi bozulmadan korundu; yeni modlar aynı ActivityStudio `sim` yüzeyinden açılır. Ek bağımlılık yok.
