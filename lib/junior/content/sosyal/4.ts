import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 4. hafta. Hak, sorumluluk ve özgürlük. */
export const JUNIOR_SOSYAL_4_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-4",
  title: "Hak, sorumluluk ve özgürlük",
  teaser:
    "Hak, insanın doğuştan ve kanunla korunan yetkisidir. Sorumluluk, bu hakka eşlik eden görevdir. Özgürlük, başkasının hakkı başladığı yerde sınırlanır. Kavramsal Anlayış, üçünü ayrı kutuya koyar. İfade Gücü, bir davranışta hangisinin işlediğini söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün haritada ve tarihte nasıl bir yolculuk var, çünkü bir arada yaşamanın temel direklerini inceleyeceğiz. Hiç teneffüste oyun oynarken dilediğin gibi koşup bağırmak isterken, yanındaki arkadaşının rahatsız olabileceğini aklından geçirdin mi? İstediğini yapmak ilk bakışta özgürlük gibi görünebilir; ancak yanındaki arkadaşının huzur içinde dinlenme hakkı da oradadır. Bugün seninle hak, sorumluluk ve özgürlük dengesini adım adım kuracağız. Özgürlüğümüz kural tanımazlık değil, başkalarının haklarına saygıyla taçlanan kutsal bir dengedir.",
  concept:
    "Hak, bir insanın doğuştan sahip olduğu veya kanunlarla korunan meşru yetkisidir. Eğitim alma hakkı, fikirlerini özgürce ifade etme hakkı ve güvenli bir çevrede yaşama hakkı bunların başında gelir. Sorumluluk ise kullandığın hakların yanında duran ve yerine getirilmesi gereken görevlerdir. Okula gitmek bir haktır; derslerine özenle çalışmak ise senin sorumluluğundur. Özgürlük ise kendi iradenle seçim yapabilme gücüdür. Şurası aklında kalsın tamam mı: Özgürlüğün bittiği yer, tam olarak başkasının hakkının başladığı sınırdır.",
  example:
    "Sınıfta parmak kaldırıp söz istersin; düşünceni nezaketle ifade etmek senin en doğal hakkındır. Konuşman bitince söz alan arkadaşını sabırla ve dikkatle dinlemek ise sorumluluğundur. İkiniz de bu dengeyi koruduğunuzda özgürlük adalete dönüşür. Parkta salıncağa binmek istersin; önünde sıra bekleyen bir çocuk varsa sıranı beklemek onun oyun hakkını korur. Evde sevdiğin bir müziği dinlemek istersin; ancak sesi sonuna kadar açıp komşunun dinlenme hakkını bölersen özgürlüğün sınırını aşmış olursun. Sesi uygun bir seviyeye getirdiğinde hem hakkını kullanır hem de sorumluluğunu yerine getirirsin. Hak ve sorumluluk birbirini tamamlayan iki kanat gibidir.",
  hint: "gold",
  warning:
    "Özgürlüğü hiçbir kural tanımamak sanmak kolay bir yanılgıdır. Kurallar özgürlükleri yok etmek için değil, herkesin hakkını adaletle korumak için vardır. Nerede bir hak varsa, hemen yanında ona eşlik eden bir sorumluluk da bulunur. Bu ikiliyi birbirinden ayırmadan, dengeli bir adalet duygusuyla hayatına yerleştirebilirsin.",
  life:
    "Bunu alışveriş yaparken de rahatlıkla uygulayabilirsin. Reyondaki ürünleri incelemek hakkındır; kasada başkalarının önüne geçmeden sıranı beklemek ise sorumluluğundur. Toplu taşıma aracında yolculuk ederken oturmak hakkındır; yaşlı veya yorgun bir yolcu bindiğinde yerini tebessümle ona devretmek güzel bir vatandaşlık erdemidir. Hak ile sorumluluk çatışmaz; birbirini kucaklar.",
  recap: [
    "Hak, korunmuş bir yetkidir. Eğitim ve düşünceyi söylemek bu taraftadır.",
    "Sorumluluk, hakkın yanındaki görevdir. İkisi birlikte durur.",
    "Özgürlük, başkasının hakkı başladığı yerde sınırlanır.",
  ],
  conceptSeal: "Hak yetkidir. Sorumluluk görevdir. Özgürlük başkasının hakkıyla sınırlanır.",
  voiceSeal: "Bir davranışta hak, sorumluluk ve sınırı ayrı cümlelerle söylersin.",
  outcomes: [
    "Hak, korunmuş bir yetkidir.",
    "Sorumluluk, hakkın yanında duran görevdir.",
    "Özgürlük, başkasının hakkıyla sınırlanır.",
  ],
  scene: "assembly",
  parentNote:
    "Çocuğunuz hakkı yetki, sorumluluğu görev olarak ayırır. Özgürlüğün, başkasının hakkı başladığı yerde sınırlandığını günlük bir örnekle anlatır.",

};

export const JUNIOR_SOSYAL_4 = juniorLessonFromScenario(JUNIOR_SOSYAL_4_SCENARIO);
