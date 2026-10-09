import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 9 Saving the Planet. Should ve shouldn't. */
export const JUNIOR_ING_MAIN_18_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-18",
  title: "Should ve shouldn't",
  teaser:
    "Should, yapılmasını önerir. Shouldn't, yapılmamasını önerir. İkisi de yalın fiilin önünde durur. Kavramsal Anlayış, öğüdü emir sanmaz. İfade Gücü, çevre için bir öneri cümlesi kurmandır.",
  welcome:
    "Selamlar! Bugün seninle kendimizi İngilizce ifade etmenin çok keyifli yollarını keşfedeceğiz, üstelik bu kez sevdiklerimize ve çevremize en nazik, en yapıcı tavsiyelerde bulunmanın yolunu bulacağız! Bir arkadaşına açık kalan bir musluğu kapatmasını veya çöpleri yere atmamasını hatırlatmak istediğinde emir vermek ya da kızmak yerine yumuşacık bir tavsiyede bulunmak çok daha etkilidir. İşte İngilizcede 'bunu yapmalısın' derken 'should', 'bunu yapmamalısın' derken ise 'shouldn't' sözcüklerini kullanırız. Bugün seninle hem doğayı korumak hem de sağlıklı yaşamak için harika öneri cümleleri kurmayı keşfedeceğiz.",
  concept:
    "'Should' ve 'shouldn't', bir kişiye tatlı bir dille öğüt ve tavsiye vermek için kullanılır; kesinlikle kırıcı veya sert bir emir değildir. Yapılması iyi ve faydalı olan şeyler için 'should' deriz: 'You should turn off the tap' musluğu kapatmalısın, 'We should recycle paper' kâğıtları geri dönüştürmeliyiz, 'You should eat healthy food' sağlıklı yiyecekler yemelisin demektir. Yapılması zararlı veya yanlış olan şeyler için ise 'should not', yani kısaca 'shouldn't' deriz: 'You shouldn't waste water' suyu boşa harcamamalısın, 'We shouldn't drop litter' yerlere çöp atmamalıyız anlamına gelir. Birine tavsiye sormak istediğimizde 'Should I recycle this plastic bottle?' diye sorarız; o da 'Yes, you should' diyerek bizi yönlendirir. Şurası aklında kalsın tamam mı: 'Should' ve 'shouldn't' kelimelerinden sonra gelen fiil hiçbir ek almaz; daima yalın, sade ve rahat kalır.",
  example:
    "Sınıfımız ve çevremiz için güzel tavsiyeler üretelim: 'We should plant more green trees around our school.' İsraftan kaçınmak için 'We shouldn't leave the computer on all night' dersin. Sağlığımız için 'You should drink plenty of water every day' çok değerli bir öğüttür. Hayvan dostlarımıza şefkat göstermek için 'We shouldn't harm street animals; we should protect them' deriz. Arkadaşın sana bir pil gösterip 'What should I do with this old battery?' diye sorduğunda 'You should put it in the waste battery box' cevabını verirsin. Fiilin önüne ne 'to' gelir ne de '-ing'; fiil hep 'recycle', 'save', 'protect' gibi yalın kalır!",
  hint: "trap",
  warning:
    "'Should' ve 'shouldn't' kalıplarından sonra fiili sade bırakmayı hatırla; yani 'You should to recycle' veya 'You should recycling' demek yerine doğrudan 'You should recycle' demek cümleni çok daha güçlü ve akıcı kılar. Tavsiyenin bir emir olmadığını, sevgiyle ve ortak akılla paylaşılan iyi bir yol olduğunu bilmek de anlatımına nezaket ve samimiyet katar.",
  life:
    "Evde kardeşinin musluğu açık unuttuğunu görürsen nazikçe 'You should turn off the tap' diyerek uyar. Biri çöpü yere atacak olursa şefkatle 'We shouldn't throw rubbish on the ground' de. Akşam kendine de güzel bir hedef koy: 'I should read twenty pages of my book tonight.' Bir arkadaşın ne yapacağını bilemediğinde ona 'You should take a deep breath' diyerek destek ol.",
  recap: [
    "Should yapılması iyi olanı, shouldn't ise kaçınılması gerekeni önerir.",
    "Should ve shouldn't sözcüklerinden sonra fiil hiçbir ek almadan yalın kalır.",
    "Öneri yumuşak ve yapıcı bir dildir; emir gibi baskı taşımaz.",
  ],
  conceptSeal: "Should önerir. Shouldn't vazgeçirir. Fiil yalın kalır.",
  voiceSeal: "Çevre için bir should ve bir shouldn't cümlesi kurarsın.",
  outcomes: [
    "Should bir öneridir.",
    "Shouldn't vazgeçmeyi söyler.",
    "Should sözünden sonra yalın fiil gelir.",
  ],
  scene: "recycle",
  parentNote:
    "Çocuğunuz öneriyi should, vazgeçmeyi shouldn't ile kurar. Fiil yalın kalır. You should to recycle yanlıştır. Evde bir musluk cümlesi kurdurabilirsiniz.",

};

export const JUNIOR_ING_MAIN_18 = juniorLessonFromScenario(JUNIOR_ING_MAIN_18_SCENARIO);
