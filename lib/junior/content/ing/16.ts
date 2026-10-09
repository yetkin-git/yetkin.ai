import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 8 Bookworms. Yer edatları. */
export const JUNIOR_ING_MAIN_16_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-16",
  title: "In, on, under, behind ve next to",
  teaser:
    "In içidir. On üstüdür. Under altındır. Behind arkadadır. Next to yanındadır. Kavramsal Anlayış, eşyanın yerini gözle seçer. İfade Gücü, raftaki bir kitabı doğru edatla söylemandır.",
  welcome:
    "Merhaba güzel arkadaşım, kendi çalışma odana veya sınıfa şöyle bir göz gezdir: Kitabın masanın üstünde, kalemin kutunun içinde, topun yatağın altında, sırt çantan ise belki kapının hemen arkasında duruyor! Bir eşyanın nerede olduğunu bilmek ve bunu başkasına tarif etmek günlük hayatın en doğal parçasıdır. Bugün seninle İngilizcede yer edatlarını, yani 'prepositions of place' konusunu öğreneceğiz. 'In', 'on', 'under', 'behind' ve 'next to' gibi sihirli sözcüklerle eşyaların yerini gözümüzle tespit edip 'Where is' sorusuna tam ve akıcı cevaplar vermeyi keşfedeceğiz.",
  concept:
    "İngilizcede bir nesnenin yerini tarif ederken konuma uygun yer edatını seçeriz. Bir nesne bir yüzeyin üstündeyse 'on' deriz: 'The book is on the shelf' kitap rafın üstündedir demektir. Bir nesne kapalı bir alanın içindeyse 'in' deriz: 'The pencil is in the bag' kalem çantanın içindedir anlamına gelir. Altında duran şeyler için 'under' kullanırız: 'The ball is under the desk' top sıranın altındadır. Arkada duran şeyler için 'behind' tercih edilir: 'The cat is behind the door' kedi kapının arkasındadır. Hemen bitişiğinde veya yanında olan varlıklar için ise 'next to' kalıbı kullanılır: 'The lamp is next to the bed' lamba yatağın yanındadır. Bir eşyanın yerini sormak istediğimizde 'Where is the book?' diye sorarız. Şurası aklında kalsın tamam mı: 'On' yüzey temasını, 'in' ise kutu veya oda gibi bir sınırın içinde olmayı anlatır; ikisini ayırt etmek odandaki her eşyayı kolayca bulmanı sağlar.",
  example:
    "Odamızdaki eşyaları adım adım bulalım: 'The storybook is on the study desk.' Küçük cetvelini arıyorsan 'The ruler is in the pencil case' dersin. Yere düşen çorap veya ayakkabılar için 'The shoes are under the bed' cümlesini kurarsın. Çantanın yerini söylerken 'The school bag is behind the armchair' diyebilirsin. Komodin ile yatağı bağlarken 'The nightstand is next to the bed' çok güzel bir tanımdır. Bir arkadaşın sana merakla 'Where is my notebook?' diye sorduğunda 'It is on the table, next to the laptop' diyerek iki edatı birleştirebilir ve ona yol gösterebilirsin.",
  hint: "trap",
  warning:
    "Kutunun veya dolabın içinde duran bir eşya için 'on' yerine 'in' kullanmaya özen gösterebilirsin; örneğin kapalı bir kutudaki oyuncak için 'The toy is in the box' demek tam ve doğru bir ifadedir. Ayrıca arkada duran için 'behind', altta duran için 'under' edatını seçmeyi ve bir şeyin yerini söylerken 'It is on the desk' gibi tam bir cümle kurmayı hatırla; çünkü tam cümleler İngilizceni ışıl ışıl parlatır.",
  life:
    "Sabah okul çantanı hazırlarken eşyalarını İngilizce yerleştir: 'My pencil case is in my bag.' Odandan çıkarken anahtarını arayan ailene 'The key is on the table' diyerek yardımcı ol. Sevimli kedin saklandığında 'The cat is under the chair' de. Kütüphanede aradığın kitabı bulduğunda ise 'It is on the top shelf, next to the dictionary' diyerek edatları hayatın içinde neşeyle kullan.",
  recap: [
    "In içinde, on üstünde, under altında demektir.",
    "Behind arkasında, next to ise hemen yanında anlamına gelir.",
    "Where is sorusuna It is on the shelf gibi tam ve açık cümlelerle cevap verilir.",
  ],
  conceptSeal: "Yer edatı, eşyanın gözle görülen konumunu söyler.",
  voiceSeal: "Raftaki bir kitabın yerini doğru edatla söylersin.",
  outcomes: [
    "In, on ve under üç ayrı yerdir.",
    "Behind arka, next to yan demektir.",
    "Where is sorusuna It is ve edat ile cevap verilir.",
  ],
  scene: "shelf",
  parentNote:
    "Çocuğunuz in, on, under, behind ve next to ile yer söyler. Kutunun içi in, üstü on dur. Odada Where is the book diye sorabilirsiniz.",

};

export const JUNIOR_ING_MAIN_16 = juniorLessonFromScenario(JUNIOR_ING_MAIN_16_SCENARIO);
