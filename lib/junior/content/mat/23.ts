import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Çember, merkez, yarıçap ve çap. */
export const JUNIOR_MAT_23_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-23",
  title: "Çember",
  teaser:
    "Çember, bir noktaya eşit uzaklıktaki noktaların oluşturduğu eğridir. O nokta merkezdir. Uzaklık yarıçaptır. Çap, merkezden geçen kiriştir ve iki yarıçapa eşittir. Kavramsal Anlayış, çemberi dairenin içinden ayırmandır. İfade Gücü, çapı yarıçaptan iki kat büyük diye söylemektir.",
  welcome:
    "Selamlar! Bugün seninle çok keyifli bir konuyu keşfedeceğiz, çünkü pergelin ucundaki kusursuz yuvarlak şekli, yani çemberi tanıyacağız. Hiç bir ipin ucunu merkeze sabitleyip diğer ucuyla gergin bir yuvarlak çizdin mi? Sabit nokta merkez, ipin boyu yarıçap, çizdiğin çizgi ise çemberdir. Bugün seninle çemberi, yarıçapı ve çapı adım adım inceleyeceğiz.",
  concept:
    "Çember, sadece etrafı çevreleyen eğri çizginin kendisidir; daire ise bu çizginin iç bölgesiyle birlikte kapladığı alandır. Merkez, çemberin tam ortasındaki sabit noktadır. Yarıçap, merkezden çemberin üzerindeki herhangi bir noktaya uzanan doğru parçasıdır ve küçük r harfiyle gösterilir. Çap ise merkezden geçerek çemberin iki noktasını birleştiren en uzun çizgidir ve iki tane yarıçapa eşittir. Şurası aklında kalsın tamam mı: Çap, yarıçapın tam iki katıdır; yarıçap ise çapın yarısı kadardır.",
  example:
    "Yarıçapı 5 santimetre olan bir çemberde çap 5 artı 5'ten 10 santimetredir. Çapı 14 santimetre olan başka bir çemberde ise yarıçap 14 bölü 2'den 7 santimetredir. Bir nokta merkeze 5 santimetre uzaklıktaysa tam çemberin üzerindedir; 3 santimetre uzaklıktaysa dairenin içindedir ama çember çizgisi üzerinde değildir; 8 santimetre uzaklıktaysa çemberin tamamen dışındadır.",
  hint: "trap",
  warning:
    "Tuzaklara Düşme! Çap ile yarıçapı birbiriyle karıştırmak çok sık rastlanan bir tuzaktır. Çap çemberin bir ucundan diğer ucuna merkezden geçen boyudur; yarıçap ise merkezden sınıra kadardır. Yarıçap 5 santimetre ise çap 10 santimetredir. Bir de çember ile daireyi karıştırma: Çember boş bir halka, daire ise içi dolu bir madeni para gibidir.",
  life:
    "Bunu bisiklet tekerinde de kullanırsın. Tekerin göbeği merkezdir. Göbekten lastiğe kadar olan tel yarıçaptır. Lastiğin bir ucundan öteki ucuna, göbekten geçerek giden uzunluk çaptır. Parkta pergel ile çizdiğin oyun halkası da aynı sözleri kullanır. İpin boyu değişince çember de büyür.",
  recap: [
    "Çember eğri çizgidir. Daire, çemberin içiyle birlikte olan bölgedir.",
    "Yarıçap merkezi çembere bağlar. Çap, iki yarıçapa eşittir ve merkezden geçer.",
    "Yarıçap 5 santimetre ise çap 10 santimetredir. Çap 14 ise yarıçap 7'dir.",
  ],
  conceptSeal: "Çap, merkezden geçen ve iki yarıçap eden uzunluktur.",
  voiceSeal: "Çember ile daireyi ve yarıçap ile çapı ayrı söylersin.",
  outcomes: [
    "Çember, merkeze eşit uzaklıktaki noktaların çizgisidir.",
    "Çap, yarıçapın iki katıdır.",
    "Daire, çemberin kapladığı iç bölgeyi de taşır.",
  ],
  scene: "circle",
  parentNote:
    "Çocuğunuz çemberin çizgi, dairenin iç bölge olduğunu anlatır. Yarıçap 5 santimetre ise çap 10 santimetredir. Evde ip ve çivi örneği yeter.",

};

export const JUNIOR_MAT_23 = juniorLessonFromScenario(JUNIOR_MAT_23_SCENARIO);
