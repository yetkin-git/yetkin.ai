import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 3. hafta. Önyargıları kırmak. */
export const JUNIOR_SOSYAL_3_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-3",
  title: "Önyargıları kırıyoruz",
  teaser:
    "Önyargı, bir kişiyi tanımadan hakkında karar vermektir. Ayrımcılık, bu kararla birini dışlamaktır. Kavramsal Anlayış, tanımadan kurulan hükmü ayırır. İfade Gücü, önyargının yerine soru sormayı koymaktır.",
  welcome:
    "Selamlar! Bugün seninle toplumsal hayatımızın ve coğrafyamızın çok değerli bir sırrını keşfedeceğiz, çünkü kalbimizi ve zihnimizi güzelleştiren büyük bir adıma hazırlanıyoruz. Hiç bir insanı henüz onunla konuşmadan, yalnızca dış görünüşüne bakarak hemen tanıdığını düşündüğün oldu mu? O an aklımıza gelen ilk düşünce aceleci bir tahmin olabilir. Bugün seninle önyargının ne olduğunu, ayrımcılıktan nasıl ayrıldığını ve empati kurarak bu duvarları nasıl yıkabileceğimizi öğreneceğiz. Tanımadan verilen peşin kararlar, bir insanın gerçek değerini asla yansıtmaz.",
  concept:
    "Önyargı, bir insanı yeterince tanımadan, kulaktan dolma tek bir söze ya da tek bir görüntüye bakarak peşin hüküm vermektir. Bu peşin kararlar çoğu zaman gerçeği yansıtmaz ve insanları yanıltır. Ayrımcılık ise bu yanlış peşin hükümle bir insanı dışlamak, oyun grubuna almamak ya da hakkını kısıtlamaktır. Empati ise kendini onun yerine koyarak olaylara onun gözünden bakabilmektir. Şurası aklında kalsın tamam mı: Önyargı doğru bilgi sanılabilir; oysa o, henüz sorulmamış ve araştırılmamış aceleci bir hükümdür.",
  example:
    "Sınıfına yeni bir arkadaşının geldiğini hayal et. Gözlükleri biraz büyük olduğu için biri onun çok çekingen ve sıkıcı olduğunu düşünebilir. İşte bu bir önyargıdır; çünkü henüz onunla tek bir kelime bile konuşulmamıştır. Teneffüste çekinmeden yanına gidip adını ve nelerden hoşlandığını sorarsın. O da sana güler yüzle neşeli bir hikâye anlatır ve keyifle sohbet edersiniz. Aradaki o soğuk duvar bir anda erir. Başka bir gün farklı yöreden gelen bir arkadaşın yöresel bir yemek getirir; kokusu sana ilk başta alışılmadık gelebilir. Hemen o yemeğe kötü demek de aceleci bir karardır. Herkesin kültürüne saygı duymak, insanları zenginlikleriyle kucaklamaktır.",
  hint: "trap",
  warning:
    "Bir insanın dış görünüşünden, konuşma tarzından ya da geldiği şehirden yola çıkarak onun hakkında kesin hüküm vermek yanıltıcı bir tuzaktır. Tek bir örnek, koca bir grubun veya insanın kimliğini yansıtmaz. Önyargıyı yıkmak için tartışmak gerekmez; dinlemek, samimiyetle soru sormak ve peşin hükümleri bir kenara bırakmak yeterlidir. Bir insanı yakından tanıdıkça düşüncelerinin olumlu yönde değişmesi bir erdemdir.",
  life:
    "Bunu mahalle parkında oyun oynarken de kolayca uygulayabilirsin. Yeni bir çocuk salıncakların yanına geldiğinde, onu tanımadan dışarıda bırakmak yerine tebessümle yanına gidip adını sorabilirsin. Birlikte bir tur top oynadığınızda harika bir arkadaşlık başlar. Merak edip sorduğunda, anlamaya çalıştığında aradaki tüm ön yargılar yok olur ve sıcacık bir dostluk filizlenir.",
  recap: [
    "Önyargı, bir kişiyi tanımadan hakkında karar vermektir.",
    "Ayrımcılık, bu kararla birini dışlamaktır. Empati yer değiştirerek düşünmektir.",
    "Önyargı soruyla incelir. Tek görüntü bütün hayat değildir.",
  ],
  conceptSeal: "Önyargı tanımadan verilen karardır. Sormak o kararı askıya alır.",
  voiceSeal: "Bir hükümde neyi gördüğünü ve neyi henüz sormadığını ayrı söylersin.",
  outcomes: [
    "Önyargı, tanımadan kurulan hükümdür.",
    "Ayrımcılık, bu hükümle birini dışlamaktır.",
    "Sormak ve dinlemek önyargıyı inceltir.",
  ],
  scene: "culture",
  parentNote:
    "Çocuğunuz önyargıyı tanımadan karar vermek olarak anlatır. Yeni bir arkadaşın adını sormak, bu kararı ertelemenin günlük örneğidir.",

};

export const JUNIOR_SOSYAL_3 = juniorLessonFromScenario(JUNIOR_SOSYAL_3_SCENARIO);
