/** Vatandaş Ders 5/8 — dosya adı teknik sonektir (`section_5` / `01_office_ai-5`); sıra `lib/academy/curricula/lesson-index.ts` içindedir. */
import type { Section } from "../types";

export const section5: Section = {
  sectionNumber: 5,
  lessonKey: "01_office_ai-5",
  title: "İstisnalar ve Hata Avı: Yapay Zekâ Yanılınca",
  targetDurationMinutes: 9.2,
  estimatedWordCount: 1143,
  pedagogicalObjective:
    "Yapay zekâ çıktısına gözü kapalı güvenmeme. Yapay zekâ neden uydurur? Dil modeli işlemci değildir; kelime olasılığını tahmin eder. Tablodaki sapmayı gözünle nasıl avlarsın? Satır toplamı ile genel toplamı çapraz kontrol et. Yapay zekâ çıktısı kontrol edilmeden masaya neden koyulmaz? Uydurma satır genel toplamı şişirir, bütçeye sızar.",
  contentMarkdown: `
Dördüncü dersimizde slayt başına tek fikir kuralını oturtmuştuk. Akıcı slayt, doğru sayı demek değildir. Bu dersin sonunda uydurma sayıyı kaynak hücreyle kilitlemeyi tek başına yapacaksın. Hâlâ e-postaya geçmiyoruz: slaytın arkasındaki rakam kilitlenmeden toplantıya çıkılmaz; yönetici o slayttaki toplamı karar sanır. Güzel bir slayt, şişmiş bir toplamı gizlemez; aksine onu kürsüye taşır. E-postayı henüz açmadık; önce rapordaki uydurma sayıyı yakalayacaksın. Şimdi o sayının nasıl şiştiğine bakıyorsun.

Selamlar, ben Gözde. İş Hayatında ve Ofiste Yapay Zekâ eğitimimizin beşinci dersine hoş geldin. Geçen derste slaytı kurduk; peki şimdi ne olacak? Akıcı slayt masaya gider ama içindeki sayı yanlışsa yönetici o yanlışı karar sanır. Hepimiz o tabloyu bir kez okuyup «düzenli duruyor, doğrudur» dediğimiz anı hatırlıyoruz. Peki neden hızlanırken hata avı gerekir? Çünkü tablo düzenli görününce çoğu kişi her rakamın doğru olduğunu varsayar. Bugün o varsayımı kıracağız: önce sapmayı gör, sonra raporu kilitle.

Çoğu çalışan üretilen metin akıcı veya tablo düzenli göründüğünde her sayının doğru olduğunu varsayar. Peki yapay zekânın sunduğu özete gözü kapalı neden güvenilmez? Çünkü tek hatalı satır, yönetime giden tüm tablonun güvenilirliğini sıfırlar. Özet güzel Türkçe konuşur; aritmetik ayrı bir iştir. Bu bölümde modeli kendi ürettiği veriyi denetleyen bir kontrole çevirirsin. Böylece hem sapmayı yakalarsın hem de raporu masaya koymadan önce kilitlersin.

## AŞIRI GÜVEN

Peki yapay zekâ neden uydurur? Çünkü dil modeli matematiksel bir işlemci değildir; kelime olasılığını tahmin eder. Hesap makinesi gibi çalışmaz; bir sonraki kelimeyi «doğru duran» bir cümleye oturtur. Özetlerken veya toplarken hiç var olmayan bir sayıyı, düzgün bir dille, belgede varmış gibi yazabilir. Satır durur, virgül durur, para birimi durur; kaynak evrak durmaz. İşte buna uydurma (teknik adıyla halüsinasyon) diyoruz. Toplantıda genel müdüre uydurma sayı okumak istemiyorsan, raporu kontrol etmeden masaya koyma.

Bir finans raporunu veya aylık satış tablosunu modele emanet ettiğinde formüllerin her zaman doğru çalıştığını varsaymak büyük bir hatadır. Karmaşık toplamlarda veya aradaki tek tük satırlarda model kaynaksız bir tutarı listeye ekleyebilir. Peki yapay zekâ çıktısı kontrol edilmeden masaya neden koyulmaz? Çünkü o uydurma satır genel toplamı şişirir; şişen toplam bütçeye ve tedarik kararına sızar. Yönetici 59.450 görürse o rakamı bütçe sanır. Bu kör güveni kırmak için çapraz kontrolü refleks haline getir.

## HATA AVI

Şimdi mantığı oturtalım. Sistemi kendi hatasını bulmaya zorlamak için ona açık bir denetim istemi vermelisin. Yapay zekâya tablodaki satır toplamları ile genel toplam arasında çelişki olup olmadığını incelemesini ve uyumsuz her satırı kırmızı ile işaretlemesini yazmasını iste. Neden? Çünkü açık istem modelin düz metin üretmek yerine her hücreyi yeniden hesaplamasını ister. «Güzel özet yaz» dersen akıcı metin basar; «çelişkiyi işaretle» dersen hücreye döner. Olası bir uydurmada uydurduğu sayı kendi kuralına takılır.

Peki tablodaki mantık hatasını veya yanlış toplamı gözünle nasıl avlarsın? Önce satırdaki Mart ve Nisan hücrelerini kendi aralarında topla; satır toplamı o iki hücreyi vermiyorsa sapma oradadır. Yıldız Tekstil’de 9.100 artı 3.400, 12.500 vermeli; 21.500 görürsen o hücre uydurmadır. İkinci satır Demir Lojistik 17.300; o tutar değişmez. Demir’de 8.200 artı 9.100, 17.300 verir. Kaya Gıda’da 12.450 artı 8.200, 20.650 verir; orası kilitlidir. Sonra satır toplamlarını alta yaz; genel toplam hücresi o toplamı vermiyorsa farkı kırmızıyla işaretle. İsteminde bu farkı açıkça yazmasını ve riskli bölgeleri kırmızı ile işaretlemesini iste. Böylece yüzlerce satırı tek tek ezberlemek yerine sapmayı ekranda görürsün. Şüpheli hücrede F2’ye bas; formül mü, düz sayı mı bak.

## ÇAPRAZ KONTROL

Şimdi ekrandaki dikey bölünmüş karşılaştırmaya bak. Sol tarafta kontrolsüz üretilen ilk tablo duruyor. Yıldız Tekstil satırında kaynaksız biçimde uydurulmuş 21.500 liralık bir tutar var. Mart 9.100, Nisan 3.400; satır toplamı 12.500 olmalıydı. Bu gizli hata yüzünden alttaki genel toplam 59.450 gibi duruyor ama gerçek verilerle bağı yok. Yapay zekâ gerçek bir faturanın tutarını yanlış işledi. Sol panel kör süreçtir: tablo akıcı durur, matematik kilitli değildir.

Sağ taraftaki panelde çapraz kontrol istemiyle yeniden taranmış tablo yer alıyor. Sistem sol taraftaki uydurma 21.500 değerini ve buna bağlı şişen 59.450 genel toplamını tespit etti. Aradaki mantık uyuşmazlığını kırmızı ile işaretledi; kaynak evrakta böyle bir değer yok. Yıldız satır toplamı formülle 12.500, genel toplam 50.450. Sağ panel denetim paneli gibi çalışır: sapma görünür, toplam düşer. Böylece uydurma veri bütçeye sızmadan durdu.

## FARK ORTADA

Ekrana dikkatli bak. Fark bu kadar belirgin. Sol taraftaki raporda gözden kaçan 59.450 toplamı şirketi yanlış bütçe ayırmaya veya hatalı tedarik kararına sürükleyebilirdi. Sağ tarafta ise satır toplamı ile genel toplam yeniden hesaplandı; uydurma durdu. Sol taraf kör süreçtir: akıcı durur, matematik kilitli değildir. Sağ taraf kontrol sürecidir: sapma kırmızı, toplam 50.450. Aynı tabloda iki sonuç durur: biri hatalı fatura, diğeri kilitli sayı.

Gördüğün gibi denetim, hatayı krize dönüşmeden önce yakalar. Yapay zekânın bazen uydurma sayı basabileceğini bilmek seni zayıflatmaz; raporu kilitleyen kişi yapar. Kontrolsüz bırakılan bir rapordaki 59.450 gibi yanıltıcı toplam yerine her adımı gerekçelendiren denetimli tabloyla ilerlersin. Akıcı özet masaya çıkmaz; kilitli sayı çıkar. Sayı kilitlenmeden slayta da, yöneticiye de gitmez. Şimdi bu yöntemi kalıcı bir alışkanlığa çevirelim.

## CEBİNE KOY

Bu derste öğrendiğin hata avını iş hayatında şu üç adımla cebine koy. 1. Tablolardaki tüm toplamları doğrudan modele bırakmak yerine her zaman bir formül aracılığıyla ikinci kez doğrula. Doğrulamayı TOPLA formülüne bırak: satır toplamı genel toplamı vermiyorsa raporu gönderme. Çünkü dil modeli işlemci değildir; formül hücrenin işidir. 2. Üretim tamamlandığında yapay zekâya bu tabloda mantık hatası var mı diye sor. Çünkü sormazsan uydurma satır akıcı özetin içinde kalır. 3. Finansal veya operasyonel açıdan en kritik veriyi her zaman son bir insan gözü denetimiyle kilitle. Çünkü kaynak evrak yoksa sayı masaya çıkmaz. Bu üç filtre uydurma verinin iş akışını bozmasını engeller.

## SIRA SENDE

Bugünkü saha görevinde senden son bir ayda hazırladığın veya üzerinde çalıştığın gerçek bir veri tablosunu masaya yatırmanı istiyorum. Kişi adı, IBAN veya şirket sırrı varsa önce maskele; ham tabloyu sohbete bırakma. Yapay zekâya tablodaki satırları ve genel toplamları çapraz kontrol ettirip gizli bir uyumsuzluk aramasını iste. Copilot yoksa aynı çapraz kontrol istemini ataşladığın Excel tablosu üzerinde sohbet yapay zekâsına (ChatGPT, Claude, Gemini, Grok, Kimi, Muse Spark vb.) yaz. Sistemden hatalı veya şüpheli gördüğü her satırı kırmızı ile işaretlemesini ve gerekçesini yazmasını iste. Satır toplamı genel toplamı vermiyorsa raporu gönderme. Çıkan özet akıcı olsa bile sayıyı kaynak evraktan geçirmeden masaya koyma.

Kendi veri setindeki hataları ayıklamayı bitirdiğinde bu refleks günlük çalışma tarzının parçası olur. Uydurma satır bir kez yakalanınca ertesi tabloda da aynı soruyu sorarsın. Sıradaki ders e-posta akışıdır: etiket, taslak, insan onayı ve arşiv ilk iki dakikada, ardından Gmail veya Outlook paneli. Word ataşı ondan sonra gelir. Sayı kilitlenmeden Cuma penceresini açma.

## El kitabı (sesin sığdırmadığı)

### Lisans yoksa ne yapılır?
Copilot yoksa aynı çapraz kontrol istemini ataşladığın Excel tablosu üzerinde sohbet yapay zekâsına (ChatGPT, Claude, Gemini, Grok, Kimi, Muse Spark vb.) yaz. TOPLA formülü araçta değil, sende durur: satır toplamı genel toplamı vermiyorsa raporu gönderme.

### Kenar durum / dikkat edilecek hata
Akıcı Türkçe özet, doğru aritmetik demek değildir. Model 21.500 gibi kaynaksız satır basabilir. Kaynak evrak yoksa sayıyı sil. Tarih formatı (gün.ay.yıl veya ay/gün) ayrı tuzaktır; F2 ile hücreyi oku.

### Yapılmaması gereken tuzak
Özete gözü kapalı güvenme. İkinci tuzak: uydurma satırı slayta taşıyıp yöneticiye okutmak. Sayı kilitlenmeden Cuma rutini kurulmaz.
`,
};
