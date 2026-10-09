import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 2. hafta. Toplumsal uyum ve yardımlaşma. */
export const JUNIOR_SOSYAL_2_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-2",
  title: "Toplumsal uyum ve yardımlaşma",
  teaser:
    "Toplumsal uyum, farklı insanların birlikte yaşayabilmesidir. Yardımlaşma bu uyumu güçlendirir. Kavramsal Anlayış, uyumu aynılık sanmaktan ayırır. İfade Gücü, bir örnekte kimin nasıl yardım ettiğini söylemektir.",
  welcome:
    "Hoş geldin! Hazırsan bugün tarihin, kültürün ve yeryüzünün heyecan dolu dünyasına adım atıyoruz, çünkü birlikte yaşamanın en güzel sırrını keşfedeceğiz. Hiç okul koridorunda birinin kitapları yere dağıldığında, yanındakilerin hemen eğilip yardıma koştuğunu gördün mü? Oradaki herkesin aynı olması gerekmiyordu; fakat el ele verilince zorluk anında çözüldü. Bugün seninle toplumsal uyum, yardımlaşma ve dayanışmanın bir topluma nasıl güç kattığını göreceğiz. Uyum, herkesin aynı olması demek değildir; farklılıklarla birlikte barış içinde yaşayabilmektir.",
  concept:
    "Toplumsal uyum, farklı özelliklere sahip insanların aynı vatan toprağında huzur ve güven içinde birlikte yaşamasıdır. İlgi alanların, alışkanlıkların ya da memleketin başkasından farklı olabilir. Bu tatlı farklılıklar toplumsal uyumu bozmaz, aksine zenginleştirir. Yardımlaşma, zor bir işi el birliğiyle tamamlamaktır. Dayanışma ise sevinçte ve kederde bir arada durabilmektir. Şurası aklında kalsın tamam mı: Uyum, farklılıkları silmek değildir; birbirimizi tanıyıp saygı duyarak el uzatabilmektir.",
  example:
    "Okul koridorunda bir arkadaşın kitaplarını düşürür. Sen eğilirsin, yanındaki arkadaşın da eğilir. Kitaplar bir anda toplanır. İşte bu yardımlaşmadır. Kitapların farklı derslere ait olması el uzatmaya engel oluşturmaz. Teneffüste birinin tek başına oturduğunu fark edersin. Yanına gidip onu neşeyle oyuna davet edersin. İşte bu da dayanışmadır. Aynı oyunu ilk kez oynuyor olabilirsiniz; çağrın, toplumsal uyumun en güzel meyvesidir. Akşam evde kardeşinin bir konuyu anlamadığını görünce ona yardım edersin. Küçük bir destek, koca bir sevgi köprüsü kurar.",
  hint: "gold",
  warning:
    "Toplumsal uyumu herkesin tek bir kalıba girmesi sanmak yaygın bir yanılgıdır. Farklı fikirlere sahip olmak ya da farklı oyunları sevmek uyumu bozmaz. Asıl eksiklik, kimsenin kimseye el uzatmadığı anlarda başlar. Yardımlaşmayı yalnızca çok büyük işlerde arama; yere düşen bir kalemi alıp arkadaşına tebessümle uzatmak da çok değerli bir yardımdır.",
  life:
    "Bunu akşam evde ailene destek olurken de yaşarsın. Akşam yemeği için sofrayı hep birlikte kurarsınız. Biri tabakları taşır, biri bardakları dizer. İş paylaşılınca yorgunluk azalır ve sofraya keyifle oturulur. Mahallede yaşlı bir komşunun poşetini kapıya kadar taşımak da aynı güzelliktir. Yalnızca aynı binada oturmak yetmez; birbirimize el uzattığımızda gerçek bir komşuluk ve toplumsal uyum başlar.",
  recap: [
    "Toplumsal uyum, farklı insanların birlikte yaşayabilmesidir.",
    "Yardımlaşma ve dayanışma toplumsal birliği güçlendirir.",
    "Uyum, herkesin aynı olması değildir; farklılıklar varken de el ele verilir.",
  ],
  conceptSeal: "Uyum birlikte yaşamaktır. Yardımlaşma o yaşamı tamamlar.",
  voiceSeal: "Bir sahnede kimin kime nasıl yardım ettiğini tek cümleyle söylersin.",
  outcomes: [
    "Toplumsal uyum, farklı insanların birlikte yaşayabilmesidir.",
    "Yardımlaşma, bir işi birlikte tamamlamaktır.",
    "Uyum, herkesin aynı olması demek değildir.",
  ],
  scene: "culture",
  parentNote:
    "Çocuğunuz toplumsal uyumu aynılık değil, birlikte yaşayabilmek olarak anlatır. Düşen bir kalemi uzatmak da yardımlaşma örneğidir.",

};

export const JUNIOR_SOSYAL_2 = juniorLessonFromScenario(JUNIOR_SOSYAL_2_SCENARIO);
