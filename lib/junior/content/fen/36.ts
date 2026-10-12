import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Ampul parlaklığının değişkenleri. FB.6.6.2. Pilot ders. */
export const JUNIOR_FEN_36_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-36",
  title: "Ampul parlaklığının değişkenleri",
  teaser:
    "Ampul parlaklığı, devrede tek seferde değiştirilen değişkene bağlıdır. Pil sayısı ve seri ampul sayısı parlaklığı farklı etkiler. Kavramsal Anlayış, bağımsız değişkeni bağımlı değişkenden ayırır. İfade Gücü, hangi değişkeni değiştirdiğini söylemektir.",
  welcome:
    "Merhaba sevgili çocuklar! Akşam masadaki lambanın bir gün parlak, ertesi gün sönük yandığını gördün mü? Aynı oda, aynı ampul; değişen şey devrenin bir parçasıdır. Parlaklığı değiştiren değişkenleri bir deney düzeninde ayıracağız. Gözlemimizi tek bir değişkene bağlayacağız.",
  concept:
    "Ampul parlaklığı, devreden geçen akım büyüyünce artar. Bir deneyde birçok şeyi aynı anda değiştirirsek sonucu kimin değiştirdiğini bilemeyiz. Bağımsız değişken bizim seçtiğimiz etkendir. Bağımlı değişken ise ampulün parlaklığıdır. Pil sayısı artınca aynı ampul daha parlak yanabilir. Aynı pilde seri bağlı ampul sayısı artınca her ampul daha sönük yanar. Kontrollü deneyde diğer parçalar sabit tutulur. Pratik kural: Bir değişken değişir, parlaklık ölçülür, sonra sıradaki değişkene geçilir.",
  example:
    "Masada 1 pil ve 1 ampul varken lamba parlak yanar. Aynı ampule 2. pili ekleyince gözlem değişir ve lamba daha parlak olur. Burada bağımsız değişken pil sayısıdır. Pili yine 1 tanede sabit tutup seri 2 ampul bağlayalım. Her iki ampul de tek ampul deneyine göre daha sönük yanar. Ampul sayısını 2'den 3'e çıkarırsak parlaklık bir kez daha azalır. Ölçmeyi basit bir ölçekle tutarız: sönük 1, orta 2, parlak 3.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Hem pili hem ampul sayısını aynı anda değiştirirsen hangi değişkenin parlaklığı değiştirdiğini ayıramazsın. Seri bağlamada ampul eklemek parlaklığı artırmaz, azaltır. Parlaklığı yalnız telin rengine bağlamak da deneyi eksik bırakır. Ampul parlaklığının değişkenleri konusunda kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu evde bir el fenerinde gözlemleyebilirsin. Pili zayıflayan fenerin lambası söner; yeni pil takınca parlaklık geri gelir. Okul deneyinde iki düzeneği yan yana koyup yalnız pil sayısını değiştirirsen farkı görürsün. Kapıdaki gece lambası da kaynak zayıflayınca solar.",
  recap: [
    "Ampul parlaklığı, değiştirilen değişkene bağlıdır.",
    "Kontrollü deneyde bir değişken değişir, diğerleri sabit kalır.",
    "Pil artınca parlaklık artabilir; seri ampul artınca parlaklık azalır.",
  ],
  conceptSeal: "Parlaklık, tek seferde değiştirilen değişkenle açıklanır.",
  voiceSeal: "Hangi değişkeni değiştirdiğini ve lambanın nasıl göründüğünü söylersin.",
  outcomes: [
    "Ampul parlaklığının değişkenleri kontrollü deneyle incelenir.",
    "Bağımsız değişken tek tek değiştirilir.",
    "Pil sayısı ve seri ampul sayısı parlaklığı farklı etkiler.",
  ],
  scene: "circuit",
  parentNote:
    "Çocuğunuz ampul parlaklığını pil sayısı ve seri ampul sayısıyla ilişkilendirir. Deneyde bir değişkenin değişip diğerlerinin sabit kaldığını anlatması beklenir.",
};

export const JUNIOR_FEN_36 = juniorLessonFromScenario(JUNIOR_FEN_36_SCENARIO);
