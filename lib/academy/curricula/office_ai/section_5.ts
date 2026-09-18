/** Vatandaş Ders 5/9 — dosya adı teknik sonektir (`section_5` / `01_office_ai-5`); sıra `lib/academy/curricula/lesson-index.ts` içindedir. */
import type { Section } from "../types";

export const section5: Section = {
  sectionNumber: 5,
  lessonKey: "01_office_ai-5",
  title: "İstisnalar & Hata Avı: AI Yanılınca",
  targetDurationMinutes: 8.6,
  estimatedWordCount: 1066,
  pedagogicalObjective:
    "AI çıktısına gözü kapalı güvenmeme. Yapay zekâ neden uydurur? Dil modeli işlemci değildir; kelime olasılığını tahmin eder. Tablodaki sapmayı gözünle nasıl avlarsın? Satır toplamı ile genel toplamı çapraz kontrol et. AI çıktısı kontrol edilmeden masaya neden koyulmaz? Uydurma satır genel toplamı şişirir, bütçeye sızar.",
  contentMarkdown: `
Dördüncü dersimizde Sunum Fabrikası ile slayt başına tek fikir kuralını oturtmuştuk. Akıcı slayt, doğru sayı demek değildir. Peki neden hâlâ e-postaya geçmiyoruz? Çünkü slaytın arkasındaki rakam kilitlenmeden toplantıya çıkılmaz; yönetici o slayttaki toplamı karar sanır. Güzel bir slayt, şişmiş bir toplamı gizlemez; aksine onu kürsüye taşır. Rutin yazışmaları henüz açmadık; önce rapordaki uydurma rakamı yakalayacağız. Şimdi o sayının nasıl şiştiğine bakıyoruz.

Selamlar, ben Gözde. İş Hayatında ve Ofiste Yapay Zekâ eğitimimizin beşinci dersine hoş geldin. Geçen derste slaytı kurduk; peki şimdi ne olacak? Akıcı slayt masaya gider ama içindeki sayı yanlışsa yönetici o yanlışı karar sanır. Hepimiz o tabloyu bir kez okuyup «düzenli duruyor, doğrudur» dediğimiz anı hatırlıyoruz. Peki neden hızlanırken hata avı gerekir? Çünkü tablo düzenli görününce çoğu kişi her rakamın doğru olduğunu varsayar. Bugün o varsayımı kıracağız: önce sapmayı gör, sonra raporu kilitle.

Çoğu çalışan üretilen metin akıcı veya tablo düzenli göründüğünde her sayının doğru olduğunu varsayar. Peki yapay zekânın sunduğu özete gözü kapalı neden güvenilmez? Çünkü tek hatalı satır, yönetime giden tüm tablonun güvenilirliğini sıfırlar. Özet güzel Türkçe konuşur; aritmetik ayrı bir iştir. Bu bölümde modeli kendi ürettiği veriyi denetleyen bir kontrol uzmanına çevireceğiz. Böylece hem sapmayı yakalarsın hem de raporu masaya koymadan önce kilitlersin.

## AŞIRI GÜVEN

Peki yapay zekâ neden uydurur? Çünkü dil modeli matematiksel bir işlemci değildir; kelime olasılığını tahmin eder. Toplama makinesi gibi çalışmaz; bir sonraki kelimeyi «doğru duran» bir cümleye oturtur. Özetlerken veya toplarken hiç var olmayan bir sayıyı, profesyonel bir üslupla, belgede varmış gibi basabilir. Satır durur, virgül durur, para birimi durur; kaynak evrak durmaz. İşte buna halüsinasyon diyoruz. Toplantıda genel müdüre uydurma rakam okumak istemiyorsan, raporu kontrol etmeden masaya koyma.

Bir finans raporunu veya aylık satış çizelgesini modele emanet ettiğinde formüllerin her zaman doğru çalıştığını varsaymak büyük bir yanılgıdır. Karmaşık toplamlarda veya istisnai satırlarda model kaynaksız bir meblağı listeye ekleyebilir. Peki yapay zekâ çıktısı kontrol edilmeden masaya neden koyulmaz? Çünkü o uydurma satır genel toplamı şişirir; şişen toplam bütçeye ve tedarik kararına sızar. Yönetici 59.450 görürse o rakamı bütçe sanır. Bu kör güveni kırmak için çapraz sorgulamayı refleks haline getireceğiz.

## HATA AVI

Şimdi mantığı oturtalım. Sistemi kendi hatasını bulmaya zorlamak için ona açık bir denetim komutu vermelisin. Yapay zekâya tablodaki satır toplamları ile genel toplam arasında çelişki olup olmadığını incelemesini ve uyumsuz her satırı kırmızı ile işaretlemesini söyleyeceğiz. Neden? Çünkü net direktif modelin düz metin üretmek yerine her hücreyi yeniden hesaplamasını ister. «Güzel özet yaz» dersen akıcı metin basar; «çelişkiyi işaretle» dersen hücreye döner. Olası bir halüsinasyonda uydurduğu sayı kendi kuralına takılır.

Peki tablodaki mantık hatasını veya yanlış toplamı gözünle nasıl avlarsın? Önce satırdaki Mart ve Nisan hücrelerini kendi aralarında topla; satır toplamı o iki hücreyi vermiyorsa sapma oradadır. Yıldız Tekstil’de 9.100 artı 3.400, 12.500 vermeli; 21.500 görürsen o hücre uydurmadır. Sonra satır toplamlarını alta yaz; genel toplam hücresi o toplamı vermiyorsa fark kırmızı uyarıdır. Komutunda bu farkı açıkça yazmasını ve riskli bölgeleri kırmızı etiketlemesini iste. Böylece yüzlerce satırı tek tek ezberlemek yerine sapmayı ekranda görürsün.

## AI DEDEKTİF

Şimdi ekrandaki dikey bölünmüş karşılaştırmaya bak. Sol tarafta kontrolsüz üretilen ilk tablo duruyor. Yıldız Tekstil satırında kaynaksız biçimde uydurulmuş 21.500 liralık bir meblağ var. Mart 9.100, Nisan 3.400; satır toplamı 12.500 olmalıydı. Bu gizli hata yüzünden alttaki genel toplam 59.450 gibi duruyor ama gerçek verilerle bağı yok. Yapay zekâ olmayan bir faturayı gerçek gibi listeye eklemiş. Sol panel kör süreçtir: tablo akıcı durur, matematik kilitli değildir.

Sağ taraftaki panelde dedektif komutuyla yeniden taranmış tablo yer alıyor. Sistem sol taraftaki uydurma 21.500 değerini ve buna bağlı şişen 59.450 genel toplamını tespit etti. Aradaki mantık uyuşmazlığını kırmızı ile vurguladı; orijinal kaynakta böyle bir sipariş yok. Yıldız satır toplamı formülle 12.500, genel toplam 50.450. Sağ panel denetim paneli gibi çalışır: sapma görünür, toplam düşer. Böylece asılsız veri bütçeye sızmadan durdu.

## FARK ORTADA

Ekrana dikkatli bak. Peki neden fark bu kadar belirgin? Çünkü sol taraftaki raporda gözden kaçan 59.450 toplamı şirketi yanlış bütçe ayırmaya veya hatalı tedarik kararına sürükleyebilirdi. Sağ tarafta ise satır toplamı ile genel toplam yeniden hesaplandı; halüsinasyon durdu. Sol taraf kör süreçtir: akıcı durur, matematik kilitli değildir. Sağ taraf dedektif süreçtir: sapma kırmızı, toplam 50.450. Aynı tablo, iki kader: biri uydurma fatura, diğeri kilitli sayı.

Gördüğün gibi denetim, hatayı krize dönüşmeden önce yakalar. Yapay zekânın bazen gerçek dışı sayı türetebileceğini bilmek seni zayıflatmaz; raporu kilitleyen kişi yapar. Kontrolsüz bırakılan bir rapordaki 59.450 gibi yanıltıcı toplam yerine her adımı gerekçelendiren denetimli tabloyla ilerlersin. Akıcı özet masaya çıkmaz; kilitli sayı çıkar. Sayı kilitlenmeden slayta da, yöneticiye de gitmez. Şimdi bu yöntemi kalıcı bir alışkanlığa çevirelim.

## CEBİNE KOY

Bu derste öğrendiğin hata avını iş hayatında şu üç adımla cebine koy. 1. Tablolardaki tüm toplamları doğrudan modele bırakmak yerine her zaman bir formül aracılığıyla ikinci kez doğrulat. Çünkü dil modeli işlemci değildir; formül hücrenin işidir. 2. Üretim tamamlandığında yapay zekâya bu tabloda mantık hatası var mı sorusunu açıkça sorarak çapraz kontrol yaptır. Çünkü sormazsan uydurma satır akıcı özetin içinde kalır. 3. Finansal veya operasyonel açıdan en kritik veriyi her zaman son bir insan gözü denetimiyle kilitlesin. Çünkü kaynak evrak yoksa sayı masaya çıkmaz. Bu üç filtre uydurma verinin iş akışını bozmasını engeller.

## SIRA SENDE

Bugünkü saha görevinde senden son bir ayda hazırladığın veya üzerinde çalıştığın gerçek bir veri tablosunu masaya yatırmanı istiyorum. Yapay zekâya tablodaki satırları ve genel toplamları çapraz kontrol ettirip gizli bir uyumsuzluk aramasını söyle. Sistemden hatalı veya şüpheli gördüğü her satırı kırmızı ile işaretlemesini ve gerekçesini yazmasını iste. Satır toplamı genel toplamı vermiyorsa raporu gönderme. Çıkan özet akıcı olsa bile sayıyı kaynak evraktan geçirmeden masaya koyma.

Kendi veri setindeki hataları ayıklamayı bitirdiğinde bu refleks günlük çalışma tarzının parçası olur. Uydurma satır bir kez yakalanınca ertesi tabloda da aynı soruyu sorarsın. Sıradaki ders e-posta ritüelidir: etiket, taslak, insan onayı, arşiv. Gelen kutusunu sıfırlama alışkanlığını orada kuracağız. Gmail kapısı ve Word ataşı ondan sonra gelir. Haftalık Sistem kapanış dersidir; 30 Dakika Cuma rutini ve sınav köprüsü en sonda açılır. Sayı kilitlenmeden Cuma penceresini açma.

## El kitabı (kasetin sığdırmadığı)

### Lisans yoksa ne yapılır?
Copilot yoksa aynı çapraz kontrol istemini ataşladığın xlsx üzerinde Gemini veya ChatGPT’ye yaz. TOPLA kilidi araçta değil, sende durur: satır toplamı genel toplamı vermiyorsa raporu gönderme.

### Kenar durum / dikkat edilecek hata
Akıcı Türkçe özet, doğru aritmetik demek değildir. Model 21.500 gibi kaynaksız satır basabilir. Kaynak evrak yoksa sayıyı sil. Tarih formatı (gün.ay.yıl vs ay/gün) ayrı tuzaktır; F2 ile hücreyi oku.

### Yapılmaması gereken tuzak
Özete gözü kapalı güven. İkinci tuzak: uydurma satırı slayta taşıyıp yöneticiye okutmak. Sayı kilitlenmeden Cuma rutini kurulmaz.
`,
};
