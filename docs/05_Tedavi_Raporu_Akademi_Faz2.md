# 05 — TEDAVİ RAPORU: AKADEMİ FAZ 2 OYNATICI İSKELETİ

| Alan | Değer |
|------|--------|
| Görev | GÖREV 05 — Faz 2 oynatıcı iskeleti (import kesimi, henüz `rm` yok) |
| Tarih | 28 Ağustos 2026 |
| Rol | Baş mimar (Cursor / Grok) — Super Admin’e, CEO kontrolünde |
| Kaynak | `docs/03_Tespit_Raporu_Akademi_MVP.md`, `docs/04_Tedavi_Raporu_Akademi_Faz1.md` (açık uç 1, 4, 5) |
| Ürün kodu | Değiştirildi — Faz 2.1–2.3. Toptan `rm` yok. Prisma yok |
| PayTR | Pasif kabul duruyor. Bu PR nakit açmaz |

Faz 1 dinle bayrağını indirdi, lab/tartışmayı oynatıcıdan kesti, Antre CTA’sını sadeleştirdi. İstemci tanrısı ve `curriculum.ts` fabrika grafı duruyordu. Bu PR o grafı keser; dosyaları yerinde bırakır.

---

# 1. YAPILAN TEDAVİ

## 1.1 Oynatıcıyı incelt (Açık uç 4)

**Nereye:** `components/academy/curriculum-player.tsx`, `components/academy/lesson-media-player.tsx`.

Kesilen istemci ağırlığı:

| Kesit | Ne gitti |
|-------|----------|
| Transcript senkron | `useAcademyTranscriptSync`, cue işaretleri, `window.scrollTo` takip |
| Dinle state | `listenPlayback`, `onPlaybackChange`, `issueAudio`, `LessonListenButton` (bayrak kapalıyken bile import duruyordu) |
| Lab | `LESSON_PRACTICE`, `pickAcademyLabSource`, `codeSource`, `data-academy-player-layout="lab"` |
| Ölü blok UI | `DiagramCard` / `LessonParamBox` / `LessonStepsCard` (tanımlı, JSX’te yoktu) |

`LessonMediaPlayer` prop’ları: `assetKey`, `videoTitle`, `durationSec`. Play/pause, süre ve video kaynağı (HTML5/HLS veya bake yoksa canvas + poster). Ses/tam ekran/altyazı düğmeleri yerel krom; dinle motoruna bağlı değil.

Satır: `CurriculumPlayer` 562 → 310; `LessonMediaPlayer` 597 → 419. Tespit «~200» bir pusulaydı; kalan kütle oynatma listesi + tamamla POST + sinema iskeleti. Lab/dinle/transcript state yok.

SETTLED kullanıcı sıradaki açık derste «tamamla» ile geçer. Ders atlama yasağı durur. Müfredat bitince «Sınava geç» CTA’sı durur (Açık uç 5 — Antre `ExamStartGate` kırılmadı).

## 1.2 Müfredat temizliği (Faz 2.1)

**Nereye:** `lib/academy/curriculum.ts`.

Gövde yalnız `curricula/*.ts` taslağından (intro / development / conclusion). Alıştırma çiti fabrika `challenge` değil, taslaktaki `Vaka:` satırı. Video yuvası `LESSON_VISUALS` + `growth-visuals` (statik `/media/academy` path; üretim API’si yok).

Kesilen import’lar (dosyalar duruyor):

- `@/lib/academy/real-world-pedagogy`
- `@/lib/academy/field-voice`
- `@/lib/academy/sealed-diagrams`

`composePedagogicalLessonBody` durur: dört bölüm başlığı ve pratik çiti taslaktan örülür; ısınma hikâyesi ve pusula cümlesi gövdeye **basılmaz.** `instructors.ts` / `moderator-bridge.ts` hâlâ `field-voice` okur — canlı oynatıcı grafı değil; Faz 3 izolasyon işi.

## 1.3 Prisma / sınav — dokunulmadı

`AcademyLessonCompletion.proofOfWorkHash` kolonu durur. Oynatıcı POST gövdesi yalnız `{ lessonKey }`. Motor Faz 1’deki gibi kanonik özeti **arka planda** basar; UI kilidi yok. DROP yok (Açık uç 3 / Faz 5).

Sınav motoru, `AcademyExam*` / `AcademyCertificate` tabloları, `ExamStartGate` — aynı.

---

# 2. TESTLERİN KIRILMAMASI — İZLENEN YOL

Tespit Adım B + Faz 1 açık uç 1: surface `toContain` anayasa değildir. Import kesildiği *anda* aynı PR’da iğne kayar. Yeni `verify:*` yok.

| Risk | Ne yaptık |
|------|-----------|
| `curriculum-player-surface` `DiagramCard` / `LessonParamBox` / `useAcademyTranscriptSync` / `setListenPlayback` / `layout="lab"` / `lessonBody=` / `variant="cinema"` | `toContain` → `not.toContain`. Layout iğnesi `"player"`. Fabrika iğnesi **import yolu:** `not.toContain("@/lib/academy/real-world-pedagogy")` (yorum satırındaki isim yalan yeşil üretmesin). |
| `citizen-surface` `composeAcademyLessonBlocks` / lab kartları | Aynı kaydırma. `LessonMediaPlayer` + `completeLesson` durur. |
| `lesson-media-surface` oynatıcıda şema/parametre kartı | Oynatıcı iğnesi `not.toContain`. **Davranış** durur: 48 derste mühürlü şema anahtarı + mikro-video yuvası + pratik çiti (`curriculumForCourseSlug` + fabrika dosyası yerinde). |
| `curriculum-content` 03.28 pusula gövdede | Davranış kaydı: gövde `ACADEMY_COMPASS_ANCHOR` **taşımaz**; iğne `field-voice.ts` dosyasında durur. 03.16 dört bölüm + `Vaka:` + `\`\`\`alistirma` yeşil — taslak yeter. |
| `listen-fallback` 3:30–4:20 bant | Isınma/pusula kesilince python-temel-1 okuma ~204 sn. Alt sınır 3:00’e kaydı; 10:07 kaset yasağı ve üst bant durur. Dinle fabrikası `rm` edilmedi (Açık uç 2). |
| `proof-of-work.test.ts` (nightly `verify:academy-pedagogy-seals`) | Dokunulmadı. Boş gövde → kanonik hash. |
| `listen-audio-cache` / `listen-soft-fallback` | `vi.mock(ENABLED=true)` durur. Canlı oynatıcı bu motoru import etmez. |

`npm test` surface’i hariç tutar. Nightly `test:surface` bu PR’ın kaydırılmış iğnelerini görür; `curriculum-player-surface.test.ts` `verify:atomic-seals` zorunlu listesinde — dosya silinmedi.

Çalıştırılan yeşil dilim (28 Ağustos 2026): `tests/academy` **47 dosya / 224 test**, içinde altı akademi surface + `verify:academy-pedagogy-seals` üçlüsü. Canlı tarayıcı oturumu bu ortamda yoktu; oynatıcı iskeleti surface + davranış (SETTLED → tamamla, 48 ders tohumu, PoW hash yazımı) ile kilitlendi.

---

# 3. BİLİNÇLİ OLARAK YAPILMAYANLAR

- `rm` / `archived/` taşıma (Faz 3).
- `AcademyExam*` / `AcademyCertificate` / `proofOfWorkHash` DROP.
- Sınav API, `ExamStartGate`, kariyer vize 403.
- `instructors.ts` / `moderator-bridge.ts` `field-voice` bağı (oynatıcı grafı değil).
- TTS dosyaları, `lesson-listen-button.tsx`, `sealed-diagrams.ts` — yerinde.
- Dron / IAP / sahte CREDIT / 5. SKU.
- Yeni `verify:*` betiği.

---

# 4. SEN OLSAYDIN NE YAPARDIN?

Faz 2’yi bu şekilde **yaparım.** Yapmamak, Faz 1 sönümlemesini «UI gizlendi, tanrı şişman» halinde bırakmaktır.

### Faz 3’e geçerken: `rm` yerine `archived/` — doğru strateji mi?

**Evet — ama kör taşıma değil; graf ile birlikte.** `rm` bu noktada yanlış. Neden:

1. **Import grafı sıfır değil.** Oynatıcı ve `curriculum.ts` kesti. `instructors.ts` ve `moderator-bridge.ts` hâlâ `field-voice` okur. `scripts/render-academy-lesson-media.ts` hâlâ `sealed-diagrams` basar. Önce bu canlı bağları kesmeden `rm` = derleme kırığı.

2. **Surface `existsSync` ve dosya-iğnesi duruyor.** `curriculum-player-surface` dinle düğmesi, `lesson-code-lab.tsx`, `field-voice.ts` `ACADEMY_COMPASS_ANCHOR` için **dosyanın varlığını** ister. Fabrikayı silip iğneyi kaydırmadan nightly `test:surface` kırmızıya döner — Faz 1 açık uç 1’in aynısı, bir kova derinde.

3. **Hayalet yeşil dinle testleri.** `listen-audio-cache` / `listen-soft-fallback` `vi.mock(ENABLED=true)` ile `lesson-listen-engine` yolunu yutar. Dosyayı `rm` edip mock’u canlı yolda bırakmak = import kırığı veya sahte yeşil. Faz 1 açık uç 2: fabrikayı taşırken bu iki dosyayı **beraber** taşı veya 410 sözleşmesine indir.

4. **Studio kalıbı zaten `archived/` + kenar 410.** Akademi ikinci bir stüdyoyu karnına gömmüştü; aynı tahliye kapısı tutarlıdır. Git tarihi `git mv` ile okunur; `rm` arkeoloji ister.

5. **`rm` ikinci dalgadır, birinci değil.** Tespit kovası: DONDUR → İZOLE → SİL. İzolasyon, «kimse import etmiyor» kanıtı toplar (yazma 0, nightly isim vermiyor). O kanıt yokken silmek revert’i felaket yapar.

**Yapmam:** `archived/` altına alıp canlı `lib/academy` import’unu unutmak. O zaman arşiv bir ikinci mezarlıktır ve CI hâlâ eski yolu yeşil boyar.

Faz 3 sıra (tek PR değil, her adım yeşil):

1. Kalan canlı import’u kes (`instructors` pusulası, render betiği, moderator-bridge) — veya bu dosyaları arşiv grafına kat.
2. `git mv` → `archived/lib/academy-studio/` (pedagoji sözlükleri, TTS, diyagram fabrikası, lab, discussion/reviews).
3. Aynı PR’da `existsSync` / `toContain` iğnesini yeni yola veya «oynatıcı import etmez» davranışına kaydır; dinle testlerini 410’a indir veya arşivle **beraber** taşı.
4. Kenar 410 envanteri: listen, generateSpeech, discussion, reviews, pdf — zaten kısmen 410; tutarlı hale getir.
5. `rm` ancak nightly o yolları **adıyla anmayınca** ve `verify:academy-pedagogy-seals` ya davranışa inmiş ya nightly’den çıkmışsa (Faz 4; prebuild’e alma).

Nakit hâlâ idari (PayTR merchant). Bu tedavi onu açmaz.

---

# 5. SİCİL

**Kesildi (canlı oynatıcı / müfredat grafı)**

- `curriculum.ts` → `real-world-pedagogy` / `field-voice` / `sealed-diagrams`.
- Oynatıcı → transcript senkron, dinle playback, lab `codeSource`, dinle düğmesi import’u, diyagram tuval fabrikası.
- Pusula cümlesi ders gövdesine basılmaz.

**Duruyor (bilinçli)**

- Fabrika **dosyaları** (`real-world-pedagogy.ts`, `field-voice.ts`, `sealed-diagrams.ts`, TTS, lab, discussion).
- Sınav motoru, belge, vize 403, `ExamStartGate`.
- PoW kolonu + kanonik hash yazımı (UI kilidi yok).
- `lesson-audios` sözleşme istisnası (yazma kapalı; bayrak false).
- Dron `academy-purchase` 403 üçlüsü.
- `LESSON_VISUALS` / `LESSON_PRACTICE` tohumu — video yuvası ve gövde çiti; oynatıcı lab değil.

**Yapılmadı (doğru)**

Çekim, sahte CREDIT, IAP, native akademi, şema DROP, fabrika `rm`, yeni verify betiği.

---

*Bu rapor `/docs` günlük alanındadır. Kalıcı kırmızı çizgi `.system_docs/ANAYASA.md`. Çelişkide Anayasa bağlayıcıdır; Anayasa ile disk çelişirse disk yazılır. GÖREV 05 disk icrasıdır; Faz 3 CEO/Super Admin onayıyla izolasyon/arşivlemeye geçer.*
