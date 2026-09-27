# OFF-201 LANSMAN HAZIRLIK RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 27 Eylül 2026 |
| Dal | `off-201-stage` |
| `origin/main` | `49761f4` |
| Bu kapanıştan önce | `origin/main`’e göre **26** commit önde, 0 geride |
| Bu kapanışla | **27** commit önde. `origin/main` ata olarak durur. Birleştirme hızlı ileri sarmadır |
| İtme | Yok. Uzak dal ve `main` bu oturumda değişmedi |
| Birleştirme | Yapılmadı. Dal `main`’e alınmaya hazırdır |
| Satış | `ACADEMY_OFF201_LAUNCH_SALE_OPEN = false` |

Fırın ölçüleri `docs/TEDAVI_RAPORU_OFF201_FIRINLAMA.md` içindedir. Yayın süresi **71.02 dk** (4261.453 sn). Brifingdeki 44.6 dk, mühürlü dosyayla uyuşmadığı için süre tablosuna yazılmadı.

---

## 1. Test

`npm run test` — 27 Eylül 2026, başlangıç 03:20:38, süre 52.58 sn, çıkış kodu 0.

```
Test Files  237 passed (237)
Tests       1156 passed (1156)
```

Komut, `package.json` içindeki vitest çağrısıdır. `*surface.test.ts` ve `tests/kernel/earnings-bridge.test.ts` bu komutun dışındadır. Önceki mühür kaydı da aynı 237 / 1156 sayısını bu komuttan almıştı.

Kapsam: Kore kaset süreleri, cue dosyaları, timings kilitleri, boş iptal listesi, boş yeniden fırın kuyruğu, imzasız ses için 403, satış mandalının kapalı kalması.

---

## 2. Satış mandalı

`lib/academy/pilot-sku.ts` satırı:

```ts
export const ACADEMY_OFF201_LAUNCH_SALE_OPEN = false;
```

`academyCourseSaleOpen("01_office_ai_ileri")` bu sabit false iken false döner. Altı ders mühürlü olsa da satın alınamaz. Mandal bu commit’te açılmadı.

---

## 3. `main` için hazırlık

`git merge-base --is-ancestor origin/main HEAD` çıkış kodu 0. `origin/main` (`49761f4`) bu dalın atasıdır. Çakışma tabanı yoktur.

Bu oturumda yapılmayanlar:

- `main` üzerine birleştirme
- `origin`’e itme
- pull request açma
- satış mandalını `true` yapma

Sıra, onaydan sonra: `off-201-stage` → `main` pull request’i. CI yeşil kalır. `ACADEMY_OFF201_LAUNCH_SALE_OPEN` false kalır. Canlı dal `main` olmaya devam eder.
