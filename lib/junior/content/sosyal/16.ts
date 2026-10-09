import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 16. hafta. Demokrasinin gelişimi ve yönetim biçimleri. */
export const JUNIOR_SOSYAL_16_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-16",
  title: "Demokrasinin gelişimi ve yönetim biçimleri",
  teaser:
    "Demokrasi, halkın yönetime katılmasıdır. Cumhuriyette yönetim, seçilen kişilere emanet edilir. Monarşide yönetim bir kişidedir ve seçimle gelmez. Kavramsal Anlayış, katılımı yalnız sandık günü sanmaktan ayırır. İfade Gücü, yönetim biçimini kimin karar verdiğiyle söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç sınıfında gideceğiniz bir gezi yerini veya sınıf başkanını belirlemek için oylama yaptığınız oldu mu? Herkes kendi fikrini söyledi, parmaklar kalktı ve çoğunluğun tercihiyle karar verildi; ancak farklı düşünen arkadaşlarının söz hakkı da saygıyla korundu. İşte bu okul sahnesi, demokrasinin sınıftaki küçük ve tatlı bir yansımasıdır. Bugün seninle tarihten günümüze demokrasinin gelişimini, cumhuriyetin erdemini ve farklı yönetim biçimlerini adım adım öğreneceğiz.",
  concept:
    "Demokrasi, egemenliğin millete ait olduğu ve halkın kendi kendini yönettiği en adil yönetim biçimidir. Bütün vatandaşların seçme, seçilme ve düşüncelerini özgürce ifade etme hakkı anayasal güvence altındadır. Cumhuriyet yönetiminde devlet idaresi, halkın hür iradesiyle seçtiği milletvekillerine ve yöneticilere belirli bir süre için emanet edilir. Şanlı milletimiz, Gazi Mustafa Kemal Atatürk önderliğinde 29 Ekim 1923'te cumhuriyeti ilan ederek egemenliği kayıtsız şartsız millete vermiştir. Monarşide ise yönetim tek bir hükümdarın elindedir ve bu yetki babadan oğula miras kalır; seçim ve halk iradesi yoktur. Şurası aklında kalsın tamam mı: Demokrasi yalnızca sandık başına gidip oy vermekten ibaret değildir; fikrini saygıyla söylemek, farklı düşünceleri dinlemek ve haklara saygı duymak da demokrasinin kalbidir.",
  example:
    "Sınıf başkanlığı seçimini hayal edelim. Aday olmak isteyen her arkadaşın kürsüye çıkıp hedeflerini anlatır; bu seçilme hakkıdır. Sen de en güvendiğin arkadaşına oy verirsin; bu seçme hakkıdır. Seçilen başkan belirli bir dönem boyunca sınıfa hizmet eder; görev süresi bittiğinde yeniden seçim yapılır. İşte cumhuriyet düşüncesi de tam olarak bu emanet bilincine dayanır; ülke yönetimi hiç kimsenin şahsi mülkü değildir, millete ait bir emanettir. Masallardaki kralların yönettiği monarşide ise halk oy kullanamaz ve yöneticisini değiştiremez. Günlük hayatımızda bir okul kulübünde fikir belirtmek ya da mahalle meclisinde öneri sunmak da aktif bir katılımdır. Bağırmak ya da başkasını susturmak değil, saygıyla düşünce üretmek demokrasidir.",
  hint: "gold",
  warning:
    "Demokrasiyi yalnızca birkaç yılda bir yapılan seçimlerden ibaret sanmak eksik bir düşüncedir. Hak aramak, düşüncelerini saygı çerçevesinde dile getirmek ve ortak kurallara uymak da demokrasinin ayrılmaz birer parçasıdır. Cumhuriyet ile monarşi yönetimlerini birbirine karıştırmamaya özen göster. Cumhuriyette yöneticilerin millet tarafından seçildiğini ve bu görevin geçici bir emanet olduğunu güvenle aklında tutabilirsin.",
  life:
    "Bunu sokakta veya okul bahçesinde arkadaşlarınla oyun kurarken de yaşarsın. Hangi oyunun oynanacağına hep birlikte konuşup karar verirsiniz. Oylama sonucunda senin önerdiğin oyun seçilmese bile kurallara uyup neşeyle oyuna katılırsın. Bu olgunluk, çoğunluğun kararına saygı duyarken azınlığın da hakkını koruyan gerçek bir demokratik bilinçtir. Demokrasi, birlikte ve barış içinde yaşamayı öğreten en büyük okuldur.",
  recap: [
    "Demokrasi, halkın yönetime katılmasıdır. Seçmek ve söz söylemek bu katılımın parçasıdır.",
    "Cumhuriyette yönetim seçilen kişilere süreyle emanet edilir. Türkiye 29 Ekim 1923'te cumhuriyet oldu.",
    "Monarşide yönetim bir kişidedir ve seçimle gelmez. Demokrasi yalnız sandık günü değildir.",
  ],
  conceptSeal: "Demokrasi katılmaktır. Cumhuriyet, seçilen yönetimin adıdır.",
  voiceSeal: "Bir yönetimde kararı kimin verdiğini ve sürenin olup olmadığını söylersin.",
  outcomes: [
    "Demokrasi, halkın yönetime katıldığı düzendir.",
    "Cumhuriyette yönetim seçimle ve süreyle emanet edilir.",
    "Monarşide yönetim seçimle gelmez.",
  ],
  scene: "assembly",
  parentNote:
    "Çocuğunuz demokrasiyi halkın katılımı, cumhuriyeti seçilen ve süreyle sınırlı yönetim, monarşiyi seçimle gelmeyen kişisel yönetim olarak ayırır. 29 Ekim 1923'ü cumhuriyetin tarihi olarak söyler.",

};

export const JUNIOR_SOSYAL_16 = juniorLessonFromScenario(JUNIOR_SOSYAL_16_SCENARIO);
