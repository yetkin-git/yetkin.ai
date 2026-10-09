import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 7 Holidays. Geçmiş olaylar. */
export const JUNIOR_ING_MAIN_13_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-13",
  title: "Visited, swam ve played",
  teaser:
    "Geçmişte olan iş, fiilin ikinci haliyle söylenir. Visit visited, play played, swim swam olur. Kavramsal Anlayış, düzenli ek ile özel fiili ayırır. İfade Gücü, geçen yaz yaptığın bir işi İngilizce anlatmandır.",
  welcome:
    "Selamlar! Bugün seninle kendimizi İngilizce ifade etmenin çok keyifli yollarını keşfedeceğiz, üstelik bu kez unutulmaz bir yaz tatilinin anılarına dalıyoruz! Geçen yaz masmavi denizde yüzdün, büyük aileni ve akrabalarını ziyaret ettin, sokakta arkadaşlarınla doyasıya top oynadın. Tüm bu harika olaylar yaşandı ve tatlı birer anı olarak tamamlandı. İşte bugün seninle geçmişte tamamlanan bu eylemleri İngilizce geçmiş zamanla, yani 'past simple' ile anlatmayı öğreneceğiz. Düzenli fiillere eklenen '-ed' takısını ve tamamen değişen özel fiilleri tek tek keşfedeceğiz.",
  concept:
    "Geçmişte gerçekleşen olayları anlatırken İngilizcede fiillerin ikinci hallerini kullanırız. Düzenli fiillerin sonuna kolayca '-ed' takısı gelir: 'visit' fiili 'visited' olur ve 'I visited my grandma' anneannemi ziyaret ettim demektir; 'play' fiili 'played' olur ve 'I played football' futbol oynadım demektir. Ancak bazı fiiller kurallara sığmaz ve tamamen değişir; bunlara özel fiiller deriz. Örneğin yüzmek anlamına gelen 'swim' fiili geçmişte 'swam' olur ve 'I swam in the sea' denizde yüzdüm demektir. Gitmek anlamına gelen 'go' fiili 'went', görmek anlamına gelen 'see' fiili ise 'saw' halini alır. Şurası aklında kalsın tamam mı: Soru sorarken ve olumsuz cümle kurarken 'did' yardımımıza koşar; 'did' geldiğinde fiilimiz yorulmaz ve hemen sade, yalın haline geri döner.",
  example:
    "Geçen yaz tatilini canlı cümlelerle anlatalım: 'Last summer, I visited my grandparents in their village.' Ardından deniz maceranı ekle: 'I swam in the cool water every afternoon.' Akşamları ise 'I played fun games with my cousins' dersin. Başka bir şehre seyahat ettiysen 'I went to Antalya' cümlesini kurarsın. Yapmadığın bir şeyi söylerken 'did not', yani kısaca 'didn't' kullanırız: 'I didn't watch TV because I was outside.' Bir arkadaşına tatilini sormak istediğinde ise 'Did you play football?' dersin; cevap 'Yes, I did' ya da 'No, I didn't' olur. Soruda fiil 'played' değil, yalın halde 'play' olarak kalır!",
  hint: "gold",
  warning:
    "Kimi fiillerin kendilerine has özel geçmiş halleri olduğunu hatırla; örneğin 'swimmed' yerine 'swam', 'goed' yerine 'went' demek konuşmanı kusursuz kılar. Ayrıca soru sorarken ve 'didn't' ile olumsuz cümle kurarken fiilin sonuna tekrar '-ed' eklememeye özen göster: 'Did you visit your aunt?' ve 'I didn't swim' demek tam bir şampiyon cümlesidir!",
  life:
    "Akşam ailene geçen yazdan bir anı anlat: 'I visited my cousins, and we played basketball.' Fotoğraf albümüne bakarken denizi gösterip 'I swam in the sea last summer' de. Sınıfta arkadaşına dönüp 'Did you swim during the summer holiday?' diye sorarak onun tatil anısını da dinle. Bir yere gitmediğini söylerken de 'I didn't go abroad, I stayed in my city' diyerek rahatça konuş.",
  recap: [
    "Düzenli fiiller geçmişte ed takısı alır; visited ve played böyledir.",
    "Kimi fiiller özel değişir; swim swam, go went olur.",
    "Soru ve olumsuz cümlelerde did ile birlikte fiil ilk yalın haline döner.",
  ],
  conceptSeal: "Düzenli fiil ed alır. Özel fiil kendi geçmiş halini alır.",
  voiceSeal: "Geçen yaz yaptığın üç işi İngilizce söylersin.",
  outcomes: [
    "Visited ve played düzenli geçmiş fiillerdir.",
    "Swam, swim fiilinin geçmiş halidir.",
    "Soru ve olumsuzda fiil yalın kalır.",
  ],
  scene: "holiday",
  parentNote:
    "Çocuğunuz geçen yazı visited, swam ve played ile anlatır. Swimmed ve goed yanlıştır. Did you swim sorusunda fiil yalın kalır.",

};

export const JUNIOR_ING_MAIN_13 = juniorLessonFromScenario(JUNIOR_ING_MAIN_13_SCENARIO);
