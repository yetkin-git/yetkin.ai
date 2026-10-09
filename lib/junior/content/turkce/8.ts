import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Paragrafta konu ve ana fikir. */
export const JUNIOR_TURKCE_8_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-8",
  title: "Paragrafta ana fikir ve konu",
  teaser:
    "Konu, paragrafın ne hakkında olduğudur ve yargı taşımaz. Ana fikir, yazarın asıl söylemek istediği yargıdır. Kavramsal Anlayış, konuyu ana fikirden ayırır. İfade Gücü, asıl yargıyı bir cümleyle söylemektir.",
  welcome:
    "Selamlar! Bugün seninle dilimizin ve güzel Türkçemizin çok keyifli bir sırrını keşfedeceğiz, çünkü bir paragrafın kalbine inmeyi ve yazarın asıl mesajını tek bir hamlede yakalamayı öğreneceğiz. Hiç uzun bir yazıyı okuduktan sonra arkadaşın bu yazı ne anlatıyor diye sorduğunda tek bir cümleyle özetledin mi? Yazarın anlattığı alan konudur; bize vermek istediği asıl ders ise ana fikirdir. Bugün seninle konu ile ana fikri birbirinden ayıran altın anahtarları keşfedeceğiz.",
  concept:
    "Paragrafın konusu, yazarın yazısında ele aldığı, üzerinde durduğu olay, durum veya kavramdır. Yazar ne anlatıyor sorusunun cevabıdır ve genellikle birkaç kelimelik bir söz öbeğidir; yargı bildirmez. Kitap okumanın yararları bir konudur. Ana fikir yani ana düşünce ise yazarın okuyucuya iletmek istediği asıl mesaj, vermek istediği derstir. Yazar bu metni ne amaçla yazdı veya yazar ne demek istiyor sorusunun cevabıdır ve mutlaka tam bir yargı cümlesidir. Kitap okumak insanı zenginleştirir bir ana fikirdir. Şurası aklında kalsın tamam mı: Metindeki örnekler ve ayrıntılar ana fikir değildir; onlar sadece ana fikri destekleyen yardımcı kanatlardır.",
  example:
    "Gözümüzün önünde bir paragraf canlandıralım. Ormanlar yeryüzünün akciğerleridir. Havayı temizler, erozyonu önler ve binlerce canlıya yuva sağlar. Bu yüzden ormanları korumak her insanın görevidir. Bu metnin konusu nedir? Ormanların faydalarıdır; kısa ve yargısızdır. Peki ana fikri nedir? Ormanlar yaşam için vazgeçilmez olduğundan onları korumalıyız yargısıdır. Havayı temizlemesi bir örnektir, erozyonu önlemesi bir ayrıntıdır. Asıl yargı metnin çatısını kurar.",
  hint: "gold",
  warning:
    "Metindeki ilginç bir örneği veya yardımcı düşünceyi ana fikirle karıştırmamaya dikkat edebilirsin. Örneğin ağaçlar kuşlara yuva olur cümlesi bir ayrıntıdır, ana fikir değildir. Konu bir başlık gibidir, ana fikir ise o başlığın altındaki en güçlü sonuç cümlesidir.",
  life:
    "Bir arkadaşınla izlediğin bir filmi konuşurken konusu uzay yolculuğudur dersin; ana fikri ise dostluk her engeli aşar yargısıdır. Bir kompozisyon yazarken önce konunu belirler, sonra okuyucuna vermek istediğin ana fikri zihninde netleştirirsen yazdığın her satır etkileyici olur.",
  recap: [
    "Konu, metinde ne anlatıldığını söyler ve yargı taşımaz.",
    "Ana fikir, yazarın okura vermek istediği asıl mesajdır ve tam bir cümledir.",
    "Örnekler ve ayrıntılar ana fikri destekler ama onun yerine geçemez.",
  ],
  conceptSeal: "Konu alandır. Ana fikir yargıdır. Örnek, yargının yerine geçmez.",
  voiceSeal: "Bir paragrafta konuyu ve ana fikri ayrı cümlelerle söylersin.",
  outcomes: [
    "Konu, paragrafın alanıdır.",
    "Ana fikir, asıl yargı cümlesidir.",
    "Örnek ve ayrıntı ana fikrin yerine geçmez.",
  ],
  scene: "main-idea",
  parentNote:
    "Çocuğunuz bu derste bir metnin konusu ile ana fikrini ayırt eder. Okuduğu bir masal veya hikâyenin ardından 'Burada yazar bize ne öğüt vermek istedi?' sorusunu yönelterek ana fikri bulmasını sağlayabilirsiniz.",

};

export const JUNIOR_TURKCE_8 = juniorLessonFromScenario(JUNIOR_TURKCE_8_SCENARIO);
