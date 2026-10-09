import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 10 Democracy. Okul seçimi ve oy. */
export const JUNIOR_ING_MAIN_19_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-19",
  title: "Okul seçimi ve voting",
  teaser:
    "Vote oy vermektir. Class president sınıf başkanıdır. Her kişinin bir oyu vardır. Kavramsal Anlayış, adayı oy kutusuyla bağlar. İfade Gücü, kime oy verdiğini kibar bir cümlede söylemandır.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün İngilizcede önümüzde nasıl bir yolculuk var, çünkü sınıfımızın ve okulumuzun en heyecanlı gününe, yani sınıf başkanlığı seçimine katılıyoruz! Tahtada aday olan arkadaşlarının isimleri yazılı; her biri sınıfa daha çok neşe, temizlik ve dayanışma getirmek için güzel sözler veriyor. Ardından herkes küçük bir kâğıda kendi tercihini yazıp oy sandığına bırakıyor. İşte bugün seninle demokrasinin ve seçimlerin temel kavramlarını İngilizce öğreniyoruz. 'Vote', 'candidate', 'election' ve 'ballot box' gibi kelimelerle kendi fikrimizi özgürce ifade etmenin değerini keşfedeceğiz.",
  concept:
    "Seçim ve demokrasiyle ilgili kelimeler İngilizcede çok berrak bir şekilde kullanılır. Seçim anlamına gelen sözcüğümüz 'election'dır. Seçime katılıp sınıfı temsil etmek isteyen arkadaşımıza 'candidate', yani aday deriz. Oy vermek anlamına gelen eylem 'vote'tur: 'We vote for the class president' sınıf başkanı için oy veririz demektir. Kendi seçimimizi söylerken 'I vote for Ege' veya 'I vote for Zeynep' deriz; yani kime oy veriyorsak ismin önüne 'for' edatını getiririz. Adaylar seçmenlerine güzel vaatlerde bulunur: 'The candidate makes a speech and promises.' Oyların atıldığı kutuya ise 'ballot box', yani oy sandığı deriz. Demokrasinin altın ilkesi şudur: 'One person, one vote', yani her kişinin eşit olarak sadece bir oy hakkı vardır. Şurası aklında kalsın tamam mı: Oy kullanmak özgür bir tercihtir; saygı ve gizlilik içinde sandığa atılır.",
  example:
    "Seçim gününü sınıfta adım adım yaşayalım: 'Today is the class president election.' Adaylar tahtaya çıkar ve konuşma yapar: 'The candidates make great speeches.' Biri 'I want a cleaner class' der, diğeri 'I want more fun activities' der. Sıra oy vermeye geldiğinde kâğıdını eline alırsın: 'I write the name on the paper, fold it, and put it in the ballot box.' Bir arkadaşın sana nazikçe 'Who do you vote for?' diye sorarsa 'I vote for the candidate with kind promises' diyebilirsin. Oylar sayıldığında ise alkışlar yükselir: 'We have a new class president, congratulations!' dersin.",
  hint: "gold",
  warning:
    "Kime oy verdiğini söylerken 'for' edatını kullanmayı hatırla; örneğin 'I vote Ege' demek yerine 'I vote for Ege' demek cümleni tam ve kusursuz yapar. Seçimden önce yarışan kişiye 'candidate' yani aday, seçim tamamlandıktan sonra göreve gelene ise 'president' yani başkan dendiğini bilmek de kavramları yerli yerine oturtur.",
  life:
    "Okulunda veya sınıfında başkanlık seçimi olduğunda adayların konuşmalarını dikkatle dinle. Sandığın başına gittiğinde 'I put my paper into the ballot box' de. Bir arkadaşına kime oy verdiğini sormak istersen 'Who do you vote for?' kalıbını kullan. Seçim bittiğinde kazanan arkadaşını tebrik ederek 'Congratulations to our new class president!' demeyi unutma.",
  recap: [
    "Vote oy vermek, candidate aday, election ise seçim demektir.",
    "Kime oy verildiğini belirtirken I vote for kalıbı kullanılır.",
    "Demokrasinin temeli One person, one vote ilkesidir; her ses değerlidir.",
  ],
  conceptSeal: "Seçim, adayların sözü ve her kişinin bir oyudur.",
  voiceSeal: "Kime oy verdiğini I vote for ile söylersin.",
  outcomes: [
    "Vote oy vermektir.",
    "Class president sınıf başkanıdır.",
    "Her kişinin bir oyu vardır.",
  ],
  scene: "ballot",
  parentNote:
    "Çocuğunuz sınıf seçimini vote, candidate ve class president ile anlatır. I vote for kalıbında for düşmez. Her kişinin bir oyu vardır.",

};

export const JUNIOR_ING_MAIN_19 = juniorLessonFromScenario(JUNIOR_ING_MAIN_19_SCENARIO);
