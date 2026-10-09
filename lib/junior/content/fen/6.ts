import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Kan grupları ve kan bağışı. */
export const JUNIOR_FEN_6_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-6",
  title: "Kan grupları ve kan bağışı",
  teaser:
    "Kan grupları A, B, AB ve 0'dır. Rh artı ve eksi de uyumu etkiler. Kavramsal Anlayış, verici ile alıcıyı ayırır. İfade Gücü, kan bağışının neden kontrolle yapıldığını söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç kimlik kartında ya da bir sağlık raporunda A pozitif veya sıfır negatif gibi ifadeler gördün mü? Bu harf ve işaretler, kan grubumuzu belirten çok değerli birer biyolojik kimliktir. Bugün seninle kan gruplarının neden birbirinin yerine rastgele geçemeyeceğini ve kan bağışının hayat kurtaran o sıcacık önemini birlikte öğreneceğiz.",
  concept:
    "İnsanlarda A, B, AB ve sıfır olmak üzere dört ana kan grubu bulunur. Buna ek olarak kanda Rh proteini varsa Rh pozitif, yani artı; yoksa Rh negatif, yani eksi denir. Tıpta acil durumlar dışında her bireye kendi grubundan ve kendi Rh değerinden kan verilmesi esastır. Alyuvar naklinde sıfır negatif en genel verici, AB pozitif ise en genel alıcı olarak adlandırılır. Şurası aklında kalsın tamam mı: Kan grubu nakli ve eşleştirmesi tamamen uzman doktorların ve hastane laboratuvarlarının kontrolünde yapılır.",
  example:
    "Dört farklı şişe hayal et. Üzerlerinde A, B, AB ve sıfır yazsın. Sıfır grubundaki alyuvarlar özel durumlarda diğer üç gruba da uyar. AB grubu ise hem A hem B hem de sıfır grubundan alyuvar alabilir. Ancak harflerin yanındaki artı ve eksi işaretleri de çok önemlidir. Eksi kan, artı kişiye belirli koşullarda verilebilir; fakat artı kan, eksi kişiye asla rastgele verilemez. Bunu doktorlar ve hastane laboratuvarları titiz testlerle eşleştirir. Kan bağışını sağlıklı bir yetişkin, kontrolden geçtikten sonra gönüllü olarak yapar. Sen şu an bağışçı olmazsın; bu hayat kurtaran bilgiyi güvenle öğrenirsin.",
  hint: "gold",
  warning:
    "Sıfır grubunu genel verici diye öğrenirken Rh faktörünü gözden kaçırmamak gerekir. Kan naklinde grup uyumu kadar artı ve eksi değeri de hayati önem taşır. Bu hassas dengeyi hekimler ve modern laboratuvar testleri eksiksiz yönetir.",
  life:
    "Bunu aile büyüklerinin kan gruplarını öğrenip bir deftere not ederek hemen uygulayabilirsin. Kendi kan grubunu da bilip evin acil sağlık panosuna yazabilirsiniz. Bu bilgi acil bir durumda sağlık görevlilerine çok kıymetli bir zaman kazandırır. İleride sağlıklı bir yetişkin olduğunda, Kızılay'a yapacağın bir ünite kan bağışıyla tanımadığın bir insanın hayatına umut olabileceğini şimdiden bilmek harika bir duygudur.",
  recap: [
    "Kan grupları A, B, AB ve sıfırdır. Rh faktörü artı ya da eksi olur.",
    "Sıfır negatif en genel verici, AB pozitif en genel alıcı sayılır.",
    "Kan bağışı sağlık kontrolüyle, gönüllü yapılan hayat kurtarıcı bir dayanışmadır.",
  ],
  conceptSeal: "Kan grubu, alyuvarın kime güvenle verileceğini belirler.",
  voiceSeal: "Dört grubu, Rh farkını ve bağışın neden kontrol istediğini söylersin.",
  outcomes: [
    "Kan grupları A, B, AB ve 0'dır.",
    "Rh faktörü kan uyumunu etkiler.",
    "Kan bağışı sağlık kontrolünden sonra gönüllü yapılır.",
  ],
  scene: "blood",
  parentNote:
    "Çocuğunuz A, B, AB ve 0 gruplarını ve Rh farkını söyler. 0 eksinin genel verici, AB artının genel alıcı sayıldığını bilir. Bağışın yetişkinlikte ve kontrolle yapıldığı evde de net kalsın.",

};

export const JUNIOR_FEN_6 = juniorLessonFromScenario(JUNIOR_FEN_6_SCENARIO);
