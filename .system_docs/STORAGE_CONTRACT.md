# STORAGE_CONTRACT — nesne depo (dürüst kesit)

**Durum (5 Eylül 2026, 02 Tedavi):** Bu fazda **vatandaş ürün deposu yoktur.** Studio imzalı PUT, `studio-assets` bucket, Dashboard yükleme paneli ve Storage CORS canlı reçete değildir. Studio sayfa/API HTTP **410**; Prisma Studio tabloları DROP; motor `archived/lib/studio/storage.ts`.

**Akademi ses gerçeği:** Mühürlü yayın WAV sayısı **2**’dir (`ACADEMY_MEDIA_SEALED_AUDIO["01_office_ai"] = ["01_office_ai-1", "01_office_ai-2"]`). Prodüksiyon kuyruğu 3–6. derslerdir (`ACADEMY_MEDIA_PRODUCTION_QUEUE`); WAV mühürlenmeden karaoke basılmaz. `generateSpeech` ve `listen` kapıları **410**. Kamu WAV yolu `public/media/academy/audio/01_office_ai/01_office_ai-{1,2}.wav`. Prisma `AcademyAudioCache` şemada durabilir; locator yayın vaadi değildir. Diğer dersler mühürsüzdür.

Bu dosya sistem beşlisinin beşincisidir. Ajan “nesne depo yok” cümlesini Studio yasağı sanırsa doğrudur; mühürsüz dersi sesli satarsa yanlıştır.

| Madde | Bu faz |
|-------|--------|
| Vatandaş / Studio object store | Yok (410) |
| Akademi mühürlü WAV | **2** — `01_office_ai-1`, `01_office_ai-2` |
| `lesson-audios` / kamu WAV yolu | Kamu WAV: `public/media/academy/audio/01_office_ai/01_office_ai-1.wav` ve `01_office_ai-2.wav`. Bucket provision yayın vaadi değildir. |
| Kör `data_base64` gövde | Yasak; Studio DROP. Akademi sesi Base64 kolonunda durmaz. |
| `service_role` JS anahtarı | Yok |
| `ops:migrate` | Studio bucket SQL taşımaz. `lesson-audios.sql` migrate kilit listesinde değildir; ayrı provision (`supabase/storage/lesson-audios.sql`). |

Çapraz yollar: `.system_docs/STORAGE_CONTRACT.md`, `archived/lib/studio/storage.ts`, `lib/academy/media-release-seal.ts`, `archived/lib/academy-studio/listen-audio-store.ts`. Anayasa: `.system_docs/ANAYASA.md`. Ops: `.system_docs/OPS_RUNBOOK.md`. Stüdyo sayıları: `docs/OPS_STUDYO_SAYILARI.md`. Pedagoji: `.system_docs/PEDAGOJI.md` (Aşama 1 makale; bake OPS’te).

Ürün kodu bu markdown’ı import etmez. Studio yeniden açılmadan `studio-assets` / CORS SSOT yazılmaz. Vatandaş `generateSpeech` / `listen` **410** durur; yayın sesi yalnız mühürlü kamu WAV’dan okunur.
