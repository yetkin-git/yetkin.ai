import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 6. hafta. İslamiyet'in doğuşu ve yayılışı. */
export const JUNIOR_SOSYAL_6_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-6",
  title: "İslamiyet'in doğuşu ve yayılışı",
  teaser:
    "İslamiyet 610 yılında Mekke'de doğdu. 622 hicreti Medine'ye yapıldı ve Hicri takvim buradan başlar. Kavramsal Anlayış, doğuş ile yayılışı ayırır. İfade Gücü, hicretin hem göç hem takvim başlangıcı olduğunu söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç bir takvimin büyük bir göç ve yolculukla başladığını duymuş muydun? İslamiyet'in tarihinde böyle çok önemli bir dönüm noktası vardır. Bugün seninle bu inancın nerede ve ne zaman doğduğunu, ardından hangi aşamalarla yayıldığını adım adım inceleyeceğiz. Doğuş yeri ile yayılış rotasını birbirinden ayırıp tarihin seyrini birlikte keşfedeceğiz.",
  concept:
    "İslamiyet, 610 yılında Mekke'de Hz. Muhammed'e gelen ilk vahiy ile başladı. 622 yılında ise Müslümanlar Mekke'den Medine'ye göç etti; bu kutlu yolculuğa Hicret denir. Hicret yalnızca bir yer değiştirme değil, aynı zamanda Hicri takvimin başlangıç yılıdır. Dört halife döneminde adaletli bir yönetim kuruldu ve İslamiyet Arap Yarımadası'nın sınırlarını aşarak genişledi. Emeviler ve Abbasiler döneminde ise bilim, sanat, ticaret ve kültür yeni kıtalara doğru ulaştı. Şurası aklında kalsın tamam mı: İslamiyet'in doğuşu Mekke'dedir; takvim başlangıcı olan Hicret ise Medine yolculuğudur.",
  example:
    "Tarihi iki kutlu şehir üzerinden takip edelim. Önce Mekke; ilk çağrı ve vahiy bu şehirde başlar. Sonra Medine; 622 yılındaki hicretle buraya varılır ve dayanışma içinde yeni bir toplum düzeni kurulur. Müslümanlar bu tarihi yeni bir takvimin birinci yılı olarak kabul eder. Ardından adalet ve barış mesajı çevre ülkelere doğru yayılır. Halife, peygamberden sonra toplumun idari işlerini yürüten yöneticidir; Dört Halife Dönemi bu yürüyüşün ilk büyük evresidir. Abbasiler döneminde ise kütüphaneler, çeviri evleri ve tıp merkezleri kurularak dünya bilimine büyük katkılar sunulur. Yayılış tek bir günde değil, asırlar süren medeniyet adımlarıyla gerçekleşmiştir.",
  hint: "gold",
  warning:
    "Hicreti yalnızca sıradan bir taşınma sanmak eksik bir bakış açısıdır; o kutlu göç, İslam toplumunun kuruluşunun ve takviminin başlangıç noktasıdır. Doğuş yılı ile hicret yılını karıştırmamaya dikkat et; 610 yılı doğuştur, 622 yılı ise hicrettir. Mekke ile Medine şehirlerini de aynı yer gibi düşünmemeyi her zaman hatırla.",
  life:
    "Bunu yeni bir eğitim ve öğretim yılına başlarken de düşünebilirsin. Okulun açıldığı ilk gün takviminde yeni bir başlangıçtır; o günden önceki yaz tatili ise hazırlık dönemidir. Hicri takvim de böylesi derin bir başlangıç olayına bağlanmıştır. Bir olayı arkadaşına anlatırken önce nerede başladığını, sonra nasıl bir yol izlediğini sırasıyla söylersen bilgin çok daha akılda kalıcı olur.",
  recap: [
    "İslamiyet 610 yılında Mekke'de doğdu.",
    "622 hicreti Medine'ye yapıldı. Hicri takvim bu yıldan başlar.",
    "Dört halife, Emevi ve Abbasi dönemlerinde yayılış genişledi.",
  ],
  conceptSeal: "Doğuş Mekke'de 610'dur. Hicret Medine'ye 622'dir ve takvimin başlangıcıdır.",
  voiceSeal: "Doğuş yerini, hicret yılını ve yayılışın yönünü ayrı cümlelerle söylersin.",
  outcomes: [
    "İslamiyet 610 yılında Mekke'de doğmuştur.",
    "622 hicreti Hicri takvimin başlangıcıdır.",
    "Yayılış dört halife döneminden sonra da sürmüştür.",
  ],
  scene: "history",
  parentNote:
    "Çocuğunuz İslamiyet'in 610'da Mekke'de doğduğunu, 622 hicretinin hem göç hem takvim başlangıcı olduğunu anlatır. Mekke ile Medine ayrı tutulur.",

};

export const JUNIOR_SOSYAL_6 = juniorLessonFromScenario(JUNIOR_SOSYAL_6_SCENARIO);
