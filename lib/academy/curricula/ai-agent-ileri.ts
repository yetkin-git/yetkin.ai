/**
 * AI Agent İleri Seviye — LangGraph, onarım, korkuluk ve üretim (AI-103).
 * PEDAGOJI.md: 4 perde, tek eğitmen, Fail-Closed.
 * Sakin vatandaş dili, 2. dersten bölüm tekrarı, satır satır kod.
 */

import type { AcademyExamQuestion } from "@/lib/academy/types";
import {
  academyInstructorLessonDraft,
  academyPreviousLessonBridge,
  type AcademyLessonDraft,
} from "@/lib/academy/curricula/types";

function mcq(
  id: string,
  prompt: string,
  choices: readonly [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
): AcademyExamQuestion {
  return { id, prompt, choices: [...choices], correctIndex };
}

export const AI_AGENT_ILERI_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-1",
    order: 1,
    title: "Döngüsel Ajan Akışları ve Grafik Mimarisi (LangGraph / StateGraph Mantığı)",
    intro: "Hoş geldiniz. Bu bölümde Döngüsel Ajan Akışları ve Grafik Mimarisi (LangGraph / StateGraph Mantığı) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Tren istasyonunda duruyorsun. Makas, yani bu şu demek: rayın hangi yola sapacağını seçen demir parçası. Işık yoksa makinist kendi başına döner durur, vagonlar birbirine biner. Grafik ajan çizelgesi (LangGraph), yani bu şu demek: ajanın işlerini düğüm ve kenarla çizen harita. Düğüm bir iş odasıdır. Kenar o odadan diğerine giden yoldur. Durum Grafiği (StateGraph), yani bu şu demek: bütün odaların paylaştığı ortak defter. Deftere adım sayısı, araç adı ve sonuç yazılır. Fail-closed (Hata Anında Kapalı), yani bu şu demek: yol yoksa veya tavan dolunca işlem durur, ortaya uydurma bir sonuç basılmaz. Lambasız kenar sonsuz döngüdür. Tavanlı makas, yani bu şu demek: makasın kaç kez çevrilebileceğinin yazılı bir üst sınırı vardır. Sen bu derste tavanlı makası öğreniyorsun. Bunu günlük hayattan bir örnekle ele alırsak, bakkal kuyruğunda herkesin bir numara alması gibidir: numara bitince gişe kapanır, yeni müşteri uydurulmaz. Bir sahne daha: asansör dört kişi alır. Beşinci kişi gelince kapı kapanır, kimse sıkışmaz. Acele slogan yok. Sınır net olsun yeter. Dün öğrendiğin ReAct ritmi tek turdu. Bugün o turlar bir haritaya oturur. Haritada her oda bir iş, her koridor bir geçiştir. Koridor yoksa durursun. Tavan dolunca durursun. Defter ortak olduğu için bir oda diğerinin yazısını görür. Şimdi neden tavansız çizelgenin faturayı şişirdiğini, kayıp odanın sessizce yok sayılamayacağını konuşalım.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Tur tavanı yoksa ajan kendi kenarına döner, defter şişer, araç tekrar tekrar çağrılır. Fatura büyür, süre uzar, kimse dur demez. Saha bir tur daha diye uydurmaz. Fail-closed (Hata Anında Kapalı) burada kırmızı lambadır: tavan dolunca işlem durur. Kayıp düğüm sessiz None değildir. Yani bu şu demek: haritada olmayan bir oda adı gelince ajan önceki sonucu basmaz, boş bir sayı uydurmaz, isimli bir hata ile durur. Bunu günlük hayattan bir örnekle ele alırsak, otobüs şoförü tabelada olmayan bir durağa kendi başına sapmaz. Tabela yoksa durur, yolcuları uydurma bir caddeye indirmez. Bir sahne daha: postanede gişe memuru listede olmayan bir işlemi gülümseyerek yapmaz. Liste yoksa iş alınmaz. Sen de kayıp düğümü yok saymazsın. Kenarsız çizelge, ışıklı kavşakta lambanın sökülmesi gibidir: herkes kendi turunu çevirir, kaza kaçınılmaz olur. Mutfakta ocağı kapatmayı unutmak da aynı açıklıktır: alev kendi kendine sönmez, sen tavanı yazmazsan hat dönmeye devam eder. Bu mimariyi kullanmamızın sebebi budur: harita yazılı durur, tavan yazılı durur, kayıp oda isimle düşer. Orta değer yoktur. Sanırım bitti diye yumuşak bir kaçış yoktur. Durmak utanılacak bir şey değil; dürüstlüktür. Tavansız döngü nezaket değildir, açık hattır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere tek çizelge durur: kenar yoksa dur, tavan dolunca dur. Bu sahte LangGraph paketi değildir; düğüm-kenar fiziğini gösterir. İlk satırda TAVAN eşittir dört durur. TAVAN, yani bu şu demek: makasın kaç kez çevrilebileceğinin üst sınırı. KENAR boş bir sözlüktür. Sözlük, yani bu şu demek: oda adına bakıp o odanın fonksiyonunu bulan defter. dugum_basla fonksiyonu durum parametresini alır. durum, yani bu şu demek: odaların paylaştığı ortak defter. durum köşeli parantez adim satırı, defterde adim yoksa sıfır kabul eder, varsa bir ekler. get, yani bu şu demek: anahtar yoksa varsayılanı ver, çökme. if durum adim TAVAN dan büyükse ValueError fırlar: tur tavani, islem durur. Tavan dolmamışsa return arac ile sonraki oda adını verir. dugum_arac yine durum alır. durum.get arac stok_oku değilse kenar yok diye durur. Eşleşirse durum sonucunu on sekiz yazar ve return bitir der. bitir, yani bu şu demek: döngünün çıkış kapısı, yeni oda yok. KENAR basla anahtarına dugum_basla, arac anahtarına dugum_arac yazılır. Rafta iki oda durur. yurut fonksiyonu durum alır. dugum değişkeni basla ile başlar. while dugum bitir olmadığı sürece döner. dugum KENAR da yoksa kayip dugum diye durur. Varsa KENAR dugum parantez durum ile o odayı çalıştırır, dönen adı yeni dugum yapar. Döngü bitince return durum sonuc ile defterdeki sayıyı verir. İlk assert yurut arac stok_oku ile on sekiz mühürler. try bloğu yurut arac sil dener. sil rafta araç odasına girer ama stok_oku değildir, kenar kelimesi hata metninde durur. Sen bu iki denemeyi ezberlemiyorsun; her birinin hangi kapıyı kanıtladığını görüyorsun. Doğru araç adı işler. Yanlış ad isimle düşer. Tavan sayılır. Kayıp oda sessiz geçilmez.",
    summary: "Bu dersle Döngüsel Ajan Akışları ve Grafik Mimarisi (LangGraph / StateGraph Mantığı) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Düğüm iş, kenar geçiş, tavan durmadır. Durum defterde, geçiş kenarda, durma tavanda durur. Tavanlı makas yazılı sınırdır. Kayıp oda isimle düşer, sessiz None değildir. Fail-closed (Hata Anında Kapalı) burada lambanın sönmesi değil, lambanın yanıp hattı kesmesidir. Sen bugün haritayı ve tavanı gördün. Asansör dört kişilikse beşinciyi sıkıştırmazsın. Gişe numarası bitince yeni fiş uydurmazsın. Aynı durma burada da geçerlidir. Harita kâğıtta durur, tavan kâğıtta durur. Bir sonraki bölümde seni kendi kendini onaran ajan ve yansıma döngüsü bekliyor. Orada kırık araç bir kez okunur, tek yedek denenir, sonsuz deneme yoktur.",
    quiz: [
      mcq(
        "q_agi1_1",
        "Durum Grafiği (StateGraph) ne tutar?",
        ["Yalnız TTS sesi", "Ajanın paylaştığı ortak defter", "Sertifika hash", "GPU tavanı"],
        1,
      ),
      mcq(
        "q_agi1_2",
        "Tur tavanı dolunca Fail-closed (Hata Anında Kapalı) ne yapar?",
        ["Bir tur daha uydurur", "İşlemi durdurur; sonsuz döngü yok", "Kenarı sessiz siler", "None basar"],
        1,
      ),
      mcq(
        "q_agi1_3",
        "Kayıp düğüm adı neye yol açar?",
        ["Önceki sonucu basar", "İsimli durma; kenar yok", "Kendini basla sanır", "eval açar"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "TAVAN = 4\nKENAR = {}\n\n\ndef dugum_basla(durum):\n    durum[\"adim\"] = durum.get(\"adim\", 0) + 1\n    if durum[\"adim\"] > TAVAN:\n        raise ValueError(\"tur tavani; islem durur\")\n    return \"arac\"\n\n\ndef dugum_arac(durum):\n    if durum.get(\"arac\") != \"stok_oku\":\n        raise ValueError(\"kenar yok; islem durur\")\n    durum[\"sonuc\"] = 18\n    return \"bitir\"\n\n\nKENAR[\"basla\"] = dugum_basla\nKENAR[\"arac\"] = dugum_arac\n\n\ndef yurut(durum):\n    dugum = \"basla\"\n    while dugum != \"bitir\":\n        if dugum not in KENAR:\n            raise ValueError(\"kayip dugum; islem durur\")\n        dugum = KENAR[dugum](durum)\n    return durum[\"sonuc\"]\n\n\nassert yurut({\"arac\": \"stok_oku\"}) == 18\ntry:\n    yurut({\"arac\": \"sil\"})\nexcept ValueError as hata:\n    assert \"kenar\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-2",
    order: 2,
    title: "Kendi Kendini Onaran Ajanlar (Self-Healing & Reflection Loop)",
    intro: academyPreviousLessonBridge({
      recap: "Bir önceki bölümde tavanlı makası gördün. Düğüm iş, kenar geçiş, tavan durmaydı. Durum Grafiği ortak defterdi. Kayıp oda sessiz None değil, isimli durmaydı.",
      checks: [
        "Durum Grafiği (StateGraph) ajanın paylaştığı ortak defterdir.",
        "Tur tavanı dolunca Fail-closed işlemi durdurur; sonsuz döngü yoktur.",
        "Kayıp düğüm adı isimli durmadır; kenar yoksa önceki sonuç basılmaz.",
      ],
      whyNext: "Bu listenin üzerine bugün şunu koyuyoruz: kırık araç bir kez okunsun, tek yedek denensin. Çünkü haritayı öğrendin; şimdi kırık kenarda sonsuz dönmeyi keseceksin. Retry nezaket değildir.",
    }) + " Hoş geldiniz. Bu bölümde Kendi Kendini Onaran Ajanlar (Self-Healing & Reflection Loop) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Eczanede ilacın son kullanma tarihi geçmişse eczacı aynı kutuyu sonsuz uzatmaz. Bir kez bakar, yedek rafa uzanır, yedek de yoksa dürüstçe yok der. Kendi kendini onarma (Self-Healing), yani bu şu demek: kırık sonucu okuyup tek bir yedek yol denemek. Yansıma döngüsü (Reflection Loop), yani bu şu demek: hata metnine bakıp yeni bir araç adı üretmek, körlemesine aynı kırığı tekrarlamamak. Retry, yani bu şu demek: aynı işi yeniden denemek. Retry sonsuz nezaket değildir. Fail-closed (Hata Anında Kapalı) ikinci kırıkta hattı keser. Tavan burada birdir. Sen bu derste tek bakış, tek yedek kuralını öğreniyorsun. Bunu günlük hayattan bir örnekle ele alırsak, kapı zili çalışmazsa bir kez yedek zili denersin. Yedek de susarsa kapıyı omuzlamazsın. Bir sahne daha: fırında sipariş yanmışsa usta bir kez ikinci tepsiyi dener. İkinci tepsi de yanarsa müşteriye uydurma bir ekmek uzatmaz. Otobüs kaçmışsa bir sonraki seferi beklersin; sefer yoksa durakta hayali bir otobüs uydurmazsın. Acele slogan yok. Bir bakış yeter. Haritayı dün öğrendin. Bugün kırık kenarda sonsuz dönmeyi kesiyorsun. Şimdi neden yutulmuş hatanın ajanı kör bıraktığını konuşalım.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Hata mesajını yutarsan ajan kör döner. Aynı kırık aracı belki geçer diye sonsuz çağırır. Fatura şişer, süre uzar, sonuç yine kırık kalır. Yansıma hatayı okur, tek yedek üretir. Okunmayan hata yol doğurmaz. Fail-closed (Hata Anında Kapalı) burada tavan bir iken durur: deneme tavanı dolunca onarilamadi der, işlem biter. Bilinmeyen hata için yedek uydurulmaz. Yani bu şu demek: metinde tanıdık bir kırık yoksa None döner, yol yoktur, ajan susar. Bunu günlük hayattan bir örnekle ele alırsak, tamirci kırık parçanın adını okumadan rastgele bir vida takmaz. Adı okunmayan kırık, yedek rafı açmaz. Bir sahne daha: çamaşır makinesi hata kodu basarsa sen kodu okursun, aynı programı yüz kez başlatmazsın. Kod yoksa tamirci uydurma bir vida takmaz. Sen de bilinmeyen hatayı stok uydurmasıyla doldurmazsın. Sonsuz retry nezaket değildir, açık hattır. Bu mimariyi kullanmamızın sebebi, kırığın bir kez okunması ve yedeğin bir kez denenmesidir. Orta değer yoktur. Sanırım geçer diye yumuşak bir kaçış yoktur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere tek yansıma vardır; yedek yoksa durur. İlk satırda DENEME_TAVAN eşittir bir durur. DENEME_TAVAN, yani bu şu demek: yedeğin kaç kez denenebileceği. arac fonksiyonu ad parametresini alır. ad, yani bu şu demek: hangi aletin çağrılacağı. ad kirik ise ok False, hata zaman asimi sözlüğü döner. ad yedek ise ok True, deger on sekiz döner. ad stok ise yine ok True, deger on sekiz döner. Hiçbiri değilse ok False, hata bilinmeyen döner. yansit fonksiyonu hata metnini alır. zaman kelimesi metindeyse yedek adını verir. Yoksa None döner. None, yani bu şu demek: yol yok, uydurma ad basma. calistir iki parametre alır: ad ve deneme, deneme varsayılanı sıfırdır. sonuc eşittir arac ad ile aleti çağırır. sonuc ok True ise return sonuc deger ile sayıyı verir. Değilse deneme DENEME_TAVAN dan büyük veya eşitse ValueError fırlar: onarilamadi, islem durur. Tavan dolmamışsa yedek eşittir yansit sonuc hata ile bakılır. yedek None ise yol yok diye durur. Varsa return calistir yedek, deneme artı bir ile tek yedeği dener. İlk assert calistir stok on sekiz mühürler: kırık yoktur, doğrudan değer çıkar. İkinci assert calistir kirik on sekiz mühürler: zaman asimi okunur, yedek bir kez çalışır, on sekiz gelir. try bloğu calistir yok dener. yok bilinmeyen hata basar, yansit None döner, yol yok kelimesi hata metninde durur. Sen bu üç denemeyi slogan gibi ezberlemezsin; her birinin hangi kapıyı kapattığını görürsün. Sağlam araç işler. Bilinen kırık bir yedek ister. Bilinmeyen kırık yol üretmez. İkinci kırıkta tavan yeter. deneme parametresi sıfırdan başlar, yedekte bir olur; tavan bir olduğu için üçüncü tur yoktur.",
    summary: "Bu dersle Kendi Kendini Onaran Ajanlar (Self-Healing & Reflection Loop) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Onarım: bir bakış, bir yedek, tavan. Kırık okunur, yedek bir kez denenir, ikinci kırık hattı kapatır. Bilinmeyen hata yol doğurmaz. Retry sonsuz nezaket değildir. Fail-closed (Hata Anında Kapalı) burada yedeğin tavanıdır. Sen bugün tek bakış kuralını gördün. Eczacı aynı kutuyu sonsuz uzatmaz. Usta ikinci tepsi yanınca uydurma ekmek vermez. Aynı durma burada da geçerlidir. Yutulan hata kör döngüdür; okunan hata tek yedektir. Bir sonraki bölümde seni ajan korkuluğu ve yetkisiz eylem engeli bekliyor. Orada izin listesi dışındaki ad durur, ezme cümlesi tarama kapısından geçmez.",
    quiz: [
      mcq(
        "q_agi2_1",
        "Yansıma döngüsü kaç kez yedek dener?",
        ["Sonsuz", "Tavan kadar; burada bir", "Yüz", "Hata yutulunca sıfır"],
        1,
      ),
      mcq(
        "q_agi2_2",
        "Bilinmeyen hata için `yansit` ne döner?",
        ["Aynı aracı", "None; yol yok, işlem durur", "stok uydurması", "True"],
        1,
      ),
      mcq(
        "q_agi2_3",
        "Retry sonsuz neden Fail-closed değildir?",
        ["Hızlıdır", "Hattı kapatmaz; kırık araç döner", "Log yoktur", "Kenar yoktur"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "DENEME_TAVAN = 1\n\n\ndef arac(ad):\n    if ad == \"kirik\":\n        return {\"ok\": False, \"hata\": \"zaman asimi\"}\n    if ad == \"yedek\":\n        return {\"ok\": True, \"deger\": 18}\n    if ad == \"stok\":\n        return {\"ok\": True, \"deger\": 18}\n    return {\"ok\": False, \"hata\": \"bilinmeyen\"}\n\n\ndef yansit(hata):\n    if \"zaman\" in hata:\n        return \"yedek\"\n    return None\n\n\ndef calistir(ad, deneme=0):\n    sonuc = arac(ad)\n    if sonuc[\"ok\"]:\n        return sonuc[\"deger\"]\n    if deneme >= DENEME_TAVAN:\n        raise ValueError(\"onarilamadi; islem durur\")\n    yedek = yansit(sonuc[\"hata\"])\n    if yedek is None:\n        raise ValueError(\"yol yok; islem durur\")\n    return calistir(yedek, deneme + 1)\n\n\nassert calistir(\"stok\") == 18\nassert calistir(\"kirik\") == 18\ntry:\n    calistir(\"yok\")\nexcept ValueError as hata:\n    assert \"yol yok\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-3",
    order: 3,
    title: "Ajan Güvenliği ve Guardrails (Prompt Injection ve Yetkisiz Eylem Engelleyiciler)",
    intro: academyPreviousLessonBridge({
      recap: "Bir önceki bölümde tek bakış, tek yedek kuralını gördün. Kırık okundu, yedek bir kez denendi. Bilinmeyen hata yol üretmedi. Retry sonsuz değildi.",
      checks: [
        "Yansıma döngüsü tavan kadar yedek dener; burada bir.",
        "Bilinmeyen hatada yansit None döner; yol yok, işlem durur.",
        "Retry sonsuz Fail-closed değildir; hattı kapatmaz.",
      ],
      whyNext: "Bu listenin üzerine bugün şunu koyuyoruz: onarım kapısı yetkisiz adı çalıştırmasın. Çünkü yedek denemek, rafta olmayan silme aletini doğurmaz. Önce liste, sonra tarama, sonra el.",
    }) + " Hoş geldiniz. Bu bölümde Ajan Güvenliği ve Guardrails (Prompt Injection ve Yetkisiz Eylem Engelleyiciler) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Apartman kapısında zil panosu vardır. Panoda olmayan daireye basmak o daireyi açmaz. Güvenlik korkuluğu (Guardrails), yani bu şu demek: izinli araç listesi, tarama ve varsayılan red. Fail-closed (Hata Anında Kapalı) aç uydurmaz. Listede yoksa durur. Üretim tarifi enjeksiyonu (Prompt Injection), yani bu şu demek: modele tarifi yoksay diye bağırarak yasağı ezmeye çalışmak. Korkuluk o cümleyi taramada keser. Korkuluk yoksa ajan elini uzatır. Sen bu derste varsayılan kilidi öğreniyorsun. Kilit, yani bu şu demek: kapı baştan kapalıdır, liste açar. Bunu günlük hayattan bir örnekle ele alırsak, okul kantininde yalnız listedeki yiyecek satılır. Listede olmayan bir adı bağırarak söylemek o yiyeceği doğurmaz. Bir sahne daha: nüfus gişesinde memur yalnız kayıtlı işleri yapar. Yetkiyi aç diye bir fısıltı gişeyi bozmaz. Kütüphanede rafta olmayan kitabı bağırarak istemek o kitabı doğurmaz. Acele slogan yok. Kapı kapalı başlar. Dün yedek denemeyi öğrendin. Bugün o yedek, listede olmayan silme aletini doğurmasın. Şimdi neden kayıt dışı adın çağrıdan önce durması gerektiğini konuşalım.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Kayıt dışı araç adı çağrıdan önce durmalıdır. İzin listesi dışındaki ad yetkisiz eylemdir; işlem durur. Tarif ezme parçası taramada kesilir. Varsayılan açık kapı değildir; varsayılan kilitlidir. Fail-closed (Hata Anında Kapalı) burada reddir: emin değilsen dur, aç uydurma. Yani bu şu demek: listede yoksa el uzamaz, yasak parça metindeyse üretim tarifi düşer. Bunu günlük hayattan bir örnekle ele alırsak, banka gişesinde memur kimliği olmayan işi gülümseyerek yapmaz. Kimlik yoksa işlem alınmaz. Bir sahne daha: eczanede reçetesiz ilacı herhalde veririz demek, kapıyı kaldırmaktır. Okul kantininde listedeki ad yoksa görevli uydurma bir sandviç basmaz. Sen de yetkisiz adı benzer isim diye çalıştırmazsın. Sessiz True dönmek, listede yokken varmış gibi davranmaktır. Kapı baştan kapalı durur; liste açar, bağırış açmaz. Onarım bu kapıyı atlatmaz. Liste yoksa el uzamaz. Bu saldırı tarifi değildir; kapıyı gösterir. Ağ yoktur, sömürü yoktur. Bu mimariyi kullanmamızın sebebi, adın ve cümlenin ayrı, kayıtlı ve dürüst durmasıdır. Orta değer yoktur. Belki aç diye yumuşak bir kaçış yoktur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere liste dışı ad durur, ezme cümlesi durur. Bu saldırı tarifi değildir; kapıyı gösterir. Ağ yoktur, sömürü yoktur. İlk satırda IZINLI kümesi stok_oku adını tutar. IZINLI, yani bu şu demek: rafta durmasına izin verilen tek araç adı. YASAK_PARCA demeti tarifi yoksay ve yetkiyi ac cümlelerini tutar. Demet, yani bu şu demek: taramada aranacak yasak parçaların listesi. tarama fonksiyonu metin parametresini alır. metin, yani bu şu demek: modele veya araca giden kâğıt. kucuk eşittir metin.lower ile harfleri küçültür. for parca in YASAK_PARCA döngüsü her yasak parçayı tek tek arar. parca kucuk metindeyse ValueError fırlar: enjeksiyon, islem durur. Yoksa return metin ile kâğıt geçer. arac_cagir iki parametre alır: ad ve metin. Önce tarama metin çağrılır. Cümle temizse ad IZINLI kümesinde aranır. ad kümede yoksa yetkisiz eylem diye durur. Varsa return on sekiz ile izinli işin sahte sonucunu verir. İlk assert arac_cagir stok_oku, Ankara stok on sekiz mühürler: izinli ad, temiz cümle, kapı açılır. İlk try arac_cagir sil_tablo, Ankara dener. sil_tablo listede yoktur, yetkisiz kelimesi hata metninde durur. İkinci try arac_cagir stok_oku, tarifi yoksay dener. Ad izinlidir ama cümle yasak parçayı taşır, enjeksiyon kelimesi durur. Sen bu üç denemeyi bir kapı gibi okursun: doğru ad ve temiz kâğıt işler, yanlış ad düşer, ezme cümlesi düşer. Listede yoksa kırmızı lamba yanar. ad parametresi raftaki isimdir, metin parametresi kâğıttır. İkisi ayrı kapıdır. lower harfleri küçültür ki büyük harfle yazılmış yasak parça kaçmasın. Bu derste kapı gösterilir; sömürü yazılmaz.",
    summary: "Bu dersle Ajan Güvenliği ve Guardrails (Prompt Injection ve Yetkisiz Eylem Engelleyiciler) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Korkuluk: liste, tarama, kilit. Yetkisiz ad durur, ezme cümlesi durur, varsayılan kilitlidir. Fail-closed (Hata Anında Kapalı) burada aç uydurmamaktır. Bu saldırı tarifi değildir; kapıyı gösterir. Ağ yoktur, sömürü yoktur. Sen bugün kapının baştan kapalı durduğunu gördün. Apartman zilinde panoda olmayan daire açılmaz. Kantinde listede olmayan ad yiyecek doğurmaz. Aynı kapı burada da durur. Onarım, yetkisiz adı çalıştırma hakkı vermez. Bir sonraki bölümde seni ajan izleme, günlük ve değerlendirme barajı bekliyor. Orada beklenen ile çıkan eşleşmezse ajan üretime inmez, günlük vesikalık taşımaz.",
    quiz: [
      mcq(
        "q_agi3_1",
        "Güvenlik korkuluğu (Guardrails) varsayılanı nedir?",
        ["Tüm araç açık", "Kilit; listede yoksa dur", "Sessiz True", "eval"],
        1,
      ),
      mcq(
        "q_agi3_2",
        "Kayıt dışı araç adı neyi tetikler?",
        ["Yine çalışır", "Yetkisiz eylem; işlem durur", "Önceki sonucu basar", "Kaşe uydurur"],
        1,
      ),
      mcq(
        "q_agi3_3",
        "Bu dersteki tarama saldırı tarifi midir?",
        ["Evet, sömürü", "Hayır; kapıyı gösterir, ağ ve sömürü yoktur", "Evet, PoC", "Yalnız GPU"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "IZINLI = {\"stok_oku\"}\nYASAK_PARCA = (\"tarifi yoksay\", \"yetkiyi ac\")\n\n\ndef tarama(metin):\n    kucuk = metin.lower()\n    for parca in YASAK_PARCA:\n        if parca in kucuk:\n            raise ValueError(\"enjeksiyon; islem durur\")\n    return metin\n\n\ndef arac_cagir(ad, metin):\n    tarama(metin)\n    if ad not in IZINLI:\n        raise ValueError(\"yetkisiz eylem; islem durur\")\n    return 18\n\n\nassert arac_cagir(\"stok_oku\", \"Ankara stok\") == 18\ntry:\n    arac_cagir(\"sil_tablo\", \"Ankara\")\nexcept ValueError as hata:\n    assert \"yetkisiz\" in str(hata)\ntry:\n    arac_cagir(\"stok_oku\", \"tarifi yoksay\")\nexcept ValueError as hata:\n    assert \"enjeksiyon\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-4",
    order: 4,
    title: "Ajan Performans İzleme, Logging ve Evaluation (Evals)",
    intro: academyPreviousLessonBridge({
      recap: "Bir önceki bölümde korkuluğu gördün. İzin listesi dışındaki ad durdu. Ezme cümlesi taramada kesildi. Varsayılan kilitliydi. Kapı gösterildi, sömürü yazılmadı.",
      checks: [
        "Güvenlik korkuluğu varsayılanı kilitdir; listede yoksa durur.",
        "Kayıt dışı araç adı yetkisiz eylemdir; işlem durur.",
        "Tarama saldırı tarifi değildir; kapıyı gösterir, ağ ve sömürü yoktur.",
      ],
      whyNext: "Bu listenin üzerine bugün şunu koyuyoruz: ajan üretime inmeden önce teraziden geçsin. Çünkü kapı kapalı olsa da yanlış sonuç yeşil ışık değildir. Beklenen ile çıkan eşleşmezse baraj keser.",
    }) + " Hoş geldiniz. Bu bölümde Ajan Performans İzleme, Logging ve Evaluation (Evals) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Terzi dükkânında sipariş fişi vardır. Fişte bel otuz sekiz yazar. Teslim edilen pantolon kırk gelirse terazi yalan söylemiş olur. Değerlendirme seti (Evals), yani bu şu demek: beklenen ile çıkanı satır satır karşılaştıran altın küme. Eşleşmezse Fail-closed (Hata Anında Kapalı) barajı keser; ajan üretime inmez. Günlük iz tutar. Kişisel Gizli Veriler (PII), yani bu şu demek: isim, telefon, vesikalık gibi kişiye bağlı kayıt. Bu satırlar günlüğe yazılmaz. İz yalnız soru anahtarı ve geçti bayrağı taşır. Sen bu derste teraziyi öğreniyorsun. Bunu günlük hayattan bir örnekle ele alırsak, fırında ekmek gramajı tartılır. Gramaj tutmazsa tezgâha konmaz, yarım rapor basılmaz. Bir sahne daha: okulda yazılı kâğıdı anahtarla karşılaştırırsın. Tek soru yanlışsa kâğıdı yeşil mühürle mezun etmezsin. Market kantarına eksik paket gelince kasa o paketi sessizce geçirmez. Acele slogan yok. Terazi yazılı dursun yeter. Dün kapıyı kapalı öğrendin. Bugün kapıdan geçen işin doğru olup olmadığını tartıyorsun. Şimdi neden barajsız muhtemelen doğru cümlesinin yeşil ışık olmadığını konuşalım.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Loga isim ve telefon gömersen saha sızar. İz soru_id ve gecti taşır, vesikalık taşımaz. Barajsız muhtemelen doğru yeşil ışık değildir. Tek altın satır kırılırsa set durur; yarım rapor yoktur. Fail-closed (Hata Anında Kapalı) burada eval barajıdır: beklenen ile çıkan eşleşmezse işlem durur, ajan üretime inmez. Yani bu şu demek: kırık satırı yutup kalanı yeşil basmak yoktur. Bunu günlük hayattan bir örnekle ele alırsak, laboratuvarda bir tüp bozulursa bütün parti sevk edilmez. Bozuk tüpü gizleyip koliye yeşil etiket yapıştırmak yalandır. Bir sahne daha: market kantarına eksik gramajlı paket gelince kasa o paketi sessizce raftan geçirmez. Paket durur. Terzi pantolonu fişe uymayınca müşteriye herhalde olur demez, pantolonu geri alır. Sen de kırık altın satırı yarım yeşil diye basmazsın. Tek kırık satır bütün seti durdurur; kalanı yeşil basmak yoktur. Üretim izi ile değerlendirme ayrı durur. Eval kapıdır, iz kuledir. Kule kişinin yüzünü yazmaz. Bu mimariyi kullanmamızın sebebi, terazinin yazılı ve kişiye kapalı durmasıdır. Orta rapor yoktur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere altın küme kırık satırda durur ve PII yazılmaz. İlk satırda ALTIN listesi iki sözlük tutar. Birinci sözlük soru Ankara, beklenen on sekiz. İkinci sözlük soru Mars, beklenen durur. ALTIN, yani bu şu demek: terazinin doğru kabul ettiği satırlar. ajan fonksiyonu soru parametresini alır. soru Mars ise return durur. soru Ankara ise return on sekiz. İkisi de değilse return uydurma. uydurma, yani bu şu demek: altın kümede olmayan soruya uydurma cevap; baraj bunu yakalar. degerlendir fonksiyonu kume parametresini alır. kume, yani bu şu demek: tartılacak satır listesi. kayit boş liste ile başlar. for satir in kume döngüsü her satırı tek tek alır. cikan eşittir ajan satir soru ile ajanı çalıştırır. gecti eşittir cikan, satir beklenen karşılaştırmasıdır. kayit.append ile soru ve gecti bayrağı deftere eklenir. İsim yazılmaz, telefon yazılmaz. if not gecti ise ValueError fırlar: eval baraji, islem durur. Hepsi geçerse return kayit. İlk assert degerlendir ALTIN sıfırıncı satır gecti True mühürler: Ankara on sekiz tutar. İkinci assert birinci satır gecti True mühürler: Mars durur tutar. try bloğu ALTIN artı Izmir beklenen yedi satırını verir. ajan Izmir için uydurma basar, yedi ile eşleşmez, eval kelimesi hata metninde durur. Sen bu üç denemeyi terazi gibi okursun: iki altın satır geçer, kırık satır seti durdurur. Yarım yeşil yoktur. Kayıt yalnız soru ve gecti taşır. kume parametresi tartılacak listedir, satir her fiştir, cikan ajanın bastığı değerdir, gecti o değerin beklenenle eşit olup olmadığıdır. İsim alanı kayda girmez. Ankara ve Mars geçer, Izmir uydurma basınca baraj keser.",
    summary: "Bu dersle Ajan Performans İzleme, Logging ve Evaluation (Evals) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Altın küme, baraj ve PII yasağı durur. Kırık satır üretime inmez, günlük vesikalık taşımaz. Eval kapıdır, iz kuledir. Fail-closed (Hata Anında Kapalı) burada terazinin kırmasıdır. Sen bugün muhtemelen doğru cümlesinin yeşil ışık olmadığını gördün. Fırın gramaj tutmayınca ekmeği tezgâha koymaz. Okul tek yanlış kâğıdı yeşil mühürle mezun etmez. Aynı terazi burada da durur. İz soruyu taşır, yüzü taşımaz. Bir sonraki bölümde seni üretim ajan servisi ve eşzamansız işçi mimarisi bekliyor. Orada kapı kabul basar, sonuç işçiden gelir, bilinmeyen rota durur.",
    quiz: [
      mcq(
        "q_agi4_1",
        "Değerlendirme seti (Evals) neyi karşılaştırır?",
        ["GPU ısısını", "Beklenen ile çıkanı", "TTS hızını", "Fiyatı"],
        1,
      ),
      mcq(
        "q_agi4_2",
        "Altın satır kırılınca Fail-closed ne yapar?",
        ["Yarım yeşil basar", "eval baraji; işlem durur", "PII yazar", "Retry sonsuz"],
        1,
      ),
      mcq(
        "q_agi4_3",
        "Dürüst günlükte Kişisel Gizli Veriler (PII) durur mu?",
        ["Evet, zorunlu", "Hayır; iz anahtar ve gecti taşır", "Yalnız telefon", "Evet, hash’siz"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "ALTIN = [\n    {\"soru\": \"Ankara\", \"beklenen\": 18},\n    {\"soru\": \"Mars\", \"beklenen\": \"durur\"},\n]\n\n\ndef ajan(soru):\n    if soru == \"Mars\":\n        return \"durur\"\n    if soru == \"Ankara\":\n        return 18\n    return \"uydurma\"\n\n\ndef degerlendir(kume):\n    kayit = []\n    for satir in kume:\n        cikan = ajan(satir[\"soru\"])\n        gecti = cikan == satir[\"beklenen\"]\n        kayit.append({\"soru\": satir[\"soru\"], \"gecti\": gecti})\n        if not gecti:\n            raise ValueError(\"eval baraji; islem durur\")\n    return kayit\n\n\nassert degerlendir(ALTIN)[0][\"gecti\"] is True\nassert degerlendir(ALTIN)[1][\"gecti\"] is True\ntry:\n    degerlendir(ALTIN + [{\"soru\": \"Izmir\", \"beklenen\": 7}])\nexcept ValueError as hata:\n    assert \"eval\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-5",
    order: 5,
    title: "Production-Ready Ajan Servisleri (FastAPI ve Async Worker Mimarisi)",
    intro: academyPreviousLessonBridge({
      recap: "Bir önceki bölümde teraziyi gördün. Beklenen ile çıkan eşleşmezse eval barajı kesti. Günlük vesikalık taşımadı. Kırık satır üretime inmedi.",
      checks: [
        "Değerlendirme seti beklenen ile çıkanı karşılaştırır.",
        "Altın satır kırılınca eval baraji durur; yarım yeşil yoktur.",
        "Dürüst günlükte Kişisel Gizli Veriler yazılmaz; iz anahtar ve gecti taşır.",
      ],
      whyNext: "Bu listenin üzerine bugün şunu koyuyoruz: terazi geçen iş kapıdan kuyruğa düşsün, işçi damgalasın. Çünkü kapının bitti demesi yalandır. Kabul, kuyruğa alındı demektir.",
    }) + " Hoş geldiniz. Bu bölümde Production-Ready Ajan Servisleri (FastAPI ve Async Worker Mimarisi) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Postanede gişe memuru mektubu alır, kuyruğa koyar, damgayı arka odadaki işçi basar. Gişenin mektubu aldım demesi, damganın basıldığı anlamına gelmez. Hızlı Uygulama Programlama Arayüzü (FastAPI), yani bu şu demek: dışarıdaki isteğin girdiği kapı. Eşzamansız işçi (async worker), yani bu şu demek: kapının arkasında kuyruğu işleyen ayrı el. Fail-closed (Hata Anında Kapalı): bilinmeyen rota içeri girmez, kuyruk tavanı dolunca mektup sessiz silinmez, durur. Sen bu derste kapı ile işçiyi ayırıyorsun. Bunu günlük hayattan bir örnekle ele alırsak, fırın tezgâhı siparişi deftere yazar. Ekmek fırından çıkmadan teslim edildi fişi basılmaz. Bir sahne daha: berber koltuğu doluysa yeni müşteri sessizce evine gönderilmez; tavan dolu denir, sıra beklenir veya dürüstçe durulur. Kargo şubesinde kutu rafta yokken teslim edildi yazılmaz. Acele slogan yok. Kapı kabul, işçi damga. Dün teraziyi öğrendin. Bugün terazi geçen işin kapıdan kuyruğa düşmesini görüyorsun. Şimdi neden işçi bitmeden iki yüz basmanın yalan doğurduğunu konuşalım.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. İstek işçi bitmeden iki yüz basarsan bitti yalanı doğar. Kapı kabul basar, sonuç işçiden gelir. Kayıt dışı rota iki yüz uydurmaz. Tavan dolunca sessiz silme yoktur; işlem durur. Fail-closed (Hata Anında Kapalı) burada üç kapıdır: rota yok, kuyruk dolu, kuyruk boş. Yani bu şu demek: bilinmeyen iş adı içeri girmez, sıra tavanı aşınca eski mektup silinmez, boş kuyruktan damga basılmaz. Bunu günlük hayattan bir örnekle ele alırsak, kargo şubesinde görevli kutuyu almadan teslim edildi yazmaz. Kutu rafta yoksa fiş yalandır. Bir sahne daha: belediye gişesinde listede olmayan bir dilekçe gülümseyerek içeri alınmaz. Rota yoksa durur. Fırın tezgâhı doluysa yeni siparişi sessizce defterden silmez, tavan dolu der. Sen de bilinmeyen işi sessizce kuyruğa yazmazsın. Gişe aldım demek damganın basıldığı anlamına gelmez. İşçi bitmeden bitti yazılmaz. Tavan dolunca en eski mektubu çöpe atmak nezaket değil, kayıptır. Bu mimariyi kullanmamızın sebebi, kabul ile bitinin ayrı fiş olmasıdır. Orta damga yoktur. Muhtemelen bitti diye yumuşak bir kaçış yoktur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere kapı kabul basar, işçi damgalar, rota yoksa durur. Bu sahte FastAPI paketi değildir; kapı-kuyruk fiziğini gösterir. Ağ yoktur. İlk satırda KAYIT boş listedir. KAYIT, yani bu şu demek: kuyruktaki mektupların defteri. TAVAN eşittir üç. TAVAN, yani bu şu demek: kuyruğa kaç mektup sığacağı. IZINLI_IS kümesi stok_oku adını tutar. kuyruk_ekle iki parametre alır: is_adi ve govde. is_adi, yani bu şu demek: hangi işin kuyruğa yazılacağı. govde o işin içeriğidir. is_adi IZINLI_IS kümesinde yoksa ValueError fırlar: rota yok, islem durur. len KAYIT TAVAN dan büyük veya eşitse kuyruk dolu diye durur. Geçerse KAYIT.append ile is, govde ve durum beklemede sözlüğü yazılır. return kabul. kabul, yani bu şu demek: kuyruğa alındı, henüz bitmedi. isci parametre almaz. KAYIT boşsa kuyruk bos diye durur. istek eşittir KAYIT sıfır, kuyruğun ilk mektubudur. istek is IZINLI_IS kümesinde yoksa yetkisiz is diye durur. Geçerse istek durumunu bitti, sonucunu on sekiz yazar. return istek. İlk assert kuyruk_ekle stok_oku, sehir Ankara kabul mühürler: izinli iş içeri girer. İkinci assert isci sonuc on sekiz mühürler: işçi damgayı basar. Üçüncü assert isci durum bitti mühürler: aynı mektubun durumu artık bittidir. try bloğu kuyruk_ekle sil_hersey, boş sözlük dener. sil_hersey listede yoktur, rota kelimesi hata metninde durur. Sen bu dört denemeyi gişe gibi okursun: doğru iş kabul alır, işçi damgalar, yanlış rota isimle düşer. kabul ile bitti aynı fiş değildir. is_adi parametresi rota adıdır, govde mektubun içidir, istek kuyruğun ilk satırıdır. TAVAN üçtür, dördüncü mektup sessiz silinmez, durur. durum beklemede ile başlar, işçi onu bitti yapar; kapı bu değişimi yapmaz.",
    summary: "Bu dersle Production-Ready Ajan Servisleri (FastAPI ve Async Worker Mimarisi) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Kapı, kuyruk, işçi. Bilinmeyen rota durur, tavan durur, sonuç işçiden gelir. kabul kuyruğa alındı demektir, bitti değildir. Fail-closed (Hata Anında Kapalı) burada mektubu sessiz silmemektir. Sen bugün kapı ile işçiyi ayırdın. Postane gişesi mektubu alır, damga arka odadadır. Fırın siparişi deftere yazar, ekmek çıkmadan teslim yazılmaz. Aynı ayrım burada da durur. Terazi geçen iş kuyruğa düşer, kapı bitti yalanı basmaz. Bir sonraki bölümde seni üretim ortamına hazır, korkuluklu ve kendi hatalarını onaran otonom ajan bekliyor. Orada tarama, çizelge, yedek ve kuyruk tek gövdede durur.",
    quiz: [
      mcq(
        "q_agi5_1",
        "Hızlı Uygulama Programlama Arayüzü (FastAPI) kapısı bilinmeyen rotada ne basar?",
        ["200 ve boş", "Fail-closed; rota yok", "Sessiz siler", "önceki sonuç"],
        1,
      ),
      mcq(
        "q_agi5_2",
        "`kabul` ne anlama gelir?",
        ["İş bitti", "Kuyruğa alındı; sonuç işçiden", "200 zorunlu", "eval geçti"],
        1,
      ),
      mcq(
        "q_agi5_3",
        "Kuyruk tavanı dolunca ne olur?",
        ["Eski mektubu siler", "kuyruk dolu; işlem durur", "True basar", "Retry sonsuz"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "KAYIT = []\nTAVAN = 3\nIZINLI_IS = {\"stok_oku\"}\n\n\ndef kuyruk_ekle(is_adi, govde):\n    if is_adi not in IZINLI_IS:\n        raise ValueError(\"rota yok; islem durur\")\n    if len(KAYIT) >= TAVAN:\n        raise ValueError(\"kuyruk dolu; islem durur\")\n    KAYIT.append({\"is\": is_adi, \"govde\": govde, \"durum\": \"beklemede\"})\n    return \"kabul\"\n\n\ndef isci():\n    if not KAYIT:\n        raise ValueError(\"kuyruk bos; islem durur\")\n    istek = KAYIT[0]\n    if istek[\"is\"] not in IZINLI_IS:\n        raise ValueError(\"yetkisiz is; islem durur\")\n    istek[\"durum\"] = \"bitti\"\n    istek[\"sonuc\"] = 18\n    return istek\n\n\nassert kuyruk_ekle(\"stok_oku\", {\"sehir\": \"Ankara\"}) == \"kabul\"\nassert isci()[\"sonuc\"] == 18\nassert isci()[\"durum\"] == \"bitti\"\ntry:\n    kuyruk_ekle(\"sil_hersey\", {})\nexcept ValueError as hata:\n    assert \"rota\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-6",
    order: 6,
    title: "Mini Proje: Üretim Ortamına Hazır, Güvenlik Korumalı ve Kendi Hatalarını Onaran Otonom Ajan Sistemi",
    intro: academyPreviousLessonBridge({
      recap: "Bir önceki bölümde kapı ile işçiyi ayırdın. Kapı kabul bastı, damga işçiden geldi. Bilinmeyen rota durdu. Kuyruk tavanı dolunca mektup silinmedi.",
      checks: [
        "Bilinmeyen rotada Fail-closed durur; iki yüz uydurulmaz.",
        "kabul kuyruğa alındı demektir; sonuç işçiden gelir.",
        "Kuyruk tavanı dolunca işlem durur; eski mektup silinmez.",
      ],
      whyNext: "Bu listenin üzerine bugün şunu koyuyoruz: tarama, çizelge tavanı, bir yansıma ve kuyruk tek calistir içinde dursun. Çünkü parçaları ayrı ayrı öğrendin; kapanışta aynı gişede birleşirler. Ağ yoktur.",
    }) + " Hoş geldiniz. Bu bölümde Mini Proje: Üretim Ortamına Hazır, Güvenlik Korumalı ve Kendi Hatalarını Onaran Otonom Ajan Sistemi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Küçük bir gişedesin. Dört iş yan yana durur: cümleyi taramak, çizelgede yürümek, kırıkta bir kez onarmak, kuyruğa kabul basmak. İkisini bir ağızla uydurmazsın. Çizelge tavanı, bir yansıma, korkuluk, altın satır ve kuyruk tek calistir içinde durur. Ağ yoktur: sahte canlı model iddiası taşımaz. Fail-closed (Hata Anında Kapalı) her kapıda isimlidir. Sen bugün kapıları bir arada görüyorsun. Canlı model yarın aynı tavan, korkuluk ve teraziyi doldurur. Bunu günlük hayattan bir örnekle ele alırsak, belediye binasında kimlik kontrolü, gişe, yedek gişe ve kuyruk aynı koridordadır. Koridorun bir ucu açık diye diğer kapılar kalkmaz. Bir sahne daha: fırında hamur, fırın, tartı ve tezgâh ayrı durur. Hamuru tartmadan tezgâha koymak yalandır. Postanede tarama, damga, yedek gişe ve kuyruk ayrı fiştir. Acele slogan yok. Kapılar isimle dursun yeter. Beş derste öğrendiğin parçalar bugün aynı odada durur. Şimdi neden ezme, yetkisiz ad, kırık yedek ve boş kuyruğun ayrı isimler istediğini konuşalım.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ezme cümlesi, kayıt dışı araç, kırık yedek ve boş kuyruk ayrı kapılardır. Çökmek isimsiz olmaz; ValueError isimlidir. Orta rapor yoktur. Yani bu şu demek: kırılmanın adı vardır, yutulan sessiz None yoktur. calistir taramadan geçer, çizelgeden yürür, kırıkta bir kez onarır, kuyruğa kabul basar. Cümleyi doğrudan araca vermek, etiketsiz kutuyu kamyona yüklemektir. Fail-closed (Hata Anında Kapalı) burada her kapının kendi adıyla durmasıdır. Bunu günlük hayattan bir örnekle ele alırsak, gişede dört kuyruk vardır: tarama, çizelge, onarım, kuyruk. İkisini tek ağızla uydurursan hangi fişin yalan olduğunu göremezsin. Bir sahne daha: eczanede reçete okunmadan, dolaba bakılmadan, yedek kutu denenmeden ve kuyruk yazılmadan ilaç uzatılmaz. Sen önce taramayı okur, sonra raftaki adı çağırır, yetkisizse isimle durursun. Yetkisiz eylem onarımın yedeği değildir. Onarım silme aletini stok aletine çevirmez; yetkisiz kırığı yutmaz, yeniden fırlatır. Sınavda baraj yetmiş bekler; belge yalnız o kapıdan basılır. Satın alma belge değildir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere tarama, yürütme, onarım ve kuyruk aynı gövdede durur. Bu İleri kapanıştır. Oda canlı modele bağlı değildir; kapılar sahte ağ olmadan görünür. İlk satırda IZINLI kümesi stok_oku tutar. YASAK demeti tarifi yoksay cümlesini tutar. TAVAN eşittir dört. KAYIT boş listedir. tarama fonksiyonu metin alır. for parca in YASAK döngüsü yasak parçayı metin.lower içinde arar. Varsa enjeksiyon diye durur. Yoksa return metin. yurut iki parametre alır: arac ve adim, adim varsayılanı sıfırdır. adim TAVAN dan büyükse tur tavani diye durur. arac IZINLI kümesinde yoksa yetkisiz eylem diye durur. Geçerse return on sekiz. onar iki parametre alır: arac ve deneme, deneme varsayılanı sıfırdır. try içinde return yurut arac dener. except ValueError as hata yakalar. yetkisiz kelimesi hata metnindeyse raise ile aynı kırığı yeniden fırlatır. Onarım yetkisiz adı yutmaz. deneme bir veya daha büyükse onarilamadi diye durur. Değilse return onar stok_oku, bir ile tek yedeği dener. kuyruk_ekle arac ve metin alır. Önce tarama metin çağrılır. len KAYIT üç veya daha büyükse kuyruk dolu diye durur. deger eşittir onar arac. KAYIT.append deger. return durum kabul, sonuc deger sözlüğü. calistir arac ve metin alır, return kuyruk_ekle arac metin ile gişeyi birleştirir. İlk assert calistir stok_oku, Ankara sonuc on sekiz mühürler: temiz cümle, izinli ad, kabul ve sonuç. İlk try calistir sil_tablo, Ankara dener. sil_tablo yetkisizdir, onar yutmaz, yetkisiz kelimesi durur. İkinci try calistir stok_oku, tarifi yoksay dener. Ad izinlidir ama cümle yasaktır, enjeksiyon kelimesi durur. Sen bu üç denemeyi kapanış gişesi gibi okursun: doğru form ve doğru ad işler, yanlış ad ve ezme cümlesi isimle düşer.",
    summary: "Bu dersle Mini Proje: Üretim Ortamına Hazır, Güvenlik Korumalı ve Kendi Hatalarını Onaran Otonom Ajan Sistemi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. İleri kapanış: çizelge, yedek, korkuluk, terazi, kuyruk. Çizelge tavanda, onarım bir kez, korkuluk kilitlidir, eval barajı, kapı kuyruğa alır. Ağ yoktu, sahte canlı model yoktu. Canlı model yarın aynı kapıları doldurur; sen bugün gişeyi gördün. Fail-closed (Hata Anında Kapalı) her kapıda isimlidir. Belediye koridorunda kapılar ayrı durur. Fırında hamur, tartı ve tezgâh ayrı durur. Aynı düzen burada da geçerlidir. Yetkisiz ad onarımın yedeği değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Satın alma belge değildir.",
    quiz: [
      mcq(
        "q_agi6_1",
        "Mini projedeki oda ağa çıkar mı?",
        ["Evet, zorunlu model", "Hayır; kapılar sahte ağsız görünür", "Yalnız GPU", "JSON ağı açar"],
        1,
      ),
      mcq(
        "q_agi6_2",
        "`calistir` ezme cümlesinde ne döner?",
        ["18 uydurur", "enjeksiyon; işlem durur", "kabul", "önceki kuyruk"],
        1,
      ),
      mcq(
        "q_agi6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Kuyruk dolunca"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "IZINLI = {\"stok_oku\"}\nYASAK = (\"tarifi yoksay\",)\nTAVAN = 4\nKAYIT = []\n\n\ndef tarama(metin):\n    for parca in YASAK:\n        if parca in metin.lower():\n            raise ValueError(\"enjeksiyon; islem durur\")\n    return metin\n\n\ndef yurut(arac, adim=0):\n    if adim > TAVAN:\n        raise ValueError(\"tur tavani; islem durur\")\n    if arac not in IZINLI:\n        raise ValueError(\"yetkisiz eylem; islem durur\")\n    return 18\n\n\ndef onar(arac, deneme=0):\n    try:\n        return yurut(arac)\n    except ValueError as hata:\n        if \"yetkisiz\" in str(hata):\n            raise\n        if deneme >= 1:\n            raise ValueError(\"onarilamadi; islem durur\")\n        return onar(\"stok_oku\", 1)\n\n\ndef kuyruk_ekle(arac, metin):\n    tarama(metin)\n    if len(KAYIT) >= 3:\n        raise ValueError(\"kuyruk dolu; islem durur\")\n    deger = onar(arac)\n    KAYIT.append(deger)\n    return {\"durum\": \"kabul\", \"sonuc\": deger}\n\n\ndef calistir(arac, metin):\n    return kuyruk_ekle(arac, metin)\n\n\nassert calistir(\"stok_oku\", \"Ankara\")[\"sonuc\"] == 18\ntry:\n    calistir(\"sil_tablo\", \"Ankara\")\nexcept ValueError as hata:\n    assert \"yetkisiz\" in str(hata)\ntry:\n    calistir(\"stok_oku\", \"tarifi yoksay\")\nexcept ValueError as hata:\n    assert \"enjeksiyon\" in str(hata)",
    },
  }),
] as const;

const AI_AGENT_ILERI_LESSON_QUIZZES: AcademyExamQuestion[] = AI_AGENT_ILERI_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez. */
export const AI_AGENT_ILERI_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...AI_AGENT_ILERI_LESSON_QUIZZES,
  mcq("q_agi_p1", "Grafik ajan çizelgesi (LangGraph) neyi çizer?", ["TTS", "Düğüm, kenar ve durma", "Fiyat", "GPU"], 1),
  mcq("q_agi_p2", "Durum Grafiği (StateGraph) defteri nedir?", ["Sertifika", "Ajanın paylaştığı durum", "HTTP kodu", "Kaşe"], 1),
  mcq("q_agi_p3", "Tur tavanı dolunca?", ["Bir tur daha", "Fail-closed durur", "None basar", "eval"], 1),
  mcq("q_agi_p4", "Kayıp düğüm?", ["Önceki sonuç", "İsimli durma", "Kendini basla sanır", "True"], 1),
  mcq("q_agi_p5", "Yansıma tavanı burada kaçtır?", ["Sonsuz", "Bir yedek deneme", "Yüz", "Sıfır"], 1),
  mcq("q_agi_p6", "Bilinmeyen hatada yedek?", ["Aynı araç", "None; yol yok", "stok uydurması", "True"], 1),
  mcq("q_agi_p7", "Korkuluk varsayılanı?", ["Açık", "Kilit; listede yoksa dur", "Sessiz True", "eval"], 1),
  mcq("q_agi_p8", "Kayıt dışı araç?", ["Çalışır", "Yetkisiz eylem durur", "Önceki sonuç", "Kaşe"], 1),
  mcq("q_agi_p9", "Eval neyi kırar?", ["Log’u", "Beklenen ≠ çıkan ise baraj", "Tavanı", "Kuyruğu"], 1),
  mcq("q_agi_p10", "PII günlükte?", ["Zorunlu", "Yazılmaz; iz anahtar taşır", "Yalnız telefon", "Hash’siz evet"], 1),
  mcq("q_agi_p11", "Kapı `kabul` ne demektir?", ["Bitti", "Kuyruğa alındı", "200 zorunlu", "Eval geçti"], 1),
  mcq("q_agi_p12", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_agi_p13", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet; hash", "Hayır; yalnız satın alma"], 1),
  mcq("q_agi_p14", "İleri oda özeti nedir?", ["Yalnız print", "Çizelge → onarım → korkuluk → eval → kuyruk", "Yalnız import", "Yalnız class"], 1),
];
