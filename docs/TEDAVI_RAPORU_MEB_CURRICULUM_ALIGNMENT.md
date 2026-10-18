# TEDAVİ RAPORU — MEB 6. Sınıf Müfredat Tam Uyum (M.6.1.2.2)

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Ders Notu sekmesi  
**Kazanım:** M.6.1.2.2 — Bölünebilme kuralları **2, 3, 4, 5, 6, 9, 10**  
**Durum:** Tedavi tamamlandı. 4 ve 6 eklendi; 7 ve 8 eklenmedi.

---

## Teşhis

Ders Notu Altın İpucu ve zihin haritası yalnızca iki dedektif ekibini gösteriyordu:

| Vardı | Eksikti | Kapsam dışı (doğru olarak yok) |
|-------|---------|--------------------------------|
| 2, 5, 10 (son basamak) | **4** (son iki basamak) | 7 |
| 3, 9 (rakam toplamı) | **6** (çifte koşul: 2 ∧ 3) | 8 |

Hero odak cümlesi de `(2, 3, 5, 9, 10)` listesini taşıyordu; MEB seti eksikti.

---

## ADIM 1 — İçerik SSOT

### Pedagojik gruplar (4 ekip)

| Ekip | Kurallar | Altın ipucu |
|------|----------|-------------|
| 💡 Son Basamak Dedektifleri | 2, 5, 10 | Birler basamağına bak! |
| 🔍 Son İki Basamak Dedektifi | 4 | Son iki basamak: 00 veya 4'ün katı |
| 🧮 Rakam Toplamı Dedektifleri | 3, 9 | Rakamları topla, kata bak! |
| 🔗 Çifte Koşul Dedektifi | 6 | Hem 2'ye hem 3'e bölünen çift sayılar |

### Dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `lib/junior/content/mat/5.ts` | teaser, concept, example, warning, recap, outcomes, conceptSeal, parentNote → MEB 7 kural |
| `lib/junior/pilot-engine/mat-5.choreography.ts` | `MAT_5_HERO_FOCUS` → `(2, 3, 4, 5, 6, 9, 10)` |
| `packages/junior-content/topics/jr_06_mat-5.json` | `npm run export:junior-content` ile TS SSOT'tan yenilendi |
| `scripts/export-junior-content.ts` | `heroQuestion` / `heroFocus` artık JSON'a basılıyor |

### Korunan sınırlar

- **7 ve 8** hiçbir yüzeyde yok.
- Mühürlü pilot film / cue metni / TTS yeniden fırınlanmadı (oynatma kaseti değişmedi).
- Ders Notu hero metni `mat5CanonicalBooklet` → `MAT_5_HERO_*` üzerinden gelir.

---

## ADIM 2 — UI / Hover kart

`components/junior/lesson-booklet.tsx`

| Bileşen | Davranış |
|---------|----------|
| `MEB_DIVISION_DETECTIVES` | Dört ekibin tek SSOT dizisi |
| `DetectiveGoldBadges` | Altın İpucu: 2×2 `GOLD_CARD_LUXE` hover kart |
| `DetectiveMindMap` | Zihin haritası: aynı dört ekip + örnek chip, `NODE_CARD_LUXE` hover |
| `isDivisionDetectiveCopy` | `2, 5, 10` / `Son Basamak` + `3 ve 9` / `Rakam Toplamı` algısı |

Kart dikey ritmi: dar ekranda tek sütun, `sm:` ve üstünde 2×2 ızgara; lüks hover sınıfları (`hover:-translate-y-0.5`, amber/sky border) korundu.

---

## ADIM 3 — Görsel doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` → **Ders Notu** sekmesi

### Kanıt (DOM / runtime)

| Ölçüm | Sonuç |
|-------|--------|
| Hero odak `(2, 3, 4, 5, 6, 9, 10)` | **evet** |
| Altın İpucu ekip sayısı | **4** |
| Kurallar 2, 3, 4, 5, 6, 9, 10 | **eksiksiz** |
| Kural 7 veya 8 | **yok** |
| Zihin haritası düğüm sayısı | **4** (aynı dört ekip) |
| `GOLD_CARD_LUXE` / `NODE_CARD_LUXE` hover | **evet** |

### Test

```
vitest: junior-mat-5-contract, junior-number-ops-sync, junior-faz37-policy → 21/21 geçti
```

---

## SUPER_ADMIN notu

Sıfır film riski: mühürlü `jr_06_mat-5.timeline.json` ve fırınlanmış MP3 dokunulmadı. Müfredat hizası Ders Notu yardımcı kaynağında (hero + Altın İpucu + zihin haritası) ve senaryo/outcomes SSOT'unda tamamlandı. Sonraki `export:junior-content` hero alanlarını düşürmez.
