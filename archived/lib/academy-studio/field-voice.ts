/**
 * Saha dili — hedef kitle pusulası ve Koray ara soruları.
 * Ameliyathane kalıbı yok. Pusula ve ara sorular bildiri diliyle açılmaz;
 * empati / saha kafa karışıklığıyla paslaşır.
 */

export const ACADEMY_COMPASS_ANCHOR = "Bu dersin pusulası masadaki iş." as const;

export const ACADEMY_FIELD_TERM = {
  SPEC_BREACH: "yazılı tarife aykırılık",
} as const;

export type AcademyLessonCompass = {
  job: string;
};

const COMPASS_JOBS: Record<string, string> = {
  "rail-temel-1": "Bu derste kuruşu tek satıra yazmayı konuşuyoruz.",
  "rail-temel-2": "Bu derste fiyatın kısa süre neden donduğunu konuşuyoruz.",
  "rail-temel-3": "Bu derste ödeme ile belge kapısını ayırmayı konuşuyoruz.",
  "ray-sinyal-1": "Bu derste sepet ekranının tek bir net yanıt vermesini — SSOT phase — konuşuyoruz.",
  "ray-sinyal-2": "Bu derste turnike gibi Zod şeması olmadan yeşil 200’ün neden yetmediğini konuşuyoruz.",
  "ray-sinyal-3": "Bu derste React ile Express’in aynı sözü konuşmasını ve dürüst 4xx/5xx’i konuşuyoruz.",
  "yz-icerik-1": "Bu derste çelişen müşteri isteğini masada netleştirmeyi konuşuyoruz.",
  "yz-icerik-2": "Bu derste hak satırı boşken üretimi bekletmeyi konuşuyoruz.",
  "yz-icerik-3": "Bu derste tam Türkçe tarifi yazmayı konuşuyoruz.",
  "yz-icerik-4": "Bu derste ölçülemeyen isteği tur saymamayı konuşuyoruz.",
  "yz-icerik-5": "Bu derste dosya adı ve özetle teslimi konuşuyoruz.",
  "ileri-prompt-1": "Bu derste yazılı iş tarifini konuşuyoruz.",
  "ileri-prompt-2": "Bu derste sırın tarife girmemesini konuşuyoruz.",
  "ileri-prompt-3": "Bu derste araç yoksa dürüstçe durmayı konuşuyoruz.",
  "ileri-prompt-4": "Bu derste kenar durum ve regresyonu konuşuyoruz.",
  "ileri-prompt-5": "Bu derste tarif farkını sessizce geçirmemeyi konuşuyoruz.",
  "bim-iso-1": "Bu derste belirsiz işi teklif saymamayı konuşuyoruz.",
  "bim-iso-2": "Bu derste WhatsApp ekini teslim saymamayı konuşuyoruz.",
  "bim-iso-3": "Bu derste chat’i pazaryeri sicili saymamayı konuşuyoruz.",
  "bim-iso-4": "Bu derste sessiz kapsam şişmesini fark etmeyi konuşuyoruz.",
  "siber-kvkk-1": "Bu derste kanıtsız «güvenliyiz» iddiasını konuşuyoruz.",
  "siber-kvkk-2": "Bu derste hukuki sebep olmadan veri işlememeyi konuşuyoruz.",
  "siber-kvkk-3": "Bu derste politika metnini kontrol saymamayı konuşuyoruz.",
  "siber-kvkk-4": "Bu derste ihlali sessiz kapatmamayı konuşuyoruz.",
  "python-bi-1": "Bu derste tip netleşmeden ortalama basmamayı konuşuyoruz.",
  "python-bi-2": "Bu derste belirsiz paydayla yüzde yayımlamamayı konuşuyoruz.",
  "python-bi-3": "Bu derste tanımsız metriği masadan kaldırmayı konuşuyoruz.",
  "python-bi-4": "Bu derste süs grafiği ile kanıtı ayırmayı konuşuyoruz.",
  "python-bi-5": "Bu derste ekran görüntüsünü kanıt saymamayı konuşuyoruz.",
  "python-temel-1": "Bu derste print ile ilk programı konuşuyoruz.",
  "python-temel-2": "Bu derste değişken ve tipi konuşuyoruz.",
  "python-temel-3": "Bu derste if/else kararını konuşuyoruz.",
  "python-temel-4": "Bu derste for/while döngüsünü konuşuyoruz.",
  "python-temel-5": "Bu derste fonksiyon ve return’ü konuşuyoruz.",
  "python-temel-6": "Bu derste etkileşimli mini projeyi konuşuyoruz.",
  "python-orta-1": "Bu derste Pandas tablo sözleşmesini konuşuyoruz.",
  "python-orta-2": "Bu derste seç-süz-türet adımlarını konuşuyoruz.",
  "python-orta-3": "Bu derste grupla-birleştir disiplinini konuşuyoruz.",
  "python-orta-4": "Bu derste parametreli Yapılandırılmış Sorgu Dili köprüsünü konuşuyoruz.",
  "python-orta-5": "Bu derste dosya otomasyonunu konuşuyoruz.",
  "python-orta-6": "Bu derste veri temizliğini konuşuyoruz.",
  "python-orta-7": "Bu derste metrik ve kanıt grafiğini konuşuyoruz.",
  "python-orta-8": "Bu derste yenilenebilir veri boru hattını konuşuyoruz.",
  "python-ileri-1": "Bu derste FastAPI rotasını konuşuyoruz.",
  "python-ileri-2": "Bu derste Pydantic doğrulamayı konuşuyoruz.",
  "python-ileri-3": "Bu derste katmanlı servis iskeletini konuşuyoruz.",
  "python-ileri-4": "Bu derste eşzamansız giriş-çıkışı konuşuyoruz.",
  "python-ileri-5": "Bu derste jeton ve sır yönetimini konuşuyoruz.",
  "python-ileri-6": "Bu derste dürüst Hipermetin Aktarım Protokolü hatalarını konuşuyoruz.",
  "python-ileri-7": "Bu derste TestClient sözleşmesini konuşuyoruz.",
  "python-ileri-8": "Bu derste Docker paketlemeyi konuşuyoruz.",
  "python-ileri-9": "Bu derste yapısal gözlemi konuşuyoruz.",
  "python-ileri-10": "Bu derste kapanış Uygulama Programlama Arayüzü paketini konuşuyoruz.",
  "ai-temel-1": "Bu derste Büyük Dil Modeli, token ve bağlam penceresini konuşuyoruz.",
  "ai-temel-2": "Bu derste üretim tarifi katmanlarını konuşuyoruz.",
  "ai-temel-3": "Bu derste JavaScript Nesne Gösterimi modu ve yapılandırılmış çıktıyı konuşuyoruz.",
  "ai-temel-4": "Bu derste few-shot ve ölçülebilir kabulü konuşuyoruz.",
  "ai-temel-5": "Bu derste sır, kişisel tanımlayıcı bilgi ve hata anında kapalı üretimi konuşuyoruz.",
  "ai-temel-6": "Bu derste etkileşimli üretim tarifi betiğini konuşuyoruz.",
  "ai-orta-1": "Bu derste Artırılmış Geri Çapraz Sorgulama’da arama ile üretimi ayırmayı konuşuyoruz.",
  "ai-orta-2": "Bu derste parçalama ve örtüşmeyi konuşuyoruz.",
  "ai-orta-3": "Bu derste gömme vektörleri ve benzerliği konuşuyoruz.",
  "ai-orta-4": "Bu derste ChromaDB koleksiyonunu konuşuyoruz.",
  "ai-orta-5": "Bu derste getirici kalitesini konuşuyoruz.",
  "ai-orta-6": "Bu derste Artırılmış Geri Çapraz Sorgulama hattı adımlarını konuşuyoruz.",
  "ai-orta-7": "Bu derste kaynaklı cevap disiplinini konuşuyoruz.",
  "ai-orta-8": "Bu derste taşınabilir belge biçimi bilgi asistanını konuşuyoruz.",
  "ai-ileri-1": "Bu derste araç çağrısı şemasını konuşuyoruz.",
  "ai-ileri-2": "Bu derste ajan düşün-araç-gözlem döngüsünü konuşuyoruz.",
  "ai-ileri-3": "Bu derste durum ve belleği konuşuyoruz.",
  "ai-ileri-4": "Bu derste LangGraph durum makinesini konuşuyoruz.",
  "ai-ileri-5": "Bu derste CrewAI rol ayrımını konuşuyoruz.",
  "ai-ileri-6": "Bu derste çoklu ajan el sıkışmayı konuşuyoruz.",
  "ai-ileri-7": "Bu derste insan onay kapısını konuşuyoruz.",
  "ai-ileri-8": "Bu derste ajan değerlendirme barajını konuşuyoruz.",
  "ai-ileri-9": "Bu derste iz, maliyet ve gecikmeyi konuşuyoruz.",
  "ai-ileri-10": "Bu derste çoklu ajan teslim paketini konuşuyoruz.",
  "fullstack-temel-1": "Bu derste istemci-sunucu ve Hipermetin Aktarım Protokolü sözleşmesini konuşuyoruz.",
  "fullstack-temel-2": "Bu derste JavaScript değişken, tip ve fonksiyonu konuşuyoruz.",
  "fullstack-temel-3": "Bu derste TypeScript tip sözleşmesi ve derleme kapısını konuşuyoruz.",
  "fullstack-temel-4": "Bu derste Belge Nesne Modeli, olay ve dürüst kullanıcı arayüzü geri bildirimini konuşuyoruz.",
  "fullstack-temel-5": "Bu derste fetch ile Uygulama Programlama Arayüzü çağrısı ve hata yansıtmayı konuşuyoruz.",
  "fullstack-temel-6": "Bu derste tip güvenli istemci laboratuvarını konuşuyoruz.",
  "fullstack-orta-1": "Bu derste React bileşen ve props sözleşmesini konuşuyoruz.",
  "fullstack-orta-2": "Bu derste useState tuzakları ve çelişen bayrakları konuşuyoruz.",
  "fullstack-orta-3": "Bu derste useReducer ile Tek Gerçek Kaynak faz makinesini konuşuyoruz.",
  "fullstack-orta-4": "Bu derste liste, anahtar ve kontrollü formu konuşuyoruz.",
  "fullstack-orta-5": "Bu derste Context sınırını konuşuyoruz.",
  "fullstack-orta-6": "Bu derste useEffect, temizlik ve yarış koşulunu konuşuyoruz.",
  "fullstack-orta-7": "Bu derste yönlendirme ve sayfa sözleşmesini konuşuyoruz.",
  "fullstack-orta-8": "Bu derste alışveriş sepeti Tek Gerçek Kaynak arayüzünü konuşuyoruz.",
  "fullstack-ileri-1": "Bu derste Express iskelet ve ara katman sırasını konuşuyoruz.",
  "fullstack-ileri-2": "Bu derste Zod gövde doğrulama ve hata anında emniyet dört yüzü konuşuyoruz.",
  "fullstack-ileri-3": "Bu derste PostgreSQL şema ve parametreli Yapılandırılmış Sorgu Dili’ni konuşuyoruz.",
  "fullstack-ileri-4": "Bu derste repository katmanı ve sorgu sızıntısı yasağını konuşuyoruz.",
  "fullstack-ileri-5": "Bu derste Temsili Durum Transferi kaynak tasarımı ve oluştur-oku-güncelle-sil sözleşmesini konuşuyoruz.",
  "fullstack-ileri-6": "Bu derste taşıyıcı jeton ve JavaScript Nesne Gösterimi Web Jetonu kimlik kapısını konuşuyoruz.",
  "fullstack-ileri-7": "Bu derste dürüst Hipermetin Aktarım Protokolü hata gövdelerini konuşuyoruz.",
  "fullstack-ileri-8": "Bu derste işlem birimi ve tutarlılığı konuşuyoruz.",
  "fullstack-ileri-9": "Bu derste TestClient ve göç disiplinini konuşuyoruz.",
  "fullstack-ileri-10": "Bu derste üretime hazır sepet Temsili Durum Transferi arayüzünü konuşuyoruz.",
  "devops-temel-1": "Bu derste hizmet katmanları ve paylaşılan sorumluluğu konuşuyoruz.",
  "devops-temel-2": "Bu derste Linux işletim sistemi kabuk, dosya sistemi ve izinleri konuşuyoruz.",
  "devops-temel-3": "Bu derste kullanıcı, süreç ve sistem yöneticisi servisini konuşuyoruz.",
  "devops-temel-4": "Bu derste Alan Adı Sistemi, port ve güvenlik duvarı temellerini konuşuyoruz.",
  "devops-temel-5": "Bu derste Güvenli Kabuk Protokolü, anahtar ve güvenli erişimi konuşuyoruz.",
  "devops-temel-6": "Bu derste Linux envanter ve bulut hesap haritasını konuşuyoruz.",
  "devops-orta-1": "Bu derste konteyner ile sanal makine farkını konuşuyoruz.",
  "devops-orta-2": "Bu derste Docker tarif dosyası, kullanıcı ve sır yasağını konuşuyoruz.",
  "devops-orta-3": "Bu derste Compose çok servis orkestrasyonunu konuşuyoruz.",
  "devops-orta-4": "Bu derste imaj deposu, imza ve yazılım malzeme listesi tanımayı konuşuyoruz.",
  "devops-orta-5": "Bu derste sürekli entegrasyon hata anında kapalı kapısını konuşuyoruz.",
  "devops-orta-6": "Bu derste sürekli teslimat, onay, iz ve geri almayı konuşuyoruz.",
  "devops-orta-7": "Bu derste sağlık kontrolü ve gözlemi konuşuyoruz.",
  "devops-orta-8": "Bu derste konteynerize boru laboratuvarını konuşuyoruz.",
  "devops-ileri-1": "Bu derste tehdit modeli ve güven sınırını konuşuyoruz.",
  "devops-ileri-2": "Bu derste sır kasası ve döndürme disiplinini konuşuyoruz.",
  "devops-ileri-3": "Bu derste statik-dinamik tarama ve malzeme listesi kapısını konuşuyoruz.",
  "devops-ileri-4": "Bu derste Kimlik ve Erişim Yönetimi en az ayrıcalığı konuşuyoruz.",
  "devops-ileri-5": "Bu derste ağ dilimleme ve varsayılan reddi konuşuyoruz.",
  "devops-ileri-6": "Bu derste bilgi güvenliği yönetim sistemi kontrol ve kanıtını konuşuyoruz.",
  "devops-ileri-7": "Bu derste Kişisel Verilerin Korunması Kanunu envanter ve ihlal kaydını konuşuyoruz.",
  "devops-ileri-8": "Bu derste olay müdahalesi oyun kitabını konuşuyoruz.",
  "devops-ileri-9": "Bu derste politika kodu ve altyapı kodu güvenliğini konuşuyoruz.",
  "devops-ileri-10": "Bu derste Geliştirme-Güvenlik-İşletme uyumlu mimari laboratuvarını konuşuyoruz.",
  "flutter-temel-1": "Bu derste Dart tip, boş değer güvenliği ve dürüst derlemeyi konuşuyoruz.",
  "flutter-temel-2": "Bu derste fonksiyon, sınıf ve değişmezliği konuşuyoruz.",
  "flutter-temel-3": "Bu derste bileşen, öğe ve boyama nesnesi mimarisini konuşuyoruz.",
  "flutter-temel-4": "Bu derste durumsuz ve durumlu bileşen ayrımını konuşuyoruz.",
  "flutter-temel-5": "Bu derste satır, sütun, genişletilmiş alan ve kısıtları konuşuyoruz.",
  "flutter-temel-6": "Bu derste ilk Flutter sayaç laboratuvarını konuşuyoruz.",
  "flutter-orta-1": "Bu derste setState sınırları ve durumu yukarı taşımayı konuşuyoruz.",
  "flutter-orta-2": "Bu derste miras bileşen ve sağlayıcı bağımlılığını konuşuyoruz.",
  "flutter-orta-3": "Bu derste Riverpod veya Bloc ile Tek Gerçek Kaynak durum makinesini konuşuyoruz.",
  "flutter-orta-4": "Bu derste Hipermetin Aktarım Protokolü istemcisi, Veri Transfer Nesnesi ve hata modelini konuşuyoruz.",
  "flutter-orta-5": "Bu derste Temsili Durum Transferi oluştur-oku-güncelle-sil ve yükleme-hata-boş kullanıcı arayüzünü konuşuyoruz.",
  "flutter-orta-6": "Bu derste paylaşılan tercihler ve güvenli yerel anahtarları konuşuyoruz.",
  "flutter-orta-7": "Bu derste yerel veritabanı ve şema göçünü konuşuyoruz.",
  "flutter-orta-8": "Bu derste Temsili Durum Transferi ve yerel önbellek alışkanlık takip laboratuvarını konuşuyoruz.",
  "flutter-ileri-1": "Bu derste yöntem kanalı yerel platform köprüsünü konuşuyoruz.",
  "flutter-ileri-2": "Bu derste eklenti yazımı ve paket sınırını konuşuyoruz.",
  "flutter-ileri-3": "Bu derste ürün çeşidi, ortam ayrımı ve sırları konuşuyoruz.",
  "flutter-ileri-4": "Bu derste sürekli entegrasyon analiz, test ve yapı paketi borusunu konuşuyoruz.",
  "flutter-ileri-5": "Bu derste Android anahtar deposu ve Android Uygulama Paketini konuşuyoruz.",
  "flutter-ileri-6": "Bu derste iOS sertifika, profil ve iOS uygulama paketini konuşuyoruz.",
  "flutter-ileri-7": "Bu derste Google Play Konsolu liste ve incelemeyi konuşuyoruz.",
  "flutter-ileri-8": "Bu derste Apple Uygulama Mağazası Bağlantısı üst veri ve kılavuzu konuşuyoruz.",
  "flutter-ileri-9": "Bu derste çöküş raporu, gözlem ve özellik bayrağını konuşuyoruz.",
  "flutter-ileri-10": "Bu derste sürekli entegrasyon, sürekli teslimat ve mağaza yayın kapısı laboratuvarını konuşuyoruz.",
  "ds-temel-1": "Bu derste veri sözleşmesi ve soru tanımını konuşuyoruz.",
  "ds-temel-2": "Bu derste NumPy dizilerini konuşuyoruz.",
  "ds-temel-3": "Bu derste Pandas DataFrame’i konuşuyoruz.",
  "ds-temel-4": "Bu derste veri temizliğini konuşuyoruz.",
  "ds-temel-5": "Bu derste keşifsel veri analizini (EDA) konuşuyoruz.",
  "ds-temel-6": "Bu derste EDA laboratuvarını konuşuyoruz.",
  "ds-orta-1": "Bu derste supervised ve unsupervised ayrımını konuşuyoruz.",
  "ds-orta-2": "Bu derste train/test split ve leakage’ı konuşuyoruz.",
  "ds-orta-3": "Bu derste Pipeline ve ölçeklemeyi konuşuyoruz.",
  "ds-orta-4": "Bu derste doğrusal ve lojistik modelleri konuşuyoruz.",
  "ds-orta-5": "Bu derste ağaçlar ve boosting’i konuşuyoruz.",
  "ds-orta-6": "Bu derste değerlendirme metriklerini konuşuyoruz.",
  "ds-orta-7": "Bu derste CV ve hiperparametre aramasını konuşuyoruz.",
  "ds-orta-8": "Bu derste sklearn capstone laboratuvarını konuşuyoruz.",
  "ds-ileri-1": "Bu derste tensör ve autograd’ı konuşuyoruz.",
  "ds-ileri-2": "Bu derste nn.Module’ü konuşuyoruz.",
  "ds-ileri-3": "Bu derste DataLoader’ı konuşuyoruz.",
  "ds-ileri-4": "Bu derste MLP eğitim döngüsünü konuşuyoruz.",
  "ds-ileri-5": "Bu derste CNN’i konuşuyoruz.",
  "ds-ileri-6": "Bu derste transfer learning’i konuşuyoruz.",
  "ds-ileri-7": "Bu derste checkpoint ve aşırı öğrenmeyi konuşuyoruz.",
  "ds-ileri-8": "Bu derste değerlendirme ve drift’i konuşuyoruz.",
  "ds-ileri-9": "Bu derste ONNX ve model servisini konuşuyoruz.",
  "ds-ileri-10": "Bu derste derin öğrenme deploy laboratuvarını konuşuyoruz.",
  "sec-temel-1": "Bu derste etik sınır ve gizlilik-bütünlük-erişilebilirlik üçlüsünü konuşuyoruz.",
  "sec-temel-2": "Bu derste İletim Kontrol Protokolü / İnternet Protokolü, port ve protokol okuryazarlığını konuşuyoruz.",
  "sec-temel-3": "Bu derste Linux kullanıcı, izin ve süreç güvenliğini konuşuyoruz.",
  "sec-temel-4": "Bu derste yetkili pasif keşif ve açık kaynak istihbaratı disiplinini konuşuyoruz.",
  "sec-temel-5": "Bu derste yalnız laboratuvarda aktif keşif ve port envanterini konuşuyoruz.",
  "sec-temel-6": "Bu derste laboratuvar ağ haritası ve sertleştirme kontrol listesini konuşuyoruz.",
  "sec-orta-1": "Bu derste sızma testi metodolojisi ve rapor disiplinini konuşuyoruz.",
  "sec-orta-2": "Bu derste Açık Web Uygulaması Güvenlik Projesi En Kritik On haritasını konuşuyoruz.",
  "sec-orta-3": "Bu derste Yapılandırılmış Sorgu Dili enjeksiyonu tespitini ve parametreli sorguyu konuşuyoruz.",
  "sec-orta-4": "Bu derste çıktı kodlama ve İçerik Güvenliği Politikası fikrini konuşuyoruz.",
  "sec-orta-5": "Bu derste kimlik doğrulama ve oturum sertleştirmesini konuşuyoruz.",
  "sec-orta-6": "Bu derste erişim kontrolü ve güvensiz doğrudan nesne referansını konuşuyoruz.",
  "sec-orta-7": "Bu derste güvenlik başlıkları ve Taşıma Katmanı Güvenliği kontrol listesini konuşuyoruz.",
  "sec-orta-8": "Bu derste yetkili web değerlendirme raporu laboratuvarını konuşuyoruz.",
  "sec-ileri-1": "Bu derste bellek düzeni ve uygulama ikili arayüzü kavramını konuşuyoruz.",
  "sec-ileri-2": "Bu derste bellek bozulması sınıflarını tespit odaklı konuşuyoruz.",
  "sec-ileri-3": "Bu derste tersine mühendislikte durağan analiz temellerini konuşuyoruz.",
  "sec-ileri-4": "Bu derste dinamik analiz ve güvenli kum havuzunu konuşuyoruz.",
  "sec-ileri-5": "Bu derste bölütleme ve yanal hareket kavramını konuşuyoruz.",
  "sec-ileri-6": "Bu derste yetki yükseltme sınıfları ve tespiti konuşuyoruz.",
  "sec-ileri-7": "Bu derste günce, ele geçirme göstergesi ve tespiti konuşuyoruz.",
  "sec-ileri-8": "Bu derste mor takım ve senaryo yazımını konuşuyoruz.",
  "sec-ileri-9": "Bu derste sömürü disiplinini sınıf ve yama önceliğiyle konuşuyoruz.",
  "sec-ileri-10": "Bu derste uçtan uca laboratuvar simülasyon raporu laboratuvarını konuşuyoruz.",
  "db-temel-1": "Bu derste ilişkisel model, tablo, birincil ve yabancı anahtarı konuşuyoruz.",
  "db-temel-2": "Bu derste Varlık İlişki Modeli ve normalizasyonu konuşuyoruz.",
  "db-temel-3": "Bu derste Veri Tanımlama Dili ve kısıtları konuşuyoruz.",
  "db-temel-4": "Bu derste Veri İşleme Dili, birleştirme ve gruplamayı konuşuyoruz.",
  "db-temel-5": "Bu derste işlem birimi, Atomiklik-Tutarlılık-İzolasyon-Dayanıklılık ve izolasyonu konuşuyoruz.",
  "db-temel-6": "Bu derste e-ticaret şema ve sorgu laboratuvarını konuşuyoruz.",
  "db-orta-1": "Bu derste PostgreSQL mimarisi ve sorgu planı dökümünü konuşuyoruz.",
  "db-orta-2": "Bu derste B-ağacı dizin ve seçiciliği konuşuyoruz.",
  "db-orta-3": "Bu derste kısmi ve ifade dizinini konuşuyoruz.",
  "db-orta-4": "Bu derste planlayıcı, birleştirme ve istatistiği konuşuyoruz.",
  "db-orta-5": "Bu derste vakumlama, çözümleme ve şişkinliği konuşuyoruz.",
  "db-orta-6": "Bu derste bağlantı havuzu ve hazırlanmış deyimi konuşuyoruz.",
  "db-orta-7": "Bu derste Çok Sürümlü Eşzamanlılık Denetimi, kilit ve kilitlenmeyi konuşuyoruz.",
  "db-orta-8": "Bu derste yavaş sorgu ayarı laboratuvarını konuşuyoruz.",
  "db-ileri-1": "Bu derste çok dilli kalıcılık ve Tutarlılık-Erişilebilirlik-Bölünme Toleransı’nı konuşuyoruz.",
  "db-ileri-2": "Bu derste Redis veri yapıları ve kenar önbelleğini konuşuyoruz.",
  "db-ileri-3": "Bu derste Redis akışları ve yayın-abone ayrımını konuşuyoruz.",
  "db-ileri-4": "Bu derste MongoDB belge modeli ve toplama borusunu konuşuyoruz.",
  "db-ileri-5": "Bu derste MongoDB modelleme ve tutarlılığı konuşuyoruz.",
  "db-ileri-6": "Bu derste Apache Kafka konu, bölüm ve tüketici grubunu konuşuyoruz.",
  "db-ileri-7": "Bu derste olay güdümlü tasarım ve çıkış kutusunu konuşuyoruz.",
  "db-ileri-8": "Bu derste akış işleme ve eşgüçlülüğü konuşuyoruz.",
  "db-ileri-9": "Bu derste gecikme, ofset ve tam-bir-kez uyarısını konuşuyoruz.",
  "db-ileri-10": "Bu derste Apache Kafka → Redis/Mongo boru laboratuvarını konuşuyoruz.",
  "arch-temel-1": "Bu derste OOP dört sütunu konuşuyoruz.",
  "arch-temel-2": "Bu derste SRP ve OCP’yi konuşuyoruz.",
  "arch-temel-3": "Bu derste LSP ve ISP’yi konuşuyoruz.",
  "arch-temel-4": "Bu derste DIP ve DI temelini konuşuyoruz.",
  "arch-temel-5": "Bu derste Clean Code ve kod kokularını konuşuyoruz.",
  "arch-temel-6": "Bu derste God class → SOLID refactor laboratuvarını konuşuyoruz.",
  "arch-orta-1": "Bu derste tasarım kalıpları haritasını konuşuyoruz.",
  "arch-orta-2": "Bu derste Factory, Abstract Factory ve Builder’ı konuşuyoruz.",
  "arch-orta-3": "Bu derste Singleton tuzağı ve DI tercihini konuşuyoruz.",
  "arch-orta-4": "Bu derste Adapter, Facade ve Decorator’ı konuşuyoruz.",
  "arch-orta-5": "Bu derste Strategy, Observer ve Command’ı konuşuyoruz.",
  "arch-orta-6": "Bu derste State, Template Method ve Chain’i konuşuyoruz.",
  "arch-orta-7": "Bu derste katmanlı ve hexagonal ports & adapters’ı konuşuyoruz.",
  "arch-orta-8": "Bu derste sipariş/sepet pattern refactor laboratuvarını konuşuyoruz.",
  "arch-ileri-1": "Bu derste monolith vs microservices bölme kriterini konuşuyoruz.",
  "arch-ileri-2": "Bu derste ubiquitous language ve bounded context’i konuşuyoruz.",
  "arch-ileri-3": "Bu derste aggregate, entity ve value object’i konuşuyoruz.",
  "arch-ileri-4": "Bu derste domain events ve eventual consistency’yi konuşuyoruz.",
  "arch-ileri-5": "Bu derste CQRS okuma/yazma ayrımını konuşuyoruz.",
  "arch-ileri-6": "Bu derste transactional outbox ve idempotency’yi konuşuyoruz.",
  "arch-ileri-7": "Bu derste saga orchestration vs choreography’yi konuşuyoruz.",
  "arch-ileri-8": "Bu derste retry, circuit breaker ve bulkhead’i konuşuyoruz.",
  "arch-ileri-9": "Bu derste sözleşme testi, versiyonlama ve observability’yi konuşuyoruz.",
  "arch-ileri-10": "Bu derste event-driven mikroservis capstone laboratuvarını konuşuyoruz.",
  "pm-temel-1": "Bu derste ürün yönetimi rollerini konuşuyoruz.",
  "pm-temel-2": "Bu derste problem keşfi ve problem ifadesini konuşuyoruz.",
  "pm-temel-3": "Bu derste gereksinim toplama ve paydaş görüşmesini konuşuyoruz.",
  "pm-temel-4": "Bu derste kullanıcı hikayesi yazımını konuşuyoruz.",
  "pm-temel-5": "Bu derste kabul ölçütleri, INVEST ilkesi ve önceliği konuşuyoruz.",
  "pm-temel-6": "Bu derste briften kullanıcı hikayesi biriktirme listesi laboratuvarını konuşuyoruz.",
  "pm-orta-1": "Bu derste çevik manifesto ve çerçeve seçimini konuşuyoruz.",
  "pm-orta-2": "Bu derste Scrum omurgasını — roller, artefaktlar ve olayları — konuşuyoruz.",
  "pm-orta-3": "Bu derste sprint ritmini — planlama, günlük, inceleme, retrospektif — konuşuyoruz.",
  "pm-orta-4": "Bu derste hazır tanımı ve bitti tanımını konuşuyoruz.",
  "pm-orta-5": "Bu derste Kanban akışını — devam eden iş limiti ve süreyi — konuşuyoruz.",
  "pm-orta-6": "Bu derste JIRA iş takip panosunu — tema, hikâye, görevi — konuşuyoruz.",
  "pm-orta-7": "Bu derste JIRA dürüstlüğünü — filtre, sprint panosu ve kalan iş grafiğini — konuşuyoruz.",
  "pm-orta-8": "Bu derste Scrum, Kanban ve JIRA sprint laboratuvarını konuşuyoruz.",
  "pm-ileri-1": "Bu derste ürün analitiğini — huni ve geri dönüşü — konuşuyoruz.",
  "pm-ileri-2": "Bu derste süs metrik ile eyleme götüren metrik ayrımını konuşuyoruz.",
  "pm-ileri-3": "Bu derste hedefler ve anahtar sonuçlar yazımını konuşuyoruz.",
  "pm-ileri-4": "Bu derste Temel Performans Göstergeleri ağacı ve kuzey yıldızını konuşuyoruz.",
  "pm-ileri-5": "Bu derste hipotez yazımı ve deney tasarımını konuşuyoruz.",
  "pm-ileri-6": "Bu derste ikili karşılaştırma testini — rastgele atama, örneklem, anlamlılığı — konuşuyoruz.",
  "pm-ileri-7": "Bu derste koruma rayı metrikleri ve öldürme anahtarını konuşuyoruz.",
  "pm-ileri-8": "Bu derste kohort, huni ve pano okumayı konuşuyoruz.",
  "pm-ileri-9": "Bu derste veriye dayalı karar kaydını konuşuyoruz.",
  "pm-ileri-10": "Bu derste hedefler, ikili karşılaştırma ve öldürme anahtarı laboratuvarını konuşuyoruz.",
  "ux-temel-1": "Bu derste Kullanıcı Deneyimi ile Kullanıcı Arayüzü ayrımını konuşuyoruz.",
  "ux-temel-2": "Bu derste Kullanıcı Deneyimi araştırmasını konuşuyoruz.",
  "ux-temel-3": "Bu derste persona ve kullanıcı yolculuğunu konuşuyoruz.",
  "ux-temel-4": "Bu derste bilgi mimarisini ve kart sıralamayı konuşuyoruz.",
  "ux-temel-5": "Bu derste düşük sadakat tel çerçeveyi konuşuyoruz.",
  "ux-temel-6": "Bu derste Figma temellerini — çerçeve, otomatik yerleşim, bileşen — konuşuyoruz.",
  "ux-temel-7": "Bu derste araştırma → bilgi mimarisi → tel çerçeve Figma laboratuvarını konuşuyoruz.",
  "ux-orta-1": "Bu derste görsel hiyerarşi ve sekiz piksel ızgarayı konuşuyoruz.",
  "ux-orta-2": "Bu derste tipografi ve renk sistemini konuşuyoruz.",
  "ux-orta-3": "Bu derste Kullanıcı Arayüzü bileşen anatomisini konuşuyoruz.",
  "ux-orta-4": "Bu derste tasarım jetonunu konuşuyoruz.",
  "ux-orta-5": "Bu derste bileşen kütüphanesi ve varyantları konuşuyoruz.",
  "ux-orta-6": "Bu derste prototiplemeyi konuşuyoruz.",
  "ux-orta-7": "Bu derste Web İçeriği Erişilebilirlik Kılavuzu’nu tasarımda konuşuyoruz.",
  "ux-orta-8": "Bu derste Tasarım Sistemi laboratuvarını konuşuyoruz.",
  "ux-ileri-1": "Bu derste Figma’dan koda el teslimini konuşuyoruz.",
  "ux-ileri-2": "Bu derste Basamaklı Stil Sayfaları değişkenlerini konuşuyoruz.",
  "ux-ileri-3": "Bu derste React bileşen sözleşmesini konuşuyoruz.",
  "ux-ileri-4": "Bu derste Tailwind jeton eşlemesini konuşuyoruz.",
  "ux-ileri-5": "Bu derste duyarlı kırılımları konuşuyoruz.",
  "ux-ileri-6": "Bu derste kodda erişilebilirliği konuşuyoruz.",
  "ux-ileri-7": "Bu derste kullanılabilirlik testi planını konuşuyoruz.",
  "ux-ileri-8": "Bu derste görev metrikleri ve Sistem Kullanılabilirlik Ölçeği’ni konuşuyoruz.",
  "ux-ileri-9": "Bu derste tasarım kalite güvencesini konuşuyoruz.",
  "ux-ileri-10": "Bu derste el teslimi + erişilebilir kod + kullanılabilirlik kapanış laboratuvarını konuşuyoruz.",
  "w3-temel-1": "Bu derste blokzincir, dağıtık defter ve özet zincirini konuşuyoruz.",
  "w3-temel-2": "Bu derste özet fonksiyonu, dijital imza ve Merkle ağacını konuşuyoruz.",
  "w3-temel-3": "Bu derste cüzdan, gas, işlem sırası ve Ethereum Sanal Makinesi’ni konuşuyoruz.",
  "w3-temel-4": "Bu derste Solidity sözleşme iskeletini konuşuyoruz.",
  "w3-temel-5": "Bu derste tipler, saklama / bellek ve eşlemeyi konuşuyoruz.",
  "w3-temel-6": "Bu derste fonksiyon görünürlüğü, view / pure ve olayı konuşuyoruz.",
  "w3-temel-7": "Bu derste SimpleStorage Solidity laboratuvarını konuşuyoruz.",
  "w3-orta-1": "Bu derste kalıtım, değiştirici ve kütüphaneyi konuşuyoruz.",
  "w3-orta-2": "Bu derste Ethereum Yorum Talebi yirmi jeton standardını konuşuyoruz.",
  "w3-orta-3": "Bu derste Ethereum Yorum Talebi yedi yüz yirmi bir değiştirilemez jeton standardını konuşuyoruz.",
  "w3-orta-4": "Bu derste akıllı sözleşme güvenlik modelini konuşuyoruz.",
  "w3-orta-5": "Bu derste yeniden giriş ve Kontrol-Etki-Etkileşim’i konuşuyoruz.",
  "w3-orta-6": "Bu derste erişim denetimi, taşma ve fiyat kahini risklerini konuşuyoruz.",
  "w3-orta-7": "Bu derste Foundry / Hardhat test disiplinini konuşuyoruz.",
  "w3-orta-8": "Bu derste güvenli Ethereum Yorum Talebi yirmi ve güvenlik kontrol listesi laboratuvarını konuşuyoruz.",
  "w3-ileri-1": "Bu derste Dağıtık Uygulama mimarisi ve uygulama ikili arayüzü sınırını konuşuyoruz.",
  "w3-ileri-2": "Bu derste Ethers.js sağlayıcı, imzacı ve Contract’ı konuşuyoruz.",
  "w3-ileri-3": "Bu derste Web3.js karşılaştırması ve uygulama ikili arayüzü disiplinini konuşuyoruz.",
  "w3-ileri-4": "Bu derste olay dinleme ve indekslemeyi konuşuyoruz.",
  "w3-ileri-5": "Bu derste MetaMask / cüzdan bağlantısı ve izin kullanıcı deneyimini konuşuyoruz.",
  "w3-ileri-6": "Bu derste Otomatik Piyasa Yapıcı sabit çarpım ve likidite havuzunu konuşuyoruz.",
  "w3-ileri-7": "Bu derste borç verme, teminat ve tasfiye modelini konuşuyoruz.",
  "w3-ileri-8": "Bu derste fiyat kahini ve fiyat beslemesi mimarisini konuşuyoruz.",
  "w3-ileri-9": "Bu derste hata anında kapalı Dağıtık Uygulama hata yüzeyini konuşuyoruz.",
  "w3-ileri-10": "Bu derste mini Dağıtık Uygulama ve Merkeziyetsiz Finans iskelet kapanış laboratuvarını konuşuyoruz.",
  "ex-temel-1": "Bu derste Excel çalışma kitabı, sayfa ve adlandırma disiplinini konuşuyoruz.",
  "ex-temel-2": "Bu derste SUM, IF ve göreli hücre referansını konuşuyoruz.",
  "ex-temel-3": "Bu derste mutlak referans ($) ve Excel Tablo yapısını konuşuyoruz.",
  "ex-temel-4": "Bu derste Özet Tablo, gruplama ve dilimleyiciyi konuşuyoruz.",
  "ex-temel-5": "Bu derste grafik seçimi, dürüst eksen ve birim etiketini konuşuyoruz.",
  "ex-temel-6": "Bu derste veri temizleme, Özet Tablo ve grafik laboratuvarını konuşuyoruz.",
  "ex-orta-1": "Bu derste Power Query alma, birleştirme ve Veri Dönüştürme ve Yükleme İşlemini konuşuyoruz.",
  "ex-orta-2": "Bu derste yıldız şema, olay tablosu ve boyut modelini konuşuyoruz.",
  "ex-orta-3": "Bu derste Veri Çözümleme İfadeleri ölçüleri, SUM ve CALCULATE’i konuşuyoruz.",
  "ex-orta-4": "Bu derste Power BI görselleri ve etkileşimi konuşuyoruz.",
  "ex-orta-5": "Bu derste tablo ilişkileri ve çapraz filtre yönünü konuşuyoruz.",
  "ex-orta-6": "Bu derste Satır Düzeyi Güvenlik girişini konuşuyoruz.",
  "ex-orta-7": "Bu derste çalışma alanı, yayın ve planlı yenilemeyi konuşuyoruz.",
  "ex-orta-8": "Bu derste sorgudan yönetici gösterge panosu laboratuvarını konuşuyoruz.",
  "ex-ileri-1": "Bu derste dizi formülü ve dinamik aralığı konuşuyoruz.",
  "ex-ileri-2": "Bu derste sorgulama işlevi ile seç, süz, grupla’yı konuşuyoruz.",
  "ex-ileri-3": "Bu derste veri doğrulama, koruma ve adlandırılmış aralığı konuşuyoruz.",
  "ex-ileri-4": "Bu derste Uygulama Senaryosu fonksiyon, kayıt defteri ve özel menüyü konuşuyoruz.",
  "ex-ileri-5": "Bu derste zaman ve olay tetikleyicilerini konuşuyoruz.",
  "ex-ileri-6": "Bu derste UrlFetchApp ve dış Uygulama Programlama Arayüzü bağlantısını konuşuyoruz.",
  "ex-ileri-7": "Bu derste uçtan uca otomasyon iş akışını konuşuyoruz.",
  "ex-ileri-8": "Bu derste hata anında kapalı sırlar ve Özellikler Hizmetini konuşuyoruz.",
  "ex-ileri-9": "Bu derste hata yönetimi, yeniden deneme ve izlenebilir kaydı konuşuyoruz.",
  "ex-ileri-10": "Bu derste E-Tablolar + Uygulama Senaryosu otomasyon kapanış çalışması laboratuvarını konuşuyoruz.",
  "mnt-temel-1": "Bu derste niş seçimi ve kanal konumlandırmayı konuşuyoruz.",
  "mnt-temel-2": "Bu derste senaryo iskeleti — kanca, gövde, eyleme çağrıyı konuşuyoruz.",
  "mnt-temel-3": "Bu derste küçük resim ve tıklama dürüstlüğünü konuşuyoruz.",
  "mnt-temel-4": "Bu derste YouTube Arama Motoru Optimizasyonu — başlık, açıklama, etiketi konuşuyoruz.",
  "mnt-temel-5": "Bu derste analitik — tıklama oranı, ortalama izlenme süresi, tutmayı konuşuyoruz.",
  "mnt-temel-6": "Bu derste kanal büyüme paketi laboratuvarını konuşuyoruz.",
  "mnt-orta-1": "Bu derste kurgu iş akışı ve zaman çizelgesi disiplinini konuşuyoruz.",
  "mnt-orta-2": "Bu derste kesim, tempo ve destek görüntüsünü konuşuyoruz.",
  "mnt-orta-3": "Bu derste ses, müzik hakları ve altyazıyı konuşuyoruz.",
  "mnt-orta-4": "Bu derste kısa dikey video formatı ve yayın ritmini konuşuyoruz.",
  "mnt-orta-5": "Bu derste kanca — ilk üç saniye disiplinini konuşuyoruz.",
  "mnt-orta-6": "Bu derste renk, dışa aktarma ve platform belirtimini konuşuyoruz.",
  "mnt-orta-7": "Bu derste yayın takvimi ve toplu üretimi konuşuyoruz.",
  "mnt-orta-8": "Bu derste kısa dikey video prodüksiyon laboratuvarını konuşuyoruz.",
  "mnt-ileri-1": "Bu derste ürün araştırması ve talep doğrulamayı konuşuyoruz.",
  "mnt-ileri-2": "Bu derste tedarikçi seçimi ve ilan dürüstlüğünü konuşuyoruz.",
  "mnt-ileri-3": "Bu derste ürün detay sayfası ve dönüşüm kopyasını konuşuyoruz.",
  "mnt-ileri-4": "Bu derste reklam, trafik ve atfı konuşuyoruz.",
  "mnt-ileri-5": "Bu derste huni ve ödeme operasyonunu konuşuyoruz.",
  "mnt-ileri-6": "Bu derste sipariş karşılama, depo operasyonu ve müşteri hizmetini konuşuyoruz.",
  "mnt-ileri-7": "Bu derste birim ekonomi — satılan malın maliyeti, müşteri edinim maliyeti, marjı konuşuyoruz.",
  "mnt-ileri-8": "Bu derste yasal ve vergi dürüstlüğünü konuşuyoruz.",
  "mnt-ileri-9": "Bu derste sahte gelir vaadi — hata anında kapalı gelir iddiasını konuşuyoruz.",
  "mnt-ileri-10": "Bu derste e-ticaret operasyon kapanış laboratuvarını konuşuyoruz.",
  "mkt-temel-1": "Bu derste Meta Piksel, Olay Yöneticisi ve olay sözlüğünü konuşuyoruz.",
  "mkt-temel-2": "Bu derste kampanya yapısını — Kampanya, Reklam Seti, Reklam — konuşuyoruz.",
  "mkt-temel-3": "Bu derste hedef kitleyi — ilgi, benzer kitle, yeniden hedefleme — konuşuyoruz.",
  "mkt-temel-4": "Bu derste kreatif test — metin, görsel, eylem çağrısı — disiplinini konuşuyoruz.",
  "mkt-temel-5": "Bu derste teklif stratejileri ve bütçe kontrolünü konuşuyoruz.",
  "mkt-temel-6": "Bu derste Meta Reklamları performans raporu laboratuvarını konuşuyoruz.",
  "mkt-orta-1": "Bu derste Google Reklamları hesap ve kampanya türleri haritasını konuşuyoruz.",
  "mkt-orta-2": "Bu derste Arama — anahtar kelime ve eşlemeyi konuşuyoruz.",
  "mkt-orta-3": "Bu derste Kalite Skoru, reklam metni ve uzantıları konuşuyoruz.",
  "mkt-orta-4": "Bu derste Görüntülü ağ — yerleşim, frekans, marka güvenliğini konuşuyoruz.",
  "mkt-orta-5": "Bu derste YouTube Reklamları — video formatı ve huni hizasını konuşuyoruz.",
  "mkt-orta-6": "Bu derste dönüşüm izleme — etiket, açık rıza, atıfı konuşuyoruz.",
  "mkt-orta-7": "Bu derste bütçe, teklif ve günlük harcama disiplinini konuşuyoruz.",
  "mkt-orta-8": "Bu derste Google Reklamları Arama ve Görüntülü laboratuvarını konuşuyoruz.",
  "mkt-ileri-1": "Bu derste Arama Motoru Optimizasyonu — arama niyeti ve sonuç sayfası okumayı konuşuyoruz.",
  "mkt-ileri-2": "Bu derste anahtar kelime araştırması ve fırsat haritasını konuşuyoruz.",
  "mkt-ileri-3": "Bu derste sayfa içi Arama Motoru Optimizasyonu — başlık, içerik, dahili bağı konuşuyoruz.",
  "mkt-ileri-4": "Bu derste teknik görünürlük — tarama, dizin, Temel Web Canlılıkları’nı konuşuyoruz.",
  "mkt-ileri-5": "Bu derste içerik sistemi — iş brifi, takvim, yeniden kullanımı konuşuyoruz.",
  "mkt-ileri-6": "Bu derste analitik — olay, huni ve atıf dürüstlüğünü konuşuyoruz.",
  "mkt-ileri-7": "Bu derste deney tasarımı — hipotez, ikili karşılaştırma, koruma rayını konuşuyoruz.",
  "mkt-ileri-8": "Bu derste büyüme çarkı — edinim, aktivasyon, tavsiyeyi konuşuyoruz.",
  "mkt-ileri-9": "Bu derste ölçüm kapısı — Reklam Harcamasının Geri Dönüşü ve Müşteri Edinim Maliyeti disiplinini konuşuyoruz.",
  "mkt-ileri-10": "Bu derste Arama Motoru Optimizasyonu, içerik ve büyüme kapanış laboratuvarını konuşuyoruz.",
  "pd-temel-1": "Bu derste ikna etiğini — rıza, şeffaflık ve hata anında kapalı — konuşuyoruz.",
  "pd-temel-2": "Bu derste mesaj iskeleti — amaç, kanıt, eyleme çağrı — konuşuyoruz.",
  "pd-temel-3": "Bu derste dinleyici haritası ve ortak dili konuşuyoruz.",
  "pd-temel-4": "Bu derste sahne varlığı — ses, tempo, beden — konuşuyoruz.",
  "pd-temel-5": "Bu derste soru, itiraz ve netliği konuşuyoruz.",
  "pd-temel-6": "Bu derste beş dakikalık etik ikna sunumu laboratuvarını konuşuyoruz.",
  "pd-orta-1": "Bu derste duygusal zekâ haritası ve öz farkındalığı konuşuyoruz.",
  "pd-orta-2": "Bu derste empati ve perspektif almayı konuşuyoruz.",
  "pd-orta-3": "Bu derste Durum-Davranış-Etki geri bildirimi ve netliği konuşuyoruz.",
  "pd-orta-4": "Bu derste zor konuşmalar — hazırlık — konuşuyoruz.",
  "pd-orta-5": "Bu derste çatışma haritası — çıkar ve pozisyon — konuşuyoruz.",
  "pd-orta-6": "Bu derste liderlik iletişimi — yön ve güvenlik — konuşuyoruz.",
  "pd-orta-7": "Bu derste takım iklimi ve psikolojik güvenliği konuşuyoruz.",
  "pd-orta-8": "Bu derste geri bildirim ve çatışma kontrol listesi laboratuvarını konuşuyoruz.",
  "pd-ileri-1": "Bu derste Nöro-Dilsel Programlama’ya etik girişi — manipülasyon değil çerçeve — konuşuyoruz.",
  "pd-ileri-2": "Bu derste yeniden çerçeveleme ve etik sınırları konuşuyoruz.",
  "pd-ileri-3": "Bu derste dil kalıpları — varsayım ve netleştirme — konuşuyoruz.",
  "pd-ileri-4": "Bu derste durum yönetimi — kaynak durum ve dürüstlük — konuşuyoruz.",
  "pd-ileri-5": "Bu derste zaman kutusu — odak kutusu — konuşuyoruz.",
  "pd-ileri-6": "Bu derste Eisenhower Öncelik Matrisi — acil ve önemli — konuşuyoruz.",
  "pd-ileri-7": "Bu derste alışkanlık sistemleri — tetik, rutin, ödül — konuşuyoruz.",
  "pd-ileri-8": "Bu derste derin çalışma ve dikkat bütçesini konuşuyoruz.",
  "pd-ileri-9": "Bu derste entegrasyon — iletişim ve zaman sistemi — konuşuyoruz.",
  "pd-ileri-10": "Bu derste kişisel işletim sistemi Kapanış Uygulaması laboratuvarını konuşuyoruz.",
  "cld-temel-1": "Bu derste bulut hesabı ve elektrik aboneliğini konuşuyoruz.",
  "cld-temel-2": "Bu derste Kimlik ve Erişim Yönetimi — anahtarlı kiralık kasayı konuşuyoruz.",
  "cld-temel-3": "Bu derste Sanallaştırılmış Özel Ağ — parselasyon ve arsa çitini konuşuyoruz.",
  "cld-temel-4": "Bu derste Esnek Bilgi İşlem Bulutu — kiralık sunucu garajını konuşuyoruz.",
  "cld-temel-5": "Bu derste Basit Depolama Servisi — emanet deposu ve kovayı konuşuyoruz.",
  "cld-temel-6": "Bu derste fatura disiplini laboratuvarını — ay sonu elektrik faturasını konuşuyoruz.",
  "cld-orta-1": "Bu derste Esnek Yük Dengeleyici — trafik polisi ve gişe geçişini konuşuyoruz.",
  "cld-orta-2": "Bu derste hedef grup ve sağlık kontrolü — gişede kırmızı lambayı konuşuyoruz.",
  "cld-orta-3": "Bu derste otomatik ölçekleme — esneyen otobüs filosunu konuşuyoruz.",
  "cld-orta-4": "Bu derste ölçek politikası ve soğuma — filonun gece boş gezmemesini konuşuyoruz.",
  "cld-orta-5": "Bu derste İlişkisel Veritabanı Servisi — kiralık ana kasalı banka mahzenini konuşuyoruz.",
  "cld-orta-6": "Bu derste yedekleme ve çoklu bölge — mahzenin ikinci kasasını konuşuyoruz.",
  "cld-orta-7": "Bu derste Sunucusuz Mantık — sipariş gelince yanan mutfak ışığını konuşuyoruz.",
  "cld-orta-8": "Bu derste orta mimari laboratuvarını — gişe, filo, mahzen ve mutfağı konuşuyoruz.",
  "cld-ileri-1": "Bu derste Kubernetes — orkestra şefi ve konteyner limanını konuşuyoruz.",
  "cld-ileri-2": "Bu derste pod, servis ve dağıtım — limanda konteyner adresini konuşuyoruz.",
  "cld-ileri-3": "Bu derste kaynak limiti ve sağlık — limanda aşırı yükü konuşuyoruz.",
  "cld-ileri-4": "Bu derste Terraform — mimari yapı projesi ve otomasyon şablonunu konuşuyoruz.",
  "cld-ileri-5": "Bu derste durum dosyası ve sapma — şablon ile şantiye uyuşmazlığını konuşuyoruz.",
  "cld-ileri-6": "Bu derste modül ve ortam — aynı projeden üç şantiyeyi konuşuyoruz.",
  "cld-ileri-7": "Bu derste GitOps — fabrika üretim bant otomasyonunu konuşuyoruz.",
  "cld-ileri-8": "Bu derste bildirim ve sürükleme — bantta kırmızı kutuyu konuşuyoruz.",
  "cld-ileri-9": "Bu derste gözlem ve sır — liman kulesi ve kasayı konuşuyoruz.",
  "cld-ileri-10": "Bu derste ileri kapanış laboratuvarını — orkestra, proje ve bandı konuşuyoruz.",
  "eng-temel-1": "Bu derste veri hattını — ham madde kamyonu ve fabrika kapısını konuşuyoruz.",
  "eng-temel-2": "Bu derste Ayıkla-Dönüştür-Yükle ve Ayıkla-Yükle-Dönüştür — kamyon ile arıtma tesisini konuşuyoruz.",
  "eng-temel-3": "Bu derste Veri Gölü ve Veri Ambarı — ham hububat deposu ile paketli un ambarını konuşuyoruz.",
  "eng-temel-4": "Bu derste boyut modelleme — marangoz ölçü şablonunu konuşuyoruz.",
  "eng-temel-5": "Bu derste Veri Dönüştürme Aracı — terazi damgasını konuşuyoruz.",
  "eng-temel-6": "Bu derste ham tablodan dürüst pazar model laboratuvarını — payda yazılı kapanışı konuşuyoruz.",
  "eng-orta-1": "Bu derste Hava Akışı orkestrasyonunu — otomatik tren makas kontrol merkezini konuşuyoruz.",
  "eng-orta-2": "Bu derste Yönlü Devirsel Olmayan Graf — makas grafı ve döngü yasağını konuşuyoruz.",
  "eng-orta-3": "Bu derste zamanlayıcı saati — sefer tarifesi ve geriye dönük yükü konuşuyoruz.",
  "eng-orta-4": "Bu derste görev ve bağımlılığı — raydaki vagon sırasını konuşuyoruz.",
  "eng-orta-5": "Bu derste sensör ve yeniden denemeyi — makasta bekleme lambasını konuşuyoruz.",
  "eng-orta-6": "Bu derste veri kalitesi laboratuvarını — fabrika kalite kontrol masasını konuşuyoruz.",
  "eng-orta-7": "Bu derste hat durdurma vanasını — Hizmet Seviyesi Anlaşması’nı konuşuyoruz.",
  "eng-orta-8": "Bu derste orta laboratuvarını — makas, saat, laboratuvar ve vanayı konuşuyoruz.",
  "eng-ileri-1": "Bu derste madalya mimarisini — dev arıtma ve maden ayrıştırma tesisini konuşuyoruz.",
  "eng-ileri-2": "Bu derste Bronz katmanı — ham cevher bunkerı ve irsaliyeyi konuşuyoruz.",
  "eng-ileri-3": "Bu derste Gümüş katmanı — yıkanmış cevher ve tartıyı konuşuyoruz.",
  "eng-ileri-4": "Bu derste Altın katmanı — külçe, pazar ve göstergeyi konuşuyoruz.",
  "eng-ileri-5": "Bu derste Veri Tuğlaları ve Kar Tanesi — iki tesis, iki faturayı konuşuyoruz.",
  "eng-ileri-6": "Bu derste Kıvılcım Veri İşleme Motoru — çok hatlı yüksek hızlı treni konuşuyoruz.",
  "eng-ileri-7": "Bu derste parti ve canlı akışı — sefer tarifesi ile canlı hattı konuşuyoruz.",
  "eng-ileri-8": "Bu derste karışım ve bölümlemeyi — makas yoğunluğu ve vagon boyunu konuşuyoruz.",
  "eng-ileri-9": "Bu derste taze meyve hali ve soğuk hava deposunu — maliyet hesabını konuşuyoruz.",
  "eng-ileri-10": "Bu derste ileri laboratuvarını — madalya, kıvılcım ve soğuk depoyu konuşuyoruz.",
  "qa-temel-1": "Bu derste Kalite Güvencesi masasını — fabrika damgası ve ürün kabulü konuşuyoruz.",
  "qa-temel-2": "Bu derste test piramidini — ürün kabul kantar terazisini konuşuyoruz.",
  "qa-temel-3": "Bu derste birim ve bütünleştirmeyi — reçete doğrulamayı konuşuyoruz.",
  "qa-temel-4": "Bu derste manuel kabulü — noter onay tutanağını konuşuyoruz.",
  "qa-temel-5": "Bu derste hata raporu ve kanıtı — damgasız koli yasağını konuşuyoruz.",
  "qa-temel-6": "Bu derste damga, terazi, reçete ve tutanak laboratuvarını konuşuyoruz.",
  "qa-orta-1": "Bu derste uçtan uca testi — otomatik robotik kolları konuşuyoruz.",
  "qa-orta-2": "Bu derste Playwright sahnesini — tarayıcı fabrikasını konuşuyoruz.",
  "qa-orta-3": "Bu derste seçici ve beklemeyi — kolun tutuşunu konuşuyoruz.",
  "qa-orta-4": "Bu derste kararsız testi — sahte montaj hattı yasağını konuşuyoruz.",
  "qa-orta-5": "Bu derste sürekli entegrasyonu — kırmızı ışıklı otomatik bariyeri konuşuyoruz.",
  "qa-orta-6": "Bu derste sürekli teslimatı — sevkiyat kapısını konuşuyoruz.",
  "qa-orta-7": "Bu derste görsel ve erişilebilirliği — vitrin kontrolünü konuşuyoruz.",
  "qa-orta-8": "Bu derste orta laboratuvarını — kol, yasak ve bariyeri konuşuyoruz.",
  "qa-ileri-1": "Bu derste sözleşme testini — iki fabrika arası protokolü konuşuyoruz.",
  "qa-ileri-2": "Bu derste tüketici sözleşmesini — sipariş fişini konuşuyoruz.",
  "qa-ileri-3": "Bu derste sağlayıcı sözleşmesini — irsaliyeyi konuşuyoruz.",
  "qa-ileri-4": "Bu derste performans bütçesini — yüzde doksan beşi konuşuyoruz.",
  "qa-ileri-5": "Bu derste Performans Test Aracı’nı — baraj kapaklarını konuşuyoruz.",
  "qa-ileri-6": "Bu derste yük ve stresi — suyun basıncını konuşuyoruz.",
  "qa-ileri-7": "Bu derste dayanıklılık ve sivri yükü — gece taşkınını konuşuyoruz.",
  "qa-ileri-8": "Bu derste gözlem ve bütçe ihlalini — kırmızı barajı konuşuyoruz.",
  "qa-ileri-9": "Bu derste kalite kapısı orkestrasyonunu — sözleşme ve basıncı konuşuyoruz.",
  "qa-ileri-10": "Bu derste ileri laboratuvarını — protokol, baraj ve bütçeyi konuşuyoruz.",
  "jav-temel-1": "Bu derste Java Sanal Makinesi’ni — fabrika motor odasını konuşuyoruz.",
  "jav-temel-2": "Bu derste Nesne Yönelimli Programlama’yı — kalıp ve vidayı konuşuyoruz.",
  "jav-temel-3": "Bu derste Maven ve Gradle’ı — fabrika derleme makinesini konuşuyoruz.",
  "jav-temel-4": "Bu derste JUnit damgasını — garanti belgesi ve çıkış onayını konuşuyoruz.",
  "jav-temel-5": "Bu derste paket ve bağımlılığı — koli irsaliyesini konuşuyoruz.",
  "jav-temel-6": "Bu derste motor, makine ve damga laboratuvarını konuşuyoruz.",
  "jav-orta-1": "Bu derste Spring Boot iskeletini — fabrika resepsiyonunu konuşuyoruz.",
  "jav-orta-2": "Bu derste bağımlılık enjeksiyonunu — vardiya kartını konuşuyoruz.",
  "jav-orta-3": "Bu derste Temsili Durum Transferi uçlarını — sipariş gişesini konuşuyoruz.",
  "jav-orta-4": "Bu derste doğrulama ve dört yüzü — şema dışı paket yasağını konuşuyoruz.",
  "jav-orta-5": "Bu derste Spring Security’yi — şifreli fabrika giriş kapısını konuşuyoruz.",
  "jav-orta-6": "Bu derste Java Kalıcılık rafını — depo sözleşmesini konuşuyoruz.",
  "jav-orta-7": "Bu derste Veri Transfer Nesnesi’ni — koli etiketini konuşuyoruz.",
  "jav-orta-8": "Bu derste orta laboratuvarını — kapı, resepsiyon ve dört yüzü konuşuyoruz.",
  "jav-ileri-1": "Bu derste veritabanı işlem birimini — kasa mühürünü konuşuyoruz.",
  "jav-ileri-2": "Bu derste Outbox desenini — iki banka transfer odasını konuşuyoruz.",
  "jav-ileri-3": "Bu derste çift yazıcı yasağını — iki defter tek gerçeği konuşuyoruz.",
  "jav-ileri-4": "Bu derste mesaj kuyruğunu — üretim hattı sır kasasını konuşuyoruz.",
  "jav-ileri-5": "Bu derste sır yönetimini — kasa anahtarını konuşuyoruz.",
  "jav-ileri-6": "Bu derste merkezi izlemeyi — izleme kulesini konuşuyoruz.",
  "jav-ileri-7": "Bu derste eşgüçlülüğü — aynı fiş yasağını konuşuyoruz.",
  "jav-ileri-8": "Bu derste Sürekli Entegrasyon kapısını — üretim hattı kapısını konuşuyoruz.",
  "jav-ileri-9": "Bu derste orkestrasyonu — oda, kasa ve kuleyi konuşuyoruz.",
  "jav-ileri-10": "Bu derste ileri laboratuvarını — oda, kasa ve kuleyi konuşuyoruz.",
  "rn-temel-1": "Bu derste çapraz platform pasaportunu — iki ülkeye tek belgeyi konuşuyoruz.",
  "rn-temel-2": "Bu derste Tip Güvenlikli Yazılım’ı — vitrin etiket sözleşmesini konuşuyoruz.",
  "rn-temel-3": "Bu derste bileşen ve özelliği — vitrin mankeni ile askıyı konuşuyoruz.",
  "rn-temel-4": "Bu derste esnek kutuyu — standart vitrin dizilimini konuşuyoruz.",
  "rn-temel-5": "Bu derste kaydırma bandını — düz liste ve sonsuz rafı konuşuyoruz.",
  "rn-temel-6": "Bu derste pasaport, vitrin ve kaydırma bandı laboratuvarını konuşuyoruz.",
  "rn-orta-1": "Bu derste ekran koridorunu — yığın gezinme ve geri tuşu konuşuyoruz.",
  "rn-orta-2": "Bu derste tek vitrin gerçeğini — durum ve yeniden boyamayı konuşuyoruz.",
  "rn-orta-3": "Bu derste Temsili Durum Transferi’ni — kurye fişini konuşuyoruz.",
  "rn-orta-4": "Bu derste çevrimdışı emanet kasasını — önbellek ve kuyruğu konuşuyoruz.",
  "rn-orta-5": "Bu derste çekmeyen telefonu — sahte yeşil yasağını konuşuyoruz.",
  "rn-orta-6": "Bu derste şifreli yerel kiralık depoyu — güvenli kasayı konuşuyoruz.",
  "rn-orta-7": "Bu derste paylaşılan çekmece ve kasa anahtarı ayrımını konuşuyoruz.",
  "rn-orta-8": "Bu derste orta laboratuvarını — emanet, sahte yeşil ve kasayı konuşuyoruz.",
  "rn-ileri-1": "Bu derste gümrük tercümanını — yerel köprü sözleşmesini konuşuyoruz.",
  "rn-ileri-2": "Bu derste Turbo Modül ve JavaScript Arayüzü köprüsünü konuşuyoruz.",
  "rn-ileri-3": "Bu derste yeni mimariyi — kumaş ve eşzamanlı boyamayı konuşuyoruz.",
  "rn-ileri-4": "Bu derste kare bütçesini — jank yasağı ve profili konuşuyoruz.",
  "rn-ileri-5": "Bu derste Havadan Güncelleme’yi — koli ve gümrük sınırını konuşuyoruz.",
  "rn-ileri-6": "Bu derste Sürekli Entegrasyon ve teslimat kapısını konuşuyoruz.",
  "rn-ileri-7": "Bu derste mağaza onay gişesini — paket ve imzayı konuşuyoruz.",
  "rn-ileri-8": "Bu derste red metni analiz tutanağını — gişe dilini konuşuyoruz.",
  "rn-ileri-9": "Bu derste kara kutu ve uzaktan kapatma nöbetini konuşuyoruz.",
  "rn-ileri-10": "Bu derste ileri laboratuvarını — tercüman, gişe ve tutanağı konuşuyoruz.",
  "gam-temel-1": "Bu derste Unity editörünü — tiyatro sahnesi ve hiyerarşi perdesini konuşuyoruz.",
  "gam-temel-2": "Bu derste C Sharp oyun döngüsünü — kukla iplerini konuşuyoruz.",
  "gam-temel-3": "Bu derste oyun nesnesi ve dönüşümü — sahne figüranını konuşuyoruz.",
  "gam-temel-4": "Bu derste fizik motorunu — yerçekimi iplerini konuşuyoruz.",
  "gam-temel-5": "Bu derste girdi haritası ve sahne kamerasını — oyuncu iplerini konuşuyoruz.",
  "gam-temel-6": "Bu derste tek sahneli oynanır prototip laboratuvarını konuşuyoruz.",
  "gam-orta-1": "Bu derste Kullanıcı Arayüzü tuvalini — sahne üstü afişi konuşuyoruz.",
  "gam-orta-2": "Bu derste eylem haritasını — kumanda kablosunu konuşuyoruz.",
  "gam-orta-3": "Bu derste ses kaynağını — perde arkası orkestrayı konuşuyoruz.",
  "gam-orta-4": "Bu derste İki Boyutlu ve Üç Boyutlu yayın iskeletini konuşuyoruz.",
  "gam-orta-5": "Bu derste Uygulama İçi Satın Alma’yı — jeton otomatını konuşuyoruz.",
  "gam-orta-6": "Bu derste derleme paketini — fabrika montaj hattını konuşuyoruz.",
  "gam-orta-7": "Bu derste izin metni ve mağaza iskeletini — kutu etiketini konuşuyoruz.",
  "gam-orta-8": "Bu derste orta laboratuvarını — jeton, hat ve kutuyu konuşuyoruz.",
  "gam-ileri-1": "Bu derste adreslenebilir varlığı — canlı tiyatro dekor değişimini konuşuyoruz.",
  "gam-ileri-2": "Bu derste kataloğu — sahne malzeme listesini konuşuyoruz.",
  "gam-ileri-3": "Bu derste uzaktan paketi — kamyon dekorunu konuşuyoruz.",
  "gam-ileri-4": "Bu derste canlı operasyonu — gece nöbetini konuşuyoruz.",
  "gam-ileri-5": "Bu derste uzaktan yapılandırmayı — sahne notunu konuşuyoruz.",
  "gam-ileri-6": "Bu derste etik para tasarımını — dürüst bilet gişesini konuşuyoruz.",
  "gam-ileri-7": "Bu derste Uygulama İçi Satın Alma vaadini — yazılı sözleşmeyi konuşuyoruz.",
  "gam-ileri-8": "Bu derste kumar mekaniği yasağı tutanağını — gişe dilini konuşuyoruz.",
  "gam-ileri-9": "Bu derste gözlem ve geri almayı — emniyet ipini konuşuyoruz.",
  "gam-ileri-10": "Bu derste ileri laboratuvarını — dekor, gişe ve tutanağı konuşuyoruz.",
  "mlo-temel-1": "Bu derste yapay zekâ model işletmesini — üretim defteri ve fırın parti satırını konuşuyoruz.",
  "mlo-temel-2": "Bu derste deney takibini — fırın parti defterini konuşuyoruz.",
  "mlo-temel-3": "Bu derste Veri Sürüm Kontrolü’nü — reçete kağıdı ve çuval tarihini konuşuyoruz.",
  "mlo-temel-4": "Bu derste Model Sicili’ni — TSE damgası ve sevk irsaliyesini konuşuyoruz.",
  "mlo-temel-5": "Bu derste veri sapmasını — süt tarihi ve yoğurt ekşimesini konuşuyoruz.",
  "mlo-temel-6": "Bu derste damgasız koli laboratuvarını — defter, reçete ve sicili konuşuyoruz.",
  "sys-temel-1": "Bu derste yüksek debili dağıtık sistem tasarımını — ölçek masası ve yük satırını konuşuyoruz.",
  "sys-temel-2": "Bu derste yük dengelemeyi — kavşak lambasını konuşuyoruz.",
  "sys-temel-3": "Bu derste önbelleği — büfe vitrini ve arka depoyu konuşuyoruz.",
  "sys-temel-4": "Bu derste veritabanı parçalamayı — mahalle PTT şubesi koli defterini konuşuyoruz.",
  "sys-temel-5": "Bu derste hız sınırını — cami abdest musluğunu konuşuyoruz.",
  "sys-temel-6": "Bu derste kavşak laboratuvarını — lamba, vitrin, PTT ve musluğu konuşuyoruz.",
  "canva-temel-1": "Bu derste şablonu odaya yerleştirip tek işe kilitlemeyi konuşuyoruz.",
  "canva-temel-2": "Bu derste çekmeceleri — yazı, fotoğraf ve zemini ayrı tutmayı konuşuyoruz.",
  "canva-temel-3": "Bu derste vesikalık kalıbını — boyutu işe göre seçmeyi konuşuyoruz.",
  "canva-temel-4": "Bu derste bakkal panosunu — sosyal karede tek mesaj bırakmayı konuşuyoruz.",
  "canva-temel-5": "Bu derste matbaa kapısını — çıktıyı kâğıt ve ekran için kontrol etmeyi konuşuyoruz.",
  "canva-temel-6": "Bu derste vitrin laboratuvarını — tek iş, tek kare, tarihli kopyayı konuşuyoruz.",
  "linkedin-temel-1": "Bu derste profili kapı tabelası gibi kurmayı konuşuyoruz.",
  "linkedin-temel-2": "Bu derste vesikalığı — yüzü ve kapağı konuşuyoruz.",
  "linkedin-temel-3": "Bu derste bakkal camını — başlık satırını konuşuyoruz.",
  "linkedin-temel-4": "Bu derste ev tanıtımını — hakkında ve deneyim kutularını konuşuyoruz.",
  "linkedin-temel-5": "Bu derste pano yazısını — haftalık bir cümlelik paylaşımı konuşuyoruz.",
  "linkedin-temel-6": "Bu derste matbaalık özgeçmiş kopyasını — profil ve tarihli kâğıdı konuşuyoruz.",
  "cad-temel-1": "Bu derste kâğıttaki çizgiyi oda gibi okumayı konuşuyoruz.",
  "cad-temel-2": "Bu derste çekmeceleri — duvar, yazı ve eşyayı ayrı tutmayı konuşuyoruz.",
  "cad-temel-3": "Bu derste vesikalık oranı — ölçek ve ölçü yazısını konuşuyoruz.",
  "cad-temel-4": "Bu derste bakkal işaretlerini — kapı, pencere ve kuzeyi konuşuyoruz.",
  "cad-temel-5": "Bu derste basit odayı — dikdörtgen, kapı boşluğu ve yazıyı konuşuyoruz.",
  "cad-temel-6": "Bu derste matbaalık kâğıt kopyayı — okunan plan, tek oda ve çıktıyı konuşuyoruz.",
  "pra-temel-1": "Bu derste asistanı komşu gibi kullanmayı konuşuyoruz.",
  "pra-temel-2": "Bu derste bakkal panosu gibi istek cümlesini — ne, kim, uzunluk — konuşuyoruz.",
  "pra-temel-3": "Bu derste vesikalık sırrını — kimlik, hesap, sağlığı caddeye asmamayı konuşuyoruz.",
  "pra-temel-4": "Bu derste ev çekmecesini — her işi ayrı sohbette tutmayı konuşuyoruz.",
  "pra-temel-5": "Bu derste matbaa provasını — taslağı resmi evrak sanmamayı konuşuyoruz.",
  "pra-temel-6": "Bu derste üç günlük iş laboratuvarını — duyuru, ilan ve dilekçe taslağını konuşuyoruz.",
  "esg-1": "Bu derste yetkisiz taramayı pentest saymamayı konuşuyoruz.",
  "esg-2": "Bu derste demoyu Done saymamayı konuşuyoruz.",
  "esg-3": "Bu derste kanıtsız bulgu kapanışını konuşuyoruz.",
  "agile-scrum-1": "Bu derste kimlik avı tuzağını konuşuyoruz.",
  "agile-scrum-2": "Bu derste tek faktörlü parolanın neden yetmediğini konuşuyoruz.",
  "agile-scrum-3": "Bu derste açık Wi‑Fi’de iş bırakmamayı konuşuyoruz.",
  "agile-scrum-4": "Bu derste şüphede sessiz kalmamayı konuşuyoruz.",
  "bulut-devops-1": "Bu derste dizüstünden üretim basmamayı konuşuyoruz.",
  "bulut-devops-2": "Bu derste sırın depoya girmemesini konuşuyoruz.",
  "bulut-devops-3": "Bu derste kırmızı artefaktı ilerletmemeyi konuşuyoruz.",
  "bulut-devops-4": "Bu derste geri alma yazılmadan basmamayı konuşuyoruz.",
  "bulut-devops-5": "Bu derste iz yokken kör işletmeyi konuşuyoruz.",
  "uiux-ds-1": "Bu derste süsün görevi gizlememesini konuşuyoruz.",
  "uiux-ds-2": "Bu derste okunmayan fiyatı teslim saymamayı konuşuyoruz.",
  "uiux-ds-3": "Bu derste rastgele rengi sistem saymamayı konuşuyoruz.",
  "uiux-ds-4": "Bu derste beğeniyi kabul ölçütü saymamayı konuşuyoruz.",
  "fintek-ob-1": "Bu derste ölçüsüz dileği gereksinim saymamayı konuşuyoruz.",
  "fintek-ob-2": "Bu derste kıdemin PO sırasını ezmesini konuşuyoruz.",
  "fintek-ob-3": "Bu derste demoyu Done saymamayı konuşuyoruz.",
  "python-temel-7": "Bu derste listeler ve indeksi konuşuyoruz.",
  "python-temel-8": "Bu derste sözlük ve anahtarı konuşuyoruz.",
  "python-temel-9": "Bu derste pathlib ve atomik yazımı konuşuyoruz.",
  "python-temel-10": "Bu derste Pandas tablo sözleşmesini konuşuyoruz.",
  "python-temel-11": "Bu derste parametreli Yapılandırılmış Sorgu Dili köprüsünü konuşuyoruz.",
  "python-temel-12": "Bu derste kapanış laboratuvarını konuşuyoruz.",
  "fullstack-temel-7": "Bu derste React bileşen ve props sözleşmesini konuşuyoruz.",
  "fullstack-temel-8": "Bu derste faz makinesi ve Tek Gerçek Kaynak’ı konuşuyoruz.",
  "fullstack-temel-9": "Bu derste Next.js sayfa yönlendirmesini konuşuyoruz.",
  "fullstack-temel-10": "Bu derste Express ve Zod kapısını konuşuyoruz.",
  "fullstack-temel-11": "Bu derste parametreli PostgreSQL sorgusunu konuşuyoruz.",
  "fullstack-temel-12": "Bu derste mühürlü sepet teslimini konuşuyoruz.",
  "ai-temel-7": "Bu derste veri sorusu ve tablo sözleşmesini konuşuyoruz.",
  "ai-temel-8": "Bu derste tablo temizliğini konuşuyoruz.",
  "ai-temel-9": "Bu derste dürüst özet ve paydayı konuşuyoruz.",
  "ai-temel-10": "Bu derste kaynaklı getiri ayrımını konuşuyoruz.",
  "ai-temel-11": "Bu derste uydurma kesiciyi konuşuyoruz.",
  "ai-temel-12": "Bu derste kaynaklı asistan kapanışını konuşuyoruz.",
  "ux-temel-8": "Bu derste görsel hiyerarşiyi konuşuyoruz.",
  "ux-temel-9": "Bu derste tasarım jetonunu konuşuyoruz.",
  "ux-temel-10": "Bu derste prototipi konuşuyoruz.",
  "ux-temel-11": "Bu derste erişilebilirlik barajını konuşuyoruz.",
  "ux-temel-12": "Bu derste el teslimini konuşuyoruz.",
};

export const ACADEMY_LESSON_COMPASS: Record<string, AcademyLessonCompass> = Object.fromEntries(
  Object.entries(COMPASS_JOBS).map(([key, job]) => [key, { job }]),
);

/**
 * Ders-arası Koray özeti — «yeni anlayan öğrenci» kıvılcımı.
 * Önceki bölümün iş cümlesinin ardından gelir; fabrikasyon kalıp değildir.
 * Anahtar: içinde özetin okunduğu (mevcut) ders.
 */
export const ACADEMY_MODERATOR_RECAP_SPARK: Record<string, string> = {
  "python-temel-2":
    "İçimden şunu geçirdim: ekranda o merhaba belirdiğinde makine beni gerçekten duymuş; şimdi duyulan şeyi bir kutuya koyup etiketlemezsek yarın kaybolur.",
  "python-temel-3":
    "Kafamda oturdu: etiketsiz kavanozu karıştırmak gibiymiş değişken; şimdi o kavanoza bakıp «yeterli mi değil mi» diye karar verecek bir ışık arıyorum.",
  "python-temel-4":
    "Demek ki yeşil-kırmızı tek seferlikmiş; ama ya aynı soruyu yüz kişiye sormam gerekirse? Aynı cümleyi yüz kez yazmak istemiyorum.",
  "python-temel-5":
    "Az önce döngüyle tekrarı tek yerde topladık ya... içimden «bu tarifi bir isimle çağırsam» geçti; her seferinde sıfırdan yazmak esnaf defterini yırtmak gibi.",
  "python-temel-6":
    "Fonksiyon tarifi hazır; şimdi gişede karşımdaki insan «üç» deyince programın kızmasını değil, kibarca yeniden sormasını istiyorum.",
  "python-orta-2":
    "Tabloya bakınca ürperdim: sütunun cinsi yazılı değilse ortalama bir yalanmış. Şimdi dolabın tamamını mutfağa dökmeyeceğim; ihtiyacım olan rafı alacağım.",
  "python-orta-3":
    "Süzgeç oturdu... ama yüzde görünce içimden «yüzde neyin yüzdesi?» geçti. Payda yoksa o sayı vitrin mankeni gibi duruyor.",
  "python-orta-4":
    "Satırlar birleşince fark ettim: yanlış anahtar sessizce şişirirmiş. Şimdi asıl veri çoğu zaman dosyada değil, kapıdaki görevlinin arkasındaki depoda duruyor.",
  "python-orta-5":
    "Parametreli sorgu deyince içim ferahladı: kimliği bağırarak söylemek yerine fiş uzatmakmış. Şimdi her sabah aynı klasörü elle açmak istemiyorum.",
  "python-orta-6":
    "Orijinal faturayı silip fotokopi bırakmamayı öğrendik. Şimdi kirli tabloyla güzel grafik çizmenin, yanlış kararın süslü hâli olduğunu görüyorum.",
  "python-orta-7":
    "Boş tutarı sıfır yapmak ortalamayı şişirirmiş... kafamda yandı. Şimdi «tamamlanma» diye bir kelime duyunca formülü sormadan geçemem.",
  "python-orta-8":
    "3D pasta n=8 iken kanıt değilmiş. Şimdi yarın aynı raporu yeniden pişirmek istiyorum; fotoğraf değil, tarif defteri.",
  "python-ileri-2":
    "Sağlık ucu ayakta... içimden «demek ki kapı fiş formatını önceden biliyormuş» geçti. Şimdi içeri giren ceyson’un şekli bozuksa kibarca reddedilsin istiyorum.",
  "python-ileri-3":
    "Şema kapıdaki görevliymiş. Şimdi her rotada veritabanı kablosu açmak mutfağı salona taşımak gibi duruyor; ortak kaynağı bir kez vermek istiyorum.",
  "python-ileri-4":
    "Garson ile mutfak ayrılınca test edilebilir oldu. Şimdi üç yavaş dış çağrıyı sırayla beklemek kuyrukta üç kez fiş kesmek gibi; aynı anda yollamak istiyorum.",
  "python-ileri-5":
    "Eşzamansız bekleyiş «başkası iş bitirsin» demekmiş. Şimdi herkese açık sağlık ucu ile kilitli kapıyı aynı anahtarla bırakmak istemiyorum.",
  "python-ileri-6":
    "Sırrı kapıya yapıştırmamak... içimde yer etti. Şimdi «hep iki yüz, içinde hata yazısı» deyince istemcinin zafer sanacağını görüyorum; kod gerçeği söylemeli.",
  "python-ileri-7":
    "Dürüst durum kodu kısa bir dilmiş. Şimdi «elle denedim, oldu» yarın kırılır; sözleşmeyi teste gömmek istiyorum.",
  "python-ileri-8":
    "422 senaryosu yokken kapıdaki bekçi uyuyormuş. Şimdi «benim makinemde çalışıyordu» cümlesini bir kutuya dondurmak istiyorum.",
  "python-ileri-9":
    "Aynı imaj her yerde aynı davranırmış. Şimdi istek düştü mü, nerede yavaşladı, diye sorunca takip numarası olmayan kargo gibi kör kalıyorum.",
  "python-ileri-10":
    "Yapısal log ve istek kimliği olmadan sürüm kör. Şimdi parçaları aynı kutuda teslim etmek istiyorum: şema, kilit, test, konteyner.",
  "ai-temel-2":
    "İçimden şunu geçirdim: kütüphane masasına sığmayan kitap yığını gibiymiş o pencere; şimdi masaya ne yazacağımı, kimin talimatı, kimin isteği, tabağın nasıl duracağını ayrı kâğıtlara ayırmak istiyorum.",
  "ai-temel-3":
    "Kafamda oturdu: tarif üç katmanlıymış. Şimdi serbest cümle güzel okunuyor ama gişedeki tutar gibi alan adı yoksa makine neyi tartacağını bilemiyor.",
  "ai-temel-4":
    "Noter formundaki boş kutu... içimde yer etti. Şimdi terzi önce küçük parça dikermiş; modele de «böyle girdi, böyle çıktı» göstermeden ölçü almamak istiyorum.",
  "ai-temel-5":
    "Örnek üçlüsü davranışı sabitliyormuş. Şimdi kimlik fotokopisini sohbete yapıştırmak, hastane kapısında evrak dağıtmak gibi duruyor; sır tarife girmesin.",
  "ai-temel-6":
    "Sır ve kişisel kayıt tarife girmeyince ferahladım. Şimdi gişede «üç» deyince çöken değil, kibarca yeniden soran bir tarif defteri istiyorum.",
  "ai-orta-2":
    "Arşivde dosyayı bulmadan rapor yazmamak... kafamda yandı. Şimdi uzun romanı tek cümleye sıkıştırmak istemiyorum; cümle ortadan bölünmesin.",
  "ai-orta-3":
    "Örtüşme tamponu cümleyi kurtarıyormuş. Şimdi iki cümle farklı kelimeyle aynı mahalledeyse kuş uçuşu mesafeyi sayıya dökmek istiyorum.",
  "ai-orta-4":
    "Anlamın sayı dizisi olduğunu görünce ürperdim. Şimdi o sayıları dağınık kâğıda saçmak istemiyorum; kütüphane kart indeksine yazmak istiyorum.",
  "ai-orta-5":
    "Kart indeksine numara yapıştırmak... içimde yer etti. Şimdi «en yakın beş» deyince beşincinin alakasız olabileceğini görüyorum; eşik olmadan raftan kitap çekilmez.",
  "ai-orta-6":
    "Dipnotsuz iddia tez sayılmıyormuş. Şimdi mutfak hattını karıştırmak istemiyorum: önce doğrama, sonra pişirme.",
  "ai-orta-7":
    "Sıra sözleşmesi oturdu. Şimdi avukatın dayanaksız karar uydurması gibi güzel cümle görüyorum; kaynak yoksa manşet güvenmez.",
  "ai-orta-8":
    "«Belgede yok» dürüst cevabı... kafamda oturdu. Şimdi arşiv memurunun evrak numarasıyla konuşmasını uçtan uca masaya kurmak istiyorum.",
  "ai-ileri-2":
    "Bankamatik kaydı olmadan «para verdim» denmezmiş. Şimdi modelin bir kez yazıp bitmesini değil, musluğu açıp kontrol eden tamirci gibi düşünüp araç çağırıp bakmasını istiyorum.",
  "ai-ileri-3":
    "Gözlemsiz «conta değişti» yalanmış. Şimdi tek sohbet cebine her şeyi tıkmak istemiyorum; bugünün listesi ayrı, geçen yılın dolabı ayrı dursun.",
  "ai-ileri-4":
    "Günlük defter ile arşiv dolabı ayrılınca ferahladım. Şimdi if-else spagetti istemiyorum; metro haritasında aktarma gibi çizilsin.",
  "ai-ileri-5":
    "Aktarma istasyonu yazılıymış. Şimdi tek kişi hem muhabir hem editör olunca kalite düşüyor; gazete odasında masalar ayrı dursun.",
  "ai-ileri-6":
    "Muhabir, editör, korrektör... kafamda oturdu. Şimdi iki ajan «anlaştık» yazıp veri uyuşmazsa limanda numarasız konteyner gibi durur; el sıkışma yazılı olsun.",
  "ai-ileri-7":
    "Konteyner numarası standardı... içimde yer etti. Şimdi imzasız çek keser gibi silme aracını otomatik çalıştırmak istemiyorum; onam formu durmadan müdahale yok.",
  "ai-ileri-8":
    "Onam kapısı fiziksel turnikeymiş. Şimdi «daha akıllı oldu» cümlesi ölçü değil; kalkış öncesi liste kırmızıysa uçak kalkmaz.",
  "ai-ileri-9":
    "Altın küme kırılınca sürüm duruyormuş. Şimdi taksi fişinde kilometre yazmayan yolculuk kayıt değil; iz, maliyet ve gecikme görünsün.",
  "ai-ileri-10":
    "Fişsiz yolculuk kör uçuşmuş. Şimdi parçaları ayrı çalmak istemiyorum; senfoni partisyonu gibi şema, değerlendirme ve iz aynı kutuda dursun.",
  "fullstack-temel-2":
    "İçimden şunu geçirdim: restoran fişi dönmeden «yemek geldi» denmezmiş. Şimdi o fişteki «üç» yazısı ile üç porsiyonun aynı şey olup olmadığını merak ediyorum — etiketsiz kavanozu karıştırmak istemiyorum.",
  "fullstack-temel-3":
    "Kafamda oturdu: «üç» yazısı sayı değilmiş. Şimdi menüde çorba yazıp mutfağa sütlaç gitmesini istemiyorum; derleme kapısı tarifi önceden mühürlesin.",
  "fullstack-temel-4":
    "Menü yazılıysa aşçı uydurmazmış... içimde yer etti. Şimdi garsonun salona hem «pişiyor» hem «afiyet» diye bağırmasını istemiyorum; tabağa bakmadan hazır denmesin.",
  "fullstack-temel-5":
    "Salon yalan söylemeyince ferahladım. Şimdi kargo takip numarası «yolda» iken «teslim edildi» yazmak istemiyorum; durum kodu okunmadan poşet yok.",
  "fullstack-temel-6":
    "Takip numarası konuşunca ürperdim: sahte yeşil toast kör kasanın alkışıymış. Şimdi barkod, adet ve fiş aynı masada dursun; üçü yoksa satış yok.",
  "fullstack-orta-2":
    "Menü kartı kendi fiyatını uydurmazmış. Şimdi aynı masada hem «ödeme alındı» hem «kart reddedildi» fişi görünce ürperiyorum — kavşakta iki ışık birden yanmasın.",
  "fullstack-orta-3":
    "İki fiş aynı anda kasa yalanıymış... kafamda yandı. Şimdi siparişin tek kutuda durmasını istiyorum: boş masa, alındı, pişti, iptal — ikisi birden değil.",
  "fullstack-orta-4":
    "Tek fiş, tek cümle... içimde yer etti. Şimdi üçüncü satırı silince mercimek çorbasının «üç» olup kaybolmasını istemiyorum; kimlik barkod olsun, sıra numarası değil.",
  "fullstack-orta-5":
    "Barkod konuşunca ferahladım. Şimdi bütün salonu tek hoparlörden yönetmek istemiyorum; her kaşığın sesi megafona düşmesin.",
  "fullstack-orta-6":
    "Hoparlör her tuşa bağlanınca gürültüymüş. Şimdi iki kargonun aynı kapıya gidip eski etiketin yeniyi ezmesini istemiyorum; geç kurye yeni fişi yırtmasın.",
  "fullstack-orta-7":
    "Geç gelen kurye tabela yalanıymış. Şimdi «ben aşağıdayım» demenin bilet olmadığını görüyorum; masa numarası adreste yazılı dursun.",
  "fullstack-orta-8":
    "Harita durunca içim ferahladı. Şimdi kasada fiş basılmadan poşet vermek istemiyorum; turnike açılmadan platforma inmek yolculuk sayılmasın.",
  "fullstack-ileri-2":
    "Mutfakta sıra varmış: fiş önce, ocak sonra. Şimdi eksik sipariş karalamasının tencereye girmesini istemiyorum; görevli şüphede reddetsin.",
  "fullstack-ileri-3":
    "Şema kapıdaki görevliymiş. Şimdi tarife soğanı cümleyle yapıştırmak istemiyorum; malzeme ayrı, komut ayrı — fiş uzatılsın, bağırılmasın.",
  "fullstack-ileri-4":
    "Parametreli sorgu turnike kartıymış. Şimdi hesabı mutfak tezgâhında kesmek istemiyorum; aşçı hem pişirip hem kasa basmasın.",
  "fullstack-ileri-5":
    "Kasa ile ocak ayrılınca düzen geldi. Şimdi «bilet kes» fiilini gişe tabelasına yazmak istemiyorum; gişe adres, işlem fiil dursun.",
  "fullstack-ileri-6":
    "Harita oturunca ürperdim: her şeyi «bir şey yap» gişesine yığmak sokak uydurmakmış. Şimdi mutfağa «ben personelim» sözüyle girmek istemiyorum; turnike kart istesin.",
  "fullstack-ileri-7":
    "Kart yoksa platform yokmuş. Şimdi beş yüzde «tamam» basmanın boş kasayı alkışlamak olduğunu görüyorum; fiş yoksa satış yok densin.",
  "fullstack-ileri-8":
    "Dürüst hata kısa bir dilmiş. Şimdi ödeme alınıp stok düşmeyince defterin yarıda kaldığını görüyorum; iki yazma ya hep ya hiç geçsin.",
  "fullstack-ileri-9":
    "Poşet gitti raf yalan söyledi... kafamda oturdu. Şimdi «elle denedim, oldu» demek istemiyorum; her sabah aynı kartla turnike tatbikatı olsun.",
  "fullstack-ileri-10":
    "Tatbikat yoksa çıkış yokmuş. Şimdi kasa, stok ve fişi aynı defterde kapatmak istiyorum; alkış koli sayılmasın, test yeşil olmadan «sattık» denmesin.",
  "devops-temel-2":
    "İçimden şunu geçirdim: santral odası ısınmış, kiralık deponun kapısı bina sahibininmiş — ama raftaki kasanın kilidi hâlâ bende. Şimdi o kasayı etiketsiz kavanoz gibi açmak istemiyorum; yol ve izin yazılı dursun.",
  "devops-temel-3":
    "Kafamda oturdu: ev anahtarı ile kasa anahtarı ayrıymış. Şimdi ışıklar yanarken tezgâhın boş olabileceğini görüyorum; vardiya defteri olmadan «hat ayakta» demek istemiyorum.",
  "devops-temel-4":
    "Defter konuşunca ferahladım. Şimdi nöbetçi kulübesinde yanlış daire açılmasını istemiyorum; isim çözülmeden, kapı numarası bilinmeden zil çalınmasın.",
  "devops-temel-5":
    "Zil doğru dairedeymiş... içimde yer etti. Şimdi kiralık kasanın yedek anahtarını cafe panosuna asmak istemiyorum; kopya çoğalsın, sahiplik kaybolmasın.",
  "devops-temel-6":
    "Anahtar kimin elinde belli olunca ürperdim: panoya asılan demir envanter değilmiş. Şimdi depo sayımında raf, kilit tipi ve sorumlu isim yazılmadan «sunucu var» demek istemiyorum.",
  "devops-orta-2":
    "Paylaşımlı ofiste duvar yokmuş... içimden şunu geçirdim: komşunun musluğu patlayınca halım da ıslanırmış. Şimdi tarif defterine kasa şifresi yazmak istemiyorum; tarif çoğalınca şifre de çoğalır.",
  "devops-orta-3":
    "Kasa şifresi tarife girmeyince ferahladım. Şimdi fabrika bant hattında her istasyonun «ben hazırım» demesini istemiyorum; orkestra partisyonu tempo tutsun.",
  "devops-orta-4":
    "Partisyon oturdu. Şimdi markette «süt» yazan mühürsüz koliyi rafa koymak istemiyorum; parti numarası ve barkod olmadan paket tanınmasın.",
  "devops-orta-5":
    "Barkodsuz koli iade edilirmiş... kafamda yandı. Şimdi uçak check-list’inde kırmızı madde varken kalkışa geçmek istemiyorum; yangın kapısı açıkken bant çalışmasın.",
  "devops-orta-6":
    "Kırmızı madde kalkış izni değilmiş. Şimdi geri vitessiz arabayla viraja girmek istemiyorum; asansör bakım kapağından kaçak inilmesin.",
  "devops-orta-7":
    "Geri vites yazılıınca içim ferahladı. Şimdi trafik ışığının hep yeşil yanmasını emniyet sanmak istemiyorum; sensör bozulmuş olabilir.",
  "devops-orta-8":
    "Hep yeşil yanan lamba kör kavşakmış. Şimdi kalite istasyonu atlanmış koliyi kamyona yüklemek istemiyorum; fiş, mühür ve geri vites birlikte dursun.",
  "devops-ileri-2":
    "Sigorta listesi olmadan kilit seçmek vitrin süsüymüş. Şimdi kiralık kasanın şifresini sohbet grubuna yazmak istemiyorum; kopya çoğalsın, iptal zorlaşmasın.",
  "devops-ileri-3":
    "Pano şifresi kasa değilmiş... içimde yer etti. Şimdi gıda etiketinde alerjen yokken «tattım, bir şey olmadı» diye sevk etmek istemiyorum.",
  "devops-ileri-4":
    "Alerjen sarıya boyanınca etiket yalanmış. Şimdi otel oda kartını resepsiyonda herkese dağıtmak istemiyorum; süre bitince kart ölsün.",
  "devops-ileri-5":
    "Lobi anahtarı her odaya açılmazmış. Şimdi hastanede ziyaretçi holü ile ameliyathaneyi aynı kapıdan sokmak istemiyorum; yangın kapısı her koridoru açmasın.",
  "devops-ileri-6":
    "Steril koridor ayrıymış... kafamda oturdu. Şimdi yangın afişi asıp tatbikat tutanağı istemeden «uyumluyuz» demek istemiyorum; tarih ve imza şart.",
  "devops-ileri-7":
    "Afiş imza yerine geçmiyormuş. Şimdi nüfus cüzdanı fotokopisini her masaya bırakmak istemiyorum; kopya da sicile yazılsın.",
  "devops-ileri-8":
    "Fotokopi çekmecede unutulmazmış. Şimdi yangında herkesin kendi merdiveninden koşmasını istemiyorum; önce alarm, sonra hasar — tek kanal.",
  "devops-ileri-9":
    "Talimat yoksa merdiven uydurulurmuş. Şimdi ruhsatsız ek katı «zaten duruyor» diye kalıcı saymak istemiyorum; imar planı tıklamayla delinmesin.",
  "devops-ileri-10":
    "Ruhsatsız kat iskan değilmiş. Şimdi proje var yangın tutanağı yokken «üretime hazır» demek istemiyorum; iskan dosyası birlikte kapansın.",
  "flutter-temel-2":
    "İçimden şunu geçirdim: kargo adresini boş bırakmak koliyi kapıda bırakırmış. Şimdi o etiketi Lego tuğlasına yazmak istiyorum; çivi sayısı belirsiz tuğla takılmaz.",
  "flutter-temel-3":
    "Kafamda oturdu: fonksiyon tuğlanın çivi sayısıymış. Şimdi tuğlaları ev sanmak istemiyorum; kat planı ile boyalı duvar ayrı dursun.",
  "flutter-temel-4":
    "Plan ile şantiye ayrılınca ferahladım. Şimdi asansör kat yazısı ile tuş takımını aynı şey sanmak istemiyorum; tabela durağan, tuş her basışta değişir.",
  "flutter-temel-5":
    "Tuş takımı yerel durummuş... içimde yer etti. Şimdi kamyon lastiğini oturma odasına sıkıştırıp gizlemek istemiyorum; kapı ölçüsü kısıttır.",
  "flutter-temel-6":
    "Sarı-siyah şerit yalan değilmiş. Şimdi vitrin mankenini askısız, etiketsiz giydirmek istemiyorum; iskelet, tema ve sayaçlı stok birlikte dursun.",
  "flutter-orta-2":
    "Tek termostat evin gerçeğiymiş. Şimdi her odanın kendi jeneratörünü taşımasını istemiyorum; kat panosundan beslensin, kablo ormanı olmasın.",
  "flutter-orta-3":
    "Pano konuşunca ferahladım. Şimdi trende hem yeşil hem kırmızı yanmasını istemiyorum; tek ışık, tek cümle — iki gerçeklik durmasın.",
  "flutter-orta-4":
    "Tek ışık tek cümleymiş... kafamda yandı. Şimdi kargo paketini etiketsiz yola çıkarmak istemiyorum; koliye ne konduğu yazılı dursun.",
  "flutter-orta-5":
    "Etiket konuşunca ürperdim: barkodsuz «geldi» sahte yeşilmiş. Şimdi vitrinde «yok» ile «depo yandı»yı aynı tabelaya yazmak istemiyorum.",
  "flutter-orta-6":
    "İki tabela ayrı dürüstlükmüş. Şimdi yerel hafıza kartına hem buzdolabı notu hem kasa şifresi yazmak istemiyorum; çekmece karışmasın.",
  "flutter-orta-7":
    "Not ile anahtar ayrılınca içim ferahladı. Şimdi ev arşivini etiketsiz yığın sanmak istemiyorum; klasör, tarih ve göç yolu yazılı dursun.",
  "flutter-orta-8":
    "Arşiv sürümlüymüş... içimde yer etti. Şimdi spor salonu kartında giriş kaydı, dolap notu ve kasa anahtarını tek cüzdana tıkmak istemiyorum; üçü ayrı dursun.",
  "flutter-ileri-2":
    "İki dil konuşan tercüman sözlüğü bilmezse «anladım» yalanmış. Şimdi her yerel ihtiyacı uygulama deposuna yapıştırmak istemiyorum; yedek parça kataloğu olsun.",
  "flutter-ileri-3":
    "Standart arayüz yedek parçaymış. Şimdi sahne kostümü ile gala kıyafetini aynı askıya asmak istemiyorum; yanlış geceye çıkılmasın.",
  "flutter-ileri-4":
    "Askı karışınca gece bozulurmuş. Şimdi fabrika bandında ölçü kontrolü atlanmış koliyi kamyona yüklemek istemiyorum; «benim makinemde yeşil» sevk değil.",
  "flutter-ileri-5":
    "Kırmızı madde kalkış izni değilmiş. Şimdi noter mührünü sohbet grubuna atmak istemiyorum; mühür kaybolursa aynı dükkân tabelası yenilenmez.",
  "flutter-ileri-6":
    "Mühür kimlikmiş... kafamda oturdu. Şimdi pasaportu vizesiz, mühürsüz gümrüğe sürmek istemiyorum; üçü birden dursun.",
  "flutter-ileri-7":
    "Pasaport, vize, mühür üçlüymüş. Şimdi vitrin etiketini depodan kopuk asmak istemiyorum; müfettiş raftan indirir.",
  "flutter-ileri-8":
    "Etiket depo ile konuşunca ferahladım. Şimdi gümrük beyannamesinde çantadakini gizleyip «geçer» demek istemiyorum; formda ne varsa çantada o dursun.",
  "flutter-ileri-9":
    "Beyanname çantaymış. Şimdi kara kutusu olmayan uçağı «uçtuk bitti» sanmak istemiyorum; çöküş kaydı ve uzaktan kapatma dursun.",
  "flutter-ileri-10":
    "Kara kutu spekülasyonu kesermiş. Şimdi gemi motoru çalışıyor diye limanı terk etmek istemiyorum; can yeleği ve manifesto da checklist’te dursun.",
  "sec-temel-2":
    "İçimden şunu geçirdim: bina girişindeki turnike kartsız açılmıyormuş. Şimdi mühürlü zarfın üzerindeki kapı numarasını daire sanmak istemiyorum; numara açık olsa da kilit ayrı.",
  "sec-temel-3":
    "Kafamda oturdu: port kapı numarasıymış, servis ayrı doğrulanırmış. Şimdi çilingir muayenesinde yalnız kilit markasına bakmak istemiyorum; kim anahtar taşıyor, deftere yazılı mı.",
  "sec-temel-4":
    "Ziyaretçi defteri durunca ferahladım. Şimdi vitrinden bakmayı depoya el uzatmak sanmak istemiyorum; cam herkese açık, depo kapısı ayrı izin ister.",
  "sec-temel-5":
    "Vitrin okununca ürperdim: kaynak yazılmayan not spekülasyonmuş. Şimdi yangın tatbikatı iznini gerçek binada siren sanmak istemiyorum; tatbikat ayrı ruhsattır.",
  "sec-temel-6":
    "Tatbikat izni oturdu... içimde yer etti. Şimdi ev güvenlik turunda kapı-pencere yazmadan «bitti» demek istemiyorum; kırıcı alet çantası tur malzemesi değil.",
  "sec-orta-2":
    "Yangın denetçisi kibrit yakmıyormuş. Şimdi market rafında etiketsiz ürünü «bir şeyler var» deyip geçmek istemiyorum; önce en sık ölümcül sınıf yazılsın.",
  "sec-orta-3":
    "Raf etiketi konuşunca ferahladım. Şimdi formdaki adı muhasebe fişine ham yapıştırmak istemiyorum; şablon yoksa defter bozulur.",
  "sec-orta-4":
    "Fiş kalıbı durunca ürperdim: dizgi birleştirme sorgu değilmiş. Şimdi mektubu zarfa koymadan sahneye mikrofonla okutmak istemiyorum; ham metin aktör sokar.",
  "sec-orta-5":
    "Kaçış oturunca içim yandı: asıl savaş çıktıdaymış. Şimdi otel kartını «verdim» deyip defteri tutmamak istemiyorum; süre, iptal, kopya ayrı dursun.",
  "sec-orta-6":
    "Kart dürüstmüş... kafamda oturdu. Şimdi oda numarasını bilmeyi anahtar sanmak istemiyorum; kilitli kasanın kombinasyonu duvarda yazılıysa kasa açık sayılır.",
  "sec-orta-7":
    "Numara anahtar değilmiş. Şimdi çelik kasayı övüp anahtarı paspasın altında bırakmak istemiyorum; varsayılan yönetici o paspastır.",
  "sec-orta-8":
    "Paspas konuşunca ferahladım. Şimdi gemi denetiminde «delik var» deyip termin yazmamak istemiyorum; risk, sorumlu ve yeniden test birlikte dursun.",
  "sec-ileri-2":
    "Dosya dolabı ile depo koridoru ayrıymış. Şimdi emniyet kemerini «nasıl patlatırım» diye öğrenmek istemiyorum; kaza raporu ve koruma konuşulsun, silah değil.",
  "sec-ileri-3":
    "Kaza sınıfı yazılıymış... içimde yer etti. Şimdi kapalı kutuyu başkasının kasasında izinsiz açmak istemiyorum; röntgen yetkili laboratuvarda çekilir.",
  "sec-ileri-4":
    "Röntgen durunca ferahladım. Şimdi tehlikeli kimyasalı mutfak tezgâhında denemek istemiyorum; çeker ocak, anlık görüntü ve ağ kesik dursun.",
  "sec-ileri-5":
    "Ocak güvenliymiş. Şimdi bir daire yanınca tüm bloğu alev sanmak istemiyorum; yangın kapısı her koridoru açmasın, turnike her kata aynı kartı vermesin.",
  "sec-ileri-6":
    "Yangın kapısı oturdu. Şimdi stajyer kartıyla müdür odasına «ben personelim» deyip girmek istemiyorum; rozet okunur, kapı tasarımı yazılır.",
  "sec-ileri-7":
    "Rozet dürüstmüş... kafamda yandı. Şimdi fabrika kamerası kaydı silinince olayı bitmiş saymak istemiyorum; nöbet defteri ve gösterge birlikte dursun.",
  "sec-ileri-8":
    "Kamera konuşunca ferahladım. Şimdi yangın tatbikatında alkış toplayıp kaçış süresini ölçmemek istemiyorum; kırmızı ve mavi aynı hipotezi sayıya döksün.",
  "sec-ileri-9":
    "Tatbikat skoru duruyormuş. Şimdi köprü çatlağını büyüterek denemek istemiyorum; sınıf, trafik kısıtı ve onarım sırası yazılsın, kavram kanıtı silah olmasın.",
  "sec-ileri-10":
    "Çatlak sınıflıymış. Şimdi afet tatbikatı bitince kahramanlık videosunu teslim saymak istemiyorum; tespit, yama ve mühürlü ek birlikte kapansın.",
  "db-temel-2":
    "İçimden şunu geçirdim: kütüphane kartı yokken raftan kitap çıkmıyormuş. Şimdi aynı vatandaşın adresini on klasöre yapıştırmak istemiyorum; arşiv odasında tek sicil dursun.",
  "db-temel-3":
    "Kafamda oturdu: on faturaya aynı adresi yazmak arşivi şişirirmiş. Şimdi harita kağıtta kalırsa motorun tapuyu tanımayacağını görüyorum; noter defterine sınır maddesi yazılsın.",
  "db-temel-4":
    "Sınır maddesi durunca ferahladım. Şimdi iki klasörü vatandaş numarası olmadan üst üste koymak istemiyorum; ortak anahtar yoksa rapor çapraz çarpım olur.",
  "db-temel-5":
    "Klasörler birleşince ürperdim: yıldızlı seçim bütün arşivi fotokopilemekmiş. Şimdi gişede gönderen düşüp alıcı artmazsa paranın havada kalmasını istemiyorum; iki yazma ya hep ya hiç.",
  "db-temel-6":
    "Havale yarım kalmayınca içim ferahladı. Şimdi süpermarket kasasının fiş basmadan poşet vermesini istemiyorum; şema, sorgu ve geri alma birlikte dursun.",
  "db-orta-2":
    "İçimden şunu geçirdim: haritasız «yol ekleyelim» kör kazmaymış. Şimdi her kelimeye ayrı kütüphane fişi basmak istemiyorum; rafta yer kalmaz, ekleme yavaşlar.",
  "db-orta-3":
    "Kafamda oturdu: seçiciliği düşük sütuna dizin, yazmayı yakarmış. Şimdi tüm arşivi indeklemek istemiyorum; yalnız açık dosyalar için ayrı klasör açılsın.",
  "db-orta-4":
    "Sıcak klasör durunca ferahladım. Şimdi dünkü kaza yazılmamış haritayla viraj kesmek istemiyorum; bayat istatistik yanlış sokağa saptırır.",
  "db-orta-5":
    "Harita bayatsa güzergâh yalanmış... içimde yer etti. Şimdi depoda boş kutuları bırakıp forklifti suçlamak istemiyorum; koridor toplanmadan bant yavaşlar.",
  "db-orta-6":
    "Boş kutu koridoru tıkarmış. Şimdi her müşteri için yeni kasa açmak istemiyorum; süpermarket ortak banttır, her fiş yeni gişe doğurmaz.",
  "db-orta-7":
    "Ortak filo oturunca ürperdim: parametresiz sorgu hem yavaş hem delikmiş. Şimdi iki kişinin iki kapıdan ters geçmesini sonsuza bırakmak istemiyorum; kilitlenme zaman aşımı ister.",
  "db-orta-8":
    "İki kapı konuşunca ferahladım. Şimdi kronometresiz pit stop’u rekor saymak istemiyorum; lastik (dizin) ve yakıt (istatistik) ayrı ölçülsün.",
  "db-ileri-2":
    "İçimden şunu geçirdim: bankamatik açıkken defter kopuksa bakiye yalan söylermiş. Şimdi vitrindeki fiyat etiketini depo fiyatı sanmak istemiyorum; etiket yenilenmezse müşteri yanılır.",
  "db-ileri-3":
    "Etiket konuşunca ferahladım. Şimdi mesaj panosuna asılan anonsu noter fişi sanmak istemiyorum; dinleyen yoksa megafon kaybolur.",
  "db-ileri-4":
    "Pano anonsu kalıcı değilmiş... kafamda yandı. Şimdi zarfın içinde fiş dururken etiket yapıştırmadan arşivi karıştırmak istemiyorum; belge dizinsiz kaybolur.",
  "db-ileri-5":
    "Zarf etiketliymiş. Şimdi tüm evi tek çantaya tıkmak istemiyorum; müşteri kartı ayrı dosyada, kalemler fişte dursun.",
  "db-ileri-6":
    "Çanta yırtılmadan ev sığmazmış. Şimdi koli anahtarsız tek banda yığmak istemiyorum; hızlı kargo dağıtım merkezinde barkod hangi kutuya gideceğini söyler.",
  "db-ileri-7":
    "Bant ve barkod oturunca ürperdim: boş anahtar tek bölüme yığarmış. Şimdi noter defterine işlenmeden mektubu postaya vermek istemiyorum; çift yazım yarım senet üretir.",
  "db-ileri-8":
    "Mektup mühürlenince ferahladım. Şimdi aynı kargo barkodunu iki kez okutup ikinci teslim saymak istemiyorum; poşet bir kez kapıya bırakılır.",
  "db-ileri-9":
    "İkinci okuma teslim değilmiş... içimde yer etti. Şimdi kuyruk uzamışken «boru çalışıyor» demek istemiyorum; yanlış adrese hızlı dağıtım nabız sayılmaz.",
  "db-ileri-10":
    "Gecikme ölçülünce içim yandı: sıfır kuyruk yanlış kapıyı örtmezmiş. Şimdi tezgâh, bant ve vitrin ayrı düşerken «konuya mesaj gitti» demek istemiyorum; üçü aynı sipariş numarasını konuşsun.",
  "pm-temel-2":
    "İçimden şunu geçirdim: sipariş listesi kimin elinde belli değilse aynı tabak üç kez pişermiş. Şimdi çaydanlık taşınca «yeni tencere» demek istemiyorum; ocak ıslanması önce yazılı dursun.",
  "pm-temel-3":
    "Kafamda oturdu: çözüm cümlesi problem değilmiş. Şimdi düğün menüsünde herkes «her şeyi istiyorum» deyince sipariş vermek istemiyorum; olmazsa olmaz yazılı dursun.",
  "pm-temel-4":
    "Menü konuşunca ferahladım. Şimdi pazarda «bir şeyler» deyip tartıya bakmak istemiyorum; iki kilo domates, salça için — fiş durur.",
  "pm-temel-5":
    "Fiş konuşunca ürperdim: teknik görev hikâye değilmiş. Şimdi terzi «güzel duruyor» deyince elbise bitti sanmak istemiyorum; bel, boy, düğme işaretlensin.",
  "pm-temel-6":
    "Ölçü konuşunca içim yandı: mutluluk cümlesi kabul ölçütü değilmiş. Şimdi davetiye fotoğrafını menü, oturma ve alışveriş listesi sanmak istemiyorum; brif sözleşmeye dönsün.",
  "pm-orta-2":
    "İçimden şunu geçirdim: fabrika üretim panosuna «çevik olduk» afişi asmak hattı değiştirmiyormuş. Şimdi hakem, teknik direktör ve oyuncu yeleği değişince skor kimin, diye sormadan yelek dağıtmak istemiyorum.",
  "pm-orta-3":
    "Kafamda oturdu: yelek sahayı yönetmiyormuş. Şimdi mahalle maçında düdük çalmadan süre tutmak istemiyorum; plan, mola, skor ve soyunma odası ayrı dursun.",
  "pm-orta-4":
    "Düdük konuşunca ferahladım. Şimdi fırından ekmek alırken maya ve poşeti atlamak istemiyorum; tezgâha çıkmadan hazır, müşteriye vermeden bitti.",
  "pm-orta-5":
    "Kapı konuşunca ürperdim: «beğendi» damgası bitti değilmiş. Şimdi döner tezgâhında üç şişi birden yakıp hız sanmak istemiyorum; şiş doluyken yenisi ateşe gitmesin.",
  "pm-orta-6":
    "Tezgâh konuşunca içim yandı: limitsiz pano dekorasyonmuş. Şimdi kargo takip numarasını her kutuya «kutu» yazmak istemiyorum; sevkiyat, paket, etiket ayrı durur.",
  "pm-orta-7":
    "Barkod konuşunca ferahladım. Şimdi market tartısında eli basılı tutup kilo yeşil görünce torbayı tam sanmak istemiyorum; el tartıya basılmaz.",
  "pm-orta-8":
    "Tartı konuşunca kafamda oturdu: yeşil grafik dürüst iş değilmiş. Şimdi düğün gününde nikâh, yemek ve pastayı üç kapıda birden başlatmak istemiyorum; sıra yazılı dursun.",
  "pm-ileri-2":
    "İçimden şunu geçirdim: yol haritası pusulası olmadan «kalabalıktık» demek rota değilmiş. Şimdi vitrin ışığı yanıyor diye mağazayı kârlı sanmak istemiyorum; kaç tabak satıldı sorulsun.",
  "pm-ileri-3":
    "Kafamda oturdu: ışık kasa fişi değilmiş. Şimdi «formda kalayım» deyip ayakkabı almayı kilometre sanmak istemiyorum; süre düşsün, hazırlık anahtar sonuç olmasın.",
  "pm-ileri-4":
    "Kilometre konuşunca ferahladım. Şimdi pusulasız gemide her rüzgârı doğru yön sanmak istemiyorum; tek kuzey yıldızı, yan rüzgâr ayrı yazılsın.",
  "pm-ileri-5":
    "İbre konuşunca ürperdim: broşür yıldız değilmiş. Şimdi çayı üç dakika demlemeden «acı düştü» ilan etmek istemiyorum; tarif, süre ve eşik laboratuvarda dursun.",
  "pm-ileri-6":
    "Tarif konuşunca içim yandı: hissiyat zafer değilmiş. Şimdi kör tadımda «şu köşedeki daha güzel» diye bardak seçmek istemiyorum; etiket kör, ölçü yazılı olsun.",
  "pm-ileri-7":
    "Kör tadım durunca ferahladım. Şimdi düdüklüde basınç yükselince «biraz daha pişsin» demek istemiyorum; vana tartışmayı beklemez.",
  "pm-ileri-8":
    "Vana konuşunca ürperdim: yeşil birincil metrik kör uçuşmuş. Şimdi maç istatistiğinde toplam golü ilk yarı sanmak istemiyorum; kırılım yazılı dursun.",
  "pm-ileri-9":
    "Kırılım konuşunca kafamda oturdu: karışık toplam taktik vermiyormuş. Şimdi «o zaman şöyle demiştik» sözünü düğün defteri sanmak istemiyorum; kim neye imza attı belirsiz kalmasın.",
  "pm-ileri-10":
    "Defter konuşunca içim yandı: sohbet kaydı hafıza değilmiş. Şimdi yolculukta yalnız harita fotoğrafıyla yola çıkmak istemiyorum; varış, kilometre, lastik ve yağmur molası birlikte dursun.",
  "ux-temel-2":
    "İçimden şunu geçirdim: restoran menüsünü boyamak mutfağı açmıyormuş. Şimdi pazarda kimseye sormadan «herkes bunu ister» demek istemiyorum; tezgâh kurulmadan önce kulak verilsin.",
  "ux-temel-3":
    "Kafamda oturdu: menüyü okumak, mutfağı izlemek, şefle konuşmak ayrı kanıtmış. Şimdi haritasız turda «herkes eğlenir» demek istemiyorum; yolcu ve durak yazılı dursun.",
  "ux-temel-4":
    "Harita konuşunca ferahladım. Şimdi restoran menüsünde kırk yemeği «her şey var» sanmak istemiyorum; müşteri çorbayı arar, üretim hattı kodunu değil.",
  "ux-temel-5":
    "Reyon etiketi durunca ürperdim: org şeması menü değilmiş. Şimdi mimari taslak durmadan duvar rengi seçmek istemiyorum; kroki yokken perde kumaşı konuşulmaz.",
  "ux-temel-6":
    "Taslak konuşunca içim ferahladı. Şimdi marangoz tezgâhında vidaları savurmak istemiyorum; çerçeve, otomatik yerleşim ve bileşen kutuda dursun.",
  "ux-temel-7":
    "Kutu konuşunca kafamda yandı: serbest çizim sistem değilmiş. Şimdi tarifsiz, kişisiz, krosisiz mutfak fotoğrafını teslim sanmak istemiyorum; brif, persona ve tel çerçeve birlikte dursun.",
  "ux-orta-2":
    "Kavşakta her tabela neon yanınca sürücü kaybolurmuş. Şimdi yol tabelası okunmuyorken güzel yazı tipine güvenmek istemiyorum; sürücü kaçırırsa font suçludur.",
  "ux-orta-3":
    "Tabela konuşunca ferahladım. Şimdi kapı kolunun kilitli, aralık ve açık halini tek fotoğraf sanmak istemiyorum; her durum ayrı hissedilsin.",
  "ux-orta-4":
    "Kol konuşunca ürperdim: dikdörtgen düğme değilmiş. Şimdi fabrika kalıp makinesi her parçayı ayrı milimle kesince seri üretim sanmak istemiyorum; jeton tek kalıptır.",
  "ux-orta-5":
    "Kalıp konuşunca içim yandı: yakından seçilen mavi sistem değilmiş. Şimdi her sabah ayrı terziden gömlek dikip üniforma demek istemiyorum; kütüphane tek settir.",
  "ux-orta-6":
    "Üniforma durunca ferahladım. Şimdi prova sahnesinde kapı bilinmeden ışık gösterisi açmak istemiyorum; oyuncu hangi kapıdan çıkar yazılı dursun.",
  "ux-orta-7":
    "Kapı konuşunca ürperdim: durağan maket tıklama değilmiş. Şimdi yalnız merdivenli binayı modern sanmak istemiyorum; asansör yoksa herkes çıkamaz.",
  "ux-orta-8":
    "Asansör konuşunca kafamda oturdu: güzel görünmek kapı açmazmış. Şimdi bıçak, tahta ve ölçüyü ayrı markadan alıp mutfak seti demek istemiyorum; ızgara, jeton ve prototip aynı rafta dursun.",
  "ux-ileri-2":
    "Marangoz teslim tutanağı olmadan «mobilya bitti» yalanmış. Şimdi orkestrada kemanın başka nota çalmasını «yakın yeter» sanmak istemiyorum; partisyon birebir dursun.",
  "ux-ileri-3":
    "Nota sapınca parça bozulurmuş. Şimdi üç bacaklı fişi iki deliğe uydurmak istemiyorum; React sözleşmesi Figma varyantıyla aynı priz olsun.",
  "ux-ileri-4":
    "Priz konuşunca ferahladım. Şimdi her tarif «bir tutam» deyince yemeğin yarın aynı çıkacağını sanmak istemiyorum; Tailwind jeton ölçeğine bağlı dursun.",
  "ux-ileri-5":
    "Tutam ölçü değilmiş... içimde yer etti. Şimdi kat yeri belli olmayan haritayı cebe tıkmak istemiyorum; kırılım yazılı, sıkıştırılmış masaüstü mobil sayılmaz.",
  "ux-ileri-6":
    "Kat yeri konuşunca ürperdim. Şimdi asansör düğmesini yüksekte ve kabartmasız bırakıp «bina modern» demek istemiyorum; klavye ve odak tutamaktır.",
  "ux-ileri-7":
    "Tutamak durunca ferahladım. Şimdi laboratuvar test odasında senaryo yokken «denedik, beğendiler» demek istemiyorum; görev ve tutanak yazılsın.",
  "ux-ileri-8":
    "Senaryo konuşunca kafamda yandı: beğeni test değilmiş. Şimdi baraj notu yazılmamış sınavda «geçti» ilan etmek istemiyorum; Sistem Kullanılabilirlik Ölçeği eşik ister.",
  "ux-ileri-9":
    "Baraj durunca içim ferahladı. Şimdi kalkış listesini atlayıp «pilot deneyimli» demek istemiyorum; piksel ve jeton milimle ölçülür.",
  "ux-ileri-10":
    "Liste konuşunca ürperdim: birleşmiş kod görsel bitti değilmiş. Şimdi cephe fotoğrafını iskan belgesi sanmak istemiyorum; el teslimi, kod ve test aynı kutuda dursun.",
  "w3-temel-2":
    "İçimden şunu geçirdim: ortak noter defterinin her sayfasına önceki mührün özeti yazılınca bir sayfa yırtılınca sıra bozulurmuş. Şimdi kargo mührü kırıksa paketin kimin olduğunu merak ediyorum — band yoksa içerik şüpheli.",
  "w3-temel-3":
    "Kafamda oturdu: mühür bandı kırıksa paket kiminmiş. Şimdi otoban gişesinde yol açık diye ücretsiz geçmek istemiyorum; mühürlü kasa anahtarsız, gişe ücretsiz yazılmaz.",
  "w3-temel-4":
    "Gişe konuşunca ferahladım. Şimdi apartman yönetmeliğinin tarihi bilinmeden imza tartışmak istemiyorum; otomatik sözleşme otomatı o tarihe bağlı çalışsın.",
  "w3-temel-5":
    "Yönetmelik tarihi durunca ürperdim: sürümsüz derleme her yerde «çalıştı» yalanıymış. Şimdi tezgâh üstü notu kasa defteri sanmak istemiyorum; kapanışta not uçar, kasa durur.",
  "w3-temel-6":
    "Kasa ile tezgâh ayrılınca içim ferahladı. Şimdi zil çaldı diye kasayı açmak istemiyorum; kapı kilidi kimin gireceğini, zil yalnız kimin geldiğini yazar.",
  "w3-temel-7":
    "Kilit ile zil ayrıymış... kafamda yandı. Şimdi ilk anahtar tesliminde yedek ve kayıt olmadan «kapı benim» demek istemiyorum; derleyici yeşili teslim sayılmaz.",
  "w3-orta-2":
    "İçimden şunu geçirdim: ortak bina yönetmeliği tek dosyada dururmuş, her kat kendi kopyasını yazınca kapı çakışırmış. Şimdi boş çek vermek istemiyorum; jeton otomatı fiş basmadan jeton vermesin.",
  "w3-orta-3":
    "Boş çek hesabı açarmış... kafamda yandı. Şimdi fotoğrafı ev, JPEG’i değiştirilemez jeton sanmak istemiyorum; tapu sicili zincirdedir, duvardaki tablo değil.",
  "w3-orta-4":
    "Sicil konuşunca ferahladım. Şimdi kasa kapısı, kamera ve imza yetkisini aynı kişide toplamak istemiyorum; «denetim sonra» ana ağ pişmanlığıdır.",
  "w3-orta-5":
    "Kapılar ayrılınca ürperdim: özellik listesi güvenlik değilmiş. Şimdi gişede para vermeden fiş basmak istemiyorum; önce defter, sonra para — tersi kasa eksiye düşer.",
  "w3-orta-6":
    "Gişe sırası oturdu. Şimdi tek tezgahtan «piyasa fiyatı» alıp teminat yazmak istemiyorum; tezgâh şişince kredi çöker.",
  "w3-orta-7":
    "Tezgâh konuşunca içim yandı: anlık fiyat teminat değilmiş. Şimdi yangın alarmı hiç çalmadan «sistem sağlam» demek istemiyorum; Remix’te bir kez, denetim sayılmaz.",
  "w3-orta-8":
    "Tatbikat yoksa yeşil yerel üretim kapısı değilmiş. Şimdi motor sesi güzel diye uçağı kaldırmak istemiyorum; kontrol listesi yazılı dursun, içe aktarma liste yerine geçmesin.",
  "w3-ileri-2":
    "İçimden şunu geçirdim: bankamatik ekranı bakiyeyi uyduramazmış — gişe defteri asıl, ekran kopya. Şimdi noter imzası ile kütüphane fişini karıştırmak istemiyorum; fiş imza atamaz.",
  "w3-ileri-3":
    "Fiş imza değilmiş... kafamda oturdu. Şimdi iki dilde aynı sözleşmenin madde numarasını kaydırmak istemiyorum; tek uygulama ikili arayüzü, iki istemci türevi.",
  "w3-ileri-4":
    "Madde kayınca anlam kayarmış. Şimdi kasa fişini muhasebe defterinin yerine koymak istemiyorum; fiş asıl, defter kopya — sıfır onaylı kredi açılmaz.",
  "w3-ileri-5":
    "Fiş konuşunca ferahladım. Şimdi kapı zili çalmayı satış sanmak istemiyorum; bağlanmak imza değildir, sessiz sınırsız izin kasayı açık bırakır.",
  "w3-ileri-6":
    "Zil satış değilmiş... içimde yer etti. Şimdi iki kovalı terazide «fiyat garantisi» duymak istemiyorum; bir kovadan alınca diğeri yükselir, likidite havuzu o suyun ta kendisi.",
  "w3-ileri-7":
    "Terazi konuşunca ürperdim: kayma kapısı gizlenince kullanıcı korumasızmış. Şimdi rehinli kredide yalnız faiz tabelasına bakmak istemiyorum; fiyat düşünce rehin satılır.",
  "w3-ileri-8":
    "Rehin konuşunca ferahladım. Şimdi üç gün önceki kur tabelasıyla satış yapmak istemiyorum; bayat fiyat kahini tasfiye kapısını kırmızıya çeker.",
  "w3-ileri-9":
    "Tabela bayatsa satış yokmuş. Şimdi kargo «yolda» iken «teslim» demek istemiyorum; belirsizken bakiye artışı gişe yalanıdır.",
  "w3-ileri-10":
    "Yolda iken teslim yalanmış... kafamda yandı. Şimdi uçuş simülatörüne gerçek yolcu alıp ana ağ anahtarıyla kapanış saymak istemiyorum; checklist yerelde biter.",
  "mkt-temel-2":
    "İçimden şunu geçirdim: kasada barkod okunmadan deftere «sattık» yazmak ciro değilmiş. Şimdi vitrini, reyonu ve fiyat etiketini tek rafa yığmak istemiyorum; dükkân düzeni ayrı durur.",
  "mkt-temel-3":
    "Kafamda oturdu: vitrin, reyon ve etiket aynı kutu değilmiş. Şimdi caddede aynı broşürü komşuya, eski müşteriye ve rastgele sokağa uzatmak istemiyorum; kimin eline geçtiği yazılsın.",
  "mkt-temel-4":
    "Broşür konuşunca ferahladım. Şimdi iki tezgâh aynı elmayı farklı tabelayla satınca «tabela değişti» demek istemiyorum; hangisi tuttu tartı fişinde dursun.",
  "mkt-temel-5":
    "Tabela konuşunca ürperdim: güzel görsel tek başına performans değilmiş. Şimdi tezgâh kirasını elma fiyatı sanmak istemiyorum; kira ve «şu fiyattan sat» ayrı kalem.",
  "mkt-temel-6":
    "Kira konuşunca içim yandı: müşteri yokken tavan boş konuşmaymış. Şimdi fiş toplamı, iade ve dönem yokken «iyi gündü» demek istemiyorum; kasa raporu satır ister.",
  "mkt-orta-2":
    "İçimden şunu geçirdim: gazete ilanı, otobüs afişi ve kapı zili aynı «reklam» değilmiş. Şimdi pazarda «elma» diye bağırınca armut müşterisini de çekmek istemiyorum; olumsuz kelime tezgâhı ayırır.",
  "mkt-orta-3":
    "Kafamda oturdu: bağırış sipariş fişi değilmiş. Şimdi menü güzel diye yemek gelmeden puan beklemek istemiyorum; sipariş, menü ve mutfak hızı ayrı dursun.",
  "mkt-orta-4":
    "Menü konuşunca ferahladım. Şimdi afişi her duvara yapıştırıp dükkânın itibarını korumak istemiyorum; bazı duvarlar vitrini kirletir.",
  "mkt-orta-5":
    "Duvar konuşunca ürperdim: ucuz gösterim marka güvenliği değilmiş. Şimdi televizyon reklamında jeneriği kapı zili sanmak istemiyorum; ilk saniye bakılmadan mesaj yetmez.",
  "mkt-orta-6":
    "Zil konuşunca içim yandı: bakılmayan başlık gövdeyi okutmazmış. Şimdi iki kasada aynı fişi iki kez yazıp ciroyu büyütmek istemiyorum; çift fiş kasa yalanıdır.",
  "mkt-orta-7":
    "Fiş konuşunca kafamda oturdu: çift sayım öğrenmeyi şişirirmiş. Şimdi reyona her saat yeni fiyat yazmak istemiyorum; ritim bozulunca kasa da bozulur.",
  "mkt-orta-8":
    "Ritim konuşunca ferahladım. Şimdi gazete ve afiş kampanyasını tek kasa satırında eritmek istemiyorum; kanal ayrımı silinmez, fotoğraf kasa değildir.",
  "mkt-ileri-2":
    "İçimden şunu geçirdim: kütüphanede kitabı yanlış rafa koyup «popüler» yazmak dizin değilmiş. Şimdi pazar listesine her sebzeyi yazıp alışveriş sanmak istemiyorum; menü ve bütçe yoksa liste süs.",
  "mkt-ileri-3":
    "Kafamda oturdu: sonsuz kelime listesi tarif değilmiş. Şimdi vitrin tabelası ile içerideki ürünü uyumsuz bırakmak istemiyorum; müşteri çıkar, raf yalan söyler.",
  "mkt-ileri-4":
    "Tabela konuşunca ferahladım. Şimdi dükkân açık tabelası asılıyken kapıyı kilitli bırakmak istemiyorum; vitrin süs, kapı açılmadan işe yaramaz.",
  "mkt-ileri-5":
    "Kapı konuşunca ürperdim: tarama yönergesi engelliysa içerik görünmezmiş. Şimdi reçetesiz her gün farklı yemek açmak istemiyorum; ateş, tarifin yerini tutmaz.",
  "mkt-ileri-6":
    "Reçete konuşunca içim yandı: içerik yağmuru sistem değilmiş. Şimdi son satıcıya tüm komisyonu verip vitrini unutmak istemiyorum; tavsiye ve raf da yolda durur.",
  "mkt-ileri-7":
    "Komisyon konuşunca kafamda oturdu: son el bütün yolu silmezmiş. Şimdi iki menüyü aynı masaya karışık sunup «hangisi tuttu» demek istemiyorum; karışık tabak tadım değildir.",
  "mkt-ileri-8":
    "Tadım konuşunca ferahladım. Şimdi yemek kötüyse afişle büyüme çarkını çevirmek istemiyorum; tabak pişmeden zil yeni müşteri getirmez.",
  "mkt-ileri-9":
    "Çark konuşunca ürperdim: aktivasyon kırıkken edinim bütçesi boşa akarmış. Şimdi brüt ciroyu yazıp kirayı unutmak istemiyorum; kâr, tabela değil kasa fişidir.",
  "mkt-ileri-10":
    "Fiş konuşunca içim yandı: paydasız geri dönüş yatırımcı kanıtı değilmiş. Şimdi tabela, stok, kasa ve tavsiye yokken açılış fotoğrafını checklist sanmak istemiyorum; dizin, reçete ve çark aynı kutuda dursun.",
  "mnt-temel-2":
    "İçimden şunu geçirdim: gazete bayii «her manşeti basarım» deyince kimse durmuyormuş. Şimdi köşe yazısının iskeleti yoksa manşet de boşa çıkıyor; kanca, gövde ve gişe çağrısı ayrı dursun.",
  "mnt-temel-3":
    "Kafamda oturdu: film fragmanı menü gibiymiş — giriş, ana yemek, gişe. Şimdi vitrindeki afiş filme uymazsa ikinci bilet yok; kapak yalan söylemesin.",
  "mnt-temel-4":
    "Afiş konuşunca ferahladım. Şimdi gazete künyesine her manşeti yığıp haberi mutfağa koymak istemiyorum; doğru raf etiketi okuyucuyu buldurur.",
  "mnt-temel-5":
    "Künye konuşunca ürperdim: anahtar kelime yığını keşif sihri değilmiş. Şimdi kapıdan girip hemen çıkanı «kalabalıktı» diye kutlamak istemiyorum; içeride kalma süresi de sayılsın.",
  "mnt-temel-6":
    "Sayaç konuşunca içim yandı: tıklama zafer, tutma kırığıymış. Şimdi yalnız neon yakıp restoran açmak istemiyorum; menü, vitrin ve kasa aynı pakette dursun.",
  "mnt-orta-2":
    "İçimden şunu geçirdim: makas-kurgu masasına bütün ruloları yığıp «sonra bakarız» demek montaj değilmiş. Şimdi her cümlede el çırpmak istemiyorum; makas anlam biriminde dursun.",
  "mnt-orta-3":
    "Kafamda oturdu: alkış, anlamın yerini tutmazmış. Şimdi düğünde lisanssız şarkıyla salonu coşturup belgesiz kalmak istemiyorum; ses önde, hak yazılı dursun.",
  "mnt-orta-4":
    "Salon konuşunca ferahladım. Şimdi çay demliğini her beş dakikada boşaltıp ikram sanmak istemiyorum; uzun filmi dikey kırpmak kısa dikey video sayılmaz.",
  "mnt-orta-5":
    "Demlik konuşunca ürperdim: ritimsiz spam demlenmezmiş. Şimdi film fragmanını jenerikle açmak istemiyorum; üç saniyede ne iş olduğu anlaşılsın.",
  "mnt-orta-6":
    "Fragman konuşunca içim yandı: selamla açılan kısa dikey video ölürmüş. Şimdi kıyafeti yanlış beden kutusuna koyup rafta yırtılmasını istemiyorum; belirtim gümrük kapısı.",
  "mnt-orta-7":
    "Kutu konuşunca kafamda oturdu: yanlış en-boy yüzü kesermiş. Şimdi her akşam «bugün ne pişirsem» diye markete koşmak istemiyorum; haftalık hazırlık borç kapatır.",
  "mnt-orta-8":
    "Hazırlık konuşunca ferahladım. Şimdi yalnız tabağın fotoğrafını kısa sipariş mutfağı sanmak istemiyorum; fiş, kanca ve servis süresi aynı kutuda dursun.",
  "mnt-ileri-2":
    "İçimden şunu geçirdim: pazar tezgâhı kalabalık diye aynı malı almak kâr değilmiş. Şimdi toptancıdan görmeden çuval alıp dükkân envanterine «lüks» yazmak istemiyorum; numune açılmadan çuval yok.",
  "mnt-ileri-3":
    "Kafamda oturdu: çuval, vitrinin yerini tutmazmış. Şimdi etikete «el yapımı» yazıp barkoda fabrika basmak istemiyorum; sayfa, tartı fişi kadar dürüst dursun.",
  "mnt-ileri-4":
    "Etiket konuşunca ferahladım. Şimdi üç kapıdan müşteri giren dükkânda sayaç yokken «hep vitrin sattı» demek istemiyorum; her kapının maliyeti ayrı yazılsın.",
  "mnt-ileri-5":
    "Sayaç konuşunca ürperdim: kör harcama edinme maliyeti yalanıymış. Şimdi kasa yazıcısı bozukken «müşteri istemedi» demek istemiyorum; ödeme kırığı reklamı yakar.",
  "mnt-ileri-6":
    "Yazıcı konuşunca içim yandı: kırık ödeme kampanyayı değil operasyonu suçlarmış. Şimdi kargo sevkiyat deposunda takip yokken «yolda» yazmak istemiyorum; numara, SMS’ten önce dursun.",
  "mnt-ileri-7":
    "Depo konuşunca kafamda oturdu: «kargoya verdik» iletisi paket değilmiş. Şimdi lokantada ciroyu sayıp kirayı unutmak istemiyorum; mal maliyeti ve edinme aynı fişte dursun.",
  "mnt-ileri-8":
    "Fiş konuşunca ferahladım. Şimdi kasa sesini kâr sanmak istemiyorum; emniyet kemeri ceza yemeden takılır, «hızlıyız» kemeri çıkarmaz.",
  "mnt-ileri-9":
    "Kemer konuşunca ürperdim: kayıt dışı ölçek bir gün tüm marjı yermiş. Şimdi lotarya biletini yatırım diye satmak istemiyorum; umut, defterin yerini tutmaz.",
  "mnt-ileri-10":
    "Umut konuşunca içim yandı: ekran görüntüsü eğitim değilmiş. Şimdi yalnız vitrin ışığını mağaza açılışı sanmak istemiyorum; ruhsat, kasa, depo ve fiyat aynı pakette dursun.",
  "ex-temel-2":
    "İçimden şunu geçirdim: bakkal veresiye defterinde alışveriş ile hesabı aynı sayfaya yazınca hangi satırın doğru olduğu kayboluyormuş. Şimdi kasa fişini parmakla saymak istemiyorum; formül, defterin mürekkebi olsun.",
  "ex-temel-3":
    "Kafamda oturdu: parmakla saymak kasa değilmiş. Şimdi vergi oranını her poşete yazmak istemiyorum; tabela tek yerde dursun, satır kayınca çarpan bozulmasın.",
  "ex-temel-4":
    "Tabela konuşunca ferahladım. Şimdi bin poşeti gözle taramak istemiyorum; bakkal reyonunu rafa göre saymak, Özet Tablo gibi dursun.",
  "ex-temel-5":
    "Reyon konuşunca ürperdim: uydurma kırılım raf yalanıymış. Şimdi tartının sıfırını kaydırıp «kilo aldın» demek istemiyorum; ibre dürüst dursun.",
  "ex-temel-6":
    "İbre konuşunca içim yandı: kırık eksen karar yakarmış. Şimdi pazardan gelen sebzeyi yıkamadan tencereye atmak istemiyorum; kirli veri, tezgâhı zehirler.",
  "ex-orta-2":
    "İçimden şunu geçirdim: kargo poşetini etiketlemeden rafa koymak stok değilmiş. Şimdi fişe ürün kataloğunun tamamını yapıştırmak istemiyorum; olay bir yerde, kart başka yerde dursun.",
  "ex-orta-3":
    "Kafamda oturdu: şişmiş fiş model değilmiş. Şimdi terazi tarifini raflara yazmak istemiyorum; gramaj tartım anında hesaplansın.",
  "ex-orta-4":
    "Terazi konuşunca ferahladım. Şimdi fabrika gösterge panosunu afişle kaplamak istemiyorum; operatör tek mesaj görsün, duvar konuşmasın.",
  "ex-orta-5":
    "Pano konuşunca ürperdim: on dört tanımsız kart körlükmüş. Şimdi aynı anahtarı iki kapıya çoğaltmak istemiyorum; kim girdi belli olsun.",
  "ex-orta-6":
    "Anahtar konuşunca içim yandı: çift sayım kapı hatasıymış. Şimdi gizli sayfayı noter mühürü sanmak istemiyorum; satır kapısı yazılı dursun.",
  "ex-orta-7":
    "Mühür konuşunca kafamda oturdu: zarflamak tasdik değilmiş. Şimdi vitrine dünkü ekmeği «taze» yazmak istemiyorum; yenileme kırmızıysa bugün denmez.",
  "ex-orta-8":
    "Vitrin konuşunca ferahladım. Şimdi mutfak tezgâhının fotoğrafını servis tabağı sanmak istemiyorum; sorgu, ölçü ve yenileme aynı kutuda dursun.",
  "ex-ileri-2":
    "İçimden şunu geçirdim: fotokopide beş yüz sayfayı tek tek basmak ölçek değilmiş. Şimdi arşiv odasında tüm klasörü masaya dökmek istemiyorum; indeks «şu tarih, şu şehir» desin.",
  "ex-ileri-3":
    "Kafamda oturdu: klasör yığını dizin değilmiş. Şimdi noter mühürü olmadan herkesin kalem oynattığı senedi geçerli sanmak istemiyorum; kapı, tasdik ister.",
  "ex-ileri-4":
    "Mühür konuşunca ferahladım. Şimdi makro otomasyon çarkı dururken her sabah aynı düğmeye basmak istemiyorum; menü, programı bir kez yazsın.",
  "ex-ileri-5":
    "Çark konuşunca ürperdim: geniş izin anahtarı her kilidi açarmış. Şimdi çalar saat ile kapı zilini aynı koliye bağlamak istemiyorum; paket iki kez düşmesin.",
  "ex-ileri-6":
    "Zil konuşunca içim yandı: çift tetik çift yazımmış. Şimdi kargo takip dört yüz dörtken «geldi» yazmak istemiyorum; durum kodu yeşilden önce dursun.",
  "ex-ileri-7":
    "Takip konuşunca kafamda oturdu: yutulan beş yüz dünkü kuru «bugün» yaparmış. Şimdi servis atlanıp fiş kesmek istemiyorum; bant, adım adım yürüsün.",
  "ex-ileri-8":
    "Bant konuşunca ferahladım. Şimdi ev anahtarını kapıya bantlamak istemiyorum; sır hücrede A1’de durmaz, kasa kapalı kalsın.",
  "ex-ileri-9":
    "Kasa konuşunca ürperdim: düz metin anahtar afişmiş. Şimdi asansör sıkışınca kapıyı zorlamak istemiyorum; acil düğme ve kayıt dursun, boş catch yalan söyler.",
  "ex-ileri-10":
    "Düğme konuşunca içim yandı: «OK» yazısı hata yutmakmış. Şimdi prova gecesinde üretim anahtarını salona almak istemiyorum; çark, ışık ve yedek aynı kutuda dursun.",
  "pd-temel-2":
    "İçimden şunu geçirdim: pazarda tartıyı bozmak ikna değilmiş. Şimdi köprü iskeleti olmadan tahta çakmak istemiyorum; amaç, kanıt ve çağrı kiriş gibi dursun.",
  "pd-temel-3":
    "Kafamda oturdu: iskeletsiz konuşma ırmakta bitermiş. Şimdi aynı tarifi her odaya aynı kelimeyle okumak istemiyorum; dinleyici haritası odayı göstersin.",
  "pd-temel-4":
    "Harita konuşunca ferahladım. Şimdi sahne perdesi kapalıyken alkış koparmak istemiyorum; ses ve tempo perdeyi açsın, metin duyulsun.",
  "pd-temel-5":
    "Perde konuşunca ürperdim: bağırarak varlık olmazmış. Şimdi itirazı düşman sanmak istemiyorum; terzi ölçü alır, kumaşı zorlamaz.",
  "pd-temel-6":
    "Netlik konuşunca içim yandı: sessizlik onay değilmiş. Şimdi düğün konuşmasına yazmadan çıkmak istemiyorum; etik, iskelet ve harita aynı pakette dursun.",
  "pd-orta-2":
    "İçimden şunu geçirdim: yağ ışığını kapatmak paneli düzeltmezmiş. Şimdi fırtına pusulası olmadan «ben sakinim» demek istemiyorum; duygu adıyla dursun.",
  "pd-orta-3":
    "Pusula konuşunca ferahladım. Şimdi komşunun kapısını zorlayıp «anlıyorum» demek istemiyorum; duvardan dinlemek empati, anahtar değil.",
  "pd-orta-4":
    "Duvar konuşunca ürperdim: «sen kötüsün» kayıt değilmiş. Şimdi yangın vanası kapalıyken odaya dalmak istemiyorum; Durum-Davranış-Etki, alevi kesmeden önce dursun.",
  "pd-orta-5":
    "Vana konuşunca içim yandı: asansör baskısı söndürme değilmiş. Şimdi iki kardeşin pencere kavgasını «kim kazandı» diye yazmak istemiyorum; asıl çıkar ışık veya sessizlik olsun.",
  "pd-orta-6":
    "Pencere konuşunca kafamda oturdu: pozisyon savaşı yangını büyütürmüş. Şimdi kaptan rotayı anlatmadan «ilham» konuşmak istemiyorum; mürettebat soru sorabilsin.",
  "pd-orta-7":
    "Rota konuşunca ferahladım. Şimdi sofrada korku varken «her şey süper» yazmak istemiyorum; söz kesilmeden iklim okunsun.",
  "pd-orta-8":
    "Sofra konuşunca ürperdim: mutlu emoji iklim değilmiş. Şimdi yangın tatbikatında afiş asıp toplanma yerini boş bırakmak istemiyorum; vana, kart ve harita aynı pakette dursun.",
  "pd-ileri-2":
    "İçimden şunu geçirdim: mutfak bıçağını «herkesi yönet» diye satmak araç değilmiş. Şimdi evi su basmışken «şükret» demek istemiyorum; gerçek silinmeden çerçeve açılsın.",
  "pd-ileri-3":
    "Kafamda oturdu: «fırsat» demek yardım değilmiş. Şimdi «herkes biliyor»u kanıt sanmak istemiyorum; kim, ne zaman, hangi örnek dursun.",
  "pd-ileri-4":
    "Örnek konuşunca ferahladım. Şimdi soruyu silah yapmak istemiyorum; maç öncesi ısınma rakibi uyuşturmaz, kendini hazırlar.",
  "pd-ileri-5":
    "Isınma konuşunca ürperdim: sahte sakinlik güveni yakarmış. Şimdi zaman kum saati ters çevrilmeden «müsait olunca» demek istemiyorum; kum bitince iş dursun.",
  "pd-ileri-6":
    "Kum konuşunca içim yandı: açık uç odak değilmiş. Şimdi ajanda düzeni olmadan her bildirimi acil yazmak istemiyorum; önemli ayrı, yangın ayrı dursun.",
  "pd-ileri-7":
    "Ajanda konuşunca kafamda oturdu: duman alarmı sigortanın yerini tutmazmış. Şimdi diş fırçasını çekmecede saklayıp iradeye yüklenmek istemiyorum; tetik görünür dursun.",
  "pd-ileri-8":
    "Tetik konuşunca ferahladım. Şimdi ameliyathane kapısını herkese açmak istemiyorum; derin iş, «girme» tabelası ister.",
  "pd-ileri-9":
    "Kapı konuşunca ürperdim: hep müsait kahramanlıkmış. Şimdi mutfak, liste ve öğün saati kopukken «sistemim var» demek istemiyorum; ritim tek işletim olsun.",
  "pd-ileri-10":
    "Ritim konuşunca içim yandı: parça parça defter işletim değilmiş. Şimdi ev panosunu afişle asıp gün gün işlememek istemiyorum; etik, zaman ve alışkanlık aynı kutuda dursun.",
  "cld-temel-2":
    "İçimden şunu geçirdim: sayaç tikliyor, daire aydınlık; faturayı kimin ödediği yazılmamış. Şimdi kiralık kasaya tek yedek anahtar asmak istemiyorum; kopya çoğalır, sahiplik kaybolur.",
  "cld-temel-3":
    "Kasa konuşunca ferahladım. Şimdi parsel sınırı çizilmeden garaj kapısı açmak istemiyorum; herkes bahçeden geçer, çit yoksa kimlik yeşil kalsa da arsa deliktir.",
  "cld-temel-4":
    "Çit konuşunca kafamda oturdu: tapu sınırı ile bahçe kapısı ayrıymış. Şimdi garaj kiralandı diye anahtarı panoya asmak istemiyorum; kim teslim aldı yazılsın.",
  "cld-temel-5":
    "Garaj konuşunca ürperdim: «çalışıyor» lambası envanter değilmiş. Şimdi emanet deposuna koli bırakıp kapıyı «herkese okuma» açmak istemiyorum; raf kilitli dursun.",
  "cld-temel-6":
    "Depo konuşunca içim yandı: vitrin camından herkesin koliyi okuması depo değilmiş. Şimdi ay sonu fişi gelmeden prizleri açık bırakmak istemiyorum; sayaç kimin, hangi saat yazılsın.",
  "cld-orta-2":
    "İçimden şunu geçirdim: gişe yokken her araba kendi şeridinden içeri dalarmış. Şimdi kırmızı lamba yanan kabine araç sürmek istemiyorum; kuyruk kör kalmasın.",
  "cld-orta-3":
    "Lamba konuşunca ferahladım. Şimdi bayramda tek otobüs, gece boş koltuk istemiyorum; filo min-max ile esnesin.",
  "cld-orta-4":
    "Filo konuşunca kafamda oturdu: yeni otobüs gişeye yazılmazsa kuyruk yine tek kabindeymiş. Şimdi gece boş otobüsü mahallede dolaştırmak istemiyorum; soğuma ve tavan yazılsın.",
  "cld-orta-5":
    "Yakıt konuşunca ürperdim: «hep max» kahramanlık değilmiş. Şimdi ana kasayı stajyerin dizüstüne koymak istemiyorum; mahzen kiralık satırda dursun.",
  "cld-orta-6":
    "Mahzen konuşunca içim yandı: caddeye açık kasa mahzen değilmiş. Şimdi yangında tek şubeye güvenmek istemiyorum; ikinci kasa başka arsada dursun.",
  "cld-orta-7":
    "İkinci kasa konuşunca ferahladım. Şimdi okuma kopyasını felaket planı sanmak istemiyorum; sipariş yokken ocağı gece açık bırakmayayım, mutfak ışığı olayla yansın.",
  "cld-orta-8":
    "Işık konuşunca kafamda oturdu: süresiz fonksiyon yokmuş. Şimdi gişe afişi, boş filo, cadde mahzeni ve gece ocağı yan yana «mimari» demek istemiyorum; dört satır aynı masada yeşil dursun.",
  "cld-ileri-2":
    "İçimden şunu geçirdim: şefsiz vinç komşu geminin konteynerini de indirirmiş. Şimdi kutu yeri değişince eski iskeleye kamyon sürmek istemiyorum; kapı numarası kalsın.",
  "cld-ileri-3":
    "Adres konuşunca ferahladım. Şimdi tek pod ip’sini paylaşmak istemiyorum; vinç tonajı yazılı dursun, iskele çökmesin.",
  "cld-ileri-4":
    "Tavan konuşunca kafamda oturdu: sınırsız pod komşu gemiyi de batırırmış. Şimdi «aklımızda plan var» diye tuğla dizmek istemiyorum; yapı projesi imzalı dursun.",
  "cld-ileri-5":
    "Proje konuşunca ürperdim: tıklama şantiye değilmiş. Şimdi kolon kaymış planda düz dururken «gerçek bu» demek istemiyorum; tapu defteri kilitli rafta dursun.",
  "cld-ileri-6":
    "Defter konuşunca içim yandı: durum dosyasını caddeye asmak mahzen sayılmazmış. Şimdi aynı projeyi üç arsaya tek defterle dökmek istemiyorum; tapu ayrı kalsın.",
  "cld-ileri-7":
    "Üç arsa konuşunca ferahladım. Şimdi üretim şifresini geliştirmede denemek istemiyorum; ustaların tezgâhta vida sıkması bant olmasın, tarife git’ten çekilsin.",
  "cld-ileri-8":
    "Bant konuşunca kafamda oturdu: «ben bastım» kahramanlığı defter değilmiş. Şimdi kırmızı kutuyu yeşil boyayıp sürmek istemiyorum; hat dursun.",
  "cld-ileri-9":
    "Kutu konuşunca ürperdim: latest dün yeşil bugün zehir olabilirmiş. Şimdi kule karanlıkken vinç çalıştırmak istemiyorum; kasa kapağı rıhtıma asılmasın.",
  "cld-ileri-10":
    "Kule konuşunca içim yandı: pano süsü gözlem değilmiş. Şimdi liman afişi, raftaki şablon ve durmuş bantla «üretim» demek istemiyorum; şef, proje ve hat aynı defterde dursun.",
  "eng-temel-2":
    "İçimden şunu geçirdim: kamyon kapıda, rapor da isteniyor; ham çuvalı vitrine koymak teslim değilmiş. Şimdi fabrikayı kamyonun üstünde arıtmak ile tesiste arıtmayı karıştırmak istemiyorum.",
  "eng-temel-3":
    "Kamyon konuşunca ferahladım. Şimdi ham çuval ile paketli unu aynı rafa koymak istemiyorum; fırın yalan söyler.",
  "eng-temel-4":
    "Depo konuşunca kafamda oturdu: göl keşif, ambar paketmiş. Şimdi çuval açıkken herkesin kendi dilimini kesmesini istemiyorum; ölçü şablonu dursun.",
  "eng-temel-5":
    "Şablon konuşunca ürperdim: cetvel varken tartı damgasızmış. Şimdi «benim gramajım doğru» demek istemiyorum; mühür görünsün.",
  "eng-temel-6":
    "Damga konuşunca içim yandı: ham tablo, göl, şablon ve damga aynı masada; payda hâlâ «bana göre»ymiş. Şimdi sorgum döndü diye yeşil basmak istemiyorum; payda yazılı dursun.",
  "eng-orta-2":
    "İçimden şunu geçirdim: makas kulesi karanlıkken «ben çalıştırdım» sefer değilmiş. Şimdi vagon A, B’yi beklesin B de A’yı; döngülü makas istemiyorum.",
  "eng-orta-3":
    "Graf konuşunca ferahladım. Şimdi saat yokken «ne zaman kalktı?» kavgası istemiyorum; istasyon saati tiklesin.",
  "eng-orta-4":
    "Saat konuşunca kafamda oturdu: tik varken vagon üst üste biniyormuş. Şimdi hepsini aynı anda itmek istemiyorum; sıra yazılsın.",
  "eng-orta-5":
    "Sıra konuşunca ürperdim: kaynak geç gelince hattı yıkmak kule değilmiş. Şimdi lambasız makastan geçmek istemiyorum; bekleme görünsün.",
  "eng-orta-6":
    "Lamba konuşunca içim yandı: çuval tartısız vitrine gidiyormuş. Şimdi «gözüme doğru geldi» demek istemiyorum; laboratuvar numune tartsın.",
  "eng-orta-7":
    "Laboratuvar konuşunca ferahladım. Şimdi kırmızı numuneyken vanayı açık bırakmak istemiyorum; zehir un vitrine çıkmasın.",
  "eng-orta-8":
    "Vana konuşunca kafamda oturdu: kule afişi, durmuş saat, boş laboratuvar orkestrasyon değilmiş. Şimdi dört satır aynı masada yeşil dursun.",
  "eng-ileri-2":
    "İçimden şunu geçirdim: ham cevher, yıkanmış taş ve külçe aynı rafa konursa vitrin yalan söylermiş. Şimdi kamyonu boşaltıp tartısız «Bronz bitti» demek istemiyorum; irsaliye dursun.",
  "eng-ileri-3":
    "Bunker konuşunca ferahladım. Şimdi çamurlu taşı külçe saymak istemiyorum; elek ve tartı ayrı holdede dursun.",
  "eng-ileri-4":
    "Yıkama konuşunca kafamda oturdu: Gümüş yokken vitrin çamurmuş. Şimdi yıkanmış taşı külçe diye koymak istemiyorum; payda yazılı dursun.",
  "eng-ileri-5":
    "Külçe konuşunca ürperdim: «şu bulut ucuz» tek kasa değilmiş. Şimdi iki tesisin faturasını tek satıra sıkıştırmak istemiyorum; kira ayrı dursun.",
  "eng-ileri-6":
    "Fatura konuşunca içim yandı: tek dizüstü «ben küme» değilmiş. Şimdi yüz vagonu tek hatta itmek istemiyorum; kule ve kompartıman yazılsın.",
  "eng-ileri-7":
    "Hat konuşunca ferahladım. Şimdi «hepsi anlık» diye tarifeli seferi canlı hat sanmak istemiyorum; tür yazılı dursun.",
  "eng-ileri-8":
    "Sefer konuşunca kafamda oturdu: bütün vagonlar tek makasta kuyrukmuş. Şimdi çarpık anahtarı görmeden tavan açmak istemiyorum; vagon boyu yazılsın.",
  "eng-ileri-9":
    "Makas konuşunca ürperdim: bütün meyve vitrinde, soğuk oda boşmuş. Şimdi çileği kış boyu halde tutmak istemiyorum; kira iki kalem dursun.",
  "eng-ileri-10":
    "Hali konuşunca içim yandı: tesis afişi, dizüstü küme, gece açık vitrin üretim değilmiş. Şimdi katman, hat ve faturayı aynı defterde görmeden «büyük veri» demek istemiyorum.",
  "qa-temel-2":
    "İçimden şunu geçirdim: koli kapıda, damga konuşuldu; her şeyi elle tıklamak teslim değilmiş. Şimdi bütün kolileri tavan katında tartmak istemiyorum; terazi katman katman dursun.",
  "qa-temel-3":
    "Terazi konuşunca ferahladım. Şimdi çuvalın içi yazılmadan «fonksiyon çalıştı» demek istemiyorum; reçete dursun.",
  "qa-temel-4":
    "Reçete konuşunca kafamda oturdu: malzeme varken kabul imzasızmış. Şimdi alkışla koli çıkarmak istemiyorum; noter tutanağı dursun.",
  "qa-temel-5":
    "Tutanak konuşunca ürperdim: kırık «bir şeyler olmuyor» diye kayboluyormuş. Şimdi kanıtsız şikayetle fabrikayı kör etmek istemiyorum; irsaliye dursun.",
  "qa-temel-6":
    "İrsaliye konuşunca içim yandı: damga, terazi, reçete ve tutanak aynı masada; koli hâlâ «gözüme doğru»ymuş. Şimdi afişle yeşil basmak istemiyorum; dört satır dursun.",
  "qa-orta-2":
    "İçimden şunu geçirdim: robotik kol asıldı; tarayıcı hangisinde yazılmamış. Şimdi tek oturumda on yolu bulaştırmak istemiyorum; kabin ayrı kalsın.",
  "qa-orta-3":
    "Kabin konuşunca ferahladım. Şimdi kolun rastgele pikseli sıkmasını istemiyorum; tutuş sözleşmesi dursun.",
  "qa-orta-4":
    "Tutuş konuşunca kafamda oturdu: aynı koli bazen yeşil bazen kırmızıymış. Şimdi «yeniden koş» ile zar atmak istemiyorum; sahte hat dursun.",
  "qa-orta-5":
    "Yasak konuşunca ürperdim: kırmızı paket yine ana hatta giriyormuş. Şimdi acil afişle bariyeri kaldırmak istemiyorum; kırmızı ışık dursun.",
  "qa-orta-6":
    "Bariyer konuşunca içim yandı: kırmızı paket yine vitrine çıkıyormuş. Şimdi elle basıp kapıyı ip ile bağlamak istemiyorum; sevkiyat fişi dursun.",
  "qa-orta-7":
    "Kapı konuşunca ferahladım. Şimdi vitrin kaymışken «bana düz göründü» demek istemiyorum; eşik ve klavye dursun.",
  "qa-orta-8":
    "Vitrin konuşunca kafamda oturdu: kol afişi, zar atan hat, açık bariyer otomasyon değilmiş. Şimdi dört satır aynı masada yeşil dursun.",
  "qa-ileri-2":
    "İçimden şunu geçirdim: iki fabrika «bizim uç çalışıyor» deyince kamyon ortada kalıyormuş. Şimdi fişsiz sipariş göndermek istemiyorum; tüketen fişi dursun.",
  "qa-ileri-3":
    "Fiş konuşunca ferahladım. Şimdi sağlayan «ben böyle gönderirim» demeden kamyon doldurmak istemiyorum; irsaliye dursun.",
  "qa-ileri-4":
    "İrsaliye konuşunca kafamda oturdu: ortalama hızlı, kuyruk şişiyormuş. Şimdi «bana hızlı geldi» demek istemiyorum; yüzde doksan beş dursun.",
  "qa-ileri-5":
    "Bütçe konuşunca ürperdim: kapak «elle tıklayarak stres yaptık» diyormuş. Şimdi gösteri tıklamasını tezgâh saymak istemiyorum; basınç senaryosu dursun.",
  "qa-ileri-6":
    "Tezgâh konuşunca içim yandı: yük ile stres aynı cümledeymiş. Şimdi taşkını her gün yapmak istemiyorum; tür yazılı dursun.",
  "qa-ileri-7":
    "Tür konuşunca ferahladım. Şimdi beş dakikalık yeşili gece saymak istemiyorum; dayanıklılık penceresi dursun.",
  "qa-ileri-8":
    "Taşkın konuşunca kafamda oturdu: kuyruk şişmiş, pano süsmüş. Şimdi grafiği kule sanmak istemiyorum; eşik ve sahip dursun.",
  "qa-ileri-9":
    "Lamba konuşunca ürperdim: fiş, tezgâh ve lamba ayrı odadaymış. Şimdi tek yeşille kamyon çıkarmak istemiyorum; iki kilit aynı gişede dursun.",
  "qa-ileri-10":
    "Gişe konuşunca içim yandı: protokol afişi, boş tezgâh, süs lamba ileri test değilmiş. Şimdi üç satırı aynı defterde görmeden «kalite bitti» demek istemiyorum.",
  "jav-temel-2":
    "İçimden şunu geçirdim: kaynak dosya duruyor, motor odası konuşuldu; vida rastgele sıkılıyormuş. Şimdi kalıpsız vidayı gece hattına sokmak istemiyorum; ölçü yazılı dursun.",
  "jav-temel-3":
    "Kalıp konuşunca ferahladım. Şimdi «ben elle derledim» diye koli çıkarmak istemiyorum; fabrika derleme makinesi dursun.",
  "jav-temel-4":
    "Makine konuşunca kafamda oturdu: tarif varken damga yokmuş. Şimdi yeşil geçmeden paket basmak istemiyorum; garanti belgesi dursun.",
  "jav-temel-5":
    "Damga konuşunca ürperdim: koliye yabancı vida düşüyormuş. Şimdi sohbet bağlantısını irsaliye saymak istemiyorum; ad ve sürüm dursun.",
  "jav-temel-6":
    "İrsaliye konuşunca içim yandı: motor, kalıp, makine ve damga aynı masada; koli hâlâ «gözüme doğru»ymuş. Şimdi afişle yeşil basmak istemiyorum; dört satır dursun.",
  "jav-orta-2":
    "İçimden şunu geçirdim: resepsiyon duruyor; usta her şeyi new ile kuruyormuş. Şimdi kartsız vardiyayı gece karıştırmak istemiyorum; tezgâh kartı dursun.",
  "jav-orta-3":
    "Kart konuşunca ferahladım. Şimdi koliyi koridorda «şu metoda git» diye kaybetmek istemiyorum; sipariş gişesi dursun.",
  "jav-orta-4":
    "Gişe konuşunca kafamda oturdu: şemasız koli içeri itiliyormuş. Şimdi bozuk adedi yutmak istemiyorum; dört yüz dursun.",
  "jav-orta-5":
    "Yasak konuşunca ürperdim: bahçe kapısı «herkes girsin» diye açıkmış. Şimdi düğme gizlemeyi bekçi saymak istemiyorum; şifreli kapı dursun.",
  "jav-orta-6":
    "Kapı konuşunca içim yandı: koli holde «tabloya bir şekilde yaz» diye kayboluyormuş. Şimdi ham sorguyu raf saymak istemiyorum; sözleşme dursun.",
  "jav-orta-7":
    "Raf konuşunca ferahladım. Şimdi varlık sınıfını caddeye basmak istemiyorum; koli etiketi dursun.",
  "jav-orta-8":
    "Etiket konuşunca kafamda oturdu: resepsiyon, kapı ve yasak aynı masada; koli hâlâ «herkes girsin»miş. Şimdi üç kilit aynı defterde dursun.",
  "jav-ileri-2":
    "İçimden şunu geçirdim: kasa mühürü duruyor; bir banka «gördüm» diyor, öbürü «gelmedi» diyormuş. Şimdi fişsiz kurye göndermek istemiyorum; transfer odası dursun.",
  "jav-ileri-3":
    "Oda konuşunca ferahladım. Şimdi iki deftere ayrı mühür basmak istemiyorum; tek gerçek dursun.",
  "jav-ileri-4":
    "Yasak konuşunca kafamda oturdu: koli «hemen şimdi» diye tezgâha yığılıyormuş. Şimdi bandı atlamak istemiyorum; sır kasası dursun.",
  "jav-ileri-5":
    "Kasa konuşunca ürperdim: parola depoda düz yazılıyormuş. Şimdi anahtarı kapıya bantlamak istemiyorum; kasa anahtarı dursun.",
  "jav-ileri-6":
    "Anahtar konuşunca içim yandı: pano süslü, kırmızı lamba yokmuş. Şimdi manzara fotoğrafını kule saymak istemiyorum; eşik dursun.",
  "jav-ileri-7":
    "Kule konuşunca ferahladım. Şimdi aynı parayı iki kez düşürmek istemiyorum; fiş kimliği dursun.",
  "jav-ileri-8":
    "Fiş konuşunca kafamda oturdu: kırmızı paket «acil» diye üretime giriyormuş. Şimdi yerel yeşili kapı saymak istemiyorum; hat dursun.",
  "jav-ileri-9":
    "Kapı konuşunca ürperdim: oda, kasa ve kule ayrı koridormuş. Şimdi tek yeşille sevk etmek istemiyorum; üç kilit aynı gişede dursun.",
  "jav-ileri-10":
    "Gişe konuşunca içim yandı: transfer afişi, boş kasa, süs kule ileri teslim değilmiş. Şimdi üç satırı aynı defterde görmeden «kurumsal Java bitti» demek istemiyorum.",
  "rn-temel-2":
    "İçimden şunu geçirdim: pasaport damgası duruyor, iki kapı konuşuldu; vitrindeki fiyat etiketi boşmuş. Şimdi etiketsiz rafı gece kasaya sokmak istemiyorum; tutar yazılı dursun.",
  "rn-temel-3":
    "Etiket konuşunca ferahladım. Şimdi askısız mankeni vitrine dikmek istemiyorum; kumaş askıya takılsın.",
  "rn-temel-4":
    "Manken konuşunca kafamda oturdu: ayakkabı rafı tavanı deliyormuş. Şimdi lastiği cama sıkıştırmak istemiyorum; dizilim dursun.",
  "rn-temel-5":
    "Dizilim konuşunca ürperdim: iki yüz çift tek cama yığılıyormuş. Şimdi depoyu vitrine boşaltmak istemiyorum; kaydırma bandı dursun.",
  "rn-temel-6":
    "Bant konuşunca içim yandı: pasaport, vitrin ve bant aynı masada; vitrin hâlâ «gözüme doğru»ymuş. Şimdi afişle yeşil basmak istemiyorum; beş satır dursun.",
  "rn-orta-2":
    "İçimden şunu geçirdim: koridor tabelası duruyor; her vitrin kendi fiyatını tutuyormuş. Şimdi iki camı iki kalemle yazmak istemiyorum; tek tabela dursun.",
  "rn-orta-3":
    "Tabela konuşunca ferahladım. Şimdi koliyi «şu metoda git» diye koridorda kaybetmek istemiyorum; kurye fişi dursun.",
  "rn-orta-4":
    "Fiş konuşunca kafamda oturdu: ağ kesilince vitrin boşalıyormuş. Şimdi «yok» demek istemiyorum; emanet kasası dursun.",
  "rn-orta-5":
    "Kasa konuşunca ürperdim: anten yokken ekran «gönderildi» basıyormuş. Şimdi sahte yeşili teslim saymak istemiyorum; çekmeyen telefon dursun.",
  "rn-orta-6":
    "Yasak konuşunca içim yandı: jeton düz metin çekmecedeymiş. Şimdi anahtarı kapıya bantlamak istemiyorum; şifreli depo dursun.",
  "rn-orta-7":
    "Depo konuşunca ferahladım. Şimdi tema ile jetonu aynı kutuya koymak istemiyorum; çekmece ve kasa ayrı dursun.",
  "rn-orta-8":
    "Ayrım konuşunca kafamda oturdu: emanet, yasak ve kasa aynı masada; vitrin hâlâ «gönderildi»ymiş. Şimdi üç kilit aynı defterde dursun.",
  "rn-ileri-2":
    "İçimden şunu geçirdim: gümrük tercümanı duruyor; her kelime kâğıda yazılıyormuş. Şimdi kuyruğu tır saymak istemiyorum; hızlı gişe dursun.",
  "rn-ileri-3":
    "Gişe konuşunca ferahladım. Şimdi vitrini her dokunuşta titretmek istemiyorum; kumaş dursun.",
  "rn-ileri-4":
    "Kumaş konuşunca kafamda oturdu: kaydırma takılıyormuş. Şimdi «bana akıcı geldi» demek istemiyorum; kare bütçesi dursun.",
  "rn-ileri-5":
    "Bütçe konuşunca ürperdim: JavaScript kolisi uçaktan düşüyor, kabuk yerindeymiş. Şimdi motoru havadan değiştirmek istemiyorum; gümrük sınırı dursun.",
  "rn-ileri-6":
    "Koli konuşunca içim yandı: kırmızı paket «acil» diye üretime giriyormuş. Şimdi yerel yeşili kapı saymak istemiyorum; hat dursun.",
  "rn-ileri-7":
    "Kapı konuşunca ferahladım. Şimdi «paket oluştu» demek istemiyorum; mağaza onay gişesi dursun.",
  "rn-ileri-8":
    "Gişe konuşunca kafamda oturdu: koli geri gelmiş, ekip «haksızlar» diyormuş. Şimdi bağırmayı tutanak saymak istemiyorum; red metni dursun.",
  "rn-ileri-9":
    "Tutanak konuşunca ürperdim: üretim çöküyor, «bende açıldı» deniyormuş. Şimdi hissi nöbet saymak istemiyorum; kara kutu dursun.",
  "rn-ileri-10":
    "Nöbet konuşunca içim yandı: tercüman afişi, boş gişe, Slack tutanak ileri teslim değilmiş. Şimdi üç satırı aynı defterde görmeden «çapraz mobil bitti» demek istemiyorum.",
  "gam-temel-2":
    "İçimden şunu geçirdim: sahne duruyor, kukla yerde; vitrinde ip yokmuş. Şimdi ipsiz kuklayı gece sahneye sokmak istemiyorum; ip sırası yazılı dursun.",
  "gam-temel-3":
    "İpler konuşunca ferahladım. Şimdi isimsiz figüranı tahtaya dikmek istemiyorum; duruş yazılsın.",
  "gam-temel-4":
    "Figüran konuşunca kafamda oturdu: kukla yerden geçiyormuş. Şimdi görüntüyü gövde saymak istemiyorum; yerçekimi ipleri dursun.",
  "gam-temel-5":
    "Gövde konuşunca ürperdim: tuş kareye gömülüyormuş. Şimdi W’yi harita saymak istemiyorum; oyuncu ipleri dursun.",
  "gam-temel-6":
    "Harita konuşunca içim yandı: sahne, ip ve gövde aynı masada; perde hâlâ «ekran açıldı»ymış. Şimdi Play tuşuyla yeşil basmak istemiyorum; beş satır dursun.",
  "gam-orta-2":
    "İçimden şunu geçirdim: afiş duruyor; her kukla kendi tuşunu dinliyormuş. Şimdi iki kabloyu tek sahneye sokmak istemiyorum; kumanda kablosu dursun.",
  "gam-orta-3":
    "Kablo konuşunca ferahladım. Şimdi her çarpışmada tam ses basmak istemiyorum; orkestra dursun.",
  "gam-orta-4":
    "Orkestra konuşunca kafamda oturdu: koli «iki boyut yeter» diyormuş. Şimdi kopya sahneyi iskelet saymak istemiyorum; yayın iskeleti dursun.",
  "gam-orta-5":
    "İskelet konuşunca ürperdim: otomat fişsiz yeşil basıyormuş. Şimdi yerel tiki teslim saymak istemiyorum; jeton otomatı dursun.",
  "gam-orta-6":
    "Otomat konuşunca içim yandı: koli «benim makinemde yeşil» diye kamyona binmek istiyormuş. Şimdi Play klasörünü paket saymak istemiyorum; montaj hattı dursun.",
  "gam-orta-7":
    "Hat konuşunca ferahladım. Şimdi «paket oluştu» demek istemiyorum; kutu etiketi dursun.",
  "gam-orta-8":
    "Etiket konuşunca kafamda oturdu: jeton, hat ve kutu aynı masada; vitrin hâlâ «yayında»ymış. Şimdi üç kilit aynı defterde dursun.",
  "gam-ileri-2":
    "İçimden şunu geçirdim: dekor değişimi duruyor; malzeme listesi boşmuş. Şimdi kaynak yığınını dekor saymak istemiyorum; katalog dursun.",
  "gam-ileri-3":
    "Liste konuşunca ferahladım. Şimdi imzasız kamyonu sahneye indirmek istemiyorum; uzaktan paket dursun.",
  "gam-ileri-4":
    "Kamyon konuşunca kafamda oturdu: sahne gece kırılıyor, «bana akıcı geldi» deniyormuş. Şimdi hissi nöbet saymak istemiyorum; canlı operasyon dursun.",
  "gam-ileri-5":
    "Nöbet konuşunca ürperdim: not kâğıdı uçaktan düşüyor, kasa eziliyormuş. Şimdi motoru notla değiştirmek istemiyorum; sahne notu dursun.",
  "gam-ileri-6":
    "Not konuşunca içim yandı: gişe «şans çarkı» diye bilet satıyormuş. Şimdi kumarı eğlence saymak istemiyorum; dürüst gişe dursun.",
  "gam-ileri-7":
    "Gişe konuşunca ferahladım. Şimdi «jeton geldi» demek istemiyorum; yazılı sözleşme dursun.",
  "gam-ileri-8":
    "Sözleşme konuşunca kafamda oturdu: çark geri gelmiş, ekip «eğlence» diye bağırıyormuş. Şimdi bağırmayı tutanak saymak istemiyorum; kumar yasağı dursun.",
  "gam-ileri-9":
    "Tutanak konuşunca ürperdim: üretim çöküyor, «bende açıldı» deniyormuş. Şimdi hissi ip saymak istemiyorum; emniyet ipi dursun.",
  "gam-ileri-10":
    "İp konuşunca içim yandı: dekor afişi, boş gişe, Slack tutanak ileri teslim değilmiş. Şimdi üç satırı aynı defterde görmeden «oyun bitti» demek istemiyorum.",
  "mlo-temel-2":
    "İçimden şunu geçirdim: defter duruyor, tepsi yerde; vitrinde parti satırı yokmuş. Şimdi deftersiz tepsiyi gece fırına sokmak istemiyorum; parametre yazılı dursun.",
  "mlo-temel-3":
    "Satır konuşunca ferahladım. Şimdi tarihsiz çuvalı tezgâha dikmek istemiyorum; reçete yazılsın.",
  "mlo-temel-4":
    "Reçete konuşunca kafamda oturdu: koli damgasızmış. Şimdi notebook’u sevk saymak istemiyorum; TSE damgası dursun.",
  "mlo-temel-5":
    "Damga konuşunca ürperdim: süt ekşiyor, «hâlâ olur» deniyormuş. Şimdi tadına bakmayı tahlil saymak istemiyorum; süt tarihi dursun.",
  "mlo-temel-6":
    "Tarih konuşunca içim yandı: defter, reçete ve damga aynı masada; vitrin hâlâ «notebook çalışıyor»ymuş. Şimdi kopyayla yeşil basmak istemiyorum; dört satır dursun.",
  "sys-temel-2":
    "İçimden şunu geçirdim: defter duruyor, tek şerit tıkalı; vitrinde lamba yokmuş. Şimdi tek kutuyu kavşak saymak istemiyorum; şerit yazılı dursun.",
  "sys-temel-3":
    "Lamba konuşunca ferahladım. Şimdi her müşteriyi depoya indirmek istemiyorum; vitrin yazılsın.",
  "sys-temel-4":
    "Vitrin konuşunca kafamda oturdu: tüm şehrin koli defteri tek gişedeymiş. Şimdi tek kutuyu şehir saymak istemiyorum; mahalle PTT dursun.",
  "sys-temel-5":
    "Şube konuşunca ürperdim: hortum sonuna kadar açık, «biraz daha» deniyormuş. Şimdi hortumu musluk saymak istemiyorum; kova dursun.",
  "sys-temel-6":
    "Musluk konuşunca içim yandı: lamba, vitrin, şube ve musluk aynı masada; vitrin hâlâ «sunucu açıldı»ymuş. Şimdi ping ile yeşil basmak istemiyorum; dört satır dursun.",
  "canva-temel-2":
    "İçimden şunu geçirdim: şablon duruyor, her köşe aynı rafa yığılmış. Şimdi çorabı tencere rafına koymak istemiyorum; yazı, fotoğraf ve zemin ayrı çekmece dursun.",
  "canva-temel-3":
    "Çekmece konuşunca ferahladım. Şimdi hikâye boyunu bakkal camına yapıştırmak istemiyorum; vesikalık kalıbı işe göre seçilsin.",
  "canva-temel-4":
    "Kalıp konuşunca kafamda oturdu: camda on cümle, fiyat kayıp. Şimdi cümleyi uzatıp panoyu doldurmak istemiyorum; üç saniyede bir vaat dursun.",
  "canva-temel-5":
    "Pano konuşunca ürperdim: telefonda kenar boş, kâğıtta yazı kesilmiş. Şimdi ekran ışığını matbaa saymak istemiyorum; kenar bakılsın, kopya ayrı dursun.",
  "canva-temel-6":
    "Kenar konuşunca içim yandı: beş iş, beş kare, yarın. Şimdi vitrini kalabalık sanmak istemiyorum; bu hafta bir kare, tarihli kopya dursun.",
  "linkedin-temel-2":
    "İçimden şunu geçirdim: tabela duruyor, tatil karesi kapıda asılı. Şimdi grup karesini vesikalık sanmak istemiyorum; yüz okunsun, grup kesilsin.",
  "linkedin-temel-3":
    "Vesikalık konuşunca ferahladım. Şimdi camda beş unvan yığmak istemiyorum; başlık üç saniyede iş söylesin.",
  "linkedin-temel-4":
    "Cam konuşunca kafamda oturdu: hakkında’ya roman yığılmış. Şimdi depoyu ev turu sanmak istemiyorum; üç çekmece dursun.",
  "linkedin-temel-5":
    "Ev konuşunca ürperdim: cam her saat değişiyor. Şimdi her gün paylaşmayı vitrin sanmak istemiyorum; haftada bir cümle dursun.",
  "linkedin-temel-6":
    "Pano konuşunca içim yandı: profilim var, yarın. Şimdi ekran kaydırmayı kâğıt sanmak istemiyorum; tarihli kopya dursun.",
  "cad-temel-2":
    "İçimden şunu geçirdim: harita duruyor, her çizgi aynı yığında. Şimdi mobilyayı duvar sanmak istemiyorum; çekmece ayrı dursun.",
  "cad-temel-3":
    "Çekmece konuşunca ferahladım. Şimdi kâğıtta kısa görünen koridoru ev sanmak istemiyorum; yazıdaki metre dursun.",
  "cad-temel-4":
    "Oran konuşunca kafamda oturdu: yay gibi çizgi ne, taralı kutu ne. Şimdi işareti süs sanmak istemiyorum; kapı açılımı okunsun.",
  "cad-temel-5":
    "İşaret konuşunca ürperdim: usta kadar çizmek şart mı deniyor. Şimdi süslü kanepeyi oda sanmak istemiyorum; dikdörtgen dursun.",
  "cad-temel-6":
    "Oda konuşunca içim yandı: vitrin hâlâ bulanık kare. Şimdi WhatsApp fotoğrafını plan sanmak istemiyorum; tarihli kâğıt dursun.",
  "pra-temel-2":
    "İçimden şunu geçirdim: komşu hızlı yazıyor, mahallede olmayan fırını «köşede» diyor. Şimdi «yapıver» deyip camı boş bırakmak istemiyorum; ne, kim, uzunluk yazılsın.",
  "pra-temel-3":
    "İstek konuşunca ferahladım. Şimdi kimlik numarasını sohbete yapıştırmak istemiyorum; vesikalık caddeye asılmaz.",
  "pra-temel-4":
    "Sır konuşunca kafamda oturdu: dünkü pasta tarifi bugünkü site yazısına karışıyor. Şimdi tek kutuya kırk iş sıkıştırmak istemiyorum; her iş ayrı çekmece dursun.",
  "pra-temel-5":
    "Çekmece konuşunca ürperdim: taslak olduğu gibi gişeye gidiyor. Şimdi uydurma maddeyi imza saymak istemiyorum; prova okunsun, sen imzala.",
  "pra-temel-6":
    "Prova konuşunca içim yandı: üç iş, sıfır kontrol, «makine yazdı». Şimdi resmi gönderimi taslak saymak istemiyorum; üç çıktı tarihli, sır yok, prova var.",
};

export function academyPreviousLessonKey(lessonKey: string): string | null {
  const match = /^(.*-)(\d+)$/u.exec(lessonKey.trim());
  if (!match) {
    return null;
  }
  const index = Number(match[2]);
  if (!Number.isInteger(index) || index <= 1) {
    return null;
  }
  return `${match[1]}${index - 1}`;
}

export function academyAudienceCompassForLesson(lessonKey: string): string {
  const job = ACADEMY_LESSON_COMPASS[lessonKey]?.job ?? "Bu derste masadaki işi dürüstçe bitirmeyi konuşuyoruz.";
  const rest = job.replace(/^Bu derste /u, "");
  return `${ACADEMY_COMPASS_ANCHOR} Eğer sen bu masada duruyorsan, ${rest}`;
}

type FieldAsks = {
  gelisme: string;
  vaka: string;
  params: string;
};

const FIELD_ASKS: Record<string, FieldAsks> = {
  "rail-temel": {
    gelisme: "ödeme ekranında ikinci bir bakiye satırı gördüğünde içinden geçen ilk cümle ne olur, nerede durursun?",
    vaka: "Koray Bey olarak soruyorum: iki ekran farklı tutar basarsa sen masada nasıl bir dürüstlük seçersin?",
    params: "Parametre kutusuna geçmeden önce hangi kaydı dürüst bırakırsın?",
  },
  "rayli-sinyal-emniyet": {
    gelisme: "ekran aynı anda hem «yükleniyor» hem «başarılı» demek istediğinde ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: istemci formu gerçekten sunucu kapısı mıdır, yoksa başka bir şey mi?",
    params: "Parametre kutusuna geçmeden önce API sözleşmesinde ne durur?",
  },
  "yz-icerik-gorsel-uretim": {
    gelisme: "ajanslar veya sosyal medya yöneticileri Midjourney, ChatGPT veya Gemini ile görsel üretirken en çok nerede zaman kaybediyor?",
    vaka: "Koray Bey olarak soruyorum: müşteri hem tek kare hem on iki renk derse Midjourney'e basmadan önce masada ne olur?",
    params: "ChatGPT veya OpenAI Playground kutusuna geçmeden önce tarifte ne netleşmiş olmalı?",
  },
  "ileri-prompt-muhendisligi": {
    gelisme: "belirsiz bir istek cümlesi ChatGPT veya Claude'a gelmeden üretimi nerede, hangi gerekçeyle kesersin?",
    vaka: "Koray Bey olarak soruyorum: Gemini veya araç kapalıyken güncel kur uydurmak sahada nasıl bir yalan doğurur?",
    params: "OpenAI Playground parametre kutusuna geçmeden önce hangi katmanlar ayrı durur?",
  },
  "bim-iso-19650": {
    gelisme: "belirsiz «ucuza bak» teklifinde işi nerede, hangi cümleyle kesersin?",
    vaka: "Koray Bey olarak soruyorum: WhatsApp eki gerçekten teslim midir, yoksa ne eksik kalır?",
    params: "Parametre kutusuna geçmeden önce SOW’da ne durur?",
  },
  "siber-guvenlik-kvkk-iso-27001": {
    gelisme: "ESG’siz «güvenliyiz» iddiasını duyduğunda ilk sorduğun soru ne olur?",
    vaka: "Koray Bey olarak soruyorum: log silmek olayı bitirir mi, yoksa ne eksik kalır?",
    params: "Parametre kutusuna geçmeden önce hangi kanıt satırı durur?",
  },
  "python-veri-analizi-is-zekasi": {
    gelisme: "tipi belirsiz kolonda ortalama istenince içinden geçen ilk itiraz ne olur?",
    vaka: "Koray Bey olarak soruyorum: 3D pasta kanıt grafiği midir, yoksa neyi gizler?",
    params: "Parametre kutusuna geçmeden önce formülde ne yazılıdır?",
  },
  "python-temel": {
    gelisme: "tırnaksız print yazınca ne kırılır ve nasıl düzeltirsin?",
    vaka: "Koray Bey olarak soruyorum: input her zaman sayı mıdır, yoksa ne döner?",
    params: "Parametre kutusuna geçmeden önce hangi tipi doğrularsın?",
  },
  "python-orta": {
    gelisme: "paydası belirsiz bir yüzdeyi görünce ilk sorduğun soru ne olur?",
    vaka: "Koray Bey olarak soruyorum: f-string Yapılandırılmış Sorgu Dili güvenli midir, yoksa ne eksik?",
    params: "Veri boru hattına geçmeden önce hangi sözleşme satırı durur?",
  },
  "python-ileri": {
    gelisme: "şemasız sözlük gövde gelince rotayı nerede, hangi kodla kesersin?",
    vaka: "Koray Bey olarak soruyorum: hep iki yüz dönmek dürüst müdür, yoksa neyi gizler?",
    params: "Docker’a geçmeden önce hangi testler yeşil olmalı?",
  },
  "ai-temel": {
    gelisme: "bağlam penceresi dolunca sessiz özet uydurmak yerine ne yaparsın?",
    vaka: "Koray Bey olarak soruyorum: «JSON gibi yaz» demek mod açmak mıdır, yoksa ne eksik?",
    params: "Structured output’a geçmeden önce hangi şema satırı durur?",
  },
  "ai-orta": {
    gelisme: "getirici boş dönünce modeli genel bilgiyle doldurur musun, yoksa ne olur?",
    vaka: "Koray Bey olarak soruyorum: kaynak satırı olmayan Artırılmış Geri Çapraz Sorgulama cevabı teslim midir?",
    params: "Boru hattına geçmeden önce parça boyutu ve örtüşme yazılı mı?",
  },
  "ai-ileri": {
    gelisme: "riskli araç çağrısında insan onayı yokken ajanı durdurur musun?",
    vaka: "Koray Bey olarak soruyorum: değerlendirme klasörü boş çoklu ajan denemesi teslim midir?",
    params: "LangGraph’a geçmeden önce araç şeması ve hata düğümü durur mu?",
  },
  "fullstack-temel": {
    gelisme: "ağ sekmesinde beş yüz varken ekran yeşil tik basınca ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: durum kodunu okumadan «iş bitti» demek dürüst müdür, yoksa ne eksik?",
    params: "Parametre kutusuna geçmeden önce istek-yanıtta hangi satır dürüst durur?",
  },
  "fullstack-orta": {
    gelisme: "ekran aynı anda hem «yükleniyor» hem «başarılı» demek istediğinde ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: üç doğru-yanlış bayrağı gerçekten Tek Gerçek Kaynak mıdır, yoksa ne eksik kalır?",
    params: "Parametre kutusuna geçmeden önce faz makinesinde ne durur?",
  },
  "fullstack-ileri": {
    gelisme: "şemasız Post iki yüz basınca kapıyı nerede, hangi gerekçeyle kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: istemci formu gerçekten sunucu kapısı mıdır, yoksa başka bir şey mi?",
    params: "TestClient’a geçmeden önce Zod, JavaScript Nesne Gösterimi Web Jetonu ve göç satırı durur mu?",
  },
  "devops-temel": {
    gelisme: "«bulutta eşittir güvendeyiz» dendiğinde ilk kestığın katman neresi?",
    vaka: "Koray Bey olarak soruyorum: Hizmet Olarak Yazılımda çok faktörlü kimlik kapalıysa sorumluluk kimde kalır?",
    params: "Envanter tablosuna geçmeden önce kullanıcı, port ve ortam satırı durur mu?",
  },
  "devops-orta": {
    gelisme: "kırmızı test varken sürekli teslimatı ilerletme isteği gelince ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: imzasız en son etiket imaj tanıma kapısı açar mı?",
    params: "Yayına geçmeden önce geri alma satırı yazılı mı?",
  },
  "devops-ileri": {
    gelisme: "kritik bilinen açıklık sarıya boyanıp birleştirme istenince kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: logo ve politika belgesi bilgi güvenliği standardı kanıtı sayılır mı?",
    params: "Kapanış laboratuvarına geçmeden önce tehdit modeli ve ihlal bildirimi durur mu?",
  },
  "flutter-temel": {
    gelisme: "boş olabilen yazı alanına ünlem basınca boş değer gelince içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: «ekran göründü» boş değer güvenliği kanıtı sayılır mı?",
    params: "Sayaç laboratuvarına geçmeden önce tip ve yerleşim satırı durur mu?",
  },
  "flutter-orta": {
    gelisme: "sepet ikonu ile sepet sayfası farklı liste tutunca ilk kestiğin yer neresi?",
    vaka: "Koray Bey olarak soruyorum: taşıyıcı jeton paylaşılan tercihlerde güvenli midir?",
    params: "Alışkanlık laboratuvarına geçmeden önce faz makinesi ve hata yüzeyi durur mu?",
  },
  "flutter-ileri": {
    gelisme: "kırmızı test varken «acil yama sonra» birleştirme istenince kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: iOS uygulama paketi oluştu teslim midir, yoksa ne eksik kalır?",
    params: "Yayın laboratuvarına geçmeden önce imza sırrı ve mağaza beyanı durur mu?",
  },
  "ds-temel": {
    gelisme: "metrik ve birimi belirsiz bir «ortalama getir» isteği gelince içinden geçen ilk itiraz ne olur?",
    vaka: "Koray Bey olarak soruyorum: kirli CSV ile EDA’ya girmek dürüst müdür, yoksa ne eksik kalır?",
    params: "EDA lab’a geçmeden önce soru tanımı ve temiz satır hazır mı?",
  },
  "ds-orta": {
    gelisme: "test skoruna bakmadan «model hazır» denince ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: leakage’lı skor sahada başarı mıdır, yoksa neyi gizler?",
    params: "Sklearn capstone’a geçmeden önce split, pipeline ve metrik satırı durur mu?",
  },
  "ds-ileri": {
    gelisme: "train loss düşerken val kaybı artınca içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: checkpoint’sız gece eğitimi teslim midir, yoksa ne eksik kalır?",
    params: "Deploy lab’a geçmeden önce metrik, drift kontrolü ve uç nokta satırı hazır mı?",
  },
  "sec-temel": {
    gelisme: "«merak ettim, komşu ağı taradım» dendiğinde ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: etkileşim kuralları yokken ping atmak etik güvenlik değerlendirmesi midir, yoksa ne eksik kalır?",
    params: "Laboratuvar haritasına geçmeden önce izin listesi ve gizlilik-bütünlük-erişilebilirlik satırı durur mu?",
  },
  "sec-orta": {
    gelisme: "canlı sitede «bir Yapılandırılmış Sorgu Dili denemesi» istenince kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: ekran görüntüsü tek başına bulgu kapanışı mıdır, yoksa ne eksik kalır?",
    params: "Kapanış raporuna geçmeden önce Açık Web Uygulaması Güvenlik Projesi sınıfı, kanıt ve yeniden test satırı durur mu?",
  },
  "sec-ileri": {
    gelisme: "kabuk kodu veya silahlı kavram kanıtı istenince içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: sınıf analizi olmadan «sömürü geliştirdim» teslim midir, yoksa ne eksik kalır?",
    params: "Kapanışa geçmeden önce etkileşim kuralları, mavi tespit ve yeniden test satırı hazır mı?",
  },
  "db-temel": {
    gelisme: "birincil ve yabancı anahtar yazılmadan «ilişki var» denince ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: denormalize tablo her zaman hız mıdır, yoksa ne bozulur?",
    params: "Kapanış şemasına geçmeden önce Varlık İlişki, normal form ve Atomiklik-Tutarlılık-İzolasyon-Dayanıklılık satırı durur mu?",
  },
  "db-orta": {
    gelisme: "Dizin eklemeden «sorgu yavaş» diye işlemciyi suçlayınca kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: sorgu planı dökümü okunmadan «optimize ettik» kanıt mıdır, yoksa ne eksik kalır?",
    params: "Ayar laboratuvarına geçmeden önce plan, dizin ve istatistik satırı durur mu?",
  },
  "db-ileri": {
    gelisme: "Apache Kafka’ya yazmadan Redis’e «kaynak gerçek» denince içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: çıkış kutusuz çift yazım güvenilir midir, yoksa ne kırılır?",
    params: "Kapanış borusuna geçmeden önce konu, ofset ve eşgüçlülük satırı hazır mı?",
  },
  "arch-temel": {
    gelisme: "Her alanı public bırakıp «OOP yaptık» denince ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: God class’ı üç sınıfa bölmek SOLID midir, yoksa ne eksik kalır?",
    params: "Capstone lab’a geçmeden önce SRP, DIP ve koku satırı durur mu?",
  },
  "arch-orta": {
    gelisme: "Her soruna kalıp yapıştırınca «mimari» denince kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: Singleton her yerde DI yerine geçer mi, yoksa ne bozulur?",
    params: "Pattern lab’a geçmeden önce sorun–kalıp gerekçesi ve port sınırı durur mu?",
  },
  "arch-ileri": {
    gelisme: "Servis sayısını artırıp «ölçekledik» denince içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: outbox’sız saga güvenilir midir, yoksa ne kırılır?",
    params: "Capstone’a geçmeden önce bounded context, idempotency ve gözlem satırı hazır mı?",
  },
  "pm-temel": {
    gelisme: "«Patron istedi»yi kullanıcı hikayesi sanınca ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: kabul ölçütü olmayan kart biriktirme listesine girer mi, yoksa ne eksik kalır?",
    params: "Biriktirme listesi laboratuvarına geçmeden önce rol, problem ifadesi ve kabul ölçütü satırı durur mu?",
  },
  "pm-orta": {
    gelisme: "«Çevik olduk» afişiyle hazır tanımı / bitti tanımı yokken kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: kart silerek kalan iş grafiğini yeşiltmek dürüst müdür, yoksa ne bozulur?",
    params: "Sprint laboratuvarına geçmeden önce hedef, devam eden iş limiti ve iş akışı bitti şartı durur mu?",
  },
  "pm-ileri": {
    gelisme: "Süs sayfa görüntülemesini başarı sayınca içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: koruma rayı kırıkken birincil metrik yeşil olsa öldürme anahtarı çekilir mi?",
    params: "Kapanışa geçmeden önce hedefler ve anahtar sonuçlar, ikili karşılaştırma speki, öldürme anahtarı ve karar kaydı hazır mı?",
  },
  "ux-temel": {
    gelisme: "Güzel ekranı Kullanıcı Deneyimi kanıtı sayınca ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: kanıtsız persona kullanıcı yolculuğu mudur, yoksa ne eksik kalır?",
    params: "Tel çerçeve laboratuvarına geçmeden önce araştırma, bilgi mimarisi ve gri iskelet durur mu?",
  },
  "ux-orta": {
    gelisme: "Tasarım jetonu olmadan rastgele rengi sistem sanınca kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: kontrastı kırık ekran Web İçeriği Erişilebilirlik Kılavuzu’ndan geçer mi, yoksa ne bozulur?",
    params: "Tasarım Sistemi laboratuvarına geçmeden önce jeton, bileşen, varyant ve prototip durur mu?",
  },
  "ux-ileri": {
    gelisme: "Görüntü dosyası atıp «el teslimi bitti» denince içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: Sistem Kullanılabilirlik Ölçeği olmadan beğeni skoru kullanılabilirlik midir, yoksa ne eksik kalır?",
    params: "Kapanışa geçmeden önce el teslimi, erişilebilir kod ve Sistem Kullanılabilirlik Ölçeği satırı hazır mı?",
  },
  "w3-temel": {
    gelisme: "«Postgres’imiz blockchain» denince ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: tohum cümlesi Slack’te güvenli midir, yoksa ne eksik kalır?",
    params: "SimpleStorage laboratuvarına geçmeden önce özet, gas ve görünürlük satırı durur mu?",
  },
  "w3-orta": {
    gelisme: "OpenZeppelin kopyalayıp kontrol listesi yazmadan «güvenli jeton» denince kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: yeniden giriş testi olmadan ana ağ dağıtımı dürüst müdür, yoksa ne bozulur?",
    params: "Ethereum Yorum Talebi yirmi laboratuvarına geçmeden önce Kontrol-Etki-Etkileşim, erişim ve test takımı satırı hazır mı?",
  },
  "w3-ileri": {
    gelisme: "Uzak yordam zaman aşımında «Takas tamam» bildirimi basınca içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: tarayıcı deposu bakiyesi zincir Tek Gerçek Kaynağı sayılır mı, yoksa ne eksik kalır?",
    params: "Kapanışa geçmeden önce zincir kimliği koruması, minOut ve hata anında kapalı durum satırı durur mu?",
  },
  "ex-temel": {
    gelisme: "Üç Excel kopyasında farklı toplam görünce ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: elle basılmış 12.450 toplam formül müdür, yoksa ne eksik kalır?",
    params: "Temizleme laboratuvarına geçmeden önce Tablo, $ sabiti ve Özet Tablo satırı durur mu?",
  },
  "ex-orta": {
    gelisme: "Yenileme kırmızıyken «bugünün rakamı» sunulunca kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: Satır Düzeyi Güvenlik olmadan gizli sayfa veri korur mu, yoksa ne bozulur?",
    params: "Gösterge panosu laboratuvarına geçmeden önce sorgu, model, ölçü ve ilişki satırı hazır mı?",
  },
  "ex-ileri": {
    gelisme: "Uygulama Programlama Arayüzü anahtarı hücrede A1’de görünce içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: Hipermetin Aktarım Protokolü beş yüz hatasında dünkü kuru yazmak dürüst müdür, yoksa ne eksik kalır?",
    params: "Kapanış Çalışmasına geçmeden önce Özellikler sır, durum kapısı ve eşgüçlü test durur mu?",
  },
  "mkt-temel": {
    gelisme: "Ölçümsüz «Reklam Harcamasının Geri Dönüşü dört kat» iddiasında ilk kestiğin yer neresi?",
    vaka: "Koray Bey olarak soruyorum: Satın Alma olayı yokken kampanya mühürlenir mi, yoksa ne eksik kalır?",
    params: "Rapor laboratuvarına geçmeden önce piksel sözlüğü, yapı ve payda satırı durur mu?",
  },
  "mkt-orta": {
    gelisme: "Kör Performans Maksimumu ve etiketsiz hesapta kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: test siparişleri gerçek dönüşüm müdür, yoksa ne bozulur?",
    params: "Arama ve Görüntülü laboratuvarına geçmeden önce anahtar kelime, olumsuz, marka güvenliği ve açık rıza satırı hazır mı?",
  },
  "mkt-ileri": {
    gelisme: "Paydasız Reklam Harcamasının Geri Dönüşü’nü yatırımcı slaydına koyunca içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: dizine kapalı adreste içerik kampanyası Bitti midir, yoksa ne eksik kalır?",
    params: "Kapanışa geçmeden önce niyet, brif, huni, koruma rayı ve geri dönüş / edinim maliyeti kartı durur mu?",
  },
  "mnt-temel": {
    gelisme: "«Herkese hitap eden kanal» deyince ilk kestiğin yer neresi?",
    vaka: "Koray Bey olarak soruyorum: yüksek tıklama oranı + düşük ortalama izlenme süresi zafer midir, yoksa ne kırılır?",
    params: "Büyüme laboratuvarına geçmeden önce niş, senaryo, küçük resim ve metrik satırı durur mu?",
  },
  "mnt-orta": {
    gelisme: "Uzun videoyu dikey kırpıp kısa dikey video sayınca kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: lisanssız müzik final midir, yoksa ne bozulur?",
    params: "Prodüksiyon laboratuvarına geçmeden önce kanca, dokuz on altı belirtim ve yayın ritmi durur mu?",
  },
  "mnt-ileri": {
    gelisme: "«Garantili aylık gelir» açılış sayfası görünce içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: katkı negatifken ciro artışı ölçek midir, yoksa ne eksik kalır?",
    params: "Kapanış laboratuvarına geçmeden önce doğrulama, hizmet seviyesi, birim ekonomi ve gelir-vaadi yasağı hazır mı?",
  },
  "pd-temel": {
    gelisme: "«Garantili ikna» vaadi gelince ilk kestiğin yer neresi?",
    vaka: "Koray Bey olarak soruyorum: sessizlik onay sayılır mı, yoksa ne eksik kalır?",
    params: "Beş dakikalık laboratuvara geçmeden önce rıza, amaç-kanıt-çağrı ve dinleyici haritası durur mu?",
  },
  "pd-orta": {
    gelisme: "«Sen toksiksin» etiketiyle geri bildirim verilince kapıyı nerede kırmızıya çekersin?",
    vaka: "Koray Bey olarak soruyorum: asansörde performans konuşması dürüst müdür, yoksa ne bozulur?",
    params: "Orta laboratuvara geçmeden önce Durum-Davranış-Etki, hazırlık kartı ve çıkar haritası satırı hazır mı?",
  },
  "pd-ileri": {
    gelisme: "«Fark ettirmeden yönlendir» Nöro-Dilsel Programlama iddiasında içinden geçen ilk cümle ne olur?",
    vaka: "Koray Bey olarak soruyorum: yirmi bir günde kesin değiş garantisi kabul müdür, yoksa ne eksik kalır?",
    params: "Kapanış Uygulaması’na geçmeden önce etik sınır, Eisenhower Öncelik Matrisi, zaman kutusu ve alışkanlık döngüsü durur mu?",
  },
  "cld-temel": {
    gelisme: "«buluttayız, güvendeyiz» dendiğinde ilk kestığın yer neresi — şalter, kasa, çit, garaj, depo yoksa fiş?",
    vaka: "Koray Bey olarak soruyorum: kök kullanıcı ile üretim kovası açmak dürüst müdür, yoksa ne eksik kalır?",
    params: "Fatura laboratuvarına geçmeden önce fatura sahibi, kimlik, çit, örnek, kova ve bütçe eşiği durur mu?",
  },
  "cld-orta": {
    gelisme: "Gişesiz caddeye «yüksek erişilebilirlik» yazınca ilk kestığın yer neresi — dinleyici, sağlık, tavan yoksa çit?",
    vaka: "Koray Bey olarak soruyorum: tek sanal makine yük dengeleyici midir, yoksa ne eksik kalır?",
    params: "Orta laboratuvara geçmeden önce gişe, filo min-max, mahzen yedeği ve mutfak tavanı durur mu?",
  },
  "cld-ileri": {
    gelisme: "Dizüstünden üretim yamalayınca içinden geçen ilk cümle ne olur — şef, şablon yoksa bant?",
    vaka: "Koray Bey olarak soruyorum: küme komut satırı ile üretim yamalamak teslim midir, yoksa ne eksik kalır?",
    params: "Kapanış laboratuvarına geçmeden önce tavan, uzak durum, çekme modeli ve sır kasası durur mu?",
  },
  "eng-temel": {
    gelisme: "ham kamyon fabrikaya inmeden «rapor hazır» denince ilk kestığın yer neresi — ayıklama, ambar yoksa payda?",
    vaka: "Koray Bey olarak soruyorum: ham tabloyu gösterge panosuna bağlamak dürüst müdür, yoksa ne eksik kalır?",
    params: "Laboratuvara geçmeden önce tane, payda, ayıklama yeri ve terazi damgası durur mu?",
  },
  "eng-orta": {
    gelisme: "Makas grafında döngü görünce ilk kestığın yer neresi — saat, vagon yoksa vana?",
    vaka: "Koray Bey olarak soruyorum: dizüstünde «çalıştırdım» orkestrasyon mudur, yoksa ne eksik kalır?",
    params: "Orta laboratuvara geçmeden önce graf, zamanlayıcı, kalite testi ve hat vanası durur mu?",
  },
  "eng-ileri": {
    gelisme: "Ham cevheri altın rafa koyunca içinden geçen ilk cümle ne olur — bunker, yıkama yoksa külçe?",
    vaka: "Koray Bey olarak soruyorum: tek dizüstü «kıvılcım kümesi» teslim midir, yoksa ne eksik kalır?",
    params: "Kapanış laboratuvarına geçmeden önce bronz-gümüş-altın, kıvılcım hattı ve soğuk depo faturası durur mu?",
  },
  "qa-temel": {
    gelisme: "damgasız koli «çalışıyor» deyince ilk kestığın yer neresi — senaryo, kanıt yoksa kabul?",
    vaka: "Koray Bey olarak soruyorum: ekran göründü diye damga basmak dürüst müdür, yoksa ne eksik kalır?",
    params: "Laboratuvara geçmeden önce damga, terazi, reçete ve tutanak durur mu?",
  },
  "qa-orta": {
    gelisme: "aynı koli bazen yeşil bazen kırmızı olunca ilk kestığın yer neresi — tutuş, karantina yoksa bariyer?",
    vaka: "Koray Bey olarak soruyorum: kırmızıyı üç kez koşup yeşil almak damga mıdır, yoksa ne eksik kalır?",
    params: "Orta laboratuvara geçmeden önce kol, kararsız yasağı, bariyer ve kapı durur mu?",
  },
  "qa-ileri": {
    gelisme: "ortalama yeşil kuyruk kırmızı olunca içinden geçen ilk cümle ne olur — fiş, bütçe yoksa tezgâh?",
    vaka: "Koray Bey olarak soruyorum: elle tıklayarak stres yapmak tezgâh mıdır, yoksa ne eksik kalır?",
    params: "Kapanış laboratuvarına geçmeden önce protokol, baraj ve yüzde doksan beş bütçe durur mu?",
  },
  "jav-temel": {
    gelisme: "yeşil geçmeden paket basınca ilk kestığın yer neresi — motor, makine yoksa damga?",
    vaka: "Koray Bey olarak soruyorum: konsolda yazdırmak damga mıdır, yoksa ne eksik kalır?",
    params: "Laboratuvara geçmeden önce motor, kalıp, makine ve damga durur mu?",
  },
  "jav-orta": {
    gelisme: "şemasız koli içeri itilince ilk kestığın yer neresi — gişe, dört yüz yoksa kapı?",
    vaka: "Koray Bey olarak soruyorum: düğmeyi gizlemek bekçi midir, yoksa ne eksik kalır?",
    params: "Orta laboratuvara geçmeden önce resepsiyon, şema yasağı ve şifreli kapı durur mu?",
  },
  "jav-ileri": {
    gelisme: "bir banka gördü öbürü gelmedi deyince içinden geçen ilk cümle ne olur — oda, fiş yoksa kule?",
    vaka: "Koray Bey olarak soruyorum: kuyruğa ayrı yazmak transfer odası mıdır, yoksa ne eksik kalır?",
    params: "Kapanış laboratuvarına geçmeden önce oda, kasa ve kule durur mu?",
  },
  "rn-temel": {
    gelisme: "ekran görününce pasaport sandığında ilk kestığın yer neresi — kabuk, etiket yoksa bant?",
    vaka: "Koray Bey olarak soruyorum: tarayıcı damgası iki ülkeye giriş belgesi midir, yoksa ne eksik kalır?",
    params: "Laboratuvara geçmeden önce pasaport, vitrin ve kaydırma bandı durur mu?",
  },
  "rn-orta": {
    gelisme: "anten yokken yeşil tik basınca ilk kestığın yer neresi — kuyruk, kasa yoksa yasak?",
    vaka: "Koray Bey olarak soruyorum: çekmeyen telefonda «gönderildi» sahte yeşil midir, yoksa ne eksik kalır?",
    params: "Orta laboratuvara geçmeden önce emanet kasası, sahte yeşil yasağı ve şifreli depo durur mu?",
  },
  "rn-ileri": {
    gelisme: "paket oluştu deyince içinden geçen ilk cümle ne olur — tercüman, gişe yoksa tutanak?",
    vaka: "Koray Bey olarak soruyorum: iOS uygulama paketi oluştu teslim midir, yoksa ne eksik kalır?",
    params: "Kapanış laboratuvarına geçmeden önce tercüman, gişe ve tutanak durur mu?",
  },
  "gam-temel": {
    gelisme: "ekran açılınca sahne sandığında ilk kestığın yer neresi — hiyerarşi, ip yoksa gövde?",
    vaka: "Koray Bey olarak soruyorum: Play tuşu prova midir, yoksa ne eksik kalır?",
    params: "Laboratuvara geçmeden önce sahne, kukla ipleri ve fizik durur mu?",
  },
  "gam-orta": {
    gelisme: "otomat yeşil basınca ilk kestığın yer neresi — fiş, damga yoksa etiket?",
    vaka: "Koray Bey olarak soruyorum: ağ yokken «satın alındı» sahte yeşil midir, yoksa ne eksik kalır?",
    params: "Orta laboratuvara geçmeden önce jeton otomatı, montaj hattı ve paketleme kutusu durur mu?",
  },
  "gam-ileri": {
    gelisme: "önce basalım deyince içinden geçen ilk cümle ne olur — dekor, gişe yoksa tutanak?",
    vaka: "Koray Bey olarak soruyorum: şans çarkı dürüst gişe midir, yoksa ne eksik kalır?",
    params: "Kapanış laboratuvarına geçmeden önce dekor, dürüst vaat ve kumar yasağı tutanağı durur mu?",
  },
  "mlo-temel": {
    gelisme: "notebook açılınca defter sandığında ilk kestığın yer neresi — parti, reçete yoksa damga?",
    vaka: "Koray Bey olarak soruyorum: notebook kopyası sevk midir, yoksa ne eksik kalır?",
    params: "Laboratuvara geçmeden önce defter, reçete kağıdı ve Model Sicili durur mu?",
  },
  "sys-temel": {
    gelisme: "sunucu açılınca kavşak sandığında ilk kestığın yer neresi — lamba, vitrin yoksa şube?",
    vaka: "Koray Bey olarak soruyorum: tek kutu gişesi kavşak mıdır, yoksa ne eksik kalır?",
    params: "Laboratuvara geçmeden önce lamba, vitrin ve mahalle PTT durur mu?",
  },
  "canva-temel": {
    gelisme: "boş sayfa açınca insan kendini grafiker mi sanıyor, yoksa evdeki koltuğu mu arıyor?",
    vaka: "Koray Bey olarak soruyorum: beş iş bir karede vitrin midir, yoksa ne eksik kalır?",
    params: "Tıklama listesine geçmeden önce iş cümlesi, ölçü ve tek mesaj durur mu?",
  },
  "linkedin-temel": {
    gelisme: "insan profili neden «sonra doldururum» diye bırakıyor? Kapı tabelası sonra mı asılır?",
    vaka: "Koray Bey olarak soruyorum: «Profilim var» ama fotoğraf yok, başlık dört şapka — kapı tabelası mıdır, yoksa ne eksik kalır?",
    params: "Tıklama listesine geçmeden önce fotoğraf, başlık ve hakkında durur mu?",
  },
  "cad-temel": {
    gelisme: "insan bu kâğıda neden tablo gibi bakıyor? Çizgi güzel duruyor diye oda mı anlaşılır?",
    vaka: "Koray Bey olarak soruyorum: WhatsApp’tan bulanık fotoğraf usta için plan mıdır, yoksa ne eksik kalır?",
    params: "Tıklama listesine geçmeden önce kat, oda ve ölçü yazısı durur mu?",
  },
  "pra-temel": {
    gelisme: "stüdyoda hep «doğru mu anlıyorum» diye soruyorum — makineye de aynı nezaket mi lazım, yoksa «yapıver» yeter mi?",
    vaka: "Koray Bey olarak soruyorum: makine taslağı imzalanmış dilekçe midir, yoksa ne eksik kalır?",
    params: "Tıklama listesine geçmeden önce istek, sır ve prova durur mu?",
  },
  "kurumsal-esg-surdurulebilirlik": {
    gelisme: "yetkisiz taramayı pentest sanan birine ilk hangi soruyu sorarsın?",
    vaka: "Koray Bey olarak soruyorum: demo Done sayılır mı, yoksa ne eksik kalır?",
    params: "Parametre kutusuna geçmeden önce Bitti Tanımı durur mu?",
  },
  "agile-scrum-masterlik": {
    gelisme: "acil ödeme postası geldiğinde içinden geçen ilk üç kontrol ne olur?",
    vaka: "Koray Bey olarak soruyorum: ortak parola fail-safe midir, yoksa hangi kapı eksiktir?",
    params: "Parametre kutusuna geçmeden önce MFA durur mu?",
  },
  "bulut-mimarisi-devops": {
    gelisme: "dizüstünden üretim basma isteği geldiğinde ilk kestığın yer neresi?",
    vaka: "Koray Bey olarak soruyorum: test kırmış paket ilerler mi, yoksa ne olur?",
    params: "Parametre kutusuna geçmeden önce ortam adı durur mu?",
  },
  "ui-ux-design-systems": {
    gelisme: "Figma’da süs animasyonunun görevi gizlediğini fark ettiğinde neyi kesersin?",
    vaka: "Koray Bey olarak soruyorum: beğeni kabul ölçütü müdür, yoksa neyi kaçırırız?",
    params: "Parametre kutusuna geçmeden önce görev cümlesi durur mu?",
  },
  "fintek-acik-bankacilik": {
    gelisme: "ölçüsüz «güzelleştir» isteği geldiğinde gereksinimi nerede netleştirirsin?",
    vaka: "Koray Bey olarak soruyorum: demo Done sayılır mı, yoksa kabul ölçütü ne ister?",
    params: "Parametre kutusuna geçmeden önce kabul ölçütü durur mu?",
  },
};

const DEFAULT_ASKS: FieldAsks = {
  gelisme: "masada iş bozulduğunda ilk durduğun yer neresi, neden orası?",
  vaka: "Koray Bey olarak soruyorum: bu vakada orta değer uydurulur mu, yoksa ne netleşmeli?",
  params: "Parametre kutusuna geçmeden önce hangi kayıt dürüst durur?",
};

export function academyFieldAsksForSlug(slug: string): FieldAsks {
  return FIELD_ASKS[slug] ?? DEFAULT_ASKS;
}

export function academyFieldAskNeedles(): string[] {
  const needles = new Set<string>();
  for (const asks of Object.values(FIELD_ASKS)) {
    needles.add(asks.gelisme);
    needles.add(asks.vaka);
    needles.add(asks.params);
  }
  needles.add(DEFAULT_ASKS.gelisme);
  needles.add(DEFAULT_ASKS.vaka);
  needles.add(DEFAULT_ASKS.params);
  return [...needles];
}
