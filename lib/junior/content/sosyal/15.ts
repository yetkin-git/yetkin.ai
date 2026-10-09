import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 15. hafta. Nitelikli insan gücü ve meslek seçimi. */
export const JUNIOR_SOSYAL_15_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-15",
  title: "Nitelikli insan gücü ve meslek seçimi",
  teaser:
    "Nitelikli insan, işini öğrenmiş ve özenle yapan kişidir. Meslek seçiminde ilgi, yetenek ve öğrenme birlikte durur. Kavramsal Anlayış, tek mesleği ülkenin bütünü sanmaktan ayırır. İfade Gücü, bir mesleğin topluma hangi işi yaptığını söylemektir.",
  welcome:
    "Merhaba! Sosyal Bilgiler dünyasına hoş geldin, çünkü bugün hayallerini gerçeğe dönüştürecek ve geleceğini aydınlatacak harika bir konuyu konuşacağız. Hiç büyüyünce ne olacaksın sorusuyla karşılaştığında, aklından geçen mesleğin bir gününü ve o işin topluma kattığı faydayı merak ettin mi? Meslek, gösterişli bir unvandan ibaret değildir; bir işi severek, öğrenerek ve hakkını vererek yapmaktır. Bugün seninle nitelikli insan gücünün ne olduğunu, ilgi ve yeteneklerimize göre doğru meslek seçimini nasıl yapabileceğimizi öğreneceğiz.",
  concept:
    "Nitelikli insan gücü, alanında iyi eğitim almış, bilgi ve becerisini işine katarak verimli çalışan, yeniliklere açık ve vatanına değer katan insanlardır. Yalnızca bir diplomaya sahip olmak insanı tam anlamıyla nitelikli yapmaz; işini büyük bir sevgi, ahlak ve özenle yürütmek de şarttır. Gelecekte bir meslek seçerken üç temel soru birbiriyle buluşmalıdır. Birincisi, neyi merak ediyor ve neye ilgi duyuyorsun? İkincisi, hangi alanlarda doğal yetenek ve becerin var? Üçüncüsü, vatanının ve toplumun hangi alanlarda nitelikli insanlara ihtiyacı var? Şurası aklında kalsın tamam mı: Her meşru meslek son derece kıymetlidir; çiftçi, doktor, mühendis, öğretmen, fırıncı ve tamirci aynı toplumun birbirini tamamlayan vazgeçilmez parçalarıdır.",
  example:
    "Sofrana gelen sıcacık bir ekmeği düşünelim. Çiftçi buğdayı toprağa eker, sular ve hasat eder; bu tarım emeğidir. Değirmenci o buğdayı un haline getirir. Fırıncı unu yoğurur, mayalar ve fırında pişirir. Şoför ise sabahın erken saatinde o taze ekmekleri bakkallara ve marketlere ulaştırır. Dört farklı meslek, tek bir ekmek diliminde buluşur. Bu mesleklerden biri aksarsa soframız eksik kalır. Hastanede de doktor bakar, hemşire tedavi uygular, laborant tahlilleri yapar, görevli ise odayı temiz tutar. Hepsi nitelikli insan gücünün bir parçasıdır. Sen resim yapmayı seviyorsan bu bir ilgidir; boyaları ve çizgileri kolayca birleştiriyorsan bu bir yetenektir. İlgine yeteneğin ve eğitimin eşlik ettiğinde harika bir mimar olabilirsin. Sevdiğin işi özenle yapmak toplumu yüceltir.",
  hint: "trap",
  warning:
    "Yalnızca bazı meslekleri üstün ve değerli görüp diğer meslekleri küçümsemek çok yanıltıcı bir tuzaktır. Unvanın büyüklüğü insanı büyütmez; işini hakkıyla ve dürüstçe yapmak insanı yüceltir. Kendi ilgi ve becerilerini bir kenara bırakıp yalnızca başkalarının yönlendirmesiyle meslek seçmemeye özen göster. Sevdiğin ve yeteneğine uygun olan meslekte hem çok mutlu olursun hem de milletine en yüksek faydayı sağlarsın.",
  life:
    "Bunu bu hafta kendin için hazırlayacağın küçük bir meslek rehberiyle keşfedebilirsin. Bir kâğıda en çok merak ettiğin konuları, yapmaktan keyif aldığın işleri ve etrafında gördüğün meslekleri yazabilirsin. Bir fırıncı ustasını, bir hemşireyi veya bir mühendisi iş başında gözlemlemek ve onlara mesleklerinin güzel yanlarını sormak harika bir adımdır. Kendi geleceğini tanımak, bugünden atacağın meraklı adımlarla başlar.",
  recap: [
    "Nitelikli insan, işini öğrenmiş ve özenle yapandır.",
    "Meslek seçiminde ilgi, yetenek ve toplumun ihtiyacı birlikte durur.",
    "Her meslek bir iş görür. Biri diğerinin yerine geçmez.",
  ],
  conceptSeal: "Nitelik öğrenmek ve özen göstermektir. Meslek, toplumun bir işidir.",
  voiceSeal: "Bir mesleğin kime hangi işi yaptığını tek cümleyle söylersin.",
  outcomes: [
    "Nitelikli insan gücü, bilgi ve beceriyle iş üretir.",
    "Meslek seçiminde ilgi ve yetenek birlikte düşünülür.",
    "Farklı meslekler aynı toplumun ayrı işleridir.",
  ],
  scene: "assembly",
  parentNote:
    "Çocuğunuz nitelikli insanı unvanla değil, öğrenme ve özenle tanımlar. Meslek seçiminde ilgi, yetenek ve toplumun ihtiyacını yan yana koyar.",

};

export const JUNIOR_SOSYAL_15 = juniorLessonFromScenario(JUNIOR_SOSYAL_15_SCENARIO);
