import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Kümeler. */
export const JUNIOR_MAT_8_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-8",
  title: "Kümeler",
  teaser:
    "Küme, iyi tanımlanmış nesnelerin bir araya gelmesidir. Eleman, kümenin içindeki bir nesnedir. Kavramsal Anlayış, boş kümeyi ortak elemandan ayırmandır. İfade Gücü, iki kümenin ortak elemanını ve birleşimini söylemektir.",
  welcome:
    "Selamlar! Bugün seninle çok keyifli bir konuyu keşfedeceğiz, çünkü nesneleri düzenli gruplara ayırmayı öğreneceğiz. Hiç kalem kutunu açıp içindeki renkleri tek tek saydın mı? Kutu bir küme, içindeki her bir kalem ise bu kümenin bir elemanıdır. Bugün seninle kümeleri, eleman kavramını, boş kümeyi ve ortak elemanları tanıyacağız.",
  concept:
    "Küme; kimin içeride, kimin dışarıda olduğu herkes tarafından kesinlikle bilinen nesneler topluluğudur. Elemanları süslü parantez içinde ve aralarına virgül koyarak yazarız. Bir kümede aynı eleman asla iki kez yazılmaz. İçinde hiçbir eleman bulunmayan kümeye boş küme deriz. Şurası aklında kalsın tamam mı: İki kümede birden yer alan eleman ortak elemandır. İki kümeyi birleştirdiğinde de ortak eleman sadece bir kez yazılır.",
  example:
    "A kümesi kırmızı, mavi ve sarı renklerden oluşsun. B kümesi ise sarı ve yeşil renklerden oluşsun. A'nın eleman sayısı 3, B'nin eleman sayısı 2'dir. Ortak eleman sadece sarıdır. İki kümeyi birleştirdiğimizde kırmızı, mavi, sarı ve yeşil olur; sarı iki kez yazılmaz. C kümesi ise pazartesi yağan kar olsun; o gün kar yağmadıysa C kümesi boş kümedir. Güzel renkler diye bir küme kuramayız, çünkü bu kişiden kişiye değişir; kümenin elemanı net olmalıdır.",
  hint: "trap",
  warning:
    "Kümeleri birleştirirken ortak elemanı listeye iki kez yazmak çok sık yapılan bir hatadır. Sarı renk iki kümede de olsa, birleşim kümesinde sadece bir kez yer alır. Ayrıca boş kümeyi 0 sayısı içeren bir küme sanma. Boş kümede hiçbir eleman yoktur; 0 ise başlı başına bir elemandır.",
  life:
    "Bunu sınıf listesinde de kullanırsın. Müzik kursundaki adlar bir küme, resim kursundaki adlar başka bir kümedir. İki kursa birden gelen arkadaş ortak elemandır. İki listenin toplamı birleşimdir. Aynı arkadaş iki derse de yazılmış olsa bile bir kez sayılır.",
  recap: [
    "Küme, elemanları belli olan topluluktur. Boş kümede hiç eleman yoktur.",
    "Ortak eleman iki kümede birden vardır. Birleşimde bir kez yazılır.",
    "A ve B örneğinde ortak eleman sarıdır. Birleşimde dört renk durur.",
  ],
  conceptSeal: "Küme, içi belli olan bir topluluktur.",
  voiceSeal: "Ortak eleman ile birleşimi ayrı ayrı söylersin.",
  outcomes: [
    "Eleman, kümenin içinde belli olan nesnedir.",
    "Boş kümede hiç eleman yoktur.",
    "Ortak eleman birleşimde bir kez yazılır.",
  ],
  scene: "sets",
  parentNote:
    "Çocuğunuz kümeyi, elemanı ve boş kümeyi ayırır. Evde kırmızı, mavi, sarı ile sarı, yeşil kümelerinin ortak elemanının sarı olduğunu konuşmak yeter. Sarı birleşimde bir kez yazılır.",

};

export const JUNIOR_MAT_8 = juniorLessonFromScenario(JUNIOR_MAT_8_SCENARIO);
