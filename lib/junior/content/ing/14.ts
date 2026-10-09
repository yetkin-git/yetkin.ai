import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 7 Holidays. Tatil etkinliği ve hava. */
export const JUNIOR_ING_MAIN_14_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-14",
  title: "Tatil etkinliği ve hava",
  teaser:
    "Tatilde yapılan iş ile o günün havası aynı anlatıda durur. It was sunny güneşliydi demektir. We had a picnic piknik yaptık demektir. Kavramsal Anlayış, etkinliği havaya bağlar. İfade Gücü, bir tatil gününü iki cümlede kurmandır.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün İngilizcede önümüzde nasıl bir yolculuk var, çünkü tatilde yaşadığımız maceraları o günün hava durumuyla buluşturarak harika hikâyeler anlatacağız! Sabah uyandığında gökyüzü pırıl pırıl güneşliyken ailenle yeşil çimlerde piknik yaptın; ancak öğleden sonra aniden başlayan yağmur yüzünden otele dönüp sıcacık bir film izlediniz. İşte tatilde ne yaptığımız ile havanın nasıl olduğu birbirini tamamlayan iki güzel parçadır. Bugün seninle geçmiş hava durumunu 'It was sunny' gibi ifadelerle anlatmayı, 'because' ve 'so' bağlaçlarıyla sebep-sonuç ilişkileri kurmayı öğreneceğiz.",
  concept:
    "Geçmişteki hava durumunu anlatırken 'It is' yerine 'It was' kalıbını kullanırız: 'It was sunny' hava güneşliydi, 'It was rainy' hava yağmurluydu, 'It was snowy' ise hava karlıydı demektir. Tatilde yaptığımız işleri de geçmiş zamanla söyleriz: 'We had a picnic' piknik yaptık, 'We walked by the lake' göl kenarında yürüdük demektir. Bu iki cümleyi birleştirmek için iki sihirli bağlacımız vardır: 'Because' çünkü anlamına gelir ve sebebi anlatır; 'so' ise bu yüzden anlamına gelir ve sonucu bildirir. Örneğin 'We swam because it was very hot' dediğimizde, çok sıcak olduğu için yüzdüğümüzü söyleriz. 'It was rainy, so we stayed at the hotel' dediğimizde ise yağmur yağdığını, bu yüzden otelde kaldığımızı anlatırız. Şurası aklında kalsın tamam mı: 'Because' sebep kapısını açar; 'so' ise sonuç kapısını aralar.",
  example:
    "Tatil günlerini birlikte canlandıralım: 'On Monday, it was sunny and warm. We had a lovely picnic in the forest.' Rüzgârlı bir günü anlatırken 'It was windy, so we flew our colourful kites' dersin. Karlı bir kış tatili için 'It was snowy, so we made a big snowman and skied down the hill' diyebilirsin. Yağmurlu günlerde ise 'We visited a museum because it was rainy outside' cümlesi çok yakışır. Burada dikkat edilecek güzel bir detay vardır: Sahip olmak anlamındaki 'have' fiili geçmişte 'had' olur; 'We had a picnic' diyerek piknik yaptığımızı söyleriz.",
  hint: "trap",
  warning:
    "Geçmiş bir tatil gününden bahsederken 'It is sunny yesterday' demek yerine 'It was sunny' demeyi hatırla; çünkü geçmişin havası daima 'was' ile söylenir. Ayrıca 'because' ile 'so' bağlaçlarını karıştırmamaya özen gösterebilirsin: 'Because' sebebin hemen önüne gelir, 'so' ise cümlenin sonucunu bağlar. 'Have a picnic' kalıbının geçmişte 'had a picnic' olduğunu bilmek de anlatımını kusursuz bir seviyeye taşır.",
  life:
    "Tatil fotoğraflarına bakarken bir kare seç ve iki cümle kur: 'It was sunny. We had a great time.' Yağmurlu bir tatil anını hatırlarsan 'It was rainy, so we stayed inside and played board games' de. Bir arkadaşına tatilini anlatırken 'We went hiking because the weather was pleasant' diyerek sebep ve sonucu İngilizceyle bağla.",
  recap: [
    "Geçmiş hava durumu It was sunny ve It was rainy ile söylenir.",
    "We had a picnic geçmiş bir etkinliktir; have geçmişte had olur.",
    "Because sebebi açıklar; so ise ortaya çıkan sonucu bağlar.",
  ],
  conceptSeal: "Geçmiş etkinlik ile geçmiş hava aynı günde yan yana durur.",
  voiceSeal: "Bir tatil gününü hava ve etkinlik olarak iki cümlede söylersin.",
  outcomes: [
    "It was sunny geçmiş havayı söyler.",
    "We had a picnic geçmiş etkinliktir.",
    "Because sebep, so sonuç bağlar.",
  ],
  scene: "holiday",
  parentNote:
    "Çocuğunuz tatil gününü It was sunny ve We had a picnic ile eşler. Because sebep, so sonuç bildirir. Bir fotoğrafı bu iki cümleyle anlattırabilirsiniz.",

};

export const JUNIOR_ING_MAIN_14 = juniorLessonFromScenario(JUNIOR_ING_MAIN_14_SCENARIO);
