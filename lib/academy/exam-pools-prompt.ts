import type { AcademyExamQuestion } from "@/lib/academy/types";
import { mcq } from "@/lib/academy/exam-pools-growth";

/**
 * İstem pratiği sınav havuzu — canlı slug `05_prompt_practice`.
 * Vatandaş dili. Mühendis ağzı (uydurmanın teknik adı, model kısaltması) bu havuzda durmaz.
 */
export const PROMPT_PRACTICE_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  mcq(
    "q_pr_1",
    "Arama motoru ile üretici yapay zekâ arasındaki temel fark nedir?",
    [
      "İkisi de anahtar kelime eşleştirip link listeler",
      "Arama motoru hazır sayfaları listeler. Üretici yapay zekâ, verdiğin bağlama göre yeni bir metin kurar",
      "Yapay zekâ yalnızca resim çizer",
      "Arama motoru her zaman daha doğrudur",
    ],
    1,
  ),
  mcq(
    "q_pr_2",
    "Yapay zekâ neden kaynakta olmayan bir cümle yazar?",
    [
      "İnterneti kasten bozduğu için",
      "Boşluk bırakılınca 'bilmiyorum' demeyip kulağa doğru gelen kelimeleri doldurduğu için",
      "Bilgisayarın virüs kapması",
      "İstemin çok uzun olması",
    ],
    1,
  ),
  mcq(
    "q_pr_3",
    "İyi bir istemin beş parçası hangileridir?",
    [
      "Başlık, etiket, emoji, link, fiyat",
      "Rol, görev, bağlam, sınırlar, çıktı biçimi",
      "İşlemci, bellek, ekran kartı, disk, ağ",
      "Giriş, gelişme, sonuç, özet, test",
    ],
    1,
  ),
  mcq(
    "q_pr_4",
    "İsteme rol yazmak ne işe yarar?",
    [
      "Cevabı yavaşlatır",
      "Cevabı o işin diline çeker. Örneğin genel bir yazar gibi değil, mağaza sorumlusu gibi konuşur",
      "Yasal imza yerine geçer",
      "Sınav barajını düşürür",
    ],
    1,
  ),
  mcq(
    "q_pr_5",
    "Sınır yazmak uydurmayı nasıl keser?",
    [
      "Programı kapatarak",
      "Yapılmayacakları ve 'veride yoksa uydurma' kuralını açık yazarak",
      "Daha çok emoji ekleyerek",
      "İstemi tek kelimeye indirerek",
    ],
    1,
  ),
  mcq(
    "q_pr_6",
    "Kötü istem örneği hangisidir?",
    [
      "Rol, görev, bağlam, sınır ve biçimi dolduran istem",
      "'Bana bir e-posta yaz' gibi belirsiz tek cümle",
      "İki tamamlanmış örnek veren istem",
      "Adım adım düşünmesini isteyen istem",
    ],
    1,
  ),
  mcq(
    "q_pr_7",
    "Hiç örnek, tek örnek ve birkaç örnek vermek arasındaki fark nedir?",
    [
      "Hepsi aynıdır",
      "Sıfır, bir veya birkaç tamamlanmış örnekle biçimin öğrenilmesi",
      "Yalnızca resim işinde geçerlidir",
      "Örnek sayısı ücreti sıfırlar",
    ],
    1,
  ),
  mcq(
    "q_pr_8",
    "Birkaç tamamlanmış örnek ne zaman işe yarar?",
    [
      "Üslup ve biçimi birebir tutmasını istediğinde (2–4 örnek)",
      "Hiç örnek verilemediğinde",
      "Yalnızca matematik sorularında",
      "Sınavı atlamak için",
    ],
    0,
  ),
  mcq(
    "q_pr_9",
    "'Adım adım düşün' ne ister?",
    [
      "Cevabı tek kelimede basmasını",
      "Cevabı aceleye getirmemesini; ara adımları yazmasını",
      "İnterneti kapatmasını",
      "Yalnızca şiir yazmasını",
    ],
    1,
  ),
  mcq(
    "q_pr_10",
    "Aynı istemde birden fazla uzman rolü ne işe yarar?",
    [
      "Tek bir evet ya da hayır üretmek",
      "Aynı kararı birkaç bakış açısından sınamak",
      "Dosyayı silmek",
      "Sınav sorusu çalmak",
    ],
    1,
  ),
  mcq(
    "q_pr_11",
    "İş e-postasında nazik tahsilat istemi neyi korur?",
    [
      "Müşteriyi aşağılamak",
      "İlişkiyi bozmadan geciken ödemeyi net bir sonraki adımla hatırlatmak",
      "Yasal icra tehdidini yapay zekâya bırakmak",
      "Kişisel verileri açık paylaşmak",
    ],
    1,
  ),
  mcq(
    "q_pr_12",
    "Dört üslup hangileridir?",
    [
      "Sayfa düzeni, renk, yazı, tablo",
      "Resmi, sıcak, ikna edici, yalın",
      "Kısa ileti, video, blog, dosya",
      "Alıcı, satıcı, kargo, iade",
    ],
    1,
  ),
  mcq(
    "q_pr_13",
    "Çıktıyı eleştirip ikinci turda düzeltmek ne işe yarar?",
    [
      "İlk taslağı olduğu gibi göndermek",
      "Kör noktayı görüp ikinci turda metni sıkılaştırmak",
      "İstemi silmek",
      "Aynı hatayı tekrarlamak",
    ],
    1,
  ),
  mcq(
    "q_pr_14",
    "Daha başlamadan 'bu iş nasıl bozulur' diye sormak ne işe yarar?",
    [
      "İş bitince suçlu aramak",
      "Henüz başlamadan başarısızlık senaryosunu yazdırmak",
      "Yalnızca bütçe kalemini sormak",
      "Sınav notunu sormak",
    ],
    1,
  ),
  mcq(
    "q_pr_15",
    "Dağınık nottan güçlü yan, zayıf yan, fırsat ve risk isterken doğru yol nedir?",
    [
      "Veri yokken ortalama uydurmak",
      "Ham notları bağlama koyup, veride olmayan iddiayı yazmama kuralını eklemek",
      "Yalnızca riskleri sormak",
      "Arama motorundan kopyalamak",
    ],
    1,
  ),
  mcq(
    "q_pr_16",
    "Görsel istemin beş katmanı hangileridir?",
    [
      "Fiyat, stok, kargo, iade, puan",
      "Ana konu, çevre, ışık, kamera, tarz ve doku",
      "Giriş, gelişme, sonuç, test, özet",
      "Rol, görev, fiyat, kargo, iade",
    ],
    1,
  ),
  mcq(
    "q_pr_17",
    "Fotoğrafı okuyan yapay zekâ bu derste ne işe yarar?",
    [
      "Yalnızca duvar kağıdı üretir",
      "Fotoğraf, grafik veya el çiziminden hata ve taslak çıkarır",
      "Sesi kopyalar",
      "Sınavı otomatik geçer",
    ],
    1,
  ),
  mcq(
    "q_pr_18",
    "Sesli okuma metninde parantez içi not neden yazılır?",
    [
      "Dosya boyutunu küçültmek için",
      "Duygu ve nefesi yöneterek robotik okumayı kırmak için",
      "Telif hakkını silmek için",
      "Videoyu dik yapmak için",
    ],
    1,
  ),
  mcq(
    "q_pr_19",
    "Kısa video isteminde kritik olan nedir?",
    [
      "Yalnızca ürün adını yazmak",
      "Kamera hareketini tarif etmek (açı ve takip)",
      "Etiket listesi",
      "Dosya eklemek",
    ],
    1,
  ),
  mcq(
    "q_pr_20",
    "İstem kütüphanesini ekipte kullanılabilir kılan nedir?",
    [
      "Her seferinde sıfırdan yazmak",
      "Değişen yerleri köşeli parantezle işaretlenmiş, paylaşılabilir şablon",
      "Şifreyi sohbete yapıştırmak",
      "Yalnızca ekran görüntüsü saklamak",
    ],
    1,
  ),
  mcq(
    "q_pr_21",
    "Kütüphane klasörlerinde hangisi vardır?",
    [
      "Yalnızca rastgele notlar",
      "İletişim, içerik, yönetim, pazarlama ve görsel iş",
      "Yalnızca şifreler",
      "Yalnızca faturalar",
    ],
    1,
  ),
  mcq(
    "q_pr_22",
    "Görev cümlesi nasıl yazılır?",
    [
      "Belirsiz 'yap şunu' ile",
      "Net eylem fiili: özetle, karşılaştır, hataları listele, 3 alternatif üret",
      "Yalnızca emoji ile",
      "Boş bırakılarak",
    ],
    1,
  ),
  mcq(
    "q_pr_23",
    "Çıktı biçimi neden açık yazılır?",
    [
      "Program her zaman tablo basar",
      "Paragraf, madde, e-posta veya kontrol listesi tesliminin rastgele kalmaması için",
      "Ücreti sıfırlamak için",
      "Sınavı iptal etmek için",
    ],
    1,
  ),
  mcq(
    "q_pr_24",
    "Müşteri veya şirket verisini isteme koyarken kural nedir?",
    [
      "Kimlik numarası, banka hesabı ve isimleri ham yapıştırmak",
      "Kişisel ve ticari sırları maskelemek",
      "Verileri herkese açık bir nota atmak",
      "Yalnızca şifreyi silmek yeter",
    ],
    1,
  ),
  mcq(
    "q_pr_25",
    "Yapay zekânın ürettiği resmi metinde son sorumluluk kimdedir?",
    [
      "Tamamen programı yapan şirkette",
      "Tarih, rakam ve iddiayı sen denetlersin; imzayı sen atarsın",
      "Metin kısaysa denetim gerekmez",
      "Sınavı geçen herkes sorumluluktan muaftır",
    ],
    1,
  ),
  mcq(
    "q_pr_26",
    "İlk satış yazısının hedefi nedir?",
    [
      "Alıcıyı gereksiz ileti ile boğmak",
      "Kısa, kişiye özel ve randevu isteyen nazik bir ilk dokunuş",
      "Tüm fiyat listesini yapıştırmak",
      "Yasal sözleşme imzalatmak",
    ],
    1,
  ),
  mcq(
    "q_pr_27",
    "'Adım adım düşün' talimatı hangi sınıfa girer?",
    [
      "Tek cümlelik ansiklopedi cevabı",
      "Adım adım düşünme",
      "Marka renk kartı",
      "İnsana devretme",
    ],
    1,
  ),
  mcq(
    "q_pr_28",
    "İyi istem neden ofis, satış ve içerik işinin ortak dili sayılır?",
    [
      "Yalnızca kod yazdırır",
      "Aynı kuralla sorarsın: rol, bağlam, biçim. Kod yazdırmak şart değildir",
      "Sertifikayı satın alma anında basar",
      "Sonraki eğitimleri iptal eder",
    ],
    1,
  ),
  mcq(
    "q_pr_29",
    "Yetkin Akademi'de sertifika barajı kaçtır?",
    [
      "50 puan",
      "70 puan ve üzeri",
      "100 puan tam not",
      "Baraj yoktur; satın alan herkes doğrudan alır",
    ],
    1,
  ),
  mcq(
    "q_pr_30",
    "Sertifika ne zaman hak edilir?",
    [
      "Eğitim satın alındığı anda",
      "Müfredat tamamlanıp sunucu tarafında puanlanan sınavda baraj (≥70) geçildiğinde",
      "İlk istem yazıldığında",
      "Özet dosyası indirildiğinde",
    ],
    1,
  ),
];
