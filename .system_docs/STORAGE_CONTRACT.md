# STORAGE_CONTRACT — nesne depo (dürüst kesit)

**Durum (26 Eylül 2026):** Bu fazda **vatandaş ürün deposu yoktur.** Studio imzalı PUT, `studio-assets` bucket, Dashboard yükleme paneli ve Storage CORS canlı reçete değildir. Studio sayfa/API HTTP **410**; Prisma Studio tabloları DROP; motor `archived/lib/studio/storage.ts`.

**Akademi ses gerçeği:** OFF-101 mühürlü yayın **8** derstir (`01_office_ai-1`, `k1`, `2`, `3`, `5`, `g1`, `w1`, `6`). `01_office_ai-4` sınav yolunda yoktur; süre tablosunda ve canlı konuşma gövdesinde durmaz. OFF-201 mühürlü yayın **6** derstir (`01_office_ai_ileri-1` … `-6`). Fırın kuyruğu boştur. Kardeş SKU `02`–`05` vitrinde Çok Yakında kabuğudur. Bake WAV `media-bake/academy/audio/{slug}/{key}.wav` altındadır (git/Vercel dışı). Kamu yayın yolu `public/media/academy/audio/{slug}/{key}.mp3`. `generateSpeech` ve `listen` kapıları **410**. Prisma `AcademyAudioCache` şemada durabilir; locator yayın vaadi değildir.

Bu dosya sistem beşlisinin beşincisidir. Ajan “nesne depo yok” cümlesini Studio yasağı sanırsa doğrudur; mühürsüz dersi sesli satarsa yanlıştır.

| Madde | Bu faz |
|-------|--------|
| Vatandaş / Studio object store | Yok (410) |
| Akademi mühürlü yayın | **8** OFF-101 (`1`, `k1`, `2`, `3`, `5`, `g1`, `w1`, `6`) + **3** OFF-201 (`ileri-3`, `ileri-4`, `ileri-5`). `01_office_ai-4` yok. Kardeşler Çok Yakında. OFF-201 ders 1, 2 ve 6 ses kuyruğunda. |
| `lesson-audios` / kamu yayın yolu | Kamu MP3: `public/media/academy/audio/{01_office_ai,02_ecommerce_ai,03_social_media_ai,04_chatbot_nocode,05_prompt_practice}/{key}.mp3`. Bake WAV `media-bake/` (Vercel dışı). Bucket provision yayın vaadi değildir. |
| Kör `data_base64` gövde | Yasak; Studio DROP. Akademi sesi Base64 kolonunda durmaz. |
| `service_role` JS anahtarı | Yok |
| `ops:migrate` | Studio bucket SQL taşımaz. `lesson-audios.sql` migrate kilit listesinde değildir; ayrı provision (`supabase/storage/lesson-audios.sql`). |

Çapraz yollar: `.system_docs/STORAGE_CONTRACT.md`, `archived/lib/studio/storage.ts`, `lib/academy/media-release-seal.ts`, `archived/lib/academy-studio/listen-audio-store.ts`. Anayasa: `.system_docs/ANAYASA.md`. Ops: `.system_docs/OPS_RUNBOOK.md`. Pedagoji: `.system_docs/PEDAGOJI.md` (felsefe). Bake SOP: `docs/ops/akademi-bake-elkitabi.md`. Haftalık sayı: `docs/ops/DURUM.md`. Canlı mühür listesi: `lib/academy/pilot-sku.ts`.

Ürün kodu bu markdown’ı import etmez. Studio yeniden açılmadan `studio-assets` / CORS SSOT yazılmaz. Vatandaş `generateSpeech` / `listen` **410** durur; yayın sesi yalnız mühürlü kamu MP3’ten okunur.
