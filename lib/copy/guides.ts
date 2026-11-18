/**
 * Kamuya açık rehber makaleleri. /rehber dizini durur; bunlar alt sayfadır.
 * Her biri gerçek tezgâh aracına gider. Kabul, tutar ve sıra uydurulmaz.
 */

export const GUIDE_HUB_PATH = "/rehber" as const;

export type PublicGuide = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  sections: readonly { heading: string; paragraphs: readonly string[] }[];
  steps: readonly string[];
  faqs: readonly { question: string; answer: string }[];
  toolHref: string;
  toolLabel: string;
  examHref: string;
  examLabel: string;
};

export const PUBLIC_GUIDES: readonly PublicGuide[] = [
  {
    slug: "trendyol-urun-aciklamasi",
    title: "Trendyol ürün açıklaması optimizasyonu",
    description:
      "Trendyol ürün açıklamasında başlık, ölçü ve iade cümlesi. Metni AI Tezgâh yazar; sıra ve komisyon pazaryerinindir.",
    h1: "Trendyol ürün açıklamasını ölçülebilir yaz",
    lead: "Arama, ürünün adını ve ayırt edici ölçüsünü ilk satırda arar. Süs cümlesi tıklamayı büyütmez.",
    sections: [
      {
        heading: "İlk yüz karakter",
        paragraphs: [
          "Başlıkta marka, ürün tipi ve bir ölçü kalsın. Renk ve beden varyantı başlığı şişirmesin.",
          "Açıklamanın ilk cümlesi alıcının sorusunu cevaplasın: bu ürün kim için, hangi ölçüyle, ne işe yarar.",
        ],
      },
      {
        heading: "Yasak vaat",
        paragraphs: [
          "“En ucuz”, “kesin orijinal” ve stokta olmayan süreyi yazma. Bunlar hem güveni hem hesabı bozar.",
        ],
      },
    ],
    steps: [
      "Ürünün ölçüsünü, malzemesini ve kime hitap ettiğini üç satır yaz.",
      "AI Tezgâh pazaryeri aracında Trendyol metnini üret.",
      "Başlığı 60 karakter civarında kırp, ilk cümleyi kendin oku.",
      "Aynı işi e-ticaret sınavında göstererek rozete bağla.",
    ],
    faqs: [
      {
        question: "Tezgâh Trendyol sırasını yükseltir mi?",
        answer: "Hayır. Metin üretir. Sıra, komisyon ve vitrin Trendyol'un kuralıdır.",
      },
      {
        question: "Rakip açıklamayı kopyalayabilir miyim?",
        answer: "Hayır. Kendi ürününün ölçüsünü yaz. Kopya metin telif ve hesap riski taşır.",
      },
      {
        question: "Bu rehber sertifika basar mı?",
        answer: "Hayır. Sertifika, e-ticaret eğitiminin sınavı 70 ve üzeri geçilince basılır.",
      },
    ],
    toolHref: "/tezgah?tool=pazaryeri",
    toolLabel: "Ürün açıklamasını Tezgâh'ta yaz",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "kosgeb-is-plani",
    title: "KOSGEB iş planı hazırlama rehberi",
    description:
      "KOSGEB iş planında problem, müşteri ve adam-ay. Taslağı Tezgâh üretir; kabul ve tutar kurumun kararıdır.",
    h1: "KOSGEB iş planını abartısız kur",
    lead: "Kurum, fikrin heyecanını değil problemin kimde durduğunu ve işin nasıl ölçüleceğini okur.",
    sections: [
      {
        heading: "Üç blok",
        paragraphs: [
          "Problem, müşteri ve senin yapacağın iş. Her blok iki cümleyi geçmesin.",
          "Personel kalemini adam-ay ile yaz. Destek tutarını katalogdan okumadan kendi cümlene koyma.",
        ],
      },
    ],
    steps: [
      "İş fikrini on iki satırda yaz: kim, hangi sorun, sen ne üreteceksin.",
      "Hibe aracında katalog eşleşmesini gör.",
      "Taslağı kendi evrakınla karşılaştır. Uymayan cümleyi sil.",
      "Dosyayı anlatacak ofis sınavını ayrıca geç.",
    ],
    faqs: [
      {
        question: "Uygunluk yüzdesi kabul anlamına gelir mi?",
        answer: "Hayır. Eşleşme katalog şartına bakar. Karar KOSGEB'indir.",
      },
      {
        question: "Tutar yazmalı mıyım?",
        answer: "Yalnız çağrıda gördüğün tavanı an. Uydurma bütçe yazma.",
      },
      {
        question: "Rehberi bitirmek başvuruyu yapar mı?",
        answer: "Hayır. Başvuru kurumun kendi sistemindedir.",
      },
    ],
    toolHref: "/tezgah?tool=grant",
    toolLabel: "İş planı taslağını üret",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "kobi-whatsapp-chatbot",
    title: "KOBİ'ler için WhatsApp chatbot kurulumu",
    description:
      "WhatsApp karşılama, randevu ve yanlış anlama. Akışı önce yaz, sonra kodsuz araca taşı. Tezgâh metni üretir.",
    h1: "KOBİ WhatsApp botunu altı cümleyle kur",
    lead: "Bot, menü ezberi değildir. Müşteri ne soracak, bot ne zaman insana devredecek: bu iki karar kurulumu belirler.",
    sections: [
      {
        heading: "Devretme çizgisi",
        paragraphs: [
          "Fiyat, şikâyet ve özel ölçü insana düşsün. Bot bunları uydurmasın.",
          "Karşılama cümlesi işletmenin adını ve bir sonraki adımı söylesin.",
        ],
      },
    ],
    steps: [
      "En sık üç müşteri cümlesini yaz.",
      "Her cümleye bot cevabı ve devretme kuralı ekle.",
      "Tezgâh'ta karşılama metnini üret, kendi sesinle düzelt.",
      "Chatbot sınavında aynı akışı göster.",
    ],
    faqs: [
      {
        question: "Tezgâh WhatsApp hesabımı bağlar mı?",
        answer: "Hayır. Metin ve akış üretir. Bağlantı senin WhatsApp işletme hesabındadır.",
      },
      {
        question: "Bot fiyat söyleyebilir mi?",
        answer: "Söylemesin. Fiyat değişir. Bot insan devretsin.",
      },
      {
        question: "Kurulum sertifika mıdır?",
        answer: "Hayır. Sertifika chatbot eğitiminin sınavındadır.",
      },
    ],
    toolHref: "/tezgah",
    toolLabel: "Karşılama metnini yaz",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "freelancer-teklif",
    title: "Freelancer teklif hazırlama rehberi",
    description:
      "Kapsam, süre ve teslim biçimi net teklif. Para platformdan geçmez; teklif metnini Tezgâh yazar, sen gönderirsin.",
    h1: "Freelancer teklifini kapsamla sınırla",
    lead: "İyi teklif fiyatı şişirmez. Ne yapılacağını, ne yapılmayacağını ve teslimin hangi dosya olduğunu yazar.",
    sections: [
      {
        heading: "Üç sınır",
        paragraphs: [
          "İşin kapsamı, dışı ve teslim günü. Revizyon sayısı yoksa bir yaz.",
          "Tahsilatı kendi sözleşmenle yap. Bu sayfa emanet veya iş ilanı açmaz.",
        ],
      },
    ],
    steps: [
      "Müşterinin cümlesini olduğu gibi alta yaz.",
      "Teklif aracında kapsam, süre ve teslimi üret.",
      "Fiyatı sen koy. Araç tutar uydurmasın.",
      "Teklifi anlatan ofis sınavını geç, kartını paylaş.",
    ],
    faqs: [
      {
        question: "Teklif platformda mı tutulur?",
        answer: "Hayır. Metni sen müşteriye gönderirsin. Freelancer iş odası kapalıdır.",
      },
      {
        question: "Rozet iş garanti eder mi?",
        answer: "Hayır. Rozet sınavı geçtiğini gösterir. İş bulmayı vaat etmez.",
      },
      {
        question: "Fiyatı araç mı yazar?",
        answer: "Hayır. Kapsamı yazar. Tutarı sen belirlersin.",
      },
    ],
    toolHref: "/tezgah?tool=proposal",
    toolLabel: "Teklif metnini üret",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "hepsiburada-urun-karti",
    title: "Hepsiburada ürün kartı rehberi",
    description:
      "Hepsiburada kartında başlık, özellik ve iade cümlesi. Metin Tezgâh'tan gelir; yayın pazaryeri panelindedir.",
    h1: "Hepsiburada kartında özelliği öne al",
    lead: "Alıcı başlıkta ürünü tanımazsa açıklamayı açmaz. Özellik, sloganın önündedir.",
    sections: [
      {
        heading: "Kart iskeleti",
        paragraphs: [
          "Başlık, üç özellik, kullanım ve iade. Dört blok yeter.",
          "Aynı metni Trendyol'a yapıştırmadan önce karakter sınırını yeniden ölç.",
        ],
      },
    ],
    steps: [
      "Özellikleri üretici etiketinden yaz, hafızadan değil.",
      "Pazaryeri aracında Hepsiburada metnini üret.",
      "Yayından önce ölçü ve renk varyantını ayır.",
    ],
    faqs: [
      {
        question: "Tek metin iki pazaryerine yeter mi?",
        answer: "Taslak yeter. Her panelin karakter sınırı ayrıdır; yayından önce kırp.",
      },
      {
        question: "Stok cümlesi yazılır mı?",
        answer: "Yazma. Stok değişir. Kart özellik taşır.",
      },
      {
        question: "Rehber rozet basar mı?",
        answer: "Hayır. Rozet e-ticaret sınavındadır.",
      },
    ],
    toolHref: "/tezgah?tool=pazaryeri",
    toolLabel: "Kart metnini yaz",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "instagram-reklam-metni",
    title: "Instagram reklam metni rehberi",
    description:
      "Instagram reklamında üç saniyelik kanca, tek vaat ve tek çağrı. Metni Tezgâh yazar; bütçeyi sen koyarsın.",
    h1: "Instagram reklamında tek vaat bırak",
    lead: "İki vaat birden yazılırsa ikisi de okunmaz. Kanca, ürünün tek farkını söyler.",
    sections: [
      {
        heading: "Kanca ve çağrı",
        paragraphs: [
          "İlk satır soru ya da ölçü olsun. İkinci satır tek düğme: yaz, ara veya siteye git.",
          "“Herkes aldı” gibi sosyal kanıt uydurma.",
        ],
      },
    ],
    steps: [
      "Ürünün tek farkını bir cümleye indir.",
      "Reklam aracında üç kanca üret.",
      "Birini seç, diğerlerini sil.",
    ],
    faqs: [
      {
        question: "Tezgâh reklamı yayınlar mı?",
        answer: "Hayır. Metin üretir. Yayın ve bütçe senin reklam hesabındadır.",
      },
      {
        question: "Beğeni sayısı yazılır mı?",
        answer: "Yazılmaz. Uydurma sosyal kanıt yasaktır.",
      },
      {
        question: "Hangi sınav bu işe bağlı?",
        answer: "Sosyal medya eğitiminin sınavı.",
      },
    ],
    toolHref: "/tezgah?tool=reklam",
    toolLabel: "Reklam kancasını üret",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "google-reklam-metni",
    title: "Google reklam metni rehberi",
    description:
      "Arama reklamında başlık, açıklama ve tek çağrı. Karakter sınırı kodda değil, senin sayımındadır. Tezgâh taslak verir.",
    h1: "Google arama reklamında başlığı ölç",
    lead: "Arama niyeti ürün adıdır. Başlık, aranan kelimeyi ve bir ölçüyü taşır; ünlem taşımaz.",
    sections: [
      {
        heading: "Üç satır",
        paragraphs: [
          "Başlık, açıklama, çağrı. Her birini yayın panelinin sayacında tekrar ölç.",
          "Rakip markanın adını başlığa yazma.",
        ],
      },
    ],
    steps: [
      "Müşterinin aradığı üç kelimeyi yaz.",
      "Reklam aracında arama metnini üret.",
      "Panel sayacına sığmayan kelimeyi kes.",
    ],
    faqs: [
      {
        question: "Tıklama fiyatını araç bilir mi?",
        answer: "Hayır. Bütçe ve tıklama fiyatı reklam hesabındadır.",
      },
      {
        question: "Birden fazla vaat olur mu?",
        answer: "Olmasın. Tek çağrı yeter.",
      },
      {
        question: "Sertifika bu sayfada mı?",
        answer: "Hayır. Sosyal medya veya ofis sınavındadır.",
      },
    ],
    toolHref: "/tezgah?tool=reklam",
    toolLabel: "Arama metnini üret",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "e-ticaret-seo",
    title: "E-ticaret SEO rehberi",
    description:
      "Ürün sayfasında başlık, meta açıklama ve tek H1. Tetkik skoru kodda hesaplanır; sıra vaadi yoktur.",
    h1: "E-ticaret sayfasında başlığı ve H1'i ayır",
    lead: "Başlık arama sonucudur. H1 sayfanın adıdır. İkisi aynı şişkin cümle olursa ikisi de zayıflar.",
    sections: [
      {
        heading: "Üç kontrol",
        paragraphs: [
          "Başlık 10–60 karakter, meta açıklama 50–160, sayfada tek H1.",
          "Görselin alt metni ürünün adını taşısın. “resim” yazmasın.",
        ],
      },
    ],
    steps: [
      "Canlı ürün adresini tetkik aracına yaz.",
      "Düşen maddeleri tek tek kapat.",
      "Yeni metni pazaryeri veya dükkân aracıyla üret.",
    ],
    faqs: [
      {
        question: "100 puan ilk sıra mıdır?",
        answer: "Hayır. Skor sayfanın iskeletidir. Arama sırası ayrıca vaat edilmez.",
      },
      {
        question: "JavaScript ile çizilen fiyat ölçülür mü?",
        answer: "Hayır. Tetkik ilk HTML'i okur. Sonradan çizilen vitrin skora girmez.",
      },
      {
        question: "Hangi sınav?",
        answer: "E-ticaret yapay zekâ sınavı.",
      },
    ],
    toolHref: "/tetkik",
    toolLabel: "Sayfayı tetkik et",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "web-sitesi-tetkik",
    title: "Web sitesi tetkik rehberi",
    description:
      "Ana sayfanın SEO, hız ve dönüşüm skorunu kayıt olmadan ölç. Skor 13 kontrolün toplamıdır. Model anlatımı yoktur.",
    h1: "Web sitenin açık sayfasını tetkik et",
    lead: "Merak edilen soru “sitem kaç puan?”. Cevap, herkese açık ilk HTML'den kodla hesaplanır.",
    sections: [
      {
        heading: "Ne ölçülür",
        paragraphs: [
          "Başlık, açıklama, H1, mobil çerçeve, Türkçe dil, https, telefon veya WhatsApp, form, çağrı, görsel altı, ilk bayt ve sayfa boyu.",
          "Yönetici paneli, özel ağ ve şifreli adres reddedilir.",
        ],
      },
    ],
    steps: [
      "https adresini /tetkik sayfasına yaz.",
      "Skoru ve düşen maddeleri oku.",
      "Paylaşılabilir bağlantıyı ekibine gönder.",
      "Eksiği Tezgâh'ta kendin kapat veya uzman dizinine bak.",
    ],
    faqs: [
      {
        question: "Kayıt gerekir mi?",
        answer: "Hayır. Adres yeter. Rapor bir hash ile saklanır.",
      },
      {
        question: "Puan uydurulur mu?",
        answer: "Hayır. Site okunamazsa skor yazılmaz.",
      },
      {
        question: "Uzman bu puanı yükseltir mi?",
        answer: "Dizin eşleştirme yapar. Sonuç vaadi yoktur. Para platformdan geçmez.",
      },
    ],
    toolHref: "/tetkik",
    toolLabel: "Tetkiki başlat",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "prompt-yazma",
    title: "Prompt yazma rehberi",
    description:
      "Role, bağlam, biçim ve kaynak sınırı. Doğru talimat altı derstir. Tezgâh aynı iskeleti günlük işe taşır.",
    h1: "Yapay zekâya dört parçalı talimat ver",
    lead: "“Güzel yaz” talimat değildir. Rol, bağlam, biçim ve kaynak sınırı yoksa cevap rastgele uzar.",
    sections: [
      {
        heading: "Dört parça",
        paragraphs: [
          "Kim konuşuyor, hangi belgeye bakıyor, çıktı hangi biçimde, uydurması yasak olan ne.",
          "Müşteri adı ve telefonu talimata yapışmaz. Önce maskele.",
        ],
      },
    ],
    steps: [
      "İşi tek cümle yaz.",
      "Dört parçayı alta ekle.",
      "Tezgâh'ta aynı iskeletle bir çıktı al.",
      "Prompt sınavında iskeleti göster.",
    ],
    faqs: [
      {
        question: "Uzun talimat daha mı iyi?",
        answer: "Hayır. Eksik parça zarar verir. Fazla süs de zarar verir.",
      },
      {
        question: "Müşteri listesini yapıştırır mıyım?",
        answer: "Hayır. Ad ve telefonu maskele.",
      },
      {
        question: "Sınav barajı nedir?",
        answer: "70. Altı sertifika basmaz.",
      },
    ],
    toolHref: "/tezgah",
    toolLabel: "Talimatı tezgâhta dene",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "excel-yapay-zeka",
    title: "Excel'de yapay zekâ rehberi",
    description:
      "Dağınık tabloyu temizle, yönetim özetine indir, sayıyı kaynakla kilitle. İlk ofis dersi ücretsizdir.",
    h1: "Excel tablosunu önce temizle, sonra özetle",
    lead: "Kirli sütun, güzel özet üretmez. Önce başlık satırı ve tek tip hücre, sonra üç maddelik yönetim özeti.",
    sections: [
      {
        heading: "Kilit",
        paragraphs: [
          "Yapay zekâ toplamı şüpheliyse TOPLA ve kaynak evrakla sayıyı kilitle.",
          "Müşteri telefonunu tabloyu yüklemeden maskele.",
        ],
      },
    ],
    steps: [
      "Başlık satırını tek satıra indir.",
      "Tezgâh veya dersin Copilot adımıyla üç madde çıkart.",
      "Bir sayıyı kaynakla doğrula.",
      "Ofis sınavını geç.",
    ],
    faqs: [
      {
        question: "İlk ders ücretli mi?",
        answer: "Hayır. Ofis eğitiminin ilk dersi kayıt duvarının önündedir.",
      },
      {
        question: "Özet belge midir?",
        answer: "Hayır. Belge, sınav 70 ve üzeri geçilince basılır.",
      },
      {
        question: "Tablo müşteri verisi taşıyorsa?",
        answer: "Maskele, sonra yükle.",
      },
    ],
    toolHref: "/tezgah",
    toolLabel: "Özeti tezgâhta dene",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "hibe-proje-dosyasi",
    title: "Hibe proje dosyası rehberi",
    description:
      "Problem, iş paketi ve adam-ay ile proje dosyası taslağı. Katalog eşleşir. Kabul yazılmaz.",
    h1: "Hibe dosyasını iş paketine böl",
    lead: "Tek paragraf fikir, dosya değildir. İş paketleri, kim yapacak ve nasıl ölçülecek ayrı durur.",
    sections: [
      {
        heading: "Dürüst sınır",
        paragraphs: [
          "Araç, mühürlü katalogdaki çağrıyı eşler. Kapanmış çağrıyı açık gibi yazmaz.",
          "Destek tutarını senin cümlen büyütmez.",
        ],
      },
    ],
    steps: [
      "Fikri on iki satır yaz.",
      "İl ve sektörü seç, eşleşmeyi gör.",
      "Taslağı kurumun şablonuna sen taşı.",
    ],
    faqs: [
      {
        question: "Dosya başvurunun yerine geçer mi?",
        answer: "Hayır. Taslaktır. Başvuru kurumun sistemindedir.",
      },
      {
        question: "LLM maliyeti var mı?",
        answer: "Eşleşme katalogdadır. Anlatım üretimi ayrı tezgâh aracıdır ve deftere yazılır.",
      },
      {
        question: "Uzman tutmak zorunda mıyım?",
        answer: "Hayır. Dosyayı kendin üretebilir veya dizindeki rozetli kişiye kendi sözleşmenle bakabilirsin.",
      },
    ],
    toolHref: "/tezgah?tool=grant",
    toolLabel: "Proje taslağını üret",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "dijital-dukkan",
    title: "Dijital dükkân sayfası rehberi",
    description:
      "Tek sayfalık dükkân: ad, hizmet, WhatsApp. Şablon Tezgâh'tan iner. Tahsilat bu sayfada yoktur.",
    h1: "Tek sayfalık dijital dükkân kur",
    lead: "Ziyaretçi üç şeyi arar: kimsin, ne iş yaparsın, nasıl yazar. Gerisi kaydırılmadan okunmaz.",
    sections: [
      {
        heading: "Kapı",
        paragraphs: [
          "WhatsApp ya da telefon yoksa sayfa vitrin olur, kapı olmaz.",
          "Fiyatı şablona uydurma. Tutar senin etiketindir.",
        ],
      },
    ],
    steps: [
      "Hizmeti dört maddede yaz.",
      "Dükkân aracında sayfayı üret.",
      "Html dosyasını kendi alan adına koy.",
      "Yayından sonra /tetkik ile skoru ölç.",
    ],
    faqs: [
      {
        question: "Sayfa ödeme alır mı?",
        answer: "Hayır. İletişim kapısıdır. Tahsilat senin kendi yönteminledir.",
      },
      {
        question: "Hazır sektör metni benim midir?",
        answer: "Taslak senin hizmetinle yeniden yazılır. Olduğu gibi bırakma.",
      },
      {
        question: "Hangi sınav?",
        answer: "E-ticaret veya ofis sınavı, işine göre.",
      },
    ],
    toolHref: "/tezgah?tool=dukkan",
    toolLabel: "Dükkân sayfasını üret",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "musteri-hizmetleri-botu",
    title: "Müşteri hizmetleri botu rehberi",
    description:
      "Sık sorulan üç soru, devretme kuralı ve yasak vaat. Bot metnini yaz, hesabı sonra bağla.",
    h1: "Müşteri hizmetleri botuna sınır çiz",
    lead: "Bot her şeyi bilmez. Bildiği üç soru ve bilmediğinde söyleyeceği cümle yeter.",
    sections: [
      {
        heading: "Yasak",
        paragraphs: [
          "Kargo süresi, stok ve özel indirim botun ağzından çıkmasın. Bunlar gün içinde değişir.",
          "Kızgın müşteri ikinci cümlede insana devredilsin.",
        ],
      },
    ],
    steps: [
      "Son yirmi konuşmadan üç soruyu seç.",
      "Her soruya kısa cevap ve devretme cümlesi yaz.",
      "Tezgâh'ta karşılama metnini düzelt.",
      "Chatbot sınavında akışı göster.",
    ],
    faqs: [
      {
        question: "Bot iade onaylar mı?",
        answer: "Onaylamasın. İade kuralın insan okusun.",
      },
      {
        question: "Gece cevap verir mi?",
        answer: "Yazdığın karşılama evet. Karar vermesi hayır.",
      },
      {
        question: "Sertifika?",
        answer: "Chatbot eğitiminin sınavı 70 ve üzeri geçilince.",
      },
    ],
    toolHref: "/tezgah",
    toolLabel: "Bot metnini yaz",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "sosyal-medya-icerik-plani",
    title: "Sosyal medya içerik planı rehberi",
    description:
      "Haftalık üç içerik: kanca, tek stil, yayından önce kontrol. Takvim Tezgâh taslağıdır; yayın senin hesabındadır.",
    h1: "Haftalık içerik planını üçe indir",
    lead: "Yedi fikirden üçü yayınlanır. Gerisi ertelenir. Plan, her gün yeni stil denemek değildir.",
    sections: [
      {
        heading: "Tek stil",
        paragraphs: [
          "Aynı yazı tipi, aynı kadraj, aynı kapanış cümlesi. Hafta içinde stil değiştirme.",
          "Müşteri yüzünü izinsiz kullanma.",
        ],
      },
    ],
    steps: [
      "Haftanın tek mesajını yaz.",
      "Üç kanca üret, birini seç.",
      "Yayından önce ölçü ve fiyat var mı diye bak.",
      "Sosyal medya sınavını geç.",
    ],
    faqs: [
      {
        question: "Plan hesabıma kendiliğinden gider mi?",
        answer: "Hayır. Metin sende kalır. Yayın senin panelindedir.",
      },
      {
        question: "Her gün paylaşmak şart mı?",
        answer: "Hayır. Üç sağlam içerik, yedi zayıf içerikten iyidir.",
      },
      {
        question: "Rozet ne işe yarar?",
        answer: "Sınavı geçtiğini kamu kartında gösterir. İş garantisi değildir.",
      },
    ],
    toolHref: "/tezgah?tool=reklam",
    toolLabel: "Haftalık kancayı üret",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
] as const;

export function guidePath(slug: string): string {
  return `${GUIDE_HUB_PATH}/${slug}`;
}

export function publicGuide(slug: string): PublicGuide | null {
  return PUBLIC_GUIDES.find((guide) => guide.slug === slug) ?? null;
}
