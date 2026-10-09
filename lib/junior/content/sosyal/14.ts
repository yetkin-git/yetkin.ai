import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 14. hafta. Vergi ve vatandaşlık sorumluluğu. */
export const JUNIOR_SOSYAL_14_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-14",
  title: "Vergilerimiz ve vatandaşlık sorumluluğu",
  teaser:
    "Vergi, devletin okul, yol, hastane ve güvenlik gibi ortak işler için halktan aldığı paydır. Ceza değildir. Kavramsal Anlayış, vergiyi ortak gidere bağlar. İfade Gücü, bir hizmetin hangi ortak kasadan çıktığını söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün haritada ve tarihte nasıl bir yolculuk var, çünkü hep birlikte kurduğumuz ortak geleceğin en güçlü bağını konuşacağız. Hiç okulunun önündeki asfalt yolu, mahalle parkındaki ışıkları ya da hastanedeki doktorların kullandığı aletleri kimin karşıladığını düşündün mü? Bu kamu hizmetleri tek bir ailenin bütçesiyle yapılamaz; ortak bir kasada toplanan güçle hayat bulur. Bugün seninle verginin ne olduğunu, neden bir ceza olmadığını ve aktif bir vatandaş olarak topluma nasıl değer kattığını keşfedeceğiz.",
  concept:
    "Vergi; devletin okul açmak, yol yapmak, hastane işletmek, yangınları söndürmek ve vatanın güvenliğini sağlamak gibi ortak kamu hizmetlerini yürütebilmesi için vatandaşlardan topladığı yasal paydır. Her çalışan vatandaş bu payı vererek ülkesinin kalkınmasına doğrudan katılır; buna vatandaşlık sorumluluğu denir. Şurası aklında kalsın tamam mı: Vergi kesinlikle bir ceza değildir; kurallara uyulmadığında kesilen para cezaları başkadır; vergi ise hepimizin ortak kullandığı okulun, hastanenin ve yolun yapımına kattığımız bir paydır.",
  example:
    "Sabah evden çıkıp okula doğru yürürsün. Yürüdüğün kaldırım ve karşıdan karşıya geçtiğin yaya geçidi birer kamu hizmetidir. Sınıfındaki tahta, sıran ve lambanın elektriği bu ortak güçle sağlanır. Sağlık ocağında doktor muayene ettiğinde sağlık hizmeti işler. İtfaiye bir yangına koştuğunda güvenlik ve yardım hizmeti görevdedir. Bunların masrafları tek bir kişinin cebinden çıkmaz; toplanan vergilerle karşılanır. Markette yaptığın alışverişin fişine baktığında en altta küçük bir vergi satırı görürsün; o satır, aldığın ürünle birlikte devletin ortak kasasına katkıda bulunduğunu gösterir. Fiş istemek, verginin devlete ulaşmasını sağlayan çok önemli ve duyarlı bir vatandaşlık görevidir. Vergi vermek topluma katılmaktır.",
  hint: "gold",
  warning:
    "Vergiyi bir ceza ya da kayıp gibi görmek çok büyük bir yanılgıdır. Ceza yalnızca bir kural bozulduğunda uygulanır; vergi ise hiçbir kural bozulmasa da milletçe ortaklaşa faydalandığımız hizmetleri ayakta tutmak için ödenir. Okulların, köprülerin ve hastanelerin kendi kendine yapıldığını düşünmek de eksik bir bilgidir. Ödenen her kuruş verginin yarın bize daha güzel yollar, daha modern okullar ve güçlü bir vatan olarak geri döndüğünü güvenle aklında tutabilirsin.",
  life:
    "Bunu sınıfında arkadaşlarınla ortak bir gezi planlarken de görebilirsin. Müzeye gitmek için herkes küçük bir harçlık payı koyar ve o ortak bütçeyle otobüs kiralanır. Tek bir öğrenci bütün otobüsün masrafını üstlenemez; ama el birliğiyle herkes o otobüse biner. Vergi de güzel yurdumuzun büyük bütçesidir. Alışverişten sonra fişini almak, o ortak bütçeyi korumanın en pratik yoludur; böylece sen de ülkenin kalkınmasına aktif bir vatandaş olarak değer katarsın.",
  recap: [
    "Vergi, kamu hizmeti için toplanan ortak paydır.",
    "Okul, yol, hastane ve güvenlik bu hizmetlerdendir.",
    "Vergi ceza değildir. Vatandaşın sorumluluğudur.",
  ],
  conceptSeal: "Vergi ortak giderdir. Vatandaşlık sorumluluğu bu paya katılmaktır.",
  voiceSeal: "Bir kamu hizmetini ve onun ortak kasadan çıktığını tek cümlede söylersin.",
  outcomes: [
    "Vergi, kamu hizmeti için alınan paydır.",
    "Okul, yol ve hastane bu hizmetler arasındadır.",
    "Vergi bir ceza değil, vatandaşlık sorumluluğudur.",
  ],
  scene: "assembly",
  parentNote:
    "Çocuğunuz vergiyi ceza değil, okul, yol ve hastane gibi ortak işlerin payı olarak anlatır. Fişteki satırı bu payın küçük bir hatırlatıcısı sayar.",

};

export const JUNIOR_SOSYAL_14 = juniorLessonFromScenario(JUNIOR_SOSYAL_14_SCENARIO);
