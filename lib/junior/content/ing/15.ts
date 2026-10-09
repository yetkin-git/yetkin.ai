import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 8 Bookworms. Kitap ve okuma. */
export const JUNIOR_ING_MAIN_15_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-15",
  title: "Kitap okumaktan söz etmek",
  teaser:
    "Okuma sevgisi I like reading ile söylenir. En sevilen kitap my favourite book adını alır. Kavramsal Anlayış, türü görüşten ayırır. İfade Gücü, okuduğun bir kitabı iki cümlede tanıtmandır.",
  welcome:
    "Merhaba! İngilizce dünyasına hoş geldin, bugün seninle kitap sayfalarının o huzur dolu kokusuna ve kütüphanelerin büyülü dinginliğine konuk oluyoruz! Masanın üzerinde macera dolu bir hikâye kitabı, renkli çizimleriyle bizi güldüren bir çizgi roman ve merakımızı besleyen bir bilim ansiklopedisi duruyor. Kitap okumak hayal gücümüzü uçsuz bucaksız diyarlara taşır. Bugün seninle kitap okuma alışkanlığımızı 'I like reading' kalıbıyla İngilizce ifade etmeyi, en sevdiğimiz kitabı 'My favourite book is' diyerek tanıtmayı ve kitaplar hakkındaki kişisel görüşlerimizi paylaşmayı öğreneceğiz.",
  concept:
    "Kitap okumayı sevdiğimizi söylerken 'like' fiilinden sonra gelen eyleme '-ing' ekleriz: 'I like reading' okumayı severim demektir. Okuduğumuz kitap türlerini de rahatça söyleyebiliriz: 'I read story books' hikâye kitapları okurum, 'I read comics' çizgi romanlar okurum, 'I read science books' bilim kitapları okurum anlamına gelir. En sevdiğimiz kitabı belirtirken 'My favourite book is' kalıbını kullanırız. Kitap hakkındaki düşüncemizi söylerken ise sıfatlar devreye girer: 'The book is interesting' kitap ilginçtir, 'It is exciting' heyecan vericidir, 'The characters are brave' karakterler cesurdur demektir. Kütüphaneden kitap ödünç alırken 'I borrow books from the library' deriz. Şurası aklında kalsın tamam mı: Kitabın türü bir isimdir; 'interesting' veya 'exciting' ise senin o kitaba dair kıymetli kişisel görüşündür.",
  example:
    "Kitaplığımızın önünde neşeli cümleler kuralım: 'I like reading every evening before going to bed.' En sevdiğin türü belirt: 'I prefer comics because they are colourful and funny.' Arkadaşın sana 'What is your favourite book?' diye sorduğunda gözlerin parlayarak 'My favourite book is an adventure story about brave explorers' diyebilirsin. Kitabın başkahramanını anlatırken 'The main character is very clever and kind' dersin. Kütüphane alışkanlığını da ekle: 'I go to the library every Friday, and I borrow two interesting books.' Kitap seni çok sardıysa 'This book is exciting, I can't put it down!' diyerek heyecanını paylaşırsın.",
  hint: "gold",
  warning:
    "Bir eylemi sevdiğini söylerken 'like' sözcüğünden sonra fiile '-ing' getirmeyi hatırla; örneğin 'I like read' demek yerine 'I like reading' demek konuşmanı pırıl pırıl yapar. Ayrıca bir kitaptan bahsederken sadece adını söyleyip bırakma; yanına 'interesting', 'exciting' veya 'fantastic' gibi sıfatlar ekleyerek cümleni zenginleştir.",
  life:
    "Bu akşam yatağına geçmeden önce komodinin üstündeki kitabı eline al ve 'I read every evening' de. Okulda arkadaşınla kitap değiştirirken ona 'What is your favourite book?' diye sor. Çizgi roman okurken 'I prefer comics because they are funny' cümlesini kur. Okul kütüphanesine gittiğinde ise raflara bakıp 'I want to borrow an interesting book today' diyerek İngilizceyi hayatına kat.",
  recap: [
    "I like reading okuma sevgisini ve alışkanlığını söyler.",
    "My favourite book en sevilen kitaptır; interesting ve exciting birer görüştür.",
    "Like sözcüğünden sonra gelen fiil ing takısı alır; like reading böyledir.",
  ],
  conceptSeal: "Kitabın türü ile senin görüşün ayrı söylenir.",
  voiceSeal: "Okuduğun bir kitabı tür ve görüş olarak iki cümlede söylersin.",
  outcomes: [
    "I like reading okuma sevgisini söyler.",
    "Favourite book en sevilen kitaptır.",
    "Interesting ve funny kitap hakkındaki görüştür.",
  ],
  scene: "shelf",
  parentNote:
    "Çocuğunuz okuma sevgisini I like reading ile, en sevdiği kitabı my favourite book ile söyler. Like sözünden sonra reading gelir. Akşam bir kitap adı sordurabilirsiniz.",

};

export const JUNIOR_ING_MAIN_15 = juniorLessonFromScenario(JUNIOR_ING_MAIN_15_SCENARIO);
