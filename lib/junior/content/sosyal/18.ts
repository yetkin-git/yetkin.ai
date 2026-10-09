import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 18. hafta. Yasama, yürütme ve yargı. */
export const JUNIOR_SOSYAL_18_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-18",
  title: "Devletin organları",
  teaser:
    "Yasama kanun yapar ve bu iş Türkiye Büyük Millet Meclisinindir. Yürütme kanunları uygular ve başında Cumhurbaşkanı vardır. Yargı bağımsız mahkemelerdir. Kavramsal Anlayış, üç işi ayrı tutar. İfade Gücü, bir haberde hangi organın çalıştığını söylemektir.",
  welcome:
    "Selamlar! Bugün seninle toplumsal hayatımızın ve coğrafyamızın çok değerli bir sırrını keşfedeceğiz, çünkü devletimizin adaletle ve düzenle çalışmasını sağlayan üç büyük gücü tanıyacağız. Hiç bir oyunda hem kuralı yazan, hem sahada koşan, hem de hakemlik yapıp düdüğü çalan kişinin aynı insan olduğunu düşündün mü? Böyle bir durumda ortalık tamamen karışırdı ve adalet kaybolurdu. İşte devlet yönetiminde de bu üç mühim görev birbirini denetleyen ayrı organlara verilmiştir. Bugün seninle yasama, yürütme ve yargı organlarını ve bu kuvvetler ayrılığının neden kıymetli olduğunu öğreneceğiz.",
  concept:
    "Devletin üç temel yetki ve görevi vardır: yasama, yürütme ve yargı. Yasama, kanun yapma, değiştirme ve yürürlükten kaldırma yetkisidir; milletimiz adına bu yüce görevi Türkiye Büyük Millet Meclisi yerine getirir. Milletvekilleri halk adına kanun tekliflerini görüşür ve kabul eder. Yürütme, meclisin çıkardığı kanunları uygulama ve ülkeyi yönetme işidir; yürütme görevi Cumhurbaşkanına aittir. Yargı ise toplumdaki anlaşmazlıkları adaletle çözme ve hakları koruma görevidir; bu görev millet adına bağımsız ve tarafsız mahkemelerce yerine getirilir. Şurası aklında kalsın tamam mı: Bu üç organ birbirinin görevini almaz; kanunları Türkiye Büyük Millet Meclisi yapar; Cumhurbaşkanı yürütür; bağımsız mahkemeler ise adaletle denetler.",
  example:
    "Gündelik hayattan bir trafik kuralı örneğini inceleyelim. Önce Türkiye Büyük Millet Meclisi toplanır; halkın can güvenliğini korumak için arabalarda emniyet kemeri takılmasını zorunlu kılan bir kanun çıkarır. İşte bu aşama yasamadır. Ardından emniyet müdürlüğü ve görevliler yollarda bu kanunu titizlikle uygular; bu aşama yürütmedir. Eğer bir sürücü haksız yere ceza yazıldığını düşünürse ya da bir anlaşmazlık çıkarsa konu bağımsız mahkemelere taşınır. Hâkim dosyayı inceler ve kanunlara göre adil kararı verir; işte bu da yargıdır. Hâkim kimseden emir almaz; hukuka bakar. Kanunu yazan, uygulayan ve yargılayan masaların ayrı olması adaletin en büyük garantisidir.",
  hint: "gold",
  warning:
    "Bu üç büyük gücü tek bir elde toplamak kolay bir yanılgıdır. Cumhurbaşkanının kanun yazmadığını, kanun yapma yetkisinin yalnızca Türkiye Büyük Millet Meclisinde olduğunu her zaman hatırla. Mahkemelerin de hiçbir makama bağlı olmadığını, bağımsız çalıştığını güvenle aklında tutabilirsin. Kuvvetler ayrılığı ilkesi, cumhuriyetimizin ve demokrasimizin temel direğidir.",
  life:
    "Bunu televizyonda ya da gazetede bir haber başlığı okurken de hemen ayırt edebilirsin. Haberde Türkiye Büyük Millet Meclisi yeni bir kanunu onayladı deniyorsa yasama organı çalışmıştır. Bir bakanlık yeni bir hizmeti başlattı deniyorsa yürütme organı iş başındadır. Bir mahkeme haksızlığa uğrayan bir vatandaşın hakkını teslim etti deniyorsa yargı organı adalet dağıtmıştır. Haberi okurken hangi organın devrede olduğunu bilmek, seni ülkesinin işleyişini çok iyi kavrayan bilinçli bir genç yapar.",
  recap: [
    "Yasama kanun yapar. Bu organ Türkiye Büyük Millet Meclisidir.",
    "Yürütme kanunları uygular. Başında Cumhurbaşkanı vardır.",
    "Yargı bağımsız mahkemelerdir. Üç organ birbirinin işini almaz.",
  ],
  conceptSeal: "Yasama yazar. Yürütme uygular. Yargı bağımsız karar verir.",
  voiceSeal: "Bir haberde hangi organın işinin geçtiğini tek cümleyle söylersin.",
  outcomes: [
    "Yasama organı Türkiye Büyük Millet Meclisidir.",
    "Yürütmenin başı Cumhurbaşkanıdır.",
    "Yargı bağımsız mahkemelerden oluşur.",
  ],
  scene: "assembly",
  parentNote:
    "Çocuğunuz yasamayı meclis, yürütmeyi cumhurbaşkanının başında olduğu uygulama, yargıyı bağımsız mahkemeler olarak ayırır. Kanun yapma işinin mecliste olduğunu söyler.",

};

export const JUNIOR_SOSYAL_18 = juniorLessonFromScenario(JUNIOR_SOSYAL_18_SCENARIO);
