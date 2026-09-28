# TESPİT VE MİMARİ AUDİT RAPORU

| Alan | Değer |
|------|-------|
| Tarih | 27 Eylül 2026 |
| Kapsam | OFF-201 ses kalitesi, Super Admin yetkisi, atıl dosyalar, Google AI Studio medya hattı, Anayasa ve strateji |
| Yöntem | Kod okuma, git geçmişi, ham Gemini dökümü ve fırın WAV'ları üzerinde sayısal ölçüm |
| Kod değişikliği | **Yok.** Repoda yalnız bu dosya oluşturuldu. Ölçüm betiği repo dışında (`%TEMP%`) çalıştırılıp silindi. |

---

## 0. Yönetici Özeti

1. **Ses boğukluğunun kök nedeni bulundu ve ölçüldü.** Konuşmayı `0.93` hıza yavaşlatan `tempoStretchPcmWav` fonksiyonu "SOLA" adını taşıyor ama dalga hizalaması yapmıyor. Düz OLA (overlap-add) olarak çalışıyor ve sese **1190 Hz aralıklı bir tarak filtresi (comb filter)** basıyor. 595 Hz'de −33 dB, 1785 Hz'de −24 dB, 3000 Hz'de −19 dB çukur açılıyor. Konuşmanın gövdesi olan 300–1000 Hz bandının enerji payı **%35,8'den %7,3'e** düşüyor. Kulakta bu, "boru içinden / kutudan / ekolu / boğuk" ses olarak duyulur. Gemini'den gelen ham ses temiz.
2. İkincil etkenler: `+8 dB` kazanç ve ardından `tanh` yumuşak kırpıcı, −21 dB seviyesinde bozulma ekliyor. Yayındaki OFF-201 kasetleri ayrıca doğrusal ara değerli (linear) 24→48 kHz dönüşümle üretildi. Çalışma ağacındaki Lanczos düzeltmesi ise asıl sorunu hedeflemiyor.
3. **Örnekleme hızı uyuşmazlığı yok.** 24 kHz doğru okunuyor, 48 kHz'e çevriliyor, MP3 48 kHz / 320 kbps CBR. Oynatıcıda Web Audio işlemesi veya `playbackRate` yok.
4. **Super Admin (`yapinet360@gmail.com`)** yalnız uygulama kodunda, e-posta veya UUID eşleşmesiyle tanınıyor. **E-posta doğrulaması (`email_confirmed_at`) kontrol edilmiyor.** Varsayılan admin e-postası koda gömülü. Veritabanında ve RLS'te admin kimliği yok. Dron istemcisinde admin arayüzü yok, ama çekirdek API aynı atlamayı Bearer token'la da uyguluyor.
5. **Temizlik:** En büyük disk israfı gitignore'daki `media-bake/` (~927 MB WAV). Git'teki en büyük yük `archived/academy-audio-revoked/` (~137 MB MP3). Gerçek ölü kod az: 3 dosya yalnız `archived/` tarafından kullanılıyor.
6. **Medya fabrikası:** Beş modelin beşi de kodda tanımlı. Ancak Lyria, Veo ve Nano Banana betikleri **yalnız `01_office_ai-1` dersine sabitlenmiş**. OFF-201'in müziği, videosu ve fırın görseli yok. Nano Banana 4K ayarı (`imageSize`) verilmiyor. Veo'da native ses kullanılmıyor.
7. **Anayasa:** A katmanı (para, güvenlik, kanıt) sağlam ve korunmalı. B katmanı ve `.cursorrules` ise aşırı tekrar, çelişen model kimlikleri ve **ses kalitesini doğrudan bozan bir sayı kuralı (`0.93`)** taşıyor.

---

## 1. ADIM 1 — OFF-201 (01_office_ai_ileri) Ses Boğukluğu Kök Neden Analizi

### 1.1 Ses hattı haritası

Fırın hattı çevrimdışıdır; izleme anında model çağrılmaz. Sırayla:

| # | Aşama | Dosya | Ne yapıyor |
|---|-------|-------|------------|
| 1 | Metin paketleme | `lib/academy/tts-breath-chunks.ts` | Ders metnini 10–12 isteğe böler. Cümle aralarına `[pause]` ekler. |
| 2 | İstem | `lib/academy/tts-studio-prompt.ts` *(untracked)* | Çalışma ağacında transkriptin üstüne "studio, close-mic, no reverb" yönetmen notu ekler. Yayındaki kasette bu katman yoktu. |
| 3 | Gemini çağrısı | `scripts/generate-academy-lesson-audio.ts` → `requestSpeechWav` | `generateContent`, `responseModalities: ["AUDIO"]`, yalnız `speechConfig` (ses adı + `tr-TR`). |
| 4 | Ham ses | Gemini yanıtı | `audio/wav`, RIFF, **24 000 Hz, mono, 16-bit LINEAR16**, C2PA damgası. |
| 5 | Tempo | `lib/kernel/ai/pcm-wav.ts` → `tempoStretchPcmWav(wav, 0.93)` | **Kök neden.** Aşağıda anlatılıyor. |
| 6 | Yeniden örnekleme | `resamplePcmWav(…, 48000)` | HEAD: doğrusal ara değer. Çalışma ağacı: Lanczos a=8. |
| 7 | Parça önbelleği | `lib/academy/tts-piece-cache.ts` *(untracked)* | **İşlenmiş** (tempo + resample sonrası) WAV'ı saklar. |
| 8 | Birleştirme | `concatPcmWavBuffers` | Parçalar + 0,4 sn / 1,75 sn sessizlikler. |
| 9 | Kazanç | `boostPcmWavGain(merged, 8)` | +8 dB, ardından `limit * tanh(x / limit)` yumuşak kırpıcı. |
| 10 | Yayın | `scripts/transcode-academy-lesson-audio.ts` | ffmpeg `libmp3lame`, 48 kHz, 320 kbps CBR, mono. |
| 11 | Oynatma | `components/academy/lesson-media-player.tsx` | Düz `<audio>` elemanı. Web Audio yok, `playbackRate` yok. Müzik ducking'i yalnız `bed.volume` ile. |

### 1.2 Ölçüm (repo dışı betik, gerçek fonksiyonlar import edilerek)

**a) `tempoStretchPcmWav(rate = 0.93)` sinüs tepkisi, 24 kHz:**

| Frekans | Kazanç | Frekans | Kazanç |
|--------:|-------:|--------:|-------:|
| 150 Hz | −1,4 dB | 1785 Hz | **−23,6 dB** |
| 300 Hz | −6,1 dB | 2000 Hz | −10,2 dB |
| 450 Hz | −15,5 dB | 2380 Hz | −0,1 dB |
| 595 Hz | **−33,1 dB** | 3000 Hz | **−19,2 dB** |
| 800 Hz | −11,0 dB | 4000 Hz | −11,5 dB |
| 1000 Hz | −2,4 dB | 6000 Hz | −0,6 dB |
| 1190 Hz | 0,0 dB | 8000 Hz | −7,3 dB |

Tepe noktaları 1190 Hz'in katları (1190, 2380, …), çukurlar aralarında. Klasik tarak filtresi deseni. `rate = 1.0` iken kazanç 0 dB, yani bozulmayı yalnız yavaşlatma yaratıyor. `rate = 0.97` iken 1 kHz'de −13,5 dB çıkıyor; çukurların yeri hıza göre kayıyor.

**b) Aynı ham Gemini dökümü (`media-bake/academy/raw-dump/01_office_ai-1/raw_dump.wav`, 72 sn) fırın zincirinden geçirildi. Bant enerji payı (%):**

| Aşama | 80–300 Hz | 300 Hz–1 kHz | 1–3 kHz | 3–6 kHz | 6–11,5 kHz |
|-------|---------:|-----------:|-------:|-------:|----------:|
| Ham Gemini 24 kHz | 54,9 | **35,8** | 4,8 | 1,2 | 3,3 |
| Yalnız Lanczos 48 kHz | 55,6 | 35,7 | 4,6 | 1,0 | 3,1 |
| Tempo 0.93 sonrası | 82,3 | **7,3** | 7,1 | 0,9 | 2,4 |
| + Lanczos + 8 dB tanh | 82,3 | 7,4 | 6,4 | 1,1 | 2,8 |

Yeniden örnekleme nötr. Tüm renk değişimini tempo aşaması yaratıyor. 300 Hz–1 kHz bandı birinci formant (F1) ve ses gövdesidir. Bu bant çökünce ses "boğuk ve içi boş" duyulur.

**c) Yayındaki OFF-201 fırın WAV'ları** (`media-bake/academy/audio/01_office_ai_ileri/*.wav`, 48 kHz / mono / 16-bit, 8,9–14,0 dk):
300 Hz–1 kHz payı altı dersin hepsinde **%11–14** aralığında (ham konuşmada beklenen ~%35). Tepe −0,8 dBFS, RMS −14,4 ile −16,1 dBFS arası. Kırpıcının sürekli çalıştığı yoğun bir seviye.

### 1.3 Kök neden #1 — Hizalamasız OLA tempo germe (kritik)

```ts
// lib/kernel/ai/pcm-wav.ts — solaTimeStretchInt16
const window = 1152;
const hopOut = 288;
const hopIn = hopOut * rate;          // 0.93 → 267.84
...
acc[dest] += readInt16Sample(pcm, inPos + i) * hann;   // benzerlik araması yok
...
inPos += hopIn;
outPos += hopOut;
```

- Gerçek SOLA / WSOLA, her pencereyi eklemeden önce önceki çıktıyla **çapraz korelasyon** arar ve pencereyi ses perdesiyle hizalar. Bu kodda o arama yok; yalnız düz Hann overlap-add var.
- Sonuç: her çıktı örneği, girişin **20,16 örnek (0,84 ms)** aralıklarla kaydırılmış 4 kopyasının ağırlıklı toplamı oluyor. Bu matematiksel olarak `24000 / (288 × 0.07) ≈ 1190 Hz` periyotlu bir tarak filtresidir.
- `Math.trunc(inPos + i)` kesirli okuma konumunu yuvarlıyor. Bu da ek faz titremesi getiriyor.
- Dosyadaki yorum ("Perde SOLA ile korunur", "boru/kutu rengini bu çekirdek keser") yanlış teşhis içeriyor. Boru rengi resample'dan değil, bu fonksiyondan geliyor.

### 1.4 Kök neden #2 — +8 dB ve tanh kırpıcı (ikincil)

- `boostPcmWavGain` tüm örnekleri 2,51× büyütüp `tanh` ile sıkıştırıyor. Bu bir limiter değil, **sürekli çalışan bir saturasyon**. Ölçülen bozulma / sinyal oranı: **−21,2 dB**.
- Ham Gemini RMS −17 dBFS, tepe −1,2 dBFS. Yani ses zaten yeterince yüksek. +8 dB'nin çoğu kırpıcıya gidiyor, dinamik ve "nefes" kayboluyor.
- Doğru yöntem: EBU R128 / `loudnorm` (ör. −16 LUFS, true peak −1,5 dBTP). ffmpeg zaten projede mevcut (`ffmpeg-static`).

### 1.5 Kök neden #3 — Yayındaki kasetin doğrusal resample'ı (küçük)

- `git show HEAD` gösteriyor ki yayındaki OFF-201 MP3'leri (27.09 13:27 commit'i) şu zincirle üretildi: `gemini-3.1-flash-tts-preview` + çıplak transkript + tempo 0.93 + **doğrusal ara değer** 24→48 kHz + 8 dB tanh.
- Doğrusal ara değer tizde hafif düşüş ve 12 kHz üstünde ayna (imaging) üretir. Çalışma ağacındaki Lanczos bunu düzeltir, ama kök neden #1'e dokunmaz. Kasetler de yeniden fırınlanmadı.

### 1.6 Sorulan diğer olasılıklar

| Soru | Bulgu |
|------|-------|
| 24 kHz → 44,1 kHz dönüşüm hatası? | **Yok.** 44,1 kHz hiçbir yerde yok. Ham RIFF başlığı 24 000 Hz, `parsePcmSampleRateFromMime` varsayılanı 24 000, yayın 48 000. C2PA ek parçası `data` parçasından sonra geldiği için PCM'e karışmıyor. |
| Sıkıştırılmış / filtresiz kodlama? | MP3 320 kbps CBR 48 kHz, konuşma için şeffaf. Kodlama sorunu değil. "Sıkıştırma" etkisini tanh kırpıcı yapıyor (§1.4). |
| AudioContext / PCM streaming? | Oynatıcı düz `<audio>`. Web Audio kullanan tek dosya `lib/academy/audio-gain.ts`, yalnız `archived/` tarafından import ediliyor. İzlemede stream yok. |
| Gemini voice config eksik mi? | `generateContent` TTS yalnız `speechConfig` kabul ediyor (`voiceConfig`, `languageCode`). **`speakingRate`, `pitch`, `audioEncoding`, `sampleRateHertz` parametresi yok** (kodda da bu not var). Hız ve üslup yalnız **doğal dil yönergesiyle** istenebilir. `0.93` kuralı API'de karşılığı olmadığı için yıkıcı DSP ile uygulanıyor. Sorunun mimari kökü bu. |
| Ekoyu model mi üretiyor? | Hayır. Ham döküm `echoProbe` tepe korelasyonu 0,246 @ 16 ms. Bu, sesli harflerin doğal periyodikliği, yankı değil. Ham ses kuru. |

### 1.7 Neden OFF-201'de daha çok fark ediliyor? (hipotez, dinleme testiyle doğrulanmalı)

Aynı kusur OFF-101 kasetlerinde de var; OFF-101 de aynı zincirden geçti. OFF-201'de daha belirgin duyulmasının olası sebepleri:
- **Kore (Aylin)** daha pes ve "sert" bir ses. Enerjisi 150–600 Hz'de yoğun. 450 Hz (−15 dB) ve 595 Hz (−33 dB) çukurları bu sesin gövdesine denk geliyor.
- OFF-201 dersleri daha uzun (8,9–14 dk). Kulak yorgunluğu renklenmeyi daha fark edilir kılıyor.

### 1.8 Ek bulgular ve tuzaklar

1. **Parça önbelleği DSP sürümünü bilmiyor.** Parmak izi `model + ses + hız + metin + akustik` ile hesaplanıyor ve **işlenmiş** WAV saklanıyor. DSP düzeltilse bile önbellek eski, bozuk parçaları sessizce geri verir. Ham Gemini çıktısı hiç saklanmıyor. Bu yüzden her DSP düzeltmesi yeniden API çağrısı ("düdük") harcatıyor.
2. **Model kimliği çelişkisi.** Çalışma ağacında `academyBakeVoiceModelId()` artık `gemini-3.8-flash-tts` döndürüyor. `.cursorrules` ve Anayasa B4 ise "çağrı yalnız `gemini-3.1-flash-tts-preview`, 3.8 doğrulanmadan fırına yazılmaz" diyor. PEDAGOJI.md 3.8'i onaylıyor. `pilot-sku.ts` yorumu OFF-201'in 3.1 ile mühürlendiğini söylüyor. Bugünkü (22:08) ham döküm 3.8 kimliğinin bu API anahtarıyla yanıt verdiğini gösteriyor. Üç belge ve kod birbirini tutmuyor.
3. **Yönetmen katmanı çelişkisi.** Fırın artık transkriptin üstüne İngilizce yönetmen notu koyuyor (`buildAcademyTtsStudioContents`). Canlı gateway (`lib/kernel/ai/providers/gemini.ts`) ise "NO META-INSTRUCTION IN AUDIO" diyor. `ACADEMY_TTS_CLEAR_FEMALE_PROBE` de "yönetmen katmanı yok" diyor. Aynı dosya içinde iki zıt politika var.
4. `[pause]` etiketinin Gemini 3.x TTS'te resmî bir ses etiketi olup olmadığı doğrulanmadı. Model etiketi okuyabilir ya da yok sayabilir. Ham dökümde dinleyerek kontrol edilmeli.

### 1.9 Önerilen düzeltme (uygulanmadı, sıralı)

1. **Tempo DSP'sini kaldır.** Yavaşlığı modelden iste: yönetmen notuna "Pace: calm, about 7% slower than natural conversation" gibi bir satır. Model doğal nefesle yavaş konuşur, DSP gerekmez.
2. DSP şartsa kendi OLA'n yerine **ffmpeg `atempo=0.93`** (WSOLA tabanlı) veya `rubberband` kullan. ffmpeg zaten bağımlılıkta.
3. `+8 dB tanh` yerine **ffmpeg `loudnorm=I=-16:TP=-1.5:LRA=11`**. Resample'ı da ffmpeg `soxr` ile tek adımda yap.
4. **Ham Gemini WAV'ını önbelleğe al.** DSP adımlarını parmak izine sürüm numarasıyla ekle. Böylece gelecekteki DSP düzeltmeleri sıfır API maliyetiyle yeniden işlenir.
5. **Nesnel ses kalite kapısı** ekle: bant enerji oranı, LUFS, true peak ve tarak filtresi tespiti (otokorelasyon). Kapı geçmeden `--seal` açılmasın.
6. OFF-201'i yeniden fırınla. Bütçe: 6 ders × 10–12 istek = **60–72 düdük** (100 tavanının altında). Önce 1 parçayla A/B dinleme testi (`--sample-only`) yap.

---

## 2. ADIM 2 — Super Admin Yetki ve Ağ Sorgulaması (`yapinet360@gmail.com`)

### 2.1 Tanım nasıl yapılıyor?

Tek kaynak `lib/kernel/auth/super-admin.ts`:

```ts
export const CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT = "yapinet360@gmail.com";
export const CITIZEN_TEST_ACCOUNT_EMAIL = "yetkin.vision@gmail.com";

export function isSuperAdminActor(actor: SuperAdminActor): boolean {
  if (isCitizenTestAccountEmail(actor.email)) return false;
  if (isCanonicalSuperAdminEmail(actor.email)) return true;   // trim + lowercase
  return isSuperAdminUser(actor.id);                         // SUPER_ADMIN_USER_ID
}
```

| Kapı | Mantık |
|------|--------|
| E-posta | `trim` + `toLowerCase`. Env `CANONICAL_SUPER_ADMIN_EMAIL` boşsa **koda gömülü varsayılan** devreye girer. |
| UUID | `SUPER_ADMIN_USER_ID` ile birebir eşleşme. |
| Vatandaş karantinası | `yetkin.vision@gmail.com` her durumda reddedilir, UUID eşleşse bile. |
| E-posta doğrulaması | **Kontrol edilmiyor.** `require-session.ts` yalnız `id` ve `email` varlığına bakıyor. |
| Veritabanı rolü | Yok. `User` modelinde admin kolonu yok. |
| JWT admin claim'i | Yok. Edge yalnız `role === "authenticated"` ve `sub` kontrol ediyor. |
| Yerel env | `.env.local` içinde iki değişken de dolu (değerler okunmadı). |

### 2.2 Bypass'ın uygulandığı yerler

- **Akademi erişimi (üretimde de açık):** `lib/academy/access.ts` (`hasAcademyAdminBypass`), `lib/academy/load.ts`, `lib/academy/curriculum-engine.ts`, `app/academy/**` sayfaları, `app/api/academy/courses/[id]/audio-grant/route.ts`.
- **Sınırsız lab erişimi (sıfır ücretli grant yazımı):** yalnız `NODE_ENV !== "production"` iken.
- **Admin paneli ve API'leri:** `app/(kernel)/admin/page.tsx`, `app/api/(kernel)/admin/catalog`, `.../funnel`. Hem edge (`auth = "admin"`) hem handler (`requireSuperAdmin`) çift kapılı.
- **Freelancer:** anlaşmazlık insan kararı (`human-settle`) yalnız admin'e açık.
- **Cüzdan / defter:** admin bypass'ı **yok**. Anayasa A1 ile uyumlu, doğru karar.

### 2.3 Amiral Gemi + Dron (tek native istemci) durumu

- `apps/rail-is/src` içinde "admin" kelimesi hiç geçmiyor. Dron'da admin arayüzü yok.
- Dron `/api/v1` üzerinden Bearer token ile konuşuyor. Aynı handler'lar çalıştığı için **admin'in akademi atlaması dron oturumunda da geçerli**. Tutarlı, ama dron'da admin olduğunu gösteren hiçbir işaret yok.
- Supabase RLS politikaları yalnız sahip bazlı (`yetkin_auth_user_id()`). Admin'e özel politika yok. Admin işlemleri Prisma (BYPASSRLS) üzerinden sunucuda yürüyor. Tasarım olarak kabul edilebilir.

### 2.4 Eksik veya riskli noktalar (öncelik sırasıyla)

| # | Risk | Etki | Öneri |
|---|------|------|-------|
| 1 | E-posta doğrulaması kontrol edilmiyor | Supabase'de "Confirm email" kapalıysa, bu adresle kayıt olan herkes Super Admin olur. | `email_confirmed_at` şartı ekle. Üretimde UUID **ve** e-posta birlikte eşleşsin. |
| 2 | Varsayılan admin e-postası koda gömülü | Env boş kalırsa üretim yine bu adresi admin sayar. Fail-open davranış. | Üretimde env boşsa admin yok (fail-closed). Varsayılanı yalnız geliştirmede kullan. |
| 3 | Admin kimliği tek Gmail hesabına bağlı | Hesap ele geçerse katalog fiyatı, anlaşmazlık kararı ve tüm içerik açılır. | Admin girişinde MFA zorunlu. Admin yazma işlemleri için denetim kaydı (audit log). |
| 4 | `dispute-engine.ts` içinde `asSuperAdmin?: boolean` bayrağı | Başka bir çağıran `true` geçerse kontrol atlanır. | Bayrağı kaldır, aktörü motorda doğrula. |
| 5 | `assertSuperAdminUserId` (yalnız UUID) üretimde kullanılmıyor | İki farklı kontrol biçimi, kafa karışıklığı. | Sil veya tek fonksiyona indir. |
| 6 | `/admin/curriculum-revisions` sayfasında admin kontrolü yok | Düşük. Sayfa kapalı bir taslak. API her zaman 410 döndürüyor. | Sayfayı sil veya `resolveSuperAdminAccess` ekle. |
| 7 | Metin kayması | `lib/copy/sen-voice/admin.ts` hâlâ "SUPER_ADMIN_USER_ID eşleşmezse…" diyor. E-posta da yeterli. | Metni düzelt. |

---

## 3. ADIM 3 — Atıl ve Geçici Dosya Taraması

### 3.1 Geçici ve üretim artıkları

| Yol | Boyut | Git durumu | Öneri |
|-----|-------|-----------|-------|
| `media-bake/` | **42 dosya, ~927 MB** (fırın WAV'ları, ham döküm, dry-run fişleri) | Ignore | Yeniden üretilebilir. Disk gerekirse temizlenebilir. **Ancak** ham döküm ve parça önbelleği gelecekteki DSP düzeltmesi için değerli (§1.8). Önce ham önbellek mimarisi kurulmalı. |
| `generated/` (kök) | 42 dosya, ~3,4 MB (Prisma istemcisi) | Ignore | Normal. |
| `tsconfig.tsbuildinfo` | ~453 KB | Ignore | Silinebilir. |
| `.tmp/`, `tmp/`, `logs/`, `*.log`, `coverage/`, `test-results/` | Yok | Ignore | Temiz. |
| `supabase/.temp/` | Yok | **Ignore listesinde değil** | `.gitignore`'a ekle. |

### 3.2 Git durumu tuhaflıkları

| Yol | Durum | Öneri |
|-----|-------|-------|
| `lib/academy/tts-piece-cache.ts`, `lib/academy/tts-studio-prompt.ts` | **Untracked ama canlı import ediliyor** (fırın betiği ve test) | Commit edilmeli. Aksi halde temiz klonda fırın ve testler kırılır. |
| `lib/academy/curricula/office_ai/section_4.ts` → `archived/…/section_4.ts` | Taşıma yarım. Hash'ler farklı, birebir kopya değil. | Taşımayı tamamla. |
| `docs/DURUM.md`, `docs/*RAPORU*.md` (6 dosya) | Silinmiş, commit edilmemiş | Yaşayan kesit `docs/ops/DURUM.md`. Silme commit edilebilir. |

### 3.3 Ölü kod adayları

| Yol | Kanıt | Öneri |
|-----|-------|-------|
| `lib/academy/audio-gain.ts` | Yalnız `archived/components/academy-studio/…` import ediyor | Arşive taşı veya sil |
| `components/theme/room-chrome.tsx` | Yalnız `archived/components/junior/…` | Arşive taşı veya sil |
| `lib/kernel/ai/prisma-command-store.ts` | Yalnız `archived/lib/studio`, `archived/lib/devlabs` | Arşive taşı veya sil |
| `scripts/ingest-ecommerce-ai-sections.ts` | `@deprecated`, çağıran yok | Sil |
| `scripts/write-pilot-academy-seed-sql.ts` | 0,4 KB sarmalayıcı | Sil veya dokümana indir |
| `scripts/repair-office-ai-05-silence-hole.ts` | Tek seferlik onarım | Arşive taşı |

### 3.4 Tekrar ve ağırlık

- `scripts/bake-office-ai-01…05-sealed-pack.ts`: 667–823 satır, **%85–87 aynı satır**. Silinmemeli; tek parametrik motora indirilmeli. Ayrıca betik çıktıları hâlâ "TTS … Callirrhoe" yazıyor; OFF-201 için yanıltıcı log.
- Git'teki büyük dosyalar: `archived/academy-audio-revoked/**/*.mp3` (8 dosya, ~137 MB) ve `public/media` (~232 MB). İptal kasetleri için **Git LFS** veya repo dışı depolama önerilir.
- `node_modules` ~909 MB (normal).

---

## 4. ADIM 4 — Google AI Studio Araçları ve Eğitim Videosu Hattı

### 4.1 Araç envanteri

| Araç | Kod kimliği | Nerede | Durum | Kapsam |
|------|-------------|--------|-------|--------|
| Gemini 3.8 Flash (senaryo) | `ACADEMY_BAKE_MODELS.LONG_HORIZON_TEXT = "gemini-3.8-flash"` | `bake-office-ai-0{1–5}` | Bağlı | Yalnız OFF-101 bake paketleri. Canlı sohbet ayrı: `FAST_STREAM = gemini-3.6-flash`. |
| Gemini 3.8 Flash TTS | `VOICE_TTS_STUDIO_PRODUCT = "gemini-3.8-flash-tts"` | `generate-academy-lesson-audio.ts` | Bağlı (çalışma ağacı) | Kimlik belgelerle çelişiyor (§1.8). Hız/perde parametresi yok; DSP bozuyor (§1.3). |
| Nano Banana 2 | `IMAGE_NANO_BANANA_2 = "gemini-3.1-flash-image"` | `bake-office-ai-01-sealed-pack.ts` | Kısmi | Yalnız OFF-101 ders 1. `aspectRatio: "16:9"` var, **`imageSize` (2K/4K) yok**, yani varsayılan çözünürlük. Yedek yol Imagen `generateImages`. |
| Lyria 3.5 | `MUSIC_LYRIA = "lyria-3.5"` | `generate-academy-lesson-bed.ts` | Kısmi | `LESSON_KEY = "01_office_ai-1"` **sabit kodlu**. Diskte tek yatak var: `01_office_ai-1.bed.mp3`. Deneysel `interactions.create` API'si, yedek `generateContent`. Vokal üretimi yok. |
| Veo 3.1 | `VIDEO_VEO_LITE = "veo-3.1-lite-generate-preview"` | `generate-academy-lesson-veo.ts` | Kısmi | Yalnız OFF-101 ders 1 (`ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY`). 720p, 8 sn. **Native ses kullanılmıyor.** Tam Veo 3.1 kurallarla yasak (`VIDEO_VEO_PREMIUM_FORBIDDEN`). |

### 4.2 OFF-201'in medya katmanları

Anayasa B4'ün hedeflediği dört katmandan OFF-201'de bugün yalnız **TTS** ve **cue/karaoke** var. Lyria yatağı, Veo ısınma klibi ve Nano Banana fırın karesi üretilmemiş. Betikler ders bazlı sabit kodlu olduğu için yeni bir derse genişlemek kod değişikliği gerektiriyor.

### 4.3 "Günlük Dil, Tek İş, Tek Cümle" altyapısı

| Var | Yok |
|-----|-----|
| PEDAGOJI.md'de net kurallar (§A.2, §E.2) | Cümle uzunluğu veya okunabilirlik ölçütü (ör. cümle başına en fazla N kelime) |
| `tests/academy/aphorism-cleanup.test.ts`: yasaklı slogan ve aforizma taraması | Jargon sözlüğü ve otomatik "önce günlük karşılık, sonra terim" kontrolü |
| `lib/academy/spoken-scripts/*.md`: konuşma metni cue ile birebir eşleşme kontrolü | Senaryo üretiminde (`LONG_HORIZON_TEXT`) bu kuralları zorlayan ortak sistem istemi. Beş bake betiğinde ayrı ayrı kopyalanmış. |
| Skip-preventer: kısa emir cümlelerini akıcı hale getiriyor | Sesin nesnel kalite kapısı (§1.9 madde 5) |

**Değerlendirme:** Pedagoji kuralları yazılı ve kısmen testle korunuyor. Ancak üretim hattı **genel bir motor değil, derse özel betikler koleksiyonu**. Sade dil standardı ölçülebilir bir kapıya dönüşmemiş.

---

## 5. ADIM 5 — Anayasa Sorgulaması ve Strateji

### 5.1 "Sen olsaydın ne yapardın?"

**Yarın sabah ilk iş:** Ses hattındaki `tempoStretchPcmWav` ve `boostPcmWavGain` adımlarını kaldırırdım. Yavaşlığı modelden doğal dil yönergesiyle ister, ses seviyesini ffmpeg `loudnorm` ile ayarlardım. Ham Gemini çıktısını önbelleğe alır, 1 parçalık A/B dinleme testi yapar, sonra OFF-201'i ~72 istekle yeniden fırınlardım. Sorun bir model veya parametre eksikliği değil, **kendi yazdığımız bir DSP fonksiyonunun hatası**. Düzeltmesi küçük, etkisi büyük.

**İkinci iş (aynı hafta):** Bir "ses kalite kapısı" yazardım. Ölçtüğüm bant oranı testi zaten hazır bir kalıp. Bu kapı olsaydı sorun mühürden önce yakalanırdı. Bugüne kadar kalite, kulakla ve kurallarla korunmaya çalışılmış; ölçümle korunmamış.

**Mimari tarafta:** Dron'un `lib/academy/lesson-cues/*.json` dosyalarını göreli yol ile doğrudan import etmesini keser, bu veriyi bir v1 hop'undan sunardım. Bugün dron paketi Amiral'in dosya ağacına yapışık. ESLint `apps/**` klasörünü taramadığı için bu kaçak yakalanmıyor.

### 5.2 Kılavuz doküman sorgulaması

**Korunması gerekenler (prangaya dönüşmüyor, kalkan görevi görüyor):**
- **Anayasa A1–A5**: tamsayı para, tek defter, lisanssız para tutmama, RLS/IDOR, sunucu tarafı puanlama, dürüst kapalı yüzey. Yasal ve finansal zorunluluklar. Olduğu gibi kalmalı.
- **PEDAGOJI §A.2**: günlük dil, slogan yasağı, "tereddüt anlatıcıdadır". Hedef kitleye (kod yazmayan ofis çalışanı) doğru oturuyor.
- **Fırın disiplini**: `--dry-run` → insan onayı → `--seal`. Bütçe kaçağını önlüyor.

**Pranga olan veya esnetilmesi gerekenler:**

| # | Kural | Sorun | Öneri |
|---|-------|-------|-------|
| 1 | **Konuşma hızı `0.93` sabiti** (`.cursorrules`, B4, PEDAGOJI) | Gemini TTS'te hız parametresi yok. Kural bir DSP katsayısı olarak uygulanıyor ve **boğukluğu doğrudan bu yaratıyor**. Kural bir sonuç değil, bir uygulama yöntemi dayatıyor. | Kuralı sonuç olarak yaz: "Sakin tempo, dakikada yaklaşık X kelime, ölçümle doğrulanır." Yöntem (istem, ffmpeg atempo) koda bırakılsın. |
| 2 | **Çelişen model kimlikleri** | `.cursorrules` ve B4: "çağrı yalnız 3.1-preview". PEDAGOJI ve kod: "fırın 3.8 okur". `pilot-sku.ts`: "3.1 ile mühürlendi". | Tek cümle, tek ev: model kimliği yalnız `model-roles.ts`'te. Belgeler kimlik değil rol adı yazsın. |
| 3 | **`.cursorrules` şişkinliği** | Aynı kural ("1 Eğitim Kodu = 1 Ses", OFF-201 = Kore) 6–7 kez tekrarlanıyor. Futbol metaforları ("1 Maç = 100 Düdük", "FIFA kokartlı hakem") teknik anlamı bulandırıyor. Anayasa "sayıların evi koddur" derken `.cursorrules` sayıları yeniden yazıyor. Çift SSOT kayma üretiyor. | `.cursorrules` kilit bölümünü ~20 satıra indir: kural adı + kod dosyası işaretçisi. Sayıları tekrar etme. |
| 4 | **Ders başına 10–12 istek bandı ve kurs başına 100 tavanı** | Bütçe koruması doğru, ama ham çıktı saklanmadığı için her kalite düzeltmesi bütçeden yiyor. 14 dakikalık derste istek başına ~70 sn blok diksiyon riskini artırıyor. Paketleme kodu (`packAcademyTtsLessonRequests`) bu sayılara uymak için karmaşıklaşmış. | Tavanı "yeni metin fırını" için tut. Ham önbellekten yeniden işleme bütçeye sayılmasın. Bandı katı kural yerine hedef aralık yap. |
| 5 | **Tam Veo 3.1 yasağı** | Maliyet koruması mantıklı. Ancak 8 sn native sesli klip istiyorsan kural buna izin vermiyor. | Maliyet tavanı koy (ör. kurs başına 1 tam Veo çağrısı), mutlak yasak yerine. |
| 6 | **Lyria "müzik ve vokal"** | PEDAGOJI müziği konuşmanın altında dip yatağı olarak tanımlıyor. Anlatım altında vokal, anlaşılırlığı düşürür. | Vokalli müzik yalnız giriş/çıkış jeneriğinde. Anlatım altında enstrümantal kalsın. |
| 7 | **"Sürü Dron / Micro-Apps" dili** | Anayasa B1 bu adı açıkça emekliye ayırmış ("Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci"). Ekip içi konuşmada hâlâ kullanılıyor. | Belge doğru. Günlük dilde de B1 adını kullanmak beklenti kaymasını önler. |

### 5.3 Mimari platform kurgusu: Shared Kernel / API-First Core çalışıyor mu?

**Kısa cevap: Evet, tasarlandığı gibi çalışıyor. Ama tasarım "bağımsız mikro uygulamalar filosu" değil.**

| Güçlü taraf | Kanıt |
|-------------|-------|
| Tek sözleşme | 16 hop, Zod → OpenAPI → üretilmiş istemci tipleri (`lib/kernel/http/v1-contract.ts`, `packages/kernel/src/generated/v1.ts`) |
| İnce paket | `@yetkin/kernel` ~864 satır. Prisma ve Supabase taşımıyor. |
| Oda duvarları | `eslint.config.mjs`: kernel ↛ dikey odalar, kariyer/freelancer ↛ akademi, UI ↛ Prisma |
| Tek kimlik yolu | Web çerez, dron Bearer. `proxy.ts` `/api/v1` yolunu kanonik handler'a yeniden yazıyor. |
| Test yoğunluğu | 408 test dosyası (~56 bin satır) |

| Zayıf taraf | Kanıt |
|-------------|-------|
| Dron ↔ akademi dosya bağı | `apps/rail-is/src/ui/academy-punchcards.ts`, `../../../../lib/academy/lesson-cues/*.json` import ediyor |
| ESLint kör noktası | `apps/**` ve `scripts/**` taranmıyor |
| İki "kernel" | Kalın `lib/kernel` (~21 bin satır) ve ince `packages/kernel`. İsim karışıklığı. |
| Akademi ağırlığı | `lib/academy` ~27 bin satır, kernel'den büyük. Çalışma zamanı kodu ile fırın (üretim) kodu aynı klasörde. |
| Kilitli oda riski | Freelancer motoru ve dron ekranları kodda duruyor, kamu yüzeyi 410. Bayrak kayarsa yüzey sızabilir. |

### 5.4 Gelecek Master Planı

**Faz 0 — Ses onarımı (1–3 gün)**
1. `tempoStretchPcmWav` ve `boostPcmWavGain` fırın hattından çıkarılır. Tempo istemle, seviye `loudnorm` ile ayarlanır.
2. Ham Gemini WAV önbelleği kurulur. DSP sürümü parmak izine eklenir.
3. Ses kalite kapısı yazılır: 300 Hz–1 kHz bant payı, LUFS, true peak, tarak filtresi tespiti.
4. Model kimliği kararı verilir (3.1-preview mi, 3.8 mi) ve tek yerde yazılır.
5. OFF-201 ders 1'den tek parça A/B testi, onaydan sonra 6 ders (~72 istek) yeniden fırınlanır. Aynı işlem OFF-101 için planlanır.

**Faz 1 — Hijyen ve belge sadeleştirme (1 hafta)**
1. Untracked `tts-piece-cache.ts` ve `tts-studio-prompt.ts` commit edilir. `section_4` taşıması ve silinmiş raporlar kapatılır.
2. `.cursorrules` kilit bölümü işaretçi listesine indirilir. `0.93` kuralı "ölçülen tempo hedefi" olarak yeniden yazılır.
3. Ölü kod (3 dosya) ve eski betikler arşive alınır. `supabase/.temp/` ignore'a eklenir. İptal MP3'leri LFS'e taşınır.

**Faz 2 — Admin sertleştirme (2–3 gün)**
1. `email_confirmed_at` şartı. Üretimde UUID + e-posta birlikte.
2. Üretimde env boşsa admin yok (fail-closed). Koda gömülü varsayılan yalnız geliştirmede.
3. Admin yazma işlemlerine denetim kaydı. Admin hesabında MFA.
4. `asSuperAdmin` bayrağı ve kullanılmayan `assertSuperAdminUserId` kaldırılır.

**Faz 3 — Genel medya fabrikası (2–3 hafta)**
1. Beş bake betiği tek bir parametrik motora indirilir. Kurs bir manifest dosyasıyla tanımlanır.
2. Lyria, Veo ve Nano Banana betiklerindeki sabit ders anahtarları kaldırılır; `--slug --key` ile her derse açılır.
3. Nano Banana için `imageSize` (2K/4K) ayarı. Veo için maliyet tavanlı native ses kararı.
4. Senaryo üretimine ortak "vatandaş dili" sistem istemi. CI'a cümle uzunluğu ve jargon sözlüğü denetimi.
5. OFF-201 için dört katman tamamlanır: yatak, ısınma klibi, fırın kareleri.

**Faz 4 — Mimari sıkılaştırma (sürekli)**
1. Dron cue/punchcard verisini yeni bir v1 hop'undan alır. Dosya importu kalkar.
2. ESLint `apps/rail-is/src` kapsamına alınır.
3. `lib/academy` ikiye ayrılır: çalışma zamanı (oynatıcı, erişim, sınav) ve üretim (fırın, TTS, cue yazımı).
4. `lib/kernel` için "server kernel" adı netleştirilir; ince paketle karışmaz.

**Faz 5 — Büyüme**
1. Yeniden fırınlanmış OFF-201 ile satış yüzeyi açılır (Anayasa B3 onay kapısıyla).
2. Genel fabrika ile sıradaki SKU'lar (`02_ecommerce_ai` vb.) aynı kalite kapısından geçerek mühürlenir.
3. B2B pilot keşfi ve Faz 2 (Split) checklist'i, Manifesto'daki sırayla.

---

## Ek A — Ölçüm yöntemi

- Betik: `%TEMP%\yetkin-audio-audit.ts`, `npx tsx` ile çalıştırıldı, ölçümden sonra silindi. `lib/kernel/ai/pcm-wav.ts` fonksiyonlarını değiştirmeden import etti. Faz 0'daki ses kalite kapısı bu yöntemle yeniden yazılabilir.
- Sinüs testi: 2 sn, 0,3 genlik, 24 kHz. Kenardaki 0,2 sn atlanarak RMS oranı ölçüldü.
- Bant payı: 4096 örnek Hann pencereli FFT, tüm dosya boyunca güç toplamı.
- Bozulma oranı: doğrusal +8 dB ile `tanh` çıktısı arasındaki farkın enerjisi.
- OFF-201 WAV'larında 20. saniyeden itibaren 150 sn örneklendi.

## Ek B — Başvurulan ana dosyalar

`lib/kernel/ai/pcm-wav.ts`, `lib/kernel/ai/model-roles.ts`, `scripts/generate-academy-lesson-audio.ts`, `scripts/transcode-academy-lesson-audio.ts`, `lib/academy/tts-breath-chunks.ts`, `lib/academy/tts-piece-cache.ts`, `lib/academy/tts-studio-prompt.ts`, `lib/academy/pilot-sku.ts`, `lib/academy/instructors.ts`, `components/academy/lesson-media-player.tsx`, `lib/kernel/auth/super-admin.ts`, `lib/kernel/auth/require-session.ts`, `lib/academy/access.ts`, `scripts/generate-academy-lesson-bed.ts`, `scripts/generate-academy-lesson-veo.ts`, `scripts/bake-office-ai-01-sealed-pack.ts`, `eslint.config.mjs`, `apps/rail-is/src/ui/academy-punchcards.ts`, `.system_docs/ANAYASA.md`, `.system_docs/MANIFESTO.md`, `.system_docs/PEDAGOJI.md`, `.cursorrules`.
