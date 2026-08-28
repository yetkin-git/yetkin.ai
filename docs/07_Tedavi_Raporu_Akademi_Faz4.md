# 07 — TEDAVİ RAPORU: AKADEMİ FAZ 4 TEST VERGİSİ VE NIGHTLY SADELEŞTİRMESİ

| Alan | Değer |
|------|--------|
| Görev | GÖREV 07 — Faz 4 test budaması, nightly mühür sadeleştirmesi, katalog okuma kesimi |
| Tarih | 28 Ağustos 2026 |
| Rol | Baş mimar (Cursor / Grok) — Super Admin’e, CEO kontrolünde |
| Kaynak | `docs/03_Tespit_Raporu_Akademi_MVP.md`, `docs/06_Tedavi_Raporu_Akademi_Faz3.md` (Faz 4 sıra; DROP = Faz 5, nakit sonrası) |
| Ürün kodu | Değiştirildi — surface budandı, nightly mühür boş davranışa indi, `filter-bar` silindi, katalog sıra yardımcısına indi. Prisma **DROP yok** |
| PayTR | Pasif kabul duruyor. Bu PR nakit açmaz |

Faz 3 fabrikayı `archived/` altına aldı ve kenarı 410 yaptı. CEO/Super Admin şema DROP’unu Nakit Halkası’ndan (Faz 6) sonraya bıraktı. Bu PR o kararı bozmaz: test vergisini keser, nightly’yi sadeleştirir, `trendScore` / `proofOfWorkHash` **okumasını** katalog/UI’dan durdurur. Kolonlar durur.

---

# 1. YAPILAN TEDAVİ

## 1.1 Yüzey `toContain` yığını kesildi (4.1 / 4.2)

**Nereye:** `tests/academy/curriculum-player-surface.test.ts`, `tests/academy/citizen-surface.test.ts`.

Eski `curriculum-player-surface` tek `it` içinde arşiv TTS, lab, discussion, CSS sınıfı ve pedagoji cümlesi tarıyordu. Bu anayasa değildir; her budama iğneyi kaydırmayı zorunlu kılar.

Kalan iğneler:

| Kovası | Ne durur |
|--------|----------|
| Happy-path | Vitrin (`CourseList`) → kasa (`PurchaseButton`, `SettlementSteps`) → oynatıcı (`CurriculumPlayer`, `completeLesson`) |
| Access | `hasAcademyPlayerAccess`, `hasPurchased`, oturum, `/oyna` redirect |
| Listen kapalı | `ACADEMY_LESSON_LISTEN_ENABLED = false`; listen / generateSpeech 410; oynatıcı `LessonListenButton` import etmez |
| Purchase-flow | Satın alma CTA, lisans notu |
| idor-exam (dondurulmuş) | Dosya **silinmedi**; Antre `ExamStartGate` durur, `ExamPanel` Antre’de yok. Motor testine dokunulmadı |

Davranış testleri yerinde: `purchase-flow.test.ts`, `access.test.ts`, `happy-path.test.ts`, `curriculum-player.test.ts` (dinle GoneError), `idor-exam-purchase.test.ts`.

## 1.2 Nightly mühür — çıkarıldı, prebuild’e alınmadı (4.3)

| Betik | Durum |
|-------|--------|
| `verify:nightly` | `verify:academy-pedagogy-seals` **yok**. Zincir: grep-seals → ai-gateway → web-security → paytr-reconciliation → `test:surface` |
| `verify:prebuild` | Pedagogy **yok** (sır, `amountMinor`, RLS, v1, IDOR). Bilinçli: derleme kapısına alınmadı |
| `verify:academy-pedagogy-seals` | Boş davranış: yalnız `tests/academy/pedagogy-seals-retired.test.ts` (`LISTEN_ENABLED === false`). `pedagogy-doctrine` / `curriculum-seal` / `proof-of-work` / `tts-voices` bu kapıdan koptu |

PoW yazması nightly mühürden koptu. Motor hâlâ kanonik özet basar (`completeAcademyLesson`); `npm test` içindeki `proof-of-work.test.ts` durur. Nightly artık hash bekleyerek DROP’u kilitlemez.

`scripts/verify-atomic-seals.ts` kırmızı iğne: pedagogy nightly’de veya prebuild’de görünürse fail.

## 1.3 Katalog / UI okuma kesimi (Faz 4 ön hazırlık; DROP yok)

**Silindi:** `components/academy/filter-bar.tsx` (canlı vitrin zaten import etmiyordu; test tutuyordu).

**İndirildi:** `lib/academy/catalog-filter.ts` 858 satır süzgeç fabrikasından ~212 satır sıra yardımcısına (`orderAcademyCatalogByCurriculum` + kart SKU kodu). `trendScore` / `rating` / grup dropdown **yok**. Dört büyüme SKU sırası aynı: `python-temel` → `ai-temel` → `fullstack-temel` → `ux-temel`.

**UI okuma durdu:**

| Yüzey | Ne kesildi |
|-------|------------|
| Vitrin kartı | Zaten `MarketPopularityBadge` yoktu; iğne durur |
| `level-pathway` halkası | `trendScore` rozeti ve `proofOfWorkHash` damgası yok. Sıra sicil dizisi; puan kolonu değil |
| Oynatıcı BFF | `publicPlayer` ders satırında `proofOfWorkHash` basmaz |
| Bellek store | `listPublishedCourses` sıra yardımcısı kullanır; puan kolonuna göre sıralamaz |

**Durur (bilinçli — Faz 5 DROP değil):** Prisma kolonları, tohum `trendScore = globalRank × localRank` (INSERT), `completeAcademyLesson` hash yazımı, sınav paneli / `dogrula` (dondurulmuş belge yüzeyi). `ops-migrate` `assertAcademyLessonCompletions` körleşmesin diye kolon durur.

---

# 2. TESTLERİN KIRILMAMASI — İZLENEN YOL

Yeni `verify:*` adı yok. Mevcut betik boşaltıldı; prebuild şişirilmedi.

| Risk | Ne yaptık |
|------|-----------|
| Surface `toContain` arşiv TTS / filter-bar | İğne kesildi veya «dosya yok» / «oynatıcı import etmez» |
| `catalog-filter.test.ts` 1 400 satır süzgeç | Sıra + SKU + (bağımsız) görünüm/favori |
| `atomic-seals-prebuild-surface` nightly pedagogy | `not.toContain`; betik `pedagogy-seals-retired` |
| `level-pathway.test` PoW rozeti | Halka görünür; `proofOfWorkHash` / `trendScore` property yok. Ustalık hash’i (kanonik müfredat özeti) durur — kolon okuması değil |
| `course-seed-surface` filter-bar / badge | `filter-bar` `existsSync false`; yol haritası badge import etmez |

Çalıştırılan yeşil dilim (28 Ağustos 2026): `tests/academy` davranış **43 dosya / 189 test** (surface hariç) + akademi surface altılısı + `verify:atomic-seals` OK + `verify:academy-pedagogy-seals` 1 test. Canlı tarayıcı oturumu bu ortamda yoktu; `filter-bar` zaten vitrinde değildi. Davranış + surface ile kilitlendi.

---

# 3. BİLİNÇLİ OLARAK YAPILMAYANLAR

- Prisma `DROP` (`trendScore`, `proofOfWorkHash`, `AcademyAudioCache`).
- PoW **yazmasını** motoradan sökmek (yazma 0 henüz kanıtlı değil; kolon Faz 5).
- Sınav / belge / vize 403 / `ExamStartGate` kırma.
- `archived/` `rm` — nightly artık arşiv TTS’yi adıyla anmaz; `npm test` hâlâ `listen-audio-cache` / `listen-soft-fallback` ile arşiv motorunu `ENABLED=true` mock’lar. Silmek o iki dosyayı da taşır veya 410’a indirir; ayrı karar.
- Dron / IAP / sahte CREDIT / 5. SKU.
- Yeni `verify:*` betiği; pedagogy’yi `prebuild`’e almak.

---

# 4. SEN OLSAYDIN NE YAPARDIN?

Faz 4’ü bu şekilde **yaparım.** Yapmamak, Faz 3 arşivini nightly pedagoji mühürüyle yeniden bağlamaktır.

## Üç ekran kodu bitti mi? Top idari süreçte mi?

**Üç ekranın MVP kodu bitti. Nakit halkasını açmak için Akademi’ye yeni bir motor yazmam. Top PayTR merchant onayı ve Faz 6 operasyonundadır — şema DROP’u (Faz 5) ondan sonra gelir.**

Neden «bir Faz 4.5 daha» açmam:

1. **Vitrin → kasa → oynatıcı diskte duruyor.** Dört SKU, `PurchaseButton` + SETTLED, `CurriculumPlayer` + ders atlama yasağı, dinle 410. Bu GÖREV 03’ün amacıydı. Faz 1–4 o amacı şişman fabrikadan ayırdı.

2. **İlk tahsilat akademi fabrikası istemez.** PayTR → cüzdan CREDIT → akademi DEBIT → `AcademyPurchase` SETTLED üçlüsü `trendScore` okumaz, süzgeç UI istemez, TTS istemez. Merchant kapalıyken oynatıcıya perde eklemek nakit riskini gizler.

3. **Kalan kod borçları kasa değildir.** Kolonlar durur (Faz 5). Motor hash basar (yazma 0 kanıtı yok). `MarketPopularityBadge` dosyası ölü durabilir. `archived/` durur. Bunlar ilk SETTLED’i bloklamaz; aynı haftada DROP + ilk tahsilat = çift arıza.

4. **Sınav/belge/vize ayrı ürün kararıdır.** `idor-exam` dondurulmuş. Pazaryeri açılınca ≥70 + vize — Anayasa sırası. MVP nakit halkasına sınav kapısı eklemem.

**Yapmam (hâlâ):** Şimdi migrate. Pedagogy’yi `prebuild`’e almak. Sahte CREDIT. Arşivi `rm` edip listen mock’unu canlı yolda bırakmak.

**Yaparım (Faz 6’dan sonra, ayrı PR):** Bir gerçek tahsilat + bir oyna + yedek. Sonra Faz 5: `proofOfWorkHash` nullable DROP, `trend_score` (okuma 0 bu PR’da katalog/UI’da kanıtlandı; seed INSERT duruyor), `AcademyAudioCache`. `AcademyExam*` / `AcademyCertificate` hâlâ yok.

Nakit idari (PayTR). Bu tedavi onu açmaz. Kod tarafında üç ekranı «biraz daha iskelet» yapmak faiz değil, ertelemedir.

---

# 5. SİCİL

**Kesildi**

- Surface `toContain` arşiv/CSS/süzgeç yığını.
- Nightly `verify:academy-pedagogy-seals` (fabrika üçlüsü + TTS voices).
- `filter-bar.tsx`.
- Katalog süzgeç / puan okuma; yol haritası rozeti; oynatıcı BFF hash alanı.

**Duruyor (bilinçli)**

- Üç ekran. Sınav dondurulmuş. PoW **yazımı**. Tohum + Prisma kolonları. Arşiv fabrika + dinle regresyonu (`npm test`).
- `verify:academy-pedagogy-seals` adı: boş dinle-kapalı kontrolü; nightly/prebuild dışı.

**Yapılmadı (doğru)**

Çekim, sahte CREDIT, IAP, native akademi, şema DROP, fabrika `rm`, yeni verify adı, prebuild’e pedagogy.

---

*Bu rapor `/docs` günlük alanındadır. Kalıcı kırmızı çizgi `.system_docs/ANAYASA.md`. Çelişkide Anayasa bağlayıcıdır; Anayasa ile disk çelişirse disk yazılır. GÖREV 07 disk icrasıdır. Faz 5 şema DROP, ilk gerçek tahsilat + yedek sonrasına bırakılır. Faz 6 Nakit Halkası idaridir.*
