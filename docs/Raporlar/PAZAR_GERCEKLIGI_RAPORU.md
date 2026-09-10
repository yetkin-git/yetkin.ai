# PAZAR GERÇEKLİĞİ RAPORU — Eğitim Kataloğu Sokak Testinden Geçer mi?

| Alan | Değer |
|------|-------|
| Tarih | 9 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (Pazar Stratejisti şapkası, Vatandaş Lisanı) |
| Girdi | `docs/Bilgiler/PAZAR_EGITIM_KATALOGU_ONERISI.md` + `docs/Raporlar/KATALOG_ANALIZ_RAPORU.md` + `lib/academy/catalog-pricing.ts` + güncel pazar verileri (web) |
| Kapsam | Kod değil, **para**: fiyat psikolojisi, CAC matematiği, KOBİ davranışı, B2C e-öğrenme dinamikleri |
| Hüküm (tek cümle) | **Katalog teknik olarak hazır ama pazarda çıplak: ₺490'lık ürün reklamla kârlı satılmaz, "₺15-40bin'e sat" vaatleri iade bombasıdır, KOBİ öğrenmek değil yaptırmak ister — ilk 30 gün tek lokomotifle (`01_office_ai`) çık, gerisini upsell/bundle yap, vaat dilini bugünden törpüle.** |

---

## ÖZET — 60 SANİYEDE ACI GERÇEK

1. **Fiyatlar "yanlış" değil, "çıpasız".** Katman 1 (₺490–1.290) global banda uygun (Coursera ₺800–1.200/ay, edX ₺500–3.000) ama Türk alıcının kafasındaki çapa **Udemy: ₺100–500**. Senin ₺490'lık ürünün, alıcının gözünde "Udemy'nin 3 katı". Bunu haklı çıkaracak tek şey sertifika + sınav + mühür + güncellik hikâyesi — bunu anlatamazsan pahalı damgası yersin.
2. **₺490'ı reklamla satmak matematik olarak zarar.** Türkiye eğitim CPC'si 2026 başında **₺8–22**, kötü kurguda kayıt başı maliyet **₺800–3.000**, iyi kurguda bile **₺400–900**. ₺490'lık ürüne ₺600 CAC harcarsan her satışta para yakarsın. Katman 1'de kâr, tek üründen değil **sepet ortalaması (AOV) + ikinci satıştan** çıkar.
3. **5 konunun 2'si painkiller, 3'ü vitamin.** Ofis AI ve Chatbot gerçek yaraya basıyor; E-ticaret AI, Sosyal Medya AI ve Prompt Pratiği ise "güzel olur" kategorisi ve **ücretsiz ikamelerle** (YouTube, Trendyol Akademi, ChatGPT'nin kendisi) boğuşuyor.
4. **KOBİ'ye "öğren" satamazsın, "yapılmışını" satarsın.** Emlakçı Voiceflow öğrenmek istemiyor; "WhatsApp'ıma bakan bir şey kur" istiyor. `04_chatbot_nocode`'un gerçek alıcısı KOBİ değil, **KOBİ'ye kurulum satacak freelancer**. Konumlandırmayı buna göre düzelt.
5. **En büyük kör nokta: aşırı vaat dili.** "10 saati 30 dakikaya indir", "KOBİ'ye ₺15-40bin'e sat", "proje başına ₺30-120bin" cümleleri satış sayfasına aynen geçerse, 6502 sayılı Kanun'da **ayıplı hizmet + Tüketici Hakem Heyeti (2026 limiti ₺186.000)** kapısını aralar. Mesafeli satışta "erişim verdim, iade yok" kalkanın (m.15 istisnası) ancak **eksiksiz ön bilgilendirme** varsa işler; vaat abartılıysa kalkan delinir.

---

## ADIM 1: FİYAT / PERFORMANS VE TÜKETİCİ PSİKOLOJİSİ

### 1.1 Fiyat bantları gerçekçi mi? (Impulse buy testi)

**Kısa cevap: Katman 1'in altı evet, üstü "düşünürüm"; Katman 2 impulse değil, taksit + ROI kararı.**

Önce çerçeveyi koyalım. Kodun dondurduğu fiyatlar (`catalog-pricing.ts`):

| SKU | Fiyat | Katman |
|-----|-------|--------|
| `05_prompt_practice` | ₺490 | K1 |
| `01_office_ai` | ₺890 | K1 (Amiral, tek sesli) |
| `03_social_media_ai` | ₺890 | K1 |
| `02_ecommerce_ai` | ₺990 | K1 |
| `04_chatbot_nocode` | ₺1.290 | K1 |
| `10_data_analytics_ai` | ₺3.490 | K2 |
| `06_n8n_automation` | ₺3.900 | K2 |
| `09_nextjs_ai` | ₺4.900 | K2 |
| `07_langgraph_agents` | ₺5.900 | K2 |
| `08_production_rag` | ₺6.900 | K2 |

Şimdi sokak gerçekleri:

**a) Alıcının kafasındaki çapa Udemy.**

Web taraması net: Türkiye'de Udemy tek kurs **₺100–500** bandında, neredeyse sürekli indirimde; globalde "liste fiyatı $100+, gerçek fiyat $10-20" kurgusu var. Coursera Plus ₺800–1.200/ay, LinkedIn Learning ₺250–400/ay, edX sertifika ₺500–3.000. Yani:

- Senin ₺490'ın = "Udemy'nin tepesi, Coursera'nın yarım ayı". **Savunulabilir ama otomatik değil.**
- Senin ₺890–1.290'ın = "Udemy'nin 2-3 katı, Coursera'nın 1 ayı". Alıcı sorar: **"Bu farkın karşılığı ne?"**
- Cevabın hazır olmalı ve tek cümle olmalı: *"Udemy'de video izlersin; burada sunucu sınavını geçip doğrulanabilir mühürlü sertifika alırsın."* Bu cümleyi her satış sayfasının ilk ekranına yazmazsan, fiyat karşılaştırmasını kaybedersin.

**b) Impulse buy eşikleri (2026 Türkiye'si).**

Dürüst dilimlerle:

| Bant | Psikoloji | Kim alır? |
|------|-----------|-----------|
| ₺490 | **Gerçek impulse.** "Bir yemek parası, denerim." Öğrenci bile kartı düşünmeden açar. | Öğrenci, meraklı, soğuk trafik |
| ₺890–990 | **"Sınırda impulse".** Çalışan için "akşam düşüneyim, yarın alırım" bandı. Reklamdan ilk dokunuşta değil, retargeting'de döner. | Beyaz yaka, KOBİ çalışanı |
| ₺1.290 | **Artık impulse değil.** Karşılaştırma yapar, yorum arar, "değer mi?" diye sorar. Satış sayfanın ve sosyal kanıtın konuşması lazım. | Bilinçli alıcı, freelancer adayı |
| ₺3.490–6.900 (K2) | **Yatırım kararı.** Taksit ister, ROI hesabı yapar ("bu parayı kaç projede çıkarırım?"), iade koşullarını okur. Tek reklamla kapanmaz; e-posta + webinar + demo gerekir. | Profesyonel, freelancer, şirket çalışanı (şirket öder umuduyla) |

**Sonuç:** Katman 1'in tamamı "kredi kartını zorlamadan alınır" — evet. Ama "anlık dürtüyle" alınır bandı yalnız **₺490**. ₺890–1.290'da dürtü yetmez, **güven + kanıt** lazım (yorum, örnek ders, sertifika örneği, `/dogrula` demosu). Katman 2'de ise impulse hayal; orada taksit ve kurumsal ödeme (şirket kartı/fatura) konuşur.

**c) Taksit ve ödeme gerçeği.**

Türkiye B2C'sinde ₺1.000 üstü sepette taksit sorusu gelir. PayTR hattın tek çekim + cüzdan bakiyesiyle çalışıyor; **taksit kurgusu yoksa ₺1.290 ve üstü sepette terk oranı yükselir.** İlk 30 günde taksit entegrasyonu yetiştiremezsen, telafi cümlesi: "tek ödeme, 365 gün lisans, sınav + mühür dahil — abonelik değil". Abonelik yorgunu kitlede bu cümle işe yarar, ama taksitin yerini tutmaz. Yol haritasına yaz.

**d) Öğrenci vs beyaz yaka ayrımı.**

- Öğrenci: ₺490'ı alır, ₺890'ı "harçlık" diye düşünür, üstünü almaz. Öğrenciye ₺1.290 satmaya çalışma; öğrenciye ₺490 sat, mezun olunca ₺1.290'ı sat.
- Beyaz yaka: ₺890–1.290'ı alır **eğer** "işte kullanırım, terfide/performansta işe yarar" ikna olursa. Ofis AI bu yüzden lokomotif (bkz. §3.1) — beyaz yakanın mesai derdine dokunuyor.
- KOBİ sahibi: ₺990'ı eğitime değil, **çözüme** verir. "Eğitim al, kendin yap" yerine "öğren, 1 haftada dükkâna uygula" dilini kurmazsan KOBİ cüzdan açmaz.

### 1.2 CAC riski: ₺490'lık ürünü reklamla satmak kârı öldürür mü?

**Kısa cevap: Evet, tek başına satarsan öldürür. Katman 1'de kârlılık "ilk satıştan" değil, "müşteri başına toplamdan" çıkar.**

**Matematik (2026 Türkiye eğitim verileriyle):**

- Eğitim CPC'si: **₺8–22** (2026 başı, Türkiye).
- Kötü kurguda kayıt başı: **₺800–3.000**. İyi kurguda (niş kitle + retargeting + doğru event): **₺400–900**.
- Senin ürün: ₺490 (KDV dahil; neti daha düşük) — üstüne PayTR komisyonu + KDV yükü binince **ürün başına net marj zaten incecik**.

Basit senaryo: ₺490'lık ürüne ₺500 CAC harcadın → **başabaşın altındasın**, daha içerik maliyetini, iade oranını, KDV'yi saymadık. ₺890'lık ürüne ₺600 CAC → nefes alıyorsun ama ölçeklenemiyorsun. Bu, "reklam açayım, Katman 1 kendi kendini finanse etsin" hayalinin **matematiksel ölümü**.

**Peki Katman 1'de kârlılık nasıl sağlanır? 5 maddelik reçete:**

1. **₺490'ı "ürün" değil "kapı" yap.** `05_prompt_practice`'i kâr merkezi sanma; onu **müşteri edinme bileti** say. Gerçek kâr, o müşteriye 7–30 gün içinde sattığın ikinci üründe (`01` veya `04`). Yani CAC'yi ₺490'a değil, **müşteri yaşam boyu değerine (LTV)** oranla. Hedef: ilk sepette olmasa da 30 günde müşteri başına **₺1.200+ ciro**.
2. **Sepeti ilk anda büyüt: bundle.** Tek ürün reklamı yerine "Ofis AI (₺890) + Prompt (₺490) = birlikte ₺1.090" gibi paketle AOV'yi CAC'nin üstüne taşı. Bundle, indirim motoru gerektirir — kodda kupon yok (§KATALOG_ANALIZ §2.2-C2), o yüzden Gün 0'da bundle'ı **sabit paket SKU'su gibi değil, sepet kampanyası gibi** elle kur (iki lisansı birlikte tanımlayan basit akış) veya ilk haftalarda e-posta ile "ikinci eğitimde %X" kuponunu manuel dağıt. Mühendislik beklemeden ticaret yap.
3. **Reklamı "satın al"a değil "önce ısın"a optimize et.** Soğuk trafiğe direkt ₺890'lık satış reklamı = pahalı CAC. Ucuz olan: ücretsiz değer (örnek ders, 10 prompt'luk PDF, 3 dakikalık Amiral ses demosu) → e-posta/WhatsApp → 3'lü e-posta serisi → satış. Eğitimde lead formu + retargeting, direkt satıştan **kat kat ucuz**. Kısıtlı bütçede (bkz. §3.1) soğuk satış reklamı yakma; ısıtma hunisi kur.
4. **Organik kanalı hafife alma — paralı kanaldan önce gelir.** E-ticaret satıcı grupları (Facebook/Telegram), KOBİ WhatsApp toplulukları, LinkedIn'de beyaz yaka içerikleri, YouTube'da "Excel'i 30 dakikaya indirdim" demoları: bunların CAC'si sıfıra yakın. İlk 30 günde reklam bütçenin yarısını **içerik üretimine** ayır (demo videoları, önce/sonra ekran kayıtları). Reklam, organik tutan içeriği büyütmek için var; tutmayan içeriği kurtarmak için değil.
5. **Metriği baştan kilitle: CAC < AOV'nin %40'ı.** Her hafta tek tabloya bak: kanal başına CAC, sepet ortalaması, 7/30 günlük ikinci satış oranı, iade oranı. CAC AOV'nin %40'ını geçerse o kanalı kıs. "Marka bilinirliği" bahanesiyle zararına reklam vermeye devam etme — kısıtlı bütçede marka, **mezun + mühür + yorum** ile yapılır, gösterimle değil.

**Net hüküm:** Katman 1 fiyatları "satılabilir" ama "reklamla tek başına kârlı" değil. Kârlılık formülü: **₺490 kapı + bundle/upsell + ısıtma hunisi + organik**. Bunu kurmadan reklam bütçesini büyütmek, kovaya su doldurmak gibi — altı delik.

---

## ADIM 2: KOBİ VE SEKTÖR GERÇEKLERİ

### 2.1 Konu seçimleri sokakta karşılık buluyor mu? (Painkiller mi, vitamin mi?)

Önce sayıyı koyalım: Ticaret Bakanlığı 2025 verisi — Türkiye'de **634.611 işletme** e-ticaret yapıyor; Trendyol'da 250bin+ satıcı, 120bini e-ihracatta. Pazar büyük, doğru. Ama **"pazar büyük" ile "eğitim alır" arası kocaman bir boşluk**. KOBİ'nin günü komisyon, kargo, iade, hesap sağlığı, reklam maliyetiyle geçiyor; "AI öğreneyim" 47. sırada.

Tek tek, acımasızca:

| SKU | Sokak testi | Painkiller / Vitamin | Dürüst gerekçe |
|-----|-------------|----------------------|----------------|
| `01_office_ai` (Ofis AI, ₺890) | ✅ **Geçer** | **Painkiller** | Beyaz yakanın mesaisi gerçek: tablo, rapor, sunum, e-posta. "Cuma 17:00'de çıkmak" vaadi somut. En geniş TAM (beyaz yaka + kamu + öğrenci + muhasebe/İK). Reklamı da kolay: önce/sonra ekran kaydı. **En az itiraz alan konu.** |
| `02_ecommerce_ai` (E-ticaret AI, ₺990) | ⚠️ **Şartlı geçer** | **Vitamin (painkiller'a çevrilebilir)** | Satıcının gerçek acısı: komisyon artışı, BuyBox/reklam maliyeti, iade oranı, hesap kapatma korkusu. "AI ile ürün açıklaması yaz" bu acıların yanında **lüks**. Üstelik Trendyol satıcıya **ücretsiz** Trendyol Akademi + Ortak AI asistanı + otomatik çeviri veriyor — sen ₺990'a "daha iyisini öğretirim" diyorsun. Satarsın **ama** dilin "açıklama yaz" değil "iade oranını düşür, reklam giderini kıs, listeleme hızını 2'ye katla" olursa. Yoksa vitamin kalır. |
| `03_social_media_ai` (Sosyal Medya/Video, ₺890) | ⚠️ **Zor geçer** | **Vitamin** | Talep var gibi görünüyor (herkes Reels istiyor) ama alıcı profili **en fiyat hassas, en sadakatsiz** kitle: genç içerik üreticisi, butikçi, emlakçı. YouTube'da binlerce ücretsiz "CapCut + AI" videosu var; Midjourney/Runway/Kling'in kendi öğreticileri bedava. ₺890'ı haklı çıkarmak için "viral formül" vaat etmen gerekir — o da overpromise bataklığı (§3.2). Reklam kreatifi olarak güçlü (görsel iş), satış kapanışı olarak zayıf. **Lokomotif yapma.** |
| `04_chatbot_nocode` (Kodsuz Chatbot, ₺1.290) | ✅ **Geçer — ama alıcısı KOBİ değil** | **Painkiller (yanlış kapıda)** | KOBİ'nin WhatsApp/randevu kaçırma acısı **gerçek**. Ama emlakçı/klinik sahibi Voiceflow öğrenmek istemiyor; **"kur, çalışsın"** istiyor. Bu eğitimin gerçek alıcısı: KOBİ'ye kurulum satacak **freelancer / yeni mezun / ajans çalışanı**. Katalog "klinikler, restoranlar alır" diyor — hayır, onlar **hizmet alır, eğitim almaz**. Satış dilini "KOBİ'ye satılacak meslek" diye kurarsan painkiller; "KOBİ kendin kur" diye kurarsan hayal kırıklığı. Fiyatı K1'in tepesi (₺1.290) — freelancer'a ROI ile satılır ("1 kurulumda çıkar"), KOBİ'ye satılmaz. |
| `05_prompt_practice` (Prompt, ₺490) | ⚠️ **Kapı olarak geçer, ürün olarak zor** | **Vitamin (kapı ilacı)** | "AI saçmalıyor" şikâyeti yaygın ama **₺490 ödeyecek kadar acıtmıyor** — çünkü cevabı YouTube'da bedava. Tek başına değer önergesi zayıf. Gücü: ucuz, hızlı, hediye edilebilir. **Görevini bil: müşteri kapısı + sepet ekleyici.** Asla amiral yapma, asla tek başına reklamla satmaya çalışma (§1.2). |

**Sokak özeti:** 01 ve 04 (doğru alıcıyla) para eder; 02 dil değişirse eder; 03 ve 05 tek başına taşımaz, **destek rolü** oynar. Kataloğun "%80 kitlesel" iddiası kitle büyüklüğü olarak doğru, **ödeme isteği olarak iyimser**.

### 2.2 "n8n Otomasyon" (₺3.900) freelancer için faturaya dönüşür mü? Şirketler hazır mı?

**Kısa cevap: Dönüşür — ama kataloğun yazdığı kadar hızlı, kolay ve yüksek bedelle değil. "₺30-120bin proje" cümlesi bugünün Türkiye'sinde istisna, kural değil.**

Dört soğuk gerçek:

1. **Türk KOBİ'sinin otomasyona bağlanacak sistemi çoğu zaman yok.** n8n'in değeri ERP + CRM + e-fatura + e-posta + WhatsApp birbirine bağlanınca çıkar. Ortalama KOBİ'de ERP "Excel", CRM "defter + WhatsApp", e-fatura "muhasebecide". Otomasyon danışmanı önce **dijitalleşme satmak** zorunda, sonra otomasyon. Bu, satış döngüsünü uzatır ve proje bedelini aşağı çeker. Kurumsal (50+ çalışan) tarafta talep gerçek ama orada da alım **eğitimli freelancer'dan değil, referanslı ajans/partnerden** yapılır.
2. **"n8n"yi KOBİ bilmiyor, bilse de güvenmiyor.** Karar verici "n8n" duyunca değil, "e-faturalarım otomatik işlensin, WhatsApp siparişlerim Excel'e düşsün" duyunca cüzdan açar. Freelancer'ın işi teknik değil, **tercümanlık**: n8n'i değil, sonucu satmak. Eğitim bunu öğretmiyorsa (satış + keşif + teklif şablonu + 2-3 hazır şablon proje), mezun sertifikayla kalır, faturayla değil.
3. **Freelance pazarında otomasyon ilanları var ama sığ.** Bionluk/Armut/Upwork'te "WhatsApp entegrasyonu", "Excel otomasyonu", "Make/n8n kurulumu" işleri dönüyor — ama birim fiyatlar kataloğun "₺30-120bin" bandının **çok altında başlıyor** (ilk işler genelde 4 haneli–düşük 5 haneli). ₺30bin+ projeler referanslı, portföylü, kurumsal müşterili profile gidiyor. Yani eğitim → ilk fatura arası **haftalar değil aylar**, ilk fatura da "kira ödeten" değil "harçlık" seviyesi. Bunu saklayıp "hemen faturaya dönüşen alan" yazmak, mezunu hüsrana + iadeye iter (§3.2).
4. **Şirketler "hazır" değil, "meraklı".** 2026'da her genel müdür "AI bir şeyler yapalım" diyor; bütçe onayı veren az. Otomasyon bütçesi genelde **pilot** ile açılır (küçük, ucuz, ispatlı), büyüğü sonra gelir. Freelancer'a düşen: pilotu ucuza kapatıp büyüme hikâyesi yazmak. Eğitimde "pilot kapatma" öğretilmiyorsa, teknik bilgi rafta kalır.

**Dürüst konumlandırma önerisi (eğitim satış sayfasına):**

- Yazma: *"Proje başına ₺30-120bin kazanın."*
- Yaz: *"İlk 90 günde 1-2 pilot iş kapatacak kadar n8n + keşif + teklif seti. Mezun portföyü: 3 hazır şablon (e-fatura→Excel, form→WhatsApp→CRM, günlük rapor otomasyonu). Büyük projeler referansla gelir — bu eğitim referansın ilk tuğlası."*

Bu dil daha az "sexy", ama **iade oranını ve hüsranı yarıya indirir**. Katman 2'de güven, abartıdan değerlidir — çünkü alıcı profesyonel ve yalanı koklar.

**n8n hükmü:** Katman 2'nin ilk adayı olarak `06` doğru seçim (operasyoncuya yakın, en B2C-benzeri). Ama lansman dilini "hemen fatura" değil **"90 günde ilk pilot"** diye kur. Şirket tarafı için de B2B hamlesini eğitimden değil, **mezun freelancer havuzundan** düşün: şirketler eğitim almaz, **eğitimli adam ister**. (Bu, freelancer odası vizyonuyla da hizalı — ama oda kapalıysa söz verme.)

---

## ADIM 3: DÜŞÜNCE & TAVSİYE (KRİTİK SORULAR)

### 3.1 SEN OLSAYDIN NE YAPARDIN? (Kısıtlı bütçe, ilk 30 gün)

**Roller (5 vitrin ürünü):**

| Rol | SKU | Neden o? |
|-----|-----|----------|
| **🍫 Truffle / Lokomotif (tek ürün)** | `01_office_ai` (₺890) | En geniş TAM + en somut painkiller + **tek sesli ürün** (demo edilebilir fark) + fiyatı impulse sınırında. Reklamın %70'i buraya. Slogan: *"Cuma 17:00'de çık."* |
| **🚪 Kapı / Tripwire** | `05_prompt_practice` (₺490) | Satış değil **liste inşası**. Reklamın %10'u + organik hediye. Görevi: e-posta + ilk kart açılışı. Kâr beklenmez, ikinci satış beklenir. |
| **💰 Upsell / Ciro taşıyıcı** | `04_chatbot_nocode` (₺1.290) | En yüksek K1 fiyatı + freelancer ROI hikâyesi ("1 kurulumda eğitim parasını çıkar"). 01/05 alanlara 3–7 gün içinde e-posta ile satılır. Reklamın %15'i (freelancer kitleye ayrı set). |
| **🧺 Sepet doldurucu (bekle)** | `02_ecommerce_ai` (₺990) | Mevsimsellik + ücretsiz rakip (Trendyol Akademi) var. Vitrinde dursun, ilk 30 gün reklam yemesin. 02'ye gidecek bütçe, 01'in retargeting'ine gitsin. |
| **🎨 Kreatif yakıtı (bekle)** | `03_social_media_ai` (₺890) | Reklam görseli üretmek için biçilmiş kaftan ama satış kapanışı zayıf. İlk 30 gün **ürün olarak değil, içerik olarak** kullan: "Bu videoyu AI ile 10 dakikada yaptık — nasılını eğitimde gösteriyoruz" diye 01'e trafik çek. |

**Neden 01, neden 05 değil?** 05 ucuz diye lokomotif yapmak klasik hata: ucuz ürün çok müşteri getirir, **az para** getirir ve CAC'yi (§1.2) karşılamaz. 01 ise hem hacim (beyaz yaka kitlesi devasa) hem marj (₺890) hem fark (sesli Amiral) veriyor. Reklamda 10 saniyelik ses demosu + "Excel 3 saat → 20 dakika" ekran kaydı, 05'in "daha iyi prompt" vaadinden 5 kat iyi döner.

**İlk 30 gün bütçe planı (kısıtlı varsayım: örn. ₺50–100bin toplam):**

| Kalem | Pay | Ne yapılır? |
|-------|-----|-------------|
| 01 lokomotif reklam (Meta + Google marka) | %45 | 2-3 kreatif (ekran kaydı + ses demosu + önce/sonra). Soğuk + retargeting ayrı set. Metrik: CAC < ₺350. |
| Isıtma hunisi (lead magnet + e-posta) | %15 | Ücretsiz: "Ofiste AI ile 10 hazır prompt + 1 örnek ders". E-posta serisi 3 mail (değer → kanıt → teklif). |
| İçerik üretimi (organik) | %20 | Haftada 3 demo videosu (YouTube Shorts/Reels/LinkedIn). Maliyet: zaman + kurgu. CAC'si sıfır, bileşik getirisi var. |
| 04 freelancer seti | %10 | Ayrı kitle (Bionluk/Upwork ilgisi, "freelance" hedefleme). Dil: meslek + ROI. |
| Ölçüm + tampon | %10 | `/dogrula` demosu, yorum toplama, iade karşılama, sürpriz gider. |

**30. gün karar kuralı:** 01'in CAC'si ₺350'nin altında + ikinci satış oranı %15'in üstündeyse → bütçeyi 2'ye katla ve 06 (n8n) hazırlığına başla. Değilse → reklamı büyütme, **teklifi ve sayfayı** düzelt (fiyat değil, anlatım sorunu vardır).

### 3.2 KÖR NOKTAMIZ NE? (Aşırı vaat + iade haritası)

**Kör nokta tek cümleyle: katalog "öğretince para kazanılır" varsayıyor; pazar "öğrenince değil, uygulayınca ve satınca para kazanılır" diyor. Aradaki boşluk = hüsran + iade.**

**a) Overpromise riski taşıyan başlıklar (satış diline geçmeden törpüle):**

| Katalog cümlesi | Risk | Törpülenmiş hali |
|-----------------|------|------------------|
| "Haftalık 10-15 saati 30 dakikaya indir" (01) | 🟡 Orta. Gerçek kullanıcıda 3 saat → 1 saat daha tipik. 30 dk istisnayı kural gibi satmak, "ben yapamadım" iadesi getirir. | *"Düzenli tablolarda saatleri dakikalara indiren iş akışları — ilk haftada 3 hazır şablonla başla."* Ölçülebilir, inkâr edilemez. |
| "KOBİ'ye ₺15-40bin'e satılabilen pratik gelir kapısı" (04) | 🔴 **Yüksek.** Bu bir fiyat garantisi gibi okunur. Mezun ilk teklifinde ₺5bin duyunca "kandırıldım" hisseder → şikâyet + iade + ekşi yorum. | *"Freelancer'ların KOBİ'lere sattığı kurulum paketlerinin tipik aralığı; ilk işini kapatman için keşif + teklif şablonu dahil."* Aralık + şart + araç. |
| "Proje başına ₺30-120bin en hızlı faturaya dönüşen alan" (06) | 🔴 **Yüksek.** Katman 2 alıcısı profesyonel; abartıyı koklar ve güveni gider. Üstelik ispat yükü sende. | *"Referanslı profillerde görülen proje bandı; bu eğitim ilk pilotunu kapatacak set — büyük projeler referansla gelir."* (§2.2) |
| "Dakikalar içinde profesyonel Reels/video/afiş" (03) | 🟡 Orta. Araç çıktıları "profesyonel" değil "iyi taslak" seviyesi; müşteri beğenmezse suç eğitime kalır. | *"Taslak üretim hızını 10'a katla; final dokunuşu yine sende."* Dürüst ve hâlâ satar. |
| "Doğrudan ciro artıran somut ticari karşılık" (02) | 🟡 Orta. Ciro artışı AI açıklamasından değil fiyat/kargo/yorumdan gelir. Nedensellik iddiası ispatlanamaz. | *"Listeleme hızı + açıklama kalitesi artar; ciro etkisi mağazana göre değişir."* |
| "En yüksek saatlik ücrete sahip uzmanlık" (2.2 ajanlar) | 🔴 Yüksek (Katman 2 lansmanında). Global Upwork verisiyle desteklenmeden yazma. | Lansmana kadar bu cümleyi vitrine çıkarma; çıkarken kaynaklı yaz. |

**b) Chargeback / iade mekaniği (hukuki zemin, avukat değil stratejist notu):**

- **Cayma hakkı:** Mesafeli satışta genel kural 14 gün. Ama **erişim anında ifa + açık onaylı ön bilgilendirme** varsa (Mesafeli Sözleşmeler Yönetmeliği m.15/ğ-h), online eğitimde cayma istisnası doğar — TRT Akademi ve benzerleri bunu sözleşmeye aynen yazıyor. **Senin sözleşmende bu madde + onay kutusu (checkbox) + "erişimle ifa başlar" cümlesi yoksa, istisna doğmaz ve 14 gün iade kapın açık kalır.** Lansmandan önce hukuk metnini kilitle (purchase akışında 6502 rızası zaten var — metni bu istisnayı açıkça saysın).
- **Ayıplı hizmet:** İstisna olsa bile, **vaat edilen niteliği taşımayan** eğitimde tüketici bedel iadesi ister (6502). "₺40bin'e satarsın" yazıp satamayan mezun, "ayıplı" diye Hakem Heyeti'ne gider — 2026 limiti **₺186.000**, yani tüm ürünlerin bu kapıdan döner. Savunman: törpülenmiş vaat + ders tamamlama logu + sınav sonucu + makbuz/SMTP kanıtı (TESPİT E5). **Aşırı vaat, hukuki kalkanını delen matkap.**
- **PayTR boyutu:** Chargeback oranı yükselirse PayTR risk profilin bozulur; B2C hattın (Motor 1) zarar görür. İade talebini "kavga" değil "veri" say: ilk 100 satışta iade %5'i geçerse **ürün değil vaat sorunu** vardır — sayfayı düzelt, ürünü değil.

**c) Katalogun görmezden geldiği 4 acımasız gerçek:**

1. **Ücretsiz ikameler her yerde.** ChatGPT/Claude/Gemini'nin kendisi, YouTube, Trendyol Akademi (satıcıya bedava), araçların resmi öğreticileri. Senin ₺490–1.290'ının rakibi başka kurs değil, **bedava**. Farkın "bilgi" değil **"sistem + sınav + mühür + Türkçe yol haritası"** — bunu her sayfada haykır.
2. **Bitirme oranı %10'lar.** Edtech ortalaması: alanların çoğu bitirmez. Bitirmeyen mezun = yorum yazmaz, ikinci ürün almaz, "param boşa gitti" hisseder. Çare: 6 derslik compact yapı (doğru!), ilerleme e-postaları, "kaldığın yerden devam" hatırlatıcısı, sınav barajını motive edici dil. **Tamamlama, ikinci satışın motoru.**
3. **KOBİ öğrenmez, yaptırır.** Katalog KOBİ'yi öğrenci sanıyor; KOBİ müşteri. 02 ve 04'ün KOBİ'ye bakan yüzünü "kendin yap" değil **"öğren + uygula + (istersen) uzmana bağlan"** diye kur. (Freelancer odası açılınca bu cümle altın olur; açılmadan söz verme.)
4. **Güven borcu: "yetkin.ai kim?"** Bilinmeyen markadan ₺1.290'lık eğitim alınmaz — **kanıtla** alınır: örnek ders, sertifika örneği + `/dogrula` demosu, ilk 100 mezunun yorumu, iade politikasının şeffaflığı, şirket künyesi + kep/e-posta. İlk 30 günde "güven sayfası" reklam sayfasından önemlidir.

---

## EYLEM LİSTESİ (ÖNCELİKLİ)

### Kritik (lansman öncesi — vaat + hukuk)
- [ ] **P1.** Satış sayfalarından garanti-iması cümleleri temizle: "₺15-40bin'e sat", "₺30-120bin proje", "10 saati 30 dk" → §3.2'deki törpülenmiş haller. Pazarlama "sexy" diye itiraz ederse bu raporu göster.
- [ ] **P2.** Mesafeli satış sözleşmesi + ön bilgilendirme: m.15/ğ-h istisnası, "erişimle ifa başlar" cümlesi, açık onay checkbox'ı. Hukukçuya 1 saatlik gözden geçirme yaptır.
- [ ] **P3.** "Neden Udemy değil?" cümlesini 5 satış sayfasının ilk ekranına yaz: sınav + mühür + doğrulama + güncellik + Türkçe yol haritası. Fiyatı savunma, **farkı anlat**.

### Yüksek (ilk 30 gün — satış motoru)
- [ ] **P4.** Lokomotif `01_office_ai`: reklamın %70'i + 2-3 demo kreatif (ekran kaydı + ses demosu). CAC hedefi < ₺350, haftalık tablo.
- [ ] **P5.** `05`'i kapı yap: lead magnet (ücretsiz prompt seti + örnek ders) + 3'lü e-posta serisi → 01/04'e ikinci satış. Hedef: 30 günde ikinci satış %15+.
- [ ] **P6.** Bundle/upsell mekaniği: mühendislik beklemeden "01+05 paket ₺X" kampanyası + satın alma sonrası e-posta upsell'i (04). AOV hedefi: CAC'nin 2.5 katı.
- [ ] **P7.** Güven sayfası: örnek sertifika + `/dogrula` demosu + şeffaf iade politikası + şirket künyesi. Reklamdan önce bunu bitir.

### Orta (30–90 gün — Katman 2 kapısı)
- [ ] **P8.** `04`'ün alıcısını freelancer diye netle: satış dili "meslek + ilk müşteri" olsun; KOBİ'ye "kendin kur" vaat etme.
- [ ] **P9.** `02`'nin dilini acıya çevir: "açıklama yaz" → "listeleme hızı, iade oranı, reklam gideri". Trendyol Akademi ile farkı tek tabloda anlat (ücretsiz bilgi vs sistemli uygulama + sertifika).
- [ ] **P10.** `06_n8n` hazırlığı: master metin + 30 soru + **3 hazır şablon proje + keşif/teklif seti**. Lansman dili: "90 günde ilk pilot", asla "hemen ₺30-120bin".
- [ ] **P11.** Taksit araştırması: ₺1.290+ sepette terk oranını ölç; yüksekse PayTR taksit/tek-çekim karşılaştırması yap.

### Yapılmayacaklar
- ₺490'ı tek başına reklamla kârlı satmaya çalışmak (matematik tutmaz)
- 03 veya 05'i lokomotif yapmak (vitamin amiral olmaz)
- Katalogun gelir cümlelerini satış sayfasına aynen kopyalamak (iade bombası)
- Taksit/iade metni hazır olmadan Katman 2'yi vitrine almak
- "Marka bilinirliği" diye CAC > AOV reklamını sürdürmek

---

## EKLER

### A. Bu raporun dayandığı dosyalar
- Fiyat SSOT: `lib/academy/catalog-pricing.ts` (₺490–1.290 / ₺3.490–6.900 / ₺15–19bin)
- Katalog tezi: `docs/Bilgiler/PAZAR_EGITIM_KATALOGU_ONERISI.md` (3 katman, 13 konu)
- Teknik uyum: `docs/Raporlar/KATALOG_ANALIZ_RAPORU.md` (13 SKU kodda hazır, 5'i vitrinde)
- Satın alma: `app/api/academy/courses/[id]/purchase/route.ts` (6502 rızası, lisans 365 gün)

### B. Pazar verileri (web, Eylül 2026)
- Udemy TR tek kurs ~₺100–500; global gerçek fiyat ~$10–20; Coursera Plus ~₺800–1.200/ay; edX sertifika ~₺500–3.000 — çapa analizi buradan.
- Türkiye eğitim CPC 2026: **₺8–22**; kayıt başı kötü kurgu ₺800–3.000, iyi kurgu ₺400–900 — CAC matematiği buradan.
- E-ticaret: 634.611 işletme (Ticaret Bakanlığı 2025), Trendyol 250bin+ satıcı, 120bin e-ihracatçı; Trendyol Akademi + Ortak AI ücretsiz — 02 analizi buradan.
- Tüketici hukuku: 6502 + Mesafeli Sözleşmeler Yönetmeliği m.15 (anında ifa istisnası ancak eksiksiz ön bilgilendirme ile); ayıplı hizmette caymadan bağımsız iade; 2026 Hakem Heyeti limiti **₺186.000** — iade haritası buradan.

### C. Karar kaydı (bu raporun önerdiği)
1. Lokomotif: **`01_office_ai`**; kapı: `05`; upsell: `04`; bekleyenler: `02`, `03`.
2. Katman 1 kârlılığı = **AOV + ikinci satış**, tek ürün marjı değil.
3. Vaat dili **bugünden** törpülenir; hukuk metni lansmandan önce kilitlenir.
4. Katman 2'nin ilk adayı `06`, dili "90 günde ilk pilot".
5. İlk 30 gün metriği: **CAC < ₺350 (01), ikinci satış > %15, iade < %5.**

---

*İşlem tamamlandı. Bu dosya `/docs/PAZAR_GERCEKLIGI_RAPORU.md` olarak kaydedildi. Katalogun teknik analizi için `docs/Raporlar/KATALOG_ANALIZ_RAPORU.md`, fiyat SSOT için `lib/academy/catalog-pricing.ts` ile çapraz okuyunuz.*
