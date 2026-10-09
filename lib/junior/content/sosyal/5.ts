import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 5. hafta. İlk Türk devletleri ve Orta Asya kültürü. */
export const JUNIOR_SOSYAL_5_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-5",
  title: "İlk Türk devletleri ve Orta Asya Türk kültürü",
  teaser:
    "Asya Hun, Göktürk ve Uygur ilk büyük Türk devletlerindendir. Orta Asya kültürü töre, kurultay ve atlı yaşamla örülüdür. Kavramsal Anlayış, konar göçer ile yerleşik hayatı ayırır. İfade Gücü, devletin adını yaşam biçimiyle birlikte söylemektir.",
  welcome:
    "Merhaba! Sosyal Bilgiler dünyasına hoş geldin, çünkü bugün tarihin derin bozkırlarına, at nallarının yankılandığı o kutlu çağlara uzanıyoruz. Hiç bir çadırın hem sıcacık bir yuva hem de her an yola çıkmaya hazır bir yol arkadaşı olduğunu düşündün mü? Orta Asya'da atalarımız at sırtında geniş yaylalarda yaşar, mevsimine göre otlak peşinde konar göçer bir hayat sürerdi. Bugün seninle Asya Hun, Göktürk ve Uygur devletlerini ve bu köklü kültürü yakından tanıyacağız. Devletlerin adları farklı olduğu gibi, benimsedikleri yaşam tarzları da kendine özgüdür.",
  concept:
    "Asya Hun Devleti, büyük hükümdar Mete Han döneminde orduyu onluk teşkilata ayırarak düzenledi; bu onluk, yüzlük ve binlik düzen günümüzde bile orduların temelidir. Göktürk Devleti ise Türk adıyla kurulan ilk devlet olup Orhun Yazıtları ile güzel Türkçemizi ve tarihimizi taşa kazımıştır; bu devlete Köktürk de denir ve ikisi aynı devlettir. Uygurlar ise tarım yapmış, kentler kurmuş, kâğıt ve matbaayı kullanarak yerleşik hayata geçmiştir. Şurası aklında kalsın tamam mı: Hun ve Göktürk devletleri ağırlıklı olarak konar göçer yaşam sürerken, Uygurlar yerleşik hayata geçen ilk Türk devletidir.",
  example:
    "Gözünün önüne bozkırda bir Türk boyu getir. Yazın serin yaylalara çıkar, kışın korunaklı vadilere inerler. Keçe çadırlar toplanır, atlara yüklenir; işte bu konar göçer yaşamdır. Boyların başında kağan bulunur; önemli kararlar ise danışma meclisi olan kurultayda görüşülür. Kurallar ise töre denen yazısız hukukla yürütülür; töre keyfi bir kural değil, adaletin ve ortak yaşamın temelidir. Göktürk kağanı Bilge Kağan ve kardeşi Kül Tigin adına dikilen Orhun Abideleri'nde halka birlik ve dirlik öğütlenir; taşlar konuşur, töre yaşar. Uygur kentlerine baktığında ise tarlalar, evler ve kütüphaneler görürsün. Konar göçerlik de yerleşik hayat da Türk kültürünün zengin parçalarıdır.",
  hint: "trap",
  warning:
    "Tüm ilk Türk topluluklarını yalnızca çadırda yaşayan göçebeler sanmak eksik bir bilgidir. Uygurların şehirler kurup tarım ve ticaretle uğraşan yerleşik bir devlet olduğunu her zaman hatırla. Göktürk ile Köktürk adlarının iki farklı devleti değil, aynı şanlı devleti anlattığını da güvenle aklında tutabilirsin. Orhun Yazıtları da sıradan bir taş değil, atalarımızın bizlere bıraktığı ilk yazılı Türkçe belgelerdir.",
  life:
    "Bunu ailenle doğada kamp yaparken de hissedebilirsin. Çadır kurup doğada geçirdiğin bir gün, konar göçer hayatın küçük bir canlandırmasıdır; eşyalar toplanır ve yer değiştirilir. Evindeki düzenli odan ve mutfağın ise yerleşik hayatın örneğidir. İkisi de birer yaşam biçimidir; tarihteki atalarımız da coğrafyaya ve zamana göre bu iki yaşam tarzını başarıyla uygulamıştır.",
  recap: [
    "Asya Hun, Göktürk ve Uygur ilk büyük Türk devletlerindendir.",
    "Töre, kurultay ve onlu teşkilat Orta Asya düzeninin parçasıdır.",
    "Hun ve Göktürk konar göçerdir; Uygur yerleşiktir.",
  ],
  conceptSeal: "İlk Türk devletleri boy, töre ve kağanla düzenlenir. Yaşam biçimi devletten devlete değişir.",
  voiceSeal: "Devletin adını ve onun konar göçer mi yerleşik mi olduğunu ayrı söylersin.",
  outcomes: [
    "Asya Hun, Göktürk ve Uygur ilk Türk devletlerindendir.",
    "Töre ve kurultay, topluluğun ortak düzenidir.",
    "Uygurlar yerleşik hayata geçmiştir.",
  ],
  scene: "history",
  parentNote:
    "Çocuğunuz Asya Hun, Göktürk ve Uygur adlarını yaşam biçimiyle birlikte anlatır. Göktürk ile Köktürk aynı devlettir. Uygurlar yerleşik hayata geçmiştir.",

};

export const JUNIOR_SOSYAL_5 = juniorLessonFromScenario(JUNIOR_SOSYAL_5_SCENARIO);
