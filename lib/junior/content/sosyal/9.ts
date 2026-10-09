import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 9. hafta. Mutlak konum ve göreceli konum. */
export const JUNIOR_SOSYAL_9_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-9",
  title: "Mutlak konum ve göreceli konum",
  teaser:
    "Mutlak konum, enlem ve boylam ile kurulan sabit adrestir. Göreceli konum, bir yeri başka bir yere göre anlatır. Kavramsal Anlayış, paralel ile meridyeni ayırır. İfade Gücü, sabit adresi yol tarifinden ayrı söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün haritada ve tarihte nasıl bir yolculuk var, çünkü yeryüzünde kaybolmadan adres bulmanın muazzam sırrını öğreneceğiz. Hiç bir arkadaşına evini tarif ederken marketin iki sokak yukarısında ya da parkın karşısında dediğin oldu mu? Bu pratik tarif günlük hayatta çok işe yarar; ancak evinin dünya üzerindeki değişmez coğrafi adresi bambaşkadır. Bugün seninle mutlak konum ile göreceli konum arasındaki farkı öğreneceğiz. Biri yeryüzündeki sabit matematiksel adrestir; diğeri ise etrafındaki yerlere göre yapılan tariftir.",
  concept:
    "Mutlak konum, bir yerin yeryüzündeki matematiksel adresidir ve asla değişmez; paralel ve meridyen çizgileriyle belirlenir. Ekvator'a paralel olarak doğu ve batı yönünde uzanan hayali çizgilere paralel denir ve bunlar enlemi gösterir. Başlangıç Meridyeni'nden geçerek kutuptan kutba uzanan hayali çizgilere ise meridyen denir ve bunlar boylamı belirler. Güzel ülkemiz Türkiye, 36 ile 42 derece kuzey paralelleri ve 26 ile 45 derece doğu meridyenleri arasında yer alır. Göreceli konum ise bir yerin denizlere, boğazlara, komşulara ve yeryüzü şekillerine göre olan konumudur. Şurası aklında kalsın tamam mı: İki sokak kuzeyde ya da denizin kıyısında demek göreceli konumdur; dereceyle belirtilen paralel ve meridyenler ise mutlak konumun kendisidir.",
  example:
    "Evinin yerini düşünelim. Haritayı açıp enlem ve boylam derecelerini söylersen bu mutlak konumdur; Dünya üzerindeki o nokta asla kaybolmaz. Komşuna okulun iki sokak ilerisinde, kütüphanenin hemen arkasında dersen bu göreceli konumdur. Yeni bir bina yapıldığında ya da bir dükkân taşındığında göreceli tarif değişebilir; ancak evin paralel ve meridyen adresi hep aynı kalır. Paraleller Dünya'yı yatay olarak çemberlerle sararken, meridyenler dikey yaylar şeklinde uzanır. Çizgiler hayalidir; ancak belirttikleri uzaklık ve konumlar gerçektir. İki konumu da bilmek dünyayı anlamanın anahtarıdır.",
  hint: "trap",
  warning:
    "Yakında, deniz kıyısında ya da dağın eteğinde gibi ifadeleri mutlak konum sanmak yanıltıcı bir tuzaktır; bunlar çevreye göre yapılan göreceli konumlardır. Paralel ile meridyen kavramlarını da birbirine karıştırmamaya özen göster. Paralellerin enlemi, meridyenlerin ise boylamı belirlediğini ve Türkiye'nin 36 ile 42 derece kuzey paralelleri arasında olduğunu güvenle aklında tutabilirsin.",
  life:
    "Bunu bir doğum günü kutlamasına arkadaşını davet ederken de kullanırsın. Davetiyeye parkın yanındaki bina diye yazarsın; bu göreceli bir tariftir. Akıllı telefondan konum attığında ise uydu sistemi tam olarak enlem ve boylam derecelerini yani mutlak konumu bulur. İki yöntem de hedefe ulaştırır; biri pratik yol gösterir, diğeri ise Dünya üzerindeki kesin adresi işaret eder.",
  recap: [
    "Mutlak konum, enlem ve boylam ile kurulan sabit adrestir.",
    "Paralel enlemi, meridyen boylamı gösterir. Türkiye 36 ile 42 derece kuzey paralellerindedir.",
    "Göreceli konum bir yeri başka yere göre anlatır. Yakın sözü enlem değildir.",
  ],
  conceptSeal: "Mutlak konum sabittir. Göreceli konum bir yere göredir.",
  voiceSeal: "Bir tarifte sabit adres ile yol tarifini ayrı cümlelerle söylersin.",
  outcomes: [
    "Mutlak konum enlem ve boylam ile belirtilir.",
    "Paralel enlem çizgisi, meridyen boylam çizgisidir.",
    "Göreceli konum başka bir yere göre anlatılır.",
  ],
  scene: "grid",
  parentNote:
    "Çocuğunuz mutlak konumu enlem ve boylam, göreceli konumu bir yere göre tarif olarak ayırır. Türkiye'nin yaklaşık enlem ve boylam aralığını söyler.",

};

export const JUNIOR_SOSYAL_9 = juniorLessonFromScenario(JUNIOR_SOSYAL_9_SCENARIO);
