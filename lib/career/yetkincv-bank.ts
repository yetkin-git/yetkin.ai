/** YetkinCV vaka bankası — doğru şık istemciye gitmez. */

import type { YetkinCvVerticalId } from "@/lib/career/yetkincv-options";

export type YetkinCvBankQuestion = {
  id: string;
  kind: "choice" | "case";
  skillId: string;
  skillLabel: string;
  prompt: string;
  choices: readonly string[];
  correctIndex: number;
};

export const YETKINCV_QUESTION_BANK: Record<
  YetkinCvVerticalId,
  readonly YetkinCvBankQuestion[]
> = {
  ecommerce: [
    {
      id: "ec-stock",
      kind: "choice",
      skillId: "stock",
      skillLabel: "Stok",
      prompt:
        "Aynı ürün iki pazaryeri kanalında satılıyor. Bir kanalda 4 adet satış düştü, depo sayımı hâlâ 20. İlk doğru adım hangisidir?",
      choices: [
        "Satışı düşen kanalın stoğunu düşürmek ve diğer kanalı aynı depo adediyle hizalamak",
        "İki kanalın stokunu da elle 20 yazmak",
        "Ürünü her iki kanalda da yayından kaldırmak",
        "Fiyatı düşürüp stoğu yok saymak",
      ],
      correctIndex: 0,
    },
    {
      id: "ec-return",
      kind: "choice",
      skillId: "returns",
      skillLabel: "İade",
      prompt:
        "Müşteri ürünü açmadan iade etti. Kanal iade kaydı var, depo ürünü henüz saymadı. Sipariş durumuna ne yazılır?",
      choices: [
        "Teslim edildi, iade yok",
        "İade yolda; depo sayımı gelmeden stok artmaz",
        "Satış hiç olmamış gibi siparişi sil",
        "Aynı gün yeni satış diye işlemek",
      ],
      correctIndex: 1,
    },
    {
      id: "ec-vat",
      kind: "choice",
      skillId: "price",
      skillLabel: "Fiyat",
      prompt:
        "Ürün kartındaki satış fiyatı KDV dahil 120. KDV hariç tutarı kartta ayrıca göstermek istiyorsun. Hangisi dürüsttür?",
      choices: [
        "120 yazıp KDV hariç diye etiketlemek",
        "KDV satırını boş bırakıp 120'yi her iki yere yazmak",
        "KDV oranını belirtip hariç tutarı oranla ayırmak",
        "Kargo ücretini fiyata gizleyip KDV yok demek",
      ],
      correctIndex: 2,
    },
    {
      id: "ec-copy",
      kind: "choice",
      skillId: "listing",
      skillLabel: "Ürün kartı",
      prompt: "Ürün açıklamasında ölçmediğin bir teslim süresi yazmak ne üretir?",
      choices: [
        "Doğrulanmış operasyon kaydı",
        "SHA-256 mühür",
        "Kanal stoğunun kendiliğinden düzelmesi",
        "Kartta duran ama ölçülmemiş bir vaat",
      ],
      correctIndex: 3,
    },
    {
      id: "ec-case",
      kind: "case",
      skillId: "case",
      skillLabel: "Vaka",
      prompt:
        "Vaka: Sabah bir kanal 0 stok gösteriyor, depo rafında 6 kutu duruyor, diğer kanal hâlâ satışa açık. Müşteriye bugün kargolanacak sipariş var. Ne yaparsın?",
      choices: [
        "Açık siparişi depodan ayırır, kanal stoklarını sayılan 6 ile hizalar, 0 görünen kanalı sayım bitene kadar kapalı tutarım",
        "Altı kutuyu da kapalı kanala ayırıp açık siparişi bekletirim",
        "Her iki kanalda da stok 99 yazar, siparişi yarına bırakırım",
        "Ürün fotoğrafını değiştirip stoğu olduğu gibi bırakırım",
      ],
      correctIndex: 0,
    },
    {
      id: "ec-sync",
      kind: "choice",
      skillId: "sync",
      skillLabel: "Kanal hizası",
      prompt:
        "Pazaryeri paneli 12 stok gösteriyor, depo sayımı 9. Satış durmadan önce ne yapılır?",
      choices: [
        "Panel sayısını 12 bırakıp satışa devam etmek",
        "Sayılan 9'u kanala yazıp fazlayı satışa kapatmak",
        "Farkı yok sayıp fiyatı yükseltmek",
        "Diğer üründen 3 adet bu karta bağlamak",
      ],
      correctIndex: 1,
    },
    {
      id: "ec-cargo",
      kind: "choice",
      skillId: "cargo",
      skillLabel: "Kargo",
      prompt:
        "Kargo firması takip numarası henüz vermedi. Müşteriye ne yazılır?",
      choices: [
        "Kargoda, takip: 000000",
        "Teslim edildi",
        "Sipariş hazırlandı; takip numarası gelince paylaşılacak",
        "Yarın kapında",
      ],
      correctIndex: 2,
    },
    {
      id: "ec-bundle",
      kind: "choice",
      skillId: "bundle",
      skillLabel: "Paket",
      prompt:
        "İki ürünü tek pakette satıyorsun. Birinin stoğu bitti. Kart ne olur?",
      choices: [
        "Paket açık kalır, eksik ürün sonra eklenir diye yazılır",
        "Paket fiyatı düşürülüp satış sürer",
        "Eksik ürün yerine benzeri konur, müşteriye söylenmez",
        "Paket yayından kalkar veya yalnız stoku olan bileşim satılır",
      ],
      correctIndex: 3,
    },
    {
      id: "ec-refund",
      kind: "choice",
      skillId: "refund",
      skillLabel: "İade ödemesi",
      prompt:
        "İade ürün depoda sayıldı ama ödeme henüz çıkmadı. Muhasebe satırına ne yazılır?",
      choices: [
        "İade kabul; ödeme bekliyor",
        "Ödeme tamamlandı",
        "Satış iptal, stok artmadı",
        "Yeni satış olarak işlendi",
      ],
      correctIndex: 0,
    },
    {
      id: "ec-photo",
      kind: "choice",
      skillId: "listing",
      skillLabel: "Ürün kartı",
      prompt:
        "Kart fotoğrafı başka renkteki modeli gösteriyor. Stokta yalnız siyah var. Ne yapılır?",
      choices: [
        "Fotoğrafı olduğu gibi bırakıp «renk seçilir» yazmak",
        "Fotoğrafı stoktaki renkle değiştirmek veya stok olmayan rengi kapatmak",
        "Renk seçeneğini hepsi var diye açmak",
        "Açıklamaya «fotoğraf temsili» yazıp satışı sürdürmek",
      ],
      correctIndex: 1,
    },
    {
      id: "ec-margin",
      kind: "choice",
      skillId: "price",
      skillLabel: "Fiyat",
      prompt:
        "Komisyon ve kargo düşülünce ürün zarara giriyor. Katalog fiyatını ne yaparsın?",
      choices: [
        "Zararı gizleyip aynı fiyatı bırakmak",
        "Zararı «reklam yatırımı» diye raporlamak",
        "Fiyatı maliyeti karşılayacak şekilde güncellemek veya satışı durdurmak",
        "Kargo ücretini 0 yazıp müşteriye sonradan eklemek",
      ],
      correctIndex: 2,
    },
    {
      id: "ec-case-delay",
      kind: "case",
      skillId: "case",
      skillLabel: "Vaka",
      prompt:
        "Vaka: Müşteri «bugün kargo» kampanyasıyla sipariş verdi. Depo kapanışına 20 dakika kaldı, kargo aracı kalktı. Ne yaparsın?",
      choices: [
        "Takip numarası uydurup yarın yüklerim",
        "Siparişi «teslim edildi» işaretlerim",
        "Müşteriye süre tutmadığını yazmadan beklerim",
        "Müşteriye gecikmeyi bildirir, gerçek çıkış saatini yazar, kampanya vaadini kapatırım",
      ],
      correctIndex: 3,
    },
  ],

  grant: [
    {
      id: "gr-fit",
      kind: "choice",
      skillId: "fit",
      skillLabel: "Uygunluk",
      prompt: "Destek programının çağrı metni yazılım giderini kapsamıyor. Dosyaya ne yazılır?",
      choices: [
        "Gideri kapsam dışı diye işaretleyip dosyadan çıkarmak",
        "Yazılım giderini eğitim diye adlandırıp eklemek",
        "Toplam bütçeyi şişirip kalemi gizlemek",
        "Çağrı metnini dosyaya koymamak",
      ],
      correctIndex: 0,
    },
    {
      id: "gr-budget",
      kind: "choice",
      skillId: "budget",
      skillLabel: "Bütçe",
      prompt:
        "Bütçe tablosunda personel satırı teklif mektubundaki adam-ay ile uyuşmuyor. İlk düzeltme nedir?",
      choices: [
        "Yalnız toplam hücreyi yuvarlamak",
        "Adam-ay, birim ücret ve satır tutarını aynı kaynağa bağlamak",
        "Personel satırını silip tutarı makine kalemine taşımak",
        "Eski yılın bütçesini kopyalamak",
      ],
      correctIndex: 1,
    },
    {
      id: "gr-proof",
      kind: "choice",
      skillId: "evidence",
      skillLabel: "Kanıt",
      prompt: "Proje dosyasında faaliyet yazıyorsun ama faturası yok. Satır nasıl durur?",
      choices: [
        "Tamamlandı ve ödendi",
        "Kurum onayladı",
        "Planlandı; ödeme kanıtı yok",
        "Hibe hesabına yattı",
      ],
      correctIndex: 2,
    },
    {
      id: "gr-claim",
      kind: "choice",
      skillId: "claim",
      skillLabel: "İddia",
      prompt: "Henüz başvurmadığın bir program için CV'ye ne yazılmaz?",
      choices: [
        "Başvuru taslağı hazırladığım",
        "Çağrı metnini okuduğum",
        "Uygunluk kontrolü yaptığım",
        "Desteği kazandım",
      ],
      correctIndex: 3,
    },
    {
      id: "gr-case",
      kind: "case",
      skillId: "case",
      skillLabel: "Vaka",
      prompt:
        "Vaka: KOBİ, yazılım lisansını hibe dosyasına koymak istiyor. Çağrı bu kalemi dışlıyor, eğitim kalemi ise açık. Ne yaparsın?",
      choices: [
        "Lisansı kapsam dışı bırakır, eğitim kalemini yalnız gerçek eğitim belgesiyle yazarım",
        "Lisans faturasını eğitim katılımı diye yeniden adlandırırım",
        "Toplam bütçeyi ikiye böler, lisans satırını siler gibi gösteririm",
        "Onay yazısı yokken «kurum kabul etti» satırı eklerim",
      ],
      correctIndex: 0,
    },
    {
      id: "gr-partner",
      kind: "choice",
      skillId: "partner",
      skillLabel: "Ortaklık",
      prompt:
        "Ortak kurum imza vermeden dosyaya «ortaklık kesin» yazmak ne üretir?",
      choices: [
        "Onaylanmış ortaklık kaydı",
        "İmzasız iddia; dosyadan çıkarılır veya «imza bekliyor» diye işaretlenir",
        "Otomatik kurum onayı",
        "Bütçe artışı",
      ],
      correctIndex: 1,
    },
    {
      id: "gr-timeline",
      kind: "choice",
      skillId: "timeline",
      skillLabel: "Takvim",
      prompt:
        "Çağrı son başvuru tarihi geçmiş. Dosyada durum satırı ne olur?",
      choices: [
        "Başvuru gönderildi",
        "İncelemede",
        "Süre doldu; yeni çağrı yoksa dosya kapanır",
        "Onaylandı, ödeme bekleniyor",
      ],
      correctIndex: 2,
    },
    {
      id: "gr-match",
      kind: "choice",
      skillId: "budget",
      skillLabel: "Bütçe",
      prompt:
        "Eş finansman oranı %40 isteniyor. Kendi katkın belgesiz. Ne yapılır?",
      choices: [
        "Katkiyi «sözlü taahhüt» diye yazmak",
        "Oranı düşürüp kurum farkı kapatır demek",
        "Başka projenin faturasını eş finansman göstermek",
        "Belgesiz katkıyı yazmamak; oran tutmuyorsa başvuruyu durdurmak",
      ],
      correctIndex: 3,
    },
    {
      id: "gr-indicator",
      kind: "choice",
      skillId: "evidence",
      skillLabel: "Kanıt",
      prompt:
        "Başarı göstergesi «100 kişi eğitildi» diyor, kayıtlı katılım 40. Rapora ne yazılır?",
      choices: [
        "40 kayıtlı katılımcı; hedef 100, henüz ulaşılmadı",
        "100 kişi eğitildi",
        "Yaklaşık 100",
        "Katılım ölçülmedi ama hedefe ulaşıldı",
      ],
      correctIndex: 0,
    },
    {
      id: "gr-scope",
      kind: "choice",
      skillId: "fit",
      skillLabel: "Uygunluk",
      prompt:
        "Çağrı yalnız KOBİ'ye açık. Başvuran holding iştiraki KOBİ tanımına girmiyor. İlk adım?",
      choices: [
        "Şirket unvanını değiştirip KOBİ yazmak",
        "Uygunluk dışı diye dosyayı durdurmak veya uygun tüzel kişiyi seçmek",
        "Holding bilançosunu gizleyip çalışan sayısını küçültmek",
        "Ortaklık oranını yok saymak",
      ],
      correctIndex: 1,
    },
    {
      id: "gr-invoice",
      kind: "choice",
      skillId: "evidence",
      skillLabel: "Kanıt",
      prompt:
        "Fatura tutarı bütçe satırından yüksek. Hangi işlem doğrudur?",
      choices: [
        "Faturayı bütçeye uydurup küçültmek",
        "Farkı başka kaleme yaymak",
        "Bütçe satırını belgelenen tutarla güncellemek veya aşan kısmı kapsam dışı bırakmak",
        "Faturayı ikiye bölüp aynı gün iki satır yazmak",
      ],
      correctIndex: 2,
    },
    {
      id: "gr-case-report",
      kind: "case",
      skillId: "case",
      skillLabel: "Vaka",
      prompt:
        "Vaka: Ara dönem raporunda faaliyet tamamlandı deniyor ama teslim tutanağı ve ödeme dekontu yok. Yönetici «şimdilik tamamlandı yaz» diyor. Ne yaparsın?",
      choices: [
        "Tamamlandı ve ödendi yazarım",
        "Kurum onayladı diye işaretlerim",
        "Tutanağı sonradan uydururum",
        "Faaliyeti «sürüyor / kanıt bekliyor» bırakır, tutanak ve dekont gelmeden tamamlandı demem",
      ],
      correctIndex: 3,
    },
  ],

  marketing: [
    {
      id: "mk-claim",
      kind: "choice",
      skillId: "claim",
      skillLabel: "İddia",
      prompt:
        "Reklam metninde ölçmediğin «3 günde satış ikiye katlanır» cümlesi ne işe yarar?",
      choices: [
        "Ölçülmemiş vaattir; metinden çıkarılır",
        "Kampanya hedefini kanıtlar",
        "Dönüşüm oranı yerine geçer",
        "SHA-256 kodu üretir",
      ],
      correctIndex: 0,
    },
    {
      id: "mk-audience",
      kind: "choice",
      skillId: "audience",
      skillLabel: "Kitle",
      prompt:
        "Kampanya, satın almış müşteriye değil siteyi bir kez açmış herkese gidiyor. İlk düzeltme hangisidir?",
      choices: [
        "Bütçeyi ikiye katlamak",
        "Kitleyi ölçülen segmente daraltmak ve dışarıdakini ayrı tutmak",
        "Aynı metni tüm ülkeye açmak",
        "Tıklamayı satış diye yazmak",
      ],
      correctIndex: 1,
    },
    {
      id: "mk-measure",
      kind: "choice",
      skillId: "measure",
      skillLabel: "Ölçüm",
      prompt:
        "Reklam paneli 400 tıklama, sipariş defteri 12 satış gösteriyor. Rapora hangisi yazılır?",
      choices: [
        "400 satış",
        "412 dönüşüm",
        "400 tıklama ve 12 kayıtlı satış; ikisi ayrı sayılır",
        "Satış yok, yalnız tıklama silinir",
      ],
      correctIndex: 2,
    },
    {
      id: "mk-proof",
      kind: "choice",
      skillId: "proof",
      skillLabel: "Kanıt",
      prompt: "Müşteri yorumu ekran görüntüsü yok. Kampanya slaytına ne konmaz?",
      choices: [
        "Yorum toplamadık",
        "Yorum isteği taslağı",
        "Ölçüm boş",
        "4,9 puan ve 200 yorum",
      ],
      correctIndex: 3,
    },
    {
      id: "mk-case",
      kind: "case",
      skillId: "case",
      skillLabel: "Vaka",
      prompt:
        "Vaka: Ajans, stokta olmayan ürün için «bugün kargoda» reklamı açmak istiyor. Depo sayımı 0. Ne yaparsın?",
      choices: [
        "Reklamı açmam; stok 0 iken teslim vaadi yazmam",
        "Reklamı açar, stok düşünce durdururum",
        "Komşu ürünün stok adedini bu ürüne yazarım",
        "Eski kampanyanın satışını bu ürünün satışı diye gösteririm",
      ],
      correctIndex: 0,
    },
    {
      id: "mk-utm",
      kind: "choice",
      skillId: "measure",
      skillLabel: "Ölçüm",
      prompt:
        "İki reklam aynı UTM ile yayınlanmış. Satışın hangi kaynaktan geldiği belli değil. Ne yapılır?",
      choices: [
        "Tüm satışı ilk reklama yazmak",
        "Kaynakları ayıran ayrı UTM kullanmak; belirsiz satışı «ayrılmadı» diye işaretlemek",
        "Satışı ikiye bölüp her iki kaynağa yazmak",
        "UTM'yi silip organik saymak",
      ],
      correctIndex: 1,
    },
    {
      id: "mk-consent",
      kind: "choice",
      skillId: "audience",
      skillLabel: "Kitle",
      prompt:
        "E-posta listesinde «kampanya izni» kutusu boş olan kayıtlar var. Ne yapılır?",
      choices: [
        "Hepsine kampanya gönderilir",
        "İzin sonradan varsayılır",
        "Yalnız açık izni olanlara gönderilir; izinsizler ayrılır",
        "İzinsizler SMS ile tamamlanır",
      ],
      correctIndex: 2,
    },
    {
      id: "mk-beforeafter",
      kind: "choice",
      skillId: "proof",
      skillLabel: "Kanıt",
      prompt:
        "«Önce-sonra» kreatifinde müşteri fotoğrafı var ama kullanım izni yok. Ne olur?",
      choices: [
        "Kreatif yayınlanır, izin sonra alınır",
        "Yüz bulanıklaştırılmadan kullanılır",
        "Rakip markanın görseli konur",
        "İzinsiz görsel çıkarılır; izinli veya stok görsel kullanılır",
      ],
      correctIndex: 3,
    },
    {
      id: "mk-budget",
      kind: "choice",
      skillId: "measure",
      skillLabel: "Ölçüm",
      prompt:
        "Günlük bütçe bitti, panel hâlâ «öğreniyor» diyor. Rapora ne yazılır?",
      choices: [
        "Bütçe tükendi; öğrenme sürüyor, sonuç kesin değil",
        "Kampanya başarılı, bütçe artırılmalı",
        "Dönüşüm garantili",
        "Harcanmayan bütçe satış sayılır",
      ],
      correctIndex: 0,
    },
    {
      id: "mk-discount",
      kind: "choice",
      skillId: "claim",
      skillLabel: "İddia",
      prompt:
        "İndirim «%50» yazıyor ama referans fiyat hiç uygulanmamış. Metin nasıl düzelir?",
      choices: [
        "%50'yi bırakıp «fırsat» eklemek",
        "Gerçek liste fiyatı ve uygulanabilir indirimi yazmak; sahte referansı kaldırmak",
        "Referans fiyatı uydurmak",
        "İndirimi «kadar» diye belirsiz bırakmak",
      ],
      correctIndex: 1,
    },
    {
      id: "mk-freq",
      kind: "choice",
      skillId: "audience",
      skillLabel: "Kitle",
      prompt:
        "Aynı kişiye günde 12 reklam gösteriliyor, şikâyet geldi. İlk düzeltme?",
      choices: [
        "Bütçeyi artırmak",
        "Metni agresifleştirmek",
        "Frekans sınırını düşürmek ve şikâyeti kaydetmek",
        "Şikâyeti yok saymak",
      ],
      correctIndex: 2,
    },
    {
      id: "mk-case-lead",
      kind: "case",
      skillId: "case",
      skillLabel: "Vaka",
      prompt:
        "Vaka: Form 80 «lead» getirdi; 55'i geçersiz telefon veya tekrar. Müşteriye sunumda ne dersin?",
      choices: [
        "80 nitelikli lead aldık",
        "Form doldurma = satış",
        "Geçersizleri silip 80'i korurum",
        "80 form, 25 geçerli iletişim; geçersizler ayrı sayılır",
      ],
      correctIndex: 3,
    },
  ],

  office: [
    {
      id: "of-sheet",
      kind: "choice",
      skillId: "sheet",
      skillLabel: "Tablo",
      prompt: "Aylık raporda aynı sipariş iki satırda duruyor. Toplamı göndermeden önce ne yapılır?",
      choices: [
        "Çift satırı tek sipariş kaydına indirmek",
        "Toplamı elle şişirmek",
        "Boş satırları satış saymak",
        "Geçen ayın toplamını kopyalamak",
      ],
      correctIndex: 0,
    },
    {
      id: "of-mail",
      kind: "choice",
      skillId: "mail",
      skillLabel: "Yazışma",
      prompt:
        "Müşteri listesini genel bir sohbet aracına yapıştırmadan önce ne kontrol edilir?",
      choices: [
        "Listenin renkleri",
        "Kişisel veri var mı ve araç bu veriyi işlemeye uygun mu",
        "Listenin satır sayısı tek mi",
        "İmza görseli yeterince büyük mü",
      ],
      correctIndex: 1,
    },
    {
      id: "of-brief",
      kind: "choice",
      skillId: "brief",
      skillLabel: "Talimat",
      prompt:
        "Yazışma taslağı «yarın kesin onaylanır» diyor. Onay makamı henüz bakmadı. Cümle nasıl düzelir?",
      choices: [
        "Onaylandı",
        "Ret geldi",
        "Taslak hazır; onay bekliyor",
        "Ödeme çıktı",
      ],
      correctIndex: 2,
    },
    {
      id: "of-file",
      kind: "choice",
      skillId: "file",
      skillLabel: "Dosya",
      prompt: "Toplantı notunda karar yok, yalnız fikir var. Nota hangi başlık yazılır?",
      choices: [
        "Karar ve sorumlu",
        "Bütçe onaylandı",
        "İş tamam",
        "Konuşulan fikir; karar yok",
      ],
      correctIndex: 3,
    },
    {
      id: "of-case",
      kind: "case",
      skillId: "case",
      skillLabel: "Vaka",
      prompt:
        "Vaka: Yönetici, müşteri e-posta listesini dış bir sohbete yapıştırıp «kampanya metni yaz» diyor. Listede ad ve telefon var. Ne yaparsın?",
      choices: [
        "Ad ve telefonu çıkarır, yalnız iş hedefini yazıp metin taslağı isterim",
        "Listeyi olduğu gibi yapıştırırım",
        "Listeyi herkese açık bir bağlantıya koyarım",
        "Telefonları sipariş numarası diye rapora eklerim",
      ],
      correctIndex: 0,
    },
    {
      id: "of-version",
      kind: "choice",
      skillId: "file",
      skillLabel: "Dosya",
      prompt:
        "Aynı sözleşmenin üç kopyası farklı klasörlerde duruyor. Hangisi gönderilir?",
      choices: [
        "En eski tarihli kopya",
        "İmza ve sürüm tarihi net olan güncel kopya; diğerleri arşivlenir",
        "Üçü birden eklenir",
        "Tarihsiz taslak",
      ],
      correctIndex: 1,
    },
    {
      id: "of-access",
      kind: "choice",
      skillId: "mail",
      skillLabel: "Yazışma",
      prompt:
        "Paylaşılan tabloda müşteri IBAN'ı var. Bağlantı «herkes düzenleyebilir». Ne yapılır?",
      choices: [
        "Bağlantıyı olduğu gibi bırakmak",
        "IBAN'ı sohbete kopyalamak",
        "Erişimi yetkili kişilerle sınırlamak; gerekirse hassas sütunu ayırmak",
        "Tabloyu herkese açık klasöre taşımak",
      ],
      correctIndex: 2,
    },
    {
      id: "of-deadline",
      kind: "choice",
      skillId: "brief",
      skillLabel: "Talimat",
      prompt:
        "İş emri «acil bugün» diyor ama kaynak ve onay yok. Durum satırı?",
      choices: [
        "Tamamlandı",
        "Yarın biter",
        "Gecikme yok",
        "Kaynak/onay bekliyor; süre netleşmedi",
      ],
      correctIndex: 3,
    },
    {
      id: "of-filter",
      kind: "choice",
      skillId: "sheet",
      skillLabel: "Tablo",
      prompt:
        "Filtrelenmiş görünümde 12 satır var; ham tabloda 40. Rapora hangi sayı yazılır?",
      choices: [
        "Filtrelenen 12 ve toplam 40 ayrı belirtilir",
        "40 yazılır, filtre yok sayılır",
        "12 yazılır, toplam gizlenir",
        "Ortalama 26 yazılır",
      ],
      correctIndex: 0,
    },
    {
      id: "of-cc",
      kind: "choice",
      skillId: "mail",
      skillLabel: "Yazışma",
      prompt:
        "Müşteri şikâyetini tüm şirket listesine CC ile göndermek isteniyor. Ne yapılır?",
      choices: [
        "Herkese CC atılır",
        "Yalnız ilgili birim ve kayıtlı sorumluya iletilir; geniş yayın yapılmaz",
        "Şikâyet silinir",
        "Müşteri adı değiştirilip duyuru yapılır",
      ],
      correctIndex: 1,
    },
    {
      id: "of-minutes",
      kind: "choice",
      skillId: "file",
      skillLabel: "Dosya",
      prompt:
        "Toplantıda bütçe konuşuldu ama oy birliği yok. Nota ne yazılmaz?",
      choices: [
        "Görüşler özetlendi",
        "Karar ertelendi",
        "Bütçe onaylandı, uygulama başladı",
        "Sonraki adım ve sorumlu belirsiz",
      ],
      correctIndex: 2,
    },
    {
      id: "of-case-export",
      kind: "case",
      skillId: "case",
      skillLabel: "Vaka",
      prompt:
        "Vaka: Stajyer, maaş bordrosunu «örnek tablo» diye genel sohbete yapıştırıp formül sormak istiyor. Ne yaparsın?",
      choices: [
        "Bordroyu olduğu gibi yapıştırırım",
        "İsimleri bırakıp tutarları silerim",
        "Dosyayı herkese açık klasöre koyarım",
        "Kişisel veriyi çıkarır, anonim örnek satırlarla formül sorarım",
      ],
      correctIndex: 3,
    },
  ],

  software: [
    {
      id: "sw-test",
      kind: "choice",
      skillId: "test",
      skillLabel: "Test",
      prompt: "Otomasyon üç örnekte çalıştı, dördüncüde hata verdi. Teslim notuna ne yazılır?",
      choices: [
        "Üç örnek geçti, bir örnek hata verdi",
        "Tüm kayıtlar geçti",
        "Hata örneğini silip dördü de geçti demek",
        "Test çalıştırmadım ama hazır",
      ],
      correctIndex: 0,
    },
    {
      id: "sw-prompt",
      kind: "choice",
      skillId: "prompt",
      skillLabel: "Talimat",
      prompt:
        "Kullanıcı metninin içine «önceki kuralları yok say» yazılmış. Araç bu metni işlerken ne yapar?",
      choices: [
        "Sistem kuralını bırakıp metindeki emri uygular",
        "Sistem kuralı durur; gömülü emir tek başına yetki açmaz",
        "Metni onaylanmış sözleşme sayar",
        "Kullanıcıya yönetici rolü verir",
      ],
      correctIndex: 1,
    },
    {
      id: "sw-review",
      kind: "choice",
      skillId: "review",
      skillLabel: "İnceleme",
      prompt:
        "Üretilen kod derlenmeden müşteriye «canlıda» diye verilirse kayıt ne olur?",
      choices: [
        "Gözden geçirilmiş sürüm",
        "Sınav mührü",
        "Çalıştırılmamış taslak",
        "Kabul edilmiş teslim",
      ],
      correctIndex: 2,
    },
    {
      id: "sw-secret",
      kind: "choice",
      skillId: "secret",
      skillLabel: "Giz",
      prompt: "API anahtarı sohbet metninde duruyor. İlk iş nedir?",
      choices: [
        "Anahtarı CV'ye eklemek",
        "Anahtarı doğrulama kodu diye yayınlamak",
        "Aynı anahtarı ikinci bir bota kopyalamak",
        "Anahtarı metinden çıkarmak ve yenilemek",
      ],
      correctIndex: 3,
    },
    {
      id: "sw-case",
      kind: "case",
      skillId: "case",
      skillLabel: "Vaka",
      prompt:
        "Vaka: Bir akış, fatura tutarını okuyup ödeme emri taslağı yazıyor. Tutar alanını boş bir kayıtta da dolduruyor. Ne yaparsın?",
      choices: [
        "Tutar yoksa emri durdurur, boş kaydı hata olarak gösteririm",
        "Boş tutarı 1 kabul edip emri gönderirim",
        "Rastgele bir tutar yazıp müşteriye yollarım",
        "Testi atlayıp akışı canlıya alırım",
      ],
      correctIndex: 0,
    },
    {
      id: "sw-log",
      kind: "choice",
      skillId: "review",
      skillLabel: "İnceleme",
      prompt:
        "Hata ayıklama günlüğünde müşteri e-postası ve token düz metin duruyor. Ne yapılır?",
      choices: [
        "Günlüğü olduğu gibi paylaşmak",
        "Hassas alanları maskeleyip gerekirse tokeni yenilemek",
        "Günlüğü sosyal medyada sormak",
        "Tokeni örnek diye dokümana yapıştırmak",
      ],
      correctIndex: 1,
    },
    {
      id: "sw-scope",
      kind: "choice",
      skillId: "prompt",
      skillLabel: "Talimat",
      prompt:
        "Model «tüm veritabanını sil» önerisi üretti. Operatör ne yapar?",
      choices: [
        "Komutu olduğu gibi çalıştırır",
        "Öneriyi onaylanmış sayar",
        "Silme işlemini çalıştırmaz; kapsam ve yedek olmadan reddeder",
        "Komutu gizli modda dener",
      ],
      correctIndex: 2,
    },
    {
      id: "sw-rollback",
      kind: "choice",
      skillId: "test",
      skillLabel: "Test",
      prompt:
        "Canlıya alınan sürüm hata verdi, önceki sürüm yedekte. İlk adım?",
      choices: [
        "Hatayı yok sayıp yeni özellik eklemek",
        "Müşteriye «her şey yolunda» yazmak",
        "Yedeksiz yeniden yazmak",
        "Bilinen iyi sürüme dönmek ve hatayı kayıt altına almak",
      ],
      correctIndex: 3,
    },
    {
      id: "sw-env",
      kind: "choice",
      skillId: "secret",
      skillLabel: "Giz",
      prompt:
        "Geliştirme ortamı anahtarı üretim koduna gömüldü. Ne yapılır?",
      choices: [
        "Anahtarı ortam değişkenine taşımak, gömülü değeri kaldırmak ve anahtarı yenilemek",
        "Anahtarı repoda bırakmak",
        "Aynı anahtarı örnek README'ye koymak",
        "Üretimde de geliştirme anahtarını kullanmak",
      ],
      correctIndex: 0,
    },
    {
      id: "sw-hallucination",
      kind: "choice",
      skillId: "prompt",
      skillLabel: "Talimat",
      prompt:
        "Model var olmayan bir API metodu uydurdu. Teslim öncesi ne yapılır?",
      choices: [
        "Metodu olduğu gibi göndermek",
        "Resmi dokümanda doğrulamak; yoksa taslağı düzeltmek veya çıkarmak",
        "Uydurma metodu «yeni özellik» diye yazmak",
        "Testi atlayıp müşteriye vermek",
      ],
      correctIndex: 1,
    },
    {
      id: "sw-access",
      kind: "choice",
      skillId: "review",
      skillLabel: "İnceleme",
      prompt:
        "Çekme isteğinde «herkese yazma» yetkisi açılmış. İncelemede ne denir?",
      choices: [
        "Yetki geniş, sorun yok",
        "Canlıya alınabilir",
        "Yetki daraltılmadan birleştirilmez; gerekçe ve en az yetki istenir",
        "Yetkiyi gizleyip geçirmek",
      ],
      correctIndex: 2,
    },
    {
      id: "sw-case-pii",
      kind: "case",
      skillId: "case",
      skillLabel: "Vaka",
      prompt:
        "Vaka: Demo için gerçek müşteri faturalarını modelin sohbetine yüklemek isteniyor. Ne yaparsın?",
      choices: [
        "Faturaları olduğu gibi yüklerim",
        "Yalnızca ilk sayfayı yüklerim",
        "Dosyayı herkese açık bağlantıyla paylaşırım",
        "Kişisel veriyi çıkarır veya sentetik örnek kullanır; gerçek faturayı sohbete vermem",
      ],
      correctIndex: 3,
    },
  ],
};

export function yetkinCvBankForVertical(
  id: string,
): readonly YetkinCvBankQuestion[] | null {
  if (
    id === "ecommerce" ||
    id === "grant" ||
    id === "marketing" ||
    id === "office" ||
    id === "software"
  ) {
    return YETKINCV_QUESTION_BANK[id];
  }
  return null;
}
