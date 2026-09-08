import type { AcademyExamQuestion } from "@/lib/academy/types";
import { mcq } from "@/lib/academy/exam-pools-growth";

/**
 * E-Ticaret AI sınav havuzu — canlı slug `02_ecommerce_ai`.
 * Kaynak: `docs/curriculum/02_ECOMMERCE_AI_PEDAGOJI_RAPORU.md` q_ec_1…q_ec_30.
 */
export const ECOMMERCE_AI_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  mcq(
    "q_ec_1",
    "E-ticarette yapay zekânın pedagojik olarak en doğru konumlandırılması hangisidir?",
    [
      "Süslü tanıtım metinleri yazan bir edebiyat stajyeri",
      "Mağazanın 7/24 çalışan kıdemli operasyon ve satış müdürü",
      "Sadece görsel üreten bir tasarım aracı",
      "Fiyatı otomatik kıran bir indirim robotu",
    ],
    1,
  ),
  mcq(
    "q_ec_2",
    "Pazaryeri uyumlu SEO başlığı hangi hiyerarşiyle kurulur?",
    [
      "Duygusal slogan + marka hikâyesi + kampanya cümlesi",
      "Bulunan tüm anahtar kelimeler arka arkaya dizilir",
      "[Marka/Tip] + [Ana Ürün Tanımı] + [Model/Kapasite] + [En Çarpıcı 2 Teknik Fayda] + [Renk/Materyal]",
      "Sadece barkod numarası ve fiyat yazılır",
    ],
    2,
  ),
  mcq(
    "q_ec_3",
    "Vitrin maddeleri (bullet points) neden kalın fayda başlığı ve tek cümlelik kanıtla yazılır?",
    [
      "Müşterilerin yaklaşık %85'i mobilden alışveriş yapar; uzun paragraflar okunmaz",
      "Pazaryeri panelleri kalın yazıyı teknik olarak zorunlu tutar",
      "Kalın yazı kargo ücretini düşürür",
      "Algoritma yalnızca emoji içeren metinleri indeksler",
    ],
    0,
  ),
  mcq(
    "q_ec_4",
    "'İade önleyici kullanım notu'nun (örn. LED kapağın elde yıkanması uyarısı) işlevi nedir?",
    [
      "Müşteriyi ürünü almaktan caydırmak",
      "Kargo teslim süresini uzatmak",
      "Garanti kapsamını daraltmak",
      "Yanlış kullanım kaynaklı 1 yıldızlı yorumu ve iadeyi baştan önlemek",
    ],
    3,
  ),
  mcq(
    "q_ec_5",
    "Yapay zekâ istemlerinde ticari sır koruması nasıl sağlanır?",
    [
      "Maliyet, tedarikçi adı ve kâr marjı prompt'a açıkça yazılır",
      "Maliyet ve tedarikçi bilgisi maskelenir; [Birim Maliyet] gibi sembolik terimler kullanılır",
      "Tedarikçi faturası sohbete fotoğraf olarak yüklenir",
      "Ticari sırlar yalnızca sosyal medyada paylaşılır",
    ],
    1,
  ),
  mcq(
    "q_ec_6",
    "'Özellik değil, fayda' yaklaşımında hangisi FAYDA cümlesidir?",
    [
      "İç gövde SUS 304 paslanmaz çeliktir",
      "Ürün 500 ml hacme sahiptir",
      "Sabah demlediğiniz kahve akşamüstü bile ilk anki lezzetiyle kalır; metal koku yapmaz",
      "Dış kaplama mat siyah renklidir",
    ],
    2,
  ),
  mcq(
    "q_ec_7",
    "AIDA satış şablonunun doğru sıralaması nedir?",
    [
      "Dikkat → İlgi → Arzu → Eylem",
      "Arzu → Dikkat → Eylem → İlgi",
      "Eylem → Arzu → İlgi → Dikkat",
      "İlgi → Eylem → Dikkat → Arzu",
    ],
    0,
  ),
  mcq(
    "q_ec_8",
    "PAS modelinde 'A' harfi neyi temsil eder?",
    [
      "Analiz",
      "Reklam (Advertisement)",
      "Agitation — problemin yarattığı stresi büyütme",
      "Aksiyon",
    ],
    2,
  ),
  mcq(
    "q_ec_9",
    "Anahtar kelime doldurma (keyword stuffing) neden yasaktır?",
    [
      "Pazaryeri ve Google'ın NLP algoritmaları spam'i yakalar; mağaza geri plana itilir ve müşteri güveni kırılır",
      "Sayfa yüklenme hızını artırır",
      "Kargo maliyetini yükseltir",
      "Yasak değildir; her listenin altına kelime bulutu eklenmelidir",
    ],
    0,
  ),
  mcq(
    "q_ec_10",
    "Anahtar kelime kümeleme (keyword clustering) hangi 4 katmandan oluşur?",
    [
      "Renk, beden, fiyat, stok",
      "Ana tohum terimler, nitelik/long-tail terimler, kullanım senaryosu (intent) terimleri, sorun çözme terimleri",
      "Başlık, alt başlık, dipnot, kaynakça",
      "Marka, rakip, tedarikçi, kargo",
    ],
    1,
  ),
  mcq(
    "q_ec_11",
    "Müşteri yorumlarına duygu analizi (sentiment analysis) yaptırmanın temel amacı nedir?",
    [
      "Olumsuz yorum yazan müşterileri tespit edip engellemek",
      "Yorum sayısını yapay olarak şişirmek",
      "Rakip mağazaların yorumlarını sildirmek",
      "Kronik ürün kusurlarını ve iade kök nedenlerini saniyeler içinde teşhis etmek",
    ],
    3,
  ),
  mcq(
    "q_ec_12",
    "1 yıldızlı öfkeli bir yoruma yazılan diplomatik yanıt aslında kime yazılır?",
    [
      "Yalnızca şikâyet eden müşteriye",
      "Pazaryeri algoritmasına",
      "O yorumu okuyacak sonraki yüzlerce potansiyel alıcıya",
      "Kargo firmasına",
    ],
    2,
  ),
  mcq(
    "q_ec_13",
    "Pazaryeri yorum ve soru-cevap alanlarında kesinlikle yasak olan nedir?",
    [
      "Empati cümlesi kurmak",
      "Telefon, WhatsApp, e-posta veya harici link paylaşmak",
      "Ürünün arkasında durduğunu belirtmek",
      "Ücretsiz parça telafisi önermek",
    ],
    1,
  ),
  mcq(
    "q_ec_14",
    "Kapalı döngü (closed-loop) soru-cevap otomasyonu nedir?",
    [
      "Gelen her sorunun silinmesi",
      "Sorular yanıtlandıktan sonra tekrarlananların ürün açıklamasına SSS bloğu olarak gömülüp soru yükünün azaltılması",
      "Müşterinin başka satıcıya yönlendirilmesi",
      "Soru panelinin tamamen kapatılması",
    ],
    1,
  ),
  mcq(
    "q_ec_15",
    "'5 yıldız verirseniz kupon hediye' tarzı yorum teşviki neden yasaktır?",
    [
      "Kupon maliyeti kârı düşürür",
      "Yasak değildir; standart pazarlama yöntemidir",
      "Tüketiciyi yanıltma sayılır; liste askıya alınabilir",
      "Algoritma kupon kelimesini tanımaz",
    ],
    2,
  ),
  mcq(
    "q_ec_16",
    "Buybox nedir?",
    [
      "Pazaryerinin depo kiralama hizmeti",
      "Aynı üründe 'Sepete Ekle' butonunu tek satıcıya veren ve satışların %80-85'ini toplayan altın kutu",
      "Müşteri iade formu",
      "Kargo takip ekranı",
    ],
    1,
  ),
  mcq(
    "q_ec_17",
    "'Dibe doğru yarış' (race to the bottom) neyle sonuçlanır?",
    [
      "Kalıcı müşteri sadakatiyle",
      "Pazaryeri komisyonunun düşmesiyle",
      "Ciro şişer ancak komisyon, kargo ve maliyet sonrası net kâr sıfırlanır veya zarara döner",
      "Mağaza puanının otomatik yükselmesiyle",
    ],
    2,
  ),
  mcq(
    "q_ec_18",
    "Bundle (değer paketi) stratejisinin Buybox açısından en kritik avantajı nedir?",
    [
      "Kargo ücretini sıfırlaması",
      "Rakibin listesine sızmaya izin vermesi",
      "Komisyon oranını düşürmesi",
      "Kendine ait yeni barkod/liste yarattığı için Buybox'ın tek ve mutlak sahibi olmayı sağlaması",
    ],
    3,
  ),
  mcq(
    "q_ec_19",
    "Termos seti simülasyonunda satış fiyatı 269 TL'ye çekilirse (maliyet 170 TL, komisyon %20, kargo 45 TL, vergi ~%5) sonuç ne olur?",
    [
      "Sipariş başına yaklaşık 13 TL net zarar — kırmızı çizgi ihlali",
      "Sipariş başına yaklaşık 77 TL net kâr",
      "Sipariş başına yaklaşık 32 TL net kâr",
      "Komisyon sıfırlandığı için kâr değişmez",
    ],
    0,
  ),
  mcq(
    "q_ec_20",
    "Otomatik fiyatlandırıcı (repricer) kullanırken olmazsa olmaz kural nedir?",
    [
      "Rakibin hep 1 TL altına inme kuralı",
      "Stop-loss / taban fiyat kilidi konmadan dinamik fiyat kuralı asla açılmaz",
      "Fiyatın her gece 00:00'da sıfırlanması",
      "Tüm rakiplerin platforma şikâyet edilmesi",
    ],
    1,
  ),
  mcq(
    "q_ec_21",
    "Pazaryeri arama sonuçlarında müşterinin bir ürüne tıklayıp tıklamama kararı ortalama ne kadar sürer?",
    [
      "Yaklaşık 0.8 saniye — ilk görsel belirleyicidir",
      "Yaklaşık 8 dakika",
      "Yaklaşık 30 saniye — tüm açıklama okunur",
      "Karar her zaman bir gün bekletilip fiyata göre verilir",
    ],
    0,
  ),
  mcq(
    "q_ec_22",
    "Pazaryerlerinde ana görsel (1. görsel) kuralı nedir?",
    [
      "Kampanya sloganı ve fiyat etiketiyle dolu olmalıdır",
      "Yaşam tarzı (lifestyle) sahnesi zorunludur",
      "Saf/temiz zemin ister; lifestyle ve infografikler 2. görselden itibaren kullanılır",
      "Tedarikçi logosu büyük puntoyla basılmalıdır",
    ],
    2,
  ),
  mcq(
    "q_ec_23",
    "Galerideki milimetrik ölçü şeması (örn. 7 cm taban çapı) hangi problemi baştan çözer?",
    [
      "Ürünün SEO başlığını uzatır",
      "'Araç bardaklığına sığmadı' kaynaklı iade ve 1 yıldızları önler",
      "Kargo desi ücretini düşürür",
      "Rakip fiyatlarını gizler",
    ],
    1,
  ),
  mcq(
    "q_ec_24",
    "TikTok / Instagram Reels satış videosunda altın kural nedir?",
    [
      "İlk 3 saniyede parmağı durduran kanca (hook); 'merhaba arkadaşlar' açılışıyla başlanmaz",
      "Video en az 10 dakika olmalıdır",
      "Önce şirket tarihçesi anlatılmalıdır",
      "Hashtag kullanımı yasaktır",
    ],
    0,
  ),
  mcq(
    "q_ec_25",
    "Yapay zekâyla üretilen görselde üründe gerçekte olmayan bir özellik (örn. Bluetooth simgesi) gösterilirse ne olur?",
    [
      "Dönüşüm oranı artar, risk yoktur",
      "Algoritma ürünü öne çıkarır",
      "Müşteri görseli beğenirse iade hakkını kaybeder",
      "'Yanıltıcı görsel' iadesi ve Reklam Kurulu idari para cezası riski doğar",
    ],
    3,
  ),
  mcq(
    "q_ec_26",
    "Hasarlı/yanlış ürün krizinde iadeyi durduran otonom telafi protokolünün özü nedir?",
    [
      "Müşteriden ürünü kargolayıp 10 gün inceleme beklemesi istenir",
      "Kırık ürün geri istenmez; doğru ürün hediyesiyle ekspres gönderilir — çift kargo + puan kaybı yerine kontrollü telafi maliyeti",
      "Müşteri doğrudan Tüketici Hakem Heyeti'ne yönlendirilir",
      "Kargo firması suçlanarak konu kapatılır",
    ],
    1,
  ),
  mcq(
    "q_ec_27",
    "Mağaza sağlık puanı (seller score) eşikleri nasıldır?",
    [
      "Puanın algoritmaya hiçbir etkisi yoktur",
      "9.5 altı Buybox kaybı, 8.5 altı arama sonuçlarında geriye itilme riski",
      "7.0 altında mağaza otomatik kapanır",
      "Puan yalnızca yılda bir güncellenir",
    ],
    1,
  ),
  mcq(
    "q_ec_28",
    "Müşteri kriz mesajları yapay zekâya verilirken KVKK kuralı nedir?",
    [
      "Ad, açık adres ve telefon prompt'a aynen yapıştırılır",
      "Veriler rakip analizi için arşivlenir",
      "Kişisel veriler maskelenir: [Müşteri X], [Sipariş No 123]",
      "KVKK e-ticaret satıcılarını kapsamaz",
    ],
    2,
  ),
  mcq(
    "q_ec_29",
    "Yetkin Akademi'de sertifika/mühür kazanmak için sınav barajı kaçtır?",
    [
      "50 puan",
      "70 puan ve üzeri",
      "100 puan tam not",
      "Baraj yoktur; satın alan herkes doğrudan alır",
    ],
    1,
  ),
  mcq(
    "q_ec_30",
    "Sertifika ne zaman hak edilir?",
    [
      "Eğitim satın alındığı anda",
      "İlk ders açıldığında",
      "Özet PDF indirildiğinde",
      "Sunucu tarafında puanlanan sınavda baraj (≥70) geçildiğinde; SHA-256 mühür o zaman basılır",
    ],
    3,
  ),
];
