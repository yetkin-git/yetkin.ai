# Tedavi Raporu 03 — 3 katmanlı tek ses ve kota kilidi

Tarih: 26 Eylül 2026  
Dal: `off-201-stage`  
Commit: `feat(academy): implement 3-tier hard constraints for single voice and quota protection`

## Karar

**1 Eğitim Kodu = 1 Ses.** Bir kurs kodu tek bir `courseMasterVoice` stringi taşır. Ders bazlı ses haritası kodda yoktur. OFF-201 (`01_office_ai_ileri`) mührü **Callirrhoe / Gözde** dir (`ACADEMY_OFF201_COURSE_MASTER_VOICE`).

Satış kontrolsüz kota yakma yasağı fırın betiğinin API çağrısından önce durur.

## Katman 1 — tip daraltma

- `ACADEMY_OFF201_LESSON_TTS_VOICE` kaldırıldı.
- `VoiceConfig.lessonVoices` ve `voice` alanı yok. Yerine `courseMasterVoice: string`.
- `academyInstructorTtsCast(slug)` ders anahtarı almaz. İkinci argümanla ses ezilemez.
- Diyalog dökümü de aynı kurs mührünü okur.
- Aktif kurslar `CURRICULUM_MODULES_BY_SLUG` üzerinden bu tek stringi taşır.

## Katman 2 — fırın duvarı

`scripts/generate-academy-lesson-audio.ts`, `GoogleGenAI` istemcisi açılmadan önce üç kontrol çalıştırır:

1. **Tek ses.** `--voice` veya tur sesi `academyCourseMasterVoice(slug)` ile uyuşmazsa `Error`. API yok.
2. **Dry-run fişi.** `--seal` ancak başarılı metin/zamanlama dry-run’undan sonra yazılan fiş güncel mühürle eşleşirse açılır. Fiş `media-bake/academy/dry-run-receipts/` altındadır (git dışı).
3. **Mühürlü MP3.** Ders mühürlüyse ve `public/media/academy/audio/` altında MP3 duruyorsa tekrar fırın `Error` ile durur. `--force` bu kasetin üzerine yazmaz.

İptal kaset (OFF-201 ders 6, `ACADEMY_TTS_REVOKED_CASSETTES`) mühürlü sayılmaz. Kota açılınca aynı model ve Callirrhoe ile fırın, önce `--dry-run` fişi ister.

## Katman 3 — test duvarı

`tests/academy/production-standard.test.ts`:

- Aktif kursları tarar.
- Her kurs için `voicesUsed` tek eleman olmalıdır: `expect(voicesUsed.length).toBe(1)`.
- `lessonVoices` ve `ACADEMY_OFF201_LESSON_TTS_VOICE` yokluğu da kilitlenir.
- OFF-201 `courseMasterVoice` değeri `Callirrhoe` olmalıdır.

SSOT metni: `.system_docs/ANAYASA.md` (B4), `.system_docs/PEDAGOJI.md`, `.cursorrules`.

## Test

Komut: `npm test` (`vitest run`)

- Test dosyası: 236 geçti
- Test: 1153 geçti
- Süre: 61.65 sn
- Çıkış kodu: 0
