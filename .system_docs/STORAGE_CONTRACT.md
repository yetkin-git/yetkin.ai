# STORAGE_CONTRACT — nesne depo (dürüst kesit)

**Durum (28 Ağustos 2026, Adım 1 tedavi):** Bu fazda **vatandaş ürün deposu yoktur.** Studio imzalı PUT, `studio-assets` bucket, Dashboard yükleme paneli ve Storage CORS canlı reçete değildir. Studio sayfa/API HTTP **410**; Prisma Studio tabloları DROP; motor `archived/lib/studio/storage.ts`.

**İstisna (canlı, dar):** Akademi ders TTS önbelleği. Bucket adı `lesson-audios`. Byte nesne depodadır; Prisma `AcademyAudioCache` yalnız locator tutar. Yazma kapısı `lib/academy/listen-audio-store.ts`. Public okuma CDN yoludur. Bu istisna Studio’yu, yeni bucket’ı, imzalı PUT’u veya vatandaş yükleme yüzeyini **açmaz**.

Bu dosya sistem beşlisinin beşincisidir. Ajan “nesne depo yok” cümlesini Studio yasağı sanırsa doğrudur; akademi ders sesini yasak sanırsa yanlıştır.

| Madde | Bu faz |
|-------|--------|
| Vatandaş / Studio object store | Yok (410) |
| Akademi `lesson-audios` | Var — ders TTS CDN + Prisma locator. Yeni ürün bucket’ı değildir. |
| Kör `data_base64` gövde | Yasak; Studio DROP. Akademi sesi Base64 kolonunda durmaz. |
| `service_role` JS anahtarı | Yok |
| `ops:migrate` | Studio bucket SQL taşımaz. `lesson-audios.sql` migrate kilit listesinde değildir; ayrı provision (`supabase/storage/lesson-audios.sql`). |

Çapraz yollar: `.system_docs/STORAGE_CONTRACT.md`, `archived/lib/studio/storage.ts`, `lib/academy/listen-audio-store.ts`. Anayasa: `.system_docs/ANAYASA.md`. Ops: `.system_docs/OPS_RUNBOOK.md`.

Ürün kodu bu markdown’ı import etmez. Studio yeniden açılmadan `studio-assets` / CORS SSOT yazılmaz. Akademi dinle kapanırsa bu istisna maddesi OPS ile silinir; sessiz yasağa dönülmez.
