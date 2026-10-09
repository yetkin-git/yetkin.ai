import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Yoğunluk. */
export const JUNIOR_FEN_12_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-12",
  title: "Yoğunluk",
  teaser:
    "Yoğunluk, kütlenin hacme bölümüdür. Aynı maddenin yoğunluğu ayırt edici bir özelliktir. Kavramsal Anlayış, kütle ile yoğunluğu ayırır. İfade Gücü, 24 gram ve 8 santimetreküpten yoğunluğu söylemektir.",
  welcome:
    "Hoş geldin! Hazırsan bugün zihnimizi harika bir bilim yolculuğuna çıkarıyoruz, çünkü cisimlerin suda yüzme ve batma sırrını çözeceğiz. Hiç koca bir kütüğün nehirde batmadan yüzdüğünü, minicik bir dikiş iğnesinin ise suya düşer düşmez dibe battığını görüp şaşırdın mı? Ağır olmak ile batmak aynı şey değildir. Bugün seninle kütle ile hacmin harika dengesi olan yoğunluk kavramını öğreneceğiz.",
  concept:
    "Yoğunluk, bir maddenin birim hacmindeki kütlesidir. Yoğunluğu bulmak için kütleyi hacme böleriz; yani yoğunluk eşittir kütle bölü hacim. Kütle eşit kollu teraziyle gram cinsinden, hacim ise dereceli silindirle santimetreküp cinsinden ölçülür. Bu yüzden yoğunluğun birimi gram bölü santimetreküp olarak ifade edilir. Saf maddeler için yoğunluk, aynı sıcaklık ve basınç altında ayırt edici bir özelliktir. Suyun yoğunluğu yaklaşık olarak 1 gram bölü santimetreküptür. Bir cismin yoğunluğu suyunkinden küçükse suda yüzer; sudan büyükse batar; suya eşitse askıda kalır. Şurası aklında kalsın tamam mı: Yoğunluk kütle demek değildir; koca bir tahta ağır olsa da yoğunluğu küçük olduğu için suyun üstünde kalır.",
  example:
    "Şimdi elimize 24 gram gelen küçük bir taş parçası alalım. Bu taşın hacmini dereceli silindirle 8 santimetreküp olarak ölçmüş olalım. Yoğunluğunu bulmak için kütleyi hacme böleriz: 24 bölü 8, eşittir 3 gram bölü santimetreküp çıkar. Suyun yoğunluğu 1 olduğuna ve 3 sayısı 1'den büyük olduğuna göre bu taş suda hemen dibe batar. Şimdi de 20 gram kütleye ve 40 santimetreküp hacme sahip bir tahta parçası düşünelim. Yoğunluğu 20 bölü 40, yani sıfır tam onda beş gram bölü santimetreküptür. Bu değer 1'den küçük olduğu için tahta suda neşeyle yüzer. Kütle hacim grafiği çizdiğimizde noktaların oluşturduğu doğrunun eğimi bize yoğunluğu verir.",
  hint: "trap",
  warning:
    "Ağır olan cisimlerin her zaman batacağını sanmak çok doğal bir yanılgıdır; oysa dev bir tahta kütük ağır olmasına rağmen suda yüzer! Çünkü batıp batmamayı tek başına kütle değil, kütlenin hacme oranı olan yoğunluk belirler.",
  life:
    "Bunu mutfakta salata sosu hazırlarken hemen gözlemleyebilirsin. Zeytinyağını suyun üzerine döktüğünde yağ hemen suyun üzerine çıkar ve üstte toplanır; çünkü zeytinyağının yoğunluğu suyunkinden daha küçüktür. Denizde taktığın can yeleği de içindeki hava sayesinde senin toplam hacmini büyütür, ortalama yoğunluğunu suyun yoğunluğunun altına düşürür ve seni güvenle su üstünde tutar.",
  recap: [
    "Yoğunluk, bir maddenin kütlesinin hacmine bölünmesiyle bulunur.",
    "Saf suyun yoğunluğu yaklaşık 1 gram bölü santimetreküptür.",
    "Yoğunluğu sudan küçük olan cisimler yüzer; büyük olanlar ise dibe batar.",
  ],
  conceptSeal: "Yoğunluk, aynı hacme düşen kütleyi karşılaştırır.",
  voiceSeal: "Kütleyi hacme bölerek yoğunluğu birimiyle söylersin.",
  outcomes: [
    "Yoğunluk, kütle bölü hacimdir.",
    "Yoğunluk maddeler için ayırt edici bir özelliktir.",
    "Suda yüzme, yoğunluğun suya göre küçük olmasıyla ilgilidir.",
  ],
  scene: "particles",
  parentNote:
    "Çocuğunuz yoğunluğu kütle bölü hacim diye kurar. 24 gram ve 8 santimetreküp örneği 3 gram bölü santimetreküp eder. Ağırlığın batmakla aynı şey olmadığı tahta ve vida örneğinde durur.",

};

export const JUNIOR_FEN_12 = juniorLessonFromScenario(JUNIOR_FEN_12_SCENARIO);
