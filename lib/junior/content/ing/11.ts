import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 6 Occupations. Meslekler. */
export const JUNIOR_ING_MAIN_11_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-11",
  title: "Doctor, architect ve vet",
  teaser:
    "A doctor hastalara yardım eder. An architect bina tasarlar. A vet hayvanlara bakar. Kavramsal Anlayış, meslek adını yaptığı işle bağlar. İfade Gücü, bir kişinin işini What does she do ile anlatmandır.",
  welcome:
    "Merhaba güzel arkadaşım, mahallemizde veya şehrimizde her gün çevremize değer katan harika insanları hayal et: Beyaz önlüğüyle şifa dağıtan bir doktor, gökyüzüne uzanan sağlam ve güzel binalar çizen bir mimar ya da sevimli pati dostlarımızı iyileştiren bir veteriner! Her birinin yaptığı iş apayrı bir emek ve sevgi barındırır. Bugün seninle bu kıymetli meslekleri ve yaptıkları işleri İngilizce anlatmayı öğreneceğiz. Bir meslekten bahsederken önüne koyduğumuz 'a' ve 'an' sözcüklerini doğru seslerle buluşturacak, 'What does she do?' sorusuyla insanların mesleklerini merakla keşfedeceğiz.",
  concept:
    "İngilizcede tekil bir meslek ismini söylerken kelimenin okunuşuna göre önüne 'a' veya 'an' getiririz. Eğer meslek ismi ünsüz bir sesle başlıyorsa 'a' deriz: 'A doctor' bir doktor, 'a vet' bir veteriner, 'a teacher' ise bir öğretmendir. Ancak meslek ismi sesli bir harfle başlıyorsa telaffuzun pürüzsüz akması için 'an' sözcüğünü kullanırız: 'An architect' bir mimardır. Her mesleğin topluma sunduğu harika bir görev vardır: 'A doctor helps sick people' doktor hastalara yardım eder, 'An architect designs buildings' mimar binaları tasarlar, 'A vet looks after animals' veteriner sevimli hayvanların bakımını yapar demektir. Birinin ne iş yaptığını sormak için 'What does she do?' veya 'What does he do?' kalıbını kullanırız. Şurası aklında kalsın tamam mı: 'Architect' sesli başladığı için 'an' alır; 'doctor' ve 'vet' ünsüz harfle başladığı için 'a' ile söylenir.",
  example:
    "Çevremizdeki çalışanları cümlelerle tanıyalım: 'My aunt is a doctor, and she works at a big hospital.' Dayını anlatırken 'He is an architect; he designs modern houses' dersin. Mahallemizdeki kliniği gösterip 'She is a vet; she looks after sick puppies and cats' diyebilirsin. Diğer meslekleri de hatırlayalım: 'A teacher teaches students', 'A pilot flies planes', 'A chef cooks delicious meals.' Bir arkadaşın sana 'What does an architect do?' diye sorduğunda 'An architect designs safe and beautiful buildings' cevabını verirsin. Çoğul olarak meslek gruplarından bahsettiğimizde ise 'a' veya 'an' kullanmayız; 'They are architects' diyerek cümlemizi tamamlarız.",
  hint: "gold",
  warning:
    "Meslek isimlerinin önüne 'a' veya 'an' eklemeyi hatırla. Örneğin 'He is doctor' demek yerine 'He is a doctor' demek cümleni tam bir İngilizce kalıbına dönüştürür. Kelimenin ilk sesine dikkat ederek 'a architect' yerine 'an architect' demeyi tercih edebilirsin; çünkü sesli harften önce gelen 'an' sözcüğü konuşmana harika bir melodi ve ritim katar.",
  life:
    "Sağlık ocağına veya hastaneye gittiğinde doktoru görünce içinden gülümseyerek 'The doctor helps sick people' de. Parkta köpeğini gezdiren birini veya kliniği gördüğünde 'A vet looks after animals' cümlesini kur. Biri sana 'What do you want to be in the future?' diye sorduğunda heyecanla 'I want to be an architect!' veya 'I want to be a teacher!' diyerek hayallerini İngilizceyle seslendir.",
  recap: [
    "A doctor hastalara şifa verir; an architect binaları tasarlar; a vet hayvanlara bakar.",
    "Sesli harfle başlayan mesleklerin önüne an gelir; an architect böyledir.",
    "Meslek tekil söylendiğinde he is a doctor şeklinde a veya an unutulmaz.",
  ],
  conceptSeal: "Meslek adı ile yaptığı iş ayrı söylenir. A ve an ilk sese bakar.",
  voiceSeal: "Bir kişinin mesleğini ve işini İngilizce söylersin.",
  outcomes: [
    "Doctor, architect ve vet meslek adlarıdır.",
    "What does a doctor do işi sorar.",
    "Architect önüne an, doctor önüne a gelir.",
  ],
  scene: "badge",
  parentNote:
    "Çocuğunuz doktor, mimar ve veterineri a doctor, an architect ve a vet ile söyler. What does a doctor do sorusuna iş cümlesiyle cevap verir.",

};

export const JUNIOR_ING_MAIN_11 = juniorLessonFromScenario(JUNIOR_ING_MAIN_11_SCENARIO);
