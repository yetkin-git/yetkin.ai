import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Çoğul, hal, iyelik ve ilgi ekleri. */
export const JUNIOR_TURKCE_16_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-16",
  title: "İsim çekim ekleri",
  teaser:
    "Çekim eki sözcüğün türünü değiştirmez, cümlede görev verir. Çoğul, hal, iyelik ve ilgi ekleri bu gruptadır. Kavramsal Anlayış, çekimi yapımdan ayırır. İfade Gücü, ekin görevini söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç ev, evler, evde ve evim sözcüklerini peş peşe söylediğinde hepsinin özünde hâlâ aynı sevimli yuva olduğunu fark ettin mi? Kelimenin anlamı değişmez, fakat cümlede üstlendiği görev değişir. İşte bu görevleri isim çekim ekleri sağlar. Bugün seninle çoğul eklerini, hal eklerini, iyelik yani sahiplik eklerini ve ilgi eklerini adım adım inceleyeceğiz. İsimlerin cümle içinde nasıl uyumla yer aldığını görmek çok keyifli olacak.",
  concept:
    "Çekim ekleri, eklendiği sözcüğün anlamını değiştirmeyen, onun diğer sözcüklerle bağ kurmasını ve cümlede görev almasını sağlayan eklerdir. İsim çekim ekleri dört ana grupta toplanır. Çoğul eki ler ve lar dır; varlığın birden fazla olduğunu gösterir: kitaplar. Hal ekleri ismi cümleye bağlar: yönelme hali eve, belirtme hali evi, bulunma hali evde, ayrılma hali ise evden biçimindedir. İyelik ekleri bir varlığın kime veya neye ait olduğunu bildirir: çantam benim çantamdır, evin senin evindir. İlgi eki ise isim tamlamalarında tamlayana gelir ve iki ismi birbirine bağlar: evin kapısı tamlamasındaki in ilgi ekidir. Şurası aklında kalsın tamam mı: Çekim eki sözcüğü yeni bir kavrama dönüştürmez; onu cümlenin ahenkli bir parçası yapar.",
  example:
    "Gel birlikte cümleler üzerinde görevleri izleyelim. Masada kitaplar duruyor dediğimizde lar çoğul ekidir. Okula gidiyorum dediğimizde a yönelme halidir. Okulu seviyorum dediğimizde u belirtme halidir. Okulda buluştuk dediğimizde da bulunma halidir. Okuldan ayrıldım dediğimizde dan ayrılma halidir. Kalemim masada cümlesindeki im iyelik ekidir, sahiplik bildirir. Okulun bahçesi dediğimizdeki un ise ilgi ekidir, bahçeyi okula bağlar. Her ek isme farklı bir pencere açar.",
  hint: "trap",
  warning:
    "İlgi eki ile iyelik ekini birbiriyle karıştırma tuzağına dikkat etmelisin. Evin kapısı dediğimizde in eki bir tamlama kurar ve ilgi ekidir; senin evin çok güzel dediğimizde ise in eki evin sana ait olduğunu gösteren bir iyelik ekidir. Kelimenin cümlede ne anlattığına bakarak doğru kararı güvenle verebilirsin.",
  life:
    "Arkadaşına defterimi evde unuttum derken iki çekim eki kullanırsın: defterim iyelikle sana ait olduğunu, evde ise bulunma haliyle nerede kaldığını anlatır. Çekim ekleri sayesinde derdimizi, sevinçlerimizi ve durumlarımızı eksiksiz ve pürüzsüzce ifade ederiz.",
  recap: [
    "Çekim ekleri sözcüğün anlamını değiştirmez, cümlede görev kazandırır.",
    "Çoğul ekleri ler-lar, hal ekleri e, i, de ve den ekleridir.",
    "İyelik eki sahipliği, ilgi eki ise tamlama bağını kurar.",
  ],
  conceptSeal: "Çekim eki görev verir. Yapım eki yeni sözcük türetir.",
  voiceSeal: "Bir isimdeki ekin çoğul, hal, iyelik veya ilgi görevi olduğunu söylersin.",
  outcomes: [
    "İsim çekim ekleri türü değiştirmez.",
    "Hal ekleri yönelme, belirtme, bulunma ve ayrılmadır.",
    "İlgi eki tamlamada, iyelik sahiplikte durur.",
  ],
  scene: "affix",
  parentNote:
    "Çocuğunuz bu derste çoğul, hal, iyelik ve ilgi eklerinin sözcüğün anlamını değiştirmeden cümlede görev verdiğini kavrar.",

};

export const JUNIOR_TURKCE_16 = juniorLessonFromScenario(JUNIOR_TURKCE_16_SCENARIO);
