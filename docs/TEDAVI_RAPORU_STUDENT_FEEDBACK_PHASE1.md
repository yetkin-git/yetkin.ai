# Tedavi Raporu — 6. Sınıf Öğrenci Geri Bildirimi (Faz 1)

**Tarih:** 2026-10-18  
**Hedef ekran:** `/junior/ders/jr_06_mat-5` · Hızlı araçlar sağ paneli  
**Kaynak:** Gerçek 6. sınıf kullanıcı geri bildirimi  
**Durum:** TEDAVİ EDİLDİ — SUPER_ADMIN bilgilendirmesi  
**Risk ilkesi:** Sıfır risk (fırın betiği + UI; canlı Gemini yeniden fırını bu fazda tetiklenmedi)

---

## Özet

| Adım | Konu | Sonuç |
|------|------|--------|
| 1 | TTS konuşma hızı %94 (`0.94`) | Pilot fırın yolu `JUNIOR_BAKE_ATEMPO` ile kilitlendi; PCM → MP3 kilidi teyit |
| 2 | `% Kaç Bitirdim?` ilerleme çubuğu | Sağ panel + ders kartları; LocalStorage canlı güncelleme |
| 3 | Doğrulama + rapor | Bu belge; SUPER_ADMIN'e haber |

---

## ADIM 1 — TTS tempo %94

### Teşhis

- Katalog fırını zaten `JUNIOR_BAKE_ATEMPO = 0.94` kullanıyordu (`lib/junior/voice.ts`).
- Pilot yolu (`bakePilotV2Lesson` / `jr_06_mat-5`) doğal tempo (`atempo: false` → 1.00) ile mastering yapıyordu.
- Timeline metadata `teacher.atempo: 1` idi; öğrenci ritmi katalogla uyumsuzdu.

### Tedavi

1. **`scripts/bake-junior-pilot-tts.ts`**
   - Pilot mastering: `masterAcademySpeechWav(..., { atempo: true, tempo: JUNIOR_BAKE_ATEMPO })`.
   - Dry-run / spend fişi tempo alanı: her zaman `JUNIOR_BAKE_ATEMPO` (pilot için `1` ayrımı kaldırıldı).
   - Akış kilidi:
     1. `alignSingleWavToMat5Cues` — ham WAV üzerinde PCM vadi hizası  
     2. WSOLA `atempo=0.94` — tüm dosyaya eşit oran  
     3. `lockTimelineToExactAudioMs` — final MP3 milisaniyesine orantılı kilitleme  

2. **Şema / taslak**
   - `lib/junior/pilot-engine/mat-5.choreography.ts` → `atempo: JUNIOR_BAKE_ATEMPO`
   - `lib/junior/pilot-engine/graph-clock.ts` → aynı
   - `packages/junior-content/timelines/jr_06_mat-5.timeline.json` → `"atempo": 0.94`

3. **Test**
   - `tests/kernel/junior-pilot-v2-engine.test.ts` → `teacher.atempo === 0.94`

### Operasyon notu (SUPER_ADMIN)

Yayındaki `jr_06_mat-5.mp3` dosyası hâlâ önceki doğal-tempo fırınıdır. %94 sesin dinleyiciye yansıması için kontrollü yeniden fırın gerekir:

```bash
npx tsx scripts/bake-junior-pilot-tts.ts --dry-run --lesson=jr_06_mat-5 --force
npx tsx scripts/bake-junior-pilot-tts.ts --confirm-gemini-spend --lesson=jr_06_mat-5 --force
```

Kod yolu ve fiş kilidi hazır; Gemini harcaması bu fazın dışında bırakıldı.

---

## ADIM 2 — Ders ilerleme yüzdesi (`% Kaç Bitirdim?`)

### Teşhis

- Sağ panelde yalnız «Puan durumu / rozet» vardı; sahne bazlı tamamlanma oranı yoktu.
- Micro-progress LocalStorage izi sealed oyuncuda vardı; pilot CinemaEngine v2 cue izlemiyordu.

### Tedavi

| Dosya | Değişiklik |
|-------|------------|
| `lib/junior/micro-progress.ts` | `microCompletionPercent`, `mergeWatchedScenes`, `JUNIOR_MICRO_PROGRESS_EVENT` |
| `components/junior/lesson-completion-bar.tsx` | `% Kaç Bitirdim?` çubuğu + canlı hook |
| `components/junior/pilot-player/JuniorPilotPlayer.tsx` | Bitmiş cue indekslerini bildirir |
| `components/junior/vector-player.tsx` | Pilot shell → LocalStorage yazar |
| `components/junior/activity-studio.tsx` | Hızlı araçlar: puan/rozet yanında ilerleme |
| `components/junior/lesson-chain.tsx` | `profileId` + cue sayısı aktarımı |
| `components/junior/visual-course-cards.tsx` | Ders kartında kompakt yüzde |
| `components/junior/course-shelf.tsx` | `profileId` kartlara geçer |

### Hesap

`yüzde = round(izlenen_sahne_sayısı / toplam_sahne × 100)`  
Pilot: 12 cue. Sealed: `JUNIOR_VECTOR_STEP_COUNT` (12). Anahtar: `yetkin.junior.micro.v1:{profil}:{ders}`.

---

## ADIM 3 — Doğrulama

**Canlı sayfa (2026-10-18):** `http://localhost:3000/junior/ders/jr_06_mat-5`

| Kontrol | Sonuç |
|---------|--------|
| `[data-junior-lesson-completion]` DOM’da | **var** |
| Puan/rozet kutusundan hemen sonra | **evet** (`badgeBeforeBar`) |
| Başlangıç yüzdesi | `0%` / `aria-label="Ders ilerleme 0 yüzde"` |
| Dock metin sırası | `0 / 3` → rozet → `0%` → araç sekmeleri |
| Birim testleri | `junior-micro-lesson`, `junior-pilot-v2-engine`, `junior-lesson-chain` — **25/25 geçti** |

xl ve üzeri viewport’ta «% Kaç Bitirdim?» etiketi tam görünür; dar ekranda puan paneliyle aynı kompakt örüntü (`0%`).

---

## SUPER_ADMIN özeti

Faz 1 tamam: konuşma temposu fırın kodunda %94’e sabitlendi; öğrenciye «kaç bitirdim» çubuğu eklendi. Canlı MP3’ün de %94’e çekilmesi için yukarıdaki pilot fırın komutu onayınızı bekliyor.
