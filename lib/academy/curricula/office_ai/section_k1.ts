import { ACADEMY_KVKK_DELETE_BUTTON_SUMMARY } from "@/lib/academy/kvkk-workspace";
import type { Section } from "../types";

export const sectionK1: Section = {
  sectionNumber: 2,
  lessonKey: "01_office_ai-k1",
  title: "KVKK, Şirket Sırları ve Maskeleme: Ne Yüklenmez?",
  targetDurationMinutes: 10.7,
  estimatedWordCount: 1433,
  pedagogicalObjective:
    "Müşteri listesini, IBAN, T.C. Kimlik No, maaş ve şirket sırrını açık yapay zekâ ekranına yüklememeyi göstermek. Neden üç sahte satırın yettiğini anlat; yüklemeden önce maskele; 3. Kapı yalnız maskeli kısa özettir.",
  contentMarkdown: `
İlk derste tabloyu A1 kuralıyla düzenledin. Bu dersin sonunda hangi satırın sohbete gitmeyeceğini tek başına ayıracaksın. Şimdi mantığı oturtalım. O tabloyu düzenlemiş olman, onu yapay zekâya yükleyebileceğin anlamına gelmez. Neden? Çünkü hücreler düzgün dizilmiş olsa bile satırların içinde hâlâ gerçek insanların adı, telefonu, IBAN’ı ve maaşı duruyor olabilir. ChatGPT, Gemini, Grok ve benzeri ister ücretsiz ister ücretli tüm açık sohbet ekranlarına müşteri listesi, IBAN, T.C. kimlik numarası gibi ham verileri yükleyemezsin. Bu ders, rapor ve ataş derslerinden önce neyin yüklenmeyeceğini ve neden yüklenmeyeceğini adım adım öğretir.

Selamlar, ben Gözde. İş Hayatında ve Ofiste Yapay Zekâ eğitimimizin KVKK, şirket sırları ve maskeleme dersine hoş geldin. Bugün birlikte şu soruyu çözeceğiz: yapay zekâya her dosya neden gitmez? Çünkü sohbet kutusuna yazdığın metin, o ekranı kapatınca yok olmaz. Kişisel veri, şirket sırrı ve ham kimlik bu yüzden sohbetin işi değildir. Yapay zekâya veri vermeden önce ham verideki kişisel bilgileri maskelemelisin; böylece hem işini yaptırırsın hem de insanı açıkta bırakmazsın. Önce bu alışkanlığı oturtacağız.

Masada müşteri Excel’i açık durur. Ad, telefon, T.C. Kimlik No, IBAN ve maaş aynı tablodadır. Saha tuzağı şudur: model hızlı cevap versin diye ham tabloyu sohbet yapay zekâsının ekranına atarsın. Sebebi şu: sohbet kutusu senin arşivin değildir. ${ACADEMY_KVKK_DELETE_BUTTON_SUMMARY} Bu yüzden önce yasak listeyi masada net yazacağız: hangi satırların hiç gitmeyeceğini, hangilerinin maskelenerek gidebileceğini.

## YASAK LİSTE

Şimdi yasak listeyi tane tane yazalım. Neden bir liste tutuyoruz? Çünkü ofiste her dosya aynı sınıfta değildir; bazı satırlar bir insanın kimliğini tek bakışta ele verir. Yüklenmez olanlar şunlardır. Müşteri adı ve telefonu birlikte. Açık IBAN. Maaş tablosu ve prim. T.C. Kimlik No. Hasta veya öğrenci kaydı. Sözleşmedeki ceza maddesiyle birlikte kişi adı. Müşteri programı (CRM) ekran görüntüsü. Müşteri ve tutar cümlesi. Bu dosyalar yerleşik panelde de, ataşla da, dış sohbette de aynı kuralı taşır. Kapı yalnız verme yoludur; içeri giren ham satır hâlâ ham satırdır. Bu yüzden ham hali gitmez.

Şirket sırrını da aynı masaya koyalım. Fiyat listesi, maliyet, henüz açıklanmamış kampanya, rakip notu kişisel veri değildir; ama rakipten ve piyasadan sakladığın bilgidir. Bu yüzden farklı sınıftır ama aynı sertlikle korunur: ham haliyle dış sohbete gitmez. Peki ne gidebilir? Açık katalog bilgisi gidebilir: ürün adı, genel stok cümlesi — kişiye bağlı değil. Kaya Gıda ürün adı (tutarsız, kişisiz) açık katalog örneğidir; müşteri ve tutarlı satır sırdır. Senin gerçek listen varsa kişiye bağlı satır gitmez. Önce maskele. Böylece hem açık kataloğu kullanırsın hem de gerçek insanı sohbetin dışına alırsın.

## MASKELE

Şimdi maskelemenin ne olduğunu netleştirelim. Maskelemek silmek değildir. Peki neden satırı tamamen silmiyoruz? Çünkü satırı tamamen silersen yapay zekâ tablonun mantığını da kaybeder; sütunların ne işe yaradığını göremez. Yapay zekâya veri vermeden önce ham verideki kişisel bilgileri takma değerle değiştirirsin. Ayşe Kaya yerine Müşteri A yaz. IBAN yerine MASKELİ_IBAN yaz. Telefonu kaldır, MASKELİ_TELEFON yaz. Sorunu yaz. Alt çizgili büyük harfle MASKELİ_IBAN yaz (boşluk değil). Modele şunu yazabilirsin: ‘Bu üç satır maskelidir. Ad yok, telefon yok. Sütun adları Ürün, Adet, Bölge. Bölge bazında üç maddelik özet iste.’ Gördüğün gibi istem günlük dille yazılıyor; kısıt da istemin içinde duruyor: ad yok, telefon yok.

Şimdi masada duran somut bir satırı birlikte maskeleyelim. Ham satır şöyle durur: Ayşe Kaya, telefon, IBAN açık, maaş 42.000, T.C. Kimlik No görünür. Bu satır sohbet kutusuna yapıştırılmaz. Maskeli karşılığı şudur: Müşteri A, MASKELİ_TELEFON, MASKELİ_IBAN, MASKELİ_MAAŞ, kimlik yok. Üç maddelik özeti istersin: aynı istemi kutuya yazarsın. Peki neden üç satır yeter de otuz satırlık müşteri dökümü yetmez? Yapay zekâya tablonun mantığını kavratmak için bin kişilik müşteri listesinin tamamını yüklemene gerek yok. Sadece sütun başlıklarını ve mantığı gösterecek üç tane örnek, sahte satır yüklersen, yapay zekâ mantığı anlar. Böylece hem bin kişinin gerçek ad, soyad ve IBAN verisini riske atmamış olursun, hem de aynı özeti alırsın. Otuz satırlık müşteri dökümü üçüncü kapı değildir; çünkü fazla gerçek satır modeli daha zeki yapmaz, yalnızca daha fazla insanı açıkta bırakır. Görüldüğü gibi model hâlâ işini yapar. Sen ise insanı ve şirketi açıkta bırakmazsın. Aynı kural Copilot şeridinde de, Gemini ataşında da durur. Kapı değişir; ham kimlik gitmez. Yarın gerçek listen açıldığında aynı takma değerleri yazarsın. Silmek yetmez, çünkü silinen satır mantığı da götürür. Değiştirmelisin, çünkü takma değer hem korur hem öğretir.

F2 ile gördüğün kesme işareti veri düzenidir: hücredeki gizli karakteri görürsün, modelin şaşırmamasını sağlarsın. Maske ise yükleme öncesi atlayamayacağın adımdır: kimliği takma değerle değiştirirsin. Peki neden ikisini karıştırmayalım? Çünkü biri tablonun okunmasını düzeltir, diğeri insanın sohbete girmesini engeller. İkisi ayrı reflekstir. A1 kuralı düzgün olsa bile açık isim sohbete girmez. Düzen, yükleme izni değildir. Şimdi Üç Kapı kuralını doğru yere koyalım.

## ÜÇÜNCÜ KAPI

Üç Kapı kuralını şimdi doğru yere koyalım. Bu kural güvenlik sınıfı değildir; veriyi yapay zekâya nasıl vereceğini sıralar. Birinci kapı yerleşik paneldir: Copilot veya Gemini şeridi. İkinci kapı ataştır: Excel tablosu, Word belgesi, PowerPoint sunusu. Üçüncü kapı dış sohbette maskeli kısa özet yazma disiplinidir. Kişisel veri ve şirket sırrı hangi kapıdan geçerse geçsin ham haliyle gitmez. Neden? Çünkü kapı yalnızca yoldur; içeri giren satır hâlâ aynı satırdır. Ham metni kutuya yapıştırmak üçüncü kapı değildir. Ekran görüntüsü zinciri üçüncü kapı değildir. Bunlar atlanmış kapıdır: birinci ve ikinci kapıyı denemeden, maske de koymadan ham kimliği dışarı taşımaktır.

Peki birinci ve ikinci kapı duruyorsa neden üçüncü kapıyı açmayalım? Çünkü şirketinin kendi şeridi veya ataş yolu varken, ham listeyi dış sohbete taşımana gerek yoktur. Durmuyorsa, yani lisans yoksa ve ataş da uygun değilse, o zaman üçüncü kapıyı açarsın; ama yine bütün listeyi değil. Yapay zekâya tablonun mantığını kavratmak için üç satır yeter: sütun başlıkları ve üç örnek, sahte satır. Otuz satırlık müşteri dökümü gerekmez, çünkü model fazladan yirmi yedi gerçek isimle daha iyi özet yazmaz; sen ise yirmi yedi kişiyi daha riske atmış olursun.

## FARK ORTADA

Şimdi ekrandaki yan yana karşılaştırmaya bak. Sol tarafta ham yapıştırma durur: Ayşe Kaya, telefon, IBAN açık. Sağ tarafta maskeli kısa özet durur: Müşteri A, MASKELİ_IBAN, üç satır soru. Sol taraf hızlı görünür; çünkü kopyala-yapıştır bir saniye sürer. Ama şirketi ve insanı açıkta bırakır. Sağ taraf yavaş görünür; çünkü önce takma değer yazarsın. Sağ tarafı seçiyoruz, çünkü kapıyı doğru kullanırsın ve aynı özeti, kimliği ifşa etmeden alırsın.

Peki iki taraf arasındaki fark nerede durur? Fark, hangi aracı açtığında değil, o araca neyin girdiğindedir. Copilot ve büyük dil modelleri (sohbet yapay zekâları) aynı kuralı taşır. Hangi sohbeti kullanırsan kullan, içeri giren ham ad hâlâ ham addır. Modelin adı değişir, kural değişmez. Gördüğün gibi doğru maske, raporu yavaşlatmaz. Yanlış yapıştırma şudur: sohbet kutusunu kendi bilgisayarın sanırsın. Sil düğmesi, yüklemiş olmanı geri almaz. Bu yüzden doğru adım, içeri giren satırı maskelemektir.

## CEBİNE KOY

Cebine üç kural koy. 1. Müşteri listesi, IBAN, T.C. Kimlik No, maaş tablosu ve şirket sırrı ham haliyle açık yapay zekâ ekranına yüklenmez; çünkü bir kez giren satır silmekle geri gelmez. 2. Veri vermeden önce maskele: Ayşe Kaya yerine Müşteri A, IBAN yerine MASKELİ_IBAN. Böylece model sütun mantığını görür, ham kimliği görmez. 3. Üçüncü Kapı kuralı: yalnız maskeli kısa özet; dış sohbette ekran görüntüsü zinciri yoktur. Çünkü ekran görüntüsü, maske koymadan ham tabloyu dışarı taşır. ${ACADEMY_KVKK_DELETE_BUTTON_SUMMARY}

## SIRA SENDE

Sıra sende. Masandaki bir gerçek listeyi aç. Ad, telefon, IBAN, T.C. Kimlik No varsa maskele. Üç satırlık soru yaz. Ham dosyayı sohbet yapay zekâsına bırakma. Üç sahte satırın, bin gerçek satır kadar iş gördüğünü masada fark edeceksin. Sıradaki kapı rapordur: temiz ve maskeli tablodan üç maddelik yönetim özeti.

## El kitabı (sesin sığdırmadığı)

### Lisans yoksa ne yapılır?
Ham ad, telefon, IBAN, kimlik, maaş sohbete yüklenmez. Ayrıntı şirketinin kuralıdır. Bu ders hukuki danışmanlık değildir.

### Ücretli abonelik
Aboneliğin ücretli (Plus/Pro/Team) olsa bile açık sohbete ham kişisel veri ve şirket sırrı atılamaz. Ücretli üyelik modeli eğitmese de veri sunucuya gider. Yüklemeden önce her zaman maskeliyoruz.

### Kenar durum / dikkat edilecek hata
Açık katalog bilgisi (ürün adı, genel stok cümlesi — kişiye bağlı değil) gidebilir; aynı satırda kişi adı belirdiği anda dur. Hasta veya öğrenci kaydı, maaş cetveli, açık T.C. Kimlik No — bunlar «iç kullanım» diye sohbete girmez. İç kullanım, kişisel veriyi kamuya açmaz.

### Yapılmaması gereken tuzak
«Sohbeti sonra silerim.» ${ACADEMY_KVKK_DELETE_BUTTON_SUMMARY} İkinci tuzak: bu dersi sona bırakıp önce ataş alışkanlığı kazanmak. Yüklemeden önce maske kuralını 2. derste kilitle; aksi halde ataş refleksi ham kimliği de götürür.
`,
};
