# TEDAVİ RAPORU — Junior Isınma / Intro Video (Warmup Cassette)

**Tarih:** 2026-10-18  
**Karar sahibi:** CEO + SUPER_ADMIN  
**Dayanak:** `docs/TESPIT_RAPORU_INTRO_VIDEO.md` (onaylı)  
**Kapsam:** `jr_06_mat-5` pilot dalına pre-roll ısınma kaseti geri bağlama  
**Durum:** Tedavi uygulandı; akustik kapı yeşil.

---

## Özet

Pilot motor (`JuniorPilotPlayer`) ısınma shell’ini bypass ediyordu. Sealed ile aynı `useJuniorWarmupGate` + `JuniorWarmupCassette` katmanı `VectorPlayer` pilot dalına **pre-roll shell** olarak bağlandı. Timeline / koreografi / PCM ofsetine dokunulmadı.

---

## ADIM 1 — Pilot sarmalayıcısına ısınma kaseti

### Yapılanlar

| Dosya | Değişiklik |
|-------|------------|
| `components/junior/vector-player.tsx` | `PilotPlayerWithWarmupShell`: `useJuniorWarmupGate` + `JuniorWarmupCassette`; `grantedWarmupUrl` / `lockPublicMedia` iletilir |
| `components/junior/pilot-player/JuniorPilotPlayer.tsx` | `narrationHold`, `controlsLocked`, `onBindStartNarration` — kaset bitene kadar PCM kilit; finish → `seekToMs(0, { force: true })` + play |
| `tests/kernel/junior-player-clock.test.ts` | Pilot shell yüzey sözleşmesi eklendi |

### Bağlama noktası (rapor seçenek A)

```
page → LessonChain → ListenAndTell → VectorPlayer
  └─ engine === "pilot" → PilotPlayerWithWarmupShell
       ├─ JuniorPilotPlayer (narrationHold / controlsLocked)
       └─ JuniorWarmupCassette (gate !== "scene")
```

Prop zinciri: `grantedWarmupUrl` + `lockPublicMedia` artık pilot dalına ulaşır.

---

## ADIM 2 — Pre-roll ve akustik senkron koruması

### Dokunulmayan yüzeyler (bilinçli)

- `lib/junior/pilot-engine/mat-5.choreography.ts` — ofset / introUrl yok
- `packages/junior-content/timelines/jr_06_mat-5.timeline.json` — cue / durationMs değişmedi
- PCM MP3 / WAV hizası — warmup süresi timeline’a eklenmedi

### Sözleşme

| An | Davranış |
|----|----------|
| `gate === "cassette"` | Video oynar; anlatıcı `audio` pause + `currentTime = 0`; kontroller kilitli |
| Atla / ended / error / failsafe | `finish()` → `startNarration()` → timeline **0 ms** |
| `gate === "fade"` → `"scene"` | Overlay solar; Bilye Sahnesi + PCM anlatı akar |

Isınma, PCM saatine **ön-rulo**dır; `startMs = 0` narrasyonun ilk cümlesi olarak kalır.

---

## ADIM 3 — Doğrulama

### Tarayıcı (`http://localhost:3000/junior/ders/jr_06_mat-5`)

| Kontrol | Sonuç |
|---------|--------|
| Ders başında ısınma MP4 | Evet — `data-junior-warmup-src="/media/junior/warmup/jr_06_mat-warmup.mp4"` |
| Kaset sırasında PCM | `audioPaused: true`, `audioTime: 0` |
| «Atla» sonrası sahne | `gate: "scene"`, başlık «Bölünebilme Dedektifleri / 12 Bilye Deneyi», Sahne 1/12 |
| Anlatı başlangıcı | Saat bandı ~`0:01` / 3:32 (0 ms timeline; ölçüm gecikmesi < 1 sn) |
| Shell işareti | `data-junior-pilot-warmup-shell` mevcut |

### `npm run verify:junior-sync`

```
jr_06_mat-5 … medyan=0ms p90=0ms en fazla=0ms
verify:junior-sync OK
```

### Yüzey testi

`npx vitest run tests/kernel/junior-player-clock.test.ts -t "kontrol çubuğu"` → geçti (pilot shell assert’leri dahil).

---

## SUPER_ADMIN özeti

| Madde | Durum |
|-------|--------|
| Kök neden tedavisi | Pilot bypass → pre-roll shell bağlandı |
| Timeline / choreo / PCM | Dokunulmadı |
| `verify:junior-sync` | Yeşil (p90 = 0 ms) |
| Canlı ders doğrulama | Isınma + Atla → Bilye Sahnesi 0:00 |
| Risk | Düşük — sealed ile aynı gate/cassette API |

**Sonuç:** Isınma kaseti pilot derste yeniden görünür; akustik senkron kapısı kırılmadan korundu.
