# TESPİT RAPORU — Junior Isınma / Intro Video (Warmup Hook)

**Tarih:** 2026-10-18  
**Karar sahibi:** CEO + SUPER_ADMIN  
**Kapsam:** `http://localhost:3000/junior/ders/jr_06_mat-5` ders başı 8–10 sn ısınma / intro video katmanı  
**Durum:** Tespit tamamlandı; ürün kodu değiştirilmedi (sıfır risk denetimi).

---

## ADIM 1 — Kod ve Varlık Tespiti

### 1.1 Koreografi (`mat-5.choreography.ts`)

| Soru | Bulgu |
|------|--------|
| `introUrl` / `videoHook` / `warmupVideo` alanı var mı? | **Hayır.** |
| Dosyadaki “hook” ne anlama geliyor? | Yalnız TTS / sahne kancaları (`{@hookName}` → `spawnMarbles`, `groupBy2`, …). MP4 ısınma ile ilişkisi yok. |
| Diğer choreo dosyaları? | Yalnız `lib/junior/pilot-engine/mat-5.choreography.ts` var. |

**Sonuç:** Isınma videosu koreografi / timeline sözleşmesinin parçası değildir ve orada eksik “import” aramak yanlış yüzeye bakar.

### 1.2 Isınma varlık haritası (ayrı SSOT)

Isınma, koreografiden bağımsız bir katmandır:

| Dosya | Rol |
|-------|-----|
| `lib/junior/warmup.ts` | Beş çekirdek slug → kamu MP4 yolu; `juniorWarmupSrc(lessonKey)` |
| `lib/junior/media-grant.ts` | Kilitli derslerde imzalı `warmupUrl` |
| `lib/junior/production-seal.ts` | Mühür kapısı `warmup` (kaynak yolu yoksa gap) |
| `components/junior/player/use-junior-warmup-gate.ts` | `cassette` → `fade` → `scene` kapısı |
| `components/junior/player/warmup-cassette.tsx` | `<video>` kaseti + Atla / failsafe |

`jr_06_mat-5` için çözüm:

```
juniorCourseSlugFromLessonKey("jr_06_mat-5") → "jr_06_mat"
juniorWarmupSrc(...) → "/media/junior/warmup/jr_06_mat-warmup.mp4"
```

Süre sabitleri: `JUNIOR_WARMUP_MAX_SEC = 10`, `JUNIOR_WARMUP_FAILSAFE_MS = 12_000`, `JUNIOR_WARMUP_FADE_MS = 500`.

### 1.3 Disk varlıkları (`public/media/junior/warmup/`)

| Dosya | Durum | Boyut (yaklaşık) |
|-------|--------|------------------|
| `jr_06_mat-warmup.mp4` | **Var** | ~4.8 MB |
| `jr_06_fen-warmup.mp4` | Var | ~5.4 MB |
| `jr_06_turkce-warmup.mp4` | Var | ~4.7 MB |
| `jr_06_sosyal-warmup.mp4` | Var | ~5.7 MB |
| `jr_06_ing_main-warmup.mp4` | Var | ~5.7 MB |

**Sonuç:** Matematik ısınma kaseti diskte duruyor. Görünmeme nedeni eksik MP4 değildir.

### 1.4 Oynatıcı zinciri — warmup nerede duruyor / nerede atlanıyor?

Sayfa hâlâ ısınma URL’sini iletir:

`page.tsx` → `LessonChain` → `ListenAndTell` → `VectorPlayer`  
(`grantedWarmupUrl={playback.warmupUrl}`, `lockPublicMedia=…`)

Ancak `VectorPlayer` içinde pilot dallanma **ısınma katmanını taşımadan** çıkar:

```556:570:components/junior/vector-player.tsx
export function VectorPlayer(props: VectorPlayerProps) {
  const playback = resolveJuniorPlayback(props.lessonKey ?? "");
  if (playback.engine === "pilot") {
    return (
      <JuniorPilotPlayer
        timeline={playback.timeline}
        grantedAudioUrl={props.grantedAudioUrl}
        fill={props.fill}
        onBindStop={props.onBindStop}
        onPlaybackComplete={props.onPlaybackComplete}
        onReadyToTell={props.onReadyToTell}
      />
    );
  }
  return <SealedVectorPlayer {...props} />;
}
```

| Motor | Warmup | Not |
|-------|--------|-----|
| `sealed` → `SealedVectorPlayer` | **Var** | `useJuniorWarmupGate` + `JuniorWarmupCassette`; narrasyon `orienting` iken kilitli |
| `pilot` → `JuniorPilotPlayer` (`jr_06_mat-5`) | **Yok** | `grantedWarmupUrl` / `lockPublicMedia` prop’ları bile iletilmiyor; doğrudan vektör sahne + PCM MP3 |

`JuniorPilotPlayer.tsx` içinde `JuniorWarmupCassette`, `useJuniorWarmupGate`, `warmup` veya `<video>` ısınma izi **yok**.

`resolveJuniorPlayback("jr_06_mat-5")` → `engine: "pilot"` (`lib/junior/pilot-engine/playback.ts` + `playback-key.ts`).

---

## ADIM 2 — Kök Neden ve Sync-Safe Geri Getirme

### 2.1 Kök neden (tek cümle)

**Isınma videosu ve varlık hazır; `jr_06_mat-5` pilot motoruna geçince `VectorPlayer` sealed sarmalayıcıyı (ve içindeki intro overlay’i) bypass edip doğrudan `JuniorPilotPlayer`’a düşüyor.**

Bu bilinçli bir “vektör sahneye doğrudan geçiş” tercihinin yan etkisi gibi duruyor: film seçimi `scene` alanından ayrıldı, grafik saat pilot’a alındı; warmup shell taşınmadı.

### 2.2 Olmayan / yanlış hipotezler

| Hipotez | Değerlendirme |
|---------|----------------|
| Koreografide `introUrl` unutuldu | Yanlış yüzey — warmup koreografi alanı değil |
| MP4 diskte yok | Yanlış — `jr_06_mat-warmup.mp4` mevcut |
| `juniorWarmupSrc` mat-5’i çözemiyor | Yanlış — slug `jr_06_mat` |
| `verify:junior-sync` ısınmayı kırıyor | Yanlış — kapı yalnız timeline ↔ PCM ses drift ölçer; warmup geçmez |

### 2.3 0 ms PCM senkronizasyonu ve `verify:junior-sync` ile uyumlu bağlama

**İlke:** Isınma, PCM saatine **ön-rulo (pre-roll)** olmalıdır; timeline `startMs = 0` narrasyonun ilk cümlesidir, ısınma bu saate eklenmez / ofset yazılmaz.

Önerilen geri getirme (ürün koduna henüz uygulanmadı):

1. **Koreografi / `jr_06_mat-5.timeline.json` dokunulmaz.** Warmup cue, word timing veya `durationMs` uzatılmaz.
2. **Shell, pilot’un dışında kalır** — sealed ile aynı kapı:
   - `useJuniorWarmupGate(lessonKey, startNarration, grantedWarmupUrl, lockPublicMedia)`
   - `JuniorWarmupCassette` overlay
3. **Bağlama noktası (tercih sırası):**
   - **A (düşük risk):** `VectorPlayer` pilot dalında `JuniorPilotPlayer`’ı warmup shell ile sarmak; `grantedWarmupUrl` + `lockPublicMedia` iletilir; narrasyon (`audio.play` / autoplay) yalnız `gate === "scene"` (veya gate `finish` → `startNarration`) sonrası.
   - **B:** Aynı gate’i `JuniorPilotPlayer` içine taşımak — prop yüzeyi genişler; A ile aynı semantik.
4. **Akustik sözleşme:**
   - Warmup videosunun kendi sesi varsa PCM MP3 ile **çakışmaz** (gate bitmeden narrasyon başlamaz).
   - Warmup bitişi / Atla / hata / failsafe → narrasyon **0 ms** timeline’dan başlar (mevcut sealed davranış: `finish()` → `startNarration()`).
5. **`verify:junior-sync`:** Değişmez. Script yalnız `packages/junior-content/timelines/jr_06_mat-5.timeline.json` + WAV/MP3 PCM drift’ine bakar; warmup dosyası kapıya girmez.
6. **Mühür:** `assertJuniorProductionSeal` zaten `juniorWarmupSrc` ister; asset ve harita durduğu sürece mühür kırılmaz. Pilot UI’ye bağlamak mühür gap’i açmaz.

### 2.4 Bilinçli olarak yapılmaması gerekenler

- Timeline’a 8–10 sn “intro cue” eklemek (PCM p90 drift ve `verify:junior-sync` kırılır).
- Koreografiye `introUrl` alanı icat edip fırın / word-align zincirine bağlamak.
- Warmup süresini `audio.durationMs` içine katmak.

---

## SUPER_ADMIN özeti

| Madde | Durum |
|-------|--------|
| Isınma MP4 | Diskte var (`jr_06_mat-warmup.mp4`) |
| Harita / mühür | `lib/junior/warmup.ts` + production-seal `warmup` kapısı hazır |
| Koreografi | Intro video alanı yok (beklenen; ayrı katman) |
| Neden görünmüyor? | Pilot dal bypass: `VectorPlayer` → `JuniorPilotPlayer` warmup’suz |
| Sync etkisi | Geri getirme pre-roll shell ile yapılırsa `verify:junior-sync` bozulmaz |
| Bu denetimde kod değişikliği | **Yok** (sıfır risk) |

**Önerilen sonraki adım (onay sonrası):** Pilot dalına sealed ile aynı `useJuniorWarmupGate` + `JuniorWarmupCassette` shell’ini bağla; timeline / choreography / PCM kapısına dokunma.
