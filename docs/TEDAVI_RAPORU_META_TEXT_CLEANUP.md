# TEDAVİ RAPORU — Pilot Sahne Meta / Placeholder Metin Temizliği

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Sahne 6 / 12 ve tüm pilot `*Stage.tsx` yüzeyleri  
**Durum:** Tedavi tamamlandı. Öğrenci ekranında geliştirici notu / meta placeholder kalmadı.

---

## ADIM 1 — Teşhis

### Taranan dosyalar

| Dosya | Meta metin |
|-------|------------|
| `components/junior/pilot-player/DetectiveBoardStage.tsx` | Evet — ana kaynak |
| `components/junior/pilot-player/MarbleTrayStage.tsx` | Evet — bekleyiş rozetleri |
| `components/junior/pilot-player/GraphicOpStage.tsx` | Evet — `çizim yok` |
| `FactorMultipleStage.tsx` | Yok (zaten sessiz) |
| `SummaryPromptStage.tsx` | Yok (içerik kartları pedagojik) |

### Kaldırılan metinler (`DetectiveBoardStage`)

| Eski metin | Konum |
|------------|--------|
| `Örnek sayı, anlatıcı söyleyince tahtaya gelecek.` | trap-vs-truth sol panel |
| `Karar, örnek söylenince basılacak.` | trap-vs-truth sol karar satırı |
| `Rakam toplamı, anlatıcı söyleyince görünecek.` | trap-vs-truth sağ panel |
| `3 kuralının kararı örnekten sonra.` | trap-vs-truth sağ karar satırı |
| `Sayı, cümlede söylenince tahtaya gelecek.` | ana dedektif tahtası |
| `Büyüteç basamakları inceliyor... Karar damgası birazdan basılacak!` | karar panosu boş durumu |

### Diğer sahneler

| Eski metin | Dosya |
|------------|--------|
| `MASA HAZIR` / `Dedektif masası hazır...` | `MarbleTrayStage.tsx` |
| `Bilye tepsisi henüz boş` (aria-label) | `MarbleTrayStage.tsx` → `Bilye tepsisi` |
| `çizim yok` | `GraphicOpStage.tsx` boş grafik |

---

## ADIM 2 — Silent Pending State

### İlke

Hook tetiklenmeden önce **metin yok**. Alan ya görünmez kalır ya da `aria-hidden` hafif nötr kart izi (`SilentDigitSlot` / `SilentVerdictSlot`) olarak durur. Asıl sayı / damga / denklem yalnızca zaman kancası geldiğinde basılır.

### Kod

1. **`DetectiveBoardStage.tsx`**
   - `SilentDigitSlot` + `SilentVerdictSlot` eklendi.
   - Boş digit / sum / verdict dalları placeholder `<p>` yerine sessiz iz kullanıyor.
   - `revealed === false` iken karar cümleleri hiç render edilmiyor.

2. **`MarbleTrayStage.tsx`**
   - Bilye spawn olmadan üst rozet ve “masa hazır” hapı gizlendi.
   - Spawn sonrası gerçek toplam / “Bilyeler masaya dizildi!” korunuyor.

3. **`GraphicOpStage.tsx`**
   - Boş grafik: metinsiz `data-junior-graphic-op="none"` yüzeyi.
   - Prime tree boş panellerde `çizim yok` kaldırıldı.

4. **Sözleşme testleri**
   - GraphicOp boş durum beklentisi: `çizim yok` → `data-junior-graphic-op="none"`.
   - `junior-mat-5-contract`: meta iğneler (`anlatıcı söyleyince`, `Karar damgası`, …) yok assert’i eklendi.
   - Legacy `math-scenes` / `science-scenes` içindeki `çizim yok` (eski oyuncu) bu turda dokunulmadı.

---

## ADIM 3 — Doğrulama

### Otomatik

```text
vitest: junior-mat-5, mat-6, mat-7, mat-34-36,
        fractions-numberline, geometry-angles,
        fen-forces, fen-37-38
→ 8 dosya / 31+ test geçti (mat-5 ek assert ile dahil)
```

### Canlı UI (`jr_06_mat-5`, Sahne 6 / 12)

| Kontrol | Sonuç |
|---------|--------|
| Sol basamak alanı | Sessiz nötr kart izi; meta yazı yok |
| Dedektif Karar Panosu | Sessiz boş yüzey; “Karar damgası birazdan…” yok |
| DOM `innerText` iğne taraması | 0 hit |

### Pedagojik etki

Öğrenci artık “anlatıcı söyleyince gelecek” gibi geliştirici yönlendirmesi görmüyor. Sayı ve damga, anlatım kancasıyla birlikte doğrudan gerçek içerik olarak beliriyor.

---

## SUPER_ADMIN özeti

Pilot sahnelerde meta/placeholder metin temizliği bitti. Silent pending state canlı; Sahne 6 doğrulandı. Legacy vector player (`math-scenes` / `science-scenes`) `çizim yok` ayakları ayrı turda ele alınabilir.
