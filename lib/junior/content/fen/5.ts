import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Dolaşım sistemi. */
export const JUNIOR_FEN_5_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-5",
  title: "Dolaşım sistemi",
  teaser:
    "Kalp kanı pompalar. Büyük dolaşım vücuda, küçük dolaşım akciğere gider. Kavramsal Anlayış, temiz ve kirli kanın yolunu ayırır. İfade Gücü, akciğer atardamarının neden oksijence fakir kan taşıdığını söylemektir.",
  welcome:
    "Merhaba! Bilim dünyasına hoş geldin, çünkü bugün vücudumuzun durmaksızın çalışan harika kargo ağını keşfedeceğiz. Hiç koşup nefes nefese kaldıktan sonra elini göğsüne koyup kalbinin tıkır tıkır attığını hissettin mi? O güçlü vuruşlar, damarlarımızdaki kanı bütün vücudumuza pompalar. Bugün seninle kalp, kan ve damarlarımızın el ele vererek hayatı nasıl taşıdığını göreceğiz.",
  concept:
    "Dolaşım sistemi; kalp, kan ve damarlardan meydana gelir. Kalbimiz dört odacıktan oluşur; üstte iki kulakçık, altta iki karıncık yer alır. Küçük kan dolaşımında oksijence fakir kirli kan, sağ karıncıktan akciğere gider, oksijen alıp temizlenir ve sol kulakçığa geri döner. Büyük kan dolaşımında ise temiz kan, sol karıncıktan aort ile tüm vücuda dağıtılır ve kirlenerek sağ kulakçığa döner. Atardamarlar kanı kalpten götürür, toplardamarlar kalbe getirir; kılcal damarlar ise madde alışverişini yapar. Şurası aklında kalsın tamam mı: Akciğer atardamarı kalpten çıkış yaptığı için atardamardır ama oksijence fakir kan taşır.",
  example:
    "Kan sıvısını çalışkan bir teslimat filosu gibi düşünebilirsin. Kırmızı alyuvarlar oksijen paketlerini taşır. Beyaz akyuvarlar vücudumuzu mikroplardan koruyan cesur savunuculardır. Minik kan pulcukları bir yerimiz çizildiğinde kanı pıhtılaştırıp yara bandı gibi görev yapar. Kan plazması ise tüm bu hücrelerin yüzdüğü besleyici sıvıdır. Kalbin sol karıncığı güçlüce kasılınca temiz kan aort atardamarıyla yola çıkar, tüm organlara besin ve oksijen dağıtır. Organlardan karbondioksiti toplayan kan sağ kulakçığa döner; oradan sağ karıncığa inip akciğer atardamarıyla akciğerlere temizlenmeye yollanır.",
  hint: "trap",
  warning:
    "Tüm atardamarların temiz kan taşıdığını düşünmek en yaygın yanılgıdır. Akciğer atardamarı kalpten akciğere temizlenmeye giden oksijence fakir kanı taşır. Damarın adı kanın kalpten çıkış yönünü söyler; bunu bir kez fark edince hiçbir soru seni şaşırtamaz.",
  life:
    "Bunu bahçede koşup terledikten sonra nabzını sayarken hemen anlarsın. Kasların daha çok enerji harcadığı için kalbin daha hızlı çarpar ve hücrelerine daha çok oksijen taşır. Bileğindeki nabız atışı, kanın atardamar duvarına yaptığı tatlı vuruşlardır. Bir yerin hafifçe kanadığında temiz bir gazlı bezle üzerine hafifçe bastırmalı ve hemen bir yetişkine haber vermelisin.",
  recap: [
    "Kalp kanı pompalar. Dört odacığı vardır.",
    "Büyük dolaşım vücuda, küçük dolaşım akciğere gider.",
    "Akciğer atardamarı oksijence fakir kan taşır. Atardamar adı yönü söyler.",
  ],
  conceptSeal: "Dolaşım, kanın kalp ve damarlar yoluyla vücut ile akciğer arasında gezmesidir.",
  voiceSeal: "Büyük ve küçük dolaşımı ve akciğer atardamarının farkını söylersin.",
  outcomes: [
    "Kalp, kan ve damarlar dolaşım sistemini oluşturur.",
    "Büyük kan dolaşımı vücut ile kalp arasındadır.",
    "Küçük kan dolaşımı kalp ile akciğer arasındadır.",
  ],
  scene: "blood",
  parentNote:
    "Çocuğunuz büyük dolaşımı vücuda, küçük dolaşımı akciğere bağlar. Akciğer atardamarının oksijence fakir kan taşıdığını ayırt etmesi beklenir. Kanama olursa temiz bez ve yetişkin yardımı yeter.",

};

export const JUNIOR_FEN_5 = juniorLessonFromScenario(JUNIOR_FEN_5_SCENARIO);
