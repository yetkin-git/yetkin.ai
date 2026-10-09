import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 1 Life. Günlük rutin ve saati söylemek. */
export const JUNIOR_ING_MAIN_1_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-1",
  title: "Daily routines ve saati söylemek",
  teaser:
    "Daily routine, her gün tekrar eden iştir. Tam saat o'clock, yarım half past, çeyrek quarter past ve quarter to ile söylenir. Kavramsal Anlayış, işi saate bağlar. İfade Gücü, kendi gününü saatle birlikte İngilizce kurmandır.",
  welcome:
    "Merhaba güzel arkadaşım, hiç sabah uyandığında günün nasıl bir sırayla başladığını fark ettin mi? Önce uyanırsın, yüzünü yıkar, dişlerini fırçalarsın; ardından güzel bir kahvaltı yapıp okulun yolunu tutarsın. İşte her gün sevgiyle ve düzenle tekrarladığın bu güzel akışa İngilizcede 'daily routine', yani günlük rutin diyoruz. Üstelik gün içindeki her güzel işin bir de saati vardır. Birine saati sormak istediğinde 'What time is it?' dersin; o da sana 'It is seven o'clock' gibi berrak ve neşeli bir cevap verir.",
  concept:
    "'Daily routine', her gün düzenli olarak tekrar ettiğin işleri anlatır. Örneğin 'I wake up at seven o'clock' dediğinde, saat tam yedide uyandığını söylersin. 'I brush my teeth' dişlerini fırçaladığını, 'I have breakfast' neşeyle kahvaltı ettiğini, 'I go to school' ise okula gittiğini ifade eder. Tam saatleri belirtirken sonuna 'o'clock' ekleriz; 'It is seven o'clock', saat tam yedidir demektir. Buçuklu saatlerde 'half past' kullanırız; 'It is half past seven', saat yedi buçuktur anlamına gelir. Çeyrek geçe için 'quarter past', çeyrek kala için ise 'quarter to' kalıbını seçeriz. Şurası aklında kalsın tamam mı: Günlük yaptığın işi söylerken, saatin hemen önüne sevimli 'at' sözcüğünü koymayı her zaman hatırla.",
  example:
    "Kendi sabahını neşeli cümlelerle kuralım. 'I wake up at seven o'clock' diyerek güne başlarsın. Ardından 'I brush my teeth at quarter past seven' dersin, yani yediyi çeyrek geçe dişlerini fırçalarsın. 'I have breakfast at half past seven' ile yedi buçukta kahvaltını yaparsın. Saat sekiz olduğunda 'I go to school at eight o'clock' diyerek yola çıkarsın. Akşam vakti geldiğinde 'I do my homework at five o'clock' ile ödevlerini tamamlarsın; gece olunca da 'I go to bed at quarter to ten' diyerek ona çeyrek kala yatağına geçersin. Saati merak ettiğinde 'What time is it?' diye sorarsın; cevap da her zaman 'It is' ile başlar.",
  hint: "gold",
  warning:
    "Tam saatleri söylerken sonuna 'o'clock' eklemeyi hatırla. Örneğin saat tam yedi için 'It is seven o'clock' demek cümleni ışıl ışıl parlatır. Yarım saatlerde 'half past', çeyrek geçelerde 'quarter past', çeyrek kalalarda ise 'quarter to' kalıbını güvenle kullanabilirsin. Günlük bir eylemi saate bağlarken de saatin hemen önüne 'at' sözcüğünü koyduğun an cümlen tam bir usta cümlesi olur: 'I wake up at seven o'clock!'",
  life:
    "Yarın sabah aynanın karşısına geçtiğinde gülümseyerek 'I brush my teeth' diye içinden tekrarla. Kahvaltı sofrasına oturduğunda duvardaki saate bakıp 'I have breakfast at half past seven' cümlesini kur. Evden çıkarken 'I go to school at eight o'clock' diyerek adımlarını at. Akşam saatlerinde 'I do my homework' ve gece 'I go to bed' ile gününü sevgiyle tamamla. Bir arkadaşınla buluştuğunda da ona 'What time is it?' diye sorarak İngilizce pratiğini canlı tut.",
  recap: [
    "Daily routine, her gün düzenli yapılan iştir. İşi at ile saate bağlarsın.",
    "Tam saat o'clock, yarım half past, çeyrek geçe quarter past, çeyrek kala quarter to ile söylenir.",
    "What time is it sorusuna It is seven o'clock gibi berrak cümlelerle cevap verirsin.",
  ],
  conceptSeal: "Günlük rutin, her gün tekrar eden iştir. Her iş bir saate bağlanır.",
  voiceSeal: "Kendi gününü saatle birlikte İngilizce söylersin.",
  outcomes: [
    "Daily routine, her gün tekrar eden iştir.",
    "Tam, yarım ve çeyrek saat ayrı kalıplarla söylenir.",
    "What time is it sorusuna It is ile cevap verilir.",
  ],
  scene: "clock",
  parentNote:
    "Çocuğunuz günlük işlerini at ile saate bağlar. Tam saat o'clock, yarım half past, çeyrek geçe quarter past, çeyrek kala quarter to kalıbındadır. Evde saati What time is it diye sordurabilirsiniz.",

};

export const JUNIOR_ING_MAIN_1 = juniorLessonFromScenario(JUNIOR_ING_MAIN_1_SCENARIO);
