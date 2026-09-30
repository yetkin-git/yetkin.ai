# STORAGE_CONTRACT — nesne depo (dürüst kesit)

**Durum (26 Eylül 2026):** Bu fazda **vatandaş ürün deposu yoktur.** Studio imzalı PUT, `studio-assets` bucket, Dashboard yükleme paneli ve Storage CORS canlı reçete değildir. Studio sayfa/API HTTP **410**; Prisma Studio tabloları DROP; motor `archived/lib/studio/storage.ts`.

**Akademi ses gerçeği:** OFF-101 mühürlü yayın **8** derstir (`01_office_ai-1`, `k1`, `2`, `3`, `5`, `g1`, `w1`, `6`). `01_office_ai-4` sınav yolunda yoktur; süre tablosunda ve canlı konuşma gövdesinde durmaz. OFF-201 satış cümlesi `academyOff201VoiceStatus()` (`lib/academy/pilot-sku.ts`) ile `academyCourseSaleOpen` sonucuna bağlıdır. Fırın modeli `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` okur. Kamu MP3 kimliği bayt olarak teyit edilmedi. Eski Callirrhoe OFF-201 MP3 dosyaları `public/` altında durmaz. Kore mührü `public/media/academy/audio/01_office_ai_ileri/` altındadır. Kardeş SKU `02`–`05` vitrinde Çok Yakında kabuğudur. Bake WAV `media-bake/academy/audio/{slug}/{key}.wav` altındadır (git/Vercel dışı). Yayın dosyası `public/media/academy/audio/{slug}/{key}.mp3` yolundadır; kenar kısa ömürlü imza (`g`) olmadan 403 döner. İzin `GET /api/academy/courses/[id]/audio-grant` ile, satın alma sonrası verilir. `generateSpeech` ve `listen` kapıları **410**. Prisma `AcademyAudioCache` şemada durabilir; locator yayın vaadi değildir.

Bu dosya sistem beşlisinin beşincisidir. Ajan “nesne depo yok” cümlesini Studio yasağı sanırsa doğrudur; mühürsüz dersi sesli satarsa yanlıştır.

| Madde | Bu faz |
|-------|--------|
| Vatandaş / Studio object store | Yok (410) |
| Akademi mühürlü yayın | **8** OFF-101 (`1`, `k1`, `2`, `3`, `5`, `g1`, `w1`, `6`). OFF-201 satış cümlesi `academyOff201VoiceStatus()`. `01_office_ai-4` yok. Kardeşler Çok Yakında. |
| `lesson-audios` / yayın yolu | MP3: `public/media/academy/audio/{slug}/{key}.mp3`. Oturumsuz indirme yok; kenar imza ister. Eski Callirrhoe OFF-201 kaseti bu klasörde durmaz. Kore mührü durur. Bake WAV `media-bake/` (Vercel dışı). Bucket provision yayın vaadi değildir. |
| Kör `data_base64` gövde | Yasak; Studio DROP. Akademi sesi Base64 kolonunda durmaz. |
| `service_role` JS anahtarı | Yok |
| `ops:migrate` | Studio bucket SQL taşımaz. `lesson-audios.sql` migrate kilit listesinde değildir; ayrı provision (`supabase/storage/lesson-audios.sql`). |

Çapraz yollar: `.system_docs/STORAGE_CONTRACT.md`, `archived/lib/studio/storage.ts`, `lib/academy/media-release-seal.ts`, `archived/lib/academy-studio/listen-audio-store.ts`. Anayasa: `.system_docs/ANAYASA.md`. Ops: `.system_docs/OPS_RUNBOOK.md`. Pedagoji: `.system_docs/PEDAGOJI.md` (felsefe). Bake kapısı: `lib/academy/production-standard.ts`. Haftalık sayı: `lib/academy/pilot-sku.ts` ve `lib/academy/curricula/lesson-index.ts`. Canlı mühür listesi: `lib/academy/pilot-sku.ts`.

Ürün kodu bu markdown’ı import etmez. Studio yeniden açılmadan `studio-assets` / CORS SSOT yazılmaz. Vatandaş `generateSpeech` / `listen` **410** durur. Yayın sesi mühürlü MP3’ten okunur; adres kısa ömürlü imza ister.
