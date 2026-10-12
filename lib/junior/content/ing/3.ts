import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, ENG.6.7 Kişisel yaşam, 37–38. hafta. Yiyecek, içecek, like ve dislike. */
export const JUNIOR_ING_MAIN_3_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-3",
  title: "Yiyecek, içecek ve likes, dislikes",
  teaser:
    "Kahvaltıda sevdiğini I like, sevmediğini I don't like ile söylersin. Soru Do you like diye kurulur. Kavramsal Anlayış, beğeniyi ve beğenmemeyi ayırır. İfade Gücü, tepsideki bir yiyeceği bu iki kalıpla anlatmandır.",
  welcome:
    "Merhaba sevgili çocuklar! Üstelik bunu en lezzetli köşeden, yani kahvaltı masasından başlatacağız! Masada sıcacık bir ekmek, lezzetli peynir, zeytin, bal ve taze süt duruyor. Kimi yiyecekleri çok severiz, bazılarından ise pek hoşlanmayız. İşte bugün sevdiğin lezzetleri 'I like', sevmediklerini ise 'I don't like' diyerek anlatmayı öğreneceğiz. Arkadaşına ne sevdiğini sormak için de 'Do you like' kalıbını kullanacağız.",
  concept:
    "'I like eggs' dediğinde, yumurtayı sevdiğini neşeyle söylersin. 'I like milk' sütü sevdiğini, 'I don't like tea' ise çayı pek tercih etmediğini anlatır. Bir arkadaşına 'Do you like cheese?' diye sorduğunda iki samimi cevap alırsın: 'Yes, I do' yani evet severim ya da 'No, I don't' yani hayır sevmem. İş üçüncü bir kişiyi anlatmaya geldiğinde 'like' sözcüğü 'likes' olur: 'He likes honey' veya 'She doesn't like coffee' deriz. Pratik kural: 'Like' beğeniyi ve sevgiyi, 'don't like' ise beğenmemeyi ifade eder; ikisini bilmek sofradaki tüm tercihleri rahatça anlatmanı sağlar.",
  example:
    "Kahvaltı tepsisine birlikte bakalım. 'I like olives. I like cheese. I don't like tomatoes.' Arkadaşın sana merakla sorsun: 'Do you like orange juice?' Sen de gülümseyerek 'Yes, I do!' de. Kahve için 'Do you like coffee?' diye sorduğunda ise 'No, I don't' diyebilirsin. Kardeşin balı çok seviyorsa 'He likes honey' dersin. Annenin çay sevgisini anlatırken 'She likes tea' kalıbını kurarsın. Kahvaltı sofrasının temel kelimelerini de hatırlayalım: 'Egg' yumurta, 'bread' ekmek, 'cheese' peynir, 'olive' zeytin, 'honey' bal, 'milk' süt ve 'orange juice' taze portakal suyudur.",
  hint: "gold",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Sevmediğin bir şeyi söylerken 'don't' kelimesinin fiilin hemen önüne geldiğini hatırla: 'I don't like tea' demek tam ve akıcı bir cümledir. 'Do you like milk?' sorusuna cevap verirken sadece 'Yes, I do' ya da 'No, I don't' demek yeterlidir; kısa ve tatlı bir cevap konuşmanı çok daha doğal kılar. Kardeşini veya arkadaşını anlatırken de 'He likes eggs' diyerek o küçük '-s' sesini eklemeyi sevgiyle hatırla. Yiyecek, içecek ve likes, dislikes konusunda kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Yarın sabah kahvaltı sofrasına oturduğunda tabağına neşeyle bak. Çok sevdiğin bir peynir dilimini alırken 'I like cheese' de. Pek sevmediğin bir zeytin olursa nazikçe 'I don't like olives' diyerek hissini paylaş. Okul kantininde bir arkadaşın sana 'Do you like ayran?' diye sorarsa gururla 'Yes, I do!' diyerek karşılık ver. Evde çay içen ailene bakıp 'She likes tea' diyerek öğrendiklerini günlük hayatın parçası yap.",
  recap: [
    "I like sevgiyi ve beğeniyi, I don't like ise beğenmemeyi söyler.",
    "Do you like sorusuna Yes, I do ya da No, I don't gelir.",
    "He ve she özneleriyle likes kullanılır; he likes honey doğru biçimdir.",
  ],
  conceptSeal: "Beğeni I like, beğenmeme I don't like ile kurulur.",
  voiceSeal: "Tepsiden bir yiyeceği severim ya da sevmem diye söylersin.",
  outcomes: [
    "I like ve I don't like beğeniyi ayırır.",
    "Do you like sorusuna Yes, I do ve No, I don't gelir.",
    "He ve she ile like, likes olur.",
  ],
  scene: "tray",
  parentNote:
    "Çocuğunuz kahvaltılıkları I like ve I don't like ile ayırır. Do you like sorusuna Yes, I do ve No, I don't der. Sofrada bir yiyeceği bu kalıpla sordurabilirsiniz.",

};

export const JUNIOR_ING_MAIN_3 = juniorLessonFromScenario(JUNIOR_ING_MAIN_3_SCENARIO);
