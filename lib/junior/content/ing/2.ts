import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 1 Life. He, she, it ile simple present. */
export const JUNIOR_ING_MAIN_2_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-2",
  title: "He, she ve it ile simple present",
  teaser:
    "Simple present, alışkanlığı anlatır. I ile fiil yalındır. He, she ve it ile fiile s gelir. Kavramsal Anlayış, özneye göre fiili seçer. İfade Gücü, kendi gününü ve bir başkasının gününü ayrı cümleyle kurmandır.",
  welcome:
    "Hoş geldin! Hazırsan bugün İngilizcenin ve eğlenceli kelimelerin dünyasına adım atıyoruz, çünkü kendi gününü anlatmanın ötesine geçip sevdiklerinin neler yaptığını keşfedeceğiz. Kendi sabahını anlatırken 'I wake up' diyorsun; peki ya kardeşin, annen veya en yakın arkadaşın ne yapıyor? İşte İngilizcede 'he', 'she' ve 'it' öznelerini gördüğümüzde fiiller tatlı bir değişime uğrar. Buna geniş zaman, yani 'simple present' deriz. Bu zaman kalıbı tek bir anı değil, her zaman severek yapılan alışkanlıkları anlatır.",
  concept:
    "'I', 'you', 'we' ve 'they' özneleriyle konuşurken fiilimiz yalın ve sade kalır; tıpkı 'I play football' dediğimiz gibi. Ancak iş üçüncü tekil şahıslara, yani 'he', 'she' ve 'it' öznelerine geldiğinde fiilin sonuna sevimli bir '-s' veya '-es' takısı eklenir. Örneğin 'He plays football', 'She walks to school' ya da 'It rains in spring' deriz. Günlük hayatta sıkça kullandığımız bazı fiiller ise tatlı birer özel değişim gösterir: 'go' fiili 'goes', 'have' fiili 'has', 'watch' fiili 'watches', 'study' fiili ise 'studies' haline gelir. Şurası aklında kalsın tamam mı: Cümleye başlarken önce özneye bak; özne 'he', 'she' ya da 'it' ise fiiline hemen o sihirli '-s' ekini hediye et.",
  example:
    "Kendi gününü anlatırken fiillerin hep sade ve rahat kalır: 'I wake up at seven o'clock. I brush my teeth. I have breakfast. I go to school.' Şimdi kardeşini anlatmaya başlayalım: 'He wakes up at eight o'clock. He brushes his teeth. He has breakfast. He goes to school.' Akşamları annen için 'She watches TV in the evening' diyebilirsin. Olumsuz bir cümle kurmak istediğinde 'he' ve 'she' için 'does not', yani kısaca 'doesn't' yardımımıza koşar: 'He doesn't play tennis.' Birine soru sormak istediğinde ise 'Does she walk to school?' diye sorarsın; cevabı da 'Yes, she does' ya da 'No, she doesn't' olur.",
  hint: "trap",
  warning:
    "Öznemiz 'he', 'she' veya 'it' olduğunda fiilin sonundaki '-s' ekini unutmamaya özen göster; 'He wakes up' ve 'She goes to school' kalıpları kulağa her zaman müzik gibi gelir. Kendinden bahsederken 'I play' demek yeterlidir, 'I' öznesine fazladan '-s' eklenmez. Olumsuz cümlelerde ise 'doesn't' geldiğinde fiilin eski sade haline döndüğünü hatırla: 'He doesn't play tennis' diyerek harika ve kusursuz bir İngilizce cümlesi kurabilirsin.",
  life:
    "Sabah hazırlandığında kendi yaptığın işi 'I brush my teeth' diye söyle. Yan odadaki kardeşini anlatırken 'He brushes his teeth' diyerek aradaki o güzel farkı hisset. Akşam olunca 'He does his homework' veya 'She reads a book' diyerek evdeki herkesin gününü İngilizceye dökebilirsin. Pencereden yağmuru izlerken de 'It rains in autumn' diyerek doğanın alışkanlıklarını güvenle dile getir.",
  recap: [
    "Simple present alışkanlığı anlatır. I ile fiil yalındır.",
    "He, she ve it ile fiile s gelir. Go goes, have has olur.",
    "He wakes up doğru kalıptır; olumsuzda doesn't gelince fiil sadeleşir.",
  ],
  conceptSeal: "Alışkanlık cümlesinde fiil özneye göre seçilir.",
  voiceSeal: "Kendi gününü ve bir başkasının gününü ayrı cümlelerle söylersin.",
  outcomes: [
    "I ile fiil yalın gelir.",
    "He, she ve it ile fiile s gelir.",
    "Go, have ve do bu özneyle goes, has ve does olur.",
  ],
  scene: "clock",
  parentNote:
    "Çocuğunuz I ile yalın fiil, he she it ile s eki kullanır. Go goes, have has, do does olur. Evde bir aile üyesinin gününü bu kalıpla anlattırabilirsiniz.",

};

export const JUNIOR_ING_MAIN_2 = juniorLessonFromScenario(JUNIOR_ING_MAIN_2_SCENARIO);
