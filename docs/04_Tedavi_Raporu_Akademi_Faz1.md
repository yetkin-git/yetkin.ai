# 04 — TEDAVİ RAPORU: AKADEMİ FAZ 1 SÖNÜMLEME

| Alan | Değer |
|------|--------|
| Görev | GÖREV 04 — Tespit sonrası Faz 1 sönümleme (dondurma ve izolasyon) |
| Tarih | 28 Ağustos 2026 |
| Rol | Baş mimar (Cursor / Grok) — Super Admin’e, CEO kontrolünde |
| Kaynak | `docs/03_Tespit_Raporu_Akademi_MVP.md` (onaylı) |
| Ürün kodu | Değiştirildi — yalnız Faz 1.1–1.4. Toptan `rm` yok |
| PayTR | Pasif kabul duruyor. Bu PR nakit açmaz |

Tespit raporundaki Faz 1 dört müdahale olarak uygulandı. Dosya silinmedi. Pedagoji fabrikası, TTS motoru, sınav/belge tabloları, PoW SHA-256 sicili yerinde; import ve CTA kesildi, bayrak indirildi.

---

# 1. YAPILAN TEDAVİ

## 1.1 Dinlemeyi kapat

**Nereye:** `lib/academy/lesson-listen.ts`, `lib/academy/lesson-listen-engine.ts`, `app/api/academy/generateSpeech/route.ts`, `app/api/academy/courses/[id]/listen/route.ts`, `components/academy/lesson-media-player.tsx`.

`ACADEMY_LESSON_LISTEN_ENABLED = false`. Vatandaş yüzünde `LessonListenButton` çizilmez. İki TTS rotası bayrak kapalıyken **410** (`Dersi dinle kapalı.`) basar; motor `GoneError` fırlatır. Oynatıcı metin + HTML5/canvas video yolunda kalır.

GÖREV 02’nin `lesson-audios` sözleşmesi durur. Bayrak kapalı olduğu için `prepareAcademyLessonListen` üretimde çağrılmaz; **yeni byte yazılmaz.** Fabrika `rm` edilmedi.

## 1.2 Kasayı / vitrini sadeleştir

**Nereye:** `components/academy/purchase-button.tsx`, `app/academy/[slug]/page.tsx`. Motor: `lib/academy/purchase-path.ts` (dokunulmadı, sicil duruyor).

Satın alma kartı `academyCardOfferPaths()` içinden `path !== "exam"` süzerek **tek CTA** basar: eğitimi al. `examHref` / `?gate=exam` satın alma gövdesinden kalktı. `ACADEMY_CARD_OFFER_PATHS` hâlâ iki satır taşır; şema `path: "exam"` kabul eder; sınav motoru ve `ExamStartGate` (kayıtlı, müfredatı bitirmiş aday) dondurulmuş durur.

## 1.3 Oynatıcıyı incelt

**Nereye:** `components/academy/curriculum-player.tsx`, `app/academy/[slug]/oyna/page.tsx`, `lib/academy/curriculum-engine.ts`, `lib/academy/schemas.ts`.

`LessonCodeLab` ve `LessonDiscussion` oynatıcıdan **import kesildi** (dosyalar duruyor). Tamamlama POST’u yalnız `{ lessonKey }` gönderir. `completeAcademyLessonInputSchema.proof` isteğe bağlıdır. Gövde boşsa motor **kanonik iş kanıtını** basar — UI kilidi yok, SHA-256 sicili yazılmaya devam eder (Faz 5 DROP değil).

SETTLED kullanıcı sıradaki açık derste «tamamla» ile geçer. Ders atlama yasağı durur.

## 1.4 Antre’yi temizle

**Nereye:** `app/academy/[slug]/page.tsx`.

Düşürülen UI: `AcademyPdfDownloadButton`, `ProofOfWorkCard`, `AcademyProgressionBridge`, satın alma `examHref`. `FilterBar` Antre’de zaten yoktu; yüzey testine «Antre FilterBar import etmez» iğnesi eklendi ki geri gelmesin.

Kalan kasa iskeleti: fiyat (`CourseHeroActions`), tek satın al, oyna kapısı (`/oyna`, continue şeridi). Müfredat özeti / pilot şeridi vitrin bağlamı olarak durur. Sınav kapısı motoru silinmedi.

---

# 2. TESTLERİN KIRILMAMASI — İZLENEN YOL

Tespit Adım A.4: surface `toContain` anayasa değildir; yeni iğne yığını eklenmedi. Davranış (SETTLED → oyna, dinle kapalı) yeşil tutuldu.

| Risk | Ne yaptık |
|------|-----------|
| `curriculum-player-surface` `LISTEN_ENABLED = true` | İğne `= false` olacak şekilde **kaydırıldı** (silinmedi). |
| Aynı dosya `LessonCodeLab` / `LessonDiscussion` / `academyCanonicalProofSubmission` / `AcademyProgressionBridge` | `toContain` → `not.toContain`. Bileşen dosyaları (`lesson-code-lab.tsx`, `lesson-discussion.tsx`, `proof-of-work.ts`) durduğu için onların iğneleri **kaldı**. |
| `citizen-surface` / `lesson-media-surface` oynatıcıda lab | Aynı kaydırma. |
| `course-seed-surface` `examHref` / `gate=exam` | Satın alma CTA’sı gitti; `not.toContain("examHref")` ve `not.toContain("?gate=exam")`. `purchase-path.ts` exam cümlesi duruyor. |
| `proof-of-work.test.ts` (nightly `verify:academy-pedagogy-seals`) | Şema artık proof’suz geçer. «İş kanıtı olmadan ders kapanmaz» → SETTLED + boş gövde kapanır, kanonik hash basılır. Motor testleri (48 ders tohumu, yanlış kilit düşer) **aynı**. |
| `listen-audio-cache` / `listen-soft-fallback` | Üretim bayrağı `false` bu dosyaları kırmızıya boyardı. `vi.mock` ile **yalnız bu iki dosyada** bayrak `true` — donmuş fabrikanın regresyonu durur; üretim 410 ayrı davranış testinde. |
| `curriculum-player.test.ts` | Yeni davranış: `ACADEMY_LESSON_LISTEN_ENABLED === false` ve `prepareAcademyLessonListen` → `GoneError`. Sıra atlama hâlâ `ForbiddenError`. |

`npm test` surface’i hariç tutar. Nightly `test:surface` + `verify:academy-pedagogy-seals` bu PR’ın kaydırılmış iğnelerini ve PoW davranışını görür.

Çalıştırılan yeşil dilim (28 Ağustos 2026): `tests/academy` davranış (211 test) + altı akademi surface dosyası (13 test). Canlı tarayıcı oturumu bu ortamda yoktu; UI gizleme surface + davranış ile kilitlendi.

---

# 3. BİLİNÇLİ OLARAK YAPILMAYANLAR

- `rm` / `archived/` taşıma (Faz 3).
- `AcademyExam*` / `AcademyCertificate` / `proofOfWorkHash` DROP.
- `curriculum.ts` pedagoji fabrikası import kesimi (Faz 2.1).
- `LessonMediaPlayer` diyagram fabrikası sökümü (Faz 2.2).
- Sınav API, `ExamStartGate`, kariyer vize 403.
- Dron / IAP / sahte CREDIT / 5. SKU.
- Yeni `verify:*` betiği.

---

# 4. SEN OLSAYDIN NE YAPARDIN?

Faz 1’i bu şekilde **yaparım.** Yapmamak, onaylı tespit haritasını rafa kaldırmaktır.

Faz 2’ye (oynatıcı iskeleti) geçerken bu sönümlemenin bıraktığı açık uçlar **vardır.** Kör `rm` veya «oynatıcıyı 200 satıra indir» mega-PR’ı nightly’yi kırmızıya boyar. Çözüm: her kesitte aynı PR içinde iğneyi kaydır.

### Açık uç 1 — Surface iğnesi hâlâ fabrikayı tutuyor (en büyük CI riski)

`curriculum-player-surface.test.ts` hâlâ `lesson-listen-button.tsx`, `lesson-code-lab.tsx`, `lesson-discussion.tsx`, `LESSON_VISUALS` / `LESSON_PRACTICE` (`curriculum.ts`), `sealed-diagrams`, `real-world-pedagogy` grafına `toContain` basar. Faz 2.1 `curriculum.ts` fabrikayı bırakınca, Faz 2.2 `LessonMediaPlayer` dinle/diyagram import’unu kesince **aynı test dosyası** kırmızı olur — ürün kodu doğru olsa bile.

**Faz 2 çözümü:** Import kesmeden *hemen önce* (veya aynı commit’te) o kesitin `toContain` iğnelerini `not.toContain` / dosya-varlık / davranış testine kaydır. Tespit Faz 4’ü «sonra» bırakırsan Faz 2 yeşil bitmez. Yeni `verify:*` yok.

### Açık uç 2 — Dinle testleri `vi.mock(ENABLED=true)` ile yaşıyor

`listen-audio-cache` ve `listen-soft-fallback` üretim bayrağını yutar. Faz 3 fabrikayı `archived/` altına alınca bu mock’lu import yolları kırılır (`lesson-listen-engine` taşınır).

**Faz 2–3 çözümü:** Fabrika taşınırken bu iki dosyayı **beraber** taşı veya 410 sözleşmesine indir (`prepare` → `GoneError`, rota 410). Mock’u `true` bırakıp arşivi unutmak = hayalet yeşil.

### Açık uç 3 — PoW hash hâlâ yazılıyor

UI kilidi kalktı; `completeAcademyLesson` kanonik özet basıyor. `verify:academy-pedagogy-seals` → `proof-of-work.test.ts` bunu bekler. Faz 2 oynatıcı iskeleti bu kolonu **DROP etmesin.** DROP = nightly mühür kırmızı + `assertAcademyLessonCompletions` körlüğü. Kolon Faz 5, yazma 0 kanıtından sonra.

### Açık uç 4 — Oynatıcı hâlâ «lab» iskeleti ve dinle senkron state

`data-academy-player-layout="lab"`, `labSource` / `LESSON_PRACTICE` cinema `codeSource`, `listenPlayback` state, `issueAudio` — UI’da lab/dinle yok ama istemci tanrısı şişman. Faz 2.3 (~200 satır) bunları kesince surface’deki `onPlaybackChange={setListenPlayback}` ve `data-academy-player-layout="lab"` iğneleri düşman olur.

**Faz 2 çözümü:** İskeleti keserken iğneyi kaydır; `LessonMediaPlayer` prop’larını play/pause + süre + varsa bake MP4’e indir. Transcript senkronu dinle kapalıyken ölü ağırlıktır — aynı PR’da çıkmazsa satır hedefi tutulmaz.

### Açık uç 5 — Antre’de sınav kapısı hâlâ var

Satın alma `path=exam` yok. `ExamStartGate` + continue «Sınava geç» kayıtlı bitirici için duruyor (motor donduruldu, silinmedi). Faz 2 oynatıcı iskeleti bunu kırmak zorunda değil. Kırarsan `citizen-surface` / `course-seed-surface` `ExamStartGate` iğnesi kırmızıya döner — aynı kaydırma kuralı.

**Yapmam:** Faz 2’de `curriculum.ts` + `LessonMediaPlayer` + surface iğnesini üç ayrı gecikmiş PR’da kesmek. Tespit sırası zorunlu: önce oynatıcı import, sonra `curriculum.ts` fabrika, her adımda o kesitin testi yeşil.

Nakit hâlâ idari (PayTR merchant). Bu tedavi onu açmaz.

---

# 5. SİCİL

**Kesildi (UI / yazma / CTA)**

- Dinle bayrağı ve TTS HTTP yüzeyi (410).
- Satın alma kartında doğrudan sınav CTA.
- Oynatıcıda kod lab, tartışma, PoW zorunlu gövde.
- Antre’de PDF, iş kanıtı kartı, ilerleme köprüsü.

**Duruyor (bilinçli)**

- TTS / lab / tartışma / PDF / PoW **dosyaları**.
- Sınav motoru, belge, vize 403, `purchase-path` exam sicili.
- `lesson-audios` sözleşme istisnası (yazma kapalı).
- Dron `academy-purchase` 403 üçlüsü.

**Yapılmadı (doğru)**

Çekim, sahte CREDIT, IAP, native akademi, şema DROP, fabrika `rm`, yeni verify betiği.

---

*Bu rapor `/docs` günlük alanındadır. Kalıcı kırmızı çizgi `.system_docs/ANAYASA.md`. Çelişkide Anayasa bağlayıcıdır; Anayasa ile disk çelişirse disk yazılır. GÖREV 04 disk icrasıdır; Faz 2 CEO/Super Admin onayıyla oynatıcı iskeletine geçer.*
