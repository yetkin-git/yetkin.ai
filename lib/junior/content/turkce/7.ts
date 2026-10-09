import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Örtülü anlam ve cümle yorumlama. */
export const JUNIOR_TURKCE_7_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-7",
  title: "Cümlede örtülü anlam ve cümle yorumlama",
  teaser:
    "Açık anlam doğrudan söylenir. Örtülü anlam sezdirilir. Yorum, cümleden çıkan yargıdır. Cümlede izi olmayan bilgi eklenmez. Kavramsal Anlayış, sezdirilen ile uydurulanı ayırır. İfade Gücü, izi göstererek yorumu söylemektir.",
  welcome:
    "Hoş geldin! Hazırsan bugün kelimelerin ve cümlelerin renkli dünyasına adım atıyoruz, çünkü cümlelerin satır aralarında saklanan gizli mesajları bir dedektif gibi keşfedeceğiz. Hiç bir arkadaşının kapıyı biraz sertçe kapatıp çıktığında bir şeye canının sıkıldığını konuşmadan anladın mı? Kapının kapanması açık bir durumdur; üzüntü veya kızgınlık ise sezdirilen örtülü bir anlamdır. Bugün seninle açık anlamı, örtülü anlamı ve bir cümleyi doğru yorumlamanın inceliklerini göreceğiz.",
  concept:
    "Açık anlam, cümlenin sözcükleriyle doğrudan ve net bir biçimde söylediği ilk bilgidir. Örtülü anlam ise cümlede doğrudan söylenmediği halde bazı ipuçlarından, eklerden veya sözcüklerden sezilen gizli anlamdır. Örneğin Ahmet bu yıl da takdir aldı cümlesinde açık anlam Ahmet'in takdir almasıdır; de ve da eki ise Ahmet'in geçen yıllarda da takdir aldığını sezdirir, işte bu örtülü anlamdır. Cümle yorumu ise metindeki somut izlerden çıkan doğru yargıdır. Şurası aklında kalsın tamam mı: Örtülü anlamı bulurken metindeki ipuçlarına dayanırız; metinde hiçbir izi olmayan kendi kişisel tahminlerimizi cümleye asla eklemeyiz.",
  example:
    "Birlikte inceleyelim. Ayşe ödevini bu kez zamanında teslim etti cümlesini dinle. Açık anlam Ayşe'nin ödevini zamanında teslim etmesidir. Örtülü anlam ise bu kez sözcüğünden anlaşılacağı üzere Ayşe'nin daha önceki ödevlerini zamanında teslim edememiş olmasıdır. Ancak buradan hareketle Ayşe tembel bir öğrencidir yorumunu yapmak yanlıştır; çünkü metinde böyle bir iz yoktur. Mehmet yine birinci oldu cümlesinde yine sözcüğü, Mehmet'in daha önce de birinci olduğunu bize fısıldar.",
  hint: "trap",
  warning:
    "Örtülü anlamı bir tahmin veya hayal oyunu sanma tuzağından uzak durmalısın. Mutlaka cümlede bir kelime, bir ek veya bir vurgu o anlama kapı aralamalıdır. Metinde izi bulunmayan duygusal yorumları cümlenin anlamıymış gibi kabul etmemeye özen göster.",
  life:
    "Bir arkadaşın sana bu soruyu sadece sen çözebilirsin dediğinde örtülü olarak senin zekana güvendiğini sezersin. Evde annen odanı bugün de çok güzel toplamışsın dediğinde dün de topladığını sevgiyle anlarsın. Satır aralarını doğru okumak çevrendeki insanları çok daha iyi anlamanı sağlar.",
  recap: [
    "Açık anlam cümlenin doğrudan söylediğidir, örtülü anlam sezdirilendir.",
    "de, da, yine, bu kez gibi sözcükler örtülü anlama güçlü ipuçlarıdır.",
    "Cümlede somut izi bulunmayan hiçbir yargı yoruma dahil edilmez.",
  ],
  conceptSeal: "Örtülü anlam sezdirilir. Yorum, izin bittiği yerde durur.",
  voiceSeal: "Bir cümlede açık anlamı, örtülü anlamı ve eklenmemesi gereken yargıyı ayrı söylersin.",
  outcomes: [
    "Örtülü anlam, doğrudan söylenmeden sezdirilir.",
    "Cümle yorumu metindeki ize dayanır.",
    "İzi olmayan yargı cümleden çıkmaz.",
  ],
  scene: "meaning",
  parentNote:
    "Çocuğunuz bu derste açık anlam ile cümlenin satır aralarındaki örtülü anlamı ayırt eder. Günlük konuşmalardaki de/da veya yine gibi sözcüklerin sezgisel anlamlarını birlikte konuşabilirsiniz.",

};

export const JUNIOR_TURKCE_7 = juniorLessonFromScenario(JUNIOR_TURKCE_7_SCENARIO);
