# TEDAVİ RAPORU — Dedektif Karar Panosu Boş Durum / Görsel Kirlilik Temizliği

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — Sahne 6 / 12 ve tüm dedektif sahneleri  
**Durum:** Tedavi tamamlandı. Karar öncesi boş pano ve başlık ekranda yer kaplamıyor.

---

## ADIM 1 — Teşhis

### Dosya

`components/junior/pilot-player/DetectiveBoardStage.tsx`

### Kök neden

| Katman | Eski davranış | Etki |
|--------|---------------|------|
| Karar panosu başlığı | `Dedektif Karar Panosu` her zaman render | Karar anı gelmeden ortada boş başlık |
| `SilentVerdictSlot` | `verdicts.length === 0` iken boş kutu | Görsel kirlilik / sahte kart |
| `SilentDigitSlot` | Hook öncesi nötr kart izi | Boş basamak kutusu |
| Grid | Her zaman `grid-cols-2` | Sağ sütun boşken yer israfı |

Sahne 6 (`cue-06`, layout `detective-last-digit`) `STAMP_VERDICT` (`stamp24`, mühürlü `atMs: 94270`) tetiklenene kadar panonun görünmemesi gerekirken eski kod başlık + boş slot’u peşinen basıyordu.

---

## ADIM 2 — Şartlı Render (Hidden State)

### Yapılanlar

1. **`hasVerdict` kapısı:** `detective.verdicts.length > 0` değilse karar panosu kolonunun tamamı `null` (başlık + damgalar birlikte yok).
2. **Fade-in:** Pano ve damga anı sonuç metinleri `junior-verdict-fade-in` (480ms) ile giriş yapıyor.
3. **Grid:** Verdict yokken `grid-cols-1` — basamak alanı tam genişlik.
4. **Silent slot’lar kaldırıldı:** `SilentVerdictSlot` ve `SilentDigitSlot` silindi; içerik yokken boş kutu basılmıyor.
5. **trap-vs-truth:** Sonuç satırları zaten `revealed` ile şartlıydı; boş digit placeholder’ları kaldırıldı, sonuç/callout fade-in aldı.
6. **GraphicOpStage:** Çizim yokken `opacity-35` boş kart yerine `null`.

### Dokunulan dosyalar

- `components/junior/pilot-player/DetectiveBoardStage.tsx`
- `components/junior/pilot-player/GraphicOpStage.tsx`

### Dokunulmayanlar (sıfır risk)

- Koreografi (`mat-5.choreography.ts`)
- Mühürlü timeline (`packages/junior-content/timelines/jr_06_mat-5.timeline.json`)
- Pilot motor / state-reducer
- Pedagoji mühürü

---

## ADIM 3 — Görsel Doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` — Sahne 6 / 12, karar öncesi pencere (`SET_STAGE` sonrası, `STAMP_VERDICT` öncesi).

### Kanıt (DOM + ekran)

| Ölçüm | Sonuç |
|-------|--------|
| Sahne 6 karar öncesi | `Dedektif Karar Panosu` **yok**; silent slot **yok**; yalnız kural rozetleri |
| Sahne 7 damga sonrası | Pano başlığı + dolu damgalar görünür (`✓ 5'e Bölünür`, `✗ 2'ye Bölünmez`) |

### Görsel durum

- Karar öncesi sahne sade: yalnızca üst kural rozetleri + altyazı; ortada boş karar kartı/başlığı yok.
- `STAMP_VERDICT` sonrası pano başlığı ve damgalar birlikte fade-in ile girer.

---

## SUPER_ADMIN Özeti

Sıfır riskli UI koşulu uygulandı. Boş karar panosu ve silent placeholder’lar kaldırıldı; pano yalnız damga anında görünür. Koreografi, timeline ve pedagoji mühürü değişmedi.
