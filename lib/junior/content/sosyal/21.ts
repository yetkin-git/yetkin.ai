import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler. Toplumsal sorunu müzakere. SB.6.1.3. Pilot ders. */
export const JUNIOR_SOSYAL_21_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-21",
  title: "Toplumsal sorunu müzakere",
  teaser:
    "Toplumsal sorun, birden fazla kişiyi aynı anda zorlayan ortak iştir. Müzakere, tarafların birbirini dinleyip ortak karar aramasıdır. Kavramsal Anlayış, dayatmayı müzakereden ayırır. İfade Gücü, tartışırken sorunu adlandırmaktır.",
  welcome:
    "Merhaba sevgili çocuklar! Okul bahçesinde top sırası yüzünden iki grup karşı karşıya geldi mi? Biri daha uzun oynamak ister, diğeri sıranın kendisine geldiğini söyler. Bu, tek kişinin özel derdi değildir. Müzakerenin adımlarını bir toplantı masasında kuracağız.",
  concept:
    "Toplumsal sorun, sınıfı, bahçeyi ya da oyunu birlikte kullananları etkiler. Müzakere, tarafların birbirini kesmeden dinleyip ortak bir karar aramasıdır. Tartışma bu masanın içindedir: söz, kişiye değil soruna gider. Dayatmak ise karşı tarafı dinlemeden kendi kuralını tek doğru ilan etmektir. Pratik kural: Önce sorunu adlandır, sonra dinle, sonra seçenek söyle, en sonda ortak kararda buluş.",
  example:
    "Okul bahçesinde top sırası kalabalıklaşınca sınıf meclisi masaya oturur. İlk iş sorunu adlandırmaktır: herkes aynı anda oynayamıyor. Sonra her grup sırayla dinlenir. Tartışırken «sen bencilsin» denmez; «süre yetmiyor» denir. Ardından iki seçenek gelir: onar dakika dönüşüm ya da iki ayrı kale. Ortak karar yazılır ve iki grup da kabul eder. Bu dizi müzakeredir.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Müzakereyi sesi en yüksek olanın kazanması sanmak tuzaktır. Karşı tarafı dinlemeden karar yazmak tartışma değil dayatmadır. Kişiyi küçük düşüren söz, sorunu çözmez. Toplumsal sorunu müzakere ederken kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu evde akşam oyun saati çakışınca da görebilirsin. Kardeşinle masaya oturup sırayı konuşursunuz. Arkadaşınla sınıf nöbetini tartışırken de aynı sıra işler: önce dinle, sonra seçenek söyle, en sonda birlikte karar ver. Müzakere, kazananı aşağılayan bir yarış değildir.",
  recap: [
    "Toplumsal sorun, birden fazla kişiyi etkileyen ortak iştir.",
    "Müzakere, dinleyerek ortak karar aramaktır.",
    "Tartışırken söz kişiye değil soruna gider.",
  ],
  conceptSeal: "Müzakere, dinleyerek ortak karar aramaktır. Dayatma bunun tersidir.",
  voiceSeal: "Bir sorunu adlandırır, tartışırken sözü kişiye değil işe yöneltirsin.",
  outcomes: [
    "Toplumsal sorun birden fazla kişiyi etkiler.",
    "Müzakerede taraflar sırayla dinlenir.",
    "Ortak karar, dayatmanın yerine geçer.",
  ],
  scene: "assembly",
  parentNote:
    "Çocuğunuz toplumsal sorunu tek kişinin derdinden ayırır. Müzakerede dinleme, seçenek söyleme ve ortak karar adımlarını bir bahçe tartışması üzerinden kurması beklenir.",
};

export const JUNIOR_SOSYAL_21 = juniorLessonFromScenario(JUNIOR_SOSYAL_21_SCENARIO);
