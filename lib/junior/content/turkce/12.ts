import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Hikâye, anı, mektup, tiyatro ve gezi yazısı. */
export const JUNIOR_TURKCE_12_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-12",
  title: "Metin türleri",
  teaser:
    "Hikâye kurmaca olay anlatır. Anı yaşanmışı birinci kişiyle anlatır. Mektupta hitap vardır. Tiyatro konuşmayla kurulur. Gezi yazısı gezilen yeri anlatır. Kavramsal Anlayış, beş türü ayırır. İfade Gücü, bir metnin türünü söylemektir.",
  welcome:
    "Hoş geldin! Hazırsan bugün kelimelerin ve cümlelerin renkli dünyasına adım atıyoruz, çünkü kütüphanelerin raflarını süsleyen birbirinden farklı metin türlerinin kapısını aralayacağız. Hiç bir kitapta sevgili arkadaşım diye başlayan sıcak bir mektupla, sahnede karşılıklı konuşan karakterlerin yer aldığı bir tiyatro metninin farkını merak ettin mi? Bugün seninle hikâye, anı, mektup, tiyatro ve gezi yazısını ayırt edeceğiz. Her metin türü, yazarın dünyayı bize anlatış biçimidir.",
  concept:
    "Metinler yazılış amaçlarına ve biçimlerine göre türlere ayrılır. Hikâye yani öykü; yaşanmış ya da yaşanması mümkün olayların yer, zaman ve kişi unsurlarına bağlanarak kurmaca bir dünyayla anlatılmasıdır. Anı yani hatıra ise yazarın bizzat yaşadığı ya da tanık olduğu olayları üzerinden zaman geçtikten sonra birinci kişi ağzıyla, yani ben diliyle kaleme almasıdır. Mektup, uzaktaki bir kişiye duygu ve haber iletmek için yazılan, mutlaka hitapla başlayan ve tarih taşıyan yazıdır. Tiyatro, sahnede canlandırılmak üzere yazılan, karşılıklı konuşmalara ve parantez içi oyuncu hareketlerine dayanan türdür. Gezi yazısı ise yazarın gezip gördüğü yerlerin tarihi, doğal güzellikleri ve kültürünü kendi izlenimleriyle harmanlayarak aktardığı metindir. Şurası aklında kalsın tamam mı: Anı gerçektir ve yaşanmıştır; hikâye ise yazarın hayal gücüyle kurgulanabilir.",
  example:
    "Örneklerimize kulak verelim. Yaşlı balıkçı sabahın ilk ışıklarıyla denize açıldı ve dev bir balıkla karşılaştı; bu kurmaca bir hikâyedir. İlkokula başladığım o yağmurlu günü ve kırmızı önlüğümü hiç unutamam; bu yazarın kendi yaşadığı bir anıdır. Sevgili teyzeciğim, seni ve köyümüzü çok özledim; bu bir mektuptur, hitapla başlar. Ali: Buraya gel Ayşe! Ayşe: Hemen geliyorum! şeklinde diyaloglarla ilerleyen metin tiyatrodur. Kapadokya'nın peri bacalarını seyrederken doğanın mucizesine hayran kaldım; bu gezi yazısıdır.",
  hint: "trap",
  warning:
    "Anıyı kurmaca bir hikâye sanma tuzağından özenle kaçınmalısın. Anıda yazar geçmişte bizzat yaşadığı gerçek olayları anlatır; hikâyede ise yazar olayları tamamen zihninde tasarlayabilir. Karşılıklı konuşmaların alt alta isimlerle yazıldığı bir metni de düz yazı sanmamalı, tiyatro olduğunu hemen fark etmelisin.",
  life:
    "Tatilde gittiğin bir şehri ve hayran kaldığın müzeleri yazarsan bu bir gezi yazısı olur. Yıllar önce bisikletten düştüğün günü yazarsan bu bir anı olur. Arkadaşına doğum gününde güzel dileklerini ilettiğin bir not mektuptur. Okul müsamerelerinde sahnede canlandırdığınız piyes ise bir tiyatrodur.",
  recap: [
    "Hikâye kurmaca olayları, anı ise yazarın bizzat yaşadığı geçmişi anlatır.",
    "Mektupta hitap ve tarih, tiyatroda ise sahnede konuşma ve diyaloglar bulunur.",
    "Gezi yazısı, gezilen yerleri yazarın gözlem ve izlenimleriyle aktarır.",
  ],
  conceptSeal: "Tür, metnin kuruluşundan belli olur. Yaşanmış anıdır. Konuşma tiyatrodur.",
  voiceSeal: "Bir metnin hikâye, anı, mektup, tiyatro veya gezi yazısı olduğunu söylersin.",
  outcomes: [
    "Anı yaşanmıştır ve birinci kişiyle anlatılır.",
    "Tiyatro diyalogla kurulur.",
    "Gezi yazısı yer ve izlenim taşır.",
  ],
  scene: "book",
  parentNote:
    "Çocuğunuz bu derste hikâye, anı, mektup, tiyatro ve gezi yazısının ayırt edici niteliklerini öğrenir. Birlikte bir anısını veya gezdiği bir yeri yazıya dökerek tür bilincini geliştirebilirsiniz.",

};

export const JUNIOR_TURKCE_12 = juniorLessonFromScenario(JUNIOR_TURKCE_12_SCENARIO);
