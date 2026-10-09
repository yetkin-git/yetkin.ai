import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Deyimler ve atasözleri. */
export const JUNIOR_TURKCE_13_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-13",
  title: "Deyimler ve atasözleri",
  teaser:
    "Deyim kalıplaşmış bir sözdür ve gerçek anlamından uzaktır. Atasözü öğüt veren genel bir yargıdır ve genellikle tam cümledir. Kavramsal Anlayış, ikisini ayırır. İfade Gücü, bir sözün deyim mi atasözü mü olduğunu söylemektir.",
  welcome:
    "Selamlar! Bugün seninle dilimizin ve güzel Türkçemizin çok keyifli bir sırrını keşfedeceğiz, çünkü yüzyılların birikiminden süzülen en bilge ve en renkli söz hazinelerimize odaklanacağız. Hiç burnu havada dendiğinde birinin gerçekten burnunun yukarıya doğru kalktığını düşündün mü? Elbette hayır! O söz, kendini beğenmiş kibirli bir tutumu anlatır. Bugün seninle deyimler ile atasözlerini ayıran ince çizgiyi ve dilimize kattıkları derin anlamları göreceğiz.",
  concept:
    "Deyimler, genellikle gerçek anlamından uzaklaşmış, birden çok sözcüğün kalıplaşmasıyla oluşan ve özel bir durumu, bir duyguyu anlatan kalıplardır. Göz gezdirmek, kulak kabartmak birer deyimdir ve genellikle mastar ekiyle biter; öğüt vermez, durumu betimler. Atasözleri ise atalarımızın uzun deneyim ve gözlemlerine dayanan, topluma yol gösteren, ders ve öğüt veren genel yargılardır ve tamamlanmış birer cümledir. Damlaya damlaya göl olur bir atasözüdür; küçük birikimlerin önemini öğütler. Şurası aklında kalsın tamam mı: Deyim bir anlık durumu resmeder ve öğüt taşımaz; atasözü ise herkes için geçerli genel bir hayat dersi ve öğüt fısıldar.",
  example:
    "Birlikte tartalım. Ali dersi dikkatle dinlemek için kulak kesildi cümlesinde kulak kesilmek bir deyimdir; kulağı fiziksel olarak kesilmez, sadece pür dikkat dinlemek durumunu anlatır. Damlaya damlaya göl olur sözü ise bir atasözüdür; sabırla tasarruf etmeyi öğütleyen tam bir cümledir. Ayağını yorganına göre uzat bir atasözüdür; harcamalarını bütçene göre ayarla öğüdü verir. Etekleri zil çalmak ise çok sevinmek durumunu anlatan neşeli bir deyimdir. Deyim durum bildirir, atasözü yol gösterir.",
  hint: "gold",
  warning:
    "Deyimleri gerçek anlamlarıyla yorumlamaktan ve atasözlerinin kalıbını bozmaktan uzak durmalısın. Damlaya damlaya göl olur yerine damlaya damlaya havuz olur diyemeyiz; çünkü atasözlerinin ve deyimlerin sözcükleri değiştirilemez, eş anlamlıları dahi konulamaz. Bir sözün öğüt verip vermediğine bakarak deyim mi atasözü mü olduğuna kolayca karar verebilirsin.",
  life:
    "Çok sevindiğinde eteklerim zil çaldı dersen hissettiğin coşkuyu tek bir sözle anlatırsın. Bir arkadaşın sabırsızlandığında acele işe şeytan karışır diyerek ona sakinliği öğütlersin. Deyim ve atasözlerini yerinde kullanmak seni dinleyenlerin zihninde harika resimler oluşturur.",
  recap: [
    "Deyimler kalıplaşmıştır, durum bildirir ve öğüt içermez.",
    "Atasözleri geçmiş deneyimlerden doğan, öğüt veren tam cümlelerdir.",
    "Deyim ve atasözlerindeki kelimeler değiştirilemez, kalıp bozulamaz.",
  ],
  conceptSeal: "Deyim durum adıdır. Atasözü öğüt ve yargıdır.",
  voiceSeal: "Bir sözün deyim mi atasözü mü olduğunu ve gerçek anlamını değil, kalıp anlamını söylersin.",
  outcomes: [
    "Deyim, gerçek anlamından uzak kalıplaşmış sözdür.",
    "Atasözü, öğüt veren genel yargıdır.",
    "Deyim gerçek anlamıyla anlaşılmaz.",
  ],
  scene: "word-tree",
  parentNote:
    "Çocuğunuz bu derste deyimlerin anlık durumu resmettiğini, atasözlerinin ise öğüt veren yargılar olduğunu kavrar. Evde günlük hayatta kullanılan deyimlerin mecaz anlamlarını birlikte keşfedebilirsiniz.",

};

export const JUNIOR_TURKCE_13 = juniorLessonFromScenario(JUNIOR_TURKCE_13_SCENARIO);
