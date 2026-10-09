import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Yapım ekleri ve dört türetme yolu. */
export const JUNIOR_TURKCE_15_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-15",
  title: "Yapım ekleri ve sözcük türetme",
  teaser:
    "Yapım eki köke gelince yeni bir sözcük türer. İsimden isim, isimden fiil, fiilden isim ve fiilden fiil türetilebilir. Kavramsal Anlayış, türetmeyi çekimden ayırır. İfade Gücü, kökü ve eki ayrı söylemektir.",
  welcome:
    "Merhaba! Türkçe dünyasına hoş geldin, bugün dilimizin üretken fabrikasına adım atıyoruz. Hiç göz kökünden görme aracı olan gözlük, yaz fiilinden okuduğumuz yazı kelimesinin nasıl ustalıkla üretildiğini düşündün mü? Türkçemiz eklemeli bir dildir; köklere gelen yapım ekleriyle yepyeni kavramlar doğar. Bugün seninle yapım eklerinin dört türetme yolunu ve dilimizin kelime üretme gücünü birlikte keşfedeceğiz.",
  concept:
    "Yapım eki, sözcük kök veya gövdelerine gelerek onlardan tamamen yeni anlamlı sözcükler türeten eklerdir. Yapım eki geldiğinde sözcüğün anlamı değişir, bazen türü de değişir. Yapım ekleri dört farklı yoldan yeni sözcük üretir. Birincisi isimden isim yapma: şeker kökünden şekerlik türetmek böyledir. İkincisi isimden fiil yapma: göz isminden gözlemek eylemini türetmektir. Üçüncüsü fiilden isim yapma: sevmek fiilinden sevgi adını üretmektir. Dördüncüsü fiilden fiil yapma: gülmek fiilinden güldürmek eylemini türetmektir. Şurası aklında kalsın tamam mı: Yapım eki yeni bir sözcük kimliği kazandırır; çekim ekleri ise kelimenin anlamını değiştirmeden sadece cümlede görev verir.",
  example:
    "Birlikte inceleyelim. Tuz bir maddedir; luk eki geldiğinde tuzluk yani o maddeyi koyduğumuz kap olur; bu isimden isim türetmedir. Baş bir organdır; la eki gelince başlamak fiili doğar; bu isimden fiil türetmedir. Saymak bir eylemdir; ı eki gelince sayı kavramı doğar; bu fiilden isim türetmedir. Sevmek fiiline dir eki gelince sevdirmek eylemi doğar; bu da fiilden fiil türetmedir. Her yeni ek, dilimize yepyeni bir zenginlik katar.",
  hint: "gold",
  warning:
    "Çoğul eki olan ler ve lar ile yapım eklerini birbirine karıştırmamaya özen gösterebilirsin. Evler dediğimizde sözcük hâlâ evdir, sadece sayısı çoğalmıştır; yani anlam değişmemiştir ve çekim ekidir. Ancak evli dediğimizde artık bir aile kurmuş insanı anlatırız; anlam değişmiştir ve li bir yapım ekidir. Kelimenin yeni bir nesneye veya kavrama dönüşüp dönüşmediğine dikkat edebilirsin.",
  life:
    "Kitaplıktan bir kitap alıp okuduğunda lık ekinin yeni bir eşya kurduğunu hemen görürsün. Sessizce ders çalışırken bu ekin sesten sakinlik ürettiğini fark edersin. Yapım eklerini tanımak yeni kelimeler türetirken dilin inceliklerini ustaca kullanmanı sağlar.",
  recap: [
    "Yapım eki, köke gelerek yeni anlamlı ve yeni kimlikli sözcükler türetir.",
    "İsimden isim, isimden fiil, fiilden isim ve fiilden fiil olmak üzere dört türetme yolu vardır.",
    "Çekim eki sadece görev verir; yapım eki ise yepyeni bir sözcük inşa eder.",
  ],
  conceptSeal: "Yapım eki türetir. Çekim eki görev verir.",
  voiceSeal: "Bir sözcükte kökü ve yapım ekini ayırıp hangi yoldan türediğini söylersin.",
  outcomes: [
    "Yapım eki yeni sözcük türetir.",
    "Dört türetme yolu isim ve fiil arasında kurulur.",
    "Çoğul ek yeni sözcük türetmez.",
  ],
  scene: "affix",
  parentNote:
    "Çocuğunuz bu derste yapım eklerinin yeni kelimeler türettiğini kavrar. Evdeki eşyalardan hareketle türetme örneklerini birlikte konuşabilirsiniz.",

};

export const JUNIOR_TURKCE_15 = juniorLessonFromScenario(JUNIOR_TURKCE_15_SCENARIO);
