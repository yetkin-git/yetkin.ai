import "server-only";

import { JUNIOR_ELECTIVE_COURSES, type JuniorElectiveCourse } from "@/lib/junior/elective-catalog";
import { JUNIOR_FREE_LESSON_KEY, JUNIOR_PILOT_GRADE, JUNIOR_PILOT_SLUGS } from "@/lib/junior/limits";
import {
  JUNIOR_ELECTIVE_CATEGORY,
  JUNIOR_ELECTIVE_TAG,
  JUNIOR_MAARIF_SKILL_TAGS,
  JUNIOR_PERSONAL_CURRICULUM_TAG,
  JUNIOR_VECTOR_STEP_COUNT,
  type JuniorCourseShelf,
  type JuniorLessonCard,
  type JuniorLessonScript,
} from "@/lib/junior/types";
import { juniorThisWeekLessonIndex } from "@/lib/junior/week";

export { JUNIOR_ELECTIVE_CATEGORY, JUNIOR_MAARIF_SKILL_TAGS };

export type { JuniorElectiveCourse, JuniorLessonScript };

export type JuniorPilotCourse = {
  slug: (typeof JUNIOR_PILOT_SLUGS)[number];
  code: string;
  title: string;
  subject: string;
  grade: typeof JUNIOR_PILOT_GRADE;
  track: "core";
  lessons: readonly JuniorLessonScript[];
};

export type JuniorCatalogCourse = JuniorPilotCourse | JuniorElectiveCourse;

export { JUNIOR_ELECTIVE_COURSES };

export const JUNIOR_PILOT_COURSES = [
  {
    slug: "jr_06_mat",
    code: "JR-06-MAT",
    title: "6. Sınıf Matematik",
    subject: "Matematik",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: [
      {
        key: "jr_06_mat-1",
        title: "Bir bütünü eşit parçaya bölmek",
        teaser:
          "Kesir, bir bütünün eşit parçasıdır. Pay üstte, payda altta durur. Kavramsal Anlayış, eşit parçayı söyler. İfade Gücü, payı ve paydayı kendi sözlerinizle kurmanızdır.",
        listenText:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde bir bütünü eşit parçaya bölmeyi öğreneceğiz. Önümüzde bir bütün duruyor. Henüz bölünmedi. Kesir, bu bütünün eşit parçalarından birini veya birkaçını gösteren sayıdır. Parçaların boyu aynı olmalıdır. Parçalar eşit değilse bu sayı kesir olmaz. Hadi şimdi ekrandaki çizime birlikte bakalım! Elmayı dört eşit parçaya bölün. Bir parçayı alın. Aldığınız parça sayısı paydır. Pay üstte yazılır. Bütünün kaç eşit parçaya bölündüğü paydadır. Payda altta yazılır. Bu kesirde pay bir, payda dört olur. Adı dörtte birdir. Okurken önce paydayı söylersiniz. Sonra payı söylersiniz. Birde dört demezsiniz. Payı bir olan kesre birim kesir denir. Dörtte bir, birim kesirdir. Hatırlarsanız, pay seçilen parçayı söylüyordu. Pay, paydadan küçükse seçilen parça bütünden küçüktür. Pay ile payda eşit olursa parçalar bütünü doldurur. Dört bölü dört, bir bütündür. Burası çok önemli çocuklar, sakın unutmayın! Eşit olmayan dilimi kesir saymayın. Pay ile paydanın yerini değiştirmeyin. Okunuşta payı öne almayın. Dörtte bir ile birde dört aynı kesir değildir. Şimdi soruyu birlikte çözelim. Bir elma dört eşit dilime ayrıldı. Bir dilim yenildi. Kesri yazın. Önce dilimleri sayın. Dört eşit dilim vardır. Payda dörttür. Sonra yenilen dilimi sayın. Bir dilim vardır. Pay birdir. Payı üste yazın. Paydayı alta yazın. Sonuç dörtte birdir. Sevgili çocuklar, buna Kavramsal Anlayış deriz. Kesir, bütünün eşit parçasıdır. Anlatışınıza İfade Gücü deriz. Payı üste ve paydayı alta nasıl yazdığınızı adım adım söylersiniz. Aferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        outcomes: [
          "Kesir, bir bütünün eşit parçasıdır.",
          "Pay üstteki sayıdır.",
          "Payda alttaki sayıdır.",
          "Payda, bütünün kaç eşit parçaya bölündüğünü söyler.",
        ],
        scene: "fraction",
        mebNote:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde kesri birlikte kuruyoruz. Kesir, bir bütünün eşit parçalarından birini veya birkaçını gösteren sayıdır. Parçalar aynı boyda olmalıdır. Pay, seçilen parça sayısıdır. Pay üstte yazılır. Payda, bütünün kaç eşit parçaya bölündüğünü söyler. Payda altta yazılır. Kesir okunurken önce payda, sonra pay söylenir. Dörtte bir, payı bir ve paydası dört olan kesirdir. Payı bir olan kesre birim kesir denir. Pay, paydadan küçükse parça bütünden küçüktür. Pay ile payda eşitse parçalar bütünü tamamlar. Dört bölü dört, bir bütündür. Parçalar eşit değilse bu sayı kesir olmaz.\n\nHatırlarsanız, pay seçilen parçaydı. Hadi şimdi ekrandaki çizime birlikte bakalım! Bir elma dört eşit dilime ayrıldı. Bir dilim yenildi. Dilim sayısı dörttür. Payda dört olur. Yenilen dilim birdir. Pay bir olur. Pay üste, payda alta yazılır. Sonuç bir bölü dört, yani dörtte birdir.\n\nBurası çok önemli çocuklar, sakın unutmayın! Eşit olmayan dilim kesir sayılmaz. Pay ile payda yer değiştirirse kesir değişir. Okunuşta pay öne alınmaz. Dörtte bir, birde dört diye okunmaz. Bütün sorulursa pay ile payda eşit yazılır.\n\nSevgili çocuklar, buna Kavramsal Anlayış deriz. Eşit parça, kesrin kendisidir. Anlatışınıza İfade Gücü deriz. Seçtiğiniz dilimi ve bütünü nasıl saydığınızı söylersiniz.\n\nAferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        lifeUse:
          "Sevgili çocuklar, bunu mutfakta da kullanırsınız. Bir elmayı dört kişiye eşit bölerseniz her pay dörtte birdir. Pizzayı eşit dilime ayırmak aynı kuraldır. Yarım ekmek, payı bir ve paydası iki olan kesirdir. Hatırlarsanız, parçaların boyu aynı olmalıydı. Dilimler aynı boyda değilse paylaşım kesir olmaz. Markette çeyrek peynir isterseniz dörtte bir istersiniz. Tarifte bir su bardağının dörtte biri, bardağın dört eşit payından biridir. Üç dilim yenmiş pizza sorulursa önce eşit dilim sayısını, sonra kalan dilimi sayarsınız. Burası çok önemli çocuklar, sakın unutmayın! Dilimler eşit değilse bu paylaşım kesir sayılmaz.",
      },
      {
        key: "jr_06_mat-2",
        title: "Payda aynıyken toplama",
        teaser:
          "Paydalar aynıysa paylar toplanır. Payda yerinde kalır. Kavramsal Anlayış, dilimin boyunun değişmediğini söyler. İfade Gücü, paydayı neden yerinde bıraktığınızı anlatmanızdır.",
        listenText:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde paydası aynı olan kesirleri toplayacağız. İki kesrin paydası aynıysa paylar toplanır. Payda değişmez. Hadi şimdi ekrandaki çizime birlikte bakalım! Dörtte bir ile dörtte ikiyi toplayın. Paylar bir ve ikidir. Bir artı iki, üç eder. Payda dört olarak kalır. Sonuç dörtte üçtür. Payda, dilimin boyunu söyler. Pay, kaç dilim aldığınızı söyler. Dilimin boyu aynı kaldığı için payda toplanmaz. Hatırlarsanız, payda parçanın boyuydu. Çıkarmada da kural aynıdır. Paydalar aynıysa paylar çıkarılır. Payda yerinde kalır. Dörtte üçten dörtte biri çıkarırsanız dörtte iki kalır. Paydalar farklıysa bu kural tek başına yetmez. Önce paydalar eşitlenir. Sonra paylar toplanır. Şimdi soruyu birlikte çözelim. Dörtte bir pasta ile dörtte iki pasta aynı tepside. Toplamı nedir? Paydalar dörttür. Eşittir. Payları toplayın. Bir artı iki, üç. Payda dört kalır. Sonuç dörtte üçtür. Kontrol edin. Payda hâlâ dört mü? Evet. Burası çok önemli çocuklar, sakın unutmayın! Yazılıda en sık hata paydaları da toplamaktır. Bir bölü dört artı iki bölü dört, üç bölü sekiz yazılmaz. Üç bölü sekiz başka bir kesirdir. Payda dört kalır. Sonuç dörtte üçtür. Sevgili çocuklar, buna Kavramsal Anlayış deriz. Payda, dilimin boyudur. Anlatışınıza İfade Gücü deriz. Paydayı neden yerinde bıraktığınızı söylersiniz. Aferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        outcomes: ["Aynı paydada paylar toplanır.", "Payda toplama sırasında değişmez."],
        scene: "fraction-sum",
        mebNote:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde aynı paydayla toplama var. Paydaları eşit olan kesirlerde paylar toplanır. Payda aynen yazılır. Payda, parçanın boyunu söyler. Pay, parça sayısını söyler. Boy değişmediği için payda toplanmaz. Çıkarmada da payda kalır. Paylar çıkarılır. Paydalar farklıysa önce eşitlenir. Eşitlemeden toplama yapılmaz.\n\nHatırlarsanız, payda parçanın boyuydu. Hadi şimdi ekrandaki çizime birlikte bakalım! Bir bölü dört artı iki bölü dört. Paydalar dörttür. Paylar bir ve ikidir. Bir artı iki, üç eder. Payda dört kalır. Sonuç üç bölü dört, yani dörtte üçtür. Kontrol edin. Payda işlemden sonra da dörttür.\n\nBurası çok önemli çocuklar, sakın unutmayın! Paydaları toplamak yanlıştır. Üç bölü sekiz bu toplama ait değildir. Paydası farklı iki kesri doğrudan toplamayın. Önce paydayı eşitleyin. Sonucu yazınca paydayı bir kez daha okuyun.\n\nSevgili çocuklar, buna Kavramsal Anlayış deriz. Dilimin boyu değişmez. Anlatışınıza İfade Gücü deriz. Payları toplayıp paydayı yerinde bıraktığınızı anlatırsınız.\n\nAferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        lifeUse:
          "Sevgili çocuklar, aynı boyuttaki dilimlerden iki tane yerseniz dilimin boyu değişmez. Saydığınız dilim artar. Aynı bardak ölçeğiyle bir ölçek ve iki ölçek su koyarsanız üç ölçek olur. Bardağın boyu değişmez. Hatırlarsanız, payda boyu söylüyordu. Farklı boydaki kapları önce aynı ölçüye getirirsiniz. Sonra eklersiniz. Burası çok önemli çocuklar, sakın unutmayın! Yarım bardak ile çeyrek bardağı doğrudan toplamazsınız.",
      },
    ],
  },
  {
    slug: "jr_06_fen",
    code: "JR-06-FEN",
    title: "6. Sınıf Fen Bilimleri",
    subject: "Fen Bilimleri",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: [
      {
        key: "jr_06_fen-1",
        title: "İtmek ve çekmek kuvvettir",
        teaser:
          "Kuvvet, bir cismi iten veya çeken etkidir. Yönü vardır. Kavramsal Anlayış, itme ile çekmenin yönünü ayırır. İfade Gücü, oku neden o tarafa çizdiğinizi söylemenizdir.",
        listenText:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde itmeyi ve çekmeyi kuvvet olarak göreceğiz. Kapıyı itersiniz. Çekmeceyi çekersiniz. İkisi de kuvvettir. Kuvvet, bir cismi iten veya çeken etkidir. Kuvvetin büyüklüğü vardır. Büyük itme ile küçük itme aynı etkiyi vermez. Büyüklük dinamometre ile ölçülür. Birimi newton'dur. Kuvvetin yönü vardır. Ok, bu yönü gösterir. Okun durduğu çizgiye doğrultu denir. O çizgideki tarafa yön denir. İtmek bir yöndür. Çekmek ters yöndür. Kuvvet görünmez. Etkisi görünür. Hadi şimdi ekrandaki çizime birlikte bakalım! Duran bir cisim, yeterli kuvvetle harekete geçebilir. Hareketli bir cisim, ters yönde kuvvetle yavaşlayabilir. Kuvvet cismin yönünü değiştirebilir. Kuvvet cismin şeklini de değiştirebilir. Süngeri sıkıştırmak şekil değiştirmektir. Hatırlarsanız, ok yönü taşıyordu. Şimdi soruyu birlikte çözelim. Kapı kapalı ve duruyor. Kapıyı sağa doğru ittiniz. Kuvvetin yönü sağadır. Ok sağa bakar. Çekmeceyi kendinize çekerseniz ok size doğrudur. İtme ile çekme ters yönlüdür. İkisi de kuvvettir. Burası çok önemli çocuklar, sakın unutmayın! Yazılıda yalnız itme yazmak eksik kalır. Çekme de kuvvettir. Yön yazılmazsa cevap eksik kalır. Ok süs değildir. Ok, yönü taşır. Kuvveti gözle göremezsiniz. Gördüğünüz şey, cismin hareketidir. Sevgili çocuklar, buna Kavramsal Anlayış deriz. Kuvvet, itme veya çekmedir. Yönü vardır. Anlatışınıza İfade Gücü deriz. Oku neden o tarafa çizdiğinizi söylersiniz. Aferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        outcomes: [
          "Kuvvet, bir cismi iten veya çeken etkidir.",
          "Kuvvetin yönü vardır.",
          "Durmakta olan bir cisim, kuvvet uygulanınca hareket edebilir.",
        ],
        scene: "force",
        mebNote:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde kuvveti tanıyoruz. Kuvvet, bir cismi iten veya çeken etkidir. Kuvvetin büyüklüğü vardır. Büyüklük dinamometre ile ölçülür. Birimi newton'dur. Kuvvetin doğrultusu ve yönü vardır. Doğrultu, okun durduğu çizgidir. Yön, o çizgideki taraftır. Ok, yönü gösterir. Kuvvet görünmez. Etkisi görünür. Kuvvet cismi hareket ettirebilir. Kuvvet cismi durdurabilir. Kuvvet cismin yönünü değiştirebilir. Kuvvet cismin şeklini değiştirebilir. Duran cisim, yeterli kuvvet uygulanınca hareket edebilir.\n\nHatırlarsanız, itmek ile çekmek ters yöndü. Hadi şimdi ekrandaki çizime birlikte bakalım! Kapı duruyor. Kapıyı sağa ittiniz. Kuvvet itmedir. Yön sağadır. Ok sağa çizilir. Çekmeceyi kendinize çekerseniz kuvvet çekmedir. Ok size doğru çizilir. İki ok ters yönlüdür. İkisi de kuvvettir.\n\nBurası çok önemli çocuklar, sakın unutmayın! Yalnız itme yazılırsa cevap eksik kalır. Çekme de kuvvettir. Yön belirtilmezse kuvvet tam anlatılmaz. Okun ucu, kuvvetin baktığı tarafı gösterir. Kuvvetin kendisi resimde görünmez. Görünen, ok ve cismin hareketidir.\n\nSevgili çocuklar, buna Kavramsal Anlayış deriz. İtme ile çekme ters yöndür. Anlatışınıza İfade Gücü deriz. Okun baktığı tarafı kendi sözlerinizle anlatırsınız.\n\nAferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        lifeUse:
          "Sevgili çocuklar, kapıyı itersiniz. Çekmeceyi çekersiniz. İkisi de kuvvettir. İtmek bir yöndür. Çekmek ters yöndür. Ağır kutuyu az kuvvetle kıpırdatamazsınız. Daha büyük kuvvet gerekir. Süngeri avucunuzda sıkarsanız şekli değişir. Bu da kuvvetin etkisidir. Hatırlarsanız, ok yönü gösteriyordu. Oyun alanında topu sağa atarsınız. Ok, topun gittiği tarafı gösterir. Burası çok önemli çocuklar, sakın unutmayın! Yönü yazmazsanız kuvvet tam anlatılmaz.",
      },
      {
        key: "jr_06_fen-2",
        title: "Sürtünme",
        teaser:
          "Sürtünme, hareketi zorlaştıran bir kuvvettir. Kavramsal Anlayış, ters yönü söyler. İfade Gücü, sürtünme okunu neden ters çizdiğinizi anlatmanızdır.",
        listenText:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde sürtünmeyi tanıyacağız. Pürüzlü yerde kaymak zordur. Bu zorluğa sürtünme deriz. Sürtünme de bir kuvvettir. Temas eden yüzeyler arasında oluşur. Yönü, hareketin tersidir. Cisim sağa gidiyorsa sürtünme sola bakar. Pürüz artınca sürtünme artar. Yüzey düzgünleşince sürtünme azalır. Azalmak, sıfır olmak demek değildir. Buzda sürtünme vardır. Küçüktür. Bu yüzden kaymak kolaylaşır. Aynı yerde cisim ağırlaşırsa sürtünme artar. Sürtünme işe yarar. Yürürken ayak yer tutar. Fren, tekeri yavaşlatır. Sürtünme istenmeyebilir. Makine parçası sürtününce aşınır. Azaltmak için yüzey yağlanır veya düzlenir. Artırmak için yüzey pürüzlendirilir. Hadi şimdi ekrandaki çizime birlikte bakalım! Şimdi soruyu birlikte çözelim. Ayakkabı buzda kayıyor. Sürtünme azdır. Taban pürüzlü olursa sürtünme artar. Tutuş artar. Okun biri hareket yönünü gösterir. Diğer ok ters yöne, sürtünmeye bakar. Hatırlarsanız, sürtünme de bir kuvvettir. Burası çok önemli çocuklar, sakın unutmayın! Yazılıda üç tuzak vardır. Buzda sürtünme yoktur demeyin. Azdır. Sürtünme hareketle aynı yöne bakmaz. Ters yöne bakar. Sürtünme kuvvet değildir demeyin. Sürtünme bir kuvvettir. Sevgili çocuklar, buna Kavramsal Anlayış deriz. Sürtünme, hareketi zorlaştırır. Yönü terstir. Anlatışınıza İfade Gücü deriz. Ters oku neden çizdiğinizi anlatırsınız. Aferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        outcomes: ["Sürtünme bir kuvvettir.", "Sürtünme hareketi zorlaştırır."],
        scene: "friction",
        mebNote:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde sürtünmenin yönünü çizeceğiz. Sürtünme, temas eden yüzeyler arasında hareketi zorlaştıran kuvvettir. Yönü, hareketin tersinedir. Yüzey pürüzlüyse sürtünme artar. Yüzey düzgünse sürtünme azalır. Azalan sürtünme sıfır sayılmaz. Aynı yüzeyde cisim ağırlaşırsa sürtünme artar. Sürtünme yürümeyi ve freni sağlar. Fazla sürtünme parçayı aşındırabilir. Yağ ve düz yüzey sürtünmeyi azaltır. Pürüz, sürtünmeyi artırır.\n\nHatırlarsanız, yön harekete tersti. Hadi şimdi ekrandaki çizime birlikte bakalım! Cisim sağa gidiyor. Hareket oku sağa bakar. Sürtünme oku sola bakar. Yer pürüzlüyse ters ok uzundur. Yer buz gibiyse ters ok kısadır. Kısa ok, sürtünmenin yok olduğu anlamına gelmez. Pürüzlü ayakkabı tabanı tutuşu artırır.\n\nBurası çok önemli çocuklar, sakın unutmayın! Buzda sürtünme yoktur cümlesi yanlıştır. Sürtünme azdır. Sürtünmeyi hareketle aynı yöne çizmeyin. Sürtünme kuvvettir. Yönü harekete terstir. Pürüz artınca sürtünme azalır demeyin. Pürüz artırır.\n\nSevgili çocuklar, buna Kavramsal Anlayış deriz. Sürtünme bir kuvvettir. Anlatışınıza İfade Gücü deriz. Hareket oku ile sürtünme okunu nasıl ayırdığınızı anlatırsınız.\n\nAferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        lifeUse:
          "Sevgili çocuklar, buzda yürümek zordur çünkü sürtünme azdır. Ayakkabının pürüzlü tabanı yer tutuşunu artırır. Kapı menteşesi gıcırdıyorsa sürtünme fazladır. Bir damla yağ gıcırtıyı azaltır. Hatırlarsanız, sürtünme hareketi zorlaştırıyordu. Bisikletin freni tekeri sürterek yavaşlatır. Fren pabucu aşınırsa sürtünme işini görmez. Halı üzerinde kutuyu itmek, fayans üzerinde itmekten daha zordur. Burası çok önemli çocuklar, sakın unutmayın! Buzda sürtünme vardır. Küçüktür.",
      },
    ],
  },
  {
    slug: "jr_06_turkce",
    code: "JR-06-TUR",
    title: "6. Sınıf Türkçe",
    subject: "Türkçe",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: [
      {
        key: "jr_06_turkce-1",
        title: "Metnin ana fikri",
        teaser:
          "Ana fikir, yazarın okura asıl söylemek istediğidir. Kavramsal Anlayış, konu ile yargıyı ayırır. İfade Gücü, yargıyı nasıl seçtiğinizi tek cümleyle anlatmanızdır.",
        listenText:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde metnin ana fikrini bulacağız. Bir metni okudunuz. Yazar sizden tek bir şeyi hatırlamanızı ister. Buna ana fikir deriz. Ana fikir, yazarın asıl söylemek istediği düşüncedir. Çoğu kez tek cümleyle söylenir. Metnin konusu başkadır. Konu, metnin ne hakkında olduğudur. Ana fikir, yazarın bu konu hakkındaki yargısıdır. Metindeki örnek, sayı ve olay ayrıntıdır. Ayrıntı ana fikri destekler. Ayrıntı, ana fikrin kendisi değildir. Başlık ipucu verebilir. Başlık her zaman ana fikir cümlesi değildir. Ana fikri bulmak için şunu sorun. Yazar benden neyi anlamamı istiyor? Hadi şimdi ekrandaki çizime birlikte bakalım! Şimdi kısa metni birlikte çözelim. Parktaki ağaçlar yazın gölge verir. Kuşlar bu ağaçlara yuva yapar. Ağaçlar canlılara hem yuva olur hem de insanı sıcaktan korur. Konu ağaçtır. Gölge cümlesi ayrıntıdır. Yuva cümlesi ayrıntıdır. Son cümle yazarın yargısıdır. Ana fikir şudur. Ağaçlar canlılara yarar sağlar. Hatırlarsanız, ayrıntı ana fikri destekliyordu. Burası çok önemli çocuklar, sakın unutmayın! Yazılıda örneği ana fikir sanmayın. Sayıyı ana fikir sanmayın. Konuyu ana fikir diye yazmayın. Ağaçlar kelimesi konudur. Yarar sağlar yargısı ana fikirdir. Ana fikir tek cümledir. İki ayrı yargı yazarsanız cevap dağılır. Sevgili çocuklar, buna Kavramsal Anlayış deriz. Ana fikir, yazarın yargısıdır. Konu değildir. Anlatışınıza İfade Gücü deriz. Yargıyı nasıl seçtiğinizi tek cümleyle anlatırsınız. Aferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        outcomes: [
          "Ana fikir, yazarın okura asıl söylemek istediğidir.",
          "Ana fikir çoğu kez tek cümleyle söylenir.",
          "Ayrıntı ana fikri destekler. Ayrıntı ana fikir değildir.",
        ],
        scene: "main-idea",
        mebNote:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde ana fikri tek cümlede arıyoruz. Ana fikir, yazarın metinde okura asıl söylemek istediği düşüncedir. Çoğu kez tek cümleyle yazılır. Konu, metnin ne hakkında olduğudur. Ana fikir, konu hakkındaki yargıdır. Örnek, sayı ve olay ayrıntıdır. Ayrıntı ana fikri destekler. Ayrıntı ana fikir değildir. Başlık ipucu verebilir. Başlık, ana fikrin kendisi olmayabilir. Sorulacak cümle şudur. Yazar neyin anlaşılmasını istiyor?\n\nHatırlarsanız, konu ile yargı ayrıydı. Hadi şimdi ekrandaki çizime birlikte bakalım! Parktaki ağaçlar yazın gölge verir. Kuşlar bu ağaçlara yuva yapar. Ağaçlar canlılara hem yuva olur hem de insanı sıcaktan korur. Konu ağaçtır. Gölge ve yuva ayrıntıdır. Ana fikir şudur. Ağaçlar canlılara yarar sağlar.\n\nBurası çok önemli çocuklar, sakın unutmayın! Örnek cümleyi ana fikir diye işaretlemeyin. Sayı ve olay ana fikir değildir. Konu adını ana fikir sanmayın. Ağaçlar konu olur. Yarar sağlar yargısı ana fikir olur. Cevap tek cümledir. İki yargıyı birden ana fikir yapmayın.\n\nSevgili çocuklar, buna Kavramsal Anlayış deriz. Konu ile yargı ayrıdır. Anlatışınıza İfade Gücü deriz. Asıl cümleyi nasıl bulduğunuzu anlatırsınız.\n\nAferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        lifeUse:
          "Sevgili çocuklar, bir haberin başlığı yazarın asıl söylemek istediğini kısa söyler. İçerideki örnekler o başlığı taşır. Sınavda ana fikir sorusu tek cümle ister. Arkadaşınız uzun bir olay anlatınca siz tek cümleyle özetlersiniz. O cümle, konuşmanın ana fikridir. Hatırlarsanız, ayrıntı ana fikrin kendisi değildi. Tarih ve yer adı ayrıntıdır. Ayrıntı, asıl yargının yerine geçmez. Günlükte bugün parkta yürüdüm cümlesi olaydır. Yazarın asıl dediği cümle ana fikirdir. Konu park olabilir. Yargı, yazarın park hakkında dediğidir. Burası çok önemli çocuklar, sakın unutmayın! Konu adını ana fikir diye yazmayın.",
      },
      {
        key: "jr_06_turkce-2",
        title: "Yardımcı fikir",
        teaser:
          "Yardımcı fikir, ana fikri taşıyan küçük cümledir. Kavramsal Anlayış, taşıyan cümle ile asıl yargıyı ayırır. İfade Gücü, hangi cümlenin yardımcı olduğunu söylemenizdir.",
        listenText:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde yardımcı fikri tanıyacağız. Ana fikir tek başına durmaz. Onu taşıyan küçük cümleler vardır. Bunlara yardımcı fikir deriz. Yardımcı fikir, ana fikrin bir parçasını açıklar. Ana fikrin yerine geçmez. Metinde birden fazla yardımcı fikir olabilir. Hepsi aynı ana fikre bağlanır. Örnek, sebep ve küçük yargı yardımcı fikir olabilir. Yeni bir ana fikir açmaz. Hatırlarsanız, ana fikir yazarın asıl yargısıydı. Hadi şimdi ekrandaki çizime birlikte bakalım! Şimdi aynı metne birlikte bakalım. Ana fikir şudur. Ağaçlar canlılara yarar sağlar. Yazın gölge verir cümlesi birinci yardımcı fikirdir. Kuşlara yuva olur cümlesi ikinci yardımcı fikirdir. İkisi de yarar yargısını taşır. İkisi de ana fikrin yerine geçmez. Soruyu birlikte çözelim. Hangi cümle yardımcı fikirdir? Gölge cümlesi yardımcı fikirdir. Yuva cümlesi yardımcı fikirdir. Son yargı ana fikirdir. Burası çok önemli çocuklar, sakın unutmayın! Yazılıda yardımcı cümleyi ikinci ana fikir sanmayın. Metnin tek ana fikri vardır. Yardımcı fikirler ona bağlanır. Bir yardımcı fikri silerseniz metin zayıflar. Ana fikir yine durur. Ana fikri silerseniz yardımcı cümleler dağılır. Taşıdıkları yargı kalmaz. Sevgili çocuklar, buna Kavramsal Anlayış deriz. Yardımcı fikir, ana fikri taşır. Yerine geçmez. Anlatışınıza İfade Gücü deriz. Hangi cümlenin taşıdığını söylersiniz. Aferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        outcomes: ["Yardımcı fikir ana fikri taşır.", "Yardımcı fikir ana fikrin yerine geçmez."],
        scene: "support-idea",
        mebNote:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde ana fikri taşıyan küçük cümleleri ayırıyoruz. Yardımcı fikir, ana fikri açıklayan küçük düşüncedir. Ana fikrin bir parçasını taşır. Ana fikrin yerine geçmez. Bir metinde birden fazla yardımcı fikir olabilir. Hepsi aynı ana fikre bağlanır. Örnek ve sebep, yardımcı fikir olarak durabilir. Yeni bir ana fikir açmaz. Ana fikir silinirse yardımcı cümleler dağılır. Yardımcı cümle silinirse ana fikir durur. Metin zayıflar.\n\nHatırlarsanız, ana fikir tek cümleydi. Hadi şimdi ekrandaki çizime birlikte bakalım! Ana fikir şudur. Ağaçlar canlılara yarar sağlar. Birinci yardımcı fikir şudur. Ağaç yazın gölge verir. İkinci yardımcı fikir şudur. Kuşlar ağaca yuva yapar. İki cümle de yarar yargısını taşır. İkisi de ana fikir değildir.\n\nBurası çok önemli çocuklar, sakın unutmayın! Yardımcı cümleyi ikinci ana fikir sanmayın. Metinde ana fikir tektir. Gölge örneğini ana fikir diye işaretlemeyin. Soruda hangi cümle ana fikri destekler denirse yardımcı fikri seçin. Hangisi asıl yargıdır denirse ana fikri seçin.\n\nSevgili çocuklar, buna Kavramsal Anlayış deriz. Taşıyan cümle ile asıl yargı ayrıdır. Anlatışınıza İfade Gücü deriz. Yardımcı cümleyi nasıl tanıdığınızı anlatırsınız.\n\nAferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        lifeUse:
          "Sevgili çocuklar, konuşmanızda asıl cümle bir tanedir. Onu açan kısa cümleler yardımcı fikirdir. Bugün erken çıktım çünkü servis kaçıyordu cümlesinde asıl iş erken çıkmaktır. Servis kaçıyordu, bu işin sebebidir. Sebep, asıl cümlenin yerine geçmez. Hatırlarsanız, yardımcı fikir yerine geçmiyordu. Ödevinizi anlatırken önce sonucu söylersiniz. Sonra iki kısa gerekçe eklersiniz. Gerekçeler yardımcı fikirdir. Burası çok önemli çocuklar, sakın unutmayın! Gerekçeyi asıl cümlenin yerine koymayın.",
      },
    ],
  },
  {
    slug: "jr_06_ing_main",
    code: "JR-06-ING-ANA",
    title: "6. Sınıf Ana İngilizce",
    subject: "İngilizce",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: [
      {
        key: "jr_06_ing_main-1",
        title: "I'm, is, are ile cümle",
        teaser:
          "Özne, I'm, is veya are kalıbını seçer. Kavramsal Anlayış, hangi öznenin hangi kalıbı istediğini söyler. İfade Gücü, o seçimi kendi cümlenizle kurmanızdır.",
        listenText:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde I'm, is ve are ile cümle kuracağız. Bu üç kalıp, okul kitabınızda böyle durur. I ile I'm gelir. I'm a student, ben bir öğrenciyim demektir. He, she ve it ile is gelir. She is a teacher, o bir öğretmendir. He is my friend, o benim arkadaşımdır. You, we ve they ile are gelir. They are friends, onlar arkadaştır. We are students, biz öğrenciyiz. You are kind, sen naziksin. Hadi şimdi ekrandaki çizime birlikte bakalım! Solda I'm a student duruyor. Ortada She is a teacher duruyor. Sağda They are friends duruyor. Her kutuda özne önce, kalıp sonra gelir. Hatırlarsanız, özne kalıbı seçiyordu. Burası çok önemli çocuklar, sakın unutmayın! Kendiniz için I am yazmayın. Okulda I'm a student yazılır. They is yazılmaz. They are students yazılır. He are yazılmaz. He is my friend yazılır. Şimdi soruyu birlikte çözelim. Özne I. Kalıp hangisidir? I ile I'm gelir. Cümle I'm a student olur. Özne They. They ile are gelir. Cümle They are friends olur. Sevgili çocuklar, buna Kavramsal Anlayış deriz. Özne, I'm, is veya are kalıbını seçer. Anlatışınıza İfade Gücü deriz. Hangi öznenin hangi kalıbı istediğini kendi sözlerinizle söylersiniz. Aferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        outcomes: [
          "I ile I'm gelir.",
          "He, she ve it ile is gelir.",
          "You, we ve they ile are gelir.",
        ],
        scene: "elective",
        steps: [
          "Cümle konusu açıldı. Henüz kalıp seçilmedi.",
          "I ile I'm kullanılır. I'm a student, ben bir öğrenciyim demektir.",
          "He, she ve it ile is kullanılır. She is a teacher.",
          "You, we ve they ile are kullanılır. They are friends.",
          "Cümle özne ile başlar. Kalıp ardından gelir.",
          "Örnek: I'm a student. He is my friend. We are students.",
          "Soru: I ile hangi kalıp gelir?",
          "Çözüm: I'm a student dersiniz.",
          "Tuzak: I am yazmayın. I'm yazın. They is yazılmaz.",
        ],
        mebNote:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde I'm, is ve are seçimini yapıyoruz. I ile I'm gelir. He, she ve it ile is gelir. You, we ve they ile are gelir. Özne önce yazılır. Kalıp ardından gelir. I'm a student, ben bir öğrenciyim. She is a teacher, o bir öğretmendir. He is my friend, o benim arkadaşımdır. They are friends, onlar arkadaştır. We are students, biz öğrenciyiz.\n\nHatırlarsanız, özne kalıbı seçiyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Üç kutu duruyor. Birinci kutu I'm a student. İkinci kutu She is a teacher. Üçüncü kutu They are friends.\n\nBurası çok önemli çocuklar, sakın unutmayın! Kendiniz için I am yazmayın. Okulda I'm a student yazılır. They is yazılmaz. He are yazılmaz. You am yazılmaz. Kalıp, özneye göre değişir.\n\nSevgili çocuklar, buna Kavramsal Anlayış deriz. Özne kalıbı seçer. Anlatışınıza İfade Gücü deriz. Kendi cümlenizde özneyi ve kalıbı nasıl eşlediğinizi söylersiniz.\n\nAferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        lifeUse:
          "Sevgili çocuklar, kendinizi tanıtırken I'm a student ile başlarsınız. Arkadaşınızı anlatırken She is a teacher veya He is my friend dersiniz. Sınıfı anlatırken They are friends dersiniz. Birlikteyken We are students dersiniz. Karşınızdakine You are kind dersiniz. Hatırlarsanız, özne kalıbı seçiyordu. Aile fotoğrafında kendinizi gösterirken I'm, bir kişiyi gösterirken is, birden fazla kişiyi gösterirken are gelir. Burası çok önemli çocuklar, sakın unutmayın! Kendiniz için I am yazmayın. I'm yazın. Kalabalık için is yazmayın.",
      },
      {
        key: "jr_06_ing_main-2",
        title: "a ve an",
        teaser:
          "Tekil ismin önüne a veya an gelir. Kavramsal Anlayış, sesli harf ile sessiz harfi ayırır. İfade Gücü, neden a veya an seçtiğinizi söylemenizdir.",
        listenText:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde a ve an sözlerini öğreneceğiz. İkisi de bir tane demektir. Tekil ismin önünde dururlar. a, sessiz harfle başlayan ismin önüne gelir. a book, bir kitaptır. an, sesli harfle başlayan ismin önüne gelir. an apple, bir elmadır. Sesli harfler a, e, i, o, u dur. Hadi şimdi ekrandaki çizime birlikte bakalım! Solda bir kitap var. Önünde a duruyor. Sağda bir elma var. Önünde an duruyor. Hatırlarsanız, tekil isim bir taneydi. Çoğul isimde a ve an durmaz. İki kitap için a books yazılmaz. Books yeter. Burası çok önemli çocuklar, sakın unutmayın! a apple yazılmaz. Elma sesli harfle başlar. an apple yazılır. a book doğrudur. Kitap sessiz harfle başlar. Şimdi soruyu birlikte çözelim. Apple önüne hangisi gelir? Apple, a harfiyle başlar. a sesli harftir. Önüne an gelir. Sonuç an apple olur. Sevgili çocuklar, buna Kavramsal Anlayış deriz. a sessiz harfin, an sesli harfin önüne gelir. Anlatışınıza İfade Gücü deriz. Neden a veya an seçtiğinizi kendi sözlerinizle söylersiniz. Aferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        outcomes: [
          "a, sessiz harfle başlayan tekil ismin önüne gelir.",
          "an, sesli harfle başlayan tekil ismin önüne gelir.",
          "Çoğul isimde a ve an durmaz.",
        ],
        scene: "elective",
        steps: [
          "Tekil isim konusu açıldı.",
          "a, sessiz harfle başlayan tekil ismin önüne gelir.",
          "an, sesli harfle başlayan tekil ismin önüne gelir.",
          "a book, bir kitaptır.",
          "an apple, bir elmadır.",
          "Çoğul isimde a ve an durmaz.",
          "Soru: Apple önüne hangisi gelir?",
          "Çözüm: an apple.",
          "Tuzak: a apple yazılmaz. an apple yazılır.",
        ],
        mebNote:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde a ve an seçimini yapıyoruz. İkisi de bir tane demektir. Tekil ismin önünde dururlar. a, sessiz harfle başlayan ismin önüne gelir. a book bir kitaptır. an, sesli harfle başlayan ismin önüne gelir. an apple bir elmadır. Sesli harfler a, e, i, o, u dur. Çoğul isimde bu iki söz durmaz.\n\nHatırlarsanız, söz ismin ilk harfine bakıyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Kitap sessiz harfle başlar. Önünde a durur. Elma sesli harfle başlar. Önünde an durur.\n\nBurası çok önemli çocuklar, sakın unutmayın! a apple yazılmaz. an book yazılmaz. İki kitap için a books yazılmaz. İlk harfi okuyun. Sonra a veya an seçin.\n\nSevgili çocuklar, buna Kavramsal Anlayış deriz. İlk harf seçimi belirler. Anlatışınıza İfade Gücü deriz. Neden o sözü seçtiğinizi söylersiniz.\n\nAferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
        lifeUse:
          "Sevgili çocuklar, çantadan bir kalem isterken a pen dersiniz. Bir elma isterken an apple dersiniz. Hatırlarsanız, ilk harf sözü seçiyordu. Market listesinde bir yumurta an egg olur. Bir defter a notebook olur. Burası çok önemli çocuklar, sakın unutmayın! Birden fazla eşyada a veya an eklemeyin.",
      },
    ],
  },
] as const satisfies readonly JuniorPilotCourse[];

function juniorCatalogCourses(): readonly JuniorCatalogCourse[] {
  return [...JUNIOR_PILOT_COURSES, ...JUNIOR_ELECTIVE_COURSES];
}

/** Ücretsiz konu listesinin tek evi. Her kartın ilk konusu. Soru arşivi bu listeyi daraltmaz. */
export function juniorFreeLessonKeys(): readonly string[] {
  const keys = juniorCatalogCourses().flatMap((course) => {
    const opener = course.lessons[0];
    return opener ? [opener.key] : [];
  });
  if (!keys.includes(JUNIOR_FREE_LESSON_KEY)) {
    throw new Error("Ücretsiz konu listesi katalogdaki ilk konulardan koptu.");
  }
  return keys;
}

/** Seçmeli Dersler kategorisi. Çekirdek derslerin yanında durur. */
export function juniorElectiveCategory(): {
  title: typeof JUNIOR_ELECTIVE_CATEGORY;
  courses: readonly JuniorElectiveCourse[];
} {
  return {
    title: JUNIOR_ELECTIVE_CATEGORY,
    courses: JUNIOR_ELECTIVE_COURSES,
  };
}

/** Seçmeli ders: dokuz adım, canlı öğretmen üslubu, Kavramsal Anlayış ve İfade Gücü. */
export function juniorElectiveLessonsSharePlayerContract(): boolean {
  return JUNIOR_ELECTIVE_COURSES.every((course) =>
    course.lessons.every(
      (lesson) =>
        lesson.scene === "elective" &&
        lesson.steps?.length === JUNIOR_VECTOR_STEP_COUNT &&
        lesson.listenText.includes("Sevgili çocuklar merhaba!") &&
        lesson.listenText.includes("Kavramsal Anlayış") &&
        lesson.listenText.includes("İfade Gücü") &&
        lesson.listenText.includes("Aferin size!"),
    ),
  );
}

export function juniorCourseBySlug(slug: string): JuniorCatalogCourse | null {
  return juniorCatalogCourses().find((course) => course.slug === slug) ?? null;
}

export function juniorCourseByLessonKey(lessonKey: string): JuniorCatalogCourse | null {
  return juniorCatalogCourses().find((course) => course.lessons.some((lesson) => lesson.key === lessonKey)) ?? null;
}

export function juniorLessonByKey(lessonKey: string): JuniorLessonScript | null {
  for (const course of juniorCatalogCourses()) {
    const lesson = course.lessons.find((row) => row.key === lessonKey);
    if (lesson) {
      return lesson;
    }
  }
  return null;
}

export function juniorLessonAccess(lessonKey: string): "free" | "locked" | "missing" {
  const course = juniorCourseByLessonKey(lessonKey);
  if (!course) {
    return "missing";
  }
  return course.lessons[0]?.key === lessonKey ? "free" : "locked";
}

export type JuniorPlanAccess = {
  active: boolean;
  selectedElectives: readonly string[];
};

/** Yıllık paket açıkken çekirdek derslerin ve seçilen seçmeli derslerin kilidi kalkar. */
export function juniorLessonAccessForPlan(
  lessonKey: string,
  plan: JuniorPlanAccess | null,
): "free" | "locked" | "missing" {
  const base = juniorLessonAccess(lessonKey);
  if (base !== "locked" || !plan?.active) {
    return base;
  }
  const course = juniorCourseByLessonKey(lessonKey);
  if (!course) {
    return "missing";
  }
  if (course.track === "core" || plan.selectedElectives.includes(course.slug)) {
    return "free";
  }
  return "locked";
}

export function stampJuniorPlanAccess(
  shelves: readonly JuniorCourseShelf[],
  plan: JuniorPlanAccess,
): JuniorCourseShelf[] {
  if (!plan.active) {
    return shelves.map((course) => ({ ...course, lessons: course.lessons.map((lesson) => ({ ...lesson })) }));
  }
  const chosen = new Set(plan.selectedElectives);
  return shelves.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => ({
      ...lesson,
      access: course.track === "core" || chosen.has(course.slug) ? "free" : lesson.access,
    })),
  }));
}

export function juniorElectivePicks(): { slug: string; title: string; subject: string }[] {
  return JUNIOR_ELECTIVE_COURSES.map((course) => ({
    slug: course.slug,
    title: course.title,
    subject: course.subject,
  }));
}

function toShelf(course: JuniorCatalogCourse, now: Date): JuniorCourseShelf {
  const weekIndex = juniorThisWeekLessonIndex(course.lessons.length, now);
  const labels =
    course.track === "elective"
      ? [JUNIOR_PERSONAL_CURRICULUM_TAG, JUNIOR_ELECTIVE_TAG, ...JUNIOR_MAARIF_SKILL_TAGS]
      : [...JUNIOR_MAARIF_SKILL_TAGS];
  return {
    slug: course.slug,
    title: course.title,
    subject: course.subject,
    grade: course.grade,
    track: course.track,
    labels,
    lessons: course.lessons.map((lesson, index): JuniorLessonCard => ({
      key: lesson.key,
      title: lesson.title,
      teaser: lesson.teaser,
      access: course.lessons[0]?.key === lesson.key ? "free" : "locked",
      thisWeek: weekIndex === index,
      status: "fresh",
    })),
  };
}

export function juniorCourseShelves(now = new Date()): JuniorCourseShelf[] {
  return juniorCatalogCourses().map((course) => toShelf(course, now));
}

/**
 * Kişiye özel müfredat.
 * Seçim yoksa (null) bütün seçmeli raflar açık kalır.
 * Dizi gelirse çekirdek dersler durur, yalnız seçilen seçmeli dersler yanlarına gelir.
 */
export function juniorPersonalizedShelves(
  chosenElectiveSlugs: readonly string[] | null,
  now = new Date(),
): JuniorCourseShelf[] {
  const shelves = juniorCourseShelves(now);
  if (chosenElectiveSlugs === null) {
    return shelves;
  }
  const chosen = new Set(chosenElectiveSlugs);
  return shelves.filter((course) => course.track === "core" || chosen.has(course.slug));
}

/**
 * Raf her zaman 6. sınıf pilot metnidir.
 * Seçilen sınıf başlığı değiştirmez. Başka sınıfın dersi yazılana kadar kart 6. sınıfta kalır.
 */
export function juniorShelvesForGrade(
  _grade: number,
  chosenElectiveSlugs: readonly string[] | null,
  now = new Date(),
): JuniorCourseShelf[] {
  return juniorPersonalizedShelves(chosenElectiveSlugs, now);
}
