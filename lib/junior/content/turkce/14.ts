import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. İsim kökü ve fiil kökü. */
export const JUNIOR_TURKCE_14_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-14",
  title: "İsim ve fiil kökü",
  teaser:
    "Kök, sözcüğün anlamını taşıyan ve daha küçük anlamlı parçaya ayrılmayan bölümdür. İsim kökü bir adı, fiil kökü bir işi taşır. Kavramsal Anlayış, iki kökü ayırır. İfade Gücü, bir sözcükte kökü göstermektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün kelimelerin arasında nasıl bir yolculuk var, çünkü kelimelerin en saf, en temel kalbine doğru keyifli bir yolculuğa çıkıyoruz. Hiç gözlük sözcüğünü hecelerken kelimenin çekirdeğinde görmemizi sağlayan göz organının durduğunu fark ettin mi? Bir kelimenin tüm ekleri çıkarıldığında geriye kalan anlamlı en küçük parçasına kök denir. Bugün seninle isim kökleri ile fiil köklerini birbirinden ayıran sihirli mak-mek anahtarını öğreneceğiz.",
  concept:
    "Kök, bir sözcüğün bölünemeyen, anlamlı ve o sözcüğün bütünüyle anlam ilişkisi bulunan en küçük parçasıdır. Kökler iki ana gruba ayrılır. İsim kökü; varlıkların, kavramların ve duyguların adıdır; sonuna mak ya da mek eki alamaz. Örneğin ev, taş, göz ve yol isim köküdür; evmek ya da taşmak diyemeyiz. Fiil yani eylem kökü ise bir işi, oluşu veya hareketi anlatır; sonuna mak ya da mek mastar ekini rahatça alabilir. Örneğin gel, yaz, koş, sev fiil köküdür; gelmek, yazmak, sevmek diyebiliriz. Şurası aklında kalsın tamam mı: Bir sözcüğün kökünü ararken bulduğun en küçük parçanın kelimenin tamamıyla mutlaka bir anlam bağı olmalıdır; balık sözcüğünün kökü bal olamaz, çünkü bal ile balık arasında hiçbir akrabalık yoktur.",
  example:
    "Gel birlikte sözcükleri köklerine ayıralım. Çiçeklik sözcüğünü inceleyelim. Lik ekini çıkardığımızda geriye çiçek kalır. Çiçekmek diyemediğimiz için bu bir isim köküdür. Şimdi yazıcı sözcüğüne bakalım. Icı ekini kaldırdığımızda geriye yaz kalır. Yazmak diyebildiğimiz ve bir eylem bildirdiği için bu bir fiil köküdür. Taşlık sözcüğünün kökü taş ismidir. Koşucu sözcüğünün kökü koş fiilidir. Anlam bağı ve mastar eki bize yolu gösterir.",
  hint: "trap",
  warning:
    "Kelimede ses benzerliği var diye kelimenin tamamıyla anlam bağı olmayan parçaları kök sanma tuzağına düşmemelisin. Kelebek sözcüğünün kökü kele olamaz; kelebek sözcüğü kök halindedir. Ayrıca kökü belirlerken sonuna getirdiğimiz mak ya da mek eki zihnimizde denediğimiz bir testtir; o ek kökün içinde yer almaz, kök sadece saf köktür.",
  life:
    "Kalem kutundan bir silgi çıkardığında kökünün silmek eylemi olduğunu hemen anlarsın. Suluk eline geldiğinde kökün içtiğimiz su ismi olduğunu fark edersin. Kelimelerin köklerini bilmek, Türkçenin bir yapboz gibi nasıl ustalıkla birleştiğini görmeni sağlar.",
  recap: [
    "Kök, sözcüğün anlam ilişkisi taşıyan en küçük parçasıdır.",
    "İsim kökleri mak-mek eki almaz; varlık ve kavram adıdır.",
    "Fiil kökleri mak-mek eki alabilir; iş, oluş ve hareket bildirir.",
  ],
  conceptSeal: "İsim kökü addır. Fiil kökü iştir. Mastar eki köke katılmaz.",
  voiceSeal: "Bir sözcükte isim kökünü veya fiil kökünü ayırıp söylersin.",
  outcomes: [
    "Kök, daha küçük anlamlı parçaya ayrılmaz.",
    "İsim kökü ad, fiil kökü iş bildirir.",
    "Mastar eki kök değildir.",
  ],
  scene: "affix",
  parentNote:
    "Çocuğunuz bu derste bir sözcüğün isim kökü mü fiil kökü mü olduğunu -mak/-mek mastar eki testiyle ve anlam bağı gözeterek bulmayı öğrenir.",

};

export const JUNIOR_TURKCE_14 = juniorLessonFromScenario(JUNIOR_TURKCE_14_SCENARIO);
