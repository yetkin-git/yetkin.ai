import type { AcademyExamQuestion } from "@/lib/academy/types";
import { mcq } from "@/lib/academy/exam-pools-growth";

/**
 * Pratik prompt mühendisliği sınav havuzu — canlı slug `05_prompt_practice`.
 * Master: `docs/curriculum/06_prompt_engineering_mastery.md`.
 */
export const PROMPT_PRACTICE_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  mcq(
    "q_pr_1",
    "Arama motoru ile üretici yapay zekâ arasındaki temel fark nedir?",
    [
      "İkisi de anahtar kelime eşleştirip link listeler",
      "Google fihristtir; LLM bağlama göre sonraki kelimeyi hesaplayan bilişsel asistandır",
      "Yapay zekâ yalnızca resim çizer",
      "Google her zaman daha doğrudur",
    ],
    1,
  ),
  mcq(
    "q_pr_2",
    "Halüsinasyonun pedagojik nedeni nedir?",
    [
      "Modelin interneti kasten bozması",
      "Boşluk bırakılınca modelin 'bilmiyorum' demeyip en ikna edici kelimeleri doldurması",
      "Bilgisayarın virüs kapması",
      "Prompt'un çok uzun olması",
    ],
    1,
  ),
  mcq(
    "q_pr_3",
    "Bir promptun beş temel yapı taşı hangileridir?",
    [
      "Başlık, hashtag, emoji, link, fiyat",
      "Rol, görev, bağlam, kısıtlar, çıktı formatı",
      "CPU, RAM, GPU, disk, ağ",
      "Giriş, gelişme, sonuç, özet, test",
    ],
    1,
  ),
  mcq(
    "q_pr_4",
    "Rol (Role) tanımlamak neden işe yarar?",
    [
      "Modeli yavaşlatır",
      "Milyarlarca parametre içinden o uzmanlığın dilini ve düşünce kalıbını öne çeker",
      "Yasal imza yerine geçer",
      "Sınav barajını düşürür",
    ],
    1,
  ),
  mcq(
    "q_pr_5",
    "Kısıtlar (constraints) halüsinasyonu nasıl keser?",
    [
      "Modeli kapatarak",
      "Yapılmayacakları ve 'veride yoksa uydurma' kuralını açık yazarak",
      "Daha çok emoji ekleyerek",
      "Prompt'u tek kelimeye indirerek",
    ],
    1,
  ),
  mcq(
    "q_pr_6",
    "Kötü prompt örneği hangisidir?",
    [
      "Rol, görev, bağlam, kısıt ve formatı dolduran istem",
      "'Bana bir e-posta yaz' gibi muğlak tek cümle",
      "Few-Shot örnekli istem",
      "Chain-of-Thought isteyen istem",
    ],
    1,
  ),
  mcq(
    "q_pr_7",
    "Zero-Shot, One-Shot ve Few-Shot farkı nedir?",
    [
      "Hepsi aynıdır",
      "Sıfır / bir / birkaç tamamlanmış örnekle modelin biçimi öğrenmesi",
      "Yalnızca görsel modellerde geçerlidir",
      "Shot sayısı token fiyatını sıfırlar",
    ],
    1,
  ),
  mcq(
    "q_pr_8",
    "Few-Shot pratikte ne zaman seçilir?",
    [
      "Modelin üslup ve formatı birebir kopyalamasını istediğinde (2–4 örnek)",
      "Hiç örnek verilemediğinde",
      "Yalnızca matematik sorularında",
      "Sınavı atlamak için",
    ],
    0,
  ),
  mcq(
    "q_pr_9",
    "Chain-of-Thought (düşünce zinciri) ne ister?",
    [
      "Cevabı tek kelimede basmasını",
      "Adım adım düşünmesini; acele saçmalamayı kesmesini",
      "İnterneti kapatmasını",
      "Yalnızca şiir yazmasını",
    ],
    1,
  ),
  mcq(
    "q_pr_10",
    "Uzman paneli simülasyonu ne işe yarar?",
    [
      "Tek bir evet/hayır cevabı üretmek",
      "Birden fazla uzman rolünü aynı masada konuşturup stratejik kararı çok açıdan sınamak",
      "PDF'i silmek",
      "Sınav sorusu çalmak",
    ],
    1,
  ),
  mcq(
    "q_pr_11",
    "İş e-postasında diplomatik tahsilat promptu neyi korur?",
    [
      "Müşteriyi aşağılamak",
      "İlişkiyi bozmadan geciken ödemeyi net aksiyonla hatırlatmak",
      "Yasal icra tehdidini yapay zekâya bırakmak",
      "Kişisel verileri açık paylaşmak",
    ],
    1,
  ),
  mcq(
    "q_pr_12",
    "Dört üslup kanalı hangileridir?",
    [
      "HTML, CSS, JS, SQL",
      "Resmi-kurumsal, sıcak-empatik, ikna edici, yalın-eğitici",
      "Tweet, Reels, Blog, PDF",
      "Alıcı, satıcı, kargo, iade",
    ],
    1,
  ),
  mcq(
    "q_pr_13",
    "Critique & Refine döngüsü nedir?",
    [
      "İlk taslağı olduğu gibi göndermek",
      "Çıktıyı eleştirip kör noktayı düzelterek ikinci turda sıkılaştırmak",
      "Prompt'u silmek",
      "Modeli değiştirmeden aynı hatayı tekrarlamak",
    ],
    1,
  ),
  mcq(
    "q_pr_14",
    "Pre-Mortem kriz testi ne sorar?",
    [
      "Proje bittikten sonra kim suçlu",
      "Henüz başlamadan 'bu iş nasıl başarısız olur' senaryosunu yazdırır",
      "Yalnızca bütçe kalemini",
      "Sınav notunu",
    ],
    1,
  ),
  mcq(
    "q_pr_15",
    "Dağınık veriden SWOT isterken doğru yaklaşım nedir?",
    [
      "Veri yokken ortalama uydurmak",
      "Ham notları bağlama koyup kanıtsız iddia basmamayı kısıt olarak yazmak",
      "Yalnızca tehditleri sormak",
      "Google'dan kopyalamak",
    ],
    1,
  ),
  mcq(
    "q_pr_16",
    "Görsel promptun beş katmanı hangileridir?",
    [
      "Fiyat, stok, kargo, iade, puan",
      "Ana konu, çevre, ışık, kamera/lens, sanat tarzı ve doku",
      "Giriş, gelişme, sonuç, test, özet",
      "Rol, görev, webhook, CRM, SLA",
    ],
    1,
  ),
  mcq(
    "q_pr_17",
    "Vision (görsel algılama) yapay zekâsı müfredatta ne işe yarar?",
    [
      "Yalnızca duvar kağıdı üretir",
      "Fotoğraf, grafik veya el çiziminden içgörü, hata ve taslak çıkarır",
      "Sesi klonlar",
      "Sınavı otomatik geçer",
    ],
    1,
  ),
  mcq(
    "q_pr_18",
    "ElevenLabs metninde parantez içi yönlendirme neden kullanılır?",
    [
      "Dosya boyutunu küçültmek için",
      "Duygu ve nefes ([fısıltıyla], duraklama) yöneterek robotik okumayı kırmak için",
      "Telif hakkını silmek için",
      "Videoyu 9:16 yapmak için",
    ],
    1,
  ),
  mcq(
    "q_pr_19",
    "Video modellerinde (Runway, Kling, Sora) kritik unsur nedir?",
    [
      "Yalnızca ürün adını yazmak",
      "Kamera hareketini tarif etmek (açı, takip, motion blur)",
      "Hashtag listesi",
      "PDF eklemek",
    ],
    1,
  ),
  mcq(
    "q_pr_20",
    "Prompt kütüphanesini ölçeklenebilir kılan nedir?",
    [
      "Her seferinde sıfırdan yazmak",
      "Dinamik parametreler (`[DEĞİŞKEN]`) ile ekip içinde paylaşılabilir şablon",
      "Şifreyi sohbete yapıştırmak",
      "Yalnızca ekran görüntüsü saklamak",
    ],
    1,
  ),
  mcq(
    "q_pr_21",
    "Kütüphane klasör mimarisinde hangisi vardır?",
    [
      "Yalnızca rastgele notlar",
      "İletişim, içerik, yönetim/strateji, pazarlama, multimodal",
      "Yalnızca şifreler",
      "Yalnızca faturalar",
    ],
    1,
  ),
  mcq(
    "q_pr_22",
    "Görev (task) cümlesi nasıl yazılır?",
    [
      "Muğlak 'yap şunu' ile",
      "Net eylem fiili: özetle, karşılaştır, hataları listele, 3 alternatif üret",
      "Yalnızca emoji ile",
      "Boş bırakılarak",
    ],
    1,
  ),
  mcq(
    "q_pr_23",
    "Çıktı formatı neden açık yazılır?",
    [
      "Model varsayılan olarak her zaman tablo basar",
      "Paragraf, madde, e-posta veya kontrol listesi tesliminin rastgele kalmaması için",
      "Token'ı ücretsiz yapmak için",
      "Sınavı iptal etmek için",
    ],
    1,
  ),
  mcq(
    "q_pr_24",
    "Müşteri veya şirket verisini prompt'a koyarken kural nedir?",
    [
      "TC, IBAN ve isimleri ham yapıştırmak",
      "KVKK: kişisel ve ticari sırları maskelemek",
      "Verileri herkese açık pastete atmak",
      "Yalnızca şifreyi silmek yeter",
    ],
    1,
  ),
  mcq(
    "q_pr_25",
    "Yapay zekânın ürettiği resmi metinde son sorumluluk kimdedir?",
    [
      "Tamamen model şirketinde",
      "Tarih, rakam ve iddiayı insan denetler; imza insandadır",
      "Metin kısaysa denetim gerekmez",
      "Sınavı geçen herkes sorumluluktan muaftır",
    ],
    1,
  ),
  mcq(
    "q_pr_26",
    "Soğuk satış (cold email) promptunun hedefi nedir?",
    [
      "Alıcıyı spam ile boğmak",
      "Kısa, kişiselleştirilmiş ve randevu koparan diplomatik ilk dokunuş",
      "Tüm fiyat listesini yapıştırmak",
      "Yasal sözleşme imzalatmak",
    ],
    1,
  ),
  mcq(
    "q_pr_27",
    "'Adım adım düşün' talimatı hangi sınıfa girer?",
    [
      "Zero-Shot ansiklopedi",
      "Chain-of-Thought",
      "Brand Kit",
      "Human Handoff",
    ],
    1,
  ),
  mcq(
    "q_pr_28",
    "Katman 1 kapanışında prompt mühendisliği neden omurga sayılır?",
    [
      "Yalnızca kod yazdırır",
      "Ofis, e-ticaret, chatbot ve içerik fabrikasının ortak dilidir",
      "Sertifikayı satın alma anında basar",
      "Katman 2'yi iptal eder",
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
      "İlk prompt yazıldığında",
      "Özet PDF indirildiğinde",
    ],
    1,
  ),
];
