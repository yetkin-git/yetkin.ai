import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 13. hafta. Doğal kaynaklar ve sürdürülebilirlik. */
export const JUNIOR_SOSYAL_13_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-13",
  title: "Doğal kaynaklarımız ve sürdürülebilirlik",
  teaser:
    "Yenilenemez kaynak tükenir. Kömür, petrol ve doğal gaz bu taraftadır. Güneş, rüzgar ve akarsu dikkatli kullanılırsa yenilenir. Kavramsal Anlayış, iki kaynağı ayırır. İfade Gücü, bir kullanımın tasarruf mu israf mı olduğunu söylemektir.",
  welcome:
    "Selamlar! Bugün seninle toplumsal hayatımızın ve coğrafyamızın çok değerli bir sırrını keşfedeceğiz, çünkü yarınlarımızı koruyan en büyük sorumluluğu öğreneceğiz. Hiç dişini fırçalarken musluğun açık kaldığını ve temiz suyun boşa akıp gittiğini fark ettiğin oldu mu? Dünyamızdaki kaynaklar sonsuz gibi görünebilir; oysa bugün israf edilen her damla su, yarın bir çocuğun susuz kalması demektir. Bugün seninle tükenebilen ve yenilenebilen doğal kaynakları, tasarrufu ve sürdürülebilir bir geleceği nasıl kurabileceğimizi öğreneceğiz.",
  concept:
    "Doğal kaynak, doğada kendiliğinden var olan, insanın yaşamını sürdürmesine ve üretmesine yarayan her türlü zenginliktir. Kömür, petrol ve doğal gaz gibi fosil yakıtlar yenilenemez kaynaklardır; bunlar yerin altında milyonlarca yılda oluşur ve kullanıldıkça hızla tükenir. Güneş, rüzgâr ve akarsular ise yenilenebilir temiz kaynaklardır; doğa onları sürekli yeniler. Ormanlarımız ve topraklarımız ise özenle korunursa kendini yenileyebilir; tahrip edilirse yok olur. Şurası aklında kalsın tamam mı: Sürdürülebilirlik, bugünün ihtiyaçlarını karşılarken gelecek nesillerin hakkını da korumak ve kaynakları israf etmeden bilinçle kullanmaktır.",
  example:
    "Gündüz güneş alan aydınlık bir odayı hayal et. Güneş ışığı varken lambayı açık bırakmak enerjiyi boşa harcamaktır; oysa tülü aralayıp güneş ışığından yararlanmak akıllıca bir tasarruftur. Otomobiller fosil yakıt olan benzin tüketir; benzin yandıkça biter ve havayı kirletir. Bisiklete binmek ya da toplu taşımayı tercih etmek ise yakıt tüketimini azaltır. Bir defterin sayfalarını yırtıp atmak yerine arka yüzünü de kullanırsın; bu geri dönüşüm bilincidir. Cam şişeler, kâğıtlar ve metaller geri dönüşüm kutusuna atıldığında fabrikalarda yeniden işlenir ve doğadan yeni ağaç kesilmesini önler. Ormanda kesilen bir ağacın yerine fidan dikilirse yeşil vatan korunur. Kaynakları kullanmak başka, onları hoyratça tüketmek bambaşka bir şeydir.",
  hint: "trap",
  warning:
    "Suyu, elektriği ya da doğal gazı hiç bitmeyecek sonsuz bir kaynak sanmak en büyük yanılgıdır. Musluk boşa aktığında barajlardaki tatlı su rezervleri azalır. Yenilenebilir kaynaklara sahip olmak da onları düşünmeden ve savurganca harcayabileceğimiz anlamına gelmez. Tasarrufun bir kısıntı değil, dünyamızı ve geleceğimizi sevgiyle koruyan bilinçli bir yaşam biçimi olduğunu güvenle aklında tutabilirsin.",
  life:
    "Bunu bu akşam kendi evinde hemen uygulamaya başlayabilirsin. Dişini fırçalarken musluğu kapatmak, odadan çıkarken lambayı söndürmek ve atıkları geri dönüşüm kutusuna ayırmak senin en güzel vatandaşlık görevlerindir. Bu küçük adımlar bir araya geldiğinde vatanımızın kaynaklarını korur ve tertemiz bir doğayı yarınlara miras bırakır. Aktif bir vatandaş olmak işte bu duyarlı davranışlarla başlar.",
  recap: [
    "Kömür, petrol ve doğal gaz yenilenemez. Kullanıldıkça azalır.",
    "Güneş, rüzgar ve bakılan orman yenilenebilir taraftadır.",
    "Sürdürülebilirlik, bugün kullanırken yarını düşünmektir. Tasarruf bunun yoludur.",
  ],
  conceptSeal: "Yenilenemez kaynak tükenir. Sürdürülebilirlik yarını da hesaba katar.",
  voiceSeal: "Bir kaynağın yenilenip yenilenmediğini ve bir hareketin tasarruf olup olmadığını söylersin.",
  outcomes: [
    "Kömür, petrol ve doğal gaz yenilenemez kaynaklardır.",
    "Güneş, rüzgar ve akarsu yenilenebilir kaynaklardır.",
    "Tasarruf ve geri dönüşüm sürdürülebilirliğin yoludur.",
  ],
  scene: "globe",
  parentNote:
    "Çocuğunuz yenilenemez kaynak ile yenilenebilir kaynağı ayırır. Musluğu kapatmak ve geri dönüşüm, sürdürülebilirliğin evdeki karşılığıdır.",

};

export const JUNIOR_SOSYAL_13 = juniorLessonFromScenario(JUNIOR_SOSYAL_13_SCENARIO);
