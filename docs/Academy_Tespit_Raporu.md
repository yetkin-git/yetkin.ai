# AKADEMİ MODÜLÜ TESPİT RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 9 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (teknik ve mimari denetçi) |
| Muhatap | SUPER ADMIN / Kurucu irade |
| Canlı yüzey | `http://localhost:3000/academy` |
| Kod zemini | `app/academy` · `app/api/academy` · `lib/academy` · `prisma/schema/academy.prisma` · `lib/kernel/catalog-ids` · `docs/curriculum` |
| Pazar girdisi | `docs/Raporlar/PAZAR_EGITIM_KATALOGU_ONERISI.md` (3 Eylül 2026) |
| İlişkili sicil | `docs/Raporlar/KATALOG_ANALIZ_RAPORU.md`, `docs/Raporlar/TESPIT_RAPORU.md`, `docs/Raporlar/MAKBUZ_RAPORU.md`, `docs/Bilgiler/Akademi_Multimedya_Raporu.md`, `.system_docs/PEDAGOJI.md` |
| Üslup | Tarafsız. Yeşil boyama yok. Bu belge hukuki mütalaa değildir. |

---

## ÖZET — 90 SANİYEDE HÜKÜM

**Tek cümle:** Akademi, Katman 1’in beş compact SKU’sunu vitrine koymuş, satın alma → okuma mührü → sunucu sınavı → SHA-256 sertifika boru hattını kodlamış bir B2C eğitim dükkânıdır; pazarın 13’lü kataloğunun kimliği sicildedir, 8 SKU’nun ders metni yoktur; sesli “amiral” yalnız `01_office_ai`’dır.

Üç sorunun kısa cevabı:

1. **Neredeyiz?** Vitrinde 5 eğitim satılır (`01`–`05`). Kanon 13 SKU kimlik + fiyat + eğitmen sicilindedir; 06–13 vitrine girmez, 404/301 olur. Ders metni 30 compact makale; sınav 5×30 soru; mühürlü ses 6/30 ders; video 0.
2. **Katalog hizası?** Pazar raporundaki Katman 1 birebir koda dökülmüş. Katman 2 ve 3 başlık/fiyat olarak dondurulmuş, içerik olarak taslak bile ingest edilmemiş. Amiral `01_office_ai` tek tam ürün (metin + 6/6 ses + karaoke + sınav).
3. **Boru hattı uçtan uca çalışıyor mu?** Kod olarak evet — SETTLED lisans, ilerleme, 70 baraj, `/academy/dogrula`. Canlı nakit halkası (PayTR tanığı) ve SMTP env bağlanmadan “satışa %100 hazır” denemez. Bu bir içerik/ops eksiğidir, mimari delik değil.

**Satışa %100 hazırlık hükmü:** Katman 1, **yazılı compact eğitim + MCQ mühür** olarak satılabilir. Pedagoji’nin hedefi (ses + kayan yazı + görsel + sinema) yalnız Amiral’de durur. Dört SKU’yu “sesli akademi” diye pazarlamak yalan olur; kart özeti zaten “yazılı compact dersler” der — bu dürüstlük korunmalı.

---

## 1. MEVCUT DURUM — NEREDAYIZ?

### 1.1 Vitrin, kanon ve taslak — üç katmanlı gerçek

Kod üç liste tutar. Karıştırmak, “13 eğitim yayında” yalanını doğurur.

| Liste | Kaynak | Adet | Vatandaş ne görür? |
|-------|--------|------|---------------------|
| **Kanon** | `ACADEMY_CANON_SKU_SLUGS` (`lib/kernel/catalog-ids/course-slugs.ts`) | 13 | Hiçbir şey — kimlik SSOT |
| **Vitrin** | `ACADEMY_GROWTH_SKU_SLUGS` (`lib/academy/pilot-sku.ts`) | 5 | `/academy` ızgarası |
| **Hayalet / emekli** | `lib/academy/retired-storefront.ts` (eski `python-temel`, `ai-orta` vb.) | onlarca eski slug | HTTP 301 → `/academy` |

Vitrin, kanonun **tip seviyesinde kilitli alt kümesidir**. Kanon dışı slug vitrine giremez. `dynamicParams = false` — vitrinde olmayan `/academy/[slug]` HTTP 404.

Eski ayrı “pilot SKU” yoktur (`ACADEMY_PILOT_SKU_SLUG = null`). Amiral, vitrinin ilk kartıdır: `ACADEMY_FLAGSHIP_SKU_SLUG = 01_office_ai`.

### 1.2 Vitrindeki 5 SKU (çalışan / satışa açık)

Her biri 6 compact makale, 30 soruluk 4-şıklı sınav havuzu, baraj 70, 365 gün lisans. CMS yok; gövde `lib/academy/curricula/<sku>/`.

| Slug | Başlık (kanon) | Seviye | Fiyat (KDV dahil) | Kelime (tahmini) | Süre (modül) | Ses mührü | Durum |
|------|----------------|--------|-------------------|------------------|--------------|-----------|--------|
| `01_office_ai` | İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta) | Temel | ₺890 | ~12.400 | 89 dk | **6/6 WAV + cue + timings** | 🟢 Amiral. Tek sinema/karaoke ürünü |
| `02_ecommerce_ai` | E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı | Temel | ₺990 | ~12.000 | 85,5 dk | Yok (makale) | 🟢 Vitrinde, compact |
| `03_social_media_ai` | Sosyal Medya İçerik / Görsel-Video Fabrikası | Temel | ₺890 | ~7.200 | 51,5 dk | Yok | 🟢 Vitrinde, compact |
| `04_chatbot_nocode` | Kodsuz WhatsApp / Web Chatbot (Voiceflow & Botpress) | Masterclass | ₺1.290 | ~7.500 | 53 dk | Yok | 🟢 Vitrinde, compact |
| `05_prompt_practice` | Pratik Prompt Mühendisliği | Masterclass | ₺490 | ~6.100 | 44 dk | Yok | 🟢 Vitrinde, compact |

**Toplam vitrin:** 30 ders, ~45.000 kelime, 5×30 = 150 sınav sorusu (çekim: oturum başına 10).

`05_prompt_practice` 44 dk ile Pedagoji §F mühür bandının alt sınırının (45 dk) **hemen altındadır**. Compact makale bu bantla kesilmez; ses fırınlanırsa konuşma metni uzatılmalı veya bant “kısa masterclass” diye kabul edilmeli.

#### Ders başlıkları (ingest edilmiş)

**01 — Ofis AI**

1. Ofiste Yapay Zekâ Devrimi: Günlük 2 Saatten Nasıl Tasarruf Edilir?
2. Excel’de Formül Ezberlemeye Son: Doğal Dille Tablo ve Formül Sihirbazlığı
3. Dağınık ve Bozuk Verileri Saniyeler İçinde Temizleme, Ayrıştırma ve Birleştirme
4. Word ve Resmi Yazışmalarda Profesyonel Raporlama ve Şablon Üretimi
5. 3 Dakikada Sıfırdan PowerPoint Sunumu ve Görsel Tasarım Mimarisi
6. Outlook ve E-Posta Trafiğini Otomatize Etme & Kapanış

**02 — E-Ticaret AI**

1. Pazaryerlerinde Öne Çıkma ve Mağaza Asistanlığı
2. SEO Odaklı Ürün Açıklaması Yazımı
3. Müşteri Yorumları ve Soru-Cevap Analitiği
4. Rakip ve Fiyat Analizi: Buybox
5. Pazaryeri Görsel Konsepti ve Sosyal Vitrin Metinleri
6. Kriz ve İade Yönetimi & Masterclass Kapanışı

**03 — Sosyal Medya**

1. İçerik Üretiminde Paradigma Değişimi & Fabrika Mantığı
2. Midjourney & Canva AI ile Visual Factory
3. Metin Yazarlığı & Kanca (Hook) Mühendisliği
4. AI Avatarlar ve Seslendirme (HeyGen & ElevenLabs)
5. CapCut AI & Otonom Video Kurgu Hattı
6. Otonom Yayınlama, Ticari Modeller ve Kapanış

**04 — Kodsuz Chatbot**

1. Chatbot Dünyasına Giriş ve Zihniyet Değişimi
2. Voiceflow ile İlk Web Chatbot
3. Botpress ve LLM Entegrasyonu
4. WhatsApp API ve Meta Entegrasyon Savaşları
5. Webhooks, Make.com ve CRM
6. Ticari Fırsat: Müşterilere Chatbot Satmak

**05 — Prompt Pratiği**

1. Doğru İletişim & Prompt Zihniyeti
2. Few-Shot & Chain-of-Thought
3. İş Hayatı ve Metin Üretiminde Prompt
4. Veri Analizi ve Karar Destek Promptları
5. Görsel / Multimodal Prompt
6. Kendi Prompt Kütüphaneni Oluşturmak

Master metinler `docs/curriculum/01` … `05_*.md` altında durur; ingest `scripts/ingest-course-sections.ts` ile `lib/academy/curricula/` klasörlerine basılmıştır. `06`–`13` için master markdown **yoktur**.

### 1.3 Kanon ama vitrinde olmayan 8 SKU (taslak / kimlik)

Bunlar “bekleyen eğitim” değildir. **Başlık, özet, katman, seviye, fiyat, eğitmen sesi** sicildedir; `CURRICULUM_DRAFTS_BY_SLUG` ve `POOL_BY_SLUG` onları tanımaz. URL’den çağrılırsa 404 / kataloga 301.

| Slug | Katman | Seviye | Fiyat | Ders klasörü | Sınav havuzu |
|------|--------|--------|-------|--------------|--------------|
| `06_n8n_automation` | 2 | Orta | ₺3.900 | Yok | Yok |
| `07_langgraph_agents` | 2 | Orta | ₺5.900 | Yok | Yok |
| `08_production_rag` | 2 | Orta | ₺6.900 | Yok | Yok |
| `09_nextjs_ai` | 2 | Orta | ₺4.900 | Yok | Yok |
| `10_data_analytics_ai` | 2 | Orta | ₺3.490 | Yok | Yok |
| `11_llm_redteam` | 3 | İleri | ₺15.000 | Yok | Yok |
| `12_onprem_finetune` | 3 | İleri | ₺19.000 | Yok | Yok |
| `13_ai_governance` | 3 | İleri | ₺15.000 | Yok | Yok |

`12_onprem_finetune` (₺19.000) PayTR cüzdan tavanına (₺20.000) **1.000 TL kala** durur. Toplu kurumsal paket (katalogun “şirket ₺150bin+”) kodda yoktur.

### 1.4 İçerik teknik tamlık oranı

Ölçek: vitrin 5 SKU = satış yüzeyi. Kanon 13 = ürün vaadi. Pedagoji hedefi ≠ Gün 0 gerçeği.

| Bileşen | Vitrin (5 SKU) | Kanon (13 SKU) | Not |
|---------|----------------|----------------|-----|
| Ders metni (compact makale) | **100%** (30/30) | **38%** (5/13) | Gövde kod tohumu; Prisma `AcademyLesson` yok |
| Sınav havuzu (30–50 MCQ) | **100%** (5×30) | **38%** (5/13) | Çekim 10, süre 30 dk, şık sunucuda |
| Okuma / ilerleme mührü | **100%** | Motor SKU-bağımsız | Compact: okuma kanıtı; `LESSON_PRACTICE` **boş** |
| Etkileşimli iş kanıtı (param-lock / prompt-pack) | **0%** | 0% | Compact derste tohum yok; doğru tercih, lab yok |
| Mühürlü TTS / karaoke | **20%** (6/30 ders; 1/5 SKU) | **8%** (1/13) | Yalnız `01_office_ai-1` … `-6` |
| Canlı TTS (`generateSpeech` / `listen`) | Kapalı **410** | — | Bilinçli: izlemede Gemini yok |
| Video / micro-video bake | **0%** (`ACADEMY_BAKED_MICRO_VIDEO_KEYS = []`) | 0% | Pedagoji F.2 hedef; Gün 0 yok |
| Sertifika / `/dogrula` motoru | **100%** (boru) | 100% (boru) | Belge satın alınamaz; sınav ≥70 |
| Diyalog tiyatrosu (`DialogueTurn[]`) | **0 SKU** (`ACADEMY_DIALOGUE_SKU_SLUGS = []`) | — | Compact okuma kilidi |
| Yorum / tartışma | **410** | — | Stüdyo arşivde |
| Makbuz e-postası | Kod **hazır** | — | SMTP env yoksa dürüst atlanır |

**Ağırlıklı okuma (vitrin, satış vaadi olarak):**

| Ağırlık | Kalem | Skor | Katkı |
|---------|-------|------|-------|
| 30 | Ders metni | 100 | 30 |
| 20 | Sınav + mühür borusu | 100 | 20 |
| 20 | Satın alma / lisans / ilerleme | 95 (ops PayTR/SMTP hariç kod) | 19 |
| 20 | Ses + karaoke (hedef deneyim) | 20 | 4 |
| 10 | Video / lab / sosyal | 0 | 0 |
| **Toplam** | | | **~73 / 100** |

**Ağırlıklı okuma (kanon 13’lü katalog vaadi):** ~35 / 100 — çünkü 8 SKU içeriksiz.

Dürüst cümle: **Katman 1 yazılı ürün olarak ~%90, “sesli akademi” olarak ~%20, 13’lü katalog olarak ~%35.**

### 1.5 Rotalar (vatandaş yüzeyi)

| Rota | Rol |
|------|-----|
| `/academy` | Vitrin; oturumlu devam şeridi |
| `/academy/[slug]` | Antre: fiyat, müfredat özeti, satın al, sınav kapısı, mühür |
| `/academy/[slug]/oyna` | Oynatıcı; SETTLED (veya Super Admin laboratuvar) şart |
| `/academy/courses/[slug]` | Eski alias; 301 → kanonik antre |
| `/academy/certificates` | Kullanıcının belgeleri (oturum) |
| `/academy/dogrula` | Hash formu (oturum yok) |
| `/academy/dogrula/[hash]` | Kamuya açık SHA-256 doğrulama |

API (özet): `GET /api/academy/courses`, kilit, satın alma, müfredat GET/POST (ilerleme), sınav GET/POST, PDF, sertifika. `generateSpeech` / `listen` / `reviews` / `discussion` → **410**.

---

## 2. KATALOG VE PAZAR HİZALAMASI

Kaynak: `docs/Raporlar/PAZAR_EGITIM_KATALOGU_ONERISI.md`. Kod kataloğu **önceden karşılamış**; 13 başlık kelimesi kelimesine `ACADEMY_COURSE_TITLES` içindedir.

### 2.1 Katman 1 — koda dökülmüş (vitrin)

| Pazar konusu | Slug | Koda döküldü mü? |
|--------------|------|------------------|
| 1.1 Ofiste Yapay Zeka | `01_office_ai` | Evet — metin, 30 soru, **ses 6/6** |
| 1.2 E-Ticaret AI | `02_ecommerce_ai` | Evet — metin, 30 soru; ses yok |
| 1.3 Sosyal Medya / Video Fabrikası | `03_social_media_ai` | Evet — metin, 30 soru; ses yok |
| 1.4 Kodsuz Chatbot | `04_chatbot_nocode` | Evet — metin, 30 soru; ses yok |
| 1.5 Pratik Prompt | `05_prompt_practice` | Evet — metin, 30 soru; ses yok |

Katalog “Temel / Orta / İleri (3 seviye)” öneriyor (1.1–1.3). Kod **destekler ama dayatmaz**: her SKU tek paket, 6 ders. `ACADEMY_OPTIONAL_LEVEL_PACKAGES` Pedagoji §F.3’te isteğe bağlı. 13 SKU’yu 3’e bölmek ~30 SKU + 30’ar soru demektir. Bugün yapılmamış; yapılmamalı.

Fiyat bandı katalogla uyumlu: K1 ₺490–1.490.

### 2.2 Katman 2 — kimlik var, içerik yok

| Pazar konusu | Slug | Koda döküldü mü? |
|--------------|------|------------------|
| 2.1 n8n / Make otomasyon | `06_n8n_automation` | Hayır — yalnız sicil |
| 2.2 LangGraph / CrewAI ajanlar | `07_langgraph_agents` | Hayır |
| 2.3 Production RAG | `08_production_rag` | Hayır |
| 2.4 Next.js AI SDK | `09_nextjs_ai` | Hayır |
| 2.5 Veri analitiği / Power BI | `10_data_analytics_ai` | Hayır |

Boru hattı SKU-bağımsızdır: master metin + ingest + 30 soru + `ACADEMY_GROWTH_SKU_SLUGS`’e ekleme yeter. Yeni kasa / sınav motoru gerekmez.

### 2.3 Katman 3 — kimlik var; içerik + B2B yok

| Pazar konusu | Slug | Koda döküldü mü? |
|--------------|------|------------------|
| 3.1 LLM Red Teaming | `11_llm_redteam` | Hayır |
| 3.2 Fine-tune / vLLM | `12_onprem_finetune` | Hayır |
| 3.3 AI Act / KVKK | `13_ai_governance` | Hayır |

Ek engel: tek-kullanıcı 365 gün lisans. Şirketin 20 kişiye alması, redeem kodu, kurumsal panel, havale tahsilatı yok. Bugünkü “kurumsal fatura künyesi” B2C faturasının unvan satırıdır, B2B ürünü değildir.

MCQ barajı Katman 3 sertifikasını kurumsal alıcıda zayıflatır. Kod çalıştırma lab’ı Anayasa’da yasaklı (`d-exec`). Bu bug değil; konumlandırma kararı: “kavram + senaryo ustalığı, uygulamalı proje denetimi değil.”

### 2.4 Amiraller / lokomotif — `01_office_ai`

| Katman | Durum |
|--------|--------|
| Metin | 6/6 ingest; master `docs/curriculum/01_office_ai_mastery.md` “TAM METİN HAZIR” |
| Konuşma metni | `lib/academy/spoken-scripts/01_office_ai-1` … `-6.md` |
| Cue / timings | 6 JSON + 6 timings |
| WAV sicili | `ACADEMY_MEDIA_SEALED_AUDIO["01_office_ai"]` 6 anahtar; üretim kuyruğu **boş** |
| Oynatıcı | `article+karaoke` (`academyCitizenPlayerLayer`); izlemede TTS yok |
| Sınav | 30 soru, `assertAcademyExamPool` |
| Vitrin rozeti | “Sesli Anlatım” yalnız mühürlü SKU’da |

Lokomotif **içerik olarak bitmiş ürün**dür. Eksik olan, canlıda bir vatandaşın ₺890’ı gerçekten ödemesi ve mühür hash’inin `/dogrula`’da yeşil dönmesidir (T3 nakit tanığı).

`02`–`05` lokomotif değildir; aynı compact kalıptadır, ses fırını bekler. Pedagoji açık söyler: Gün 0 Aşama 1 makaledir; sinema sonradan gelir.

---

## 3. TEKNİK ALTYAPI VE MÜHÜR BORU HATTI

### 3.1 Veri modeli (`prisma/schema/academy.prisma`)

| Model | Rol |
|-------|-----|
| `AcademyCourse` | slug, başlık, özet, katalog birimi, trend, `isPublished`. Fiyat **yok** (S11-A: `PriceCatalogEntry`) |
| `AcademyPurchase` | Instant SETTLED; `priceLockId`; 6502 rıza kolonları; `userId+courseId` tekil |
| `AcademyExam` | Kursa 1:1; `questionsJson` mühürlü havuz |
| `AcademyExamSitting` | HMAC oturum sicili; JTI tek sefer; 10 soru + şık permütasyonu |
| `AcademyExamAttempt` | GRADED; puan sunucuda |
| `AcademyCertificate` | `serialKey` / `certificateHash` SHA-256; `curriculumSeal`; iptal |
| `AcademyLessonCompletion` | `lessonKey` + isteğe bağlı `proofOfWorkHash`; içerik CMS değil |
| `AcademyAudioCache` | Bake locator; Gemini yalnız miss’te (operatör) |

Ders gövdesi DB’de durmaz. Bu Anayasa / Pedagoji tercihidir, eksik tablo değildir.

### 3.2 Uçtan uca akış (kod)

```
Kayıt / oturum
  → (gerekirse) PayTR iFrame → ön ödemeli bakiye CREDIT
  → 15 dk fiyat kilidi + 6502 rıza + fatura künyesi
  → POST /api/academy/courses/[id]/purchase
       atomik: cüzdan DEBIT + hazine CREDIT + SETTLED satır
       (Idempotency-Key; native/IAP 403)
  → 365 gün lisans (settledAt + 365g; kolon yok)
  → GET /academy/[slug]/oyna
  → POST .../curriculum  (ders tamamlama; compact = okuma mührü)
  → 6/6 complete → sınav kapısı
  → GET .../exam  (oturum MAC, 10 soru, 30 dk)
  → POST .../exam  (baraj 70; istemcide puan yok)
  → insertCertificate (SHA-256: userId·courseId·attemptId·score·issuedAt·curriculumSeal)
  → GET /academy/dogrula/[hash]  (oturum yok; kimlik sızmaz)
  → (opsiyonel) Kariyer vizesi damgası
```

Satın al ≠ sertifika. Müfredat bitmeden sınav açılmaz (`assertAcademyCurriculumComplete`). Doğrudan “sınav yolu” kartta metin olarak durur; **Faz 1 kasa UI yalnız `training` basar** — ders atlayarak belge alınamaz.

### 3.3 Çalışan parçalar

- Katalog public; satın alma / oynatıcı / sınav oturum ister.
- Super Admin laboratuvar erişimi oynatıcıda vardır; üretimde sıfır harçlı bağış kapalıdır (`isZeroFeeAcademyGrantOpen` production’da false).
- Sertifika iptali (`revokedAt`) ve public `sealStatus`: valid / mismatch / incomplete / revoked.
- QR + hash doğrulama sayfası.
- Makbuz: settlement sonrası Inngest kuyruğu; SMTP yoksa satın alma kırılmaz (`docs/Raporlar/MAKBUZ_RAPORU.md` — E5 kodu kapandı).

### 3.4 Aksayan veya eksik teknik noktalar

**A. Canlı ops (kod değil, açılış kilidi)**

| # | Nokta | Etki |
|---|--------|------|
| A1 | PayTR canlı üçlü + Bildirim URL + gerçek ₺10–20 yükleme tanığı | Bakiye boş kalır; vitrin “satış” gibi durur, kasa çalışmaz |
| A2 | `ACADEMY_EXAM_SITTING_SECRET` ≥16 karakter (üretim) | Sınav **503**; site ayakta kalır, mühür doğmaz |
| A3 | `NOTICE_SMTP_HOST` + `NOTICE_MAIL_FROM` | Makbuz atlanır; chargeback / güven zayıf |
| A4 | Inngest anahtarları | Makbuz kuyruğu + valör defer |

Bunlar olmadan “uçtan uca çalışıyor” laboratuvar cümlesidir, üretim cümlesi değil.

**B. Ürün / içerik (bilinçli erteleme, satış dilini bağlar)**

| # | Nokta | Etki |
|---|--------|------|
| B1 | 02–05 ses yok | Kart “yazılı compact” der — doğru. Pazarlama “sesli akademi” derse iade |
| B2 | Video bake kümesi boş | Pedagoji F.2 hedefi karşılanmaz; compact okuma yeter denmiş |
| B3 | `LESSON_PRACTICE` boş | Compact’ta etkileşimli kilit yok; sınav MCQ + okuma |
| B4 | 06–13 içerik + 8×30 soru yok | Vitrine alınamaz (ve alınmamalı) |
| B5 | Yorum / tartışma 410 | Sosyal kanıt ve soru-cevap yok; B2C’de eksi, stüdyo kasıtlı kapalı |

**C. Mimari sınır (bug değil, tavan)**

| # | Nokta | Etki |
|---|--------|------|
| C1 | Tek kullanıcı lisans | Katman 3 B2B satılamaz |
| C2 | MCQ-only | Profesyonel / kurumsal “bu neyi kanıtlıyor?” |
| C3 | Cüzdan tavanı ₺20.000 | `12_onprem_finetune` ₺19.000; şirket paketi yok |
| C4 | Native Akademi satın alma kapalı | Dron IAP yok; doğru (PayTR B2C) |

**Cevap (soru 3):** Laboratuvarda / doğru env ile boru hattı uçtan uca kuruludur. Canlıda aksayan halka **nakit (PayTR) + sınav secret + SMTP**’dir. İçerik aksaması 02–05 ses ve 06–13 yazımdır. Sertifika sayfası kod olarak hazırdır; basılacak mühür, gerçek SETTLED + 70+ deneme ister.

---

## 4. SUNUM BİÇİMİ VE PLATFORM KURGUSU

### 4.1 Ne kurulmuş?

Hedef deneyim (Pedagoji): tam metin + ses + kayan yazı + görsel + sinema. Gün 0: **Aşama 1 compact makale**.

Oynatıcı tek kabuk, iki katman:

- `kind: "article"` — markdown, sekmeler, okuma mührü (02–05 ve mühürsüz ders).
- `kind: "article+karaoke"` — mühürlü WAV + cue `currentTime` (yalnız 01).

Metin dili SEN hitabı, Gözde eğitmen, kopyalanabilir istem kutuları, 2 dakikalık saha görevi, sonraki ders kancası. Bu, kod bilmeyen Katman 1 kitlesi için **doğru pedagojik kalıp**tır. Diyalog tiyatrosu (`DialogueTurn[]`) vitrinde kapalı — karmaşık oyuncu kadrosu vatandaşa basılmaz.

Vitrin dürüstlüğü iyidir: mühürlü SKU “Sesli anlatım + kayan metin”; diğerleri “Yazılı compact dersler. Sertifika test barajından (70+) sonra basılır.”

Antre: fiyat, KDV, müfredat outline, öğrenim çıktıları, ilerleme, sınav kapısı, PayTR adımları. Katalog sırası trend skoruna değil **müfredat kulvarına** kilitli.

### 4.2 Kurgunun zayıf yerleri

1. **Vaad ile vitrin gerilimi.** Pedagoji “satın alınan ürünün hedefi sinema” der. Dört SKU hâlâ uzun makale. Bu yanlış kurgulanmış değil; **yarım üretilmiş**. Satış cümlesi Aşama 1’e çekilmeli veya ses bandı 02–05’e uzatılmalı.
2. **Ofis dersleri 15–19 dk gövde.** Mühürlü konuşma 7–12 dk bandına çekilir; makale kesilmez. Vatandaş uzun okur, kısa dinler — iki tempo bilinçli olmalı.
3. **Sosyal / e-ticaret / chatbot** görsel-iş ürünü vaat eder; oynatıcıda baked video yoktur. “Ekran tarifi + istem” ile satılır; “benimle birlikte CapCut’ta kes” değildir.
4. **Sertifika inandırıcılığı** Katman 1’de yeter (kavram + senaryo). Aynı mühürü ₺6.900 RAG kursuna basmak, ileride itibar riskidir.
5. **Yorum 410.** İlk 50 satışta sosyal kanıt yok; Google yorum / LinkedIn mühür paylaşımı ürün dışı çözülür.

**Hüküm:** Platform kurgusu (kasa, lisans, sınav, public hash) **doğru ve olgundur.** Eğitim sunumu Katman 1 için **doğru kalıpta, eksik modalitededir.** Kalıbı yıkıp LMS / canlı Zoom / CMS’e dönmek gerileme olur.

---

## 5. SEN OLSAYDIN NE YAPARDIN?

Önyargısız sıra. “13’ü de doldur”, “önce video”, “Katman 3 prestij” — üçünü de reddederim.

### 5.1 Önce nakit halkası, sonra içerik fabrikası

Kodun stresi trafik değil **CLEARED → CREDIT → DEBIT → SETTLED → GRADED → HASH**’tir. Bunu ₺10’luk gerçek kartla bir kez yeşile boyamadan reklam basmam. Amiral (`01_office_ai`) bu halkayı taşır: sesli ürün, ₺890, en geniş kitle.

SMTP’yi aynı haftada bağlarım. Makbuz chargeback dosyasıdır; “kod kuyruğu var” yetmez.

### 5.2 Katman 1’i sat, 13’ü vaat etme

Pazarlama cümlesi: **“5 yayın eğitim; 8 yolda.”** 13’ü vitrine yazmak, 06’ya tıklayanı 404 ile düşman eder.

Satış ağırlığı (ilk 90 gün):

| Sıra | SKU | Neden |
|------|-----|--------|
| 1 | `01_office_ai` | Tek tam ürün. Beyaz yaka araması. Stres testi yüzü. |
| 2 | `05_prompt_practice` | ₺490 giriş bileti. Adet, e-posta listesi, sonraki sepet. |
| 3 | `04_chatbot_nocode` | K1 primi (₺1.290). “KOBİ’ye sat” gelir hikâyesi. |
| 4–5 | `02`, `03` | Vitrinde dursun; reklam bütçesi ilk üçte. |

Katman 2’nin ilk tuğlası içerik olarak `06_n8n_automation` olabilir — alıcısı yazılımcı değil operasyoncu, K1 kitlesine en yakın. **Vitrine alma** ta ki 30 soru + 6 makale bitsin. Katman 3’e bu yıl dokunmam: B2B altyapısı ve lab yokken ₺15–19bin MCQ satmak mührü ucuzlatır.

### 5.3 Ses: Amiral’i kopyala, Veo’yu ertele

Multimedya raporu hâlâ geçerli: yeni CMS tablosu yazma. Protokol zaten var (`docs/Bilgiler/Ders İçin Standart Üretim Protokolü.md`):

1. Spoken script  
2. TTS bake + timings (`--seal`)  
3. İdareli kapak / slayt  
4. `ACADEMY_MEDIA_SEALED_AUDIO` sicili  

Sıradaki somut üretim: **`02_ecommerce_ai-1` … `-6`** — e-ticaret gövdesi Ofis kadar kalın, ticari vaadi net. Video (Veo/micro) Anayasa rol tavanı ve maliyet yüzünden **bilinçli sıfır**; compact + ses, Gün 0’da yeter.

### 5.4 Seviye patlatma, Junior, Freelancer

Temel/Orta/İleri’ye bölmem. Talep gelen tek konuda paket açılır.

`/junior` açmam. Kodda Junior = 18 yaş altı odası, 410. Başlangıç seviyesi Akademi Temel pakettir.

Freelancer’ı silmem, uyandırmam. 6493 ve PayTR hikâyesi Akademi B2C’dir.

### 5.5 Sunum biçimini koru, yalanı kes

Compact + SEN dili + istem kutusu + saha görevi + sunucu sınavı + public hash — bu, Türkiye’de “PDF + WhatsApp grubu” eğitimlerinden ayrışma noktasıdır. Üzerine sahte sinema (canlı TTS, izlemede generate) koymak Anayasa’yı ve maliyeti bozar.

Kart metnindeki “yazılı compact” cümlesini pazarlamada da kullanırım. Amiral’i “dinle + oku”, diğerlerini “oku + uygula + mühür” diye ayırırım. Ses bitince cümleyi yükseltirim.

---

## 6. SATIŞA %100 HAZIRLIK — SOMUT SONRAKİ ADIMLAR

Sıralı. Paralel şişirme yok.

### Faz 0 — Açılış kilidi (1–3 gün, ops)

| # | İş | Bitti sayılması |
|---|-----|-----------------|
| 0.1 | PayTR canlı + callback + ₺10–20 yükleme | `PaymentOrder=CLEARED` + ledger CREDIT |
| 0.2 | Aynı hesapla `01_office_ai` satın al | SETTLED + makbuz log’u |
| 0.3 | 6 ders okuma mührü + sınav ≥70 | Sertifika satırı |
| 0.4 | `/academy/dogrula/[hash]` anonim tarayıcı | `sealStatus=valid` |
| 0.5 | `ACADEMY_EXAM_SITTING_SECRET` üretim | Sınav 503 değil |
| 0.6 | SMTP çifti | Kutuya makbuz; yoksa “atlandı” log’u bilinçli |

0.1–0.4 yeşil değilse site vitrin olarak kalır, performans reklamı açılmaz.

### Faz 1 — Katman 1’i dürüst sat (Gün 0–30)

| # | İş |
|---|-----|
| 1.1 | Reklam ve SEO metnini 5 SKU + Amiral ses rozeti ile hizala; “13 eğitim” yazma |
| 1.2 | `05` hunisi, `01` kahraman, `04` prim |
| 1.3 | İade / 6502 mesafeli sözleşme cümleleri antrede zaten var; ilk iade prosedürünü Runbook’a tek sayfa yaz |
| 1.4 | 02–05 için spoken script kuyruğunu başlat (e-ticaret önce); vitrinden çekme |

### Faz 2 — Ses bandı (Gün 30–90, içerik)

| # | İş |
|---|-----|
| 2.1 | `02_ecommerce_ai` 6/6 mühür (Ofis protokolünün kopyası) |
| 2.2 | `04` sonra `03` sonra `05` (prim ve görsel vaat; prompt kısa masterclass) |
| 2.3 | `06_n8n_automation` master + 30 soru **taslak**; vitrin kilidi durur |

### Faz 3 — Bilinçli erteleme (bu yıl değil)

- Katman 3 içerik ve B2B toplu lisans  
- Veo / micro-video CMS  
- Canlı TTS  
- Junior odası  
- Freelancer Split  
- Her konuyu Temel/Orta/İleri üçe bölmek  

---

## 7. SON HÜKÜM

Akademi modülü **yarım bir fikir değil, yarım modaliteli bitmiş bir dükkândır.**

- Dükkânın kasası, sınavı ve public mührü duruyor.  
- Reyonda 5 ürün var; birinin sesi açık.  
- Depoda 8 etiket asılı, kutu boş.  
- Pazar kataloğu ile kod aynı 13 ismi konuşuyor — sapma yok, üretim gecikmesi var.

%100 satışa hazır = **Faz 0 nakit tanığı + dürüst Katman 1 vaadi.** Ses ve Katman 2, hazır olduktan sonra reyon genişler. Katman 3, mührün ucuzlamaması için kapalı kalır.

Bu rapor kod değiştirmez; sicildir. Uygulama emri ayrıca verilir.
