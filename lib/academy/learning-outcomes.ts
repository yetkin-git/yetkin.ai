/**
 * Antre öğrenim çıktıları — vitrin kartı değil, kurs sayfası (2 nolu) sicili.
 * Client-safe: sınav şıkkı yok.
 */

import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";

export const ACADEMY_LEARNING_OUTCOMES: Record<AcademyCourseTitleSlug, readonly string[]> = {
  "security-temel": [
    "CIA üçlüsünü çizer; varlık-tehdit-etki boşsa Fail-closed (Hata Anında Kapalı) durursun.",
    "TCP/IP ve port izin listesini yazarsın; listede yoksa paket düşer.",
    "OWASP kapılarında parametreli sorgu, textContent ve CSRF jetonu istersin.",
    "Parolayı hash’lersin, MFA yoksa oturum açmazsın; güvenlik duvarı ve RoE yazılı durur.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "security-orta": [
    "Yazılı RoE ve izinli hedef olmadan keşfi Fail-closed (Hata Anında Kapalı) durdurursun.",
    "Lab arayüzü ve envanter listesini yazarsın; lab dışı paket düşer.",
    "IDOR’da sahip eşleşmesini, SSRF’de konak izin listesini istersin.",
    "JWT imza ve algoritma listesini doğrular, SAST sır kalıbında derlemeyi kesersin.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "security-ileri": [
    "Boru hattında SAST/DAST/SCA damgası yoksa yayını Fail-closed (Hata Anında Kapalı) durdurursun.",
    "IAM’de joker ve kalıcı root’u reddeder, KMS anahtarı olmadan şifrelemezsin.",
    "Olay müdahalesinde günlük silmeyi keser, hash zinciri kopuksa rapor basmazsın.",
    "SIEM’de izinsiz kaynağı düşürür, Sıfır Güven üçlüsü yoksa paketi kesersin.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "ai-agent-temel": [
    "Büyük Dil Modeli ile otonom ajan farkını çizer, araç yoksa uydurmazsın.",
    "Üretim tarifini katmanlar, JSON şemasını parse eder, geçersiz çıktıda durursun.",
    "Araç kaydından çağrı yapar; bilinmeyen adı Fail-closed (Hata Anında Kapalı) kesersin.",
    "Kısa pencere ve uzun raf eşiğini ayırır, ReAct tur tavanını yazarsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "ai-agent-orta": [
    "RAG akışında önce kanıt getirir, boş getiriyle cümle basmazsın.",
    "Vektör koleksiyonunu sorgular; eşik altında Fail-closed (Hata Anında Kapalı) durursun.",
    "Araştırmacı ve yazar ajanı paslaştırır, ortak durumu tek yazar kuralıyla korursun.",
    "Riskli gönderimi insan onayına bağlar, kaşesiz aracı çalıştırmazsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "ai-agent-ileri": [
    "Durum Grafiği düğüm ve kenarını çizer, tur tavanında Fail-closed (Hata Anında Kapalı) durursun.",
    "Yansıma döngüsünde kırığı bir kez onarır, sonsuz denemeyi kesersin.",
    "Korkulukta izin listesi ve tarama kapısını varsayılan kilit ile korursun.",
    "Eval barajını ve PII’siz izi basar; üretim kuyruğunda bilinmeyen rotayı düşürürsün.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "python-temel": [
    "Değişken, tip ve Fail-closed (Hata Anında Kapalı) kapısını dürüst isimlerle yazarsın.",
    "Kontrol akışı, döngü ve fonksiyonla küçük işi tekrar yazmadan bitirirsin.",
    "Liste ve sözlükte sıra ile anahtarı ayırır, yokluğu çökmeden sorarsın.",
    "Girdi doğrular, hata yakalar, girdi→doğrula→hesapla→yazdır döngüsünü kapatırsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "python-orta": [
    "Sınıf ve örnek ayrımını yazarsın; kalıp durumunu paylaşmazsın.",
    "Miras ve kapsülleme ile stok sınırını Fail-closed (Hata Anında Kapalı) kapıdan korursun.",
    "JSON sözleşmesini parse eder, utf-8 ve atomik yazımla diske basarsın.",
    "try/except’i dar tutar, özel istisna ve HTTP durum kodunu dürüst okursun.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "python-ileri": [
    "Decorator (bezetici) ile kapıyı tek yerde sarar, iç tarifi dağıtmazsın.",
    "Üreteç ve iterator ile belleği şişirmeden akış tartarsın.",
    "asyncio ile giriş-çıkış beklerken gişeyi boşaltır, time.sleep tuzağına düşmezsin.",
    "GIL’e göre thread/process seçer; metaclass ile sınıf sözleşmesini doğmadan kesersin.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "fullstack-temel": [
    "HTTP ve Alan Adı Sistemi fişini dürüst okur, 5xx’te yeşil tik basmazsın.",
    "Semantik HTML5 iskeleti ile Flexbox ve Grid yerleşimini tapuya bağlarsın.",
    "JavaScript DOM’da yuvayı sorar, textContent basar, innerHTML ile XSS açmazsın.",
    "fetch, Promise ve TypeScript arayüzü ile formu Fail-closed (Hata Anında Kapalı) doğrularsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "fullstack-orta": [
    "Bileşen ve props sözleşmesini çizer, JavaScript XML (JSX) iskeleti dürüst poşetle basarsın.",
    "useState/useEffect ve kontrollü formda sonsuz boyamayı Fail-closed (Hata Anında Kapalı) kesersin.",
    "Express REST ve Prisma ile parametreli yazarsın; ham SQL birleştirmezsin.",
    "JWT ara katmanında imza yoksa 401 basar, decode ile kapı açmazsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "fullstack-ileri": [
    "App Router’da RSC varsayılanını çizer, sırrı vitrine indirmezsin.",
    "Server Action gövdesini Fail-closed (Hata Anında Kapalı) doğrular; boş sku yeşil basmazsın.",
    "Mikroservis olay fişini ve açık devreyi yazarsın; zincirleme çöküşü kesersin.",
    "Redis kaçırmayı 200 saymaz, 429 tavanını basar; Compose sağlık ve CI/CD kırmızı testi sahaya indirmezsin.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "ai-temel": [
    "Token, bağlam penceresi ve üretim tarifi katmanlarını ayırırsın.",
    "Yapılandırılmış çıktı, few-shot ve sır/kişisel veri yasağını uygularsın.",
    "Tablo okur, temizler, metrik paydasını yazmadan yüzde basmazsın.",
    "Kaynaklı getiri (RAG) ile uydurmayı keser, kanıt satırı istersin.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "ux-temel": [
    "Kullanıcı Deneyimi ile Kullanıcı Arayüzü sınırını çizersin.",
    "Araştırma, persona, yolculuk ve bilgi mimarisini kanıtla kurarsın.",
    "Tel çerçeve ve Figma’da çerçeve, otomatik yerleşim, bileşen kullanırsın.",
    "İzgara, tipo, jeton, prototip ve erişilebilirlik barajını teslim paketine bağlarsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "excel-masterclass": [
    "Hücrede adres, değer ve biçimi ayırır; TOPLA/ORTALAMA/SAY tartısını n yazmadan basmazsın.",
    "XLOOKUP tam eşleşme ve sola bakış kapısını yazar; yaklaşık VLOOKUP fiyatı uydurmazsın.",
    "Özet Tablo ve dilimleyicide kimliği SAY ile sayar; fatura numarasını TOPLA etmezsin.",
    "Yinelenen, ayırıcı ve «N/A» kaydını Fail-closed (Hata Anında Kapalı) düşürür; sıfır uydurmazsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "google-ads-masterclass": [
    "Hesap katını çizer; dönüşüm eylemi yoksa harcamayı Fail-closed (Hata Anında Kapalı) durdurursun.",
    "Geniş/sıralı/tam eşlemeyi yazar; 30 dönüşümsüz geniş eşlemeyi açmazsın.",
    "Arama ve görüntülü ağı ayırır; bakışı satış saymazsın.",
    "GTM’i teşekkür + sipariş id ile bağlar; kırık etikette Smart Bidding açmazsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "meta-ads-masterclass": [
    "Business Suite ve Ads Manager katını çizer; piksel yoksa harcamayı Fail-closed (Hata Anında Kapalı) durdurursun.",
    "Özel kitleyi purchase kaynağından kurar; beğeni Lookalike’ı açmazsın.",
    "Piksel ve CAPI’yi event_id ile birleştirir; değersiz ROAS basmazsın.",
    "CBO/ABO ve A/B tek değişkenini yazar; öğrenmede %20 üstü ölçek açmazsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "eticaret-masterclass": [
    "Pazar yeri tezgâhını çizer; vergi ve kargo yoksa mağazayı Fail-closed (Hata Anında Kapalı) durdurursun.",
    "Trendyol/Hepsiburada kaydında unvan, IBAN ve sözleşmeyi yazar; sözlü kuryeyi kapı saymazsın.",
    "Liste başlığı, GTIN ve kendi görseli basar; çalıntı fotoğraf ve stoksuz satışı açmazsın.",
    "Merkez stok ve kargo takibini senkronlar; oversell ve fişsiz teslim basmazsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "canva-masterclass": [
    "Brand Kit’te logo, hex ve iki yazı ailesini yazar; boş paleti Fail-closed (Hata Anında Kapalı) durdurursun.",
    "Post/Reels boyutunu ve tek CTA’yı basar; kitsiz Resize ve üç çağrıyı açmazsın.",
    "Magic taslağını lisans ve PII kapısından geçirir; ham metni marka sesi saymazsın.",
    "Baskıda CMYK 300 dpi ve 3 mm pay ister; RGB PDF’i matbaaya göndermezsin.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "linkedin-masterclass": [
    "All-Star profilde fotoğraf ve rol+vaat başlığı yazar; sloganı Fail-closed (Hata Anında Kapalı) durdurursun.",
    "Kanca ve kanıtlı gönderi basar; beğeni avı ve hashtag yığınını açmazsın.",
    "Sales Navigator’da ICP süzgecini kaydeder; yığın CTO listesini InMail’e dökmezsin.",
    "Soğuk yazıda özgün bağlam ve tek soru ister; kopya duvarı ve ilk cümle teklifi basmazsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
};

export function academyLearningOutcomesForSlug(slug: string): readonly string[] {
  return ACADEMY_LEARNING_OUTCOMES[slug as AcademyCourseTitleSlug] ?? [];
}
