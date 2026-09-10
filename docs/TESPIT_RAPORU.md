# TESPİT VE STRATEJİ ANALİZİ — yetkin.ai

| Alan | Değer |
|------|--------|
| Tarih | 9 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (teknik ve mimari denetçi) |
| Muhatap | SUPER ADMIN / Kurucu irade |
| Kaynak belgeler | `.system_docs/ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`, `OPS_RUNBOOK.md`, `README.md` |
| Kod zemini | `app/` · `lib/` · `prisma/` · `proxy.ts` · `tests/` · `scripts/` (canlı yüzey; `archived/` ve `public/media/` tarama dışı) |
| İlişkili sicil | `docs/Raporlar/TESPIT_RAPORU.md` (PayTR B2C operasyon taraması), `docs/Raporlar/TEDAVI_RAPORU.md` (uygulanan kilit), `docs/Raporlar/PAZAR_GERCEKLIGI_RAPORU.md` |
| Üslup | Tarafsız. Yeşil boyama yok. Bu belge hukuki mütalaa değildir; 6493 için avukat/BDDK danışmanı şarttır. |

---

## ÖZET — 90 SANİYEDE HÜKÜM

**Dört sorunun tek cümlelik cevabı:**

1. **6493:** Freelancer emaneti / hak ediş aktarımı lisanssız yapılırsa ödeme hizmeti ve (cüzdan üçüncü şahsa açıksa) elektronik para riski doğar. Bugünkü Akademi tahsilatı bu yasağa girmez: PayTR Merchant ile şirketin kendi dijital malını satıyorsunuz. Canlıya çıkış yolu Split değil, **doğrudan B2C tahsilattır.**
2. **Modül kayması:** Freelancer’ı askıya alıp Akademi’ye yüklenmek **doğru** karardır. “Junior” kelimesi tuzaktır: koddaki Junior, 18 yaş altı / veli odasıdır ve kapalı kalmalıdır. Başlangıç seviyesi Akademi içi paket’tir.
3. **Anayasa üçlüsü:** A Katmanı (S43, `amountMinor`, mühür) yeni gerçekle **çelişmez**; B Katmanı ve Manifesto hâlâ “dört oda eşit omurga” dili taşır. Esnetilecek yer burasıdır. A2’yi silmek intihardır.
4. **Mimari:** Amiral (modüler monolit + shared kernel) hedefleri taşır. Sürü Dron kâğıt üzerindedir ve **şimdilik öyle kalmalıdır.** Kapasite sorunu mimaride değil, nakit halkası ve içerik hızındadır.

**Tek operasyonel emir:** PayTR’yi B2C eğitim satıcısı olarak bağlayın. Freelancer’ı silmeyin, açmayın. Junior odasını açmayın. Anayasa’ya “Faz 1 işletme resmi” ekleyin; kırmızı çizgileri gevşetmeyin.

---

## 1. YASAL RİSK ANALİZİ — 6493 SAYILI KANUN

### 1.1 Kanun neyi yasaklıyor? (işletme dili)

6493 sayılı Kanun, ödeme hizmeti sunmayı ve elektronik para ihraç etmeyi **lisansa** bağlar. Lisanssız platformun üç klasik düşüşü:

| Düşüş | Ne yapınca oluşur | yetkin.ai’de karşılığı |
|-------|-------------------|------------------------|
| **Ödeme hizmeti aracılığı** | A kişisinden para alıp B kişisine aktarmak; “ben sadece emanet tutuyorum” demek muafiyet doğurmaz | Freelancer iş bedeli: işveren → platform → usta IBAN |
| **Elektronik para** | Üçüncü kişilere karşı harcanabilir, iade edilebilir, transfer edilebilir bakiyeyi kendi defterinde tutmak | Cüzdan bakiyesinin usta ödemesinde kullanılması |
| **Lisanssız çekim / havale** | Kullanıcıya “bakiyeni bankana çek” rotası açmak | `/api/wallet/withdraw` — Anayasa A2 yasaklar; kodda yok |

Kanunun ruhu basittir: **üçüncü şahıslar arasında para taşıyorsanız ödeme kuruluşusunuz.** Eğitim satıyorsanız tüccarsınız. İkisini aynı kasada karıştırmak, PayTR’nin de BDDK’nın da dosyayı “pazaryeri” diye okumasına yeter.

İç koddaki **S43** tam bu çizgidir: “ödeme kuruluşu değiliz; üçüncü kişi emaneti cüzdan DEBIT ile kilitlenemez.” Bu bir mühendislik kaprisi değil, yasağı kod diline çevirmektir.

### 1.2 Üç model, üç hukuki kimlik

```
MODEL A — Doğrudan tahsilat (B2C Merchant)
  Kart → lisanslı PSP (PayTR) → şirket merchant hesabı → kendi malınız (kurs)
  Kimlik: Satıcı. 6493 lisansı gerekmez; lisans PayTR’dedir.

MODEL B — Lisanslı pazaryeri split
  İşveren kartı → PayTR Pazaryeri → bloke → teslimde usta IBAN + platform payı
  Kimlik: Alt satıcı ağı. Para sizin kasada durmaz. PayTR lisanslı kuruluştur.
  Şart: ayrı sözleşme, alt satıcı KYC, komisyon/stopaj muhasebesi.

MODEL C — İç emanet / iç banka (YASAK)
  İşveren → sizin Wallet/Ledger → siz usta IBAN’ına gönderirsiniz
  Kimlik: Lisanssız ödeme kuruluşu. İdari para cezası + faaliyet durdurma riski.
```

**Bugünkü kod Model A’dadır.** Merchant port canlı yol; Split `MARKETPLACE_SPLIT_LIVE = false` ve `not_configured` / 503; cüzdan-fonlu emanet `EscrowWalletFundedHoldError` ile fail-closed. Model C teknik olarak doğamaz. Bu, 6493 açısından **doğru mimari tercihtir.**

### 1.3 “Cüzdan” kelimesinin gizli riski

6493 ve ikincil mevzuatta elektronik para, “ihraççı dışında kişilerce ödeme aracı olarak kabul edilen elektronik olarak saklanan parasal değer”dir. Kapalı devre — bakiyenin **yalnız ihraççının kendi malına** harcanması — kural olarak elektronik para sayılmaz.

Sizin cüzdanınız bugün bu tanıma uyar: dışarı transfer yok, kullanıcılar arası havale yok, harcama yalnız Akademi DEBIT + hazine CREDIT. Hukuken bu **mağaza kredisi / ön ödemeli bakiye**dir.

Ama üç kayma bu kalkanı deler:

1. Cüzdandan freelancer iş bedeli ödemek (üçüncü kişi kabulü).
2. Kullanıcıdan kullanıcıya bakiye göndermek.
3. Kullanılmamış bakiyeyi “nakit çek” diye pazarlamak (iade operatör kararıdır; çekim ürünü değildir).

PayTR başvurusunda ve panel dilinde “cüzdan” yerine **ön ödemeli bakiye / ön ödeme** deyin. Kod adını değiştirmek şart değil; dilekçe ve inceleme metni şart.

### 1.4 PayTR canlıya alınırken yasal engel nasıl aşılır?

PayTR sizi iki üründen birine oturtur: **Merchant (üye işyeri)** veya **Pazaryeri Split**. Karışık hikâye, karışık ret demektir.

**Aşılacak engel kod değil, sınıflandırmadır.** İncelemeci siteye bakınca “üçüncü kişiye para dağıtan pazaryeri” görürse Merchant dosyası yürümez.

Kod ve kamu yüzeyi bu sınıflandırmayı **şimdiden** destekliyor:

- `/freelancer` ve freelancer API kenarda **410**.
- Yasal gövde (`LEGAL_ACTIVITY_SCOPE_BODY`): dijital eğitim, sınav, sertifikasyon (B2C). Emanet / hakediş / usta IBAN yok.
- Ana sayfa CTA Akademi. Sitemap’te freelancer yok.
- Split bağlı değilken nakit kabulü 503.

**Canlıya çıkış hukuki protokolü (sıra bozulmaz):**

1. Başvuru kimliği: “Yapınet bünyesinde B2C dijital eğitim ve yetkinlik sınavı satışı.” NACE / sicil unvanı (gayrimenkul ve e-ticaret) ile faaliyet farkı `/hakkimizda`’da dürüstçe duruyor; uydurma unvan icat etmeyin.
2. Ürün: PayTR **Merchant iFrame**. Tek çekim. Kart verisi sizin sunucuya gelmez.
3. Bildirim URL kanonik: `https://yetkin.ai/api/paytr/callback` (iç handler aynı CREDIT kapısı).
4. İnceleme süresince Freelancer kilidi, Junior kilidi, Dron mağaza yayını ve `MARKETPLACE_SPLIT_LIVE` kapalı kalsın.
5. İlk tanık işlem: küçük tutarlı gerçek yükleme → `PaymentOrder=CLEARED` + `LedgerEntry CREDIT` → bir SKU satın alma. “Bağlı” varsayımıyla vitrin açmak, hem 6493 hem PayTR sözleşmesi açısından en pahalı hatadır.
6. Split / alt satıcı başvurusu **ayrı faz, ayrı sözleşme.** Merchant onayı Split izni değildir.

### 1.5 Doğrudan tahsilat mı, alternatif finansal model mi?

**Gün 0 ve Faz 1: doğrudan tahsilat. Alternatif değil, asıl model.**

| Model | Ne zaman | 6493 | Nakit hızı | Tavsiye |
|-------|----------|------|------------|---------|
| PayTR Merchant, kendi SKU | Şimdi | Düşük (satıcı) | Günler | **Uygulayın** |
| Kapalı devre ön ödeme → kurs DEBIT | Şimdi | Düşük; dilekçede tanımla | Aynı halka | Koruyun; çekim açmayın |
| Platform dışı fatura (kurumsal pilot) | Motor 2 | Yok (deftere nakit yazılmaz) | Yavaş | Manifesto ile uyumlu; yeşil boyamayın |
| PayTR Pazaryeri Split | Faz 2, tekrarlayan Akademi geliri varken | PSP lisanslı | Aylar | Erteleyin |
| Abonelik / üyelik (kendi içeriğe erişim) | İsteğe bağlı büyüme | Merchant ile aynı aile | Orta | Taksit yokken AOV için sonra |
| İç emanet + IBAN havale | Asla | Yüksek | Sahte hız | A2 yasağı |

**Hakediş aktarımını “şimdilik cüzdandan yaparız, sonra düzeltiriz” diye açmak, 6493’ü ihlal edip üzerine müşteri bakiyesi biriktirmektir.** Anayasa A2 ve escrow motoru bunu bilerek kapatmış. Geçici iç banka **yeniden büyütülmez** (Runbook §4 hattı).

Avukatın teyit etmesi gereken üç nokta (bu raporun yerini tutmaz): 6502 cayma / anında ifa, kullanılmamış bakiye iadesinin operatör kararı oluşu, sicil unvanı–NACE–fiili faaliyet üçlüsü.

---

## 2. MODÜL STRATEJİSİ — AKADEMİ, “JUNIOR”, FREELANCER

### 2.1 Freelancer’ı askıya almak doğru mu?

**Evet. Soğuk başlatma, lisans maliyeti ve kanıt zinciri aynı yöne işaret ediyor.**

**a) İki taraflı pazar matematiği.** İşveren yoksa freelancer gelmez; freelancer yoksa işveren gelmez. Havuz sıfırken emanet, vize kapısı ve split onboarding’i ısıtmak 6–12 ay + pazarlama bütçesi ister. Akademi tek taraflıdır: içerik hazırsa kart çekilir. Nakit döngüsü günler içindedir.

**b) 6493 maliyeti.** Motor 3 (pazaryeri komisyonu) yalnızca lisanslı Split ile yasal. O ürün Merchant’tan ayrı denetim, alt satıcı KYC ve muhasebe ister. Havuz yokken bu maliyeti ödemek, henüz var olmayan komisyon için lisans yükü taşımaktır.

**c) Tezin sırası.** Manifesto cümlesi: “Öğrendiğini mühürle. Mührün kapıyı açsın.” Mühür (Akademi) yokken kapı (Freelancer vize) boştır. Önce mühür basan kullanıcı, sonra kapı. Tersine çevirmek, vizesiz ilan tahtası olur; o pazarda zaten ucuz rakipler var.

**d) Kod zaten bu kararı vermiş.** `FREELANCER_PUBLIC_SURFACE_LOCKED = true`, `MARKETPLACE_SPLIT_LIVE = false`, Manifesto Motor 3 “Faz 2”. Karar koda karşı değil, kodun arkasından yürüyor. En ucuz stratejik hamle türü budur.

**Silmeyin.** `lib/freelancer`, Prisma freelancer şeması, emanet kaydı ve lab testleri durmalıdır. Silmek Faz 2 geri dönüşünü yakar, IDOR/prebuild zincirini kırar. Askıya almak = kamu 410 + nakit 503. Doğru kalıp Junior üretim kilididir ve zaten uygulanmıştır.

### 2.2 “Junior” kelimesini ayırın — aksi halde yanlış oda açarsınız

Kodda **Junior**, 18 yaş altı / veli doğrulamalı çocuk odasıdır. `JUNIOR_PRODUCTION_LOCKED = true`, disk `archived/app/junior`, kenar 410. Veli onayı, çocuk KVKK’sı, reşit olmayan tahsilat ve EİDS-benzeri kilit ister. PayTR B2C + 18+ yasal gövde ile **çelişir.** Açmayın.

Prompt’taki “Academy ve benzeri Junior” cümlesi büyük olasılıkla **başlangıç seviyesi eğitim** demektir. Bunun yeri ayrı oda değil, Pedagoji §F.3’tür: çok teknik konularda Temel / Orta / İleri **bağımsız satılabilir paket.** Vitrindeki Katman 1 zaten “Temel / kitlesel” katmanıdır (`01_office_ai` amiral).

| Hedef | Doğru yer | Yanlış yer |
|-------|-----------|------------|
| Yeni başlayan yetişkine Ofis AI | Akademi `01_office_ai` + Temel paket | `/junior` odası |
| 13 başlıklı yol haritası | Kanon sicil; vitrin 5 SKU | “13 eğitim satıyoruz” pazarlama yalanı |
| 18 yaş altı MEB hattı | Kapalı; ayrı hukuk projesi | PayTR incelemesi sırasında vitrin |

Büyüme döngüsü açısından doğru sıra:

```
(1) Tek taraflı satış     Akademi B2C          nakit + e-posta listesi
(2) Kanıt birikimi        Sınav + /dogrula     güven sermayesi
(3) Kariyer vitrini       Pasaport / vize      işveren henüz yokken bile hikâye
(4) İki taraflı pazar     Freelancer + Split   (1)+(2) tekrarlıyorsa
```

Kariyer odasını Freelancer ile birlikte kapatmayın. Kariyer, mühürden türetilen belge vitrinidir; nakit taşımaz, 6493’e girmez, “öğrendim” iddiasının kamu yüzüdür. Üç odalı vitrin (Panel / Akademi / Kariyer) bu yüzden doğrudur.

### 2.3 Büyüme döngüsü hükmü

Klasik platform döngüsü (işveren ↔ yetenek) **Faz 2’dir.** Faz 1 döngüsü medya şirketinin döngüsüdür: içerik → trafik → satış → mezun → yorum → daha ucuz CAC. `docs/Raporlar/PAZAR_GERCEKLIGI_RAPORU.md` bunu sayısallaştırır: ₺490’lık SKU reklamla tek başına kârlı değildir; lokomotif `01_office_ai`, kapı `05_prompt_practice`, kâr sepet + ikinci satıştır.

Freelancer’ı şimdi açmak bu döngüyü bozar: dikkat dağılır, PayTR sınıflandırması kirlenir, sıfır havuzda “iş yok” boş durumu markayı yıpratır. Akademi’ye yüklenmek “vizyonu terk etmek” değil, vizyonun **beslenme sırasını** kabul etmektir.

---

## 3. REHBER DOKÜMANLAR — ÇELİŞKİ, ESNETME, BOĞULMAMA

İncelenen asıl rehberler `/docs` altında değil, **`/.system_docs`** altındadır. `/docs` günlük rapordur; derleme fixture değildir. Bu ayrım doğrudur ve korunmalıdır.

### 3.1 Çelişki tablosu

| Belge | Ne diyor | Bugünkü gerçek | Hüküm |
|-------|----------|----------------|--------|
| **Anayasa A1–A5** | `amountMinor`, tek defter, S43, RLS/IDOR, sunucu mühür, dürüst yüzey | Kod uyguluyor | **Çelişki yok. Gevşetilmez.** |
| **Anayasa A2 Freelancer cümlesi** | “İş bedelleri Split’te emanet; usta neti IBAN’a” | Split kapalı; kamu 410 | Hedef mimari doğru, **zaman kipi yanlış** — “Faz 2’de” denmeli |
| **Anayasa B2** | Çekirdek UX: dashboard, academy, career, **freelancer** | Kamu vitrin 3 oda | **Sürtünme.** B Katmanı yaşayan not; Faz 1 vitrini yazılmalı |
| **Manifesto 1.1 gün 0 cümlesi** | Nakit yalnız Akademi; freelancer dipnot | Doğru | Koru |
| **Manifesto 1.3 hedef kitle** | Uzman + işveren eşit ağırlıkta | İşveren havuzu sıfır | Faz 1’de birincil kitle **öğrenen / kart sahibi**; işveren Faz 2 |
| **Manifesto Kural 1** | 4 ana deneyim; “eşit olgunluk yok” notu var | Not var ama oda listesi hâlâ 4 | Küçük revizyon: “Faz 1 çalışan vitrin 3; 4. oda kilitli motor” |
| **Manifesto Kural 2** | 5 garantili kapı + standart pazaryeri | Kapılar 410 arkasında | Vizyon olarak kalsın; “canlı kapı” diye okunmasın |
| **Manifesto Motor 1–3** | Akademi gün 0, kurumsal Faz 2+, pazaryeri Split sonrası | Kod ile aynı | **Çelişki yok** |
| **Pedagoji** | Aşama 1 makale; mühürlü sinema §F; 5 SKU vitrin | Amiral 6/6 ses; diğerleri makale | Yasal/stratejik çelişki **yok** |
| **Pedagoji vs “Junior odağı”** | Junior kelimesi yok; Temel/Orta/İleri paket var | Junior oda ayrı ve kilitli | Pedagoji’ye bir cümle: “Junior oda ≠ başlangıç seviyesi” |
| **OPS_RUNBOOK §1 / §12** | “Çalışan 4 oda”; Freelancer ilan çalışır; SMTP “Akademi makbuzu yok” | Kamu 410; makbuz kodu kuyruğa alındı (`academy-receipt-mail`) | **Ops sapması.** Runbook A katmanı değil ama ajanı yanıltır |

**Özet:** Kendi ipinizde boğulma riski A Katmanı’nda değil, **zaman kipinin karışmasında.** Hedef mimari (Split, vize kapısı, dört oda) ile işletme resmi (üç oda, Merchant, 5 SKU) aynı cümlede “şimdi” gibi durunca ajan ve insan tekrar freelancer yüzeyi açmaya meyleder.

### 3.2 Ne revize edilmeli, ne edilmemeli?

**Edilmeyecekler (kırmızı çizgi):**

- A1 tamsayı para ve tek defter.
- A2 lisanssız tutma / çekim yasağı ve cüzdan-fonlu emanet yasağı.
- A3 RLS/IDOR/sır.
- A4 satın alınamaz mühür.
- A5 sahte bakiye yasağı.
- Pedagoji’nin “izlemede canlı TTS yok / `--seal` olmadan bake yok” kalkanı.

Bunları “strateji değişti” diye esnetmek, 6493 ve tüketici güvenini belge eliyle delmektir.

**Edilecekler (Faz 1 işletme resmi — kısa, tarihli, B Katmanı / Manifesto):**

1. **Anayasa B2’ye üç satır:** “Faz 1 kamu vitrini Panel + Akademi + Kariyer’dir. Freelancer motor sicilinde durur, kamu 410’dur. 4. oda nakit iddiası taşımaz.” A2 freelancer paragrafının başına “Faz 2; lisanslı Split bağlıysa” zaman kipi.
2. **Manifesto 1.3:** Birincil kitle Faz 1’de B2C öğrenen. İşveren “Faz 2 alıcısı” diye etiketlensin; silinmesin.
3. **Manifesto Kural 1:** Dört oda “omurga hedefi”; eşit canlılık iddiası yok cümlesi başa alınsın. Gün 0 kahramanı Akademi zaten yazıyor — bunu B2 ile çelişmeyecek şekilde kilitleyin.
4. **Pedagoji A veya F.3:** “`/junior` odası çocuk/veli ürünüdür, üretim kilitlidir. Başlangıç seviyesi Akademi paketidir.” Tek paragraf yeter.
5. **OPS_RUNBOOK:** “Çalışan 4 oda” cümlesini Tedavi sicilindeki gibi netleştirin (motor 4 / vitrin 3). SMTP satırını güncelleyin: Akademi makbuz kuyruğu kodda vardır; canlı gönderim SMTP env’ine bağlıdır. WAV sayısı (metinde hâlâ 2 görünen yerler) Storage Contract ile hizalansın.

**Nasıl boğulmamalı:** Anayasa’yı her sprint’te yeniden yazmayın. A Katmanı yılda birkaç kez, yasa değişince dokunulur. B Katmanı ve Manifesto “işletme resmi” bölümü çeyreklik güncellenir. `/docs` raporları anayasa değildir; ajan `Tespit_Raporu.md` ile A2’yi ezemesin. Çelişkide Anayasa A bağlayıcı kalır — bu kural doğru, kalsın.

Eylül 2026 reformu (grep polisliği, kelime avı testleri → B Katmanı) boğulmayı zaten büyük ölçüde çözmüş. Kalan ip, **Faz 2 cümlelerinin Faz 1 iş emri gibi okunmasıdır.**

---

## 4. PLATFORM KURGUSU — AMİRAL GEMİSİ + SÜRÜ DRON

### 4.1 Kurgu doğru mu?

**Hedef kurgu doğrudur. Uygulama Amiral’de gerçektir, sürüde değildir. Bu asimetri bugün avantajdır.**

| Katman | Tasarım vaadi | 9 Eylül 2026 gerçeği |
|--------|----------------|----------------------|
| **Shared Kernel** | Para, kimlik, defter, idempotency, RLS tek omurga | `lib/kernel/*` — proof / marketplace / payments bounded context. Dikeyler deftere yazmaz (`proofMustNotWriteLedger`). |
| **Amiral** | Next.js App Router, RSC, oturum çerezi | Tek gövde. Akademi satış, sınav, mühür, cüzdan yükleme burada. |
| **API-First dış sözleşme** | `/api/v1` zarf `{ ok, error, requestId, apiVersion, data }` | 8 hop (Tedavi E1 sonrası). Dron donuk. Sözleşme geleceğe çek basmıştı; küçültülmesi doğru. |
| **Sürü Dron** | Native istemciler aynı kernel’i tüketir | `apps/rail-is`: `publishFrozenUntilFaz1Close`, mağaza yok, Amiral build dışlanmış. Sürü yok; tek dron bile uçmuyor. |
| **Odalar** | Dikeyler aynı kimlik/defter | Motor 4 oda; kamu 3. Donmuş 8 oda 410 + `archived/`. |

Bu, “Core + Micro-Apps” cümlesinin dürüst çevirisidir: **mikro-servis değil, mikro-yüzey.** Aynı defter, aynı kimlik, farklı kabuk. Aylık 1M istek altında monoliti bölmek mimari lüks olur; Anayasa B1 bu yüzden pragmatiktir.

### 4.2 Mimari bu hedefleri taşır mı?

**Akademi B2C hedefini taşır.** Satın alma atomik settlement, PayTR HMAC + tutar eşleşmesi, sınav sunucu puanı, sertifika SHA-256, 6502 rıza mühürü — boru hattı SKU-bağımsız. 06–13 içerik bitince altyapı değişmez. Kapasite eşiği kod değil: PayTR bildirim URL, `TRUSTED_PROXY_HOPS`, SMTP, sınav secret, ilk gerçek CLEARED satırı.

**Freelancer + Split hedefini “ileride” taşır.** Escrow motoru, split port stub, vize 403, sözleşme şeması duruyor. Taşıyamayacağı şey lisanssız nakit dağıtmaktır — ve taşımaması doğrudur.

**Sürü hedefini bugün taşımasına gerek yoktur.** v1 hop kapısı, 426 sürüm kilidi, IAP yasağı doğru mühendisliktir; sıfır kullanıcıya saat harcamayın.

### 4.3 Eksikler (mimari değil, işletme)

1. **Nakit halkası henüz canlı tanıklı değil** (bu makineden Production secret okunmaz). Mimari hazır ≠ merchant yeşil.
2. **Makbuz:** Kod kuyruğu var (`lib/kernel/notice/academy-receipt-mail.ts`); Runbook hâlâ “yok” diyor. Canlı SMTP bağlanmazsa B2C güveni ve chargeback dosyası boş kalır.
3. **İsim borcu:** Rail / Diyar / Tezgâh iç dil; kamu `yetkin.ai`. Sözlük yazılmış (`docs/Raporlar/SOZLUK.md`) — ajanlar Anayasa’yı bu sözlükle okumalı.
4. **V1’de marketplace context adı** bounded-context sicilinde durur; OpenAPI’den tag silindi. İç ad kalabilir, kamu sözleşmesi satmamalı (şu an satmıyor).
5. **İçerik hızı** mimariyi geçer: 5 compact SKU’nun 4’ü makale; sinema yalnız amiral. Pazar bunu “eksik ürün” diye okuyabilir; Pedagoji dürüstçe Aşama 1 der. Vaat dilini Aşama 3’e çekmeyin.

**Yanlış düzeltmeler:** mikro-servise bölünmek, Junior odasını açmak, dron mağazası, cüzdan-fonlu emanet “geçici”, Anayasa A2’yi “hız için” silmek.

---

## 5. SEN OLSAYDIN NE YAPARDIN?

Tarafsız cevap: **aynı askıya alma kararını verirdim; sonra üç ay boyunca mimari değil satış inşa ederdim.**

Gerekçe kısa: Havuz sıfırken pazaryeri bir fantezidir. 6493 o fantezinin faturalı halidir. Elinizdeki gerçek varlık mühürlü (ve mühürlenebilir) eğitim boru hattı ile Merchant tahsilatıdır. Vizyon cümlesi “mühür kapıyı açsın” ise önce mühür satılır. Kapıyı sonra kurarsınız; kapı çelik, menteşe lisanslı Split olur.

Yapmayacaklarım:

- Freelancer kodunu silmek veya “madem kapalı, motoru da sök” demek.
- `/junior`’ı “gençlere eğitim” diye açmak.
- Merchant onayı gelmeden Split konuşmak.
- 13 SKU’yu vitrinde 13 diye satmak.
- Yeni dron, yeni oda, yeni ödeme kuruluşu.
- Anayasa A katmanını “esnetme” adı altında delmek.

Yapacaklarım, sırayla:

1. **T3’ü canlıda yeşile boyamak.** Küçük gerçek kart işlemi → CLEARED → bir kurs → sınav ≥70 → `/academy/dogrula`. Bu halka yoksa site vitrindir, dükkân değil.
2. **SMTP + makbuzun gerçekten düşmesi.** Kod yetmez; `NOTICE_SMTP_HOST` / `NOTICE_MAIL_FROM` Production’da dolu olacak. İlk iade ve ilk PayTR chargeback’inde makbuz sizin tanığınızdır.
3. **Tek lokomotif:** `01_office_ai`. Diğer 4 SKU vitrinde dursun ama pazarlama ve içerik saati amirale. ₺490’ı kapı, ₺890’ı kâr motoru saymak (`PAZAR_GERCEKLIGI`).
4. **Anayasa/Manifesto’ya Faz 1 işletme resmi** (yukarıdaki 3.2 — yarım gün, hukuk değil mühendislik).
5. **Vaat dilini törpülemek.** “₺15–40bin’e sat” satış sayfasına girerse 6502 ayıplı hizmet kapısı aralanır. Mühür ve sınav yeterince güçlü iddia.
6. Split ve Freelancer kilidini **ancak** aylık tekrarlayan Akademi geliri ve avukatlı Pazaryeri dosyası varken konuşmak.

Platform kurgusu bence **doğru kurgulanmış, erken şişirilmiş.** Amiral + kernel, bir eğitim dükkânı ve yarın bir yetenek ağı için yeterli. Sürü Dron ve Motor 3, sermaye ve lisans gelince takılacak motorlardır; bugün şasiye kaynaklanmamalıdır. Eksik olan mimari hayal değil: canlı nakit tanığı, bir SKU’nun sokakta anlatılabilir vaadi, ve belgelerin “şimdi / sonra” kipini ayırması.

---

## 6. BİR SONRAKİ ADIM — TAM OLARAK NE YAPILMALI

Öncelik sırası. Paralel değil; 1 bitmeden 4’e geçilmez.

| Sıra | İş | Neden | Sahip |
|------|-----|--------|--------|
| **1** | PayTR Merchant canlı üçlü + Bildirim URL + `PAYTR_SANDBOX`/mock boş + `TRUSTED_PROXY_HOPS=2` | Sınıflandırma ve nakit. Kod hazır; operasyon açık. | SUPER ADMIN |
| **2** | İnsan T3 turu (kayıt → ön ödeme → SKU → sınav → doğrula). `/freelancer` ve `/junior` 410 kalsın | “Bağlı” iddiasının tek kanıtı | SUPER ADMIN |
| **3** | Production SMTP; makbuzun gerçekten gitmesi | B2C güven + chargeback | Ops |
| **4** | Anayasa B2 + Manifesto 1.3/Kural 1 + Pedagoji Junior cümlesi + Runbook sapması | Ajan ve ekip Faz 2’yi gün 0 sanmasın | Belge (A katmanı dokunulmaz) |
| **5** | `01_office_ai` pazarlama ve vaat disiplini; 06–13’e altyapı yok | Gelir Motor 1’in tek gerçek ürünü | Ürün / pedagoji |
| **6** | Split / Freelancer açılışı | Bilinçli **sonra**. Ayrı karar kaydı. | Kurucu + avukat |

**Bu haftanın yapılmayacakları:** Junior vitrini, freelancer 410 kaldırma, Dron store, mikro-servis tartışması, yeni ödeme sağlayıcısı, kanon 13’ü vitrin yapmak.

---

## 7. KARAR KAYDI (BU RAPORUN ÖNERDİĞİ)

1. **6493:** Doğrudan tahsilat (Merchant) ile gidin. İç emanet yasak. Split ayrı faz.
2. **Freelancer:** Askıda tutun (kamu 410, nakit 503). Silmeyin.
3. **Junior oda:** Kapalı. “Junior stratejisi” = Akademi Temel paketleri.
4. **Akademi:** Faz 1 kahramanı. 5 SKU vitrin, amiral ağırlık.
5. **Belgeler:** A Katmanı kilit. B Katmanı + Manifesto + Runbook’a Faz 1 zaman kipi.
6. **Mimari:** Amiral + kernel yeterli. Sürü Dron donuk. Monolit bölünmez.

---

*Bu dosya `/docs/Tespit_Raporu.md` olarak kaydedildi. Çelişkide `.system_docs/ANAYASA.md` A Katmanı bağlayıcıdır. 6493 değerlendirmesi teknik-mimari risk taramasıdır; lisans ve sözleşme için bağımsız hukuk görüşü alın.*
