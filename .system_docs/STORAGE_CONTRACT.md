# STORAGE_CONTRACT — nesne depo (dürüst kesit)

**Durum (5 Eylül 2026, 02 Tedavi):** Bu fazda **vatandaş ürün deposu yoktur.** Studio imzalı PUT, `studio-assets` bucket, Dashboard yükleme paneli ve Storage CORS canlı reçete değildir. Studio sayfa/API HTTP **410**; Prisma Studio tabloları DROP; motor `archived/lib/studio/storage.ts`.

**Akademi ses gerçeği:** Taze ingest mühürü **2** derstir (`01_office_ai-1`, `01_office_ai-2`). Kalan 28 ders (`01_office_ai-3`…`-6` ve `02`–`05` altılıları) konuşma metni + bake bekler. Bake WAV `media-bake/academy/audio/{slug}/{key}.wav` altındadır (git/Vercel dışı). Kamu yayın yolu `public/media/academy/audio/{slug}/{key}.mp3`. `ACADEMY_MEDIA_PRODUCTION_QUEUE` boştur. `generateSpeech` ve `listen` kapıları **410**. Prisma `AcademyAudioCache` şemada durabilir; locator yayın vaadi değildir.

Bu dosya sistem beşlisinin beşincisidir. Ajan “nesne depo yok” cümlesini Studio yasağı sanırsa doğrudur; mühürsüz dersi sesli satarsa yanlıştır.

| Madde | Bu faz |
|-------|--------|
| Vatandaş / Studio object store | Yok (410) |
| Akademi mühürlü yayın | **2** MP3 — `01_office_ai-1`, `01_office_ai-2`. Kalan 28 ders taze bake bekler. |
| `lesson-audios` / kamu yayın yolu | Kamu MP3: `public/media/academy/audio/{01_office_ai,02_ecommerce_ai,03_social_media_ai,04_chatbot_nocode,05_prompt_practice}/{key}.mp3`. Bake WAV `media-bake/` (Vercel dışı). Bucket provision yayın vaadi değildir. |
| Kör `data_base64` gövde | Yasak; Studio DROP. Akademi sesi Base64 kolonunda durmaz. |
| `service_role` JS anahtarı | Yok |
| `ops:migrate` | Studio bucket SQL taşımaz. `lesson-audios.sql` migrate kilit listesinde değildir; ayrı provision (`supabase/storage/lesson-audios.sql`). |

Çapraz yollar: `.system_docs/STORAGE_CONTRACT.md`, `archived/lib/studio/storage.ts`, `lib/academy/media-release-seal.ts`, `archived/lib/academy-studio/listen-audio-store.ts`. Anayasa: `.system_docs/ANAYASA.md`. Ops: `.system_docs/OPS_RUNBOOK.md`. Stüdyo sayıları: `docs/OPS_STUDYO_SAYILARI.md`. Pedagoji: `.system_docs/PEDAGOJI.md` (Aşama 1 makale; mühürlü üretim §F; bake OPS’te).

Ürün kodu bu markdown’ı import etmez. Studio yeniden açılmadan `studio-assets` / CORS SSOT yazılmaz. Vatandaş `generateSpeech` / `listen` **410** durur; yayın sesi yalnız mühürlü kamu MP3’ten okunur.
