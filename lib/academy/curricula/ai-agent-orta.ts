/**
 * AI Agent Orta Seviye — Çoklu ajan ve RAG mimarisi (AI-102).
 * PEDAGOJI.md: 4 perde, tek eğitmen, Fail-Closed.
 * Sakin vatandaş dili, 2. dersten bölüm tekrarı, satır satır kod.
 * Metin birebir: academyInstructor* şablon önekleri kapalıdır.
 */

import type { AcademyExamQuestion } from "@/lib/academy/types";
import {
  academyInstructorLessonDraft,
  type AcademyLessonDraft,
} from "@/lib/academy/curricula/types";

/**
 * Gemini Flash TTS RPD/RPM kilitliyken Ders 4–6 ses bağları pasif.
 * audioUrl / duration / mediaReleaseSeal bilinçli NULL — eski WAV veya
 * tarayıcı sesi oynatılmaz; kota sıfırlanınca bake yeniden mühürler.
 */
export const AI_AGENT_ORTA_AUDIO_HOLD = {
  "ai-agent-orta-4": {
    audioUrl: null,
    duration: null,
    mediaReleaseSeal: null,
  },
  "ai-agent-orta-5": {
    audioUrl: null,
    duration: null,
    mediaReleaseSeal: null,
  },
  "ai-agent-orta-6": {
    audioUrl: null,
    duration: null,
    mediaReleaseSeal: null,
  },
} as const;

export type AiAgentOrtaAudioHoldKey = keyof typeof AI_AGENT_ORTA_AUDIO_HOLD;

function mcq(
  id: string,
  prompt: string,
  choices: readonly [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
): AcademyExamQuestion {
  return { id, prompt, choices: [...choices], correctIndex };
}

export const AI_AGENT_ORTA_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "ai-agent-orta-1",
    order: 1,
    title: "Ajanları Gerçek Veritabanlarına Bağlamak (SQL & Fail-Closed Mimarisi)",
    intro: "Selamlar! Ben Maya. Yapay Zeka Sistemleri Uzmanıyım ve bu eğitimde seninle birlikte işletmelerin canlı sistemlerinde çalışan yapay zeka ajanları inşa edeceğiz. Bir yapay zeka ajanının, sadece metin üreten bir sohbet robotundan en temel farkı şudur: Ajan, kendisine verilen araçları (Tool) kullanarak dış dünyadaki veritabanlarına dokunur, sorgu atar ve iş yapar. Mutfaktaki şef (LLM) kararları alır, masadaki garson (Ajan) ise elindeki araç çantasıyla gidip veritabanındaki çekmeceyi açar. Bu bölümde, bir ajanı canlı bir veritabanına bağlarken güvenlik duvarını nasıl kuracağımızı ve sistemin çökmesini nasıl engelleyeceğimizi ele alacağız.",
    problem: "Bir yapay zeka ajanına doğrudan şirket veritabanının kapısını açarsanız devasa bir güvenlik riski yaratırsınız. Yapay zeka modelleri bazen \"yanılsama\" (hallucination) yaşar ve sorguları yanlış kurgulayabilir. Düşünün ki müşteri ajana \"Son 3 aydaki siparişlerimi iptal et\" dedi. Eğer ajan veritabanında sınırsız bir silme yetkisine sahipse, yanlış bir komutla tüm tabloyu silebilir (DROP TABLE). Ya da kötü niyetli bir kullanıcı ajana kışkırtıcı bir komut vererek şirket sırlarını dışarı sızdırabilir. Bu yüzden canlı sistemlerde geleneksel yazılım kuralları değil, Fail-Closed (Girişe Kapalı / Güvenli Başarısızlık) mimarisi uygulanır. Kapı kapalıysa işlem durur, ajan kafasına göre tablo uyduramaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, veritabanı bağlantısını iki temel katmana ayırıyoruz: Birincisi Read-Only yani Sadece Okuma Yetkisi. Ajan veritabanına bağlanan araçlarını (Tool) kullanırken sadece SELECT sorguları atabilir. Kod seviyesinde DELETE, UPDATE veya DROP komutları kesin olarak engellenir. İkincisi Şema Kısıtlamasıdır. Ajan veritabanındaki her tabloyu göremez. Onatılan araç fonksiyonunda (db_sorgula), ajanın önüne sadece erişebileceği belirli sütunlar verilir. Kodun içindeki kontrol mekanizması şunu yapar: Ajan doğal dille gelen isteği alır, bunu güvenli bir sorgu parametresine dönüştürür. Eğer sorguda şüpheli bir komut tespit edilirse sistem kendini kapatır (Fail-Closed) ve işlem veritabanına ulaşmadan engellenir.",
    summary: "Bu dersle birlikte bir ajanı canlı veritabanına bağlarken uyulması gereken temel güvenlik mimarisini kavradınız. Yapay zekaya asla sonsuz yetki verilmez; okuma yetkisi kısıtlanır ve Fail-Closed kuralıyla sistem korumaya alınır. Bir sonraki bölümde, kullanıcının doğal dilde söylediği bir cümleyi güvenli SQL sorgusuna dönüştüren Text-to-SQL ve Parametre Yönetimi konusunu ele alacağız. Bir sonraki bölümde görüşmek üzere.",
    quiz: [
      mcq(
        "q_ago1_1",
        "Artırılmış Geri Çapraz Sorgulama (RAG) önce ne yapar?",
        ["Pencereye 80 sayfa yığar", "Kanıt parçasını getirir, sonra üretir", "Eğitim kesitini günceller", "Boşken orta palet basar"],
        1,
      ),
      mcq(
        "q_ago1_2",
        "Getiri boşken Fail-closed (Hata Anında Kapalı) ne yapar?",
        ["Muhtemel stok uydurur", "Üretimi durdurur; kaynak yok der", "Önceki sohbeti kanıt sanır", "Eşiği sessiz sıfırlar"],
        1,
      ),
      mcq(
        "q_ago1_3",
        "Bu dersteki kelime örtüşmesi gerçek gömme midir?",
        ["Evet, aynı fizik", "Hayır; kapıyı gösterir, sahte model iddiası yoktur", "Evet, cosine zorunlu", "Yalnız GPU’da"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "BELGE = [\n    \"Ankara depo: 18 palet un.\",\n    \"Istanbul depo: 14 palet un.\",\n]\n\n\ndef gom(metin):\n    harf = []\n    for ch in metin.lower():\n        harf.append(ch if ch.isalnum() else \" \")\n    return set(\"\".join(harf).split())\n\n\ndef benzerlik(a, b):\n    if not a or not b:\n        return 0.0\n    return len(a & b) / len(a | b)\n\n\nESIK = 0.15\n\n\ndef getir(soru):\n    vektor = gom(soru)\n    aday = []\n    for parca in BELGE:\n        skor = benzerlik(vektor, gom(parca))\n        if skor >= ESIK:\n            aday.append((skor, parca))\n    aday.sort(reverse=True)\n    if not aday:\n        raise ValueError(\"kaynak yok; islem durur\")\n    return aday[0][1]\n\n\ndef uret(soru):\n    kanit = getir(soru)\n    return \"Kanit: \" + kanit\n\n\nassert \"18 palet\" in uret(\"Ankara un stok\")\ntry:\n    uret(\"Mars kolonisi\")\nexcept ValueError as hata:\n    assert \"durur\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-orta-2",
    order: 2,
    title: "Güvenli Veri Çekme (Text-to-SQL ve Parametre Yönetimi)",
    intro: "Selamlar! Ben Maya. Yapay Zeka Sistemleri Uzmanıyım ve orta seviye maratonumuza hız kesmeden devam ediyoruz. Bir önceki adımda veritabanı kapısına Fail-Closed mantığıyla bir güvenlik duvarı ördük ve ajanın yetkilerini kısıtladık. Peki ama bu ajan kullanıcının söylediği Türkçe bir cümleyi anlayıp veritabanının konuşacağı dile nasıl çevirecek? İşte burada Text-to-SQL yani doğal dilden SQL sorgusu üretme mimarisi devreye girer. Mutfaktaki şef (LLM) kullanıcının ne istediğini kavrar, bunu mantıksal bir sorgu şablonuna döker; masadaki garson (Ajan) ise bu sorguyu güvenli parametrelerle veritabanına iletir. Bu bölümde, Text-to-SQL dönüşümünü sıfır güvenlik riskiyle nasıl kurgulayacağımızı ele alacağız.",
    problem: "Geliştiricilerin Text-to-SQL sistemlerinde yaptığı en büyük ve en tehlikeli hata şudur: Modelin ürettiği SQL cümlesini alıp, hiçbir filtreden geçirmeden doğrudan veritabanına çalıştırmaktır. Eğer siz ajanın ürettiği metni doğrudan veritabanına fırlatırsanız, kötü niyetli bir kullanıcı \"Bana ürünleri getir ama arkasına bir de kullanıcı şifrelerini ekle\" diyerek SQL Injection saldırısı yapabilir. Model kullanıcıya kanıp tırnak işaretleriyle sorguyu patlatabilir. Ayrıca model veritabanı şemasını tam bilmediği için var olmayan tabloları sorgulamaya çalışıp sürekli hata üretebilir. Bu yüzden yapay zeka hiçbir zaman ham SQL çalıştırmamalıdır.",
    application: "Ekrandaki kod bloğunda gördüğünüz yapı, güvenli Text-to-SQL dönüşümünün çift katmanlı filtresidir: İlk olarak ajana veritabanının tüm şemasını değil, sadece ihtiyaç duyduğu tabloların yapısını gösteren bir JSON Şeması tanımlıyoruz. İkinci ve en kritik katman ise Prepared Statements yani Parametreli Sorgu kullanımıdır. Ajan kullanıcıdan gelen \"Ankara\" veya \"Ahmet\" gibi arama girdilerini asla SQL cümlesinin içine düz metin olarak yazamaz. Yapı şudur: SQL sorgusunun kalıbı sabit tutulur, kullanıcının girdileri sorguya güvenli bir parametre olarak enjekte edilir. Kod içerisindeki parser; ajanın ürettiği çıktıyı önce kontrol eder, tehlikeli karakterleri temizler ve sorguyu parametrelerine ayırarak veritabanı sürücüsüne teslim eder. Böylece SQL Injection riski tamamen sıfırlanmış olur.",
    summary: "Bu dersle birlikte doğal dilden veritabanı sorgusu üretirken uygulanan Text-to-SQL ve Parametre Yönetimi esaslarını kavradınız. Yapay zeka ham SQL çalıştırmaz; şema JSON ile kısıtlanır ve veriler parametreli sorgularla güvenli bir şekilde çekilir. Bir sonraki bölümde, veritabanı sınırlarından çıkıp ajanı dış dünyadaki servislere bağlayacağımız REST API ve Webhook Entegrasyonları konusunu ele alacağız. Bir sonraki bölümde görüşmek üzere.",
    quiz: [
      mcq(
        "q_ago2_1",
        "Boş koleksiyonda dürüst yol hangisidir?",
        ["Genel bilgi basar", "Fail-closed; sorgu durur", "top-k=10 uydurur", "Pencereyi şişirir"],
        1,
      ),
      mcq(
        "q_ago2_2",
        "top-k neyi garanti etmez?",
        ["Hız", "Eşik üstü kanıt; sayı dolu diye kaynak doğmaz", "JSON şema", "TTS"],
        1,
      ),
      mcq(
        "q_ago2_3",
        "Bu dersteki Koleksiyon sınıfı canlı Chroma mıdır?",
        ["Evet", "Hayır; kapıyı gösterir, sahte sürücü iddiası yoktur", "Evet, GPU zorunlu", "Yalnız REST"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "class Koleksiyon:\n    def __init__(self):\n        self.parcalar = []\n\n    def ekle(self, metin):\n        temiz = metin.strip()\n        if not temiz:\n            raise ValueError(\"bos parca; islem durur\")\n        self.parcalar.append(temiz)\n\n    def sor(self, soru, esik=0.2):\n        if not soru.strip():\n            raise ValueError(\"bos soru; islem durur\")\n        if not self.parcalar:\n            raise ValueError(\"koleksiyon bos; islem durur\")\n        hedef = set(\"\".join(ch if ch.isalnum() else \" \" for ch in soru.lower()).split())\n        aday = []\n        for parca in self.parcalar:\n            kume = set(\"\".join(ch if ch.isalnum() else \" \" for ch in parca.lower()).split())\n            if not kume:\n                continue\n            skor = len(hedef & kume) / len(hedef | kume)\n            if skor >= esik:\n                aday.append((skor, parca))\n        aday.sort(reverse=True)\n        if not aday:\n            raise ValueError(\"esik alti; islem durur\")\n        return aday[0][1]\n\n\nraf = Koleksiyon()\ntry:\n    raf.sor(\"Ankara un\")\nexcept ValueError as hata:\n    assert \"koleksiyon\" in str(hata)\nraf.ekle(\"Ankara depo: 18 palet un.\")\nassert \"18 palet\" in raf.sor(\"Ankara un\")\ntry:\n    raf.sor(\"Mars kolonisi\")\nexcept ValueError as hata:\n    assert \"esik\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-orta-3",
    order: 3,
    title: "Kurumsal Sistemlerle Entegrasyon (REST API ve Webhook Kullanımı)",
    intro: "Selamlar! Ben Maya. Yapay Zeka Sistemleri Uzmanıyım ve orta seviye maratonumuzda çok kritik bir eşiğe geldik. Şu ana kadar ne yaptık? Ajanımızı veritabanına bağladık, ona güvenli bir şekilde veri okutmayı ve doğal dilden SQL sorguları üretmeyi öğrettik. Fakat gerçek dünyada bir şirket sadece kendi veritabanından ibaret değildir. Bir e-ticaret veya yazılım şirketini düşünün: Ödeme altyapısı iYziCo veya Stripe üzerindedir, müşteri iletişim kanalı WhatsApp veya Slack'tedir, kargo takibi ise dış bir lojistik firmasının sunucularındadır. Mutfaktaki şef (LLM) kararları alır, masadaki garson (Ajan) ise elindeki araç çantasını (Tool) açarak bu dış servislerin kapısını çalar. Bir ajanın şirket içi veritabanı sınırlarından çıkıp internet üzerindeki diğer yazılımlarla konuşmasını sağlayan köprüye REST API, bu servislerden anlık haber almasını sağlayan kapıya ise Webhook diyoruz. Bu bölümde, bir yapay zeka ajanını kurumsal sistemlere nasıl entegre edeceğimizi tüm güvenlik katmanlarıyla ele alacağız.",
    problem: "Dış dünya servisleriyle çalışırken yapılan en acemice hata, ajana kontrolsüz bir şekilde API anahtarlarını emanet etmek ve dışarıdan gelen her isteğe gözü kapalı inanmaktır. Yaşanmış bir sektör örneği verelim: Bir şirket, müşteri temsilcisi ajana ödeme sisteminin API anahtarını tanımladı. Kullanıcı \"Siparişimi iptal etmek istiyorum\" dediğinde ajan doğrudan ödeme API'sine istek atıp parayı iade ediyordu. Kötü niyetli bir kullanıcı, ajanı manipüle ederek henüz teslim almadığı ve ödemesini yapmadığı ürün için iade tetikletti ve şirketi binlerce lira zarara uğrattı! Neden oldu bu? Çünkü ajan iki temel kuralı ihlal etti: Birincisi, dış servise giden isteklerde İnsan Onay Kapısı (Human-in-the-loop) yoktu. İkincisi ise dışarıdan gelen Webhook bildirimlerinin imzası (HMAC Signature Verification) doğrulanmamıştı. Yani herhangi biri dışarıdan sahte bir Webhook bildirimi göndererek ajanı \"Ödeme alındı, ürünü kargola\" diye kandırabilirdi.",
    application: "Ekrandaki kod bloğunda gördüğünüz bu mimari, kurumsal seviye bir API ve Webhook entegrasyonunun omurgasıdır. Kodumuzu iki ana bölüme ayırıyoruz: Birinci bölüm, Dış Servise İstek Atma (REST API Tooling): Koddaki odeme_iade_et fonksiyonuna dikkat edin. Ajan bu fonksiyonu tetiklemek istediğinde sistem doğrudan iYziCo API'sine gitmez. Arada bir Yetki ve Onay Katmanı çalışır. Eğer işlem tutarı belirlenen kritik eşiğin üzerindeyse, kod işlemi askıya alır ve panelde yönlendirici bir insan onayına düşürür. Ajan isteği hazırlar, header kısmına gizli Bearer Token bilgisini güvenli ortam değişkenlerinden (.env) çeker ve parametreleri JSON formatında API'ye iletir. İkinci bölüm, Dışarıdan Bildirim Alma (Webhook Listener): Bir müşteri ödeme yaptığında ödeme firması bizim sunucumuza bir Webhook bildirimi fırlatır. Koddaki verify_webhook_signature fonksiyonunu incelerseniz, gelen isteğin Header alanındaki HMAC imzasını bizim gizli anahtarımızla karşılaştırır. Eğer imza uyuşmuyorsa, istek daha ajanın önüne bile gelmeden 401 Unauthorized hatasıyla kapıdan çevrilir. İmza doğruysa, gelen veri ajanın ReAct döngüsüne \"Gözlem\" (Observation) olarak beslenir ve ajan bir sonraki adımını atar.",
    summary: "Bu dersle birlikte yapay zeka ajanlarını kurumsal REST API ve Webhook altyapılarına bağlamanın mimari esaslarını kavradınız. Ajan hiçbir zaman ham API anahtarını bünyesinde barındırmaz, dış servis istekleri güvenlik ve onay filtrelerinden geçer, dışarıdan gelen Webhook bildirimleri ise HMAC imzasıyla doğrulanmadan içeri alınmaz. Bir sonraki bölümde, tek bir ajanın yetişemediği karmaşık süreçlerde birden fazla ajanı bir arada çalıştıracağımız Çoklu Ajan Mimarileri (Multi-Agent Workflows) konusunu ele alacağız. Bir sonraki bölümde görüşmek üzere.",
    quiz: [
      mcq(
        "q_ago3_1",
        "Araştırmacı boş dönünce yazar ne yapar?",
        ["Genel paragraf basar", "Fail-closed; teslim durur", "Önceki raporu kopyalar", "top-k artırır"],
        1,
      ),
      mcq(
        "q_ago3_2",
        "Çoklu ajan neden tek ağızdan ayrılır?",
        ["Hız", "Getiri ile rapor karışmasın; rol sözleşmesi ayrı dursun", "GPU zorunlu", "JSON hızlanır"],
        1,
      ),
      mcq(
        "q_ago3_3",
        "Yazar `arastir` çağırırsa dürüst yol hangisidir?",
        ["İzin ver", "Rol dışı ad; işlem durur", "Sessizce None", "eval"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "RAF = {\"ankara\": \"Ankara depo: 18 palet un.\"}\n\n\ndef arastir(konu):\n    if konu not in RAF:\n        raise ValueError(\"kanit yok; islem durur\")\n    return RAF[konu]\n\n\ndef yaz(kanit):\n    if not isinstance(kanit, str) or not kanit.strip():\n        raise ValueError(\"bos teslim; islem durur\")\n    return \"Rapor: \" + kanit\n\n\ndef ekip(konu):\n    kanit = arastir(konu)\n    return yaz(kanit)\n\n\nassert \"18 palet\" in ekip(\"ankara\")\ntry:\n    ekip(\"mars\")\nexcept ValueError as hata:\n    assert \"kanit\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-orta-4",
    order: 4,
    title: "Çoklu Ajan Mimarileri (Multi-Agent Workflows)",
    intro: "Selamlar! Ben Maya. Yapay Zeka Sistemleri Uzmanıyım ve orta seviye maratonumuzda işin en heyecan verici boyutuna adım atıyoruz. Buraya kadar hep tek bir ajanın yeteneklerini geliştirdik: Ona veritabanı bağladık, SQL öğrettik ve dış dünya API'leriyle konuşmasını sağladık. Fakat karmaşık bir kurumsal operasyonda tek bir garson tüm restorana yetişemez. Bir kişinin hem sipariş alıp, hem mutfakta yemek pişirip, hem de kasada hesap kesmesini bekleyemezsiniz. Mutfaktaki şef (LLM) karar mekanizmasıdır; fakat sahada uzmanlaşmış birden fazla garsona (Ajan) ihtiyacımız vardır. Bir iş akışında birden fazla uzman ajanın birbiriyle haberleşerek, görev paslaşarak ve birbirini denetleyerek çalışmasına Çoklu Ajan Mimarisi (Multi-Agent Workflows) diyoruz. Bu bölümde, ekibinizi kurmayı ve bu ajanları bir Orkestra Şefi (Supervisor) gibi yönetmeyi öğreneceğiz.",
    problem: "Yazılım dünyasında çoklu ajan kurgularken yapılan en büyük hata, tek bir devasa ajana her görevi yüklemektir: \"Sen hem pazar araştırması yap, hem rakipleri analiz et, hem makale yaz, hem de yazım hatalarını düzelt.\" Tek bir ajana bu kadar çok araç ve görev yüklerseniz iki büyük felaket yaşanır: Birincisi Context Contamination yani Bağlam Kirlenmesi. Ajan rolünü unutur, verilen talimatları karıştırır ve saçmalamaya başlar. İkinci felaket ise Sonsuz Döngü ve Bütçe İsrafıdır. Ajan A, Ajan B'ye \"Sence bu doğru mu?\" der; Ajan B \"Emin değilim sen ne dersin?\" yanıtını verir ve arka planda binlerce dolarlık API faturası kabarırken sistem durur! Gerçek dünyada bu kaos engellenmezse şirketler yapay zekayı canlı sistemlerinden sökmek zorunda kalır. Çözüm: Kesin sınırlarla ayrılmış rol dağılımı ve Çıkış Durma Şartı içeren bir orkestrasyondur.",
    application: "Ekrandaki kod bloğunda, endüstri standardı olan Supervisor Mimarisi kodunu görüyorsunuz. Mimarimizi üç temel aktöre ayırdık: Birinci aktör Araştırmacı Ajan: Sadece internetten ve veritabanından ham veriyi toplamakla görevlidir. Yazım dili veya rapor biçimiyle ilgilenmez. İkinci aktör Analist ve Yazar Ajan: Araştırmacıdan gelen ham veriyi alır, anlamlandırır ve kurumsal bir rapora dönüştürür. Veritabanına veya API'lere erişim yetkisi yoktur; sadece metin işler. Üçüncü aktör Orkestra Şefi yani Supervisor Agent: İki ajanın arasındaki trafiği yöneten ana zihindir. Koddaki router fonksiyonunu incelerseniz, Supervisor gelen isteğe bakar: \"Veri eksik mi? Araştırmacıya gönder. Rapor yazılacak mı? Yazara gönder. İş bitti mi? FINISH sinyali bas ve kullanıcıya sun.\" Kod içerisindeki Max Iteration yani Maksimum Adım Sınırı kuralına çok dikkat edin. Ajanlar kendi arasında en fazla 3 tur paslaşabilir. Eğer 3. turda sonuca ulaşılamadıysa sistem kendiliğinden güvenli bir şekilde durur ve sonsuz döngü faturası engellenmiş olur.",
    summary: "Bu dersle birlikte kompleks iş süreçlerini tek bir ajana yüklemek yerine, rol dağılımı yapılmış Çoklu Ajan Mimarileri kurmayı kavradınız. Ajanlar uzmanlıklarına göre ayrılır, aralarındaki trafik bir Supervisor tarafından yönetilir ve maksimum adım sınırıyla bütçe güven altına alınır. Bir sonraki bölümde, sistemler çöktüğünde veya API'ler yanıt vermediğinde ajanın saçmalamadan ayakta kalmasını sağlayan Hata Yönetimi ve Graceful Degradation konusunu ele alacağız. Bir sonraki bölümde görüşmek üzere.",
    quiz: [
      mcq(
        "q_ago4_1",
        "Ortak durumda eksik anahtarda dürüst yol hangisidir?",
        ["Boş string uydurur", "Fail-closed; işlem durur", "Önceki turu yapıştırır", "None basar"],
        1,
      ),
      mcq(
        "q_ago4_2",
        "Kısa bellek ile uzun bellek farkı nedir?",
        ["Yoktur", "Kısa bu turun defteri; uzun raftaki kanıt", "İkisi de GPU", "Kısa JSON’dur"],
        1,
      ),
      mcq(
        "q_ago4_3",
        "`kanit` anahtarını kim yazar?",
        ["Yazar ajan", "Yalnız araştırmacı; tek yazar kuralı", "Her ikisi yarışır", "Kullanıcı şiiri"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "class Durum:\n    def __init__(self):\n        self.defter = {}\n\n    def yaz(self, anahtar, deger):\n        if not anahtar or not isinstance(deger, str) or not deger.strip():\n            raise ValueError(\"bos durum; islem durur\")\n        self.defter[anahtar] = deger\n\n    def oku(self, anahtar):\n        if anahtar not in self.defter:\n            raise ValueError(\"anahtar yok; islem durur\")\n        return self.defter[anahtar]\n\n\ndefter = Durum()\ntry:\n    defter.oku(\"kanit\")\nexcept ValueError as hata:\n    assert \"anahtar\" in str(hata)\ndefter.yaz(\"kanit\", \"Ankara depo: 18 palet un.\")\nassert \"18 palet\" in defter.oku(\"kanit\")",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-orta-5",
    order: 5,
    title: "Hata Yönetimi ve Graceful Degradation",
    intro:
      "Selamlar! Ben Maya. Yapay Zeka Sistemleri Uzmanıyım ve orta seviye maratonumuzun son teorik eşiğine geldik. Ajanımızı veritabanına bağladık, dış API'lerle konuşturduk ve çoklu ajan ekipleri kurduk. Ancak üretken yapay zeka sistemlerinde altın bir kural vardır: Mükemmel çalışan bir API veya hiç çökmeyen bir veritabanı yoktur. Dış dünya kaosla doludur. Dışarıdan bağlandığınız bir ödeme servisi anlık yanıt vermeyebilir, veritabanınız ağır bir yük altında kilitlenebilir veya yapay zeka modelinin kendisi o an yanıt üretemeyebilir. Mutfaktaki şef (LLM) donduğunda veya garsonun (Ajan) elindeki araç bozulduğunda sistemin komple çökmemesi gerekir. Bir sistemin acil durumlarda tamamen durmak yerine, yeteneklerini kademeli olarak düşürerek kullanıcıya güvenli hizmet vermeye devam etmesine Graceful Degradation diyoruz. Bu bölümde, kurumsal bir ajanın kriz anında nasıl ayakta kalacağını inşa edeceğiz.",
    problem:
      "Sektördeki en acemi hatalardan biri, yapay zeka sistemlerini sanki hiç hata almayacakmış gibi pembe bir dünyada kodlamaktır. Düşünün ki bir bankacılık veya e-ticaret ajanı kurdunuz. Müşteri ajana \"Son siparişimin kargo durumunu öğren\" dedi. O sırada kargo firmasının sunucusu çöktü ve API 503 hatası döndü. Eğer siz koda bir hata yakalama mekanizması eklemediyseniz, ajan kullanıcıya ham bir Python hatası basar ya da sonsuz bir yükleme ekranında kalır. Daha da kötüsü; hatayı gören yapay zeka modeli panikleyip kullanıcıya hayali bir kargo takip numarası uydurabilir! Üretim ortamında uydurulan bir veri veya çöken bir ekran, müşteri güvenini tamamen yok eder. Çözüm: Fail-Closed Fallback mimarisidir.",
    application:
      "Ekrandaki kod bloğunda, endüstri standardı bir Hata Tolerans ve Fallback mimarisini görüyorsunuz. Kodu üç ana savunma hattına ayırdık: Birinci savunma hattı Retry ve Circuit Breaker yani Devre Kesici: Dış API'ye istek atıldığında kod hemen pes etmez. Exponential Backoff yani artan sürelerle isteği 3 kez tekrar dener. Eğer servis 3 denemede de yanıt vermezse Devre Kesici atar ve servise giden trafiği geçici olarak keser. İkinci savunma hattı Graceful Fallback yani Kademeli Gerileme: Canlı kargo API'si yanıt vermediğinde ajan uydurma veri üretmez. Kod otomatik olarak fallback_to_cache fonksiyonunu tetikler. Müşteriye \"Kargo sisteminde anlık bir gecikme var, veritabanımızdaki son bilinen durum: Yolda\" şeklinde güvenli ve yedekli bir yanıt sunar. Üçüncü savunma hattı Structured Error Boundary: Model beklenmeyen bir hata fırlattığında, arayüzdeki React Error Boundary hatayı hapseder. Tüm sayfa çökmez; sadece ajanın mesaj kutusunda kibar bir \"Şu an yardımcı olamıyorum, temsilciye aktarıyorum\" uyarısı çıkar.",
    summary:
      "Bu dersle birlikte canlı sistemlerin kaçınılmaz gerçeği olan hata yönetimi ve Graceful Degradation mimarisini kavradınız. Üretim ortamındaki bir ajan asla ham teknik hata fırlatmaz, uydurma veri üretmez; Devre Kesici ve Fallback mekanizmalarıyla sistemin ayakta kalmasını sağlar. Bir sonraki bölümde, Orta Seviye modülümüzün büyük finali olan Kendi Dokümanlarınla Konuşan ve Rapor Üreten Çift Ajanlı Ekip uygulamasını hayata geçireceğiz. Bir sonraki bölümde görüşmek üzere.",
    quiz: [
      mcq(
        "q_ago5_1",
        "Riskli araç onaysız çağrılır mı?",
        ["Evet, otonomi budur", "Hayır; durum beklemede kalır", "Zaman dolunca True", "JSON yeter"],
        1,
      ),
      mcq(
        "q_ago5_2",
        "Zaman aşımında Fail-closed (Hata Anında Kapalı) ne yapar?",
        ["Onay uydurur", "İşlemi durdurur; araç çağrılmaz", "Önceki kaşeyi kopyalar", "top-k artırır"],
        1,
      ),
      mcq(
        "q_ago5_3",
        "`red` kararında dürüst yol hangisidir?",
        ["Yine gönderir", "ValueError; işlem durur", "beklemede sonsuz", "None basar"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "RISKLI = {\"gonder\"}\n\n\ndef istek(arac, govde, onay=None):\n    if arac not in RISKLI:\n        raise ValueError(\"bilinmeyen arac; islem durur\")\n    if not govde.strip():\n        raise ValueError(\"bos govde; islem durur\")\n    if onay is None:\n        return {\"durum\": \"beklemede\", \"govde\": govde}\n    if onay not in (\"onay\", \"red\"):\n        raise ValueError(\"gecersiz karar; islem durur\")\n    if onay == \"red\":\n        raise ValueError(\"red; islem durur\")\n    return {\"durum\": \"gonderildi\", \"govde\": govde}\n\n\nkutu = istek(\"gonder\", \"Rapor: 18 palet\")\nassert kutu[\"durum\"] == \"beklemede\"\nassert istek(\"gonder\", \"Rapor: 18 palet\", onay=\"onay\")[\"durum\"] == \"gonderildi\"\ntry:\n    istek(\"gonder\", \"Rapor: 18 palet\", onay=\"red\")\nexcept ValueError as hata:\n    assert \"red\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-orta-6",
    order: 6,
    title: "Mini Proje: Kendi Dokümanlarınla Konuşan ve Rapor Üreten Çift Ajanlı Ekip",
    intro:
      "Selamlar! Ben Maya. Yapay Zeka Sistemleri Uzmanıyım ve geldik Modül 2'nin büyük finaline! Bu modül boyunca adım adım neleri inşa ettik? Önce ajanı canlı veritabanına Fail-Closed mantığıyla bağladık. Ardından Text-to-SQL ile doğal dili sorguya dönüştürdük, REST API ve Webhook'lar üzerinden dış servislerle konuştuk, çoklu ajanların orkestrasyonunu kurduk ve en son Graceful Degradation ile hata toleransını sağladık. Şimdi bu beş bağımsız mimariyi tek bir çatı altında birleştiriyoruz. Kuracağımız mini projede; şirketinin dahili dokümanlarını tarayarak veri toplayan bir Araştırmacı RAG Ajanı ile bu veriyi işleyip kurumsal özetler çıkaran bir Raporlayıcı Ajan birlikte çalışacak. Yani hem RAG hem de Çoklu Ajan mimarisini canlı bir Python uygulamasında birleştireceğiz.",
    problem:
      "Şirketlerin yaşadığı en büyük sorunlardan biri şudur: Ellerinde yüzlerce sayfalık iç doküman, PDF ve teknik sözleşme vardır ama bu bilgi dağınıktır. Çalışanlar aradıkları cevabı bulmak için saatler harcar. Klasik yapay zekalara bu dokümanları doğrudan yapıştıramazsınız; çünkü pencere sınırı yani Token Limit dolar ve maliyet fırlayarak kontrol dışına çıkar. Ayrıca tek bir ajana \"Hem bütün dokümanı oku, hem analiz et, hem de bana harika bir yönetim sunumu yaz\" dediğinizde ajan odak kaybı yaşar. Çözüm: Bilgiyi küçük parçalara bölüp arayan bir RAG sistemi ve iş bölümü yapmış çift ajanlı bir orkestrasyondur.",
    application:
      "Ekrandaki kod bloğunda bu 5 dersin birleşimi olan mimariyi görüyorsunuz. Kodun ilk bölümünde DokumanRAG sınıfını kurguladık. Dokümanlar küçük metin parçalarına yani Chunk'lara bölünür ve veritabanına enjekte edilir. İlk ajanımız olan Araştırmacı Ajan, kullanıcının \"Sözleşmedeki ceza koşulları nelerdir?\" sorusunu aldığında doğrudan bu veritabanında semantik arama yaparlar ve ilgili parçaları cımbızla çeker. İkinci bölümde devreye Raporlayıcı Ajan girer. Araştırmacıdan gelen ham metin parçalarını alır, dilbilgisi ve kurumsal formata uygun şekilde özetler. Kodun içinde kurduğumuz Supervisor mekanizması ise aradaki iletişimi yönetir: Veri yetersizse Araştırmacıya \"Tekrar ara\" der, yeterliyse Raporlayıcıya aktarıp FINISH sinyali basar. Eğer bu süreçte RAG veritabanı yanıt vermezse, Fallback bloğu çalışır ve sistem çökmek yerine kullanıcıya son bilinen durum özetini sunar.",
    summary:
      "Tebrikler! Çoklu AI Agent Sistemleri ve RAG Mimarisi modülünü başarıyla tamamladınız. Bu dersle birlikte sadece basit kodlar yazan değil; canlı veritabanlarıyla konuşan, RAG mimarisiyle doküman işleyen, dış API'lere güvenle bağlanan ve hata anında çökmeyen enterprise seviye yapay zeka sistemleri kurabilen bir Yapay Zeka Mimarı oldunuz. Elinizdeki bu çift ajanlı şablon, şirketlere doğrudan satabileceğiniz ve canlıya alabileceğiniz gerçek bir projedir. Bir sonraki modülde, ajanlarımızı grafik tabanlı karmaşık akışlara bağlayacağımız ileri seviye LangGraph ve Otonom Sistem Güvenliği konularında görüşmek üzere. Kendinize çok iyi bakın!",
    quiz: [
      mcq(
        "q_ago6_1",
        "Mini projedeki raf ağa çıkar mı?",
        ["Evet, zorunlu", "Hayır; liste sözlüktür, sahte canlı iddiası yoktur", "Yalnız PDF’de", "JSON ağı açar"],
        1,
      ),
      mcq(
        "q_ago6_2",
        "Onay `None` iken `calistir` ne döner?",
        ["Gönderildi", "beklemede kutu; kaşe yok", "Mars uydurması", "Boş rapor"],
        1,
      ),
      mcq(
        "q_ago6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Ajan bir tur atınca"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "RAF = []\nDEFTER = {}\n\n\ndef ekle(metin):\n    temiz = metin.strip()\n    if not temiz:\n        raise ValueError(\"bos parca; islem durur\")\n    RAF.append(temiz)\n    return len(RAF)\n\n\ndef arastir(soru):\n    hedef = set(\"\".join(ch if ch.isalnum() else \" \" for ch in soru.lower()).split())\n    aday = []\n    for parca in RAF:\n        kume = set(\"\".join(ch if ch.isalnum() else \" \" for ch in parca.lower()).split())\n        if not kume:\n            continue\n        skor = len(hedef & kume) / len(hedef | kume)\n        if skor >= 0.15:\n            aday.append((skor, parca))\n    aday.sort(reverse=True)\n    if not aday:\n        raise ValueError(\"kaynak yok; islem durur\")\n    DEFTER[\"kanit\"] = aday[0][1]\n    return DEFTER[\"kanit\"]\n\n\ndef yaz():\n    if \"kanit\" not in DEFTER:\n        raise ValueError(\"anahtar yok; islem durur\")\n    DEFTER[\"rapor\"] = \"Rapor: \" + DEFTER[\"kanit\"]\n    return DEFTER[\"rapor\"]\n\n\ndef gonder(onay):\n    if onay != \"onay\":\n        raise ValueError(\"kaşe yok; islem durur\")\n    if \"rapor\" not in DEFTER:\n        raise ValueError(\"rapor yok; islem durur\")\n    return DEFTER[\"rapor\"]\n\n\ndef calistir(soru, onay=None):\n    arastir(soru)\n    yaz()\n    if onay is None:\n        return {\"durum\": \"beklemede\", \"rapor\": DEFTER[\"rapor\"]}\n    return gonder(onay)\n\n\nassert ekle(\"Ankara depo: 18 palet un.\") == 1\nkutu = calistir(\"Ankara un\")\nassert kutu[\"durum\"] == \"beklemede\"\nassert \"18 palet\" in calistir(\"Ankara un\", onay=\"onay\")\ntry:\n    calistir(\"Mars kolonisi\")\nexcept ValueError as hata:\n    assert \"kaynak\" in str(hata)",
    },
  }),
] as const;

const AI_AGENT_ORTA_LESSON_QUIZZES: AcademyExamQuestion[] = AI_AGENT_ORTA_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez. */
export const AI_AGENT_ORTA_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...AI_AGENT_ORTA_LESSON_QUIZZES,
  mcq("q_ago_p1", "RAG sırası hangisidir?", ["Üret → getir", "Böl / göm / getir, sonra üret", "Yalnız pencere", "TTS"], 1),
  mcq("q_ago_p2", "Gömme (embedding) neyi sayıya çevirir?", ["Sertifika", "Parça metninin konumunu benzerlik uzayında", "HTTP kodu", "Kaşe"], 1),
  mcq("q_ago_p3", "Boş VectorDB sorgusu?", ["Wikipedia doldurur", "Fail-closed durur", "top-k=100", "None vektör"], 1),
  mcq("q_ago_p4", "top-k dolu diye kanıt doğar mı?", ["Evet", "Hayır; eşik yoksa gürültü düşer", "Evet JSON’da", "Yalnız k=1"], 1),
  mcq("q_ago_p5", "Araştırmacı ajan ne üretir?", ["Nihai müşteri mektubu", "Kanıt / getiri", "Kaşe", "TTS"], 1),
  mcq("q_ago_p6", "Yazar ajan kanıtsız?", ["Şiir basar", "Teslim durur", "Önceki rapor", "eval"], 1),
  mcq("q_ago_p7", "Ortak durum nedir?", ["GPU belleği", "Ajanların paylaştığı defter", "Sertifika hash", "Pencere tavanı"], 1),
  mcq("q_ago_p8", "Eksik `kanit` anahtarı?", ["Boş string", "Fail-closed; okuma durur", "None rapor", "top-k"], 1),
  mcq("q_ago_p9", "Human-in-the-Loop ne keser?", ["Getiriyi", "Riskli aracı onaysız çalışmayı", "JSON parse", "Gömme"], 1),
  mcq("q_ago_p10", "Onay zaman aşımı?", ["True uydurur", "İşlem durur; araç yok", "Önceki kaşe", "retry sonsuz"], 1),
  mcq("q_ago_p11", "Canlı model olmadan Orta öğretilir mi?", ["Hayır", "Evet; kapılar sahte ağsız görünür", "Yalnız GPU", "Yalnız TTS"], 1),
  mcq("q_ago_p12", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_ago_p13", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet; hash", "Hayır; yalnız satın alma"], 1),
  mcq("q_ago_p14", "Çift ajan özeti nedir?", ["Yalnız print", "Getir → durum → yaz → kaşe", "Yalnız import", "Yalnız class"], 1),
];
