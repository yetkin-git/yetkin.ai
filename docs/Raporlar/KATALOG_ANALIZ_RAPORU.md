# KATALOG ANALİZ RAPORU — 3 Katmanlı Eğitim Kataloğu vs Mevcut Mimari

| Alan | Değer |
|------|-------|
| Tarih | 9 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (teknik mimar / tarafsız stratejist, Vatandaş Lisanı) |
| Girdi | `docs/Bilgiler/PAZAR_EGITIM_KATALOGU_ONERISI.md` (3 Eylül 2026, Baş Eğitim Mimarı) |
| Kapsam | `lib/academy` + `lib/kernel/catalog-ids` + `lib/kernel/payments` + `lib/kernel/identity` + `app/api/academy` + `docs/curriculum` + `.system_docs` |
| Hüküm (tek cümle) | **Katalog kodla birebir örtüşüyor — kanon 13 SKU zaten sicilde duruyor; vitrin 5 SKU = Katman 1'in tamamı. Satışa engel teknik eksik yok, içerik eksiği var (06–13'ün ders metni + sınav havuzu yazılmamış). Önceliği Katman 1'e, özellikle Amiral `01_office_ai`'a ver; Katman 3'e içerik + B2B altyapısı olmadan dokunma.** |

---

## ÖZET — 60 SANİYEDE DURUM

**İyi haber:** Baş Eğitim Mimarı'nın kataloğu ile kod tabanı birbirinden habersiz yazılmamış gibi duruyor — çünkü **birebir aynı 13 başlık** zaten kodda kanon olarak dondurulmuş:

- Katman 1 (5 konu) = vitrindeki 5 compact SKU (`01_office_ai` … `05_prompt_practice`). Birebir eşleşme, kelimesi kelimesine.
- Katman 2 (5 konu) = kanon `06` … `10`. Başlık, katman etiketi, seviye, fiyat, eğitmen sesi sicilde hazır; ders metni ve sınav havuzu yok.
- Katman 3 (3 konu) = kanon `11` … `13`. Aynı durum: kimlik hazır, içerik yok.

**Altyapı hükmü:** Sınav motoru, SHA-256 sertifika, mühürlü ses/cue oynatıcı ve satın alma kasası **SKU-bağımsız** yazılmış. Yani 06–13 de yarın içerik + sınav havuzu biterse **hiçbir altyapı değişikliği olmadan** satılır. Eksik parça içeriktir, boru hattı değil.

**Stratejik hüküm:** Hızlı nakit + ilk stres testi için **Katman 1, Amiral önce**. Katman 2'nin ilk adayı `06_n8n_automation` (Katman 2'nin en B2C-benzeri konusu). Katman 3 bu yılın işi değil — içerik derinliği + B2B altyapısı (toplu lisans, kurumsal panel, havale kanalı) olmadan Katman 3 satmak, sertifikanın inandırıcılığını ve PayTR B2C hikâyesini riske atar.

---

## ADIM 1: MEVCUT YAPI İLE UYUM KONTROLÜ

### 1.1 Üç katman ↔ 13 kanon SKU eşleşme tablosu

Katalogdaki her başlığın kod karşılığı bulundu ve doğrulandı. Kaynak: `lib/kernel/catalog-ids/course-slugs.ts` (başlık + katman SSOT), `lib/academy/course-level.ts` (seviye), `lib/academy/catalog-pricing.ts` (fiyat).

**KATMAN 1 — Kitlesel (%80) ↔ Vitrin 5 SKU (satışta):**

| Katalog | Kod (slug) | Başlık eşleşmesi | Seviye | Fiyat (KDV dahil) | Durum |
|---------|------------|------------------|--------|-------------------|-------|
| Konu 1.1 Ofiste Yapay Zeka | `01_office_ai` | ✅ kelimesi kelimesine | Temel | ₺890 | 🟢 Vitrinde, 6/6 ses mühürlü (Amiral) |
| Konu 1.2 E-Ticaret AI Asistanlığı | `02_ecommerce_ai` | ✅ kelimesi kelimesine | Temel | ₺990 | 🟢 Vitrinde, compact makale |
| Konu 1.3 Sosyal Medya / Video Fabrikası | `03_social_media_ai` | ✅ kelimesi kelimesine | Temel | ₺890 | 🟢 Vitrinde, compact makale |
| Konu 1.4 Kodsuz Chatbot (Voiceflow/Botpress) | `04_chatbot_nocode` | ✅ kelimesi kelimesine | Masterclass | ₺1.290 | 🟢 Vitrinde, compact makale |
| Konu 1.5 Pratik Prompt Mühendisliği | `05_prompt_practice` | ✅ kelimesi kelimesine | Masterclass | ₺490 | 🟢 Vitrinde, compact makale |

**KATMAN 2 — Profesyonel (%15) ↔ Kanon 06–10 (kimlik hazır, içerik yok):**

| Katalog | Kod (slug) | Başlık eşleşmesi | Seviye | Fiyat (KDV dahil) | Durum |
|---------|------------|------------------|--------|-------------------|-------|
| Konu 2.1 n8n/Make Otomasyon | `06_n8n_automation` | ✅ kelimesi kelimesine | Orta | ₺3.900 | 🟡 Kimlik+fiyat+eğitmen hazır; ders metni + sınav havuzu yok |
| Konu 2.2 LangGraph/CrewAI Ajanlar | `07_langgraph_agents` | ✅ kelimesi kelimesine | Orta | ₺5.900 | 🟡 Aynı — içerik yok |
| Konu 2.3 Production RAG / GraphRAG | `08_production_rag` | ✅ kelimesi kelimesine | Orta | ₺6.900 | 🟡 Aynı — içerik yok |
| Konu 2.4 Next.js / AI SDK | `09_nextjs_ai` | ✅ kelimesi kelimesine | Orta | ₺4.900 | 🟡 Aynı — içerik yok |
| Konu 2.5 Veri Analitiği / Power BI | `10_data_analytics_ai` | ✅ kelimesi kelimesine | Orta | ₺3.490 | 🟡 Aynı — içerik yok |

**KATMAN 3 — Kurumsal B2B (%5) ↔ Kanon 11–13 (kimlik hazır, içerik + B2B altyapısı yok):**

| Katalog | Kod (slug) | Başlık eşleşmesi | Seviye | Fiyat (KDV dahil) | Durum |
|---------|------------|------------------|--------|-------------------|-------|
| Konu 3.1 LLM Red Teaming / Guardrails | `11_llm_redteam` | ✅ kelimesi kelimesine | İleri | ₺15.000 | 🔴 İçerik yok + B2B altyapısı yok (bkz. §1.3) |
| Konu 3.2 Fine-Tuning / LoRA / vLLM | `12_onprem_finetune` | ✅ kelimesi kelimesine | İleri | ₺19.000 | 🔴 Aynı — ayrıca fiyat cüzdan tavanına (₺20.000) dayanmış |
| Konu 3.3 AI Act / KVKK Uyumu | `13_ai_governance` | ✅ kelimesi kelimesine | İleri | ₺15.000 | 🔴 Aynı |

**Fiyat bandı uyumu:** Katalogun önerdiği bantlar (K1: ₺490–1.490, K2: ₺2.900–7.500, K3: kişi başı ₺15–45bin) ile kodun dondurduğu 13 fiyat birebir aynı aralıkta. Kod, kataloğu zaten fiyatlamış. Tek not: Katman 3'ün "şirket ₺150bin+" paketi kodda yok — çünkü tek-kullanıcı lisans modeli var, toplu lisans yok (bkz. §2.2).

**Cevap (soru 1):** Evet, teknik olarak örtüşüyor — örtüşmenin ötesinde, **kod kataloğu önceden karşılamış**. `ACADEMY_CANON_SKU_SLUGS` 13 slug, `ACADEMY_CATALOG_LAYER_BY_SLUG` 1/2/3 katman haritası, `ACADEMY_COURSE_LEVEL_BY_SLUG` seviye haritası, `ACADEMY_CATALOG_PRICE_MINOR` 13 fiyat, `ACADEMY_INSTRUCTOR_VOICE_BY_SLUG` 13 eğitmen sesi: hepsi 13'lü kanona kilitli. Vitrin (`ACADEMY_GROWTH_SKU_SLUGS`) bunun ingest edilmiş 5'li alt kümesi ve kanon dışı slug vitrine giremez (tip seviyesinde kilitli). Pazarlama "13 eğitim!" derse yalan olur; doğru cümle "5 yayında + 8 yolda".

### 1.2 Altyapı kesintisizlik denetimi (soru 2)

Her katman için aynı soru: "ders metni + sınav havuzu yazılsa, başka kod gerekir mi?" Cevap: **hayır**. Boru hattı SKU-bağımsız. Tek tek denetlendi:

| Altyapı parçası | Dosya | SKU-bağımsız mı? | Katman 2/3'e yeter mi? |
|-----------------|-------|------------------|------------------------|
| Satın alma kasası (oturum + Idempotency-Key + 6502 rıza + fatura künyesi + atomik settlement + 365 gün lisans) | `app/api/academy/courses/[id]/purchase/route.ts`, `lib/academy/engine.ts`, `lib/academy/license.ts` | ✅ Evet — `courseId` parametre | ✅ Evet |
| Fiyat kilidi (15 dk) + Super Admin katalog SSOT | `app/api/academy/courses/[id]/lock/route.ts`, `lib/kernel/pricing/*` | ✅ Evet | ✅ Evet (B2C tekil satışta) |
| Sunucu sınavı (havuzdan çekme, şık karıştırma, MAC mühürlü oturum, baraj 70, istemcide puan yok) | `lib/academy/exam-sitting.ts`, `lib/academy/exam.ts` | ✅ Evet — havuz slug'dan çözülür | ⚠️ Kısmen (aşağıda: MCQ-derinlik notu) |
| Sertifika (SHA-256 `userId·courseId·attemptId·score·issuedAt·curriculumSeal`, public doğrulama, iptal) | `lib/academy/exam.ts`, `lib/academy/certificate-lifecycle.ts`, `app/api/academy/certificates/*` | ✅ Evet | ✅ Evet |
| Oynatıcı (compact makale + sekmeler + okuma mührü) | `CurriculumPlayer` + `AcademyMarkdownRenderer` + `LessonStudyTabs` | ✅ Evet | ✅ Evet (Gün 0 deneyimi) |
| Sesli anlatım (mühürlü WAV + cue + `currentTime` karaoke, izlemede canlı TTS yok) | `lib/academy/media-release-seal.ts`, `lib/academy/pilot-sku.ts` (`ACADEMY_MEDIA_SEALED_AUDIO`) | ✅ Evet — ders anahtarıyla mühür | ✅ Evet, ama maliyet/zaman ister (aşağıda) |
| Eğitmen sesi sicili (13 SKU'nun tamamında ses atanmış) | `lib/academy/instructors.ts` | ✅ Evet | ✅ Evet |
| İş kanıtı (param-lock etkileşimi + okuma mührü + SHA-256 bağ) | `lib/academy/proof-of-work.ts` | ✅ Evet | ⚠️ Kısmen (aşağıda: lab notu) |
| Makbuz e-postası | `lib/kernel/notice/academy-receipt-mail.ts` + Inngest | ✅ Evet | ✅ Evet (SMTP bağlanınca — TESPİT E5) |

**Eksik parça listesi (net, dürüst):**

1. **İçerik (en büyük eksik, kod değil):** `docs/curriculum/` altında yalnız 5 Katman-1 master metni var (`01` … `05`). 06–13'ün master metni yazılmamış → ingest (`scripts/ingest-course-sections.ts`) çalışmamış → `lib/academy/curricula/<klasör>/` altında 06–13 klasörü yok → `CURRICULUM_DRAFTS_BY_SLUG` 5 girdili. Bu bir altyapı eksiği değil, **yazarlık işi**. Boru hattı hazır, hammadde yok.
2. **Sınav havuzu (06–13):** `POOL_BY_SLUG` 5 girdili; her SKU'da 30 soruluk 4-şıklı havuz zorunlu (`assertAcademyExamPool`, `ACADEMY_EXAM_POOL_MIN/MAX`). 06–13'ün 8×30 = 240 sorusu yazılmamış. Motor hazır, soru yok.
3. **Ses mührü (02–13):** Yalnız `01_office_ai` 6/6 mühürlü WAV. 02–05 compact makale modunda satılıyor (ses vaadi yok, bu dürüst ve doğru). 06–13 de compact olarak satılabilir; ses sonradan fırınlanır. Eksik değil, **bilinçli erteleme** — ama Katman 2/3'te "₺6.900'luk eğitimde ses yok" itirazı gelebilir. Pazarlama dilini buna göre kur ("uzman metin + sunucu sınavı + mühür"; ses Amiral'e özel).
4. **MCQ-derinlik riski (Katman 2/3'ün pedagojik sorunu):** Sınav motoru çoktan seçmeli. Katman 1 için doğru format (kodsuz kitle). Ama `08_production_rag` veya `11_llm_redteam` sertifikasını 4 şıklı testle vermek, **kurumsal alıcının gözünde sertifikayı zayıflatır**. Kodda kod-çalıştırma lab'ı, dosya-yükleme değerlendirmesi, proje ödevi hakemliği yok — ve Anayasa'da "sunucuda exec" yasaklı (`d-exec` distractor). Yani teknik lab **bilinçli olarak** yok. Bu bir bug değil, mimari tercih; ama Katman 3 satarken "bu sertifika neyi kanıtlıyor?" sorusuna cevabın hazır olmalı: "kavram ustalığı + senaryo muhakemesi, uygulamalı proje denetimi değil". Eğer kurumsal müşteri uygulamalı kanıt isterse, o ayrı bir ürün işi (proje havuzu + insan hakemliği) — Gün 0'da yok, yol haritasında olmalı.
5. **Temel/Orta/İleri ayrımı:** Katalog, Katman 1'in ilk 3 konusu + Katman 2'nin tamamı için "3 seviye" öneriyor. Kod bunu **destekliyor ama dayatmıyor**: seviye etiketi serbest string (`AcademyCourseLevel`), `ACADEMY_OPTIONAL_LEVEL_PACKAGES = ["Temel","Orta","İleri"]`, Pedagoji §F.3 "çok teknik konularda bağımsız paket". Şu an her SKU tek paket (6 ders). Kataloğun önerisini harfi harfine uygularsan 13 SKU → ~30 SKU'ya patlar; her biri ayrı ingest + 30 soru + fiyat + SEO demek. **Tavsiye: patlatma.** Tek paketle sat, talep gelen konuda böl. Bölme kararı içerik kararıdır, kod hazır bekliyor.
6. **Toplu lisans / B2B satış (Katman 3'ün gerçek eksiği):** §2.2'de detaylı. Özet: tek-kullanıcı lisansı var; şirketin 20 kişiye alması, kupon/redeem kodu, kurumsal ilerleme paneli, ₺150bin+ havale tahsilatı yok.

**Cevap (soru 2):** Evet, kesintisiz sunabilirsin — **B2C tekil satış formatında** ve **compact makale + MCQ sınav + mühür** deneyimiyle. Altyapıda kod eksiği yok; eksikler: (a) 06–13 içerik + sınav sorusu (yazarlık), (b) Katman 2/3'te MCQ-derinlik inandırıcılığı (ürün/konumlandırma kararı), (c) Katman 3'te B2B satış altyapısı (mimari iş, Faz 2).

---

## ADIM 2: DÜŞÜNCE & TAVSİYE

### 2.1 SEN OLSAYDIN NE YAPARDIN? (öncelik + ilk stres testi)

**Öncelik: Katman 1. Spesifik sıra: `01_office_ai` → `05_prompt_practice` → `04_chatbot_nocode` → `02_ecommerce_ai` → `03_social_media_ai`.**

Neden bu sıra? Dürüst gerekçeler:

| Sıra | SKU | Fiyat | Neden önce? |
|------|-----|-------|-------------|
| 1 | `01_office_ai` (Ofis AI) | ₺890 | **Amiral, tek sesli ürün (6/6 mühür).** En yüksek arama hacmi (beyaz yaka + kamu + öğrenci). "Haftada 10 saati 30 dakikaya indir" vaadi en kolay satılan cümle. İlk stres testinin yükünü taşıyacak vitrin yüzü bu. |
| 2 | `05_prompt_practice` | ₺490 | **Giriş bileti / huni.** En ucuz SKU; reklamdan gelen soğuk trafiğin kredi kartını ilk açtığı kapı. Sepet ortalamasını değil, **müşteri adedini** büyütür. E-postanı alan, ertesi ay 04/02 alır. |
| 3 | `04_chatbot_nocode` | ₺1.290 | **Katman 1'in primi.** "KOBİ'ye 15–40bin TL'ye sat" vaadi doğrudan gelir hikâyesi; satın alma kararını en hızlı verdiren konu. Fiyatı Katman 1'in en yükseği — ciroyu taşır. |
| 4–5 | `02`, `03` | ₺990 / ₺890 | Sağlam konular ama 01/04/05 kadar keskin değil. E-ticaret mevsimselliğe, sosyal medya trend döngüsüne bağlı. Vitrinde dursun, pazarlama ağırlığı ilk üçte olsun. |

**Neden Katman 2/3 ile başlanmaz?** Üç soğuk gerçek:

1. **Satış döngüsü:** Katman 1'de karar dakikalar (reklam → kart). Katman 2'de günler (müfredat karşılaştırır, yorum arar). Katman 3'te haftalar–aylar (teklif, onay, sözleşme). İlk stres testine "haftalar" değil "dakikalar" lazım.
2. **Güven borcu:** Katman 2/3 alıcısı "bu platform kim?" diye sorar; cevabın "binlerce Katman-1 mezunu + doğrulanabilir mühürler" olmalı. Katman 1 tabanı olmadan Katman 3'e çıkmak, temelsiz çatı kurmaktır.
3. **İçerik maliyeti:** Katman 1 dersi bir iyi yazar + editörle haftada biter. `08_production_rag` veya `12_onprem_finetune` dersini yazacak kişi sayısı Türkiye'de azdır, pahalıdır ve yanlış yazarsa kurumsal müşteri ilk derste iade ister. Pahalı içeriği, ucuz içerik nakit üretirken yaz.

**Pazarlama + teknik efor dağılımı (ilk 90 gün):**

- **%70 — Katman 1 satış motoru:** Reklam (01 + 05 ağırlıklı), T3 nakit halkası (PayTR canlı → ilk gerçek satış → sınav → doğrulama), makbuz+SMTP (TESPİT E5), SEO (5 SKU'nun ders sayfaları indexlenebilir bilgi).
- **%20 — Katman 2'nin ilk tuğlası (`06_n8n_automation`):** Katman 2'nin en B2C-benzeri konusu (KOBİ otomasyonu, proje başına fatura hikâyesi). Master metin + 30 soru yazımına başla; vitrine alma, hazırlıkta tut. Neden 06? Çünkü alıcısı yazılımcı değil operasyoncu — Katman 1 kitlesine en yakın profil, en düşük güven borcu.
- **%10 — Bekleme / ölçüm:** Reklam metrikleri (CAC, dönüşüm), sınav geçme oranları, iade talepleri. Bu veriler Katman 2 fiyat ve içerik kararını besler.

**Stres testi notu:** İlk stres testi trafik değil **nakit halkasıdır**: PayTR bildirim → HMAC → CREDIT → satın alma → sınav → mühür → doğrulama. Katman 1 hacmi (aylık 1.000+ satış hedefi) bu halkayı gerçekten ısıtır: webhook idempotency, ledger kilitleri, sınav MAC yükü, Inngest makbuz kuyruğu. Katman 3'ün aylık 10 satışı hiçbir şeyi test etmez. Sistemi Katman 1 terletir, Katman 3 parlatır. Sıra belli.

### 2.2 BİR SONRAKİ AŞAMADA NE YAPILMALI? (kod + Supabase/Vercel ilk aksiyonları)

Ticari stratejinin sorunsuz işlemesi için, katman sırasına göre ilk aksiyonlar:

**A. Katman 1'i sorunsuz satmak için (hemen, Gün 0–30):**

| # | Aksiyon | Neden | Efor |
|---|---------|-------|------|
| A1 | T3 canlı halka tanığı: gerçek ₺10–20 yükleme → satın alma → sınav → `/dogrula` (TESPİT E4) | "Bağlı" varsayımıyla açılış en pahalı hata | 1 gün operasyon |
| A2 | Makbuz + SMTP (`NOTICE_SMTP_HOST`, `NOTICE_MAIL_FROM`) (TESPİT E5) | B2C güveni + chargeback kanıtı; kod kuyruğu hazır (`queueAcademyReceiptMail`), yalnız SMTP eksik | 2–3 gün |
| A3 | `ACADEMY_EXAM_SITTING_SECRET` üretim secret'ı (TESPİT E6) | Yoksa sınav 503 | 10 dk |
| A4 | v1/OpenAPI freelancer temizliği + SEO artığı (TESPİT E1/E7) | Temiz dosya, temiz sözleşme | Yarım–1 gün |

**B. Katman 2'yi satılabilir hale getirmek için (Gün 30–90, kod değişikliği neredeyse yok):**

| # | Aksiyon | Neden | Efor |
|---|---------|-------|------|
| B1 | `06_n8n_automation` master metin (`docs/curriculum/06_*.md`) + ingest + 30 soru + vitrin slug ekleme | Katman 2'nin ilk SKU'su; boru hattı hazır, yalnız içerik | Yazarlık: 2–4 hafta; kod: yarım gün (slug ekleme + test) |
| B2 | MCQ-derinlik konumlandırması: Katman 2 sertifika sayfasına dürüst kapsam cümlesi ("kavram + senaryo ustalığı; uygulamalı proje denetimi içermez") | Kurumsal/profesyonel alıcıda güven; A5 dürüstlük | 1 gün (metin + sayfa) |
| B3 | 07–10 için yazar havuzu kur (alan uzmanı + editör) | Katman 2'nin darboğazı yazar, kod değil | Operasyon |

**C. Katman 3 / B2B için (Faz 2, kod + operasyon — sırayla, hepsi bir anda değil):**

Önce dürüst tespit: **bugünkü mimaride gerçek B2B yok.** Olan: kurumsal fatura künyesi (unvan + vergi dairesi + VKN, `lib/kernel/identity/billing-info.ts`) — ama bu "şirkete kesilen B2C faturası", B2B değil. Olmayanlar ve ilk aksiyonlar:

| # | Eksik | İlk aksiyon (önerilen sıra) | Not |
|---|-------|------------------------------|-----|
| C1 | Toplu lisans (şirket 20 kişiye alsın) | **Önce harici:** platform dışı sözleşme + fatura, lisansları Super Admin tek tek tanımlar (Anayasa B5: haricen yönetilir, deftere sahte nakit yazılmaz). **Sonra kod:** `license_batch` + redeem kodu tablosu (Supabase migration + RLS), tek kod → N kullanıcı. | Kodu ilk günden yazma; ilk 2–3 kurumsal satışı manuel yap, kalıbı gör, sonra kodla. |
| C2 | Kupon / indirim motoru | `coupon` + `redemption` tablosu + purchase akışına kilit öncesi indirim adımı. Katman 3 lansmanı + kurumsal pilotlar için şart. | Orta iş (3–5 gün). Acele değil; ilk kurumsal satış manuel fiyatla olur. |
| C3 | ₺150bin+ tahsilat kanalı | **PayTR cüzdan bandı ₺20.000 tavanlı** (`WALLET_TOP_UP_MAX_MINOR`) — Katman 3 şirket paketi bu borudan geçmez. İlk aksiyon: havale/EFT + manuel lisans (harici). PayTR B2C hattına dokunma. | Kritik uyarı: tavanı yükseltmek PayTR risk profilini değiştirir; yapma. B2B tahsilatı ayrı kanal. |
| C4 | Kurumsal ilerleme paneli (İK "kim bitirdi?" görsün) | `org_dashboard` okuma ekranı: lisans listesi + tamamlama + sertifika durumu. RLS: org admin yalnız kendi lisanslarını görür. | Faz 2 ortası. İlk müşteriye manuel rapor (CSV) yeter. |
| C5 | e-Arşiv otomasyonu | Bugün: "kayıtlı e-postaya iletilir" (manuel). Kurumsal hacim artınca muhasebe entegrasyonu. | Faz 2 sonu. Gün 0'da manuel dürüstlük yeterli. |
| C6 | `kurumsal` odası | Donuk (`FROZEN_DISK_ROOMS` + kenar 410, Manifesto Motor 2 "Faz 2+"). İlk aksiyon: **açma**. B2B'yi akademi modülü içinde `org` gölge tablolarıyla taşı; oda açmak en son adım. | Oda açmak vitrin + nav + SEO + test demek; N=3 müşteriye oda açılmaz. |

**Supabase/Vercel notu:** B2B için altyapı değişikliği gerekmez. Vercel aynı monolit; env'e yeni secret yok (C1–C4 yalnız DB tablosu + RLS). Supabase'te yapılacak: migration disiplini (`DIRECT_URL` + `ops:migrate`), yeni tablolarda RLS + IDOR testi (prebuild `verify:idor-seals` yeni tabloyu da kapsasın). Operasyonel risk kodda değil, **sırada**: C1'i kodlamadan önce manuel sat, kalıbı gör.

### 2.3 PLATFORM KURGUSU DOĞRU MU? (B2C + B2B aynı monolitte yaşar mı?)

**Dürüst cevap: evet, kurgu doğru — ve B2B'nin bugün kapalı olması da doğru.**

| Parça | Durum | Kanıt |
|-------|-------|-------|
| Amiral monolit (modüler) | ✅ Gerçek | Oda başına `lib/<oda>` + `app/<oda>` + test; `rooms.ssot.ts` 4 dikey; `bounded-contexts.ts` |
| B2C motor (Motor 1) | ✅ Çalışıyor | PayTR Merchant → bakiye → satın alma → sınav → mühür; TESPİT'te denetlendi |
| B2B motor (Motor 2) | 🔒 Bilinçli kapalı | `kurumsal` donuk oda (410); Manifesto "Faz 2+"; Anayasa B5 harici pilot serbestisi |
| Pazaryeri motor (Motor 3) | 🔒 Bilinçli kapalı | Split `false` + Freelancer 410 (TESPİT'te denetlendi) |
| Paylaşılan çekirdek | ✅ Doğru yerde | Para, defter, auth, fiyat kataloğu, sınav, mühür — hepsi `lib/kernel` + `lib/academy` portlarında; B2B bunları yeniden yazmaz, porttan geçer |

**Neden birbirini boğmaz?** Üç yapısal güvence var:

1. **Oda yalıtımı:** B2C vitrin (`/academy`) ile gelecek B2B yüzeyi ayrı odalar. `rooms.ssot.ts` + kenar koruması + `FREELANCER_PUBLIC_SURFACE_LOCKED` kalıbı, B2B'ye de aynen uygulanır: B2B açıldığında B2C'ye tek satır `if (isCorporate)` serpiştirilmez; ayrı modül, ayrı route, ayrı test. Boğulma, kodun aynı dosyada büyümesinden değil, **sınırsız büyümesinden** olur — sınırlar sicilde duruyor.
2. **Motor sırası:** Manifesto Motor 1 → 2 → 3 diyor. B2C nakit üretirken B2B harici pilot (sözleşme + manuel lisans) olarak yaşar; kod yükü sıfır. B2B kod işi, ancak tekrarlayan B2C geliri varken başlar. Bu sıra, iki motorun aynı mühendislik haftasını kapışmasını engeller.
3. **PayTR hikâyesi temiz:** B2C Merchant hattı tekil satış; B2B havale ayrı kanal. İkisi aynı cüzdan borusuna zorlanmazsa (§2.2-C3), PayTR B2C onayı B2B yüzünden riske girmez.

**Esneklik değerlendirmesi:** Eylül 2026 B reformu sonrası mimari yeterince esnek — yapay katman duvarı yok, yeni modül (`lib/b2b` veya `lib/kurumsal` canlandırma) monolit içinde temiz durur (Anayasa B2 "Genişleme Alanı"). **Mikro-servise bölünme konuşması yasaklanmalı** (TESPİT'te de yazdı): aylık 1M istek altında monolit her zaman kazanır; B2B'nin ilk yılında trafik değil, 3 müşteri olacak.

**Tek gerçek risk (boğulma senaryosu):** B2B aceleye getirilip akademi çekirdeğine kurumsal `if`'leri serpiştirilirse (fiyat mantığına "şirket indirimi", satın almaya "toplu sepet", sınava "İK gözetimi") — o zaman B2C sadeleşmesi bozulur ve her B2C değişimi B2B'yi kırar. Çare basit: **B2B kodu `lib/academy` içine değil, yanına** (`lib/b2b/*` + `app/(b2b)/*` + ayrı test). Portları paylaş, dosyayı paylaşma.

**Hüküm:** Mevcut mimari, B2C-hızlı + B2B-ağır ikilisini taşımak için doğru ve yeterince esnek kurgulanmış — **şartı B2B'yi ayrı modülde büyütmek ve Faz 2'den önce koduna başlamamak.**

---

## EYLEM LİSTESİ (ÖNCELİKLİ)

### Kritik (satışın önü)
- [ ] **K1.** `01_office_ai` Amiral lansmanı: pazarlama ağırlığı + T3 canlı halka (E4) + makbuz/SMTP (E5) + sınav secret (E6)
- [ ] **K2.** Pazarlama dilini kilitle: "5 yayında eğitim + her ay yeni". Kanon 13 yol haritasıdır, vitrin değil. Katman 2/3 vaadi basılmaz.
- [ ] **K3.** TESPİT E1 (v1/OpenAPI temizliği) — Katman 3 kurumsal alıcı sözleşme belgesine bakmadan önce

### Yüksek (Katman 2 kapısı)
- [ ] **K4.** `06_n8n_automation` master metin + 30 soru + ingest + vitrin (Gün 30–90)
- [ ] **K5.** Katman 2 sertifika kapsam cümlesi (MCQ dürüstlüğü)
- [ ] **K6.** 07–10 yazar havuzu (alan uzmanı + editör)

### Orta (Katman 3 hazırlığı — kod yok, operasyon var)
- [ ] **K7.** İlk kurumsal pilot kalıbı: harici sözleşme + manuel lisans + manuel rapor (B5 uyumlu). Kod yazılmadan 2–3 satış dene.
- [ ] **K8.** Redeem/kupon tasarımı (ADR düzeyinde; kod Faz 2)

### Yapılmayacaklar
- Katman 3'ü B2B altyapısı olmadan vitrine almak (güven + PayTR riski)
- 13 SKU'yu 3'er seviyeye bölüp ~30 SKU patlatmak (içerik borcu ×3)
- Cüzdan tavanını (₺20.000) yükseltmek (PayTR risk profili)
- B2C çekirdeğine kurumsal `if` serpiştirmek (boğulma senaryosu)
- Mikro-servise bölünmek / `kurumsal` odasını erken açmak

---

## EKLER

### A. Doğrulanan dosya listesi (her bulgu satır satır izlenebilir)
- Kanon + katman: `lib/kernel/catalog-ids/course-slugs.ts`
- Vitrin 5 SKU + ses mührü: `lib/academy/pilot-sku.ts`
- Seviye: `lib/academy/course-level.ts` | Fiyat: `lib/academy/catalog-pricing.ts` | Eğitmen: `lib/academy/instructors.ts`
- Müfredat: `lib/academy/curricula/index.ts` + `docs/curriculum/*.md` (5 dosya) + `scripts/ingest-course-sections.ts`
- Sınav: `lib/academy/exam.ts`, `exam-sitting.ts`, `exam-pools.ts` (5 havuz), `exam-duration.ts`
- Sertifika: `lib/academy/exam.ts` (SHA-256), `certificate-lifecycle.ts`, `app/api/academy/certificates/*`
- Satın alma: `app/api/academy/courses/[id]/purchase/route.ts`, `lib/academy/engine.ts`, `license.ts`, `runtime.ts`
- Medya: `lib/academy/media-release-seal.ts`, `production-standard.ts`, `tts-breath-chunks.ts`
- Fatura künyesi: `lib/kernel/identity/billing-info.ts` | Cüzdan bandı: `lib/kernel/payments/wallet-top-up.ts`
- Odalar: `lib/kernel/rooms.ssot.ts` | Manifesto Motor 1/2/3: `.system_docs/MANIFESTO.md` | Pedagoji: `.system_docs/PEDAGOJI.md`

### B. Karar kaydı (bu raporun önerdiği)
1. Katalog: **kabul — kodla birebir uyumlu**, 13 kanon korunur.
2. Öncelik: **Katman 1** (01 → 05 → 04 → 02 → 03); ilk Katman-2 adayı **06**.
3. Katman 3: **Faz 2**; önce manuel pilot, sonra redeem/kupon, en son oda.
4. Seviye bölünmesi: **yapılmayacak** (talep gelen konuda istisna).
5. Mimari: **monolit korunur**; B2B ayrı modülde büyür.

---

*İşlem tamamlandı. Bu dosya `/docs/KATALOG_ANALIZ_RAPORU.md` olarak kaydedildi. Her bulgunun yanında dosya yolu var — ilgili dosyayı açıp satır satır doğrulayabilirsiniz.*
