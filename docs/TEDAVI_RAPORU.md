# TEDAVİ RAPORU

| Alan | Değer |
|------|-------|
| Tarih | 27 Eylül 2026 |
| Kaynak | `docs/TESPIT_RAPORU.md` |
| Kapsam | OFF-201 ses hattı, Super Admin, dosya hijyeni, kılavuz sadeleştirme |
| Kod | Uygulandı. Commit açılmadı. |

---

## 1. OFF-201 ve TTS ses hattı

Fırın artık `tempoStretchPcmWav` ve `boostPcmWavGain` çağırmaz. Tempo, yönetmen notundadır: `Pace: calm, natural, clear accent.` Seviye ffmpeg EBU R128 `loudnorm=I=-16:TP=-1.5:LRA=11` ve 48 kHz yeniden örneklemedir. `atempo` uygulanmaz. Hız esnetmesi gerekirse izinli yol yalnız ffmpeg `atempo=0.93` (WSOLA) olur; bu fırında kapalıdır (`ACADEMY_BAKE_ATEMPO = null`).

Ham Gemini WAV `media-bake/academy/raw-cache/` altına yazılır. İşlenmiş parça parmak izi `ACADEMY_TTS_DSP_REV` (`prompt-pace-loudnorm-r128-v1`) taşır. DSP değişince API çağrılmaz; ham önbellek yeniden işlenir.

Kalite kapısı `lib/academy/tts-quality-gate.ts`: 300 Hz–1 kHz enerji payı en az %30, bütünleşik LUFS hedefi −16 (±2,5). Kapı geçmeden ders WAV’ı mühürlenmez.

### A/B ve frekans

`--sample-only` mühürsüz çağrı API açmaz. OFF-201 ders 1 için yazılan çift:

| Dosya | Ölçüm |
|-------|--------|
| `media-bake/academy/ab-sample/01_office_ai_ileri-1/raw.wav` | Konuşma biçimli kuru örnek (Gemini düdüğü yok) |
| `media-bake/academy/ab-sample/01_office_ai_ileri-1/processed.wav` | 300 Hz–1 kHz **%79,9**, LUFS **−16,1** |

Aynı master, diskteki gerçek Gemini dökümü üzerinde de ölçüldü (`media-bake/academy/raw-dump/01_office_ai-1/raw_dump.wav`):

| Aşama | 300 Hz–1 kHz | LUFS |
|-------|-------------:|-----:|
| Ham Gemini | %35,1 | — |
| Eski `tempoStretchPcmWav(0.93)` | %7,4 | — |
| Yeni loudnorm hattı | %35,6 | −16,5 |

Eski tarak filtresi gövdeyi çökertiyor. Yeni hat ham payı koruyor ve −16 LUFS bandına oturuyor. Kapı eşiği %30 ve −16 ±2,5. İkisi de geçti.

Canlı OFF-201 parçası için `--seal --confirm-gemini-spend` bu raporda açılmadı. Kota ve insan onayı olmadan düdük yok.

---

## 2. Super Admin

`isSuperAdminActor` artık `email_confirmed_at` dolu değilse admin saymaz. Oturum bu alanı `getUser()` çıktısından alır. Kenar JWT’de `email_confirmed_at` claim’i varsa okunur.

`NODE_ENV === "production"` iken `CANONICAL_SUPER_ADMIN_EMAIL` veya `SUPER_ADMIN_USER_ID` boşsa geçiş kapalıdır. Koda gömülü varsayılan yalnız geliştirmede kalır. Üretimde UUID ve kanonik e-posta birlikte eşleşir.

`asSuperAdmin` bayrağı `settleHumanReviewDispute` içinden çıkarıldı. Aktör motorda doğrulanır. `assertSuperAdminUserId` silindi. Tek kapı `assertSuperAdminActor`.

---

## 3. Repo hijyeni

`lib/academy/tts-piece-cache.ts` ve `lib/academy/tts-studio-prompt.ts` canlı hatta bağlı ve düzenlendi. Commit istenmediği için staging’e alınmadı.

Taşınan ölü kod:

| Eski yol | Yeni yol |
|----------|----------|
| `lib/academy/audio-gain.ts` | `archived/lib/academy/audio-gain.ts` |
| `components/theme/room-chrome.tsx` | `archived/components/theme/room-chrome.tsx` |
| `lib/kernel/ai/prisma-command-store.ts` | `archived/lib/kernel/ai/prisma-command-store.ts` |

Arşivdeki üç import göreli yola çekildi. `supabase/.temp/` `.gitignore` içine eklendi.

---

## 4. Kılavuz

`.cursorrules`, `.system_docs/ANAYASA.md`, `.system_docs/PEDAGOJI.md` ve bake el kitabı: `0.93` artık ölçülen doğal tempo hedefidir, DSP katsayısı değildir. Model kimliği `lib/kernel/ai/model-roles.ts` üzerine bağlandı. Canlı rol `VOICE_TTS`, fırın `academyBakeVoiceModelId()`. Belgelerdeki “3.8 fırına yazılmaz / çağrı yalnız 3.1-preview” çelişkisi kaldırıldı.

---

## 5. Test

Geçen paket: ses kalite kapısı, nefes/parmak izi, PCM, Super Admin, kenar admin kapısı, akademi erişim, oynatıcı, sınav, ders notu, freelancer tahkim ve ilan, insan ritmi.

`tests/academy/production-standard.test.ts` bu çalışma ağacında `docs/DURUM.md` olmadığı için düşüyor. Dosya tedavi öncesi silinmişti (`docs/ops/DURUM.md` duruyor). Pedagoji ve Anayasa cümleleri bu satırdan önce geçti.

---

## 6. Strateji soruları

### Sen olsaydın ne yapardın?

Sıradaki ilk iş, kota açılınca OFF-201 ders 1’in tek parçasını `--sample-only --seal --confirm-gemini-spend` ile canlı Gemini’den almak. Ham WAV önbelleğe düşer. Kapı ve kulak aynı parçayı onaylamadan diğer beş ders fırınlanmaz. Onaydan sonra kalan dersler ham önbellek sayesinde DSP için yeniden düdük yakmaz.

### Kılavuz dokümanlar tam uyumlu hale geldi mi?

Bu paketteki iki çelişki hizalandı: tempo artık DSP dayatması değil, model kimliği `model-roles.ts` dışında yeniden yazılmıyor. Belgeler henüz yirmi satırlık işaretçi listesine inmiş değil. `.cursorrules` içinde “1 Eğitim Kodu = 1 Ses” tekrarı duruyor. PEDAGOJI testleri `0.93` ve `Gemini 3.1 Flash TTS` metnini hâlâ arıyor; bu yüzden sayılar belgede bir kez hedef olarak kaldı.

### Dron ile Core dosya bağımlılığı izolasyona geçti mi?

Hayır. Bu paket o bağı kesmedi. Dron hâlâ `lib/academy/lesson-cues/*.json` dosyalarını göreli yolla okuyor. `apps/**` ESLint taramasının dışında. İzolasyon ayrı bir v1 hop işidir.

### OFF-201 yeniden fırın ve canlı takvimi

1. Kota açıkken ders 1 için `--dry-run`, ardından tek parça `--sample-only --seal`. Kapı ve dinleme.
2. Onaydan sonra ders 1–6, kurs başına 100 düdük tavanının altında (plan yaklaşık 60–72 istek). Her ders kalite kapısından geçer; geçmeyen mühür yazılmaz.
3. Yayın MP3 transcode. Eski Callirrhoe kaseti çalınmaz.
4. Aynı sıra OFF-101 için planlanır. OFF-201 bitmeden satış yüzeyi açılmaz (Anayasa B3).
5. Yatak, ısınma klibi ve fırın karesi bu ses mühründen sonra gelir. Ses mührü satış eşiğidir.
