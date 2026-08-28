# 02 — TEDAVİ RAPORU: OMURGA SIZINTISI

| Alan | Değer |
|------|--------|
| Görev | GÖREV 02 — Tespit sonrası tedavi (Adım 1) |
| Tarih | 28 Ağustos 2026 |
| Rol | Baş mimar (Cursor / Grok) — Super Admin’e, CEO kontrolünde |
| Kaynak | `docs/01_Tespit_Raporu_Mimari_ve_Anayasa.md` (onaylı) |
| Ürün kodu | Değiştirildi — yalnız Adım 1 üçlüsü |
| PayTR | Pasif kabul duruyor. Bu PR nakit açmaz. |

Tespit raporundaki Adım 1 üç müdahale olarak uygulandı. Yeni oda, yeni TTS perdesi, ikinci Dron, sahte CREDIT yok.

---

# 1. YAPILAN TEDAVİ

## 1.1 Çekirdek izolasyonu — sızıntıyı kes

**Nereye:** `lib/kernel/catalog-ids` (Proof mühür okuma `lib/kernel/proof`’ta kaldı; kimlik ayrı sözleşmedir).

Neden proof klasörü değil: `ProofReadPort` mühür satırı okur. Pathway id ve ilan kapısı **kimlik sicilidir**. İkisini aynı dosyada birleştirmek Proof’u pazaryeri kapı listesi yapmak olurdu.

| Sicil | Dosya |
|-------|--------|
| `AcademyPathwayId`, 28 id, başlık, halka slug’ları | `lib/kernel/catalog-ids/pathway-ids.ts` |
| Yayın SKU başlığı ↔ slug, onboarding (`null`) | `lib/kernel/catalog-ids/course-slugs.ts` |
| Beş ilan kapısı, oda varsayılanı, tohum iş id haritası | `lib/kernel/catalog-ids/listing-doors.ts` |

Akademi `level-pathway.ts` pedagoji özetini ve oynatıcı görünümünü tutar; id/başlık/halka **çekirdekten türer**. `lib/academy/course-titles.ts` ince re-export’tur (oda içi import yolu kırılmasın diye).

**Kariyer ve freelancer `lib/academy` import etmez.** Vize kapsamı, kapı kilidi, iş tahtası filtresi, Zod enum kernel sicilini konuşur. Kelime kestirimi kariyerde kaldı — o bir heuristic, kimlik değil.

Duvar:

- ESLint: `lib/career/**` ve `lib/freelancer/**` için `@/lib/academy` / `@/lib/academy/*` yasak.
- `verify:boundaries`: `a8.catalog` kuralı.

Bilerek dokunulmayan sızıntılar (Adım 1 dışı, tespit 2.1):

- `lib/dashboard/academy-pulse.ts` → akademi DTO (kokpit vergisi; düşük risk).
- UI (`components/freelancer/*`) hâlâ `lib/academy/level-pathway` re-export’unu kullanabilir — duvar `lib/` odaları içindir.
- Kernel `passport/load.ts` dikey **tablo** okur (klasör değil). A8’in ikinci yarısı; bu PR’ın işi değil.

## 1.2 Stale atıfların temizliği

| Eski | Yeni |
|------|------|
| eslint / `verify:boundaries` «Anayasa §2.8» | **Anayasa A8** — madde vardır. |
| `S9-B` müze yasağı (eslint, next.config, gitignore, indeks) | **OPS notu.** Anayasa maddesi değildir. Yasak durur (git / indeks / webpack / import dışı). |

Anayasa Bölüm B’ye müze OPS cümlesi ve catalog-ids sicili yazıldı. A8’e bir cümle eklendi: kariyer/freelancer `lib/academy` import etmez. Tadil tarihi 28 Ağustos 2026.

Ajan artık hayali «§2.8» veya «S9-B anayasa maddesi» aramasın. Müze yasağını kaldırmadık; etiketini indirdik.

## 1.3 Sözleşme çelişkisi — STORAGE_CONTRACT

Eski başlık «bu fazda nesne depo yok» idi. Diskte `lesson-audios` + `AcademyAudioCache` vardı. Ajan ya bucket’ı yasak sanıyordu ya Studio’yu açmaya itiliyordu.

Yeni kesit:

- **Vatandaş / Studio object store yok** (410). `studio-assets`, imzalı PUT, Dashboard CORS canlı reçete değildir.
- **İstisna (canlı, dar):** akademi ders TTS. Bucket `lesson-audios`. Byte depoda; Prisma locator. Yazma `lib/academy/listen-audio-store.ts`. Bu istisna Studio’yu veya yeni ürün bucket’ını açmaz.
- `ops:migrate` hâlâ `lesson-audios.sql` taşımaz (kilit listesi testi duruyor). Provision ayrı: `supabase/storage/lesson-audios.sql`.

OPS_RUNBOOK ve `.system_docs/README.md` aynı yalanı tekrarlamasın diye hizalandı.

Dinlemeyi kapatmadık (`LISTEN_ENABLED` lab bayrağına bağlanmadı). Tespit «istisna **veya** bayrak» dedi; istisna seçildi — ürün davranışı değişmedi, sözleşme dürüstleşti.

---

# 2. DOĞRULAMA

| Kapı | Sonuç |
|------|--------|
| `verify:boundaries` | OK — kariyer/freelancer↛academy (catalog-ids) |
| ESLint (değişen `lib/` dosyaları) | temiz |
| Vitest: catalog-ids, vize kapısı, listing-visa-scope, visa-scope-board, job-board-filter, job-visa-pathway, level-pathway, boundaries-surface, system-docs, academy player/citizen surface | yeşil |
| `tsc --noEmit` | Bu PR’ın dosyalarında hata yok. Repoda önceden duran başka tsc şikâyetleri bu tedavinin konusu değil. |

Davranış değişmedi: beş ilan kapısı, tohum YZ kilidi, onboarding slug `null`, vize 403 cümleleri aynı.

---

# 3. ZORUNLU SORULAR

## SEN OLSAYDIN NE YAPARDIN?

Bu izolasyonu **yaparım** — yapmamak, ikinci Dron’un müfredat slug’ını kopyalaması ve müfredat değişince ilan tahtasının kırılması demek. Tespitteki teşhis doğruydu.

Yaparken dokunmadığım, sonra dokunacağım / dokunmayacağım:

1. **ProofCatalogPort yazmazdım.** 28 halka slug’ını kernel’e statik almak Adım 1 için doğru kesittir. Port, her vize çağrısına akademi adaptörü iğneler; küçük PR’ı kompozisyon tiyatrosuna çevirir. Katalog şişerse (yeni 29. dikey) sicil yine tek yerden büyür — bu yeterli.
2. **Pedagoji özetini kernel’e almazdım.** Almadım. Özet akademidedir. Kernel kimlik taşır, anlatım taşımaz.
3. **Dashboard `academy-pulse` DTO sızıntısına bu PR’da girmezdim.** Girmedim. Kokpit salt okuma; nakit halkasını döndürmez.
4. **UI’yı zorla kernel’e çevirmezdim.** `components/freelancer` akademi re-export’u kullanabilir. Duvar oda `lib/` içindir. İleride dropdown’u `ACADEMY_PATHWAY_TITLES` ile beslemek kozmetik.
5. **`packages/@yetkin/kernel` npm paketi çıkarmazdım.** Klasör yeter. Versiyonlu paket bu ölçekte yalan.
6. **Akademi içerik fabrikasını bu PR’da dondururdum — kodla değil, yazılı kararla.** Tespit Adım 0 hâlâ geçerli: yeni perde, yeni `real-world-pedagogy` satırı yok. Bu tedavi onu enforce etmez; CEO kararıdır.
7. **Verify şişirmezdim.** Şişirmedim. Mevcut boundaries iğnesine `catalog-ids` / A8 eklendi; yeni `verify:*` betiği yok.
8. **Dinlemeyi kapatmazdım.** Sözleşmeyi yalan olmaktan çıkarmak, özelliği öldürmekten ucuz ve dürüst.

İzolasyondan sonra mimaride asıl dokunulacak yer **omurga değil, halka:** PayTR üye işyeri paneli (idari) ve bir gerçek akademi tahsilatı. Kernel’i daha fazla «platform» yapmak tedavi değil.

## Mimariyi bu şekilde «Modüler Monolit» çizgisinde tutup, Sürü/Mikroservis söylemini küçültmek doğru bir karar mı?

**Evet. Bu ölçekte doğru karar; alternatif zarar.**

Gerekçe diskte, manifestoda değil:

- Tek Postgres, tek `User` satırı, akademi/kariyer/freelancer FK’leri Anayasa A8’in kabul ettiği vergidir. Şemayı ayırmak «bağımsız Dron DB» vaadi doğurur; vaat yalan olur.
- Paylaşılan kernel **klasördür**, paket değildir. `catalog-ids` bunu somutlar: çapraz oda kimliği çekirdekte, motor dikeyde.
- Elde bir Expo lab (`apps/rail-is`) var. Sürü yok. «Sürü Dron» cümlesi ikinci istemci sözleşme **ve** kabuk geçince söylenir. Şimdi söylemek unvan enflasyonudur.
- API-First yalnız Dron kesiti. Web RSC/`load`. A9 bunu zaten yazıyor. Unvanı «API-First Core Platform» yapmak Amiral’i hop siciline tıkar.

Küçültülen şey mimari değil **söylemdir**. Duvarlar (A8, eslint, catalog-ids) durur; «micro-apps platform / Shared Kernel / sürü» durmaz. Bu, 27 Ağustos tadili ile aynı yöndedir. Geri almak müze refleksidir: cilalı unvan, dönmeyen halka.

İstisna: üçüncü tüketici aynı v1 zarfı kıra kıra konuşunca model *ölçeklenmiş* olur. O gün «sürü» kelimesi hak edilir. Bugün hak edilmez.

## Bir sonraki adımda (Adım 2) teknik olarak somut ne yapmalıyız?

Tespit Adım 2’yi **idari ≠ kod** diye ayırdı. Bu ayrım durur.

**Kod ile yapılmayacak:** PayTR’yi env ile «açmak», split’i sahte CREDIT ile simüle etmek, vize 403’ü gevşetmek, akademi native, 5. oda, yeni verify betiği.

**İdari (CEO / Super Admin, panel):** PayTR **üye işyeri** (merchant). Split ayrı lisans; accept **503 kalsın**.

**Kod hazır olduğunda tek vatandaş dilimi** (mevcut motor; yeni özellik yok):

1. Gerçek tahsilat (merchant) → Wallet CREDIT  
2. Kurs DEBIT  
3. Ders  
4. Sunucu sınavı ≥70  
5. SHA-256 mühür + kamu doğrulama  
6. Kariyer vizesi  

Bu, freelancer split’ten bağımsız ilk gerçek para dilimidir. Split’i bekleyip akademiyi de dondurmak S43’ü korumaz, durdurur.

Teknik hazırlık Adım 2’nin *içinde değil*, Adım 3’tedir (split açılmadan hemen önce): hold/DB yetim kilit mutabakatı, paylaşılan rate-limit store, sınav POST idempotency. Şimdi yazmak Adım 1’i şişirir; panel kapalıyken uyur.

Adım 2 sırasında mühendisin işi: **yeni özellik yok.** Catalog-ids’e 29. dikey ekleme. Oynatıcı cilası yok. Dron navigator Adım 4. Bu tedavinin merceği kapanmıştır.

---

# 4. SİCİL

**Kesildi**

- Kariyer/freelancer → `lib/academy` import.
- Hayali Anayasa §2.8.
- S9-B’nin anayasa maddesi kılığı.
- STORAGE_CONTRACT’ın «nesne depo yok» yalanı.

**Duruyor (bilinçli)**

- ProofReadPort mühür okur; catalog-ids kimliği taşır.
- Vize 403, sınav sunucuda, PayTR pasif, accept 503.
- Akademi dinle + `lesson-audios` (artık sözleşmede yazılı).
- Dashboard akademi DTO, UI academy re-export, kernel dikey tablo okuma.

**Yapılmadı (doğru)**

Çekim, sahte CREDIT, vize gevşetme, IAP, 5. oda, mikroservis, dinlemeyi kapatmak, akademi içeriğini bu PR’da donduran otomatik kapı.

---

*Bu rapor `/docs` günlük alanındadır. Kalıcı kırmızı çizgi `.system_docs/ANAYASA.md`. Çelişkide Anayasa bağlayıcıdır; Anayasa ile disk çelişirse disk yazılır, metin tadil edilir. 28 Ağustos 2026 tedavi: disk ve Anayasa A8/B bu PR ile hizalandı.*
