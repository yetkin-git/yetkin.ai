# CAREER_TESPIT_RAPORU — YetkinCV & Kariyer Ekosistemi Derin Denetimi

**Denetim kapsamı:** `app/career`, `app/api/career`, `app/(public)/uzmanlar`, `app/(public)/kurumsal`, `app/(public)/ilan`, `app/api/kurumsal`, `app/api/ilan`, `app/(public)/vize`, `components/career`, `components/kurumsal`, `lib/career`, `lib/sales`, `prisma/schema/{career,b2b}.prisma`, `supabase/migrations/*rls*`, `lib/kernel/security/*`, `tests/career`, `tests/kurumsal`, `tests/sales`.

**Denetim tarihi:** 24 Kasım 2026
**Rol:** Baş Denetçi (Principal Auditor) / CTO
**Yöntem:** Her iddia `dosya:satır` kanıtıyla veya çalıştırılmış komut çıktısıyla doğrulandı. Kaynak kod **değiştirilmedi**; yalnızca bu rapor dosyası üretildi.

---

## 0. Doğrulama Kapıları Sonuçları

Tüm komutlar `d:\yetkin.ai` kökünde, `main` dalında (11 dosya değişik/3 dosya silinmiş çalışma ağacı) çalıştırıldı.

| # | Kapı | Komut | Sonuç | Kanıt |
|---|---|---|---|---|
| 1 | Tip | `npx tsc --noEmit` | **PASS** (0 `error TS`) | Çıktı yalnız `TSC_DONE=0`; hata satırı yok |
| 2 | Sen aksi | `npm run verify:sen-axis` | **PASS** | `verify:sen-axis OK — 711 dosya, 46 siz kaçağı tarandı … 410 sen-voice hariç.` |
| 3 | Sınırlar | `npm run verify:boundaries` | **PASS** | `verify:boundaries OK — kernel↛dikey, UI↛prisma/yazma motoru, oda↛oda engine, … kariyer/freelancer↛academy` |
| 4 | API yetki | `npm run verify:api-auth -- --check` | **PASS** | `verify:api-auth --check OK — 166 route. {"session":103,"public":27,"closed":11,"cron":2,"admin":15,"webhook":8,…}` |
| 5 | RLS | `npm run verify:rls-status` | **PASS (statik)** | `verify:rls-status OK — Auth sync + e-posta senkronu + FORCE RLS + owner SELECT + kapsamsız deny. Prisma tabloları: … career_desk_tasks, career_portfolio_items, career_visa_stamps, kurumsal_job_applications, kurumsal_job_postings, kurumsal_offer_requests, yetkin_cv_seals, yetkin_cv_sittings …` |
| 6 | Sır | `npm run verify:no-secrets` | **PASS** | `verify:no-secrets OK — PEM / service_role JWT / yasaklı .env.example ataması / git .env yok.` |
| 7 | Test | `npx vitest run tests/career tests/kurumsal tests/sales/kurumsal-screening.test.ts` | **PASS** | `Test Files 19 passed (19) / Tests 95 passed (95) / Duration 10.32s` |
| 7b | IDOR | `npm run verify:idor-seals` | **PASS** | Statik tarama + `Test Files 5 passed (5) / Tests 17 passed (17)` |

### 0.1 Kapı sonuçlarının dürüst yorumu (denetçi notu)

- **Kapı 5 "PASS" demek "canlı veritabanında FORCE RLS açık" demek değildir.** Script'in kendi başlığı bunu açıkça yazar: *"Faz 1.1 — RLS süreklilik mührü (statik). Canlı DB yoksa yalnızca SQL + sicil + Prisma tabloları doğrulanır."* (`scripts/verify-rls-status.ts:3-4`). Yani doğrulanan şey **sicil ↔ Prisma model eşitliği**dir (`scripts/verify-rls-status.ts:168-177`, sicil: `lib/kernel/security/rls-policy-registry.ts:28-123`), canlı `pg_class.relrowsecurity` değil. Bu oturumda `pg_*` sorgusu çalıştırılmadı; **canlı DB kanıtı YOK** (bkz. O6).
- **Kapı 7 yalnız istenen paketleri koşar.** Tam suite (`npm test`) bu oturumda koşulmadı; bu rapordaki işlevsel iddialar bu 95 testin kapsamıyla sınırlıdır.
- **Kapı 4'ün PASS olması doğru yetki *türünü* kanıtlar, doğru *sahipliği* kanıtlamaz.** `/api/kurumsal/ilanlar` `session` olarak kayıtlıdır ve gerçekten oturum ister — ancak **ürün lisansı** istemez (bkz. K2).
- Yeşil kapılar, bu rapordaki K1–K4 bulgularının hiçbirini çürütmez: dört bulgu da **tip/test/auth haritası** kapsamı dışındaki **iş kuralı** kusurlarıdır. Kapılar "kod kırılmadı" der; "ürün doğru" demez.

---

## 1. Yönetici Özeti & Genel Puan Kartı

### 1.1 Üç cümlelik özet

Kariyer ekosistemi **mühendislik disiplini yüksek, ürün vaadi düşük** bir yüzeydir: kernel sınırları, RLS sicili, IDOR testleri ve AI koçun halüsinasyon kalkanı gerçekten çalışıyor; ancak **"YetkinCV" adı verilen şey bir CV değil, 5 soruluk ve cevap anahtarı tamamen sabit bir testtir** — üstelik bu testin ürünü olan "doğrulanmış mühür", 5 tıkla %100 alınabildiği için işveren için kanıt değeri taşımaz. B2B tarafında gerçek bir işveren hunisi (ilan → ağırlıklı eleme → kısa liste) DB üzerinde çalışıyor, fakat **ürünün ödeme kapısı hiç bağlanmamış** (`job-screening-pack` katalog birimi kodun hiçbir yerinde okunmuyor) — yani para kazanması gereken yüzey bugün bedava. Kamu vitrininde ise **ücretsiz mühürler ücretli dizine sızıyor**, yani 290 TL'lik yayın vaadinin bir ayağı daha ilk günden çürük.

### 1.2 Puan Kartı — **62 / 100**

| Boyut | Ağırlık | Puan | Gerekçe (tek satır) |
|---|---|---|---|
| **Mimari** | %25 | **17 / 25** | Kernel↔dikey duvarı, `ProofReadPort` soyutlaması, iki motorlu puan çapraz kontrolü, RLS sicil disiplini örnek nitelikte; buna karşılık **CV alan modeli yok**, dizin/yayın tutarsızlığı, sınırsız `findMany`, çekirdek rotalarda hız sınırı yok. |
| **İşlevsellik** | %30 | **17 / 30** | Sınav→mühür→`/vize` zinciri uçtan uca çalışıyor; ilan→başvuru→ağırlıklı sıralama gerçek DB sorgusuyla çalışıyor. Ama CV düzenleme, PDF/DOCX, mülakat hazırlığı, ATS yok; soru bankası dikey başına 5 soru ve oynanabilir. |
| **Ticari Farklılaşma** | %25 | **14 / 25** | Akademi sertifikası + freelancer RELEASED sözleşmesi → vize damgası zinciri gerçek ve rakiplerde yok; ağırlıklı YetkinCV eleme fikri satılabilir. Ancak kanıt sahtelenebilir, hibe köprüsü yok, B2B ürününün ödeme kapısı yok. |
| **UX / Vitrin** | %20 | **14 / 20** | Dürüst dil, sahte ilan/şirket yasağı, k-anonimlik mesajı, QR + paylaşım çubukları, `noindex` disiplini iyi. Eksik: `JobPosting`/`Person` JSON-LD yok, il filtresi ölü, ilan sayfası doğrulanmamış işverenle indexleniyor. |
| **TOPLAM** | %100 | **62 / 100** | **K1 + K2 kapatılmadan 85 eşiği matematiksel olarak ulaşılamaz.** |

### 1.3 Tek paragrafta yatırım tezi

Bu ekosistemin gerçek değeri "CV yazma"da değil, **"kanıt zinciri"**nde: Akademi sertifikası ve freelancer teslimi `career_visa_stamps` tablosuna **DB tabanlı, iptal edilebilir, hash'li** damga olarak yazılıyor (`lib/career/engine.ts:83-130`, `lib/kernel/proof/prisma-read.ts:34-52`). YetkinCV bu zincirin **en zayıf halkası** çünkü kanıtı sınav değil, sınavın *oynanamaz* olması taşır. Faz 1'de bu halka sertleştirilir ve B2B ödeme kapısı bağlanırsa ürün 85+ bandına çıkar; aksi hâlde "doğrulanmış yetkinlik" iddiası 5 tıklık bir alay konusudur.

---

## 2. Alt Sistemlerin Teknik Röntgeni

### 2.1 YetkinCV Editörü & Veri Modeli (`/career`)

**Soru: Kullanıcı CV'sini nasıl oluşturuyor/düzenliyor? Veri DB'de mi, `localStorage`'da mı?**

**Cevap: Hiçbiri. Bir CV editörü yok.** `/career` sayfası `YetkinCvStation` adlı **3 adımlı sınav akışı** basar: (1) hedef pozisyon + uzmanlık + 40–6000 karakterlik "CV özeti" metin kutusu, (2) 5 soruluk vaka testi, (3) mühürlü puan kartı.

```117:119:components/career/yetkincv-station.tsx
          Üç adım sunucuda yürür. Puan ve SHA-256 kodu bu oturumun hesabıdır. Sahte ilan ve şirket logosu basılmaz.
          İşe yerleşmeyi garanti etmez.
```

- **Adımlar:** `Adım 1 — CV girişi`, `Adım 2 — Uygulamalı vaka testi`, `Adım 3 — Mühürlü kart` (`components/career/yetkincv-station.tsx:122-135`). "CV girişi" tek bir `<textarea>`tır (`:172-181`); ad, eğitim, deneyim, tarih, şirket, beceri etiketi gibi **hiçbir alan yok**.
- **Kalıcılık: `localStorage`/`sessionStorage` YOK** (grep: `components/career`, `lib/career`, `app/api/career` içinde sıfır eşleşme). Durum React state'inde tutulur (`useState` blokları `components/career/yetkincv-station.tsx:36-45`).
- **Veritabanına ne yazılıyor?** Yazılan metin **değil**, metnin özeti:

```87:97:prisma/schema/career.prisma
/// YetkinCV oturumu. Doğru şık burada yoktur; soru kimliği bankadan okunur.
/// CV metni yazılmaz. cv_digest metnin SHA-256 özetidir.
model YetkinCvSitting {
  id          String    @id @default(cuid())
  userId      String    @map("user_id")
  roleKey     String    @map("role_key") @db.VarChar(32)
  verticalKey String    @map("vertical_key") @db.VarChar(32)
  cvDigest    String    @map("cv_digest") @db.VarChar(64)
  cvSignals   Json      @map("cv_signals")
  questionIds Json      @map("question_ids")
```

  Yazma noktası: `cvDigest: yetkinCvDigest(input.cvText)`, `cvSignals: yetkinCvSignals(input.cvText)` (`lib/career/yetkincv-store.ts:123-124`). Yani **kullanıcının yazdığı 6000 karakterlik CV, DB'ye hiç girmez** — yalnız SHA-256'sı ve kapalı sözlükten çıkan **en fazla 6 etiket** kalır:

```601:611:lib/career/yetkincv.ts
export function yetkinCvDigest(normalized: string): string {
  return sha256Hex(normalized);
}

export function yetkinCvSignals(normalized: string): string[] {
  const haystack = normalized.toLocaleLowerCase("tr");
  const hits: string[] = [];
  for (const axis of CV_AXES) {
    if (axis.needles.some((needle) => haystack.includes(needle))) {
      hits.push(axis.label);
    }
  }
  return hits.slice(0, 6);
}
```

  `CV_AXES` dokuz sabit kovadır (`lib/career/yetkincv.ts:72-83`): *stok ve sipariş, pazaryeri, hibe dosyası, bütçe, reklam, içerik, tablo, veri gizliliği, yazılım*. Yani "CV" dediğiniz şeyin üründeki toplam temsili **6 etiketlik bir kelime torbası**.

- **Şema doğrulaması gerçek mi?** Evet, ama **Zod değil** — el yazımı parser: `parseYetkinCvStart` / `parseYetkinCvSubmit` (`lib/career/yetkincv.ts:736-779`). Sınırlar gerçek: `YETKINCV_CV_MIN = 40`, `YETKINCV_CV_MAX = 6000` (`:32-33`), şık indeksi `0..7` aralığında tam sayı (`:774-776`), `sittingId` regex'i `^[a-z0-9_-]{8,40}$` (`:761`). Bu iyi.
  - **Tek istisna:** kariyerde Zod **yalnız koç sözleşmesinde** kullanılır (`lib/career/coach-contract.ts:124-176`), sınav gövdesinde kullanılmaz. İki farklı doğrulama kültürü aynı dikeyde yaşıyor (O-bulgularına ek).
- **XSS koruması gerçek mi?** **Evet, iki katmanlı ve gerçek:**
  1. Kariyer yüzeylerinde `dangerouslySetInnerHTML` **sıfır** (grep: `components/career`, `components/kurumsal`, `app/career`, `app/(public)/uzmanlar`, `app/(public)/kurumsal`, `app/(public)/vize` → eşleşme yok). React varsayılan kaçışı devrede.
  2. Yazdırma köprüsünde elle kaçış var: `escapeHtml` (`components/career/ai-career-studio.tsx:36-41`) ve `doc.write` çağrısında **hem** `<title>` **hem** `<pre>` gövdesi bu fonksiyondan geçiyor (`:59-61`). Metin element içeriğine yazıldığı için `'` kaçırılmaması risk değil.
  → **"XSS koruması var mı?" sorusunun cevabı: var.** Bu, raporun az sayıdaki tartışmasız artısındandır.

**Sonuç:** YetkinCV bir **"CV editörü" değil, 3 adımlı bir sınav istasyonudur.** Ürün adı ile ürün davranışı arasındaki bu fark, raporun en pahalı bulgusunun (K3) kaynağıdır.

---

### 2.2 Doğrulanabilir Kanıt & Mühür Zinciri

**Soru: `lib/career/tezgah-portfolio.ts` ve benzeri köprüler gerçekten çalışıyor mu?**

#### 2.2.1 Tezgâh → Portföy köprüsü: çalışıyor, ama 280 karakterlik düz metin

```4:14:lib/career/tezgah-portfolio.ts
const BODY_CAP = 280;

function excerpt(value: string): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= BODY_CAP) {
    return clean;
  }
  return `${clean.slice(0, BODY_CAP).trim()}…`;
}
```

Köprü **canlıdır**: `PortfolioAddButton` (`components/tezgah/output-portfolio.tsx:109-155`) → `POST /api/career/portfolio` (`:128`) → `attachTezgahOutputToPortfolio` (`app/api/career/portfolio/route.ts:70-76`) → `careerPortfolioItem` satırı (`lib/career/tezgah-portfolio.ts:41-50`). Idempotency anahtarı zorunlu (`app/api/career/portfolio/route.ts:42-45`), çıktı sahipliği `where: { id, userId }` ile doğrulanır (`lib/career/tezgah-portfolio.ts:24-27`) — **IDOR kapalı, testi de var** (`tests/career/idor-portfolio.test.ts`).

Ama ürün sözleşmesi zayıf:
- **Kanıt, çıktının 280 karakterlik alıntısıdır** — orijinal `tezgahOutput` satırına hash/mühür bağı yok. `sourceKey = \`tezgah:${output.id}\`` (`:31`) yalnız tekilliği sağlar; **doğrulanabilirlik sağlamaz**.
- **Mühür bağı sahte:** kamu kartı yükleyicisi, tezgâh kanıtlarını **featured (en yeni) damganın id'sine** bağlıyor gibi basıyor:

```86:90:lib/career/public-talent-load.ts
            title: item.title,
            visaStampId: featuredLive.id,
            ...(item.body ? { detail: item.body } : {}),
```

  Oysa `career_portfolio_items.visa_stamp_id` bu satırlar için **NULL**'dur (tezgâh köprüsü bu kolonu hiç yazmaz: `lib/career/tezgah-portfolio.ts:43-49`). Yani işveren, **hiçbir mühre bağlı olmayan** düz metni, bir mührün altında "Proje kanıt dosyası" başlığıyla okuyor (`components/career/public-talent-board.tsx:98-114`).
- **Kendi ekranında görünmüyor, kamu kartında görünüyor:** `listPortfolioForUser` yalnız `visaStampId: { not: null }` satırları döndürür (`lib/career/prisma-store.ts:110-114`); `/career` "kanıt" sayacı da bundan beslenir (`app/career/page.tsx:196`). Sonuç: kullanıcı "Kamu portföyüne eklendi. Mühür kartında görünür." mesajını alır (`components/tezgah/output-portfolio.tsx:141`), kendi kariyer sayfasında **0 kanıt** görür, ama kamu kartında yazı görünür → **ürün kendi kendisiyle çelişiyor** (O7).

#### 2.2.2 Akademi & Freelancer köprüsü: gerçek, DB tabanlı, iptal edilebilir

Bu zincir **dürüst**:

- Kanıt kaynağı yalnız iki tür: `ACADEMY_CERTIFICATE`, `FREELANCER_RELEASE` (`prisma/schema/career.prisma:5-8`).
- Akademi sertifikası okunurken **iptal filtresi** var: `if (row.revokedAt) return null;` (`lib/kernel/proof/prisma-read.ts:40-42`).
- Freelancer kanıtı yalnız `status === "RELEASED" && releasedAt` ise sayılır (`lib/kernel/proof/prisma-read.ts:87-92`).
- Damga + portföy satırı **tek transaction**'da yazılır (`lib/career/engine.ts:133-147`), unique ihlali 3 kez yeniden denenir (`:63-74`).
- Kamu kartı **canlı damga** ile süzülür: `projectLivePassportStamps` sonrası bulunamazsa `missing` döner, **varlık sızdırılmaz** (`lib/career/public-talent-load.ts:45-52`).
- Sızıntı testi var: `publicTalentCardHasIdentityLeak` (`lib/career/public-talent.ts:101-104`) ve `tests/career/public-talent-surface.test.ts:61`.

**YetkinHibe köprüsü: YOK.** `lib/career` altında `hibe` geçen tek yer, sınav sorusu metnidir (`lib/career/yetkincv.ts:75`) ve `lib/yetkinhibe` altında `career` geçen dosya yok (grep: 0 eşleşme). Hibede üretilen proje dosyası CV'ye **hiçbir biçimde** bağlanmıyor (Y6).

#### 2.2.3 YetkinCV mührü: DB tabanlı ama **kanıt değeri yok**

Zincir teknik olarak sağlam görünüyor: oturum açılır (`lib/career/yetkincv-store.ts:115-130`), cevaplar sunucuda iki motordan geçer, ikisi uyuşmazsa mühür basılmaz:

```182:190:lib/career/yetkincv-store.ts
  if (graded.score !== engine.score || graded.correctCount !== engine.correctCount) {
    throw new BadRequestError("Sınav motoru puanı uyuşmadı.");
  }
  const skills = yetkinCvSkillBreakdown(questions, input.answers);
  const skillCorrect = skills.reduce((sum, row) => sum + row.correct, 0);
  if (skillCorrect !== graded.correctCount) {
    throw new BadRequestError("Beceri kırılımı puanla uyuşmadı.");
  }
```

Bu **iyi mühendislik**. Ama aynı dosyanın ürettiği mühür, **cevap anahtarının kendisi sabit olduğu için** hiçbir şey kanıtlamıyor:

```107:112:lib/career/yetkincv.ts
      [
        "İki kanalın stokunu da elle 20 yazmak",
        "Satışı düşen kanalın stoğunu düşürmek ve diğer kanalı aynı depo adediyle hizalamak",
        "Ürünü her iki kanalda da yayından kaldırmak",
        "Fiyatı düşürüp stoğu yok saymak",
      ],
      1,
```

Bankadaki **25 sorunun 25'inde** `correctIndex` değeri `1`'dir (`lib/career/yetkincv.ts:110,124,138,152,166,182,196,210,224,238,254,268,282,296,310,326,340,354,368,382,398,412,426,440,454`). Çalıştırılmış kanıt:

```text
$ npx tsx -e "… her dikeyde tüm cevapları choiceIndex:1 ver …"
ecommerce {"score":100,"correctCount":5,"total":5}
grant     {"score":100,"correctCount":5,"total":5}
marketing {"score":100,"correctCount":5,"total":5}
office    {"score":100,"correctCount":5,"total":5}
software  {"score":100,"correctCount":5,"total":5}
# aynı banka, tüm cevaplar choiceIndex:0 →
ecommerce {"score":0,"correctCount":0,"total":5}
```

Yani **"hepsinde ikinci şıkkı seç"** stratejisi her dikeyde **100/100** üretir. Mühür, beceri kırılımı ve `/vize/<hash>` kartı bu puandan doğar. Bu, K1'dir.

#### 2.2.4 Dışarıdan işveren mührün gerçekliğini doğrulayabiliyor mu?

**Kısmen — "satır var mı" düzeyinde.** İşveren `/vize/<sha256>` açar; sunucu `yetkinCvSeal.findUnique({ where: { certificateHash } })` ile satırı bulur (`lib/career/yetkincv-store.ts:274-286`). Ama:

- **Yeniden hesaplama mümkün değil.** Hash girdisi `userId + sittingId + roleId + verticalId + score + issuedAt + cvDigest + skillSeal` (`lib/career/yetkincv.ts:619-640`) ve bu alanların hiçbiri kamu kartında yayınlanmaz. Dolayısıyla doğrulama = "yetkin.ai'nin DB'sinde bu hash var mı" → **tek güven kökü DB satırıdır**.
- **İmza yok, HMAC yok.** Kartın kendisi bunu dürüstçe yazıyor: *"SHA-256 doğrulama kodu. İmza değildir; sicil bütünlük kaydıdır."* (`components/career/yetkincv-card.tsx:29`). Bu dürüstlük artı, ama "mühür" kelimesinin hukuki/mahkeme değeri yok.
- **Ücretsiz mühür de kamuya açık:** `loadPublicYetkinCvByHash` `sealedPublication` filtresi **kullanmaz** (`lib/career/yetkincv-store.ts:270-287`); filtresiz okuma `/vize/[id]/page.tsx:144-176` içinde özet kart olarak basılır. Tasarım gereği ("Bu özet kart herkese açıktır" — `components/career/yetkincv-summary-card.tsx:56-58`), ancak **hash'i bilen herkes** ücretsiz mühür puanını okuyabilir.

---

### 2.3 Kamuya Açık Vitrin (`/uzmanlar` & `/vize`) & KVKK / PII

**Soru: PII sızıyor mu, maskeleme var mı?**

#### 2.3.1 PII: maskeleme gerçek, iyi tasarlanmış

| Veri | Kamu kartına yazılıyor mu? | Kanıt |
|---|---|---|
| `userId` | **Hayır** | `toPublicTalentCard` yalnız `id/title/sourceKind/issuedAt/certificateHash/courseSlug` taşır (`lib/career/public-talent.ts:66-97`) |
| E-posta | **Hayır** — ad alanında `@` varsa "Rozet sahibi" olur | `publicDisplayName` (`lib/career/talent-directory.ts:193-200`) |
| Telefon / adres | **Alan yok** (modelde telefon/adres kolonu yok) | `prisma/schema/career.prisma`, `kernel.prisma:51` yalnız `displayName` |
| `sourceId` (sözleşme no) | **Hayır** — `PassportStampSourceKind` dışarı sızmaz | `lib/career/public-talent.ts:80-97` |
| Görünen ad | **Evet** — `users.display_name` (`lib/career/talent-directory-load.ts:51`) | Tasarım gereği; kullanıcı kendi adını yayınlıyor |

Ayrıca sızıntı için **regresyon testi** var: `tests/career/public-talent-surface.test.ts:61` → `expect(publicTalentCardHasIdentityLeak(card)).toBe(false)`. Ve kart metni bunu kullanıcıya yazıyor: *"Vatandaş kimliği, e-posta ve sözleşme numarası bu kartta yoktur."* (`lib/copy/sen-voice/career.ts:155`).

**Ama iletişim mekanizması yok.** Kartta ne form, ne "iletişime geç" butonu, ne rıza kaydı var; metin *"İletişim, kartın sahibiyle senin arandadır."* diyor (`app/(public)/uzmanlar/page.tsx:74`). Pratikte **e-posta/adres olmadığı için işveren adaya ulaşamıyor** → vitrin, işlevi olmayan bir vitrin. Bu bir PII sorunu değil, **işlev boşluğudur** (Y9).

#### 2.3.2 Arama, filtreleme, sayfalama, indeks

| Konu | Durum | Kanıt |
|---|---|---|
| `take` sınırı | **YOK** — tüm mühürler ve tüm portföyler belleğe alınıyor | `lib/career/talent-directory-load.ts:43-56` ve `:58-61` (`take` yok); kamu kartı portföyünde `take: 8` var ama damga portföyünde yok (`lib/career/public-talent-load.ts:58-62`) |
| İndeks | **VAR ve yeterli**: `@@index([userId, issuedAt])`, `@@index([sealedPublication, publishedAt])`, `@@index([userId, createdAt])`, `@@index([jobId, weightedScore])` | `prisma/schema/career.prisma:27,139-140,45`; `b2b.prisma:145-147` |
| Dikey filtresi | **Çalışıyor** | `lib/career/talent-directory.ts:310-318` |
| **İl filtresi** | **ÖLÜ** — yükleyici her kaynağa `city: null` yazıyor, dolayısıyla `il` seçilince liste daima boş | `lib/career/talent-directory-load.ts:83` (`city: null,`) ↔ `lib/career/talent-directory.ts:315-317` |
| k-anonimlik | **Gerçek ve kilidi test edilmiş** (k≥5, gevşetilemez, ilçe/mahalle reddi) | `lib/career/k-anonymity.ts:8,23-26,29-36`; `tests/career/talent-directory.test.ts:32-48,90-98` |
| SEO metadata | **Var** — filtreli görünüm `noindex` | `app/(public)/uzmanlar/page.tsx:40-50` |
| JSON-LD | **Eksik** — yalnız `FAQPage` + `BreadcrumbList`; `Person`/`ItemList` yok | `app/(public)/uzmanlar/page.tsx:66-71`; `lib/copy/json-ld.ts` içinde `Person` yok |

**Kritik: kamu dizini ücretli yayını filtrelemiyor.**

```43:56:lib/career/talent-directory-load.ts
    const seals = await prisma.yetkinCvSeal.findMany({
      orderBy: { issuedAt: "desc" },
      select: {
        userId: true,
        roleKey: true,
        verticalKey: true,
        certificateHash: true,
        issuedAt: true,
        user: { select: { displayName: true } },
      },
    });
```

`where` **yok**. Oysa ürün sözleşmesi şunu vaat ediyor:

```16:19:lib/career/yetkincv-publication.ts
 * | Kamuya açık kariyer kartı + uzman dizini görünürlüğü | **290 TL (tek seferlik)** | `sealedPublication` |
```

ve şema yorumu aynı şeyi söylüyor: *"`sealedPublication` yalnız kamuya açık kartı ve uzman dizini görünürlüğünü açar."* (`prisma/schema/career.prisma:112`). Sonuç: **290 TL ödemeyen kullanıcı dizinde görünüyor** (K4). Üstelik aynı kullanıcının `/vize/hash` kartı **özet modda** açılıyor (`app/(public)/vize/[id]/page.tsx:168-174`) — yani dizin satırı tıklanınca "yayını aç" CTA'sına düşüyor. Bu, ürünün kendi satış argümanını kendi eliyle bozmasıdır.

---

### 2.4 Kurumsal İK / İşveren Eşleşme Hunisi

**Soru: Gerçek DB sorgusu mu, statik sayfa mı? Rate-limit/yetki var mı?**

**Cevap: Gerçek ve şaşırtıcı derecede olgun bir huni — ama ödeme kapısı unutulmuş.**

Huni uçtan uca kodda:

| Adım | Kanıt |
|---|---|
| İlan açma (3–5 yetkinlik, toplam ağırlık %100 zorunlu) | `lib/sales/kurumsal-screening.ts:226-259` |
| İlan kaydı + tekilliği garanti edilen slug | `lib/sales/kurumsal-screening-load.ts:99-138` |
| Kamu ilan sayfası + başvuru formu | `app/(public)/ilan/[slug]/page.tsx:84-125` |
| Aday başvurusu → oturum açma (tekrar başvuru kilidi) | `lib/sales/kurumsal-screening-load.ts:330-346` |
| Aday, **yalnız seçilen becerilerin** sorularını çözer | `lib/sales/kurumsal-screening-load.ts:358-363` (`skillIds: criteria.map(...)`) |
| Ağırlıklı puan = `round(Σ altPuan × ağırlık / 100)` | `lib/sales/kurumsal-screening.ts:150-175` |
| Kısa liste (`shortlistLimit`, baraj) ve bant yazımı | `lib/sales/kurumsal-screening.ts:269-308`; `lib/sales/kurumsal-screening-load.ts:249-275` |
| Sahip kokpiti (yalnız kendi ilanları) | `lib/sales/kurumsal-screening-load.ts:199-220` (`where: { ownerUserId }`) |
| Rate limit | `POST` 8/10dk (`app/api/kurumsal/ilanlar/route.ts:22-30`); başvuru 8/10dk (`app/api/ilan/[slug]/basvuru/route.ts:15-23`); sınav teslimi 8/10dk (`app/api/ilan/[slug]/sinav/route.ts:18-26`) |
| Yetki | `export const auth = "session"` her üç rotada; IDOR testleri yeşil (`tests/career/idor-portfolio.test.ts`, `npm run verify:idor-seals`) |
| Karşılıklı eşleşme (aday tarafı) | `/career` "açık ilanlar + puanın" kartı: `lib/career/job-match-load.ts:66-105`, `lib/career/job-matcher.ts:157-223` |

Bu, raporun **en güçlü ikinci kanıtıdır**: `weightedScreeningScore` alt puanları yalnız sunucuda yazılmış `skill_scores`'tan okur, sıfır/negatif puanı reddeder, ağırlık toplamı %100 değilse `null` döner (`lib/sales/kurumsal-screening.ts:150-175`). Aday puanı istemciden **gönderilemez**.

#### 2.4.1 Ama: ürünün fiyatı var, kapısı yok (K2)

```8:10:lib/sales/kurumsal-screening.ts
export const KURUMSAL_SCREENING_MODULE = "kurumsal" as const;
export const KURUMSAL_SCREENING_UNIT = "job-screening-pack" as const;
export const KURUMSAL_DEFAULT_MIN_SCORE = 70 as const;
```

Katalog birimi tanımlı (`lib/kernel/admin/catalog-write.ts:166-172`) ve **hiçbir yerde okunmuyor**:

```text
$ (grep) KURUMSAL_SCREENING_UNIT
.\lib\sales\kurumsal-screening.ts: 10:export const KURUMSAL_SCREENING_UNIT = "job-screening-pack" as const;
# başka eşleşme yok — app/, components/, lib/kernel/ hiçbiri bu sabiti import etmiyor
```

İlan açma yolu yalnız oturum + hız sınırı ister:

```33:39:app/api/kurumsal/ilanlar/route.ts
  try {
    const user = await requireSession(request);
    const body: unknown = await request.json().catch(() => null);
    const job = await createKurumsalJobPosting({ ownerUserId: user.id, body });
    return jsonOk({ job }, 200, requestId, request);
```

Fiyat ise sayfada **"Kurumsal Tanımlama"** etiketiyle basılıyor (`lib/sales/kurumsal-offers.ts:22-33`, `lib/pricing/showcase-price.ts:19`) ve kokpitte gösteriliyor (`components/kurumsal/screening-cockpit.tsx:180-182`). Yani **fiyatı yazan ekran ile tahsil eden ekran aynı ekran değil; tahsil eden ekran hiç yok.** `job-screening-pack` için tek bir kasa rotası mevcut değil (`app/api` altında `kurumsal/*/purchase` yok).

#### 2.4.2 Şirket kimliği doğrulanmıyor → açık PII toplama kanalı (Y1)

`companyName` **serbest metindir** ve hiçbir doğrulama/onay adımından geçmez:

```395:400:lib/sales/kurumsal-screening.ts
  const companyName = normalizeScreeningText(typeof raw.companyName === "string" ? raw.companyName : "");
  const title = normalizeScreeningText(typeof raw.title === "string" ? raw.title : "");
  const vertical = kurumsalJobVertical(typeof raw.vertical === "string" ? raw.vertical : "");
  const description = normalizeScreeningText(typeof raw.description === "string" ? raw.description : "");
```

İlan sayfası **Google'a açık**:

```40:44:app/(public)/ilan/[slug]/page.tsx
  return pageMetadata({
    title: `${job.title} — ${job.companyName}`,
    description: job.description.slice(0, 160),
    path: `/ilan/${job.slug}`,
    robots: { index: true, follow: true },
  });
```

Aday ise şu üç veriyi veriyor: ad, e-posta, 40–6000 karakter CV özeti (`components/kurumsal/job-apply-gate.tsx:226-255`), DB'ye **açık metin** yazılıyor (`prisma/schema/b2b.prisma:129-133`). Sonuç: **herhangi bir oturum sahibi, "Türkiye Petrolleri" adına indexlenen bir sayfa açıp aday e-postası ve CV toplayabilir.** Marka güveni üzerinden kimlik avı için hazır zemin. Buna karşılık: e-posta adayın kendisi tarafından yazılabiliyor (oturumdan gelen değer yalnız varsayılan, `defaultEmail={session?.email ?? ""}` `app/(public)/ilan/[slug]/page.tsx:118`) → **başkasının e-postasıyla başvuru** mümkün.

Buna ek: aday verisi için **silme/anonimleştirme yolu yok**. `yetkin_cv_seal`, `kurumsal_job_application`, `career_portfolio_item` üzerinde `delete` çağrısı hiçbir yerde yok (grep: 0 eşleşme). KVKK m.7 silme yükümlülüğü bugün **yalnız DB operatörünün elle müdahalesiyle** karşılanabilir (Y7).

---

### 2.5 CV Dışa Aktarım (PDF / DOCX / Paylaşım Linki) & AI Destekli Özellikler

**Soru: CV indirilebiliyor mu? Türkçe karakter doğru mu? AI gerçek `llm-gateway` + kota + kalkan mı?**

#### 2.5.1 Dışa aktarım: **CV için YOK** (Y5)

```text
$ (grep) pdf|docx|jspdf|puppeteer|pdfkit -i  app/career  app/uzmanlar  app/(public)  lib/career  components/career  app/api/career
app/(public)\fiyatlandirma\page.tsx:72:    label: "DOCX / ZIP İndirme",
app/(public)\fiyatlandirma\page.tsx:387: … DOCX/ZIP indirme …
# kariyer yüzeylerinde sıfır eşleşme
```

Kariyerde tek "indirme" eylemi, AI koç CV'sini tarayıcının yazdırma penceresine vermektir:

```43:66:components/career/ai-career-studio.tsx
function printCv(text: string) {
  const frame = document.createElement("iframe");
  …
  doc.write(
    `<!doctype html><html><head><title>${escapeHtml(CAREER_COACH_SEN.cvTitle)}</title></head><body><pre style="font-family:Georgia,serif;white-space:pre-wrap">${escapeHtml(text)}</pre></body></html>`,
  );
  doc.close();
  frame.contentWindow?.focus();
  frame.contentWindow?.print();
```

Değerlendirme:
- **Türkçe karakter:** tarayıcı `print()` kullandığı için **sorun yok** (metin DOM'da UTF-8). Bu, PDF üretici kütüphanesi kullanan yaklaşımlardan daha güvenli bir tesadüf.
- **Tasarım:** `<pre>` + Georgia → **ham metin dökümü**. Profesyonel CV değil; ATS uyumu, sütun düzeni, sayfa numarası, başlık hiyerarşisi yok.
- **Kalıcılık:** `dossier` yalnız React state'inde (`components/career/ai-career-studio.tsx:74`); sayfa yenilenince kaybolur. **DB'de karşılığı olan bir `CareerCv` modeli yok** (grep: `cvDocument|CareerCv|resume` → 0 eşleşme).
- **Paylaşım linki:** CV için yok; yalnız *puan kartı* için var (`/vize/<hash>`, `components/career/proof-share-bar.tsx`).

#### 2.5.2 AI Koç: **gerçek gateway, gerçek kota, gerçek kalkan** — bu bölüm örnek nitelikte

| Gereksinim | Durum | Kanıt |
|---|---|---|
| `llm-gateway` | **Evet** | `invokeLlm` (`lib/career/coach.ts:15, 88-118`) |
| Rol disiplini | **Evet** — `FAST_STREAM` | `lib/career/coach.ts:19`, `lib/kernel/ai/model-roles.ts:70` |
| Kota (burst) | **Evet** — 12/10dk kullanıcı | `app/api/career/coach/route.ts:31-34`, `lib/kernel/security/http-rate-limit.ts:30` |
| Kota (günlük) | **Evet** — 20/gün | `app/api/career/coach/route.ts:40-43`, `http-rate-limit.ts:32`; ayrıca gateway içi 20/gün (`coach.ts:105-110`) |
| Token faturalama | **Evet** — `recordUsage: true`, `AI_TOKEN_SOURCES.CAREER` | `lib/career/coach.ts:111-115` |
| Sağlayıcı sızıntı kalkanı | **Evet** — marka adına çevirir | `lib/career/coach-contract.ts:110-111, 205-206` |
| Garanti cümlesi kalkanı | **Evet** — 6 regex + zorunlu disclaimer | `lib/career/coach-contract.ts:114-121, 398-406` |
| Halüsinasyon kalkanı (rozet) | **Evet** — listede olmayan belge adı temizlenir | `lib/career/coach-contract.ts:205-231` |
| Şema doğrulama | **Evet** — Zod strict, 3 teklif / 3-6 yol haritası | `lib/career/coach-contract.ts:128-156` |
| Fail-soft | **Evet** — LLM yoksa deterministik fallback | `lib/career/coach.ts:86-124`, `:167-176` |
| Deterministik SWOT/plan | **Evet** — model çağrısı yok | `app/api/career/swot/route.ts:9` |

**Ama ATS / mülakat hazırlığı / özet yazma gibi "CV iyileştirme" özellikleri yok.** Koç, "hedef rol + deneyim + hedef" üçlüsünden **serbest metin bir taslak** üretiyor (`lib/career/coach-contract.ts:270-332`). CV alan modeli olmadığı için "ATS skoru" hesaplanacak bir yapı da yok. `CAREER_COACH_SYSTEM` prompt'unda ATS geçmiyor (`lib/career/coach.ts:21-28`).

---

### 2.6 Veritabanı, RLS ve API Yetki Mühürleri (IDOR)

| Soru | Cevap | Kanıt |
|---|---|---|
| Tablolar FORCE RLS sicilinde mi? | **Sicilde evet, canlıda doğrulanmadı** | Sicil: `lib/kernel/security/rls-policy-registry.ts:28-123`; statik eşitlik testi: `scripts/verify-rls-status.ts:168-177`; **canlı sorgu yok** (O6) |
| Kariyer tabloları sicilde mi? | **Evet** — `career_desk_tasks`, `career_portfolio_items`, `career_visa_stamps`, `yetkin_cv_seals`, `yetkin_cv_sittings`, `kurumsal_job_*`, `kurumsal_offer_requests` | Kapı 5 çıktısı |
| PostgREST yazma açık mı? | **Hayır** — INSERT/UPDATE/DELETE politikası hiç üretilmiyor, ihlal edilirse kapı kırılır | `supabase/migrations/20260814030000_rls_user_scoped_policies.sql:100`; `scripts/verify-rls-status.ts:148-150`; `rls-policy-registry.ts:126-127` |
| Sahiplik kolonu olmayan tablolar? | **`fail-closed`**: `rls_deny_unscoped … USING (false)` | `supabase/migrations/20260814030000_rls_user_scoped_policies.sql:159`; `rls-policy-registry.ts:125` |
| **Ama** `kurumsal_job_postings.owner_user_id` / `kurumsal_job_applications.candidate_user_id` sahiplik kolonu listesinde **yok** | Bu iki tablo `deny_unscoped`'a düşer → PostgREST'ten **hiç** okunamaz; yalnız Prisma (service role) üzerinden çalışır | `rls-policy-registry.ts:6-15` (`user_id, client_id, freelancer_id, bidder_id, awarded_user_id, seller_user_id, guardian_user_id` — `owner_user_id` yok) |
| IDOR riski var mı? | **Test edilmiş ve kapalı** | `tests/career/idor-portfolio.test.ts:79-116`; `verify:idor-seals` → 5 dosya / 17 test PASS |
| Uygulama katmanı sahiplik | **Doğru**: portföy `{ userId }`, ilan panosu `{ ownerUserId }`, sınav teslimi `{ sittingId, candidateUserId, job: { slug } }` | `lib/career/prisma-store.ts:110-114`; `lib/sales/kurumsal-screening-load.ts:201-203`, `:420-425` |
| Oturum sızdırma | **Kapatılmış**: `if (!sitting \|\| sitting.userId !== input.userId) throw` | `lib/career/yetkincv-store.ts:150-153` |

**Verilen hüküm:** IDOR açısından **temiz**. Tek bulgu, doğrulamanın statik kalması (O6) ve iki kurumsal tablonun sahiplik siciline alınmamış olmasıdır (fail-closed olduğu için güvenlik açığı değil, **operasyonel kırılganlık**; ileride `owner_user_id` politikası eklenirse sicil-kol listesi birlikte güncellenmeli).

---

## 3. Bulgular Tablosu

### 3.1 Kritik (yayın engelleyici)

| ID | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **K1** | **Cevap anahtarı tamamen sabit**: 25 sorunun 25'inde `correctIndex = 1`. "Hep ikinci şık" → 5/5 dikeyde 100/100. | `lib/career/yetkincv.ts:110,124,138,152,166,182,196,210,224,238,254,268,282,296,310,326,340,354,368,382,398,412,426,440,454`; runtime kanıt §2.2.3 | Doğrulanmış mühür, beceri kırılımı, `/vize` kartı, B2B ağırlıklı puan ve kısa liste **tamamı sahtelenebilir**. Ürünün tüm değer önerisi çöker. |
| **K2** | **B2B ürününde ödeme/entitlement kapısı yok**: `job-screening-pack` katalog birimi kodun hiçbir yerinde okunmuyor; ilan açma yalnız oturum ister. | `lib/sales/kurumsal-screening.ts:10`; grep: tek eşleşme; `app/api/kurumsal/ilanlar/route.ts:33-39`; kasa rotası yok (`app/api/kurumsal/` altında yalnız `ilanlar`) | 290.000 kuruşluk ürün bedava. Kurumsal gelir hattı **sıfır**; "Kurumsal Tanımlama" etiketi yanıltıcı hâle geliyor. |
| **K3** | **"YetkinCV" bir CV değil**: CV alan modeli yok; 6000 karakterlik metin atılıyor, geriye SHA-256 + ≤6 sözlük etiketi kalıyor. | `prisma/schema/career.prisma:87-97`; `lib/career/yetkincv-store.ts:123-124`; `lib/career/yetkincv.ts:601-611`; grep `cvDocument\|CareerCv\|resume` → 0 | Kullanıcı CV'sini oluşturamıyor/düzenleyemiyor. Ürün adı ile davranış çelişiyor; işverene gösterilecek bir belge hiç doğmuyor. |
| **K4** | **Ücretsiz mühürler kamu dizinine sızıyor**: `/uzmanlar` sorgusunda `sealedPublication` filtresi yok. | `lib/career/talent-directory-load.ts:43-56`; vaat: `lib/career/yetkincv-publication.ts:16-19`, `prisma/schema/career.prisma:112,129` | 290 TL'lik "dizin görünürlüğü" ayağı ilk günden çürük; ücretli yayının **2/3 faydası bedava** veriliyor (`/vize` tam kart hariç). |

### 3.2 Yüksek

| ID | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **Y1** | Şirket kimliği doğrulanmadan **indexlenen** ilan + aday PII (ad/e-posta/CV) açık metin toplama. | `lib/sales/kurumsal-screening.ts:395-400`; `app/(public)/ilan/[slug]/page.tsx:40-44`; `prisma/schema/b2b.prisma:129-133`; `components/kurumsal/job-apply-gate.tsx:226-255` | Marka güveni üzerinden kimlik avı / veri hasadı. Ayrıca `candidateEmail` kullanıcı girdisi → başkası adına başvuru. |
| **Y2** | Tezgâh kanıtı **280 karakter düz metin**; kamu kartında **yanlış mühre** bağlı gösteriliyor. | `lib/career/tezgah-portfolio.ts:4-14`; `lib/career/public-talent-load.ts:86-89`; `components/career/public-talent-board.tsx:98-114` | "Doğrulanmış proje kanıtı" etiketi altında doğrulanmamış iddia. Blok zinciri/hash bağı yok. |
| **Y3** | Sınav oynanabilir: 5 soru/dikey, tekrar sayısı sınırsız, `start`/`submit` rotalarında **hız sınırı yok**. | `lib/career/yetkincv.ts:474-478` (bank dikey başına 5); `lib/career/yetkincv-store.ts:115-130` (sayaç yok); `app/api/career/yetkincv/route.ts:12-51` (`applyHttpRateLimit` yok) | 100/100'ü 5 denemede garanti etmek mümkün; ayrıca her `start` yeni `yetkin_cv_sittings` satırı → ucuz satır şişirme. |
| **Y4** | Mühür **yeniden hesaplanamaz**, imzasız. Doğrulama = "DB'de satır var mı". | `lib/career/yetkincv.ts:619-640` (girdiler kamuya açık değil); `lib/career/yetkincv-store.ts:274-286`; `components/career/yetkincv-card.tsx:29` | İşveren için üçüncü taraf denetlenebilirliği yok; "mühür" hukuken değersiz. |
| **Y5** | CV dışa aktarım **yok** (PDF/DOCX); AI koç çıktısı kalıcı değil, yalnız tarayıcı `print()`. | §2.5.1 grep; `components/career/ai-career-studio.tsx:43-66, 74` | CV indirilemiyor → ürün bir CV ürünü olarak kullanılamıyor; ATS uyumu imkânsız. |
| **Y6** | **YetkinHibe → kariyer köprüsü yok.** Hibe projesi CV'ye hiçbir biçimde bağlanmıyor. | `lib/yetkinhibe` içinde `career` eşleşmesi 0; `lib/career` içinde `hibe` yalnız soru metni (`lib/career/yetkincv.ts:75`) | Ekosistem anlatısının ("tek kanıt zinciri") bir ayağı kopuk. |
| **Y7** | Aday/kullanıcı verisi için **silme/anonimleştirme yolu yok**. | grep `yetkinCvSeal.delete\|kurumsalJobApplication.delete\|careerPortfolioItem.delete` → 0 | KVKK m.7 ihlal riski; kurumsal satışta DPA sorusuna cevap verilemez. |
| **Y8** | Kamu vitrin & ilan **JSON-LD eksik**: `JobPosting`, `Person`, `ItemList` yok. | `app/(public)/uzmanlar/page.tsx:66-71` (yalnız FAQ + breadcrumb); `lib/copy/json-ld.ts` içinde `JobPosting` yok; `app/(public)/ilan/[slug]/page.tsx` JSON-LD basmıyor | Google İş İlanları / kişi zengin sonuçlarından **tamamen** yararlanılamıyor; B2B keşif trafiği kaybı. |
| **Y9** | Vitrinde **iletişim mekanizması yok** (form/rıza/izin). | `app/(public)/uzmanlar/page.tsx:74`; `components/career/public-talent-board.tsx` içinde iletişim bloğu yok | Dizin, işverenin adaya ulaşamadığı için **işlevsiz**; "işe alım hunisi" iddiası vitrin tarafında kopuk. |

### 3.3 Orta

| ID | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **O1** | İl filtresi **ölü**: yükleyici `city: null` yazıyor, `il` seçilince liste daima boş. | `lib/career/talent-directory-load.ts:83`; `lib/career/talent-directory.ts:315-317` | Kullanıcı "sonuç yok" sanıyor; k-anonimlik mesajı yanlış sebep gösteriyor. |
| **O2** | Dizinde **`take` yok**: tüm mühürler + tüm portföyler belleğe alınıyor. | `lib/career/talent-directory-load.ts:43-61` | Kullanıcı sayısıyla doğrusal büyüyen sorgu; soğuk başlangıç riski. |
| **O3** | Çekirdek kariyer rotalarında hız sınırı yok (`/yetkincv`, `/visas`, `/swot`, `/pulse`, `/desk`). | İlgili `route.ts` dosyalarında `applyHttpRateLimit` yok; yalnız `coach` ve `purchase` korumalı (`lib/kernel/security/http-rate-limit.ts:23-57`) | Abuse/DoS; `start` başına DB yazımı. |
| **O4** | Adayın kendi yazdığı "CV özeti" işverene **"doğrulanmamış" etiketi olmadan** gösteriliyor, doğrulanmış puanın yanında. | `components/kurumsal/screening-cockpit.tsx:373-380` | Dürüstlük ilkesiyle çelişki: 280 karakterlik iddia, 100/100 puanla aynı görsel ağırlıkta. |
| **O5** | `sealYetkinCvSitting` yarışı: paralel iki submit'te `seal` kontrolü geçilip `P2002` fırlar → kullanıcı 400 görür. | `lib/career/yetkincv-store.ts:153-166` (`findUnique` → yaz), `@@unique(...sitting_id)` `career.prisma:121` | Nadir ama kullanıcıya "hata" olarak yansıyan idempotency boşluğu. |
| **O6** | RLS doğrulaması **statik**; canlı `pg_class.relrowsecurity` kanıtı yok. | `scripts/verify-rls-status.ts:3-4` | "FORCE RLS açık" iddiası bu oturumda **kanıtlanmadı**; denetim izi eksik. |
| **O7** | Tezgâh kanıtı kullanıcının kendi ekranında **görünmüyor** (visaStampId filtresi) ama kamu kartında görünüyor. | `lib/career/prisma-store.ts:110-114`; `app/career/page.tsx:196`; `components/tezgah/output-portfolio.tsx:141` | Kullanıcı "eklendi" mesajı alıp 0 kanıt görüyor → güven kaybı. |
| **O8** | İki doğrulama kültürü: sınavda el yazımı parser, koçta Zod. | `lib/career/yetkincv.ts:736-779` ↔ `lib/career/coach-contract.ts:124-176` | Bakım maliyeti; şema değişiminde sessiz sapma riski. |
| **O9** | Ağırlıklı eleme "top-N" mantığı **barajı geçen** adayı da kesebiliyor; adaya bildirim yok. | `lib/sales/kurumsal-screening.ts:290-305`; grep `SHORTLISTED` notification → 0 | Aday, barajı geçse de "elendi" bandına düşebilir ve bunu **hiç öğrenmez**. |

---

## 4. 85+ / 100 İçin Geliştirme Planı

Hedef: **62 → 85+**. Sıralama keyfî değil; **K1/K2 kapatılmadan hiçbir pazarlama cümlesi doğru olamaz.**

### 4.1 Faz 1 — Temel Güven & İşlev (hedef: 78/100)

> Amaç: "doğrulanmış" kelimesini hak etmek ve ürünün adını doğru kılmak. **Bu faz bitmeden hiçbir B2B satış görüşmesi yapılmamalı.**

| # | İş | Kapatır | Kabul ölçütü (kanıt) |
|---|---|---|---|
| **F1.1** | **Cevap anahtarını dağıt**: her sorunun `correctIndex`'i elle farklılaştır; ek olarak **doğru şık konumunu oturum açılışında sunucuda karıştır** (`questionIds` yanında `choiceOrder` sakla). | K1, Y3 | `npx tsx` ile "hep aynı indeks" stratejisi **≥ 4/5 dikeyde baraj altı** kalır; yeni test: `tests/career/yetkincv-answer-position.test.ts` (25 sorunun indeks dağılımı tekdüze değil + en sık indeksin payı < %40). |
| **F1.2** | **Soru bankasını genişlet**: dikey başına **≥ 12 soru**, oturumda **8 rastgele** soru; `parseYetkinCvSubmit` sınırını bankaya bağla (bugün 12'ye kadar kabul ediyor, bank 5 — `lib/career/yetkincv.ts:766`). | Y3 | Bank uzunluğu testi; aynı kullanıcının iki oturumunda soru kümesi **farklı** (deterministik seed ile). |
| **F1.3** | **Deneme sayacı + hız sınırı**: `YETKINCV_MAX_ATTEMPTS` (örn. 3/30 gün) `yetkin_cv_sittings` üzerinden say; `POST /api/career/yetkincv` için `applyHttpRateLimit` ekle (mevcut `HTTP_RATE_LIMITS` deseni). | Y3, O3 | `start` 4. denemede 429; rota testi. |
| **F1.4** | **`sealedPublication` filtresini dizine bağla**: `talent-directory-load` sorgusuna `where: { sealedPublication: true }`; ayrıca ücretsiz mühür için `noindex`. | K4 | 4 ücretsiz + 1 ücretli mühürle dizin **boş**; 5 ücretli ile **dolu**. Test: `tests/career/talent-directory-publication.test.ts`. |
| **F1.5** | **B2B entitlement kapısı**: `POST /api/kurumsal/ilanlar` içinde `job-screening-pack` lisansını **aktif katalog satırı + CLEARED sipariş** üzerinden doğrula (YetkinCV yayınındaki `fulfillYetkinCvPublication` deseninin birebir kopyası: `lib/career/yetkincv-publication.ts:135-186`). Kasa rotası yoksa **ilan açma kapalı** ve CTA "Kurumsal tanımlama"ya iner. | K2 | Lisanssız ilan → 402/403; lisanslı → 200. Test + `verify:api-auth` haritası güncel. |
| **F1.6** | **CV alan modeli**: `CareerCv` tablosu (başlık, özet, deneyim[], eğitim[], beceri[], dil[], link) + `/career` içinde **gerçek editör** (adım 1: "CV'ni kur", adım 2: sınav, adım 3: mühür). CV metni **saklanır** (kullanıcı onayıyla), SHA-256 yalnız bütünlük kaydı olur. | K3 | `/career`'da alanlı form; `career_cvs` satırı; RLS siciline eklenir; `verify:rls-status` PASS. |
| **F1.7** | **PDF/DOCX dışa aktarım**: sunucu tarafı üretim (mevcut `lib/yetkinhibe/docx-document.ts` deseni yeniden kullanılabilir), Türkçe karakter testi (`ğüşıöçİı`) + A4 tek sayfa düzeni. | Y5 | İndirilen dosyada Türkçe karakter byte-testi; `Content-Type` doğru; e2e indirme testi. |
| **F1.8** | **Tezgâh kanıtını mühürle**: `attachTezgahOutputToPortfolio` yazarken `outputHash = sha256(outputContent)` + `sourceKey` sakla; kamu kartında `visaStampId: featuredLive.id` **taklidini kaldır**, kanıtı "Portföy çıktısı (imzasız)" olarak ayrı ve **etiketiyle** bas. | Y2, O7 | Kamu kartında iki ayrı bölüm: "Doğrulanmış rozetler" / "Portföy çıktıları (imzasız)". Test: `tests/career/proof-portfolio-surface.test.ts` güncellenir. |
| **F1.9** | **Vitrin iletişimi**: rıza kaydı (`contactOptInAt`) + tek kullanımlık iletişim formu (e-posta adresi **hiç** basılmaz, mesaj sunucuda iletilir, günlük kota). | Y9, Y1 | Kartta "İletişim kur" formu; e-posta HTML'de yok (`publicTalentCardHasIdentityLeak` genişletilir). |
| **F1.10** | **KVKK silme yolu**: "Hesabımı ve verilerimi sil" → `yetkin_cv_seals`, `career_cv*`, `career_portfolio_items`, `kurumsal_job_applications` için **anonimleştirme + silme** (aday satırında `candidate_email` maskelenir). | Y7 | Silme sonrası `/vize/<hash>` → `missing`; dizinde satır yok. |

**Faz 1 çıkış kapısı (definition of done):** K1-K4 kapalı, Y1-Y5 kapalı, tüm kapılar yeşil + yeni 6 test dosyası yeşil → **~78/100**.

### 4.2 Faz 2 — B2B İK & Doğrulanmış Kanıt Ekosistemi (hedef: 88/100)

> Amaç: farklılaşmayı **satılabilir** ve **denetlenebilir** kılmak.

| # | İş | Kapatır | Kabul ölçütü |
|---|---|---|---|
| **F2.1** | **İşveren kimlik doğrulaması**: vergi no / ticaret sicil alanı + "Doğrulanmış işveren" rozeti; doğrulanmamış ilan `noindex` ve "kimliği doğrulanmamış" şeridi. | Y1 | Doğrulanmamış ilan meta `robots: index:false`; kokpitte rozet durumu. |
| **F2.2** | **Kriptografik mühür**: `YetkinCvSeal` satırına sunucu HMAC imzası (`HMAC-SHA256(secret, canonicalPayload)`) + `/vize/<hash>` üzerinde **kamuya açık `signature`**; işveren için `GET /api/career/verify/<hash>` dönen `{ valid, issuedAt, score, hmac }`. | Y4 | Bağımsız doğrulama script'i (`scripts/verify-career-seal.ts`) imzayı **sunucuya sormadan** doğrular. |
| **F2.3** | **JSON-LD**: `/ilan/[slug]` → `JobPosting` (datePosted, validThrough, hiringOrganization, jobLocation), `/uzmanlar` → `ItemList` + `Person` (yalnız `hasCredential`), `/vize/<hash>` → `EducationalOccupationalCredential`. | Y8 | Rich Results Test çıktısı raporda; `lib/copy/json-ld.ts`'e 3 yeni yardımcı + test. |
| **F2.4** | **Aday bildirim hattı**: kısa listeye giriş/baraj altı → e-posta + `/career` içi bildirim; "barajı geçti ama kontenjan doldu" **ayrı bant** (`QUALIFIED_NOT_SHORTLISTED`). | O9 | Yeni bant testi; aday `/career`'da durum görür. |
| **F2.5** | **YetkinHibe köprüsü**: `hibe_applications` (onaylı/teslim edilmiş) → `CareerVisaStamp` yeni `sourceKind: YETKINHIBE_PROJECT`; `ProofReadPort` genişletilir. | Y6 | `lib/kernel/proof/prisma-read.ts` + `career.prisma` enum; iptal filtresi aynı desende; kamu kartında görünür. |
| **F2.6** | **Vitrin işe alım hunisi**: işveren → adaya "görüşme daveti" (rıza + tek kullanımlık link), aday kabul/ret; para platformdan geçmez (mevcut dürüstlük çizgisi korunur). | Y9 | Uçtan uca test: davet → kabul → aday bildirimi. |
| **F2.7** | **Dizin ölçekleme**: `take`/keyset pagination, il filtresini gerçek veriyle besle (`CareerCv.city` alanı), materyalize edilmiş `directory_cells` tablosu. | O1, O2 | 1.000 sahte satırla p95 < 150 ms; il filtresi dolu sonuç. |
| **F2.8** | **RLS canlı kanıt kapısı**: `verify:rls-status --live` (DATABASE_URL varsa `pg_class` + `pg_policies` sorgusu), yoksa `SKIP` ve raporda açık "statik" notu. | O6 | CI'da `--live` yeşil veya bilinçli SKIP logu. |
| **F2.9** | **Aday CV özeti etiketi** + isteğe bağlı "bu metin doğrulanmamıştır" şeridi kokpitte. | O4 | Kokpit görsel testi. |
| **F2.10** | **Idempotent mühür**: `sealYetkinCvSitting` yarışında `P2002` yakalanıp mevcut mührü döndür. | O5 | Paralel iki submit testi → tek mühür, iki 200. |

**Faz 2 çıkış kapısı:** Y6-Y9 kapalı, O1-O9 kapalı → **88/100**.

### 4.3 Neden 85 eşiği şu an imkânsız?

| Boyut | Bugün | Faz 1 sonrası | Faz 2 sonrası |
|---|---|---|---|
| Mimari (25) | 17 | 21 (CV modeli, entitlement, ölçekleme) | 23 |
| İşlevsellik (30) | 17 | 25 (editör + PDF/DOCX + deneme disiplini) | 27 |
| Ticari farklılaşma (25) | 14 | 18 (ödeme kapısı + gerçek kanıt) | 23 (imza + hibe + huni) |
| UX/Vitrin (20) | 14 | 14 | 17 (JSON-LD + iletişim + filtre) |
| **Toplam** | **62** | **78** | **90** |

---

## 5. Tekrar Üretilebilir Kanıt Komutları

Aşağıdaki komutlar bu rapordaki **her** iddiayı yeniden üretir. Tümü `d:\yetkin.ai` kökünde çalıştırılır (Windows PowerShell).

### 5.1 Doğrulama kapıları

```powershell
# Kapı 1 — tip
npx tsc --noEmit

# Kapı 2 — sen aksi
npm run verify:sen-axis

# Kapı 3 — kernel ↔ dikey sınırları
npm run verify:boundaries

# Kapı 4 — rota → auth haritası sapması
npm run verify:api-auth -- --check

# Kapı 5 — RLS (STATİK: canlı DB sorgulamaz)
npm run verify:rls-status

# Kapı 6 — sır taraması
npm run verify:no-secrets

# Kapı 7 — kariyer + kurumsal testleri
npx vitest run tests/career tests/kurumsal tests/sales/kurumsal-screening.test.ts

# Kapı 7b — IDOR mühürleri
npm run verify:idor-seals
```

### 5.2 K1 — Cevap anahtarının sabit olduğunun kanıtı

```powershell
# Ham indeks listesi: 25 satırın hepsi "1,"
rg -n --pcre2 "^\s+(\d),\s*$" lib/career/yetkincv.ts

# Davranışsal kanıt: her dikeyde tüm cevaplar "1" → 100/100
npx tsx -e "import { yetkinCvQuestions, gradeYetkinCvExam } from './lib/career/yetkincv'; for (const v of ['ecommerce','grant','marketing','office','software']) { const b = yetkinCvQuestions(v)!; const a = b.map(q=>({questionId:q.id, choiceIndex:1})); console.log(v, JSON.stringify(gradeYetkinCvExam(b, a))); }"
```

### 5.3 K2 — B2B ödeme kapısının yokluğunun kanıtı

```powershell
# Katalog birimi yalnız kendi dosyasında tanımlı; hiçbir tüketici yok
rg -n "KURUMSAL_SCREENING_UNIT" --glob "!node_modules" --glob "!.next" -g "!archived/**" .
rg -n "job-screening-pack" --glob "!node_modules" --glob "!.next" -g "!docs/**" -g "!tests/**" -g "!generated/**" .

# İlan açma rotasında lisans/purchase kontrolü yok
rg -n "purchase|license|entitlement|hasSeal" app/api/kurumsal/ilanlar/route.ts
```

### 5.4 K3 — CV veri modelinin yokluğunun kanıtı

```powershell
# Prisma şemasında CV belgesi modeli yok
rg -n "cvDocument|CareerCv|resume|CvProfile" prisma/schema

# Yazılan şey metin değil, digest + 6 etiket
rg -n "cvDigest|cvSignals|YETKINCV_CV_MAX|slice\(0, 6\)" lib/career/yetkincv.ts lib/career/yetkincv-store.ts
```

### 5.5 K4 — Ücretsiz mühürlerin dizine sızmasının kanıtı

```powershell
# Dizin sorgusunda sealedPublication filtresi YOK
rg -n "yetkinCvSeal.findMany" -A 14 lib/career/talent-directory-load.ts
rg -n "sealedPublication" lib/career/talent-directory-load.ts   # → eşleşme yok

# Vaat (ücretli) — karşılaştırma kaynağı
rg -n "sealedPublication" lib/career/yetkincv-publication.ts prisma/schema/career.prisma
```

### 5.6 Yüksek bulgular

```powershell
# Y1 — şirket adı serbest metin + ilan indexleniyor
rg -n "companyName = normalizeScreeningText" lib/sales/kurumsal-screening.ts
rg -n "robots: \{ index: true" "app/(public)/ilan/[slug]/page.tsx"

# Y2 — 280 karakter + sahte mühür bağı
rg -n "BODY_CAP|visaStampId: featuredLive.id|startsWith: \"tezgah:\"" lib/career/tezgah-portfolio.ts lib/career/public-talent-load.ts

# Y3 — çekirdek rotada hız sınırı yok
rg -n "applyHttpRateLimit" app/api/career/yetkincv/route.ts app/api/career/visas/route.ts   # → eşleşme yok

# Y4 — mühür girdileri kamuya açık değil (yeniden hesaplanamaz)
rg -n "yetkinCvHashPayload|computeYetkinCvHash" -A 20 lib/career/yetkincv.ts

# Y5 — kariyerde PDF/DOCX yok
rg -n "pdf|docx|jspdf|pdfkit" -i app/career lib/career components/career app/api/career   # → eşleşme yok

# Y6 — YetkinHibe ↔ kariyer köprüsü yok
rg -n "career" lib/yetkinhibe -l          # → eşleşme yok
rg -n "hibe" lib/career                    # → yalnız sınav sorusu etiketi

# Y7 — silme yolu yok
rg -n "yetkinCvSeal.delete|kurumsalJobApplication.delete|careerPortfolioItem.delete" --glob "!node_modules" -g "!archived/**" .

# Y8 — JSON-LD eksik
rg -n "JobPosting|EducationalOccupationalCredential|ItemList" lib/copy/json-ld.ts   # → eşleşme yok
```

### 5.7 Orta bulgular

```powershell
# O1 — il filtresi ölü
rg -n "city: null" lib/career/talent-directory-load.ts

# O2 — take yok
rg -n "findMany\(|take:" lib/career/talent-directory-load.ts lib/career/public-talent-load.ts

# O6 — RLS kapısı statik
rg -n "statik|Canlı DB yoksa" scripts/verify-rls-status.ts

# O6b — sahiplik kolonu sicilinde owner_user_id / candidate_user_id yok
rg -n "owner_user_id|candidate_user_id" lib/kernel/security/rls-policy-registry.ts   # → eşleşme yok
```

---

## Ek: Denetimin sınırları (dürüstlük beyanı)

1. **Canlı veritabanına bağlanılmadı.** Bu yüzden "FORCE RLS açık", "dizinde kaç gerçek uzman var", "kaç mühür ücretsiz" gibi **veri durumu** soruları cevaplanmadı; yalnız **kod durumu** denetlendi.
2. **Tarayıcı/e2e koşulmadı.** Görsel/UX değerlendirmesi bileşen kodundan okundu; gerçek ekran görüntüsü alınmadı.
3. **`npm test` (tam suite) koşulmadı.** Yalnız istenen paketler (95 test) koşuldu.
4. **Kaynak koda dokunulmadı.** Bu dosya denetimin tek yazma çıktısıdır.
