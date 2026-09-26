# Tedavi Raporu 04 — OFF-201 için Gözde dışı tek eğitmen sesi

Tarih: 26 Eylül 2026  
Dal: `off-201-stage`  
Commit: `fix(academy): set dedicated non-Gozde master voice for OFF-201`

## Karar

OFF-101 (`01_office_ai`) anlatıcısı Gözde (Callirrhoe) kalır.

OFF-201 (`01_office_ai_ileri`) eğitmeni Gözde olamaz. Kurs mührü tek stringdir: **Kore / Aylin** (`ACADEMY_OFF201_COURSE_MASTER_VOICE`). Ders 1’den ders 6’ya kadar aynı ses anlatır. Ders bazlı ses haritası yoktur.

Konuşma metni ve cue selamı `Selamlar, ben Aylin.` olur. Eski Callirrhoe kasetleri `wrong-voice-callirrhoe` ile iptaldir. Oynatıcı onları açmaz. Altı ders `ACADEMY_TTS_REBAKE_QUEUE` içindedir.

## Mühür

Dry-run (`--slug=01_office_ai_ileri`) altı dersi de Kore, Gemini 3.1 Flash TTS, ders başı 12 istek olarak geçti. Harici çağrı yoktu.

`--seal --confirm-gemini-spend --no-db --no-fallback` açıldı. Ders 1’in ilk nefes dilimi 23.5 sn döndü. Sonraki turlar 429 ile tekrarlandı. Fırın şu hatayla durdu:

`402 RESOURCE_EXHAUSTED — Your prepayment credits are depleted.`

Günlük 0/100 RPD penceresi bu turda mühür üretmedi. Ön ödeme kredisi bitmiş. Hiçbir OFF-201 dersi Kore ile diske yazılmadı. Alt modele düşülmedi.

## Satış kapısı

`academyCourseSaleOpen("01_office_ai_ileri")` **false** döner. Altı ders Kore ile mühürlenmeden satış açılmaz.

## Test

Komut: `npm test` (`vitest run`)

- Test dosyası: 236 geçti
- Test: 1153 geçti
- Süre: 63.06 sn
- Çıkış kodu: 0
