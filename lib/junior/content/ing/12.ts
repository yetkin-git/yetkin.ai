import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 6 Occupations. Was, were ve geçmiş tarih. */
export const JUNIOR_ING_MAIN_12_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-12",
  title: "Was ve were ile geçmiş tarih",
  teaser:
    "Was, I he she it için geçmişteydi demektir. Were, you we they için geçmişteydiler demektir. Tarih yesterday, on Monday ve in 2015 ile söylenir. Kavramsal Anlayış, tekili çoğuldan ayırır. İfade Gücü, dünkü yeri bir cümlede kurmandır.",
  welcome:
    "Hoş geldin! Hazırsan bugün İngilizcenin ve eğlenceli kelimelerin dünyasına adım atıyoruz, çünkü zaman tünelinde geriye doğru büyüleyici bir yolculuğa çıkıyoruz! Dün okuldaydın, geçen hafta sonu belki parkta arkadaşlarınla koşup oynuyordun, birkaç yıl önce ise çok daha küçük bir çocuktun. İşte geçmişte bir yerde bulunduğumuzu veya o zamanki durumumuzu anlatırken 'am', 'is', 'are' yerine geçmiş zamanın güvenilir yardımcıları olan 'was' ve 'were' sözcüklerini kullanırız. Bugün seninle tekil ve çoğul öznelerle geçmiş zaman cümleleri kuracak, 'yesterday' ve 'in 2015' gibi zaman ifadeleriyle anılarımızı tazeleyeceğiz.",
  concept:
    "Geçmiş zamanda bir yerde olduğumuzu söylerken tekil öznelerimiz olan 'I', 'he', 'she' ve 'it' ile birlikte 'was' yardımcı fiilini kullanırız: 'I was at school yesterday' dün okuldaydım, 'She was at home' o evdeydi, 'It was cold last night' dün gece hava soğuktu anlamına gelir. Çoğul öznelerimiz olan 'we' ve 'they' ile karşındaki kişiye seslendiğin 'you' öznesiyle ise 'were' yardımcı fiilini seçeriz: 'You were very happy' sen çok mutluydun, 'We were in the park' biz parktaydık, 'They were at the hospital' onlar hastanedeydiler demektir. Zamanı belirtirken dün için 'yesterday', geçen hafta için 'last week', belirli bir gün için 'on Monday', yıllar için ise 'in 2015' deriz. Şurası aklında kalsın tamam mı: 'Was' tekil özneler içindir; 'were' ise 'you', 'we' ve 'they' özneleriyle kullanılır.",
  example:
    "Dünkü anılarımızı birlikte canlandıralım: 'I was at school yesterday morning.' Ailenle birlikte pazar yerindeysen 'We were at the market on Sunday' dersin. Arkadaşlarının kütüphanede olduğunu söylerken 'They were at the library' cümlesini kurarsın. Birine soru sormak istediğinde 'Was she at home?' diye sorarsın; cevabı da 'Yes, she was' ya da 'No, she wasn't' olur. Çoğul sorularda ise 'Were you at the park yesterday?' dersin; cevap 'Yes, we were' olur. Doğduğun yılı söylerken 'I was born in 2014' diyerek 'in' edatını kullanırsın. Olumsuz cümlelerde ise 'was not' yerine kısaca 'wasn't', 'were not' yerine ise 'weren't' kalıbı imdadımıza yetişir.",
  hint: "trap",
  warning:
    "Geçmiş zamanı kurarken özneye uygun yardımcı fiili seçmeye dikkat edebilirsin. Örneğin 'They was' demek yerine 'They were', 'I were' demek yerine 'I was' demek cümleni tam ve kusursuz kılar. Ayrıca günlerden önce 'on', yıllardan önce ise 'in' kullanmayı hatırla; yani 'on Monday' ve 'in 2015' kalıpları kulağa her zaman pürüzsüz ve ritmik gelir.",
  life:
    "Akşam sofrasında dünkü gününü ailene anlatırken 'I was at school yesterday' diyerek başla. Eski bir fotoğraf albümünü karıştırırken küçük bebeklik haline bakıp 'I was so small in 2015!' diyerek neşeyle gülümse. Bir arkadaşın dün derse gelmediyse ona 'Where were you yesterday?' diye sorarak hatırını öğren. Dün hava çok rüzgârlıysa 'It was windy yesterday' diyerek geçmiş havayı da hatırla.",
  recap: [
    "Was; I, he, she ve it özneleriyle geçmişteki durumu anlatır.",
    "Were; you, we ve they özneleriyle geçmişte bulunmayı ifade eder.",
    "Günlerden önce on, yıllardan önce in edatı kullanılır; on Monday, in 2015 böyledir.",
  ],
  conceptSeal: "Was tekildir. Were çoğul ve you içindir. Tarih cümleyi geçmişe bağlar.",
  voiceSeal: "Dünkü yerini was ya da were ile söylersin.",
  outcomes: [
    "Was, I he she it ile kullanılır.",
    "Were, you we they ile kullanılır.",
    "Yesterday, on Monday ve in 2015 geçmiş zamandır.",
  ],
  scene: "holiday",
  parentNote:
    "Çocuğunuz geçmişte olmak için was ve were kullanır. They were doğrudur, they was değildir. Dün neredeydin diye Where were you yesterday sorabilirsiniz.",

};

export const JUNIOR_ING_MAIN_12 = juniorLessonFromScenario(JUNIOR_ING_MAIN_12_SCENARIO);
