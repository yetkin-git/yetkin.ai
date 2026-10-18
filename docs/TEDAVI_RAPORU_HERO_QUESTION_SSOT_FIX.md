# TEDAVİ RAPORU — Ders Notu Hero Ana Soru SSOT Düzeltmesi

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Ders Notu / Yardımcı Kaynak sekmesi  
**Durum:** Tedavi tamamlandı. Hero kart sahne cümlesi yerine bütüncül pedagojik ana soruyu basar.

---

## ADIM 1 — Teşhis (SSOT)

### Görünen semptom

Hero kart «🎯 Dersin Ana Sorusu» alanında:

> Peki beşer beşer dizmeye çalışırsak ne olur?

Bu cümle pedagojik ana soru değil; 12 bilye sahnesinin geçici anlatım kancasıdır.

### İçerik kaynağı zinciri

| Katman | Dosya / fonksiyon | Davranış |
|--------|-------------------|----------|
| Pilot booklet | `mat5CanonicalBooklet()` → `lib/junior/pilot-engine/mat-5.choreography.ts` | `concept = cue-03 + cue-04 + cue-05` (temiz sahne metni) |
| Booklet kopyası | `juniorBookletCopy("jr_06_mat-5")` → `lib/junior/booklet.ts` | mat-5 için kanonik booklet döner |
| UI | `ConceptCard` → `components/junior/lesson-booklet.tsx` | `lead = firstSentence(concept)` |

### Kök neden

1. `cue-03` metni «Peki beşer beşer dizmeye çalışırsak ne olur?» ile açılır.
2. Bu metin booklet `concept` alanına yazılır (film–not hizası için doğru).
3. `ConceptCard` yanlışlıkla `concept`/`example` ilk cümlesini «Dersin Ana Sorusu» sanır.
4. Sonuç: hero kart, bütüncül ders sorusu yerine sahne içi transient cümleyi basar.

**Not:** `lib/junior/content/mat/5.ts` senaryosundaki `concept` alanı bu hero yoluna girmiyordu; mat-5 booklet choreography kanonundan geliyordu. Pedagojik ana soru için ayrı SSOT alanı yoktu.

---

## ADIM 2 — Tedavi

### SSOT alanları

`JuniorLessonScenario` ve `JuniorBookletCopy` içine eklendi:

| Alan | Rol |
|------|-----|
| `heroQuestion` | Hero başlık — bütüncül pedagojik ana soru |
| `heroFocus` | Hero alt bant — odak cümlesi |

Sahne / cue / life / example cümlelerinden **türetilmez**.

### `jr_06_mat-5` kanonik metin

Tek sabit evi: `MAT_5_HERO_QUESTION` / `MAT_5_HERO_FOCUS` → `lib/junior/pilot-engine/mat-5.choreography.ts`  
Aynalar: `lib/junior/content/mat/5.ts`, `packages/junior-content/topics/jr_06_mat-5.json`, `mat5CanonicalBooklet()`.

| Bant | Metin |
|------|-------|
| Ana Soru | Bir sayının çarpanı ve katı nedir; bölünebilirliği uzun bölme yapmadan nasıl anlarız? |
| Odak | Bölünebilme dedektifleri (2, 3, 5, 9, 10) ile sayılara tek bakışta karar verme yöntemleri. |

### UI kuralı (`ConceptCard`)

- Başlık: `heroQuestion.trim() || title` — **asla** `firstSentence(concept)` değil.
- Alt bant: `heroFocus` — **asla** `firstSentence(example)` değil.
- Cue tabanlı `concept` / `example` booklet alanları Altın İpucu / film hizası için korunur; hero’ya sızmaz.

### Dokunulan dosyalar

- `lib/junior/content/mat/5.ts` — yazarlık ayna SSOT (`heroQuestion` / `heroFocus`)
- `packages/junior-content/topics/jr_06_mat-5.json` — çalışma zamanı senaryo SSOT
- `packages/junior-content/schema/topic.ts` — şema (opsiyonel hero alanları)
- `lib/junior/content-source.ts` — JSON → senaryo passthrough
- `lib/junior/scenario.ts` — senaryo tipi
- `lib/junior/booklet-copy.ts` — booklet tipi
- `lib/junior/booklet.ts` — mat-5 merge + diğer dersler passthrough
- `components/junior/lesson-booklet.tsx` — `ConceptCard` kaynak kuralı
- `components/junior/activity-hub.tsx` — prop iletimi
- `tests/kernel/junior-mat-5-contract.test.ts` — hero SSOT sözleşmesi

### Çalışma zamanı notu

`juniorBookletCopy` senaryoyu `packages/junior-content/topics/*.json` üzerinden okur (`juniorScenarioIfPresent`). `lib/junior/content/mat/5.ts` ayna yazarlık dosyasıdır; hero metni her iki evde de aynıdır.

### Korunan sözleşmeler

- `mat5CanonicalBooklet().concept` hâlâ cue-03…05 (film–not hizası)
- `data-junior-concept-card`, Altın İpucu / zihin haritası davranışı
- Oynatma koreografisi ve timeline değişmedi

---

## ADIM 3 — Doğrulama

### Beklenen hero çıktısı

| Ölçüm | Sonuç |
|-------|--------|
| Ana soru | «Bir sayının çarpanı ve katı nedir; bölünebilirliği uzun bölme yapmadan nasıl anlarız?» |
| Odak bant | «Bölünebilme dedektifleri (2, 3, 5, 9, 10) ile sayılara tek bakışta karar verme yöntemleri.» |
| «beşer beşer» hero’da | **yok** |
| Cue `concept` içinde «beşer beşer» | **var** (bilinçli; hero dışı) |

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` → **Ders Notu** sekmesi

### Canlı doğrulama (2026-10-18)

| Ölçüm | Sonuç |
|-------|--------|
| `data-junior-concept-card` ana soru | **Bir sayının çarpanı ve katı nedir; bölünebilirliği uzun bölme yapmadan nasıl anlarız?** |
| Odak bant | **Bölünebilme dedektifleri (2, 3, 5, 9, 10) ile sayılara tek bakışta karar verme yöntemleri.** |
| «beşer beşer» hero’da | **yok** |
| Vitest `Ders Notu hero` | **geçti** |

---

## SUPER_ADMIN notu

Sıfır risk: sahne anlatımı ve film hizalı booklet `concept`/`example` korunur. Hero kart yalnızca pedagojik SSOT (`heroQuestion` / `heroFocus`) okur. Diğer Junior derslerinde alan boşsa kart ders başlığına düşer; sahne cümlesi çekmez.
