import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 17. hafta. Anayasa ve demokrasi. */
export const JUNIOR_SOSYAL_17_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-17",
  title: "Haklarımızın güvencesi: anayasa ve demokrasi",
  teaser:
    "Anayasa, devletin temel kanunudur. Hak ve özgürlükler burada güvence altındadır. Diğer kanunlar anayasaya uygun olmak zorundadır. Kavramsal Anlayış, anayasayı sıradan bir kuraldan ayırır. İfade Gücü, bir hakkın neden güvencede olduğunu söylemektir.",
  welcome:
    "Hoş geldin! Hazırsan bugün tarihin, kültürün ve yeryüzünün heyecan dolu dünyasına adım atıyoruz, çünkü haklarımızı koruyan en yüce güvenceyi, yani devletimizin temel çatısını öğreneceğiz. Hiç oynadığın bir kutu oyununda en üstteki ana kural kartının, alttaki tüm küçük kuralları bağladığını gördün mü? Hiçbir küçük kural o ana kuralı çiğneyemez. İşte devletimizin ve toplumumuzun hayatında da tüm kuralların en üstünde duran böyle sağlam bir temel yasa vardır; ona Anayasa denir. Bugün seninle anayasanın ne olduğunu, temel haklarımızı nasıl koruduğunu ve demokrasinin bu sağlam çatıyla nasıl nefes aldığını göreceğiz.",
  concept:
    "Anayasa, bir devletin temel yönetim yapısını, organlarının işleyişini ve vatandaşların en temel hak ve özgürlüklerini belirleyen en üstün kanundur. Yaşama hakkı, eğitim hakkı, düşünce ve ifade özgürlüğü ile sağlık hakkı anayasa ile teminat altına alınmıştır. Meclis tarafından çıkarılan hiçbir kanun ya da yönetmelik anayasaya aykırı olamaz; aykırı olan düzenlemeler mahkemeler tarafından iptal edilir. Şurası aklında kalsın tamam mı: Anayasa sıradan bir kanun ya da basit bir okul kuralı değildir; devletin çatısı, adaletin temeli ve tüm haklarımızın en büyük koruyucu kalkanıdır.",
  example:
    "Bir oyun tahtasını hayal edelim. Oyunun en başında konulmuş ana kurallar vardır; kuralların dışına çıkılamaz. Anayasa işte bu ana kuraldır. Okul yönetmeliği ya da bir kurum kuralı ise bu büyük anayasanın altındaki kurallardır. Örneğin okul yönetmeliği, bir öğrencinin anayasada yazılı olan eğitim hakkını elinden alamaz; çünkü anayasa onu korur. Fikirlerini dile getirme özgürlüğü de anayasada yazılıdır; ancak bu hakkı kullanırken başkalarının haklarını zedelememek de yine anayasanın çizdiği adalet sınırıdır. Haklarımızın bir kâğıtta kalmayıp mahkemelerle korunması demokrasinin gerçek gücüdür.",
  hint: "trap",
  warning:
    "Anayasayı sıradan bir duyuru veya herhangi bir yönetmelikle bir tutmak yanıltıcı bir tuzaktır. Yönetmelikler zamanla değişebilir; anayasa ise devletin en temel ve en üst kanunudur. Anayasayı bir kişinin sözü sanma; o, milletin ortak iradesinin metne dökülmüş güvencesidir. Anayasal haklarının bilincinde olan bir genç, haklarını korurken başkalarının hakkına da her zaman saygıyla yaklaşır.",
  life:
    "Bunu kütüphanede ders çalışırken de düşünebilirsin. Kütüphane panosundaki kural, etrafı rahatsız etmemek için yüksek sesle konuşmamayı söyler. Ancak en üst kural, her vatandaşın eşit biçimde kitaba ve bilgiye ulaşma hakkını korur. Küçük kurallar büyük hakları yaşatmak için vardır. Hayatının her alanında anayasal haklarının farkında olmak, seni kendine güvenen ve toplumuna değer katan aktif bir vatandaş yapar.",
  recap: [
    "Anayasa, devletin temel kanunudur ve hakların güvencesidir.",
    "Diğer kanunlar anayasaya uygun olmak zorundadır.",
    "Anayasa bir yönetmelik değildir. Demokrasi bu güvenceyle işler.",
  ],
  conceptSeal: "Anayasa üst kanundur. Haklar onunla güvence altına alınır.",
  voiceSeal: "Bir hakkın neden yönetmelikten daha üstte durduğunu tek cümleyle söylersin.",
  outcomes: [
    "Anayasa devletin temel kanunudur.",
    "Hak ve özgürlükler anayasa ile güvence altındadır.",
    "Kanunlar anayasaya aykırı olamaz.",
  ],
  scene: "assembly",
  parentNote:
    "Çocuğunuz anayasayı devletin üst kanunu ve hakların güvencesi olarak anlatır. Yönetmelik ile anayasanın aynı düzeyde olmadığını söyler.",

};

export const JUNIOR_SOSYAL_17 = juniorLessonFromScenario(JUNIOR_SOSYAL_17_SCENARIO);
