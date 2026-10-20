# Değerleme ve Pazar Master Planı — Tespit Raporu

Tarih: 20 Ekim 2026  
Kapsam: `.system_docs/Platform Değerleme_1.md`, `_2.md`, `_3.md` ile canlı ürün kodunun karşılaştırması.  
Yöntem: Yalnızca depo okundu. Üretim veritabanı, Vercel gizli değişkenleri ve canlı trafik sorgulanmadı. Kod yazılmadı, mevcut kod değiştirilmedi.

Değerleme puanları (ürün 7/10, konumlandırma 4/10, gelir ihtimali 6/10, ölçek 4/10) ölçülmüş performans değildir. Yazar da bunu söyler. Bu rapor o kanaatleri kodda doğrulanabilen karşılıklarına indirger.

---

## Değerleme Dokümanları Özet & Mevcut Kod Karşılığı

Üç doküman aynı hükme varır: ürün altyapısı satış denemesi yapabilecek durumdadır; henüz kanıtlanmamış olan şey, kimin hangi gerekçeyle ödeyeceği ve Freelancer odasının ne zaman açılacağıdır.

| Değerleme iddiası | Kod karşılığı |
| --- | --- |
| Akademi sayfasında altı eğitim, fiyatlar yaklaşık ₺890–1.290, ilk ders ücretsiz | Kayıt defterinde 14 yetişkin kart vardır. Kamuya basılan vitrin altıdır. Tohum tutarlar bu bantta kilitlidir. Kart birincil eylemi «1. Dersi Ücretsiz İzle», ikincil eylem satın almadır. |
| Junior’da 6. sınıf ve ₺5.499 paket görünür | Yıllık fiyat tohumu `549900` kuruştur (`cat_junior_yearly`). Oda açıktır. Kasa, `JUNIOR_CHECKOUT_OPEN` boşken kilitlidir. |
| Kariyer, belgenin işveren nezdindeki değerinden ayrı bir vitrindir | Sertifika `ACADEMY_CERTIFICATE` damgasına döner. Freelancer odası varsayılan kapalıdır. Yasal metin kariyeri belge vitrini sayar. |
| Satış olmaması, huniyi ölçmeden reklamla çözülmez | Yönetici hunisi vardır. Ziyaret → ücretsiz ders → ödeme adımı halkası bu hunide yoktur. |
| Freelancer’ı hemen açmamak doğru karardır; köprü kendiliğinden kurulmaz | Oda `kapali: true`, hop listesi boş, uydu uçları 410. Köprü tipi (vize damgası) yazılmış, işlem yüzeyi kapalıdır. |
| 90 günün işi yeni özellik üretmek değil, hangi ürünün kime satıldığını öğrenmektir | Kod bu öğrenmeyi taşıyacak olay sözleşmesini henüz tanımlamaz. |

Kök `/` kalıcı yönlendirmeyle `/academy` kataloğuna iner. Değerleme yazarının gördüğü ilk yüzey, soğuk iniş gövdesi değil Akademi vitrinidir. Soğuk iniş dosyası durur ve hâlâ «taslak kartlar yayında değildir» der. Yönlendirme düşerse kamu metni, yayındaki altı kursla çelişir.

Katalog başlığı «Yapay zeka eğitimi ve online kurslar»dır. Kök meta başlığı «Yapay zekâ yetkinliğini kanıtla, kariyerini mühürle»dir. Değerleme’nin istediği cümle beceri çıktısıdır («yapay zekâyı gerçek işlerde kullan»). Yayındaki cümle belge ve kariyer mührüdür. Bu, konumlandırma puanının kodda duran gerekçesidir.

---

## Sistemik ve Ticari Darboğazlar

### Akademi vitrini ve katalog

Yetişkin kayıt defteri 14 karttır: 13 kanon (`01_` … `13_`) ve kanon dışı OFF-201 (`01_office_ai_ileri`). Satın alma üç şartın birlikte doğru olmasını ister: `academy_courses.is_published`, aktif `PriceCatalogEntry`, sınav yolundaki her dersin beş medya katmanı (metin, ses, ısınma videosu, görsel, fon yatağı).

Depodaki son yayın sözü `supabase/migrations/20261005190000_vitrine_catalog_publish.sql` dosyasıdır. Bu dosya altı vitrin kartını `is_published = true` ve aktif fiyat satırıyla yazar. Super Admin sonradan tutarı veya yayın bayrağını değiştirmiş olabilir; canlı satır bu raporda okunmadı. Disk mührü, `tests/academy/media-release-seal.test.ts` sözleşmesinde bu altı slug için satış kapısını açık bekler (38 ders). Kabuk slug’ları mühür manifestosunda yoktur.

**Satışa hazır sayılan: 14 karttan 6.** Şart, yukarıdaki migration’ın üretimde uygulanmış olması ve Super Admin’in satırı kapatmamış olmasıdır.

| Kod | Slug | Tohum (KDV dahil) | Ders | Vitrin | Yayın migration | Fiyat satırı | Disk mührü |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OFF-101 | `01_office_ai` | ₺890 | 8 | var | evet | evet | evet |
| OFF-201 | `01_office_ai_ileri` | ₺1.290 | 6 | var | evet | evet | evet |
| EC-102 | `02_ecommerce_ai` | ₺990 | 6 | var | evet | evet | evet |
| SM-103 | `03_social_media_ai` | ₺890 | 6 | var | evet | evet | evet |
| PR-105 | `05_prompt_practice` | ₺1.290 | 6 | var | evet | evet | evet |
| BOT-104 | `04_chatbot_nocode` | ₺1.290 | 6 | var | evet | evet | evet |

Vitrin sırası kayıt defterindeki `vitrineOrder` alanıdır: EC-102, SM-103, PR-105, BOT-104, OFF-101, OFF-201.

Öğrenim çıktısı yalnız OFF-101’de doludur. EC-102, SM-103, BOT-104, PR-105 ve sekiz kabuk «Taze ingest bekleniyor» cümlesini taşır. OFF-201 kanon başlık haritasında olmadığı için çıktı listesi boş döner. Değerleme’nin «sayfa özellik anlatıyor, sonuç satmıyor» tespiti, mühürlü dört büyüme kursunda hâlâ açıktır. OFF-101 bu boşluğun dışındadır.

### `06_` – `13_` kabuk kurslar

Sekiz kart kanondur, tohum fiyatı taşır, vitrin sırası yoktur, ders yolu boştur, kapağı ve SEO kaydı yoktur. Son yayın migration’ı bu slug’lara satır basmaz. Eski vitrin haritası onları yayından kalkmış sayar: tarayıcı `/academy` adresine 301 alır, satış API’si 410 basar. PayTR lisans niyeti `isAcademyLicenseSaleSlug` dışındaki slug’da hata verir. Bu listeye dersi olmayan kart girmez.

| Kod | Slug | Katman | Tohum | Durum |
| --- | --- | --- | --- | --- |
| N8N-201 | `06_n8n_automation` | 2 | ₺3.900 | Kabuk. Satış yok. |
| LG-202 | `07_langgraph_agents` | 2 | ₺5.900 | Kabuk. Satış yok. |
| RAG-203 | `08_production_rag` | 2 | ₺6.900 | Kabuk. Satış yok. |
| NX-204 | `09_nextjs_ai` | 2 | ₺4.900 | Kabuk. Satış yok. |
| DA-205 | `10_data_analytics_ai` | 2 | ₺3.490 | Kabuk. Satış yok. |
| RT-301 | `11_llm_redteam` | 3 | ₺15.000 | Kabuk. Satış yok. |
| FT-302 | `12_onprem_finetune` | 3 | ₺19.000 | Kabuk. Satış yok. |
| GV-303 | `13_ai_governance` | 3 | ₺15.000 | Kabuk. Satış yok. |

Tohum tutarı kasa fiyatı değildir. Katalog satırı olmadan kart bu rakamı basmaz. Kabukları «çok yakında» vitrinine almak, değerleme’nin uyardığı hatayı büyütür: talebi kanıtlanmamış ürünü vitrine koymak.

### Ölçüm ve analytics

Değerleme’nin istediği huni: ziyaret → ücretsiz ders → ödeme adımı → satın alma.

Kodda duran yönetici hunisi başkadır:

1. kayıt (`users`)
2. cüzdan yüklemesi CLEARED (`payment_orders`, amaç `wallet-top-up`)
3. akademi satın alma SETTLED (`academy_purchases`, `sa_grant:` bağışı hariç)
4. sınav geçme
5. kariyer vize damgası (`ACADEMY_CERTIFICATE`)
6. vize kartı gösterimi (`funnel_daily_counters`, adım `vize_hit`)

Pencere bugün / 7 gün / 30 gündür. Okuma `/api/admin/funnel` üzerinden, yönetici oturumuyla yapılır. Kişi kimliği hunide taşınmaz.

Eksik olan halkalar:

- Anonim ziyaret ve kaynak (reklam, arama, doğrudan).
- Ücretsiz birinci dersin açılması ve bitmesi.
- Satın alma sayfasına veya PayTR iframe’ine gelen, henüz CLEARED olmayan niyet. Sızıntı sayacı ödeme emrini görür; emir açılmadan vazgeçen kişiyi görmez.
- İade oranı ve ikinci satın alma, huni adımı olarak yok.
- Müşteri edinme maliyeti. Harcama verisi kodda yoktur; olması da gerekmez. Olmayan şey, satışın hangi kanaldan geldiğidir.

`lib/kernel/sem/conversion.ts` kayıt ve satın alma için birinci taraf olay basar (`yetkin:conversion`). `gtag` ve Google Tag Manager yüklenmez. `dataLayer` yalnız sayfada zaten varsa beslenir. Bu, KVKK tercihidir ve doğrudur. Sonuç: tarayıcı olayı, dış analitik aracı yokken yönetim panosuna yazılmaz. Sunucu günlüğü (`sem.conversion`, `academy.license.fulfilled`, `paytr.*`) operatör izidir; huni panosu değildir.

Sıfır satışın nedeni bu huniyle ayırt edilemez. Ziyaretçi gelmiyor olabilir, ücretsiz dersi beğenmiyor olabilir veya ödeme adımında düşüyor olabilir. Üçü de aynı boş `purchase_settled` sayısını üretir.

### Env ve production readiness

Canlı gizli değerler okunmadı. Aşağısı kodun baktığı kapılardır. `.env.example` laboratuvar reçetesidir; üretim kopyası değildir.

**Hız tavanı.** `RATE_LIMIT_REDIS_REST_URL` ve `RATE_LIMIT_REDIS_REST_TOKEN` birlikte doluysa Upstash REST portu bağlanır. Biri dolu diğeri boşsa port fail-closed’dur: istek reddedilir, belleğe düşülmez. İkisi de boşsa süreç içi bellek kullanılır. Üretim, Redis çiftini zorunlu kılmaz. Çok örnekli barındırmada boş çift, tavanı örnek başına sayar. Şablon her iki anahtarı boş bırakır.

**PayTR.** Çalışma kipi dörttür: `unconfigured`, `mock`, `sandbox`, `live`.

- Mock: `PAYTR_ALLOW_MOCK_CHECKOUT=true` ve mağaza üçlüsü boş. Token basar, bakiyeye CREDIT yazmaz. `NODE_ENV=production` iken throw eder.
- Sandbox: mağaza üçlüsü ve `PAYTR_SANDBOX=1` (veya `true`). Üretimde throw eder.
- Canlı: üçlü dolu, sandbox ve mock boş.
- Şablonda `PAYTR_SANDBOX="1"` durur. Yorum, bu satırın üretime kopyalanmayacağını yazar. Üretim gizli deposu bu raporda doğrulanmadı.

Akademi kasası cüzdan bakiyesinden düşer. PayTR iframe cüzdan yüklemesidir. Lisans, CLEARED siparişin amacı `academy-license:<slug>` ise ve slug lisans listesindeyse yazılır.

**Junior kasa.** `JUNIOR_CHECKOUT_OPEN` boş, `0`, `false` veya `closed` ise kasa kilitlidir. Açık sayılan değerler `1`, `true`, `open`. Şablon boştur; varsayılan kilitlidir. Kilit kalksa bile `juniorPaytrSaleGate` canlı satışı yalnız `live` kipte, deneme mağaza numarası ve sandbox izi olmadan açar. Sandbox, üretimde Junior satışı sayılmaz. Vitrin fiyatı kasadan bağımsız okunur: ₺5.499 etiketi, ödeme kapalıyken de görünebilir. Değerleme’nin gördüğü paket budur.

**Diğer bayraklar.** `DRON_FREELANCER_OPEN` boşken Freelancer odası kapalıdır. `DRON_YOUNG_OPEN` boşken Young 410 döner. `DRON_JUNIOR_ROOM_OPEN` boşken Junior oda satırının kendi kapısı geçerlidir; satır `kapali: false` olduğu için oda açıktır. `DRON_JUNIOR_OPEN` profil masasıdır, odayı 410 yapmaz. `ACADEMY_MEDIA_READ=storage` iken ses mührü disk yerine manifesto anlığından sayılır. Şablonda bu anahtar boştur.

---

## Akademi → Freelancer Geçiş Köprüsü Durumu

Değerleme’nin dört aşaması kodda şöyle durur.

**Aşama 1 — Akademi.** Altı kursun satış kapısı depo sözleşmesinde açıktır. Öğrenci dersi bitirir, sınavı geçer, sertifika hash’i doğrulanır. Bu halka ürün olarak vardır.

**Aşama 2 — Yetkinlik ve portföy.** Sınav geçişi kariyer vize damgası üretir. Damga tipi `ACADEMY_CERTIFICATE`’tır. İlan kapısı (`lib/career/visa-gate.ts`) teklif için bu damgayı ve ilan dikeyiyle eşleşen kurs slug’ını arar. Kamuya açık vize kartı `/vize` gösterim sayar. Öğrencinin yüklediği iş dosyası, çalışan demo veya teslim paketi bu damganın parçası değildir. Köprü «belge»dir, «yapılmış iş» değildir. Değerleme’nin chatbot sonunda demo istemesi bu katmanda karşılıksızdır.

**Aşama 3 — İlk gerçek işler.** Freelancer kaydı `kapali: true`, `hops: []`, etiket «Arka plan · modül pasif». `DRON_FREELANCER_OPEN` boşken kamu yüzeyi kapalıdır. Squad ve doğrudan teklif uçları 410 döner (`lib/freelancer/satellite-gone.ts`). Eşleştirme, teslim ve anlaşmazlık bu fazda vatandaş yüzeyine çıkmaz.

**Aşama 4 — Pazaryeri.** `pazaryeri` donmuş disk odasıdır. Ayrı bir açık vitrin değildir.

Huni, `FREELANCER_RELEASE` damgasını ticari sayımdan süzer. Akademi satışı ile pazaryeri işlemi aynı sayaca yazılmaz.

Kariyer SEO metni «Teklif Kapısı işveren ağına görünürlük» der. Yasal metin aynı odayı «ücretli ilan tahtası değildir» diye bağlar. Köprü tipi yazılmış, işveren ağı ürün olarak açılmamıştır. Bu iki cümle yan yana durduğu sürece ziyaretçi, kapalı bir odayı açık bir pazar sanabilir.

Akademi büyümesi Freelancer’ı otomatik büyütmez. Kod da bunu otomatikleştirmez. Bu, değerleme ile uyumlu bir eksikliktir: erken açılmamış bir kapı. Eksik olan tasarım parçası, «bu kursu bitiren kişi şu hizmeti sunabilir» eşlemesinin veri olarak durmasıdır. Böyle bir eşleme tablosu yoktur.

---

## 90 Günlük Pazar Doğrulama ve Master Plan Teknik Haritası

Amaç marka kurmak değildir. Amaç, bir veya iki eğitimin kime, hangi kanaldan, hangi maliyetle satıldığını ölçülebilir hâle getirmektir. Takvim doldu diye sonraki aşamaya geçilmez. Her aralığın çıkış kanıtı vardır.

### Gün 1–15 — Teşhis sözleşmesi

Teknik iş, yeni kurs veya yeni oda değildir.

- Huni sözleşmesini sabitle: anonim vitrin görüntüleme, ücretsiz ders oynatma, satın alma niyeti (iframe veya kilit açılışı), SETTLED satın alma. Mevcut altı yönetici adımı yerinde kalır; önlerine bu dört adım eklenir.
- Olaylar birinci taraf sayaçta durur (`funnel_daily_counters` ile aynı aile). Üçüncü taraf çerez ve `gtag` eklenmez.
- Kaynak yalnız kampanya parametresi veya yönlendiren başlıktan, kimliksiz toplanır.
- Odak adayı kodun da desteklediği çifttir: EC-102 (e-ticaret çıktısı) ve OFF-101 (ofis çıktısı, öğrenim çıktısı dolu olan tek kart). SM-103, BOT-104, PR-105 ve OFF-201 satışta kalır; reklam ve sayfa emeği bu çiftin dışına yayılmaz.
- `06_`–`13_`, Young, Freelancer ve Junior kasa bu pencerede kapalı kalır.

Çıkış kanıtı: yönetici panosunda dört yeni adım sıfırdan büyük veya bilinçli olarak sıfır okunur. «Veri yok» ile «sıfır dönüşüm» ayrılır.

### Gün 16–30 — Satış cümlesi

- EC-102 ve OFF-101 antresinde sonuç, içerik, somut çıktı, eğitmen ve iade cümlesi aynı sırada durur. EC-102 öğrenim çıktısı ingest’i bu işin parçasıdır.
- Katalog H1, belge vaadinden önce iş çıktısını söyler. Kök meta, yönlendirme sonrası görülen Akademi cümlesiyle aynı hikâyeyi taşır.
- Soğuk iniş yedeğindeki «taslak kartlar yayında değildir» cümlesi, yayındaki altı kursla aynı gerçeği söyler.
- Kariyer meta cümlesi, kapalı Freelancer odasının sözünü vermez.

Çıkış kanıtı: ücretsiz dersi açan kişilerin satın alma niyetine oranı, sayfa değişmeden önceki pencereyle karşılaştırılabilir.

### Gün 31–60 — Küçük dağıtım

- Yalnız ölçülen iki kursa, küçük ve tarihli trafik gider. Kanal kodu huniye düşer.
- Kabuk üretim kuyruğu açılmaz. Junior kasası açılmaz.
- Ayrılma adımı (vitrin, ders, niyet, SETTLED) haftalık okunur. Reklam bütçesi, bu okuma olmadan büyütülmez.

Çıkış kanıtı: en az bir kanalda ziyaret → ücretsiz ders → niyet → satın alma sayıları aynı pencerede durur. Satış sıfırsa bile hangi adımın boş olduğu yazılır.

### Gün 61–90 — İşe yaranı büyüt

- Tamamlayan ve ikinci kursa geçen kişi, mevcut satın alma ve sınav tablolarından okunur. Yeni bir sadakat ürünü yazılmaz.
- İşletme eğitimi ve Freelancer eşlemesi görüşme notu olarak kalır. Kodda oda açılmaz.
- Freelancer kapısının açılma şartı sayıya bağlanır: tek bir dar hizmette, tekrar eden ve tamamlanmış iş. Kayıt sayısı şart değildir. Bu sayı bugün kodda üretilemez; oda kapalıdır. Şart gerçekleşmeden `DRON_FREELANCER_OPEN` açılmaz.

Çıkış kanıtı: hangi kursun ve hangi kanalın bir sonraki çeyrekte emeği alacağı, huni sayılarıyla yazılır.

---

## SEN OLSAYDIN NE YAPARDIN?

İlk 100 gerçek ödeyen müşteri için kodda atılacak üç öncelik:

1. **Ziyaretçi hunisini, satın alma hunisinin önüne yazmak.** Bugünkü pano kayıtla başlar. İlk 100 satışın neden gelmediği, ücretsiz ders ve ödeme niyeti sayılmadan bilinemez. Birinci taraf sayaç yeter. Yeni analitik şirketi gerekmez.
2. **EC-102 ve OFF-101 satış sayfasını sonuç cümlesine çekmek.** OFF-101 çıktı listesi dolu. EC-102 hâlâ ingest bekliyor. İlk para, sekiz kabuktan veya altı kartın eşit reklamından gelmez. E-ticaret satıcısı ve ofis çalışanı, değerleme’nin de seçtiği iki somut iştir. Sayfa bu iki işi anlatmadan trafik satın almak, boş huniyi pahalıya getirir.
3. **Üretim kapısını bir okuma haline getirmek.** Canlı PayTR kipi, Redis çiftinin birlikte dolu olup olmadığı ve Junior kasanın kilitli kaldığı, yönetici ekranında bayrak adı ve açık/kapalı olarak görünür. Değerler basılmaz. Bu, yeni özellik değildir. İlk tahsilatın sandbox, mock veya yarı dolu Redis ile sessizce bozulmasını keser.

Bu üçü bitmeden yeni kurs, Young odası veya Freelancer yüzeyi açmam.

## Platform Kurgusu Doğru mu?

Oda kurgusu, değerleme’nin istediği sırayla uyumludur.

Shared Kernel fiyat, ödeme, hız tavanı, huni ve damga tipini ortak tutar. Akademi, Kariyer ve Junior aynı gövdede ayrı odadır. Akademi kapısı açıktır. Kariyer belge vitrini olarak açıktır. Freelancer varsayılan kapalıdır ve hop’suzdur. Young kapalı doğar. Junior oda olarak açıktır, kasası ayrı kilitlidir. Donmuş disk odaları (`pazaryeri`, `studio`, `devlabs` ve diğerleri) kamu vitrinine yazılmaz.

Yanlış olan mimari ayrım değildir. Yanlış olan, bu ayrımın vitrin cümlesine tam yansımamasıdır. Kök meta kariyer mührünü, Akademi altı kursu, Junior ₺5.499 etiketini aynı markanın altında aynı anda gösterir. Freelancer kapalıdır; kariyer meta metni işveren ağı çağrıştırır. Strateji «önce Akademi» der. Ziyaretçinin gördüğü menü üç kitleyi birden davet eder.

Bayraklar doğru kapıyı kurmuş. Ticari odak, bayrağın varsayılanında değil, kamuya basılan cümlede dağılır.

## Gelecek MASTER PLANI

Dört katman, değerleme 3 ile aynı sıradadır. Kod yalnız üçüncü katmandadır. Dördüncü katman bugün eksik olduğu için birinci katman güncellenemez.

**Katman 1 — Strateji (şimdi kilitlenir).** İlk müşteri: küçük işletme ve ofis çalışanı. İlk ürün: EC-102 ve OFF-101. Akademi öğrenme katmanıdır. Freelancer, tekrar eden iş kanıtı olmadan açılmaz. Junior kasa ve `06_`–`13_` doksan gün boyunca üretim yatırımı almaz. Junior oda kapanmak zorunda değildir; kasası ve reklamı kapalı kalır.

**Katman 2 — Pazar doğrulama.** Müşteri görüşmesi, küçük trafik, rakip notu. Bunlar kod işi değildir. Kodun görevi, görüşmede duyulan itirazı huni adımıyla yan yana koyabilmektir.

**Katman 3 — Ürün.** Mevcut mühür, PayTR, sınav ve sertifika korunur. Eklenecek iş huninin eksik dört adımı, iki kursun sonuç metni ve üretim kapısının okunmasıdır. Kabuk fırını, pazaryeri ve Young bu katmana girmez.

**Katman 4 — Öğrenme.** Her hafta tek soru: boş olan adım vitrin mi, ücretsiz ders mi, ödeme niyeti mi, tahsilat mı? Cevap sonraki haftanın tek işini seçer. Üç iş türü durur: zorunlu (ödeme hatası, güvenlik, yanlış eğitim), stratejik (huni ve iki satış sayfası), fırsat (yeni kurs, yeni oda). Fırsat, kanıt yazılmadan stratejik sıraya girmez.

Riski sıfıra indirmek iddiası doğru değildir. Doksan gün riski azaltır: yanlış odaya emek gitmez, satışsızlık tek bir sebebe indirgenir, tahsilat yanlış PayTR kipinde sessiz kalmaz. Talep riski ancak gerçek ziyaretçiyle düşer.

## Bir Sonraki Aşamada Ne Yapılmalı?

Son Onay ve tedavi prompt’undan önce tek aksiyon vardır: **doksan günlük kilit kararını yazmak.**

Karar dört satırdır.

1. İlk iki satış kursu EC-102 ve OFF-101’dir. Diğer dört vitrin kartı satışta kalır, emek almaz.
2. `06_`–`13_`, Freelancer, Young ve Junior kasa doksan gün kapalı kalır.
3. İlk tedavi, ziyaret / ücretsiz ders / ödeme niyeti / satın alma sayaçlarıdır. Üçüncü taraf analitik yoktur.
4. Üretimde PayTR kipi `live`, sandbox ve mock boş, Redis çifti birlikte dolu veya birlikte boş olacak şekilde kontrol edilir. Yarı dolu çift kabul edilmez. Junior kasası açılmaz.

Bu dört satır Super Admin onayı olmadan tedavi prompt’u yazılmaz. Onaydan sonraki ilk kod işi huni sayaçlarıdır. Satış sayfası metni, sayaçlar en az bir pencere okunduktan sonra gelir. Yeni kurs ve oda açılışı bu sıranın dışındadır.
