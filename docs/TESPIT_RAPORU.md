# yetkin.ai — Ticari Metin & CRO Tespit Raporu

**Tarih:** 19 Kasım 2026  
**Kapsam:** Aktif frontend sayfaları, kamu UI bileşenleri, `lib/copy/**` metin SSOT’u, CTA’lar, fiyat vitrini, SEO/meta.  
**Yöntem:** Kod okuma; ürün kodunda değişiklik yok. `archived/` ve müze yüzeyleri canlı ürün sayılmadı.  
**Üslup:** CEO dürüstlüğü — övgü yok, teşhis var.

---

## Yönetici özeti (tek paragraf)

yetkin.ai’nin kamu yüzü **ürün mimarisini satıyor**, müşteri sonucunu değil. Ana sayfa H1’i («Beş modüllü birleşik AI işletim sistemi. Tek hesap.») mühendis/ürün ekibine net, sokaktaki KOBİ sahibine veya kariyer arayan kişiye değil. Metinler klasik «devrim niteliğinde» AI klişelerinden büyük ölçüde arındırılmış (Akademi ders standardında yasaklı); yerine **iç jargon** oturmuş: mühür, sicil, SHA-256, kokpit, OS, vitrin, «basılmaz», «uydurma». Bu dil dürüstlük vaadi taşıyor ama **satış hikâyesini öldürüyor**. Güven unsurları teknik (PayTR 3DS, sunucu sınavı); sosyal kanıt, referans, vaka çalışması, isimli müşteri yok. Ana sayfa birincil CTA Tezgâh’a gidiyor; Akademi, Junior ve Kariyer hero’da yok — huninin en pahalı ürünleri görünmez.

**CRO skoru (öznel, 10 üzerinden):** Ticari netlik **3/10** · Dil samimiyeti **5/10** (somut ama jargonsal) · Başlık gücü **4/10** · Dönüşüm güveni **3/10**.

---

## 1. Ticari netlik ve değer önerisi (İlk 5 saniye testi)

### 1.1 Ana sayfa — ne satılıyor?

| Katman | Gerçek metin | Kaynak |
|---|---|---|
| H1 | «Beş modüllü birleşik AI işletim sistemi. Tek hesap.» | `lib/copy/sen-voice/public.ts` L7 |
| Alt metin | «E-Ticaret OS stok, kanal ve siparişi toplar. YetkinHibe OS … AI Tezgâh … YetkinCV SHA-256 … kurumsal ilan elemesi aynı hesapta durur.» | aynı dosya L8–9 |
| Meta description | «E-Ticaret OS, YetkinHibe OS, AI Tezgâh, YetkinCV ve kurumsal ilan eleme. Beş modül, tek hesap, tek AI işletim sistemi.» | `lib/copy/seo.ts` L91–92 |
| Kök OG/Twitter | «yetkin.ai beş modüllü birleşik AI işletim sistemi.» | `app/layout.tsx` L29, L37, L42 |

**Teşhis:** 5 saniyede ziyaretçi «eğitim mi, SaaS mı, hibe danışmanlığı mı, İK aracı mı, çocuk dersi mi?» sorusuna cevap alamaz. Cevap: hepsi birden. Bu, konumlandırma değil **katalog dökümü**.

Hero’daki üç düğme aynı anda rekabet eder (`app/(public)/page.tsx` L63–72):

1. «AI Tezgâhını Ücretsiz Dene (Kayıtsız)» → `/tezgah` (birincil, success)
2. «E-Ticaret İşletim Sistemi» → `/e-ticaret` (oturum ister; misafir için sürtünme)
3. «YetkinHibe İşletim Sistemi» → `/hibe` (yine oturum)

**Akademi (`/academy`), Junior (`/junior`), Kariyer (`/career`) hero CTA setinde yok.** Üst nav’da yalnızca «Uzmanlar» ve «Fiyatlar» var (`app/(public)/page.tsx` L39–50). Eğitim ve B2C gelir hattı ana vitrinden kopuk.

### 1.2 Hedef kitle — «herkese» mi?

Hukuki/kurumsal metin açıkça dört kitleyi bir arada sayıyor:

> «KOBİ'ler, girişimciler, danışmanlar ve kurumsal şirketler için … AI tabanlı iş ve operasyon işletim platformudur.»  
> — `lib/copy/legal-launch.ts` L381–382 (`LEGAL_ABOUT_LEAD`); aynı çerçeve L56–57.

Ana sayfada ayrıca:

- Hibe widget kicker: «KOBİ ve girişimci» (`components/hibe/grant-eligibility-widget.tsx` L73–75)
- Track kartları: e-ticaret işletmecisi, hibe peşindeki firma, freelancer/üreten, kariyer/iş arayan, İK/işveren (`lib/copy/sen-voice/public.ts` L104–129)
- Junior ayrı oda: veli + 6. sınıf (`app/junior/page.tsx`, `components/junior/junior-room.tsx` L79–84)

**Teşhis:** Persona birincil değil. Aynı H1’den hem Trendyol satıcısı hem İK müdürü hem veli geçmeye zorlanıyor. Sonuç: kimse «bu benim için» demiyor.

### 1.3 CTA kalitesi ve dönüşüm odağı

| Yüzey | CTA örneği | Sorun |
|---|---|---|
| Ana sayfa | «AI Tezgâhını Ücretsiz Dene (Kayıtsız)» | Güçlü ücretsiz kanca; satış değil aktivasyon |
| Track kartları | «{track.title} sistemini aç» | Jargon; «sistem» müşteri dili değil |
| Fiyatlandırma | «E-Ticaret Kokpitini Aç & Lisansla →» | Uzun, iç terim («kokpit») |
| Fiyatlandırma | «Ön talep bırak» (planned) | Dürüst ama soğuk; teklif değeri yok |
| Kurumsal | «Teklif al» | Net; iyi |
| Kariyer (misafir) | «Sertifika doğrula» / «YetkinCV testini aç» / «Giriş yap» | Üç yön; birincil satış belirsiz |
| Akademi kart | «► 1. Dersi Ücretsiz İzle» / «Satın Al» / «Hemen Katıl» | CTA enflasyonu; hangi düğmenin birincil olduğu kart tipine göre değişiyor (`lib/copy/sen-voice/academy.ts` L18–48) |
| Kayıt | «Hesap oluştur» | Net; fayda cümlesi zayıf: «Üç adım: e-posta, şifre, yaş beyanı. Cüzdanın seninle kurulur.» (`lib/copy/sen-voice/auth.ts` L43–44) |

**Dashboard kamu paneli tutarsızlığı:** «Akademi» özelliği `/tezgah`’a bağlanıyor (`lib/copy/sen-voice/dashboard.ts` L50–54). Eğitim satışı Tezgâh ile karışıyor; ziyaretçi Akademi kataloğuna yönlendirilmiyor.

### 1.4 Güven unsurları — ne var, ne yok

**Var (teknik/yasal güven):**

- «PayTR iFrame + 3D Secure. Kart numarası platformda tutulmaz» (`lib/copy/sen-voice/public.ts` L25)
- «Sınav ve mühür sunucuda doğrulanır; ikna yerine kanıt» (L26)
- Fiyat sayfası: «PayTR 3D Secure güvencesi», «Fatura tahsilatta kesilir», «Kapalı paket satın alınamaz» (`app/(public)/fiyatlandirma/page.tsx` L15–18)
- «Dürüstlük notu» bölümü (L181–186) — ticari olarak nadir ve güçlü

**Yok (ticari güven / sosyal kanıt):**

- İsimli müşteri, logo şeridi, testimonial, NPS, «X KOBİ kullanıyor» yok
- Vaka analizi / önce-sonra metrik yok
- «En Çok Tercih Edilen» rozeti fiyat ve kurumsal kartlarda basılıyor (`app/(public)/fiyatlandirma/page.tsx` L73–76; `app/(public)/kurumsal/page.tsx` L109–110) — **kanıtsız sosyal kanıt iddiası**; veri veya kullanıcı sayısı yok
- Uzman dizini boş olabilir ve bunu açıkça söylüyor («5'ten az … liste basılmaz») — `app/(public)/uzmanlar/page.tsx` L28–30; canlı sosyal kanıt yerine boş vitrin riski

### 1.5 Fiyatlandırma / paket yapısı

Kaynak: `lib/pricing/public-vitrine.ts` + `app/(public)/fiyatlandirma/page.tsx`.

| Paket | Konum | Ticari not |
|---|---|---|
| Ücretsiz Başlangıç | Tezgâh kotası + rehber + seviye testi | Net giriş kapısı |
| AI Tezgâh Pro | Aylık kota + DOCX/ZIP | Abonelik; tutar katalogdan |
| E-Ticaret İşletme Lisansı | «En Çok Tercih Edilen» | Featured ama ana sayfa H1’inde «eğitim» yok; ürün karışık |
| YetkinHibe Tam Proje Dosyası | Tek seferlik | Somut çıktı — görece net değer |
| YetkinCV Uygulamalı Sınav | «Ön talep» / PayTR yok | Satın alma yolu kapalı; CTA `/kurumsal` — kariyer alıcısı için yanlış kapı |
| Kurumsal & Ajans | Ön talep; tutar basılmaz | B2B teklif formu doğru kanal |

H1 fiyat sayfasında görece iyi: «Ücretsiz başla. Üretim ve işletme lisansını katalogdaki tutarla aç.» (`app/(public)/fiyatlandirma/page.tsx` L129–130). Alt paragraf hâlâ ürün listesi; tek alıcı kişiliği yok.

**Akademi kurs fiyatları bu vitrinde yok** (`loadPublicPricingVitrine` yorumu: «Kurs kartı basılmaz.» L67–68). `/fiyatlandirma` ile `/academy` ticari olarak kopuk: ziyaretçi «kurs ne kadar?» diye fiyat sayfasına gelirse Akademi SKU görmez.

### 1.6 SEO / meta — ticari mi, anahtar kelime mi?

- SEM listesi ağırlıklı olarak «yapay zeka eğitimi», «excel yapay zeka eğitimi», «yapay zeka sertifikası» (`lib/copy/sem-keywords.ts` L10–27) — **eğitim niyeti**.
- Ana sayfa meta ve H1 ise **OS / beş modül** dili — **SaaS niyeti**.
- Akademi FAQ: «Dersler ödeme sonrası açılır» (`lib/copy/sem-keywords.ts` L52) vs Akademi katalog: «Dersler ücretsiz; dilersen Resmî Uzmanlık Sınavına gir» (`lib/copy/sen-voice/academy.ts` L13–14). **Çelişki:** arama/FAQ ile ürün yüzü aynı hikâyeyi anlatmıyor.
- Junior `robots: { index: false, follow: false }` (`app/junior/page.tsx` L34) — bilinçli kapatma; organik büyüme kapalı.

---

## 2. Dil, üslup ve «AI jargonu» tespiti

### 2.1 Klasik AI klişeleri — durum

Akademi ders üretim standardı şu kalıpları **yasaklıyor** (`lib/academy/lesson-text-standard.ts` L29–36, L52):

- «muazzam dönüşüm»
- «saniyeler içinde»
- «mucizevi yöntem»
- «prompt mühendisliği»
- «devrim niteliğinde»
- «büyü burada başlıyor»

Yetişkin kamu metinlerinde bu klişelerin sistematik kullanımı **tespit edilmedi**. Bu, güçlü bir editoryal disiplin.

### 2.2 Junior ve pedagojik yüzeyde «AI/motivasyon» kokusu

| Alıntı | Dosya |
|---|---|
| «Bugün hayallerini gerçeğe dönüştürecek ve geleceğini aydınlatacak harika bir konuyu konuşacağız.» | `lib/junior/content/sosyal/15.ts` L10 |
| «…kelimelerin ve cümlelerin bir araya gelerek nasıl kusursuz bir mimari oluşturduğunu göreceğiz.» | `lib/junior/content/turkce/10.ts` L10 |
| «2, 4, 5, 10, 3, 9 ve 6 çifte koşul görevlerini kusursuz çözdün!» | `lib/junior/lesson-engine/modules/mat-5.ts` L61 |

Yetişkin Akademi’de «kusursuz» yasak/eleştiri konusu iken (`lib/academy/curricula/sm-103/section_1.ts` L16 — «aynı kusursuz ışıkta») Junior’da övgü dili olarak duruyor. Pedagoji ile marka sesi çatışıyor.

### 2.3 Asıl sorun: iç jargon ve «dürüst robot» üslubu

Metinler insan gibi değil; **anayasa belgesi gibi** konuşuyor. Örnekler (kamu yüzünde):

| İfade / kalıp | Örnek alıntı | Dosya:satır |
|---|---|---|
| AI işletim sistemi | «Beş modüllü birleşik AI işletim sistemi. Tek hesap.» | `lib/copy/sen-voice/public.ts:7` |
| OS / kokpit | «Stok, kanal ve sipariş kokpiti.» | `public.ts:107` |
| SHA-256 (müşteriye) | «SHA-256 mühürlü, taklit edilemez YetkinCV puanını al» | `lib/copy/sen-voice/career.ts:10` |
| «basılmaz / uydurma» refeni | «Satın alma belge basmaz.» / «Sahte rozet eklenmez.» | `sem-keywords.ts:57`, `career.ts:19` |
| Sicil / mühür | «SHA-256 sicil bütünlük kaydını doğrula… Uydurma geçerli damga basılmaz.» | `lib/copy/seo.ts:146` |
| Vitrin | «Tezgâh vitrini» / «Doğrulanmış rozetli uzmanların kamu vitrini» | `public.ts:28`, `seo.ts:174` |
| Ön talep | «PayTR kasası bu paketlerde bağlı değildir. Kayıt ön taleptir» | `kurumsal/page.tsx:152` |
| Katalog birimi kodu (müşteriye) | «Katalog birimi commerce:agency.» | `kurumsal/page.tsx:119` |
| Proof-of-Work (İngilizce jargon) | «Proof-of-Work ve İşveren Kapısı» | `career.ts:72` |
| Quiet Luxury (iç not sızması riski) | yorum: «Quiet Luxury seviye indikatörü» | `academy.ts:68–69` (yorum; gövdeye sızmasa da dil kültürünü gösterir) |

**Teşhis:** Samimiyet var gibi görünüyor çünkü kısa cümle ve «sen» hitabı kullanılıyor; ama duygusal bağ yok. Cümleler **uyumluluk + anti-sahtekârlık** yazıyor, **fayda + arzu** yazmıyor. Kurumsal gevezelik yerine «yasal savunma dili» var — çeviri kokusu az, **iç ekip dili** ağır.

### 2.4 SEO doldurma / tekrar

`OFFICE_AI` FAQ cevabı tek paragrafta anahtar kelime yığını taşıyor (`lib/copy/sem-keywords.ts` L151–158): «excel yapay zeka eğitimi», «ofiste chatgpt», «Word yapay zeka», model listesi, «KVKK maskeleme»… Okuyan insan için FAQ değil, **Ads kalite puanı notu**.

Ana sayfa FAQ soruları da ürün kodu dili: «E-Ticaret OS kokpiti ne toplar?» (`sem-keywords.ts` L79) — müşteri sorusu değil, ürün dokümantasyonu.

---

## 3. Okunabilirlik, başlık gücü ve metin yoğunluğu

### 3.1 H1 / H2 envanteri — flaş mı, özellik listesi mi?

| Sayfa | H1 (özet) | Değerlendirme |
|---|---|---|
| `/` | Beş modüllü birleşik AI işletim sistemi | Özellik mimarisi; merak yok |
| `/fiyatlandirma` | Ücretsiz başla. Üretim ve işletme lisansını… | Görece net; hâlâ kategori dili |
| `/kurumsal` | Eleme ve işletim merkezi | İç operasyon adı; İK alıcısına «ne kazanırım?» demiyor |
| `/career` | YetkinCV — Test Edilmiş & Mühürlü Kariyer Merkezi | Uzun; jargonsal; fayda gömülü |
| `/tezgah` | Dakikalar içinde kullanıma hazır çıktı | **En iyi kamu H1’lerinden biri** — somut |
| `/rehber` | Ofiste yapay zekâyı Excel ve e-postada kullan | Somut iş; iyi |
| `/academy` | Yetkin.ai Uygulama & Uzmanlık Rehberi | Marka + kategori; zayıf vaat |
| `/junior` | 6. Sınıf Online Dersler | Net niyet; iyi |
| `/uzmanlar` | Doğrulanmış rozetli uzmanlar | Dizin; satış değil |
| `/tetkik` | (PublicHero üzerinden SEO/dönüşüm skoru) | Araç net |
| `/hakkimizda` | Hakkımızda | Boş; description = güncelleme etiketi |
| `/iletisim` | İletişim | Aynı hastalık: description = `LEGAL_UPDATED_LABEL` |

H2’ler çoğunlukla envanter: «Değer zinciri / Dört adımda sistem», «Yedi araç, bugün teslim», «Beş modül / Tek işletim sistemi», «Paketler». Merak veya gerilim yok; **özellik rafları**.

### 3.2 Uzun / boğucu metin blokları

| Yer | Neden sorun |
|---|---|
| `lib/copy/legal-launch.ts` — mesafeli satış / hizmet niteliği paragrafları (örn. L289–294, L342–350) | Zorunlu yasal yoğunluk; checkout’ta da benzer uzunluk riski |
| `lib/copy/sen-voice/career.ts` L9–10, L79 | Tek cümlede CV + vaka + SHA-256 + taklit edilemez + doğrulama bağı |
| `lib/copy/sem-keywords.ts` L151–168 | FAQ cevapları paragraf blok; anahtar kelime şişirme |
| `lib/junior/content/sosyal/15.ts` `welcome` + `concept` + `example` | Çocuk dersinde uzun motive edici giriş + kavram duvarı |
| `components/academy/office-ai-guide-preview.tsx` | Çok sayıda `leading-7` paragraf; rehber önizlemesi duvar metin |
| Ana sayfa hero description (`public.ts` L8–9) | Beş ürünü tek nefeste sayıyor |

**Olumlu:** Çoğu kart gövdesi kısa (1–2 cümle). Sorun uzunluk değil, **yoğun jargonu kısa cümlede tıkıştırmak**.

---

## 4. Sayfa ve bileşen bazlı envanter

### 4.1 Aktif route özeti (canlı `app/**/page.tsx`; `archived/` hariç)

#### Kamu / pazarlama

| Route | Amaç (mevcut) | En büyük ticari/metin eksiği | Acil müdahale |
|---|---|---|---|
| `/` | Beş modül vitrini + Tezgâh aktivasyonu | Tek vaat yok; Akademi/Junior/Kariyer görünmez; 3 CTA | H1’i tek persona + tek sonuç; hero’da tek birincil CTA |
| `/fiyatlandirma` | Katalog vitrini | Akademi kursları yok; «En Çok Tercih Edilen» kanıtsız | Kurs satırlarını bağla veya «kurs fiyatı Akademi’de» köprüsü |
| `/kurumsal` | B2B İK eleme + teklif | H1 operasyon dili; ajans kartında `commerce:agency` müşteriye açık | «İşe alım süresini kısalt» tipi fayda H1; SKU kodunu gizle |
| `/rehber` | Ofis AI rehberi | Akademi hunisine zayıf köprü | CTA’yı «ücretsiz ders» + kurs antresine sabitle |
| `/rehber/[slug]` | Odaklı rehber makale | Lead’ler işe yarar; satış CTA seyrek | Her rehber sonuna tek ürün CTA |
| `/uzmanlar` | Rozet dizini | Boş liste = güven kırığı | Eşik altı için «örnek kart / bekleme listesi» hikâyesi |
| `/sozluk`, `/sozluk/[terim]` | SEO sözlük | Ürün satışına dönüş zayıf | Terim → ilgili araç/kurs CTA |
| `/tetkik`, `/tetkik/[hash]` | Ücretsiz skor aracı | Lead yakalama yok (e-posta/sonraki adım zayıf) | Skor sonrası «Tezgâh’ta düzelt» / kayıt kancası |
| `/vize`, `/vize/[id]` | Kamu kariyer kartı | Meta/H1 doğrulama dili ağır | İşveren için 1 cümle: «Bu puan sınavdan geldi» |
| `/hakkimizda` | Yasal kimlik | Hikâye yok; satış yok | Kurucu/neden + tek cümle değer |
| `/iletisim` | Destek + künye | H1 altında «güncellendi» etiketi | Destek vaadi + yanıt süresi |
| `/legal`, `/legal/[slug]`, `/legal/junior-veli` | Yasal | Beklenen yoğunluk | Checkout özetini kısa tut (ayrı yüzey) |
| `/ilan/[slug]` | İş ilanı başvuru | İyi operasyonel netlik | — |
| `/kasa`, `/kasa/donus` | Ödeme dönüşü | Güven metni kritik | Hata/başarı dili sade kalsın |
| `/magaza/[slug]`, `/p`, `/p/[id]` | Mağaza / kısa bağ | Marka tutarlılığı | Vitrin vs ödeme ayrımını metinde koru |
| `/verify`, `/verify/[hash]` | Doğrulama | Teknik | Vatandaş dili |

#### Kimlik

| Route | Amaç | Eksik | Acil |
|---|---|---|---|
| `/login` | Giriş | Fayda yok | «Planın / kotan / mağazan seni bekliyor» |
| `/register` | Kayıt | «Cüzdanın kurulur» soğuk | Ücretsiz Tezgâh + ilk ders vaadi |
| `/sifremi-unuttum`, `/sifre-yenile` | Şifre | — | — |

#### Ürün odaları (oturumlu ağırlıklı)

| Route | Amaç | Eksik | Acil |
|---|---|---|---|
| `/tezgah` | Üretim araçları | H1 iyi; üst hunide tek yıldız gibi duruyor | Tezgâh → ücretli lane / Akademi köprüsü metni |
| `/academy` | Kurs kataloğu | Ana sayfadan kopuk; FAQ çelişkisi | Ana sayfa + fiyat sayfasına geri bağla; FAQ’yi ürün gerçeğine eşitle |
| `/academy/[slug]`, `/oyna`, `/seviye`, `/cikis-paketi` | Antre / oynatıcı | CTA çoğulluğu | Antrede tek birincil düğme hiyerarşisi |
| `/academy/ileri` | İleri modüller | — | Vitrin hiyerarşisi |
| `/academy/dogrula`, `/certificates` | Doğrulama / sahip olunan | — | Paylaşım CTA |
| `/career` | YetkinCV merkezi | Misafir vs oturum iki dünya; jargonsal H1 | Misafir H1: «CV’ni test ettir, puanını paylaş» |
| `/junior`, `/junior/ders/…`, `/junior/checkout` | 6. sınıf + paket | SEO kapalı; ana siteden görünmez; welcome klişeleri | Veliye ana siteden ayrı kapı; welcome’ları sadeleştir |
| `/e-ticaret`, `/magazam/**` | Ticaret OS | «Kokpit» dili; satış sayfası değil ürün UI | Satış yüzeyi `/fiyatlandirma` + kurumsal ile netleştir |
| `/hibe` | Hibe OS | «Katalog tutarı veritabanından okunur» müşteri dili değil | «Dosyanı hazırla / uygunluğu gör» |
| `/dashboard` | Komuta merkezi | «Akademi» → `/tezgah` sapması | Link ve copy düzelt |
| `/freelancer/**` | İlan/sözleşme | Kamu SEO kapalı (yorum `seo.ts` L123); yüzey kilitli olabilir | Konum netleştir: açık mı kapalı mı |
| `/cuzdan`, `/pasaport`, `/profil` | Hesap | — | — |
| `/young` | 9–12 / YKS stub | Nav’da kayıtlı; ürün olgunluğu belirsiz | Vitrinde vaat etme veya gizle |
| Admin `/admin/**` | Ops | Müşteriye sızmamalı | — |

### 4.2 Kritik bileşenler (metin/CTA taşıyan)

| Bileşen | Rol | Tespit |
|---|---|---|
| `components/ui/public-hero.tsx` | Kamu H1 şablonu | İyi iskelet; içeriği zayıf sayfalarda (`hakkimizda`, `iletisim`) boşa harcanıyor |
| `components/hibe/grant-eligibility-widget.tsx` | Ana sayfa lead aracı | En güçlü persona kancası («KOBİ… Hibe uygunluğunu ücretsiz görün») — ana H1’den daha net |
| `components/career/public-career-panel.tsx` | Misafir kariyer | Örnek mühür iyi fikir; lead uzun ve jargonsal |
| `components/academy/course-list.tsx` | Katalog hero | `copy.description` iyi yönde sadeleştirilmiş; ana sayfa ile uyumsuz |
| `components/tezgah/workbench.tsx` | Üretim | Dönüşüm (Pro / kayıt) metni kritik; kota bitince üslup kontrol edilmeli |
| `components/kurumsal/offer-form.tsx` | B2B lead | Form + «Teklifte ne olur» dürüst — model alınmalı |
| `components/junior/junior-room.tsx` | Junior vitrin | H1 net; CTA `juniorPackageCta` fiyat koşullu |
| `components/seo/landing-faq.tsx` | FAQ | İçerik kalitesi soru/cevap diline bağlı; şu an ürün dokümantasyonu |
| `components/shell/sidebar-nav.tsx` + `lib/dronlar/kayit.ts` | Oturumlu navigasyon | «Komuta merkezi», «Hibe … işletim sistemi» — aynı jargonu oturum içine taşıyor |

---

## 5. Çapraz çelişkiler (güven ve CRO için kritik)

1. **Ana sayfa = OS platformu** vs **SEM/Akademi = yapay zeka eğitimi / online kurs** — iki marka bir URL’de.
2. **Akademi FAQ «Dersler ödeme sonrası açılır»** (`sem-keywords.ts` L52) vs **katalog «Dersler ücretsiz»** (`academy.ts` L14).
3. **Dashboard «Akademi» kartı `/tezgah`’a gidiyor** (`dashboard.ts` L50–54).
4. **«En Çok Tercih Edilen»** kanıtsız (`fiyatlandirma/page.tsx`, `kurumsal/page.tsx`).
5. **YetkinCV fiyat kartı `/kurumsal`’a** yönleniyor (`public-vitrine.ts` L131) — bireysel kariyer alıcısı B2B sayfasına düşer.
6. **Junior noindex** — ürün var, organik kapı kapalı; ana sayfada da yok.

---

## 6. Öncelik sırası (yalnız tespit; uygulama bu raporda yok)

1. **P0 — Ana sayfa tek vaat + tek CTA.** Beş modül listesini alta indir; H1’i bir persona sonucuna kilitle (ör. Tezgâh çıktısı *veya* e-ticaret lisansı *veya* YetkinCV — biri).
2. **P0 — Akademi’yi huninin görünür parçası yap.** Nav + fiyat + ana sayfa köprüsü; FAQ’yi gerçek ürünle hizala.
3. **P0 — Sosyal kanıt veya «En Çok Tercih Edilen»i kaldır/kanıtla.** Kanıtsız rozet güveni yer.
4. **P1 — Müşteri dilinden SKU/kod/SHA-256/kokpit temizliği** (güven cümlelerini dipnota veya doğrulama sayfasına taşı).
5. **P1 — Persona sayfaları:** KOBİ e-ticaret, hibe, bireysel kariyer, veli — ayrı giriş kapıları.
6. **P2 — Junior welcome klişeleri** ve uzun kavram paragrafları.
7. **P2 — Hakkımızda / İletişim** insan hikâyesi + yanıt vaadi.

---

## 7. Kaynak haritası (metin SSOT)

| Katman | Konum |
|---|---|
| Kamu sesi | `lib/copy/sen-voice/public.ts`, `career.ts`, `academy.ts`, `auth.ts`, `dashboard.ts` |
| SEO / SEM | `lib/copy/seo.ts`, `lib/copy/sem-keywords.ts`, `lib/copy/json-ld.ts` |
| Yasal / hakkımızda | `lib/copy/legal-launch.ts` |
| Fiyat vitrini | `lib/pricing/public-vitrine.ts`, `lib/pricing/showcase-price.ts` |
| Rehber / sözlük | `lib/copy/guides.ts`, `lib/copy/glossary.ts` |
| Ana sayfa montaj | `app/(public)/page.tsx` |
| Anti-klişe (Akademi) | `lib/academy/lesson-text-standard.ts` |

---

*Bu dosya yalnızca tespit kaydıdır. Kod, metin veya fiyat değişikliği içermez.*
