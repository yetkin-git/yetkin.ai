import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Tümdengelim ve buzun yoğunluğu. FB.6.5.4 ve FB.6.5.5. */
export const JUNIOR_FEN_35_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-35",
  title: "Tümdengelim ve buzun yoğunluğu",
  teaser:
    "Tümdengelim, genel bir kuraldan tek bir sonuca inmektir. Buzun yoğunluğu sıvı suyunkinden küçüktür, bu yüzden buz yüzer. Kavramsal Anlayış, hipotezi ölçümle sınar. İfade Gücü, yüzen buzu yoğunluk kuralına bağlamandır.",
  welcome:
    "Merhaba sevgili çocuklar! Bardaktaki buz suyun dibine batmaz, yüzeyde durur. Bu sürpriz bir tesadüf değil, yoğunluk kuralının bir sonucudur. Genel kuraldan tek olaya inmeye tümdengelim denir. Bugün bir hipotez kurup buzun yoğunluğunu ölçeceğiz. Bardaktaki buzu gözlemlemek, kuralın nereye oturduğunu gösterir.",
  concept:
    "Tümdengelim, doğru kabul edilen genel bir önermeden özel bir sonuç çıkarmaktır. Önerme şudur: Yoğunluğu sıvıdan küçük olan cisim o sıvıda yüzer. Buzun yoğunluğu yaklaşık 0,92 gram bölü santimetreküp, sıvı suyunki yaklaşık 1 gram bölü santimetreküptür. 0,92 değeri 1'den küçük olduğu için buz suda yüzer. Madde modeli bunu açıklar: buzda tanecikler daha açık bir düzendedir, aynı sayıda tanecik daha büyük hacim kaplar. Hipotez, ölçümden önce kurulan denenebilir cümledir. Pratik kural: Önce genel kuralı yaz, sonra sayıyı kurala uygula.",
  example:
    "Hipotez: Buz, suya bırakılınca yüzer. Bardakta 200 mililitre su ve 1 buz parçası olsun. Buz batar mı diye bakmadan önce tümdengelim yürür: yoğunluğu küçük olan yüzer, buzun yoğunluğu 0,92'dir, öyleyse yüzer. Gözlem hipotezi destekler. Aynı buzu daha yoğun bir sıvıda da yüzdürürsün; zeytinyağında ise yağın yoğunluğu sudan küçük olduğu için yağ üstte kalır, bu ayrı bir karşılaştırmadır. Modelde buzun tanecik boşluğu sıvı sudan daha geniştir.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Buzun sudan ağır olduğu için battığını sanmak tuzaktır. Yoğunluğu kütleyle bir saymak da yanlıştır. Tümdengelimi, ölçmeden uydurulan rastgele cümle sanmak kuralı bozar. Tümdengelim ve buzun yoğunluğu konusunda kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu yazın içeceğindeki buzda görürsün. Gölde yüzen buz tabakası alttaki canlılara yer bırakır, çünkü buz üstte kalır. Mutfakta yağ ve suyun ayrılması da yoğunluk sırasını hatırlatır. Okulda hipotezi deneye yazmak tümdengelimi somutlaştırır.",
  recap: [
    "Tümdengelim, genel kuraldan özel sonuca iner.",
    "Buzun yoğunluğu sıvı suyunkinden küçüktür.",
    "Bu yüzden buz suda yüzer ve tanecik düzeni daha açıktır.",
  ],
  conceptSeal: "Buz yüzer, çünkü yoğunluğu suyunkinden küçüktür.",
  voiceSeal: "Yüzen buzu tümdengelim cümlesiyle ve sayıyla açıklarsın.",
  outcomes: [
    "Tümdengelim genel kuraldan özel sonuca gider.",
    "Buzun yoğunluğu sudan küçüktür.",
    "Hipotez deneyle sınanır.",
  ],
  scene: "particles",
  parentNote:
    "Çocuğunuz buzun yüzmesini yoğunlukla açıklar. 0,92 ile 1 karşılaştırmasını kurar. Hipotezi deneyden önce yazması beklenir.",
};

export const JUNIOR_FEN_35 = juniorLessonFromScenario(JUNIOR_FEN_35_SCENARIO);
