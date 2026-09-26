# Tedavi Raporu 04 — OFF-201 tek hakem ve 100 düdük bütçesi

Tarih: 26 Eylül 2026  
Dal: `off-201-stage`  
Commit: `fix(academy): assign dedicated non-Gozde master voice and enforce 100-request quota budget`

## Hakem

**1 Maç = 1 Hakem.** OFF-201 (`01_office_ai_ileri`) kurs mührü tek stringdir: **Kore / Aylin** (`ACADEMY_OFF201_COURSE_MASTER_VOICE`).

OFF-101 (`01_office_ai`) hakemi Gözde (Callirrhoe) kalır. OFF-201 hakemi Gözde değildir. Altı ders aynı sesi kullanır. Ders bazlı ses haritası yoktur.

## Düdük bütçesi

**1 Maç = MAX 100 Düdük** (`ACADEMY_MATCH_WHISTLE_MAX`). Normal süre 70–80 istektir. Kalan 15–20 istek yalnız zorunlu uzatma ve duraklama içindir.

Dry-run (`--slug=01_office_ai_ileri`, harici çağrı yok) planı:

| Ders | Hakem | İstek |
|------|--------|------:|
| `01_office_ai_ileri-1` | Kore | 12 |
| `01_office_ai_ileri-2` | Kore | 12 |
| `01_office_ai_ileri-3` | Kore | 11 |
| `01_office_ai_ileri-4` | Kore | 12 |
| `01_office_ai_ileri-5` | Kore | 12 |
| `01_office_ai_ileri-6` | Kore | 12 |
| **Maç** | **Kore** | **71** |

71 istek normal süre bandındadır (70–80). Yedek pay 29’dur. Tavan 100 aşılmamıştır. Model `gemini-3.1-flash-tts-preview` dir.

## Mühür

`--seal --confirm-gemini-spend --no-db --no-fallback` açıldı. Ders 1’in ilk nefes dilimi (23.5 sn) sekiz kez tekrarlandı. Dokuzuncu çağrıda fırın durdu:

`402 RESOURCE_EXHAUSTED — Your prepayment credits are depleted.`

Bu turda **9 düdük** gitti. Hepsi reddedildi. Hiçbir OFF-201 dersi Kore ile diske yazılmadı. Alt modele düşülmedi. Ön ödeme kredisi bitmişken aynı 402 artık düdük tekrarlamaz; kredi açılınca aynı model ve Kore ile yeniden fırınlanır.

## Satış kapısı

`academyCourseSaleOpen("01_office_ai_ileri")` **false** döner. Altı ders Kore ile mühürlenmeden satış açılmaz.

## Test

Komut: `npm test` (`vitest run`)

- Test dosyası: 236 geçti
- Test: 1153 geçti
- Süre: 60.23 sn
- Çıkış kodu: 0
