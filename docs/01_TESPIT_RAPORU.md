# 01 — Tespit Raporu

| Alan | Değer |
|------|--------|
| Tarih | 8 Eylül 2026 |
| Makam | Cursor ajanı (Grok 4.6) — Tespit Aşaması |
| Kapsam | Canlı yayın (`https://yetkin.ai`) + yerel çalışma ağacı (`D:/yetkin.ai`) + `.system_docs` |
| Durum | PayTR canlı onay sürecinde (işletme beyanı). Bu rapor gizli env değeri okumaz. |
| Çıktı | Denetim, eleştiri, strateji. Kod değişikliği yoktur. |

**Okuma notu:** Canlı site ile yerel ağaç **aynı ürün değildir.** Aşağıdaki her yargı hangi yüzeye ait olduğunu belirtir. Tedavi Aşaması bu sapmayı kapatmadan “yeni katalog yayına alındı” denemez.

---

## 0. Yönetici özeti — üç cümle

1. **Omurga ayaktadır.** `GET https://yetkin.ai/api/health` 200: veritabanı, Supabase Auth, Inngest ve PayTR Merchant üçlüsü `configured`. PayTR Bildirim URL `GET /api/paytr/callback` düz metin `OK` döner. Yasal sayfalar, iletişim, kayıt rızası ve sertifika doğrulama kamuya açıktır.
2. **Ürün yüzü eski, gelir yüzü yeni yazılmıştır.** Canlı vitrin hâlâ “güvenli kariyer ve iş platformu” + eski 13+ kurs (Python / Full-Stack / sızma testi / Canva / Ads) satar; ana sayfa “ödeme henüz bağlanmadı” der. Yerel ağaç ise Akademi kahramanı, 5 compact SKU, PayTR iFrame kopyası ve `MARKETPLACE_SPLIT_LIVE = false` ile güncellenmiştir. **Bu sapma A5 (dürüst yüzey) ihlali riskidir.**
3. **Stratejik cevap evettir, ama Junior çocuk ürünü değildir.** Sıfır kullanıcı / sıfır işveren evresinde nakit ve hikâye Akademi + Katman 1 (başlangıç) compact SKU’lara kaymalıdır. Donmuş `/junior` (reşit olmayan) odası açılmamalıdır. Mimari (modüler monolit + Shared Kernel) bu kaymaya uygundur; mikroservis parçalaması gerekmez. Tedavi’nin ilk işi kod yazmak değil: **canlıyı yerel gerçekle hizalamak ve Merchant’ı ilk CLEARED tanığa götürmek.**

---

## 1. Adım 1 — Canlı yayın ve genel sağlık

### 1.1 Dışarıdan doğrulanan canlı sinyaller (8 Eylül 2026)

| Yüzey | Sonuç | Not |
|-------|--------|-----|
| `GET /api/health` | 200, `ok: true` | `db=ok`, `supabaseAuth=configured`, `inngest=configured`, `payments=configured`, `examSitting=configured` |
| `GET /api/paytr/callback` | 200, gövde `OK` | PayTR canlı-mod yoklaması; CREDIT yazmaz |
| `GET /` | 200 | Eski kopya: “Güvenli kariyer ve iş platformu”; güven maddesi “Ödeme henüz bağlanmadı / pasif” |
| `GET /academy` | 200 | Eski katalog: AI Agent / Python / Full-Stack / Siber / YZ / UI-UX / Excel / Google Ads / Meta Ads / E-ticaret / Canva / LinkedIn |
| `GET /freelancer` | 200 | 5 tohum ilan, işveren `yetkin.ai`, eski ihtiyaç listesi, “Yapay Zekâ Mühendisliği sertifikası” kapısı |
| `GET /legal`, `/legal/gizlilik`, `/legal/kullanim` | 200 | Künye, KVKK, mesafeli, iade, kullanım; **yürürlük 31 Ağustos 2026** |
| `GET /iletisim` | 200 | Unvan, VKN, MERSİS, adres, IBAN, destek, WhatsApp, idari e-posta |
| `GET /academy/dogrula` | 200 | Oturumsuz SHA-256 doğrulama formu |
| `GET /robots.txt` | 200 | Yasal yollar açık; `Sitemap: https://yetkin.ai/sitemap.xml` |
| `GET /sitemap.xml` | **500** | SEO ve mağaza incelemesi için canlı kusur |

`checks.payments=configured` **yalnızca** `PAYTR_MERCHANT_ID / KEY / SALT` üçlüsünün dolu olduğunu söyler. Mağaza paneli onayı, iFrame yetkisi, `PAYTR_SANDBOX` boşluğu ve ilk `CLEARED` defter satırı bu alandan okunmaz (`.system_docs/OPS_RUNBOOK.md` §4.1–4.3).

### 1.2 Canlı ≠ yerel — sapma tablosu (kritik)

| Konu | Canlı `yetkin.ai` | Yerel çalışma ağacı |
|------|-------------------|---------------------|
| Ana sayfa H1 | “Güvenli kariyer ve iş platformu” | “Yetkinliğini kanıtlayan yapay zekâ eğitimleri” |
| Ödeme kopyası | “Ödeme henüz bağlanmadı / pasif — sahte bakiye yazılmaz” | “Cüzdan yüklemesi PayTR iFrame ile alınır; kart numarası platformda tutulmaz” |
| Kahraman | Akademi → Kanıt → İlan/İş eşit merdiven | Akademi kahraman; Kariyer/Freelancer dipnot |
| Akademi vitrin | Eski Temel/Orta/İleri + masterclass (AI-101…LNK-MC), fiyat ₺690–1.990 | 5 compact SKU: `01_office_ai` … `05_prompt_practice` (₺490–1.290 tohum) |
| Ses vaadi | Kartlarda yaygın “Seslendirmeli İçerik” | Mühürlü WAV **2** (`01_office_ai-1`, `-2`); diğer dersler makale |
| Hukuk yürürlük | 31 Ağustos 2026; kasa rızası metinde `2026-08-31` | 5 Eylül 2026; `CHECKOUT_LEGAL_CONSENT_VERSION = "2026-09-05"` |
| Freelancer ihtiyaçlar | Siber güvenlik, AI Agent, Web & yazılım… | 5 Garantili Kapı (compact SKU) + Standart Pazaryeri (vizesiz) |
| Teklif kapısı | “Yapay Zekâ Mühendisliği sertifikası” | Yayın SKU belgesi (`OFF-101` … `PR-105`) |
| Pathway | Canlıda “Seviye Yolu” dolu | `ACADEMY_PATHWAY_IDS = []` (boş vitrin, dürüst) |

Yerel ağaçta eski müfredat dosyaları silinmiş (`lib/academy/curricula/python-*`, `fullstack-*`, `security-*`, `excel-masterclass` vb. git durumunda `D`). **Canlı hâlâ onları satıyor.** Kullanıcı bir kurs alıp yerel Tedavi 01 katalog kesimini deploy ederse lisans/içerik kopması doğar. Bu, nakit açılmadan önce kapatılması gereken en büyük operasyonel risktir.

### 1.3 Modüller — kod ve mimari uyum

Kaynak: `lib/kernel/rooms.ssot.ts`, `lib/kernel/bounded-contexts.ts`, `lib/kernel/modules.ts`.

**Çalışan 4 oda (nav gerçeği):** `dashboard`, `academy`, `career`, `freelancer`.  
**4 sığınak:** `/profil`, `/cuzdan`, `/pasaport`, `/admin`.  
**Donmuş 8 oda (HTTP 410):** studio, devlabs, kurumsal, hibe, arena, pazaryeri, **junior**, social.

Bounded context sicili üç çekirdeğe iner; odalar buna oturur:

| Context | Odalar | Prisma örnekleri | Kural |
|---------|--------|------------------|--------|
| **Proof** | academy, career | kurs, sınav, sertifika, vize damgası, portföy | Proof deftere yazmaz |
| **Marketplace** | freelancer | ilan, teklif, sözleşme, mesaj, uyuşmazlık | Hash’i imza diye satmaz |
| **Payments** | cüzdan / kasa | Wallet, LedgerEntry, EscrowHold, PaymentOrder | Usta IBAN’ını Rail ödemez |

**Uyum (doğru kurgulanmış olan):**

- Tek kimlik (Supabase Auth JWT) → Prisma vatandaş satırı → cüzdan + pasaport.
- Akademi mühür (`userId · courseId · attemptId · score · issuedAt · curriculumSeal`, SHA-256, baraj 70, sunucu puan) Kariyer’de vize damgasına projekte edilir (`syncCareerVisaStamps`).
- Freelancer teklif kapısı Kariyer vizesini okur; Akademi `lib`’ini import etmez (katalog kimliği kernel’de).
- Dashboard nabız üç odayı okur; `resolveNextBestAction` split kapalıyken **Akademi’ye** düşer (`lib/dashboard/next-best-action.ts`). Bu, manifesto Motor 1 ile kodun hizalandığı yerdir.
- Kabuk (`AppShellSwitch` + `SidebarNav`) dört odayı eşit çip gibi basar; NBA ise Akademi’yi öne alır. **Nav ile gelir hikâyesi çelişir.**

**Uyumsuzluk / sürtünme:**

1. **Eşit oda dogması.** `VERTICAL_ROOMS` ve yan menü Freelancer’ı Akademi ile aynı ağırlıkta gösterir. Manifesto ve NBA “nakit Akademi’dedir” der. Canlı ana sayfa hâlâ üç motorlu merdiven satar.
2. **Kariyer bağımsız ürün değildir.** Hedef rol, yetenek haritası, mülakat oyunu yok; salt mühür projeksiyonu. Bu doğru sadeleştirmedir. “Kariyer odası olgun” iddiası abartıdır.
3. **Freelancer tam motor, nakit yok.** İlan / teklif / mesaj / sözleşme / uyuşmazlık kodu çalışır. `beginHold` stub → `not_configured` → kabul **503**. Canlı 5 tohum ilan gerçek iş gibi durur; işveren `yetkin.ai`, bütçe ₺3.500–8.500. A5: “açık pazar” izlenimi, nakit kapalı.
4. **13 SKU kanon / 5 canlı vitrin.** `ACADEMY_CANON_SKU_SLUGS` 13 kimlik tutar; vitrin 5 ingest SKU. Ajan ve ops belgelerinde “13 kurs satıyoruz” hayali doğar. Canlı ise **üçüncü bir gerçek** (eski Python–Ads kataloğu) basar.
5. **Dron.** `apps/rail-is` + `/api/v1` zarfı (`{ ok, error, requestId, apiVersion, data }`) durur; README “Faz 1 kapanana kadar yayın hattı donuktur.” Mobil ikinci cephe, gün 0 kahramanı değil.

**Sonuç:** Mimari omurga (kernel + dört dikey + üç context) **tutarlıdır.** Uyumsuzluk mimari değil **yayın ve ürün ağırlığıdır.**

### 1.4 Kullanıcı profili — kullanıma hazır mı?

| Parça | Kod | Canlı/ops notu |
|-------|-----|----------------|
| Kayıt | `/register`: ad, e-posta, şifre, **18+ tiki**, kullanım + KVKK tiki (slug’lara link) | Metadata: `age_confirmed_at`, `kvkk_confirmed`, `consent_version` |
| Giriş / şifre | `/login`, unuttum, yenile | Confirm email üretimde zorunlu (runbook §3) |
| Profil | `/profil`: görünen ad, locale, katılım, fatura/fatura kimliği formu | TCKN/VKN fatura için; cüzdan ayrı sığınak |
| Cüzdan | `/cuzdan` + hızlı yükleme + PayTR iFrame (yerel) | Canlı kopya hâlâ “ödeme bağlanmadı” |
| Pasaport | `/pasaport`: damga listesi | Kariyer basar, pasaport listeler |
| Admin | `/admin`, müfredat revizyonu | `SUPER_ADMIN_USER_ID` UUID eşitliği |
| KVKK m.11 silme/indirme | Ürün içi self-serve **yok** | Super Admin `destek@yetkin.ai` kuyruğu (`OPS_RUNBOOK.md` §18) |

**Eksik / zayıf (kullanıma “hazır” iddiasını düşürenler):**

- Hesap silme ve veri indirme self-serve değildir. Gün 0 için kabul edilebilir; PayTR / tüketici denetiminde “nasıl silerim?” cevabı e-posta SLA’sına bağlıdır.
- VERBIS kayıt numarası yasal metinde yoktur.
- Saklama süreleri nicel değildir (“defter değiştirilemez” ile silme hakkı gerilimdedir; dürüst anlatılmalı, süre yazılmalı).
- Çerez banner yoktur. Metin yalnız zorunlu oturum çerezi + PayTR sağlayıcı çerezi iddia eder; pazarlama çerezi yoksa banner şart olmayabilir — ama PayTR iFrame üçüncü taraf çerezi açar; bunu “ayrı izin istenmez” diye geçiştirmek ince buzdur.
- Unvan “Gayrimenkul ve E-Ticaret” vs faaliyet “dijital eğitim”. Metin bunu **dürüstçe** açıklar (`LEGAL_ACTIVITY_SCOPE_BODY`). NACE/faaliyet uyumsuzluğu riski kapanmış değil; avukat/mali müşavir teyidi ürün kodunun işi değildir, **açık ops borcudur.**
- `/iletisim` IBAN basar. S43: platform çekim rotası yoktur. IBAN havale beklentisi doğurabilir; “yalnız resmi ticari hesap / iade takası” cümlesi güçlendirilmeli.

Profil **açılış için yeterlidir** (18+, rıza, künye, fatura alanları, oturum). “KVKK olgun ürün” değildir.

### 1.5 Yasal sayfalar — eksiksiz mi?

Kanonik slugs (`lib/copy/legal-launch.ts` + `next.config` 301):

| Slug | Başlık | Canlı |
|------|--------|--------|
| `/legal/gizlilik` | Gizlilik + KVKK aydınlatma | 200 |
| `/legal/cerez` | Çerez politikası | robots’ta açık |
| `/legal/iade` | İptal ve iade | robots’ta açık |
| `/legal/mesafeli-satis` | Ön bilgi + mesafeli satış | robots’ta açık |
| `/legal/kullanim` | Kullanım şartları | 200 |
| `/legal` | Dizin / birleşik çerçeve | 200 |
| `/iletisim` | Künye + destek | 200 |
| `/legal/kvkk` | 301 → gizlilik | kodda var |

**Hazır olan:** Veri sorumlusu kimliği (Yapınet … Ltd. Şti., VKN 9370683361, MERSİS, Akhisar adresi), 18+, KVKK m.11 kanalı, çerez iddiası, dijital ifa / cayma istisnası (6502 + Mesafeli Sözleşmeler Yönetmeliği m.15), cüzdan çekim yasağı, freelancer split dürüstlüğü, tüketici hakem heyeti / mahkeme, kasa tikleri + `consentVersion`, PayTR’nin kartı tutmadığı cümlesi, SSL + PayTR markası (yerel footer).

**Eksik / zayıf:**

1. Canlı yürürlük **31 Ağustos**; yerel **5 Eylül** + consent `2026-09-05`. Deploy edilmeden kasa ve metin sürümü ayrışır.
2. VERBIS, DPO adı, saklama takvimi, alıcı ülke (Supabase bölgesi) yok — “uydurma konum yazılmaz” dürüst ama zayıf.
3. GİB / e-arşiv canlı değildir; metin “fatura e-postaya gider, anında GİB değil” der. Muhasebe sürecinin gerçekten işlemesi kod dışı teyittir.
4. Canlı kullanım şartları “dört oda (Anasayfa, Akademi, Kariyer, Freelancer)” der; yerel “Panel, Akademi…”. Küçük ama hukuk metni sapması.
5. `sitemap.xml` 500 — Google Search Console ve bazı ödeme/mağaza incelemeleri sitemap ister.

**PayTR onayına yeterlilik:** Mesafeli + iade + gizlilik + künye + SSL yüzeyi **teknik olarak masada.** Onayın hukuki/idari kısmı (sözleşme, faaliyet belgesi, unvan-NACE) bu ajanın göremediği klasördür.

### 1.6 PayTR — canlıya geçiş teknik hazır-bulunuşluk

İki port ayrımı (Anayasa A2, runbook §4) doğrudur ve kodda tutulmuştur.

#### Merchant Port (Akademi / üye işyeri) — gün 0 nakit

| Madde | Durum |
|-------|--------|
| Adaptör | `PaytrPaymentProvider` — `get-token` + iFrame, yalnız TRY |
| Kasa | Cüzdan yükleme → CREDIT (webhook/valör) → Akademi DEBIT |
| Webhook | `/api/payments/webhooks/paytr` kanon; `/api/paytr/callback` aynı handler (ikinci CREDIT ağzı değil) |
| HMAC | `merchant_oid + salt + status + total_amount`, timing-safe; sahte imza 403 |
| Idempotency | `payment_orders FOR UPDATE` + `wallet-top-up:{oid}` unique |
| Üretim kalkanı | `PAYTR_SANDBOX` / `PAYTR_ALLOW_MOCK_CHECKOUT` doluysa **throw**; CREDIT yok |
| Bant | ₺10–₺20.000 (`WALLET_TOP_UP_*`) |
| Inngest | `paytr-clearing-scan` 30 dk; port kapalıysa no-op. Canlı `inngest=configured` |
| Kenar | JWT/Origin/bakım webhook yollarını atlar (`proxy.ts`) |
| CSP | `frame-src` PayTR (test yüzeyi) |
| Kullanıcı IP | Üretimde loopback/RFC1918 fail-closed; **Cloudflare→Vercel `TRUSTED_PROXY_HOPS=2`** |
| Faturalama alanları | Ad, telefon, adres — PayTR sepet/kullanıcı; kart platformda tutulmaz |
| Kasa rızası | Mesafeli + anında ifa tikleri, sürüm kilidi |

**Hazır:** Kod yolu Merchant için drop-in. Onay + canlı üçlü Vercel Production secret’a yazılır; PR gerekmez (runbook). Preview’a canlı üçlü konmaz.

**Bu ajanın doğrulayamadığı (Tedavi’de ops kontrol listesi):**

- [ ] Panelde mağaza **aktif** ve **iFrame yetkisi** açık mı?
- [ ] Bildirim URL birebir `https://yetkin.ai/api/paytr/callback` mı?
- [ ] Üretimde `PAYTR_SANDBOX` ve mock **boş** mu? (health bunu göstermez)
- [ ] `TRUSTED_PROXY_HOPS=2` Production’da mı?
- [ ] `NEXT_PUBLIC_APP_URL=https://yetkin.ai` (http/localhost değil) mi?
- [ ] İlk tanık: `PaymentOrder.status=CLEARED` + `LedgerEntry` CREDIT `wallet-top-up:{oid}` (₺10–20.000 bandı, elle SQL yok)

Canlı ana sayfanın “ödeme bağlanmadı” demesi, üçlü doluyken **ya eski deploy’dur ya da panel henüz aktif değildir.** İkisi de A5’e dokunur: env dolu + vitrin “pasif” = kullanıcıya hangi gerçeğin söylendiği belirsizdir. Tedavi: ya kopyayı “onay bekleniyor” diye netleştir ya da Merchant açılınca akademi-first kopyayı deploy et — **ikisini birden bırakma.**

#### Pazaryeri Split Port (Freelancer) — kasıtlı kapalı

`MARKETPLACE_SPLIT_LIVE = false`. `paytrMarketplaceSplitPort.beginHold/settle` → `{ ok: false, reason: "not_configured" }`. Kabul 503. Wallet-escrow “geçici iç banka” olarak büyütülmemiş — A2 ile uyumlu.

**Sonuç:** Merchant teknik olarak canlıya yakın; Split **bilinçli olarak gün 0 dışı.** PayTR onay süreci Merchant’ı açar, Freelancer nakitini açmaz. Bu ayrımı panel ve yatırımcı dilinde korumak şarttır.

---

## 2. Adım 2 — Kutsal dokümanların sorgulanması

Belgeler `.system_docs/` altındadır (`ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`). `/docs` build fixture değildir. Ürün kodu bu markdown’ı import etmez — doğru.

Bu bölüm doğrulama değil **sorgulama:** kuralın kendisi bizi yavaşlatıyor mu, yoksa gerçek bir kaybı mı önlüyor?

### 2.1 ANAYASA — A katmanı (sert)

| Madde | Yargı |
|-------|--------|
| **A1 `amountMinor` + tek defter** | Korunmalı. Float para ve User bakiyesi felakettir. Maliyet: disiplin; fayda: denetim. |
| **A2 S43 / 6493** | Korunmalı. Lisanssız holding + çekim platformu öldürür. Split stub’ı “eksik özellik” değil **yasal kapıdır.** |
| **A3 RLS/IDOR/sır/idempotency** | Korunmalı. |
| **A4 sunucu mühür, satın alınamaz kanıt** | Korunmalı. Baraj 70 + SHA-256 vitrin vaadinin omurgası. |
| **A5 dürüst yüzey** | Korunmalı — **ve şu an canlıda en çok ihlal edilen ruh.** Eski katalog + “ödeme yok” + health `payments=configured` + 5 sahte-iş ilanı. |

A katmanı gelişimi yavaşlatmaz; **şirketi yaşatır.** “Kolaylaştıralım” PR’ı A’ya uzanmamalı.

### 2.2 ANAYASA — B katmanı (esnek) — asıl sürtünme burada

Eylül 2026 reformu (grep polisi, kelime avı, katman duvarı B’ye çekildi) **doğru yöndedir.** Kalan sürtünmeler:

1. **B2 “dört ana odak” eşit kimlik.** Nav, test, hukuk ve ajan zihniyeti dört odayı olgun ürün sanır. Manifesto Motor 1’i kahraman yapar. B2 cümlesi “odak = nakit halkası değildir” diye yumuşatılmış; pratikte yan menü hâlâ eşit. **B2, Akademi-first kararıyla çelişen bir ürün anayasasıdır.** Öneri: B2’yi “kahraman oda Akademi; diğerleri projeksiyon / ilan tahtası” diye yaz; nav’ı buna bağla. Dört odayı silmek değil, **ağırlık vermek.**
2. **13 SKU kanon.** Pedagoji ve `course-slugs.ts` 13 kimliği “pazar analizi gerçeği” diye dondurur. Vitrin 5. Canlı 13+ eski. Üç gerçek kaynak ajanı ve Super Admin’i yorar. Kanon bir **backlog sicili** olmalı; yayın listesi tek SSOT (`ACADEMY_GROWTH_SKU_SLUGS`). 06–13’ü “onaylı ingest bekliyor” diye bırakmak doğru; onları fiyat haritasında ₺3.900–19.000 ile yaşatmak “yakında satacağız” baskısı üretir.
3. **B4 “konunun hakkı” vs sabit 6 ders.** Pedagoji “sabit ders adedi yayın makalesini kesmez” der; `ACADEMY_GROWTH_LESSON_COUNT = 6` ve ingest 6 bölüm dayatır. Ofis kursu 6 makale isteyebilir; prompt masterclass 3 de yeter. Sabit 6, maliyet kalkanı değil **şablon tembelliği** riskidir.
4. **B3 esnek test.** İyi. `verify:prebuild` A’ya indirgendiyse ajan hızlanır. Nightly kelime avını tekrar derleme kapısı yapmayın.
5. **B5 graceful degradation.** Redis/Inngest/e-posta yokken nakit durmasın — doğru. Inngest canlıda `configured`; webhook defer’te Inngest boşsa ACK yok (doğru fail-closed).

### 2.3 MANİFESTO — zaten Akademi-first, üretim geride

8 Eylül “Tedavi 01” notu: Motor 1 kahraman, vitrin 5 compact SKU, Motor 3 Split 503, Motor 2 Faz 2+.

**Belge ile canlı çelişkisi:** Manifesto güncellenmiş; **canlı vitrin güncellenmemiş.** Vizyon belgesi koddan / deploy’dan önde gidince “anayasa yalan söylüyor” algısı doğar. Manifesto’yu her bake’te güncellemeyin (doğru ayrım: stüdyo sayıları OPS’te); ama **vitrin cümlesi deploy ile aynı commit’te** yürümeli.

**Kural 2 (5 Garantili Kapı + Standart Pazaryeri) sorgusu:**

- Vizyon olarak güçlü: “belgesiz teklif yağmuru yok.”
- Gün 0, sıfır işveren: **kapı, olmayan pazarı kilitlemez; öğrenen kullanıcıyı korkutur.** Canlı tohum ilanlar eski “YZ mühendisliği” belgesi ister — yerel 5 SKU ile bile eşleşmez. Çift katman (vize + vizesiz OPEN) gün 0 için fazla sofistike. Büyüme deneyi OPEN ilanlarda olmalı; Garantili Kapı, **ilk gerçek işveren + ilk mühürlü belge** sonrası sertleşmeli.
- Açık Deneme doğru bir emniyet subabı. Formda durması yeterli; 5 tohum işi “garantili” gibi satmak değil.

**Motor 2 (B2B kurumsal):** “Akademi B2C oturmadan B2B odası açılmaz” — doğru. Donmuş `kurumsal` 410 kalsın.

**Hedef kitle 1.3:** “uzmanlar + işverenler” çift taraflı marketplace. Sıfır arz/talepte bu cümle **ürünü iki ateş arasında bırakır.** Gün 0 kitle: **öğrenen pratisyen** (ofis, e-ticaret, içerik, chatbot, prompt). İşveren Faz 2 hikâyesidir.

**Quiet Luxury + SEN:** Ürün tercihi, dogma değil — belge öyle diyor. Korunabilir. Ajanın her PR’da “sen aksı” kelime avı yapması B3 ile çelişir; zaten nightly’e çekilmiş olmalı.

### 2.4 PEDAGOJİ — doğru sıra, erken sinema riski

Güçlü ve sorgulanması gerekenler:

| İlke | Sorgulama |
|------|-----------|
| Aşama 1 compact markdown = canlı standart | **Doğru.** İlk gelir için yeterli. “Sesli sat, makale ver” canlı eski katalogda yaygındır — A5. |
| Aşama 2–3 sıra: metin → konuşma → mühürlü ses → cue → görsel | **Doğru.** Geçmiş felaket (UI+TTS+DOM aynı anda) tekrarlanmasın. |
| İzlemede canlı TTS yok; `generateSpeech`/`listen` 410 | **Doğru.** Kota ve gizli fatura kalkanı. |
| Amiral `01_office_ai`; diğerleri Aşama 1’de kalabilir | **Doğru.** 5 kursu birden sinemaya çekmek nakitten önce stüdyo iflasıdır. |
| “Garsonu göster” somut anlatım | Compact makalede lab zorunlu değil. Risk: **okuma mührü, uygulama mührünün yerine geçer.** İlk iade/şikayet “video yok / pratik yok” olur. Tedavi: her SKU’da 1 saha görevi + sınav (zaten C zinciri); lab’ı Aşama 2’ye ertelemek OK, **sınavı zayıf bırakmak değil.** |
| SEN + dolgu yasağı | İyi. Grep polisi olmasın. |
| 13 başlık sicili vs 5 vitrin | Yukarıda. Pedagoji “vitrin 13 satmaz” der — canlı **13+ eski satar.** |
| Sabit 6 bölüm | B4 ile gerilim. |
| Karaoke yalnız mühürlü derste | STORAGE: 2 WAV. Yerel vitrin amiralde “Sesli anlatım” rozeti — dürüst (kısmi). Canlı tüm AI-101 hattını sesli gösterir — dürüst değil. |

**Pedagoji bizi yavaşlatır mı?** Aşama 3 `--seal` disiplini **yavaşlatmalıdır**; aksi halde fatura ve hayalet medya. Yavaşlatmaması gereken: Katman 1 metin iterasyonu, sınav havuzu, fiyat, vitrin kopyası. Bunları anayasa A’sına bağlamak hatadır.

### 2.5 Kutsal belgeler — kısıtlayan / mantıksız kalan maddeler (düz liste)

1. Dört odayı eşit “çalışan ürün” diye okumak (B2 + nav + canlı merdiven).
2. 13 kanon fiyatı + eski canlı katalog + 5 compact yerel = üç gerçek.
3. Garantili vize kapısı, sıfır işveren + tohum ilan üzerinde.
4. Canlı “Seslendirmeli” rozeti vs 2 mühürlü WAV (yerel) / muhtemel eski medya (canlı).
5. Manifesto’nun production’dan önde gitmesi (belge yalan değil, **yayın gecikmesi**).
6. Junior’ı (çocuk ürünü) “başlangıç seviyesi” ile karıştırmak — bir sonraki bölüm.
7. KVKK m.11’i sonsuza kadar e-posta kuyruğunda bırakmak (A katmanı değil; ölçekte kırılır).
8. Unvan–faaliyet gerilimini “dürüst paragraf” ile kapatılmış saymak.

**Kısıtlamayan, dokunulmaması gereken:** A1–A5, S43, sunucu sınav, split stub, fail-closed CREDIT, 18+.

---

## 3. Adım 3 — Stratejik değerlendirme

### 3.1 Sen olsaydın ne yapardın? — Akademi + “Junior seviye”

Sorunun iki okuması var; **karıştırılmamalı:**

| Okuma | Karar |
|-------|--------|
| **A) Donmuş `/junior` odası** (reşit olmayan, veli, KVKK vekâlet) | **Hayır. Açılmaz.** `JUNIOR_PRODUCTION_LOCKED`, 18+ platform, EİDS ile aynı sınıfta yasal kilit. “Kullanıcı yok, çocuklara açalım” hem hukuki hem marka intiharı. |
| **B) Junior = başlangıç / Katman 1 pratisyen** (ofis, e-ticaret, içerik, chatbot, prompt) | **Evet. Odak burasıdır.** Pazar kataloğu (`docs/Bilgiler/PAZAR_EGITIM_KATALOGU_ONERISI.md`) Katman 1’i pazarın %80’i sayar. Yerel 5 SKU tam olarak bu. |

**Freelancer’ı bu evrede nakit motoru yapmak yanlış.** Split yok, işveren yok, tohum ilanlar platformun kendi işi. İlan/teklif kodunu **silmeyin** (mimari borç ve Faz 2 ucuzlar); vitrin ve ana CTA’dan **indirin.** Manifesto bunu yazmış; canlı uygulamamış.

**Kariyer’i bu evrede büyüme motoru yapmak yanlış.** Belge yoksa vitrin boş. Kariyer, Akademi dönüşüm hunisinin **son ekranıdır** (paylaşılabilir mühür), ayrı satış vaadi değil.

**Yapardım:**

1. Tek kahraman: Akademi Katman 1. Ana CTA “Eğitimleri incele”. Freelancer “ilan tahtası · emanet yok” dipnot.
2. Canlı eski kataloğu **kes.** Python/sızma/Ads’i satmaya devam etmek hem pedagoji hem iade hem “sesli” vaadi hem vize kapısı açısından zehir.
3. PayTR Merchant’ı ilk gerçek ₺ ile aç. Split’e dokunma.
4. Sınav + mühür + `/academy/dogrula` paylaşım döngüsünü (LinkedIn/WhatsApp) ürünleştir — freelancer değil, **belge gururu** ilk sosyal kanıt.
5. 06–13 ve sinema bake kuyruğunu gelir sonrası stüdyo defterine bırak.

**Yapmazdım:** mikroservis, Junior çocuk, kurumsal oda, Pazaryeri Split “şimdilik iç cüzdan”, 8 donmuş odayı diriltme, 13 kursu birden yazma.

### 3.2 Mimari sorgulama — Core + Micro-Apps / Shared Kernel

README’nin dürüst tanımı: **modüler monolit + API-First dron sözleşmesi.** “Shared Kernel paketi veya mikroservis platformu değildir.”

Bu kurgu Akademi-first kaymasına **uygundur:**

- Kernel (auth, defter, PayTR Merchant, kimlik, fiyat kataloğu, hukuk rızası) odalardan bağımsız.
- Akademi dikeyi nakit halkasını Payments portundan geçirir; Proof sınavı yazar.
- Career kernel proof’u okur.
- Freelancer marketplace portuna bağlı; port stub iken oda **listeler, tahsil etmez.**
- `/api/v1` dron için durur; Amiral RSC yükler. İki kanal tek defter.

**Platform kurgusu doğru mu?** Omurga evet. Ürün kurgusu (dört eşit oda + çift taraflı pazar + 13 kanon) gün 0 için **şişkin.** Mimariyi parçalamak değil, **yüzey ağırlığını** değiştirmek gerekir.

Mikroservis / ayrı “Akademi app” şimdi: ortak kimlik, ortak cüzdan, ortak mühür ve ortak hukuk yüzünden maliyet > fayda. Bounded context sicili zaten dikey sızıntıyı tarif ediyor; ESLint/tip yeterli (B1).

**Tek mimari borç (Tedavi’de tasarım, kod yağmuru değil):** yayın katmanı. `ACADEMY_GROWTH_SKU_SLUGS` tek vitrin SSOT; canlı DB `PriceCatalogEntry` + kurs tohumu bununla **aynı kesit.** Eski SKU’lar `isPublished=false` veya DROP. Freelancer tohum ilanları ya kalkar ya “örnek / nakit yok” damgası taşır.

### 3.3 Sonraki adım — Tedavi Aşaması’nda ilk iş

Öncelik **teknik gösteriş değil, dürüst nakit halkası.**

#### T0 — Yayın sapmasını kapat (bloklayıcı)

1. Super Admin: canlı mı yoksa yerel mi **kanon**? Bu raporun varsayımı: yerel Tedavi 01 (5 SKU, Akademi-first) hedeftir; canlı geride kalmıştır.
2. Deploy öncesi: canlıda eski kurs satın alan vatandaş var mı? Varsa migrasyon/iletişim planı olmadan katalog kesme.
3. `sitemap.xml` 500’ü düzelt (canlı SEO/PayTR inceleme).
4. Ana sayfa kopyası health/gerçekle hizala: Merchant onayında “onay bekleniyor”; açılınca PayTR iFrame cümlesi. İkisini birden bırakma.

#### T1 — PayTR Merchant ilk tanık (nakit)

Runbook §4 kontrol listesi, sır icat etmeden: panel iFrame, Bildirim URL, sandbox/mock boş, `TRUSTED_PROXY_HOPS=2`, ₺10–bandı gerçek kart, `CLEARED` + CREDIT. Split **hayır.**

#### T2 — Akademi hunisi (ürün)

5 compact SKU vitrin, antre, compact oynatıcı, kasa tikleri, sınav (havuz 30–50, çekim 10, 30 dk, baraj 70), mühür, doğrulama sayfası. Amiral seste 2 WAV ile dur; 3–6. ders bake’i gelir sonrası.

#### T3 — Freelancer’ı küçült, silme

Nav ikincil. Tohum ilanları kaldır veya “platform örneği / emanet kapalı” diye işaretle. Kabul 503 kopyasını vatandaş dilinde tut. Split ve Junior çocuk yok.

#### T4 — Bilinçli erteleme

Kurumsal, Dron mağaza, Aşama 3 tam sinema, 06–13 ingest, KVKK self-serve portal, GİB, VERBIS metin (hukuk danışmanı), mikroservis.

**İlk Tedavi PR’ının konusu (öneri):** “Canlı vitrin ve hukuk tarihini 5 SKU / Akademi-first / Merchant dürüst kopya ile hizala; sitemap 500 kapat; freelancer tohum işlerini örnek olmaktan çıkar.” Yeni motor yazma.

---

## 4. Kanıt özeti (kaynaklar)

| İddia | Kaynak |
|-------|--------|
| Health 200, payments configured | `GET https://yetkin.ai/api/health` (8 Eylül 2026) |
| PayTR probe OK | `GET https://yetkin.ai/api/paytr/callback` |
| Canlı eski ana sayfa / katalog / ilan | `GET /`, `/academy`, `/freelancer` |
| Hukuk 31 Ağustos, künye | `/legal/gizlilik`, `/legal/kullanim`, `/iletisim` |
| sitemap 500 | `GET https://yetkin.ai/sitemap.xml` |
| Yerel 5 SKU | `lib/academy/pilot-sku.ts`, `lib/academy/curricula/index.ts` |
| Split kapalı | `lib/kernel/payments/marketplace-split-live.ts` |
| NBA Akademi | `lib/dashboard/next-best-action.ts` |
| A/B anayasa | `.system_docs/ANAYASA.md` |
| Motor 1 kahraman | `.system_docs/MANIFESTO.md` §3–4 |
| Compact = canlı standart | `.system_docs/PEDAGOJI.md` B |
| Merchant reçete | `.system_docs/OPS_RUNBOOK.md` §4 |
| 2 WAV | `.system_docs/STORAGE_CONTRACT.md` |
| Junior kilit | `lib/kernel/compliance/circuit-breakers.ts` |

---

## 5. SUPER ADMIN’e not

Tespit tamam. Tedavi’ye geçmeden tek karar bekler: **kanon yüzey hangisi?**

- Yerel ağaç (5 compact SKU, Akademi kahraman, PayTR iFrame dili, Split 503) hedef ise: canlı eski katalog ve “ödeme yok” kopyası **yayın borcudur**, özellik borcu değil.
- Canlı eski katalog bilinçli olarak duracaksa: yerel silmeler ve manifesto “vitrin 5 SKU” cümlesi **yanlış SSOT** üretir; önce belge ve kod canlıya geri çekilmeli.

Bu ajanın tavsiyesi: **yerel Tedavi 01 kanon, canlı hizalanır.** Junior çocuk ürünü açılmaz. Freelancer kodu kalır, vitrin küçülür. İlk nakit PayTR Merchant’tır; Split değildir.

Tespit Aşaması kapanışı: `/docs/01_TESPIT_RAPORU.md`.
