# TEDAVİ RAPORU — `01_office_ai` (Adım 2 + Adım 3 kapanış)

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Girdi | `docs/TESPIT_RAPORU_OFFICE_AI.md` (P0 / P1 / P2) |
| Kapsam | Doküman onarımı, süre SSOT eşitlemesi, hukuk/model/slogan/başlık revizyonu, Pedagoji diyeti, davranış testleri, canlı nakit prosedürü, Super Admin CLEARED teyidi |
| Hüküm | **P0 / P1 / P2 kapandı. Amiral gemisi `01_office_ai` tam mühürlü.** P0-1 canlı nakit tanığı Super Admin tarafından alındı: PayTR iframe + 3D Secure, ₺15,00 CLEARED (bakiye ₺10,00 → ₺25,00; defter 3 → 4, CREDIT). Split ve Freelancer kilitli kalır. |

---

## 1. Yapılan tedaviler

### 1.1 Dokümantasyon onarımı ve süre eşitlemesi (P0-2, P1 / U2 / U3 / U4)

| İş | Sonuç |
|----|--------|
| `docs/ops/DURUM.md` HEAD’den geri yüklendi | Anayasa / Manifesto / Pedagoji atfı yine yaşayan dosyayı gösteriyor |
| Ders tablosu vatandaş sırasına çevrildi | `1 → k1 → 2 → 3 → 5 → 4 → g1 → w1 → 6` |
| Eksik Ders 3 satırı (`01_office_ai-2`, 553.84 sn) eklendi | Teknik sonek artık ders numarası sanılmıyor |
| 9 süre timings JSON (`durationSec`) ile birebir | 607.28 / 677.56 / 553.84 / 575.6 / 517.56 / 443.56 / 567.2 / 567 / 540.2 |
| `docs/DURUM.md` ayna | Aynı tablo; üst bant yaşayan kesiti `docs/ops/DURUM.md` diye işaret eder |
| `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-5"]` | 516 → **518** (`Math.round(517.56)`) |
| `targetDurationMinutes` mühürlü saniyeye yuvarlandı | 10.1 / 11.3 / 9.2 / 9.6 / 8.6 / 7.4 / 9.5 / 9.5 / 9.0 |

Ders 4 (`01_office_ai-4`) ritüel dersi bilinçli kısa kalır; hedef 9.6 dk’dan **7.4 dk**’ya çekildi (mühür 443.56 sn). Fırın planı artık kaseti yalanlamaz.

### 1.2 İçerik ve hukuki metin (P1 Y2, P2 Y1 / Y3 / Y4)

**Y2 — Ders k1 el kitabı.** Mutlak cümle değişti:

> Lisans ve DPA tek başına yeterli değildir; aydınlatma/açık rıza/VERBIS zeminini kurmadan ham kimlik hiçbir panele girmez.

**Y1 — Ders 1 model dili.** Olgusal stereotip («ChatGPT hızlı taslak üretir… unutmaz») eğilim + sürüm notuna çekildi. **Özel API = şirketinin kurumsal yapay zekâ modeli** tanımı eklendi.

**Y4 — Slogan.** «saniyeler içinde çözeceğiz» → «adım adım çözeceğiz». «vazgeçilmez alışkanlık» → «kalıcı alışkanlık». Compact makale + konuşma metni (`spoken-scripts/01_office_ai-1.md`) güncellendi.

**Y3 — Başlık makası.** Kurs alt başlığı:

`Excel, Word, PowerPoint & E-Posta Otomasyonu` → **`… E-Posta Verimliliği`**

SSOT: `packages/kernel/src/catalog-ids/course-slugs.ts` (`ACADEMY_COURSE_TITLES`), `officeAiMasteryModule.title`, antre vize kısa adı **Ofis Verimliliği**. Ders 2 başlığı «Rapor Otomasyonu» duruyor — o bir ders temasıdır, kurs vaadi değildir.

**Re-bake notu:** Mühürlü MP3 / cue / timings hâlâ eski slogan ve model cümlesini taşır. Karaoke kaseti makaleden bir bake geridedir. Hedefli re-bake (ders 1 + gerekirse k1 el kitabı sese sığmaz) fırın planına alınır; bu paket kaseti yeniden mühürlemedi.

### 1.3 Pedagoji diyeti ve test kilitleri

- `.system_docs/PEDAGOJI.md`: CSS/piksel (`font-weight`, `padding-block`, `calc(100dvh…)`, `getBoundingClientRect`, clamp) çıktı. İlke kaldı (altyazı titremez, harf kesilmez, 16:9 ezilmez).
- Süre bandı ve baraj sayısı Pedagoji’den kod SSOT’a bırakıldı (`production-standard.ts`, `ACADEMY_EXAM_PASS_SCORE`).
- `tests/academy/production-standard.test.ts`: cümle-eşleşmesi yerine sabitlerden okuyan davranış testi. CSS Pedagoji’de **yok** diye kilitlenir.
- Yeni: `tests/academy/office-ai-bridge-lock.test.ts` — giriş/kapanış köprüleri vatandaş sırasına; `targetDurationMinutes` timings’e.

### 1.4 Canlı nakit tanığı (P0-1) — Adım 3 teyidi

`docs/CANLI_TEST_PROSEDURU.md` yazıldı ve işletildi.

Kod tabanı ₺10 (`WALLET_TOP_UP_MIN_MINOR = 1000`). Super Admin canlı ortamda PayTR iframe + 3D Secure ile gerçek kart çekti. Teyit (18 Eylül 2026):

- Bakiye ₺10,00 → ₺25,00 (`amount_minor` 1000 → 2500)
- CLEARED tutar **₺15,00** (`amount_minor = 1500`)
- Defter işlem sayısı 3 → 4; CREDIT kaydı düştü

Yaşayan kesit: `docs/ops/DURUM.md` — **P0-1 Canlı Nakit Tanığı Başarıyla Alındı — PayTR CLEARED Teyit Edildi (18 Eylül 2026).** Tam `merchant_oid` kesite basılmaz.

---

## 2. Kapanan / açık kalan

| ID | Konu | Durum |
|----|------|--------|
| P0-2 | `docs/ops/DURUM.md` silinmesi | **Kapandı** |
| P1 U2 | Ders numarası / eksik satır | **Kapandı** |
| P1 U3 | Süre tablosu sapması + ders-5 518 | **Kapandı** |
| P1 U4 | `targetDurationMinutes` | **Kapandı** |
| P1 Y2 | k1 hukuk cümlesi | **Kapandı** (kaset re-bake bekler) |
| P2 Y1 / Y4 | Model dili + slogan | **Kapandı** (makale + spoken; karaoke re-bake bekler) |
| P2 Y3 | Başlık «Otomasyonu» | **Kapandı** (kod SSOT; canlı DB başlığı Super Admin / reseed ile hizalanır) |
| Pedagoji CSS | Piksel sızması | **Kapandı** |
| Test kilidi | Cümle → davranış + köprü | **Kapandı** |
| P0-1 | Canlı `CLEARED` tanığı | **Kapandı** — Super Admin, 18 Eylül 2026, ₺15,00 CLEARED |

---

## 3. Adım 3 teyidi ve kapanış

P0 / P1 / P2 kapandı. Amiral gemisi `01_office_ai` **tam mühürlüdür** (9/9 kaset, 9/9 karaoke, 9 derslik sınav yolu, canlı nakit tanığı).

Kart çekildi. Super Admin canlı PayTR iframe + 3D Secure ile ₺15,00 CLEARED tanığını aldı. Manifesto’nun «nakit Akademi’de» cümlesi zaman kipi olarak artık tanıksız değildir. Split ve Freelancer açılmaz. Reklam ayrı CEO kararıdır.

P-maddesi olmayan sonraki iş:

1. **Ders 1 (ve k1 el kitabı) hedefli re-bake.** Vatandaş kulağı hâlâ «saniyeler içinde» duyabilir. Makale düzeldi; kaset geride. Reji oturmadan `--seal` yok — tek ders, dry-run, insan onayı.
2. **Amiral SETTLED + anonim `/dogrula`.** Lisans ve kamu mühür tanığı P0-1’in dışındadır; huninin bir sonraki halkasıdır.
3. **Uydu-0 «Senin kapın hangisi?»** (3 dk, sınav dışı). Lisans/Copilot kararı kullanıcının ilk donma anıdır; çekirdek 9’u şişirmeden en yüksek kaldıraç budur. Uydu-11 (formül/grafik) Sezon 2 açılışıdır, kapanışı değil.

**Çıkarılacaklar bitti** (Otomasyonu, stereotip, piksel, tanıksız kasa). **Eklenmeyecekler:** ikinci SKU fırını (`05_prompt_practice`). Kapı ürününün hunisi, amiral satmadan ölçülemez. Eşik aynı: 10 SETTLED + 3 mühür.

Platform kurgusu (amiral + sürü dron / shared kernel) doğru ve kod bunu doğruluyor. Sonraki mimari adım yeni oda değil: **kapalı halkada dron T3** (yükle → satın al → izle → sınav → mühür) + her yeni yazma yeteneğinin v1 hop siciline geri yazılıp yazılmadığı. «API-First» ikinci istemci bağlanınca kanıtlanır.

### Platformda bir sonraki adım (sıralı)

| Sıra | Adım | Sahip | Bitti sayılır |
|------|------|-------|---------------|
| 1 | P0-1 canlı nakit tanığı | Super Admin | **Kapandı** — 18 Eylül 2026, ₺15,00 CLEARED |
| 2 | Ders 1 hedefli re-bake (slogan + eğilim dili kulağa da gider) | İçerik fırını | Karaoke = makale |
| 3 | Canlı DB kurs başlığı kod SSOT ile hizala (reseed / Super Admin) | Mühendislik | Vitrin «Verimliliği» basar |
| 4 | Amiral SETTLED + anonim `/dogrula` | Operatör | Lisans ve kamu mühür tanığı |
| 5 | Metrik eşiği: 10 satış + 3 mühür | Ürün | `05_prompt_practice` fırın kararı; uydu 0/11 paketleme |

**Adım 3 kapanışı:** yaşayan kesit mühürlendi. Açık P-maddesi yoktur.
