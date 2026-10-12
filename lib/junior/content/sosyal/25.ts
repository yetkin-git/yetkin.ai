import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler. Yatırım ve pazarlama proje önerisi. SB.6.5.3. */
export const JUNIOR_SOSYAL_25_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-25",
  title: "Yatırım ve pazarlama proje önerisi",
  teaser:
    "Yatırım, satıştan önce konan emek ve kaynaktır. Pazarlama, ürünü kime ve nasıl anlatacağıdır. Proje önerisi bu ikisini bir modelde yazar. Kavramsal Anlayış, yatırımı pazarlamadan ayırır. İfade Gücü, önerinin üç parçasını söylemektir.",
  welcome:
    "Merhaba sevgili çocuklar! Okul bahçesindeki bir stantta ayraç satmak isteyen sınıf, önce kâğıdı ve süreyi hesaplar. Bu hesap yatırımdır. Ayıracı kime anlatacağı ise pazarlamadır. Proje önerisini bir panayır modelinde kuracağız.",
  concept:
    "Yatırım, ürün ortaya çıkmadan konan kaynaktır: kâğıt, zaman ve emek. Pazarlama, bu ürünü kimin alacağını ve ona ne söyleyeceğini seçmektir. Proje önerisi, ikisini aynı kâğıda yazan plandır. Model, öneriyi üç kutuda kurar: ne üretilecek, kime anlatılacak, kaynak yetiyor mu. Araştırma, alıcının okulda mı yoksa bir markette mi durduğunu sormaktır. Pratik kural: Önce kaynağı yaz, sonra alıcıyı yaz, en sonda cümleyi dene.",
  example:
    "Sınıf, okul panayırında ayraç standı için bir model kurar. İlk kutu yatırımdır: iki deste renkli kâğıt ve bir öğleden sonra emek. İkinci kutu pazarlamadır: alıcı, teneffüste kitap okuyan öğrencidir; cümle «sayfa kaybetme» der. Üçüncü kutu araştırmadır: aynı ayıraç bir markette de duruyor mu, fiyat orada daha mı yüksek. Öneri bu üç kutu yazılınca proje olur. Kaynak yazılmadan «çok satar» demek öneri değildir.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Pazarlama cümlesini yatırım sanmak tuzaktır. Alıcıyı araştırmadan stant açmak da öneriyi eksik bırakır. «Herkes alır» demek model değildir. Yatırım ve pazarlama proje önerisinde kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu evde küçük bir satışta da kurabilirsin. Arkadaşına kurabiye anlatmadan önce un ve zaman yatırımını yazarsın. Okul kantini yerine bir market reyonuna bakmak araştırmadır. Lira kutusu ancak bu sıra tamam olunca anlam kazanır. Model, üç kutuyu yan yana tutar.",
  recap: [
    "Yatırım, satıştan önce konan kaynak ve emektir.",
    "Pazarlama, ürünü kime anlatacağını seçmektir.",
    "Proje önerisi bu ikisini bir modelde yazar.",
  ],
  conceptSeal: "Yatırım kaynaktır. Pazarlama, alıcıya söylenen cümledir.",
  voiceSeal: "Bir proje önerisinde kaynağı, alıcıyı ve araştırma kutusunu ayrı söylersin.",
  outcomes: [
    "Yatırım satıştan önce konan kaynaktır.",
    "Pazarlama alıcıyı ve cümleyi seçer.",
    "Proje önerisi üç kutuluk bir modeldir.",
  ],
  scene: "fair",
  parentNote:
    "Çocuğunuz yatırım ile pazarlamayı ayırır. Okul panayırı için kaynak, alıcı ve araştırma kutularından bir proje önerisi kurması beklenir.",
};

export const JUNIOR_SOSYAL_25 = juniorLessonFromScenario(JUNIOR_SOSYAL_25_SCENARIO);
