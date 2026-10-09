import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Madde ve ısı. */
export const JUNIOR_FEN_13_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-13",
  title: "Madde ve ısı",
  teaser:
    "Isı bir enerji aktarımıdır. Sıcaklık termometrede okunan derecedir. Kavramsal Anlayış, iletken ile yalıtkanı ayırır. İfade Gücü, metal kaşığın neden çabuk ısındığını söylemektir.",
  welcome:
    "Selamlar! Bugün seninle doğanın ve bilimin çok keyifli bir sırrını keşfedeceğiz, çünkü sıcacık bir çorbadan kışın giydiğimiz montlara kadar ısının yolculuğunu takip edeceğiz. Sıcak çorba kasesine konan metal kaşığın sapının hemen elini yaktığını, oysa tahta kaşığın serin kaldığını hiç fark ettin mi? İki kaşık da aynı çorbanın içindedir ama ısıyı iletme hızları bambaşkadır. Bugün seninle ısı iletkenlerini, ısı yalıtkanlarını ve binalardaki yalıtım sırlarını öğreneceğiz.",
  concept:
    "Isı, sıcaklığı yüksek olan maddeden sıcaklığı düşük olan maddeye doğru aktarılan bir enerji türüdür. Sıcaklık ise bir enerji değildir; maddelerin taneciklerinin ortalama hareket enerjisinin bir göstergesidir ve termometreyle derece olarak ölçülür. Isıyı kolayca ve hızlı bir şekilde ileten maddelere ısı iletkeni denir. Bakır, alüminyum ve demir gibi metaller mükemmel birer ısı iletkenidir. Isıyı iyi iletmeyen, geçişini çok yavaşlatan maddelere ise ısı yalıtkanı denir. Tahta, plastik, yün, strafor köpük, cam yünü ve hava iyi birer yalıtkandır. Şurası aklında kalsın tamam mı: Bir odada yan yana duran metal masa ayağı ile ahşap masa yüzeyi aynı sıcaklıktadır. Metal ayağa dokunduğunda elinden ısıyı hızla çektiği için sana daha soğukmuş gibi hissettirir.",
  example:
    "Kaynayan bir çorba tenceresine bakalım. Tencerenin gövdesi metalden yapılır; çünkü ocağın ateşi çorbaya hızla geçsin istenir. Ancak tencerenin kulp kısımları plastik veya bakalit gibi ısı yalıtkanı maddelerle kaplanır; böylece elimiz yanmadan tencereyi tutabiliriz. Binaların dış cephelerine kaplanan strafor köpükler de kışın evdeki ısının dışarı kaçmasını, yazın ise dışarıdaki sıcağın içeri girmesini engeller. Sıcak çayımızı saatlerce sıcak tutan termoslar da iç içe iki parlak yüzey ve aralarındaki boşlukla ısı yalıtımı sağlar. 80 derece sıcaklıktaki bir çay kaşığı ile 80 derecedeki bir fincan çayın sıcaklıkları aynıdır; ancak fincandaki ısı enerjisi kütlesi daha büyük olduğu için daha fazladır.",
  hint: "gold",
  warning:
    "Aynı odadaki metal kaşığı tahtadan daha soğuk hissettiğinde aldanma; ikisinin de sıcaklığı birbirine eşittir! Metal elindeki ısıyı çok hızlı ilettiği için sana serin gelir. Isı yalıtkanı maddeler ise bu geçişi yavaşlatarak sıcaklığı korur.",
  life:
    "Bunu kış aylarında kalın bir mont giyerken hemen hissedebilirsin. Montundaki yün ve elyaf dolgular arasındaki durgun hava, vücut ısını dışarıya bırakmayan harika bir ısı yalıtkanıdır. Kuşların da kışın tüylerini kabartarak araya hava doldurması tam olarak bu yalıtım içgüdüsüdür. Evlerde pencerelerin çift cam yapılması da iki cam arasındaki hava boşluğuyla yakıt tasarrufu sağlar.",
  recap: [
    "Isı bir enerji türüdür; sıcaklık ise termometreyle ölçülen bir değerdir.",
    "Metaller iyi birer ısı iletkenidir; tahta, yün, plastik ve strafor ısı yalıtkanıdır.",
    "Isı yalıtımı enerji tasarrufu sağlar; metalin soğuk hissi elden ısıyı çabuk almasındandır.",
  ],
  conceptSeal: "Isı iletimi, enerjinin maddenin tanecikleri boyunca aktarılmasıdır.",
  voiceSeal: "İletken ile yalıtkanı bir kaşık örneğinde ayırırsın.",
  outcomes: [
    "Isı ve sıcaklık aynı kavram değildir.",
    "Metaller ısıyı iyi iletir.",
    "Yalıtım malzemeleri ısı geçişini yavaşlatır.",
  ],
  scene: "particles",
  parentNote:
    "Çocuğunuz ısıyı enerji, sıcaklığı derece diye ayırır. Metal kaşık ile tahta kaşık evdeki örnektir. Metalin soğuk hissedilmesinin çabuk iletimden geldiğini de söyler.",

};

export const JUNIOR_FEN_13 = juniorLessonFromScenario(JUNIOR_FEN_13_SCENARIO);
