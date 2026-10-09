import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Sabit süratli hareket. */
export const JUNIOR_FEN_10_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-10",
  title: "Sabit süratli hareket",
  teaser:
    "Sürat, alınan yolun geçen zamana bölümüdür. Sabit süratte yol zamanla doğru orantılıdır. Kavramsal Anlayış, bölme ile grafiği bağlar. İfade Gücü, 120 metreyi 40 saniyede alan cismin süratini söylemektir.",
  welcome:
    "Merhaba! Bilim dünyasına hoş geldin, çünkü bugün hareketin ve zamanın mükemmel ritmini birlikte çözeceğiz. Parkta koşarken ya da okula doğru yürürken her saniyede aynı mesafeyi katettiğini hiç düşündün mü? Hızın ne artıyor ne azalıyorsa buna fizikte sabit süratli hareket deriz. Bugün seninle alınan yolu, geçen zamanı ve sürat kavramını birleştirip harika grafiklerle okuyacağız.",
  concept:
    "Sürat, bir hareketlinin birim zamanda aldığı yoldur. Sürati bulmak için alınan yolu, geçen zamana böleriz. Alınan yol metre, geçen zaman saniye olarak ölçüldüğünde süratin birimi metre bölü saniye olur. Yol kilometre, zaman saat olarak alındığında ise kilometre bölü saat birimi kullanılır. Sabit süratli harekette hareketli, eşit zaman aralıklarında eşit yollar alır. Yol zaman grafiğini çizdiğimizde noktalar yukarıya doğru düzgün eğimli bir doğru oluşturur. Sürat zaman grafiğinde ise sürat hiç değişmediği için yatay düz bir çizgi elde ederiz. Şurası aklında kalsın tamam mı: Sürati hesaplarken yolu ve zamanı çarpmayız; mutlaka yolu zamana böleriz.",
  example:
    "Düz bir yolda bisiklet süren bir arkadaşımızı izleyelim. Arkadaşımız 120 metre yolu tam 40 saniyede tamamlasın. Sürati bulmak için 120 metreyi 40 saniyeye böleriz: 120 bölü 40, eşittir 3 metre bölü saniye çıkar. Bu ne demektir? Arkadaşımız her bir saniyede tam 3 metre yol almaktadır. 10 saniye geçtiğinde 30 metre, 20 saniye geçtiğinde 60 metre yol gider. Yol zaman grafiğini çizdiğimizde bu noktalar dümdüz eğimli bir doğru verir. Sürat zaman grafiğine baktığımızda ise değer hep 3 metre bölü saniye seviyesinde yatay bir çizgi olarak kalır. Başka bir koşucu 100 metreyi 20 saniyede koşarsa sürati 5 metre bölü saniye olur ve grafiği daha dik yükselir.",
  hint: "trap",
  warning:
    "Sürati hesaplarken yolu ve zamanı çarpmak yerine, alınan yolu geçen zamana bölmeyi her zaman hatırla. Grafiğe baktığında ise yatay bir doğru görürsen süratin hiç değişmediğini, yani hareketin sabit süratli olduğunu hemen fark edeceksin.",
  life:
    "Bunu okul servisiyle yolculuk yaparken ya da yürüyüş bandında spor yaparken hemen görebilirsin. Yürüyüş bandını saatte 4 kilometreye ayarladığında her saat tam 4 kilometre yol alırsın; süratin sabittir. Arabanın hız göstergesi 60 kilometre bölü saat üzerinde kıpırdamadan duruyorsa araç sabit süratle ilerliyordur. Bir problem çözerken metre ile saniyeyi, kilometre ile saati eşleştirmeyi ve birimleri karıştırmamayı unutma.",
  recap: [
    "Sürat, alınan yolun geçen zamana bölümüdür.",
    "Sabit süratli harekette alınan yol zamanla doğru orantılı olarak artar.",
    "Yol zaman grafiği eğimli bir doğrudur; sürat zaman grafiği ise yatay bir doğrudur.",
  ],
  conceptSeal: "Sabit sürat, eşit zamanlarda eşit yol almaktır.",
  voiceSeal: "Yolu zamana bölerek sürati birimiyle söylersin.",
  outcomes: [
    "Sürat, yolun zamana bölümüdür.",
    "Sabit süratte alınan yol zamanla doğru orantılıdır.",
    "Yol zaman grafiği sabit süratte bir doğrudur.",
  ],
  scene: "speed",
  parentNote:
    "Çocuğunuz sürati yol bölü zaman diye kurar. 120 metre ve 40 saniye örneğinde sonuç 3 metre bölü saniyedir. Yol ile zamanın çarpılmaması ve grafiğin doğru olması evde pekişir.",

};

export const JUNIOR_FEN_10 = juniorLessonFromScenario(JUNIOR_FEN_10_SCENARIO);
