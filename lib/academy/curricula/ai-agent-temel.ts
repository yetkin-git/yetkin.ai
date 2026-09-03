/**
 * AI Agent Temel Seviye — otonom ajan müfredatı.
 * PEDAGOJI.md: 4 perde, tek eğitmen, Fail-Closed.
 * Ana kural: Şiir Okuma, Garsonu Göster. Şef / garson / araç çantası / not defteri.
 */

import type { AcademyExamQuestion } from "@/lib/academy/types";
import {
  academyInstructorLessonDraft,
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

export const AI_AGENT_TEMEL_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "ai-agent-temel-1",
    order: 1,
    title: "AI Agent Nedir? LLM veya Otonom Ajan Mantığı",
    intro: "Merhaba, ben Maya. Yapay Zeka Sistemleri Uzmanıyım. Kıdemli Yapay Zeka Mimarı olarak sahada ajan, araç ve Fail-closed kapıları kuruyorum. Hoş geldiniz. Bu bölümde AI Agent Nedir? LLM veya Otonom Ajan Mantığı konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Bugün acele etmeyeceğiz. Bir restorana gireceğiz. Orada iki kişi durur. İkisini aynı kişi sanırsan akşam yemeği gelmez. Oturdun. Karnın aç. Mutfakta bir şef var. Masada bir garson var. Şefe dönüp mercimek çorbası nasıl yapılır dersen, tarifi ezberden döker. Kokuyu anlatır. Tuzu ayarlar. Ama şef masana gelmez. Tencereyi ocaktan alıp önüne koymaz. Sen tarif dinlersin. Karnın hâlâ açtır. Çünkü tarif yemek değildir. Büyük Dil Modeli (LLM) o mutfaktaki şeftir. ChatGPT bir şeftir. Gemini bir şeftir. Claude bir şeftir. Ona soru sorarsın. Güzel cümle alırsın. Klavyeden çıkan şey bir tabak değildir. Bir konuşmadır. Garson başka iş yapar. Siparişi senden alır. Mutfağa bildirir. Tabağı masaya koyar. İş, konuşulduğu için bitmez. Tabağın geldiği için biter. Yapay zeka ajanı o masadaki garsondur. Cursor, Devin, AutoGPT birer garson duruşundadır. Bu akademinin vizyonu şudur: Konuşan AI değil, Çalışan AI. ChatGPT ile sohbet etmek, restoranda şefin hoparlöründen tarif dinlemektir. Cursor ile dosya yazdırmak, garsonun mutfağa gidip tabağı getirmesidir. Şimdi neden bu ayrımın pahalıya patladığını göreceğiz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. İnsanlar ChatGPT'yi garson sanır. Masada otururlar. Çorbayı getir derler. Şef çorbanın tarifini güzelce anlatır. Tabak gelmez. Karnın aç kalır. Çünkü tarif, yemek değildir. Bu, konuşan yapay zekayı çalışan sanmaktır. Şef dünün menüsünü ezberlemiştir. Bugünün tenceresini görmemiştir. Mutfak kapısı kapalıyken ağız açık kalırsa halüsinasyon başlar. Halüsinasyon, şefin tencereye bakmadan çorba hazır demesidir. Cümle kulağa düzgün gelir. Ama o cümlenin geldiği bir not defteri yoktur. Sen o cümleye güvenip yol alırsın. Yol bittikten sonra yalan ortaya çıkarsa hem zaman gider hem güven gider. Fail-closed (Hata Anında Kapalı) garsonun dürüst duruşudur. Mutfak kapalıysa tabak uydurulmaz. Araç çantasında alet yoksa işlem durur. Durmak utanılacak bir şey değildir. Durmak, masaya yalan tabak koymamaktır. Sohbet kutusu her soruya bir cümle borçluymuş gibi davranır. Garson borçlu değildir. Elinde not defteri yoksa susar. Sen hoparlörden gelen tarifi yemek saymazsın. Cursor duruşu budur: siparişi alır, mutfağa gider, tabağı koyar. Mutfak kapalıysa durur. ChatGPT duruşu başkadır: soruya cümle basar, tabağı unutur. Bu mimariyi kullanmamızın sebebi budur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere sohbet kutusu şeftir, ajan ise garson. Aynı siparişe iki ayrı ağız cevap verir. İlk satırda STOK durur. Bu, mutfaktaki not defteridir. Ankara karşılığında on sekiz yazar. İstanbul karşılığında on dört yazar. Sonra sohbet_kutusu gelir. Bu ChatGPT duruşudur. Şef bir soru alır. Ne yazarsan yaz, Sanırım hava güzel diye aynı cümleyi basar. Tarif güzeldir. Tabak yoktur. Sonra ajan_oku gelir. Bu Cursor duruşudur. Garson sehir parametresini sipariş sayar. Deftere bakar. Defterde yoksa raise ValueError işi keser. Uydurma derece basmaz. Defterdeyse gerçek sayıyı verir. Sayı defterden gelir, ağızdan gelmez. Alttaki assert bunu mühürler. Şef her soruya aynı tarifi basar. Garson Ankara için on sekiz döner. Mars defterde yoktur. Hata fırlar. Garson olmayan yemeği uydurmaz. Sen bu satırları ezberlemiyorsun. Şefin hoparlörünü ve garsonun tabağını ayırıyorsun. Ajanın işi şudur: siparişi al, mutfağa bildir, tabağı koy ya da dur. Tek başına basılmış bir cümle bu işin yerini tutmaz.",
    summary: "Bu dersle AI Agent Nedir? LLM veya Otonom Ajan Mantığı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Bugün şef ile garsonu ayırdın. Konuşan AI değil, Çalışan AI. Büyük Dil Modeli (LLM) mutfaktaki şeftir. ChatGPT tarif okur. Masaya gelmez. Yapay zeka ajanı masadaki garsondur. Cursor siparişi alır, mutfağa bildirir, tabağı koyar. Kapı kapalıysa durur. Fail-closed (Hata Anında Kapalı) burada durmanın adıdır. Sen bugün ChatGPT'nin tarifini Cursor'un tabağı sanmamayı öğrendin. Bir sonraki bölümde seni üretim tarifi ve yapılandırılmış çıktı bekliyor. Orada garsonun eline serbest mektup değil, doldurulmuş bir form vereceksin.",
    quiz: [
      mcq(
        "q_agt1_1",
        "ChatGPT (şef) ile Cursor (garson) farkı nedir?",
        ["Aynıdır; ikisi de yalnız metin üretir", "Şef metin üretir; garson araç çağırıp iş bitirebilir", "Garson eğitim kesitini günceller", "Şef her zaman güncel stok okur"],
        1,
      ),
      mcq(
        "q_agt1_2",
        "Araç çantası boşken Fail-closed (Hata Anında Kapalı) ne yapar?",
        ["Muhtemel tabak uydurur", "İşlemi durdurur; orta değer basmaz", "Önceki sohbeti stok sanır", "Sessizce 0 basar"],
        1,
      ),
      mcq(
        "q_agt1_3",
        "Halüsinasyon (uydurma) restoranda neye benzer?",
        ["Garson her zaman deftere bakıyor", "Şef tencereye bakmadan çorba hazır der", "Araç çağrısı zorunludur", "JSON şeması uydurmayı keser her zaman"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "STOK = {\"Ankara\": 18, \"İstanbul\": 14}\n\n\ndef sohbet_kutusu(soru):\n    return \"Sanırım hava güzel.\"\n\n\ndef ajan_oku(sehir):\n    if sehir not in STOK:\n        raise ValueError(\"sehir yok; islem durur\")\n    return STOK[sehir]\n\n\nassert sohbet_kutusu(\"Ankara kaç derece?\") == \"Sanırım hava güzel.\"\nassert ajan_oku(\"Ankara\") == 18\ntry:\n    ajan_oku(\"Mars\")\nexcept ValueError as hata:\n    assert \"durur\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-temel-2",
    order: 2,
    title: "Prompt Mühendisliği ve Yapılandırılmış Çıktı (JSON Çıktısı)",
    intro: "Merhaba arkadaşlar, ben Maya. Yeni bir bölümde yine beraberiz. Dersimize geçmeden önce, gelin geçen bölümde neler öğrendiğimize kısaca bir göz atalım. Acele etmeden tekrar edelim. Önceki dersteki şef-garson mantığını hatırlayalım. Mantığı oturtmadan koda geçersek otomasyon patlar. Bir önceki bölümde şef ile garsonu ayırdık. ChatGPT konuşur, Cursor çalışır. Kontrol listesini birlikte işaretleyelim: 1. Büyük Dil Modeli şeftir, yalnız metin basar. 2. Ajan garson duruşundadır, eylem yoksa durur. 3. Güzel cümle işin bittiği anlamına gelmez. Bu üç madde sağlamsa öğrenme temizdir, bugünün konusuna geçebiliriz. Bugün şefin ağzını kapatıp eline bir form vereceksin. Bu bölümde Prompt Mühendisliği ve Yapılandırılmış Çıktı konusunu, yani buna neden hayati derecede ihtiyaç duyduğunuzu ele alacağız. Masada oturuyorsun, telefona bir müşteri yazdı. Cümleleri uzun, içinde sitem var, biraz kırgın duruyor. Sen ChatGPT'ye döndün ve «Bu mesajı oku, acil mi bak» dedin. Şef mutfakta durdu, ağzını açtı ve roman gibi yazdı: «Bu müşteri biraz kırgın, dili sitemli, belki yarın bir kez aramak iyi olur...» Paragraflar aktı, okudun, insan gibi duruyordu. Ama sonra o romanla SMS atmak veya sistemde iş emri açmak istedin; kutu boş kaldı! Çünkü yazılım o paragraftan anlamaz. Yazılım kutucuk görür. Sen o paragrafı sevgiyle okursun ama yazılım kutunun dolu olup olmadığına bakar. Dolu değilse durur. «Hikaye» işi kilitleyip durdurdu. Şimdi bu mektubun otomasyonu nasıl durdurduğunu ve çözümü görelim.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. İnsanlar şefe serbest metin yazdırır. Mektup isterler. Hikâye isterler. Şef hikâyeyi sever. ChatGPT sohbet eder. Sohbet kulağa iş gibi gelir. Ama kasa bir hikâye okumaz. Kasa bir kutucuk bekler. Kutucuk dolmazsa SMS gitmez. İş emri açılmaz. Garson mutfağa gider. Elinde üç sayfalık bir mektup vardır. Aşçıbaşı sorar: acil mi, normal mi. Garson mektubu okumaya başlar. Mutfak bekler. Tencere soğur. Sipariş düşer. Çünkü mutfak mektup dinlemez. Mutfak kutucuk bekler. Sen otomasyonu hikâyeyle beslersen iş durur. Fail-closed (Hata Anında Kapalı) burada susmanın adıdır. Form kırıkken tabak uydurulmaz. Belki yarın cümlesi bir kutu değildir. Biraz kırgın cümlesi bir kutu değildir. Hikayeyi bırak. Garsonun eline doldurulmuş bir form ver. O formun adı JSON. Ağzını bantla. Yalnız iki kutu bırak: durum acil ya da durum normal. Kutu doluysa SMS gider. Kutu boşsa işlem durur. Cursor duruşu budur. ChatGPT roman yazar. Cursor kutu ister. Bu mimariyi kullanmamızın sebebi budur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere garson elindeki kâğıdı forma çevirir. İlk satırda json gelir. Bu, kâğıdı kutucuğa açan alettir. oku_durum ham kâğıdı alır. json.loads o kâğıdı okumaya çalışır. Kâğıt roman ise kırılır. ValueError fırlar. json değil, işlem durur. Garson uydurma kutu basmaz. Kâğıt form ise veri dolar. durum kutusuna bakar. acil veya normal değilse yine durur. Yalnız o iki değer geçer. İlk denemede sistem serbest metin gördüğü için hata verir, işlem durur. İkinci denemede 'durum: acil' kutusunu gördüğü için onaylar ve geçer. Üçüncü denemede 'durum: normal' kutusunu gördüğü için yine onaylar ve geçer. Tek resmi görürsün. Serbest metin sohbet ettirir. Kutucuk (JSON) sistemi çalıştırır. Sen bu satırları ezberlemiyorsun. Hikâyeyi masada bırakıp garsonun eline formu vermeyi öğreniyorsun.",
    summary: "Bu dersle Prompt Mühendisliği ve Yapılandırılmış Çıktı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Serbest metin sohbet ettirir. Kutucuk (JSON) sistemi çalıştırır. ChatGPT roman yazar. Cursor kutu ister. Sen bugün şefin ağzını bantlamayı öğrendin. durum acil ya da durum normal. O kutu doluysa iş yürür. Hikaye masada kalır. Form garsonun elinde durur. Bir sonraki bölümde seni araç kullanımı bekliyor. Fişteki ad gerçek fonksiyonu çağırır. Bilinmeyen ad durur. Bir sonraki bölümde görüşmek üzere.",
    quiz: [
      mcq(
        "q_agt2_1",
        "Şefe «bu mesaj acil mi bak» dersen ne olur?",
        ["SMS gider", "Roman yazar; yazılım o metni yemez", "İş emri açılır", "Kutu kendiliğinden dolar"],
        1,
      ),
      mcq(
        "q_agt2_2",
        "Yazılım hangisini işler?",
        ["Serbest metni, romanı", "Kutucuğu, durum acil veya durum normal", "Sitemli dili", "Belki cümlesini"],
        1,
      ),
      mcq(
        "q_agt2_3",
        "Form kırılınca ne olur?",
        ["Yarı roman kabul edilir", "İşlem durur; SMS gitmez", "Boş kutu uydurulur", "ChatGPT yine araç çağırır"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "import json\n\n\ndef oku_durum(ham):\n    try:\n        veri = json.loads(ham)\n    except json.JSONDecodeError as exc:\n        raise ValueError(\"json degil; islem durur\") from exc\n    durum = veri.get(\"durum\")\n    if durum not in (\"acil\", \"normal\"):\n        raise ValueError(\"durum yok; islem durur\")\n    return durum\n\n\ntry:\n    oku_durum(\"Evet, musterinin sitemli bir dili var\")\nexcept ValueError as hata:\n    assert \"json\" in str(hata)\nassert oku_durum('{\"durum\": \"acil\"}') == \"acil\"\nassert oku_durum('{\"durum\": \"normal\"}') == \"normal\"",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-temel-3",
    order: 3,
    title: "Araç Kullanımı (Tool Calling / Function Calling) Mantığı",
    intro: "Merhaba arkadaşlar, ben Maya. Yeni bir bölümde yine beraberiz ve her bölümde yeni şeyler öğrenmeye devam ediyoruz. Geçen bölümde ne kurgulamıştık? Şefin ağzını kapatıp eline doldurulmuş bir form verdik. Serbest metin sohbet ettirir, kutucuk sistemi çalıştırır dedik. Masadan kalkmadan bir adım daha ileri gidiyoruz. Formu eline verdik ama bu garson mutfakta tek başına ne yapacak? Cebinde hangi aletler var? Bu bölümde Araç Kullanımı mantığını ve bir ajanın dış dünyayla nasıl temas kurduğunu ele alacağız.",
    problem: "Yapay zekayla sohbet ederken en çok düşülen tuzak şudur: Modelden Ankara'daki hava durumunu istersin. Model size kendinden emin bir şekilde \"Ankara bugün 24 derece ve güneşli\" der. Oysa model Ankara'ya bakmamıştır, pencereden kafasını çıkarmamıştır; sadece o cümleyi kulağa mantıklı gelecek şekilde uydurmuştur. Buna halüsinasyon diyoruz. Ajan mimarisinde garson ise kafasından sayı uydurmaz. Müşteri \"Hava kaç derece?\" diye sorduğunda garson durur. Cebinden termometresini çıkarır, ölçer ve cevabı öyle verir. İşte o termometre, kod dünyasındaki bir Fonksiyondur. Biz buna \"Tool\" diyoruz.",
    application: "Ekrandaki kod bloğunda gördüğünüz bu yapılar Python diliyle yazılmıştır. Kod bilmiyorsanız kesinlikle endişelenmeyin; sizden bu satırları ezberlemenizi veya yazmanızı beklemiyoruz. Python temellerinizi geliştirmek isterseniz Akademi'deki Python eğitimimize göz atabilirsiniz. Bizim buradaki amacımız mantığı kavramak. Burada garsona iki tane alet teslim ediyoruz: Biri hava_durumu_getir, diğeri hesap_makinesi. Müşteri \"Ankara'da hava kaç derece?\" diye sorduğunda yapay zeka zihninden atmasyon yapmaz. Yazılıma der ki: \"Bana hava_durumu_getir aletini Ankara şehri için çalıştır.\" Yazılım gidip gerçek canlı veriyi alır, cevabı ajana getirir. Mesela eski cep saatlerini düşün. Garsonun cebinde bu eski cep saatlerinden olsa bile, eğer sen kodda saatin adını yanlış yazarsan garson elini cebine atar ama saate bakamaz, eli boş döner. Yazılım dünyasında sizin yazdığınız kelime ile sistemdeki karşılığı birebir aynı olmak zorundadır. Tek bir harf bile farklı olsa ajan bunu asla benzetmez. Siz 'matematik' yazarsınız, sistemde 'matamatik' yazıyorsa ajan 'Kullanıcı galiba bunu demek istedi' diye tahmin yürütmez, yorum yapmaz. Ajan için ya tam eşleşme vardır ya da o alet yok hükmündedir.",
    summary: "Bu dersle Araç Kullanımı mantığını kavradınız. Model zihinden uydurmaz, cebindeki aleti çağırır. Alet doğru tanımlanmışsa canlı veri akar, yanlışsa garson saate bakamaz ve sistem durur. Bir sonraki bölümde bu aletleri kullanırken ajanın öğrendiklerini unutmaması için Hafıza Mimarisi konusuna geçeceğiz. Bir sonraki bölümde görüşmek üzere.",
    quiz: [
      mcq(
        "q_agt3_1",
        "Bilinmeyen araç adında dürüst yol hangisidir?",
        ["Benzer isim çalıştır", "Fail-closed durur; çağrı düşer", "Sessizce None döner", "eval ile dene"],
        1,
      ),
      mcq(
        "q_agt3_2",
        "Araç sonucu nedir?",
        ["Nihai kullanıcı cevabı", "Gözlem; döngü bunu okuyup devam eder", "Sistem yasağı", "Şema kendisi"],
        1,
      ),
      mcq(
        "q_agt3_3",
        "Uygulama Programlama Arayüzü anahtarı nereye girmez?",
        ["Yalnız log’a", "Tarife ve araç argümanına yapışmaz", "Şema alanına serbestçe", "Not aracına gizlice"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "STOK = {\"Ankara\": \"24 derece\"}\n\n\ndef hava_durumu_getir(sehir):\n    if sehir not in STOK:\n        raise ValueError(\"sehir yok; islem durur\")\n    return STOK[sehir]\n\n\ndef hesap_makinesi(ifade):\n    if ifade != \"2+2\":\n        raise ValueError(\"ifade yok; islem durur\")\n    return 4\n\n\nARACLAR = {\"hava_durumu_getir\": hava_durumu_getir, \"hesap_makinesi\": hesap_makinesi}\n\n\ndef arac_cagir(ad, arguman):\n    fn = ARACLAR.get(ad)\n    if fn is None:\n        raise ValueError(\"bilinmeyen arac; islem durur\")\n    return fn(arguman)\n\n\nassert arac_cagir(\"hava_durumu_getir\", \"Ankara\") == \"24 derece\"\nassert arac_cagir(\"hesap_makinesi\", \"2+2\") == 4\ntry:\n    arac_cagir(\"matamatik\", \"2+2\")\nexcept ValueError as hata:\n    assert \"bilinmeyen\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-temel-4",
    order: 4,
    title: "Hafıza Mimarisi: Kısa ve Uzun Süreli Hafıza (Context Window & Vector Storage)",
    intro: "Merhaba sevgili arkadaşlar, ben Maya. Yepyeni bir bölümle tekrar beraberiz ve her bölümde yeni yeni şeyler öğrenmeye adım adım devam ediyoruz. Önceki bölümde ne öğrenmiştik? Garsonun cebine aletleri koyduk; saatin adını, termometrenin kuralını birebir doğru yazmazsak sistemin duracağını gördük. Aletleri kullanmayı öğrendik ama masada büyük bir sorun var: Bu garson her 10 saniyede bir hafızasını kaybediyor! Müşteri adını söylüyor, iki dakika sonra garson \"Sizin adınız neydi?\" diye soruyor. Bu bölümde Hafıza Mimarisi konusunu ve ajana nasıl bir hafıza kazandırdığımızı ele alacağız.",
    problem: "Aslında herkesin bildiğinin tersine olarak Yapay zeka modelleri doğuştan balık hafızalıdır. Siz sayfayı her yenilediğinizde veya yeni bir mesaj attığınızda model sıfır noktasına döner. İnsanlar zanneder ki yapay zeka onları hatırlar. Oysa arkadaki yazılım, siz her yeni mesaj attığınızda eski konuşmaları gizlice kopyalayıp yeni mesajın üstüne yapıştırır ve modele tekrar okutur. Ancak masanın üstü sonsuz değildir. Masanın üstüne koyabileceğiniz kâğıdın bir sınırı vardır. İşte o alan Kısa Süreli Hafızadır (Context Window). O kâğıt dolduğunda ilk yazılanlar masadan aşağı düşer ve unutulur. Peki ya 5 yıl önceki müşteri sözleşmesini veya 200 sayfalık bir kataloğu hatırlatmak istersek ne yapacağız?",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere hafızayı ikiye ayırıyoruz: Birincisi kisa_sureli_hafiza. Bu, garsonun elindeki not defteridir. O anki sohbeti tutar. Defter dolunca eski sayfalar silinir. İkincisi uzun_sureli_hafiza yani Vektör Veritabanı (Vector Storage). Bu da arka odadaki devasa kütüphanedir. Garson masadaki kâğıtta cevabı bulamazsa hemen arka kütüphaneye koşar, binlerce sayfa arasından sadece o an lazım olan tek bir cümleyi çekip getirir. Siz sistem kurarken modelin jeton sınırını patlatmamak için masanın üstünü şişirmemelisiniz. Lazım olan bilgi kütüphaneden çekilir, masaya konur, iş bitince masadan kaldırılır.",
    summary: "Bu dersle Hafıza Mimarisini kavradınız. Kısa süreli hafıza masadaki not kâğıdıdır, alanı dardır. Uzun süreli hafıza kütüphanedir, aradığınızı bulup masaya getirir. Bir sonraki bölümde seninle ajanın kendi kendine düşünüp adım atmasını sağlayan çok daha heyecanlı olan Karar Verme Döngüleri: ReAct Deseni konusuna geçeceğiz. Bir sonraki bölümde görüşmek üzere. O zamana kadar kendinize iyi bakın, bay bay.",
    quiz: [
      mcq(
        "q_agt4_1",
        "Bağlam penceresi dolunca eski tur ne olur?",
        ["Model sonsuza hatırlar", "Düşer; pencere tavanıdır", "Sessiz özet zorunludur", "Vektör depo otomatik dolar"],
        1,
      ),
      mcq(
        "q_agt4_2",
        "Getiri eşiğin altındayken dürüst yol hangisidir?",
        ["Genel bilgiyle doldur", "Üretim durur; uydurma yok", "Önceki cevabı kopyala", "Pencereyi ikiye katla"],
        1,
      ),
      mcq(
        "q_agt4_3",
        "Bu dersteki kelime örtüşmesi gerçek vektör depo mudur?",
        ["Evet, aynı fizik", "Hayır; kapıyı gösterir, sahte gömme iddiası yoktur", "Evet, cosine zorunlu", "Yalnız GPU’da"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "def kisa_pencere(turlar, tavan):\n    if tavan <= 0:\n        raise ValueError(\"tavan pozitif olmali; islem durur\")\n    return turlar[-tavan:]\n\n\ndef benzerlik(soru, kayit):\n    a = set(soru.lower().split())\n    b = set(kayit.lower().split())\n    if not a or not b:\n        return 0.0\n    return len(a & b) / len(a | b)\n\n\ndef getir(soru, depo, esik):\n    if not depo:\n        raise ValueError(\"depo bos; uydurma yok\")\n    en = max(depo, key=lambda kayit: benzerlik(soru, kayit))\n    if benzerlik(soru, en) < esik:\n        raise ValueError(\"kaynak yok; uydurma yok\")\n    return en\n\n\ngecmis = [\"merhaba\", \"ankara stok\", \"not: toplantı\"]\nassert kisa_pencere(gecmis, 2) == [\"ankara stok\", \"not: toplantı\"]\nassert getir(\"toplantı saati\", [\"not: toplantı 14:00\", \"hava 18\"], 0.2) == \"not: toplantı 14:00\"\ntry:\n    getir(\"mars kolonisi\", [\"not: toplantı 14:00\"], 0.8)\nexcept ValueError as hata:\n    assert \"kaynak yok\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-temel-5",
    order: 5,
    title: "Karar Verme Döngüleri: ReAct (Reason + Act) Deseni",
    intro: "Selamlar arkadaşlar, ben Maya. Dersler ilerledikçe mimarinin ne kadar güçlendiğini fark ediyorsunuzdur. Önceki bölümde ajanın unutkanlığını çözdük, ona hem bir not defteri hem de kütüphane verdik. Şimdi elimizde ne var? Aletlerini tanıyan ve hafızası olan bir garson var. Ama bu garson karmaşık bir müşteri geldiğinde ne yapacağını hala bilemiyor. Müşteri \"Bana en hızlı kargoyla yetişecek ürünü bul ve siparişini geç\" dediğinde tek bir alet yetmez. Bu bölümde, ajanın kendi kendine mantık yürütüp adımları sırayla atmasını sağlayan ReAct (Reason + Act) Desenini ele alacağız.",
    problem: "Geleneksel yazılımlarda veya düz bir sohbet robotunda yapay zeka tek bir soruya tek bir cevap verir. Önüne karmaşık, 3 adımlı bir iş geldiğinde afallar. Çünkü ne yapacağını planlayamaz. İnsan zihni nasıl çalışır? Bir problemle karşılaştığında önce düşünürsün: \"Önce stoğa bakmalıyım.\" Sonra adımı atarsın, stoğu kontrol edersin. Çıkan sonuca bakıp ikinci düşünceni kurarsın: \"Stok varmış, şimdi kargo süresine bakmalıyım.\" İşte ajanın insansı bir mantıkla çalışmasını sağlayan döngü tam olarak budur: Düşün, Eyleme Geç ve Gözlemle.",
    application: "Ekrandaki kod bloğunda gördüğünüz bu yapı ReAct döngüsünün Python üzerindeki çarkıdır. İlk adım DUSUN (Thought) adımıdır. Ajan zihninde \"Müşterinin adresine en yakın depoyu bulmalıyım\" der. İkinci adım EYLEM (Action) adımıdır. depo_sorgula aletini çağırır. Üçüncü adım GOZLEM (Observation) adımıdır. Aletten gelen veriyi okur. Eğer iş bitmediyse döngü başa döner, yeni bir düşünce üretir. İş bittiğinde ise müşteriye son cevabı döner. Siz bu mimariyi kurarken ajana serbest bir sonsuz döngü vermemelisiniz. Ajan bir adımda takılırsa sürekli aynı eylemi tekrarlayıp jetonunuzu yakabilir. Bu yüzden kod tarafında her zaman bir maksimum adım sınırı koymak zorundasınız.",
    summary: "Bu dersle ReAct mimarisinin mantığını kavradınız. Ajan artık tek bir cümleyle durmuyor; düşünüyor, eyleme geçiyor ve sonucu görüp bir sonraki adımı planlıyor. Bir sonraki bölümde öğrendiğimiz tüm bu parçaları birleştirip canlı bir uygulama yapacağımız Mini Proje aşamasına geçiyoruz. Sıradaki projede görüşmek üzere, şimdilik hoşça kalın!",
    quiz: [
      mcq(
        "q_agt5_1",
        "ReAct turunun sırası hangisidir?",
        ["Eylem → düşünce", "Düşünce → eylem → gözlem", "Gözlem → şema → sır", "Yalnız bitir"],
        1,
      ),
      mcq(
        "q_agt5_2",
        "Tur tavanı dolunca Fail-closed (Hata Anında Kapalı) ne yapar?",
        ["Bir araç daha dener", "Yeni araç çağırmaz; dürüst durur", "Önceki gözlemi cevap sanır", "Tavanı sessiz artırır"],
        1,
      ),
      mcq(
        "q_agt5_3",
        "Düşünce boşken eylem?",
        ["Serbesttir", "Yasaktır; kör savuruş durur", "Tavanı sıfırlar", "JSON’u atlar"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "STOK = {\"Ankara\": \"18 derece\"}\n\n\ndef hava_durumu(sehir):\n    if sehir not in STOK:\n        raise ValueError(\"sehir yok; islem durur\")\n    return STOK[sehir]\n\n\nARACLAR = {\"hava_durumu\": hava_durumu}\n\n\ndef react_tur(dusunce, eylem, arguman, tur_no, tavan):\n    if not dusunce.strip():\n        raise ValueError(\"dusunce bos; islem durur\")\n    if tur_no > tavan:\n        raise ValueError(\"tavan doldu; islem durur\")\n    if eylem == \"bitir\":\n        return {\"tur\": \"yanit\", \"metin\": arguman}\n    fn = ARACLAR.get(eylem)\n    if fn is None:\n        raise ValueError(\"bilinmeyen arac; islem durur\")\n    gozlem = fn(arguman)\n    return {\"tur\": \"gozlem\", \"metin\": gozlem}\n\n\nbir = react_tur(\"stok lazim\", \"hava_durumu\", \"Ankara\", 1, 3)\nassert bir[\"tur\"] == \"gozlem\"\nassert \"18\" in bir[\"metin\"]\niki = react_tur(\"cevap hazır\", \"bitir\", \"Ankara 18 derece\", 2, 3)\nassert iki[\"tur\"] == \"yanit\"\ntry:\n    react_tur(\"yine dene\", \"hava_durumu\", \"Ankara\", 4, 3)\nexcept ValueError as hata:\n    assert \"tavan\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-temel-6",
    order: 6,
    title: "Mini Proje: Hava Durumu ve Not Alma Araçlarını Kullanan Basit Bir Python AI Agent",
    intro: "Selamlar arkadaşlar, ben Maya. Geldik Modül 1'in büyük finaline! Buraya kadar parça parça ne öğrendik? Şef ile garsonu ayırdık, garsona JSON formunu verdik, cebine aletlerini koyduk, unutmasın diye hafıza ekledik ve en son ReAct ile ona adım adım düşünen bir zihin kazandırdık. Şimdi bu parçaları masada tek tek bırakmıyoruz. Hepsini tek bir canlı Python ajanı üzerinde birleştirip çalıştırıyoruz.",
    problem: "Teoriyi anlamak harikadır ama koda döküp çalıştırmadığınız sürece elinizde sadece bir fikir vardır, çalışan bir sisteminiz değil. Sektörde en çok yapılan hata şudur: İnsanlar hazır kütüphaneleri üst üste yığar ama arkadaki çarkın nasıl döndüğünü bilmez. Bir hata çıktığında da sistem donup kalır. Bugün kuracağımız mini projede ajanımız hem canlı hava durumunu sorgulayacak hem de aldığı bilgiyi bir not dosyasına kaydedecek. Yani ilk defa gerçek dünyada iz bırakan, bilgisayarınızın dosya sistemine dokunan canlı bir otomasyon inşa edeceğiz.",
    application: "Ekrandaki kod bloğunda bu 5 dersin özetini tek bir dosyada görüyorsunuz. Kodun üst tarafında iki adet fonksiyon tanımladık: Biri hava_durumu_getir, diğeri not_kaydet. Ajan kullanıcıdan \"Ankara'da hava kaç derece, bunu notlar dosyasına yaz\" isteğini aldığı an ReAct döngüsü başlar. Ajan ilk adımda düşünür: \"Önce havayı öğrenmeliyim.\" hava_durumu_getir aletini Ankara parametresiyle çağırır. Derece bilgisi ajana gözlem olarak geri döner. İkinci adımda tekrar düşünür: \"Şimdi bu dereceyi kaydetmeliyim.\" Bu kez not_kaydet aletini tetikler ve bilgiyi bilgisayarınızdaki notlar.txt dosyasına fiziksel olarak yazar. Bütün mimari şu mantıkla çalışır: Girdi gelir, ReAct karar verir, Tool çalışır, veri saklanır ve çıktı kullanıcıya sunulur. Bu kod şablonu; yarın bir gün bir restorana kuracağınız randevu sisteminin, bir e-ticaret sitesine ekleyeceğiniz stok takip ajanının en yalın ana omurgasıdır.",
    summary: "Tebrikler! 'AI Agent Temelleri' modülünü başarıyla tamamladınız. Artık sadece yapay zekayla sohbet eden biri değilsiniz; yapay zekayı araçlarla donatan, ona hafıza veren ve adımlarını yöneten bir Yapay Zeka Mimarı adayısınız. Bu dersle birlikte elinizde işletmelere satabileceğiniz ilk temel otomasyon mantığı oluştu. Ekrandaki kodları kendi ortamınızda denemekten çekinmeyin. Bir sonraki modülde bu ajanları gerçek veritabanlarına bağlayacağımız daha ileri seviye mimarilerde görüşmek üzere. Kendinize çok iyi bakın!",
    quiz: [
      mcq(
        "q_agt6_1",
        "Mini projedeki hava aracı ağa çıkar mı?",
        ["Evet, zorunlu", "Hayır; stok sözlüktür, sahte canlı iddiası yoktur", "Yalnız İstanbul’da", "JSON ağı açar"],
        1,
      ),
      mcq(
        "q_agt6_2",
        "`niyet` rafta yoksa ne olur?",
        ["Benzer araç çalışır", "ValueError; işlem durur", "Notlara yazar", "Sohbet cümlesi basar"],
        1,
      ),
      mcq(
        "q_agt6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Ajan bir tur atınca"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "import json\n\nSTOK = {\"Ankara\": \"parcali bulutlu, 18\", \"İstanbul\": \"yagmurlu, 14\"}\nNOTLAR = []\nARACLAR = {}\n\n\ndef hava_durumu(sehir):\n    if sehir not in STOK:\n        raise ValueError(\"sehir yok; islem durur\")\n    return STOK[sehir]\n\n\ndef not_yaz(metin):\n    temiz = metin.strip()\n    if not temiz:\n        raise ValueError(\"bos not; islem durur\")\n    NOTLAR.append(temiz)\n    return f\"kayit={len(NOTLAR)}\"\n\n\nARACLAR[\"hava_durumu\"] = hava_durumu\nARACLAR[\"not_yaz\"] = not_yaz\n\n\ndef ajan_adim(ham):\n    try:\n        veri = json.loads(ham)\n    except json.JSONDecodeError as exc:\n        raise ValueError(\"json degil; islem durur\") from exc\n    niyet = veri.get(\"niyet\")\n    if niyet not in ARACLAR:\n        raise ValueError(\"bilinmeyen arac; islem durur\")\n    arguman = veri.get(\"arguman\")\n    if not isinstance(arguman, str) or not arguman.strip():\n        raise ValueError(\"arguman yok; islem durur\")\n    return ARACLAR[niyet](arguman)\n\n\nassert ajan_adim('{\"niyet\": \"hava_durumu\", \"arguman\": \"Ankara\"}') == \"parcali bulutlu, 18\"\nassert \"kayit=1\" in ajan_adim('{\"niyet\": \"not_yaz\", \"arguman\": \"toplantı 14:00\"}')\ntry:\n    ajan_adim('{\"niyet\": \"sil\", \"arguman\": \"x\"}')\nexcept ValueError as hata:\n    assert \"bilinmeyen\" in str(hata)",
    },
  }),
] as const;

const AI_AGENT_TEMEL_LESSON_QUIZZES: AcademyExamQuestion[] = AI_AGENT_TEMEL_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları. */
export const AI_AGENT_TEMEL_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...AI_AGENT_TEMEL_LESSON_QUIZZES,
  mcq("q_agt_p1", "Otonom ajan neyi bitirir?", ["Yalnız şiir", "Araçla iş; düz sohbet yetmez", "Eğitim kesitini", "Pencere tavanını"], 1),
  mcq("q_agt_p2", "Halüsinasyon nedir?", ["Araç sonucu", "Kaynaksız uydurma cümle", "JSON şeması", "Tur tavanı"], 1),
  mcq("q_agt_p3", "Zorunlu alan eksik JSON’da?", ["Kabul", "Parse sonrası durur", "Varsayılan şehir", "None niyet"], 1),
  mcq("q_agt_p4", "Serbest metin ne işe yarar?", ["Sistemi çalıştırır", "Sohbet ettirir; kutucuk sistemi çalıştırır", "SMS atar", "İş emri açar"], 1),
  mcq("q_agt_p5", "Araç kaydı ne işe yarar?", ["TTS", "İzinli fonksiyon adını tutar", "Pencereyi açar", "Barajı düşürür"], 1),
  mcq("q_agt_p6", "Gözlem kimden gelir?", ["Kullanıcı şiiri", "Araç çıktısı", "Sertifika", "TTS"], 1),
  mcq("q_agt_p7", "Kısa hafıza nedir?", ["Diskteki vektör", "Penceredeki son turlar", "GPU belleği", "Sertifika hash"], 1),
  mcq("q_agt_p8", "Uzun hafıza eşiği neden durur?", ["Hız", "Zayıf eşleşmede uydurmayı kesmek", "JSON hızlanır", "TTS"], 1),
  mcq("q_agt_p9", "ReAct «bitir» ne üretir?", ["Yeni araç", "Nihai yanıt turu", "Pencere sıfır", "Silme"], 1),
  mcq("q_agt_p10", "Boş not aracında?", ["Boş kayıt", "Fail-closed; işlem durur", "None not", "Hava basar"], 1),
  mcq("q_agt_p11", "Canlı model olmadan ajan öğretilir mi?", ["Hayır", "Evet; kapılar sahte ağsız görünür", "Yalnız GPU", "Yalnız TTS"], 1),
  mcq("q_agt_p12", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_agt_p13", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet; hash", "Hayır; yalnız satın alma"], 1),
  mcq("q_agt_p14", "Ajan döngüsü özeti nedir?", ["Yalnız print", "Şema → araç → gözlem → tavan", "Yalnız import", "Yalnız class"], 1),
];
